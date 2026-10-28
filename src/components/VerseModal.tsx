/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { X, BookOpen, Loader2, Sparkles, ChevronLeft, ChevronRight, Layers, Eye, Copy, Check } from "lucide-react";
import { useSabbathSchoolStore } from "../store/useSabbathSchoolStore";
import { useTheme } from "../context/ThemeContext";
import { formatStandardReference } from "../utils/sabbathUtils";
import { 
  VerseItem, 
  ScripturePassage, 
  parseVersesFromRawText, 
  normalizeScriptureReference 
} from "../services/bibleService";

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
  const [copied, setCopied] = useState<boolean>(false);

  // Sequential verse navigation state for passages with multiple verses
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Cache previously fetched translations for instant tab switching
  const [cache, setCache] = useState<Record<string, ScripturePassage>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (normalizedInfo.detectedVersion) {
      setVersion(normalizedInfo.detectedVersion as TranslationVersion);
    } else if (initialVersion) {
      setVersion(initialVersion);
    }
    setActiveVerseIndex(0);
    setIsFocusMode(false);
    setCopied(false);
  }, [initialVersion, reference]);

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

  // Scroll smoothly to target verse when clicked or stepped sequentially
  const handleSelectVerse = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, verses.length - 1));
    setActiveVerseIndex(validIndex);
    if (!isFocusMode) {
      setTimeout(() => {
        const targetElement = document.getElementById(`verse-card-${validIndex}`);
        if (targetElement && scrollContainerRef.current) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 50);
    }
  };

  // In-modal isolated scripture copy functionality: never modifies workspace or search fields
  const handleCopyScripture = async () => {
    if (!passage || !passage.text) return;
    try {
      let copyText = "";
      if (passage.verses && passage.verses.length > 0) {
        copyText = `${passage.reference} (${passage.version || version})\n` +
          passage.verses.map((v) => `${v.verse}. ${v.text}`).join("\n");
      } else {
        copyText = `${passage.reference} (${passage.version || version})\n${passage.text}`;
      }
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Non-fatal clipboard fallback
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto transition-opacity duration-300 ease-out animate-in fade-in backdrop-blur-none ${
        isLight ? "bg-black/35" : "bg-black/65"
      }`}
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

        {/* SEQUENTIAL VERSE NAVIGATION BAR (Rendered when multiple verses are referenced) */}
        {hasMultipleVerses && !loading && !error && (
          <div
            className={`px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none ${
              isLight
                ? "bg-[#F4EEE2]/80 border-stone-200 text-stone-800"
                : "bg-[#07101C]/90 border-[#E5B842]/20 text-stone-300"
            }`}
          >
            {/* Sequential Stepping: Previous / Next Verse */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectVerse(activeVerseIndex - 1)}
                disabled={activeVerseIndex <= 0}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[32px] font-bold border transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs tracking-normal no-underline ${
                  isLight
                    ? "bg-white hover:bg-stone-50 text-stone-800 border-stone-200"
                    : "bg-[#0E1E33] hover:bg-[#142A47] text-[#F3CF65] border-[#E5B842]/25"
                }`}
                title="Previous Verse"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span
                className={`px-3 py-1.5 rounded-[32px] font-bold border tracking-normal no-underline ${
                  isLight
                    ? "bg-amber-100/90 text-amber-950 border-amber-300/80"
                    : "bg-[#0F223D] text-[#F3CF65] border-[#E5B842]/35"
                }`}
              >
                Verse {activeVerseIndex + 1} of {verses.length}
              </span>

              <button
                type="button"
                onClick={() => handleSelectVerse(activeVerseIndex + 1)}
                disabled={activeVerseIndex >= verses.length - 1}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[32px] font-bold border transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs tracking-normal no-underline ${
                  isLight
                    ? "bg-white hover:bg-stone-50 text-stone-800 border-stone-200"
                    : "bg-[#0E1E33] hover:bg-[#142A47] text-[#F3CF65] border-[#E5B842]/25"
                }`}
                title="Next Verse"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Quick Verse Navigation & Display Mode Toggle */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[32px] border transition cursor-pointer tracking-normal no-underline ${
                  isFocusMode
                    ? isLight
                      ? "bg-amber-600 text-white border-amber-600 font-bold"
                      : "bg-[#E5B842] text-[#06162c] border-[#F3CF65] font-black"
                    : isLight
                    ? "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
                    : "bg-[#0E1E33] hover:bg-[#142A47] text-stone-300 border-[#E5B842]/25"
                }`}
                title={isFocusMode ? "Switch to All Verses view" : "Switch to Single Verse Focus view"}
              >
                {isFocusMode ? <Layers size={12} /> : <Eye size={12} />}
                <span>{isFocusMode ? "Focus" : "All"}</span>
              </button>

              {/* Individual verse pills */}
              {verses.map((v, idx) => {
                const isSelected = activeVerseIndex === idx;
                return (
                  <button
                    key={`v-nav-${v.verse}-${idx}`}
                    type="button"
                    onClick={() => handleSelectVerse(idx)}
                    className={`px-2.5 py-1.5 rounded-[32px] font-bold transition cursor-pointer border tracking-normal no-underline ${
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
              {/* Sequential Display of Individual Verses */}
              {isFocusMode && hasMultipleVerses ? (
                // Single Verse Focus Mode
                <div
                  id={`verse-card-${activeVerseIndex}`}
                  className={`relative p-5 sm:p-6 rounded-[32px] border transition-all duration-200 ${
                    isLight
                      ? "bg-white border-amber-300 shadow-md ring-2 ring-amber-400/20 text-stone-900"
                      : "bg-[#0F243E] border-[#E5B842]/60 shadow-lg ring-2 ring-[#E5B842]/30 text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-3.5 py-1 rounded-[32px] text-xs font-mono font-bold tracking-normal no-underline border ${
                        isLight
                          ? "bg-amber-100/90 text-amber-950 border-amber-300"
                          : "bg-[#E5B842] text-[#06162c] border-[#F3CF65]"
                      }`}
                    >
                      Verse {verses[activeVerseIndex]?.verse}
                    </span>
                    <span
                      className={`text-[11px] font-mono tracking-normal no-underline ${
                        isLight ? "text-stone-500" : "text-stone-400"
                      }`}
                    >
                      {activeVerseIndex + 1} of {verses.length}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-serif not-italic font-normal leading-relaxed select-text tracking-normal no-underline">
                    "{verses[activeVerseIndex]?.text}"
                  </p>
                </div>
              ) : (
                // Full Range Sequential Display (All Verses Scrollable Stream)
                verses.map((v, index) => {
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
                })
              )}

              {/* Translation Badge & Engine Attribution */}
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
            </div>
          )}
        </div>

        {/* MODAL FOOTER: Strictly isolated in-modal actions, never touching search fields */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isLight
              ? "bg-[#FAF6EF]/95 border-stone-200/90"
              : "bg-[#060D17]/95 border-[#E5B842]/20"
          }`}
        >
          <button
            type="button"
            onClick={handleCopyScripture}
            disabled={loading || !passage?.text}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[32px] text-xs font-bold border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95 tracking-normal no-underline ${
              copied
                ? isLight
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-emerald-950/50 border-emerald-500/50 text-emerald-300"
                : isLight
                ? "bg-white hover:bg-stone-50 border-stone-300 text-stone-800 hover:border-amber-500 hover:text-amber-900"
                : "bg-[#0E2036] hover:bg-[#142A46] border-[#E5B842]/30 text-stone-200 hover:text-[#F3CF65] hover:border-[#E5B842]/60"
            }`}
            title="Copy scripture passage to clipboard"
          >
            {copied ? (
              <>
                <Check size={15} className="text-emerald-500" />
                <span className="tracking-normal no-underline">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={15} className={isLight ? "text-amber-700" : "text-[#F3CF65]"} />
                <span className="tracking-normal no-underline">Copy Scripture</span>
              </>
            )}
          </button>

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
