/**
 * Elder Stephen Persistent State Manager & Discipleship Context
 * 
 * Provides unified, cross-mode persistent conversational state, document topic tracking,
 * and user study flow memory across Notebook, Study (STBA), Doctrine, and Recall modes.
 * 
 * Complies with the Cognitive Scripture Mastery System (CSMS) and SDA theological guidelines.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { callElderStephen, ChatMessagePayload } from "../lib/callElderStephen";
import { ElderStephenMemoryEngine } from "../lib/elderStephenEngine";
import { formatProperElderSpacing, extractScriptureReference } from "../utils/elderSpacing";
import { getElderStephenVoice } from "../components/stba/RightPaneTools";

export type StudyMode =
  | "Notebook"
  | "Study"
  | "Doctrine"
  | "Recall"
  | "Teach"
  | "Syllabus"
  | "Vault"
  | "Dashboard";

export interface ElderStephenMessage {
  id: string;
  sender: "user" | "elder";
  role: "user" | "elder";
  text: string;
  timestamp: string;
  modeOrigin: StudyMode;
  topic?: string;
  passage?: string;
  badge?: string;
  commentaryMode?: "velocity" | "prestige" | "auto";
  noteId?: string;
  trackId?: string;
}

export interface DocumentTopicContext {
  noteId?: string;
  title: string;
  content?: string;
  category?: string;
  tags: string[];
  lastUpdated: string;
  passage?: string;
}

export interface StudyJourneyMilestone {
  id: string;
  mode: StudyMode;
  topic: string;
  passage?: string;
  details?: string;
  timestamp: string;
}

export interface DoctrineContextInfo {
  trackId: string;
  trackTitle: string;
  sectionIndex: number;
  sectionTitle: string;
  keyTexts: string[];
  description?: string;
  egwQuotes?: string[];
}

export interface UserStudyFlow {
  currentMode: StudyMode;
  currentTopic: string;
  currentPassage: string;
  recentTopics: string[];
  recentPassages: string[];
  journey: StudyJourneyMilestone[];
  activeStepIndex?: number;
  activeTab?: string;
  doctrineContext?: DoctrineContextInfo;
}

export interface ElderStephenContextType {
  // State
  messages: ElderStephenMessage[];
  currentTopic: string;
  currentPassage: string;
  currentMode: StudyMode;
  documentContext: DocumentTopicContext | null;
  studyFlow: UserStudyFlow;
  isLoading: boolean;
  isThinking: boolean;
  selectedCommentaryMode: "velocity" | "prestige" | "auto";

  // Voice & Speech state
  speakingMsgId: string | null;
  isDictating: boolean;
  speakMessage: (msgId: string, text: string) => void;
  stopSpeaking: () => void;
  toggleDictation: (onTranscript?: (text: string) => void) => void;

  // Actions
  setStudyMode: (mode: StudyMode) => void;
  setCurrentTopic: (topic: string, passage?: string) => void;
  setCurrentPassage: (passage: string) => void;
  updateDocumentContext: (doc: Partial<DocumentTopicContext> & { title: string }) => void;
  updateDoctrineContext: (doctrine: DoctrineContextInfo) => void;
  recordStudyStep: (step: { mode: StudyMode; topic: string; passage?: string; details?: string }) => void;
  setSelectedCommentaryMode: (mode: "velocity" | "prestige" | "auto") => void;

  // Conversational Actions
  sendMessage: (
    text: string,
    options?: {
      mode?: "velocity" | "prestige" | "auto";
      passage?: string;
      topic?: string;
      overrideMode?: StudyMode;
      badge?: string;
    }
  ) => Promise<string>;

  addElderMessage: (msg: {
    text: string;
    modeOrigin?: StudyMode;
    badge?: string;
    passage?: string;
    topic?: string;
    commentaryMode?: "velocity" | "prestige";
  }) => void;

  addUserMessage: (msg: {
    text: string;
    modeOrigin?: StudyMode;
    passage?: string;
    topic?: string;
  }) => void;

  clearConversation: () => void;
  eraseTopMessage: () => void;
  getContextSummaryString: () => string;
}

const STORAGE_STATE_KEY = "stba_elder_stephen_persistent_state_v2";

const DEFAULT_WELCOME_MESSAGE: ElderStephenMessage = {
  id: "welcome-unified",
  sender: "elder",
  role: "elder",
  text: formatProperElderSpacing(
    "Shalom, my friend. I am Elder Stephen, your pastoral study mentor. Whether you are drafting in your Notebook, analyzing verses in Study Mode, or exploring Biblical Doctrine, I walk beside you to compare Scripture with Scripture line upon line. What passage or question is on your heart today?"
  ),
  timestamp: new Date().toISOString(),
  modeOrigin: "Notebook",
  topic: "Introduction & Welcome"
};

const DEFAULT_STUDY_FLOW: UserStudyFlow = {
  currentMode: "Notebook",
  currentTopic: "Scripture Study & Meditation",
  currentPassage: "2 Timothy 2:15",
  recentTopics: ["Rightly Dividing the Word of Truth"],
  recentPassages: ["2 Timothy 2:15", "Revelation 14:6-12"],
  journey: [
    {
      id: "init-journey",
      mode: "Notebook",
      topic: "Commencing Berean Scripture Study",
      passage: "2 Timothy 2:15",
      details: "Began daily discipleship walkthrough with Elder Stephen",
      timestamp: new Date().toISOString()
    }
  ]
};

const ElderStephenContext = createContext<ElderStephenContextType | undefined>(undefined);

export const ElderStephenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage
  const [messages, setMessages] = useState<ElderStephenMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          return parsed.messages;
        }
      }
      
      // Fallback: check legacy general chat if available
      const legacyGeneral = localStorage.getItem("stba_elder_general");
      if (legacyGeneral) {
        try {
          const parsedLegacy = JSON.parse(legacyGeneral);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            return parsedLegacy.map((m: any, idx: number) => ({
              id: m.id || `migrated-${idx}`,
              sender: m.role === "user" ? "user" : "elder",
              role: m.role === "user" ? "user" : "elder",
              text: formatProperElderSpacing(m.text),
              timestamp: m.timestamp || new Date().toISOString(),
              modeOrigin: "Notebook" as StudyMode,
              topic: "General Study"
            }));
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn("Failed to initialize Elder Stephen messages from storage:", e);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [studyFlow, setStudyFlow] = useState<UserStudyFlow>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studyFlow) {
          return {
            ...DEFAULT_STUDY_FLOW,
            ...parsed.studyFlow
          };
        }
      }
    } catch (e) {
      console.warn("Failed to initialize study flow from storage:", e);
    }
    return DEFAULT_STUDY_FLOW;
  });

  const [documentContext, setDocumentContext] = useState<DocumentTopicContext | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.documentContext) return parsed.documentContext;
      }
    } catch (e) {}
    return null;
  });

  const [selectedCommentaryMode, setSelectedCommentaryMode] = useState<"velocity" | "prestige" | "auto">(() => {
    try {
      const saved = localStorage.getItem("stba_elder_commentary_mode");
      if (saved === "prestige" || saved === "velocity" || saved === "auto") {
        return saved;
      }
    } catch (_) {}
    return "velocity";
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Sync to localStorage whenever messages, studyFlow, or documentContext change
  useEffect(() => {
    try {
      // Keep up to 60 recent messages to prevent storage saturation
      const trimmedMessages = messages.slice(-60);
      const stateToPersist = {
        messages: trimmedMessages,
        studyFlow,
        documentContext,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(stateToPersist));
    } catch (err) {
      console.error("Failed to persist Elder Stephen state:", err);
    }
  }, [messages, studyFlow, documentContext]);

  // Sync with ElderStephenMemoryEngine
  useEffect(() => {
    ElderStephenMemoryEngine.syncSessionContext(
      studyFlow.currentPassage,
      studyFlow.activeStepIndex,
      studyFlow.activeTab || studyFlow.currentMode
    );
  }, [studyFlow.currentPassage, studyFlow.activeStepIndex, studyFlow.activeTab, studyFlow.currentMode]);

  // Text-To-Speech Clean Handling
  const speakMessage = useCallback((msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown and formatting tags for natural speech flow
    const clean = text
      .replace(/[*#_`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.93;
    utter.pitch = 0.86;

    const voice = getElderStephenVoice();
    if (voice) {
      utter.voice = voice;
    }

    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utter);
  }, [speakingMsgId]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  }, []);

  // Web Speech Dictation Handling
  const toggleDictation = useCallback((onTranscript?: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser environment.");
      return;
    }

    if (isDictating) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsDictating(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => setIsDictating(true);
      rec.onresult = (evt: any) => {
        if (evt.results && evt.results[0] && evt.results[0][0]) {
          const transcript = evt.results[0][0].transcript;
          if (onTranscript && transcript) {
            onTranscript(transcript);
          }
        }
      };
      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e.error);
        setIsDictating(false);
      };
      rec.onend = () => setIsDictating(false);

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsDictating(false);
    }
  }, [isDictating]);

  // Mode updates
  const setStudyMode = useCallback((mode: StudyMode) => {
    setStudyFlow(prev => {
      if (prev.currentMode === mode) return prev;
      const milestone: StudyJourneyMilestone = {
        id: `milestone-${Date.now()}`,
        mode,
        topic: prev.currentTopic,
        passage: prev.currentPassage,
        details: `Transitioned to ${mode} mode`,
        timestamp: new Date().toISOString()
      };
      return {
        ...prev,
        currentMode: mode,
        journey: [...prev.journey.slice(-25), milestone]
      };
    });
  }, []);

  // Topic updates
  const setCurrentTopic = useCallback((topic: string, passage?: string) => {
    if (!topic || !topic.trim()) return;
    const cleanTopic = topic.trim();
    const cleanPassage = passage ? passage.trim() : extractScriptureReference(cleanTopic) || undefined;

    setStudyFlow(prev => {
      const recentTopics = [cleanTopic, ...prev.recentTopics.filter(t => t !== cleanTopic)].slice(0, 10);
      const recentPassages = cleanPassage
        ? [cleanPassage, ...prev.recentPassages.filter(p => p !== cleanPassage)].slice(0, 10)
        : prev.recentPassages;

      const milestone: StudyJourneyMilestone = {
        id: `milestone-${Date.now()}`,
        mode: prev.currentMode,
        topic: cleanTopic,
        passage: cleanPassage || prev.currentPassage,
        details: `Engaged study topic: "${cleanTopic}"`,
        timestamp: new Date().toISOString()
      };

      return {
        ...prev,
        currentTopic: cleanTopic,
        currentPassage: cleanPassage || prev.currentPassage,
        recentTopics,
        recentPassages,
        journey: [...prev.journey.slice(-25), milestone]
      };
    });
  }, []);

  // Passage updates
  const setCurrentPassage = useCallback((passage: string) => {
    if (!passage || !passage.trim()) return;
    const cleanPassage = passage.trim();

    setStudyFlow(prev => {
      const recentPassages = [cleanPassage, ...prev.recentPassages.filter(p => p !== cleanPassage)].slice(0, 10);
      return {
        ...prev,
        currentPassage: cleanPassage,
        recentPassages
      };
    });
  }, []);

  // Document context updates (e.g. from Notebook)
  const updateDocumentContext = useCallback((doc: Partial<DocumentTopicContext> & { title: string }) => {
    setDocumentContext(prev => ({
      noteId: doc.noteId || prev?.noteId,
      title: doc.title,
      content: doc.content !== undefined ? doc.content : prev?.content || "",
      category: doc.category || prev?.category || "theology",
      tags: doc.tags || prev?.tags || [],
      lastUpdated: new Date().toISOString(),
      passage: doc.passage || prev?.passage
    }));

    setCurrentTopic(doc.title, doc.passage);
  }, [setCurrentTopic]);

  // Doctrine context updates (e.g. from Doctrine Navigator)
  const updateDoctrineContext = useCallback((doctrine: DoctrineContextInfo) => {
    setStudyFlow(prev => {
      const doctrineTopic = `${doctrine.trackTitle}: ${doctrine.sectionTitle}`;
      const primaryRef = doctrine.keyTexts && doctrine.keyTexts.length > 0 ? doctrine.keyTexts[0] : prev.currentPassage;

      const recentTopics = [doctrineTopic, ...prev.recentTopics.filter(t => t !== doctrineTopic)].slice(0, 10);
      const recentPassages = primaryRef ? [primaryRef, ...prev.recentPassages.filter(p => p !== primaryRef)].slice(0, 10) : prev.recentPassages;

      const milestone: StudyJourneyMilestone = {
        id: `milestone-${Date.now()}`,
        mode: "Doctrine",
        topic: doctrineTopic,
        passage: primaryRef,
        details: `Studied doctrine pillar [${doctrine.trackId}] #${doctrine.sectionIndex + 1}: ${doctrine.sectionTitle}`,
        timestamp: new Date().toISOString()
      };

      return {
        ...prev,
        currentMode: "Doctrine",
        currentTopic: doctrineTopic,
        currentPassage: primaryRef,
        recentTopics,
        recentPassages,
        doctrineContext: doctrine,
        journey: [...prev.journey.slice(-25), milestone]
      };
    });
  }, []);

  // Record discrete study step
  const recordStudyStep = useCallback((step: { mode: StudyMode; topic: string; passage?: string; details?: string }) => {
    setStudyFlow(prev => {
      const milestone: StudyJourneyMilestone = {
        id: `step-${Date.now()}`,
        mode: step.mode,
        topic: step.topic,
        passage: step.passage || prev.currentPassage,
        details: step.details,
        timestamp: new Date().toISOString()
      };
      return {
        ...prev,
        currentMode: step.mode,
        currentTopic: step.topic || prev.currentTopic,
        currentPassage: step.passage || prev.currentPassage,
        journey: [...prev.journey.slice(-25), milestone]
      };
    });
  }, []);

  // Direct manual additions
  const addElderMessage = useCallback((msg: {
    text: string;
    modeOrigin?: StudyMode;
    badge?: string;
    passage?: string;
    topic?: string;
    commentaryMode?: "velocity" | "prestige";
  }) => {
    const formatted = formatProperElderSpacing(msg.text);
    const newMsg: ElderStephenMessage = {
      id: `elder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: "elder",
      role: "elder",
      text: formatted,
      timestamp: new Date().toISOString(),
      modeOrigin: msg.modeOrigin || studyFlow.currentMode,
      badge: msg.badge,
      passage: msg.passage || studyFlow.currentPassage,
      topic: msg.topic || studyFlow.currentTopic,
      commentaryMode: msg.commentaryMode
    };

    setMessages(prev => [...prev, newMsg]);
  }, [studyFlow.currentMode, studyFlow.currentPassage, studyFlow.currentTopic]);

  const addUserMessage = useCallback((msg: {
    text: string;
    modeOrigin?: StudyMode;
    passage?: string;
    topic?: string;
  }) => {
    const newMsg: ElderStephenMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: "user",
      role: "user",
      text: msg.text.trim(),
      timestamp: new Date().toISOString(),
      modeOrigin: msg.modeOrigin || studyFlow.currentMode,
      passage: msg.passage || studyFlow.currentPassage,
      topic: msg.topic || studyFlow.currentTopic
    };

    setMessages(prev => [...prev, newMsg]);
  }, [studyFlow.currentMode, studyFlow.currentPassage, studyFlow.currentTopic]);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        ...DEFAULT_WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const eraseTopMessage = useCallback(() => {
    setMessages(prev => {
      if (prev.length === 0) return [];
      return prev.slice(1);
    });
  }, []);

  // Summary generation helper for prompts
  const getContextSummaryString = useCallback((): string => {
    const mode = studyFlow.currentMode;
    const topic = studyFlow.currentTopic || "Scripture Study";
    const passage = studyFlow.currentPassage || "2 Timothy 2:15";
    
    // User study flow journey snippet
    const recentMilestones = studyFlow.journey
      .slice(-4)
      .map(m => `[${m.mode}: ${m.topic}${m.passage ? ` (${m.passage})` : ""}]`)
      .join(" -> ");

    let contextDetails = `Current Active Mode: ${mode} | Active Topic: "${topic}" | Active Scripture: ${passage}`;

    if (recentMilestones) {
      contextDetails += ` | User Study Journey Flow: ${recentMilestones}`;
    }

    if (documentContext && documentContext.title) {
      contextDetails += ` | Notebook Document: "${documentContext.title}" (Category: ${documentContext.category || "Theology"}, Tags: ${documentContext.tags?.join(", ") || "None"})`;
    }

    if (studyFlow.doctrineContext) {
      contextDetails += ` | Doctrine Track: "${studyFlow.doctrineContext.trackTitle}" - Section: "${studyFlow.doctrineContext.sectionTitle}" (Key Texts: ${studyFlow.doctrineContext.keyTexts?.join(", ")})`;
    }

    return contextDetails;
  }, [studyFlow, documentContext]);

  // Main unified chat dispatcher across Notebook, Study, Doctrine
  const sendMessage = useCallback(async (
    text: string,
    options?: {
      mode?: "velocity" | "prestige" | "auto";
      passage?: string;
      topic?: string;
      overrideMode?: StudyMode;
      badge?: string;
    }
  ): Promise<string> => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return "";

    const activeMode = options?.overrideMode || studyFlow.currentMode;
    const activePassage = options?.passage || extractScriptureReference(trimmed) || studyFlow.currentPassage;
    const activeTopic = options?.topic || studyFlow.currentTopic;
    const commentaryMode = options?.mode || selectedCommentaryMode;

    // 1. Append user message immediately
    const userMsg: ElderStephenMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
      modeOrigin: activeMode,
      topic: activeTopic,
      passage: activePassage
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Prepare history log from continuous conversation (exclude welcoming prompt)
      const historyLog: ChatMessagePayload[] = messages
        .filter(m => !m.id.startsWith("welcome"))
        .slice(-16)
        .map(m => ({
          role: m.role === "user" ? ("user" as const) : ("elder" as const),
          text: m.text,
          timestamp: m.timestamp
        }));

      // Add current user message
      historyLog.push({
        role: "user" as const,
        text: trimmed,
        timestamp: userMsg.timestamp
      });

      // 3. Build rich cross-mode context summary
      const contextSummary = getContextSummaryString();

      // 4. Send to backend Elder Stephen engine
      const response = await callElderStephen({
        currentMode: activeMode === "Study" ? "STBA" : activeMode === "Doctrine" ? "Explain" : activeMode,
        noteTitle: activeTopic,
        noteContent: documentContext?.content || (studyFlow.doctrineContext ? `Doctrine: ${studyFlow.doctrineContext.sectionTitle}\nDescription: ${studyFlow.doctrineContext.description || ""}\nTexts: ${studyFlow.doctrineContext.keyTexts?.join(", ")}` : ""),
        contextSummary,
        passage: activePassage,
        historyLog,
        userAction: trimmed,
        commentaryMode: commentaryMode === "auto" ? "prestige" : commentaryMode
      });

      const cleanResponseText = formatProperElderSpacing(response.text);

      // 5. Append Elder Stephen's pastoral answer to continuous context
      const elderMsg: ElderStephenMessage = {
        id: `elder-${Date.now()}`,
        sender: "elder",
        role: "elder",
        text: cleanResponseText,
        timestamp: new Date().toISOString(),
        modeOrigin: activeMode,
        topic: activeTopic,
        passage: activePassage,
        badge: options?.badge || (activeMode === "Doctrine" ? "Doctrine Guidance" : activeMode === "Study" ? "Exegesis Insight" : "Pastoral Study"),
        commentaryMode: response.commentaryMode || (commentaryMode === "velocity" ? "velocity" : "prestige")
      };

      setMessages(prev => [...prev, elderMsg]);

      // 6. Record study milestone in flow
      recordStudyStep({
        mode: activeMode,
        topic: activeTopic,
        passage: activePassage,
        details: `Elder Stephen consultation on "${activeTopic}" (${activePassage})`
      });

      setIsLoading(false);
      return cleanResponseText;
    } catch (err) {
      console.error("Elder Stephen conversation error:", err);
      const fallbackText = formatProperElderSpacing(
        `### Pastoral Reflection on ${activePassage}\n\n* As *2 Timothy 2:15* reminds us, we are called to rightly divide the Word of truth. Christ stands as our High Priest in the heavenly sanctuary, ministering grace to every seeking heart.\n* Continue searching the Scriptures line upon line (*Isaiah 28:10*), trusting the Holy Spirit to guide you into all truth.`
      );

      const errorMsg: ElderStephenMessage = {
        id: `elder-err-${Date.now()}`,
        sender: "elder",
        role: "elder",
        text: fallbackText,
        timestamp: new Date().toISOString(),
        modeOrigin: activeMode,
        topic: activeTopic,
        passage: activePassage,
        badge: "Pastoral Reflection"
      };

      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
      return fallbackText;
    }
  }, [
    isLoading,
    studyFlow.currentMode,
    studyFlow.currentPassage,
    studyFlow.currentTopic,
    selectedCommentaryMode,
    messages,
    getContextSummaryString,
    documentContext,
    studyFlow.doctrineContext,
    recordStudyStep
  ]);

  const value: ElderStephenContextType = {
    messages,
    currentTopic: studyFlow.currentTopic,
    currentPassage: studyFlow.currentPassage,
    currentMode: studyFlow.currentMode,
    documentContext,
    studyFlow,
    isLoading,
    isThinking: isLoading,
    selectedCommentaryMode,
    speakingMsgId,
    isDictating,
    speakMessage,
    stopSpeaking,
    toggleDictation,
    setStudyMode,
    setCurrentTopic,
    setCurrentPassage,
    updateDocumentContext,
    updateDoctrineContext,
    recordStudyStep,
    setSelectedCommentaryMode,
    sendMessage,
    addElderMessage,
    addUserMessage,
    clearConversation,
    eraseTopMessage,
    getContextSummaryString
  };

  return (
    <ElderStephenContext.Provider value={value}>
      {children}
    </ElderStephenContext.Provider>
  );
};

export function useElderStephen(): ElderStephenContextType {
  const context = useContext(ElderStephenContext);
  if (!context) {
    throw new Error("useElderStephen must be used within an ElderStephenProvider");
  }
  return context;
}
