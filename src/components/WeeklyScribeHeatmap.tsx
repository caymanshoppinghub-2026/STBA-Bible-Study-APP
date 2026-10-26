/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Activity, Sparkles, BookOpen, CheckCircle2, Clock, Flame, Info } from "lucide-react";
import {
  getCurrentWeekHeatmap,
  WeeklyHeatmapDay,
  recordActivity,
  toggleDayDevotional
} from "../utils/activityTracker";

interface WeeklyScribeHeatmapProps {
  sabbathMode?: boolean;
  onOpenStats?: () => void;
  className?: string;
}

export const WeeklyScribeHeatmap: React.FC<WeeklyScribeHeatmapProps> = ({
  sabbathMode = false,
  onOpenStats,
  className = ""
}) => {
  const [heatmapData, setHeatmapData] = useState(() => getCurrentWeekHeatmap());
  const [hoveredDay, setHoveredDay] = useState<WeeklyHeatmapDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<WeeklyHeatmapDay | null>(null);

  const refreshData = () => {
    setHeatmapData(getCurrentWeekHeatmap());
  };

  useEffect(() => {
    refreshData();

    const handleActivityEvent = () => {
      refreshData();
    };

    window.addEventListener("stba-activity-recorded", handleActivityEvent);
    window.addEventListener("storage", handleActivityEvent);

    return () => {
      window.removeEventListener("stba-activity-recorded", handleActivityEvent);
      window.removeEventListener("storage", handleActivityEvent);
    };
  }, []);

  const { days, completedCount, totalGoal, activeRank, totalMinutes } = heatmapData;
  const hasActivityThisWeek = completedCount > 0;

  const handleDayClick = (day: WeeklyHeatmapDay) => {
    setSelectedDay(day);
  };

  const handleQuickLogToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordActivity("bibleStudy", { count: 2, minutes: 25, note: "Daily devotional study" });
    recordActivity("activeRecall", { count: 2, minutes: 15 });
    refreshData();
  };

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 relative text-left ${
        sabbathMode
          ? "bg-[#FAF7F0] border-[#E8E2D1]"
          : "bg-white border-[#E8E4DA] shadow-sm"
      } ${className}`}
      id="weekly-heatmap-card"
    >
      <div className="space-y-3">
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#C9973A]">
            <Activity className="w-4 h-4" />
            <h3 className="font-serif font-bold text-[#1C2333] text-sm tracking-tight">
              Weekly Scribe Heatmap
            </h3>
          </div>
          {onOpenStats && (
            <button
              onClick={onOpenStats}
              className="text-[11px] font-mono font-bold text-[#C9973A] hover:text-[#B0822F] transition-colors cursor-pointer"
            >
              Full Matrix →
            </button>
          )}
        </div>

        {/* Dynamic Subheading */}
        {hasActivityThisWeek ? (
          <div className="space-y-0.5">
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Your active testing streak stands at{" "}
              <strong className="text-[#C9973A] font-bold font-mono">
                {completedCount >= 7 ? "7-day unbroken" : `${completedCount} days`}
              </strong>{" "}
              as verified ({totalMinutes} mins studied):
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            <p className="text-xs text-stone-700 font-semibold font-serif leading-relaxed">
              No activity recorded this week.
            </p>
            <p className="text-[11px] text-[#6B6B6B] italic leading-relaxed font-sans">
              Start a session today to begin your weekly rhythm.
            </p>
          </div>
        )}

        {/* 7-Day Dots Grid Layout */}
        <div className="grid grid-cols-7 gap-1.5 pt-2 text-center relative" id="heatmap-grid-points">
          {days.map((dot, index) => {
            const isHovered = hoveredDay?.dateStr === dot.dateStr;
            return (
              <div
                key={`idx-${index}-${dot.dateStr}`}
                className="flex flex-col items-center space-y-1 relative group"
                onMouseEnter={() => setHoveredDay(dot)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <button
                  onClick={() => handleDayClick(dot)}
                  aria-label={`${dot.dayName} ${dot.formattedDate}: ${dot.active ? "Active" : "Inactive"}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-300 cursor-pointer ${
                    dot.active
                      ? "bg-[#C9973A] border-[#C9973A] text-white shadow-sm hover:bg-[#B0822F] scale-105"
                      : sabbathMode
                      ? "bg-transparent border-[#E8E2D1] text-stone-400 hover:border-[#C9973A]/50 hover:text-stone-600"
                      : "bg-stone-50 border-stone-200 text-stone-400 hover:border-[#C9973A]/50 hover:text-stone-600"
                  } ${dot.isToday ? "ring-2 ring-[#C9973A]/40 ring-offset-1" : ""}`}
                  title={`${dot.dayName} (${dot.formattedDate}): ${
                    dot.active ? `${dot.studyMinutes}m studied • ${dot.totalActivities} activities` : "No activity recorded"
                  }`}
                >
                  {dot.dayAbbr}
                </button>

                {/* Micro indicator if today */}
                {dot.isToday && (
                  <span className="w-1 h-1 rounded-full bg-[#C9973A] block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Hover Tooltip details */}
        {hoveredDay && (
          <div className="mt-2 p-2.5 bg-[#1C2333] text-white rounded-xl text-xs space-y-1 shadow-lg border border-[#2C374D] animate-fadeIn">
            <div className="flex items-center justify-between font-mono text-[10px] text-[#C9973A]">
              <span className="font-bold">{hoveredDay.dayName} ({hoveredDay.formattedDate})</span>
              <span>{hoveredDay.isToday ? "• Today" : ""}</span>
            </div>
            {hoveredDay.active ? (
              <div className="text-[11px] text-stone-300 space-y-0.5">
                <p className="font-semibold text-white">
                  ⏱️ {hoveredDay.studyMinutes} minutes of scripture exegesis
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-stone-400 pt-0.5">
                  {hoveredDay.modules.bibleStudy > 0 && <span>📖 {hoveredDay.modules.bibleStudy} Bible</span>}
                  {hoveredDay.modules.activeRecall > 0 && <span>🧠 {hoveredDay.modules.activeRecall} Recall</span>}
                  {hoveredDay.modules.memoryVault > 0 && <span>🛡️ {hoveredDay.modules.memoryVault} Vault</span>}
                  {hoveredDay.modules.notebook > 0 && <span>✍️ {hoveredDay.modules.notebook} Notes</span>}
                  {hoveredDay.modules.sabbathSchool > 0 && <span>🕊️ {hoveredDay.modules.sabbathSchool} Sabbath School</span>}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-stone-400 italic">
                Rest period. Click to log study session for this day.
              </p>
            )}
          </div>
        )}

        {/* Footer info: Completed Goal & Active Rank */}
        <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-stone-400 border-t border-stone-100">
          <span>Completed Goal: {completedCount}/{totalGoal} days</span>
          <div className="flex items-center space-x-2">
            <span>Active Rank: <strong className="text-stone-600 font-semibold">{activeRank}</strong></span>
            {!hasActivityThisWeek && (
              <button
                onClick={handleQuickLogToday}
                className="px-2 py-0.5 bg-[#C9973A]/10 hover:bg-[#C9973A]/20 text-[#C9973A] rounded border border-[#C9973A]/30 text-[9px] font-bold cursor-pointer transition-colors"
                title="Quick log today's study"
              >
                + Log Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DA] space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C9973A] font-bold">
                  Scribal Day Telemetry
                </span>
                <h4 className="font-serif font-bold text-lg text-[#1C2333]">
                  {selectedDay.dayName}
                </h4>
                <p className="text-xs text-stone-500 font-mono">{selectedDay.formattedDate}</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Status</span>
                <span className={`font-bold font-mono ${selectedDay.active ? "text-emerald-700" : "text-stone-400"}`}>
                  {selectedDay.active ? "✓ Active Study Day" : "Rest Period"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Total Minutes</span>
                <span className="font-bold text-[#1C2333] font-mono">{selectedDay.studyMinutes} mins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Total Activities</span>
                <span className="font-bold text-[#1C2333] font-mono">{selectedDay.totalActivities} items</span>
              </div>

              {selectedDay.active && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                    Module Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Bible Exegesis</span>
                      <span className="font-bold text-stone-800">{selectedDay.modules.bibleStudy} verses</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Active Recall</span>
                      <span className="font-bold text-stone-800">{selectedDay.modules.activeRecall} runs</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Memory Vault</span>
                      <span className="font-bold text-stone-800">{selectedDay.modules.memoryVault} reviews</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Notebook Entries</span>
                      <span className="font-bold text-stone-800">{selectedDay.modules.notebook} notes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                onClick={() => {
                  toggleDayDevotional(selectedDay.dateStr);
                  refreshData();
                  setSelectedDay(null);
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                {selectedDay.active ? "Clear Day" : "Mark as Studied"}
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="px-4 py-1.5 bg-[#C9973A] hover:bg-[#B0822F] text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
