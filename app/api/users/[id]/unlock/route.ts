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

    let query = "";
    if (schema === "legacy") {
      query = "UPDATE `users` SET `is_active` = 1 WHERE `user_id` = ?";
    } else {
      query = "UPDATE `users` SET `status` = 'Active' WHERE `id` = ?";
    }
    await db.query(query, [id]);

    await logAudit(
      currentUserId,
      "UNLOCK_USER",
      "users",
      parseInt(id, 10),
      null,
      { status: "Active" }
    );

    return NextResponse.json({ success: true, message: "User account reactivated successfully" });
  } catch (err: any) {
    console.error("Unlock user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
