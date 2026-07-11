import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids } = body;
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    let query = "";
    let params: any[] = [];

    if (schema === "legacy") {
      query = `
        SELECT u.user_id AS id, u.username, u.email, u.full_name, u.phone_number,
               r.role_name AS role, r.role_display_name, IF(u.is_active = 1, 'Active', 'Inactive') AS status,
               'All' AS region, DATE_FORMAT(u.last_login_at, '%Y-%m-%d %H:%i:%s') as last_login
        FROM \`users\` u
        LEFT JOIN \`roles\` r ON u.role_id = r.role_id
      `;
      if (Array.isArray(ids) && ids.length > 0) {
        query += ` WHERE u.user_id IN (${ids.map(() => "?").join(",")})`;
        params = ids;
      }
    } else {
      query = `
        SELECT id, username, email, full_name, role, status, region, last_login
        FROM \`users\`
      `;
      if (Array.isArray(ids) && ids.length > 0) {
        query += ` WHERE id IN (${ids.map(() => "?").join(",")})`;
        params = ids;
      }
    }

    const [rows]: any = await db.query(query, params);

    await logAudit(
      currentUserId,
      "EXPORT_USERS",
      "users",
      0,
      null,
      { count: rows.length }
    );

    return NextResponse.json({ success: true, users: rows });
  } catch (err: any) {
    console.error("Export users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
