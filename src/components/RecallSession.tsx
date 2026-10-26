/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Lock,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Shield,
  HelpCircle,
  AlertCircle,
  FileText,
  BookmarkCheck,
  Flame,
  Award,
  BookOpen,
  Check,
  Brain,
  Layers,
  Sparkle,
  Gamepad2,
  CalendarCheck,
  LayoutGrid,
  Compass
} from "lucide-react";
import { Scripture } from "../types";
import { callElderStephen } from "../lib/callElderStephen";
import { useApp } from "../context/AppContext";
import { recordActivity } from "../utils/activityTracker";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";

// Import memory enhancement components
import { ScriptureGamePack } from "./recall/ScriptureGamePack";
import { MemorizationBlueprint } from "./recall/MemorizationBlueprint";
import { ThirtyDayRecallPlan } from "./recall/ThirtyDayRecallPlan";
import { VisualMemoryGrid } from "./recall/VisualMemoryGrid";
import { GeminiRecallModule } from "./recall/GeminiRecallModule";

// Comprehensive catalog of curated SDA memory verses for instant lookup
const ALL_LIBRARY_SCRIPTURES: Scripture[] = [
  ...Object.values(SCRIPTURE_DATABASE).flat(),
  {
    id: "ex-20-8-11",
    reference: "Exodus 20:8-11",
    text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work.",
    keywords: ["sabbath", "holy", "labour", "seventh", "work"]
  },
  {
    id: "john-14-1-3",
    reference: "John 14:1-3",
    text: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.",
    keywords: ["troubled", "believe", "mansions", "prepare", "place"]
  },
  {
    id: "psalm-119-105",
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    keywords: ["word", "lamp", "feet", "light", "path"]
  },
  {
    id: "isa-8-20",
    reference: "Isaiah 8:20",
    text: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
    keywords: ["law", "testimony", "word", "light"]
  },
  {
    id: "2pet-1-21",
    reference: "2 Peter 1:21",
    text: "For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
    keywords: ["prophecy", "holy", "moved", "Ghost"]
  }
];

// Premium Scripture selection presets for SDA Students
const PRESET_SCRIPTURES: Scripture[] = [
  {
    id: "rev-14-12",
    reference: "Revelation 14:12",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    keywords: ["patience", "saints", "commandments", "faith"]
  },
  {
    id: "dan-8-14",
    reference: "Daniel 8:14",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    keywords: ["days", "sanctuary", "cleansed", "thousand"]
  },
  {
    id: "heb-8-1-2",
    reference: "Hebrews 8:1-2",
    text: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
    keywords: ["priest", "majesty", "sanctuary", "tabernacle"]
  },
  {
    id: "2tim-3-16",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "righteousness"]
  },
  {
    id: "eph-2-8",
    reference: "Ephesians 2:8",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
    keywords: ["grace", "saved", "faith", "gift"]
  }
];

const RECALL_COMMENTARY_NOTE: Record<string, string> = {
  "inspiration": "SDA Bible Commentary, Vol. 7: 'Inspiration of God' (Greek theopneustos, 'God-breathed') guarantees the divine authority of the thoughts. The writers were God's penmen, not His pens.",
  "profitable": "SDA Bible Commentary, Vol. 7: Scripture is 'profitable' or highly functional. It serves as our absolute standard of faith and practice, providing active, perfect spiritual instruction.",
  "doctrine": "SDA Bible Commentary, Vol. 7: Sound 'doctrine' is essential. It provides the structured fortress of truth needed to withstand the clever counterfeits of the enemy in the closing scenes.",
  "righteousness": "SDA Bible Commentary, Vol. 7: 'Instruction in righteousness' represents the restorative path. It builds a Christ-like character, preparing the remnant soul to stand transparent.",
  "saints": "SDA Bible Commentary, Vol. 7: The saints represent the historical remnant who, through great trial, remain loyal to heaven's covenant while the world conforms to false images.",
  "commandments": "E.G. White, The Great Controversy, p. 582: 'The law of God is a transcript of His character.' Keeping the commandments is not legalism, but the natural fruit of love and Christ's faith.",
  "faith": "SDA Bible Commentary, Vol. 7: The 'faith of Jesus' is the living, robust trust that enabled Jesus to undergo the dark horrors of Gethsemane. It is this identical faith that sustains the final generation.",
  "sanctuary": "SDA Bible Commentary, Vol. 4: On Daniel 8:14, the cleansing of the sanctuary corresponds to the antitypical Day of Atonement, vindicating God's cosmic justice.",
  "cleansed": "E.G. White, Patriarchs and Prophets, p. 358: 'The cleansing of the sanctuary involves a work of investigation--a work of judgment. This work must be performed prior to Christ's coming.'",
  "patience": "SDA Bible Commentary, Vol. 7: Patience (Greek hupomone) is not passive waiting; it is active spiritual endurance under the supreme closing crisis.",
  "grace": "SDA Bible Commentary, Vol. 6: Grace is the favor of God, bringing a transforming power that recreates the human heart, lifting us from rebellion into loving loyalty.",
  "days": "SDA Bible Commentary, Vol. 4: The 2300 'days' constitute prophetic days representing literal solar years (Ezekiel 4:6, Numbers 14:34), running from 457 B.C. to the onset of the antitypical day of atonement in 1844.",
  "thousand": "SDA Bible Commentary, Vol. 4: Confirms the grand prophetic span. This aligns key political power shifts of antiquity with the sanctuary restoration, showing the sovereign hand of God in human history.",
  "priest": "SDA Bible Commentary, Vol. 7: Christ is our high priest (Greek archiereus) ministering inside the true heavenly sanctuary, offering His own spotless blood to reconcile every seeking heart.",
  "majesty": "SDA Bible Commentary, Vol. 7: Represents the absolute sovereign glory of the Father, emphasizing the high-level celestial backing behind Christ's current mediatorial ministry.",
  "tabernacle": "SDA Bible Commentary, Vol. 7: The heavenly sanctuary represents the original pattern shown on the mount. Christ serves in this true tabernacle as our advocate in the presence of the Father.",
  "saved": "SDA Bible Commentary, Vol. 6: Salvation is a relational recreation. We are fully saved from the guilt and condemnation of sin today, and are steadily empowered over its dominion.",
  "gift": "SDA Bible Commentary, Vol. 6: Emphasizes that grace is completely unbought. It is a divine, transcendent gift of matchless affection designed to melt human pride and restore the divine image."
};

interface RecallSessionProps {
  scripture?: Scripture;
  queue?: Scripture[];
  currentQueueIndex?: number;
  onQueueAdvance?: () => void;
  sabbathMode?: boolean;
  onBack: () => void;
  onComplete?: (score: number, scriptureId: string) => void;
  currentSessionIndex?: number;
  totalSessionsInTrack?: number;
  isEmbedded?: boolean;
  initialPhase?: string;
}

export const RecallSession: React.FC<RecallSessionProps> = ({
  scripture: propScripture,
  queue,
  currentQueueIndex = 0,
  onQueueAdvance,
  sabbathMode = false,
  onBack,
  onComplete,
  currentSessionIndex = 1,
  totalSessionsInTrack = 3,
  isEmbedded = false
}) => {
  const { showConfetti } = useApp();
  const location = useLocation();
  const locationScripture = location.state?.scripture as Scripture | undefined;
  
  // Starting scripture context selection
  const [selectedScripture, setSelectedScripture] = useState<Scripture>(() => {
    return propScripture || locationScripture || PRESET_SCRIPTURES[0];
  });

  // Sync selected scripture when prop changes (e.g., when moving through due queue or clicking a review item)
  useEffect(() => {
    if (propScripture) {
      setSelectedScripture(propScripture);
      setTypedText("");
      setBlankAnswers({});
      setTrainerStep(1);
    }
  }, [propScripture]);

  // Current step in the 4-step Recall Trainer flow
  // 1 = Select & Study, 2 = Verify (Type/Fill), 3 = Evaluate, 4 = Reflect & Finish
  const [trainerStep, setTrainerStep] = useState<1 | 2 | 3 | 4>(1);

  // Active memory exercise tool within Verbatim Recall
  const [subToolMode, setSubToolMode] = useState<"trainer" | "gamepack" | "blueprint" | "plan30" | "grid" | "gemini">("trainer");

  // Custom reference input text state for Quick Lookup
  const [customRefQuery, setCustomRefQuery] = useState<string>("");

  // Floating notifications popup state
  const [localPopup, setLocalPopup] = useState<{ title: string; message: string; type: string } | null>(null);

  // Auto-dismiss local popup notification
  useEffect(() => {
    if (localPopup) {
      const timer = setTimeout(() => {
        setLocalPopup(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [localPopup]);

  // Input modes: "memory" (Type from memory) or "fill" (Fill in the blanks)
  const [inputMode, setInputMode] = useState<"memory" | "fill">("memory");

  // User input states
  const [typedText, setTypedText] = useState<string>("");
  const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>({});

  // Loading locker simulation state between Step 1 and Step 2
  const [isLocking, setIsLocking] = useState<boolean>(false);

  // Help prompt flags
  const [showHelperHint, setShowHelperHint] = useState<boolean>(false);
  const [journalText, setJournalText] = useState<string>("");
  const [journalCommitted, setJournalCommitted] = useState<boolean>(false);

  // Auto-progressing lock buffer
  const handleTriggerLock = () => {
    setIsLocking(true);
    setTimeout(() => {
      setIsLocking(false);
      setTrainerStep(2);
    }, 1400);
  };

  // Helper utility to sanitize words for scoring comparison
  const cleanWord = (word: string): string => {
    return word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"'?]/g, "").trim();
  };

  // Extract keywords to map the Fill in the Blanks mode indices
  const getFillInTheBlankLayout = () => {
    const words = selectedScripture.text.split(" ");
    const lowercaseKeywords = selectedScripture.keywords.map(cleanWord);
    
    return words.map((word, idx) => {
      const cleaned = cleanWord(word);
      const isPickWord = lowercaseKeywords.includes(cleaned);
      return { word, index: idx, isPickWord };
    });
  };

  // Evaluate logic & feedback computations (accurate, rule-based comparison)
  const computeFinalAnalysis = () => {
    const originalWords = selectedScripture.text.split(" ").filter(Boolean);
    const lowercaseKeywords = selectedScripture.keywords.map(cleanWord);

    let reconstructedText = "";
    if (inputMode === "memory") {
      reconstructedText = typedText;
    } else {
      // Assemble text from fill-in-the-blank answers mixed with plain tokens
      const layout = getFillInTheBlankLayout();
      reconstructedText = layout.map(item => {
        if (item.isPickWord) {
          return blankAnswers[item.index] || "_____";
        }
        return item.word;
      }).join(" ");
    }

    const cleanedUserText = reconstructedText.toLowerCase();
    const userWords = reconstructedText.split(/\s+/).filter(Boolean).map(cleanWord);

    let correctCount = 0;
    let nearMissCount = 0;
    
    // Evaluation states for displaying word-by-word visual details
    const wordEvaluations = originalWords.map((origWord, idx) => {
      const cleanOrig = cleanWord(origWord);
      const isKeyword = lowercaseKeywords.includes(cleanOrig);
      
      // Exact Match check
      if (userWords.includes(cleanOrig)) {
        correctCount++;
        return { original: origWord, user: cleanOrig, status: "correct" as const, isKeyword };
      }
      
      // Near-miss suffix/prefix checks (e.g. "patience" matched to "patient")
      const nearMatch = userWords.find(uw => {
        if (uw.length >= 4 && cleanOrig.length >= 4) {
          return uw.startsWith(cleanOrig.slice(0, 4)) || cleanOrig.startsWith(uw.slice(0, 4));
        }
        return false;
      });

      if (nearMatch) {
         nearMissCount++;
         return { original: origWord, user: nearMatch, status: "near" as const, isKeyword };
      }

      // Complete omission
      return { original: origWord, user: "", status: "incorrect" as const, isKeyword };
    });

    // Score synthesis
    let wordAccuracy = originalWords.length > 0 
      ? Math.round(((correctCount + (nearMissCount * 0.6)) / originalWords.length) * 100) 
      : 0;
    if (wordAccuracy > 100) wordAccuracy = 100;

    // Direct assessment label
    let feedbackLabel = "";
    if (wordAccuracy >= 90) {
      feedbackLabel = "Excellent recall — nearly word perfect.";
    } else if (wordAccuracy >= 70) {
      feedbackLabel = "Solid recall — review key phrases below.";
    } else {
      feedbackLabel = "Good effort — re‑read and try again.";
    }

    // Missed and found keywords
    const foundKeywords: string[] = [];
    const missedKeywords: string[] = [];
    selectedScripture.keywords.forEach(kw => {
      const cleanKw = cleanWord(kw);
      if (cleanedUserText.includes(cleanKw)) {
        foundKeywords.push(kw);
      } else {
        missedKeywords.push(kw);
      }
    });

    // Pull Commentary insight based on missed or default values
    const queryKey = missedKeywords.length > 0 ? cleanWord(missedKeywords[0]) : cleanWord(selectedScripture.keywords[0]);
    const sdaCommentary = RECALL_COMMENTARY_NOTE[queryKey] || "SDA Bible Commentary: Keep storing these treasures of scripture to actively fortify the soul against deception in the high crisis times ahead.";

    return {
      score: wordAccuracy,
      feedback: feedbackLabel,
      wordEvaluations,
      foundKeywords,
      missedKeywords,
      reconstructedText,
      sdaCommentary
    };
  };

  const performance = computeFinalAnalysis();

  const handleResetTrainer = () => {
    setTypedText("");
    setBlankAnswers({});
    setJournalText("");
    setJournalCommitted(false);
    setTrainerStep(1);
  };

  const handleCompletePractice = async () => {
    localStorage.setItem("stba_has_completed_session", "true");
    recordActivity("activeRecall", { minutes: 15, count: 1 });
    
    // Trigger first active recall complete confetti
    showConfetti('recall');

    try {
      // Generate standard STBA masteryState payload
      let completedVerses: string[] = [];
      try {
        const savedCompleted = localStorage.getItem('stba_completed_verses');
        if (savedCompleted) {
          completedVerses = JSON.parse(savedCompleted);
        }
      } catch (e) {}

      if (!completedVerses.includes(selectedScripture.id)) {
        completedVerses.push(selectedScripture.id);
        localStorage.setItem('stba_completed_verses', JSON.stringify(completedVerses));
      }

      const masteryState = {
        completedVersesCount: completedVerses.length,
        totalVersesCount: 28,
        completionRate: completedVerses.length > 0 ? Math.round((completedVerses.length / 28) * 100) : 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        favoriteScriptures: [selectedScripture.reference]
      };

      // Call Elder Stephen on recall completion
      await callElderStephen({
        currentMode: 'Recall',
        noteTitle: `Verbatim Recall of ${selectedScripture.reference}`,
        noteContent: `Word Accuracy: ${performance.score}% on ${selectedScripture.reference}. Original text: "${selectedScripture.text}".`,
        masteryState,
        userAction: 'recall_session'
      });
    } catch (e) {
      console.error('Elder Stephen recall registration failed:', e);
    }

    if (onComplete) {
      onComplete(performance.score, selectedScripture.id);
    } else {
      onBack();
    }
  };

  const handleReferenceSelectOrSearch = (refQuery: string) => {
    if (!refQuery.trim()) return;
    const cleanQuery = refQuery.toLowerCase().replace(/\s+/g, "");
    
    // Search in all curated scriptures
    const matched = ALL_LIBRARY_SCRIPTURES.find(s => 
      s.reference.toLowerCase().replace(/\s+/g, "") === cleanQuery ||
      s.reference.toLowerCase().includes(refQuery.toLowerCase().trim())
    ) || PRESET_SCRIPTURES.find(s =>
      s.reference.toLowerCase().replace(/\s+/g, "") === cleanQuery ||
      s.reference.toLowerCase().includes(refQuery.toLowerCase().trim())
    );

    if (matched) {
      setSelectedScripture(matched);
      setTypedText("");
      setBlankAnswers({});
      setCustomRefQuery("");
    } else {
      // Fallback: If reference not in standard DB, create entry
      setSelectedScripture({
        id: `custom-${Date.now()}`,
        reference: refQuery.trim(),
        text: selectedScripture.text,
        keywords: selectedScripture.keywords
      });
      setCustomRefQuery("");
    }
  };

  // Check character thresholds for buttons
  const isSubmissionDisabled = inputMode === "memory"
    ? typedText.trim().length < 8
    : Object.keys(blankAnswers).length === 0;

  const isQueuedSession = queue && queue.length > 0;

  return (
    <div
      className="w-full bg-[#1C2333] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0 max-w-5xl mx-auto text-stone-200"
      id="recall-session-root"
    >
      {/* PERSISTENT HEADER BLOCK */}
      <header className="px-4 sm:px-6 py-4 border-b border-stone-800 bg-[#161D2B] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-stone-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-bold cursor-pointer"
          id="btn-close-trainer"
        >
          <ArrowLeft className="w-4 h-4 text-[#C9973A]" />
          <span>Exit Gym</span>
        </button>

        <div className="text-center font-sans">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-extrabold flex items-center justify-center gap-1.5">
            <Brain className="w-3.5 h-3.5 shrink-0" />
            {isQueuedSession ? `DUE QUEUE: VERSE ${currentQueueIndex + 1} OF ${queue.length}` : "STBA RECALL TRAINER"}
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-normal uppercase mt-0.5">
            {isQueuedSession ? `Active Due Review · ${selectedScripture.reference}` : "Active scripture internalization"}
          </h2>
        </div>

        <div className="bg-stone-900 border border-stone-800 text-[#C9973A] text-xs font-mono px-3 py-1 rounded-full uppercase font-bold">
          Step {trainerStep} of 4
        </div>
      </header>

      {/* RECALL ENHANCEMENT SUITE SWITCHER (ROUND WITH GOLD TRIM) */}
      <div className="bg-[#0B101B] border-b border-stone-800 px-4 py-2.5 flex items-center justify-start gap-2 overflow-x-auto no-scrollbar select-none scroll-smooth" id="recall-subtools-bar">
        {[
          { id: "trainer" as const, label: "4-Step Recall Gym", icon: Brain },
          { id: "gamepack" as const, label: "Scripture Game Pack", icon: Gamepad2 },
          { id: "plan30" as const, label: "30-Day Discipleship Track", icon: CalendarCheck, title: "The 30-Day Discipleship Scripture Track" },
          { id: "grid" as const, label: "Visual Memory Grid", icon: LayoutGrid },
          { id: "blueprint" as const, label: "App Blueprint", icon: Compass },
          { id: "gemini" as const, label: "Gemini Recall AI", icon: Sparkles }
        ].map(tool => {
          const Icon = tool.icon;
          const isSelected = subToolMode === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setSubToolMode(tool.id)}
              title={(tool as any).title || tool.label}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-sans font-semibold transition-all border cursor-pointer ${
                isSelected
                  ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                  : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#DFC57B]" />
              <span className="whitespace-nowrap">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE SUBTOOL VIEW IF NOT IN 4-STEP GYM */}
      {subToolMode === "gamepack" && (
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <ScriptureGamePack
            initialScripture={selectedScripture}
            onLaunchRecallPractice={(s) => {
              setSelectedScripture(s);
              setSubToolMode("trainer");
              setTrainerStep(1);
            }}
          />
        </div>
      )}

      {subToolMode === "plan30" && (
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <ThirtyDayRecallPlan
            onSelectVerseForPractice={(s) => {
              setSelectedScripture(s);
              setSubToolMode("trainer");
              setTrainerStep(1);
            }}
            onPlayInGamePack={(s) => {
              setSelectedScripture(s);
              setSubToolMode("gamepack");
            }}
          />
        </div>
      )}

      {subToolMode === "grid" && (
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <VisualMemoryGrid
            onSelectScripture={(s) => {
              setSelectedScripture(s);
              setSubToolMode("trainer");
              setTrainerStep(1);
            }}
          />
        </div>
      )}

      {subToolMode === "blueprint" && (
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <MemorizationBlueprint
            onLaunchRecall={() => {
              setSubToolMode("trainer");
            }}
          />
        </div>
      )}

      {subToolMode === "gemini" && (
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <GeminiRecallModule
            initialScripture={selectedScripture}
            onPracticeInGym={(s) => {
              setSelectedScripture(s);
              setSubToolMode("trainer");
              setTrainerStep(1);
            }}
          />
        </div>
      )}

      {/* RENDER DYNAMIC ACTIVE TRAINER STEP SHEETS */}
      {subToolMode === "trainer" && (
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between" id="trainer-step-wrapper">
        <AnimatePresence mode="wait">

          {/* ========================================================
              STEP 1: SELECT & STUDY THE MEMORY TEXT
              ======================================================== */}
          {trainerStep === 1 && !isLocking && (
            <motion.div
              key="trainer-step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6 text-left"
            >
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-extrabold block">
                  Step 1: Scripture Selection & Preanalysis
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white font-medium mt-1">
                  Choose a Passage, Engrave onto Your Mind
                </h3>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mt-1">
                  Select a high-impact Adventist memory text or choose any reference from the library. Memorize the phrase structure, then click below to lock the page and enter active evaluation.
                </p>
              </div>

              {/* CARD PRESETS BOARD */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {PRESET_SCRIPTURES.map((scrip) => {
                  const isSelected = selectedScripture.id === scrip.id;
                  return (
                    <button
                      key={scrip.id}
                      onClick={() => {
                        setSelectedScripture(scrip);
                        setTypedText("");
                        setBlankAnswers({});
                      }}
                      className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between h-28 cursor-pointer ${
                        isSelected
                          ? "bg-[#C9973A]/10 border-[#C9973A] shadow-md shadow-[#C9973A]/5"
                          : "bg-stone-900/45 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <span className={`text-[11px] font-sans font-bold ${isSelected ? "text-[#C9973A]" : "text-stone-400"}`}>
                        {scrip.reference}
                      </span>
                      <p className="text-[10.5px] text-stone-300 leading-snug line-clamp-3 font-bible font-normal">
                        "{scrip.text}"
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* SELECT OR SEARCH BIBLE REFERENCE FROM SCRIPTURE LIBRARY */}
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#2A9D8F] font-extrabold block">
                    Select or Search Bible Reference:
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Curated SDA Memory Scriptures
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      list="sda-scriptures-datalist"
                      value={customRefQuery}
                      onChange={(e) => setCustomRefQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customRefQuery.trim()) {
                          handleReferenceSelectOrSearch(customRefQuery);
                        }
                      }}
                      placeholder="Type or select reference (e.g. Revelation 14:6, Daniel 8:14, Romans 1:16...)"
                      className="w-full bg-[#161D2B] border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 tracking-wider font-sans focus:outline-none focus:border-[#C9973A]"
                    />
                    <datalist id="sda-scriptures-datalist">
                      {ALL_LIBRARY_SCRIPTURES.map((s, idx) => (
                        <option key={`${s.id}-${idx}`} value={s.reference}>
                          {s.reference} - {s.text.slice(0, 50)}...
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <button
                    onClick={() => handleReferenceSelectOrSearch(customRefQuery)}
                    disabled={!customRefQuery.trim()}
                    className="px-5 py-2.5 bg-[#2A9D8F] hover:bg-[#20796E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs uppercase tracking-wider font-black rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Load Reference
                  </button>
                </div>
              </div>

              {/* ACTIVE MEMORIZER SCREEN CANVAS */}
              <div className="p-6 sm:p-7 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl relative text-center">
                <span className="text-[9px] uppercase font-mono tracking-widest text-stone-500 font-bold block mb-1">
                  Passage For Verbal Recollection Check:
                </span>
                <p className="text-base sm:text-lg md:text-xl font-bible text-stone-100 leading-relaxed font-semibold max-w-3xl mx-auto">
                  "{selectedScripture.text}"
                </p>
                <div className="mt-4 flex justify-center items-center gap-2">
                  <span className="text-xs font-serif font-extrabold text-[#C9973A]">
                    {selectedScripture.reference}
                  </span>
                  <span className="text-[9.5px] uppercase font-mono text-stone-500 tracking-widest">
                    · HOLY WRIT
                  </span>
                </div>
              </div>

              {selectedScripture.id === "holy-scriptures" && (
                <div className="bg-stone-900/40 border border-[#C9973A]/20 p-6 rounded-xl space-y-4 text-left animate-fade-in" id="belief1-recall-mastery-guide">
                  <div className="flex items-center gap-2 text-[#C9973A] border-b border-stone-800 pb-2">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="font-serif text-xs font-extrabold uppercase tracking-wider">
                      Belief 1 Study & Memorization Companion
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Doctrinal Statement Card */}
                    <div className="bg-[#161D2B] border border-stone-850 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-[#C9973A] uppercase tracking-wider font-extrabold block">
                        1. The Doctrinal Statement
                      </span>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration. The inspired authors spoke and wrote as they were moved by the Holy Spirit..."
                      </p>
                    </div>

                    {/* Supporting Scriptures Card */}
                    <div className="bg-[#161D2B] border border-stone-850 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-[#C9973A] uppercase tracking-wider font-extrabold block">
                        2. Supporting Scriptures & Proofs
                      </span>
                      <ul className="text-[11px] text-stone-400 space-y-1.5 leading-normal">
                        <li>• <strong className="text-stone-300">2 Timothy 3:16:</strong> All scripture is given by inspiration.</li>
                        <li>• <strong className="text-stone-300">2 Peter 1:20–21:</strong> Holy men spoke as moved by the Spirit.</li>
                        <li>• <strong className="text-stone-300">Psalm 119:105:</strong> Word is a lamp unto my feet.</li>
                        <li>• <strong className="text-stone-300">Isaiah 8:20:</strong> To the law and to the testimony.</li>
                      </ul>
                    </div>

                    {/* Key Doctrinal Points Card */}
                    <div className="bg-[#161D2B] border border-stone-850 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-[#C9973A] uppercase tracking-wider font-extrabold block">
                        3. Key Doctrinal Points
                      </span>
                      <ul className="text-[11px] text-stone-400 space-y-1.5 leading-normal">
                        <li>• <strong className="text-stone-300">Divine Inspiration:</strong> God breathed His thoughts into human agents.</li>
                        <li>• <strong className="text-stone-300">Infallible Rule:</strong> Supreme standard of character and test of experience.</li>
                        <li>• <strong className="text-stone-300">Living Testimony:</strong> Harmonious unity across 1,500 years and 40 authors.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION LOCK TRIGGER */}
              <div className="pt-4 border-t border-stone-800 flex justify-end">
                <button
                  onClick={handleTriggerLock}
                  className="px-8 py-3.5 bg-[#C9973A] hover:bg-[#B0822F] text-[#1C2333] text-xs uppercase tracking-widest font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Lock & Proceed to Trainer →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* SIMULATED TRANSITIONAL BUFFER: LOCKING EFFECT */}
          {isLocking && (
            <motion.div
              key="sim-locking-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center py-20 text-center"
            >
              <div className="p-5 bg-stone-900 border border-stone-800 rounded-full shadow-lg mb-4 text-[#C9973A] animate-pulse">
                <Lock className="w-12 h-12" />
              </div>
              <h4 className="font-serif text-lg font-bold text-white">Vaporizing target passage...</h4>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-widest mt-1">
                activating mental encoding pathways
              </p>
            </motion.div>
          )}

          {/* ========================================================
              STEP 2: ENCODING AND VERIFIERS (TYPE OR FILL IN THE BLANKS)
              ======================================================== */}
          {trainerStep === 2 && (
            <motion.div
              key="trainer-step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-extrabold block">
                    Step 2: Interactive Recall Drills
                  </span>
                  <p className="text-stone-400 text-xs">
                    Test retention boundaries for <strong className="text-stone-100">{selectedScripture.reference}</strong>.
                  </p>
                </div>

                {/* DOUBLE MODE TABS (MEMORY VS FILL IN BLANKS) */}
                <div className="flex bg-[#161D2B] p-1 rounded-lg border border-stone-800">
                  <button
                    onClick={() => setInputMode("memory")}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      inputMode === "memory"
                        ? "bg-[#C9973A] text-[#1C2333]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Type From Memory
                  </button>
                  <button
                    onClick={() => setInputMode("fill")}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      inputMode === "fill"
                        ? "bg-[#s] bg-[#C9973A] text-[#1C2333]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Fill in the Blanks
                  </button>
                </div>
              </div>

              {/* RENDER TAB content */}
              {inputMode === "memory" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder="Type the scripture text word-for-word here. Do not look up notes. Trust your mind..."
                      className="w-full h-44 text-base p-4.5 bg-stone-900 border border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C9973A] text-stone-100 placeholder-stone-500 font-sans leading-relaxed resize-none shadow-inner"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono text-stone-400 bg-[#161D2B] px-2.5 py-0.5 rounded border border-stone-800">
                      {typedText.length} Characters
                    </div>
                  </div>

                  {/* STUCK HELP TRIGGER */}
                  <div className="text-left bg-stone-900/40 p-2 border border-stone-800 rounded-lg">
                    <button
                      onClick={() => setShowHelperHint(!showHelperHint)}
                      className="flex items-center space-x-1.5 text-xs text-[#C9973A] font-bold px-2 py-1 hover:underline cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 text-[#C9973A]" />
                      <span>{showHelperHint ? "Hide Letter Box" : "Stuck? Prompt first letters"}</span>
                    </button>
                    {showHelperHint && (
                      <div className="mt-2 p-3 bg-stone-900 border border-stone-800 rounded-lg text-xs font-mono text-stone-400 select-all leading-relaxed">
                        <span className="text-[9px] uppercase font-mono block text-[#C9973A] mb-1 font-extrabold">First Letter Outlines:</span>
                        {selectedScripture.text.split(" ").map(w => w[0] || "").join(" ").toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-4">
                  <p className="text-sm font-sans tracking-wide leading-relaxed text-stone-300">
                    {getFillInTheBlankLayout().map((item, i) => {
                      if (item.isPickWord) {
                        const answer = blankAnswers[item.index] || "";
                        const widthStr = `${Math.max(item.word.length * 10, 60)}px`;
                        return (
                          <input
                            key={`fill-box-${item.index}`}
                            type="text"
                            value={answer}
                            onChange={(e) => {
                              setBlankAnswers(prev => ({ ...prev, [item.index]: e.target.value }));
                            }}
                            placeholder="___"
                            style={{ width: widthStr }}
                            className="bg-[#161D2B] border border-stone-700 rounded text-center text-stone-100 focus:outline-none focus:border-[#C9973A] text-xs font-bold uppercase font-mono py-0.5 px-1.5 mx-1"
                          />
                        );
                      }
                      return (
                        <span key={`plain-${i}`} className="mx-0.5">{item.word}</span>
                      );
                    })}
                  </p>
                  <div className="p-3 bg-stone-950/40 rounded-lg text-[10.5px] text-stone-550 leading-normal border border-stone-850/60">
                    <strong>Instructions</strong>: Type the missing theological terms inside each bracketed slot to satisfy the keyword criteria.
                  </div>
                </div>
              )}

              {/* ACTION BUTTON EVALUATE */}
              <div className="pt-4 border-t border-stone-800 flex justify-between items-center bg-stone-900/0">
                <span className="text-[10.5px] text-stone-450">
                  {isSubmissionDisabled ? "Submit requires standard input parameters." : "Semantic checks ready!"}
                </span>

                <button
                  disabled={isSubmissionDisabled}
                  onClick={() => setTrainerStep(3)}
                  className={`px-8 py-3.5 text-xs uppercase tracking-widest font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-1 px-7 ${
                    isSubmissionDisabled
                      ? "bg-stone-800 text-stone-600 cursor-not-allowed shadow-none"
                      : "bg-[#2A9D8F] hover:bg-[#20796E] text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reveal & Evaluate Recall →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              STEP 3: REVEAL AND COMPARE CHIPS & SCORES
              ======================================================== */}
          {trainerStep === 3 && (
            <motion.div
              key="trainer-step-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
              id="verification-pane"
            >
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-extrabold block">
                  Step 3: Analytical Calibration Compare
                </span>
                <h3 className="text-2xl font-serif text-white font-medium mt-1">
                  Verbatim Matrix Analysis
                </h3>
              </div>

              {/* RATIO SCORE RETENTION CARD */}
              <div className="p-5 bg-stone-900 border border-stone-850 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-stone-500 block">Trainer Score Benchmark</span>
                  <div className="text-stone-300 font-sans text-xs flex gap-1 items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F] inline-block shrink-0 animate-pulse" />
                     {performance.feedback}
                  </div>
                </div>

                {/* Score Dial */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="relative w-16 h-16 flex items-center justify-center bg-stone-950 rounded-full border border-stone-850">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="text-stone-800"
                        strokeWidth="4"
                        stroke="#161D2B"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className={performance.score >= 90 ? "text-[#2A9D8F]" : performance.score >= 70 ? "text-[#C9973A]" : "text-[#C9973A]/60"}
                        strokeWidth="4"
                        strokeDasharray="163"
                        strokeDashoffset={163 - (163 * performance.score) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-sans font-black text-white text-sm">
                      {performance.score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">Accuracy</span>
                    <span className="text-xs font-bold text-stone-100">
                      {performance.score >= 90 ? "Word Perfect" : performance.score >= 70 ? "Scholar Status" : "Review Recommended"}
                    </span>
                  </div>
                </div>
              </div>

              {/* COLOR WORD HIGHLIGHT MATRIX SCRIPTURE VIEW */}
              <div className="p-5 bg-stone-900 border border-stone-850 rounded-xl space-y-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500 block border-b border-stone-800 pb-2">
                  Highlight Map: Correct (Green) · Near Suffix (Gold) · Missing (Red Underline)
                </span>
                
                <p className="font-sans text-sm tracking-wide leading-relaxed text-stone-250">
                  {performance.wordEvaluations.map((evalItem, idx) => {
                    if (evalItem.status === "correct") {
                      return (
                        <span
                          key={`chip-${idx}`}
                          className="inline-block mr-1.5 mb-1.5 px-2 py-0.5 rounded text-xs bg-[#2A9D8F]/10 text-[#2A9D8F] font-semibold border border-[#2A9D8F]/20"
                        >
                          {evalItem.original}
                        </span>
                      );
                    } else if (evalItem.status === "near") {
                      return (
                        <span
                          key={`chip-${idx}`}
                          className="inline-block mr-1.5 mb-1.5 px-2 py-0.5 rounded text-xs bg-[#C9973A]/10 text-[#C9973A] font-semibold border border-[#C9973A]/20"
                        >
                          {evalItem.original}
                        </span>
                      );
                    } else {
                      return (
                        <span
                          key={`chip-${idx}`}
                          className="inline-block mr-1.5 mb-1.5 text-xs border-b border-red-500/70 text-red-400 font-normal px-1 py-0.5"
                        >
                          {evalItem.original}
                        </span>
                      );
                    }
                  })}
                </p>
              </div>

              {/* KEYWORD CRITIQUE HUD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-850 rounded-xl">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#2A9D8F] block mb-2">
                    ✔ FOUND KEYWORDS:
                  </span>
                  {performance.foundKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {performance.foundKeywords.map((tag) => (
                        <span key={tag} className="bg-[#2A9D8F]/5 text-[#2A9D8F] border border-[#2A9D8F]/20 text-[11px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500">None detected.</span>
                  )}
                </div>

                <div className="p-4 bg-stone-900 border border-stone-850 rounded-xl">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#C9973A] block mb-2">
                    ● OMITTED KEYWORDS (GAPS):
                  </span>
                  {performance.missedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {performance.missedKeywords.map((tag) => (
                        <span key={tag} className="bg-[#C9973A]/5 text-[#C9973A] border border-[#C9973A]/20 text-[11px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          ✕ {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[#2A9D8F] font-bold">100% Keyword alignment! No gaps.</span>
                  )}
                </div>
              </div>

              {/* ACTION FOOTER BAR */}
              <div className="pt-4 border-t border-stone-800 flex justify-between">
                <button
                  onClick={handleResetTrainer}
                  className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs uppercase tracking-wider font-bold rounded-xl transition-all flex items-center space-x-1 border border-stone-750"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={() => setTrainerStep(4)}
                  className="px-8 py-2.5 bg-[#C9973A] hover:bg-[#B0822F] text-[#1C2333] text-xs uppercase tracking-widest font-black rounded-xl transition-all flex items-center space-x-1"
                >
                  <span>SDA Commentary Analysis & Reflect →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              STEP 4: REFLECT, SDA BIBLE COMMENTARY, EXEGESIS NOTES
              ======================================================== */}
          {trainerStep === 4 && (
            <motion.div
              key="trainer-step-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 sm:space-y-6 text-left"
              id="theological-reflection-pane"
            >
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-extrabold block">
                  Step 4: Theological Integration & Affirmation
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-white font-medium mt-1">
                  Secure Scripture in the Heart
                </h3>
              </div>

              {/* SDA BIBLE COMMENTARY CITATION BOX */}
              <div className="bg-[#151B29] border border-stone-850 p-4 sm:p-5 rounded-xl space-y-3 sm:space-y-4 shadow-md">
                <div className="flex items-center space-x-2 pb-2 border-b border-stone-800">
                  <Brain className="w-4 h-4 text-[#C9973A]" />
                  <span className="text-xs uppercase font-mono font-black tracking-widest text-[#C9973A]">
                    SDA Commentary Exegetical Insight Panel:
                  </span>
                </div>
                
                <div className="space-y-2.5 sm:space-y-3.5">
                  {selectedScripture.keywords.map((kw, index) => {
                    const cleanKw = cleanWord(kw);
                    const note = RECALL_COMMENTARY_NOTE[cleanKw] || `SDA Bible Commentary: Active contemplation of the term '${kw}' in relation to biblical covenants.`;
                    return (
                      <div key={index} className="space-y-1 relative pl-4 border-l-2 border-[#C9973A]/40 hover:border-[#C9973A] transition-colors">
                        <span className="text-[10px] font-mono uppercase font-black text-[#C9973A] tracking-wider block">
                          Insight on "{kw.toUpperCase()}"
                        </span>
                        <p className="text-[11px] sm:text-xs text-stone-300 leading-relaxed font-sans font-normal">
                          {note}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WRITING EXEGESIS notes JOURNAL PROMPT */}
              <div className="bg-stone-900 border border-stone-850 p-4 sm:p-5 rounded-xl space-y-2.5 sm:space-y-3 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#2A9D8F] font-extrabold block">
                    SDA Covenant Study Journal Prompt:
                  </span>
                  <p className="text-xs sm:text-sm font-sans text-stone-300 leading-relaxed">
                    "Scripture studied. Now respond. What is God revealing about His character? What is He asking you to trust, release, or do?"
                  </p>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    disabled={journalCommitted}
                    placeholder="Reflect and commit your personal study notes or covenants here..."
                    className="w-full h-24 p-4 bg-[#161D2B] border border-stone-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C9973A] text-stone-100 placeholder-stone-500 font-sans leading-relaxed resize-none shadow-inner"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (!journalText.trim()) return;
                        setJournalCommitted(true);
                        // Mimic saving journal
                        const key = "stba_bible_study_journal";
                        const loaded = localStorage.getItem(key) || "[]";
                        try {
                          const parsed = JSON.parse(loaded);
                          parsed.push({
                            reference: selectedScripture.reference,
                            date: new Date().toLocaleDateString(),
                            score: performance.score,
                            reflection: journalText,
                            timestamp: Date.now()
                          });
                          localStorage.setItem(key, JSON.stringify(parsed));
                        } catch(e) {}
                      }}
                      disabled={journalCommitted || !journalText.trim()}
                      className="px-5 py-2 bg-[#C9973A] hover:bg-[#B0822F] text-[#1C2333] text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
                    >
                      {journalCommitted ? "Covenant response secured ✔" : "Secure Response"}
                    </button>
                  </div>
                </div>
              </div>

              {/* VISUAL MEMORY GRID PROGRESS CARD (ELEVATING MOTIVATION & NEURAL RETENTION) */}
              <div className="bg-[#0D1524] border border-[#DFC57B]/50 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#06162c] border border-[#DFC57B] flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-5 h-5 text-[#DFC57B]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider font-bold block">
                      VISUAL MEMORY MATRIX SYNCHRONIZED
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      "{selectedScripture.reference}" recorded with {performance.score}% recall accuracy
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Progress mapped across your 28 Fundamental Beliefs visual matrix.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubToolMode("grid")}
                  className="px-4 py-2 bg-[#06162c] hover:bg-[#0d3060] text-[#DFC57B] border border-[#DFC57B] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 hover:shadow-[0_0_12px_rgba(223,197,123,0.3)]"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#DFC57B]" />
                  <span>Inspect Visual Memory Grid</span>
                </button>
              </div>

              {/* FINAL COMPLETED BAR PORTAL */}
              <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  onClick={handleResetTrainer}
                  className="w-full sm:w-auto px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs uppercase tracking-wider font-bold rounded-xl transition-all flex items-center justify-center space-x-1 border border-stone-750 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Session</span>
                </button>

                <div className="flex space-x-2 w-full sm:w-auto">
                  {performance.score >= 90 && (
                    <button
                      onClick={() => {
                        // Mimic vault saving
                        const valKey = "stba_vaulted_verses";
                        let valArr: string[] = [];
                        try {
                          valArr = JSON.parse(localStorage.getItem(valKey) || "[]");
                        } catch (e) {}
                        
                        if (!valArr.includes(selectedScripture.reference)) {
                          valArr.push(selectedScripture.reference);
                          localStorage.setItem(valKey, JSON.stringify(valArr));
                        }
                        
                        setLocalPopup({
                          title: "👑 SCRIPTURE VAULTED!",
                          message: `"${selectedScripture.reference}" has been stored into your local Memory Vault. Clean, verifiable retention has been successfully established for this passage.`,
                          type: "success"
                        });
                      }}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-[#161D2B] hover:bg-[#1C2333] text-[#2A9D8F] hover:text-white hover:border-[#2A9D8F] text-xs uppercase tracking-wider font-bold rounded-xl border border-stone-850 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-[#C9973A]" />
                      <span>Vault Scripture</span>
                    </button>
                  )}

                  <button
                    onClick={handleCompletePractice}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-[#C9973A] hover:bg-[#B0822F] text-[#1C2333] text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md"
                  >
                    <span>
                      {queue && currentQueueIndex !== undefined && currentQueueIndex < queue.length - 1
                        ? `Next Due Verse (${currentQueueIndex + 2}/${queue.length}) →`
                        : "Complete Practice →"}
                    </span>
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* FLOATING LOCAL POP-UP TOAST BANNER */}
        <AnimatePresence>
          {localPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#1C2333] border border-[#2A9D8F]/60 text-white p-4 rounded-xl shadow-2xl space-y-2 border-l-4 border-l-[#2A9D8F] font-sans"
              style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#2A9D8F]">
                  {localPopup.title}
                </span>
                <button 
                  type="button"
                  onClick={() => setLocalPopup(null)} 
                  className="text-stone-400 hover:text-white transition-colors text-xs font-semibold cursor-pointer align-middle ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-stone-200 leading-relaxed font-sans font-normal">
                {localPopup.message}
              </p>
              <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[9px] font-mono text-stone-450 uppercase tracking-widest">
                <span>SYSTEM ALIGNMENT MONITOR</span>
                <button 
                  type="button"
                  onClick={() => setLocalPopup(null)} 
                  className="text-[#2A9D8F] hover:underline cursor-pointer font-bold"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </div>
  );
};

export default RecallSession;
