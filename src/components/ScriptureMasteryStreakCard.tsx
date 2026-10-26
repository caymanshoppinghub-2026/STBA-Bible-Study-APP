/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Trophy,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Info,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import {
  getCurrentWeekHeatmap,
  updateStreakIndicators,
  WeeklyHeatmapDay
} from "../utils/activityTracker";
import { useSabbathMode } from "../context/SabbathMode";
import { useNavigate } from "react-router-dom";

interface ScriptureMasteryStreakCardProps {
  currentStreakDays?: number;
  longestStreakDays?: number;
  onStreakBoost?: () => void;
}

interface StreakMilestone {
  days: number;
  title: string;
  badge: string;
  verse: string;
  iconName: string;
  unlocked: boolean;
}

export const ScriptureMasteryStreakCard: React.FC<ScriptureMasteryStreakCardProps> = ({
  currentStreakDays: propStreak,
  longestStreakDays: propLongest,
  onStreakBoost
}) => {
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();

  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
    weekDays: WeeklyHeatmapDay[];
    todayCompleted: boolean;
  }>(() => {
    const storedStreak =
      typeof localStorage !== "undefined"
        ? parseInt(localStorage.getItem("stba_study_streak_count") || "14", 10)
        : 14;
    const week = getCurrentWeekHeatmap();
    const todayDay = week.days.find((d) => d.isToday);

    return {
      currentStreak: propStreak ?? storedStreak,
      longestStreak: propLongest ?? Math.max(storedStreak, 21),
      weekDays: week.days,
      todayCompleted: todayDay ? todayDay.active : true
    };
  });

  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [boostCelebration, setBoostCelebration] = useState(false);

  // Refresh streak data on load or events
  useEffect(() => {
    const refreshData = () => {
      const indicators = updateStreakIndicators();
      const week = getCurrentWeekHeatmap();
      const todayDay = week.days.find((d) => d.isToday);
      setStreakData({
        currentStreak: propStreak ?? indicators.currentStreak,
        longestStreak: propLongest ?? Math.max(indicators.currentStreak, 21),
        weekDays: week.days,
        todayCompleted: todayDay ? todayDay.active : true
      });
    };

    window.addEventListener("stba-activity-recorded", refreshData);
    window.addEventListener("storage", refreshData);
    return () => {
      window.removeEventListener("stba-activity-recorded", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, [propStreak, propLongest]);

  const milestones: StreakMilestone[] = [
    {
      days: 3,
      title: "First Fruits Scriptorium",
      badge: "Initiate",
      verse: "“Thy words were found, and I did eat them.” (Jeremiah 15:16)",
      iconName: "Sparkles",
      unlocked: streakData.currentStreak >= 3
    },
    {
      days: 7,
      title: "Weekly Sabbath Cycle",
      badge: "Disciple",
      verse: "“Remember the sabbath day, to keep it holy.” (Exodus 20:8)",
      iconName: "Calendar",
      unlocked: streakData.currentStreak >= 7
    },
    {
      days: 14,
      title: "Noble Berean Examiner",
      badge: "Scholar",
      verse: "“They searched the scriptures daily, whether those things were so.” (Acts 17:11)",
      iconName: "Award",
      unlocked: streakData.currentStreak >= 14
    },
    {
      days: 30,
      title: "Sanctuary Scribe",
      badge: "Scribe",
      verse: "“Thy way, O God, is in the sanctuary.” (Psalm 77:13)",
      iconName: "Trophy",
      unlocked: streakData.currentStreak >= 30
    },
    {
      days: 60,
      title: "Pillar of Prophetic Truth",
      badge: "Master",
      verse: "“We have also a more sure word of prophecy.” (2 Peter 1:19)",
      iconName: "ShieldCheck",
      unlocked: streakData.currentStreak >= 60
    },
    {
      days: 100,
      title: "Approved Workman of God",
      badge: "Elder",
      verse: "“Study to shew thyself approved unto God.” (2 Timothy 2:15)",
      iconName: "Flame",
      unlocked: streakData.currentStreak >= 100
    }
  ];

  const nextMilestone = milestones.find((m) => !m.unlocked) || milestones[milestones.length - 1];
  const prevMilestoneDays = milestones.filter((m) => m.unlocked).pop()?.days || 0;
  const daysToNext = Math.max(0, nextMilestone.days - streakData.currentStreak);
  const milestoneProgress = Math.min(
    100,
    Math.round(
      ((streakData.currentStreak - prevMilestoneDays) /
        Math.max(1, nextMilestone.days - prevMilestoneDays)) *
        100
    )
  );

  const handleQuickDevotionCheck = () => {
    setBoostCelebration(true);
    if (onStreakBoost) {
      onStreakBoost();
    }
    setTimeout(() => setBoostCelebration(false), 2400);
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm ${
        sabbathMode
          ? "bg-white border-[#C9973A]/40 text-[#2C2314]"
          : "bg-white border-[#E8E4DA] text-stone-900"
      }`}
      id="scripture-mastery-streak-card"
    >
      {/* Top Banner with Fire Emblem */}
      <div className="bg-gradient-to-r from-[#1C2333] via-[#232D42] to-[#1C2333] p-5 sm:p-6 text-white relative overflow-hidden">
        {/* Subtle glow behind the flame */}
        <div className="absolute top-1/2 -translate-y-1/2 right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Main Streak Metric */}
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-[#1C2333] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                  <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
                  <span className="absolute bottom-1 text-[9px] font-mono font-extrabold text-[#C9973A] uppercase tracking-wider">
                    STREAK
                  </span>
                </div>
              </div>
              {/* Active Flame Badge */}
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border border-white" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold px-2 py-0.5 bg-amber-400/10 rounded border border-amber-400/30">
                  Scripture Mastery Streak
                </span>
                {streakData.todayCompleted && (
                  <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Today Active</span>
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="font-serif font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  {streakData.currentStreak}
                </h3>
                <span className="font-serif text-lg text-stone-300">
                  Consecutive Days of Study
                </span>
              </div>
              <p className="text-xs text-stone-300 font-sans">
                {streakData.todayCompleted
                  ? "🔥 Excellent Berean fidelity! Today's study session is secured."
                  : "⏳ Complete a 10-minute recall or exegesis session today to preserve your consecutive streak."}
              </p>
            </div>
          </div>

          {/* Quick Streak Stats Pills */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-white/10 border border-white/15 px-3.5 py-2.5 rounded-2xl text-left">
              <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">
                Personal Record
              </span>
              <span className="font-serif font-extrabold text-base text-amber-300">
                {streakData.longestStreak} Days
              </span>
            </div>

            <div className="bg-white/10 border border-white/15 px-3.5 py-2.5 rounded-2xl text-left">
              <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">
                Grace Shield
              </span>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-serif font-extrabold text-base text-white">
                  1 Protected Day
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowMilestonesModal(true)}
              className="px-3.5 py-2.5 bg-[#C9973A] hover:bg-amber-600 text-white rounded-2xl text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              id="view-streak-milestones-btn"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-DAY ROLLING WEEK RHYTHM BAR */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9973A] font-extrabold block">
              Current Weekly Rhythm
            </span>
            <h4 className="font-serif font-bold text-sm text-[#1C2333]">
              Consecutive Daily Devotionals (Sunday – Sabbath)
            </h4>
          </div>
          <span className="text-xs font-mono text-stone-500">
            Weekly Completion:{" "}
            <strong className="text-[#1C2333]">
              {streakData.weekDays.filter((d) => d.active).length} of 7 Days
            </strong>
          </span>
        </div>

        {/* 7 Day Blocks Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3" id="weekly-streak-days-grid">
          {streakData.weekDays.map((day) => {
            return (
              <div
                key={day.dayAbbr}
                className={`p-2 sm:p-3 rounded-2xl border text-center flex flex-col justify-between transition-all relative ${
                  day.active
                    ? day.isSabbath
                      ? "bg-amber-500/15 border-[#C9973A] text-[#1C2333] shadow-2xs ring-1 ring-[#C9973A]/40"
                      : "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : day.isToday
                    ? "bg-amber-50/70 border-dashed border-amber-400 text-amber-900 animate-pulse"
                    : "bg-stone-50 border-stone-200 text-stone-400"
                }`}
              >
                {/* Day Header */}
                <div className="space-y-0.5">
                  <span className="text-[10px] sm:text-xs font-mono font-extrabold uppercase block">
                    {day.dayAbbr}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 hidden sm:block">
                    {day.formattedDate.split(" ")[1]}
                  </span>
                </div>

                {/* Status Indicator Icon */}
                <div className="my-1.5 sm:my-2 flex justify-center">
                  {day.active ? (
                    day.isSabbath ? (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C9973A] text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    )
                  ) : day.isToday ? (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center border border-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-stone-200/80 text-stone-400 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold">•</span>
                    </div>
                  )}
                </div>

                {/* Minutes Studied */}
                <span className="text-[9px] sm:text-[10px] font-mono font-bold truncate">
                  {day.active ? `${day.studyMinutes}m` : day.isToday ? "Today" : "—"}
                </span>

                {day.isSabbath && (
                  <span className="text-[8px] font-mono uppercase font-extrabold text-[#C9973A] tracking-tighter block mt-0.5">
                    Sabbath
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Milestone Progress Bar Indicator */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
            <span className="font-mono text-stone-600 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9973A]" />
              <span>
                Next Goal: <strong>{nextMilestone.title}</strong> ({nextMilestone.days} Consecutive Days)
              </span>
            </span>
            <span className="font-mono text-[#C9973A] font-bold">
              {daysToNext === 0
                ? "Milestone Achieved!"
                : `${daysToNext} days remaining (${milestoneProgress}%)`}
            </span>
          </div>

          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#C9973A] to-amber-400 rounded-full"
            />
          </div>
        </div>

        {/* Action Link & Motivation Quote */}
        <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-serif italic text-stone-800 block">
              “This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night.”
            </span>
            <span className="text-[10px] font-mono text-stone-500 font-bold">
              — Joshua 1:8 • Scriptorium Fidelity Rule
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => navigate("/recall")}
              className="px-3 py-1.5 bg-[#1C2333] hover:bg-navy text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>Practice Recall</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* MILESTONES MODAL */}
      <AnimatePresence>
        {showMilestonesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMilestonesModal(false)}
              className="fixed inset-0 bg-black backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 z-10 space-y-5 max-h-[85vh] overflow-y-auto text-left"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-[#C9973A]">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-lg text-[#1C2333]">
                      Scripture Mastery Streak Milestones
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      Current Streak: {streakData.currentStreak} Days
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMilestonesModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {milestones.map((m) => (
                  <div
                    key={m.days}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      m.unlocked
                        ? "bg-amber-50/50 border-[#C9973A]/60 shadow-2xs"
                        : "bg-stone-50 border-stone-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs ${
                            m.unlocked
                              ? "bg-[#C9973A] text-white"
                              : "bg-stone-200 text-stone-500"
                          }`}
                        >
                          {m.days}d
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#1C2333]">
                            {m.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#C9973A] font-extrabold uppercase">
                            {m.badge} Tier
                          </span>
                        </div>
                      </div>

                      {m.unlocked ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-400">
                          {m.days - streakData.currentStreak} days to go
                        </span>
                      )}
                    </div>
                    <p className="font-bible italic text-xs text-stone-600 mt-2 pl-9">
                      {m.verse}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowMilestonesModal(false)}
                  className="w-full py-2.5 bg-[#1C2333] hover:bg-navy text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
                >
                  Close Milestones
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
