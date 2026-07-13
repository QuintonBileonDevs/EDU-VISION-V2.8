import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  const token = req.cookies.get("admin_session")?.value || req.cookies.get("session_token")?.value;
  if (token) {
    try {
      const db = getDbPool();
      
      // Fetch user session first to audit log it
      const [sessions]: any = await db.query(
        "SELECT user_id, ip_address FROM user_sessions WHERE session_token = ? AND is_active = 1",
        [token]
      );

      if (sessions.length > 0) {
        const { user_id, ip_address } = sessions[0];
        // Mark session as inactive
        await db.query(
          "UPDATE user_sessions SET is_active = 0, deleted_at = NOW() WHERE session_token = ?",
          [token]
        );

        // Audit log the logout
        await db.query(
          "INSERT INTO audit_log (user_id, action, new_data, ip_address, created_at) VALUES (?, 'USER_LOGOUT', ?, ?, NOW())",
          [user_id, JSON.stringify({ message: "User signed out manually" }), ip_address || "127.0.0.1"]
        );
      }
    } catch (e) {
      console.error("Database session invalidation error on logout:", e);
    }
  }

  // Clear standard session cookies
  const cookiesToClear = ["session", "token", "session_token", "auth", "admin_session", "user_session"];
  
  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      maxAge: 0,
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  return response;
}

export async function GET(req: NextRequest) {
  // Support GET logout by redirecting to a login route after clearing
  const redirectUrl = new URL("/login", req.url);
  const response = NextResponse.redirect(redirectUrl);

  const token = req.cookies.get("admin_session")?.value || req.cookies.get("session_token")?.value;
  if (token) {
    try {
      const db = getDbPool();
      
      const [sessions]: any = await db.query(
        "SELECT user_id, ip_address FROM user_sessions WHERE session_token = ? AND is_active = 1",
        [token]
      );

      if (sessions.length > 0) {
        const { user_id, ip_address } = sessions[0];
        await db.query(
          "UPDATE user_sessions SET is_active = 0, deleted_at = NOW() WHERE session_token = ?",
          [token]
        );

        await db.query(
          "INSERT INTO audit_log (user_id, action, new_data, ip_address, created_at) VALUES (?, 'USER_LOGOUT', ?, ?, NOW())",
          [user_id, JSON.stringify({ message: "User signed out manually" }), ip_address || "127.0.0.1"]
        );
      }
    } catch (e) {
      console.error("Database session invalidation error on logout:", e);
    }
  }

  const cookiesToClear = ["session", "token", "session_token", "auth", "admin_session", "user_session"];
  
  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      maxAge: 0,
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  return response;
}
