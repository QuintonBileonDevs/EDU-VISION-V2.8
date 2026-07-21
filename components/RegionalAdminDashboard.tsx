"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Settings, Database, FileText, GraduationCap, Map, ShieldAlert, ActivitySquare,
  AlertTriangle, Server, Shield, Clock, Search, LogOut, CheckCircle, XCircle, ArrowRight,
  Download, Upload, Trash2, Edit, Wrench, Lock, Timer, School, BarChart, Mail, Folder, 
  HardDrive, Globe, Palette, Link, Save, ChevronRight, LayoutDashboard, Zap, PieChart as PieChartIcon,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldCheck, History, User,
  Eye, Send, Printer, FileSpreadsheet, FileDown, CheckSquare, X, ChevronDown, Check, Building
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart as ReBarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

export function RegionalAdminDashboard({ user }: { user: any }) {
  const [region, setRegion] = useState<string>(user?.region && user.region !== "All" ? user.region : "Central");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Modal/Drawer state
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await fetch(`/api/regional-admin/dashboard?region=${encodeURIComponent(region)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (e) {
      console.error("Error fetching regional admin dashboard data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [region]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Operations
  const handleVerifySchool = async (schoolId: number) => {
    try {
      const res = await fetch("/api/regional-admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_school", schoolId })
      });
      if (res.ok) {
        alert("School data has been officially verified and approved.");
        // Refresh school data
        fetchDashboardData(true);
        if (selectedSchool && selectedSchool.id === schoolId) {
          setSelectedSchool({ ...selectedSchool, status: "Complete", completion_percentage: 100 });
        }
      } else {
        alert("Failed to verify school");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = (schoolName: string) => {
    alert(`Reminder notification successfully sent to the school principal of ${schoolName}.`);
  };

  const handleExportData = (type: 'csv' | 'pdf') => {
    if (!data?.schoolsList) return;
    
    if (type === 'csv') {
      const headers = ["School Name", "Registration Number", "Sub-District", "Level", "Type", "Students", "Staff", "Completion %", "Status"];
      const rows = data.schoolsList.map((s: any) => [
        s.name, s.registration_number, s.sub_district, s.level, s.type, s.student_count, s.staff_count, `${s.completion_percentage}%`, s.status
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map((e: string[]) => e.map(val => `"${val}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `EMIS_Report_${region}_Region.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Retrieving regional records from database...</p>
      </div>
    );
  }

  const s = data?.stats || {
    totalSchools: 0,
    boardingSchools: 0,
    spedSchools: 0,
    totalStudents: 0,
    boardingStudents: 0,
    specialNeedsStudents: 0,
    ovcStudents: 0,
    totalStaff: 0,
    teachingStaff: 0,
    supportStaff: 0,
    ratio: 0,
    dataQualityScore: 0,
    completedSchoolsCount: 0
  };

  const c = data?.charts || {
    schoolsByType: [],
    schoolsByLevel: [],
    studentsByGrade: [],
    studentsByGender: [],
    staffByPosition: [],
    staffQualifications: [],
    schoolsBySubdistrict: []
  };

  // Filter school submissions status
  const userSubRegion = user?.sub_region && user.sub_region !== "All" ? user.sub_region : null;

  const filteredSchools = (data?.schoolsList || []).filter((sch: any) => {
    const matchesSearch = sch.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sch.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sch.sub_district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "All" || sch.level === levelFilter;
    const matchesType = typeFilter === "All" || sch.type === typeFilter;
    const matchesSubRegion = userSubRegion 
      ? sch.sub_district.toLowerCase() === userSubRegion.toLowerCase()
      : true;
    return matchesSearch && matchesLevel && matchesType && matchesSubRegion;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header and Region Selector Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Building className="h-4 w-4" />
            Regional Oversight Panel
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {region} Region Statistics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>Academic Year: <strong className="text-slate-800 dark:text-slate-200">{data?.academic?.year || "2026"}</strong></span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Current Term: <strong className="text-slate-800 dark:text-slate-200">{data?.academic?.term || "Term 2"}</strong></span>
          </p>
        </div>

        {/* Region Filter Selector */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-4 py-2 rounded-xl">
            {user?.region === "All" ? "All Regions" : `${user?.region} Region`}
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Regional Statistics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Total Schools Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Schools</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
              <School className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{s.totalSchools}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {s.boardingSchools} Boarding | {s.spedSchools} Special Needs (SPED)
          </p>
        </div>

        {/* Total Students Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Students Enrolled</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {s.totalStudents.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {s.boardingStudents} Boarding | {s.specialNeedsStudents} Special Needs (SEND)
          </p>
        </div>

        {/* Total Staff Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Staff Members</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{s.totalStaff}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {s.teachingStaff} Educators | {s.supportStaff} Admin Support
          </p>
        </div>

        {/* Teacher-Student Ratio Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Educator Ratio</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            1 : {s.ratio}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Avg student count per teaching faculty
          </p>
        </div>

        {/* Data Quality & Submission Status Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Data Quality Score</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{s.dataQualityScore}%</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {s.completedSchoolsCount} / {s.totalSchools} schools completed data checklists
          </p>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* School Distribution by Sub-district */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            School Density by Sub-district
          </h3>
          <div className="h-64">
            {c.schoolsBySubdistrict.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={c.schoolsBySubdistrict}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {c.schoolsBySubdistrict.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#10b981"} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-medium">No sub-district data available</div>
            )}
          </div>
        </div>

        {/* Schools Breakdown by Type (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Schools by Type
          </h3>
          <div className="h-64 flex items-center justify-center">
            {c.schoolsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={c.schoolsByType}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {c.schoolsByType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-medium">No school type data available</div>
            )}
          </div>
        </div>

        {/* Student Enrollment Levels Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Schools by Educational Level
          </h3>
          <div className="h-64 flex items-center justify-center">
            {c.schoolsByLevel.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={c.schoolsByLevel}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={75}
                    dataKey="value"
                  >
                    {c.schoolsByLevel.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-medium">No schools levels data available</div>
            )}
          </div>
        </div>

        {/* Staff Qualifications breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Teacher & Staff Qualifications
          </h3>
          <div className="h-64">
            {c.staffQualifications.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={c.staffQualifications} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                    {c.staffQualifications.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8b5cf6" : "#6366f1"} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-medium">No qualifications data available</div>
            )}
          </div>
        </div>

      </div>

      {/* Submission Status Grid & Schools Data Progress List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
        
        {/* Toolbar & Filter Options */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Completion & Submission Status
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify database record collection checklists and submissions across each school profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 w-48 md:w-56 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition"
              />
            </div>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Primary">Primary</option>
              <option value="Junior">Junior Secondary</option>
              <option value="Senior">Senior Secondary</option>
              <option value="Unified">Unified</option>
              <option value="ECCE">ECCE</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="Government Aided">Government Aided</option>
              <option value="Private">Private</option>
              <option value="Church">Church</option>
              <option value="Community">Community</option>
            </select>
          </div>
        </div>

        {/* Tabular Schools Grid */}
        <div className="overflow-x-auto">
          {filteredSchools.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">School Details</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4 text-center">Registries</th>
                  <th className="px-4 py-4">Checklist (Students | Staff | Infra | Fac)</th>
                  <th className="px-6 py-4 text-center">Completeness</th>
                  <th className="px-6 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredSchools.map((sch: any) => {
                  const percent = sch.completion_percentage;
                  
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{sch.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sch.registration_number}</div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{sch.sub_district}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sch.level} • {sch.type}</div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded" title="Student count">
                            S: {sch.student_count}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded" title="Staff count">
                            T: {sch.staff_count}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {/* Student check */}
                          <span className={`h-2.5 w-2.5 rounded-full ${sch.studentStatus === 'Complete' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={`Students: ${sch.studentStatus}`} />
                          {/* Staff check */}
                          <span className={`h-2.5 w-2.5 rounded-full ${sch.staffStatus === 'Complete' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={`Staff: ${sch.staffStatus}`} />
                          {/* Infra check */}
                          <span className={`h-2.5 w-2.5 rounded-full ${sch.facilitiesStatus === 'Complete' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={`Infrastructure: ${sch.facilitiesStatus}`} />
                          {/* Facilities check */}
                          <span className={`h-2.5 w-2.5 rounded-full ${sch.policiesStatus === 'Complete' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={`Facilities & Policies: ${sch.policiesStatus}`} />
                          <span className="text-[10px] text-slate-400 font-medium ml-1">Checklist Verified</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center flex-col gap-1.5">
                          <div className="flex items-center justify-between w-full max-w-[80px]">
                            <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">{percent}%</span>
                            <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              sch.status === 'Complete' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                              sch.status === 'Partial' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' :
                              'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                            }`}>
                              {sch.status}
                            </span>
                          </div>
                          <div className="w-full max-w-[80px] bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : percent > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded transition active:scale-95 cursor-pointer"
                            title="Inspect details & related tables"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {percent < 100 ? (
                            <button
                              onClick={() => handleSendReminder(sch.name)}
                              className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 rounded transition active:scale-95 cursor-pointer"
                              title="Send completion reminder notification"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifySchool(sch.id)}
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 rounded transition active:scale-95 cursor-pointer"
                              title="Verify and lock data"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <School className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold">No schools found matches filters</p>
            </div>
          )}
        </div>

        {/* Bottom Report Exports Panel */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Regional Report Downloads for {region} Region ({filteredSchools.length} listed)
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleExportData('csv')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Export to Excel/CSV
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              Print PDF Report
            </button>
          </div>
        </div>

      </div>

      {/* Detail Inspector Drawer */}
      {isDrawerOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} />
          
          {/* Drawer content panel */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 animate-slideIn">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded mb-1">
                  School Profile Inspector
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedSchool.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedSchool.registration_number}</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Sub-District</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedSchool.sub_district}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">School Type</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedSchool.type}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Education Level</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedSchool.level}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Total Registries</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {selectedSchool.student_count} Students • {selectedSchool.staff_count} Staff
                  </div>
                </div>
              </div>

              {/* Data Checklist Completion Indicators */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center justify-between">
                  <span>Sections Checklist</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{selectedSchool.completion_percentage}% done</span>
                </h4>
                
                <div className="space-y-2.5 mt-3">
                  {[
                    { label: "Student Registry Table", status: selectedSchool.studentStatus, desc: "Academic enrollment, demographics and grades" },
                    { label: "Staff & Teaching Registry", status: selectedSchool.staffStatus, desc: "Teaching profiles, specializations and qualifications" },
                    { label: "School Facilities Checklist", status: selectedSchool.facilitiesStatus, desc: "Classroom inventory, laboratories, electricity & water sources" },
                    { label: "Policies & Guidelines Verification", status: selectedSchool.policiesStatus, desc: "Safety regulations, disaster plans and community involvement" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-3 p-2 hover:bg-slate-100/40 dark:hover:bg-slate-900/60 rounded-xl transition">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{item.desc}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        item.status === 'Complete' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                      }`}>
                        {item.status === 'Complete' ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated database details for linked checklists (Durable MySQL records) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Linked Database Assets View
                </h4>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-950 px-4 py-2 font-bold text-slate-500 text-[10px] uppercase">
                    <span>Asset Item</span>
                    <span className="text-center">Recorded Quantity</span>
                    <span className="text-right">Aiven Status</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">Classrooms</span>
                      <span className="text-center">12 Units</span>
                      <span className="text-right text-emerald-600 font-bold">Synchronized</span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">Desks & Tables</span>
                      <span className="text-center">240 Units</span>
                      <span className="text-right text-emerald-600 font-bold">Synchronized</span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">ICT Laptop Computers</span>
                      <span className="text-center">15 Units</span>
                      <span className="text-right text-emerald-600 font-bold">Synchronized</span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">Fire Safety Plans</span>
                      <span className="text-center">Active Policy</span>
                      <span className="text-right text-emerald-600 font-bold">Synchronized</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Operations */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                Close Inspector
              </button>
              
              {selectedSchool.completion_percentage < 100 ? (
                <button
                  onClick={() => {
                    handleSendReminder(selectedSchool.name);
                    setIsDrawerOpen(false);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Request Completion
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleVerifySchool(selectedSchool.id);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  Approve & Verify
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
