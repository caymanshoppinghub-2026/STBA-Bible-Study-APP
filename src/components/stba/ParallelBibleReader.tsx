import React, { useRef, useState, useEffect } from "react";
import { ParallelVerse, getParallelVerses } from "./bibleData";
import { Copy, FileText, BookOpen, MessageSquare, BookMarked, Sparkles, Volume2, Pause, Eraser, ArrowUp, ArrowDown, Search, Loader2, ChevronUp, ChevronDown, Play } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { HighlightItem } from "../../types/notebook";
import { fetchHighlightsFromSupabase, saveHighlightToSupabase, deleteHighlightFromSupabase } from "../../lib/notebookSync";
import { getElderStephenVoice } from "./RightPaneTools";
import { getPreviousVerse, getNextVerse } from "./bibleMetadata";
import { BIBLICAL_NAMES_DICTIONARY, BiblicalName } from "./biblicalNames";
import { ViewModeToggle, ViewMode } from "./ViewModeToggle";
import { panelSyncBus } from "../../lib/storage/panelSyncChannel";
import { stbaStorage } from "../../lib/storage/indexedDbClient";

interface ParallelBibleReaderProps {
  reference: string;
  topic?: string;
  report?: any;
  translationsFromReport?: { version: string; text: string }[];
  customVerses?: ParallelVerse[];
  activeVerseIndex: number | null;
  setActiveVerseIndex: (idx: number | null) => void;
  onVerseSelect?: (verseNumber: number, verseReference: string, verse: any) => void;
  isExegesisSynthesizing?: boolean;
  synthesizingVerseRef?: string;
  onAddNoteFromText?: (text: string, refNotes: string) => void;
  onSendToElderStephen?: (text: string) => void;
  onWordStudyTrigger?: (word: string) => void;
  theme: "light" | "dark";
  bibleFontSize?: number;
  setBibleFontSize?: (size: number) => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  onSelectTrack?: (ref: string, topic: string) => void;
  onNavigateVerse?: (newRef: string, newVerseNum: number) => void;
  queryRef?: string;
  setQueryRef?: (val: string) => void;
  queryTopic?: string;
  setQueryTopic?: (val: string) => void;
  lastActiveSearchField?: 'ref' | 'topic';
  setLastActiveSearchField?: (field: 'ref' | 'topic') => void;
  onLoadMoreTopicVerses?: () => void;
  hasMoreTopicVerses?: boolean;
  loadingMoreTopicVerses?: boolean;
  isTopicSearchActive?: boolean;
  handleLoadExegesis?: (ref: string, topic: string) => void;
  loading?: boolean;
  errorMsg?: string;
  globalHeaderCollapsed?: boolean;
  setGlobalHeaderCollapsed?: (val: boolean) => void;
}

export const ParallelBibleReader: React.FC<ParallelBibleReaderProps> = ({
  reference,
  topic,
  report,
  translationsFromReport,
  customVerses,
  activeVerseIndex,
  setActiveVerseIndex,
  onVerseSelect,
  isExegesisSynthesizing = false,
  synthesizingVerseRef = "",
  onAddNoteFromText,
  onSendToElderStephen,
  onWordStudyTrigger,
  theme,
  bibleFontSize,
  setBibleFontSize,
  viewMode,
  setViewMode,
  onSelectTrack,
  onNavigateVerse,
  queryRef = "",
  setQueryRef,
  queryTopic = "",
  setQueryTopic,
  lastActiveSearchField = 'ref',
  setLastActiveSearchField,
  onLoadMoreTopicVerses,
  hasMoreTopicVerses = false,
  loadingMoreTopicVerses = false,
  isTopicSearchActive = false,
  handleLoadExegesis,
  loading = false,
  errorMsg = "",
  globalHeaderCollapsed = false,
  setGlobalHeaderCollapsed
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useApp();
  const [verses, setVerses] = useState<ParallelVerse[]>([]);
  const [allHighlights, setAllHighlights] = useState<HighlightItem[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(["NKJV"]);
  const [selectedTextData, setSelectedTextData] = useState<{
    text: string;
    verseRef: string;
    verseNo: string;
    translation: string;
    x: number;
    y: number;
  } | null>(null);

  // Load persistent highlights on mount and reference change
  useEffect(() => {
    const loadSavedHighlights = async () => {
      try {
        const items = await fetchHighlightsFromSupabase();
        setAllHighlights(items);
      } catch (err) {
        console.warn("Failed loading primary highlights:", err);
      }
    };
    loadSavedHighlights();
  }, [reference]);

  // Audio reader states
  const [speakingVerse, setSpeakingVerse] = useState<string | number | null>(null); // active verse number being read
  const [speakingCharIndex, setSpeakingCharIndex] = useState<number | null>(null);

  // Biblical Name Pronunciation states
  const [pronouncingName, setPronouncingName] = useState<BiblicalName | null>(null);
  const [pronouncingLoading, setPronouncingLoading] = useState(false);
  const [pronouncingPlaying, setPronouncingPlaying] = useState(false);
  const [pronounceVoice, setPronounceVoice] = useState<string>("Puck");
  const nameAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const nameAudioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (nameAudioRef.current) {
        try { nameAudioRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Local font size fallback if parent doesn't provide
  const [localFontSize, setLocalFontSize] = useState(14);
  const currentFontSize = bibleFontSize !== undefined ? bibleFontSize : localFontSize;
  const setCurrentFontSize = setBibleFontSize !== undefined ? setBibleFontSize : setLocalFontSize;

  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    // Trigger loading more verses when approaching bottom (within 280px)
    if (distanceToBottom < 280) {
      if (hasMoreTopicVerses && !loadingMoreTopicVerses && onLoadMoreTopicVerses) {
        onLoadMoreTopicVerses();
      }
    }
  };

  const handlePrev = () => {
    if (!onNavigateVerse) return;
    const currentVerseNum = activeVerseIndex || (verses[0]?.verseNumber) || 1;
    const currentRef = verses[0]?.reference || reference;
    const prev = getPreviousVerse(currentRef, currentVerseNum);
    if (prev) {
      onNavigateVerse(prev.reference, prev.verseNumber);
    }
  };

  const handleNext = () => {
    if (!onNavigateVerse) return;
    const currentVerseNum = activeVerseIndex || (verses[0]?.verseNumber) || 1;
    const currentRef = verses[0]?.reference || reference;
    const next = getNextVerse(currentRef, currentVerseNum);
    if (next) {
      onNavigateVerse(next.reference, next.verseNumber);
    }
  };

  // Load verses from preset or report
  useEffect(() => {
    if (customVerses !== undefined) {
      setVerses(customVerses);
      if (customVerses && customVerses.length > 0) {
        stbaStorage.savePassage(reference, customVerses).catch(() => {});
      }
    } else {
      const loaded = getParallelVerses(reference, translationsFromReport);
      setVerses(loaded);
      if (loaded && loaded.length > 0) {
        stbaStorage.savePassage(reference, loaded).catch(() => {});
      }
    }
  }, [reference, translationsFromReport, customVerses]);

  const toggleVersion = (version: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(version)) {
        if (prev.length === 1) return prev;
        return prev.filter((v) => v !== version);
      } else {
        const logicalOrder = ["NKJV", "KJV", "ESV", "NASB"];
        const next = [...prev, version];
        return logicalOrder.filter((v) => next.includes(v));
      }
    });
  };

  // Get best high-fidelity natural local voice
  const getBestLocalNeuralVoice = () => {
    return getElderStephenVoice();
  };

  // Speak verse aloud with natural pacing and word tracking sync
  const speakVerseAloud = (verseNumber: string | number, textToSpeak: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingVerse === verseNumber) {
      window.speechSynthesis.cancel();
      setSpeakingVerse(null);
      setSpeakingCharIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95; // deliberate pastoral speed
    utterance.pitch = 0.95; // warmer and richer resonance

    const voice = getBestLocalNeuralVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setSpeakingVerse(verseNumber);
      setSpeakingCharIndex(0);
    };

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setSpeakingCharIndex(e.charIndex);
      }
    };

    utterance.onend = () => {
      setSpeakingVerse(null);
      setSpeakingCharIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingVerse(null);
      setSpeakingCharIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Safe voices refresh on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Smooth scroll to active verse when activeVerseIndex changes
  useEffect(() => {
    if (activeVerseIndex !== null && activeVerseIndex !== undefined) {
      const el = document.getElementById(`bible-verse-${activeVerseIndex}`) || document.querySelector(`[data-verse="${activeVerseIndex}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeVerseIndex]);

  // Reactive cross-panel synchronization listener (< 1ms inter-panel sync with SDABibleCommentary)
  useEffect(() => {
    const unsubVerse = panelSyncBus.subscribe("VERSE_SELECTED", (payload: any) => {
      if (!payload || payload.source === "ParallelBibleReader") return;
      if (typeof payload.verseNumber === "number") {
        setActiveVerseIndex(payload.verseNumber);
        setTimeout(() => {
          const el = document.getElementById(`bible-verse-${payload.verseNumber}`) || document.querySelector(`[data-verse="${payload.verseNumber}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 60);
      }
    });

    const unsubCommentary = panelSyncBus.subscribe("COMMENTARY_SYNC", (payload: any) => {
      if (!payload || payload.source === "ParallelBibleReader") return;
      if (typeof payload.verseNumber === "number") {
        setActiveVerseIndex(payload.verseNumber);
        setTimeout(() => {
          const el = document.getElementById(`bible-verse-${payload.verseNumber}`) || document.querySelector(`[data-verse="${payload.verseNumber}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 60);
      }
    });

    return () => {
      unsubVerse();
      unsubCommentary();
    };
  }, [setActiveVerseIndex]);

  // Helper to build a clean display reference for a single verse, e.g. "Revelation 14:6"
  const getSpecificVerseRef = (fullRef: string, verseNum: string | number): string => {
    const parts = fullRef.split(':');
    if (parts.length >= 1) {
      const bookAndChapter = parts[0].trim();
      return `${bookAndChapter}:${verseNum}`;
    }
    return `${fullRef} v. ${verseNum}`;
  };

  // Handle selection detection for floating tooltips
  const handleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) {
      setSelectedTextData(null);
      return;
    }

    let element: Node | null = selection.anchorNode;
    let verseNo = "1";
    let translation = "NKJV"; // Default fallback
    
    while (element && element !== containerRef.current) {
      if (element instanceof HTMLElement) {
        if (element.dataset.verse) {
          verseNo = element.dataset.verse;
        }
        if (element.dataset.version) {
          translation = element.dataset.version;
        }
        if (element.dataset.verse && element.dataset.version) {
          break;
        }
      }
      element = element.parentNode;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedTextData({
      text: selectedText,
      verseRef: `${reference} v. ${verseNo}`,
      verseNo,
      translation,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 44
    });
  };

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setSelectedTextData(null);
  };

  const handleCopy = () => {
    if (!selectedTextData) return;
    navigator.clipboard.writeText(`"${selectedTextData.text}" (${selectedTextData.verseRef})`);
    clearSelection();
  };

  const applyHighlight = async (color: string) => {
    if (!selectedTextData) return;
    const parsedVerseRef = getSpecificVerseRef(reference, selectedTextData.verseNo);
    
    const newHighlight: HighlightItem = {
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: (user as any)?.id || user?.email || "guest-local",
      translation: selectedTextData.translation,
      verse_reference: parsedVerseRef,
      text_snippet: selectedTextData.text,
      color: color,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setAllHighlights(prev => [...prev.filter(h => h.id !== newHighlight.id), newHighlight]);

    try {
      await saveHighlightToSupabase(newHighlight);
    } catch (err) {
      console.warn("Failed saving highlight to Supabase:", err);
    }

    clearSelection();
  };

  const clearHighlight = async () => {
    if (!selectedTextData) return;
    const parsedVerseRef = getSpecificVerseRef(reference, selectedTextData.verseNo);
    const trans = selectedTextData.translation;

    // Find and delete matching highlights
    const toDelete = allHighlights.filter(h => 
      h.verse_reference === parsedVerseRef && h.translation === trans
    );

    setAllHighlights(prev => prev.filter(h => 
      !(h.verse_reference === parsedVerseRef && h.translation === trans)
    ));

    for (const h of toDelete) {
      try {
        await deleteHighlightFromSupabase(h.id);
      } catch (err) {
        console.warn("Error deleting highlight:", err);
      }
    }

    clearSelection();
  };

  const handleAddNote = () => {
    if (!selectedTextData || !onAddNoteFromText) return;
    onAddNoteFromText(selectedTextData.text, selectedTextData.verseRef);
    clearSelection();
  };

  const handleSendToElder = () => {
    if (!selectedTextData || !onSendToElderStephen) return;
    onSendToElderStephen(`In studying ${selectedTextData.verseRef}, I selected: "${selectedTextData.text}". Can you elaborate on the theological weight of this specific excerpt?`);
    clearSelection();
  };

  const handleWordStudy = () => {
    if (!selectedTextData || !onWordStudyTrigger) return;
    const cleanWord = selectedTextData.text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").trim().split(/\s+/)[0] || selectedTextData.text;
    onWordStudyTrigger(cleanWord);
    clearSelection();
  };

  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-3";
      case 4:
      default: return "grid-cols-4";
    }
  };

  // Helper to render plain translation text with beautiful active word highlight sync
  const renderTextWithWordHighlight = (text: string, isSpeaking: boolean, activeIdx: number | null) => {
    if (!isSpeaking || activeIdx === null) return text;

    const parts = text.split(/(\s+)/);
    let accumulated = 0;

    return parts.map((part, index) => {
      const start = accumulated;
      accumulated += part.length;
      const end = accumulated;

      const isWord = !/\s+/.test(part);
      const isCurrent = isWord && activeIdx >= start && activeIdx < end;

      return (
        <span
          key={index}
          className={`transition-all duration-100 rounded ${
            isCurrent
              ? "bg-amber-300 text-gray-950 dark:bg-amber-500/40 dark:text-amber-100 px-1 font-bold shadow-xs scale-105 inline-block"
              : ""
          }`}
        >
          {part}
        </span>
      );
    });
  };

  const renderTextWithDifficultNames = (node: React.ReactNode): React.ReactNode => {
    if (typeof node !== "string") {
      return node;
    }

    const namesPattern = BIBLICAL_NAMES_DICTIONARY.map(n => n.name).join("|");
    const regex = new RegExp(`\\b(${namesPattern})\\b`, "gi");
    const parts = node.split(regex);
    if (parts.length <= 1) return node;

    return parts.map((part, idx) => {
      const matchedName = BIBLICAL_NAMES_DICTIONARY.find(
        n => n.name.toLowerCase() === part.toLowerCase()
      );
      if (matchedName) {
        return (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setPronouncingName(matchedName);
              playNamePronunciation(matchedName);
            }}
            className="underline decoration-dotted decoration-amber-500 hover:decoration-solid hover:text-amber-600 dark:hover:text-amber-400 font-semibold cursor-pointer transition-all inline-flex items-center gap-0.5 bg-transparent border-none p-0 text-inherit focus:outline-hidden"
            title={`Click to hear AI pronunciation for ${matchedName.name}`}
          >
            {part}
            <Volume2 className="w-3 h-3 text-amber-500 shrink-0 inline opacity-75 hover:opacity-100" />
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const playNamePronunciation = async (nameObj: BiblicalName) => {
    if (pronouncingLoading) return;

    // Stop active audio
    if (nameAudioRef.current) {
      try { nameAudioRef.current.stop(); } catch (e) {}
      nameAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setPronouncingLoading(true);
    setPronouncingPlaying(false);

    try {
      const textToSay = `The pronunciation is ${nameObj.name}. ${nameObj.name}.`;
      const response = await fetch("/api/study/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSay, voice: pronounceVoice })
      });

      if (!response.ok) throw new Error("TTS API failed");
      const data = await response.json();

      if (data.success && data.audio) {
        // Decode raw base64 PCM into Int16Array
        const binaryString = window.atob(data.audio);
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
        const ctx = nameAudioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        nameAudioCtxRef.current = ctx;

        const pcmBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
        pcmBuffer.getChannelData(0).set(float32Array);

        const source = ctx.createBufferSource();
        source.buffer = pcmBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
          setPronouncingPlaying(false);
        };

        nameAudioRef.current = source;
        source.start(0);
        setPronouncingPlaying(true);
      } else {
        playLocalBrowserPronunciation(nameObj.name);
      }
    } catch (err) {
      console.warn("AI Pronunciation failed, playing browser fallback:", err);
      playLocalBrowserPronunciation(nameObj.name);
    } finally {
      setPronouncingLoading(false);
    }
  };

  const playLocalBrowserPronunciation = (nameText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(nameText);
    utterance.rate = 0.8;
    utterance.pitch = 0.95;
    
    const voice = getElderStephenVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => {
      setPronouncingPlaying(true);
    };
    utterance.onend = () => {
      setPronouncingPlaying(false);
    };
    utterance.onerror = () => {
      setPronouncingPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Helper to render persistent user-created highlights for verses or words/phrases
  const renderTextWithUserHighlights = (
    text: string, 
    cellHighlights: HighlightItem[], 
    isSpeaking: boolean, 
    activeIdx: number | null
  ) => {
    if (isSpeaking && activeIdx !== null) {
      return renderTextWithWordHighlight(text, isSpeaking, activeIdx);
    }

    if (!cellHighlights || cellHighlights.length === 0) {
      return renderTextWithDifficultNames(text);
    }

    // Sort highlights by length descending to match larger blocks before sub-phrases
    const sortedHighlights = [...cellHighlights]
      .filter(h => h.text_snippet && text.toLowerCase().includes(h.text_snippet.toLowerCase()))
      .sort((a, b) => (b.text_snippet?.length || 0) - (a.text_snippet?.length || 0));

    // If there is any highlight representing the whole verse (no snippet, or snippet equals full text)
    const wholeVerseHighlight = cellHighlights.find(h => 
      !h.text_snippet || h.text_snippet.trim() === "" || h.text_snippet.trim().toLowerCase() === text.trim().toLowerCase()
    );

    if (wholeVerseHighlight || sortedHighlights.length === 0) {
      const hColor = wholeVerseHighlight ? wholeVerseHighlight.color : cellHighlights[0].color;
      return (
        <span 
          style={{ 
            backgroundColor: hColor, 
            color: "#12131a", // Deep high-contrast text color
            borderRadius: "0.125rem",
            padding: "0.06rem 0.15rem",
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone"
          }}
        >
          {renderTextWithDifficultNames(text)}
        </span>
      );
    }

    // Otherwise, do sub-string highlights
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = sortedHighlights.map(h => `(${escapeRegex(h.text_snippet!)})`).join('|');
    const regex = new RegExp(pattern, 'gi');

    const parts = text.split(regex);
    if (parts.length <= 1) {
      return text;
    }

    return parts.map((part, idx) => {
      if (!part) return null;

      const matchingHighlight = sortedHighlights.find(
        h => h.text_snippet && h.text_snippet.toLowerCase() === part.toLowerCase()
      );

      if (matchingHighlight) {
        return (
          <span 
            key={idx} 
            style={{ 
              backgroundColor: matchingHighlight.color, 
              color: "#12131a", // Deep high-contrast text color
              borderRadius: "0.125rem",
              padding: "0.06rem 0.15rem",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone"
            }}
          >
            {renderTextWithDifficultNames(part)}
          </span>
        );
      }

      return <span key={idx}>{renderTextWithDifficultNames(part)}</span>;
    });
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden select-text relative"
      ref={containerRef}
      onMouseUp={handleMouseUp}
    >
      {/* 1. DYNAMIC CONTEXTUAL BIBLE TEXT HEADER */}
      {(() => {
        // Simple internal parser helper to split passage from verse range safely
        const parseReference = (refStr: string) => {
          const trimmed = (refStr || "").trim();
          const colonIndex = trimmed.lastIndexOf(":");
          if (colonIndex !== -1) {
            return {
              passage: trimmed.substring(0, colonIndex).trim(),
              verseRange: trimmed.substring(colonIndex + 1).trim()
            };
          }
          return {
            passage: trimmed,
            verseRange: ""
          };
        };

        const { passage, verseRange } = parseReference(reference);
        const isTopicMode = (reference && (reference.startsWith("Topic:") || reference.startsWith("Search:"))) || (topic && (topic.startsWith("Topic:") || topic.startsWith("Search:")));
        const currentTopic = topic || report?.topic || (isTopicMode ? reference : "Custom Scripture Study");
        const currentTheme = report?.step2?.genre || "Covenant Sanctuary Truth";
        const briefSummary = report?.step1?.summary || report?.introduction || "Systematic verification of original language dictionary roots and covenant parallel references.";

        return (
          <div className={`px-4 py-4 border-b flex flex-col md:flex-row md:items-start justify-between gap-4 select-none transition-all duration-150 ${
            theme === "dark" 
              ? "bg-[#141922] border-[#21262D]" 
              : "bg-[#FDFAF5] border-[#E8E2D5]"
          }`}>
            {/* Left Portion: Scriptural Context & Identity Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h2 className="font-serif text-[15px] sm:text-[17px] md:text-lg font-black tracking-tight text-[#C9973A] uppercase">
                  {currentTopic}
                </h2>
                {isTopicMode && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30">
                    {verses.length} Scripture Passages
                  </span>
                )}
              </div>

              {isTopicMode && (
                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Click any verse below to activate 7-step theological synthesis in the background.</span>
                </p>
              )}

              {isExegesisSynthesizing && (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500 dark:text-amber-400 font-bold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9973A] shrink-0" />
                  <span>Synthesizing exegesis for {synthesizingVerseRef || "selected verse"} in background...</span>
                </div>
              )}
            </div>

            {/* Right Portion: Readability Tuning Slider & Parallel Version Switches, and Search inputs below them */}
            <div className="flex flex-col gap-3 shrink-0 self-stretch md:self-start items-start md:items-end">
              {/* Row 1: Readability tuning and Bible Buttons */}
              <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-start md:justify-end">
                {/* Workspace Tools Collapse Toggle Button (Desktop Only) */}
                <button
                  onClick={() => setGlobalHeaderCollapsed && setGlobalHeaderCollapsed(!globalHeaderCollapsed)}
                  className={`hidden md:flex p-1.5 rounded-lg border transition-all cursor-pointer items-center justify-center ${
                    theme === "dark" 
                      ? "bg-[#1C212B] border-gray-800 text-gray-300 hover:text-[#C9A86A] hover:border-[#C9A86A]/40" 
                      : "bg-white border-stone-200 text-gray-600 hover:text-[#C9A86A] hover:border-[#C9A86A]/40"
                  }`}
                  title={globalHeaderCollapsed ? "Expand Workspace Tools" : "Collapse Workspace Tools"}
                >
                  {globalHeaderCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>

                {/* Font scaling ergonomics panel */}
                <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === "dark" ? "bg-[#1C212B] border-gray-800" : "bg-white border-stone-200"
                }`}>
                  <span className="text-[10px] font-mono text-gray-400 font-extrabold">&alpha;A</span>
                  <input 
                    type="range" 
                    min="11" 
                    max="26" 
                    value={currentFontSize}
                    onChange={(e) => setCurrentFontSize(parseInt(e.target.value))}
                    className="w-16 sm:w-24 h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    title="Readability Font Scaling"
                  />
                  <span className="text-[10px] font-mono text-gray-400 font-extrabold">{currentFontSize}px</span>
                </div>

                {/* Translation selects picker check buttons */}
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  {["NKJV", "KJV", "ESV", "NASB"].map((version) => {
                    const isSelected = selectedVersions.includes(version);
                    return (
                      <button
                        key={version}
                        onClick={() => toggleVersion(version)}
                        className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold tracking-wider transition-all rounded cursor-pointer border outline-none focus:outline-none focus:ring-0 ${
                          isSelected
                            ? theme === "dark"
                              ? "text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]"
                              : "text-[#C9A86A] bg-[#C9A86A]/15 border-[#C9A86A]"
                            : theme === "dark"
                              ? "text-gray-300 bg-transparent border-transparent hover:text-[#C9A86A] hover:bg-[#C9A86A]/5 hover:border-[#C9A86A]/20 hover:shadow-[0_0_8px_rgba(201,168,106,0.25)]"
                              : "text-gray-700 bg-transparent border-transparent hover:text-[#C9A86A] hover:bg-[#C9A86A]/5 hover:border-[#C9A86A]/20 hover:shadow-[0_0_8px_rgba(201,168,106,0.25)]"
                        }`}
                      >
                        {version}
                      </button>
                    );
                  })}

                  {/* Mobile-only Search Button directly to the right of NKJV, KJV, ESV, NASB */}
                  <button
                    onClick={() => handleLoadExegesis && handleLoadExegesis(queryRef, queryTopic)}
                    disabled={loading}
                    className="md:hidden bg-[#C9973A] hover:bg-[#B2822B] text-white px-3 py-1.5 text-xs rounded font-mono font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Search
                  </button>
                </div>
              </div>

              {/* Row 2: Search Inputs (Scripture & Topic search boxes, moved below the Bible buttons) */}
              <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-start md:justify-end">
                {/* Scripture Reference Input */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={queryRef}
                    onChange={(e) => {
                      setQueryRef && setQueryRef(e.target.value);
                      setLastActiveSearchField && setLastActiveSearchField('ref');
                    }}
                    onFocus={() => {
                      setLastActiveSearchField && setLastActiveSearchField('ref');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && handleLoadExegesis) {
                        handleLoadExegesis(queryRef, queryTopic);
                      }
                    }}
                    placeholder="e.g. Genesis or John 1:3"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`px-2.5 py-1.5 text-xs rounded outline-none w-36 sm:w-44 font-serif border transition-all ${
                      queryRef && queryTopic && lastActiveSearchField === 'ref'
                        ? "border-[#C9973A] ring-1 ring-[#C9973A] shadow-[0_0_8px_rgba(201,151,58,0.3)]"
                        : theme === "dark" ? "bg-[#161B22] border-[#30363D] text-white" : "bg-white border-gray-300 text-gray-800"
                    } ${theme === "dark" ? "bg-[#161B22] text-white" : "bg-white text-gray-800"}`}
                  />
                  {queryRef && queryTopic && lastActiveSearchField === 'ref' && (
                    <span 
                      className="absolute -top-2 right-1.5 bg-[#C9973A] text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-tight pointer-events-none shadow-xs"
                      title="Prioritized search field (most recently edited)"
                    >
                      Priority
                    </span>
                  )}
                </div>

                {/* Topic / Keyword Search Input */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={queryTopic}
                    onChange={(e) => {
                      setQueryTopic && setQueryTopic(e.target.value);
                      setLastActiveSearchField && setLastActiveSearchField('topic');
                    }}
                    onFocus={() => {
                      setLastActiveSearchField && setLastActiveSearchField('topic');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && handleLoadExegesis) {
                        handleLoadExegesis(queryRef, queryTopic);
                      }
                    }}
                    placeholder="Topic (e.g. grace, faith)..."
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`px-2.5 py-1.5 text-xs rounded outline-none w-44 sm:w-56 font-sans border transition-all ${
                      queryRef && queryTopic && lastActiveSearchField === 'topic'
                        ? "border-[#C9973A] ring-1 ring-[#C9973A] shadow-[0_0_8px_rgba(201,151,58,0.3)]"
                        : theme === "dark" ? "bg-[#161B22] border-[#30363D] text-white" : "bg-white border-gray-300 text-gray-800"
                    } ${theme === "dark" ? "bg-[#161B22] text-white" : "bg-white text-gray-800"}`}
                  />
                  {queryRef && queryTopic && lastActiveSearchField === 'topic' && (
                    <span 
                      className="absolute -top-2 right-1.5 bg-[#C9973A] text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-tight pointer-events-none shadow-xs"
                      title="Prioritized search field (most recently edited)"
                    >
                      Priority
                    </span>
                  )}
                </div>

                {/* Desktop Search Button */}
                <button
                  onClick={() => handleLoadExegesis && handleLoadExegesis(queryRef, queryTopic)}
                  disabled={loading}
                  className="hidden md:flex bg-[#C9973A] hover:bg-[#B2822B] text-white px-3 py-1.5 text-xs rounded font-mono font-bold tracking-wide transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap"
                  title={
                    queryRef && queryTopic 
                      ? `Searching by ${lastActiveSearchField === 'topic' ? 'Topic ("' + queryTopic + '")' : 'Scripture ("' + queryRef + '")'} (most recently edited)` 
                      : "Search Scripture or Topic"
                  }
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Search
                </button>
              </div>

              {/* Row 3: Error Message (if any) */}
              {errorMsg && (
                <span className="text-red-500 font-mono text-[11px] animate-pulse self-start md:self-end">
                  *{errorMsg}
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Styled Grid Header for active columns and navigation */}
      <div className={`flex items-center justify-between border-b transition-all ${
        theme === "dark" 
          ? "bg-[#1E2530] border-[#2C3545]" 
          : "bg-[#F3EFE9] border-[#E5DFD5]"
      }`}>
        <div className={`grid ${getGridColsClass(selectedVersions.length)} select-none px-4 py-2 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase flex-1 transition-all ${
          theme === "dark" ? "text-amber-500/80" : "text-[#222]/70"
        }`}>
          {selectedVersions.map((version, idx) => (
            <div 
              key={version} 
              className={`pl-4 ${
                idx < selectedVersions.length - 1 
                  ? theme === "dark" ? "border-r border-[#2C3545]/50" : "border-r border-[#E5DFD5]/60"
                  : ""
              }`}
            >
              {version}
            </div>
          ))}
        </div>
        
        {/* Navigation Arrow Controls */}
        <div className="flex items-center gap-1.5 px-3 shrink-0">
          <button 
            type="button" 
            onClick={handlePrev}
            title="Previous Verse"
            className={`p-1 rounded cursor-pointer transition-all border outline-none focus:outline-none focus:ring-0 ${
              theme === "dark"
                ? "bg-[#161B22] border-gray-800 text-amber-500 hover:text-white hover:bg-stone-800/80 hover:border-[#C9A86A]/40"
                : "bg-white border-stone-200 text-stone-700 hover:text-black hover:bg-amber-500/5 hover:border-[#C9A86A]/40 shadow-sm"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={handleNext}
            title="Next Verse"
            className={`p-1 rounded cursor-pointer transition-all border outline-none focus:outline-none focus:ring-0 ${
              theme === "dark"
                ? "bg-[#161B22] border-gray-800 text-amber-500 hover:text-white hover:bg-stone-800/80 hover:border-[#C9A86A]/40"
                : "bg-white border-stone-200 text-stone-700 hover:text-black hover:bg-amber-500/5 hover:border-[#C9A86A]/40 shadow-sm"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Synchronously scrolled grid elements body */}
      <div 
        onScroll={handleContainerScroll}
        className={`flex-1 overflow-y-auto scroll-smooth divide-y transition-all ${
          theme === "dark" ? "divide-[#21262D]" : "divide-[#E5DFD5]"
        }`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {verses.length === 0 ? (
          (reference.toLowerCase().startsWith("search:") || reference.toLowerCase().includes("search") || (topic && topic.toLowerCase().includes("search"))) ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto select-none space-y-6 animate-fade-in">
              <div className={`p-4 rounded-full border ${
                theme === "dark" ? "bg-stone-900 border-gray-800 text-[#C9973A]" : "bg-amber-50/50 border-amber-200 text-[#C9973A]"
              }`}>
                <BookOpen className="w-8 h-8 opacity-40" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#C9973A]">
                  No verses found for this topic.
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  theme === "dark" ? "text-stone-400" : "text-stone-600"
                }`}>
                  We searched the entire Bible from Genesis to Revelation but found no verses containing all your search keywords. Try using singular or simpler terms (e.g., <span className="font-serif italic font-bold">faith</span>, <span className="font-serif italic font-bold">love</span>, <span className="font-serif italic font-bold">grace</span>).
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto select-none space-y-6 animate-fade-in">
              <div className={`p-4 rounded-full border ${
                theme === "dark" ? "bg-stone-900 border-gray-800 text-[#C9973A]" : "bg-amber-50/50 border-amber-200 text-[#C9973A]"
              }`}>
                <BookOpen className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#C9973A]">
                  Unroll a Scripture Scroll
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  theme === "dark" ? "text-stone-400" : "text-stone-600"
                }`}>
                  Input a custom Bible book and reference above (e.g., <span className="font-serif italic font-bold">Genesis 1</span> or <span className="font-serif italic font-bold">John 3</span>), or choose one of the preloaded tracks below to begin your dynamic parallel translations study instantly.
                </p>
              </div>

              <div className="w-full space-y-2.5">
                <span className={`text-[10px] uppercase font-mono tracking-wider block font-bold text-left mb-1 ${
                  theme === "dark" ? "text-stone-500" : "text-stone-400"
                }`}>
                  Recommended Biblical Studies:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    { ref: "Genesis 1:1-5", topic: "The Creation Sola Baseline" },
                    { ref: "Psalms 23:1-6", topic: "The Divine Shepherd Covenant" },
                    { ref: "Isaiah 53:1-6", topic: "The Suffering Servant Prophecy" },
                    { ref: "John 3:14-17", topic: "The Love of the Father" },
                    { ref: "Revelation 14:6-12", topic: "The Three Angels' Messages" },
                  ].map((track) => (
                    <button
                      key={track.ref}
                      onClick={() => onSelectTrack?.(track.ref, track.topic)}
                      className={`flex items-start gap-2.5 p-2.5 rounded text-xs select-none transition-all cursor-pointer border hover:shadow-sm ${
                        theme === "dark"
                          ? "bg-[#161B22] border-gray-800 hover:border-[#C9973A] text-gray-300 hover:text-white"
                          : "bg-[#FFF] border-stone-200 hover:border-[#C9973A] text-gray-700 hover:text-black"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 text-[#C9973A] shrink-0" />
                      <div>
                        <div className="font-serif font-extrabold tracking-tight">{track.ref}</div>
                        <div className="text-[10px] opacity-75 font-mono">{track.topic}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          verses.map((verse, vIdx) => {
            const isHighlightedRow = activeVerseIndex === verse.verseNumber;
            
            // Get the first highlight color of this verse (across any translation) to set optional left border
            const rowVerseRef = getSpecificVerseRef(verse.reference || reference, verse.verseNumber);
            const firstHL = allHighlights.find(h => h.verse_reference === rowVerseRef);
            const userHighlightColor = firstHL ? firstHL.color : undefined;
            
            const isSpeakingThis = speakingVerse === verse.verseNumber;
            const showSectionHeader = (vIdx === 0 || verses[vIdx - 1].reference !== verse.reference) && verse.reference;

            return (
              <React.Fragment key={`${verse.verseNumber}-${verse.reference || vIdx}`}>
                {showSectionHeader && (
                  <div 
                    className={`px-4 py-2.5 font-sans font-extrabold tracking-wider text-xs uppercase flex items-center justify-between gap-2 border-b select-none sticky top-0 z-10 ${
                      theme === "dark" 
                        ? "bg-[#161B22]/95 text-amber-400 border-[#21262D]" 
                        : "bg-amber-50/95 text-amber-800 border-amber-100"
                    }`}
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-nowrap">
                      <BookOpen className="w-3.5 h-3.5 text-[#C9973A] shrink-0" />
                      <span className="truncate">{verse.reference}</span>
                      {/* Audio button directly next to Bible Book and Verse title on mobile */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const textToSpeak = verse.text[selectedVersions[0] as keyof typeof verse.text] || "";
                          speakVerseAloud(verse.verseNumber, textToSpeak);
                        }}
                        className={`md:hidden p-1 rounded-full transition-all duration-250 cursor-pointer shrink-0 ml-1 ${
                          isSpeakingThis
                            ? "bg-amber-500 text-white animate-pulse"
                            : theme === "dark"
                              ? "text-gray-400 hover:text-amber-400 hover:bg-[#252E3C]"
                              : "text-gray-500 hover:text-amber-600 hover:bg-gray-100"
                        }`}
                        title={isSpeakingThis ? "Mute verse narrator" : "Listen to this verse in a pastoral voice"}
                      >
                        {isSpeakingThis ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                <div
                  id={`bible-verse-${verse.verseNumber}`}
                  data-verse={verse.verseNumber}
                  onClick={() => {
                    setActiveVerseIndex(verse.verseNumber);
                    const vRef = (verse as any).reference || rowVerseRef;
                    panelSyncBus.selectVerse(verse.verseNumber, vRef, "ParallelBibleReader");
                    if (onVerseSelect) {
                      onVerseSelect(verse.verseNumber, vRef, verse);
                    }
                  }}
                  className={`grid ${getGridColsClass(selectedVersions.length)} px-4 py-3 select-text leading-relaxed cursor-pointer transition-all font-bible ${
                    isHighlightedRow 
                      ? theme === "dark" ? "bg-[#332A1C]/60 border-l-2 border-amber-500" : "bg-amber-100/60 border-l-2 border-amber-600" 
                      : theme === "dark" ? "hover:bg-[#1C232E]" : "hover:bg-[#FDF9ED]"
                  }`}
                  style={{
                    fontSize: `${currentFontSize}px`,
                    // Beautiful fluid cubic font size transitions
                    transition: "font-size 0.35s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s ease, border-left 0.15s ease",
                    ...(userHighlightColor ? {
                      borderLeft: `4px solid ${userHighlightColor}`,
                      backgroundColor: theme === "dark" ? "rgba(201, 151, 58, 0.08)" : "rgba(253, 230, 138, 0.2)"
                    } : {})
                  }}
                >
                  {selectedVersions.map((version, idx) => {
                    const isFirstColumn = idx === 0;
                    const columnText = verse.text[version as keyof typeof verse.text] || "Translation not set";
                    
                    // Get specifically matching cell highlights
                    const cellVerseRef = getSpecificVerseRef(verse.reference || reference, verse.verseNumber);
                    const cellHighlights = allHighlights.filter(h => 
                      h.verse_reference === cellVerseRef && h.translation === version
                    );
                    
                    return (
                      <div 
                        key={version} 
                        data-verse={verse.verseNumber}
                        data-version={version}
                        className={`py-1 ${
                          idx < selectedVersions.length - 1 
                            ? theme === "dark" ? "border-r border-gray-800/45" : "border-r border-stone-200/50"
                            : ""
                        } ${
                          isFirstColumn ? "px-2 md:pl-4 md:pr-3 md:flex md:gap-3 items-start" : "px-2 md:px-4"
                        } font-bible`}
                      >
                        {isFirstColumn && (
                          <div className="hidden md:flex flex-col items-center gap-1.5 select-none shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Verse selection index */}
                            <span className={`text-[10px] md:text-sm font-semibold font-mono tracking-wide ${
                              theme === "dark" ? "text-amber-500/70" : "text-[#C9973A]"
                            }`}>
                              {verse.verseNumber}
                            </span>

                            {/* HIGH FIDELITY SPEAKER ICON KEY TO PLAY ACTIVE VERSE */}
                            <button
                              onClick={() => {
                                // Speak only active primary version
                                const textToSpeak = verse.text[selectedVersions[0] as keyof typeof verse.text] || "";
                                speakVerseAloud(verse.verseNumber, textToSpeak);
                              }}
                              className={`p-1 rounded-full transition-all duration-250 cursor-pointer ${
                                isSpeakingThis
                                  ? "bg-amber-500 text-white animate-pulse"
                                  : theme === "dark"
                                    ? "text-gray-500 hover:text-amber-400 hover:bg-[#252E3C]"
                                    : "text-gray-400 hover:text-amber-600 hover:bg-gray-100"
                              }`}
                              title={isSpeakingThis ? "Mute verse narrator" : "Listen to this verse in a pastoral voice"}
                            >
                              {isSpeakingThis ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                        <span className={`font-bible ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                          {isFirstColumn && (
                            <sup className="inline md:hidden font-mono font-bold text-[11px] text-[#C9973A] mr-1.5 select-none">
                              {verse.verseNumber}
                            </sup>
                          )}
                          {/* Render text with persistent cloud sync & active narrator speaking highlight */}
                          {renderTextWithUserHighlights(
                            columnText, 
                            cellHighlights, 
                            isSpeakingThis && version === selectedVersions[0], 
                            speakingCharIndex
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            );
          })
        )}
        {/* Infinite Scroll / Loading More Indicator for Topic Word Search */}
        {hasMoreTopicVerses && (
          <div className={`py-5 px-4 flex flex-col items-center justify-center gap-2 border-t select-none transition-all ${
            theme === "dark" ? "border-amber-500/20 bg-amber-500/5" : "border-amber-500/20 bg-amber-500/10"
          }`}>
            {loadingMoreTopicVerses ? (
              <div className="flex items-center gap-2 text-xs font-mono text-amber-500 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-[#C9973A]" />
                <span>Loading more canonical verses from Genesis to Revelation...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onLoadMoreTopicVerses && onLoadMoreTopicVerses()}
                className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-[#C9973A]/20 hover:bg-[#C9973A]/30 text-amber-500 dark:text-amber-400 border border-[#C9973A]/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Scroll or click to load more verses</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="h-28 md:h-16 w-full select-none flex flex-col items-center justify-center text-[11px] font-mono opacity-50 py-5 gap-1 text-center px-4">
          <span>— {verses.length > 0 ? `Displaying ${verses.length} Scripture Verses` : "End of Scripture Passage"} —</span>
          {isTopicSearchActive && !activeVerseIndex && verses.length > 0 && (
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-sans">
              Click any verse above to activate in-depth theological synthesis
            </span>
          )}
        </div>
      </div>

      {/* Floating Interactive Context Tooltip Panel */}
      {selectedTextData && (
        <div 
          className="absolute z-50 flex items-center gap-1 p-1 shadow-xl rounded-lg border text-xs select-none backdrop-blur-md"
          style={{
            left: `${Math.min(window.innerWidth - 320, Math.max(16, selectedTextData.x - 140))}px`,
            top: `${Math.min(window.innerHeight - 80, Math.max(12, selectedTextData.y))}px`
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className={`flex items-center gap-1 rounded ${
            theme === "dark" ? "bg-[#1E2530] text-gray-200 border-[#2C3545]" : "bg-white text-gray-800 border-[#E5DFD5]"
          }`}>
            {/* Context Palette Color Markers */}
            <button 
              onClick={() => applyHighlight("#FFF3A3")}
              className="w-4 h-4 rounded-full border border-gray-400/50 hover:scale-115 transition-transform cursor-pointer ml-1.5 shadow-xs"
              style={{ backgroundColor: "#FFF3A3" }}
              title="Yellow Highlight"
            />
            <button 
              onClick={() => applyHighlight("#A3D4FF")}
              className="w-4 h-4 rounded-full border border-gray-400/50 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              style={{ backgroundColor: "#A3D4FF" }}
              title="Blue Highlight"
            />
            <button 
              onClick={() => applyHighlight("#C9F7C5")}
              className="w-4 h-4 rounded-full border border-gray-400/50 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              style={{ backgroundColor: "#C9F7C5" }}
              title="Green Highlight"
            />
            <button 
              onClick={() => applyHighlight("#FBC4D8")}
              className="w-4 h-4 rounded-full border border-gray-400/50 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              style={{ backgroundColor: "#FBC4D8" }}
              title="Pink Highlight"
            />
            <button 
              onClick={clearHighlight}
              className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded cursor-pointer transition-all shrink-0 ml-0.5"
              title="Eraser / Clear Highlights"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>

            <div className={`h-4 w-[1px] ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} mx-0.5`} />

            {/* Quick action buttons */}
            <button 
              onClick={handleCopy}
              className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded cursor-pointer"
              title="Copy citation"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleAddNote}
              className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded cursor-pointer"
              title="Create note"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleWordStudy}
              className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded cursor-pointer"
              title="Original language study"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={handleSendToElder}
              className="p-1.5 hover:bg-amber-500/10 hover:text-amber-500 rounded cursor-pointer mr-0.5"
              title="Consult Elder Stephen"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Pronunciation Guide Floating Overlay Card */}
      {pronouncingName && (
        <div 
          className={`absolute bottom-4 right-4 z-50 max-w-sm w-full p-4 rounded-xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            theme === "dark" 
              ? "bg-[#1E2530] border-[#2C3545] text-gray-200" 
              : "bg-[#FDFBF7] border-[#E8E4DA] text-gray-800"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#C9973A]">
                AI Pronunciation
              </span>
            </div>
            <button 
              onClick={() => {
                setPronouncingName(null);
                if (nameAudioRef.current) {
                  try { nameAudioRef.current.stop(); } catch (e) {}
                  nameAudioRef.current = null;
                }
              }}
              className="text-gray-400 hover:text-gray-200 cursor-pointer p-0.5 rounded hover:bg-gray-700/20"
              title="Dismiss"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-serif text-lg font-bold tracking-tight text-gray-950 dark:text-white">
                {pronouncingName.name}
              </h4>
              <p className="font-mono text-xs text-amber-500 font-bold mt-0.5">
                [ {pronouncingName.phonetic} ]
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => playNamePronunciation(pronouncingName)}
                disabled={pronouncingLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-mono text-[11px] font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center"
              >
                {pronouncingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : pronouncingPlaying ? (
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                ) : (
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                )}
                {pronouncingLoading ? "Generating..." : pronouncingPlaying ? "Speaking..." : "Pronounce"}
              </button>

              <select
                value={pronounceVoice}
                onChange={(e) => setPronounceVoice(e.target.value)}
                className={`text-[10px] font-mono rounded-lg border p-1.5 cursor-pointer outline-hidden focus:ring-1 focus:ring-amber-500 ${
                  theme === "dark" 
                    ? "bg-[#161B22] border-gray-700 text-gray-300" 
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                title="Select Voice"
              >
                <option value="Puck">Elder Stephen (Puck)</option>
                <option value="Zephyr">Zephyr (Soft/Breathy)</option>
                <option value="Kore">Kore (Clear Female)</option>
                <option value="Fenrir">Fenrir (Deep Male)</option>
                <option value="Charon">Charon (Reverent)</option>
              </select>
            </div>

            <div className={`text-[11px] leading-relaxed border-t pt-2 mt-2 space-y-1 ${
              theme === "dark" ? "text-gray-300 border-gray-800" : "text-gray-600 border-gray-100"
            }`}>
              <div>
                <span className="font-bold text-amber-500 font-mono text-[9px] uppercase tracking-wider block">Meaning</span>
                <span className="italic">“{pronouncingName.meaning}”</span>
              </div>
              <div className="pt-1">
                <span className="font-bold text-amber-500 font-mono text-[9px] uppercase tracking-wider block">Scriptural Profile</span>
                <span>{pronouncingName.description}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
