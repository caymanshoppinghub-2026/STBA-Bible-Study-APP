/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Flame,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  BookMarked,
  Layers,
  HeartHandshake,
  Milestone,
  ArrowRight,
  Bookmark,
  Check,
  Calendar,
  Clock,
  Activity,
  Workflow,
  Sparkle,
  Cpu,
  Database,
  Shield,
  Zap,
  Layers3,
  BadgeAlert,
  Dna,
  Users,
  MousePointerClick
} from "lucide-react";

import { STBA_LOGO_URL } from "../assets/branding";
import { Footer } from "./Footer";

// Cloudinary Hero Background Video
const HERO_BG_VIDEO = "https://res.cloudinary.com/dx3jgal9b/video/upload/v1787034364/Bible_Study_on_Laptop_4_n6qkuq.mp4";

// A beautiful logo mark representing the brand
const LogoMark: React.FC = () => (
  <img
    src={STBA_LOGO_URL}
    alt="Study To Be Approved Seal"
    className="w-10 h-10 object-contain shrink-0 rounded-full border border-[#C9973A]/40 shadow-md"
    id="brand-logo-mark"
    referrerPolicy="no-referrer"
  />
);

// Particle fields that float gracefully upwards in the background (Sacred/Study theme)
const BGParticles: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; left: string; size: string; delay: number; duration: number }[]>([]);
  useEffect(() => {
    const list = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 2}px`,
      delay: Math.random() * 4,
      duration: Math.random() * 8 + 8
    }));
    setParticles(list);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-[-10px] rounded-full bg-[#C9973A]/20"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: ["0vh", "-105vh"],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Precise and helpful count-up digits component for stats slide
const LiveCountUp: React.FC<{ target: number; suffix?: string; active?: boolean }> = ({ target, suffix = "", active }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrent(0);
      return;
    }
    let start = 0;
    const duration = 1500; // 1.5s total time
    const increment = Math.ceil(target / (duration / 16)); // ~60fps step
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, active]);

  return <span>{current}{suffix}</span>;
};

// Smooth typewriter effect for cycling key discipleship verbs: study -> understand -> retain
const HeadlineTypewriter: React.FC = () => {
  const words = ["study", "understand", "retain"];
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Synchronize initial start with hero entrance animation
    if (!hasStartedRef.current) {
      timeout = setTimeout(() => {
        hasStartedRef.current = true;
        setCurrentText(words[0].slice(0, 1));
      }, 800);
      return () => clearTimeout(timeout);
    }

    const currentWord = words[wordIndex];

    if (!isDeleting && currentText === currentWord) {
      // Completed current word: linger on "retain" longer as the platform core anchor
      const holdTime = currentWord === "retain" ? 4200 : 2200;
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, holdTime);
    } else if (isDeleting && currentText === "") {
      // Pause briefly after deletion before starting next word
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 240);
    } else if (isDeleting) {
      // Deleting letters swiftly
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, 45);
    } else {
      // Typing letters smoothly with natural cadence
      timeout = setTimeout(() => {
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      }, 85);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, wordIndex]);

  return (
    <span className="inline-flex items-baseline relative">
      <span className="text-white">
        {currentText}
      </span>
      <span
        aria-hidden="true"
        className="inline-block w-[2.5px] sm:w-[3.5px] md:w-[4.5px] h-[0.72em] ml-0.5 sm:ml-1 bg-white align-baseline rounded-sm animate-pulse"
      />
    </span>
  );
};

interface LandingPageProps {
  onStartOnboarding?: (isSignIn?: boolean, targetTier?: "beginner" | "scholar" | "leader") => void;
  isSabbathMode?: boolean;
  setIsSabbathMode?: (val: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  isSabbathMode = false,
  setIsSabbathMode
}) => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

  // States for Walkthrough interaction framework
  const [narrativeStep, setNarrativeStep] = useState<number>(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-play hero background video silently and safely on mount
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {
        // Fallback gracefully if browser restricts autoplay
      });
    }
  }, []);

  // Keep track of scroll for shadow presentation
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up intersection observer for menu highlights
  useEffect(() => {
    const sections = ["home", "method", "pricing", "tech", "features", "get-started"];
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -40% 0px", // focused mid-viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Navigation Items defined in the correct specified layout order
  const navItems = [
    { label: "Home", id: "home" },
    { label: "Learn More", id: "method" },
    { label: "Walkthrough", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "Technology", id: "tech" },
    { label: "Get Started", id: "get-started" }
  ];

  // Auto alternation step countdown with manual reset support
  useEffect(() => {
    const interval = setInterval(() => {
      setNarrativeStep((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = (isSignIn = false, targetTier?: "beginner" | "scholar" | "leader") => {
    if (onStartOnboarding) {
      onStartOnboarding(isSignIn, targetTier);
    }
  };

  return (
    <div className="min-h-screen bg-[#041336] text-stone-100 font-sans antialiased selection:bg-[#C9973A] selection:text-[#041336]">

      {/* BACKGROUND ATMOSPHERIC COSMIC GLOWS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#C9973A]/10 to-transparent rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute top-[800px] right-20 w-[700px] h-[700px] bg-gradient-to-bl from-[#2A9D8F]/5 to-transparent rounded-full filter blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-5 w-[600px] h-[600px] bg-gradient-to-tr from-[#C9973A]/5 to-transparent rounded-full filter blur-[140px] pointer-events-none" />

      {/* NAVBAR */}
      <nav 
        className="sticky top-0 z-[9999] border-b transition-all duration-300"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          background: hasScrolled ? "rgba(4, 19, 54, 0.65)" : "rgba(4, 19, 54, 0.3)",
          borderColor: hasScrolled ? "rgba(223, 197, 123, 0.15)" : "transparent",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: hasScrolled ? "0 4px 20px rgba(0,0,0,0.35)" : "none"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Brand Identity Seal */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <LogoMark />
            <div className="flex flex-col leading-tight">
              <span 
                className="font-serif font-extrabold text-lg sm:text-xl text-[#DFC57B] tracking-[0.05em] transition-colors"
                style={{ textShadow: "0 0 8px rgba(223,197,123,0.55)" }}
              >
                Study To Be Approved™
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-[#C9973A] font-bold">
                Cognitive Recall Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Assets with Scroll-Linked Highlight Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-[#08132E]/70 px-2.5 py-1.5 rounded-lg">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="relative px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-mono transition-colors duration-200 text-stone-300 hover:text-[#DFC57B] select-none rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    // Walkthrough targets "Active Recall vs Passive Illusion" (#method) which flows into Storyboard Explorer (#features)
                    const targetId = item.label === "Walkthrough" ? "method" : item.id;
                    const target = document.getElementById(targetId);
                    if (target) {
                      const offset = 90;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = target.getBoundingClientRect().top;
                      const elementPosition = elementRect - bodyRect;
                      const offsetPosition = elementPosition - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                      });
                    }
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-[#DFC57B]/10 border border-[#DFC57B]/30 rounded-lg"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* User Sign & Registration Pathways */}
          <div className="hidden sm:flex items-center space-x-4">
            <button
              onClick={() => handleStart(false, "beginner")}
              className="bg-transparent text-stone-100 hover:text-[#DFC57B] text-xs font-mono uppercase font-extrabold tracking-widest px-5 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_12px_rgba(223,197,123,0.6)] cursor-pointer border border-transparent hover:border-[#DFC57B]/60"
              style={{
                transition: "all 0.3s ease"
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => handleStart(true)}
              className="bg-[#C9973A] text-[#041336] text-xs font-mono font-extrabold tracking-widest uppercase px-3.5 py-3 rounded-lg shadow-lg hover:shadow-[#C9973A]/20 hover:bg-[#DFC57B] transition-all cursor-pointer border border-[#C9973A]/20"
            >
              Sign In &rarr;
            </button>
          </div>

          {/* Interactive Mobile Menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-stone-300 p-2 hover:text-[#C9973A] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-stone-800/80 bg-[#041336] overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4 flex flex-col font-mono text-xs uppercase tracking-wider">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        // Walkthrough targets "Active Recall vs Passive Illusion" (#method) which flows into Storyboard Explorer (#features)
                        const targetId = item.label === "Walkthrough" ? "method" : item.id;
                        const target = document.getElementById(targetId);
                        if (target) {
                          const offset = 90;
                          const bodyRect = document.body.getBoundingClientRect().top;
                          const elementRect = target.getBoundingClientRect().top;
                          const elementPosition = elementRect - bodyRect;
                          const offsetPosition = elementPosition - offset;
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                          });
                        }
                      }}
                      className={`py-1 transition-colors relative flex items-center ${
                        isActive ? "text-[#DFC57B] font-bold" : "text-stone-300 hover:text-[#DFC57B]"
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DFC57B] mr-2" />
                      )}
                      {item.label}
                    </a>
                  );
                })}
                <div className="pt-4 border-t border-stone-800/60 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleStart(false, "beginner");
                    }}
                    className="w-full text-center border border-[#DFC57B] py-3 rounded-lg text-stone-200 text-xs font-mono font-extrabold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_12px_rgba(223,197,123,0.6)]"
                    style={{ transition: "all 0.3s ease" }}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleStart(true);
                    }}
                    className="w-full text-center bg-[#C9973A] text-[#041336] text-xs font-mono font-extrabold tracking-widest uppercase py-3 rounded-lg"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SECTION 1 — HERO SECTION */}
      <header id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden z-10 bg-[#041336]">
        
        {/* FULL-BLEED HERO BACKGROUND VIDEO */}
        <div className="absolute inset-0 w-full h-full object-cover z-0 overflow-hidden pointer-events-none select-none">
          <video
            ref={heroVideoRef}
            src={HERO_BG_VIDEO}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
              isVideoLoaded ? "opacity-100 scale-100" : "opacity-0 scale-100"
            }`}
          />
        </div>

        {/* Celestial drifting particles */}
        <BGParticles />

        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#041336]/80 backdrop-blur-md border border-[#C9973A]/40 rounded-full mb-6 z-10 shadow-lg"
        >
          <Sparkle className="w-3.5 h-3.5 text-[#C9973A] animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#DFC57B] font-bold">
            AI Cognitive Scripture Mastery System
          </span>
        </motion.div>

        {/* Headline: FRAME 1 & FRAME 2 Sequential Animation */}
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto z-10">
          <motion.h1
            initial="hidden"
            animate="visible"
            className="text-[1.28rem] min-[390px]:text-[1.42rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.24] md:leading-[1.28] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          >
            {/* Slide up from 0% opacity for Frame 1 */}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="block drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
            >
              You read it,
            </motion.span>
            
            {/* Slide up 0.5s later for Frame 2 + Deep glowing gold solid text with smooth typewriter animation */}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="block mt-3 sm:mt-4 md:mt-6 text-[#DFC57B] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
            >
              <span className="inline-block whitespace-nowrap">
                <span>but do you </span>
                <HeadlineTypewriter />
                <span> it?</span>
              </span>
            </motion.span>
          </motion.h1>
        </div>

        {/* Soft upward moving description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
          className="mt-8 text-sm sm:text-base md:text-lg text-stone-100 max-w-2xl font-normal leading-relaxed z-10 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
        >
          Move beyond simply reading Scripture; start retaining it for life by hiding it deep within your heart. STBA is a thoughtfully designed, scientifically informed, powerful AI Bible study system that helps believers internalize God’s Word with clarity, confidence, and lasting recall.
        </motion.p>

        {/* Dual Actions CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4 z-10"
        >
          {/* Primary CTA button with persistent pulse, soft lift & shine effect */}
          <motion.button
            onClick={() => handleStart(false, "beginner")}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(201,151,58,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-5 bg-gradient-to-r from-[#C9973A] to-[#DFC57B] text-[#090B0F] text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl cursor-pointer relative overflow-hidden group border border-[#C9973A]/50 transition-all duration-300 shadow-xl"
          >
            <span className="relative z-10">Start Retaining Now</span>
            
            {/* Highlight sweep moving across the button on hover */}
            <span className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 group-hover:left-[150%] transition-all duration-1000 pointer-events-none" />
          </motion.button>

          {/* Secondary CTA button */}
          <motion.a
            href="#method"
            whileHover={{ scale: 1.02, border: "1px solid rgba(201,151,58,0.6)", textShadow: "0 0 8px rgba(223,197,123,0.3)" }}
            className="px-8 py-5 bg-[#090B0F]/90 backdrop-blur-md border border-stone-700 text-stone-100 text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center space-x-2 shadow-xl"
          >
            <span>Explore the Method</span>
            <ChevronRight className="w-4 h-4 text-[#C9973A]" />
          </motion.a>
        </motion.div>

        {/* Gentle Bobbing Cue indicating "Scroll to discover" */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 flex flex-col items-center space-y-1 text-[10px] font-mono uppercase tracking-[0.15em] text-[#DFC57B] font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] z-10"
          style={{ paddingTop: "0px", paddingBottom: "0px", marginTop: "0px", marginBottom: "0px" }}
        >
          <span>Scroll to discover</span>
          <ChevronDown className="w-4 h-4 text-[#C9973A]" />
        </motion.div>
      </header>

      {/* SECTION 2 — METHODOLOGY BLOCK: ACTIVE RECALL vs PASSIVE ILLUSION */}
      <section id="method" className="bg-[#08132E] relative border-t border-stone-900 overflow-hidden scroll-mt-24" style={{ paddingTop: "80px", paddingBottom: "105px" }}>
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#2A9D8F]/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-3 mb-16 text-center"
          >
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#C9973A] font-bold">Linguistic Science</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-stone-100 tracking-tight leading-tight">
              Active Recall <span className="font-sans font-light text-stone-400">vs</span> Passive Illusion
            </h2>
          </motion.div>

          {/* TWO COLUMN CARDS: Passive vs Active */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-20">
            
            {/* Left Card: Passive Illusion — Slightly desaturated, blurred hazy overlay */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
              className="bg-stone-900/35 border border-stone-800/80 p-8 rounded-2xl relative overflow-hidden group select-none flex flex-col justify-between"
            >
              {/* Subtle hazy blur overlay */}
              <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-[1px] pointer-events-none" />
              
              <div className="space-y-4 relative z-10 opacity-70 group-hover:opacity-85 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-xl bg-red-950/25 border border-red-950/50 flex items-center justify-center text-red-500/80">
                  <BadgeAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-red-400 tracking-tight">The Passive Recognition Loop</h3>
                <p className="text-sm font-light text-stone-400 leading-relaxed">
                  Re-reading sentences, highlighting paragraphs, or reviewing summaries breeds false confidence. 
                  Since the words look familiar, your mind triggers a visual recognition signal and tricks itself into assuming deep database retention. In reality, retrieval latency remains slow and drops sharply over time.
                </p>
              </div>

              <div className="border-t border-stone-850 pt-5 mt-6 relative z-10 flex items-center justify-between text-[11px] font-mono text-stone-500">
                <span>RETENTION METHODOLOGY</span>
                <span className="text-red-400/80 font-bold uppercase">0% Real Brain Consolidations</span>
              </div>
            </motion.div>

            {/* Right Card: Active Recall — Sharp gold outline with high-contrast highlight sweep overlay */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-[#11141C] border-2 border-[#C9973A] p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-[#C9973A]/5 group"
            >
              {/* Golden highlight sweep element */}
              <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-[#C9973A]/5 to-transparent skew-x-12 group-hover:left-[150%] transition-all duration-1000 pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-[#C9973A]/10 border border-[#C9973A]/30 flex items-center justify-center text-[#DFC57B]">
                  <Dna className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#DFC57B] tracking-tight">STBA Calibrated Active Recall</h3>
                <p className="text-sm font-light text-stone-300 leading-relaxed">
                  Active verification reinforces learning through precise text-calibration checks, recall matching down to the syllable, and scheduled retrieval prompts timed before memory begins to fade. Each recall attempt signals that the gap matters, strengthening the neural pathway and supporting deeper retention.
                </p>
              </div>

              <div className="border-t border-stone-800 pt-5 mt-6 relative z-10 flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>BIOLOGICAL OUTCOME</span>
                <span className="text-[#2A9D8F] font-bold uppercase tracking-wider">9x Faster Sync Strength</span>
              </div>
            </motion.div>

          </div>

          {/* FORGETTING CURVE SVG MICRO-ANIMATION */}
          <div className="bg-stone-900/30 border border-stone-800/80 rounded-2xl p-6 sm:p-10 mb-20 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-900/10 to-transparent pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              <div className="space-y-3 md:col-span-1 border-r border-stone-850/80 pr-4">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#C9973A] font-bold">Metric Monitor</span>
                <h4 className="font-serif text-lg font-bold text-stone-200">The Forgetting Curve</h4>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  This graph shows how active spaced retrieval reinforces recall at the point memory is most vulnerable to decline, helping strengthen long-term retention.
                </p>
              </div>

              {/* Dynamic SVG chart which draws itself on scroll */}
              <div className="md:col-span-3 h-52 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                  {/* Grid Lines */}
                  {[0, 40, 80, 120].map((y, i) => (
                    <line key={i} x1="20" y1={y + 10} x2="480" y2={y + 10} stroke="#1A202C" strokeWidth="1" strokeDasharray="3 3" />
                  ))}

                  {/* PASSIVE DECAY curve path (draws sharply downwards) */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    d="M 20,20 C 80,100 120,135 480,140"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.5"
                    strokeDasharray="4 4"
                  />
                  
                  {/* ACTIVE RECALL Spikes & Reinforcements peaks */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.5, delay: 0.3, ease: "easeOut" }}
                    d="M 20,20 L 90,80 L 90,20 C 110,40 130,55 160,65 L 160,20 C 200,35 240,40 300,50 L 300,20 C 340,25 400,28 480,22"
                    fill="none"
                    stroke="#2A9D8F"
                    strokeWidth="4"
                  />

                  {/* Interactive Cues and Labels */}
                  <rect x="25" y="15" width="8" height="8" rx="4" fill="#2A9D8F" />
                  <text x="38" y="23" fill="#2A9D8F" className="text-[8px] font-mono font-bold uppercase">Start</text>

                  <rect x="86" y="16" width="8" height="8" rx="4" fill="#C9973A" />
                  <text x="96" y="15" fill="#DFC57B" className="text-[8px] font-mono font-bold uppercase">1st Recall</text>

                  <rect x="156" y="16" width="8" height="8" rx="4" fill="#C9973A" />
                  <text x="166" y="15" fill="#DFC57B" className="text-[8px] font-mono font-bold uppercase">2nd Recall</text>

                  <rect x="296" y="16" width="8" height="8" rx="4" fill="#C9973A" />
                  <text x="306" y="15" fill="#DFC57B" className="text-[8px] font-mono font-bold uppercase">Vault Solidified</text>

                  {/* Metric Legend */}
                  <g transform="translate(315, 110)">
                    <rect width="165" height="40" rx="6" fill="#090B0F" stroke="#1F2937" />
                    <line x1="10" y1="13" x2="30" y2="13" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 3" />
                    <text x="36" y="16" fill="#9CA3AF" className="text-[8px] font-mono font-bold uppercase">Passive Forgetting Curve</text>
                    
                    <line x1="10" y1="27" x2="30" y2="27" stroke="#2A9D8F" strokeWidth="3" />
                    <text x="36" y="30" fill="#2A9D8F" className="text-[8px] font-mono font-bold">STBA Spaced recall</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* HORIZONTAL STEPPER TIMELINE BLOCK */}
          <div className="pt-8 border-t border-stone-850">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-center">
                 {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4 relative"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9973A]/10 border border-[#C9973A]/40 flex items-center justify-center text-[#DFC57B] font-mono text-sm font-extrabold shadow-lg shadow-[#C9973A]/5 ring-4 ring-[#C9973A]/5">
                    01
                  </div>
                  <h5 className="font-serif font-bold text-stone-200">STBA Structured Recall</h5>
                </div>
                <p className="text-xs font-light text-stone-400 leading-relaxed">
                  From your very first session, STBA helps lock Scripture into memory with clarity and lasting retention.
                </p>
                <div className="h-0.5 bg-gradient-to-r from-[#C9973A] to-transparent w-full opacity-60 hidden md:block absolute -right-1/2 top-5 z-0" />
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 relative"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A9D8F]/10 border border-[#2A9D8F]/40 flex items-center justify-center text-[#2A9D8F] font-mono text-sm font-extrabold shadow-lg ring-4 ring-[#2A9D8F]/5">
                    02
                  </div>
                  <h5 className="font-serif font-bold text-stone-200">Spaced Intervals Pulse</h5>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute right-4 top-1" />
                </div>
                <p className="text-xs font-light text-stone-400 leading-relaxed">
                  Our interval engine uses proven memory-decay patterns to reinforce recall before retention fades.
                </p>
                <div className="h-0.5 bg-gradient-to-r from-[#2A9D8F] to-transparent w-full opacity-60 hidden md:block absolute -right-1/2 top-5 z-0" />
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-stone-900/40 p-5 rounded-xl border border-[#C9973A]/20 hover:border-[#C9973A]/50 transition-all duration-300 relative space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-stone-950 border border-[#C9973A]/40 flex items-center justify-center text-[#DFC57B] font-mono text-sm font-extrabold">
                    03
                  </div>
                  <h5 className="font-serif font-bold text-stone-100">Sabbath School Study</h5>
                </div>
                <p className="text-xs font-light text-stone-400 leading-relaxed">
                  Sabbath School Mode helps learners retain Scripture, deepen understanding, and participate and interact with confidence.
                </p>
                {/* Micro seal logo watermark */}
                <div className="absolute right-3 bottom-3 opacity-25">
                  <Award className="w-8 h-8 text-[#DFC57B]" />
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3 — NARRATIVE FEATURE WALKTHROUGH (IMMERSIVE EXPERIENCE) */}
      <section id="features" className="py-28 bg-[#041336] relative border-t border-b border-stone-800/50 scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,151,58,0.03),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-20">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C9973A] font-bold">Immersive Experience</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-stone-100">
              Interactive Storyboard Explorer
            </h2>
            <p className="text-sm font-light text-stone-400 max-w-xl mx-auto leading-relaxed">
              Step into the active cognitive framework. This is how Study To Be Approved™ cements scriptures inside long-term vault storage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Interactive Story Progress Walkthrough Buttons */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Step Button 1 */}
              <button
                onClick={() => setNarrativeStep(0)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                  narrativeStep === 0
                    ? "bg-[#11141C] border-[#C9973A]/60 shadow-xl"
                    : "bg-stone-900/20 border-stone-850 hover:bg-stone-900/40"
                }`}
              >
                {narrativeStep === 0 && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9973A]" />}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${narrativeStep === 0 ? "bg-[#C9973A]/20 text-[#DFC57B]" : "bg-stone-800/40 text-stone-500"}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-serif text-base font-bold ${narrativeStep === 0 ? "text-[#DFC57B]" : "text-stone-300"}`}>
                    1. Capture what you study
                  </h3>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    Read text clean of distractions. Highlights or tags are saved securely to configure custom schemas.
                  </p>
                </div>
              </button>

              {/* Step Button 2 */}
              <button
                onClick={() => setNarrativeStep(1)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                  narrativeStep === 1
                    ? "bg-[#11141C] border-[#C9973A]/60 shadow-xl"
                    : "bg-stone-900/20 border-stone-850 hover:bg-stone-900/40"
                }`}
              >
                {narrativeStep === 1 && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9973A]" />}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${narrativeStep === 1 ? "bg-[#C9973A]/20 text-[#DFC57B]" : "bg-stone-800/40 text-stone-500"}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-serif text-base font-bold ${narrativeStep === 1 ? "text-[#DFC57B]" : "text-stone-300"}`}>
                    2. Return at the right time
                  </h3>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    Spaced intervals nudge your memory dynamically immediately before storage drops off.
                  </p>
                </div>
              </button>

              {/* Step Button 3 */}
              <button
                onClick={() => setNarrativeStep(2)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                  narrativeStep === 2
                    ? "bg-[#11141C] border-[#C9973A]/60 shadow-xl"
                    : "bg-stone-900/20 border-stone-850 hover:bg-stone-900/40"
                }`}
              >
                {narrativeStep === 2 && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9973A]" />}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${narrativeStep === 2 ? "bg-[#C9973A]/20 text-[#DFC57B]" : "bg-stone-800/40 text-stone-500"}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-serif text-base font-bold ${narrativeStep === 2 ? "text-[#DFC57B]" : "text-stone-300"}`}>
                    3. Transform reading to retention
                  </h3>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    Active recall builds deep, unshakeable memory paths so you are always approved.
                  </p>
                </div>
              </button>

              {/* Step Button 4 */}
              <button
                onClick={() => setNarrativeStep(3)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                  narrativeStep === 3
                    ? "bg-[#11141C] border-[#C9973A]/60 shadow-xl"
                    : "bg-stone-900/20 border-stone-850 hover:bg-stone-900/40"
                }`}
              >
                {narrativeStep === 3 && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9973A]" />}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${narrativeStep === 3 ? "bg-[#C9973A]/20 text-[#DFC57B]" : "bg-stone-800/40 text-stone-500"}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-serif text-base font-bold ${narrativeStep === 3 ? "text-[#DFC57B]" : "text-stone-300"}`}>
                    4. Sabbath School Backed
                  </h3>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    Secure study streaks and track group progress collaboratively in full church alignment.
                  </p>
                </div>
              </button>

            </div>

            {/* Right Column: High Fidelity Device Mockup Simulator utilizing AnimatePresence */}
            <div className="lg:col-span-7">
              <div className="relative p-1 bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl shadow-[#C9973A]/5 min-h-[460px] flex flex-col justify-between">
                
                {/* Tablet Device Header bar */}
                <div className="px-6 py-4 border-b border-stone-900 bg-stone-900/30 flex justify-between items-center text-[10px] font-mono text-stone-500">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9973A] animate-pulse" />
                    <span>STBA COGNITIVE EMULATION STUDIO</span>
                  </div>
                  <span>ACTIVE VIEWPORT</span>
                </div>

                {/* Simulated Screens depending on active index */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center relative">
                  <AnimatePresence mode="wait">
                    {narrativeStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <span className="bg-[#C9973A]/10 border border-[#C9973A]/30 text-[#DFC57B] font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            STBA Mode: 1. Capture Study
                          </span>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-200">"Study to show thyself approved..."</h4>
                        </div>

                        {/* Interactive highlights visualizer */}
                        <div className="bg-stone-900/60 border border-stone-850 p-5 rounded-xl space-y-3 relative overflow-hidden">
                          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
                            "Study to show thyself approved unto God, a workman that needeth not to be ashamed, <span className="bg-[#C9973A]/25 border-b border-[#C9973A] text-stone-100 font-bold px-1 relative">rightly dividing the word of truth</span>."
                          </p>
                          <div className="flex justify-between items-center pt-2 text-[10px] font-mono text-stone-500">
                            <span>Scribal verse tag: 2 Timothy 2:15</span>
                            <span className="text-[#C9973A] font-bold">✓ Saved to active local deck</span>
                          </div>
                        </div>

                        {/* Background structural nodes display */}
                        <div className="flex justify-center space-x-2 text-stone-500 font-mono text-[9.5px]">
                          <span className="px-2.5 py-1 bg-stone-900 rounded-lg">Storage level: Introductory</span>
                          <span className="px-2.5 py-1 bg-stone-900 rounded-lg text-[#2A9D8F]">Syncing to Cloud ✓</span>
                        </div>
                      </motion.div>
                    )}

                    {narrativeStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <span className="bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 text-[#2A9D8F] font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            STBA Mode: 2. Scheduled Cycles
                          </span>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-200">The Decay Intervention Trigger</h4>
                        </div>

                        {/* Ring Visual Clock alert and rotation circle overlay */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <div className="flex justify-center py-2">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                              {/* Glowing circle representation */}
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="56" cy="56" r="48" stroke="#1A202C" strokeWidth="6" fill="transparent" />
                                <motion.circle 
                                  cx="56" 
                                  cy="56" 
                                  r="48" 
                                  stroke="#C9973A" 
                                  strokeWidth="6" 
                                  fill="transparent" 
                                  strokeDasharray="301"
                                  animate={{ strokeDashoffset: [301, 80, 301] }}
                                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                />
                              </svg>
                              <div className="absolute flex flex-col items-center">
                                <Clock className="w-5 h-5 text-[#DFC57B] animate-spin" style={{ animationDuration: '10s' }} />
                                <span className="text-[10px] font-mono text-stone-300 font-bold mt-1">2h Remaining</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-stone-900/60 p-4 rounded-xl space-y-2 text-left">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-stone-500 font-bold block">Retrieval Signal Alert</span>
                            <h5 className="text-xs font-serif font-extrabold text-[#DFC57B]">Prompt incoming</h5>
                            <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                              Decay is approaching critical levels. Complete immediate validation recitation to strengthen retention by 400%.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {narrativeStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <span className="bg-[#C9973A]/10 border border-[#C9973A]/30 text-[#DFC57B] font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            STBA Mode: 3. Retention Transformation
                          </span>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">Live Calibration Verification</h4>
                        </div>

                        {/* Interactive Text Recitation Simulator with feedback validation bar */}
                        <div className="space-y-3">
                          <div className="p-4 bg-stone-900 rounded-xl flex items-center justify-between border-l-2 border-emerald-500">
                            <div className="flex items-center space-x-3">
                              <Volume2 className="w-4 h-4 text-emerald-500" />
                              <div className="text-left leading-none">
                                <p className="text-xs text-stone-300 font-mono font-bold">Recitation Check: "Study to show thyself approved..."</p>
                                <p className="text-[10px] text-stone-500 font-mono mt-1">Linguistic proximity calibrating...</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800 text-emerald-400 font-mono text-[9px] font-bold rounded">
                              98% MATCH
                            </span>
                          </div>

                          <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800">
                            {/* Score fill indicator meter bar */}
                            <div className="flex justify-between text-[10px] font-mono text-[#DFC57B] mb-2 font-bold uppercase">
                              <span>Retention Score</span>
                              <span>98 / 100</span>
                            </div>
                            <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-[#C9973A] to-[#2A9D8F]" 
                                initial={{ width: "0%" }}
                                animate={{ width: "98%" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {narrativeStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <span className="bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            STBA Mode: 4. Groups & Sabbath
                          </span>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#DFC57B]">The Sabbath School Studio</h4>
                        </div>

                        {/* Interactive Stats cards with live Count Up animation */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-stone-900/40 p-4 border border-stone-800 rounded-xl text-left relative overflow-hidden">
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest font-extrabold block">Group recall rank</span>
                            <p className="text-2xl font-serif font-extrabold text-stone-100 mt-1">
                              #<LiveCountUp target={3} active={narrativeStep === 3} />
                            </p>
                            <p className="text-[10px] text-stone-400 mt-1 font-mono">Berean Youth League</p>
                          </div>

                          <div className="bg-stone-900/40 p-4 border border-stone-800 rounded-xl text-left relative overflow-hidden">
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest font-extrabold block">Conquered verses</span>
                            <p className="text-2xl font-serif font-extrabold text-[#DFC57B] mt-1">
                              <LiveCountUp target={142} suffix="+" active={narrativeStep === 3} />
                            </p>
                            <p className="text-[10px] text-stone-400 mt-1 font-mono">Myelinated Subconscious</p>
                          </div>
                        </div>

                        <div className="bg-stone-950/60 p-4 border border-[#C9973A]/20 rounded-xl flex items-center justify-between text-left">
                          <div className="flex items-center space-x-2.5">
                            <LogoMark />
                            <div>
                              <p className="text-xs font-serif font-bold text-stone-200">Sabbath School Study Backed Logo</p>
                              <p className="text-[10px] text-stone-500 font-mono">Certified master training curriculum</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-[#C9973A]/10 text-[#DFC57B] rounded-md font-bold uppercase tracking-wider">OFFICIAL</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulated Screen Navigation footer dot track bar */}
                <div className="px-6 py-4 border-t border-stone-900 bg-stone-900/20 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-stone-500">CYCLE INTERVALS ACTIVE</span>
                  <div className="flex space-x-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setNarrativeStep(i)}
                        className={`w-5 h-1.5 rounded-full transition-colors cursor-pointer ${
                          narrativeStep === i ? "bg-[#C9973A]" : "bg-stone-800 hover:bg-stone-700"
                        }`}
                        aria-label={`Show layout segment slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Micro-Interaction Scroll Navigation Helper Label */}
          <div className="mt-12 flex justify-center text-xs font-mono text-stone-500 space-x-2">
            <MousePointerClick className="w-4 h-4 text-[#C9973A] animate-pulse" />
            <span>Interactive sandbox active above • Click individual boxes to skip frames</span>
          </div>

        </div>
      </section>

      {/* SECTION 4 — SUBSCRIPTION PRICING AND TIERS */}
      <section id="pricing" className="py-28 bg-[#08132E] relative border-t border-b border-stone-900 scroll-mt-20">
        
        {/* Subtle background gradient shift to midnight cosmic color */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#C9973A]/5 to-[#2A9D8F]/5 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C9973A] font-bold">Investment in Schema</span>
            
            {/* Title with bottom-up delay and letter-spacing transition */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-stone-100"
            >
              Choose your path to mastery
            </motion.h2>
            <p className="text-sm font-light text-stone-400 max-w-sm mx-auto leading-relaxed">
              Every level offers complete intellectual devotion. Select your depth layer.
            </p>

            {/* Slide-in Yearly Toggle knob */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-6 flex justify-center items-center space-x-3"
            >
              <span className={`text-xs font-mono font-bold uppercase transition-colors ${billingPeriod === "monthly" ? "text-stone-200" : "text-stone-500"}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className="w-13 h-7 bg-stone-900 rounded-full border border-stone-800 p-1 relative flex items-center cursor-pointer"
                aria-label="Toggle Billing Frequency"
              >
                <motion.div
                  className="w-5 h-5 bg-[#C9973A] rounded-full shadow-md"
                  animate={{ x: billingPeriod === "monthly" ? 0 : 22 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              </button>
              <div className="flex items-center space-x-1.5">
                <span className={`text-xs font-mono font-bold uppercase transition-colors ${billingPeriod === "yearly" ? "text-[#C9973A]" : "text-stone-500"}`}>
                  Yearly Discount
                </span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* TIER 1 - Free Tier Beginner */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 150, damping: 18, mass: 0.7 }}
              whileHover={{ y: -8 }}
              className="bg-stone-900/35 border border-stone-850 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#DFC57B] hover:shadow-[0_0_25px_rgba(201,151,58,0.2)] transition-all duration-300"
            >
              {/* Ribbon added per user request */}
              <div className="absolute top-0 right-0 bg-[#C9973A] text-[#090B0F] px-4 py-1.5 font-mono text-[9px] font-extrabold tracking-widest uppercase rounded-bl-xl shadow-md z-10">
                Free Tier
              </div>

              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] tracking-widest uppercase text-stone-500 font-bold">Free Sandbox</span>
                  <h3 className="text-2xl font-serif font-extrabold text-[#C9973A] mt-1">Beginner</h3>
                </div>

                <div className="flex items-baseline space-x-1 border-b border-stone-850 pb-5">
                  <span className="text-5xl font-serif font-bold text-stone-100">$0</span>
                  <span className="text-stone-500 text-xs font-mono">/ Month-to-month</span>
                </div>

                <div className="space-y-4">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-300">Default Access:</span>
                  <ul className="space-y-3 pb-3 text-xs text-stone-400">
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                      <span>Standard active recall console limit</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                      <span>Introductory memory testing and feedback</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                      <span>Local browser storage persistence only</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleStart(false, "beginner")}
                className="w-full py-3.5 border border-stone-800/80 hover:border-stone-700 hover:bg-stone-800/35 text-stone-300 hover:text-stone-100 text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer"
              >
                Get Started Free
              </button>
            </motion.div>

            {/* TIER 2 - Scholar Tier (Highlighted with continuous gold edge halo animation) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 150, damping: 18, mass: 0.7, delay: 0.05 }}
              whileHover={{ y: -8 }}
              className="bg-[#11141C] border-2 border-[#C9973A] p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-2xl group hover:border-[#DFC57B] hover:shadow-[0_0_35px_rgba(201,151,58,0.35)] transition-all duration-300"
            >
              {/* Continuous subtle golden glowing halo backdrop animation */}
              <div className="absolute inset-x-0 -top-40 h-80 bg-[#C9973A]/10 filter blur-[60px] animate-pulse pointer-events-none" />

              <div className="absolute top-0 right-0 bg-[#C9973A] text-[#090B0F] px-4 py-1.5 font-mono text-[9px] font-extrabold tracking-widest uppercase rounded-bl-xl shadow-md">
                Most Popular
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <span className="font-mono text-[9px] tracking-widest uppercase text-[#DFC57B] font-bold">Standard Tier</span>
                  <h4 className="text-2xl font-serif font-extrabold text-[#DFC57B] mt-1">Scholar</h4>
                </div>

                <div className="flex items-baseline flex-wrap gap-x-2 border-b border-stone-800 pb-5">
                  {billingPeriod === "yearly" && (
                    <span className="text-3xl font-serif font-medium text-stone-500 line-through decoration-[#EF4444] decoration-2 mr-1">
                      $7.99
                    </span>
                  )}
                  <span className="text-5xl font-serif font-bold text-stone-100">
                    {billingPeriod === "monthly" ? "$7.99" : "$6.58"}
                  </span>
                  <span className="text-stone-400 text-xs font-mono">/ mo {billingPeriod === "yearly" && "($79/yr billed annually)"}</span>

                  {billingPeriod === "yearly" && (
                    <div className="flex flex-wrap gap-2 w-full mt-3">
                      <span className="bg-[#2A9D8F]/15 border border-[#2A9D8F]/35 text-[#2A9D8F] text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                        Save 17%
                      </span>
                      <span className="bg-[#2A9D8F]/15 border border-[#2A9D8F]/35 text-[#2A9D8F] text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                        $79/Year
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-200">Full Premium Unlocks:</span>
                  <ul className="space-y-3 pb-3 text-xs text-stone-300">
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span>Absolute full mastery recall mechanics</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span>Advanced analytics and streak logging</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span>Persistent cloud database synchronization</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span className="font-bold text-[#DFC57B]">First calendar month free trial</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleStart(false, "scholar")}
                className="w-full py-4 bg-[#C9973A] hover:bg-[#DFC57B] text-[#090B0F] text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-[#C9973A]/20"
              >
                Start Trial Account
              </button>
            </motion.div>

            {/* TIER 3 - Leader Tier */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 150, damping: 18, mass: 0.7, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-stone-900/35 border border-stone-850 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-[#DFC57B] hover:shadow-[0_0_25px_rgba(201,151,58,0.2)] transition-all duration-300"
            >
              {/* Ribbon added per user request */}
              <div className="absolute top-0 right-0 bg-[#C9973A] text-[#090B0F] px-4 py-1.5 font-mono text-[9px] font-extrabold tracking-widest uppercase rounded-bl-xl shadow-md z-10">
                Premium Access
              </div>

              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] tracking-widest uppercase text-stone-500 font-bold">Premium Tier</span>
                  <h3 className="text-2xl font-serif font-extrabold text-[#C9973A] mt-1">Leader</h3>
                </div>

                <div className="flex items-baseline flex-wrap gap-x-2 border-b border-stone-850 pb-5">
                  {billingPeriod === "yearly" && (
                    <span className="text-3xl font-serif font-medium text-stone-500 line-through decoration-[#EF4444] decoration-2 mr-1">
                      $14.99
                    </span>
                  )}
                  <span className="text-5xl font-serif font-bold text-stone-100">
                    {billingPeriod === "monthly" ? "$14.99" : "$11.58"}
                  </span>
                  <span className="text-stone-500 text-xs font-mono">/ mo {billingPeriod === "yearly" && "($139/yr billed annually)"}</span>

                  {billingPeriod === "yearly" && (
                    <div className="flex flex-wrap gap-2 w-full mt-3">
                      <span className="bg-[#2A9D8F]/15 border border-[#2A9D8F]/35 text-[#2A9D8F] text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                        Save ~15%
                      </span>
                      <span className="bg-[#2A9D8F]/15 border border-[#2A9D8F]/35 text-[#2A9D8F] text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                        $139/Year
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-300">Custom Group Tools:</span>
                  <ul className="space-y-3 pb-3 text-xs text-stone-400">
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                      <span>Full system access and progress tracking</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                      <span>Leaderboards & customization managers</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
                      <span>Sabbath school collaborative group study</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleStart(false, "leader")}
                className="w-full py-3.5 border border-stone-800 hover:border-[#C9973A]/40 text-[#DFC57B] text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all cursor-pointer hover:bg-[#C9973A]/5"
              >
                Initiate Leader Suite
              </button>
            </motion.div>

          </div>

        </div>
      </section>

      {/* SECTION 5 — TECHNICAL FOUNDATION (SUPABASE + FIREBASE PROOFS) */}
      <section id="tech" className="py-28 bg-[#041336] relative overflow-hidden">
        
        {/* Draw a gorgeous gold dividing line across screen when scrolled into view */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-px bg-gradient-to-r from-transparent via-[#C9973A]/30 to-transparent mx-auto"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-4 mb-20">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C9973A] font-bold">Bulletproof Ecosystem</span>
            
            {/* Header slides in from the left */}
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-stone-100"
            >
              Built on a stable, scalable core
            </motion.h2>
            <p className="text-sm font-light text-stone-400 max-w-xl mx-auto leading-relaxed">
              Permanent knowledge requires database integrity. Our server is fortified using enterprise cloud providers.
            </p>
          </div>

          {/* 4 Block Icon Rows with spring popup and soft tooltip display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            
            {/* 1. Supabase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-stone-900/35 border border-stone-850 p-6 rounded-2xl text-center group hover:bg-[#11141C] hover:border-[#2A9D8F]/30 transition-all cursor-pointer relative"
            >
              <div className="w-12 h-12 bg-[#2A9D8F]/10 text-[#2A9D8F] rounded-xl mx-auto flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-[#2A9D8F]/5">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-stone-200">Supabase SQL Block</h4>
              <p className="text-xs text-stone-400 mt-2 font-light leading-normal">
                Synchronized memory nodes and intervals logged securely using robust Postgres structures.
              </p>
              
              {/* Tooltip popping above on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#090B0F]/90 border border-[#2A9D8F]/30 px-3 py-1.5 rounded-lg text-[9px] font-mono text-[#2A9D8F] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                SQL Persistent Cluster
              </div>
            </motion.div>

            {/* 2. Firebase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="bg-stone-900/35 border border-stone-850 p-6 rounded-2xl text-center group hover:bg-[#11141C] hover:border-[#C9973A]/30 transition-all cursor-pointer relative"
            >
              <div className="w-12 h-12 bg-[#C9973A]/10 text-[#DFC57B] rounded-xl mx-auto flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-[#C9973A]/5">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-stone-200">Firebase Core</h4>
              <p className="text-xs text-stone-400 mt-2 font-light leading-normal">
                fortress-level OAuth authentication and instant state listeners handling multi-user synchronizations.
              </p>

              {/* Tooltip popping above on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#090B0F]/90 border border-[#C9973A]/30 px-3 py-1.5 rounded-lg text-[9px] font-mono text-[#DFC57B] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                Certified Realtime Identity
              </div>
            </motion.div>

            {/* 3. Performance Edge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="bg-stone-900/35 border border-stone-850 p-6 rounded-2xl text-center group hover:bg-[#11141C] hover:border-purple-500/30 transition-all cursor-pointer relative"
            >
              <div className="w-12 h-12 bg-purple-950/20 text-purple-400 rounded-xl mx-auto flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-purple-550/5">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-stone-200">Ultra-low Edge</h4>
              <p className="text-xs text-stone-400 mt-2 font-light leading-normal">
                Optimized offline caching systems serving interval feedback in under 12 milliseconds responses.
              </p>

              {/* Tooltip popping above on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#090B0F]/90 border border-purple-500/30 px-3 py-1.5 rounded-lg text-[9px] font-mono text-purple-400 uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                &lt;12ms Static Delivery
              </div>
            </motion.div>

            {/* 4. Integrity Cryptographic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
              className="bg-stone-900/35 border border-stone-850 p-6 rounded-2xl text-center group hover:bg-[#11141C] hover:border-[#2A9D8F]/30 transition-all cursor-pointer relative"
            >
              <div className="w-12 h-12 bg-teal-950/20 text-[#2A9D8F] rounded-xl mx-auto flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-stone-200">Sacred Security</h4>
              <p className="text-xs text-stone-400 mt-2 font-light leading-normal">
                TLS 1.3 Transport Encryption and Row-Level Security parameters protecting study journals.
              </p>

              {/* Tooltip popping above on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#090B0F]/90 border border-[#2A9D8F]/30 px-3 py-1.5 rounded-lg text-[9px] font-mono text-[#2A9D8F] uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                Confidential Hashing Enabled
              </div>
            </motion.div>

          </div>

          {/* ANIMATED DIAGRAM (User -> STBA Platform -> Supabase/Firebase -> Insights) */}
          <div className="bg-stone-900/30 border border-stone-850 p-8 rounded-2xl overflow-hidden relative">
            <div className="text-left mb-6 font-mono text-[9px] text-[#C9973A] uppercase tracking-[0.2em] font-bold">
              SYSTEM INFRASTRUCTURE FLOW MAP
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-b border-stone-850">
              
              {/* Box 1: User */}
              <div className="w-40 p-4 bg-stone-950 border border-stone-800 rounded-xl text-center relative shadow-lg">
                <Users className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                <span className="font-mono text-[10px] text-stone-300 font-bold block">Scripture Reader</span>
                <span className="text-[8px] font-mono text-stone-600 uppercase">Interactive client</span>
              </div>

              {/* Pulsing Connector Line */}
              <div className="flex-1 h-1 bg-stone-800 relative w-1 md:w-auto min-w-[20px]">
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-3 bg-[#C9973A] rounded-full blur-[2px]"
                  animate={{ left: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Box 2: STBA Platform */}
              <div className="w-40 p-4 bg-[#11141C] border border-[#C9973A]/40 rounded-xl text-center relative shadow-xl">
                <Cpu className="w-5 h-5 text-[#DFC57B] mx-auto mb-2" />
                <span className="font-mono text-[10px] text-[#DFC57B] font-bold block">STBA Interval Engine</span>
                <span className="text-[8px] font-mono text-stone-500 uppercase">Recall Calibrations</span>
              </div>

              {/* Pulsing Connector Line */}
              <div className="flex-1 h-1 bg-stone-800 relative w-1 md:w-auto min-w-[20px]">
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-3 bg-[#2A9D8F] rounded-full blur-[2px]"
                  animate={{ left: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Box 3: Supabase Firebase */}
              <div className="w-40 p-4 bg-stone-950 border border-stone-800 rounded-xl text-center relative shadow-lg">
                <Database className="w-5 h-5 text-[#2A9D8F] mx-auto mb-2" />
                <span className="font-mono text-[10px] text-[#2A9D8F] font-bold block">SQL RLS / Auth Vault</span>
                <span className="text-[8px] font-mono text-stone-600 uppercase">Cloud storage cluster</span>
              </div>

              {/* Pulsing Connector Line */}
              <div className="flex-1 h-1 bg-stone-800 relative w-1 md:w-auto min-w-[20px]">
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-3 bg-purple-500 rounded-full blur-[2px]"
                  animate={{ left: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Box 4: Insights */}
              <div className="w-40 p-4 bg-stone-950 border border-[#2A9D8F]/30 rounded-xl text-center relative shadow-lg animate-pulse">
                <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <span className="font-mono text-[10px] text-emerald-400 font-bold block">Fluency Insights</span>
                <span className="text-[8px] font-mono text-stone-600 uppercase">Scribal analytics</span>
              </div>

            </div>

            <p className="text-[10px] font-mono text-stone-500 text-center mt-6">
              Row-Level Security (RLS) is perpetually active. All visual sync transactions take under &lt;12ms.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 6 — PRIMARY CALL TO ACTION */}
      <section id="get-started" className="relative py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden border-t border-b border-stone-900 z-10 bg-[#08132E]">
        
        {/* Glow spotlight overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#C9973A]/10 to-[#2A9D8F]/10 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#DFC57B] font-bold bg-[#C9973A]/10 border border-[#C9973A]/30 px-3.5 py-1.5 rounded-full">
            Cognitive Sovereign Vault
          </span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-stone-100 tracking-tight leading-none"
          >
            Start mastering <br />
            <span className="text-[#DFC57B]">
              what matters.
            </span>
          </motion.h2>

          <p className="text-[#6B6B6B] font-light text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Theological scripture decay ends today. Secure permanent memory structures inside your consciousness with empirical learning mechanics.
          </p>

          <div className="pt-8">
            <motion.button
              onClick={() => handleStart(false, "beginner")}
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(201,151,58,0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="relative px-12 py-5 bg-gradient-to-r from-[#C9973A] to-[#DFC57B] text-[#090B0F] text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-[#C9973A]/50 hover:border-[#DFC57B] hover:ring-2 hover:ring-[#DFC57B] hover:ring-offset-2 hover:ring-offset-[#08132E]"
            >
              <span className="relative z-10">Sign Up for Free &rarr;</span>
              
              {/* Highlight sweep moving across the button on hover */}
              <span className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 group-hover:left-[150%] transition-all duration-1000 pointer-events-none" />
            </motion.button>
          </div>

          <div className="pt-4">
            <a 
              href="#method" 
              className="text-xs font-mono text-stone-500 hover:text-[#C9973A] uppercase tracking-widest relative group transition-colors"
            >
              Or explore the method first
              <span className="absolute bottom-[-2px] left-0 right-0 h-px bg-[#C9973A] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 7 — PREMIUM STBA FOOTER */}
      <Footer />

    </div>
  );
};
