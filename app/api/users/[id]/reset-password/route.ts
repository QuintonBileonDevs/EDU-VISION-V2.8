export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema, sha256 } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const password = body.password || "password123";
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    const hashed = sha256(password);

    let query = schema === "legacy"
      ? "UPDATE `users` SET `password_hash` = ? WHERE `user_id` = ?"
      : "UPDATE `users` SET `password_hash` = ? WHERE `id` = ?";
    await db.query(query, [hashed, id]);

    await logAudit(
      currentUserId,
      "RESET_PASSWORD",
      "users",
      parseInt(id, 10),
      null,
      { info: "Password reset completed" }
    );

    return NextResponse.json({ success: true, message: `Password reset successfully to: ${password}` });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
