import React, { useState, useRef, useEffect, useCallback } from "react";
import { Highlighter, Underline, Eraser, ChevronDown, ChevronRight, Copy, FileText, Sparkles, Check } from "lucide-react";
import { HighlightItem } from "../../types/notebook";
import {
  fetchHighlightsFromSupabase,
  saveHighlightToSupabase,
  deleteHighlightFromSupabase
} from "../../lib/notebookSync";

export interface HighlightColorOption {
  id: string;
  label: string;
  value: string; // Hex for full highlight, or "underline:#HEX" for underline
  previewHex: string;
}

export const FULL_HIGHLIGHT_OPTIONS: HighlightColorOption[] = [
  { id: "hl-gold", label: "Sanctuary Gold", value: "#FFF3A3", previewHex: "#FFF3A3" },
  { id: "hl-blue", label: "Celestial Blue", value: "#A3D4FF", previewHex: "#A3D4FF" },
  { id: "hl-green", label: "Edenic Mint", value: "#C9F7C5", previewHex: "#C9F7C5" },
  { id: "hl-pink", label: "Rose Quartz", value: "#FBC4D8", previewHex: "#FBC4D8" },
  { id: "hl-purple", label: "Royal Lavender", value: "#E2C6FF", previewHex: "#E2C6FF" }
];

export const UNDERLINE_COLOR_OPTIONS: HighlightColorOption[] = [
  { id: "ul-gold", label: "Sacred Gold", value: "underline:#E5B842", previewHex: "#E5B842" },
  { id: "ul-crimson", label: "Covenant Crimson", value: "underline:#EF4444", previewHex: "#EF4444" },
  { id: "ul-blue", label: "Sapphire Blue", value: "underline:#3B82F6", previewHex: "#3B82F6" },
  { id: "ul-emerald", label: "Emerald Green", value: "underline:#10B981", previewHex: "#10B981" },
  { id: "ul-purple", label: "Royal Purple", value: "underline:#A855F7", previewHex: "#A855F7" }
];

/**
 * Computes inline CSS properties for either a full background highlight or a styled underline
 */
export function getHighlightInlineStyle(colorCode: string): React.CSSProperties {
  if (colorCode && colorCode.startsWith("underline:")) {
    const hex = colorCode.replace("underline:", "").trim() || "#E5B842";
    return {
      textDecorationLine: "underline",
      textDecorationStyle: "solid",
      textDecorationColor: hex,
      textDecorationThickness: "2.5px",
      textUnderlineOffset: "3px",
      borderRadius: "2px",
      padding: "0 1px"
    };
  }

  return {
    backgroundColor: colorCode || "#FFF3A3",
    color: "#12131a",
    borderRadius: "0.15rem",
    padding: "0.06rem 0.18rem",
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone"
  };
}

/**
 * Renders a plain string with matching user highlights & underlines applied
 */
export function renderTextWithHighlights(
  text: string,
  highlights: HighlightItem[],
  customInnerRenderer?: (segment: string) => React.ReactNode
): React.ReactNode {
  const renderSegment = customInnerRenderer || ((s: string) => s);

  if (!text || !highlights || highlights.length === 0) {
    return renderSegment(text);
  }

  const sortedHighlights = [...highlights]
    .filter(h => h.text_snippet && text.toLowerCase().includes(h.text_snippet.toLowerCase()))
    .sort((a, b) => (b.text_snippet?.length || 0) - (a.text_snippet?.length || 0));

  const wholeVerseHighlight = highlights.find(
    h => !h.text_snippet || h.text_snippet.trim() === "" || h.text_snippet.trim().toLowerCase() === text.trim().toLowerCase()
  );

  if (wholeVerseHighlight) {
    return (
      <span style={getHighlightInlineStyle(wholeVerseHighlight.color)}>
        {renderSegment(text)}
      </span>
    );
  }

  if (sortedHighlights.length === 0) {
    return renderSegment(text);
  }

  const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const pattern = sortedHighlights.map(h => `(${escapeRegex(h.text_snippet!)})`).join("|");
  const regex = new RegExp(pattern, "gi");

  const parts = text.split(regex);
  if (parts.length <= 1) {
    return renderSegment(text);
  }

  return parts.map((part, idx) => {
    if (!part) return null;

    const matchingHighlight = sortedHighlights.find(
      h => h.text_snippet && h.text_snippet.toLowerCase() === part.toLowerCase()
    );

    if (matchingHighlight) {
      return (
        <span key={idx} style={getHighlightInlineStyle(matchingHighlight.color)}>
          {renderSegment(part)}
        </span>
      );
    }

    return <React.Fragment key={idx}>{renderSegment(part)}</React.Fragment>;
  });
}

interface TieredHighlightDropdownProps {
  onSelectColor: (colorValue: string) => void;
  onClear: () => void;
  theme?: "light" | "dark";
  compact?: boolean;
  defaultOpen?: boolean;
  buttonLabel?: string;
}

/**
 * Tiered Dropdown Menu offering color options for both:
 *  - Tier 1: Full Highlights
 *  - Tier 2: Underlines
 * Plus an Eraser / Clear action.
 */
export const TieredHighlightDropdown: React.FC<TieredHighlightDropdownProps> = ({
  onSelectColor,
  onClear,
  theme = "dark",
  compact = false,
  defaultOpen = false,
  buttonLabel = "Mark"
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTier, setActiveTier] = useState<"highlight" | "underline" | "both">("both");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* Primary Dropdown Trigger */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-sans font-semibold transition-all cursor-pointer border ${
          isOpen
            ? "bg-[#C9973A] text-white border-[#C9973A] shadow-xs"
            : theme === "dark"
              ? "bg-[#18202C] hover:bg-[#232E3F] text-amber-400 border-[#2E3B4E]"
              : "bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-300"
        }`}
        title="Open Tiered Highlight & Underline Menu"
      >
        <Highlighter className="w-3.5 h-3.5 shrink-0" />
        {!compact && <span>{buttonLabel}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Quick Eraser Button beside dropdown trigger */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          onClear();
          setIsOpen(false);
        }}
        className={`p-1.5 ml-1 rounded-md transition-all cursor-pointer ${
          theme === "dark"
            ? "text-gray-400 hover:bg-red-500/15 hover:text-red-400"
            : "text-gray-500 hover:bg-red-50 hover:text-red-600"
        }`}
        title="Clear Highlights & Underlines"
      >
        <Eraser className="w-3.5 h-3.5" />
      </button>

      {/* Tiered Dropdown Popover Menu */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-full mt-1.5 z-50 w-60 rounded-xl border shadow-2xl p-2.5 select-none animate-in fade-in zoom-in-95 duration-150 ${
            theme === "dark"
              ? "bg-[#151B24]/98 border-[#2C374B] text-gray-100 shadow-black/70"
              : "bg-white/98 border-[#E2D9C8] text-gray-800 shadow-stone-300/60"
          }`}
        >
          {/* Tier Selector Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-lg mb-2.5 border ${
            theme === "dark" ? "bg-[#0D1117] border-[#212936]" : "bg-stone-100 border-stone-200"
          }`}>
            <button
              type="button"
              onClick={() => setActiveTier("both")}
              className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                activeTier === "both"
                  ? "bg-[#C9973A] text-white shadow-2xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All Styles
            </button>
            <button
              type="button"
              onClick={() => setActiveTier("highlight")}
              className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTier === "highlight"
                  ? "bg-[#C9973A] text-white shadow-2xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Highlighter className="w-2.5 h-2.5" />
              <span>Fill</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTier("underline")}
              className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTier === "underline"
                  ? "bg-[#C9973A] text-white shadow-2xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Underline className="w-2.5 h-2.5" />
              <span>Line</span>
            </button>
          </div>

          {/* TIER 1: FULL HIGHLIGHTS */}
          {(activeTier === "both" || activeTier === "highlight") && (
            <div className="mb-2.5">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C9973A] flex items-center gap-1">
                  <Highlighter className="w-3 h-3" />
                  <span>Full Highlights</span>
                </span>
                <span className="text-[9px] font-mono opacity-60">Background Fill</span>
              </div>
              <div className="flex items-center justify-between gap-1.5 px-1">
                {FULL_HIGHLIGHT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectColor(opt.value);
                      setIsOpen(false);
                    }}
                    className="group relative w-8 h-7 rounded-lg border border-black/20 dark:border-white/20 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: opt.previewHex }}
                    title={`${opt.label} Highlight`}
                  >
                    <span className="text-[10px] font-serif font-bold text-gray-900 opacity-75 group-hover:opacity-100">
                      Aa
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider between tiers */}
          {activeTier === "both" && (
            <div className={`h-[1px] w-full my-2 ${theme === "dark" ? "bg-[#263042]" : "bg-stone-200"}`} />
          )}

          {/* TIER 2: COLORED UNDERLINES */}
          {(activeTier === "both" || activeTier === "underline") && (
            <div className="mb-2">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                  <Underline className="w-3 h-3" />
                  <span>Underlines</span>
                </span>
                <span className="text-[9px] font-mono opacity-60">Precision Line</span>
              </div>
              <div className="flex items-center justify-between gap-1.5 px-1">
                {UNDERLINE_COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectColor(opt.value);
                      setIsOpen(false);
                    }}
                    className={`group relative w-8 h-7 rounded-lg border hover:scale-110 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center shadow-xs ${
                      theme === "dark"
                        ? "bg-[#1E2634] border-[#323F54] hover:border-amber-500/50"
                        : "bg-stone-50 border-stone-300 hover:border-amber-500"
                    }`}
                    title={`${opt.label} Underline`}
                  >
                    <span className={`text-[10px] font-serif font-bold leading-none ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}>
                      U
                    </span>
                    <span
                      className="w-5 h-[3px] rounded-full mt-0.5"
                      style={{ backgroundColor: opt.previewHex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Clear Button */}
          <button
            type="button"
            onClick={() => {
              onClear();
              setIsOpen(false);
            }}
            className={`w-full mt-1 py-1.5 px-2.5 rounded-lg text-[11px] font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              theme === "dark"
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/25"
                : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
            }`}
          >
            <Eraser className="w-3 h-3" />
            <span>Clear Selection Marks</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface ToolHighlightableWrapperProps {
  toolId: "SDABC" | "WORD_STUDY" | "NOTEBOOK";
  referenceKey: string;
  userId?: string;
  theme: "light" | "dark";
  children: React.ReactNode;
  className?: string;
  onAddNoteFromSelection?: (text: string, ref: string) => void;
}

/**
 * Wraps study tools (SDA Commentary, Word Study, Notebook Reader) to provide:
 * 1. Text selection floating popup with the Tiered Highlight & Underline Dropdown Menu
 * 2. Persistent rendering of saved highlights & underlines inside the tool content
 */
export const ToolHighlightableWrapper: React.FC<ToolHighlightableWrapperProps> = ({
  toolId,
  referenceKey,
  userId = "guest-local",
  theme,
  children,
  className = "",
  onAddNoteFromSelection
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [selectionData, setSelectionData] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const normalizedRefKey = `${toolId}:${(referenceKey || "general").trim()}`;

  // Load saved highlights for this tool
  useEffect(() => {
    let mounted = true;
    fetchHighlightsFromSupabase().then(items => {
      if (mounted) {
        setHighlights(items.filter(h => h.translation === toolId));
      }
    });
    return () => {
      mounted = false;
    };
  }, [toolId, referenceKey]);

  // Apply saved highlights/underlines non-destructively to DOM text nodes inside contentRef
  const applyDomHighlights = useCallback(() => {
    const root = contentRef.current;
    if (!root) return;

    // 1. Unwrap any previously injected <mark data-stba-tool-mark="true">
    const existingMarks = root.querySelectorAll('mark[data-stba-tool-mark="true"]');
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    });

    const relevant = highlights.filter(
      h =>
        h.translation === toolId &&
        h.text_snippet &&
        h.text_snippet.trim().length >= 2 &&
        (h.verse_reference === normalizedRefKey || h.verse_reference.startsWith(`${toolId}:`))
    );

    if (relevant.length === 0) return;

    // Sort longest first
    const sorted = [...relevant].sort(
      (a, b) => (b.text_snippet?.length || 0) - (a.text_snippet?.length || 0)
    );

    // Walk text nodes
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (
          tag === "input" ||
          tag === "textarea" ||
          tag === "button" ||
          tag === "script" ||
          tag === "style" ||
          parent.closest("button") ||
          parent.closest('[data-no-highlight="true"]')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    for (const h of sorted) {
      const snippet = h.text_snippet.trim();
      if (!snippet) continue;
      const snippetLower = snippet.toLowerCase();

      for (let i = 0; i < textNodes.length; i++) {
        const tNode = textNodes[i];
        if (!tNode.parentNode) continue;
        const val = tNode.nodeValue || "";
        const idx = val.toLowerCase().indexOf(snippetLower);
        if (idx !== -1) {
          try {
            const matchRange = document.createRange();
            matchRange.setStart(tNode, idx);
            matchRange.setEnd(tNode, idx + snippet.length);

            const mark = document.createElement("mark");
            mark.setAttribute("data-stba-tool-mark", "true");
            mark.setAttribute("data-highlight-id", h.id);
            const isUnderline = h.color.startsWith("underline:");
            if (isUnderline) {
              const hex = h.color.replace("underline:", "").trim();
              mark.style.backgroundColor = "transparent";
              mark.style.color = "inherit";
              mark.style.textDecorationLine = "underline";
              mark.style.textDecorationStyle = "solid";
              mark.style.textDecorationColor = hex;
              mark.style.textDecorationThickness = "2.5px";
              mark.style.textUnderlineOffset = "3px";
            } else {
              mark.style.backgroundColor = h.color;
              mark.style.color = "#12131a";
              mark.style.borderRadius = "0.15rem";
              mark.style.padding = "0.04rem 0.16rem";
            }

            matchRange.surroundContents(mark);
          } catch {
            // Ignore cross-boundary range errors
          }
        }
      }
    }
  }, [highlights, toolId, normalizedRefKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyDomHighlights();
    }, 60);
    return () => clearTimeout(timer);
  }, [applyDomHighlights, children]);

  const handleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) {
      setSelectionData(null);
      return;
    }

    // Do not trigger inside inputs, textareas, or buttons
    const anchorEl =
      selection.anchorNode instanceof HTMLElement
        ? selection.anchorNode
        : selection.anchorNode?.parentElement;
    if (
      !anchorEl ||
      anchorEl.closest("input, textarea, button, [data-no-highlight='true']") ||
      !contentRef.current?.contains(anchorEl)
    ) {
      setSelectionData(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setSelectionData({
        text: selectedText,
        x: rect.left - containerRect.left + rect.width / 2,
        y: Math.max(8, rect.top - containerRect.top - 48)
      });
    }
  };

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setSelectionData(null);
  };

  const handleApplyHighlight = async (colorValue: string) => {
    if (!selectionData) return;

    const newItem: HighlightItem = {
      id: `hl-${toolId.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      user_id: userId,
      translation: toolId,
      verse_reference: normalizedRefKey,
      text_snippet: selectionData.text,
      color: colorValue,
      created_at: new Date().toISOString()
    };

    setHighlights(prev => [...prev, newItem]);
    clearSelection();

    try {
      await saveHighlightToSupabase(newItem);
    } catch (err) {
      console.warn("Failed saving tool highlight:", err);
    }
  };

  const handleClearHighlights = async () => {
    if (!selectionData) return;
    const snippetLower = selectionData.text.toLowerCase();

    const toRemove = highlights.filter(
      h =>
        h.translation === toolId &&
        h.text_snippet &&
        (h.text_snippet.toLowerCase().includes(snippetLower) ||
          snippetLower.includes(h.text_snippet.toLowerCase()))
    );

    const targetList = toRemove.length > 0 ? toRemove : highlights.filter(h => h.verse_reference === normalizedRefKey);
    const removeIds = new Set(targetList.map(h => h.id));

    setHighlights(prev => prev.filter(h => !removeIds.has(h.id)));
    clearSelection();

    for (const item of targetList) {
      try {
        await deleteHighlightFromSupabase(item.id);
      } catch (err) {
        console.warn("Failed deleting tool highlight:", err);
      }
    }
  };

  const handleCopySelection = () => {
    if (!selectionData) return;
    navigator.clipboard.writeText(`"${selectionData.text}" (${referenceKey})`);
    setCopiedFeedback(true);
    setTimeout(() => {
      setCopiedFeedback(false);
      clearSelection();
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className={`relative ${className}`}
    >
      <div ref={contentRef} className="w-full h-full">
        {children}
      </div>

      {/* Floating Tiered Highlight & Underline Popup */}
      {selectionData && (
        <div
          data-no-highlight="true"
          className="absolute z-50 flex items-center gap-1 p-1.5 shadow-2xl rounded-xl border text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.max(12, Math.min((containerRef.current?.clientWidth || 360) - 240, selectionData.x - 100))}px`,
            top: `${Math.max(8, selectionData.y)}px`
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div
            className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border ${
              theme === "dark"
                ? "bg-[#18202C] text-gray-100 border-[#2E3B4E]"
                : "bg-white text-gray-800 border-[#E5DFD5]"
            }`}
          >
            <TieredHighlightDropdown
              onSelectColor={handleApplyHighlight}
              onClear={handleClearHighlights}
              theme={theme}
              defaultOpen={true}
              buttonLabel="Highlight"
            />

            <div className={`h-4 w-[1px] mx-0.5 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`} />

            <button
              type="button"
              onClick={handleCopySelection}
              className="p-1.5 hover:bg-amber-500/15 hover:text-amber-500 rounded-md cursor-pointer transition-colors"
              title="Copy excerpt"
            >
              {copiedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {onAddNoteFromSelection && (
              <button
                type="button"
                onClick={() => {
                  onAddNoteFromSelection(selectionData.text, referenceKey);
                  clearSelection();
                }}
                className="p-1.5 hover:bg-amber-500/15 hover:text-amber-500 rounded-md cursor-pointer transition-colors"
                title="Send excerpt to Notebook"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
