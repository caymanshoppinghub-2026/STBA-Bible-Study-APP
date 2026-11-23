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
  LayoutGrid
} from "lucide-react";
import { Scripture } from "../types";
import { callElderStephen } from "../lib/callElderStephen";
import confetti from "canvas-confetti";
import { playTransitionChime, playCelebrationChime, playGentleNudge } from "../utils/pleasantSounds";
import { useApp } from "../context/AppContext";
import { recordActivity } from "../utils/activityTracker";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";
import { bibleService } from "../services/bibleService";
import { autoCompleteThirtyDayByScripture, ACTIVE_VERSE_REF_KEY } from "./recall/ThirtyDayRecallPlan";

const CANONICAL_BIBLE_BOOKS: string[] = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalm", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
  "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah",
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const POPULAR_SUGGESTED_REFS: string[] = [
  "Jeremiah 33:3",
  "Jeremiah 29:11",
  "John 3:16",
  "Revelation 14:12",
  "2 Timothy 3:16",
  "Psalm 119:105",
  "Daniel 8:14",
  "Exodus 20:8-11",
  "Isaiah 8:20",
  "Ephesians 2:8-9",
  "Philippians 4:13",
  "Romans 8:28",
  "Matthew 11:28",
  "Hebrews 4:12",
  "Proverbs 3:5-6"
];

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function normalizeTypedBibleRef(raw: string): string {
  let s = raw
    .trim()
    .replace(/\bchapter\s+/gi, "")
    .replace(/\bverses?\s+/gi, ":")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s+/g, " ")
    .trim();
  // Convert "Jeremiah 33 3" -> "Jeremiah 33:3"
  s = s.replace(/^([1-3]?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s+(\d+)\s+(\d+(?:-\d+)?)$/, "$1 $2:$3");
  return s;
}

function suggestMatchingReferences(rawInput: string): string[] {
  const cleaned = normalizeTypedBibleRef(rawInput);
  const lower = cleaned.toLowerCase();
  if (!lower) return POPULAR_SUGGESTED_REFS.slice(0, 5);

  const matchParts = cleaned.match(/^([1-3]?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*(\d+(?::\d+(?:-\d+)?)?)?$/);
  const bookPart = (matchParts?.[1] || cleaned).trim().toLowerCase();
  const chapterVersePart = matchParts?.[2] || "";

  const suggestions: string[] = [];

  // 1. Fuzzy match canonical Bible books and preserve typed chapter:verse
  const scoredBooks = CANONICAL_BIBLE_BOOKS.map((book) => {
    const bl = book.toLowerCase();
    const startsWith = bl.startsWith(bookPart) ? 0 : 1;
    const dist = levenshteinDistance(bookPart, bl.slice(0, Math.max(bookPart.length, 3)));
    const fullDist = levenshteinDistance(bookPart, bl);
    return { book, score: startsWith * 10 + Math.min(dist, fullDist) };
  })
    .filter((b) => b.score <= 13)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  for (const b of scoredBooks) {
    if (chapterVersePart) {
      const candidate = `${b.book} ${chapterVersePart.includes(":") ? chapterVersePart : `${chapterVersePart}:1`}`;
      if (!suggestions.includes(candidate)) suggestions.push(candidate);
    } else {
      const popularForBook = POPULAR_SUGGESTED_REFS.filter((r) =>
        r.toLowerCase().startsWith(b.book.toLowerCase())
      );
      for (const p of popularForBook) {
        if (!suggestions.includes(p)) suggestions.push(p);
      }
      if (popularForBook.length === 0) {
        suggestions.push(`${b.book} 1:1`);
      }
    }
  }

  // 2. Also include matching curated references
  for (const r of POPULAR_SUGGESTED_REFS) {
    if (r.toLowerCase().includes(bookPart) && !suggestions.includes(r)) {
      suggestions.push(r);
    }
  }

  return suggestions.slice(0, 5);
}

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
  onInspectGrid?: () => void;
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
  onInspectGrid,
  currentSessionIndex = 1,
  totalSessionsInTrack = 3,
  isEmbedded = false
}) => {
  const { showConfetti } = useApp();
  const location = useLocation();
  const locationScripture = location.state?.scripture as Scripture | undefined;
  
  const GYM_SEQUENCE_STORAGE_KEY = "stba_gym_verse_sequence_v1";
  const normalizeRefKey = (ref: string) => ref.toLowerCase().replace(/\s+/g, "").trim();

  const prependVersesToSequence = (incoming: Scripture[], currentList: Scripture[]): Scripture[] => {
    const seen = new Set<string>();
    const result: Scripture[] = [];
    for (const s of [...incoming, ...currentList]) {
      if (!s?.reference || !s?.text) continue;
      const key = normalizeRefKey(s.reference);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(s);
    }
    return result;
  };

  // Starting scripture context selection (supports single incoming verse OR full study track queue)
  const incomingScripture = propScripture || locationScripture;
  const incomingQueue = queue && queue.length > 0 ? queue : undefined;
  const [verseSequence, setVerseSequence] = useState<Scripture[]>(() => {
    let baseList: Scripture[] = [...PRESET_SCRIPTURES];
    try {
      const saved = localStorage.getItem(GYM_SEQUENCE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = prependVersesToSequence(parsed, PRESET_SCRIPTURES);
        }
      }
    } catch {}
    const priorityBatch: Scripture[] = [
      ...(incomingScripture ? [incomingScripture] : []),
      ...(incomingQueue || [])
    ];
    return priorityBatch.length > 0 ? prependVersesToSequence(priorityBatch, baseList) : baseList;
  });

  const [selectedScripture, setSelectedScripture] = useState<Scripture>(() => {
    return incomingScripture || incomingQueue?.[0] || verseSequence[0] || PRESET_SCRIPTURES[0];
  });

  const sequenceScrollRef = React.useRef<HTMLDivElement | null>(null);

  const activateAndFrontVerse = (verse: Scripture, resetStep = false, batchQueue?: Scripture[]) => {
    setSelectedScripture(verse);
    setTypedText("");
    setBlankAnswers({});
    if (resetStep) setTrainerStep(1);
    setVerseSequence((prev) => {
      const priorityBatch = batchQueue && batchQueue.length > 0 ? [verse, ...batchQueue] : [verse];
      const next = prependVersesToSequence(priorityBatch, prev);
      try {
        localStorage.setItem(GYM_SEQUENCE_STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(ACTIVE_VERSE_REF_KEY, verse.reference);
      } catch {}
      return next;
    });
    // Smoothly scroll strip back to the front so the highlighted active verse is always in view
    requestAnimationFrame(() => {
      sequenceScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    });
  };

  // Sync selected scripture & optional study-track queue whenever props or route state change
  const incomingQueueKey = incomingQueue ? incomingQueue.map((q) => q.reference).join("|") : "";
  useEffect(() => {
    if (incomingScripture) {
      activateAndFrontVerse(incomingScripture, true, incomingQueue);
    } else if (incomingQueue && incomingQueue.length > 0) {
      activateAndFrontVerse(incomingQueue[0], true, incomingQueue);
    }
  }, [incomingScripture?.id, incomingScripture?.reference, incomingScripture?.text, incomingQueueKey]);

  const scrollVerseStrip = (direction: "left" | "right") => {
    const el = sequenceScrollRef.current;
    if (!el) return;
    const offset = direction === "left" ? -380 : 380;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Current step in the 4-step Recall Trainer flow
  // 1 = Select & Study, 2 = Verify (Type/Fill), 3 = Evaluate, 4 = Reflect & Finish
  const [trainerStep, setTrainerStep] = useState<1 | 2 | 3 | 4>(1);

  // Custom reference input text state for Quick Lookup + strict validation & suggestive autocomplete
  const [customRefQuery, setCustomRefQuery] = useState<string>("");
  const [isLoadingRef, setIsLoadingRef] = useState<boolean>(false);
  const [refLookupError, setRefLookupError] = useState<string | null>(null);
  const [refErrorSuggestions, setRefErrorSuggestions] = useState<string[]>([]);
  const [showRefSuggestions, setShowRefSuggestions] = useState<boolean>(false);

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

  // Input modes: "fill" (Fill in the blanks - default 1st) or "memory" (Type from memory - 2nd)
  const [inputMode, setInputMode] = useState<"memory" | "fill">("fill");
  const [transitionNotice, setTransitionNotice] = useState<string | null>(null);

  // Trigger pleasant sound effects, celebratory confetti, and transition notification on step changes
  useEffect(() => {
    if (trainerStep === 2) {
      playTransitionChime();
      setTransitionNotice("Step 2: Active Recall Drill Engaged — Complete all blanks before revealing!");
    } else if (trainerStep === 3) {
      playCelebrationChime();
      try {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.65 }, colors: ["#DFC57B", "#F3CF65", "#2A9D8F", "#ffffff"] });
      } catch {}
      setTransitionNotice("Drill Completed! Reviewing your recall precision.");
      // If practicing a Belief from Visual Memory Grid, unlock it in localStorage
      if (selectedScripture?.id?.startsWith("belief-")) {
        const beliefNum = parseInt(selectedScripture.id.replace("belief-", ""), 10);
        if (!isNaN(beliefNum)) {
          try {
            const raw = localStorage.getItem("stba_vmg_mastered_beliefs");
            const arr: number[] = raw ? JSON.parse(raw) : [];
            if (!arr.includes(beliefNum)) {
              localStorage.setItem("stba_vmg_mastered_beliefs", JSON.stringify([...arr, beliefNum]));
            }
          } catch {}
        }
      }
    } else if (trainerStep === 4) {
      playCelebrationChime();
      try {
        confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 }, colors: ["#DFC57B", "#F3CF65", "#2A9D8F", "#ffffff"] });
      } catch {}
      setTransitionNotice("Mastery Milestone Reached! Well done, faithful scholar.");
    } else {
      return;
    }

    const t = setTimeout(() => setTransitionNotice(null), 4000);
    return () => clearTimeout(t);
  }, [trainerStep]);

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

      // Call Elder Stephen on recall completion in the background so UI completes immediately
      void callElderStephen({
        currentMode: 'Recall',
        noteTitle: `Verbatim Recall of ${selectedScripture.reference}`,
        noteContent: `Word Accuracy: ${performance.score}% on ${selectedScripture.reference}. Original text: "${selectedScripture.text}".`,
        masteryState,
        userAction: 'recall_session'
      }).catch((e) => {
        console.error('Elder Stephen recall registration failed:', e);
      });
    } catch (e) {
      console.error('Elder Stephen recall registration failed:', e);
    }

    autoCompleteThirtyDayByScripture(selectedScripture.id, selectedScripture.reference);

    if (onComplete) {
      onComplete(performance.score, selectedScripture.id);
    } else {
      onBack();
    }
  };

  const liveAutocompleteSuggestions = React.useMemo(() => {
    const q = customRefQuery.trim().toLowerCase();
    if (!q) return [];
    const libraryMatches = [...ALL_LIBRARY_SCRIPTURES, ...PRESET_SCRIPTURES]
      .filter((s) => s.reference.toLowerCase().includes(q))
      .map((s) => ({ reference: s.reference, preview: s.text.slice(0, 62) }));
    const suggestedRefs = suggestMatchingReferences(customRefQuery)
      .map((r) => ({ reference: r, preview: "Fetch exact KJV passage" }));
    const seen = new Set<string>();
    const combined: { reference: string; preview: string }[] = [];
    for (const item of [...libraryMatches, ...suggestedRefs]) {
      const key = normalizeRefKey(item.reference);
      if (seen.has(key)) continue;
      seen.add(key);
      combined.push(item);
    }
    return combined.slice(0, 6);
  }, [customRefQuery]);

  const handleReferenceSelectOrSearch = async (rawQuery: string) => {
    const normalizedInput = normalizeTypedBibleRef(rawQuery);
    if (!normalizedInput) return;

    setRefLookupError(null);
    setRefErrorSuggestions([]);
    setShowRefSuggestions(false);

    // Strict format check: must have book name + chapter:verse (e.g. "Jeremiah 33:3", "2 Timothy 3:16")
    const hasChapterAndVerse = /^[1-3]?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)*\s+\d+:\d+(?:-\d+)?$/.test(normalizedInput);
    const cleanKey = normalizeRefKey(normalizedInput);

    // 1. Check EXACT normalized match in local curated catalog first
    const exactLocalMatch =
      ALL_LIBRARY_SCRIPTURES.find((s) => normalizeRefKey(s.reference) === cleanKey) ||
      PRESET_SCRIPTURES.find((s) => normalizeRefKey(s.reference) === cleanKey);

    if (exactLocalMatch) {
      playTransitionChime();
      activateAndFrontVerse(exactLocalMatch);
      setCustomRefQuery("");
      return;
    }

    if (!hasChapterAndVerse) {
      const suggestions = suggestMatchingReferences(normalizedInput);
      setRefLookupError(
        `Please include a valid book, chapter, and verse (for example: "Jeremiah 33:3" or "John 3:16").`
      );
      setRefErrorSuggestions(suggestions);
      return;
    }

    // 2. Fetch the exact scripture text from Bible Service (KJV) — NEVER reuse previous verse text!
    setIsLoadingRef(true);
    try {
      const passage = await bibleService.getPassage(normalizedInput, "KJV");
      const rawText = (passage?.text || "").replace(/\s+/g, " ").trim();
      const lowerText = rawText.toLowerCase();
      const isInvalidText =
        !rawText ||
        rawText.length < 10 ||
        lowerText.includes("invalid scripture") ||
        lowerText.includes("unavailable") ||
        lowerText.includes("unable to load") ||
        lowerText.includes("could not be loaded") ||
        lowerText.includes("not found");

      if (isInvalidText) {
        const suggestions = suggestMatchingReferences(normalizedInput);
        setRefLookupError(
          `Could not find "${normalizedInput}". Double-check the book name, chapter, and verse number—or pick a suggestion below.`
        );
        setRefErrorSuggestions(suggestions);
        return;
      }

      const stopWords = new Set(["about", "above", "after", "again", "their", "there", "these", "those", "which", "shall", "would", "could", "should", "where", "untill"]);
      const extractedKeywords = Array.from(
        new Set(
          rawText
            .replace(/[^a-zA-Z\s]/g, "")
            .split(/\s+/)
            .filter((w) => w.length >= 5 && !stopWords.has(w.toLowerCase()))
        )
      ).slice(0, 5);

      const loadedScripture: Scripture = {
        id: `bible-${normalizeRefKey(passage.reference || normalizedInput)}`,
        reference: passage.reference || normalizedInput,
        text: rawText,
        keywords: extractedKeywords.length > 0 ? extractedKeywords : ["Lord", "word", "truth"]
      };

      playTransitionChime();
      activateAndFrontVerse(loadedScripture);
      setCustomRefQuery("");
    } catch {
      const suggestions = suggestMatchingReferences(normalizedInput);
      setRefLookupError(
        `Unable to verify "${normalizedInput}" right now. Check the reference format or try one of the suggestions below.`
      );
      setRefErrorSuggestions(suggestions);
    } finally {
      setIsLoadingRef(false);
    }
  };

  // Force full drill completion before allowing reveal & evaluation
  const requiredBlankItems = getFillInTheBlankLayout().filter((item) => item.isPickWord);
  const completedBlanksCount = requiredBlankItems.filter(
    (item) => (blankAnswers[item.index] || "").trim().length > 0
  ).length;
  const isSubmissionDisabled =
    inputMode === "memory"
      ? typedText.trim().length < 15
      : requiredBlankItems.length === 0
        ? true
        : completedBlanksCount < requiredBlankItems.length;

  const isQueuedSession = queue && queue.length > 0;

  return (
    <div
      className="w-full bg-[#1C2333] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0 max-w-5xl mx-auto text-stone-200"
      id="recall-session-root"
    >
      {/* PERSISTENT HEADER BLOCK */}
      <header className="px-4 sm:px-6 py-4 border-b border-stone-800 bg-[#161D2B] flex flex-wrap items-center justify-between gap-3">
        {!isEmbedded ? (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-stone-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-bold cursor-pointer"
            id="btn-close-trainer"
          >
            <ArrowLeft className="w-4 h-4 text-[#C9973A]" />
            <span>Exit Gym</span>
          </button>
        ) : (
          <div className="w-20 hidden sm:block" aria-hidden="true" />
        )}

        <div className="text-center font-sans flex-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-extrabold flex items-center justify-center gap-1.5">
            <Brain className="w-3.5 h-3.5 shrink-0" />
            {isQueuedSession ? `DUE QUEUE: VERSE ${currentQueueIndex + 1} OF ${queue.length}` : "STBA RECALL TRAINER"}
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-normal uppercase mt-0.5">
            {isQueuedSession ? `Active Due Review · ${selectedScripture.reference}` : "Active scripture internalization"}
          </h2>
        </div>

        <div className="bg-stone-900 border border-stone-800 text-[#C9973A] text-xs font-mono px-3 py-1 rounded-full uppercase font-bold shrink-0">
          Step {trainerStep} of 4
        </div>
      </header>

      {/* CELEBRATORY TRANSITION NOTIFICATION BANNER */}
      <AnimatePresence>
        {transitionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#06162c] via-[#0d3060] to-[#06162c] border border-[#DFC57B]/70 text-[#F3CF65] text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg"
            id="recall-transition-toast"
          >
            <Sparkles className="w-4 h-4 text-[#F3CF65] shrink-0 animate-pulse" />
            <span>{transitionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER DYNAMIC ACTIVE TRAINER STEP SHEETS */}
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
              className="space-y-6 text-center"
            >
              <div className="text-center max-w-2xl mx-auto">
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

              {/* ACTIVE MEMORIZER SCREEN CANVAS (Main Passage at Top) */}
              <div className="p-6 sm:p-7 bg-[#0B1324] border-2 border-[#DFC57B]/85 ring-1 ring-[#F3CF65]/30 rounded-xl shadow-[0_0_24px_rgba(223,197,123,0.18)] relative text-center" id="recall-main-passage-card">
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

              {/* SELECT OR SEARCH BIBLE REFERENCE FROM SCRIPTURE LIBRARY */}
              <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl space-y-3 text-left" id="recall-search-reference-box">
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
                      value={customRefQuery}
                      onFocus={() => setShowRefSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowRefSuggestions(false), 180)}
                      onChange={(e) => {
                        setCustomRefQuery(e.target.value);
                        setRefLookupError(null);
                        setShowRefSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customRefQuery.trim() && !isLoadingRef) {
                          e.preventDefault();
                          handleReferenceSelectOrSearch(customRefQuery);
                        }
                      }}
                      placeholder="Type any Bible reference (e.g. Jeremiah 33:3, John 3:16, Daniel 8:14...)"
                      className="w-full bg-[#161D2B] border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 tracking-wider font-sans focus:outline-none focus:border-[#DFC57B]"
                      id="recall-reference-search-input"
                    />
                    {/* Live Suggestive Autocomplete Dropdown */}
                    {showRefSuggestions && liveAutocompleteSuggestions.length > 0 && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#0B1324] border border-[#DFC57B]/70 rounded-xl shadow-2xl overflow-hidden"
                        id="recall-ref-suggestions"
                      >
                        {liveAutocompleteSuggestions.map((item) => (
                          <button
                            key={item.reference}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setCustomRefQuery(item.reference);
                              handleReferenceSelectOrSearch(item.reference);
                            }}
                            className="w-full px-3.5 py-2.5 text-left hover:bg-[#0d3060] transition-colors flex items-center justify-between gap-3 border-b border-stone-800/70 last:border-b-0 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-[#F3CF65] shrink-0">
                              {item.reference}
                            </span>
                            <span className="text-[11px] text-stone-400 truncate">
                              {item.preview}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    id="btn-load-reference"
                    type="button"
                    onClick={() => handleReferenceSelectOrSearch(customRefQuery)}
                    disabled={!customRefQuery.trim() || isLoadingRef}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700/50 disabled:text-emerald-200/60 disabled:cursor-not-allowed text-[#041410] text-xs uppercase tracking-wider font-black rounded-lg transition-all cursor-pointer shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.4)] hover:shadow-[0_0_22px_rgba(52,211,153,0.55)]"
                  >
                    {isLoadingRef ? "Loading..." : "Load Reference"}
                  </button>
                </div>

                {/* Strict Validation Error & "Did You Mean?" Suggestions */}
                {refLookupError && (
                  <div
                    className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/60 text-xs text-amber-200 space-y-2"
                    id="recall-ref-error-banner"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{refLookupError}</span>
                    </div>
                    {refErrorSuggestions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pl-6">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 font-bold">
                          Did you mean:
                        </span>
                        {refErrorSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleReferenceSelectOrSearch(sug)}
                            className="px-2.5 py-1 rounded-lg bg-[#06162c] hover:bg-[#0d3060] border border-[#DFC57B]/70 text-[11px] font-bold text-[#F3CF65] transition-colors cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DYNAMIC SCROLLABLE VERSE SEQUENCE (Active Verse Highlighted at Front; Prior Verses Step Back) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    Active Verse Sequence · {verseSequence.length} Available (Scroll to Browse)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollVerseStrip("left")}
                      aria-label="Scroll verses left"
                      className="w-7 h-7 rounded-lg bg-[#06162c] border border-[#DFC57B]/50 hover:border-[#F3CF65] text-[#DFC57B] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollVerseStrip("right")}
                      aria-label="Scroll verses right"
                      className="w-7 h-7 rounded-lg bg-[#06162c] border border-[#DFC57B]/50 hover:border-[#F3CF65] text-[#DFC57B] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={sequenceScrollRef}
                  className="flex items-stretch gap-3 overflow-x-auto px-1 py-1.5 snap-x snap-mandatory scroll-smooth"
                  id="recall-preset-cards-grid"
                >
                  {verseSequence.map((scrip, idx) => {
                    const isSelected =
                      selectedScripture.id === scrip.id ||
                      normalizeRefKey(selectedScripture.reference) === normalizeRefKey(scrip.reference);
                    return (
                      <button
                        key={`${scrip.id}-${idx}`}
                        type="button"
                        data-active-verse={isSelected ? "true" : "false"}
                        onClick={() => activateAndFrontVerse(scrip)}
                        className={`w-[172px] sm:w-[192px] shrink-0 snap-start p-3.5 rounded-xl transition-all text-left flex flex-col justify-between h-28 cursor-pointer ${
                          isSelected
                            ? "bg-[#0d3060]/85 border-2 border-[#F3CF65] ring-2 ring-[#DFC57B]/50 shadow-[0_0_18px_rgba(243,207,101,0.32)]"
                            : "bg-[#06162c]/90 border-2 border-[#DFC57B]/55 hover:border-[#F3CF65] hover:bg-[#0d3060]/65 shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className={`text-[11px] font-sans font-bold truncate ${isSelected ? "text-[#F3CF65]" : "text-[#DFC57B]"}`}>
                            {scrip.reference}
                          </span>
                          {isSelected && (
                            <span className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F3CF65]/20 border border-[#F3CF65]/50 text-[#F3CF65] font-bold shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-stone-200 leading-snug line-clamp-3 font-bible font-normal">
                          "{scrip.text}"
                        </p>
                      </button>
                    );
                  })}
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

                {/* DOUBLE MODE TABS (FILL IN BLANKS FIRST, THEN TYPE FROM MEMORY) */}
                <div className="flex bg-[#161D2B] p-1 rounded-lg border border-stone-800">
                  <button
                    onClick={() => {
                      playTransitionChime();
                      setInputMode("fill");
                    }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      inputMode === "fill"
                        ? "bg-[#C9973A] text-[#1C2333]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Fill in the Blanks
                  </button>
                  <button
                    onClick={() => {
                      playTransitionChime();
                      setInputMode("memory");
                    }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      inputMode === "memory"
                        ? "bg-[#C9973A] text-[#1C2333]"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Type From Memory
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
              <div className="pt-4 border-t border-stone-800 flex justify-between items-center bg-stone-900/0 gap-3 flex-wrap">
                <span className="text-[11px] font-mono text-stone-400">
                  {isSubmissionDisabled
                    ? inputMode === "fill"
                      ? `Complete all blanks before reveal (${completedBlanksCount}/${requiredBlankItems.length} filled).`
                      : "Complete your scripture recall attempt (at least 15 characters) before reveal."
                    : "Drill complete — ready to reveal & evaluate!"}
                </span>

                <button
                  disabled={isSubmissionDisabled}
                  onClick={() => {
                    if (isSubmissionDisabled) {
                      playGentleNudge();
                      return;
                    }
                    setTrainerStep(3);
                  }}
                  className={`px-8 py-3.5 text-xs uppercase tracking-widest font-black rounded-xl transition-all shadow-md flex items-center space-x-1.5 ${
                    isSubmissionDisabled
                      ? "bg-stone-800 text-stone-500 cursor-not-allowed shadow-none"
                      : "bg-[#2A9D8F] hover:bg-[#20796E] text-white cursor-pointer"
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
                {onInspectGrid && (
                  <button
                    type="button"
                    onClick={onInspectGrid}
                    className="px-4 py-2 bg-[#06162c] hover:bg-[#0d3060] text-[#DFC57B] border border-[#DFC57B] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 hover:shadow-[0_0_12px_rgba(223,197,123,0.3)]"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-[#DFC57B]" />
                    <span>Inspect Visual Memory Grid</span>
                  </button>
                )}
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
    </div>
  );
};

export default RecallSession;
