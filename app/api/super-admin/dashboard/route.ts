import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

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
    const [maintenanceHistory]: any = await db.query("SELECT * FROM maintenance_history ORDER BY started_at DESC LIMIT 100");
    const [auditLogs]: any = await db.query("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100");
    
    // Calculate maintenance analytics from history
    const [historyStats]: any = await db.query(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_duration,
        SUM(blocked_attempts) as total_blocked,
        SUM(admin_logins) as total_admin_logins,
        AVG(duration_minutes) as avg_duration,
        MAX(duration_minutes) as max_duration,
        MIN(NULLIF(duration_minutes, 0)) as min_duration
      FROM maintenance_history 
      WHERE ended_at IS NOT NULL
    `);
    
    const stats = historyStats[0] || {};
    
    // Quick counts for Insights tab
    const [[{ c: sessionCount }]]: any = await db.query("SELECT COUNT(*) as c FROM user_sessions WHERE is_active=1 AND deleted_at IS NULL");
    const [[{ c: alertCount }]]: any = await db.query("SELECT COUNT(*) as c FROM security_alerts WHERE is_resolved=0 AND deleted_at IS NULL");
    const [[{ c: errorCount }]]: any = await db.query("SELECT COUNT(*) as c FROM system_error_logs WHERE resolved_at IS NULL AND deleted_at IS NULL");
    
    const [[{ c: healthAvg }]]: any = await db.query("SELECT AVG(metric_value) as c FROM system_health_metrics WHERE metric_name='uptime'");
    
    let schoolCount = 0;
    let studentCount = 0;
    let staffCount = 0;
    let userCount = 0;

    try {
      const [[{ c: sC }]]: any = await db.query("SELECT COUNT(*) as c FROM schools WHERE deleted_at IS NULL");
      schoolCount = sC;
    } catch (e) {
      try {
        const [[{ c: sC }]]: any = await db.query("SELECT COUNT(*) as c FROM schools");
        schoolCount = sC;
      } catch (err) {
        console.error("Error querying schools count:", err);
      }
    }

    try {
      const [[{ c: stC }]]: any = await db.query("SELECT COUNT(*) as c FROM students WHERE deleted_at IS NULL");
      studentCount = stC;
    } catch (e) {
      try {
        const [[{ c: stC }]]: any = await db.query("SELECT COUNT(*) as c FROM students");
        studentCount = stC;
      } catch (err) {
        console.error("Error querying students count:", err);
      }
    }

    try {
      const [[{ c: sfC }]]: any = await db.query("SELECT COUNT(*) as c FROM staff WHERE deleted_at IS NULL");
      staffCount = sfC;
    } catch (e) {
      try {
        const [[{ c: sfC }]]: any = await db.query("SELECT COUNT(*) as c FROM staff");
        staffCount = sfC;
      } catch (err) {
        console.error("Error querying staff count:", err);
      }
    }

    try {
      const [[{ c: uC }]]: any = await db.query("SELECT COUNT(*) as c FROM users WHERE deleted_at IS NULL");
      userCount = uC;
    } catch (e) {
      try {
        const [[{ c: uC }]]: any = await db.query("SELECT COUNT(*) as c FROM users");
        userCount = uC;
      } catch (err) {
        console.error("Error querying users count:", err);
      }
    }

    let regionCount = 0;
    try {
      const [[{ c: rC }]]: any = await db.query("SELECT COUNT(DISTINCT region_id) as c FROM schools WHERE deleted_at IS NULL");
      regionCount = rC;
    } catch (e) {
      try {
        const [[{ c: rC }]]: any = await db.query("SELECT COUNT(DISTINCT region_id) as c FROM schools");
        regionCount = rC;
      } catch (err) {
        console.error("Error querying region count:", err);
      }
    }
    
    // Merge calculated analytics into config for frontend compatibility if needed
    // But it's better to send them separately
    
    const [activeMaintenance]: any = await db.query("SELECT * FROM maintenance_history WHERE action = 'STARTED' AND ended_at IS NULL LIMIT 1");
    const currentMaintenance = activeMaintenance[0] || null;

    return NextResponse.json({
      sessions,
      alerts,
      errors,
      health,
      config,
      backups,
      whitelist,
      maintenanceHistory,
      auditLogs,
      maintenanceAnalytics: {
        total_toggles: stats.total_sessions || 0,
        total_duration_minutes: stats.total_duration || 0,
        blocked_attempts: stats.total_blocked || 0,
        admin_logins: stats.total_admin_logins || 0,
        average_duration: Math.round(stats.avg_duration || 0),
        longest_duration: stats.max_duration || 0,
        shortest_duration: stats.min_duration || 0
      },
      currentMaintenance,
      counts: {
        sessionCount: sessionCount || 0,
        alertCount: alertCount || 0,
        errorCount: errorCount || 0,
        healthAvg: healthAvg || 99.9,
        schoolCount: schoolCount || 0,
        studentCount: studentCount || 0,
        staffCount: staffCount || 0,
        userCount: userCount || 0,
        regionCount: regionCount || 0,
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
    const { action, data, username, ip } = body;
    console.log("Super Admin Action:", action, data);
    
    // Audit log entry helper
    const logAudit = async (logAction: string, details: string, resourceType: string, resourceId?: string) => {
      await db.query(
        "INSERT INTO audit_log (username, action, details, resource_type, resource_id, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
        [username || 'super_admin', logAction, details, resourceType, resourceId || null, ip || 'internal']
      );
    };

    if (action === "update_config") {
      const { configs } = data; 
      
      for (const cfg of configs) {
        if (cfg.config_key === "MAINTENANCE_MODE") {
          // Check current mode from history (more reliable now)
          const [active]: any = await db.query("SELECT * FROM maintenance_history WHERE action = 'STARTED' AND ended_at IS NULL LIMIT 1");
          const isCurrentlyActive = active && active.length > 0;
          
          if (cfg.config_value === "TRUE" && !isCurrentlyActive) {
            // STARTING MAINTENANCE
            const timestamp = new Date().toISOString();
            await db.query(
              "INSERT INTO maintenance_history (action, performed_by, started_at) VALUES (?, ?, ?)",
              ['STARTED', username || 'Super Admin', timestamp]
            );
            await logAudit('MAINTENANCE_STARTED', 'System maintenance mode activated', 'SYSTEM');
          } else if (cfg.config_value === "FALSE" && isCurrentlyActive) {
            // ENDING MAINTENANCE
            const timestamp = new Date().toISOString();
            const start = new Date(active[0].started_at);
            const end = new Date();
            const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
            
            await db.query(
              "UPDATE maintenance_history SET action = 'ENDED', ended_at = ?, duration_minutes = ? WHERE history_id = ?",
              [timestamp, diffMinutes, active[0].history_id]
            );
            await logAudit('MAINTENANCE_ENDED', `System maintenance mode deactivated after ${diffMinutes} minutes`, 'SYSTEM');
          }
        }

        await db.query(
          "INSERT INTO system_config (config_key, config_value, config_group) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?",
          [cfg.config_key, cfg.config_value, cfg.config_group || 'SYSTEM', cfg.config_value]
        );
        
        await logAudit('CONFIG_UPDATE', `Updated configuration: ${cfg.config_key}`, 'CONFIG', cfg.config_key);
      }
      
      return NextResponse.json({ success: true });
    }
    
    if (action === "create_backup") {
      const name = "bak_" + Date.now() + "_manual";
      await db.query(
        "INSERT INTO system_backups (backup_name, backup_type, backup_file_path, backup_status, created_by_user_id) VALUES (?, ?, ?, ?, ?)",
        [name, "FULL", `/backups/${name}.sql`, "COMPLETED", 1]
      );
      await logAudit('BACKUP_CREATED', `Manual backup created: ${name}`, 'BACKUP', name);
      return NextResponse.json({ success: true });
    }

    if (action === "add_ip") {
      const { ip_address, description } = data;
      await db.query(
        "INSERT INTO ip_whitelist (ip_address, description, created_by_user_id) VALUES (?, ?, ?)",
        [ip_address, description, 1]
      );
      await logAudit('IP_WHITELIST_ADD', `Added IP to whitelist: ${ip_address}`, 'WHITELIST', ip_address);
      return NextResponse.json({ success: true });
    }

    if (action === "remove_ip") {
      const { ip_address } = data;
      await db.query("UPDATE ip_whitelist SET deleted_at = CURRENT_TIMESTAMP WHERE ip_address = ?", [ip_address]);
      await logAudit('IP_WHITELIST_REMOVE', `Removed IP from whitelist: ${ip_address}`, 'WHITELIST', ip_address);
      return NextResponse.json({ success: true });
    }

    if (action === "terminate_session") {
      const { session_id } = data;
      await db.query("UPDATE user_sessions SET is_active = 0, expiry_time = CURRENT_TIMESTAMP WHERE session_id = ?", [session_id]);
      await logAudit('SESSION_TERMINATE', `Terminated user session: ${session_id}`, 'SESSION', session_id.toString());
      return NextResponse.json({ success: true });
    }

    if (action === "resolve_alert") {
      const { alert_id } = data;
      await db.query("UPDATE security_alerts SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP, resolved_by_user_id = 1 WHERE alert_id = ?", [alert_id]);
      await logAudit('ALERT_RESOLVE', `Resolved security alert: ${alert_id}`, 'ALERT', alert_id.toString());
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
