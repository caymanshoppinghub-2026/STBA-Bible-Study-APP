/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { callElderStephen } from "../lib/callElderStephen";
import {
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  Mic,
  Shield,
  HelpCircle,
  FileText
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";

export interface MasteryLevel {
  level: number;
  name: string;
  unlocked: boolean;
  active: boolean;
  unlocks: string[];
  description: string;
  requirements: {
    label: string;
    target: number;
    current: number;
    completed: boolean;
  }[];
  quote: string;
  quoteAuthor: string;
  badgeColor: string;
}

interface MasteryPathProps {
  onClose?: () => void;
  embedded?: boolean;
}

export const MasteryPath: React.FC<MasteryPathProps> = ({ onClose, embedded = false }) => {
  const { sabbathMode } = useSabbathMode();

  // Simulated metrics that the user can toggle to see progress and updates!
  const [stats, setStats] = useState({
    consecutiveDays: 14,
    preTestsCompleted: 1,
    versesInVault: 32,
    teachItCount: 4,
    tracksStarted: 3,
    firstTeachItScore: 78,
    tracksCompleted: 1,
    stbaSessions: 11,
    exegesisSaved: true,
    classSessionsLed: 2,
    evangelismSessionsHigh: 2
  });

  const [hudFeedback, setHudFeedback] = useState("");

  useEffect(() => {
    const syncMasteryHUD = async () => {
      try {
        let completedChunks: string[] = [];
        try {
          const savedCompleted = localStorage.getItem("stba_completed_verses");
          if (savedCompleted) {
            completedChunks = JSON.parse(savedCompleted);
          }
        } catch (e) {}

        const masteryState = {
          completedVersesCount: completedChunks.length,
          totalVersesCount: 28,
          completionRate: completedChunks.length > 0 ? Math.round((completedChunks.length / 28) * 100) : 0,
          lastActiveDate: new Date().toISOString().split("T")[0],
          favoriteScriptures: ["Hebrews 8:1-2", "Revelation 14:12"]
        };

        const historyLog = [
          { role: "user" as const, text: `Active HUD milestone consecutive days: ${stats.consecutiveDays}. Verses inside Vault: ${stats.versesInVault}.` }
        ];

        const res = await callElderStephen({
          currentMode: "STBA",
          masteryState,
          historyLog,
          userAction: "mastery_hud_update"
        });

        if (res && res.text) {
          setHudFeedback(res.text);
        }
      } catch (err) {
        console.error("Failed to sync Mastery HUD update with Elder Stephen:", err);
      }
    };

    // Debounce slightly to prevent double-firing
    const timer = setTimeout(() => {
      syncMasteryHUD();
    }, 500);
    return () => clearTimeout(timer);
  }, [stats]);

  // Level Definitions according to prompt
  const levels: MasteryLevel[] = [
    {
      level: 1,
      name: "BEGINNER",
      unlocked: true,
      active: stats.consecutiveDays >= 7 && stats.preTestsCompleted >= 1 && stats.versesInVault >= 10,
      unlocks: ["Active Recall Method", "Spaced Repetition System", "28 Fundamentals Track"],
      description: "You've taken the first step. Your job now is to show up consistently.",
      requirements: [
        {
          label: "Onboarding installation completed",
          target: 1,
          current: 1,
          completed: true
        },
        {
          label: "7 consecutive study days",
          target: 7,
          current: stats.consecutiveDays,
          completed: stats.consecutiveDays >= 7
        },
        {
          label: "Pre-test on first track done",
          target: 1,
          current: stats.preTestsCompleted,
          completed: stats.preTestsCompleted >= 1
        },
        {
          label: "10 verses recalled perfectly",
          target: 10,
          current: stats.versesInVault,
          completed: stats.versesInVault >= 10
        }
      ],
      quote: "The system of God ... is characterized by order and consistency, which tells of divine wisdom at every step.",
      quoteAuthor: "Ellen White, Testimonies for the Church",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      level: 2,
      name: "STUDENT",
      unlocked: stats.consecutiveDays >= 7 && stats.preTestsCompleted >= 1 && stats.versesInVault >= 10,
      active: stats.consecutiveDays >= 7 && stats.preTestsCompleted >= 1 && stats.versesInVault >= 10 && stats.teachItCount >= 3 && stats.versesInVault >= 25 && stats.tracksStarted >= 2 && stats.firstTeachItScore >= 70,
      unlocks: ["Interleaving Modes", "Teach-It Voice Studio", "Three Angels' Messages Track"],
      description: "You understand the method. Now go deeper.",
      requirements: [
        {
          label: "3 Teach-It completed sessions",
          target: 3,
          current: stats.teachItCount,
          completed: stats.teachItCount >= 3
        },
        {
          label: "25 verses stored in Memory Vault",
          target: 25,
          current: stats.versesInVault,
          completed: stats.versesInVault >= 25
        },
        {
          label: "2 tracks successfully started",
          target: 2,
          current: stats.tracksStarted,
          completed: stats.tracksStarted >= 2
        },
        {
          label: "First Teach-It score ≥ 70%",
          target: 70,
          current: stats.firstTeachItScore,
          completed: stats.firstTeachItScore >= 70
        }
      ],
      quote: "None should remain in ignorance. Let the student dig deep for the truth, for there are mines of precious wisdom to explore.",
      quoteAuthor: "Ellen White, Christian Education",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200"
    },
    {
      level: 3,
      name: "SCHOLAR",
      unlocked: stats.consecutiveDays >= 7 && stats.preTestsCompleted >= 1 && stats.versesInVault >= 25 && stats.teachItCount >= 3 && stats.tracksStarted >= 2 && stats.firstTeachItScore >= 70,
      active: stats.tracksCompleted >= 1 && stats.versesInVault >= 50 && stats.stbaSessions >= 10 && stats.exegesisSaved,
      unlocks: ["STBA Deep Study Mode", "Book-by-Book Memory Goals Track", "SDA Commentary Sidebar"],
      description: "You're no longer just memorizing. You're interpreting.",
      requirements: [
        {
          label: "Complete 1 full scripture study track",
          target: 1,
          current: stats.tracksCompleted,
          completed: stats.tracksCompleted >= 1
        },
        {
          label: "50 verses logged in Memory Vault",
          target: 50,
          current: stats.versesInVault,
          completed: stats.versesInVault >= 50
        },
        {
          label: "10 STBA deep study sessions",
          target: 10,
          current: stats.stbaSessions,
          completed: stats.stbaSessions >= 10
        },
        {
          label: "First detailed exegesis stored",
          target: 1,
          current: stats.exegesisSaved ? 1 : 0,
          completed: stats.exegesisSaved
        }
      ],
      quote: "The Bible is its own expositor. One passage will be key to unlock other passages, and in this way light will be shed upon the word.",
      quoteAuthor: "Ellen White, Steps to Christ",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      level: 4,
      name: "TEACHER",
      unlocked: stats.tracksCompleted >= 1 && stats.versesInVault >= 50 && stats.stbaSessions >= 10 && stats.exegesisSaved,
      active: stats.tracksCompleted >= 2 && stats.versesInVault >= 100 && stats.classSessionsLed >= 5,
      unlocks: ["Sabbath School Teacher View", "Class Deck Builder", "Weekly Sabbath School Gap Reports"],
      description: "You've mastered enough to lead others. Now multiply what you've learned.",
      requirements: [
        {
          label: "Complete 2 complete tracks",
          target: 2,
          current: stats.tracksCompleted,
          completed: stats.tracksCompleted >= 2
        },
        {
          label: "100 verses logged in Memory Vault",
          target: 100,
          current: stats.versesInVault,
          completed: stats.versesInVault >= 100
        },
        {
          label: "5 class sessions led (or 20 Teach-It sessions)",
          target: 5,
          current: stats.classSessionsLed,
          completed: stats.classSessionsLed >= 5
        }
      ],
      quote: "Those who receive the truth must teach it to others. Line upon line, precept upon precept, must the precious messages of God's grace be held forth.",
      quoteAuthor: "Ellen White, Gospel Workers",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200"
    },
    {
      level: 5,
      name: "EVANGELIST",
      unlocked: stats.tracksCompleted >= 2 && stats.versesInVault >= 100 && stats.classSessionsLed >= 5,
      active: stats.tracksCompleted >= 3 && stats.versesInVault >= 200 && stats.evangelismSessionsHigh >= 3,
      unlocks: ["Evangelism Special Syllabus", "Public Presentation Analysis Integration", "Full SDA Resources Access"],
      description: "You are ready to present these truths publicly, with clarity, grace, and conviction.",
      requirements: [
        {
          label: "Complete 3 scripture tracks",
          target: 3,
          current: stats.tracksCompleted,
          completed: stats.tracksCompleted >= 3
        },
        {
          label: "200 verses in Vault",
          target: 200,
          current: stats.versesInVault,
          completed: stats.versesInVault >= 200
        },
        {
          label: "Earn score ≥ 80% on 3 evangelism Teach-Its",
          target: 3,
          current: stats.evangelismSessionsHigh,
          completed: stats.evangelismSessionsHigh >= 3
        }
      ],
      quote: "The truths of prophecy are to be proclaimed in every land. With warning tones, the message is to be given, and hearts prepared.",
      quoteAuthor: "Ellen White, The Great Controversy",
      badgeColor: "bg-red-100 text-red-800 border-red-200"
    }
  ];

  // Current active level calculation
  const currentMasteryLevel = [...levels].reverse().find(l => l.unlocked);
  const nextTargetLevel = levels.find(l => !l.unlocked);

  return (
    <div
      id="mastery-path-container"
      className={`w-full min-h-screen ${
        embedded ? "p-0" : "bg-[#FAF9F5] py-6 px-4 md:px-8 max-w-4xl mx-auto"
      }`}
    >
      {/* HEADER SECTION */}
      {!embedded && (
        <div className="flex justify-between items-center border-b border-[#E8E4DA] pb-5 mb-8" id="mastery-path-header">
          <div className="text-left">
            <span className="text-xs uppercase font-mono tracking-widest text-[#C9973A] font-bold block mb-1">
              Scriptural Progress Map
            </span>
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-[#1C2333]" id="mastery-path-title">
              Scribal Mastery Path
            </h1>
            <p className="text-sm text-stone-500 mt-1 max-w-xl">
              "You have read it. But do you know it?" Move from Beginner to Evangelist through verified persistence.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
              aria-label="Close Mastery Path Layout"
              id="close-mastery-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* INTERACTIVE PLAYGROUND METRIC ADJUSTER FOR TESTING */}
      <div className="bg-[#FDFAF5] border border-[#E8E4DA] rounded-2xl p-5 mb-10 text-left" id="mastery-test-adjustments">
        <div className="flex items-center space-x-2 text-[#C9973A] mb-3">
          <Sparkles className="w-4 h-4" />
          <h3 className="font-serif font-bold text-[#1C2333]">Interactive Berean Sandbox</h3>
        </div>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">
          Simulate scripture study milestones to witness requirements updating and levels adapting live on the Scribal Mastery Path:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Study Streak (Days)</label>
            <input
              type="number"
              value={stats.consecutiveDays}
              onChange={(e) => setStats({ ...stats, consecutiveDays: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-white border border-stone-200 px-2 py-1.5 rounded text-[#1A1A1A] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
              aria-label="Sandbox Streak adjust"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Verses in Vault</label>
            <input
              type="number"
              value={stats.versesInVault}
              onChange={(e) => setStats({ ...stats, versesInVault: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-white border border-stone-200 px-2 py-1.5 rounded text-[#1A1A1A] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
              aria-label="Sandbox Verses adjust"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Teach-Its Completed</label>
            <input
              type="number"
              value={stats.teachItCount}
              onChange={(e) => setStats({ ...stats, teachItCount: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-white border border-stone-200 px-2 py-1.5 rounded text-[#1A1A1A] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
              aria-label="Sandbox Teach-Its adjust"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Completed Tracks</label>
            <input
              type="number"
              value={stats.tracksCompleted}
              onChange={(e) => setStats({ ...stats, tracksCompleted: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-white border border-stone-200 px-2 py-1.5 rounded text-[#1A1A1A] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
              aria-label="Sandbox Tracks adjust"
            />
          </div>
        </div>

        {/* CURRENT MILESTONE TRAY */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#E8E4DA]/60 justify-between flex-wrap text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-sans">Current Progress Status:</span>
            <span className="font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider text-[10px]">
              Level {currentMasteryLevel?.level}: {currentMasteryLevel?.name}
            </span>
          </div>

          {nextTargetLevel && (
            <div className="flex items-center space-x-1.5 text-stone-650">
              <span className="text-stone-500">Next Target:</span>
              <span className="font-bold text-[#C9973A]">{nextTargetLevel.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9973A]" />
            </div>
          )}
        </div>
      </div>

      {hudFeedback && (
        <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 mb-8 text-left animate-fade-in elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased" id="elder-stephen-coaching-box">
          <div className="flex items-center space-x-2 text-teal-800 mb-2 font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-sm tracking-[0.65px]">
            <Compass className="w-5 h-5 text-teal-600 animate-spin-slow" />
            <span>Elder Stephen's Progress Counseling</span>
          </div>
          <p className="text-xs text-stone-700 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] leading-relaxed whitespace-pre-wrap select-text">
            {hudFeedback}
          </p>
        </div>
      )}

      {/* CORE PATH MAP LAYOUT */}
      <div className="relative py-12 px-2 max-w-2xl mx-auto" id="mastery-vertical-ladder">
        {/* Connection line background container (SVG based) */}
        <div className="absolute top-0 bottom-0 left-[24px] sm:left-1/2 -ml-px w-0.5 bg-stone-200 z-0">
          <div className="h-full w-full bg-gradient-to-b from-[#C9973A] to-stone-200 transition-all duration-1000" style={{
            height: `${((currentMasteryLevel?.level || 0) / 5) * 100}%`
          }} />
        </div>

        {/* NODES ITERATION */}
        <div className="space-y-16 relative z-10" id="nodes-scroller">
          {levels.map((lvl) => {
            const isUnlocked = lvl.unlocked;
            const isCompleted = currentMasteryLevel && currentMasteryLevel.level > lvl.level;
            const isCurrent = currentMasteryLevel && currentMasteryLevel.level === lvl.level;

            // Compute actual total completed requirements ratio
            const completedReqsCount = lvl.requirements.filter(r => r.completed).length;
            const reqRatio = Math.round((completedReqsCount / lvl.requirements.length) * 100);

            return (
              <div
                key={lvl.level}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-start group"
                id={`lvl-node-${lvl.level}`}
              >
                {/* NODE INDICATOR SPHERE */}
                <div className="flex items-center justify-center shrink-0 mb-4 sm:mb-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-serif text-lg font-bold shadow-md transition-all duration-500 ${
                      isCompleted
                        ? "bg-[#2A9D8F] border-teal-100 text-white fill-current"
                        : isCurrent
                        ? "bg-white border-[#C9973A] text-[#C9973A] scale-110 ring-4 ring-[#C9973A]/10"
                        : isUnlocked
                        ? "bg-stone-50 border-stone-300 text-stone-600"
                        : "bg-stone-100 border-stone-200 text-stone-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 stroke-[3px]" />
                    ) : !isUnlocked ? (
                      <Lock className="w-5.5 h-5.5 text-stone-400" />
                    ) : (
                      lvl.level
                    )}
                  </div>
                </div>

                {/* CONTENT DETAIL PANEL */}
                <div className={`w-full sm:w-[calc(50%-32px)] sm:group-odd:mr-auto sm:group-even:ml-auto group-odd:text-left sm:group-even:text-left ${
                  lvl.level % 2 === 1 ? "sm:text-right" : "sm:text-left"
                }`}>
                  <div
                    className={`p-6 bg-white border rounded-2xl shadow-sm transition-all duration-300 ${
                      isCurrent
                        ? "border-[#C9973A] ring-1 ring-[#C9973A]/20"
                        : "border-stone-200/60"
                    } ${!isUnlocked ? "brightness-95 opacity-80" : ""}`}
                  >
                    {/* LEVEL LABEL BADGE */}
                    <header className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 font-extrabold">
                        LEVEL {lvl.level} • SCRIPTURE STUDY
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full border text-[9.5px] font-bold ${
                        isCompleted
                          ? "bg-teal-50 text-[#21756A] border-teal-200"
                          : isCurrent
                          ? "bg-amber-50 text-[#C9973A] border-gold/40"
                          : isUnlocked
                          ? "bg-stone-50 text-stone-600 border-stone-200"
                          : "bg-stone-100 text-stone-450 border-transparent"
                      }`}>
                        {isCompleted ? "COMPLETED" : isCurrent ? "ACTIVE" : isUnlocked ? "UNLOCKED" : "LOCKED"}
                      </span>
                    </header>

                    {/* TITLE */}
                    <h2 className="font-serif font-extrabold text-2xl text-[#1C2333]">
                      {lvl.name}
                    </h2>

                    <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
                      {lvl.description}
                    </p>

                    {/* UNLOCKED FEATURES BLOCK */}
                    {isUnlocked && (
                      <div className="bg-[#FAF9F5] rounded-xl border border-stone-200/50 p-3 mb-4 text-left">
                        <span className="text-[9px] uppercase font-mono text-[#C9973A] font-bold tracking-wider block mb-1.5">
                          Unlocks New Capabilities
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {lvl.unlocks.map((unl) => (
                            <span
                              key={`unl-${unl}`}
                              className="text-[10.5px] font-sans font-medium text-[#1C2333] bg-white border border-stone-150 px-2 py-0.5 rounded shadow-sm flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3 text-[#2A9D8F]" />
                              <span>{unl}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* REQUIREMENTS VERIFICATION checklist */}
                    <div className="space-y-2 mb-5 text-left border-t border-stone-100 pt-3.5">
                      <span className="text-[9.5px] uppercase font-mono text-stone-400 font-extrabold block">
                        Requirements to Advance
                      </span>

                      <div className="space-y-1.5">
                        {lvl.requirements.map((req, rIdx) => (
                          <div
                            key={`req-${rIdx}`}
                            className="flex justify-between items-center text-xs font-sans text-stone-700"
                          >
                            <span className="flex items-center space-x-1.5 max-w-[80%] leading-tight text-[11.5px]">
                              <span className={req.completed ? "text-emerald-500" : "text-stone-300"}>
                                {req.completed ? "✓" : "○"}
                              </span>
                              <span className={req.completed ? "text-stone-600" : "text-stone-400"}>
                                {req.label}
                              </span>
                            </span>
                            <span className="font-mono text-[10px] bg-stone-100 font-bold px-1.5 py-0.5 rounded shrink-0">
                              {req.current} / {req.target}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Progress strip */}
                      <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden mt-3.5">
                        <div
                          className="h-full bg-[#C9973A] transition-all duration-700"
                          style={{ width: `${reqRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* ASPIRATIONAL EGW WRITING QUOTE ACCENT */}
                    <div className="p-3.5 bg-[#FAF7F0] border-l-2 border-[#C9973A] rounded-r-xl text-left">
                      <p className="font-serif italic text-[11px] leading-relaxed text-[#2C2314] opacity-85">
                        "{lvl.quote}"
                      </p>
                      <span className="text-[9px] font-sans font-medium text-stone-500 block mt-1.5 pr-2 uppercase tracking-wide">
                        — {lvl.quoteAuthor}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MasteryPath;
