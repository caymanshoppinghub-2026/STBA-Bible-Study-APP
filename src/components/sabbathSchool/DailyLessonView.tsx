/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BookOpen, CheckSquare, Sparkles, RefreshCw, Quote, Volume2, Pause, Play, Square, CheckCircle2 } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { WeeklyNotebookDrawer } from "./WeeklyNotebookDrawer";
import { VerseModal } from "../VerseModal";
import { separateLessonAndEgwNotes, reformatParagraphText, getScriptureRegex, formatStandardReference } from "../../utils/sabbathUtils";
import { useLessonNarrator } from "../../hooks/useLessonNarrator";

export const DailyLessonView: React.FC = () => {
  const {
    dailyLessons,
    selectedDayIndex,
    updateDailyLessonStatus,
    chatWithElderStephen,
    isElderLoading,
    readingFontSize,
    readingTheme
  } = useSabbathSchoolStore();

  const narrator = useLessonNarrator();

  const isLight = readingTheme === "light";
  const activeDay = dailyLessons[selectedDayIndex];
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [isVerseModalOpen, setIsVerseModalOpen] = useState<boolean>(false);

  // Pre-prepare audio narration in the background for immediate playback
  useEffect(() => {
    if (activeDay) {
      narrator.prepareNarration(selectedDayIndex, activeDay.title, activeDay.content);
    }
  }, [selectedDayIndex, activeDay?.title, activeDay?.content]);

  const handleOpenVerseModal = (ref: string) => {
    // Normalize en-dash to hyphen, clean spaces and non-breaking spaces
    const normalized = ref
      .replace(/\u00A0/g, " ")
      .replace(/[–—\u2013\u2014\u2212]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
    setSelectedVerseRef(normalized);
    setIsVerseModalOpen(true);
  };

  const getBodyFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[14px] sm:text-[15px] leading-relaxed";
      case "md":
        return "text-[16px] sm:text-[17px] leading-relaxed";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl leading-relaxed sm:leading-loose";
      default:
        return "text-[15px] sm:text-base leading-relaxed";
    }
  };

  const renderContentWithVerseTriggers = (content: any) => {
    // 1. Relocate all Ellen G. White quotes out of the daily lesson into Ellen White Notes
    const { mainParagraphs } = separateLessonAndEgwNotes(content);

    return mainParagraphs.map((para, i) => {
      // Normalize non-breaking spaces
      const trimmed = para.replace(/\u00A0/g, " ").trim();
      if (!trimmed) return null;

      // Check if line is a markdown header
      if (trimmed.startsWith("#")) {
        const headerText = trimmed.replace(/^#+\s*/, "");
        return (
          <h4
            key={i}
            className="text-base sm:text-lg font-sans font-bold text-amber-400 mt-5 mb-2 pb-1 border-b border-amber-500/20 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
            <span>{headerText}</span>
          </h4>
        );
      }

      // Check for blockquotes
      if (trimmed.startsWith(">")) {
        const quoteText = trimmed.replace(/^>\s*/, "").trim();
        return (
          <blockquote
            key={i}
            className={`my-3 p-4 rounded-xl border border-amber-500/30 font-lato font-['Lato',sans-serif] not-italic leading-relaxed ${
              isLight ? "bg-amber-50/70 text-amber-950" : "bg-amber-500/10 text-amber-200"
            }`}
          >
            “{quoteText}”
          </blockquote>
        );
      }

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      const regex = getScriptureRegex();
      while ((match = regex.exec(trimmed)) !== null) {
        const fullMatch = match[0];
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
          parts.push(trimmed.substring(lastIndex, matchIndex));
        }

        parts.push(
          <button
            key={`ref-${i}-${matchIndex}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenVerseModal(fullMatch);
            }}
            className="rounded-full inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 bg-[#FEF9C3] text-[#78350F] border border-[#FACC15] shadow-2xs hover:bg-[#FEF08A] hover:border-[#EAB308] cursor-pointer transition-all no-underline hover:no-underline tracking-normal"
            title={`Click to read ${formatStandardReference(fullMatch)} passage`}
          >
            <span className="no-underline tracking-normal">{formatStandardReference(fullMatch)}</span>
          </button>
        );

        lastIndex = matchIndex + fullMatch.length;
      }

      if (lastIndex < trimmed.length) {
        parts.push(trimmed.substring(lastIndex));
      }

      return (
        <p
          key={i}
          className={`my-3 font-lato font-['Lato',sans-serif] ${getBodyFontSizeClass(readingFontSize)} ${
            isLight ? "text-stone-800" : "text-neutral-200"
          } text-left leading-relaxed antialiased`}
        >
          {parts.length > 0 ? parts : trimmed}
        </p>
      );
    });
  };

  const handleAskElderStephenAboutThisDay = () => {
    const prompt = `Could you give a simple summary or key takeaway for today's study on "${activeDay?.title}"?`;
    chatWithElderStephen(prompt, `Discussing ${activeDay?.label}: "${activeDay?.title}"`);
  };

  if (!activeDay) {
    return (
      <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-center text-neutral-450 font-lato font-['Lato',sans-serif]">
        Choose a daily tab above to begin exploring scripture.
      </div>
    );
  }

  const { mainParagraphs, egwParagraphs } = separateLessonAndEgwNotes(
    activeDay.content,
    activeDay.egwNotes
  );

  return (
    <div id="daily-lesson-view" className="space-y-6 mb-6">
      {/* Scriptural Exposition Centerpiece */}
      <div className="p-6 md:p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Subtle decorative background detail */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-full w-fit">
            <BookOpen size={12} />
            <span>{activeDay.label} Exposition</span>
          </div>

          <button
            id="btn-open-notebook-floating"
            onClick={() => setIsNotebookOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-250 hover:text-white rounded-lg text-xs font-semibold transition shadow-sm w-fit cursor-pointer"
          >
            <CheckSquare size={13} className="text-amber-500" />
            <span>Open Study Notebook</span>
          </button>
        </div>

        <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-5 tracking-tight relative z-10">
          {activeDay.title}
        </h3>

        {/* Main Lesson Content with Lato Typography */}
        <div className="text-neutral-300 space-y-4 font-lato font-['Lato',sans-serif] mb-6 relative z-10 max-w-4xl text-left">
          {mainParagraphs.length > 0 ? (
            renderContentWithVerseTriggers(mainParagraphs)
          ) : (
            <p className="text-neutral-450 italic font-lato font-['Lato',sans-serif]">
              No detailed exposition provided for this day. Open the "Teacher Helps" to synthesize curriculum discussion decks or search related scriptures with Elder Stephen.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-neutral-800 relative z-10">
          <button
            id="btn-ask-stephen-day"
            onClick={handleAskElderStephenAboutThisDay}
            disabled={isElderLoading}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            {isElderLoading ? (
              <RefreshCw size={12} className="animate-spin text-amber-500" />
            ) : (
              <Sparkles size={12} className="text-amber-500" />
            )}
            <span>Discuss Day with Elder Stephen</span>
          </button>

          {/* Mark as Complete button */}
          {(() => {
            const isCompleted = activeDay?.status?.toLowerCase() === "complete";
            const isCurrentlyReading = narrator.activeDayIndex === selectedDayIndex && (narrator.isSpeaking || narrator.isLoading || narrator.isPaused);

            return (
              <>
                <button
                  type="button"
                  id="btn-daily-view-mark-complete"
                  onClick={() => {
                    const next = isCompleted ? "Not Started" : "Complete";
                    updateDailyLessonStatus(selectedDayIndex, next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60"
                      : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Completed (Click to unmark)</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare size={13} className="text-amber-500" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>

                {/* Read Lesson Aloud Button with Instant Narration */}
                <button
                  type="button"
                  id="btn-daily-view-read-aloud"
                  onClick={() => narrator.toggleLesson(selectedDayIndex, activeDay.title, activeDay.content)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                    isCurrentlyReading && narrator.isSpeaking && !narrator.isPaused
                      ? "bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-[0_0_12px_rgba(212,163,70,0.35)]"
                      : isCurrentlyReading && narrator.isPaused
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                      : "bg-neutral-900 hover:bg-neutral-850 border-neutral-750 text-neutral-200 hover:text-amber-400"
                  }`}
                  title="Read lesson text aloud with Microsoft Emma's multilingual (natural) voice (Web Speech API)"
                >
                  {isCurrentlyReading && narrator.isLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin text-amber-500" />
                      <span>Starting Microsoft Emma's Narration...</span>
                    </>
                  ) : isCurrentlyReading && narrator.isSpeaking && !narrator.isPaused ? (
                    <>
                      <Pause size={13} className="text-stone-950 fill-stone-950" />
                      <span>Pause Narration</span>
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="w-0.5 h-2 bg-stone-950 animate-pulse rounded-full"></span>
                        <span className="w-0.5 h-3 bg-stone-950 animate-pulse delay-75 rounded-full"></span>
                        <span className="w-0.5 h-1.5 bg-stone-950 animate-pulse delay-150 rounded-full"></span>
                      </span>
                    </>
                  ) : isCurrentlyReading && narrator.isPaused ? (
                    <>
                      <Play size={13} className="text-amber-500 fill-amber-500" />
                      <span>Resume Narration</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} className="text-amber-500" />
                      <span>Read Lesson Aloud</span>
                    </>
                  )}
                </button>

                {isCurrentlyReading && (narrator.isSpeaking || narrator.isPaused) && (
                  <button
                    type="button"
                    id="btn-daily-view-stop-narration"
                    onClick={() => narrator.stop()}
                    className="p-2 border rounded-xl text-xs transition cursor-pointer bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-400 hover:text-white"
                    title="Stop Narration"
                  >
                    <Square size={13} />
                  </button>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Slide-in Study Notebook Drawer */}
      <WeeklyNotebookDrawer isOpen={isNotebookOpen} onClose={() => setIsNotebookOpen(false)} />

      {/* Bible Verse Modal with Instant Query */}
      <VerseModal
        isOpen={isVerseModalOpen}
        reference={selectedVerseRef}
        theme={isLight ? "light" : "dark"}
        onClose={() => setIsVerseModalOpen(false)}
      />
    </div>
  );
};
