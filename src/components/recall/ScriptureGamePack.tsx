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
  }
];

type GameType = "jumble" | "blitz" | "keyword";

export const ScriptureGamePack: React.FC<ScriptureGamePackProps> = ({
  initialScripture,
  onLaunchRecallPractice,
  onCompleteChallenge
}) => {
  const { showConfetti } = useApp();
  const [selectedGame, setSelectedGame] = useState<GameType>("jumble");
  const [currentScripture, setCurrentScripture] = useState<Scripture>(
    initialScripture || GAME_VERSES[0]
  );

  // Sync if prop updates
  useEffect(() => {
    if (initialScripture) {
      setCurrentScripture(initialScripture);
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
    const next = totalXp + amount;
    setTotalXp(next);
    localStorage.setItem("stba_gamepack_xp", next.toString());
  };

  /* ========================================================
     GAME 1: WORD JUMBLE MATRIX
     ======================================================== */
  const originalWords = useMemo(() => {
    return currentScripture.text.split(/\s+/).filter(Boolean);
  }, [currentScripture.text]);

  const [jumbleScrambled, setJumbleScrambled] = useState<{ id: number; word: string }[]>([]);
  const [jumbleSelected, setJumbleSelected] = useState<number[]>([]);
  const [jumbleErrors, setJumbleErrors] = useState<number>(0);
  const [jumbleCompleted, setJumbleCompleted] = useState<boolean>(false);
  const [jumbleStartTime, setJumbleStartTime] = useState<number>(Date.now());
  const [jumbleElapsed, setJumbleElapsed] = useState<number>(0);

  const initJumbleGame = () => {
    const list = originalWords.map((w, idx) => ({ id: idx, word: w }));
    // Shuffle deterministic
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setJumbleScrambled(shuffled);
    setJumbleSelected([]);
    setJumbleErrors(0);
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
    if (jumbleCompleted) return;
    const expectedNextIndex = jumbleSelected.length;

    if (id === expectedNextIndex) {
      // Correct word
      const next = [...jumbleSelected, id];
      setJumbleSelected(next);
      setStreak(s => s + 1);
      playTone("correct");

      if (next.length === originalWords.length) {
        // Complete!
        setJumbleCompleted(true);
        const timeTaken = Math.round((Date.now() - jumbleStartTime) / 1000);
        setJumbleElapsed(timeTaken);
        const earned = Math.max(50, 100 - jumbleErrors * 10 - Math.floor(timeTaken / 2));
        addXp(earned);
        playTone("finish");
        showConfetti("recall");
        if (onCompleteChallenge) onCompleteChallenge("Word Jumble Blitz", earned);
      }
    } else {
      // Wrong word clicked
      setJumbleErrors(e => e + 1);
      setStreak(0);
      playTone("wrong");
    }
  };

  /* ========================================================
     GAME 2: SPEED RECALL BLITZ
     ======================================================== */
  const [blitzStep, setBlitzStep] = useState<number>(0);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzFinished, setBlitzFinished] = useState<boolean>(false);

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
      // Distractors from other words or biblical pool
      const distractors = [
        "faith",
        "grace",
        "covenant",
        "sanctuary",
        "commandment",
        "patience",
        "truth",
        "testimony"
      ].filter(d => d.toLowerCase() !== correctWord.toLowerCase()).slice(0, 3);

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

  const handleBlitzAnswer = (chosen: string) => {
    const q = blitzQuestions[blitzStep];
    if (!q) return;

    if (chosen.toLowerCase() === q.correct.toLowerCase()) {
      setBlitzScore(s => s + 25);
      setStreak(st => st + 1);
      playTone("correct");
    } else {
      setStreak(0);
      playTone("wrong");
    }

    if (blitzStep < blitzQuestions.length - 1) {
      setBlitzStep(s => s + 1);
    } else {
      setBlitzFinished(true);
      addXp(75);
      playTone("finish");
      showConfetti("recall");
      if (onCompleteChallenge) onCompleteChallenge("Speed Recall Blitz", blitzScore + 25);
    }
  };

  const resetBlitz = () => {
    setBlitzStep(0);
    setBlitzScore(0);
    setBlitzFinished(false);
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
          <p className="text-xs text-stone-400">
            Strengthen neural recall through fast-paced puzzles, word assembly, and combo multipliers.
          </p>
        </div>

        {/* STATS BADGES */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06162c] border border-[#DFC57B]/60 rounded-xl text-xs font-mono font-bold text-[#DFC57B]">
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

      {/* GAME MODE SELECTION BUTTONS (ROUND WITH GOLD TRIM) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-stone-400">
          <span>SELECT INTERACTIVE GAME MODE</span>
          <span className="text-[#DFC57B] font-bold">VERSE: {currentScripture.reference}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedGame("jumble")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-sans font-semibold transition-all duration-200 border cursor-pointer ${
              selectedGame === "jumble"
                ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
            }`}
          >
            <Zap className="w-4 h-4 text-[#DFC57B]" />
            <span>Word Jumble Blitz</span>
          </button>

          <button
            onClick={() => {
              setSelectedGame("blitz");
              resetBlitz();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs font-sans font-semibold transition-all duration-200 border cursor-pointer ${
              selectedGame === "blitz"
                ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
            }`}
          >
            <Clock className="w-4 h-4 text-[#DFC57B]" />
            <span>Speed Recall Sprint</span>
          </button>
        </div>
      </div>

      {/* VERSE PICKER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-[10px] uppercase font-mono text-stone-500 font-bold shrink-0 mr-1">
          CHOOSE VERSE:
        </span>
        {GAME_VERSES.map((v) => (
          <button
            key={v.id}
            onClick={() => setCurrentScripture(v)}
            className={`px-3 py-1 rounded-lg text-[11px] font-sans font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentScripture.id === v.id
                ? "bg-[#DFC57B] text-[#06162c] shadow-xs"
                : "bg-stone-900 border border-stone-800 text-stone-300 hover:border-stone-700"
            }`}
          >
            {v.reference}
          </button>
        ))}
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

          {/* RECONSTRUCTED PREVIEW BOX */}
          <div className="min-h-20 p-4 bg-[#161D2B] border border-stone-800 rounded-xl flex flex-wrap items-center gap-2">
            {jumbleSelected.length === 0 ? (
              <span className="text-xs text-stone-500 italic">
                Tap words below in sequence to assemble the scripture...
              </span>
            ) : (
              jumbleSelected.map((idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2.5 py-1 bg-[#06162c] text-[#DFC57B] border border-[#DFC57B]/40 rounded-lg text-xs font-semibold shadow-xs"
                >
                  {originalWords[idx]}
                </motion.span>
              ))
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
                  return (
                    <button
                      key={id}
                      onClick={() => handleJumbleWordClick(id)}
                      disabled={isUsed}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isUsed
                          ? "opacity-20 bg-stone-900 border border-stone-800 cursor-not-allowed text-stone-600 line-through"
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

              {/* SENTENCE WITH BLANK */}
              <div className="p-5 bg-[#161D2B] border border-stone-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block mb-2 font-bold">
                  FILL THE MISSING WORD:
                </span>
                <p className="text-base sm:text-lg font-bible text-stone-100 font-semibold leading-relaxed">
                  "{blitzQuestions[blitzStep].sentence}"
                </p>
                <span className="text-xs font-serif text-stone-400 mt-2 block">
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
                Sprint Completed!
              </h4>
              <p className="text-xs text-stone-300">
                You earned <strong className="text-[#DFC57B]">{blitzScore} Points</strong> on {currentScripture.reference}.
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
