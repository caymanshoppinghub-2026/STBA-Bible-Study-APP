import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  BookOpen,
  List,
  Brain,
  Mic,
  Bookmark,
  ChevronRight,
  Sparkles,
  Plus,
  FileText,
  CheckCircle2,
  BookMarked,
  Layers,
  FilePen,
  ExternalLink,
  Info,
  Check,
  X,
  Bell,
  Shield,
  GraduationCap,
  Award,
  Network,
  ArrowRight,
  ScrollText,
  Heart,
  Share2,
  ShieldCheck,
  Flame,
  HelpCircle,
  VolumeX,
  Zap,
  MessageSquare,
  Volume2,
  MicOff,
  Send
} from "lucide-react";
import { DEFAULT_DOCTRINE_TRACKS, DoctrineTrackDb, DoctrineSection } from "../data/doctrineTracksDb";
import { useSabbathMode } from "../context/SabbathMode";
import { useElderStephen } from "../context/ElderStephenContext";
import { saveNoteToSupabase, ensureSupabaseAuth } from "../lib/notebookSync";
import { StudyNote } from "../types/notebook";
import { notifyLiveSectionUpdate } from "../utils/contentUpdatesWatcher";
import { playReminderPingSound } from "../utils/audioFeedback";

// Elevated Track metadata mapping for sacred architectural exploration
const TRACK_METADATA: Record<string, { title: string; icon: string; tagline: string; category: string; blueprintType: string }> = {
  "fundamental-beliefs": {
    title: "28 Fundamental Beliefs",
    icon: "📜",
    tagline: "Organic harmony and systematic architecture of the 28 pillars of faith",
    category: "Systematic Truth",
    blueprintType: "Pillar Architecture"
  },
  "three-angels": {
    title: "Three Angels' Messages",
    icon: "🎺",
    tagline: "Revelation 14 prophetic mandate, Babylon's fall, and the everlasting gospel",
    category: "Prophetic Commission",
    blueprintType: "Prophetic Milestone"
  },
  "sanctuary-doctrine": {
    title: "Heavenly Sanctuary",
    icon: "⛪",
    tagline: "The celestial blueprint, Investigative Judgment, and divine plan of restoration",
    category: "Sanctuary Truth",
    blueprintType: "Celestial Blueprint"
  },
  "sabbath-school": {
    title: "Sabbath School Lesson",
    icon: "📅",
    tagline: "Living spiritual manna, global quarterly lessons, and discipleship dialogues",
    category: "Discipleship Curriculum",
    blueprintType: "Living Manna"
  },
  "book-by-book": {
    title: "Sacred Scrolls Exegesis",
    icon: "📖",
    tagline: "Deep canonical exegesis through critical scrolls of the biblical canon",
    category: "Canonical Exegesis",
    blueprintType: "Verse-by-Verse Walk"
  },
  "priority-doctrines": {
    title: "Covenant Foundations",
    icon: "🔑",
    tagline: "Immutable pillars of grace, the holy law, Sabbath rest, and righteousness",
    category: "Everlasting Covenant",
    blueprintType: "Covenant Pillars"
  }
};

export const DoctrineNavigator: React.FC = () => {
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  
  // Track state
  const [selectedTrackId, setSelectedTrackId] = useState<string>("fundamental-beliefs");
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [selectedChipRef, setSelectedChipRef] = useState<string | null>(null);
  const [activePerspective, setActivePerspective] = useState<"blueprint" | "cross-references" | "mastery">("blueprint");
  
  // Inline notebook drawer state
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const [noteCategory, setNoteCategory] = useState<string>("theology");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showRoleExplanation, setShowRoleExplanation] = useState<boolean>(false);

  // Elder Stephen Persistent Context Hook
  const {
    setStudyMode,
    updateDoctrineContext,
    setCurrentTopic,
    setCurrentPassage,
    sendMessage,
    messages,
    isLoading: isElderLoading,
    speakingMsgId,
    speakMessage,
    stopSpeaking,
    isDictating,
    toggleDictation,
    studyFlow
  } = useElderStephen();

  const [isElderPanelOpen, setIsElderPanelOpen] = useState<boolean>(false);
  const [elderInput, setElderInput] = useState<string>("");

  // Load current active track data
  const activeTrack: DoctrineTrackDb = DEFAULT_DOCTRINE_TRACKS[selectedTrackId] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];
  
  // Safeguard index
  useEffect(() => {
    setSelectedSectionIndex(0);
    setSelectedChipRef(null);
  }, [selectedTrackId]);

  // Synchronize Doctrine context with Elder Stephen persistent state manager
  useEffect(() => {
    setStudyMode("Doctrine");
    if (activeTrack && activeTrack.outline.sections[selectedSectionIndex]) {
      const section = activeTrack.outline.sections[selectedSectionIndex];
      const trackMeta = TRACK_METADATA[selectedTrackId];
      updateDoctrineContext({
        trackId: selectedTrackId,
        trackTitle: trackMeta?.title || "Biblical Doctrine",
        sectionIndex: selectedSectionIndex,
        sectionTitle: section.title,
        keyTexts: section.key_references || [],
        description: section.summary
      });
      if (section.key_references && section.key_references.length > 0) {
        setCurrentPassage(section.key_references[0]);
      }
    }
  }, [selectedTrackId, selectedSectionIndex, activeTrack, setStudyMode, updateDoctrineContext, setCurrentPassage]);

  // Set note default content when section or track changes
  useEffect(() => {
    if (activeTrack && activeTrack.outline.sections[selectedSectionIndex]) {
      const section = activeTrack.outline.sections[selectedSectionIndex];
      const trackMeta = TRACK_METADATA[selectedTrackId];
      setNoteTitle(`[Sacred Blueprint] ${section.title}`);
      
      // Hierarchical outline structure adhering strictly to discipleship mastery standards
      setNoteContent(
`# [Sacred Blueprint Exegesis] ${section.title}
*Track: ${trackMeta?.title || "Systematic Doctrine"} • Divine Architecture Exploration*

### I. Sacred Doctrinal Proposition
- **Divine Pillar:** ${section.title}
- **Architectural Summary:** ${section.summary}
- **Primary Scriptural Anchors:** ${section.key_references.join(", ")}

### II. Harmonized Biblical Foundation (Line Upon Line)
- **Primary Anchor:** ${section.key_references[0] || "Scripture Reference"}
- **Harmonized Cross-References:** ${section.key_references.slice(1).join(", ") || "Supporting Scriptures"}
- **Scripture Interprets Scripture:** *How do Old Testament types find fulfillment in the New Testament reality of Jesus Christ?*

### III. The Scholar's Scrutiny (Berean Verification)
- **Original Context & Setting:** *Who was speaking, to whom, and under what circumstances?*
- **Theological Guardrails:** *How does this protect against human speculation while upholding Sola Scriptura?*

### IV. The Disciple's Heart (Devotional Surrender)
- **Character of God Revealed:** *What does this truth illuminate about God's eternal love, justice, and mercy?*
- **Personal Consecration:** *What must I yield or realign in my walk with Jesus today?*

### V. The Ambassador's Commission (Teach It Framework)
- **Core Truth in Simple Terms:** *How would I explain this to a child or new believer without confusing jargon?*
- **Christ-Centered Appeal:** *How does this doctrine point souls directly to the Savior?*
`
      );
    }
  }, [selectedTrackId, selectedSectionIndex]);

  // Sacred pillar sections available for inspection
  const filteredSections = activeTrack.outline.sections.map((sec, idx) => ({ sec, idx }));

  // Handle saving the study note
  const handleSaveNote = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const uniqueId = `note-${selectedTrackId}-${selectedSectionIndex}-${Date.now().toString().slice(-6)}`;
      const newNote: StudyNote = {
        id: uniqueId,
        title: noteTitle || "Sacred Blueprint Exegesis",
        summary: `Berean reflections on ${activeTrack.outline.sections[selectedSectionIndex]?.title || "Sacred Pillar"}`,
        content: noteContent,
        category: (noteCategory as any) || "theology",
        scriptureTags: activeTrack.outline.sections[selectedSectionIndex]?.key_references || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: true,
        children: [],
        order: 0
      };

      await saveNoteToSupabase(newNote);
      setSaveStatus("success");
      playReminderPingSound();

      // Automatically generate live notification for 28 Fundamentals update
      notifyLiveSectionUpdate({
        sectionId: "28-fundamentals",
        sectionName: "28 Fundamentals",
        title: `28 Fundamentals: ${activeTrack.outline.sections[selectedSectionIndex]?.title || "Doctrine Study"} Verified`,
        description: `Berean study outline and scriptural anchors for "${activeTrack.outline.sections[selectedSectionIndex]?.title || "Belief"}" have been mapped to your discipleship notebook.`,
        link: "/doctrine",
        linkText: "View in Doctrine Navigator",
        category: "doctrine"
      });

      setTimeout(() => {
        setSaveStatus("idle");
        setIsNotesOpen(false);
      }, 1400);
    } catch (err) {
      console.error("Failed to save note from Doctrine Navigator:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Find scripture text by reference ID
  const getScriptureText = (refStr: string) => {
    const matched = activeTrack.key_references.find(
      kr => kr.reference.toLowerCase() === refStr.toLowerCase()
    );
    return matched ? matched.text : "Scripture text loading from Bible Database. Let us study Sola Scriptura with diligent attention.";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8" id="doctrine-navigator-root">
      
      {/* 1. ELEVATED HEADER BANNER & COMPANION SYSTEM STATUS */}
      {/* 1. ELEVATED HEADER BANNER */}
      <div className="flex flex-col gap-5 text-left border-b border-[#DFC57B]/20 pb-6">
        <div className="space-y-3 max-w-4xl">
          
          {/* Top Intelligent Companion Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cognitive Scripture Guidance Companion Badge */}
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#081e3a]/90 border border-[#DFC57B]/50 rounded-full text-[#DFC57B] text-[10px] font-mono font-extrabold tracking-wider shadow-xs backdrop-blur-xs"
              title="An active, Holy Spirit-attuned biblical intelligence that reasons alongside your Berean study"
            >
              <Brain className="w-3.5 h-3.5 text-[#DFC57B] animate-pulse" />
              <span>COGNITIVE SCRIPTURE COMPANION • INTELLIGENT BIBLICAL REASONING ENGINE</span>
            </div>
          </div>

          {/* Master Hub Title */}
          <div className="space-y-1">
            <h1 className="font-serif text-3xl md:text-5xl text-[#DFC57B] font-black tracking-tight leading-tight drop-shadow-xs">
              The Doctrine Navigator
            </h1>
          </div>

          {/* Elevated Theological Subtext */}
          <p className="text-[#FFFFFF]/95 font-sans text-sm md:text-base leading-relaxed">
            Enter an intelligent, Holy Spirit-centered sanctuary of learning. While <strong className="text-[#DFC57B] font-bold underline decoration-[#DFC57B]/40 underline-offset-4">Study Tracks</strong> guide you step-by-step through individual lesson series in sequence, the <strong className="text-[#DFC57B] font-bold">Doctrine Navigator</strong> unveils the entire interconnected landscape of Scripture. Systematically explore the divine architecture, verify prophetic blueprints with Berean rigor, and stand equipped as a faithful <strong className="text-stone-200">disciple</strong>, discerning <strong className="text-stone-200">scholar</strong>, and commissioned <strong className="text-stone-200">ambassador of Christ</strong>.
          </p>

          {/* Complementary Role Indicator Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowRoleExplanation(!showRoleExplanation)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#DFC57B]/90 hover:text-[#DFC57B] underline underline-offset-2 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showRoleExplanation ? "Hide architectural distinction" : "How Doctrine Navigator & Study Tracks work together seamlessly"}</span>
            </button>

            <AnimatePresence>
              {showRoleExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2.5"
                >
                  <div className="p-4 bg-[#081e3a]/95 border border-[#DFC57B]/30 rounded-xl space-y-2 text-xs text-stone-200 shadow-lg">
                    <div className="font-serif font-bold text-[#DFC57B] text-sm">
                      Harmonious Roles: Big-Picture Landscape vs. Step-by-Step Paths
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-1">
                        <span className="font-mono font-bold text-[#DFC57B] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          Doctrine Navigator (Panoramic View)
                        </span>
                        <p className="text-stone-300 leading-relaxed">
                          Surveys the complete doctrinal landscape at a high level. Maps out biblical connections, shows how doctrines relate to the character of God, and enables rapid Berean cross-referencing.
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-1">
                        <span className="font-mono font-bold text-teal-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Study Tracks (Sequential Learning)
                        </span>
                        <p className="text-stone-300 leading-relaxed">
                          Walks you through structured series of lessons one step at a time. Provides interactive quizzes, active recall memory challenges, and daily pacing for in-depth mastery.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. SACRED DOCTRINAL PORTALS • CHOOSE ARCHITECTURAL BLUEPRINT */}
      <div className="space-y-3.5 text-left" id="track-selector-section">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#DFC57B] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#DFC57B]" />
            <span>Sacred Doctrinal Portals • Choose Architectural Blueprint</span>
          </h2>
          <span className="text-[11px] text-stone-400 font-sans italic hidden sm:inline">
            Select a sacred portal to unveil its divine blueprint
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {Object.entries(DEFAULT_DOCTRINE_TRACKS).map(([tid, track]) => {
            const meta = TRACK_METADATA[tid] || {
              title: tid.toUpperCase(),
              icon: "📜",
              tagline: "Explore biblical cohesion",
              category: "Core Truth",
              blueprintType: "Divine Blueprint"
            };
            const isSelected = selectedTrackId === tid;
            
            return (
              <button
                key={tid}
                onClick={() => {
                  setSelectedTrackId(tid);
                  playReminderPingSound();
                }}
                id={`track-card-${tid}`}
                className={`p-4 rounded-xl border text-left transition-all duration-300 relative group flex flex-col justify-between h-[135px] overflow-hidden cursor-pointer ${
                  isSelected
                    ? "bg-[#1C2333] border-[#DFC57B] text-white shadow-lg ring-1 ring-[#DFC57B]/50 scale-[1.02]"
                    : "bg-white border-[#E8E4DA] hover:border-[#DFC57B] text-stone-800 hover:shadow-md"
                }`}
              >
                {/* Visual Flair Glow */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl rounded-full filter blur-xl pointer-events-none transition-opacity ${
                  isSelected ? "from-[#DFC57B]/30 to-teal-500/20 opacity-100" : "from-stone-100 to-transparent opacity-50"
                }`} />

                <div className="space-y-1 relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl leading-none filter drop-shadow-xs">{meta.icon}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-[#DFC57B]/20 text-[#DFC57B] border border-[#DFC57B]/40" : "bg-stone-100 text-stone-600"
                    }`}>
                      {meta.category}
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-xs leading-snug tracking-tight mt-1 truncate">
                    {meta.title}
                  </h3>
                </div>
                
                <p className={`text-[10px] leading-tight line-clamp-2 mt-2 relative z-10 ${
                  isSelected ? "text-stone-300 font-medium" : "text-stone-500"
                }`}>
                  {meta.tagline}
                </p>

                {/* Subtle indicator bar */}
                <div className={`h-0.5 w-full mt-2 rounded-full transition-all ${
                  isSelected ? "bg-[#DFC57B]" : "bg-transparent group-hover:bg-stone-200"
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE BLUEPRINT FOCUS & SACRED ARCHITECTURE OVERVIEW */}
      <div 
        className="bg-[#FDFAF5] border border-[#E8DDC6] p-6 md:p-7 rounded-2xl relative overflow-hidden text-left shadow-sm"
        id="doctrine-overview-panel"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#DFC57B]/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-[#C9973A] text-white font-extrabold px-3 py-1 rounded-md shadow-xs">
              Active Focus: {TRACK_METADATA[selectedTrackId]?.blueprintType || "Divine Architecture"}
            </span>
            <span className="text-xs text-stone-600 font-sans font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sola Scriptura Hermeneutics • Scripture Interprets Scripture
            </span>
          </div>
          
          <h2 className="font-serif font-black text-2xl md:text-3xl text-[#1C2333] tracking-tight" id="doctrine-title">
            {TRACK_METADATA[selectedTrackId]?.title || activeTrack.id}
          </h2>
          
          <p className="text-stone-800 font-sans text-sm md:text-base leading-relaxed pl-3 border-l-3 border-[#DFC57B] bg-white/60 p-3 rounded-r-xl" id="purpose-summary">
            "{activeTrack.description}"
          </p>

          {/* PRIMARY SCRIPTURAL ANCHORS WITH INTERACTIVE PREVIEW */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-extrabold block">
                Primary Scriptural Anchors • Verified Foundation Texts
              </span>
              <span className="text-[11px] text-stone-400 font-sans">
                Click any reference to reveal its full biblical text
              </span>
            </div>

            <div className="flex flex-wrap gap-2" id="key-reference-chips">
              {activeTrack.key_references.map((kr) => {
                const isSpotlighted = selectedChipRef === kr.reference;
                return (
                  <button
                    key={kr.id}
                    onClick={() => {
                      setSelectedChipRef(isSpotlighted ? null : kr.reference);
                      playReminderPingSound();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-sans font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSpotlighted
                        ? "bg-[#C9973A] border-[#C9973A] text-white font-bold shadow-xs scale-105"
                        : "bg-white border-[#E8E4DA] text-stone-700 hover:border-[#C9973A] hover:text-stone-900"
                    }`}
                  >
                    <Bookmark className={`w-3 h-3 ${isSpotlighted ? "text-white" : "text-[#C9973A]"}`} />
                    <span>{kr.reference}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SCRIPTURE SPOTLIGHT DRAWER */}
          <AnimatePresence>
            {selectedChipRef && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="bg-white border border-[#DFC57B]/60 p-4 rounded-xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#C9973A] font-extrabold uppercase flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#C9973A]" />
                      Scripture Spotlight • Revealed Text
                    </span>
                    <span className="text-stone-700 font-extrabold px-2 py-0.5 bg-stone-100 rounded">{selectedChipRef}</span>
                  </div>
                  <p className="font-serif text-stone-800 text-sm leading-relaxed pl-3 border-l-2 border-[#C9973A] italic">
                    "{getScriptureText(selectedChipRef)}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. DIVINE ARCHITECTURE EXPLORER • SACRED SCRIPTURAL BLUEPRINT */}
      <div className="space-y-4 text-left" id="outline-explorer-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#DFC57B] flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#DFC57B]" />
              <span>Divine Architecture Explorer • The Sacred Scriptural Blueprint</span>
            </h2>
            <p className="text-xs text-stone-300 font-sans">
              Unveiling the structural harmony, prophetic foundations, and line-upon-line blueprints of God's revealed truth.
            </p>
          </div>
        </div>

        {/* BENTO MASTER-DETAIL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: SACRED PILLARS SECTION LIST */}
          <div className="lg:col-span-5 flex flex-col space-y-2.5 max-h-[540px] overflow-y-auto pr-2" id="section-list">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold px-1 pb-1">
              Select Pillar to Inspect Blueprint ({filteredSections.length} available)
            </div>

            {filteredSections.length > 0 ? (
              filteredSections.map(({ sec, idx }) => {
                const isSelected = selectedSectionIndex === idx;
                const paddedIndex = String(idx + 1).padStart(2, "0");
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSectionIndex(idx);
                      playReminderPingSound();
                    }}
                    id={`section-card-${idx}`}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 relative group flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#1C2333]/8 border-[#1C2333] shadow-sm ring-1 ring-[#1C2333]/30"
                        : "bg-white border-[#E8E4DA] hover:border-stone-400 hover:shadow-xs"
                    }`}
                  >
                    {/* High-contrast vertical indicator */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl transition-all ${
                      isSelected ? "bg-[#DFC57B]" : "bg-transparent"
                    }`} />
                    
                    <div className="font-mono text-xs font-extrabold text-[#C9973A] bg-[#FDFAF5] border border-[#E8DDC6] px-2 py-1 rounded-lg shrink-0">
                      {paddedIndex}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className={`font-serif font-bold text-xs leading-tight transition-colors ${
                        isSelected ? "text-[#1C2333] font-black" : "text-stone-800"
                      }`}>
                        {sec.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {sec.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {sec.key_references.slice(0, 3).map((ref) => (
                          <span key={ref} className="text-[9px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-semibold border border-stone-200">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ml-auto text-stone-400 self-center transition-transform ${
                      isSelected ? "translate-x-1 text-[#C9973A]" : ""
                    }`} />
                  </button>
                );
              })
            ) : (
              <div className="bg-white border border-dashed border-[#E8E4DA] p-8 text-center rounded-2xl flex flex-col items-center justify-center space-y-2">
                <Info className="w-8 h-8 text-stone-300" />
                <span className="text-xs font-sans text-stone-500">No matching outline sections found. Try adjusting your search.</span>
              </div>
            )}
          </div>

          {/* RIGHT: SECTION DETAIL & VERIFICATION SUITE */}
          <div className="lg:col-span-7" id="section-detail-view">
            {activeTrack.outline.sections[selectedSectionIndex] ? (
              <div className="bg-white border border-[#E8E4DA] rounded-2xl p-6 md:p-7 h-full flex flex-col justify-between space-y-6 relative overflow-hidden shadow-sm">
                
                {/* Visual architectural glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#DFC57B]/10 to-transparent pointer-events-none" />
                
                <div className="space-y-5">
                  {/* Top Bar with Perspective Selector Tabs */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest font-extrabold text-[#C9973A] bg-[#FDFAF5] px-2.5 py-1 border border-[#E8DDC6] rounded-md">
                        Pillar {String(selectedSectionIndex + 1).padStart(2, "0")} Blueprint
                      </span>
                      <span className="text-xs text-stone-400 font-sans hidden sm:inline">
                        Berean Verification & Mastery
                      </span>
                    </div>

                    {/* Perspective Navigation Tabs */}
                    <div className="flex items-center bg-stone-100 p-1 rounded-xl gap-1">
                      <button
                        onClick={() => setActivePerspective("blueprint")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer ${
                          activePerspective === "blueprint"
                            ? "bg-white text-[#1C2333] shadow-xs"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        Sacred Blueprint
                      </button>
                      <button
                        onClick={() => setActivePerspective("cross-references")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer ${
                          activePerspective === "cross-references"
                            ? "bg-white text-[#1C2333] shadow-xs"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        Scripture Bridges
                      </button>
                      <button
                        onClick={() => setActivePerspective("mastery")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer ${
                          activePerspective === "mastery"
                            ? "bg-white text-[#1C2333] shadow-xs"
                            : "text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        Discipleship Mastery
                      </button>
                    </div>
                  </div>

                  {/* Pillar Title */}
                  <h3 className="font-serif font-black text-xl md:text-2xl text-[#1C2333] tracking-tight leading-tight">
                    {activeTrack.outline.sections[selectedSectionIndex].title}
                  </h3>

                  {/* PERSPECTIVE 1: SACRED BLUEPRINT OVERVIEW */}
                  {activePerspective === "blueprint" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="space-y-4"
                    >
                      {/* Theological Proposition */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-extrabold block">
                          Divine Architectural Proposition
                        </span>
                        <div className="bg-[#FDFAF5]/80 border border-[#E8DDC6]/60 p-4 rounded-xl shadow-2xs">
                          <p className="text-stone-800 text-sm font-sans leading-relaxed">
                            {activeTrack.outline.sections[selectedSectionIndex].summary}
                          </p>
                        </div>
                      </div>

                      {/* Section Scriptural Anchors */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-extrabold block">
                          Harmonized Biblical Foundation Texts (Line Upon Line)
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {activeTrack.outline.sections[selectedSectionIndex].key_references.map((ref) => (
                            <div key={ref} className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5 text-xs font-mono">
                                <BookOpen className="w-3.5 h-3.5 text-[#C9973A]" />
                                <span className="font-extrabold text-[#1C2333]">{ref}</span>
                              </div>
                              <p className="font-serif text-xs text-stone-700 leading-relaxed italic pl-3 border-l-2 border-[#C9973A]">
                                "{getScriptureText(ref)}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Discipleship Exegesis Spark */}
                      <div className="bg-[#EBF7F5] border border-teal-200 p-4 rounded-xl flex gap-3 shadow-2xs">
                        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-teal-800 block">
                            Discipleship Exegesis Spark • Sola Scriptura Guide
                          </span>
                          <p className="text-xs text-teal-950 leading-relaxed">
                            Examine this doctrine "line upon line, precept upon precept" (Isaiah 28:10). Connect the Old Testament sanctuary promise with Christ's heavenly intercession. Always point the searching soul to the character of God revealed at the cross.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PERSPECTIVE 2: SCRIPTURAL CROSS-REFERENCE TRACER */}
                  {activePerspective === "cross-references" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="space-y-4"
                    >
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-[#C9973A]" />
                          <h4 className="text-xs font-mono font-bold text-[#1C2333] uppercase tracking-wider">
                            Scriptural Cross-Reference Tracer • Line-Upon-Line Synthesis
                          </h4>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          The system harmonizes Scriptural links automatically. Notice how Old Testament types and prophecies seamlessly bridge to New Testament realities:
                        </p>
                      </div>

                      <div className="space-y-3">
                        {activeTrack.outline.sections[selectedSectionIndex].key_references.map((ref, idx) => (
                          <div key={idx} className="p-3.5 bg-white border border-stone-200 rounded-xl space-y-2 hover:border-[#DFC57B] transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-[#1C2333] flex items-center gap-1.5">
                                <Bookmark className="w-3.5 h-3.5 text-[#C9973A]" />
                                Anchor Passage: {ref}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                                Harmonic Link
                              </span>
                            </div>
                            <p className="text-xs text-stone-700 font-serif italic pl-3 border-l border-[#C9973A]">
                              "{getScriptureText(ref)}"
                            </p>
                            <div className="text-[11px] text-stone-500 font-sans flex items-center gap-1.5 pt-1">
                              <ArrowRight className="w-3 h-3 text-[#C9973A]" />
                              <span>Interpreted through Sola Scriptura: illuminates Christ's saving ministry in the plan of redemption.</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* PERSPECTIVE 3: DISCIPLESHIP MASTERY (DISCIPLE, SCHOLAR, AMBASSADOR) */}
                  {activePerspective === "mastery" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="space-y-3.5"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
                          Mastery Verification Framework • Threefold Training
                        </span>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          Equipping you with the spiritual devotion of a disciple, the analytical scrutiny of a scholar, and the clear articulate voice of an ambassador of Christ (2 Cor 5:20).
                        </p>
                      </div>

                      {/* 3 Pillars of Mastery */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* 1. The Disciple's Heart */}
                        <div className="p-3.5 bg-[#FDFAF5] border border-[#E8DDC6] rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A]">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>1. The Disciple</span>
                          </div>
                          <h5 className="text-xs font-bold text-[#1C2333]">Devotional Surrender</h5>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            How does this truth draw your heart closer to Jesus and conform your will to His love?
                          </p>
                        </div>

                        {/* 2. The Scholar's Mind */}
                        <div className="p-3.5 bg-[#FDFAF5] border border-[#E8DDC6] rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A]">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>2. The Scholar</span>
                          </div>
                          <h5 className="text-xs font-bold text-[#1C2333]">Berean Scrutiny</h5>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            Have you verified the grammatical, historical, and prophetic context using Scripture alone?
                          </p>
                        </div>

                        {/* 3. The Ambassador's Voice */}
                        <div className="p-3.5 bg-[#FDFAF5] border border-[#E8DDC6] rounded-xl space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A]">
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>3. The Ambassador</span>
                          </div>
                          <h5 className="text-xs font-bold text-[#1C2333]">Teach It Framework</h5>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            Are you prepared to explain this truth with clarity, tenderness, and conviction to a seeker?
                          </p>
                        </div>
                      </div>

                      {/* Interactive Outline Export Suggestion */}
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-stone-600">
                          Ready to commit this outline to your study archives?
                        </span>
                        <button
                          onClick={() => {
                            setIsNotesOpen(true);
                            playReminderPingSound();
                          }}
                          className="px-3 py-1.5 bg-[#C9973A] text-white font-bold rounded-lg hover:bg-[#B5852F] transition-colors cursor-pointer"
                        >
                          Map Outline to Notebook
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* ACTION BAR HORIZONTAL */}
                <div 
                  className="pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full"
                  id="action-bar"
                >
                  {/* Outline Notebook */}
                  <button
                    onClick={() => {
                      setIsNotesOpen(true);
                      playReminderPingSound();
                    }}
                    id="action-open-notebook"
                    title="Map this outline directly into your personal discipleship notebook"
                    className="w-full px-2.5 sm:px-3 py-2.5 bg-[#FDFAF5] border border-[#DFC57B]/60 text-[#C9973A] hover:bg-[#F2ECE0] hover:border-[#DFC57B] rounded-xl text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <FilePen className="w-3.5 h-3.5 text-[#C9973A] shrink-0" />
                    <span>Outline Notebook</span>
                  </button>

                  {/* Open Exegesis */}
                  <button
                    onClick={() => navigate("/stba")}
                    id="action-open-stba"
                    title="Launch the STBA cognitive exegesis tutor"
                    className="w-full px-2.5 sm:px-3 py-2.5 bg-white border border-[#E8E4DA] hover:border-[#DFC57B] text-stone-800 rounded-xl text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#C9973A] shrink-0" />
                    <span>Open Exegesis</span>
                  </button>

                  {/* Elder Stephen */}
                  <button
                    onClick={() => {
                      setIsElderPanelOpen(true);
                      playReminderPingSound();
                    }}
                    id="action-open-elder-stephen"
                    title="Consult Elder Stephen on this sacred doctrinal pillar"
                    className="w-full px-2.5 sm:px-3 py-2.5 bg-gradient-to-r from-[#0C1E3D] via-[#102449] to-[#0C1E3D] border border-[#D4A346]/70 text-[#F5C768] hover:border-[#D4A346] rounded-xl text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E6B756] shrink-0" />
                    <span>Elder Stephen</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shrink-0" />
                  </button>

                  {/* Study Track */}
                  <button
                    onClick={() => navigate(`/tracks/${selectedTrackId}/preview`)}
                    id="action-open-track"
                    title="Navigate to the sequential step-by-step Study Track"
                    className="w-full px-2.5 sm:px-3 py-2.5 bg-[#1C2333] hover:bg-[#2c3750] text-white rounded-xl text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#DFC57B] shrink-0" />
                    <span>Study Track</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-stone-200 p-8 text-center rounded-2xl flex flex-col items-center justify-center space-y-2 h-full">
                <Info className="w-8 h-8 text-stone-300" />
                <span className="text-xs font-sans text-stone-500">Select an outline pillar on the left to inspect its scriptural anchors.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. INLINE NOTEBOOK SYNCHRONIZATION DRAWER */}
      <AnimatePresence>
        {isNotesOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="notebook-drawer-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotesOpen(false)}
              className="absolute inset-0 bg-stone-900 backdrop-blur-xs"
            />
            
            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col justify-between"
              id="notebook-drawer-sheet"
            >
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Header */}
                <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-[#FDFAF5]">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="p-2 bg-white border border-[#E8DDC6] rounded-xl text-[#C9973A] shadow-xs">
                      <FilePen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-sm text-[#1C2333] leading-none">
                        Discipleship Vault • Sacred Outline Mapper
                      </h3>
                      <span className="text-[9px] font-mono text-[#C9973A] uppercase tracking-wider font-extrabold mt-1 block">
                        Intelligently connects scripture & syncs with study vault
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNotesOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Editor Content */}
                <div className="p-5 space-y-4 flex-1 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-stone-400 font-extrabold uppercase">
                      Note Title & Sacred Pillar
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#C9973A] transition-all font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-stone-400 font-extrabold uppercase">
                        Theological Category
                      </label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans focus:outline-none focus:border-[#C9973A] transition-all"
                      >
                        <option value="theology">Theology & Doctrine</option>
                        <option value="prophecy">Prophecy & Daniel/Revelation</option>
                        <option value="sanctuary">Sanctuary & Atonement</option>
                        <option value="sabbath">Sabbath & Creation</option>
                        <option value="lifestyle">Christian Lifestyle & Character</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-stone-400 font-extrabold uppercase">
                        Scriptural Foundation Tags
                      </label>
                      <div className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-sans truncate text-stone-700 font-semibold">
                        {activeTrack.outline.sections[selectedSectionIndex]?.key_references.join(", ") || "No tags"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-stone-400 font-extrabold uppercase">
                        Hierarchical Exegesis Outline
                      </label>
                      <span className="text-[10px] font-mono text-[#C9973A]">
                        Formatted in Berean Outline Structure
                      </span>
                    </div>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full flex-1 min-h-[300px] p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#C9973A] transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar Footer inside Drawer */}
              <div className="p-4 border-t border-stone-100 bg-[#FDFAF5]/60 flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsNotesOpen(false);
                    navigate("/notebook");
                  }}
                  className="px-3.5 py-2 bg-white border border-[#E8E4DA] hover:border-stone-400 text-stone-700 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Full Vault</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-white rounded-xl text-xs font-sans font-extrabold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
                >
                  {isSaving ? (
                    <span>Synchronizing to Vault...</span>
                  ) : saveStatus === "success" ? (
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved to Discipleship Vault!</span>
                  ) : saveStatus === "error" ? (
                    <span>Error Saving</span>
                  ) : (
                    <span>Save Outline to Vault</span>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. ELDER STEPHEN PASTORAL DOCTRINAL DIALOGUE DRAWER */}
      <AnimatePresence>
        {isElderPanelOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="elder-stephen-drawer-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsElderPanelOpen(false)}
              className="absolute inset-0 bg-stone-900 backdrop-blur-xs"
            />
            
            {/* Drawer Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-[#081224] text-neutral-100 shadow-2xl flex flex-col justify-between border-l border-[#D4A346]/40"
              id="elder-stephen-drawer-sheet"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#1B2B48] flex justify-between items-center bg-[#060E1C]">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-[#D4A346]/60 flex items-center justify-center font-serif text-sm font-bold text-[#E6B756] shadow-sm">
                    ES
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-sm text-[#F7DE9C] leading-none">
                        Elder Stephen • Pastoral Discipleship
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block truncate max-w-[320px]">
                      Pillar: {activeTrack.outline.sections[selectedSectionIndex]?.title || "Doctrine Pillar"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsElderPanelOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs scrollbar-thin">
                {messages.map((msg) => {
                  const isElder = msg.role === 'elder' || msg.sender === 'elder';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[88%] ${isElder ? 'self-start mr-auto' : 'self-end ml-auto items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[9px] font-mono">
                        {msg.modeOrigin && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] border ${
                            msg.modeOrigin === 'Doctrine'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : msg.modeOrigin === 'Study'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-stone-500/20 text-stone-300 border-stone-500/30'
                          }`}>
                            {msg.modeOrigin} Mode
                          </span>
                        )}
                        <span className="text-neutral-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-xl leading-relaxed text-[13px] ${
                          isElder
                            ? 'bg-[#0E1E3A] border border-[#1E355F] text-neutral-100 rounded-tl-none font-sans'
                            : 'bg-[#C9973A]/20 border border-[#C9973A]/50 text-[#F5E6C8] rounded-tr-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>

                      {isElder && (
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <button
                            type="button"
                            onClick={() => speakMessage(msg.id, msg.text)}
                            className="p-1 rounded text-neutral-400 hover:text-amber-300 transition-colors flex items-center cursor-pointer"
                            title={speakingMsgId === msg.id ? "Silence reader" : "Listen aloud"}
                          >
                            {speakingMsgId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isElderLoading && (
                  <div className="flex flex-col self-start mr-auto max-w-[85%]">
                    <div className="px-4 py-3 bg-[#0E1E3A] border border-[#1E355F] rounded-xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6B756] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6B756] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6B756] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400 mt-1 px-1">Elder Stephen is searching Scripture...</span>
                  </div>
                )}
              </div>

              {/* Quick suggestion chips */}
              <div className="p-2 bg-[#060E1C] border-t border-[#1B2B48] flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const sec = activeTrack.outline.sections[selectedSectionIndex];
                    sendMessage(`How does the doctrine of "${sec?.title}" connect with the Sanctuary service and Christ's high-priestly ministry?`, { overrideMode: 'Doctrine', badge: 'Sanctuary Link' });
                  }}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-neutral-300 hover:text-[#E6B756] hover:border-[#E6B756]/40 transition-colors cursor-pointer"
                >
                  ⛪ Sanctuary Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sec = activeTrack.outline.sections[selectedSectionIndex];
                    sendMessage(`Give me a simple 3-step teaching outline for "${sec?.title}" to explain to a new believer or child.`, { overrideMode: 'Doctrine', badge: 'Teach Outline' });
                  }}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-neutral-300 hover:text-[#E6B756] hover:border-[#E6B756]/40 transition-colors cursor-pointer"
                >
                  🌱 Teach It Simply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sec = activeTrack.outline.sections[selectedSectionIndex];
                    sendMessage(`What Spirit of Prophecy insights illuminate "${sec?.title}" in the Great Controversy framework?`, { overrideMode: 'Doctrine', badge: 'EGW Insights' });
                  }}
                  className="px-2 py-1 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-neutral-300 hover:text-[#E6B756] hover:border-[#E6B756]/40 transition-colors cursor-pointer"
                >
                  📜 Spirit of Prophecy
                </button>
              </div>

              {/* Input Area */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!elderInput.trim() || isElderLoading) return;
                  const text = elderInput.trim();
                  setElderInput("");
                  await sendMessage(text, { overrideMode: 'Doctrine', badge: 'Doctrinal Inquiry' });
                }}
                className="p-3 bg-[#060E1C] border-t border-[#D4A346]/40 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => toggleDictation((t) => setElderInput(prev => prev ? `${prev} ${t}` : t))}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 h-[40px] w-[40px] ${
                    isDictating
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                      : 'bg-[#0E1E3A] border-[#1E355F] text-neutral-300 hover:text-amber-300'
                  }`}
                  title={isDictating ? "Stop recording" : "Voice dictation"}
                >
                  {isDictating ? <MicOff className="w-4 h-4 text-rose-500 animate-pulse" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={elderInput}
                  onChange={(e) => setElderInput(e.target.value)}
                  placeholder={`Ask Elder Stephen about ${activeTrack.outline.sections[selectedSectionIndex]?.title || "this doctrine"}...`}
                  className="flex-1 bg-[#0E1E3A] text-xs font-sans text-neutral-100 placeholder-neutral-500 rounded-xl border border-[#1E355F] px-3.5 py-2.5 focus:outline-none focus:border-[#D4A346] transition-all"
                />

                <button
                  type="submit"
                  disabled={!elderInput.trim() || isElderLoading}
                  className="px-4 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctrineNavigator;

