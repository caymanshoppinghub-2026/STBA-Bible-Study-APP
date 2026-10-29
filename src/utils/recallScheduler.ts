/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Scripture, UserAccount } from "../types";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";
import { recordActivity } from "./activityTracker";

export interface RecallQueueItem {
  id: string;
  scriptureId: string;
  reference: string;
  text: string;
  keywords: string[];
  trackTitle: string;
  theologicalContext?: string;
  proficiencyScore: number; // 0-100
  stage: number; // 1 = Learning (1x interval), 2 = Developing (2x), 3 = Proficient (4x), 4 = Permanent Vault
  intervalDays: number;
  lastReviewedAt: string;
  dueAt: string;
  retrievalAttempts: number;
  successfulRetrievals: number;
  decayStatus: "Optimal" | "Stable" | "Moderate" | "Review Due";
}

export interface UserRecallSettings {
  dailyVerseLimit: number; // 1 - 7
  decayIntervalDays: number; // 1, 3, 5, 7 days
  popupsEnabled: boolean;
  snoozeMinutes: number; // default 15
}

export interface DailyRecallProgress {
  date: string;
  goal: number;
  completedToday: number;
  remaining: number;
  streak: number;
  completedVerseIds: string[];
}

const STORAGE_KEYS = {
  DAILY_LIMIT: "stba_daily_verse_limit",
  DECAY_INTERVAL: "stba_recall_queue_frequency",
  POPUPS_ENABLED: "stba_recall_popups_enabled",
  SETTINGS_CUSTOMIZED: "stba_settings_customized",
  QUEUE_ITEMS: "stba_recall_queue_items",
  TODAY_DATE: "stba_today_recalls_date",
  TODAY_COUNT: "stba_today_recalls_count",
  TODAY_COMPLETED_IDS: "stba_today_recalls_verse_ids",
  SNOOZE_UNTIL: "stba_recall_popup_snooze_until",
  LAST_SHOWN: "stba_recall_popup_last_shown",
  STREAK_COUNT: "stba_recall_streak_count",
  LAST_RECALL_DATE: "stba_last_recall_completed_date"
};

// Seed high-yield theological scriptures across SDA doctrines
const DEFAULT_SEED_SCRIPTURES: Array<Omit<RecallQueueItem, "lastReviewedAt" | "dueAt" | "decayStatus">> = [
  {
    id: "rq-fb-1",
    scriptureId: "fb-1",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "righteousness"],
    trackTitle: "28 Fundamental Beliefs",
    theologicalContext: "Pillar text defining the divine origin and complete authority of the Holy Scriptures over human traditions.",
    proficiencyScore: 85,
    stage: 2,
    intervalDays: 3,
    retrievalAttempts: 4,
    successfulRetrievals: 4
  },
  {
    id: "rq-ta-3",
    scriptureId: "ta-3",
    reference: "Revelation 14:12",
    text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    keywords: ["patience", "saints", "commandments", "faith"],
    trackTitle: "Three Angels' Messages",
    theologicalContext: "The crowning portrait of God's end-time remnant who uphold all Ten Commandments through living faith in Christ.",
    proficiencyScore: 70,
    stage: 1,
    intervalDays: 1,
    retrievalAttempts: 2,
    successfulRetrievals: 1
  },
  {
    id: "rq-sd-1",
    scriptureId: "sd-1",
    reference: "Daniel 8:14",
    text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    keywords: ["sanctuary", "cleansed", "days", "two thousand"],
    trackTitle: "Sanctuary Doctrine",
    theologicalContext: "Prophetic foundation marking the transition to the Investigative Judgment and Christ's final high-priestly ministry in 1844.",
    proficiencyScore: 60,
    stage: 1,
    intervalDays: 1,
    retrievalAttempts: 1,
    successfulRetrievals: 1
  },
  {
    id: "rq-mv-4",
    scriptureId: "mv-4",
    reference: "Exodus 20:8-11",
    text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the Lord thy God.",
    keywords: ["remember", "sabbath", "holy", "seventh", "created"],
    trackTitle: "28 Fundamental Beliefs",
    theologicalContext: "The central seal of the Decalogue identifying the Creator God, His divine territory, and perpetual memorial of creation.",
    proficiencyScore: 90,
    stage: 3,
    intervalDays: 5,
    retrievalAttempts: 6,
    successfulRetrievals: 6
  },
  {
    id: "rq-bb-1",
    scriptureId: "bb-1",
    reference: "Hebrews 11:1",
    text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    keywords: ["faith", "substance", "hoped", "evidence", "seen"],
    trackTitle: "Book-by-Book Memory",
    theologicalContext: "The biblical definition of dynamic faith as living conviction rooted in the promises of God.",
    proficiencyScore: 80,
    stage: 2,
    intervalDays: 3,
    retrievalAttempts: 3,
    successfulRetrievals: 3
  },
  {
    id: "rq-ss-1",
    scriptureId: "ss-1",
    reference: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    keywords: ["come", "labour", "heavy", "rest", "laden"],
    trackTitle: "Sabbath School Golden Verse",
    theologicalContext: "Christ's invitation to true spiritual Sabbath rest and redemption from the burden of sin and self-effort.",
    proficiencyScore: 95,
    stage: 4,
    intervalDays: 7,
    retrievalAttempts: 8,
    successfulRetrievals: 8
  },
  {
    id: "rq-fb-2",
    scriptureId: "fb-2",
    reference: "Romans 1:16",
    text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
    keywords: ["ashamed", "gospel", "power", "salvation", "believeth"],
    trackTitle: "28 Fundamental Beliefs",
    theologicalContext: "The unyielding power of the gospel of grace transforming lives from death unto eternal life.",
    proficiencyScore: 75,
    stage: 2,
    intervalDays: 3,
    retrievalAttempts: 3,
    successfulRetrievals: 2
  }
];

/**
 * Calculates decay status and days remaining
 */
export function calculateDecayStatus(dueAtIso: string, intervalDays: number): "Optimal" | "Stable" | "Moderate" | "Review Due" {
  const now = Date.now();
  const due = new Date(dueAtIso).getTime();
  const diffMs = due - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return "Review Due";
  } else if (diffHours < 24) {
    return "Moderate";
  } else if (diffHours < intervalDays * 24 * 0.5) {
    return "Stable";
  }
  return "Optimal";
}

/**
 * Returns user settings with safe fallbacks
 */
export function getUserRecallSettings(): UserRecallSettings {
  if (typeof window === "undefined") {
    return {
      dailyVerseLimit: 5,
      decayIntervalDays: 3,
      popupsEnabled: true,
      snoozeMinutes: 15
    };
  }

  const rawLimit = localStorage.getItem(STORAGE_KEYS.DAILY_LIMIT);
  const rawInterval = localStorage.getItem(STORAGE_KEYS.DECAY_INTERVAL);
  const rawEnabled = localStorage.getItem(STORAGE_KEYS.POPUPS_ENABLED);

  const dailyVerseLimit = rawLimit ? Math.max(1, Math.min(7, parseInt(rawLimit, 10) || 5)) : 5;
  const decayIntervalDays = rawInterval ? Math.max(1, Math.min(14, parseInt(rawInterval, 10) || 3)) : 3;
  const popupsEnabled = rawEnabled !== "false";

  return {
    dailyVerseLimit,
    decayIntervalDays,
    popupsEnabled,
    snoozeMinutes: 15
  };
}

/**
 * Updates user settings and synchronizes
 */
export function updateUserRecallSettings(partial: Partial<UserRecallSettings>): UserRecallSettings {
  const current = getUserRecallSettings();
  const updated = { ...current, ...partial };

  if (typeof window !== "undefined") {
    if (partial.dailyVerseLimit !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DAILY_LIMIT, updated.dailyVerseLimit.toString());
    }
    if (partial.decayIntervalDays !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DECAY_INTERVAL, updated.decayIntervalDays.toString());
    }
    if (partial.popupsEnabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.POPUPS_ENABLED, updated.popupsEnabled ? "true" : "false");
    }
    window.dispatchEvent(new CustomEvent("stba-recall-settings-changed", { detail: updated }));
  }

  return updated;
}

/**
 * Gets or initializes the Recall Queue items with proper Spaced Repetition timestamps
 */
export function getRecallQueue(): RecallQueueItem[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(STORAGE_KEYS.QUEUE_ITEMS);
  const settings = getUserRecallSettings();
  const baseInterval = settings.decayIntervalDays;

  if (saved) {
    try {
      const items: RecallQueueItem[] = JSON.parse(saved);
      // Re-evaluate dynamic decay statuses
      return items.map((item) => ({
        ...item,
        decayStatus: calculateDecayStatus(item.dueAt, item.intervalDays || baseInterval)
      }));
    } catch (e) {
      console.warn("Error parsing recall queue, falling back to seed items:", e);
    }
  }

  // Generate initial seed queue with staggered due dates based on decay intervals
  const now = Date.now();
  const initialItems: RecallQueueItem[] = DEFAULT_SEED_SCRIPTURES.map((seed, idx) => {
    // Spread initial due timestamps: some due now, some due in 1 day, some in 3 days
    const hoursOffset = idx === 0 ? -2 : idx === 1 ? -0.5 : idx === 2 ? 4 : (idx * 18);
    const dueTime = new Date(now + hoursOffset * 60 * 60 * 1000).toISOString();
    const lastTime = new Date(now - (idx + 1) * 24 * 60 * 60 * 1000).toISOString();
    const interval = seed.stage === 1 ? 1 : seed.stage === 2 ? baseInterval : baseInterval * 2;

    return {
      ...seed,
      intervalDays: interval,
      lastReviewedAt: lastTime,
      dueAt: dueTime,
      decayStatus: calculateDecayStatus(dueTime, interval)
    };
  });

  saveRecallQueue(initialItems);
  return initialItems;
}

/**
 * Saves recall queue to local storage
 */
export function saveRecallQueue(items: RecallQueueItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.QUEUE_ITEMS, JSON.stringify(items));
}

/**
 * Adds a scripture to the user's active recall schedule
 */
export function addScriptureToRecallQueue(scripture: {
  reference: string;
  text: string;
  trackTitle?: string;
  theologicalContext?: string;
}): RecallQueueItem {
  const queue = getRecallQueue();
  const now = Date.now();
  const cleanRef = scripture.reference.trim();

  // Check if item with identical reference already exists in queue
  const existingIndex = queue.findIndex(
    (q) => q.reference.toLowerCase().trim() === cleanRef.toLowerCase()
  );
  if (existingIndex !== -1) {
    // Bring to top and mark due for review
    const existing = queue[existingIndex];
    existing.dueAt = new Date(now).toISOString();
    existing.decayStatus = "Review Due";
    queue.splice(existingIndex, 1);
    queue.unshift(existing);
    saveRecallQueue(queue);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("stba-recall-queue-updated", { detail: { item: existing, queue } }));
    }
    return existing;
  }

  // Extract keywords
  const keywords = scripture.text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !["which", "shall", "unto", "there", "their", "these", "about"].includes(w))
    .slice(0, 5);

  const id = `rq-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const scriptureId = `custom-${Date.now()}`;

  const newItem: RecallQueueItem = {
    id,
    scriptureId,
    reference: cleanRef,
    text: scripture.text.trim(),
    keywords: keywords.length > 0 ? keywords : ["scripture", "truth", "faith"],
    trackTitle: scripture.trackTitle || "Scripture Memory",
    theologicalContext: scripture.theologicalContext || `Scripture committed to memory from ${cleanRef}.`,
    proficiencyScore: 50,
    stage: 1,
    intervalDays: 1,
    lastReviewedAt: new Date(now).toISOString(),
    dueAt: new Date(now).toISOString(),
    retrievalAttempts: 0,
    successfulRetrievals: 0,
    decayStatus: "Review Due"
  };

  queue.unshift(newItem);
  saveRecallQueue(queue);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("stba-recall-queue-updated", { detail: { newItem, queue } }));
  }

  return newItem;
}

/**
 * Pulls current daily recall progress (date-checked)
 */
export function getDailyRecallProgress(): DailyRecallProgress {
  if (typeof window === "undefined") {
    return {
      date: new Date().toISOString().split("T")[0],
      goal: 5,
      completedToday: 0,
      remaining: 5,
      streak: 0,
      completedVerseIds: []
    };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const settings = getUserRecallSettings();
  const savedDate = localStorage.getItem(STORAGE_KEYS.TODAY_DATE);
  let completedCount = 0;
  let completedIds: string[] = [];

  if (savedDate === todayStr) {
    completedCount = parseInt(localStorage.getItem(STORAGE_KEYS.TODAY_COUNT) || "0", 10);
    try {
      completedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODAY_COMPLETED_IDS) || "[]");
    } catch (e) {
      completedIds = [];
    }
  } else {
    // Reset for new day
    localStorage.setItem(STORAGE_KEYS.TODAY_DATE, todayStr);
    localStorage.setItem(STORAGE_KEYS.TODAY_COUNT, "0");
    localStorage.setItem(STORAGE_KEYS.TODAY_COMPLETED_IDS, "[]");
    completedCount = 0;
    completedIds = [];
  }

  const streak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || "1", 10);
  const goal = settings.dailyVerseLimit;
  const remaining = Math.max(0, goal - completedCount);

  return {
    date: todayStr,
    goal,
    completedToday: completedCount,
    remaining,
    streak,
    completedVerseIds: completedIds
  };
}

/**
 * Returns the highest priority verse waiting in the recall queue
 */
export function getNextDueVerse(preferScriptureId?: string): RecallQueueItem | null {
  const queue = getRecallQueue();
  if (!queue || queue.length === 0) return null;

  if (preferScriptureId) {
    const matched = queue.find((q) => q.scriptureId === preferScriptureId || q.id === preferScriptureId);
    if (matched) return matched;
  }

  const progress = getDailyRecallProgress();
  const todayExcludedIds = new Set(progress.completedVerseIds);

  // 1. Check for items marked "Review Due" that have NOT been completed today
  const overdueUncompleted = queue
    .filter((item) => item.decayStatus === "Review Due" && !todayExcludedIds.has(item.scriptureId))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  if (overdueUncompleted.length > 0) {
    return overdueUncompleted[0];
  }

  // 2. Check for items due soon or lowest proficiency not completed today
  const eligibleUncompleted = queue
    .filter((item) => !todayExcludedIds.has(item.scriptureId))
    .sort((a, b) => {
      if (a.stage !== b.stage) return a.stage - b.stage;
      return a.proficiencyScore - b.proficiencyScore;
    });

  if (eligibleUncompleted.length > 0) {
    return eligibleUncompleted[0];
  }

  // 3. Fallback: least recently reviewed verse in queue
  return [...queue].sort((a, b) => new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime())[0];
}

/**
 * Determines if the current user is properly signed in and has customized their study settings
 */
export function hasUserCustomizedSettings(user?: UserAccount | null): boolean {
  if (typeof window === "undefined") return false;

  // 1. Resolve current user profile
  let currentUser = user;
  if (!currentUser) {
    const savedUserStr = localStorage.getItem("stba_user_profile");
    if (savedUserStr) {
      try {
        currentUser = JSON.parse(savedUserStr);
      } catch (e) {
        currentUser = null;
      }
    }
  }

  // Must be signed in (not null, and not guest)
  if (!currentUser || currentUser.isGuest || currentUser.emailVerified === false) {
    return false;
  }

  // 2. Check if user has explicitly customized their discipleship & recall settings
  const explicitCustomized = localStorage.getItem(STORAGE_KEYS.SETTINGS_CUSTOMIZED) === "true";
  const hasCustomLimit = localStorage.getItem(STORAGE_KEYS.DAILY_LIMIT) !== null;
  const hasCustomDecay = localStorage.getItem(STORAGE_KEYS.DECAY_INTERVAL) !== null;
  const hasCustomPopups = localStorage.getItem(STORAGE_KEYS.POPUPS_ENABLED) !== null;
  const hasCustomTranslation =
    localStorage.getItem("stba_primary_translation") !== null ||
    localStorage.getItem("stba_bible_version") !== null;

  return (
    explicitCustomized ||
    hasCustomLimit ||
    hasCustomDecay ||
    hasCustomPopups ||
    hasCustomTranslation
  );
}

/**
 * Calculates a friendly message indicating the next scheduled reminder time
 */
export function getNextReminderTimeString(minutesFromNow = 20): {
  message: string;
  formattedTime: string;
  minutes: number;
} {
  const targetDate = new Date(Date.now() + minutesFromNow * 60 * 1000);
  const formattedTime = targetDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  return {
    message: `Your next reminder is in ${minutesFromNow} minutes (${formattedTime}).`,
    formattedTime,
    minutes: minutesFromNow
  };
}

/**
 * Checks whether the Recall Pop-Up is allowed to appear right now
 */
export function canTriggerRecallPopup(
  currentPathname: string,
  user?: UserAccount | null
): {
  canTrigger: boolean;
  reason?: string;
  verse?: RecallQueueItem | null;
  progress: DailyRecallProgress;
} {
  const settings = getUserRecallSettings();
  const progress = getDailyRecallProgress();

  // 0. Exclude Home / Landing / Marketing and Public routes
  const normalizedPath = (currentPathname || "").trim().toLowerCase();
  const isHomePage =
    normalizedPath === "/" ||
    normalizedPath === "" ||
    normalizedPath === "/home" ||
    normalizedPath === "/landing" ||
    normalizedPath === "/welcome" ||
    normalizedPath === "/pricing" ||
    normalizedPath === "/walkthrough" ||
    normalizedPath === "/technology" ||
    normalizedPath === "/learn-more";

  if (isHomePage) {
    return {
      canTrigger: false,
      reason: "Recall prompts are disabled on the public Home/landing page",
      progress
    };
  }

  // 1. Mandatory Sign-In and Customized Settings check
  if (!hasUserCustomizedSettings(user)) {
    return {
      canTrigger: false,
      reason: "User must be signed in and have customized their scripture recall preferences before recall pop-ups appear",
      progress
    };
  }

  // 2. Settings check (pop-ups enabled in user preferences)
  if (!settings.popupsEnabled) {
    return { canTrigger: false, reason: "Pop-ups disabled in user preferences", progress };
  }

  // 3. Excluded routes (during login/signup or when already on dedicated Recall Session)
  const excludedPrefixes = [
    "/signin",
    "/signup",
    "/sign-up",
    "/create-account",
    "/onboarding",
    "/recall"
  ];
  if (excludedPrefixes.some((p) => normalizedPath.startsWith(p))) {
    return { canTrigger: false, reason: "User is on an excluded view/auth route", progress };
  }

  // 4. Daily capacity check (Goal: 1-7)
  if (progress.completedToday >= progress.goal) {
    return { canTrigger: false, reason: "Daily Verse Recall Goal reached for today", progress };
  }

  // 5. Snooze timer check
  if (typeof window !== "undefined") {
    const snoozeUntil = parseInt(localStorage.getItem(STORAGE_KEYS.SNOOZE_UNTIL) || "0", 10);
    if (Date.now() < snoozeUntil) {
      const remainingMinutes = Math.ceil((snoozeUntil - Date.now()) / (60 * 1000));
      return { canTrigger: false, reason: `Pop-up snoozed for ${remainingMinutes}m`, progress };
    }

    // 6. Cooldown to avoid continuous jarring interruptions (minimum 90 seconds between pop-ups)
    const lastShown = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SHOWN) || "0", 10);
    const cooldownMs = 90 * 1000;
    if (Date.now() - lastShown < cooldownMs) {
      return { canTrigger: false, reason: "Pop-up cooldown period active", progress };
    }
  }

  // 7. Find next due verse
  const nextVerse = getNextDueVerse();
  if (!nextVerse) {
    return { canTrigger: false, reason: "No eligible verses found in recall queue", progress };
  }

  return {
    canTrigger: true,
    verse: nextVerse,
    progress
  };
}

/**
 * Snoozes pop-up for specified minutes (default 15)
 */
export function snoozeRecallPopup(minutes = 15): void {
  if (typeof window === "undefined") return;
  const snoozeUntil = Date.now() + minutes * 60 * 1000;
  localStorage.setItem(STORAGE_KEYS.SNOOZE_UNTIL, snoozeUntil.toString());
  window.dispatchEvent(new CustomEvent("stba-recall-snoozed", { detail: { snoozeUntil, minutes } }));
}

/**
 * Postpones recall popups for the rest of today
 */
export function postponeRecallForToday(): void {
  if (typeof window === "undefined") return;
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  localStorage.setItem(STORAGE_KEYS.SNOOZE_UNTIL, midnight.getTime().toString());
}

/**
 * Marks that a pop-up was displayed (updates last shown timestamp)
 */
export function recordPopupImpression(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.LAST_SHOWN, Date.now().toString());
}

/**
 * Records a completed recall event (from mini-quiz or full session)
 */
export function recordRecallCompletion(
  scriptureId: string,
  score: number, // 0 - 100
  options?: {
    isMiniQuiz?: boolean;
    answers?: Record<string, string>;
    reflectionNote?: string;
  }
): { success: boolean; nextDue: string; updatedProgress: DailyRecallProgress } {
  const queue = getRecallQueue();
  const settings = getUserRecallSettings();
  const todayStr = new Date().toISOString().split("T")[0];
  const now = Date.now();

  let matched = queue.find((q) => q.scriptureId === scriptureId || q.id === scriptureId);
  if (!matched) {
    // If not in queue, build one from presets
    const seedMatch = DEFAULT_SEED_SCRIPTURES.find((s) => s.scriptureId === scriptureId);
    if (seedMatch) {
      matched = {
        ...seedMatch,
        intervalDays: settings.decayIntervalDays,
        lastReviewedAt: new Date(now).toISOString(),
        dueAt: new Date(now + settings.decayIntervalDays * 24 * 60 * 60 * 1000).toISOString(),
        decayStatus: "Optimal"
      };
      queue.push(matched);
    }
  }

  let nextInterval = settings.decayIntervalDays;
  let nextDueIso = new Date(now + settings.decayIntervalDays * 24 * 60 * 60 * 1000).toISOString();

  if (matched) {
    matched.retrievalAttempts += 1;
    if (score >= 70) {
      matched.successfulRetrievals += 1;
      matched.stage = Math.min(4, matched.stage + 1);
      matched.proficiencyScore = Math.min(100, Math.round(matched.proficiencyScore * 0.4 + score * 0.6));
      // Increase interval based on Leitner stage
      const multiplier = matched.stage === 1 ? 1 : matched.stage === 2 ? 2 : matched.stage === 3 ? 4 : 8;
      nextInterval = Math.max(1, settings.decayIntervalDays * multiplier);
    } else {
      matched.stage = Math.max(1, matched.stage - 1);
      matched.proficiencyScore = Math.max(20, Math.round(matched.proficiencyScore * 0.5 + score * 0.5));
      nextInterval = 1; // Immediate 1-day review for struggling verses
    }

    matched.intervalDays = nextInterval;
    matched.lastReviewedAt = new Date(now).toISOString();
    matched.dueAt = new Date(now + nextInterval * 24 * 60 * 60 * 1000).toISOString();
    matched.decayStatus = calculateDecayStatus(matched.dueAt, matched.intervalDays);
    nextDueIso = matched.dueAt;

    saveRecallQueue(queue);
  }

  // Update daily progress counter
  const progress = getDailyRecallProgress();
  const newCompletedToday = progress.completedToday + 1;
  const completedIds = Array.from(new Set([...progress.completedVerseIds, scriptureId]));

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.TODAY_DATE, todayStr);
    localStorage.setItem(STORAGE_KEYS.TODAY_COUNT, newCompletedToday.toString());
    localStorage.setItem(STORAGE_KEYS.TODAY_COMPLETED_IDS, JSON.stringify(completedIds));
    localStorage.setItem("stba_has_completed_session", "true");

    // Update streak logic
    const lastRecallDate = localStorage.getItem(STORAGE_KEYS.LAST_RECALL_DATE);
    if (lastRecallDate !== todayStr) {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      let currentStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || "0", 10);
      if (lastRecallDate === yesterday) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      localStorage.setItem(STORAGE_KEYS.STREAK_COUNT, currentStreak.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_RECALL_DATE, todayStr);
    }
  }

  // Record study activity in unified heatmap/tracker
  recordActivity("activeRecall", {
    minutes: options?.isMiniQuiz ? 3 : 15,
    count: 1,
    note: `Recalled ${matched?.reference || scriptureId} (${score}% accuracy)`
  });

  const updatedProgress: DailyRecallProgress = {
    date: todayStr,
    goal: settings.dailyVerseLimit,
    completedToday: newCompletedToday,
    remaining: Math.max(0, settings.dailyVerseLimit - newCompletedToday),
    streak: parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || "1", 10),
    completedVerseIds: completedIds
  };

  // Dispatch events for real-time reactivity across all screens
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("stba-recall-completed", {
        detail: {
          scriptureId,
          score,
          verse: matched,
          progress: updatedProgress
        }
      })
    );
  }

  return {
    success: true,
    nextDue: nextDueIso,
    updatedProgress
  };
}

/**
 * Manually dispatches a trigger event for testing or previewing the pop-up
 */
export function triggerManualRecallPopup(customScriptureId?: string): void {
  if (typeof window === "undefined") return;
  const verse = getNextDueVerse(customScriptureId);
  window.dispatchEvent(
    new CustomEvent("stba-trigger-recall-popup", {
      detail: { verse }
    })
  );
}
