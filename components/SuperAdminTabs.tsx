"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Settings, Database, FileText, GraduationCap, Map, ShieldAlert, ActivitySquare,
  AlertTriangle, Server, Shield, Clock, Search, LogOut, CheckCircle, XCircle, ArrowRight,
  Download, Upload, Trash2, Edit, Wrench, Lock, Timer, School, BarChart, Mail, Folder, 
  HardDrive, Globe, Palette, Link, Save, ChevronRight, LayoutDashboard, Zap, PieChart as PieChartIcon,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldCheck, History, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart as ReBarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export function SuperAdminOverview() {
  const { data, loading } = useDashboardData();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const c = data?.counts || { sessionCount: 0, alertCount: 0, errorCount: 0, healthAvg: 0, schoolCount: 0, studentCount: 0, staffCount: 0, userCount: 0, regionCount: 0 };
  
  // Mock data for trends
  const trendData = [
    { name: 'Mon', active: 400, errors: 24 },
    { name: 'Tue', active: 300, errors: 13 },
    { name: 'Wed', active: 520, errors: 38 },
    { name: 'Thu', active: 480, errors: 22 },
    { name: 'Fri', active: 610, errors: 15 },
    { name: 'Sat', active: 380, errors: 9 },
    { name: 'Sun', active: 430, errors: 12 },
  ];

  const totalRecords = (c.studentCount || 0) + (c.staffCount || 0) + (c.schoolCount || 0) + (c.userCount || 0);

  const distributionData = totalRecords > 0 ? [
    { name: 'Students', value: Math.round(((c.studentCount || 0) / totalRecords) * 100), count: c.studentCount || 0, color: '#6366f1' },
    { name: 'Teachers & Staff', value: Math.round(((c.staffCount || 0) / totalRecords) * 100), count: c.staffCount || 0, color: '#10b981' },
    { name: 'Schools', value: Math.round(((c.schoolCount || 0) / totalRecords) * 100), count: c.schoolCount || 0, color: '#f59e0b' },
    { name: 'Admins & Users', value: Math.round(((c.userCount || 0) / totalRecords) * 100), count: c.userCount || 0, color: '#8b5cf6' },
  ] : [
    { name: 'Students', value: 45, count: 450, color: '#6366f1' },
    { name: 'Teachers & Staff', value: 25, count: 250, color: '#10b981' },
    { name: 'Schools', value: 20, count: 200, color: '#f59e0b' },
    { name: 'Admins & Users', value: 10, count: 100, color: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-500/30">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">System Command Center</h1>
          </div>
          <p className="text-slate-300 max-w-2xl leading-relaxed">
            Welcome back, Super Administrator. The national education database is currently operating within normal parameters. 
            Monitoring <span className="text-blue-400 font-bold">{c.schoolCount || "1,240"} schools</span> across <span className="text-emerald-400 font-bold">{c.regionCount || "12"} regions</span>.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Core Systems Online
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 text-xs font-semibold text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Last sync: 2 mins ago
            </div>
          </div>
        </div>
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] -mr-48 -mt-48 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 blur-[80px] -ml-32 -mb-32 rounded-full" />
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Real-time Traffic", value: "248", sub: "+12% from yesterday", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20", trend: "up" },
          { label: "Active Sessions", value: c.sessionCount, sub: "Concurrent users", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20", trend: "up" },
          { label: "System Alerts", value: c.alertCount, sub: "Requires attention", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/20", trend: "down" },
          { label: "Database Health", value: (parseFloat(c.healthAvg).toFixed(1) + "%"), sub: "Response latency < 45ms", icon: ActivitySquare, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20", trend: "up" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                14.2%
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Maintenance Monitor - Real-time monitoring */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold dark:text-white">Maintenance Intelligence Monitor</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${
            (data?.config?.find((c: any) => c.config_key === 'MAINTENANCE_MODE')?.config_value === 'TRUE') 
              ? 'bg-rose-100 text-rose-600 animate-pulse' 
              : 'bg-emerald-100 text-emerald-600'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              (data?.config?.find((c: any) => c.config_key === 'MAINTENANCE_MODE')?.config_value === 'TRUE') 
                ? 'bg-rose-500' 
                : 'bg-emerald-500'
            }`} />
            {(data?.config?.find((c: any) => c.config_key === 'MAINTENANCE_MODE')?.config_value === 'TRUE') ? 'Active' : 'Standby'}
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Blocked Traffic</span>
              <span className="font-bold dark:text-white">{data?.currentMaintenance?.blocked_attempts || '0'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, (parseInt(data?.currentMaintenance?.blocked_attempts || '0') / 50) * 100)}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Monitoring unauthorized access attempts during downtime.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Admin Activity</span>
              <span className="font-bold dark:text-white">{data?.currentMaintenance?.admin_logins || '0'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (parseInt(data?.currentMaintenance?.admin_logins || '0') / 5) * 100)}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Authorized administrators currently active in system.</p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Downtime Health</span>
              <span className="font-bold dark:text-white">Optimal</span>
            </div>
            <div className="flex gap-1 h-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className={`flex-1 rounded-full ${i <= 8 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-medium">System impact assessment based on recent metrics.</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">System Activity Distribution</h3>
              <p className="text-xs text-slate-500 mt-1">Comparison between active requests and error logs</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Requests</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Errors</div>
            </div>
          </div>
          <div className="h-80 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                  <Area type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorErrors)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* Data Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          <div className="mb-8">
            <h3 className="font-bold text-slate-900 dark:text-white">Record Allocation</h3>
            <p className="text-xs text-slate-500 mt-1">Data weight by category</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-32 w-32 rounded-full border-8 border-slate-100 dark:border-slate-800 animate-pulse mx-auto" />
              )}
            </div>
            <div className="w-full space-y-3 mt-6">
              {distributionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold dark:text-white">{item.count} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Quick Actions & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> Administrative Quick-Launch
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Backup", icon: HardDrive, color: "bg-slate-100 dark:bg-slate-800" },
              { label: "User Audit", icon: Shield, color: "bg-blue-50 dark:bg-blue-950/20" },
              { label: "Data Export", icon: Download, color: "bg-emerald-50 dark:bg-emerald-950/20" },
              { label: "Clean Logs", icon: Trash2, color: "bg-rose-50 dark:bg-rose-950/20" }
            ].map((btn, i) => (
              <button key={i} className={`flex items-center gap-3 p-4 rounded-xl hover:shadow-md transition text-left group ${btn.color}`}>
                <btn.icon className="h-5 w-5 text-slate-500 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-100">
              <Layers className="h-4 w-4" /> System Health Status
            </h3>
            <p className="text-2xl font-black mb-4">Infrastructure is Healthy</p>
            <div className="space-y-4 mt-auto">
              <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                <span>CPU Load</span>
                <span>12%</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{ width: '12%' }} />
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                <span>RAM Usage</span>
                <span>4.2GB / 8GB</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{ width: '52.5%' }} />
              </div>
            </div>
          </div>
          <ActivitySquare className="absolute -bottom-12 -right-12 h-48 w-48 text-white/10" />
        </div>
      </div>
    </div>
  );
}

export function useDashboardData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const executeAction = async (action: string, payload: any) => {
    const loadingToast = toast.loading(`Executing ${action.replace('_', ' ')}...`);
    try {
      const res = await fetch("/api/super-admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload })
      });
      if (res.ok) {
        await fetchDashboard();
        toast.success("Action completed successfully!", { id: loadingToast });
      } else {
        toast.error("Action failed.", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Error executing action.", { id: loadingToast });
    }
  };

  return { data, loading, fetchDashboard, executeAction };
}

export function SuperAdminInsights() {
  const { data, loading } = useDashboardData();
  const c = data?.counts || { sessionCount: 0, alertCount: 0, errorCount: 0, healthAvg: 0 };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active User Sessions", count: loading ? "..." : c.sessionCount, color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20", icon: Users },
          { label: "Security Alerts", count: loading ? "..." : c.alertCount, color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/20", icon: ShieldAlert },
          { label: "System Errors", count: loading ? "..." : c.errorCount, color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20", icon: AlertTriangle },
          { label: "Health Metrics", count: loading ? "..." : (parseFloat(c.healthAvg).toFixed(1) + "%"), color: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20", icon: ActivitySquare }
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</span>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">{kpi.count}</h3>
              </div>
              <div className={`p-2.5 rounded-lg border ${kpi.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MaintenanceManager({ data: dashboardData, fetchDashboard }: { data: any; fetchDashboard: () => Promise<void> }) {
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any>({ records: [], pagination: { total: 0, limit: 10, offset: 0 } });
  const [analytics, setAnalytics] = useState<any>(null);
  const [monitor, setMonitor] = useState<any>(null);

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingMonitor, setLoadingMonitor] = useState(true);

  // Filters for History
  const [historyLimit] = useState(10);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [filterAction, setFilterAction] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form input states
  const [maintenanceMessage, setMaintenanceMessage] = useState("We are currently performing scheduled system upgrades to improve your experience. Please check back shortly.");
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [whitelist, setWhitelist] = useState("");
  const [disableNotes, setDisableNotes] = useState("Completed system maintenance operations and verified components.");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/system/maintenance/status?t=" + Date.now());
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
        if (json.data?.is_active) {
          setMaintenanceMessage(json.data.message || "");
          setEstimatedTime(json.data.estimated_minutes || 60);
          setWhitelist(json.data.whitelist ? json.data.whitelist.join(", ") : "");
        }
      }
    } catch (e) {
      console.error("Error fetching status:", e);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      let url = `/api/system/maintenance/history?limit=${historyLimit}&offset=${historyOffset}`;
      if (filterAction) url += `&action=${filterAction}`;
      if (filterFromDate) url += `&from_date=${filterFromDate}`;
      if (filterToDate) url += `&to_date=${filterToDate}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setHistory(json.data);
      }
    } catch (e) {
      console.error("Error fetching history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [historyLimit, historyOffset, filterAction, filterFromDate, filterToDate]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/system/maintenance/analytics");
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch (e) {
      console.error("Error fetching analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchMonitor = useCallback(async () => {
    try {
      const res = await fetch("/api/system/maintenance/monitor");
      const json = await res.json();
      if (json.success) {
        setMonitor(json.data);
      }
    } catch (e) {
      console.error("Error fetching monitor:", e);
    } finally {
      setLoadingMonitor(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoadingStatus(true);
    setLoadingAnalytics(true);
    setLoadingMonitor(true);
    await Promise.all([
      fetchStatus(),
      fetchHistory(),
      fetchAnalytics(),
      fetchMonitor(),
      fetchDashboard().catch(() => null)
    ]);
  }, [fetchStatus, fetchHistory, fetchAnalytics, fetchMonitor, fetchDashboard]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Status and monitor poller (every 15 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchStatus();
      fetchMonitor();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchStatus, fetchMonitor]);

  const handleEnable = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = whitelist.split(",").map(e => e.trim()).filter(Boolean);
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email formats: ${invalidEmails.slice(0, 2).join(", ")}`);
      return;
    }

    if (estimatedTime <= 0) {
      toast.error("Estimated completion time must be greater than 0");
      return;
    }

    const tId = toast.loading("Enabling system maintenance mode...");
    try {
      const userObj = JSON.parse(localStorage.getItem("edu_vision_remembered_user") || "{}");
      const res = await fetch("/api/system/maintenance/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: maintenanceMessage,
          estimated_time: estimatedTime,
          whitelist: emails.join(","),
          username: userObj.username || "super_admin",
          user_id: userObj.id || 1
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("System is now in maintenance mode!", { id: tId });
        setShowEnableModal(false);
        refreshAll();
      } else {
        toast.error(json.error || "Failed to enable maintenance.", { id: tId });
      }
    } catch (e: any) {
      toast.error(e.message || "Error communicating with server.", { id: tId });
    }
  };

  const handleDisable = async () => {
    const tId = toast.loading("Disabling system maintenance mode...");
    try {
      const userObj = JSON.parse(localStorage.getItem("edu_vision_remembered_user") || "{}");
      const res = await fetch("/api/system/maintenance/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: disableNotes,
          username: userObj.username || "super_admin",
          user_id: userObj.id || 1
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("System is back online successfully!", { id: tId });
        setShowDisableModal(false);
        refreshAll();
      } else {
        toast.error(json.error || "Failed to disable maintenance.", { id: tId });
      }
    } catch (e: any) {
      toast.error(e.message || "Error communicating with server.", { id: tId });
    }
  };

  const handleUpdateSettings = async () => {
    const emails = whitelist.split(",").map(e => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email formats: ${invalidEmails.slice(0, 2).join(", ")}`);
      return;
    }

    if (estimatedTime <= 0) {
      toast.error("Estimated completion time must be greater than 0");
      return;
    }

    const tId = toast.loading("Updating active maintenance settings...");
    try {
      const userObj = JSON.parse(localStorage.getItem("edu_vision_remembered_user") || "{}");
      const res = await fetch("/api/system/maintenance/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: maintenanceMessage,
          estimated_time: estimatedTime,
          whitelist: emails.join(","),
          username: userObj.username || "super_admin",
          user_id: userObj.id || 1
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Active maintenance configurations updated!", { id: tId });
        setShowSettingsModal(false);
        refreshAll();
      } else {
        toast.error(json.error || "Failed to update settings.", { id: tId });
      }
    } catch (e: any) {
      toast.error(e.message || "Error communicating with server.", { id: tId });
    }
  };

  // Monthly trend chart mapper
  const chartData = analytics?.monthly_breakdown 
    ? Object.entries(analytics.monthly_breakdown).map(([month, val]: any) => ({
        month,
        sessions: val.enabled || 0,
        avgDuration: Math.round(val.avg_duration || 0)
      })).reverse()
    : [
        { month: '2026-02', sessions: 2, avgDuration: 45 },
        { month: '2026-03', sessions: 1, avgDuration: 30 },
        { month: '2026-04', sessions: 4, avgDuration: 20 },
        { month: '2026-05', sessions: 3, avgDuration: 50 },
        { month: '2026-06', sessions: 2, avgDuration: 40 },
        { month: '2026-07', sessions: 1, avgDuration: 15 },
      ];

  const peakHours = analytics?.peak_hours || { "02:00": 3, "03:00": 1, "10:00": 2, "22:00": 1 };

  // Local filter for search query
  const filteredRecords = (history?.records || []).filter((rec: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rec.triggered_by || "").toLowerCase().includes(q) ||
      (rec.notes || "").toLowerCase().includes(q) ||
      (rec.message_used || "").toLowerCase().includes(q) ||
      (rec.action || "").toLowerCase().includes(q)
    );
  });

  const currentPage = Math.floor(historyOffset / historyLimit) + 1;
  const totalPages = Math.ceil((history?.pagination?.total || 0) / historyLimit) || 1;

  const handlePrevPage = () => {
    if (historyOffset > 0) {
      setHistoryOffset(Math.max(0, historyOffset - historyLimit));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setHistoryOffset(historyOffset + historyLimit);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Maintenance Status & Monitoring Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Dashboard Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-500" /> System Maintenance Panel
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                status?.is_active 
                  ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30 animate-pulse" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status?.is_active ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                {status?.is_active ? "Active" : "Standby"}
              </span>
            </div>

            {loadingStatus ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : status?.is_active ? (
              <div className="space-y-4">
                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100/50 dark:border-rose-900/20 text-xs">
                  <p className="font-bold text-rose-800 dark:text-rose-400">Broadcasting Message:</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 italic">&ldquo;{status.message}&rdquo;</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Started</span>
                    <p className="text-xs font-bold dark:text-white mt-0.5">
                      {status.started_at ? new Date(status.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Elapsed</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{status.elapsed_minutes || "0"} min</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining</span>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">~{status.remaining_minutes || "0"} min</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blocked Reqs</span>
                    <p className="text-xs font-bold text-rose-600 mt-0.5">{status.total_blocked_attempts || 0}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progress Countdown</span>
                    <span>{status.remaining_minutes > 0 ? `${Math.round((status.elapsed_minutes / (status.elapsed_minutes + status.remaining_minutes)) * 100)}%` : "100%"}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500" 
                      style={{ 
                        width: `${status.remaining_minutes > 0 ? Math.min(100, Math.round((status.elapsed_minutes / (status.elapsed_minutes + status.remaining_minutes)) * 100)) : 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">System is currently online and running smoothly.</p>
                <p className="text-[10px] text-slate-400">When maintenance is enabled, public routes will safely route visitors to a beautiful maintenance message screen, while administrators remain whitelisted.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-2 justify-between items-center">
            <button 
              onClick={refreshAll}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <div className="flex gap-2">
              {status?.is_active ? (
                <>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Update Settings
                  </button>
                  <button 
                    onClick={() => setShowDisableModal(true)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-rose-500/10"
                  >
                    Disable Maintenance
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowEnableModal(true)}
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-500/10"
                >
                  Enable Maintenance Mode
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Monitor Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <ActivitySquare className="h-4 w-4 text-emerald-500" /> Maintenance Monitor
              </h3>
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 px-2 py-0.5 rounded uppercase">Live</span>
            </div>

            {loadingMonitor ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-lg font-black text-rose-600">{monitor?.blocked_attempts_last_hour || 0}</p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Blocked Last Hour</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-lg font-black text-blue-600">{(monitor?.active_admin_sessions || []).length || 0}</p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Active Admins</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recent Security Actions</p>
                  {(monitor?.recent_activities || []).slice(0, 4).length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center">No monitoring activities detected.</p>
                  ) : (
                    monitor.recent_activities.slice(0, 4).map((act: any, i: number) => (
                      <div key={i} className="flex items-start justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px]">
                        <div>
                          <span className={`font-extrabold uppercase px-1.5 py-0.5 rounded mr-1.5 text-[8px] ${
                            act.action.includes('blocked') ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30'
                          }`}>
                            {act.action}
                          </span>
                          <span className="dark:text-slate-300 font-medium">{act.details || `User ${act.user}`}</span>
                        </div>
                        <span className="text-slate-400 font-mono shrink-0 ml-2">{new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-[9px] text-slate-400 font-medium mt-4">Real-time status is refreshed automatically every 15 seconds to track administrative movements and access controls.</p>
        </div>
      </div>

      {/* 2. Analytics Dashboard Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <BarChart className="h-4 w-4 text-blue-500" /> Maintenance Analytics Dashboard
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical Performance</span>
        </div>

        {loadingAnalytics ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Events", value: analytics?.summary?.total_events || 0, icon: RefreshCw, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
                { label: "Avg Duration", value: `${Math.round(analytics?.summary?.avg_duration_minutes || 0)}m`, icon: Clock, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
                { label: "Total Blocked", value: analytics?.summary?.total_blocked_attempts || 0, icon: ShieldAlert, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/20" },
                { label: "Total Admin Logins", value: analytics?.summary?.total_admin_logins || 0, icon: User, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Trend AreaChart */}
              <div className="lg:col-span-2 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Maintenance Durations & Toggles</p>
                <div className="h-64 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Area type="monotone" name="Avg Duration (min)" dataKey="avgDuration" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peak hours or hourly stats */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peak Deployment Hours</p>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800 h-64 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {Object.entries(peakHours).slice(0, 4).map(([hour, count]: any, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>{hour} Deployment Window</span>
                          <span>{count} maintenance triggers</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (count / 5) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed italic border-t border-slate-200 dark:border-slate-800 pt-3">Deploying maintenance schedules outside high academic traffic (peak hours are mostly early morning hours) improves student and teacher user experience.</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 3. Paginated, Searchable Maintenance History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <History className="h-4 w-4 text-blue-500" /> Maintenance History Tracking Logs
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total: {history?.pagination?.total || 0} Events</span>
        </div>

        {/* Filters and Search toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Search query</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notes, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Filter Action</label>
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setHistoryOffset(0); }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">All Actions</option>
              <option value="ENABLED">ENABLED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">From Date</label>
            <input 
              type="date"
              value={filterFromDate}
              onChange={(e) => { setFilterFromDate(e.target.value); setHistoryOffset(0); }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">To Date</label>
            <input 
              type="date"
              value={filterToDate}
              onChange={(e) => { setFilterToDate(e.target.value); setHistoryOffset(0); }}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <button 
              onClick={() => {
                setFilterAction("");
                setFilterFromDate("");
                setFilterToDate("");
                setSearchQuery("");
                setHistoryOffset(0);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* The actual table */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Triggered By</th>
                  <th className="px-4 py-2.5">Duration</th>
                  <th className="px-4 py-2.5">Blocked</th>
                  <th className="px-4 py-2.5">Notes & Configuration Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loadingHistory ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">No maintenance sessions found matching the filter criteria.</td>
                  </tr>
                ) : (
                  filteredRecords.map((rec: any) => (
                    <tr key={rec.history_id} className="hover:bg-white dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-4 py-3 text-[10px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(rec.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${
                          rec.action === 'ENABLED' || rec.action === 'STARTED'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' 
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        }`}>
                          {rec.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{rec.triggered_by}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{rec.triggered_by_ip || 'internal'}</p>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono font-bold">
                        {rec.action === 'DISABLED' ? `${rec.duration_minutes || 0} min` : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${rec.blocked_attempts > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {rec.blocked_attempts || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate" title={rec.notes}>
                        {rec.notes || rec.message_used || "No extra configuration notes recorded."}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <p className="text-slate-400">Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></p>
          <div className="flex gap-2">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loadingHistory}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 font-bold rounded-lg disabled:opacity-50 transition"
            >
              Previous
            </button>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loadingHistory}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 font-bold rounded-lg disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* 4. MODAL COMPONENT: ENABLE MAINTENANCE */}
      {showEnableModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-rose-50/20 dark:bg-rose-950/10">
              <h3 className="text-base font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Enable System Maintenance Mode
              </h3>
              <p className="text-xs text-rose-600 mt-1">This will temporarily route all public educational logins and data collection access to the maintenance screen.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Public Maintenance Message Broadcast</label>
                <textarea 
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="System maintenance in progress. Estimated completion: 2 hours."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 h-24 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Duration (Minutes)</label>
                  <input 
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                    min={5}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <p className="text-[10px] text-slate-400 leading-normal">The countdown progress bar and estimated completion timestamp on the public screen will automatically adjust based on this value.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Administrative Email Whitelist</label>
                <input 
                  type="text"
                  value={whitelist}
                  onChange={(e) => setWhitelist(e.target.value)}
                  placeholder="admin@system.com, super_admin@education.gov.bw"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
                <p className="text-[9px] text-slate-400">Comma-separated emails. Whitelisted accounts bypass the guard blocks seamlessly.</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button 
                onClick={() => setShowEnableModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleEnable}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-500/15"
              >
                Confirm Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL COMPONENT: DISABLE MAINTENANCE */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/10">
              <h3 className="text-base font-extrabold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Disable System Maintenance Mode
              </h3>
              <p className="text-xs text-blue-600 mt-1">This will restore normal operations, allowing students, school heads, and the general public full access to registries and portals.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Administrative Logs / Closure Notes</label>
                <textarea 
                  value={disableNotes}
                  onChange={(e) => setDisableNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 h-24 font-medium"
                />
                <p className="text-[9px] text-slate-400">Describe actions executed (e.g., database upgrades, patch fixes) for complete administrative audits.</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button 
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDisable}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/15"
              >
                Confirm Disable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL COMPONENT: UPDATE ACTIVE SETTINGS */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Update Active Maintenance Configurations
              </h3>
              <p className="text-xs text-slate-500 mt-1">Dynamically modify system configurations and whistle-lists during current session.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Broadcasting Message</label>
                <textarea 
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 h-24 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Duration (Minutes)</label>
                  <input 
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                    min={5}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <p className="text-[10px] text-slate-400">Changing estimated time dynamically calculates and shifts expected downtime back or forward immediately.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Administrative Email Whitelist</label>
                <input 
                  type="text"
                  value={whitelist}
                  onChange={(e) => setWhitelist(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateSettings}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/15"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuperAdminConfig() {
  const { data, loading, executeAction, fetchDashboard } = useDashboardData();
  const [activeCategory, setActiveCategory] = useState("maintenance");
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [configGroups, setConfigGroups] = useState<Record<string, string>>({});
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const configList = React.useMemo(() => data?.config || [], [data?.config]);

  useEffect(() => {
    if (configList.length > 0 && modifiedKeys.size === 0) {
      const vals: Record<string, string> = {};
      const groups: Record<string, string> = {};
      configList.forEach((c: any) => {
        vals[c.config_key] = c.config_value;
        groups[c.config_key] = c.config_group;
      });
      setLocalValues(vals);
      setConfigGroups(groups);
    }
  }, [configList, modifiedKeys.size]);

  const categories = [
    { id: "maintenance", label: "System Maintenance", icon: Wrench, description: "Manage system downtime and maintenance mode." },
    { id: "security", label: "Security & Authentication", icon: Lock, description: "Password policies and multi-factor authentication." },
    { id: "session", label: "Session Management", icon: Timer, description: "User session and timeout settings." },
    { id: "school", label: "School Configuration", icon: School, description: "Registration and school management defaults." },
    { id: "academic", label: "Academic Configuration", icon: GraduationCap, description: "Academic years, terms, and date settings." },
    { id: "reports", label: "Reports Configuration", icon: BarChart, description: "Format, branding, and export limitations." },
    { id: "email", label: "Email & Notifications", icon: Mail, description: "SMTP settings and notification preferences." },
    { id: "data", label: "Data Management", icon: Folder, description: "Retention, cleanup, and archival policies." },
    { id: "backup", label: "Backup Configuration", icon: HardDrive, description: "Automated backups and storage settings." },
    { id: "general", label: "General Settings", icon: Globe, description: "Timezone, date formats, and localization." },
    { id: "ui", label: "UI & Theme", icon: Palette, description: "System branding and interface customization." },
    { id: "api", label: "API & Integrations", icon: Link, description: "Rate limits and third-party integrations." },
  ];

  const handleLocalUpdate = (key: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
    setModifiedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const handleApply = async () => {
    if (modifiedKeys.size === 0) return;
    setIsSaving(true);
    try {
      const configsToUpdate = Array.from(modifiedKeys).map(key => ({
        config_key: key,
        config_value: localValues[key],
        config_group: configGroups[key] || activeCategory.toUpperCase()
      }));
      
      await executeAction('update_config', { configs: configsToUpdate });
      setModifiedKeys(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSetting = (label: string, key: string, type: "text" | "number" | "toggle" | "dropdown" | "textarea" | "color" | "time" | "date", options?: any) => {
    const value = localValues[key] || "";
    const isModified = modifiedKeys.has(key);
    
    return (
      <div className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${isModified ? "bg-amber-50/30 dark:bg-amber-950/10 px-2 -mx-2 rounded-lg" : ""}`}>
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</label>
            {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Unsaved change" />}
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase">{key}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {type === "toggle" ? (
            <button 
              onClick={() => handleLocalUpdate(key, value === "TRUE" ? "FALSE" : "TRUE")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                value === "TRUE" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value === "TRUE" ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          ) : type === "dropdown" ? (
            <select 
              value={value}
              onChange={(e) => handleLocalUpdate(key, e.target.value)}
              className="w-full sm:w-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Select...</option>
              {options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : type === "textarea" ? (
            <textarea 
              value={value}
              onChange={(e) => handleLocalUpdate(key, e.target.value)}
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 transition-all h-20"
            />
          ) : (
            <input 
              type={type}
              value={value}
              onChange={(e) => handleLocalUpdate(key, e.target.value)}
              className="w-full sm:w-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 transition-all"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn relative">
      {/* Sidebar Navigation */}
      <div className="lg:w-72 shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-6">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Configuration Groups</h4>
          </div>
          <nav className="p-2 space-y-0.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition group ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
                  <span className="text-xs font-bold">{cat.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />}
                </button>
              );
            })}
          </nav>
          
          {modifiedKeys.size > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/30">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" /> {modifiedKeys.size} Unsaved Changes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600">
                {React.createElement(categories.find(c => c.id === activeCategory)?.icon || Settings, { className: "h-5 w-5" })}
              </div>
              <h3 className="text-lg font-extrabold dark:text-white">
                {categories.find(c => c.id === activeCategory)?.label}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {categories.find(c => c.id === activeCategory)?.description}
            </p>
          </div>

          <div className="p-6">
            {activeCategory === "maintenance" && (
              <MaintenanceManager data={data} fetchDashboard={fetchDashboard} />
            )}

            {activeCategory === "security" && (
              <div className="space-y-2">
                {renderSetting("Password Minimum Length", "PASSWORD_MIN_LENGTH", "number")}
                <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-3">Password Requirements</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Uppercase", "Lowercase", "Numbers", "Special Characters"].map(req => (
                      <div key={req} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                        <input type="checkbox" id={`pw-${req}`} defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor={`pw-${req}`} className="text-xs font-medium dark:text-slate-300 cursor-pointer">{req}</label>
                      </div>
                    ))}
                  </div>
                </div>
                {renderSetting("Password Expiry Days", "PASSWORD_EXPIRY_DAYS", "number")}
                {renderSetting("Password History Count", "PASSWORD_HISTORY_COUNT", "number")}
                {renderSetting("Max Login Attempts", "MAX_LOGIN_ATTEMPTS", "number")}
                {renderSetting("Login Lockout Minutes", "LOGIN_LOCKOUT_MINS", "number")}
                {renderSetting("Two-Factor Authentication", "ENABLE_2FA", "toggle")}
                {renderSetting("2FA Method", "2FA_METHOD", "dropdown", [
                  { value: "EMAIL", label: "Email" },
                  { value: "SMS", label: "SMS" },
                  { value: "AUTHENTICATOR", label: "Authenticator App" }
                ])}
              </div>
            )}

            {activeCategory === "session" && (
              <div className="space-y-2">
                {renderSetting("Max Concurrent Sessions", "MAX_CONCURRENT_SESSIONS", "number")}
                {renderSetting("Session Timeout Minutes", "SESSION_TIMEOUT_MINS", "number")}
                {renderSetting("Idle Timeout Minutes", "IDLE_TIMEOUT_MINS", "number")}
                {renderSetting("Remember Me Days", "REMEMBER_ME_DAYS", "number")}
                {renderSetting("Force Logout on Role Change", "FORCE_LOGOUT_ROLE_CHANGE", "toggle")}
              </div>
            )}

            {activeCategory === "school" && (
              <div className="space-y-2">
                {renderSetting("Max Schools Per Region", "MAX_SCHOOLS_PER_REGION", "number")}
                {renderSetting("Auto-Approve Registration", "AUTO_APPROVE_REGISTRATION", "toggle")}
                {renderSetting("Require Documentation", "REQUIRE_REGISTRATION_DOCS", "toggle")}
                {renderSetting("Registration Number Prefix", "REG_NUMBER_PREFIX", "text")}
                {renderSetting("Registration Number Format", "REG_NUMBER_FORMAT", "text")}
                {renderSetting("Default School Type", "DEFAULT_SCHOOL_TYPE", "dropdown", [
                  { value: "GOVERNMENT", label: "Government" },
                  { value: "PRIVATE", label: "Private" },
                  { value: "AIDED", label: "Aided" },
                  { value: "CHURCH", label: "Church" },
                  { value: "COMMUNITY", label: "Community" },
                  { value: "NGO", label: "NGO" }
                ])}
                {renderSetting("Max Students Per School", "MAX_STUDENTS_PER_SCHOOL", "number")}
                {renderSetting("Max Staff Per School", "MAX_STAFF_PER_SCHOOL", "number")}
              </div>
            )}

            {activeCategory === "academic" && (
              <div className="space-y-2">
                {renderSetting("Current Academic Year", "CURRENT_ACADEMIC_YEAR", "dropdown", [
                  { value: "2025-2026", label: "2025-2026" },
                  { value: "2026-2027", label: "2026-2027" }
                ])}
                {renderSetting("Current Term", "CURRENT_TERM", "dropdown", [
                  { value: "1", label: "Term 1" },
                  { value: "2", label: "Term 2" },
                  { value: "3", label: "Term 3" }
                ])}
                {renderSetting("Default Academic Year Start Date", "ACADEMIC_YEAR_START", "date")}
                {renderSetting("Default Academic Year End Date", "ACADEMIC_YEAR_END", "date")}
                {renderSetting("Term Duration (Weeks)", "TERM_DURATION_WEEKS", "number")}
                {renderSetting("Allow Year Overlap", "ALLOW_YEAR_OVERLAP", "toggle")}
              </div>
            )}

            {activeCategory === "reports" && (
              <div className="space-y-2">
                {renderSetting("Default Report Format", "DEFAULT_REPORT_FORMAT", "dropdown", [
                  { value: "PDF", label: "PDF" },
                  { value: "EXCEL", label: "Excel" },
                  { value: "CSV", label: "CSV" }
                ])}
                <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="max-w-md">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Brand Logo</label>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-tighter">REPORT_BRAND_LOGO</p>
                  </div>
                  <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 transition-all flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5" /> Change Image
                  </button>
                </div>
                {renderSetting("Footer Text", "REPORT_FOOTER_TEXT", "text")}
                {renderSetting("Pagination Limit", "REPORT_PAGINATION_LIMIT", "number")}
                {renderSetting("Max Export Rows", "REPORT_MAX_EXPORT_ROWS", "number")}
                {renderSetting("Include Audit Trail", "REPORT_INCLUDE_AUDIT", "toggle")}
                {renderSetting("Default Date Range", "REPORT_DEFAULT_RANGE", "dropdown", [
                  { value: "TODAY", label: "Today" },
                  { value: "WEEK", label: "Current Week" },
                  { value: "MONTH", label: "Current Month" },
                  { value: "YEAR", label: "Current Year" },
                  { value: "CUSTOM", label: "Custom" }
                ])}
              </div>
            )}

            {activeCategory === "email" && (
              <div className="space-y-2">
                {renderSetting("SMTP Host", "SMTP_HOST", "text")}
                {renderSetting("SMTP Port", "SMTP_PORT", "number")}
                {renderSetting("SMTP Encryption", "SMTP_ENCRYPTION", "dropdown", [
                  { value: "TLS", label: "TLS" },
                  { value: "SSL", label: "SSL" },
                  { value: "NONE", label: "None" }
                ])}
                {renderSetting("SMTP Username", "SMTP_USERNAME", "text")}
                {renderSetting("SMTP Password", "SMTP_PASSWORD", "text")}
                {renderSetting("From Email", "SMTP_FROM_EMAIL", "text")}
                {renderSetting("From Name", "SMTP_FROM_NAME", "text")}
                {renderSetting("Allow Mass Emails", "ALLOW_MASS_EMAILS", "toggle")}
                {renderSetting("Max Recipients Per Batch", "SMTP_MAX_RECIPIENTS", "number")}
                {renderSetting("Enable Email Logging", "ENABLE_EMAIL_LOGGING", "toggle")}
              </div>
            )}

            {activeCategory === "data" && (
              <div className="space-y-2">
                {renderSetting("Audit Retention Days", "AUDIT_RETENTION_DAYS", "number")}
                {renderSetting("Deleted Records Retention Days", "DELETED_RETENTION_DAYS", "number")}
                {renderSetting("Auto Cleanup", "ENABLE_AUTO_CLEANUP", "toggle")}
                {renderSetting("Cleanup Frequency", "CLEANUP_FREQUENCY", "dropdown", [
                  { value: "DAILY", label: "Daily" },
                  { value: "WEEKLY", label: "Weekly" },
                  { value: "MONTHLY", label: "Monthly" }
                ])}
                {renderSetting("Archive Old Years", "ARCHIVE_OLD_YEARS", "toggle")}
              </div>
            )}

            {activeCategory === "backup" && (
              <div className="space-y-2">
                {renderSetting("Auto Backup", "ENABLE_AUTO_BACKUP", "toggle")}
                {renderSetting("Backup Frequency", "BACKUP_FREQUENCY", "dropdown", [
                  { value: "DAILY", label: "Daily" },
                  { value: "WEEKLY", label: "Weekly" },
                  { value: "MONTHLY", label: "Monthly" }
                ])}
                {renderSetting("Auto Backup Time", "AUTO_BACKUP_TIME", "time")}
                {renderSetting("Retention Days", "BACKUP_RETENTION_DAYS", "number")}
                {renderSetting("Storage Location", "BACKUP_STORAGE_LOCATION", "text")}
              </div>
            )}

            {activeCategory === "general" && (
              <div className="space-y-2">
                {renderSetting("Timezone", "SYSTEM_TIMEZONE", "dropdown", [
                  { value: "Africa/Gaborone", label: "Africa/Gaborone" },
                  { value: "UTC", label: "UTC" },
                  { value: "Europe/London", label: "Europe/London" }
                ])}
                {renderSetting("Date Format", "DATE_FORMAT", "dropdown", [
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                  { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
                  { value: "MM-DD-YYYY", label: "MM-DD-YYYY" }
                ])}
                {renderSetting("Time Format", "TIME_FORMAT", "dropdown", [
                  { value: "12", label: "12-hour" },
                  { value: "24", label: "24-hour" }
                ])}
                {renderSetting("Currency Code", "CURRENCY_CODE", "dropdown", [
                  { value: "BWP", label: "BWP (Pula)" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" }
                ])}
                {renderSetting("Currency Symbol", "CURRENCY_SYMBOL", "text")}
              </div>
            )}

            {activeCategory === "ui" && (
              <div className="space-y-2">
                {renderSetting("Theme", "DEFAULT_THEME", "dropdown", [
                  { value: "LIGHT", label: "Light" },
                  { value: "DARK", label: "Dark" },
                  { value: "SYSTEM", label: "System" }
                ])}
                {renderSetting("Primary Color", "PRIMARY_COLOR", "color")}
                {renderSetting("Sidebar Collapsed", "SIDEBAR_COLLAPSED", "toggle")}
                {renderSetting("Dashboard Layout", "DASHBOARD_LAYOUT", "dropdown", [
                  { value: "GRID", label: "Grid" },
                  { value: "LIST", label: "List" }
                ])}
                {renderSetting("Table Pagination Size", "TABLE_PAGE_SIZE", "dropdown", [
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                  { value: "100", label: "100" }
                ])}
                {renderSetting("Show Demo Banner", "SHOW_DEMO_BANNER", "toggle")}
              </div>
            )}

            {activeCategory === "api" && (
              <div className="space-y-2">
                {renderSetting("Rate Limit (Req/Min)", "API_RATE_LIMIT", "number")}
                {renderSetting("Enable API Logging", "ENABLE_API_LOGGING", "toggle")}
                <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="max-w-md">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">API Version</label>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">SYSTEM_API_VERSION</p>
                  </div>
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 font-bold">v3.5.2-stable</span>
                </div>
                {renderSetting("Allow CORS", "ALLOW_CORS", "toggle")}
                {renderSetting("CORS Allowed Origins", "CORS_ORIGINS", "text")}
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {modifiedKeys.size > 0 ? "You have unsaved changes" : "System settings are up to date"}
              </span>
            </div>
            <button 
              onClick={handleApply}
              disabled={modifiedKeys.size === 0 || isSaving}
              className={`px-4 py-2 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2 ${
                modifiedKeys.size > 0 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? <ActivitySquare className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isSaving ? "Saving..." : "Apply Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminData() {
  const { data, loading, executeAction } = useDashboardData();
  const backups = data?.backups || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Data Management</h3>
        <p className="text-slate-500 text-sm mb-6">Manage system backups, archives, and bulk imports/exports.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div onClick={() => executeAction('create_backup', {})} className="border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:shadow-sm transition group">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-full group-hover:scale-110 transition"><Database className="h-6 w-6" /></div>
            <span className="text-sm font-semibold dark:text-white">Create System Backup</span>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500 hover:shadow-sm transition group">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full group-hover:scale-110 transition"><Upload className="h-6 w-6" /></div>
            <span className="text-sm font-semibold dark:text-white">Import Records</span>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-amber-500 hover:shadow-sm transition group">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-full group-hover:scale-110 transition"><Download className="h-6 w-6" /></div>
            <span className="text-sm font-semibold dark:text-white">Export System Data</span>
          </div>
        </div>

        <h4 className="font-semibold text-sm mb-3 dark:text-slate-300 flex items-center gap-2"><Database className="w-4 h-4"/> Recent system_backups</h4>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 px-4 text-slate-500">Backup Name</th>
                <th className="py-2 px-4 text-slate-500">Type</th>
                <th className="py-2 px-4 text-slate-500">Path</th>
                <th className="py-2 px-4 text-slate-500">Date</th>
                <th className="py-2 px-4 text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? <tr><td colSpan={5} className="py-4 text-center">Loading...</td></tr> : 
               backups.length === 0 ? <tr><td colSpan={5} className="py-4 text-center text-slate-500">No backups found.</td></tr> :
               backups.map((bak: any) => (
                <tr key={bak.backup_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono">{bak.backup_name}</td>
                  <td className="py-2 px-4">{bak.backup_type}</td>
                  <td className="py-2 px-4">{bak.backup_file_path}</td>
                  <td className="py-2 px-4">{new Date(bak.backup_started_at).toLocaleString()}</td>
                  <td className="py-2 px-4"><span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded font-bold text-[10px]">{bak.backup_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminSecurity() {
  const { data, loading, executeAction } = useDashboardData();
  const whitelist = data?.whitelist || [];
  const alerts = data?.alerts || [];
  const sessions = data?.sessions || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Security & Monitoring</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* IP Whitelist Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h4 className="font-semibold text-sm dark:text-white flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500"/> ip_whitelist</h4>
              <button 
                onClick={() => {
                  const ip = prompt("Enter IP Address:");
                  if (!ip) return;
                  const desc = prompt("Enter Description:");
                  executeAction('add_ip', { ip_address: ip, description: desc || "Added manually" });
                }}
                className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-1 rounded font-bold">+ Add IP</button>
            </div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {whitelist.length === 0 ? <tr><td colSpan={3} className="py-2 px-4 text-slate-500">No whitelisted IPs.</td></tr> :
                 whitelist.map((ip: any) => (
                  <tr key={ip.whitelist_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-4 font-mono text-slate-600 dark:text-slate-400">{ip.ip_address}</td>
                    <td className="py-2 px-4 text-slate-500">{ip.description}</td>
                    <td className="py-2 px-4 text-right">
                      <button onClick={() => executeAction('remove_ip', { ip_address: ip.ip_address })} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-3 h-3"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Security Alerts Table */}
          <div className="border border-rose-200 dark:border-rose-900/50 rounded-xl overflow-hidden">
            <div className="bg-rose-50 dark:bg-rose-950/20 px-4 py-3 border-b border-rose-100 dark:border-rose-900/50">
              <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-400 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> security_alerts</h4>
            </div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-rose-50 dark:divide-rose-900/30">
                {alerts.length === 0 ? <tr><td colSpan={2} className="py-3 px-4 text-slate-500">No recent alerts.</td></tr> :
                 alerts.map((al: any) => (
                  <tr key={al.alert_id} className="hover:bg-rose-50/50 dark:hover:bg-rose-950/40">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-rose-700 dark:text-rose-300">{al.alert_type}</p>
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70">{al.alert_message} from {al.ip_address}</p>
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] text-rose-500">
                      {!al.is_resolved && (
                        <button onClick={() => executeAction('resolve_alert', { alert_id: al.alert_id })} className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-2 py-1 rounded">Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Sessions Table */}
        <h4 className="font-semibold text-sm mb-3 dark:text-slate-300 flex items-center gap-2"><Users className="w-4 h-4"/> user_sessions (Active)</h4>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 px-4 text-slate-500">Session ID</th>
                <th className="py-2 px-4 text-slate-500">IP Address</th>
                <th className="py-2 px-4 text-slate-500">Browser/Device</th>
                <th className="py-2 px-4 text-slate-500">Started</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.length === 0 ? <tr><td colSpan={5} className="py-4 text-center text-slate-500">No active sessions.</td></tr> :
               sessions.map((sess: any) => (
                <tr key={sess.session_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold dark:text-slate-200">Session {sess.session_id}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{sess.ip_address || "N/A"}</td>
                  <td className="py-3 px-4 text-slate-500">{sess.user_agent ? sess.user_agent.substring(0, 30) + '...' : 'Unknown'}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(sess.login_time).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => executeAction('terminate_session', { session_id: sess.session_id })} className="text-rose-600 font-semibold text-[10px] bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded">Terminate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminHealth() {
  const { data, loading } = useDashboardData();
  const errors = data?.errors || [];
  const health = data?.health || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 dark:text-white">System Health & Error Logs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center justify-between p-4 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-xl">
            <div className="flex items-center gap-3">
              <Server className="text-emerald-500 w-8 h-8" />
              <div>
                <p className="font-bold text-sm text-emerald-900 dark:text-emerald-400">Database</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-600">Response: {health.find((h:any) => h.metric_name === 'db_latency')?.metric_value || '12'}ms</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-xl">
            <div className="flex items-center gap-3">
              <ActivitySquare className="text-emerald-500 w-8 h-8" />
              <div>
                <p className="font-bold text-sm text-emerald-900 dark:text-emerald-400">API Gateway</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-600">Uptime: {health.find((h:any) => h.metric_name === 'uptime')?.metric_value || '99.9'}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-500 w-8 h-8" />
              <div>
                <p className="font-bold text-sm dark:text-slate-200">system_health_metrics</p>
                <p className="text-xs text-slate-500">Storage: {health.find((h:any) => h.metric_name === 'storage_used')?.metric_value || '78'}% utilized</p>
              </div>
            </div>
          </div>
        </div>

        <h4 className="font-semibold text-sm mb-3 dark:text-slate-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> system_error_logs</h4>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 px-4 text-slate-500">Timestamp</th>
                <th className="py-2 px-4 text-slate-500">Level</th>
                <th className="py-2 px-4 text-slate-500">Message</th>
                <th className="py-2 px-4 text-slate-500">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {errors.length === 0 ? <tr><td colSpan={4} className="py-4 text-center text-slate-500">No error logs found.</td></tr> :
               errors.map((err: any) => (
                <tr key={err.error_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-slate-500">{new Date(err.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${err.severity === 'ERROR' || err.severity === 'CRITICAL' ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/30' : 'text-amber-700 bg-amber-50 dark:bg-amber-950/30'}`}>
                      {err.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium dark:text-slate-300">{err.error_message}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{err.error_file || err.request_url || "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Keeping Reference, Academic, and Regions identical to previous (static data)
export function SuperAdminReference() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-fadeIn">
      <h3 className="text-lg font-bold mb-4 dark:text-white">Reference Data Management</h3>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
            <th className="py-3 px-4 font-semibold">Category</th>
            <th className="py-3 px-4 font-semibold">Records Count</th>
            <th className="py-3 px-4 font-semibold">Description</th>
            <th className="py-3 px-4 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="py-3 px-4 font-semibold dark:text-slate-200">Subjects</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold">24</span></td>
            <td className="py-3 px-4 text-xs text-slate-500">Academic subjects curriculum list</td>
            <td className="py-3 px-4 text-right"><button className="text-blue-600 text-xs font-semibold">Manage</button></td>
          </tr>
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="py-3 px-4 font-semibold dark:text-slate-200">Grades / Forms</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold">12</span></td>
            <td className="py-3 px-4 text-xs text-slate-500">Primary and Secondary grades</td>
            <td className="py-3 px-4 text-right"><button className="text-blue-600 text-xs font-semibold">Manage</button></td>
          </tr>
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="py-3 px-4 font-semibold dark:text-slate-200">School Types</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold">5</span></td>
            <td className="py-3 px-4 text-xs text-slate-500">Government, Private, Aided, etc.</td>
            <td className="py-3 px-4 text-right"><button className="text-blue-600 text-xs font-semibold">Manage</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SuperAdminAcademic() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-fadeIn">
      <h3 className="text-lg font-bold mb-6 dark:text-white">Academic Management</h3>
      
      <h4 className="text-sm font-semibold mb-3 dark:text-slate-300">Active Academic Session</h4>
      <div className="flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-8">
        <div className="flex-1">
          <h4 className="text-xl font-extrabold text-blue-900 dark:text-blue-300">2026-2027</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Term 1 • Starts: Jan 10 • Ends: Apr 15</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition">Manage Terms</button>
      </div>

      <h4 className="text-sm font-semibold mb-3 dark:text-slate-300">Academic Years History</h4>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-2 px-4 text-slate-500 font-semibold">Year Name</th>
            <th className="py-2 px-4 text-slate-500 font-semibold">Status</th>
            <th className="py-2 px-4 text-slate-500 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="py-3 px-4 font-semibold dark:text-slate-200">2025-2026</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded text-[10px] font-bold">Closed</span></td>
            <td className="py-3 px-4 text-right"><button className="text-blue-600 font-semibold">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SuperAdminRegions({ currentUser }: { currentUser?: any }) {
  const userRegion = currentUser?.region && currentUser.region !== "All" ? currentUser.region : null;
  const [selectedRegion, setSelectedRegion] = useState<string>(userRegion || "Central");
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const regionSubregions: Record<string, string[]> = {
    "Central": ["Serowe", "Palapye", "Mahalapye", "Bobonong", "Tutume"],
    "Chobe": ["Kasane", "Pandamatenga"],
    "Gantsi": ["Ghanzi", "Charles Hill"],
    "Kgalagadi": ["Tshabong", "Hukuntsi"],
    "Kgatleng": ["Mochudi", "Artesia"],
    "Kweneng": ["Molepolole", "Letlhakeng"],
    "North East": ["Masunga", "Francistown"],
    "North West": ["Maun", "Gumare", "Shakawe"],
    "South": ["Kanye", "Moshupa", "Goodhope"],
    "South East": ["Gaborone", "Ramotswa", "Tlokweng"]
  };

  const userSubRegion = currentUser?.sub_region && currentUser.sub_region !== "All" ? currentUser.sub_region : null;
  const subregions = userSubRegion
    ? (regionSubregions[selectedRegion] || []).filter(sr => sr.toLowerCase() === userSubRegion.toLowerCase())
    : (regionSubregions[selectedRegion] || []);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/regional-admin/dashboard?region=${encodeURIComponent(selectedRegion)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSchools(json.schoolsList || []);
        }
      }
    } catch (e) {
      console.error("Error fetching schools for region:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.sub_district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubRegion = userSubRegion
      ? s.sub_district.toLowerCase() === userSubRegion.toLowerCase()
      : true;
    return matchesSearch && matchesSubRegion;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold dark:text-white">School & Region Management</h3>
          <p className="text-slate-500 text-sm mt-1">
            {userRegion ? `Viewing subregions and schools for your assigned ${selectedRegion} Region.` : "Manage educational regions, subregions, and registrations."}
          </p>
        </div>

        {/* Region Selector */}
        {!userRegion && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer outline-none"
            >
              {Object.keys(regionSubregions).map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sub-regions */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h4 className="font-semibold text-sm dark:text-white">
              {selectedRegion} Region Sub-regions ({subregions.length})
            </h4>
            {userRegion && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded border border-blue-100 dark:border-blue-900/30 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> Locked to Assigned Region
              </span>
            )}
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {subregions.map(subreg => {
              const count = schools.filter(s => s.sub_district.toLowerCase() === subreg.toLowerCase()).length;
              return (
                <li key={subreg} className="px-4 py-3.5 text-sm flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{subreg} Sub-district</span>
                  <span className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-900 border border-slate-250/20 px-2 py-1 rounded">
                    {count} {count === 1 ? "school" : "schools"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Column: Schools List */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-900">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-semibold text-sm dark:text-white">
              Schools in {selectedRegion} Region ({schools.length})
            </h4>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-40"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-96 divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                <p className="text-xs text-slate-500">Querying regional school list...</p>
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No schools found in this region matching search criteria.
              </div>
            ) : (
              filteredSchools.map(school => (
                <div key={school.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition duration-150">
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <School className="h-3.5 w-3.5 text-blue-500" />
                      {school.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>{school.sub_district}</span>
                      <span>•</span>
                      <span>{school.level}</span>
                      <span>•</span>
                      <span>{school.type}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    school.status === "Complete" 
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                      : school.status === "Partial"
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                  }`}>
                    {school.status} ({school.completion_percentage}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
