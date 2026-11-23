import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles,
  Award,
  BookOpen,
  Brain,
  BookMarked,
  Compass,
  Check,
  Search,
  Quote,
  X
} from "lucide-react";
import elderStephenAvatar from "../assets/images/elder_steven_portrait_1788201900752.jpg";

interface Particle {
  id: number;
  isLeft: boolean;
  color: string;
  shape: "circle" | "square" | "triangle" | "star";
  size: number;
  midX: string;
  endX: string;
  peakY: string;
  duration: number;
  delay: number;
  rotation: number;
}

export const Confetti: React.FC = () => {
  const { activeConfetti, closeConfetti } = useApp();
  const { tokens } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (activeConfetti?.active) {
      const colors = [
        "#C9973A", // Sacred Gold
        "#D4A857", // Warm Amber
        "#2A9D8F", // Sanctuary Teal
        "#E76F51", // Earth Terracotta
        "#F4A261", // Desert Sand
        "#E9C46A", // Flaxen Yellow
        "#3A86C8", // Heavens Blue
        "#9B5DE5"  // Royal Purple
      ];
      const shapes = ["circle", "square", "triangle", "star"] as const;

      // Generate 120 particles for a dual-corner explosion
      const generated: Particle[] = Array.from({ length: 120 }).map((_, i) => {
        const isLeft = i % 2 === 0;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.floor(Math.random() * 10) + 8; // 8px to 18px
        
        // Target paths
        const peakY = Math.floor(Math.random() * 35) + 15; // 15vh to 50vh
        const midX = isLeft 
          ? Math.floor(Math.random() * 30) + 15  // 15vw to 45vw
          : Math.floor(Math.random() * 30) + 55; // 55vw to 85vw
          
        const endX = isLeft
          ? Math.floor(Math.random() * 45) + 20  // 20vw to 65vw
          : Math.floor(Math.random() * 45) + 35; // 35vw to 80vw
          
        const duration = Math.random() * 2.0 + 2.5; // 2.5s to 4.5s
        const delay = Math.random() * 0.4;
        const rotation = Math.floor(Math.random() * 720) + 360;

        return {
          id: i,
          isLeft,
          color,
          shape,
          size,
          midX: `${midX}vw`,
          endX: `${endX}vw`,
          peakY: `${peakY}vh`,
          duration,
          delay,
          rotation: isLeft ? rotation : -rotation
        };
      });

      setParticles(generated);
    } else {
      setParticles([]);
    }
  }, [activeConfetti]);

  if (!activeConfetti?.active) return null;

  // Select milestone details
  const getMilestoneDetails = () => {
    switch (activeConfetti.reason) {
      case "notebook":
        return {
          title: "Scripture Notebook Established",
          badge: "Note Scribe",
          icon: <BookOpen className="w-8 h-8 text-[#C9973A]" />,
          ref: "Psalm 119:11",
          verse: "Thy word have I hid in mine heart, that I might not sin against thee."
        };
      case "track":
        return {
          title: "Study Track Completed",
          badge: "Path Finder",
          icon: <Compass className="w-8 h-8 text-[#C9973A]" />,
          ref: "2 Timothy 2:15",
          verse: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth."
        };
      case "search":
        return {
          title: "Bible Search Conducted",
          badge: "Word Berean",
          icon: <Search className="w-8 h-8 text-[#C9973A]" />,
          ref: "Isaiah 28:10",
          verse: "For precept must be upon precept, precept upon precept; line upon line, line upon line; here a little, and there a little..."
        };
      case "recall":
        return {
          title: "Active Recall Mastered",
          badge: "Verbatim Memorizer",
          icon: <Brain className="w-8 h-8 text-[#C9973A]" />,
          ref: "Psalm 119:105",
          verse: "Thy word is a lamp unto my feet, and a light unto my path."
        };
      case "teach":
        return {
          title: "Teach It Session Completed",
          badge: "Discipleship Trainer",
          icon: <Award className="w-8 h-8 text-[#C9973A]" />,
          ref: "2 Timothy 2:2",
          verse: "And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also."
        };
      default:
        return {
          title: "Scripture Mastery Milestone Achieved",
          badge: "Faithful Student",
          icon: <Sparkles className="w-8 h-8 text-[#C9973A]" />,
          ref: "Revelation 14:12",
          verse: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus."
        };
    }
  };

  const details = getMilestoneDetails();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center select-none" id="milestone-celebration-container">
      {/* 1. CONFETTI PARTICLES EXPLOSION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => {
          const startX = p.isLeft ? "-5vw" : "105vw";
          return (
            <motion.div
              key={p.id}
              initial={{ 
                x: startX, 
                y: "105vh", 
                rotate: 0, 
                scale: 0.3,
                opacity: 0
              }}
              animate={{ 
                x: [startX, p.midX, p.endX],
                y: ["105vh", p.peakY, "110vh"],
                rotate: [0, p.rotation / 2, p.rotation],
                scale: [0.3, 1.2, 0.6],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut"
              }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                zIndex: 40,
                clipPath: p.shape === "triangle" 
                  ? "polygon(50% 0%, 0% 100%, 100% 100%)" 
                  : p.shape === "star"
                    ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                    : undefined,
                borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "2px" : undefined
              }}
            />
          );
        })}
      </div>

      {/* 2. MILESTONE CELEBRATION MODAL OVERLAY */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs pointer-events-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-[460px] rounded-[26px] overflow-hidden relative bg-gradient-to-b from-[#081733] via-[#040D1E] to-[#020814] border-2 border-[#E5B34B]/80 shadow-[0_0_55px_rgba(229,179,75,0.28),0_24px_60px_rgba(0,0,0,0.85)] text-white"
          id="milestone-modal-card"
        >
          {/* Ambient radial gold/navy top halo */}
          <div className="absolute top-0 inset-x-0 h-52 bg-[radial-gradient(ellipse_at_top,rgba(242,198,94,0.24),transparent_70%)] pointer-events-none" />

          {/* Top-right circular close button */}
          <button
            type="button"
            onClick={closeConfetti}
            aria-label="Close milestone celebration"
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-[#091834]/90 border border-[#E5B34B]/50 hover:border-[#F4CA64] text-stone-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Hero Portrait with Golden Halo & Laurel Wreaths + Ribbon Badge */}
          <div className="pt-6 pb-3 px-6 flex flex-col items-center text-center relative z-10">
            <div className="relative flex items-center justify-center">
              {/* Left Golden Laurel */}
              <svg className="w-12 h-20 text-[#E5B34B] -mr-2 drop-shadow-[0_0_8px_rgba(229,179,75,0.55)]" viewBox="0 0 48 80" fill="currentColor" aria-hidden="true">
                <path d="M36 70c-12-8-20-21-20-36 0-10 4-19 10-26-2 9-1 18 3 26-5-2-9-6-11-11 0 11 5 21 13 28-6-1-11-4-14-8 2 10 9 18 19 23z" />
              </svg>

              {/* Glowing Portrait Frame */}
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-b from-[#FCE396] via-[#E5B34B] to-[#9E6E1B] shadow-[0_0_28px_rgba(242,198,94,0.55)] relative z-10">
                <img
                  src={elderStephenAvatar}
                  alt="Elder Stephen"
                  className="w-full h-full rounded-full object-cover object-top bg-[#081733]"
                />
              </div>

              {/* Right Golden Laurel */}
              <svg className="w-12 h-20 text-[#E5B34B] -ml-2 drop-shadow-[0_0_8px_rgba(229,179,75,0.55)] scale-x-[-1]" viewBox="0 0 48 80" fill="currentColor" aria-hidden="true">
                <path d="M36 70c-12-8-20-21-20-36 0-10 4-19 10-26-2 9-1 18 3 26-5-2-9-6-11-11 0 11 5 21 13 28-6-1-11-4-14-8 2 10 9 18 19 23z" />
              </svg>
            </div>

            {/* Metallic Gold Ribbon Pill */}
            <div className="-mt-3 relative z-20 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-[#C8922A] via-[#F4CA64] to-[#C8922A] text-[#081226] shadow-[0_4px_14px_rgba(229,179,75,0.45)] border border-[#FCE396]/70">
              <Award className="w-3.5 h-3.5 text-[#081226] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-mono font-extrabold uppercase tracking-widest">
                MILESTONE: {details.badge}
              </span>
            </div>

            {/* Serif Headline (last word italicized) */}
            {(() => {
              const words = details.title.trim().split(/\s+/);
              const lastWord = words.pop() || "";
              const leadWords = words.join(" ");
              return (
                <h2 className="font-serif text-2xl sm:text-[26px] font-bold tracking-tight text-white mt-3.5 leading-snug">
                  {leadWords}{leadWords ? " " : ""}
                  <span className="italic font-semibold text-[#FDF7E7]">{lastWord}</span>
                </h2>
              );
            })()}

            {/* Gold Hairline with Centered Diamond */}
            <div className="w-full flex items-center gap-2 mt-3 px-4">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#E5B34B]/70 to-[#E5B34B]" />
              <span className="w-2 h-2 rotate-45 bg-[#F4CA64] shadow-[0_0_8px_rgba(244,202,100,0.9)]" />
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#E5B34B]/70 to-[#E5B34B]" />
            </div>
          </div>

          {/* Pastoral Message Card + Scripture Quote */}
          <div className="px-5 pb-5 space-y-4 relative z-10 text-left">
            <div className="p-4 rounded-2xl bg-[#0B162C]/90 border border-[#D4A346]/45 shadow-inner flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-b from-[#F4CA64] to-[#9E6E1B] shrink-0 shadow-[0_0_12px_rgba(229,179,75,0.3)]">
                <img
                  src={elderStephenAvatar}
                  alt="Elder Stephen"
                  className="w-full h-full rounded-full object-cover object-top"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-extrabold tracking-wider text-[#F4CA64] block">
                  Elder Stephen Says:
                </span>
                <p className="text-xs sm:text-[13px] leading-relaxed text-stone-100 font-sans">
                  “{activeConfetti.message}”
                </p>
              </div>
            </div>

            {/* Open Book Ornament Divider */}
            <div className="flex items-center gap-3 px-4">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#E5B34B]/60" />
              <BookOpen className="w-5 h-5 text-[#F4CA64] shrink-0" />
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#E5B34B]/60" />
            </div>

            {/* Scripture Quote */}
            <div className="px-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#F4CA64]" />
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#F4CA64]">
                  {details.ref}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] italic font-serif leading-relaxed text-stone-200 pl-1">
                “{details.verse}”
              </p>
            </div>

            {/* Full-Width Metallic Gold Action Button */}
            <button
              onClick={closeConfetti}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-b from-[#FCE396] via-[#E5B34B] to-[#C48E24] hover:brightness-110 active:scale-[0.99] text-[#081226] font-sans font-extrabold text-xs sm:text-sm uppercase tracking-widest transition-all shadow-[0_6px_22px_rgba(229,179,75,0.35)] flex items-center justify-center gap-2.5 cursor-pointer border border-[#FCE396]/60"
              id="milestone-dismiss-button"
            >
              <span className="w-5 h-5 rounded-full bg-[#081226] text-[#F4CA64] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>Amen, Praise God!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
