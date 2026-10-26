/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Brain,
  GraduationCap,
  Calendar,
  Compass,
  FileText,
  Headphones,
  HelpCircle,
  Video,
  Zap,
  Search,
  Mic,
  Clock,
  Send,
  X,
  ExternalLink,
  MessageSquare,
  Check,
  Flame,
  Award,
  Layers,
  Sliders,
  Bookmark,
  Share2,
  Ticket,
  BookOpenText,
  NotebookText,
  CalendarDays,
  Volume2,
  VolumeX,
  Pause,
  Headset,
  FileDown,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Track, UserAccount, Scripture } from "../types";
import { useApp } from "../context/AppContext";
import { DailyGoalProgressBar } from "./DailyGoalProgressBar";
import { HelpCenterPanel } from "./HelpCenterPanel";
import { callElderStephen } from "../lib/callElderStephen";
import {
  PreloadedAnswer,
  getStoredPreloadedAnswers,
  savePreloadedAnswer
} from "../data/preloadedAiAnswers";
import { useSpeechReader } from "../hooks/useSpeechReader";
import { ExegesisRenderer } from "./ExegesisRenderer";
import {
  STBA_LOGO_URL,
  ELDER_STEVEN_PORTRAIT_URL,
  FEATURED_COVENANT_IMAGE_URL
} from "../assets/branding";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";
import { loadNotes, saveResponseAsNewNote } from "../data/notebookData";
import { aggregateUserStats } from "../utils/userStatsAggregator";

// Concept-art custom icons matching Study Modes Icons reference
const RoadTrackIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4.5 21C6.8 14 9.8 8 11.6 3" />
    <path d="M19.5 21C17.2 14 14.2 8 12.4 3" />
    <path d="M12 20v-2.5" />
    <path d="M12 14.5v-2.5" />
    <path d="M12 9v-2.5" />
  </svg>
);

const DoctrineNodesIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="5.5" r="2.5" />
    <circle cx="6" cy="18.5" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <line x1="10.2" y1="7.6" x2="7.8" y2="16.4" />
    <line x1="13.8" y1="7.6" x2="16.2" y2="16.4" />
    <line x1="8.5" y1="18.5" x2="15.5" y2="18.5" />
  </svg>
);

function formatNoteDate(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 0) {
      if (diffHours < 1) return "Just now";
      return "Today";
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

// Automatically scans text for Protestant canon book chapter:verse patterns
function extractScripturesFromText(text: string): string[] {
  if (!text) return [];
  const pattern = /\b(?:(?:1|2|3)\s+)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+\d+:\d+(?:[-–—]\d+)?\b/g;
  const matches = text.match(pattern) || [];
  return Array.from(new Set(matches.map(m => m.trim()))).slice(0, 8);
}

// Cleans raw markdown and provides an executive summary of the note
function cleanNoteSummary(summary?: string, content?: string): string {
  if (
    summary &&
    summary.trim() &&
    summary.trim().toLowerCase() !== "theological scratchpad" &&
    summary.trim().toLowerCase() !== "untitled"
  ) {
    return summary.trim();
  }
  if (!content || !content.trim()) {
    return "Personal theological reflection and study notes recorded in your STBA Notebook.";
  }
  const stripped = content
    .replace(/^#+\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (!stripped) return "Personal theological reflection and study notes recorded in your STBA Notebook.";
  if (stripped.length <= 260) return stripped;
  return stripped.slice(0, 255).trim() + "...";
}

// Curated default notebook entries for immediate theological enrichment
const DEFAULT_NOTEBOOK_ENTRIES = [
  {
    id: "note-1",
    title: "Understanding the New Covenant",
    category: "Theology",
    date: "Today",
    summary:
      "The New Covenant (Hebrews 8:10, Jeremiah 31:33) is God's law written upon the heart by grace through faith in Jesus Christ.",
    preview:
      "The New Covenant (Hebrews 8:10, Jeremiah 31:33) is God's law written upon the heart by grace through faith in Jesus Christ.",
    content:
      "# Understanding the New Covenant\n\nThe New Covenant is the fulfillment of Jeremiah 31:31-34. Under this everlasting covenant, God writes His moral law not upon cold tablets of stone, but upon the fleshy tables of the renewed heart through the indwelling of the Holy Spirit.\n\nKey themes:\n- Salvation purely by grace through faith in Christ\n- Internal transformation vs. external formalism\n- Christ as the Mediator of a better covenant founded upon better promises",
    verses: ["Hebrews 8:10", "Jeremiah 31:33", "Ezekiel 36:26"]
  },
  {
    id: "note-2",
    title: "Romans 8 Study",
    category: "Biblical Studies",
    date: "Yesterday",
    summary:
      "No condemnation in Christ Jesus. The law of the Spirit of life sets us free from the law of sin and death.",
    preview:
      "No condemnation in Christ Jesus. The law of the Spirit of life sets us free from the law of sin and death.",
    content:
      "# Romans 8 Study\n\nThere is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.\n\nPaul demonstrates that while the law was weakened through sinful human nature, God sent His own Son in the likeness of sinful flesh to condemn sin and fulfill the righteous requirement of the law in us.",
    verses: ["Romans 8:1", "Romans 8:14", "Romans 8:28"]
  },
  {
    id: "note-3",
    title: "Doctrine of the Sabbath",
    category: "Theology",
    date: "May 20",
    summary:
      "Memorial of Creation (Genesis 2:1-3, Exodus 20:8-11) and sign of sanctification (Ezekiel 20:12, 20).",
    preview:
      "Memorial of Creation (Genesis 2:1-3, Exodus 20:8-11) and sign of sanctification (Ezekiel 20:12, 20).",
    content:
      "# Doctrine of the Sabbath\n\nThe seventh-day Sabbath stands as God's perpetual sign between Him and His people. It points backward to the completed Creation and forward to the ultimate rest of redemption in Christ.\n\nResting on God's holy day demonstrates total dependence on Him as Creator and Sanctifier.",
    verses: ["Exodus 20:8-11", "Isaiah 58:13", "Mark 2:27-28"]
  },
  {
    id: "note-4",
    title: "Seven Trumpets Teaching Outline",
    category: "Prophecy",
    date: "May 18",
    summary:
      "Historical-grammatical exegesis of Revelation 8–9. Sequential prophetic milestones through Church history.",
    preview:
      "Historical-grammatical exegesis of Revelation 8–9. Sequential prophetic milestones through Church history.",
    content:
      "# Seven Trumpets Teaching Outline\n\nHistorical-grammatical exegesis of Revelation 8–9. Sequential prophetic milestones through Church history representing judgments upon the persecutors of God's covenant people from the fall of Western Rome to the sounding of the seventh trumpet.",
    verses: ["Revelation 8:2", "Revelation 8:7", "Revelation 9:1"]
  },
  {
    id: "note-5",
    title: "Sanctuary Types & Shadows",
    category: "Theology",
    date: "May 15",
    summary:
      "Exegesis of Hebrews 9: The earthly sanctuary service prefiguring the heavenly ministry of Christ our High Priest.",
    preview:
      "Exegesis of Hebrews 9: The earthly sanctuary service prefiguring the heavenly ministry of Christ our High Priest.",
    content:
      "# Sanctuary Types & Shadows\n\nThe earthly tabernacle constructed by Moses according to the pattern shown on Mount Sinai served as an illustration for the present time. Christ entered the greater and more perfect tabernacle in heaven with His own blood.",
    verses: ["Hebrews 9:11-14", "Leviticus 16:16", "Daniel 8:14"]
  },
  {
    id: "note-6",
    title: "Three Angels' Messages Exegesis",
    category: "Prophecy",
    date: "May 12",
    summary:
      "Revelation 14:6–12 — The everlasting gospel in the context of the judgment-hour message, the fall of Babylon, and the mark of the beast.",
    preview:
      "Revelation 14:6–12 — The everlasting gospel in the context of the judgment-hour message, the fall of Babylon, and the mark of the beast.",
    content:
      "# Three Angels' Messages Exegesis\n\nThe proclamation of Revelation 14:6-12 represents God's final warning of mercy to the world before the Second Advent of Christ. It calls humanity to worship the Creator, reject Babylon's falsehoods, and keep the commandments of God and the faith of Jesus.",
    verses: ["Revelation 14:6-12", "Revelation 18:1-4"]
  }
];

interface DashboardProps {
  user: UserAccount;
  isSabbathMode?: boolean;
  sabbathMode?: boolean;
  onToggleSabbathMode?: () => void;
  onLogOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  isSabbathMode = false,
  sabbathMode,
  onToggleSabbathMode,
  onLogOut
}) => {
  const navigate = useNavigate();
  const userName = user?.name || "Noble Berean";

  const { completedVerseIds = [], favoriteScriptures = [] } = useApp();

  // Weekly Study Recap State
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [weeklyRecap, setWeeklyRecap] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem("stba_latest_weekly_recap");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [recapSavedToast, setRecapSavedToast] = useState(false);
  const [recapCopiedToast, setRecapCopiedToast] = useState(false);

  // Recent Studies dynamic dataset with fallback
  const [recentStudiesList] = useState<{ reference: string; topic: string; date: string; tag: string }[]>(() => {
    const list: { reference: string; topic: string; date: string; tag: string }[] = [];
    try {
      const rawCache = localStorage.getItem(`stba_study_exegesis_cache_${user?.email || "guest"}`);
      if (rawCache) {
        const parsed = JSON.parse(rawCache);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.slice(0, 3).forEach((item: any) => {
            list.push({
              reference: item.reference || "Hebrews 8:1–6",
              topic: item.topic || "Sanctuary Exegesis",
              date: "Recent",
              tag: item.reference?.startsWith("Rev") ? "Prophecy" : item.reference?.startsWith("Dan") ? "Prophecy" : "Doctrine"
            });
          });
        }
      }
    } catch (e) {}

    if (list.length === 0) {
      return [
        {
          reference: "Hebrews 8:1–6",
          topic: "The Heavenly Sanctuary & Better Covenant",
          date: "2 days ago",
          tag: "Sanctuary"
        },
        {
          reference: "Revelation 14:6–12",
          topic: "Three Angels' Messages & Remnant Calling",
          date: "3 days ago",
          tag: "Prophecy"
        },
        {
          reference: "Exodus 20:8–11",
          topic: "The Fourth Commandment Memorial & Seal",
          date: "May 20",
          tag: "Decalogue"
        }
      ];
    }
    return list;
  });

  // Local SDA theological fallback for Weekly Study Recap
  const createLocalWeeklyRecapFallback = (
    name: string,
    completedVersesCount: number,
    vaultList: any[] = [],
    tracksList: any[] = []
  ) => {
    const defaultMastered = [
      {
        concept: "The True Heavenly Sanctuary & High Priestly Mediation",
        keyScriptures: ["Hebrews 8:1–6", "Hebrews 9:11–14", "Daniel 8:14"],
        summary: "You have firmly anchored the truth that Christ ministers in the genuine heavenly tabernacle pitched by the Lord. The earthly sanctuary was a miniature shadow, while Christ's present intercession provides complete pardon and empowering grace.",
        masteryTier: "Mastered"
      },
      {
        concept: "The Perpetuity of the Seventh-Day Sabbath Memorial",
        keyScriptures: ["Genesis 2:1–3", "Exodus 20:8–11", "Luke 4:16"],
        summary: "Solidified the Edenic origin and moral perpetuity of the Sabbath as the seal of the living Creator God, recognizing it as a palace in time for spiritual communion rather than a ceremonial shadow.",
        masteryTier: "Mastered"
      },
      {
        concept: "The Three Angels' Messages & Remnant Calling",
        keyScriptures: ["Revelation 14:6–12", "Revelation 18:1–4", "2 Timothy 2:15"],
        summary: "Grasped the everlasting gospel in the critical hour of God's judgment, understanding the patience of the saints who keep the commandments of God and hold fast the faith of Jesus.",
        masteryTier: "Proficient"
      }
    ];

    const defaultReviews = [
      {
        topic: "The 2,300-Day Prophetic Timeline & 1844 Baseline",
        scriptureAnchor: "Daniel 8:14; Daniel 9:24–27",
        reasonForReview: "Deepen chronological precision regarding the 457 B.C. decree of Artaxerxes and the day-year principle connecting the 70 prophetic weeks to the commencement of the Investigative Judgment in 1844.",
        suggestedAction: "Run an Active Recall drill focusing on prophecy keywords and dates.",
        targetMode: "/recall",
        modeName: "Active Recall Mode"
      },
      {
        topic: "Levitical Day of Atonement Typology & The Scapegoat",
        scriptureAnchor: "Leviticus 16:15–22; Hebrews 9:23–26",
        reasonForReview: "Reinforce the theological distinction between Christ's once-for-all blood sacrifice on Calvary and the ultimate transfer of confessed sin to Azazel, confirming the cosmic eradication of rebellion.",
        suggestedAction: "Explore the Sanctuary and Covenant nodes in Doctrine Navigator.",
        targetMode: "/doctrine",
        modeName: "Doctrine Navigator Mode"
      },
      {
        topic: "Instructing Seekers on the Righteousness of Christ",
        scriptureAnchor: "Romans 8:1–4; Steps to Christ, p. 62",
        reasonForReview: "Translate doctrinal knowledge of justification and sanctification into a clear, loving lesson outline accessible to children and new believers.",
        suggestedAction: "Create a simplified 4-part discipleship teaching outline in Teach It Studio.",
        targetMode: "/teach",
        modeName: "Teach It Mode"
      }
    ];

    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const periodStr = `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const vaultCount = vaultList.length > 0 ? vaultList.length : completedVersesCount;

    return {
      title: "Weekly Scripture Mastery & Doctrinal Recap",
      period: periodStr,
      overview: `Brother/Sister ${name}, your discipleship journey this week demonstrates faithful momentum across Scripture retention and historic Adventist doctrine. You have reinforced critical pillars in your Memory Vault (${vaultCount} active verses) while maintaining structured study habits across your tracks.`,
      stats: {
        masteredCount: Math.max(vaultCount, 6),
        streakDays: 7,
        totalMinutes: 120,
        overallMastery: 84
      },
      masteredConcepts: defaultMastered,
      suggestedReviewAreas: defaultReviews,
      scriptureMilestones: [
        { ref: "2 Timothy 2:15", desc: "Rightly dividing the word of truth as an approved workman" },
        { ref: "Revelation 14:12", desc: "Here is the patience of the saints, keeping the commandments of God" },
        { ref: "Daniel 8:14", desc: "Unto two thousand and three hundred days; then shall the sanctuary be cleansed" }
      ],
      pastoralEncouragement: `“Study to shew thyself approved unto God, a workman that needeth not to be ashamed” (2 Timothy 2:15). Beloved student, true scripture mastery is not merely intellectual accumulation; it is letting the Holy Spirit write God's living law upon the fleshy tables of your heart. Continue abiding in Christ, our living High Priest in the heavenly sanctuary.`,
      nextAction: "Focus on Daniel 8–9 prophetic timeline exegesis in Bible Study Mode to solidify your sanctuary proofs."
    };
  };

  // Generate Weekly Study Recap handler
  const handleGenerateWeeklyRecap = async () => {
    setIsGeneratingRecap(true);
    let vaultVerses: any[] = [];
    let tracksProgress: any[] = [];
    try {
      try {
        const rawVault = localStorage.getItem("stba_memory_vault_list");
        if (rawVault) {
          vaultVerses = JSON.parse(rawVault);
        }
      } catch (e) {}

      if (!vaultVerses || vaultVerses.length === 0) {
        vaultVerses = [
          { reference: "2 Timothy 2:15", text: "Study to shew thyself approved...", trackLabel: "28 Fundamentals", recallsCount: 3, notes: "Baseline for personal theological discipline." },
          { reference: "Revelation 14:12", text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.", trackLabel: "Three Angels", recallsCount: 2, notes: "Climax statement summarizing remnant character." },
          { reference: "Daniel 8:14", text: "Unto two thousand and three hundred days; then shall the sanctuary be cleansed.", trackLabel: "Sanctuary Doctrine", recallsCount: 4, notes: "Investigative judgment prophetic timeline." },
          { reference: "Exodus 20:8-11", text: "Remember the sabbath day, to keep it holy...", trackLabel: "Sabbath School", recallsCount: 3, notes: "Creation memorial in Decalogue." },
          { reference: "Hebrews 8:1-2", text: "We have such an high priest...", trackLabel: "Sanctuary Doctrine", recallsCount: 3, notes: "Christ minister of the true tabernacle." }
        ];
      }

      try {
        const rawTracks = localStorage.getItem("stba_tracks_progress");
        if (rawTracks) {
          tracksProgress = JSON.parse(rawTracks);
        }
      } catch (e) {}

      if (!tracksProgress || tracksProgress.length === 0) {
        tracksProgress = [
          { title: "28 Fundamental Beliefs", completed: Math.max(completedVerseIds.length, 6), total: 26 },
          { title: "Three Angels' Messages", completed: 4, total: 12 },
          { title: "Sanctuary Doctrine", completed: 3, total: 9 }
        ];
      }

      const recentPayload = recentStudiesList.map(s => `${s.reference} (${s.topic})`);
      const statsSnapshot = aggregateUserStats(user, completedVerseIds, favoriteScriptures);

      const response = await fetch("/api/study/weekly-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          vaultVerses,
          tracksProgress,
          completedCount: completedVerseIds.length,
          recentStudies: recentPayload,
          streakDays: statsSnapshot.currentStreakDays,
          totalMinutes: statsSnapshot.totalStudyMinutes,
          overallMastery: statsSnapshot.overallMasteryScore
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklyRecap(data);
        setShowRecapModal(true);
        try {
          localStorage.setItem("stba_latest_weekly_recap", JSON.stringify(data));
        } catch (e) {}
      } else {
        throw new Error("Weekly recap endpoint returned error");
      }
    } catch (err) {
      console.warn("Failed to generate AI weekly recap, engaging local engine:", err);
      const localFallback = createLocalWeeklyRecapFallback(userName, completedVerseIds.length, vaultVerses, tracksProgress);
      setWeeklyRecap(localFallback);
      setShowRecapModal(true);
      try {
        localStorage.setItem("stba_latest_weekly_recap", JSON.stringify(localFallback));
      } catch (e) {}
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  const handleSaveRecapToNotebook = () => {
    if (!weeklyRecap) return;
    const content = `# ${weeklyRecap.title} (${weeklyRecap.period})\n\n` +
      `**Overview:** ${weeklyRecap.overview}\n\n` +
      `## Mastered Concepts\n` +
      (weeklyRecap.masteredConcepts || []).map((m: any) => `### ${m.concept} (${m.masteryTier || "Mastered"})\n* **Scriptures:** ${(m.keyScriptures || []).join(", ")}\n* ${m.summary}`).join("\n\n") +
      `\n\n## Suggested Areas for Review\n` +
      (weeklyRecap.suggestedReviewAreas || []).map((r: any) => `### ${r.topic}\n* **Anchor:** ${r.scriptureAnchor}\n* **Why Review:** ${r.reasonForReview}\n* **Action:** ${r.suggestedAction}`).join("\n\n") +
      `\n\n## Pastoral Encouragement\n> "${weeklyRecap.pastoralEncouragement}"\n— Elder Stephen`;

    saveResponseAsNewNote({
      title: `Weekly Study Recap: ${weeklyRecap.period}`,
      content,
      summary: weeklyRecap.overview?.slice(0, 240) + "...",
      category: "theology",
      scriptureTags: ["Weekly Recap", "Memory Vault", "Tracks"]
    });

    setRecapSavedToast(true);
    setTimeout(() => setRecapSavedToast(false), 3000);
  };

  const handleCopyRecap = () => {
    if (!weeklyRecap) return;
    const text = `=== WEEKLY STUDY RECAP (${weeklyRecap.period}) ===\n\n` +
      `Overview: ${weeklyRecap.overview}\n\n` +
      `--- MASTERED CONCEPTS ---\n` +
      (weeklyRecap.masteredConcepts || []).map((m: any) => `* ${m.concept}: ${m.summary} (${(m.keyScriptures || []).join(", ")})`).join("\n") +
      `\n\n--- SUGGESTED AREAS FOR REVIEW ---\n` +
      (weeklyRecap.suggestedReviewAreas || []).map((r: any) => `* ${r.topic}: ${r.reasonForReview} (Action: ${r.suggestedAction})`).join("\n") +
      `\n\nPastoral Word: "${weeklyRecap.pastoralEncouragement}"`;

    navigator.clipboard.writeText(text);
    setRecapCopiedToast(true);
    setTimeout(() => setRecapCopiedToast(false), 3000);
  };

  // Ask STBA AI Teacher state & Dynamic Preloaded Answers Lineup
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [activePromptTopic, setActivePromptTopic] = useState("");
  const [preloadedAnswers, setPreloadedAnswers] = useState<PreloadedAnswer[]>(() =>
    getStoredPreloadedAnswers()
  );
  const [activeAnswerItem, setActiveAnswerItem] = useState<PreloadedAnswer | null>(null);
  const [isExegesisControlsCollapsed, setIsExegesisControlsCollapsed] = useState(false);

  // General Assistant state (adaptive Ask AI on Dashboard)
  const [showGeneralAssistantModal, setShowGeneralAssistantModal] = useState(false);
  const [generalAssistantInput, setGeneralAssistantInput] = useState("");
  const [generalAssistantResponse, setGeneralAssistantResponse] = useState<string | null>(null);
  const [isGeneralAssistantLoading, setIsGeneralAssistantLoading] = useState(false);

  // Read aloud audio player for AI answers
  const speechReader = useSpeechReader();

  // Modals state
  const [showFeaturedVideoModal, setShowFeaturedVideoModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null);
  const [showHelpCenterPanel, setShowHelpCenterPanel] = useState(false);
  const [helpCenterInitialView, setHelpCenterInitialView] = useState<"overview" | "ticket" | "faq">("overview");

  // Ticket Form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  // Voice dictation simulation
  const [isListening, setIsListening] = useState(false);

  // Listener for custom events from Sidebar/TopBar
  useEffect(() => {
    const handleFaq = () => setShowFaqModal(true);
    const handleTicket = () => {
      setHelpCenterInitialView("ticket");
      setShowHelpCenterPanel(true);
    };
    const handleSupport = () => {
      setHelpCenterInitialView("overview");
      setShowHelpCenterPanel(true);
    };
    const handleHelpCenter = () => {
      setHelpCenterInitialView("overview");
      setShowHelpCenterPanel(true);
    };

    window.addEventListener("open-stba-faq-modal", handleFaq);
    window.addEventListener("open-stba-ticket-modal", handleTicket);
    window.addEventListener("open-stba-support-modal", handleSupport);
    window.addEventListener("open-stba-help-center-modal", handleHelpCenter);

    return () => {
      window.removeEventListener("open-stba-faq-modal", handleFaq);
      window.removeEventListener("open-stba-ticket-modal", handleTicket);
      window.removeEventListener("open-stba-support-modal", handleSupport);
      window.removeEventListener("open-stba-help-center-modal", handleHelpCenter);
    };
  }, []);

  // Select and immediately view a pre-loaded answer with zero lag
  const handleSelectPreloadedAnswer = (item: PreloadedAnswer) => {
    speechReader.stop();
    setAiPrompt(item.question);
    setActivePromptTopic(item.question);
    setAiResponse(item.answer);
    setActiveAnswerItem(item);
    setShowAiModal(true);
    setIsAiLoading(false);
  };

  // Handle Ask STBA AI submission & dynamically take 1 of 4 preloaded spots
  const handleAskAi = async (customQuestion?: string) => {
    const question = customQuestion || aiPrompt;
    if (!question.trim()) return;

    speechReader.stop();

    // Check if already pre-loaded
    const existing = preloadedAnswers.find(
      (p) => p.question.toLowerCase().trim() === question.toLowerCase().trim()
    );
    if (existing) {
      handleSelectPreloadedAnswer(existing);
      return;
    }

    setActivePromptTopic(question);
    setIsAiLoading(true);
    setShowAiModal(true);
    setAiResponse(null);
    setActiveAnswerItem(null);

    try {
      const response = await callElderStephen({
        currentMode: "Explain",
        noteTitle: question,
        user_explanation: question,
        userAction: `Generate a comprehensive exegesis for: "${question}". Follow the exact 6-section commentary structure identical to our loaded answers:
### Study Summary
(Comprehensive overview of the passage or theme incorporating Ellen White references and SDA context)

### 1. Context & Scriptural Foundation
* Historical Setting: ...
* Primary Scripture Passage: ...
* Foundation Cross-References: ...

### 2. Key Terms & Original Language
* **Term (transliteration)** — Definition and biblical usage

### 3. Exegetical Insight
* Key doctrinal insights connecting Scripture with Scripture

### 4. Spirit of Prophecy (Ellen White Insights)
* [Book Title, p. XX]:
> “[Exact Ellen White quote]”
* [Second Book Title, p. XX]:
> “[Second Ellen White quote]”

### 5. Theological Meaning (SDA Hermeneutics)
* Core SDA doctrines (Sanctuary, Law, Sabbath, or Three Angels' Messages)

### 6. Application & Discussion
* Devotional application and reflection question`,
        historyLog: [{ role: "user", text: question }]
      });
      const fullAnswer = response?.text || "No response received.";
      setAiResponse(fullAnswer);

      // Automatically take one of the four pre-loaded spots in the lineup
      const updated = savePreloadedAnswer(question, fullAnswer);
      setPreloadedAnswers(updated);
      const savedItem =
        updated.find(
          (u) => u.question.toLowerCase().trim() === question.toLowerCase().trim()
        ) || updated[0];
      setActiveAnswerItem(savedItem);
    } catch (err) {
      const fallbackAnswer = `### Study Summary
Scripture interprets Scripture under the guidance of the Holy Spirit (*2 Timothy 3:16–17*). In exploring ${question}, Christ remains the focal point of all doctrine and prophecy. As Ellen White writes in Steps to Christ, p. 62: “If you give yourself to Him, and accept Him as your Saviour, then, sinful as your life may have been, for His sake you are accounted righteous.”

### 1. Context & Scriptural Foundation
* Primary Hermeneutic: *Isaiah 28:10* — “For precept must be upon precept, precept upon precept; line upon line, line upon line; here a little, and there a little.”
* Foundational Scripture: *John 5:39* — “Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me.”
* Covenant Context: *2 Timothy 2:15* — “Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.”

### 2. Key Terms & Original Language
* Theopneustos (θεόπνευστος) — God-breathed or divinely inspired (*2 Timothy 3:16*).
* Hermeneuein (ἑρμηνεύειν) — To interpret, translate, or explain according to the divine pattern.

### 3. Exegetical Insight
* Line upon Line: Every doctrine must be weighed against the totality of biblical testimony.
* The Living Word: The Scriptures are living and powerful (*Hebrews 4:12*), designed not for mere academic curiosity but for character transformation.

### 4. Spirit of Prophecy (Ellen White Insights)
* Steps to Christ, p. 90:
> “The Word of God, like the character of its divine Author, presents mysteries that can never be fully comprehended by finite beings... But we need not on this account doubt God's Word because we cannot understand the mysteries of His providences.”
* The Great Controversy, p. 599:
> “The first and highest duty of every rational being is to learn from the Scriptures what is truth, and then to walk in the light and encourage others to follow his example.”

### 5. Theological Meaning (SDA Hermeneutics)
* The Seventh-day Adventist movement was founded on prayerful immersion in Scripture, discovering the Heavenly Sanctuary truth, the perpetuity of the Decalogue, and the Blessed Hope of the Second Coming.

### 6. Application & Discussion
* Study this passage with an open heart in quiet reflection.
* Click any scripture button above or Start Lesson to explore this topic interactively in Bible Study Mode!`;
      setAiResponse(fallbackAnswer);
      const updated = savePreloadedAnswer(question, fallbackAnswer);
      setPreloadedAnswers(updated);
      setActiveAnswerItem(updated[0]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Start Lesson Bridge to Bible Study Mode
  const handleStartBibleStudyLesson = (targetRef?: string, targetTopic?: string) => {
    speechReader.stop();
    setShowAiModal(false);
    setShowGeneralAssistantModal(false);

    const finalRef = targetRef || activeAnswerItem?.reference || "Romans 8:1-4";
    const finalTopic = targetTopic || activeAnswerItem?.topic || activePromptTopic || "Scripture Exegesis";

    localStorage.setItem("stba_pending_search_ref", finalRef);
    localStorage.setItem("stba_pending_search_topic", finalTopic);
    localStorage.setItem("stba_pending_search_tool", "stephen");

    navigate(`/stba?ref=${encodeURIComponent(finalRef)}&topic=${encodeURIComponent(finalTopic)}&tool=stephen`);
  };

  // Download beautifully formatted scriptural exegesis record as PDF
  const handleDownloadPDF = () => {
    if (!aiResponse) return;
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const marginX = 14;
      const contentWidth = 182; // 210 - 28
      let y = 18;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > 272) {
          doc.addPage();
          drawHeaderAndFooter();
          y = 18;
        }
      };

      const drawHeaderAndFooter = () => {
        // Top accent bar
        doc.setDrawColor(201, 151, 58); // Gold accent
        doc.setLineWidth(0.6);
        doc.line(marginX, 8, marginX + contentWidth, 8);

        // Bottom footer bar
        doc.setDrawColor(220, 215, 200);
        doc.setLineWidth(0.3);
        doc.line(marginX, 282, marginX + contentWidth, 282);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(130, 130, 130);
        doc.text(
          "STUDY TO BE APPROVED (STBA) • ELDER STEPHEN EXEGESIS GUIDE • 2 TIMOTHY 2:15",
          marginX,
          286
        );

        const pageNumStr = `Page ${doc.getNumberOfPages()}`;
        doc.text(pageNumStr, marginX + contentWidth - doc.getTextWidth(pageNumStr), 286);
      };

      // Draw header and footer for page 1
      drawHeaderAndFooter();

      // 1. Header Card
      doc.setFillColor(250, 248, 243);
      doc.setDrawColor(201, 151, 58);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, y, contentWidth, 34, 2.5, 2.5, "FD");

      doc.setFont("times", "bold");
      doc.setFontSize(17);
      doc.setTextColor(10, 28, 55); // Deep Navy
      doc.text("Study To Be Approved (STBA)", marginX + 8, y + 9);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 135, 45); // Gold
      doc.text("ELDER STEPHEN EXEGESIS & BEREAN SCRIPTURE GUIDE", marginX + 8, y + 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      const topicLine = doc.splitTextToSize(`Study Query: "${activePromptTopic}"`, contentWidth - 16);
      doc.text(topicLine, marginX + 8, y + 23);

      const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: "long" });
      doc.text(`Hermeneutic: Sola Scriptura & Historic SDA • Date: ${dateStr}`, marginX + 8, y + 29);

      y += 40;

      // Clean and split lines of aiResponse
      const rawLines = aiResponse.split("\n");

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();
        if (!line) {
          y += 3;
          continue;
        }

        // Section Headers: ### Title or ## Title
        if (line.startsWith("###") || line.startsWith("##")) {
          const headingText = line.replace(/^#+\s*/, "").trim();
          checkPageOverflow(14);
          y += 3;
          doc.setFillColor(243, 246, 252);
          doc.setDrawColor(180, 135, 45);
          doc.setLineWidth(0.3);
          doc.roundedRect(marginX, y, contentWidth, 7.5, 1, 1, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(10, 28, 55);
          doc.text(headingText, marginX + 4, y + 5.2);
          y += 10.5;
          continue;
        }

        // Ellen White / Spirit of Prophecy quotes: > "..."
        if (line.startsWith(">")) {
          const quoteContent = line.replace(/^>\s*/, "").replace(/^["“]|["”]$/g, "").trim();
          doc.setFont("times", "italic");
          doc.setFontSize(9.5);
          doc.setTextColor(45, 45, 45);

          const wrappedQuote = doc.splitTextToSize(`“${quoteContent}”`, contentWidth - 16);
          const quoteHeight = wrappedQuote.length * 4.5 + 5;
          checkPageOverflow(quoteHeight);

          // Draw light gold tint box with left accent line
          doc.setFillColor(254, 252, 247);
          doc.setDrawColor(201, 151, 58);
          doc.setLineWidth(0.8);
          doc.rect(marginX + 2, y, 1.5, quoteHeight, "F");
          doc.setLineWidth(0.2);
          doc.setDrawColor(230, 220, 200);
          doc.rect(marginX + 3.5, y, contentWidth - 5.5, quoteHeight, "FD");

          wrappedQuote.forEach((qLine: string, qIdx: number) => {
            doc.text(qLine, marginX + 7, y + 4.5 + qIdx * 4.5);
          });

          y += quoteHeight + 3;
          continue;
        }

        // Bullet points: * or -
        if (line.startsWith("*") || line.startsWith("-")) {
          const bulletText = line.replace(/^[-*]\s*/, "").replace(/\*\*([^*]+)\*\*/g, "$1").trim();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40);

          const wrappedBullet = doc.splitTextToSize(bulletText, contentWidth - 10);
          checkPageOverflow(wrappedBullet.length * 4.2 + 2);

          doc.setFillColor(201, 151, 58);
          doc.circle(marginX + 3, y + 2.5, 0.7, "F");

          wrappedBullet.forEach((bLine: string, bIdx: number) => {
            doc.text(bLine, marginX + 7, y + 3.2 + bIdx * 4.2);
          });

          y += wrappedBullet.length * 4.2 + 2;
          continue;
        }

        // Standard body paragraph
        const cleanPara = line.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);

        const wrappedPara = doc.splitTextToSize(cleanPara, contentWidth);
        checkPageOverflow(wrappedPara.length * 4.4 + 2);

        wrappedPara.forEach((pLine: string, pIdx: number) => {
          doc.text(pLine, marginX, y + 3.2 + pIdx * 4.4);
        });

        y += wrappedPara.length * 4.4 + 2;
      }

      const safeTitle = (activePromptTopic || "Exegesis")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 35);
      doc.save(`STBA-Exegesis-${safeTitle}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    }
  };

  // Download beautifully formatted scriptural exegesis record as Word Doc (.doc)
  const handleDownloadDoc = () => {
    if (!aiResponse) return;
    try {
      const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: "long" });

      const htmlBody = aiResponse
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "<br/>";
          if (trimmed.startsWith("###")) {
            return `<h3 style="color: #06162c; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 18px; margin-bottom: 6px; border-bottom: 1.5px solid #DFC57B; padding-bottom: 4px;">${trimmed.replace(/^###\s*/, "")}</h3>`;
          }
          if (trimmed.startsWith("##")) {
            return `<h2 style="color: #06162c; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 22px; margin-bottom: 8px;">${trimmed.replace(/^##\s*/, "")}</h2>`;
          }
          if (trimmed.startsWith(">")) {
            return `<blockquote style="background-color: #fdfaf3; border-left: 4px solid #C9973A; padding: 10px 14px; margin: 8px 0; font-style: italic; color: #2c2518; font-family: 'Georgia', serif;">${trimmed.replace(/^>\s*/, "")}</blockquote>`;
          }
          if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
            const content = trimmed.replace(/^[-*]\s*/, "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
            return `<li style="margin-bottom: 5px; color: #222; font-family: 'Segoe UI', Arial, sans-serif;">${content}</li>`;
          }
          const formatted = trimmed
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>");
          return `<p style="margin: 6px 0; line-height: 1.6; color: #222; font-family: 'Georgia', serif; font-size: 11pt;">${formatted}</p>`;
        })
        .join("\n");

      const docContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>STBA Exegesis Guide - ${activePromptTopic}</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 30px; color: #222; }
    h1 { color: #06162c; font-family: 'Segoe UI', Arial, sans-serif; font-size: 20pt; margin-bottom: 2px; }
    .subtitle { color: #C9973A; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; margin-bottom: 15px; }
    .meta-box { background: #f8f9fa; border: 1px solid #ddd; padding: 12px; margin-bottom: 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; }
    .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 8pt; color: #666; font-family: 'Segoe UI', Arial, sans-serif; }
  </style>
</head>
<body>
  <h1>Study To Be Approved (STBA)</h1>
  <div class="subtitle">ELDER STEPHEN EXEGESIS & BEREAN SCRIPTURE GUIDE</div>
  <div class="meta-box">
    <strong>Study Query:</strong> "${activePromptTopic}"<br/>
    ${activeAnswerItem?.reference ? `<strong>Primary Reference:</strong> ${activeAnswerItem.reference}<br/>` : ""}
    <strong>Date Generated:</strong> ${dateStr}<br/>
    <strong>Hermeneutic Framework:</strong> Sola Scriptura & Historic Seventh-day Adventist Hermeneutics
  </div>
  <div>
    ${htmlBody}
  </div>
  <div class="footer">
    STBA Scriptural Mastery System • 2 Timothy 2:15 • Retain Scripture • Understand SDA Doctrine • Apply Truth Faithfully
  </div>
</body>
</html>`;

      const blob = new Blob(["\ufeff", docContent], { type: "application/msword;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = (activePromptTopic || "Exegesis")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 35);
      link.href = url;
      link.download = `STBA-Exegesis-${safeTitle}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export Word Document:", err);
    }
  };

  // Adaptive Ask AI Button handler on the Dashboard (General Assistant)
  const handleAskAiButton = () => {
    if (aiPrompt.trim()) {
      handleAskAi(aiPrompt);
    } else {
      setShowGeneralAssistantModal(true);
    }
  };

  // General Assistant handler inside the General Assistant modal
  const handleAskGeneralAssistant = async (queryText?: string) => {
    const q = queryText || generalAssistantInput;
    if (!q.trim()) return;

    setIsGeneralAssistantLoading(true);
    setGeneralAssistantResponse(null);

    try {
      const response = await callElderStephen({
        currentMode: "Explain",
        noteTitle: `General Assistant Guidance: ${q}`,
        user_explanation: `The user is on the Dashboard and needs general assistance or guidance: ${q}`,
        historyLog: [{ role: "user", text: q }]
      });
      const text = response?.text || "I am here to guide your study journey in Scripture.";
      setGeneralAssistantResponse(text);

      // Also register this in the preloaded lineup for the user!
      const updated = savePreloadedAnswer(q, text);
      setPreloadedAnswers(updated);
    } catch (err) {
      setGeneralAssistantResponse(
        `### STBA General Guidance\n\nWelcome! Here are the primary resources ready for your study:\n- **Bible Study Mode**: For deep, verse-by-verse exegesis with the Parallel Reader.\n- **Doctrine Navigator**: To explore the 28 Fundamental Doctrines of the Seventh-day Adventist Church.\n- **Active Recall**: For mastering Scripture verses through spaced repetition.\n- **Teach It Studio**: To organize lessons and prepare to instruct others.\n\nType any Scripture or question in the box above to study immediately.`
      );
    } finally {
      setIsGeneralAssistantLoading(false);
    }
  };

  // 7 Study Modes Metadata
  const studyModes = [
    {
      id: "bible-study",
      title: "Bible Study Mode",
      icon: BookOpenText,
      tagline: "Deep study. Guided understanding.",
      path: "/stba"
    },
    {
      id: "study-tracks",
      title: "Study Tracks Mode",
      icon: RoadTrackIcon,
      tagline: "A structured path to mastery.",
      path: "/tracks"
    },
    {
      id: "doctrine-navigator",
      title: "Doctrine Navigator Mode",
      icon: DoctrineNodesIcon,
      tagline: "See how truth connects.",
      path: "/doctrine"
    },
    {
      id: "active-recall",
      title: "Active Recall Mode",
      icon: Brain,
      tagline: "Keep what you learn.",
      path: "/recall"
    },
    {
      id: "teach-it",
      title: "Teach It Mode",
      icon: GraduationCap,
      tagline: "Can you teach what you learned?",
      path: "/teach"
    },
    {
      id: "notebook",
      title: "Notebook Mode",
      icon: NotebookText,
      tagline: "Your personal theological archive.",
      path: "/notebook"
    },
    {
      id: "sabbath-school",
      title: "Sabbath School Mode",
      icon: CalendarDays,
      tagline: "Prepare deeper. Study smarter.",
      path: "/sabbath-school"
    }
  ];

  const [showFullNoteContent, setShowFullNoteContent] = useState<boolean>(false);

  // Helper to map and enrich raw StudyNote objects with clean summary & auto-extracted scriptures
  const mapStudyNoteToEntry = (n: any) => {
    const contentScriptures = extractScripturesFromText((n.content || "") + " " + (n.title || ""));
    const combinedVerses = Array.from(
      new Set([...(n.scriptureTags || []), ...contentScriptures])
    ).filter(Boolean);

    const summary = cleanNoteSummary(n.summary, n.content);

    return {
      id: n.id,
      title: n.title || "Untitled Note",
      category: n.category
        ? n.category.charAt(0).toUpperCase() + n.category.slice(1).replace(/-/g, " ")
        : "Theology",
      date: formatNoteDate(n.updatedAt || n.createdAt),
      summary,
      preview: summary,
      content: n.content || "",
      verses: combinedVerses
    };
  };

  // Dynamically load all saved notes from Notebook storage, merged with default entries
  const [allNotebookEntries, setAllNotebookEntries] = useState(() => {
    try {
      const stored = loadNotes();
      if (stored && stored.length > 0) {
        const mapped = stored.map(mapStudyNoteToEntry);
        const existingTitles = new Set(mapped.map((m) => m.title.toLowerCase()));
        const additionalDefaults = DEFAULT_NOTEBOOK_ENTRIES.filter(
          (d) => !existingTitles.has(d.title.toLowerCase())
        );
        return [...mapped, ...additionalDefaults];
      }
    } catch (e) {
      console.warn("Failed loading notebook notes in Dashboard", e);
    }
    return DEFAULT_NOTEBOOK_ENTRIES;
  });

  useEffect(() => {
    const refreshNotes = () => {
      try {
        const stored = loadNotes();
        if (stored && stored.length > 0) {
          const mapped = stored.map(mapStudyNoteToEntry);
          const existingTitles = new Set(mapped.map((m) => m.title.toLowerCase()));
          const additionalDefaults = DEFAULT_NOTEBOOK_ENTRIES.filter(
            (d) => !existingTitles.has(d.title.toLowerCase())
          );
          setAllNotebookEntries([...mapped, ...additionalDefaults]);
        }
      } catch (e) {
        console.warn("Error refreshing notes in Dashboard", e);
      }
    };

    window.addEventListener("storage", refreshNotes);
    window.addEventListener("stba_notebook_updated", refreshNotes);
    return () => {
      window.removeEventListener("storage", refreshNotes);
      window.removeEventListener("stba_notebook_updated", refreshNotes);
    };
  }, []);

  // Backward-compatible alias for legacy references
  const notebookEntries = allNotebookEntries;

  return (
    <div
      id="dashboard-full-container"
      className="w-full text-left font-sans text-stone-100 select-none pb-16 space-y-6 sm:space-y-8 animate-in fade-in duration-300"
    >
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: UNIFIED ELDER STEVEN'S CORNER & FEATURED TEACHING PANEL   */}
      {/* ========================================================================= */}
      <section
        id="elder-stevens-corner-hero"
        className="relative rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-[#030914] via-[#081932] to-[#040D1E] border-2 border-[#DFC57B]/75 hover:border-[#F3CF65] p-5 sm:p-7 md:p-8 lg:p-9 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(223,197,123,0.2)] transition-all duration-300 group"
      >
        {/* Subtle radial golden glow accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F3CF65]/12 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-[#DFC57B]/10 blur-3xl pointer-events-none" />

        {/* Top & Bottom Golden Glint Border Accent Flares */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-[2px] bg-gradient-to-r from-transparent via-[#FFF2A8] to-transparent shadow-[0_0_12px_#F3CF65] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-[2px] bg-gradient-to-r from-transparent via-[#FFF2A8] to-transparent shadow-[0_0_12px_#F3CF65] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* LEFT & CENTER: ELDER STEVEN PORTRAIT & GREETING / THEOLOGICAL QUOTE */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6 md:gap-8 text-center sm:text-left">
            {/* Elder Steven Portrait Avatar with gold ring & ambient backlight */}
            <div className="relative shrink-0 group/avatar">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-2xl md:rounded-[22px] p-0.5 bg-gradient-to-br from-[#F3CF65] via-[#DFC57B] to-[#0d3060] shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(223,197,123,0.25)] overflow-hidden ring-2 ring-[#DFC57B]/40 group-hover:ring-[#F3CF65]">
                <img
                  src={ELDER_STEVEN_PORTRAIT_URL}
                  alt="Elder Steven - Senior Theological AI Mentor"
                  className="w-full h-full object-cover rounded-[20px] transition-transform duration-500 group-hover/avatar:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-gradient-to-r from-[#F3CF65] to-[#E5B842] text-[#06162c] text-[10px] font-mono font-black rounded-md uppercase tracking-wider shadow-md">
                AI Mentor
              </span>
            </div>

            {/* Typography & Golden Motto */}
            <div className="space-y-2 max-w-xl">
              {/* Eyebrow */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#DFC57B]" />
                <span className="text-[11px] sm:text-xs font-mono font-black uppercase tracking-[0.22em] text-[#DFC57B]">
                  Elder Steven's Corner
                </span>
                <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#DFC57B]" />
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight">
                Understanding Scripture{" "}
                <span className="block sm:inline lg:block text-[#F3CF65] font-serif">
                  Transforms Lives
                </span>
              </h1>

              {/* Doctrinal Hermeneutic Quote */}
              <blockquote className="elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] italic text-xs sm:text-sm md:text-[14.5px] text-stone-200/90 leading-relaxed border-l-2 border-[#DFC57B]/60 pl-3.5 my-2 antialiased">
                “Understanding Scripture requires more than reading the words. It requires
                allowing Scripture to interpret Scripture.”
              </blockquote>

              <div className="text-xs sm:text-sm font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] italic font-bold text-[#DFC57B] text-right sm:text-left pr-2 antialiased">
                — Elder Steven
              </div>
            </div>
          </div>

          {/* RIGHT: FEATURED TEACHING HIGHLIGHT CARD */}
          <div className="lg:col-span-4 w-full flex justify-center lg:justify-end">
            <div
              id="featured-teaching-card"
              className="p-4 sm:p-5 rounded-2xl bg-[#040C1A]/90 border border-[#DFC57B]/40 hover:border-[#F3CF65]/80 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-3.5 relative group/card backdrop-blur-md w-full max-w-sm"
            >
              {/* Card Tag */}
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono font-black uppercase tracking-widest text-[#DFC57B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFC57B]" />
                  <span>Featured Teaching</span>
                </span>
                <span className="text-[10px] font-mono text-stone-400">Weekly Release</span>
              </div>

              {/* Video/Bible Thumbnail with Play Button */}
              <div
                onClick={() => setShowFeaturedVideoModal(true)}
                className="relative h-32 sm:h-36 rounded-xl overflow-hidden cursor-pointer group/thumb shadow-inner border border-[#DFC57B]/25"
              >
                <img
                  src={FEATURED_COVENANT_IMAGE_URL}
                  alt="The New Covenant Biblical Teaching"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#E5B842] to-[#F3CF65] text-[#06162c] flex items-center justify-center shadow-lg transform group-hover/thumb:scale-110 transition-transform">
                    <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Action CTA */}
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover/card:text-[#F3CF65] transition-colors leading-snug">
                  The New Covenant — God's Everlasting Promise
                </h3>
                <p className="text-[11px] text-stone-300 font-sans line-clamp-1">
                  Jeremiah 31:31–34 & Hebrews 8. The law written in the heart by grace.
                </p>
              </div>

              <button
                onClick={() => setShowFeaturedVideoModal(true)}
                className="w-full py-2.5 px-4 rounded-xl gold-metallic-btn font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Watch Teaching</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. QUICK ACCESS STRIP (PREMIUM CONCEPT-ART REDESIGN) */}
      {/* ========================================================================= */}
      <section
        id="quick-access-bar"
        className="mt-3.5 sm:mt-4 lg:mt-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#06162c]/95 via-[#081e3a]/90 to-[#06162c]/95 border border-[#DFC57B]/40 p-3.5 sm:px-6 sm:py-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden group/bar"
      >
        {/* Subtle Ambient Gold Sheen on Bar */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DFC57B]/5 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Left: Lightning Icon & Typography with Concept-Art Styling */}
        <div className="flex items-center gap-3.5 shrink-0 z-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0e274a] via-[#091b35] to-[#040e1c] border border-[#DFC57B]/70 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,242,168,0.3)] flex items-center justify-center text-[#F3CF65] shrink-0">
            <Zap className="w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[2.2] fill-[#F3CF65]/15 text-[#F3CF65] drop-shadow-[0_0_8px_rgba(243,207,101,0.6)]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#DFC57B] tracking-wide leading-tight drop-shadow-xs">
              Quick Access
            </h3>
            <p className="text-xs text-sky-200/80 font-sans">
              Get what you need, when you need it.
            </p>
          </div>
        </div>

        {/* Center: Horizontally Centered Extended Action Buttons with Refined #DFC57B Gold Trim */}
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 z-10">
          {/* FAQs Button */}
          <button
            onClick={() => setShowFaqModal(true)}
            className="w-full sm:w-auto min-w-[210px] md:min-w-[240px] flex items-center justify-between gap-3.5 px-4.5 py-3 rounded-2xl bg-[#06162c]/75 hover:bg-[#0d3060]/80 border border-[#DFC57B] hover:border-[#F3CF65] text-stone-200 hover:text-white transition-all duration-300 ease-out cursor-pointer group text-left shadow-md hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(223,197,123,0.3)] active:translate-y-0 active:scale-[0.99]"
            title="Frequently Asked Questions"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e274a] via-[#091b35] to-[#040e1c] border border-[#DFC57B]/70 group-hover:border-[#F3CF65] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,242,168,0.25)] flex items-center justify-center text-[#F3CF65] group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_14px_rgba(243,207,101,0.4)] shrink-0">
                <HelpCircle className="w-5 h-5 stroke-[2.2] drop-shadow-[0_0_6px_rgba(223,197,123,0.5)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs sm:text-sm text-white tracking-wide">
                  FAQs
                </span>
                <span className="text-[11px] font-sans text-stone-300/90">
                  Get answers quickly
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg bg-[#040e1c]/60 border border-[#DFC57B]/30 group-hover:border-[#DFC57B] flex items-center justify-center transition-all duration-300 shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-[#DFC57B] group-hover:translate-x-0.5 group-hover:text-white transition-all duration-300" />
            </div>
          </button>

          {/* Zoom Live Bible Study Link */}
          <a
            id="zoom-bible-study-link"
            href="https://us06web.zoom.us/j/2345380933?pwd=NXl2U3FueGljd2NJTTRNRE1UMlpCQT09"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[210px] md:min-w-[240px] flex items-center justify-between gap-3.5 px-4.5 py-3 rounded-2xl bg-[#06162c]/75 hover:bg-[#0d3060]/80 border border-[#DFC57B] hover:border-[#F3CF65] text-stone-200 hover:text-white transition-all duration-300 ease-out cursor-pointer group text-left shadow-md hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(223,197,123,0.3)] active:translate-y-0 active:scale-[0.99] no-underline"
            title="Join Live Zoom Bible Study"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e274a] via-[#091b35] to-[#040e1c] border border-[#DFC57B]/70 group-hover:border-[#F3CF65] shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,242,168,0.25)] flex items-center justify-center text-[#F3CF65] group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_14px_rgba(243,207,101,0.4)] shrink-0">
                <Video className="w-5 h-5 stroke-[2.2] drop-shadow-[0_0_6px_rgba(223,197,123,0.5)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs sm:text-sm text-white tracking-wide">
                  Zoom Link
                </span>
                <span className="text-[11px] font-sans text-stone-300/90">
                  Join the live Bible study
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg bg-[#040e1c]/60 border border-[#DFC57B]/30 group-hover:border-[#DFC57B] flex items-center justify-center transition-all duration-300 shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-[#DFC57B] group-hover:translate-x-0.5 group-hover:text-white transition-all duration-300" />
            </div>
          </a>
        </div>

        {/* Right Balance Spacer for Large Screens */}
        <div className="hidden lg:block w-[180px] shrink-0 pointer-events-none" />
      </section>

      {/* ========================================================================= */}
      {/* 3. CHOOSE YOUR STUDY EXPERIENCE (7 STUDY MODES) */}
      {/* ========================================================================= */}
      <section id="choose-study-experience-section" className="pt-2 sm:pt-3 lg:pt-3.5 space-y-4 sm:space-y-5">
        {/* Section Header: Visible at a Glance with Natural Proximity */}
        <div className="w-full flex flex-col items-center justify-center text-center space-y-1 sm:space-y-1.5 pb-0.5 px-4 -translate-y-[10px]">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight drop-shadow-sm text-center">
            Choose Your Study Experience
          </h2>
          <p className="text-xs sm:text-sm lg:text-[15px] text-stone-200/90 font-sans max-w-2xl mx-auto font-medium leading-relaxed text-center">
            Seven powerful ways to study, understand, remember, and teach scripture
          </p>
        </div>

        {/* 7 Modes Cards Grid - Matching Study Modes Icons Concept-Art Style Exactly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
          {studyModes.map((mode) => {
            const Icon = mode.icon;
            const isBibleStudy = mode.id === "bible-study";
            return (
              <div
                key={mode.id}
                onClick={() => navigate(mode.path)}
                className="col-span-1 p-4 sm:p-4.5 rounded-2xl bg-gradient-to-b from-[#08172c]/95 via-[#051121]/95 to-[#030914]/95 border border-[#152a4a] hover:border-[#DFC57B]/70 shadow-[0_6px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,242,168,0.06)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.7),0_0_20px_rgba(223,197,123,0.22)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center min-h-[195px] sm:min-h-[210px] group relative overflow-hidden"
              >
                {/* Floating Prominent Concept Icon */}
                <div className="pt-1 flex items-center justify-center">
                  <Icon className="w-9 h-9 sm:w-10 sm:h-10 text-[#F3CF65] drop-shadow-[0_0_8px_rgba(243,207,101,0.5)] group-hover:scale-110 transition-transform duration-300 stroke-[1.85]" />
                </div>

                {/* Mode Title & Tagline */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-center py-2">
                  <h3 className="font-serif font-bold text-[13px] sm:text-[14px] text-white tracking-tight leading-snug group-hover:text-[#F3CF65] transition-colors">
                    {mode.title}
                  </h3>

                  <p
                    className={`text-[11px] font-sans leading-relaxed max-w-[130px] mx-auto ${
                      isBibleStudy
                        ? "text-[#DFC57B] font-medium"
                        : "text-stone-300/85 font-normal"
                    }`}
                  >
                    {mode.tagline}
                  </p>
                </div>

                {/* Bottom Gold Indicator Arrow */}
                <div className="pt-1 flex justify-center text-[#DFC57B] group-hover:text-[#F3CF65] transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            );
          })}

          {/* 8th Slot (Mobile Layout Only): Help Center Card */}
          <div
            id="mobile-help-center-card"
            onClick={() => {
              setHelpCenterInitialView("overview");
              setShowHelpCenterPanel(true);
            }}
            className="col-span-1 p-4 sm:p-4.5 rounded-2xl bg-gradient-to-b from-[#08172c]/95 via-[#051121]/95 to-[#030914]/95 border border-[#152a4a] hover:border-[#DFC57B]/70 shadow-[0_6px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,242,168,0.06)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.7),0_0_20px_rgba(223,197,123,0.22)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer flex sm:hidden flex-col items-center justify-between text-center min-h-[195px] sm:min-h-[210px] group relative overflow-hidden"
          >
            {/* Floating Prominent Concept Icon */}
            <div className="pt-1 flex items-center justify-center">
              <Headset className="w-9 h-9 sm:w-10 sm:h-10 text-[#F3CF65] drop-shadow-[0_0_8px_rgba(243,207,101,0.5)] group-hover:scale-110 transition-transform duration-300 stroke-[1.85]" />
            </div>

            {/* Mode Title & Tagline */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-center py-2">
              <h3 className="font-serif font-bold text-[13px] sm:text-[14px] text-white tracking-tight leading-snug group-hover:text-[#F3CF65] transition-colors">
                Help Center
              </h3>

              <p className="text-[11px] font-sans leading-relaxed max-w-[130px] mx-auto text-stone-300/85 font-normal">
                Need assistance? Report an issue.
              </p>
            </div>

            {/* Bottom Gold Indicator Arrow */}
            <div className="pt-1 flex justify-center text-[#DFC57B] group-hover:text-[#F3CF65] transition-colors">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* DAILY RECALL TARGET PROGRESS BAR */}
      <DailyGoalProgressBar />

      {/* ========================================================================= */}
      {/* 4. LOWER 3-COLUMN DASHBOARD MODULES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* ------------------------------------------------------------- */}
        {/* COLUMN 1 (4 Cols): LEARNING JOURNEY & MY NOTEBOOK */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* CARD A: YOUR SPIRITUAL LEARNING JOURNEY */}
          <div
            id="spiritual-learning-journey-card"
            className="flex-1 flex flex-col justify-between p-5 rounded-3xl glass-card border border-[#0d3060] shadow-xl sheen-overlay"
          >
            <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                  <span>Your Spiritual Learning Journey</span>
                </h3>
                <span className="text-[10px] font-mono text-[#F3CF65] font-semibold">
                  Progress Overview
                </span>
              </div>
            </div>

            {/* 4 Circular Gauge Progress Rings with smooth animations */}
            <div className="grid grid-cols-4 gap-2 my-auto py-2">
              {[
                { label: "Scripture Mastery", value: 72, color: "#F3CF65" },
                { label: "Doctrine Mastery", value: 68, color: "#2A9D8F" },
                { label: "Active Recall", value: 81, color: "#E76F51" },
                { label: "Teaching Confidence", value: 63, color: "#E9C46A" }
              ].map((item, idx) => {
                const radius = 22;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (item.value / 100) * circumference;

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1.5">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-14 h-14 -rotate-90">
                        {/* Background track */}
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke="#06162c"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        {/* Animated progress ring */}
                        <motion.circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke={item.color}
                          strokeWidth="4"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.2, delay: idx * 0.15, ease: "easeOut" }}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-serif font-bold text-xs text-white">
                        {item.value}%
                      </span>
                    </div>

                    <span className="text-[9.5px] font-sans text-stone-200 font-medium leading-tight line-clamp-2">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD B: MY NOTEBOOK */}
          <div
            id="dashboard-my-notebook-widget"
            className="flex-1 min-h-0 flex flex-col justify-between p-5 rounded-3xl glass-card border border-[#0d3060] shadow-xl sheen-overlay space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-[#0d3060] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E5B842]/20 text-[#F3CF65]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-white">My Notebook</h3>
                  <p className="text-[10px] text-stone-300 font-sans">
                    Your personal knowledge base
                  </p>
                </div>
              </div>

              <Link
                to="/notebook"
                className="text-[11px] font-mono font-bold text-[#F3CF65] hover:underline flex items-center gap-1"
              >
                <span>Open Notebook</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* List of Recent Notes - Scrollable Container */}
            <div className="flex-1 min-h-0 flex flex-col justify-start">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#F3CF65] font-bold">
                  Recently Saved —
                </span>
                {allNotebookEntries.length > 2 && (
                  <span className="text-[9px] font-mono text-stone-400">
                    {allNotebookEntries.length} notes • Scroll
                  </span>
                )}
              </div>

              {/* Scrollable list with visible, custom gold-trimmed scrollbar */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Recently saved notes list"
                className="flex-1 min-h-0 max-h-[175px] sm:max-h-[195px] overflow-y-auto overscroll-contain space-y-1.5 pr-1.5 notebook-card-scroll"
              >
                {allNotebookEntries.length === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-[#06162c]/50 border border-[#0d3060] text-stone-400 text-xs font-sans">
                    No notes saved yet.{" "}
                    <Link to="/notebook" className="text-[#F3CF65] hover:underline">
                      Open Notebook
                    </Link>{" "}
                    to create your first note.
                  </div>
                ) : (
                  allNotebookEntries.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setShowNoteModal(note.id)}
                      className="w-full p-2.5 rounded-xl bg-[#06162c]/70 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/40 transition-all flex items-center justify-between text-left cursor-pointer group shrink-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#F3CF65] shrink-0 transition-colors" />
                        <span className="font-serif font-medium text-xs text-stone-200 group-hover:text-white truncate">
                          {note.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-300 shrink-0 ml-2">
                        {note.date}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COLUMN 2 (4 Cols): ASK STBA AI (PERSONAL BIBLE TEACHER) */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col">
          <div
            id="ask-stba-ai-card"
            className="h-full flex flex-col justify-between p-5 sm:p-6 rounded-3xl glass-card border border-[#E5B842]/40 shadow-2xl relative overflow-hidden sheen-overlay"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F3CF65]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Container */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">Ask STBA AI</h3>
                    <span className="text-[10px] font-mono text-[#F3CF65] font-semibold">
                      Your Personal Bible Teacher
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Prompt Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAi();
                }}
                className="relative"
              >
                <input
                  id="ask-stba-ai-input"
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask me anything about Scripture..."
                  className="w-full py-3.5 pl-4 pr-20 bg-[#06162c] border border-[#0d3060] focus:border-[#F3CF65] rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none shadow-inner transition-all"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsListening(!isListening);
                      if (!isListening) {
                        setAiPrompt("Explain Hebrews 8 and the New Covenant sanctuary promise");
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isListening
                        ? "bg-rose-500/20 text-rose-400 animate-pulse"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                    title="Dictate with voice"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={!aiPrompt.trim() || isAiLoading}
                    className="p-2 rounded-xl gold-metallic-btn disabled:opacity-40 text-[#06162c] transition-all cursor-pointer font-bold shadow-xs active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Dynamic Pre-loaded Answers Lineup (4 spots) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F3CF65] font-bold block">
                    Pre-loaded Answers Lineup:
                  </span>
                  <span className="text-[9px] font-mono text-stone-400">
                    4 Instant Spots
                  </span>
                </div>

                <div className="space-y-1.5">
                  {preloadedAnswers.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPreloadedAnswer(item)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06162c]/70 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-stone-200 hover:text-white transition-all flex items-center justify-between text-left cursor-pointer group text-xs font-sans"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#F3CF65] shrink-0" />
                        <div className="min-w-0">
                          <span className="truncate block font-medium group-hover:text-white text-[11.5px]">
                            {item.question}
                          </span>
                          <span className="text-[9.5px] text-stone-400 block truncate">
                            {item.reference} • {item.topic}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.isRecent ? (
                          <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[#F3CF65]/15 text-[#F3CF65] border border-[#F3CF65]/30">
                            Recent
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300/90 border border-emerald-500/20">
                            Loaded
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#F3CF65] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#0d3060] mt-4">
              <button
                onClick={() => {
                  const target = activeAnswerItem || preloadedAnswers[0];
                  handleStartBibleStudyLesson(target?.reference, target?.topic);
                }}
                className="py-2.5 px-1.5 sm:px-2 gold-metallic-btn rounded-xl font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Bridge to interactive Bible Study Mode lesson"
              >
                <Play className="w-3 h-3 fill-current shrink-0" />
                <span className="truncate">Start Lesson</span>
              </button>

              <button
                onClick={handleAskAiButton}
                className="py-2.5 px-1.5 sm:px-2 bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-stone-200 rounded-xl font-mono font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Ask STBA General Assistant"
              >
                <Sparkles className="w-3 h-3 text-[#F3CF65] shrink-0" />
                <span className="truncate">Ask AI</span>
              </button>

              <button
                onClick={() => navigate("/doctrine")}
                className="py-2.5 px-1.5 sm:px-2 bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-stone-200 rounded-xl font-mono font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Explore 28 Fundamental Doctrines in Doctrine Navigator"
              >
                <Compass className="w-3.5 h-3.5 text-[#F3CF65] shrink-0" />
                <span className="truncate">Explore Doctrine</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COLUMN 3 (4 Cols): WEEKLY STUDY RECAP & RECOMMENDED NEXT */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* CARD A: WEEKLY STUDY RECAP */}
          <div
            id="dashboard-weekly-study-recap-card"
            className="flex-1 flex flex-col justify-between p-5 rounded-3xl glass-card border border-[#0d3060] shadow-xl sheen-overlay space-y-3.5"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F3CF65]" />
                <h3 className="font-serif font-bold text-sm text-white">Weekly Study Recap</h3>
              </div>
              <span className="text-[10px] font-mono text-[#DFC57B] bg-[#06162c] px-2 py-0.5 rounded-full border border-[#0d3060]">
                AI Mastery Engine
              </span>
            </div>

            {/* AI Recap Action Button & Active Recap Pill */}
            <div className="space-y-2">
              <button
                id="generate-weekly-recap-btn"
                type="button"
                onClick={handleGenerateWeeklyRecap}
                disabled={isGeneratingRecap}
                className="w-full py-2.5 px-3 gold-metallic-btn rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
                title="Generate an AI-powered Weekly Study Recap analyzing Tracks and Memory Vault progress"
              >
                {isGeneratingRecap ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
                    <span>Analyzing Tracks & Memory Vault...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                    <span>Generate Weekly Study Recap</span>
                  </>
                )}
              </button>

              {weeklyRecap && (
                <div
                  onClick={() => setShowRecapModal(true)}
                  className="p-3 rounded-2xl bg-[#06162c] hover:bg-[#0d3060] border border-[#E5B842]/40 transition-all cursor-pointer flex flex-col gap-2 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[#F3CF65] text-xs font-serif font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{weeklyRecap.title || "Weekly Recap Ready"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#DFC57B] group-hover:text-white shrink-0 flex items-center gap-0.5">
                      View Breakdown →
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-stone-300">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {weeklyRecap.masteredConcepts?.length || 3} Mastered
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#E5B842]/10 text-[#F3CF65] border border-[#E5B842]/20">
                      {weeklyRecap.suggestedReviewAreas?.length || 3} Review Areas
                    </span>
                    <span className="text-stone-400 ml-auto">
                      {weeklyRecap.stats?.overallMastery || 84}% Mastery
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Studies Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F3CF65] font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F3CF65]" />
                  Recent Studies:
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  Resume
                </span>
              </div>

              <div className="space-y-1.5">
                {recentStudiesList.slice(0, 3).map((study, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleStartBibleStudyLesson(study.reference, study.topic)}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/40 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-[#F3CF65] group-hover:underline truncate">
                          {study.reference}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#0d3060] text-stone-300 border border-[#1b3a6b]">
                          {study.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 truncate font-sans">
                        {study.topic}
                      </p>
                    </div>
                    <div className="p-1 rounded-lg bg-[#0d3060]/70 group-hover:bg-[#E5B842] text-[#F3CF65] group-hover:text-stone-950 transition-colors shrink-0">
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamically Generated Buttons for Each Study Mode (Excluding Notebook Mode) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F3CF65] font-bold block">
                  Active Study Modes:
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  6 Modes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {studyModes
                  .filter((mode) => mode.id !== "notebook")
                  .map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        id={`study-mode-btn-${mode.id}`}
                        type="button"
                        onClick={() => navigate(mode.path)}
                        className="py-2.5 px-2 bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-stone-200 hover:text-white rounded-xl font-mono font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-xs hover:shadow-md active:scale-95"
                        title={`Launch ${mode.title}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#F3CF65] group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate">{mode.title.replace(" Mode", "")}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* CARD B: RECOMMENDED NEXT */}
          <div
            id="dashboard-recommended-next-card"
            className="flex-1 flex flex-col justify-between p-5 rounded-3xl glass-card border border-[#0d3060] shadow-xl sheen-overlay space-y-3.5"
          >
            <div className="flex items-center gap-2 border-b border-[#0d3060] pb-3">
              <Sparkles className="w-4 h-4 text-[#F3CF65]" />
              <div>
                <h3 className="font-serif font-bold text-sm text-white">Recommended Next</h3>
                <span className="text-[10px] font-mono text-stone-300">
                  Based on your learning activity
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 my-auto py-1">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E5B842]/40">
                <img
                  src={FEATURED_COVENANT_IMAGE_URL}
                  alt="Hebrews 8 Covenant Study"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-white truncate leading-snug">
                  Hebrews 8 — The Better Covenant
                </h4>
                <p className="text-[11px] text-stone-300 font-sans line-clamp-2 leading-tight">
                  Continue your study on God's New Covenant promise.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#F3CF65]">
                  <Clock className="w-3 h-3" />
                  <span>18 min</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/stba")}
              className="w-full py-2.5 px-3 rounded-xl gold-metallic-btn font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Continue Study</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE OVERLAYS & MODALS */}
      {/* ========================================================================= */}

      {/* A. FEATURED TEACHING VIDEO MODAL */}
      <AnimatePresence>
        {showFeaturedVideoModal && (
          <div
            id="featured-video-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06162c]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card border border-[#E5B842]/50 rounded-3xl p-6 shadow-2xl space-y-4 text-left sheen-overlay"
            >
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#F3CF65] fill-current" />
                  <h3 className="font-serif font-bold text-lg text-white">
                    The New Covenant — God's Everlasting Promise
                  </h3>
                </div>
                <button
                  onClick={() => setShowFeaturedVideoModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#0d3060] bg-black">
                <img
                  src={FEATURED_COVENANT_IMAGE_URL}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#E5B842] to-[#F3CF65] text-[#06162c] flex items-center justify-center shadow-2xl">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <p className="font-serif text-sm text-stone-200 max-w-md">
                    “Behold, the days come, saith the Lord, that I will make a new covenant with the
                    house of Israel...” — Jeremiah 31:31
                  </p>
                </div>
              </div>

              {/* Study Summary & Launch Exegesis */}
              <div className="p-3.5 bg-[#06162c]/80 border border-[#0d3060] rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-[#F3CF65] font-bold uppercase tracking-wider block">
                  Exegesis Highlights
                </span>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  The New Covenant is not a change in God's moral law, but a change in the heart of
                  the believer. By grace through faith, God writes His holy law on our hearts and
                  minds through the Holy Spirit.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowFeaturedVideoModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#06162c] text-stone-300 text-xs font-mono font-bold cursor-pointer hover:bg-[#0d3060] border border-[#0d3060]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowFeaturedVideoModal(false);
                    navigate("/stba");
                  }}
                  className="px-4 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  Open in Bible Study Mode →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. ASK STBA AI RESPONSE MODAL */}
      <AnimatePresence>
        {showAiModal && (
          <div
            id="ai-response-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#06162c]/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl lg:max-w-3xl glass-card border border-[#E5B842]/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto sheen-overlay"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F3CF65] shrink-0" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">
                      Elder Stevens Exegesis Guide
                    </h3>
                    <span className="text-[10px] font-mono text-[#F3CF65] block">
                      Scripture Interprets Scripture • Comprehensive SDA Exegesis
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {aiResponse && !isAiLoading && (
                    <button
                      type="button"
                      onClick={() => setIsExegesisControlsCollapsed((prev) => !prev)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#0d3060] hover:border-[#E5B842]/60 text-stone-300 hover:text-[#F3CF65] bg-[#06162c]/80 hover:bg-[#0d3060] transition-all text-xs font-mono cursor-pointer shadow-xs active:scale-95"
                      title={
                        isExegesisControlsCollapsed
                          ? "Expand top controls (Audio, PDF, Doc options)"
                          : "Collapse top controls for expanded reading area"
                      }
                    >
                      {isExegesisControlsCollapsed ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-[#F3CF65]" />
                          <span className="hidden sm:inline">Show Controls</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-[#F3CF65]" />
                          <span className="hidden sm:inline">Collapse Controls</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      speechReader.stop();
                      setShowAiModal(false);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#0d3060] transition-colors cursor-pointer"
                    title="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Natural AI Voice Audio Toolbar & Document Options (Collapsible) */}
              {aiResponse && !isAiLoading && (
                <div className="space-y-1.5 transition-all duration-300">
                  {isExegesisControlsCollapsed ? (
                    /* Collapsed Strip: Quick mini-bar to expand or control audio */
                    <div className="flex items-center justify-between gap-2.5 bg-[#06162c]/90 px-3 py-2 rounded-xl border border-[#0d3060]">
                      <div className="flex items-center gap-2 min-w-0">
                        {speechReader.isSpeaking ? (
                          <div className="flex items-center gap-2 text-[#F3CF65] font-mono text-xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F3CF65] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E5B842]"></span>
                            </span>
                            <span className="font-semibold text-[11px] truncate">
                              {speechReader.isPaused ? "Audio Paused" : "Reading Aloud..."}
                            </span>
                            <button
                              type="button"
                              onClick={() => speechReader.togglePlay(aiResponse)}
                              className="p-1 rounded-lg bg-[#0d3060] hover:bg-[#153e74] text-[#F3CF65] cursor-pointer"
                              title={speechReader.isPaused ? "Resume Audio" : "Pause Audio"}
                            >
                              {speechReader.isPaused ? (
                                <Play className="w-3 h-3 fill-current" />
                              ) : (
                                <Pause className="w-3 h-3 fill-current" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={speechReader.stop}
                              className="p-1 rounded-lg bg-[#0d3060] hover:bg-[#153e74] text-rose-400 cursor-pointer"
                              title="Stop Audio"
                            >
                              <VolumeX className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
                            <Headphones className="w-3.5 h-3.5 text-[#F3CF65]/70" />
                            <span>Controls (Audio, PDF & Doc) collapsed</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsExegesisControlsCollapsed(false)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#06162c] hover:bg-[#0d3060] text-[#F3CF65] border border-[#DFC57B]/40 hover:border-[#F3CF65] font-mono text-xs font-semibold transition-all cursor-pointer shrink-0 active:scale-95"
                        title="Expand audio, PDF, and doc options"
                      >
                        <span>Expand Options</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Expanded Full Controls Toolbar */
                    <div className="bg-[#06162c]/90 p-3 rounded-2xl border border-[#0d3060] space-y-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-[#0d3060]/60">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#DFC57B] flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5 text-[#F3CF65]" />
                          Audio, PDF & Document Options
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsExegesisControlsCollapsed(true)}
                          className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-[#F3CF65] font-mono transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#0d3060]"
                          title="Collapse top controls to expand reading area"
                        >
                          <span>Collapse</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        {/* Play/Pause, Stop & Download Doc/PDF */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => speechReader.togglePlay(aiResponse)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl gold-metallic-btn text-[#06162c] font-mono text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                            title={
                              speechReader.isSpeaking && !speechReader.isPaused
                                ? "Pause read aloud"
                                : speechReader.isPaused
                                ? "Resume read aloud"
                                : "Listen to Elder Stevens Exegesis Guide read aloud"
                            }
                          >
                            {speechReader.isSpeaking && !speechReader.isPaused ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Pause Audio</span>
                                {/* Equalizer animation */}
                                <span className="flex items-end gap-0.5 h-3 px-1">
                                  <span className="w-0.5 bg-[#06162c] h-full animate-pulse" />
                                  <span className="w-0.5 bg-[#06162c] h-2/3 animate-ping" />
                                  <span className="w-0.5 bg-[#06162c] h-4/5 animate-pulse" />
                                </span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>
                                  {speechReader.isPaused ? "Resume Audio" : "Listen Read Aloud"}
                                </span>
                              </>
                            )}
                          </button>

                          {speechReader.isSpeaking && (
                            <button
                              type="button"
                              onClick={speechReader.stop}
                              className="p-1.5 text-stone-400 hover:text-rose-400 bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] rounded-xl transition-colors cursor-pointer"
                              title="Stop read aloud"
                            >
                              <VolumeX className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Download PDF Button */}
                          <button
                            type="button"
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06162c] hover:bg-[#0d3060] text-[#F3CF65] border border-[#DFC57B]/40 hover:border-[#F3CF65] font-mono text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                            title="Download exegesis guide as formatted PDF (.pdf)"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>

                          {/* Download Doc Button */}
                          <button
                            type="button"
                            onClick={handleDownloadDoc}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06162c] hover:bg-[#0d3060] text-stone-200 border border-[#0d3060] hover:border-stone-400 font-mono text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                            title="Download exegesis guide as Word Document (.doc)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Doc</span>
                          </button>
                        </div>

                        {/* Simplified Voice Selector: 2 Male & 2 Female American Voices */}
                        {speechReader.availableVoices.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#F3CF65] font-semibold whitespace-nowrap">
                              Reader Voice:
                            </span>
                            <select
                              value={speechReader.selectedVoiceId}
                              onChange={(e) => speechReader.selectVoiceById(e.target.value)}
                              className="bg-[#06162c] border border-[#DFC57B]/50 text-[#F3CF65] text-xs font-mono rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#F3CF65] focus:ring-1 focus:ring-[#F3CF65]/50 cursor-pointer max-w-[230px] truncate shadow-inner"
                              title="Select American Voice for Elder Stevens Exegesis Guide reader"
                            >
                              <optgroup label="Male Voices (American)" className="bg-[#06162c] text-[#F3CF65] font-bold">
                                {speechReader.availableVoices
                                  .filter((v) => v.gender === "male")
                                  .map((v) => (
                                    <option key={v.id} value={v.id} className="bg-[#06162c] text-white">
                                      {v.name}
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label="Female Voices (American)" className="bg-[#06162c] text-[#F3CF65] font-bold">
                                {speechReader.availableVoices
                                  .filter((v) => v.gender === "female")
                                  .map((v) => (
                                    <option key={v.id} value={v.id} className="bg-[#06162c] text-white">
                                      {v.name}
                                    </option>
                                  ))}
                              </optgroup>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Question & Topic Header */}
              <div className="p-3 bg-[#06162c] rounded-xl border border-[#0d3060] flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#F3CF65] font-bold block">
                    Question Asked:
                  </span>
                  <span className="font-serif font-bold text-sm text-white block truncate">
                    "{activePromptTopic}"
                  </span>
                </div>
                {activeAnswerItem?.reference && (
                  <span className="px-2.5 py-1 rounded-full bg-[#E5B842]/15 text-[#F3CF65] border border-[#E5B842]/30 text-xs font-mono shrink-0 font-semibold">
                    {activeAnswerItem.reference}
                  </span>
                )}
              </div>

              {/* Exegesis Content */}
              {isAiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#F3CF65] border-t-transparent animate-spin" />
                  <span className="font-serif text-xs text-[#F3CF65] animate-pulse">
                    Elder Steven is consulting Scripture and historic SDA hermeneutics...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visually Neat & Scrollable Exegesis with Clickable Verse Buttons */}
                  <div
                    className={`bg-[#06162c]/90 p-4 sm:p-5 rounded-2xl border border-[#0d3060] ${
                      isExegesisControlsCollapsed
                        ? "max-h-[64vh] sm:max-h-[68vh]"
                        : "max-h-[50vh] sm:max-h-[54vh]"
                    } overflow-y-auto scrollbar-thin scrollbar-thumb-[#DFC57B]/30 scrollbar-track-[#06162c] shadow-inner transition-all duration-300`}
                  >
                    <ExegesisRenderer
                      content={aiResponse}
                      onVerseClick={(verse) => {
                        handleStartBibleStudyLesson(verse, activePromptTopic);
                      }}
                    />
                  </div>

                  {/* Bridge Callout: Start Lesson Bridge to Bible Study Mode */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#06162c] via-[#081e3a] to-[#0c2b54] border border-[#DFC57B]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#F3CF65]">
                        <BookOpenText className="w-4 h-4" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider">
                          Bridge to Bible Study Mode
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] max-w-md leading-relaxed antialiased">
                        Explore this passage interactively with Elder Stephen in Bible Study Mode, where the AI guides you through the Greek/Hebrew, historical context, and deeper study.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleStartBibleStudyLesson(
                          activeAnswerItem?.reference,
                          activeAnswerItem?.topic
                        )
                      }
                      className="w-full sm:w-auto px-4 py-2.5 gold-metallic-btn rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Bible Study Lesson →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-[#0d3060]">
                <span className="text-[10px] font-mono text-stone-400">
                  Scripture interprets Scripture • 2 Tim 2:15
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      speechReader.stop();
                      setShowAiModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] text-stone-300 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GENERAL ASSISTANT MODAL (Dashboard Adaptive AI) */}
      <AnimatePresence>
        {showGeneralAssistantModal && (
          <div
            id="general-assistant-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#06162c]/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card border border-[#E5B842]/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-left max-h-[88vh] overflow-y-auto sheen-overlay"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">
                      STBA General Assistant
                    </h3>
                    <span className="text-[10.5px] font-mono text-[#F3CF65] font-semibold">
                      Dashboard Guide & Adaptive Resource Assistant
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowGeneralAssistantModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#0d3060] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Context Banner */}
              <div className="p-3.5 bg-[#06162c] rounded-2xl border border-[#0d3060] text-xs text-stone-300 leading-relaxed font-sans">
                <p>
                  Welcome! As your <strong>Dashboard General Assistant</strong>, I can help you find resources, answer broad theological questions, or guide you directly to the ideal study mode for your current devotional goals.
                </p>
              </div>

              {/* Interactive Query Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskGeneralAssistant();
                }}
                className="space-y-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={generalAssistantInput}
                    onChange={(e) => setGeneralAssistantInput(e.target.value)}
                    placeholder="Ask any general question or request guidance..."
                    className="w-full py-3.5 pl-4 pr-12 bg-[#06162c] border border-[#0d3060] focus:border-[#F3CF65] rounded-2xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none shadow-inner transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!generalAssistantInput.trim() || isGeneralAssistantLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl gold-metallic-btn text-[#06162c] font-bold cursor-pointer disabled:opacity-40 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Assistant Response if available */}
              {isGeneralAssistantLoading && (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 bg-[#06162c]/60 rounded-2xl border border-[#0d3060]">
                  <div className="w-6 h-6 rounded-full border-2 border-[#F3CF65] border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-[#F3CF65]">
                    Consulting study resources...
                  </span>
                </div>
              )}

              {generalAssistantResponse && !isGeneralAssistantLoading && (
                <div className="p-4 rounded-2xl bg-[#06162c]/90 border border-[#DFC57B]/40 text-xs sm:text-sm text-stone-200 font-sans space-y-2 whitespace-pre-line leading-relaxed">
                  {generalAssistantResponse}
                </div>
              )}

              {/* Mode Bridges: 7 Quick Mode Portals */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F3CF65] font-bold block">
                  Where would you like to study?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGeneralAssistantModal(false);
                      navigate("/stba");
                    }}
                    className="p-3 rounded-xl bg-[#06162c]/80 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <BookOpenText className="w-4 h-4 text-[#F3CF65] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#F3CF65]">
                        Bible Study Mode
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        Deep verse-by-verse exegesis with the Parallel Reader
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGeneralAssistantModal(false);
                      navigate("/doctrine");
                    }}
                    className="p-3 rounded-xl bg-[#06162c]/80 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <Compass className="w-4 h-4 text-[#F3CF65] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#F3CF65]">
                        Doctrine Navigator
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        Explore the 28 Fundamental Beliefs & scripture links
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGeneralAssistantModal(false);
                      navigate("/tracks");
                    }}
                    className="p-3 rounded-xl bg-[#06162c]/80 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <Layers className="w-4 h-4 text-[#F3CF65] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#F3CF65]">
                        Study Tracks
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        Structured discipleship pathways & guided curricula
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGeneralAssistantModal(false);
                      navigate("/recall");
                    }}
                    className="p-3 rounded-xl bg-[#06162c]/80 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <Brain className="w-4 h-4 text-[#F3CF65] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#F3CF65]">
                        Active Recall Mode
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        Spaced repetition scripture memorization mastery
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGeneralAssistantModal(false);
                      navigate("/teach");
                    }}
                    className="p-3 rounded-xl bg-[#06162c]/80 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <GraduationCap className="w-4 h-4 text-[#F3CF65] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#F3CF65]">
                        Teach It Studio
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        Prepare sermons, lessons, and child outlines
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGeneralAssistantModal(false);
                      navigate("/sabbath-school");
                    }}
                    className="p-3 rounded-xl bg-[#06162c]/80 hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <CalendarDays className="w-4 h-4 text-[#F3CF65] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#F3CF65]">
                        Sabbath School
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        Weekly quarterly lessons & memory golden verses
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-[#0d3060]">
                <span className="text-[10px] font-mono text-stone-400">
                  STBA AI Study Ecosystem • 2 Tim 2:15
                </span>
                <button
                  onClick={() => setShowGeneralAssistantModal(false)}
                  className="px-4 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. FAQs MODAL */}
      <AnimatePresence>
        {showFaqModal && (
          <div
            id="faq-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06162c]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl glass-card border border-[#0d3060] rounded-3xl p-6 shadow-2xl space-y-4 text-left max-h-[85vh] overflow-y-auto sheen-overlay"
            >
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#F3CF65]" />
                  <h3 className="font-serif font-bold text-base text-white">
                    Frequently Asked Questions
                  </h3>
                </div>
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-sans">
                {[
                  {
                    q: "What is the mission of STBA?",
                    a: "Study To Be Approved (STBA) is an SDA-aligned cognitive scripture mastery engine designed to help disciples retain God's Word, master foundational doctrines, and effectively teach others."
                  },
                  {
                    q: "How does the Spaced Repetition engine work?",
                    a: "Our active recall algorithm tracks your recall accuracy and schedules reviews at scientifically optimized intervals so scriptures move from short-term memory into permanent retention."
                  },
                  {
                    q: "What are the 7 study modes?",
                    a: "1. Bible Study Mode, 2. Study Tracks, 3. Doctrine Navigator, 4. Active Recall, 5. Teach It Studio, 6. Theological Notebook, and 7. Sabbath School Mastery."
                  },
                  {
                    q: "How do I set my daily scripture goal?",
                    a: "Click 'Target' on the Daily Recall Goal card on the dashboard to choose between 1 to 10 verses per day."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#06162c] border border-[#0d3060] space-y-1">
                    <h4 className="font-serif font-bold text-white text-xs sm:text-sm">
                      {item.q}
                    </h4>
                    <p className="text-stone-300 text-xs leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. ZOOM LIVE BIBLE STUDY MODAL */}
      <AnimatePresence>
        {showZoomModal && (
          <div
            id="zoom-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06162c]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card border border-[#E5B842]/50 rounded-3xl p-6 shadow-2xl space-y-4 text-left sheen-overlay"
            >
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#F3CF65]" />
                  <h3 className="font-serif font-bold text-base text-white">
                    Live Bible Study on Zoom
                  </h3>
                </div>
                <button
                  onClick={() => setShowZoomModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#06162c] rounded-2xl border border-[#0d3060] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#F3CF65] font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>Every Wednesday & Sabbath @ 7:00 PM EST</span>
                </div>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  Join Elder Steven and global Berean scholars for deep theological exegesis,
                  line-upon-line study, and Q&A fellowship.
                </p>
                <div className="p-2.5 bg-[#0d3060]/50 rounded-xl border border-[#0d3060] text-[11px] font-mono text-stone-300 space-y-0.5">
                  <div>Meeting ID: 234 538 0933</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowZoomModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#06162c] text-stone-300 text-xs font-mono font-bold cursor-pointer hover:bg-[#0d3060] border border-[#0d3060]"
                >
                  Dismiss
                </button>
                <a
                  href="https://us06web.zoom.us/j/2345380933?pwd=NXl2U3FueGljd2NJTTRNRE1UMlpCQT09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Zoom</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. SUBMIT TICKET / SUPPORT MODAL */}
      <AnimatePresence>
        {showTicketModal && (
          <div
            id="ticket-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06162c]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card border border-[#E5B842]/50 rounded-3xl p-6 shadow-2xl space-y-4 text-left sheen-overlay"
            >
              <div className="flex items-center justify-between border-b border-[#0d3060] pb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#F3CF65]" />
                  <h3 className="font-serif font-bold text-base text-white">
                    STBA Help & Support Ticket
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    setTicketSent(false);
                  }}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {ticketSent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-white">
                    Ticket Submitted Successfully
                  </h4>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto font-sans">
                    Thank you! Our pastoral and technical study support team has received your
                    request and will respond shortly.
                  </p>
                  <button
                    onClick={() => {
                      setShowTicketModal(false);
                      setTicketSent(false);
                    }}
                    className="px-5 py-2 rounded-xl gold-metallic-btn font-mono font-bold text-xs uppercase cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
                    setTicketSent(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold block mb-1">
                      Subject / Doctrinal Inquiry
                    </label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Question on Sanctuary timeline or Recall sync"
                      required
                      className="w-full p-3 bg-[#06162c] border border-[#0d3060] focus:border-[#F3CF65] rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold block mb-1">
                      Message Details
                    </label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your inquiry or question in detail..."
                      required
                      className="w-full p-3 bg-[#06162c] border border-[#0d3060] focus:border-[#F3CF65] rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#0d3060]">
                    <button
                      type="button"
                      onClick={() => setShowTicketModal(false)}
                      className="px-4 py-2 rounded-xl bg-[#06162c] text-stone-300 text-xs font-mono font-bold cursor-pointer hover:bg-[#0d3060] border border-[#0d3060]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Submit Ticket →
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* F. NOTE VIEWER MODAL */}
      <AnimatePresence>
        {showNoteModal && (
          <div
            id="note-viewer-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06162c]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card border border-[#E5B842]/50 rounded-3xl p-6 shadow-2xl space-y-4 text-left sheen-overlay"
            >
              {(() => {
                const note =
                  allNotebookEntries.find((n) => n.id === showNoteModal) ||
                  DEFAULT_NOTEBOOK_ENTRIES.find((n) => n.id === showNoteModal) ||
                  (() => {
                    const fallbackStored = loadNotes().find((n) => n.id === showNoteModal);
                    return fallbackStored ? mapStudyNoteToEntry(fallbackStored) : null;
                  })();

                if (!note) return null;

                const hasExtendedContent =
                  Boolean(note.content && note.content.trim().length > (note.summary || "").length + 30);

                return (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-[#0d3060] pb-3.5">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-[#E5B842]/20 text-[#F3CF65] border border-[#E5B842]/30 shrink-0">
                          <FileText className="w-5 h-5 text-[#F3CF65]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif font-bold text-base sm:text-lg text-white truncate">
                            {note.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-stone-400">
                              Saved: {note.date} • Theological Archive
                            </span>
                            {note.category && (
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5B842]/15 text-[#F3CF65] border border-[#E5B842]/30">
                                {note.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowNoteModal(null);
                          setShowFullNoteContent(false);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
                        title="Close popup"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="space-y-4 pt-1">
                      {/* Summary Section */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#F3CF65] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#F3CF65]" />
                            Note Summary
                          </span>
                          {hasExtendedContent && (
                            <button
                              type="button"
                              onClick={() => setShowFullNoteContent(!showFullNoteContent)}
                              className="text-[10px] font-mono font-bold text-[#F3CF65] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              {showFullNoteContent ? "Show Summary Only" : "View Full Note"}
                            </button>
                          )}
                        </div>

                        {showFullNoteContent ? (
                          <div className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed p-4 bg-[#06162c] rounded-2xl border border-[#0d3060] max-h-[220px] overflow-y-auto notebook-card-scroll whitespace-pre-line shadow-inner">
                            {note.content}
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed p-4 bg-[#06162c] rounded-2xl border border-[#0d3060] whitespace-pre-line shadow-inner">
                            {note.summary || note.preview}
                          </p>
                        )}
                      </div>

                      {/* Associated Scriptures Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#F3CF65] font-bold uppercase tracking-wider block">
                            Associated Scriptures{note.verses && note.verses.length > 0 ? ` (${note.verses.length}):` : ":"}
                          </span>
                          {note.verses && note.verses.length > 0 && (
                            <span className="text-[9px] font-mono text-stone-400">
                              Click any verse to study
                            </span>
                          )}
                        </div>

                        {note.verses && note.verses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {note.verses.map((v: string, i: number) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setShowNoteModal(null);
                                  setShowFullNoteContent(false);
                                  handleStartBibleStudyLesson(v, note.title);
                                }}
                                title={`Click to study ${v} in Parallel Bible Reader`}
                                className="px-3 py-1.5 bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#F3CF65] text-xs font-serif font-bold text-stone-200 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 group shadow-sm hover:scale-[1.02] active:scale-95"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-[#F3CF65] group-hover:scale-110 transition-transform" />
                                <span>{v}</span>
                                <span className="text-[9px] font-mono font-normal text-stone-400 group-hover:text-[#F3CF65] transition-colors ml-0.5">
                                  Study →
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-[#06162c]/60 rounded-xl border border-[#0d3060]/70 flex items-center justify-between text-xs text-stone-400">
                            <span className="italic">No specific scriptures tagged in this note.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNoteModal(null);
                                setShowFullNoteContent(false);
                                handleStartBibleStudyLesson(note.title, note.title);
                              }}
                              className="text-[11px] font-mono font-bold text-[#F3CF65] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                            >
                              <span>Explore Topic →</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-3 border-t border-[#0d3060]">
                      <button
                        onClick={() => {
                          setShowNoteModal(null);
                          setShowFullNoteContent(false);
                          navigate("/notebook", { state: { selectedNoteId: note.id } });
                        }}
                        className="text-xs font-mono font-bold text-[#F3CF65] hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Full Notebook</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setShowNoteModal(null);
                          setShowFullNoteContent(false);
                        }}
                        className="px-5 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg active:scale-95"
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* G. WEEKLY STUDY RECAP MODAL */}
      <AnimatePresence>
        {showRecapModal && weeklyRecap && (
          <div
            id="weekly-study-recap-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#06162c]/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl lg:max-w-3xl glass-card border border-[#E5B842]/50 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 text-left max-h-[92vh] overflow-y-auto sheen-overlay my-auto notebook-card-scroll"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#0d3060] pb-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E5B842] to-[#F3CF65] text-[#06162c] flex items-center justify-center shadow-lg shrink-0">
                    <Sparkles className="w-6 h-6 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-black text-lg sm:text-xl text-white tracking-tight truncate">
                        {weeklyRecap.title || "Weekly Scripture Mastery & Doctrinal Recap"}
                      </h3>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5B842]/15 text-[#F3CF65] border border-[#E5B842]/30">
                        {weeklyRecap.period || "Current Week"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-stone-300 mt-0.5">
                      Cognitive Discipleship Engine • Sola Scriptura • 2 Tim 2:15
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecapModal(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#0d3060] transition-colors cursor-pointer shrink-0"
                  title="Close recap modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#06162c] border border-[#0d3060] text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    Mastered Verses
                  </span>
                  <div className="text-xl sm:text-2xl font-serif font-black text-[#F3CF65]">
                    {weeklyRecap.stats?.masteredCount || completedVerseIds.length || 6}
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center justify-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Memory Vault
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#06162c] border border-[#0d3060] text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    Study Streak
                  </span>
                  <div className="text-xl sm:text-2xl font-serif font-black text-[#DFC57B]">
                    {weeklyRecap.stats?.streakDays || 7} Days
                  </div>
                  <span className="text-[9px] font-mono text-[#F3CF65] flex items-center justify-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" /> Active Momentum
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#06162c] border border-[#0d3060] text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    Time in Word
                  </span>
                  <div className="text-xl sm:text-2xl font-serif font-black text-[#F3CF65]">
                    {weeklyRecap.stats?.totalMinutes || 120} Min
                  </div>
                  <span className="text-[9px] font-mono text-stone-400 flex items-center justify-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> Deep Exegesis
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#06162c] border border-[#0d3060] text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    Mastery Score
                  </span>
                  <div className="text-xl sm:text-2xl font-serif font-black text-emerald-400">
                    {weeklyRecap.stats?.overallMastery || 84}%
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center justify-center gap-0.5">
                    <Award className="w-2.5 h-2.5" /> Approved Workman
                  </span>
                </div>
              </div>

              {/* Pastoral Overview Banner */}
              <div className="p-4 rounded-2xl bg-[#06162c]/90 border border-[#0d3060] space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#DFC57B] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3CF65]" />
                  Executive Discipleship Summary
                </span>
                <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed">
                  {weeklyRecap.overview}
                </p>
              </div>

              {/* SECTION 1: MASTERED CONCEPTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#0d3060]/70 pb-1.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#F3CF65] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    1. Mastered Concepts & Pillars ({weeklyRecap.masteredConcepts?.length || 0})
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Retained in Memory Vault
                  </span>
                </div>

                <div className="space-y-2.5">
                  {weeklyRecap.masteredConcepts?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#06162c] border border-[#0d3060] hover:border-[#E5B842]/40 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                            {item.concept}
                          </h4>
                        </div>
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {item.masteryTier || "Mastered"}
                        </span>
                      </div>

                      <p className="text-xs text-stone-300 font-sans leading-relaxed pl-7">
                        {item.summary}
                      </p>

                      {item.keyScriptures && item.keyScriptures.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pl-7 pt-1">
                          <span className="text-[10px] font-mono text-stone-400">
                            Anchor Texts:
                          </span>
                          {item.keyScriptures.map((scrip: string, sIdx: number) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                setShowRecapModal(false);
                                handleStartBibleStudyLesson(scrip, item.concept);
                              }}
                              className="text-[10px] font-serif font-bold px-2 py-0.5 rounded-lg bg-[#0d3060]/70 hover:bg-[#E5B842] text-[#F3CF65] hover:text-[#06162c] border border-[#1b3a6b] hover:border-[#E5B842] transition-colors cursor-pointer flex items-center gap-1"
                              title={`Study ${scrip} in Parallel Bible Reader`}
                            >
                              <BookOpenText className="w-2.5 h-2.5 shrink-0" />
                              <span>{scrip}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: SUGGESTED REVIEW AREAS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#0d3060]/70 pb-1.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#DFC57B] font-bold flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#F3CF65]" />
                    2. Suggested Areas for Spaced Repetition Review ({weeklyRecap.suggestedReviewAreas?.length || 0})
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Reinforce Before Memory Decay
                  </span>
                </div>

                <div className="space-y-2.5">
                  {weeklyRecap.suggestedReviewAreas?.map((area: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#06162c] border border-[#0d3060] hover:border-[#E5B842]/40 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#E5B842]/20 text-[#F3CF65] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                            {area.topic}
                          </h4>
                        </div>
                        {area.scriptureAnchor && (
                          <span className="text-[10px] font-mono text-[#F3CF65] px-2 py-0.5 rounded-full bg-[#0d3060] border border-[#1b3a6b]">
                            {area.scriptureAnchor}
                          </span>
                        )}
                      </div>

                      <div className="pl-7 space-y-1.5 text-xs">
                        <div className="text-stone-300 font-sans leading-relaxed">
                          <strong className="text-[#DFC57B] font-mono text-[11px] block sm:inline mr-1">
                            Why Review:
                          </strong>
                          {area.reasonForReview}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <span className="text-stone-400 italic">
                            Action: {area.suggestedAction}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowRecapModal(false);
                              navigate(area.targetMode || "/recall");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#0d3060] hover:bg-[#E5B842] text-[#F3CF65] hover:text-[#06162c] border border-[#E5B842]/40 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                          >
                            <span>Launch {area.modeName || "Study Mode"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: SCRIPTURE MILESTONES & PASTORAL ENCOURAGEMENT */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#06162c] via-[#091f3d] to-[#06162c] border border-[#E5B842]/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5B842]/60 shrink-0">
                    <img
                      src={ELDER_STEVEN_PORTRAIT_URL}
                      alt="Elder Stephen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-xs text-white">
                      Elder Stephen's Pastoral Word & Counsel
                    </h5>
                    <span className="text-[10px] font-mono text-[#F3CF65]">
                      “Study to shew thyself approved unto God” (2 Timothy 2:15)
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-200 font-serif italic leading-relaxed pl-1 border-l-2 border-[#E5B842] ml-2">
                  "{weeklyRecap.pastoralEncouragement}"
                </p>

                {weeklyRecap.nextAction && (
                  <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[#DFC57B]">
                    <ArrowRight className="w-3.5 h-3.5 text-[#F3CF65] shrink-0" />
                    <span>Next Week Focus: <strong>{weeklyRecap.nextAction}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#0d3060]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveRecapToNotebook}
                    className="px-3.5 py-2 rounded-xl bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/60 text-stone-200 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Save recap as a note in your personal Notebook"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#F3CF65]" />
                    <span>Save to Notebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyRecap}
                    className="px-3.5 py-2 rounded-xl bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] hover:border-[#E5B842]/60 text-stone-200 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Copy formatted recap text to clipboard"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#F3CF65]" />
                    <span>Copy Recap</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecapModal(false);
                      handleGenerateWeeklyRecap();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#06162c] hover:bg-[#0d3060] border border-[#0d3060] text-stone-300 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Regenerate recap with updated data"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRecapModal(false)}
                    className="px-5 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      {recapSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#06162c] border border-[#E5B842] text-[#F3CF65] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Weekly Study Recap saved to Notebook!</span>
        </div>
      )}
      {recapCopiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#06162c] border border-[#E5B842] text-[#F3CF65] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Recap summary copied to clipboard!</span>
        </div>
      )}
      <HelpCenterPanel
        isOpen={showHelpCenterPanel}
        onClose={() => setShowHelpCenterPanel(false)}
        initialView={helpCenterInitialView}
        onOpenFaqModal={() => setShowFaqModal(true)}
      />
    </div>
  );
};
export default Dashboard;
