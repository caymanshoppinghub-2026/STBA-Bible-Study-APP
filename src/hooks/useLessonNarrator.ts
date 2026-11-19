/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  cleanLessonTextForSpokenNarration,
  getMicrosoftEmmaVoice,
  requestAvaLessonNarration
} from "../utils/sabbathAudioNarrator";
import { playGeminiSpeech, stopActiveGeminiSpeech } from "../utils/geminiSpeechPlayer";

export interface NarratorState {
  activeDayIndex: number | null;
  activeLessonTitle: string;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  speed: number;
  narratorVoiceName: string;
}

const initialNarratorState: NarratorState = {
  activeDayIndex: null,
  activeLessonTitle: "",
  isSpeaking: false,
  isPaused: false,
  isLoading: false,
  speed: 1.0,
  narratorVoiceName: "Microsoft Aria (US Neural)"
};

let globalState: NarratorState = { ...initialNarratorState };
const listeners = new Set<(s: NarratorState) => void>();

function updateGlobalState(patch: Partial<NarratorState>) {
  globalState = { ...globalState, ...patch };
  listeners.forEach((fn) => fn(globalState));
}

/**
 * Strips SSML/XML artifacts and overlooks standalone/parenthetical scripture reference citations
 * so Aria US reads Sabbath School lesson body text smoothly without awkward pauses.
 */
function cleanSabbathBodyForAria(rawText: string): string {
  if (!rawText) return "";
  return rawText
    // Remove any SSML/XML tags or leaked voice/prosody attributes
    .replace(/<[^>]+>/g, " ")
    .replace(/\b(?:speak|prosody)\b[^.\n]*?(?:voice|rate)\s*=\s*["']?[^"'\s]+["']?/gi, " ")
    .replace(/\b(?:voice\s*name|voice|rate)\s*=\s*["']?[^"'\s,]+["']?/gi, " ")
    // Remove "Read for This Week's Study: ..." reference header lines
    .replace(/Read for This Week['’]s Study\s*:[^\n]*/gi, " ")
    // Remove parenthetical scripture citations like (Matt. 5:17-48; 1 Cor. 16:20) or (Genesis 1:1)
    .replace(/\(\s*(?:(?:see|cf\.|compare|read|also)\s+)?(?:[1-3]\s*)?[A-Z][a-zA-Z.]{1,14}\s+\d{1,3}\s*:\s*\d{1,3}[^)]*\)/g, " ")
    // Remove standalone reference-only lines like "Matt. 5:17-48, 1 Cor. 16:20, Matt. 4:1-11"
    .replace(/^\s*(?:(?:[1-3]\s*)?[A-Z][a-zA-Z.]{1,14}\s+\d{1,3}\s*:\s*\d{1,3}(?:\s*[-–,]\s*\d{1,3})*(?:\s*[;,]\s*)?)+\s*$/gm, " ")
    // Clean up any leftover empty parentheses or double punctuation
    .replace(/\(\s*[;,.]*\s*\)/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:])\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// Global audio engine references
let globalAudioElement: HTMLAudioElement | null = null;
let globalClauses: string[] = [];
let globalClauseIndex: number = 0;
let globalIsPaused: boolean = false;
let globalIsSpeaking: boolean = false;

// Background prepared narration cache for immediate playback
interface PreparedNarration {
  narrationScript: string;
  audioBase64?: string;
  audioEl?: HTMLAudioElement;
  timestamp: number;
}

const narrationBackgroundCache = new Map<string, PreparedNarration>();
const pendingPreloads = new Set<string>();

/**
 * Prepares narration in the background for instant playback when Read Lesson Aloud is triggered.
 * Automatically pre-caches smoothed spoken text and ensures Web Speech voices are preloaded.
 */
export function prepareNarrationInBackground(dayIndex: number, title: string, content: any): void {
  if (typeof window === "undefined") return;

  // Preload speech synthesis voices in background
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }

  let rawText = "";
  if (Array.isArray(content)) {
    rawText = content
      .map((c) => (typeof c === "string" ? c : c?.text || ""))
      .filter(Boolean)
      .join("\n\n");
  } else if (typeof content === "string") {
    rawText = content;
  } else if (content && typeof content === "object") {
    rawText = content.text || content.body || "";
  }

  if (!rawText.trim()) return;

  const cacheKey = `${dayIndex}_${title.trim().toLowerCase()}`;
  if (narrationBackgroundCache.has(cacheKey)) {
    return;
  }

  // Pre-generate clean body text immediately (skipping scripture reference clutter & SSML)
  const clientSmoothed = cleanSabbathBodyForAria(cleanLessonTextForSpokenNarration(rawText));
  narrationBackgroundCache.set(cacheKey, {
    narrationScript: clientSmoothed,
    timestamp: Date.now()
  });
}

function splitIntoFlowingClauses(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const clauses: string[] = [];
  for (const sent of sentences) {
    if (sent.length > 180) {
      const parts = sent
        .split(/(?<=[,;])\s+/)
        .map((p) => p.trim())
        .filter(Boolean);
      clauses.push(...parts);
    } else {
      clauses.push(sent);
    }
  }

  return clauses.filter((c) => c.length > 0);
}

function stopGlobalNarration() {
  stopActiveGeminiSpeech();
  if (globalAudioElement) {
    globalAudioElement.pause();
    globalAudioElement = null;
  }
  globalIsSpeaking = false;
  globalIsPaused = false;
  globalClauses = [];
  globalClauseIndex = 0;

  updateGlobalState({
    activeDayIndex: null,
    activeLessonTitle: "",
    isSpeaking: false,
    isPaused: false,
    isLoading: false
  });
}

function pauseGlobalNarration() {
  if (globalAudioElement) {
    globalAudioElement.pause();
  } else {
    stopActiveGeminiSpeech();
  }
  globalIsPaused = true;
  updateGlobalState({ isPaused: true });
}

function playNextSpeechClause() {
  if (typeof window === "undefined") {
    stopGlobalNarration();
    return;
  }

  if (globalClauseIndex >= globalClauses.length || globalClauses.length === 0) {
    stopGlobalNarration();
    return;
  }

  const rawClause = globalClauses[globalClauseIndex];
  const clauseText = (rawClause || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\b(?:speak|prosody)\b[^.\n]*?(?:voice|rate)\s*=\s*["']?[^"'\s]+["']?/gi, " ")
    .replace(/\b(?:voice\s*name|voice|rate)\s*=\s*["']?[^"'\s,]+["']?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clauseText) {
    globalClauseIndex += 1;
    playNextSpeechClause();
    return;
  }

  stopActiveGeminiSpeech();

  // Permanently lock Read Lesson narration to Microsoft Aria US (en-US-AriaNeural) — consistent voice across all chunks
  const lessonVoice = "Aria";

  playGeminiSpeech(clauseText, {
    voice: lessonVoice,
    verbatimReadAloud: true,
    rate: globalState.speed,
    onStart: () => {
      if (!globalIsPaused) {
        updateGlobalState({ isSpeaking: true, isPaused: false, isLoading: false });
      }
    },
    onEnd: () => {
      if (globalIsPaused || !globalIsSpeaking) return;
      globalClauseIndex += 1;
      playNextSpeechClause();
    },
    onError: (e) => {
      if (globalIsPaused || !globalIsSpeaking) return;
      console.warn("Speech playback notice:", e);
      globalClauseIndex += 1;
      playNextSpeechClause();
    },
  });
}

function resumeGlobalNarration() {
  if (globalAudioElement) {
    globalAudioElement.play().catch(console.warn);
    globalIsPaused = false;
    updateGlobalState({ isPaused: false, isSpeaking: true });
    return;
  }

  globalIsPaused = false;
  updateGlobalState({ isPaused: false, isSpeaking: true });
  playNextSpeechClause();
}

function startSpeechSynthesis(narrationScript: string) {
  const cleanedBody = cleanSabbathBodyForAria(narrationScript);
  if (!cleanedBody) {
    stopGlobalNarration();
    return;
  }

  // Keep a single full-body script so playGeminiSpeech streams smooth ~650-char chunks with parallel prefetching
  // and ZERO awkward pauses at commas or periods
  globalClauses = [cleanedBody];
  globalClauseIndex = 0;
  globalIsPaused = false;
  globalIsSpeaking = true;

  updateGlobalState({
    isSpeaking: true,
    isPaused: false,
    isLoading: false,
    narratorVoiceName: "Microsoft Aria (US Neural)"
  });
  playNextSpeechClause();
}

export function useLessonNarrator() {
  const [state, setState] = useState<NarratorState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    setState(globalState);

    // Detect Microsoft Emma's voice in browser and listen for voiceschanged
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const checkVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const detected = getMicrosoftEmmaVoice(voices);
        updateGlobalState({
          narratorVoiceName: detected.isEmma ? "Microsoft Emma (Natural)" : detected.voiceName
        });
      };
      checkVoice();
      window.speechSynthesis.addEventListener("voiceschanged", checkVoice);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", checkVoice);
        listeners.delete(setState);
      };
    }

    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setSpeed = useCallback((speed: number) => {
    updateGlobalState({ speed });
    if (globalAudioElement) {
      globalAudioElement.playbackRate = speed;
    }
  }, []);

  const readLesson = useCallback(
    (dayIndex: number, title: string, content: any) => {
      // If already playing this lesson, toggle pause/play
      if (globalState.activeDayIndex === dayIndex && globalState.isSpeaking) {
        if (globalState.isPaused) {
          resumeGlobalNarration();
        } else {
          pauseGlobalNarration();
        }
        return;
      }

      // Stop any current playback
      stopGlobalNarration();

      updateGlobalState({
        activeDayIndex: dayIndex,
        activeLessonTitle: title,
        isLoading: false,
        isSpeaking: true,
        isPaused: false,
        narratorVoiceName: "Microsoft Aria (US Neural)"
      });
      globalIsSpeaking = true;
      globalIsPaused = false;

      // Check background prepared cache for smoothed text
      const cacheKey = `${dayIndex}_${title.trim().toLowerCase()}`;
      const prepared = narrationBackgroundCache.get(cacheKey);

      if (prepared?.narrationScript) {
        startSpeechSynthesis(prepared.narrationScript);
        return;
      }

      // Extract raw text
      let rawText = "";
      if (Array.isArray(content)) {
        rawText = content
          .map((c) => (typeof c === "string" ? c : c?.text || ""))
          .filter(Boolean)
          .join("\n\n");
      } else if (typeof content === "string") {
        rawText = content;
      } else if (content && typeof content === "object") {
        rawText = content.text || content.body || "";
      }

      if (!rawText.trim()) {
        rawText = `${title}. Study to show thyself approved unto God.`;
      }

      // Instant client-side speech start with smoothed sentences and expanded scripture citations
      const clientSmoothed = cleanLessonTextForSpokenNarration(rawText);
      narrationBackgroundCache.set(cacheKey, {
        narrationScript: clientSmoothed,
        timestamp: Date.now()
      });
      startSpeechSynthesis(clientSmoothed);
    },
    []
  );

  return {
    activeDayIndex: state.activeDayIndex,
    activeLessonTitle: state.activeLessonTitle,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    isLoading: state.isLoading,
    speed: state.speed,
    narratorVoiceName: state.narratorVoiceName,
    setSpeed,
    readLesson,
    pause: pauseGlobalNarration,
    resume: resumeGlobalNarration,
    stop: stopGlobalNarration,
    toggleLesson: readLesson,
    prepareNarration: prepareNarrationInBackground
  };
}
