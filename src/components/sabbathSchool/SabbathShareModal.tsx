/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Copy, Check, Share2, Mail, Printer, MessageSquare, BookOpen } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";

interface SabbathShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPrint?: () => void;
}

export const SabbathShareModal: React.FC<SabbathShareModalProps> = ({
  isOpen,
  onClose,
  onTriggerPrint
}) => {
  const { quarterlyTitle, lessonTitle, memoryVerse, dailyLessons, selectedDayIndex, readingTheme } =
    useSabbathSchoolStore();

  const isLight = readingTheme === "light";
  const activeDay = dailyLessons[selectedDayIndex] || dailyLessons[0];

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const shareText = `Study with me on Sabbath School Quarterly: "${lessonTitle}" - ${activeDay?.title}. Memory Verse: "${memoryVerse}"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Sabbath School Study: ${lessonTitle}`);
    const body = encodeURIComponent(`${shareText}\n\nStudy Link: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div
      id="sabbath-share-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 relative transition-all ${
          isLight
            ? "bg-[#FAF8F5] border-[#E8DDC6] text-stone-900 shadow-amber-900/10"
            : "bg-neutral-900 border-neutral-800 text-neutral-100 shadow-black/80"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Share2 size={18} />
            </div>
            <h3 className="text-base font-bold font-sans">Share Sabbath School Lesson</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        <div className={`p-4 rounded-2xl border mb-4 ${isLight ? "bg-white border-[#E8DDC6]" : "bg-neutral-950 border-neutral-850"}`}>
          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block mb-1">{quarterlyTitle}</span>
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-1">{lessonTitle}</h4>
          <p className="text-xs text-stone-600 dark:text-neutral-400 italic">"{memoryVerse}"</p>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className={`flex-1 px-3 py-2 text-xs font-mono rounded-xl border ${
                isLight ? "bg-stone-100 border-stone-300 text-stone-800" : "bg-neutral-950 border-neutral-800 text-neutral-300"
              }`}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-200/60 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleEmailShare}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              isLight ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800" : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200"
            }`}
          >
            <Mail size={14} className="text-amber-500" />
            <span>Email Study</span>
          </button>

          {onTriggerPrint && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTriggerPrint();
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                isLight ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800" : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200"
              }`}
            >
              <Printer size={14} className="text-amber-500" />
              <span>Print Lesson</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
