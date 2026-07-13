'use client'

import React, { useEffect, useState } from 'react';
import { Wrench, Clock, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function MaintenancePage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/system/config?t=' + Date.now(), {
          signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const resJson = await res.json();
        const configs = resJson?.data || [];
        if (Array.isArray(configs)) {
          const maintenanceConfig = configs.reduce((acc: any, curr: any) => {
            acc[curr.config_key] = curr.config_value;
            return acc;
          }, {});
          setConfig(maintenanceConfig);
        }
      } catch (err) {
        console.error("Failed to load maintenance config", err);
      }
    };
    fetchConfig();
  }, []);

  const getExpectedEndTime = () => {
    if (!config?.MAINTENANCE_STARTED_AT || !config?.MAINTENANCE_ESTIMATED_MINS) return null;
    try {
      const start = new Date(config.MAINTENANCE_STARTED_AT);
      const mins = parseInt(config.MAINTENANCE_ESTIMATED_MINS);
      const end = new Date(start.getTime() + mins * 60000);
      return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return null;
    }
  };

  const [isChecking, setIsChecking] = useState(false);
  const endTime = getExpectedEndTime();

  const handleCheckStatus = () => {
    setIsChecking(true);
    // The MaintenanceGuard handles the actual status check and redirection.
    // We just trigger a reload to ensure the guard runs its fresh check logic immediately.
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative p-5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl">
              <Wrench className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          System Maintenance
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          {config?.MAINTENANCE_MESSAGE || "We are currently performing scheduled system upgrades to improve your experience. Please check back shortly."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 text-left">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Back At</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {endTime || `${config?.MAINTENANCE_ESTIMATED_MINS || "60"} Minutes`}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 text-left">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Upgrading Components</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="group relative px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-wait"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
            {isChecking ? 'Checking...' : 'Check System Status'}
          </button>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-600">
          &copy; {new Date().getFullYear()} National Education Management Information System
        </p>
        <Link 
          href="/" 
          className="text-[10px] text-slate-400 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest font-medium"
        >
          Admin Access
        </Link>
      </div>
    </div>
  );
}
