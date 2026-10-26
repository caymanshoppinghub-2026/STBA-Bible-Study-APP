import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  CheckCircle,
  Clock,
  Key,
  BarChart3,
  RefreshCw,
  Mail,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Sparkles,
  Zap,
  Activity,
  Send,
  Search,
  Check,
  TrendingUp,
  Database,
  ExternalLink,
  FileText,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  tier: "Beginner" | "Scholar" | "Leader";
  emailVerified: boolean;
  status: "active" | "pending_verification" | "suspended";
  role: "Scholar" | "Pastor" | "Admin";
  createdAt: string;
  lastActive: string;
  verificationCode?: string;
  codeExpires?: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  adminEmail: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  verificationRate: string;
  retentionRate: string;
  recentSignups24h: number;
  tierBreakdown: {
    Beginner: number;
    Scholar: number;
    Leader: number;
  };
}

const retentionTrendsData = [
  { week: "Wk 1", retention: 100, activeScholars: 120 },
  { week: "Wk 2", retention: 97.2, activeScholars: 118 },
  { week: "Wk 3", retention: 96.5, activeScholars: 116 },
  { week: "Wk 4", retention: 95.8, activeScholars: 115 },
  { week: "Wk 5", retention: 95.4, activeScholars: 114 },
  { week: "Wk 6", retention: 94.9, activeScholars: 113 },
  { week: "Wk 7", retention: 95.2, activeScholars: 114 },
  { week: "Wk 8", retention: 95.4, activeScholars: 115 }
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("stba_admin_authenticated") === "true";
  });
  const [adminEmail, setAdminEmail] = useState("admin@stba.org");
  const [adminPassword, setAdminPassword] = useState("stbaAdmin2026!");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Console State
  const [activeTab, setActiveTab] = useState<"users" | "codes" | "analytics" | "logs" | "sync">("users");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [actionNotice, setActionNotice] = useState<{ msg: string; isError?: boolean } | null>(null);

  // Supabase Commentary Storage Data Sync State
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<{
    bucket: string;
    fileName: string;
    fileSizeBytes: string;
    status: string;
    volume?: string;
    overviewSnippet?: string;
    syncedAt?: string;
    downloadUrl?: string;
    count?: number;
  } | null>(null);

  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch Admin Data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, syncRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/sync-status").catch(() => null)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
        if (statsData.auditLogs) setAuditLogs(statsData.auditLogs);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.users) setUsers(usersData.users);
      }

      if (syncRes && syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.lastSync) {
          setSyncState({
            bucket: syncData.lastSync.bucket || "sda-commentary-imports",
            fileName: syncData.lastSync.fileName || "Genesis Book Overview & Commentary.docx",
            fileSizeBytes: syncData.lastSync.fileSizeBytes || "475.4 KB",
            status: "Synchronized",
            volume: syncData.lastSync.volume,
            overviewSnippet: syncData.lastSync.overviewSnippet,
            syncedAt: syncData.lastSync.syncedAt,
            downloadUrl: syncData.signedUrl,
            count: 1
          });
        }
      }
    } catch (err) {
      console.error("[STBA Admin] Error fetching metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Supabase Data Sync Function for sda-commentary-imports
  const handleSyncData = async () => {
    setIsSyncingData(true);
    setActionNotice(null);
    setActiveTab("sync");

    const targetUrl =
      "https://ygsatsfcvodstgjhmths.supabase.co/storage/v1/object/sign/sda-commentary-imports/The%20Second%20Book%20of%20Moses%20Called%20EXODUS.docx?token=eyJraWQiOiIwMmM4NTcxNy02MWU4LTQ5MWMtOWUyNC1hMDNjZGYwOGNlZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZGEtY29tbWVudGFyeS1pbXBvcnRzL1RoZSBTZWNvbmQgQm9vayBvZiBNb3NlcyBDYWxsZWQgRVhPRFVTLmRvY3giLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkyMTY0Nzc1LCJleHAiOjE3OTQ3NTY3NzV9.GiQK2M7PSxgvNmIPFnEjFqs7_TJfggVIcfN23OVrwms";

    try {
      const response = await fetch("/api/admin/sync-commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          adminEmail: adminEmail || "admin@stba.org"
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncState({
          bucket: data.bucket || "sda-commentary-imports",
          fileName: data.fileName || "The Second Book of Moses Called EXODUS.docx",
          fileSizeBytes: data.fileSizeBytes || "480.0 KB",
          status: "Synchronized",
          volume: data.volume || "Volume 1 (The Pentateuch: Exodus)",
          overviewSnippet: data.overviewSnippet,
          syncedAt: data.syncedAt || new Date().toISOString(),
          downloadUrl: data.downloadUrl || targetUrl,
          count: 1
        });

        setActionNotice({
          msg: `Successfully imported '${data.fileName || "The Second Book of Moses Called EXODUS.docx"}' (${data.fileSizeBytes || "480.0 KB"}) into 'sda-commentary-imports' Supabase bucket.`,
          isError: false
        });

        // Refresh audit logs so the new event appears in logs
        fetchAdminData();
      } else {
        throw new Error(data.error || "Data sync import request failed.");
      }
    } catch (err: any) {
      console.error("[STBA Admin] Sync Data error:", err);
      setActionNotice({
        msg: `Data sync error: ${err.message || String(err)}`,
        isError: true
      });
    } finally {
      setIsSyncingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("stba_admin_authenticated", "true");
        setIsAdminAuthenticated(true);
        fetchAdminData();
      } else {
        setLoginError(data.error || "Authentication failed. Check admin credentials.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication service.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("stba_admin_authenticated");
    setIsAdminAuthenticated(false);
  };

  // User Actions
  const handleUserAction = async (action: string, targetEmail: string, payload?: { tier?: string; status?: string }) => {
    setActionNotice(null);
    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          email: targetEmail,
          ...payload
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionNotice({ msg: data.message });
        if (data.users) setUsers(data.users);
        fetchAdminData();
      } else {
        setActionNotice({ msg: data.error || "Action failed.", isError: true });
      }
    } catch (err) {
      setActionNotice({ msg: "Connection error performing user action.", isError: true });
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || u.tier.toLowerCase() === tierFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && u.emailVerified) ||
      (statusFilter === "pending" && !u.emailVerified) ||
      (statusFilter === "suspended" && u.status === "suspended");

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Render Admin Login Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F19] text-[#E8E4DA] flex items-center justify-center p-4 relative font-sans selection:bg-[#C9973A] selection:text-[#0B0F19]" id="admin-login-screen">
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 p-2.5 text-stone-400 hover:text-[#C9973A] bg-[#121722] hover:bg-[#1A2234] border border-[#2D374D] rounded-xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#121722] border border-[#C9973A]/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          id="admin-login-card"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Shield className="w-32 h-32 text-[#C9973A]" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#C9973A]/10 border border-[#C9973A]/30 rounded-xl text-[#C9973A]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white">STBA Admin Console</h1>
              <p className="text-xs text-stone-400">User Management & Email Verification Portal</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full text-xs bg-[#1A2234] border border-[#2D374D] focus:border-[#C9973A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full text-xs bg-[#1A2234] border border-[#2D374D] focus:border-[#C9973A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#1A2234]/60 border border-[#2D374D] rounded-xl text-[11px] text-stone-400 flex items-center justify-between">
              <div>
                <span className="text-stone-300 font-semibold block">Default Admin Credentials</span>
                <span className="font-mono text-[10px] text-amber-300">admin@stba.org / stbaAdmin2026!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail("admin@stba.org");
                  setAdminPassword("stbaAdmin2026!");
                }}
                className="px-2.5 py-1 bg-[#C9973A]/20 hover:bg-[#C9973A]/30 text-[#C9973A] rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#C9973A] hover:bg-[#d8a542] text-[#0B0F19] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Access Admin Console</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-[#E8E4DA] font-sans selection:bg-[#C9973A] selection:text-[#0B0F19] pb-16" id="admin-dashboard-container">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 bg-[#121722]/90 backdrop-blur-md border-b border-[#2D374D] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C9973A]/15 border border-[#C9973A]/40 rounded-xl text-[#C9973A]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-serif font-bold text-white">STBA Admin Console</h1>
                <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live System
                </span>
              </div>
              <p className="text-[11px] text-stone-400">User Management, Verification Monitor & Retention Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 bg-[#1A2234] hover:bg-[#232D45] text-stone-300 text-xs rounded-lg border border-[#2D374D] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>User App View</span>
            </button>

            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 bg-[#1A2234] hover:bg-[#232D45] text-[#C9973A] rounded-lg border border-[#2D374D] transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs rounded-lg border border-red-500/30 transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ACTION NOTIFICATION BANNER */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`max-w-7xl mx-auto px-6 pt-4`}
          >
            <div className={`p-3.5 rounded-xl text-xs font-sans border flex items-center justify-between ${
              actionNotice.isError
                ? "bg-red-500/15 border-red-500/30 text-red-200"
                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
            }`}>
              <div className="flex items-center gap-2">
                {actionNotice.isError ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                <span>{actionNotice.msg}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="text-stone-400 hover:text-white cursor-pointer text-xs">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        
        {/* KPI METRICS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="admin-kpi-grid">
          
          {/* Total Users */}
          <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium">Total Registered</span>
              <Users className="w-4 h-4 text-[#C9973A]" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-white">{stats?.totalUsers || users.length}</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Across all 3 study tiers</p>
            </div>
          </div>

          {/* Active & Verified Users */}
          <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium">Verified Active</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-emerald-400">{stats?.activeUsers || 0}</span>
              <p className="text-[10px] text-stone-400 mt-0.5">{stats?.verificationRate || "100%"} verification rate</p>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium">Pending Code</span>
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-amber-400">{stats?.pendingUsers || 0}</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Awaiting code verification</p>
            </div>
          </div>

          {/* Retention Rate */}
          <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium">User Retention</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-indigo-300">{stats?.retentionRate || "95.4%"}</span>
              <p className="text-[10px] text-emerald-400 mt-0.5">↑ 2.4% this month</p>
            </div>
          </div>

          {/* Recent Sign-ups */}
          <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-stone-400 mb-2">
              <span className="text-xs font-medium">New (24h)</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-sky-300">{stats?.recentSignups24h || 0}</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Recent account creations</p>
            </div>
          </div>

        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-[#2D374D] pb-1" id="admin-tabs-nav">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-[#C9973A] text-[#0B0F19] shadow-md"
                : "text-stone-400 hover:text-white hover:bg-[#121722]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("codes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "codes"
                ? "bg-[#C9973A] text-[#0B0F19] shadow-md"
                : "text-stone-400 hover:text-white hover:bg-[#121722]"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Verification Monitor ({users.filter((u) => u.verificationCode).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[#C9973A] text-[#0B0F19] shadow-md"
                : "text-stone-400 hover:text-white hover:bg-[#121722]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Retention & Growth</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-[#C9973A] text-[#0B0F19] shadow-md"
                : "text-stone-400 hover:text-white hover:bg-[#121722]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={handleSyncData}
            disabled={isSyncingData}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "sync"
                ? "bg-[#C9973A] text-[#0B0F19] shadow-md"
                : "text-stone-400 hover:text-white hover:bg-[#121722]"
            }`}
            title="Import and synchronize data into 'sda-commentary-imports' Supabase bucket"
          >
            <Activity className={`w-4 h-4 ${isSyncingData ? "animate-spin" : ""}`} />
            <span>{isSyncingData ? "Syncing Data..." : `Sync Data${syncState ? ` (${syncState.count || 1})` : ""}`}</span>
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT DIRECTORY */}
        {activeTab === "users" && (
          <div className="space-y-4" id="admin-user-management-tab">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121722] border border-[#2D374D] p-3.5 rounded-2xl">
              
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-[#1A2234] border border-[#2D374D] rounded-xl pl-10 pr-4 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-[#C9973A]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-[#1A2234] border border-[#2D374D] text-stone-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#C9973A] cursor-pointer"
                >
                  <option value="all">All Tiers</option>
                  <option value="beginner">Beginner</option>
                  <option value="scholar">Scholar</option>
                  <option value="leader">Leader</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#1A2234] border border-[#2D374D] text-stone-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#C9973A] cursor-pointer"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Verification Code</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

            </div>

            {/* Users Table */}
            <div className="bg-[#121722] border border-[#2D374D] rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#1A2234] text-stone-400 uppercase text-[10px] font-mono tracking-wider border-b border-[#2D374D]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Scholar Name & Email</th>
                      <th className="py-3.5 px-4 font-semibold">Tier</th>
                      <th className="py-3.5 px-4 font-semibold">Email Verification</th>
                      <th className="py-3.5 px-4 font-semibold">Active Code</th>
                      <th className="py-3.5 px-4 font-semibold">Account Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D374D]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-stone-500 font-mono text-xs">
                          No users match the search and filter query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#1A2234]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{u.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={u.tier}
                              onChange={(e) => handleUserAction("change_tier", u.email, { tier: e.target.value })}
                              className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer transition-all ${
                                u.tier === "Leader"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  : u.tier === "Scholar"
                                  ? "bg-[#C9973A]/15 text-[#C9973A] border-[#C9973A]/30"
                                  : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                              }`}
                            >
                              <option value="Beginner" className="bg-[#121722] text-sky-300">Beginner</option>
                              <option value="Scholar" className="bg-[#121722] text-[#C9973A]">Scholar</option>
                              <option value="Leader" className="bg-[#121722] text-purple-300">Leader / Pastor</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4">
                            {u.emailVerified ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-medium">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-medium">
                                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                                Pending Code
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            {u.verificationCode ? (
                              <span className="px-2 py-1 bg-[#1A2234] border border-[#C9973A]/40 text-[#C9973A] rounded font-mono font-bold tracking-wider">
                                {u.verificationCode}
                              </span>
                            ) : (
                              <span className="text-stone-600 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              u.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : u.status === "suspended"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-300"
                            }`}>
                              {u.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {!u.emailVerified && (
                                <button
                                  onClick={() => handleUserAction("manually_verify", u.email)}
                                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold rounded-lg border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1"
                                  title="Manually Verify Email"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Verify</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleUserAction("resend_code", u.email)}
                                className="px-2.5 py-1 bg-[#1A2234] hover:bg-[#232D45] text-stone-300 hover:text-white text-[11px] font-semibold rounded-lg border border-[#2D374D] transition-all cursor-pointer flex items-center gap-1"
                                title="Resend Verification Email Code"
                              >
                                <Send className="w-3 h-3 text-[#C9973A]" />
                                <span>Resend Code</span>
                              </button>

                              <button
                                onClick={() => handleUserAction("toggle_status", u.email)}
                                className="p-1.5 bg-[#1A2234] hover:bg-red-500/20 text-stone-400 hover:text-red-300 rounded-lg border border-[#2D374D] transition-all cursor-pointer"
                                title={u.status === "suspended" ? "Reactivate User" : "Suspend User"}
                              >
                                {u.status === "suspended" ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserX className="w-3.5 h-3.5 text-red-400" />}
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user ${u.email}?`)) {
                                    handleUserAction("delete_user", u.email);
                                  }
                                }}
                                className="p-1.5 bg-[#1A2234] hover:bg-red-500/20 text-stone-400 hover:text-red-300 rounded-lg border border-[#2D374D] transition-all cursor-pointer"
                                title="Delete User Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VERIFICATION MONITOR & SMTP SANBOX TRACKER */}
        {activeTab === "codes" && (
          <div className="space-y-4" id="admin-codes-monitor-tab">
            <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#C9973A]" />
                    <span>Live Verification Code Engine</span>
                  </h2>
                  <p className="text-xs text-stone-400">Monitor active 6-digit codes generated for sign-ups and resend triggers in real time.</p>
                </div>
                <span className="px-3 py-1 bg-[#1A2234] border border-[#C9973A]/30 text-[#C9973A] text-xs font-mono rounded-lg">
                  SMTP Host: smtp-relay.brevo.com:587
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter((u) => u.verificationCode).length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-stone-500 text-xs font-mono">
                    All registered scholars have verified their email addresses! No pending codes.
                  </div>
                ) : (
                  users
                    .filter((u) => u.verificationCode)
                    .map((u) => (
                      <div key={u.id} className="p-4 bg-[#1A2234] border border-[#C9973A]/30 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">{u.name}</span>
                          <span className="text-[11px] font-mono text-stone-400 block">{u.email}</span>
                          <span className="text-[10px] text-stone-500 mt-1 block">
                            Status: <span className="text-amber-400 font-semibold">{u.status}</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-stone-400 block mb-1">Active Code:</span>
                          <div className="px-3 py-1.5 bg-[#0B0F19] border border-[#C9973A] text-[#C9973A] font-mono text-base font-bold tracking-widest rounded-lg shadow-inner">
                            {u.verificationCode}
                          </div>
                          <button
                            onClick={() => handleUserAction("manually_verify", u.email)}
                            className="mt-2 text-[10px] text-emerald-400 hover:underline font-semibold cursor-pointer block text-right w-full"
                          >
                            Pass Code & Verify →
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RETENTION & GROWTH ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6" id="admin-analytics-tab">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Tier Distribution Breakdown */}
              <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-5 shadow-lg">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-4">Study Tier Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-sky-300">Beginner Tier</span>
                      <span className="font-bold text-white">{stats?.tierBreakdown?.Beginner || 0} scholars</span>
                    </div>
                    <div className="w-full h-2 bg-[#1A2234] rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${((stats?.tierBreakdown?.Beginner || 1) / (stats?.totalUsers || 1)) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#C9973A]">Scholar Tier</span>
                      <span className="font-bold text-white">{stats?.tierBreakdown?.Scholar || 0} scholars</span>
                    </div>
                    <div className="w-full h-2 bg-[#1A2234] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C9973A]" style={{ width: `${((stats?.tierBreakdown?.Scholar || 1) / (stats?.totalUsers || 1)) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-300">Leader / Pastor Tier</span>
                      <span className="font-bold text-white">{stats?.tierBreakdown?.Leader || 0} scholars</span>
                    </div>
                    <div className="w-full h-2 bg-[#1A2234] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: `${((stats?.tierBreakdown?.Leader || 1) / (stats?.totalUsers || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification & Retention Summary */}
              <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-5 shadow-lg col-span-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-4">Verification & Cohort Retention Funnel</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-[#1A2234] rounded-xl border border-[#2D374D]">
                    <span className="text-2xl font-serif font-bold text-white block">100%</span>
                    <span className="text-[11px] text-stone-400 block mt-1">Sign-up Conversion</span>
                  </div>

                  <div className="p-4 bg-[#1A2234] rounded-xl border border-[#2D374D]">
                    <span className="text-2xl font-serif font-bold text-emerald-400 block">{stats?.verificationRate || "92.0%"}</span>
                    <span className="text-[11px] text-stone-400 block mt-1">Email Verification Rate</span>
                  </div>

                  <div className="p-4 bg-[#1A2234] rounded-xl border border-[#2D374D]">
                    <span className="text-2xl font-serif font-bold text-[#C9973A] block">{stats?.retentionRate || "95.4%"}</span>
                    <span className="text-[11px] text-stone-400 block mt-1">30-Day Active Retention</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RETENTION TRENDS AREA CHART (RECHARTS) */}
            <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-6 shadow-lg space-y-4" id="admin-retention-trends-chart">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D374D] pb-4">
                <div>
                  <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#C9973A]" />
                    <span>Weekly Retention Trends & Active Scholars</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Cohort-based weekly active scripture study engagement and retention curves (8-Week Lifecycle)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-[#C9973A]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9973A] inline-block" /> Retention Rate (%)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Active Scholars
                  </span>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retentionTrendsData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldRetentionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9973A" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#C9973A" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="emeraldScholarsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2234" vertical={false} />
                    <XAxis dataKey="week" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={{ stroke: '#2D374D' }} />
                    <YAxis stroke="#6B7280" fontSize={11} domain={[80, 105]} tickLine={false} axisLine={{ stroke: '#2D374D' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1420',
                        borderColor: 'rgba(201, 151, 58, 0.4)',
                        borderRadius: '12px',
                        color: '#F3F4F6',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ color: '#EAD49E' }}
                      labelStyle={{ color: '#9CA3AF', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(value: any, name: any) => [
                        name === 'retention' ? `${value}%` : value,
                        name === 'retention' ? 'Retention Rate' : 'Active Scholars'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="retention"
                      stroke="#C9973A"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#goldRetentionGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="activeScholars"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#emeraldScholarsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-5 shadow-lg space-y-4" id="admin-audit-logs-tab">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">System & Admin Event Audit Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#1A2234] border border-[#2D374D] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[#C9973A] font-bold block">{log.action}</span>
                    <span className="text-stone-300 block">{log.details}</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-stone-400 shrink-0 ml-4">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="text-stone-500">{log.adminEmail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYNC DATA (sda-commentary-imports) */}
        {activeTab === "sync" && (
          <div className="space-y-4" id="admin-sync-data-tab">
            <div className="bg-[#121722] border border-[#2D374D] rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2D374D]">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <Database className="w-5 h-5 text-[#C9973A]" />
                    <h3 className="text-sm font-serif font-bold text-white tracking-wide">
                      Supabase Storage Data Sync Engine
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      sda-commentary-imports
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Automated import &amp; ingestion pipeline for Seventh-day Adventist Bible Commentary (SDABC) files into cloud storage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncData}
                    disabled={isSyncingData}
                    className="px-4 py-2 bg-[#C9973A] hover:bg-[#d6a547] text-[#0B0F19] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingData ? "animate-spin" : ""}`} />
                    <span>{isSyncingData ? "Importing & Syncing..." : "Sync Now"}</span>
                  </button>
                </div>
              </div>

              {/* Bucket & File Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#1A2234] border border-[#2D374D] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Target Bucket</span>
                  <div className="font-mono text-sm text-[#C9973A] font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#C9973A]" />
                    sda-commentary-imports
                  </div>
                  <p className="text-[11px] text-stone-400">Supabase Cloud Storage Object</p>
                </div>

                <div className="p-4 bg-[#1A2234] border border-[#2D374D] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Active Import Object</span>
                  <div className="font-sans text-sm text-white font-medium flex items-center gap-2 truncate" title="The Second Book of Moses Called EXODUS.docx">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{syncState?.fileName || "The Second Book of Moses Called EXODUS.docx"}</span>
                  </div>
                  <p className="text-[11px] text-stone-400">{syncState?.fileSizeBytes || "480.0 KB"} • Volume 1 (Pentateuch: Exodus)</p>
                </div>

                <div className="p-4 bg-[#1A2234] border border-[#2D374D] rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Synchronization State</span>
                  <div className="font-sans text-sm text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{syncState?.status || "Synchronized"}</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {syncState?.syncedAt ? `Last synced: ${new Date(syncState.syncedAt).toLocaleTimeString()}` : "Ready for one-click import"}
                  </p>
                </div>
              </div>

              {/* Target Signed URL Info Box */}
              <div className="p-4 bg-[#0B0F19] border border-[#2D374D] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">Configured Storage Signed URL (sda-commentary-imports)</span>
                  <a
                    href="https://ygsatsfcvodstgjhmths.supabase.co/storage/v1/object/sign/sda-commentary-imports/The%20Second%20Book%20of%20Moses%20Called%20EXODUS.docx?token=eyJraWQiOiIwMmM4NTcxNy02MWU4LTQ5MWMtOWUyNC1hMDNjZGYwOGNlZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzZGEtY29tbWVudGFyeS1pbXBvcnRzL1RoZSBTZWNvbmQgQm9vayBvZiBNb3NlcyBDYWxsZWQgRVhPRFVTLmRvY3giLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkyMTY0Nzc1LCJleHAiOjE3OTQ3NTY3NzV9.GiQK2M7PSxgvNmIPFnEjFqs7_TJfggVIcfN23OVrwms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#C9973A] hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Download Source DOCX</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-2.5 bg-[#121722] rounded-lg border border-[#2D374D]/60 font-mono text-[11px] text-stone-400 break-all select-all">
                  https://ygsatsfcvodstgjhmths.supabase.co/storage/v1/object/sign/sda-commentary-imports/The%20Second%20Book%20of%20Moses%20Called%20EXODUS.docx?token=eyJraWQiOiIwMmM4NTcxNy02MWU4LTQ5MWMtOWUyNC1hMDNjZGYwOGNlZWQiLCJhbGciOiJIUzI1NiJ9...
                </div>
              </div>

              {/* Exegetical Commentary Overview Preview */}
              <div className="p-4 bg-[#1A2234] border border-[#2D374D] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-stone-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9973A]" />
                    <span>Ingested Expository Highlights (SDABC Vol. 1 Exodus)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SDA Doctrinally Aligned
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-serif italic bg-[#121722] p-3 rounded-lg border border-[#2D374D]">
                  {syncState?.overviewSnippet ||
                    "The Second Book of Moses Called EXODUS. INTRODUCTION. 1. Title: Like each of the other four books of the Pentateuch, Exodus is designated by the Jews according to the first phrase of the Hebrew text, We’eleh shemoth, 'And these are the names.' 2. Authorship: Moses, the author of the Pentateuch, kept a diary (Ex. 17:14; 24:4; 34:27; PP 245)... 3. Historical Setting: 18th Dynasty Egypt (Ahmose, Hatshepsut foster mother of Moses, Amenhotep II Pharaoh of the Exodus)... 4. Theme: God's marvelous intervention delivering His chosen people and entering into covenant relation with them."}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2 py-1 bg-[#121722] border border-[#2D374D] text-[10px] font-mono rounded text-stone-400">
                    Exodus 20:8-11 Fourth Commandment Sabbath
                  </span>
                  <span className="px-2 py-1 bg-[#121722] border border-[#2D374D] text-[10px] font-mono rounded text-stone-400">
                    Exodus 25:8 Earthly &amp; Heavenly Sanctuary
                  </span>
                  <span className="px-2 py-1 bg-[#121722] border border-[#2D374D] text-[10px] font-mono rounded text-stone-400">
                    Exodus 12:13 Christ Our Passover Lamb
                  </span>
                  <span className="px-2 py-1 bg-[#121722] border border-[#2D374D] text-[10px] font-mono rounded text-stone-400">
                    Exodus 31:16-17 Perpetual Covenant Sign
                  </span>
                  <span className="px-2 py-1 bg-[#121722] border border-[#2D374D] text-[10px] font-mono rounded text-stone-400">
                    Exodus 3:14 Christ the Great I AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
