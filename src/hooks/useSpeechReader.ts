import { useState, useEffect, useRef, useCallback } from "react";

export type CuratedVoiceId =
  | "male-stevens"
  | "male-christopher"
  | "female-jenny"
  | "female-aria";

export interface SpeechVoiceOption {
  id: CuratedVoiceId;
  name: string;
  label: string;
  gender: "male" | "female";
  accent: "American";
  description: string;
  isNatural: boolean;
  lang: string;
  rawVoice?: SpeechSynthesisVoice;
}

export const CURATED_VOICES_CONFIG: {
  id: CuratedVoiceId;
  name: string;
  label: string;
  gender: "male" | "female";
  accent: "American";
  description: string;
  defaultPitch: number;
  defaultRate: number;
  keywords: string[];
}[] = [
  {
    id: "male-stevens",
    name: "Elder Stevens (Male, US)",
    label: "Elder Stevens (Male, US)",
    gender: "male",
    accent: "American",
    description: "Pastoral Baritone",
    defaultPitch: 0.95,
    defaultRate: 0.92,
    keywords: ["guy", "andrew", "david", "alex", "male"]
  },
  {
    id: "male-christopher",
    name: "Christopher (Male, US)",
    label: "Christopher (Male, US)",
    gender: "male",
    accent: "American",
    description: "Clear & Expressive",
    defaultPitch: 1.02,
    defaultRate: 0.96,
    keywords: ["christopher", "eric", "mark", "stephon", "tom", "evan", "fred", "daniel"]
  },
  {
    id: "female-jenny",
    name: "Jenny (Female, US)",
    label: "Jenny (Female, US)",
    gender: "female",
    accent: "American",
    description: "Warm & Articulate",
    defaultPitch: 1.0,
    defaultRate: 0.94,
    keywords: ["jenny", "samantha", "google us english", "allison", "female"]
  },
  {
    id: "female-aria",
    name: "Aria (Female, US)",
    label: "Aria (Female, US)",
    gender: "female",
    accent: "American",
    description: "Gentle & Reflective",
    defaultPitch: 1.06,
    defaultRate: 0.92,
    keywords: ["aria", "ava", "michelle", "zira", "victoria", "karen", "susan"]
  }
];

const STORAGE_KEY_VOICE_ID = "stba_exegesis_reader_voice_id";
const STORAGE_KEY_VOICE_LEGACY = "stba_selected_tts_voice";

// Helper to determine American English voices
const isAmericanVoice = (v: SpeechSynthesisVoice): boolean => {
  const lang = (v.lang || "").toLowerCase();
  const name = (v.name || "").toLowerCase();
  return (
    lang === "en-us" ||
    lang === "en_us" ||
    lang.startsWith("en-us") ||
    lang.startsWith("en_us") ||
    name.includes("united states") ||
    name.includes("us english")
  );
};

const femaleKeywords = [
  "jenny", "aria", "ava", "michelle", "samantha", "allison",
  "victoria", "karen", "susan", "zira", "zoe", "cynthia",
  "female", "serena", "steffan", "veena"
];

const maleKeywords = [
  "guy", "andrew", "david", "christopher", "eric", "mark",
  "stephon", "alex", "fred", "tom", "evan", "nathan", "daniel",
  "male", "george", "oliver", "arthur"
];

const isFemaleVoice = (v: SpeechSynthesisVoice): boolean => {
  const n = v.name.toLowerCase();
  if (femaleKeywords.some((k) => n.includes(k))) return true;
  if (n.includes("google us english") && !n.includes("male")) return true;
  return false;
};

const isMaleVoice = (v: SpeechSynthesisVoice): boolean => {
  const n = v.name.toLowerCase();
  if (maleKeywords.some((k) => n.includes(k))) return true;
  return false;
};

// Resolves a curated voice option to the best available system voice and acoustic parameters
const resolveVoiceAndParams = (
  voiceId: CuratedVoiceId,
  allVoices: SpeechSynthesisVoice[]
): { voice: SpeechSynthesisVoice | undefined; pitch: number; rate: number } => {
  const config = CURATED_VOICES_CONFIG.find((c) => c.id === voiceId) || CURATED_VOICES_CONFIG[0];
  let pitch = config.defaultPitch;
  let rate = config.defaultRate;

  if (!allVoices || allVoices.length === 0) {
    return { voice: undefined, pitch, rate };
  }

  // Prioritize American English, fallback to English, fallback to any
  const usVoices = allVoices.filter(isAmericanVoice);
  const englishVoices = allVoices.filter((v) => (v.lang || "").toLowerCase().startsWith("en"));
  const pool = usVoices.length > 0 ? usVoices : (englishVoices.length > 0 ? englishVoices : allVoices);

  const malePool = pool.filter((v) => isMaleVoice(v) || (!isFemaleVoice(v) && !v.name.toLowerCase().includes("female")));
  const femalePool = pool.filter((v) => isFemaleVoice(v) || (!isMaleVoice(v) && !v.name.toLowerCase().includes("male")));

  let chosenVoice: SpeechSynthesisVoice | undefined;

  if (config.gender === "male") {
    const searchPool = malePool.length > 0 ? malePool : pool;

    for (const kw of config.keywords) {
      const match = searchPool.find((v) => v.name.toLowerCase().includes(kw));
      if (match) {
        chosenVoice = match;
        break;
      }
    }

    // For Christopher, try to pick a distinct male voice from Elder Stevens if available
    if (voiceId === "male-christopher" && !chosenVoice) {
      const stevensMatch = searchPool.find((v) =>
        ["guy", "andrew", "david", "alex"].some((k) => v.name.toLowerCase().includes(k))
      );
      const differentMale = searchPool.find((v) => v !== stevensMatch);
      if (differentMale) {
        chosenVoice = differentMale;
      }
    }

    if (!chosenVoice) {
      chosenVoice = searchPool[0];
      if (voiceId === "male-christopher") {
        pitch = 1.05;
        rate = 0.98;
      }
    }
  } else {
    const searchPool = femalePool.length > 0 ? femalePool : pool;

    for (const kw of config.keywords) {
      const match = searchPool.find((v) => v.name.toLowerCase().includes(kw));
      if (match) {
        chosenVoice = match;
        break;
      }
    }

    // For Aria, try to pick a distinct female voice from Jenny if available
    if (voiceId === "female-aria" && !chosenVoice) {
      const jennyMatch = searchPool.find((v) =>
        ["jenny", "samantha", "google us english"].some((k) => v.name.toLowerCase().includes(k))
      );
      const differentFemale = searchPool.find((v) => v !== jennyMatch);
      if (differentFemale) {
        chosenVoice = differentFemale;
      }
    }

    if (!chosenVoice) {
      chosenVoice = searchPool[0];
      if (voiceId === "female-aria") {
        pitch = 1.08;
        rate = 0.92;
      } else if (voiceId === "female-jenny" && malePool.includes(chosenVoice)) {
        pitch = 1.15;
      }
    }
  }

  return { voice: chosenVoice, pitch, rate };
};

// Helper to split text into natural sentence/clause chunks for dignified pacing & reliable pause/resume
const splitIntoSpeechChunks = (text: string): string[] => {
  const paragraphs = text.split(/\n+/);
  const chunks: string[] = [];

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    // Split on sentence boundaries (. ! ?) avoiding breaking abbreviations
    const sentenceParts = trimmed
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const sent of sentenceParts) {
      if (sent.length > 140) {
        const subParts = sent
          .split(/(?<=[;:]|\s—\s)\s*/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (subParts.length > 1) {
          chunks.push(...subParts);
        } else {
          chunks.push(sent);
        }
      } else {
        chunks.push(sent);
      }
    }
  }

  return chunks.filter((c) => c.length > 0);
};

export function useSpeechReader() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Default to Elder Stevens (Male, US)
  const [selectedVoiceId, setSelectedVoiceId] = useState<CuratedVoiceId>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem(STORAGE_KEY_VOICE_ID);
      if (savedId && CURATED_VOICES_CONFIG.some((c) => c.id === savedId)) {
        return savedId as CuratedVoiceId;
      }
      const legacy = localStorage.getItem(STORAGE_KEY_VOICE_LEGACY);
      if (legacy) {
        const matched = CURATED_VOICES_CONFIG.find(
          (c) => c.name === legacy || c.keywords.some((k) => legacy.toLowerCase().includes(k))
        );
        if (matched) return matched.id;
      }
    }
    return "male-stevens";
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechVoiceOption[]>(() =>
    CURATED_VOICES_CONFIG.map((c) => ({
      id: c.id,
      name: c.name,
      label: c.label,
      gender: c.gender,
      accent: "American",
      description: c.description,
      isNatural: true,
      lang: "en-US"
    }))
  );

  const selectedVoiceIdRef = useRef<CuratedVoiceId>(selectedVoiceId);
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const currentRawTextRef = useRef<string>("");
  const isPausedRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Keep ref synchronized
  useEffect(() => {
    selectedVoiceIdRef.current = selectedVoiceId;
  }, [selectedVoiceId]);

  // Clean Markdown formatting for clear audio diction
  const cleanMarkdownForAudio = (mdText: string): string => {
    return mdText
      .replace(/###\s+/g, "")
      .replace(/##\s+/g, "")
      .replace(/#\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, "") // strip HTML tags
      .replace(/^>\s+/gm, "Spirit of Prophecy quotes: ")
      .replace(/>\s+/g, "Quoting: ")
      .replace(/^[-*]\s+/gm, "")
      .replace(/\n\s*\n/g, ". ")
      .replace(/\n/g, " ")
      .replace(/—/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const playChunk = useCallback((index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (index >= chunksRef.current.length || chunksRef.current.length === 0) {
      isSpeakingRef.current = false;
      isPausedRef.current = false;
      currentChunkIndexRef.current = 0;
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    currentChunkIndexRef.current = index;
    window.speechSynthesis.cancel();

    const chunkText = chunksRef.current[index];
    if (!chunkText) {
      playChunk(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunkText);
    utteranceRef.current = utterance;

    // Resolve system voice and acoustic parameters for currently selected curated voice
    const sysVoices = window.speechSynthesis.getVoices();
    const { voice, pitch, rate } = resolveVoiceAndParams(selectedVoiceIdRef.current, sysVoices);

    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => {
      if (!isPausedRef.current) {
        setIsSpeaking(true);
        setIsPaused(false);
      }
    };

    utterance.onend = () => {
      if (isPausedRef.current || !isSpeakingRef.current) {
        return;
      }
      const nextIndex = index + 1;
      currentChunkIndexRef.current = nextIndex;
      playChunk(nextIndex);
    };

    utterance.onerror = (e) => {
      if (isPausedRef.current || !isSpeakingRef.current) {
        return;
      }
      console.warn("Speech chunk playback notice:", e);
      const nextIndex = index + 1;
      currentChunkIndexRef.current = nextIndex;
      playChunk(nextIndex);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Update curated voices when system voices populate
  const populateVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const sysVoices = window.speechSynthesis.getVoices();
    if (!sysVoices || sysVoices.length === 0) return;

    const curatedList: SpeechVoiceOption[] = CURATED_VOICES_CONFIG.map((cfg) => {
      const { voice } = resolveVoiceAndParams(cfg.id, sysVoices);
      return {
        id: cfg.id,
        name: cfg.name,
        label: cfg.label,
        gender: cfg.gender,
        accent: "American",
        description: cfg.description,
        isNatural: true,
        lang: voice?.lang || "en-US",
        rawVoice: voice
      };
    });

    setAvailableVoices(curatedList);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    populateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [populateVoices]);

  const selectVoiceById = useCallback(
    (id: string) => {
      const validId = CURATED_VOICES_CONFIG.some((c) => c.id === id)
        ? (id as CuratedVoiceId)
        : "male-stevens";

      setSelectedVoiceId(validId);
      selectedVoiceIdRef.current = validId;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_VOICE_ID, validId);
        const match = CURATED_VOICES_CONFIG.find((c) => c.id === validId);
        if (match) {
          localStorage.setItem(STORAGE_KEY_VOICE_LEGACY, match.name);
        }
      }

      // If currently speaking, seamlessly re-speak current chunk with newly selected voice
      if (isSpeakingRef.current && !isPausedRef.current) {
        playChunk(currentChunkIndexRef.current);
      }
    },
    [playChunk]
  );

  const selectVoiceByName = useCallback(
    (nameOrId: string) => {
      const match = CURATED_VOICES_CONFIG.find(
        (c) => c.id === nameOrId || c.name === nameOrId || c.label === nameOrId
      );
      selectVoiceById(match ? match.id : "male-stevens");
    },
    [selectVoiceById]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    isPausedRef.current = false;
    currentChunkIndexRef.current = 0;
    currentRawTextRef.current = "";
    chunksRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (!isSpeakingRef.current || isPausedRef.current) {
      return;
    }

    isPausedRef.current = true;
    setIsPaused(true);
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (!isSpeakingRef.current || !isPausedRef.current) {
      return;
    }

    isPausedRef.current = false;
    setIsPaused(false);
    setIsSpeaking(true);

    playChunk(currentChunkIndexRef.current);
  }, [playChunk]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        console.warn("Speech synthesis is not supported on this browser.");
        return;
      }

      window.speechSynthesis.cancel();

      const cleanedText = cleanMarkdownForAudio(text);
      if (!cleanedText) return;

      const chunks = splitIntoSpeechChunks(cleanedText);
      if (chunks.length === 0) return;

      chunksRef.current = chunks;
      currentRawTextRef.current = text;
      currentChunkIndexRef.current = 0;
      isPausedRef.current = false;
      isSpeakingRef.current = true;

      setIsSpeaking(true);
      setIsPaused(false);

      playChunk(0);
    },
    [playChunk]
  );

  const togglePlay = useCallback(
    (text: string) => {
      if (text !== currentRawTextRef.current) {
        speak(text);
        return;
      }

      if (isSpeakingRef.current) {
        if (isPausedRef.current) {
          resume();
        } else {
          pause();
        }
      } else {
        speak(text);
      }
    },
    [speak, pause, resume]
  );

  const activeOption = CURATED_VOICES_CONFIG.find((c) => c.id === selectedVoiceId) || CURATED_VOICES_CONFIG[0];

  return {
    isSpeaking,
    isPaused,
    isSupported,
    availableVoices,
    selectedVoiceId,
    selectedVoiceName: activeOption.name,
    selectedVoiceObj: availableVoices.find((v) => v.id === selectedVoiceId),
    selectVoiceById,
    selectVoiceByName,
    speak,
    pause,
    resume,
    stop,
    togglePlay
  };
}
