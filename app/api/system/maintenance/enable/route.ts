import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const { estimated_minutes, whitelist, message, reason, performed_by, triggered_by_user_id } = await req.json();

    const started_at = new Date().toISOString();

    // 1. Update system_config keys
    const configsToUpdate = [
      { key: "MAINTENANCE_MODE", val: "TRUE" },
      { key: "MAINTENANCE_STARTED_AT", val: started_at },
      { key: "MAINTENANCE_MESSAGE", val: message || "System is undergoing scheduled maintenance." },
      { key: "MAINTENANCE_ESTIMATED_MINS", val: String(estimated_minutes || 60) },
      { key: "MAINTENANCE_WHITELIST", val: whitelist || "" },
    ];

    for (const cfg of configsToUpdate) {
      await db.query(
        "UPDATE system_config SET config_value = ?, updated_at = NOW() WHERE config_key = ?",
        [cfg.val, cfg.key]
      );
    }

    // 2. Increment maintenance_total_toggles
    await db.query(
      "UPDATE system_config SET config_value = CAST(CAST(config_value AS SIGNED) + 1 AS CHAR), updated_at = NOW() WHERE config_key = 'maintenance_total_toggles'"
    );

    // Get the triggering user ID
    const userId = triggered_by_user_id || 1; // Default to admin system user

    // 3. Log to maintenance_history
    const [historyResult]: any = await db.query(
      `INSERT INTO maintenance_history 
       (action, triggered_by_user_id, triggered_by_ip, triggered_by_user_agent, message_used, estimated_time_minutes, whitelist_used, notes, performed_by, reason, started_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        "ENABLED",
        userId,
        req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "127.0.0.1",
        req.headers.get("user-agent") || "System User",
        message || "System is undergoing scheduled maintenance.",
        estimated_minutes || 60,
        whitelist || "",
        `Maintenance enabled. Reason: ${reason || "None"}. Performed by: ${performed_by || "System"}.`,
        performed_by || "System Admin",
        reason || "Routine updates",
      ]
    );

    // 4. Log to audit_log
    try {
      const payload = JSON.stringify({
        username: performed_by || "system",
        notes: `Maintenance enabled for ${estimated_minutes || 60} mins. Reason: ${reason || "None"}.`
      });
      await db.query(
        `INSERT INTO audit_log (action, user_id, table_name, new_data, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          "MAINTENANCE_ENABLED",
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
      message: "Maintenance mode enabled successfully",
      data: {
        started_at,
        estimated_minutes: estimated_minutes || 60,
        history_id: historyResult.insertId,
      },
    });

  } catch (error: any) {
    console.error("Error enabling maintenance mode:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
