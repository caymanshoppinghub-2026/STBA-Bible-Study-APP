/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, CheckSquare, Save, RotateCcw } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";

interface WeeklyNotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyNotebookDrawer: React.FC<WeeklyNotebookDrawerProps> = ({ isOpen, onClose }) => {
  const { weeklyReflection, setWeeklyReflection } = useSabbathSchoolStore();
  const [localReflection, setLocalReflection] = useState(weeklyReflection);

  useEffect(() => {
    if (isOpen) {
      setLocalReflection(weeklyReflection);
    }
  }, [isOpen, weeklyReflection]);

  const handleSave = () => {
    setWeeklyReflection(localReflection);
    onClose();
  };

  const handleReset = () => {
    setLocalReflection(weeklyReflection);
  };

  if (!isOpen) return null;

  return (
    <div
      id="notebook-drawer-overlay"
      className="fixed inset-0 bg-neutral-955/70 backdrop-blur-md z-50 flex justify-end transition-opacity duration-350"
      onClick={onClose}
    >
      <div
        id="notebook-drawer-container"
        className="w-full max-w-lg bg-neutral-900 border-l border-neutral-800 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-neutral-800 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <CheckSquare size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Weekly Study Notebook
                </h3>
                <p className="text-[11px] text-neutral-450 font-mono uppercase tracking-wider">
                  Sabbath Sanctuary Notes
                </p>
              </div>
            </div>

            <button
              id="btn-close-notebook-drawer"
              onClick={onClose}
              className="p-2 text-neutral-450 hover:text-white hover:bg-neutral-800 border border-neutral-800 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Pour your prayers, doctrinal reflections, memory-verse lists, and general lesson annotations here. This is your personal sacred scroll.
          </p>

          <textarea
            id="notebook-drawer-textarea"
            rows={15}
            value={localReflection}
            onChange={(e) => setLocalReflection(e.target.value)}
            placeholder="Search the scriptures daily to see whether those things are so... Record your findings here."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs md:text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-amber-500 transition font-sans resize-none custom-scroll h-[400px] leading-relaxed shadow-inner"
          />
        </div>

        {/* Action Bottom Section */}
        <div className="pt-5 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-550 font-mono uppercase">
              Doc Integrity Status
            </span>
            <span className="text-xs font-mono font-bold text-amber-500">
              {localReflection.trim().length} Chars
            </span>
          </div>

          <div className="flex gap-3">
            <button
              id="btn-reset-notebook-drawer"
              onClick={handleReset}
              title="Revert unsaved draft"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800 rounded-xl transition"
            >
              <RotateCcw size={13} />
              <span>Revert</span>
            </button>
            <button
              id="btn-save-notebook-drawer"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl shadow-lg transition"
            >
              <Save size={13} />
              <span>Save & Seal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
