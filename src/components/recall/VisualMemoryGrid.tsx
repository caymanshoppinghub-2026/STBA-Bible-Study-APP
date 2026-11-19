/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Brain,
  ArrowRight,
  Flame,
  Award,
  Clock,
  Filter,
  Gamepad2
} from "lucide-react";
import { Scripture } from "../../types";
import confetti from "canvas-confetti";
import { playTransitionChime, playCelebrationChime, playGentleNudge } from "../../utils/pleasantSounds";
import {
  FB_LESSONS,
  HOLY_SCRIPTURES_PROOFS,
  TRINITY_PROOFS,
  FATHER_PROOFS,
  SON_PROOFS,
  SPIRIT_PROOFS
} from "../TrackStudySystem";

interface BeliefVerseItem {
  reference: string;
  text: string;
}

const normalizeRefKey = (ref: string) => ref.toLowerCase().replace(/[^a-z0-9]/g, "");

function getBeliefVerseList(beliefNumber: number, fallbackRef: string, fallbackText: string): BeliefVerseItem[] {
  const proofMap: Record<number, { reference: string; text: string }[]> = {
    1: HOLY_SCRIPTURES_PROOFS,
    2: TRINITY_PROOFS,
    3: FATHER_PROOFS,
    4: SON_PROOFS,
    5: SPIRIT_PROOFS
  };

  let rawList: BeliefVerseItem[] = [];
  if (proofMap[beliefNumber] && proofMap[beliefNumber].length > 0) {
    rawList = proofMap[beliefNumber].map((p) => ({ reference: p.reference, text: p.text }));
  } else {
    const fbLesson = FB_LESSONS.find((l) => l.number === beliefNumber);
    if (fbLesson?.keyReferences && fbLesson.keyReferences.length > 0) {
      rawList = fbLesson.keyReferences.map((k) => ({ reference: k.reference, text: k.text }));
    }
  }

  // Ensure primary anchor verse (e.g., 2 Timothy 3:16 for Belief #1) is always Verse 1
  const fallbackKey = normalizeRefKey(fallbackRef);
  const matchingAnchorIdx = rawList.findIndex(
    (v) =>
      normalizeRefKey(v.reference) === fallbackKey ||
      normalizeRefKey(v.reference).startsWith(fallbackKey) ||
      fallbackKey.startsWith(normalizeRefKey(v.reference))
  );

  let ordered: BeliefVerseItem[];
  if (matchingAnchorIdx > 0) {
    const anchor = rawList[matchingAnchorIdx];
    ordered = [anchor, ...rawList.filter((_, idx) => idx !== matchingAnchorIdx)];
  } else if (matchingAnchorIdx === 0) {
    ordered = rawList;
  } else {
    ordered = [{ reference: fallbackRef, text: fallbackText }, ...rawList];
  }

  // Deduplicate by normalized reference
  const seen = new Set<string>();
  return ordered.filter((v) => {
    const k = normalizeRefKey(v.reference);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

interface VisualMemoryGridProps {
  onSelectScripture?: (scripture: Scripture) => void;
  onPlayInGamePack?: (scripture: Scripture) => void;
}

interface GridTile {
  beliefNumber: number;
  title: string;
  category: "God" | "Man" | "Salvation" | "Church" | "Living" | "Restoration";
  reference: string;
  text: string;
  accuracy: number; // 0 to 100
  status: "mastered" | "learning" | "untested";
  lastReviewed: string;
}

const DEFAULT_GRID_TILES: GridTile[] = [
  {
    beliefNumber: 1,
    title: "Holy Scriptures",
    category: "God",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    accuracy: 98,
    status: "mastered",
    lastReviewed: "Today"
  },
  {
    beliefNumber: 2,
    title: "Trinity",
    category: "God",
    reference: "Matthew 28:19",
    text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.",
    accuracy: 92,
    status: "mastered",
    lastReviewed: "Yesterday"
  },
  {
    beliefNumber: 3,
    title: "Father",
    category: "God",
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    accuracy: 100,
    status: "mastered",
    lastReviewed: "2 days ago"
  },
  {
    beliefNumber: 4,
    title: "Son",
    category: "God",
    reference: "John 1:1, 14",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God... And the Word was made flesh, and dwelt among us.",
    accuracy: 85,
    status: "learning",
    lastReviewed: "3 days ago"
  },
  {
    beliefNumber: 5,
    title: "Holy Spirit",
    category: "God",
    reference: "John 14:26",
    text: "But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things.",
    accuracy: 88,
    status: "learning",
    lastReviewed: "3 days ago"
  },
  {
    beliefNumber: 6,
    title: "Creation",
    category: "God",
    reference: "Genesis 1:1-2",
    text: "In the beginning God created the heaven and the earth.",
    accuracy: 95,
    status: "mastered",
    lastReviewed: "4 days ago"
  },
  {
    beliefNumber: 7,
    title: "Nature of Humanity",
    category: "Man",
    reference: "Genesis 1:26-27",
    text: "And God said, Let us make man in our image, after our likeness.",
    accuracy: 70,
    status: "learning",
    lastReviewed: "5 days ago"
  },
  {
    beliefNumber: 8,
    title: "Great Controversy",
    category: "Salvation",
    reference: "Revelation 12:7-9",
    text: "And there was war in heaven: Michael and his angels fought against the dragon; and the dragon fought and his angels.",
    accuracy: 90,
    status: "mastered",
    lastReviewed: "1 day ago"
  },
  {
    beliefNumber: 9,
    title: "Life, Death & Resurrection",
    category: "Salvation",
    reference: "Romans 5:8",
    text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    accuracy: 94,
    status: "mastered",
    lastReviewed: "Today"
  },
  {
    beliefNumber: 10,
    title: "Experience of Salvation",
    category: "Salvation",
    reference: "Ephesians 2:8-9",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.",
    accuracy: 96,
    status: "mastered",
    lastReviewed: "Yesterday"
  },
  {
    beliefNumber: 11,
    title: "Growing in Christ",
    category: "Salvation",
    reference: "Colossians 2:6",
    text: "As ye have therefore received Christ Jesus the Lord, so walk ye in him.",
    accuracy: 78,
    status: "learning",
    lastReviewed: "4 days ago"
  },
  {
    beliefNumber: 12,
    title: "The Church",
    category: "Church",
    reference: "Ephesians 1:22-23",
    text: "And hath put all things under his feet, and gave him to be the head over all things to the church.",
    accuracy: 65,
    status: "learning",
    lastReviewed: "6 days ago"
  },
  {
    beliefNumber: 13,
    title: "The Remnant & Mission",
    category: "Church",
    reference: "Revelation 12:17",
    text: "And the dragon was wroth with the woman, and went to make war with the remnant of her seed, which keep the commandments of God, and have the testimony of Jesus Christ.",
    accuracy: 92,
    status: "mastered",
    lastReviewed: "2 days ago"
  },
  {
    beliefNumber: 14,
    title: "Unity in Body of Christ",
    category: "Church",
    reference: "1 Corinthians 12:12",
    text: "For as the body is one, and hath many members, and all the members of that one body, being many, are one body: so also is Christ.",
    accuracy: 60,
    status: "learning",
    lastReviewed: "1 week ago"
  },
  {
    beliefNumber: 15,
    title: "Baptism",
    category: "Church",
    reference: "Romans 6:3-4",
    text: "Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism into death.",
    accuracy: 84,
    status: "learning",
    lastReviewed: "5 days ago"
  },
  {
    beliefNumber: 16,
    title: "Lord's Supper",
    category: "Church",
    reference: "1 Corinthians 11:26",
    text: "For as often as ye eat this bread, and drink this cup, ye do shew the Lord's death till he come.",
    accuracy: 80,
    status: "learning",
    lastReviewed: "4 days ago"
  },
  {
    beliefNumber: 17,
    title: "Spiritual Gifts",
    category: "Church",
    reference: "Romans 12:6-8",
    text: "Having then gifts differing according to the grace that is given to us, whether prophecy, let us prophesy according to the proportion of faith.",
    accuracy: 0,
    status: "untested",
    lastReviewed: "Never"
  },
  {
    beliefNumber: 18,
    title: "Gift of Prophecy",
    category: "Church",
    reference: "Revelation 19:10",
    text: "For the testimony of Jesus is the spirit of prophecy.",
    accuracy: 98,
    status: "mastered",
    lastReviewed: "Yesterday"
  },
  {
    beliefNumber: 19,
    title: "Law of God",
    category: "Living",
    reference: "Exodus 20:3-17",
    text: "Thou shalt have no other gods before me... Remember the sabbath day, to keep it holy.",
    accuracy: 94,
    status: "mastered",
    lastReviewed: "Today"
  },
  {
    beliefNumber: 20,
    title: "The Sabbath",
    category: "Living",
    reference: "Exodus 20:8-11",
    text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God.",
    accuracy: 99,
    status: "mastered",
    lastReviewed: "Today"
  },
  {
    beliefNumber: 21,
    title: "Stewardship",
    category: "Living",
    reference: "Malachi 3:10",
    text: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts.",
    accuracy: 90,
    status: "mastered",
    lastReviewed: "3 days ago"
  },
  {
    beliefNumber: 22,
    title: "Christian Behavior",
    category: "Living",
    reference: "1 Corinthians 6:19-20",
    text: "What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own?",
    accuracy: 91,
    status: "mastered",
    lastReviewed: "Yesterday"
  },
  {
    beliefNumber: 23,
    title: "Marriage & Family",
    category: "Living",
    reference: "Genesis 2:24",
    text: "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh.",
    accuracy: 86,
    status: "learning",
    lastReviewed: "5 days ago"
  },
  {
    beliefNumber: 24,
    title: "Christ's Ministry in Sanctuary",
    category: "Restoration",
    reference: "Daniel 8:14",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    accuracy: 97,
    status: "mastered",
    lastReviewed: "Today"
  },
  {
    beliefNumber: 25,
    title: "Second Coming of Christ",
    category: "Restoration",
    reference: "1 Thessalonians 4:16-17",
    text: "For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first.",
    accuracy: 95,
    status: "mastered",
    lastReviewed: "Today"
  },
  {
    beliefNumber: 26,
    title: "Death & Resurrection",
    category: "Restoration",
    reference: "Ecclesiastes 9:5",
    text: "For the living know that they shall die: but the dead know not any thing, neither have they any more a reward.",
    accuracy: 93,
    status: "mastered",
    lastReviewed: "Yesterday"
  },
  {
    beliefNumber: 27,
    title: "Millennium & End of Sin",
    category: "Restoration",
    reference: "Revelation 20:4, 6",
    text: "And I saw thrones, and they sat upon them, and judgment was given unto them... they shall be priests of God and of Christ, and shall reign with him a thousand years.",
    accuracy: 75,
    status: "learning",
    lastReviewed: "4 days ago"
  },
  {
    beliefNumber: 28,
    title: "The New Earth",
    category: "Restoration",
    reference: "Revelation 21:1-4",
    text: "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away... And God shall wipe away all tears from their eyes.",
    accuracy: 98,
    status: "mastered",
    lastReviewed: "Today"
  }
];

const VMG_STORAGE_KEY = "stba_vmg_mastered_beliefs";

function extractKeyDrillWords(text: string): string[] {
  const words = text
    .replace(/[.,;:"'?!()—–-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 5);
  const unique: string[] = [];
  for (const w of words) {
    const low = w.toLowerCase();
    if (!unique.some((u) => u.toLowerCase() === low)) {
      unique.push(w);
    }
    if (unique.length >= 3) break;
  }
  return unique.length > 0 ? unique : ["God", "Word"];
}

const VMG_VERSE_PROGRESS_KEY = "stba_vmg_completed_verses_v2";

export const VisualMemoryGrid: React.FC<VisualMemoryGridProps> = ({
  onSelectScripture,
  onPlayInGamePack
}) => {
  // Per-belief completed verse reference keys (tracks e.g. "1 of 8 Completed" until all verses are done -> "Mastered")
  const [completedVersesByBelief, setCompletedVersesByBelief] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem(VMG_VERSE_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {}
    return {};
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [drillInput, setDrillInput] = useState<string>("");
  const [drillHint, setDrillHint] = useState<string | null>(null);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // Build enriched belief tiles with exact supporting verse lists from the 28 Fundamental Beliefs tracks
  const beliefVerseMap = React.useMemo(() => {
    const map: Record<number, BeliefVerseItem[]> = {};
    for (const t of DEFAULT_GRID_TILES) {
      map[t.beliefNumber] = getBeliefVerseList(t.beliefNumber, t.reference, t.text);
    }
    return map;
  }, []);

  const masteredBeliefs = DEFAULT_GRID_TILES.filter((t) => {
    const verses = beliefVerseMap[t.beliefNumber] || [];
    const done = completedVersesByBelief[t.beliefNumber] || [];
    return verses.length > 0 && done.length >= verses.length;
  }).map((t) => t.beliefNumber);

  // Progressive one-by-one reveal: Belief #1 is unlocked first; each subsequent belief unlocks only after ALL verses of the prior belief are mastered
  const highestSequentialMastered = (() => {
    let n = 0;
    while (masteredBeliefs.includes(n + 1) && n < DEFAULT_GRID_TILES.length) {
      n++;
    }
    return n;
  })();
  const unlockedUpTo = Math.min(DEFAULT_GRID_TILES.length, highestSequentialMastered + 1);

  const tiles = DEFAULT_GRID_TILES.map((t) => {
    const verses = beliefVerseMap[t.beliefNumber] || [];
    const doneKeys = completedVersesByBelief[t.beliefNumber] || [];
    const completedVerseCount = Math.min(doneKeys.length, verses.length);
    const totalVerseCount = verses.length;
    const isMastered = totalVerseCount > 0 && completedVerseCount >= totalVerseCount;
    const isCurrent = t.beliefNumber === unlockedUpTo && !isMastered;
    const pct = totalVerseCount > 0 ? Math.round((completedVerseCount / totalVerseCount) * 100) : 0;
    return {
      ...t,
      verses,
      completedVerseCount,
      totalVerseCount,
      status: (isMastered ? "mastered" : isCurrent ? "learning" : "untested") as "mastered" | "learning" | "untested",
      accuracy: pct,
      lastReviewed: isMastered
        ? "Mastered"
        : completedVerseCount > 0
        ? `${completedVerseCount} of ${totalVerseCount} Completed`
        : isCurrent
        ? `0 of ${totalVerseCount} Completed`
        : "Locked"
    };
  });

  const [activeBeliefNumber, setActiveBeliefNumber] = useState<number>(unlockedUpTo);
  const activeTile = tiles.find((t) => t.beliefNumber === activeBeliefNumber) || tiles[0];

  const categories = ["All", "God", "Man", "Salvation", "Church", "Living", "Restoration"];

  const filteredTiles = selectedCategory === "All"
    ? tiles
    : tiles.filter((t) => t.category === selectedCategory);

  const masteredCount = masteredBeliefs.length;
  const averageAccuracy = Math.round((masteredCount / tiles.length) * 100);

  const activeIsMastered = masteredBeliefs.includes(activeTile.beliefNumber);
  const activeDoneKeys = completedVersesByBelief[activeTile.beliefNumber] || [];
  const nextPendingVerse =
    activeTile.verses.find((v) => !activeDoneKeys.includes(normalizeRefKey(v.reference))) ||
    activeTile.verses[0];
  const currentDrillVerse = nextPendingVerse || { reference: activeTile.reference, text: activeTile.text };
  const activeDrillWords = extractKeyDrillWords(currentDrillVerse.text);

  const triggerBanner = (msg: string) => {
    setCelebrationBanner(msg);
    setTimeout(() => setCelebrationBanner(null), 4500);
  };

  const handleTileClick = (tile: (typeof tiles)[number]) => {
    const isUnlocked = tile.beliefNumber <= unlockedUpTo || masteredBeliefs.includes(tile.beliefNumber);
    if (!isUnlocked) {
      playGentleNudge();
      triggerBanner(`Complete all verses in Belief #${unlockedUpTo} first to reveal Belief #${tile.beliefNumber}.`);
      return;
    }
    playTransitionChime();
    setActiveBeliefNumber(tile.beliefNumber);
    setDrillInput("");
    setDrillHint(null);
  };

  const handleCompleteInlineDrill = () => {
    const cleaned = drillInput.trim().toLowerCase();
    const matched = activeDrillWords.filter((w) => cleaned.includes(w.toLowerCase()));
    if (cleaned.length < 10 || matched.length === 0) {
      playGentleNudge();
      setDrillHint(
        `Complete the recall drill before reveal — include key term(s) such as "${activeDrillWords[0]}" from ${currentDrillVerse.reference}.`
      );
      return;
    }

    const verseKey = normalizeRefKey(currentDrillVerse.reference);
    const prevDone = completedVersesByBelief[activeTile.beliefNumber] || [];
    const nextDone = prevDone.includes(verseKey) ? prevDone : [...prevDone, verseKey];
    const updatedMap = {
      ...completedVersesByBelief,
      [activeTile.beliefNumber]: nextDone
    };
    setCompletedVersesByBelief(updatedMap);
    try {
      localStorage.setItem(VMG_VERSE_PROGRESS_KEY, JSON.stringify(updatedMap));
    } catch {}

    setDrillInput("");
    setDrillHint(null);
    playCelebrationChime();

    const totalForBelief = activeTile.totalVerseCount;
    const nowMastered = nextDone.length >= totalForBelief;

    if (nowMastered) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#DFC57B", "#F3CF65", "#2A9D8F", "#ffffff"]
        });
      } catch {}
      const nextNum = activeTile.beliefNumber + 1;
      if (nextNum <= DEFAULT_GRID_TILES.length) {
        triggerBanner(`Belief #${activeTile.beliefNumber} Mastered (${totalForBelief} of ${totalForBelief})! Belief #${nextNum} is now unlocked.`);
      } else {
        triggerBanner("All 28 Fundamental Beliefs Mastered! Praise God!");
      }
    } else {
      triggerBanner(
        `${currentDrillVerse.reference} completed — ${nextDone.length} of ${totalForBelief} Completed for Belief #${activeTile.beliefNumber}!`
      );
    }
  };

  return (
    <div className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-6" id="visual-memory-grid-root">
      {/* HEADER WITH THREE-LINE INSTRUCTIONAL SENTENCE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#DFC57B]">
            <LayoutGrid className="w-5 h-5 text-[#DFC57B] drop-shadow-[0_0_6px_rgba(223,197,123,0.4)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              VISUAL MEMORY GRID
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            28 Fundamental Beliefs Memory Matrix
          </h2>
          {/* Three-line instructional guide */}
          <p className="text-xs text-stone-300 leading-relaxed max-w-xl" id="vmg-three-line-instructions">
            Begin with Belief #1 and complete the active recall drill before revealing the full passage.<br />
            Scriptures unlock and reveal strictly one-by-one as you demonstrate mastery over each belief.<br />
            Follow the golden progression path across all 28 doctrines until every memory verse is sealed in your heart.
          </p>
        </div>

        {/* SUMMARY STATS */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 bg-[#06162c] border border-[#DFC57B]/60 rounded-xl text-center">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block">
              MASTERED
            </span>
            <span className="text-sm font-bold text-[#DFC57B]">
              {masteredCount} / 28
            </span>
          </div>
          <div className="px-3 py-2 bg-[#06162c] border border-[#DFC57B]/60 rounded-xl text-center">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block">
              PROGRESS
            </span>
            <span className="text-sm font-bold text-emerald-400">
              {averageAccuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* CELEBRATORY TRANSITION & LOCK NOTIFICATION BANNER */}
      <AnimatePresence>
        {celebrationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#06162c] via-[#0d3060] to-[#06162c] border border-[#DFC57B]/70 text-[#F3CF65] text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg"
            id="vmg-celebration-banner"
          >
            <Sparkles className="w-4 h-4 text-[#F3CF65] shrink-0 animate-pulse" />
            <span>{celebrationBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER BUTTONS (ROUND WITH GOLD TRIM) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
          FILTER BY DOCTRINAL CATEGORY:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                  : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GRID CANVAS & TILE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TILES MATRIX (7 COLS ON LG) */}
        <div className="lg:col-span-7 bg-[#0B101B] border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-b border-stone-800 pb-2">
            <span>UNLOCKED: {unlockedUpTo} / 28 SCRIPTURE TILES</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DFC57B]"></span> Mastered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-700"></span> Locked
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {filteredTiles.map((tile) => {
              const isSelected = activeTile?.beliefNumber === tile.beliefNumber;
              const isUnlocked = tile.beliefNumber <= unlockedUpTo || tile.status === "mastered";
              return (
                <button
                  key={tile.beliefNumber}
                  onClick={() => handleTileClick(tile)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-150 relative flex flex-col items-center justify-between min-h-18 ${
                    isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  } ${
                    isSelected
                      ? "ring-2 ring-[#DFC57B] scale-105 shadow-[0_0_12px_rgba(223,197,123,0.4)]"
                      : ""
                  } ${
                    tile.status === "mastered"
                      ? "bg-[#06162c] border-[#DFC57B]/80 hover:border-[#DFC57B]"
                      : tile.status === "learning"
                      ? "bg-[#1f1a14] border-amber-500/80 hover:border-amber-400"
                      : "bg-stone-900 border-stone-800"
                  }`}
                >
                  <span className="text-[9px] font-mono text-stone-400 font-bold">
                    #{tile.beliefNumber}
                  </span>
                  <span className="text-[10px] font-serif font-bold text-white line-clamp-1">
                    {isUnlocked ? tile.title : "Locked"}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {tile.status === "mastered" ? (
                      <span className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-[#DFC57B]">
                        <CheckCircle2 className="w-3 h-3 text-[#DFC57B]" />
                        <span>{tile.totalVerseCount}/{tile.totalVerseCount}</span>
                      </span>
                    ) : tile.status === "learning" ? (
                      <span className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-amber-300">
                        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>{tile.completedVerseCount}/{tile.totalVerseCount}</span>
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-stone-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TILE INSPECTOR (5 COLS ON LG) */}
        {activeTile && (
          <div className="lg:col-span-5 bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#DFC57B] font-bold block">
                  BELIEF #{activeTile.beliefNumber} · {activeTile.category}
                </span>
                <h3 className="text-base font-serif font-bold text-white mt-0.5">
                  {activeTile.title}
                </h3>
              </div>
              <span
                id="vmg-belief-status-badge"
                className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold border shrink-0 ${
                  activeIsMastered
                    ? "bg-[#DFC57B]/20 text-[#DFC57B] border-[#DFC57B]/50"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {activeIsMastered
                  ? "Mastered"
                  : `${activeTile.completedVerseCount} of ${activeTile.totalVerseCount} Completed`}
              </span>
            </div>

            {/* SUPPORTING VERSES PROGRESS STRIP */}
            <div className="flex flex-wrap items-center gap-1.5" id="vmg-belief-verse-pills">
              {activeTile.verses.map((v, idx) => {
                const isDone = activeDoneKeys.includes(normalizeRefKey(v.reference));
                const isCurrentDrill = !activeIsMastered && normalizeRefKey(v.reference) === normalizeRefKey(currentDrillVerse.reference);
                return (
                  <span
                    key={`${v.reference}-${idx}`}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${
                      isDone
                        ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
                        : isCurrentDrill
                        ? "bg-[#0d3060] border-[#F3CF65] text-[#F3CF65]"
                        : "bg-stone-900 border-stone-800 text-stone-500"
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                    <span>{v.reference}</span>
                  </span>
                );
              })}
            </div>

            {/* SCRIPTURE PASSAGE (VEILED UNTIL ALL VERSES COMPLETED; COMPLETED VERSES SHOWN AS EARNED) */}
            {activeIsMastered ? (
              <div className="p-4 bg-[#161D2B] border-2 border-[#DFC57B]/70 rounded-xl space-y-2.5 text-center max-h-56 overflow-y-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                  All {activeTile.totalVerseCount} Supporting Scriptures Mastered
                </span>
                {activeTile.verses.map((v, i) => (
                  <div key={i} className="pt-2 border-t border-stone-800/70 first:border-t-0 first:pt-0">
                    <span className="text-xs font-serif font-bold text-[#DFC57B] block">
                      {v.reference}
                    </span>
                    <p className="text-xs font-bible text-stone-100 font-semibold leading-relaxed mt-0.5">
                      "{v.text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#161D2B] border border-amber-500/40 rounded-xl space-y-3" id="vmg-forced-drill-box">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-serif font-bold text-[#DFC57B]">
                    Verse {activeTile.completedVerseCount + 1} of {activeTile.totalVerseCount}: {currentDrillVerse.reference}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3" /> Drill to Unlock
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Recall & type <strong className="text-stone-200">{currentDrillVerse.reference}</strong> (key concepts: <span className="text-[#DFC57B]">{activeDrillWords.slice(0, 2).join(", ")}</span>) to mark it completed ({activeTile.completedVerseCount + 1} of {activeTile.totalVerseCount}).
                </p>
                <textarea
                  value={drillInput}
                  onChange={(e) => setDrillInput(e.target.value)}
                  rows={3}
                  placeholder={`Type your recall of ${currentDrillVerse.reference} here...`}
                  className="w-full bg-[#0B101B] border border-stone-700 focus:border-[#DFC57B] rounded-lg p-2.5 text-xs text-stone-100 outline-none resize-none"
                />
                {drillHint && (
                  <p className="text-[11px] text-amber-400 font-medium">{drillHint}</p>
                )}
                <button
                  type="button"
                  onClick={handleCompleteInlineDrill}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#041410] text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Verse ({activeTile.completedVerseCount + 1} of {activeTile.totalVerseCount})</span>
                </button>
              </div>
            )}

            {/* NEXT UNLOCKED TRANSITION BUTTON WHEN MASTERED */}
            {activeIsMastered && activeTile.beliefNumber < DEFAULT_GRID_TILES.length && (
              <button
                type="button"
                onClick={() => {
                  playTransitionChime();
                  setActiveBeliefNumber(activeTile.beliefNumber + 1);
                  setDrillInput("");
                  setDrillHint(null);
                }}
                className="w-full py-2.5 bg-[#0d3060] hover:bg-[#134282] text-[#F3CF65] border border-[#DFC57B]/70 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Advance to Belief #{activeTile.beliefNumber + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* ACTION BUTTONS SPLIT SIDE-BY-SIDE: VERBATIM GYM OR SCRIPTURE GAME PACK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {onSelectScripture && (
                <button
                  id="btn-vmg-practice-gym"
                  type="button"
                  onClick={() => {
                    playTransitionChime();
                    onSelectScripture({
                      id: `belief-${activeTile.beliefNumber}-${normalizeRefKey(currentDrillVerse.reference)}`,
                      reference: currentDrillVerse.reference,
                      text: currentDrillVerse.text,
                      keywords: activeDrillWords
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Brain className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Verbatim Gym</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}

              {onPlayInGamePack && (
                <button
                  id="btn-vmg-play-gamepack"
                  type="button"
                  onClick={() => {
                    playTransitionChime();
                    onPlayInGamePack({
                      id: `belief-${activeTile.beliefNumber}-${normalizeRefKey(currentDrillVerse.reference)}`,
                      reference: currentDrillVerse.reference,
                      text: currentDrillVerse.text,
                      keywords: activeDrillWords
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-[#06162c] hover:bg-[#0d3060] text-stone-100 hover:text-white border border-[#DFC57B]/75 hover:border-[#F3CF65] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_4px_16px_rgba(223,197,123,0.3)]"
                >
                  <Gamepad2 className="w-4 h-4 text-[#DFC57B] shrink-0" />
                  <span className="truncate">Scripture Game Pack</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DFC57B] shrink-0" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
