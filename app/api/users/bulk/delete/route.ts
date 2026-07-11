import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body; // Array of user IDs e.g. [2, 3, 4]
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty IDs list" }, { status: 400 });
    }

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    // Filter out current user and super_admin from deletion
    const filteredIds = ids.filter(id => parseInt(id, 10) !== currentUserId);
    if (filteredIds.length === 0) {
      return NextResponse.json({ success: true, message: "No eligible users were deleted (cannot delete self)." });
    }

    const placeHolders = filteredIds.map(() => "?").join(",");
    let deleteQuery = schema === "legacy"
      ? `UPDATE \`users\` SET \`deleted_at\` = CURRENT_TIMESTAMP WHERE \`user_id\` IN (${placeHolders}) AND \`username\` != 'super_admin'`
      : `UPDATE \`users\` SET \`deleted_at\` = CURRENT_TIMESTAMP WHERE \`id\` IN (${placeHolders}) AND \`username\` != 'super_admin'`;

    const [result]: any = await db.query(deleteQuery, filteredIds);

    // Write audit log entries
    for (const id of filteredIds) {
      await logAudit(
        currentUserId,
        "BULK_DELETE_USER",
        "users",
        parseInt(id, 10),
        null,
        { info: "Bulk soft deleted" }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully soft-deleted ${result.affectedRows} users.`
    });
  } catch (err: any) {
    console.error("Bulk delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
