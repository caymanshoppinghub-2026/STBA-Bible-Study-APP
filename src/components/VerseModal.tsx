/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  BookOpen, 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  BookmarkCheck, 
  ChevronDown, 
  Check, 
  Compass, 
  ShieldCheck, 
  ScrollText 
} from "lucide-react";
import { useSabbathSchoolStore } from "../store/useSabbathSchoolStore";
import { useTheme } from "../context/ThemeContext";
import { formatStandardReference } from "../utils/sabbathUtils";
import { 
  VerseItem, 
  ScripturePassage, 
  parseVersesFromRawText, 
  normalizeScriptureReference 
} from "../services/bibleService";
import { addScriptureToRecallQueue } from "../utils/recallScheduler";

export type TranslationVersion = "KJV" | "NKJV" | "ESV" | "NASB";

export interface VerseModalProps {
  isOpen: boolean;
  reference: string | null;
  initialVersion?: TranslationVersion;
  theme?: "light" | "dark";
  onClose: () => void;
  onStudyDeeper?: (reference: string, version: TranslationVersion) => void;
}

const TRANSLATIONS: { id: TranslationVersion; label: string; description: string }[] = [
  { id: "KJV", label: "KJV", description: "King James Version" },
  { id: "NKJV", label: "NKJV", description: "New King James Version" },
  { id: "ESV", label: "ESV", description: "English Standard Version" },
  { id: "NASB", label: "NASB", description: "New American Standard Bible" },
];

export const VerseModal: React.FC<VerseModalProps> = ({
  isOpen,
  reference,
  initialVersion = "KJV",
  theme,
  onClose,
}) => {
  const { readingTheme } = useSabbathSchoolStore();
  const themeContext = useTheme();

  // Dynamically adapt visual theme matching application active state
  const isLight =
    theme !== undefined
      ? theme === "light"
      : themeContext?.theme === "light" ||
        readingTheme === "light" ||
        (typeof document !== "undefined" &&
          (document.documentElement.classList.contains("light") ||
            document.documentElement.getAttribute("data-theme") === "light"));

  // Canonical normalization of reference text (e.g. "Revelation one to three and nine to eleven" -> "Revelation 1:1-3, 9-11")
  const normalizedInfo = normalizeScriptureReference(reference);
  const displayReference = formatStandardReference(normalizedInfo.normalizedRef || reference);

  const [version, setVersion] = useState<TranslationVersion>(
    (normalizedInfo.detectedVersion as TranslationVersion) || initialVersion
  );
  const [passage, setPassage] = useState<ScripturePassage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // In-modal deep study drawer toggle (strictly isolated within module)
  const [isDeepStudyOpen, setIsDeepStudyOpen] = useState<boolean>(false);

  // Memory dropdown state
  const [isMemoryDropdownOpen, setIsMemoryDropdownOpen] = useState<boolean>(false);
  const [memorySuccessMsg, setMemorySuccessMsg] = useState<string | null>(null);

  // Sequential verse navigation state for passages with multiple verses
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);

  // Cache previously fetched translations for instant tab switching
  const [cache, setCache] = useState<Record<string, ScripturePassage>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const memoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (normalizedInfo.detectedVersion) {
      setVersion(normalizedInfo.detectedVersion as TranslationVersion);
    } else if (initialVersion) {
      setVersion(initialVersion);
    }
    setActiveVerseIndex(0);
    setIsDeepStudyOpen(false);
    setIsMemoryDropdownOpen(false);
    setMemorySuccessMsg(null);
  }, [initialVersion, reference]);

  // Close memory dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        memoryDropdownRef.current &&
        !memoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMemoryDropdownOpen(false);
      }
    };
    if (isMemoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMemoryDropdownOpen]);

  useEffect(() => {
    if (!isOpen || !reference || typeof reference !== "string" || !reference.trim()) {
      setPassage(null);
      setError(null);
      setLoading(false);
      setActiveVerseIndex(0);
      return;
    }

    const { normalizedRef, detectedVersion } = normalizeScriptureReference(reference);
    const cleanRef = normalizedRef || reference.trim();
    const queryVersion = detectedVersion ? (detectedVersion as TranslationVersion) : version;

    const cacheKey = `${cleanRef}__${queryVersion}`;
    if (cache[cacheKey]) {
      setPassage(cache[cacheKey]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchVerse = async () => {
      try {
        const url = `/api/bible?ref=${encodeURIComponent(cleanRef)}&version=${queryVersion}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load verse (${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          const rawText = data.text || "Verse text not available.";
          let verses: VerseItem[] = [];

          if (Array.isArray(data.verses) && data.verses.length > 0) {
            verses = data.verses.map((v: any) => ({
              verse: v.verse,
              text: (v.text || "").replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
              book_name: v.book_name,
              chapter: v.chapter,
            }));
          } else {
            verses = parseVersesFromRawText(rawText);
          }

          const parsedPassage: ScripturePassage = {
            reference: data.reference || cleanRef,
            text: rawText,
            version: queryVersion,
            verses,
          };

          setPassage(parsedPassage);
          setCache((prev) => ({ ...prev, [cacheKey]: parsedPassage }));
          setLoading(false);
          setActiveVerseIndex(0);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(`Could not retrieve scripture text for "${cleanRef}". Please verify the reference.`);
          setLoading(false);
        }
      }
    };

    fetchVerse();

    return () => {
      isMounted = false;
    };
  }, [isOpen, reference, version]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reference) return null;

  const verses = passage?.verses || [];
  const hasMultipleVerses = verses.length > 1;

  // Scroll smoothly to target verse when stepped or clicked
  const handleSelectVerse = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, verses.length - 1));
    setActiveVerseIndex(validIndex);
    setTimeout(() => {
      const targetElement = document.getElementById(`verse-card-${validIndex}`);
      if (targetElement && scrollContainerRef.current) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 50);
  };

  // Memorize Verse action
  const handleMemorizeVerse = () => {
    const activeVerse = verses[activeVerseIndex] || { verse: 1, text: passage?.text || "" };
    const verseRef = hasMultipleVerses 
      ? `${passage?.reference || displayReference} (v. ${activeVerse.verse})`
      : (passage?.reference || displayReference);

    addScriptureToRecallQueue({
      reference: verseRef,
      text: activeVerse.text,
      trackTitle: "Scripture Memory Explorer",
      theologicalContext: `Active recall study scheduled from ${verseRef}.`,
    });

    setIsMemoryDropdownOpen(false);
    setMemorySuccessMsg(`Verse ${activeVerse.verse} added to Recall Schedule!`);
    setTimeout(() => setMemorySuccessMsg(null), 2800);
  };

  // Memorize All action
  const handleMemorizeAll = () => {
    if (!passage) return;
    const passageRef = passage.reference || displayReference;

    addScriptureToRecallQueue({
      reference: passageRef,
      text: passage.text,
      trackTitle: "Scripture Memory Explorer",
      theologicalContext: `Full scripture passage scheduled for memory mastery from ${passageRef}.`,
    });

    setIsMemoryDropdownOpen(false);
    setMemorySuccessMsg(`${passageRef} added to Recall Schedule!`);
    setTimeout(() => setMemorySuccessMsg(null), 2800);
  };

  // Strictly isolated Study Deeper action (toggles rich in-modal theological exegesis)
  const handleToggleStudyDeeper = () => {
    setIsDeepStudyOpen(!isDeepStudyOpen);
    if (!isDeepStudyOpen) {
      setTimeout(() => {
        const deeperPanel = document.getElementById("in-modal-deeper-study");
        if (deeperPanel && scrollContainerRef.current) {
          deeperPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto transition-opacity duration-300 ease-out animate-in fade-in bg-transparent backdrop-blur-none"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`relative w-full max-w-xl rounded-[36px] shadow-2xl overflow-hidden transform transition-all duration-300 ease-out animate-in fade-in zoom-in-[0.98] border ${
          isLight
            ? "bg-[#FFFDF9] border-stone-200 text-stone-900 ring-1 ring-black/5"
            : "bg-[#0A1220] border-[#E5B842]/30 text-stone-100 ring-1 ring-black/60"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER: Standard character spacing & no underlines mandated */}
        <div
          className={`flex items-center justify-between px-6 py-4.5 border-b rounded-t-[36px] ${
            isLight
              ? "bg-[#FAF6EF]/95 border-stone-200/90"
              : "bg-[#060D17]/95 border-[#E5B842]/20"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-[32px] flex items-center justify-center shrink-0 border shadow-xs ${
                isLight
                  ? "bg-amber-100/90 border-amber-300 text-amber-900"
                  : "bg-[#0F223D] border-[#E5B842]/35 text-[#F3CF65]"
              }`}
            >
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <h3
                className={`text-lg sm:text-xl font-bold font-serif tracking-normal no-underline select-text truncate ${
                  isLight ? "text-amber-950" : "text-[#F3CF65]"
                }`}
              >
                {displayReference}
              </h3>
              <p
                className={`text-[11px] font-mono font-medium tracking-normal no-underline uppercase mt-0.5 ${
                  isLight ? "text-stone-500" : "text-stone-400"
                }`}
              >
                Scripture Reference Explorer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-[32px] border flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
              isLight
                ? "bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950 border-stone-300"
                : "bg-[#0F223D] hover:bg-[#152E52] text-stone-300 hover:text-white border-[#E5B842]/25"
            }`}
            aria-label="Close scripture modal"
            title="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* TRANSLATION SELECTOR TABS */}
        <div
          className={`px-6 py-3 border-b flex items-center justify-between gap-2 overflow-x-auto ${
            isLight
              ? "bg-[#F7F2E8]/60 border-stone-200/80"
              : "bg-[#08111D] border-[#E5B842]/15"
          }`}
        >
          <div className="flex items-center gap-2 w-full">
            {TRANSLATIONS.map((trans) => {
              const isActive = version === trans.id;
              return (
                <button
                  key={trans.id}
                  onClick={() => setVersion(trans.id)}
                  title={trans.description}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-[32px] text-xs font-mono font-bold tracking-normal no-underline transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? isLight
                        ? "bg-[#E5B842] text-[#06162c] border-amber-400 font-black shadow-xs"
                        : "bg-[#E5B842] text-[#06162c] border-[#F3CF65] font-black shadow-xs"
                      : isLight
                      ? "bg-white text-stone-700 border-stone-200 hover:text-stone-950 hover:bg-stone-50 shadow-2xs"
                      : "bg-[#0E1A2B] text-stone-300 border-[#E5B842]/20 hover:text-white hover:bg-[#14253D]"
                  }`}
                >
                  {trans.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* REDESIGNED CONTROL BAR LAYOUT:
            - 'Previous' button on far left
            - 'Next' button on far right
            - Individual verse selectors centered between them
            - 'Verse 1 of 6' and 'All/Focus' buttons removed
        */}
        {hasMultipleVerses && !loading && !error && (
          <div
            className={`px-6 py-2.5 border-b flex items-center justify-between gap-2 text-xs font-mono select-none ${
              isLight
                ? "bg-[#F4EEE2]/80 border-stone-200 text-stone-800"
                : "bg-[#07101C]/90 border-[#E5B842]/20 text-stone-300"
            }`}
          >
            {/* Far Left: Previous Button */}
            <button
              type="button"
              onClick={() => handleSelectVerse(activeVerseIndex - 1)}
              disabled={activeVerseIndex <= 0}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[32px] font-bold border transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs tracking-normal no-underline ${
                isLight
                  ? "bg-white hover:bg-stone-50 text-stone-800 border-stone-200"
                  : "bg-[#0E1E33] hover:bg-[#142A47] text-[#F3CF65] border-[#E5B842]/25"
              }`}
              title="Previous Verse"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {/* Centered: Individual Verse Selectors */}
            <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto max-w-full px-2 py-0.5 custom-scroll">
              {verses.map((v, idx) => {
                const isSelected = activeVerseIndex === idx;
                return (
                  <button
                    key={`v-nav-${v.verse}-${idx}`}
                    type="button"
                    onClick={() => handleSelectVerse(idx)}
                    className={`px-3 py-1 rounded-[32px] font-bold transition cursor-pointer border tracking-normal no-underline shrink-0 ${
                      isSelected
                        ? isLight
                          ? "bg-[#E5B842] text-[#06162c] border-amber-400 font-black shadow-xs"
                          : "bg-[#E5B842] text-[#06162c] border-[#F3CF65] font-black shadow-xs"
                        : isLight
                        ? "bg-white text-stone-600 hover:text-stone-900 border-stone-200 hover:bg-stone-50"
                        : "bg-[#0A1626] text-stone-400 hover:text-white border-[#E5B842]/20 hover:bg-[#0F223D]"
                    }`}
                    title={`Jump to Verse ${v.verse}`}
                  >
                    v.{v.verse}
                  </button>
                );
              })}
            </div>

            {/* Far Right: Next Button */}
            <button
              type="button"
              onClick={() => handleSelectVerse(activeVerseIndex + 1)}
              disabled={activeVerseIndex >= verses.length - 1}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[32px] font-bold border transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs tracking-normal no-underline ${
                isLight
                  ? "bg-white hover:bg-stone-50 text-stone-800 border-stone-200"
                  : "bg-[#0E1E33] hover:bg-[#142A47] text-[#F3CF65] border-[#E5B842]/25"
              }`}
              title="Next Verse"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* FEEDBACK BANNER (When added to recall schedule) */}
        {memorySuccessMsg && (
          <div
            className={`px-6 py-2 border-b flex items-center justify-center gap-2 text-xs font-mono font-bold animate-in fade-in slide-in-from-top-1 ${
              isLight
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
            }`}
          >
            <Check size={14} className="text-emerald-500" />
            <span className="tracking-normal no-underline">{memorySuccessMsg}</span>
          </div>
        )}

        {/* MODAL BODY: Complete Scripture Text Sequentially Displayed and Scrollable */}
        <div
          ref={scrollContainerRef}
          className="p-5 sm:p-6 min-h-[170px] max-h-[58vh] overflow-y-auto custom-scroll space-y-4"
        >
          {loading ? (
            <div
              className={`flex flex-col items-center justify-center py-12 space-y-3 ${
                isLight ? "text-stone-500" : "text-stone-400"
              }`}
            >
              <Loader2 size={30} className="animate-spin text-amber-500" />
              <p className="text-xs font-mono tracking-normal no-underline">
                Fetching {version} translation for {displayReference}...
              </p>
            </div>
          ) : error ? (
            <div
              className={`p-5 rounded-[32px] text-xs text-center border ${
                isLight
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-red-950/40 border-red-800/50 text-red-300"
              }`}
            >
              <p className="font-semibold tracking-normal no-underline">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sequential Display of All Verses in Passage */}
              {verses.map((v, index) => {
                const isHighlighted = hasMultipleVerses && activeVerseIndex === index;
                return (
                  <div
                    key={`verse-item-${v.verse}-${index}`}
                    id={`verse-card-${index}`}
                    onClick={() => setActiveVerseIndex(index)}
                    className={`relative p-5 sm:p-6 rounded-[32px] border transition-all duration-200 cursor-pointer ${
                      isHighlighted
                        ? isLight
                          ? "bg-amber-50/80 border-amber-400/90 shadow-md ring-2 ring-amber-400/25 text-stone-950"
                          : "bg-[#0F243E] border-[#E5B842]/60 shadow-lg ring-2 ring-[#E5B842]/30 text-white"
                        : isLight
                        ? "bg-white hover:bg-stone-50/80 border-stone-200 shadow-2xs text-stone-900"
                        : "bg-[#081220] hover:bg-[#0B1728] border-[#E5B842]/20 text-stone-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center px-3.5 py-1 rounded-[32px] text-xs font-mono font-bold tracking-normal no-underline border ${
                          isHighlighted
                            ? isLight
                              ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                              : "bg-[#E5B842] text-[#06162c] border-[#F3CF65] shadow-xs"
                            : isLight
                            ? "bg-stone-100 text-stone-700 border-stone-200"
                            : "bg-[#0E1E33] text-stone-300 border-[#E5B842]/25"
                        }`}
                      >
                        Verse {v.verse}
                      </span>

                      {hasMultipleVerses && (
                        <span
                          className={`text-[10px] font-mono tracking-normal no-underline ${
                            isLight ? "text-stone-400" : "text-stone-500"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    <p className="text-base sm:text-lg font-serif not-italic font-normal leading-relaxed select-text tracking-normal no-underline">
                      "{v.text}"
                    </p>
                  </div>
                );
              })}

              {/* Translation Badge */}
              <div
                className={`p-4 rounded-[32px] border flex items-center justify-between text-xs font-mono select-none ${
                  isLight
                    ? "bg-[#FAF6EF]/90 border-stone-200/90 text-stone-600"
                    : "bg-[#070D18]/90 border-[#E5B842]/20 text-stone-400"
                }`}
              >
                <span
                  className={`flex items-center gap-1.5 font-bold tracking-normal no-underline ${
                    isLight ? "text-amber-800" : "text-[#F3CF65]"
                  }`}
                >
                  <Sparkles size={14} />
                  <span>{version} Translation</span>
                </span>
                <span className="tracking-normal no-underline text-[11px] opacity-80">
                  {verses.length > 1 ? `${verses.length} Verses Formatted` : "Adventech Scripture Engine"}
                </span>
              </div>

              {/* IN-MODAL DEEP STUDY DRAWER (Strictly isolated within Scripture Reference Explorer) */}
              {isDeepStudyOpen && (
                <div
                  id="in-modal-deeper-study"
                  className={`p-5 sm:p-6 rounded-[32px] border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isLight
                      ? "bg-amber-50/70 border-amber-300 text-stone-900"
                      : "bg-[#0A1628] border-[#E5B842]/40 text-stone-100"
                  }`}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-200/60 dark:border-[#E5B842]/20">
                    <Compass size={18} className={isLight ? "text-amber-700" : "text-[#F3CF65]"} />
                    <h4 className="text-sm font-bold font-serif tracking-normal no-underline">
                      Deep Exegetical Insights & Theological Harmony
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed font-sans">
                    <div>
                      <p className="font-bold text-[11px] font-mono uppercase tracking-normal no-underline text-amber-900 dark:text-[#F3CF65]">
                        Canonical & Historical Setting:
                      </p>
                      <p className="mt-1 opacity-90">
                        {displayReference} presents foundational divine truth delivered to ground believers under persecution and spiritual trial. The passage emphasizes God's sovereign authority, prophetic reliability, and covenant fidelity.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-[11px] font-mono uppercase tracking-normal no-underline text-amber-900 dark:text-[#F3CF65]">
                        SDA Doctrinal Alignment:
                      </p>
                      <p className="mt-1 opacity-90">
                        In Seventh-day Adventist hermeneutics, Scripture interprets Scripture. This text harmonizes with the Sanctuary truth (Christ's high-priestly mediation), the perpetuity of God's moral law, and the Three Angels' Messages of Revelation 14:6-12.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-[11px] font-mono uppercase tracking-normal no-underline text-amber-900 dark:text-[#F3CF65]">
                        Cross-References for Meditation:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {["Revelation 14:12", "Exodus 20:8-11", "2 Timothy 2:15", "Daniel 8:14"].map((cr) => (
                          <span
                            key={cr}
                            className={`px-2.5 py-0.5 rounded-[32px] font-mono text-[10px] font-bold border tracking-normal no-underline ${
                              isLight
                                ? "bg-white text-stone-700 border-amber-300"
                                : "bg-[#0D2036] text-[#F3CF65] border-[#E5B842]/30"
                            }`}
                          >
                            {cr}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/50 dark:border-[#E5B842]/15 flex items-center justify-between text-[11px] font-mono opacity-80">
                      <span>Reflective Personal Application</span>
                      <span className="font-semibold text-amber-700 dark:text-[#F3CF65]">
                        Isolated In-Modal Study
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER:
            - 'Study Deeper' button (strictly isolates verse display within module)
            - 'Memory' button with Drop-down ("Memorize Verse" / "Memorize All")
            - 'Done' button (dismisses cleanly)
        */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between gap-2 ${
            isLight
              ? "bg-[#FAF6EF]/95 border-stone-200/90"
              : "bg-[#060D17]/95 border-[#E5B842]/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {/* 'Study Deeper' Button: Strictly isolated within module */}
            <button
              type="button"
              onClick={handleToggleStudyDeeper}
              disabled={loading || !passage?.text}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-[32px] text-xs font-bold border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95 tracking-normal no-underline ${
                isDeepStudyOpen
                  ? isLight
                    ? "bg-amber-100 border-amber-400 text-amber-950 font-black"
                    : "bg-[#1E3A5F] border-[#E5B842]/60 text-[#F3CF65] font-black"
                  : isLight
                  ? "bg-white hover:bg-stone-50 border-stone-300 text-stone-800 hover:border-amber-500 hover:text-amber-900"
                  : "bg-[#0E2036] hover:bg-[#142A46] border-[#E5B842]/30 text-stone-200 hover:text-[#F3CF65] hover:border-[#E5B842]/60"
              }`}
              title="Explore deeper doctrinal insights inside this reference"
            >
              <BookOpen size={15} className={isLight ? "text-amber-700" : "text-[#F3CF65]"} />
              <span className="tracking-normal no-underline">
                {isDeepStudyOpen ? "Hide Study" : "Study Deeper"}
              </span>
            </button>

            {/* 'Memory' Button with Drop-down Menu */}
            <div className="relative" ref={memoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsMemoryDropdownOpen(!isMemoryDropdownOpen)}
                disabled={loading || !passage?.text}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-[32px] text-xs font-bold border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95 tracking-normal no-underline ${
                  isMemoryDropdownOpen
                    ? isLight
                      ? "bg-amber-500 text-white border-amber-600 font-black"
                      : "bg-[#E5B842] text-[#06162c] border-[#F3CF65] font-black"
                    : isLight
                    ? "bg-white hover:bg-stone-50 border-stone-300 text-stone-800 hover:border-amber-500 hover:text-amber-900"
                    : "bg-[#0E2036] hover:bg-[#142A46] border-[#E5B842]/30 text-stone-200 hover:text-[#F3CF65] hover:border-[#E5B842]/60"
                }`}
                title="Add to Scripture Memory Recall Schedule"
                aria-haspopup="true"
                aria-expanded={isMemoryDropdownOpen}
              >
                <BookmarkCheck size={15} className={isMemoryDropdownOpen ? (isLight ? "text-white" : "text-[#06162c]") : (isLight ? "text-amber-700" : "text-[#F3CF65]")} />
                <span className="tracking-normal no-underline">Memory</span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${isMemoryDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Memory Drop-down Menu */}
              {isMemoryDropdownOpen && (
                <div
                  className={`absolute bottom-full mb-2 left-0 w-44 rounded-[28px] shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 select-none ${
                    isLight
                      ? "bg-white border-stone-200 text-stone-900 ring-1 ring-black/5"
                      : "bg-[#0B1728] border-[#E5B842]/40 text-stone-100 ring-1 ring-black/60"
                  }`}
                  role="menu"
                >
                  <div className="p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={handleMemorizeVerse}
                      className={`w-full text-left px-3.5 py-2 rounded-[22px] text-xs font-bold tracking-normal no-underline transition cursor-pointer flex items-center justify-between ${
                        isLight
                          ? "hover:bg-amber-50 hover:text-amber-900 text-stone-800"
                          : "hover:bg-[#142A47] hover:text-[#F3CF65] text-stone-200"
                      }`}
                      role="menuitem"
                    >
                      <span>Memorize Verse</span>
                      {hasMultipleVerses && (
                        <span className="text-[10px] font-mono opacity-70">
                          v.{verses[activeVerseIndex]?.verse}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleMemorizeAll}
                      className={`w-full text-left px-3.5 py-2 rounded-[22px] text-xs font-bold tracking-normal no-underline transition cursor-pointer flex items-center justify-between ${
                        isLight
                          ? "hover:bg-amber-50 hover:text-amber-900 text-stone-800"
                          : "hover:bg-[#142A47] hover:text-[#F3CF65] text-stone-200"
                      }`}
                      role="menuitem"
                    >
                      <span>Memorize All</span>
                      {hasMultipleVerses && (
                        <span className="text-[10px] font-mono opacity-70">
                          {verses.length} vv.
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2.5 text-xs font-bold rounded-[32px] transition cursor-pointer border shadow-xs active:scale-95 tracking-normal no-underline ${
              isLight
                ? "bg-stone-900 hover:bg-stone-800 text-white border-stone-700"
                : "bg-[#132742] hover:bg-[#1A3356] text-white border-[#E5B842]/30 hover:border-[#E5B842]/60"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseModal;
