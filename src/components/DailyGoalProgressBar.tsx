/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  CheckCircle2,
  Flame,
  Brain,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Award,
  Settings2,
  Check,
  Zap,
  TrendingUp,
  Sliders
} from "lucide-react";
import {
  DailyRecallProgress,
  UserRecallSettings,
  getDailyRecallProgress,
  getUserRecallSettings,
  updateUserRecallSettings,
  getNextDueVerse,
  getRecallQueue
} from "../utils/recallScheduler";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export interface DailyGoalProgressBarProps {
  variant?: "card" | "compact" | "banner";
  className?: string;
  onStartRecall?: () => void;
  showAdjustTarget?: boolean;
}

export const DailyGoalProgressBar: React.FC<DailyGoalProgressBarProps> = ({
  variant = "card",
  className = "",
  onStartRecall,
  showAdjustTarget = true
}) => {
  const navigate = useNavigate();
  const { showConfetti } = useApp();

  const [progress, setProgress] = useState<DailyRecallProgress>(() => getDailyRecallProgress());
  const [settings, setSettings] = useState<UserRecallSettings>(() => getUserRecallSettings());
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [prevCompleted, setPrevCompleted] = useState<number>(progress.completedToday);

  // Sync state on events
  const refreshProgress = () => {
    const p = getDailyRecallProgress();
    const s = getUserRecallSettings();
    setProgress(p);
    setSettings(s);

    // Check if goal was just reached
    if (p.completedToday >= p.goal && prevCompleted < p.goal && p.completedToday > 0) {
      setShowCelebration(true);
      try {
        showConfetti?.('recall');
      } catch (e) {
        // Safe fallback
      }
    }
    setPrevCompleted(p.completedToday);
  };

  useEffect(() => {
    refreshProgress();

    const handleRecallCompleted = () => {
      refreshProgress();
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "stba_daily_verse_limit" ||
        e.key === "stba_today_recalls_count" ||
        e.key === "stba_today_recalls_date" ||
        e.key === "stba_today_recalls_verse_ids"
      ) {
        refreshProgress();
      }
    };

    window.addEventListener("stba-recall-completed", handleRecallCompleted);
    window.addEventListener("stba-activity-recorded", handleRecallCompleted);
    window.addEventListener("stba-settings-updated", handleRecallCompleted);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("stba-recall-completed", handleRecallCompleted);
      window.removeEventListener("stba-activity-recorded", handleRecallCompleted);
      window.removeEventListener("stba-settings-updated", handleRecallCompleted);
      window.removeEventListener("storage", handleStorage);
    };
  }, [prevCompleted, showConfetti]);

  const handleUpdateTarget = (newLimit: number) => {
    const updated = updateUserRecallSettings({ dailyVerseLimit: newLimit });
    setSettings(updated);
    localStorage.setItem("stba_daily_verse_limit", newLimit.toString());
    const updatedProg = getDailyRecallProgress();
    setProgress(updatedProg);
    setIsEditingTarget(false);

    window.dispatchEvent(
      new CustomEvent("stba-settings-updated", {
        detail: { dailyVerseLimit: newLimit }
      })
    );
  };

  const handleLaunchRecall = () => {
    if (onStartRecall) {
      onStartRecall();
      return;
    }
    const nextVerse = getNextDueVerse();
    window.dispatchEvent(
      new CustomEvent("stba-trigger-recall-popup", {
        detail: { verse: nextVerse }
      })
    );
  };

  const goal = progress.goal > 0 ? progress.goal : 5;
  const completed = progress.completedToday;
  const percentage = Math.min(100, Math.round((completed / goal) * 100));
  const isGoalAchieved = completed >= goal;
  const remaining = Math.max(0, goal - completed);

  // Lookup details for verses completed today
  const allScriptures = Object.values(SCRIPTURE_DATABASE).flat();
  const completedVerseDetails = progress.completedVerseIds.map((id) => {
    const foundInDb = allScriptures.find((s) => s.id === id);
    if (foundInDb) return foundInDb;
    const queue = getRecallQueue();
    const queueItem = queue.find((q) => q.scriptureId === id || q.id === id);
    return {
      id,
      reference: queueItem?.reference || id,
      text: queueItem?.text || "Scripture verse mastered today",
      keywords: queueItem?.keywords || []
    };
  });

  // Target preset options for rapid selection
  const targetOptions = [1, 2, 3, 5, 7, 10];

  // -------------------------------------------------------------
  // COMPACT VARIANT (for TopBar, Sidebar, or Header widgets)
  // -------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div
        id="daily-goal-compact-widget"
        className={`p-3 bg-[#FAF7F0] border border-[#E8E4DA] rounded-2xl flex flex-col gap-2 font-sans select-none ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#C9973A]" />
            <span className="text-[11px] font-serif font-bold text-[#1C2333]">Daily Recall Goal</span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isGoalAchieved ? "bg-emerald-500/15 text-emerald-800" : "bg-[#C9973A]/15 text-[#C9973A]"
            }`}
          >
            {completed}/{goal} Verses
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E8E4DA]/60 h-2 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isGoalAchieved
                ? "bg-gradient-to-r from-emerald-600 to-teal-500"
                : "bg-gradient-to-r from-[#C9973A] to-amber-500"
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>{percentage}% completed</span>
          <span>{isGoalAchieved ? "Goal Reached! 🌟" : `${remaining} left today`}</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // BANNER VARIANT (thin horizontal bar)
  // -------------------------------------------------------------
  if (variant === "banner") {
    return (
      <div
        id="daily-goal-banner-widget"
        className={`px-4 py-3 bg-[#FAF7F0] border border-[#E8E4DA] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 font-sans select-none ${className}`}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-[#C9973A]/10 text-[#C9973A] rounded-xl shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xs text-[#1C2333]">Daily Recall Goal</span>
              <span className="text-[9.5px] font-mono text-stone-500 font-bold">
                {completed} of {goal} Verses ({percentage}%)
              </span>
            </div>
            <p className="text-[10.5px] text-stone-500 font-serif">
              {isGoalAchieved ? "You reached your target for today! Praise the Lord." : `${remaining} more verses to reach today's target.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="w-32 bg-[#E8E4DA]/60 h-2 rounded-full overflow-hidden hidden md:block">
            <div
              className={`h-full rounded-full ${isGoalAchieved ? "bg-emerald-600" : "bg-[#C9973A]"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <button
            onClick={handleLaunchRecall}
            className="px-3.5 py-1.5 bg-[#C9973A] hover:bg-[#B0822F] text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Practice Recall</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL CARD VARIANT (Primary Dashboard Widget)
  // -------------------------------------------------------------
  return (
    <motion.section
      id="daily-study-goal-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden text-left font-sans select-none space-y-5 sheen-overlay ${className}`}
    >
      {/* Subtle background aura */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isGoalAchieved ? "bg-emerald-500/10" : "bg-[#F3CF65]/10"
        }`}
      />

      {/* TOP HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0d3060] pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl shrink-0 transition-colors ${
              isGoalAchieved
                ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30"
                : "bg-[#E5B842]/20 text-[#F3CF65] ring-2 ring-[#E5B842]/30"
            }`}
          >
            {isGoalAchieved ? (
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            ) : (
              <Target className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-black text-white tracking-tight m-0 p-0 leading-tight">
              Active Recall Goal Progress
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F3CF65] bg-[#E5B842]/15 px-2.5 py-0.5 rounded-md border border-[#E5B842]/30">
                Daily Study Target
              </span>
              {progress.streak > 0 && (
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/30">
                  <Flame className="w-3 h-3 fill-current text-amber-400" />
                  <span>{progress.streak}-Day Streak</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action / Settings toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {showAdjustTarget && (
            <button
              id="adjust-daily-target-btn"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isEditingTarget
                  ? "bg-[#F3CF65] text-[#06162c] border-[#F3CF65]"
                  : "bg-[#0d3060]/60 hover:bg-[#0d3060] border-[#E5B842]/30 text-stone-200"
              }`}
              title="Change your daily target number of verses"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Target: {goal}/day</span>
            </button>
          )}

          <button
            id="refresh-daily-goal-btn"
            onClick={refreshProgress}
            className="p-1.5 bg-[#0d3060]/60 hover:bg-[#0d3060] border border-[#E5B842]/30 text-stone-300 hover:text-white rounded-xl cursor-pointer transition-colors"
            title="Refresh progress telemetry"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* INLINE TARGET ADJUSTMENT PANEL */}
      <AnimatePresence>
        {isEditingTarget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-[#0d3060]/70 border border-[#E5B842]/30 rounded-2xl space-y-2.5 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-white">
                Select Daily Scripture Target:
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                Pacing guideline: 3-5 verses daily for optimal retention
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleUpdateTarget(opt)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    goal === opt
                      ? "gold-metallic-btn scale-105"
                      : "bg-[#06162c] text-stone-300 border border-[#0d3060] hover:bg-[#0d3060] hover:text-white"
                  }`}
                >
                  {opt} {opt === 1 ? "Verse" : "Verses"} / day
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS SUMMARY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#06162c]/60 p-3.5 rounded-2xl border border-[#0d3060]">
        <div className="space-y-0.5 border-r border-[#0d3060] pr-2">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest font-bold block">
            Completed Today
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl font-black text-white">{completed}</span>
            <span className="text-xs font-mono text-stone-400">/ {goal}</span>
          </div>
        </div>

        <div className="space-y-0.5 sm:border-r border-[#0d3060] sm:pr-2">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest font-bold block">
            Target Completion
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`font-serif text-2xl font-black ${isGoalAchieved ? "text-emerald-400" : "text-[#F3CF65]"}`}>
              {percentage}%
            </span>
          </div>
        </div>

        <div className="space-y-0.5 border-r border-[#0d3060] pr-2">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest font-bold block">
            Remaining Today
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl font-black text-white">{remaining}</span>
            <span className="text-[10px] font-serif text-stone-400">{remaining === 1 ? "verse" : "verses"}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest font-bold block">
            Goal Status
          </span>
          <span
            className={`inline-block text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md mt-1 ${
              isGoalAchieved
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : completed > 0
                ? "bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/40"
                : "bg-stone-800 text-stone-400"
            }`}
          >
            {isGoalAchieved ? "Goal Met 🎉" : completed > 0 ? "In Progress" : "Pending Study"}
          </span>
        </div>
      </div>

      {/* VISUAL PROGRESS BAR WITH STEPPED MILESTONE TICKS */}
      <div className="space-y-2.5" id="daily-goal-visual-bar-container">
        <div className="flex items-center justify-between text-xs font-serif">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span>Daily Recall Progress</span>
            {isGoalAchieved && (
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.2 rounded-full border border-emerald-500/30">
                Target Met!
              </span>
            )}
          </span>
          <span className="font-mono text-[11px] font-bold text-stone-300">
            {completed} of {goal} Verses ({percentage}%)
          </span>
        </div>

        {/* Master Progress Track */}
        <div className="relative w-full h-4 sm:h-5 bg-[#06162c] rounded-full overflow-hidden p-0.5 border border-[#0d3060]">
          <motion.div
            id="daily-goal-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full transition-colors relative overflow-hidden ${
              isGoalAchieved
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm"
                : "bg-gradient-to-r from-[#F3CF65] via-[#E5B842] to-[#C9973A]"
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-white/25 transform -skew-x-12 animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        {/* STEPPED MILESTONE TICKS (Segment points for each verse in the daily goal) */}
        {goal <= 10 && (
          <div className="flex justify-between items-center px-1 pt-0.5">
            {Array.from({ length: goal }).map((_, idx) => {
              const isChecked = idx < completed;
              const isCurrent = idx === completed;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
                      isChecked
                        ? "bg-emerald-500 text-[#06162c] ring-2 ring-emerald-300"
                        : isCurrent
                        ? "bg-[#F3CF65] text-[#06162c] ring-2 ring-[#F3CF65]/50 animate-pulse"
                        : "bg-[#0d3060] text-stone-400"
                    }`}
                    title={`Verse ${idx + 1} of ${goal} ${isChecked ? "(Mastered Today)" : ""}`}
                  >
                    {isChecked ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                  </div>
                  <span className="text-[8.5px] font-mono text-stone-400 hidden sm:inline">
                    V{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETED VERSES TODAY CAROUSEL / PILLS */}
      {completedVerseDetails.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-[#0d3060]">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-stone-400">
            <span className="uppercase tracking-wider font-bold text-stone-300">
              Verses Mastered Today ({completedVerseDetails.length})
            </span>
            <span className="text-emerald-400 font-bold">Verified in Storage</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {completedVerseDetails.map((v, i) => (
              <div
                key={v.id + "-" + i}
                className="px-3 py-1.5 bg-[#06162c] border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs font-serif text-stone-200 shadow-sm"
              >
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-bold">{v.reference}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS & DOCTRINAL ENCOURAGEMENT */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#0d3060]">
        <p className="text-[11px] text-stone-400 font-bible italic flex items-center gap-1.5">
          <span>“They searched the scriptures daily, whether those things were so.”</span>
          <span className="font-mono text-[9px] font-bold text-[#F3CF65] not-italic">(Acts 17:11)</span>
        </p>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <button
            id="start-daily-recall-session-btn"
            onClick={handleLaunchRecall}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
              isGoalAchieved
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "gold-metallic-btn"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>{isGoalAchieved ? "Practice Bonus Recall" : "Start Next Verse Recall"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.section>
  );
};
