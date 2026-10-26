/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, Award, Users, RefreshCw, FileText, Printer, Share2 } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { SabbathAudioPlayerModal } from "./SabbathAudioPlayerModal";
import { SabbathVideoPlayerModal } from "./SabbathVideoPlayerModal";
import { SabbathShareModal } from "./SabbathShareModal";

export const WeeklyLessonHeader: React.FC = () => {
  const {
    quarterlyTitle,
    lessonTitle,
    userRole,
    setUserRole,
    importLessonText,
    isParsing,
    resetStore,
    readingTheme,
    dailyLessons,
    selectedDayIndex,
    isEgwAudioPlaying,
    isEgwVideoPlaying,
    setActiveMediaSource
  } = useSabbathSchoolStore();

  const isLight = readingTheme === "light";

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modals for Media buttons
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Dynamic media availability check
  const activeDay = dailyLessons[selectedDayIndex] || dailyLessons[0];
  const hasAudio = (activeDay as any)?.hasAudio !== false;
  const hasVideo = (activeDay as any)?.hasVideo !== false;

  const handleImport = async () => {
    if (!importText.trim()) {
      setErrorMsg("Please paste some lesson content to parse.");
      return;
    }
    setErrorMsg("");
    try {
      await importLessonText(importText);
      setIsImportModalOpen(false);
      setImportText("");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to parse. Please try again.");
    }
  };

  const loadPreset = (type: string) => {
    let text = "";
    if (type === "sanctuary") {
      text = "We are starting a deep study of 'The Sanctuary Covenant'. Memory text is Hebrews 8:1-2: Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man. Day 1 is Sovereign Sanctuary Model. Day 2 is Sacerdotal Shadows in History. Day 3 is The Sovereign Mercy Seat. Day 4 is Christ entering Celestial Portals. Day 5 is The Hour of Cleansing Vindication. Day 6 is Vindicated Character of Grace. Day 7 is Class Reflection Fellowship.";
    } else if (type === "angels") {
      text = "Topic is 'Three Angels End-Time Remnant Message'. Memory verse is Revelation 14:12: Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus. Day 1 is Flying in Midst of Heaven. Day 2 is Fear God and Give Glory. Day 3 is The Sovereign Hour of Judgment. Day 4 is Worship the Great Creator. Day 5 is Babylon is Fallen, and Her Wine. Day 6 is The Mark and the Forehead Seal. Day 7 is Perfect Rest of the Saints.";
    }
    setImportText(text);
  };

  return (
    <div
      id="weekly-lesson-header"
      className={`relative p-6 md:p-8 border rounded-2xl md:rounded-[20px] shadow-2xs overflow-hidden mb-6 transition-colors ${
        isLight
          ? "bg-white border-[#E5DFD5] text-stone-900"
          : "bg-[#161B22] border-[#21262D] text-neutral-100"
      }`}
    >
      {/* Absolute decorative accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 rounded-l-2xl md:rounded-l-[20px]"></div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                isLight
                  ? "bg-[#FEF6E4] text-[#8C5209] border-[#F7E1AD]"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              <BookOpen size={13} className={isLight ? "text-[#92400E]" : "text-amber-400"} />
              <span>Sabbath School Quarterly</span>
            </span>
          </div>
          <h2 className={`text-xs sm:text-sm font-sans font-medium mb-1 ${isLight ? "text-stone-500" : "text-neutral-400"}`}>
            {quarterlyTitle}
          </h2>
          <h1 className={`text-2xl sm:text-3xl font-sans font-extrabold tracking-tight ${isLight ? "text-stone-900" : "text-white"}`}>
            {lessonTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {/* Ellen White Notes Video & Audio Button (Leftmost of Media Controls) */}
          <div className="flex items-center justify-center p-1 sm:p-1.5 md:p-2 relative">
            <button
              id="ssq-egw-notes-btn"
              type="button"
              onClick={() => {
                setActiveMediaSource("egwNotes");
                setIsVideoPlayerOpen(true);
              }}
              title="Ellen White Notes Video & Audio Lessons (2026 Q3 Lesson 6)"
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md group shrink-0 relative ${
                isEgwAudioPlaying || isEgwVideoPlaying
                  ? "bg-amber-500 text-neutral-950 border-amber-400 ring-2 ring-amber-500/50"
                  : isLight
                  ? "bg-stone-900 hover:bg-stone-800 border-stone-800 text-white"
                  : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white"
              }`}
            >
              <div className="relative">
                <BookOpen className={`w-5 h-5 sm:w-5 sm:h-5 transition-colors ${
                  isEgwAudioPlaying || isEgwVideoPlaying
                    ? "text-neutral-950"
                    : "text-amber-400 group-hover:text-amber-300"
                }`} />
                {(isEgwAudioPlaying || isEgwVideoPlaying) && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-950 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-900"></span>
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider leading-none ${
                  isEgwAudioPlaying || isEgwVideoPlaying ? "text-neutral-950" : "text-amber-400"
                }`}>
                  EGW Notes
                </span>
                <span className="text-[11px] font-sans font-extrabold leading-tight">
                  {isEgwAudioPlaying ? "Audio Playing ♪" : isEgwVideoPlaying ? "Video Playing 🎬" : "Video & Audio"}
                </span>
              </div>
            </button>
          </div>

          {/* Print Button */}
          <button
            id="ssq-print-btn"
            type="button"
            onClick={() => window.print()}
            title="Print Lesson Page"
            className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer shadow-sm ${
              isLight
                ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-amber-300"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
            }`}
          >
            <Printer size={18} className="text-amber-500" />
          </button>

          {/* Share Button */}
          <button
            id="ssq-share-btn"
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            title="Share Lesson"
            className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer shadow-sm ${
              isLight
                ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-amber-300"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
            }`}
          >
            <Share2 size={18} className="text-amber-500" />
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div id="import-modal-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="import-modal-container" className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Import Sabbath School Syllabus</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Paste raw study material, commentary paragraphs, or copy-pasted lesson outlines. 
              Our AI engine will parse the text and extract the Quarterly Title, Lesson Title, Memory Verse, daily breakdowns, and automatically construct discussion cards.
            </p>

            {/* Presets */}
            <div className="flex gap-2 mb-4">
              <span className="text-xs text-neutral-500 self-center">Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset("sanctuary")}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                The Sanctuary
              </button>
              <button
                type="button"
                onClick={() => loadPreset("angels")}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
              >
                Three Angels
              </button>
            </div>

            <textarea
              id="import-text-area"
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste lesson text or quarterly commentary details here..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-200 placeholder-neutral-650 focus:outline-none focus:border-amber-500 transition mb-3"
            />

            {errorMsg && (
              <div className="text-xs text-red-400 mb-3 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                id="btn-import-cancel"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="btn-import-submit"
                onClick={handleImport}
                disabled={isParsing}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 text-neutral-950 font-bold text-xs rounded-lg transition flex items-center gap-2"
              >
                {isParsing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Synthesize with AI</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
