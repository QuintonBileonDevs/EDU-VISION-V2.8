export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();
    const body = await req.json();
    const { message, estimated_time, whitelist, username, user_id, ip } = body;

    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipAddress = ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

    await db.query("START TRANSACTION");

    try {
      if (message !== undefined) {
        await db.query("UPDATE system_config SET config_value = ? WHERE config_key = 'MAINTENANCE_MESSAGE'", [message]);
      }
      if (estimated_time !== undefined) {
        await db.query("UPDATE system_config SET config_value = ? WHERE config_key = 'MAINTENANCE_ESTIMATED_MINS'", [String(estimated_time)]);
      }
      if (whitelist !== undefined) {
        await db.query("UPDATE system_config SET config_value = ? WHERE config_key = 'MAINTENANCE_WHITELIST'", [whitelist]);
      }

      // Update current history record if active
      await db.query(`
        UPDATE maintenance_history 
        SET message_used = COALESCE(?, message_used),
            estimated_time_minutes = COALESCE(?, estimated_time_minutes),
            whitelist_used = COALESCE(?, whitelist_used)
        WHERE action IN ('ENABLED', 'STARTED') AND ended_at IS NULL
      `, [message, estimated_time, whitelist]);

      // Log the update
      await db.query(`
        INSERT INTO audit_log (
          user_id, 
          username,
          action, 
          table_name, 
          new_data, 
          ip_address, 
          user_agent,
          resource_type,
          details,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        user_id || 1,
        username || 'super_admin',
        'MAINTENANCE_SETTINGS_UPDATED',
        'system_config',
        JSON.stringify({ message, estimated_time, whitelist }),
        ipAddress,
        userAgent,
        'SYSTEM',
        'Updated active maintenance configuration settings'
      ]);

      await db.query("COMMIT");
    } catch (txErr) {
      await db.query("ROLLBACK");
      throw txErr;
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully" });

  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
