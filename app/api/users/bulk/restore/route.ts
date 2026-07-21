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
    let query = schema === "legacy"
      ? `UPDATE \`users\` SET \`deleted_at\` = NULL WHERE \`user_id\` IN (${placeHolders})`
      : `UPDATE \`users\` SET \`deleted_at\` = NULL WHERE \`id\` IN (${placeHolders})`;

    const [result]: any = await db.query(query, ids);

    for (const id of ids) {
      await logAudit(
        currentUserId,
        "BULK_RESTORE_USER",
        "users",
        parseInt(id, 10),
        null,
        { status: "Restored" }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${result.affectedRows} soft-deleted user accounts.`
    });
  } catch (err: any) {
    console.error("Bulk restore error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
