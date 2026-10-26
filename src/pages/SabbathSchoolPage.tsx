/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { UnifiedSabbathSchoolQuarterlyPanel } from "../components/sabbathSchool/UnifiedSabbathSchoolQuarterlyPanel";
import { CollapsibleDailyLessonsSection } from "../components/sabbathSchool/CollapsibleDailyLessonsSection";
import { TalkingPointsSummary } from "../components/sabbathSchool/TalkingPointsSummary";
import { FurtherThought } from "../components/sabbathSchool/FurtherThought";
import { VideoQuizResultsSection } from "../components/sabbathSchool/VideoQuizResultsSection";
import {
  DiscussionDeckSection,
  ClassroomMetricsSection
} from "../components/sabbathSchool/TeacherHelpsSummary";
import { ElderStephenPanel } from "../components/mentor/ElderStephenPanel";
import { LessonNarratorBar } from "../components/sabbathSchool/LessonNarratorBar";
import { useSabbathSchoolStore } from "../store/useSabbathSchoolStore";
import { triggerAutoUpdate } from "../api/sabbathSchoolApi";
import { Sparkles, Calendar, BookOpen, RefreshCw, Sun, Moon, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const SabbathSchoolPage: React.FC = () => {
  const {
    userRole,
    setQuarterlyTitle,
    setLessonTitle,
    setMemoryVerse,
    setDailyLessons,
    setDeckCards,
    readingFontSize,
    setReadingFontSize,
    readingTheme,
    setReadingTheme
  } = useSabbathSchoolStore();

  const isLight = readingTheme === "light";

  const [isHeaderCollapsed, setIsHeaderCollapsed] = React.useState(() => {
    return localStorage.getItem("stba_sabbath_header_collapsed") === "true";
  });

  const toggleHeaderCollapse = () => {
    setIsHeaderCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("stba_sabbath_header_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    const isAutoOn = localStorage.getItem("stba_auto_quarterly_update") !== "false";
    if (isAutoOn) {
      const lastScrape = localStorage.getItem("stba_last_auto_scrape");
      const today = new Date().toISOString().split("T")[0];
      if (lastScrape !== today) {
        triggerAutoUpdate(true)
          .then((res: any) => {
            if (res && res.quarterlyTitle) {
              setQuarterlyTitle(res.quarterlyTitle);
              setLessonTitle(res.lessonTitle);
              setMemoryVerse(res.memoryVerse);
              setDailyLessons(res.dailyLessons);
              setDeckCards(res.deckCards);
              localStorage.setItem("stba_last_auto_scrape", today);
            }
          })
          .catch((err) => console.error("Auto-scrape pull error:", err));
      }
    }
  }, []);

  return (
    <div
      id="sabbath-school-page-container"
      className={`w-full h-full max-h-full flex flex-col font-sans relative overflow-hidden select-text transition-colors duration-150 ${
        isLight ? "bg-[#F4EFE6] text-[#222]" : "bg-[#0D1117] text-[#E6EDF2]"
      }`}
    >
      {/* Scoped custom scroll bar styles */}
      <style>{`
        .custom-scroll-pane::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll-pane::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll-pane::-webkit-scrollbar-thumb {
          background: ${isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.08)"};
          border-radius: 99px;
        }
        .custom-scroll-pane::-webkit-scrollbar-thumb:hover {
          background: ${isLight ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.2)"};
        }
      `}</style>

      {/* Page Header Bar (Collapsible with smooth slide-up animation) */}
      <AnimatePresence initial={false}>
        {!isHeaderCollapsed && (
          <motion.div
            key="sabbath-header-full-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden shrink-0"
          >
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b shrink-0 transition-all duration-200 ${
                isLight
                  ? "bg-[#FFF] border-[#E5DFD5] text-stone-900 shadow-xs"
                  : "bg-[#161B22] border-[#30363D] text-[#E6EDF2]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 border rounded-xl ${
                    isLight
                      ? "bg-amber-100/70 text-amber-800 border-amber-300/60"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <h1
                    className={`text-base md:text-lg font-sans font-bold tracking-tight flex items-center gap-2 ${
                      isLight ? "text-stone-900" : "text-white"
                    }`}
                  >
                    <span>Sabbath School Master Study</span>
                    <Sparkles size={16} className="text-amber-500 fill-amber-500/15 animate-pulse" />
                  </h1>
                  <p
                    className={`text-[10px] font-mono uppercase tracking-wider ${
                      isLight ? "text-stone-500" : "text-neutral-450"
                    }`}
                  >
                    Syllabus & Sabbath School Hub
                  </p>
                </div>
              </div>

              {/* Right side controls: Text Size Options, Theme Switcher, and Collapse Button */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Small, Medium, Large Text Size Options */}
                <div
                  className={`flex items-center p-0.5 rounded-xl border ${
                    isLight ? "bg-stone-100/80 border-[#E8DDC6]/70" : "bg-neutral-900 border-neutral-800/60"
                  }`}
                  title="Adjust Reading Area Text Size"
                >
                  {(["sm", "md", "lg"] as const).map((size) => {
                    const labels = { sm: "Small", md: "Medium", lg: "Large" };
                    const isActive = readingFontSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        id={`btn-topbar-font-${size}`}
                        onClick={() => setReadingFontSize(size)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          isActive
                            ? isLight
                              ? "bg-amber-500 text-neutral-950 shadow-xs"
                              : "bg-amber-500 text-neutral-950 shadow-xs"
                            : isLight
                            ? "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-850"
                        }`}
                      >
                        {labels[size]}
                      </button>
                    );
                  })}
                </div>

                {/* Compact Dark/Light Mode Switcher */}
                <button
                  type="button"
                  id="btn-topbar-theme-toggle"
                  onClick={() => setReadingTheme(isLight ? "dark" : "light")}
                  className={`p-1.5 px-2.5 h-[32px] rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isLight
                      ? "bg-white border-[#E8DDC6]/70 text-stone-700 hover:bg-stone-50 hover:text-amber-800 shadow-2xs"
                      : "border-neutral-800/60 bg-neutral-900 text-neutral-300 hover:text-amber-400 hover:border-amber-500/40"
                  }`}
                  title={isLight ? "Switch to Minimal Dark Theme" : "Switch to Warm Light Theme"}
                >
                  {isLight ? (
                    <Moon className="w-4 h-4 text-amber-600 fill-amber-600/10" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400 fill-amber-400/10" />
                  )}
                </button>

                {/* Collapse Bar Button */}
                <button
                  type="button"
                  id="btn-topbar-collapse"
                  onClick={toggleHeaderCollapse}
                  className={`p-1.5 px-2.5 h-[32px] rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 text-xs font-mono font-medium ${
                    isLight
                      ? "bg-stone-100/80 hover:bg-stone-200/80 border-[#E8DDC6]/70 text-stone-700 shadow-2xs"
                      : "bg-neutral-900 hover:bg-neutral-850 border-neutral-800/60 text-neutral-300 hover:text-amber-400"
                  }`}
                  title="Collapse Sabbath School Master Study Bar"
                >
                  <ChevronUp className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Collapse</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Bar View: Minimal thin strip with expand icon only */}
      {isHeaderCollapsed && (
        <motion.div
          key="sabbath-header-collapsed-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center justify-end px-4 sm:px-6 py-1 border-b shrink-0 transition-colors ${
            isLight
              ? "bg-[#FFF] border-[#E5DFD5] text-stone-900 shadow-2xs"
              : "bg-[#161B22] border-[#30363D] text-[#E6EDF2]"
          }`}
        >
          <button
            type="button"
            id="btn-topbar-expand"
            onClick={toggleHeaderCollapse}
            className={`p-1 px-2.5 h-[28px] rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-medium ${
              isLight
                ? "bg-stone-100/80 hover:bg-stone-200/80 border-[#E8DDC6]/70 text-stone-700 shadow-2xs"
                : "bg-neutral-900 hover:bg-neutral-850 border-neutral-800/60 text-neutral-300 hover:text-amber-400"
            }`}
            title="Expand Sabbath School Master Study Bar"
            aria-label="Expand Sabbath School Master Study Bar"
          >
            <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-[11px] font-mono">Expand</span>
          </button>
        </motion.div>
      )}

      {/* Main Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0 pb-12 lg:pb-0">
        {/* Main Content Pane */}
        <div
          className={`flex-1 lg:overflow-y-auto p-4 md:p-8 space-y-6 custom-scroll-pane min-w-0 transition-colors ${
            isLight ? "bg-[#F4EFE6]" : "bg-[#0D1117]"
          }`}
        >
          <UnifiedSabbathSchoolQuarterlyPanel />

          {/* STUDENT MODE LAYOUT */}
          {userRole === "Student" && (
            <div className="space-y-6">
              {/* 1. Collapsible Lesson Section (Day 1 - 7) */}
              <CollapsibleDailyLessonsSection />

              {/* 2. Theological Takeaways Section */}
              <TalkingPointsSummary />

              {/* 3. Ellen White Commentary Section */}
              <FurtherThought />

              {/* 4. Video Playback Quiz Results Section */}
              <VideoQuizResultsSection />
            </div>
          )}

          {/* TEACHER MODE LAYOUT */}
          {userRole === "Teacher" && (
            <div className="space-y-6">
              {/* 1. Daily Lesson Study (Collapsible Day 1 - 7) */}
              <CollapsibleDailyLessonsSection />

              {/* 2. Theological Takeaways Section */}
              <TalkingPointsSummary />

              {/* 3. Ellen White Commentary Section */}
              <FurtherThought />

              {/* 4. Video Playback Quiz Results Section */}
              <VideoQuizResultsSection />

              {/* 5. Discussion Deck Cards */}
              <DiscussionDeckSection />

              {/* 6. Classroom Metrics & Intelligence */}
              <ClassroomMetricsSection />
            </div>
          )}
        </div>

        {/* Right Companion Panel: Elder Stephen Section (Seamless Layout with No Middle Divider) */}
        <div
          className={`w-full lg:w-[380px] xl:w-[440px] shrink-0 flex flex-col lg:overflow-y-auto p-4 md:p-6 pb-8 md:pb-10 lg:pb-6 space-y-5 custom-scroll-pane mb-8 lg:mb-0 transition-colors ${
            isLight
              ? "bg-[#F4EFE6] text-stone-900"
              : "bg-[#0D1117] text-neutral-100"
          }`}
        >
          {/* Elder Stephen Panel - Fixed Placement & Consistent Mentor Presence across all modes */}
          <div className="space-y-3 pb-2 lg:pb-0">
            <ElderStephenPanel />
          </div>
        </div>
      </div>

      {/* Floating Lesson Narrator Player Bar */}
      <LessonNarratorBar />
    </div>
  );
};

export default SabbathSchoolPage;
