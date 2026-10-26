import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { callElderStephen } from "../lib/callElderStephen";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Compass, 
  Loader2, 
  CheckCircle, 
  BookMarked,
  Sparkles
} from "lucide-react";

interface CrossReferenceEngineProps {
  initialBaseVerse?: string;
}

export const CrossReferenceEngine: React.FC<CrossReferenceEngineProps> = ({ 
  initialBaseVerse = "Daniel 8:14" 
}) => {
  const [baseVerse, setBaseVerse] = useState(initialBaseVerse);
  const [relatedVerses, setRelatedVerses] = useState<string[]>(["Leviticus 16:16", "Hebrews 9:23"]);
  const [newRelatedInput, setNewRelatedInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleAddRelated = () => {
    if (!newRelatedInput.trim()) return;
    if (!relatedVerses.includes(newRelatedInput.trim())) {
      setRelatedVerses((prev) => [...prev, newRelatedInput.trim()]);
    }
    setNewRelatedInput("");
  };

  const handleRemoveRelated = (verse: string) => {
    setRelatedVerses((prev) => prev.filter((v) => v !== verse));
  };

  const handleAnalyze = async () => {
    if (!baseVerse.trim()) return;
    setIsAnalyzing(true);
    setFeedbackText("");
    try {
      const payload = {
        currentMode: "STBA" as const,
        noteTitle: `Cross-Reference Chain: ${baseVerse}`,
        noteContent: `Base verse: ${baseVerse}\nRelated witnesses: ${relatedVerses.join(", ")}\nNotes: ${notes}`,
        base_verse: baseVerse,
        related_verses: relatedVerses,
        notes: notes || "No additional notes provided",
        userAction: "cross_reference"
      };

      const res = await callElderStephen(payload);
      if (res && res.text) {
        setFeedbackText(res.text);
      }
    } catch (e) {
      console.error("Failed to compile cross-reference insights:", e);
      setFeedbackText("Unable to compile cross-reference insights. Please verify your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#FDFAF5] border border-[#E8E4DA] rounded-2xl p-5 sm:p-6 text-left space-y-6 shadow-sm" id="cross-reference-engine-widget">
      <div className="border-b border-[#E8E4DA] pb-3 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-700">
          <BookMarked className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-serif font-black text-sm text-[#1C2333] tracking-tight uppercase">
            Berean Cross-Reference Engine
          </h4>
          <p className="text-[10px] text-stone-500 font-sans mt-0.5">
            Scripture Interprets Scripture — Harmonizing Divine Witnesses
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Base Verse */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono tracking-wider font-extrabold text-[#1C2333]/80 uppercase block">
            1. Anchor Scripture (Base Verse)
          </label>
          <input
            type="text"
            value={baseVerse}
            onChange={(e) => setBaseVerse(e.target.value)}
            placeholder="e.g. Daniel 8:14"
            className="w-full bg-white border border-[#E8E4DA] rounded-lg px-3 py-2 text-xs font-serif text-stone-800 placeholder-stone-400 focus:outline-none focus:border-teal-650"
            id="cr-base-verse-input"
          />
        </div>

        {/* Related Verses */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono tracking-wider font-extrabold text-[#1C2333]/80 uppercase block">
            2. Scriptural Witnesses (Related Verses)
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newRelatedInput}
              onChange={(e) => setNewRelatedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRelated();
                }
              }}
              placeholder="e.g. Leviticus 16:14 or Heb 9:11"
              className="flex-1 bg-white border border-[#E8E4DA] rounded-lg px-3 py-2 text-xs font-serif text-stone-800 placeholder-stone-400 focus:outline-none focus:border-teal-650"
              id="cr-related-verseinput"
            />
            <button
              type="button"
              onClick={handleAddRelated}
              className="p-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
              id="cr-add-related-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {relatedVerses.length === 0 ? (
              <span className="text-[10px] text-stone-400 font-sans italic">
                No witnesses added. Add cross-references to trace doctrinal unity.
              </span>
            ) : (
              relatedVerses.map((verse) => (
                <div
                  key={verse}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-[#E8E4DA] rounded-full text-[10.5px] font-serif text-stone-750 font-bold shadow-2xs"
                >
                  <span>{verse}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRelated(verse)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-px rounded"
                    title={`Detach ${verse}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono tracking-wider font-extrabold text-[#1C2333]/80 uppercase block">
            3. Synthesizing Study Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Unpack how these witnesses correlate. (e.g. 'Both Leviticus is explaining shadow service types that Daniel maps into a large prophetic timeline...')"
            rows={3}
            className="w-full bg-white border border-[#E8E4DA] rounded-lg p-3 text-xs font-serif text-stone-800 placeholder-stone-400 focus:outline-none focus:border-teal-650 leading-relaxed"
            id="cr-notes-input"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={!baseVerse.trim() || isAnalyzing}
          onClick={handleAnalyze}
          className="w-full py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-mono text-[10.5px] uppercase tracking-wider font-extrabold rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-45"
          id="cr-evaluate-btn"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Doctrinal Chain...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Trace Theological Harmony</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {feedbackText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-white border border-teal-100 rounded-xl text-left space-y-2.5 shadow-2xs"
            id="cr-results-display"
          >
            <div className="flex items-center justify-between border-b border-teal-50 pb-1.5">
              <span className="text-[9px] font-mono tracking-wider font-extrabold text-teal-800 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C9973A]" />
                Elder Stephen's Scriptural Synthesizing
              </span>
            </div>
            <div className="text-stone-705 elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased text-xs leading-relaxed space-y-3 whitespace-pre-wrap select-text max-h-[250px] overflow-y-auto pr-1">
              {feedbackText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
