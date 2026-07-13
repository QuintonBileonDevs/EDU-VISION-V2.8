import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "System";

    // 1. Run the delete statement to purge expired, inactive, or soft-deleted sessions
    const [result]: any = await db.query(
      "DELETE FROM user_sessions WHERE expiry_time < NOW() OR is_active = 0 OR deleted_at IS NOT NULL"
    );

    const deletedCount = result?.affectedRows || 0;

    // 2. Log this action to the audit_log table
    try {
      await db.query(
        "INSERT INTO audit_log (user_id, action, table_name, new_data, ip_address, user_agent, created_at) VALUES (1, 'SESSION_CLEANUP', 'user_sessions', ?, ?, ?, NOW())",
        [
          JSON.stringify({ deleted_sessions_count: deletedCount, trigger: "manual" }),
          ipAddress,
          userAgent,
        ]
      );
    } catch (auditError: any) {
      console.warn("Could not write session cleanup to audit log:", auditError.message);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} expired or inactive sessions.`,
      deleted_count: deletedCount,
    });
  } catch (error: any) {
    console.error("Session cleanup API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Support GET requests for easy scheduling/pinging
  return POST(req);
}
