"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Settings, Database, FileText, GraduationCap, Map, ShieldAlert, ActivitySquare,
  AlertTriangle, Server, Shield, Clock, Search, LogOut, CheckCircle, XCircle, ArrowRight,
  Download, Upload, Trash2, Edit
} from 'lucide-react';

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
    try {
      const res = await fetch("/api/super-admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload })
      });
      if (res.ok) {
        await fetchDashboard();
      } else {
        alert("Action failed.");
      }
    } catch (e) {
      alert("Error executing action.");
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
          { label: "Active User Sessions", count: loading ? "..." : c.sessionCount, color: "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20", icon: Users },
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

export function SuperAdminConfig() {
  const { data, loading, executeAction } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [editValue, setEditValue] = useState("");
  const configList = data?.config || [];

  const openModal = (cfg: any) => {
    setCurrentConfig(cfg);
    setEditValue(cfg.config_value);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentConfig) return;
    await executeAction('update_config', { 
      config_key: currentConfig.config_key, 
      config_value: editValue 
    });
    setIsModalOpen(false);
  };

  const handleToggle = (currentVal: string) => {
    setEditValue(currentVal === "TRUE" ? "FALSE" : "TRUE");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn relative">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold dark:text-white mb-2">System Configuration</h3>
          <p className="text-sm text-slate-500">Manage global system variables and maintenance states.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-400">Config Key</th>
              <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-400">Value</th>
              <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-400">Description</th>
              <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading && !data ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading configurations...</td></tr>
            ) : configList.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-500">No configurations found.</td></tr>
            ) : configList.map((cfg: any) => (
              <tr key={cfg.config_key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{cfg.config_key}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">{cfg.config_group}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    cfg.config_value === "TRUE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                    cfg.config_value === "FALSE" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {cfg.config_value}
                  </span>
                </td>
                <td className="py-4 px-6 text-xs text-slate-500 leading-relaxed max-w-xs">{cfg.description}</td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => openModal(cfg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg transition-all text-xs font-bold shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                  >
                    <Settings className="w-3.5 h-3.5"/> 
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Configuration Modal */}
      {isModalOpen && currentConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl">
                  <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <h4 className="text-xl font-bold dark:text-white">{currentConfig.config_key}</h4>
              <p className="text-sm text-slate-500 mt-1">{currentConfig.description}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Value</label>
                
                {/* specialized logic for different config types */}
                {["MAINTENANCE_MODE", "ALLOW_SELF_REGISTRATION"].includes(currentConfig.config_key) ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-semibold dark:text-slate-300">
                      {editValue === "TRUE" ? "Enabled" : "Disabled"}
                    </span>
                    <button 
                      onClick={() => handleToggle(editValue)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        editValue === "TRUE" ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editValue === "TRUE" ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                ) : ["MAX_LOGIN_ATTEMPTS", "SESSION_TIMEOUT_MINS"].includes(currentConfig.config_key) ? (
                  <input 
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white transition-all"
                  />
                ) : (
                  <input 
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-white transition-all"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
          <div onClick={() => executeAction('create_backup', {})} className="border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500 hover:shadow-sm transition group">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-full group-hover:scale-110 transition"><Database className="h-6 w-6" /></div>
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
            <td className="py-3 px-4 text-right"><button className="text-indigo-600 text-xs font-semibold">Manage</button></td>
          </tr>
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="py-3 px-4 font-semibold dark:text-slate-200">Grades / Forms</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold">12</span></td>
            <td className="py-3 px-4 text-xs text-slate-500">Primary and Secondary grades</td>
            <td className="py-3 px-4 text-right"><button className="text-indigo-600 text-xs font-semibold">Manage</button></td>
          </tr>
          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
            <td className="py-3 px-4 font-semibold dark:text-slate-200">School Types</td>
            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold">5</span></td>
            <td className="py-3 px-4 text-xs text-slate-500">Government, Private, Aided, etc.</td>
            <td className="py-3 px-4 text-right"><button className="text-indigo-600 text-xs font-semibold">Manage</button></td>
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
      <div className="flex items-center gap-4 p-5 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 mb-8">
        <div className="flex-1">
          <h4 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-300">2026-2027</h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">Term 1 • Starts: Jan 10 • Ends: Apr 15</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition">Manage Terms</button>
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
            <td className="py-3 px-4 text-right"><button className="text-indigo-600 font-semibold">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SuperAdminRegions() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-fadeIn">
      <h3 className="text-lg font-bold mb-4 dark:text-white">School & Region Management</h3>
      <p className="text-slate-500 text-sm mb-6">Manage educational regions, sub-regions, and pending school registrations.</p>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-sm dark:text-white">Regions</h4>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {['South Region', 'Central Region', 'North Region'].map(region => (
              <li key={region} className="px-4 py-3 text-sm flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="font-medium dark:text-slate-300">{region}</span>
                <span className="text-xs text-slate-500">12 Sub-regions</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-amber-200 dark:border-amber-900/50 rounded-xl overflow-hidden bg-amber-50/30 dark:bg-amber-950/10">
          <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-3 border-b border-amber-100 dark:border-amber-900/50">
            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-500">Pending School Registrations</h4>
          </div>
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm text-amber-800 dark:text-amber-600">All school registrations have been approved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
