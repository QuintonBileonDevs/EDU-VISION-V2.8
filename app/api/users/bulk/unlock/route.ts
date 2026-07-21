export const dynamic = "force-dynamic";
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

    const placeHolders = ids.map(() => "?").join(",");
    let unlockQuery = "";
    if (schema === "legacy") {
      unlockQuery = `UPDATE \`users\` SET \`is_active\` = 1 WHERE \`user_id\` IN (${placeHolders})`;
    } else {
      unlockQuery = `UPDATE \`users\` SET \`status\` = 'Active' WHERE \`id\` IN (${placeHolders})`;
    }

    const [result]: any = await db.query(unlockQuery, ids);

    for (const id of ids) {
      await logAudit(
        currentUserId,
        "BULK_UNLOCK_USER",
        "users",
        parseInt(id, 10),
        null,
        { status: "Active" }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully reactivated ${result.affectedRows} user accounts.`
    });
  } catch (err: any) {
    console.error("Bulk unlock error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
