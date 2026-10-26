/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, Sparkles, RotateCcw, Lightbulb, Eye, EyeOff, Award, ArrowRight } from "lucide-react";

export const STOP_WORDS = new Set([
  "and", "a", "an", "the", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "through", "after", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "it",
  "its", "this", "that", "these", "those", "they", "them", "their",
  "his", "her", "he", "she", "you", "your", "we", "our", "us", "my",
  "me", "i", "who", "whom", "which", "what", "where", "when", "why",
  "how", "all", "any", "both", "each", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "can", "will", "just", "should", "now", "or",
  "but", "as", "if", "there", "out", "much", "many", "might", "may",
  "could", "would", "shall"
]);

interface BlankItem {
  blankIndex: number;
  rawWord: string;
  cleanExpected: string;
}

interface VerseToken {
  type: "blank" | "text";
  raw: string;
  blankIndex?: number;
  cleanExpected?: string;
}

export interface InteractiveRecallVerseProps {
  verseText: string;
  reference: string;
  isLight: boolean;
  isRecallMode: boolean;
  onToggleRecallMode?: () => void;
  fontSizeClass?: string;
  onMasteryAchieved?: () => void;
}

export const InteractiveRecallVerse: React.FC<InteractiveRecallVerseProps> = ({
  verseText,
  reference,
  isLight,
  isRecallMode,
  onToggleRecallMode,
  fontSizeClass = "text-base md:text-lg",
  onMasteryAchieved,
}) => {
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Parse verse tokens into plain text and interactive blanks
  const { tokens, blanks } = useMemo(() => {
    const rawTokens: VerseToken[] = [];
    const blankList: BlankItem[] = [];
    let currentBlankIdx = 0;

    // Tokenize word characters (including internal hyphens and apostrophes) vs non-word characters
    const regex = /([a-zA-Z0-9'\u2019-]+)|([^a-zA-Z0-9'\u2019-]+)/g;
    let match;

    while ((match = regex.exec(verseText)) !== null) {
      if (match[1]) {
        const rawWord = match[1];
        const cleanWord = rawWord.toLowerCase().replace(/[^a-z0-9]/g, "");

        // Determine if this substantive word should be a typed blank
        if (cleanWord.length >= 2 && !STOP_WORDS.has(cleanWord)) {
          const blankIdx = currentBlankIdx++;
          blankList.push({
            blankIndex: blankIdx,
            rawWord,
            cleanExpected: cleanWord,
          });
          rawTokens.push({
            type: "blank",
            raw: rawWord,
            blankIndex: blankIdx,
            cleanExpected: cleanWord,
          });
        } else {
          rawTokens.push({
            type: "text",
            raw: rawWord,
          });
        }
      } else if (match[2]) {
        rawTokens.push({
          type: "text",
          raw: match[2],
        });
      }
    }

    return { tokens: rawTokens, blanks: blankList };
  }, [verseText]);

  // Reset inputs when verse changes or recall mode toggles off
  useEffect(() => {
    setUserInputs({});
    setShowHints(false);
    setShowCelebration(false);
  }, [verseText, isRecallMode]);

  // Count correct answers
  const correctCount = useMemo(() => {
    if (!isRecallMode) return 0;
    return blanks.reduce((count, b) => {
      const typed = (userInputs[b.blankIndex] || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      return typed === b.cleanExpected ? count + 1 : count;
    }, 0);
  }, [blanks, userInputs, isRecallMode]);

  const totalBlanks = blanks.length;
  const isAllCorrect = totalBlanks > 0 && correctCount === totalBlanks;

  // Auto-trigger celebration when 100% reached
  useEffect(() => {
    if (isAllCorrect && isRecallMode) {
      setShowCelebration(true);
      if (onMasteryAchieved) {
        onMasteryAchieved();
      }
    }
  }, [isAllCorrect, isRecallMode, onMasteryAchieved]);

  const handleInputChange = (blankIdx: number, value: string) => {
    setUserInputs((prev) => ({
      ...prev,
      [blankIdx]: value,
    }));

    // Auto-advance if the typed word matches expected
    const cleanTyped = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const expected = blanks.find((b) => b.blankIndex === blankIdx)?.cleanExpected;

    if (expected && cleanTyped === expected) {
      // Small timeout so user sees their typed word before focus jumps
      setTimeout(() => {
        const nextInput = inputRefs.current[blankIdx + 1];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 90);
    }
  };

  const handleKeyDown = (blankIdx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Move to next input
      const nextInput = inputRefs.current[blankIdx + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === "Backspace") {
      const currentVal = userInputs[blankIdx] || "";
      if (currentVal.length === 0) {
        // Jump to previous input
        const prevInput = inputRefs.current[blankIdx - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  const handleClearAll = () => {
    setUserInputs({});
    setShowCelebration(false);
    // Focus first input
    const firstInput = inputRefs.current[0];
    if (firstInput) {
      firstInput.focus();
    }
  };

  const handleFillAll = () => {
    const filled: Record<number, string> = {};
    blanks.forEach((b) => {
      filled[b.blankIndex] = b.rawWord;
    });
    setUserInputs(filled);
  };

  // If recall mode is NOT active, render normal display
  if (!isRecallMode) {
    return (
      <div className="relative z-10 select-text">
        <p className={`font-bible italic leading-relaxed ${fontSizeClass} ${
          isLight ? "text-stone-900 font-medium" : "text-stone-100 font-normal"
        }`}>
          “{verseText}”
        </p>
      </div>
    );
  }

  // RECALL MODE ACTIVE: Interactive Typing Experience
  const progressPercent = totalBlanks > 0 ? Math.round((correctCount / totalBlanks) * 100) : 0;

  return (
    <div className="relative z-10 w-full space-y-4">
      {/* Interactive Helper & Controls Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs ${
          isLight
            ? "bg-[#FFF9E6] border-[#F0D597] text-stone-800"
            : "bg-[#0D1B3A] border-[#C9973A]/40 text-neutral-200"
        }`}
      >
        {/* Progress Display */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono font-bold">
            <Sparkles size={14} className="text-amber-500" />
            <span>Typed Recall:</span>
            <span className={`px-1.5 py-0.5 rounded text-[11px] ${
              isAllCorrect
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black"
                : "text-amber-700 dark:text-amber-300"
            }`}>
              {correctCount} / {totalBlanks} ({progressPercent}%)
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-20 sm:w-28 h-2 bg-stone-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isAllCorrect ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Hint Button */}
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            title={showHints ? "Hide first-letter hints" : "Show first-letter hints to jog your memory"}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1 ${
              showHints
                ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold"
                : isLight
                ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700"
                : "bg-[#142244] hover:bg-[#1D2E5C] border-[#C9973A]/30 text-amber-200"
            }`}
          >
            <Lightbulb size={12} className={showHints ? "text-neutral-950" : "text-amber-500"} />
            <span>{showHints ? "Hints On" : "First Letter Hint"}</span>
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClearAll}
            title="Clear all typed words to test yourself again"
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1 ${
              isLight
                ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700"
                : "bg-[#142244] hover:bg-[#1D2E5C] border-[#C9973A]/30 text-stone-300 hover:text-white"
            }`}
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>

          {/* Reveal/Fill All */}
          <button
            type="button"
            onClick={handleFillAll}
            title="Reveal all words to review accuracy"
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1 ${
              isLight
                ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700"
                : "bg-[#142244] hover:bg-[#1D2E5C] border-[#C9973A]/30 text-stone-300 hover:text-white"
            }`}
          >
            <Eye size={12} />
            <span>Reveal</span>
          </button>
        </div>
      </div>

      {/* Interactive Verse Body with Inline Blank Inputs */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border leading-loose font-bible ${fontSizeClass} ${
          isLight
            ? "bg-white/90 border-[#E8DDC6] text-stone-900 shadow-xs"
            : "bg-[#091226] border-[#C9973A]/30 text-neutral-100 shadow-inner"
        }`}
      >
        <span className="opacity-60 select-none mr-1">“</span>
        {tokens.map((token, tIdx) => {
          if (token.type === "text") {
            return (
              <span key={`text-${tIdx}`} className="whitespace-pre-wrap select-text">
                {token.raw}
              </span>
            );
          }

          // Render interactive blank input
          const blankIdx = token.blankIndex!;
          const currentVal = userInputs[blankIdx] || "";
          const cleanVal = currentVal.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
          const isCorrect = cleanVal === token.cleanExpected;
          const isPartiallyFilled = currentVal.length > 0 && !isCorrect;

          const widthCh = Math.max((token.cleanExpected?.length || 4) + 1.2, 4.5);

          return (
            <span
              key={`blank-wrap-${blankIdx}`}
              className="inline-flex items-center align-baseline mx-0.5 relative group"
            >
              <input
                ref={(el) => { inputRefs.current[blankIdx] = el; }}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                value={currentVal}
                placeholder={showHints ? `${token.raw.charAt(0)}${".".repeat(Math.max(token.raw.length - 1, 1))}` : "______"}
                onChange={(e) => handleInputChange(blankIdx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(blankIdx, e)}
                style={{ width: `${widthCh}ch` }}
                className={`px-1.5 py-0.5 text-center font-mono text-xs sm:text-sm font-bold rounded-md transition-all outline-none border focus:ring-2 focus:ring-amber-500/50 ${
                  isCorrect
                    ? isLight
                      ? "bg-emerald-100/90 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-400"
                      : "bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-xs ring-1 ring-emerald-500"
                    : isPartiallyFilled
                    ? isLight
                      ? "bg-amber-100 border-amber-400 text-amber-950"
                      : "bg-amber-500/20 border-amber-500/60 text-amber-200"
                    : isLight
                    ? "bg-stone-100/90 border-stone-300 text-stone-800 placeholder-stone-400 hover:border-amber-400"
                    : "bg-[#121E3E] border-neutral-700 text-white placeholder-neutral-500 hover:border-amber-500/50"
                }`}
                title={`Type word #${blankIdx + 1} (Target length: ${token.raw.length} letters)`}
              />
              {/* Mini checkmark indicator when correctly entered */}
              {isCorrect && (
                <span className="absolute -top-2 -right-1.5 bg-emerald-500 text-neutral-950 rounded-full p-0.5 shadow-xs pointer-events-none animate-fadeIn">
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
            </span>
          );
        })}
        <span className="opacity-60 select-none ml-1">”</span>
      </div>

      {/* 100% Mastery Celebration Banner */}
      {showCelebration && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn ${
            isLight
              ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-emerald-300 text-emerald-950"
              : "bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-neutral-900 border-emerald-500/50 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-emerald-500 text-neutral-950 shrink-0 shadow-sm">
              <Award size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm font-sans flex items-center gap-1.5">
                <span>Praise God! Memory Verse Mastered!</span>
                <Sparkles size={14} className="text-amber-500" />
              </h4>
              <p className="text-xs opacity-90 font-mono mt-0.5">
                You successfully recalled and typed all {totalBlanks} key words of {reference}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearAll}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? "bg-white hover:bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs"
                  : "bg-emerald-900/50 hover:bg-emerald-800/60 border-emerald-600 text-emerald-100"
              }`}
            >
              <RotateCcw size={12} />
              <span>Practice Again</span>
            </button>

            {onToggleRecallMode && (
              <button
                type="button"
                onClick={onToggleRecallMode}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>Done</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Helpful Instructions Prompt */}
      <div
        className={`text-[11px] font-mono px-3 py-2 rounded-lg border flex items-center justify-between gap-2 ${
          isLight
            ? "bg-stone-50 border-stone-200 text-stone-600"
            : "bg-[#0A142A] border-[#212E4F] text-neutral-400"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>Type missing words into blanks. Press <strong>Space</strong> or <strong>Enter</strong> to auto-advance.</span>
        </div>
        <span className="hidden sm:inline-block opacity-75">
          {totalBlanks - correctCount} word{totalBlanks - correctCount === 1 ? "" : "s"} remaining
        </span>
      </div>
    </div>
  );
};
