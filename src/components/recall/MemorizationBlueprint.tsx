/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Compass,
  CheckCircle2,
  BookmarkCheck,
  Brain,
  Sparkles,
  Flame,
  Clock,
  Volume2,
  PenTool,
  Share2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface MemorizationBlueprintProps {
  onLaunchRecall?: () => void;
}

interface HabitItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  cadence: string;
  completed: boolean;
}

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: "habit-1",
    title: "Morning 5-Minute Primer",
    description: "Recite your target memory verse immediately upon waking when neuro-plasticity is peak.",
    icon: Clock,
    cadence: "Daily Morning",
    completed: false
  },
  {
    id: "habit-2",
    title: "The 3-R Sensory Encoding Loop",
    description: "Read aloud 3 times, recite from memory 3 times, and handwrite the passage once.",
    icon: PenTool,
    cadence: "Daily Midday",
    completed: false
  },
  {
    id: "habit-3",
    title: "Sanctuary Loci Architecture",
    description: "Mentally anchor the scripture to a sanctuary furniture piece (Altar, Laver, Candlestick, Ark).",
    icon: Layers,
    cadence: "Study Session",
    completed: false
  },
  {
    id: "habit-4",
    title: "Spaced Retention Stacking",
    description: "Review verses due on Day 1, 3, 7, 14, and 30 using the STBA Spaced Repetition engine.",
    icon: Calendar,
    cadence: "Interval Schedule",
    completed: false
  },
  {
    id: "habit-5",
    title: "The Disciple Teaching Anchor",
    description: "Teach or share the verse with a friend, family member, or study partner within 24 hours.",
    icon: Share2,
    cadence: "Daily Outreach",
    completed: false
  }
];

export const MemorizationBlueprint: React.FC<MemorizationBlueprintProps> = ({
  onLaunchRecall
}) => {
  const { showConfetti } = useApp();

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem("stba_memory_habits");
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_HABITS.map(dh => {
          const match = parsed.find((p: any) => p.id === dh.id);
          return match ? { ...dh, completed: match.completed } : dh;
        });
      }
    } catch (e) {}
    return DEFAULT_HABITS;
  });

  const [activePillar, setActivePillar] = useState<number>(0);

  const completedCount = habits.filter(h => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  const toggleHabit = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const next = !h.completed;
        return { ...h, completed: next };
      }
      return h;
    });
    setHabits(updated);
    try {
      localStorage.setItem("stba_memory_habits", JSON.stringify(updated));
    } catch (e) {}

    if (updated.filter(h => h.completed).length === habits.length) {
      showConfetti("recall");
    }
  };

  const pillars = [
    {
      title: "1. The Morning Neuro-Primer",
      subtitle: "Capitalizing on Alpha Wave Receptivity",
      text: "Research in cognitive science proves that retrieval practice within 15 minutes of waking creates durable synaptic potentiation. Dedicate your first 5 conscious minutes to reciting your core target verse before opening electronic notifications.",
      scripture: "“I remember thee upon my bed, and meditate on thee in the night watches.” (Psalm 63:6)",
      action: "Set your physical Bible or memory card beside your nightstand tonight."
    },
    {
      title: "2. The 3-R Sensory Encoding Loop",
      subtitle: "Tri-Modal Synaptic Encoding",
      text: "Never rely on passive visual scanning (the fluency illusion). Engage 3 distinct sensory modalities: (1) Auditory: Read aloud 3 times with vocal cadence. (2) Retrieval: Recite with closed eyes 3 times. (3) Kinesthetic: Handwrite the verse once on a card.",
      scripture: "“Write them upon the table of thine heart.” (Proverbs 3:3)",
      action: "Keep a small pocket notebook dedicated purely to handwritten memory verses."
    },
    {
      title: "3. The Sanctuary Loci Technique",
      subtitle: "Associative Spatial Memory Architecture",
      text: "The ancient Method of Loci connects abstract words to familiar physical structures. In STBA, use the Heavenly Sanctuary: place Salvation verses at the Altar, Sanctification at the Laver, Prophetic Light at the Golden Candlestick, and the Law at the Ark of the Covenant.",
      scripture: "“Thy way, O God, is in the sanctuary: who is so great a God as our God?” (Psalm 77:13)",
      action: "Mentally visualize placing your current verse inside its corresponding sanctuary station."
    },
    {
      title: "4. Spaced Interval Stacking",
      subtitle: "Halting the Ebbinghaus Forgetting Curve",
      text: "Memory decays exponentially unless tested at strategic intervals: Day 1 (immediate), Day 3 (stabilization), Day 7 (consolidation), Day 14 (crystallization), and Day 30 (permanent semantic storage). STBA automates this queue in the Spaced Repetition engine.",
      scripture: "“Bind them continually upon thine heart, and tie them about thy neck.” (Proverbs 6:21)",
      action: "Check your Due Reviews tab daily to clear items before the forgetting curve takes effect."
    },
    {
      title: "5. The Disciple's Teaching Anchor",
      subtitle: "The Protege Effect & Living Evangelism",
      text: "You truly master only that which you teach. When you explain a memorized verse and its doctrinal implications to a child, peer, or seeker, your brain restructures the information for maximum explanatory clarity.",
      scripture: "“And the things that thou hast heard of me... the same commit thou to faithful men, who shall be able to teach others also.” (2 Timothy 2:2)",
      action: "Share one passage you memorized today in a conversation or text message."
    }
  ];

  return (
    <div className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-6" id="memorization-blueprint-root">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#DFC57B]">
            <Compass className="w-5 h-5 text-[#DFC57B] drop-shadow-[0_0_6px_rgba(223,197,123,0.4)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              BIBLE MEMORIZATION APP BLUEPRINT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            Habit Architecture & Cognitive Scripture Strategy
          </h2>
          <p className="text-xs text-stone-400">
            Build unshakeable scripture retention habits using evidence-based cognitive psychology and biblical discipleship principles.
          </p>
        </div>

        {/* PROGRESS PILL */}
        <div className="flex items-center gap-3 bg-[#06162c] border border-[#DFC57B]/60 px-4 py-2 rounded-xl">
          <BookmarkCheck className="w-5 h-5 text-[#DFC57B]" />
          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              TODAY'S HABIT GOALS
            </span>
            <span className="text-xs font-bold text-white">
              {completedCount} of {habits.length} Complete ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE HABIT TRACKER CHECKLIST */}
      <div className="bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#DFC57B] font-bold">
              DAILY MEMORY HABIT BUILDER
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              Check off your daily scripture retention rituals
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {completedCount}/{habits.length} Active
          </span>
        </div>

        {/* HABIT CHECKLIST CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((habit) => {
            const Icon = habit.icon;
            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  habit.completed
                    ? "bg-[#06162c] border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.2)]"
                    : "bg-[#161D2B] border-stone-800 hover:border-stone-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    habit.completed
                      ? "bg-[#DFC57B] text-[#06162c]"
                      : "border border-stone-700 bg-stone-900"
                  }`}
                >
                  {habit.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${habit.completed ? "text-[#DFC57B]" : "text-white"}`}>
                      {habit.title}
                    </h4>
                    <span className="text-[9px] font-mono text-stone-500 uppercase">
                      {habit.cadence}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    {habit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-PILLAR ARCHITECTURE EXPLORER */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
          EXPLORE THE 5-PILLAR MEMORIZATION METHODOLOGY:
        </span>

        {/* ROUND GOLD-TRIMMED BUTTONS FOR THE PILLARS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {pillars.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePillar(idx)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all border cursor-pointer ${
                activePillar === idx
                  ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                  : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
              }`}
            >
              <span>Pillar {idx + 1}</span>
            </button>
          ))}
        </div>

        {/* ACTIVE PILLAR DISPLAY CARD */}
        <motion.div
          key={activePillar}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-white">
                {pillars[activePillar].title}
              </h3>
              <span className="text-xs text-[#DFC57B] font-mono">
                {pillars[activePillar].subtitle}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            {pillars[activePillar].text}
          </p>

          <div className="p-3.5 bg-[#161D2B] border border-stone-800 rounded-lg">
            <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block font-bold mb-1">
              BIBLICAL FOUNDATION:
            </span>
            <p className="text-xs text-stone-200 font-serif italic">
              {pillars[activePillar].scripture}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-stone-400">
              <strong className="text-white">Daily Action Step:</strong> {pillars[activePillar].action}
            </div>

            {onLaunchRecall && (
              <button
                onClick={onLaunchRecall}
                className="px-4 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Launch Recall Gym</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
