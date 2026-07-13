'use client'

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// In-memory cache to prevent multiple fetches during transitions
let cachedMaintenanceStatus: boolean | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Initialize loading based on cache to make page transitions and loads instant
  const [loading, setLoading] = useState(() => {
    if (pathname === '/maintenance') return false;
    
    // If we have a valid cache that says maintenance is false, don't show loading screen
    if (cachedMaintenanceStatus === false) {
      return false;
    }
    
    // Otherwise, check if we stored it in sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('sys_maintenance_mode');
        const storedTime = sessionStorage.getItem('sys_maintenance_time');
        if (stored === 'FALSE' && storedTime && Date.now() - parseInt(storedTime) < CACHE_TTL) {
          cachedMaintenanceStatus = false;
          return false;
        }
      } catch (e) {
        // Ignore storage errors in restricted contexts
      }
    }
    
    return true;
  });

  useEffect(() => {
    const handleStatus = (isMaintenance: boolean) => {
      // console.log(`MaintenanceGuard: Handling status. isMaintenance=${isMaintenance}, pathname=${pathname}`);
      
      if (!isMaintenance) {
        setLoading(false);
        // If we are on the maintenance page but maintenance is over, redirect to dashboard/home
        if (pathname === '/maintenance') {
          // console.log('MaintenanceGuard: Maintenance over, redirecting to home');
          router.replace('/');
        }
        return;
      }

      // Maintenance is ON. Check user role from localStorage.
      let user: any = null;
      try {
        const savedUser = localStorage.getItem("edu_vision_remembered_user");
        user = savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        console.error('MaintenanceGuard: Error parsing user from localStorage', e);
      }

      const isSuperAdmin = user?.role === 'super_admin';
      const isLoggedIn = !!user;

      // Redirection logic when maintenance is active:
      if (isSuperAdmin) {
        // console.log('MaintenanceGuard: Super Admin bypass');
        setLoading(false);
      } else if (pathname === '/' && !isLoggedIn) {
        // console.log('MaintenanceGuard: Allowing login page');
        setLoading(false);
      } else if (pathname !== '/maintenance') {
        // console.log('MaintenanceGuard: Maintenance active, redirecting to maintenance page');
        
        // Track blocked attempt
        fetch('/api/system/config', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'increment_blocked',
            username: user?.username || 'anonymous'
          })
        }).catch(() => null);

        setLoading(false);
        router.replace('/maintenance');
      } else {
        // console.log('MaintenanceGuard: On maintenance page');
        setLoading(false);
      }
    };

    const checkMaintenance = async () => {
      // Check cache first
      const now = Date.now();
      
      // If we are on maintenance page, we always want a fresh check to allow "Check Status" to work reliably
      const isMaintenancePage = pathname === '/maintenance';
      
      if (!isMaintenancePage && cachedMaintenanceStatus !== null && (now - lastFetchTime < CACHE_TTL)) {
        handleStatus(cachedMaintenanceStatus);
        return;
      }

      try {
        // Fetch with a longer timeout to allow for DB cold starts.
        // Add cache busting when on maintenance page to ensure fresh status.
        const url = isMaintenancePage ? `/api/system/config?t=${now}` : '/api/system/config';
        const configRes = await fetch(url, { 
          signal: AbortSignal.timeout(10000) 
        }).catch(() => null);
        
        if (!configRes || !configRes.ok) {
          // Silent fail: assume UP if we can't reach the config API
          handleStatus(false);
          return;
        }
        
        const resJson = await configRes.json();
        const configs = resJson?.data || [];
        const isMaintenance = Array.isArray(configs) 
          ? configs.find((c: any) => c.config_key === 'MAINTENANCE_MODE')?.config_value === 'TRUE'
          : false;

        // Update cache
        cachedMaintenanceStatus = isMaintenance;
        lastFetchTime = now;
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('sys_maintenance_mode', isMaintenance ? 'TRUE' : 'FALSE');
            sessionStorage.setItem('sys_maintenance_time', now.toString());
          } catch (e) {
            // Ignore storage errors
          }
        }

        handleStatus(isMaintenance);
      } catch (error: any) {
        // PERMANENT SILENT FAIL: If anything goes wrong, default to system UP.
        handleStatus(false);
      }
    };

    checkMaintenance();
    
    // Poll every 5 seconds to catch login/logout or maintenance mode changes
    const interval = setInterval(checkMaintenance, 5000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  // Only show loader if we are actually blocking content
  if (loading && pathname !== '/maintenance') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#090d16] z-[9999] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Checking System Status</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
