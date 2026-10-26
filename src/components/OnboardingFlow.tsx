/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Check,
  Flame,
  User,
  Calendar,
  Layers,
  Sparkles,
  Award,
  BookOpenCheck,
  Brain,
  Shield,
  Compass,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Unlock,
  MessageSquare
} from "lucide-react";
import { UserAccount } from "../types";
import { TtsPlayer, preCacheSpeechAudios } from "./TtsPlayer";
import { useApp } from "../context/AppContext";

interface OnboardingFlowProps {
  onComplete: (data: UserAccount) => void;
  onExploreFirst?: () => void;
  isSabbathMode?: boolean;
  isSignIn?: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useApp();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [fullName, setFullName] = useState(user?.name || "");
  const [emailAddress, setEmailAddress] = useState(user?.email || "");

  React.useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
    if (user?.email) {
      setEmailAddress(user.email);
    }
  }, [user]);
  
  // Custom spiritual goal state
  const [goal, setGoal] = useState<"learning" | "going deeper" | "teaching" | null>(null);
  
  // Detected tier based on goal choice
  const [detectedTier, setDetectedTier] = useState<"Beginner" | "Scholar" | "Leader">("Beginner");

  // Error/validation messages
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-cache all onboarding speech audio clips in the background
  React.useEffect(() => {
    const voice = localStorage.getItem("stba_ai_voice") || "Puck";
    const textsToCache = [
      `Study to shew thyself approved unto God. Grace and peace to you, ${user?.name || "Berean"}. I am Elder Stephen, your exegetical Bible study AI guide. Many people read the Bible again and again without truly retaining or applying what they learn. Using our STBA Study System, we help you understand Scripture deeply, remember it clearly, and use it meaningfully in your daily life. Click the button below to continue your inspiring journey into the study of the Scriptures.`,
      `I have adjusted your dynamic diagnostic, testing, and lesson planning tracks according to your goal. Which learning path would you like to focus on? Learning Foundations, Going Deeper into Doctrine, or Teaching and Preaching Standard.`,
      `You've selected 'learning' as your study goal. To ensure you get the right guidance, your study dashboard is set to the Beginner tier. You can upgrade at any time to the Scholar or leader Tier.`,
      `You've selected 'going deeper' as your study goal. To ensure you get the right guidance, your study dashboard is set to the Scholar tier. You can upgrade at any time to the leader Tier.`,
      `You've selected 'teaching' as your study goal. To ensure you get the right guidance, your study dashboard is set to the Leader tier.`,
      `I've employed six structural frameworks on your study panel to target cognitive scripture mastery. We'll start with explain mode, where I'll walk you through the text step-by-step using the exegesis method`,
      `FIRST RETRIEVAL ASSIGNMENT: Two Timothy chapter three, verse sixteen. "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness." I launch your learning directly into explain mode, where we will examine this pivotal text to understand what the intended meaning was, and how we can apply it to our lives.`
    ];
    preCacheSpeechAudios(textsToCache, voice).catch(err => {
      console.warn("Background audio pre-cache failed:", err);
    });
  }, [user]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFullName("Berean");
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleGoalSelection = (selectedGoal: "learning" | "going deeper" | "teaching") => {
    setGoal(selectedGoal);
    
    // Automatic Tier Detection matching goals
    let tier: "Beginner" | "Scholar" | "Leader" = "Beginner";
    if (selectedGoal === "learning") {
      tier = "Beginner";
    } else if (selectedGoal === "going deeper") {
      tier = "Scholar";
    } else if (selectedGoal === "teaching") {
      tier = "Leader";
    }
    
    setDetectedTier(tier);
    localStorage.setItem("stba_user_tier", tier);
    window.dispatchEvent(new CustomEvent("stba-tier-updated", { detail: tier }));
    
    setStep(3);
  };

  const finishOnboarding = () => {
    // Enable the first study explain-first flag to force the Dashboard to load on Explain Mode with AI guide active
    localStorage.setItem("stba_onboarding_explain_first", "true");
    localStorage.setItem("stba_is_new_user", "true");
    localStorage.removeItem("stba_tour_completed");
    localStorage.removeItem("stba_onboarding_pending");
    
    const mappedRole = detectedTier === "Leader" ? "Pastor" : detectedTier === "Scholar" ? "SabbathSchoolTeacher" : "Student";
    
    onComplete({
      name: fullName.trim(),
      email: emailAddress.trim() || "believer@stba.org",
      isSda: true,
      firstTrack: "fundamental-beliefs",
      role: mappedRole,
      isGuest: false,
      emailVerified: true
    });
  };

  return (
    <div className="w-full flex justify-center py-4 px-2" id="stba-onboarding-wrapper">
      <div
        className="w-full max-w-lg bg-[#FDFAF5] border border-[#E8E4DA] rounded-[24px] overflow-hidden shadow-sm flex flex-col justify-between"
        id="onboarding-main-card"
        style={{ minHeight: "560px" }}
      >
        {/* Onboarding Header */}
        <div className="p-5 border-b border-[#E8E4DA] flex items-center justify-between bg-white shrink-0" id="onboarding-hdr">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#C9973A]/10 text-[#C9973A] rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#1C2333]">
              STBA Study System
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-widest">
              Guided Step {step} of 5
            </span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-4 bg-[#C9973A]" : s < step ? "bg-teal-600" : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Transition Canvas */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center" id="onboarding-viewport">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="space-y-4">
                  {/* Elder Avatar & Greeting */}
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700 animate-pulse">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        AI Academic Mentor
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#1C2333]">Elder Stephen welcomes you</h3>
                    </div>
                  </div>

                  <div className="p-4.5 bg-teal-50/40 border-l-4 border-teal-600 rounded-r-xl space-y-3 elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased">
                    <h4 className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-navy text-sm leading-relaxed tracking-[0.65px]">
                      "Study to shew thyself approved unto God..."
                    </h4>
                    <p className="text-xs text-stone-600 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] leading-relaxed">
                      Grace and peace to you, <strong>{fullName || "beloved Berean"}</strong>. I am <strong>Elder Stephen</strong>, your exegetical Bible study AI guide. Many people read the Bible again and again without truly retaining or applying what they learn. Using our STBA Study System, we help you understand Scripture deeply, remember it clearly, and use it meaningfully in your daily life.
                    </p>
                    <p className="text-xs text-stone-650 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] leading-relaxed font-semibold italic">
                      Click the button below to continue your inspiring journey into the study of the Scriptures.
                    </p>
                  </div>
                  
                  <TtsPlayer
                    text={`Study to shew thyself approved unto God. Grace and peace to you, ${fullName || "beloved Berean"}. I am Elder Stephen, your exegetical Bible study AI guide. Many people read the Bible again and again without truly retaining or applying what they learn. Using our STBA Study System, we help you understand Scripture deeply, remember it clearly, and use it meaningfully in your daily life. Click the button below to continue your inspiring journey into the study of the Scriptures.`}
                    messageId="onboarding-step-1"
                    label="Hear Elder Stephen"
                  />
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  {errorMsg && (
                    <p className="text-xs text-rose-600 font-serif font-bold">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#1C2333] hover:bg-[#2A344A] text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Connect with Elder Stephen</span>
                    <ArrowRight className="w-4 h-4 text-[#C9973A]" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 text-left"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#A0885B]">
                    Step 2: Define Spiritual Goal
                  </span>
                  <h2 className="font-serif text-2xl font-black text-[#1C2333]">
                    What is your focus this season?
                  </h2>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    I have adjusted your dynamic diagnostic, testing, and lesson planning tracks according to your goal. Which learning path would you like to focus on?
                  </p>
                  
                  <TtsPlayer
                    text="I have adjusted your dynamic diagnostic, testing, and lesson planning tracks according to your goal. Which learning path would you like to focus on? Learning Foundations, Going Deeper into Doctrine, or Teaching and Preaching Standard."
                    messageId="onboarding-step-2"
                    label="Hear Elder Stephen"
                  />
                </div>

                <div className="space-y-3" id="onboarding-goals-list">
                  {[
                    {
                      id: "learning" as const,
                      title: "Learning Foundations",
                      desc: "I want a steady path to understand fundamental beliefs and build daily scripture memory from scratch.",
                      icon: User,
                      accent: "bg-stone-100 text-stone-700 border-stone-200"
                    },
                    {
                      id: "going deeper" as const,
                      title: "Going Deeper Into Doctrine",
                      desc: "I want to study the 28 fundamental beliefs, Sabbath quarterly lessons, and cross-reference historic commentaries.",
                      icon: Brain,
                      accent: "bg-teal-50 text-teal-800 border-teal-200"
                    },
                    {
                      id: "teaching" as const,
                      title: "Teaching & Preaching Standard",
                      desc: "I lead Bible studies, teach Sabbath school, preach, or share prophecies with seeker classes.",
                      icon: Flame,
                      accent: "bg-amber-50 text-amber-800 border-amber-200"
                    }
                  ].map((gOpt) => {
                    const Icon = gOpt.icon;
                    return (
                      <button
                        key={gOpt.id}
                        onClick={() => handleGoalSelection(gOpt.id)}
                        className="w-full p-4 bg-white border border-[#E8E4DA] rounded-xl text-left hover:border-[#C9973A] hover:bg-stone-50/50 transition-all cursor-pointer flex items-start space-x-3.5 group"
                      >
                        <div className="p-2 bg-stone-100 rounded-lg group-hover:bg-[#C9973A]/15 group-hover:text-[#C9973A] text-stone-600 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#1C2333] group-hover:text-teal-900">
                            {gOpt.title}
                          </h4>
                          <p className="text-[11px] text-[#6B6B6B] leading-snug">
                            {gOpt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-stone-200 text-stone-500 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-stone-400" />
                  <span>Back</span>
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="space-y-2 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-[#C9973A] border-2 border-[#C9973A]/20">
                    <Award className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#C9973A] block">
                      AI Study Calibration Complete
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-black text-[#1C2333]">
                      Detected Study Tier: {detectedTier}
                    </h2>
                  </div>
                </div>

                {/* Detected Tier Description Card */}
                <div className="p-5 bg-white border border-[#E8E4DA] rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded">
                      Authorized Academic License
                    </span>
                    <span className="text-[9.5px] font-mono text-stone-400 font-bold uppercase">
                      STBA SECURE ID
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs text-stone-600 leading-normal font-sans">
                      You've selected '<strong>{goal}</strong>' as your study goal. To ensure you get the right guidance, your study dashboard is set to the <strong>{detectedTier} tier</strong>. {detectedTier === "Scholar" ? "You can upgrade at any time to the leader Tier." : detectedTier === "Leader" ? "" : "You can upgrade at any time to the Scholar or leader Tier."}
                    </p>

                    <TtsPlayer
                      text={`You've selected '${goal}' as your study goal. To ensure you get the right guidance, your study dashboard is set to the ${detectedTier} tier. ${detectedTier === "Scholar" ? "You can upgrade at any time to the leader Tier." : detectedTier === "Leader" ? "" : "You can upgrade at any time to the Scholar or leader Tier."}`}
                      messageId="onboarding-step-3"
                      label="Hear Elder Stephen"
                    />

                    {/* Matrix comparison depending on the detected tier */}
                    <div className="p-3.5 bg-stone-50 rounded-xl space-y-2 border border-stone-200/60">
                      <span className="text-[9px] font-mono font-bold uppercase text-stone-500 block">
                        BENEFITS & STATUS MATRIX:
                      </span>
                      <ul className="space-y-1.5 text-[11.5px] text-stone-700 leading-relaxed font-sans">
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Explain Mode Exegesis (Unlocked)</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>STBA diagnostic recalls (Unlocked)</span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          {detectedTier === "Beginner" ? (
                            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span className={detectedTier === "Beginner" ? "text-stone-400" : ""}>
                            Scripture Vault & Stats (Scholar level)
                          </span>
                        </li>
                        <li className="flex items-center space-x-1.5">
                          {detectedTier === "Leader" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className={detectedTier !== "Leader" ? "text-stone-400" : ""}>
                            Teaching Tools & Sermon Outlines (Leader Level)
                          </span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-[10px] text-teal-800 bg-teal-50 px-3 py-2 rounded font-mono block border border-teal-200/50">
                      *Note: You can upgrade your study tier at any time using the dashboard badge or header action.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-3 border border-stone-200 text-stone-500 rounded-xl text-xs font-mono font-bold hover:text-stone-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-3 bg-[#1C2333] hover:bg-[#2A344A] text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Introduce Study Modes</span>
                    <ArrowRight className="w-4 h-4 text-[#C9973A]" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 text-left"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#A0885B]">
                    Step 4: Academic Layout
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-[#1C2333]">
                    Six Strategic Modes of STBA
                  </h2>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    I've employed six structural frameworks on your study panel to target cognitive scripture mastery. We'll start with explain mode, where I'll walk you through the text step-by-step using the exegesis method
                  </p>
                </div>

                <TtsPlayer
                  text="I've employed six structural frameworks on your study panel to target cognitive scripture mastery. We'll start with explain mode, where I'll walk you through the text step-by-step using the exegesis method"
                  messageId="onboarding-step-4"
                  label="Hear Elder Stephen"
                />

                {/* Simple Mode Grid with highlights matching tier */}
                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1" id="modes-preview-grid">
                  {[
                    { name: "Explain Mode", desc: "Lexical Q&A Exegesis (Ask Scholar)", icon: MessageSquare, locked: false },
                    { name: "STBA Mode", desc: "Diagnostic testing calibration", icon: BookOpenCheck, locked: false },
                    { name: "Application Mode", desc: "Scribal response diary writing", icon: Sparkles, locked: false },
                    { name: "Syllabus Mode", desc: "Syllabus outlines & calendars", icon: Calendar, locked: detectedTier === "Beginner" },
                    { name: "Recall Mode", desc: "Active scripture memory tracks", icon: Brain, locked: detectedTier === "Beginner" },
                    { name: "Teach It Mode", desc: "Oral speaking studio & templates", icon: Layers, locked: detectedTier !== "Leader" },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.name}
                        className={`p-3 border rounded-xl flex flex-col justify-between space-y-1 transition-all ${
                          m.locked
                            ? "bg-stone-50 border-stone-200/60 opacity-60"
                            : "bg-white border-teal-100 shadow-2xs hover:border-teal-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-1 rounded-md ${m.locked ? "bg-stone-200 text-stone-500" : "bg-teal-50 text-teal-700"}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {m.locked ? (
                            <Lock className="w-3 h-3 text-[#C9973A]" />
                          ) : (
                            <Unlock className="w-3 h-3 text-emerald-600" />
                          )}
                        </div>
                        <div className="leading-tight">
                          <h4 className="font-serif font-bold text-[11px] text-[#1C2333]">{m.name}</h4>
                          <p className="text-[9px] text-[#6B6B6B] leading-tight block">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-3 border border-stone-200 text-stone-500 rounded-xl text-xs font-mono font-bold hover:text-stone-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 py-3 bg-[#1C2333] hover:bg-[#2A344A] text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Prepare First Study</span>
                    <ArrowRight className="w-4 h-4 text-[#C9973A]" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                <div className="space-y-4">
                  {/* Elder Stephen Final Prompt */}
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#C9973A]/10 border border-[#C9973A]/20 flex items-center justify-center text-[#C9973A]">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#C9973A] bg-amber-50 px-2 py-0.5 rounded">
                        Sabbath Preparation Complete
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#1C2333]">Sola Scriptura Commencement</h3>
                    </div>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                    <h4 className="font-serif font-bold text-navy text-xs sm:text-xs">
                      FIRST RETRIEVAL ASSIGNMENT: 2 TIMOTHY 3:16
                    </h4>
                    <p className="font-bible text-xs leading-relaxed text-stone-600 block pl-3 border-l-2 border-[#C9973A]">
                      "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness."
                    </p>
                    <p className="text-xs text-stone-605 font-sans leading-relaxed">
                      I launch your learning directly into explain mode, where we will examine this pivotal text to understand what the intended meaning was, and how we can apply it to our lives.
                    </p>
                  </div>
                  
                  <TtsPlayer
                    text='FIRST RETRIEVAL ASSIGNMENT: Two Timothy chapter three, verse sixteen. "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness." I launch your learning directly into explain mode, where we will examine this pivotal text to understand what the intended meaning was, and how we can apply it to our lives.'
                    messageId="onboarding-step-5"
                    label="Hear Elder Stephen"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep(4)}
                    className="px-4 py-3.5 border border-stone-200 text-stone-500 rounded-xl text-xs font-mono font-bold hover:text-stone-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={finishOnboarding}
                    className="flex-1 py-3.5 bg-[#C9973A] hover:bg-[#B0822F] text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all scale-100 hover:scale-[1.01] active:scale-95 cursor-pointer animate-pulse"
                  >
                    <span>Launch Study in Explain Mode</span>
                    <ArrowRight className="w-4 h-4 text-white fill-current" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Outer Footnote */}
        <div className="p-4 bg-stone-100/80 border-t border-[#E8E4DA] text-center shrink-0">
          <p className="text-sm font-semibold font-serif text-[#C9973A] tracking-wide">
            "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
