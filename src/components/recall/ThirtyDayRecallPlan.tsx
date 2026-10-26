/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CalendarCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Brain,
  Sparkles,
  Gamepad2
} from "lucide-react";
import { Scripture } from "../../types";
import { useApp } from "../../context/AppContext";

interface ThirtyDayRecallPlanProps {
  onSelectVerseForPractice?: (scripture: Scripture) => void;
  onPlayInGamePack?: (scripture: Scripture) => void;
}

interface PlanDay {
  day: number;
  phase: number;
  phaseTitle: string;
  topic: string;
  reference: string;
  text: string;
  keywords: string[];
  mnemonicTip: string;
}

const THIRTY_DAY_CURRICULUM: PlanDay[] = [
  // PHASE 1: Foundations of Faith & Divine Inspiration (Days 1–7)
  {
    day: 1,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "The Divine Authority of Scripture",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "righteousness"],
    mnemonicTip: "Remember the 4-fold profit: Doctrine, Reproof, Correction, Instruction (D-R-C-I)."
  },
  {
    day: 2,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "The Holy Spirit & Prophecy",
    reference: "2 Peter 1:21",
    text: "For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
    keywords: ["prophecy", "holy", "moved", "Ghost"],
    mnemonicTip: "Picture the sails of a ship moved by the wind of the Holy Spirit."
  },
  {
    day: 3,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "The Illuminating Word",
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    keywords: ["word", "lamp", "feet", "light", "path"],
    mnemonicTip: "Contrast the intimate lamp (feet) with the distant light (path ahead)."
  },
  {
    day: 4,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "The Touchstone of Truth",
    reference: "Isaiah 8:20",
    text: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
    keywords: ["law", "testimony", "word", "light"],
    mnemonicTip: "Two witnesses: Law (Written Standard) + Testimony (Living Witness)."
  },
  {
    day: 5,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "The Piercing Sword",
    reference: "Hebrews 4:12",
    text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit.",
    keywords: ["quick", "powerful", "sharper", "sword", "piercing"],
    mnemonicTip: "'Quick' means alive and pulsing with divine energy."
  },
  {
    day: 6,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "Sanctified by Truth",
    reference: "John 17:17",
    text: "Sanctify them through thy truth: thy word is truth.",
    keywords: ["Sanctify", "truth", "word"],
    mnemonicTip: "Short, profound Jesus prayer. Memorize in a single breath."
  },
  {
    day: 7,
    phase: 1,
    phaseTitle: "Divine Inspiration & Authority",
    topic: "The Living Word Received",
    reference: "1 Thessalonians 2:13",
    text: "For this cause also thank we God without ceasing, because, when ye received the word of God which ye heard of us, ye received it not as the word of men, but as it is in truth, the word of God.",
    keywords: ["received", "word", "men", "truth", "God"],
    mnemonicTip: "Key distinction: word of men vs. the living word of God."
  },

  // PHASE 2: God's Character, Grace & The Law (Days 8–14)
  {
    day: 8,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "Saved by Grace Through Faith",
    reference: "Ephesians 2:8-9",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
    keywords: ["grace", "saved", "faith", "gift", "works"],
    mnemonicTip: "Anchor: Grace = The Source, Faith = The Hand, Gift = The Price (Unbought)."
  },
  {
    day: 9,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "Establishing the Law",
    reference: "Romans 3:31",
    text: "Do we then make void the law through faith? God forbid: yea, we establish the law.",
    keywords: ["void", "law", "faith", "establish"],
    mnemonicTip: "Faith does not extinguish the law; it establishes it in the renewed heart."
  },
  {
    day: 10,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "The Memorial of Creation",
    reference: "Exodus 20:8-11",
    text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God.",
    keywords: ["Remember", "sabbath", "holy", "seventh", "God"],
    mnemonicTip: "'Remember' looks back to Eden and forward to Eternity."
  },
  {
    day: 11,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "The Sign of Sanctification",
    reference: "Ezekiel 20:12",
    text: "Moreover also I gave them my sabbaths, to be a sign between me and them, that they might know that I am the LORD that sanctify them.",
    keywords: ["sabbaths", "sign", "know", "LORD", "sanctify"],
    mnemonicTip: "Sabbath as a covenant sign of divine sanctifying power."
  },
  {
    day: 12,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "Delight in God's Law",
    reference: "Psalm 40:8",
    text: "I delight to do thy will, O my God: yea, thy law is within my heart.",
    keywords: ["delight", "will", "God", "law", "heart"],
    mnemonicTip: "From stone tablets to fleshy tables of the heart."
  },
  {
    day: 13,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "Love Manifested in Obedience",
    reference: "1 John 5:3",
    text: "For this is the love of God, that we keep his commandments: and his commandments are not grievous.",
    keywords: ["love", "commandments", "grievous"],
    mnemonicTip: "Commandments are not grievous when fueled by love."
  },
  {
    day: 14,
    phase: 2,
    phaseTitle: "Character, Grace & The Law",
    topic: "Christ and the Law",
    reference: "Matthew 5:17-18",
    text: "Think not that I am come to destroy the law, or the prophets: I am not come to destroy, but to fulfil.",
    keywords: ["destroy", "law", "prophets", "fulfil"],
    mnemonicTip: "'Fulfil' (pleroo) means to fill full, magnifying its depth."
  },

  // PHASE 3: Sanctuary, Judgment & The Three Angels (Days 15–21)
  {
    day: 15,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "The 2300-Day Prophecy",
    reference: "Daniel 8:14",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    keywords: ["thousand", "hundred", "days", "sanctuary", "cleansed"],
    mnemonicTip: "457 BC to 1844: The onset of the Investigative Judgment."
  },
  {
    day: 16,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "Our Heavenly High Priest",
    reference: "Hebrews 8:1-2",
    text: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
    keywords: ["high", "priest", "sanctuary", "tabernacle", "pitched"],
    mnemonicTip: "'This is the sum' — Christ is ministering for us today."
  },
  {
    day: 17,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "The Throne of Grace",
    reference: "Hebrews 4:16",
    text: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
    keywords: ["boldly", "throne", "grace", "mercy", "need"],
    mnemonicTip: "Come boldly, not presumptuously, because our High Priest understands."
  },
  {
    day: 18,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "The First Angel's Message",
    reference: "Revelation 14:6-7",
    text: "Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
    keywords: ["Fear", "glory", "judgment", "worship", "heaven"],
    mnemonicTip: "Judgment is come (present tense) + call to worship the Creator."
  },
  {
    day: 19,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "The Second Angel's Message",
    reference: "Revelation 14:8",
    text: "Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.",
    keywords: ["Babylon", "fallen", "nations", "wine", "fornication"],
    mnemonicTip: "Double proclamation: 'is fallen, is fallen'."
  },
  {
    day: 20,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "The Third Angel's Warning",
    reference: "Revelation 14:9-10",
    text: "If any man worship the beast and his image, and receive his mark in his forehead, or in his hand, The same shall drink of the wine of the wrath of God.",
    keywords: ["worship", "beast", "image", "mark", "wrath"],
    mnemonicTip: "The most solemn warning in all of Holy Scripture."
  },
  {
    day: 21,
    phase: 3,
    phaseTitle: "Sanctuary & Prophetic Truth",
    topic: "The Patience of the Saints",
    reference: "Revelation 14:12",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    keywords: ["patience", "saints", "commandments", "faith", "Jesus"],
    mnemonicTip: "The Remnant hallmark: God's Commandments + The Faith OF Jesus."
  },

  // PHASE 4: Discipleship, Health & The Second Coming (Days 22–30)
  {
    day: 22,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "The Temple of the Holy Spirit",
    reference: "1 Corinthians 6:19-20",
    text: "What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own? For ye are bought with a price: therefore glorify God in your body.",
    keywords: ["body", "temple", "Holy", "bought", "price", "glorify"],
    mnemonicTip: "Health message as the right arm of the Third Angel's Message."
  },
  {
    day: 23,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "Wholesome Living",
    reference: "1 Corinthians 10:31",
    text: "Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God.",
    keywords: ["eat", "drink", "whatsoever", "glory", "God"],
    mnemonicTip: "Comprehensive standard: eating, drinking, and doing."
  },
  {
    day: 24,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "The State of the Dead",
    reference: "Ecclesiastes 9:5",
    text: "For the living know that they shall die: but the dead know not any thing, neither have they any more a reward; for the memory of them is forgotten.",
    keywords: ["living", "die", "dead", "know", "forgotten"],
    mnemonicTip: "The unconscious sleep of the dead awaiting the resurrection."
  },
  {
    day: 25,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "The First Resurrection",
    reference: "1 Thessalonians 4:16-17",
    text: "For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first.",
    keywords: ["descend", "shout", "voice", "trump", "rise"],
    mnemonicTip: "Shout, Voice, Trumpet — audible, visible, literal Second Coming."
  },
  {
    day: 26,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "The Blessed Hope",
    reference: "Titus 2:13",
    text: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
    keywords: ["blessed", "hope", "glorious", "appearing", "Saviour"],
    mnemonicTip: "The Blessed Hope anchors the Advent movement."
  },
  {
    day: 27,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "Rightly Dividing the Word",
    reference: "2 Timothy 2:15",
    text: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
    keywords: ["Study", "approved", "workman", "ashamed", "dividing"],
    mnemonicTip: "The motto of STBA: 'orthotomeo' = cutting a straight path in the Word."
  },
  {
    day: 28,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "Teaching Others",
    reference: "2 Timothy 2:2",
    text: "And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also.",
    keywords: ["heard", "commit", "faithful", "teach", "others"],
    mnemonicTip: "4 generations of discipleship: Paul -> Timothy -> Faithful men -> Others."
  },
  {
    day: 29,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "The Great Commission",
    reference: "Matthew 28:19-20",
    text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you.",
    keywords: ["Go", "teach", "nations", "baptizing", "observe"],
    mnemonicTip: "Go, Teach, Baptize, Discipleship."
  },
  {
    day: 30,
    phase: 4,
    phaseTitle: "Discipleship & The Blessed Hope",
    topic: "The Ultimate Restoration",
    reference: "Revelation 21:3-4",
    text: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
    keywords: ["wipe", "tears", "death", "sorrow", "pain", "passed"],
    mnemonicTip: "The grand consummation of the Great Controversy. Sin is no more!"
  }
];

export const ThirtyDayRecallPlan: React.FC<ThirtyDayRecallPlanProps> = ({
  onSelectVerseForPractice,
  onPlayInGamePack
}) => {
  const { showConfetti } = useApp();

  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("stba_30day_progress");
      return saved ? JSON.parse(saved) : [1, 2];
    } catch (e) {
      return [1, 2];
    }
  });

  const [activePhase, setActivePhase] = useState<number>(0); // 0 = all, 1, 2, 3, 4
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  const selectedDay = THIRTY_DAY_CURRICULUM.find(d => d.day === selectedDayNum) || THIRTY_DAY_CURRICULUM[0];

  const toggleDayCompletion = (dayNum: number) => {
    let next: number[];
    if (completedDays.includes(dayNum)) {
      next = completedDays.filter(d => d !== dayNum);
    } else {
      next = [...completedDays, dayNum];
      showConfetti("recall");
    }
    setCompletedDays(next);
    localStorage.setItem("stba_30day_progress", JSON.stringify(next));
  };

  const filteredDays = activePhase === 0
    ? THIRTY_DAY_CURRICULUM
    : THIRTY_DAY_CURRICULUM.filter(d => d.phase === activePhase);

  const completionPercent = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-6" id="thirty-day-recall-plan-root">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#DFC57B]">
            <CalendarCheck className="w-5 h-5 text-[#DFC57B] drop-shadow-[0_0_6px_rgba(223,197,123,0.4)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              30-DAY SCRIPTURE RECALL TRAINING PLAN
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            The 30-Day Discipleship Scripture Track
          </h2>
          <p className="text-xs text-stone-400">
            A structured day-by-day progression taking you from foundational inspiration to the glorious climax of the Three Angels' Messages.
          </p>
        </div>

        {/* PROGRESS METRIC */}
        <div className="flex items-center gap-3 bg-[#06162c] border border-[#DFC57B]/60 px-4 py-2 rounded-xl shrink-0">
          <Award className="w-5 h-5 text-[#DFC57B]" />
          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              TRACK PROGRESS
            </span>
            <span className="text-xs font-bold text-white">
              Day {completedDays.length} of 30 Complete ({completionPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* PHASE FILTER BUTTONS (ROUND WITH GOLD TRIM) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
          SELECT PHASE:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 0, label: "All 30 Days" },
            { id: 1, label: "Phase 1: Inspiration (Days 1–7)" },
            { id: 2, label: "Phase 2: Grace & Law (Days 8–14)" },
            { id: 3, label: "Phase 3: Sanctuary (Days 15–21)" },
            { id: 4, label: "Phase 4: Hope (Days 22–30)" }
          ].map(ph => (
            <button
              key={ph.id}
              onClick={() => setActivePhase(ph.id)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all border cursor-pointer ${
                activePhase === ph.id
                  ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                  : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
              }`}
            >
              <span>{ph.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DAY SELECTION MATRIX & DETAILS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* DAYS LIST (5 COLS ON LG) */}
        <div className="lg:col-span-5 space-y-2 max-h-120 overflow-y-auto pr-1">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-3">
            {filteredDays.map(item => {
              const isDone = completedDays.includes(item.day);
              const isCurrent = item.day === selectedDayNum;
              return (
                <button
                  key={item.day}
                  onClick={() => setSelectedDayNum(item.day)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border text-center ${
                    isCurrent
                      ? "bg-[#DFC57B] text-[#06162c] font-bold border-[#DFC57B] shadow-md ring-2 ring-[#DFC57B]/50"
                      : isDone
                      ? "bg-[#06162c] border-[#DFC57B]/60 text-[#DFC57B]"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <span className="text-[9px] font-mono">DAY</span>
                  <span className="text-sm font-bold">{item.day}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 stroke-[3] mt-0.5" />}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-stone-400 font-mono">
            Click any day to preview scripture & exegesis anchors.
          </div>
        </div>

        {/* SELECTED DAY DETAIL CARD (7 COLS ON LG) */}
        <div className="lg:col-span-7 bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#DFC57B] font-bold block">
                DAY {selectedDay.day} · {selectedDay.phaseTitle}
              </span>
              <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                {selectedDay.topic}
              </h3>
            </div>
            <button
              onClick={() => toggleDayCompletion(selectedDay.day)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                completedDays.includes(selectedDay.day)
                  ? "bg-[#DFC57B] text-[#06162c]"
                  : "bg-stone-800 hover:bg-stone-700 text-stone-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{completedDays.includes(selectedDay.day) ? "Completed" : "Mark Complete"}</span>
            </button>
          </div>

          {/* SCRIPTURE DISPLAY */}
          <div className="p-4 bg-[#161D2B] border border-stone-800 rounded-xl space-y-2">
            <span className="text-xs font-serif font-bold text-[#DFC57B]">
              {selectedDay.reference}
            </span>
            <p className="text-sm font-sans text-stone-100 font-semibold leading-relaxed">
              "{selectedDay.text}"
            </p>
          </div>

          {/* MNEMONIC TIP */}
          <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block font-bold">
              COGNITIVE MNEMONIC HOOK:
            </span>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              {selectedDay.mnemonicTip}
            </p>
          </div>

          {/* KEYWORDS */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-bold mr-1">
              KEYWORDS:
            </span>
            {selectedDay.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-[#06162c] text-[#DFC57B] border border-[#DFC57B]/30 rounded text-[10px] font-mono font-semibold"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800">
            {onSelectVerseForPractice && (
              <button
                onClick={() => onSelectVerseForPractice({
                  id: `day-${selectedDay.day}`,
                  reference: selectedDay.reference,
                  text: selectedDay.text,
                  keywords: selectedDay.keywords
                })}
                className="px-4 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Practice in Recall Gym</span>
              </button>
            )}

            {onPlayInGamePack && (
              <button
                onClick={() => onPlayInGamePack({
                  id: `day-${selectedDay.day}`,
                  reference: selectedDay.reference,
                  text: selectedDay.text,
                  keywords: selectedDay.keywords
                })}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#DFC57B]" />
                <span>Play in Game Pack</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
