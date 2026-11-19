/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Gamepad2,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowRight,
  BookOpen,
  Volume2,
  VolumeX,
  Award,
  ChevronRight
} from "lucide-react";
import { Scripture } from "../../types";
import { useApp } from "../../context/AppContext";
import { playTransitionChime } from "../../utils/pleasantSounds";
import { autoCompleteThirtyDayByScripture, ACTIVE_VERSE_REF_KEY } from "./ThirtyDayRecallPlan";

interface ScriptureGamePackProps {
  initialScripture?: Scripture;
  onLaunchRecallPractice?: (scripture: Scripture) => void;
  onCompleteChallenge?: (gameName: string, score: number) => void;
}

const GAME_VERSES: Scripture[] = [
  {
    id: "rev-14-12",
    reference: "Revelation 14:12",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    keywords: ["patience", "saints", "commandments", "faith", "Jesus"]
  },
  {
    id: "2tim-3-16",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "reproof", "righteousness"]
  },
  {
    id: "dan-8-14",
    reference: "Daniel 8:14",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    keywords: ["thousand", "hundred", "days", "sanctuary", "cleansed"]
  },
  {
    id: "ex-20-8",
    reference: "Exodus 20:8",
    text: "Remember the sabbath day, to keep it holy.",
    keywords: ["Remember", "sabbath", "day", "keep", "holy"]
  },
  {
    id: "eph-2-8",
    reference: "Ephesians 2:8",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
    keywords: ["grace", "saved", "faith", "gift", "God"]
  },
  {
    id: "john-3-16",
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    keywords: ["loved", "world", "begotten", "believeth", "everlasting"]
  },
  {
    id: "psa-119-105",
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    keywords: ["word", "lamp", "feet", "light", "path"]
  },
  {
    id: "isa-8-20",
    reference: "Isaiah 8:20",
    text: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
    keywords: ["law", "testimony", "according", "word", "light"]
  }
];

const ROTATION_RESERVE_VERSES: Scripture[] = [
  {
    id: "john-14-1-3",
    reference: "John 14:1-3",
    text: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions.",
    keywords: ["heart", "troubled", "believe", "mansions", "Father"]
  },
  {
    id: "rom-6-23",
    reference: "Romans 6:23",
    text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
    keywords: ["wages", "death", "gift", "eternal", "Christ"]
  },
  {
    id: "heb-8-1-2",
    reference: "Hebrews 8:1-2",
    text: "We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens.",
    keywords: ["priest", "throne", "Majesty", "heavens", "right"]
  },
  {
    id: "eccl-9-5",
    reference: "Ecclesiastes 9:5",
    text: "For the living know that they shall die: but the dead know not any thing.",
    keywords: ["living", "know", "dead", "thing", "die"]
  },
  {
    id: "rev-14-6-7",
    reference: "Revelation 14:6-7",
    text: "Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth.",
    keywords: ["Fear", "glory", "judgment", "worship", "heaven"]
  }
];

const VICTORY_STORAGE_KEY = "stba_gamepack_victories";

function loadDynamicGameLineup(): Scripture[] {
  const scheduled: Scripture[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("recall_cycle_verses");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            const ref = String(item?.reference || item?.ref || "").trim();
            const txt = String(item?.text || item?.verseText || "").trim();
            if (ref && txt && txt.split(/\s+/).length >= 4) {
              scheduled.push({
                id: item?.id || `scheduled-${idx}-${ref.toLowerCase().replace(/\s+/g, "-")}`,
                reference: ref,
                text: txt,
                keywords: Array.isArray(item?.keywords) && item.keywords.length > 0
                  ? item.keywords
                  : txt.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter((w: string) => w.length >= 5).slice(0, 5)
              });
            }
          });
        }
      }
    } catch {}
  }

  let victories: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const rawV = localStorage.getItem(VICTORY_STORAGE_KEY);
      if (rawV) {
        const parsedV = JSON.parse(rawV);
        if (Array.isArray(parsedV)) victories = parsedV;
      }
    } catch {}
  }

  const allDefaultMastered = GAME_VERSES.every((v) => victories.includes(v.reference.toLowerCase()));
  const pool = allDefaultMastered
    ? [...scheduled, ...ROTATION_RESERVE_VERSES, ...GAME_VERSES]
    : [...scheduled, ...GAME_VERSES];

  // Deduplicate by normalized reference while keeping up to 8+ scheduled verses
  const seen = new Set<string>();
  const lineup: Scripture[] = [];
  for (const v of pool) {
    const key = v.reference.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      lineup.push(v);
    }
    if (lineup.length >= Math.max(8, scheduled.length + 5)) break;
  }
  return lineup.length > 0 ? lineup : GAME_VERSES;
}

type GameType = "jumble" | "blitz" | "keyword";

const normalizeRefKey = (ref: string) => ref.toLowerCase().replace(/\s+/g, "").trim();

function ensureScriptureInLineup(target: Scripture | undefined, baseLineup: Scripture[]): Scripture[] {
  if (!target?.reference) return baseLineup;
  const targetKey = normalizeRefKey(target.reference);
  const exists = baseLineup.some(
    (v) => v.id === target.id || normalizeRefKey(v.reference) === targetKey
  );
  if (exists) return baseLineup;
  return [target, ...baseLineup];
}

export const ScriptureGamePack: React.FC<ScriptureGamePackProps> = ({
  initialScripture,
  onLaunchRecallPractice,
  onCompleteChallenge
}) => {
  const { showConfetti } = useApp();
  const [selectedGame, setSelectedGame] = useState<GameType>("jumble");
  const [gameLineup, setGameLineup] = useState<Scripture[]>(() =>
    ensureScriptureInLineup(initialScripture, loadDynamicGameLineup())
  );
  const [currentScripture, setCurrentScripture] = useState<Scripture>(
    () => initialScripture || loadDynamicGameLineup()[0]
  );

  // Sync newly scheduled Sabbath School / Memory Vault verses dynamically while keeping active target in lineup
  useEffect(() => {
    const refreshLineup = () => {
      setGameLineup(ensureScriptureInLineup(initialScripture || currentScripture, loadDynamicGameLineup()));
    };
    window.addEventListener("storage", refreshLineup);
    window.addEventListener("focus", refreshLineup);
    return () => {
      window.removeEventListener("storage", refreshLineup);
      window.removeEventListener("focus", refreshLineup);
    };
  }, [initialScripture, currentScripture]);

  const recordVictory = (reference: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(VICTORY_STORAGE_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const key = reference.toLowerCase();
      if (!arr.includes(key)) {
        localStorage.setItem(VICTORY_STORAGE_KEY, JSON.stringify([...arr, key]));
      }
      autoCompleteThirtyDayByScripture(currentScripture?.id, reference);
    } catch {}
  };

  // Persist active verse reference across applications
  useEffect(() => {
    if (currentScripture?.reference) {
      try {
        localStorage.setItem(ACTIVE_VERSE_REF_KEY, currentScripture.reference);
      } catch {}
    }
  }, [currentScripture?.reference]);

  // Sync if prop updates and ensure the incoming verse is present & highlighted in the lineup
  useEffect(() => {
    if (initialScripture) {
      setCurrentScripture(initialScripture);
      setGameLineup((prev) => ensureScriptureInLineup(initialScripture, prev));
    }
  }, [initialScripture]);

  // Gamification Stats
  const [totalXp, setTotalXp] = useState<number>(() => {
    return parseInt(localStorage.getItem("stba_gamepack_xp") || "320", 10);
  });
  const [streak, setStreak] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sound effects helper using Web Audio API
  const playTone = (type: "correct" | "wrong" | "finish") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "wrong") {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(160, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "finish") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.3);
          o.start(audioCtx.currentTime + i * 0.1);
          o.stop(audioCtx.currentTime + i * 0.1 + 0.35);
        });
      }
    } catch (e) {}
  };

  const addXp = (amount: number) => {
    if (amount <= 0) return;
    setTotalXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("stba_gamepack_xp", next.toString());
      return next;
    });
  };

  /* ========================================================
     GAME 1: WORD JUMBLE BLITZ (Interchangeable Matching Words)
     ======================================================== */
  const originalWords = useMemo(() => {
    return currentScripture.text.split(/\s+/).filter(Boolean);
  }, [currentScripture.text]);

  const normalizeMatchWord = (w: string) =>
    w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "").trim();

  const [jumbleScrambled, setJumbleScrambled] = useState<{ id: number; word: string }[]>([]);
  const [jumbleSelected, setJumbleSelected] = useState<number[]>([]);
  const [jumbleErrors, setJumbleErrors] = useState<number>(0);
  const [consecutiveJumbleMisses, setConsecutiveJumbleMisses] = useState<number>(0);
  const [jumbleCompleted, setJumbleCompleted] = useState<boolean>(false);
  const [jumbleStartTime, setJumbleStartTime] = useState<number>(Date.now());
  const [jumbleElapsed, setJumbleElapsed] = useState<number>(0);

  const initJumbleGame = () => {
    const list = originalWords.map((w, idx) => ({ id: idx, word: w }));
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setJumbleScrambled(shuffled);
    setJumbleSelected([]);
    setJumbleErrors(0);
    setConsecutiveJumbleMisses(0);
    setJumbleCompleted(false);
    setJumbleStartTime(Date.now());
    setJumbleElapsed(0);
  };

  useEffect(() => {
    if (selectedGame === "jumble") {
      initJumbleGame();
    }
  }, [currentScripture, selectedGame]);

  const handleJumbleWordClick = (id: number) => {
    if (jumbleCompleted || jumbleSelected.includes(id)) return;
    const expectedNextIndex = jumbleSelected.length;
    const expectedWord = originalWords[expectedNextIndex];
    const clickedItem = jumbleScrambled.find((item) => item.id === id);
    if (!expectedWord || !clickedItem) return;

    // Interchangeable matching words: any unused tile matching the expected word text is accepted
    const isExactOrNormalizedMatch =
      clickedItem.id === expectedNextIndex ||
      normalizeMatchWord(clickedItem.word) === normalizeMatchWord(expectedWord);

    if (isExactOrNormalizedMatch) {
      const next = [...jumbleSelected, id];
      setJumbleSelected(next);
      setConsecutiveJumbleMisses(0);
      setStreak((s) => s + 1);
      addXp(5);
      playTone("correct");

      if (next.length === originalWords.length) {
        setJumbleCompleted(true);
        const timeTaken = Math.round((Date.now() - jumbleStartTime) / 1000);
        setJumbleElapsed(timeTaken);
        const bonusXp = Math.max(50, 100 - jumbleErrors * 10 - Math.floor(timeTaken / 2));
        addXp(bonusXp);
        recordVictory(currentScripture.reference);
        playTone("finish");
        showConfetti("recall");
        if (onCompleteChallenge) onCompleteChallenge("Word Jumble Blitz", bonusXp);
      }
    } else {
      // Wrong word clicked (XP preserved; after 5 misses on current word, highlight next word pulsating green)
      setJumbleErrors((e) => e + 1);
      setConsecutiveJumbleMisses((m) => m + 1);
      setStreak(0);
      playTone("wrong");
    }
  };

  /* ========================================================
     GAME 2: SPEED RECALL SPRINT (25s Timer, -2s Penalty, XP Preserved)
     ======================================================== */
  const SPRINT_DURATION_SECONDS = 25;
  const [blitzStep, setBlitzStep] = useState<number>(0);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzFinished, setBlitzFinished] = useState<boolean>(false);
  const [blitzTimedOut, setBlitzTimedOut] = useState<boolean>(false);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState<number>(SPRINT_DURATION_SECONDS);
  const [penaltyFlash, setPenaltyFlash] = useState<boolean>(false);

  // Generate 4 progressive blank challenges for current verse
  const blitzQuestions = useMemo(() => {
    const words = originalWords;
    if (words.length < 4) return [];

    const indicesToBlank = [
      Math.floor(words.length * 0.2),
      Math.floor(words.length * 0.4),
      Math.floor(words.length * 0.7),
      Math.max(0, words.length - 1)
    ];

    return indicesToBlank.map((blankIdx) => {
      const correctWord = words[blankIdx].replace(/[^a-zA-Z]/g, "");
      const distractors = [
        "faith",
        "grace",
        "covenant",
        "sanctuary",
        "commandment",
        "patience",
        "truth",
        "testimony"
      ].filter((d) => d.toLowerCase() !== correctWord.toLowerCase()).slice(0, 3);

      const options = [correctWord, ...distractors].sort(() => Math.random() - 0.5);

      const sentenceWithBlank = words
        .map((w, idx) => (idx === blankIdx ? "_______" : w))
        .join(" ");

      return {
        sentence: sentenceWithBlank,
        correct: correctWord,
        options
      };
    });
  }, [originalWords]);

  const resetBlitz = () => {
    setBlitzStep(0);
    setBlitzScore(0);
    setBlitzFinished(false);
    setBlitzTimedOut(false);
    setBlitzTimeLeft(SPRINT_DURATION_SECONDS);
    setPenaltyFlash(false);
  };

  // Automatic timer and state reset whenever scripture or game mode changes
  useEffect(() => {
    if (selectedGame === "blitz") {
      resetBlitz();
    }
  }, [currentScripture, selectedGame]);

  // 25-second countdown timer for Speed Recall Sprint
  useEffect(() => {
    if (selectedGame !== "blitz" || blitzFinished) return;

    if (blitzTimeLeft <= 0) {
      setBlitzTimedOut(true);
      setBlitzFinished(true);
      playTone("wrong");
      return;
    }

    const timer = window.setInterval(() => {
      setBlitzTimeLeft((prev) => {
        if (prev <= 1) {
          setBlitzTimedOut(true);
          setBlitzFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [selectedGame, blitzFinished, blitzTimeLeft]);

  const handleBlitzAnswer = (chosen: string) => {
    if (blitzFinished) return;
    const q = blitzQuestions[blitzStep];
    if (!q) return;

    const isCorrect = chosen.toLowerCase() === q.correct.toLowerCase();

    if (isCorrect) {
      const nextScore = blitzScore + 25;
      setBlitzScore(nextScore);
      setStreak((st) => st + 1);
      addXp(15);
      playTone("correct");

      if (blitzStep < blitzQuestions.length - 1) {
        setBlitzStep((s) => s + 1);
      } else {
        setBlitzFinished(true);
        setBlitzTimedOut(false);
        addXp(75);
        recordVictory(currentScripture.reference);
        playTone("finish");
        showConfetti("recall");
        if (onCompleteChallenge) onCompleteChallenge("Speed Recall Sprint", nextScore);
      }
    } else {
      // 2-second penalty for incorrect answers while preserving all accumulated XP
      setStreak(0);
      playTone("wrong");
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 750);
      setBlitzTimeLeft((prev) => {
        const next = Math.max(0, prev - 2);
        if (next === 0) {
          setBlitzTimedOut(true);
          setBlitzFinished(true);
        }
        return next;
      });
    }
  };

  return (
    <div className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-6" id="scripture-game-pack-root">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#DFC57B]">
            <Gamepad2 className="w-5 h-5 text-[#DFC57B] drop-shadow-[0_0_6px_rgba(223,197,123,0.4)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              SCRIPTURE MEMORIZATION GAME PACK
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            Active Gamified Scripture Challenges
          </h2>
          {/* Dynamic three-sentence instructional text based on selected game mode */}
          <p className="text-xs text-stone-300 leading-relaxed max-w-2xl mt-1" id="gamepack-dynamic-instructions">
            {selectedGame === "jumble"
              ? "Study the target scripture carefully and tap the scrambled words below in exact sequential order. Duplicate matching words are fully interchangeable so any matching tile advances your sequence cleanly. Complete the entire verse accurately to accumulate bonus XP and unlock an instant replay option."
              : "Race against the 25-second countdown timer to select the exact missing word for each prompt in the passage. Every incorrect answer deducts 2 seconds from your remaining time while keeping all accumulated XP safely preserved. Switching scriptures automatically resets the timer and sprint state so you can begin each verse fresh."}
          </p>
        </div>

        {/* STATS BADGES */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06162c] border border-[#DFC57B]/60 rounded-xl text-xs font-mono font-bold text-[#DFC57B]" id="gamepack-xp-badge">
            <Trophy className="w-4 h-4 text-[#DFC57B]" />
            <span>{totalXp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs font-mono font-bold text-amber-400">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{streak} Streak</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute audio" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#DFC57B]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Periodic 7-second shimmer keyframes for instructional prompt */}
      <style>{`
        @keyframes stbaShimmerSweep7s {
          0%, 72% {
            background-position: -200% 0;
          }
          86% {
            background-position: 200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .stba-shimmer-text-7s {
          background: linear-gradient(90deg, #cbd5e1 0%, #cbd5e1 35%, #f3cf65 50%, #cbd5e1 65%, #cbd5e1 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: stbaShimmerSweep7s 7s ease-in-out infinite;
        }
      `}</style>

      {/* GAME MODE SELECTION BUTTONS (Side-by-Side) + HORIZONTALLY ALIGNED VERSE PILL */}
      <div className="space-y-2.5">
        {/* Row 1: SELECT INTERACTIVE GAME MODE centered over the two buttons + Verse pill on the same horizontal line nudged right (before XP edge) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 text-center sm:w-[335px] shrink-0">
            SELECT INTERACTIVE GAME MODE
          </span>

          <div className="flex justify-center sm:justify-end sm:flex-1 md:pr-[265px]">
            <span
              id="gamepack-centered-verse-pill"
              className="text-base sm:text-lg font-serif font-extrabold tracking-normal text-[#DFC57B] bg-[#06162c] border border-[#DFC57B]/60 px-4 py-1.5 rounded-full shadow-[0_0_12px_rgba(223,197,123,0.2)] text-center whitespace-nowrap"
            >
              Verse: {currentScripture.reference}
            </span>
          </div>
        </div>

        {/* Row 2: Mode Buttons strictly side-by-side horizontally (+ 25s Sprint timer beside Speed Recall Sprint) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-mode-word-jumble"
            onClick={() => {
              if (soundEnabled) playTransitionChime();
              setSelectedGame("jumble");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-sans font-semibold transition-all duration-200 border cursor-pointer shrink-0 ${
              selectedGame === "jumble"
                ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
            }`}
          >
            <Zap className="w-4 h-4 text-[#DFC57B]" />
            <span>Word Jumble Blitz</span>
          </button>

          <button
            id="btn-mode-speed-sprint"
            onClick={() => {
              if (soundEnabled) playTransitionChime();
              setSelectedGame("blitz");
              resetBlitz();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-sans font-semibold transition-all duration-200 border cursor-pointer shrink-0 ${
              selectedGame === "blitz"
                ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
            }`}
          >
            <Clock className="w-4 h-4 text-[#DFC57B]" />
            <span>Speed Recall Sprint</span>
          </button>

          {/* 25-Second Timer directly next to the Speed Recall Sprint selection button */}
          {selectedGame === "blitz" && (
            <div
              id="sprint-timer-badge"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-mono font-extrabold border transition-all shrink-0 ${
                penaltyFlash
                  ? "bg-rose-600/30 border-rose-400 text-rose-200 scale-105"
                  : blitzTimeLeft <= 5
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                  : blitzTimeLeft <= 10
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : "bg-[#06162c] border-[#DFC57B]/70 text-[#DFC57B]"
              }`}
              title="Speed Recall Sprint 25-second countdown (-2s penalty on wrong answers)"
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{blitzTimeLeft}s</span>
              {penaltyFlash && (
                <span className="text-[10px] font-black text-rose-300 ml-1">-2s</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VERSE PICKER PILLS (8+ Rotating & Scheduled Sabbath School Verses with Sound Effect) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-[10px] uppercase font-mono text-stone-500 font-bold shrink-0 mr-1">
          CHOOSE VERSE:
        </span>
        {gameLineup.map((v) => {
          const isHighlighted =
            currentScripture.id === v.id ||
            normalizeRefKey(currentScripture.reference) === normalizeRefKey(v.reference);
          return (
            <button
              key={v.id}
              type="button"
              data-active-verse={isHighlighted ? "true" : "false"}
              onClick={() => {
                if (soundEnabled) playTransitionChime();
                setCurrentScripture(v);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-sans font-bold whitespace-nowrap transition-all cursor-pointer ${
                isHighlighted
                  ? "bg-[#DFC57B] text-[#06162c] border border-[#F3CF65] shadow-[0_0_12px_rgba(223,197,123,0.4)] ring-1 ring-[#F3CF65]"
                  : "bg-stone-900 border border-stone-800 text-stone-300 hover:border-stone-700"
              }`}
            >
              {v.reference}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          ACTIVE GAME 1: WORD JUMBLE BLITZ
          ======================================================== */}
      {selectedGame === "jumble" && (
        <div className="bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#DFC57B] font-bold">
                STAGE: SEQUENTIAL WORD ASSEMBLY
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Assemble {currentScripture.reference} in exact sequence
              </h3>
            </div>
            <button
              onClick={initJumbleGame}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#DFC57B]" />
              <span>Reset</span>
            </button>
          </div>

          {/* RECONSTRUCTED PREVIEW BOX (Centered & Bold Verse Formatting) */}
          <div className="min-h-24 p-5 bg-[#161D2B] border border-stone-800 rounded-xl flex flex-col items-center justify-center text-center gap-2.5" id="jumble-verse-preview">
            <span className="text-sm sm:text-base font-serif tracking-wide text-[#DFC57B] font-extrabold">
              {currentScripture.reference}
            </span>
            {jumbleSelected.length === 0 ? (
              <span className="text-sm sm:text-base italic font-bold stba-shimmer-text-7s" id="jumble-shimmer-prompt">
                Tap words below in sequence to assemble the scripture...
              </span>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {jumbleSelected.map((tileId, posIdx) => (
                  <motion.span
                    key={`${tileId}-${posIdx}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-1 bg-[#06162c] text-[#DFC57B] border border-[#DFC57B]/50 rounded-lg text-sm font-bold shadow-xs text-center"
                  >
                    {originalWords[posIdx]}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* SCRAMBLED WORDS BOARD */}
          {!jumbleCompleted ? (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                TAP WORDS IN ORDER:
              </span>
              <div className="flex flex-wrap gap-2">
                {jumbleScrambled.map(({ id, word }) => {
                  const isUsed = jumbleSelected.includes(id);
                  const expectedNextWord = originalWords[jumbleSelected.length];
                  const isHintMatch =
                    !isUsed &&
                    consecutiveJumbleMisses >= 5 &&
                    expectedNextWord &&
                    (id === jumbleSelected.length ||
                      normalizeMatchWord(word) === normalizeMatchWord(expectedNextWord));

                  return (
                    <button
                      key={id}
                      onClick={() => handleJumbleWordClick(id)}
                      disabled={isUsed}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isUsed
                          ? "opacity-20 bg-stone-900 border border-stone-800 cursor-not-allowed text-stone-600 line-through"
                          : isHintMatch
                          ? "bg-emerald-500/25 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.55)] animate-pulse font-bold"
                          : "bg-[#182338] hover:bg-[#203150] active:scale-95 text-stone-100 border border-stone-700 hover:border-[#DFC57B] shadow-xs"
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-[#06162c] border border-[#DFC57B] rounded-xl text-center space-y-3"
            >
              <CheckCircle2 className="w-10 h-10 text-[#DFC57B] mx-auto animate-bounce" />
              <h4 className="text-lg font-serif font-bold text-white">
                Verse Assembled Perfectly!
              </h4>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                You assembled {currentScripture.reference} in {jumbleElapsed} seconds with only {jumbleErrors} error(s).
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={initJumbleGame}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Play Again
                </button>
                {onLaunchRecallPractice && (
                  <button
                    onClick={() => onLaunchRecallPractice(currentScripture)}
                    className="px-5 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Practice Verbatim Recall</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ========================================================
          ACTIVE GAME 2: SPEED RECALL BLITZ
          ======================================================== */}
      {selectedGame === "blitz" && (
        <div className="bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-5">
          {!blitzFinished && blitzQuestions[blitzStep] ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>QUESTION {blitzStep + 1} OF {blitzQuestions.length}</span>
                <span className="text-[#DFC57B] font-bold">SCORE: {blitzScore} PTS</span>
              </div>

              {/* SENTENCE WITH BLANK (Centered & Bold Verse Formatting) */}
              <div className="p-5 bg-[#161D2B] border border-stone-800 rounded-xl text-center" id="sprint-verse-prompt">
                <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block mb-2 font-bold">
                  FILL THE MISSING WORD:
                </span>
                <p className="text-base sm:text-lg font-bible text-stone-100 font-bold leading-relaxed text-center max-w-3xl mx-auto">
                  "{blitzQuestions[blitzStep].sentence}"
                </p>
                <span className="text-xs font-serif font-bold text-[#DFC57B] mt-2 block text-center">
                  — {currentScripture.reference}
                </span>
              </div>

              {/* OPTIONS GRID */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {blitzQuestions[blitzStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleBlitzAnswer(opt)}
                    className="p-3.5 rounded-xl bg-[#182338] hover:bg-[#203150] border border-stone-700 hover:border-[#DFC57B] text-stone-100 text-sm font-semibold transition-all cursor-pointer text-center"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-[#06162c] border border-[#DFC57B] rounded-xl text-center space-y-3"
            >
              <Award className="w-10 h-10 text-[#DFC57B] mx-auto" />
              <h4 className="text-lg font-serif font-bold text-white">
                {blitzTimedOut ? "Time's Up!" : "Sprint Completed!"}
              </h4>
              <p className="text-xs text-stone-300 text-center font-bold max-w-lg mx-auto">
                "{currentScripture.text}"
              </p>
              <p className="text-xs text-stone-300">
                You scored <strong className="text-[#DFC57B]">{blitzScore} Points</strong> on {currentScripture.reference} — all <strong className="text-[#DFC57B]">{totalXp} XP</strong> safely preserved.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetBlitz}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Restart Sprint
                </button>
                {onLaunchRecallPractice && (
                  <button
                    onClick={() => onLaunchRecallPractice(currentScripture)}
                    className="px-5 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Test Verbatim Recall</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
