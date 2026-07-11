import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema, sha256 } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, password } = body;
    const defaultPassword = password || "password123";
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty IDs list" }, { status: 400 });
    }

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    const hashed = sha256(defaultPassword);

    const placeHolders = ids.map(() => "?").join(",");
    let query = schema === "legacy"
      ? `UPDATE \`users\` SET \`password_hash\` = ? WHERE \`user_id\` IN (${placeHolders})`
      : `UPDATE \`users\` SET \`password_hash\` = ? WHERE \`id\` IN (${placeHolders})`;

    const [result]: any = await db.query(query, [hashed, ...ids]);

    for (const id of ids) {
      await logAudit(
        currentUserId,
        "BULK_RESET_PASSWORD",
        "users",
        parseInt(id, 10),
        null,
        { info: `Password reset to ${defaultPassword}` }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully reset password for ${result.affectedRows} users to: ${defaultPassword}`
    });
  } catch (err: any) {
    console.error("Bulk password reset error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
