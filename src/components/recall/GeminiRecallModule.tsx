/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Brain,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Award,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react";
import { Scripture } from "../../types";
import { useApp } from "../../context/AppContext";

interface GeminiRecallModuleProps {
  initialScripture?: Scripture;
  onPracticeInGym?: (scripture: Scripture) => void;
}

interface PromptResponse {
  prompt: string;
  hints: string[];
  challengeType: string;
  focusKeyword: string;
}

interface EvaluationResult {
  accuracyScore: number;
  doctrinalAlignmentScore: number;
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
  mnemonicTip: string;
  pastoralEncouragement: string;
}

const DEFAULT_SCRIPTURE: Scripture = {
  id: "2tim-3-16",
  reference: "2 Timothy 3:16",
  text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
  keywords: ["inspiration", "profitable", "doctrine", "reproof", "righteousness"]
};

export const GeminiRecallModule: React.FC<GeminiRecallModuleProps> = ({
  initialScripture,
  onPracticeInGym
}) => {
  const { showConfetti } = useApp();
  const [selectedScripture, setSelectedScripture] = useState<Scripture>(
    initialScripture || DEFAULT_SCRIPTURE
  );

  useEffect(() => {
    if (initialScripture) {
      setSelectedScripture(initialScripture);
    }
  }, [initialScripture]);

  const [difficulty, setDifficulty] = useState<"beginner" | "scholar" | "apologist">("scholar");
  const [userRecallAttempt, setUserRecallAttempt] = useState<string>("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [activePromptData, setActivePromptData] = useState<PromptResponse | null>(null);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);

  // Fetch dynamic AI Recall Prompt
  const fetchGeminiPrompt = async (scrip: Scripture = selectedScripture) => {
    setIsGeneratingPrompt(true);
    setEvaluationResult(null);
    setUserRecallAttempt("");
    setShowHints(false);

    try {
      const res = await fetch("/api/recall/ai-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scripture: scrip,
          difficulty,
          mode: "verbatim"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActivePromptData(data);
      }
    } catch (err) {
      console.error("[Gemini Recall Prompt Error]:", err);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Evaluate user recall with Gemini
  const handleEvaluateAttempt = async () => {
    if (!userRecallAttempt.trim()) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/recall/ai-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scripture: selectedScripture,
          userAttempt: userRecallAttempt.trim(),
          recallMode: difficulty
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluationResult(data);
        if (data.accuracyScore >= 85) {
          showConfetti("recall");
        }
      }
    } catch (err) {
      console.error("[Gemini Recall Evaluate Error]:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchGeminiPrompt(selectedScripture);
  }, [selectedScripture, difficulty]);

  return (
    <div className="w-full bg-[#161D2B] border border-stone-800 rounded-2xl p-4 sm:p-6 text-stone-200 shadow-2xl space-y-6" id="gemini-recall-module-root">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#DFC57B]">
            <Sparkles className="w-5 h-5 text-[#DFC57B] drop-shadow-[0_0_6px_rgba(223,197,123,0.4)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-[#DFC57B]/10 px-2.5 py-0.5 rounded border border-[#DFC57B]/30">
              GEMINI-POWERED RECALL MODULE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            Real-Time AI Scripture Retrieval & Exegesis Feedback
          </h2>
          <p className="text-xs text-stone-400">
            Harness real-time AI prompts, verbatim word auditing, theological alignment checks, and cognitive mnemonic coaching.
          </p>
        </div>

        {/* TARGET VERSE BADGE */}
        <div className="px-3.5 py-2 bg-[#06162c] border border-[#DFC57B]/60 rounded-xl text-right">
          <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block">
            TARGET SCRIPTURE
          </span>
          <span className="text-xs font-bold text-[#DFC57B]">
            {selectedScripture.reference}
          </span>
        </div>
      </div>

      {/* DIFFICULTY SELECTION (ROUND WITH GOLD TRIM) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
          SELECT RECALL INTENSITY & DIFFICULTY:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "beginner" as const, label: "Beginner: Guided Retrieval", icon: Lightbulb },
            { id: "scholar" as const, label: "Scholar: Verbatim Precision", icon: Brain },
            { id: "apologist" as const, label: "Apologist: Complete Defense", icon: ShieldCheck }
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setDifficulty(lvl.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold transition-all border cursor-pointer ${
                difficulty === lvl.id
                  ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                  : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70"
              }`}
            >
              <lvl.icon className="w-3.5 h-3.5 text-[#DFC57B]" />
              <span>{lvl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI PROMPT CHALLENGE CARD */}
      <div className="bg-[#0B101B] border border-stone-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#DFC57B]" />
            <span className="text-[11px] font-mono uppercase text-[#DFC57B] font-bold">
              ELDER STEPHEN'S RETRIEVAL PROMPT
            </span>
          </div>
          <button
            onClick={() => fetchGeminiPrompt()}
            disabled={isGeneratingPrompt}
            className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#DFC57B] ${isGeneratingPrompt ? "animate-spin" : ""}`} />
            <span>Generate New Prompt</span>
          </button>
        </div>

        {isGeneratingPrompt ? (
          <div className="py-6 text-center space-y-2 animate-pulse">
            <Sparkles className="w-6 h-6 text-[#DFC57B] mx-auto" />
            <p className="text-xs text-stone-400 font-mono">
              Elder Stephen is framing a cognitive retrieval prompt...
            </p>
          </div>
        ) : activePromptData ? (
          <div className="space-y-3">
            <p className="text-sm sm:text-base font-serif text-stone-100 font-semibold leading-relaxed">
              "{activePromptData.prompt}"
            </p>

            {/* HINTS ACCORDION */}
            <div className="pt-2">
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs font-mono text-[#DFC57B] hover:text-[#F3CF65] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHints ? "Hide Cognitive Clues" : "Need a Hint? Show Clues"}</span>
              </button>

              {showHints && activePromptData.hints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2.5 p-3 bg-[#161D2B] border border-stone-800 rounded-lg space-y-1.5 text-xs text-stone-300"
                >
                  {activePromptData.hints.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#DFC57B] font-bold">•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* USER RECALL INPUT GYM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            YOUR VERBATIM RECALL ATTEMPT:
          </label>
          <span className="text-xs font-mono text-stone-500">
            {userRecallAttempt.split(/\s+/).filter(Boolean).length} Words
          </span>
        </div>

        <textarea
          value={userRecallAttempt}
          onChange={(e) => setUserRecallAttempt(e.target.value)}
          placeholder={`Type ${selectedScripture.reference} verbatim from memory without looking at the text...`}
          rows={4}
          className="w-full bg-[#0B101B] border border-stone-800 focus:border-[#DFC57B] rounded-xl p-4 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#DFC57B] transition-all font-sans leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setUserRecallAttempt("")}
            className="text-xs text-stone-500 hover:text-stone-300 font-mono transition-colors cursor-pointer"
          >
            Clear Text
          </button>

          <button
            onClick={handleEvaluateAttempt}
            disabled={!userRecallAttempt.trim() || isEvaluating}
            className="px-6 py-2.5 bg-[#DFC57B] hover:bg-[#F3CF65] disabled:opacity-40 disabled:cursor-not-allowed text-[#06162c] text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-[#06162c]" />
                <span>Auditing Recall...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#06162c]" />
                <span>Submit to Gemini Auditor</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GEMINI EVALUATION RESULTS DISPLAY */}
      {evaluationResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B101B] border border-[#DFC57B]/70 rounded-xl p-5 space-y-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#DFC57B]" />
              <h3 className="text-base font-serif font-bold text-white">
                Elder Stephen's Diagnostic Scorecard
              </h3>
            </div>

            {/* SCORE BADGES */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-[#06162c] border border-[#DFC57B]/50 rounded-lg text-xs font-mono font-bold text-[#DFC57B]">
                Accuracy: {evaluationResult.accuracyScore}%
              </div>
              <div className="px-3 py-1 bg-stone-900 border border-emerald-500/50 rounded-lg text-xs font-mono font-bold text-emerald-400">
                Doctrinal Sense: {evaluationResult.doctrinalAlignmentScore}%
              </div>
            </div>
          </div>

          {/* PASTORAL FEEDBACK */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider font-bold block">
              ANALYSIS & EVALUATION:
            </span>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
              {evaluationResult.feedback}
            </p>
          </div>

          {/* KEYWORDS AUDIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#161D2B] border border-stone-800 rounded-lg">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider block font-bold mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Captured Theological Keywords:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {evaluationResult.matchedKeywords.length > 0 ? (
                  evaluationResult.matchedKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-700/50 rounded text-[10px] font-mono text-emerald-300">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 italic">None captured</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#161D2B] border border-stone-800 rounded-lg">
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block font-bold mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Missed Keywords to Focus:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {evaluationResult.missedKeywords.length > 0 ? (
                  evaluationResult.missedKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-950/60 border border-amber-700/50 rounded text-[10px] font-mono text-amber-300">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400">All key terms captured!</span>
                )}
              </div>
            </div>
          </div>

          {/* MNEMONIC COACHING */}
          <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block font-bold">
              COGNITIVE MNEMONIC COACHING:
            </span>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              {evaluationResult.mnemonicTip}
            </p>
          </div>

          {/* PASTORAL BLESSING */}
          <div className="p-3.5 bg-[#06162c] border border-[#DFC57B]/30 rounded-lg space-y-1">
            <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block font-bold">
              SPIRITUAL DISCIPLINE & BENEDICTION:
            </span>
            <p className="text-xs text-stone-200 font-serif italic leading-relaxed">
              {evaluationResult.pastoralEncouragement}
            </p>
          </div>

          {/* NEXT STEPS */}
          {onPracticeInGym && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => onPracticeInGym(selectedScripture)}
                className="px-5 py-2 bg-[#DFC57B] hover:bg-[#F3CF65] text-[#06162c] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue into 4-Step Recall Gym</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
