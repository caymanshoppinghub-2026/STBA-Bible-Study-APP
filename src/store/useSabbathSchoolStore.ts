/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  parseSabbathSchoolLesson, 
  scrapeQuarterlyLesson, 
  fetchLessonByDate, 
  getClassroomAnalytics, 
  updateClassroomEnrollment, 
  recordClassroomActivity, 
  getSabbathSchoolSyncData,
  triggerSabbathSchoolSync,
  getTheologicalTakeawaysFromSource,
  DailyLesson, 
  SabbathClassCard 
} from "../api/sabbathSchoolApi";
import { TheologicalTakeawayItem } from "../utils/sabbathLessonTheology";
import { askElderStephen, ElderStephenMessage } from "../api/elderStephenApi";
import { notifyLiveSectionUpdate } from "../utils/contentUpdatesWatcher";
import { separateLessonAndEgwNotes } from "../utils/sabbathUtils";

export interface EGWDayTimestamp {
  dayIndex: number;
  label: string;
  topic: string;
  timestampSeconds: number;
  url: string;
}

export const EGW_NOTES_LESSON_8 = {
  title: "Lesson 8 – EGW Notes Commentary",
  youtubeId: "7IRNw43trAM",
  directUrl: "https://www.youtube.com/watch?v=7IRNw43trAM",
  days: [
    { dayIndex: 0, label: "Sabbath Afternoon, August 22", topic: "Sabbath Afternoon", timestampSeconds: 0, url: "https://www.youtube.com/watch?v=7IRNw43trAM" },
    { dayIndex: 1, label: "Sunday, August 23", topic: "Sunday Study", timestampSeconds: 189, url: "https://www.youtube.com/watch?v=7IRNw43trAM&t=189s" },
    { dayIndex: 2, label: "Monday, August 24", topic: "Monday Study", timestampSeconds: 407, url: "https://www.youtube.com/watch?v=7IRNw43trAM&t=407s" },
    { dayIndex: 3, label: "Tuesday, August 25", topic: "Tuesday Study", timestampSeconds: 580, url: "https://www.youtube.com/watch?v=7IRNw43trAM&t=580s" },
    { dayIndex: 4, label: "Wednesday, August 26", topic: "Wednesday Study", timestampSeconds: 761, url: "https://www.youtube.com/watch?v=7IRNw43trAM&t=761s" },
    { dayIndex: 5, label: "Thursday, August 27", topic: "Thursday Study", timestampSeconds: 970, url: "https://www.youtube.com/watch?v=7IRNw43trAM&t=970s" },
    { dayIndex: 6, label: "Friday, August 28", topic: "Friday Study", timestampSeconds: 1177, url: "https://www.youtube.com/watch?v=7IRNw43trAM&t=1177s" }
  ]
};

export const EGW_NOTES_LESSON_6 = EGW_NOTES_LESSON_8; // backward compatibility export

export interface SabbathSchoolState {
  quarterlyTitle: string;
  lessonTitle: string;
  memoryVerse: string;
  dailyLessons: DailyLesson[];
  deckCards: SabbathClassCard[];
  weeklyReflection: string;
  selectedDayIndex: number;
  userRole: "Teacher" | "Student";
  readingFontSize: "sm" | "md" | "lg" | "xl";
  readingTheme: "dark" | "light";
  isParsing: boolean;
  isElderLoading: boolean;
  elderDiscussion: ElderStephenMessage[];
  activeMediaSource: "standard" | "egwNotes";
  isEgwAudioPlaying: boolean;
  isEgwVideoPlaying: boolean;
  currentEgwTimestampIndex: number;
  classroomStats: {
    totalStudents: number;
    complianceRate: number;
    activeDiscussions: number;
    gapsList: Array<{ topic: string; gapPercentage: number; count: number }>;
  };
  weeklyVideos?: {
    featured?: any;
    itiswritten?: any;
    hope?: any;
    threeABN?: any;
  };
  egwDailyBreakdown?: Record<string, any>;
  hasPendingRetries?: boolean;
  pendingChannels?: string[];
  nextRetryAt?: string;
  lastSyncedAt?: string;
  isSyncing?: boolean;
  activeLessonDate: string;
  theologicalTakeaways?: TheologicalTakeawayItem[];
  isTakeawaysLoading?: boolean;
}

export function formatQuarterTitle(title?: string): string {
  if (!title) return "The Gift of Prophecy (2026 Q4)";
  if (title.toLowerCase().includes("corinthians")) {
    return title.includes("Q3") ? title : "Epistles to the Corinthians (2026 Q3)";
  }
  if (title.toLowerCase().includes("prophecy")) {
    return title.includes("Q4") ? title : "The Gift of Prophecy (2026 Q4)";
  }
  let formatted = title.replace(/(\d{4})-(0[1-4]|[1-4])/g, (_, y, q) => `${y} Q${parseInt(q, 10)}`);
  formatted = formatted.replace(/\(?Sabbath School\s*/gi, "").replace(/\(\s*\)/g, "").trim();
  return formatted;
}

const DEFAULT_STATE: SabbathSchoolState = {
  quarterlyTitle: "The Gift of Prophecy (2026 Q4)",
  activeLessonDate: typeof window !== "undefined" && window.localStorage ? (window.localStorage.getItem("stba_sabbath_selected_date") || "2026-10-17") : "2026-10-17",
  lessonTitle: "Love-driven Ministry",
  memoryVerse: "“For out of much affliction and anguish of heart I wrote to you, with many tears, not that you should be grieved, but that you might know the love which I have so abundantly for you.” — 2 Corinthians 2:4, NKJV",
  dailyLessons: [
    {
      label: "Day 1 (Saturday, August 1)",
      title: "Spiritual Gifts",
      status: "Not Started",
      content: `### Memory Verse
> “Pursue love, and earnestly desire the spiritual gifts, especially that you may prophesy” (1 Corinthians 14:1, ESV).

---

### 1. Introduction to Spiritual Gifts
In 1 Corinthians 12–14, Paul discusses the distribution and purpose of spiritual gifts within the church.

### 2. Unity and Diversity in the Body
Like a human body, the church has many parts with distinct functions, all operated by the same Spirit.

### 3. Edification in Love
Gifts are imparted for the mutual edification of believers and to glorify God.`,
      egwNotes: [
        "Through Christ the hidden glory of the holy of holies stands revealed. The Holy Spirit imparts gifts to every believer as He wills for the edification of the body.—Sons and Daughters of God, p. 228."
      ]
    },
    {
      label: "Day 2 (Sunday, August 2)",
      title: "Varieties of Gifts",
      status: "Not Started",
      content: `### 1. Distinct Manifestations
Paul emphasizes that while there are different gifts, service opportunities, and working powers, it is the same God who works all in all.`,
      egwNotes: [
        "God assigns to every man his work according to his ability.—Christ’s Object Lessons, p. 326."
      ]
    },
    {
      label: "Day 3 (Monday, August 3)",
      title: "Unity Through Diversity",
      status: "Not Started",
      content: `### 1. One Body, Many Members
No member of the body can say to another, 'I have no need of you.' Every believer plays a vital role.`,
      egwNotes: [
        "The harmony of the church depends on the unity of its members in Christ.—Testimonies, vol. 5, p. 236."
      ]
    },
    {
      label: "Day 4 (Tuesday, August 4)",
      title: "“A More Excellent Way”",
      status: "Not Started",
      content: `### 1. The Supremacy of Love
Even the most spectacular spiritual gifts are useless without agape love (1 Corinthians 13).`,
      egwNotes: [
        "Love is the active principle that transforms character and unites hearts.—The Acts of the Apostles, p. 550."
      ]
    },
    {
      label: "Day 5 (Wednesday, August 5)",
      title: "The Gift of Tongues",
      status: "Not Started",
      content: `### 1. Order and Intelligibility
In 1 Corinthians 14, Paul instructs that public worship must be intelligible and orderly so all are edified.`,
      egwNotes: [
        "God is a God of order, and everything connected with His work should be conducted with reverence.—Testimonies, vol. 5, p. 491."
      ]
    },
    {
      label: "Day 6 (Thursday, August 6)",
      title: "The Gift of Prophecy",
      status: "Not Started",
      content: `### 1. Testing and Valuing Prophecy
Prophecy speaks to believers for edification, exhortation, and comfort.`,
      egwNotes: [
        "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.—The Great Controversy, p. 593."
      ]
    },
    {
      label: "Day 7 (Friday, August 7)",
      title: "Further Thought",
      status: "Not Started",
      content: `### 1. Practical Reflection
Reflect on how your spiritual gifts can be used this week to encourage your Sabbath School class and community.`,
      egwNotes: [
        "Consecrate your gifts to the Master's service.—Patriarchs and Prophets, p. 590."
      ]
    }
  ],
  deckCards: [
    {
      id: "ssc-1",
      question: "What is the primary theme of the Three Angels' Messages in Revelation 14?",
      answer: "The everlasting gospel, calling all people to worship the Creator, announcement of the fall of Babylon, and warning against the beast's mark.",
      category: "Revelation",
      totalAttempts: 14,
      successRate: 78
    },
    {
      id: "ssc-2",
      question: "Which prophecy predicts the cleansing of the heavenly sanctuary?",
      answer: "The 2300 days prophecy of Daniel 8:14.",
      category: "Daniel",
      totalAttempts: 12,
      successRate: 45
    },
    {
      id: "ssc-3",
      question: "What does the Seventh-day Sabbath represent under the lens of the Great Controversy?",
      answer: "God's ultimate seal of authority and sign of loyalty to the Creator, opposing Babylon's counterfeit mark.",
      category: "Sabbath",
      totalAttempts: 15,
      successRate: 92
    }
  ],
  weeklyReflection: "",
  selectedDayIndex: 0,
  userRole: "Student",
  readingFontSize: "sm",
  readingTheme: "dark",
  isParsing: false,
  isElderLoading: false,
  elderDiscussion: [],
  activeMediaSource: "standard",
  isEgwAudioPlaying: false,
  isEgwVideoPlaying: false,
  currentEgwTimestampIndex: 0,
  theologicalTakeaways: undefined,
  isTakeawaysLoading: false,
  classroomStats: {
    totalStudents: 0,
    complianceRate: 0,
    activeDiscussions: 0,
    gapsList: []
  }
};

// LocalStorage key helper
const STORAGE_KEY = "stba_sabbath_school_state";

// Retrieve state from localStorage or use default
const loadPersistedState = (): SabbathSchoolState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Upgrade stale default lesson title or short daily lessons if found
      const isDay2Short = parsed.dailyLessons && parsed.dailyLessons[1] && (
        (typeof parsed.dailyLessons[1].content === 'string' && parsed.dailyLessons[1].content.length < 400) ||
        !parsed.dailyLessons[1].egwNotes
      );

      // Repair any missing or empty daily lesson content (e.g. Day 1)
      if (parsed.dailyLessons && Array.isArray(parsed.dailyLessons)) {
        parsed.dailyLessons = parsed.dailyLessons.map((d: any, idx: number) => {
          const defaultDay = DEFAULT_STATE.dailyLessons[idx] || DEFAULT_STATE.dailyLessons[0];
          let content = d?.content;
          if (
            !content ||
            (Array.isArray(content) && content.length === 0) ||
            (typeof content === "string" && content.trim().length < 20)
          ) {
            content = defaultDay.content;
          }
          let egwNotes = d?.egwNotes;
          if (!egwNotes || (Array.isArray(egwNotes) && egwNotes.length === 0)) {
            if (!parsed.lessonTitle || parsed.lessonTitle === DEFAULT_STATE.lessonTitle) {
              egwNotes = defaultDay.egwNotes;
            }
          }

          // Strictly separate and sanitize content so NO Ellen White quote remains in daily lesson exposition
          const { mainParagraphs, egwParagraphs } = separateLessonAndEgwNotes(content, egwNotes);

          return {
            ...defaultDay,
            ...d,
            content: mainParagraphs.join("\n\n"),
            egwNotes: egwParagraphs
          };
        });
      }

      if (parsed.lessonTitle === "Paul's Ministry in Corinth & The Message of the Cross") {
        parsed.lessonTitle = "Spiritual Gifts & The Prophetic Office";
        parsed.quarterlyTitle = "The Gift of Prophecy (2026 Q4)";
      }
      if (parsed.quarterlyTitle && parsed.quarterlyTitle.toLowerCase().includes("corinthians")) {
        parsed.quarterlyTitle = "The Gift of Prophecy (2026 Q4)";
      }
      // Filter out any stale structured initial welcome messages from elderDiscussion
      let cleanDiscussion = parsed.elderDiscussion || DEFAULT_STATE.elderDiscussion;
      if (Array.isArray(cleanDiscussion)) {
        cleanDiscussion = cleanDiscussion.filter((msg: any) => {
          if (msg && msg.role === 'elder' && typeof msg.text === 'string') {
            if (msg.text.includes("### 1. Context") || msg.text.includes("beautiful sanctuaries") || msg.text.includes("Exegetical Insight")) {
              return false;
            }
          }
          return true;
        });
      }

      let cleanStats = parsed.classroomStats || DEFAULT_STATE.classroomStats;
      if (cleanStats) {
        const hasDummyGaps = Array.isArray(cleanStats.gapsList) && cleanStats.gapsList.some((g: any) =>
          g.topic?.includes("Daniel 8:14") || g.topic?.includes("Fall of Babylon") || g.topic?.includes("Commandments of God") || g.topic?.includes("Counterfeit Worship")
        );
        if (hasDummyGaps || cleanStats.totalStudents === 18 || cleanStats.activeDiscussions === 4 || cleanStats.complianceRate === 84) {
          cleanStats = {
            totalStudents: 0,
            complianceRate: 0,
            activeDiscussions: 0,
            gapsList: []
          };
        }
      }

      return {
        ...DEFAULT_STATE,
        ...parsed,
        dailyLessons: (parsed.dailyLessons && parsed.dailyLessons.length === 7) ? parsed.dailyLessons : DEFAULT_STATE.dailyLessons,
        deckCards: parsed.deckCards || DEFAULT_STATE.deckCards,
        elderDiscussion: cleanDiscussion,
        classroomStats: cleanStats
      };
    }
  } catch (e) {
    console.error("Failed to load persisted Sabbath School state:", e);
  }
  return DEFAULT_STATE;
};

// Global store state container
let globalStateStore: SabbathSchoolState = loadPersistedState();
const globalListeners = new Set<(state: SabbathSchoolState) => void>();

const saveStateAndNotify = (nextState: SabbathSchoolState) => {
  globalStateStore = nextState;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (e) {
    console.error("Failed to save Sabbath School state:", e);
  }
  globalListeners.forEach((listener) => listener(globalStateStore));
};

export const useSabbathSchoolStore = () => {
  const [state, setState] = useState<SabbathSchoolState>(globalStateStore);

  useEffect(() => {
    // Add current component setState as a listener
    globalListeners.add(setState);
    // Initialize state on mount to handle updates in other parts
    setState(globalStateStore);

    // Initial background check for master synced content if not yet loaded
    if (!globalStateStore.weeklyVideos || !globalStateStore.egwDailyBreakdown) {
      fetchWeeklySyncData(false);
    }

    return () => {
      globalListeners.delete(setState);
    };
  }, []);

  // Action methods
  const setQuarterlyTitle = (title: string) => {
    saveStateAndNotify({ ...globalStateStore, quarterlyTitle: title });
  };

  const setLessonTitle = (title: string) => {
    saveStateAndNotify({ ...globalStateStore, lessonTitle: title });
  };

  const setMemoryVerse = (verse: string) => {
    saveStateAndNotify({ ...globalStateStore, memoryVerse: verse });
  };

  const setDailyLessons = (lessons: DailyLesson[]) => {
    saveStateAndNotify({ ...globalStateStore, dailyLessons: lessons });
  };

  const setDeckCards = (cards: SabbathClassCard[]) => {
    saveStateAndNotify({ ...globalStateStore, deckCards: cards });
  };

  const setWeeklyReflection = (val: string) => {
    saveStateAndNotify({ ...globalStateStore, weeklyReflection: val });
  };

  const setSelectedDayIndex = (index: number) => {
    saveStateAndNotify({ ...globalStateStore, selectedDayIndex: index });
  };

  const setUserRole = (role: "Teacher" | "Student") => {
    saveStateAndNotify({ ...globalStateStore, userRole: role });
  };

  const setReadingFontSize = (size: "sm" | "md" | "lg" | "xl") => {
    saveStateAndNotify({ ...globalStateStore, readingFontSize: size });
  };

  const setReadingTheme = (theme: "dark" | "light") => {
    saveStateAndNotify({ ...globalStateStore, readingTheme: theme });
  };

  const addDeckCard = (card: Omit<SabbathClassCard, "id" | "totalAttempts" | "successRate">) => {
    const newCard: SabbathClassCard = {
      ...card,
      id: `ssc-${Date.now()}`,
      totalAttempts: 0,
      successRate: 100
    };
    saveStateAndNotify({
      ...globalStateStore,
      deckCards: [...globalStateStore.deckCards, newCard]
    });
  };

  const deleteDeckCard = (id: string) => {
    saveStateAndNotify({
      ...globalStateStore,
      deckCards: globalStateStore.deckCards.filter((card) => card.id !== id)
    });
  };

  const updateDailyLessonStatus = (index: number, status: string) => {
    const updatedLessons = [...globalStateStore.dailyLessons];
    if (updatedLessons[index]) {
      updatedLessons[index] = { ...updatedLessons[index], status };
    }
    // Calculate student activity metrics
    const completedCount = updatedLessons.filter((d) => {
      const s = d.status?.toLowerCase();
      return s === "completed" || s === "complete";
    }).length;
    const inProgressCount = updatedLessons.filter((d) => {
      const s = d.status?.toLowerCase();
      return s === "in progress";
    }).length;
    const newCompliance = Math.min(100, Math.round(((completedCount * 100) + (inProgressCount * 50)) / 7));
    
    saveStateAndNotify({
      ...globalStateStore,
      dailyLessons: updatedLessons,
      classroomStats: {
        ...globalStateStore.classroomStats,
        complianceRate: newCompliance
      }
    });
  };

  const recordTakeawayEngagement = () => {
    saveStateAndNotify({
      ...globalStateStore,
      classroomStats: {
        ...globalStateStore.classroomStats,
        activeDiscussions: globalStateStore.classroomStats.activeDiscussions + 1,
        complianceRate: Math.min(100, globalStateStore.classroomStats.complianceRate + 2)
      }
    });
  };

  const recordDiscussionAttempt = (cardId: string) => {
    const updatedCards = globalStateStore.deckCards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          totalAttempts: (c.totalAttempts || 0) + 1,
          successRate: Math.min(100, (c.successRate || 75) + 5)
        };
      }
      return c;
    });

    saveStateAndNotify({
      ...globalStateStore,
      deckCards: updatedCards,
      classroomStats: {
        ...globalStateStore.classroomStats,
        activeDiscussions: globalStateStore.classroomStats.activeDiscussions + 1,
        complianceRate: Math.min(100, globalStateStore.classroomStats.complianceRate + 3)
      }
    });
  };

  const importLessonText = async (text: string) => {
    saveStateAndNotify({ ...globalStateStore, isParsing: true });
    try {
      const parsed = await parseSabbathSchoolLesson(text);
      saveStateAndNotify({
        ...globalStateStore,
        isParsing: false,
        quarterlyTitle: parsed.quarterlyTitle,
        lessonTitle: parsed.lessonTitle,
        memoryVerse: parsed.memoryVerse,
        dailyLessons: parsed.dailyLessons.map((d, i) => ({
          ...d,
          content: globalStateStore.dailyLessons[i]?.content || "No detailed content provided. Study the scripture references diligently!"
        })),
        deckCards: parsed.deckCards
      });

      // Automatically generate live notification for Sabbath School section update
      notifyLiveSectionUpdate({
        sectionId: "sabbath-school",
        sectionName: "Sabbath School",
        title: `Sabbath School Live: ${parsed.lessonTitle || "New Lesson"}`,
        description: `Lesson content for "${parsed.quarterlyTitle || "Quarterly"}" is now live with memory verse and 7-day readings.`,
        link: "/sabbath-school",
        linkText: "Open Sabbath School",
        category: "sabbath-school"
      });
    } catch (e) {
      saveStateAndNotify({ ...globalStateStore, isParsing: false });
      throw e;
    }
  };

  const triggerScraper = async (targetUrl?: string) => {
    saveStateAndNotify({ ...globalStateStore, isParsing: true });
    try {
      const parsed = await scrapeQuarterlyLesson(targetUrl || "");
      saveStateAndNotify({
        ...globalStateStore,
        isParsing: false,
        quarterlyTitle: formatQuarterTitle(parsed.quarterlyTitle),
        lessonTitle: parsed.lessonTitle || "Spiritual Gifts",
        memoryVerse: parsed.memoryVerse || "“Pursue love, and earnestly desire the spiritual gifts, especially that you may prophesy” (1 Corinthians 14:1, ESV).",
        dailyLessons: parsed.dailyLessons && parsed.dailyLessons.length ? parsed.dailyLessons : globalStateStore.dailyLessons,
        deckCards: parsed.deckCards && parsed.deckCards.length ? parsed.deckCards : globalStateStore.deckCards
      });

      // Automatically generate live notification for online quarterly update
      notifyLiveSectionUpdate({
        sectionId: "sabbath-school",
        sectionName: "Sabbath School",
        title: `Sabbath School Online Update: ${parsed.lessonTitle || "Fresh Lesson"}`,
        description: `Ellen G. White commentary, daily study sections, and memory verses have gone live!`,
        link: "/sabbath-school",
        linkText: "Study Lesson",
        category: "sabbath-school"
      });
    } catch (e) {
      saveStateAndNotify({ ...globalStateStore, isParsing: false });
      throw e;
    }
  };

  const fetchWeeklySyncData = async (forceRefresh: boolean = false) => {
    saveStateAndNotify({ ...globalStateStore, isSyncing: true });
    try {
      const payload = await getSabbathSchoolSyncData(forceRefresh);
      if (payload && (payload.dailyLessons || payload.quarterlyTitle)) {
        let mappedDailyLessons: DailyLesson[] = globalStateStore.dailyLessons;
        if (Array.isArray(payload.dailyLessons) && payload.dailyLessons.length > 0) {
          mappedDailyLessons = payload.dailyLessons.map((d: any) => {
            const rawContent = Array.isArray(d.lessonContent)
              ? d.lessonContent.join("\n\n")
              : (d.lessonContent || d.content || "");
            const { mainParagraphs, egwParagraphs } = separateLessonAndEgwNotes(rawContent, d.egwNotes);
            return {
              label: `${d.dayName} (${d.dateString})`,
              title: d.title || d.dayName,
              status: "Not Started",
              content: mainParagraphs.join("\n\n"),
              egwNotes: egwParagraphs,
              egwVideoUrl: d.egwVideoUrl || "",
              egwTimestampText: d.egwTimestampText || "",
              egwTimestampSeconds: d.egwTimestampSeconds || 0
            };
          });
        }

        const upcomingSabbathDate = "2026-10-17";
        saveStateAndNotify({
          ...globalStateStore,
          isSyncing: false,
          activeLessonDate: forceRefresh ? upcomingSabbathDate : (globalStateStore.activeLessonDate || upcomingSabbathDate),
          quarterlyTitle: payload.quarterlyTitle ? formatQuarterTitle(payload.quarterlyTitle) : globalStateStore.quarterlyTitle,
          lessonTitle: payload.lessonTitle || globalStateStore.lessonTitle,
          memoryVerse: payload.memoryVerse || globalStateStore.memoryVerse,
          dailyLessons: mappedDailyLessons.length === 7 ? mappedDailyLessons : globalStateStore.dailyLessons,
          weeklyVideos: payload.videos || globalStateStore.weeklyVideos,
          egwDailyBreakdown: payload.egwDailyBreakdown || globalStateStore.egwDailyBreakdown,
          theologicalTakeaways: (Array.isArray(payload.theologicalTakeaways) && payload.theologicalTakeaways.length === 3)
            ? payload.theologicalTakeaways
            : globalStateStore.theologicalTakeaways,
          hasPendingRetries: typeof payload.hasPendingRetries === "boolean" ? payload.hasPendingRetries : false,
          pendingChannels: payload.pendingChannels || [],
          nextRetryAt: payload.nextRetryAt,
          lastSyncedAt: payload.lastSyncedAt || new Date().toISOString()
        });

        if (forceRefresh) {
          try {
            localStorage.setItem("stba_sabbath_selected_date", upcomingSabbathDate);
          } catch (e) {}
          notifyLiveSectionUpdate({
            sectionId: "sabbath-school",
            sectionName: "Sabbath School",
            title: `Sabbath School Master Sync: ${payload.lessonTitle || "Updated Lesson"}`,
            description: `Official videos, EGW Notes timestamps, and lesson readings successfully updated for ${upcomingSabbathDate}!`,
            link: "/sabbath-school",
            linkText: "View Updated Lesson",
            category: "sabbath-school"
          });
        }
      } else {
        saveStateAndNotify({ ...globalStateStore, isSyncing: false });
      }
    } catch (err) {
      console.warn("[SabbathStore] Error fetching weekly sync data:", err);
      saveStateAndNotify({ ...globalStateStore, isSyncing: false });
    }
  };

  const addElderMessage = (msg: ElderStephenMessage) => {
    saveStateAndNotify({
      ...globalStateStore,
      elderDiscussion: [...globalStateStore.elderDiscussion, msg]
    });
  };

  const chatWithElderStephen = async (userMessage: string, contextSummary?: string, requestedCommentaryMode?: "prestige" | "velocity" | "auto") => {
    if (!userMessage.trim()) return;

    const updatedDiscussion = [
      ...globalStateStore.elderDiscussion,
      { role: "user", text: userMessage } as ElderStephenMessage
    ];

    saveStateAndNotify({
      ...globalStateStore,
      elderDiscussion: updatedDiscussion,
      isElderLoading: true
    });

    // Cross-Mode Journey Context for Elder Stephen
    let journeyContext = "";
    let memberName = "Student";
    try {
      const savedUser = localStorage.getItem("stba_user_profile");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.name && u.name.trim()) {
          memberName = u.name.trim();
        }
      }
    } catch (e) {}

    const resolvedSenderName = globalStateStore.userRole === "Teacher"
      ? (memberName.toLowerCase().startsWith("teacher") ? memberName : `Teacher ${memberName}`)
      : memberName;

    try {
      const lastReadBible = localStorage.getItem("stba_last_read_passage") || localStorage.getItem("stba_bible_study_context") || "Ephesians 4:14";
      const savedNotes = localStorage.getItem("stba_notebook_notes");
      const tracksProgress = localStorage.getItem("stba_tracks_progress");
      
      let notesSnippet = "";
      if (savedNotes) {
        try {
          const parsed = JSON.parse(savedNotes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            notesSnippet = `Recent Note: "${parsed[0].title || 'Study Note'}" (${parsed[0].content?.slice(0, 100) || ''})`;
          }
        } catch (e) {}
      }

      journeyContext = `[Cross-Mode User Journey Context]:
- Current Mode: Sabbath School Studies
- Role: ${globalStateStore.userRole}
- Active Sabbath School Lesson: "${globalStateStore.lessonTitle}" (Quarterly: "${globalStateStore.quarterlyTitle}")
- Studied Bible Passage (Bible Study Mode): "${lastReadBible}"
${notesSnippet ? `- Notebook Activity: ${notesSnippet}\n` : ""}${tracksProgress ? `- Theological Tracks Progress: ${tracksProgress}\n` : ""}
${contextSummary ? `Special Context: ${contextSummary}` : ""}`;
    } catch (err) {
      journeyContext = contextSummary || `Currently studying Sabbath School Lesson: "${globalStateStore.lessonTitle}"`;
    }

    try {
      const response = await askElderStephen({
        userId: "stba-member",
        userName: resolvedSenderName,
        currentMode: "Sabbath School Studies",
        contextSummary: journeyContext,
        noteTitle: globalStateStore.lessonTitle,
        noteContent: (() => {
          const c = globalStateStore.dailyLessons[globalStateStore.selectedDayIndex]?.content;
          if (Array.isArray(c)) {
            return c.map((item) => (typeof item === "string" ? item : item?.text || "")).join("\n\n");
          }
          return c || "";
        })(),
        historyLog: updatedDiscussion,
        userAction: userMessage,
        commentaryMode: requestedCommentaryMode || "prestige"
      });

      saveStateAndNotify({
        ...globalStateStore,
        isElderLoading: false,
        elderDiscussion: [
          ...updatedDiscussion,
          { role: "elder", text: response.text, commentaryMode: response.commentaryMode || "prestige" } as ElderStephenMessage
        ]
      });
    } catch (e) {
      saveStateAndNotify({
        ...globalStateStore,
        isElderLoading: false,
        elderDiscussion: [
          ...updatedDiscussion,
          { role: "elder", text: "**Pastoral Guidance**\nI am with you in spirit. Let us continue searching the Scriptures daily together!", commentaryMode: "prestige" } as ElderStephenMessage
        ]
      });
    }
  };

  const setActiveLessonDate = (dateStr: string) => {
    saveStateAndNotify({ ...globalStateStore, activeLessonDate: dateStr });
    try {
      localStorage.setItem("stba_sabbath_selected_date", dateStr);
    } catch (_e) {}
  };

  const fetchLessonByDateStore = async (dateStr: string) => {
    saveStateAndNotify({ ...globalStateStore, isParsing: true, activeLessonDate: dateStr });
    try {
      localStorage.setItem("stba_sabbath_selected_date", dateStr);
    } catch (_e) {}
    try {
      const res = await fetchLessonByDate(dateStr);
      saveStateAndNotify({
        ...globalStateStore,
        isParsing: false,
        activeLessonDate: dateStr,
        quarterlyTitle: formatQuarterTitle(res.quarterlyTitle),
        lessonTitle: res.lessonTitle,
        memoryVerse: res.memoryVerse,
        dailyLessons: res.dailyLessons && res.dailyLessons.length === 7 ? res.dailyLessons : globalStateStore.dailyLessons,
        deckCards: res.deckCards || globalStateStore.deckCards
      });
      return res;
    } catch (e) {
      saveStateAndNotify({ ...globalStateStore, isParsing: false });
      throw e;
    }
  };

  const syncClassroomAnalytics = async () => {
    try {
      const analytics = await getClassroomAnalytics();
      saveStateAndNotify({
        ...globalStateStore,
        classroomStats: {
          totalStudents: analytics.totalStudents,
          complianceRate: analytics.complianceRate,
          activeDiscussions: analytics.activeDiscussions,
          gapsList: analytics.gapsList
        }
      });
      return analytics;
    } catch (err) {
      console.error("Failed to sync live classroom analytics:", err);
    }
  };

  const enrollInClass = async (payload: { action: "enroll" | "leave" | "create_class"; userName?: string; role?: "Teacher" | "Student"; classCode?: string; className?: string }) => {
    try {
      const result = await updateClassroomEnrollment(payload);
      if (payload.role) {
        setUserRole(payload.role);
      }
      await syncClassroomAnalytics();
      return result;
    } catch (err) {
      console.error("Failed to update enrollment:", err);
      throw err;
    }
  };

  const recordActivity = async (payload: { userName?: string; activityType: "lesson_complete" | "chat_discussion" | "deck_probe" | "question_gap"; topic?: string; progressDelta?: number }) => {
    try {
      const result = await recordClassroomActivity(payload);
      await syncClassroomAnalytics();
      return result;
    } catch (err) {
      console.error("Failed to record activity:", err);
    }
  };

  const clearElderDiscussion = () => {
    saveStateAndNotify({
      ...globalStateStore,
      elderDiscussion: []
    });
  };

  const setActiveMediaSource = (source: "standard" | "egwNotes") => {
    saveStateAndNotify({
      ...globalStateStore,
      activeMediaSource: source
    });
  };

  const setIsEgwAudioPlaying = (playing: boolean) => {
    saveStateAndNotify({
      ...globalStateStore,
      isEgwAudioPlaying: playing
    });
  };

  const setIsEgwVideoPlaying = (playing: boolean) => {
    saveStateAndNotify({
      ...globalStateStore,
      isEgwVideoPlaying: playing
    });
  };

  const setCurrentEgwTimestampIndex = (index: number) => {
    saveStateAndNotify({
      ...globalStateStore,
      currentEgwTimestampIndex: index
    });
  };

  const refreshTheologicalTakeaways = async () => {
    saveStateAndNotify({ ...globalStateStore, isTakeawaysLoading: true });
    try {
      const res = await getTheologicalTakeawaysFromSource(true);
      if (res && Array.isArray(res.takeaways) && res.takeaways.length === 3) {
        saveStateAndNotify({
          ...globalStateStore,
          theologicalTakeaways: res.takeaways,
          isTakeawaysLoading: false
        });
        return res.takeaways;
      }
    } catch (e) {
      console.warn("[SabbathStore] Error refreshing theological takeaways:", e);
    }
    saveStateAndNotify({ ...globalStateStore, isTakeawaysLoading: false });
    return null;
  };

  const resetStore = () => {
    saveStateAndNotify(DEFAULT_STATE);
  };

  return {
    ...state,
    setQuarterlyTitle,
    setLessonTitle,
    setMemoryVerse,
    setDailyLessons,
    setDeckCards,
    setWeeklyReflection,
    setSelectedDayIndex,
    setUserRole,
    setReadingFontSize,
    setReadingTheme,
    addDeckCard,
    deleteDeckCard,
    updateDailyLessonStatus,
    recordTakeawayEngagement,
    recordDiscussionAttempt,
    importLessonText,
    triggerScraper,
    fetchLessonByDateStore,
    activeLessonDate: state.activeLessonDate,
    setActiveLessonDate,
    syncClassroomAnalytics,
    enrollInClass,
    recordActivity,
    chatWithElderStephen,
    addElderMessage,
    clearElderDiscussion,
    setActiveMediaSource,
    setIsEgwAudioPlaying,
    setIsEgwVideoPlaying,
    setCurrentEgwTimestampIndex,
    fetchWeeklySyncData,
    refreshTheologicalTakeaways,
    resetStore
  };
};
