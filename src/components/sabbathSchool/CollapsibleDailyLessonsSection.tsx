/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, CheckCircle2, Clock, Circle, Sparkles, ChevronDown, ChevronUp, CheckSquare, RefreshCw, Quote, Volume2, Pause, Play, Square } from "lucide-react";
import { CollapsibleContainer } from "./CollapsibleContainer";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { WeeklyNotebookDrawer } from "./WeeklyNotebookDrawer";
import { VerseModal } from "../VerseModal";
import { separateLessonAndEgwNotes, reformatParagraphText, getScriptureRegex } from "../../utils/sabbathUtils";
import { useLessonNarrator } from "../../hooks/useLessonNarrator";

export const CollapsibleDailyLessonsSection: React.FC = () => {
  const {
    dailyLessons,
    selectedDayIndex,
    setSelectedDayIndex,
    updateDailyLessonStatus,
    chatWithElderStephen,
    isElderLoading,
    readingFontSize,
    readingTheme
  } = useSabbathSchoolStore();

  const narrator = useLessonNarrator();

  const isLight = readingTheme === "light";

  const getBodyFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[13px] sm:text-sm leading-relaxed";
      case "md":
        return "text-[15px] sm:text-base leading-relaxed";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl md:text-2xl leading-relaxed sm:leading-loose";
      default:
        return "text-[13px] sm:text-sm leading-relaxed";
    }
  };

  const getHeaderFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-sm font-bold";
      case "md":
        return "text-base sm:text-lg font-bold";
      case "lg":
      case "xl":
        return "text-xl sm:text-2xl font-bold";
      default:
        return "text-sm font-bold";
    }
  };

  const getDayTitleFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-base";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl";
      default:
        return "text-sm";
    }
  };

  const getDayLabelFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[10px]";
      case "md":
        return "text-xs";
      case "lg":
      case "xl":
        return "text-xs sm:text-sm";
      default:
        return "text-[10px]";
    }
  };

  const getScriptureBadgeFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-xs sm:text-sm";
      case "lg":
      case "xl":
        return "text-sm sm:text-base md:text-lg";
      default:
        return "text-xs";
    }
  };

  const [openDays, setOpenDays] = useState<{ [key: number]: boolean }>({});

  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [isVerseModalOpen, setIsVerseModalOpen] = useState<boolean>(false);

  // Pre-prepare background narration for immediate playback
  React.useEffect(() => {
    if (dailyLessons && dailyLessons.length > 0) {
      dailyLessons.forEach((day, idx) => {
        if (openDays[idx] || idx === selectedDayIndex) {
          narrator.prepareNarration(idx, day.title, day.content);
        }
      });
    }
  }, [openDays, selectedDayIndex, dailyLessons]);

  const handleOpenVerseModal = (ref: string) => {
    const normalized = ref.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
    setSelectedVerseRef(normalized);
    setIsVerseModalOpen(true);
  };

  const renderContentWithVerseTriggers = (content: any) => {
    // 1. Relocate all Ellen G. White quotes out of the daily lesson into Ellen White Notes
    const { mainParagraphs } = separateLessonAndEgwNotes(content);

    return mainParagraphs.map((block, pIdx) => {
      // Normalize non-breaking spaces
      const textToParse = block.replace(/\u00A0/g, " ").trim();
      if (!textToParse) return null;

      // Check for header tags like ### Header Title or ## Header Title
      if (textToParse.startsWith("###") || textToParse.startsWith("##")) {
        const headerTitle = textToParse.replace(/^#+\s*/, "").trim();
        return (
          <div key={`head-${pIdx}`} className={`pt-3 pb-1.5 border-b my-2 ${isLight ? "border-amber-300" : "border-amber-500/20"}`}>
            <h5 className={`font-sans tracking-wide flex items-center gap-2 ${getHeaderFontSizeClass(readingFontSize)} ${isLight ? "text-amber-900" : "text-amber-400"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{headerTitle}</span>
            </h5>
          </div>
        );
      }

      // Check for standalone bold header like **Section Title**
      if (/^\*\*[^*]+\*\*$/.test(textToParse)) {
        const headerTitle = textToParse.replace(/\*\*/g, "").trim();
        return (
          <div key={`head-${pIdx}`} className={`pt-3 pb-1.5 border-b my-2 ${isLight ? "border-amber-300" : "border-amber-500/20"}`}>
            <h5 className={`font-sans tracking-wide flex items-center gap-2 ${getHeaderFontSizeClass(readingFontSize)} ${isLight ? "text-amber-900" : "text-amber-400"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{headerTitle}</span>
            </h5>
          </div>
        );
      }

      // Check for blockquotes like > "Quote"
      if (textToParse.startsWith(">")) {
        const quoteText = textToParse.replace(/^>\s*/, "").trim();
        return (
          <div
            key={`quote-${pIdx}`}
            className={`my-3 p-4 rounded-xl font-lato font-['Lato',sans-serif] w-full ${getBodyFontSizeClass(readingFontSize)} ${
              isLight
                ? "bg-amber-50/70 border border-amber-300/80 text-amber-950 shadow-2xs"
                : "bg-neutral-900/80 border border-amber-500/30 text-amber-200 shadow-2xs"
            }`}
          >
            <p className="leading-relaxed not-italic">“{quoteText}”</p>
          </div>
        );
      }

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      const regex = getScriptureRegex();
      while ((match = regex.exec(textToParse)) !== null) {
        const fullMatch = match[0];
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
          parts.push(textToParse.substring(lastIndex, matchIndex));
        }

        parts.push(
          <button
            key={`ref-${pIdx}-${matchIndex}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenVerseModal(fullMatch);
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md font-mono font-bold transition-all cursor-pointer shadow-2xs ${getScriptureBadgeFontSizeClass(readingFontSize)} ${
              isLight
                ? "bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#78350F] border border-[#FACC15] underline decoration-[#CA8A04]/60 hover:decoration-[#A16207]"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 underline decoration-amber-400/60 hover:decoration-amber-300"
            }`}
            title={`Click to read ${fullMatch} passage`}
          >
            <span>{fullMatch}</span>
          </button>
        );

        lastIndex = matchIndex + fullMatch.length;
      }

      if (lastIndex < textToParse.length) {
        parts.push(textToParse.substring(lastIndex));
      }

      return (
        <p key={pIdx} className={`my-2.5 font-lato font-['Lato',sans-serif] ${getBodyFontSizeClass(readingFontSize)} ${isLight ? "text-stone-800" : "text-neutral-200"} leading-relaxed text-left antialiased`}>
          {parts.length > 0 ? parts : textToParse}
        </p>
      );
    });
  };

  const normalizeStatus = (status?: string): "Not Started" | "In Progress" | "Complete" => {
    if (!status) return "Not Started";
    const s = status.trim().toLowerCase();
    if (s === "complete" || s === "completed") return "Complete";
    if (s === "in progress") return "In Progress";
    return "Not Started";
  };

  const getLessonDateDisplay = (day: { label?: string; date?: string }, index: number): string => {
    if (day.date && typeof day.date === "string" && day.date.trim().length > 0) {
      let d = day.date.trim();
      d = d.replace(/^Day\s*\d+[\s:–—\-()]+/i, "").replace(/\)$/, "").trim();
      if (d) return d;
    }
    const label = day.label || "";
    // Check if label contains parenthesis: e.g. "Day 1 (Saturday, August 1)" or "Day 1 (Saturday, September 5th)"
    const parenMatch = label.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1]) {
      let d = parenMatch[1].trim();
      d = d.replace(/^Day\s*\d+[\s:–—\-()]+/i, "").trim();
      if (d) return d;
    }
    // Check if label starts with "Day X - Date" or "Day X: Date"
    let cleaned = label.replace(/^Day\s*\d+[\s:–—\-()]+/i, "").replace(/\)$/, "").trim();
    if (cleaned && !/^Day\s*\d+$/i.test(cleaned)) {
      return cleaned;
    }
    const defaultDays = [
      "Saturday, September 5th",
      "Sunday, September 6th",
      "Monday, September 7th",
      "Tuesday, September 8th",
      "Wednesday, September 9th",
      "Thursday, September 10th",
      "Friday, September 11th"
    ];
    return defaultDays[index % 7];
  };

  const toggleDayOpen = (index: number) => {
    const isCurrentlyOpen = !!openDays[index];
    const willOpen = !isCurrentlyOpen;

    setOpenDays((prev) => ({
      ...prev,
      [index]: willOpen
    }));
    setSelectedDayIndex(index);

    // Automatically change to "In Progress" when user opens the accordion panel
    if (willOpen) {
      const currentStatus = normalizeStatus(dailyLessons[index]?.status);
      if (currentStatus === "Not Started") {
        updateDailyLessonStatus(index, "In Progress");
      }
    }
  };

  const handleStatusClick = (index: number, currentRawStatus?: string) => {
    const status = normalizeStatus(currentRawStatus);
    if (status === "Complete") {
      updateDailyLessonStatus(index, "In Progress");
    } else {
      updateDailyLessonStatus(index, "Complete");
    }
  };

  const getStatusIcon = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "Complete":
        return <CheckCircle2 size={13} className={isLight ? "text-emerald-600 shrink-0" : "text-emerald-400 shrink-0"} />;
      case "In Progress":
        return <Clock size={13} className={isLight ? "text-amber-600 shrink-0 animate-pulse" : "text-amber-400 shrink-0 animate-pulse"} />;
      default:
        return <Circle size={13} className={isLight ? "text-stone-400 shrink-0" : "text-stone-300 shrink-0"} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const normalized = normalizeStatus(status);
    if (isLight) {
      switch (normalized) {
        case "Complete":
          return "bg-emerald-100/90 border-emerald-400/80 text-emerald-800 hover:bg-emerald-200/90";
        case "In Progress":
          return "bg-amber-100/90 border-amber-400/80 text-amber-900 hover:bg-amber-200/90";
        default:
          return "bg-stone-100 border-stone-300 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 hover:border-[#D4A346]/60";
      }
    } else {
      switch (normalized) {
        case "Complete":
          return "bg-emerald-500/25 border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/35 hover:border-emerald-300";
        case "In Progress":
          return "bg-amber-500/25 border-amber-400/60 text-amber-300 hover:bg-amber-500/35 hover:border-amber-300";
        default:
          return "bg-white/10 border-white/20 text-stone-200 hover:bg-white/20 hover:text-white hover:border-[#D4A346]/60";
      }
    }
  };

  const handleAskElderStephenAboutDay = (dayIndex: number) => {
    const day = dailyLessons[dayIndex];
    if (!day) return;
    const prompt = `Could you give a simple summary or key takeaway for today's study on "${day.title}"?`;
    chatWithElderStephen(prompt, `Discussing ${day.label}: "${day.title}"`);
  };

  const completedCount = dailyLessons.filter((d) => normalizeStatus(d.status) === "Complete").length;

  return (
    <>
      <CollapsibleContainer
        id="collapsible-daily-lessons-section"
        title="Daily Lesson Study (Day 1–7)"
        subtitle={`${completedCount} of 7 days completed • Tap any day to expand full study text`}
        badge={`${completedCount}/7 Complete`}
        icon={<BookOpen size={20} />}
        defaultOpen={false}
        className="mb-6"
      >
        <div className="space-y-3">
          {dailyLessons.map((day, index) => {
            const isDayOpen = !!openDays[index];
            const currentStatus = normalizeStatus(day.status);
            const isCompleted = currentStatus === "Complete";
            const formattedDate = getLessonDateDisplay(day, index);
            const isCurrentlyReadingThisDay = narrator.activeDayIndex === index && (narrator.isSpeaking || narrator.isLoading || narrator.isPaused);

            return (
              <div
                key={index}
                id={`daily-lesson-accordion-${index}`}
                className={`group border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isDayOpen
                    ? "border-[#D4A346] ring-1 ring-[#D4A346]/60 shadow-md"
                    : "border-[#D4A346]/70 hover:border-[#D4A346] hover:ring-1 hover:ring-[#D4A346]/50 hover:shadow-[0_0_15px_rgba(212,163,70,0.20)] shadow-2xs"
                } ${
                  isLight ? "bg-white" : "bg-[#161B22]"
                }`}
              >
                {/* Front Panel Top - Blue fill ONLY in Night Mode, original warm light styling in Day Mode; Gold trim in both */}
                <div
                  onClick={() => toggleDayOpen(index)}
                  className={`p-3.5 sm:p-4 cursor-pointer select-none transition-colors border-b border-[#D4A346]/40 ${
                    isLight
                      ? "bg-[#FAF7F2] hover:bg-[#F5EFE6] text-stone-900"
                      : "bg-gradient-to-r from-[#071124] via-[#0E1E42] to-[#071124] text-white"
                  }`}
                >
                  {/* Top Row: Left side has Day emblem + Title; Right side has Status button + Chevron */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Top Left: Day emblem + Lesson Title right at top */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      {/* Day 1 Emblem in top left corner with thin gold trim */}
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-mono font-bold rounded-lg shrink-0 border border-[#D4A346]/70 shadow-2xs tracking-wide ${
                          isLight
                            ? "bg-amber-100/90 text-amber-900"
                            : "bg-[#D4A346]/20 text-[#F5CF78]"
                        }`}
                      >
                        Day {index + 1}
                      </span>

                      {/* Lesson Title right at top next to emblem */}
                      <h4
                        className={`${getDayTitleFontSizeClass(readingFontSize)} font-sans font-bold tracking-tight truncate sm:whitespace-normal leading-snug ${
                          isLight ? "text-stone-900" : "text-white"
                        }`}
                      >
                        {day.title}
                      </h4>
                    </div>

                    {/* Right side: Status Button & Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Badge Toggle */}
                      <button
                        type="button"
                        id={`btn-daily-lesson-status-${index}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(index, day.status);
                        }}
                        title={
                          isCompleted
                            ? "Marked Complete (Click to set In Progress)"
                            : "Click to mark as Complete"
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs ${getStatusBadgeClass(
                          day.status
                        )}`}
                      >
                        {getStatusIcon(day.status)}
                        <span>{currentStatus}</span>
                      </button>

                      {/* Accordion Chevron */}
                      <div className={`p-1 rounded-md transition-colors ${
                        isLight ? "text-stone-500 group-hover:text-stone-900" : "text-stone-300 group-hover:text-white"
                      }`}>
                        {isDayOpen ? (
                          <ChevronUp size={18} className="text-[#D4A346]" />
                        ) : (
                          <ChevronDown size={18} className={isLight ? "text-stone-500" : "text-stone-300"} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Below the title, center the date (e.g., “Saturday, September 5th”) underneath - NO duplicate Day label */}
                  <div className="mt-2 text-center w-full">
                    <span
                      className={`inline-block text-xs sm:text-sm font-sans font-medium tracking-wide ${
                        isLight ? "text-[#8C6B28]" : "text-[#E8C77B]/95"
                      }`}
                    >
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Day Expanded Full Content */}
                {isDayOpen && (
                  <div
                    className={`px-4 pb-5 pt-2 border-t border-[#D4A346]/40 text-left animate-fade-in ${
                      isLight
                        ? "bg-[#FDFBF7] text-stone-900"
                        : "bg-[#0D1117] text-[#E6EDF2]"
                    }`}
                  >
                    {(() => {
                      const { mainParagraphs, egwParagraphs } = separateLessonAndEgwNotes(
                        day.content,
                        (day as any).egwNotes
                      );

                      return (
                        <div className="my-3 max-w-4xl max-h-[480px] overflow-y-auto pr-2 custom-scrollbar space-y-3 font-lato font-['Lato',sans-serif]">
                          {mainParagraphs.length > 0 ? (
                            renderContentWithVerseTriggers(mainParagraphs)
                          ) : (
                            <p className={isLight ? "text-stone-500 italic" : "text-neutral-450 italic"}>
                              No detailed content loaded for this day.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Interactive Action Row */}
                    <div className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isLight ? "border-stone-200" : "border-neutral-850"}`}>
                      <button
                        type="button"
                        onClick={() => handleAskElderStephenAboutDay(index)}
                        disabled={isElderLoading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800"
                            : "bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-neutral-200 hover:text-white"
                        }`}
                      >
                        {isElderLoading ? (
                          <RefreshCw size={12} className="animate-spin text-amber-500" />
                        ) : (
                          <Sparkles size={12} className="text-amber-500" />
                        )}
                        <span>Discuss Day with Elder Stephen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsNotebookOpen(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isLight
                            ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800"
                            : "bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-neutral-300 hover:text-white"
                        }`}
                      >
                        <CheckSquare size={12} className="text-amber-500" />
                        <span>Open Study Notebook</span>
                      </button>

                      {/* Manual Mark as Complete Button inside expanded view */}
                      <button
                        type="button"
                        id={`btn-mark-complete-${index}`}
                        onClick={() => handleStatusClick(index, day.status)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60"
                            : isLight
                            ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                            : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>Completed (Click to unmark)</span>
                          </>
                        ) : (
                          <>
                            <CheckSquare size={12} className="text-amber-500" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </button>

                      {/* Read Lesson Aloud Button right next to Mark as Complete */}
                      <button
                        type="button"
                        id={`btn-read-lesson-aloud-${index}`}
                        onClick={() => narrator.toggleLesson(index, day.title, day.content)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs ${
                          isCurrentlyReadingThisDay && narrator.isSpeaking && !narrator.isPaused
                            ? "bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-[0_0_12px_rgba(212,163,70,0.35)]"
                            : isCurrentlyReadingThisDay && narrator.isPaused
                            ? isLight
                              ? "bg-amber-100 border-amber-400 text-amber-900"
                              : "bg-amber-500/20 border-amber-500/50 text-amber-300"
                            : isLight
                            ? "bg-amber-50/80 hover:bg-amber-100/90 border-amber-300 text-amber-900"
                            : "bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-neutral-200 hover:text-amber-400"
                        }`}
                        title="Read lesson text aloud with Microsoft Emma's multilingual (natural) voice (Web Speech API)"
                      >
                        {isCurrentlyReadingThisDay && narrator.isLoading ? (
                          <>
                            <RefreshCw size={12} className="animate-spin text-amber-500" />
                            <span>Preparing Microsoft Emma's Narration...</span>
                          </>
                        ) : isCurrentlyReadingThisDay && narrator.isSpeaking && !narrator.isPaused ? (
                          <>
                            <Pause size={12} className="text-stone-950 fill-stone-950" />
                            <span>Pause Narration</span>
                            <span className="flex items-center gap-0.5 ml-1">
                              <span className="w-0.5 h-2 bg-stone-950 animate-pulse rounded-full"></span>
                              <span className="w-0.5 h-3 bg-stone-950 animate-pulse delay-75 rounded-full"></span>
                              <span className="w-0.5 h-1.5 bg-stone-950 animate-pulse delay-150 rounded-full"></span>
                            </span>
                          </>
                        ) : isCurrentlyReadingThisDay && narrator.isPaused ? (
                          <>
                            <Play size={12} className="text-amber-500 fill-amber-500" />
                            <span>Resume Narration</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} className="text-amber-500" />
                            <span>Read Lesson Aloud</span>
                          </>
                        )}
                      </button>

                      {isCurrentlyReadingThisDay && (narrator.isSpeaking || narrator.isPaused) && (
                        <button
                          type="button"
                          id={`btn-stop-narration-${index}`}
                          onClick={() => narrator.stop()}
                          className={`p-1.5 border rounded-lg text-xs transition cursor-pointer ${
                            isLight
                              ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-600"
                              : "bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-400 hover:text-white"
                          }`}
                          title="Stop Narration"
                        >
                          <Square size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContainer>

      <WeeklyNotebookDrawer isOpen={isNotebookOpen} onClose={() => setIsNotebookOpen(false)} />

      {/* Adventech Style Bible Verse Modal */}
      <VerseModal
        isOpen={isVerseModalOpen}
        reference={selectedVerseRef}
        onClose={() => setIsVerseModalOpen(false)}
      />
    </>
  );
};
