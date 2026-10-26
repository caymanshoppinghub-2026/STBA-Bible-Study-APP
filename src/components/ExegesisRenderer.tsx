import React from "react";
import {
  BookOpen,
  ArrowUpRight,
  Quote,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Languages,
  Shield,
  Target,
  BookOpenText,
  HelpCircle
} from "lucide-react";

interface ExegesisRendererProps {
  content: string;
  onVerseClick?: (verse: string) => void;
  className?: string;
}

// Regex to identify biblical references like "Romans 8:1-4", "Hebrews 8:10", "Exodus 20:8–11", "Revelation 14:6-12", "Genesis 2:1-3", etc.
const BIBLE_REF_REGEX =
  /\b(?:(?:1st|2nd|3rd|1|2|3)\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation|Gen|Exod?|Lev|Num|Deut|Josh|Judg|Sam|Kgs|Chron|Neh|Esth|Ps|Prov|Eccl|Isa|Jer|Lam|Ezek|Dan|Hos|Mic|Hab|Zech|Mal|Matt|Rom|Cor|Gal|Eph|Phil|Col|Thess|Tim|Tit|Heb|Pet|Rev)\.?\s+\d+:\d+(?:[–\-]\d+)?(?:,\s*\d+(?:[–\-]\d+)?)*\b/g;

/**
 * Parses a plain text string into React nodes where Scripture references become clickable buttons.
 * Formatted in clean natural language without raw HTML tags.
 */
export function renderTextWithVerseButtons(
  text: string,
  onVerseClick?: (verse: string) => void
): React.ReactNode {
  // Strip any accidental raw HTML tags for clean natural language formatting
  const cleanText = text.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, "");

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex index
  BIBLE_REF_REGEX.lastIndex = 0;

  while ((match = BIBLE_REF_REGEX.exec(cleanText)) !== null) {
    const matchIndex = match.index;
    const matchLength = match[0].length;
    const matchedRef = match[0];

    // Text before the verse
    if (matchIndex > lastIndex) {
      const precedingText = cleanText.substring(lastIndex, matchIndex);
      parts.push(renderFormattedInline(precedingText, `pre-${lastIndex}`));
    }

    // Verse button
    parts.push(
      <button
        key={`verse-${matchIndex}-${matchedRef}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onVerseClick) {
            onVerseClick(matchedRef);
          }
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-lg bg-[#E5B842]/15 hover:bg-[#E5B842]/30 border border-[#E5B842]/40 text-[#F3CF65] hover:text-white font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95 group/vbtn align-baseline"
        title={`Explore ${matchedRef} in Bible Study Mode`}
      >
        <BookOpen className="w-3 h-3 text-[#F3CF65] group-hover/vbtn:scale-110 transition-transform shrink-0" />
        <span className="underline decoration-[#F3CF65]/40 group-hover/vbtn:decoration-white">
          {matchedRef}
        </span>
        <ArrowUpRight className="w-2.5 h-2.5 text-[#F3CF65]/70 group-hover/vbtn:text-[#F3CF65] shrink-0" />
      </button>
    );

    lastIndex = matchIndex + matchLength;
  }

  // Trailing text
  if (lastIndex < cleanText.length) {
    parts.push(renderFormattedInline(cleanText.substring(lastIndex), `post-${lastIndex}`));
  }

  return parts.length > 0 ? parts : cleanText;
}

/**
 * Handles basic markdown inline styling (bold **text**, italics *text*)
 */
function renderFormattedInline(text: string, keyPrefix: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-bold text-white">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith("*") && seg.endsWith("*")) {
      return (
        <em key={`${keyPrefix}-i-${i}`} className="italic text-stone-200">
          {seg.slice(1, -1)}
        </em>
      );
    }
    return seg;
  });
}

interface ParsedBlock {
  type: "summary" | "question" | "header" | "egwQuote" | "quote" | "bullet" | "paragraph";
  headerTitle?: string;
  text: string;
  quoteSource?: string;
  quoteAuthor?: string;
}

export const ExegesisRenderer: React.FC<ExegesisRendererProps> = ({
  content,
  onVerseClick,
  className = ""
}) => {
  // Strip any raw HTML tags for natural language consistency
  const sanitizedContent = content.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, "");

  // Split into raw lines
  const rawLines = sanitizedContent.split("\n");

  const blocks: ParsedBlock[] = [];
  let currentBlockText: string[] = [];
  let currentBlockType: ParsedBlock["type"] = "paragraph";
  let currentHeader = "";
  let currentQuoteSource = "";
  let currentQuoteAuthor = "Ellen White";

  let activeSectionTitle = "";
  let pendingCitation: string | null = null;

  const flushCurrentBlock = () => {
    if (currentBlockText.length > 0) {
      blocks.push({
        type: currentBlockType,
        headerTitle: currentHeader,
        text: currentBlockText.join(" "),
        quoteSource: currentQuoteSource,
        quoteAuthor: currentQuoteAuthor
      });
      currentBlockText = [];
      currentBlockType = "paragraph";
      currentHeader = "";
      currentQuoteSource = "";
      currentQuoteAuthor = "Ellen White";
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      flushCurrentBlock();
      continue;
    }

    // Check if line is an echoed Question header e.g. "### Question: ..."
    const questionMatch = line.match(/^#{1,3}\s*(?:Question|Query):\s*(.+)$/i);
    if (questionMatch) {
      flushCurrentBlock();
      blocks.push({
        type: "question",
        text: questionMatch[1].trim()
      });
      continue;
    }

    // Check if line is a Study Summary header
    if (line.match(/^(?:###\s*)?(?:\*\*)?Study Summary(?:\*\*)?:?/i)) {
      flushCurrentBlock();
      activeSectionTitle = "Study Summary";
      currentBlockType = "summary";
      currentHeader = "Study Summary";
      const remainder = line
        .replace(/^(?:###\s*)?(?:\*\*)?Study Summary(?:\*\*)?:?\s*/i, "")
        .trim();
      if (remainder) {
        currentBlockText.push(remainder);
      }
      continue;
    }

    // Check if line is another markdown header like "### 1. Context & Scriptural Foundation"
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headerMatch) {
      flushCurrentBlock();
      const headerTitle = headerMatch[1].trim();
      activeSectionTitle = headerTitle;
      blocks.push({
        type: "header",
        headerTitle: headerTitle,
        text: ""
      });
      pendingCitation = null;
      continue;
    }

    // Check if line is a blockquote (> ...)
    if (line.startsWith(">")) {
      const cleanQuoteLine = line
        .replace(/^>\s*/, "")
        .replace(/^["“]|["”]$/g, "")
        .trim();

      // Determine quote source and attribution
      let quoteSource = pendingCitation || "";
      let author = "Ellen White";

      // Check if quote line has an inline citation e.g. "— Ellen White, Steps to Christ, p. 62"
      const dashCitationMatch = cleanQuoteLine.match(/—\s*(?:Ellen White,?\s*)?([^—\n]+)$/i);
      let quoteBody = cleanQuoteLine;
      if (dashCitationMatch) {
        quoteSource = dashCitationMatch[1].trim();
        quoteBody = cleanQuoteLine.replace(/—\s*(?:Ellen White,?\s*)?([^—\n]+)$/i, "").trim();
      }

      // If we are in the Spirit of Prophecy / Ellen White section, or citation / quote references Ellen White:
      const isEgwContext =
        activeSectionTitle.toLowerCase().includes("spirit of prophecy") ||
        activeSectionTitle.toLowerCase().includes("ellen white") ||
        quoteSource.toLowerCase().includes("ellen white") ||
        quoteBody.toLowerCase().includes("ellen white") ||
        quoteSource.length > 0;

      if (currentBlockType !== (isEgwContext ? "egwQuote" : "quote")) {
        flushCurrentBlock();
        currentBlockType = isEgwContext ? "egwQuote" : "quote";
        currentQuoteSource = quoteSource;
        currentQuoteAuthor = author;
      } else if (quoteSource && !currentQuoteSource) {
        currentQuoteSource = quoteSource;
      }

      currentBlockText.push(quoteBody);
      pendingCitation = null;
      continue;
    }

    // Check if line is a bullet item
    if (line.startsWith("* ") || line.startsWith("- ") || line.match(/^\d+\.\s+/)) {
      flushCurrentBlock();
      const itemText = line.replace(/^(\*|-|\d+\.)\s+/, "").trim();

      // Check if this bullet is a quote citation header (e.g. "* Steps to Christ, p. 62:" or "* **Steps to Christ, p. 90**:")
      // Lookahead: check if next non-empty line starts with ">"
      let nextLineIsQuote = false;
      for (let j = i + 1; j < rawLines.length; j++) {
        const next = rawLines[j].trim();
        if (!next) continue;
        if (next.startsWith(">")) {
          nextLineIsQuote = true;
        }
        break;
      }

      const isKnownEgwCitation =
        itemText.toLowerCase().includes("steps to christ") ||
        itemText.toLowerCase().includes("desire of ages") ||
        itemText.toLowerCase().includes("great controversy") ||
        itemText.toLowerCase().includes("patriarchs and prophets") ||
        itemText.toLowerCase().includes("prophets and kings") ||
        itemText.toLowerCase().includes("acts of the apostles") ||
        itemText.toLowerCase().includes("christ's object lessons") ||
        itemText.toLowerCase().includes("testimonies") ||
        itemText.toLowerCase().includes("ministry of healing") ||
        itemText.toLowerCase().includes("selected messages") ||
        itemText.toLowerCase().includes("early writings") ||
        itemText.toLowerCase().includes("ellen white") ||
        itemText.match(/,\s*p\.\s*\d+/i);

      if (nextLineIsQuote || (activeSectionTitle.toLowerCase().includes("spirit of prophecy") && isKnownEgwCitation)) {
        // Save citation and don't render this line as an empty disconnected bullet
        pendingCitation = itemText.replace(/[:.]+$/, "").replace(/\*\*/g, "").trim();
        continue;
      }

      // Check if bullet directly contains an embedded quote with Ellen White citation
      if (
        (itemText.includes("“") || itemText.includes('"')) &&
        (itemText.toLowerCase().includes("ellen white") || isKnownEgwCitation)
      ) {
        const quoteExtractMatch = itemText.match(/[“"]([^”"]+)[”"]/);
        const sourceExtractMatch = itemText.match(/—\s*([^—\n]+)$/);
        if (quoteExtractMatch) {
          blocks.push({
            type: "egwQuote",
            text: quoteExtractMatch[1].trim(),
            quoteSource: sourceExtractMatch
              ? sourceExtractMatch[1].trim()
              : itemText.replace(/[“"][^”"]+[”"]/, "").replace(/[:.—]/g, "").trim(),
            quoteAuthor: "Ellen White"
          });
          continue;
        }
      }

      // Regular bullet item
      blocks.push({
        type: "bullet",
        text: itemText
      });
      pendingCitation = null;
      continue;
    }

    // Normal paragraph line
    currentBlockText.push(line);
  }

  // Push final block
  flushCurrentBlock();

  return (
    <div
      className={`space-y-4 text-stone-200 elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased text-xs sm:text-sm leading-relaxed overflow-y-auto pr-1 ${className}`}
    >
      {blocks.map((block, idx) => {
        // Question Header Card
        if (block.type === "question") {
          return (
            <div
              key={`block-${idx}`}
              className="px-3.5 py-2.5 rounded-xl bg-[#06162c] border border-[#0d3060] text-stone-300 text-xs font-mono flex items-center justify-between gap-2 shadow-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <HelpCircle className="w-3.5 h-3.5 text-[#F3CF65] shrink-0" />
                <span className="text-[#F3CF65] font-bold shrink-0 uppercase tracking-wider text-[10px]">
                  Query:
                </span>
                <span className="truncate text-white font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] italic text-xs">
                  {block.text}
                </span>
              </div>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#E5B842]/15 text-[#F3CF65] border border-[#E5B842]/30 shrink-0">
                Study Inquiry
              </span>
            </div>
          );
        }

        // Study Summary Executive Card (The Anchor Little Box with Ribbon)
        if (block.type === "summary") {
          return (
            <div
              key={`block-${idx}`}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#06162c] via-[#0b2447] to-[#06162c] border-2 border-[#E5B842]/60 shadow-xl space-y-2.5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3CF65]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#F3CF65]/15 transition-all" />
              <div className="flex items-center justify-between border-b border-[#E5B842]/30 pb-2 relative z-10 gap-2">
                <div className="flex items-center gap-2 text-[#F3CF65]">
                  <Sparkles className="w-4 h-4 text-[#F3CF65] shrink-0" />
                  <h4 className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-sm sm:text-base text-white tracking-[0.65px]">
                    Study Summary
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/40 font-bold uppercase tracking-wider shrink-0 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#F3CF65]" />
                  Executive Exegesis
                </span>
              </div>
              <div className="text-stone-200 text-xs sm:text-sm font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] leading-relaxed relative z-10">
                {renderTextWithVerseButtons(block.text, onVerseClick)}
              </div>
            </div>
          );
        }

        // Section Headers with Themed Ribbon Details
        if (block.type === "header") {
          const title = block.headerTitle || "";

          let ribbonTag = "Study Exegesis";
          let HeaderIcon = Bookmark;

          if (title.toLowerCase().includes("context") || title.includes("1.")) {
            ribbonTag = "Biblical Context";
            HeaderIcon = BookOpen;
          } else if (
            title.toLowerCase().includes("key terms") ||
            title.toLowerCase().includes("language") ||
            title.includes("2.")
          ) {
            ribbonTag = "Original Tongues";
            HeaderIcon = Languages;
          } else if (
            title.toLowerCase().includes("exegetical") ||
            title.includes("3.")
          ) {
            ribbonTag = "Exegetical Depth";
            HeaderIcon = BookOpenText;
          } else if (
            title.toLowerCase().includes("spirit of prophecy") ||
            title.toLowerCase().includes("ellen white") ||
            title.includes("4.")
          ) {
            ribbonTag = "Spirit of Prophecy";
            HeaderIcon = Sparkles;
          } else if (
            title.toLowerCase().includes("theological") ||
            title.toLowerCase().includes("hermeneutic") ||
            title.includes("5.")
          ) {
            ribbonTag = "SDA Theology";
            HeaderIcon = Shield;
          } else if (
            title.toLowerCase().includes("application") ||
            title.toLowerCase().includes("discussion") ||
            title.includes("6.")
          ) {
            ribbonTag = "Discipleship & Action";
            HeaderIcon = Target;
          }

          return (
            <div
              key={`block-${idx}`}
              className="pt-4 pb-2 border-b border-[#0d3060] flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <HeaderIcon className="w-4 h-4 text-[#F3CF65] shrink-0" />
                <h4 className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-sm sm:text-base text-white tracking-[0.65px] truncate">
                  {title}
                </h4>
              </div>
              <span className="text-[9.5px] font-mono px-2.5 py-0.5 rounded-full bg-[#E5B842]/15 text-[#F3CF65] border border-[#E5B842]/30 font-semibold uppercase tracking-wider shrink-0">
                {ribbonTag}
              </span>
            </div>
          );
        }

        // Ellen White / Spirit of Prophecy Little Boxes with Ribbon Details
        if (block.type === "egwQuote" || block.type === "quote") {
          const citation = block.quoteSource || "Inspired Writings";
          return (
            <div
              key={`block-${idx}`}
              className="my-3.5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#06162c] via-[#0b2447] to-[#06162c] border-2 border-[#E5B842]/60 shadow-xl space-y-3 relative overflow-hidden group"
            >
              {/* Ambient radial background glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#F3CF65]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#F3CF65]/15 transition-all" />

              {/* Ribbon Header Detail */}
              <div className="flex items-center justify-between border-b border-[#E5B842]/30 pb-2.5 relative z-10 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/30 shrink-0">
                    <Quote className="w-4 h-4 text-[#F3CF65]" />
                  </div>
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <h5 className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-sm text-white tracking-[0.65px]">
                      Ellen White
                    </h5>
                    {citation && citation !== "Inspired Writings" && (
                      <span className="text-stone-300 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] text-xs italic truncate max-w-[200px] sm:max-w-xs">
                        • {citation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ribbon Detail Badge */}
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/40 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs ml-auto">
                  <Sparkles className="w-2.5 h-2.5 text-[#F3CF65]" />
                  Spirit of Prophecy
                </span>
              </div>

              {/* Quote Body */}
              <div className="relative z-10 pl-3 border-l-2 border-[#E5B842]/70 py-0.5">
                <p className="font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] italic text-xs sm:text-sm text-stone-100 leading-relaxed">
                  “{renderTextWithVerseButtons(block.text, onVerseClick)}”
                </p>
              </div>

              {/* Footer Citation & Details */}
              <div className="flex items-center justify-between pt-2 border-t border-[#0d3060] text-xs font-mono text-stone-400 relative z-10">
                <div className="flex items-center gap-1.5 text-[#F3CF65] font-semibold text-[11px]">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span className="truncate">{citation}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  Ellen White Writings
                </span>
              </div>
            </div>
          );
        }

        // Bullet list item with gold bullet dot & interactive verse buttons
        if (block.type === "bullet") {
          return (
            <div
              key={`block-${idx}`}
              className="flex items-start gap-2.5 pl-1 sm:pl-2 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F3CF65] shrink-0 mt-2 shadow-xs" />
              <div className="flex-1 text-xs sm:text-sm text-stone-200 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px]">
                {renderTextWithVerseButtons(block.text, onVerseClick)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p
            key={`block-${idx}`}
            className="text-stone-200 text-xs sm:text-sm leading-relaxed font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px]"
          >
            {renderTextWithVerseButtons(block.text, onVerseClick)}
          </p>
        );
      })}
    </div>
  );
};

export default ExegesisRenderer;

