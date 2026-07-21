export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    await initializeDatabase();

    await logAudit(
      currentUserId,
      "FORCE_PASSWORD_CHANGE",
      "users",
      parseInt(id, 10),
      null,
      { info: "Force password change flagged" }
    );

    return NextResponse.json({ success: true, message: "User will be forced to change password on next login" });
  } catch (err: any) {
    console.error("Force password change error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
