import React, { useState, useEffect, useMemo, useRef } from 'react'
import { loadNotes, saveNotes, CATEGORY_META, loadCategories, saveCategories } from '../data/notebookData'
import { StudyNote, NoteCategory, DrawerMode, EditorMode, ChatMessage } from '../types/notebook'
import { NoteRender } from '../components/notebook/NoteRender'
import { NoteErrorBoundary } from '../components/notebook/NoteErrorBoundary'
import { ElderStephenChat } from '../components/notebook/ElderStephenChat'
import { MasteryReview } from '../components/notebook/MasteryReview'
import { 
  BookOpen, Brain, MessageSquare, Plus, Search, Star, 
  Trash2, X, Archive, BookMarked, Calendar, Hash, Notebook as NoteIcon,
  RefreshCw, ChevronLeft, ChevronRight, Download, Type, GripVertical,
  HelpCircle, CheckCircle2, Database, AlertCircle, Sparkles, Sun, Moon
} from 'lucide-react'
import { 
  fetchNotesFromSupabase, 
  deleteNoteFromSupabase, 
  syncAllLocalNotesToSupabase, 
  checkSupabaseConnection,
  fetchCategoriesFromSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  syncAllLocalCategoriesToSupabase,
  checkCategoriesTable,
  getDeterministicUUID
} from '../lib/notebookSync'
import { callElderStephen } from '../lib/callElderStephen'
import { formatProperElderSpacing } from '../utils/elderSpacing'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { useElderStephen } from '../context/ElderStephenContext'
import { useNavigate, useLocation } from 'react-router-dom'

const SCHEMA_SQL = `create table stba_study_notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text,
  content text,
  category text not null,
  scripture_tags text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_favorite boolean default false not null,
  children text[] not null default '{}',
  "order" integer default 0 not null,
  user_id uuid default auth.uid() not null
);

create table stba_study_categories (
  id text primary key,
  label text not null,
  code text not null,
  color text not null,
  "order" integer default 0 not null
);

create table stba_study_highlights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() not null,
  translation text not null,
  verse_reference text not null,
  text_snippet text not null default '',
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table stba_study_notes enable row level security;
alter table stba_study_categories enable row level security;
alter table stba_study_highlights enable row level security;

-- Create policy to enforce user ownership
create policy "Allow owners full access to notes"
  on stba_study_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow owners full access to highlights"
  on stba_study_highlights
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow all public access to categories"
  on stba_study_categories
  for all
  using (true)
  with check (true);`

// Helper for dynamic 2-letter labels on categories without ellipsis
const getCategoryAbbreviation = (catKey: string, currentCode: string) => {
  switch (catKey) {
    case 'all': return 'AL'
    case 'theology': return 'TY'
    case 'history': return 'HY'
    case 'personal-growth': return 'PH'
    case 'biblical-studies': return 'BS'
    case 'custom': return 'CM'
    default: {
      if (currentCode.length >= 2) {
        return currentCode.substring(0, 2).toUpperCase()
      }
      if (currentCode.length === 1) {
        return (currentCode + 'C').toUpperCase().substring(0, 2)
      }
      return 'CC'
    }
  }
}

// Helper for dynamic translucent card colors for vertical tabs
const getCategoryTabBg = (catKey: string, catColor: string, hoverState: boolean = false) => {
  const opacity = hoverState ? 0.30 : 0.15
  const defaults: Record<string, string> = {
    all: `rgba(154,148,144,${opacity})`,
    theology: `rgba(197,160,89,${opacity})`,
    history: `rgba(123,158,190,${opacity})`,
    'personal-growth': `rgba(168,197,160,${opacity})`,
    'biblical-studies': `rgba(78,205,196,${opacity})`,
    custom: `rgba(192,132,252,${opacity})`
  }
  
  if (defaults[catKey]) return defaults[catKey]
  
  // Convert hex catColor to rgba
  let hex = catColor || '#C5A059'
  if (hex.startsWith('#')) {
    hex = hex.slice(1)
  }
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }
  const r = parseInt(hex.substring(0, 2), 16) || 197
  const g = parseInt(hex.substring(2, 4), 16) || 160
  const b = parseInt(hex.substring(4, 6), 16) || 89
  return `rgba(${r},${g},${b},${opacity})`
}

// Helper for dynamic card colors
const getCategoryColor = (catKey: string, cat: { color: string }) => {
  const defaults: Record<string, string> = {
    all: '#9A9490',
    theology: '#C5A059',
    history: '#7B9EBE',
    'personal-growth': '#A8C5A0',
    'biblical-studies': '#4ECDC4',
    custom: '#C084FC'
  }
  return defaults[catKey] || cat.color || '#C5A059'
}

interface NoteCardProps {
  noteItem: StudyNote;
  isChild?: boolean;
  selectedNoteId: string;
  setSelectedNoteId: (id: string) => void;
  setMobileTab: (tab: 'notes' | 'study' | 'review' | 'elder') => void;
  expandedParentIds: Record<string, boolean>;
  toggleParentExpanded: (parentId: string, e?: React.MouseEvent) => void;
  draggedNoteId: string | null;
  dragOverNoteId: string | null;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDragLeave: (e: React.DragEvent, id: string) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, id: string) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<{ x: number; y: number; noteId: string } | null>>;
  categories: Record<string, { label: string; code: string; color: string }>;
  handleUpdateNoteFieldById: (noteId: string, fields: Partial<StudyNote>) => void;
  handleToggleFavorite: (id: string) => void;
  handleDeleteNote: (id: string, e?: React.MouseEvent) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  editingField: 'category' | 'title' | 'scripture' | null;
  setEditingField: (field: 'category' | 'title' | 'scripture' | null) => void;
  editTempText: string;
  setEditTempText: (text: string) => void;
  notes: StudyNote[];
  user: any;
}

const NoteCard: React.FC<NoteCardProps> = ({
  noteItem,
  isChild = false,
  selectedNoteId,
  setSelectedNoteId,
  setMobileTab,
  expandedParentIds,
  toggleParentExpanded,
  draggedNoteId,
  dragOverNoteId,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDragEnd,
  handleDrop,
  setContextMenu,
  categories,
  handleUpdateNoteFieldById,
  handleToggleFavorite,
  handleDeleteNote,
  editingNoteId,
  setEditingNoteId,
  editingField,
  setEditingField,
  editTempText,
  setEditTempText,
  notes,
  user,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Outside click logic: listen to mousedown and touchstart globally
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Listen to close events from other cards
  useEffect(() => {
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.exceptId !== noteItem.id) {
        setIsOpen(false);
      }
    };
    window.addEventListener("close-all-note-dropdowns", handleCloseOthers);
    return () => {
      window.removeEventListener("close-all-note-dropdowns", handleCloseOthers);
    };
  }, [noteItem.id]);

  const handleToggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      window.dispatchEvent(
        new CustomEvent("close-all-note-dropdowns", {
          detail: { exceptId: noteItem.id },
        })
      );
    }
  };

  const isActive = noteItem.id === selectedNoteId;
  const meta = categories[noteItem.category] || categories.custom;
  const hasChildren = noteItem.children && noteItem.children.length > 0;
  const isExpanded = noteItem.expanded === true || !!expandedParentIds[noteItem.id];
  const childNotes = (noteItem.children || [])
    .map((cid) => notes.find((n) => n.id === cid))
    .filter((n): n is StudyNote => !!n);

  const childrenRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (!isExpanded) {
      setHeight("0px");
      return;
    }
    const updateHeight = () => {
      if (childrenRef.current) {
        setHeight(`${childrenRef.current.scrollHeight}px`);
      }
    };
    updateHeight();
    if (typeof ResizeObserver !== "undefined" && childrenRef.current) {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(childrenRef.current);
      return () => observer.disconnect();
    }
  }, [isExpanded, childNotes, notes, expandedParentIds]);

  return (
    <div key={noteItem.id} className="space-y-1 overflow-visible">
      <div
        id={`note-card-${noteItem.id}`}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, noteItem.id)}
        onDragOver={(e) => handleDragOver(e, noteItem.id)}
        onDragLeave={(e) => handleDragLeave(e, noteItem.id)}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(e, noteItem.id)}
        onClick={(e) => {
          setSelectedNoteId(noteItem.id);
          setMobileTab("notes");
          toggleParentExpanded(noteItem.id, e);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ x: e.clientX, y: e.clientY, noteId: noteItem.id });
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) {
            const clientX = touch.clientX;
            const clientY = touch.clientY;
            const currentTarget = e.currentTarget;
            (currentTarget as any)._longPressTimer = setTimeout(() => {
              setContextMenu({ x: clientX, y: clientY, noteId: noteItem.id });
            }, 700);
          }
        }}
        onTouchEnd={(e) => {
          if ((e.currentTarget as any)._longPressTimer) {
            clearTimeout((e.currentTarget as any)._longPressTimer);
          }
        }}
        className={`group cursor-grab active:cursor-grabbing relative flex flex-col gap-2 select-none overflow-visible transition-all duration-200 ${
          isChild
            ? "w-full ml-0 px-3 py-2.5 rounded-[6px] border border-[var(--nb-border)]/30"
            : "w-[94%] mx-auto px-4 py-3.5 rounded-[8px]"
        } ${
          isActive
            ? "bg-[rgba(197,160,89,0.12)] shadow-sm"
            : `${isChild ? "bg-stone-900/50" : "bg-[var(--nb-card)]"} hover:bg-[rgba(197,160,89,0.06)] hover:shadow-[0_0_0_1px_var(--nb-border)]`
        } ${
          draggedNoteId === noteItem.id
            ? "opacity-60 border border-dashed border-[var(--nb-gold)] cursor-grabbing"
            : ""
        }`}
        style={{
          borderLeftWidth: "2px",
          borderLeftStyle: "solid",
          borderLeftColor:
            dragOverNoteId === noteItem.id
              ? "var(--nb-gold)"
              : isActive
              ? "var(--nb-gold)"
              : "transparent",
          backgroundColor:
            dragOverNoteId === noteItem.id
              ? "rgba(197, 160, 89, 0.08)"
              : undefined,
          transition: "transform 160ms ease, opacity 160ms ease",
        }}
      >
        <div className="flex gap-2.5 items-start w-full overflow-visible">
          {/* Six-dot Grip Handle */}
          <div
            className="flex items-center justify-center text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] pt-1 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
            title="Drag handle"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Note Content Block */}
          <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-visible">
            {/* Card heading info bar */}
            <div className="flex items-center justify-between gap-1 overflow-visible relative">
              <div className="flex items-center gap-1.5 shrink-0 overflow-visible">
                {/* Chevron toggler for Parent notes */}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleParentExpanded(noteItem.id);
                    }}
                    className="p-0.5 rounded text-[var(--nb-gold)] hover:bg-stone-800/40 transition-colors cursor-pointer shrink-0"
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 transform ${
                        isExpanded ? "rotate-90" : "rotate-0"
                      }`}
                      style={{ transition: "transform 160ms ease" }}
                    />
                  </button>
                )}

                <div
                  className="relative shrink-0 overflow-visible"
                  id={`cat-dropdown-container-${noteItem.id}`}
                  ref={dropdownRef}
                >
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] shrink-0 flex items-center justify-center text-[#080808] hover:brightness-110 active:brightness-95 transition-all cursor-pointer ${
                      isOpen
                        ? "ring-2 ring-[var(--nb-gold)] ring-offset-2 ring-offset-stone-900 border border-[var(--nb-gold)] scale-105"
                        : ""
                    }`}
                    style={{ backgroundColor: getCategoryColor(noteItem.category, meta) }}
                    title="Click to change category"
                    onClick={(e) => {
                      handleToggleDropdown();
                    }}
                  >
                    {meta.label}
                  </span>

                  {isOpen && (
                    <div
                      className="absolute z-[9999] left-0 mt-1.5 w-44 max-h-48 overflow-y-auto rounded-lg border border-[#2C3545]/60 bg-[#111010]/95 backdrop-blur text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.keys(categories)
                        .filter((catKey) => catKey !== "all")
                        .map((cat) => {
                          const isSelected = noteItem.category === cat;
                          const catMeta = categories[cat];
                          const nameLabel = catMeta?.label || cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateNoteFieldById(noteItem.id, {
                                  category: cat as any,
                                });
                                setIsOpen(false);
                              }}
                              className="w-full px-2.5 py-1.5 text-left text-[11px] transition-all flex items-center justify-between cursor-pointer border-b border-white/5 last:border-b-0 hover:bg-stone-800"
                              style={{
                                backgroundColor: getCategoryTabBg(
                                  cat,
                                  catMeta?.color || "#999",
                                  isSelected
                                ),
                                borderLeftWidth: "3px",
                                borderLeftColor: catMeta?.color || "#999",
                              }}
                            >
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <span
                                  className="w-[18px] h-[15px] flex items-center justify-center text-[8px] font-mono font-bold rounded shrink-0"
                                  style={{
                                    backgroundColor: "rgba(0,0,0,0.25)",
                                    color: catMeta?.color || "#999",
                                    border: `1px solid ${catMeta?.color}33`,
                                  }}
                                >
                                  {getCategoryAbbreviation(cat, catMeta?.code || "C")}
                                </span>
                                <span
                                  className={`truncate font-sans ${
                                    isSelected
                                      ? "font-bold text-white"
                                      : "text-stone-300 hover:text-white"
                                  }`}
                                  style={
                                    isSelected
                                      ? { color: catMeta?.color || "#999" }
                                      : undefined
                                  }
                                >
                                  {nameLabel}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="text-emerald-500 font-bold text-[10px]">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 z-10">
                {/* Interactive Favorite Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(noteItem.id);
                  }}
                  className="p-1 rounded text-[var(--nb-text-dim)] hover:text-[var(--nb-gold)] hover:bg-stone-800/40 transition-colors cursor-pointer"
                  title={noteItem.isFavorite ? "Unfavorite Note" : "Favorite Note"}
                  id={`btn-fav-card-${noteItem.id}`}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-all ${
                      noteItem.isFavorite
                        ? "text-[var(--nb-gold)] fill-[var(--nb-gold)]"
                        : "text-stone-700 hover:text-stone-400"
                    }`}
                  />
                </button>

                {/* Hover Trash Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(noteItem.id, e);
                  }}
                  className="p-1 rounded text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] bg-transparent hover:bg-stone-850/50 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                  title="Purge study note"
                  id={`btn-del-note-${noteItem.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Title details */}
            {editingNoteId === noteItem.id && editingField === "title" ? (
              <div className="w-full" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTempText}
                  onChange={(e) => setEditTempText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateNoteFieldById(noteItem.id, {
                        title: editTempText.trim() || "Untitled note",
                      });
                      setEditingNoteId(null);
                      setEditingField(null);
                    } else if (e.key === "Escape") {
                      setEditingNoteId(null);
                      setEditingField(null);
                    }
                  }}
                  onBlur={() => {
                    handleUpdateNoteFieldById(noteItem.id, {
                      title: editTempText.trim() || "Untitled note",
                    });
                    setEditingNoteId(null);
                    setEditingField(null);
                  }}
                  className="w-full bg-stone-900 border border-[var(--nb-border-gold)] rounded px-1.5 py-0.5 text-[13px] font-sans font-semibold text-[var(--nb-text)] focus:outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h3
                className="text-[13px] font-sans font-semibold text-[var(--nb-text)] line-clamp-2 leading-[1.3] cursor-text select-text"
                title="Double-click to edit title"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNoteId(noteItem.id);
                  setEditingField("title");
                  setEditTempText(noteItem.title || "");
                }}
              >
                {noteItem.title || "Untitled note"}
              </h3>
            )}

            {/* Summary lines */}
            <p className="text-[11px] font-sans text-[var(--nb-text-muted)] line-clamp-2 leading-[1.45]">
              {noteItem.summary || "Insight logs ready."}
            </p>

            {/* Bottom Metadata row */}
            <div className="flex items-center justify-between gap-2 mt-1 border-t border-[var(--nb-border)]/30 pt-2 w-full overflow-hidden">
              <div
                className="flex items-center gap-1 overflow-hidden shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {editingNoteId === noteItem.id && editingField === "scripture" ? (
                  <input
                    type="text"
                    value={editTempText}
                    onChange={(e) => setEditTempText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const currentTags = [...(noteItem.scriptureTags || [])];
                        if (editTempText.trim()) {
                          if (currentTags.length > 0) {
                            currentTags[0] = editTempText.trim();
                          } else {
                            currentTags.push(editTempText.trim());
                          }
                        } else {
                          currentTags.shift();
                        }
                        handleUpdateNoteFieldById(noteItem.id, {
                          scriptureTags: currentTags,
                        });
                        setEditingNoteId(null);
                        setEditingField(null);
                      } else if (e.key === "Escape") {
                        setEditingNoteId(null);
                        setEditingField(null);
                      }
                    }}
                    onBlur={() => {
                      const currentTags = [...(noteItem.scriptureTags || [])];
                      if (editTempText.trim()) {
                        if (currentTags.length > 0) {
                          currentTags[0] = editTempText.trim();
                        } else {
                          currentTags.push(editTempText.trim());
                        }
                      } else {
                        currentTags.shift();
                      }
                      handleUpdateNoteFieldById(noteItem.id, {
                        scriptureTags: currentTags,
                      });
                      setEditingNoteId(null);
                      setEditingField(null);
                    }}
                    className="bg-stone-900 border border-[var(--nb-border-gold)] text-[9px] font-mono rounded px-1 py-0.5 text-[var(--nb-gold)] focus:outline-none max-w-[100px]"
                    autoFocus
                  />
                ) : (
                  <>
                    {(noteItem.scriptureTags || []).length > 0 ? (
                      (noteItem.scriptureTags || []).slice(0, 1).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[9px] font-mono bg-[var(--nb-gold-muted)] border border-[var(--nb-border-gold)] text-[var(--nb-gold)] rounded-[4px] truncate max-w-[100px] cursor-text select-text"
                          title="Double-click to edit scripture tag"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteId(noteItem.id);
                            setEditingField("scripture");
                            setEditTempText(tag || "");
                          }}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-mono bg-stone-900/40 border border-stone-850 text-[var(--nb-text-dim)] hover:text-[var(--nb-gold)] hover:border-[var(--nb-gold-muted)] rounded-[4px] cursor-pointer opacity-40 hover:opacity-100 transition-all"
                        title="Double-click to set scripture"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingNoteId(noteItem.id);
                          setEditingField("scripture");
                          setEditTempText("");
                        }}
                      >
                        + Scripture
                      </span>
                    )}
                    {(noteItem.scriptureTags || []).length > 1 && (
                      <span className="text-[9px] font-mono bg-[var(--nb-gold-muted)] border border-[var(--nb-border-gold)]/35 text-[var(--nb-gold)] rounded-[4px] px-1 py-0.5 font-bold shrink-0">
                        +{(noteItem.scriptureTags || []).length - 1}
                      </span>
                    )}
                  </>
                )}
              </div>

              <span
                className="text-[9px] font-mono text-[var(--nb-text-dim)] shrink-0 text-right mt-[6px]"
                style={{ textAlign: "right" }}
              >
                {new Date(noteItem.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Children rendering */}
      {hasChildren && (
        <>
          <style>{`
            .children-container {
              overflow: hidden;
              transition: max-height 240ms ease, opacity 240ms ease;
            }
          `}</style>
          <div
            ref={childrenRef}
            className="children-container pl-3 border-l border-stone-800 ml-4 space-y-2 mt-1.5"
            style={{
              maxHeight: height,
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
            }}
          >
            {childNotes.map((childNote) => (
              <NoteCard
                key={childNote.id}
                noteItem={childNote}
                isChild={true}
                selectedNoteId={selectedNoteId}
                setSelectedNoteId={setSelectedNoteId}
                setMobileTab={setMobileTab}
                expandedParentIds={expandedParentIds}
                toggleParentExpanded={toggleParentExpanded}
                draggedNoteId={draggedNoteId}
                dragOverNoteId={dragOverNoteId}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDragEnd={handleDragEnd}
                handleDrop={handleDrop}
                setContextMenu={setContextMenu}
                categories={categories}
                handleUpdateNoteFieldById={handleUpdateNoteFieldById}
                handleToggleFavorite={handleToggleFavorite}
                handleDeleteNote={handleDeleteNote}
                editingNoteId={editingNoteId}
                setEditingNoteId={setEditingNoteId}
                editingField={editingField}
                setEditingField={setEditingField}
                editTempText={editTempText}
                setEditTempText={setEditTempText}
                notes={notes}
                user={user}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const NotebookPage: React.FC = () => {
  const { user, showConfetti } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { setStudyMode, updateDocumentContext, setCurrentPassage, currentTopic, studyFlow } = useElderStephen()

  // Core States
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => (location.state as any)?.selectedNoteId || (location.state as any)?.noteId || '')
  const [activeCategory, setActiveCategory] = useState<NoteCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editorMode, setEditorMode] = useState<EditorMode>('read')
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('closed')

  // Supabase states for cloud synchronization
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'checking' | 'connected' | 'table_missing' | 'error' | 'offline'>('checking')
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [showDbConfigInstructions, setShowDbConfigInstructions] = useState<boolean>(false)
  const [syncAlert, setSyncAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [copiedSql, setCopiedSql] = useState(false)
  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }
  
  // History tracking for back/forward navigation
  const [noteHistory, setNoteHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [isMovingHistory, setIsMovingHistory] = useState<boolean>(false)

  // Expanded/collapsed state for the Notebook badge (NB)
  const [nbExpanded, setNbExpanded] = useState<boolean>(false)

  // Double-click editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'category' | 'title' | 'scripture' | null>(null)
  const [editTempText, setEditTempText] = useState('')
  
  // Custom Category State
  const [categories, setCategories] = useState<Record<string, { label: string; code: string; color: string }>>(() => loadCategories())
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatCode, setNewCatCode] = useState('')
  const [newCatColor, setNewCatColor] = useState('#C5A059')
  const [isRailCollapsed, setIsRailCollapsed] = useState(true)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [editingCatKey, setEditingCatKey] = useState<string | null>(null)
  const [editCatNameTemp, setEditCatNameTemp] = useState('')

  // Mobile navigation tabs
  const [mobileTab, setMobileTab] = useState<'notes' | 'study' | 'review' | 'elder'>('notes')

  // Real-time Elder Stephen assistant feedback states for drafting
  const [elderStephenStatus, setElderStephenStatus] = useState<'idle' | 'analyzing' | 'responded' | 'error'>('idle')
  const [elderStephenLiveInsight, setElderStephenLiveInsight] = useState<string>('')
  const writingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sub-note and Context Menu states
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [showSubMenu, setShowSubMenu] = useState<boolean>(false)

  // Reset submenu state when context menu changes
  useEffect(() => {
    if (contextMenu) {
      setShowSubMenu(false)
    }
  }, [contextMenu])

  const [expandedParentIds, setExpandedParentIds] = useState<Record<string, boolean>>({})

  const toggleParentExpanded = (parentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedParentIds(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }))

    const updated = notes.map(n => {
      if (n.id === parentId) {
        return {
          ...n,
          expanded: !n.expanded
        }
      }
      return n
    })
    updateNotesState(updated)
  }

  // Handle outside clicks to close context menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) {
        return // Don't close context menu if click was inside it
      }
      setContextMenu(null)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [])

  const handleAssignSubNote = (childId: string, parentId: string) => {
    const parent = notes.find(n => n.id === parentId)
    if (!parent) return

    const updated = notes.map(n => {
      if (n.id === parentId) {
        const currentChildren = n.children || []
        return {
          ...n,
          children: currentChildren.includes(childId) ? currentChildren : [...currentChildren, childId],
          expanded: true
        }
      }
      if (n.children && n.children.includes(childId)) {
        return {
          ...n,
          children: n.children.filter(cid => cid !== childId)
        }
      }
      return n
    }).map(n => {
      if (n.id === childId) {
        return {
          ...n,
          category: parent.category
        }
      }
      return n
    })

    updateNotesState(updated)
    setExpandedParentIds(prev => ({ ...prev, [parentId]: true }))
  }

  const handleDetachSubNote = (childId: string) => {
    const updated = notes.map(n => {
      if (n.children && n.children.includes(childId)) {
        return {
          ...n,
          children: n.children.filter(cid => cid !== childId)
        }
      }
      return n
    })
    updateNotesState(updated)
  }

  const getPotentialParents = (currentNoteId: string) => {
    const childIdsSet = new Set<string>()
    notes.forEach(n => {
      if (n.children) {
        n.children.forEach(cid => childIdsSet.add(cid))
      }
    })

    return notes.filter(n => {
      if (n.id === currentNoteId) return false
      if (childIdsSet.has(n.id)) return false
      return true
    })
  }

  // Drag and drop states
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedNoteId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedNoteId !== id) {
      setDragOverNoteId(id)
    }
  }

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    if (dragOverNoteId === id) {
      setDragOverNoteId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedNoteId(null)
    setDragOverNoteId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const draggedId = draggedNoteId || e.dataTransfer.getData('text/plain')
    setDraggedNoteId(null)
    setDragOverNoteId(null)

    if (!draggedId || draggedId === targetId) return

    const draggedNote = notes.find(n => n.id === draggedId)
    const targetNote = notes.find(n => n.id === targetId)
    if (!draggedNote || !targetNote) return

    const findParent = (noteId: string) => {
      return notes.find(n => n.children && n.children.includes(noteId))
    }
    const parentOfDragged = findParent(draggedId)
    const parentOfTarget = findParent(targetId)

    const isDraggedChild = !!parentOfDragged
    const isTargetChild = !!parentOfTarget
    const isTargetParentHeader = targetNote.children && targetNote.children.length > 0

    // Case A: Both are sub-notes of the SAME parent
    if (isDraggedChild && isTargetChild && parentOfDragged.id === parentOfTarget.id) {
      const parent = parentOfDragged
      const newChildren = [...(parent.children || [])]
      const dragIdx = newChildren.indexOf(draggedId)
      const targetIdx = newChildren.indexOf(targetId)
      if (dragIdx !== -1 && targetIdx !== -1) {
        newChildren.splice(dragIdx, 1)
        newChildren.splice(targetIdx, 0, draggedId)
        const updatedNotes = notes.map(n => {
          if (n.id === parent.id) {
            return { ...n, children: newChildren }
          }
          return n
        })
        updateNotesState(updatedNotes)
      }
      return
    }

    // Case B: Both are sub-notes of DIFFERENT parents
    if (isDraggedChild && isTargetChild && parentOfDragged.id !== parentOfTarget.id) {
      const updatedNotes = notes.map(n => {
        // Remove from old parent
        if (n.id === parentOfDragged.id) {
          return { ...n, children: (n.children || []).filter(id => id !== draggedId) }
        }
        // Insert into new parent at target index
        if (n.id === parentOfTarget.id) {
          const newChildren = [...(n.children || [])]
          const targetIdx = newChildren.indexOf(targetId)
          if (targetIdx !== -1) {
            newChildren.splice(targetIdx, 0, draggedId)
          } else {
            newChildren.push(draggedId)
          }
          return { ...n, children: newChildren }
        }
        return n
      })
      updateNotesState(updatedNotes)
      return
    }

    // Case C: Dragging a sub-note onto a Parent Header
    if (isDraggedChild && !isTargetChild && isTargetParentHeader) {
      const updatedNotes = notes.map(n => {
        // Remove from old parent
        if (n.id === parentOfDragged.id) {
          return { ...n, children: (n.children || []).filter(id => id !== draggedId) }
        }
        // Append to new parent
        if (n.id === targetId) {
          const currentChildren = n.children || []
          return {
            ...n,
            children: currentChildren.includes(draggedId) ? currentChildren : [...currentChildren, draggedId]
          }
        }
        return n
      })
      updateNotesState(updatedNotes)
      return
    }

    // Case D: Dragging a root note onto a Parent Header
    if (!isDraggedChild && !isTargetChild && isTargetParentHeader) {
      const updatedNotes = notes.map(n => {
        if (n.id === targetId) {
          const currentChildren = n.children || []
          return {
            ...n,
            children: currentChildren.includes(draggedId) ? currentChildren : [...currentChildren, draggedId]
          }
        }
        return n
      })
      updateNotesState(updatedNotes)
      return
    }

    // Case E: Dragging a root note over another Root Note (that is NOT a parent header)
    if (!isDraggedChild && !isTargetChild && !isTargetParentHeader) {
      const rootNotes = notes
        .filter(n => !notes.some(p => p.children && p.children.includes(n.id)))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const dragIdx = rootNotes.findIndex(rn => rn.id === draggedId)
      const targetIdx = rootNotes.findIndex(rn => rn.id === targetId)
      if (dragIdx !== -1 && targetIdx !== -1) {
        const updatedRoot = [...rootNotes]
        const [removed] = updatedRoot.splice(dragIdx, 1)
        updatedRoot.splice(targetIdx, 0, removed)
        
        const updatedNotes = notes.map(n => {
          const rootIndex = updatedRoot.findIndex(rn => rn.id === n.id)
          if (rootIndex !== -1) {
            return { ...n, order: rootIndex }
          }
          return n
        })
        updateNotesState(updatedNotes)
      }
      return
    }

    // Case F: Dragging a sub-note onto a Root-level Note (that is NOT a parent header)
    if (isDraggedChild && !isTargetChild && !isTargetParentHeader) {
      // 1. Remove from parent.children
      let tempNotes = notes.map(n => {
        if (n.id === parentOfDragged.id) {
          return { ...n, children: (n.children || []).filter(id => id !== draggedId) }
        }
        return n
      })
      // 2. Compute root list
      const rootNotes = tempNotes
        .filter(n => !tempNotes.some(p => p.children && p.children.includes(n.id)))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      // 3. Insert draggedId next to targetId
      const dragNodeIndexInRoot = rootNotes.findIndex(rn => rn.id === draggedId)
      if (dragNodeIndexInRoot !== -1) {
        rootNotes.splice(dragNodeIndexInRoot, 1)
      }
      const finalTargetIdx = rootNotes.findIndex(rn => rn.id === targetId)
      if (finalTargetIdx !== -1) {
        const draggedNodeObj = tempNotes.find(n => n.id === draggedId)
        if (draggedNodeObj) {
          rootNotes.splice(finalTargetIdx, 0, draggedNodeObj)
        }
      }
      // 4. Update order values
      const finalNotes = tempNotes.map(n => {
        const rootIndex = rootNotes.findIndex(rn => rn.id === n.id)
        if (rootIndex !== -1) {
          return { ...n, order: rootIndex }
        }
        return n
      })
      updateNotesState(finalNotes)
      return
    }
  }

  // Interactive scripture query helpers
  const [clickedScripture, setClickedScripture] = useState('')

  // FontSize, Theme, and Download states
  const [editorFontSize, setEditorFontSize] = useState<number>(13)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('stba_notebook_theme') as 'light' | 'dark') || 'dark'
  })

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('stba_notebook_theme', nextTheme)
  }

  const downloadNoteAsText = (title: string, content: string) => {
    const createdStr = activeNote?.createdAt || (activeNote as any)?.created_at
    const textData = `--- STBA STUDY NOTE ---\nTitle: ${title}\nCategory: ${activeNote?.category || 'General'}\nCreated: ${createdStr ? new Date(createdStr).toLocaleDateString() : 'N/A'}\n\n${content}`
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_note.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadCSMSSummaryAsText = (title: string) => {
    const cached = localStorage.getItem(`stba_review_v2_${activeNote?.id}`)
    let details = ""
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        details = `CSMS STUDY SUMMARY: ${title.toUpperCase()}\n` +
                  `==========================================\n\n` +
                  `BIG IDEA:\n${parsed.bigIdea || ''}\n\n` +
                  `PRINCIPAL POINTS:\n` + (parsed.recap || []).map((p: string, i: number) => `${i+1}. ${p}`).join('\n') + `\n\n` +
                  `CORE SCRIPTURES:\n` + (parsed.scriptures || []).map((s: string) => `- ${s}`).join('\n') + `\n\n` +
                  `PRACTICAL STEPS:\n` + (parsed.practicalSteps || []).map((st: string) => `- ${st}`).join('\n') + `\n\n` +
                  `PASTORAL REFLECTION:\n${parsed.pastoralReflection || ''}\n`
      } catch (e) {
        details = `No parsed review content available. Please verify you've generated the CSMS review session first.`
      }
    } else {
      details = `No local CSMS review cache found for "${title}". Please generate or view the review panel first.`
    }

    const blob = new Blob([details], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_csms_summary.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadElderChatAsText = (title: string) => {
    const chatKey = `stba_elder_${activeNote?.id || 'general'}`
    const saved = localStorage.getItem(chatKey)
    let summaryText = `ELDER STEPHEN CONVERSATION LOG: ${title.toUpperCase()}\n` +
                      `===================================================\n\n`

    if (saved) {
      try {
        const msgs = JSON.parse(saved)
        msgs.forEach((m: any) => {
          const sender = m.role === 'elder' ? 'Elder Stephen' : 'User'
          const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          summaryText += `[${time}] ${sender}:\n${m.text}\n\n`
        })
      } catch (e) {
        summaryText += "Error reading conversation history logs."
      }
    } else {
      summaryText += "No active study session logs recorded with Elder Stephen for this note."
    }

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_elder_conversation.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadWord = (title: string, content: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Scripture Mastery Note</title><style>body { font-family: 'Arial', sans-serif; line-height: 1.6; padding: 20px; } h1 { color: #8F703B; border-bottom: 2px solid #8F703B; padding-bottom: 5px; font-family: 'Times New Roman', serif; } h2 { color: #4A9C96; }</style></head><body>";
    const footer = "</body></html>";
    
    let html = content;
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    html = html.replace(/^\*(.*?)\*/gm, '<em>$1</em>');
    html = html.replace(/^\- (.*?)$/gm, '<ul><li>$1</li></ul>');
    html = html.replace(/^\* (.*?)$/gm, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    html = html.replace(/\n/g, '<br/>');

    const sourceHTML = header + `<h1>${title}</h1>` + html + footer;
    const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_note.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (title: string, content: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    let html = content;
    html = html.replace(/^# (.*?)$/gm, '<h1 style="font-family:\'Playfair Display\', serif; color: #1e1b18; font-size: 24pt; border-bottom: 1.5pt solid #c5a059; padding-bottom: 6px; margin-top: 18pt; margin-bottom: 12pt;">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 style="font-family:\'Inter\', sans-serif; color: #4ab9b3; font-size: 16pt; margin-top: 16pt; margin-bottom: 8pt;">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-family:\'Inter\', sans-serif; color: #555; font-size: 12pt; margin-top: 12pt; margin-bottom: 6pt;">$1</h3>');
    html = html.replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
    html = html.replace(/^\*(.*?)\*/gm, '<em>$1</em>');
    html = html.replace(/^\- (.*?)$/gm, '<li style="margin-bottom: 4pt;">$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li style="margin-bottom: 4pt;">$1</li>');
    html = html.replace(/\r?\n/g, '<br/>');
    html = html.replace(/(<li>.*?<\/li>)/g, '<ul style="margin-top: 4pt; margin-bottom: 4pt; padding-left: 20px;">$1</ul>');
    html = html.replace(/<\/ul>\s*<ul style="margin-top: 4pt; margin-bottom: 4pt; padding-left: 20px;">/g, '');

    const printDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            color: #2D3748;
            line-height: 1.6;
            padding: 40px;
            background: #fff;
            font-size: 11pt;
          }
          h1, h2, h3 { page-break-after: avoid; }
          .header {
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 10px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header-title {
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #718096;
            font-weight: 600;
          }
          .header-date { font-size: 9pt; color: #A0AEC0; }
          .footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            border-top: 1px solid #E2E8F0;
            padding-top: 8px;
            font-size: 8pt;
            color: #A0AEC0;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; }
            .footer { position: fixed; bottom: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="header-title">STBA Scripture Study Notebook</span>
          <span class="header-date">${new Date().toLocaleDateString()}</span>
        </div>
        <div>
          ${html}
        </div>
        <div class="footer">
          <span>STBA Discipleship System</span>
          <span>Page 1 of 1</span>
        </div>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() {
              window.parent.document.body.removeChild(window.frameElement);
            }, 1000);
          };
        <\/script>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printDocument);
    doc.close();
  };

  // Trigger floating alert banner
  const triggerSyncAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setSyncAlert({ message, type })
    setTimeout(() => {
      setSyncAlert(null)
    }, 4500)
  }

  // Initial Load and Supabase auto-connection
  useEffect(() => {
    async function initializeSupabase() {
      setSupabaseSyncStatus('checking')
      try {
        const conn = await checkSupabaseConnection()
        if (conn.ok) {
          setSupabaseSyncStatus('connected')
          
          // Fetch categories from Supabase
          try {
            const hasCategoriesTable = await checkCategoriesTable()
            if (hasCategoriesTable) {
              const cloudCategories = await fetchCategoriesFromSupabase()
              if (cloudCategories) {
                setCategories(cloudCategories)
              } else {
                const localCategories = loadCategories()
                await syncAllLocalCategoriesToSupabase(localCategories)
                setCategories(localCategories)
              }
            } else {
              console.warn('stba_study_categories table does not exist yet.')
            }
          } catch (catErr) {
            console.warn('Error synchronizing categories:', catErr)
          }

          const targetId = (location.state as any)?.selectedNoteId || (location.state as any)?.noteId;

          const localNotes = loadNotes()
          const cloudNotes = await fetchNotesFromSupabase()
          
          // Merge local and cloud notes so newly created local notes are never deleted or wiped out
          const mergedMap = new Map<string, StudyNote>()
          localNotes.forEach(n => mergedMap.set(n.id, n))
          cloudNotes.forEach(cn => {
            const ln = mergedMap.get(cn.id)
            if (!ln || new Date(cn.updatedAt) >= new Date(ln.updatedAt)) {
              mergedMap.set(cn.id, cn)
            }
          })
          const mergedNotes = Array.from(mergedMap.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          setNotes(mergedNotes)
          saveNotes(mergedNotes)

          const matched = targetId && mergedNotes.some(n => n.id === targetId) ? targetId : (mergedNotes[0]?.id || '')
          if (matched) setSelectedNoteId(matched)

          // If there are local notes not yet in cloud, sync them up to Supabase in background
          const missingInCloud = localNotes.filter(ln => !cloudNotes.some(cn => cn.id === ln.id))
          if (missingInCloud.length > 0) {
            syncAllLocalNotesToSupabase(missingInCloud).catch(e => console.warn(e))
          }

          if (cloudNotes.length > 0) {
            triggerSyncAlert('Successfully connected & loaded your study notes!', 'success')
          }
        } else {
          if (conn.error === 'TABLE_MISSING') {
            setSupabaseSyncStatus('table_missing')
          } else if (conn.error === 'NOT_AUTHENTICATED') {
            setSupabaseSyncStatus('offline')
          } else {
            setSupabaseSyncStatus('offline')
          }
          // Default fallback to local storage
          const local = loadNotes()
          setNotes(local)
          if (local.length > 0) {
            const targetId = (location.state as any)?.selectedNoteId || (location.state as any)?.noteId;
            const matched = targetId && local.some(n => n.id === targetId) ? targetId : local[0].id
            setSelectedNoteId(matched)
          }
        }
      } catch (err: any) {
        setSupabaseSyncStatus('offline')
        const local = loadNotes()
        setNotes(local)
        if (local.length > 0) {
          const targetId = (location.state as any)?.selectedNoteId || (location.state as any)?.noteId;
          const matched = targetId && local.some(n => n.id === targetId) ? targetId : local[0].id
          setSelectedNoteId(matched)
        }
      }
    }

    initializeSupabase()
  }, [])

  // Manual Sync trigger
  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSupabaseSyncStatus('checking')
    try {
      const conn = await checkSupabaseConnection()
      if (conn.ok) {
        setSupabaseSyncStatus('connected')
        const cloudNotes = await fetchNotesFromSupabase()
        const localNotes = loadNotes()
        
        // Merge notes based on latest updatedAt
        const mergedMap = new Map<string, StudyNote>()
        
        // Feed local notes first
        localNotes.forEach(n => mergedMap.set(n.id, n))
        
        // Merge cloud notes, choosing the more recently modified record
        cloudNotes.forEach(cn => {
          const ln = mergedMap.get(cn.id)
          if (!ln || new Date(cn.updatedAt) >= new Date(ln.updatedAt)) {
            mergedMap.set(cn.id, cn)
          }
        })
        
        const mergedList = Array.from(mergedMap.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setNotes(mergedList)
        saveNotes(mergedList)
        
        // Sync everything back up to mirror perfectly
        await syncAllLocalNotesToSupabase(mergedList)
        
        triggerSyncAlert(`Bi-directional sync completed! Total synced notes: ${mergedList.length}`, 'success')
      } else {
        if (conn.error === 'TABLE_MISSING') {
          setSupabaseSyncStatus('table_missing')
          triggerSyncAlert('Failed: Table "stba_study_notes" does not exist in Supabase database.', 'error')
        } else {
          setSupabaseSyncStatus('error')
          setSupabaseErrorMsg(conn.error || 'Connection failed')
          triggerSyncAlert(`Failed: ${conn.error || 'Unknown error'}`, 'error')
        }
      }
    } catch (err: any) {
      console.error(err)
      triggerSyncAlert(`Sync error: ${err?.message || String(err)}`, 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  // Realtime subscription for stba modules
  useEffect(() => {
    if (supabaseSyncStatus !== 'connected') return

    const channel = supabase
      .channel('realtime-stba-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stba_study_categories' },
        async () => {
          try {
            const dbCategories = await fetchCategoriesFromSupabase()
            if (dbCategories) {
              setCategories(dbCategories)
            }
          } catch (e) {
            console.error('Error in realtime category sync:', e)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stba_study_notes' },
        async () => {
          try {
            const dbNotes = await fetchNotesFromSupabase()
            if (dbNotes && dbNotes.length > 0) {
              setNotes(dbNotes)
              saveNotes(dbNotes)
            }
          } catch (e) {
            console.error('Error in realtime notes sync:', e)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabaseSyncStatus])

  // Back / Forward Navigation logic
  useEffect(() => {
    if (!selectedNoteId) return

    if (isMovingHistory) {
      setIsMovingHistory(false)
      return
    }

    setNoteHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1)
      if (updated.length === 0 || updated[updated.length - 1] !== selectedNoteId) {
        const nextHistory = [...updated, selectedNoteId]
        setHistoryIndex(nextHistory.length - 1)
        return nextHistory
      }
      return prev
    })
  }, [selectedNoteId])

  const goBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      setIsMovingHistory(true)
      setHistoryIndex(prevIndex)
      setSelectedNoteId(noteHistory[prevIndex])
    }
  }

  const goForward = () => {
    if (historyIndex < noteHistory.length - 1) {
      const nextIndex = historyIndex + 1
      setIsMovingHistory(true)
      setHistoryIndex(nextIndex)
      setSelectedNoteId(noteHistory[nextIndex])
    }
  }

  // Auto-save notes on changes + real-time cloud uploading & deletion tracking
  const updateNotesState = (updatedList: StudyNote[]) => {
    // Sanitize with deterministic UUIDs
    const sanitizedList: StudyNote[] = updatedList.map((n, idx) => ({
      ...n,
      id: getDeterministicUUID(n.id),
      order: typeof n.order === 'number' ? n.order : idx,
      children: (n.children || []).map((c: any) => getDeterministicUUID(String(c)))
    }))

    // Save to local state and LocalStorage immediately for responsive navigation even for guests/testers
    setNotes(sanitizedList)
    saveNotes(sanitizedList)

    // Ensure selectedNoteId remains valid if its ID was converted to deterministic UUID
    const mappedSelectedId = getDeterministicUUID(selectedNoteId)
    if (mappedSelectedId !== selectedNoteId && sanitizedList.some(n => n.id === mappedSelectedId)) {
      setSelectedNoteId(mappedSelectedId)
    }

    // Trigger asynchronous cloud sync in background without mutating active user selections
    if (supabaseSyncStatus === 'connected') {
      const currentIds = new Set(sanitizedList.map(n => n.id))
      const deletedNotes = notes.filter(n => !currentIds.has(getDeterministicUUID(n.id)))
      
      // Post individual deletes for missing elements
      deletedNotes.forEach(dn => {
        deleteNoteFromSupabase(dn.id).catch(err => {
          console.error(`Failed to delete note ${dn.id} from cloud:`, err)
        })
      })

      // Bulk upsert current content to cloud in background
      syncAllLocalNotesToSupabase(sanitizedList).catch(err => {
        console.error('Failed to sync updated list to cloud:', err)
      })
    }
  }

  // Restore Default Seed Notes Action
  const handleRestoreSeedNotes = () => {
    if (!window.confirm("Do you wish to restore the default academic seed notes? This will replace your local changes.")) return
    const SEED_NOTES_TEMP: StudyNote[] = [
      {
        id: '11111111-1111-4111-a111-111111111111',
        title: 'The Investigative Judgment',
        summary: 'Daniel 8:14 and the 2300-day prophecy in Adventist theology',
        content: '# The Investigative Judgment\n\n## The Foundational Text\n**Daniel 8:14** — *"Unto two thousand and three hundred days; then shall the sanctuary be cleansed."*\n\n## The 1844 Significance\nOctober 22, 1844 marks the beginning of Christ\'s High Priestly ministry in the Most Holy Place of the heavenly sanctuary...\n\n## EGW Insight\n> *"The subject of the sanctuary and the investigative judgment should be clearly understood by the people of God."* — The Great Controversy, p. 488',
        category: 'theology',
        scriptureTags: ['Daniel 8:14', 'Hebrews 8:1-2', 'Revelation 14:7'],
        createdAt: '2026-05-15T09:00:00Z',
        updatedAt: '2026-05-20T14:30:00Z',
        isFavorite: true,
        children: [],
        order: 0
      },
      {
        id: '22222222-2222-4222-b222-222222222222',
        title: "The Three Angels' Messages",
        summary: 'Revelation 14:6-12 — The everlasting gospel and end-time proclamation',
        content: "# The Three Angels' Messages\n\n## First Angel\n\"Fear God and give glory to Him, for the hour of His judgment has come\" — A call to true worship...\n\n## Second Angel\n\"Babylon is fallen\" — The spiritual corruption of apostate Christianity...\n\n## Third Angel\nThe most solemn warning in Scripture against the mark of the beast...",
        category: 'theology',
        scriptureTags: ['Revelation 14:6-12', 'Revelation 18:4'],
        createdAt: '2026-05-10T08:00:00Z',
        updatedAt: '2026-05-18T11:00:00Z',
        isFavorite: true,
        children: [],
        order: 1
      },
      {
        id: '33333333-3333-4333-c333-333333333333',
        title: 'The Great Disappointment of 1844',
        summary: 'Historical background of the Millerite movement and its theological aftermath',
        content: '# The Great Disappointment\n\n## William Miller\nWilliam Miller studied Daniel 8:14 and concluded Christ would return around 1844...\n\n## October 22, 1844\nThousands waited expectantly. The "Great Disappointment" shattered the Millerite movement...\n\n## The Remnant Response\nA small group concluded the error was not in the date but in the event.',
        category: 'history',
        scriptureTags: ['Daniel 8:14', 'Revelation 10:9-10'],
        createdAt: '2026-04-28T10:00:00Z',
        updatedAt: '2026-05-01T09:00:00Z',
        isFavorite: false,
        children: [],
        order: 2
      }
    ]
    updateNotesState(SEED_NOTES_TEMP)
    setSelectedNoteId('11111111-1111-4111-a111-111111111111')
  }

  // Find active selected note with failsafe fallback so the page never blanks out
  const activeNote = useMemo(() => {
    if (notes.length === 0) return null
    const found = notes.find(n => n.id === selectedNoteId)
    if (found) return found
    const detId = getDeterministicUUID(selectedNoteId)
    const foundDet = notes.find(n => n.id === detId)
    if (foundDet) return foundDet
    return notes[0] || null
  }, [notes, selectedNoteId])

  // Sync selectedNoteId if it fell back to an existing note
  useEffect(() => {
    if (activeNote && activeNote.id !== selectedNoteId) {
      setSelectedNoteId(activeNote.id)
    }
  }, [activeNote, selectedNoteId])

  // Synchronize document topic and user study flow with Elder Stephen persistent state manager
  useEffect(() => {
    setStudyMode('Notebook');
    if (activeNote) {
      const primaryScripture = (activeNote.scriptureTags && activeNote.scriptureTags.length > 0)
        ? activeNote.scriptureTags[0]
        : undefined;
      updateDocumentContext({
        noteId: activeNote.id,
        title: activeNote.title,
        content: activeNote.content,
        category: activeNote.category,
        tags: activeNote.scriptureTags || (activeNote as any).scripture_tags || [],
        passage: primaryScripture
      });
      if (primaryScripture) {
        setCurrentPassage(primaryScripture);
      }
    }
  }, [activeNote, setStudyMode, updateDocumentContext, setCurrentPassage]);

  // Filtered Notes Compute
  const filteredNotes = useMemo(() => {
    // Collect child IDs
    const childIdsSet = new Set<string>()
    notes.forEach(n => {
      if (n.children) {
        n.children.forEach(cid => childIdsSet.add(cid))
      }
    })

    return notes.filter(n => {
      // Root check: must NOT be a child of another note to be in the filtered top level
      if (childIdsSet.has(n.id)) {
        return false
      }

      // Category filter - supporting both 'all' and 'All'
      if ((activeCategory as string) !== 'all' && (activeCategory as string) !== 'All' && n.category !== activeCategory) {
        return false
      }

      // Search query filter (title, content, scriptureTags, summary)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = (n.title || '').toLowerCase().includes(query)
        const matchContent = (n.content || '').toLowerCase().includes(query)
        const matchSummary = (n.summary || '').toLowerCase().includes(query)
        const matchTags = (n.scriptureTags || []).some(tag => tag.toLowerCase().includes(query))
        return matchTitle || matchContent || matchSummary || matchTags
      }
      return true
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [notes, activeCategory, searchQuery])

  // Create new note
  const handleCreateNewNote = () => {
    const minOrder = notes.length > 0 ? Math.min(...notes.map(n => n.order ?? 0)) : 0
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })

    const newNote: StudyNote = {
      id: uniqueId,
      title: 'New Scripture Note',
      summary: 'Record your theological insights here.',
      content: '# New Scripture Note\n\nWrite your insights on Daniel or Revelation. Double-click or click Read/Draft toggle above.',
      category: (activeCategory as string) !== 'all' && (activeCategory as string) !== 'All' ? (activeCategory as any) : 'theology',
      scriptureTags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      children: [],
      order: minOrder - 1
    }

    const updated = [newNote, ...notes]
    updateNotesState(updated)
    setSelectedNoteId(newNote.id)
    setEditorMode('draft') // Open immediately in draft workspace
    
    // Trigger milestone celebration confetti
    showConfetti('notebook')
    
    // Shift views on mobile
    setMobileTab('study')
  }

  // Handle note content updates
  const handleUpdateNoteContent = (content: string) => {
    if (!activeNote) return

    // Extract first title from Content if starts with #, otherwise keep title
    const lines = content.split('\n')
    let parsedTitle = activeNote.title
    const firstLine = lines[0]?.trim() || ''
    if (firstLine.startsWith('# ')) {
      parsedTitle = firstLine.substring(2).trim()
    }

    // Auto generate 2-line summary
    let parsedSummary = activeNote.summary
    const firstParagraph = lines.find(line => line.trim() && !line.trim().startsWith('#') && !line.trim().startsWith('>'))
    if (firstParagraph) {
      parsedSummary = firstParagraph.trim().substring(0, 100)
      if (firstParagraph.trim().length > 100) parsedSummary += '...'
    }

    // Auto extract scripture tags matching e.g. "Daniel 8:14"
    const scriptureRegex = /\b(?:[1-3]\s)?[A-Z][A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?\b/g
    const matchedTagsSet = new Set<string>()
    content.split('\n').forEach(line => {
      const lineMatches = line.match(scriptureRegex)
      if (lineMatches) {
        lineMatches.forEach(match => matchedTagsSet.add(match))
      }
    })
    const scriptureTags = Array.from(matchedTagsSet).slice(0, 5) // Limit to max 5 distinct tags

    const updated = notes.map(n => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: parsedTitle || 'Untitled Note',
          summary: parsedSummary || 'Theological scratchpad',
          content,
          scriptureTags,
          updatedAt: new Date().toISOString()
        }
      }
      return n
    })

    updateNotesState(updated)

    // Clear existing timer if active
    if (writingTimeoutRef.current) {
      clearTimeout(writingTimeoutRef.current)
    }

    // Debounce triggering Elder Stephen review to keep it smooth and rate-limit compliant (2.8s pause)
    setElderStephenStatus('analyzing')
    writingTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await callElderStephen({
          noteTitle: parsedTitle,
          noteContent: content,
          contextSummary: `User is editing/drafting a scripture study note. Category: "${activeNote.category}".`,
          userAction: 'notebook_write',
          commentaryMode: 'velocity'
        })

        if (res && res.text) {
          const formattedInsight = formatProperElderSpacing(res.text)
          setElderStephenLiveInsight(formattedInsight)
          setElderStephenStatus('responded')

          // Auto-append the draft audit to Elder Stephen's local chat registry
          const chatKey = `stba_elder_${selectedNoteId}`
          const savedChat = localStorage.getItem(chatKey)
          let parsedMessages = []
          if (savedChat) {
            try { parsedMessages = JSON.parse(savedChat) } catch (e) {}
          }
          const draftReviewMsg: ChatMessage = {
            id: `sys-write-feedback-${Date.now()}`,
            role: 'elder',
            text: `[Live Study Audit] ${formattedInsight}`,
            timestamp: new Date().toISOString(),
            commentaryMode: 'velocity'
          }
          const cleanedHistory = parsedMessages.filter((m: any) => !m.text.startsWith('[Live Study Audit]'))
          localStorage.setItem(chatKey, JSON.stringify([...cleanedHistory, draftReviewMsg]))
        } else {
          setElderStephenStatus('idle')
        }
      } catch (err) {
        console.error('Elder Stephen live writing critique failed:', err)
        setElderStephenStatus('error')
      }
    }, 2800)
  }

  // Live status bar renderer for notebook draft reviews
  const renderElderStephenStatusBar = () => {
    if (elderStephenStatus === 'idle') return null

    return (
      <div 
        className={`px-4 py-2 border-b text-xs flex items-center justify-between gap-3 font-sans transition-all duration-300 ${
          elderStephenStatus === 'analyzing'
            ? 'bg-[#12141c]/90 border-blue-500/20 text-blue-300'
            : elderStephenStatus === 'responded'
            ? 'bg-[#181a14]/90 border-[var(--nb-gold)]/20 text-[var(--nb-text-muted)]'
            : 'bg-[#211210]/90 border-rose-500/20 text-rose-300'
        }`}
        id="elder-stephen-live-status-bar"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            {elderStephenStatus === 'analyzing' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              elderStephenStatus === 'analyzing' ? 'bg-blue-500' :
              elderStephenStatus === 'responded' ? 'bg-[var(--nb-gold)]' : 'bg-rose-500'
            }`}></span>
          </span>
          <div className="truncate text-[11px] leading-tight">
            {elderStephenStatus === 'analyzing' && (
              <span className="font-mono text-blue-400 tracking-wider uppercase animate-pulse">
                Elder Stephen is reviewing your active draft analysis...
              </span>
            )}
            {elderStephenStatus === 'responded' && (
              <p className="line-clamp-1 italic text-[var(--nb-text-muted)] elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased">
                <strong className="text-[var(--nb-gold)] not-italic font-mono mr-1">Pastor Stephen:</strong> 
                "{elderStephenLiveInsight}"
              </p>
            )}
            {elderStephenStatus === 'error' && (
              <span className="font-mono text-rose-400 uppercase tracking-wider">
                Connection to Elder Stephen database interrupted
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {elderStephenStatus === 'responded' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setDrawerMode('elder')
                  setMobileTab('elder')
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--nb-teal-muted)] border border-[var(--nb-teal)]/30 hover:bg-[var(--nb-teal)]/20 text-[var(--nb-teal)] font-bold cursor-pointer"
              >
                Open Counsel Logs
              </button>
              <button
                type="button"
                onClick={() => setElderStephenStatus('idle')}
                className="text-stone-500 hover:text-stone-300 p-0.5 rounded cursor-pointer border-none bg-transparent"
                title="Dismiss status banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {elderStephenStatus === 'error' && (
            <button
              type="button"
              onClick={() => handleUpdateNoteContent(activeNote?.content || '')}
              className="text-[10px] font-mono text-[var(--nb-gold)] underline cursor-pointer bg-transparent border-none"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // Update specific fields by Note ID
  const handleUpdateNoteFieldById = (id: string, fields: Partial<StudyNote>) => {
    const updated = notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          ...fields,
          updatedAt: new Date().toISOString()
        }
      }
      return n
    })
    updateNotesState(updated)
  }

  // Update specific fields (like title, category, favorite tag)
  const handleUpdateNoteField = (fields: Partial<StudyNote>) => {
    if (!activeNote) return
    handleUpdateNoteFieldById(selectedNoteId, fields)
  }

  // Delete Note
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    const remaining = notes.filter(n => n.id !== id).map(n => {
      if (n.children && n.children.includes(id)) {
        return {
          ...n,
          children: n.children.filter(cid => cid !== id)
        }
      }
      return n
    })
    updateNotesState(remaining)
    
    // Filter out from history
    setNoteHistory(prev => {
      const filtered = prev.filter(x => x !== id)
      setHistoryIndex(currentIdx => {
        if (currentIdx >= filtered.length) {
          return Math.max(-1, filtered.length - 1)
        }
        return currentIdx
      })
      return filtered
    })

    // Choose another note if any exists
    if (selectedNoteId === id) {
      if (remaining.length > 0) {
        setSelectedNoteId(remaining[0].id)
      } else {
        setSelectedNoteId('')
      }
    }
  }

  // Direct Note Deletion without prompt
  const deleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const remaining = notes.filter(n => n.id !== id).map(n => {
      if (n.children && n.children.includes(id)) {
        return {
          ...n,
          children: n.children.filter(cid => cid !== id)
        }
      }
      return n
    })
    updateNotesState(remaining)

    // Filter out from history
    setNoteHistory(prev => {
      const filtered = prev.filter(x => x !== id)
      setHistoryIndex(currentIdx => {
        if (currentIdx >= filtered.length) {
          return Math.max(-1, filtered.length - 1)
        }
        return currentIdx
      })
      return filtered
    })

    if (selectedNoteId === id) {
      if (remaining.length > 0) {
        setSelectedNoteId(remaining[0].id)
      } else {
        setSelectedNoteId('')
      }
    }
  }

  // Toggle Favorite
  const toggleFavoriteSelected = () => {
    if (!activeNote) return
    handleUpdateNoteField({ isFavorite: !activeNote.isFavorite })
  }

  // Toggle Favorite by specific ID
  const handleToggleFavorite = (noteId: string) => {
    const updated = notes.map(n => {
      if (n.id === noteId) {
        return {
          ...n,
          isFavorite: !n.isFavorite,
          updatedAt: new Date().toISOString()
        }
      }
      return n
    })
    updateNotesState(updated)
  }

  // Delete a Category to Theology or other fallback
  const handleDeleteCategory = async (catKey: string) => {
    if (catKey === 'all') return

    // 1. Remove category from state
    const nextCategories = { ...categories }
    delete nextCategories[catKey]
    setCategories(nextCategories)
    saveCategories(nextCategories)

    if (supabaseSyncStatus === 'connected') {
      try {
        if (await checkCategoriesTable()) {
          await deleteCategoryFromSupabase(catKey)
        }
      } catch (e) {
        console.error('Error deleting category from cloud:', e)
      }
    }

    // 2. Reassociate matching notes to the first available category or 'theology'
    const fallbackCategory = Object.keys(nextCategories).find(k => k !== 'all') || 'theology'
    const updatedNotes = notes.map(n => {
      if (n.category === catKey) {
        return {
          ...n,
          category: fallbackCategory as any,
          updatedAt: new Date().toISOString()
        }
      }
      return n
    })
    updateNotesState(updatedNotes)

    // 3. Reset activeCategory if it was deleted
    if (activeCategory === catKey) {
      setActiveCategory(fallbackCategory as any)
    }
  }

  // Finish editing a Category
  const handleFinishEditCategory = async (catKey: string) => {
    const trimmed = editCatNameTemp.trim()
    if (!trimmed) {
      setEditingCatKey(null)
      return
    }

    const nextCategories = {
      ...categories,
      [catKey]: {
        ...categories[catKey],
        label: trimmed
      }
    }
    setCategories(nextCategories)
    saveCategories(nextCategories)
    setEditingCatKey(null)

    if (supabaseSyncStatus === 'connected') {
      try {
        if (await checkCategoriesTable()) {
          const idx = Object.keys(nextCategories).indexOf(catKey)
          await saveCategoryToSupabase(catKey, nextCategories[catKey], idx >= 0 ? idx : 0)
        }
      } catch (e) {
        console.error('Error saving updated category to cloud:', e)
      }
    }
  }

  // Custom Category Creation Submitter
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCatLabel.trim()) return

    const key = newCatLabel.toLowerCase().replace(/\s+/g, '-')
    const code = newCatCode.trim().substring(0, 2).toUpperCase() || newCatLabel.substring(0, 1).toUpperCase()
    
    const updatedCategories = {
      ...categories,
      [key]: {
        label: newCatLabel,
        code,
        color: newCatColor
      }
    }

    setCategories(updatedCategories)
    saveCategories(updatedCategories)
    setActiveCategory(key as any)

    if (supabaseSyncStatus === 'connected') {
      try {
        if (await checkCategoriesTable()) {
          const idx = Object.keys(updatedCategories).indexOf(key)
          await saveCategoryToSupabase(key, updatedCategories[key], idx >= 0 ? idx : 0)
        }
      } catch (err) {
        console.error('Error saving new category to Supabase:', err)
      }
    }
    
    // Reset inputs & close modal
    setNewCatLabel('')
    setNewCatCode('')
    setNewCatColor('#C5A059')
    setShowAddCategoryModal(false)
  }

  return (
    <div className="notebook-shell flex flex-col h-[calc(100vh-74px)] overflow-hidden select-text" data-theme={theme} id="notebook-feature-page">
      {/* Scope visual CSS properties exclusively */}
      <style>{`
        .notebook-shell[data-theme="light"] {
          --nb-bg: #FCFAF6;
          --nb-editor-bg: #FCFAF6;
          --nb-card: #FFFFFF;
          --nb-card-hover: #F6F3EC;
          --nb-sidebar: #F2EFE8;
          --nb-gold: #B48C3F;
          --nb-gold-muted: rgba(180,140,63,0.12);
          --nb-teal: #319795;
          --nb-teal-muted: rgba(49,151,149,0.10);
          --nb-text: #1E293B;
          --nb-text-muted: #5A606C;
          --nb-text-dim: #8B909A;
          --nb-border: rgba(0,0,0,0.08);
          --nb-border-gold: rgba(180,140,63,0.25);
          font-family: 'Inter', sans-serif;
          background: var(--nb-bg);
          color: var(--nb-text);
          height: calc(100vh - 74px);
        }
        .notebook-shell[data-theme="dark"] {
          --nb-bg: #080808;
          --nb-editor-bg: #080808;
          --nb-card: #121212;
          --nb-card-hover: #1e1e1e;
          --nb-sidebar: #0d0d0d;
          --nb-gold: #C5A059;
          --nb-gold-muted: rgba(197,160,89,0.12);
          --nb-teal: #4ECDC4;
          --nb-teal-muted: rgba(78,205,196,0.10);
          --nb-text: #F0EDE8;
          --nb-text-muted: #9A9490;
          --nb-text-dim: #5A5650;
          --nb-border: rgba(255,255,255,0.07);
          --nb-border-gold: rgba(197,160,89,0.25);
          font-family: 'Inter', sans-serif;
          background: var(--nb-bg);
          color: var(--nb-text);
          height: calc(100vh - 74px);
        }
        .notebook-shell ::selection {
          background: var(--nb-gold-muted);
          color: var(--nb-gold);
        }
        .notebook-scrollable::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .notebook-scrollable::-webkit-scrollbar-track {
          background: transparent;
        }
        .notebook-scrollable::-webkit-scrollbar-thumb {
          background: var(--nb-border);
          border-radius: 99px;
        }
        .notebook-scrollable::-webkit-scrollbar-thumb:hover {
          background: var(--nb-text-dim);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>

      {/* DESKTOP SPLIT VIEW PLATFORM */}
      <div 
        className="hidden lg:grid h-full overflow-hidden transition-all duration-[180ms] ease" 
        style={{ gridTemplateColumns: `${isRailCollapsed ? '64px' : '220px'} 280px 1fr auto` }}
        id="desktop-notebook-frame"
      >
        {/* PANEL 1: CATEGORY RAIL */}
        <div 
          className="bg-[var(--nb-sidebar)] flex flex-col justify-between py-5 border-r border-[var(--nb-border)] shrink-0 z-10 select-none h-full transition-all duration-[180ms] ease items-stretch"
          style={{ width: isRailCollapsed ? '64px' : '220px' }}
          id="panel-category-rail"
        >
          {/* Top Rail logo & items */}
          <div className="flex flex-col items-center gap-6 w-full">
            <div className={`w-full flex ${isRailCollapsed ? 'justify-center' : 'justify-start px-6'} transition-all duration-[180ms] ease`}>
              <button
                onClick={() => setIsRailCollapsed(!isRailCollapsed)}
                className="rounded-[8px] bg-[var(--nb-gold-muted)] flex items-center justify-center font-serif font-extrabold text-[var(--nb-gold)] text-xs shadow shadow-[var(--nb-gold)]/20 transition-all duration-[180ms] ease cursor-pointer border w-10 h-10 border-[var(--nb-border)] hover:border-[var(--nb-gold)] hover:bg-[var(--nb-gold-muted)] shrink-0"
                title={isRailCollapsed ? "Expand Category Rail" : "Collapse Category Rail"}
                id="rail-logo-toggle-btn"
              >
                STBA
              </button>
            </div>

            <div className={`flex flex-col items-end gap-2.5 w-full ${isRailCollapsed ? 'pl-3' : 'pl-4'}`} id="rail-scrip-categories">
              {(Object.keys(categories) as NoteCategory[]).map((catKey) => {
                const cat = categories[catKey]
                const isActive = activeCategory === catKey
                const abbrText = getCategoryAbbreviation(catKey, cat.code)
                const isHovered = hoveredTab === catKey
                return (
                  <div
                    key={catKey}
                    id={`rail-cat-btn-${catKey}`}
                    onClick={() => setActiveCategory(catKey)}
                    onMouseEnter={() => setHoveredTab(catKey)}
                    onMouseLeave={() => setHoveredTab(null)}
                    role="button"
                    tabIndex={0}
                    className={`w-full flex items-center transition-all duration-[180ms] ease relative cursor-pointer select-none group border-y border-l ${
                      isRailCollapsed 
                        ? 'justify-center py-1.5' 
                        : 'justify-start px-3.5 py-2 gap-3'
                    }`}
                    style={{
                      height: '36px',
                      borderTopLeftRadius: '8px',
                      borderBottomLeftRadius: '8px',
                      borderTopRightRadius: '0px',
                      borderBottomRightRadius: '0px',
                      
                      backgroundColor: getCategoryTabBg(catKey, cat.color, isHovered || isActive),
                      
                      borderLeftWidth: '2px',
                      borderLeftColor: isActive ? 'var(--nb-gold)' : (isHovered ? 'var(--nb-gold)' : 'var(--nb-border)'),
                      borderTopColor: isActive ? 'var(--nb-gold)' : (isHovered ? 'var(--nb-gold)' : 'var(--nb-border)'),
                      borderBottomColor: isActive ? 'var(--nb-gold)' : (isHovered ? 'var(--nb-gold)' : 'var(--nb-border)'),
                      borderRightWidth: '0px',
                      borderRightColor: 'transparent'
                    }}
                    title={cat.label}
                  >
                    {/* Abbreviation code */}
                    <span 
                      className={`font-sans select-none leading-none transition-all duration-[180ms] ease shrink-0 ${
                        isRailCollapsed ? 'text-[14px] font-bold' : 'text-[13px] font-bold'
                      } ${
                        isActive 
                          ? 'text-[var(--nb-gold)]' 
                          : (isHovered ? 'text-[var(--nb-text)] font-bold' : 'text-[var(--nb-text-muted)]')
                      }`}
                    >
                      {abbrText}
                    </span>

                    {/* Full label (only in expanded state) */}
                    {!isRailCollapsed && (
                      editingCatKey === catKey ? (
                        <input
                          type="text"
                          value={editCatNameTemp}
                          onChange={(e) => setEditCatNameTemp(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFinishEditCategory(catKey)
                            } else if (e.key === 'Escape') {
                              setEditingCatKey(null)
                            }
                          }}
                          onBlur={() => handleFinishEditCategory(catKey)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-sans text-[11px] font-semibold px-1 py-0.5 bg-stone-900 border border-[var(--nb-border-gold)] rounded text-[var(--nb-text)] w-[85px] focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={`font-sans font-medium text-left truncate transition-all duration-[180ms] ease text-xs tracking-wide max-w-[85px] ${
                            isActive ? 'text-[var(--nb-gold)]' : (isHovered ? 'text-[var(--nb-text)]' : 'text-[var(--nb-text-muted)]')
                          }`}
                          id={`rail-cat-label-${catKey}`}
                        >
                          {cat.label}
                        </span>
                      )
                    )}

                    {/* Hover controls: edit word + trash can */}
                    {!isRailCollapsed && catKey !== 'all' && editingCatKey !== catKey && (
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 pr-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCatKey(catKey)
                            setEditCatNameTemp(cat.label)
                          }}
                          className="px-1 py-0.5 rounded text-[9px] font-mono font-medium hover:text-[var(--nb-gold)] hover:bg-stone-850/50 transition-all duration-150 cursor-pointer text-[var(--nb-text-dim)]"
                          title="Edit category"
                        >
                          edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategory(catKey)
                          }}
                          className="p-1 rounded text-[var(--nb-text-muted)] hover:text-red-400 hover:bg-stone-850/50 transition-all duration-150 cursor-pointer flex items-center justify-center"
                          title="Purge category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Rail actions grouped */}
          <div className="flex flex-col gap-3.5 w-full shrink-0">
            <div className={`w-full flex ${isRailCollapsed ? 'justify-center' : 'justify-start px-7'} transition-all duration-[180ms] ease`}>
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                className={`rounded-full bg-stone-900 border flex items-center justify-center text-[var(--nb-text-dim)] hover:text-[var(--nb-gold)] hover:bg-[var(--nb-gold-muted)] hover:border-[var(--nb-gold)] transition-all duration-[180ms] ease cursor-pointer shadow border-[var(--nb-border)] ${
                  isRailCollapsed ? 'w-10 h-10' : 'w-8 h-8'
                } shrink-0`}
                title="Create custom category"
                id="rail-add-cat-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Build Version Tag */}
            <div className={`text-[9px] font-mono font-extrabold text-[#444] tracking-wider select-none uppercase w-full text-center ${isRailCollapsed ? 'block' : 'px-7 text-left'}`}>
              v1.2
            </div>
          </div>
        </div>


        {/* PANEL 2: NOTE INDEX */}
        <div 
          className="bg-[var(--nb-bg)] border-r border-[var(--nb-border)] flex flex-col overflow-hidden select-none z-10 w-[280px] shrink-0"
          id="panel-note-index"
        >
          {/* Panel header controls */}
          <div className="p-4 border-b border-[var(--nb-border)]/65 shrink-0 flex items-center justify-between gap-2 bg-transparent">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--nb-text)] font-sans">Notebook Studia</span>
              <span className="text-[10px] font-mono text-[var(--nb-text-dim)] uppercase tracking-wider">
                {categories[activeCategory]?.label || 'Study'} ({filteredNotes.length})
              </span>
            </div>

            <button 
              onClick={handleCreateNewNote}
              className="px-2.5 py-1.5 rounded-[6px] bg-[var(--nb-card)] hover:bg-[var(--nb-card-hover)] text-[var(--nb-gold)] transition-all duration-[150ms] ease-out cursor-pointer flex items-center gap-1 text-[11px] font-sans font-medium border border-[var(--nb-border)]/70 hover:border-[var(--nb-gold)]/60"
              title="Add a new note to study workspace"
              id="btn-create-note-desktop"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          {/* Supabase Cloud Sync Ribbon */}
          <div className={`px-4 py-2 border-b border-[var(--nb-border)]/50 flex items-center justify-between gap-1 select-none font-sans shrink-0 ${
            theme === 'light' ? 'bg-stone-200/40' : 'bg-[#121110]'
          }`}>
            <div className="flex items-center gap-2 max-w-[170px] overflow-hidden truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                {supabaseSyncStatus === 'checking' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--nb-gold)] opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  supabaseSyncStatus === 'connected' ? 'bg-emerald-500' :
                  supabaseSyncStatus === 'table_missing' ? 'bg-amber-500' :
                  supabaseSyncStatus === 'checking' ? 'bg-[var(--nb-gold)]' : 'bg-rose-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-mono tracking-wider text-[var(--nb-text-dim)] uppercase truncate">
                {supabaseSyncStatus === 'connected' && 'Supabase Live'}
                {supabaseSyncStatus === 'checking' && 'Verifying Cloud...'}
                {supabaseSyncStatus === 'table_missing' && 'DB Table Missing'}
                {supabaseSyncStatus === 'error' && 'DB Link Error'}
                {supabaseSyncStatus === 'offline' && 'Offline Sandbox'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {supabaseSyncStatus === 'table_missing' && (
                <button
                  onClick={() => setShowDbConfigInstructions(true)}
                  className="rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-[var(--nb-gold)] bg-[var(--nb-gold-muted)] border border-[var(--nb-gold)]/40 hover:bg-[var(--nb-gold)]/20 transition-all duration-150 cursor-pointer"
                  title="View SQL table setup instructions"
                >
                  Setup Table
                </button>
              )}
              {supabaseSyncStatus === 'connected' && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`disabled:opacity-40 transition-all duration-150 cursor-pointer flex items-center justify-center p-1 rounded ${
                    theme === 'light' 
                      ? 'text-stone-600 hover:text-[var(--nb-gold)] hover:bg-stone-300/45' 
                      : 'text-stone-400 hover:text-[var(--nb-gold)] hover:bg-stone-800/40'
                  }`}
                  title="Force bidirectional cloud sync"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[var(--nb-gold)]' : ''}`} />
                </button>
              )}
              {(supabaseSyncStatus === 'error' || supabaseSyncStatus === 'offline') && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`disabled:opacity-40 transition-all duration-150 cursor-pointer flex items-center justify-center p-1 rounded ${
                    theme === 'light' 
                      ? 'text-stone-600 hover:text-[var(--nb-gold)] hover:bg-stone-300/45' 
                      : 'text-stone-400 hover:text-[var(--nb-gold)] hover:bg-stone-800/40'
                  }`}
                  title="Retry connecting to Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin animate-none' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Search bar wrapper with polish */}
          <div className="px-3 py-2.5 border-b border-[var(--nb-border)]/60 shrink-0 bg-transparent flex items-center relative">
            <Search className="w-4 h-4 text-[var(--nb-text-dim)] absolute left-6 pointer-events-none z-10" />
            <input
              type="text"
              id="desktop-search-input"
              placeholder="Search scripture notes..."
              className="w-full bg-[var(--nb-card)] text-[12px] font-sans font-normal text-[var(--nb-text)] placeholder-[var(--nb-text-muted)] rounded-[8px] pl-9 pr-3 py-2 focus:outline-none border border-transparent focus:border-[var(--nb-gold)] focus:bg-[rgba(197,160,89,0.08)] transition-all duration-[160ms] ease"
              style={{
                boxShadow: 'inset 0 0 0 1px var(--nb-border)',
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Scrollable Notebook list */}
          <div 
            className="flex-1 overflow-y-auto notebook-scrollable px-0 py-3 space-y-2.5 bg-transparent"
            id="desktop-note-list"
          >
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none" id="desktop-note-empty-state">
                <BookOpen className="w-8 h-8 text-[var(--nb-gold)]/40 mb-3 stroke-[1.25]" />
                <h4 className="text-xs font-sans font-semibold text-[var(--nb-text-muted)] tracking-wider uppercase mb-1">
                  No Scripture Notes
                </h4>
                <p className="text-[11px] font-sans text-[var(--nb-text-dim)] max-w-[200px] leading-relaxed">
                  {searchQuery 
                    ? "No academic entries match your search criteria. Refine your query or examine other doctrinal paths." 
                    : "Your theological workspace is empty. Begin an active Scripture study session to record new scholarly insights."
                  }
                </p>
              </div>
            ) : (
              filteredNotes.map((noteItem) => (
                <NoteCard
                  key={noteItem.id}
                  noteItem={noteItem}
                  selectedNoteId={selectedNoteId}
                  setSelectedNoteId={setSelectedNoteId}
                  setMobileTab={setMobileTab}
                  expandedParentIds={expandedParentIds}
                  toggleParentExpanded={toggleParentExpanded}
                  draggedNoteId={draggedNoteId}
                  dragOverNoteId={dragOverNoteId}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDragEnd={handleDragEnd}
                  handleDrop={handleDrop}
                  setContextMenu={setContextMenu}
                  categories={categories}
                  handleUpdateNoteFieldById={handleUpdateNoteFieldById}
                  handleToggleFavorite={handleToggleFavorite}
                  handleDeleteNote={handleDeleteNote}
                  editingNoteId={editingNoteId}
                  setEditingNoteId={setEditingNoteId}
                  editingField={editingField}
                  setEditingField={setEditingField}
                  editTempText={editTempText}
                  setEditTempText={setEditTempText}
                  notes={notes}
                  user={user}
                />
              ))
            )}
          </div>
        </div>


        {/* PANEL 3: CENTRAL STAGE */}
        <div 
          className="flex flex-col overflow-hidden bg-[var(--nb-bg)]"
          id="panel-central-stage"
        >
          {activeNote ? (
            <div className="flex flex-col h-full overflow-hidden" id="active-study-pane">
              {/* Note stage top status actions bar */}
              <div className={`h-[48px] px-3.5 border-b border-[var(--nb-border)] shrink-0 flex items-center justify-between select-none relative ${
                theme === 'light' ? 'bg-stone-100/40' : 'bg-stone-950/20'
              }`}>
                       {/* LEFT GROUP: Toggleable NB badge + Navigation arrows */}
                <div className="flex items-center gap-1 shrink-0 z-10 mr-2" id="stage-note-left-group">
                  {/* Back Navigation Button */}
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={historyIndex <= 0}
                    title="Previous Note"
                    className="group/btn flex items-center justify-center rounded-lg border border-[var(--nb-gold)]/35 hover:border-[var(--nb-gold)]/80 hover:bg-[var(--nb-gold-muted)] disabled:border-[var(--nb-border)] disabled:opacity-25 disabled:bg-transparent transition-all duration-150 cursor-pointer text-[var(--nb-gold)] disabled:cursor-not-allowed select-none active:scale-[0.98]"
                    style={{
                      height: '28px',
                      padding: '2px 8px',
                    }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 shrink-0 mr-0.5 transition-transform duration-150 group-hover/btn:-translate-x-0.5" />
                    <span className="font-sans text-[11px] font-semibold text-[var(--nb-gold)] transition-colors duration-150 select-none">
                      Prev
                    </span>
                  </button>

                  {/* Forward Navigation Button */}
                  <button
                    type="button"
                    onClick={goForward}
                    disabled={historyIndex >= noteHistory.length - 1 || historyIndex === -1}
                    title="Next Note"
                    className="group/btn flex items-center justify-center rounded-lg border border-[var(--nb-gold)]/35 hover:border-[var(--nb-gold)]/80 hover:bg-[var(--nb-gold-muted)] disabled:border-[var(--nb-border)] disabled:opacity-25 disabled:bg-transparent transition-all duration-150 cursor-pointer text-[var(--nb-gold)] disabled:cursor-not-allowed select-none active:scale-[0.98]"
                    style={{
                      height: '28px',
                      padding: '2px 8px',
                    }}
                  >
                    <span className="font-sans text-[11px] font-semibold text-[var(--nb-gold)] transition-colors duration-150 select-none mr-0.5">
                      Next
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                  </button>
                </div>

                {/* RIGHT GROUP: Action buttons for mode toggles & drawer utilities */}
                <div className="flex items-center gap-1.5 shrink-0 z-10" id="stage-note-right-group">
                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className={`p-1 px-[8px] h-[28px] rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      theme === 'light'
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)]'
                        : 'border-[var(--nb-border)] bg-stone-900/50 text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] hover:border-[var(--nb-border-gold)]'
                    }`}
                    title={theme === 'dark' ? 'Switch to Warm Light Theme' : 'Switch to Minimal Dark Theme'}
                    id="btn-notebook-theme-toggle"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </button>

                  <div className="w-[1px] h-3.5 bg-[var(--nb-border)] shrink-0" />

                  {/* Draft vs Read toggle */}
                  <div className={`flex border p-0.5 rounded-lg text-xs ${
                    theme === 'light'
                      ? 'bg-stone-100 border-stone-200'
                      : 'bg-stone-900 border-[var(--nb-border)]'
                  }`} id="stage-mode-toggles">
                    <button
                      onClick={() => setEditorMode('read')}
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] transition-all cursor-pointer ${
                        editorMode === 'read'
                          ? 'bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] font-bold'
                          : 'text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]'
                      }`}
                    >
                      Read
                    </button>
                    <button
                      onClick={() => setEditorMode('draft')}
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] transition-all cursor-pointer ${
                        editorMode === 'draft'
                          ? 'bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] font-bold'
                          : 'text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]'
                      }`}
                    >
                      Draft
                    </button>
                  </div>

                  {/* Download button menu dropdown selection */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                      className={`p-1 px-2.5 h-[28px] rounded-lg border flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-all ${
                        theme === 'light'
                          ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)] hover:border-stone-300'
                          : 'border-[var(--nb-border)] bg-stone-900 text-[var(--nb-text)] hover:border-[var(--nb-border-gold)] hover:text-[var(--nb-gold)]'
                      }`}
                      title="Download Note Menu"
                      id="download-split-dropdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    {isDownloadOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDownloadOpen(false)} />
                        <div className={`absolute right-0 mt-1.5 w-52 rounded-lg shadow-xl z-50 text-xs py-1.5 border ${
                          theme === 'light'
                            ? 'bg-white border-stone-200 text-stone-700'
                            : 'bg-stone-950 border-[var(--nb-border)]'
                        }`}>
                          <button
                            onClick={() => {
                              downloadNoteAsText(activeNote.title || 'Note', activeNote.content || '')
                              setIsDownloadOpen(false)
                            }}
                            className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer border-b font-mono ${
                              theme === 'light'
                                ? 'text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)] border-stone-100 bg-white'
                                : 'text-[var(--nb-text-muted)] hover:bg-stone-900 hover:text-[var(--nb-gold)] border-white/5'
                            }`}
                          >
                            📝 Download Note (.txt)
                          </button>
                          
                          <button
                            onClick={() => {
                              downloadCSMSSummaryAsText(activeNote.title || 'Note')
                              setIsDownloadOpen(false)
                            }}
                            className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer border-b font-mono ${
                              theme === 'light'
                                ? 'text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)] border-stone-100 bg-white'
                                : 'text-[var(--nb-text-muted)] hover:bg-stone-900 hover:text-[var(--nb-gold)] border-white/5'
                            }`}
                          >
                            🧠 Download CSMS Summary
                          </button>
                          
                          <button
                            onClick={() => {
                              downloadElderChatAsText(activeNote.title || 'Note')
                              setIsDownloadOpen(false)
                            }}
                            className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer border-b font-mono ${
                              theme === 'light'
                                ? 'text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)] border-stone-100 bg-white'
                                : 'text-[var(--nb-text-muted)] hover:bg-stone-900 hover:text-[var(--nb-gold)] border-white/5'
                            }`}
                          >
                            💬 Download Elder Stephen Chat
                          </button>

                          <button
                            onClick={() => {
                              downloadWord(activeNote.title || 'Note', activeNote.content || '')
                              setIsDownloadOpen(false)
                            }}
                            className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer border-b ${
                              theme === 'light'
                                ? 'text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)] border-stone-100 bg-white'
                                : 'text-[var(--nb-text-muted)] hover:bg-stone-900 hover:text-[var(--nb-gold)] border-white/5'
                            }`}
                          >
                            📄 Download Word (.doc)
                          </button>
                          
                          <button
                            onClick={() => {
                              downloadPDF(activeNote.title || 'Note', activeNote.content || '')
                              setIsDownloadOpen(false)
                            }}
                            className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer ${
                              theme === 'light'
                                ? 'text-stone-700 hover:bg-stone-50 hover:text-[var(--nb-gold)] bg-white'
                                : 'text-[var(--nb-text-muted)] hover:bg-stone-900 hover:text-[var(--nb-gold)]'
                            }`}
                          >
                            🖨️ Download PDF Document
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="w-px h-4 bg-[var(--nb-border)] mx-0.5" />

                  {/* Text Size controls A- / A+ */}
                  <div className={`flex border p-0.5 rounded-lg items-center text-xs select-none ${
                    theme === 'light'
                      ? 'bg-stone-100 border-stone-200'
                      : 'bg-stone-900 border-[var(--nb-border)]'
                  }`}>
                    <button
                      onClick={() => setEditorFontSize(prev => Math.max(10, prev - 1))}
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={editorFontSize <= 10}
                      className="px-2 py-0.5 text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] font-semibold text-[11px] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Decrease Text Size"
                    >
                      A–
                    </button>
                    <div className="w-[1px] h-3 bg-[var(--nb-border)] opacity-30" />
                    <span className="px-1.5 font-mono text-[10px] text-[var(--nb-text-muted)]">
                      {editorFontSize}px
                    </span>
                    <div className="w-[1px] h-3 bg-[var(--nb-border)] opacity-30" />
                    <button
                      onClick={() => setEditorFontSize(prev => Math.min(24, prev + 1))}
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={editorFontSize >= 24}
                      className="px-2 py-0.5 text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] font-semibold text-[11px] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Increase Text Size"
                    >
                      A+
                    </button>
                  </div>

                  <div className="w-px h-4 bg-[var(--nb-border)] mx-0.5" />

                  {/* CSMS / Elder triggers */}
                  <button
                    onClick={() => {
                      setDrawerMode(drawerMode === 'mastery' ? 'closed' : 'mastery')
                    }}
                    className={`p-1 px-2 h-[28px] rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono font-bold ${
                      drawerMode === 'mastery'
                        ? 'bg-[var(--nb-gold-muted)] border-[var(--nb-gold)] text-[var(--nb-gold)] shadow'
                        : theme === 'light'
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-[var(--nb-border-gold)]'
                        : 'bg-stone-900/50 border-[var(--nb-border)] text-[var(--nb-text-dim)] hover:border-[var(--nb-border-gold)] hover:text-[var(--nb-text-muted)]'
                    }`}
                    title="Open Cognitive Lesson Review"
                    id="btn-drawer-mastery"
                  >
                    <Brain className="w-3.5 h-3.5 shrink-0" />
                    <span>CSMS</span>
                  </button>

                  <button
                    onClick={() => {
                      setDrawerMode(drawerMode === 'elder' ? 'closed' : 'elder')
                    }}
                    className={`p-1 px-2 h-[28px] rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono font-bold ${
                      drawerMode === 'elder'
                        ? 'bg-[var(--nb-teal-muted)] border-[var(--nb-teal)] text-[var(--nb-teal)] shadow'
                        : theme === 'light'
                        ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-[var(--nb-teal)]/30'
                        : 'bg-stone-900/50 border-[var(--nb-border)] text-[var(--nb-text-dim)] hover:border-[var(--nb-teal)]/30 hover:text-[var(--nb-text-muted)]'
                    }`}
                    title="Consult Elder Stephen assistant"
                    id="btn-drawer-elder"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>ELDER</span>
                  </button>
                </div>
              </div>

              {/* Major Notebook renders */}
              <div className="flex-1 overflow-hidden flex flex-col" id="stage-editor-mount">
                {renderElderStephenStatusBar()}
                <div className="flex-1 overflow-hidden flex flex-col h-full min-h-0">
                  <NoteErrorBoundary
                    fallbackContent={activeNote.content}
                    onSwitchToDraft={() => setEditorMode('draft')}
                  >
                    <NoteRender 
                      note={activeNote} 
                      mode={editorMode} 
                      fontSize={editorFontSize}
                      onUpdate={handleUpdateNoteContent} 
                      onScriptureClick={(scrip) => {
                        setClickedScripture(scrip)
                        setCurrentPassage(scrip)
                        setDrawerMode('elder')
                        setMobileTab('elder')
                      }}
                    />
                  </NoteErrorBoundary>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state Workspace */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 bg-stone-950/5 select-none" id="note-empty-screen">
              <BookOpen className="w-12 h-12 text-[var(--nb-text-dim)] animate-pulse" />
              <div className="flex flex-col gap-1 max-w-[280px]">
                <h3 className="text-sm font-semibold text-[var(--nb-text-muted)]">No note selected</h3>
                <p className="text-[11px] text-[var(--nb-text-dim)] leading-relaxed">
                  Select an investigative theological study from the library panel or spawn an empty script work page.
                </p>
              </div>

              <button
                onClick={handleCreateNewNote}
                className="mt-2 px-4 py-2 bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] border border-[var(--nb-border-gold)] rounded-lg hover:bg-[var(--nb-gold)] hover:text-stone-950 text-xs font-mono font-bold font-semibold transition-all cursor-pointer shadow-md"
                id="empty-btn-create"
              >
                + SPAWN BLANK Note
              </button>
            </div>
          )}
        </div>


        {/* PANEL 4: RIGHT DRAWER CONTAINER */}
        <div 
          className="bg-[var(--nb-card)] border-l border-[var(--nb-border)] transition-all duration-300 relative shrink-0 flex flex-col h-full overflow-hidden"
          style={{ width: drawerMode === 'closed' ? '0px' : '380px', borderLeftColor: drawerMode === 'closed' ? 'transparent' : 'rgba(255,255,255,0.07)' }}
          id="panel-right-drawer"
        >
          {drawerMode !== 'closed' && (
            <div className="flex flex-col h-full relative" id="drawer-loaded-space bg-stone-950/20">
              {/* Drawer header close anchor */}
              <button
                onClick={() => setDrawerMode('closed')}
                className="absolute top-3.5 right-3.5 p-1 rounded-md text-[var(--nb-text-dim)] hover:text-[var(--nb-text-muted)] hover:bg-white/5 transition-colors z-20 cursor-pointer"
                title="Collapse study drawer"
                id="btn-close-drawer animate-fade-in"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Dynamic active drawer component mount */}
              <div className="flex-1 overflow-hidden h-full">
                {drawerMode === 'mastery' && activeNote ? (
                  <MasteryReview note={activeNote} onClose={() => setDrawerMode('closed')} />
                ) : drawerMode === 'elder' ? (
                  <ElderStephenChat 
                    note={activeNote} 
                    triggerScripture={clickedScripture}
                    onClearTriggerScripture={() => setClickedScripture('')}
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>

      </div>


      {/* MOBILE TABBED VIEW OVERLAY (Viewport < 1024px) */}
      <div className="lg:hidden flex flex-col h-full overflow-hidden bg-[var(--nb-bg)]" id="mobile-notebook-frame">
        
        {/* Mobile Page Header status bar */}
        <div className="bg-[var(--nb-sidebar)] px-4 py-3 border-b border-[var(--nb-border)] shrink-0 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[var(--nb-gold)]" />
            <span className="font-serif font-extrabold text-[#C9973A] text-sm tracking-wide">STBA Notebook</span>
          </div>

          <div className="flex items-center gap-2">
            {mobileTab === 'notes' && (
              <button
                onClick={handleCreateNewNote}
                className="p-1 px-2.5 rounded bg-[var(--nb-gold-muted)] border border-[var(--nb-border-gold)] text-[var(--nb-gold)] font-mono text-[10px] font-bold"
                id="btn-create-note-mobile-header"
              >
                + NOTE
              </button>
            )}

            {mobileTab === 'study' && activeNote && (
              <div className={`flex rounded p-0.5 text-[10px] border ${
                theme === 'light' ? 'bg-stone-100 border-stone-200' : 'bg-stone-900 border-[var(--nb-border)]'
              }`}>
                <button 
                  onClick={() => setEditorMode('read')} 
                  className={`px-2 py-0.5 rounded transition bg-transparent ${
                    editorMode === 'read' 
                      ? 'bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] font-bold' 
                      : theme === 'light' ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  Read
                </button>
                <button 
                  onClick={() => setEditorMode('draft')} 
                  className={`px-2 py-0.5 rounded transition bg-transparent ${
                    editorMode === 'draft' 
                      ? 'bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] font-bold' 
                      : theme === 'light' ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  Draft
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile main tab viewport mount */}
        <div className="flex-1 overflow-hidden" id="mobile-tab-mount">
          
          {/* TAB 1: NOTES/LIBRARY VIEW */}
          {mobileTab === 'notes' && (
            <div className="h-full flex flex-col" id="mobile-notes-feed">
              {/* Top search & Filter info */}
              <div className="p-3 bg-stone-950/20 border-b border-[var(--nb-border)] space-y-2 select-none">
                <div className="flex items-center gap-2 bg-white/5 border border-[var(--nb-border)] rounded-md px-2.5 py-1">
                  <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <input
                    type="text"
                    id="mobile-search-input"
                    placeholder="Search titles & scriptures..."
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs font-sans text-[var(--nb-text)]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Horizontal Category selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none" id="mobile-category-slider">
                  {(Object.keys(categories) as NoteCategory[]).map((catKey) => {
                    const cat = categories[catKey]
                    const isActive = activeCategory === catKey
                    return (
                      <button
                        key={catKey}
                        onClick={() => setActiveCategory(catKey)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap shrink-0 transition-colors border cursor-pointer ${
                          isActive
                            ? 'bg-[var(--nb-gold-muted)] border-[var(--nb-fold)] text-[var(--nb-gold)] font-bold'
                            : 'bg-stone-900 border-[var(--nb-border)] text-stone-400'
                        }`}
                      >
                        {cat.code} {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Note cards feed list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-stone-950/5">
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-[var(--nb-text-dim)] font-mono italic text-center py-10">No matching scripture notes available.</p>
                ) : (
                  filteredNotes.map((noteItem) => {
                    const isActive = noteItem.id === selectedNoteId
                    const meta = categories[noteItem.category] || categories.custom

                    return (
                      <div
                        key={noteItem.id}
                        onClick={() => {
                          setSelectedNoteId(noteItem.id)
                          setMobileTab('study')
                        }}
                        className={`p-3 rounded-lg border flex flex-col gap-1.5 select-none ${
                          isActive 
                            ? 'bg-[var(--nb-card-hover)] border-[var(--nb-border-gold)]'
                            : 'bg-[var(--nb-card)] border-[var(--nb-border)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border"
                            style={{ backgroundColor: `${meta.color}20`, borderColor: `${meta.color}35`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[9px] font-mono text-stone-500">
                            {new Date(noteItem.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-[var(--nb-text)]">{noteItem.title}</h4>
                        <p className="text-[11px] text-[var(--nb-text-muted)] line-clamp-2 leading-relaxed">{noteItem.summary}</p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE STUDY WORKSPACE */}
          {mobileTab === 'study' && (
            <div className="h-full flex flex-col" id="mobile-study-workspace">
              {activeNote ? (
                <div className="flex-1 overflow-hidden h-full flex flex-col">
                  {renderElderStephenStatusBar()}
                  <div className="flex-1 overflow-hidden flex flex-col h-full min-h-0">
                    <NoteErrorBoundary
                      fallbackContent={activeNote.content}
                      onSwitchToDraft={() => setEditorMode('draft')}
                    >
                      <NoteRender 
                        note={activeNote} 
                        mode={editorMode} 
                        fontSize={editorFontSize}
                        onUpdate={handleUpdateNoteContent} 
                        onScriptureClick={(scrip) => {
                          setClickedScripture(scrip)
                          setMobileTab('elder')
                        }}
                      />
                    </NoteErrorBoundary>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                  <Archive className="w-10 h-10 text-[var(--nb-text-dim)] animate-bounce" />
                  <span className="text-xs font-mono text-[var(--nb-text-muted)]">No active study note selected.</span>
                  <button
                    onClick={() => setMobileTab('notes')}
                    className="px-4 py-1.5 rounded bg-[var(--nb-gold-muted)] border border-[var(--nb-border-gold)] text-[var(--nb-gold)] font-mono text-xs"
                  >
                    Open Library Index
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CSMS MASTERY EXAMS */}
          {mobileTab === 'review' && (
            <div className="h-full flex flex-col overflow-hidden" id="mobile-review-workspace">
              {activeNote ? (
                <MasteryReview note={activeNote} onClose={() => setMobileTab('study')} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-2">
                  <Brain className="w-10 h-10 text-[var(--nb-text-dim)]" />
                  <span className="text-xs font-mono text-[var(--nb-text-muted)]">Please select a note to test recall.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ELDER STEPHEN CHAT */}
          {mobileTab === 'elder' && (
            <div className="h-full flex flex-col overflow-hidden animate-fade-in" id="mobile-elder-workspace">
              <ElderStephenChat 
                note={activeNote} 
                triggerScripture={clickedScripture}
                onClearTriggerScripture={() => setClickedScripture('')}
              />
            </div>
          )}

        </div>

        {/* Mobile Navigation controls bottom tab bar */}
        <div 
          className="bg-[var(--nb-sidebar)] h-[56px] border-t border-[var(--nb-border)] shrink-0 flex items-center justify-around text-center select-none"
          id="mobile-bottom-nav-bar"
        >
          <button
            onClick={() => setMobileTab('notes')}
            className={`flex flex-col items-center gap-1 cursor-pointer w-14 transition-colors ${mobileTab === 'notes' ? 'text-[var(--nb-gold)]' : 'text-stone-500'}`}
          >
            <BookMarked className="w-4 h-4" />
            <span className="text-[10px] font-mono">Notes</span>
          </button>

          <button
            onClick={() => setMobileTab('study')}
            className={`flex flex-col items-center gap-1 cursor-pointer w-14 transition-colors ${mobileTab === 'study' ? 'text-[var(--nb-gold)]' : 'text-stone-500'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] font-mono">Study</span>
          </button>

          <button
            onClick={() => setMobileTab('review')}
            className={`flex flex-col items-center gap-1 cursor-pointer w-14 transition-colors ${mobileTab === 'review' ? 'text-[var(--nb-gold)]' : 'text-stone-500'}`}
          >
            <Brain className="w-4 h-4" />
            <span className="text-[10px] font-mono">Review</span>
          </button>

          <button
            onClick={() => setMobileTab('elder')}
            className={`flex flex-col items-center gap-1 cursor-pointer w-14 transition-colors ${mobileTab === 'elder' ? 'text-[var(--nb-gold)]' : 'text-stone-500'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] font-mono">Elder</span>
          </button>
        </div>

      </div>


      {/* ADD CUSTOM CATEGORY MODAL DIALOG popup */}
      {showAddCategoryModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 select-none animate-fade-in"
          id="custom-category-modal"
        >
          <form 
            onSubmit={handleAddCategory}
            className="w-full max-w-[340px] bg-[var(--nb-card)] rounded-xl border border-[var(--nb-border)] p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-medium text-[var(--nb-text)]">New Scripture Subject</span>
              <button 
                type="button" 
                onClick={() => setShowAddCategoryModal(false)}
                className="text-stone-500 hover:text-stone-300 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[var(--nb-text-dim)] uppercase font-sans font-medium tracking-wider">Subject Title</label>
                <input
                  type="text"
                  required
                  id="new-cat-title-input"
                  placeholder="e.g. Prophecy Keys"
                  className="bg-stone-900 border border-[var(--nb-border)] rounded p-2 text-[var(--nb-text)] font-sans font-normal text-xs focus:outline-none focus:border-[var(--nb-gold)]"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--nb-text-dim)] uppercase font-sans font-medium tracking-wider">Abbr Code</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. PK"
                    className="bg-stone-900 border border-[var(--nb-border)] rounded p-2 text-center text-[var(--nb-text)] font-sans font-normal text-xs focus:outline-none focus:border-[var(--nb-gold)]"
                    value={newCatCode}
                    onChange={(e) => setNewCatCode(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--nb-text-dim)] uppercase font-sans font-medium tracking-wider">Badge Color</label>
                  <input
                    type="color"
                    className="w-full bg-stone-900 border border-[var(--nb-border)] rounded h-9 p-0.5 cursor-pointer"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="flex-1 py-2 bg-stone-900 hover:bg-stone-850 text-stone-400 font-sans font-normal text-xs rounded border border-[var(--nb-border)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[var(--nb-gold-muted)] border border-[var(--nb-border-gold)] text-[var(--nb-gold)] hover:bg-[var(--nb-gold)] hover:text-stone-950 font-sans font-medium text-xs rounded transition-all cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic Context Menu portal overlay for Right-Click / Touch Long-Press */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="fixed z-50 bg-[#121212]/95 backdrop-blur-md border border-[var(--nb-border-gold)]/40 rounded-lg shadow-2xl py-1 min-w-[210px] text-left ring-1 ring-black/50"
          style={{ 
            top: `${Math.min(contextMenu.y, window.innerHeight - 150)}px`, 
            left: `${Math.min(contextMenu.x, window.innerWidth - 225)}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-[var(--nb-border)]/40 text-[10px] font-mono text-[var(--nb-text-dim)] uppercase tracking-wider block">
            Note Assignment
          </div>

          {/* Add Sub Note trigger */}
          <div className="relative group/submenu">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowSubMenu(prev => !prev)
              }}
              className="w-full text-left px-4 py-2 hover:bg-stone-850 text-[12px] font-sans text-stone-200 hover:text-[var(--nb-gold)] flex items-center justify-between cursor-pointer border-none bg-transparent"
            >
              <span>Add as Sub-Note to...</span>
              <ChevronRight className={`w-3.5 h-3.5 text-stone-500 transition-transform ${showSubMenu ? 'rotate-90' : ''}`} />
            </button>
            
            {/* Hover/Click Submenu listing potential parents with smart right/left flyout */}
            <div 
              className={`absolute top-0 bg-[#121212]/95 backdrop-blur-md border border-[var(--nb-border-gold)]/45 rounded-lg shadow-2xl py-1 min-w-[190px] max-h-[220px] overflow-y-auto ${
                showSubMenu ? 'block' : 'hidden group-hover/submenu:block'
              } ${
                contextMenu.x > window.innerWidth - 420 ? 'right-full mr-1.5' : 'left-full ml-1.5'
              }`}
            >
              {getPotentialParents(contextMenu.noteId).length === 0 ? (
                <div className="px-4 py-2 text-[11px] font-sans text-stone-500 italic">No candidate parents available</div>
              ) : (
                getPotentialParents(contextMenu.noteId).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAssignSubNote(contextMenu.noteId, p.id)
                      setContextMenu(null)
                    }}
                    className="w-full text-left px-4 py-1.5 hover:bg-stone-850 hover:text-[var(--nb-gold)] text-[11.5px] font-sans text-stone-300 truncate cursor-pointer border-none bg-transparent"
                    title={p.title}
                  >
                    {p.title || 'Untitled Note'}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Is Sub Note Check: Detach Option */}
          {notes.some(n => n.children && n.children.includes(contextMenu.noteId)) && (
            <button
              type="button"
              onClick={() => {
                handleDetachSubNote(contextMenu.noteId)
                setContextMenu(null)
              }}
              className="w-full text-left px-4 py-2 hover:bg-stone-850 text-[12px] font-sans text-amber-500 hover:text-amber-400 border-t border-[var(--nb-border)]/40 mt-1 cursor-pointer flex items-center justify-between border-b-0 border-l-0 border-r-0 bg-transparent"
            >
              <span>Move back to root list</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Sync alert banner */}
      {syncAlert && (
        <div 
          className={`fixed bottom-6 right-6 z-[9999] max-w-[320px] rounded-lg border p-3 shadow-lg flex items-start gap-2.5 animate-slide-in font-sans ${
            syncAlert.type === 'success' 
              ? 'bg-[#18231c] border-emerald-500/30 text-emerald-300' 
              : 'bg-[#281816] border-rose-500/30 text-rose-300'
          }`}
          id="sync-alert-toast"
        >
          {syncAlert.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 text-rose-400 shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-semibold tracking-wide">
              {syncAlert.type === 'success' ? 'Cloud Synchronization' : 'Cloud Sync Alert'}
            </h4>
            <p className="text-[11px] leading-relaxed mt-0.5 text-opacity-80">
              {syncAlert.message}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setSyncAlert(null)}
            className="hover:opacity-100 opacity-60 text-stone-450 shrink-0 cursor-pointer bg-transparent border-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SUPABASE SQL SETUP INSTRUCTIONS MODAL */}
      {showDbConfigInstructions && (
        <div 
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 select-none animate-fade-in"
          id="supabase-setup-modal"
        >
          <div 
            className="w-full max-w-[550px] bg-[var(--nb-card)] rounded-xl border border-[var(--nb-border)] p-6 space-y-4 shadow-2xl font-sans text-left"
          >
            <div className="flex items-center justify-between border-b border-[var(--nb-border)]/50 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[var(--nb-gold)]" />
                <span className="text-sm font-sans font-semibold text-[var(--nb-text)]">Supabase Database Setup</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDbConfigInstructions(false)}
                className="text-stone-500 hover:text-stone-300 p-1 rounded cursor-pointer bg-transparent border-none"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-xs text-[var(--nb-text-dim)] leading-relaxed font-sans">
              To persist your STBA scripture studies in your custom cloud database, please create the <code className="font-mono px-1 py-0.5 bg-stone-900 rounded text-[var(--nb-gold)]">stba_study_notes</code> table in your Supabase SQL editor:
            </p>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-[var(--nb-text-muted)] font-mono px-1">
                <span>SQL QUERY EDITOR SCRIPT</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-[var(--nb-gold)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                >
                  {copiedSql ? '✓ Copied!' : 'Copy Script'}
                </button>
              </div>
              <pre className="w-full bg-stone-900/95 text-[var(--nb-text)] rounded-lg p-3 font-mono text-[10.5px] leading-relaxed overflow-x-auto border border-stone-850 border-dashed max-h-[220px] scrollbar-thin">
                {SCHEMA_SQL}
              </pre>
            </div>

            <div className="rounded-lg bg-stone-900/40 border border-[var(--nb-border)]/35 p-3 space-y-1.5 text-[11px] font-sans text-[var(--nb-text-dim)] leading-relaxed">
              <h5 className="font-semibold text-[var(--nb-text)] text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--nb-gold)]" />
                Quick Steps:
              </h5>
              <ol className="list-decimal pl-4.5 space-y-1">
                <li>Log in to your <strong>Supabase Dashboard</strong>.</li>
                <li>Select your project and click on the <strong>SQL Editor</strong> tab in the sidebar.</li>
                <li>Click <strong>New query</strong>, paste the script above, and press <strong>Run</strong>.</li>
                <li>Your study notes will instantly sync to the cloud in real-time!</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--nb-border)]/30">
              <button
                type="button"
                onClick={() => {
                  setShowDbConfigInstructions(false)
                  handleManualSync()
                }}
                className="px-4 py-2 rounded-md bg-[var(--nb-gold)] text-black hover:bg-[var(--nb-gold)]/90 transition-all duration-150 cursor-pointer font-sans font-semibold text-xs shadow border-none"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
