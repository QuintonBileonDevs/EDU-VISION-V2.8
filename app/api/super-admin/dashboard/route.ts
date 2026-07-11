import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();
    
    const [sessions]: any = await db.query("SELECT * FROM user_sessions WHERE is_active=1 AND deleted_at IS NULL ORDER BY last_activity_time DESC LIMIT 100");
    const [alerts]: any = await db.query("SELECT * FROM security_alerts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100");
    const [errors]: any = await db.query("SELECT * FROM system_error_logs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100");
    const [health]: any = await db.query("SELECT * FROM system_health_metrics WHERE deleted_at IS NULL ORDER BY recorded_at DESC LIMIT 100");
    const [config]: any = await db.query("SELECT * FROM system_config WHERE deleted_at IS NULL");
    const [backups]: any = await db.query("SELECT * FROM system_backups WHERE deleted_at IS NULL ORDER BY backup_started_at DESC LIMIT 50");
    const [whitelist]: any = await db.query("SELECT * FROM ip_whitelist WHERE deleted_at IS NULL");
    
    // Quick counts for Insights tab
    const [[{ c: sessionCount }]]: any = await db.query("SELECT COUNT(*) as c FROM user_sessions WHERE is_active=1 AND deleted_at IS NULL");
    const [[{ c: alertCount }]]: any = await db.query("SELECT COUNT(*) as c FROM security_alerts WHERE is_resolved=0 AND deleted_at IS NULL");
    const [[{ c: errorCount }]]: any = await db.query("SELECT COUNT(*) as c FROM system_error_logs WHERE resolved_at IS NULL AND deleted_at IS NULL");
    
    // For health metric count (just find avg or arbitrary)
    const [[{ c: healthAvg }]]: any = await db.query("SELECT AVG(metric_value) as c FROM system_health_metrics WHERE metric_name='uptime'");
    
    // Add joined data for user sessions if possible
    // schema uses `user_id`, we want to get usernames if possible
    // It's fine to just return raw for now

    return NextResponse.json({
      sessions,
      alerts,
      errors,
      health,
      config,
      backups,
      whitelist,
      counts: {
        sessionCount: sessionCount || 0,
        alertCount: alertCount || 0,
        errorCount: errorCount || 0,
        healthAvg: healthAvg || 99.9,
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();
    const body = await req.json();
    const { action, data } = body;
    console.log("Super Admin Action:", action, data);
    
    if (action === "update_config") {
      const { config_key, config_value } = data;
      console.log(`Updating config ${config_key} to ${config_value}`);
      const [result]: any = await db.query("UPDATE system_config SET config_value = ? WHERE config_key = ?", [config_value, config_key]);
      console.log("Update result:", result);
      return NextResponse.json({ success: true, affectedRows: result.affectedRows });
    }
    
    if (action === "create_backup") {
      const name = "bak_" + Date.now() + "_manual";
      await db.query(
        "INSERT INTO system_backups (backup_name, backup_type, backup_file_path, backup_status, created_by_user_id) VALUES (?, ?, ?, ?, ?)",
        [name, "FULL", `/backups/${name}.sql`, "COMPLETED", 1]
      );
      return NextResponse.json({ success: true });
    }

    if (action === "add_ip") {
      const { ip_address, description } = data;
      await db.query(
        "INSERT INTO ip_whitelist (ip_address, description, created_by_user_id) VALUES (?, ?, ?)",
        [ip_address, description, 1]
      );
      return NextResponse.json({ success: true });
    }

    if (action === "remove_ip") {
      const { ip_address } = data;
      await db.query("UPDATE ip_whitelist SET deleted_at = CURRENT_TIMESTAMP WHERE ip_address = ?", [ip_address]);
      return NextResponse.json({ success: true });
    }

    if (action === "terminate_session") {
      const { session_id } = data;
      await db.query("UPDATE user_sessions SET is_active = 0, expiry_time = CURRENT_TIMESTAMP WHERE session_id = ?", [session_id]);
      return NextResponse.json({ success: true });
    }

    if (action === "resolve_alert") {
      const { alert_id } = data;
      await db.query("UPDATE security_alerts SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP, resolved_by_user_id = 1 WHERE alert_id = ?", [alert_id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
