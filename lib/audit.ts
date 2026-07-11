import { getDbPool } from "./db";

export async function logAudit(
  userId: number,
  action: string,
  tableName: string,
  recordId: number,
  oldData: any = null,
  newData: any = null,
  ipAddress: string = "127.0.0.1",
  userAgent: string = "System"
) {
  try {
    const db = getDbPool();
    await db.query(
      "INSERT INTO `audit_log` (`user_id`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `user_agent`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        action,
        tableName,
        recordId,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (err) {
    console.error("Failed to write to audit_log table:", err);
  }
}
