/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Brain,
  Video,
  Search,
  Filter,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Calendar
} from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { CollapsibleContainer } from "./CollapsibleContainer";
import {
  SavedVideoQuizAttempt,
  getSavedVideoQuizAttempts,
  clearVideoQuizAttempts,
  seedDefaultVideoQuizAttemptsIfEmpty,
  SSQ_VIDEO_QUIZ_EVENT
} from "../../utils/sabbathVideoQuizManager";

export const VideoQuizResultsSection: React.FC = () => {
  const { readingTheme, readingFontSize, lessonTitle } = useSabbathSchoolStore();
  const isLight = readingTheme === "light";

  const [attempts, setAttempts] = useState<SavedVideoQuizAttempt[]>(() => {
    return getSavedVideoQuizAttempts();
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [copiedToast, setCopiedToast] = useState(false);

  // Sync state whenever video quiz attempts are updated in the app
  useEffect(() => {
    const handleUpdate = () => {
      setAttempts(getSavedVideoQuizAttempts());
    };

    window.addEventListener(SSQ_VIDEO_QUIZ_EVENT, handleUpdate);
    return () => window.removeEventListener(SSQ_VIDEO_QUIZ_EVENT, handleUpdate);
  }, []);

  // Performance metrics
  const totalCount = attempts.length;
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const incorrectCount = totalCount - correctCount;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Filtered list
  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      // Channel filter
      if (selectedChannelFilter !== "all" && attempt.channel !== selectedChannelFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter === "correct" && !attempt.isCorrect) return false;
      if (selectedStatusFilter === "incorrect" && attempt.isCorrect) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = attempt.question.toLowerCase().includes(query);
        const matchesTitle = attempt.title.toLowerCase().includes(query);
        const matchesRef = attempt.scriptureRef.toLowerCase().includes(query);
        const matchesExpl = attempt.explanation.toLowerCase().includes(query);
        const matchesChannel = attempt.channelName.toLowerCase().includes(query);
        if (!matchesQuestion && !matchesTitle && !matchesRef && !matchesExpl && !matchesChannel) {
          return false;
        }
      }

      return true;
    });
  }, [attempts, selectedChannelFilter, selectedStatusFilter, searchQuery]);

  // Unique channels from attempts
  const availableChannels = useMemo(() => {
    const channelsMap = new Map<string, string>();
    attempts.forEach((a) => {
      channelsMap.set(a.channel, a.channelName);
    });
    return Array.from(channelsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [attempts]);

  const handleLaunchVideo = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ssq-open-video-modal"));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your video quiz history? You can always re-take checkpoints during video playback.")) {
      clearVideoQuizAttempts();
      setAttempts([]);
    }
  };

  const handleSeedSamples = () => {
    const seeded = seedDefaultVideoQuizAttemptsIfEmpty();
    setAttempts(seeded);
  };

  const handleCopySummary = () => {
    if (attempts.length === 0) return;
    const lines = [
      `# Sabbath School Video Quiz Results — ${lessonTitle || "SDA Weekly Study"}`,
      `Performance: ${correctCount}/${totalCount} Correct (${accuracy}% Accuracy)\n`,
      ...attempts.map((a, i) => {
        return [
          `### ${i + 1}. [${a.channelName}] ${a.title} (${a.timestampLabel})`,
          `**Scripture:** ${a.scriptureRef}`,
          `**Question:** ${a.question}`,
          `**Your Answer:** Option ${a.userAnswer} ${a.isCorrect ? "✓ (Correct)" : "✗ (Incorrect)"}`,
          `**Correct Answer:** Option ${a.correctAnswer}`,
          `**AI Doctrinal Exegesis:** ${a.explanation}`,
          `---\n`
        ].join("\n");
      })
    ];

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2400);
    }).catch(() => {});
  };

  const formatAnswerDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Recently";
    }
  };

  // Font size responsive scaling
  const getBodyFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-xs sm:text-sm leading-relaxed";
      case "md":
        return "text-sm sm:text-base leading-relaxed";
      case "lg":
      case "xl":
        return "text-base sm:text-lg leading-relaxed";
      default:
        return "text-sm sm:text-base leading-relaxed";
    }
  };

  return (
    <CollapsibleContainer
      id="sabbath-video-quiz-results-section"
      title="Quiz Results"
      subtitle={`Review previous answers & AI doctrinal explanations for "${lessonTitle || "Current Lesson"}"`}
      badge={totalCount > 0 ? `${correctCount}/${totalCount} Correct (${accuracy}%)` : "0 Answered"}
      icon={<GraduationCap size={18} />}
      defaultOpen={false}
      className="mb-6 w-full"
    >
      <div className="space-y-5 w-full text-left">
        {/* TOP SUMMARY & ACTION CONTROLS */}
        {totalCount > 0 ? (
          <div className="space-y-4">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                  isLight
                    ? "bg-[#FAF7F2] border-[#E8DFD3] text-stone-900"
                    : "bg-[#1C212B] border-[#2A313C] text-neutral-100"
                }`}
              >
                <span className="text-[11px] font-mono uppercase tracking-wider opacity-70">
                  Total Answered
                </span>
                <span className="text-xl sm:text-2xl font-sans font-black mt-0.5">
                  {totalCount}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                  isLight
                    ? "bg-[#FAF7F2] border-[#E8DFD3] text-stone-900"
                    : "bg-[#1C212B] border-[#2A313C] text-neutral-100"
                }`}
              >
                <span className="text-[11px] font-mono uppercase tracking-wider opacity-70">
                  Accuracy
                </span>
                <span
                  className={`text-xl sm:text-2xl font-sans font-black mt-0.5 ${
                    accuracy >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : accuracy >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {accuracy}%
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                  isLight
                    ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
                    : "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                }`}
              >
                <span className="text-[11px] font-mono uppercase tracking-wider opacity-75">
                  Correct
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xl sm:text-2xl font-sans font-black">
                    {correctCount}
                  </span>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                  isLight
                    ? "bg-amber-50/60 border-amber-200/80 text-amber-950"
                    : "bg-amber-950/20 border-amber-800/40 text-amber-300"
                }`}
              >
                <span className="text-[11px] font-mono uppercase tracking-wider opacity-75">
                  Needs Review
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <XCircle size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xl sm:text-2xl font-sans font-black">
                    {incorrectCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? "text-stone-400" : "text-neutral-500"
                  }`}
                />
                <input
                  id="quiz-results-search-input"
                  type="text"
                  placeholder="Search questions, doctrine, or scripture references..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-none ${
                    isLight
                      ? "bg-white border-[#E2DBD0] text-stone-900 placeholder:text-stone-400 focus:border-amber-600"
                      : "bg-[#181D26] border-[#2A313D] text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500"
                  }`}
                />
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Status Toggle Pills */}
                <div
                  className={`flex items-center p-0.5 rounded-xl border ${
                    isLight ? "bg-[#EFEAE2] border-[#DFD8CC]" : "bg-[#161B24] border-[#2B3240]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      selectedStatusFilter === "all"
                        ? isLight
                          ? "bg-white text-stone-900 shadow-2xs font-bold"
                          : "bg-[#252B38] text-white shadow-2xs font-bold"
                        : "text-stone-600 dark:text-neutral-400 hover:text-stone-900"
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("correct")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      selectedStatusFilter === "correct"
                        ? isLight
                          ? "bg-white text-emerald-800 shadow-2xs font-bold"
                          : "bg-[#252B38] text-emerald-300 shadow-2xs font-bold"
                        : "text-stone-600 dark:text-neutral-400 hover:text-stone-900"
                    }`}
                  >
                    ✓ Correct ({correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("incorrect")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      selectedStatusFilter === "incorrect"
                        ? isLight
                          ? "bg-white text-rose-800 shadow-2xs font-bold"
                          : "bg-[#252B38] text-rose-300 shadow-2xs font-bold"
                        : "text-stone-600 dark:text-neutral-400 hover:text-stone-900"
                    }`}
                  >
                    ✗ Review ({incorrectCount})
                  </button>
                </div>

                {/* Copy Summary Button */}
                <button
                  id="btn-copy-quiz-results"
                  type="button"
                  onClick={handleCopySummary}
                  title="Copy formatted review notes to clipboard"
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    isLight
                      ? "bg-white hover:bg-stone-100 border-[#DFD8CC] text-stone-800"
                      : "bg-[#1C212B] hover:bg-[#252B38] border-[#2E3644] text-neutral-200"
                  }`}
                >
                  {copiedToast ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Notes</span>
                    </>
                  )}
                </button>

                {/* Launch Video Player Button */}
                <button
                  id="btn-launch-video-from-results"
                  type="button"
                  onClick={handleLaunchVideo}
                  title="Open Sabbath School Video Player"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Video size={13} />
                  <span>Watch Videos</span>
                </button>
              </div>
            </div>

            {/* Channel Filters (if multiple channels exist) */}
            {availableChannels.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll-pane">
                <span className="text-[11px] font-mono text-stone-500 dark:text-neutral-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Filter size={11} /> Channel:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedChannelFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedChannelFilter === "all"
                      ? isLight
                        ? "bg-stone-900 text-white font-bold"
                        : "bg-amber-400 text-stone-950 font-bold"
                      : isLight
                      ? "bg-[#EFEAE2] text-stone-700 hover:bg-[#E5DFD5]"
                      : "bg-[#1E2430] text-neutral-300 hover:bg-[#283040]"
                  }`}
                >
                  All Channels
                </button>
                {availableChannels.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannelFilter(ch.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                      selectedChannelFilter === ch.id
                        ? isLight
                          ? "bg-stone-900 text-white font-bold"
                          : "bg-amber-400 text-stone-950 font-bold"
                        : isLight
                        ? "bg-[#EFEAE2] text-stone-700 hover:bg-[#E5DFD5]"
                        : "bg-[#1E2430] text-neutral-300 hover:bg-[#283040]"
                    }`}
                  >
                    {ch.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* LIST OF QUESTION RESULTS */}
        {filteredAttempts.length > 0 ? (
          <div className="space-y-4">
            {filteredAttempts.map((attempt, index) => {
              const isSelectedCorrect = attempt.isCorrect;

              return (
                <div
                  key={attempt.id || `${attempt.questionId}-${index}`}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isLight
                      ? "bg-white border-[#E8DFD3] shadow-2xs"
                      : "bg-[#161B23] border-[#252C39] shadow-2xs"
                  }`}
                >
                  {/* Card Header Bar */}
                  <div
                    className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight
                        ? "bg-[#FAF7F2] border-[#E8DFD3]"
                        : "bg-[#1A202A] border-[#252C39]"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Checkpoint Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-[#27303E] text-stone-800 dark:text-neutral-200 text-[11px] font-mono font-bold">
                        Checkpoint {attempt.checkpointIndex} • {attempt.timestampLabel}
                      </span>

                      {/* Channel Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[11px] font-mono font-semibold flex items-center gap-1">
                        <Video size={11} />
                        {attempt.channelName}
                      </span>

                      {/* Scripture Reference Pill */}
                      {attempt.scriptureRef && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-mono flex items-center gap-1">
                          <BookOpen size={11} />
                          {attempt.scriptureRef}
                        </span>
                      )}
                    </div>

                    {/* Result Status Indicator */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                          isSelectedCorrect
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {isSelectedCorrect ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>Review Needed</span>
                          </>
                        )}
                      </span>

                      <span className="text-[11px] text-stone-400 dark:text-neutral-500 font-mono flex items-center gap-1">
                        <Calendar size={11} />
                        {formatAnswerDate(attempt.answeredAt)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Question & Options */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Question Title & Prompt */}
                    <div>
                      <h4
                        className={`font-sans font-bold text-sm sm:text-base tracking-tight mb-1.5 ${
                          isLight ? "text-stone-900" : "text-neutral-100"
                        }`}
                      >
                        {attempt.title}
                      </h4>
                      <p
                        className={`font-sans ${getBodyFontSizeClass(readingFontSize)} ${
                          isLight ? "text-stone-700" : "text-neutral-200"
                        }`}
                      >
                        {attempt.question}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-2">
                      {attempt.options.map((opt) => {
                        const isUserAnswer = opt.id === attempt.userAnswer;
                        const isCorrectAnswer = opt.id === attempt.correctAnswer;

                        let optionStyle = isLight
                          ? "bg-[#FAF8F5] border-[#E8DFD3] text-stone-700"
                          : "bg-[#1C222D] border-[#293241] text-neutral-300";

                        if (isUserAnswer && isCorrectAnswer) {
                          optionStyle = isLight
                            ? "bg-emerald-50 border-emerald-400/80 text-emerald-950 ring-1 ring-emerald-400/40"
                            : "bg-emerald-950/30 border-emerald-500/60 text-emerald-100 ring-1 ring-emerald-500/40";
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          optionStyle = isLight
                            ? "bg-rose-50 border-rose-400/80 text-rose-950 ring-1 ring-rose-400/40"
                            : "bg-rose-950/30 border-rose-500/60 text-rose-100 ring-1 ring-rose-500/40";
                        } else if (!isUserAnswer && isCorrectAnswer) {
                          optionStyle = isLight
                            ? "bg-emerald-50/40 border-emerald-300/80 text-emerald-900"
                            : "bg-emerald-950/20 border-emerald-600/40 text-emerald-200";
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 sm:p-3.5 rounded-xl border flex items-start justify-between gap-3 text-left transition-all ${optionStyle}`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-mono text-xs font-bold ${
                                  isUserAnswer && isCorrectAnswer
                                    ? "bg-emerald-600 text-white"
                                    : isUserAnswer && !isCorrectAnswer
                                    ? "bg-rose-600 text-white"
                                    : isCorrectAnswer
                                    ? "bg-emerald-700 text-white"
                                    : isLight
                                    ? "bg-stone-200 text-stone-700"
                                    : "bg-[#283141] text-neutral-300"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="text-xs sm:text-sm font-sans pt-0.5 leading-relaxed">
                                {opt.text}
                              </span>
                            </div>

                            {/* Status Tag on Option */}
                            <div className="shrink-0 flex items-center gap-1.5">
                              {isUserAnswer && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold whitespace-nowrap flex items-center gap-1 ${
                                    isCorrectAnswer
                                      ? "bg-emerald-600 text-white"
                                      : "bg-rose-600 text-white"
                                  }`}
                                >
                                  {isCorrectAnswer ? (
                                    <>
                                      <CheckCircle2 size={11} />
                                      <span>Your Answer</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={11} />
                                      <span>Your Answer</span>
                                    </>
                                  )}
                                </span>
                              )}

                              {!isUserAnswer && isCorrectAnswer && (
                                <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold whitespace-nowrap flex items-center gap-1">
                                  <CheckCircle2 size={11} />
                                  <span>Correct Answer</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI DOCTRINAL EXEGESIS & THEOLOGICAL EXPLANATION */}
                    <div
                      className={`p-4 rounded-xl border relative overflow-hidden ${
                        isLight
                          ? "bg-[#FEF9ED] border-[#F4DCB0] text-stone-900"
                          : "bg-[#1D1B17] border-[#4A3D22] text-amber-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isLight
                                ? "bg-amber-100 text-amber-900"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            <Brain size={15} />
                          </div>
                          <h5 className="font-sans font-bold text-xs sm:text-sm tracking-tight text-amber-950 dark:text-amber-200">
                            AI Doctrinal Exegesis & Theological Explanation
                          </h5>
                        </div>

                        {attempt.scriptureRef && (
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/20">
                            {attempt.scriptureRef}
                          </span>
                        )}
                      </div>

                      <p
                        className={`font-sans text-xs sm:text-sm leading-relaxed pl-1 ${
                          isLight ? "text-stone-800" : "text-neutral-200"
                        }`}
                      >
                        {attempt.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : totalCount > 0 ? (
          /* Filtered empty state */
          <div
            className={`p-8 rounded-2xl border text-center space-y-3 ${
              isLight
                ? "bg-[#FAF7F2] border-[#E8DFD3] text-stone-600"
                : "bg-[#161B23] border-[#252C39] text-neutral-400"
            }`}
          >
            <Search size={28} className="mx-auto text-amber-500/60" />
            <p className="text-sm font-sans font-medium">
              No quiz attempts match your active filter or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedChannelFilter("all");
                setSelectedStatusFilter("all");
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-600 text-white cursor-pointer hover:bg-amber-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* INITIAL EMPTY STATE */
          <div
            className={`p-8 sm:p-10 rounded-2xl border text-center space-y-4 ${
              isLight
                ? "bg-[#FAF7F2] border-[#E8DFD3] text-stone-800"
                : "bg-[#161B23] border-[#252C39] text-neutral-200"
            }`}
          >
            <div
              className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                isLight
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}
            >
              <GraduationCap size={28} />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-base sm:text-lg font-sans font-bold">
                No Video Quiz Checkpoints Answered Yet
              </h4>
              <p className="text-xs sm:text-sm font-sans text-stone-600 dark:text-neutral-400 leading-relaxed">
                As you watch Sabbath School video telecasts (Featured, Ellen White Notes, It Is Written, Hope Sabbath School, or 3ABN), interactive checkpoint questions will prompt you to reflect. Your responses and the AI’s Scripture-aligned explanations will be saved here for your weekly study review.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="btn-launch-video-empty-state"
                type="button"
                onClick={handleLaunchVideo}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Video size={14} />
                <span>Launch Video Telecast</span>
              </button>

              <button
                id="btn-seed-sample-quiz-results"
                type="button"
                onClick={handleSeedSamples}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? "bg-white hover:bg-stone-100 border-[#DFD8CC] text-stone-800"
                    : "bg-[#1F2633] hover:bg-[#283244] border-[#2E3644] text-neutral-200"
                }`}
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Load Sample Quiz History</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER UTILITIES */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-neutral-800/60 text-xs font-mono text-stone-500 dark:text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              SDA Hermeneutics & Sola Scriptura Verification
            </span>

            <button
              id="btn-clear-quiz-history"
              type="button"
              onClick={handleClearHistory}
              title="Clear all recorded video quiz history"
              className="text-stone-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </CollapsibleContainer>
  );
};
