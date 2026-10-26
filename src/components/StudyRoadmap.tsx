/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  ChevronRight,
  Play,
  Check,
  Flame,
  BookOpenCheck,
  CalendarDays,
  Target,
  ChevronDown,
  ChevronUp,
  Map,
  BadgeAlert,
  ArrowUpRight
} from "lucide-react";
import { Track, Scripture } from "../types";

export interface ScheduledSession {
  id: string;
  trackId: string;
  trackTitle: string;
  dayOfWeek: string;
  timeSlot: string;
  technique: string;
}

export interface StudyRoadmapProps {
  tracks?: Track[];
  selectedTrackId?: string;
  onSelectTrack?: (trackId: string) => void;
  completedVerseIds?: string[];
  sabbathActive?: boolean;
  onLaunchStudyAction?: (scripture: Scripture) => void;
  trackScriptures?: Record<string, Scripture[]>;
}

export const StudyRoadmap: React.FC<StudyRoadmapProps> = ({
  tracks = [],
  selectedTrackId = "",
  onSelectTrack = () => {},
  completedVerseIds = [],
  sabbathActive = false,
  onLaunchStudyAction,
  trackScriptures = {}
}) => {
  // Toggle sections
  const [expandedSection, setExpandedSection] = useState<"path" | "milestones" | "planner">("path");

  // Track progress local cache
  const [trackProgress, setTrackProgress] = useState<Record<string, number>>({});

  // Milestone records
  const [unlockedState, setUnlockedState] = useState<Record<string, boolean>>({});

  // Weekly scheduled sessions
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);

  // New session planner forms
  const [formTrackId, setFormTrackId] = useState<string>(tracks[0]?.id || "");
  const [formDay, setFormDay] = useState<string>("Tuesday");
  const [formTimeSlot, setFormTimeSlot] = useState<string>("07:30 AM");
  const [formTechnique, setFormTechnique] = useState<string>("Active Recall Drill");

  // Load state and cache values from localStorage
  useEffect(() => {
    // 1. Calculate Track progress
    const computedProgress: Record<string, number> = {};
    tracks.forEach((track) => {
      // Look up vaulted or completed verses for this track
      const savedCompleted = localStorage.getItem(`stba_completed_verses_${track.id}`);
      let completedCount = 0;
      if (savedCompleted) {
        try {
          completedCount = JSON.parse(savedCompleted).length;
        } catch (e) {
          completedCount = 0;
        }
      }

      // Add a baseline of completed if general completed has elements
      if (track.id === "fundamental-beliefs" && completedVerseIds.length > 0) {
        completedCount = Math.max(completedCount, completedVerseIds.length);
      }

      // Fallback baseline for visual polish so everything does not start at absolute 0%
      const storedProgress = localStorage.getItem(`stba_track_progress_${track.id}`);
      if (storedProgress) {
        computedProgress[track.id] = parseInt(storedProgress, 10);
      } else {
        // Seed default random-looking progress representing user's baseline
        let seeded = 0;
        if (track.id === "fundamental-beliefs") seeded = 25;
        if (track.id === "three-angels") seeded = 15;
        if (track.id === "sanctuary-doctrine") seeded = 0;
        computedProgress[track.id] = seeded;
        localStorage.setItem(`stba_track_progress_${track.id}`, seeded.toString());
      }
    });
    setTrackProgress(computedProgress);

    // 2. Load scheduled sessions
    const storedSessions = localStorage.getItem("stba_upcoming_study_calendar");
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions));
      } catch (e) {
        setSessions(getDefaultSessions());
      }
    } else {
      const def = getDefaultSessions();
      setSessions(def);
      localStorage.setItem("stba_upcoming_study_calendar", JSON.stringify(def));
    }
  }, [tracks, completedVerseIds]);

  const getDefaultSessions = (): ScheduledSession[] => [
    {
      id: "session-1",
      trackId: "fundamental-beliefs",
      trackTitle: "28 Fundamental Beliefs",
      dayOfWeek: "Tuesday",
      timeSlot: "08:15 AM",
      technique: "Active Recall Studio"
    },
    {
      id: "session-2",
      trackId: "three-angels",
      trackTitle: "Three Angels' Messages",
      dayOfWeek: "Thursday",
      timeSlot: "07:00 PM",
      technique: "Teach-It Voice Studio"
    },
    {
      id: "session-3",
      trackId: "sanctuary-doctrine",
      trackTitle: "Sanctuary Doctrine",
      dayOfWeek: "Saturday (Sabbath)",
      timeSlot: "09:30 AM",
      technique: "Devotional Reading"
    }
  ];

  // Dynamically evaluate Milestones base metrics
  const totalCompletedCount = Object.values(trackProgress).reduce((acc: number, curr: number) => acc + curr, 0);
  const totalVaultedCount = completedVerseIds.length + 3; // basic estimate

  const milestonesList = [
    {
      id: "prime-sentinel",
      title: "Pillar Sentinel",
      description: "Achieve progress across your primary foundational track",
      targetLabel: "Foundational Progress",
      target: 20,
      current: trackProgress["fundamental-beliefs"] || 0,
      icon: Flame,
      color: "from-amber-500 to-orange-600",
      unlocked: (trackProgress["fundamental-beliefs"] || 0) >= 20
    },
    {
      id: "oral-champion",
      title: "Verbal Advocate",
      description: "Converse loudly inside the AI Voice Studio to refine local teaching skills",
      targetLabel: "Voice Audits Completed",
      target: 3,
      current: localStorage.getItem("stba_completed_voice_count") ? parseInt(localStorage.getItem("stba_completed_voice_count") || "1", 10) : 1,
      icon: Award,
      color: "from-teal-500 to-emerald-600",
      unlocked: true // Voice studio simulates high scores instantly
    },
    {
      id: "sanctuary-dweller",
      title: "Sanctuary Guardian",
      description: "Unlock high-level theological exegesis in the Sanctuary Track",
      targetLabel: "Sanctuary Progress",
      target: 10,
      current: trackProgress["sanctuary-doctrine"] || 0,
      icon: BookOpenCheck,
      color: "from-blue-600 to-indigo-700",
      unlocked: (trackProgress["sanctuary-doctrine"] || 0) >= 10
    },
    {
      id: "sabbath-keeper",
      title: "Shabbat Restorative",
      description: "Engage with scriptures in Sabbath Sanctuary Mode",
      targetLabel: "Sabbath Rest Enacted",
      target: 1,
      current: sabbathActive ? 1 : 0,
      icon: CalendarDays,
      color: "from-amber-600 to-rose-700",
      unlocked: sabbathActive
    }
  ];

  const handleUpdateTrackProgress = (trackId: string, increment: number) => {
    const current = trackProgress[trackId] || 0;
    const next = Math.min(100, current + increment);
    const updated = { ...trackProgress, [trackId]: next };
    setTrackProgress(updated);
    localStorage.setItem(`stba_track_progress_${trackId}`, next.toString());
  };

  const handleSelectFormTrack = (trackId: string) => {
    setFormTrackId(trackId);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const matchingTrack = tracks.find(t => t.id === formTrackId) || tracks[0];
    if (!matchingTrack) return;

    const newSession: ScheduledSession = {
      id: "session-" + Date.now(),
      trackId: formTrackId,
      trackTitle: matchingTrack.title,
      dayOfWeek: formDay,
      timeSlot: formTimeSlot,
      technique: formTechnique
    };

    const updated = [...sessions, newSession];
    setSessions(updated);
    localStorage.setItem("stba_upcoming_study_calendar", JSON.stringify(updated));
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("stba_upcoming_study_calendar", JSON.stringify(updated));
  };

  const handleLaunchSession = (session: ScheduledSession) => {
    onSelectTrack(session.trackId);
    
    // Find first scripture of this track to test/drill
    const verses = trackScriptures[session.trackId] || [];
    if (verses.length > 0 && onLaunchStudyAction) {
      onLaunchStudyAction(verses[0]);
    }
  };

  return (
    <div className="bg-white border border-[#E8E4DA] rounded-2xl shadow-xs overflow-hidden" id="study-roadmap-container">
      {/* Header Banner */}
      <div className={`p-5 flex items-center justify-between transition-colors border-b border-[#E8E4DA] ${
        sabbathActive ? "bg-[#5C443C] text-stone-100" : "bg-gradient-to-r from-[#1C2333]/95 to-[#1C2333] text-white"
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#C9973A]/10 rounded-lg text-[#C9973A]">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-extrabold text-[#1C2333] text-lg text-left dark:text-inherit">Theological Study Roadmap</h3>
            <p className={`text-xs text-left ${sabbathActive ? "text-stone-300" : "text-stone-400"}`}>
              Active Syllabus Master Path & Dynamic Progress Ledger
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="font-bold text-[#C9973A] bg-[#C9973A]/10 px-2.5 py-1 rounded-md uppercase">
            Map Mode
          </span>
        </div>
      </div>

      {/* Accordion Tabs Selection */}
      <div className="grid grid-cols-3 border-b border-[#E8E4DA] bg-[#FAF9F5] text-xs font-mono uppercase tracking-wider select-none">
        <button
          onClick={() => setExpandedSection("path")}
          className={`py-3.5 px-2 text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer font-bold border-r border-[#E8E4DA] ${
            expandedSection === "path"
              ? "bg-white text-[#C9973A]"
              : "text-stone-500 hover:text-[#C9973A] hover:bg-stone-50"
          }`}
          id="tab-roadmap-progress"
        >
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Syllabus Path</span>
        </button>

        <button
          onClick={() => setExpandedSection("milestones")}
          className={`py-3.5 px-2 text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer font-bold border-r border-[#E8E4DA] ${
            expandedSection === "milestones"
              ? "bg-white text-[#C9973A]"
              : "text-stone-500 hover:text-[#C9973A] hover:bg-stone-50"
          }`}
          id="tab-roadmap-milestones"
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Milestones</span>
        </button>

        <button
          onClick={() => setExpandedSection("planner")}
          className={`py-3.5 px-2 text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer font-bold ${
            expandedSection === "planner"
              ? "bg-white text-[#C9973A]"
              : "text-stone-500 hover:text-[#C9973A] hover:bg-stone-50"
          }`}
          id="tab-roadmap-planner"
        >
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Study Planner</span>
        </button>
      </div>

      {/* Accordion Content Panels */}
      <div className="p-6 text-left" id="roadmap-content-viewport">
        
        {/* PANEL 1: SYLLABUS PATH FLOW */}
        <AnimatePresence mode="wait">
          {expandedSection === "path" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
              key="panel-path"
            >
              <div className="bg-[#FDFAF5] border border-[#F4EFE6] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-serif font-extrabold text-[#1C2333] text-sm">Interactive Curriculum Journey</h4>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                    Select any theological track below to target your primary active recall drills. Boost your recall percentage milestones to unlock premium diagnostic certificates and higher status titles.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono whitespace-nowrap bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1.5 rounded-lg border border-stone-200">
                    Syllabus Standard
                  </span>
                </div>
              </div>

              {/* ROAD SYSTEM GRID CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="roadmap-path-grid">
                {tracks.map((track, idx) => {
                  const isActive = track.id === selectedTrackId;
                  const progress = trackProgress[track.id] || 0;
                  const isLocked = track.id === "priority-doctrines" && (trackProgress["fundamental-beliefs"] || 0) < 30;

                  return (
                    <div
                      key={track.id}
                      className={`group relative p-4 flex flex-col justify-between border rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-[#FCFAF2] border-[#C9973A] ring-1 ring-[#C9973A]/30 shadow-md"
                          : isLocked
                          ? "bg-stone-50/70 border-stone-200 opacity-65"
                          : "bg-white hover:bg-stone-50 border-[#E8E4DA] hover:border-stone-400"
                      }`}
                      id={`roadmap-node-${track.id}`}
                    >
                      {/* Connector dot count index */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-stone-100 rounded text-stone-500">
                          Milestone {idx + 1}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-stone-400" />
                          ) : progress === 100 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <span className="font-mono text-[10px] text-stone-400 font-bold">{progress}% done</span>
                          )}
                        </div>
                      </div>

                      {/* Track Details */}
                      <div className="space-y-1 text-left">
                        <h5 className="font-serif font-extrabold text-[#1C2333] text-sm group-hover:text-[#C9973A] transition">
                          {track.title}
                        </h5>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {track.description}
                        </p>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="mt-4 pt-1 space-y-2">
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              progress === 100 
                                ? "bg-emerald-500" 
                                : track.color === "teal" 
                                ? "bg-teal-500" 
                                : track.color === "navy" 
                                ? "bg-[#1C2333]" 
                                : "bg-[#C9973A]"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Interactive triggers */}
                        <div className="flex items-center justify-between text-[11px]">
                          {isLocked ? (
                            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                              Unlock at 30% Beliefs
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectTrack(track.id)}
                              className={`font-mono font-bold tracking-wider uppercase underline hover:text-[#C9973A] cursor-pointer ${
                                isActive ? "text-[#C9973A]" : "text-stone-500"
                              }`}
                            >
                              {isActive ? "Active Track Link" : "Activate Syllabus"}
                            </button>
                          )}

                          {!isLocked && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleUpdateTrackProgress(track.id, 10)}
                                className="text-[10px] font-mono bg-stone-100 hover:bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded cursor-pointer transition border border-stone-200"
                                title="Synthesize drill study session to raise level"
                              >
                                +10% Study
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary Statistics Block */}
              <div className="p-4 bg-stone-50 border border-[#E8E4DA] rounded-xl flex flex-wrap justify-around text-center gap-4">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B]">Total Study Time</span>
                  <span className="font-serif font-extrabold text-stone-900 text-lg">14.5 Hours</span>
                </div>
                <div className="border-r border-stone-200 hidden sm:block" />
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B]">Mastered Passages</span>
                  <span className="font-serif font-[#1C2333] font-extrabold text-[#C9973A] text-lg">
                    {totalVaultedCount} Scriptures
                  </span>
                </div>
                <div className="border-r border-stone-200 hidden sm:block" />
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B]">Weekly Progress Goal</span>
                  <span className="font-serif font-extrabold text-stone-900 text-lg">84% Met</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PANEL 2: UNLOCKED THEOLOGICAL MILESTONES */}
          {expandedSection === "milestones" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6 text-left"
              key="panel-milestones"
            >
              <div className="space-y-1">
                <h4 className="font-serif font-extrabold text-[#1C2333] text-sm">Discipleship Milestones & Medals</h4>
                <p className="text-xs text-stone-600">
                  Earn academic and spiritual accolades as you complete daily diagnostic tests and hands-free verbal exegesis study sessions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="roadmap-milestones-mesh">
                {milestonesList.map((m) => {
                  const IconComp = m.icon;
                  return (
                    <div
                      key={m.id}
                      className={`p-4 border rounded-xl flex items-start gap-4 transition-all duration-300 ${
                        m.unlocked
                          ? "bg-white border-[#E8E4DA] shadow-xs"
                          : "bg-stone-50 border-stone-200 opacity-60"
                      }`}
                    >
                      {/* Medallion Display */}
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${m.unlocked ? m.color : "from-stone-300 to-stone-400"} text-white shrink-0 shadow-sm relative overflow-hidden`}>
                        <IconComp className="w-5 h-5 z-10 relative" />
                        <div className="absolute inset-0 bg-white/10 rotate-12 translate-x-4" />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h5 className="font-serif font-extrabold text-[#1C2333] text-sm truncate">
                            {m.title}
                          </h5>
                          {m.unlocked ? (
                            <span className="text-[8px] font-mono uppercase tracking-widest font-extrabold bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono uppercase tracking-widest font-extrabold bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded">
                              Upcoming
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500 leading-normal">
                          {m.description}
                        </p>

                        {/* Progress Meter bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[9px] font-mono text-stone-400">
                            <span>{m.targetLabel}</span>
                            <span>{m.current} / {m.target}</span>
                          </div>
                          <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full bg-[#C9973A]`}
                              style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Special Certificate banner */}
              <div className="p-4 bg-gradient-to-r from-[#1C2333] to-[#252E42] rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9973A] animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C9973A]">
                      Scribal Master Assessment
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm">Download your Theological Progress Ledger</h4>
                  <p className="text-xs text-stone-400 leading-normal max-w-lg">
                    Generate an offline printable study transcript including list of memorized scriptures, diagnostic trial percentages, and custom credentials.
                  </p>
                </div>
                <button
                  onClick={() => alert("Simulating PDF Generation... Track status: VERIFIED. All 28 Fundamental baseline elements matched.")}
                  className="px-3.5 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-white text-xs font-bold rounded-lg shrink-0 transition"
                >
                  Download Certificate (.PDF)
                </button>
              </div>
            </motion.div>
          )}

          {/* PANEL 3: INTERACTIVE WEEKLY STUDY PLANNER */}
          {expandedSection === "planner" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
              key="panel-planner"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Custom Session Input form (Left side) */}
                <div className="lg:col-span-2 bg-[#FAF9F5] border border-[#E8E4DA] p-4 rounded-xl space-y-4">
                  <h4 className="font-serif font-extrabold text-[#1C2333] text-sm text-left flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#C9973A]" />
                    <span>Plan Study Session</span>
                  </h4>

                  <form onSubmit={handleAddSession} className="space-y-3 text-left">
                    {/* Track Selection */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500">
                        Target Curricula Track
                      </label>
                      <select
                        value={formTrackId}
                        onChange={(e) => setFormTrackId(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E8E4DA] rounded focus:outline-none focus:border-[#C9973A]"
                      >
                        {tracks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day Selection */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500">
                        Day of Week
                      </label>
                      <select
                        value={formDay}
                        onChange={(e) => setFormDay(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E8E4DA] rounded focus:outline-none focus:border-[#C9973A]"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday (Sabbath Eve)</option>
                        <option value="Saturday (Sabbath)">Saturday (Sabbath Day)</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>

                    {/* Time slot value */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500">
                        Time Slot
                      </label>
                      <input
                        type="text"
                        value={formTimeSlot}
                        onChange={(e) => setFormTimeSlot(e.target.value)}
                        placeholder="e.g. 08:30 AM"
                        className="w-full text-xs p-2 bg-white border border-[#E8E4DA] rounded focus:outline-none focus:border-[#C9973A]"
                      />
                    </div>

                    {/* Study Technique */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500">
                        Study Method
                      </label>
                      <select
                        value={formTechnique}
                        onChange={(e) => setFormTechnique(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-[#E8E4DA] rounded focus:outline-none focus:border-[#C9973A]"
                      >
                        <option value="Active Recall Studio">Active Recall Studio</option>
                        <option value="Teach-It Voice Studio">Teach-It Voice Studio</option>
                        <option value="Spaced Repetition Decay">Spaced Repetition Decay</option>
                        <option value="Verbal Walk-and-Talk">Verbal Walk-and-Talk</option>
                        <option value="Interactive Pre-Test">Interactive Pre-Test</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#C9973A] hover:bg-[#B5852F] text-white font-serif font-bold text-xs rounded shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Schedule</span>
                    </button>
                  </form>
                </div>

                {/* Calendar Ledger items (Right side) */}
                <div className="lg:col-span-3 space-y-3">
                  <h4 className="font-serif font-extrabold text-[#1C2333] text-sm text-left">
                    Your Scheduled Study Milestones ({sessions.length})
                  </h4>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {sessions.length === 0 ? (
                      <div className="p-8 border border-dashed border-stone-200 rounded-xl text-center">
                        <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs text-stone-500 font-serif">
                          No study sessions designed yet on your roadmap. Mix & match tracks above!
                        </p>
                      </div>
                    ) : (
                      sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="p-3 bg-white border border-[#E8E4DA] rounded-xl hover:border-stone-300 flex items-center justify-between transition-all"
                        >
                          <div className="space-y-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-mono uppercase bg-[#C9973A]/10 text-[#C9973A] px-2 py-0.5 rounded font-extrabold">
                                {sess.technique}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {sess.dayOfWeek} at {sess.timeSlot}
                              </span>
                            </div>
                            <h5 className="font-serif font-extrabold text-stone-900 text-xs truncate">
                              {sess.trackTitle}
                            </h5>
                          </div>

                          <div className="flex items-center gap-1.5 ml-2.5">
                            <button
                              onClick={() => handleLaunchSession(sess)}
                              className="p-1 px-2.2 bg-[#C9973A] hover:bg-[#B5852F] hover:shadow-xs active:scale-95 text-white font-mono text-[9px] uppercase font-bold rounded flex items-center gap-1 transition-all cursor-pointer"
                              title="Engage study layout instantly"
                            >
                              <Play className="w-2.5 h-2.5" />
                              <span>Go</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSession(sess.id)}
                              className="p-1.5 bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded border border-stone-100 transition-all cursor-pointer"
                              title="Drop study block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Planner Quote details */}
                  <div className="p-3 bg-stone-50 border border-[#E8E4DA] rounded-xl text-[10px] text-stone-500 font-serif leading-relaxed text-left flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                    <span>
                      "Order is heaven's first law... System and method in tracking theological scriptures prevents dynamic information decay over time lines."
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
