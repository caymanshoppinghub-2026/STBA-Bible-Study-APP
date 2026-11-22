/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Brain,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Award,
  BookOpen,
  ArrowRight,
  EyeOff,
  Search,
  Lock,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2
} from "lucide-react";
import { Scripture } from "../../types";
import { useApp } from "../../context/AppContext";
import { apiFetch, safeParseResponseJson } from "../../lib/apiFetch";
import {
  playTransitionChime,
  playCelebrationChime,
  playGentleNudge,
  playElderBubblePop,
  playUserBubblePop
} from "../../utils/pleasantSounds";
import { bibleService } from "../../services/bibleService";
import {
  decodeAndCleanGeminiPcm,
  encodeFloat32To16kHzPcmBase64
} from "../../utils/cleanGeminiAudio";
import {
  supabase,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_EDGE_FUNCTION_URL,
  buildSupabaseLiveWebSocketUrl,
  getUntruncatedSessionToken
} from "../../lib/supabase";
import elderStephenAvatar from "../../assets/images/elder_steven_portrait_1788201900752.jpg";
import {
  checkVoiceAccessOrPromptUpgrade,
  consumeVoiceSeconds,
  getVoiceQuotaStatus,
  VoiceQuotaStatus,
} from "../../lib/voiceQuotaManager";

interface GeminiRecallModuleProps {
  initialScripture?: Scripture;
  onPracticeInGym?: (scripture: Scripture) => void;
}

interface CuratedRecallPassage extends Scripture {
  thematicContext: string;
}

interface EvaluationResult {
  accuracyScore: number;
  doctrinalAlignmentScore: number;
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
  mnemonicTip: string;
  pastoralEncouragement: string;
}

interface TranscriptEntry {
  id: string;
  sender: "elder" | "user";
  text: string;
  timestamp: string;
}

type RecallPhase = "inquiry" | "study" | "recall" | "evaluated";
type RecallLevel = "beginner" | "scholar";
type LiveVoiceStatus = "idle" | "connecting" | "speaking" | "listening" | "paused" | "error";

const CURATED_RECALL_LIBRARY: CuratedRecallPassage[] = [
  {
    id: "2tim-3-16",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "reproof", "correction", "righteousness"],
    thematicContext:
      "Paul writes to Timothy affirming that all Scripture is God-breathed and equips believers for faithful doctrine and righteous living."
  },
  {
    id: "rev-14-12",
    reference: "Revelation 14:12",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    keywords: ["patience", "saints", "commandments", "faith", "Jesus"],
    thematicContext:
      "The climactic hallmark of God's end-time remnant who persevere in loving obedience through the living faith of Jesus."
  },
  {
    id: "john-3-16",
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    keywords: ["loved", "world", "begotten", "believeth", "perish", "everlasting"],
    thematicContext:
      "Jesus reveals God's self-sacrificing love offering eternal life to everyone who believes in Him."
  },
  {
    id: "ex-20-8",
    reference: "Exodus 20:8-10",
    text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the Lord thy God.",
    keywords: ["Remember", "sabbath", "holy", "labour", "seventh", "Lord"],
    thematicContext:
      "God's perpetual seventh-day Sabbath memorial of Creation and sign of loyalty to the Creator."
  },
  {
    id: "dan-8-14",
    reference: "Daniel 8:14",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    keywords: ["thousand", "three", "hundred", "days", "sanctuary", "cleansed"],
    thematicContext:
      "The 2300-day prophecy pointing to Christ's final high-priestly ministry and cleansing of the heavenly sanctuary."
  },
  {
    id: "psa-119-105",
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    keywords: ["word", "lamp", "feet", "light", "path"],
    thematicContext:
      "Scripture illuminates both our immediate next step and the long-term direction of our walk with God."
  },
  {
    id: "eph-2-8-9",
    reference: "Ephesians 2:8-9",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
    keywords: ["grace", "saved", "faith", "gift", "works", "boast"],
    thematicContext:
      "Salvation is God's free gift by grace through faith, humbling human pride and inspiring grateful obedience."
  },
  {
    id: "isa-8-20",
    reference: "Isaiah 8:20",
    text: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
    keywords: ["law", "testimony", "speak", "according", "word", "light"],
    thematicContext:
      "The supreme benchmark for every spiritual teaching: complete harmony with God's written Law and testimony."
  }
];

/**
 * Extracts a canonical Bible reference from natural spoken or typed text
 * (e.g., "I want to memorize second Timothy chapter 3 verse 16" -> "2 Timothy 3:16").
 */
function extractReferenceFromSpeech(raw: string): string | null {
  const normalized = raw
    .replace(/\b(first|1st)\b/gi, "1")
    .replace(/\b(second|2nd)\b/gi, "2")
    .replace(/\b(third|3rd)\b/gi, "3")
    .replace(/\bpsalms\b/gi, "Psalm")
    .replace(/\brevelations\b/gi, "Revelation")
    .replace(/\bchapter\s+/gi, "")
    .replace(/\bverses?\s+/gi, ":")
    .replace(/\s*:\s*/g, ":");

  const bookPattern =
    "(?:[1-3]\\s*)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)";

  const re = new RegExp(`\\b(${bookPattern})\\s+(\\d+)(?::|\\s+)(\\d+)(?:\\s*(?:-|to|through)\\s*(\\d+))?`, "i");
  const m = normalized.match(re);
  if (!m) return null;
  const book = m[1].replace(/\s+/g, " ").trim();
  const ch = m[2];
  const v1 = m[3];
  const v2 = m[4];
  return v2 ? `${book} ${ch}:${v1}-${v2}` : `${book} ${ch}:${v1}`;
}

/**
 * Conceals exact verbatim scripture wording inside Elder Stephen's speech bubbles
 * so the user cannot visually read/peek at the verse from chat history while memorizing.
 */
function maskScriptureInBubble(
  rawText: string,
  scripture: CuratedRecallPassage | null,
  phase: RecallPhase
): string {
  if (!scripture?.text || !rawText || phase === "evaluated") return rawText;

  const veilLabel =
    phase === "recall"
      ? "[ ✦ Scripture veiled during recall ✦ ]"
      : "[ ✦ Scripture spoken aloud — listen closely ✦ ]";

  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const verseTokens = scripture.text.split(/\s+/).map(cleanWord).filter(Boolean);
  if (verseTokens.length < 3) return rawText;

  // Build 3-word sliding n-grams from the target verse for accurate contiguous span detection
  const verseTrigrams = new Set<string>();
  for (let i = 0; i <= verseTokens.length - 3; i++) {
    verseTrigrams.add(`${verseTokens[i]} ${verseTokens[i + 1]} ${verseTokens[i + 2]}`);
  }
  const verseWordSet = new Set(verseTokens.filter((w) => w.length >= 4));

  // 1. Mask quoted segments that substantially overlap the target verse
  let masked = rawText.replace(/[“"]([^”"]{12,})[”"]/g, (fullMatch, inner) => {
    const innerWords = inner.split(/\s+/).map(cleanWord).filter(Boolean);
    if (innerWords.length < 3) return fullMatch;
    let hits = 0;
    for (let i = 0; i <= innerWords.length - 3; i++) {
      if (verseTrigrams.has(`${innerWords[i]} ${innerWords[i + 1]} ${innerWords[i + 2]}`)) {
        hits++;
      }
    }
    const overlap = innerWords.filter((w: string) => verseWordSet.has(w)).length;
    if (hits > 0 || (verseWordSet.size > 0 && overlap / Math.max(1, innerWords.length) >= 0.45)) {
      return veilLabel;
    }
    return fullMatch;
  });

  // 2. Mask unquoted runs of 3+ consecutive words matching the target verse
  const bubbleTokens = masked.split(/(\s+)/);
  const wordIndices: number[] = [];
  const cleanedWords: string[] = [];
  bubbleTokens.forEach((tok, idx) => {
    if (!/^\s+$/.test(tok) && tok.length > 0) {
      wordIndices.push(idx);
      cleanedWords.push(cleanWord(tok));
    }
  });

  const maskedWordFlags = new Array(cleanedWords.length).fill(false);
  for (let i = 0; i <= cleanedWords.length - 3; i++) {
    const tri = `${cleanedWords[i]} ${cleanedWords[i + 1]} ${cleanedWords[i + 2]}`;
    if (verseTrigrams.has(tri)) {
      maskedWordFlags[i] = true;
      maskedWordFlags[i + 1] = true;
      maskedWordFlags[i + 2] = true;
    }
  }

  if (maskedWordFlags.some(Boolean)) {
    const out: string[] = [];
    let inMask = false;
    let wordCursor = 0;
    for (let i = 0; i < bubbleTokens.length; i++) {
      const tok = bubbleTokens[i];
      if (/^\s+$/.test(tok) || tok.length === 0) {
        if (!inMask) out.push(tok);
      } else {
        const shouldHide = maskedWordFlags[wordCursor++];
        if (shouldHide) {
          if (!inMask) {
            out.push(veilLabel);
            inMask = true;
          }
        } else {
          if (inMask) {
            out.push(" ");
            inMask = false;
          }
          out.push(tok);
        }
      }
    }
    masked = out.join("").replace(/\s+/g, " ").trim();
  }

  return masked;
}

function computeLocalEvaluation(
  scripture: CuratedRecallPassage,
  attempt: string,
  level: RecallLevel,
  firstName: string
): EvaluationResult {
  const cleanTokens = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const targetWords = cleanTokens(scripture.text);
  const userWords = cleanTokens(attempt);
  const userWordSet = new Set(userWords);

  let exactMatches = 0;
  targetWords.forEach((w, i) => {
    if (userWords[i] === w) exactMatches++;
  });
  const bagMatches = targetWords.filter((w) => userWordSet.has(w)).length;

  const sequenceRatio = targetWords.length > 0 ? exactMatches / targetWords.length : 0;
  const overlapRatio = targetWords.length > 0 ? bagMatches / targetWords.length : 0;

  const rawAccuracy =
    level === "scholar"
      ? Math.round((sequenceRatio * 0.7 + overlapRatio * 0.3) * 100)
      : Math.round((overlapRatio * 0.75 + sequenceRatio * 0.25) * 100);

  const accuracyScore = Math.min(100, Math.max(0, rawAccuracy));

  const matchedKeywords = scripture.keywords.filter((kw) =>
    userWordSet.has(kw.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );
  const missedKeywords = scripture.keywords.filter(
    (kw) => !userWordSet.has(kw.toLowerCase().replace(/[^a-z0-9]/g, ""))
  );

  const doctrinalAlignmentScore =
    scripture.keywords.length > 0
      ? Math.round((matchedKeywords.length / scripture.keywords.length) * 100)
      : accuracyScore;

  const threshold = level === "scholar" ? 90 : 70;
  const passed = accuracyScore >= threshold;

  const feedback =
    level === "scholar"
      ? passed
        ? `Outstanding Scholar-level precision, ${firstName}! You captured ${accuracyScore}% verbatim accuracy on ${scripture.reference}.`
        : `Strong scholarly effort, ${firstName} (${accuracyScore}%). Scholar level requires at least 90% word-for-word precision—review: ${missedKeywords.slice(0, 3).join(", ") || "connecting phrases"}.`
      : passed
      ? `Well done, ${firstName}! You achieved ${accuracyScore}% accuracy on ${scripture.reference}, capturing the verse beautifully.`
      : `Steady progress, ${firstName} (${accuracyScore}%). Focus on weaving in these key words next time: ${missedKeywords.slice(0, 3).join(", ") || "the closing phrase"}.`;

  return {
    accuracyScore,
    doctrinalAlignmentScore,
    feedback,
    matchedKeywords,
    missedKeywords,
    mnemonicTip:
      missedKeywords.length > 0
        ? `Anchor your memory around "${missedKeywords[0]}" and recite ${scripture.reference} aloud once more.`
        : `Recite ${scripture.reference} aloud once more to seal it into long-term memory.`,
    pastoralEncouragement: `Keep hiding God's Word in your heart, ${firstName} (Psalm 119:11).`
  };
}

export const GeminiRecallModule: React.FC<GeminiRecallModuleProps> = ({
  onPracticeInGym
}) => {
  const { user, showConfetti, hasTierAccess, openUpgradeModal, userTier } = useApp();
  const firstName = (user?.name || "Friend").trim().split(/\s+/)[0] || "Friend";
  const scholarUnlocked = hasTierAccess("Scholar");

  // Target scripture display remains strictly BLANK until user makes a selection
  const [selectedScripture, setSelectedScripture] = useState<CuratedRecallPassage | null>(null);
  const [phase, setPhase] = useState<RecallPhase>("inquiry");
  const [searchInput, setSearchInput] = useState<string>("");
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [difficulty, setDifficulty] = useState<RecallLevel>(() =>
    hasTierAccess("Scholar") ? "scholar" : "beginner"
  );

  useEffect(() => {
    if (!hasTierAccess("Scholar") && difficulty !== "beginner") {
      setDifficulty("beginner");
    }
  }, [userTier, hasTierAccess, difficulty]);

  const [userRecallAttempt, setUserRecallAttempt] = useState<string>("");
  const [pauseNudge, setPauseNudge] = useState<string | null>(null);
  const [nudgeCount, setNudgeCount] = useState<number>(0);
  const pauseTimerRef = useRef<number | null>(null);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [sessionCompletedCount, setSessionCompletedCount] = useState<number>(0);
  const MAX_SESSION_VERSES = 3;

  // ========================================================
  // ELDER STEPHEN REAL-TIME GEMINI LIVE VOICE SESSION STATE
  // ========================================================
  const [isLiveSessionActive, setIsLiveSessionActive] = useState<boolean>(false);
  const [isLivePaused, setIsLivePaused] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<LiveVoiceStatus>("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [waveBars, setWaveBars] = useState<number[]>(Array(14).fill(6));

  // WebSocket + Real-Time PCM Audio Refs (identical proven transport to TeachItStudio)
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const isElderSpeakingRef = useRef<boolean>(false);
  const bargeInFrameCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const sessionRunIdRef = useRef<number>(0);
  const activeElderBubbleIdRef = useRef<string | null>(null);
  const recentElderTurnTextRef = useRef<string>("");
  const recentUserTurnTextRef = useRef<string>("");

  const isLivePausedRef = useRef<boolean>(false);
  const isMicMutedRef = useRef<boolean>(false);
  const phaseRef = useRef<RecallPhase>(phase);
  const selectedScriptureRef = useRef<CuratedRecallPassage | null>(selectedScripture);
  const difficultyRef = useRef<RecallLevel>(difficulty);
  const userRecallAttemptRef = useRef<string>(userRecallAttempt);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { isLivePausedRef.current = isLivePaused; }, [isLivePaused]);
  useEffect(() => { isMicMutedRef.current = isMicMuted; }, [isMicMuted]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { selectedScriptureRef.current = selectedScripture; }, [selectedScripture]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { userRecallAttemptRef.current = userRecallAttempt; }, [userRecallAttempt]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [transcript]);

  const appendUserBubble = useCallback((spoken: string) => {
    const clean = spoken.trim();
    if (!clean) return;
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      const nowLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (last && last.sender === "user" && last.timestamp === nowLabel) {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...last,
          text: `${last.text} ${clean}`.replace(/\s+/g, " ").trim()
        };
        return copy;
      }
      playUserBubblePop();
      return [
        ...prev.slice(-18),
        {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: "user",
          text: clean,
          timestamp: nowLabel
        }
      ];
    });
  }, []);

  const appendElderBubbleChunk = useCallback((chunk: string) => {
    const textChunk = chunk;
    if (!textChunk.trim()) return;
    setTranscript((prev) => {
      const nowLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (activeElderBubbleIdRef.current) {
        const idx = prev.findIndex((m) => m.id === activeElderBubbleIdRef.current);
        if (idx >= 0) {
          const copy = [...prev];
          const existing = copy[idx].text;
          const needsSpace = existing.length > 0 && !existing.endsWith(" ") && !textChunk.startsWith(" ");
          copy[idx] = {
            ...copy[idx],
            text: `${existing}${needsSpace ? " " : ""}${textChunk}`
          };
          return copy;
        }
      }
      const newId = `elder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      activeElderBubbleIdRef.current = newId;
      playElderBubblePop();
      return [
        ...prev.slice(-18),
        {
          id: newId,
          sender: "elder",
          text: textChunk.trim(),
          timestamp: nowLabel
        }
      ];
    });
  }, []);

  const clearPlaybackQueue = useCallback(() => {
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    activeNodesRef.current = [];
    nextStartTimeRef.current = 0;
    isElderSpeakingRef.current = false;
  }, []);

  const cleanupLiveSession = useCallback(() => {
    sessionRunIdRef.current += 1;
    clearPlaybackQueue();
    activeElderBubbleIdRef.current = null;
    bargeInFrameCountRef.current = 0;

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch {}
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    setIsLiveSessionActive(false);
    setIsLivePaused(false);
    isLivePausedRef.current = false;
    setLiveStatus("idle");
    setWaveBars(Array(14).fill(6));
  }, [clearPlaybackQueue]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupLiveSession();
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current);
      }
    };
  }, [cleanupLiveSession]);

  const sendTextToLiveElder = useCallback((promptText: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ text: promptText }));
      } catch {}
    }
  }, []);

  const initializeAudioContexts = useCallback(() => {
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
  }, []);

  const playPCMChunk = useCallback((base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
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
      setLiveStatus("speaking");
      setWaveBars(Array.from({ length: 14 }, () => Math.floor(Math.random() * 20) + 8));

      sourceNode.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter((n) => n !== sourceNode);
        if (activeNodesRef.current.length === 0 && !isLivePausedRef.current) {
          isElderSpeakingRef.current = false;
          setLiveStatus("listening");
        }
      };
    } catch {}
  }, []);

  const startLiveMicStreaming = useCallback(async () => {
    try {
      initializeAudioContexts();
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
        if (isMicMutedRef.current || isLivePausedRef.current) return;

        // Unlock speaking guard once scheduled audio finishes
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

        // Require sustained loud speech (2 consecutive frames > 0.13 RMS) to barge in while Elder Stephen is speaking,
        // preventing speaker echo or bubble-pop chimes from causing stutter/self-interruption while keeping real interruptions smooth!
        if (isElderSpeakingRef.current) {
          if (rms > 0.13) {
            bargeInFrameCountRef.current += 1;
          } else {
            bargeInFrameCountRef.current = 0;
          }
        } else {
          bargeInFrameCountRef.current = 0;
        }
        const isUserBargingIn = bargeInFrameCountRef.current >= 2;
        const shouldSuppressEcho = isElderSpeakingRef.current && !isUserBargingIn;

        if (!shouldSuppressEcho) {
          if (rms > 0.015) {
            setWaveBars(
              Array.from({ length: 14 }, (_, idx) => {
                const centerWeight = 1 - Math.abs(idx - 6.5) / 8;
                return Math.max(6, Math.min(32, Math.floor(rms * 180 * (0.6 + centerWeight * 0.6))));
              })
            );
          } else if (!isElderSpeakingRef.current) {
            setWaveBars(Array(14).fill(6));
          }
        }

        const samplesToSend = shouldSuppressEcho
          ? new Float32Array(floatSamples.length)
          : floatSamples;
        const base64 = encodeFloat32To16kHzPcmBase64(samplesToSend, actualSampleRate);

        try {
          wsRef.current.send(
            JSON.stringify({
              audio: base64,
              mimeType: "audio/pcm;rate=16000"
            })
          );
        } catch {}
      };
    } catch (err: any) {
      const denied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      setLiveError(
        denied
          ? "Microphone permission was blocked. Allow microphone access in your browser address bar, then start the session again."
          : "Could not access your microphone. Check your audio input device or use the controls below."
      );
    }
  }, [initializeAudioContexts]);

  // ========================================================
  // SCRIPTURE SELECTION & PHASE FLOW (SYNCED WITH LIVE VOICE)
  // ========================================================
  const handleSelectScripture = useCallback(
    async (rawQueryOrPassage: string | CuratedRecallPassage, options?: { fromVoice?: boolean }) => {
      setLookupError(null);
      setEvaluationResult(null);
      setUserRecallAttempt("");
      userRecallAttemptRef.current = "";
      setPauseNudge(null);
      setNudgeCount(0);

      const activatePassage = (passage: CuratedRecallPassage) => {
        playTransitionChime();
        setSelectedScripture(passage);
        selectedScriptureRef.current = passage;
        setPhase("study");
        phaseRef.current = "study";
        setSearchInput("");
        if (!options?.fromVoice) {
          sendTextToLiveElder(
            `The student just selected ${passage.reference}: "${passage.text}". Warmly confirm their choice, read the exact verse aloud clearly, ask ${firstName} to listen carefully and repeat it aloud with you, and then invite them to hide it on screen and recite it from memory.`
          );
        }
      };

      if (typeof rawQueryOrPassage !== "string") {
        activatePassage(rawQueryOrPassage);
        return;
      }

      const query = rawQueryOrPassage.trim();
      if (!query) return;

      const lower = query.toLowerCase();
      const match = CURATED_RECALL_LIBRARY.find(
        (p) => p.reference.toLowerCase() === lower || p.reference.toLowerCase().includes(lower)
      );
      if (match) {
        activatePassage(match);
        return;
      }

      setIsLookingUp(true);
      try {
        const passage = await bibleService.getPassage(query, "KJV");
        const verseText = (passage?.text || "").replace(/\s+/g, " ").trim();
        const lowerText = verseText.toLowerCase();
        const isInvalid =
          !verseText ||
          verseText.length < 10 ||
          lowerText.includes("invalid scripture") ||
          lowerText.includes("unavailable") ||
          lowerText.includes("unable to load") ||
          lowerText.includes("could not be loaded") ||
          lowerText.includes("not found");

        if (!isInvalid) {
          const words = verseText
            .replace(/[^a-zA-Z\s]/g, "")
            .split(/\s+/)
            .filter((w: string) => w.length >= 5);
          activatePassage({
            id: `custom-${Date.now()}`,
            reference: passage?.reference || query,
            text: verseText,
            keywords: Array.from(new Set(words)).slice(0, 6) as string[],
            thematicContext: `A foundational passage from ${passage?.reference || query} to hide in your heart.`
          });
          return;
        }
        setLookupError(`Could not find "${query}". Try a reference like "2 Timothy 3:16" or "Revelation 14:12".`);
      } catch {
        setLookupError(`Unable to look up "${query}" right now. Try selecting one of the verses below.`);
      } finally {
        setIsLookingUp(false);
      }
    },
    [sendTextToLiveElder]
  );

  const handleBeginVerbatimRecall = useCallback(
    (fromVoice = false) => {
      const target = selectedScriptureRef.current;
      playTransitionChime();
      setPhase("recall");
      phaseRef.current = "recall";
      setPauseNudge(null);
      setNudgeCount(0);
      setUserRecallAttempt("");
      userRecallAttemptRef.current = "";

      if (target && !fromVoice) {
        sendTextToLiveElder(
          `${target.reference} is now hidden on screen. Invite ${firstName} warmly to recite ${target.reference} aloud from memory and listen carefully to help them master it.`
        );
      }
    },
    [firstName, sendTextToLiveElder]
  );

  const handleResetToInquiry = useCallback(() => {
    playTransitionChime();
    setSelectedScripture(null);
    selectedScriptureRef.current = null;
    setPhase("inquiry");
    phaseRef.current = "inquiry";
    setUserRecallAttempt("");
    userRecallAttemptRef.current = "";
    setEvaluationResult(null);
    setPauseNudge(null);
    setSearchInput("");
    setLookupError(null);
    sendTextToLiveElder(`Ask ${firstName} which scripture passage they would like to memorize next.`);
  }, [firstName, sendTextToLiveElder]);

  const handleRequestManualNudge = useCallback(() => {
    const target = selectedScriptureRef.current;
    if (!target) return;
    const opening = target.text.split(/\s+/).slice(0, 4).join(" ");
    const msg =
      difficultyRef.current === "beginner"
        ? `Gentle hint, ${firstName}: "${opening}..." — ${target.thematicContext}`
        : `Scholar cue, ${firstName}: ${target.thematicContext}`;
    setPauseNudge(msg);
    playGentleNudge();
    sendTextToLiveElder(
      `Give ${firstName} a brief, encouraging memorization hint for ${target.reference} without reciting the entire verse.`
    );
  }, [firstName, sendTextToLiveElder]);

  const handleEvaluateAttempt = useCallback(
    async (overrideText?: string) => {
      const target = selectedScriptureRef.current;
      const attemptText = (overrideText ?? userRecallAttemptRef.current).trim();
      if (!target || !attemptText) return;

      setIsEvaluating(true);
      setPauseNudge(null);

      try {
        const res = await apiFetch("/api/recall/ai-evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scripture: target,
            userAttempt: attemptText,
            recallMode: difficultyRef.current,
            userName: firstName
          })
        });

        let result: EvaluationResult | null = null;
        if (res.ok) {
          const data = await safeParseResponseJson<any>(res);
          if (data && typeof data.accuracyScore === "number") {
            result = data;
          }
        }
        if (!result) {
          result = computeLocalEvaluation(target, attemptText, difficultyRef.current, firstName);
        }

        setEvaluationResult(result);
        setPhase("evaluated");
        phaseRef.current = "evaluated";

        const passScore = difficultyRef.current === "scholar" ? 90 : 70;
        if (result.accuracyScore >= passScore) {
          playCelebrationChime();
          showConfetti("recall");
          setSessionCompletedCount((prev) => Math.min(MAX_SESSION_VERSES, prev + 1));
        } else {
          playTransitionChime();
        }

        const nextCount = result.accuracyScore >= passScore ? Math.min(MAX_SESSION_VERSES, sessionCompletedCount + 1) : sessionCompletedCount;
        sendTextToLiveElder(
          nextCount >= MAX_SESSION_VERSES
            ? `${firstName} just completed ${target.reference} with ${result.accuracyScore}% accuracy, finishing all ${MAX_SESSION_VERSES} scriptures for this session! Warmly congratulate them and close the session with a brief blessing.`
            : `${firstName} just recited ${target.reference} with ${result.accuracyScore}% accuracy (${nextCount} of ${MAX_SESSION_VERSES} scriptures done in this session). Give warm, brief memorization feedback and ask if they want to recite it again or move to their next verse.`
        );
      } catch {
        const fallback = computeLocalEvaluation(target, attemptText, difficultyRef.current, firstName);
        setEvaluationResult(fallback);
        setPhase("evaluated");
        phaseRef.current = "evaluated";
        playTransitionChime();
      } finally {
        setIsEvaluating(false);
      }
    },
    [firstName, showConfetti, sendTextToLiveElder]
  );

  // Automatic 3-second pause nudge during hidden verbatim recall (triggers Elder Stephen's live verbal cue without taking over)
  useEffect(() => {
    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (phase !== "recall" || !selectedScripture || isLivePaused) {
      setPauseNudge(null);
      return;
    }

    // Trigger after 3.5 seconds of quiet pause during active recitation (or 6s before first word)
    const spokenWords = userRecallAttempt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const pauseDelayMs = spokenWords.length > 0 ? 3500 : 6000;

    pauseTimerRef.current = window.setTimeout(() => {
      if (isElderSpeakingRef.current || isLivePausedRef.current) return;

      const targetTokens = selectedScripture.text.split(/\s+/).filter(Boolean);
      const nextWordIdx = Math.min(targetTokens.length - 1, spokenWords.length);
      const nextWord = (targetTokens[nextWordIdx] || targetTokens[0] || "").replace(/[.,;:!?"]+$/g, "");

      const msg =
        spokenWords.length > 0
          ? `Think carefully, ${firstName}... remember the next word is "${nextWord}". Keep going!`
          : `Take a breath, ${firstName}—start with "${targetTokens.slice(0, 3).join(" ")}..." and keep going!`;

      setPauseNudge(msg);
      setNudgeCount((c) => c + 1);
      playGentleNudge();

      // Prompt Elder Stephen live to speak a brief, gentle 1-sentence nudge and leave the rest to the user
      sendTextToLiveElder(
        spokenWords.length > 0
          ? `${firstName} paused for over 3 seconds while reciting ${selectedScripture.reference}. Gently chime in with a very short nudge like "Think carefully... remember it's '${nextWord}'" and then stop immediately so ${firstName} can finish the rest of the verse on their own.`
          : `${firstName} paused before starting ${selectedScripture.reference}. Give a very short warm nudge with just the first two words ("${targetTokens.slice(0, 2).join(" ")}...") and let ${firstName} recite the rest.`
      );
    }, pauseDelayMs);

    return () => {
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    };
  }, [phase, selectedScripture, userRecallAttempt, difficulty, firstName, nudgeCount, isLivePaused, sendTextToLiveElder]);

  // ========================================================
  // START REAL-TIME GEMINI LIVE WEBSOCKET SESSION (HANDS-FREE)
  // ========================================================
  useEffect(() => {
    if (!isLiveSessionActive || isLivePaused) return;
    const intervalId = window.setInterval(() => {
      const updated = consumeVoiceSeconds(5, userTier);
      if (updated.isExhausted) {
        cleanupLiveSession();
        setLiveError(
          `Your ${updated.tier} monthly Elder Stephen Live Voice allowance (${updated.limitMinutes} mins) has been reached. Upgrade to continue!`
        );
        checkVoiceAccessOrPromptUpgrade(openUpgradeModal, userTier);
      }
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [isLiveSessionActive, isLivePaused, userTier, openUpgradeModal]);

  const handleStartLiveSession = async () => {
    const gate = checkVoiceAccessOrPromptUpgrade(openUpgradeModal, userTier);
    if (!gate.allowed) {
      setLiveError(
        `Your ${gate.status.tier} monthly Elder Stephen Live Voice allowance (${gate.status.limitMinutes} mins) is used up. Please upgrade to continue.`
      );
      return;
    }

    setLiveError(null);
    cleanupLiveSession();
    const runId = ++sessionRunIdRef.current;

    setIsLiveSessionActive(true);
    setIsLivePaused(false);
    isLivePausedRef.current = false;
    setIsMicMuted(false);
    isMicMutedRef.current = false;
    setLiveStatus("connecting");
    playTransitionChime();

    // Unlock audio contexts immediately inside the user's click gesture
    initializeAudioContexts();

    const recallSystemInstruction = `You are Elder Stephen, a dedicated, warm, lively Seventh-day Adventist Scripture Memorization Coach inside StudyToBeApproved.

ABSOLUTE RULE — PURE MEMORIZATION COACH ONLY:
- Your ONLY job here is helping ${firstName} memorize Bible verses word-for-word.
- NEVER deliver exegetical lectures, word studies, sermons, or doctrinal lessons.
- Keep every turn concise, warm, encouraging, and focused 100% on Scripture memory.

MANDATORY 4-STEP MEMORIZATION FLOW (FOLLOW STRICTLY FOR EACH VERSE):
1. GREET & ASK: Begin immediately by warmly greeting ${firstName} ("Shalom, ${firstName}!") and asking which scripture passage they would like to memorize today.
2. READ ALOUD & REPEAT TOGETHER: As soon as ${firstName} chooses a scripture (e.g., 2 Timothy 3:16, Revelation 14:12, John 3:16):
   - Enthusiastically confirm their choice.
   - Read the ENTIRE exact verse aloud slowly and clearly so they hear every word and rhythm.
   - Explicitly invite ${firstName} to listen carefully and REPEAT the verse aloud WITH you right now.
3. HIDE & SOLO VERBATIM RECALL: Once ${firstName} repeats it with you (or says "Ready" / "Begin" / "Hide it"):
   - Ask ${firstName} if they're ready, tell them you are hiding the scripture on screen, and invite them to try reciting it solo without you!
   - Listen closely as they recite. If they pause for more than 3 seconds on a word, gently chime in with a super brief nudge like "Think carefully... remember it's '[next word]'" and immediately stop so ${firstName} can finish the rest of the verse on their own—NEVER recite the rest of the verse for them!
   - Rigidity: ${difficultyRef.current === "scholar" ? "Scholar (strict word-for-word precision, 90% mastery)" : "Beginner (warm, encouraging guidance, 70% mastery)"}.
4. CELEBRATE & PROGRESS (UP TO 3 SCRIPTURES PER SESSION):
   - When ${firstName} finishes reciting, praise what they got right, gently note any missed words, and invite them to either recite it once more or move on to the next scripture.
   - A session covers up to 3 scriptures total. Once ${firstName} memorizes 3 scriptures in this session, celebrate warmly and conclude the session.`;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const studyContext = {
        mode: "recall",
        userName: firstName,
        reference: selectedScriptureRef.current?.reference || undefined,
        passageText: selectedScriptureRef.current?.text || undefined
      };

      const wsUrl = buildSupabaseLiveWebSocketUrl(
        studyContext,
        SUPABASE_EDGE_FUNCTION_URL || `${SUPABASE_URL}/functions/v1/gemini-live-relay`
      );
      const localLiveWsUrl = `${protocol}//${window.location.host}/api/study/live?mode=recall&userName=${encodeURIComponent(firstName)}`;

      let accessToken = await getUntruncatedSessionToken();
      if (!accessToken) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          accessToken = session?.access_token ? String(session.access_token).trim() : SUPABASE_PUBLISHABLE_KEY;
        } catch {
          accessToken = SUPABASE_PUBLISHABLE_KEY;
        }
      }

      if (!isMountedRef.current || runId !== sessionRunIdRef.current) return;

      const setupPayload = {
        type: "setup",
        model: "models/gemini-3.8-live",
        persona: "Elder Stephen",
        mode: "recall",
        reference: selectedScriptureRef.current?.reference || "",
        passageText: selectedScriptureRef.current?.text || "",
        accessToken: accessToken || undefined,
        systemInstruction: recallSystemInstruction,
        setup: {
          model: "models/gemini-3.8-live",
          systemInstruction: {
            role: "system",
            parts: [{ text: recallSystemInstruction }]
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
          systemInstruction: recallSystemInstruction
        }
      };

      const isLocalHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const openSocket = (targetUrl: string, allowFallback: boolean) => {
        if (!isMountedRef.current || runId !== sessionRunIdRef.current) return;
        const isLocal = targetUrl === localLiveWsUrl;
        const ws = !isLocal && accessToken ? new WebSocket(targetUrl, [accessToken]) : new WebSocket(targetUrl);
        wsRef.current = ws;
        let hasOpened = false;
        let isDisposed = false;
        let fallbackTriggered = false;
        let heartbeatTimer: number | null = null;

        const disposeHandlers = () => {
          isDisposed = true;
          if (heartbeatTimer !== null) {
            window.clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
        };

        const triggerFallbackOnce = () => {
          if (fallbackTriggered || isDisposed || !isMountedRef.current || runId !== sessionRunIdRef.current) return;
          fallbackTriggered = true;
          disposeHandlers();
          if (wsRef.current === ws) wsRef.current = null;
          try {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
              ws.close();
            }
          } catch {}
          if (!hasOpened && allowFallback) {
            const nextUrl = isLocal ? wsUrl : localLiveWsUrl;
            if (nextUrl && /^wss?:\/\//i.test(nextUrl)) {
              openSocket(nextUrl, false);
              return;
            }
          }
          setLiveError("Unable to connect to Elder Stephen's live voice stream. Please try again.");
          setLiveStatus("error");
          setIsLiveSessionActive(false);
        };

        ws.onopen = () => {
          if (isDisposed || !isMountedRef.current || runId !== sessionRunIdRef.current) {
            disposeHandlers();
            try { ws.close(); } catch {}
            return;
          }
          hasOpened = true;
          try {
            ws.send(JSON.stringify(setupPayload));
          } catch {}
          heartbeatTimer = window.setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              try {
                ws.send(JSON.stringify({ type: "ping" }));
              } catch {}
            }
          }, 20000);
        };

        ws.onmessage = (event) => {
          if (isDisposed || !isMountedRef.current || runId !== sessionRunIdRef.current) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.heartbeat || msg.setupAck) return;

            if (msg.error) {
              if (!hasOpened && allowFallback) {
                triggerFallbackOnce();
                return;
              }
              setLiveError(msg.error);
              setLiveStatus("error");
              return;
            }

            if (msg.ready) {
              setLiveStatus("listening");
              startLiveMicStreaming();
              return;
            }

            if (msg.userTranscript) {
              const spoken = String(msg.userTranscript).trim();
              if (spoken) {
                activeElderBubbleIdRef.current = null;
                recentElderTurnTextRef.current = "";
                recentUserTurnTextRef.current = `${recentUserTurnTextRef.current} ${spoken}`.trim().slice(-200);
                const combinedUserUtterance = recentUserTurnTextRef.current;
                appendUserBubble(spoken);

                // 1. Detect spoken Bible reference (outside active hidden recall)
                const detectedRef = extractReferenceFromSpeech(combinedUserUtterance);
                if (
                  detectedRef &&
                  phaseRef.current !== "recall" &&
                  selectedScriptureRef.current?.reference.toLowerCase() !== detectedRef.toLowerCase()
                ) {
                  recentUserTurnTextRef.current = "";
                  handleSelectScripture(detectedRef, { fromVoice: true });
                } else if (
                  phaseRef.current === "study" &&
                  /\b(hide|hide it|yes|yeah|yep|sure|okay|ok|ready|begin|start|go ahead|quiz|recite|let'?s go)\b/i.test(combinedUserUtterance)
                ) {
                  // 2. Immediately hide the scripture on screen when user confirms/asks to hide it!
                  recentUserTurnTextRef.current = "";
                  handleBeginVerbatimRecall(true);
                } else if (phaseRef.current === "recall") {
                  const updated = userRecallAttemptRef.current
                    ? `${userRecallAttemptRef.current.trim()} ${spoken}`
                    : spoken;
                  setUserRecallAttempt(updated);
                  userRecallAttemptRef.current = updated;
                }
              }
            }

            if (msg.audio) {
              playPCMChunk(msg.audio);
            }

            if (msg.text) {
              const elderChunk = String(msg.text);
              recentUserTurnTextRef.current = "";
              recentElderTurnTextRef.current = `${recentElderTurnTextRef.current} ${elderChunk}`.trim().slice(-400);
              const combinedElderTurn = recentElderTurnTextRef.current;

              // Sync UI if Elder Stephen confirms a chosen reference while none is loaded yet
              if (phaseRef.current === "inquiry" && !selectedScriptureRef.current) {
                const elderDetectedRef = extractReferenceFromSpeech(combinedElderTurn);
                if (elderDetectedRef) {
                  handleSelectScripture(elderDetectedRef, { fromVoice: true });
                }
              }

              // Sync UI if Elder Stephen confirms he is hiding the scripture now!
              if (
                phaseRef.current === "study" &&
                /\b(i'?ve hidden|i am hiding|i'?m hiding|now hidden|hidden on screen|hidden the scripture|hid the scripture|text is hidden|verse is hidden|hiding the text|hiding the scripture|hiding it now)\b/i.test(
                  combinedElderTurn
                )
              ) {
                handleBeginVerbatimRecall(true);
              }

              setLiveStatus("speaking");
              appendElderBubbleChunk(elderChunk);
            }

            if (msg.turnComplete) {
              activeElderBubbleIdRef.current = null;
              recentElderTurnTextRef.current = "";
              if (activeNodesRef.current.length === 0 && !isLivePausedRef.current) {
                isElderSpeakingRef.current = false;
                setLiveStatus("listening");
              }
            }

            if (msg.interrupted) {
              clearPlaybackQueue();
              activeElderBubbleIdRef.current = null;
              setLiveStatus("listening");
            }

            if (msg.closed) {
              cleanupLiveSession();
            }
          } catch {}
        };

        ws.onerror = () => {
          triggerFallbackOnce();
        };

        ws.onclose = () => {
          if (isDisposed || !isMountedRef.current || runId !== sessionRunIdRef.current) return;
          disposeHandlers();
          if (!hasOpened && allowFallback) {
            triggerFallbackOnce();
            return;
          }
          if (hasOpened) {
            cleanupLiveSession();
            setLiveError("Elder Stephen's live voice session timed out after inactivity. Click Start Live Session to reconnect.");
            setLiveStatus("error");
          }
        };
      };

      if (isLocalHost) {
        openSocket(localLiveWsUrl, Boolean(wsUrl && /^wss?:\/\//i.test(wsUrl)));
      } else if (wsUrl && /^wss?:\/\//i.test(wsUrl)) {
        openSocket(wsUrl, true);
      } else {
        openSocket(localLiveWsUrl, false);
      }
    } catch (err: any) {
      setLiveError(err?.message || "Failed to start live voice session.");
      setLiveStatus("error");
    }
  };

  const handleTogglePauseLive = () => {
    if (!isLiveSessionActive) return;
    const nextPaused = !isLivePaused;
    setIsLivePaused(nextPaused);
    isLivePausedRef.current = nextPaused;
    if (nextPaused) {
      if (outputAudioCtxRef.current && outputAudioCtxRef.current.state === "running") {
        outputAudioCtxRef.current.suspend().catch(() => {});
      }
      setLiveStatus("paused");
    } else {
      if (outputAudioCtxRef.current && outputAudioCtxRef.current.state === "suspended") {
        outputAudioCtxRef.current.resume().catch(() => {});
      }
      setLiveStatus(isElderSpeakingRef.current ? "speaking" : "listening");
    }
  };

  const handleToggleMicMute = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    isMicMutedRef.current = nextMuted;
  };

  return (
    <div
      className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-5 font-lato"
      style={{ fontFamily: "'Lato', ui-sans-serif, system-ui, sans-serif" }}
      id="gemini-recall-module-root"
    >
      {/* ========================================================
          CLEAN COMPACT HEADER + SUBTLE SCHOLAR ICON + TARGET SCRIPTURE
          ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-[#DFC57B]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFC57B] bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              GEMINI RECALL AI
            </span>
            <button
              id="btn-gemini-scholar-badge"
              type="button"
              onClick={() => {
                if (!scholarUnlocked) {
                  openUpgradeModal("Scholar", "Scholar Verbatim Precision (90% Mastery)");
                  return;
                }
                playTransitionChime();
                setDifficulty((prev) => (prev === "scholar" ? "beginner" : "scholar"));
              }}
              title={
                scholarUnlocked
                  ? difficulty === "scholar"
                    ? "Scholar Precision Active (90% Mastery) — click to switch to Beginner"
                    : "Click to enable Scholar Precision (90% Mastery)"
                  : "Upgrade to Scholar Tier for strict 90% verbatim precision"
              }
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                scholarUnlocked && difficulty === "scholar"
                  ? "bg-[#DFC57B]/20 text-[#F3CF65] border-[#DFC57B]/70"
                  : "bg-[#06162c] text-stone-300 border-stone-700 hover:border-[#DFC57B]/70 hover:text-[#F3CF65]"
              }`}
            >
              {scholarUnlocked ? (
                <Brain className="w-3 h-3 text-[#DFC57B]" />
              ) : (
                <Lock className="w-2.5 h-2.5 text-[#DFC57B]" />
              )}
              <span>{scholarUnlocked ? (difficulty === "scholar" ? "Scholar" : "Beginner") : "Scholar"}</span>
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Conversational Scripture Memorization Coach
          </h2>
        </div>

        {/* TARGET SCRIPTURE BADGE (Blank until selected) */}
        <div
          className={`px-4 py-2 rounded-xl text-center min-w-[155px] shrink-0 border-2 transition-all ${
            selectedScripture
              ? "bg-[#0d3060]/80 border-[#F3CF65] shadow-[0_0_14px_rgba(243,207,101,0.28)]"
              : "bg-[#06162c] border-[#DFC57B]/50"
          }`}
          id="gemini-target-scripture-badge"
        >
          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">
            TARGET SCRIPTURE
          </span>
          <span className="text-sm font-bold text-[#F3CF65]">
            {selectedScripture ? selectedScripture.reference : "—"}
          </span>
        </div>
      </div>

      {/* ========================================================
          UNIFIED ELDER STEPHEN LIVE CONVERSATIONAL STUDIO
          (Portrait Image + Hands-Free Gemini Live + 16px Lato Bubbles)
          ======================================================== */}
      <div
        className={`rounded-2xl border-2 overflow-hidden transition-all ${
          isLiveSessionActive
            ? "bg-[#0B111E] border-[#DFC57B]/85 shadow-[0_0_24px_rgba(223,197,123,0.16)]"
            : "bg-[#0B101B] border-stone-800"
        }`}
        id="elder-stephen-live-recall-console"
      >
        {/* TOP STUDIO CONTROL BAR WITH ELDER STEPHEN PORTRAIT */}
        <div className="px-4 py-3.5 bg-[#06162c]/90 border-b border-stone-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full shrink-0">
              {liveStatus === "speaking" && (
                <span className="absolute -inset-1 rounded-full border-2 border-[#F3CF65] animate-ping opacity-45" />
              )}
              {liveStatus === "listening" && (
                <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-40" />
              )}
              <img
                src={elderStephenAvatar}
                alt="Elder Stephen"
                id="elder-stephen-recall-avatar"
                className={`w-12 h-12 rounded-full object-cover object-top border-2 shadow-[0_0_14px_rgba(223,197,123,0.35)] ${
                  liveStatus === "listening"
                    ? "border-emerald-400"
                    : "border-[#DFC57B]"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[16px] font-bold text-white">Elder Stephen</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0B1324] text-[#DFC57B] border border-[#DFC57B]/40">
                  {sessionCompletedCount} / {MAX_SESSION_VERSES} Verses
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    liveStatus === "speaking"
                      ? "bg-[#DFC57B]/15 text-[#F3CF65] border-[#DFC57B]/60"
                      : liveStatus === "listening"
                      ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/50"
                      : liveStatus === "connecting"
                      ? "bg-sky-950/70 text-sky-300 border-sky-500/50"
                      : liveStatus === "paused"
                      ? "bg-amber-950/70 text-amber-300 border-amber-500/50"
                      : liveStatus === "error"
                      ? "bg-rose-950/70 text-rose-300 border-rose-500/50"
                      : "bg-stone-900 text-stone-400 border-stone-700"
                  }`}
                  id="elder-live-status-pill"
                >
                  {liveStatus === "speaking"
                    ? "Speaking..."
                    : liveStatus === "listening"
                    ? "Listening..."
                    : liveStatus === "connecting"
                    ? "Connecting..."
                    : liveStatus === "paused"
                    ? "Paused"
                    : liveStatus === "error"
                    ? "Error"
                    : "Ready"}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {!isLiveSessionActive
                  ? "Click Start Live Voice Session to begin memorizing Scripture aloud."
                  : liveStatus === "connecting"
                  ? "Connecting to Elder Stephen's live voice..."
                  : liveStatus === "speaking"
                  ? "Elder Stephen is guiding your memorization..."
                  : liveStatus === "listening"
                  ? isMicMuted
                    ? "Microphone muted."
                    : "Speak freely—Elder Stephen is listening live."
                  : liveStatus === "paused"
                  ? "Session paused — tap Resume to continue."
                  : liveError || "Connection interrupted."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
            {isLiveSessionActive && (
              <div className="flex items-center gap-0.5 h-7 px-1.5" aria-hidden="true">
                {waveBars.map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-100 ${
                      liveStatus === "listening"
                        ? "bg-emerald-400"
                        : liveStatus === "speaking"
                        ? "bg-[#DFC57B]"
                        : "bg-stone-600"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            )}

            {!isLiveSessionActive ? (
              <button
                id="btn-start-live-recall-session"
                type="button"
                onClick={handleStartLiveSession}
                className="min-h-[40px] px-4 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_16px_rgba(223,197,123,0.35)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Voice Session</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  id="btn-pause-resume-live-recall"
                  type="button"
                  onClick={handleTogglePauseLive}
                  className="min-h-[38px] px-3.5 py-1.5 bg-[#0d3060] hover:bg-[#134280] text-white border border-[#DFC57B] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isLivePaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#DFC57B] fill-current" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#DFC57B]" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-toggle-mic-live-recall"
                  type="button"
                  onClick={handleToggleMicMute}
                  title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isMicMuted
                      ? "bg-stone-900 border-stone-700 text-stone-400 hover:text-white"
                      : "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60"
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isMicMuted ? "Muted" : "Mic On"}</span>
                </button>

                <button
                  id="btn-stop-live-recall-session"
                  type="button"
                  onClick={cleanupLiveSession}
                  className="min-h-[38px] px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-500/60 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            CONVERSATIONAL SPEECH-BUBBLE CANVAS (INITIALLY BLANK; 16px LATO)
            ======================================================== */}
        <div
          className="p-4 sm:p-5 space-y-4 min-h-[180px] max-h-[540px] overflow-y-auto"
          id="elder-live-transcript"
        >
          {/* Live Speech Bubbles Feed (16px Lato; exact verse words masked in Elder Stephen's bubbles) */}
          <AnimatePresence initial={false}>
            {transcript.map((entry) => {
              const displayText =
                entry.sender === "elder"
                  ? maskScriptureInBubble(entry.text, selectedScripture, phase)
                  : phase === "recall"
                  ? maskScriptureInBubble(entry.text, selectedScripture, phase)
                  : entry.text;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22 }}
                  className={`flex ${entry.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3.5 shadow-md ${
                      entry.sender === "elder"
                        ? "rounded-tl-sm bg-[#161D2B] border border-[#DFC57B]/45 text-stone-100"
                        : "rounded-tr-sm bg-[#0d3060] border border-sky-400/50 text-white"
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider font-bold block mb-1 text-[#DFC57B]">
                      {entry.sender === "elder" ? "Elder Stephen" : firstName} · {entry.timestamp}
                    </span>
                    <p className="text-[16px] leading-relaxed font-lato">{displayText}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* PHASE 2 INLINE SCRIPTURE CARD (Highlighted Verse + Brief Context + Hide/Begin) */}
          {phase === "study" && selectedScripture && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[#0B1324] border-2 border-[#F3CF65]/85 p-5 space-y-4 shadow-[0_0_20px_rgba(243,207,101,0.16)]"
              id="gemini-study-card"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#F3CF65] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedScripture.reference}</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      sendTextToLiveElder(
                        `Please read ${selectedScripture.reference} aloud once more clearly: "${selectedScripture.text}"`
                      )
                    }
                    className="text-xs font-bold text-[#DFC57B] hover:text-[#F3CF65] flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToInquiry}
                    className="text-xs text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <p className="text-[18px] sm:text-[19px] font-bold text-white leading-relaxed text-center py-1 font-lato">
                "{selectedScripture.text}"
              </p>

              <p className="text-[14px] text-stone-300 leading-relaxed bg-[#06162c]/90 border border-[#DFC57B]/30 rounded-xl px-4 py-2.5 font-lato">
                <strong className="text-[#DFC57B]">Context:</strong> {selectedScripture.thematicContext}
              </p>

              <div className="flex justify-center pt-1">
                <button
                  id="btn-gemini-hide-and-recall"
                  type="button"
                  onClick={() => handleBeginVerbatimRecall(false)}
                  className="px-6 py-2.5 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Scripture & Begin Recall</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PHASE 3 INLINE LIVE USER SPEECH BUBBLE (Scripture Hidden — Fills Out Live As You Speak or Type) */}
          {phase === "recall" && selectedScripture && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
              id="gemini-recall-phase-card"
            >
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#161D2B]/80 border border-dashed border-[#DFC57B]/50 text-xs font-bold text-[#DFC57B]">
                <EyeOff className="w-3.5 h-3.5" />
                <span>{selectedScripture.reference} is hidden — speak freely or type from memory</span>
              </div>

              <AnimatePresence>
                {pauseNudge && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex justify-start"
                    id="gemini-pause-nudge"
                  >
                    <div className="max-w-[90%] sm:max-w-[82%] rounded-2xl rounded-tl-sm px-4 py-3 bg-[#06162c] border border-[#DFC57B]/70 text-stone-100 shadow-md">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-[#F3CF65] flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 animate-pulse" />
                        <span>Elder Stephen · Nudge</span>
                      </span>
                      <p className="text-[16px] leading-relaxed font-lato">{pauseNudge}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <div className="w-full sm:max-w-[88%] rounded-2xl rounded-tr-sm bg-[#0d3060]/90 border-2 border-emerald-400/60 p-4 space-y-3 shadow-[0_0_18px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 flex items-center gap-1.5">
                      <Mic className={`w-3.5 h-3.5 ${liveStatus === "listening" ? "animate-pulse text-emerald-400" : ""}`} />
                      <span>{firstName}'s Live Recitation</span>
                    </span>
                    <span className="text-xs font-bold text-stone-300">
                      {userRecallAttempt.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <textarea
                    value={userRecallAttempt}
                    onChange={(e) => {
                      setUserRecallAttempt(e.target.value);
                      userRecallAttemptRef.current = e.target.value;
                    }}
                    placeholder={`Speak ${selectedScripture.reference} aloud—your words fill in here live—or type directly...`}
                    rows={3}
                    className="w-full bg-[#06162c]/80 border border-stone-700/80 focus:border-[#DFC57B] rounded-xl p-3.5 text-[16px] leading-relaxed text-white placeholder-stone-400 focus:outline-none font-lato"
                    id="gemini-recall-textarea"
                  />

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetToInquiry}
                        className="text-xs text-stone-300 hover:text-white font-bold cursor-pointer"
                      >
                        Change Verse
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestManualNudge}
                        className="text-xs text-[#F3CF65] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Nudge</span>
                      </button>
                    </div>

                    <button
                      id="btn-gemini-submit-recall"
                      type="button"
                      onClick={() => handleEvaluateAttempt()}
                      disabled={!userRecallAttempt.trim() || isEvaluating}
                      className="px-5 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] disabled:opacity-40 text-[#06162c] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      {isEvaluating ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Check My Recall</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 4 INLINE EVALUATION SCORECARD */}
          {phase === "evaluated" && selectedScripture && evaluationResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[#0B1324] border-2 border-[#DFC57B]/80 p-5 space-y-4 shadow-xl"
              id="gemini-evaluation-card"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#F3CF65]" />
                  <h3 className="text-base font-bold text-white">
                    {selectedScripture.reference} · Recall Results
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#06162c] border border-[#DFC57B]/60 rounded-lg text-xs font-bold text-[#F3CF65]">
                    Accuracy: {evaluationResult.accuracyScore}%
                  </span>
                  <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs font-bold text-emerald-300">
                    Doctrinal: {evaluationResult.doctrinalAlignmentScore}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#161D2B] border border-stone-800 rounded-xl text-center">
                <p className="text-[16px] font-bold text-white leading-relaxed font-lato">
                  "{selectedScripture.text}"
                </p>
              </div>

              <p className="text-[16px] text-stone-100 leading-relaxed font-lato">
                {evaluationResult.feedback}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#161D2B] border border-stone-800 rounded-xl">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Captured Keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluationResult.matchedKeywords.length > 0 ? (
                      evaluationResult.matchedKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-600/50 rounded text-xs text-emerald-300 font-bold">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-500">None yet</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#161D2B] border border-stone-800 rounded-xl">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Focus Next Time
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluationResult.missedKeywords.length > 0 ? (
                      evaluationResult.missedKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-950/60 border border-amber-600/50 rounded text-xs text-amber-300 font-bold">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-300 font-bold">All key terms captured!</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 flex-wrap pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBeginVerbatimRecall(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToInquiry}
                    className="px-4 py-2 bg-[#06162c] border border-stone-700 hover:border-[#DFC57B] text-stone-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    New Verse
                  </button>
                </div>
                {onPracticeInGym && (
                  <button
                    type="button"
                    onClick={() => onPracticeInGym(selectedScripture)}
                    className="px-5 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Continue into 4-Step Recall Gym</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {liveError && (
            <p className="text-xs text-amber-300 px-1" id="elder-mic-error-notice">
              {liveError}
            </p>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* ========================================================
            COMPACT BOTTOM SCRIPTURE PICKER BAR (Hidden during active recall to keep view clean & focused)
            ======================================================== */}
        {phase !== "recall" && (
        <div className="px-4 py-3.5 bg-[#06162c]/70 border-t border-stone-800/90 space-y-3" id="gemini-bottom-picker">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSelectScripture(searchInput);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Say or type any scripture reference (e.g., 2 Timothy 3:16, Revelation 14:12, Jeremiah 33:3)..."
                className="w-full bg-[#161D2B] border border-stone-700 focus:border-[#DFC57B] rounded-xl pl-10 pr-4 py-2.5 text-[15px] text-white placeholder-stone-400 outline-none font-lato"
                id="gemini-scripture-input"
              />
            </div>
            <button
              type="submit"
              disabled={!searchInput.trim() || isLookingUp}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#041410] text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              {isLookingUp ? "Finding..." : "Select Scripture"}
            </button>
          </form>

          {lookupError && (
            <p className="text-xs text-amber-400 font-medium">{lookupError}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {CURATED_RECALL_LIBRARY.map((item) => {
              const isSelectedVerse =
                selectedScripture &&
                selectedScripture.reference.toLowerCase() === item.reference.toLowerCase();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectScripture(item)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isSelectedVerse
                      ? "bg-[#DFC57B] text-[#06162c] border-[#F3CF65] shadow-[0_0_10px_rgba(243,207,101,0.35)]"
                      : "bg-[#161D2B] hover:bg-[#0d3060] border-stone-700 hover:border-[#DFC57B] text-stone-200 hover:text-white"
                  }`}
                >
                  {item.reference}
                </button>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
