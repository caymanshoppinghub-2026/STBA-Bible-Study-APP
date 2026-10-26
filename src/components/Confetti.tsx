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
  ShieldCheck
} from "lucide-react";

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-lg rounded-[24px] overflow-hidden relative shadow-2xl ${tokens.surface.class} ${tokens.shadow.class}`}
          id="milestone-modal-card"
        >
          {/* Subtle gold flare background */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#C9973A]/15 to-transparent pointer-events-none" />

          {/* Modal Header Icon & Badge */}
          <div className="pt-8 pb-4 flex flex-col items-center text-center relative z-10">
            <div className="p-4 bg-[#C9973A]/10 rounded-full border border-[#C9973A]/20 shadow-inner mb-3">
              {details.icon}
            </div>
            
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C9973A]/20 text-[#C9973A] border border-[#C9973A]/30">
              🎖️ MILESTONE: {details.badge}
            </span>

            <h2 className={`font-serif text-2xl font-black tracking-tight mt-3 max-w-[85%] ${tokens.text.class}`}>
              {details.title}
            </h2>
          </div>

          {/* Modal Content / Pastoral Message from Elder Stephen */}
          <div className="px-6 pb-6 pt-2 space-y-5 relative z-10 text-left">
            {/* Pastoral Letter Box */}
            <div className={`p-4 rounded-2xl border flex gap-4 ${tokens.surfaceAlt.class}`}>
              {/* Elder Stephen Avatar Container */}
              <div className="w-12 h-12 rounded-full shrink-0 bg-[#C9973A]/15 border border-[#C9973A]/30 flex items-center justify-center relative overflow-hidden">
                <span className="text-xl">👴</span>
                <div className="absolute bottom-0 inset-x-0 h-2.5 bg-[#C9973A] flex items-center justify-center text-[6px] text-white font-bold uppercase tracking-tighter">
                  Elder S
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-black text-[#C9973A]">
                  Elder Stephen says:
                </span>
                <p className={`text-xs leading-relaxed elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased ${tokens.textSecondary.class}`}>
                  "{activeConfetti.message}"
                </p>
              </div>
            </div>

            {/* Scripture Quote Box */}
            <div className="border-l-4 border-[#C9973A] pl-4 py-1.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Quote className="w-3 h-3 text-[#C9973A]" />
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${tokens.textSecondary.class}`}>
                  {details.ref}
                </span>
              </div>
              <p className={`text-xs italic font-serif leading-relaxed ${tokens.text.class}`}>
                "{details.verse}"
              </p>
            </div>
          </div>

          {/* Modal Footer Button */}
          <div className={`p-5 border-t flex justify-end gap-3 ${tokens.surfaceAlt.class}`}>
            <button
              onClick={closeConfetti}
              className="w-full sm:w-auto px-6 py-3 bg-[#C9973A] hover:bg-[#B5852F] text-neutral-950 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-[#C9973A]/20"
              id="milestone-dismiss-button"
            >
              <ShieldCheck className="w-4 h-4 text-neutral-950" />
              <span>Amen, Praise God!</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
