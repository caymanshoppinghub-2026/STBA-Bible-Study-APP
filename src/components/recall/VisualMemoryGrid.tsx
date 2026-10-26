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
  Filter
} from "lucide-react";
import { Scripture } from "../../types";

interface VisualMemoryGridProps {
  onSelectScripture?: (scripture: Scripture) => void;
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

export const VisualMemoryGrid: React.FC<VisualMemoryGridProps> = ({
  onSelectScripture
}) => {
  const [tiles, setTiles] = useState<GridTile[]>(DEFAULT_GRID_TILES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTile, setActiveTile] = useState<GridTile | null>(DEFAULT_GRID_TILES[0]);

  const categories = ["All", "God", "Man", "Salvation", "Church", "Living", "Restoration"];

  const filteredTiles = selectedCategory === "All"
    ? tiles
    : tiles.filter(t => t.category === selectedCategory);

  const masteredCount = tiles.filter(t => t.status === "mastered").length;
  const learningCount = tiles.filter(t => t.status === "learning").length;
  const untestedCount = tiles.filter(t => t.status === "untested").length;
  const averageAccuracy = Math.round(
    tiles.reduce((acc, t) => acc + t.accuracy, 0) / tiles.length
  );

  return (
    <div className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-6" id="visual-memory-grid-root">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#DFC57B]">
            <LayoutGrid className="w-5 h-5 text-[#DFC57B] drop-shadow-[0_0_6px_rgba(223,197,123,0.4)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              VISUAL MEMORY GRID
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            28 Fundamental Beliefs Memory Matrix
          </h2>
          <p className="text-xs text-stone-400">
            A visual progress heat-matrix mapping your active neural recall strength across the entire doctrinal landscape.
          </p>
        </div>

        {/* SUMMARY STATS */}
        <div className="flex items-center gap-2">
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
              RETENTION INDEX
            </span>
            <span className="text-sm font-bold text-emerald-400">
              {averageAccuracy}%
            </span>
          </div>
        </div>
      </div>

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
            <span>SHOWING {filteredTiles.length} SCRIPTURE TILES</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DFC57B]"></span> Mastered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Learning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-700"></span> Untested
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {filteredTiles.map((tile) => {
              const isSelected = activeTile?.beliefNumber === tile.beliefNumber;
              return (
                <button
                  key={tile.beliefNumber}
                  onClick={() => setActiveTile(tile)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-150 cursor-pointer relative flex flex-col items-center justify-between min-h-18 ${
                    isSelected
                      ? "ring-2 ring-[#DFC57B] scale-105 shadow-[0_0_12px_rgba(223,197,123,0.4)]"
                      : ""
                  } ${
                    tile.status === "mastered"
                      ? "bg-[#06162c] border-[#DFC57B]/80 hover:border-[#DFC57B]"
                      : tile.status === "learning"
                      ? "bg-[#1f1a14] border-amber-600/70 hover:border-amber-500"
                      : "bg-stone-900 border-stone-800 hover:border-stone-700 opacity-60"
                  }`}
                >
                  <span className="text-[9px] font-mono text-stone-400 font-bold">
                    #{tile.beliefNumber}
                  </span>
                  <span className="text-[10px] font-serif font-bold text-white line-clamp-1">
                    {tile.title}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {tile.status === "mastered" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#DFC57B]" />
                    ) : tile.status === "learning" ? (
                      <span className="text-[9px] font-mono text-amber-400 font-bold">
                        {tile.accuracy}%
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
              <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold border ${
                activeTile.status === "mastered"
                  ? "bg-[#DFC57B]/20 text-[#DFC57B] border-[#DFC57B]/50"
                  : activeTile.status === "learning"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-stone-800 text-stone-400 border-stone-700"
              }`}>
                {activeTile.status}
              </span>
            </div>

            {/* SCRIPTURE PASSAGE */}
            <div className="p-4 bg-[#161D2B] border border-stone-800 rounded-xl space-y-2">
              <span className="text-xs font-serif font-bold text-[#DFC57B]">
                {activeTile.reference}
              </span>
              <p className="text-xs sm:text-sm font-sans text-stone-100 font-semibold leading-relaxed">
                "{activeTile.text}"
              </p>
            </div>

            {/* PERFORMANCE METRICS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
                <span className="text-[9px] font-mono text-stone-500 uppercase block">
                  RETENTION SCORE
                </span>
                <span className="text-sm font-bold text-white">
                  {activeTile.accuracy}% Precision
                </span>
              </div>
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
                <span className="text-[9px] font-mono text-stone-500 uppercase block">
                  LAST REVIEWED
                </span>
                <span className="text-sm font-bold text-stone-300">
                  {activeTile.lastReviewed}
                </span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            {onSelectScripture && (
              <button
                onClick={() => onSelectScripture({
                  id: `belief-${activeTile.beliefNumber}`,
                  reference: activeTile.reference,
                  text: activeTile.text,
                  keywords: [activeTile.title, activeTile.reference]
                })}
                className="w-full py-2.5 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Test Recall on {activeTile.reference}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
