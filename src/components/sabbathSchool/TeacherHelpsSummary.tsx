/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Trash2, BarChart2, AlertCircle, Bookmark, CheckCircle2, ArrowRight } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { CollapsibleContainer } from "./CollapsibleContainer";

export const DiscussionDeckSection: React.FC = () => {
  const {
    deckCards,
    addDeckCard,
    deleteDeckCard,
    recordDiscussionAttempt,
    userRole,
    readingFontSize,
    readingTheme
  } = useSabbathSchoolStore();

  const isLight = readingTheme === "light";

  const getCardQuestionSizeClass = (size: string) => {
    switch (size) {
      case "sm": return "text-xs";
      case "md": return "text-sm";
      case "lg":
      case "xl": return "text-base sm:text-lg";
      default: return "text-xs";
    }
  };

  const getCardAnswerSizeClass = (size: string) => {
    switch (size) {
      case "sm": return "text-[11px]";
      case "md": return "text-xs sm:text-[13px]";
      case "lg":
      case "xl": return "text-sm sm:text-base";
      default: return "text-[11px]";
    }
  };

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [showAddForm, setShowAddForm] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  if (userRole !== "Teacher") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    addDeckCard({
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim()
    });

    setQuestion("");
    setAnswer("");
    setCategory("General");
    setShowAddForm(false);
    showNotification("Discussion card added & synced!");
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  return (
    <CollapsibleContainer
      id="discussion-deck-top-section"
      title="Discussion Deck Cards"
      subtitle="Primary interactive tool for teachers • Manage, add, and publish recall probes"
      badge={`${deckCards.length} Active Cards`}
      icon={<Bookmark size={18} />}
      defaultOpen={false}
      className="mb-6 border-amber-500/30"
      headerAction={
        <button
          type="button"
          id="btn-toggle-add-card"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition cursor-pointer"
        >
          <Plus size={14} />
          <span>{showAddForm ? "Cancel" : "Add Card"}</span>
        </button>
      }
    >
      <div className="space-y-4 text-left">
        {toastMsg && (
          <div className={`p-2.5 border text-xs rounded-lg font-mono flex items-center gap-2 ${
            isLight ? "bg-amber-100 border-amber-300 text-amber-900 font-bold" : "bg-amber-500/10 border-amber-500/20 text-amber-300"
          }`}>
            <CheckCircle2 size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Add Card Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className={`p-4 border rounded-xl space-y-3 animate-fade-in ${
              isLight ? "bg-stone-50 border-amber-400 text-stone-900" : "bg-neutral-950 border-amber-500/30 text-neutral-100"
            }`}
          >
            <h4 className={`text-xs font-mono uppercase font-bold ${isLight ? "text-amber-900" : "text-amber-400"}`}>
              + Create New Discussion Card
            </h4>
            <div>
              <label className={`block text-[10px] font-mono uppercase mb-1 ${isLight ? "text-stone-600" : "text-neutral-400"}`}>
                Discussion Prompt / Probe Question
              </label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How does Daniel 8:14 reveal Christ's high priestly advocacy?"
                className={`w-full rounded-lg px-3 py-2 text-xs transition focus:outline-none focus:border-amber-500 ${
                  isLight ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400" : "bg-neutral-900 border-neutral-800 text-neutral-200 placeholder-neutral-600"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[10px] font-mono uppercase mb-1 ${isLight ? "text-stone-600" : "text-neutral-400"}`}>
                  Correct Biblical Answer / Guide
                </label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g. It predicts the sanctuary cleansing in 1844..."
                  className={`w-full rounded-lg px-3 py-2 text-xs transition focus:outline-none focus:border-amber-500 ${
                    isLight ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400" : "bg-neutral-900 border-neutral-800 text-neutral-200 placeholder-neutral-600"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-mono uppercase mb-1 ${isLight ? "text-stone-600" : "text-neutral-400"}`}>
                  Category Tag
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="General"
                  className={`w-full rounded-lg px-3 py-2 text-xs transition focus:outline-none focus:border-amber-500 ${
                    isLight ? "bg-white border-stone-300 text-stone-900 placeholder-stone-400" : "bg-neutral-900 border-neutral-800 text-neutral-200 placeholder-neutral-600"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Confirm Card
              </button>
            </div>
          </form>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {deckCards.map((card, idx) => (
            <div
              key={card.id}
              className={`p-4 border rounded-xl relative group flex flex-col justify-between space-y-3 transition ${
                isLight
                  ? "bg-white border-stone-250 hover:border-amber-400 text-stone-900 shadow-xs"
                  : "bg-neutral-950 border-neutral-850 hover:border-amber-500/40 text-neutral-100"
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    isLight ? "bg-amber-100 text-amber-900 font-bold" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    Card {idx + 1} • {card.category || "General"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      deleteDeckCard(card.id);
                      showNotification("Card removed.");
                    }}
                    className="text-neutral-400 hover:text-red-500 opacity-80 hover:opacity-100 transition cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h5 className={`${getCardQuestionSizeClass(readingFontSize)} font-bold mb-1.5 leading-snug ${isLight ? "text-stone-900" : "text-white"}`}>
                  Q: {card.question}
                </h5>
                <p className={`${getCardAnswerSizeClass(readingFontSize)} leading-relaxed italic p-2 rounded-lg border ${
                  isLight ? "bg-stone-50 border-stone-200 text-stone-800" : "bg-neutral-900/60 border-neutral-850 text-neutral-350"
                }`}>
                  A: {card.answer}
                </p>
              </div>

              <div className={`flex justify-between items-center pt-2 border-t text-[10px] font-mono ${
                isLight ? "border-stone-200 text-stone-500" : "border-neutral-850/80 text-neutral-450"
              }`}>
                <span>Attempts: {card.totalAttempts || 0}</span>
                <button
                  type="button"
                  onClick={() => {
                    recordDiscussionAttempt(card.id);
                    showNotification(`Logged activity attempt for Card ${idx + 1}`);
                  }}
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-bold transition cursor-pointer"
                >
                  <span>Test Probe</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleContainer>
  );
};

export const ClassroomMetricsSection: React.FC = () => {
  const { classroomStats, userRole, readingTheme } = useSabbathSchoolStore();

  const isLight = readingTheme === "light";

  if (userRole !== "Teacher") return null;

  return (
    <CollapsibleContainer
      id="classroom-metrics-section"
      title="Classroom Metrics & Intelligence"
      subtitle="Dynamic real-time analytics synced with student daily activity"
      badge={classroomStats.totalStudents > 0 || classroomStats.complianceRate > 0 ? `${classroomStats.complianceRate}% Recall` : "Awaiting Activity"}
      icon={<BarChart2 size={18} />}
      defaultOpen={false}
      className="mb-6"
    >
      <div className="space-y-6 text-left">
        {/* Core numbers */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-xl border text-center ${
            isLight ? "bg-white border-stone-250 text-stone-900 shadow-xs" : "bg-neutral-950 border-neutral-850 text-white"
          }`}>
            <span className={`block text-2xl font-bold ${isLight ? "text-stone-900" : "text-white"}`}>{classroomStats.totalStudents}</span>
            <span className={`text-[9px] font-mono uppercase ${isLight ? "text-stone-500" : "text-neutral-400"}`}>Enrolled Students</span>
          </div>
          <div className={`p-3.5 rounded-xl border text-center ${
            isLight ? "bg-white border-stone-250 text-stone-900 shadow-xs" : "bg-neutral-950 border-neutral-850 text-white"
          }`}>
            <span className="block text-emerald-600 dark:text-emerald-400 text-2xl font-bold">{classroomStats.complianceRate}%</span>
            <span className={`text-[9px] font-mono uppercase ${isLight ? "text-stone-500" : "text-neutral-400"}`}>Student Activity</span>
          </div>
          <div className={`p-3.5 rounded-xl border text-center ${
            isLight ? "bg-white border-stone-250 text-stone-900 shadow-xs" : "bg-neutral-950 border-neutral-850 text-white"
          }`}>
            <span className="block text-amber-600 dark:text-amber-400 text-2xl font-bold">{classroomStats.activeDiscussions}</span>
            <span className={`text-[9px] font-mono uppercase ${isLight ? "text-stone-500" : "text-neutral-400"}`}>Discussions</span>
          </div>
        </div>

        {/* Topic gaps and struggles */}
        <div>
          <h4 className={`text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-1.5 ${
            isLight ? "text-stone-700 font-bold" : "text-neutral-400"
          }`}>
            <AlertCircle size={13} className="text-red-500" />
            <span>Struggling Topics (Top Classroom Gaps)</span>
          </h4>

          <div className="space-y-3">
            {classroomStats.gapsList && classroomStats.gapsList.length > 0 ? (
              classroomStats.gapsList.map((gap, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${
                  isLight ? "bg-white border-stone-250 text-stone-900 shadow-xs" : "bg-neutral-950 border-neutral-850"
                }`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`text-xs font-medium leading-tight ${isLight ? "text-stone-900 font-bold" : "text-neutral-200"}`}>
                      {gap.topic}
                    </span>
                    <span className="text-[10px] font-bold text-red-500 font-mono">
                      {gap.gapPercentage}% Gap
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? "bg-stone-200" : "bg-neutral-900"}`}>
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${gap.gapPercentage}%` }}
                    ></div>
                  </div>
                  <span className={`block text-[10px] font-mono mt-1.5 ${isLight ? "text-stone-500" : "text-neutral-450"}`}>
                    Based on {gap.count} student activity interactions in Sabbath School
                  </span>
                </div>
              ))
            ) : (
              <div className={`p-4 rounded-xl border text-center ${
                isLight ? "bg-stone-50 border-stone-200 text-stone-600" : "bg-neutral-900/60 border-neutral-800 text-neutral-400"
              }`}>
                <p className="text-xs font-sans leading-relaxed">
                  No classroom gaps or struggling topics detected yet. Intelligence insights will populate automatically as students enroll and engage in discussions and daily study activity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CollapsibleContainer>
  );
};

export const TeacherHelpsSummary: React.FC = () => {
  return (
    <div id="teacher-helps-summary" className="space-y-6">
      <DiscussionDeckSection />
      <ClassroomMetricsSection />
    </div>
  );
};
