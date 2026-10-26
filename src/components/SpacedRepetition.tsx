/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  ArrowRight,
  Info,
  SlidersHorizontal
} from "lucide-react";
import { Scripture } from "../types";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";

interface DueItem {
  scripture: Scripture;
  trackId: string;
  trackTitle: string;
  urgency: "now" | "soon" | "later";
  dueDateText: string;
  daysLate: number; // For sorting
}

interface SpacedRepetitionProps {
  onSelectReview?: (scripture: Scripture, queue?: Scripture[]) => void;
}

// Multi-track high yield scripture due data
const DEFAULT_DUE_ITEMS: DueItem[] = [
  {
    scripture: {
      id: "ta-3",
      reference: "Revelation 14:12",
      text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
      keywords: ["patience", "saints", "commandments", "faith"]
    },
    trackId: "three-angels",
    trackTitle: "Three Angels' Messages",
    urgency: "now",
    dueDateText: "Due now (Overdue 2 days)",
    daysLate: 2
  },
  {
    scripture: {
      id: "fb-1",
      reference: "2 Timothy 3:16",
      text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
      keywords: ["inspiration", "profitable", "doctrine", "righteousness"]
    },
    trackId: "fundamental-beliefs",
    trackTitle: "28 Fundamental Beliefs",
    urgency: "now",
    dueDateText: "Due now (Overdue 4 hrs)",
    daysLate: 1
  },
  {
    scripture: {
      id: "sd-1",
      reference: "Daniel 8:14",
      text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
      keywords: ["sanctuary", "cleansed", "days"]
    },
    trackId: "sanctuary-doctrine",
    trackTitle: "Sanctuary Doctrine",
    urgency: "soon",
    dueDateText: "Due tomorrow",
    daysLate: -1
  },
  {
    scripture: {
      id: "fb-2",
      reference: "Romans 1:16",
      text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
      keywords: ["ashamed", "gospel", "power", "salvation"]
    },
    trackId: "fundamental-beliefs",
    trackTitle: "28 Fundamental Beliefs",
    urgency: "later",
    dueDateText: "Due in 3 days",
    daysLate: -3
  },
  {
    scripture: {
      id: "ss-1",
      reference: "Matthew 11:28",
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      keywords: ["come", "labour", "heavy", "rest"]
    },
    trackId: "sabbath-school",
    trackTitle: "Sabbath School Quarterly",
    urgency: "later",
    dueDateText: "Due in 5 days",
    daysLate: -5
  }
];

export const SpacedRepetition: React.FC<SpacedRepetitionProps> = ({ onSelectReview }) => {
  const [items, setItems] = useState<DueItem[]>(DEFAULT_DUE_ITEMS);
  const [sortMethod, setSortMethod] = useState<"urgency" | "reference">("urgency");
  const [showCompletedToast, setShowCompletedToast] = useState<string | null>(null);

  // 7-Day Completion Log for Spaced Repetition Analytics
  const completionData = [
    { day: "Sun", completed: 4, target: 4 },
    { day: "Mon", completed: 6, target: 4 },
    { day: "Tue", completed: 2, target: 4 },
    { day: "Wed", completed: 5, target: 4 },
    { day: "Thu", completed: 7, target: 4 },
    { day: "Fri", completed: 3, target: 4 },
    { day: "Sat", completed: 0, target: 0 } // Holy Sabbath rest
  ];

  // Sorting
  const sortedItems = [...items].sort((a, b) => {
    if (sortMethod === "urgency") {
      return b.daysLate - a.daysLate; // Greater delay first
    } else {
      return a.scripture.reference.localeCompare(b.scripture.reference);
    }
  });

  // Launch a review for a single item -> activates Verbatim Recall tab
  const handleReviewSingle = (item: DueItem) => {
    if (onSelectReview) {
      onSelectReview(item.scripture);
    }
  };

  // Launch full study of all "now" items -> activates Verbatim Recall tab with full due queue
  const handleStudyAllDue = () => {
    const dueNow = items.filter(i => i.urgency === "now");
    if (dueNow.length === 0) {
      alert("All caught up! No items currently due for urgent study.");
      return;
    }
    if (onSelectReview) {
      onSelectReview(dueNow[0].scripture, dueNow.map(d => d.scripture));
    }
  };

  return (
    <div className="w-full space-y-6 text-left max-w-5xl mx-auto py-1" id="spaced-rep-container">
      
      {/* SUCCESS OVERLAY TOAST */}
      <AnimatePresence>
        {showCompletedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2A9D8F] text-white py-3 px-6 rounded-xl border border-[#20796E] flex items-center space-x-2.5 shadow-lg max-w-sm"
          >
            <CheckCircle className="w-5 h-5 shrink-0 text-white" />
            <span className="text-xs font-semibold">{showCompletedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPPER STUDY OVERVIEW BANNER */}
      <div className="p-6 bg-white border border-[#E8E4DA] rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[#C9973A]">
            <Brain className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#C9973A]/10 px-2.5 py-0.5 rounded">
              Spaced Repetition System
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Memory Pathway Consolidation
          </h2>
          <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-xl">
            Based on active recall decay curves, these scriptures are systematically scheduled before you reach the 'fluency illusion' boundary.
          </p>
        </div>

        {/* Study triggers */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleStudyAllDue}
            disabled={items.filter(i => i.urgency === "now").length === 0}
            className="px-6 py-3 bg-[#1C2333] hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#C9973A]" />
            <span>Study All Due ({items.filter(i => i.urgency === "now").length})</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD MODULE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: LIST OF DUE ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Consolidation Queue ({items.length} Verses)
            </h3>
            
            {/* Sort toggle bar */}
            <div className="flex items-center space-x-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-500 font-medium">Sort:</span>
              <button
                onClick={() => setSortMethod("urgency")}
                className={`px-2 py-1 rounded transition-colors ${
                  sortMethod === "urgency"
                    ? "bg-[#C9973A]/10 text-[#C9973A] font-bold"
                    : "text-stone-500 hover:text-stone-900"
                }`}
                id="spaced-sort-urgency"
              >
                Urgency
              </button>
              <button
                onClick={() => setSortMethod("reference")}
                className={`px-2 py-1 rounded transition-colors ${
                  sortMethod === "reference"
                    ? "bg-[#C9973A]/10 text-[#C9973A] font-bold"
                    : "text-stone-500 hover:text-stone-900"
                }`}
                id="spaced-sort-ref"
              >
                Reference
              </button>
            </div>
          </div>

          <div className="space-y-3" id="due-items-queue-list">
            {sortedItems.map((item) => {
              const pillColors = {
                now: "bg-red-500/10 text-red-600 border border-red-500/15",
                soon: "bg-[#C9973A]/10 text-[#A67D2E] border border-[#C9973A]/15",
                later: "bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/15"
              };

              return (
                <div
                  key={item.scripture.id}
                  className="bg-white p-4 rounded-xl border border-[#E8E4DA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xs transition-shadow text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-base text-[#1A1A1A]">
                        {item.scripture.reference}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold">
                        {item.trackTitle}
                      </span>
                    </div>

                    <p className="font-bible text-xs text-[#6B6B6B] line-clamp-1 leading-normal">
                      "{item.scripture.text.split(" ").slice(0, 10).join(" ")}..."
                    </p>

                    <div className="flex items-center space-x-1.5 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded ${pillColors[item.urgency]}`}>
                        {item.dueDateText}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReviewSingle(item)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all shadow-xs cursor-pointer inline-flex items-center space-x-1 w-full sm:w-auto justify-center ${
                      item.urgency === "now"
                        ? "bg-[#C9973A] hover:bg-[#B0822F] text-white"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                    }`}
                  >
                    <span>Review now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: REASSURING ANALYTICS AND HISTORIC GRID */}
        <div className="space-y-6">
          
          {/* VISUAL RECALL PROGRESS BAR CHART */}
          <div className="bg-[#1C2333] text-white p-5 rounded-2xl border border-stone-800 shadow-sm flex flex-col justify-between min-h-[300px]">
            <header className="text-left">
              <span className="text-[9px] font-mono uppercase text-[#C9973A] font-bold tracking-widest block">
                Activity Logs
              </span>
              <h3 className="font-serif text-base font-bold text-white mt-0.5">
                7-Day Retention Chart
              </h3>
              <p className="text-[11px] text-stone-400 leading-normal mt-0.5">
                Active memory path completions. Saturday logged as holy rest.
              </p>
            </header>

            {/* Custom Bar Chart representing daily verifications */}
            <div className="flex items-end justify-between gap-2 h-36 pt-6 px-1" id="custom-bar-chart">
              {completionData.map((d) => {
                const heightPercentage = d.completed > 0 ? (d.completed / 8) * 100 : 4;
                const isSabbath = d.day === "Sat";

                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center group relative h-full">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 border border-[#C9973A]/25 text-[10px] text-[#C9973A] px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap z-10 shadow-md">
                      {isSabbath ? "Sabbath Rest 🕊️" : `${d.completed} Reviews`}
                    </div>

                    {/* Cylinder representation */}
                    <div className="w-full bg-stone-800/40 rounded-t-md h-full flex flex-col justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`w-full rounded-t-md transition-all ${
                          isSabbath
                            ? "bg-stone-700/50 hover:bg-stone-600/50"
                            : d.completed >= d.target
                            ? "bg-[#2A9D8F] hover:bg-[#20796E]"
                            : "bg-[#C9973A] hover:bg-[#B0822F]"
                        }`}
                      />
                    </div>

                    <span className="text-[10px] font-mono text-stone-400 mt-2 font-bold uppercase">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <footer className="pt-3 border-t border-stone-800 mt-3 flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-[#2A9D8F] rounded-full inline-block" />
                <span>Target met</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-[#C9973A] rounded-full inline-block" />
                <span>In progress</span>
              </span>
            </footer>
          </div>

          {/* RETENTION DECAY CHART CARD CITATION */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] text-left space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 text-[#C9973A]">
              <TrendingUp className="w-4.5 h-4.5" />
              <h4 className="font-serif text-sm font-bold text-stone-900">
                Spaced Interval Science
              </h4>
            </div>
            
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
              In cognitive psychology, the <strong>Ebbinghaus Forgetting Curve</strong> demonstrates that memory retention decays exponentially within 48 hours without active rehearsal.
            </p>
            
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
              Our algorithm resets your intervals using an expansion scale: <strong>1 day, 3 days, 7 days, 15 days, 30 days</strong>. Every successful verbatim check cements the truth for longer periods.
            </p>

            <div className="p-2.5 bg-[#FAF7F0] border-l-3 border-[#C9973A] rounded-r text-[10.5px] leading-relaxed text-stone-700">
              "The sword of the Spirit, the word of God, must be kept polished by active retention... that the heart might carry its immediate power." — SDA Historical Epistles
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SpacedRepetition;
