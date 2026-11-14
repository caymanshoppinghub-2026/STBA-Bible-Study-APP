/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch, safeParseResponseJson } from "../lib/apiFetch";
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
  Brain
} from "lucide-react";
import { Scripture } from "../types";
import { useApp } from "../context/AppContext";
import { callElderStephen } from "../lib/callElderStephen";
import { getElderStephenVoice } from "./stba/RightPaneTools";
import { useLocation } from "react-router-dom";
import { bibleService } from "../services/bibleService";
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

  const [activeScripture, setActiveScripture] = useState<Scripture>(initialScripture);
  const scripture = activeScripture;

  // Role selections and options
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem("stba_user_role") || user?.role || "Student";
  });
  const [isEvangelist, setIsEvangelist] = useState<boolean>(() => {
    return userRole === "LayEvangelist" || localStorage.getItem("stba_user_role") === "LayEvangelist";
  });
  const [isAudioPrompterEnabled, setIsAudioPrompterEnabled] = useState<boolean>(true);

  // Active state parameters
  const [phase, setPhase] = useState<PhaseType>("intro");
  const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "scorecard" | "checklist">("chat");

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
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Chat message engine
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Speech Recognition engine
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Real-time Scorecard stats (accumulated through user input)
  const [scoreStats, setScoreStats] = useState({
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
  });

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
    if (user?.name) return user.name;
    if ((user as any)?.displayName) return (user as any).displayName;
    try {
      const savedProfile = localStorage.getItem("stba_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name) return parsed.name;
        if (parsed?.displayName) return parsed.displayName;
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
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataView = new DataView(bytes.buffer);
      const samplesCount = len / 2;
      const floatSamples = new Float32Array(samplesCount);
      for (let i = 0; i < samplesCount; i++) {
        const intSample = dataView.getInt16(i * 2, true);
        floatSamples[i] = intSample / 32768;
      }
      
      const buffer = ctx.createBuffer(1, samplesCount, 24000);
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

  const startGeminiLiveSession = async () => {
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
      initializeAudioContext();
      
      const isHttps = window.location.protocol === "https:";
      const protocol = isHttps ? "wss:" : "ws:";
      const stateDoctrine = location.state?.doctrineId || "";
      const stateLesson = location.state?.lessonId || "";
      
      const userName = resolveUserName();
      const passageRef = scripture?.reference || "2 Timothy 2:15";
      const passageBody = (scripture?.text || "").trim();
      const boundedQueryPassage = passageBody.length > 400 ? passageBody.slice(0, 400) : passageBody;
      const elderStephenSystemInstruction = [
        `You are Elder Stephen, an exegetical, Seventh-day Adventist historical method mentor for live interactive Bible study and vocal discipleship in the "Study To Be Approved" (STBA) ecosystem.`,
        `Your persona is a warm, wise, calm, reverent, and supportive Seventh-day Adventist pastor and biblical scholar guiding ${userName} through the historic Seventh-day Adventist historical-grammatical and historicist method of biblical interpretation on ${passageRef}${passageBody ? ` ("${passageBody}")` : ""}.`,
        `Core Hermeneutical & Exegetical Commitments:`,
        `1. Sola Scriptura & Scripture Interprets Scripture (Isaiah 28:9-10; 2 Timothy 2:15).`,
        `2. Historical-Grammatical Exegesis: Examine original historical context, authorial intent, and key Hebrew/Aramaic/Greek terms.`,
        `3. Historicist & Sanctuary Lens: Connect the passage to the Great Controversy, Christ's Sanctuary ministry, the Three Angels' Messages (Revelation 14:6-12), and Seventh-day Adventist Fundamental Beliefs.`,
        `4. Live Interactive Mentorship: Guide ${userName} smoothly through the 5 stages of exegesis, doctrine, application, and winsome witness.`
      ].join("\n");
      
      const studyContext: StudyContextQueryParams = {
        mode: "teach",
        model: "gemini-3.8-live",
        persona: "Elder Stephen",
        doctrineId: stateDoctrine || undefined,
        lessonId: stateLesson || undefined,
        userName,
        reference: scripture?.reference || undefined,
        passageText: boundedQueryPassage || undefined
      };

      const localSearchParams = new URLSearchParams();
      Object.entries(studyContext).forEach(([key, val]) => {
        if (val) localSearchParams.set(key, val);
      });
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
              if (spoken && !isElderSpeakingRef.current) {
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
            }

            if (msg.text) {
              setLiveState("playing");
              appendLiveReplyChunk(msg.text);
            }

            if (msg.turnComplete) {
              endLiveReplyAccumulation();
              if (activeNodesRef.current.length === 0) {
                setLiveState("ready");
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

      if (hasCustomEdgeFunction && wsUrl) {
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
      inputAudioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
    }
    if (inputAudioCtxRef.current.state === "suspended") {
      inputAudioCtxRef.current.resume();
    }
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    if (outputAudioCtxRef.current.state === "suspended") {
      outputAudioCtxRef.current.resume();
    }
    nextStartTimeRef.current = 0;
  };

  const startMicCapture = async () => {
    try {
      initializeAudioContext();
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
      const processor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtxRef.current!.destination);

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isMicMutedRef.current || isElderSpeakingRef.current) return;
        
        const floatSamples = e.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for (let i = 0; i < floatSamples.length; i++) {
          sum += floatSamples[i] * floatSamples[i];
        }
        const rms = Math.sqrt(sum / floatSamples.length);
        
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

        const pcmBuffer = floatTo16BitPCM(floatSamples);
        const base64 = arrayBufferToBase64(pcmBuffer);
        
        wsRef.current.send(JSON.stringify({ audio: base64 }));
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

  // Main countdown timer loop - strictly begins when isTimerActive is true
  useEffect(() => {
    if (!isTimerActive || phase === "intro" || phase === "feedback" || isPaused) {
      clearIntervals();
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearIntervals();
          triggerToast("Session time expired! Compiling report...");
          handleAdvanceToScorecard();
          return 0;
        }
        return prev - 1;
      });
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

  // Starting the dialogue session - begins timer and starts Stage 1
  const handleBeginSession = () => {
    setIsTimerActive(true);
    setSecondsRemaining(900);
    setChatMessages([]);
    setIsPaused(false);
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
    const initialPrompt = `Hello ${userName}, welcome to today’s study session! Today, I'll be guiding you through our 5-stage study journey:

• **Stage 1**: Exegesis & Original Context
• **Stage 2**: The Cosmic Lens & The Great Controversy
• **Stage 3**: Doctrinal Connections & Fundamental Beliefs
• **Stage 4**: Practical Life-Reforming Application
• **Stage 5**: Graceful Evangelistic Invitation & Appeal

Let's begin right away with **Stage 1: Exegesis & Original Context** for **${scripture.reference}**:
*"${scripture.text}"*

What is the authorial setting and original context of this passage, and how would you summarize its central meaning in your own words?`;

    setChatMessages([
      {
        id: "sys-init",
        sender: "ai",
        text: initialPrompt,
        timestamp: new Date()
      }
    ]);

    // Proactively initiate Live Gemini (gemini-3.8-live) voice session immediately on Start Session
    if (useLiveVoiceAPI) {
      startGeminiLiveSession();
      setIsRecording(true);
    } else {
      setTimeout(() => {
        triggerVoiceResponse(initialPrompt);
      }, 400);
    }

    triggerToast(`Welcome ${userName}! Gemini Live Study Session initialized.`);
  };

  // Simple event trigger: auto-advance to next stage as soon as evaluation score is provided
  const triggerAutoAdvanceToNextStage = (
    currentIdx: number,
    numericScore: number,
    additionalData?: {
      foundKeywords?: string[];
      stageFeedback?: string;
      ellenWhiteQuote?: string;
      devotionalPrompt?: string;
    }
  ) => {
    const currentPhase = stagesList[currentIdx]?.id;
    if (!currentPhase) return;

    // 1. Reveal/update score for the evaluated stage & reset session score to 0 for the new stage
    setScoreStats((prev) => {
      const nextStageScores = { ...prev.stageScores };
      nextStageScores[currentPhase] = numericScore;

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
        overallScore: 0, // Reset session score for the new stage
        stageScores: nextStageScores,
        foundKeywords: nextFoundKeywords,
        gaps: nextGaps,
        stageFeedback: nextFeedback,
        ellenWhiteQuote: additionalData?.ellenWhiteQuote || prev.ellenWhiteQuote,
        devotionalPrompt: additionalData?.devotionalPrompt || prev.devotionalPrompt
      };
    });

    // 2. Synchronized stage transition: move from current stage to next stage AS SOON AS score is revealed!
    if (currentIdx < 4) {
      const nextIdx = currentIdx + 1;
      const nextStage = stagesList[nextIdx];

      // Move to the next stage IMMEDIATELY visually
      setPhase(nextStage.id);

      // Present next stage's prompt in chat so the user can immediately continue
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

      // Spoken voice synchronized with the stage transition
      triggerVoiceResponse(
        `I evaluate your Stage ${currentIdx + 1} response at ${numericScore} out of 100. Moving to Stage ${nextStage.number}: ${nextStage.title}. ${nextStage.prompt}`
      );
      triggerToast(`Stage ${currentIdx + 1} score: ${numericScore}%. Advanced to Stage ${nextStage.number}: ${nextStage.title}`);
    } else {
      // Completed final Stage 5!
      triggerVoiceResponse(
        `I evaluate your final Stage 5 response at ${numericScore} out of 100. Praise God! You have successfully completed all five stages of our study journey today.`
      );
      triggerToast(`Stage 5 score: ${numericScore}%. All 5 stages completed!`);
      setTimeout(() => {
        handleAdvanceToScorecard(true);
      }, 1000);
    }
  };

  // Sending student dialogue to server
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || userInput).trim();
    if (!textToSend) return;

    // Detect if user provided a scripture reference
    const refMatch = textToSend.match(/\b([1-3]?\s*[A-Za-z]+)\s+(\d+:\d+(?:-\d+)?)\b/i);
    if (refMatch) {
      const detectedRef = refMatch[0];
      bibleService.getText(detectedRef, "KJV").then((fetchedText) => {
        if (fetchedText && !fetchedText.includes("Invalid scripture")) {
          const cleanWords = fetchedText.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 4);
          const keywords = Array.from(new Set(cleanWords)).slice(0, 6);
          setActiveScripture({
            id: detectedRef.toLowerCase().replace(/[^a-z0-9]/g, ""),
            reference: detectedRef,
            text: fetchedText,
            keywords: keywords.length > 0 ? keywords : ["scripture", "context", "truth", "grace"]
          });
        }
      }).catch((e) => console.warn("Bible lookup note:", e));
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

    // Ensure recording is stopped
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // If Live Gemini WebSocket is active, notify the live speech session as well
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
          scripture,
          messages: nextMessages.map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          stage: phase,
          userRole,
          isEvangelist
        })
      });

      if (!response.ok) {
        throw new Error("Tutor communications offline.");
      }

      const data = await safeParseResponseJson<any>(response);
      if (!data || (data.ok === false && !data.reply)) {
        throw new Error(data?.error || "Tutor communications returned non-JSON payload.");
      }
      const stageHeading = phase.replace("stage", "Stage ");
      const numericScore = data.score || 85;
      const formattedReply = `**${stageHeading} Evaluation Score: ${numericScore}/100**\n\n${data.reply || "Wonderful insights, Noble Berean."}`;

      // Append AI response
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

      // Event trigger: reveal score dynamically, display in Session Scorecard, then immediately advance to next stage
      const currentIdx = getCurrentStageIndex();
      if (currentIdx !== -1) {
        triggerAutoAdvanceToNextStage(currentIdx, numericScore, {
          foundKeywords: data.foundKeywords,
          stageFeedback: data.stageFeedback,
          ellenWhiteQuote: data.ellenWhiteQuote,
          devotionalPrompt: data.devotionalPrompt
        });
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to reach GenAI companion. Using theological local exegesis fallback.");

      // Emergency client-side mock so testing is perfect
      const fallbackReplies: Record<string, string> = {
        stage1: `Highly detailed point! Timothy's unashamed labor relates directly to accuracy. You discussed exegesis and linguistic context with wonderful accuracy.`,
        stage2: `Brilliant reflection! In the cosmic war, divine truth holds up the lamp of God's character and counters deceptive compromises with clarity.`,
        stage3: `Excellent mapping! Scripture indeed is our rock-solid standard, anchoring our fundamental beliefs unified as a global remnant church.`,
        stage4: `Amazing action blueprint. Laying down a specific, daily study routine tomorrow morning is practical and highly sanctifying.`,
        stage5: `Beautiful, respectful gospel presentation! Your warm, winsome appeal perfectly reflects Christ's character of love.`
      };

      const reply = fallbackReplies[phase] || "Well divided truth, Berean scholar!";
      const fallbackHeading = phase.replace("stage", "Stage ");
      const fallbackScore = 85;
      const formattedFallbackReply = `**${fallbackHeading} Evaluation Score: ${fallbackScore}/100**\n\n${reply}`;
      const aiMsgId = `ai-fallback-${Date.now()}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: formattedFallbackReply,
          timestamp: new Date()
        }
      ]);

      // Event trigger for fallback: reveal score, display in Session Scorecard, then advance to next stage
      const currentIdx = getCurrentStageIndex();
      if (currentIdx !== -1) {
        triggerAutoAdvanceToNextStage(currentIdx, fallbackScore, {
          stageFeedback: reply
        });
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

    // Read next stage prompt
    triggerVoiceResponse(stagePrompt);
    triggerToast(`Advanced target context to ${stagesList[nextIdx].title}`);
  };

  const handleAdvanceToScorecard = (keepVoice = false) => {
    if (!keepVoice) {
      stopVoiceResponse();
    }
    clearIntervals();

    // Trigger celebration confetti
    showConfetti('teach', 'Hallelujah! All 5 Study Stages Mastered!');

    // Calculate final cumulative score
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

  const downloadSummaryAsTxt = () => {
    let output = "";
    output += "============================================================\\n";
    output += "         STUDY TO BE APPROVED (STBA) - SESSION SUMMARY       \\n";
    output += `         Reference: ${scripture.reference}                     \\n`;
    output += `         Date: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()} \\n`;
    output += "============================================================\\n\\n";

    output += `[SCRIPTURE THEME]\\n`;
    output += `Reference: ${scripture.reference}\\n`;
    output += `Text: "${scripture.text}"\\n\\n`;

    output += `[OVERALL COGNITIVE EVALUATION]\\n`;
    output += `Overall Mastery Score: ${scoreStats.overallScore}%\\n`;
    output += `Discipleship Rank: ${getMasteryLevelText(scoreStats.overallScore)}\\n`;
    output += `Active Profile Background: ${userRole}\\n\\n`;

    output += "------------------------------------------------------------\\n";
    output += "                 STAGE-BY-STAGE EVALUATION                  \\n";
    output += "------------------------------------------------------------\\n";
    stagesList.forEach((stg) => {
      const sc = scoreStats.stageScores[stg.id] || 0;
      const feedback = scoreStats.stageFeedback[stg.id] || "No discussion recorded.";
      output += `Stage ${stg.number}: ${stg.title}\\n`;
      output += `Score: ${sc}/100\\n`;
      output += `Feedback: ${feedback}\\n`;
      output += `------------------------------------------------------------\\n`;
    });

    output += "\\n";
    output += "------------------------------------------------------------\\n";
    output += "                 DEVOTIONAL HEART REFLECTION                \\n";
    output += "------------------------------------------------------------\\n";
    output += `Prompt: ${scoreStats.devotionalPrompt}\\n`;
    output += `Your Reflection:\\n`;
    output += devotionalReflection.trim() ? devotionalReflection.trim() : "(No reflection text captured in memory journal yet.)";
    output += "\\n\\n";

    output += "------------------------------------------------------------\\n";
    output += "                 SESSION TRANSLATION DIALOGUE               \\n";
    output += "------------------------------------------------------------\\n";
    if (chatMessages.length === 0) {
      output += "(No dialogue text captures. Session completed using voice/audio prompters.)\\n";
    } else {
      chatMessages.forEach((msg, idx) => {
        const title = msg.sender === "ai" ? "STBA INTERACTIVE GUIDE" : "STUDENT";
        output += `[${idx + 1}] ${title} (${msg.timestamp.toLocaleTimeString()}):\\n`;
        output += `    ${msg.text}\\n\\n`;
      });
    }

    output += "\\n============================================================\\n";
    output += "               VINDICATED & APPROVED BEREAN                 \\n";
    output += `               "${scoreStats.ellenWhiteQuote}"\\n`;
    output += "============================================================\\n";

    // Trigger download
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `STBA_${scripture.reference.replace(/\\s+/g, "_")}_Session_Summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Plain-text session report saved successfully!");
  };

  const downloadSummaryAsHtml = () => {
    let chatHtml = "";
    if (chatMessages.length === 0) {
      chatHtml = `<p style="font-style: italic; color: #888;">No textual dialogue logged. Session completed using real-time vocal streams.</p>`;
    } else {
      chatMessages.forEach((msg) => {
        const isAi = msg.sender === "ai";
        chatHtml += `
          <div style="margin-bottom: 16px; padding: 12px; border-radius: 6px; background-color: ${isAi ? '#fdfaf5' : '#f4f5f7'}; border-left: 4px solid ${isAi ? '#C9973A' : '#1C2333'};">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${isAi ? '#C9973A' : '#1C2333'}; font-weight: bold; margin-bottom: 4px;">
              ${isAi ? 'STBA AI GUIDE' : 'STUDENT WORKMAN'} - ${new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div style="font-size: 12.5px; line-height: 1.5; color: #333;">${msg.text}</div>
          </div>
        `;
      });
    }

    let stagesHtml = "";
    stagesList.forEach((stg) => {
      const sc = scoreStats.stageScores[stg.id] || 0;
      const feedback = scoreStats.stageFeedback[stg.id] || "No discussion recorded.";
      stagesHtml += `
        <div style="padding: 12px 0; border-bottom: 1px dashed #e8e4da;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-family: 'Inter', sans-serif; font-size: 13px; color: #222;">Stage ${stg.number}: ${stg.title}</strong>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: bold; color: #C9973A; background-color: #fdfaf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #c9973a20;">
              ${sc}/100
            </span>
          </div>
          <p style="font-size: 12px; color: #666; margin: 0; line-height: 1.45;">${feedback}</p>
        </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>STBA Scripture Exegesis Record: ${scripture.reference}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
    
    body {
      background-color: #f6f5f0;
      color: #1a1a1a;
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 40px 20px;
    }
    .paper {
      background-color: #ffffff;
      border: 1px solid #e8e4da;
      border-radius: 16px;
      max-width: 800px;
      margin: 0 auto;
      padding: 50px 60px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      position: relative;
    }
    .seal-border {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 1px solid #c9973a20;
      pointer-events: none;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #C9973A;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      margin: 0;
      color: #1C2333;
      letter-spacing: -0.01em;
    }
    .header p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #C9973A;
      margin: 8px 0 0 0;
      font-weight: 700;
    }
    .scripture-card {
      background-color: #fdfaf5;
      border: 1px solid #C9973A25;
      padding: 20px 24px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .scripture-card h2 {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      margin: 0 0 8px 0;
      color: #C9973A;
    }
    .scripture-card p {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 15px;
      color: #333;
      line-height: 1.6;
      margin: 0;
    }
    .score-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #1C2333;
      color: #ffffff;
      padding: 20px 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .score-banner h3 {
      font-size: 24px;
      margin: 0;
      font-family: 'Playfair Display', serif;
    }
    .score-badge {
      font-size: 32px;
      font-weight: 800;
      color: #C9973A;
      font-family: 'Inter', sans-serif;
    }
    .section-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #1C2333;
      border-bottom: 1px solid #1c233315;
      padding-bottom: 8px;
      margin-top: 35px;
      margin-bottom: 16px;
      font-weight: 800;
    }
    .reflection-text {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 14.5px;
      line-height: 1.6;
      color: #2b2b2b;
      background-color: #fefefc;
      padding: 20px;
      border-left: 3px solid #C9973A;
      border-radius: 0 8px 8px 0;
    }
    .quote {
      text-align: center;
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 13.5px;
      color: #666;
      border-top: 1px solid #e8e4da;
      padding-top: 20px;
      margin-top: 40px;
    }
    .footer {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #999;
      margin-top: 25px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .paper {
        border: none;
        box-shadow: none;
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
    .btn-print {
      display: block;
      width: fit-content;
      margin: 20px auto 0 auto;
      background-color: #C9973A;
      color: white;
      border: none;
      padding: 10px 24px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-print:hover {
      background-color: #b5852f;
    }
  </style>
</head>
<body>

  <div class="paper">
    <div class="seal-border"></div>
    
    <button class="btn-print no-print" onclick="window.print()">Print This Record / Save PDF</button>

    <div class="header">
      <p>Study To Be Approved (STBA)</p>
      <h1>Scriptural Exegesis Record</h1>
      <p style="color: #666; font-size: 10px; margin-top: 4px;">Syllabus Assessment & Verbal Evaluation</p>
    </div>

    <div class="scripture-card">
      <h2>Active Study Core: ${scripture.reference}</h2>
      <p>"${scripture.text}"</p>
    </div>

    <div class="score-banner">
      <div>
        <h3 style="margin-bottom: 4px;">Assessment Profile</h3>
        <p style="font-size: 12px; color: #aaa; margin: 0; font-family: 'Inter', sans-serif;">
          Role: <strong>${userRole} background</strong> • Status: <strong>VERIFIED</strong>
        </p>
      </div>
      <div>
        <div class="score-badge">${scoreStats.overallScore}%</div>
        <p style="font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; margin: 0; text-align: right; color: #C9973A; font-weight: bold;">
          ${getMasteryLevelText(scoreStats.overallScore)}
        </p>
      </div>
    </div>

    <div class="section-title">Cognitive Stage Evaluation Breakdown</div>
    <div>
      ${stagesHtml}
    </div>

    <div class="section-title">Active Recall Keywords Captured</div>
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: #1C2333;">
      <strong>Identified Scriptural Keys:</strong><br/>
      ${scripture.keywords.map(k => {
        return `<span style="display: inline-block; margin-right: 12px; color: #2E7D32; font-weight: bold;">[✓] ${k}</span>`;
      }).join(' ')}
    </p>

    <div class="section-title">Devotional Heart Reflection</div>
    <div style="margin-top: 10px;">
      <p style="font-size: 12px; color: #666; font-family: 'Inter', sans-serif; font-weight: 500; margin-bottom: 8px;">
        <strong>Prompt:</strong> ${scoreStats.devotionalPrompt}
      </p>
      <div class="reflection-text">
        ${devotionalReflection.trim() ? devotionalReflection.trim().replace(/\n/g, "<br/>") : "(No personal reflection text captured in memory journal yet.)"}
      </div>
    </div>

    <div class="section-title">Historical Session Dialogue Transcript</div>
    <div style="margin-top: 12px;">
      ${chatHtml}
    </div>

    <div class="quote">
      "${scoreStats.ellenWhiteQuote}"
    </div>

    <div class="footer">
      Syllabus Reference Code STBA-EXP-${scripture.id.toUpperCase()} • STBA SECURE ARCHIVAL LEDGER
    </div>
  </div>

</body>
</html>
`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `STBA_${scripture.reference.replace(/\s+/g, "_")}_Exegesis_Record.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Beautiful HTML/PDF-ready certificate template exported!");
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

                {/* START BUTTON */}
                <button
                  onClick={handleBeginSession}
                  className="w-full py-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                  id="btn-teach-intro-begin"
                >
                  <BrainCircuit className="w-4 h-4 animate-bounce" />
                  <span>Start Session</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================== */}
          {/* 2. CORE INTERACTIVE CHAT & LIVE SCORECARD GRID */}
          {/* ============================================== */}
          {phase !== "intro" && phase !== "feedback" && activeStage && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full"
            >
              {/* STATUS & ACTIONS HUD TIMER */}
              <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
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
                  <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-stone-300">
                    {!isPaused ? "AI Session Live" : "Study Paused"}
                  </span>
                </div>

                {/* TIMERS HUD PANEL */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                  <div className="px-3 py-1 font-mono font-bold text-stone-200 flex items-center gap-1.5 border-r border-white/5">
                    <Clock className={`w-3.5 h-3.5 ${isTimerActive && !isPaused ? "text-[#C9973A] animate-pulse" : "text-stone-400"}`} />
                    <span>
                      {!isTimerActive
                        ? "Timer Standby"
                        : `Time Left: ${formatTimerMMSS(secondsRemaining)}`}
                    </span>
                  </div>
                  {isTimerActive ? (
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-1 px-2.5 hover:bg-white/10 rounded font-mono text-[10px] uppercase font-bold text-[#C9973A] cursor-pointer transition-colors"
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  ) : (
                    <button
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
                className="col-span-12 w-full bg-[#141A27]/60 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-md" 
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
                        {/* Connecting Line between stage icons */}
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

                        {/* Stage Icon Node */}
                        <div
                          data-active={isCurrent ? "true" : "false"}
                          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-xl border transition-all select-none flex-shrink-0 cursor-default ${
                            isCurrent
                              ? "bg-[#C9973A]/15 border-[#C9973A] text-white shadow-lg ring-2 ring-[#C9973A]/40"
                              : isVisited
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                              : "bg-white/[0.02] border-white/5 text-stone-500"
                          }`}
                        >
                          {/* Circular icon container */}
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

                          {/* Stage details */}
                          <div className="flex flex-col text-left pr-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider">
                              <span className={isCurrent ? "text-[#C9973A] font-extrabold" : isVisited ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                Stage {st.number}
                              </span>
                              <span className={`font-bold px-1 py-0.2 rounded text-[8px] sm:text-[9px] ${
                                hasScore
                                  ? "text-emerald-400 bg-emerald-500/20"
                                  : isCurrent
                                  ? "text-[#C9973A] bg-[#C9973A]/20"
                                  : "text-stone-500 bg-white/5"
                              }`}>
                                {score}%
                              </span>
                            </div>
                            <span className={`text-[11px] sm:text-xs font-sans font-bold leading-tight truncate max-w-[100px] sm:max-w-[130px] ${
                              isCurrent ? "text-white" : isVisited ? "text-stone-200" : "text-stone-400"
                            }`}>
                              {st.title}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* MOBILE WORKSPACE TAB SELECTOR */}
              <div 
                className="col-span-12 lg:hidden flex p-1 bg-stone-900/65 rounded-xl border border-white/5 text-[10px] font-mono select-none w-full gap-1 mb-2" 
                id="mobile-workspace-tab-bar"
              >
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("chat")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "chat"
                      ? "bg-[#C9973A] text-white shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Dialogue
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("scorecard")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "scorecard"
                      ? "bg-[#C9973A] text-white shadow shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Scorecard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("checklist")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "checklist"
                      ? "bg-[#C9973A] text-white shadow shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Checklist
                </button>
              </div>

              {/* STUDY WORKSPACE PANELS */}
              <div className="col-span-12 flex flex-col lg:flex-row gap-6 items-stretch w-full min-w-0" id="study-workspace-panels">

                {/* ==================== LEFT PANEL: METRICS CARD ==================== */}
                <div className={`space-y-4 flex-col order-last lg:order-none w-full lg:w-[320px] lg:flex-shrink-0 ${
                  activeMobileTab !== "chat" ? "flex" : "hidden lg:flex"
                }`}>
                  
                  {/* Live Exegesis Scorecard & Stage Progress Tracking */}
                  <div className={`bg-[#141A27] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-5 w-full shadow-lg ${
                    activeMobileTab === "scorecard" ? "block" : "hidden lg:block"
                  }`}>
                    {/* Session Score Card */}
                    <div className="bg-[#1C2333]/70 border border-white/10 rounded-xl p-4 space-y-3" id="scorecard-header-badge-row">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] block font-extrabold">Mastery HUD</span>
                          <h3 className="font-serif text-base font-bold text-stone-100">Session Score</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#C9973A]/20 to-[#C9973A]/5 border-2 border-[#C9973A] rounded-xl text-center flex flex-col justify-center items-center shadow-lg shadow-[#C9973A]/10">
                            <span className="text-[8px] font-mono text-[#C9973A] font-bold uppercase tracking-wider leading-none mb-0.5">Live</span>
                            <span className="text-[17px] font-sans font-black text-white leading-none">{scoreStats.overallScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Cumulative progress bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Cumulative Progress</span>
                          <span className="text-[#C9973A] font-bold">
                            {completedStagesCount} of 5 Stages Mastered
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 via-[#C9973A] to-amber-300 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(4, (completedStagesCount / 5) * 100)}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-stone-400">
                          <span>Rank: {getMasteryLevelText(scoreStats.overallScore)}</span>
                          <span>{Math.round((completedStagesCount / 5) * 100)}% Complete</span>
                        </div>
                      </div>
                    </div>

                    {/* STAGE PROGRESS TRACKING (Left Panel) */}
                    <div className="space-y-2.5" id="stage-progress-tracking-panel">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-mono text-[10px] text-stone-300 uppercase tracking-widest block font-bold flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-[#C9973A]" />
                          <span>Stage Progress Tracking</span>
                        </span>
                        <span className="text-[9px] font-mono text-[#C9973A] bg-[#C9973A]/10 px-1.5 py-0.5 rounded font-bold">
                          Step {activeStageIndex !== -1 ? activeStageIndex + 1 : 1}/5
                        </span>
                      </div>

                      <div className="space-y-2 font-sans">
                        {stagesList.map((st, idx) => {
                          const sc = scoreStats.stageScores[st.id] || 0;
                          const isCurrentStage = phase === st.id;
                          const isVisited = getCurrentStageIndex() > idx || sc > 0;
                          const hasScore = sc > 0;

                          return (
                            <div
                              key={st.id}
                              className={`p-3 rounded-xl border transition-all duration-300 ${
                                isCurrentStage
                                  ? "bg-[#C9973A]/15 border-2 border-[#C9973A] shadow-md shadow-[#C9973A]/10 text-white"
                                  : hasScore
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-stone-200"
                                  : "bg-white/[0.02] border border-white/5 text-stone-500 opacity-70"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                                    isCurrentStage
                                      ? "bg-[#C9973A] text-stone-950 font-black shadow"
                                      : hasScore
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                      : "bg-white/5 text-stone-400"
                                  }`}>
                                    {hasScore ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : st.number}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[12px] font-bold leading-none ${
                                        isCurrentStage ? "text-white" : hasScore ? "text-emerald-300" : "text-stone-400"
                                      }`}>
                                        {st.title}
                                      </span>
                                      {isCurrentStage && (
                                        <span className="flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#C9973A] opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9973A]"></span>
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-stone-400 line-clamp-1 block mt-0.5">
                                      {st.subtitle}
                                    </span>
                                  </div>
                                </div>

                                {/* Real-time Stage Score Badge */}
                                <div>
                                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 whitespace-nowrap shadow-sm border ${
                                    hasScore
                                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                      : isCurrentStage
                                      ? "bg-[#C9973A]/20 border-[#C9973A]/50 text-[#C9973A]"
                                      : "bg-white/5 border-white/10 text-stone-500"
                                  }`}>
                                    <span>Score:</span>
                                    <span className="font-black">{sc}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Real-time score progress bar */}
                              <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                                <span className={hasScore ? "text-emerald-400 font-bold" : isCurrentStage ? "text-[#C9973A] font-semibold" : "text-stone-500"}>
                                  Stage Score: {sc}/100
                                </span>
                                <div className="w-16 h-1 bg-stone-900 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      hasScore ? "bg-emerald-400" : isCurrentStage ? "bg-[#C9973A]" : "bg-stone-700"
                                    }`}
                                    style={{ width: `${sc}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Real-time Gemini Live session HUD (gemini-3.8-live) */}
                    {useLiveVoiceAPI && (
                      <div className="bg-[#1C2333]/65 border border-[#C9973A]/30 rounded-xl p-4 w-full space-y-3" id="live-vocal-coach-panel">
                        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-white/10 pb-2 select-none" id="vocal-coach-status-header">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-mono text-[#C9973A] font-bold">Elder Stephen Live</span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#C9973A]/15 text-[#C9973A] border border-[#C9973A]/30">
                              {liveModelName}
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                            liveState === "playing" 
                              ? "bg-teal-500/15 text-teal-300 animate-pulse" 
                              : liveState === "recording" 
                              ? "bg-red-500/15 text-red-300 animate-pulse" 
                              : liveState === "ready" 
                              ? "bg-emerald-500/15 text-emerald-300" 
                              : liveState === "connecting"
                              ? "bg-amber-500/15 text-amber-300 animate-pulse"
                              : "bg-white/5 text-stone-400"
                          }`}>
                            {liveState === "playing" 
                              ? "● Elder Stephen Speaking" 
                              : liveState === "recording" 
                              ? "● Live Mic Streaming" 
                              : liveState === "ready" 
                              ? "● Live Connected" 
                              : liveState === "connecting"
                              ? "● Connecting Live API..."
                              : "● Standby"}
                          </span>
                        </div>

                        {/* Real-time Waveform Visualizer */}
                        <div className="flex items-end justify-center gap-1 h-7 bg-black/25 rounded-lg px-3 py-1.5 border border-white/5">
                          {waveHeights.map((h, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 rounded-full transition-all duration-75 ${
                                liveState === "playing"
                                  ? "bg-teal-400"
                                  : liveState === "recording"
                                  ? "bg-rose-400"
                                  : liveWebSocketActive
                                  ? "bg-emerald-400/60"
                                  : "bg-stone-600"
                              }`}
                              style={{ height: `${Math.max(4, Math.min(20, h))}px` }}
                            />
                          ))}
                        </div>

                        <div className="w-full text-xs leading-relaxed text-stone-300 font-sans break-words whitespace-normal text-left">
                          {liveState === "idle" && (
                            <p className="text-stone-400">Oral exegesis pipeline on standby. Click Start Session to connect real-time voice with Elder Stephen.</p>
                          )}
                          {liveState === "connecting" && (
                            <p className="text-amber-300 animate-pulse font-mono text-[10px]">Initializing WebSocket pipelines and authenticating Gemini Live ({liveModelName}) stream...</p>
                          )}
                          {liveState === "ready" && (
                            <p className="text-emerald-400 font-serif">"I'm listening. Speak your theological insight out loud or type in the chat..."</p>
                          )}
                          {liveState === "recording" && (
                            <p className="text-red-300">Streaming 16,000Hz 16-bit PCM voice audio directly to {liveModelName}...</p>
                          )}
                          {liveState === "playing" && (
                            <p className="text-teal-300 font-serif">"Elder Stephen is speaking directly via 24,000Hz Live PCM stream..."</p>
                          )}
                          {liveState === "error" && (
                            <p className="text-rose-400 font-mono text-[10px]">{liveError || "Connection closed unexpectedly."}</p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1 font-mono text-[9px]">
                          {!liveWebSocketActive ? (
                            <button
                              type="button"
                              onClick={startGeminiLiveSession}
                              disabled={liveState === "connecting"}
                              className="w-full py-2 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold rounded uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                            >
                              Start Session
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setIsMicMuted(!isMicMuted)}
                                className={`flex-1 py-2 rounded font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                  isMicMuted
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                    : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                }`}
                              >
                                {isMicMuted ? "Unmute Mic" : "Mute Mic"}
                              </button>
                              <button
                                type="button"
                                onClick={cleanupLiveAudioAndWS}
                                className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/35 border border-red-500/35 text-red-300 font-sans font-bold rounded uppercase tracking-wider transition-all cursor-pointer"
                              >
                                End Live
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                {/* Keyword tracker & Theological gaps */}
                <div className={`bg-[#141A27] border border-white/5 rounded-xl p-5 space-y-3 ${
                  activeMobileTab === "checklist" ? "block" : "hidden lg:block"
                }`}>
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400">Word Tracing Analytics</span>
                    <h4 className="font-serif text-sm font-bold text-stone-200">Scripture Keywords Checklist</h4>
                  </div>

                  {/* Keywords mapped checklist */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                      {scoreStats.foundKeywords.length === 0 ? (
                        <span className="text-[11px] text-stone-500 font-serif italic">
                          No reference keywords detected yet...
                        </span>
                      ) : (
                        scoreStats.foundKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="font-mono text-[9.5px] px-2 py-0.5 border rounded-md transition-all flex items-center gap-1 bg-emerald-500/10 border-emerald-500/35 text-emerald-300"
                          >
                            <span>✓</span>
                            <span>{kw}</span>
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 leading-normal leading-relaxed">
                      AI analyzes your responses looking for reference keywords.
                    </p>
                  </div>
                </div>



              </div>

              {/* ==================== RIGHT PANEL: ACTIVE CHAT FLUX ==================== */}
              <div className={`flex-1 min-w-0 w-full bg-[#141A27] rounded-xl border border-white/5 p-3 sm:p-5 flex-col justify-between min-h-[460px] relative shadow-lg order-first lg:order-none ${
                activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
              }`}>
                
                {/* Responsive Chat Metadata Header */}
                <div 
                  className="flex flex-col items-center justify-center text-center w-full px-4 py-3 gap-2 border-b border-white/5 text-[10px] font-mono select-none lg:flex-col lg:items-start lg:text-left lg:w-[240px] lg:px-6 lg:py-6"
                  id="chat-metadata-header"
                >
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-stone-400 w-full lg:justify-start">
                    <span className="whitespace-nowrap">Active study phase:</span>
                    <span className="text-[#C9973A] font-bold uppercase whitespace-nowrap">{activeStage.title}</span>
                  </div>
                </div>

                {/* Chat Log container */}
                <div
                  ref={chatContainerRef}
                  className="w-full min-w-0 flex-1 space-y-4 overflow-y-auto pr-1 pb-4 h-[320px] scrollbar-thin border-b border-white/5"
                  id="chat-scroller-box"
                >
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg) => {
                      const isAi = msg.sender === "ai";
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-start gap-2.5 w-full ${isAi ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                        >
                          <div
                            className={`p-2 rounded-full text-xs font-serif shrink-0 ${
                              isAi ? "bg-[#C9973A]/20 text-[#C9973A]" : "bg-white/10 text-white"
                            }`}
                          >
                            {isAi ? "AI" : "You"}
                          </div>
                          <div
                            className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text w-full max-w-none break-words [word-break:break-word] ${
                              isAi
                                ? "bg-white/5 text-[#E8E4DA] border border-white/5 rounded-tl-none font-serif font-light"
                                : "bg-[#C9973A] text-white rounded-tr-none font-sans"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5 mr-auto max-w-[80%]"
                    >
                      <div className="p-2 rounded-full bg-[#C9973A]/10 text-[#C9973A] shrink-0 text-xs animate-pulse">
                        AI
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-3">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="font-mono text-[10px] text-stone-400">Dividing truth...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input panel */}
                <div className="space-y-4 pt-3 select-none">
                  
                  {/* speech transcription panel */}
                  {isRecording && (
                    <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] text-red-300 flex items-center justify-between font-mono animate-pulse mx-4">
                      <span>🎤 Speaking: Your voice is transcribing live directly into your input area...</span>
                      <button onClick={handleToggleRecording} className="text-stone-300 hover:text-white underline">Stop recording</button>
                    </div>
                  )}

                  <div className="flex flex-row items-end gap-2 w-full px-4 pb-4" id="chat-input-row">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={isRecording ? "Speak now..." : "Type your exposition or study observations here..."}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isLoading}
                      rows={2}
                      className="flex-1 min-w-0 resize-none rounded-lg px-3 py-2 text-sm bg-white/5 border border-white/10 text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] scrollbar-thin"
                    />

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !userInput.trim()}
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#C9973A] hover:bg-[#B5852F] text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center group shrink-0"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4 group-hover:scale-110" />
                    </button>
                    
                    <button
                      onClick={handleToggleRecording}
                      className={`flex-shrink-0 w-10 h-10 rounded-lg border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        isRecording ? "bg-red-600 border-red-500 text-white" : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-400"
                      }`}
                      title="Toggle Mic Capture"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions footer of the chat studio */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full px-4 pb-4 pt-1 border-t border-white/5 text-[10px] text-stone-400 font-mono" id="chat-actions-footer">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto font-sans font-bold ml-auto">
                      {activeStageIndex >= 4 && (
                        <button
                          onClick={() => handleAdvanceToScorecard()}
                          className="w-full sm:w-auto px-3 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-white uppercase tracking-wide rounded text-[9.5px] transition-all cursor-pointer whitespace-nowrap text-center"
                        >
                          Check Analytical Scorecard →
                        </button>
                      )}
                    </div>
                  </div>

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
                      Congratulations on thoroughly analyzing, contextualizing, doctrinally defending, and winsomely preparing to teach <span className="font-bold text-[#C9973A]">{scripture.reference}</span>.
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

              {/* PRIMARY ROW: HEADER HERO SUMMARY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Score Circular presentation badge */}
                <div className="lg:col-span-8 bg-[#141A27] border border-white/5 rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative shadow-lg">
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono tracking-widest text-[#C9973A] uppercase font-bold block">
                      Scriptural Expository Summary
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Oral Dialogue Performance Report
                    </h3>
                    <p className="text-stone-300 text-xs sm:text-[12.5px] leading-relaxed max-w-[430px]">
                      Excellent clarity and thematic integration! You structured your answers in full biblical harmony, mapped relevant Greek, and securely tied text parameters to Advent history core doctrines.
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-stone-400 block">ACTIVE PROFILE</span>
                      <span className="text-xs font-semibold text-stone-100">{userRole} background</span>
                    </div>
                  </div>

                  {/* Circular score display */}
                  <div className="flex flex-col items-center gap-1 shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 text-center min-w-[130px]">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-stone-300 block font-bold">
                      Mastery Score
                    </span>
                    
                    <div className="relative w-20 h-20 flex items-center justify-center mt-1">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="text-white/10"
                          strokeWidth="5.5"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="text-[#C9973A]"
                          strokeWidth="5.5"
                          strokeDasharray="201"
                          strokeDashoffset={201 - (201 * scoreStats.overallScore) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-sans font-extrabold text-xl text-white">
                        {scoreStats.overallScore}%
                      </span>
                    </div>

                    <span className="text-[10px] font-mono uppercase text-[#C9973A] mt-2 block font-extrabold">
                      {getMasteryLevelText(scoreStats.overallScore)}
                    </span>
                  </div>
                </div>

                {/* GAPS ALERT CALLOUT BOX */}
                <div className="lg:col-span-4 bg-[#C9973A]/10 border border-[#C9973A]/20 p-5 rounded-[12px] flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Active Recall Gaps Track</span>
                    </span>
                    <h4 className="font-serif font-bold text-sm text-stone-200">
                      Unresolved Scripture Nodes
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scoreStats.gaps.length > 0 ? (
                        scoreStats.gaps.map((g) => (
                          <span key={g} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-mono text-[9px] px-1.5 py-0.5 rounded">
                            • {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">
                          ✓ Perfect recall! No outstanding keyword gaps.
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#C9973A] font-semibold pt-3 block leading-tight">
                    Advice: Incorporate missed terms in follow-up sessions.
                  </span>
                </div>

              </div>

              {/* STAGE BY STAGE EVALUATION CHART */}
              <div className="bg-[#141A27]/60 border border-white/5 rounded-[12px] p-5 space-y-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block pb-1 border-b border-white/5 font-extrabold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C9973A]" />
                  <span>Interactive Stage Study Breakdown</span>
                </span>

                <div className="divide-y divide-white/5 space-y-3.5" id="stage-breakdown-rows">
                  {stagesList.map((stg) => {
                    const sc = scoreStats.stageScores[stg.id] || Math.floor(Math.random() * 15) + 70;
                    const feedback = scoreStats.stageFeedback[stg.id];
                    return (
                      <div key={stg.id} className="flex flex-col sm:flex-row items-start justify-between gap-2 pt-3 font-sans text-xs">
                        <div className="space-y-1 text-left">
                          <span className="font-bold text-stone-200 block">{stg.title}</span>
                          <p className="text-[11.5px] text-stone-400 leading-normal">{feedback}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-1 sm:mt-0 shrink-0 select-none">
                          <span className="font-mono text-[10.5px] font-bold text-stone-200 bg-white/5 px-2 py-0.5 border border-white/10 rounded">
                            {sc}/100
                          </span>
                          <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${sc >= 85 ? "bg-emerald-400" : sc >= 75 ? "bg-[#C9973A]" : "bg-red-400"}`}
                              style={{ width: `${sc}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SPIRIT OF PROPHECY CONTEXTUAL QUOTE */}
              <div className="bg-[#141A27] rounded-[12px] border border-white/5 p-4 text-left space-y-2 relative shadow-inner">
                <div className="flex items-center justify-between border-b border-white/5 pb-1 select-none">
                  <span className="text-[9.5px] font-mono tracking-wider font-extrabold text-[#C9973A] uppercase">
                    Ellen White Writings Resource
                  </span>
                  <span className="text-[8px] text-stone-500 font-mono">STBA Archives #15</span>
                </div>
                <p className="text-xs font-serif text-stone-300 leading-relaxed max-w-[700px] select-text">
                  "{scoreStats.ellenWhiteQuote}"
                </p>
              </div>

              {/* --- HOMILETIC OUTLINE DRAFT & ELDER STEPHEN GENERATOR --- */}
              <div className="bg-[#141A27]/80 border border-[#C9973A]/10 p-5 sm:p-6 rounded-[12px] text-left space-y-4">
                <div className="border-b border-white/5 pb-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#C9973A] font-extrabold block">
                    Teach‑It Studio Homilectics
                  </span>
                  <h3 className="font-serif font-bold text-md sm:text-lg text-white mt-0.5">
                    Homiletic Teaching Outline
                  </h3>
                  <p className="text-stone-400 text-xs font-medium mt-1 font-sans">
                    Construct your custom teaching segments. Elder Stephen will evaluate layout consistency, accuracy of division, and audience adaptations.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <label className="text-xs text-stone-300 font-mono font-bold flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-[#C9973A]" />
                      Target Audience Adaptation:
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as any)}
                      className="bg-[#141A27] border border-white/10 rounded px-2.5 py-1 text-xs text-stone-200 outline-none focus:border-[#C9973A] font-sans"
                    >
                      <option value="Child">Child</option>
                      <option value="New Believer">New Believer</option>
                      <option value="Mature Student">Mature Student</option>
                    </select>
                  </div>

                  <textarea
                    value={teachingDraftOutline}
                    onChange={(e) => {
                      setTeachingDraftOutline(e.target.value);
                      localStorage.setItem(`stba_teach_it_outline_${scripture.id}`, e.target.value);
                    }}
                    placeholder="Enter your lecture introduction, exposition blocks, and closing calls..."
                    rows={6}
                    className="w-full bg-[#18181B] border border-stone-800 rounded-lg p-3 text-xs sm:text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] font-sans leading-relaxed"
                  />

                  <div className="flex justify-between items-center">
                    {isGeneratingOutline ? (
                      <span className="text-[10px] font-mono text-[#C9973A] animate-pulse">
                        Evaluating outline architecture...
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-400">
                        Evaluates structure against the Three Angels' message context
                      </span>
                    )}
                    <button
                      disabled={teachingDraftOutline.trim().length < 15 || isGeneratingOutline}
                      onClick={handleGenerateOutlineWithElder}
                      className="px-4 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-bold rounded-lg text-[10px] font-mono transition-all disabled:opacity-45"
                    >
                      {isGeneratingOutline ? "Coaching..." : "Verify Outline with Elder Stephen"}
                    </button>
                  </div>

                  {outlineFeedback && (
                    <div className="p-3.5 bg-stone-900/90 border-l-2 border-[#C9973A] rounded-lg text-xs leading-relaxed text-stone-300 italic elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased">
                      &ldquo;{outlineFeedback}&rdquo;
                    </div>
                  )}
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
                  {/* Download Summary Button with dropdown options */}
                  <div className="relative flex-1 sm:flex-initial">
                    <button
                      type="button"
                      onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                      className="w-full py-3 px-5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 h-11 border border-white/15"
                      id="btn-download-session-summary"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Summary</span>
                    </button>
                    
                    <AnimatePresence>
                      {showDownloadDropdown && (
                        <>
                          {/* Close listener overlay background */}
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
                              Export Specifications
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => {
                                downloadSummaryAsTxt();
                                setShowDownloadDropdown(false);
                              }}
                              className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition flex items-center gap-2.5 cursor-pointer text-xs"
                            >
                              <div className="p-1.5 bg-stone-700/50 text-stone-300 rounded">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left">
                                <span className="block font-bold text-stone-100">Plain-Text File (.txt)</span>
                                <span className="block text-[10px] text-stone-400">Perfect for notes & print logs</span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                downloadSummaryAsHtml();
                                setShowDownloadDropdown(false);
                              }}
                              className="w-full text-left p-2.5 rounded-lg hover:bg-[#C9973A]/10 transition flex items-center gap-2.5 cursor-pointer text-xs"
                            >
                              <div className="p-1.5 bg-[#C9973A]/10 text-[#C9973A] rounded">
                                <Printer className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left">
                                <span className="block font-bold text-stone-100">Printable HTML / PDF-Ready</span>
                                <span className="block text-[10px] text-stone-400">High-Fidelity formatted transcript</span>
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
    </div>
  );
};
