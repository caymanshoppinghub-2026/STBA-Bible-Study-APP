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
  EyeOff,
  Menu,
  Star,
  Bookmark,
  Timer
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
  const [lessonSavedNotice, setLessonSavedNotice] = useState(false);
  const [isQuizExpanded, setIsQuizExpanded] = useState(true);

  const handleSaveLesson = () => {
    setLessonSavedNotice(true);
    setTimeout(() => setLessonSavedNotice(false), 2500);
  };
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
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow || "";
        document.documentElement.style.overflow = originalHtmlOverflow || "";
      };
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
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

    const handleSettingsChanged = (e: any) => {
      if (e.detail && e.detail.popupsEnabled === false) {
        setIsOpen(false);
      }
    };

    window.addEventListener("stba-trigger-recall-popup", handleManualTrigger);
    window.addEventListener("stba-recall-completed", handleRecallCompleted);
    window.addEventListener("stba-recall-settings-changed", handleSettingsChanged);

    return () => {
      window.removeEventListener("stba-trigger-recall-popup", handleManualTrigger);
      window.removeEventListener("stba-recall-completed", handleRecallCompleted);
      window.removeEventListener("stba-recall-settings-changed", handleSettingsChanged);
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
                ? "rounded-2xl border shadow-2xl bg-[#07142D] border-[#D4A346]/45 text-white"
                : "max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-3xl border border-[#D4A346]/40 shadow-[0_24px_80px_rgba(0,0,0,0.88),0_0_40px_rgba(212,163,70,0.14)] my-auto bg-gradient-to-b from-[#040B1A] via-[#07142E] to-[#040A18] text-white"
            }`}
            id="stba-recall-popup-card"
          >
            {/* HEADER STRIP */}
            <div className="bg-gradient-to-r from-[#060F24] via-[#0B1938] to-[#060F24] text-white py-3.5 px-4 sm:px-5 flex items-center justify-between shrink-0 border-b border-[#253B6E]/80 shadow-[0_1px_14px_rgba(56,116,255,0.22)]">
              <div className="flex items-center space-x-3">
                <Menu className="w-5 h-5 text-[#D4A346]/80 shrink-0 hidden sm:block" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#2A1F0D] to-[#140E05] border-2 border-[#E5B34B] flex items-center justify-center text-[#E5B34B] shrink-0 shadow-[0_0_12px_rgba(229,179,75,0.28)]">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                    Scripture Memorization Challenge
                  </h3>
                  <p className="text-[11px] sm:text-xs font-sans text-[#B2C0D8] mt-0.5">
                    Daily Goal: {progress.completedToday}/{progress.goal} Verses ({progress.remaining} remaining)
                  </p>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-b from-[#F2C65E] to-[#C8922A] text-[#081226] shadow-[0_2px_10px_rgba(229,179,75,0.35)] flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3 text-[#081226]" />
                  <span>{activeVerse.decayStatus}</span>
                </span>
                <button
                  onClick={() => handleSnooze(15)}
                  className="p-1.5 rounded-lg text-[#B2C0D8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
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
              <div className="p-3.5 bg-[#07142D] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-[#E8BC57]">{activeVerse.reference}</span>
                  <span className="text-[#9DB0CE] font-mono text-[11px]">awaiting retrieval</span>
                </div>
                <button
                  onClick={() => setIsMinimized(false)}
                  className="px-3 py-1 bg-gradient-to-b from-[#F2C65E] to-[#C8922A] text-[#081226] rounded-lg text-xs font-mono font-extrabold hover:brightness-110 cursor-pointer"
                >
                  Review Now
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* SUCCESS / COMPLETION CONFIRMATION STATE */}
                {completedState ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 text-center p-5 sm:p-6"
                    id="recall-completion-celebration-view"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                      <ShieldCheck className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Memory Reinforced!</span>
                      </div>
                      <h4 className="font-serif font-bold text-xl text-white pt-1">
                        Active Recall Verified!
                      </h4>
                      <p className="text-xs text-[#B2C0D8] max-w-sm mx-auto">
                        You successfully reinforced <strong className="text-[#E8BC57]">{activeVerse.reference}</strong>. Your retention curve has been updated.
                      </p>
                    </div>

                    {/* METRIC BADGES */}
                    <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[#0A1836]/90 rounded-2xl border border-[#243B6B] text-left">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8EA2C4] block font-bold">
                          Retrieval Accuracy
                        </span>
                        <span className="text-base font-mono font-extrabold text-emerald-400">
                          {completedState.score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8EA2C4] block font-bold">
                          Next Due Date
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {new Date(completedState.nextDue).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    {/* NEXT REMINDER BANNER */}
                    <div className="p-3.5 bg-[#1B1810]/80 border border-[#E5B34B]/40 rounded-xl flex items-center space-x-3 text-left">
                      <div className="p-2 rounded-lg bg-[#E5B34B]/20 text-[#E8BC57] shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#E8BC57] font-bold block">
                          Schedule Update
                        </span>
                        <p className="text-xs font-serif font-bold text-white">
                          {completedState.reminderNotice}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <button
                        onClick={handleNavigateToFullRecall}
                        className="text-xs text-[#E8BC57] hover:text-[#F5D27A] font-mono font-bold underline cursor-pointer w-full sm:w-auto py-1"
                      >
                        Practice in Full Studio
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-b from-[#132852] via-[#0B1936] to-[#071024] border border-[#E5B34B]/75 text-white text-xs font-mono font-bold rounded-2xl shadow-[0_0_18px_rgba(229,179,75,0.3)] cursor-pointer transition-all active:scale-95"
                        id="close-popup-after-complete-btn"
                      >
                        Done & Return to Study
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* SECTION A: HERO SCRIPTURE BANNER WITH ILLUMINATED OPEN BIBLE */}
                    <div
                      className={`relative overflow-hidden bg-[#050E22] border-b border-[#1E315C]/70 text-left transition-all ${
                        currentQuizStep === 2 ? "min-h-[68px]" : "min-h-[140px] sm:min-h-[155px]"
                      }`}
                      id="popup-verse-preview"
                    >
                      {/* Right-side Open Bible Sunbeam Artwork */}
                      <img
                        src="/assets/recall_bible_sunbeam.jpg"
                        alt=""
                        className="absolute right-0 top-0 h-full w-[56%] sm:w-[52%] object-cover object-center pointer-events-none select-none opacity-95"
                      />
                      {/* Smooth Horizontal & Vertical Blending Masks */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#050E22] via-[#050E22]/90 via-48% to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050E22] via-transparent to-[#050E22]/30 pointer-events-none" />

                      <div className="relative z-10 px-4 py-3 sm:px-5 sm:py-3.5 pr-[34%] sm:pr-[38%] space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5B34B] shrink-0" />
                            <h4 className="font-serif font-bold text-lg sm:text-xl text-[#E8BC57] tracking-tight">
                              {activeVerse.reference}
                            </h4>
                          </div>
                          <div className="h-[1px] w-44 sm:w-52 bg-gradient-to-r from-[#E5B34B]/70 via-[#E5B34B]/30 to-transparent" />
                        </div>

                        {currentQuizStep !== 2 && (
                          <p className="font-serif italic text-xs sm:text-[14.5px] text-[#E6ECF8] leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            <span className="text-[#E5B34B] font-bold not-italic text-base mr-1">“</span>
                            {activeVerse.text}
                            <span className="text-[#E5B34B] font-bold not-italic text-base ml-1">”</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SECTION B: INTERACTIVE MINI-RECALL QUIZ */}
                    <div className="px-4 sm:px-5 pt-2.5 pb-4 space-y-2">
                      <div className="w-full py-1 flex items-center justify-between text-left gap-2">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-[#E5B34B] shrink-0" />
                          <span className="text-xs sm:text-[13px] font-serif font-bold text-[#E5B34B] uppercase tracking-[0.14em]">
                            Interactive Memorization Steps
                          </span>
                        </div>

                        <button
                          onClick={() => handleSnooze(15)}
                          className="text-xs text-[#D5DFEE] hover:text-[#F2C65E] font-serif flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-[#E5B34B]/45 bg-[#121D38]/80 hover:bg-[#19284C] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                          title="Snooze 15 minutes"
                          id="popup-snooze-15m-btn"
                        >
                          <Timer className="w-3.5 h-3.5 text-[#E5B34B] shrink-0" />
                          <span>Snooze</span>
                          <span className="font-bold text-white">15m</span>
                        </button>
                      </div>

                      <div>
                        <MiniQuizComponent
                          verse={activeVerse}
                          sabbathMode={sabbathMode}
                          activeStep={currentQuizStep}
                          onStepChange={(step) => setCurrentQuizStep(step)}
                          onComplete={handleMiniQuizComplete}
                          onOpenFullRecall={handleNavigateToFullRecall}
                        />
                      </div>
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
