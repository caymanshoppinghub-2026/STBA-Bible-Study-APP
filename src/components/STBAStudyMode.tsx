import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Layers, Volume2, HelpCircle, BookMarked, MessageSquare, 
  Settings, User, ChevronLeft, ChevronRight, PanelRightClose, PanelRight,
  Sun, Moon, Compass, Loader2, Sparkles, Sidebar, Search, FileText,
  ChevronDown, ChevronUp, Database
} from "lucide-react";
import { ParallelBibleReader } from "./stba/ParallelBibleReader";
import { parseScriptureLookup } from "./stba/bibleMetadata";
import { ViewModeToggle, ViewMode } from "./stba/ViewModeToggle";
import { 
  ElderStephenCommentary, STBANotebook, CSMSActiveRecall, 
  WordStudy, CrossReferenceEngine, VisualReaderTools, 
  SDABibleCommentary, LessonReview, SyllabusModeView 
} from "./stba/RightPaneTools";
import { useApp } from "../context/AppContext";
import { useElderStephen } from "../context/ElderStephenContext";
import { ElderStephenMemoryEngine } from "../lib/elderStephenEngine";
import { StorageManagerModal } from "./stba/StorageManagerModal";
import { stbaStorage } from "../lib/storage/indexedDbClient";
import { PRESET_BIBLES } from "./stba/bibleData";
import { BIBLE_PRESETS } from "../services/bibleService";
import { PRELOADED_SDABC_DATA } from "./stba/SDABibleCommentary";
import { panelSyncBus } from "../lib/storage/panelSyncChannel";

export function STBAStudyMode() {
  const { user, showConfetti } = useApp();
  const { setStudyMode, setCurrentPassage, setCurrentTopic, recordStudyStep } = useElderStephen();

  // Theme state: default to Light Mode
  const [theme, setTheme] = useState<"light" | "dark">((() => {
    const saved = localStorage.getItem(`stba_theme_${user?.email || "guest"}`);
    return (saved as "light" | "dark") || "light";
  }));
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [bibleFontSize, setBibleFontSize] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_bibleFontSize_${user?.email || "guest"}`);
    return saved !== null ? Number(saved) : 14;
  });
  const [notebookFontSize, setNotebookFontSize] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_notebookFontSize_${user?.email || "guest"}`);
    return saved !== null ? Number(saved) : 14;
  });
  
  // Layout splits & responsive collapses
  const [leftPaneWidth, setLeftPaneWidth] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_leftPaneWidth_${user?.email || "guest"}`);
    return saved !== null ? Number(saved) : 55;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(`stba_rightPanelCollapsed_${user?.email || "guest"}`);
    return saved === "true";
  });
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(`stba_viewMode_${user?.email || "guest"}`);
    if (saved === "bible" || saved === "tools" || saved === "split") return saved as ViewMode;
    const savedCollapsed = localStorage.getItem(`stba_rightPanelCollapsed_${user?.email || "guest"}`);
    if (savedCollapsed === "true") return "bible";
    return "split";
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (mode === "bible") {
      setRightPanelCollapsed(true);
    } else {
      setRightPanelCollapsed(false);
    }
    const userKey = user?.email || "guest";
    localStorage.setItem(`stba_viewMode_${userKey}`, mode);
    localStorage.setItem(`stba_rightPanelCollapsed_${userKey}`, mode === "bible" ? "true" : "false");
  };

  const handleTabClick = (tabKey: any) => {
    setActiveRightTab(tabKey);
    if (viewMode === "bible") {
      setViewMode("split");
    } else {
      setRightPanelCollapsed(false);
    }
  };
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Active studied exegesis report state
  const [report, setReport] = useState<any>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return null;
    const saved = localStorage.getItem(`stba_last_study_report_${user?.email || "guest"}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Sidebar tabs mapping
  const [activeRightTab, setActiveRightTab] = useState<"stephen" | "notebook" | "csms" | "word" | "xref" | "visual" | "review" | "syllabus">(() => {
    const saved = localStorage.getItem(`stba_activeRightTab_${user?.email || "guest"}`);
    return (saved as any) || "csms";
  });

  // Input states - start empty as per instructions
  const [queryRef, setQueryRef] = useState<string>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return pendingRef;
    const saved = localStorage.getItem(`stba_queryRef_${user?.email || "guest"}`);
    return saved || "";
  });
  const [queryTopic, setQueryTopic] = useState<string>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) {
      return localStorage.getItem("stba_pending_search_topic") || "";
    }
    const saved = localStorage.getItem(`stba_queryTopic_${user?.email || "guest"}`);
    return saved || "";
  });

  // Custom Bible panel passage override states
  const [customVerses, setCustomVerses] = useState<any[] | null>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return null;
    const saved = localStorage.getItem(`stba_customVerses_${user?.email || "guest"}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [customReference, setCustomReference] = useState<string | null>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return null;
    const saved = localStorage.getItem(`stba_customReference_${user?.email || "guest"}`);
    return saved || null;
  });
  const [debugStatus, setDebugStatus] = useState<any>(null);

  // Background in-depth theological synthesis engine states
  const [isExegesisSynthesizing, setIsExegesisSynthesizing] = useState(false);
  const [synthesizingVerseRef, setSynthesizingVerseRef] = useState<string>("");
  const [activeTopicSearch, setActiveTopicSearch] = useState<string | null>(null);

  // Search Field Priority: tracks which search field was most recently used/edited ('ref' | 'topic')
  const [lastActiveSearchField, setLastActiveSearchField] = useState<'ref' | 'topic'>('ref');

  // Topical Word Search pagination states
  const [topicPage, setTopicPage] = useState<number>(1);
  const [hasMoreTopicVerses, setHasMoreTopicVerses] = useState<boolean>(false);
  const [loadingMoreTopicVerses, setLoadingMoreTopicVerses] = useState<boolean>(false);

  // Global Header Collapse State
  const [globalHeaderCollapsed, setGlobalHeaderCollapsedState] = useState(false);

  const setGlobalHeaderCollapsed = (val: boolean) => {
    setGlobalHeaderCollapsedState(val);
    const userKey = user?.email || "anonymous";
    localStorage.setItem(`stba_globalHeaderCollapsed_${userKey}`, val ? "true" : "false");
  };

  const [storageModalOpen, setStorageModalOpen] = useState(false);

  // Background IndexedDB theological repository pre-seeding
  useEffect(() => {
    stbaStorage.seedInitialTheologicalData(PRESET_BIBLES, BIBLE_PRESETS, PRELOADED_SDABC_DATA).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/study/debug-status")
      .then((r) => r.json())
      .then((data) => setDebugStatus(data))
      .catch((e) => console.warn("Debug status failed", e));
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTopicRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedRef = useRef("");
  const lastFetchedTopic = useRef("");

  // Interaction handlers for floating selection toolbar
  const [addedNoteText, setAddedNoteText] = useState("");
  const [addedNoteRef, setAddedNoteRef] = useState("");
  const [stephenPendingPrompt, setStephenPendingPrompt] = useState("");

  const handleAddNoteFromText = (text: string, refNotes: string) => {
    setAddedNoteText(text);
    setAddedNoteRef(refNotes);
    setActiveRightTab("notebook");
  };

  const handleSendToStephen = (promptText: string) => {
    setStephenPendingPrompt(promptText);
    setActiveRightTab("stephen");
    setRightPanelCollapsed(false);
  };

  const handleWordStudyTrigger = (word: string) => {
    setSelectedWord(word);
    setActiveRightTab("word");
    setRightPanelCollapsed(false);
  };

  // Preset Tracks configuration
  const PRESET_TRACKS = [
    { label: "Revelation 14:6-12", ref: "Revelation 14:6-12", topic: "The Three Angels' Messages" },
    { label: "Hebrews 8:1-5", ref: "Hebrews 8:1-5", topic: "The Great High Priest & Sanctuary Code" },
    { label: "Romans 12:1-2", ref: "Romans 12:1-2", topic: "The Living Sanctuary Sacrifice" },
    { label: "Daniel 8:14", ref: "Daniel 8:14", topic: "The Cleansing of the Sanctuary Timeline" }
  ];

  // Active study parameters
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return null;
    const saved = localStorage.getItem(`stba_activeVerseIndex_${user?.email || "guest"}`);
    return (saved !== null && saved !== "null") ? Number(saved) : null;
  });

  // Background in-depth theological synthesis engine — only invoked when a verse is clicked
  const triggerBackgroundTheologicalSynthesis = async (targetRef: string, topicName: string) => {
    if (!targetRef.trim()) return;
    const cleanRef = targetRef.trim();
    const cleanTopic = topicName.trim() || "Scripture Study";

    // If report is already loaded for this exact reference, do nothing
    if (report && report.reference.toLowerCase() === cleanRef.toLowerCase()) {
      return;
    }

    // Check cache first for instant reload
    const matchKey = `${cleanRef.toLowerCase()}|||${cleanTopic.toLowerCase()}`;

    // 1. Check IndexedDB persistent study resource cache (< 2ms, zero server traffic)
    try {
      const idbCached = await stbaStorage.getStudyResource("exegesis_report", matchKey);
      if (idbCached) {
        setReport(idbCached);
        setActiveStepIndex(0);
        showConfetti('search');

        const greeting = `We are studying ${idbCached.reference} (${idbCached.topic || cleanTopic}). We are in Step 1: Read & Literal Baselines. What are your initial exegesis observations on this verse?`;
        setStepChats((prev) => {
          const copy = [...prev];
          copy[0] = [{ sender: "ai", text: greeting }];
          return copy;
        });
        return;
      }
    } catch (e) {
      // Non-fatal
    }

    const userKey = user?.email || "guest";
    const cacheKey = `stba_study_exegesis_cache_${userKey}`;
    let cachedList: any[] = [];
    try {
      const stored = localStorage.getItem(cacheKey);
      cachedList = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("Error reading exegesis cache", e);
    }

    const cachedEntry = cachedList.find(c => `${c.reference.toLowerCase()}|||${(c.topic || "").toLowerCase()}` === matchKey);

    if (cachedEntry) {
      setReport(cachedEntry);
      setActiveStepIndex(0);
      showConfetti('search');

      const greeting = `We are studying ${cachedEntry.reference} (${cachedEntry.topic || cleanTopic}). We are in Step 1: Read & Literal Baselines. What are your initial exegesis observations on this verse?`;
      setStepChats((prev) => {
        const copy = [...prev];
        copy[0] = [{ sender: "ai", text: greeting }];
        return copy;
      });
      return;
    }

    setIsExegesisSynthesizing(true);
    setSynthesizingVerseRef(cleanRef);

    try {
      const response = await fetch("/api/study/exegesis-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: cleanRef, topic: cleanTopic })
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setActiveStepIndex(0);
        showConfetti('search');

        // Persist to IndexedDB
        stbaStorage.saveStudyResource("exegesis_report", matchKey, data, cleanRef).catch(() => {});

        // Save to cache (limit 6)
        const filteredCache = cachedList.filter(c => `${c.reference.toLowerCase()}|||${(c.topic || "").toLowerCase()}` !== matchKey);
        const updatedCache = [data, ...filteredCache].slice(0, 6);
        localStorage.setItem(cacheKey, JSON.stringify(updatedCache));

        const greeting = `We are studying ${data.reference} (${data.topic}). We are currently in Step 1: Read & Literal Baselines. What are your initial exegesis observations?`;
        setStepChats((prev) => {
          const copy = [...prev];
          copy[0] = [{ sender: "ai", text: greeting }];
          return copy;
        });
      }
    } catch (err) {
      console.warn("Background theological synthesis failed:", err);
    } finally {
      setIsExegesisSynthesizing(false);
      setSynthesizingVerseRef("");
    }
  };

  const handleVerseSelect = (idx: number | null, verseRef?: string, verseObj?: any) => {
    setActiveVerseIndex(idx);
    if (idx !== null) {
      setRightPanelCollapsed(false);

      // Determine the canonical reference of the selected verse
      let targetRef = verseRef || (verseObj?.reference);
      if (!targetRef) {
        const found = customVerses?.find((v: any) => v.verseNumber === idx);
        if (found?.reference) {
          targetRef = found.reference;
        } else if (customReference && !customReference.startsWith("Search:") && !customReference.startsWith("Topic:")) {
          const colonIdx = customReference.indexOf(":");
          const baseBookChapter = colonIdx !== -1 ? customReference.substring(0, colonIdx) : customReference;
          targetRef = `${baseBookChapter}:${idx}`;
        } else if (report?.reference) {
          const colonIdx = report.reference.indexOf(":");
          const baseBookChapter = colonIdx !== -1 ? report.reference.substring(0, colonIdx) : report.reference;
          targetRef = `${baseBookChapter}:${idx}`;
        }
      }

      if (targetRef) {
        // Activate the in-depth theological synthesis engine in the background
        triggerBackgroundTheologicalSynthesis(targetRef, queryTopic || activeTopicSearch || (report?.topic) || "Scripture Study");
      }
    }
  };
  const [activeStepIndex, setActiveStepIndex] = useState<number>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return 0;
    const saved = localStorage.getItem(`stba_activeStepIndex_${user?.email || "guest"}`);
    return saved !== null ? Number(saved) : 0;
  });
  const [chatInputs, setChatInputs] = useState<string[]>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return Array(7).fill("");
    const saved = localStorage.getItem(`stba_chatInputs_${user?.email || "guest"}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return Array(7).fill("");
  });
  const [stepChats, setStepChats] = useState<{ sender: "user" | "ai"; text: string }[][]>(() => {
    const pendingRef = localStorage.getItem("stba_pending_search_ref");
    if (pendingRef) return Array(7).fill([]);
    const saved = localStorage.getItem(`stba_stepChats_${user?.email || "guest"}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return Array(7).fill([]);
  });
  const [chatLoading, setChatLoading] = useState(false);

  // Standard Draggable resizer mechanism
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const xPercent = (e.clientX / window.innerWidth) * 100;
      if (xPercent > 25 && xPercent < 75) {
        setLeftPaneWidth(Math.round(xPercent));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Fetch passage from reference dynamically with KJV, NKJV, ESV, and NASB
  const triggerFetchPassage = async (ref: string) => {
    if (!ref.trim()) return;
    try {
      lastFetchedRef.current = ref.toLowerCase().trim();
      const response = await fetch("/api/study/fetch-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref })
      });
      if (!response.ok) {
        throw new Error("Failed to fetch custom passage.");
      }
      const data = await response.json();
      if (data.valid) {
        setCustomVerses(data.verses);
        setCustomReference(data.canonicalReference);
        setErrorMsg("");
      } else {
        setErrorMsg(data.error || "Invalid scripture reference.");
      }
    } catch {
      setErrorMsg("Error parsing Bible reference.");
    }
  };

  // Cross-panel reactive synchronization listener (< 1ms inter-panel sync)
  useEffect(() => {
    const unsubPassage = panelSyncBus.subscribe("PASSAGE_LOADED", (payload: any) => {
      if (!payload || payload.source === "STBAStudyMode") return;
      if (payload.reference && payload.reference.toLowerCase().trim() !== lastFetchedRef.current) {
        triggerFetchPassage(payload.reference);
      }
    });

    const unsubVerse = panelSyncBus.subscribe("VERSE_SELECTED", (payload: any) => {
      if (!payload || payload.source === "STBAStudyMode") return;
      if (typeof payload.verseNumber === "number") {
        setActiveVerseIndex(payload.verseNumber);
      }
    });

    return () => {
      unsubPassage();
      unsubVerse();
    };
  }, []);

  const handleNavigateVerse = async (newRef: string, newVerseNum: number) => {
    if (!newRef.trim()) return;
    try {
      lastFetchedRef.current = newRef.toLowerCase().trim();
      const response = await fetch("/api/study/fetch-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: newRef })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setCustomVerses(data.verses);
          setCustomReference(data.canonicalReference);
          
          setReport(prev => {
            if (!prev) {
              return {
                reference: data.canonicalReference,
                topic: "Custom Scripture Study",
                step1: { summary: "", translations: data.verses },
                step2: { genre: "Covenant Sanctuary Truth" }
              };
            }
            return {
              ...prev,
              reference: data.canonicalReference,
              step1: {
                ...prev.step1,
                translations: data.verses
              }
            };
          });

          setActiveVerseIndex(newVerseNum);
          setRightPanelCollapsed(false);
          setErrorMsg("");
        } else {
          setErrorMsg(data.error || "Could not load scripture passage.");
        }
      }
    } catch (err) {
      console.warn("Navigation fetch failed:", err);
      setErrorMsg("Error navigating scripture reference.");
    }
  };

  // Fetch topic/keywords, performing full Bible word search from Genesis to Revelation
  // Returns ~10-15 verses at a time, loading more as user scrolls.
  // Note: Only loads verses into the Bible panel, DOES NOT launch heavy exegesis until verse click!
  const triggerFetchTopicTheme = async (topicVal: string, page = 1, append = false) => {
    if (!topicVal.trim()) return;
    const cleanTopic = topicVal.trim();
    if (append) {
      setLoadingMoreTopicVerses(true);
    } else {
      setLoading(true);
      setErrorMsg("");
      setActiveTopicSearch(cleanTopic);
      setActiveVerseIndex(null); // No verse selected initially!
    }

    try {
      const response = await fetch("/api/study/topic-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: cleanTopic, page, limit: 12 })
      });
      if (!response.ok) {
        throw new Error("Failed to search Bible registry.");
      }
      const data = await response.json();
      if (data.valid && Array.isArray(data.verses) && data.verses.length > 0) {
        if (append) {
          setCustomVerses(prev => {
            const prevList = prev || [];
            const existingRefs = new Set(prevList.map((v: any) => v.reference));
            const newVerses = data.verses.filter((v: any) => !existingRefs.has(v.reference));
            return [...prevList, ...newVerses];
          });
        } else {
          setCustomVerses(data.verses);
          setCustomReference(`Topic: ${cleanTopic}`);
          showConfetti('search');
        }
        setTopicPage(page);
        setHasMoreTopicVerses(Boolean(data.hasMore));
        setErrorMsg("");
      } else {
        if (!append) {
          setErrorMsg(data.error || `No verses found for topic "${cleanTopic}". Try a different keyword.`);
        }
        setHasMoreTopicVerses(false);
      }
    } catch {
      if (!append) {
        setErrorMsg("Error executing Bible keyword search.");
      }
    } finally {
      if (append) {
        setLoadingMoreTopicVerses(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleLoadMoreTopicVerses = () => {
    if (hasMoreTopicVerses && !loadingMoreTopicVerses && activeTopicSearch) {
      triggerFetchTopicTheme(activeTopicSearch, topicPage + 1, true);
    }
  };

  // Scripture & Topic Search Handler with Search Field Priority & Intuitive Scripture Lookup
  const handleLoadExegesis = async (finalRef: string, finalTopic: string) => {
    const trimmedRef = (finalRef || "").trim();
    const trimmedTopic = (finalTopic || "").trim();

    // 1. Search Field Priority:
    // When both a Bible text and a topic are entered, prioritize the most recently used search field!
    let searchMode: 'ref' | 'topic' = 'ref';

    if (trimmedRef && trimmedTopic) {
      searchMode = lastActiveSearchField;
    } else if (trimmedTopic && !trimmedRef) {
      searchMode = 'topic';
    } else if (trimmedRef && !trimmedTopic) {
      // Check if trimmedRef is an actual scripture reference (e.g. Genesis, John 1:3, John 3:16-20)
      const lookup = parseScriptureLookup(trimmedRef);
      if (lookup) {
        searchMode = 'ref';
      } else {
        // User typed a topical word like "Grace" or "Faith" into the reference field
        searchMode = 'topic';
      }
    } else {
      setErrorMsg("Please provide a scripture reference or search topic.");
      return;
    }

    if (searchMode === 'topic') {
      const topicVal = trimmedTopic || trimmedRef;
      setQueryTopic(topicVal);
      setTopicPage(1);
      setHasMoreTopicVerses(false);
      triggerFetchTopicTheme(topicVal, 1, false);
      return;
    }

    // 2. Scripture-Specific Search:
    // Handle scripture lookups intuitively:
    // - Vague reference ('Genesis') -> defaults to Genesis 1:1 and loads first 20 verses
    // - Specific reference ('John 1:3') -> displays that exact verse
    // - Range ('John 3:16-20') -> displays all verses in the range
    const lookup = parseScriptureLookup(trimmedRef);
    const targetRef = lookup ? lookup.canonicalRef : trimmedRef;

    setLoading(true);
    setErrorMsg("");
    setActiveTopicSearch(null);

    try {
      const passageRes = await fetch("/api/study/fetch-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: targetRef })
      });

      if (passageRes.ok) {
        const passageData = await passageRes.json();
        if (passageData.valid) {
          setCustomVerses(passageData.verses);
          setCustomReference(passageData.canonicalReference);

          // If the user specified an exact single verse (e.g. 'John 1:3'), select that verse and launch synthesis
          if (lookup?.isSingleVerse && passageData.verses.length === 1) {
            const vNum = passageData.verses[0].verseNumber;
            setActiveVerseIndex(vNum);
            triggerBackgroundTheologicalSynthesis(passageData.canonicalReference, trimmedTopic || "Scripture Study");
          } else {
            // For vague references ('Genesis') or ranges ('John 3:16-20'), do not lock or activate synthesis yet
            // Wait for user to click on a specific verse to activate synthesis
            setActiveVerseIndex(null);
          }

          showConfetti('search');
        } else {
          setErrorMsg(passageData.error || "Could not parse scripture reference.");
        }
      } else {
        setErrorMsg("Failed to fetch scripture passage.");
      }
    } catch (err) {
      setErrorMsg("Error loading scripture passage.");
    } finally {
      setLoading(false);
    }
  };

  // Handle guided exegesis step chat
  const handleSendGuidedChat = async () => {
    if (!report) return;
    const currentInput = chatInputs[activeStepIndex]?.trim();
    if (!currentInput) return;

    const currentChats = stepChats[activeStepIndex] || [];
    const updatedChats = [...currentChats, { sender: "user" as const, text: currentInput }];

    // Clear active text input 
    setChatInputs(prev => {
      const copy = [...prev];
      copy[activeStepIndex] = "";
      return copy;
    });

    setStepChats(prev => {
      const copy = [...prev];
      copy[activeStepIndex] = updatedChats;
      return copy;
    });

    setChatLoading(true);

    try {
      const response = await fetch("/api/study/exegesis-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: report.reference,
          topic: report.topic,
          activeStep: activeStepIndex,
          stepName: `Step ${activeStepIndex + 1}`,
          messages: updatedChats,
          reportContext: report,
          userName: user?.name || "Scholar"
        })
      });

      if (!response.ok) throw new Error("Dialogue failed");

      const resJson = await response.json();
      setStepChats(prev => {
        const copy = [...prev];
        copy[activeStepIndex] = [...updatedChats, { sender: "ai", text: resJson.reply }];
        return copy;
      });
    } catch (e) {
      const delayReply = `The exegesis scholar is analyzing indices. Your input aligns with our historic Seventh-day Adventist sanctuary studies. Let us press forward on this step!`;
      setStepChats(prev => {
        const copy = [...prev];
        copy[activeStepIndex] = [...updatedChats, { sender: "ai", text: delayReply }];
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Save active study session properties to localStorage
  useEffect(() => {
    const userKey = user?.email || "guest";
    localStorage.setItem(`stba_queryRef_${userKey}`, queryRef);
    localStorage.setItem(`stba_queryTopic_${userKey}`, queryTopic);
    localStorage.setItem(`stba_activeRightTab_${userKey}`, activeRightTab);
    localStorage.setItem(`stba_rightPanelCollapsed_${userKey}`, rightPanelCollapsed ? "true" : "false");
    
    if (report) {
      localStorage.setItem(`stba_last_study_report_${userKey}`, JSON.stringify(report));
    } else {
      localStorage.removeItem(`stba_last_study_report_${userKey}`);
    }
    
    if (customReference) {
      localStorage.setItem(`stba_customReference_${userKey}`, customReference);
    } else {
      localStorage.removeItem(`stba_customReference_${userKey}`);
    }

    if (customVerses) {
      localStorage.setItem(`stba_customVerses_${userKey}`, JSON.stringify(customVerses));
    } else {
      localStorage.removeItem(`stba_customVerses_${userKey}`);
    }

    // Save newly tracked study workspace states
    localStorage.setItem(`stba_activeVerseIndex_${userKey}`, activeVerseIndex !== null ? String(activeVerseIndex) : "null");
    localStorage.setItem(`stba_activeStepIndex_${userKey}`, String(activeStepIndex));
    localStorage.setItem(`stba_chatInputs_${userKey}`, JSON.stringify(chatInputs));
    localStorage.setItem(`stba_stepChats_${userKey}`, JSON.stringify(stepChats));
    localStorage.setItem(`stba_theme_${userKey}`, theme);
    localStorage.setItem(`stba_bibleFontSize_${userKey}`, String(bibleFontSize));
    localStorage.setItem(`stba_notebookFontSize_${userKey}`, String(notebookFontSize));
    localStorage.setItem(`stba_leftPaneWidth_${userKey}`, String(leftPaneWidth));

  }, [
    queryRef, 
    queryTopic, 
    report, 
    customReference, 
    customVerses, 
    activeRightTab, 
    rightPanelCollapsed, 
    activeVerseIndex,
    activeStepIndex,
    chatInputs,
    stepChats,
    theme,
    bibleFontSize,
    leftPaneWidth,
    user
  ]);

  // Continuously sync Elder Stephen persistent session intelligence and state manager
  useEffect(() => {
    setStudyMode("Study");
    const activePassage = report?.reference || queryRef || "General Passage";
    const activeTopic = report?.topic || queryTopic || (activePassage !== "General Passage" ? `Exegesis on ${activePassage}` : "Scripture Study");
    setCurrentPassage(activePassage);
    setCurrentTopic(activeTopic, activePassage);
    ElderStephenMemoryEngine.syncSessionContext(activePassage, activeStepIndex, activeRightTab);
  }, [report, queryRef, queryTopic, activeStepIndex, activeRightTab, setStudyMode, setCurrentPassage, setCurrentTopic]);

  const location = useLocation();

  // Restore persisted state on mount or route changes with query parameters
  useEffect(() => {
    const userKey = user?.email || "guest";

    // Read URL search query parameters if available
    const searchParams = new URLSearchParams(location.search || window.location.hash.split("?")[1] || "");
    const urlRef = searchParams.get("ref");
    const urlVersion = searchParams.get("version");
    const urlTool = searchParams.get("tool");

    const pendingRef = urlRef || localStorage.getItem("stba_pending_search_ref");
    const pendingTopic = localStorage.getItem("stba_pending_search_topic") || "";
    const pendingTool = urlTool || localStorage.getItem("stba_pending_search_tool");

    if (pendingRef) {
      localStorage.removeItem("stba_pending_search_ref");
      localStorage.removeItem("stba_pending_search_topic");
      localStorage.removeItem("stba_pending_search_tool");
      
      setQueryRef(pendingRef);
      setQueryTopic(pendingTopic);
      setCustomReference(null);
      setCustomVerses(null);
      setReport(null);
      setActiveStepIndex(0);
      setChatInputs(Array(7).fill(""));
      setStepChats(Array(7).fill([]));
      setActiveVerseIndex(null);
      
      // If tool is specified (e.g. "visual" from Study Deeper in Sabbath School), activate that tab
      const targetToolTab = (pendingTool === "visual" || urlTool === "visual") ? "visual" : (pendingTool || "stephen");
      setActiveRightTab(targetToolTab as any);
      setRightPanelCollapsed(false);
      
      localStorage.setItem(`stba_queryRef_${userKey}`, pendingRef);
      localStorage.setItem(`stba_queryTopic_${userKey}`, pendingTopic);
      localStorage.setItem(`stba_activeRightTab_${userKey}`, targetToolTab);
      localStorage.setItem(`stba_activeStepIndex_${userKey}`, "0");
      localStorage.setItem(`stba_chatInputs_${userKey}`, JSON.stringify(Array(7).fill("")));
      localStorage.setItem(`stba_stepChats_${userKey}`, JSON.stringify(Array(7).fill([])));
      localStorage.setItem(`stba_activeVerseIndex_${userKey}`, "null");

      // Auto load the exegesis study workspace & trigger automatic search
      setTimeout(() => {
        handleLoadExegesis(pendingRef, pendingTopic);
      }, 150);
    } else {
      const savedHeaderCollapsed = localStorage.getItem(`stba_globalHeaderCollapsed_${userKey}`);
      if (savedHeaderCollapsed !== null) {
        setGlobalHeaderCollapsedState(savedHeaderCollapsed === "true");
      }
    }
  }, [user, location.search, location.key]);

  const TOOL_TABS = [
    { id: "csms", label: "CSMS Guide", icon: Compass },
    { id: "stephen", label: "Elder Stephen", icon: MessageSquare },
    { id: "notebook", label: "My Notebook", icon: FileText },
    { id: "word", label: "Word Study", icon: Search },
    { id: "xref", label: "Cross-References", icon: Layers },
    { id: "visual", label: "Bible Reader", icon: Volume2 },
    { id: "review", label: " SDA Commentary", icon: BookOpen },
    { id: "syllabus", label: "Weekly Syllabus", icon: BookMarked },
  ];

  return (
    <div className={`w-full h-full max-h-full flex flex-col font-sans transition-colors duration-150 relative overflow-hidden ${
      theme === "dark" ? "bg-[#0D1117] text-[#E6EDF2]" : "bg-[#F4EFE6] text-[#222]"
    }`}>
      {/* 1. TOP CONTROL BAR - ALWAYS VISIBLE */}
      <header className={`p-3 border-b flex flex-row items-center justify-between gap-2 select-none shrink-0 ${
        theme === "dark" ? "bg-[#161B22] border-[#30363D]" : "bg-[#FFF] border-[#E5DFD5] shadow-xs"
      }`}>
        {/* Title Row */}
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-5 h-5 text-[#C9973A] shrink-0" />
          <h1 className="font-serif text-xs sm:text-base font-extrabold tracking-tight uppercase truncate">
            <span className="md:hidden">STBA Workspace</span>
            <span className="hidden md:inline">STBA Study Workspace</span>
          </h1>
        </div>

        {/* Right workspace accessories toggles (Theme, Storage & Sync, ViewModeToggle, Expand/Collapse Toggle) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Client Storage & Offline Sync Engine */}
          <button
            onClick={() => setStorageModalOpen(true)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              theme === "dark" 
                ? "bg-[#1E2530] border-[#2C3545] text-amber-400 hover:border-amber-500/50" 
                : "bg-gray-100 border-gray-300 text-amber-800 hover:border-amber-400"
            }`}
            title="STBA Client Storage & Panel Synchronization Engine"
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline text-xs font-medium">Sync & Cache</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              theme === "dark" ? "bg-[#1E2530] border-[#2C3545] text-amber-500" : "bg-gray-100 border-gray-300 text-gray-800"
            }`}
            title="Toggle theme visual modes"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Top-level View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            theme={theme}
            compact={true}
          />

          {/* Expand / Collapse Workspace Tools section button */}
          <button
            onClick={() => setGlobalHeaderCollapsed(!globalHeaderCollapsed)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              theme === "dark" 
                ? "bg-[#1C212B] border-gray-800 text-gray-300 hover:text-[#C9A86A] hover:border-[#C9A86A]/40" 
                : "bg-white border-stone-200 text-gray-600 hover:text-[#C9A86A] hover:border-[#C9A86A]/40"
            }`}
            title={globalHeaderCollapsed ? "Expand Workspace Tools" : "Collapse Workspace Tools"}
          >
            {globalHeaderCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* 3. TOOLBAR NAV SHORTCUTS (PREMIUM GOLD-TRIMMED SINGLE HORIZONTAL LINE) */}
      {!globalHeaderCollapsed && (
        <section className={`px-3 sm:px-4 py-2 sm:py-2.5 border-b flex flex-col gap-2 items-center justify-center w-full select-none ${
          theme === "dark" ? "bg-[#090C10] border-[#21262D]" : "bg-[#081528] border-[#DFC57B]/30"
        }`}>
          {/* Centered Golden Header */}
          <div className="flex items-center justify-center w-full text-center text-[11px] select-none">
            <span className="font-mono text-[#DFC57B] font-bold uppercase tracking-widest drop-shadow-xs">
              WORKSPACE TOOLS
            </span>
          </div>

          {/* Tool Buttons: Single Horizontal Row with Gold Trim and Smooth 2-3px Lift Hover Effect */}
          <div className="flex flex-row flex-nowrap items-center justify-start gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar w-full max-w-7xl py-1 px-3 scroll-smooth">
            {TOOL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRightTab === tab.id && viewMode !== "bible";
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id as any)}
                  className={`shrink-0 flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-sans font-semibold transition-all duration-200 ease-out cursor-pointer border select-none hover:-translate-y-[2.5px] hover:shadow-[0_4px_16px_rgba(223,197,123,0.3)] active:translate-y-0 active:scale-[0.98] ${
                    isActive
                      ? "bg-[#0d3060] text-white border-[#DFC57B] shadow-[0_0_12px_rgba(223,197,123,0.35)] ring-1 ring-[#DFC57B]"
                      : "bg-[#06162c] text-stone-200 border-[#DFC57B]/70 hover:border-[#F3CF65] hover:bg-[#0d3060]/70 hover:text-white"
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 text-[#DFC57B] shrink-0 drop-shadow-[0_0_4px_rgba(223,197,123,0.4)]" />
                  <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. MAIN STAGE LAYOUT */}
      <main className="flex-1 w-full flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left parallel Bible reader wrapper */}
        {viewMode !== "tools" && (
          <div 
            style={
              viewMode === "bible"
                ? { width: "100%", height: "100%" }
                : isMobile 
                  ? { height: "45%" } 
                  : { width: `${leftPaneWidth}%` }
            } 
            className={`w-full flex flex-col overflow-hidden border-none ${
              viewMode === "bible" ? "h-full" : "md:h-full"
            }`}
          >
            <ParallelBibleReader
              reference={customReference || (report ? report.reference : "")}
              topic={customReference ? (customReference.startsWith("Topic:") ? customReference : "Custom Scripture Study") : (report ? report.topic : "")}
              report={report}
              translationsFromReport={customReference ? undefined : (report ? report.step1.translations : undefined)}
              customVerses={customVerses || undefined}
              activeVerseIndex={activeVerseIndex}
              setActiveVerseIndex={setActiveVerseIndex}
              onVerseSelect={handleVerseSelect}
              isExegesisSynthesizing={isExegesisSynthesizing}
              synthesizingVerseRef={synthesizingVerseRef}
              onAddNoteFromText={handleAddNoteFromText}
              onSendToElderStephen={handleSendToStephen}
              onWordStudyTrigger={handleWordStudyTrigger}
              theme={theme}
              bibleFontSize={bibleFontSize}
              setBibleFontSize={setBibleFontSize}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onSelectTrack={(ref, tp) => {
                setQueryRef(ref);
                setQueryTopic(tp || "");
                handleLoadExegesis(ref, tp || "");
              }}
              onNavigateVerse={handleNavigateVerse}
              queryRef={queryRef}
              setQueryRef={(val) => {
                setQueryRef(val);
                setLastActiveSearchField('ref');
              }}
              queryTopic={queryTopic}
              setQueryTopic={(val) => {
                setQueryTopic(val);
                setLastActiveSearchField('topic');
              }}
              lastActiveSearchField={lastActiveSearchField}
              setLastActiveSearchField={setLastActiveSearchField}
              onLoadMoreTopicVerses={handleLoadMoreTopicVerses}
              hasMoreTopicVerses={hasMoreTopicVerses}
              loadingMoreTopicVerses={loadingMoreTopicVerses}
              isTopicSearchActive={Boolean(activeTopicSearch)}
              handleLoadExegesis={handleLoadExegesis}
              loading={loading}
              errorMsg={errorMsg}
              globalHeaderCollapsed={globalHeaderCollapsed}
              setGlobalHeaderCollapsed={setGlobalHeaderCollapsed}
            />
          </div>
        )}

        {/* DRAGGABLE RESIZE DIVIDER HANDLE - Seamless matching edges, no white lines */}
        {viewMode === "split" && !isMobile && (
          <div
            onMouseDown={startResizing}
            className={`w-1.5 sm:w-2 group select-none cursor-col-resize h-full transition-colors duration-150 flex-shrink-0 z-30 relative flex items-center justify-center border-none ${
              isResizing 
                ? "bg-[#C9973A]/25" 
                : theme === "dark" 
                  ? "bg-[#0D1117] hover:bg-[#C9973A]/20" 
                  : "bg-[#ECE6DC] hover:bg-[#C9973A]/20"
            }`}
            title="Drag to resize panels"
          >
            {/* Seamless, consistent grip handle matching app design */}
            <div 
              className={`h-8 w-0.5 sm:w-1 rounded-full transition-all duration-150 ${
                isResizing 
                  ? "bg-[#C9973A] scale-y-125" 
                  : "bg-[#C9973A]/40 group-hover:bg-[#C9973A] group-hover:scale-y-110"
              }`}
            />
          </div>
        )}

        {/* Mobile horizontal divider between panels - seamless, no white lines */}
        {viewMode === "split" && isMobile && (
          <div className={`w-full h-1.5 flex items-center justify-center shrink-0 border-none select-none ${
            theme === "dark" ? "bg-[#0D1117]" : "bg-[#ECE6DC]"
          }`}>
            <div className="w-8 h-0.5 rounded-full bg-[#C9973A]/40" />
          </div>
        )}

        {/* Right tools dynamic selection panel */}
        {viewMode !== "bible" && (
          <div 
            style={
              viewMode === "tools"
                ? { width: "100%", height: "100%" }
                : isMobile 
                  ? { height: "55%" } 
                  : { width: `${100 - leftPaneWidth}%` }
            } 
            className={`w-full flex flex-col overflow-hidden select-none transition-all duration-150 border-none ${
              viewMode === "tools" ? "h-full" : "md:h-full"
            } ${
              theme === "dark" ? "bg-[#161B22]" : "bg-[#FCFAF7]"
            }`}
          >
            {/* Background Theological Synthesis Live Status Indicator */}
            {isExegesisSynthesizing && (
              <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-[#C9973A]/25 to-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0 select-none shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500 dark:text-amber-400 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9973A] shrink-0" />
                  <span>Synthesizing 7-step theological exegesis for <strong className="text-white dark:text-amber-300 font-extrabold">{synthesizingVerseRef}</strong> in background...</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider hidden sm:inline">
                  Elder Stephen Active
                </span>
              </div>
            )}

            {/* Topic Search Active - Prompt user to click a verse */}
            {activeTopicSearch && !report && !isExegesisSynthesizing && (
              <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/25 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-sans select-none shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Topic <strong>"{activeTopicSearch}"</strong> active ({customVerses?.length || 0} verses loaded). Click any verse row on the left to activate 7-step theological exegesis.
                </span>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRightTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.12 }}
                  className="w-full h-full overflow-hidden"
                >
                  {activeRightTab === "csms" && (
                    <CSMSActiveRecall
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      setStepChats={setStepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                      onNavigateTab={(tab) => setActiveRightTab(tab as any)}
                    />
                  )}

                  {activeRightTab === "stephen" && (
                    <ElderStephenCommentary
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                      userProfile={user}
                      stephenPendingPrompt={stephenPendingPrompt}
                      clearStephenPendingPrompt={() => setStephenPendingPrompt("")}
                      currentPassageRef={report?.reference || queryRef || customReference || ""}
                      onNavigateTab={(tab) => setActiveRightTab(tab as any)}
                    />
                  )}

                  {activeRightTab === "notebook" && (
                    <STBANotebook
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      setActiveVerseIndex={setActiveVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                      addedNoteText={addedNoteText}
                      addedNoteRef={addedNoteRef}
                      clearAddedNoteInline={() => { setAddedNoteText(""); setAddedNoteRef(""); }}
                      notebookFontSize={notebookFontSize}
                      setNotebookFontSize={setNotebookFontSize}
                    />
                  )}

                  {activeRightTab === "word" && (
                    <WordStudy
                      report={report}
                      customVerses={customVerses}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                      selectedWord={selectedWord}
                      setSelectedWord={setSelectedWord}
                      setActiveVerseIndex={setActiveVerseIndex}
                    />
                  )}

                  {activeRightTab === "xref" && (
                    <CrossReferenceEngine
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                    />
                  )}

                  {activeRightTab === "visual" && (
                    <VisualReaderTools
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                      bibleFontSize={bibleFontSize}
                      setBibleFontSize={setBibleFontSize}
                    />
                  )}

                  {activeRightTab === "review" && (
                    <SDABibleCommentary
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                      bibleFontSize={bibleFontSize}
                      setBibleFontSize={setBibleFontSize}
                      currentPassageRef={report?.reference}
                      onNavigateTab={(tab) => setActiveRightTab(tab as any)}
                    />
                  )}

                  {activeRightTab === "syllabus" && (
                    <SyllabusModeView
                      report={report}
                      activeVerseIndex={activeVerseIndex}
                      activeStepIndex={activeStepIndex}
                      setActiveStepIndex={setActiveStepIndex}
                      chatInputs={chatInputs}
                      setChatInputs={setChatInputs}
                      stepChats={stepChats}
                      handleSendChat={handleSendGuidedChat}
                      onReferenceChange={(ref) => handleLoadExegesis(ref, "")}
                      theme={theme}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Storage and Cross-Panel Synchronization Modal */}
      <StorageManagerModal 
        isOpen={storageModalOpen} 
        onClose={() => setStorageModalOpen(false)} 
        theme={theme} 
      />
    </div>
  );
}
