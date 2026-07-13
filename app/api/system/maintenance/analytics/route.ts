import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDatabase();
    const db = getDbPool();

    // Summary Analytics
    const [summaryRows]: any = await db.query(`
      SELECT 
        COUNT(*) AS total_events,
        SUM(CASE WHEN action IN ('ENABLED', 'STARTED') THEN 1 ELSE 0 END) AS enabled_count,
        SUM(CASE WHEN action IN ('DISABLED', 'ENDED') THEN 1 ELSE 0 END) AS disabled_count,
        ROUND(AVG(NULLIF(duration_minutes, 0)), 2) AS avg_duration_minutes,
        MAX(duration_minutes) AS longest_duration_minutes,
        MIN(NULLIF(duration_minutes, 0)) AS shortest_duration_minutes,
        SUM(blocked_attempts) AS total_blocked_attempts,
        SUM(admin_logins) AS total_admin_logins
      FROM maintenance_history
    `);
    const summary = summaryRows[0] || {};

    // Monthly Breakdown
    const [monthlyRows]: any = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(CASE WHEN action IN ('ENABLED', 'STARTED') THEN 1 ELSE 0 END) AS enabled,
        SUM(CASE WHEN action IN ('DISABLED', 'ENDED') THEN 1 ELSE 0 END) AS disabled,
        ROUND(AVG(NULLIF(duration_minutes, 0)), 2) AS avg_duration
      FROM maintenance_history
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Peak Hours (when maintenance starts)
    const [peakRows]: any = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%H:00') AS hour,
        COUNT(*) AS count
      FROM maintenance_history
      WHERE action IN ('ENABLED', 'STARTED')
      GROUP BY DATE_FORMAT(created_at, '%H:00')
      ORDER BY count DESC
      LIMIT 5
    `);

    const peakHours: Record<string, number> = {};
    peakRows.forEach((row: any) => {
      peakHours[row.hour] = row.count;
    });

    const monthlyBreakdown: Record<string, any> = {};
    monthlyRows.forEach((row: any) => {
      monthlyBreakdown[row.month] = {
        enabled: row.enabled || 0,
        disabled: row.disabled || 0,
        avg_duration: row.avg_duration || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_events: summary.total_events || 0,
          enabled_count: summary.enabled_count || 0,
          disabled_count: summary.disabled_count || 0,
          avg_duration_minutes: summary.avg_duration_minutes || 0,
          longest_duration_minutes: summary.longest_duration_minutes || 0,
          shortest_duration_minutes: summary.shortest_duration_minutes || 0,
          total_blocked_attempts: summary.total_blocked_attempts || 0,
          total_admin_logins: summary.total_admin_logins || 0
        },
        monthly_breakdown: monthlyBreakdown,
        peak_hours: peakHours
      }
    });

  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
