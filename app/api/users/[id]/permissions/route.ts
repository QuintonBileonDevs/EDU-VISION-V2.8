import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    let query = "";
    if (schema === "legacy") {
      query = `
        SELECT DISTINCT p.permission_name
        FROM \`role_permissions\` rp
        JOIN \`permissions\` p ON rp.permission_id = p.permission_id
        JOIN \`users\` u ON u.role_id = rp.role_id
        WHERE u.user_id = ? AND rp.deleted_at IS NULL AND p.deleted_at IS NULL
      `;
    } else {
      query = `
        SELECT DISTINCT p.permission_name
        FROM \`role_permissions\` rp
        JOIN \`permissions\` p ON rp.permission_id = p.permission_id
        JOIN \`users\` u ON u.role = rp.role
        WHERE u.id = ? AND rp.deleted_at IS NULL AND p.deleted_at IS NULL
      `;
    }

    const [rows]: any = await db.query(query, [id]);
    const permissions: Record<string, boolean> = {};
    rows.forEach((row: any) => {
      permissions[row.permission_name] = true;
    });

    // Also include some sensible defaults if there are none, for robustness
    if (rows.length === 0 && id === "1") {
      // Fallback for super_admin user_id = 1
      const defaultSuperPerms = [
        "LOCK_USER", "UNLOCK_USER", "DELETE_USER", "RESTORE_USER",
        "EXPORT_USERS", "IMPORT_USERS", "RESET_PASSWORD",
        "VIEW_USER_DETAILS", "UPDATE_USER", "FORCE_PASSWORD_CHANGE", "VIEW_USER_LIST"
      ];
      defaultSuperPerms.forEach(p => {
        permissions[p] = true;
      });
    }

    return NextResponse.json(permissions);
  } catch (err: any) {
    console.error("GET user permissions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
