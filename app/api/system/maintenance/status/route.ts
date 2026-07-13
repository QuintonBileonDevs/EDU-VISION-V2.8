import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const [statusRows]: any = await db.query("SELECT * FROM v_maintenance_status");
    const status = statusRows[0] || {};

    return NextResponse.json({
      success: true,
      data: {
        is_active: status.is_active === "TRUE",
        message: status.message || "System is undergoing scheduled maintenance.",
        whitelist: status.whitelist || "",
        estimated_minutes: status.estimated_minutes ? parseInt(status.estimated_minutes) : 60,
        started_at: status.started_at || null,
        ended_at: status.ended_at || null,
        elapsed_minutes: status.elapsed_minutes || 0,
        remaining_minutes: status.remaining_minutes ? parseFloat(status.remaining_minutes) : 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching maintenance status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
