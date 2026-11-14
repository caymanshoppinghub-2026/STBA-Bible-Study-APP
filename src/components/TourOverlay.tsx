import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Compass,
  BookOpen,
  UserCheck,
  PauseCircle,
  Play,
  Layers,
  Brain,
  Award,
  X
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { TtsPlayer, preCacheSpeechAudios } from "./TtsPlayer";
import { apiFetch, isAuthRedirectResponse, safeParseResponseJson } from "../lib/apiFetch";
import { ELDER_STEVEN_PORTRAIT_URL, STBA_LOGO_URL } from "../assets/branding";

type OnboardingStage =
  | "idle"
  | "welcome_modal"
  | "dashboard_tour"
  | "profile_tour"
  | "study_tracks_conclusion";

interface ClusteredTourStep {
  id: string;
  clusterBadge: string;
  title: string;
  body: string;
  bullets: string[];
  targetSelector: () => HTMLElement | null;
  onEnter?: () => void;
  actionLabel?: string;
}

interface ConfettiParticle {
  id: number;
  left: string;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
}

export const TourOverlay: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  const [stage, setStage] = useState<OnboardingStage>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPausedForAvatar, setIsPausedForAvatar] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 100, left: 100 });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakingGreeting, setIsSpeakingGreeting] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);

  const currentTargetRef = useRef<HTMLElement | null>(null);
  const originalStylesRef = useRef<{ position: string; zIndex: string } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const userName = user?.name && user.name !== "Guest Scholar" ? user.name : "Noble Berean";

  // Exact personalized audio greeting requested by user specification
  const welcomeGreetingText = `Grace and peace to you, ${userName}. I am Elder Stephen, your AI Bible study mentor. Many people read the Bible again and again without truly retaining or applying what they learn. Using our STBA Study System, we help you understand Scripture deeply, remember it clearly, and use it meaningfully in your daily life. Click the button below to tour your dashboard.`;

  const tracksConclusionSpeech = `Welcome back to your dashboard, ${userName}. Your progress metrics are cleanly initialized at zero so every verse you master reflects your real study activity. I have highlighted Study Tracks for you. Let us initiate your first course on the 28 Fundamental Beliefs and Second Timothy two fifteen to begin transforming reading into lifelong retention.`;

  const geminiAudioCtxRef = useRef<AudioContext | null>(null);
  const geminiAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const geminiSpeechReqIdRef = useRef<number>(0);

  // Enforce Gemini Live 3.8 voice settings and pre-cache onboarding audio while tour is active
  useEffect(() => {
    const voice = localStorage.getItem("stba_ai_voice") || "Puck";
    if (!localStorage.getItem("stba_ai_voice") || voice === "Charon") {
      localStorage.setItem("stba_ai_voice", "Puck");
    }
    if (stage !== "idle") {
      localStorage.setItem("stba_tts_engine", "original");
      localStorage.setItem("stba_onboarding_voice_engine", "gemini-3.8-live");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    } else {
      localStorage.removeItem("stba_onboarding_voice_engine");
    }
    preCacheSpeechAudios([welcomeGreetingText, tracksConclusionSpeech], voice === "Charon" ? "Puck" : voice).catch(() => {});
  }, [stage, welcomeGreetingText, tracksConclusionSpeech]);

  const showToast = useCallback((msg: string, duration = 4200) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  // ===========================================================================
  // PHASE 2: CLUSTERED DASHBOARD TOUR STEPS (Cohesive Functional Domains)
  // ===========================================================================
  const dashboardClusterSteps: ClusteredTourStep[] = [
    {
      id: "cluster-ai-mentor",
      clusterBadge: "Cluster 1 • AI Mentor & Exegesis",
      title: "Elder Stephen AI Mentor",
      body: `Welcome to your study command center, ${userName}! We have grouped your AI mentoring tools so you can study without distraction:`,
      bullets: [
        "Elder Stephen's Corner: Weekly covenant teachings and Sola Scriptura guidance.",
        "Ask STBA AI Console: Instant line-upon-line exegesis and saved doctrinal answers.",
        "Weekly Study Recap: AI-synthesized mastery reviews generated from your live activity."
      ],
      targetSelector: () =>
        document.getElementById("elder-stevens-corner-hero") ||
        document.getElementById("ask-stba-ai-card")
    },
    {
      id: "cluster-study-modes",
      clusterBadge: "Cluster 2 • Core Study Modes",
      title: "Seven Study Engines & Zeroed Progress",
      body: "All seven STBA study modes are unified into a single launchpad right above your Spiritual Learning Journey gauges:",
      bullets: [
        "Exegesis & Doctrine: Bible Study Mode, Study Tracks, and Doctrine Navigator.",
        "Retention & Discipleship: Active Recall, Teach It Studio, Notebook, & Sabbath School.",
        "Clean Baseline: All 4 mastery gauges below start at 0% and grow strictly from your live sessions."
      ],
      targetSelector: () =>
        document.getElementById("choose-study-experience-section") ||
        document.getElementById("spiritual-learning-journey-card")
    },
    {
      id: "cluster-navigation-drawer",
      clusterBadge: "Cluster 3 • Navigation & HUD",
      title: "Navigation Drawer & Command Bar",
      body: "Your top workspace bar keeps navigation and real-time study alerts within one click:",
      bullets: [
        "Slide-Out Navigation Drawer: Top-left menu button to switch modes from anywhere.",
        "Live Notifications Bell: Alerts for 28 Fundamental Beliefs & Sabbath School updates.",
        "Help Center & Quick Access: Instant FAQs, support tickets, and live Zoom Bible study links."
      ],
      targetSelector: () =>
        document.getElementById("stba-sidebar-toggle-btn") ||
        document.getElementById("stba-top-bar")
    },
    {
      id: "cluster-profile-transition",
      clusterBadge: "Step 4 • Next Destination",
      title: "Open Account Profile Settings",
      body: "Now let's personalize your Disciple Profile! Click your Account Profile avatar in the top-right corner (or click the button below) to upload your avatar and inspect your Journal & Analytics.",
      bullets: [
        "Target Action: Click your top-right Profile Avatar icon.",
        "Next Phase: Upload your avatar image (tour will pause automatically).",
        "Inspect: Scribal Spiritual Journal & User Progress Analytics."
      ],
      targetSelector: () =>
        document.getElementById("topbar-profile-avatar") ||
        document.getElementById("topbar-actions-hud"),
      actionLabel: "Open Disciple Profile →"
    }
  ];

  // ===========================================================================
  // PHASE 3: DISCIPLE PROFILE TOUR STEPS (With Avatar Upload Pause)
  // ===========================================================================
  const profileTourSteps: ClusteredTourStep[] = [
    {
      id: "profile-avatar-pause",
      clusterBadge: "Profile Step 1 • Avatar Setup (Pauses Tour)",
      title: "Disciple Profile & Avatar Upload",
      body: "Welcome to your Disciple Profile! Here your registration date, Level 1 Academic Rank, and zeroed-out Scribal Heatmap & Achievements are displayed. Upload your avatar image now—the tour will pause while you upload and resume automatically once saved!",
      bullets: [
        "Click 'Upload Avatar Now' below or click your Avatar circle on the card.",
        "Tour Pauses Automatically: Drag & drop or choose any photo.",
        "Auto-Resume: Click 'Save & Exit' in the modal to continue the tour."
      ],
      targetSelector: () =>
        document.getElementById("user-metadata-card") ||
        document.getElementById("edit-profile-action"),
      onEnter: () => {
        window.dispatchEvent(
          new CustomEvent("stba-switch-profile-tab", { detail: { tab: "settings" } })
        );
      },
      actionLabel: "Skip Upload / Next →"
    },
    {
      id: "profile-scribal-journal",
      clusterBadge: "Profile Step 2 • Scribal Journal",
      title: "Scribal Spiritual Journal",
      body: "We have switched to your My Journal tab. Your Scribal Spiritual Journal is your sacred space for personal devotions, exegesis reflections, and prayer insights.",
      bullets: [
        "Zeroed Baseline: Total entries, writing streaks, and word counts start cleanly at 0.",
        "Dynamic Sync: Every reflection you save is persisted directly to Supabase.",
        "Elder Stephen Context: Your reflections help Elder Stephen tailor your pastoral guidance."
      ],
      targetSelector: () =>
        document.getElementById("tab-btn-journal") ||
        document.getElementById("profile-sub-tabs"),
      onEnter: () => {
        window.dispatchEvent(
          new CustomEvent("stba-switch-profile-tab", { detail: { tab: "journal" } })
        );
      }
    },
    {
      id: "profile-mastery-analytics",
      clusterBadge: "Profile Step 3 • Mastery Analytics",
      title: "User Progress & Mastery Analytics",
      body: "Here in the User Stats tab, your comprehensive Mastery Analytics, Milestones & Honors, and Ecosystem Integration cards monitor your long-term growth toward total Bible mastery.",
      bullets: [
        "100% Live Telemetry: All scores, streaks, and honors initialize at zero for new profiles.",
        "Ecosystem Modules: Tracks real-time activity across Study Tracks, Memory Vault, and Sabbath School.",
        "Central AI Brain: Continuously monitored by Elder Stephen to guide your next study step."
      ],
      targetSelector: () =>
        document.getElementById("tab-btn-stats") ||
        document.getElementById("profile-sub-tabs"),
      onEnter: () => {
        window.dispatchEvent(
          new CustomEvent("stba-switch-profile-tab", { detail: { tab: "stats" } })
        );
      }
    },
    {
      id: "profile-exit-to-dashboard",
      clusterBadge: "Profile Step 4 • Return to Dashboard",
      title: "Exit Back to Your Dashboard",
      body: "Your Disciple Profile, Scribal Journal, and Mastery Analytics tour is complete! Click the glowing green 'Return to Desktop' button to head back to your Dashboard and initiate Study Tracks.",
      bullets: [
        "Profile Configured: Your settings and zeroed analytics baseline are active.",
        "Final Step: Return to Dashboard to unlock your Study Tracks course prompt."
      ],
      targetSelector: () =>
        document.getElementById("return-to-desktop-btn") ||
        document.getElementById("signout-control-flow"),
      onEnter: () => {
        window.dispatchEvent(
          new CustomEvent("stba-switch-profile-tab", { detail: { tab: "settings" } })
        );
        window.dispatchEvent(
          new CustomEvent("stba-profile-tour-final-step", { detail: { isFinalStep: true } })
        );
      },
      actionLabel: "Return to Dashboard →"
    }
  ];

  const activeSteps = stage === "profile_tour" ? profileTourSteps : dashboardClusterSteps;

  // ===========================================================================
  // CONFETTI & AUDIO HELPERS
  // ===========================================================================
  const triggerCelebrationConfetti = useCallback(() => {
    // 1. Generate Framer Motion background particles
    const colors = ["#F3CF65", "#C9973A", "#2A9D8F", "#DFC57B", "#34D399", "#E76F51"];
    const generated: ConfettiParticle[] = Array.from({ length: 75 }).map((_, i) => ({
      id: i,
      left: `${Math.floor(Math.random() * 96) + 2}%`,
      color: colors[i % colors.length],
      size: Math.floor(Math.random() * 8) + 6,
      duration: Math.random() * 2.5 + 2.8,
      delay: Math.random() * 0.6,
      rotate: (i % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 540) + 180)
    }));
    setConfettiParticles(generated);

    // 2. Fire canvas-confetti dual-cannon burst
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: 0.15, y: 0.6 },
        colors: ["#F3CF65", "#C9973A", "#2A9D8F", "#DFC57B"]
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { x: 0.85, y: 0.6 },
          colors: ["#F3CF65", "#C9973A", "#2A9D8F", "#DFC57B"]
        });
      }, 220);
    } catch {
      // Fallback handled by motion particles
    }
  }, []);

  const stopSpeech = useCallback(() => {
    geminiSpeechReqIdRef.current += 1;
    if (geminiAudioSourceRef.current) {
      geminiAudioSourceRef.current.onended = null;
      try {
        geminiAudioSourceRef.current.stop();
      } catch {}
      geminiAudioSourceRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeakingGreeting(false);
  }, []);

  /**
   * Speaks tour narration exclusively using the Gemini Live 3.8 voice engine,
   * strictly avoiding the Edge / browser Web Speech API (`window.speechSynthesis`)
   * for the entire duration of the onboarding tour.
   */
  const speakText = useCallback(
    async (text: string) => {
      // Ensure any stray browser speechSynthesis is immediately silenced
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }

      if (isMuted || typeof window === "undefined") return;

      const cleaned = text
        .replace(/\*\*|###|##|#|\*/g, "")
        .replace(/[\[\]]/g, "")
        .replace(/DrA:/g, "")
        .replace(/Elder Stephen:/g, "")
        .replace(/Dr. Adams/g, "Doctor Adams")
        .trim();

      if (!cleaned) return;

      // Cancel any previous in-flight Gemini tour narration before starting the new step
      stopSpeech();
      const reqId = geminiSpeechReqIdRef.current;

      const savedVoice = localStorage.getItem("stba_ai_voice");
      const voice = !savedVoice || savedVoice === "Charon" ? "Puck" : savedVoice;
      const cacheKey = `${cleaned}_${voice}`;
      const cache = (window as any).__STBA_TTS_CACHE__ || {};

      try {
        let base64Audio: string | undefined = cache[cacheKey];

        if (!base64Audio) {
          const response = await apiFetch("/api/study/narrate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              text: cleaned,
              voice,
              model: "gemini-3.8-live",
              onboarding: true,
              disableBrowserFallback: true
            })
          });

          if (reqId !== geminiSpeechReqIdRef.current) return;

          if (!response.ok || isAuthRedirectResponse(response)) {
            setIsSpeakingGreeting(false);
            return;
          }

          const data = await safeParseResponseJson<{
            success?: boolean;
            audio?: string;
          }>(response);

          if (reqId !== geminiSpeechReqIdRef.current) return;

          if (data?.success && data?.audio) {
            base64Audio = data.audio;
            if ((window as any).__STBA_TTS_CACHE__) {
              (window as any).__STBA_TTS_CACHE__[cacheKey] = base64Audio;
            }
          } else {
            // Do NOT fall back to Edge / browser speechSynthesis during onboarding tour
            setIsSpeakingGreeting(false);
            return;
          }
        }

        if (!base64Audio || reqId !== geminiSpeechReqIdRef.current) return;

        // Decode 24kHz 16-bit signed PCM from Gemini Live 3.8 TTS
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        const sampleRate = 24000;
        const ctx =
          geminiAudioCtxRef.current ||
          new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        geminiAudioCtxRef.current = ctx;

        if (ctx.state === "suspended") {
          await ctx.resume().catch(() => {});
        }

        if (reqId !== geminiSpeechReqIdRef.current) return;

        const pcmBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
        pcmBuffer.getChannelData(0).set(float32Array);

        const source = ctx.createBufferSource();
        source.buffer = pcmBuffer;
        source.connect(ctx.destination);
        geminiAudioSourceRef.current = source;

        setIsSpeakingGreeting(true);
        source.onended = () => {
          if (geminiAudioSourceRef.current === source) {
            geminiAudioSourceRef.current = null;
            setIsSpeakingGreeting(false);
          }
        };
        source.start(0, 0);
      } catch {
        // Strictly avoid falling back to Edge / browser speechSynthesis during the tour
        setIsSpeakingGreeting(false);
      }
    },
    [isMuted, stopSpeech]
  );

  // ===========================================================================
  // HIGHLIGHT & POSITIONING ENGINE
  // ===========================================================================
  const cleanupHighlight = useCallback(() => {
    if (currentTargetRef.current) {
      if (originalStylesRef.current) {
        currentTargetRef.current.style.position = originalStylesRef.current.position;
        currentTargetRef.current.style.zIndex = originalStylesRef.current.zIndex;
      }
      currentTargetRef.current.classList.remove("tour-highlight");
      currentTargetRef.current = null;
      originalStylesRef.current = null;
    }
  }, []);

  const calculatePosition = (targetEl: HTMLElement, tooltipEl: HTMLElement | null) => {
    const rect = targetEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(370, viewportWidth - 32);
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 290;
    const gap = 16;

    let top = 0;
    let left = 0;
    let direction: "top" | "bottom" | "right" | "left" = "top";

    const isTopRightAvatar =
      targetEl.id === "topbar-profile-avatar" ||
      targetEl.id === "topbar-actions-hud" ||
      (rect.top < 100 && rect.left > viewportWidth * 0.6);

    if (isTopRightAvatar) {
      top = rect.bottom + gap;
      left = Math.max(16, rect.right - tooltipWidth);
      direction = "top";
    } else {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow >= tooltipHeight + gap) {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        direction = "top";
      } else if (spaceAbove >= tooltipHeight + gap) {
        top = rect.top - tooltipHeight - gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        direction = "bottom";
      } else {
        // Place comfortably inside viewport near bottom/center of target
        top = Math.max(20, Math.min(viewportHeight - tooltipHeight - 20, rect.top + 24));
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        direction = "top";
      }
    }

    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

    return { top, left, direction, tooltipWidth };
  };

  const updateTooltipPosition = useCallback(() => {
    if (!currentTargetRef.current) return;
    const rect = currentTargetRef.current.getBoundingClientRect();
    const { top, left, direction, tooltipWidth } = calculatePosition(
      currentTargetRef.current,
      tooltipRef.current
    );
    setTooltipPos({ top, left });

    const targetCenter = rect.left + rect.width / 2;
    const relativeLeft = targetCenter - left;
    const arrowLeft = Math.max(24, Math.min(tooltipWidth - 24, relativeLeft));

    if (direction === "top") {
      setArrowStyle({
        position: "absolute",
        top: "-6px",
        left: `${arrowLeft}px`,
        width: "12px",
        height: "12px",
        backgroundColor: "#0A192F",
        borderLeft: "1px solid #DFC57B",
        borderTop: "1px solid #DFC57B",
        transform: "translateX(-50%) rotate(45deg)",
        zIndex: 1003
      });
    } else {
      setArrowStyle({
        position: "absolute",
        bottom: "-6px",
        left: `${arrowLeft}px`,
        width: "12px",
        height: "12px",
        backgroundColor: "#0A192F",
        borderRight: "1px solid #DFC57B",
        borderBottom: "1px solid #DFC57B",
        transform: "translateX(-50%) rotate(45deg)",
        zIndex: 1003
      });
    }
  }, []);

  // ===========================================================================
  // STAGE TRANSITION CONTROLLERS
  // ===========================================================================
  const launchWelcomeModal = useCallback(() => {
    cleanupHighlight();
    setIsPausedForAvatar(false);
    setStepIndex(0);
    setStage("welcome_modal");
    localStorage.setItem("stba_onboarding_stage", "welcome_modal");
    triggerCelebrationConfetti();
    setTimeout(() => {
      speakText(welcomeGreetingText);
    }, 350);
  }, [cleanupHighlight, speakText, triggerCelebrationConfetti, welcomeGreetingText]);

  const startDashboardClusterTour = useCallback(() => {
    stopSpeech();
    cleanupHighlight();
    setIsPausedForAvatar(false);
    setStepIndex(0);
    setStage("dashboard_tour");
    localStorage.setItem("stba_onboarding_stage", "dashboard_tour");
    if (pathname !== "/dashboard" && pathname !== "/onboarding") {
      navigate("/dashboard");
    }
  }, [cleanupHighlight, navigate, pathname, stopSpeech]);

  const startProfileTour = useCallback(() => {
    stopSpeech();
    cleanupHighlight();
    setIsPausedForAvatar(false);
    setStepIndex(0);
    setStage("profile_tour");
    localStorage.setItem("stba_onboarding_stage", "profile_tour");
    window.dispatchEvent(new CustomEvent("stba-ensure-settings-tab"));
    if (pathname !== "/profile") {
      navigate("/profile");
    }
  }, [cleanupHighlight, navigate, pathname, stopSpeech]);

  const startStudyTracksConclusion = useCallback(() => {
    stopSpeech();
    cleanupHighlight();
    setIsPausedForAvatar(false);
    setStage("study_tracks_conclusion");
    localStorage.setItem("stba_onboarding_stage", "study_tracks_conclusion");
    if (pathname !== "/dashboard") {
      navigate("/dashboard");
    }
    setTimeout(() => {
      const tracksCard =
        document.getElementById("study-mode-card-study-tracks") ||
        document.getElementById("choose-study-experience-section");
      if (tracksCard) {
        tracksCard.scrollIntoView({ behavior: "smooth", block: "center" });
        originalStylesRef.current = {
          position: tracksCard.style.position || getComputedStyle(tracksCard).position,
          zIndex: tracksCard.style.zIndex || getComputedStyle(tracksCard).zIndex
        };
        tracksCard.style.position = "relative";
        tracksCard.style.zIndex = "1001";
        tracksCard.classList.add("tour-highlight");
        currentTargetRef.current = tracksCard;
      }
      speakText(tracksConclusionSpeech);
    }, 450);
  }, [cleanupHighlight, navigate, pathname, speakText, stopSpeech, tracksConclusionSpeech]);

  const completeAllOnboarding = useCallback(
    (toastMessage?: string) => {
      stopSpeech();
      cleanupHighlight();
      setIsPausedForAvatar(false);
      setStage("idle");
      localStorage.removeItem("stba_onboarding_stage");
      localStorage.removeItem("stba_onboarding_voice_engine");
      localStorage.removeItem("stba_is_new_user");
      localStorage.setItem("stba_tour_completed", "true");
      localStorage.setItem("stba_profile_tour_completed", "true");
      localStorage.setItem("stba_onboarding_v3_completed", "true");
      if (toastMessage) {
        showToast(toastMessage);
      }
    },
    [cleanupHighlight, showToast, stopSpeech]
  );

  // ===========================================================================
  // INITIALIZATION & EVENT LISTENERS
  // ===========================================================================
  useEffect(() => {
    const savedStage = localStorage.getItem("stba_onboarding_stage") as OnboardingStage | null;
    const v3Done = localStorage.getItem("stba_onboarding_v3_completed") === "true";
    const isNewUser = localStorage.getItem("stba_is_new_user") === "true";

    if (pathname === "/onboarding") {
      launchWelcomeModal();
      return;
    }

    if (pathname === "/dashboard") {
      if (savedStage === "welcome_modal" || (isNewUser && !v3Done && !savedStage)) {
        const timer = setTimeout(() => {
          launchWelcomeModal();
        }, 400);
        return () => clearTimeout(timer);
      } else if (savedStage === "dashboard_tour") {
        setStage("dashboard_tour");
      } else if (savedStage === "study_tracks_conclusion") {
        startStudyTracksConclusion();
      }
    } else if (pathname === "/profile") {
      if (savedStage === "profile_tour") {
        setStage("profile_tour");
      }
    }
  }, [pathname, launchWelcomeModal, startStudyTracksConclusion]);

  // Listen to explicit tour events from Dashboard, ProfileSettings, and AppLayout
  useEffect(() => {
    const handleStartFullOnboarding = () => {
      if (pathname !== "/dashboard") {
        localStorage.setItem("stba_onboarding_stage", "welcome_modal");
        navigate("/dashboard");
      } else {
        launchWelcomeModal();
      }
    };

    const handleStartDashboardOnly = () => {
      startDashboardClusterTour();
    };

    const handleStartProfileOnly = () => {
      startProfileTour();
    };

    const handleReturnedFromProfile = () => {
      startStudyTracksConclusion();
    };

    window.addEventListener("start-stba-onboarding-flow", handleStartFullOnboarding);
    window.addEventListener("start-stba-tour", handleStartDashboardOnly);
    window.addEventListener("start-stba-profile-tour", handleStartProfileOnly);
    window.addEventListener("stba-returned-from-profile-tour", handleReturnedFromProfile);

    return () => {
      window.removeEventListener("start-stba-onboarding-flow", handleStartFullOnboarding);
      window.removeEventListener("start-stba-tour", handleStartDashboardOnly);
      window.removeEventListener("start-stba-profile-tour", handleStartProfileOnly);
      window.removeEventListener("stba-returned-from-profile-tour", handleReturnedFromProfile);
    };
  }, [
    pathname,
    navigate,
    launchWelcomeModal,
    startDashboardClusterTour,
    startProfileTour,
    startStudyTracksConclusion
  ]);

  // Listen for Avatar Upload Modal Open / Save / Close during Profile Tour Step 1
  useEffect(() => {
    const handleEditModalOpened = () => {
      if (stage === "profile_tour") {
        stopSpeech();
        cleanupHighlight();
        setIsPausedForAvatar(true);
      }
    };

    const handleAvatarSaved = () => {
      if (stage === "profile_tour") {
        setIsPausedForAvatar(false);
        showToast("✦ Avatar saved! Resuming tour at Scribal Spiritual Journal...");
        setStepIndex((prev) => (prev === 0 ? 1 : prev));
      }
    };

    const handleEditModalClosed = () => {
      if (stage === "profile_tour" && isPausedForAvatar) {
        setIsPausedForAvatar(false);
      }
    };

    window.addEventListener("stba-profile-edit-modal-opened", handleEditModalOpened);
    window.addEventListener("stba-profile-avatar-saved", handleAvatarSaved);
    window.addEventListener("stba-profile-edit-modal-closed", handleEditModalClosed);

    return () => {
      window.removeEventListener("stba-profile-edit-modal-opened", handleEditModalOpened);
      window.removeEventListener("stba-profile-avatar-saved", handleAvatarSaved);
      window.removeEventListener("stba-profile-edit-modal-closed", handleEditModalClosed);
    };
  }, [stage, isPausedForAvatar, cleanupHighlight, showToast, stopSpeech]);

  // Allow direct clicking on #topbar-profile-avatar during Dashboard Tour final step
  useEffect(() => {
    if (stage !== "dashboard_tour" || stepIndex !== dashboardClusterSteps.length - 1) return;
    const avatarLink = document.getElementById("topbar-profile-avatar");
    if (!avatarLink) return;

    const handleAvatarClick = (e: MouseEvent) => {
      e.preventDefault();
      startProfileTour();
    };
    avatarLink.addEventListener("click", handleAvatarClick);
    return () => avatarLink.removeEventListener("click", handleAvatarClick);
  }, [stage, stepIndex, dashboardClusterSteps.length, startProfileTour]);

  // Allow direct clicking on #return-to-desktop-btn during Profile Tour final step
  useEffect(() => {
    if (stage !== "profile_tour" || stepIndex !== profileTourSteps.length - 1) return;
    const returnBtn = document.getElementById("return-to-desktop-btn");
    if (!returnBtn) return;

    const handleReturnClick = () => {
      startStudyTracksConclusion();
    };
    returnBtn.addEventListener("click", handleReturnClick);
    return () => returnBtn.removeEventListener("click", handleReturnClick);
  }, [stage, stepIndex, profileTourSteps.length, startStudyTracksConclusion]);

  // ===========================================================================
  // ACTIVE STEP HIGHLIGHTING & SPEECH EFFECT
  // ===========================================================================
  useEffect(() => {
    if ((stage !== "dashboard_tour" && stage !== "profile_tour") || isPausedForAvatar) {
      if (stage !== "study_tracks_conclusion") {
        cleanupHighlight();
      }
      return;
    }

    cleanupHighlight();

    const stepObj = activeSteps[stepIndex];
    if (!stepObj) return;

    if (stepObj.onEnter) {
      stepObj.onEnter();
    }

    const timer = setTimeout(() => {
      const element = stepObj.targetSelector();
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
          originalStylesRef.current = {
            position: element.style.position || getComputedStyle(element).position,
            zIndex: element.style.zIndex || getComputedStyle(element).zIndex
          };
          element.style.position = "relative";
          element.style.zIndex = "1001";
          if (element.id !== "tab-btn-journal" && element.id !== "tab-btn-stats") {
            element.classList.add("tour-highlight");
          }
          currentTargetRef.current = element;
          updateTooltipPosition();
        }, 280);
      }

      speakText(`${stepObj.title}. ${stepObj.body}`);
    }, 180);

    return () => {
      clearTimeout(timer);
      cleanupHighlight();
    };
  }, [stage, stepIndex, isPausedForAvatar]);

  // Reposition tooltip on window resize or scroll
  useEffect(() => {
    if (stage !== "dashboard_tour" && stage !== "profile_tour") return;
    const handleUpdate = () => updateTooltipPosition();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, { passive: true });
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
    };
  }, [stage, updateTooltipPosition]);

  // Step Navigation Handlers
  const handleNextStep = () => {
    if (stage === "dashboard_tour") {
      if (stepIndex < dashboardClusterSteps.length - 1) {
        setStepIndex((prev) => prev + 1);
      } else {
        // Transition from Dashboard Tour -> Disciple Profile Tour
        showToast("✦ Transitioning to Disciple Profile Settings...");
        startProfileTour();
      }
    } else if (stage === "profile_tour") {
      if (stepIndex < profileTourSteps.length - 1) {
        setStepIndex((prev) => prev + 1);
      } else {
        // Transition from Disciple Profile Tour -> Dashboard Study Tracks Conclusion
        showToast("✦ Returning to Dashboard — Highlighting Study Tracks...");
        startStudyTracksConclusion();
      }
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  if (stage === "idle" && !toast) return null;

  return (
    <>
      <style id="tour-styles">{`
        .tour-highlight {
          outline: 3px solid #F3CF65 !important;
          outline-offset: 6px !important;
          box-shadow: 0 0 0 6px rgba(243, 207, 101, 0.2), 0 0 35px rgba(243, 207, 101, 0.55) !important;
          border-radius: 18px !important;
          transition: outline 0.25s ease, box-shadow 0.25s ease !important;
        }
        #tab-btn-journal,
        #tab-btn-stats,
        #tab-btn-journal.tour-highlight,
        #tab-btn-stats.tour-highlight {
          outline: none !important;
          outline-offset: 0 !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
      `}</style>

      {/* ===================================================================== */}
      {/* FLOATING TOAST NOTIFICATION                                           */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 15, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[1100] bg-[#0A192F] text-white border border-[#DFC57B] rounded-2xl px-5 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center gap-2.5 text-xs sm:text-sm font-sans font-semibold pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-[#F3CF65] shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* PHASE 1: CELEBRATORY MODAL WITH CONFETTI & AUDIO GREETING             */}
      {/* (Keeps Dashboard visible in the blurred background)                   */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {stage === "welcome_modal" && (
          <motion.div
            key="onboarding-welcome-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-[#040B18]/65 backdrop-blur-md overflow-y-auto"
            id="onboarding-celebratory-backdrop"
          >
            {/* Animated Confetti Particles Layer */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1051]">
              {confettiParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ top: "-5%", left: p.left, rotate: 0, opacity: 1, scale: 0.8 }}
                  animate={{
                    top: "105%",
                    rotate: p.rotate,
                    opacity: [1, 1, 0.8, 0],
                    scale: [0.8, 1.15, 0.9]
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: p.id % 3 === 0 ? "50%" : "2px"
                  }}
                />
              ))}
            </div>

            {/* Celebratory Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="relative z-[1052] w-full max-w-xl rounded-[28px] bg-gradient-to-b from-[#081A36] via-[#06142A] to-[#040D1C] border-2 border-[#DFC57B] shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_45px_rgba(223,197,123,0.28)] overflow-hidden text-left"
              id="onboarding-celebratory-modal"
            >
              {/* Top Golden Shimmer Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#C9973A] via-[#FFF2A8] to-[#2A9D8F]" />

              <div className="p-6 sm:p-8 space-y-6">
                {/* Header Dismiss */}
                <div className="flex items-center justify-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => completeAllOnboarding("Onboarding skipped. You can relaunch the Guided Tour anytime from Quick Access.")}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Skip Onboarding"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Elder Stephen Portrait & Headline */}
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-0.5 bg-gradient-to-br from-[#F3CF65] via-[#DFC57B] to-[#2A9D8F] shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(243,207,101,0.3)] overflow-hidden">
                      <img
                        src={ELDER_STEVEN_PORTRAIT_URL}
                        alt="Elder Stephen - AI Bible Study Mentor"
                        className="w-full h-full object-cover rounded-[14px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#F3CF65] text-[#06162c] font-mono font-black text-[9px] uppercase tracking-wider rounded-full shadow-md whitespace-nowrap">
                      Elder Stephen
                    </span>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#2A9D8F] font-bold block">
                      Cognitive Scripture Mastery System
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight">
                      Grace & Peace to You,{" "}
                      <span className="text-[#F3CF65]">{userName}</span>
                    </h2>
                    <p className="text-xs text-stone-300 font-sans">
                      Your dashboard is live behind this window with all progress metrics cleanly initialized at zero.
                    </p>
                  </div>
                </div>

                {/* Personalized Greeting Script Box */}
                <div className="p-5 rounded-2xl bg-[#040C1A]/90 border-l-4 border-[#F3CF65] border-t border-r border-b border-white/10 space-y-3 shadow-inner">
                  <p className="text-sm text-stone-100 font-lato leading-relaxed">
                    “Grace and peace to you, <strong className="text-[#F3CF65]">{userName}</strong>. I am{" "}
                    <strong className="text-[#F3CF65]">Elder Stephen</strong>, your AI Bible study mentor. Many people read the Bible again and again without truly retaining or applying what they learn. Using our{" "}
                    <strong className="text-white">STBA Study System</strong>, we help you understand Scripture deeply, remember it clearly, and use it meaningfully in your daily life. Click the button below to tour your dashboard.”
                  </p>

                  {/* Neural Audio Player Controls (Gemini Live 3.8 Only, autoPlay handled by speakText) */}
                  <div className="pt-1" style={{ display: "none" }}>
                    <TtsPlayer
                      text={welcomeGreetingText}
                      messageId="onboarding-welcome-greeting"
                      autoPlay={false}
                      disableBrowserFallback={true}
                      label="Hear Elder Stephen's Greeting"
                    />
                  </div>
                </div>

                {/* 3-Stage Walkthrough Roadmap Pills */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#0A1E3C]/90 border border-[#DFC57B]/50">
                    <span className="text-[10px] font-mono font-bold text-[#F3CF65] block uppercase">
                      Stage 1
                    </span>
                    <span className="text-xs font-serif font-bold text-white">
                      Dashboard Tour
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0A1E3C]/40 border border-white/10">
                    <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                      Stage 2
                    </span>
                    <span className="text-xs font-serif font-bold text-stone-300">
                      Profile & Avatar
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0A1E3C]/40 border border-white/10">
                    <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                      Stage 3
                    </span>
                    <span className="text-xs font-serif font-bold text-stone-300">
                      Study Tracks
                    </span>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <button
                    id="tour-your-dashboard-btn"
                    type="button"
                    onClick={startDashboardClusterTour}
                    className="w-full py-4 px-6 rounded-2xl gold-metallic-btn font-serif font-black text-sm uppercase tracking-wider text-[#06162c] shadow-[0_10px_30px_rgba(243,207,101,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Tour Your Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* AVATAR UPLOAD PAUSE BANNER (Shown when Profile Edit Modal is open)     */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {stage === "profile_tour" && isPausedForAvatar && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-[1100] w-[92vw] max-w-xl bg-[#0A192F]/95 backdrop-blur-md border-2 border-[#F3CF65] rounded-2xl px-5 py-3.5 shadow-[0_14px_40px_rgba(0,0,0,0.75)] flex items-center justify-between gap-3 text-left"
            id="tour-avatar-pause-banner"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F3CF65]/20 text-[#F3CF65] shrink-0">
                <PauseCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#F3CF65] block">
                  Onboarding Tour Paused for Avatar Upload
                </span>
                <p className="text-xs text-stone-200 font-sans">
                  Upload your avatar image below and click <strong>"Save & Exit"</strong>—your tour will resume automatically!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPausedForAvatar(false);
                setStepIndex(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0d3060] hover:bg-[#144280] text-[#F3CF65] text-xs font-mono font-bold shrink-0 cursor-pointer border border-[#DFC57B]/40"
            >
              Resume Tour →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* PHASE 2 & PHASE 3: CLUSTERED DASHBOARD & PROFILE INTERACTIVE TOOLTIPS */}
      {/* ===================================================================== */}
      {(stage === "dashboard_tour" || stage === "profile_tour") && !isPausedForAvatar && (
        <>
          {/* Semi-transparent dim backdrop */}
          <div
            className="fixed inset-0 bg-[#030812]/55 z-[1000] transition-opacity duration-200 pointer-events-none"
            id="stba-tour-overlay-dim"
          />

          {/* Clustered Tooltip Card */}
          <div
            ref={tooltipRef}
            aria-live="polite"
            style={{
              position: "fixed",
              zIndex: 1002,
              top: `${tooltipPos.top}px`,
              left: `${tooltipPos.left}px`,
              width: "min(370px, calc(100vw - 32px))",
              transition: "top 0.2s ease-out, left 0.2s ease-out"
            }}
            className="bg-[#0A192F] border-2 border-[#DFC57B] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(223,197,123,0.25)] text-left text-white font-sans"
            id="stba-tour-tooltip-panel"
          >
            {arrowStyle && <div style={arrowStyle} />}

            {/* Title & Audio Narration Toggle */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="font-serif text-lg font-bold text-[#F3CF65] leading-snug">
                {activeSteps[stepIndex]?.title}
              </h4>

              <button
                type="button"
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) stopSpeech();
                }}
                className="p-1 rounded-lg bg-[#06162c] text-[#F3CF65] hover:bg-[#0d3060] cursor-pointer shrink-0"
                title={isMuted ? "Unmute narration" : "Mute narration"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-200 font-lato leading-relaxed mb-3">
              {activeSteps[stepIndex]?.body}
            </p>

            {/* Special Interactive Button for Profile Step 1: Upload Avatar */}
            {stage === "profile_tour" && stepIndex === 0 && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("stba-open-avatar-upload-modal"));
                }}
                className="w-full mb-3 py-2.5 px-4 rounded-xl bg-[#2A9D8F] hover:bg-[#23877B] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                id="tour-upload-avatar-trigger-btn"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Avatar Image (Pause Tour)</span>
              </button>
            )}

            {/* Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {activeSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === stepIndex ? "w-5 bg-[#F3CF65]" : "w-1.5 bg-stone-600"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-sans font-semibold text-stone-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    ← Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    completeAllOnboarding(
                      "Tour closed. You can relaunch the Guided Tour anytime from Quick Access."
                    )
                  }
                  className="px-2 py-1.5 rounded-lg text-xs font-sans text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Skip
                </button>

                <button
                  ref={nextButtonRef}
                  type="button"
                  onClick={handleNextStep}
                  className="px-3.5 py-2 rounded-xl gold-metallic-btn text-[#06162c] font-serif font-extrabold text-xs cursor-pointer shadow-md flex items-center gap-1"
                  id="stba-tour-next-btn"
                >
                  <span>
                    {activeSteps[stepIndex]?.actionLabel ||
                      (stepIndex === activeSteps.length - 1 ? "Continue ✦" : "Next →")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* PHASE 4 (CONCLUSION): HIGHLIGHT STUDY TRACKS & INTRO AI PROMPT        */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {stage === "study_tracks_conclusion" && (
          <motion.div
            key="study-tracks-conclusion-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#030812]/60 flex items-end sm:items-center justify-center p-4 overflow-y-auto"
            id="study-tracks-conclusion-backdrop"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative z-[1005] w-full max-w-lg rounded-[26px] bg-gradient-to-b from-[#091C3A] via-[#06142A] to-[#040D1C] border-2 border-[#F3CF65] p-6 sm:p-7 shadow-[0_24px_65px_rgba(0,0,0,0.85),0_0_40px_rgba(243,207,101,0.3)] text-left space-y-5 my-auto"
              id="study-tracks-initiation-modal"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F3CF65]/15 border border-[#F3CF65]/40 flex items-center justify-center text-[#F3CF65]">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#2A9D8F] block">
                      Onboarding Complete • Initiate First Course
                    </span>
                    <h3 className="font-serif text-xl font-black text-white">
                      Begin Your First Study Track
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    completeAllOnboarding(
                      "✦ Welcome Tour complete! Click Study Tracks Mode anytime to begin."
                    )
                  }
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Zeroed Metrics Verification Pill */}
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/35 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>New Profile Baseline Verified:</span>
                </span>
                <span className="font-mono text-[11px] text-stone-200">
                  0% Mastery • 0 Verses • 0 Streak
                </span>
              </div>

              {/* Elder Stephen Introductory AI Course Prompt Outline */}
              <div className="p-4 rounded-2xl bg-[#040C1A]/90 border border-[#DFC57B]/35 space-y-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={ELDER_STEVEN_PORTRAIT_URL}
                    alt="Elder Stephen"
                    className="w-9 h-9 rounded-full object-cover border border-[#F3CF65]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#F3CF65] font-bold block">
                      Elder Stephen • Introductory AI Course Prompt
                    </span>
                    <span className="text-xs font-serif font-bold text-white">
                      Course 1: Foundational SDA Beliefs & 2 Timothy 2:15
                    </span>
                  </div>
                </div>

                <div className="text-xs text-stone-200 font-lato space-y-2 pl-1">
                  <p className="font-bold text-[#F3CF65]">
                    I. Recommended Starting Track
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-stone-300 pl-2">
                    <li>
                      <strong>Track:</strong> 28 Fundamental Beliefs & Sola Scriptura Foundations
                    </li>
                    <li>
                      <strong>Anchor Verse:</strong> <em>2 Timothy 2:15</em> — “Study to shew thyself approved unto God…”
                    </li>
                    <li>
                      <strong>Method:</strong> Explain Mode (Exegesis) → Active Recall → Teach It
                    </li>
                  </ul>
                </div>

                <TtsPlayer
                  text={tracksConclusionSpeech}
                  messageId="onboarding-tracks-conclusion"
                  autoPlay={false}
                  disableBrowserFallback={true}
                  label="Hear Course Invitation"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  id="initiate-study-tracks-btn"
                  type="button"
                  onClick={() => {
                    completeAllOnboarding("✦ Launching Theological Study Tracks!");
                    navigate("/tracks");
                  }}
                  className="w-full py-3.5 px-5 rounded-xl gold-metallic-btn text-[#06162c] font-serif font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] transition-all"
                >
                  <span>Initiate Study Tracks Course</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    id="trigger-intro-ai-prompt-btn"
                    type="button"
                    onClick={() => {
                      completeAllOnboarding("✦ Opening Elder Stephen Introductory Course Prompt!");
                      window.dispatchEvent(
                        new CustomEvent("stba-trigger-intro-course-prompt", {
                          detail: {
                            prompt:
                              "Guide me through my first Study Track lesson on 2 Timothy 2:15 and how Scripture interprets Scripture."
                          }
                        })
                      );
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-[#0d3060] hover:bg-[#14407c] border border-[#DFC57B]/50 text-[#F3CF65] font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Elder Stephen First</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      completeAllOnboarding("✦ Onboarding complete! Explore your dashboard freely.")
                    }
                    className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 font-sans font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Explore Dashboard First
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TourOverlay;
