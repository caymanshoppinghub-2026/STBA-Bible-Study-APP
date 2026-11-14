/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  PenLine,
  X,
  Check,
  BookOpen,
  Sparkles,
  Quote,
  List,
  ExternalLink,
  FileText,
  Clock,
  Tag
} from "lucide-react";
import { loadNotes, saveNotes } from "../../data/notebookData";
import { saveNoteToSupabase } from "../../lib/notebookSync";
import { StudyNote, NoteCategory } from "../../types/notebook";
import { useApp } from "../../context/AppContext";

/**
 * Restricted strictly to the specified study sections:
 * STBA Study Workspace, Sabbath School, 28 Fundamental Beliefs (Doctrine),
 * Study Tracks, Active Recall Studio, Teach It Studio, and Memory Vault.
 */
export function isStudyModeRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/stba") ||
    pathname.startsWith("/sabbath-school") ||
    pathname.startsWith("/doctrine") ||
    pathname.startsWith("/tracks") ||
    pathname.startsWith("/recall") ||
    pathname.startsWith("/teach") ||
    pathname.startsWith("/vault")
  );
}

/**
 * Derives a human-readable title and default tags for the current study section context.
 */
function resolveCurrentContext(pathname: string): {
  contextName: string;
  category: Exclude<NoteCategory, "all">;
  suggestedTag: string;
} {
  if (pathname.startsWith("/stba")) {
    return {
      contextName: "STBA Scripture Mastery & Daily Syllabus",
      category: "theology",
      suggestedTag: "STBA-Exegesis"
    };
  }
  if (pathname.startsWith("/sabbath-school")) {
    return {
      contextName: "Sabbath School Daily Lesson",
      category: "theology",
      suggestedTag: "SabbathSchool"
    };
  }
  if (pathname.startsWith("/doctrine")) {
    return {
      contextName: "28 Fundamental Beliefs",
      category: "theology",
      suggestedTag: "FundamentalBeliefs"
    };
  }
  if (pathname.startsWith("/recall")) {
    return {
      contextName: "Active Recall Studio",
      category: "biblical-studies",
      suggestedTag: "ActiveRecall"
    };
  }
  if (pathname.startsWith("/teach")) {
    return {
      contextName: "Teach It Studio",
      category: "personal-growth",
      suggestedTag: "Discipleship-Outline"
    };
  }
  if (pathname.startsWith("/vault")) {
    return {
      contextName: "Memory Vault",
      category: "biblical-studies",
      suggestedTag: "MemoryVault"
    };
  }
  if (pathname.startsWith("/tracks")) {
    const matches = pathname.match(/\/tracks\/([^/]+)(?:\/lessons\/([^/]+))?/);
    if (matches && matches[2]) {
      return {
        contextName: `Track Lesson (Part ${matches[2]})`,
        category: "theology",
        suggestedTag: `Track-${matches[1]}`
      };
    }
    return {
      contextName: "Track Study System",
      category: "theology",
      suggestedTag: "TrackStudy"
    };
  }
  return {
    contextName: "Scripture Study Section",
    category: "theology",
    suggestedTag: "ScriptureStudy"
  };
}

export const FloatingQuickNote: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { showConfetti } = useApp();

  const isStudy = isStudyModeRoute(pathname);

  // Slide-Out Discipleship Vault Side Panel States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "recent">("write");

  // Form Fields
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Exclude<NoteCategory, "all">>("theology");
  const [scriptureTags, setScriptureTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Feedback & Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentSessionNotes, setRecentSessionNotes] = useState<StudyNote[]>([]);
  const [selectedQuoteText, setSelectedQuoteText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const context = resolveCurrentContext(pathname);

  // Listen for global 'open-discipleship-vault' custom events from Daily Syllabus & Study sections
  useEffect(() => {
    const handleOpenVaultEvent = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setIsOpen(true);
      setActiveTab("write");
      if (detail?.title) {
        setNoteTitle(detail.title);
      }
      if (detail?.category) {
        setSelectedCategory(detail.category);
      }
      if (Array.isArray(detail?.tags) && detail.tags.length > 0) {
        setScriptureTags(detail.tags);
      }
      if (detail?.content) {
        setNoteContent((prev) => (prev ? `${prev}\n\n${detail.content}` : detail.content));
      }
    };

    window.addEventListener("open-discipleship-vault", handleOpenVaultEvent);
    return () => window.removeEventListener("open-discipleship-vault", handleOpenVaultEvent);
  }, []);

  // Sync category and tag default when switching paths or opening
  useEffect(() => {
    if (isOpen) {
      if (!selectedCategory) {
        setSelectedCategory(context.category);
      }
      if (scriptureTags.length === 0 && context.suggestedTag) {
        setScriptureTags([context.suggestedTag]);
      }
      try {
        const sel = window.getSelection()?.toString().trim();
        if (sel && sel.length > 3 && sel.length < 300) {
          setSelectedQuoteText(sel);
        } else {
          setSelectedQuoteText("");
        }
      } catch {
        setSelectedQuoteText("");
      }
    }
  }, [isOpen, pathname]);

  // Global Keyboard Shortcut: Alt + N toggles the slide-out Discipleship Vault side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStudy) return;

      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStudy, isOpen]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && activeTab === "write") {
      const t = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, activeTab]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !scriptureTags.includes(trimmed)) {
      setScriptureTags([...scriptureTags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setScriptureTags(scriptureTags.filter((t) => t !== tag));
  };

  const handleInsertQuote = () => {
    if (!selectedQuoteText) return;
    const formatted = `\n> "${selectedQuoteText}"\n\n`;
    setNoteContent((prev) => prev + formatted);
    setSelectedQuoteText("");
    textareaRef.current?.focus();
  };

  const handleInsertSnippet = (type: "bullet" | "quote" | "scripture") => {
    let snippet = "";
    if (type === "bullet") snippet = "\n- ";
    if (type === "quote") snippet = '\n> "..."\n';
    if (type === "scripture") snippet = `\n**Scripture (${context.contextName}):** `;

    setNoteContent((prev) => prev + snippet);
    textareaRef.current?.focus();
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() && !noteTitle.trim()) return;

    setIsSaving(true);
    try {
      const generatedId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
            });

      const title =
        noteTitle.trim() ||
        `Discipleship Vault: ${context.contextName} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

      let fullContent = `# ${title}\n\n`;
      fullContent += `*Context: ${context.contextName} • Recorded on ${new Date().toLocaleDateString()}*\n\n`;
      fullContent += noteContent.trim();

      const newNote: StudyNote = {
        id: generatedId,
        title,
        summary: noteContent.trim().substring(0, 160) || `Insight recorded in ${context.contextName}`,
        content: fullContent,
        category: selectedCategory,
        scriptureTags: scriptureTags.length > 0 ? scriptureTags : [context.suggestedTag],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        children: [],
        order: -1
      };

      const existingNotes = loadNotes();
      const updatedNotes = [newNote, ...existingNotes];
      saveNotes(updatedNotes);

      saveNoteToSupabase(newNote).catch((e) => {
        console.warn("Background cloud note sync warning:", e);
      });

      window.dispatchEvent(
        new CustomEvent("stba-note-created", {
          detail: newNote
        })
      );

      setRecentSessionNotes((prev) => [newNote, ...prev]);
      setSaveSuccess(true);
      showConfetti("notebook");

      setTimeout(() => {
        setSaveSuccess(false);
        setNoteTitle("");
        setNoteContent("");
        setScriptureTags([context.suggestedTag]);
      }, 1800);
    } catch (err) {
      console.error("Failed to save Discipleship Vault note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Vertical sliding state for the Discipleship Vault trigger tab
  const [triggerTopPct, setTriggerTopPct] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("stba_quick_note_top_pct");
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed) && parsed >= 10 && parsed <= 90) {
          return parsed;
        }
      }
    } catch {}
    return 50;
  });

  const dragStateRef = useRef<{
    isDragging: boolean;
    startY: number;
    startTopPct: number;
    moved: boolean;
  }>({
    isDragging: false,
    startY: 0,
    startTopPct: 50,
    moved: false
  });

  const handlePointerDownTrigger = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      isDragging: true,
      startY: e.clientY,
      startTopPct: triggerTopPct,
      moved: false
    };
  };

  const handlePointerMoveTrigger = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current.isDragging) return;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.abs(dy) > 5) {
      dragStateRef.current.moved = true;
    }
    if (dragStateRef.current.moved && typeof window !== "undefined") {
      const vh = Math.max(window.innerHeight, 300);
      const deltaPct = (dy / vh) * 100;
      const clampedPct = Math.min(90, Math.max(10, dragStateRef.current.startTopPct + deltaPct));
      setTriggerTopPct(clampedPct);
    }
  };

  const handlePointerUpTrigger = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current.isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const wasMoved = dragStateRef.current.moved;
    dragStateRef.current.isDragging = false;
    if (wasMoved) {
      try {
        localStorage.setItem("stba_quick_note_top_pct", String(triggerTopPct));
      } catch {}
    } else {
      setIsOpen(true);
    }
  };

  // Restricted strictly to the specified study sections
  if (!isStudy) return null;

  return (
    <>
      {/* RIGHT-EDGE SLIDE-OUT TRIGGER TAB (Restricted to specified study sections) */}
      {!isOpen && (
        <div
          id="floating-quick-note-trigger-wrapper"
          style={{ top: `${triggerTopPct}%`, fontFamily: "'Lato', sans-serif" }}
          className="fixed -translate-y-1/2 right-0 z-40 select-none touch-none font-['Lato',sans-serif] not-italic"
        >
          <button
            id="floating-quick-note-trigger"
            type="button"
            onPointerDown={handlePointerDownTrigger}
            onPointerMove={handlePointerMoveTrigger}
            onPointerUp={handlePointerUpTrigger}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="flex items-center gap-2 pl-3.5 pr-3 py-3 rounded-l-2xl rounded-r-none bg-[#0B111E] hover:bg-[#131D31] text-[#F3CF65] font-['Lato',sans-serif] font-bold not-italic text-xs shadow-2xl border border-r-0 border-[#C9973A]/60 cursor-grab active:cursor-grabbing whitespace-nowrap touch-none"
            title="Open slide-out Discipleship Vault side panel • Drag vertically to reposition (Alt+N)"
            aria-label="Open Discipleship Vault side panel"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">
              <PenLine className="w-4 h-4 text-[#C9973A] stroke-[2.2]" />
              {recentSessionNotes.length > 0 && (
                <span className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-[#C9973A] text-stone-950 text-[9px] font-bold flex items-center justify-center">
                  {recentSessionNotes.length}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-wide">
              Discipleship Vault
            </span>
          </button>
        </div>
      )}

      {/* SLIDE-OUT DARK-THEMED 'DISCIPLESHIP VAULT' SIDE PANEL */}
      <AnimatePresence>
        {isOpen && (
          <div
            id="discipleship-vault-side-panel-overlay"
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="fixed inset-0 z-50 overflow-hidden flex justify-end font-['Lato',sans-serif] not-italic"
          >
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Slide-Out Dark Side Panel */}
            <motion.aside
              id="discipleship-vault-side-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 230 }}
              style={{ fontFamily: "'Lato', sans-serif" }}
              className="relative w-full max-w-xl h-full bg-[#0B111E] border-l border-[#C9973A]/40 shadow-2xl flex flex-col justify-between text-stone-100 font-['Lato',sans-serif] not-italic z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* PANEL HEADER */}
              <div className="p-5 bg-[#0F172A] border-b border-[#C9973A]/30 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0 text-left">
                  <div className="p-2.5 rounded-xl bg-[#C9973A]/15 text-[#F3CF65] border border-[#C9973A]/40 shrink-0">
                    <PenLine className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="text-base font-bold text-white not-italic tracking-wide truncate"
                    >
                      Discipleship Vault • Sacred Outline Mapper
                    </h3>
                    <p
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="text-xs text-[#C9973A] not-italic truncate flex items-center gap-1.5 mt-0.5"
                    >
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>Active Section: {context.contextName}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 border border-stone-800 transition-colors cursor-pointer"
                  title="Close Discipleship Vault (Esc)"
                  aria-label="Close Discipleship Vault"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TAB SELECTOR: WRITE VS RECENT */}
              <div className="flex border-b border-stone-800 bg-[#0D1526] px-5 pt-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  style={{ fontFamily: "'Lato', sans-serif" }}
                  className={`pb-2.5 px-3.5 text-xs font-bold not-italic border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "write"
                      ? "border-[#C9973A] text-[#F3CF65]"
                      : "border-transparent text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Record Study Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("recent")}
                  style={{ fontFamily: "'Lato', sans-serif" }}
                  className={`pb-2.5 px-3.5 text-xs font-bold not-italic border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "recent"
                      ? "border-[#C9973A] text-[#F3CF65]"
                      : "border-transparent text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Vault Session Notes ({recentSessionNotes.length})</span>
                </button>
              </div>

              {/* TAB 1: WRITE NEW VAULT NOTE */}
              {activeTab === "write" && (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 text-left">
                  {/* Note Title */}
                  <div>
                    <label
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="block text-xs font-bold uppercase tracking-wider text-stone-300 not-italic mb-1.5"
                    >
                      Note Title & Sacred Pillar
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder={`e.g., Insight on ${context.contextName}`}
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="w-full bg-[#141E33] border border-[#2E3E5C] focus:border-[#C9973A] text-white text-sm px-3.5 py-2.5 rounded-xl outline-none placeholder:text-stone-500 not-italic"
                    />
                  </div>

                  {/* Category Pills */}
                  <div>
                    <label
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="block text-xs font-bold uppercase tracking-wider text-stone-300 not-italic mb-1.5"
                    >
                      Theological Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: "theology", label: "Theology & Doctrine" },
                          { id: "biblical-studies", label: "Biblical Studies" },
                          { id: "personal-growth", label: "Personal Growth" },
                          { id: "history", label: "Prophetic History" }
                        ] as const
                      ).map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{ fontFamily: "'Lato', sans-serif" }}
                            className={`text-xs px-3 py-1.5 rounded-lg not-italic transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#C9973A] text-stone-950 font-bold shadow"
                                : "bg-[#141E33] text-stone-300 border border-[#2E3E5C] hover:border-[#C9973A]/50"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Quote Banner Helper */}
                  {selectedQuoteText && (
                    <div className="p-3 rounded-xl bg-[#C9973A]/10 border border-[#C9973A]/35 text-stone-200 text-xs flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] uppercase font-bold text-[#F3CF65] block not-italic">
                          Selected Scripture / Lesson Text Detected:
                        </span>
                        <p className="text-xs text-stone-300 line-clamp-2 not-italic mt-1">
                          &ldquo;{selectedQuoteText}&rdquo;
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleInsertQuote}
                        className="px-2.5 py-1.5 bg-[#C9973A] hover:bg-[#d8a544] text-stone-950 text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
                      >
                        + Insert Quote
                      </button>
                    </div>
                  )}

                  {/* Content Textarea */}
                  <div className="relative flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        style={{ fontFamily: "'Lato', sans-serif" }}
                        className="text-xs font-bold uppercase tracking-wider text-stone-300 not-italic"
                      >
                        Scripture Insight / Exegesis Outline
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInsertSnippet("bullet")}
                          className="px-2 py-1 rounded-lg bg-[#141E33] hover:bg-[#1C2A46] border border-[#2E3E5C] text-stone-200 text-xs flex items-center gap-1 cursor-pointer"
                          title="Add bullet item"
                        >
                          <List className="w-3 h-3 text-[#C9973A]" /> List
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertSnippet("quote")}
                          className="px-2 py-1 rounded-lg bg-[#141E33] hover:bg-[#1C2A46] border border-[#2E3E5C] text-stone-200 text-xs flex items-center gap-1 cursor-pointer"
                          title="Add quotation block"
                        >
                          <Quote className="w-3 h-3 text-[#C9973A]" /> Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertSnippet("scripture")}
                          className="px-2 py-1 rounded-lg bg-[#141E33] hover:bg-[#1C2A46] border border-[#2E3E5C] text-stone-200 text-xs flex items-center gap-1 cursor-pointer"
                          title="Add scripture note marker"
                        >
                          <BookOpen className="w-3 h-3 text-[#C9973A]" /> Scripture
                        </button>
                      </div>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleSaveNote();
                        }
                      }}
                      placeholder="Record your biblical insights, cross-references, doctrinal ties, and personal applications in the Discipleship Vault..."
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="w-full min-h-[240px] bg-[#141E33] border border-[#2E3E5C] focus:border-[#C9973A] text-white text-sm p-4 rounded-xl outline-none placeholder:text-stone-500 not-italic leading-relaxed resize-none"
                    />
                    <div className="text-[11px] text-stone-400 text-right mt-1 not-italic">
                      Press <kbd className="px-1.5 py-0.5 bg-stone-800 rounded text-stone-200">Ctrl+Enter</kbd> to save to Vault
                    </div>
                  </div>

                  {/* Tags & Scripture References */}
                  <div>
                    <label
                      style={{ fontFamily: "'Lato', sans-serif" }}
                      className="block text-xs font-bold uppercase tracking-wider text-stone-300 not-italic mb-1.5"
                    >
                      Scriptural Foundation Tags
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag (e.g. Dan 8:14, Sanctuary) + Enter"
                        style={{ fontFamily: "'Lato', sans-serif" }}
                        className="flex-1 bg-[#141E33] border border-[#2E3E5C] focus:border-[#C9973A] text-white text-xs px-3 py-2 rounded-xl outline-none placeholder:text-stone-500 not-italic"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-[#141E33] hover:bg-[#1C2A46] border border-[#2E3E5C] text-stone-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        + Add Tag
                      </button>
                    </div>

                    {scriptureTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {scriptureTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9973A]/15 border border-[#C9973A]/35 text-[#F3CF65] text-xs font-bold not-italic"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-400 focus:outline-none ml-0.5 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: RECENT SESSION NOTES */}
              {activeTab === "recent" && (
                <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0 text-left">
                  {recentSessionNotes.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-stone-600 opacity-60" />
                      <p className="text-sm not-italic">No notes recorded yet during this study session.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("write")}
                        className="text-xs text-[#F3CF65] hover:underline font-bold cursor-pointer"
                      >
                        Record your first Discipleship Vault note →
                      </button>
                    </div>
                  ) : (
                    recentSessionNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl bg-[#141E33] border border-[#2E3E5C] hover:border-[#C9973A]/50 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white leading-snug truncate not-italic">
                            {note.title}
                          </h4>
                          <span className="text-xs text-stone-400 shrink-0 not-italic">
                            {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed whitespace-pre-wrap not-italic">
                          {note.summary || note.content}
                        </p>
                        {note.scriptureTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {note.scriptureTags.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] font-bold text-[#F3CF65] bg-[#C9973A]/15 px-2 py-0.5 rounded not-italic"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="p-4 bg-[#0F172A] border-t border-[#C9973A]/30 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/notebook");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#141E33] hover:bg-[#1C2A46] border border-[#2E3E5C] text-xs font-bold text-stone-200 hover:text-[#F3CF65] flex items-center gap-1.5 transition-colors cursor-pointer not-italic"
                  title="Open Full Discipleship Vault"
                >
                  <span>Open Full Vault</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {saveSuccess ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-in fade-in not-italic">
                      <Check className="w-4 h-4" />
                      <span>Saved to Discipleship Vault!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isSaving || (!noteContent.trim() && !noteTitle.trim())}
                      onClick={handleSaveNote}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#C9973A] hover:bg-[#D9A74A] text-stone-950 font-bold text-xs shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer not-italic"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>{isSaving ? "Synchronizing to Vault..." : "Save to Discipleship Vault"}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
