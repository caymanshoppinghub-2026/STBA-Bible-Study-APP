import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, Quote, Send, Loader2, MessageSquare, RefreshCw, BookOpen } from "lucide-react";
import { TtsPlayer } from "../TtsPlayer";
import { askElderStephen } from "../../api/elderStephenApi";
import { useApp } from "../../context/AppContext";
import { STBA_LOGO_URL } from "../../assets/branding";

interface ElderStevenBubbleProps {
  dialogue: string;
  stage: string;
  sectionTitle?: string;
  className?: string;
  id?: string;
  showQuestionInput?: boolean;
  onExplainSubmit?: (userExplanation: string) => void;
}

export const ElderStevenBubble: React.FC<ElderStevenBubbleProps> = ({
  dialogue,
  stage,
  sectionTitle,
  className = "",
  id = "elder-steven-bubble-container",
  showQuestionInput = true,
  onExplainSubmit
}) => {
  const { user } = useApp();
  const userName = user?.name || "Jeremy";

  const [questionText, setQuestionText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [customResponse, setCustomResponse] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-adjust height to fit ~4 lines (96px) and expand smoothly with extra content
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(96, textareaRef.current.scrollHeight)}px`;
    }
  }, [questionText]);

  const isExplainMode = stage === "explain_doctrine";

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionText.trim() || isAsking) return;

    const query = questionText.trim();
    setIsAsking(true);
    try {
      const res = await askElderStephen({
        userMessage: query,
        userName: userName,
        noteTitle: "Fundamental Belief 1: Holy Scriptures",
        currentMode: isExplainMode ? "Explain Mode" : "Pastoral Guide"
      });
      setCustomResponse(res.text);
      if (onExplainSubmit && isExplainMode) {
        onExplainSubmit(query);
      }
    } catch (err) {
      console.error("Error asking Elder Steven:", err);
      setCustomResponse(`Greetings, ${userName}. Thank you for sharing your thoughts. Let us continue studying the Scriptures together.`);
    } finally {
      setIsAsking(false);
    }
  };

  const handleResetCustomResponse = () => {
    setCustomResponse(null);
    setQuestionText("");
  };

  // Parse simple markdown-like syntax for structured CSMS layouts
  const renderFormattedDialogue = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-3.5 text-[#000000] elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] leading-relaxed text-sm antialiased">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Bold Header: **text**
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            const headingText = trimmed.replace(/\*\*/g, "");
            return (
              <h4 key={idx} className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-[#000000] text-sm md:text-base border-b border-[#E8DDC6]/40 pb-1 mt-3 flex items-center gap-1.5 tracking-[0.65px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9973A]"></span>
                <span className="text-[#000000]">{headingText}</span>
              </h4>
            );
          }

          // List item: - **bold**: text or - text
          if (trimmed.startsWith("- ")) {
            const listContent = trimmed.substring(2);
            const boldMatch = listContent.match(/^\*\*(.*?)\*\*:(.*)$/);
            if (boldMatch) {
              return (
                <div key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#C9973A] text-xs sm:text-sm font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] flex flex-col sm:flex-row sm:gap-1 items-start text-[#000000]">
                  <strong className="text-[#000000] font-bold shrink-0 tracking-[0.65px]">{boldMatch[1]}:</strong>
                  <span className="text-[#000000] tracking-[0.65px]">{boldMatch[2]}</span>
                </div>
              );
            }
            
            const boldOnlyMatch = listContent.match(/^\*\*(.*?)\*\*(.*)$/);
            if (boldOnlyMatch) {
              return (
                <div key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#C9973A] text-xs sm:text-sm font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] text-[#000000]">
                  <strong className="text-[#000000] font-bold tracking-[0.65px]">{boldOnlyMatch[1]}</strong>
                  <span className="text-[#000000] tracking-[0.65px]">{boldOnlyMatch[2]}</span>
                </div>
              );
            }

            return (
              <div key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#C9973A] text-xs sm:text-sm font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] text-[#000000]">
                {listContent}
              </div>
            );
          }

          // Accent instructions: *text*
          if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
            const accentText = trimmed.replace(/\*/g, "");
            return (
              <p key={idx} className="text-xs font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold tracking-[0.65px] text-[#000000] bg-[#FAF7F0] border border-[#E8DDC6]/40 p-2.5 rounded-xl text-center italic mt-2 shadow-3xs">
                {accentText}
              </p>
            );
          }

          // Regular paragraph: Parse inline bold **words**
          return (
            <p key={idx} className="leading-relaxed font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] text-xs sm:text-sm text-[#000000]">
              {trimmed.split("**").map((chunk, chunkIdx) => {
                if (chunkIdx % 2 === 1) {
                  return <strong key={chunkIdx} className="text-[#000000] font-bold tracking-[0.65px]">{chunk}</strong>;
                }
                return chunk;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const activeDialogue = customResponse || dialogue;
  const speechId = `steven_${stage}_${customResponse ? "custom" : "stage"}_${activeDialogue.length}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage + (customResponse ? "_custom" : "_default")}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex flex-col items-center gap-4 bg-[#FDFAF5] border border-[#E8DDC6] p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden text-center text-[#000000] ${className}`}
        id={id}
      >
        {/* Visual elegant pattern in background */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#C9973A]/3 rounded-full filter blur-lg pointer-events-none" />

        {/* Header Column: Centered Picture + Name (No Subtitles) */}
        <div className="flex flex-col items-center shrink-0 text-center gap-1.5 w-full border-b border-[#E8DDC6]/40 pb-3">
          {/* Circular Avatar Bubble with gentle pulse animation */}
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 4px 10px rgba(201, 151, 58, 0.1)",
                "0 6px 15px rgba(201, 151, 58, 0.22)",
                "0 4px 10px rgba(201, 151, 58, 0.1)"
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#C9973A] overflow-hidden relative shadow-md bg-stone-100 flex items-center justify-center cursor-pointer mx-auto"
            id="elder-steven-avatar-bubble"
            title="Elder Steven"
          >
            <img
              src={STBA_LOGO_URL}
              alt="Elder Steven - STBA Scholar"
              className="w-full h-full object-cover p-1 bg-[#121824]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallbackEl = document.getElementById("elder-steven-avatar-fallback");
                if (fallbackEl) fallbackEl.style.display = "flex";
              }}
            />
            <div
              id="elder-steven-avatar-fallback"
              className="hidden w-full h-full bg-[#1C2333] flex-col items-center justify-center text-center p-1 text-white"
            >
              <Heart className="w-5 h-5 text-[#C9973A] fill-[#C9973A]/20" />
              <span className="text-[8px] font-mono uppercase font-bold tracking-tight text-white mt-0.5">Steven</span>
            </div>
          </motion.div>

          {/* Centered Name — All subtitles/section titles removed */}
          <h3 className="font-serif font-black text-sm sm:text-base text-[#000000] text-center mt-1">
            Elder Steven
          </h3>
        </div>

        {/* Content & Dialogue Area — Spoken text is left-aligned */}
        <div className="flex-1 space-y-3 text-left w-full text-[#000000]">
          <div className="relative text-left text-[#000000]">
            <Quote className="absolute -left-3.5 -top-3 w-7 h-7 text-[#C9973A]/10 pointer-events-none transform rotate-180" />
            
            <div className="space-y-2 pl-1 text-[#000000]">
              <div className="flex items-center justify-between border-b border-[#E8DDC6]/30 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#C9973A] uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {customResponse ? "Answer to Your Question" : `Mentor Guidance — ${stage.replace(/_/g, " ")}`}
                  </span>
                </div>
                {customResponse && (
                  <button
                    onClick={handleResetCustomResponse}
                    className="text-[10px] font-mono text-[#C9973A] hover:text-[#000000] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Return to stage guidance"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Stage Guidance</span>
                  </button>
                )}
              </div>
              
              <div className="pr-1 text-left text-[#000000] elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased">
                {renderFormattedDialogue(activeDialogue)}
              </div>
            </div>
          </div>

          {/* Audio Player — Centered */}
          <div className="pt-2 border-t border-[#E8DDC6]/35 flex justify-center items-center w-full text-center" id="elder-steven-audio-block">
            <TtsPlayer
              text={activeDialogue}
              messageId={speechId}
              autoPlay={true}
              label="Listen to Elder Steven"
            />
          </div>

          {/* Ask Elder Steven Question or Explain Input — Centered & Auto-expanding */}
          {showQuestionInput && (
            <form onSubmit={handleAskQuestion} className="pt-1.5 w-full flex justify-center" id="elder-steven-question-form">
              <div className="flex flex-col gap-2 bg-white border border-[#E8DDC6] rounded-2xl p-3 sm:p-3.5 shadow-2xs focus-within:border-[#C9973A] transition-colors w-full">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#C9973A]">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#C9973A] shrink-0" />
                    <span>{isExplainMode ? "Explain the Doctrine to Elder Steven:" : "Ask Elder Steven a question:"}</span>
                  </div>
                  {isExplainMode && (
                    <span className="text-[10px] bg-[#C9973A]/10 text-[#C9973A] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                      Active Evaluation
                    </span>
                  )}
                </div>

                <textarea
                  ref={textareaRef}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={
                    isExplainMode
                      ? `Dear Elder Steven, I understand this doctrine of Holy Scriptures to mean...`
                      : `Ask Elder Steven a question about this doctrine...`
                  }
                  rows={4}
                  className="w-full text-xs font-sans text-[#000000] placeholder-stone-400 bg-transparent focus:outline-none resize-none min-h-[96px] max-h-48 p-2.5 whitespace-pre-wrap break-words border border-[#E8DDC6]/60 rounded-xl leading-relaxed overflow-y-auto text-left"
                  disabled={isAsking}
                  id="elder-steven-textarea-input"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-stone-400">
                    {isExplainMode ? "Elder Steven will evaluate your explanation" : "Responds with scriptural guidance"}
                  </span>
                  <button
                    type="submit"
                    disabled={!questionText.trim() || isAsking}
                    className="bg-[#1C2333] hover:bg-[#C9973A] text-white disabled:bg-stone-200 disabled:text-stone-400 px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-3xs"
                    id="elder-steven-send-question-btn"
                    title={isExplainMode ? "Submit explanation" : "Send question"}
                  >
                    {isAsking ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isExplainMode ? "Submit Explanation" : "Send Question"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

