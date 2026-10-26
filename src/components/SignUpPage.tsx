/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  BookOpen, 
  Crown, 
  Brain, 
  Compass, 
  FileText, 
  ChevronRight,
  RefreshCw,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { STBA_LOGO_URL } from "../assets/branding";

// Cloudinary Background Videos per Tier
const TIER_VIDEOS: Record<TierType, string> = {
  beginner: "https://res.cloudinary.com/dx3jgal9b/video/upload/v1787034376/Bible_Study_on_Laptop_3_nnnhqw.mp4",
  scholar: "https://res.cloudinary.com/dx3jgal9b/video/upload/v1787034364/Bible_Study_on_Laptop_4_n6qkuq.mp4",
  leader: "https://res.cloudinary.com/dx3jgal9b/video/upload/v1787034364/Bible_Study_on_Laptop_2_irlsxv.mp4"
};

type TierType = "beginner" | "scholar" | "leader";
type StageType = "tier-selection" | "credentials" | "email-verification";

interface TierDetail {
  id: TierType;
  name: string;
  badge: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlySavingsNote: string;
  summary: string;
  accentColor: string;
  borderColor: string;
  hoverGlow: string;
  bulletPoints: { title: string; desc: string }[];
  elderNote: string;
}

const TIER_CONFIGS: Record<TierType, TierDetail> = {
  beginner: {
    id: "beginner",
    name: "Beginner Tier",
    badge: "FOUNDATIONAL PATHWAY",
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlySavingsNote: "Free Forever",
    summary: "Essential Scripture mastery tools & 2 Timothy foundational study companions.",
    accentColor: "text-slate-200",
    borderColor: "border-slate-400/40",
    hoverGlow: "shadow-[0_0_35px_rgba(203,213,225,0.22)] border-slate-300",
    elderNote: "A blessed starting point. Master the core principles and lay a solid foundation in God’s Word.",
    bulletPoints: [
      {
        title: "Essential Study Tools",
        desc: "Foundational access to Explain Mode, line-upon-line breakdown, and 2 Timothy anchor texts."
      },
      {
        title: "Core Exegesis & Audio Companion",
        desc: "Direct oral audio feedback from Elder Stephen for foundational passages."
      },
      {
        title: "Active Recall Drills",
        desc: "Memory retrieval tests with immediate biblical affirmations and structured hints."
      },
      {
        title: "Fundamental SDA Beliefs",
        desc: "Step-by-step introduction to Sanctuary, Sabbath, and Salvation doctrines."
      },
      {
        title: "Free Lifetime Access",
        desc: "No credit card required. Upgrade or adapt your pace whenever you are ready."
      }
    ]
  },
  scholar: {
    id: "scholar",
    name: "Scholar Tier",
    badge: "MOST POPULAR • COGNITIVE RETENTION",
    monthlyPrice: 7.99,
    yearlyPrice: 6.58,
    yearlySavingsNote: "Save 17% • $79/yr billed annually",
    summary: "Accessible cognitive Scripture mastery tools, Leitner memory vaults, cognitive telemetry, & Sabbath School syllabus planner.",
    accentColor: "text-teal-300",
    borderColor: "border-teal-500/50",
    hoverGlow: "shadow-[0_0_40px_rgba(45,212,191,0.3)] border-teal-300",
    elderNote: "Deepen your understanding. Unlocks cognitive memory curves and Greek/Hebrew lexical insights.",
    bulletPoints: [
      {
        title: "Leitner Structured Memory Vaults",
        desc: "Scientific spaced repetition algorithms that lock golden verses into permanent long-term memory."
      },
      {
        title: "Cognitive Telemetry & Analytics",
        desc: "Visual retention curves, mastery dials, and personal exegesis diary tracking."
      },
      {
        title: "Greek & Hebrew Concordance",
        desc: "Original language lexical drill-downs, Strong's concordance cross-references, and historical context."
      },
      {
        title: "Sabbath School Lesson Syllabus",
        desc: "Weekly golden verse planners, thematic lesson outlines, and discussion generators."
      },
      {
        title: "Uncapped Elder Stephen Dialogue",
        desc: "Continuous AI theological exegesis dialogues with full outline synthesis."
      }
    ]
  },
  leader: {
    id: "leader",
    name: "Leader Tier",
    badge: "SHEPHERD & MINISTRY SUITE",
    monthlyPrice: 14.99,
    yearlyPrice: 11.58,
    yearlySavingsNote: "Save ~15% • $139/yr billed annually",
    summary: "Homiletic preaching studio, Sabbath School lesson generators, and congregational discipleship suite.",
    accentColor: "text-amber-300",
    borderColor: "border-amber-500/50",
    hoverGlow: "shadow-[0_0_45px_rgba(245,158,11,0.35)] border-amber-300",
    elderNote: "Equipping teachers to teach others. Complete homiletic outlines and discipleship generators.",
    bulletPoints: [
      {
        title: "Teach It Mode & Homiletic Studio",
        desc: "Multi-layered teaching outline editor with child, new believer, and mature student scaling."
      },
      {
        title: "Curriculum & Lesson Generator",
        desc: "Instant Sabbath School lesson plans, Bible study guides, and sermon exegesis outlines."
      },
      {
        title: "Shepherd Discipleship Suite",
        desc: "Equip teachers to teach others (2 Tim 2:2), manage classes, and track discipleship milestones."
      },
      {
        title: "Oral Speech Coach & Audio Lab",
        desc: "High-fidelity voice synthesis recordings and homiletic delivery feedback."
      },
      {
        title: "Exportable Handouts & Slides",
        desc: "One-click generation of PDF study handouts, printable study guides, and lesson notes."
      }
    ]
  }
};

// Dynamic visual theme treatment for Stage 2 credentials step matching chosen tier
const TIER_THEME_STYLES: Record<TierType, {
  selectedBoxBg: string;
  selectedBoxBorder: string;
  selectedBoxGlow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  planNameColor: string;
  priceColor: string;
  changeLinkColor: string;
  topFlareColor: string;
}> = {
  beginner: {
    selectedBoxBg: "bg-slate-200/20 backdrop-blur-md",
    selectedBoxBorder: "border-slate-300/60 hover:border-slate-200",
    selectedBoxGlow: "shadow-[0_4px_25px_rgba(203,213,225,0.18)]",
    badgeBg: "bg-slate-200/30",
    badgeBorder: "border-slate-300/70",
    badgeText: "text-slate-200",
    iconBg: "bg-slate-200/30",
    iconBorder: "border-slate-300/70",
    iconColor: "text-white",
    planNameColor: "text-white",
    priceColor: "text-slate-200 font-mono",
    changeLinkColor: "text-slate-200 hover:text-white underline decoration-slate-300/80 font-bold",
    topFlareColor: "from-transparent via-slate-200 to-transparent",
  },
  scholar: {
    selectedBoxBg: "bg-emerald-500/20 backdrop-blur-md",
    selectedBoxBorder: "border-emerald-400/60 hover:border-emerald-300",
    selectedBoxGlow: "shadow-[0_4px_25px_rgba(16,185,129,0.25)]",
    badgeBg: "bg-emerald-500/30",
    badgeBorder: "border-emerald-400/70",
    badgeText: "text-emerald-200",
    iconBg: "bg-emerald-500/30",
    iconBorder: "border-emerald-400/70",
    iconColor: "text-emerald-300",
    planNameColor: "text-white",
    priceColor: "text-emerald-300 font-mono",
    changeLinkColor: "text-emerald-300 hover:text-emerald-100 underline decoration-emerald-400/80 font-bold",
    topFlareColor: "from-transparent via-emerald-400 to-transparent",
  },
  leader: {
    selectedBoxBg: "bg-[#C9973A]/20 backdrop-blur-md",
    selectedBoxBorder: "border-[#C9973A]/60 hover:border-[#DFC57B]",
    selectedBoxGlow: "shadow-[0_4px_25px_rgba(201,151,58,0.25)]",
    badgeBg: "bg-[#C9973A]/30",
    badgeBorder: "border-[#C9973A]/70",
    badgeText: "text-[#DFC57B]",
    iconBg: "bg-[#C9973A]/30",
    iconBorder: "border-[#C9973A]/70",
    iconColor: "text-amber-300",
    planNameColor: "text-white",
    priceColor: "text-amber-200 font-mono",
    changeLinkColor: "text-[#DFC57B] hover:text-white underline decoration-[#C9973A]/80 font-bold",
    topFlareColor: "from-transparent via-[#C9973A] to-transparent",
  }
};

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();

  // Pick up pre-selected tier from router state if present
  const stateTier = location.state?.targetTier as TierType | undefined;

  // Onboarding Stage
  const [currentStage, setCurrentStage] = useState<StageType>("tier-selection");

  // Tier selection & preview states
  const [selectedTier, setSelectedTier] = useState<TierType>(stateTier || "scholar");
  const [hoveredTier, setHoveredTier] = useState<TierType | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Is hover video active
  const [isVideoHoverActive, setIsVideoHoverActive] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email Verification Step States
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [verificationMsg, setVerificationMsg] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [sandboxFallbackCode, setSandboxFallbackCode] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Background Video Refs per Tier
  const beginnerVideoRef = useRef<HTMLVideoElement | null>(null);
  const scholarVideoRef = useRef<HTMLVideoElement | null>(null);
  const leaderVideoRef = useRef<HTMLVideoElement | null>(null);

  // Active preview tier is hovered tier if hovered, otherwise currently selected tier
  const activePreviewTier: TierType = hoveredTier || selectedTier;
  const activeTierConfig = TIER_CONFIGS[activePreviewTier];

  // Auto-play / pause videos safely on hover (defaulting to beginner tier video)
  useEffect(() => {
    if (currentStage !== "tier-selection") {
      beginnerVideoRef.current?.pause();
      scholarVideoRef.current?.pause();
      leaderVideoRef.current?.pause();
      return;
    }

    if (hoveredTier === "scholar") {
      scholarVideoRef.current?.play().catch(() => {});
      beginnerVideoRef.current?.pause();
      leaderVideoRef.current?.pause();
    } else if (hoveredTier === "leader") {
      leaderVideoRef.current?.play().catch(() => {});
      beginnerVideoRef.current?.pause();
      scholarVideoRef.current?.pause();
    } else {
      // Default: play beginner tier video
      beginnerVideoRef.current?.play().catch(() => {});
      scholarVideoRef.current?.pause();
      leaderVideoRef.current?.pause();
    }
  }, [hoveredTier, currentStage]);

  // Resend Cooldown Countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  // Stage 1 -> Stage 2: User clicks a tier to proceed to credentials
  const handleSelectTierAndProceed = (tier: TierType) => {
    setSelectedTier(tier);
    setIsVideoHoverActive(false);
    setErrorMsg(null);
    setCurrentStage("credentials");
  };

  // Stage 2 Submit: Register and dispatch verification code
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (!termsAccepted) {
      setErrorMsg("Please accept the STBA Academy Covenant to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          tier: selectedTier
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Account registration failed.");
      }

      if (data.fallbackCode) {
        setSandboxFallbackCode(data.fallbackCode);
        setVerificationCodeInput(data.fallbackCode);
      } else {
        setSandboxFallbackCode(null);
      }

      setVerificationMsg(data.message || `A verification code was dispatched to ${email.trim()}.`);
      setCurrentStage("email-verification");
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setVerificationError(null);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: fullName.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.fallbackCode) {
          setSandboxFallbackCode(data.fallbackCode);
          setVerificationCodeInput(data.fallbackCode);
        }
        setVerificationMsg(data.message || `Fresh verification code dispatched to ${email.trim()}.`);
        setResendCooldown(30);
      } else {
        setVerificationError(data.error || "Failed to resend code.");
      }
    } catch {
      setVerificationError("Network error while requesting code resend.");
    } finally {
      setIsResending(false);
    }
  };

  // Verify Code Submit
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!verificationCodeInput.trim() || verificationCodeInput.trim().length < 6) {
      setVerificationError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsVerifyingCode(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCodeInput.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerificationError(data.error || "Invalid verification code. Please check your inbox or request a new code.");
        setIsVerifyingCode(false);
        return;
      }

      // Successful Verification!
      const tierCapitalized = (selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)) as "Beginner" | "Scholar" | "Leader";
      localStorage.setItem("stba_user_tier", tierCapitalized);

      const registeredUser = {
        name: fullName.trim(),
        email: email.trim(),
        isSda: true,
        firstTrack: "fundamental-beliefs",
        role: (selectedTier === "leader" ? "Pastor" : "STBAScholar") as any,
        isGuest: false,
        emailVerified: true
      };

      setUser(registeredUser);

      localStorage.setItem("stba_onboarding_explain_first", "true");
      localStorage.setItem("stba_onboarding_pending", "true");
      localStorage.setItem("stba_is_new_user", "true");

      navigate("/onboarding", { state: { targetTier: selectedTier } });
    } catch {
      setVerificationError("Error connecting to verification service. Please retry.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center bg-[#070B14] font-sans py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#C9973A] selection:text-stone-950 overflow-x-hidden"
      id="stba-signup-container"
    >
      {/* ========================================================================= */}
      {/* HOVER-ACTIVATED BACKGROUND VIDEOS PER TIER (5% DARK OVERLAY)               */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 w-full h-full object-cover z-0 overflow-hidden pointer-events-none">
        {/* 1. BEGINNER TIER VIDEO (DEFAULT ACTIVE BACKGROUND) */}
        <video
          ref={beginnerVideoRef}
          src={TIER_VIDEOS.beginner}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            hoveredTier === "scholar" || hoveredTier === "leader"
              ? "opacity-0 scale-100 pointer-events-none"
              : "opacity-100 scale-102"
          }`}
        />

        {/* 2. SCHOLAR TIER VIDEO */}
        <video
          ref={scholarVideoRef}
          src={TIER_VIDEOS.scholar}
          muted
          playsInline
          loop
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            hoveredTier === "scholar"
              ? "opacity-100 scale-102"
              : "opacity-0 scale-100 pointer-events-none"
          }`}
        />

        {/* 3. LEADER TIER VIDEO */}
        <video
          ref={leaderVideoRef}
          src={TIER_VIDEOS.leader}
          muted
          playsInline
          loop
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            hoveredTier === "leader"
              ? "opacity-100 scale-102"
              : "opacity-0 scale-100 pointer-events-none"
          }`}
        />

        {/* Light 5% Dark Overlay */}
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15 pointer-events-none" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <button
          onClick={() => {
            if (currentStage === "credentials") {
              setCurrentStage("tier-selection");
            } else {
              navigate("/");
            }
          }}
          className="group p-2.5 px-3.5 text-stone-300 hover:text-[#C9973A] transition-all duration-300 bg-[#0F1626]/70 hover:bg-[#141E34] rounded-xl border border-white/10 hover:border-[#C9973A]/40 flex items-center gap-2 text-xs font-semibold backdrop-blur-md cursor-pointer shadow-lg"
          id="signup-return-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1 text-[#C9973A]" />
          <span>{currentStage === "credentials" ? "Back to Study Tiers" : "Return to Home"}</span>
        </button>

        {/* Brand Stamp */}
        <div className="flex items-center gap-2.5 bg-[#0F1626]/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5">
          <img
            src={STBA_LOGO_URL}
            alt="STBA Seal"
            className="w-6 h-6 object-contain rounded-full border border-[#C9973A]/40 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <span className="font-serif font-bold text-[#C9973A] text-xs tracking-wider">
            STBA ACADEMY
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTAINER                                                   */}
      {/* ========================================================================= */}
      <main className={`relative z-10 w-full max-w-7xl mx-auto ${
        currentStage === "credentials" 
          ? "pt-4 sm:pt-6 pb-6 px-4" 
          : "pt-8 sm:pt-12 pb-10 px-2 sm:px-4"
      } flex flex-col items-center justify-start`}>
        
        <AnimatePresence mode="wait">
          
          {/* ===================================================================== */}
          {/* STAGE 1: TIER SELECTION + CONTEXTUAL HOVER PREVIEW PANEL              */}
          {/* ===================================================================== */}
          {currentStage === "tier-selection" && (
            <motion.div
              key="stage-1-tier-selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full flex flex-col items-center space-y-6"
              id="stage-1-container"
            >
              {/* Header Title Section */}
              <div className="text-center space-y-2 max-w-2xl mx-auto px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9973A]/10 border border-[#C9973A]/30 text-[#EAD49E] text-[11px] font-mono font-bold tracking-widest uppercase shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9973A]" />
                  Stage 1: Choose Your Discipleship Tier
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight" id="signup-hero-title">
                  Begin Your Scripture Mastery
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans max-w-xl mx-auto">
                  Hover over each study tier to preview unlocked exegesis tools, cognitive memory vaults, and discipleship suites.
                </p>

                {/* MONTHLY / YEARLY BILLING TOGGLE */}
                <div className="pt-2 flex items-center justify-center">
                  <div className="bg-[#0D1424] p-1 rounded-xl border border-white/10 flex items-center shadow-xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                        billingCycle === "monthly"
                          ? "bg-[#C9973A] text-[#070B14] shadow-md"
                          : "text-stone-400 hover:text-white"
                      }`}
                      id="monthly-toggle-btn"
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("yearly")}
                      className={`px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        billingCycle === "yearly"
                          ? "bg-[#C9973A] text-[#070B14] shadow-md"
                          : "text-stone-400 hover:text-white"
                      }`}
                      id="yearly-toggle-btn"
                    >
                      <span>Yearly</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-black bg-teal-400 text-slate-950 shadow-xs uppercase tracking-wider">
                        Save 17%
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SPLIT DESKTOP LAYOUT: LEFT CONTEXTUAL PANEL + RIGHT 3-COLUMN CARDS */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-2 sm:px-4">
                
                {/* ------------------------------------------------------------- */}
                {/* LEFT CONTEXTUAL PREVIEW PANEL (Desktop & Tablet)              */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 w-full">
                  <div 
                    className="w-full bg-[#0D1424]/90 border border-white/10 hover:border-[#C9973A]/40 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 relative overflow-hidden"
                    id="contextual-preview-panel"
                  >
                    {/* Atmospheric Glow */}
                    <div 
                      className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
                        activePreviewTier === "beginner"
                          ? "bg-slate-400"
                          : activePreviewTier === "scholar"
                          ? "bg-teal-400"
                          : "bg-amber-400"
                      }`}
                    />

                    {/* Context Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                      <div>
                        <span className={`text-[10px] font-mono font-extrabold tracking-widest uppercase block mb-1 ${activeTierConfig.accentColor}`}>
                          {activeTierConfig.badge}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-serif font-black text-white flex items-center gap-2">
                          {activeTierConfig.name}
                        </h2>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-[#141E34] border border-white/10 flex items-center justify-center text-white shadow-inner shrink-0">
                        {activePreviewTier === "beginner" && <BookOpen className="w-5 h-5 text-slate-300" />}
                        {activePreviewTier === "scholar" && <Brain className="w-5 h-5 text-teal-300" />}
                        {activePreviewTier === "leader" && <Crown className="w-5 h-5 text-amber-300" />}
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed font-sans mb-5">
                      {activeTierConfig.summary}
                    </p>

                    {/* Bullet Points of Unlocked Benefits */}
                    <div className="space-y-3.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#EAD49E] font-bold block">
                        Included in this tier:
                      </span>
                      {activeTierConfig.bulletPoints.map((item, idx) => (
                        <motion.div
                          key={`${activePreviewTier}-${idx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.04 }}
                          className="flex items-start gap-2.5 text-left"
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                            activePreviewTier === "beginner"
                              ? "bg-slate-400/15 border-slate-400/40 text-slate-300"
                              : activePreviewTier === "scholar"
                              ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
                              : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-stone-400 leading-snug block mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* RIGHT PANEL: 3-COLUMN TIER CARDS (Wide desktop layout)        */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-5 w-full" id="tier-cards-grid">
                  
                  {/* CARD 1: BEGINNER TIER */}
                  <motion.div
                    onMouseEnter={() => {
                      setHoveredTier("beginner");
                      setIsVideoHoverActive(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredTier(null);
                      setIsVideoHoverActive(false);
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={() => handleSelectTierAndProceed("beginner")}
                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-xl group ${
                      selectedTier === "beginner"
                        ? "bg-[#11192C]/95 border-slate-300 shadow-[0_0_40px_rgba(203,213,225,0.35)]"
                        : "bg-[#0D1424]/80 border-white/10 hover:border-slate-300 hover:shadow-[0_0_40px_rgba(203,213,225,0.35)]"
                    }`}
                    id="tier-card-beginner"
                  >
                    <div>
                      {/* Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-400/10 text-slate-300 border border-slate-400/30">
                          Foundations
                        </span>
                        {selectedTier === "beginner" && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300 font-bold">
                            <Check className="w-3.5 h-3.5 text-slate-300" /> Active
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-serif font-black text-white group-hover:text-slate-100 transition-colors">
                        Beginner
                      </h3>
                      
                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-serif font-black text-white">$0</span>
                        <span className="text-xs text-stone-400 font-mono">/ lifetime</span>
                      </div>
                      <p className="text-[11px] text-slate-300/80 font-mono mt-1">
                        Free Forever
                      </p>

                      <p className="text-xs text-stone-300 leading-relaxed font-sans mt-4">
                        Master the core principles of 2 Timothy with essential Explain Mode and Active Recall tools.
                      </p>

                      {/* Feature Highlights */}
                      <ul className="mt-5 space-y-2 text-xs text-stone-300 border-t border-white/5 pt-4">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Explain Mode Exegesis</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Fundamental SDA Tracks</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Active Recall Checks</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-slate-300 hover:bg-white text-[#070B14] font-bold text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>Select Beginner</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>

                  {/* CARD 2: SCHOLAR TIER (Recommended) */}
                  <motion.div
                    onMouseEnter={() => {
                      setHoveredTier("scholar");
                      setIsVideoHoverActive(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredTier(null);
                      setIsVideoHoverActive(false);
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={() => handleSelectTierAndProceed("scholar")}
                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-xl group ${
                      selectedTier === "scholar"
                        ? "bg-[#101C2E]/95 border-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.35)]"
                        : "bg-[#0D1424]/80 border-teal-500/30 hover:border-teal-300 hover:shadow-[0_0_35px_rgba(45,212,191,0.25)]"
                    }`}
                    id="tier-card-scholar"
                  >
                    {/* Top Popular Ribbon */}
                    <div className="absolute top-0 right-0 bg-teal-500 text-[#070B14] text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-md">
                      Popular
                    </div>

                    <div>
                      {/* Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/40">
                          Cognitive Mastery
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-black text-white group-hover:text-teal-200 transition-colors">
                        Scholar
                      </h3>
                      
                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-serif font-black text-white">
                          ${billingCycle === "yearly" ? "6.58" : "7.99"}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">/ mo</span>
                      </div>
                      <p className="text-[11px] text-teal-300 font-mono mt-1">
                        {billingCycle === "yearly" ? "Save 17% • $79/yr ($6.58/mo)" : "$7.99 billed monthly"}
                      </p>

                      <p className="text-xs text-stone-300 leading-relaxed font-sans mt-4">
                        Unlocks scientific Leitner memory vaults, cognitive retention curves, Greek/Hebrew concordances, & syllabus plans.
                      </p>

                      {/* Feature Highlights */}
                      <ul className="mt-5 space-y-2 text-xs text-stone-300 border-t border-white/5 pt-4">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Leitner Spaced Repetition Vaults</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Cognitive Telemetry & Analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Greek & Hebrew Exegesis Tools</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Sabbath School Lesson Planner</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-[#070B14] font-bold text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        <span>Select Scholar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>

                  {/* CARD 3: LEADER TIER */}
                  <motion.div
                    onMouseEnter={() => {
                      setHoveredTier("leader");
                      setIsVideoHoverActive(true);
                    }}
                    onMouseLeave={() => {
                      setHoveredTier(null);
                      setIsVideoHoverActive(false);
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={() => handleSelectTierAndProceed("leader")}
                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-xl group ${
                      selectedTier === "leader"
                        ? "bg-[#1C160E]/95 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.45)]"
                        : "bg-[#0D1424]/80 border-amber-500/30 hover:border-amber-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.4)]"
                    }`}
                    id="tier-card-leader"
                  >
                    <div>
                      {/* Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-300" /> Shepherd Suite
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-black text-white group-hover:text-amber-200 transition-colors">
                        Leader
                      </h3>
                      
                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-serif font-black text-white">
                          ${billingCycle === "yearly" ? "11.58" : "14.99"}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">/ mo</span>
                      </div>
                      <p className="text-[11px] text-amber-300 font-mono mt-1">
                        {billingCycle === "yearly" ? "Save ~15% • $139/yr ($11.58/mo)" : "$14.99 billed monthly"}
                      </p>

                      <p className="text-xs text-stone-300 leading-relaxed font-sans mt-4">
                        Equipped for pastors, Sabbath School teachers, and discipleship mentors who train others and lead small groups.
                      </p>

                      {/* Feature Highlights */}
                      <ul className="mt-5 space-y-2 text-xs text-stone-300 border-t border-white/5 pt-4">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Teach It Homiletic Preaching Studio</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Curriculum & Lesson Generator</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Shepherd Small Group Discipleship</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Exportable Handouts, PDFs & Slides</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        className="w-full py-2.5 rounded-xl bg-[#C9973A] hover:bg-[#d8a542] text-[#070B14] font-bold text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        <span>Select Leader</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>

                </div>

              </div>

            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* STAGE 2: STUDY CREDENTIALS FORM                                       */}
          {/* ===================================================================== */}
          {currentStage === "credentials" && (
            <motion.div
              key="stage-2-credentials"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-[500px] mx-auto flex flex-col items-center"
              id="stage-2-container"
            >
              {/* Main Card Container with increased transparency & refined glass aesthetic */}
              <div 
                className="w-full bg-[#080F1E]/55 sm:bg-[#060D1A]/50 border border-white/20 hover:border-white/30 backdrop-blur-xl rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.65)] relative overflow-hidden"
                id="credentials-card"
              >
                {/* Dynamic Atmospheric Tier Flare */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r ${TIER_THEME_STYLES[selectedTier].topFlareColor} opacity-90`} />

                {/* Top Plan Confirmation Header with Dynamic Tier Highlight */}
                <div className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 ${TIER_THEME_STYLES[selectedTier].selectedBoxBg} ${TIER_THEME_STYLES[selectedTier].selectedBoxBorder} ${TIER_THEME_STYLES[selectedTier].selectedBoxGlow}`}>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-300 ${TIER_THEME_STYLES[selectedTier].iconBg} ${TIER_THEME_STYLES[selectedTier].iconBorder} ${TIER_THEME_STYLES[selectedTier].iconColor} shadow-inner`}>
                      {selectedTier === "beginner" && <BookOpen className="w-4 h-4" />}
                      {selectedTier === "scholar" && <Brain className="w-4 h-4" />}
                      {selectedTier === "leader" && <Crown className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider block ${TIER_THEME_STYLES[selectedTier].badgeText}`}>
                        Selected Plan
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-serif text-white tracking-tight flex items-center gap-1.5">
                        <span>{TIER_CONFIGS[selectedTier].name}</span>
                        <span className="text-stone-400">•</span>
                        <span className={TIER_THEME_STYLES[selectedTier].priceColor}>
                          {selectedTier === "beginner" 
                            ? "$0 Free" 
                            : billingCycle === "yearly" 
                            ? `$${TIER_CONFIGS[selectedTier].yearlyPrice}/mo ($${selectedTier === "scholar" ? "79" : "139"}/yr)` 
                            : `$${TIER_CONFIGS[selectedTier].monthlyPrice}/mo`}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStage("tier-selection")}
                    className={`text-xs font-mono transition-colors cursor-pointer p-1 ${TIER_THEME_STYLES[selectedTier].changeLinkColor}`}
                    id="change-tier-btn"
                  >
                    Change Tier
                  </button>
                </div>

                {/* Form Title */}
                <div className="text-center space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#DFC57B] font-bold block">
                    Stage 2 of 2: Create Account
                  </span>
                  <h2 className="text-lg sm:text-xl font-serif font-black text-white tracking-tight">
                    Complete Your Study Credentials
                  </h2>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-red-500/20 border border-red-500/40 text-red-200 rounded-xl text-xs font-sans flex items-center gap-2"
                    id="credentials-error-msg"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Main Registration Form */}
                <form onSubmit={handleSignUpSubmit} className="space-y-3" id="study-credentials-form">
                  
                  {/* Full Name */}
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-300 block mb-1" htmlFor="name-input">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        id="name-input"
                        placeholder="e.g. Jeremy Thomas"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full text-xs bg-[#0F182B]/60 hover:bg-[#0F182B]/75 focus:bg-[#0F182B]/90 border border-white/15 focus:border-[#C9973A] rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-300 block mb-1" htmlFor="email-input">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        id="email-input"
                        placeholder="yourname@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full text-xs bg-[#0F182B]/60 hover:bg-[#0F182B]/75 focus:bg-[#0F182B]/90 border border-white/15 focus:border-[#C9973A] rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-300 block mb-1" htmlFor="password-input">
                      Password (Minimum 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password-input"
                        placeholder="Create secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full text-xs bg-[#0F182B]/60 hover:bg-[#0F182B]/75 focus:bg-[#0F182B]/90 border border-white/15 focus:border-[#C9973A] rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* STBA Covenant Checkbox */}
                  <div className="flex items-start gap-2.5 bg-[#0F182B]/50 p-2.5 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      id="covenant-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-white/20 bg-stone-900 text-[#C9973A] focus:ring-[#C9973A] cursor-pointer shrink-0"
                    />
                    <label htmlFor="covenant-checkbox" className="text-[10.5px] text-stone-300 leading-tight select-none cursor-pointer">
                      I covenant to rightly divide the Word of truth (2 Tim 2:15), study in good faith, and adhere to the STBA Scripture Mastery principles.
                    </label>
                  </div>

                  {/* Action Button: Create Account & Start Learning */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-2 bg-[#C9973A] hover:bg-[#d8a542] text-[#070B14] disabled:opacity-40 rounded-xl text-xs font-bold font-sans uppercase tracking-widest transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
                    id="signup-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Initializing Berean Track...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create Account & Start Learning</span>
                      </>
                    )}
                  </button>

                </form>

                {/* Back to Tiers Link */}
                <div className="pt-0.5 text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStage("tier-selection")}
                    className="text-[11px] text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Want to review plan details? Go back to Tier Selection
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* STAGE 3: EMAIL SECURITY CODE VERIFICATION                             */}
          {/* ===================================================================== */}
          {currentStage === "email-verification" && (
            <motion.div
              key="stage-3-verification"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-lg mx-auto bg-[#0D1424]/95 border border-[#C9973A]/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl"
              id="verification-step-card"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-[#C9973A]/15 border border-[#C9973A]/40 text-[#C9973A] text-[10px] font-mono font-bold tracking-widest uppercase rounded-full inline-block">
                  Security Check
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Verify Your Email Address
                </h3>
                <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                  We've sent a 6-digit activation code to <span className="font-mono text-[#C9973A] font-semibold">{email}</span>. Enter it below to unlock your STBA account.
                </p>
              </div>

              {verificationMsg && (
                <div className="p-3 bg-teal-500/15 border border-teal-500/30 text-teal-200 text-xs rounded-xl text-center font-sans">
                  ✉️ {verificationMsg}
                </div>
              )}

              {verificationError && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-200 text-xs rounded-xl text-center font-sans">
                  ⚠️ {verificationError}
                </div>
              )}

              <form onSubmit={handleVerifyCodeSubmit} className="space-y-5" id="email-verification-form">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block text-center mb-2">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    autoFocus
                    required
                    className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] bg-[#141E34]/80 border border-[#C9973A]/50 focus:border-[#C9973A] rounded-2xl py-3.5 text-white placeholder-stone-600 focus:outline-none transition-all shadow-inner"
                    id="verification-code-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode || verificationCodeInput.length < 6}
                  className="w-full py-3.5 bg-[#C9973A] hover:bg-[#d8a542] text-[#070B14] disabled:opacity-40 rounded-xl text-xs font-bold font-sans uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  id="verify-code-submit-btn"
                >
                  {isVerifyingCode ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify & Enter Academy</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend & Back Controls */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-stone-400 hover:text-[#C9973A] disabled:opacity-40 transition-all font-semibold cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend Code in ${resendCooldown}s`
                    : isResending
                    ? "Sending..."
                    : "Didn't receive code? Resend"}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStage("credentials")}
                  className="text-stone-400 hover:text-white transition-all cursor-pointer"
                >
                  ← Edit Email Address
                </button>
              </div>

              {/* Sandbox Code Helper */}
              {sandboxFallbackCode && (
                <div className="p-3 bg-[#121B2E] border border-[#C9973A]/30 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#C9973A] font-bold block">
                    Sandbox Verification Helper
                  </span>
                  <p className="text-[11px] text-stone-300">
                    Generated Security Code: <span className="font-mono font-bold text-amber-300 bg-[#070B14] px-2 py-0.5 rounded border border-[#C9973A]/40">{sandboxFallbackCode}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* BOTTOM REDIRECT TO SIGN IN */}
        <div className="mt-6 text-center text-xs text-stone-400 font-sans">
          Already have an STBA Account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-[#C9973A] hover:text-[#DFC57B] font-bold underline focus:outline-none cursor-pointer ml-1"
            id="redirect-to-signin-btn"
          >
            Sign In here
          </button>
        </div>

      </main>
    </div>
  );
};
