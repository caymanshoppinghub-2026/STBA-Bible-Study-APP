import React, { useState, useEffect } from "react";
import { X, BookOpen, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type TranslationVersion = "KJV" | "NKJV" | "ESV" | "NASB";

export interface VerseModalProps {
  isOpen: boolean;
  reference: string | null;
  initialVersion?: TranslationVersion;
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
  onClose,
  onStudyDeeper,
}) => {
  const navigate = useNavigate();
  const [version, setVersion] = useState<TranslationVersion>(initialVersion);
  const [verseText, setVerseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache previously fetched translations for instant tab switching
  const [cache, setCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialVersion) {
      setVersion(initialVersion);
    }
  }, [initialVersion, reference]);

  useEffect(() => {
    if (!isOpen || !reference || typeof reference !== "string" || !reference.trim()) {
      setVerseText("");
      setError(null);
      setLoading(false);
      return;
    }

    let cleanRef = reference.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
    let queryVersion = version;

    // Check if the reference includes an embedded translation suffix e.g. "1 Corinthians 12:4-6, NKJV"
    const verMatch = cleanRef.match(/,\s*(KJV|NKJV|ESV|NASB)\b/i) || cleanRef.match(/\((KJV|NKJV|ESV|NASB)\)/i);
    if (verMatch && verMatch[1]) {
      queryVersion = verMatch[1].toUpperCase() as TranslationVersion;
      cleanRef = cleanRef.replace(verMatch[0], "").trim();
    }

    const cacheKey = `${cleanRef}__${queryVersion}`;
    if (cache[cacheKey]) {
      setVerseText(cache[cacheKey]);
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
          const textResult = data.text || "Verse text not available.";
          setVerseText(textResult);
          setCache((prev) => ({ ...prev, [cacheKey]: textResult }));
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Could not retrieve scripture text. Please check connection.");
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

  const handleStudyDeeper = () => {
    if (!reference) return;

    const targetRef = reference.trim();

    // Persist pending search reference and tool for Bible Study app module
    localStorage.setItem("stba_pending_search_ref", targetRef);
    localStorage.setItem("stba_pending_search_tool", "visual");
    localStorage.removeItem("stba_pending_search_topic");

    if (onStudyDeeper) {
      onStudyDeeper(targetRef, version);
    } else {
      navigate(`/stba?ref=${encodeURIComponent(targetRef)}&tool=visual`);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent pointer-events-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-lg bg-[#161B22] border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden transform transition-all text-neutral-100 ring-1 ring-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0D1117]/90 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-400 font-serif tracking-tight">
                {reference}
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
                Scripture Reference Explorer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close scripture modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Translation Selector Tabs */}
        <div className="px-6 pt-4 pb-2 bg-[#12161D] border-b border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 w-full">
            {TRANSLATIONS.map((trans) => {
              const isActive = version === trans.id;
              return (
                <button
                  key={trans.id}
                  onClick={() => setVersion(trans.id)}
                  title={trans.description}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? "bg-[#F59E0B] text-stone-950 border-amber-400 shadow-sm"
                      : "bg-neutral-850 text-neutral-300 border-neutral-750 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {trans.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Verse Content */}
        <div className="p-6 min-h-[160px] max-h-[60vh] overflow-y-auto custom-scroll flex flex-col justify-between space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-neutral-400">
              <Loader2 size={28} className="animate-spin text-amber-500" />
              <p className="text-xs font-mono text-neutral-400">Loading {version} translation...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl text-red-300 text-xs text-center">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative p-5 sm:p-6 bg-[#0D1117] border border-neutral-800 rounded-xl">
                <p className="text-sm sm:text-base font-serif not-italic font-normal leading-relaxed text-neutral-100 select-text">
                  "{verseText}"
                </p>
                <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Sparkles size={13} />
                    <span>{version} Translation</span>
                  </span>
                  <span>Adventech Scripture Engine</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0D1117]/90 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={handleStudyDeeper}
            disabled={loading || !verseText}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition bg-neutral-850 hover:bg-neutral-800 border-neutral-750 text-neutral-200 hover:text-white hover:border-amber-500/50 hover:text-amber-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span>Study Deeper</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-700 hover:bg-neutral-650 text-white text-xs font-bold rounded-xl transition cursor-pointer border border-neutral-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
