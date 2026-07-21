export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDbPool, initializeDatabase, detectUsersSchema, sha256 } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { users } = body; // Array of user objects
    const currentUserId = parseInt(req.headers.get("x-user-id") || "1", 10);

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Invalid or empty users list" }, { status: 400 });
    }

    await initializeDatabase();
    const db = getDbPool();
    const schema = await detectUsersSchema();

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Static mapping fallback if roles query fails
    const roleIdMap: Record<string, number> = {
      super_admin: 1,
      region_admin: 2,
      subregion_admin: 3,
      school_head: 4,
      data_entry_clerk: 5,
      education_officer: 6,
      report_viewer: 7,
      school_admin: 8
    };

    // Dynamically retrieve database roles for mapping
    try {
      const [roleRows]: any = await db.query("SELECT role_id, role_name FROM `roles` WHERE `deleted_at` IS NULL");
      roleRows.forEach((r: any) => {
        roleIdMap[r.role_name] = r.role_id;
      });
    } catch (err) {
      console.error("Error fetching roles map in import:", err);
    }

    for (const u of users) {
      try {
        const username = (u.username || "").trim();
        const email = (u.email || "").trim();
        const fullName = (u.full_name || u.fullName || "").trim();
        const role = (u.role || "school_admin").trim();
        const region = u.region || "All";
        const password = u.password || "password123";
        const status = u.status || "Active";

        if (!username || !email || !fullName) {
          skippedCount++;
          errors.push(`Skipped row with missing fields: ${JSON.stringify(u)}`);
          continue;
        }

        // Check if user already exists
        const checkQuery = schema === "legacy"
          ? "SELECT user_id AS id FROM `users` WHERE LOWER(username) = ? OR LOWER(email) = ?"
          : "SELECT id FROM `users` WHERE LOWER(username) = ? OR LOWER(email) = ?";
        const [existing]: any = await db.query(checkQuery, [username.toLowerCase(), email.toLowerCase()]);

        if (existing && existing.length > 0) {
          skippedCount++;
          continue;
        }

        const hashed = sha256(password);

        if (schema === "legacy") {
          const isActiveVal = status === "Active" || status === 1 ? 1 : 0;
          const roleId = roleIdMap[role] || 8; // fallback to school_admin if unknown

          await db.query(
            "INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role_id`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)",
            [username, hashed, email, fullName, roleId, isActiveVal]
          );
        } else {
          await db.query(
            "INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role`, `status`, `region`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username, hashed, email, fullName, role, status, region]
          );
        }

        importedCount++;
      } catch (rowErr: any) {
        skippedCount++;
        errors.push(`Error importing user ${u.username || "unknown"}: ${rowErr.message}`);
      }
    }

    await logAudit(
      currentUserId,
      "IMPORT_USERS",
      "users",
      0,
      null,
      { imported: importedCount, skipped: skippedCount }
    );

    return NextResponse.json({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.slice(0, 10) // return first 10 errors if any
    });
  } catch (err: any) {
    console.error("Import users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
