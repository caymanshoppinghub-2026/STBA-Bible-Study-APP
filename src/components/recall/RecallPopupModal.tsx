/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  ArrowRight,
  Minimize2,
  Maximize2,
  Bell,
  CheckCircle2,
  EyeOff
} from "lucide-react";
import {
  RecallQueueItem,
  DailyRecallProgress,
  getUserRecallSettings,
  getDailyRecallProgress,
  canTriggerRecallPopup,
  getNextDueVerse,
  recordPopupImpression,
  recordRecallCompletion,
  snoozeRecallPopup,
  postponeRecallForToday,
  getNextReminderTimeString
} from "../../utils/recallScheduler";
import { playReminderPingSound, playHooraySound } from "../../utils/audioFeedback";
import { MiniQuizComponent } from "./MiniQuizComponent";
import { useSabbathMode } from "../../context/SabbathMode";
import { useApp } from "../../context/AppContext";

export const RecallPopupModal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { user, showConfetti } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeVerse, setActiveVerse] = useState<RecallQueueItem | null>(null);
  const [progress, setProgress] = useState<DailyRecallProgress>(getDailyRecallProgress());
  const [isQuizExpanded, setIsQuizExpanded] = useState(true);
  const [currentQuizStep, setCurrentQuizStep] = useState<1 | 2 | 3>(1);
  const [completedState, setCompletedState] = useState<{
    score: number;
    nextDue: string;
    remaining: number;
    reminderNotice: string;
  } | null>(null);

  // Disable background scrolling whenever the popup is active and not minimized
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, isMinimized]);

  // Periodic scheduler timer to check when interval and decay conditions are satisfied
  const checkTriggerConditions = useCallback(() => {
    // If pop-up is already showing, do nothing
    if (isOpen) return;

    // Evaluate trigger condition: strictly requires signed-in user with customized settings
    const evaluation = canTriggerRecallPopup(location.pathname, user);
    setProgress(evaluation.progress);

    if (evaluation.canTrigger && evaluation.verse) {
      setActiveVerse(evaluation.verse);
      setCompletedState(null);
      setCurrentQuizStep(1);
      setIsQuizExpanded(true);
      setIsMinimized(false);
      setIsOpen(true);
      recordPopupImpression();
      // Play subtle reminder ping sound on appearance
      playReminderPingSound();
    }
  }, [isOpen, location.pathname, user]);

  // Immediately close if navigating to Home or public landing routes
  useEffect(() => {
    const normalizedPath = (location.pathname || "").trim().toLowerCase();
    const isHomePage =
      normalizedPath === "/" ||
      normalizedPath === "" ||
      normalizedPath === "/home" ||
      normalizedPath === "/landing" ||
      normalizedPath === "/welcome" ||
      normalizedPath === "/pricing" ||
      normalizedPath === "/walkthrough" ||
      normalizedPath === "/technology" ||
      normalizedPath === "/learn-more";

    if (isHomePage && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, isOpen]);

  // Check on initial load and whenever location changes (entering a new study mode)
  useEffect(() => {
    // Small delay on page navigation to allow view to stabilize before prompting
    const timer = setTimeout(() => {
      checkTriggerConditions();
    }, 3500);

    return () => clearTimeout(timer);
  }, [location.pathname, checkTriggerConditions]);

  // Set up periodic interval checker (every 45 seconds while in active study)
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkTriggerConditions();
    }, 45 * 1000);

    return () => clearInterval(intervalId);
  }, [checkTriggerConditions]);

  // Listen for manual trigger events or settings updates
  useEffect(() => {
    const handleManualTrigger = (e: any) => {
      const verse = e.detail?.verse || getNextDueVerse();
      if (verse) {
        setActiveVerse(verse);
        setCompletedState(null);
        setCurrentQuizStep(1);
        setIsQuizExpanded(true);
        setIsMinimized(false);
        setIsOpen(true);
        recordPopupImpression();
        playReminderPingSound();
      }
    };

    const handleRecallCompleted = (e: any) => {
      if (e.detail?.progress) {
        setProgress(e.detail.progress);
      }
    };

    window.addEventListener("stba-trigger-recall-popup", handleManualTrigger);
    window.addEventListener("stba-recall-completed", handleRecallCompleted);

    return () => {
      window.removeEventListener("stba-trigger-recall-popup", handleManualTrigger);
      window.removeEventListener("stba-recall-completed", handleRecallCompleted);
    };
  }, []);

  // Handle Mini-Quiz Submission
  const handleMiniQuizComplete = (score: number, answers: Record<string, any>, reflection: string) => {
    if (!activeVerse) return;

    const result = recordRecallCompletion(activeVerse.scriptureId, score, {
      isMiniQuiz: true,
      answers,
      reflectionNote: reflection
    });

    setProgress(result.updatedProgress);

    // Compute next reminder message
    const reminderInfo = getNextReminderTimeString(20);
    const reminderNotice =
      result.updatedProgress.remaining === 0
        ? "Daily Verse Goal Complete! Your next reminder is scheduled for tomorrow at 7:00 AM."
        : `Your next reminder is in 20 minutes (${reminderInfo.formattedTime}).`;

    setCompletedState({
      score,
      nextDue: result.nextDue,
      remaining: result.updatedProgress.remaining,
      reminderNotice
    });

    // 1. Play cheerful hooray sound
    playHooraySound();

    // 2. Trigger celebratory confetti
    showConfetti("recall", `Memory Reinforced! ${activeVerse.reference} scheduled for next review.`);
  };

  // Handle Deep Recall Navigation
  const handleNavigateToFullRecall = () => {
    if (!activeVerse) return;
    setIsOpen(false);
    navigate("/recall", {
      state: {
        scripture: {
          id: activeVerse.scriptureId,
          reference: activeVerse.reference,
          text: activeVerse.text,
          keywords: activeVerse.keywords
        },
        returnPath: location.pathname,
        fromPopup: true
      }
    });
  };

  // Snooze handlers
  const handleSnooze = (minutes = 15) => {
    snoozeRecallPopup(minutes);
    setIsOpen(false);
  };

  const handlePostponeToday = () => {
    postponeRecallForToday();
    setIsOpen(false);
  };

  if (!isOpen || !activeVerse) return null;

  return (
    <>
      {/* 1. BACKDROP OVERLAY & BACKGROUND SCROLL LOCK */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleSnooze(15)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
            id="recall-modal-backdrop"
          />
        )}
      </AnimatePresence>

      {/* 2. MODAL CARD CONTAINER */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? "bottom-4 right-4 pointer-events-auto max-w-sm w-full"
            : "inset-0 pointer-events-none flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        }`}
        id="stba-dynamic-recall-popup-root"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={`pointer-events-auto w-full transition-all duration-300 overflow-hidden flex flex-col ${
              isMinimized
                ? "rounded-2xl border shadow-2xl bg-white border-stone-200"
                : `max-w-xl max-h-[92vh] sm:max-h-[86vh] rounded-2xl border shadow-2xl my-auto ${
                    sabbathMode
                      ? "bg-[#FAF7F0] border-[#C9973A]/40 text-[#2C2314] shadow-[#C9973A]/20"
                      : "bg-white border-stone-200 text-stone-900 shadow-stone-900/30"
                  }`
            }`}
            id="stba-recall-popup-card"
          >
            {/* HEADER STRIP */}
            <div className="bg-[#1C2333] text-white p-3.5 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C9973A]/20 border border-[#C9973A]/40 flex items-center justify-center text-[#C9973A] shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base tracking-tight text-white">
                      Scripture Memorization Challenge
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C9973A] text-navy font-extrabold uppercase">
                      {activeVerse.decayStatus}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-stone-300">
                    Daily Goal: {progress.completedToday}/{progress.goal} Verses ({progress.remaining} remaining)
                  </p>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer hidden sm:inline-flex"
                  title={isMinimized ? "Expand prompt" : "Minimize"}
                  aria-label="Toggle Minimize"
                  id="popup-minimize-toggle"
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleSnooze(15)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Snooze 15 minutes"
                  aria-label="Snooze Recall"
                  id="popup-snooze-header-btn"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleSnooze(15)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Dismiss"
                  aria-label="Close"
                  id="popup-dismiss-header-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* COMPACT MINIMIZED VIEW */}
            {isMinimized ? (
              <div className="p-3 bg-stone-50 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-navy">{activeVerse.reference}</span>
                  <span className="text-stone-500 font-mono text-[11px]">awaiting retrieval</span>
                </div>
                <button
                  onClick={() => setIsMinimized(false)}
                  className="px-2.5 py-1 bg-[#1C2333] text-white rounded-lg text-xs font-mono font-bold hover:bg-navy cursor-pointer"
                >
                  Review Now
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* SUCCESS / COMPLETION CONFIRMATION STATE */}
                {completedState ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 text-center py-2"
                    id="recall-completion-celebration-view"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Memory Reinforced!</span>
                      </div>
                      <h4 className="font-serif font-bold text-xl text-navy pt-1">
                        Active Recall Verified!
                      </h4>
                      <p className="text-xs text-stone-600 max-w-sm mx-auto">
                        You successfully reinforced <strong>{activeVerse.reference}</strong>. Your retention curve has been updated.
                      </p>
                    </div>

                    {/* METRIC BADGES */}
                    <div className="grid grid-cols-2 gap-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-left">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                          Retrieval Accuracy
                        </span>
                        <span className="text-base font-mono font-extrabold text-emerald-600">
                          {completedState.score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block font-bold">
                          Next Due Date
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-800">
                          {new Date(completedState.nextDue).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    {/* NEXT REMINDER BANNER */}
                    <div className="p-3 bg-amber-50/70 border border-[#C9973A]/40 rounded-xl flex items-center space-x-2.5 text-left">
                      <div className="p-2 rounded-lg bg-[#C9973A]/15 text-[#8F6516] shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8F6516] font-bold block">
                          Schedule Update
                        </span>
                        <p className="text-xs font-serif font-bold text-stone-800">
                          {completedState.reminderNotice}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <button
                        onClick={handleNavigateToFullRecall}
                        className="text-xs text-[#C9973A] hover:text-[#8F6516] font-mono font-bold underline cursor-pointer w-full sm:w-auto py-1"
                      >
                        Practice in Full Studio
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#1C2333] hover:bg-navy text-white text-xs font-mono font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                        id="close-popup-after-complete-btn"
                      >
                        Done & Return to Study
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* SECTION A: VERSE PREVIEW */}
                    <div className="space-y-2 text-left" id="popup-verse-preview">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-[#C9973A]">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold">
                            {activeVerse.trackTitle}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-stone-400">
                          Stage {activeVerse.stage} • {activeVerse.intervalDays}d Spacing
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-[#C9973A]/30">
                        <div className="flex items-center justify-between pb-1">
                          <h4 className="font-serif font-bold text-base text-navy">
                            {activeVerse.reference}
                          </h4>
                          <span className="text-[10px] font-mono font-extrabold text-[#C9973A] bg-amber-100/80 px-2 py-0.5 rounded">
                            {currentQuizStep === 2 ? "Key Phrase Challenge" : "Target Passage"}
                          </span>
                        </div>
                        {currentQuizStep === 2 ? (
                          <div className="flex items-center space-x-2 py-2 px-3 bg-amber-100/70 border border-[#C9973A]/40 rounded-xl text-[#8F6516] text-xs font-mono mt-1">
                            <EyeOff className="w-4 h-4 shrink-0 text-[#8F6516]" />
                            <div>
                              <span className="font-bold block">Text Hidden for Active Recall</span>
                              <span className="text-[11px] text-stone-700">Retrieve and fill the missing keywords in Step 2 below.</span>
                            </div>
                          </div>
                        ) : (
                          <p className="font-bible italic text-xs sm:text-sm text-stone-800 leading-relaxed pt-1">
                            “{activeVerse.text}”
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SECTION B: INTERACTIVE MINI-RECALL QUIZ (COLLAPSIBLE / ACCORDION) */}
                    <div className="border border-stone-200/80 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => setIsQuizExpanded(!isQuizExpanded)}
                        className="w-full p-3 bg-stone-50 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-stone-200/60"
                        id="toggle-mini-quiz-accordion"
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9973A]" />
                          <span className="text-xs font-mono font-bold text-navy uppercase tracking-wider">
                            Interactive Memorization Steps
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-stone-400">
                          <span className="text-[11px] font-mono text-stone-500 font-medium">
                            {isQuizExpanded ? "Collapse" : "Expand 3 Steps"}
                          </span>
                          {isQuizExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </button>

                      {isQuizExpanded && (
                        <div className="p-3.5 sm:p-4">
                          <MiniQuizComponent
                            verse={activeVerse}
                            sabbathMode={sabbathMode}
                            activeStep={currentQuizStep}
                            onStepChange={(step) => setCurrentQuizStep(step)}
                            onComplete={handleMiniQuizComplete}
                            onOpenFullRecall={handleNavigateToFullRecall}
                          />
                        </div>
                      )}
                    </div>

                    {/* SECTION C & D: SNOOZE / FULL RECALL FOOTER ACTIONS */}
                    <div className="flex items-center justify-between pt-2 pb-0.5 border-t border-stone-100 text-xs gap-3">
                      <button
                        onClick={() => handleSnooze(15)}
                        className="text-[11px] sm:text-xs text-stone-500 hover:text-stone-800 font-mono flex items-center gap-1.5 py-1 px-1.5 -ml-1.5 rounded-md hover:bg-stone-100/80 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                        title="Remind in 15 minutes"
                        id="popup-snooze-15m-btn"
                      >
                        <Clock className="w-3 h-3 text-[#C9973A] shrink-0" />
                        <span className="leading-none">Snooze 15m</span>
                      </button>

                      <button
                        onClick={handleNavigateToFullRecall}
                        className="text-xs font-mono font-bold text-[#C9973A] hover:text-[#8F6516] flex items-center gap-1 py-1 px-1.5 -mr-1.5 rounded-md hover:bg-[#C9973A]/10 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                        id="popup-full-recall-studio-btn"
                      >
                        <span className="leading-none">Full Recall Studio</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};
