"use client";

import React from "react";
import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070D1F] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans text-white select-none">
      {/* Background ambient light effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#00B4D8]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#9B1C1C]/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex w-20 h-20 bg-[#0E1B3D] border-2 border-[#00B4D8] rounded-full items-center justify-center shadow-lg relative overflow-hidden mx-auto"
        >
          <AlertTriangle className="w-10 h-10 text-[#00B4D8]" />
        </motion.div>

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-mono">404</h1>
          <h2 className="text-xl font-bold text-[#00B4D8] tracking-wide">PAGE NOT FOUND</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            The system resource or page you are trying to access does not exist or has been relocated.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0077B6] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
