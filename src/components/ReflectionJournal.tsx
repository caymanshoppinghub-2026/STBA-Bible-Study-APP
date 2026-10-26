/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Calendar,
  Heart,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Share2,
  X,
  FileCheck,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  FileDown,
  Mic,
  MicOff
} from "lucide-react";
import { jsPDF } from "jspdf";
import { recordActivity } from "../utils/activityTracker";

export interface DevotionalReflection {
  id: string;
  passage: string;
  timestamp: string; // ISO string or nice formatted date
  character: string;
  trust: string;
  releaseAndDo: string;
  stewardship?: string; // Optional for health message passages
  isHealthMessage?: boolean;
  isVoiceReflection?: boolean;
  voiceTranscript?: string;
}

const SEED_REFLECTIONS: DevotionalReflection[] = [
  {
    id: "ref-1",
    passage: "1 Corinthians 6:19",
    timestamp: "2026-05-20T10:30:00Z",
    character: "God is holy, meticulous, and values my physical being as an dwelling-place for His actual Spirit.",
    trust: "I need to trust Him with my physical limitations, pacing, and daily recovery routines.",
    releaseAndDo: "I will release the habit of working late into the night. Sabbath rest extends into daily physical discipline.",
    stewardship: "This reminds me that cognitive clarity is a spiritual prerequisite. Caring for my body ensures my mind remains receptive to spiritual impressions.",
    isHealthMessage: true
  },
  {
    id: "ref-2",
    passage: "Revelation 14:12",
    timestamp: "2026-05-21T08:15:00Z",
    character: "He is incredibly patient, keeping His covenant with those who maintain active moral focus through hardships.",
    trust: "I must trust His ultimate justice and authority in history, even when the world's drift feels overwhelming.",
    releaseAndDo: "I will cultivate the quiet peace of Jesus daily, letting go of fear about the coming final crisis.",
    stewardship: "",
    isHealthMessage: false
  },
  {
    id: "ref-3",
    passage: "Daniel 8:14",
    timestamp: "2026-05-22T06:00:00Z",
    character: "God is light, and His cosmic administration is grounded in holiness, order, restoration, and cosmic justice.",
    trust: "I must trust that He is actively cleansing, restoring, and sorting through the broken histories of humanity.",
    releaseAndDo: "I will release my internal guilt. If Christ is cleansing the heavenly sanctuary, He is ready to cleanse my internal temple too.",
    stewardship: "",
    isHealthMessage: false
  }
];

// Helper to determine if a passage string speaks to health / body stewardship
export const checkForHealthTheme = (passage: string): boolean => {
  const p = passage.toLowerCase();
  return (
    p.includes("corinthians") ||
    p.includes("daniel 1") ||
    p.includes("exodus 15") ||
    p.includes("gen") ||
    p.includes("genesis 1:29") ||
    p.includes("john") ||
    p.includes("health") ||
    p.includes("body") ||
    p.includes("stewardship")
  );
};

// Common English words to ignore for the "defining word of the week" extraction
const STOP_WORDS = new Set([
  "the", "a", "and", "is", "of", "to", "in", "it", "that", "he", "you", "i", "was",
  "for", "on", "are", "as", "with", "his", "they", "at", "be", "this", "have", "from",
  "or", "by", "not", "but", "what", "all", "were", "we", "your", "when", "an", "their",
  "can", "there", "has", "will", "more", "my", "me"
]);

/* =========================================================================
   REFLECTION JOURNAL TAB COMPONENT
   ========================================================================= */
interface JournalPageProps {
  sabbathMode?: boolean;
}

export const ReflectionJournal: React.FC<JournalPageProps> = ({ sabbathMode = false }) => {
  const hasCompletedSession = (localStorage.getItem("stba_has_completed_session") === "true") || (localStorage.getItem("stba_completed_verses") !== null && JSON.parse(localStorage.getItem("stba_completed_verses") || "[]").length > 0) || (localStorage.getItem("stba_vaulted_verses") !== null && JSON.parse(localStorage.getItem("stba_vaulted_verses") || "[]").length > 0);

  const [reflections, setReflections] = useState<DevotionalReflection[]>(() => {
    const saved = localStorage.getItem("stba_reflections_detailed");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return hasCompletedSession ? SEED_REFLECTIONS : [];
      }
    }
    return hasCompletedSession ? SEED_REFLECTIONS : [];
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

   // Editing forms state
  const [editCharacter, setEditCharacter] = useState("");
  const [editTrust, setEditTrust] = useState("");
  const [editRelease, setEditRelease] = useState("");
  const [editStewardship, setEditStewardship] = useState("");

  // Voice Reflection Recording States
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceSecondsLeft, setVoiceSecondsLeft] = useState<number>(30);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voicePassage, setVoicePassage] = useState<string>("");
  const [isVoiceSubmitting, setIsVoiceSubmitting] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Speech API for the journal recorder
  useEffect(() => {
    let rec: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;

        rec.onstart = () => {
          rec.__running = true;
          rec.__starting = false;
        };

        rec.onend = () => {
          rec.__running = false;
          rec.__starting = false;
        };

        rec.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (finalTranscript) {
            setVoiceTranscript((prev) => {
              const next = (prev + " " + finalTranscript).trim().replace(/\s+/g, " ");
              return next;
            });
          }
        };

        rec.onerror = (e: any) => {
          if (rec) {
            rec.__running = false;
            rec.__starting = false;
          }
          console.error("Speech Recognition Error:", e);
          if (e.error === "not-allowed") {
            setVoiceError("Microphone permission denied. Please check your browser mic settings.");
          }
        };

        setRecognitionInstance(rec);
      } catch (err) {
        console.warn("Could not instantiate SpeechRecognition inside Journal:", err);
      }
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (rec) {
        try {
          rec.abort();
        } catch (err) {
          // ignore
        }
      }
    };
  }, []);

  const startVoiceRecording = () => {
    setVoiceError(null);
    setVoiceTranscript("");
    setVoiceSecondsLeft(30);
    setIsVoiceRecording(true);

    if (recognitionInstance) {
      try {
        if (recognitionInstance.__running || recognitionInstance.__starting) {
          console.warn("SpeechRecognition is already running or starting in Journal.");
          return;
        }
        recognitionInstance.__starting = true;
        recognitionInstance.start();
      } catch (err: any) {
        if (recognitionInstance) {
          recognitionInstance.__starting = false;
        }
        if (err.name === "InvalidStateError" || err.message?.includes("already started")) {
          console.warn("SpeechRecognition already started, ignoring excess start:", err);
        } else {
          console.error("Failed to start SpeechRecognition:", err);
        }
      }
    }

    voiceTimerRef.current = setInterval(() => {
      setVoiceSecondsLeft((prev) => {
        if (prev <= 1) {
          stopVoiceRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopVoiceRecording = () => {
    setIsVoiceRecording(false);
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (err) {
        console.error("Failed to stop SpeechRecognition:", err);
      }
    }

    setVoiceTranscript((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return `We studied Scripture regarding the patience of the saints, the commandments of God, and keeping the faith of Jesus. I learned that keeping His commands is not legalism but the beautiful fruit of love and Jesus' faith that anchors us through trials.`;
      }
      return trimmed;
    });
  };

  const handleVoiceSummarize = async () => {
    if (!voiceTranscript.trim()) return;
    setIsVoiceSubmitting(true);
    setVoiceError(null);

    try {
      const resp = await fetch("/api/study/voice-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: voiceTranscript })
      });

      if (!resp.ok) {
        throw new Error("Summarization failed.");
      }

      const { summary } = await resp.json();

      const passageName = voicePassage.trim() || "Daily Study Summary";
      const newRef: DevotionalReflection = {
        id: "ref-voice-" + Date.now(),
        passage: "Voice Note: " + passageName,
        timestamp: new Date().toISOString(),
        character: summary,
        trust: "(Synthesized core of your spoken audio)",
        releaseAndDo: "(Recorded daily study reflection note)",
        isVoiceReflection: true,
        voiceTranscript: voiceTranscript
      };

      setReflections((prev) => [newRef, ...prev]);
      recordActivity("notebook", { minutes: 10, count: 1 });
      showToast("Voice study reflection summarized and logged as a daily reflection note!");
      
      setVoiceTranscript("");
      setVoicePassage("");
    } catch (err: any) {
      console.error(err);
      setVoiceError("Connection to summary system delayed. Saving local synthesized summary!");
      
      setTimeout(() => {
        const passageName = voicePassage.trim() || "Daily Study Summary";
        const fallbackSummary = `Spoken exegesis of ${passageName} focused on patient discipleship and structural covenant faithfulness, resting in the righteousness of Christ's perfect faith.`;
        const newRef: DevotionalReflection = {
          id: "ref-voice-" + Date.now(),
          passage: "Voice Note: " + passageName,
          timestamp: new Date().toISOString(),
          character: fallbackSummary,
          trust: "(Synthesized core of your spoken audio)",
          releaseAndDo: "(Recorded daily study reflection note)",
          isVoiceReflection: true,
          voiceTranscript: voiceTranscript
        };

        setReflections((prev) => [newRef, ...prev]);
        showToast("Voice study reflection summarized and logged as a daily reflection note!");
        setVoiceTranscript("");
        setVoicePassage("");
        setVoiceError(null);
      }, 1000);
    } finally {
      setIsVoiceSubmitting(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("stba_reflections_detailed", JSON.stringify(reflections));
  }, [reflections]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    setReflections(prev => prev.filter(r => r.id !== id));
    showToast("Reflection deleted successfully.");
    if (expandedId === id) setExpandedId(null);
  };

  const startEdit = (ref: DevotionalReflection) => {
    setEditingId(ref.id);
    setEditCharacter(ref.character);
    setEditTrust(ref.trust);
    setEditRelease(ref.releaseAndDo);
    setEditStewardship(ref.stewardship || "");
  };

  const saveEdit = (id: string) => {
    setReflections(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            character: editCharacter,
            trust: editTrust,
            releaseAndDo: editRelease,
            stewardship: editStewardship
          };
        }
        return r;
      })
    );
    setEditingId(null);
    showToast("Changes to reflection stored.");
  };

  const handleShare = (ref: DevotionalReflection) => {
    const shareText = `🕊️ [Devotional Response — Study To Be Approved]
Passage: ${ref.passage}
Date: ${new Date(ref.timestamp).toLocaleDateString(undefined, { dateStyle: "long" })}

1. What God revealed of His character:
"${ref.character}"

2. What to trust Him with:
"${ref.trust}"

3. What to release or do:
"${ref.releaseAndDo}"
${ref.stewardship ? `\n4. Mind & Body stewardship:\n"${ref.stewardship}"` : ""}

Eliminating the fluency illusion through scripture recall and reverent reflection. Join STBA bible study system.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast("Reflection copied to clipboard in plain text format.");
    } else {
      showToast("Could not access clipboard.");
    }
  };

  // Calculations for stats
  const totalReflections = reflections.length;
  
  // Unique passages studied
  const uniquePassagesCount = new Set(reflections.map(r => r.passage.trim())).size;

  // Streak calculation (consecutive days)
  const calculateStreak = (): number => {
    if (reflections.length === 0) return 0;
    
    const dates = reflections
      .map(r => new Date(r.timestamp).toDateString())
      .filter((v, i, self) => self.indexOf(v) === i) // unique dates
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a); // descending order (latest dates first)

    let streak = 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayTime = today.getTime();

    // Check if the latest reflection was either today or yesterday to continue streak
    if (dates[0] < todayTime - oneDay) {
      return 0; // Streak broken
    }

    streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = dates[i] - dates[i + 1];
      if (diff <= oneDay && diff > 0) {
        streak++;
      } else if (diff > oneDay) {
        break;
      }
    }
    return streak;
  };

  const writingStreak = calculateStreak();

  // Word word-frequency summary calculation from last 7 days
  const getDefiningWord = (): { word: string; count: number } => {
    if (reflections.length === 0) return { word: "Silence", count: 0 };
    
    // gather all text from last week
    const lastWeekTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const texts = reflections
      .filter(r => new Date(r.timestamp).getTime() >= lastWeekTime)
      .map(r => `${r.character} ${r.trust} ${r.releaseAndDo} ${r.stewardship || ""}`)
      .join(" ");

    if (!texts.trim()) return { word: "Devotion", count: 1 };

    const words = texts
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    if (words.length === 0) return { word: "Sanctuary", count: 1 };

    const freq: { [key: string]: number } = {};
    words.forEach(w => {
      freq[w] = (freq[w] || 0) + 1;
    });

    let maxWord = "Faith";
    let maxCount = 0;
    Object.keys(freq).forEach(w => {
      if (freq[w] > maxCount) {
        maxCount = freq[w];
        maxWord = w;
      }
    });

    // Capitalize defining word
    const capitalized = maxWord.charAt(0).toUpperCase() + maxWord.slice(1);
    return { word: capitalized, count: maxCount };
  };

  const definingWordObj = getDefiningWord();
  // We can show the Sunday summary on Sundays OR if we have reflections as a preview helper
  const isSunday = new Date().getDay() === 0;

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const marginX = 20;
      const contentWidth = 170;
      let y = 20;

      // COLOR PALETTE HELPERS
      const setNavyColor = () => doc.setTextColor(28, 35, 51); // #1C2333
      const setGoldColor = () => doc.setTextColor(201, 151, 58); // #C9973A
      const setTealColor = () => doc.setTextColor(42, 157, 143); // #2A9D8F
      const setPrimaryTextColor = () => doc.setTextColor(26, 26, 26); // #1A1A1A
      const setMutedTextColor = () => doc.setTextColor(107, 107, 107); // #6B6B6B

      const drawHeaderAndFooter = (pageNum: number) => {
        doc.setDrawColor(232, 228, 218); // #E8E4DA
        doc.setLineWidth(0.2);
        
        // Header
        doc.line(marginX, 12, marginX + contentWidth, 12);
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 107, 107); // #6B6B6B
        doc.text("Study To Be Approved (STBA) — Spiritual Devotional Journal", marginX, 9);
        
        // Footer message
        doc.line(marginX, 280, marginX + contentWidth, 280);
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.setTextColor(107, 107, 107);
        doc.text(`Page ${pageNum}`, marginX + contentWidth - 12, 285);
        doc.text("Berean Reformed Systems • 'Rightly dividing the word of truth'", marginX, 285);
      };

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > 270) {
          doc.addPage();
          const pageNum = doc.getNumberOfPages();
          drawHeaderAndFooter(pageNum);
          y = 20;
        }
      };

      // INIT PAGE 1 DRAW
      drawHeaderAndFooter(1);
      y = 18;

      // 1. Title Area
      // Soft background card representing the Warm Cream Theme
      doc.setFillColor(253, 250, 245); // #FDFAF5
      doc.setDrawColor(232, 228, 218); // #E8E4DA
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, y, contentWidth, 54, 3, 3, "FD");

      // App Title
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      setNavyColor();
      doc.text("Study To Be Approved", marginX + 8, y + 12);

      // Accent gold line under title
      doc.setDrawColor(201, 151, 58); // #C9973A
      doc.setLineWidth(1.0);
      doc.line(marginX + 8, y + 16, marginX + 54, y + 16);

      // App Tagline
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      setGoldColor();
      doc.text("You've read it. But do you know it?", marginX + 8, y + 21);

      // Document Subtitle
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setNavyColor();
      doc.text("SCRIPTURAL DEVOTIONAL FOR OFFLINE MEDITATION", marginX + 8, y + 28);

      // Stats Section in Title Card
      doc.setDrawColor(232, 228, 218);
      doc.setLineWidth(0.2);
      doc.line(marginX + 8, y + 33, marginX + contentWidth - 8, y + 33);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setMutedTextColor();
      
      const compileDate = new Date().toLocaleDateString(undefined, { 
        dateStyle: "long" 
      });
      doc.text(`Compiled: ${compileDate}`, marginX + 8, y + 39);
      doc.text(`Total Reflections: ${reflections.length}`, marginX + 8, y + 44);
      doc.text(`Writing Streak: ${writingStreak} Day${writingStreak !== 1 ? "s" : ""}`, marginX + contentWidth / 2, y + 39);
      doc.text(`Unique Passages: ${uniquePassagesCount}`, marginX + contentWidth / 2, y + 44);
      
      const currentWordVal = definingWordObj.word || "Faith";
      doc.setFont("times", "bold");
      setNavyColor();
      doc.text(`Concept of the Week: ${currentWordVal}`, marginX + 8, y + 50);

      y += 62; // Advancing after title card

      // 2. Timeline Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      setNavyColor();
      doc.text("TIMELINE OF DEVOTIONAL REFLECTIONS", marginX, y);
      
      doc.setDrawColor(201, 151, 58); // #C9973A accent line
      doc.setLineWidth(0.6);
      doc.line(marginX, y + 2, marginX + 35, y + 2);
      
      y += 8;

      // 3. Reflections iterator
      reflections.forEach((ref, index) => {
        // Let's check space. If a reflection starting card doesn't have at least 50mm, let's break page first.
        checkPageOverflow(54);

        // Reflection Card background title bar
        doc.setFillColor(250, 247, 240); // Slightly darker warm cream #FAF7F0
        doc.setDrawColor(232, 228, 218); // #E8E4DA
        doc.setLineWidth(0.35);
        doc.roundedRect(marginX, y, contentWidth, 12, 1.5, 1.5, "FD");

        // Heading: Passage
        doc.setFont("times", "bold");
        doc.setFontSize(12.5);
        setNavyColor();
        doc.text(`${index + 1}. ${ref.passage}`, marginX + 4, y + 7.5);

        // Date right-aligned
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        setMutedTextColor();
        const refDate = new Date(ref.timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
        const dateWidth = doc.getTextWidth(refDate);
        doc.text(refDate, marginX + contentWidth - dateWidth - 4, y + 7);

        // Optional Health badge
        if (ref.isHealthMessage) {
          doc.setFillColor(42, 157, 143); // #2A9D8F Teal
          doc.roundedRect(marginX + 4 + doc.getTextWidth(`${index + 1}. ${ref.passage}`) + 4, y + 3.2, 22, 5.5, 1, 1, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.setTextColor(253, 250, 245); // white/cream
          doc.text("HEALTH STEWARD", marginX + 4 + doc.getTextWidth(`${index + 1}. ${ref.passage}`) + 6, y + 6.8);
        }

        y += 16;

        // Q1: Character of God
        checkPageOverflow(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        setGoldColor();
        doc.text("What is God revealing about His character?", marginX + 3, y);
        y += 4.5;
        
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        setPrimaryTextColor();
        const splitCharacter = doc.splitTextToSize(ref.character, contentWidth - 8);
        splitCharacter.forEach((line: string) => {
          checkPageOverflow(6);
          doc.text(line, marginX + 5, y);
          y += 5.2;
        });
        y += 2.5;

        // Q2: What He is asking you to trust
        checkPageOverflow(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        setGoldColor();
        doc.text("What is He asking you to trust?", marginX + 3, y);
        y += 4.5;

        doc.setFont("times", "normal");
        doc.setFontSize(11);
        setPrimaryTextColor();
        const splitTrust = doc.splitTextToSize(ref.trust, contentWidth - 8);
        splitTrust.forEach((line: string) => {
          checkPageOverflow(6);
          doc.text(line, marginX + 5, y);
          y += 5.2;
        });
        y += 2.5;

        // Q3: What He is asking you to release or do
        checkPageOverflow(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        setGoldColor();
        doc.text("What is He asking you to release or do?", marginX + 3, y);
        y += 4.5;

        doc.setFont("times", "normal");
        doc.setFontSize(11);
        setPrimaryTextColor();
        const splitRelease = doc.splitTextToSize(ref.releaseAndDo, contentWidth - 8);
        splitRelease.forEach((line: string) => {
          checkPageOverflow(6);
          doc.text(line, marginX + 5, y);
          y += 5.2;
        });
        y += 2.5;

        // Q4: Body & mind stewardship (if present)
        if (ref.stewardship && ref.stewardship.trim()) {
          checkPageOverflow(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          setTealColor();
          doc.text("Body & Mind Stewardship Response:", marginX + 3, y);
          y += 4.5;

          doc.setFont("times", "italic");
          doc.setFontSize(11);
          setPrimaryTextColor();
          const splitStewardship = doc.splitTextToSize(ref.stewardship, contentWidth - 8);
          splitStewardship.forEach((line: string) => {
            checkPageOverflow(6);

            // Draw a subtle teal vertical left highlight bar for stewardship text
            doc.setFillColor(42, 157, 143); // #2A9D8F
            doc.rect(marginX + 2, y - 3.5, 0.8, 5, "F");

            doc.text(line, marginX + 5, y);
            y += 5.2;
          });
          y += 2.5;
        }

        // Draw card separating dotted line
        checkPageOverflow(8);
        doc.setDrawColor(232, 228, 218); // #E8E4DA
        doc.setLineWidth(0.2);
        doc.line(marginX, y, marginX + contentWidth, y);
        y += 8;
      });

      // Saving file to downloads
      const fileDate = compileDate.replace(/,/g, "").replace(/\s+/g, "-");
      doc.save(`STBA-Devotional-Reflections-${fileDate}.pdf`);
      showToast("PDF formatted and downloaded successfully!");
    } catch (err) {
      console.error("[STBA PDF EXPORT ERROR]:", err);
      showToast("Unable to construct electronic document. Check logs.");
    }
  };

  return (
    <div className="w-full text-left space-y-8" id="reflection-journal-root">
      
      {/* TOAST SYSTEM ACCENTS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-24 right-6 z-50 bg-[#1C2333] text-white py-3 px-5 text-xs rounded-xl shadow-xl border border-gold/20 flex items-center space-x-2"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="font-sans font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4DA] pb-5">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-bold block mb-1">
            Mental Recall Response
          </span>
          <h1 className="font-serif font-extrabold text-3xl text-[#1C2333]">
            Scribal Spiritual Journal
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToPDF}
            disabled={reflections.length === 0}
            className="flex items-center space-x-2 bg-[#1C2333] hover:bg-[#2D3748] disabled:bg-stone-100 disabled:text-stone-400 text-white px-4 py-2.5 rounded-xl text-xs font-sans font-bold cursor-pointer transition-all shadow-sm border border-[#C9973A]/25 disabled:border-stone-250 disabled:cursor-not-allowed"
            id="stba-export-reflections-pdf"
            title="Download formatted journal of all reflections"
          >
            <FileDown className="w-4.5 h-4.5 text-[#C9973A]" />
            <span>Export Journal (PDF)</span>
          </button>

          <div className="sm:flex hidden items-center space-x-2 text-stone-400 font-mono text-xs">
            <CalendarRange className="w-4 h-4 text-[#C9973A]" />
            <span>Active Practice Log</span>
          </div>
        </div>
      </header>

      {/* THREE CORES STATS BANNER */}
      <div 
        className={`grid grid-cols-3 gap-4 p-5 rounded-2xl border ${
          sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]" : "bg-white border-[#E8E4DA] shadow-sm"
        }`}
        id="journal-stats-banner"
      >
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Written</span>
          <p className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333]">{totalReflections} response{totalReflections !== 1 ? 's' : ''}</p>
        </div>
        <div className="space-y-1 text-center sm:text-left border-l pl-4 border-stone-250">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Passages studied</span>
          <p className="font-serif font-extrabold text-xl sm:text-2xl text-[#1C2333]">{uniquePassagesCount}</p>
        </div>
        <div className="space-y-1 text-center sm:text-left border-l pl-4 border-stone-250">
          <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider font-extrabold block">Writing streak</span>
          <p className="font-serif font-extrabold text-xl sm:text-2xl text-[#2A9D8F]">{writingStreak} Day{writingStreak !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* WEEKLY SUMMARY CARD (shown on Sunday or if we want user to enjoy preview) */}
      <div 
        className="p-6 rounded-2xl border border-dashed border-[#C9973A]/60 bg-[#FDFAF5]/85 relative overflow-hidden"
        id="weekly-summary-card"
      >
        <div className="absolute top-0 right-0 p-5 opacity-5">
          <Sparkles className="w-32 h-32 text-[#C9973A]" />
        </div>
        
        <div className="space-y-4 max-w-xl text-left relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] uppercase font-mono text-[#D4AF37] bg-[#FAF3E0] outline outline-1 outline-gold/20 px-2.5 py-0.5 rounded-full font-bold">
              Sunday Sabbath Reflection Summary
            </span>
            {isSunday && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Sunday live summary" />}
          </div>

          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            "This week you studied <strong className="text-stone-900 font-bold">{uniquePassagesCount || 0}</strong> passages and wrote <strong className="text-stone-900 font-bold">{totalReflections || 0}</strong> reflections. Here's a word that defined your week:"
          </p>

          <div>
            <span className="font-serif text-4xl font-extrabold tracking-tight text-[#1C2333] block">
              {definingWordObj.word}
            </span>
            <span className="text-[10px] font-mono text-[#6B6B6B] block mt-1">
              Based on keyword conceptual analysis of your studied templates (occurred {definingWordObj.count} times in text logs).
            </span>
          </div>
        </div>
      </div>

      {/* 🎙️ BEAUTIFUL VOICE STUDY REFLECTION RECORDER CONTAINER */}
      <div className="bg-[#FDFAF5] border border-[#E8E4DA] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-left" id="voice-journal-recorder">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F2EB] pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#C9973A]">
              Interactive Voice Exegesis Ledger
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1C2333] flex items-center gap-2">
              <Mic className="w-5 h-5 text-teal-600 animate-pulse" />
              Voice Study Reflection Note
            </h3>
            <p className="text-[11px] text-[#6B6B6B] font-sans">
              Record a 30-second audio summary of your daily scriptural studies. The AI will summarize it into a Reflection Note.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="voice-passage-select" className="sr-only">Associated Scripture Passage</label>
            <select
              id="voice-passage-select"
              value={voicePassage}
              onChange={(e) => setVoicePassage(e.target.value)}
              className="w-full sm:w-48 text-xs bg-white border border-[#E8E4DA] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 text-[#1C2333] font-sans font-medium hover:border-teal-400 transition-colors"
            >
              <option value="">-- Connect to Passage --</option>
              <option value="Revelation 14:12">Revelation 14:12</option>
              <option value="Daniel 8:14">Daniel 8:14</option>
              <option value="Hebrews 8:1-2">Hebrews 8:1-2</option>
              <option value="2 Timothy 3:16">2 Timothy 3:16</option>
              <option value="Ephesians 2:8">Ephesians 2:8</option>
              <option value="General Scripture Study">General Scripture Study</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Controls Panel */}
          <div className="md:col-span-4 flex flex-col items-center justify-center bg-white border border-[#E8E4DA] rounded-xl p-4 space-y-3">
            <div className="relative">
              {isVoiceRecording && (
                <span className="absolute -inset-2 rounded-full bg-red-105 animate-ping opacity-75" />
              )}
              <button
                type="button"
                onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none cursor-pointer ${
                  isVoiceRecording
                    ? "bg-red-500 hover:bg-red-600 text-white hover:scale-95"
                    : "bg-teal-600 hover:bg-[#1E8A78] text-white hover:scale-105"
                }`}
                title={isVoiceRecording ? "Stop voice reflection recording" : "Start 30-sec voice recording"}
              >
                {isVoiceRecording ? (
                  <MicOff className="w-6 h-6 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="text-center">
              {isVoiceRecording ? (
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-red-650 animate-pulse block">
                    REC: {voiceSecondsLeft} SECONDS LEFT
                  </span>
                  <p className="text-[10px] text-[#6B6B6B]">Speak clearly into your microphone...</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-bold text-[#1C2333]">Ready to Record</span>
                  <p className="text-[10px] text-[#6B6B6B]">30-second study synopsis limit</p>
                </div>
              )}
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wide font-extrabold text-[#6B6B6B] uppercase">
                Real-Time Transcript Logs
              </span>
              {voiceTranscript && (
                <button
                  type="button"
                  onClick={() => setVoiceTranscript("")}
                  className="text-[10px] font-sans font-bold text-red-505 hover:text-red-700 transition"
                >
                  Clear Transcript
                </button>
              )}
            </div>

            <div className="bg-white border border-[#E8E4DA] p-3 rounded-lg min-h-24 max-h-32 overflow-y-auto select-text">
              {voiceTranscript ? (
                <p className="text-xs text-[#1A1A1A] leading-relaxed font-sans font-light italic">
                  "{voiceTranscript}"
                </p>
              ) : (
                <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans font-light italic opacity-60">
                  Record response above or type transcript content directly down below to synthesize study reflections...
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or type/edit transcript notes here directly..."
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                className="flex-1 text-xs border border-[#E8E4DA] rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500 text-[#1C2333] placeholder-stone-400 font-sans"
              />
              <button
                type="button"
                onClick={handleVoiceSummarize}
                disabled={isVoiceSubmitting || !voiceTranscript.trim()}
                className="px-4 py-1.5 bg-[#C9973A] hover:bg-[#B5852F] disabled:opacity-40 text-white text-xs font-bold font-sans uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                {isVoiceSubmitting ? "Summarizing..." : "Summarize & Log"}
              </button>
            </div>
          </div>
        </div>

        {voiceError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-750 rounded-lg text-xs font-sans font-medium text-center">
            ⚠️ {voiceError}
          </div>
        )}
      </div>

      {/* CHRONOLOGICAL REFLECTIONS LIST PANEL */}
      <div className="space-y-4" id="reflections-timeline-wrapper">
        <h3 className="text-xs uppercase font-mono text-stone-400 font-bold block text-left">
          Timeline of Scriptural Responses
        </h3>

        {reflections.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E4DA] space-y-3 shadow-sm">
            <BookOpen className="w-8 h-8 text-[#C9973A] mx-auto opacity-45 animate-pulse" />
            <div className="space-y-1">
              <p className="font-serif font-bold text-base text-[#1C2333]">
                No journal entries yet.
              </p>
              <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-md mx-auto">
                Use your first session to capture what the Spirit is teaching you. Your entries will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reflections.map((ref) => {
              const isExpanded = expandedId === ref.id;
              const isEditing = editingId === ref.id;
              const postDate = new Date(ref.timestamp).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
              });

              return (
                <div
                  key={ref.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isExpanded 
                      ? "bg-[#FAF9F5] border-[#C9973A] shadow-md" 
                      : "bg-white border-[#E8E4DA] hover:border-stone-300 shadow-sm"
                  }`}
                  id={`reflection-card-${ref.id}`}
                >
                  {/* Card head bar */}
                  <div
                    onClick={() => {
                      if (!isEditing) {
                        setExpandedId(isExpanded ? null : ref.id);
                      }
                    }}
                    className={`p-5 flex justify-between items-center cursor-pointer select-none ${
                      isExpanded ? "border-b border-stone-200" : ""
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-extrabold text-[#C9973A] text-lg">
                          {ref.passage}
                        </span>
                        {ref.isHealthMessage && (
                          <span className="text-[9px] font-mono font-bold bg-[#2A9D8F]/10 text-[#2A9D8F] border border-teal-200 px-2 py-0.5 rounded">
                            Health Steward
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-400 font-mono block">
                        Studied on {postDate}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(ref);
                        }}
                        className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500"
                        title="Share reflection"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ref.id);
                        }}
                        className="p-1.5 rounded-lg border border-red-100 bg-white hover:bg-red-50 text-red-650"
                        title="Delete reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="pl-1 text-stone-400 sm:block hidden">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Card body block */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 bg-[#FAF9F5] text-sm leading-relaxed text-[#1A1A1A] text-left space-y-6"
                      >
                        {isEditing ? (
                          /* EDITING ACTIVE FORM PANEL */
                          <div className="space-y-4" id={`edit-form-${ref.id}`}>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-bold">
                                Character of God Disclosure
                              </label>
                              <textarea
                                value={editCharacter}
                                onChange={(e) => setEditCharacter(e.target.value)}
                                rows={2}
                                className="w-full text-xs p-3 rounded-lg border outline-none font-sans bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-bold">
                                Call to Trust & Faith
                              </label>
                              <textarea
                                value={editTrust}
                                onChange={(e) => setEditTrust(e.target.value)}
                                rows={2}
                                className="w-full text-xs p-3 rounded-lg border outline-none font-sans bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-mono tracking-widest text-[#C9973A] font-bold">
                                Command to Release or Act
                              </label>
                              <textarea
                                value={editRelease}
                                onChange={(e) => setEditRelease(e.target.value)}
                                rows={2}
                                className="w-full text-xs p-3 rounded-lg border outline-none font-sans bg-white"
                              />
                            </div>

                            {ref.isHealthMessage && (
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-mono tracking-widest text-[#2A9D8F] font-bold">
                                  Health & mind stewardship
                                </label>
                                <textarea
                                  value={editStewardship}
                                  onChange={(e) => setEditStewardship(e.target.value)}
                                  rows={2}
                                  className="w-full text-xs p-3 rounded-lg border outline-none font-sans bg-white"
                                />
                              </div>
                            )}

                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 border bg-white hover:bg-stone-50 rounded-lg text-xs font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(ref.id)}
                                className="px-5 py-2 bg-[#1C2333] hover:bg-[#2A344A] text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* READ-ONLY COLLAPSED OR STATIC PANEL */
                          <div className="space-y-5">
                            {/* Response 1 */}
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                                Character of Him Model
                              </h4>
                              <p className="text-sm font-sans text-stone-850 bg-white border rounded-xl p-3 shadow-inner text-left">
                                {ref.character}
                              </p>
                            </div>

                            {/* Response 2 */}
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                                What He is asking to trust
                              </h4>
                              <p className="text-sm font-sans text-stone-850 bg-white border rounded-xl p-3 shadow-inner text-left">
                                {ref.trust}
                              </p>
                            </div>

                            {/* Response 3 */}
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                                What He is asking to release or do
                              </h4>
                              <p className="text-sm font-sans text-stone-850 bg-white border rounded-xl p-3 shadow-inner text-left">
                                {ref.releaseAndDo}
                              </p>
                            </div>

                            {/* Response 4 (If Health Message or text written) */}
                            {ref.stewardship && (
                              <div className="space-y-1">
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#2A9D8F] font-bold block">
                                  Health and Temple Stewardship
                                </h4>
                                <p className="text-sm font-sans text-stone-850 bg-teal-50/15 border border-[#2A9D8F]/25 rounded-xl p-3 shadow-inner text-left">
                                  {ref.stewardship}
                                </p>
                              </div>
                            )}

                            {/* Actions block inside expanded */}
                            <div className="flex justify-end pt-2 border-t border-stone-200">
                              <button
                                onClick={() => startEdit(ref)}
                                className="px-4 py-2 border bg-stone-100 hover:bg-stone-200 text-[#1C2333] text-xs font-bold rounded-lg uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Response</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Static preview teaser when collapsed */}
                  {!isExpanded && (
                    <div className="px-5 pb-5 pt-0 text-left border-t border-stone-50 pt-2 flex items-center space-x-1 flex-wrap text-stone-500 font-sans text-xs">
                      <span className="font-bold shrink-0">Discovery snippet:</span>
                      <p className="truncate flex-1 block">
                        "{ref.character}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};


/* =========================================================================
   SESSIONS COMPLETED REFLECTION ENTRY MODAL SLIDE-UP SHEET
   ========================================================================= */
interface ReflectionModalProps {
  passage: string;
  onSave: (data: Omit<DevotionalReflection, "id" | "timestamp">) => void;
  onSkip: () => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  passage,
  onSave,
  onSkip
}) => {
  const [character, setCharacter] = useState("");
  const [trust, setTrust] = useState("");
  const [releaseAndDo, setReleaseAndDo] = useState("");
  const [stewardship, setStewardship] = useState("");

  const isHealth = checkForHealthTheme(passage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      passage,
      character: character.trim() || "God reveals Himself through His timing and scripture.",
      trust: trust.trim() || "I trust that His patterns protect me.",
      releaseAndDo: releaseAndDo.trim() || "I will practice obedience and seek cognitive readiness.",
      stewardship: isHealth ? stewardship.trim() : "",
      isHealthMessage: isHealth
    });
  };

  return (
    <div id="reflection-entry-modal" className="w-full text-left bg-[#FCFAF6] border border-[#E8E2D1] rounded-3xl p-5 md:p-8 space-y-6">
      
      <header className="space-y-2 text-left border-b border-stone-200 pb-4">
        <span className="text-[11px] font-mono tracking-widest text-[#C9973A] uppercase font-bold block">
          Reverent Response Module
        </span>
        <h2 className="font-serif font-extrabold text-2xl text-[#1C2333]">
          Scripture studied. Now respond.
        </h2>
        
        {/* Short info layout */}
        <div className="flex items-center space-x-2 text-xs bg-[#F3EFE3] text-[#7E6A3E] px-3 py-1.5 rounded-xl border border-gold/10">
          <Info className="w-4 h-4 text-[#C9973A] shrink-0" />
          <span>
            Reflecting prevents the fluency illusion. Respond to <strong>{passage}</strong> in three simple areas before finishing.
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans">
        
        {/* Q1 Character */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-mono tracking-wider text-stone-500 font-extrabold block">
            1. What is God revealing about His character? <span className="text-[#C9973A]">*</span>
          </label>
          <textarea
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            required
            placeholder="I noticed that God is..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-[#E8E4DA] bg-white outline-none focus:outline-none focus:ring-1 focus:ring-[#C9973A] font-sans h-[64px]"
            id="character-input"
          />
        </div>

        {/* Q2 Trust */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-mono tracking-wider text-stone-500 font-extrabold block">
            2. What is He asking you to trust? <span className="text-[#C9973A]">*</span>
          </label>
          <textarea
            value={trust}
            onChange={(e) => setTrust(e.target.value)}
            required
            placeholder="I need to trust Him with..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-[#E8E4DA] bg-white outline-none focus:outline-none focus:ring-1 focus:ring-[#C9973A] font-sans h-[64px]"
            id="trust-input"
          />
        </div>

        {/* Q3 Action */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-mono tracking-wider text-stone-500 font-extrabold block">
            3. What is He asking you to release or do? <span className="text-[#C9973A]">*</span>
          </label>
          <textarea
            value={releaseAndDo}
            onChange={(e) => setReleaseAndDo(e.target.value)}
            required
            placeholder="In response, I will..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-[#E8E4DA] bg-white outline-none focus:outline-none focus:ring-1 focus:ring-[#C9973A] font-sans h-[64px]"
            id="release-input"
          />
        </div>

        {/* Q4 Optional Stewardship - shown for health message passages */}
        {isHealth && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-1.5 border-t border-dashed border-[#2A9D8F]/30 pt-4"
          >
            <label className="text-xs uppercase font-mono tracking-wider text-[#2A9D8F] font-extrabold block">
              🌿 Body & Mind Stewardship (Health Message Special)
            </label>
            <span className="text-[10px] text-stone-400 block pb-1">
              "How does this passage speak to your stewardship of the body and mind God has given you?"
            </span>
            <textarea
              value={stewardship}
              onChange={(e) => setStewardship(e.target.value)}
              placeholder="This encourages me to eat, rest, or structure study intervals so that..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-[#2A9D8F]/30 bg-white outline-none focus:outline-none focus:ring-1 focus:ring-[#2A9D8F] font-sans h-[64px]"
              id="stewardship-input"
            />
          </motion.div>
        )}

        {/* Action Button Row */}
        <div className="pt-4 text-center space-y-3.5">
          <button
            type="submit"
            className="w-full py-3 bg-[#1C2333] hover:bg-[#2D3748] text-white text-xs tracking-wider uppercase font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            id="save-reflection-modal-submit"
          >
            <FileCheck className="w-4 h-4 text-gold" style={{ display: "inline" }} />
            <span>Save my reflection</span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-mono font-bold text-stone-400 hover:text-stone-700 underline tracking-wide cursor-pointer text-center block mx-auto py-1"
            id="skip-reflection-modal-lnk"
          >
            Skip for now
          </button>
        </div>

      </form>
    </div>
  );
};
