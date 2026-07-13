import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const [rows]: any = await db.query(
      "SELECT config_id, config_key, config_value, config_group, description, is_editable FROM system_config ORDER BY config_group, config_key"
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Error fetching system configuration:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const { config_key, config_value, performed_by } = await req.json();

    if (!config_key) {
      return NextResponse.json({ success: false, error: "config_key is required" }, { status: 400 });
    }

    // Update config value
    await db.query(
      "UPDATE system_config SET config_value = ?, updated_at = NOW() WHERE config_key = ?",
      [config_value, config_key]
    );

    // Log to audit log
    try {
      const payload = JSON.stringify({
        username: performed_by || "system",
        notes: `Updated config '${config_key}' to '${config_value}'.`
      });
      await db.query(
        `INSERT INTO audit_log (action, user_id, table_name, new_data, ip_address, user_agent, created_at) 
         VALUES (?, 1, ?, ?, ?, ?, NOW())`,
        [
          "CONFIG_UPDATED",
          "system_config",
          payload,
          req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1",
          req.headers.get("user-agent") || "System",
        ]
      );
    } catch (e) {
      // Ignore audit logging failures
    }

    return NextResponse.json({
      success: true,
      message: `Configuration ${config_key} updated successfully`,
    });
  } catch (error: any) {
    console.error("Error updating system configuration:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
