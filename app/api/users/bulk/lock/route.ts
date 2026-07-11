import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty IDs list" }, { status: 400 });
    }

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    // Prevent locking self
    const filteredIds = ids.filter(id => parseInt(id, 10) !== currentUserId);
    if (filteredIds.length === 0) {
      return NextResponse.json({ success: true, message: "No eligible users were locked (cannot lock self)." });
    }

    const placeHolders = filteredIds.map(() => "?").join(",");
    let lockQuery = "";
    if (schema === "legacy") {
      lockQuery = `UPDATE \`users\` SET \`is_active\` = 0 WHERE \`user_id\` IN (${placeHolders})`;
    } else {
      lockQuery = `UPDATE \`users\` SET \`status\` = 'Inactive' WHERE \`id\` IN (${placeHolders})`;
    }

    const [result]: any = await db.query(lockQuery, filteredIds);

    for (const id of filteredIds) {
      await logAudit(
        currentUserId,
        "BULK_LOCK_USER",
        "users",
        parseInt(id, 10),
        null,
        { status: "Locked" }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully locked ${result.affectedRows} user accounts.`
    });
  } catch (err: any) {
    console.error("Bulk lock error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
