import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import crypto from "crypto";

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    const host = process.env.DB_HOST;
    const port = parseInt(process.env.DB_PORT || "12720", 10);
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME || "school_data_collection";
    const caFile = process.env.DB_SSL_CA || "ca.pem";

    if (!host || !user || !password) {
      throw new Error("Missing MySQL database connection configuration in environment variables");
    }

    let sslOptions: any = null;
    try {
      const caPath = path.resolve(process.cwd(), caFile);
      if (fs.existsSync(caPath)) {
        sslOptions = {
          ca: fs.readFileSync(caPath),
          rejectUnauthorized: false // Necessary for self-signed or internal Aiven certificates
        };
      } else {
        sslOptions = { rejectUnauthorized: false };
      }
    } catch (e) {
      console.error("Error reading SSL certificate ca.pem:", e);
      sslOptions = { rejectUnauthorized: false };
    }

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: sslOptions,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 10000 // 10 seconds TCP handshake timeout
    });
  }
  return pool;
}

// Compute SHA-256 hash for secure password verification
export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

let usersTableSchema: "new" | "legacy" | null = null;

export async function detectUsersSchema(): Promise<"new" | "legacy"> {
  if (usersTableSchema) return usersTableSchema;
  try {
    const db = getDbPool();
    const [columns]: any = await db.query("DESCRIBE `users`");
    const hasUserId = columns.some((col: any) => col.Field === "user_id");
    usersTableSchema = hasUserId ? "legacy" : "new";
    return usersTableSchema;
  } catch (e) {
    console.error("Error detecting users schema:", e);
    return "new"; // fallback
  }
}

// Automatically create tables if they do not exist
export async function initializeDatabase() {
  const db = getDbPool();
  
  // Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(255) NOT NULL UNIQUE,
      \`password_hash\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL UNIQUE,
      \`full_name\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(100) NOT NULL,
      \`status\` VARCHAR(50) DEFAULT 'Active',
      \`region\` VARCHAR(100) DEFAULT 'All',
      \`last_login\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create school registries table (students, teachers, dropouts, etc.)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`registries\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`type\` VARCHAR(100) NOT NULL, -- 'students', 'teachers', 'dropouts', 'transfers'
      \`school_name\` VARCHAR(255) NOT NULL,
      \`region\` VARCHAR(100) NOT NULL,
      \`record_data\` JSON NOT NULL, -- holds form fields like name, age, reason, etc.
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create permissions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`permissions\` (
      \`permission_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`permission_name\` VARCHAR(100) UNIQUE NOT NULL,
      \`permission_description\` VARCHAR(255),
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`deleted_at\` TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create role_permissions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`role_permissions\` (
      \`role_permission_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`role\` VARCHAR(100) NOT NULL,
      \`permission_id\` INT NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`deleted_at\` TIMESTAMP NULL,
      FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`permission_id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Seed default permissions if table is empty
  const [permCountRows]: any = await db.query("SELECT COUNT(*) as count FROM `permissions` WHERE deleted_at IS NULL");
  const permCount = permCountRows[0]?.count || 0;
  if (permCount === 0) {
    const defaultPermissions = [
      ["view_all_schools", "View all schools information across all regions"],
      ["manage_all_schools", "Create, edit, or delete any school profile"],
      ["view_region_schools", "View schools within assigned region"],
      ["manage_region_schools", "Manage school profiles within assigned region"],
      ["view_subregion_schools", "View schools within assigned sub-region"],
      ["manage_subregion_schools", "Manage school profiles within assigned sub-region"],
      ["view_own_school", "View profile and data for your own school"],
      ["manage_own_school", "Manage profile and data for your own school"],
      ["view_students", "View student records and information"],
      ["manage_students", "Create, update, or remove student records"],
      ["view_staff", "View teacher and staff records"],
      ["manage_staff", "Manage teacher and staff profiles"],
      ["view_inventory", "View school inventory and assets list"],
      ["manage_inventory", "Update school inventory and assets list"],
      ["view_reports", "Access, filter, and export data reports"],
      ["manage_users", "Provision and manage system users and roles"],
      ["view_audit_log", "View administrative audit trail and system activity logs"],
      ["manage_policies", "Configure global education policies and rules"]
    ];
    await db.query("INSERT INTO `permissions` (`permission_name`, `permission_description`) VALUES ?", [defaultPermissions]);
  }

  // Seed default role_permissions if empty
  const [rolePermCountRows]: any = await db.query("SELECT COUNT(*) as count FROM `role_permissions` WHERE deleted_at IS NULL");
  const rolePermCount = rolePermCountRows[0]?.count || 0;
  if (rolePermCount === 0) {
    const [allPerms]: any = await db.query("SELECT permission_id, permission_name FROM `permissions` WHERE deleted_at IS NULL");
    const permIdMap: Record<string, number> = {};
    allPerms.forEach((p: any) => {
      permIdMap[p.permission_name] = p.permission_id;
    });

    const defaultRolePerms: Record<string, string[]> = {
      super_admin: ["view_all_schools", "manage_all_schools", "view_region_schools", "manage_region_schools", "view_subregion_schools", "manage_subregion_schools", "view_own_school", "manage_own_school", "view_students", "manage_students", "view_staff", "manage_staff", "view_inventory", "manage_inventory", "view_reports", "manage_users", "view_audit_log", "manage_policies"],
      region_admin: ["view_region_schools", "manage_region_schools", "view_students", "manage_students", "view_staff", "manage_staff", "view_inventory", "manage_inventory", "view_reports"],
      subregion_admin: ["view_subregion_schools", "manage_subregion_schools", "view_students", "manage_students", "view_staff", "manage_staff", "view_inventory", "manage_inventory"],
      school_head: ["view_own_school", "manage_own_school", "view_students", "manage_students", "view_staff", "manage_staff", "view_inventory", "manage_inventory"],
      school_admin: ["view_own_school", "view_students", "manage_students", "view_staff", "manage_staff", "view_inventory", "view_reports"],
      data_entry_clerk: ["view_students", "manage_students", "view_staff", "manage_staff", "view_inventory"],
      education_officer: ["view_all_schools", "view_students", "view_staff", "view_inventory", "view_reports"],
      report_viewer: ["view_reports"]
    };

    // Fetch existing roles to map role_name to role_id
    const [rolesRes]: any = await db.query("SELECT `role_id`, `role_name` FROM `roles` WHERE `deleted_at` IS NULL");
    const roleIdMap: Record<string, number> = {};
    rolesRes.forEach((r: any) => {
      roleIdMap[r.role_name] = r.role_id;
    });

    const insertValues: any[] = [];
    Object.entries(defaultRolePerms).forEach(([role, perms]) => {
      const rId = roleIdMap[role];
      if (rId) {
        perms.forEach((pName) => {
          const id = permIdMap[pName];
          if (id) {
            insertValues.push([role, id, rId]);
          }
        });
      }
    });

    if (insertValues.length > 0) {
      await db.query("INSERT INTO `role_permissions` (`role`, `permission_id`, `role_id`) VALUES ?", [insertValues]);
    }
  }

  const schema = await detectUsersSchema();

  // Handle super_admin upsert/update
  const [superAdminRows]: any = await db.query(
    schema === "legacy"
      ? "SELECT user_id AS id FROM `users` WHERE username = 'super_admin'"
      : "SELECT id FROM `users` WHERE username = 'super_admin'"
  );

  if (superAdminRows && superAdminRows.length > 0) {
    console.log("Updating existing super_admin password to match admin123...");
    await db.query(
      "UPDATE `users` SET `password_hash` = ? WHERE `username` = 'super_admin'",
      [sha256("admin123")]
    );
  } else {
    console.log("Inserting super_admin...");
    if (schema === "legacy") {
      await db.query(
        "INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role_id`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)",
        ["super_admin", sha256("admin123"), "admin@schoolgov.com", "System Super Administrator", 1, 1]
      );
    } else {
      await db.query(
        "INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role`, `status`, `region`) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["super_admin", sha256("admin123"), "admin@schoolgov.com", "System Super Administrator", "super_admin", "Active", "All"]
      );
    }
  }

  // Handle school_head upsert/update
  const [schoolHeadRows]: any = await db.query(
    schema === "legacy"
      ? "SELECT user_id AS id FROM `users` WHERE username = 'school_head'"
      : "SELECT id FROM `users` WHERE username = 'school_head'"
  );

  if (schoolHeadRows && schoolHeadRows.length > 0) {
    console.log("Updating existing school_head password to match school123...");
    await db.query(
      "UPDATE `users` SET `password_hash` = ? WHERE `username` = 'school_head'",
      [sha256("school123")]
    );
  } else {
    console.log("Inserting school_head...");
    if (schema === "legacy") {
      await db.query(
        "INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role_id`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)",
        ["school_head", sha256("school123"), "schoolhead@schoolgov.com", "School Head (Mogoditshane)", 4, 1]
      );
    } else {
      await db.query(
        "INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role`, `status`, `region`) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["school_head", sha256("school123"), "schoolhead@schoolgov.com", "School Head (Mogoditshane)", "school_head", "Active", "South"]
      );
    }
  }
  console.log("Seeding and validation of default accounts complete.");
}
