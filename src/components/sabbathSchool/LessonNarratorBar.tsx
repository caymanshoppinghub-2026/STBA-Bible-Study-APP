/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Volume2, Play, Pause, Square, Sparkles, RefreshCw, X } from "lucide-react";
import { useLessonNarrator } from "../../hooks/useLessonNarrator";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { motion, AnimatePresence } from "motion/react";

export const LessonNarratorBar: React.FC = () => {
  const {
    activeDayIndex,
    activeLessonTitle,
    isSpeaking,
    isPaused,
    isLoading,
    speed,
    setSpeed,
    pause,
    resume,
    stop,
    narratorVoiceName
  } = useLessonNarrator();

  const { readingTheme } = useSabbathSchoolStore();
  const isLight = readingTheme === "light";

  if (!isSpeaking && !isLoading) {
    return null;
  }

  const toggleSpeed = () => {
    setSpeed(speed === 1.0 ? 1.25 : 1.0);
  };

  return (
    <AnimatePresence>
      <motion.div
        id="sabbath-lesson-narrator-bar"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40"
      >
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 ${
            isLight
              ? "bg-[#FFFDF9]/95 border-[#D4A346]/80 text-stone-900 shadow-amber-900/10 ring-1 ring-[#D4A346]/40"
              : "bg-[#161B22]/95 border-[#D4A346]/70 text-white shadow-black/60 ring-1 ring-[#D4A346]/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Left: Icon & Title info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-[#D4A346]/20 border-[#D4A346]/50 text-[#F5CF78]"
                }`}
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin text-[#D4A346]" />
                ) : (
                  <Volume2 size={16} className="text-[#D4A346]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1">
                    <Sparkles size={10} />
                    <span>Narrator: {narratorVoiceName}</span>
                  </span>
                  {!isLoading && !isPaused && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-2 bg-amber-500 animate-pulse rounded-full"></span>
                      <span className="w-1 h-3 bg-amber-500 animate-pulse delay-75 rounded-full"></span>
                      <span className="w-1 h-1.5 bg-amber-500 animate-pulse delay-150 rounded-full"></span>
                    </span>
                  )}
                </div>

                <h5 className="text-xs sm:text-sm font-sans font-bold truncate leading-tight">
                  {isLoading
                    ? "Preparing lesson narration..."
                    : `Day ${(activeDayIndex ?? 0) + 1}: ${activeLessonTitle}`}
                </h5>
              </div>
            </div>

            {/* Right: Audio Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Speed toggle */}
              <button
                type="button"
                id="btn-narrator-speed-toggle"
                onClick={toggleSpeed}
                className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  speed > 1.0
                    ? "bg-amber-500 text-stone-950 border-amber-400"
                    : isLight
                    ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                    : "bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-300"
                }`}
                title="Toggle playback speed (1.0x / 1.25x)"
              >
                {speed.toFixed(2).replace(/\.00$/, "")}x
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                id="btn-narrator-play-pause"
                onClick={isPaused ? resume : pause}
                disabled={isLoading}
                className={`p-2 rounded-xl font-bold transition-all cursor-pointer border shadow-sm ${
                  isPaused
                    ? isLight
                      ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
                      : "bg-[#D4A346]/30 hover:bg-[#D4A346]/40 border-[#D4A346]/60 text-amber-300"
                    : "bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(212,163,70,0.35)]"
                }`}
                title={isPaused ? "Resume Narration" : "Pause Narration"}
              >
                {isPaused ? (
                  <Play size={14} className="fill-current" />
                ) : (
                  <Pause size={14} className="fill-current" />
                )}
              </button>

              {/* Stop & Close */}
              <button
                type="button"
                id="btn-narrator-stop"
                onClick={stop}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isLight
                    ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-600 hover:text-stone-900"
                    : "bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-400 hover:text-white"
                }`}
                title="Stop Narration"
              >
                <Square size={13} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
