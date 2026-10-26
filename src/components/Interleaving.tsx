/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle,
  Compass,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Brain,
  BookmarkCheck,
  Share2,
  GitBranch,
  Layers
} from "lucide-react";
import { Scripture } from "../types";
import { RecallSession } from "./RecallSession";

interface InterleaveTrack {
  id: string;
  title: string;
  count: number;
  badge: string;
  description: string;
  colorClass: string;
  verses: Scripture[];
}

const INTERLEAVE_TRACKS: InterleaveTrack[] = [
  {
    id: "fundamental-beliefs",
    title: "28 Fundamental Beliefs",
    count: 3,
    badge: "Core Theology",
    description: "Inspiration, gospel authority, and covenant definitions.",
    colorClass: "amber",
    verses: [
      {
        id: "fb-1",
        reference: "2 Timothy 3:16",
        text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
        keywords: ["inspiration", "profitable", "doctrine", "righteousness"]
      },
      {
        id: "fb-2",
        reference: "Romans 1:16",
        text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
        keywords: ["ashamed", "gospel", "power", "salvation"]
      }
    ]
  },
  {
    id: "three-angels",
    title: "Three Angels' Messages",
    count: 3,
    badge: "Prophetic Scope",
    description: "The sanctuary judgment alarm, commandments defense, and final restoration.",
    colorClass: "teal",
    verses: [
      {
        id: "ta-1",
        reference: "Revelation 14:6",
        text: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth.",
        keywords: ["angel", "everlasting", "gospel", "preach"]
      },
      {
        id: "ta-3",
        reference: "Revelation 14:12",
        text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        keywords: ["patience", "saints", "commandments", "faith"]
      }
    ]
  },
  {
    id: "sanctuary-doctrine",
    title: "Sanctuary Doctrine",
    count: 3,
    badge: "Antitype Study",
    description: "Tabernacle patterns, Day of Atonement investigative focus.",
    colorClass: "navy",
    verses: [
      {
        id: "sd-1",
        reference: "Daniel 8:14",
        text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        keywords: ["sanctuary", "cleansed", "days"]
      },
      {
        id: "sd-3",
        reference: "Exodus 25:8",
        text: "And let them make me a sanctuary; that I may dwell among them.",
        keywords: ["sanctuary", "dwell", "make", "among"]
      }
    ]
  }
];

// Connection node maps definitions
interface ConnectionLine {
  id: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  theologyLabel: string;
  explanation: string;
}

const INTERLEAVING_CONNECTIONS: ConnectionLine[] = [
  {
    id: "conn-1",
    fromId: "fb-1", // 2 Tim 3:16 (Scripture is inspired)
    toId: "ta-1", // Rev 14:6 (Angle having everlasting gospel)
    fromName: "2 Timothy 3:16",
    toName: "Revelation 14:6",
    theologyLabel: "Inspiration and the Everlasting Proclamation",
    explanation: "The everlasting gospel of Revelation 14 is built directly on the infallible foundation of Scripture. The angel's prophetic flight represents the final restitution of all inspired scripture before the coming harvest."
  },
  {
    id: "conn-2",
    fromId: "fb-2", // Rom 1:16 (Gospel is the power of God)
    toId: "ta-3", // Rev 14:12 (Patience of the saints, faith of Jesus)
    fromName: "Romans 1:16",
    toName: "Revelation 14:12",
    theologyLabel: "The Power of God vs The Faith of Jesus",
    explanation: "The gospel's saving 'power' in Romans 1:16 is fully realized in the final remnant of Revelation 14:12. Perfect obedience is not human legalism, but the natural fulfillment of Christ's active, resident power within us."
  },
  {
    id: "conn-3",
    fromId: "sd-1", // Daniel 8:14 (Sanctuary Cleansed)
    toId: "ta-3", // Rev 14:12 (Faith of Jesus & Commandments)
    fromName: "Daniel 8:14",
    toName: "Revelation 14:12",
    theologyLabel: "The Sanctuary Standard and the Remnant Verdict",
    explanation: "The cleansing of the sanctuary represents the judicial vindication of the Ten Commandments. The 'commandments they keep' in Rev 14:12 mirror the biological standard of the Law verified in the heavenly courtroom of Daniel 8:14."
  }
];

export const Interleaving: React.FC = () => {
  // Collapsible info card state
  const [infoExpanded, setInfoExpanded] = useState<boolean>(true);

  // Active state: 'setup' | 'session' | 'connections'
  const [interleavePhase, setInterleavePhase] = useState<"setup" | "session" | "connections">("setup");

  // Selection state (minimum 2 tracks)
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(["fundamental-beliefs", "three-angels"]);

  // Sequential queue logic
  const [activeSessionVerses, setActiveSessionVerses] = useState<(Scripture & { trackTitle: string })[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);

  // Connection node map highlight links
  const [selectedConnection, setSelectedConnection] = useState<ConnectionLine | null>(null);

  // Toggle selection
  const handleTrackToggle = (id: string) => {
    setSelectedTrackIds(prev => 
      prev.includes(id) 
        ? prev.filter(tid => tid !== id) 
        : [...prev, id]
    );
  };

  // Build sequential mixed lists
  const handleLaunchSession = () => {
    if (selectedTrackIds.length < 2) {
      alert("Please select at least 2 tracks to interleave. Mixing subjects is key to blocking consolidation.");
      return;
    }

    // Grab verses, shuffle them alternating
    const gatheredVerses: (Scripture & { trackTitle: string })[] = [];
    const sourceTracks = INTERLEAVE_TRACKS.filter(t => selectedTrackIds.includes(t.id));
    
    // Pick first verse of each selected track, then second verse, etc. This is perfect interleaving!
    const maxVerses = 2; // Keep study sessions compact and highly dynamic
    for (let i = 0; i < maxVerses; i++) {
      sourceTracks.forEach(track => {
        if (track.verses[i]) {
          gatheredVerses.push({
            ...track.verses[i],
            trackTitle: track.title
          });
        }
      });
    }

    setActiveSessionVerses(gatheredVerses);
    setCurrentVerseIndex(0);
    setInterleavePhase("session");
  };

  const handleCompleteActiveVerse = (score: number) => {
    // Advance queue index
    if (currentVerseIndex < activeSessionVerses.length - 1) {
      setCurrentVerseIndex(prev => prev + 1);
    } else {
      // Completed all mixed items! Move to Connection map phase.
      setInterleavePhase("connections");
      // Set the first connection as active default highlight
      setSelectedConnection(INTERLEAVING_CONNECTIONS[0]);
    }
  };

  const activeVerse = activeSessionVerses[currentVerseIndex];

  return (
    <div className="w-full space-y-6 text-left max-w-5xl mx-auto py-1" id="interleaving-workspace">
      
      {/* 2. TOP COLLAPSIBLE INFO CARD */}
      <div className="bg-white border border-[#E8E4DA] rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between text-left text-[#1C2333] hover:bg-stone-50 cursor-pointer focus:outline-none"
          id="toggle-collapsible-interleaving-card"
        >
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-[#C9973A] animate-pulse" />
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block">Consolidation Science</span>
              <h3 className="font-serif text-base font-bold text-navy">Interleaved Study: Why mix disciplines?</h3>
            </div>
          </div>
          {infoExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
        </button>

        <AnimatePresence>
          {infoExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-[#E8E4DA]/60"
            >
              <div className="p-5 bg-[#FDFAF5] text-xs text-stone-600 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <p>
                    <strong>"Interleaving mixes content from different tracks during a single session. It feels harder — that's why it works."</strong>
                  </p>
                  <p>
                    Most study habits focus on <em>block practice</em>—focusing on one topic (e.g. Daniel) repeatedly before rotating. This creates a fake feeling of mastership ('fluency illusion').
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    By interleaving, your brain is forced to reload context continuously. Shifting from prophecy (Revelation) to doctrine (Hebrews / Sanctuary) builds conceptual anchors.
                  </p>
                  <p className="p-2 bg-[#FAF7F0] border-l-2 border-[#C0974A] rounded text-[#A67D2E] font-medium italic">
                    🕊️ The Bible is a unified tapestry. Interleaving allows you to spot patterns where different disciplines cross paths under the Great Controversy interpretive lens.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CORE PHASES CONTROL VIEW */}
      <AnimatePresence mode="wait">

        {/* SETUP PHASE: SESSION BUILDER */}
        {interleavePhase === "setup" && (
          <motion.div
            key="interleave-setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white border border-[#E8E4DA] rounded-2xl shadow-xs text-left">
              <h4 className="font-serif text-lg font-bold text-[#1C2333] mb-1">
                Interleaved Session Builder
              </h4>
              <p className="text-xs text-stone-500 mb-6">
                Select minimum 2 active tracks to combine. We will generate a smart, shuffled curriculum of back-to-back Active Recall challenges.
              </p>

              {/* CARD COMPONENT SELECTION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="interleaved-picker-row">
                {INTERLEAVE_TRACKS.map((track) => {
                  const isSelected = selectedTrackIds.includes(track.id);
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTrackToggle(track.id)}
                      className={`p-5 rounded-xl border text-left flex flex-col justify-between min-h-[160px] transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#C9973A] bg-[#C9973A]/5 shadow-sm"
                          : "border-[#E8E4DA] bg-white hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 font-bold text-stone-500">
                          {track.badge}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#C9973A] bg-[#C9973A]" : "border-stone-300"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-serif font-extrabold text-[#111111] text-base">
                          {track.title}
                        </h5>
                        <p className="text-xs text-stone-450 leading-relaxed mt-1">
                          {track.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ACTION TRIGGER */}
              <div className="mt-8 pt-4 border-t border-[#E8E4DA] flex justify-end">
                <button
                  onClick={handleLaunchSession}
                  disabled={selectedTrackIds.length < 2}
                  className="px-8 py-3.5 bg-[#1C2333] hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer flex items-center space-x-2"
                  id="start-interleaving-btn"
                >
                  <Play className="w-4 h-4 text-[#C9973A]" />
                  <span>Launch Mixed Recall ({selectedTrackIds.length} Combined)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACTIVE SESSION PHASE */}
        {interleavePhase === "session" && activeVerse && (
          <motion.div
            key="interleave-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Context switching warning banner */}
            <div className="p-4 bg-[#1C2333] text-white rounded-xl shadow border-l-4 border-dashed border-[#C9973A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-left">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#C9973A] font-extrabold">Active Mixed Loop</span>
                <h4 className="font-serif text-sm font-bold text-white mt-0.5">
                  Shifting Context! Target: {activeVerse.reference}
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-stone-800 px-3 py-1 rounded-full text-stone-300 font-bold border border-stone-700 uppercase">
                From: {activeVerse.trackTitle}
              </span>
            </div>

            {/* Embedded Active Recall frame */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4DA]">
              <RecallSession
                scripture={activeVerse}
                isEmbedded={true}
                initialPhase="recall" // SKIP PRE-READING STEPS TO KEEP TESTING INTACT
                onBack={() => setInterleavePhase("setup")}
                onComplete={(score) => handleCompleteActiveVerse(score)}
              />
            </div>
          </motion.div>
        )}

        {/* CONNECTION MAPS INSPIRATION PHASE */}
        {interleavePhase === "connections" && (
          <motion.div
            key="interleave-connections"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white border border-[#E8E4DA] rounded-2xl shadow-xs text-left">
              <header className="space-y-1.5 mb-6 text-left border-b border-stone-100 pb-4">
                <div className="flex items-center space-x-2 text-[#C9973A]">
                  <Compass className="w-5 h-5 animate-spin" />
                  <span className="text-[10px] font-mono uppercase bg-[#C9973A]/10 px-2 rounded-full font-bold">
                    The Great Controversy Synapse Map
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1C2333]">
                  Sovereign Connections Located
                </h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-xl">
                  Scripture is not disjointed. By studying these tracks together, your cognitive network mapped conceptual overlap synapses. Click lines on graph below to retrieve theology explanation.
                </p>
              </header>

              {/* SPLIT SCREEN MAP AND DETAIL CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* INTERACTIVE GRAPH CANVAS WRAPPER (Col 3fr) */}
                <div className="lg:col-span-3 border border-[#E8E4DA] rounded-xl bg-[#FAF9F6] p-4 relative flex flex-col justify-center min-h-[340px]">
                  
                  <span className="absolute top-4 left-4 text-[9px] font-mono uppercase text-stone-400 font-extrabold tracking-widest bg-white px-2.5 py-0.5 rounded border border-stone-150 shadow-sm z-10 block">
                    Interactive SVG synapse nodes
                  </span>

                  {/* SVG Map of Bible verses connected around Christ Controversy center */}
                  <div className="w-full h-80 flex items-center justify-center select-none" id="synapse-network">
                    <svg className="w-full h-full max-w-[400px] max-h-[300px]" viewBox="0 0 400 300">
                      
                      {/* CONNECTIONS PATHS BACKGROUND DRAWS */}
                      {INTERLEAVING_CONNECTIONS.map((c) => {
                        const isChosen = selectedConnection?.id === c.id;
                        
                        // Pick path coordinates based on from-to references
                        // 2 Tim 3:16 (L), Rom 1:16 (R), Daniel 8:14 (B), Rev 14:12 (T)
                        let x1 = 100, y1 = 90; // Default
                        let x2 = 300, y2 = 90;

                        if (c.id === "conn-1") { // fb-1 (L) -> ta-1 (R)
                          x1 = 90; y1 = 150;
                          x2 = 310; y2 = 80;
                        } else if (c.id === "conn-2") { // fb-2 (R) -> ta-3 (T)
                          x1 = 310; y1 = 220;
                          x2 = 200; y2 = 60;
                        } else if (c.id === "conn-3") { // sd-1 (B) -> ta-3 (T)
                          x1 = 200; y1 = 240;
                          x2 = 200; y2 = 60;
                        }

                        return (
                          <g key={c.id}>
                            <motion.line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={isChosen ? "#C9973A" : "#D1CAB7"}
                              strokeWidth={isChosen ? 3 : 1.5}
                              strokeDasharray={isChosen ? "0" : "5,5"}
                              animate={isChosen ? { strokeDashoffset: [0, -10] } : {}}
                              className="cursor-pointer transition-all"
                              onClick={() => setSelectedConnection(c)}
                            />
                            {/* Click target helper tube */}
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="transparent"
                              strokeWidth="15"
                              className="cursor-pointer"
                              onClick={() => setSelectedConnection(c)}
                            />
                          </g>
                        );
                      })}

                      {/* CENTRAL MASS NODE: THE GREAT CONTROVERSY */}
                      <circle cx="200" cy="150" r="16" fill="#1C2333" stroke="#C9973A" strokeWidth="2" className="animate-pulse" />
                      <text x="200" y="154" fill="#C9973A" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="Playfair Display">SDA</text>

                      {/* VERSE 1: 2 Tim 3:16 (L-Center) */}
                      <g className="cursor-pointer" onClick={() => setSelectedConnection(INTERLEAVING_CONNECTIONS[0])}>
                        <circle cx="90" cy="150" r="22" fill="white" stroke="#FAF7F0" strokeWidth="3" className="shadow-xs" />
                        <circle cx="90" cy="150" r="18" fill="#1C2333" stroke="#D1CAB7" strokeWidth="1" />
                        <text x="90" y="153" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="Inter">2 Tim 3</text>
                      </g>

                      {/* VERSE 2: Rev 14:12 (Top) */}
                      <g className="cursor-pointer" onClick={() => setSelectedConnection(INTERLEAVING_CONNECTIONS[1])}>
                        <circle cx="200" cy="60" r="22" fill="white" stroke="#FAF7F0" strokeWidth="3" />
                        <circle cx="200" cy="60" r="18" fill="#2A9D8F" stroke="#D1CAB7" strokeWidth="1" />
                        <text x="200" y="63" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="Inter">Rev 14:12</text>
                      </g>

                      {/* VERSE 3: Rev 14:6 (R-Top) */}
                      <g className="cursor-pointer" onClick={() => setSelectedConnection(INTERLEAVING_CONNECTIONS[0])}>
                        <circle cx="310" cy="80" r="22" fill="white" stroke="#FAF7F0" strokeWidth="3" />
                        <circle cx="310" cy="80" r="18" fill="#C9973A" stroke="#D1CAB7" strokeWidth="1" />
                        <text x="310" y="83" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="Inter">Rev 14:6</text>
                      </g>

                      {/* VERSE 4: Rom 1:16 (R-Bottom) */}
                      <g className="cursor-pointer" onClick={() => setSelectedConnection(INTERLEAVING_CONNECTIONS[1])}>
                        <circle cx="310" cy="220" r="22" fill="white" stroke="#FAF7F0" strokeWidth="3" />
                        <circle cx="310" cy="220" r="18" fill="#1C2333" stroke="#D1CAB7" strokeWidth="1" />
                        <text x="310" y="223" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="Inter">Rom 1:16</text>
                      </g>

                      {/* VERSE 5: Daniel 8:14 (Bottom) */}
                      <g className="cursor-pointer" onClick={() => setSelectedConnection(INTERLEAVING_CONNECTIONS[2])}>
                        <circle cx="200" cy="240" r="22" fill="white" stroke="#FAF7F0" strokeWidth="3" />
                        <circle cx="200" cy="240" r="18" fill="#2A9D8F" stroke="#D1CAB7" strokeWidth="1" />
                        <text x="200" y="243" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="Inter">Dan 8:14</text>
                      </g>

                    </svg>
                  </div>
                </div>

                {/* ACTIVE SUMMARY EXPLANATION COLUMN (Col 2fr) */}
                <div className="lg:col-span-2 flex flex-col justify-between" id="active-summary-col">
                  <div className="space-y-4 text-left">
                    <span className="text-[10px] font-mono uppercase bg-[#C9973A]/10 text-[#C9973A] px-2 py-0.5 rounded-full font-bold">
                      Theological Synapse Insight
                    </span>
                    
                    {selectedConnection ? (
                      <motion.div
                        key={selectedConnection.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3.5"
                      >
                        <div>
                          <h5 className="font-serif font-extrabold text-[#111111] text-base leading-snug">
                            {selectedConnection.theologyLabel}
                          </h5>
                          <span className="text-[10.5px] font-mono text-stone-400 block mt-0.5">
                            Linking: {selectedConnection.fromName} ⚭ {selectedConnection.toName}
                          </span>
                        </div>

                        <p className="text-xs text-stone-605 leading-relaxed bg-[#FAF7F0] p-4.5 rounded-xl border border-[#E8E4DA] italic">
                          "{selectedConnection.explanation}"
                        </p>
                      </motion.div>
                    ) : (
                      <p className="text-xs text-stone-400 italic">
                        Click on any connection line or satellite node in the network to locate the deep covenant linkages explored in this study session.
                      </p>
                    )}
                  </div>

                  {/* Restart action triggers */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => setInterleavePhase("setup")}
                      className="w-full py-2.5 bg-[#FAF7F0] hover:bg-[#F0EDE4] border border-[#D1CAB7] text-[#1C2333] text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Configure New Session</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default Interleaving;
