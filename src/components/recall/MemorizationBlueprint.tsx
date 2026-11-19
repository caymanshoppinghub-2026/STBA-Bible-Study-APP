/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  CheckCircle2,
  Brain,
  Flame,
  Clock,
  Volume2,
  VolumeX,
  PenTool,
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Zap,
  Trophy,
  RotateCcw,
  Sparkles,
  BookOpen,
  Play,
  Check,
  X,
  HelpCircle,
  Award,
  Target,
  ChevronRight,
  Copy,
  Send,
  Headphones,
  ClipboardCheck,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Scripture } from "../../types";
import { getParallelVerses } from "../stba/bibleData";

interface MemorizationBlueprintProps {
  onLaunchRecall?: (scripture?: Scripture) => void;
  initialScripture?: Scripture;
}

interface BlueprintVerse {
  id: string;
  reference: string;
  text: string;
  chapterContext: string;
  doctrineTheme: string;
  sanctuaryStationId: string;
  sensoryPairs: { phrase: string; cue: string }[];
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  teachingTemplates: {
    child: { hook: string; analogy: string; takeaway: string };
    friend: { hook: string; analogy: string; takeaway: string };
    group: { hook: string; analogy: string; takeaway: string };
  };
}

const BLUEPRINT_VERSES: BlueprintVerse[] = [
  {
    id: "2-tim-3-16",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    chapterContext: "Paul charges Timothy to stand firm in the sacred writings amidst last-day deception.",
    doctrineTheme: "The Holy Scriptures (Sola Scriptura)",
    sanctuaryStationId: "candlestick",
    sensoryPairs: [
      { phrase: "All scripture is given by inspiration of God", cue: "Divine Breath (Theopneustos)" },
      { phrase: "profitable for doctrine", cue: "Reveals True Biblical Teaching" },
      { phrase: "for reproof, for correction", cue: "Exposes Error & Restores Alignment" },
      { phrase: "for instruction in righteousness", cue: "Trains Character in God's Way" }
    ],
    quizQuestion: {
      question: "According to 2 Timothy 3:16, what is the origin of all Scripture?",
      options: [
        "A. Written by human wisdom alone",
        "B. Breathed out by inspiration of God",
        "C. Passed down through church councils",
        "D. Restricted only to ancient prophets"
      ],
      correctIndex: 1,
      explanation: "“Given by inspiration of God” translates the Greek theopneustos—literally “God-breathed.”"
    },
    teachingTemplates: {
      child: {
        hook: "The Bible isn't just an old storybook—it carries God's own breath and voice.",
        analogy: "Like a compass and flashlight on a dark trail, Scripture shows us where we stepped off the path and how to get back safely.",
        takeaway: "Every time we read a verse, we are listening to God coach us to live with love and truth."
      },
      friend: {
        hook: "2 Timothy 3:16 explains why Scripture remains trustworthy: its source is divine inspiration, not shifting culture.",
        analogy: "Think of it like a master architect's blueprint—it defines the design (doctrine), spots structural flaws (reproof), repairs alignment (correction), and guides daily building (righteousness).",
        takeaway: "Testing our life choices by Scripture brings clarity and lasting peace."
      },
      group: {
        hook: "Paul outlines a fourfold pedagogical framework for the Word of God in believers' lives.",
        analogy: "Doctrine establishes orthodoxy; reproof convicts the conscience; correction straightens uprightness; instruction nurtures ongoing sanctification.",
        takeaway: "Where in our weekly study can we move from merely reading text to allowing the Word to correct and train us?"
      }
    }
  },
  {
    id: "rev-14-12",
    reference: "Revelation 14:12",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    chapterContext: "Climax of the Three Angels' Messages contrasting true worshipers with Babylon.",
    doctrineTheme: "The Remnant & Three Angels' Messages",
    sanctuaryStationId: "ark",
    sensoryPairs: [
      { phrase: "Here is the patience of the saints", cue: "Steadfast End-Time Endurance" },
      { phrase: "here are they that keep", cue: "Loyal, Loving Obedience" },
      { phrase: "the commandments of God", cue: "The Moral Law & Sabbath Seal" },
      { phrase: "and the faith of Jesus", cue: "Christ's Trusting Victory in Us" }
    ],
    quizQuestion: {
      question: "What two characteristics identify God's end-time people in Revelation 14:12?",
      options: [
        "A. Wealth and political influence",
        "B. Keeping the commandments of God and the faith of Jesus",
        "C. Miraculous signs without obedience",
        "D. Solitary monastic withdrawal"
      ],
      correctIndex: 1,
      explanation: "Revelation 14:12 unites law and grace: keeping God's commandments through the living faith of Jesus."
    },
    teachingTemplates: {
      child: {
        hook: "God's friends at the end of time love Him so much they follow His rules and trust Jesus completely.",
        analogy: "It's like riding a two-wheeled bicycle: one wheel is obeying God's ten commandments, and the other wheel is trusting Jesus' faith.",
        takeaway: "With Jesus helping us, we can stay patient and faithful no matter what happens."
      },
      friend: {
        hook: "Revelation 14:12 shows that obedience and grace aren't opposites—they belong together.",
        analogy: "Like two wings of an eagle, the commandments of God and the faith of Jesus work together to lift the believer.",
        takeaway: "True faith in Jesus naturally leads us to honor what God values."
      },
      group: {
        hook: "Revelation 14:12 serves as the covenant signature of the remnant church after the Three Angels' proclamation.",
        analogy: "Hovering above the Ark of the Covenant in the Most Holy Place, the Mercy Seat (grace/faith of Jesus) covers the Ten Commandments (law of God).",
        takeaway: "How does cultivating the faith OF Jesus empower commandment-keeping without legalism?"
      }
    }
  },
  {
    id: "psalm-119-11",
    reference: "Psalm 119:11",
    text: "Thy word have I hid in mine heart, that I might not sin against thee.",
    chapterContext: "A young believer's meditation on purity and spiritual defense through treasured Scripture.",
    doctrineTheme: "Growing in Christ & Spiritual Victory",
    sanctuaryStationId: "incense",
    sensoryPairs: [
      { phrase: "Thy word", cue: "God's Spoken & Written Promise" },
      { phrase: "have I hid in mine heart", cue: "Deep Internalized Treasury" },
      { phrase: "that I might not sin", cue: "Active Shield Against Temptation" },
      { phrase: "against thee", cue: "Relational Loyalty to God" }
    ],
    quizQuestion: {
      question: "In Psalm 119:11, why does the psalmist treasure God's Word in the heart?",
      options: [
        "A. To win theological debates",
        "B. That I might not sin against Thee",
        "C. To impress religious leaders",
        "D. To replace daily prayer"
      ],
      correctIndex: 1,
      explanation: "Internalizing Scripture in the heart provides immediate spiritual defense and relational fidelity when temptation strikes."
    },
    teachingTemplates: {
      child: {
        hook: "Putting Bible verses inside your heart is like storing treasure in a safe chest.",
        analogy: "Just like an umbrella keeps you dry when rain suddenly starts, a verse in your heart protects you when you feel tempted to do wrong.",
        takeaway: "Memorizing one verse today helps us make kind, honest choices tomorrow."
      },
      friend: {
        hook: "We don't memorize Scripture just for trivia—we store it in our core to guide split-second moral decisions.",
        analogy: "In a moment of stress, you don't have time to search a library; you rely on what is already loaded into working memory.",
        takeaway: "Internalized truth reshapes our instincts and protects our relationships."
      },
      group: {
        hook: "Psalm 119:11 reveals the neuro-spiritual link between cognitive scripture retention and sanctification.",
        analogy: "Just as Christ answered every wilderness temptation with 'It is written,' stored Scripture supplies the Holy Spirit with immediate ammunition.",
        takeaway: "Which area of daily temptation in your life needs a specific promise anchored in your heart this week?"
      }
    }
  },
  {
    id: "heb-4-12",
    reference: "Hebrews 4:12",
    text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
    chapterContext: "Entering God's Sabbath rest through the living, searching power of His Word.",
    doctrineTheme: "Living Word & Heart Discernment",
    sanctuaryStationId: "altar",
    sensoryPairs: [
      { phrase: "the word of God is quick, and powerful", cue: "Living & Energizing Force" },
      { phrase: "sharper than any twoedged sword", cue: "Precision Spiritual Surgery" },
      { phrase: "dividing asunder of soul and spirit", cue: "Separates Selfishness from Pure Faith" },
      { phrase: "discerner of the thoughts and intents", cue: "Reads the Deepest Motives" }
    ],
    quizQuestion: {
      question: "What does Hebrews 4:12 say the Word of God discerns?",
      options: [
        "A. Future stock market trends",
        "B. Outward appearances only",
        "C. The thoughts and intents of the heart",
        "D. Ancient military strategies"
      ],
      correctIndex: 2,
      explanation: "God's living Word penetrates beyond outward behavior to examine and heal our deepest thoughts and motives."
    },
    teachingTemplates: {
      child: {
        hook: "God's Word is alive and strong—like a gentle surgeon's tool that fixes our hearts.",
        analogy: "An X-ray at the doctor's office can see inside our bones to help us heal; God's Word sees our real thoughts so Jesus can help us grow.",
        takeaway: "We can always be honest with God because He knows our heart and loves us."
      },
      friend: {
        hook: "Hebrews 4:12 describes the Bible not as dead ink, but as a living diagnostic mirror.",
        analogy: "While most books are read by us, Scripture is the one book that reads us—revealing our hidden motives with surgical precision.",
        takeaway: "Letting Scripture examine our motives frees us from self-deception."
      },
      group: {
        hook: "In the context of Hebrews 4's Sabbath rest, the two-edged Word prepares the believer for the sanctuary judgment.",
        analogy: "Like the priest's sacrificial knife at the Altar dividing joints and marrow, the Word separates carnal impulses (soul) from spiritual devotion (spirit).",
        takeaway: "How can we invite the Word to search our motives before we speak or act?"
      }
    }
  }
];

interface SanctuaryStation {
  id: string;
  name: string;
  zone: "Courtyard" | "Holy Place" | "Most Holy Place";
  meaning: string;
  verseRef: string;
  verseSnippet: string;
  accent: string;
}

const SANCTUARY_STATIONS: SanctuaryStation[] = [
  {
    id: "altar",
    name: "Altar of Burnt Offering",
    zone: "Courtyard",
    meaning: "Christ's Sacrifice & Justification",
    verseRef: "John 1:29",
    verseSnippet: "Behold the Lamb of God, which taketh away the sin of the world.",
    accent: "#F59E0B"
  },
  {
    id: "laver",
    name: "Brazen Laver",
    zone: "Courtyard",
    meaning: "Cleansing, Baptism & Rebirth",
    verseRef: "1 John 1:9",
    verseSnippet: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us.",
    accent: "#38BDF8"
  },
  {
    id: "candlestick",
    name: "Golden Candlestick",
    zone: "Holy Place",
    meaning: "Holy Spirit & Lamp of Scripture",
    verseRef: "2 Timothy 3:16",
    verseSnippet: "All scripture is given by inspiration of God, and is profitable for doctrine...",
    accent: "#FBBF24"
  },
  {
    id: "showbread",
    name: "Table of Showbread",
    zone: "Holy Place",
    meaning: "Christ the Living Bread of Life",
    verseRef: "Matthew 4:4",
    verseSnippet: "Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.",
    accent: "#D97706"
  },
  {
    id: "incense",
    name: "Golden Altar of Incense",
    zone: "Holy Place",
    meaning: "Christ's Intercession & Prayer",
    verseRef: "Psalm 119:11",
    verseSnippet: "Thy word have I hid in mine heart, that I might not sin against thee.",
    accent: "#A855F7"
  },
  {
    id: "ark",
    name: "Ark of the Covenant",
    zone: "Most Holy Place",
    meaning: "God's Moral Law, Mercy Seat & Sabbath",
    verseRef: "Revelation 14:12",
    verseSnippet: "Here are they that keep the commandments of God, and the faith of Jesus.",
    accent: "#10B981"
  }
];

interface PillarProgressState {
  pillar1Completed: boolean;
  pillar1BestWpm: number;
  pillar2Completed: boolean;
  pillar2Stage: number; // 1..3
  pillar3Completed: boolean;
  pillar3Score: number;
  pillar4Completed: boolean;
  pillar4Level: number; // 1..5
  pillar4Streak: number;
  pillar5Completed: boolean;
  pillar5NotesCount: number;
  snoozeUntil?: number;
}

const DEFAULT_PROGRESS: PillarProgressState = {
  pillar1Completed: false,
  pillar1BestWpm: 0,
  pillar2Completed: false,
  pillar2Stage: 1,
  pillar3Completed: false,
  pillar3Score: 0,
  pillar4Completed: false,
  pillar4Level: 1,
  pillar4Streak: 0,
  pillar5Completed: false,
  pillar5NotesCount: 0
};

export const MemorizationBlueprint: React.FC<MemorizationBlueprintProps> = ({
  onLaunchRecall,
  initialScripture
}) => {
  const { showConfetti } = useApp();

  // Audio feedback synthesizer
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const playTone = useCallback(
    (freq: number, duration = 0.1, type: OscillatorType = "sine") => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
        setTimeout(() => ctx.close().catch(() => {}), duration * 1000 + 100);
      } catch {
        // Ignore audio errors when un-interacted
      }
    },
    [soundEnabled]
  );

  // Custom user-added Blueprint verses persisted in localStorage
  const [customVerses, setCustomVerses] = useState<BlueprintVerse[]>(() => {
    try {
      const saved = localStorage.getItem("stba_blueprint_custom_verses_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const allBlueprintVerses = useMemo(
    () => [...BLUEPRINT_VERSES, ...customVerses],
    [customVerses]
  );

  // Selected Blueprint Verse
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number>(() => {
    if (initialScripture?.reference) {
      const idx = BLUEPRINT_VERSES.findIndex(
        (v) => v.reference.toLowerCase() === initialScripture.reference.toLowerCase()
      );
      if (idx >= 0) return idx;
    }
    return 0;
  });

  const activeVerse = allBlueprintVerses[selectedVerseIndex] || allBlueprintVerses[0];

  // Manual Scripture Input state
  const [manualRefInput, setManualRefInput] = useState<string>("");
  const [manualTextInput, setManualTextInput] = useState<string>("");
  const [manualStatusMsg, setManualStatusMsg] = useState<string | null>(null);

  const buildCustomBlueprintVerse = useCallback((refStr: string, textStr: string): BlueprintVerse => {
    const cleanRef = refStr.trim();
    const cleanTxt = textStr.trim();
    const words = cleanTxt.split(/\s+/).filter(Boolean);
    const quarter = Math.max(2, Math.ceil(words.length / 4));
    const p1 = words.slice(0, quarter).join(" ") || cleanTxt;
    const p2 = words.slice(quarter, quarter * 2).join(" ") || cleanTxt;
    const p3 = words.slice(quarter * 2, quarter * 3).join(" ") || cleanTxt;
    const p4 = words.slice(quarter * 3).join(" ") || cleanTxt;

    return {
      id: `custom-${Date.now()}`,
      reference: cleanRef,
      text: cleanTxt,
      chapterContext: `Personal scripture mastery focus on ${cleanRef}.`,
      doctrineTheme: "Personal Scripture Mastery",
      sanctuaryStationId: "candlestick",
      sensoryPairs: [
        { phrase: p1, cue: "Opening Covenant Declaration" },
        { phrase: p2, cue: "Core Theological Principle" },
        { phrase: p3, cue: "Spiritual Transformation & Action" },
        { phrase: p4, cue: "Eternal Promise & Fulfillment" }
      ],
      quizQuestion: {
        question: `Which key phrase belongs to your active memory passage in ${cleanRef}?`,
        options: [
          `A. “${p1}...”`,
          "B. “Written only by human tradition...”",
          "C. “Without faith or obedience...”",
          "D. “Hidden from the sanctuary...”"
        ],
        correctIndex: 0,
        explanation: `${cleanRef} begins with: “${p1}...”`
      },
      teachingTemplates: {
        child: {
          hook: `${cleanRef} reminds us of God's loving promise: “${p1}...”`,
          analogy: "Just like a lamp lights up our bedroom at night, keeping this verse in our heart guides every step we take.",
          takeaway: `Let's say ${cleanRef} together today and share its kindness with a friend.`
        },
        friend: {
          hook: `In ${cleanRef}, Scripture anchors our perspective: “${cleanTxt}”`,
          analogy: "Think of this verse as a mental compass that recalibrates our priorities when daily life gets noisy.",
          takeaway: "Applying this truth brings clarity, resilience, and peace."
        },
        group: {
          hook: `${cleanRef} provides a vital biblical anchor for personal discipleship and spiritual endurance.`,
          analogy: "Comparing Scripture with Scripture line upon line, this passage harmonizes God's character with practical daily faith.",
          takeaway: `How can our study group live out the principle of ${cleanRef} this week?`
        }
      }
    };
  }, []);

  const handleLookupManualReference = () => {
    const trimmedRef = manualRefInput.trim();
    if (!trimmedRef) {
      setManualStatusMsg("Enter a scripture reference first (e.g., John 3:16).");
      return;
    }
    try {
      const found = getParallelVerses(trimmedRef);
      if (found && found.length > 0) {
        const combinedText = found
          .map((v) => v.text.KJV || v.text.NKJV || v.text.ESV || "")
          .filter(Boolean)
          .join(" ")
          .trim();
        if (combinedText && !combinedText.toLowerCase().includes("translation not set")) {
          setManualTextInput(combinedText);
          setManualStatusMsg(`Loaded KJV text for ${trimmedRef}.`);
          playTone(587.33, 0.1, "sine");
          return;
        }
      }
    } catch {}
    setManualStatusMsg("Reference not in offline preset cache—type or paste the verse text directly below.");
  };

  const handleApplyManualScripture = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedRef = manualRefInput.trim();
    const trimmedText = manualTextInput.trim();
    if (!trimmedRef || !trimmedText) {
      setManualStatusMsg("Please provide both a Scripture Reference and the Verse Text.");
      return;
    }

    const existingIdx = allBlueprintVerses.findIndex(
      (v) => v.reference.toLowerCase() === trimmedRef.toLowerCase()
    );
    if (existingIdx >= 0) {
      const updatedVerse = buildCustomBlueprintVerse(trimmedRef, trimmedText);
      if (existingIdx >= BLUEPRINT_VERSES.length) {
        const customIdx = existingIdx - BLUEPRINT_VERSES.length;
        const nextCustom = [...customVerses];
        nextCustom[customIdx] = updatedVerse;
        setCustomVerses(nextCustom);
        try {
          localStorage.setItem("stba_blueprint_custom_verses_v1", JSON.stringify(nextCustom));
        } catch {}
      }
      setSelectedVerseIndex(existingIdx);
    } else {
      const newVerse = buildCustomBlueprintVerse(trimmedRef, trimmedText);
      const nextCustom = [...customVerses, newVerse];
      setCustomVerses(nextCustom);
      try {
        localStorage.setItem("stba_blueprint_custom_verses_v1", JSON.stringify(nextCustom));
      } catch {}
      setSelectedVerseIndex(BLUEPRINT_VERSES.length + nextCustom.length - 1);
    }

    setManualRefInput("");
    setManualTextInput("");
    setManualStatusMsg(`Activated ${trimmedRef} as your current Blueprint Challenge verse!`);
    playTone(783.99, 0.14, "triangle");
    setTimeout(() => setManualStatusMsg(null), 3500);
  };

  // Persistent Pillar Progress
  const [progress, setProgress] = useState<PillarProgressState>(() => {
    try {
      const raw = localStorage.getItem("stba_blueprint_pillars_v2");
      if (raw) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
      }
    } catch {}
    return DEFAULT_PROGRESS;
  });

  const updateProgress = useCallback(
    (patch: Partial<PillarProgressState>) => {
      setProgress((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem("stba_blueprint_pillars_v2", JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  // Active Full-Screen Game Pillar (null = Dashboard Hub, 1..5 = Dedicated Full-Screen Game Mode)
  const [activeGamePillar, setActiveGamePillar] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [snoozeToast, setSnoozeToast] = useState<string | null>(null);

  // Escape key exits full-screen game mode
  useEffect(() => {
    if (!activeGamePillar) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveGamePillar(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGamePillar]);

  // Quick Quiz state on the right-hand / secondary dashboard panel (mirrors the mockup's Quiz & Validate preview)
  const [dashboardQuizChoice, setDashboardQuizChoice] = useState<number | null>(null);

  useEffect(() => {
    setDashboardQuizChoice(null);
  }, [selectedVerseIndex]);

  // ============================================================================
  // PILLAR 1 STATE: MORNING NEURO-PRIMER (TIMED SPEED RECALL DRILL)
  // ============================================================================
  const [p1Duration, setP1Duration] = useState<number>(45);
  const [p1TimeLeft, setP1TimeLeft] = useState<number>(45);
  const [p1Running, setP1Running] = useState<boolean>(false);
  const [p1Finished, setP1Finished] = useState<boolean>(false);
  const [p1WordIndex, setP1WordIndex] = useState<number>(0);
  const [p1Combo, setP1Combo] = useState<number>(0);
  const [p1MaxCombo, setP1MaxCombo] = useState<number>(0);
  const [p1Mistakes, setP1Mistakes] = useState<number>(0);
  const [p1FirstLetterMode, setP1FirstLetterMode] = useState<boolean>(false);
  const [p1StartTime, setP1StartTime] = useState<number | null>(null);
  const [p1EarnedWpm, setP1EarnedWpm] = useState<number>(0);

  const cleanWords = useMemo(() => {
    return activeVerse.text.split(/\s+/).filter(Boolean);
  }, [activeVerse.text]);

  // Build 4-option choices for current word in Pillar 1
  const p1Choices = useMemo(() => {
    if (p1WordIndex >= cleanWords.length) return [];
    const correctWord = cleanWords[p1WordIndex];
    const pool = Array.from(
      new Set([
        ...cleanWords.filter((w) => w.toLowerCase() !== correctWord.toLowerCase()),
        "grace",
        "covenant",
        "sanctuary",
        "wisdom",
        "faithful",
        "eternal",
        "spirit",
        "commandment"
      ])
    );
    const distractors: string[] = [];
    let seed = p1WordIndex * 17 + selectedVerseIndex * 31;
    while (distractors.length < 3 && pool.length > 0) {
      const pickIdx = seed % pool.length;
      const candidate = pool[pickIdx];
      if (!distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      seed += 7;
    }
    const combined = [correctWord, ...distractors];
    // Deterministic shuffle per word index
    return combined.sort((a, b) => {
      const ha = (a.charCodeAt(0) * 13 + p1WordIndex * 7) % 19;
      const hb = (b.charCodeAt(0) * 13 + p1WordIndex * 7) % 19;
      return ha - hb;
    });
  }, [cleanWords, p1WordIndex, selectedVerseIndex]);

  const startPillar1Drill = (seconds = p1Duration) => {
    setP1Duration(seconds);
    setP1TimeLeft(seconds);
    setP1WordIndex(0);
    setP1Combo(0);
    setP1MaxCombo(0);
    setP1Mistakes(0);
    setP1Finished(false);
    setP1Running(true);
    setP1StartTime(Date.now());
    playTone(523.25, 0.12, "triangle");
  };

  useEffect(() => {
    if (activeGamePillar !== 1 || !p1Running || p1Finished) return;
    const timer = setInterval(() => {
      setP1TimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setP1Running(false);
          setP1Finished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGamePillar, p1Running, p1Finished]);

  const handleP1SelectWord = (word: string) => {
    if (!p1Running || p1Finished) return;
    const target = cleanWords[p1WordIndex];
    if (word === target) {
      const nextIdx = p1WordIndex + 1;
      const nextCombo = p1Combo + 1;
      setP1WordIndex(nextIdx);
      setP1Combo(nextCombo);
      setP1MaxCombo((m) => Math.max(m, nextCombo));
      playTone(440 + Math.min(nextCombo * 30, 400), 0.08, "sine");

      if (nextIdx >= cleanWords.length) {
        // Completed verse!
        setP1Running(false);
        setP1Finished(true);
        const elapsedMin = Math.max((Date.now() - (p1StartTime || Date.now())) / 60000, 0.08);
        const wpm = Math.round(cleanWords.length / elapsedMin);
        setP1EarnedWpm(wpm);
        updateProgress({
          pillar1Completed: true,
          pillar1BestWpm: Math.max(progress.pillar1BestWpm, wpm)
        });
        playTone(880, 0.25, "triangle");
        showConfetti("recall", `Morning Neuro-Primer Mastered at ${wpm} WPM!`);
      }
    } else {
      setP1Combo(0);
      setP1Mistakes((m) => m + 1);
      playTone(220, 0.15, "sawtooth");
    }
  };

  // ============================================================================
  // PILLAR 2 STATE: 3-R SENSORY ENCODING LOOP (MATCHING & FILL-IN-THE-BLANK)
  // ============================================================================
  const [p2SubStage, setP2SubStage] = useState<1 | 2 | 3>(1);
  const [p2ReadCount, setP2ReadCount] = useState<number>(0);
  const [p2SelectedPhraseIdx, setP2SelectedPhraseIdx] = useState<number | null>(null);
  const [p2MatchedIndices, setP2MatchedIndices] = useState<number[]>([]);
  const [p2BlankAnswers, setP2BlankAnswers] = useState<Record<number, string>>({});
  const [p2TypedText, setP2TypedText] = useState<string>("");
  const [p2CompleteModal, setP2CompleteModal] = useState<boolean>(false);

  // Target blank indices for Stage 2 of Pillar 2
  const p2BlankWordIndices = useMemo(() => {
    const indices: number[] = [];
    cleanWords.forEach((w, idx) => {
      const stripped = w.replace(/[^a-zA-Z]/g, "");
      if (stripped.length >= 5 && indices.length < 6 && idx % 2 === 1) {
        indices.push(idx);
      }
    });
    if (indices.length === 0 && cleanWords.length > 2) {
      indices.push(1, Math.min(3, cleanWords.length - 1));
    }
    return indices;
  }, [cleanWords]);

  const p2WordBank = useMemo(() => {
    return p2BlankWordIndices
      .map((idx) => ({ idx, word: cleanWords[idx] }))
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [p2BlankWordIndices, cleanWords]);

  const resetPillar2 = useCallback(() => {
    setP2SubStage(1);
    setP2ReadCount(0);
    setP2SelectedPhraseIdx(null);
    setP2MatchedIndices([]);
    setP2BlankAnswers({});
    setP2TypedText("");
    setP2CompleteModal(false);
  }, []);

  const speakActiveVerse = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(`${activeVerse.reference}. ${activeVerse.text}`);
        utter.rate = 0.92;
        window.speechSynthesis.speak(utter);
      } catch {}
    }
    const nextCount = Math.min(3, p2ReadCount + 1);
    setP2ReadCount(nextCount);
    playTone(587.33, 0.1, "sine");
  };

  // ============================================================================
  // PILLAR 3 STATE: SANCTUARY LOCI ARCHITECTURE (SPATIAL PLACEMENT GAME)
  // ============================================================================
  const [p3SelectedVerseStationId, setP3SelectedVerseStationId] = useState<string | null>(null);
  const [p3PlacedStations, setP3PlacedStations] = useState<Record<string, string>>({});
  const [p3ErrorStationId, setP3ErrorStationId] = useState<string | null>(null);
  const [p3RecallMode, setP3RecallMode] = useState<boolean>(false);
  const [p3RecalledStations, setP3RecalledStations] = useState<string[]>([]);

  const p3ShuffledCards = useMemo(() => {
    return [...SANCTUARY_STATIONS].sort((a, b) => a.verseRef.localeCompare(b.verseRef));
  }, []);

  const handleP3PlaceCard = (targetStationId: string, cardStationId?: string) => {
    const incomingId = cardStationId || p3SelectedVerseStationId;
    if (!incomingId) return;

    if (incomingId === targetStationId) {
      const next = { ...p3PlacedStations, [targetStationId]: incomingId };
      setP3PlacedStations(next);
      setP3SelectedVerseStationId(null);
      setP3ErrorStationId(null);
      playTone(659.25, 0.12, "triangle");

      const placedCount = Object.keys(next).length;
      if (placedCount === SANCTUARY_STATIONS.length) {
        updateProgress({
          pillar3Completed: true,
          pillar3Score: 100
        });
        showConfetti("recall", "All 6 Sanctuary Loci Stations Anchored!");
      }
    } else {
      setP3ErrorStationId(targetStationId);
      playTone(196, 0.18, "sawtooth");
      setTimeout(() => setP3ErrorStationId(null), 700);
    }
  };

  // ============================================================================
  // PILLAR 4 STATE: SPACED INTERVAL STACKING (PROGRESSION STREAK CHALLENGE)
  // ============================================================================
  const [p4CurrentWave, setP4CurrentWave] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [p4Streak, setP4Streak] = useState<number>(() => Math.max(progress.pillar4Streak, 3));
  const [p4ChunkOrder, setP4ChunkOrder] = useState<number[]>([]);
  const [p4ErasureRevealed, setP4ErasureRevealed] = useState<number[]>([]);
  const [p4QuizPicked, setP4QuizPicked] = useState<number | null>(null);
  const [p4BossInput, setP4BossInput] = useState<string>("");
  const [p4WaveCleared, setP4WaveCleared] = useState<boolean>(false);

  const p4Chunks = useMemo(() => {
    const words = cleanWords;
    const chunkSize = Math.max(3, Math.ceil(words.length / 4));
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(" "));
    }
    return chunks;
  }, [cleanWords]);

  const advanceP4Wave = () => {
    const nextStreak = p4Streak + 1;
    setP4Streak(nextStreak);
    playTone(783.99, 0.14, "triangle");
    if (p4CurrentWave < 5) {
      const nextWave = (p4CurrentWave + 1) as 1 | 2 | 3 | 4 | 5;
      setP4CurrentWave(nextWave);
      setP4WaveCleared(false);
      updateProgress({
        pillar4Level: Math.max(progress.pillar4Level, nextWave),
        pillar4Streak: nextStreak
      });
    } else {
      setP4WaveCleared(true);
      updateProgress({
        pillar4Completed: true,
        pillar4Level: 5,
        pillar4Streak: nextStreak
      });
      showConfetti("recall", "Day-30 Spaced Interval Vault Unlocked!");
    }
  };

  // ============================================================================
  // PILLAR 5 STATE: DISCIPLE TEACHING ANCHOR (PEER TEACHING GENERATOR)
  // ============================================================================
  const [p5Audience, setP5Audience] = useState<"child" | "friend" | "group">("friend");
  const [p5Hook, setP5Hook] = useState<string>("");
  const [p5Analogy, setP5Analogy] = useState<string>("");
  const [p5Takeaway, setP5Takeaway] = useState<string>("");
  const [p5Feedback, setP5Feedback] = useState<{
    clarityScore: number;
    doctrinalScore: number;
    peerQuestion: string;
    coachNote: string;
  } | null>(null);
  const [p5Copied, setP5Copied] = useState<boolean>(false);

  const handleP5AutoGenerate = () => {
    const tpl = activeVerse.teachingTemplates[p5Audience];
    setP5Hook(tpl.hook);
    setP5Analogy(tpl.analogy);
    setP5Takeaway(tpl.takeaway);
    playTone(523.25, 0.1, "sine");
  };

  const handleP5EvaluateTeaching = () => {
    const totalWords = `${p5Hook} ${p5Analogy} ${p5Takeaway}`.trim().split(/\s+/).filter(Boolean).length;
    const clarityScore = Math.min(100, Math.max(78, 70 + totalWords));
    const peerQuestions: Record<"child" | "friend" | "group", string> = {
      child: `“That makes sense! So how can I remember ${activeVerse.reference} when I'm at school tomorrow?”`,
      friend: `“I appreciate how clearly you connected ${activeVerse.reference} to real life. How did this verse personally change your perspective?”`,
      group: `“Strong biblical synthesis on ${activeVerse.reference}. What cross-reference in the Sanctuary or Gospels best reinforces this point?”`
    };
    setP5Feedback({
      clarityScore,
      doctrinalScore: 98,
      peerQuestion: peerQuestions[p5Audience],
      coachNote: `Excellent Protégé Effect structuring for your ${
        p5Audience === "child" ? "Young Learner" : p5Audience === "friend" ? "Secular Friend" : "Study Group"
      } audience. Teaching this aloud locks the passage into permanent semantic memory.`
    });
    updateProgress({
      pillar5Completed: true,
      pillar5NotesCount: progress.pillar5NotesCount + 1
    });
    playTone(880, 0.2, "triangle");
    showConfetti("teach", "Disciple Teaching Outline Anchored!");
  };

  // ============================================================================
  // DASHBOARD COMPUTED METRICS & HUB CARDS
  // ============================================================================
  const completedPillarsCount = [
    progress.pillar1Completed,
    progress.pillar2Completed,
    progress.pillar3Completed,
    progress.pillar4Completed,
    progress.pillar5Completed
  ].filter(Boolean).length;

  const overallPercent = Math.round((completedPillarsCount / 5) * 100);

  const pillarHubs = [
    {
      id: 1 as const,
      number: "01",
      title: "Morning Neuro-Primer",
      mockupTitle: "Read & Contextualize · Speed Drill",
      subtitle: "Timed Alpha-Wave Speed Recall Drill",
      badgeText: progress.pillar1Completed
        ? `Best: ${progress.pillar1BestWpm || 68} WPM`
        : "60s Rapid Drill",
      ctaLabel: progress.pillar1Completed ? "Replay Drill" : "Start",
      completed: progress.pillar1Completed,
      icon: Clock,
      themeClasses:
        "from-amber-500/20 via-amber-900/15 to-slate-900/80 border-amber-400/40 hover:border-amber-300/80 shadow-[0_8px_30px_rgba(245,158,11,0.12)]",
      iconWrapClasses: "bg-amber-400/15 border-amber-300/40 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]",
      ctaClasses: "bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 hover:brightness-110"
    },
    {
      id: 2 as const,
      number: "02",
      title: "3-R Sensory Encoding Loop",
      mockupTitle: "Recite, Match & Fill-in-the-Blank",
      subtitle: "Auditory Cadence · Phrase Match · Cloze Matrix",
      badgeText: `Stage ${progress.pillar2Stage} of 3`,
      ctaLabel: progress.pillar2Completed ? "Practice" : "Practice",
      completed: progress.pillar2Completed,
      icon: Headphones,
      themeClasses:
        "from-sky-500/20 via-blue-900/20 to-slate-900/80 border-sky-400/40 hover:border-sky-300/80 shadow-[0_8px_30px_rgba(56,189,248,0.12)]",
      iconWrapClasses: "bg-sky-400/15 border-sky-300/40 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.3)]",
      ctaClasses: "bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 hover:brightness-110"
    },
    {
      id: 3 as const,
      number: "03",
      title: "Sanctuary Loci Architecture",
      mockupTitle: "Interactively Memorize · Spatial Loci",
      subtitle: "Drag & Drop Verses onto Sanctuary Furniture",
      badgeText: `${Object.keys(p3PlacedStations).length}/6 Stations`,
      ctaLabel: "Continue",
      completed: progress.pillar3Completed,
      icon: Brain,
      hasStepNodes: true,
      activeStepNode: Math.min(4, Math.max(1, Math.ceil((Object.keys(p3PlacedStations).length / 6) * 4) || 1)),
      themeClasses:
        "from-cyan-500/20 via-teal-900/20 to-slate-900/80 border-cyan-400/40 hover:border-cyan-300/80 shadow-[0_8px_30px_rgba(34,211,238,0.12)]",
      iconWrapClasses: "bg-cyan-400/15 border-cyan-300/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
      ctaClasses: "bg-gradient-to-r from-cyan-300 to-teal-400 text-slate-950 hover:brightness-110"
    },
    {
      id: 4 as const,
      number: "04",
      title: "Spaced Interval Stacking",
      mockupTitle: "Write, Stack & Streak Gauntlet",
      subtitle: "Day 1 · 3 · 7 · 14 · 30 Retention Progression",
      badgeText: `${p4Streak}-Wave Streak`,
      ctaLabel: "Write",
      completed: progress.pillar4Completed,
      icon: PenTool,
      themeClasses:
        "from-emerald-500/20 via-emerald-900/20 to-slate-900/80 border-emerald-400/40 hover:border-emerald-300/80 shadow-[0_8px_30px_rgba(16,185,129,0.12)]",
      iconWrapClasses: "bg-emerald-400/15 border-emerald-300/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      ctaClasses: "bg-gradient-to-r from-emerald-300 to-teal-400 text-slate-950 hover:brightness-110"
    },
    {
      id: 5 as const,
      number: "05",
      title: "Disciple Teaching Anchor",
      mockupTitle: "Quiz, Validate & Teach a Peer",
      subtitle: "Generate Simplified Explanation for Discipleship",
      badgeText: progress.pillar5Completed ? "Ready to Share" : "Protégé Mode",
      ctaLabel: "Teach",
      completed: progress.pillar5Completed,
      icon: ClipboardCheck,
      themeClasses:
        "from-purple-500/20 via-indigo-950/30 to-slate-900/80 border-purple-400/40 hover:border-purple-300/80 shadow-[0_8px_30px_rgba(168,85,247,0.14)]",
      iconWrapClasses: "bg-purple-400/15 border-purple-300/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
      ctaClasses: "bg-gradient-to-r from-purple-300 to-indigo-400 text-slate-950 hover:brightness-110"
    }
  ];

  const handleOpenPillar = (pillarId: 1 | 2 | 3 | 4 | 5) => {
    setActiveGamePillar(pillarId);
    if (pillarId === 1) {
      startPillar1Drill(45);
    }
  };

  // ============================================================================
  // RENDER FULL-SCREEN INTERACTIVE GAME OVERLAY (PORTAL)
  // ============================================================================
  const renderFullScreenGameModal = () => {
    if (!activeGamePillar || typeof document === "undefined") return null;

    return createPortal(
      <AnimatePresence mode="wait">
        <motion.div
          key={`pillar-fullscreen-${activeGamePillar}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] bg-[#070B14]/95 backdrop-blur-2xl text-slate-100 flex flex-col overflow-hidden"
          id={`pillar-fullscreen-game-${activeGamePillar}`}
        >
          {/* Ambient radial glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-28 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          {/* TOP HUD BAR */}
          <header className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setActiveGamePillar(null)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#DFC57B]" />
                <span className="whitespace-nowrap">App Blueprint</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-[#DFC57B] font-semibold">Pillar 0{activeGamePillar}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{activeVerse.reference}</span>
                </div>
                <h2 className="text-sm sm:text-base font-serif font-bold text-white truncate">
                  {pillarHubs[activeGamePillar - 1].title}
                </h2>
              </div>
            </div>

            {/* Quick Pillar Switcher + Sound Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                {([1, 2, 3, 4, 5] as const).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleOpenPillar(num)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      activeGamePillar === num
                        ? "bg-[#DFC57B] text-slate-950 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Pillar {num}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                aria-label={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#DFC57B]" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveGamePillar(null)}
                aria-label="Close game mode"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/15 hover:border-rose-400/40 flex items-center justify-center text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* GAME STAGE BODY */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              {/* ============================================================
                  PILLAR 1: MORNING NEURO-PRIMER (TIMED SPEED RECALL DRILL)
                 ============================================================ */}
              {activeGamePillar === 1 && (
                <div className="space-y-6">
                  {/* Top Telemetry Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-amber-400/30 backdrop-blur-xl">
                      <span className="text-xs text-slate-400 block">Alpha Timer</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span
                          className={`text-2xl font-mono font-bold tabular-nums ${
                            p1TimeLeft <= 10 ? "text-rose-400" : "text-amber-300"
                          }`}
                        >
                          00:{String(p1TimeLeft).padStart(2, "0")}
                        </span>
                        <span className="text-xs text-slate-400">/ {p1Duration}s</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                      <span className="text-xs text-slate-400 block">Word Progress</span>
                      <div className="text-2xl font-mono font-bold text-white tabular-nums mt-1">
                        {p1WordIndex} <span className="text-sm text-slate-400">/ {cleanWords.length}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                      <span className="text-xs text-slate-400 block">Synaptic Combo</span>
                      <div className="text-2xl font-mono font-bold text-emerald-300 tabular-nums mt-1">
                        {p1Combo}x <span className="text-xs text-slate-400">Max {p1MaxCombo}x</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                      <span className="text-xs text-slate-400 block">Precision Rate</span>
                      <div className="text-2xl font-mono font-bold text-cyan-300 tabular-nums mt-1">
                        {p1WordIndex + p1Mistakes > 0
                          ? `${Math.round((p1WordIndex / (p1WordIndex + p1Mistakes)) * 100)}%`
                          : "100%"}
                      </div>
                    </div>
                  </div>

                  {/* Mode & Timer Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-medium">Drill Window:</span>
                      {[30, 45, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => startPillar1Drill(sec)}
                          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            p1Duration === sec
                              ? "bg-amber-400 text-slate-950 font-bold"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                          }`}
                        >
                          {sec}s Blitz
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setP1FirstLetterMode((m) => !m)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          p1FirstLetterMode
                            ? "bg-cyan-400/20 border-cyan-300 text-cyan-200"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {p1FirstLetterMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>First-Letter Cue: {p1FirstLetterMode ? "On" : "Off"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startPillar1Drill(p1Duration)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restart</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Verse Stream Arena */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0E1729]/95 to-slate-950 border border-amber-400/30 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="text-xs text-amber-300 font-semibold">{activeVerse.reference}</span>
                        <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                          Rapid Synaptic Sequence Reconstruction
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-400 tabular-nums">
                        {Math.round((p1WordIndex / cleanWords.length) * 100)}% Reconstructed
                      </span>
                    </div>

                    {/* Word Tokens Display */}
                    <div className="flex flex-wrap gap-2 leading-relaxed min-h-[120px] p-4 rounded-2xl bg-slate-950/70 border border-white/10">
                      {cleanWords.map((word, idx) => {
                        const isRevealed = idx < p1WordIndex;
                        const isCurrent = idx === p1WordIndex && !p1Finished;
                        const firstLetter = word[0] + "_".repeat(Math.max(1, word.length - 1));
                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-lg text-sm sm:text-base font-medium transition-all ${
                              isRevealed
                                ? "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                                : isCurrent
                                ? "bg-cyan-500/20 text-cyan-200 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                                : "bg-white/[0.03] text-slate-600 border border-white/5 font-mono"
                            }`}
                          >
                            {isRevealed ? word : p1FirstLetterMode ? firstLetter : "••••"}
                          </span>
                        );
                      })}
                    </div>

                    {/* Interactive Speed Choices or Victory Summary */}
                    {!p1Finished ? (
                      <div className="space-y-3">
                        <div className="text-xs text-slate-300 font-medium">
                          Tap the next word in <strong className="text-amber-300">{activeVerse.reference}</strong>{" "}
                          (Word #{p1WordIndex + 1} of {cleanWords.length}):
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {p1Choices.map((choice, cIdx) => (
                            <button
                              key={`${p1WordIndex}-${cIdx}-${choice}`}
                              type="button"
                              onClick={() => handleP1SelectWord(choice)}
                              className="min-h-[54px] px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-amber-400/20 border border-white/15 hover:border-amber-300 text-base font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-lg"
                            >
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                            <Trophy className="w-5 h-5" />
                            <span>
                              {p1WordIndex >= cleanWords.length
                                ? `Morning Neuro-Primer Complete! (${p1EarnedWpm || 65} WPM)`
                                : "Time Expired — Ready for Another Pass!"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            {p1WordIndex >= cleanWords.length
                              ? "Your alpha-wave retrieval pathway is primed. Proceed to Pillar 2 (3-R Sensory Encoding Loop)."
                              : `You recalled ${p1WordIndex} of ${cleanWords.length} words with a ${p1MaxCombo}x max combo.`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => startPillar1Drill(p1Duration)}
                            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer"
                          >
                            Play Again
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPillar(2)}
                            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Next: Pillar 2</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================
                  PILLAR 2: 3-R SENSORY ENCODING LOOP (MATCHING & CLOZE)
                 ============================================================ */}
              {activeGamePillar === 2 && (
                <div className="space-y-6">
                  {/* 3-Stage Stepper Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { stage: 1 as const, label: "1. Read & Match Meaning", desc: "Auditory + Semantic Pairing" },
                      { stage: 2 as const, label: "2. Fill-in-the-Blank", desc: "Active Cloze Retrieval" },
                      { stage: 3 as const, label: "3. Write & Reflect", desc: "Kinesthetic First-Letter Keying" }
                    ].map((st) => (
                      <button
                        key={st.stage}
                        type="button"
                        onClick={() => setP2SubStage(st.stage)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          p2SubStage === st.stage
                            ? "bg-sky-500/20 border-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.2)]"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{st.label}</span>
                          {progress.pillar2Stage > st.stage || progress.pillar2Completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : null}
                        </div>
                        <span className="text-xs text-slate-400 block mt-1">{st.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* STAGE 1: AUDITORY CADENCE & SENSORY PHRASE MATCHING */}
                  {p2SubStage === 1 && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0C192E]/95 to-slate-950 border border-sky-400/30 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                          <span className="text-xs text-sky-300 font-semibold">Step 1 · Auditory & Semantic Anchor</span>
                          <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                            Read Aloud 3x & Match Phrase to Doctrinal Meaning
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={speakActiveVerse}
                          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer hover:brightness-110 shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Listen & Read Aloud ({p2ReadCount}/3)</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 text-base font-serif italic text-slate-100 leading-relaxed">
                        “{activeVerse.text}” — <span className="text-sky-300 not-italic font-sans font-semibold">{activeVerse.reference}</span>
                      </div>

                      {/* Interactive Phrase-to-Meaning Matching Grid */}
                      <div className="space-y-3">
                        <div className="text-xs text-slate-300">
                          Tap a <strong className="text-sky-300">Scripture Phrase</strong> on the left, then tap its matching{" "}
                          <strong className="text-amber-300">Cognitive Cue</strong> on the right ({p2MatchedIndices.length}/
                          {activeVerse.sensoryPairs.length} matched):
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column: Scripture Phrases */}
                          <div className="space-y-2.5">
                            {activeVerse.sensoryPairs.map((pair, idx) => {
                              const isMatched = p2MatchedIndices.includes(idx);
                              const isSelected = p2SelectedPhraseIdx === idx;
                              return (
                                <button
                                  key={`phrase-${idx}`}
                                  type="button"
                                  disabled={isMatched}
                                  onClick={() => setP2SelectedPhraseIdx(idx)}
                                  className={`w-full min-h-[52px] p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    isMatched
                                      ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
                                      : isSelected
                                      ? "bg-sky-500/25 border-sky-300 text-white shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                                      : "bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]"
                                  }`}
                                >
                                  <span>“{pair.phrase}”</span>
                                  {isMatched && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Column: Sensory Cues (reversed display order for challenge) */}
                          <div className="space-y-2.5">
                            {[...activeVerse.sensoryPairs]
                              .map((pair, originalIdx) => ({ ...pair, originalIdx }))
                              .reverse()
                              .map((item) => {
                                const isMatched = p2MatchedIndices.includes(item.originalIdx);
                                return (
                                  <button
                                    key={`cue-${item.originalIdx}`}
                                    type="button"
                                    disabled={isMatched}
                                    onClick={() => {
                                      if (p2SelectedPhraseIdx === null) return;
                                      if (p2SelectedPhraseIdx === item.originalIdx) {
                                        const next = [...p2MatchedIndices, item.originalIdx];
                                        setP2MatchedIndices(next);
                                        setP2SelectedPhraseIdx(null);
                                        playTone(659.25, 0.1, "sine");
                                        if (next.length === activeVerse.sensoryPairs.length) {
                                          updateProgress({ pillar2Stage: Math.max(progress.pillar2Stage, 2) });
                                        }
                                      } else {
                                        playTone(220, 0.14, "sawtooth");
                                        setP2SelectedPhraseIdx(null);
                                      }
                                    }}
                                    className={`w-full min-h-[52px] p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                      isMatched
                                        ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
                                        : "bg-amber-500/10 border-amber-400/30 text-amber-200 hover:bg-amber-500/20"
                                    }`}
                                  >
                                    <span>{item.cue}</span>
                                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setP2SubStage(2)}
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <span>Continue to Step 2: Fill-in-the-Blank</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STAGE 2: INTERACTIVE FILL-IN-THE-BLANK MATRIX */}
                  {p2SubStage === 2 && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0C192E]/95 to-slate-950 border border-sky-400/30 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-xs text-sky-300 font-semibold">Step 2 · Cloze Retrieval Matrix</span>
                          <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                            Tap the Missing Words in Order to Complete {activeVerse.reference}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setP2BlankAnswers({})}
                          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
                        >
                          Reset Blanks
                        </button>
                      </div>

                      {/* Verse with interactive blanks */}
                      <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center gap-2 leading-loose">
                        {cleanWords.map((word, idx) => {
                          const isBlank = p2BlankWordIndices.includes(idx);
                          if (!isBlank) {
                            return (
                              <span key={idx} className="text-base text-slate-200">
                                {word}
                              </span>
                            );
                          }
                          const filled = p2BlankAnswers[idx];
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (filled) {
                                  const copy = { ...p2BlankAnswers };
                                  delete copy[idx];
                                  setP2BlankAnswers(copy);
                                }
                              }}
                              className={`min-h-[38px] px-3 py-1 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                                filled
                                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                                  : "bg-sky-500/10 border-dashed border-sky-400/60 text-sky-300 min-w-[90px]"
                              }`}
                            >
                              {filled || "_______"}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tactile Word Bank */}
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 block">
                          Tap a word below to fill the next open blank:
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {p2WordBank.map((item) => {
                            const alreadyPlaced = Object.values(p2BlankAnswers).includes(item.word);
                            return (
                              <button
                                key={item.idx}
                                type="button"
                                disabled={alreadyPlaced}
                                onClick={() => {
                                  const nextOpenBlank = p2BlankWordIndices.find((bIdx) => !p2BlankAnswers[bIdx]);
                                  if (nextOpenBlank === undefined) return;
                                  if (cleanWords[nextOpenBlank] === item.word) {
                                    const updated = { ...p2BlankAnswers, [nextOpenBlank]: item.word };
                                    setP2BlankAnswers(updated);
                                    playTone(659.25, 0.1, "sine");
                                    if (Object.keys(updated).length === p2BlankWordIndices.length) {
                                      updateProgress({ pillar2Stage: 3 });
                                    }
                                  } else {
                                    playTone(220, 0.15, "sawtooth");
                                  }
                                }}
                                className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                                  alreadyPlaced
                                    ? "bg-white/[0.02] border-white/5 text-slate-600 opacity-40"
                                    : "bg-white/[0.07] hover:bg-sky-400/20 border-white/15 hover:border-sky-300 text-white"
                                }`}
                              >
                                {item.word}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setP2SubStage(1)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 text-xs font-semibold text-slate-300 cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setP2SubStage(3)}
                          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <span>Continue to Step 3: Write & Reflect</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STAGE 3: KINESTHETIC TYPE-OUT & FIRST-LETTER STRIPPING */}
                  {p2SubStage === 3 && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0A2224]/95 to-slate-950 border border-emerald-400/30 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-xs text-emerald-300 font-semibold">Step 3 · Write & Reflect</span>
                          <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                            Type Out {activeVerse.reference} Using First-Letter Cues
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setP2TypedText(activeVerse.text)}
                          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-emerald-300 border border-emerald-400/30 cursor-pointer"
                        >
                          Auto-Fill Verse
                        </button>
                      </div>

                      {/* First-Letter Cue Strip */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                        <span className="text-xs text-slate-400 block">First-Letter Neurological Cue Strip:</span>
                        <div className="flex flex-wrap gap-2 font-mono text-sm text-emerald-300">
                          {cleanWords.map((w, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/20">
                              {w[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={p2TypedText}
                        onChange={(e) => setP2TypedText(e.target.value)}
                        rows={4}
                        placeholder={`Type out ${activeVerse.reference} from memory...`}
                        className="w-full p-4 rounded-2xl bg-slate-950/90 border border-white/15 focus:border-emerald-400 focus:outline-none text-sm sm:text-base text-white placeholder:text-slate-500"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs text-slate-400">
                          Words keyed:{" "}
                          <strong className="text-white tabular-nums">
                            {p2TypedText.trim() ? p2TypedText.trim().split(/\s+/).length : 0}
                          </strong>{" "}
                          / {cleanWords.length}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              updateProgress({
                                pillar2Completed: true,
                                pillar2Stage: 3
                              });
                              setP2CompleteModal(true);
                              playTone(880, 0.2, "triangle");
                              showConfetti("recall", "3-R Sensory Encoding Loop Completed!");
                            }}
                            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-300 to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Complete 3-R Encoding Loop</span>
                          </button>
                        </div>
                      </div>

                      {p2CompleteModal && (
                        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-between gap-4">
                          <span className="text-xs sm:text-sm text-emerald-200 font-medium">
                            Tri-Modal Sensory Encoding verified! Ready to anchor verses spatially in the Sanctuary?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenPillar(3)}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Enter Pillar 3 →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================
                  PILLAR 3: SANCTUARY LOCI ARCHITECTURE (SPATIAL PLACEMENT)
                 ============================================================ */}
              {activeGamePillar === 3 && (
                <div className="space-y-6">
                  {/* Top Instructions & Recall Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.04] border border-cyan-400/30">
                    <div>
                      <span className="text-xs text-cyan-300 font-semibold">
                        Method of Loci · Heavenly Sanctuary Blueprint
                      </span>
                      <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                        Drag & Drop (or Tap) Each Scripture Card onto Its Sanctuary Furniture Station
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Spatial memory anchors abstract doctrinal verses to visual sanctuary stations ({Object.keys(p3PlacedStations).length} of 6 anchored).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setP3PlacedStations({});
                          setP3SelectedVerseStationId(null);
                          setP3RecallMode(false);
                          setP3RecalledStations([]);
                        }}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
                      >
                        Reset Board
                      </button>

                      {Object.keys(p3PlacedStations).length === SANCTUARY_STATIONS.length && (
                        <button
                          type="button"
                          onClick={() => setP3RecallMode((r) => !r)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          {p3RecallMode ? "Show Anchored Verses" : "Test Blind Loci Recall"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Two-Column Spatial Sandbox: Left = Scripture Cards Deck, Right = 3-Zone Sanctuary Map */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Deck: Draggable / Tappable Scripture Cards */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Scripture Loci Cards (Tap or Drag)</span>
                        <span className="font-mono text-cyan-300 tabular-nums">
                          {SANCTUARY_STATIONS.length - Object.keys(p3PlacedStations).length} Remaining
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {p3ShuffledCards.map((card) => {
                          const isPlaced = Boolean(p3PlacedStations[card.id]);
                          const isSelected = p3SelectedVerseStationId === card.id;
                          return (
                            <div
                              key={card.id}
                              draggable={!isPlaced}
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", card.id);
                                setP3SelectedVerseStationId(card.id);
                              }}
                              onClick={() => {
                                if (!isPlaced) {
                                  setP3SelectedVerseStationId(isSelected ? null : card.id);
                                }
                              }}
                              className={`p-4 rounded-2xl border transition-all select-none ${
                                isPlaced
                                  ? "bg-emerald-500/10 border-emerald-400/30 opacity-50 cursor-default"
                                  : isSelected
                                  ? "bg-cyan-500/20 border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] cursor-pointer"
                                  : "bg-white/[0.05] hover:bg-white/[0.09] border-white/15 cursor-grab active:cursor-grabbing"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-300">{card.verseRef}</span>
                                <span className="text-[11px] text-slate-400">
                                  {isPlaced ? "Anchored ✓" : isSelected ? "Tap a Sanctuary Station →" : "Drag or Tap"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 font-serif italic mt-1.5 leading-relaxed">
                                “{card.verseSnippet}”
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Arena: Architectural Sanctuary Floorplan (Courtyard -> Holy Place -> Most Holy Place) */}
                    <div className="lg:col-span-7 space-y-4">
                      {(["Courtyard", "Holy Place", "Most Holy Place"] as const).map((zoneName) => {
                        const zoneStations = SANCTUARY_STATIONS.filter((s) => s.zone === zoneName);
                        return (
                          <div
                            key={zoneName}
                            className="p-5 rounded-3xl bg-slate-900/80 border border-white/15 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="text-xs font-serif font-bold text-[#DFC57B] tracking-wide">
                                {zoneName}
                              </span>
                              <span className="text-xs text-slate-400">
                                {zoneStations.filter((z) => p3PlacedStations[z.id]).length}/{zoneStations.length} Anchored
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {zoneStations.map((station) => {
                                const isAnchored = Boolean(p3PlacedStations[station.id]);
                                const isError = p3ErrorStationId === station.id;
                                const isRecalled = p3RecalledStations.includes(station.id);

                                return (
                                  <div
                                    key={station.id}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      const droppedId = e.dataTransfer.getData("text/plain");
                                      handleP3PlaceCard(station.id, droppedId);
                                    }}
                                    onClick={() => {
                                      if (p3RecallMode && isAnchored) {
                                        setP3RecalledStations((prev) =>
                                          prev.includes(station.id) ? prev : [...prev, station.id]
                                        );
                                        playTone(783.99, 0.1, "sine");
                                      } else if (!isAnchored && p3SelectedVerseStationId) {
                                        handleP3PlaceCard(station.id);
                                      }
                                    }}
                                    className={`min-h-[120px] p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                                      isError
                                        ? "bg-rose-500/20 border-rose-400"
                                        : isAnchored
                                        ? "bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                        : p3SelectedVerseStationId
                                        ? "bg-cyan-500/10 border-dashed border-cyan-300/70 hover:bg-cyan-500/20"
                                        : "bg-slate-950/70 border-white/10 hover:border-white/25"
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-xs sm:text-sm font-bold text-white">{station.name}</h4>
                                        {isAnchored && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                      </div>
                                      <span className="text-[11px] text-slate-400 block mt-0.5">{station.meaning}</span>
                                    </div>

                                    {isAnchored ? (
                                      <div className="mt-3 pt-2.5 border-t border-white/10">
                                        {p3RecallMode && !isRecalled ? (
                                          <span className="text-xs text-cyan-300 font-semibold">
                                            Tap to verify recalled verse at {station.name} →
                                          </span>
                                        ) : (
                                          <>
                                            <span className="text-xs font-bold text-emerald-300 block">
                                              {station.verseRef}
                                            </span>
                                            <p className="text-[11px] text-slate-200 font-serif italic line-clamp-2 mt-0.5">
                                              “{station.verseSnippet}”
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mt-3 pt-2 border-t border-dashed border-white/10 text-[11px] text-cyan-300/80">
                                        {p3SelectedVerseStationId
                                          ? "Tap here to anchor selected verse"
                                          : "Drop matching scripture card here"}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  PILLAR 4: SPACED INTERVAL STACKING (STREAK CHALLENGE)
                 ============================================================ */}
              {activeGamePillar === 4 && (
                <div className="space-y-6">
                  {/* Interval Progression Bar (Day 1 -> Day 3 -> Day 7 -> Day 14 -> Day 30) */}
                  <div className="p-5 rounded-3xl bg-white/[0.04] border border-emerald-400/30 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-emerald-300 font-semibold">
                          Ebbinghaus Forgetting Curve Defense
                        </span>
                        <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                          5-Wave Spaced Interval Stacking Challenge
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-amber-200 tabular-nums">
                            {p4Streak} Interval Streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { wave: 1 as const, day: "Day 1", title: "Chunk Stack", retention: "45%" },
                        { wave: 2 as const, day: "Day 3", title: "25% Erasure", retention: "65%" },
                        { wave: 3 as const, day: "Day 7", title: "Doctrine Quiz", retention: "80%" },
                        { wave: 4 as const, day: "Day 14", title: "Deep Cloze", retention: "92%" },
                        { wave: 5 as const, day: "Day 30", title: "Master Vault", retention: "99%" }
                      ].map((tier) => {
                        const isCurrent = p4CurrentWave === tier.wave;
                        const isPassed = p4CurrentWave > tier.wave || progress.pillar4Completed;
                        return (
                          <button
                            key={tier.wave}
                            type="button"
                            onClick={() => {
                              setP4CurrentWave(tier.wave);
                              setP4WaveCleared(false);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-emerald-500/25 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                : isPassed
                                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                                : "bg-white/[0.03] border-white/10 text-slate-400"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{tier.day}</span>
                              <span className="text-[11px] font-mono text-emerald-300 tabular-nums">
                                {tier.retention}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-300 block mt-1 truncate">{tier.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Interval Wave Challenge */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B211D]/95 to-slate-950 border border-emerald-400/30 space-y-6">
                    {p4CurrentWave === 1 && (
                      <div className="space-y-5">
                        <div>
                          <span className="text-xs text-emerald-300 font-semibold">Wave 1 · Day 1 Immediate Recall</span>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                            Tap the Verse Segments in Sequential Order ({p4ChunkOrder.length}/{p4Chunks.length})
                          </h4>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 min-h-[72px] flex flex-wrap gap-2 items-center">
                          {p4ChunkOrder.length === 0 ? (
                            <span className="text-xs text-slate-500">
                              Tap the phrase blocks below in order to stack {activeVerse.reference}...
                            </span>
                          ) : (
                            p4ChunkOrder.map((cIdx) => (
                              <span
                                key={cIdx}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs sm:text-sm text-emerald-200"
                              >
                                {p4Chunks[cIdx]}
                              </span>
                            ))
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {p4Chunks.map((chunk, idx) => {
                            const picked = p4ChunkOrder.includes(idx);
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={picked}
                                onClick={() => {
                                  const expectedIdx = p4ChunkOrder.length;
                                  if (idx === expectedIdx) {
                                    const next = [...p4ChunkOrder, idx];
                                    setP4ChunkOrder(next);
                                    playTone(587.33, 0.1, "sine");
                                    if (next.length === p4Chunks.length) {
                                      setTimeout(() => advanceP4Wave(), 350);
                                    }
                                  } else {
                                    playTone(220, 0.15, "sawtooth");
                                  }
                                }}
                                className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                                  picked
                                    ? "bg-white/[0.02] border-white/5 text-slate-600 opacity-40"
                                    : "bg-white/[0.06] hover:bg-emerald-500/20 border-white/15 hover:border-emerald-300 text-white"
                                }`}
                              >
                                {chunk}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(p4CurrentWave === 2 || p4CurrentWave === 4) && (
                      <div className="space-y-5">
                        <div>
                          <span className="text-xs text-emerald-300 font-semibold">
                            {p4CurrentWave === 2
                              ? "Wave 2 · Day 3 Stabilization (Progressive Erasure)"
                              : "Wave 4 · Day 14 Crystallization (Deep Cloze Recall)"}
                          </span>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                            Recite Each Masked Word Aloud, Then Tap It to Verify
                          </h4>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap gap-2 leading-loose">
                          {cleanWords.map((word, idx) => {
                            const shouldMask = p4CurrentWave === 2 ? idx % 3 === 1 : idx % 2 === 0;
                            const isRevealed = !shouldMask || p4ErasureRevealed.includes(idx);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  if (shouldMask && !p4ErasureRevealed.includes(idx)) {
                                    setP4ErasureRevealed((prev) => [...prev, idx]);
                                    playTone(659.25, 0.08, "sine");
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-sm sm:text-base transition-all cursor-pointer ${
                                  isRevealed
                                    ? "text-slate-100 bg-white/[0.04]"
                                    : "bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono"
                                }`}
                              >
                                {isRevealed ? word : `${word[0]}•••`}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setP4ErasureRevealed([]);
                              advanceP4Wave();
                            }}
                            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                          >
                            <span>Confirm Recitation & Advance Wave</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {p4CurrentWave === 3 && (
                      <div className="space-y-5">
                        <div>
                          <span className="text-xs text-purple-300 font-semibold">
                            Wave 3 · Day 7 Doctrinal Validation Quiz
                          </span>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                            {activeVerse.quizQuestion.question}
                          </h4>
                        </div>

                        <div className="space-y-2.5">
                          {activeVerse.quizQuestion.options.map((opt, idx) => {
                            const isPicked = p4QuizPicked === idx;
                            const isCorrect = idx === activeVerse.quizQuestion.correctIndex;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setP4QuizPicked(idx);
                                  if (isCorrect) {
                                    playTone(783.99, 0.14, "triangle");
                                  } else {
                                    playTone(220, 0.15, "sawtooth");
                                  }
                                }}
                                className={`w-full min-h-[52px] p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                  isPicked
                                    ? isCorrect
                                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                                      : "bg-rose-500/20 border-rose-400 text-rose-200"
                                    : "bg-white/[0.05] hover:bg-white/[0.1] border-white/15 text-slate-200"
                                }`}
                              >
                                <span>{opt}</span>
                                {isPicked && (
                                  <span className="text-xs font-bold">
                                    {isCorrect ? "Correct ✓" : "Try Again"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {p4QuizPicked === activeVerse.quizQuestion.correctIndex && (
                          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-emerald-200">{activeVerse.quizQuestion.explanation}</p>
                            <button
                              type="button"
                              onClick={advanceP4Wave}
                              className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
                            >
                              Advance to Day 14 →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {p4CurrentWave === 5 && (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-amber-300 font-semibold">
                              Wave 5 · Day 30 Permanent Semantic Vault
                            </span>
                            <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                              Master Verbatim Challenge: Seal {activeVerse.reference} into Long-Term Storage
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setP4BossInput(activeVerse.text)}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-amber-300 border border-amber-400/30 cursor-pointer"
                          >
                            Fill Reference Text
                          </button>
                        </div>

                        <textarea
                          value={p4BossInput}
                          onChange={(e) => setP4BossInput(e.target.value)}
                          rows={3}
                          placeholder={`Recite or type ${activeVerse.reference} without looking...`}
                          className="w-full p-4 rounded-2xl bg-slate-950/90 border border-white/15 focus:border-amber-400 focus:outline-none text-sm sm:text-base text-white"
                        />

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={advanceP4Wave}
                            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                          >
                            <Trophy className="w-4 h-4" />
                            <span>Seal Day-30 Streak & Unlock Pillar 5</span>
                          </button>
                        </div>

                        {p4WaveCleared && (
                          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-emerald-200 font-semibold">
                              All 5 Spaced Interval Waves Complete! Ready to teach this truth in Pillar 5?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenPillar(5)}
                              className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              Launch Pillar 5 →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================
                  PILLAR 5: DISCIPLE TEACHING ANCHOR (PEER TEACHING STUDIO)
                 ============================================================ */}
              {activeGamePillar === 5 && (
                <div className="space-y-6">
                  {/* Audience Selector & Generator Header */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#191233]/95 to-slate-950 border border-purple-400/30 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-xs text-purple-300 font-semibold">
                          The Protégé Effect · 2 Timothy 2:2 Discipleship Engine
                        </span>
                        <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                          Generate & Practice a Simplified Peer Explanation for {activeVerse.reference}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={handleP5AutoGenerate}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer hover:brightness-110 shrink-0"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Simplified Template</span>
                      </button>
                    </div>

                    {/* Audience Persona Tabs */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-300 block">
                        1. Choose Who You Are Teaching Today:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: "child" as const, label: "Curious 9-Year-Old", desc: "Simple picture & warm story" },
                          { id: "friend" as const, label: "Friend Over Coffee", desc: "Conversational & practical" },
                          { id: "group" as const, label: "Sabbath Study Group", desc: "Sanctuary & doctrinal synthesis" }
                        ].map((aud) => (
                          <button
                            key={aud.id}
                            type="button"
                            onClick={() => {
                              setP5Audience(aud.id);
                              setP5Feedback(null);
                            }}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              p5Audience === aud.id
                                ? "bg-purple-500/25 border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                                : "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]"
                            }`}
                          >
                            <div className="text-xs font-bold">{aud.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{aud.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3-Part Simplified Teaching Builder */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-purple-200 block">
                          Core Truth in 1 Plain Sentence
                        </label>
                        <textarea
                          value={p5Hook}
                          onChange={(e) => setP5Hook(e.target.value)}
                          rows={4}
                          placeholder="State the main point of the verse in your own words..."
                          className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-white/15 focus:border-purple-400 focus:outline-none text-xs sm:text-sm text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-amber-200 block">
                          Everyday Analogy / Picture
                        </label>
                        <textarea
                          value={p5Analogy}
                          onChange={(e) => setP5Analogy(e.target.value)}
                          rows={4}
                          placeholder="Compare the verse to a familiar object or experience..."
                          className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-white/15 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-emerald-200 block">
                          Living Appeal / Next Step
                        </label>
                        <textarea
                          value={p5Takeaway}
                          onChange={(e) => setP5Takeaway(e.target.value)}
                          rows={4}
                          placeholder="How can we apply this verse today?"
                          className="w-full p-3.5 rounded-2xl bg-slate-950/80 border border-white/15 focus:border-emerald-400 focus:outline-none text-xs sm:text-sm text-white"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const summary = `${activeVerse.reference} — "${activeVerse.text}"\n\n• Core Truth: ${
                            p5Hook || activeVerse.teachingTemplates[p5Audience].hook
                          }\n• Analogy: ${
                            p5Analogy || activeVerse.teachingTemplates[p5Audience].analogy
                          }\n• Takeaway: ${p5Takeaway || activeVerse.teachingTemplates[p5Audience].takeaway}`;
                          if (navigator?.clipboard) {
                            navigator.clipboard.writeText(summary).catch(() => {});
                          }
                          setP5Copied(true);
                          setTimeout(() => setP5Copied(false), 2000);
                        }}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="w-4 h-4 text-[#DFC57B]" />
                        <span>{p5Copied ? "Copied Discipleship Card ✓" : "Copy Teaching Card"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleP5EvaluateTeaching}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Validate & Anchor Teaching</span>
                      </button>
                    </div>

                    {/* Peer Feedback Panel */}
                    {p5Feedback && (
                      <div className="p-5 rounded-2xl bg-purple-500/15 border border-purple-400/40 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-purple-200">
                            Discipleship Simulation Feedback
                          </span>
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-emerald-300">Clarity: {p5Feedback.clarityScore}%</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-300">SDA Doctrinal Fidelity: {p5Feedback.doctrinalScore}%</span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white italic">{p5Feedback.peerQuestion}</p>
                        <p className="text-xs text-slate-300">{p5Feedback.coachNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  // ============================================================================
  // MAIN GLASSMORPHIC "APP BLUEPRINT" DASHBOARD
  // ============================================================================
  return (
    <div
      className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B111E] via-[#0F172A] to-[#090D16] border border-white/15 p-4 sm:p-7 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.65)] space-y-6"
      id="memorization-blueprint-root"
    >
      {/* Ambient Glassmorphic Backdrop Illumination */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* TOP HEADER: APP BLUEPRINT & HABIT ARCHITECTURE */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#DFC57B]">
            <Compass className="w-4 h-4 text-[#DFC57B]" />
            <span className="font-semibold tracking-wide">App Blueprint</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400">5-Pillar Cognitive Scripture Mastery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Habit Architecture & Cognitive Scripture Strategy
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Tap any of the five glowing memory pillars below to launch its dedicated full-screen interactive retention game.
          </p>
        </div>

        {/* Daily Mastery Score & Verse Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-amber-400/30 backdrop-blur-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center text-amber-300 font-mono text-xs font-bold tabular-nums">
              {overallPercent}%
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Daily Blueprint</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {completedPillarsCount} of 5 Pillars Mastered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. HORIZONTAL SCRIPTURE MEMORIZATION CHALLENGE CARD (ACTIVE VERSE CENTERED AT TOP, ELEMENTS STACKED VERTICALLY) */}
      <div
        id="blueprint-challenge-card"
        className="relative z-10 w-full p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-amber-500/15 border border-amber-400/40 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-4"
      >
        {/* Active Verse Centered at the Very Top */}
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-xl bg-amber-400/15 border border-amber-300/40 text-xs font-bold text-amber-300 tracking-wide">
          <span>{activeVerse.reference}</span>
          <span aria-hidden="true">·</span>
          <span>Active Verse</span>
        </div>

        {/* Vertically Stacked Icon & Challenge Heading */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
            Scripture Memorization Challenge
          </h3>
        </div>

        {/* Centered Active Scripture Verse Text */}
        <p className="text-sm sm:text-base text-slate-100 font-serif italic leading-relaxed max-w-3xl mx-auto">
          “{activeVerse.text}”
        </p>

        {/* Vertically Stacked Verse Switcher Row */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
          {allBlueprintVerses.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVerseIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedVerseIndex === idx
                  ? "bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {v.reference}
            </button>
          ))}
        </div>
      </div>

      {/* 2. DEDICATED MANUAL SCRIPTURE INPUT AREA (IN THE SPACE BETWEEN CHALLENGE CARD AND LOWER SECTIONS) */}
      <form
        id="blueprint-manual-scripture-input"
        onSubmit={handleApplyManualScripture}
        className="relative z-10 w-full p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-cyan-400/30 backdrop-blur-xl shadow-lg space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-xs font-semibold text-cyan-300 tracking-wide">
              Manual Scripture Input
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Enter or Look Up Any Custom Verse to Practice Across All 5 Pillars
            </h3>
          </div>
          {manualStatusMsg && (
            <span className="text-xs font-medium text-emerald-300">
              {manualStatusMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          {/* Reference Input + Lookup */}
          <div className="md:col-span-4 space-y-1.5">
            <label
              htmlFor="blueprint-manual-ref"
              className="block text-xs font-medium text-slate-300"
            >
              Scripture Reference
            </label>
            <div className="flex items-center gap-2">
              <input
                id="blueprint-manual-ref"
                type="text"
                value={manualRefInput}
                onChange={(e) => setManualRefInput(e.target.value)}
                placeholder="e.g. John 3:16 or Romans 8:28"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleLookupManualReference}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-cyan-300 whitespace-nowrap cursor-pointer shrink-0"
              >
                Auto-Fill
              </button>
            </div>
          </div>

          {/* Manual Verse Text Input */}
          <div className="md:col-span-6 space-y-1.5">
            <label
              htmlFor="blueprint-manual-text"
              className="block text-xs font-medium text-slate-300"
            >
              Verse Text (Type, Paste, or Auto-Fill)
            </label>
            <input
              id="blueprint-manual-text"
              type="text"
              value={manualTextInput}
              onChange={(e) => setManualTextInput(e.target.value)}
              placeholder="Paste or type the full scripture passage you want to memorize..."
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder:text-slate-500"
            />
          </div>

          {/* Activate Button */}
          <div className="md:col-span-2 flex flex-col justify-end h-full pt-0 md:pt-6">
            <button
              type="submit"
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 text-xs font-bold hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shadow-md"
            >
              Set Active Verse
            </button>
          </div>
        </div>
      </form>

      {/* 3. SHIFTED LOWER PILLAR MODULES & INTERACTIVE PREVIEW DECK */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* LEFT COLUMN (7 COLS): 5 PROMINENT CLICKABLE GLASSMORPHIC PILLAR HUBS */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* THE 5 PROMINENT CLICKABLE GLASSMORPHIC PILLAR HUBS */}
          <div className="space-y-3" id="blueprint-five-pillars-stack">
            {pillarHubs.map((hub) => {
              const Icon = hub.icon;
              return (
                <motion.div
                  key={hub.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOpenPillar(hub.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenPillar(hub.id);
                    }
                  }}
                  id={`blueprint-pillar-hub-${hub.id}`}
                  className={`group relative w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r ${hub.themeClasses} border backdrop-blur-xl transition-all cursor-pointer select-none flex items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Glowing Neon/Glass Icon Pod */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${hub.iconWrapClasses}`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Title, Subtitle & Optional 1-2-3-4 Stepper */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-300/90">Pillar {hub.number}</span>
                        <span aria-hidden="true" className="text-slate-500">·</span>
                        <span className="text-xs text-slate-300">{hub.badgeText}</span>
                        {hub.completed && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white truncate">
                        {hub.title}
                      </h4>

                      <p className="text-xs text-slate-300 truncate">{hub.subtitle}</p>

                      {hub.hasStepNodes && (
                        <div className="flex items-center gap-2 pt-1">
                          {[1, 2, 3, 4].map((step) => (
                            <React.Fragment key={step}>
                              <span
                                className={`w-6 h-6 rounded-full text-[11px] font-mono font-bold flex items-center justify-center tabular-nums ${
                                  step <= (hub.activeStepNode || 1)
                                    ? "bg-amber-400/25 border border-amber-300 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                                    : "bg-white/5 border border-white/15 text-slate-400"
                                }`}
                              >
                                {step}
                              </span>
                              {step < 4 && <span className="w-3 h-px bg-white/15" />}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pill CTA Button on Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPillar(hub.id);
                    }}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer whitespace-nowrap ${hub.ctaClasses}`}
                  >
                    {hub.ctaLabel}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): INTERACTIVE WIDGET DECK (MATCHES RIGHT SIDE OF MOCKUP IMAGE) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Interactively Memorize Stepper Card */}
          <div
            onClick={() => handleOpenPillar(3)}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900/85 to-slate-900/95 border border-amber-400/35 hover:border-amber-300/70 backdrop-blur-xl transition-all cursor-pointer space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Interactively Memorize</h4>
                <span className="text-xs text-slate-300">4-Stage Cognitive Scaffolding Pipeline</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((node) => (
                  <React.Fragment key={node}>
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center tabular-nums ${
                        node === 1 || node <= completedPillarsCount
                          ? "bg-amber-400/25 border border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                          : "bg-white/5 border border-white/15 text-slate-400"
                      }`}
                    >
                      {node}
                    </span>
                    {node < 4 && <span className="w-4 h-px bg-white/15" />}
                  </React.Fragment>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPillar(3);
                }}
                className="min-h-[38px] px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 text-xs font-bold cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>

          {/* Card 2: Write & Reflect Quick Launch Card */}
          <div
            onClick={() => {
              setP2SubStage(3);
              handleOpenPillar(2);
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-950/40 to-slate-900/95 border border-emerald-400/35 hover:border-emerald-300/70 backdrop-blur-xl transition-all cursor-pointer flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400/15 border border-emerald-300/40 flex items-center justify-center text-emerald-300">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Write & Reflect</h4>
                <span className="text-xs text-slate-300">Type out {activeVerse.reference}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setP2SubStage(3);
                handleOpenPillar(2);
              }}
              className="min-h-[38px] px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-300 to-teal-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              Write
            </button>
          </div>

          {/* Card 3: Interactive Quiz & Validate Widget (Matches purple card in mockup) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-950/40 to-slate-900/95 border border-purple-400/35 backdrop-blur-xl space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-400/15 border border-purple-300/40 flex items-center justify-center text-purple-300">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Quiz & Validate</h4>
                  <span className="text-xs text-slate-300">{activeVerse.reference} Instant Check</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setP4CurrentWave(3);
                  handleOpenPillar(4);
                }}
                className="text-xs text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
              >
                Full Quiz →
              </button>
            </div>

            <p className="text-xs text-slate-200 font-medium">{activeVerse.quizQuestion.question}</p>

            <div className="space-y-2">
              {activeVerse.quizQuestion.options.slice(0, 3).map((option, idx) => {
                const isSelected = dashboardQuizChoice === idx;
                const isRight = idx === activeVerse.quizQuestion.correctIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDashboardQuizChoice(idx);
                      if (isRight) {
                        playTone(783.99, 0.12, "triangle");
                      } else {
                        playTone(220, 0.14, "sawtooth");
                      }
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? isRight
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                          : "bg-rose-500/20 border-rose-400 text-rose-200"
                        : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 text-slate-200"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <span className="text-[11px] font-bold">
                        {isRight ? "Verified ✓" : "Retry"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snooze 15m / Launch Recall Gym Bar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                updateProgress({ snoozeUntil: Date.now() + 15 * 60 * 1000 });
                setSnoozeToast("Reminder snoozed for 15 minutes");
                setTimeout(() => setSnoozeToast(null), 3000);
              }}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              {snoozeToast || "Snooze 15m"}
            </button>

            {onLaunchRecall && (
              <button
                type="button"
                onClick={() =>
                  onLaunchRecall(
                    activeVerse
                      ? {
                          id: activeVerse.id,
                          reference: activeVerse.reference,
                          text: activeVerse.text,
                          keywords: activeVerse.keywords
                        }
                      : undefined
                  )
                }
                className="min-h-[44px] py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#F3CF65] to-[#D4AF37] text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <span>Recall Gym</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render the Full-Screen Interactive Game Portal when any Pillar is tapped */}
      {renderFullScreenGameModal()}
    </div>
  );
};
