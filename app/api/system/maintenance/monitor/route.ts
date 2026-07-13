import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    await initializeDatabase();
    const db = getDbPool();

    // Periodic automatic background session cleanup
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      lastCleanupTime = now;
      // Trigger async delete so we don't hold up the monitor request
      db.query(
        "DELETE FROM user_sessions WHERE expiry_time < NOW() OR is_active = 0 OR deleted_at IS NOT NULL"
      )
        .then(([result]: any) => {
          const deletedCount = result?.affectedRows || 0;
          if (deletedCount > 0) {
            console.log(`[Auto Cleanup] Successfully purged ${deletedCount} expired/inactive sessions.`);
            db.query(
              "INSERT INTO audit_log (user_id, action, table_name, new_data, ip_address, user_agent, created_at) VALUES (1, 'SESSION_CLEANUP', 'user_sessions', ?, '127.0.0.1', 'System Scheduler (Auto)', NOW())",
              [JSON.stringify({ deleted_sessions_count: deletedCount, trigger: "automatic" })]
            ).catch(() => null);
          }
        })
        .catch((e) => {
          console.error("Periodic session cleanup error:", e);
        });
    }

    const schema = await detectUsersSchema();

    // Define the admin query based on schema version
    const adminQuery = schema === "legacy"
      ? `
        SELECT u.username, s.ip_address AS ip, s.login_time AS logged_in_at
        FROM user_sessions s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.is_active = 1 AND u.role_id IN (1, 2) AND s.deleted_at IS NULL
        ORDER BY s.login_time DESC
      `
      : `
        SELECT u.username, s.ip_address AS ip, s.login_time AS logged_in_at
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.is_active = 1 AND u.role IN ('super_admin', 'admin') AND s.deleted_at IS NULL
        ORDER BY s.login_time DESC
      `;

    // 1-5. Execute all database queries in parallel
    const [
      [statusRows],
      [adminSessions],
      [[{ blocked_last_hour }]],
      [historyRows],
      [auditRows]
    ]: any = await Promise.all([
      db.query("SELECT * FROM v_maintenance_status"),
      db.query(adminQuery),
      db.query(`
        SELECT COUNT(*) as blocked_last_hour 
        FROM audit_log 
        WHERE action = 'MAINTENANCE_BLOCKED' 
          AND created_at >= NOW() - INTERVAL 1 HOUR
      `),
      db.query(`
        SELECT 
          created_at AS time, 
          action, 
          performed_by AS user, 
          COALESCE(reason, notes, '') AS details, 
          triggered_by_ip AS ip
        FROM maintenance_history
        ORDER BY created_at DESC
        LIMIT 20
      `),
      db.query(`
        SELECT 
          a.created_at AS time, 
          a.action, 
          u.username AS user, 
          a.new_data, 
          a.ip_address AS ip
        FROM audit_log a
        LEFT JOIN users u ON a.user_id = u.user_id
        WHERE a.action IN ('MAINTENANCE_BLOCKED', 'CONFIG_UPDATED', 'MAINTENANCE_ENABLED', 'MAINTENANCE_DISABLED', 'USER_LOGIN', 'USER_LOGOUT')
        ORDER BY a.created_at DESC
        LIMIT 40
      `)
    ]);

    const status = statusRows[0] || {};

    const activities: any[] = [];

    for (const h of historyRows) {
      activities.push({
        time: h.time,
        action: h.action.toLowerCase(),
        user: h.user || 'System Admin',
        ip: h.ip || '127.0.0.1',
        details: h.details || ''
      });
    }

    for (const a of auditRows) {
      let parsedDetails = 'System activity';
      let username = a.user || 'system';
      
      if (a.action === 'MAINTENANCE_BLOCKED') {
        parsedDetails = 'Access attempt during maintenance';
      }

      if (a.new_data) {
        try {
          const data = typeof a.new_data === 'string' ? JSON.parse(a.new_data) : a.new_data;
          if (data) {
            if (data.notes) {
              parsedDetails = data.notes;
            } else if (a.action === 'USER_LOGIN') {
              parsedDetails = `Successfully signed in: ${data.full_name || data.username}`;
            } else if (a.action === 'USER_LOGOUT') {
              parsedDetails = 'Signed out of administrator session';
            }
            if (data.username) {
              username = data.username;
            }
          }
        } catch (e) {
          // Keep default
        }
      }

      activities.push({
        time: a.time,
        action: a.action.toLowerCase().replace('maintenance_', '').toLowerCase(),
        user: username,
        ip: a.ip || '127.0.0.1',
        details: parsedDetails
      });
    }

    const sortedActivities = activities
      .sort((x: any, y: any) => new Date(y.time).getTime() - new Date(x.time).getTime())
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        current_status: {
          is_active: status.is_active === 'TRUE',
          started_at: status.started_at,
          elapsed_minutes: status.elapsed_minutes,
          remaining_minutes: status.remaining_minutes,
          last_activity: sortedActivities[0]?.time || status.started_at || new Date().toISOString()
        },
        active_admin_sessions: adminSessions,
        blocked_attempts_last_hour: blocked_last_hour || 0,
        recent_activities: sortedActivities
      }
    });

  } catch (error: any) {
    console.error("Error monitoring maintenance:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
