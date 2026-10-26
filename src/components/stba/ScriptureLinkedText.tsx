import React, { useMemo } from "react";
import { BookOpen } from "lucide-react";

interface ScriptureLinkedTextProps {
  text: string;
  onNavigateRef: (reference: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Robust regex matching canonical Scripture references and standard abbreviations
 * Examples matched:
 * - Revelation 14:6-12, Rev. 14:7, Rev 14:12
 * - Daniel 8:14, Dan. 8:13-14, Dan 9:24-27
 * - Exodus 20:8-11, Ex. 20:11, Exod. 20:8
 * - Genesis 1:1, Gen. 2:1-3, Gen 3:15
 * - Leviticus 16:16-30, Lev. 16:16
 * - Hebrews 8:1-2, Heb. 9:23-28
 * - Romans 8:1-4, Rom. 3:24, Rom 6:23
 * - Numbers 14:34, Num. 14:34
 * - Ezekiel 4:6, Eze. 4:6, Ezek. 4:6
 * - Isaiah 8:20, Isa. 58:13-14, Isa 21:9
 * - Matthew 24:14, Matt. 28:19-20
 * - 1 Corinthians 6:19-20, 1 Cor. 6:19-20
 * - 2 Timothy 3:16-17, 2 Tim. 2:15
 * - 2 Peter 2:6, Jude 7, Nahum 1:9, Mal. 4:1-3
 */
export const SCRIPTURE_REF_REGEX = /\b(?:[1-3]\s+)?(?:Genesis|Gen|Exodus|Exod|Ex|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Dt|Joshua|Josh|Judges|Judg|Ruth|1\s+Samuel|2\s+Samuel|1\s+Sam|2\s+Sam|1\s+Kings|2\s+Kings|1\s+Chronicles|2\s+Chronicles|1\s+Chr|2\s+Chr|Ezra|Nehemiah|Neh|Esther|Esth|Job|Psalms|Psalm|Ps|Psa|Proverbs|Prov|Pr|Ecclesiastes|Eccl|Song\s+of\s+Solomon|Song|Isaiah|Isa|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Eze|Daniel|Dan|Hosea|Hos|Joel|Amos|Obadiah|Obad|Jonah|Micah|Mic|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|Matthew|Matt|Mt|Mark|Mk|Luke|Lk|John|Jn|Acts|Romans|Rom|1\s+Corinthians|2\s+Corinthians|1\s+Cor|2\s+Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|1\s+Thessalonians|2\s+Thessalonians|1\s+Thess|2\s+Thess|1\s+Timothy|2\s+Timothy|1\s+Tim|2\s+Tim|Titus|Tit|Philemon|Philem|Hebrews|Heb|James|Jas|1\s+Peter|2\s+Peter|1\s+Pet|2\s+Pet|1\s+John|2\s+John|3\s+John|Jude|Revelation|Rev)\.?\s+\d+(?::\d+(?:[-–—]\d+)?)?(?:,\s*\d+(?::\d+(?:[-–—]\d+)?)?)*/gi;

/**
 * Component that parses arbitrary text and turns every embedded scripture citation
 * into an interactive, clickable hyperlink that syncs both the primary Bible reader
 * and the SDA Bible Commentary panel.
 */
export const ScriptureLinkedText: React.FC<ScriptureLinkedTextProps> = ({
  text,
  onNavigateRef,
  className = "",
  style
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
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNavigateRef(seg.content);
              }}
              className="inline-flex items-center gap-0.5 text-[#C9973A] hover:text-amber-400 font-semibold underline underline-offset-2 decoration-[#C9973A]/40 hover:decoration-[#C9973A] transition-all cursor-pointer rounded px-0.5 hover:bg-[#C9973A]/15 align-baseline select-text"
              title={`Click to open ${seg.content} in Primary Bible Reader & SDA Bible Commentary`}
            >
              <BookOpen className="w-3 h-3 inline-block shrink-0 opacity-75 mr-0.5" />
              <span>{seg.content}</span>
            </button>
          );
        }
        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};
