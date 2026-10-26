/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Flame,
  Award,
  BookOpen,
  Brain,
  Shield,
  Compass,
  Users,
  Mic,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Crown,
  Download,
  Share2,
  Copy,
  Check,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  BarChart2,
  Layers,
  ArrowUpRight,
  FileText,
  RefreshCw,
  X,
  ExternalLink,
  MessageSquare,
  Zap,
  Info,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { jsPDF } from "jspdf";
import { useApp } from "../context/AppContext";
import { useSabbathMode } from "../context/SabbathMode";
import {
  aggregateUserStats,
  BadgeDefinition,
  ModuleInsight,
  UserStatsSnapshot
} from "../utils/userStatsAggregator";
import { WeeklyScribeHeatmap } from "./WeeklyScribeHeatmap";
import { ScribeContributionGraph } from "./ScribeContributionGraph";
import { DailyGoalProgressBar } from "./DailyGoalProgressBar";
import { STBA_LOGO_URL } from "../assets/branding";

interface UserStatsPageProps {
  isEmbedded?: boolean;
}

export const UserStatsPage: React.FC<UserStatsPageProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { user, completedVerseIds = [], favoriteScriptures = [] } = useApp();
  const { sabbathMode } = useSabbathMode();

  // Aggregate telemetry snapshot
  const stats: UserStatsSnapshot = useMemo(() => {
    return aggregateUserStats(user, completedVerseIds, favoriteScriptures);
  }, [user, completedVerseIds, favoriteScriptures]);

  // View & Filter States
  const [trendsTab, setTrendsTab] = useState<"heatmap" | "weekly" | "monthly" | "radar">("heatmap");
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<string>("all");
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<"all" | "earned" | "in_progress">("all");
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Trigger temporary notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    return stats.badges.filter((badge) => {
      // Category filter
      if (badgeCategoryFilter !== "all" && badge.category !== badgeCategoryFilter) {
        return false;
      }
      // Status filter
      if (badgeStatusFilter === "earned" && !badge.earned) {
        return false;
      }
      if (badgeStatusFilter === "in_progress" && badge.earned) {
        return false;
      }
      return true;
    });
  }, [stats.badges, badgeCategoryFilter, badgeStatusFilter]);

  // Generate WhatsApp / Study Group text report
  const generateStudyGroupReportText = () => {
    const name = user?.name || "Noble Berean";
    return `📖 *Study To Be Approved — Disciple Progress Report*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Scholar:* ${name}\n` +
      `🎖️ *Study Level:* ${stats.studyLevel.title} (${stats.studyLevel.titleBadge})\n` +
      `🔥 *Active Study Streak:* ${stats.currentStreakDays} Days (Longest: ${stats.longestStreakDays} Days)\n` +
      `⭐ *Overall Mastery Score:* ${stats.overallMasteryScore}%\n` +
      `🧠 *Retention Stability:* ${stats.retentionStabilityIndex}%\n` +
      `📚 *Total Verses Studied:* ${stats.totalVersesStudied} (${stats.totalVersesMastered} Mastered)\n` +
      `🏅 *Achievement Badges:* ${stats.earnedBadgesCount} / ${stats.totalBadgesCount} Unlocked\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏛️ *Core Doctrinal Highlights:*\n` +
      `• Sanctuary & 2300 Days: Mastered (Daniel 8:14)\n` +
      `• Seventh-day Sabbath: Mastered (Exodus 20:8–11)\n` +
      `• Three Angels' Messages: Mastered (Revelation 14:6–12)\n` +
      `• Translations Compared: 4 Versions (KJV, NKJV, NASB, ESV)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💬 *Weekly Reflection Quote:*\n` +
      `"Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth." — 2 Timothy 2:15\n` +
      `\n_Generated via STBA Cognitive Scripture Mastery System_`;
  };

  const handleCopyStudyGroupReport = () => {
    const text = generateStudyGroupReportText();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    triggerToast("Study Group Report copied to clipboard!");
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Export high-resolution PDF study transcript
  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const name = user?.name || "Noble Berean";
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      // Colors
      const primaryNavy = [28, 35, 51]; // #1C2333
      const gold = [201, 151, 58]; // #C9973A
      const stoneText = [90, 90, 90];
      const lightBg = [250, 249, 245];

      // Header Banner
      doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.rect(0, 0, 210, 45, "F");

      // Title & Logo
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("STUDY TO BE APPROVED", 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text("COGNITIVE SCRIPTURE MASTERY & THEOLOGICAL TRANSCRIPT", 14, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated on: ${dateStr} • Official Scriptorium Record`, 14, 34);

      // Student Meta Box
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.roundedRect(14, 52, 182, 32, 3, 3, "F");
      doc.setDrawColor(220, 215, 200);
      doc.roundedRect(14, 52, 182, 32, 3, 3, "S");

      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(name, 20, 62);

      doc.setFontSize(9);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text(`Rank: ${stats.studyLevel.title} (${stats.studyLevel.titleBadge})`, 20, 69);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(stoneText[0], stoneText[1], stoneText[2]);
      doc.text(`Email: ${user?.email || "disciple@berean.org"} • Total XP: ${stats.studyLevel.currentXp} pts`, 20, 76);

      // Top KPIs Summary Grid
      let kpiY = 92;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text("1. Overall Mastery & Retention Overview", 14, kpiY);

      kpiY += 6;
      const kpis = [
        { label: "Overall Mastery", val: `${stats.overallMasteryScore}%` },
        { label: "Study Streak", val: `${stats.currentStreakDays} Days` },
        { label: "Retention Index", val: `${stats.retentionStabilityIndex}%` },
        { label: "Verses Mastered", val: `${stats.totalVersesMastered} Verses` }
      ];

      kpis.forEach((kpi, idx) => {
        const boxX = 14 + idx * 46;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(boxX, kpiY, 44, 20, 2, 2, "F");
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(boxX, kpiY, 44, 20, 2, 2, "S");

        doc.setFontSize(8);
        doc.setTextColor(stoneText[0], stoneText[1], stoneText[2]);
        doc.text(kpi.label, boxX + 4, kpiY + 7);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.text(kpi.val, boxX + 4, kpiY + 16);
      });

      // Module Insights Table
      let modY = 126;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text("2. Holistic Core Module Breakdown", 14, modY);

      modY += 6;
      stats.moduleInsights.slice(0, 6).forEach((mod) => {
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.roundedRect(14, modY, 182, 14, 2, 2, "F");
        doc.setDrawColor(235, 230, 220);
        doc.roundedRect(14, modY, 182, 14, 2, 2, "S");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.text(mod.title, 18, modY + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(stoneText[0], stoneText[1], stoneText[2]);
        doc.text(`Status: ${mod.statusLabel} • Progress: ${mod.progressPercent}%`, 18, modY + 11);

        // Progress Pill on right
        doc.setFillColor(gold[0], gold[1], gold[2]);
        doc.roundedRect(155, modY + 3, 35, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.text(`${mod.progressPercent}% MASTERED`, 159, modY + 8.5);

        modY += 16;
      });

      // Earned Badges Showcase
      let badgeY = 230;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text(`3. Earned Milestone Badges (${stats.earnedBadgesCount} / ${stats.totalBadgesCount})`, 14, badgeY);

      badgeY += 6;
      const earnedList = stats.badges.filter((b) => b.earned).slice(0, 4);
      earnedList.forEach((badge, bIdx) => {
        const bX = 14 + (bIdx % 2) * 92;
        const bY = badgeY + Math.floor(bIdx / 2) * 16;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(bX, bY, 90, 14, 2, 2, "F");
        doc.setDrawColor(225, 225, 225);
        doc.roundedRect(bX, bY, 90, 14, 2, 2, "S");

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(gold[0], gold[1], gold[2]);
        doc.text(`★ ${badge.name}`, bX + 4, bY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(stoneText[0], stoneText[1], stoneText[2]);
        doc.text(badge.requirement.substring(0, 52) + "...", bX + 4, bY + 11);
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text(
        "“Study to shew thyself approved unto God, a workman that needeth not to be ashamed.” — 2 Timothy 2:15",
        14,
        285
      );

      doc.save(`STBA-User-Stats-${name.replace(/\s+/g, "_")}.pdf`);
      triggerToast("PDF Study Transcript successfully downloaded!");
    } catch (err) {
      console.error("PDF Export error:", err);
      triggerToast("Failed to export PDF transcript.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Helper for badge icon rendering
  const renderBadgeIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "Crown":
        return <Crown className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Search":
        return <Search className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "Compass":
        return <Compass className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Brain":
        return <Brain className={className} />;
      case "Lock":
        return <Lock className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "Users":
        return <Users className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  // Helper for module icon
  const renderModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="w-5 h-5" />;
      case "List":
        return <Layers className="w-5 h-5" />;
      case "Compass":
        return <Compass className="w-5 h-5" />;
      case "Brain":
        return <Brain className="w-5 h-5" />;
      case "Mic":
        return <Mic className="w-5 h-5" />;
      case "Shield":
        return <Shield className="w-5 h-5" />;
      case "Users":
        return <Users className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={
        isEmbedded
          ? "w-full space-y-8 text-left transition-colors duration-500"
          : `min-h-screen pb-20 text-left transition-colors duration-500 ${
              sabbathMode ? "bg-[#FAF7F0]" : "bg-[#FAF9F5]"
            }`
      }
      id={isEmbedded ? "stba-user-stats-embedded" : "stba-user-stats-page"}
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#1C2333] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C9973A]/40 flex items-center space-x-3 text-xs font-mono font-bold"
            id="stats-toast"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={isEmbedded ? "w-full space-y-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8"}>
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & BREADCRUMBS WITH EXPORT & SHARE ACTIONS */}
        {/* ========================================================================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E4DA] pb-6" id="stats-header">
          <div className="space-y-1">
            {!isEmbedded && (
              <div className="flex items-center space-x-2 text-xs font-mono text-stone-500 uppercase tracking-wider font-bold">
                <Link to="/dashboard" className="hover:text-[#C9973A] transition-colors">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-[#C9973A]">Analytics & Mastery Stats</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#C9973A]/10 text-[#C9973A] rounded-2xl border border-[#C9973A]/20">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#1C2333] tracking-tight">
                  User Progress & Mastery Analytics
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Holistic telemetry across Bible Study, Tracks, Doctrine, Active Recall, Teach-It, Vault, and Sabbath School.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0" id="stats-header-actions">
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 text-[#1C2333] border border-stone-200 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 shadow-2xs hover:border-[#C9973A] transition-all cursor-pointer"
              id="share-stats-btn"
              title="Share progress report with study group"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C9973A]" />
              <span>Share With Study Group</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-[#C9973A] hover:bg-[#B0822F] text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              id="export-pdf-btn"
              title="Export formatted PDF study transcript"
            >
              {isExportingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export PDF Transcript</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. OVERALL PROGRESS OVERVIEW: STUDY LEVEL & HERO METRIC GAUGES */}
        {/* ========================================================================= */}
        <section className="space-y-6" id="overall-progress-overview">
          
          {/* Level Progress Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1C2333] via-[#232D42] to-[#151B27] rounded-3xl p-6 sm:p-8 text-white border border-[#2C374D] shadow-xl">
            {/* Subtle background ambient light */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9973A]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left: User Identity & Level Title */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-[#C9973A]/20 border border-[#C9973A]/40 text-[#C9973A] rounded-full text-xs font-mono font-extrabold uppercase tracking-wider">
                    {stats.studyLevel.titleBadge}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Level {stats.studyLevel.levelNumber} of 7
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
                    {stats.studyLevel.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                    {stats.studyLevel.rankDescription}
                  </p>
                </div>

                {/* Level XP Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono text-stone-400">
                    <span>
                      XP: <strong className="text-white">{stats.studyLevel.currentXp}</strong> / {stats.studyLevel.nextLevelXp} pts
                    </span>
                    <span className="text-[#C9973A] font-bold">
                      {stats.studyLevel.progressPercent}% to Level {Math.min(7, stats.studyLevel.levelNumber + 1)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.studyLevel.progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#C9973A] to-amber-300 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Quick Insight Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 lg:border-l lg:border-white/10 lg:pl-8">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                    Study Streak
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span className="font-serif font-extrabold text-xl sm:text-2xl text-white">
                      {stats.currentStreakDays}d
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-400 mt-1 block">
                    Best: {stats.longestStreakDays} days
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                    Mastery Score
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Trophy className="w-5 h-5 text-[#C9973A]" />
                    <span className="font-serif font-extrabold text-xl sm:text-2xl text-[#C9973A]">
                      {stats.overallMasteryScore}%
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 mt-1 block">
                    Top Tier Scholar
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                    Badges Unlocked
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span className="font-serif font-extrabold text-xl sm:text-2xl text-white">
                      {stats.earnedBadgesCount} / {stats.totalBadgesCount}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-400 mt-1 block">
                    {Math.round((stats.earnedBadgesCount / stats.totalBadgesCount) * 100)}% Collected
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 4 Detailed Hero KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-hero-kpis">
            
            {/* Card 1: Overall Mastery Score */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                  Overall Mastery Score
                </span>
                <div className="p-2 bg-amber-50 text-[#C9973A] rounded-xl border border-amber-200/60">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif font-extrabold text-3xl text-[#1C2333]">
                    {stats.overallMasteryScore}%
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    +4.2% this week
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Weighted composite across all 8 learning modules
                </p>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#C9973A] rounded-full"
                  style={{ width: `${stats.overallMasteryScore}%` }}
                />
              </div>
            </div>

            {/* Card 2: Active Recall & Retention Stability */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                  Retention Stability Index
                </span>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-200/60">
                  <Brain className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif font-extrabold text-3xl text-[#1C2333]">
                    {stats.retentionStabilityIndex}%
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Optimal Decay
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  94% accuracy over {stats.totalStudySessions * 3} active recall trials
                </p>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${stats.retentionStabilityIndex}%` }}
                />
              </div>
            </div>

            {/* Card 3: Scripture Vault & Passages */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                  Scriptures Studied & Vaulted
                </span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif font-extrabold text-3xl text-[#1C2333]">
                    {stats.totalVersesMastered}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    of {stats.totalVersesStudied} Studied
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {Math.round((stats.totalVersesMastered / stats.totalVersesStudied) * 100)}% committed to long-term memory
                </p>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.round((stats.totalVersesMastered / stats.totalVersesStudied) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Card 4: Study Frequency & Time */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                  Total Focus Time
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200/60">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <div className="flex items-baseline space-x-2">
                  <span className="font-serif font-extrabold text-3xl text-[#1C2333]">
                    {Math.floor(stats.totalStudyMinutes / 60)}h {stats.totalStudyMinutes % 60}m
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    ({stats.totalStudySessions} sessions)
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Average session length: 28 minutes
                </p>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

          </div>

        </section>

        {/* DAILY RECALL TARGET PROGRESS BAR */}
        <DailyGoalProgressBar />

        {/* ========================================================================= */}
        {/* 3. STUDY FREQUENCY & TRENDS VISUALIZER */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm space-y-6" id="study-frequency-and-trends">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
                Study Frequency & Trends
              </span>
              <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333]">
                Cognitive Study Velocity & Activity Patterns
              </h3>
            </div>

            {/* View Mode Switcher Pills */}
            <div className="flex items-center flex-wrap p-1 bg-stone-100 rounded-xl self-start sm:self-auto border border-stone-200/60 gap-1" id="trends-view-tabs">
              <button
                onClick={() => setTrendsTab("heatmap")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  trendsTab === "heatmap"
                    ? "bg-[#1C2333] text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#C9973A]" />
                <span>Daily Heatmap (Matrix)</span>
              </button>
              <button
                onClick={() => setTrendsTab("weekly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  trendsTab === "weekly"
                    ? "bg-[#1C2333] text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#C9973A]" />
                <span>Weekly Rhythm (7 Days)</span>
              </button>
              <button
                onClick={() => setTrendsTab("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  trendsTab === "monthly"
                    ? "bg-[#1C2333] text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#C9973A]" />
                <span>Monthly Trajectory (30 Days)</span>
              </button>
              <button
                onClick={() => setTrendsTab("radar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  trendsTab === "radar"
                    ? "bg-[#1C2333] text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#C9973A]" />
                <span>Competency Radar</span>
              </button>
            </div>
          </div>

          {/* Chart Rendering Area */}
          <div className="w-full pt-2">
            {trendsTab === "heatmap" && (
              <ScribeContributionGraph sabbathMode={sabbathMode} />
            )}

            {trendsTab === "weekly" && (
              <div className="space-y-6">
                <WeeklyScribeHeatmap sabbathMode={sabbathMode} />

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.weeklyFrequency}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="studyMinsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9973A" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#C9973A" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="recallsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE4" />
                      <XAxis
                        dataKey="shortDay"
                        tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1C2333",
                          borderColor: "#2C374D",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                          fontFamily: "sans-serif"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="studyMinutes"
                        name="Study Minutes"
                        stroke="#C9973A"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#studyMinsGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="recallsCompleted"
                        name="Active Recalls"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#recallsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Metric Summary Footer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 text-xs">
                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                      Peak Study Day
                    </span>
                    <span className="font-serif font-extrabold text-[#1C2333] text-sm">
                      Sabbath (75 mins)
                    </span>
                  </div>
                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                      Weekly Focus Total
                    </span>
                    <span className="font-serif font-extrabold text-[#C9973A] text-sm">
                      340 mins (5.6 hrs)
                    </span>
                  </div>
                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                      Total Active Recalls
                    </span>
                    <span className="font-serif font-extrabold text-emerald-700 text-sm">
                      61 retrieval runs
                    </span>
                  </div>
                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                      Notes Documented
                    </span>
                    <span className="font-serif font-extrabold text-indigo-700 text-sm">
                      23 study entries
                    </span>
                  </div>
                </div>
              </div>
            )}

            {trendsTab === "monthly" && (
              <div className="space-y-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={stats.monthlyTrajectory}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE4" />
                      <XAxis
                        dataKey="week"
                        tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1C2333",
                          borderColor: "#2C374D",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px"
                        }}
                      />
                      <RechartsLegend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                      <Bar dataKey="studyHours" name="Study Hours / Wk" fill="#C9973A" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="masteryGrowth" name="Mastery Score %" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="retentionRate" name="Retention Index %" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-[#C9973A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-serif text-sm text-[#1C2333] mb-0.5">
                      Consistent Spaced Repetition Growth
                    </strong>
                    Your study hours have increased by <strong>60%</strong> over the past 4 weeks, lifting your overall retention stability index from <strong>76%</strong> to <strong>{stats.retentionStabilityIndex}%</strong>.
                  </div>
                </div>
              </div>
            )}

            {trendsTab === "radar" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="h-72 w-full lg:col-span-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.competencyRadar}>
                      <PolarGrid stroke="#E8E4DA" />
                      <PolarAngleAxis
                        dataKey="competency"
                        tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "sans-serif", fontWeight: 600 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#C9973A" />
                      <Radar
                        name="Competency Score"
                        dataKey="score"
                        stroke="#C9973A"
                        fill="#C9973A"
                        fillOpacity={0.4}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 bg-[#FAF9F5] p-5 rounded-2xl border border-stone-200/70 text-xs">
                  <h4 className="font-serif font-extrabold text-[#1C2333] text-sm">
                    6 Core Berean Competencies
                  </h4>
                  <p className="text-stone-500 leading-relaxed">
                    Balancing exegesis, doctrinal memory, teaching readiness, and active cognitive retrieval.
                  </p>
                  <ul className="space-y-2 pt-1 font-mono text-[11px]">
                    {stats.competencyRadar.map((c) => (
                      <li key={c.competency} className="flex justify-between items-center">
                        <span className="text-stone-600 truncate">{c.competency}</span>
                        <span className="font-bold text-[#C9973A]">{c.score}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. ACHIEVEMENT BADGES & MILESTONES SHOWCASE */}
        {/* ========================================================================= */}
        <section className="space-y-6" id="achievement-badges-section">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold">
                  Milestones & Honors
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono font-bold">
                  {stats.earnedBadgesCount} / {stats.totalBadgesCount} Earned
                </span>
              </div>
              <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333]">
                Theological & Cognitive Achievement Badges
              </h3>
            </div>

            {/* Category and Status Filters */}
            <div className="flex items-center flex-wrap gap-2" id="badges-filters">
              {/* Category Filter Pills */}
              <div className="flex items-center p-1 bg-white border border-stone-200 rounded-xl overflow-x-auto">
                {[
                  { id: "all", label: "All" },
                  { id: "consistency", label: "Habits" },
                  { id: "exegesis", label: "Translations & Exegesis" },
                  { id: "doctrine", label: "Doctrine" },
                  { id: "recall", label: "Recall" },
                  { id: "teach", label: "Teach-It" },
                  { id: "sabbath", label: "Sabbath School" }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setBadgeCategoryFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                      badgeCategoryFilter === pill.id
                        ? "bg-[#1C2333] text-white"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Status Switcher */}
              <div className="flex items-center p-1 bg-white border border-stone-200 rounded-xl">
                <button
                  onClick={() => setBadgeStatusFilter("all")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    badgeStatusFilter === "all" ? "bg-stone-100 text-stone-900" : "text-stone-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setBadgeStatusFilter("earned")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    badgeStatusFilter === "earned" ? "bg-emerald-50 text-emerald-700" : "text-stone-400"
                  }`}
                >
                  Earned
                </button>
                <button
                  onClick={() => setBadgeStatusFilter("in_progress")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    badgeStatusFilter === "in_progress" ? "bg-amber-50 text-amber-700" : "text-stone-400"
                  }`}
                >
                  In Progress
                </button>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="badges-grid">
            {filteredBadges.map((badge) => {
              const progressPct = Math.min(100, Math.round((badge.current / badge.target) * 100));

              return (
                <motion.button
                  key={badge.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                    badge.earned
                      ? "bg-white border-[#E8E4DA] hover:border-[#C9973A] hover:shadow-md"
                      : "bg-[#FAF9F5]/70 border-stone-200/80 opacity-80 hover:opacity-100"
                  }`}
                  id={`badge-card-${badge.id}`}
                >
                  <div className="space-y-3 w-full">
                    {/* Header Row: Category Badge & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                        {badge.categoryLabel}
                      </span>
                      {badge.earned ? (
                        <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{progressPct}%</span>
                        </span>
                      )}
                    </div>

                    {/* Icon & Name */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 rounded-2xl border transition-all ${
                          badge.earned
                            ? `${badge.colorScheme.bg} ${badge.colorScheme.border} ${badge.colorScheme.iconColor} shadow-sm group-hover:scale-105`
                            : "bg-stone-100 border-stone-200 text-stone-400"
                        }`}
                      >
                        {renderBadgeIcon(badge.iconName, "w-6 h-6")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-extrabold text-[#1C2333] text-sm truncate">
                          {badge.name}
                        </h4>
                        <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                          {badge.earned ? badge.earnedDate : `${badge.current} / ${badge.target} required`}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Footer Progress / Verse Citation */}
                  <div className="w-full pt-3 mt-3 border-t border-stone-100 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-stone-400">
                      <span>Requirement</span>
                      <span className="font-bold text-stone-600">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          badge.earned ? "bg-[#C9973A]" : "bg-amber-400"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
              <p className="font-serif font-bold text-stone-800 text-base">No badges found in this category.</p>
              <p className="text-xs text-stone-500">Try adjusting your category filter to view other honors.</p>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. CROSS-MODULE HOLISTIC INTEGRATION HUB (ALL 8 CORE FEATURES) */}
        {/* ========================================================================= */}
        <section className="space-y-6" id="cross-module-hub">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold">
                Ecosystem Integration
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-mono font-bold">
                8 Core Modules Active
              </span>
            </div>
            <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333]">
              Holistic Scriptorium Insights & Deep Analytics
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Data aggregated directly from every specialized engine across the Study To Be Approved platform.
            </p>
          </div>

          {/* 8 Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="module-insights-grid">
            {stats.moduleInsights.map((module) => (
              <div
                key={module.moduleId}
                className="p-5 bg-white rounded-2xl border border-[#E8E4DA] hover:border-[#C9973A] hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left group"
                id={`module-card-${module.moduleId}`}
              >
                <div className="space-y-3">
                  {/* Module Header */}
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-[#C9973A]/10 group-hover:text-[#C9973A] transition-colors">
                      {renderModuleIcon(module.iconName)}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-50 text-stone-600 border border-stone-200">
                      {module.progressPercent}% Active
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-extrabold text-base text-[#1C2333] group-hover:text-[#C9973A] transition-colors">
                      {module.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {module.shortDesc}
                    </p>
                  </div>

                  {/* Module Key Stats */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 font-mono text-xs">
                    {module.stats.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-500 truncate">{s.label}:</span>
                        <span className="font-bold text-stone-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Link */}
                <button
                  onClick={() => navigate(module.route)}
                  className="w-full py-2 px-3 bg-stone-50 hover:bg-[#1C2333] text-stone-700 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border border-stone-200/80 group-hover:border-[#1C2333]"
                  id={`open-module-btn-${module.moduleId}`}
                >
                  <span>Open {module.title.split(" ")[0]}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. SPIRIT OF PROPHECY & SCRIPTURAL EXHORTATION FOOTER */}
        {/* ========================================================================= */}
        <footer className="p-8 rounded-3xl bg-[#FAF7F0] border border-[#E8E2D1] text-stone-700 space-y-3 text-left">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-[#C9973A]" />
            <span className="text-xs font-mono uppercase tracking-widest font-extrabold text-[#C9973A]">
              Elder Stephen’s Exhortation on Scripture Mastery
            </span>
          </div>
          <blockquote className="font-['Lato',sans-serif] not-italic text-sm sm:text-base leading-relaxed text-[#1C2333] border-l-2 border-[#C9973A] pl-4">
            “None but those who have fortified the mind with the truths of the Bible will stand through the last great conflict. To every soul will come the searching test: Shall I obey God rather than men?”
          </blockquote>
          <p className="text-xs font-mono text-stone-500 not-italic">
            — Ellen White, The Great Controversy, p. 593
          </p>
        </footer>

      </div>

      {/* ========================================================================= */}
      {/* 7. BADGE DETAILS DIALOG MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 bg-black backdrop-blur-xs"
              id="badge-modal-backdrop"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative z-10 space-y-6 text-left"
              id="badge-details-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-all"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badge Icon & Name */}
              <div className="flex items-start space-x-4">
                <div
                  className={`p-4 rounded-3xl border shadow-md ${
                    selectedBadge.earned
                      ? `${selectedBadge.colorScheme.bg} ${selectedBadge.colorScheme.border} ${selectedBadge.colorScheme.iconColor}`
                      : "bg-stone-100 border-stone-200 text-stone-400"
                  }`}
                >
                  {renderBadgeIcon(selectedBadge.iconName, "w-8 h-8")}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {selectedBadge.categoryLabel}
                    </span>
                    {selectedBadge.earned ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Earned
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-extrabold text-2xl text-[#1C2333] mt-1">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {selectedBadge.description}
                  </p>
                </div>
              </div>

              {/* Requirement & Progress Bar */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-stone-200/70 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-stone-500">Requirement</span>
                  <span className="font-bold text-stone-800">
                    {selectedBadge.current} / {selectedBadge.target} completed
                  </span>
                </div>
                <p className="font-sans text-stone-700 text-xs">
                  {selectedBadge.requirement}
                </p>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden pt-1">
                  <div
                    className="h-full bg-[#C9973A] rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((selectedBadge.current / selectedBadge.target) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Theological Citation */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs text-amber-900">
                <span className="text-[10px] font-mono uppercase font-extrabold tracking-wider text-[#C9973A] block">
                  Scripture Anchor
                </span>
                <p className="font-serif italic leading-relaxed text-stone-800">
                  {selectedBadge.scriptureVerse}
                </p>
                <p className="text-[11px] text-stone-600 pt-1 font-sans">
                  <strong>Spiritual Significance:</strong> {selectedBadge.spiritualMeaning}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    handleCopyStudyGroupReport();
                    setSelectedBadge(null);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Badge</span>
                </button>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-5 py-2 bg-[#1C2333] hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. SHARE PROGRESS WITH STUDY GROUP MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareModalOpen(false)}
              className="fixed inset-0 bg-black backdrop-blur-xs"
              id="share-modal-backdrop"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative z-10 space-y-6 text-left"
              id="share-dialog-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-all"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C9973A]">
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-mono uppercase tracking-widest font-extrabold">
                    Study Group Dispatch
                  </span>
                </div>
                <h3 className="font-serif font-extrabold text-2xl text-[#1C2333]">
                  Share Progress With Your Sabbath School or Study Circle
                </h3>
                <p className="text-xs text-stone-500">
                  Copy this clean, pre-formatted progress summary to send via WhatsApp, Signal, Email, or Church Discord.
                </p>
              </div>

              {/* Formatted Text Box */}
              <div className="bg-[#1C2333] text-stone-200 p-4 rounded-2xl border border-stone-800 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto space-y-2 shadow-inner">
                <pre className="whitespace-pre-wrap font-sans text-xs">
                  {generateStudyGroupReportText()}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs font-mono text-stone-400 text-center sm:text-left">
                  1-Click formatted for mobile messaging apps
                </span>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyStudyGroupReport}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C9973A] hover:bg-[#B0822F] text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                    id="copy-report-btn"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Report</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShareModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserStatsPage;
