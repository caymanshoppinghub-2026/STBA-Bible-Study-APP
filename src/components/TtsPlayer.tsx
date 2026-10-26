import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Loader2, Sliders, Check, Globe, Sparkles } from "lucide-react";
import { useMediaInitialization } from "./MediaInitializationProvider";
import { getElderStephenVoice, filterEdgeNaturalVoices } from "./stba/RightPaneTools";

// Global in-memory TTS cache declared on the global scope or window
const globalTtsCache: Record<string, string> = {};

if (typeof window !== "undefined") {
  (window as any).__STBA_TTS_CACHE__ = (window as any).__STBA_TTS_CACHE__ || globalTtsCache;
}

export const preCacheSpeechAudios = async (texts: string[], voice: string = "Puck") => {
  if (typeof window === "undefined") return;
  const cache = (window as any).__STBA_TTS_CACHE__ || globalTtsCache;
  for (const text of texts) {
    const cleaned = text
      .replace(/\*\*|###|##|#|\*/g, "")
      .replace(/[\[\]]/g, "")
      .replace(/DrA:/g, "")
      .replace(/Elder Stephen:/g, "")
      .replace(/Dr. Adams/g, "Doctor Adams")
      .trim();
    const cacheKey = `${cleaned}_${voice}`;
    if (!cache[cacheKey]) {
      try {
        const response = await fetch("/api/study/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleaned, voice })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.audio) {
            cache[cacheKey] = data.audio;
          }
        }
      } catch (err) {
        console.warn("Pre-cache failed for text:", text, err);
      }
    }
  }
};

interface TtsPlayerProps {
  text: string;
  messageId: string;
  autoPlay?: boolean;
  label?: string;
  variant?: "default" | "card";
}

export const TtsPlayer: React.FC<TtsPlayerProps> = ({ text, messageId, autoPlay = true, label, variant = "default" }) => {
  const { isMediaInitialized, initializeMedia } = useMediaInitialization();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFallback, setIsFallback] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [showSettings, setShowSettings] = useState(false);

  // Engine selection: "original" (Gemini AI TTS) vs "browser" (Edge / Web Speech API)
  const [ttsEngine, setTtsEngine] = useState<"original" | "browser">(() => {
    return (localStorage.getItem("stba_tts_engine") as "original" | "browser") || "original";
  });

  const [browserVoiceUri, setBrowserVoiceUri] = useState<string>(() => {
    return localStorage.getItem("stba_browser_voice_uri") || "";
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [currentVoice, setCurrentVoice] = useState(() => {
    const saved = localStorage.getItem("stba_ai_voice");
    if (!saved || saved === "Charon") {
      localStorage.setItem("stba_ai_voice", "Puck");
      return "Puck";
    }
    return saved;
  });

  // Load available browser voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };
    updateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Listen to external voice & engine updates so active player updates its state dynamically
  useEffect(() => {
    const handleVoiceChange = () => {
      const savedAiVoice = localStorage.getItem("stba_ai_voice");
      const resolvedAiVoice = !savedAiVoice || savedAiVoice === "Charon" ? "Puck" : savedAiVoice;
      setCurrentVoice(resolvedAiVoice);

      const savedEngine = (localStorage.getItem("stba_tts_engine") as "original" | "browser") || "original";
      setTtsEngine(savedEngine);

      const savedUri = localStorage.getItem("stba_browser_voice_uri") || "";
      setBrowserVoiceUri(savedUri);
    };
    
    window.addEventListener("storage", handleVoiceChange);
    window.addEventListener("stba_voice_changed", handleVoiceChange);
    
    return () => {
      window.removeEventListener("storage", handleVoiceChange);
      window.removeEventListener("stba_voice_changed", handleVoiceChange);
    };
  }, []);

  const decodedAudioBufferRef = useRef<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Clean the text to avoid spelling bracketed metadata, asterisks, markdown syntax etc.
  const cleanedText = text
    .replace(/\*\*|###|##|#|\*/g, "")
    .replace(/[\[\]]/g, "")
    .replace(/DrA:/g, "")
    .replace(/Elder Stephen:/g, "")
    .replace(/Dr. Adams/g, "Doctor Adams")
    .trim();

  // Create formatted utterance instance with reliable callbacks and logging
  const createUtterance = () => {
    if (!("speechSynthesis" in window)) {
      console.warn("[WebSpeechAPI] speechSynthesis not supported in this browser window environment.");
      return null;
    }
    const utt = new SpeechSynthesisUtterance(cleanedText);
    utt.rate = speed; // Set dynamic pacing
    utt.pitch = 0.9; // Slightly lower pitch for a warm tone
    
    const StephenVoice = getElderStephenVoice();
    if (StephenVoice) {
      utt.voice = StephenVoice;
    }

    utt.onstart = () => {
      console.log(`[WebSpeechAPI] Utterance started for message [${messageId}]:`, {
        textSnippet: cleanedText.slice(0, 50) + "...",
        voice: utt.voice?.name || "System Default",
        rate: utt.rate,
        pitch: utt.pitch
      });
      setIsPlaying(true);
      setProgress(0);
    };

    utt.onend = () => {
      console.log(`[WebSpeechAPI] Utterance finished for message [${messageId}]`);
      setIsPlaying(false);
      setProgress(100);
    };

    utt.onerror = (err) => {
      console.warn(`[WebSpeechAPI] Utterance error event for message [${messageId}]:`, err);
      setIsPlaying(false);
    };
    
    // Simulate progress speaking
    utt.onboundary = (e) => {
      if (e.charIndex !== undefined && cleanedText.length > 0) {
        setProgress((e.charIndex / cleanedText.length) * 100);
      }
    };

    return utt;
  };

  // Load the voice file automatically on mount
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const loadTts = async () => {
      const activeEngine = (localStorage.getItem("stba_tts_engine") as "original" | "browser") || ttsEngine;

      // MODE 1: BROWSER SYNTHESIZED VOICE (EDGE / WEB SPEECH API)
      if (activeEngine === "browser") {
        if (!active) return;
        setIsFallback(true);
        setIsLoading(false);
        const utt = createUtterance();
        utteranceRef.current = utt;

        if (autoPlay && utt) {
          setTimeout(() => {
            if (active) {
              const speakBrowser = () => {
                window.speechSynthesis.cancel();
                const bestVoice = getElderStephenVoice();
                if (bestVoice) {
                  utt.voice = bestVoice;
                }
                window.speechSynthesis.speak(utt);
                setIsPlaying(true);
              };

              if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
              speakBrowser();
            }
          }, 300);
        }
        return;
      }

      // MODE 2: ORIGINAL ELDER STEPHEN VOICE (GEMINI AI API)
      try {
        const cacheKey = `${cleanedText}_${currentVoice}`;
        const cachedBase64 = (window as any).__STBA_TTS_CACHE__?.[cacheKey];
        
        let base64Audio = cachedBase64;
        
        if (!base64Audio) {
          const response = await fetch("/api/study/narrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cleanedText, voice: currentVoice })
          });
          
          if (!response.ok) throw new Error("Narrate request failed");
          
          const data = await response.json();
          if (data.success && data.audio) {
            base64Audio = data.audio;
            if ((window as any).__STBA_TTS_CACHE__) {
              (window as any).__STBA_TTS_CACHE__[cacheKey] = base64Audio;
            }
          } else {
            if (data.quotaExceeded || data.unavailable) {
              setIsQuotaExceeded(true);
            }
            throw new Error(data.error || "No audio returned, using Browser fallback");
          }
        }

        if (base64Audio) {
          if (!active) return;
          
          // Decode raw base64 PCM into Int16Array
          const binaryString = window.atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const arrayBuffer = bytes.buffer;

          // Convert 16-bit signed PCM to 32-bit floating point PCM
          const int16Array = new Int16Array(arrayBuffer);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
          }

          // Setup AudioContext
          const sampleRate = 24000;
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
          audioContextRef.current = ctx;

          const pcmBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
          pcmBuffer.getChannelData(0).set(float32Array);
          decodedAudioBufferRef.current = pcmBuffer;

          setDuration(pcmBuffer.duration);
          setIsFallback(false);
          setIsLoading(false);

          const startAudioPlayback = () => {
            if (!active || !audioContextRef.current || !decodedAudioBufferRef.current) return;
            try {
              if (ctx.state === "suspended") {
                ctx.resume();
              }
              const source = ctx.createBufferSource();
              source.buffer = pcmBuffer;
              source.playbackRate.value = speed;
              source.connect(ctx.destination);
              source.start(0, 0);
              startTimeRef.current = ctx.currentTime;
              audioSourceRef.current = source;
              setIsPlaying(true);

              source.onended = () => {
                const elapsed = ctx.currentTime - startTimeRef.current;
                if (elapsed >= pcmBuffer.duration - 0.1) {
                  setIsPlaying(false);
                  setCurrentTime(0);
                  setProgress(100);
                  pausedTimeRef.current = 0;
                  if (progressIntervalRef.current) {
                    window.clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                  }
                }
              };

              progressIntervalRef.current = window.setInterval(() => {
                const curr = ctx.currentTime - startTimeRef.current;
                const dur = pcmBuffer.duration || 1;
                if (curr <= dur) {
                  setCurrentTime(curr);
                  setProgress((curr / dur) * 100);
                }
              }, 100);
            } catch (playErr) {
              console.warn("Autoplay audio start error:", playErr);
            }
          };

          if (autoPlay) {
            setTimeout(() => {
              if (!active) return;
              if (ctx.state === "suspended") {
                ctx.resume().then(() => {
                  startAudioPlayback();
                }).catch(() => {
                  // If browser blocked autoplay, play on first user interaction
                  const handleUnblock = () => {
                    initializeMedia();
                    ctx.resume();
                    startAudioPlayback();
                    window.removeEventListener("click", handleUnblock);
                    window.removeEventListener("touchstart", handleUnblock);
                    window.removeEventListener("keydown", handleUnblock);
                  };
                  window.addEventListener("click", handleUnblock, { once: true });
                  window.addEventListener("touchstart", handleUnblock, { once: true });
                  window.addEventListener("keydown", handleUnblock, { once: true });
                });
              } else {
                startAudioPlayback();
              }
            }, 300);
          }
        }
      } catch (err: any) {
        console.warn("Using high-fidelity browser speech-synthesis fallback:", err);
        if (!active) return;
        setIsFallback(true);
        setIsLoading(false);
        const errStr = String(err?.message || "");
        if (errStr.toLowerCase().includes("quota") || errStr.toLowerCase().includes("exhausted") || err?.status === 429) {
          setIsQuotaExceeded(true);
        }
        
        // Re-construct dynamic utterance immediately
        const utt = createUtterance();
        utteranceRef.current = utt;

        // AutoPlay on mount if fallback is activated and autoplay is true
        if (autoPlay && utt) {
          setTimeout(() => {
            if (active) {
              const speakFallback = () => {
                window.speechSynthesis.cancel();
                const bestVoice = getElderStephenVoice();
                if (bestVoice) {
                  utt.voice = bestVoice;
                }
                window.speechSynthesis.speak(utt);
                setIsPlaying(true);
              };

              if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
              
              speakFallback();
            }
          }, 300);
        }
      }
    };

    loadTts();

    // Listen to voiceschanged event to dynamically update the utterance's voice reference as soon as they populate
    const handleVoicesChanged = () => {
      if (utteranceRef.current) {
        const bestVoice = getElderStephenVoice();
        if (bestVoice) {
          utteranceRef.current.voice = bestVoice;
        }
      }
    };

    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    }

    return () => {
      active = false;
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        try {
          audioSourceRef.current.stop();
        } catch (_) {}
        audioSourceRef.current = null;
      }
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      }
    };
  }, [messageId, currentVoice, ttsEngine, browserVoiceUri]);

  const handlePlay = () => {
    if (!isMediaInitialized) {
      initializeMedia();
    }
    if (isFallback || ttsEngine === "browser") {
      if ("speechSynthesis" in window) {
        if (window.speechSynthesis.speaking && utteranceRef.current) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
          } else {
            window.speechSynthesis.pause();
            setIsPlaying(false);
          }
        } else if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          window.speechSynthesis.cancel();
          const utt = createUtterance();
          if (utt) {
            utteranceRef.current = utt;
            window.speechSynthesis.speak(utt);
            setIsPlaying(true);
          }
        }
      }
      return;
    }

    if (!decodedAudioBufferRef.current) return;

    if (isPlaying) {
      // Pause
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        try {
          audioSourceRef.current.stop();
        } catch (_) {}
        audioSourceRef.current = null;
      }
      pausedTimeRef.current = currentTime;
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      // Play
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = decodedAudioBufferRef.current;
      source.playbackRate.value = speed;
      source.connect(ctx.destination);

      const startOffset = pausedTimeRef.current;
      source.start(0, startOffset);
      startTimeRef.current = ctx.currentTime - startOffset;
      audioSourceRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        const elapsed = ctx.currentTime - startTimeRef.current;
        if (elapsed >= decodedAudioBufferRef.current!.duration - 0.15) {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(100);
          pausedTimeRef.current = 0;
          if (progressIntervalRef.current) {
            window.clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
      };

      progressIntervalRef.current = window.setInterval(() => {
        if (ctx) {
          const curr = ctx.currentTime - startTimeRef.current;
          const dur = decodedAudioBufferRef.current?.duration || 1;
          if (curr <= dur) {
            setCurrentTime(curr);
            setProgress((curr / dur) * 100);
          }
        }
      }, 100);
    }
  };

  const handleReplay = () => {
    if (isFallback || ttsEngine === "browser") {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = createUtterance();
        if (utt) {
          utteranceRef.current = utt;
          window.speechSynthesis.speak(utt);
          setIsPlaying(true);
          setProgress(0);
        }
      }
      return;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      try {
        audioSourceRef.current.stop();
      } catch (_) {}
      audioSourceRef.current = null;
    }
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    pausedTimeRef.current = 0;
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(false);

    setTimeout(() => {
      if (!decodedAudioBufferRef.current) return;
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      source.buffer = decodedAudioBufferRef.current;
      source.playbackRate.value = speed;
      source.connect(ctx.destination);

      source.start(0, 0);
      startTimeRef.current = ctx.currentTime;
      audioSourceRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        const elapsed = ctx.currentTime - startTimeRef.current;
        if (elapsed >= decodedAudioBufferRef.current!.duration - 0.15) {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(100);
          pausedTimeRef.current = 0;
          if (progressIntervalRef.current) {
            window.clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
      };

      progressIntervalRef.current = window.setInterval(() => {
        const curr = ctx.currentTime - startTimeRef.current;
        const dur = decodedAudioBufferRef.current?.duration || 1;
        if (curr <= dur) {
          setCurrentTime(curr);
          setProgress((curr / dur) * 100);
        }
      }, 100);
    }, 50);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Static waveform design values for pristine, elegant layout
  const waveformHeights = [30, 60, 45, 80, 50, 70, 40, 90, 60, 40, 75, 50, 65, 35, 55, 45, 80, 55, 60, 40];

  const activeVoiceObj = getElderStephenVoice();
  const voiceDisplayName = ttsEngine === "browser"
    ? activeVoiceObj ? activeVoiceObj.name.replace(/Microsoft |Online \(Natural\) - |Google /g, "") : "Browser Speech"
    : `${currentVoice} (AI)`;

  if (variant === "card") {
    return (
      <div className="w-full mt-2 relative" id={`tts-container-${messageId}`}>
        <div className="w-full p-4 sm:p-5 bg-white border border-stone-200/90 rounded-2xl flex flex-col space-y-3.5 text-stone-900 font-sans shadow-xl">
          {/* Top Operational Row */}
          <div className="flex items-center justify-between gap-3 w-full min-w-0">
            <div className="flex items-center space-x-3.5 min-w-0">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlay}
                disabled={isLoading}
                type="button"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow-md disabled:bg-stone-300 transition-transform active:scale-95 duration-150 shrink-0 focus:outline-none"
                title={isPlaying ? "Pause Narration" : "Listen to Elder Stevenson"}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current text-white" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                )}
              </button>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-serif font-bold text-sm sm:text-base text-gray-900 truncate">
                  {label ? label : `Listen to Elder Stevenson`}
                </span>
                <span className="text-xs text-gray-600 truncate flex items-center gap-1 mt-0.5 font-sans">
                  {ttsEngine === "browser" ? <Globe size={12} className="text-emerald-600 shrink-0" /> : <Sparkles size={12} className="text-emerald-600 shrink-0" />}
                  <span className="truncate">{ttsEngine === "browser" ? "Andrew English (United States)" : voiceDisplayName}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Voice Selector / Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                type="button"
                className={`p-1.5 px-2.5 sm:px-3 border rounded-lg text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-xs focus:outline-none ${
                  showSettings 
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300" 
                    : "bg-white border-stone-200 hover:bg-stone-50 text-stone-700"
                }`}
                title="Speech Settings & Voice Selector"
              >
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline text-[10.5px]">EDGE / WEB VOICE</span>
              </button>

              {/* Playback Speed Control */}
              <button
                onClick={() => {
                  const nextSpeed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1;
                  setSpeed(nextSpeed);
                }}
                type="button"
                className="p-1.5 px-2.5 border border-stone-200 hover:bg-stone-50 text-emerald-800 rounded-lg text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center cursor-pointer transition shadow-xs focus:outline-none"
                title="Change Playback Speed"
              >
                <span>{speed}X</span>
              </button>

              {/* Replay Button */}
              <button
                onClick={handleReplay}
                disabled={isLoading}
                type="button"
                className="p-1.5 px-2 border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-800 rounded-lg text-xs font-mono font-bold flex items-center cursor-pointer disabled:opacity-50 transition shadow-xs focus:outline-none"
                title="Reset & Replay Audio"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Speech Settings Drawer */}
          {showSettings && (
            <div className="w-full p-3 bg-stone-50 border border-emerald-200 rounded-xl text-xs space-y-2.5 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                <span className="font-bold text-[11px] uppercase font-mono tracking-wider text-emerald-950">Speech Engine & Voice Selection</span>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-[10px] font-mono text-stone-400 hover:text-stone-700 px-1 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-600 block">Select Speech Engine:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTtsEngine("original");
                      localStorage.setItem("stba_tts_engine", "original");
                      window.dispatchEvent(new Event("stba_voice_changed"));
                    }}
                    className={`p-2 rounded-lg border text-[10.5px] font-semibold text-left flex items-center justify-between cursor-pointer ${
                      ttsEngine === "original"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span className="truncate">Elder Stevenson AI</span>
                    {ttsEngine === "original" && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTtsEngine("browser");
                      localStorage.setItem("stba_tts_engine", "browser");
                      window.dispatchEvent(new Event("stba_voice_changed"));
                    }}
                    className={`p-2 rounded-lg border text-[10.5px] font-semibold text-left flex items-center justify-between cursor-pointer ${
                      ttsEngine === "browser"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span className="truncate">Browser Edge Voice (Andrew)</span>
                    {ttsEngine === "browser" && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Waveform & Slider Row */}
          <div className="flex items-center space-x-3 w-full min-w-0 bg-stone-50 p-2 rounded-xl border border-stone-150">
            {/* Waveform graphic */}
            <div className="flex items-end space-x-[2px] h-5 px-1 shrink-0 bg-stone-100/90 rounded py-0.5">
              {waveformHeights.slice(0, 14).map((baseHeight, i) => {
                const barProgress = (i / 14) * 100;
                const hasPassed = progress >= barProgress && progress > 0;
                const animationOffset = isPlaying ? Math.sin((currentTime * 6) + i) * 10 : 0;
                const computedHeight = isPlaying 
                  ? Math.max(20, baseHeight + animationOffset) 
                  : baseHeight * 0.45;

                return (
                  <div
                    key={i}
                    className={`w-[2px] rounded-full transition-all duration-300 ${
                      hasPassed 
                        ? "bg-emerald-600" 
                        : isPlaying 
                          ? "bg-emerald-600/40" 
                          : "bg-stone-300"
                    }`}
                    style={{ height: `${computedHeight}%` }}
                  />
                );
              })}
            </div>

            {/* Progress track */}
            <div className="flex-1 h-1.5 bg-stone-200/90 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-emerald-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="tabular-nums font-mono text-[11px] text-stone-600 font-semibold shrink-0">
              {formatTime(currentTime)} / {formatTime(duration || 28)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-3 relative" id={`tts-container-${messageId}`}>
      <div className="w-full p-2.5 bg-stone-50 border border-stone-200/60 rounded-xl flex flex-col space-y-2 text-stone-700 font-sans shadow-2xs">
        {/* Top Operational Row: Play/Pause, Voice Label, Engine Selector, Settings & Replay */}
        <div className="flex items-center justify-between gap-2 w-full min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlay}
              disabled={isLoading}
              type="button"
              className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center cursor-pointer shadow-3xs disabled:bg-stone-300 transition duration-150 shrink-0 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              title={isPlaying ? "Pause Narration" : "Hear Elder Stephen"}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current text-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-white" />
              )}
            </button>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-serif font-black tracking-tight text-teal-850 text-[10px] truncate max-w-[120px] sm:max-w-[160px]">
                {label ? label : `Elder Stephen`}
              </span>
              <span className="text-[8.5px] font-mono text-stone-500 truncate flex items-center gap-1">
                {ttsEngine === "browser" ? <Globe size={9} className="text-teal-600 shrink-0" /> : <Sparkles size={9} className="text-amber-600 shrink-0" />}
                <span className="truncate">{voiceDisplayName}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Settings & Voice Selector Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              type="button"
              className={`p-1 px-1.5 border rounded-md text-[9px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shrink-0 focus:outline-none ${
                showSettings 
                  ? "bg-teal-100 text-teal-800 border-teal-300" 
                  : "bg-white border-stone-200 hover:bg-stone-100 text-stone-600"
              }`}
              title="Speech Settings & Voice Selector"
            >
              <Sliders className="w-3 h-3 text-stone-500" />
              <span className="hidden sm:inline text-[8.5px]">{ttsEngine === "browser" ? "Edge / Web Voice" : "AI Voice"}</span>
            </button>

            {/* Playback Speed Control */}
            <button
              onClick={() => {
                const nextSpeed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1;
                setSpeed(nextSpeed);
              }}
              type="button"
              className="p-1 px-1.5 border border-stone-200 hover:bg-stone-150 text-teal-700 hover:text-teal-900 rounded-md text-[9px] font-mono font-extrabold uppercase tracking-wider flex items-center cursor-pointer transition shrink-0 focus:outline-none"
              title="Change Playback Speed"
            >
              <span>{speed}x</span>
            </button>

            {/* Replay Button */}
            <button
              onClick={handleReplay}
              disabled={isLoading}
              type="button"
              className="p-1 px-1.5 border border-stone-200 hover:bg-stone-150 text-stone-500 hover:text-stone-750 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition shrink-0 focus:outline-none"
              title="Reset & Replay Audio"
            >
              <RotateCcw className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Inline Speech Settings Popover / Drawer */}
        {showSettings && (
          <div className="w-full p-2.5 bg-white border border-teal-200/80 rounded-lg text-xs space-y-2 mt-1 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-150 pb-1.5">
              <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-teal-900">Speech Engine & Voice Settings</span>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-[9px] font-mono text-stone-400 hover:text-stone-700 px-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Engine Selector */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold text-stone-600 block">Select Speech Engine:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setTtsEngine("original");
                    localStorage.setItem("stba_tts_engine", "original");
                    window.dispatchEvent(new Event("stba_voice_changed"));
                  }}
                  className={`p-1.5 rounded border text-[10px] font-semibold text-left flex items-center justify-between cursor-pointer ${
                    ttsEngine === "original"
                      ? "bg-teal-50 border-teal-500 text-teal-900 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="truncate">Elder Stephen AI</span>
                  {ttsEngine === "original" && <Check className="w-3 h-3 text-teal-600 shrink-0 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTtsEngine("browser");
                    localStorage.setItem("stba_tts_engine", "browser");
                    window.dispatchEvent(new Event("stba_voice_changed"));
                  }}
                  className={`p-1.5 rounded border text-[10px] font-semibold text-left flex items-center justify-between cursor-pointer ${
                    ttsEngine === "browser"
                      ? "bg-teal-50 border-teal-500 text-teal-900 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="truncate">Browser Read Aloud (Edge)</span>
                  {ttsEngine === "browser" && <Check className="w-3 h-3 text-teal-600 shrink-0 ml-1" />}
                </button>
              </div>
            </div>

            {/* Browser Voice Selector Dropdown (When Browser engine active) */}
            {ttsEngine === "browser" && (
              <div className="space-y-1 pt-1">
                <label className="text-[9.5px] font-bold text-stone-600 block">Browser Synthesized Voice (Edge Natural):</label>
                {(() => {
                  const filteredEdgeVoices = filterEdgeNaturalVoices(availableVoices);
                  const defaultAndrew = filteredEdgeVoices.find(v => v.name.toLowerCase().includes("andrew")) || filteredEdgeVoices[0];
                  const activeVoiceValue = browserVoiceUri || (defaultAndrew ? defaultAndrew.voiceURI : "");

                  return (
                    <select
                      value={activeVoiceValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrowserVoiceUri(val);
                        localStorage.setItem("stba_browser_voice_uri", val);
                        window.dispatchEvent(new Event("stba_voice_changed"));
                      }}
                      className="w-full p-1.5 text-[10.5px] font-sans rounded border border-stone-300 bg-stone-50 text-stone-800 outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      {filteredEdgeVoices.length === 0 ? (
                        <option value="">⭐ Microsoft Andrew Online Natural (Default)</option>
                      ) : (
                        filteredEdgeVoices.map((v, idx) => (
                          <option key={v.voiceURI || idx} value={v.voiceURI}>
                            ⭐ {v.name} ({v.lang})
                          </option>
                        ))
                      )}
                    </select>
                  );
                })()}
                <p className="text-[8.5px] text-stone-500 italic">
                  Note: Default voice is Microsoft Andrew Online Natural. Exclusively filtering for premium Edge Natural Microsoft voices.
                </p>
              </div>
            )}

            {/* Gemini Character Selector Dropdown (When Original engine active) */}
            {ttsEngine === "original" && (
              <div className="space-y-1 pt-1">
                <label className="text-[9.5px] font-bold text-stone-600 block">AI Character Voice Model:</label>
                <select
                  value={currentVoice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentVoice(val);
                    localStorage.setItem("stba_ai_voice", val);
                    window.dispatchEvent(new Event("stba_voice_changed"));
                  }}
                  className="w-full p-1.5 text-[10.5px] font-sans rounded border border-stone-300 bg-stone-50 text-stone-800 outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Puck">Elder Stephen's Natural Voice (Default - Puck)</option>
                  <option value="Kore">Theological Scholar (Kore)</option>
                  <option value="Aoede">Creative Lyricist (Aoede)</option>
                  <option value="Zephyr">Meditative Devotional (Zephyr)</option>
                  <option value="Fenrir">Pulpit Preacher (Fenrir)</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Bottom Visualization Row: Waveform, Slider tracks, Timer */}
        <div className="flex items-center space-x-2 w-full min-w-0 bg-stone-100/40 p-1.5 rounded-lg border border-stone-100/30">
          {/* Waveform graphic inside controls */}
          <div className="flex items-end space-x-[1px] h-5 px-1 shrink-0 bg-stone-100/80 rounded py-0.5">
            {waveformHeights.slice(0, 14).map((baseHeight, i) => {
              // Highlight based on current elapsed progress
              const barProgress = (i / 14) * 100;
              const hasPassed = progress >= barProgress && progress > 0;
              
              // Simple oscillatory animation when voice is active
              const animationOffset = isPlaying ? Math.sin((currentTime * 6) + i) * 10 : 0;
              const computedHeight = isPlaying 
                ? Math.max(20, baseHeight + animationOffset) 
                : baseHeight * 0.45;

              return (
                <div
                  key={i}
                  className={`w-[1.5px] rounded-full transition-all duration-300 ${
                    hasPassed 
                      ? "bg-teal-600" 
                      : isPlaying 
                        ? "bg-teal-600/30" 
                        : "bg-stone-300"
                  }`}
                  style={{ height: `${computedHeight}%` }}
                />
              );
            })}
          </div>

          {/* Simple progress bar */}
          <div className="flex-1 h-1 bg-stone-200/80 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="tabular-nums font-mono text-[8.5px] text-stone-500 shrink-0">
            {formatTime(currentTime)} / {formatTime(duration || cleanedText.length / 15)}
          </span>
        </div>
      </div>
    </div>
  );
};
