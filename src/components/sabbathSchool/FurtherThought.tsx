/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookMarked, Sparkles, Copy, Check } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { CollapsibleContainer } from "./CollapsibleContainer";
import { getEgwNotesForLesson } from "../../utils/sabbathLessonTheology";
import { formatEgwParagraphChunks } from "../../utils/sabbathUtils";

export const FurtherThought: React.FC = () => {
  const {
    dailyLessons,
    lessonTitle,
    readingFontSize,
    readingTheme
  } = useSabbathSchoolStore();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isLight = readingTheme === "light";

  // Text Size Scaling bound dynamically to the top-bar controls
  const getQuoteFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[13px] sm:text-sm leading-relaxed";
      case "md":
        return "text-[15px] sm:text-base leading-relaxed";
      case "lg":
      case "xl":
        return "text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose tracking-wide";
      default:
        return "text-[14px] sm:text-[15px] leading-relaxed";
    }
  };

  const getCitationFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-[13px]";
      case "lg":
      case "xl":
        return "text-sm sm:text-base";
      default:
        return "text-xs";
    }
  };

  const quotes = getEgwNotesForLesson(dailyLessons, lessonTitle);

  const handleCopyQuote = (quoteText: string, source: string, index: number) => {
    const fullText = `"${quoteText}"\n— Ellen White, ${source}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2200);
    }).catch(() => {});
  };

  return (
    <CollapsibleContainer
      id="egw-commentary-section"
      title="Ellen White Notes"
      subtitle={`Supplemental Ellen White Notes for "${lessonTitle}"`}
      badge={`${quotes.length} EGW NOTES`}
      icon={<BookMarked size={18} />}
      defaultOpen={false}
      className="mb-6 w-full"
    >
      {quotes.length > 0 ? (
        <div className="space-y-5 w-full">
          <div className="flex flex-col space-y-5 text-left w-full">
            {quotes.map((q, index) => {
              const paragraphs = formatEgwParagraphChunks(q.quote);
              const isCopied = copiedIndex === index;
              const topicTitle = q.dailyTopic
                ? q.dailyTopic.replace(/^Day\s*\d+\s*[:–-]?\s*/i, "").trim()
                : (q.theme || lessonTitle);

              return (
                <div
                  key={index}
                  className={`w-full rounded-2xl border-2 transition shadow-xs flex flex-col justify-between space-y-4 p-6 sm:p-7 md:p-8 ${
                    isLight
                      ? "bg-[#FFFDF7] border-amber-400/90 text-stone-900 shadow-amber-900/5"
                      : "bg-[#14120D] border-amber-500/50 text-neutral-100 shadow-black/40"
                  }`}
                >
                  {/* Top Bar: Orange quote symbol & Title matching original styling */}
                  <div className="flex flex-wrap items-center justify-between gap-3 z-10 w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-orange-500 dark:text-orange-400 font-serif font-black text-2xl sm:text-3xl leading-none select-none">
                        ”
                      </span>
                      <h4 className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase text-orange-500 dark:text-orange-400">
                        Ellen White Notes on {topicTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {q.dayLabel && (
                        <span
                          className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                            isLight
                              ? "bg-amber-100/70 border-amber-300 text-amber-900"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          }`}
                        >
                          {q.dayLabel}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-stone-400 dark:text-neutral-500">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Body: Orange left vertical accent bar & readable non-italic paragraph sections */}
                  <div className="z-10 w-full border-l-2 border-l-orange-500 dark:border-l-orange-400 pl-4 sm:pl-5 my-1">
                    <div
                      className={`w-full font-['Lato',sans-serif] font-normal not-italic transition-all ${getQuoteFontSizeClass(
                        readingFontSize
                      )} ${isLight ? "text-stone-850" : "text-neutral-100"}`}
                    >
                      {paragraphs.length > 0 ? (
                        paragraphs.map((para, pIdx) => {
                          const cleanPara = para.trim();
                          const hasLeadingQuote = /^["“]/.test(cleanPara);
                          const hasTrailingQuote = /["”]$/.test(cleanPara);

                          let formatted = cleanPara;
                          if (!hasLeadingQuote && !hasTrailingQuote) {
                            formatted = `“${cleanPara}”`;
                          } else if (hasLeadingQuote && !hasTrailingQuote) {
                            formatted = `${cleanPara}”`;
                          } else if (!hasLeadingQuote && hasTrailingQuote) {
                            formatted = `“${cleanPara}`;
                          }

                          return (
                            <p
                              key={pIdx}
                              className="w-full max-w-none text-left mb-3.5 last:mb-0 leading-relaxed sm:leading-loose select-text font-normal not-italic"
                            >
                              {formatted}
                            </p>
                          );
                        })
                      ) : (
                        <p className="w-full max-w-none text-left leading-relaxed font-normal not-italic">“{q.quote}”</p>
                      )}
                    </div>
                  </div>

                  {/* Footer: EGW citation & Copy button */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t z-10 w-full ${
                      isLight
                        ? "border-amber-200/80 text-stone-700"
                        : "border-amber-500/20 text-neutral-300"
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${getCitationFontSizeClass(readingFontSize)} font-mono font-semibold`}>
                      <Sparkles size={13} className="shrink-0 text-orange-500" />
                      <span className={isLight ? "text-amber-900 font-bold" : "text-amber-400 font-bold"}>
                        Ellen White
                      </span>
                      <span className={isLight ? "text-stone-400" : "text-neutral-600"}>•</span>
                      <span className={`truncate not-italic ${isLight ? "text-stone-800" : "text-neutral-200"}`}>
                        {q.source}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyQuote(q.quote, q.source, index)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isCopied
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : isLight
                          ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900"
                          : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-300 hover:text-white"
                      }`}
                      title="Copy note to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="text-amber-600 dark:text-stone-400" />
                          <span>Copy Note</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-neutral-450 text-xs py-3 text-left not-italic">
          No supplemental Ellen White Notes loaded for this lesson.
        </p>
      )}
    </CollapsibleContainer>
  );
};
