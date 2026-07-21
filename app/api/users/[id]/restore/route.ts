export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    let query = schema === "legacy"
      ? "UPDATE `users` SET `deleted_at` = NULL WHERE `user_id` = ?"
      : "UPDATE `users` SET `deleted_at` = NULL WHERE `id` = ?";
    await db.query(query, [id]);

    await logAudit(
      currentUserId,
      "RESTORE_USER",
      "users",
      parseInt(id, 10),
      null,
      { status: "Restored" }
    );

    return NextResponse.json({ success: true, message: "User account restored successfully" });
  } catch (err: any) {
    console.error("Restore user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
