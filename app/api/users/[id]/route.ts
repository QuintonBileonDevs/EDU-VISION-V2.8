import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    let query = "";
    if (schema === "legacy") {
      query = `
        SELECT u.user_id AS id, u.username, u.email, u.full_name, u.phone_number, 
               r.role_name AS role, r.role_display_name, u.is_active, u.created_at, u.deleted_at
        FROM \`users\` u
        LEFT JOIN \`roles\` r ON u.role_id = r.role_id
        WHERE u.user_id = ?
      `;
    } else {
      query = `
        SELECT id, username, email, full_name, role, status, region, last_login, created_at, deleted_at
        FROM \`users\`
        WHERE id = ?
      `;
    }

    const [rows]: any = await db.query(query, [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (err: any) {
    console.error("GET single user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const body = await req.json();
    const { username, email, full_name, role, status, region, phone_number } = body;

    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    // 1. Get current data for audit log
    let oldQuery = schema === "legacy"
      ? "SELECT * FROM `users` WHERE `user_id` = ?"
      : "SELECT * FROM `users` WHERE `id` = ?";
    const [oldRows]: any = await db.query(oldQuery, [id]);
    if (!oldRows || oldRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const oldData = oldRows[0];

    // 2. Perform updates
    const updates: string[] = [];
    const params: any[] = [];

    if (username !== undefined) {
      updates.push("`username` = ?");
      params.push(username.trim());
    }
    if (email !== undefined) {
      updates.push("`email` = ?");
      params.push(email.trim());
    }
    if (full_name !== undefined) {
      updates.push("`full_name` = ?");
      params.push(full_name.trim());
    }
    if (phone_number !== undefined) {
      updates.push("`phone_number` = ?");
      params.push(phone_number ? phone_number.trim() : null);
    }
    if (role !== undefined) {
      if (schema === "legacy") {
        let roleId = 8; // default school_admin
        const [roleRows]: any = await db.query("SELECT role_id FROM `roles` WHERE `role_name` = ? AND `deleted_at` IS NULL", [role]);
        if (roleRows && roleRows.length > 0) {
          roleId = roleRows[0].role_id;
        }
        updates.push("`role_id` = ?");
        params.push(roleId);
      } else {
        updates.push("`role` = ?");
        params.push(role);
      }
    }
    if (status !== undefined) {
      if (schema === "legacy") {
        updates.push("`is_active` = ?");
        params.push(status === "Active" || status === 1 ? 1 : 0);
      } else {
        updates.push("`status` = ?");
        params.push(status);
      }
    }
    if (region !== undefined) {
      updates.push("`region` = ?");
      params.push(region);
    }

    if (updates.length > 0) {
      let updateQuery = schema === "legacy"
        ? `UPDATE \`users\` SET ${updates.join(", ")}, \`updated_at\` = CURRENT_TIMESTAMP WHERE \`user_id\` = ?`
        : `UPDATE \`users\` SET ${updates.join(", ")} WHERE \`id\` = ?`;
      params.push(id);
      await db.query(updateQuery, params);

      // Log audit
      await logAudit(
        currentUserId,
        "UPDATE_USER",
        "users",
        parseInt(id, 10),
        oldData,
        { ...oldData, ...body }
      );
    }

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (err: any) {
    console.error("PUT single user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    // Prevent self-deletion
    if (parseInt(id, 10) === currentUserId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Get old data
    let oldQuery = schema === "legacy"
      ? "SELECT * FROM `users` WHERE `user_id` = ?"
      : "SELECT * FROM `users` WHERE `id` = ?";
    const [oldRows]: any = await db.query(oldQuery, [id]);
    if (!oldRows || oldRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const oldData = oldRows[0];

    // Prevent deleting default super_admin account for safety
    if (oldData.username === "super_admin") {
      return NextResponse.json({ error: "Action Forbidden: Cannot delete default super_admin account." }, { status: 403 });
    }

    // Soft delete
    let deleteQuery = schema === "legacy"
      ? "UPDATE `users` SET `deleted_at` = CURRENT_TIMESTAMP WHERE `user_id` = ?"
      : "UPDATE `users` SET `deleted_at` = CURRENT_TIMESTAMP WHERE `id` = ?";
    await db.query(deleteQuery, [id]);

    // Log audit
    await logAudit(
      currentUserId,
      "DELETE_USER",
      "users",
      parseInt(id, 10),
      oldData,
      { ...oldData, deleted_at: new Date() }
    );

    return NextResponse.json({ success: true, message: "User soft deleted successfully" });
  } catch (err: any) {
    console.error("DELETE user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
