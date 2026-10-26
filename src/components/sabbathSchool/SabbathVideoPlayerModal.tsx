/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X,
  Share2,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  FileText,
  Layers,
  MessageSquare,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Download,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { motion } from "motion/react";
import { useSabbathSchoolStore, EGW_NOTES_LESSON_8 } from "../../store/useSabbathSchoolStore";
import {
  VideoQuizQuestion,
  CHANNEL_NAMES,
  CURATED_CHANNEL_QUIZZES,
  getCuratedQuestionsForChannel,
  fetchVideoQuizQuestions,
  saveVideoQuizAttempt
} from "../../utils/sabbathVideoQuizManager";
import { playCorrectAnswerSound } from "../../utils/audioFeedback";
import percyHarroldThumbImg from "../../assets/images/percy_harrold_thumb_1789229104504.jpg";

interface SabbathVideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAudio?: () => void;
  initialChannel?: "egwNotes" | "featured" | "itiswritten" | "hope" | "threeABN";
}

export const SabbathVideoPlayerModal: React.FC<SabbathVideoPlayerModalProps> = ({
  isOpen,
  onClose,
  onOpenAudio,
  initialChannel = "featured"
}) => {
  const {
    quarterlyTitle,
    lessonTitle,
    dailyLessons,
    selectedDayIndex,
    readingTheme,
    memoryVerse,
    setActiveMediaSource,
    setCurrentEgwTimestampIndex,
    weeklyVideos,
    egwDailyBreakdown,
    hasPendingRetries,
    pendingChannels
  } = useSabbathSchoolStore();

  const isLight = readingTheme === "light";
  const activeDay = dailyLessons[selectedDayIndex] || dailyLessons[0];

  // Active Tab state: 'Video' | 'Notes' | 'Resources' | 'Discussion'
  const [activeTab, setActiveTab] = useState<"video" | "notes" | "resources" | "discussion">("video");

  // Video and Channel state - starts in Card View by default
  const [selectedChannel, setSelectedChannel] = useState<"egwNotes" | "featured" | "itiswritten" | "hope" | "threeABN">(initialChannel || "featured");
  const [selectedEgwDayIdx, setSelectedEgwDayIdx] = useState<number>(selectedDayIndex < 7 ? selectedDayIndex : 0);
  const [isPlayingEmbed, setIsPlayingEmbed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCCActive, setIsCCActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReflectionOverlay, setShowReflectionOverlay] = useState<boolean>(false);
  const [triggeredBreakpoints, setTriggeredBreakpoints] = useState<Set<number>>(new Set());

  // Interactive Quiz state
  const [questions, setQuestions] = useState<VideoQuizQuestion[]>(
    CURATED_CHANNEL_QUIZZES.percy || CURATED_CHANNEL_QUIZZES.featured || CURATED_CHANNEL_QUIZZES.itiswritten
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const isBreakpointPauseRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const activeEgwDay = EGW_NOTES_LESSON_8.days[selectedEgwDayIdx] || EGW_NOTES_LESSON_8.days[0];

  // Pause YouTube iframe playback using postMessage
  const pauseVideo = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      }
      setIsPlaying(false);
    } catch (err) {
      console.warn("Could not pause YouTube iframe:", err);
    }
  }, []);

  // Resume YouTube iframe playback using postMessage
  const resumeVideo = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
      setIsPlaying(true);
    } catch (err) {
      console.warn("Could not resume YouTube iframe:", err);
    }
  }, []);

  // Seek YouTube video
  const seekVideo = useCallback((seconds: number) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
          "*"
        );
      }
      setPlaybackSeconds(seconds);
    } catch (err) {
      console.warn("Could not seek YouTube iframe:", err);
    }
  }, []);

  // Video feeds mapping dynamically driven by Master Automation Weekly Sync
  const daysKeys = ["Sabbath Afternoon", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentDayKey = daysKeys[selectedEgwDayIdx] || "Sabbath Afternoon";
  const syncedEgwDay = egwDailyBreakdown ? egwDailyBreakdown[currentDayKey] : null;
  const egwSec = syncedEgwDay?.seconds ?? (EGW_NOTES_LESSON_8.days[selectedEgwDayIdx]?.timestampSeconds ?? 0);
  const egwUrl = syncedEgwDay?.url ?? (EGW_NOTES_LESSON_8.days[selectedEgwDayIdx]?.url ?? EGW_NOTES_LESSON_8.directUrl);
  const egwVideoId = syncedEgwDay?.url?.match(/[?&]v=([^&]+)/)?.[1] || "d17oRa_jCHg";

  const videoFeeds: Record<string, {
    name: string;
    embedUrl: string;
    directUrl: string;
    teacher: string;
    lessonNumber: string;
    lessonTitleText: string;
    isPending?: boolean;
  }> = {
    egwNotes: {
      name: `EGW Notes – ${currentDayKey} (${syncedEgwDay?.timestampText || "0:00"})`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${egwVideoId}?autoplay=1&controls=1&enablejsapi=1&start=${egwSec}`,
      directUrl: egwUrl,
      teacher: "Ellen G. White Daily Commentary",
      lessonNumber: "Lesson 4",
      lessonTitleText: `${lessonTitle || "New Testament Prophets"} – ${currentDayKey}`
    },
    featured: {
      name: weeklyVideos?.featured?.title || "Featured Video – Claudio Carneiro",
      embedUrl: weeklyVideos?.featured?.embedUrl || "https://www.youtube-nocookie.com/embed/M8jssNYGAJc?autoplay=1&controls=1&enablejsapi=1",
      directUrl: weeklyVideos?.featured?.url || "https://www.youtube.com/watch?v=M8jssNYGAJc",
      teacher: "Pastor Clive Nash / Claudio Carneiro",
      lessonNumber: weeklyVideos?.featured?.lessonNumberText || "Lesson 4",
      lessonTitleText: lessonTitle || "New Testament Prophets",
      isPending: weeklyVideos?.featured && !weeklyVideos.featured.isCurrentWeek
    },
    itiswritten: {
      name: weeklyVideos?.itiswritten?.title || "It Is Written Sabbath School Study",
      embedUrl: weeklyVideos?.itiswritten?.embedUrl || "https://www.youtube-nocookie.com/embed/2NyUKNOOkPM?autoplay=1&controls=1&enablejsapi=1",
      directUrl: weeklyVideos?.itiswritten?.url || "https://www.youtube.com/watch?v=2NyUKNOOkPM",
      teacher: "Pastor John Bradshaw",
      lessonNumber: weeklyVideos?.itiswritten?.lessonNumberText || "Lesson 4",
      lessonTitleText: lessonTitle || "New Testament Prophets",
      isPending: weeklyVideos?.itiswritten && !weeklyVideos.itiswritten.isCurrentWeek
    },
    hope: {
      name: weeklyVideos?.hope?.title || "Hope Sabbath School",
      embedUrl: weeklyVideos?.hope?.embedUrl || "https://www.youtube-nocookie.com/embed/EyMutcCbyEY?autoplay=1&controls=1&enablejsapi=1",
      directUrl: weeklyVideos?.hope?.url || "https://www.youtube.com/watch?v=EyMutcCbyEY",
      teacher: "Pastor Derek Morris",
      lessonNumber: weeklyVideos?.hope?.lessonNumberText || "Lesson 4",
      lessonTitleText: lessonTitle || "New Testament Prophets",
      isPending: weeklyVideos?.hope && !weeklyVideos.hope.isCurrentWeek
    },
    threeABN: {
      name: weeklyVideos?.threeABN?.title || "3ABN Sabbath School Panel",
      embedUrl: weeklyVideos?.threeABN?.embedUrl || "https://www.youtube-nocookie.com/embed/cMGfnocp2qk?autoplay=1&controls=1&enablejsapi=1",
      directUrl: weeklyVideos?.threeABN?.url || "https://www.youtube.com/watch?v=cMGfnocp2qk",
      teacher: "3ABN Pastoral Panel",
      lessonNumber: weeklyVideos?.threeABN?.lessonNumberText || "Lesson 4",
      lessonTitleText: lessonTitle || "New Testament Prophets",
      isPending: weeklyVideos?.threeABN && !weeklyVideos.threeABN.isCurrentWeek
    }
  };

  const currentFeed = videoFeeds[selectedChannel] || videoFeeds.featured;

  // Load questions for the selected channel with synchronized key concept analysis
  const loadChannelQuestions = useCallback(async (channelKey: string, egwDay?: number) => {
    const normKey = channelKey === "featured" ? "percy" : (channelKey === "ssPM" ? "threeABN" : channelKey);
    const initialLocal = getCuratedQuestionsForChannel(normKey, egwDay);
    setQuestions(initialLocal);

    try {
      const dynamicQuestions = await fetchVideoQuizQuestions({
        channel: normKey,
        lessonTitle: lessonTitle || "The Conditions of Fellowship",
        quarterlyTitle,
        dayTopic: activeDay?.title || activeDay?.label,
        memoryVerse,
        egwDayIndex: egwDay
      });
      if (dynamicQuestions && dynamicQuestions.length > 0) {
        setQuestions(dynamicQuestions);
      }
    } catch (e) {
      console.warn("Using curated Sabbath School quiz:", e);
    }
  }, [lessonTitle, quarterlyTitle, activeDay, memoryVerse]);

  // Channel & reset logic
  useEffect(() => {
    if (isOpen) {
      if (initialChannel) {
        setSelectedChannel(initialChannel);
      }
      setSelectedEgwDayIdx(selectedDayIndex < 7 ? selectedDayIndex : 0);
    }
  }, [isOpen, initialChannel, selectedDayIndex]);

  useEffect(() => {
    setPlaybackSeconds(0);
    setCompletedCheckpoints(new Set());
    setTriggeredBreakpoints(new Set());
    setShowReflectionOverlay(false);
    setSelectedAnswer(null);
    setIsAnswerCorrect(false);
    setWrongAnswers(new Set());
    setHasSubmitted(false);
    setActiveQuestionIndex(0);
    loadChannelQuestions(selectedChannel, selectedChannel === "egwNotes" ? selectedEgwDayIdx : undefined);
  }, [selectedChannel, selectedDayIndex, selectedEgwDayIdx, loadChannelQuestions]);

  // Register postMessage listening with iframe whenever video embed is active
  const notifyIframeListening = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "listening", id: 1 }),
          "*"
        );
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isPlayingEmbed) {
      notifyIframeListening();
    }
  }, [isPlayingEmbed, selectedChannel, selectedEgwDayIdx, notifyIframeListening]);

  // Listen to YouTube player state: synchronizes exact time and automatically pauses quiz timing when paused
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        if (!data || typeof data !== "object") return;

        let playerState: number | undefined;
        let currentTime: number | undefined;

        // 1. YouTube onStateChange event
        if (data.event === "onStateChange") {
          if (typeof data.info === "number") playerState = data.info;
          else if (typeof data.data === "number") playerState = data.data;
        }

        // 2. YouTube infoDelivery event
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.playerState === "number") {
            playerState = data.info.playerState;
          }
          if (typeof data.info.currentTime === "number") {
            currentTime = data.info.currentTime;
          }
        }

        // 3. Direct response from getCurrentTime
        if (typeof data.info === "number" && !data.event) {
          currentTime = data.info;
        }

        // Synchronize exact playback time from player
        if (currentTime !== undefined && !isNaN(currentTime)) {
          const currentSec = Math.floor(currentTime);
          setPlaybackSeconds(currentSec);

          // Check if currentSec matches an untriggered breakpoint while playing
          if (isPlaying && !showReflectionOverlay && !isBreakpointPauseRef.current) {
            const matchIdx = questions.findIndex(
              (q, idx) =>
                !triggeredBreakpoints.has(idx) &&
                currentSec >= q.timestampSeconds &&
                currentSec <= q.timestampSeconds + 2
            );
            if (matchIdx !== -1) {
              isBreakpointPauseRef.current = true;
              pauseVideo();
              setIsPlaying(false);
              setActiveQuestionIndex(matchIdx);
              setSelectedAnswer(null);
              setIsAnswerCorrect(false);
              setWrongAnswers(new Set());
              setHasSubmitted(false);
              setShowReflectionOverlay(true);
              setTriggeredBreakpoints((prevSet) => new Set(prevSet).add(matchIdx));
              setTimeout(() => {
                isBreakpointPauseRef.current = false;
              }, 800);
            }
          }
        }

        // Handle play / pause state transitions:
        // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
        if (playerState !== undefined) {
          if (playerState === 1) {
            // Video is playing: resume quiz timing logic
            setIsPlaying(true);
          } else if (playerState === 2 || playerState === 0) {
            // Video playback paused by user: quiz timing logic pauses automatically and stays synchronized!
            if (!isBreakpointPauseRef.current) {
              setIsPlaying(false);
            }
          }
        }
      } catch {
        // Non-JSON message from other sources, ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPlaying, showReflectionOverlay, questions, triggeredBreakpoints, pauseVideo]);

  // Intelligent Question Timing: Monitor playback time and trigger pause reflection at logical segment breakpoints.
  // Timing logic runs ONLY when isPlaying is true, pausing automatically whenever the user pauses video playback!
  useEffect(() => {
    if (!isPlaying) return;

    // Periodically query exact video time from YouTube iframe to prevent drift
    const queryTime = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "getCurrentTime", args: [] }),
            "*"
          );
        }
      } catch {}
    };

    queryTime();

    const interval = window.setInterval(() => {
      queryTime();

      setPlaybackSeconds((prev) => {
        const nextTime = prev + 1;

        // Check if nextTime aligns with any question's logical breakpoint
        const matchIdx = questions.findIndex(
          (q, idx) =>
            !triggeredBreakpoints.has(idx) &&
            nextTime >= q.timestampSeconds &&
            nextTime <= q.timestampSeconds + 2
        );

        if (matchIdx !== -1) {
          isBreakpointPauseRef.current = true;
          pauseVideo();
          setIsPlaying(false);
          setActiveQuestionIndex(matchIdx);
          setSelectedAnswer(null);
          setIsAnswerCorrect(false);
          setWrongAnswers(new Set());
          setHasSubmitted(false);
          setShowReflectionOverlay(true);
          setTriggeredBreakpoints((prevSet) => new Set(prevSet).add(matchIdx));
          setTimeout(() => {
            isBreakpointPauseRef.current = false;
          }, 800);
        }

        return nextTime;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPlaying, questions, triggeredBreakpoints, pauseVideo]);

  // Jump directly to an intelligent reflection breakpoint
  const handleJumpToBreakpoint = (checkpointIndex: number) => {
    const targetQ = questions[checkpointIndex];
    if (targetQ) {
      seekVideo(targetQ.timestampSeconds);
      setActiveQuestionIndex(checkpointIndex);
      setSelectedAnswer(null);
      setIsAnswerCorrect(false);
      setWrongAnswers(new Set());
      setHasSubmitted(false);
      isBreakpointPauseRef.current = true;
      pauseVideo();
      setIsPlaying(false);
      setShowReflectionOverlay(true);
      setTimeout(() => {
        isBreakpointPauseRef.current = false;
      }, 800);
    }
  };

  // Handle Play/Pause toggle: video pauses and quiz timing logic pauses automatically while remaining synchronized
  const handleTogglePlay = () => {
    if (!isPlayingEmbed) {
      setIsPlayingEmbed(true);
      setIsPlaying(true);
      resumeVideo();
    } else {
      if (isPlaying) {
        pauseVideo();
        setIsPlaying(false);
      } else {
        resumeVideo();
        setIsPlaying(true);
      }
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Quiz Option selection with instant evaluation, audio feedback, and try-again logic
  const handleSelectOption = (optId: "A" | "B" | "C" | "D") => {
    if (isAnswerCorrect) return; // Already solved correctly
    setSelectedAnswer(optId);

    const currentQ = questions[activeQuestionIndex];
    if (!currentQ) return;

    if (optId === currentQ.correctAnswer) {
      setIsAnswerCorrect(true);
      setHasSubmitted(true);
      playCorrectAnswerSound();
      setCompletedCheckpoints((prev) => new Set(prev).add(activeQuestionIndex));

      try {
        saveVideoQuizAttempt({
          questionId: currentQ.id,
          checkpointIndex: currentQ.checkpointIndex,
          timestampSeconds: currentQ.timestampSeconds,
          timestampLabel: currentQ.timestampLabel,
          title: currentQ.title,
          question: currentQ.question,
          options: currentQ.options,
          userAnswer: optId,
          correctAnswer: currentQ.correctAnswer,
          isCorrect: true,
          explanation: currentQ.explanation,
          scriptureRef: currentQ.scriptureRef,
          channel: selectedChannel,
          channelName: CHANNEL_NAMES[selectedChannel] || currentFeed.name,
          lessonTitle: "The Conditions of Fellowship"
        });
      } catch (err) {
        console.error("Failed to save quiz attempt:", err);
      }
    } else {
      // Incorrect answer: mark in red and allow user to try again
      setWrongAnswers((prev) => new Set(prev).add(optId));
    }
  };

  // Continue video after correct answer
  const handleContinueVideo = () => {
    setShowReflectionOverlay(false);
    setIsPlayingEmbed(true);
    setIsPlaying(true);
    resumeVideo();
  };

  // Skip Segment closes the overlay and resumes the video
  const handleSkipSegment = () => {
    setShowReflectionOverlay(false);
    setIsPlayingEmbed(true);
    setIsPlaying(true);
    resumeVideo();
  };

  // Next / Previous Question Navigation
  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    }
  };

  const handleShareVideoLink = () => {
    navigator.clipboard.writeText(currentFeed.directUrl);
    showToast("Sabbath School video link copied to clipboard!");
  };

  const handleRegenerateAIQuiz = async () => {
    setIsRegenerating(true);
    showToast("AI analyzing lesson material to formulate questions...");
    try {
      const normKey = selectedChannel === "featured" ? "percy" : selectedChannel;
      const dynamic = await fetchVideoQuizQuestions({
        channel: normKey,
        lessonTitle: lessonTitle || "The Conditions of Fellowship",
        quarterlyTitle,
        dayTopic: activeDay?.title || activeDay?.label,
        memoryVerse,
        egwDayIndex: selectedChannel === "egwNotes" ? selectedEgwDayIdx : undefined
      });
      if (dynamic && dynamic.length > 0) {
        setQuestions(dynamic);
        showToast("New AI lesson reflection questionnaire ready!");
      }
    } catch (err) {
      console.warn("Failed to refresh AI quiz:", err);
      showToast("Refreshed with curated Sabbath School questions.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Smooth scroll and slide-up to bottom action section when correct answer is selected
  useEffect(() => {
    if (isAnswerCorrect) {
      const timer = setTimeout(() => {
        if (bottomSectionRef.current) {
          bottomSectionRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
        const modal = document.getElementById("ssq-fullscreen-reflection-modal");
        if (modal) {
          modal.scrollTo({ top: modal.scrollHeight, behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAnswerCorrect]);

  const currentQuestion = questions[activeQuestionIndex] || questions[0];

  // Clean explanation text by stripping redundant scripture references (so it only appears in title)
  const cleanExplanation = useMemo(() => {
    if (!currentQuestion?.explanation) return "";
    let clean = currentQuestion.explanation;

    // 1. If scriptureRef exists, remove any "in <scriptureRef>", "(<scriptureRef>)", or plain "<scriptureRef>"
    if (currentQuestion.scriptureRef) {
      const escaped = currentQuestion.scriptureRef.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      clean = clean.replace(new RegExp(`\\s*\\(${escaped}\\)\\.?`, "gi"), ".");
      clean = clean.replace(new RegExp(`\\s*in\\s+${escaped}`, "gi"), "");
      clean = clean.replace(new RegExp(`\\s*${escaped}`, "gi"), "");
    }

    // 2. Remove all scripture references like "(2 Corinthians 2:7–8)", "2 Corinthians 2:7", "2 Cor. 2:7", "v. 7", "verse 7", etc.
    clean = clean.replace(/\s*\(([1-3]?\s*[A-Za-z]+|\b[A-Za-z]+\b)\.?\s+\d+[:\d–—,-]*\)\.?/g, ".");
    clean = clean.replace(/\b([1-3]\s*[A-Za-z]+|[A-Z][a-z]+)\.?\s+\d+:\d+(?:[–—\-]\d+)?\b/g, "");
    clean = clean.replace(/\s*\([A-Za-z0-9\s:–—,.-]+\)\s*\.?\s*$/g, ".");

    // 3. Clean up punctuation artifacts
    clean = clean
      .replace(/\s+\./g, ".")
      .replace(/\.\.+/g, ".")
      .replace(/,\s*\./g, ".")
      .replace(/\s\s+/g, " ")
      .trim();

    if (clean && !clean.endsWith(".") && !clean.endsWith("!") && !clean.endsWith("?")) {
      clean += ".";
    }

    return clean;
  }, [currentQuestion]);

  const videoTotalDuration = useMemo(() => {
    if (questions && questions.length > 0) {
      const lastQ = questions[questions.length - 1];
      return Math.max(lastQ.timestampSeconds + 180, 1800);
    }
    return 2706;
  }, [questions]);

  if (!isOpen) return null;

  return (
    <div
      id="sabbath-video-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 sm:backdrop-blur-md p-0 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Dialog Container - Refined Dark Navy Theme matching the user design */}
      <div
        ref={modalContainerRef}
        className="w-full max-w-4xl lg:max-w-5xl my-auto rounded-none sm:rounded-3xl border-0 sm:border border-[#C9973A]/40 bg-[#071124] text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-4 sm:p-6 md:p-8 relative transition-all overflow-y-auto max-h-[100vh] sm:max-h-[96vh] flex flex-col custom-scroll-pane select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* 1. TOP HEADER & BREADCRUMB BAR                            */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[#1B2B48] shrink-0 gap-3">
          {/* Breadcrumb Info: Book Icon + SABBATH SCHOOL + Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.2em] text-amber-400 font-bold block">
                SABBATH SCHOOL
              </span>
              <h3 className="text-xs sm:text-sm md:text-base font-serif font-bold tracking-tight text-neutral-200 truncate">
                Epistles to the Corinthians (2026 Q3)
              </h3>
            </div>
          </div>

          {/* Right Action Icons: Channel Select, Share, Fullscreen, Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareVideoLink}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-850 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition cursor-pointer"
              title="Share video link"
              aria-label="Share video link"
            >
              <Share2 size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-850 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition cursor-pointer hidden sm:flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            {/* Close Button */}
            <button
              id="ssq-video-modal-close"
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-rose-500/20 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition cursor-pointer"
              title="Close Video Player"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Channel Switcher Pills */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto custom-scrollbar shrink-0">
          {(
            [
              { id: "egwNotes", label: "Ellen G. White Notes" },
              { id: "featured", label: "Featured Video" },
              { id: "itiswritten", label: "It Is Written" },
              { id: "hope", label: "Hope Channel" },
              { id: "threeABN", label: "3ABN" }
            ] as const
          ).map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                setSelectedChannel(ch.id);
                if (ch.id === "featured") {
                  setIsPlayingEmbed(true);
                  setIsPlaying(true);
                  resumeVideo();
                } else if (ch.id === "egwNotes") {
                  setActiveMediaSource("egwNotes");
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                selectedChannel === ch.id
                  ? "bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-sm"
                  : "bg-[#09132A] hover:bg-[#102042] border-[#1B2B48] text-slate-300 hover:text-white"
              }`}
            >
              <Play size={10} fill="currentColor" />
              <span>{ch.label}</span>
            </button>
          ))}
        </div>

        {/* Pending Channel Upload Status Banner */}
        {currentFeed.isPending && (
          <div className="my-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Update in Progress · Channel has not uploaded current week yet; showing previous week. Retrying every 3 hours.</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. VIDEO PLAYER & THUMBNAIL CONTAINER                     */}
        {/* Native 16:9 Aspect Ratio: Zero side black bars            */}
        {/* Gold-trimmed bounding box with smooth responsive scaling  */}
        {/* ========================================================= */}
        <div className="py-2 shrink-0">
          <div
            id="ssq-video-thumbnail-container"
            className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_16px_40px_rgba(0,0,0,0.85)] isolate mx-auto transition-all ${
              isFullscreen ? "fixed inset-0 z-50 rounded-none h-full w-full flex items-center justify-center bg-black" : ""
            }`}
          >
            {/* The rounded gold-trimmed bounding box sitting visually ON TOP of the video edges */}
            {!isFullscreen && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl border-2 sm:border-[3px] border-[#D4A346] shadow-[inset_0_0_0_1px_rgba(7,17,36,0.9)] z-20" />
            )}

            {isPlayingEmbed ? (
              /* Live Embedded YouTube Player - Exactly fits 16:9 with no side black bars */
              <div className={`relative w-full bg-black flex items-center justify-center ${
                isFullscreen ? "h-full max-w-[calc(100vh*16/9)] max-h-[calc(100vw*9/16)] aspect-video" : "h-full aspect-video"
              }`}>
                <iframe
                  ref={iframeRef}
                  id="sabbath-school-video-iframe"
                  key={`${selectedChannel}-${selectedEgwDayIdx}`}
                  src={currentFeed.embedUrl}
                  title={currentFeed.name}
                  className="w-full h-full border-0 block"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={notifyIframeListening}
                />
              </div>
            ) : (
              /* Cinematic Video Thumbnail View matching the user's uploaded mockup */
              <div className="relative w-full h-full flex flex-col justify-between p-5 sm:p-7 md:p-9">
                {/* Background Image: Dr. Percy Harrold with warm study background & soft lighting */}
                <img
                  src={percyHarroldThumbImg}
                  alt="Dr. Percy Harrold - Sabbath School Lesson Study"
                  className="absolute inset-0 w-full h-full object-cover object-center select-none brightness-90 contrast-105"
                  referrerPolicy="no-referrer"
                />

                {/* Dark Cinematic Vignette & Gradient Overlays for optimal typography legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/40 pointer-events-none" />

                {/* Top Left Title Block: Enhanced balanced padding */}
                <div className="relative z-10 max-w-xl space-y-2 sm:space-y-3">
                  {/* LESSON 9 Pill Badge with Gold Border */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full border border-amber-400/90 bg-black/50 text-amber-300 text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <span>{currentFeed.lessonNumber}</span>
                  </div>

                  {/* Big Serif Title */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
                    {currentFeed.lessonTitleText}
                  </h2>

                  {/* Teacher Name in Warm Gold */}
                  <p className="text-amber-400 font-serif font-medium text-sm sm:text-base md:text-lg drop-shadow-sm">
                    {currentFeed.teacher}
                  </p>
                </div>

                {/* Center Circular Play Button with Gold Border */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/90 bg-black/45 backdrop-blur-md flex items-center justify-center text-amber-300 hover:text-white hover:border-amber-300 hover:scale-110 hover:bg-black/65 transition-all duration-200 cursor-pointer shadow-[0_0_30px_rgba(212,163,70,0.4)] group"
                    title="Play Sabbath School Video"
                    aria-label="Play Video"
                  >
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-300 group-hover:fill-white ml-1 transition-colors" />
                  </button>
                </div>

                {/* Bottom Video Controls Scrubber Bar */}
                <div className="relative z-10 mt-auto pt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3 text-white text-xs font-sans">
                    {/* Play/Pause Button */}
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="p-1.5 hover:text-amber-300 transition cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                      aria-label="Play/Pause"
                    >
                      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>

                    {/* Timestamp: current / total */}
                    <span className="text-[11px] sm:text-xs text-neutral-300 whitespace-nowrap">
                      {Math.floor(playbackSeconds / 60)}:
                      {String(playbackSeconds % 60).padStart(2, "0")} / {Math.floor(videoTotalDuration / 60)}:
                      {String(videoTotalDuration % 60).padStart(2, "0")}
                    </span>

                    {/* Scrubber Slider Track with dynamic progress and intelligent breakpoint markers */}
                    <div
                      className="flex-1 h-2 bg-slate-700/80 rounded-full relative cursor-pointer overflow-visible group"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const pct = Math.max(0, Math.min(1, clickX / rect.width));
                        const targetSec = Math.floor(pct * videoTotalDuration);
                        seekVideo(targetSec);
                      }}
                    >
                      {/* Active progress fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 via-amber-400 to-amber-300 rounded-full"
                        style={{ width: `${Math.min(100, (playbackSeconds / videoTotalDuration) * 100)}%` }}
                      />

                      {/* Scrubber thumb */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md border border-amber-400 pointer-events-none"
                        style={{ left: `${Math.min(100, (playbackSeconds / videoTotalDuration) * 100)}%` }}
                      />

                      {/* Intelligent Question Timing Breakpoint Markers */}
                      {questions.map((q, idx) => {
                        const markerPct = (q.timestampSeconds / videoTotalDuration) * 100;
                        const isPast = playbackSeconds >= q.timestampSeconds;
                        return (
                          <button
                            key={q.id || idx}
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleJumpToBreakpoint(idx);
                            }}
                            title={`Breakpoint ${idx + 1} (${q.timestampLabel}): ${q.segmentTopic || q.title}`}
                            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border transition-transform hover:scale-150 z-10 cursor-pointer ${
                              isPast
                                ? "bg-amber-400 border-white shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                                : "bg-amber-500/80 border-amber-300"
                            }`}
                            style={{ left: `${markerPct}%` }}
                          />
                        );
                      })}
                    </div>

                    {/* Volume Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 text-neutral-300 hover:text-amber-300 transition cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                      aria-label="Volume"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    {/* Closed Captions CC */}
                    <button
                      type="button"
                      onClick={() => setIsCCActive(!isCCActive)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer font-sans ${
                        isCCActive
                          ? "border-amber-400 text-amber-300 bg-amber-500/20"
                          : "border-neutral-500 text-neutral-400"
                      }`}
                      title="Toggle Captions"
                    >
                      CC
                    </button>

                    {/* Fullscreen Icon */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 text-neutral-300 hover:text-amber-300 transition cursor-pointer"
                      title="Fullscreen"
                      aria-label="Fullscreen"
                    >
                      <Maximize size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CENTERED BUTTON BAR: Notes, Resources, Discussion       */}
        {/* Exact size, shape, font, and colors of top channel buttons */}
        {/* ========================================================= */}
        <div className="py-3 shrink-0 flex items-center justify-center">
          <div
            id="ssq-video-player-tab-bar"
            className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap"
          >
            {/* Button 1: Notes */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "notes" ? "video" : "notes")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                activeTab === "notes"
                  ? "bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-sm"
                  : "bg-[#09132A] hover:bg-[#102042] border-[#1B2B48] text-slate-300 hover:text-white"
              }`}
            >
              <FileText size={13} />
              <span>Notes</span>
            </button>

            {/* Button 2: Resources */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "resources" ? "video" : "resources")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                activeTab === "resources"
                  ? "bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-sm"
                  : "bg-[#09132A] hover:bg-[#102042] border-[#1B2B48] text-slate-300 hover:text-white"
              }`}
            >
              <Layers size={13} />
              <span>Resources</span>
            </button>

            {/* Button 3: Discussion */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "discussion" ? "video" : "discussion")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                activeTab === "discussion"
                  ? "bg-amber-500 text-neutral-950 border-amber-400 font-black shadow-sm"
                  : "bg-[#09132A] hover:bg-[#102042] border-[#1B2B48] text-slate-300 hover:text-white"
              }`}
            >
              <MessageSquare size={13} />
              <span>Discussion</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB CONTENT SWITCHING                                     */}
        {/* ========================================================= */}

        {/* ----------------- TAB: VIDEO (DEFAULT VIEW) ----------------- */}
        {activeTab === "video" && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Main Lesson Content Card: Matches screenshot layout */}
            <div
              id="ssq-lesson-content-card"
              className="rounded-3xl border border-[#1B2B48] bg-[#071124] p-5 sm:p-7 md:p-9 shadow-xl relative"
            >
              {/* LESSON 9 Centered Badge */}
              <div className="flex justify-center mb-2">
                <span className="px-4 py-1 rounded-full border border-amber-400/80 bg-amber-500/10 text-amber-300 text-xs font-sans font-bold uppercase tracking-wider">
                  {currentFeed.lessonNumber}
                </span>
              </div>

              {/* Big Centered Serif Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white text-center leading-tight tracking-tight">
                {currentFeed.lessonTitleText}
              </h1>

              {/* Decorative Gold Diamond Motif */}
              <div className="flex items-center justify-center gap-2 py-3 opacity-85">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9973A]" />
                <span className="text-[#C9973A] text-sm">✧ ✦ ✧</span>
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9973A]" />
              </div>

              {/* ---------------------------------------------------- */}
              {/* 4. MEMORY VERSE BOX                                  */}
              {/* Consistent vertical spacing, soft glow, gold border */}
              {/* ---------------------------------------------------- */}
              <div
                id="ssq-modal-memory-verse-box"
                className="mt-6 sm:mt-7 rounded-2xl border border-[#D4A346]/70 bg-gradient-to-b from-[#091533] to-[#071124] p-5 sm:p-7 shadow-[0_0_25px_rgba(212,163,70,0.12)] text-center relative overflow-hidden"
              >
                {/* Header Icon + Label */}
                <div className="flex items-center justify-center gap-2 text-amber-400 mb-3">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span className="font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
                    MEMORY VERSE
                  </span>
                </div>

                {/* Verse Quote */}
                <p className="font-serif text-base sm:text-lg md:text-xl text-neutral-100 leading-relaxed max-w-2xl mx-auto my-2">
                  “For out of much affliction and anguish of heart I wrote to you, with many tears, not that you should be grieved, but that you might know the love which I have so abundantly for you.”
                </p>

                {/* Verse Reference */}
                <p className="font-sans font-bold text-xs sm:text-sm text-amber-400 uppercase tracking-widest mt-3">
                  2 CORINTHIANS 2:4, NKJV
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: NOTES ----------------- */}
        {activeTab === "notes" && (
          <div className="rounded-3xl border border-[#1B2B48] bg-[#071124] p-5 sm:p-7 md:p-9 shadow-xl space-y-6 animate-fade-in text-slate-200">
            <div className="border-b border-[#1B2B48] pb-4">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-amber-400">
                Lesson 9 Comprehensive Study Notes
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                The Conditions of Fellowship (2 Corinthians 2:4–17)
              </h3>
            </div>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed font-lato font-['Lato',sans-serif]">
              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <h4 className="font-bold text-amber-300 mb-2 font-serif text-base">
                  1. The Ministry of Tears and Sacred Anguish (v. 4)
                </h4>
                <p>
                  Paul’s severe letter to Corinth was not penned in anger or judicial vindictiveness, but out of profound affliction (thlipsis) and tears. True pastoral rebuke must always flow from a heart overflowing with redemptive love.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <h4 className="font-bold text-amber-300 mb-2 font-serif text-base">
                  2. Forgiveness and Reaffirming Love in Fellowship (v. 5–8)
                </h4>
                <p>
                  Discipline in the Seventh-day Adventist church aims at salvation, not destruction. When a believer turns in repentance, church members must forgive (charizomai) and comfort them, lest Satan swallow them up in despair.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <h4 className="font-bold text-amber-300 mb-2 font-serif text-base">
                  3. Outsmarting Satan's Schemes through Reconciliation (v. 9–11)
                </h4>
                <p>
                  Satan frequently exploits unforgiveness and factional pride to fracture Christian community. We are not ignorant of his devices (noemata); mutual grace disarms the adversary.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <h4 className="font-bold text-amber-300 mb-2 font-serif text-base">
                  4. Ellen G. White Spirit of Prophecy Commentary
                </h4>
                <blockquote className="border-l-2 border-amber-400 pl-3 text-slate-200 my-2 italic font-lato font-['Lato',sans-serif]">
                  “Christians who love Christ will love one another. If a brother or sister errs, do not turn away from them with cold disdain. Go to them in the spirit of meekness, remembering that you too are frail.” — Testimonies, Vol. 5, p. 605.
                </blockquote>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: RESOURCES ----------------- */}
        {activeTab === "resources" && (
          <div className="rounded-3xl border border-[#1B2B48] bg-[#071124] p-5 sm:p-7 md:p-9 shadow-xl space-y-6 animate-fade-in text-slate-200">
            <div className="border-b border-[#1B2B48] pb-4">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-amber-400">
                Sabbath School Lesson Resources
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Study Outlines, Teacher Helps & Audio Guides
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resource 1 */}
              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <FileText size={18} />
                    <span className="font-sans font-bold text-sm">Adult Bible Study Guide (PDF)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                    Full official General Conference Adult Teachers Bible Study Guide: The Gift of Prophecy.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Opening Official Quarterly Study Outline...")}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-sans font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Guide</span>
                </button>
              </div>

              {/* Resource 2 */}
              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Layers size={18} />
                    <span className="font-sans font-bold text-sm">Teacher Exegetical Slides</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                    Classroom presentation slides with Greek word breakdowns and discussion deck prompts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Preparing Sabbath School Slides Deck...")}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-sans font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Open Slides Deck</span>
                </button>
              </div>

              {/* Resource 3 */}
              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <BookOpen size={18} />
                    <span className="font-sans font-bold text-sm">Ellen White Daily Notes Audio</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                    Daily Spirit of Prophecy commentary narrated for each day of the current quarterly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAudio) onOpenAudio();
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 text-xs font-sans font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Listen to Audio Player</span>
                </button>
              </div>

              {/* Resource 4 */}
              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Sparkles size={18} />
                    <span className="font-sans font-bold text-sm">AI Study Quiz Generator</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                    Generate fresh customized interactive questions grounded in historic Adventist hermeneutics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateAIQuiz}
                  disabled={isRegenerating}
                  className="w-full py-2 px-3 rounded-xl border border-amber-400 text-amber-300 hover:bg-amber-500/20 text-xs font-sans font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={13} className={isRegenerating ? "animate-spin" : ""} />
                  <span>Generate New Questions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: DISCUSSION ----------------- */}
        {activeTab === "discussion" && (
          <div className="rounded-3xl border border-[#1B2B48] bg-[#071124] p-5 sm:p-7 md:p-9 shadow-xl space-y-6 animate-fade-in text-slate-200">
            <div className="border-b border-[#1B2B48] pb-4">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-amber-400">
                Classroom & Small Group Discussion
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Elder Stephen Pastoral Discussion Probes
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <span className="text-[11px] font-sans font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Discussion Prompt 1 • Restoration vs. Punishment
                </span>
                <p className="text-sm sm:text-base font-serif font-medium text-white">
                  “How can a local church maintain doctrinal purity while genuinely practicing the restorative, forgiving love Paul advocates in 2 Corinthians 2:7–8?”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <span className="text-[11px] font-sans font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Discussion Prompt 2 • Unmasking the Enemy's Devices
                </span>
                <p className="text-sm sm:text-base font-serif font-medium text-white">
                  “Paul warns that withholding forgiveness allows Satan to take advantage of the congregation (v. 11). What specific devices does Satan use today to breed division among believers?”
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#091533] border border-[#1B2B48]">
                <span className="text-[11px] font-sans font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Discussion Prompt 3 • The Fragrance of Life
                </span>
                <p className="text-sm sm:text-base font-serif font-medium text-white">
                  “What does it mean practically for our Sabbath School class to be an ‘aroma of Christ’ (v. 15) in our wider community?”
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FULL-SCREEN STUDY REFLECTION BREAKPOINT MODAL             */}
        {/* Slides up from the bottom and covers entire screen height */}
        {/* ========================================================= */}
        {showReflectionOverlay && currentQuestion && (
          <div
            id="ssq-fullscreen-reflection-modal"
            className="fixed inset-0 z-[100] bg-[#071124] text-white flex flex-col justify-between p-5 sm:p-8 md:p-12 overflow-y-auto animate-slide-up-fullscreen custom-scrollbar"
          >
            {/* Top Header Bar: Centered Badge with Breakpoint underneath */}
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center pb-4 border-b border-[#1B2B48] shrink-0 space-y-2">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-amber-400 bg-amber-500/15 text-amber-300 text-xs font-sans font-bold tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Video Paused for Study Reflection</span>
              </div>
              <div className="text-xs sm:text-sm font-sans text-amber-400 font-bold tracking-wide">
                Breakpoint {activeQuestionIndex + 1} of {questions.length}
              </div>
            </div>

            {/* Main Question Body */}
            <div className="w-full max-w-3xl mx-auto my-auto py-6 space-y-6">
              {/* Context / Segment Focus Callout (NO italics) */}
              {(currentQuestion.segmentTopic || currentQuestion.contextSummary) && (
                <div className="p-4 rounded-2xl bg-[#091533] border border-amber-500/35 text-xs sm:text-sm space-y-1.5">
                  {currentQuestion.segmentTopic && (
                    <div className="text-amber-300 font-bold font-sans text-xs uppercase tracking-wider flex items-center gap-2">
                      <span className="text-amber-400/80">Segment Focus:</span>
                      <span className="text-white">{currentQuestion.segmentTopic}</span>
                    </div>
                  )}
                  {currentQuestion.contextSummary && (
                    <p className="text-slate-200 font-sans text-xs sm:text-sm leading-relaxed">
                      “{currentQuestion.contextSummary}”
                    </p>
                  )}
                </div>
              )}

              {/* The Question Text */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Four Answer Choices (A–D) */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  const isCorrect = opt.id === currentQuestion.correctAnswer;
                  const isWrong = wrongAnswers.has(opt.id);

                  let cardStyle =
                    "border-[#1B2B48] bg-[#091533] hover:bg-[#0E1F47] hover:border-amber-400/50 text-slate-200";

                  if (isAnswerCorrect && isCorrect) {
                    cardStyle =
                      "border-2 border-emerald-400 bg-emerald-500/20 text-emerald-100 font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)]";
                  } else if (isWrong) {
                    cardStyle =
                      "border-2 border-rose-500 bg-rose-500/20 text-rose-200";
                  } else if (isSelected && !isAnswerCorrect) {
                    cardStyle =
                      "border-2 border-amber-400 bg-amber-500/20 text-white font-semibold shadow-[0_0_15px_rgba(217,160,75,0.25)]";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isAnswerCorrect}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer text-sm sm:text-base ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                            isAnswerCorrect && isCorrect
                              ? "bg-emerald-500 text-neutral-950 border-emerald-400 font-black"
                              : isWrong
                              ? "bg-rose-500 text-white border-rose-400 font-bold"
                              : isSelected
                              ? "bg-amber-400 text-neutral-950 border-amber-400 font-black"
                              : "border-amber-500/40 text-amber-400 bg-black/40"
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className="flex-1 font-sans leading-relaxed">{opt.text}</span>
                      </div>

                      {isAnswerCorrect && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isWrong && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Try Again Hint on Wrong Answer */}
              {wrongAnswers.size > 0 && !isAnswerCorrect && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs sm:text-sm font-sans font-medium flex items-center gap-2 animate-fade-in">
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                  <span>Incorrect choice. Please review the options and try again!</span>
                </div>
              )}

              {/* Revealed Section on Correct Answer with Slide-Up Animation & Smooth Auto-Scroll */}
              {isAnswerCorrect && (
                <motion.div
                  ref={bottomSectionRef}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4 pt-3"
                >
                  {/* Exegetical Explanation Panel - Scripture reference ONLY appears in title */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#091533] border border-amber-500/50 text-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold font-sans text-xs uppercase tracking-wider">
                      <Sparkles size={14} />
                      <span>SDA Exegetical Understanding ({currentQuestion.scriptureRef})</span>
                    </div>
                    <p className="font-sans text-sm sm:text-base leading-relaxed text-slate-200">
                      {cleanExplanation}
                    </p>
                  </div>

                  {/* Timestamp placed between the SDA Exegetical Understanding explanation and Continue to Next Video button */}
                  <div className="text-center text-xs sm:text-sm font-sans text-slate-400 font-medium py-1">
                    Timestamp: <span className="text-amber-300 font-bold">{currentQuestion.timestampLabel}</span>
                  </div>

                  {/* Continue to Next Video Button */}
                  <button
                    type="button"
                    onClick={handleContinueVideo}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F3C562] via-[#E8B244] to-[#D59828] hover:from-[#FAD87F] hover:to-[#E8B244] text-neutral-950 font-black text-sm sm:text-base font-sans tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Continue to Next Video</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TOAST NOTIFICATION                                        */}
        {/* ========================================================= */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-950/95 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-2xl shadow-2xl border border-amber-400/50 animate-fade-in flex items-center gap-2.5 backdrop-blur-md">
            <Check size={16} className="text-amber-400 stroke-[2.5]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SabbathVideoPlayerModal;
