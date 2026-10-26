/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Flame,
  Clock,
  CheckCircle2,
  Filter,
  Info,
  Sparkles,
  BookOpen,
  Brain,
  Shield,
  FileText,
  Compass,
  GraduationCap,
  Award,
  Layers
} from "lucide-react";
import {
  AppModuleId,
  getContributionGridData,
  recordActivity,
  toggleDayDevotional,
  formatIsoDate
} from "../utils/activityTracker";

interface ScribeContributionGraphProps {
  sabbathMode?: boolean;
  className?: string;
}

export const ScribeContributionGraph: React.FC<ScribeContributionGraphProps> = ({
  sabbathMode = false,
  className = ""
}) => {
  const [rangeWeeks, setRangeWeeks] = useState<16 | 26 | 52>(26);
  const [selectedModule, setSelectedModule] = useState<AppModuleId | "all">("all");
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    dayName: string;
    studyMinutes: number;
    totalActivities: number;
    modules: any;
    level: number;
    x: number;
    y: number;
  } | null>(null);

  const [selectedDayDetail, setSelectedDayDetail] = useState<any | null>(null);
  const [gridData, setGridData] = useState(() => getContributionGridData(rangeWeeks, selectedModule));

  const refreshGrid = () => {
    setGridData(getContributionGridData(rangeWeeks, selectedModule));
  };

  useEffect(() => {
    refreshGrid();
  }, [rangeWeeks, selectedModule]);

  useEffect(() => {
    const handleActivityEvent = () => {
      refreshGrid();
    };

    window.addEventListener("stba-activity-recorded", handleActivityEvent);
    window.addEventListener("storage", handleActivityEvent);

    return () => {
      window.removeEventListener("stba-activity-recorded", handleActivityEvent);
      window.removeEventListener("storage", handleActivityEvent);
    };
  }, [rangeWeeks, selectedModule]);

  const { weeks, monthLabels, summary } = gridData;

  const moduleFilters: { id: AppModuleId | "all"; label: string; icon: React.ComponentType<any> }[] = [
    { id: "all", label: "All Modules", icon: Layers },
    { id: "bibleStudy", label: "Bible Exegesis", icon: BookOpen },
    { id: "activeRecall", label: "Active Recall", icon: Brain },
    { id: "memoryVault", label: "Memory Vault", icon: Shield },
    { id: "notebook", label: "Notebook & Reflections", icon: FileText },
    { id: "studyTracks", label: "Study Tracks", icon: Compass },
    { id: "sabbathSchool", label: "Sabbath School", icon: GraduationCap },
    { id: "teachIt", label: "Teach-It", icon: Award }
  ];

  // Helper for cell color by level (0..4)
  const getCellColor = (level: 0 | 1 | 2 | 3 | 4, isToday: boolean) => {
    switch (level) {
      case 0:
        return "bg-stone-100/90 dark:bg-stone-800/40 border-stone-200/60 hover:border-stone-400";
      case 1:
        return "bg-[#E6D7B8] border-[#D4C3A3] text-stone-900 hover:brightness-95";
      case 2:
        return "bg-[#D9BE84] border-[#C4A96E] text-stone-950 hover:brightness-95";
      case 3:
        return "bg-[#C9973A] border-[#B0822F] text-white hover:brightness-95 shadow-2xs";
      case 4:
        return "bg-[#9E7324] border-[#7F5B1A] text-white hover:brightness-110 shadow-xs ring-1 ring-[#C9973A]/40";
      default:
        return "bg-stone-100 border-stone-200";
    }
  };

  const handleCellClick = (dayCell: any) => {
    if (!dayCell) return;
    setSelectedDayDetail(dayCell);
  };

  const dayLabels = [
    { label: "Sun", show: true },
    { label: "Mon", show: true },
    { label: "Tue", show: false },
    { label: "Wed", show: true },
    { label: "Thu", show: false },
    { label: "Fri", show: true },
    { label: "Sat", show: true } // Sabbath
  ];

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 p-6 sm:p-8 space-y-6 text-left ${
        sabbathMode
          ? "bg-[#FAF7F0] border-[#E8E2D1]"
          : "bg-white border-[#E8E4DA] shadow-sm"
      } ${className}`}
      id="scribe-contribution-heatmap-matrix"
    >
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C9973A]/10 text-[#C9973A] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#C9973A]/20">
              Scribal Consistency Matrix
            </span>
            <span className="text-xs font-mono text-stone-400">GitHub-Style Heatmap</span>
          </div>
          <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333]">
            Daily Scripture Study Activity Heatmap
          </h3>
          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Visualizing your daily devotional habit across Bible Exegesis, Active Recall retrieval runs, Memory Vault reviews, Notebook reflections, and Sabbath School lessons.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="p-1 bg-stone-100 rounded-xl border border-stone-200/60 flex items-center text-xs font-mono font-bold">
            <button
              onClick={() => setRangeWeeks(16)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                rangeWeeks === 16
                  ? "bg-white text-[#1C2333] shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              16 Weeks
            </button>
            <button
              onClick={() => setRangeWeeks(26)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                rangeWeeks === 26
                  ? "bg-white text-[#1C2333] shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              6 Months (26 Wks)
            </button>
            <button
              onClick={() => setRangeWeeks(52)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                rangeWeeks === 52
                  ? "bg-white text-[#1C2333] shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              1 Year (52 Wks)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Module Filter Pills */}
      <div className="flex items-center flex-wrap gap-2 pt-1" id="heatmap-module-filters">
        <span className="text-[11px] font-mono text-stone-400 font-bold uppercase tracking-wider mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3 text-[#C9973A]" />
          <span>Filter:</span>
        </span>
        {moduleFilters.map((mod) => {
          const Icon = mod.icon;
          const isSelected = selectedModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#1C2333] text-white border-[#1C2333] shadow-2xs"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#C9973A]" : "text-stone-400"}`} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Heatmap Matrix Grid Container */}
      <div className="relative overflow-x-auto pb-3 pt-2 select-none" id="heatmap-contribution-grid">
        <div className="inline-block min-w-full">
          {/* Month Labels Header */}
          <div className="flex ml-9 mb-1.5 text-[10px] font-mono text-stone-400 uppercase font-bold relative h-4">
            {monthLabels.map((ml, idx) => (
              <div
                key={`m-${idx}`}
                className="absolute"
                style={{ left: `${ml.weekIndex * 15}px` }}
              >
                {ml.month}
              </div>
            ))}
          </div>

          {/* Grid Rows: 7 Days (Sun to Sat) */}
          <div className="flex">
            {/* Day Labels Column */}
            <div className="flex flex-col justify-between pr-2 text-[9.5px] font-mono text-stone-400 font-bold h-[105px] w-8 shrink-0">
              <span className="leading-none">Sun</span>
              <span className="leading-none">Mon</span>
              <span className="leading-none text-transparent select-none">Tue</span>
              <span className="leading-none">Wed</span>
              <span className="leading-none text-transparent select-none">Thu</span>
              <span className="leading-none">Fri</span>
              <span className="leading-none text-[#C9973A]">Sat</span>
            </div>

            {/* Matrix Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((weekCol) => (
                <div key={`w-${weekCol.weekIndex}`} className="flex flex-col gap-[3px]">
                  {weekCol.days.map((dayCell, dayIdx) => {
                    if (!dayCell) {
                      return (
                        <div
                          key={`empty-${dayIdx}`}
                          className="w-[12px] h-[12px] rounded-[2.5px] bg-transparent"
                        />
                      );
                    }

                    const isCellHovered = hoveredCell?.date === dayCell.date;

                    return (
                      <div
                        key={dayCell.date}
                        onClick={() => handleCellClick(dayCell)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: dayCell.date,
                            dayName: dayCell.dayName,
                            studyMinutes: dayCell.studyMinutes,
                            totalActivities: dayCell.totalActivities,
                            modules: dayCell.modules,
                            level: dayCell.level,
                            x: rect.left,
                            y: rect.top
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[12px] h-[12px] rounded-[2.5px] border transition-all duration-150 cursor-pointer ${getCellColor(
                          dayCell.level,
                          dayCell.isToday
                        )} ${
                          dayCell.isToday ? "ring-1 ring-[#C9973A] ring-offset-1" : ""
                        } ${isCellHovered ? "scale-125 z-10 shadow-sm" : ""}`}
                        title={`${dayCell.dayName} (${dayCell.date}): ${
                          dayCell.totalActivities > 0
                            ? `${dayCell.totalActivities} activities • ${dayCell.studyMinutes} mins`
                            : "No activity"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend Row */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 font-mono">
            <div className="flex items-center space-x-2 text-[11px]">
              <Info className="w-3.5 h-3.5 text-[#C9973A]" />
              <span>Click any square to inspect scribal breakdown or log study time.</span>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px]">
              <span className="text-stone-400">Less</span>
              <div className="w-[11px] h-[11px] rounded-[2px] bg-stone-100 border border-stone-200/60" />
              <div className="w-[11px] h-[11px] rounded-[2px] bg-[#E6D7B8] border border-[#D4C3A3]" />
              <div className="w-[11px] h-[11px] rounded-[2px] bg-[#D9BE84] border border-[#C4A96E]" />
              <div className="w-[11px] h-[11px] rounded-[2px] bg-[#C9973A] border-[#B0822F]" />
              <div className="w-[11px] h-[11px] rounded-[2px] bg-[#9E7324] border-[#7F5B1A]" />
              <span className="text-stone-400">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Hover Tooltip Box */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none p-3 bg-[#1C2333] text-white rounded-xl text-xs space-y-1.5 shadow-2xl border border-[#2C374D] animate-fadeIn max-w-xs"
          style={{
            left: `${Math.min(window.innerWidth - 220, Math.max(10, hoveredCell.x - 70))}px`,
            top: `${Math.max(10, hoveredCell.y - 110)}px`
          }}
        >
          <div className="flex items-center justify-between font-mono text-[10px] text-[#C9973A] border-b border-white/10 pb-1">
            <span className="font-bold">{hoveredCell.dayName}</span>
            <span>{hoveredCell.date}</span>
          </div>
          {hoveredCell.totalActivities > 0 ? (
            <div className="space-y-1 text-[11px]">
              <p className="font-semibold text-white">
                ⏱️ {hoveredCell.studyMinutes} mins • {hoveredCell.totalActivities} items studied
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] text-stone-300 font-mono pt-0.5">
                {hoveredCell.modules.bibleStudy > 0 && <div>📖 {hoveredCell.modules.bibleStudy} Bible Exegesis</div>}
                {hoveredCell.modules.activeRecall > 0 && <div>🧠 {hoveredCell.modules.activeRecall} Active Recalls</div>}
                {hoveredCell.modules.memoryVault > 0 && <div>🛡️ {hoveredCell.modules.memoryVault} Vault Reviews</div>}
                {hoveredCell.modules.notebook > 0 && <div>✍️ {hoveredCell.modules.notebook} Notes Written</div>}
                {hoveredCell.modules.sabbathSchool > 0 && <div>🕊️ {hoveredCell.modules.sabbathSchool} Sabbath Lesson</div>}
                {hoveredCell.modules.teachIt > 0 && <div>📜 {hoveredCell.modules.teachIt} Teach Outlines</div>}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-stone-400 italic">No activity recorded for this date.</p>
          )}
        </div>
      )}

      {/* 5. Summary Consistency Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2" id="heatmap-summary-kpis">
        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/60 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-stone-400 text-[10px] font-mono uppercase font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Current Streak</span>
          </div>
          <span className="font-serif font-extrabold text-[#1C2333] text-lg block">
            {summary.currentStreak} Days
          </span>
          <span className="text-[10px] text-stone-500 font-sans">Active daily rhythm</span>
        </div>

        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/60 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-stone-400 text-[10px] font-mono uppercase font-bold">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Longest Streak</span>
          </div>
          <span className="font-serif font-extrabold text-[#C9973A] text-lg block">
            {summary.longestStreak} Days
          </span>
          <span className="text-[10px] text-stone-500 font-sans">Best unbroken devotion</span>
        </div>

        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/60 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-stone-400 text-[10px] font-mono uppercase font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Active Study Days</span>
          </div>
          <span className="font-serif font-extrabold text-indigo-900 text-lg block">
            {summary.activeDaysCount} Days
          </span>
          <span className="text-[10px] text-stone-500 font-sans">In selected range</span>
        </div>

        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/60 space-y-0.5">
          <div className="flex items-center space-x-1.5 text-stone-400 text-[10px] font-mono uppercase font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Total Study Hours</span>
          </div>
          <span className="font-serif font-extrabold text-[#1C2333] text-lg block">
            {(summary.totalMinutes / 60).toFixed(1)} hrs
          </span>
          <span className="text-[10px] text-stone-500 font-sans">{summary.totalContributions} total items</span>
        </div>

        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/60 space-y-0.5 col-span-2 sm:col-span-1">
          <div className="flex items-center space-x-1.5 text-stone-400 text-[10px] font-mono uppercase font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Consistency Rate</span>
          </div>
          <span className="font-serif font-extrabold text-emerald-700 text-lg block">
            {summary.consistencyPercent}%
          </span>
          <span className="text-[10px] text-stone-500 font-sans">Devotional fidelity</span>
        </div>
      </div>

      {/* 6. Day Inspection Modal */}
      {selectedDayDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDayDetail(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E8E4DA] space-y-5 text-left animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C9973A] font-bold">
                  Scribal Daily Inspection
                </span>
                <h4 className="font-serif font-extrabold text-xl text-[#1C2333]">
                  {selectedDayDetail.dayName}
                </h4>
                <p className="text-xs text-stone-500 font-mono">{selectedDayDetail.date}</p>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200/60 flex items-center justify-between">
                <span className="font-medium text-stone-600">Devotional Study Time</span>
                <span className="font-serif font-bold text-[#1C2333] text-sm">
                  {selectedDayDetail.studyMinutes} minutes
                </span>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200/60 flex items-center justify-between">
                <span className="font-medium text-stone-600">Total Activities Logged</span>
                <span className="font-serif font-bold text-[#C9973A] text-sm">
                  {selectedDayDetail.totalActivities} items
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                  Module Breakdown
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-mono">📖 Bible Study</span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedDayDetail.modules.bibleStudy} verses
                    </span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-mono">🧠 Active Recall</span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedDayDetail.modules.activeRecall} runs
                    </span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-mono">🛡️ Memory Vault</span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedDayDetail.modules.memoryVault} reviews
                    </span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-mono">✍️ Notebook</span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedDayDetail.modules.notebook} notes
                    </span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-mono">🕊️ Sabbath School</span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedDayDetail.modules.sabbathSchool} lessons
                    </span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 block font-mono">📜 Teach-It</span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedDayDetail.modules.teachIt} outlines
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-stone-100">
              <button
                onClick={() => {
                  toggleDayDevotional(selectedDayDetail.date);
                  refreshGrid();
                  setSelectedDayDetail(null);
                }}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                {selectedDayDetail.totalActivities > 0 ? "Clear Activity" : "Mark as Studied"}
              </button>

              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 bg-[#C9973A] hover:bg-[#B0822F] text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
