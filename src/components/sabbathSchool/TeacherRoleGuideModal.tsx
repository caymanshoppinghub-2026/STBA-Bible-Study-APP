/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  Mail,
  Share2,
  Copy,
  Check,
  Users,
  Sparkles,
  Info,
  Send
} from "lucide-react";

interface TeacherRoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameInput?: string;
  classCodeInput?: string;
  setClassNameInput?: (val: string) => void;
  setClassCodeInput?: (val: string) => void;
  readingTheme?: "dark" | "light";
}

export const TeacherRoleGuideModal: React.FC<TeacherRoleGuideModalProps> = ({
  isOpen,
  onClose,
  classNameInput = "",
  classCodeInput = "",
  setClassNameInput,
  setClassCodeInput,
  readingTheme = "light"
}) => {
  const isLight = readingTheme === "light";
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentClassName = classNameInput.trim() || "My Sabbath School Class";
  const currentClassCode = classCodeInput.trim() || "SDA-CLASS-2026";

  const shareText = `Hi! You're invited to join our Sabbath School class on Study To Be Approved.\n\nClassroom Name: ${currentClassName}\nClassroom Code: ${currentClassCode}\n\nOpen Sabbath School Settings and enter this code to join our class roster & live study discussions.`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    showToast("Classroom invitation copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join our Sabbath School Class: ${currentClassName}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    showToast("Opening Email composer...");
  };

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    showToast("Opening WhatsApp...");
  };

  return (
    <div
      id="teacher-role-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all max-h-[90vh] flex flex-col ${
          isLight
            ? "bg-[#FAF8F5] border-[#E8DDC6] text-stone-900 shadow-amber-900/10"
            : "bg-neutral-900 border-neutral-800 text-neutral-100 shadow-black/90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200/60 dark:border-neutral-800 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
                  Sabbath School Teacher Guide
                </span>
                <span className="text-[9px] font-bold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full uppercase">
                  Teacher Mode
                </span>
              </div>
              <h3 className="text-base font-bold font-sans tracking-tight text-amber-950 dark:text-amber-300">
                Setting Up Your Classroom
              </h3>
            </div>
          </div>

          <button
            id="teacher-guide-modal-close"
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
            }`}
            title="Close Guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar shrink">
          {/* Main Info Callout */}
          <div
            className={`p-4 rounded-2xl border ${
              isLight
                ? "bg-white border-[#E8DDC6] text-stone-800"
                : "bg-neutral-950 border-neutral-850 text-neutral-200"
            }`}
          >
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs leading-relaxed">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  As a Sabbath School Teacher, you need to create a <strong>Classroom Name</strong> and a unique <strong>Classroom Code</strong> for students to join your class.
                </p>
                <p className="text-stone-600 dark:text-neutral-400">
                  Once created, you can easily share this classroom information with your students via <strong>Email</strong> or <strong>WhatsApp</strong> so they can enroll and sync with your study class.
                </p>
              </div>
            </div>
          </div>

          {/* Inline Classroom Name & Code Editor/Inputs */}
          {(setClassNameInput || setClassCodeInput) && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? "bg-amber-50/50 border-amber-200/70" : "bg-neutral-950/60 border-neutral-800"
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400 block">
                1. Define Your Classroom Credentials
              </span>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-stone-500 dark:text-neutral-400 block mb-1">
                    Classroom Name
                  </label>
                  <input
                    type="text"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput && setClassNameInput(e.target.value)}
                    placeholder="e.g. Berean Adult Sabbath School Class"
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isLight
                        ? "bg-white border-stone-300 text-stone-900"
                        : "bg-neutral-900 border-neutral-700 text-neutral-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-stone-500 dark:text-neutral-400 block mb-1">
                    Classroom Code
                  </label>
                  <input
                    type="text"
                    value={classCodeInput}
                    onChange={(e) => setClassCodeInput && setClassCodeInput(e.target.value)}
                    placeholder="e.g. SDA-BEREAN-2026"
                    className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-amber-600 dark:text-amber-400 ${
                      isLight
                        ? "bg-white border-stone-300"
                        : "bg-neutral-900 border-neutral-700"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invitation Preview Card */}
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              isLight
                ? "bg-stone-100/90 border-stone-200 text-stone-800"
                : "bg-neutral-950 border-neutral-800 text-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Users size={14} />
                <span>2. Share Invitation With Students</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs font-mono leading-relaxed whitespace-pre-wrap ${
                isLight
                  ? "bg-white border-stone-200 text-stone-700"
                  : "bg-neutral-900 border-neutral-800 text-neutral-300"
              }`}
            >
              {shareText}
            </div>
          </div>
        </div>

        {/* Modal Actions / Sharing Buttons */}
        <div className="pt-4 border-t border-stone-200/60 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 mt-2">
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Email Share Button */}
            <button
              id="teacher-guide-share-email"
              type="button"
              onClick={handleEmailShare}
              className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800"
                  : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200"
              }`}
            >
              <Mail size={15} className="text-amber-500" />
              <span>Share via Email</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              id="teacher-guide-share-whatsapp"
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send size={15} />
              <span>Share via WhatsApp</span>
            </button>
          </div>

          <button
            id="teacher-guide-confirm-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition cursor-pointer text-center"
          >
            Got It, Continue
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-amber-500/30 animate-fade-in flex items-center gap-2 z-50">
            <Check size={14} className="text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
