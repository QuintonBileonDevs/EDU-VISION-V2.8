"use client";

import React, { useState } from "react";
import { Shield, Lock, User, ArrowRight, Database, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("super_admin");
  const [password, setPassword] = useState<string>("admin123");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store user in localStorage so MaintenanceGuard knows who is logged in
        localStorage.setItem("edu_vision_remembered_user", JSON.stringify(data.user));
        // Redirect to main dashboard
        window.location.href = "/";
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Unable to connect to the authentication server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1F] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none">
      {/* Background ambient light effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#00B4D8]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#9B1C1C]/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex w-16 h-16 bg-[#0E1B3D] border-2 border-[#00B4D8] rounded-2xl items-center justify-center shadow-lg relative overflow-hidden mx-auto mb-2"
          >
            <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15L85 50L50 85L15 50L50 15Z" fill="#0E1B3D" stroke="#00B4D8" strokeWidth="4" />
              <path d="M50 15L15 50L50 85V15Z" fill="#00B4D8" fillOpacity="0.8" />
              <path d="M50 15L85 50L50 85V15Z" fill="#0077B6" fillOpacity="0.4" />
              <circle cx="50" cy="50" r="6" fill="#F9C74F" />
              <line x1="50" y1="15" x2="50" y2="85" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
              <line x1="15" y1="50" x2="85" y2="50" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-center gap-1 font-sans">
              <span className="text-white text-2xl font-bold tracking-tight">EDU-</span>
              <span className="text-[#00B4D8] text-2xl font-extrabold tracking-tight">VISION</span>
              <span className="text-white text-2xl font-bold tracking-tight ml-1">EMIS</span>
            </div>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              SYSTEM MAINTENANCE & CONFIGURATION HUB
            </p>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="bg-[#0D1B3E]/85 backdrop-blur-md border border-[#1E2F5F] rounded-2xl p-8 shadow-2xl space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Login</h2>
            <p className="text-xs text-gray-400">Sign in to access your account.</p>
          </div>

          {/* Feedback error banner */}
          {error && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-start gap-2.5 text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 tracking-wide uppercase">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="w-full bg-[#111C3A] border border-[#1E2E5D] focus:border-[#00B4D8] hover:border-[#20325B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 tracking-wide uppercase">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret credentials"
                  className="w-full bg-[#111C3A] border border-[#1E2E5D] focus:border-[#00B4D8] hover:border-[#20325B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#00B4D8] hover:bg-[#0077B6] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </motion.div>

        {/* Footer info */}
        <div className="text-center flex items-center justify-center gap-2 text-xs text-gray-500">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured MySQL Connection (Aiven Cloud)</span>
        </div>
      </div>
    </div>
  );
}
