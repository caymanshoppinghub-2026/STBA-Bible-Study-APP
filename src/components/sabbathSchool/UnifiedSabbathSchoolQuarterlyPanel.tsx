/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Quote, 
  Eye, 
  EyeOff, 
  Bookmark, 
  Check, 
  Sparkles, 
  Share2, 
  Printer, 
  Video,
  Sparkle,
  RefreshCw,
  Clock,
  AlertCircle,
  Calendar,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { SabbathAudioPlayerModal } from "./SabbathAudioPlayerModal";
import { SabbathVideoPlayerModal } from "./SabbathVideoPlayerModal";
import { SabbathShareModal } from "./SabbathShareModal";
import { InteractiveRecallVerse } from "./InteractiveRecallVerse";
import ssqCoverImg from "../../assets/images/gift_of_prophecy_1792375736613.jpg";

const STOP_WORDS = new Set([
  "and", "a", "an", "the", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "through", "after", "is", "are",
  "was", "were", "be", "being", "have", "has", "had", "it",
  "its", "this", "that", "these", "those", "they", "them", "their",
  "his", "her", "he", "she", "you", "your", "we", "our", "us", "my",
  "me", "i", "who", "whom", "which", "what", "where", "when", "why",
  "how", "all", "any", "both", "each", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "can", "will", "just", "should", "now", "or",
  "but", "as", "if", "there"
]);

export const UnifiedSabbathSchoolQuarterlyPanel: React.FC = () => {
  const {
    quarterlyTitle,
    lessonTitle,
    memoryVerse,
    readingFontSize,
    readingTheme,
    isEgwAudioPlaying,
    isEgwVideoPlaying,
    setActiveMediaSource,
    setCurrentEgwTimestampIndex,
    dailyLessons,
    weeklyVideos,
    egwDailyBreakdown,
    hasPendingRetries,
    pendingChannels,
    lastSyncedAt,
    isSyncing,
    fetchWeeklySyncData,
    fetchLessonByDateStore,
    activeLessonDate
  } = useSabbathSchoolStore();

  const [isNavigatingDate, setIsNavigatingDate] = useState(false);
  const [currentLessonDate, setCurrentLessonDate] = useState<string>(activeLessonDate || "2026-10-17");

  useEffect(() => {
    if (activeLessonDate) {
      setCurrentLessonDate(activeLessonDate);
    }
  }, [activeLessonDate]);

  const handleDateSelect = async (targetDateStr: string) => {
    if (!targetDateStr) return;
    setIsNavigatingDate(true);
    try {
      setCurrentLessonDate(targetDateStr);
      const res = await fetchLessonByDateStore(targetDateStr);
      setToastMsg(`Calendar Updated to ${targetDateStr}: "${res.lessonTitle || 'Sabbath School Lesson'}"`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (e: any) {
      console.error("Date selection fetch error:", e);
      setToastMsg(`Could not load lesson for ${targetDateStr}.`);
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsNavigatingDate(false);
    }
  };

  const handlePreviousQuarter = async () => {
    setIsNavigatingDate(true);
    try {
      const curDateStr = activeLessonDate || currentLessonDate || "2026-10-17";
      let finalDate = "2026-07-25";
      if (!curDateStr.startsWith("2026-10") && !curDateStr.startsWith("2026-11") && !curDateStr.startsWith("2026-12")) {
        const cur = new Date(curDateStr);
        cur.setDate(cur.getDate() - 84);
        finalDate = cur.toISOString().split("T")[0];
      }

      setCurrentLessonDate(finalDate);
      const res = await fetchLessonByDateStore(finalDate);
      setToastMsg(`Calendar Navigated to Previous Quarter (${finalDate}): "${res.quarterlyTitle || 'First and Second Corinthians'}"`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (e: any) {
      console.error("Previous quarter navigation error:", e);
      setToastMsg("Could not load previous quarter. Please try again.");
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsNavigatingDate(false);
    }
  };

  const handlePreviousWeek = async () => {
    setIsNavigatingDate(true);
    try {
      const curDateStr = activeLessonDate || currentLessonDate || "2026-10-17";
      const curDate = new Date(curDateStr);
      curDate.setDate(curDate.getDate() - 7);
      const targetDateStr = curDate.toISOString().split("T")[0];

      setCurrentLessonDate(targetDateStr);
      const res = await fetchLessonByDateStore(targetDateStr);
      setToastMsg(`Calendar Navigated to Previous Week (${targetDateStr}): "${res.lessonTitle || 'Previous Lesson'}"`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (e: any) {
      console.error("Previous week navigation error:", e);
      setToastMsg("Could not load previous week. Please try again.");
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsNavigatingDate(false);
    }
  };

  const isLight = readingTheme === "light";
  const [videoModalChannel, setVideoModalChannel] = useState<"egwNotes" | "featured" | "itiswritten" | "hope" | "threeABN">("featured");

  const getMemoryVerseFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-sm sm:text-base";
      case "md":
        return "text-base sm:text-lg";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl md:text-2xl";
      default:
        return "text-base md:text-lg";
    }
  };

  const getReferenceFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs sm:text-sm";
      case "md":
        return "text-sm sm:text-base";
      case "lg":
      case "xl":
        return "text-base sm:text-lg";
      default:
        return "text-xs sm:text-sm";
    }
  };

  const getLessonSubtitleFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-sm sm:text-base";
      case "md":
        return "text-base sm:text-lg";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl";
      default:
        return "text-sm sm:text-base";
    }
  };

  // Modal states
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenVideo = () => {
      setIsVideoPlayerOpen(true);
    };
    window.addEventListener("ssq-open-video-modal", handleOpenVideo);
    return () => window.removeEventListener("ssq-open-video-modal", handleOpenVideo);
  }, []);

  // Memory text active recall test state
  const [hideKeyWords, setHideKeyWords] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamic verse extraction with fallback to the Corinthians Quarterly Key Memory Text
  let reference = "2 Corinthians 2:4, NKJV";
  let text = "For out of much affliction and anguish of heart I wrote to you, with many tears, not that you should be grieved, but that you might know the love which I have so abundantly for you.";

  if (memoryVerse && memoryVerse.trim().length > 0) {
    const cleanVerse = memoryVerse.trim();
    const parenMatch = cleanVerse.match(/^[“"']?(.*?)[”"']?\s*\(([^)]+)\)\.?$/);
    if (parenMatch) {
      text = parenMatch[1].replace(/^[“"']|[”"']$/g, "").trim();
      reference = parenMatch[2].trim();
    } else if (cleanVerse.includes("—")) {
      const parts = cleanVerse.split("—");
      if (parts.length >= 2) {
        if (parts[1].toLowerCase().includes("corinthians") || parts[1].toLowerCase().includes("nkjv") || parts[1].toLowerCase().includes("esv") || parts[1].toLowerCase().includes("kjv") || /\d+:\d+/.test(parts[1])) {
          text = parts[0].replace(/['"“”]/g, "").trim();
          reference = parts[1].trim();
        } else {
          reference = parts[0].trim();
          text = parts[1].replace(/['"“”]/g, "").trim();
        }
      }
    } else if (cleanVerse.includes("-")) {
      const parts = cleanVerse.split("-");
      if (parts.length >= 2) {
        if (/\d+:\d+/.test(parts[1])) {
          text = parts[0].replace(/['"“”]/g, "").trim();
          reference = parts[1].trim();
        } else {
          reference = parts[0].trim();
          text = parts[1].replace(/['"“”]/g, "").trim();
        }
      }
    } else {
      text = cleanVerse.replace(/['"“”]/g, "").trim();
      reference = "2 Corinthians 2:4, NKJV";
    }
  }

  // Recall Cycle Local Storage Sync
  const [isInRecallCycle, setIsInRecallCycle] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("recall_cycle_verses");
      if (saved) {
        const list = JSON.parse(saved);
        return Array.isArray(list) && list.includes(reference);
      }
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recall_cycle_verses");
      if (saved) {
        const list = JSON.parse(saved);
        setIsInRecallCycle(Array.isArray(list) && list.includes(reference));
      }
    } catch (e) {}
  }, [reference]);

  const toggleRecallCycle = () => {
    const nextState = !isInRecallCycle;
    setIsInRecallCycle(nextState);
    try {
      const saved = localStorage.getItem("recall_cycle_verses");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (nextState) {
        if (!list.includes(reference)) list.push(reference);
        setToastMsg(`"${reference}" added to Daily Recall Schedule!`);
      } else {
        list = list.filter((r) => r !== reference);
        setToastMsg(`"${reference}" removed from Daily Recall Schedule.`);
      }
      localStorage.setItem("recall_cycle_verses", JSON.stringify(list));
    } catch (e) {}
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Keyword scramble masking renderer for Active Recall
  const renderScrambledTextNode = () => {
    if (!hideKeyWords) return text;

    const parts = text.split(/(\b[a-zA-Z0-9'-]+\b)/g);

    return parts.map((part, idx) => {
      const cleanWord = part.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanWord.length >= 2 && !STOP_WORDS.has(cleanWord)) {
        return (
          <span
            key={idx}
            className={`inline-block px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs sm:text-sm font-bold select-none align-middle ${
              isLight
                ? "bg-amber-200/95 border border-amber-500 text-amber-950 shadow-xs"
                : "bg-amber-500/25 border border-amber-500/50 text-amber-300"
            }`}
            title="Hidden active-recall keyword"
          >
            ______
          </span>
        );
      }
      return part;
    });
  };

  const displayQuarterlyName = quarterlyTitle
    ? quarterlyTitle.replace(/\s*\(\d{4}\s*Q\d\)/gi, "").trim() || quarterlyTitle
    : "The Gift of Prophecy";

  return (
    <div
      id="unified-sabbath-school-panel"
      className={`relative w-full rounded-3xl md:rounded-[32px] border transition-all duration-300 overflow-hidden mb-8 shadow-xl ${
        isLight
          ? "bg-gradient-to-br from-[#FAF7F0] via-[#F4EFE6] to-[#EFE7D8] border-[#C9973A]/45 text-stone-900 shadow-[0_10px_35px_rgba(201,151,58,0.12)]"
          : "bg-gradient-to-br from-[#060D1E] via-[#09132A] to-[#0A1633] border-[#C9973A]/40 text-neutral-100 shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_30px_rgba(201,151,58,0.12)]"
      }`}
    >
      {/* Top subtle golden ambient border shimmer */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9973A] to-transparent opacity-85" />

      {/* Outer Card Padding */}
      <div className="p-5 sm:p-7 md:p-8 lg:p-10 relative z-10">
        
        {/* Toast Alert Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center justify-between shadow-md ${
                isLight
                  ? "bg-[#FEF6E4] border-[#F7E1AD] text-[#8C5209] font-bold"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300 font-medium"
              }`}
            >
              <div className="flex items-center gap-2">
                <Check size={14} className={isLight ? "text-[#92400E]" : "text-amber-400"} />
                <span>{toastMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* RETRY SCHEDULE / PENDING CHANNELS STATUS BANNER           */}
        {/* ========================================================= */}
        {hasPendingRetries && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                <strong className="text-amber-300">Update in Progress</strong> · Showing prior week for pending channels ({pendingChannels && pendingChannels.length > 0 ? pendingChannels.join(", ") : "Scheduled channels"}). Automatic scraper checking every 3 hours.
              </span>
            </div>
            <button
              type="button"
              onClick={() => fetchWeeklySyncData(true)}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TOP ROW: Title Box Far Left Over Image + Action Buttons   */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6">
          
          {/* Far-Left Extended Title Box (Non-wrapped, High Contrast in Light & Dark Mode) */}
          <div 
            id="ssq-title-badge"
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-sm whitespace-nowrap transition-colors ${
              isLight
                ? "bg-amber-100/90 border-[#8C5209]/40 text-[#683D08] font-black shadow-[0_2px_8px_rgba(140,82,9,0.12)]"
                : "bg-[#0E1B38] border-[#C9973A]/60 text-amber-300 font-black shadow-[0_2px_12px_rgba(201,151,58,0.15)]"
            }`}
          >
            <BookOpen size={15} className={isLight ? "text-[#8C5209] shrink-0" : "text-[#C9973A] shrink-0"} />
            <span className={`text-xs sm:text-[13px] font-mono font-black uppercase tracking-[0.16em] ${
              isLight ? "text-[#5A3406]" : "text-[#F5E6C4]"
            }`}>
              SABBATH SCHOOL QUARTERLY
            </span>
          </div>

          {/* Action Buttons Right Group: SSQ Videos, Share & Print sitting side-by-side */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
            {/* 1. SSQ Videos Button (Compact, audio wording removed) */}
            <button
              id="ssq-videos-btn"
              type="button"
              onClick={() => {
                setActiveMediaSource("egwNotes");
                setVideoModalChannel("egwNotes");
                setIsVideoPlayerOpen(true);
              }}
              title="Watch Sabbath School Quarterly Video Summaries & Ellen White Commentary"
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm group shrink-0 ${
                isEgwAudioPlaying || isEgwVideoPlaying
                  ? "bg-amber-500 text-neutral-950 border-amber-400 ring-2 ring-amber-500/50 font-black"
                  : isLight
                  ? "bg-stone-900 hover:bg-stone-800 border-stone-800 text-white"
                  : "bg-[#16203B] hover:bg-[#1D2B4E] border-[#C9973A]/50 text-white"
              }`}
            >
              <Video className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors shrink-0 ${
                isEgwAudioPlaying || isEgwVideoPlaying
                  ? "text-neutral-950"
                  : "text-amber-400 group-hover:text-amber-300"
              }`} />
              <span className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
                isEgwAudioPlaying || isEgwVideoPlaying ? "text-neutral-950" : "text-amber-300"
              }`}>
                SSQ Videos
              </span>
            </button>

            {/* 2. Share Button (Right next to SSQ Videos button) */}
            <button
              id="ssq-share-btn"
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              title="Share Lesson with Sabbath School Class or Study Group"
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold cursor-pointer shadow-sm shrink-0 whitespace-nowrap ${
                isLight
                  ? "bg-[#FEF7EB] hover:bg-[#FDF0D9] text-[#783E0A] border-[#D9A04B]/60"
                  : "bg-[#16203B] hover:bg-[#1D2B4E] text-amber-300 border-[#C9973A]/40"
              }`}
            >
              <Share2 size={13} className={`shrink-0 ${isLight ? "text-[#8C5209]" : "text-[#C9973A]"}`} />
              <span>Share</span>
            </button>

            {/* 3. Print Outline Button (Sitting directly next to Share button) */}
            <button
              id="ssq-print-btn"
              type="button"
              onClick={() => window.print()}
              title="Print Lesson Outline"
              className={`p-1.5 px-2.5 sm:p-2 sm:px-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 ${
                isLight
                  ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300"
                  : "bg-[#16203B] hover:bg-[#1D2B4E] text-stone-300 border-[#C9973A]/30"
              }`}
            >
              <Printer size={14} className={isLight ? "text-stone-700" : "text-[#C9973A]"} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY GRID: Left Cover Art + Right Content Wrap       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Official Quarterly Cover Presentation        */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center items-center w-full">
            <div 
              id="ssq-quarterly-book-cover"
              className={`relative group w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] flex items-center justify-center p-3 sm:p-4 rounded-2xl md:rounded-[26px] overflow-hidden border-2 transition-transform duration-300 hover:scale-[1.015] ${
                isLight
                  ? "bg-gradient-to-b from-[#FCF7ED] via-[#F4E9D8] to-[#ECE0CC] border-[#C9973A]/65 shadow-[0_16px_36px_rgba(140,82,9,0.14),0_0_24px_rgba(201,151,58,0.2)]"
                  : "bg-gradient-to-b from-[#1E1017] via-[#0F172A] to-[#0A0F1D] border-[#C9973A]/60 shadow-[0_16px_36px_rgba(0,0,0,0.45),0_0_24px_rgba(201,151,58,0.25)]"
              }`}
            >
              {/* Outer decorative gold trim frame */}
              <div className="relative w-full p-2 sm:p-2.5 rounded-xl md:rounded-[20px] bg-gradient-to-br from-[#EAD49E] via-[#C9973A] to-[#8C5209] shadow-[0_8px_24px_rgba(0,0,0,0.45),0_0_20px_rgba(201,151,58,0.35)] ring-1 ring-[#FFF0B8]/60">
                {/* Inner perimeter trim border */}
                <div className="relative rounded-lg md:rounded-[16px] border-2 border-[#1A1208]/80 overflow-hidden bg-black/40">
                  {/* Official Seventh-day Adventist Adult Teachers Bible Study Guide Cover */}
                  <img
                    src={ssqCoverImg}
                    alt={`Seventh-day Adventist Adult Bible Study Guide - ${displayQuarterlyName}`}
                    className="w-full h-auto max-h-[560px] object-contain object-center select-none shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] block"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle inner gold edge glow */}
                  <div className="absolute inset-0 pointer-events-none rounded-lg md:rounded-[16px] ring-1 ring-inset ring-[#C9973A]/50" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Wrap Content, Titles & Key Memory Verse    */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between space-y-4 sm:space-y-5">
            
            {/* Subtitle / Eyebrow Header: THIS QUARTER'S LESSON */}
            <div className="flex items-center gap-3">
              <div className={`h-px flex-1 ${isLight ? "bg-amber-900/20" : "bg-amber-400/20"}`} />
              <span className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] ${
                isLight ? "text-[#783E0A]" : "text-amber-300/90"
              }`}>
                This Quarter’s Lesson
              </span>
              <div className={`h-px flex-1 ${isLight ? "bg-amber-900/20" : "bg-amber-400/20"}`} />
            </div>

            {/* Main Title Heading: The Gift of Prophecy & Current Study (Centered) */}
            <div className="text-center flex flex-col items-center justify-center">
              <h1 className={`text-3xl sm:text-4xl lg:text-[44px] font-serif font-black tracking-tight leading-tight text-center ${
                isLight
                  ? "text-stone-900"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-sm"
              }`}>
                {displayQuarterlyName}
              </h1>

              {/* Centered: "Current Study" placed between Quarterly and Lesson Title */}
              <div className="mt-3 mb-1.5 flex flex-col items-center justify-center text-center">
                <span className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-center ${
                  isLight ? "text-amber-800/80" : "text-amber-300/85"
                }`}>
                  Current Study
                </span>
                
                {/* Centered Lesson Title */}
                <h2 className={`font-bold mt-1 text-center ${getLessonSubtitleFontSizeClass(readingFontSize)} ${
                  isLight ? "text-amber-950" : "text-amber-100"
                }`}>
                  {lessonTitle || "Stewardship and Mission"}
                </h2>
              </div>
            </div>

            {/* Reconfigured Navigation Controls Below Main Lesson Title: Previous Quarter, Previous Week & Calendar Date Picker */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 my-2">
              <button
                type="button"
                id="btn-ssq-prev-quarter"
                onClick={handlePreviousQuarter}
                disabled={isNavigatingDate}
                title="Navigate to Previous Quarter's Lessons and Update Calendar"
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap leading-none text-center ${
                  isLight
                    ? "border-[#C9973A]/60 bg-amber-50/90 hover:bg-amber-100 text-amber-950 hover:border-amber-500"
                    : "border-[#C9973A]/50 bg-[#142040] hover:bg-[#1D2B4E] text-amber-300 hover:text-white hover:border-amber-400"
                } disabled:opacity-50`}
              >
                <ChevronLeft size={13} className="shrink-0" />
                <span>{isNavigatingDate ? "Loading..." : "Previous Quarter"}</span>
              </button>

              <button
                type="button"
                id="btn-ssq-prev-week"
                onClick={handlePreviousWeek}
                disabled={isNavigatingDate}
                title="Navigate to Previous Week's Lesson and Update Calendar"
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap leading-none text-center ${
                  isLight
                    ? "border-[#C9973A]/60 bg-amber-50/90 hover:bg-amber-100 text-amber-950 hover:border-amber-500"
                    : "border-[#C9973A]/50 bg-[#142040] hover:bg-[#1D2B4E] text-amber-300 hover:text-white hover:border-amber-400"
                } disabled:opacity-50`}
              >
                <ChevronLeft size={13} className="shrink-0" />
                <span>{isNavigatingDate ? "Loading..." : "Previous Week"}</span>
              </button>

              {/* Dynamic Calendar Date Picker */}
              <div 
                id="ssq-calendar-picker-wrapper"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-all shadow-xs ${
                  isLight
                    ? "border-[#C9973A]/60 bg-amber-50/90 text-amber-950"
                    : "border-[#C9973A]/50 bg-[#142040] text-amber-300"
                }`}
                title="Select date on calendar to fetch and display corresponding Sabbath School lesson data"
              >
                <Calendar size={13} className="shrink-0 text-[#C9973A]" />
                <input
                  type="date"
                  id="ssq-calendar-date-input"
                  value={currentLessonDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  disabled={isNavigatingDate}
                  className={`bg-transparent text-xs font-mono font-bold focus:outline-none cursor-pointer disabled:opacity-50 ${
                    isLight ? "text-amber-950" : "text-amber-300"
                  }`}
                  aria-label="Sabbath School lesson date picker"
                />
              </div>
            </div>

            {/* Decorative Diamond Motif */}
            <div className="flex items-center justify-center gap-2 py-0.5 opacity-80">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9973A]" />
              <span className="text-[#C9973A] text-xs">✧ ✦ ✧</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9973A]" />
            </div>

            {/* ========================================================= */}
            {/* KEY MEMORY VERSE BOX (Interactive, Clean, Integrated)     */}
            {/* ========================================================= */}
            <div 
              id="ssq-key-memory-verse-box"
              className={`relative rounded-2xl p-5 sm:p-6 border transition-colors ${
                isLight
                  ? "bg-[#FFFDF9] border-[#C9973A]/45 shadow-[0_4px_16px_rgba(201,151,58,0.06)]"
                  : "bg-[#09132A]/90 border-[#C9973A]/40 shadow-[inset_0_1px_15px_rgba(0,0,0,0.4)]"
              }`}
            >
              {/* Floating Center Top Pill: KEY MEMORY VERSE */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-[#C9973A]/60 bg-[#0B1530] text-[#EAD49E] text-[8.5px] sm:text-[9.5px] font-mono font-bold tracking-wider uppercase shadow-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap leading-none z-20">
                <Sparkles size={10} className="text-[#C9973A] shrink-0" />
                <span className="text-center font-black">Key Memory Verse</span>
              </div>

              {/* Background watermark quote */}
              <Quote
                size={70}
                className={`absolute -right-2 -bottom-2 pointer-events-none opacity-10 ${
                  isLight ? "text-amber-900" : "text-amber-400"
                }`}
              />

              {/* Top Controls Row for Memory Verse: Recall & Scheduled (Centered) */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1 mb-3">
                {/* Recall Toggle Button */}
                <button
                  id="btn-toggle-scramble"
                  onClick={() => setHideKeyWords(!hideKeyWords)}
                  type="button"
                  title={hideKeyWords ? "Reveal all keywords" : "Hide keywords to test active memory recall"}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border text-[11px] font-mono font-bold transition cursor-pointer shadow-xs whitespace-nowrap leading-none text-center ${
                    hideKeyWords
                      ? "bg-amber-500 text-neutral-950 border-amber-400 font-black"
                      : isLight
                      ? "border-amber-400/80 bg-amber-50 text-amber-950 hover:bg-amber-100"
                      : "border-[#C9973A]/40 bg-[#142040] text-amber-300 hover:text-white hover:border-amber-400"
                  }`}
                >
                    {hideKeyWords ? (
                      <>
                        <Eye size={12} className="shrink-0" />
                        <span className="text-center">Reveal Verse</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} className="shrink-0" />
                        <span className="text-center">Recall</span>
                      </>
                    )}
                  </button>

                  {/* Scheduled Button */}
                  <button
                    onClick={toggleRecallCycle}
                    type="button"
                    title={
                      isInRecallCycle
                        ? "In Daily Recall Schedule (Click to remove)"
                        : "Add this memory verse to your Leitner Spaced Repetition Schedule"
                    }
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border transition-all text-[11px] font-mono font-bold cursor-pointer shadow-xs whitespace-nowrap leading-none text-center ${
                      isInRecallCycle
                        ? isLight
                          ? "bg-amber-200 border-amber-500 text-amber-950 font-black"
                          : "bg-amber-500/25 border-amber-500/60 text-amber-300 font-black"
                        : isLight
                        ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700 font-semibold"
                        : "bg-[#142040] hover:bg-[#1D2B4E] border-[#C9973A]/40 text-stone-300 hover:text-amber-300 font-semibold"
                    }`}
                  >
                    <Bookmark
                      size={12}
                      className={`shrink-0 ${
                        isInRecallCycle
                          ? isLight ? "fill-amber-900 text-amber-900" : "fill-amber-400 text-amber-400"
                          : isLight ? "text-stone-500" : "text-neutral-400"
                      }`}
                    />
                    <span className="text-center">
                      Scheduled
                    </span>
                  </button>
              </div>

              {/* Verse Interactive Recall Body */}
              <div className="my-2 relative z-10">
                <InteractiveRecallVerse
                  verseText={text}
                  reference={reference}
                  isLight={isLight}
                  isRecallMode={hideKeyWords}
                  fontSizeClass={getMemoryVerseFontSizeClass(readingFontSize)}
                  onToggleRecallMode={() => setHideKeyWords(!hideKeyWords)}
                  onMasteryAchieved={() => {
                    if (!isInRecallCycle) {
                      toggleRecallCycle();
                    }
                  }}
                />
              </div>

              {/* Verse Reference Citation Footnote */}
              <div className="mt-3 text-right">
                <span className={`${getReferenceFontSizeClass(readingFontSize)} font-mono font-bold tracking-wider ${
                  isLight ? "text-[#783E0A]" : "text-amber-300"
                }`}>
                  — {reference}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODALS & INTEGRATED EXTENSIONS                            */}
      {/* ========================================================= */}

      {/* Audio Player Modal */}
      <SabbathAudioPlayerModal
        isOpen={isAudioPlayerOpen}
        onClose={() => setIsAudioPlayerOpen(false)}
        onOpenVideo={() => setIsVideoPlayerOpen(true)}
      />

      {/* Video Player Modal */}
      <SabbathVideoPlayerModal
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
        onOpenAudio={() => setIsAudioPlayerOpen(true)}
        initialChannel={videoModalChannel}
      />

      {/* Share Modal */}
      <SabbathShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onTriggerPrint={() => window.print()}
      />
    </div>
  );
};
