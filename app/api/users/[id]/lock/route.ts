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

    // Prevent locking self
    if (parseInt(id, 10) === currentUserId) {
      return NextResponse.json({ error: "Cannot lock your own account" }, { status: 400 });
    }

    let query = "";
    if (schema === "legacy") {
      query = "UPDATE `users` SET `is_active` = 0 WHERE `user_id` = ?";
    } else {
      query = "UPDATE `users` SET `status` = 'Inactive' WHERE `id` = ?";
    }
    await db.query(query, [id]);

    await logAudit(
      currentUserId,
      "LOCK_USER",
      "users",
      parseInt(id, 10),
      null,
      { status: "Locked" }
    );

    return NextResponse.json({ success: true, message: "User account suspended successfully" });
  } catch (err: any) {
    console.error("Lock user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
