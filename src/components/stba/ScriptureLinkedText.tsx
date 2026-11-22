import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { parseScriptureLookup, getChapterPericope } from "./bibleMetadata";
import { FULL_CHAPTER_BIBLES } from "./bibleData";
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

  // 1. Try local FULL_CHAPTER_BIBLES synchronously first if exact chapter match
  if (parsed) {
    try {
      const chapterKey = `${parsed.book} ${parsed.chapter}`;
      const localChapter = FULL_CHAPTER_BIBLES[chapterKey];
      if (localChapter && localChapter.length > 0) {
        const startV = parsed.startVerse || 1;
        const endV = parsed.endVerse || (parsed.startVerse ? parsed.startVerse : 10);
        const filtered = localChapter.filter((v) => v.verseNumber >= startV && v.verseNumber <= endV);
        if (filtered.length > 0) {
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

  // 3. Fallback to /api/study/fetch-passage if /api/study/quick-verse is not yet registered on hot-reload server
  try {
    const res = await apiFetch("/api/study/fetch-passage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: parsed?.canonicalRef || rawReference.trim() }),
    });
    if (res.ok) {
      const json = await safeParseResponseJson<any>(res);
      if (json?.valid && Array.isArray(json.verses) && json.verses.length > 0) {
        const verses = json.verses.map((v: any) => ({
          verseNumber: v.verseNumber || 1,
          text: v.text?.KJV || v.text?.NKJV || "",
        }));
        const combinedText =
          verses.length === 1
            ? verses[0].text
            : verses.map((v: any) => `[v.${v.verseNumber}] ${v.text}`).join(" ");
        const data: QuickVerseLookupData = {
          canonicalReference: json.canonicalReference || parsed?.canonicalRef || rawReference.trim(),
          book,
          chapter,
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

  // 4. Direct public KJV lookup via bible-api.com if local dev backend hasn't reloaded yet
  try {
    const queryRef = parsed?.canonicalRef || rawReference.trim();
    const apiRes = await fetch(`https://bible-api.com/${encodeURIComponent(queryRef)}?translation=kjv`, {
      signal: AbortSignal.timeout(4500),
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && Array.isArray(data.verses) && data.verses.length > 0) {
        const verses = data.verses.map((v: any) => ({
          verseNumber: v.verse || 1,
          text: String(v.text || "").replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
        }));
        const combinedText =
          verses.length === 1
            ? verses[0].text
            : verses.map((v: any) => `[v.${v.verseNumber}] ${v.text}`).join(" ");
        const result: QuickVerseLookupData = {
          canonicalReference: data.reference || queryRef,
          book,
          chapter,
          pericope,
          verses,
          combinedText,
        };
        clientVerseLookupCache.set(canonicalKey, result);
        clientVerseLookupCache.set(rawReference.trim().toLowerCase(), result);
        return result;
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

    // Resolve any remaining missing references individually via fallback chain
    const stillMissing = missing.filter((r) => !out[r]);
    if (stillMissing.length > 0) {
      await Promise.all(
        stillMissing.map(async (rawRef) => {
          const single = await resolveQuickVerseLookup(rawRef);
          if (single) {
            out[rawRef] = single;
          }
        })
      );
    }
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
 * Standalone floating frosted glassmorphic Scripture hover card portal.
 * Shared across STBA Study Workspace, Ask STBA AI, Dashboard Note Viewer, and Notebook Read Mode.
 */
export const LogosScriptureHoverCard: React.FC<{
  reference: string;
  anchorRect: { top: number; bottom: number; left: number; width: number };
}> = ({ reference, anchorRect }) => {
  const [lookupData, setLookupData] = useState<QuickVerseLookupData | null>(null);
  const parsed = useMemo(() => parseScriptureLookup(reference), [reference]);
  const fallbackPericope = useMemo(
    () => (parsed ? getChapterPericope(parsed.book, parsed.chapter) : ""),
    [parsed]
  );

  useEffect(() => {
    let cancelled = false;
    const key = (parsed?.canonicalRef || reference.trim()).toLowerCase();
    if (clientVerseLookupCache.has(key)) {
      setLookupData(clientVerseLookupCache.get(key)!);
      return;
    }
    resolveQuickVerseLookup(reference).then((res) => {
      if (!cancelled) {
        setLookupData(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reference, parsed]);

  if (typeof document === "undefined") return null;

  const showAbove = anchorRect.top > 210;
  const left = Math.min(Math.max(16, anchorRect.left + anchorRect.width / 2 - 170), window.innerWidth - 356);
  const top = showAbove ? anchorRect.top - 10 : anchorRect.bottom + 10;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top,
        left,
        transform: showAbove ? "translateY(-100%)" : "translateY(0)",
        zIndex: 99999,
      }}
      className="w-[340px] max-w-[92vw] pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="rounded-2xl bg-[#06162c]/70 backdrop-blur-xl text-[#EEF2FA] border border-[#E5B842]/45 shadow-[0_18px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.2)] px-4 py-3.5 font-sans not-italic">
        {(lookupData?.pericope || fallbackPericope) && (
          <div className="text-[13px] font-bold text-[#F3CF65] mb-1 leading-snug not-italic">
            {lookupData?.pericope || fallbackPericope}
          </div>
        )}

        <div className="max-h-[220px] overflow-y-auto space-y-1.5 text-[14px] leading-relaxed text-[#E6ECF8] not-italic font-normal">
          {lookupData && lookupData.verses.length > 0 ? (
            lookupData.verses.slice(0, 6).map((v) => (
              <p key={v.verseNumber} className="not-italic font-normal leading-relaxed">
                <sup className="text-[10.5px] font-bold text-[#F3CF65]/90 mr-1 select-none">
                  {v.verseNumber}
                </sup>
                <span>{v.text}</span>
              </p>
            ))
          ) : (
            <p className="text-[13px] text-[#C8D4EA] not-italic font-normal">
              {parsed?.canonicalRef || reference}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#0d3060] flex items-center justify-between text-[13px] font-normal text-[#B2C0D8] not-italic">
          <span>KJV</span>
          <span className="text-[#F3CF65]/90">{lookupData?.canonicalReference || parsed?.canonicalRef || reference}</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * Logos-style hover preview wrapper.
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
  const [hoverRect, setHoverRect] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const snapshot = { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width };
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverRect(snapshot);
    }, 110);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverRect(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const tooltipPortal = hoverRect ? (
    <LogosScriptureHoverCard reference={reference} anchorRect={hoverRect} />
  ) : null;

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
