/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch, safeParseResponseJson } from "../lib/apiFetch";
import { decodeAndCleanGeminiPcm, encodeFloat32To16kHzPcmBase64 } from "../utils/cleanGeminiAudio";
import { extractFirstName } from "../utils/elderSpacing";
import {
  X,
  Mic,
  MicOff,
  Square,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Play,
  Volume2,
  VolumeX,
  BookOpen,
  Bookmark,
  Award,
  Zap,
  FolderLock,
  AlertCircle,
  FolderOpen,
  Send,
  MessageSquare,
  TrendingUp,
  BrainCircuit,
  MessageCircle,
  Clock,
  Download,
  FileText,
  Printer,
  Brain,
  Pause,
  Layers,
  Quote,
  Compass,
  GraduationCap,
  ChevronDown
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Scripture } from "../types";
import { useApp } from "../context/AppContext";
import { callElderStephen } from "../lib/callElderStephen";
import { ElderStephenMemoryEngine } from "../lib/elderStephenEngine";
import { getElderStephenVoice } from "./stba/RightPaneTools";
import { useLocation, useNavigate } from "react-router-dom";
import { bibleService } from "../services/bibleService";
import { VerseModal } from "./VerseModal";
import { getScriptureRegex, formatStandardReference } from "../utils/sabbathUtils";
import {
  supabase,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_EDGE_FUNCTION_URL,
  buildSupabaseLiveWebSocketUrl,
  getSupabaseEdgeFunctionWsUrl,
  getUntruncatedSessionToken,
  type StudyContextQueryParams
} from "../lib/supabase";

// Default target scripture used for exegesis (2 Timothy 2:15)
const DEFAULT_SCRIPTURE: Scripture = {
  id: "2tim-2-15",
  reference: "2 Timothy 2:15",
  text: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
  keywords: ["study", "approved", "workman", "ashamed", "rightly dividing"]
};

// Simulated pre-baked responses for various stages if the user triggers simulator
const SIMULATED_EXPOSITIONS: Record<string, string> = {
  stage1: "In Timothy's context, Paul uses the Greek term 'orthotomeo'—translated 'rightly dividing'—which literally means to cut a straight path or construct a straight road. Paul wants Timothy to be an unashamed workman, displaying intellectual integrity and accuracy when studying the Word of God, rather than bending scripture to fit human whims or philosophical fancies.",
  stage2: "Looking at the Great Controversy timeline, the word of God has always been the primary target of satanic subversion. The serpent twisted God's words in Eden, and throughout history, spiritual truth has been obscured by tradition and human dogmas. 'Rightly dividing' is our spiritual bulkhead against the deceptive floodwaters of spiritual compromises.",
  stage3: "This passage establishes Fundamental Belief #1 (Holy Scriptures) which represents our ultimate rule of faith, practice, and the objective test of Christian experience. In Seventh-day Adventist doctrine, we study the cohesive harmony of old and new testament scriptures to secure a theological anchor during the final shaking time.",
  stage4: "A practical application for our busy lives is to reject passive checklist reading. If I want to be an approved workman, I must dedicate a high-focus 20-minute morning window, taking written log logs, cross-referencing scriptures, and allowing the principles to directly reform my temper and schedule today.",
  stage5: "When inviting a non-Adventist neighbor or seeker to explore this, we must lead with winsome gentleness and absolute respect. We don't demand blind dogmatic subscription. Instead, we invite them as fellow Bereans, opening the scriptures together to discover the beautifully coherent plan of a loving, perfect Saviour."
};

interface TeachItStudioProps {
  scripture?: Scripture;
  onClose: () => void;
  sabbathMode?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

type PhaseType =
  | "intro"
  | "stage1"
  | "stage2"
  | "stage3"
  | "stage4"
  | "stage5"
  | "feedback";

export const TeachItStudio: React.FC<TeachItStudioProps> = ({
  scripture: propScripture = DEFAULT_SCRIPTURE,
  onClose,
  sabbathMode = false
}) => {
  const { user, showConfetti } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve Holy Scriptures override
  const params = new URLSearchParams(location.search);
  const stateDoctrine = location.state?.doctrineId;
  const isFromBelief1 = params.get("doctrine") === "holy-scriptures" || stateDoctrine === "holy-scriptures";

  const initialScripture = isFromBelief1 ? {
    id: "holy-scriptures",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "reproof", "correction", "instruction"]
  } : propScripture;

  const TEACH_IT_SESSION_STORAGE_KEY = "stba_teach_it_active_session_v1";

  const savedSessionSnapshot = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(TEACH_IT_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.phase && parsed.phase !== "intro" && parsed.phase !== "feedback" && !parsed.completed) {
          return parsed;
        }
      }
    } catch {}
    return null;
  }, []);

  const [activeScripture, setActiveScripture] = useState<Scripture>(
    savedSessionSnapshot?.activeScripture || initialScripture
  );
  const scripture = activeScripture;

  // Role selections and options
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem("stba_user_role") || user?.role || "Student";
  });
  const [isEvangelist, setIsEvangelist] = useState<boolean>(() => {
    return userRole === "LayEvangelist" || localStorage.getItem("stba_user_role") === "LayEvangelist";
  });
  const [isAudioPrompterEnabled, setIsAudioPrompterEnabled] = useState<boolean>(true);

  // Always start on the intro screen; incomplete sessions are resumed via "Continue Session"
  const [phase, setPhase] = useState<PhaseType>("intro");
  const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "slate">("chat");
  const [activeSlateTab, setActiveSlateTab] = useState<"all" | "scriptures" | "egw" | "pedagogy">("all");
  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [isVerseModalOpen, setIsVerseModalOpen] = useState<boolean>(false);
  const [showSlateDownloadMenu, setShowSlateDownloadMenu] = useState<boolean>(false);
  const [hasTopicBeenChosen, setHasTopicBeenChosen] = useState<boolean>(
    Boolean(savedSessionSnapshot?.hasTopicBeenChosen)
  );
  const [isRightSlatePopulated, setIsRightSlatePopulated] = useState<boolean>(
    Boolean(savedSessionSnapshot?.isRightSlatePopulated)
  );
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>(
    savedSessionSnapshot?.activeTopicTitle || ""
  );
  const [activeTopicOverview, setActiveTopicOverview] = useState<string>(
    savedSessionSnapshot?.activeTopicOverview || ""
  );
  const [activeTopicImportance, setActiveTopicImportance] = useState<string>(
    savedSessionSnapshot?.activeTopicImportance || ""
  );
  const [activeExegesisDemo, setActiveExegesisDemo] = useState<string>(
    savedSessionSnapshot?.activeExegesisDemo || ""
  );
  const [customFoundationalScriptures, setCustomFoundationalScriptures] = useState<
    Array<{ reference: string; role: string; stageInsight: string }>
  >(savedSessionSnapshot?.customFoundationalScriptures || []);
  const rightSlateScrollRef = useRef<HTMLDivElement>(null);
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState<boolean>(false);
  const [activeEgwCommentary, setActiveEgwCommentary] = useState<string>(
    savedSessionSnapshot?.activeEgwCommentary || ""
  );

  // Teach-It Elder Stephen elements
  const [teachingDraftOutline, setTeachingDraftOutline] = useState(() => {
    return localStorage.getItem(`stba_teach_it_outline_${scripture.id}`) || 
      `1. Big Idea: Tracing covenant relationships\n2. Key Text Exposition: "${scripture.text}"\n3. Critical Illustrations\n4. Life Transition & Appeals`;
  });
  const [targetAudience, setTargetAudience] = useState<"Child" | "New Believer" | "Mature Student">("New Believer");
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [outlineFeedback, setOutlineFeedback] = useState("");

  const handleGenerateOutlineWithElder = async () => {
    if (!teachingDraftOutline.trim()) return;
    setIsGeneratingOutline(true);
    setOutlineFeedback("");
    try {
      const historyLog = chatMessages.map(m => ({
        role: (m.sender === "user" ? "user" : "elder") as "user" | "elder" | "model",
        text: m.text
      }));

      const payload = {
        currentMode: 'Teach It' as const,
        noteTitle: `Teaching Outline: ${scripture.reference}`,
        noteContent: teachingDraftOutline,
        historyLog,
        passage: scripture.reference || "2 Timothy 2:15",
        outline: teachingDraftOutline,
        audience: targetAudience,
        userAction: 'teach_it_outline' as const
      };

      const res = await callElderStephen(payload);
      if (res && res.text) {
        setOutlineFeedback(res.text);
      }
    } catch (e) {
      console.error("Failed to generate/evaluate teach outline:", e);
    } finally {
      setIsGeneratingOutline(false);
    }
  };
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    savedSessionSnapshot?.secondsRemaining || 0
  );
  const [isTimerActive, setIsTimerActive] = useState<boolean>(
    Boolean(savedSessionSnapshot?.isTimerActive)
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Chat message engine (restored across navigation so returning picks up where left off)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (Array.isArray(savedSessionSnapshot?.chatMessages)) {
      return savedSessionSnapshot.chatMessages.map((m: any) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
      }));
    }
    return [];
  });

  // Speech Recognition engine
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Real-time Scorecard stats (accumulated through user input)
  const [scoreStats, setScoreStats] = useState(
    savedSessionSnapshot?.scoreStats || {
      overallScore: 0,
      stageScores: {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0,
        stage5: 0
      } as Record<string, number>,
      foundKeywords: [] as string[],
      gaps: scripture.keywords || [],
      stageFeedback: {
        stage1: "Awaiting your exegesis...",
        stage2: "Awaiting controversy insights...",
        stage3: "Awaiting doctrinal links...",
        stage4: "Awaiting action points...",
        stage5: "Awaiting appeal presentation..."
      } as Record<string, string>,
      ellenWhiteQuote: "The Bible is its own expositor. Scripture is to be compared with scripture.",
      devotionalPrompt: "What is God asking you to trust, release, or do today?"
    }
  );

  // Persist active Teach It Studio session across navigation
  useEffect(() => {
    if (phase === "intro") return;
    try {
      const payload = {
        phase,
        activeScripture,
        hasTopicBeenChosen,
        isRightSlatePopulated,
        activeTopicTitle,
        activeTopicOverview,
        activeTopicImportance,
        activeExegesisDemo,
        customFoundationalScriptures,
        scoreStats,
        secondsRemaining,
        isTimerActive,
        chatMessages: chatMessages.slice(-80)
      };
      localStorage.setItem(TEACH_IT_SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [
    phase,
    activeScripture,
    hasTopicBeenChosen,
    isRightSlatePopulated,
    activeTopicTitle,
    activeTopicOverview,
    activeTopicImportance,
    activeExegesisDemo,
    customFoundationalScriptures,
    scoreStats,
    secondsRemaining,
    isTimerActive,
    chatMessages
  ]);

  const [devotionalReflection, setDevotionalReflection] = useState<string>("");
  const [hasSavedReflection, setHasSavedReflection] = useState<boolean>(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(new Array(16).fill(6));

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stageSelectorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active stage selector button into center on mobile
  useEffect(() => {
    if (stageSelectorRef.current) {
      const activeEl = stageSelectorRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [phase]);

  // Gemini Live Voice variables & states (gemini-3.8-live)
  const [useLiveVoiceAPI, setUseLiveVoiceAPI] = useState<boolean>(true);
  const [liveWebSocketActive, setLiveWebSocketActive] = useState<boolean>(false);
  const [liveState, setLiveState] = useState<"idle" | "connecting" | "ready" | "recording" | "playing" | "error">("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveModelName, setLiveModelName] = useState<string>("gemini-3.8-live");
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const liveSessionRunIdRef = useRef<number>(0);
  const liveRetryTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  // Separate 16kHz input and 24kHz output AudioContexts per Gemini Live API guidelines
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const activeNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const currentLiveReplyTextRef = useRef<string>("");
  const currentLiveReplyIdRef = useRef<string | null>(null);
  const isElderSpeakingRef = useRef<boolean>(false);
  const isMicMutedRef = useRef<boolean>(false);
  const liveStateRef = useRef<string>("idle");

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    liveStateRef.current = liveState;
  }, [liveState]);

  const phaseRef = useRef<PhaseType>(phase);
  const scoreStatsRef = useRef(scoreStats);
  const evaluatedStagesLiveRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    scoreStatsRef.current = scoreStats;
  }, [scoreStats]);

  // Helper float to 16bit PCM
  const floatTo16BitPCM = (floatSamples: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(floatSamples.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < floatSamples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, floatSamples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  // Helper convert arraybuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const clearPlaybackQueue = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {
        // Already ended or stopped
      }
    });
    activeNodesRef.current = [];
    isElderSpeakingRef.current = false;
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  };

  const cleanupLiveAudioAndWS = () => {
    liveSessionRunIdRef.current += 1;
    setLiveWebSocketActive(false);
    setLiveState("idle");

    if (liveRetryTimerRef.current) {
      clearTimeout(liveRetryTimerRef.current);
      liveRetryTimerRef.current = null;
    }

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, "Session ended");
        }
      } catch (e) {}
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      micStreamRef.current = null;
    }
    clearPlaybackQueue();
  };

  const resolveUserName = (): string => {
    if (user?.name) return extractFirstName(user.name, "Berean");
    if ((user as any)?.displayName) return extractFirstName((user as any).displayName, "Berean");
    try {
      const savedProfile = localStorage.getItem("stba_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name) return extractFirstName(parsed.name, "Berean");
        if (parsed?.displayName) return extractFirstName(parsed.displayName, "Berean");
      }
    } catch (e) {}
    return "Berean";
  };

  const syncLiveSessionProgress = (fullText: string) => {
    const lowerText = fullText.toLowerCase();

    // 1. Check if the AI announces an evaluation score in voice/text
    const scorePatterns = [
      /(?:evaluate|evaluates|evaluated|evaluating)\s+[^.!?\n]{0,60}?(?:at|is|with)?\s*(\d{2,3})\s*(?:%|percent|\/100|out of 100)?/i,
      /(?:evaluation\s+score|assessment\s+score|your\s+score)[^.!?\n]{0,30}?(?:is|:|\sat)\s*(\d{2,3})\s*(?:%|percent|\/100|out of 100)?/i,
      /(?:score|scored|score:)\s*(\d{2,3})\s*(?:%|percent|\/100|out of 100)/i,
      /(\d{2,3})\s*(?:percent|%|out of 100|\/100)/i
    ];

    let parsedScore: number | null = null;
    for (const pattern of scorePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val >= 0 && val <= 100) {
          parsedScore = val;
          break;
        }
      }
    }

    const currentPhase = phaseRef.current;

    // Trigger on evaluation score: as soon as the score is spoken, move stage indicator visually to the next stage
    if (parsedScore !== null && currentPhase.startsWith("stage") && !evaluatedStagesLiveRef.current.has(currentPhase)) {
      const currentStageNum = parseInt(currentPhase.replace("stage", ""), 10);
      evaluatedStagesLiveRef.current.add(currentPhase);

      if (currentStageNum < 5) {
        const nextStageNum = currentStageNum + 1;
        const nextStageId = `stage${nextStageNum}` as PhaseType;

        // Immediately update stage score, reset session score for new stage, and move visual stage indicator
        setScoreStats((prev) => {
          const nextStageScores = { ...prev.stageScores };
          nextStageScores[currentPhase] = parsedScore!;
          return {
            ...prev,
            overallScore: 0, // Reset session score for the new stage
            stageScores: nextStageScores
          };
        });

        // Visually update the stage indicator immediately
        setPhase(nextStageId);
        triggerToast(`AI Evaluated Stage ${currentStageNum} at ${parsedScore}%. Advanced to Stage ${nextStageNum}!`);
      } else {
        // Stage 5 completed
        setScoreStats((prev) => {
          const nextStageScores = { ...prev.stageScores };
          nextStageScores[currentPhase] = parsedScore!;
          return {
            ...prev,
            overallScore: parsedScore!,
            stageScores: nextStageScores
          };
        });
        triggerToast(`AI Evaluated Stage 5 at ${parsedScore}%. Exegesis journey completed!`);
        setTimeout(() => {
          handleAdvanceToScorecard(true);
        }, 1800);
      }
      return;
    }

    // 2. Check explicit verbal transition cues from AI: "move on to Stage 2", "advance to Stage 3", etc.
    const transitionMatch = lowerText.match(/(?:move on to|proceed to|advance to|welcome to|starting with|let's move to|let's begin with|now on to|transition to|moving to|let's explore stage|now in stage)\s*(?:stage|step)?\s*([1-5])/i);
    let detectedStage: PhaseType | null = null;
    if (transitionMatch) {
      const stNum = transitionMatch[1];
      detectedStage = `stage${stNum}` as PhaseType;
    } else {
      // Check descending stage headers/markers
      if (lowerText.includes("stage 5:") || lowerText.includes("step 5:") || lowerText.includes("stage 5 -") || lowerText.includes("stage 5.")) {
        detectedStage = "stage5";
      } else if (lowerText.includes("stage 4:") || lowerText.includes("step 4:") || lowerText.includes("stage 4 -") || lowerText.includes("stage 4.")) {
        detectedStage = "stage4";
      } else if (lowerText.includes("stage 3:") || lowerText.includes("step 3:") || lowerText.includes("stage 3 -") || lowerText.includes("stage 3.")) {
        detectedStage = "stage3";
      } else if (lowerText.includes("stage 2:") || lowerText.includes("step 2:") || lowerText.includes("stage 2 -") || lowerText.includes("stage 2.")) {
        detectedStage = "stage2";
      }
    }

    if (detectedStage && detectedStage !== phaseRef.current) {
      setPhase(detectedStage);
      setScoreStats((prev) => ({
        ...prev,
        overallScore: 0 // Reset for the newly active stage
      }));
      triggerToast(`Vocal Coach advanced to ${detectedStage === "stage1" ? "Stage 1" : detectedStage === "stage2" ? "Stage 2" : detectedStage === "stage3" ? "Stage 3" : detectedStage === "stage4" ? "Stage 4" : "Stage 5"}`);
    }

    // Check completion cues
    if (
      lowerText.includes("completed all five stages") ||
      lowerText.includes("completed all 5 stages") ||
      lowerText.includes("all five stages of our study journey")
    ) {
      setTimeout(() => {
        handleAdvanceToScorecard(true);
      }, 1500);
    }
  };

  const isRightSlatePopulatedRef = useRef<boolean>(isRightSlatePopulated);
  useEffect(() => {
    isRightSlatePopulatedRef.current = isRightSlatePopulated;
  }, [isRightSlatePopulated]);
  const lastLiveUserTranscriptRef = useRef<string>("");
  const liveSlateSyncInFlightRef = useRef<boolean>(false);

  const applySlateUpdatePayload = (slate: {
    topicTitle?: string;
    topicOverview?: string;
    topicImportance?: string;
    exegesisDemo?: string;
    primaryReference?: string;
    primaryText?: string;
    egwCommentary?: string;
    foundationalScriptures?: Array<{ reference: string; role: string; stageInsight: string }>;
  }) => {
    if (!slate) return;
    const primaryRef = (slate.primaryReference || slate.foundationalScriptures?.[0]?.reference || "").trim();
    if (primaryRef) {
      setActiveScripture((prev) =>
        prev.reference === primaryRef
          ? prev
          : {
              ...prev,
              id: `teach-topic-${primaryRef.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
              reference: primaryRef,
              text: (slate.primaryText || "").trim()
            }
      );
    }
    setHasTopicBeenChosen(true);
    setIsRightSlatePopulated(true);
    isRightSlatePopulatedRef.current = true;
    setActiveSlateTab("all");
    if (slate.topicTitle) setActiveTopicTitle(slate.topicTitle);
    if (slate.topicOverview) setActiveTopicOverview(slate.topicOverview);
    if (slate.topicImportance) setActiveTopicImportance(slate.topicImportance);
    if (slate.exegesisDemo) setActiveExegesisDemo(slate.exegesisDemo);
    if (slate.egwCommentary) setActiveEgwCommentary(slate.egwCommentary);
    if (Array.isArray(slate.foundationalScriptures) && slate.foundationalScriptures.length > 0) {
      setCustomFoundationalScriptures(slate.foundationalScriptures);
    }
    try {
      const topicToSave = slate.topicTitle || activeTopicTitle || scripture.reference;
      const refToSave = slate.foundationalScriptures?.[0]?.reference || scripture.reference;
      ElderStephenMemoryEngine.saveTeachItSessionTopic(topicToSave, refToSave);
    } catch (memErr) {
      console.warn("Teach It topic memory save warning:", memErr);
    }
  };

  const syncLiveSlateFromTopic = async (userTopicText: string) => {
    if (!userTopicText.trim() || liveSlateSyncInFlightRef.current) return;
    liveSlateSyncInFlightRef.current = true;
    try {
      const topicPreset = resolveTopicSelectionPreset(userTopicText);
      if (topicPreset) {
        setActiveScripture(topicPreset.scripture);
        applySlateUpdatePayload({
          topicTitle: topicPreset.topicTitle,
          topicOverview: topicPreset.topicOverview,
          topicImportance: topicPreset.topicImportance,
          exegesisDemo: topicPreset.exegesisDemo,
          foundationalScriptures: topicPreset.foundationalScriptures
        });
        return;
      }

      const res = await apiFetch("/api/teach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scripture,
          messages: [{ sender: "user", text: userTopicText }],
          stage: "stage1",
          userRole,
          isEvangelist,
          userName: resolveUserName(),
          isTopicSelected: true
        })
      });
      if (res.ok) {
        const data = await safeParseResponseJson<any>(res);
        if (data && (data.topicOverview || data.topicImportance || data.foundationalScriptures?.length)) {
          applySlateUpdatePayload({
            topicTitle: data.topicTitle || userTopicText.slice(0, 60),
            topicOverview: data.topicOverview,
            topicImportance: data.topicImportance,
            exegesisDemo: data.exegesisDemo,
            foundationalScriptures: data.foundationalScriptures
          });
        }
      }
    } catch (syncErr) {
      console.warn("Live right-slate fallback sync warning:", syncErr);
    } finally {
      liveSlateSyncInFlightRef.current = false;
    }
  };

  const appendLiveReplyChunk = (chunk: string) => {
    if (!chunk) return;
    if (currentLiveReplyTextRef.current.length > 0) {
      const lastChar = currentLiveReplyTextRef.current.slice(-1);
      const firstChar = chunk.charAt(0);
      if (!/\s/.test(lastChar) && !/[\s.,;:!?')\]]/.test(firstChar)) {
        currentLiveReplyTextRef.current += " ";
      }
    }
    currentLiveReplyTextRef.current += chunk;
    const currentId = currentLiveReplyIdRef.current;
    
    // Parse stage and score dynamically from response chunks to sync scorecard and UI
    syncLiveSessionProgress(currentLiveReplyTextRef.current);
    
    setChatMessages((prev) => {
      if (currentId && prev.some((m) => m.id === currentId)) {
        return prev.map((m) => {
          if (m.id === currentId) {
            return { ...m, text: currentLiveReplyTextRef.current };
          }
          return m;
        });
      } else {
        const id = `live-ai-${Date.now()}`;
        currentLiveReplyIdRef.current = id;
        return [
          ...prev,
          {
            id,
            sender: "ai",
            text: currentLiveReplyTextRef.current,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const endLiveReplyAccumulation = () => {
    currentLiveReplyTextRef.current = "";
    currentLiveReplyIdRef.current = null;
  };

  const playPCMChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const floatSamples = decodeAndCleanGeminiPcm(base64Audio, {
        sampleRate: 24000,
        isStreamingChunk: true
      });
      if (floatSamples.length === 0) return;

      const buffer = ctx.createBuffer(1, floatSamples.length, 24000);
      buffer.copyToChannel(floatSamples, 0);
      
      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(ctx.destination);
      
      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.03;
      }
      
      sourceNode.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      
      activeNodesRef.current.push(sourceNode);
      isElderSpeakingRef.current = true;
      setLiveState("playing");
      setWaveHeights((prev) => prev.map(() => Math.floor(Math.random() * 18) + 8));

      sourceNode.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter((n) => n !== sourceNode);
        if (activeNodesRef.current.length === 0 && (!outputAudioCtxRef.current || outputAudioCtxRef.current.currentTime >= nextStartTimeRef.current - 0.05)) {
          setLiveState("ready");
          setWaveHeights((prev) => prev.map(() => 6));
          setTimeout(() => {
            if (activeNodesRef.current.length === 0) {
              isElderSpeakingRef.current = false;
            }
          }, 350);
        }
      };
    } catch (err) {
      console.error("Failed to parse or play incoming live audio PCM:", err);
    }
  };

  const startGeminiLiveSession = async (sessionInitMeta?: {
    hasPriorSession?: boolean;
    lastStudiedTopic?: string;
    isContinuing?: boolean;
  }) => {
    try {
      stopVoiceResponse();
      if (liveRetryTimerRef.current) {
        clearTimeout(liveRetryTimerRef.current);
        liveRetryTimerRef.current = null;
      }
      if (wsRef.current) {
        const prevWs = wsRef.current;
        wsRef.current = null;
        prevWs.onopen = null;
        prevWs.onmessage = null;
        prevWs.onerror = null;
        prevWs.onclose = null;
        try {
          if (prevWs.readyState === WebSocket.OPEN || prevWs.readyState === WebSocket.CONNECTING) {
            prevWs.close(1000, "Replacing session");
          }
        } catch (_) {}
      }

      const sessionRunId = ++liveSessionRunIdRef.current;
      setLiveState("connecting");
      setLiveError(null);
      isElderSpeakingRef.current = false;
      initializeAudioContext();
      startMicCapture();
      
      const isHttps = window.location.protocol === "https:";
      const protocol = isHttps ? "wss:" : "ws:";
      const stateDoctrine = location.state?.doctrineId || "";
      const stateLesson = location.state?.lessonId || "";
      
      const userName = resolveUserName();
      const priorMeta = sessionInitMeta || ElderStephenMemoryEngine.getPriorTeachItSessionHistory();
      const priorTopicStr = priorMeta?.hasPriorSession ? priorMeta.lastStudiedTopic || "" : "";
      const passageRef = scripture?.reference || "2 Timothy 2:15";
      const passageBody = (scripture?.text || "").trim();
      const boundedQueryPassage = passageBody.length > 400 ? passageBody.slice(0, 400) : passageBody;
      const elderStephenSystemInstruction = [
        `You are Elder Stephen, the pastoral mentor and Teach It Studio instructor inside the "Study To Be Approved" (STBA) ecosystem.`,
        priorTopicStr
          ? `1. Welcome Back & Prior Session Recall: PRIOR SESSION HISTORY EXISTS. Output a warm, dynamic "Welcome back, ${userName}!" greeting recalling their last studied topic ("${priorTopicStr}"), and ask whether they want to continue "${priorTopicStr}" or discuss a new biblical topic or verse today.`
          : `1. Welcome by Name & Topic/Verse Inquiry: Warmly welcome the signed-in user (${userName}) by name and ask what biblical topic or scripture verse they would like to discuss today (or invite them to confirm studying ${passageRef}). Remind ${userName} that the session adapts to their pace without time limits and can be paused or resumed anytime.`,
        `2. Overview, 3-5 Foundational Scriptures & Exegesis Demonstration: Once a topic or scripture is chosen, provide a clear overview, note the 3-5 foundational scriptures displayed on their right-hand content slate, demonstrate exegesis on the primary text (${passageRef}${passageBody ? `: "${passageBody}"` : ""}) using a clear example (historical context and original Greek/Hebrew root), and conclude by asking ${userName} an engaging question to prompt discussion.`,
        `3. Comprehension-Gated Stage Transition Mechanism: Evaluate ${userName}'s understanding through their responses to your questions, assign a mastery rating percentage (0-100%), and transition to the next stage (Stage 1 Exegesis -> Stage 2 Cosmic Lens -> Stage 3 Doctrinal Connections -> Stage 4 Practical Application -> Stage 5 Evangelistic Invitation) once ${userName} demonstrates sufficient comprehension.`
      ].join("\n");
      
      const studyContext: StudyContextQueryParams = {
        mode: "teach",
        model: "gemini-3.8-live",
        persona: "Elder Stephen",
        doctrineId: stateDoctrine || undefined,
        lessonId: stateLesson || undefined,
        userName,
        reference: scripture?.reference || undefined,
        passageText: boundedQueryPassage || undefined,
        ...(priorTopicStr ? { topic: priorTopicStr, lastPassage: priorTopicStr } : {})
      };

      const localSearchParams = new URLSearchParams();
      Object.entries(studyContext).forEach(([key, val]) => {
        if (val) localSearchParams.set(key, val);
      });
      if (priorTopicStr) {
        localSearchParams.set("hasPriorSession", "true");
      }
      if (sessionInitMeta?.isContinuing || priorTopicStr) {
        localSearchParams.set("isContinuing", "true");
      }
      const queryString = localSearchParams.toString() ? `?${localSearchParams.toString()}` : "";

      const wsUrl = buildSupabaseLiveWebSocketUrl(
        studyContext,
        SUPABASE_EDGE_FUNCTION_URL || `${SUPABASE_URL}/functions/v1/gemini-live-relay`
      );
      console.log("[STBA Live Voice] VITE_SUPABASE_URL:", SUPABASE_URL, "| gemini-live-relay WS URL:", wsUrl);
      const hasCustomEdgeFunction = Boolean(wsUrl && /^wss?:\/\//i.test(wsUrl));
      const localLiveWsUrl = `${protocol}//${window.location.host}/api/teach/live${queryString}`;

      // Retrieve the user's session access token for Edge Function auth (or setup metadata on local gateway)
      let accessToken = await getUntruncatedSessionToken();
      if (!accessToken) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          accessToken = session?.access_token
            ? String(session.access_token).trim()
            : SUPABASE_PUBLISHABLE_KEY;
        } catch {
          accessToken = SUPABASE_PUBLISHABLE_KEY;
        }
      }

      if (!isMountedRef.current || sessionRunId !== liveSessionRunIdRef.current) {
        return;
      }

      const geminiLiveSessionPayload = {
        type: "setup",
        model: "models/gemini-3.8-live",
        persona: "Elder Stephen",
        reference: passageRef,
        passageText: passageBody,
        accessToken: accessToken || undefined,
        systemInstruction: elderStephenSystemInstruction,
        setup: {
          model: "models/gemini-3.8-live",
          systemInstruction: {
            role: "system",
            parts: [{ text: elderStephenSystemInstruction }]
          },
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Charon"
                }
              }
            }
          }
        },
        config: {
          model: "gemini-3.8-live",
          responseModalities: ["AUDIO"],
          systemInstruction: elderStephenSystemInstruction
        }
      };

      const openTeachLiveSocket = (targetUrl: string, allowLocalFallback: boolean, retryAttempt: number = 0) => {
        if (!isMountedRef.current || sessionRunId !== liveSessionRunIdRef.current) {
          return;
        }
        const isSameOriginLocal = targetUrl === localLiveWsUrl;
        let isDisposed = false;

        console.log("[STBA Live Voice Debug] Establishing link:", targetUrl);
        const ws = !isSameOriginLocal && accessToken
          ? new WebSocket(targetUrl, [accessToken])
          : new WebSocket(targetUrl);
        wsRef.current = ws;
        let hasOpened = false;
        let errorHandled = false;

        const disposeSocketHandlers = () => {
          isDisposed = true;
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
        };

        const handleSocketFailure = (errEvent?: any) => {
          if (errorHandled || isDisposed || !isMountedRef.current || sessionRunId !== liveSessionRunIdRef.current) {
            return;
          }
          errorHandled = true;
          disposeSocketHandlers();
          if (wsRef.current === ws) {
            wsRef.current = null;
          }
          try {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
              ws.close();
            }
          } catch (_) {}

          if (!hasOpened && allowLocalFallback && targetUrl !== localLiveWsUrl) {
            openTeachLiveSocket(localLiveWsUrl, false, 0);
            return;
          }

          if (!hasOpened && isSameOriginLocal && retryAttempt < 1) {
            liveRetryTimerRef.current = setTimeout(() => {
              liveRetryTimerRef.current = null;
              if (isMountedRef.current && sessionRunId === liveSessionRunIdRef.current) {
                openTeachLiveSocket(localLiveWsUrl, false, retryAttempt + 1);
              }
            }, 350);
            return;
          }

          console.error("Live Voice Socket generic error:", errEvent);
          setLiveError("Trouble connecting to live voice stream. Check microphone or use text/voice input below.");
          setLiveState("error");
        };

        ws.onopen = () => {
          if (isDisposed || !isMountedRef.current || sessionRunId !== liveSessionRunIdRef.current) {
            disposeSocketHandlers();
            try { ws.close(); } catch (_) {}
            return;
          }
          hasOpened = true;
          console.log("[STBA Live Voice Debug] Handshake completed successfully!");
          try {
            ws.send(JSON.stringify(geminiLiveSessionPayload));
          } catch (setupErr) {
            console.warn("[STBA Live Voice Debug] Failed to send initial session setup payload:", setupErr);
          }
        };

        ws.onmessage = (event) => {
          if (isDisposed || !isMountedRef.current || sessionRunId !== liveSessionRunIdRef.current) return;
          try {
            const msg = JSON.parse(event.data);
            
            if (msg.heartbeat || msg.setupAck) {
              return;
            }

            // Populate the right-hand "Understanding of the Topic" block as soon as Elder Stephen sends it
            if (msg.slateUpdate) {
              console.log("[STBA Live Voice Debug] slateUpdate received:", msg.slateUpdate);
              applySlateUpdatePayload(msg.slateUpdate);
            }

            if (msg.error) {
              console.warn("[STBA Live Voice Debug] Server message failure:", msg.error);
              if (!isSameOriginLocal && allowLocalFallback) {
                disposeSocketHandlers();
                try { ws.close(); } catch (_) {}
                openTeachLiveSocket(localLiveWsUrl, false, 0);
                return;
              }
              setLiveError(msg.error);
              setLiveState("error");
              triggerToast(msg.error);
              disposeSocketHandlers();
              try { ws.close(); } catch (_) {}
              return;
            }

            if (msg.ready) {
              if (msg.model) setLiveModelName(msg.model);
              console.log("[STBA Live Voice Debug] Live engine linked up!", msg.model || "gemini-3.8-live");
              setLiveState("ready");
              setLiveWebSocketActive(true);
              stopVoiceResponse();
              triggerToast("Gemini Live (gemini-3.8-live) real-time session active!");
              
              // Unmute/resume AudioContext and active microphone input
              initializeAudioContext();
              startMicCapture();
              return;
            }

            if (msg.userTranscript) {
              const spoken = msg.userTranscript.trim();
              if (spoken) {
                lastLiveUserTranscriptRef.current = `${lastLiveUserTranscriptRef.current} ${spoken}`.trim().slice(-400);
                endLiveReplyAccumulation();
                setChatMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.sender === "user" && (Date.now() - new Date(last.timestamp).getTime() < 5000)) {
                    const combined = last.text.endsWith(" ") || spoken.startsWith(" ")
                      ? `${last.text}${spoken}`
                      : `${last.text} ${spoken}`;
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                      ...last,
                      text: combined.trim(),
                      timestamp: new Date()
                    };
                    return copy;
                  }
                  return [
                    ...prev,
                    {
                      id: `live-user-${Date.now()}`,
                      sender: "user",
                      text: spoken,
                      timestamp: new Date()
                    }
                  ];
                });
              }
            }

            if (msg.audio) {
              setLiveState("playing");
              playPCMChunk(msg.audio);
              // Elder Stephen has begun explaining the user's chosen topic — make sure the right block appears now
              if (!isRightSlatePopulatedRef.current && lastLiveUserTranscriptRef.current.trim().length > 2) {
                syncLiveSlateFromTopic(lastLiveUserTranscriptRef.current);
              }
            }

            if (msg.text) {
              setLiveState("playing");
              appendLiveReplyChunk(msg.text);
            }

            if (msg.turnComplete) {
              endLiveReplyAccumulation();
              if (activeNodesRef.current.length === 0) {
                setLiveState("ready");
                isElderSpeakingRef.current = false;
              }
              if (!isRightSlatePopulatedRef.current && lastLiveUserTranscriptRef.current.trim().length > 2) {
                syncLiveSlateFromTopic(lastLiveUserTranscriptRef.current);
              }
            }

            if (msg.stageAdvance) {
              console.log("[STBA Live Voice Debug] stageAdvance received:", msg.stageAdvance);
              const evaluatedIdx = (msg.stageAdvance.evaluatedStage || 1) - 1;
              const score = msg.stageAdvance.score || 90;
              triggerAutoAdvanceToNextStage(evaluatedIdx, score, {
                stageFeedback: msg.stageAdvance.feedback
              });
            }

            if (msg.interrupted) {
              console.log("[STBA Live Voice Debug] Interrupt requested.");
              clearPlaybackQueue();
              endLiveReplyAccumulation();
              isElderSpeakingRef.current = false;
              setLiveState("ready");
            }
            
            if (msg.closed) {
              console.log("[STBA Live Voice Debug] Connection completed.");
              cleanupLiveAudioAndWS();
            }

          } catch (err) {
            console.error("Live translation extract exception:", err);
          }
        };

        ws.onerror = (e) => {
          handleSocketFailure(e);
        };

        ws.onclose = (ev) => {
          if (isDisposed || !isMountedRef.current || sessionRunId !== liveSessionRunIdRef.current) {
            return;
          }
          if (!hasOpened && !errorHandled) {
            handleSocketFailure(ev);
            return;
          }
          console.log("Live Voice Socket closed.");
          cleanupLiveAudioAndWS();
        };
      };

      if (SUPABASE_EDGE_FUNCTION_URL && hasCustomEdgeFunction && wsUrl) {
        openTeachLiveSocket(wsUrl, true, 0);
      } else {
        openTeachLiveSocket(localLiveWsUrl, false, 0);
      }
    } catch (err: any) {
      console.error("Connection establish aborted:", err);
      setLiveError(err.message || "Unspecified connection exception");
      setLiveState("error");
    }
  };

  const initializeAudioContext = () => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      } catch {
        inputAudioCtxRef.current = new AudioCtx();
      }
    }
    if (inputAudioCtxRef.current.state === "suspended") {
      inputAudioCtxRef.current.resume().catch(() => {});
    }
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (outputAudioCtxRef.current.state === "suspended") {
      outputAudioCtxRef.current.resume().catch(() => {});
    }
    nextStartTimeRef.current = 0;
  };

  const startMicCapture = async () => {
    try {
      initializeAudioContext();
      if (micStreamRef.current && micStreamRef.current.active && processorRef.current) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
      const processor = inputAudioCtxRef.current!.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtxRef.current!.destination);

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isMicMutedRef.current) return;

        // Self-healing watchdog: unlock isElderSpeakingRef once scheduled audio playback has completed
        if (
          isElderSpeakingRef.current &&
          activeNodesRef.current.length === 0 &&
          (!outputAudioCtxRef.current ||
            outputAudioCtxRef.current.currentTime >= nextStartTimeRef.current - 0.05)
        ) {
          isElderSpeakingRef.current = false;
        }
        
        const floatSamples = e.inputBuffer.getChannelData(0);
        const actualSampleRate = e.inputBuffer.sampleRate || inputAudioCtxRef.current?.sampleRate || 16000;
        
        let sum = 0;
        for (let i = 0; i < floatSamples.length; i++) {
          sum += floatSamples[i] * floatSamples[i];
        }
        const rms = Math.sqrt(sum / floatSamples.length);

        const isUserBargingIn = rms > 0.085;
        const shouldSuppressEcho = isElderSpeakingRef.current && !isUserBargingIn;
        
        if (!shouldSuppressEcho) {
          if (rms > 0.015) {
            if (liveStateRef.current !== "playing") {
              setLiveState("recording");
            }
            setWaveHeights((prev) => prev.map(() => Math.max(6, Math.floor(rms * 150))));
          } else {
            if (liveStateRef.current === "recording") {
              setLiveState("ready");
            }
            setWaveHeights((prev) => prev.map(() => Math.max(6, Math.floor(Math.random() * 4) + 4)));
          }
        }

        const samplesToSend = shouldSuppressEcho
          ? new Float32Array(floatSamples.length)
          : floatSamples;
        const base64 = encodeFloat32To16kHzPcmBase64(samplesToSend, actualSampleRate);
        
        wsRef.current.send(
          JSON.stringify({
            audio: base64,
            mimeType: "audio/pcm;rate=16000"
          })
        );
      };

    } catch (err: any) {
      console.error("Microphone grab aborted:", err);
      setLiveError("Microphone permission denied or unavailable. You can still interact with the Gemini Live session using text below.");
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Speaks prompt aloud using browser speech synthesis ONLY when Gemini Live voice stream is not active
  const triggerVoiceResponse = (text: string) => {
    if (useLiveVoiceAPI && (liveWebSocketActive || liveStateRef.current === "connecting" || liveStateRef.current === "playing" || liveStateRef.current === "ready")) {
      return; // Gemini Live (gemini-3.8-live) handles real-time spoken voice directly
    }
    if (isAudioPrompterEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      // Clean up markdown markers for a pure reading cadence matching CSMS Guide
      const parsedText = text
        .replace(/\*\*|###|##|\*/g, "")
        .replace(/[\[\]]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(parsedText);
      utterance.rate = 0.92; // Consistent pacing with CSMS (0.92)
      utterance.pitch = 0.85; // Warmer elder voice tuning (0.85)

      const bestVoice = getElderStephenVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopVoiceResponse = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Manage steps
  const stagesList = [
    {
      id: "stage1" as PhaseType,
      number: 1,
      title: "Exegesis & Context",
      subtitle: "Authorial intent & linguistic setting",
      icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      prompt: "Welcome! What text would you like us to discuss?"
    },
    {
      id: "stage2" as PhaseType,
      number: 2,
      title: "Cosmic Lens",
      subtitle: "The Great Controversy & spiritual warfare",
      icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
      prompt: isFromBelief1 ? `Excellent! Let us move to Stage 2: The Cosmic Lens & The Great Controversy. 

The Great Controversy Lens views scriptures through the conflict between Christ and Satan. 

How is "rightly dividing" the Word of God essential in guarding against the deceptive floodwaters of compromise regarding the authority of the Holy Scriptures?` : `Stage 2: The Cosmic Lens & The Great Controversy. 

The Great Controversy Lens views scriptures through the grand perspective of the cosmic conflict between Christ and Satan over the character of God's love and law. Why is this important? Because it unveils the underlying spiritual warfare behind theological errors and exposes the adversary's efforts to counterfeit or obscure divine truth, keeping us spiritually vigilant.

Let us explore: How does this passage fit into the cosmic conflict? How is "rightly dividing truth" essential to guarding against theological compromises and spiritual deceptions?`
    },
    {
      id: "stage3" as PhaseType,
      number: 3,
      title: "Doctrinal Connections",
      subtitle: "Adventist pillars & fundamental beliefs",
      icon: <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />,
      prompt: isFromBelief1 ? `Stage 3: Doctrinal Implication & Fundamental Beliefs.

Let us link our findings back to the foundational pillars of our faith, specifically Seventh-day Adventist Fundamental Belief 1: The Holy Scriptures. 

How does this text establish the Bible as the supreme, authoritative, and infallible revelation of God's will, the standard of character, the test of experience, the definitive revealer of doctrines, and the trustworthy record of God's acts in history?` : `Stage 3: Doctrinal Implication & Fundamental Beliefs.

Doctrinal Connections systematically link our exegetical findings to the foundational pillars of our faith, specifically Seventh-day Adventist Fundamental Beliefs. Why is this important? Because it builds a cohesive, unified system of theology (line upon line, precept upon precept) so that we stay grounded as one body and are not shaken by temporary or deceptive teachings.

Let us explore: Connect this passage to Seventh-day Adventist Fundamental Beliefs (such as Fundamental Belief #1: Holy Scriptures). How does understanding this text shape our theological foundations?`
    },
    {
      id: "stage4" as PhaseType,
      number: 4,
      title: "Practical Application",
      subtitle: "Sanctification & daily lifestyle reform",
      icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
      prompt: isFromBelief1 ? `Stage 4: Practical Life-Reforming Application.

Scripture study is not just an academic task; it is meant to sanctify us.

How does the dual promise of 2 Timothy 3:16 (being profitable for doctrine, reproof, correction, and instruction) practically reform your daily habits, mindset, and routine tomorrow morning? Share concrete action steps.` : `Stage 4: Practical Life-Reforming Application.

Practical Application brings the intellectual and doctrinal content down to our individual daily walking experience. Why is this important? Because scripture study is not an academic game; it is meant to sanctify the soul, reforming our actual behavior, habits, and daily schedules so we live an active testament of Christ's character.

Let us explore: How does this scripture reform your personal life, habits, mindset, or schedule tomorrow morning? Share concrete, direct real-life action steps.`
    },
    {
      id: "stage5" as PhaseType,
      number: 5,
      title: "Evangelistic Invitation",
      subtitle: "Warm, winsome appeal to seekers",
      icon: <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      prompt: isFromBelief1 ? `Stage 5: Graceful Evangelistic Invitation.

As disciples, we are called to teach others what we have learned.

How would you winsomely, gently, and respectfully explain the authority and beauty of the Holy Scriptures to a friend or neighbor who is skeptical or unfamiliar with the Bible? Frame a warm, Christ-centered appeal.` : `Stage 5: Graceful Evangelistic Invitation.

The Evangelistic Invitation prepares us to effectively and winsomely share our study discoveries with others. Why is this important? Because disciples are called to teach others. Presenting deep truths with gentleness, winsomeness, and respect vindicates God's beautiful character of love and successfully draws seekers to Jesus.

Let us explore: How would you explain this truth gently and respectfully to a seeker, neighbor, or friend who doesn't share our faith background? Frame a warm, winsome appeal.`
    }
  ];

  const getCurrentStageIndex = (): number => {
    if (phase === "stage1") return 0;
    if (phase === "stage2") return 1;
    if (phase === "stage3") return 2;
    if (phase === "stage4") return 3;
    if (phase === "stage5") return 4;
    return -1;
  };

  const activeStageIndex = getCurrentStageIndex();
  const activeStage = activeStageIndex !== -1 ? stagesList[activeStageIndex] : null;
  const completedStagesCount = stagesList.filter(
    (st) => (scoreStats.stageScores[st.id] || 0) > 0
  ).length;

  // Cleanup synthesis and timers
  useEffect(() => {
    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript || interimTranscript) {
          setUserInput((prev) => {
            const base = prev.trim();
            const addition = (finalTranscript || interimTranscript).trim();
            return base ? `${base} ${addition}` : addition;
          });
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      clearIntervals();
      stopVoiceResponse();
      cleanupLiveAudioAndWS();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const hasAutoStartedRef = useRef(false);

  // Auto-start Gemini Live session when navigating from "Explain Doctrine with AI"
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    const searchParams = new URLSearchParams(location.search);
    const docParam = searchParams.get("doctrine");
    const autoLiveParam = searchParams.get("autoLive") === "true";
    const stateAutoLive = location.state?.autoLive;
    const stateDoctrine = location.state?.doctrineId;

    const isAutoLiveRequested = autoLiveParam;

    if (isAutoLiveRequested) {
      setUseLiveVoiceAPI(true);
    }
  }, [location.search, location.state]);

  const clearIntervals = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
  };

  // Scroll to bottom of chat if near bottom or last message is from user, enabling independent scrolling
  useEffect(() => {
    if (chatContainerRef.current) {
      const el = chatContainerRef.current;
      const lastMsgIsUser = chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === "user";
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom || lastMsgIsUser || chatMessages.length <= 1) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [chatMessages, isLoading]);

  // Reset right instructional slate scroll to top when switching persistent tabs (top-down flow)
  useEffect(() => {
    if (rightSlateScrollRef.current) {
      rightSlateScrollRef.current.scrollTop = 0;
    }
  }, [activeSlateTab]);

  // Self-paced session loop (no time limit — adapts to user's pace with pause/resume support)
  useEffect(() => {
    if (!isTimerActive || phase === "intro" || phase === "feedback" || isPaused) {
      clearIntervals();
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => prev + 1);
    }, 1000);

    waveIntervalRef.current = setInterval(() => {
      setWaveHeights(
        Array.from({ length: 16 }, () => {
          if (isRecording) {
            return Math.floor(Math.random() * 32) + 12;
          }
          if (isLoading) {
            return Math.floor(Math.random() * 16) + 4;
          }
          return Math.floor(Math.random() * 4) + 4;
        })
      );
    }, 100);

    return () => clearIntervals();
  }, [isTimerActive, phase, isPaused, isRecording, isLoading]);

  const handleTogglePauseSession = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      isMicMutedRef.current = true;
      if (outputAudioCtxRef.current && outputAudioCtxRef.current.state === "running") {
        outputAudioCtxRef.current.suspend().catch(() => {});
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      triggerToast("AI Session Paused. Take all the time you need—click Resume when ready.");
    } else {
      isMicMutedRef.current = isMicMuted;
      if (outputAudioCtxRef.current && outputAudioCtxRef.current.state === "suspended") {
        outputAudioCtxRef.current.resume().catch(() => {});
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
      triggerToast("AI Session Resumed at your pace.");
    }
  };

  // Toggle voice recognition
  const handleToggleRecording = () => {
    if (useLiveVoiceAPI) {
      if (liveWebSocketActive) {
        cleanupLiveAudioAndWS();
        setIsRecording(false);
        triggerToast("Live Voice Session deactivated.");
      } else {
        startGeminiLiveSession();
        setIsRecording(true);
      }
      return;
    }

    if (!recognitionRef.current) {
      triggerToast("Speech recognition is not supported or blocked in this browser layout.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      triggerToast("Speech recording completed.");
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        triggerToast("Listening with Voice-to-Text active...");
      } catch (e) {
        console.error("Speech Recognition failed to start:", e);
        triggerToast("Unable to access microphone. Please type instead.");
      }
    }
  };

  // Topic & Scripture presets for instant right-slate overview, worked exegesis example, and 3-5 foundational scriptures
  const resolveTopicSelectionPreset = (input: string) => {
    const lower = input.toLowerCase();
    if (lower.includes("sabbath") || lower.includes("exodus 20")) {
      return {
        scripture: {
          id: "exod-20-8-11",
          reference: "Exodus 20:8-11",
          text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God.",
          keywords: ["remember", "sabbath", "holy", "seventh", "blessed", "hallowed"]
        },
        topicTitle: "The Seventh-day Sabbath — Memorial of Creation & Redemption",
        topicOverview:
          "The seventh-day Sabbath (Exodus 20:8-11) stands as God's eternal sign of creation, sanctification, and covenant rest—instituted in Eden, enshrined in the heart of the Decalogue, affirmed by Christ, and proclaimed in the Three Angels' Messages.",
        exegesisDemo:
          "Worked Exegesis Example (Exodus 20:8-11): The fourth commandment opens with the Hebrew imperative 'zakor' ('Remember'), pointing back to Creation week in Genesis 2:1-3 where God rested ('shabath'), blessed, and sanctified the seventh day long before Sinai."
      };
    }
    if (lower.includes("sanctuary") || lower.includes("daniel 8")) {
      return {
        scripture: {
          id: "dan-8-14",
          reference: "Daniel 8:14",
          text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
          keywords: ["sanctuary", "cleansed", "two thousand", "three hundred", "judgment", "high priest"]
        },
        topicTitle: "The Heavenly Sanctuary & Pre-Advent Judgment",
        topicOverview:
          "The sanctuary doctrine (Daniel 8:14; Hebrews 8:1-2) unveils God's complete plan of redemption—tracing Christ's once-for-all sacrifice on Calvary to His two-phase high-priestly ministry in the heavenly sanctuary culminating in the investigative judgment.",
        exegesisDemo:
          "Worked Exegesis Example (Daniel 8:14): The Hebrew term 'tsadaq' (translated 'cleansed') signifies 'to be vindicated, restored, or made right,' linking the 2300 prophetic days (year-day principle of Ezekiel 4:6) to the antitypical Day of Atonement in the heavenly sanctuary."
      };
    }
    if (lower.includes("three angels") || lower.includes("revelation 14")) {
      return {
        scripture: {
          id: "rev-14-12",
          reference: "Revelation 14:12",
          text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
          keywords: ["patience", "saints", "commandments", "faith of jesus", "everlasting gospel", "worship"]
        },
        topicTitle: "The Three Angels' Messages — Everlasting Gospel & Remnant Call",
        topicOverview:
          "Revelation 14:6-12 presents heaven's final, Christ-centered appeal to the world—proclaiming the everlasting gospel in the hour of God's judgment, calling humanity back to worship the Creator, and identifying a remnant who keep God's commandments and the faith of Jesus.",
        exegesisDemo:
          "Worked Exegesis Example (Revelation 14:12): In the Greek text, 'hupomone' ('patience' or 'steadfast endurance') describes active, Spirit-sustained loyalty that unites law ('commandments of God') and grace ('the faith of Jesus') in harmonious covenant obedience."
      };
    }
    if (lower.includes("prophecy") || lower.includes("emmaus") || lower.includes("luke 24")) {
      return {
        scripture: {
          id: "luke-24-27",
          reference: "Luke 24:27",
          text: "And beginning at Moses and all the prophets, he expounded unto them in all the scriptures the things concerning himself.",
          keywords: ["moses", "prophets", "expounded", "scriptures", "himself", "christ"]
        },
        topicTitle: "Interpreting Prophetic Writings — Christ in All the Scriptures",
        topicOverview:
          "On the road to Emmaus (Luke 24:27), the risen Christ established the master key of prophetic interpretation: reading every Old Testament type, symbol, and prophecy in its broader canonical harmony with Jesus and His redemptive mission at the center.",
        exegesisDemo:
          "Worked Exegesis Example (Luke 24:27): Luke uses the Greek verb 'diermeneuo' ('expounded' or 'interpreted thoroughly'—the root of our word 'hermeneutics'), showing that Christ systematically compared Moses and all the Prophets to dispel the disciples' narrow political expectations."
      };
    }
    return null;
  };

  // Starting the dialogue session - welcomes signed-in user by name & keeps right panel blank until initial breakdown
  const handleBeginSession = () => {
    try {
      localStorage.removeItem(TEACH_IT_SESSION_STORAGE_KEY);
    } catch {}
    setIsTimerActive(true);
    setSecondsRemaining(0);
    setChatMessages([]);
    setIsPaused(false);
    setHasTopicBeenChosen(false);
    setIsRightSlatePopulated(false);
    setActiveTopicTitle("");
    setActiveTopicOverview("");
    setActiveTopicImportance("");
    setActiveExegesisDemo("");
    setCustomFoundationalScriptures([]);
    setPhase("stage1");
    evaluatedStagesLiveRef.current.clear();

    setScoreStats({
      overallScore: 0,
      stageScores: {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0,
        stage5: 0
      },
      foundKeywords: [],
      gaps: scripture.keywords || [],
      stageFeedback: {
        stage1: "Awaiting your exegesis...",
        stage2: "Awaiting controversy insights...",
        stage3: "Awaiting doctrinal links...",
        stage4: "Awaiting action points...",
        stage5: "Awaiting appeal presentation..."
      },
      ellenWhiteQuote: "The Bible is its own expositor. Scripture is to be compared with scripture.",
      devotionalPrompt: "What is God asking you to trust, release, or do today?"
    });

    const userName = resolveUserName();
    // "Start Session" is always a fresh session: simple greeting by name, then wait for the user's topic
    const priorHistory = { hasPriorSession: false, lastStudiedTopic: "" };
    const simpleGreeting = `Welcome, ${userName}. What topic or verse would you like us to discuss today?`;

    const deliverInitGreeting = (replyText: string) => {
      setChatMessages((prev) =>
        prev.length === 0
          ? [
              {
                id: `ai-init-${Date.now()}`,
                sender: "ai",
                text: replyText,
                timestamp: new Date()
              }
            ]
          : prev
      );
      triggerVoiceResponse(replyText);
    };

    if (useLiveVoiceAPI) {
      // Gemini Live speaks the greeting itself; its transcript becomes the first bubble
      startGeminiLiveSession({ hasPriorSession: false, lastStudiedTopic: "", isContinuing: false });
      setIsRecording(true);
      setTimeout(() => {
        const wsAlive = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
        const liveActive = liveStateRef.current === "playing" || liveStateRef.current === "ready";
        if (!wsAlive && !liveActive) {
          deliverInitGreeting(simpleGreeting);
        }
      }, 2500);
    } else {
      deliverInitGreeting(simpleGreeting);
    }

    triggerToast(
      priorHistory.hasPriorSession && priorHistory.lastStudiedTopic
        ? `Welcome back, ${userName}! Recalling "${priorHistory.lastStudiedTopic}".`
        : `Welcome, ${userName}! Live Study Session initialized.`
    );
  };

  // Resume an incomplete Teach It Studio session from the intro screen with a real user gesture
  const handleContinueSession = () => {
    if (!savedSessionSnapshot) {
      handleBeginSession();
      return;
    }
    const restoredTopic =
      savedSessionSnapshot.activeTopicTitle ||
      savedSessionSnapshot.activeScripture?.reference ||
      "2 Timothy 2:15";
    const userName = resolveUserName();

    if (savedSessionSnapshot.activeScripture) {
      setActiveScripture(savedSessionSnapshot.activeScripture);
    }
    setHasTopicBeenChosen(Boolean(savedSessionSnapshot.hasTopicBeenChosen));
    setIsRightSlatePopulated(Boolean(savedSessionSnapshot.isRightSlatePopulated));
    setActiveTopicTitle(savedSessionSnapshot.activeTopicTitle || "");
    setActiveTopicOverview(savedSessionSnapshot.activeTopicOverview || "");
    setActiveTopicImportance(savedSessionSnapshot.activeTopicImportance || "");
    setActiveExegesisDemo(savedSessionSnapshot.activeExegesisDemo || "");
    setCustomFoundationalScriptures(savedSessionSnapshot.customFoundationalScriptures || []);
    if (savedSessionSnapshot.scoreStats) {
      setScoreStats(savedSessionSnapshot.scoreStats);
    }
    if (typeof savedSessionSnapshot.secondsRemaining === "number") {
      setSecondsRemaining(savedSessionSnapshot.secondsRemaining);
    }
    setIsTimerActive(true);
    setIsPaused(false);
    setPhase(savedSessionSnapshot.phase || "stage1");

    // Restore only the prior conversation history — no static bubble above Elder Stephen's live speech
    setChatMessages((prev) =>
      prev.length > 0
        ? prev
        : Array.isArray(savedSessionSnapshot.chatMessages)
        ? savedSessionSnapshot.chatMessages.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
          }))
        : []
    );

    const continuationText = `Welcome back, **${userName}**! Let's continue right where we left off on **${restoredTopic}**. Whenever you're ready, share your next thought to keep progressing.`;

    if (useLiveVoiceAPI) {
      startGeminiLiveSession({
        hasPriorSession: true,
        lastStudiedTopic: restoredTopic,
        isContinuing: true
      });
      setIsRecording(true);
      setTimeout(() => {
        const wsAlive = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
        const liveActive = liveStateRef.current === "playing" || liveStateRef.current === "ready";
        if (!wsAlive && !liveActive) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `ai-resume-${Date.now()}`,
              sender: "ai" as const,
              text: continuationText,
              timestamp: new Date()
            }
          ]);
          triggerVoiceResponse(continuationText);
        }
      }, 2500);
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-resume-${Date.now()}`,
          sender: "ai" as const,
          text: continuationText,
          timestamp: new Date()
        }
      ]);
      triggerVoiceResponse(continuationText);
    }

    triggerToast(`Continuing your session on "${restoredTopic}".`);
  };

  // Comprehension-gated stage transition: evaluates response, assigns mastery rating %, and transitions when ready
  const triggerAutoAdvanceToNextStage = (
    currentIdx: number,
    numericScore: number,
    additionalData?: {
      foundKeywords?: string[];
      stageFeedback?: string;
      ellenWhiteQuote?: string;
      devotionalPrompt?: string;
      skipSyntheticPrompt?: boolean;
      shouldAdvance?: boolean;
    }
  ) => {
    const currentPhase = stagesList[currentIdx]?.id;
    if (!currentPhase) return;

    const shouldMoveToNext =
      additionalData?.shouldAdvance !== undefined
        ? additionalData.shouldAdvance
        : numericScore >= 70;

    setScoreStats((prev) => {
      const nextStageScores = { ...prev.stageScores };
      if (numericScore > 0) {
        nextStageScores[currentPhase] = numericScore;
      }

      const completedKeys = Object.keys(nextStageScores).filter((k) => nextStageScores[k] > 0);
      const avgScore =
        completedKeys.length > 0
          ? Math.round(completedKeys.reduce((acc, k) => acc + nextStageScores[k], 0) / completedKeys.length)
          : numericScore;

      const nextFoundKeywords = [...prev.foundKeywords];
      if (additionalData?.foundKeywords && Array.isArray(additionalData.foundKeywords)) {
        additionalData.foundKeywords.forEach((kw) => {
          if (!nextFoundKeywords.includes(kw)) nextFoundKeywords.push(kw);
        });
      }
      const nextGaps = scripture.keywords.filter((kw) => !nextFoundKeywords.includes(kw));

      const nextFeedback = { ...prev.stageFeedback };
      if (additionalData?.stageFeedback) {
        nextFeedback[currentPhase] = additionalData.stageFeedback;
      }

      return {
        ...prev,
        overallScore: avgScore,
        stageScores: nextStageScores,
        foundKeywords: nextFoundKeywords,
        gaps: nextGaps,
        stageFeedback: nextFeedback,
        ellenWhiteQuote: additionalData?.ellenWhiteQuote || prev.ellenWhiteQuote,
        devotionalPrompt: additionalData?.devotionalPrompt || prev.devotionalPrompt
      };
    });

    if (!shouldMoveToNext) {
      return;
    }

    if (currentIdx < 4) {
      const nextIdx = currentIdx + 1;
      const nextStage = stagesList[nextIdx];
      setPhase(nextStage.id);

      if (!additionalData?.skipSyntheticPrompt) {
        const promptText = `**Stage ${nextStage.number}: ${nextStage.title}**\n\n${nextStage.prompt}`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `sys-next-${Date.now()}`,
            sender: "ai",
            text: promptText,
            timestamp: new Date()
          }
        ]);
        triggerVoiceResponse(
          `Mastery Rating: ${numericScore}%. Advancing to Stage ${nextStage.number}: ${nextStage.title}. ${nextStage.prompt}`
        );
      }
      triggerToast(`Stage ${currentIdx + 1} Mastery: ${numericScore}%. Transitioned to Stage ${nextStage.number}: ${nextStage.title}`);
    } else {
      triggerVoiceResponse(
        `I evaluate your final Stage 5 response at ${numericScore}%. Praise God! You have completed all five stages of our study journey.`
      );
      triggerToast(`Stage 5 Mastery: ${numericScore}%. All 5 stages completed!`);
      setTimeout(() => {
        handleAdvanceToScorecard(true);
      }, 1000);
    }
  };

  // Sending student dialogue to server
  const handleSendMessage = async (customText?: string, forceTopicSelection: boolean = false) => {
    const textToSend = (customText || userInput).trim();
    if (!textToSend) return;

    const isSelectingTopicTurn = forceTopicSelection || !hasTopicBeenChosen;
    let targetScriptureForCall = scripture;

    // 1. Check if user selected a named topic preset
    const topicPreset = resolveTopicSelectionPreset(textToSend);
    if (topicPreset) {
      targetScriptureForCall = topicPreset.scripture;
      setActiveScripture(topicPreset.scripture);
      setActiveTopicTitle(topicPreset.topicTitle);
      setActiveTopicOverview(topicPreset.topicOverview);
      setActiveExegesisDemo(topicPreset.exegesisDemo);
    } else {
      // 2. Check if user provided a scripture reference
      const refMatch = textToSend.match(/\b([1-3]?\s*[A-Za-z]+)\s+(\d+:\d+(?:[–—-]\d+)?)\b/i);
      if (refMatch) {
        const detectedRef = formatStandardReference(refMatch[0]) || refMatch[0];
        try {
          const fetchedText = await bibleService.getText(detectedRef, "KJV");
          if (fetchedText && !fetchedText.includes("Invalid scripture")) {
            const cleanWords = fetchedText
              .replace(/[^a-zA-Z0-9\s]/g, "")
              .split(/\s+/)
              .filter((w) => w.length > 4);
            const keywords = Array.from(new Set(cleanWords)).slice(0, 6);
            const updatedScripture: Scripture = {
              id: detectedRef.toLowerCase().replace(/[^a-z0-9]/g, ""),
              reference: detectedRef,
              text: fetchedText,
              keywords: keywords.length > 0 ? keywords : ["scripture", "context", "truth", "grace"]
            };
            targetScriptureForCall = updatedScripture;
            setActiveScripture(updatedScripture);
            setActiveTopicTitle(`${detectedRef} — Exegetical & Doctrinal Mastery`);
            setActiveTopicOverview(
              `In our study of ${detectedRef} ("${fetchedText}"), we examine the historical setting, original lexical roots, Great Controversy harmony, and practical discipleship application.`
            );
            setActiveExegesisDemo(
              `Worked Exegesis Example (${detectedRef}): We begin by examining the immediate literary context, identifying the original author and audience, and comparing parallel scriptures ("line upon line," Isaiah 28:9-10) so the text interprets itself without human bias.`
            );
          }
        } catch (e) {
          console.warn("Bible lookup note:", e);
        }
      }
    }

    // Append user's chat message
    const userMsgId = `usr-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    const nextMessages = [...chatMessages, newUserMsg];
    setChatMessages(nextMessages);
    setUserInput("");
    setIsLoading(true);
    stopVoiceResponse();

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (liveWebSocketActive && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ text: textToSend, currentStage: phase }));
      } catch (wsErr) {
        console.warn("WebSocket send note:", wsErr);
      }
    }

    try {
      const response = await apiFetch("/api/teach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scripture: targetScriptureForCall,
          messages: nextMessages.map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          stage: phase,
          userRole,
          isEvangelist,
          userName: resolveUserName(),
          isTopicSelection: isSelectingTopicTurn
        })
      });

      if (!response.ok) {
        throw new Error("Tutor communications offline.");
      }

      const data = await safeParseResponseJson<any>(response);
      if (!data || (data.ok === false && !data.reply)) {
        throw new Error(data?.error || "Tutor communications returned non-JSON payload.");
      }

      if (data.topicTitle) setActiveTopicTitle(data.topicTitle);
      if (data.topicOverview) setActiveTopicOverview(data.topicOverview);
      if (data.topicImportance) setActiveTopicImportance(data.topicImportance);
      if (data.exegesisDemonstration) setActiveExegesisDemo(data.exegesisDemonstration);
      if (Array.isArray(data.foundationalScriptures) && data.foundationalScriptures.length > 0) {
        setCustomFoundationalScriptures(data.foundationalScriptures.slice(0, 5));
      }

      const isTopicTurnResponse = Boolean(data.isTopicSelection) || isSelectingTopicTurn;
      if (isTopicTurnResponse) {
        setHasTopicBeenChosen(true);
      }
      setIsRightSlatePopulated(true);
      ElderStephenMemoryEngine.saveTeachItSessionTopic(
        data.topicTitle || activeTopicTitle || targetScriptureForCall.reference,
        targetScriptureForCall.reference
      );

      const numericScore = typeof data.score === "number" ? data.score : isTopicTurnResponse ? 0 : 88;
      const formattedReply = data.reply || "Wonderful insights, Noble Berean.";

      const aiMsgId = `ai-${Date.now()}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: formattedReply,
          timestamp: new Date()
        }
      ]);

      triggerVoiceResponse(formattedReply);

      const currentIdx = getCurrentStageIndex();
      if (currentIdx !== -1 && !isTopicTurnResponse) {
        triggerAutoAdvanceToNextStage(currentIdx, numericScore, {
          foundKeywords: data.foundKeywords,
          stageFeedback: data.stageFeedback,
          ellenWhiteQuote: data.ellenWhiteQuote,
          devotionalPrompt: data.devotionalPrompt,
          skipSyntheticPrompt: true,
          shouldAdvance: data.shouldAdvance !== false && numericScore >= 70
        });
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Using local theological exegesis mentor.");

      const userName = resolveUserName();
      if (isSelectingTopicTurn) {
        setHasTopicBeenChosen(true);
        setIsRightSlatePopulated(true);
        if (!activeTopicTitle) setActiveTopicTitle(`${targetScriptureForCall.reference} — Exegetical Mastery`);
        if (!activeTopicOverview) {
          setActiveTopicOverview(`In our study of ${targetScriptureForCall.reference} ("${targetScriptureForCall.text}"), we explore the author's original intent, scriptural harmony, and practical discipleship application.`);
        }
        if (!activeTopicImportance) {
          setActiveTopicImportance(`Understanding ${targetScriptureForCall.reference} is vital because it anchors our faith in Sola Scriptura, prevents pulling verses out of context, and equips us to teach truth faithfully.`);
        }
        if (!activeExegesisDemo) {
          setActiveExegesisDemo(`Worked Exegesis Example (${targetScriptureForCall.reference}): We examine the historical setting, original lexical roots, and canonical cross-references ("line upon line," Isaiah 28:9-10) to extract the text's intended meaning.`);
        }
        const introReply = `Wonderful choice, **${userName}**! I have updated your right-hand content slate with an overview of **${targetScriptureForCall.reference}** and **4 foundational scriptures**.

### Exegesis Demonstration (${targetScriptureForCall.reference})
In **${targetScriptureForCall.reference}** (*"${targetScriptureForCall.text}"*), we examine the original authorial context and lexical roots—comparing Scripture with Scripture (Isaiah 28:9–10) to extract the text's true meaning without reading our own assumptions into it.

### Stage 1 Engaging Question
Take all the time you need—our dialogue has no time limits. **In your own words, ${userName}, what is the historical context of ${targetScriptureForCall.reference}, and what key truth stands out to you in this passage?**`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-topic-${Date.now()}`,
            sender: "ai",
            text: introReply,
            timestamp: new Date()
          }
        ]);
      } else {
        const fallbackScore = 88;
        const currentIdx = getCurrentStageIndex();
        const nextStageObj = currentIdx >= 0 && currentIdx < 4 ? stagesList[currentIdx + 1] : null;
        const reply = nextStageObj
          ? `**Stage ${currentIdx + 1} Mastery Rating: ${fallbackScore}%**\n\nExcellent comprehension, **${userName}**! You connected the text's meaning with clarity and faithfulness. Let us now transition to **Stage ${nextStageObj.number}: ${nextStageObj.title}**.\n\n${nextStageObj.prompt}`
          : `**Stage 5 Mastery Rating: 92%**\n\nBeautiful, Christ-centered appeal, **${userName}**! You have demonstrated thorough comprehension across all 5 stages.`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-fallback-${Date.now()}`,
            sender: "ai",
            text: reply,
            timestamp: new Date()
          }
        ]);
        if (currentIdx !== -1) {
          triggerAutoAdvanceToNextStage(currentIdx, fallbackScore, {
            stageFeedback: `Demonstrated solid comprehension (${fallbackScore}% mastery).`,
            skipSyntheticPrompt: true,
            shouldAdvance: true
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Jump to next phase
  const handleNextStage = (nextPhase: PhaseType) => {
    stopVoiceResponse();
    setPhase(nextPhase);

    const nextIdx = nextPhase === "stage1" ? 0 : nextPhase === "stage2" ? 1 : nextPhase === "stage3" ? 2 : nextPhase === "stage4" ? 3 : 4;
    const stagePrompt = stagesList[nextIdx].prompt;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-next-${Date.now()}`,
        sender: "ai",
        text: stagePrompt,
        timestamp: new Date()
      }
    ]);

    triggerVoiceResponse(stagePrompt);
    triggerToast(`Switched active stage to Stage ${stagesList[nextIdx].number}: ${stagesList[nextIdx].title}`);
  };

  const handleAdvanceToScorecard = (keepVoice = false) => {
    if (!keepVoice) {
      stopVoiceResponse();
    }
    clearIntervals();

    showConfetti('teach', 'Hallelujah! All 5 Study Stages Mastered!');

    setScoreStats((prev) => {
      const nextScores = { ...prev.stageScores };
      const completedKeys = Object.keys(nextScores).filter((k) => nextScores[k] > 0);
      let overall = prev.overallScore;
      if (completedKeys.length > 0) {
        const sum = completedKeys.reduce((a, k) => a + nextScores[k], 0);
        overall = Math.round(sum / completedKeys.length);
      } else {
        overall = 85;
      }
      return {
        ...prev,
        stageScores: nextScores,
        overallScore: overall
      };
    });

    try {
      localStorage.removeItem(TEACH_IT_SESSION_STORAGE_KEY);
    } catch {}
    setPhase("feedback");
    triggerToast("🎉 Congratulations! Exegesis Mastery Session Completed!");
  };

  const handleSimulateWisdomInput = () => {
    const rawSim = SIMULATED_EXPOSITIONS[phase];
    if (rawSim) {
      setUserInput(rawSim);
      triggerToast("Preloaded active theological analysis.");
    }
  };

  const handleSaveToSpiritualJournal = () => {
    setHasSavedReflection(true);
    localStorage.setItem(`stba_devotional_${scripture.id}`, devotionalReflection);
    triggerToast("Your heartfelt study devotion has been added to your Memory Vault!");
  };

  const handleOpenVerseModal = (ref: string) => {
    const normalized = String(ref || "")
      .replace(/\u00A0/g, " ")
      .replace(/[–—\u2013\u2014\u2212]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
    if (!normalized) return;
    setSelectedVerseRef(formatStandardReference(normalized) || normalized);
    setIsVerseModalOpen(true);
  };

  const handleStudyDeeperVerse = (ref: string) => {
    const cleanRef = formatStandardReference(ref) || ref;
    localStorage.setItem("stba_pending_search_ref", cleanRef);
    localStorage.setItem("stba_pending_search_tool", "syllabus");
    setIsVerseModalOpen(false);
    navigate(`/stba?ref=${encodeURIComponent(cleanRef)}&tool=syllabus`);
  };

  const renderTextWithScriptureTriggers = (rawText: string, keyPrefix: string = "ref") => {
    const textToParse = String(rawText || "").replace(/\u00A0/g, " ");
    if (!textToParse) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = getScriptureRegex();

    while ((match = regex.exec(textToParse)) !== null) {
      const fullMatch = match[0];
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(textToParse.substring(lastIndex, matchIndex));
      }

      const stdRef = formatStandardReference(fullMatch) || fullMatch;
      parts.push(
        <button
          key={`${keyPrefix}-${matchIndex}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenVerseModal(stdRef);
          }}
          className="rounded-full inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2.5 py-0.5 mx-0.5 bg-[#FEF9C3] text-[#78350F] border border-[#FACC15] shadow-2xs hover:bg-[#FEF08A] hover:border-[#EAB308] cursor-pointer transition-all no-underline tracking-normal align-baseline"
          title={`Click to open ${stdRef} in Scripture Reference Explorer`}
        >
          <BookOpen className="w-2.5 h-2.5 text-[#92400E] shrink-0" />
          <span>{stdRef}</span>
        </button>
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < textToParse.length) {
      parts.push(textToParse.substring(lastIndex));
    }

    return parts.length > 0 ? parts : textToParse;
  };

  // 3 to 5 Foundational Scriptures with concise, stage-specific theological relevance tied to the active study stage
  const slateScripturesList = React.useMemo(() => {
    const focalRef = formatStandardReference(scripture.reference) || scripture.reference;

    const stageSpecificInsights: Record<
      string,
      Array<{ reference: string; role: string; theologicalInsight: string }>
    > = {
      stage1: [
        {
          reference: focalRef,
          role: "Primary Text • Stage 1",
          theologicalInsight: "Anchors our lexical and historical-grammatical exegesis in the author's original setting."
        },
        {
          reference: "Isaiah 28:9-10",
          role: "Hermeneutical Rule",
          theologicalInsight: "Establishes 'line upon line' comparison so Scripture interprets Scripture objectively."
        },
        {
          reference: "Luke 24:27",
          role: "Christocentric Key",
          theologicalInsight: "Demonstrates Christ expounding Moses and the Prophets in their unified canonical context."
        },
        {
          reference: "Nehemiah 8:8",
          role: "Expository Clarity",
          theologicalInsight: "Models reading the sacred text distinctly and giving its true sense to the hearers."
        }
      ],
      stage2: [
        {
          reference: focalRef,
          role: "Primary Text • Stage 2",
          theologicalInsight: "Equips the believer with uncompromised biblical truth in the Great Controversy."
        },
        {
          reference: "Genesis 3:1-5",
          role: "Edenic Conflict",
          theologicalInsight: "Exposes Satan's original strategy of wresting God's words out of context to sow doubt."
        },
        {
          reference: "Matthew 4:4",
          role: "Wilderness Victory",
          theologicalInsight: "Shows Christ overcoming temptation by standing upon 'every word' of Scripture."
        },
        {
          reference: "Revelation 12:9",
          role: "Cosmic Unmasking",
          theologicalInsight: "Unveils the dragon's end-time war against God's Word and His remnant people."
        }
      ],
      stage3: [
        {
          reference: focalRef,
          role: "Primary Text • Stage 3",
          theologicalInsight: "Forms the scriptural bedrock for Seventh-day Adventist doctrinal harmony."
        },
        {
          reference: "2 Timothy 3:16-17",
          role: "Belief #1 • Holy Scriptures",
          theologicalInsight: "Affirms that all Scripture is God-breathed and authoritative for doctrine and instruction."
        },
        {
          reference: "Hebrews 8:1-2",
          role: "Belief #24 • Sanctuary",
          theologicalInsight: "Centers all biblical doctrine in Christ our High Priest in the heavenly sanctuary."
        },
        {
          reference: "Daniel 8:14",
          role: "Prophetic Pillar",
          theologicalInsight: "Connects prophetic time interpretation to Christ's closing ministry of atonement."
        }
      ],
      stage4: [
        {
          reference: focalRef,
          role: "Primary Text • Stage 4",
          theologicalInsight: "Translates doctrinal conviction into daily heart sanctification and disciplined study."
        },
        {
          reference: "Psalm 119:11",
          role: "Heart Retention",
          theologicalInsight: "Demonstrates how hiding God's Word in the heart guards daily life from sin."
        },
        {
          reference: "1 Timothy 4:15-16",
          role: "Diligent Devotion",
          theologicalInsight: "Calls the workman to meditate wholly upon truth and take heed to personal life and doctrine."
        },
        {
          reference: "James 1:22-25",
          role: "Living Obedience",
          theologicalInsight: "Urges believers to be active doers of the Word rather than passive hearers."
        }
      ],
      stage5: [
        {
          reference: focalRef,
          role: "Primary Text • Stage 5",
          theologicalInsight: "Prepares the disciple to present God's truth with clarity, grace, and winsome love."
        },
        {
          reference: "2 Timothy 2:2",
          role: "Discipleship Chain",
          theologicalInsight: "Commissions us to entrust what we have learned to faithful witnesses who will teach others."
        },
        {
          reference: "1 Peter 3:15",
          role: "Gentle Witness",
          theologicalInsight: "Directs us to share the reason for our hope with meekness and deep respect."
        },
        {
          reference: "Revelation 14:12",
          role: "Remnant Appeal",
          theologicalInsight: "Unites keeping the commandments of God with the winsome faith of Jesus."
        }
      ]
    };

    if (customFoundationalScriptures.length >= 3) {
      return customFoundationalScriptures.slice(0, 5).map((s) => ({
        reference: formatStandardReference(s.reference) || s.reference,
        role: s.role,
        theologicalInsight: s.stageInsight
      }));
    }

    return stageSpecificInsights[phase] || stageSpecificInsights.stage1;
  }, [scripture.reference, phase, customFoundationalScriptures]);

  // Curated Spirit of Prophecy insights for the 'Ellen White' and 'All Slate' tabs
  const slateEllenWhiteList = React.useMemo(
    () => [
      {
        id: "egw-primary",
        stageLabel: "Core Hermeneutic • Sola Scriptura",
        source: "Fundamentals of Christian Education, pp. 187, 188",
        quote: scoreStats.ellenWhiteQuote || "The Bible is its own expositor. One passage will prove to be a key that will unlock other passages, and in this way light will be shed upon the hidden meaning of the word.",
        relatedScripture: "2 Timothy 3:16"
      },
      {
        id: "egw-stage1",
        stageLabel: "Stage 1 • Exegesis & Original Context",
        source: "Education, p. 189",
        quote: "We should not take the testimony of any man as to what the Scriptures teach, but should study the words of God for ourselves. If we allow others to do our thinking, we shall have crippled energies and contracted abilities.",
        relatedScripture: "2 Timothy 2:15"
      },
      {
        id: "egw-stage2",
        stageLabel: "Stage 2 • The Cosmic Lens & Great Controversy",
        source: "The Great Controversy, p. 595",
        quote: "None but those who have fortified the mind with the truths of the Bible will stand through the last great conflict. To every soul will come the searching test: Shall I obey God rather than men?",
        relatedScripture: "Revelation 14:12"
      },
      {
        id: "egw-stage3",
        stageLabel: "Stage 3 • Doctrinal Connections & Sanctuary",
        source: "The Great Controversy, p. 423",
        quote: "The subject of the sanctuary was the key which unlocked the mystery of the disappointment of 1844. It opened to view a complete system of truth, connected and harmonious, showing that God's hand had directed the great Advent Movement.",
        relatedScripture: "Daniel 8:14"
      },
      {
        id: "egw-stage4-5",
        stageLabel: "Stages 4 & 5 • Sanctified Life & Winsome Appeal",
        source: "Christ's Object Lessons, p. 335",
        quote: "In the common things of nature and of life, Jesus found the lessons with which He illustrated the highest truths. The heart that is filled with the grace of God will communicate truth with tenderness and winsome love.",
        relatedScripture: "2 Timothy 2:2"
      }
    ],
    [scoreStats.ellenWhiteQuote]
  );

  // Build structured export sections for PDF and DOCX downloads
  const buildExportSections = () => {
    const stageNotes = stagesList.map((st) => ({
      title: `Stage ${st.number}: ${st.title} (${st.subtitle})`,
      score: scoreStats.stageScores[st.id] || 0,
      feedback: scoreStats.stageFeedback[st.id] || "In progress — self-paced study."
    }));

    return {
      title: `Teach It Studio — Pedagogy & Exegesis Notes (${scripture.reference})`,
      dateStr: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      focalReference: scripture.reference,
      focalText: scripture.text,
      overallScore: scoreStats.overallScore,
      masteryRank: getMasteryLevelText(scoreStats.overallScore),
      targetAudience,
      teachingDraftOutline,
      outlineFeedback,
      devotionalPrompt: scoreStats.devotionalPrompt,
      devotionalReflection,
      stageNotes,
      scriptures: slateScripturesList,
      egwQuotes: slateEllenWhiteList,
      dialogue: chatMessages
    };
  };

  // Export Notes as PDF (.pdf) using jsPDF
  const downloadNotesAsPdf = () => {
    try {
      const data = buildExportSections();
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const contentWidth = pageWidth - margin * 2;
      let y = 54;

      const checkPageBreak = (neededHeight: number = 36) => {
        if (y + neededHeight > pageHeight - 54) {
          doc.addPage();
          y = 54;
        }
      };

      const addHeading = (text: string) => {
        checkPageBreak(40);
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(140, 95, 25);
        doc.text(text.toUpperCase(), margin, y);
        y += 6;
        doc.setDrawColor(201, 151, 58);
        doc.setLineWidth(0.75);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;
      };

      const addParagraph = (text: string, bold = false, indent = 0) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(10);
        doc.setTextColor(35, 35, 35);
        const lines = doc.splitTextToSize(String(text || ""), contentWidth - indent);
        for (const line of lines) {
          checkPageBreak(16);
          doc.text(line, margin + indent, y);
          y += 14;
        }
        y += 4;
      };

      // Document Title Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(28, 35, 51);
      doc.text("STUDY TO BE APPROVED (STBA) — TEACH IT STUDIO", margin, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Focal Passage: ${data.focalReference} • Exported: ${data.dateStr} • Audience: ${data.targetAudience}`, margin, y);
      y += 20;

      // 1. Focal Scripture & Supporting Scriptures
      addHeading("1. Focal Passage & Supporting Scriptures");
      addParagraph(`${data.focalReference}: "${data.focalText}"`, true);
      for (const item of data.scriptures) {
        addParagraph(`• ${item.reference} (${item.role}): ${item.theologicalInsight}`, false, 8);
      }

      // 2. Pedagogy Notes & Homiletic Teaching Outline
      addHeading(`2. Pedagogy Notes & Homiletic Outline (${data.targetAudience})`);
      addParagraph(data.teachingDraftOutline || "(No outline drafted yet.)");
      if (data.outlineFeedback) {
        addParagraph(`Elder Stephen's Coaching Feedback: ${data.outlineFeedback}`, false, 8);
      }

      // 3. 5-Stage Pedagogical Evaluation
      addHeading("3. 5-Stage Pedagogical Progress & Feedback");
      for (const st of data.stageNotes) {
        addParagraph(`${st.title} — Score: ${st.score}/100`, true);
        addParagraph(st.feedback, false, 10);
      }

      // 4. Ellen G. White Spirit of Prophecy Insights
      addHeading("4. Ellen G. White Spirit of Prophecy Insights");
      for (const egw of data.egwQuotes) {
        addParagraph(`"${egw.quote}" — ${egw.source} (${egw.stageLabel})`, false, 8);
      }

      // 5. Devotional Reflection & Dialogue
      if (data.devotionalReflection.trim()) {
        addHeading("5. Devotional Heart Reflection");
        addParagraph(`Prompt: ${data.devotionalPrompt}`, true);
        addParagraph(data.devotionalReflection.trim());
      }

      if (data.dialogue.length > 0) {
        addHeading("6. Continuous Dialogue Transcript");
        for (const msg of data.dialogue) {
          const speaker = msg.sender === "ai" ? "Elder Stephen" : "Disciple";
          addParagraph(`[${speaker}]: ${msg.text}`, false, 4);
        }
      }

      const safeRef = scripture.reference.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`STBA_Teach_It_${safeRef}_Notes.pdf`);
      triggerToast("Exported Teach It Studio Notes as PDF (.pdf)!");
    } catch (err) {
      console.error("PDF export error:", err);
      triggerToast("Unable to generate PDF file.");
    }
  };

  // Export Notes as genuine Word Document (.docx) using an uncompressed ECMA-376 OpenXML ZIP container
  const downloadNotesAsDocx = () => {
    try {
      const data = buildExportSections();

      const escapeXml = (str: string) =>
        String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const makeDocxPara = (text: string, opts?: { bold?: boolean; sizeHalfPt?: number; colorHex?: string }) => {
        const size = opts?.sizeHalfPt || 22;
        const color = opts?.colorHex || "1C2333";
        const boldTag = opts?.bold ? "<w:b/>" : "";
        return `<w:p><w:pPr><w:spacing w:after="140"/></w:pPr><w:r><w:rPr>${boldTag}<w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${escapeXml(
          text
        )}</w:t></w:r></w:p>`;
      };

      const bodyParagraphs: string[] = [];
      bodyParagraphs.push(
        makeDocxPara("STUDY TO BE APPROVED (STBA) — TEACH IT STUDIO NOTES", {
          bold: true,
          sizeHalfPt: 30,
          colorHex: "1C2333"
        })
      );
      bodyParagraphs.push(
        makeDocxPara(`Focal Scripture: ${data.focalReference} | Target Audience: ${data.targetAudience} | Exported: ${data.dateStr}`, {
          bold: true,
          sizeHalfPt: 20,
          colorHex: "8C5209"
        })
      );

      bodyParagraphs.push(makeDocxPara("1. FOCAL PASSAGE & SCRIPTURE BREAKDOWN", { bold: true, sizeHalfPt: 24, colorHex: "8C5209" }));
      bodyParagraphs.push(makeDocxPara(`${data.focalReference}: "${data.focalText}"`, { bold: true, sizeHalfPt: 22 }));
      for (const s of data.scriptures) {
        bodyParagraphs.push(makeDocxPara(`• ${s.reference} (${s.role}): ${s.theologicalInsight}`, { sizeHalfPt: 21 }));
      }

      bodyParagraphs.push(makeDocxPara(`2. PEDAGOGY NOTES & HOMILETIC OUTLINE (${data.targetAudience.toUpperCase()})`, { bold: true, sizeHalfPt: 24, colorHex: "8C5209" }));
      for (const line of String(data.teachingDraftOutline || "").split("\n")) {
        if (line.trim()) bodyParagraphs.push(makeDocxPara(line.trim(), { sizeHalfPt: 22 }));
      }
      if (data.outlineFeedback) {
        bodyParagraphs.push(makeDocxPara(`Elder Stephen's Coaching Feedback: ${data.outlineFeedback}`, { sizeHalfPt: 21 }));
      }

      bodyParagraphs.push(makeDocxPara("3. 5-STAGE PEDAGOGICAL EVALUATION", { bold: true, sizeHalfPt: 24, colorHex: "8C5209" }));
      for (const st of data.stageNotes) {
        bodyParagraphs.push(makeDocxPara(`${st.title} — Score: ${st.score}/100`, { bold: true, sizeHalfPt: 22 }));
        bodyParagraphs.push(makeDocxPara(st.feedback, { sizeHalfPt: 21 }));
      }

      bodyParagraphs.push(makeDocxPara("4. ELLEN G. WHITE SPIRIT OF PROPHECY INSIGHTS", { bold: true, sizeHalfPt: 24, colorHex: "8C5209" }));
      for (const egw of data.egwQuotes) {
        bodyParagraphs.push(makeDocxPara(`"${egw.quote}" — ${egw.source} (${egw.stageLabel})`, { sizeHalfPt: 21 }));
      }

      if (data.devotionalReflection.trim()) {
        bodyParagraphs.push(makeDocxPara("5. DEVOTIONAL HEART REFLECTION", { bold: true, sizeHalfPt: 24, colorHex: "8C5209" }));
        bodyParagraphs.push(makeDocxPara(`Prompt: ${data.devotionalPrompt}`, { bold: true, sizeHalfPt: 21 }));
        bodyParagraphs.push(makeDocxPara(data.devotionalReflection.trim(), { sizeHalfPt: 21 }));
      }

      if (data.dialogue.length > 0) {
        bodyParagraphs.push(makeDocxPara("6. CONTINUOUS DIALOGUE TRANSCRIPT", { bold: true, sizeHalfPt: 24, colorHex: "8C5209" }));
        for (const msg of data.dialogue) {
          const speaker = msg.sender === "ai" ? "Elder Stephen" : "Disciple";
          bodyParagraphs.push(makeDocxPara(`[${speaker}]: ${msg.text}`, { sizeHalfPt: 20 }));
        }
      }

      const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

      const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParagraphs.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

      // Minimal store-mode ZIP builder for genuine .docx binary output
      const encoder = new TextEncoder();
      const files = [
        { name: "[Content_Types].xml", data: encoder.encode(contentTypesXml) },
        { name: "_rels/.rels", data: encoder.encode(relsXml) },
        { name: "word/document.xml", data: encoder.encode(documentXml) }
      ];

      const crcTable = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        crcTable[n] = c >>> 0;
      }
      const crc32 = (bytes: Uint8Array) => {
        let crc = 0xffffffff;
        for (let i = 0; i < bytes.length; i++) {
          crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
        }
        return (crc ^ 0xffffffff) >>> 0;
      };

      const localParts: Uint8Array[] = [];
      const centralParts: Uint8Array[] = [];
      let offset = 0;

      for (const file of files) {
        const nameBytes = encoder.encode(file.name);
        const crc = crc32(file.data);
        const size = file.data.length;

        const localHeader = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(localHeader.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        localHeader.set(nameBytes, 30);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(centralHeader.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        centralHeader.set(nameBytes, 46);

        localParts.push(localHeader, file.data);
        centralParts.push(centralHeader);
        offset += localHeader.length + size;
      }

      const centralSize = centralParts.reduce((acc, arr) => acc + arr.length, 0);
      const eocd = new Uint8Array(22);
      const ev = new DataView(eocd.buffer);
      ev.setUint32(0, 0x06054b50, true);
      ev.setUint16(4, 0, true);
      ev.setUint16(6, 0, true);
      ev.setUint16(8, files.length, true);
      ev.setUint16(10, files.length, true);
      ev.setUint32(12, centralSize, true);
      ev.setUint32(16, offset, true);
      ev.setUint16(20, 0, true);

      const blob = new Blob([...localParts, ...centralParts, eocd], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeRef = scripture.reference.replace(/[^a-zA-Z0-9_-]/g, "_");
      link.href = url;
      link.download = `STBA_Teach_It_${safeRef}_Notes.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast("Exported Teach It Studio Notes as Word Document (.docx)!");
    } catch (err) {
      console.error("DOCX export error:", err);
      triggerToast("Unable to generate DOCX file.");
    }
  };

  const getMasteryLevelText = (sc: number): string => {
    if (sc >= 90) return "EVANGELIST LEVEL";
    if (sc >= 80) return "TEACHER LEVEL";
    if (sc >= 70) return "SCHOLAR LEVEL";
    if (sc >= 50) return "STUDENT LEVEL";
    return "BEGINNER LEVEL";
  };

  const formatTimerMMSS = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="stba-teach-it-studio"
      className="w-full h-full flex flex-col min-h-0 bg-[#1C2333] text-white font-sans md:rounded-[16px] md:border md:border-white/10 relative shadow-2xl"
      style={{ flex: "1 1 0%" }}
    >
      {/* HEADER CONTROLS HUD */}
      <div className="px-3 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#141A27]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#C9973A]/10 text-[#C9973A] rounded-[8px] animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold tracking-wider text-stone-200 uppercase">
              STUDY INTERACTIVE STUDIO
            </h2>
            <p className="text-[10px] text-stone-400 font-mono">
              AI Bible Study Companion & Recall Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Synthesizer switch */}
          <button
            onClick={() => {
              const next = !isAudioPrompterEnabled;
              setIsAudioPrompterEnabled(next);
              if (!next) stopVoiceResponse();
              triggerToast(next ? "Voice feedback prompt active" : "Voice feedback prompt muted");
            }}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-mono ${
              isAudioPrompterEnabled
                ? "bg-[#C9973A]/10 border-[#C9973A]/30 text-[#C9973A]"
                : "bg-white/5 border-white/5 text-stone-400 hover:text-white"
            }`}
            title="Toggle Voice Synthesizer Prompter"
          >
            {isAudioPrompterEnabled ? (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Audio Prompter</span>
          </button>

          <button
            onClick={() => {
              stopVoiceResponse();
              onClose();
            }}
            className="p-1 px-2 border border-white/10 hover:border-red-400 text-stone-400 hover:text-red-400 rounded transition-all cursor-pointer text-xs"
            title="Quit Session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DEDICATED SCROLL CONTAINER FOR TEACH-IT STUDIO */}
      <div
        id="teach-it-studio-scroll-container"
        className="flex-1 w-full overflow-y-auto scroll-smooth min-h-0"
        style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          height: "100%",
          flex: "1 1 auto"
        }}
      >
        {/* MAIN CONTAINER PANELS */}
        <div className="p-4 sm:p-6 md:p-8 pb-32 md:pb-8 flex-1 flex flex-col justify-between min-h-0">
        <AnimatePresence mode="wait">
          {/* ============================================== */}
          {/* 1. INTRO / CONFIGURATION SETUP                 */}
          {/* ============================================== */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 py-4 pb-28 md:pb-4 max-w-2xl mx-auto text-center"
              id="teach-it-intro-screen"
            >
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9973A] font-extrabold px-3 py-1 rounded bg-[#C9973A]/10 border border-[#C9973A]/20 inline-block">
                  {scripture.reference}
                </span>

                <h1 className="font-serif text-3.5xl sm:text-5xl font-normal text-white leading-tight tracking-tight pt-2">
                  "You've read it. <br />
                  <span className="text-[#C9973A] font-serif font-medium">But do you know it?"</span>
                </h1>

                <p className="font-sans text-sm sm:text-base text-stone-300 leading-relaxed max-w-[550px] mx-auto pt-2">
                  Engage in an intelligent, real-time interactive Bible study session powered by AI. Converse with your theological partner, present your exegesis, discuss "your understanding of Scripture," and receive instant scorecard evaluations!
                </p>
              </div>

              {/* Configurations panel */}
              <div className="pt-2 max-w-md mx-auto space-y-4 pb-12 md:pb-0">
                <div className="bg-[#C9973A]/10 border border-[#C9973A]/25 p-3 rounded-lg text-xs text-[#D2A650] flex flex-col gap-1 leading-normal text-left">
                  <div className="flex items-center justify-between gap-1.5 font-bold uppercase tracking-wider text-[#C9973A]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C9973A] shrink-0 animate-pulse" />
                      <span>AI Voice Profile Active: Elder Stephen</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#C9973A]/20 border border-[#C9973A]/40 text-[9px] font-mono">
                      gemini-3.8-live
                    </span>
                  </div>
                  <span>
                    Engages real-time bidirectional voice interaction via Gemini Live API (gemini-3.8-live). Speak your mind and Elder Stephen responds vocally and in writing instantly!
                  </span>
                </div>

                {/* Evangelist Switch card */}
                {isEvangelist && (
                  <div className="bg-[#C9973A]/10 border-2 border-[#C9973A]/30 p-4 rounded-[12px] text-left flex items-start gap-3.5 shadow-sm">
                    <div className="p-2 rounded-full bg-[#C9973A]/20 text-[#C9973A] shrink-0">
                      <Award className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-mono font-extrabold text-[#C9973A] block">
                        Lay Evangelist Active Scorecard
                      </span>
                      <p className="text-stone-300 text-[11.5px] leading-relaxed mt-1">
                        Evangelistic presentation guidelines triggered. The AI evaluates your winsomeness, clarity, and theological simplicity for seekers!
                      </p>
                    </div>
                  </div>
                )}

                {/* START / CONTINUE BUTTONS */}
                {savedSessionSnapshot ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleContinueSession}
                      className="w-full py-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                      id="btn-teach-intro-continue"
                    >
                      <BrainCircuit className="w-4 h-4 animate-bounce" />
                      <span>
                        Continue Session:{" "}
                        {savedSessionSnapshot.activeTopicTitle ||
                          savedSessionSnapshot.activeScripture?.reference ||
                          "Active Study"}
                      </span>
                    </button>
                    <button
                      onClick={handleBeginSession}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 border border-white/15 font-sans font-semibold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2"
                      id="btn-teach-intro-begin"
                    >
                      <span>Start Fresh Session</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBeginSession}
                    className="w-full py-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                    id="btn-teach-intro-begin"
                  >
                    <BrainCircuit className="w-4 h-4 animate-bounce" />
                    <span>Start Session</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ============================================== */}
          {/* 2. TWO-COLUMN TEACH IT STUDIO WORKSPACE        */}
          {/*    Left: Narrow Continuous Dialogue Bubbles    */}
          {/*    Right: Wide Tabbed Instructional Slate      */}
          {/* ============================================== */}
          {phase !== "intro" && phase !== "feedback" && activeStage && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 w-full"
            >
              {/* STATUS & SELF-PACED PAUSE/RESUME HUD BAR */}
              <div className="w-full flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    {!isPaused ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-stone-200">
                    {!isPaused ? "AI Session Live" : "Session Paused"}
                  </span>
                </div>

                {/* PAUSE / RESUME CONTROL (self-paced, no timer) */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                  {isTimerActive ? (
                    <button
                      id="btn-teach-pause-resume"
                      type="button"
                      onClick={handleTogglePauseSession}
                      className={`py-1 px-3 rounded-lg font-mono text-[10px] uppercase font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        isPaused
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-[#C9973A]/20 border border-[#C9973A]/40 text-[#F3CF65] hover:bg-[#C9973A]/30"
                      }`}
                    >
                      {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      <span>{isPaused ? "Resume" : "Pause"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBeginSession}
                      className="p-1 px-3 bg-[#C9973A] hover:bg-[#B5852F] rounded font-mono text-[10px] uppercase font-bold text-stone-950 cursor-pointer shadow transition-colors"
                    >
                      Start Session
                    </button>
                  )}
                </div>
              </div>

              {/* TOP STAGE ICONS TIMELINE */}
              <div
                ref={stageSelectorRef}
                className="w-full bg-[#141A27]/60 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-md"
                id="timer-breadcrumbs-bar"
              >
                <div className="flex items-center justify-between gap-1 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {stagesList.map((st, idx) => {
                    const isCurrent = phase === st.id;
                    const isVisited = getCurrentStageIndex() > idx;
                    const hasScore = (scoreStats.stageScores[st.id] || 0) > 0;
                    const score = scoreStats.stageScores[st.id] || 0;

                    return (
                      <React.Fragment key={st.id}>
                        {idx > 0 && (
                          <div className="flex-1 h-0.5 sm:h-1 min-w-[14px] sm:min-w-[28px] max-w-[80px] rounded-full overflow-hidden bg-white/10 relative">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isVisited || (isCurrent && idx > 0)
                                  ? "bg-gradient-to-r from-emerald-500 to-[#C9973A] w-full"
                                  : "w-0"
                              }`}
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleNextStage(st.id)}
                          data-active={isCurrent ? "true" : "false"}
                          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-xl border transition-all select-none flex-shrink-0 cursor-pointer ${
                            isCurrent
                              ? "bg-[#C9973A]/15 border-[#C9973A] text-white shadow-lg ring-2 ring-[#C9973A]/40"
                              : isVisited
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:border-emerald-400"
                              : "bg-white/[0.02] border-white/5 text-stone-400 hover:border-white/20"
                          }`}
                          title={`Switch to Stage ${st.number}: ${st.title}`}
                        >
                          <div
                            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center relative transition-transform ${
                              isCurrent
                                ? "bg-[#C9973A] text-stone-950 font-bold shadow-md scale-105"
                                : isVisited
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-white/5 text-stone-400 border border-white/5"
                            }`}
                          >
                            {isVisited && hasScore ? (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                            ) : (
                              st.icon
                            )}
                            {isCurrent && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9973A] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C9973A]"></span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col text-left pr-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider">
                              <span className={isCurrent ? "text-[#C9973A] font-extrabold" : isVisited ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                Stage {st.number}
                              </span>
                              <span
                                className={`font-bold px-1 py-0.2 rounded text-[8px] sm:text-[9px] ${
                                  hasScore
                                    ? "text-emerald-400 bg-emerald-500/20"
                                    : isCurrent
                                    ? "text-[#C9973A] bg-[#C9973A]/20"
                                    : "text-stone-500 bg-white/5"
                                }`}
                              >
                                {score}%
                              </span>
                            </div>
                            <span
                              className={`text-[11px] sm:text-xs font-sans font-bold leading-tight truncate max-w-[100px] sm:max-w-[130px] ${
                                isCurrent ? "text-white" : isVisited ? "text-stone-200" : "text-stone-400"
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* MOBILE COLUMN SWITCHER */}
              <div
                className="lg:hidden flex p-1 bg-stone-900/65 rounded-xl border border-white/10 text-[10px] font-mono select-none w-full gap-1"
                id="mobile-workspace-tab-bar"
              >
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("chat")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "chat"
                      ? "bg-[#C9973A] text-stone-950 shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Dialogue Stream
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("slate")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "slate"
                      ? "bg-[#C9973A] text-stone-950 shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Instructional Slate
                </button>
              </div>

              {/* ===================================================================== */}
              {/* TWO-COLUMN WORKSPACE:                                                 */}
              {/*   LEFT (NARROW): Exclusively Continuous Chat Dialogue Bubbles         */}
              {/*   RIGHT (WIDE): Tabbed Instructional Area (All Slate, Scriptures,     */}
              {/*                 Ellen White, Pedagogy Notes) loading top-down         */}
              {/* ===================================================================== */}
              <div
                className="flex flex-col lg:flex-row gap-5 items-stretch w-full min-w-0"
                id="study-workspace-panels"
              >
                {/* ==================== NARROW LEFT COLUMN: CONTINUOUS DIALOGUE BUBBLES ONLY ==================== */}
                <div
                  id="teach-it-left-dialogue-column"
                  className={`w-full lg:w-[370px] xl:w-[400px] lg:flex-shrink-0 bg-[#141A27] rounded-2xl border border-white/10 flex-col justify-between min-h-[580px] max-h-[760px] relative shadow-xl overflow-hidden ${
                    activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
                  }`}
                >
                  {/* Compact Dialogue Header */}
                  <div
                    className="px-4 py-3 bg-[#101520] border-b border-white/10 flex items-center justify-between gap-2 shrink-0"
                    id="chat-metadata-header"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-4 h-4 text-[#C9973A] shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          Elder Stephen Dialogue
                        </span>
                        <span className="text-[10px] font-mono text-[#C9973A] uppercase tracking-wider block truncate">
                          Stage {activeStage.number}: {activeStage.title}
                        </span>
                      </div>
                    </div>

                    {/* Compact Live Audio Indicator / Mic Mute */}
                    {useLiveVoiceAPI && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                            isPaused
                              ? "bg-amber-500/15 border-amber-500/35 text-amber-300"
                              : liveState === "playing"
                              ? "bg-teal-500/15 border-teal-500/35 text-teal-300 animate-pulse"
                              : liveState === "recording"
                              ? "bg-rose-500/15 border-rose-500/35 text-rose-300 animate-pulse"
                              : liveState === "ready"
                              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                              : "bg-white/5 border-white/10 text-stone-400"
                          }`}
                        >
                          {isPaused
                            ? "Paused"
                            : liveState === "playing"
                            ? "Speaking"
                            : liveState === "recording"
                            ? "Listening"
                            : liveState === "ready"
                            ? "Live"
                            : "Voice"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Continuous Chat Dialogue Bubbles Stream */}
                  <div
                    ref={chatContainerRef}
                    className="w-full min-w-0 flex-1 space-y-3.5 overflow-y-auto p-3.5 sm:p-4 scrollbar-thin"
                    id="chat-scroller-box"
                  >
                    <AnimatePresence initial={false}>
                      {chatMessages.map((msg) => {
                        const isAi = msg.sender === "ai";
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-2.5 w-full ${
                              isAi ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border ${
                                isAi
                                  ? "bg-[#C9973A]/20 border-[#C9973A]/40 text-[#F3CF65]"
                                  : "bg-white/10 border-white/20 text-white"
                              }`}
                            >
                              {isAi ? "ES" : "You"}
                            </div>
                            <div
                              className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap select-text break-words [word-break:break-word] max-w-[88%] ${
                                isAi
                                  ? "text-[15px] sm:text-base bg-[#1B2334] text-[#E8E4DA] border border-white/10 rounded-tl-none font-sans"
                                  : "text-xs sm:text-[13px] "
                              } ${
                                isAi
                                  ? ""
                                  : "bg-[#C9973A] text-stone-950 font-medium rounded-tr-none font-sans shadow-sm"
                              }`}
                            >
                              {renderTextWithScriptureTriggers(msg.text, `chat-${msg.id}`)}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2.5 mr-auto max-w-[85%]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#C9973A]/15 border border-[#C9973A]/35 text-[#F3CF65] shrink-0 text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                          ES
                        </div>
                        <div className="bg-[#1B2334] border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2.5">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                          <span className="font-mono text-[10px] text-stone-400">
                            Dividing truth...
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Dialogue Input Footer */}
                  <div className="p-3 bg-[#101520] border-t border-white/10 space-y-2.5 shrink-0 select-none">
                    {isRecording && !isPaused && (
                      <div className="bg-red-500/10 border border-red-500/25 px-3 py-1.5 rounded-lg text-[10px] text-red-300 flex items-center justify-between font-mono animate-pulse">
                        <span>🎤 Live Voice Active</span>
                        <button
                          type="button"
                          onClick={handleToggleRecording}
                          className="text-stone-200 hover:text-white underline cursor-pointer"
                        >
                          Stop
                        </button>
                      </div>
                    )}

                    <div className="flex flex-row items-end gap-2 w-full" id="chat-input-row">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={
                          isPaused
                            ? "Session paused — click Resume or type your response..."
                            : isRecording
                            ? "Speak now or type your exposition..."
                            : "Type your exposition or study observations..."
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isLoading}
                        rows={2}
                        className="flex-1 min-w-0 resize-none rounded-xl px-3 py-2 text-xs sm:text-sm bg-[#182030] border border-white/10 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] scrollbar-thin"
                      />

                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !userInput.trim()}
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-bold disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center group shrink-0"
                        title="Send Message"
                      >
                        <Send className="w-4 h-4 group-hover:scale-110" />
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleRecording}
                        className={`flex-shrink-0 w-9 h-9 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                          isRecording
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-300"
                        }`}
                        title="Toggle Live Voice / Mic Capture"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ==================== WIDE RIGHT COLUMN: TABBED INSTRUCTIONAL AREA ==================== */}
                <div
                  id="teach-it-right-instructional-column"
                  className={`flex-1 min-w-0 bg-[#141A27] rounded-2xl border border-white/10 flex-col min-h-[580px] max-h-[760px] shadow-xl overflow-hidden ${
                    activeMobileTab === "slate" ? "flex" : "hidden lg:flex"
                  }`}
                >
                  {/* Persistent Instructional Tab Bar + Download (PDF / DOCX) Button */}
                  <div
                    id="teach-it-right-tabs"
                    className="px-4 py-3 bg-[#101520] border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0"
                  >
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                      {(
                        [
                          { id: "all", label: "All Slate", icon: <Layers className="w-3.5 h-3.5" /> },
                          { id: "scriptures", label: "Scriptures", icon: <BookOpen className="w-3.5 h-3.5" /> },
                          { id: "egw", label: "Ellen White", icon: <Quote className="w-3.5 h-3.5" /> },
                          { id: "pedagogy", label: "Pedagogy Notes", icon: <GraduationCap className="w-3.5 h-3.5" /> }
                        ] as const
                      ).map((tab) => {
                        const isActive = activeSlateTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            id={`teach-slate-tab-${tab.id}`}
                            type="button"
                            onClick={() => setActiveSlateTab(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                              isActive
                                ? "bg-[#C9973A] text-stone-950 border-[#F3CF65] shadow-md"
                                : "bg-[#182030] text-stone-300 border-white/10 hover:border-[#C9973A]/50 hover:text-white"
                            }`}
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Download Button (Replaces 'Copy Notes' — Exports PDF or DOCX) */}
                    <div className="relative">
                      <button
                        id="btn-download-teach-notes"
                        type="button"
                        onClick={() => setShowSlateDownloadMenu((prev) => !prev)}
                        className="px-3.5 py-2 rounded-xl bg-[#1B2538] hover:bg-[#233048] text-[#F3CF65] border border-[#C9973A]/50 text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        title="Download Study & Pedagogy Notes as PDF or DOCX"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C9973A]" />
                        <span>Download</span>
                        <ChevronDown className="w-3 h-3 opacity-80" />
                      </button>

                      <AnimatePresence>
                        {showSlateDownloadMenu && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setShowSlateDownloadMenu(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.96 }}
                              transition={{ duration: 0.14 }}
                              className="absolute right-0 mt-2 w-60 bg-[#0F1624] border border-[#C9973A]/40 rounded-xl shadow-2xl p-2 z-30 space-y-1 text-left"
                            >
                              <span className="block text-[9px] font-mono uppercase tracking-widest text-[#C9973A] px-2.5 py-1 font-bold">
                                Export Study & Pedagogy Notes
                              </span>
                              <button
                                id="btn-export-notes-pdf"
                                type="button"
                                onClick={() => {
                                  downloadNotesAsPdf();
                                  setShowSlateDownloadMenu(false);
                                }}
                                className="w-full text-left p-2.5 rounded-lg hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer text-xs"
                              >
                                <div className="p-1.5 bg-[#C9973A]/15 text-[#F3CF65] rounded-lg">
                                  <Printer className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="block font-bold text-white">Export as PDF (.pdf)</span>
                                  <span className="block text-[10px] text-stone-400">Formatted printable study packet</span>
                                </div>
                              </button>
                              <button
                                id="btn-export-notes-docx"
                                type="button"
                                onClick={() => {
                                  downloadNotesAsDocx();
                                  setShowSlateDownloadMenu(false);
                                }}
                                className="w-full text-left p-2.5 rounded-lg hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer text-xs"
                              >
                                <div className="p-1.5 bg-blue-500/15 text-blue-300 rounded-lg">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="block font-bold text-white">Export as Word (.docx)</span>
                                  <span className="block text-[10px] text-stone-400">Editable Microsoft Word document</span>
                                </div>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* TOP-DOWN INSTRUCTIONAL SLATE SCROLL AREA */}
                  <div
                    ref={rightSlateScrollRef}
                    id="teach-it-slate-content-area"
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col justify-start items-stretch text-left scrollbar-thin"
                  >
                    {!isRightSlatePopulated ? (
                      <div
                        id="teach-it-slate-blank-state"
                        className="flex-1 w-full min-h-[420px]"
                        aria-label="Instructional slate awaiting topic selection"
                      />
                    ) : (
                      <>
                        {/* ============================================================ */}
                        {/* SEGMENT 1: TOPIC & VERSE OVERVIEW + IMPORTANCE + EXEGESIS    */}
                        {/* ============================================================ */}
                        {activeSlateTab === "all" && (
                      <div
                        id="teach-slate-topic-overview"
                        className="bg-[#1B2334] border border-[#C9973A]/40 rounded-2xl p-4 sm:p-5 space-y-4"
                      >
                        {/* Top Header: Topic Title + Active Stage Mastery Rating */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-bold block">
                              Staged Instructional Slate • Stage {activeStage.number} of 5 ({activeStage.title})
                            </span>
                            <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-0.5 truncate">
                              {activeTopicTitle}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="px-3 py-1.5 rounded-xl bg-[#101520] border border-[#C9973A]/40 text-center">
                              <span className="text-[9px] font-mono uppercase text-stone-400 block">
                                Stage {activeStage.number} Mastery
                              </span>
                              <span className="text-sm font-black text-[#F3CF65]">
                                {(scoreStats.stageScores[phase] || 0) > 0
                                  ? `${scoreStats.stageScores[phase]}%`
                                  : "In Progress"}
                              </span>
                            </div>
                            {activeStageIndex >= 4 && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceToScorecard()}
                                className="px-3 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-bold text-xs rounded-xl cursor-pointer transition-all"
                              >
                                Complete Report →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Topic & Primary Verse Overview */}
                        <div className="p-4 rounded-xl bg-[#101520] border border-white/10 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9973A] font-bold">
                                Primary Text:
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenVerseModal(scripture.reference)}
                                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FEF9C3] text-[#78350F] border border-[#FACC15] hover:bg-[#FEF08A] font-mono font-bold text-xs cursor-pointer transition-all shadow-2xs"
                                title={`Click to open ${scripture.reference} in Scripture Reference Explorer`}
                              >
                                <BookOpen className="w-3 h-3 text-[#92400E]" />
                                <span>{scripture.reference}</span>
                              </button>
                            </div>


                          </div>

                          {scripture.text && (
                            <p className="text-[15px] sm:text-base font-serif text-white leading-relaxed border-l-2 border-[#C9973A] pl-3">
                              &ldquo;{scripture.text}&rdquo;
                            </p>
                          )}

                          <div className="pt-1 space-y-2.5 text-[15px] sm:text-base text-stone-300 leading-relaxed">
                            <div>
                              <span className="font-bold text-[#F3CF65] mr-1.5">Topic Overview:</span>
                              {renderTextWithScriptureTriggers(activeTopicOverview, "topic-ov")}
                            </div>
                            {activeTopicImportance && (
                              <div>
                                <span className="font-bold text-[#F3CF65] mr-1.5">Why This Matters:</span>
                                {renderTextWithScriptureTriggers(activeTopicImportance, "topic-imp")}
                              </div>
                            )}
                            <div className="p-3 rounded-lg bg-[#161F30] border border-[#C9973A]/25 text-stone-200">
                              <span className="font-bold text-[#C9973A] block text-[11px] font-mono uppercase tracking-wider mb-1">
                                Elder Stephen's Exegesis Demonstration ({scripture.reference}):
                              </span>
                              {renderTextWithScriptureTriggers(activeExegesisDemo, "exegesis-demo")}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ============================================================ */}
                    {/* SEGMENT 2: 3 TO 5 FOUNDATIONAL SCRIPTURES (STAGE-TIED)       */}
                    {/* ============================================================ */}
                    {(activeSlateTab === "all" || activeSlateTab === "scriptures") && (
                      <div className="space-y-3" id="teach-slate-scriptures-section">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <h4 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#C9973A]" />
                            <span>
                              Foundational Scriptures ({slateScripturesList.slice(0, 5).length} Passages • Stage {activeStage.number}: {activeStage.title})
                            </span>
                          </h4>
                          <span className="text-[11px] font-mono text-stone-400">
                            Click any reference to explore or study deeper
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {slateScripturesList.slice(0, 5).map((item, idx) => (
                            <div
                              key={`slate-scripture-${item.reference}-${idx}`}
                              onClick={() => handleOpenVerseModal(item.reference)}
                              className="p-3.5 rounded-xl bg-[#182030] hover:bg-[#1E293D] border border-white/10 hover:border-[#C9973A]/60 transition-all cursor-pointer space-y-1.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenVerseModal(item.reference);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#78350F] border border-[#FACC15] hover:bg-[#FEF08A] font-mono font-bold text-xs cursor-pointer transition-all shadow-2xs"
                                  >
                                    <BookOpen className="w-3 h-3 text-[#92400E]" />
                                    <span>{item.reference}</span>
                                  </button>
                                  <span className="text-[11px] font-mono text-[#C9973A] font-semibold">
                                    {item.role}
                                  </span>
                                </div>


                              </div>

                              <p className="text-[15px] sm:text-base text-stone-200 leading-relaxed">
                                <span className="font-bold text-[#F3CF65] mr-1.5">
                                  Stage {activeStage.number} ({activeStage.title}):
                                </span>
                                {renderTextWithScriptureTriggers(item.theologicalInsight, `sc-ins-${idx}`)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ============================================================ */}
                    {/* SEGMENT 3: ELLEN WHITE TAB (STAGED SEGMENT IN 'ALL SLATE')   */}
                    {/* ============================================================ */}
                    {(activeSlateTab === "all" || activeSlateTab === "egw") && (
                      <div className="space-y-3" id="teach-slate-egw-section">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h4 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                            <Quote className="w-4 h-4 text-[#C9973A]" />
                            <span>
                              {activeSlateTab === "all"
                                ? `Stage ${activeStage.number} Spirit of Prophecy Insight`
                                : "Ellen G. White • Staged Spirit of Prophecy Illumination"}
                            </span>
                          </h4>
                          <span className="text-[11px] font-mono text-stone-400">
                            {activeSlateTab === "all" ? `Focused on ${activeStage.title}` : "All 5 Stages"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {(activeSlateTab === "all"
                            ? [slateEllenWhiteList[Math.min(activeStageIndex + 1, slateEllenWhiteList.length - 1)] || slateEllenWhiteList[0]]
                            : slateEllenWhiteList
                          ).map((egw, eIdx) => (
                            <div
                              key={egw.id}
                              className="p-4 rounded-xl bg-[#182030] border border-[#C9973A]/30 space-y-2"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9973A] font-bold">
                                  {egw.stageLabel}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerseModal(egw.relatedScripture)}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#78350F] border border-[#FACC15] hover:bg-[#FEF08A] font-mono font-bold text-[11px] cursor-pointer transition-all"
                                  title={`Open ${egw.relatedScripture} in Scripture Explorer`}
                                >
                                  <BookOpen className="w-2.5 h-2.5 text-[#92400E]" />
                                  <span>{egw.relatedScripture}</span>
                                </button>
                              </div>

                              <blockquote className="pl-3.5 border-l-2 border-[#C9973A] text-[15px] sm:text-base text-stone-200 leading-relaxed font-serif">
                                &ldquo;{renderTextWithScriptureTriggers(egw.quote, `egw-q-${eIdx}`)}&rdquo;
                              </blockquote>

                              {/* 1. Elder Stephen's topic-specific commentary on the quote */}
                              <p className="text-[15px] sm:text-base text-[#E8E4DA] leading-relaxed bg-[#101520] border border-[#C9973A]/20 rounded-lg p-3">
                                <span className="font-bold text-[#F3CF65] mr-1.5">Elder Stephen:</span>
                                {renderTextWithScriptureTriggers(
                                  activeEgwCommentary ||
                                    `When it comes to ${activeTopicTitle || scripture.reference}, no one else can open the Word for you. Searching these texts for yourself lets the Holy Spirit build a conviction that is truly your own, so you can stand firm and teach others with confidence.`,
                                  `egw-cm-${eIdx}`
                                )}
                              </p>

                              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono pt-1">
                                <span>— Ellen G. White, {egw.source}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const appended = `${teachingDraftOutline}\n• EGW Insight (${egw.source}): "${egw.quote}"`;
                                    setTeachingDraftOutline(appended);
                                    localStorage.setItem(`stba_teach_it_outline_${scripture.id}`, appended);
                                    triggerToast("Added Spirit of Prophecy quote to Pedagogy Notes!");
                                  }}
                                  className="text-[#F3CF65] hover:underline font-sans font-bold text-xs cursor-pointer"
                                >
                                  + Add to Pedagogy Notes
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ============================================================ */}
                    {/* SEGMENT 4: PEDAGOGY NOTES TAB (STAGED SEGMENT IN 'ALL SLATE')*/}
                    {/* ============================================================ */}
                    {(activeSlateTab === "all" || activeSlateTab === "pedagogy") && (
                      <div className="space-y-4" id="teach-slate-pedagogy-section">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <h4 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#C9973A]" />
                            <span>
                              {activeSlateTab === "all"
                                ? `Stage ${activeStage.number} Pedagogy & Homiletic Builder`
                                : "Pedagogy Notes & Homiletic Lesson Builder"}
                            </span>
                          </h4>

                        </div>

                        {/* Staged Pedagogical Evaluation Card(s) */}
                        <div className={activeSlateTab === "all" ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                          {(activeSlateTab === "all" ? [activeStage] : stagesList).map((st) => {
                            const sc = scoreStats.stageScores[st.id] || 0;
                            const isCurrentStage = phase === st.id;
                            const feedback = scoreStats.stageFeedback[st.id];
                            return (
                              <div
                                key={`pedagogy-stage-${st.id}`}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  isCurrentStage
                                    ? "bg-[#C9973A]/15 border-[#C9973A] text-white"
                                    : sc > 0
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-stone-200"
                                    : "bg-[#182030] border-white/10 text-stone-300"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-bold">
                                    Stage {st.number}: {st.title} — {st.subtitle}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/30 text-[#F3CF65]">
                                    Mastery: {sc > 0 ? `${sc}%` : "In Progress"}
                                  </span>
                                </div>
                                <p className="text-[15px] sm:text-base text-stone-300 leading-relaxed">
                                  {renderTextWithScriptureTriggers(feedback, `ped-fb-${st.id}`)}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Homiletic Teaching Outline & Audience Adaptation */}
                        <div className="p-4 rounded-xl bg-[#182030] border border-white/10 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9973A] font-bold block">
                                Homiletic Teaching Outline
                              </span>
                              <h5 className="text-sm font-bold text-white">
                                Structure Your Lesson for Discipleship
                              </h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsOutlineCollapsed((v) => !v)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-[11px] font-semibold cursor-pointer transition-all"
                              >
                                {isOutlineCollapsed ? "Expand" : "Collapse"}
                              </button>
                              <label className="text-xs text-stone-300 font-mono">Audience:</label>
                              <select
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value as any)}
                                className="bg-[#101520] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-stone-100 outline-none focus:border-[#C9973A]"
                              >
                                <option value="Child">Child</option>
                                <option value="New Believer">New Believer</option>
                                <option value="Mature Student">Mature Student</option>
                              </select>
                            </div>
                          </div>

                          {!isOutlineCollapsed && (<>
                          <textarea
                            value={teachingDraftOutline}
                            onChange={(e) => {
                              setTeachingDraftOutline(e.target.value);
                              localStorage.setItem(`stba_teach_it_outline_${scripture.id}`, e.target.value);
                            }}
                            placeholder="Draft your teaching outline, key scripture transitions, illustrations, and winsome appeal..."
                            rows={Math.max(6, teachingDraftOutline.split("\n").length + 1)}
                            className="w-full resize-none overflow-hidden bg-[#101520] border border-white/10 rounded-xl p-3.5 text-[15px] sm:text-base text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#C9973A] font-sans leading-relaxed"
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-stone-400">
                              Keywords captured: {scoreStats.foundKeywords.length}/{scripture.keywords.length}
                            </span>
                            <button
                              type="button"
                              disabled={teachingDraftOutline.trim().length < 15 || isGeneratingOutline}
                              onClick={handleGenerateOutlineWithElder}
                              className="px-4 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-bold rounded-xl text-xs transition-all disabled:opacity-45 cursor-pointer"
                            >
                              {isGeneratingOutline ? "Evaluating with Elder Stephen..." : "Verify Outline with Elder Stephen"}
                            </button>
                          </div>

                          {outlineFeedback && (
                            <div className="p-3.5 bg-[#101520] border-l-2 border-[#C9973A] rounded-xl text-[15px] sm:text-base leading-relaxed text-stone-200 space-y-1">
                              <span className="text-[10px] font-mono uppercase text-[#C9973A] font-bold block">
                                Elder Stephen Pedagogical Review:
                              </span>
                              <div>{renderTextWithScriptureTriggers(outlineFeedback, "outline-fb")}</div>
                            </div>
                          )}
                          </>)}
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================== */}
          {/* 3. SCORING DASHBOARD REPORT & REFLECTION       */}
          {/* ============================================== */}
          {phase === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left w-full h-full"
              id="teach-it-feedback-screen"
            >
              {/* CELEBRATION HERO BANNER */}
              <div className="w-full bg-gradient-to-r from-amber-500/20 via-[#C9973A]/30 to-emerald-500/20 border-2 border-[#C9973A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#C9973A]/30 border border-[#C9973A] px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-200 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      <span>Approved Workman Celebration</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                      🎉 All 5 Stages Completed!
                    </h2>
                    <p className="text-stone-200 text-sm max-w-xl font-sans leading-relaxed">
                      Congratulations on thoroughly analyzing, contextualizing, doctrinally defending, and winsomely preparing to teach{" "}
                      <button
                        type="button"
                        onClick={() => handleOpenVerseModal(scripture.reference)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#78350F] border border-[#FACC15] font-mono font-bold text-xs cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3 text-[#92400E]" />
                        <span>{scripture.reference}</span>
                      </button>
                      .
                    </p>
                  </div>

                  {/* Grand Total Score Showcase */}
                  <div className="flex flex-col items-center justify-center bg-[#141A27]/90 border border-white/15 p-5 rounded-2xl shadow-xl min-w-[180px] text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold">
                      Grand Total Score
                    </span>
                    <div className="font-sans font-black text-4xl sm:text-5xl text-white my-1 tracking-tight">
                      {scoreStats.overallScore}%
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {getMasteryLevelText(scoreStats.overallScore)}
                    </span>
                    <button
                      onClick={() => showConfetti('teach', 'Hallelujah! All 5 Study Stages Mastered!')}
                      className="mt-3 px-3 py-1 bg-[#C9973A]/20 hover:bg-[#C9973A]/40 border border-[#C9973A]/50 text-amber-200 text-[10px] font-mono uppercase rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Celebrate Again 🎉</span>
                    </button>
                  </div>
                </div>

                {/* 5-STAGE EVALUATION MINI-CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-white/10">
                  {stagesList.map((st) => {
                    const stScore = scoreStats.stageScores[st.id] || scoreStats.overallScore || 85;
                    return (
                      <div
                        key={st.id}
                        className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                          <span>Stage {st.number}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-stone-200 line-clamp-1 mb-2">
                          {st.title}
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-mono text-stone-400">Score:</span>
                          <span className="text-sm font-sans font-black text-emerald-400">
                            {stScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- STUDY SOLEMN DEVOTIONAL REFLECTION (AFTER EVERY SESSION) --- */}
              <div className="bg-[#1C2333] border border-[#C9973A]/20 p-5 sm:p-6 rounded-[12px] text-left space-y-4">
                <div className="border-b border-stone-800 pb-2.5">
                  <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-[#C9973A] font-extrabold block">
                    Solemn Active Reflection
                  </span>
                  <h3 className="font-serif font-bold text-md sm:text-lg text-white mt-0.5">
                    Devotional Reflection Prompt
                  </h3>
                  <p className="text-stone-400 text-xs font-medium mt-1 font-serif">
                    "Scripture studied. Now respond. What is God revealing about His character? What is He asking you to trust, release, or do today?"
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-serif block text-stone-200">
                    {scoreStats.devotionalPrompt}
                  </span>

                  <textarea
                    value={devotionalReflection}
                    onChange={(e) => setDevotionalReflection(e.target.value)}
                    placeholder="Write down your heart responses, study vows, life adjustments, or a prayer. These are secured and tracked in your Scripture Memory Vault..."
                    rows={4}
                    disabled={hasSavedReflection}
                    className="w-full bg-[#141A27]/80 border border-stone-800 rounded-lg p-3 text-xs sm:text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] font-serif leading-relaxed"
                  />

                  {hasSavedReflection ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-[8px] text-emerald-300 text-xs flex items-center gap-2 font-serif font-light animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Scripture exegesis reflection committed perfectly to your spiritual journal. Peace be with you!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveToSpiritualJournal}
                      disabled={!devotionalReflection.trim()}
                      className="py-2.5 px-6 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer disabled:opacity-40"
                    >
                      Save to Memory Journal
                    </button>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5 pt-4 select-none">
                <span className="text-[10px] text-stone-500 font-mono">
                  Bible Mastery updated. Vault sync secured.
                </span>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto relative">
                  {/* Download Button with PDF and DOCX options */}
                  <div className="relative flex-1 sm:flex-initial">
                    <button
                      type="button"
                      onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                      className="w-full py-3 px-5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 h-11 border border-white/15"
                      id="btn-download-session-summary"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <AnimatePresence>
                      {showDownloadDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowDownloadDropdown(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full mb-2 right-0 w-64 bg-[#141A27] border border-white/10 rounded-xl shadow-2xl p-2.5 z-20 space-y-1.5"
                          >
                            <span className="block text-[9px] font-mono text-stone-400 uppercase tracking-widest px-2.5 py-1 text-left font-bold">
                              Export Pedagogy Notes
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                downloadNotesAsPdf();
                                setShowDownloadDropdown(false);
                              }}
                              className="w-full text-left p-2.5 rounded-lg hover:bg-[#C9973A]/10 transition flex items-center gap-2.5 cursor-pointer text-xs"
                            >
                              <div className="p-1.5 bg-[#C9973A]/15 text-[#C9973A] rounded">
                                <Printer className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left">
                                <span className="block font-bold text-stone-100">Export as PDF (.pdf)</span>
                                <span className="block text-[10px] text-stone-400">Formatted printable study packet</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                downloadNotesAsDocx();
                                setShowDownloadDropdown(false);
                              }}
                              className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition flex items-center gap-2.5 cursor-pointer text-xs"
                            >
                              <div className="p-1.5 bg-blue-500/15 text-blue-300 rounded">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left">
                                <span className="block font-bold text-stone-100">Export as Word (.docx)</span>
                                <span className="block text-[10px] text-stone-400">Editable Microsoft Word document</span>
                              </div>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleBeginSession}
                    className="flex-1 sm:flex-initial py-3 px-6 border border-[#C9973A]/40 hover:border-[#C9973A] text-[#C9973A] font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 h-11"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Study Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial py-3 px-8 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 h-11"
                  >
                    <span>Complete Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* CLICK-TO-OPEN SCRIPTURE REFERENCE EXPLORER POPUP (MIRRORING SABBATH SCHOOL MODULE) */}
      <VerseModal
        isOpen={isVerseModalOpen}
        reference={selectedVerseRef}
        theme="dark"
        onClose={() => setIsVerseModalOpen(false)}
        onStudyDeeper={(ref) => handleStudyDeeperVerse(ref)}
      />
    </div>
  );
};
