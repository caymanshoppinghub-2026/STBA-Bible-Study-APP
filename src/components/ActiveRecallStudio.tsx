/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Brain,
  Calendar,
  Layers,
  Mic,
  Bookmark,
  Sparkles,
  Info,
  MessageSquare,
  Gamepad2,
  CalendarCheck,
  LayoutGrid,
  Compass,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";
import { Scripture } from "../types";

// Import modules
import { RecallSession } from "./RecallSession";
import { SpacedRepetition } from "./SpacedRepetition";
import { Interleaving } from "./Interleaving";
import { WalkAndTalk } from "./WalkAndTalk";
import { VoiceReflection } from "./VoiceReflection";
import { AskTheScholar } from "./AskTheScholar";

// Import new memory enhancement modules
import { ScriptureGamePack } from "./recall/ScriptureGamePack";
import { MemorizationBlueprint } from "./recall/MemorizationBlueprint";
import { ThirtyDayRecallPlan } from "./recall/ThirtyDayRecallPlan";
import { VisualMemoryGrid } from "./recall/VisualMemoryGrid";
import { GeminiRecallModule } from "./recall/GeminiRecallModule";

type ActiveTab =
  | "recall"
  | "gamepack"
  | "plan30"
  | "grid"
  | "blueprint"
  | "gemini"
  | "spaced"
  | "interleave"
  | "walk"
  | "reflection"
  | "scholar";

export const ActiveRecallStudio: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { user } = useApp();

  // Active review scripture & queue passed from Spaced Repetition or other tabs
  const [activeScripture, setActiveScripture] = useState<Scripture | undefined>(undefined);
  const [activeQueue, setActiveQueue] = useState<Scripture[] | undefined>(undefined);
  const [activeQueueIndex, setActiveQueueIndex] = useState<number>(0);

  // Determine starting tab based on whether a scripture was passed (from Vault/Pre-test)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(location.search);
    const stateDoctrine = location.state?.doctrineId;
    if (params.get("doctrine") === "holy-scriptures" || stateDoctrine === "holy-scriptures") {
      return "recall";
    }
    if (location.state?.scripture) {
      return "recall";
    }
    return "spaced"; // Default to Spaced Repetition due reviews
  });

  const params = new URLSearchParams(location.search);
  const stateDoctrine = location.state?.doctrineId;
  const isFromBelief1 = params.get("doctrine") === "holy-scriptures" || stateDoctrine === "holy-scriptures";

  const belief1Scripture = isFromBelief1 ? {
    id: "holy-scriptures",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "righteousness"]
  } : undefined;

  // Handler to activate Verbatim Recall tab with selected verse or queue
  const handleNavigateToRecall = (scripture: Scripture, queue?: Scripture[]) => {
    setActiveScripture(scripture);
    if (queue && queue.length > 0) {
      setActiveQueue(queue);
      const idx = queue.findIndex(q => q.id === scripture.id);
      setActiveQueueIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveQueue(undefined);
      setActiveQueueIndex(0);
    }
    setActiveTab("recall");
  };

  // Handler when a queued review finishes in RecallSession
  const handleRecallComplete = (score: number, scriptureId: string) => {
    if (activeQueue && activeQueueIndex < activeQueue.length - 1) {
      const nextIdx = activeQueueIndex + 1;
      setActiveQueueIndex(nextIdx);
      setActiveScripture(activeQueue[nextIdx]);
    } else {
      // Finished all due items or single item -> return to Spaced Repetition overview
      setActiveQueue(undefined);
      setActiveQueueIndex(0);
      setActiveScripture(undefined);
      setActiveTab("spaced");
    }
  };

  // Track tabs labels and icons
  const tabsList = [
    { id: "recall" as const, label: "Verbatim Recall", icon: Brain, desc: "Test active retention in 4-step gym" },
    { id: "gamepack" as const, label: "Scripture Game Pack", icon: Gamepad2, desc: "Interactive gamified scripture challenge" },
    { id: "plan30" as const, label: "30-Day Discipleship Track", icon: CalendarCheck, desc: "The 30-Day Discipleship Scripture Track - Day-by-day memorization journey" },
    { id: "grid" as const, label: "Visual Memory Grid", icon: LayoutGrid, desc: "Visual progress & 28 Beliefs matrix" },
    { id: "blueprint" as const, label: "App Blueprint", icon: Compass, desc: "Habit architecture & retention guide" },
    { id: "gemini" as const, label: "Gemini Recall AI", icon: Sparkles, desc: "Real-time AI prompts & feedback" },
    { id: "spaced" as const, label: "Spaced Repetition", icon: Calendar, desc: "Due reviews log" },
    { id: "interleave" as const, label: "Interleaved Study", icon: Layers, desc: "Mix active curricula" },
    { id: "walk" as const, label: "Walk & Talk", icon: Mic, desc: "On-the-go verbal check" },
    { id: "reflection" as const, label: "Voice Reflection", icon: Sparkles, desc: "Oral exegesis feedback" },
    { id: "scholar" as const, label: "Ask the Scholar", icon: MessageSquare, desc: "SDA context Q&A with audible exegesis" }
  ];

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // When activeTab changes, automatically scroll it fully into view cleanly
  useEffect(() => {
    const activeEl = document.getElementById(`tab-recall-${activeTab}`);
    if (activeEl && tabsContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest"
      });
    }
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const distance = 260;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth"
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <div
      className="w-full h-full flex flex-col min-h-0 text-[#1A1A1A]"
      id="recall-studio-root"
      style={{ flex: "1 1 0%" }}
    >
      <div
        className="w-full overflow-y-auto scroll-smooth pt-4 pb-32 sm:pb-8 px-4 md:px-8 space-y-6"
        id="recall-studio-scroll-container"
        style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          height: "100%",
          flex: "1 1 auto"
        }}
      >
        {/* HEADER SECTION PANEL */}
        <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-[#E8E4DA] rounded-2xl shadow-xs" id="recall-studio-header">
          <div className="space-y-1 text-left">
            <div className="flex items-center space-x-2 text-[#C9973A]">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] font-mono uppercase bg-[#C9973A]/10 px-2.5 py-0.5 rounded font-extrabold tracking-widest">
                STBA ACTIVE RECALL HUB
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-navy">
               Active Learning Studio
            </h1>
            <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-lg">
               Eliminating the fluency illusion. Strengthen your neuro-pathway retention using cognitive-psychology research metrics.
            </p>
          </div>

          {/* User Badge context */}
          <div className="flex items-center space-x-2 bg-[#FAF7F0] border border-[#E8E4DA] p-3 rounded-xl hover:shadow-inner shrink-0 text-left">
            <div className="w-9 h-9 rounded-full bg-[#1C2333] text-gold border border-[#C9973A]/20 flex items-center justify-center font-serif text-sm font-extrabold shrink-0">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2) : "NB"}
            </div>
            <div>
              <h4 className="text-xs font-bold text-navy">{user?.name || "Noble Berean"}</h4>
              <span className="text-[9px] font-mono font-extrabold text-[#C9973A] uppercase tracking-wider block">
                 Mastery Level: Scholar
              </span>
            </div>
          </div>
        </header>

        {/* CORE WORKSPACE TAB NAVIGATION STRIP (GOLD-TRIMMED SINGLE HORIZONTAL LINE WITH SCROLL CONTROLS) */}
        <div className="max-w-6xl mx-auto space-y-2 select-none" id="recall-tabs-bar">
          {/* Centered Golden Header */}
          <div className="flex items-center justify-center w-full text-center text-[11px]">
            <span className="font-mono text-[#DFC57B] font-bold uppercase tracking-widest">
              WORKSPACE TOOLS
            </span>
          </div>

          {/* Single Horizontal Row of Modern Gold-Trimmed Buttons with Left/Right Navigation Controls */}
          <div className="relative flex items-center w-full">
            {/* Left Scroll Button & Edge Gradient */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 pl-0.5 bg-gradient-to-r from-[#06162c] via-[#06162c]/95 to-transparent">
                <button
                  type="button"
                  onClick={() => scrollTabs("left")}
                  aria-label="Scroll tools left"
                  title="Scroll tools left"
                  className="p-1.5 rounded-full bg-[#06162c] text-[#DFC57B] border border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060] shadow-[0_0_12px_rgba(223,197,123,0.3)] transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable button container - justify-start, no negative scroll clipping */}
            <div
              ref={tabsContainerRef}
              onScroll={checkScroll}
              className="flex flex-row flex-nowrap items-center justify-start gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-2 px-3 scroll-smooth w-full"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollSnapType: "x proximity"
              }}
            >
              {tabsList.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={`tab-recall-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Erase router state scripture if switching tabs to avoid sticky loading
                      if (location.state?.scripture) {
                        navigate(location.pathname, { replace: true, state: null });
                      }
                    }}
                    style={{ scrollSnapAlign: "center" }}
                    className={`shrink-0 flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-sans font-semibold transition-all duration-200 ease-out cursor-pointer border select-none hover:-translate-y-[2.5px] hover:shadow-[0_4px_16px_rgba(223,197,123,0.3)] active:translate-y-0 active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                        : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70 hover:text-white"
                    }`}
                    title={tab.desc}
                  >
                    <Icon className="w-4 h-4 text-[#DFC57B] shrink-0 drop-shadow-[0_0_4px_rgba(223,197,123,0.4)]" />
                    <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Button & Edge Gradient */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 pr-0.5 bg-gradient-to-l from-[#06162c] via-[#06162c]/95 to-transparent">
                <button
                  type="button"
                  onClick={() => scrollTabs("right")}
                  aria-label="Scroll tools right"
                  title="Scroll tools right"
                  className="p-1.5 rounded-full bg-[#06162c] text-[#DFC57B] border border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060] shadow-[0_0_12px_rgba(223,197,123,0.3)] transition-all cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE AREA VIEWS */}
        <div className="max-w-5xl mx-auto" id="recall-tab-display">
          {activeTab === "recall" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RecallSession
                scripture={activeScripture || belief1Scripture || location.state?.scripture} // Feed passed scripture directly
                queue={activeQueue}
                currentQueueIndex={activeQueueIndex}
                sabbathMode={sabbathMode}
                isEmbedded={true}
                onBack={() => setActiveTab("spaced")}
                onComplete={handleRecallComplete}
              />
            </motion.div>
          )}

          {activeTab === "gamepack" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ScriptureGamePack
                initialScripture={activeScripture || belief1Scripture}
                onLaunchRecallPractice={(s) => {
                  setActiveScripture(s);
                  setActiveTab("recall");
                }}
              />
            </motion.div>
          )}

          {activeTab === "plan30" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ThirtyDayRecallPlan
                onSelectVerseForPractice={(s) => {
                  setActiveScripture(s);
                  setActiveTab("recall");
                }}
                onPlayInGamePack={(s) => {
                  setActiveScripture(s);
                  setActiveTab("gamepack");
                }}
              />
            </motion.div>
          )}

          {activeTab === "grid" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VisualMemoryGrid
                onSelectScripture={(s) => {
                  setActiveScripture(s);
                  setActiveTab("recall");
                }}
              />
            </motion.div>
          )}

          {activeTab === "blueprint" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <MemorizationBlueprint
                onLaunchRecall={() => setActiveTab("recall")}
              />
            </motion.div>
          )}

          {activeTab === "gemini" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GeminiRecallModule
                initialScripture={activeScripture || belief1Scripture}
                onPracticeInGym={(s) => {
                  setActiveScripture(s);
                  setActiveTab("recall");
                }}
              />
            </motion.div>
          )}

          {activeTab === "spaced" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SpacedRepetition onSelectReview={handleNavigateToRecall} />
            </motion.div>
          )}

          {activeTab === "interleave" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Interleaving />
            </motion.div>
          )}

          {activeTab === "walk" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <WalkAndTalk />
            </motion.div>
          )}

          {activeTab === "reflection" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VoiceReflection />
            </motion.div>
          )}

          {activeTab === "scholar" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AskTheScholar />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveRecallStudio;
