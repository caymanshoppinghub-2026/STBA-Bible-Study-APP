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
  Hash,
  List,
  ExternalLink,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Trash2,
  Tag
} from "lucide-react";
import { loadNotes, saveNotes, CATEGORY_META } from "../../data/notebookData";
import { saveNoteToSupabase } from "../../lib/notebookSync";
import { StudyNote, NoteCategory } from "../../types/notebook";
import { useApp } from "../../context/AppContext";

/**
 * Determines whether the current route represents an active study mode or lesson context.
 */
export function isStudyModeRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/stba") ||
    pathname.startsWith("/recall") ||
    pathname.startsWith("/teach") ||
    pathname.startsWith("/tracks") ||
    pathname.startsWith("/doctrine") ||
    pathname.startsWith("/sabbath-school") ||
    pathname.startsWith("/vault")
  );
}

/**
 * Derives a human-readable title and default tags for the current study mode context.
 */
function resolveCurrentContext(pathname: string): {
  contextName: string;
  category: Exclude<NoteCategory, "all">;
  suggestedTag: string;
} {
  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    return {
      contextName: "Bible Study Overview",
      category: "theology",
      suggestedTag: "BibleStudy"
    };
  }
  if (pathname.startsWith("/stba")) {
    return {
      contextName: "STBA Scripture Mastery",
      category: "theology",
      suggestedTag: "STBA-Exegesis"
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
  if (pathname.startsWith("/sabbath-school")) {
    return {
      contextName: "Sabbath School Lesson",
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
  if (pathname.startsWith("/vault")) {
    return {
      contextName: "Memory Vault",
      category: "biblical-studies",
      suggestedTag: "MemoryVault"
    };
  }
  if (pathname.startsWith("/tracks")) {
    // Check if lesson detail
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
    contextName: "Study Lesson",
    category: "theology",
    suggestedTag: "ScriptureStudy"
  };
}

export const FloatingQuickNote: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { showConfetti } = useApp();

  const isStudy = isStudyModeRoute(pathname);

  // Floating Window States
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  // Sync category and tag default when switching paths or opening
  useEffect(() => {
    if (isOpen) {
      if (!selectedCategory) {
        setSelectedCategory(context.category);
      }
      if (scriptureTags.length === 0 && context.suggestedTag) {
        setScriptureTags([context.suggestedTag]);
      }
      // Attempt to inspect selected text on page
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

  // Global Keyboard Shortcut: Alt + N toggles the quick note window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStudy) return;

      // Alt+N (or Option+N on Mac)
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      } else if (e.key === "Escape" && isOpen && !isMinimized) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStudy, isOpen, isMinimized]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === "write") {
      const t = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized, activeTab]);

  // Add Tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !scriptureTags.includes(trimmed)) {
      setScriptureTags([...scriptureTags, trimmed]);
      setTagInput("");
    }
  };

  // Remove Tag
  const handleRemoveTag = (tag: string) => {
    setScriptureTags(scriptureTags.filter((t) => t !== tag));
  };

  // Insert Selected Quote
  const handleInsertQuote = () => {
    if (!selectedQuoteText) return;
    const formatted = `\n> "${selectedQuoteText}"\n\n`;
    setNoteContent((prev) => prev + formatted);
    setSelectedQuoteText("");
    textareaRef.current?.focus();
  };

  // Quick Markdown Helper: insert bullet list, quote, or bold
  const handleInsertSnippet = (type: "bullet" | "quote" | "scripture") => {
    let snippet = "";
    if (type === "bullet") snippet = "\n- ";
    if (type === "quote") snippet = '\n> "..."\n';
    if (type === "scripture") snippet = `\n**Scripture (${context.contextName}):** `;

    setNoteContent((prev) => prev + snippet);
    textareaRef.current?.focus();
  };

  // Save Note to Notebook
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
        `Insight: ${context.contextName} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`;

      // Create structured Markdown content
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

      // 1. Save to local storage
      const existingNotes = loadNotes();
      const updatedNotes = [newNote, ...existingNotes];
      saveNotes(updatedNotes);

      // 2. Sync to backend & Supabase
      saveNoteToSupabase(newNote).catch((e) => {
        console.warn("Background cloud note sync warning:", e);
      });

      // 3. Dispatch global event so open notebook tabs can update
      window.dispatchEvent(
        new CustomEvent("stba-note-created", {
          detail: newNote
        })
      );

      // 4. Update session memory
      setRecentSessionNotes((prev) => [newNote, ...prev]);

      // 5. Success state
      setSaveSuccess(true);
      showConfetti("notebook");

      setTimeout(() => {
        setSaveSuccess(false);
        setNoteTitle("");
        setNoteContent("");
        setScriptureTags([context.suggestedTag]);
      }, 1800);
    } catch (err) {
      console.error("Failed to save quick note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // If not on study mode, do not render
  if (!isStudy) return null;

  return (
    <>
      {/* FLOATING ACTION BUTTON (TRIGGER) - Tucked at mid-screen with smooth hover slide-out and occasional nudge */}
      {!isOpen && (
        <div
          id="floating-quick-note-trigger-wrapper"
          className="fixed top-1/2 -translate-y-1/2 right-0 z-40 select-none group"
        >
          {/* Nudge animation wrapper: subtle occasional peek every 5.5s, pauses on hover */}
          <div className="animate-quick-note-nudge group-hover:animate-none">
            <button
              id="floating-quick-note-trigger"
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 sm:py-3 rounded-l-full rounded-r-none bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B38A38] text-stone-950 font-sans font-bold text-xs sm:text-sm shadow-xl shadow-black/50 hover:shadow-[#C5A059]/40 border border-r-0 border-[#FFE7A3]/70 cursor-pointer whitespace-nowrap transform translate-x-[calc(100%-42px)] group-hover:translate-x-0 focus:translate-x-0 focus-visible:translate-x-0 transition-transform duration-300 ease-out will-change-transform"
              title="Quick Note: Jot down lesson insights immediately (Alt+N)"
              aria-label="Open Quick Note window"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <PenLine className="w-4 h-4 text-stone-950 stroke-[2.2] group-hover:rotate-12 transition-transform duration-200" />
              </div>
              <span className="tracking-wide">Quick Note</span>
              {recentSessionNotes.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-stone-950 text-[#C5A059] text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                  {recentSessionNotes.length}
                </span>
              )}
              <span className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-950/15 text-stone-900 font-semibold tracking-wider shrink-0">
                Alt+N
              </span>
            </button>
          </div>
        </div>
      )}

      {/* MINIMIZED FLOATING PILL */}
      {isOpen && isMinimized && (
        <div
          id="floating-quick-note-minimized"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#0c182b] border border-[#C5A059]/50 shadow-2xl text-stone-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="font-semibold text-[11px] text-[#C5A059] font-sans">
              Quick Note: {noteTitle || context.contextName}
            </span>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-white/10 rounded-full text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Expand note"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-500/20 rounded-full text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Close note"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED FLOATING QUICK NOTE WINDOW */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            id="floating-quick-note-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col rounded-2xl bg-[#0c192d]/98 border border-[#C5A059]/40 shadow-2xl shadow-black/90 backdrop-blur-2xl text-stone-100 overflow-hidden font-sans"
          >
            {/* WINDOW HEADER */}
            <div className="px-4 py-3 bg-[#11223b] border-b border-[#C5A059]/25 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                  <PenLine className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                      Quick Scripture Insight
                    </h3>
                  </div>
                  <p className="text-[10px] text-[#C5A059] font-mono truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>In: {context.contextName}</span>
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Minimize window"
                  aria-label="Minimize"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Close window (Esc)"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB SELECTOR: WRITE VS RECENT */}
            <div className="flex border-b border-stone-800 bg-[#0c182b] px-4 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "write"
                    ? "border-[#C5A059] text-[#C5A059]"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>New Insight</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("recent")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "recent"
                    ? "border-[#C5A059] text-[#C5A059]"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Session Notes ({recentSessionNotes.length})</span>
              </button>
            </div>

            {/* TAB 1: WRITE NEW NOTE */}
            {activeTab === "write" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 text-left">
                {/* Note Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Note Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`e.g., Insight on ${context.contextName}`}
                    className="w-full bg-[#142338] border border-stone-700 focus:border-[#C5A059] text-stone-100 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-stone-500 font-sans"
                  />
                </div>

                {/* Category Pills */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Category Subject
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: "theology", label: "Theology" },
                        { id: "biblical-studies", label: "Biblical Studies" },
                        { id: "personal-growth", label: "Personal Growth" },
                        { id: "history", label: "History" }
                      ] as const
                    ).map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-sans transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#C5A059] text-stone-950 font-bold shadow"
                              : "bg-[#142338] text-stone-300 border border-stone-700 hover:border-stone-500"
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
                  <div className="p-2.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-stone-200 text-xs flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#C5A059] block">
                        Selected Text Detected:
                      </span>
                      <p className="text-[11px] text-stone-300 line-clamp-2 italic mt-0.5">
                        &ldquo;{selectedQuoteText}&rdquo;
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleInsertQuote}
                      className="px-2 py-1 bg-[#C5A059] hover:bg-[#d8a544] text-stone-950 text-[10px] font-bold rounded shrink-0 transition-colors cursor-pointer"
                    >
                      + Quote
                    </button>
                  </div>
                )}

                {/* Content Textarea */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                      Scripture Insight / Reflection
                    </label>
                    {/* Quick Formatting Tools */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleInsertSnippet("bullet")}
                        className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Add bullet item"
                      >
                        <List className="w-3 h-3" /> List
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertSnippet("quote")}
                        className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Add quotation block"
                      >
                        <Quote className="w-3 h-3" /> Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertSnippet("scripture")}
                        className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Add scripture note marker"
                      >
                        <BookOpen className="w-3 h-3" /> Scripture
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
                    placeholder="Jot down biblical insights, cross-references, doctrinal ties, or personal applications..."
                    className="w-full h-36 bg-[#142338] border border-stone-700 focus:border-[#C5A059] text-stone-100 text-xs p-3 rounded-lg outline-none placeholder:text-stone-500 font-sans leading-relaxed resize-none"
                  />
                  <div className="text-[9px] text-stone-500 font-mono text-right mt-0.5">
                    Press <kbd className="px-1 py-0.5 bg-stone-800 rounded text-stone-300">Ctrl+Enter</kbd> to save
                  </div>
                </div>

                {/* Tags & Scripture References */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Tags & Scriptures
                  </label>
                  <div className="flex items-center gap-1.5 mb-2">
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
                      className="flex-1 bg-[#142338] border border-stone-700 focus:border-[#C5A059] text-stone-100 text-xs px-2.5 py-1.5 rounded-lg outline-none placeholder:text-stone-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Render Tags */}
                  {scriptureTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {scriptureTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-mono"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-400 focus:outline-none"
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 text-left">
                {recentSessionNotes.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-stone-600 opacity-60" />
                    <p className="text-xs">No insights jotted down yet during this study session.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      className="text-xs text-[#C5A059] hover:underline font-semibold"
                    >
                      Create your first quick note →
                    </button>
                  </div>
                ) : (
                  recentSessionNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-[#142338] border border-stone-700/80 hover:border-[#C5A059]/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white leading-snug truncate">
                          {note.title}
                        </h4>
                        <span className="text-[9px] font-mono text-stone-400 shrink-0">
                          {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {note.summary || note.content}
                      </p>
                      {note.scriptureTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {note.scriptureTags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.2 rounded"
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
            <div className="p-3 bg-[#11223b] border-t border-[#C5A059]/25 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/notebook");
                }}
                className="text-[11px] text-stone-400 hover:text-[#C5A059] flex items-center gap-1 font-sans transition-colors cursor-pointer"
                title="Go to full Scripture Master Notebook"
              >
                <span>Full Notebook</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-2">
                {saveSuccess ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Notebook!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving || (!noteContent.trim() && !noteTitle.trim())}
                    onClick={handleSaveNote}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#B38A38] hover:from-[#d8a544] hover:to-[#C5A059] text-stone-950 font-sans font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save Insight"}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
