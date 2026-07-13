import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const { performed_by, notes, triggered_by_user_id } = await req.json();

    // 1. Fetch current maintenance start time
    const [startedAtRows]: any = await db.query(
      "SELECT config_value FROM system_config WHERE config_key = 'MAINTENANCE_STARTED_AT'"
    );
    const startedAtVal = startedAtRows[0]?.config_value;
    const startedAt = startedAtVal ? new Date(startedAtVal) : new Date();
    const endedAt = new Date();
    const durationMinutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60)));

    // 2. Disable maintenance mode in system_config
    const configsToUpdate = [
      { key: "MAINTENANCE_MODE", val: "FALSE" },
      { key: "MAINTENANCE_STARTED_AT", val: "" },
    ];

    for (const cfg of configsToUpdate) {
      await db.query(
        "UPDATE system_config SET config_value = ?, updated_at = NOW() WHERE config_key = ?",
        [cfg.val, cfg.key]
      );
    }

    // 3. Update maintenance stats in system_config
    // maintenance_total_duration_minutes
    await db.query(
      "UPDATE system_config SET config_value = CAST(CAST(config_value AS SIGNED) + ? AS CHAR), updated_at = NOW() WHERE config_key = 'maintenance_total_duration_minutes'",
      [durationMinutes]
    );

    // Get triggering user ID
    const userId = triggered_by_user_id || 1;

    // 4. Log "DISABLED" in maintenance_history
    const [historyResult]: any = await db.query(
      `INSERT INTO maintenance_history 
       (action, triggered_by_user_id, triggered_by_ip, triggered_by_user_agent, message_used, duration_minutes, notes, performed_by, ended_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        "DISABLED",
        userId,
        req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1",
        req.headers.get("user-agent") || "System User",
        "System restored to normal operation.",
        durationMinutes,
        notes || "Maintenance mode disabled.",
        performed_by || "System Admin",
      ]
    );

    // 5. Log to audit_log
    try {
      const payload = JSON.stringify({
        username: performed_by || "system",
        notes: `Maintenance disabled. Duration: ${durationMinutes} mins. Notes: ${notes || "None"}.`
      });
      await db.query(
        `INSERT INTO audit_log (action, user_id, table_name, new_data, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          "MAINTENANCE_DISABLED",
          userId,
          "system_config",
          payload,
          req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1",
          req.headers.get("user-agent") || "System",
        ]
      );
    } catch (auditError: any) {
      console.warn("Could not insert into audit_log:", auditError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Maintenance mode disabled successfully",
      data: {
        ended_at: endedAt.toISOString(),
        duration_minutes: durationMinutes,
        history_id: historyResult.insertId,
      },
    });

  } catch (error: any) {
    console.error("Error disabling maintenance mode:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
