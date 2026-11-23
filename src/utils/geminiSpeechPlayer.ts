/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiFetch, isAuthRedirectResponse, safeParseResponseJson } from "../lib/apiFetch";
import { decodeAndCleanGeminiPcm, sanitizeVerbatimSpeechText } from "./cleanGeminiAudio";

export interface GeminiSpeechOptions {
  voice?: string;
  rate?: number;
  verbatimReadAloud?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export interface GeminiSpeechController {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPaused: () => boolean;
}

let activeStopFn: (() => void) | null = null;
let activePauseFn: (() => void) | null = null;
let activeResumeFn: (() => void) | null = null;
let activeIsPausedFn: (() => boolean) | null = null;

/**
 * Stops any currently playing Gemini Speech or browser speechSynthesis narration.
 */
export function stopActiveGeminiSpeech(): void {
  if (activeStopFn) {
    const fn = activeStopFn;
    activeStopFn = null;
    activePauseFn = null;
    activeResumeFn = null;
    activeIsPausedFn = null;
    try {
      fn();
    } catch {}
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function pauseActiveGeminiSpeech(): boolean {
  if (activePauseFn) {
    try {
      activePauseFn();
      return true;
    } catch {}
  }
  return false;
}

export function resumeActiveGeminiSpeech(): boolean {
  if (activeResumeFn) {
    try {
      activeResumeFn();
      return true;
    } catch {}
  }
  return false;
}

export function isActiveGeminiSpeechPaused(): boolean {
  if (activeIsPausedFn) {
    try {
      return activeIsPausedFn();
    } catch {}
  }
  return false;
}

/**
 * Splits long text into natural sentence-bounded chunks (~650 chars) so
 * long study notes and commentaries start speaking quickly and never hit
 * TTS length limits or cut off mid-sentence.
 */
function splitTextIntoSpeechChunks(text: string, maxChunkLength = 650, firstChunkLength = 240): string[] {
  const cleaned = sanitizeVerbatimSpeechText(text);
  if (!cleaned) return [];
  if (cleaned.length <= firstChunkLength) return [cleaned];

  const sentences = cleaned.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [cleaned];
  const chunks: string[] = [];
  let current = "";

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;

    const limit = chunks.length === 0 ? firstChunkLength : maxChunkLength;
    if (current && current.length + sentence.length + 1 > limit) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Selects Microsoft Andrew Natural (US) voice when the user selects
 * the "browser" engine (Edge Speech API), or as an offline emergency fallback.
 */
export function getMicrosoftAndrewUSVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact Microsoft Andrew Online/Multilingual/Natural (en-US)
  const andrewNaturalUS = voices.find((v) => {
    const n = v.name.toLowerCase();
    return (
      n.includes("andrew") &&
      (n.includes("natural") || n.includes("online") || n.includes("multilingual")) &&
      (v.lang.toLowerCase().includes("en-us") || n.includes("united states"))
    );
  });
  if (andrewNaturalUS) return andrewNaturalUS;

  // 2. Any Microsoft Andrew Natural / Online voice
  const andrewNatural = voices.find((v) => {
    const n = v.name.toLowerCase();
    return n.includes("andrew") && (n.includes("natural") || n.includes("online") || n.includes("microsoft"));
  });
  if (andrewNatural) return andrewNatural;

  // 3. Any Andrew voice
  const anyAndrew = voices.find((v) => v.name.toLowerCase().includes("andrew"));
  if (anyAndrew) return anyAndrew;

  return null;
}

interface FetchedAudioChunk {
  audio: string;
  format: "mp3" | "pcm";
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function fetchGeminiChunkBase64(
  chunkText: string,
  voice: string,
  verbatimReadAloud?: boolean
): Promise<FetchedAudioChunk | null> {
  if (typeof window !== "undefined") {
    const w = window as any;
    w.__STBA_TTS_CACHE__ = w.__STBA_TTS_CACHE__ || {};
    const cacheKey = `v3_${verbatimReadAloud ? "edge_" : ""}${chunkText}_${voice}`;
    if (w.__STBA_TTS_CACHE__[cacheKey]) {
      return w.__STBA_TTS_CACHE__[cacheKey];
    }

    const requestNarrate = async (useVerbatimEdge: boolean, overrideVoice?: string): Promise<FetchedAudioChunk | null> => {
      const controller = new AbortController();
      const timeoutMs = 15000;
      const timerId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await apiFetch("/api/study/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            text: chunkText,
            voice: overrideVoice || voice,
            verbatimReadAloud: useVerbatimEdge,
            model: "gemini-3.8-live",
          }),
        });
        if (!response.ok || isAuthRedirectResponse(response)) {
          return null;
        }
        const data = await safeParseResponseJson<any>(response);
        if (data?.success && data?.audio) {
          const result: FetchedAudioChunk = {
            audio: data.audio,
            format: data.format === "mp3" ? "mp3" : "pcm",
          };
          w.__STBA_TTS_CACHE__[cacheKey] = result;
          return result;
        }
      } catch (err) {
        console.warn("[GeminiSpeechPlayer] Narrate fetch error:", err);
      } finally {
        clearTimeout(timerId);
      }
      return null;
    };

    const primaryResult = await requestNarrate(Boolean(verbatimReadAloud));
    if (primaryResult) {
      return primaryResult;
    }

    // If primary Gemini TTS returned null or timed out (>8s), immediately retry with server-side
    // Microsoft Edge Neural (Andrew US) so it NEVER drops to robotic OS speechSynthesis
    if (!verbatimReadAloud) {
      const neuralFallbackResult = await requestNarrate(true, "Andrew");
      if (neuralFallbackResult) {
        return neuralFallbackResult;
      }
    }
  }
  return null;
}

/**
 * Plays text aloud using Gemini 3.8 Charon voice (/api/study/narrate) by default,
 * with seamless multi-chunk prefetching for long notes and commentaries.
 * Respects user preference if they explicitly selected "browser" (Edge Natural Voice).
 */
export function playGeminiSpeech(
  rawText: string,
  options: GeminiSpeechOptions = {}
): GeminiSpeechController {
  stopActiveGeminiSpeech();

  const chunks = splitTextIntoSpeechChunks(rawText);
  if (chunks.length === 0) {
    options.onEnd?.();
    return { stop: () => {}, pause: () => {}, resume: () => {}, isPaused: () => false };
  }

  let cancelled = false;
  let paused = false;
  let activeCtx: AudioContext | null = null;
  let activeSource: AudioBufferSourceNode | null = null;

  const pause = () => {
    if (cancelled || paused) return;
    paused = true;
    try {
      if (activeCtx && activeCtx.state === "running") {
        activeCtx.suspend().catch(() => {});
      }
    } catch {}
    if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
  };

  const resume = () => {
    if (cancelled || !paused) return;
    paused = false;
    try {
      if (activeCtx && activeCtx.state === "suspended") {
        activeCtx.resume().catch(() => {});
      }
    } catch {}
    if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }
  };

  const isPaused = () => paused;

  const stop = () => {
    if (cancelled) return;
    cancelled = true;
    paused = false;
    try {
      if (activeSource) {
        activeSource.onended = null;
        activeSource.stop();
        activeSource.disconnect();
      }
    } catch {}
    activeSource = null;
    try {
      if (activeCtx && activeCtx.state !== "closed") {
        activeCtx.close().catch(() => {});
      }
    } catch {}
    activeCtx = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (activeStopFn === stop) {
      activeStopFn = null;
      activePauseFn = null;
      activeResumeFn = null;
      activeIsPausedFn = null;
    }
  };

  activeStopFn = stop;
  activePauseFn = pause;
  activeResumeFn = resume;
  activeIsPausedFn = isPaused;

  const savedEngine =
    (typeof window !== "undefined"
      ? (localStorage.getItem("stba_tts_engine") as "original" | "browser" | null)
      : null) || "original";

  const resolvedVoice =
    options.voice ||
    (typeof window !== "undefined" ? localStorage.getItem("stba_ai_voice") : null) ||
    "Charon";
  const finalVoice = resolvedVoice === "Puck" ? "Charon" : resolvedVoice;
  const playbackRate = options.rate || 1.0;

  const playWithBrowserFallback = (remainingChunks: string[], startedAlready: boolean) => {
    if (cancelled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (!cancelled) options.onEnd?.();
      return;
    }

    let idx = 0;
    const speakNext = () => {
      if (cancelled || idx >= remainingChunks.length) {
        if (!cancelled) {
          if (activeStopFn === stop) activeStopFn = null;
          options.onEnd?.();
        }
        return;
      }

      const utt = new SpeechSynthesisUtterance(remainingChunks[idx]);
      const voice = getMicrosoftAndrewUSVoice();
      if (voice) {
        utt.voice = voice;
        utt.lang = voice.lang || "en-US";
      }
      utt.rate = playbackRate;
      utt.pitch = 0.95;

      utt.onstart = () => {
        if (!startedAlready && idx === 0 && !cancelled) {
          startedAlready = true;
          options.onStart?.();
        }
      };
      utt.onend = () => {
        idx += 1;
        speakNext();
      };
      utt.onerror = () => {
        idx += 1;
        speakNext();
      };

      window.speechSynthesis.speak(utt);
    };

    window.speechSynthesis.cancel();
    speakNext();
  };

  // When user chooses "browser" (Edge Speech API) OR verbatimReadAloud is requested,
  // stream real Microsoft Edge Neural audio from server (/api/study/narrate with verbatimReadAloud: true)
  // so Chrome, Safari, Firefox, and Edge ALL get 100% authentic Microsoft Neural voices with zero robotic fallback.
  const useVerbatimEdgeNeural = Boolean(options.verbatimReadAloud) || savedEngine === "browser";

  // Primary path: Gemini Charon / Microsoft Edge Neural via /api/study/narrate with chunk prefetching
  (async () => {
    let hasStarted = false;
    try {
      const sampleRate = 24000;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      activeCtx = new AudioContextClass({ sampleRate });
      if (activeCtx.state === "suspended") {
        await activeCtx.resume().catch(() => {});
      }

      let nextFetchPromise: Promise<FetchedAudioChunk | null> | null = fetchGeminiChunkBase64(
        chunks[0],
        finalVoice,
        useVerbatimEdgeNeural
      );

      for (let i = 0; i < chunks.length; i++) {
        if (cancelled) return;

        const fetched = await nextFetchPromise;
        if (cancelled) return;

        // Immediately start prefetching the next chunk while playing this one
        if (i + 1 < chunks.length) {
          nextFetchPromise = fetchGeminiChunkBase64(chunks[i + 1], finalVoice, useVerbatimEdgeNeural);
        } else {
          nextFetchPromise = null;
        }

        if (!fetched || !fetched.audio) {
          // Last-resort offline fallback if server is completely unreachable
          playWithBrowserFallback(chunks.slice(i), hasStarted);
          return;
        }

        if (cancelled || !activeCtx) return;

        let buffer: AudioBuffer | null = null;
        if (fetched.format === "mp3") {
          try {
            const arrBuf = base64ToArrayBuffer(fetched.audio);
            buffer = await activeCtx.decodeAudioData(arrBuf);
          } catch (decodeErr) {
            console.warn("[GeminiSpeechPlayer] MP3 decode error:", decodeErr);
          }
        } else {
          const float32Array = decodeAndCleanGeminiPcm(fetched.audio, { sampleRate });
          if (float32Array && float32Array.length > 0) {
            buffer = activeCtx.createBuffer(1, float32Array.length, sampleRate);
            buffer.getChannelData(0).set(float32Array);
          }
        }

        if (!buffer || cancelled || !activeCtx) {
          continue;
        }

        if (!hasStarted) {
          hasStarted = true;
          options.onStart?.();
        }

        await new Promise<void>((resolve) => {
          if (cancelled || !activeCtx || !buffer) {
            resolve();
            return;
          }
          const source = activeCtx.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = playbackRate;
          source.connect(activeCtx.destination);
          activeSource = source;
          source.onended = () => {
            if (activeSource === source) {
              activeSource = null;
            }
            resolve();
          };
          source.start(0);
        });
      }

      if (!cancelled) {
        if (activeStopFn === stop) activeStopFn = null;
        try {
          if (activeCtx && activeCtx.state !== "closed") {
            activeCtx.close().catch(() => {});
          }
        } catch {}
        activeCtx = null;
        options.onEnd?.();
      }
    } catch (err) {
      if (!cancelled) {
        console.warn("[GeminiSpeechPlayer] Playback error, falling back:", err);
        options.onError?.(err);
        if (activeStopFn === stop) activeStopFn = null;
        options.onEnd?.();
      }
    }
  })();

  return { stop, pause, resume, isPaused };
}
