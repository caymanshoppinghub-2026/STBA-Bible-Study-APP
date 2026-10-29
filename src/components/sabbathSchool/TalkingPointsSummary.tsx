/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Heart, 
  Shield, 
  CheckCircle2, 
  BookmarkCheck, 
  BookOpen, 
  Sparkles, 
  BookMarked, 
  ExternalLink,
  RefreshCw,
  LayoutGrid,
  Rows,
  Globe,
  Flame
} from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { CollapsibleContainer } from "./CollapsibleContainer";
import { 
  getTheologicalTakeaways, 
  TheologicalTakeawayItem,
  formatTakeawayContent 
} from "../../utils/sabbathLessonTheology";
import { VerseModal } from "../VerseModal";
import { formatStandardReference } from "../../utils/sabbathUtils";
import { getTheologicalTakeawaysFromSource } from "../../api/sabbathSchoolApi";

export const TalkingPointsSummary: React.FC = () => {
  const { 
    lessonTitle, 
    memoryVerse, 
    dailyLessons, 
    recordTakeawayEngagement, 
    readingFontSize, 
    readingTheme,
    theologicalTakeaways: storeTakeaways,
    refreshTheologicalTakeaways
  } = useSabbathSchoolStore();

  const [engagedPoints, setEngagedPoints] = useState<{ [key: number]: boolean }>({});
  const [activeVerseRef, setActiveVerseRef] = useState<string | null>(null);
  const [isVerseModalOpen, setIsVerseModalOpen] = useState<boolean>(false);
  const [localTakeaways, setLocalTakeaways] = useState<TheologicalTakeawayItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "horizontal">("grid");
  const [sourceNote, setSourceNote] = useState<string>("Official Sabbath School Source");

  const isLight = readingTheme === "light";

  // Fetch synthesized takeaways directly from source on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSourceTakeaways() {
      // If store already has cached takeaways, use them immediately
      if (storeTakeaways && storeTakeaways.length === 3) {
        setLocalTakeaways(storeTakeaways);
        return;
      }

      setIsLoading(true);
      try {
        const res = await getTheologicalTakeawaysFromSource(false);
        if (isMounted && res && Array.isArray(res.takeaways) && res.takeaways.length === 3) {
          setLocalTakeaways(res.takeaways);
          if (res.sourceWebsite) {
            setSourceNote("Scraped from Official Teacher's Edition & Talking Points");
          }
        }
      } catch (err) {
        console.warn("[TalkingPointsSummary] Failed to load source takeaways:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSourceTakeaways();
    return () => {
      isMounted = false;
    };
  }, [storeTakeaways]);

  // Handler for manual re-synthesis from source website
  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      if (refreshTheologicalTakeaways) {
        const refreshed = await refreshTheologicalTakeaways();
        if (refreshed && refreshed.length === 3) {
          setLocalTakeaways(refreshed);
          setSourceNote("Freshly Synthesized from Source Website Talking Points");
        }
      } else {
        const res = await getTheologicalTakeawaysFromSource(true);
        if (res && Array.isArray(res.takeaways) && res.takeaways.length === 3) {
          setLocalTakeaways(res.takeaways);
          setSourceNote("Freshly Synthesized from Source Website Talking Points");
        }
      }
    } catch (err) {
      console.warn("[TalkingPointsSummary] Error refreshing takeaways:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        return "text-sm sm:text-base font-bold";
      case "md":
        return "text-base sm:text-lg font-bold";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl font-bold";
      default:
        return "text-sm sm:text-base font-bold";
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

  // Determine active takeaways (API synthesized takeaways or local preset/dynamic fallback)
  const takeaways: TheologicalTakeawayItem[] = 
    (localTakeaways && localTakeaways.length === 3) 
      ? localTakeaways 
      : getTheologicalTakeaways(lessonTitle, memoryVerse, dailyLessons);

  const getIconForTakeaway = (index: number) => {
    switch (index % 3) {
      case 0:
        return <BookOpen size={17} className="text-amber-500 shrink-0" />;
      case 1:
        return <Heart size={17} className="text-amber-500 shrink-0" />;
      default:
        return <Shield size={17} className="text-amber-500 shrink-0" />;
    }
  };

  return (
    <>
      <CollapsibleContainer
        id="theological-takeaways-section"
        title="Theological Takeaways"
        subtitle="Synthesized from official source 'Talking Points' (Teacher's Edition & Sabbath School Study Guide) into 3 core horizontal pillars"
        badge="3 Core Horizontal Takeaways"
        icon={<MessageSquare size={18} />}
        defaultOpen={false}
        className="mb-6"
      >
        {/* Top Controls Toolbar: Source Attribution, View Mode, Refresh */}
        <div className={`mb-5 p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors ${
          isLight 
            ? "bg-amber-50/70 border-amber-200/80 text-stone-700" 
            : "bg-[#111622] border-neutral-800 text-neutral-300"
        }`}>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Globe size={12} className="text-amber-500 animate-pulse" />
              <span>{sourceNote}</span>
            </span>
            <span className="hidden sm:inline opacity-60">|</span>
            <span className="hidden sm:inline opacity-75">
              3 Horizontal Pillars
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: 3-Column Grid vs. Full Horizontal Banners */}
            <div className={`flex items-center rounded-lg p-0.5 border ${
              isLight ? "bg-white border-stone-300 text-stone-700" : "bg-[#161B26] border-neutral-700 text-neutral-300"
            }`}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="3-Column Horizontal Grid"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  viewMode === "grid"
                    ? isLight
                      ? "bg-amber-100 text-amber-900 shadow-2xs font-bold"
                      : "bg-amber-500/20 text-amber-300 font-bold"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <LayoutGrid size={13} />
                <span className="hidden md:inline">3-Column Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("horizontal")}
                title="Wide Horizontal Banners"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  viewMode === "horizontal"
                    ? isLight
                      ? "bg-amber-100 text-amber-900 shadow-2xs font-bold"
                      : "bg-amber-500/20 text-amber-300 font-bold"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Rows size={13} />
                <span className="hidden md:inline">Horizontal Banners</span>
              </button>
            </div>

            {/* Re-synthesize Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              title="Scrape Talking Points directly from source website and re-synthesize with AI"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border shadow-2xs ${
                isRefreshing || isLoading ? "opacity-60 cursor-not-allowed" : ""
              } ${
                isLight
                  ? "bg-white hover:bg-amber-100/60 border-amber-300 text-amber-900"
                  : "bg-[#1E2538] hover:bg-[#28324B] border-amber-500/30 text-amber-300"
              }`}
            >
              <RefreshCw size={12} className={isRefreshing || isLoading ? "animate-spin text-amber-500" : "text-amber-500"} />
              <span>{isRefreshing || isLoading ? "Synthesizing..." : "Re-Synthesize"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW MODE A: 3-COLUMN HORIZONTAL GRID (Side-by-Side Presentation)
            ========================================================================= */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left items-stretch">
            {takeaways.map((point, idx) => {
              const isEngaged = !!engagedPoints[point.id];
              const parsed = formatTakeawayContent(point.description);
              const activeBullets = (point.bulletPoints && point.bulletPoints.length > 0)
                ? point.bulletPoints
                : parsed.bulletPoints;
              const activeParagraphs = parsed.paragraphs.length > 0 ? parsed.paragraphs : [point.description];

              return (
                <div
                  key={point.id}
                  className={`p-5 rounded-[28px] border transition-all flex flex-col justify-between shadow-xs ${
                    isLight
                      ? isEngaged
                        ? "bg-[#FEF9EE] border-amber-400 shadow-sm"
                        : "bg-white border-[#E5DFD5] hover:border-amber-400 text-stone-900"
                      : isEngaged
                      ? "bg-amber-950/20 border-amber-500/40 text-neutral-100 shadow-sm"
                      : "bg-[#161B22] border-[#21262D] hover:border-[#30363D] text-neutral-100"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Pillar Badge & Reflected Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${
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
                    <div className={`flex items-start gap-2.5 font-sans tracking-tight ${getTitleFontSizeClass(readingFontSize)} ${
                      isLight ? "text-stone-950 font-extrabold" : "text-white"
                    }`}>
                      <div className="mt-1">{getIconForTakeaway(idx)}</div>
                      <h4 className="leading-snug">{point.title}</h4>
                    </div>

                    {/* Readable Paragraphs */}
                    <div className="space-y-2">
                      {activeParagraphs.map((para, pIdx) => (
                        <p
                          key={pIdx}
                          className={`font-sans leading-relaxed ${getBodyFontSizeClass(readingFontSize)} ${
                            isLight ? "text-stone-800" : "text-neutral-300"
                          }`}
                        >
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Core Talking Points (Bullet Points) */}
                    {activeBullets && activeBullets.length > 0 && (
                      <div className={`p-3.5 rounded-2xl border space-y-2 ${
                        isLight ? "bg-amber-50/50 border-amber-200/70" : "bg-[#111724] border-neutral-800/80"
                      }`}>
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Flame size={12} className="text-amber-500" />
                          <span>Key Talking Points:</span>
                        </div>
                        <ul className="space-y-2 pl-0">
                          {activeBullets.map((bullet, bIdx) => (
                            <li
                              key={bIdx}
                              className={`flex items-start gap-2 ${getBodyFontSizeClass(readingFontSize)} leading-relaxed`}
                            >
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className={isLight ? "text-stone-800" : "text-neutral-200"}>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Supporting Verses from Lesson */}
                    {point.supportingVerses && point.supportingVerses.length > 0 && (
                      <div className="pt-1">
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
                        className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
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
                      Takeaway Pillar #{point.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEngage(point.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
        ) : (
          /* =========================================================================
             VIEW MODE B: FULL HORIZONTAL BANNERS (Wide Two-Column Horizontal Rows)
             ========================================================================= */
          <div className="space-y-5 text-left">
            {takeaways.map((point, idx) => {
              const isEngaged = !!engagedPoints[point.id];
              const parsed = formatTakeawayContent(point.description);
              const activeBullets = (point.bulletPoints && point.bulletPoints.length > 0)
                ? point.bulletPoints
                : parsed.bulletPoints;
              const activeParagraphs = parsed.paragraphs.length > 0 ? parsed.paragraphs : [point.description];

              return (
                <div
                  key={point.id}
                  className={`p-6 rounded-[30px] border transition-all shadow-xs ${
                    isLight
                      ? isEngaged
                        ? "bg-[#FEF9EE] border-amber-400 shadow-sm"
                        : "bg-white border-[#E5DFD5] hover:border-amber-400 text-stone-900"
                      : isEngaged
                      ? "bg-amber-950/20 border-amber-500/40 text-neutral-100 shadow-sm"
                      : "bg-[#161B22] border-[#21262D] hover:border-[#30363D] text-neutral-100"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (5 Cols): Title, Timeline, Readable Paragraph, Scriptures */}
                    <div className="lg:col-span-6 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                              isLight
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {point.chapterTag}
                          </span>
                          <span className="text-[11px] font-mono text-stone-400">Pillar #{point.id}</span>
                          {isEngaged && (
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <Sparkles size={11} />
                              <span>Reflected</span>
                            </span>
                          )}
                        </div>

                        <div className={`flex items-start gap-2.5 font-sans tracking-tight ${getTitleFontSizeClass(readingFontSize)} ${
                          isLight ? "text-stone-950 font-extrabold" : "text-white"
                        }`}>
                          <div className="mt-1">{getIconForTakeaway(idx)}</div>
                          <h4 className="leading-snug">{point.title}</h4>
                        </div>

                        <div className="space-y-2">
                          {activeParagraphs.map((para, pIdx) => (
                            <p
                              key={pIdx}
                              className={`font-sans leading-relaxed ${getBodyFontSizeClass(readingFontSize)} ${
                                isLight ? "text-stone-800" : "text-neutral-300"
                              }`}
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Supporting Scriptures */}
                      {point.supportingVerses && point.supportingVerses.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 opacity-80">
                            <BookOpen size={12} className="text-amber-500" />
                            <span>Supporting Scriptures:</span>
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
                    </div>

                    {/* Right Column (6 Cols): Bullet Points, EGW Connection, Action Button */}
                    <div className="lg:col-span-6 space-y-3.5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 border-stone-200 dark:border-neutral-800">
                      <div className="space-y-3.5">
                        {/* Core Talking Points (Bullet Points) */}
                        {activeBullets && activeBullets.length > 0 && (
                          <div className={`p-4 rounded-2xl border space-y-2.5 ${
                            isLight ? "bg-amber-50/50 border-amber-200/70" : "bg-[#111724] border-neutral-800/80"
                          }`}>
                            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <Flame size={12} className="text-amber-500" />
                              <span>Key Talking Points & Class Discussion:</span>
                            </div>
                            <ul className="space-y-2 pl-0">
                              {activeBullets.map((bullet, bIdx) => (
                                <li
                                  key={bIdx}
                                  className={`flex items-start gap-2.5 ${getBodyFontSizeClass(readingFontSize)} leading-relaxed`}
                                >
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                  <span className={isLight ? "text-stone-800" : "text-neutral-200"}>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Ellen White Connection */}
                        {point.egwConnection && (
                          <div
                            className={`p-3 rounded-2xl border space-y-1.5 transition-colors ${
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

                      {/* Footer Engagement Button */}
                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleEngage(point.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs ${
                            isLight
                              ? isEngaged
                                ? "bg-amber-200 text-amber-950 border border-amber-400 font-bold"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300"
                              : isEngaged
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                              : "bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800"
                          }`}
                        >
                          {isEngaged ? (
                            <>
                              <BookmarkCheck size={14} className={isLight ? "text-amber-800" : "text-amber-400"} />
                              <span>Reflected & Marked</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} className="text-amber-500" />
                              <span>Reflect Takeaway</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
