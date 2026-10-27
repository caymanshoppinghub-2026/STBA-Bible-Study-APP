/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Quote, Eye, EyeOff, Bookmark, Check, Sparkles } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { formatStandardReference } from "../../utils/sabbathUtils";

const STOP_WORDS = new Set([
  "and", "a", "an", "the", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "through", "after", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "it",
  "its", "this", "that", "these", "those", "they", "them", "their",
  "his", "her", "he", "she", "you", "your", "we", "our", "us", "my",
  "me", "i", "who", "whom", "which", "what", "where", "when", "why",
  "how", "all", "any", "both", "each", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "can", "will", "just", "should", "now", "or",
  "but", "as", "if", "there"
]);

export const MemoryTextCard: React.FC = () => {
  const { memoryVerse, readingTheme, readingFontSize } = useSabbathSchoolStore();
  const [hideKeyWords, setHideKeyWords] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isLight = readingTheme === "light";

  const getTextFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-base md:text-lg";
      case "lg":
        return "text-xl md:text-2xl";
      case "xl":
        return "text-2xl md:text-3xl";
      default:
        return "text-lg md:text-xl";
    }
  };

  // Split reference and text
  let reference = "1 Corinthians 10:31, NKJV";
  let text = "Therefore, whether you eat or drink, or whatever you do, do all to the glory of God";

  if (memoryVerse) {
    const cleanVerse = memoryVerse.trim();
    // Check pattern: "Text..." (Reference)
    const parenMatch = cleanVerse.match(/^[“"']?(.*?)[”"']?\s*\(([^)]+)\)\.?$/);
    if (parenMatch) {
      text = parenMatch[1].replace(/^[“"']|[”"']$/g, "").trim();
      reference = parenMatch[2].trim();
    } else if (cleanVerse.includes("—")) {
      const parts = cleanVerse.split("—");
      reference = parts[0].trim();
      text = parts[1].replace(/['"“”]/g, "").trim();
    } else if (cleanVerse.includes("-")) {
      const parts = cleanVerse.split("-");
      reference = parts[0].trim();
      text = parts[1].replace(/['"“”]/g, "").trim();
    } else {
      text = cleanVerse.replace(/['"“”]/g, "").trim();
      reference = "Memory Verse";
    }
  }

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
        setToastMsg(`"${reference}" added to Daily Recall Cycle!`);
      } else {
        list = list.filter((r) => r !== reference);
        setToastMsg(`"${reference}" removed from Daily Recall Cycle.`);
      }
      localStorage.setItem("recall_cycle_verses", JSON.stringify(list));
    } catch (e) {}
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Render text with all substantive keywords masked when hideKeyWords is active
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
                ? "bg-amber-200 border border-amber-400 text-amber-950"
                : "bg-amber-500/20 border border-amber-500/40 text-amber-400"
            }`}
            title="Hidden keyword"
          >
            ______
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      id="memory-text-card"
      className={`relative p-6 border rounded-2xl md:rounded-[20px] shadow-2xs overflow-hidden mb-6 transition-colors ${
        isLight
          ? "bg-white border-[#E5DFD5] text-stone-900"
          : "bg-[#161B22] border-[#21262D] text-neutral-100"
      }`}
    >
      {/* Decorative quotes icons on the background */}
      <Quote
        size={80}
        className={`absolute -right-4 -bottom-4 pointer-events-none ${
          isLight ? "text-stone-300/20" : "text-neutral-800/20"
        }`}
      />

      {/* Toast alert when added to recall */}
      {toastMsg && (
        <div
          className={`mb-3 px-3 py-2 border rounded-xl text-xs font-mono flex items-center justify-between animate-fadeIn ${
            isLight
              ? "bg-[#FEF6E4] border-[#F7E1AD] text-[#8C5209] font-bold"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <Check size={14} className={isLight ? "text-[#92400E]" : "text-amber-400"} />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 relative z-10 mb-4">
        {/* Golden Memory Text badge and Recall Test button side by side */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 flex-wrap">
          <span
            className={`text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border inline-block ${
              isLight
                ? "bg-[#FEF6E4] text-[#8C5209] border-[#F7E1AD] font-bold"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            Golden Memory Text
          </span>

          <button
            id="btn-toggle-scramble"
            onClick={() => setHideKeyWords(!hideKeyWords)}
            title={hideKeyWords ? "Reveal all keywords" : "Hide all keywords simultaneously to practice recall"}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer ${
              hideKeyWords
                ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-xs font-bold"
                : isLight
                ? "border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200"
                : "border-neutral-800 bg-neutral-850 text-neutral-300 hover:text-white hover:border-neutral-700"
            }`}
          >
            {hideKeyWords ? (
              <>
                <Eye size={13} className="shrink-0" />
                <span className="text-center">Reveal All Keywords</span>
              </>
            ) : (
              <>
                <EyeOff size={13} className="shrink-0" />
                <span className="text-center">Recall</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Verse reference and Add Recall button on the same line */}
        <div className={`flex items-center justify-between gap-3 pt-2 border-t ${isLight ? "border-stone-200" : "border-neutral-800/80"}`}>
          <h4 className={`text-sm sm:text-base font-bold font-mono flex items-center gap-2 tracking-normal no-underline ${isLight ? "text-amber-900" : "text-amber-400"}`}>
            <span className="no-underline tracking-normal">{formatStandardReference(reference)}</span>
          </h4>

          <button
            onClick={toggleRecallCycle}
            type="button"
            title={
              isInRecallCycle
                ? "In Daily Recall Cycle (Click to remove)"
                : "Add this memory text to Daily Recall Cycle for daily reminders"
            }
            className={`p-1.5 px-3 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
              isInRecallCycle
                ? isLight
                  ? "bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-sm"
                  : "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm"
                : isLight
                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                : "bg-neutral-850 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-amber-300"
            }`}
          >
            <Bookmark
              size={14}
              className={isInRecallCycle ? (isLight ? "fill-amber-800 text-amber-800" : "fill-amber-400 text-amber-400") : isLight ? "text-stone-500" : "text-neutral-400"}
            />
            <span className="text-[11px] font-semibold">
              {isInRecallCycle ? "In Recall Cycle" : "Add Recall"}
            </span>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        <p className={`font-sans font-medium italic leading-relaxed tracking-wide ${getTextFontSizeClass(readingFontSize)} ${isLight ? "text-stone-900" : "text-neutral-100"}`}>
          “{renderScrambledTextNode()}”
        </p>

        {hideKeyWords && (
          <p className={`text-[11px] mt-3 font-mono leading-tight flex items-center gap-1.5 p-2 rounded-lg border ${
            isLight ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            <Sparkles size={12} className="shrink-0 text-amber-500" />
            <span>All keywords hidden! Recite the text from memory, then tap 'Reveal All Keywords' to verify your accuracy.</span>
          </p>
        )}
      </div>
    </div>
  );
};
