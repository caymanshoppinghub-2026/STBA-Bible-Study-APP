/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, PenLine, Save, RotateCcw, ExternalLink, Check, Sparkles } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { loadNotes, saveNotes } from "../../data/notebookData";
import { saveNoteToSupabase } from "../../lib/notebookSync";
import { StudyNote } from "../../types/notebook";

interface WeeklyNotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyNotebookDrawer: React.FC<WeeklyNotebookDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    weeklyReflection,
    setWeeklyReflection,
    dailyLessons,
    selectedDayIndex,
    lessonTitle,
    quarterlyTitle
  } = useSabbathSchoolStore();

  const activeDay = dailyLessons?.[selectedDayIndex];
  const [localReflection, setLocalReflection] = useState(weeklyReflection);
  const [noteTitle, setNoteTitle] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalReflection(weeklyReflection);
      setNoteTitle(
        activeDay
          ? `${activeDay.label}: ${activeDay.title}`
          : lessonTitle || "Sabbath School Study Note"
      );
      setSaveSuccess(false);
    }
  }, [isOpen, weeklyReflection, activeDay, lessonTitle]);

  const handleSave = () => {
    setWeeklyReflection(localReflection);

    if (localReflection.trim()) {
      const generatedId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `vault-ssq-${Date.now()}`;
      const title =
        noteTitle.trim() ||
        `${activeDay?.label || "Sabbath School"}: ${activeDay?.title || lessonTitle || "Daily Note"}`;

      const newNote: StudyNote = {
        id: generatedId,
        title,
        summary: localReflection.trim().slice(0, 160),
        content: `# ${title}\n\n*Context: ${quarterlyTitle || "Sabbath School"} • ${lessonTitle || ""}*\n\n${localReflection.trim()}`,
        category: "theology",
        scriptureTags: ["SabbathSchool", `Day${selectedDayIndex + 1}`],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        children: [],
        order: -1
      };

      const existing = loadNotes();
      saveNotes([newNote, ...existing]);
      saveNoteToSupabase(newNote).catch(() => {});
      window.dispatchEvent(new CustomEvent("stba-note-created", { detail: newNote }));
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setLocalReflection(weeklyReflection);
  };

  if (!isOpen) return null;

  return (
    <div
      id="notebook-drawer-overlay"
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex justify-end transition-opacity duration-300 font-['Lato',sans-serif] not-italic"
      onClick={onClose}
    >
      <div
        id="notebook-drawer-container"
        style={{ fontFamily: "'Lato', sans-serif" }}
        className="w-full max-w-xl bg-[#0B111E] border-l border-[#C9973A]/40 h-full flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300 text-stone-100 font-['Lato',sans-serif] not-italic"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="p-5 bg-[#0F172A] border-b border-[#C9973A]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-[#C9973A]/15 text-[#F3CF65] border border-[#C9973A]/40">
                <PenLine size={18} />
              </div>
              <div>
                <h3
                  style={{ fontFamily: "'Lato', sans-serif" }}
                  className="text-base font-bold text-white not-italic"
                >
                  Discipleship Vault • Sacred Outline Mapper
                </h3>
                <p
                  style={{ fontFamily: "'Lato', sans-serif" }}
                  className="text-xs text-[#C9973A] not-italic flex items-center gap-1 mt-0.5"
                >
                  <Sparkles size={12} />
                  <span>{activeDay ? `${activeDay.label}: ${activeDay.title}` : "Sabbath Sanctuary Notes"}</span>
                </p>
              </div>
            </div>

            <button
              id="btn-close-notebook-drawer"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 border border-stone-800 rounded-xl transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 flex-1 text-left">
            <div>
              <label
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="block text-xs font-bold uppercase tracking-wider text-stone-300 not-italic mb-1.5"
              >
                Note Title & Lesson Pillar
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="w-full px-3.5 py-2.5 bg-[#141E33] text-white border border-[#2E3E5C] rounded-xl text-sm not-italic focus:outline-none focus:border-[#C9973A] transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="block text-xs font-bold uppercase tracking-wider text-stone-300 not-italic mb-1.5"
              >
                Discipleship Reflection & Exegesis Notes
              </label>
              <textarea
                id="notebook-drawer-textarea"
                rows={14}
                value={localReflection}
                onChange={(e) => setLocalReflection(e.target.value)}
                placeholder="Search the Scriptures daily to see whether those things are so... Record your prayers, doctrinal reflections, and lesson annotations in the Discipleship Vault."
                style={{ fontFamily: "'Lato', sans-serif" }}
                className="w-full bg-[#141E33] border border-[#2E3E5C] rounded-xl p-4 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C9973A] transition not-italic resize-none custom-scroll h-[360px] leading-relaxed shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Action Bottom Section */}
        <div className="p-4 bg-[#0F172A] border-t border-[#C9973A]/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/notebook");
            }}
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="px-3.5 py-2 rounded-xl bg-[#141E33] hover:bg-[#1C2A46] border border-[#2E3E5C] text-xs font-bold text-stone-200 hover:text-[#F3CF65] flex items-center gap-1.5 transition cursor-pointer not-italic"
          >
            <span>Open Full Vault</span>
            <ExternalLink size={13} />
          </button>

          <div className="flex gap-2.5">
            <button
              id="btn-reset-notebook-drawer"
              onClick={handleReset}
              title="Revert unsaved draft"
              style={{ fontFamily: "'Lato', sans-serif" }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-300 hover:text-white border border-stone-700 hover:bg-stone-800 rounded-xl transition cursor-pointer not-italic"
            >
              <RotateCcw size={13} />
              <span>Revert</span>
            </button>
            <button
              id="btn-save-notebook-drawer"
              onClick={handleSave}
              style={{ fontFamily: "'Lato', sans-serif" }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#C9973A] hover:bg-[#D9A74A] text-stone-950 rounded-xl shadow-lg transition cursor-pointer not-italic"
            >
              {saveSuccess ? (
                <>
                  <Check size={14} />
                  <span>Saved to Discipleship Vault!</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save to Discipleship Vault</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
