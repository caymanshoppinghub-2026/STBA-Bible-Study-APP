/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";

export const DailyLessonTabs: React.FC = () => {
  const { dailyLessons, selectedDayIndex, setSelectedDayIndex, updateDailyLessonStatus } = useSabbathSchoolStore();

  const normalizeStatus = (status?: string): "Not Started" | "In Progress" | "Complete" => {
    if (!status) return "Not Started";
    const s = status.trim().toLowerCase();
    if (s === "complete" || s === "completed") return "Complete";
    if (s === "in progress") return "In Progress";
    return "Not Started";
  };

  const getStatusIcon = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case "Complete":
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "In Progress":
        return <Clock size={14} className="text-amber-500" />;
      default:
        return <Circle size={14} className="text-neutral-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case "Complete":
        return "border-emerald-900/30 bg-emerald-950/10 text-emerald-400";
      case "In Progress":
        return "border-amber-900/30 bg-amber-950/10 text-amber-400";
      default:
        return "border-neutral-800 bg-neutral-900/30 text-neutral-400";
    }
  };

  return (
    <div id="daily-lesson-tabs" className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-6">
      {dailyLessons.map((day, index) => {
        const isActive = selectedDayIndex === index;
        return (
          <button
            key={index}
            id={`tab-day-${index}`}
            onClick={() => setSelectedDayIndex(index)}
            className={`flex flex-col items-center justify-between p-3 border rounded-xl transition text-center relative ${
              isActive
                ? "border-amber-500 bg-neutral-850 shadow-md ring-1 ring-amber-500/20"
                : "border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-neutral-750"
            }`}
          >
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-neutral-400 mb-1">
              {day.label.split(" ")[0]} {/* e.g. "Day" */}
              <span className="block text-neutral-500 mt-0.5">
                {day.label.substring(day.label.indexOf("(") + 1, day.label.indexOf(")"))}
              </span>
            </span>

            <span className="text-xs font-semibold text-neutral-200 line-clamp-1 mb-2">
              {day.title}
            </span>

            {/* Micro status badge inside the tab button */}
            <div
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering tab select
                const current = normalizeStatus(day.status);
                const nextStatus = 
                  current === "Not Started" ? "In Progress" : 
                  current === "In Progress" ? "Complete" : "Not Started";
                updateDailyLessonStatus(index, nextStatus);
              }}
              title={`Click to cycle study status. Current: ${normalizeStatus(day.status)}`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition hover:scale-105 cursor-pointer ${getStatusClass(day.status)}`}
            >
              {getStatusIcon(day.status)}
              <span className="hidden sm:inline">{normalizeStatus(day.status)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
