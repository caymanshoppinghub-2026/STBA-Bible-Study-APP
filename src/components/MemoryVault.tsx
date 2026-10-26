/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Star,
  Search,
  BookOpen,
  Calendar,
  Compass,
  User,
  X,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Award,
  BookCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Share2,
  Save,
  Trash2,
  Check,
  Download,
  FileText,
  Printer,
  Copy,
  FileDown,
  Brain,
  Zap,
  CheckCircle2,
  LayoutGrid,
  Tag,
  Hash
} from "lucide-react";
import { Scripture } from "../types";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";
import { VerseMap } from "./VerseMap";
import { inferVerseThemeAndDoctrine } from "../data/verseThemes";

// Mastered Verse models inside our Vault
export interface MasteredScripture extends Scripture {
  dateAdded: string;
  recallsCount: number;
  bookChapter: string;
  notes: string;
  trackLabel: string; // matches track name
  relatedWhiteQuote?: string;
  theologicalContext: string;
  theme?: string;
  doctrineCategory?: string;
  tags?: string[];
}

export interface VerseProficiency {
  score: number; // 0 to 100%
  tier: "Mastered" | "Proficient" | "Developing" | "Learning";
  recalls: number;
  stageMilestones: number; // 1 to 4
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  barColor: string;
  ringColor: string;
  retentionEstimate: string;
  retentionPercent: number;
  decayStatus: "Optimal" | "Stable" | "Moderate" | "Review Due";
  nextIntervalDays: number;
}

const MASTER_VERSES_SEED: MasteredScripture[] = [
  {
    id: "mv-1",
    reference: "2 Timothy 2:15",
    bookChapter: "2 Timothy Chapter 2",
    text: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
    keywords: ["approved", "workman", "ashamed", "dividing", "truth"],
    dateAdded: "Oct 12, 2026",
    recallsCount: 3,
    notes: "Crucial guideline for personal theological discipline. Teaches dividing text soundly.",
    trackLabel: "28 Fundamentals",
    theme: "Discipleship & Diligence",
    doctrineCategory: "Christian Discipleship",
    tags: ["Sola Scriptura", "Workman", "Approved", "Rightly Dividing", "Diligence"],
    theologicalContext: "Emphasized heavily by pioneer Bible study circles as standard baseline of biblical diligence.",
    relatedWhiteQuote: "The cause of God needs men who can work with diligence, who do not think of their own convenience but of the work's success..."
  },
  {
    id: "mv-2",
    reference: "Revelation 14:12",
    bookChapter: "Revelation Chapter 14",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    keywords: ["patience", "saints", "commandments", "faith"],
    dateAdded: "Oct 18, 2026",
    recallsCount: 2,
    notes: "Climax statement summarizing character and ultimate test over worship.",
    trackLabel: "Three Angels",
    theme: "Three Angels & Remnant",
    doctrineCategory: "Prophecy & Present Truth",
    tags: ["Three Angels", "Remnant", "Commandments of God", "Faith of Jesus", "Patience of Saints"],
    theologicalContext: "Represents the terminal identification of the remnant people of God at final historical warning.",
    relatedWhiteQuote: "Our faith should be active, trusting our Heavenly Father. Keeping God's commandments is the test of true spiritual discipleship..."
  },
  {
    id: "mv-3",
    reference: "Daniel 8:14",
    bookChapter: "Daniel Chapter 8",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    keywords: ["days", "sanctuary", "cleansed", "hundred"],
    dateAdded: "Nov 02, 2026",
    recallsCount: 4,
    notes: "Thematic backbone of Adventism investigative sanctuary clearing date calculation.",
    trackLabel: "Sanctuary Doctrine",
    theme: "Sanctuary & 1844",
    doctrineCategory: "Pillars of Faith",
    tags: ["Sanctuary", "1844", "Investigative Judgment", "Cleansing", "2300 Days"],
    theologicalContext: "Prophetic clock predicting Christ's entry into the Holy of Holies in 1844.",
    relatedWhiteQuote: "The sanctuary in heaven is the very center of Christ's work in behalf of man. It concerns every soul living upon the earth..."
  },
  {
    id: "mv-4",
    reference: "Genesis 2:3",
    bookChapter: "Genesis Chapter 2",
    text: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
    keywords: ["blessed", "sanctified", "rested", "seventh", "created"],
    dateAdded: "Nov 15, 2026",
    recallsCount: 2,
    notes: "Creation origin statement of Seventh-day holiness as persistent rest.",
    trackLabel: "Sabbath School",
    theme: "The Sabbath & Creation",
    doctrineCategory: "Pillars of Faith",
    tags: ["Sabbath", "Creation", "Seventh Day", "Rest", "Edenic Memorial"],
    theologicalContext: "Constitutes the core foundation of weekly memorial worship prior to any fall from moral alignment.",
    relatedWhiteQuote: "God blessed the seventh day. It is a standing token of God's power in creating all things. We are invited to rest in Him..."
  },
  {
    id: "mv-5",
    reference: "Exodus 20:8",
    bookChapter: "Exodus Chapter 20",
    text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work.",
    keywords: ["remember", "sabbath", "holy", "labour", "work"],
    dateAdded: "Nov 20, 2026",
    recallsCount: 3,
    notes: "Moral decree embedded directly in structural heart of the Decalogue.",
    trackLabel: "28 Fundamentals",
    theme: "The Sabbath & Creation",
    doctrineCategory: "Pillars of Faith",
    tags: ["Sabbath", "Fourth Commandment", "Decalogue", "Seventh Day", "Holy"],
    theologicalContext: "The only commandment preceding with a command to 'Remember', anticipating modern progressive forgetfulness.",
    relatedWhiteQuote: "So long as the heavens and the earth endure, the Sabbath will continue as a sign of the Creator's power..."
  }
];

interface MemoryVaultProps {
  sabbathMode?: boolean;
  onNavigate?: (tab: "home" | "tracks" | "vault" | "profile") => void;
  onLaunchRecallPractice?: (scripture: Scripture) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  sabbathMode = false,
  onNavigate,
  onLaunchRecallPractice
}) => {
  // Mastered list state with LocalStorage backup persistence
  const [masteredList, setMasteredList] = useState<MasteredScripture[]>(() => {
    const saved = localStorage.getItem("stba_memory_vault_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MASTER_VERSES_SEED;
      }
    }
    return MASTER_VERSES_SEED;
  });

  const [activeTab, setActiveTab] = useState<"mastered" | "favorites">("mastered");
  const { completedVerseIds, favoriteScriptures, toggleFavoriteScriptures, isFavoriteScripture, updateFavoriteScriptureNotes } = useApp();

  const mappedFavoritesList: MasteredScripture[] = favoriteScriptures.map((s) => {
    const existingMastered = masteredList.find((m) => m.id === s.id || m.reference === s.reference);
    const recalls = existingMastered ? existingMastered.recallsCount : (s as any).recallsCount || 0;
    return {
      ...s,
      dateAdded: existingMastered ? existingMastered.dateAdded : "Favorited",
      recallsCount: recalls,
      bookChapter: s.reference ? s.reference.split(" ")[0] + " Chapter" : "Scripture Chapter",
      notes: (s as any).notes || existingMastered?.notes || "Persistent favorited scripture from study catalog.",
      trackLabel: existingMastered ? existingMastered.trackLabel : "My Favorites",
      theologicalContext: existingMastered?.theologicalContext || "This scripture was bookmarked by the user for rapid access and spaced repetition review.",
      relatedWhiteQuote: existingMastered?.relatedWhiteQuote || "Let the modern disciple write, ponder, and hold fast that which is approved."
    };
  });

  const activeSourceList = activeTab === "mastered" ? masteredList : mappedFavoritesList;

  // Search input and Filter constraints
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "mastery" | "alpha" | "book">("recent");
  const [filterTrack, setFilterTrack] = useState<string>("All");

  // View mode: standard card grid vs interactive visual Verse Map
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");

  // Selected scripture for details sheet
  const [selectedVerse, setSelectedVerse] = useState<MasteredScripture | null>(null);

  // Edit fields for the selected verse note block
  const [noteText, setNoteText] = useState<string>("");

  // Toast notifier
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Export and download dropdown states
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<"filtered" | "all">("filtered");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateVerseCategorization = (updatedVerse: MasteredScripture) => {
    setMasteredList((prev) =>
      prev.map((v) => (v.id === updatedVerse.id ? updatedVerse : v))
    );
    if (selectedVerse && selectedVerse.id === updatedVerse.id) {
      setSelectedVerse(updatedVerse);
    }
    triggerToast(`Categorized ${updatedVerse.reference} into "${updatedVerse.theme}"`);
  };

  useEffect(() => {
    localStorage.setItem("stba_memory_vault_list", JSON.stringify(masteredList));
  }, [masteredList]);

  // Sync edits of notes text fields
  useEffect(() => {
    if (selectedVerse) {
      setNoteText(selectedVerse.notes);
    }
  }, [selectedVerse]);

  // Helper to compute dynamic mastery score & proficiency based on active recall & study history
  const getVerseProficiency = (verse: MasteredScripture): VerseProficiency => {
    const recalls = verse.recallsCount ?? 0;
    const isCompletedInTrack = completedVerseIds ? completedVerseIds.includes(verse.id) : false;
    const hasDetailedNotes = Boolean(verse.notes && verse.notes.trim().length > 15);

    // Calculate base mastery score (0-100)
    let calculatedScore = 40; // baseline for queued scripture

    if (recalls >= 4) {
      calculatedScore = 98;
    } else if (recalls === 3) {
      calculatedScore = 94;
    } else if (recalls === 2) {
      calculatedScore = 88;
    } else if (recalls === 1) {
      calculatedScore = 74;
    } else if (isCompletedInTrack) {
      calculatedScore = 65;
    } else {
      calculatedScore = 42;
    }

    // Study synthesis bonuses
    if (hasDetailedNotes) {
      calculatedScore += 2;
    }
    if (isCompletedInTrack && recalls > 0) {
      calculatedScore += 2;
    }

    const score = Math.min(100, Math.max(10, calculatedScore));

    if (score >= 90) {
      return {
        score,
        tier: "Mastered",
        recalls,
        stageMilestones: 4,
        badgeBg: "bg-emerald-50",
        badgeBorder: "border-emerald-200/80",
        badgeText: "text-emerald-700",
        barColor: "bg-emerald-500",
        ringColor: "#10B981",
        retentionEstimate: "99%",
        retentionPercent: 99,
        decayStatus: "Optimal",
        nextIntervalDays: 14
      };
    } else if (score >= 75) {
      return {
        score,
        tier: "Proficient",
        recalls,
        stageMilestones: 3,
        badgeBg: "bg-teal-50",
        badgeBorder: "border-teal-200/80",
        badgeText: "text-teal-700",
        barColor: "bg-teal-500",
        ringColor: "#14B8A6",
        retentionEstimate: "91%",
        retentionPercent: 91,
        decayStatus: "Stable",
        nextIntervalDays: 7
      };
    } else if (score >= 55) {
      return {
        score,
        tier: "Developing",
        recalls,
        stageMilestones: 2,
        badgeBg: "bg-amber-50",
        badgeBorder: "border-amber-200/80",
        badgeText: "text-amber-700",
        barColor: "bg-amber-500",
        ringColor: "#F59E0B",
        retentionEstimate: "78%",
        retentionPercent: 78,
        decayStatus: "Moderate",
        nextIntervalDays: 3
      };
    } else {
      return {
        score,
        tier: "Learning",
        recalls,
        stageMilestones: 1,
        badgeBg: "bg-stone-100",
        badgeBorder: "border-stone-200",
        badgeText: "text-stone-600",
        barColor: "bg-stone-400",
        ringColor: "#A8A29E",
        retentionEstimate: "60%",
        retentionPercent: 60,
        decayStatus: "Review Due",
        nextIntervalDays: 1
      };
    }
  };

  // Unique list of tracks for filter menu
  const trackOptions = ["All", ...Array.from(new Set(activeSourceList.map((m) => m.trackLabel)))];

  // Calculations for Vault Stats Bar
  const totalVerses = activeSourceList.length;

  // Derive unique books (parsing standard bible references e.g. '2 Timothy 2:15' -> book)
  const getBookName = (ref: string) => {
    const lastSpaceIdx = ref.lastIndexOf(" ");
    const potentialNumIdx = ref.search(/\d/);
    if (potentialNumIdx > 0 && potentialNumIdx < lastSpaceIdx) {
      return ref.substring(0, lastSpaceIdx).trim();
    }
    const match = ref.match(/^(\d\s)?[a-zA-Z]+/);
    return match ? match[0] : ref;
  };

  const booksCovered = new Set(activeSourceList.map((m) => getBookName(m.reference))).size;
  const oldestVerseDays = totalVerses > 0 ? 42 : 0; // Simulated historical spacing
  const avgMasteryScore = totalVerses > 0
    ? Math.round(activeSourceList.reduce((acc, v) => acc + getVerseProficiency(v).score, 0) / totalVerses)
    : 0;
  const retentionRate = totalVerses > 0 ? (avgMasteryScore >= 80 ? "98.4%" : `${Math.round(avgMasteryScore * 0.95)}%`) : "0.0%";

  // Filter and Sort master list computations
  const searchedAndFilteredList = activeSourceList.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query
      ? item.reference.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query) ||
        item.bookChapter.toLowerCase().includes(query)
      : true;

    const matchesTrack = filterTrack === "All" || item.trackLabel === filterTrack;

    return matchesSearch && matchesTrack;
  });

  const sortedList = [...searchedAndFilteredList].sort((a, b) => {
    if (sortBy === "mastery") {
      return getVerseProficiency(b).score - getVerseProficiency(a).score;
    }
    if (sortBy === "alpha") {
      return a.reference.localeCompare(b.reference);
    }
    if (sortBy === "book") {
      return a.bookChapter.localeCompare(b.bookChapter);
    }
    // "recent": descending order of recalls
    return (b.recallsCount ?? 0) - (a.recallsCount ?? 0);
  });

  // Action methods
  const recordActiveRecallSuccess = (verseId: string) => {
    setMasteredList((prev) =>
      prev.map((v) => {
        if (v.id === verseId) {
          const newCount = (v.recallsCount || 0) + 1;
          return { ...v, recallsCount: newCount };
        }
        return v;
      })
    );
    if (selectedVerse && selectedVerse.id === verseId) {
      setSelectedVerse((prev) => (prev ? { ...prev, recallsCount: (prev.recallsCount || 0) + 1 } : null));
    }
    triggerToast("Active recall logged! Proficiency score increased.");
  };

  // Action methods
  const restoreSeedData = () => {
    setMasteredList(MASTER_VERSES_SEED);
    triggerToast("Vault restored to standard seeds.");
  };

  const clearVault = () => {
    setMasteredList([]);
    triggerToast("Vault emptied successfully.");
  };

  const saveNoteText = () => {
    if (!selectedVerse) return;
    if (activeTab === "favorites") {
      updateFavoriteScriptureNotes(selectedVerse.id, noteText);
    } else {
      const updated = masteredList.map((verse) => {
        if (verse.id === selectedVerse.id) {
          return { ...verse, notes: noteText };
        }
        return verse;
      });
      setMasteredList(updated);
    }
    setSelectedVerse({ ...selectedVerse, notes: noteText });
    triggerToast("Theological personal notes updated.");
  };

  const triggerReviewSession = (verse: MasteredScripture) => {
    setSelectedVerse(null);
    if (onLaunchRecallPractice) {
      onLaunchRecallPractice(verse);
    } else {
      triggerToast(`Launching verbatim practice session for ${verse.reference}`);
    }
  };

  const shareVerse = (verse: MasteredScripture) => {
    const shareText = `"${verse.text}" — ${verse.reference} | Memorized & Locked in via Study To Be Approved`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      triggerToast("Reference copied to clipboard! Share with friends.");
    } else {
      triggerToast(`Shared: "${verse.reference}"`);
    }
  };

  // Generate formatted plain text export
  const generateFormattedText = (verses: MasteredScripture[], categoryName: string): string => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    let output = `================================================================================\n`;
    output += `   STUDY TO BE APPROVED (STBA) — COGNITIVE SCRIPTURE MASTERY SYSTEM\n`;
    output += `   MEMORY VAULT EXPORT • ${categoryName.toUpperCase()}\n`;
    output += `   Export Date: ${dateStr} | Total Scriptures: ${verses.length}\n`;
    output += `================================================================================\n\n`;

    verses.forEach((v, index) => {
      const prof = getVerseProficiency(v);
      output += `--------------------------------------------------------------------------------\n`;
      output += `[${index + 1}] ${v.reference}\n`;
      output += `    Book/Chapter: ${v.bookChapter || "N/A"}\n`;
      output += `    Track: ${v.trackLabel || "Scripture Mastery"}\n`;
      output += `    Mastery Score: ${prof.score}% (${prof.tier}) | Active Recalls: ${prof.recalls} | Retention: ${prof.retentionEstimate}\n`;
      output += `    Date Added: ${v.dateAdded || "N/A"}\n\n`;
      output += `    SCRIPTURE TEXT:\n`;
      output += `    "${v.text}"\n\n`;

      if (v.theologicalContext) {
        output += `    THEOLOGICAL SIGNIFICANCE:\n`;
        output += `    ${v.theologicalContext}\n\n`;
      }

      if (v.relatedWhiteQuote) {
        output += `    SPIRIT OF PROPHECY ALIGNMENT (E.G. WHITE):\n`;
        output += `    "${v.relatedWhiteQuote}"\n\n`;
      }

      if (v.notes && v.notes.trim()) {
        output += `    PERSONAL STUDY NOTES:\n`;
        output += `    ${v.notes}\n\n`;
      }

      if (v.keywords && v.keywords.length > 0) {
        output += `    MEMORY HOOKS:\n`;
        output += `    ${v.keywords.join(", ")}\n\n`;
      }
    });

    output += `================================================================================\n`;
    output += `End of Memory Vault Export • Study To Be Approved Discipleship System\n`;
    output += `2 Timothy 2:15 — "Study to shew thyself approved unto God"\n`;
    output += `================================================================================\n`;

    return output;
  };

  // Generate structured markdown export
  const generateFormattedMarkdown = (verses: MasteredScripture[], categoryName: string): string => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    let md = `# 🛡️ STBA Memory Vault — Scripture Mastery Export\n\n`;
    md += `**Category:** ${categoryName}  \n`;
    md += `**Export Date:** ${dateStr}  \n`;
    md += `**Total Scriptures:** ${verses.length}  \n\n`;
    md += `---\n\n`;

    verses.forEach((v, index) => {
      const prof = getVerseProficiency(v);
      md += `## ${index + 1}. ${v.reference}\n\n`;
      md += `> "${v.text}"\n\n`;
      md += `- **Mastery Score:** **${prof.score}%** (\`${prof.tier}\` • ${prof.recalls} active recall${prof.recalls === 1 ? "" : "s"})\n`;
      md += `- **Retention & Spacing:** ${prof.retentionEstimate} (${prof.decayStatus} • Next review: ${prof.nextIntervalDays}d)\n`;
      md += `- **Track:** ${v.trackLabel || "Scripture Mastery"}\n`;
      md += `- **Book / Chapter:** ${v.bookChapter || "N/A"}\n`;
      md += `- **Date Added:** ${v.dateAdded || "N/A"}\n\n`;

      if (v.theologicalContext) {
        md += `### Theological Significance\n${v.theologicalContext}\n\n`;
      }

      if (v.relatedWhiteQuote) {
        md += `### Spirit of Prophecy (E.G. White)\n> "${v.relatedWhiteQuote}"\n\n`;
      }

      if (v.notes && v.notes.trim()) {
        md += `### Personal Study Notes\n${v.notes}\n\n`;
      }

      if (v.keywords && v.keywords.length > 0) {
        md += `**Memory Keywords:** \`${v.keywords.join("`, `")}\`\n\n`;
      }

      md += `---\n\n`;
    });

    md += `*Exported from Study To Be Approved — Cognitive Scripture Mastery System (CSMS)*\n`;
    return md;
  };

  // Action: Export as formatted text (.txt)
  const exportVersesAsText = (verses: MasteredScripture[], categoryName: string) => {
    if (!verses || verses.length === 0) {
      triggerToast("No scriptures available to export.");
      return;
    }
    const textContent = generateFormattedText(verses, categoryName);
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const sanitizedCat = categoryName.toLowerCase().replace(/[^a-z0-9]/gi, "_");
    const fileName = `stba_memory_vault_${sanitizedCat}_verses.txt`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Exported ${verses.length} scripture${verses.length === 1 ? "" : "s"} as Text (.txt)`);
  };

  // Action: Export as Markdown (.md)
  const exportVersesAsMarkdown = (verses: MasteredScripture[], categoryName: string) => {
    if (!verses || verses.length === 0) {
      triggerToast("No scriptures available to export.");
      return;
    }
    const mdContent = generateFormattedMarkdown(verses, categoryName);
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const sanitizedCat = categoryName.toLowerCase().replace(/[^a-z0-9]/gi, "_");
    const fileName = `stba_memory_vault_${sanitizedCat}.md`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Exported ${verses.length} scripture${verses.length === 1 ? "" : "s"} as Markdown (.md)`);
  };

  // Action: Export / Download as PDF (Print Dialog)
  const exportVersesAsPDF = (verses: MasteredScripture[], categoryName: string) => {
    if (!verses || verses.length === 0) {
      triggerToast("No scriptures available to export.");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      triggerToast("Failed to initialize print dialog.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const verseCardsHtml = verses
      .map(
        (v, i) => {
          const prof = getVerseProficiency(v);
          return `
      <div class="verse-card">
        <div class="verse-header">
          <div>
            <span class="verse-ref">${i + 1}. ${v.reference}</span>
            <span class="verse-chapter">${v.bookChapter || ""}</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="verse-badge" style="background: #eef8f5; color: #166534; font-weight: bold; border: 1px solid #bbf7d0;">
              ★ ${prof.score}% • ${prof.tier} (${prof.recalls} recalls)
            </span>
            <span class="verse-badge">${v.trackLabel || "Scripture"}</span>
          </div>
        </div>
        
        <div class="verse-quote">
          "${v.text}"
        </div>

        ${
          v.theologicalContext
            ? `
          <div class="section-block">
            <div class="section-label">Theological Significance</div>
            <div class="section-body">${v.theologicalContext}</div>
          </div>
        `
            : ""
        }

        ${
          v.relatedWhiteQuote
            ? `
          <div class="egw-block">
            <div class="egw-label">Spirit of Prophecy Alignment (E.G. White)</div>
            <div class="egw-quote">"${v.relatedWhiteQuote}"</div>
          </div>
        `
            : ""
        }

        ${
          v.notes && v.notes.trim()
            ? `
          <div class="notes-block">
            <div class="section-label">Personal Study Notes</div>
            <div class="notes-body">${v.notes.replace(/\n/g, "<br/>")}</div>
          </div>
        `
            : ""
        }
        
        ${
          v.keywords && v.keywords.length > 0
            ? `
          <div class="keywords-row">
            <span class="keywords-label">Memory Hooks:</span> ${v.keywords.join(", ")}
          </div>
        `
            : ""
        }
      </div>
    `;
        }
      )
      .join("");

    const printDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>STBA Memory Vault - ${categoryName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lora:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: letter portrait;
            margin: 1.2cm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1c2333;
            line-height: 1.55;
            padding: 24px;
            background: #fff;
            font-size: 10pt;
          }
          .header {
            border-bottom: 2px solid #C9973A;
            padding-bottom: 14px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .header-title {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 17pt;
            font-weight: 700;
            color: #1c2333;
            letter-spacing: 0.04em;
          }
          .header-subtitle {
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #C9973A;
            font-weight: 700;
            margin-top: 3px;
          }
          .header-meta {
            text-align: right;
            font-size: 8.5pt;
            color: #666;
          }
          .header-count {
            font-weight: 700;
            color: #1c2333;
            margin-top: 2px;
          }
          .verse-card {
            border: 1px solid #E8E4DA;
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 16px;
            page-break-inside: avoid;
            background: #faf9f6;
          }
          .verse-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #E8E4DA;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .verse-ref {
            font-family: 'Lora', Georgia, serif;
            font-size: 12.5pt;
            font-weight: 700;
            color: #9E7422;
            display: block;
          }
          .verse-chapter {
            font-size: 8pt;
            color: #888;
            display: block;
          }
          .verse-badge {
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            background: #f0ebe1;
            color: #7d6537;
            padding: 3px 8px;
            border-radius: 4px;
          }
          .verse-quote {
            font-family: 'Lora', Georgia, serif;
            font-size: 10.5pt;
            line-height: 1.6;
            color: #111;
            background: #ffffff;
            border-left: 3.5px solid #C9973A;
            padding: 10px 14px;
            margin-bottom: 8px;
            border-radius: 0 6px 6px 0;
          }
          .section-block {
            margin-top: 6px;
          }
          .section-label {
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #9E7422;
            margin-bottom: 2px;
          }
          .section-body {
            font-size: 9pt;
            color: #444;
            line-height: 1.45;
          }
          .egw-block {
            margin-top: 6px;
            background: #fdfbf7;
            border: 1px solid #ede4d3;
            border-left: 3px solid #2A9D8F;
            padding: 8px 12px;
            border-radius: 0 6px 6px 0;
          }
          .egw-label {
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #21756A;
            margin-bottom: 2px;
          }
          .egw-quote {
            font-family: 'Lora', Georgia, serif;
            font-size: 8.5pt;
            font-style: italic;
            color: #444;
            line-height: 1.4;
          }
          .notes-block {
            margin-top: 6px;
            background: #ffffff;
            border: 1px solid #E8E4DA;
            padding: 8px 12px;
            border-radius: 6px;
          }
          .notes-body {
            font-size: 8.5pt;
            color: #333;
          }
          .keywords-row {
            margin-top: 6px;
            font-size: 8pt;
            color: #777;
          }
          .keywords-label {
            font-weight: 700;
            color: #555;
          }
          .footer {
            margin-top: 24px;
            border-top: 1px solid #E8E4DA;
            padding-top: 8px;
            font-size: 8pt;
            color: #888;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; background: transparent; }
            .verse-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="header-title">Study To Be Approved</div>
            <div class="header-subtitle">Memory Vault • ${categoryName}</div>
          </div>
          <div class="header-meta">
            <div>Export Date: ${dateStr}</div>
            <div class="header-count">${verses.length} Scripture${verses.length === 1 ? "" : "s"}</div>
          </div>
        </div>
        <div>
          ${verseCardsHtml}
        </div>
        <div class="footer">
          <span>STBA Cognitive Scripture Mastery System (CSMS)</span>
          <span>2 Timothy 2:15 • "Rightly dividing the word of truth"</span>
        </div>
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() {
              try {
                window.parent.document.body.removeChild(window.frameElement);
              } catch (e) {}
            }, 1500);
          };
        <\/script>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printDocument);
    doc.close();
    triggerToast("Opening print / PDF preview...");
  };

  // Action: Copy formatted text to clipboard
  const copyVersesToClipboard = (verses: MasteredScripture[], categoryName: string) => {
    if (!verses || verses.length === 0) {
      triggerToast("No scriptures available to copy.");
      return;
    }
    const textContent = generateFormattedText(verses, categoryName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textContent);
      triggerToast(`Copied ${verses.length} scripture${verses.length === 1 ? "" : "s"} to clipboard!`);
    } else {
      triggerToast("Clipboard access not available.");
    }
  };

  return (
    <div
      id="memory-vault-screen"
      className="w-full text-left"
    >
      {/* SIMULATED TOAST PANEL */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#1C2333] text-white py-3 px-4 text-xs rounded-xl shadow-lg border border-gold/20 flex items-center space-x-2"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="font-sans font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR AND BANNER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E4DA] pb-5 mb-8" id="vault-header-flow">
        <div className="flex items-center space-x-3 text-left">
          <div className="p-2.5 bg-[#C9973A]/10 text-[#C9973A] rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 fill-[#C9973A]/10" />
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#C9973A] font-bold block mb-1">
              Perfect Verbatim Recalls
            </span>
            <h1 className="font-serif font-extrabold text-3.5xl text-[#1C2333] flex items-center gap-2" id="vault-title">
              Memory Vault
              <span
                className="text-xs font-mono font-bold bg-[#C9973A]/10 text-[#C9973A] border border-gold/20 px-2.5 py-0.5 rounded-full"
                id="vault-count-badge"
              >
                {totalVerses} {totalVerses === 1 ? "verse" : "verses"}
              </span>
            </h1>
          </div>
        </div>

        {/* Header Right Action Controls */}
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          {totalVerses > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3.5 py-2 bg-white hover:bg-[#FAF9F5] text-[#1C2333] border border-[#E8E4DA] hover:border-[#C9973A]/60 font-sans font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                id="vault-export-btn"
                aria-label="Export or download scripture verses"
              >
                <Download className="w-3.5 h-3.5 text-[#C9973A]" />
                <span>Export Verses</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isExportMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* DROPDOWN MENU */}
              <AnimatePresence>
                {isExportMenuOpen && (
                  <React.Fragment>
                    <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E8E4DA] rounded-2xl shadow-xl z-50 p-2 text-left"
                      id="vault-export-dropdown"
                    >
                      <div className="px-3 py-2 border-b border-stone-100 mb-1">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-bold block">
                          Export Saved Scriptures
                        </span>
                        <span className="text-xs font-sans text-stone-500 block mt-0.5">
                          {searchQuery || filterTrack !== "All"
                            ? `${sortedList.length} filtered (${activeSourceList.length} total in ${activeTab === "mastered" ? "Vault" : "Favorites"})`
                            : `${activeSourceList.length} verses in ${activeTab === "mastered" ? "Mastered Vault" : "Favorites"}`}
                        </span>
                      </div>

                      {/* Filter scope toggle if filters active */}
                      {(searchQuery || filterTrack !== "All") && (
                        <div className="px-2 py-1.5 bg-stone-50 rounded-xl mb-2 flex items-center justify-between text-[11px]">
                          <span className="text-stone-600 font-medium">Export Scope:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setExportScope("filtered")}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                exportScope === "filtered" ? "bg-[#C9973A] text-white" : "text-stone-500 hover:text-stone-800"
                              }`}
                            >
                              Filtered ({sortedList.length})
                            </button>
                            <button
                              onClick={() => setExportScope("all")}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                exportScope === "all" ? "bg-[#C9973A] text-white" : "text-stone-500 hover:text-stone-800"
                              }`}
                            >
                              All ({activeSourceList.length})
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        {/* 1. Formatted Text (.txt) */}
                        <button
                          onClick={() => {
                            const listToExport =
                              exportScope === "filtered" && (searchQuery || filterTrack !== "All")
                                ? sortedList
                                : activeSourceList;
                            exportVersesAsText(listToExport, activeTab === "mastered" ? "Mastered" : "Favorites");
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full px-3 py-2.5 hover:bg-[#FAF9F5] text-stone-700 hover:text-[#1C2333] rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer text-left group"
                          id="export-txt-btn"
                        >
                          <div className="p-1.5 bg-stone-100 group-hover:bg-[#C9973A]/10 text-stone-500 group-hover:text-[#C9973A] rounded-lg transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold block text-stone-800">Download Text (.txt)</span>
                            <span className="text-[10px] text-stone-400 block">Clean formatted text file</span>
                          </div>
                        </button>

                        {/* 2. Download / Print PDF */}
                        <button
                          onClick={() => {
                            const listToExport =
                              exportScope === "filtered" && (searchQuery || filterTrack !== "All")
                                ? sortedList
                                : activeSourceList;
                            exportVersesAsPDF(listToExport, activeTab === "mastered" ? "Mastered Verses" : "Favorite Scriptures");
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full px-3 py-2.5 hover:bg-[#FAF9F5] text-stone-700 hover:text-[#1C2333] rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer text-left group"
                          id="export-pdf-btn"
                        >
                          <div className="p-1.5 bg-stone-100 group-hover:bg-[#C9973A]/10 text-stone-500 group-hover:text-[#C9973A] rounded-lg transition-colors">
                            <Printer className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold block text-stone-800">Download as PDF / Print</span>
                            <span className="text-[10px] text-stone-400 block">Printable theological layout</span>
                          </div>
                        </button>

                        {/* 3. Markdown (.md) */}
                        <button
                          onClick={() => {
                            const listToExport =
                              exportScope === "filtered" && (searchQuery || filterTrack !== "All")
                                ? sortedList
                                : activeSourceList;
                            exportVersesAsMarkdown(listToExport, activeTab === "mastered" ? "Mastered" : "Favorites");
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full px-3 py-2.5 hover:bg-[#FAF9F5] text-stone-700 hover:text-[#1C2333] rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer text-left group"
                          id="export-md-btn"
                        >
                          <div className="p-1.5 bg-stone-100 group-hover:bg-[#C9973A]/10 text-stone-500 group-hover:text-[#C9973A] rounded-lg transition-colors">
                            <FileDown className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold block text-stone-800">Markdown (.md)</span>
                            <span className="text-[10px] text-stone-400 block">For Obsidian, Notion, or Logseq</span>
                          </div>
                        </button>

                        {/* 4. Copy to Clipboard */}
                        <button
                          onClick={() => {
                            const listToExport =
                              exportScope === "filtered" && (searchQuery || filterTrack !== "All")
                                ? sortedList
                                : activeSourceList;
                            copyVersesToClipboard(listToExport, activeTab === "mastered" ? "Mastered" : "Favorites");
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full px-3 py-2.5 hover:bg-[#FAF9F5] text-stone-700 hover:text-[#1C2333] rounded-xl text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer text-left group"
                          id="export-copy-btn"
                        >
                          <div className="p-1.5 bg-stone-100 group-hover:bg-[#C9973A]/10 text-stone-500 group-hover:text-[#C9973A] rounded-lg transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold block text-stone-800">Copy to Clipboard</span>
                            <span className="text-[10px] text-stone-400 block">Quick plain text copy</span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </React.Fragment>
                )}
              </AnimatePresence>
            </div>
          )}

          {totalVerses > 0 && (
            <button
              onClick={clearVault}
              className="text-xs font-mono text-stone-400 hover:text-red-650 flex items-center space-x-1 hover:underline cursor-pointer"
              id="simulate-empty-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS SEPARATOR FOR MASTERED VS FAVORITES + VIEW MODE TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DA] mb-6 gap-3" id="vault-tab-bar">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("mastered")}
            className={`pb-3 text-sm font-sans font-extrabold uppercase tracking-wider relative transition-all mr-4 cursor-pointer ${
              activeTab === "mastered" ? "text-[#C9973A]" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <span>Mastered Vault</span>
            {activeTab === "mastered" && (
              <motion.div layoutId="vaultTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9973A]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`pb-3 text-sm font-sans font-extrabold uppercase tracking-wider relative transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "favorites" ? "text-[#C9973A]" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeTab === "favorites" ? "fill-current text-[#C9973A]" : ""}`} />
            <span>My Favorites</span>
            <span className="text-[10px] bg-stone-100 text-[#1A1A1A] font-mono px-1.5 py-0.5 rounded-full font-bold">
              {mappedFavoritesList.length}
            </span>
            {activeTab === "favorites" && (
              <motion.div layoutId="vaultTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9973A]" />
            )}
          </button>
        </div>

        {/* View Mode Switcher: Card Grid vs Interactive Verse Map */}
        <div className="flex items-center self-start sm:self-auto bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 mb-2 sm:mb-0">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "cards"
                ? "bg-white text-[#1C2333] shadow-2xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
            id="view-mode-cards-btn"
            title="Switch to Card Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Card Grid</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "map"
                ? "bg-[#C9973A] text-white shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
            id="view-mode-map-btn"
            title="Switch to Interactive Verse Map & Tag Cloud"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Verse Map</span>
            <span
              className={`text-[9px] uppercase font-mono px-1 py-0.2 rounded font-bold ${
                viewMode === "map" ? "bg-white/25 text-white" : "bg-[#C9973A]/15 text-[#A67D2E]"
              }`}
            >
              Cloud
            </span>
          </button>
        </div>
      </div>

      {/* VAULT STATS BAR SECTION */}
      <div 
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border mb-8 ${
          sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]" : "bg-white border-[#E8E4DA] shadow-sm"
        }`}
        id="vault-stats-bar"
      >
        <div className="space-y-1 text-center md:text-left border-b md:border-b-0 pb-3 md:pb-0 border-stone-100">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Total Verses</span>
          <p className="font-serif font-extrabold text-2xl text-[#1C2333]">{totalVerses}</p>
        </div>
        <div className="space-y-1 text-center md:text-left border-b md:border-b-0 pb-3 md:pb-0 border-stone-100">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Avg Mastery Score</span>
          <div className="flex items-center justify-center md:justify-start gap-1.5">
            <p className="font-serif font-extrabold text-2xl text-[#C9973A]">{avgMasteryScore}%</p>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        </div>
        <div className="space-y-1 text-center md:text-left md:border-l md:pl-5 border-stone-100">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Books Covered</span>
          <p className="font-serif font-extrabold text-2xl text-[#1C2333]">{booksCovered}</p>
        </div>
        <div className="space-y-1 text-center md:text-left md:border-l md:pl-5 border-stone-100">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Retention Rate</span>
          <p className="font-serif font-extrabold text-2xl text-[#2A9D8F]">{retentionRate}</p>
        </div>
      </div>

      {/* CORE WORKSPACE SCREEN BODY */}
      <div className="space-y-6" id="vault-workspace-core">
        {viewMode === "map" ? (
          <VerseMap
            verses={activeSourceList}
            onUpdateVerse={handleUpdateVerseCategorization}
            onSelectVerse={(verse) => setSelectedVerse(verse)}
            onLaunchRecallPractice={onLaunchRecallPractice}
            getVerseProficiency={getVerseProficiency}
            sabbathMode={sabbathMode}
          />
        ) : (
          <>
            {/* SEARCH, SORT AND FILTER CONTROL ROW */}
            {masteredList.length > 0 && (
              <div 
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]" : "bg-white border-[#E8E4DA] shadow-sm"
                }`}
                id="vault-controls-area"
              >
            {/* 1. Search Box Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search references, scriptures or annotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-xs font-sans rounded-xl border border-stone-200 outline-none bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#C9973A]/40"
                aria-label="Search your verses input"
                id="search-vault-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-stone-400 hover:text-stone-700 absolute right-3 top-2 text-xs focus:outline-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 2. Sorting Pilling Controls */}
            <div className="flex flex-wrap items-center gap-3 text-xs" id="vault-sort-row">
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-stone-400 uppercase text-[10px] font-mono font-extrabold">Sort by:</span>
                {[
                  { id: "recent", label: "Recent" },
                  { id: "mastery", label: "Mastery Score" },
                  { id: "alpha", label: "Alphabetical" },
                  { id: "book", label: "Book Order" }
                ].map((pill) => {
                  const isActive = sortBy === pill.id;
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setSortBy(pill.id as any)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#C9973A]/10 border-[#C9973A]/40 text-[#A67D2E]"
                          : "bg-white border-stone-200 text-stone-600 hover:text-stone-900"
                      }`}
                      id={`sort-pill-${pill.id}`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              {/* 3. Tracks selection filter */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-stone-400 uppercase text-[10px] font-mono font-extrabold">Track:</span>
                <select
                  value={filterTrack}
                  onChange={(e) => setFilterTrack(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold border border-stone-200 bg-white rounded-lg outline-none text-[#1A1A1A] max-w-[140px]"
                  aria-label="Filter by tracks options select box"
                >
                  {trackOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "All" ? "All Tracks" : opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {activeSourceList.length === 0 ? (
            activeTab === "favorites" ? (
              /* EMPTY FAVORITES STATE */
              <motion.div
                key="empty-state-favorites"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 w-full h-full flex flex-col justify-center items-center text-center py-16 space-y-5 bg-[#FDFAF5] border border-[#E8E4DA] rounded-3xl p-8"
                id="vault-empty-favorites"
              >
                <div className="w-24 h-24 bg-white rounded-full border border-[#E8E2D1] flex items-center justify-center relative shadow-sm">
                  <Star className="w-12 h-12 text-[#C9973A] fill-current opacity-85" />
                  <div className="p-1 bg-[#C9973A] rounded-full border border-white text-white absolute bottom-1 right-3 shadow">
                    <PlusCircle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-2 max-w-[400px]">
                  <h3 className="font-serif font-bold text-[#1C2333] text-xl leading-snug">
                    Your Favorites is Empty
                  </h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed">
                    Bookmark key scriptures from the Dashboard or quarterly lessons to keep them handy here.
                  </p>
                </div>

                <div className="space-y-3 pt-4 w-full max-w-[280px]">
                  <button
                    onClick={() => onNavigate?.("home")}
                    className="w-full py-3 bg-[#C9973A] hover:bg-[#B0822F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer"
                    id="empty-fav-btn"
                  >
                    <span>Go to Dashboard →</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* EMPTY STATE MODULE */
              <motion.div
                key="empty-state-module"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 h-full flex flex-col justify-center items-center text-center py-16 space-y-5 bg-[#FDFAF5] border border-[#E8E4DA] rounded-3xl p-8"
                id="vault-empty-view"
              >
                {/* Centered illustration (SVG of open book with lock) */}
                <div className="w-24 h-24 bg-white rounded-full border border-[#E8E2D1] flex items-center justify-center relative shadow-sm">
                  <svg
                    className="w-12 h-12 text-[#C9973A]/85"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <rect x="9" y="8" width="6" height="6" rx="1" fill="currentColor" opacity="0.15" />
                    <path d="M12 9v2" />
                    <circle cx="12" cy="12" r="1.5" />
                  </svg>
                  {/* Micro Lock icon hanging on the book */}
                  <div className="p-1 bg-red-500 rounded-full border border-white text-white absolute bottom-1 right-3 shadow">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-2 max-w-[400px]">
                  <h3 className="font-serif font-bold text-[#1C2333] text-xl leading-snug">
                    Your Vault is Empty
                  </h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed">
                    Achieve two perfect recalls on any verse study track to lock it in here permanently.
                  </p>
                </div>

                <div className="space-y-3 pt-4 w-full max-w-[280px]">
                  <button
                    onClick={() => onNavigate?.("tracks")}
                    className="w-full py-3 bg-[#C9973A] hover:bg-[#B0822F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer"
                    id="empty-ct-btn"
                    aria-label="Start review session from empty state"
                  >
                    <span>Browse Study Tracks →</span>
                  </button>
                  
                  <button
                    onClick={restoreSeedData}
                    className="text-xs font-mono font-bold text-[#A67D2E] hover:underline block mx-auto flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gold" style={{ display: "inline" }} />
                    <span>Restore Demo Seed Scriptures</span>
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            
            /* DYNAMIC POPULATED VAULT GRID (2-COLUMN ARCHITECTURE) */
            <motion.div
              key="vault-populated-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
              id="populated-vault-stage"
            >
              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="populated-verses-grid">
                {sortedList.map((verse) => {
                  const prof = getVerseProficiency(verse);
                  return (
                    <button
                      key={verse.id}
                      onClick={() => setSelectedVerse(verse)}
                      className={`p-6 bg-white hover:bg-[#FAF9F5]/45 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-sm relative group cursor-pointer ${
                        sabbathMode
                          ? "border-[#E8E2D1]/85 hover:border-gold bg-[#FAF7F0]"
                          : "border-[#E8E4DA] hover:border-gold hover:shadow-md"
                      }`}
                      aria-label={`View expanded mastered verse: ${verse.reference}`}
                      id={`vault-verse-${verse.id}`}
                    >
                      <div className="w-full space-y-4">
                        
                        {/* Header line info with Reference and small Progress Indicator / Mastery Score */}
                        <header className="flex justify-between items-start w-full border-b border-stone-100 pb-3 gap-2">
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-extrabold text-base text-[#C9973A] block">
                                {verse.reference}
                              </span>
                              {/* Small Progress Indicator / Mastery Score Badge */}
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors shadow-2xs ${prof.badgeBg} ${prof.badgeBorder} ${prof.badgeText}`}
                                title={`Mastery Score: ${prof.score}% based on ${prof.recalls} active recall${prof.recalls === 1 ? "" : "s"} and study history (${prof.retentionEstimate} retention)`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${prof.barColor} animate-pulse`} />
                                <span>{prof.score}%</span>
                                <span className="text-[9px] opacity-80 font-sans uppercase font-extrabold tracking-wider hidden sm:inline">
                                  • {prof.tier}
                                </span>
                              </span>
                            </div>
                            <span className="text-xs text-stone-400 block mt-0.5">
                              {verse.bookChapter}
                            </span>
                          </div>

                          {/* Track Label chip */}
                          <span className="text-[10px] font-mono font-extrabold uppercase bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md shrink-0">
                            {verse.trackLabel}
                          </span>
                        </header>

                        {/* Snippet preview */}
                        <p className="font-bible text-sm leading-relaxed text-stone-800 pr-1 line-clamp-3">
                          "{verse.text}"
                        </p>

                        {/* Theme and Tags badge chips */}
                        {(() => {
                          const inferred = inferVerseThemeAndDoctrine(verse);
                          const cardTheme = verse.theme || inferred.theme;
                          const cardTags = (verse.tags && verse.tags.length > 0) ? verse.tags : inferred.tags;
                          return (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#C9973A]/10 text-[#A67D2E] font-bold">
                                {cardTheme}
                              </span>
                              {cardTags.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200/50"
                                >
                                  #{t}
                                </span>
                              ))}
                              {cardTags.length > 2 && (
                                <span className="text-[9px] font-mono text-stone-400">
                                  +{cardTags.length - 2}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <footer className="flex justify-between items-center text-xs font-mono text-stone-400 border-t border-stone-50 pt-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>Added {verse.dateAdded}</span>
                          </div>

                          {/* Milestone progress bar + Recall badge */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* 4-segment visual mastery progress indicator */}
                            <div
                              className="flex items-center gap-0.5 bg-stone-100 p-1 rounded-md"
                              title={`Mastery Stage ${prof.stageMilestones}/4 (${prof.tier}) • Active Recall: ${prof.recalls} run${prof.recalls === 1 ? "" : "s"}`}
                            >
                              {[1, 2, 3, 4].map((step) => (
                                <div
                                  key={step}
                                  className={`w-2.5 h-1.5 rounded-xs transition-all ${
                                    step <= prof.stageMilestones ? prof.barColor : "bg-stone-200"
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Mastery check badge */}
                            <div
                              className={`flex items-center space-x-1 border px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${prof.badgeBg} ${prof.badgeBorder} ${prof.badgeText}`}
                            >
                              <Award className="w-3 h-3 text-current" />
                              <span>{prof.recalls > 0 ? `Recall ×${prof.recalls}` : "Queued"}</span>
                            </div>
                          </div>
                        </footer>

                      </div>
                    </button>
                  );
                })}
              </div>

              {sortedList.length === 0 && (
                <p className="text-center font-serif text-stone-400 text-sm py-12">
                  No mastered scriptures match filter constraints. Let's try resetting search.
                </p>
              )}
            </motion.div>
            
          )}

        </AnimatePresence>
          </>
        )}
      </div>

      {/* DETAILED CARD BACKDROP SHEET EXPANSION (FULL SCREEN OVERLAY DIALOG) */}
      <AnimatePresence>
        {selectedVerse && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVerse(null)}
              className="fixed inset-0 bg-[#1C2333] z-40 cursor-pointer"
              id="selected-verse-veil"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative border ${
                  sabbathMode
                    ? "bg-[#FAF7F0] border-[#E8E2D1] text-[#2C2314]"
                    : "bg-white border-[#E8E4DA] text-[#1A1A1A]"
                }`}
                id="selected-verse-dialog-box"
              >
                <button
                  onClick={() => setSelectedVerse(null)}
                  className="absolute top-5 right-5 p-2 rounded-full border bg-white hover:bg-stone-50 text-[#6B6B6B]"
                  title="Close Verse Details View"
                  aria-label="Close details view modal"
                  id="sheet-v-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-6">
                  {/* Title and track badge summary */}
                  <header className="flex flex-col text-left font-serif" id="verse-sheet-header">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <span className="text-[10px] font-mono tracking-widest text-[#C9973A] uppercase font-bold block">
                        Scriptural Record • {selectedVerse.trackLabel}
                      </span>
                      {(() => {
                        const prof = getVerseProficiency(selectedVerse);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${prof.badgeBg} ${prof.badgeBorder} ${prof.badgeText}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${prof.barColor} animate-pulse`} />
                            <span>Mastery: {prof.score}%</span>
                            <span className="text-[9px] opacity-75 font-sans uppercase font-extrabold">• {prof.tier}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <h3 className="font-serif font-extrabold text-[#111] text-2xl">
                      {selectedVerse.reference}
                    </h3>
                  </header>

                  {/* Active Recall & Retention Proficiency Dashboard Card */}
                  {(() => {
                    const prof = getVerseProficiency(selectedVerse);
                    return (
                      <div className="p-4 rounded-2xl border bg-gradient-to-r from-[#FAF9F5] to-amber-50/40 border-stone-200/70 text-left space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 bg-[#C9973A]/10 text-[#C9973A] rounded-xl">
                              <Brain className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono uppercase font-bold text-stone-400 tracking-wider block">
                                Active Recall & Retention Proficiency
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-serif font-extrabold text-xl text-[#1C2333]">
                                  {prof.score}%
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${prof.badgeBg} ${prof.badgeBorder} ${prof.badgeText}`}
                                >
                                  {prof.tier} Level
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick increment recall test run button */}
                          <button
                            onClick={() => recordActiveRecallSuccess(selectedVerse.id)}
                            className="px-3 py-1.5 bg-white hover:bg-stone-50 text-[#1C2333] border border-stone-200 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs hover:border-[#C9973A] transition-all cursor-pointer"
                            title="Record a successful active recall run for this verse"
                            id="record-recall-run-btn"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#C9973A]" />
                            <span>+ Log Recall</span>
                          </button>
                        </div>

                        {/* Proficiency Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200/60 text-xs">
                          <div className="bg-white/90 p-2 rounded-xl border border-stone-100/80">
                            <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">
                              Active Recalls
                            </span>
                            <span className="font-mono font-bold text-stone-800 text-xs">
                              {prof.recalls} Run{prof.recalls === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-stone-100/80">
                            <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">
                              Retention Est.
                            </span>
                            <span className="font-mono font-bold text-emerald-700 text-xs">
                              {prof.retentionEstimate}
                            </span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-stone-100/80">
                            <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">
                              Decay State
                            </span>
                            <span className="font-mono font-bold text-stone-700 text-xs">
                              {prof.decayStatus}
                            </span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-stone-100/80">
                            <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">
                              Next Spaced Review
                            </span>
                            <span className="font-mono font-bold text-[#C9973A] text-xs">
                              {prof.nextIntervalDays} Days
                            </span>
                          </div>
                        </div>

                        {/* Continuous Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-mono text-stone-400">
                            <span>Mastery Stage {prof.stageMilestones} of 4</span>
                            <span className="font-bold text-stone-600">{prof.score}% Complete</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${prof.barColor} transition-all duration-500`}
                              style={{ width: `${prof.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Full Verse Text block */}
                  <div className="bg-[#FAF9F5] rounded-2xl border border-stone-200/50 p-6 text-left shadow-inner">
                    <p className="font-bible text-lg leading-relaxed text-[#1C2333]">
                      "{selectedVerse.text}"
                    </p>
                  </div>

                  {/* Curated Theological annotation details */}
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider block">
                      Theological Significance
                    </span>
                    <p className="text-[13px] text-stone-600 leading-relaxed">
                      {selectedVerse.theologicalContext}
                    </p>
                  </div>

                  {/* EGW Writing Annotation citation */}
                  {selectedVerse.relatedWhiteQuote && (
                    <div className="p-4 bg-stone-50 border-l-3 border-gold rounded-r-xl text-left space-y-1">
                      <span className="font-serif text-[10px] text-[#A67D2E] block uppercase font-bold tracking-wider">
                        Spirit of Prophecy Alignment (E.G. White)
                      </span>
                      <p className="font-serif text-xs leading-relaxed text-stone-505">
                        "{selectedVerse.relatedWhiteQuote}"
                      </p>
                    </div>
                  )}

                  {/* Doctrinal Categorization & Tags Block */}
                  {(() => {
                    const inferred = inferVerseThemeAndDoctrine(selectedVerse);
                    const modalTheme = selectedVerse.theme || inferred.theme;
                    const modalPillar = selectedVerse.doctrineCategory || inferred.doctrineCategory;
                    const modalTags = (selectedVerse.tags && selectedVerse.tags.length > 0) ? selectedVerse.tags : inferred.tags;
                    return (
                      <div className="p-4 rounded-2xl border bg-stone-50/70 border-stone-200/60 text-left space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#C9973A]" />
                            <span className="text-[10px] font-mono font-bold text-[#C9973A] uppercase tracking-wider">
                              Doctrinal Categorization
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700">
                            {modalPillar}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif font-bold text-[#1C2333]">Theme:</span>
                          <span className="text-xs text-[#A67D2E] font-medium">{modalTheme}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                            Memory Anchors & Tags:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {modalTags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-stone-200/80 text-stone-700 font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Note block editable input field */}
                  <div className="space-y-2 text-left" id="notes-entry-area">
                    <label className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-widest block">
                      Personal Theological Notes (Editable)
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      placeholder="Enter personal memory hooks, application insights, or cross-references..."
                      className="w-full border border-stone-200 rounded-xl p-3 text-xs font-sans outline-none bg-stone-50 focus:bg-white focus:ring-1 focus:ring-[#C9973A]"
                      id="notes-texarea-input"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={saveNoteText}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#1C2333] font-bold text-xs rounded-lg uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                        id="save-personal-note-btn"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Notes</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Action row at bottom */}
                <div className="pt-5 border-t border-stone-100 mt-6 flex flex-wrap sm:flex-nowrap justify-between gap-2.5">
                  <button
                    onClick={() => exportVersesAsText([selectedVerse], selectedVerse.reference)}
                    className="py-3 px-3.5 bg-stone-100 hover:bg-stone-200 text-[#1C2333] font-bold text-xs rounded-xl transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                    id="sheet-v-download-txt-btn"
                    title="Download verse as Formatted Text (.txt)"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                    <span>Save .txt</span>
                  </button>

                  <button
                    onClick={() => exportVersesAsPDF([selectedVerse], selectedVerse.reference)}
                    className="py-3 px-3.5 bg-stone-100 hover:bg-stone-200 text-[#1C2333] font-bold text-xs rounded-xl transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                    id="sheet-v-download-pdf-btn"
                    title="Print / Save verse as PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    onClick={() => shareVerse(selectedVerse)}
                    className="py-3 px-3.5 bg-stone-100 hover:bg-stone-200 text-[#1C2333] font-bold text-xs rounded-xl transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
                    id="sheet-v-share-btn"
                    aria-label="Copy share text to clipboard"
                    title="Copy share text"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => triggerReviewSession(selectedVerse)}
                    className="flex-1 py-3 px-4 bg-[#1C2333] hover:bg-[#2A344A] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                    id="sheet-v-review-btn"
                    aria-label="Initiate verbatim study test"
                  >
                    <RefreshCw className="w-4 h-4 text-gold" style={{ display: "inline" }} />
                    <span>Study Review →</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </React.Fragment>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MemoryVault;
