/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MessageSquare, Heart, Shield, Users, CheckCircle2, BookmarkCheck, BookOpen, Sparkles, BookMarked, ExternalLink } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { CollapsibleContainer } from "./CollapsibleContainer";
import { getTheologicalTakeaways } from "../../utils/sabbathLessonTheology";
import { VerseModal } from "../VerseModal";
import { formatStandardReference } from "../../utils/sabbathUtils";

export const TalkingPointsSummary: React.FC = () => {
  const { lessonTitle, memoryVerse, dailyLessons, recordTakeawayEngagement, readingFontSize, readingTheme } = useSabbathSchoolStore();
  const [engagedPoints, setEngagedPoints] = useState<{ [key: number]: boolean }>({});
  const [activeVerseRef, setActiveVerseRef] = useState<string | null>(null);
  const [isVerseModalOpen, setIsVerseModalOpen] = useState<boolean>(false);

  const isLight = readingTheme === "light";

  const getBodyFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[13px] sm:text-sm leading-relaxed";
      case "md":
        return "text-[15px] sm:text-base leading-relaxed";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl leading-relaxed";
      default:
        return "text-[13px] sm:text-sm leading-relaxed";
    }
  };

  const getTitleFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-sm font-bold";
      case "md":
        return "text-base font-bold";
      case "lg":
      case "xl":
        return "text-lg font-bold";
      default:
        return "text-sm font-bold";
    }
  };

  const getVerseButtonFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-xs sm:text-sm";
      case "lg":
      case "xl":
        return "text-sm sm:text-base";
      default:
        return "text-xs";
    }
  };

  const getEgwNoteFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[12px] sm:text-[13px]";
      case "md":
        return "text-sm sm:text-base";
      case "lg":
      case "xl":
        return "text-base sm:text-lg";
      default:
        return "text-[12px] sm:text-[13px]";
    }
  };

  const handleEngage = (pointId: number) => {
    if (!engagedPoints[pointId]) {
      setEngagedPoints((prev) => ({ ...prev, [pointId]: true }));
      recordTakeawayEngagement();
    }
  };

  const handleOpenVerse = (ref: string) => {
    setActiveVerseRef(ref);
    setIsVerseModalOpen(true);
  };

  const handleScrollToEgw = () => {
    const egwSection = document.getElementById("egw-commentary-section") || document.getElementById("further-thought-section");
    if (egwSection) {
      egwSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const takeaways = getTheologicalTakeaways(lessonTitle, memoryVerse, dailyLessons);

  const getIconForTakeaway = (index: number) => {
    switch (index % 3) {
      case 0:
        return <BookOpen size={16} className="text-amber-500 shrink-0" />;
      case 1:
        return <Heart size={16} className="text-amber-500 shrink-0" />;
      default:
        return <Shield size={16} className="text-amber-500 shrink-0" />;
    }
  };

  return (
    <>
      <CollapsibleContainer
        id="theological-takeaways-section"
        title="Theological Takeaways"
        subtitle={`Summary of the entire week's lesson in 3 core points with interactive scriptures and Spirit of Prophecy connections`}
        badge="3 Core Weekly Points"
        icon={<MessageSquare size={18} />}
        defaultOpen={false}
        className="mb-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left">
          {takeaways.map((point, idx) => {
            const isEngaged = !!engagedPoints[point.id];

            return (
              <div
                key={point.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLight
                    ? isEngaged
                      ? "bg-[#FEF9EE] border-amber-400 shadow-sm"
                      : "bg-white border-[#E5DFD5] hover:border-amber-400 shadow-2xs text-stone-900"
                    : isEngaged
                    ? "bg-amber-950/20 border-amber-500/40 text-neutral-100 shadow-sm"
                    : "bg-[#161B22] border-[#21262D] hover:border-[#30363D] text-neutral-100"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Week Timeline Tag & Engagement Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                        isLight
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {point.chapterTag}
                    </span>
                    {isEngaged && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                        <Sparkles size={11} />
                        <span>Reflected</span>
                      </span>
                    )}
                  </div>

                  {/* Point Title */}
                  <div className={`flex items-start gap-2 font-sans tracking-tight ${getTitleFontSizeClass(readingFontSize)} ${isLight ? "text-stone-900 font-extrabold" : "text-white"}`}>
                    <div className="mt-1">{getIconForTakeaway(idx)}</div>
                    <h4>{point.title}</h4>
                  </div>

                  {/* 7-Day Encapsulating Synthesis Description */}
                  <p className={`font-sans ${getBodyFontSizeClass(readingFontSize)} ${isLight ? "text-stone-800" : "text-neutral-300"}`}>
                    {point.description}
                  </p>

                  {/* Supporting Verses from Lesson (Interactive Pop-up) */}
                  {point.supportingVerses && point.supportingVerses.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 opacity-80">
                        <BookOpen size={12} className="text-amber-500" />
                        <span>Supporting Scriptures (Tap to Read):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {point.supportingVerses.map((verseRef, vIdx) => (
                          <button
                            key={vIdx}
                            type="button"
                            onClick={() => handleOpenVerse(verseRef)}
                            title={`Read full scripture: ${formatStandardReference(verseRef)}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${getVerseButtonFontSizeClass(readingFontSize)} font-mono font-bold transition cursor-pointer border shadow-2xs no-underline hover:no-underline tracking-normal ${
                              isLight
                                ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-[#783E0A] hover:text-[#522904]"
                                : "bg-[#1C2333] hover:bg-[#252E42] border-[#C9973A]/40 text-amber-300 hover:text-white"
                            }`}
                          >
                            <BookOpen size={11} className="shrink-0 text-amber-500" />
                            <span className="no-underline tracking-normal">{formatStandardReference(verseRef)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ellen White Connection */}
                  {point.egwConnection && (
                    <div
                      className={`mt-2 p-3 rounded-xl border space-y-1.5 transition-colors ${
                        isLight
                          ? "bg-[#FCF9F2] border-[#EADFCB] text-stone-800"
                          : "bg-[#0E1526] border-[#2A344E] text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <BookMarked size={11} />
                          <span>Ellen White Connection</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleScrollToEgw}
                          title="Jump to Ellen White Commentary section"
                          className="text-[10px] font-mono hover:underline flex items-center gap-0.5 text-stone-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                        >
                          <span>View Notes</span>
                          <ExternalLink size={10} />
                        </button>
                      </div>
                      <p className={`font-['Lato',sans-serif] not-italic leading-relaxed ${getEgwNoteFontSizeClass(readingFontSize)}`}>
                        “{point.egwConnection.note}”
                      </p>
                      <div className="text-[10px] font-mono not-italic opacity-80 text-right">
                        — {point.egwConnection.source}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Reflect & Mark Takeaway */}
                <div className={`pt-3.5 mt-4 border-t flex items-center justify-between gap-2 ${isLight ? "border-stone-200" : "border-neutral-800"}`}>
                  <span className="text-[11px] font-mono text-stone-500 dark:text-neutral-400">
                    Week Pillar #{point.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEngage(point.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isLight
                        ? isEngaged
                          ? "bg-amber-200 text-amber-950 border border-amber-400 shadow-2xs font-bold"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
                        : isEngaged
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                        : "bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {isEngaged ? (
                      <>
                        <BookmarkCheck size={13} className={isLight ? "text-amber-800" : "text-amber-400"} />
                        <span>Reflected & Marked</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} className="text-amber-500" />
                        <span>Reflect Takeaway</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContainer>

      {/* Pop-up Verse Modal for Supporting Scripture References */}
      <VerseModal
        isOpen={isVerseModalOpen}
        reference={activeVerseRef}
        theme={isLight ? "light" : "dark"}
        onClose={() => setIsVerseModalOpen(false)}
      />
    </>
  );
};

