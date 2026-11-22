import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { parseScriptureLookup, getChapterPericope } from "./bibleMetadata";
import { getParallelVerses } from "./bibleData";
import { apiFetch, safeParseResponseJson } from "../../lib/apiFetch";

interface ScriptureLinkedTextProps {
  text: string;
  onNavigateRef: (reference: string) => void;
  className?: string;
  style?: React.CSSProperties;
  theme?: "light" | "dark";
}

export interface QuickVerseLookupData {
  canonicalReference: string;
  book: string;
  chapter: number;
  pericope: string;
  verses: Array<{ verseNumber: number; text: string }>;
  combinedText: string;
}

const clientVerseLookupCache = new Map<string, QuickVerseLookupData>();

/**
 * Resolves KJV verse text + Logos pericope title for any Scripture reference across Genesis to Revelation.
 * Checks client cache first, then local preset bibleData, then /api/study/quick-verse (1ms from kjv_full.json.gz).
 */
export async function resolveQuickVerseLookup(rawReference: string): Promise<QuickVerseLookupData | null> {
  if (!rawReference || !rawReference.trim()) return null;
  const parsed = parseScriptureLookup(rawReference.trim());
  const canonicalKey = (parsed?.canonicalRef || rawReference.trim()).toLowerCase();

  if (clientVerseLookupCache.has(canonicalKey)) {
    return clientVerseLookupCache.get(canonicalKey)!;
  }

  const book = parsed?.book || rawReference.split(/\s+\d/)[0] || "Revelation";
  const chapter = parsed?.chapter || 1;
  const pericope = getChapterPericope(book, chapter);

  // 1. Try local preset verses synchronously first if exact match
  if (parsed) {
    try {
      const localVerses = getParallelVerses(parsed.canonicalRef);
      if (localVerses && localVerses.length > 0) {
        const startV = parsed.startVerse || 1;
        const endV = parsed.endVerse || (parsed.startVerse ? parsed.startVerse : 10);
        const filtered = localVerses.filter((v) => v.verseNumber >= startV && v.verseNumber <= endV);
        if (filtered.length > 0 && filtered[0].reference?.toLowerCase().startsWith(parsed.book.toLowerCase())) {
          const verses = filtered.map((v) => ({
            verseNumber: v.verseNumber,
            text: v.text.KJV || v.text.NKJV || "",
          }));
          const combinedText =
            verses.length === 1
              ? verses[0].text
              : verses.map((v) => `[v.${v.verseNumber}] ${v.text}`).join(" ");
          const data: QuickVerseLookupData = {
            canonicalReference: parsed.canonicalRef,
            book: parsed.book,
            chapter: parsed.chapter,
            pericope,
            verses,
            combinedText,
          };
          clientVerseLookupCache.set(canonicalKey, data);
          clientVerseLookupCache.set(rawReference.trim().toLowerCase(), data);
          return data;
        }
      }
    } catch {}
  }

  // 2. Fetch from /api/study/quick-verse (1ms server lookup in kjv_full.json.gz)
  try {
    const res = await apiFetch("/api/study/quick-verse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: parsed?.canonicalRef || rawReference.trim() }),
    });
    if (res.ok) {
      const json = await safeParseResponseJson<any>(res);
      if (json?.valid && json?.single) {
        const s = json.single;
        const data: QuickVerseLookupData = {
          canonicalReference: s.canonicalReference || parsed?.canonicalRef || rawReference.trim(),
          book: s.book || book,
          chapter: s.chapter || chapter,
          pericope: getChapterPericope(s.book || book, s.chapter || chapter),
          verses: Array.isArray(s.verses) ? s.verses : [],
          combinedText: s.combinedText || "",
        };
        clientVerseLookupCache.set(canonicalKey, data);
        clientVerseLookupCache.set(rawReference.trim().toLowerCase(), data);
        return data;
      }
    }
  } catch {}

  return null;
}

/**
 * Batch resolves multiple Scripture references in a single 1ms round-trip for Logos Power Lookup.
 */
export async function resolveBatchQuickVerseLookups(
  references: string[]
): Promise<Record<string, QuickVerseLookupData>> {
  const out: Record<string, QuickVerseLookupData> = {};
  const missing: string[] = [];

  for (const rawRef of references) {
    if (!rawRef || !rawRef.trim()) continue;
    const parsed = parseScriptureLookup(rawRef.trim());
    const key = (parsed?.canonicalRef || rawRef.trim()).toLowerCase();
    if (clientVerseLookupCache.has(key)) {
      out[rawRef] = clientVerseLookupCache.get(key)!;
    } else {
      missing.push(rawRef.trim());
    }
  }

  if (missing.length > 0) {
    try {
      const res = await apiFetch("/api/study/quick-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ references: missing }),
      });
      if (res.ok) {
        const json = await safeParseResponseJson<any>(res);
        if (json?.valid && json?.results) {
          for (const rawRef of missing) {
            const parsed = parseScriptureLookup(rawRef);
            const item = json.results[rawRef] || (parsed ? json.results[parsed.canonicalRef] : null);
            if (item) {
              const data: QuickVerseLookupData = {
                canonicalReference: item.canonicalReference || parsed?.canonicalRef || rawRef,
                book: item.book || parsed?.book || "Revelation",
                chapter: item.chapter || parsed?.chapter || 1,
                pericope: getChapterPericope(
                  item.book || parsed?.book || "Revelation",
                  item.chapter || parsed?.chapter || 1
                ),
                verses: Array.isArray(item.verses) ? item.verses : [],
                combinedText: item.combinedText || "",
              };
              const cacheKey = (parsed?.canonicalRef || rawRef).toLowerCase();
              clientVerseLookupCache.set(cacheKey, data);
              clientVerseLookupCache.set(rawRef.toLowerCase(), data);
              out[rawRef] = data;
            }
          }
        }
      }
    } catch {}
  }

  return out;
}

interface LogosScriptureHoverTriggerProps {
  reference: string;
  onNavigateRef?: (reference: string) => void;
  children?: React.ReactNode;
  className?: string;
  asBlock?: boolean;
}

/**
 * Logos-style hover preview wrapper strictly scoped to the STBA Study Workspace.
 * Hovering over a Scripture reference displays a floating card with the canonical reference,
 * chapter pericope heading, and full verbatim KJV verse text.
 */
export const LogosScriptureHoverTrigger: React.FC<LogosScriptureHoverTriggerProps> = ({
  reference,
  onNavigateRef,
  children,
  className = "",
  asBlock = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; showAbove: boolean }>({
    top: 0,
    left: 0,
    showAbove: true,
  });
  const [lookupData, setLookupData] = useState<QuickVerseLookupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const parsed = useMemo(() => parseScriptureLookup(reference), [reference]);
  const fallbackPericope = useMemo(
    () => (parsed ? getChapterPericope(parsed.book, parsed.chapter) : ""),
    [parsed]
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    triggerRef.current = el;
    const rect = el.getBoundingClientRect();
    const showAbove = rect.top > 210;
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - 170), window.innerWidth - 356);
    const top = showAbove ? rect.top - 10 : rect.bottom + 10;
    setCoords({ top, left, showAbove });

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 110);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    if (!isHovered) return;
    let cancelled = false;
    const key = (parsed?.canonicalRef || reference.trim()).toLowerCase();
    if (clientVerseLookupCache.has(key)) {
      setLookupData(clientVerseLookupCache.get(key)!);
      return;
    }
    setIsLoading(true);
    resolveQuickVerseLookup(reference).then((res) => {
      if (!cancelled) {
        setLookupData(res);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isHovered, reference, parsed]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const tooltipPortal =
    isHovered && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: coords.showAbove ? "translateY(-100%)" : "translateY(0)",
              zIndex: 99999,
            }}
            className="w-[340px] max-w-[92vw] pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="rounded-xl border border-[#C9973A]/60 bg-[#0F1522]/98 text-[#F3EFEA] shadow-2xl shadow-black/70 backdrop-blur-md overflow-hidden">
              {/* Top Logos Pericope & Canonical Header */}
              <div className="px-3.5 py-2 bg-gradient-to-r from-[#1A2438] via-[#151E30] to-[#1A2438] border-b border-[#C9973A]/35 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen className="w-3.5 h-3.5 text-[#C9973A] shrink-0" />
                  <span className="font-serif font-bold text-xs text-[#F3CF65] truncate">
                    {lookupData?.canonicalReference || parsed?.canonicalRef || reference}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#C9973A]/20 text-[#F3CF65] border border-[#C9973A]/40 shrink-0">
                  KJV • Logos Preview
                </span>
              </div>

              {/* Pericope Subtitle */}
              {(lookupData?.pericope || fallbackPericope) && (
                <div className="px-3.5 py-1.5 bg-[#131B2B] border-b border-stone-800/80 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C9973A] shrink-0" />
                  <span className="text-[10.5px] font-sans font-semibold text-amber-200/90 truncate">
                    {lookupData?.pericope || fallbackPericope}
                  </span>
                </div>
              )}

              {/* Verbatim Scripture Body */}
              <div className="px-3.5 py-2.5 max-h-[210px] overflow-y-auto space-y-1.5">
                {isLoading && !lookupData ? (
                  <p className="text-xs font-serif italic text-stone-400">Loading KJV Scripture text...</p>
                ) : lookupData && lookupData.verses.length > 0 ? (
                  lookupData.verses.slice(0, 6).map((v) => (
                    <p key={v.verseNumber} className="text-xs font-serif leading-relaxed text-stone-100">
                      <span className="font-mono text-[10px] font-bold text-[#C9973A] mr-1.5">
                        {v.verseNumber}
                      </span>
                      <span>{v.text}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-xs font-serif italic text-stone-300">
                    Click to open {parsed?.canonicalRef || reference} in the Parallel Bible Reader.
                  </p>
                )}
                {lookupData && lookupData.verses.length > 6 && (
                  <p className="text-[10px] font-mono text-amber-400/80 pt-0.5">
                    + {lookupData.verses.length - 6} more verses in range — click to view full passage
                  </p>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-3.5 py-1.5 bg-[#0B0F19] border-t border-stone-800/80 flex items-center justify-between text-[9.5px] font-mono text-stone-400">
                <span>STBA Quick Verse Lookup</span>
                <span className="text-[#C9973A] font-semibold">Click to open in Reader &rarr;</span>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  if (children) {
    const WrapperTag = asBlock ? "div" : "span";
    return (
      <>
        <WrapperTag
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={className}
        >
          {children}
        </WrapperTag>
        {tooltipPortal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNavigateRef?.(reference);
        }}
        className={
          className ||
          "inline-flex items-center gap-0.5 text-[#C9973A] hover:text-amber-400 font-semibold underline underline-offset-2 decoration-[#C9973A]/40 hover:decoration-[#C9973A] transition-all cursor-pointer rounded px-0.5 hover:bg-[#C9973A]/15 align-baseline select-text"
        }
      >
        <BookOpen className="w-3 h-3 inline-block shrink-0 opacity-75 mr-0.5" />
        <span>{reference}</span>
      </button>
      {tooltipPortal}
    </>
  );
};

/**
 * Robust regex matching canonical Scripture references and standard abbreviations
 */
export const SCRIPTURE_REF_REGEX = /\b(?:[1-3]\s+)?(?:Genesis|Gen|Exodus|Exod|Ex|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Dt|Joshua|Josh|Judges|Judg|Ruth|1\s+Samuel|2\s+Samuel|1\s+Sam|2\s+Sam|1\s+Kings|2\s+Kings|1\s+Chronicles|2\s+Chronicles|1\s+Chr|2\s+Chr|Ezra|Nehemiah|Neh|Esther|Esth|Job|Psalms|Psalm|Ps|Psa|Proverbs|Prov|Pr|Ecclesiastes|Eccl|Song\s+of\s+Solomon|Song|Isaiah|Isa|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Eze|Daniel|Dan|Hosea|Hos|Joel|Amos|Obadiah|Obad|Jonah|Micah|Mic|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|Matthew|Matt|Mt|Mark|Mk|Luke|Lk|John|Jn|Acts|Romans|Rom|1\s+Corinthians|2\s+Corinthians|1\s+Cor|2\s+Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|1\s+Thessalonians|2\s+Thessalonians|1\s+Thess|2\s+Thess|1\s+Timothy|2\s+Timothy|1\s+Tim|2\s+Tim|Titus|Tit|Philemon|Philem|Hebrews|Heb|James|Jas|1\s+Peter|2\s+Peter|1\s+Pet|2\s+Pet|1\s+John|2\s+John|3\s+John|Jude|Revelation|Rev)\.?\s+\d+(?::\d+(?:[-–—]\d+)?)?(?:,\s*\d+(?::\d+(?:[-–—]\d+)?)?)*/gi;

/**
 * Component that parses arbitrary text and turns every embedded scripture citation
 * into an interactive, clickable hyperlink with a Logos-style hover verse preview card.
 */
export const ScriptureLinkedText: React.FC<ScriptureLinkedTextProps> = ({
  text,
  onNavigateRef,
  className = "",
  style,
}) => {
  const segments = useMemo(() => {
    if (!text || typeof text !== "string") return [];
    const parts: Array<{ type: "text" | "ref"; content: string }> = [];
    const regex = new RegExp(SCRIPTURE_REF_REGEX.source, "gi");
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: "ref", content: match[0] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }
    return parts;
  }, [text]);

  if (!text) return null;

  return (
    <span className={className} style={style}>
      {segments.map((seg, idx) => {
        if (seg.type === "ref") {
          return (
            <LogosScriptureHoverTrigger
              key={idx}
              reference={seg.content}
              onNavigateRef={onNavigateRef}
            />
          );
        }
        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};
