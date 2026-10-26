/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2, Heart, Compass, Zap, BookOpen, Check } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";
import { useApp } from "../../context/AppContext";
import { TtsPlayer } from "../TtsPlayer";
import { STBA_LOGO_URL } from "../../assets/branding";
import { saveResponseAsNewNote } from "../../data/notebookData";

export const ElderStephenPanel: React.FC = () => {
  const appCtx = useApp();

  const {
    elderDiscussion,
    chatWithElderStephen,
    addElderMessage,
    isElderLoading,
    clearElderDiscussion,
    lessonTitle,
    userRole,
    readingFontSize,
    readingTheme
  } = useSabbathSchoolStore();
  
  // Resolve user name cleanly from app context or local profile
  const rawUserName = appCtx?.user?.name?.trim() || (() => {
    try {
      const saved = localStorage.getItem("stba_user_profile");
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.name) return u.name.trim();
      }
    } catch (e) {}
    return "";
  })();

  const isTeacher = userRole === "Teacher" || appCtx?.user?.role === "Teacher";
  
  // Format the name greeting cleanly and respectfully without duplicate role titles
  const resolvedName = rawUserName || (isTeacher ? "Teacher" : "Friend");
  const displayName = isTeacher
    ? (resolvedName.toLowerCase().startsWith("teacher") ? resolvedName : `Teacher ${resolvedName}`)
    : resolvedName;

  const isLight = readingTheme === "light";

  const getBodyFontSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "text-[13px] sm:text-sm leading-relaxed";
      case "md":
        return "text-[15px] sm:text-base leading-relaxed";
      case "lg":
      case "xl":
        return "text-lg sm:text-xl leading-relaxed";
      default:
        return "text-[13px] sm:text-sm leading-relaxed";
    }
  };

  const [inputMsg, setInputMsg] = useState("");
  const [panelCommentaryMode, setPanelCommentaryMode] = useState<"auto" | "velocity" | "prestige">("auto");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greetingTriggeredRef = useRef(false);
  const [shouldAutoPlayGreeting, setShouldAutoPlayGreeting] = useState(false);
  const [savedNoteIndices, setSavedNoteIndices] = useState<Set<number>>(new Set());
  const [savedToast, setSavedToast] = useState<string>("");

  const handleSaveElderMessageAsNote = (text: string, index: number) => {
    try {
      const cleanContent = text
        .replace(/### \d+\.\s*/g, "")
        .replace(/\*\*Summary\*\*/i, "")
        .trim();
      const noteTitle = `Elder Stephen on ${lessonTitle || "Sabbath School"}`;
      saveResponseAsNewNote({
        title: noteTitle,
        content: `# ${noteTitle}\n\n**Lesson Topic:** ${lessonTitle || "Sabbath School"}\n**Teacher Mentor:** Elder Stephen\n**Recorded:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n---\n\n${cleanContent}`,
        summary: cleanContent.slice(0, 240).replace(/[#*`>]/g, "").trim() + "...",
        category: "theology",
        scriptureTags: [lessonTitle || "Sabbath School"]
      });
      setSavedNoteIndices(prev => new Set(prev).add(index));
      setSavedToast("Elder Stephen's response saved to Notebook!");
      setTimeout(() => setSavedToast(""), 3000);
    } catch (err) {
      console.warn("Error saving note:", err);
      setSavedToast("Failed to save note.");
      setTimeout(() => setSavedToast(""), 2000);
    }
  };

  const userIdentifier = appCtx?.user?.email || (appCtx?.user as any)?.id || rawUserName || "session_user";
  const userWelcomeSessionKey = `stba_ss_welcomed_session_${userIdentifier}`;
  const userAudioWelcomeSessionKey = `stba_ss_audio_welcomed_session_${userIdentifier}`;

  // Auto-adjust textarea height based on content (default ~4 lines = 96px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(96, textareaRef.current.scrollHeight)}px`;
    }
  }, [inputMsg]);

  // Initial Audible & Written Personal Greeting on entering Sabbath School (strictly once per login session)
  useEffect(() => {
    let hasBeenWelcomedThisSession = false;
    try {
      if (typeof sessionStorage !== "undefined") {
        hasBeenWelcomedThisSession =
          sessionStorage.getItem(userWelcomeSessionKey) === "true" ||
          sessionStorage.getItem("stba_ss_welcomed") === "true";
      }
    } catch (e) {}

    if (hasBeenWelcomedThisSession) {
      greetingTriggeredRef.current = true;
      return;
    }

    if (greetingTriggeredRef.current) return;
    greetingTriggeredRef.current = true;

    // Record welcome state in sessionStorage for the duration of this login session
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(userWelcomeSessionKey, "true");
        sessionStorage.setItem("stba_ss_welcomed", "true");
      }
    } catch (e) {}

    // Only add initial greeting if discussion is empty
    if (elderDiscussion.length === 0) {
      const greetingText = `Welcome, ${displayName}, to the Sabbath School study mode. I am Elder Stephen, ready to assist you with this week's lesson. If you have any questions, type them in the box below or click the Discuss button.`;

      addElderMessage({ role: "elder", text: greetingText });
      console.log("[ElderStephenPanel] Initialized Sabbath School welcome greeting for:", displayName);

      // Play audio welcome strictly once per session
      const audioAlreadyPlayed = typeof sessionStorage !== "undefined" && sessionStorage.getItem(userAudioWelcomeSessionKey) === "true";
      if (!audioAlreadyPlayed) {
        try {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem(userAudioWelcomeSessionKey, "true");
          }
        } catch (e) {}
        setShouldAutoPlayGreeting(true);
      }
    }
  }, [userWelcomeSessionKey, userAudioWelcomeSessionKey, displayName, elderDiscussion.length, addElderMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [elderDiscussion, isElderLoading, userRole]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isElderLoading) return;
    const msg = inputMsg.trim();
    setInputMsg("");
    setShouldAutoPlayGreeting(false);
    chatWithElderStephen(msg, undefined, panelCommentaryMode);
  };

  const handleClear = () => {
    greetingTriggeredRef.current = false;
    clearElderDiscussion();
  };

  // Render Elder Stephen message in a single clean left-aligned text container (no nested cards or inner sub-boxes)
  const renderElderMessageText = (text: string, msgIndex: number, commentaryMode?: string) => {
    const cleanText = text
      .replace(/### \d+\.\s*/g, "")
      .replace(/\*\*Summary\*\*/i, "")
      .trim();

    const isLatest = msgIndex === elderDiscussion.length - 1;
    const isFirstWelcome = msgIndex === 0 && text.includes("Welcome");
    const autoPlayThis = isLatest && (!isFirstWelcome || shouldAutoPlayGreeting);
    
    // Check if this response is Velocity mode or a short answer that can be deepened into full 6-section exegesis
    const has6SectionStructure = text.includes("### 1.") || text.includes("### Context") || text.includes("### Study Summary") || text.includes("1. Context");
    const isVelocity = commentaryMode === "velocity" || (!has6SectionStructure && !isFirstWelcome);

    return (
      <div className={`space-y-3 text-left w-full transition-all ${isVelocity ? "duration-200" : "duration-500"}`}>
        {!isFirstWelcome && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            {isVelocity ? (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                  isLight
                    ? "bg-sky-50 text-sky-800 border-sky-200"
                    : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                }`}
                title="Velocity Mode · Quick Answer: Fast, concise explanation."
              >
                <Zap size={10} className="text-sky-400" />
                Velocity Mode · Quick Answer
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                  isLight
                    ? "bg-[#FAF5E8] text-[#8C6219] border-[#C9973A]/40"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-xs"
                }`}
                title="Comprehensive Theological Commentary: Sola Scriptura, Greek/Hebrew exegesis, Spirit of Prophecy, and practical application."
              >
                <Sparkles size={10} className="text-amber-400" />
                Comprehensive Commentary
              </span>
            )}
          </div>
        )}

        <p className={`whitespace-pre-wrap elder-stephen-output font-lato font-['Lato',sans-serif] tracking-[0.2px] text-left leading-relaxed antialiased ${getBodyFontSizeClass(readingFontSize)} ${isLight ? "text-[#000000]" : "text-neutral-200"}`}>
          {cleanText}
        </p>

        {isVelocity && !isFirstWelcome && (
          <div className="pt-2.5 mt-2 border-t border-neutral-500/20 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled={isElderLoading}
              onClick={() => {
                const prompt = `Please provide your full 6-section Prestige Commentary, Spirit of Prophecy (Ellen White) references, and Greek/Hebrew exegesis expanding upon this: "${cleanText.slice(0, 240)}"`;
                chatWithElderStephen(prompt, undefined, "prestige");
              }}
              className={`text-xs font-mono font-semibold flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                isLight
                  ? "bg-[#FAF5E8] text-[#8C6219] border-[#C9973A]/40 hover:bg-[#C9973A]/20"
                  : "bg-gradient-to-r from-[#071124] to-[#0E1E42] text-[#F5CF78] border-[#D4A346]/60 hover:border-[#D4A346] hover:bg-[#0E1E42] shadow-2xs"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Expand this answer into full 6-section exegesis and Spirit of Prophecy commentary without retyping"
            >
              <Sparkles size={13} className="text-[#C9973A] animate-pulse" />
              <span>Deepen with Prestige Commentary</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-[#C9973A] border border-amber-500/30">
                Full 6-Section Exegesis
              </span>
            </button>
            <span className="text-[10px] font-mono text-stone-400 dark:text-neutral-400 hidden sm:inline">
              Seamless 1-Click Expansion
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <TtsPlayer
            text={cleanText}
            messageId={`elder-ss-msg-${msgIndex}`}
            autoPlay={autoPlayThis}
            label="Elder Stephen"
          />
          <button
            type="button"
            onClick={() => handleSaveElderMessageAsNote(cleanText, msgIndex)}
            disabled={savedNoteIndices.has(msgIndex)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer shadow-2xs ${
              savedNoteIndices.has(msgIndex)
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 font-bold"
                : isLight
                  ? "bg-white border border-[#C9973A]/60 text-[#8C6219] hover:bg-[#FAF5E8]"
                  : "bg-[#1E2530] border border-[#D4A346]/50 text-amber-300 hover:bg-[#D4A346]/10"
            }`}
            title={
              savedNoteIndices.has(msgIndex)
                ? "Saved to Notebook as note"
                : "Save this response as a new note in your Notebook"
            }
          >
            {savedNoteIndices.has(msgIndex) ? (
              <>
                <Check size={12} className="text-emerald-500 stroke-[2.5]" />
                <span>Saved as Note ✓</span>
              </>
            ) : (
              <>
                <BookOpen size={12} className="text-[#C9973A]" />
                <span>Save as Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      id="elder-stephen-panel"
      className={`flex flex-col h-[600px] sm:h-[650px] border rounded-2xl md:rounded-[20px] shadow-2xs overflow-hidden transition-all ${
        isLight
          ? "bg-white border-[#D4A346]/60 text-[#000000]"
          : "bg-[#161B22] border-[#D4A346]/60 text-neutral-100"
      }`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center px-4 sm:px-5 py-3 border-b shrink-0 ${
          isLight
            ? "bg-[#FAF7F2] border-b border-[#D4A346]/40 text-stone-900"
            : "bg-gradient-to-r from-[#071124] via-[#0E1E42] to-[#071124] border-b border-[#D4A346]/60 text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#C9973A] overflow-hidden relative shadow-2xs bg-[#121824] flex items-center justify-center shrink-0">
            <img
              src={STBA_LOGO_URL}
              alt="Elder Stephen"
              className="w-full h-full object-cover p-0.5"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <Heart size={15} className="text-[#C9973A] fill-[#C9973A]/20 absolute" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-serif font-black text-sm tracking-tight ${isLight ? "text-[#1C2333]" : "text-white"}`}>
                Elder Stephen
              </span>
              <span
                className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${
                  isLight
                    ? "bg-[#C9973A]/10 text-[#A67D2E] border-[#C9973A]/25"
                    : "bg-[#D4A346]/20 text-[#F5CF78] border-[#D4A346]/60 shadow-2xs"
                }`}
              >
                {userRole === "Teacher" ? "Teacher Companion" : "AI Mentor"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            title="Clear conversation logs"
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? "text-stone-400 hover:text-red-600 bg-white hover:bg-red-50 border-[#E5DFD5]"
                : "text-stone-300 hover:text-red-400 bg-white/10 hover:bg-red-950/40 border-[#D4A346]/40"
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {savedToast && (
        <div className="px-4 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-400 text-xs font-mono flex items-center justify-between animate-in fade-in shrink-0">
          <span>{savedToast}</span>
          <Check size={13} className="text-amber-500" />
        </div>
      )}

      {/* Discussion List - Clean Single Text Box Style, Left-Aligned */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 custom-scroll ${
          isLight ? "bg-white" : "bg-[#0D1117]/80"
        }`}
      >
        {elderDiscussion.map((msg, index) => {
          const isElder = msg.role === "elder" || msg.role === "model";
          return (
            <div
              key={index}
              className={`flex flex-col gap-1.5 w-full text-left ${
                isElder ? "items-start mr-auto" : "items-end ml-auto"
              }`}
            >
              <div className={`flex items-center gap-2 ${isElder ? "justify-start text-left" : "justify-end text-left"}`}>
                {isElder && (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isLight
                        ? "bg-[#FAF7F2] border-[#E5DFD5] text-[#C9973A]"
                        : "bg-neutral-950 border-neutral-800 text-amber-400"
                    }`}
                  >
                    <Compass size={11} />
                  </div>
                )}
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? "text-[#A67D2E]" : "text-amber-400"}`}>
                  {isElder ? "Elder Stephen" : displayName}
                </span>
              </div>

              <div
                className={`max-w-[92%] sm:max-w-[88%] p-3 sm:p-3.5 rounded-2xl shadow-2xs text-left ${
                  isElder
                    ? isLight
                      ? "bg-[#FAF7F2] border border-[#E5DFD5] text-[#000000] rounded-tl-none w-full elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased"
                      : "bg-[#1C212B] border border-[#30363D] text-neutral-100 rounded-tl-none w-full elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased"
                    : isLight
                    ? "bg-[#1C2333] border border-[#2D3748] text-stone-100 rounded-tr-none shadow-xs"
                    : "bg-[#1E293B] border border-slate-700/60 text-white rounded-tr-none shadow-xs"
                }`}
              >
                {!isElder ? (
                  <p className={`whitespace-pre-wrap font-sans text-left ${getBodyFontSizeClass(readingFontSize)}`}>
                    {msg.text}
                  </p>
                ) : (
                  renderElderMessageText(msg.text, index, msg.commentaryMode)
                )}
              </div>
            </div>
          );
        })}

        {isElderLoading && (
          <div className="flex flex-col items-start gap-1.5 w-full text-left mr-auto">
            <div className="flex items-center gap-2 justify-start text-left">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 animate-spin ${
                  isLight
                    ? "bg-white border-[#E5DFD5] text-[#C9973A]"
                    : "bg-neutral-950 border-neutral-800 text-amber-400"
                }`}
              >
                <Sparkles size={11} />
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? "text-[#A67D2E]" : "text-amber-400"}`}>
                Elder Stephen
              </span>
            </div>
            <div
              className={`p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 border text-left mr-auto ${
                isLight
                  ? "bg-[#FAF7F2] border-[#E5DFD5] text-stone-600"
                  : "bg-neutral-950 border-neutral-850 text-neutral-400"
              }`}
            >
              <span>Elder Stephen is reflecting on God's Word...</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9973A] animate-ping"></span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Form - Vertically Balanced Textarea Input */}
      <form
        onSubmit={handleSend}
        className={`p-3 sm:p-3.5 border-t flex gap-2.5 shrink-0 items-end ${
          isLight
            ? "bg-[#FAF7F2] border-t border-[#D4A346]/40"
            : "bg-gradient-to-r from-[#071124] via-[#0E1E42] to-[#071124] border-t border-[#D4A346]/60"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Ask Elder Stephen a question about "${lessonTitle}"...`}
          rows={4}
          className={`flex-1 border rounded-xl sm:rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors min-h-[96px] max-h-48 resize-none overflow-y-auto leading-relaxed text-left ${
            isLight
              ? "bg-white border-[#E5DFD5] text-stone-900 placeholder-stone-400 focus:border-[#C9973A]"
              : "bg-[#060e1f]/90 border-[#1B2B48] text-neutral-200 placeholder-neutral-500 focus:border-[#D4A346]/70 focus:ring-1 focus:ring-[#D4A346]/40"
          }`}
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || isElderLoading}
          aria-label="Send message to Elder Stephen"
          className="p-3 bg-white hover:bg-[#FAF7F2] disabled:bg-white/80 text-stone-700 hover:text-stone-950 disabled:text-stone-400 font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 h-[46px] w-[46px] shadow-sm self-end disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
