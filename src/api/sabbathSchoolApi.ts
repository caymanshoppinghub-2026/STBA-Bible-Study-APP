/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LessonParagraph {
  type?: string;
  text: string;
}

export interface DailyLesson {
  label: string;
  title: string;
  status: string; // e.g. "Not started", "In progress", "Completed"
  content?: string | LessonParagraph[] | string[];
  egwNotes?: string[] | string;
  scriptures?: string[];
}

export interface SabbathClassCard {
  id: string;
  question: string;
  answer: string;
  category?: string;
  totalAttempts?: number;
  successRate?: number;
}

export interface SabbathSchoolLessonPackage {
  quarterlyTitle: string;
  lessonTitle: string;
  memoryVerse: string;
  dailyLessons: DailyLesson[];
  deckCards: SabbathClassCard[];
}

/**
 * Parses raw Sabbath School lesson text into a structured outline and cards.
 * Calls `/api/sabbath/parse` endpoint.
 */
export async function parseSabbathSchoolLesson(text: string): Promise<SabbathSchoolLessonPackage> {
  try {
    const response = await fetch("/api/sabbath/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] parseSabbathSchoolLesson network warning:", e);
  }

  // Fallback parsing locally
  return {
    quarterlyTitle: "Adult Bible Study Guide",
    lessonTitle: "Scripture Study Outline",
    memoryVerse: "“Thy word is a lamp unto my feet, and a light unto my path.” (Psalm 119:105)",
    dailyLessons: [
      { label: "Sabbath Afternoon", title: "Introduction & Context", status: "Not started", content: text ? text.slice(0, 400) : "Deepen your study of God's Word with historic Seventh-day Adventist hermeneutics." }
    ],
    deckCards: []
  };
}

/**
 * Triggers the automatic Sabbath School Quarterly scraper to pull content from Adventech.
 */
export async function scrapeQuarterlyLesson(targetUrl: string = ""): Promise<SabbathSchoolLessonPackage> {
  try {
    const response = await fetch("/api/sabbath/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: targetUrl }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] scrapeQuarterlyLesson network warning:", e);
  }

  return {
    quarterlyTitle: "Adult Bible Study Guide - Seventh-day Adventist Church",
    lessonTitle: "The Sanctuary and the Three Angels' Messages",
    memoryVerse: "“Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.” (Revelation 14:12)",
    dailyLessons: [],
    deckCards: []
  };
}

/**
 * Checks and triggers the daily automatic update cycle if enabled.
 */
export async function triggerAutoUpdate(enabled: boolean): Promise<SabbathSchoolLessonPackage | { status: string; message: string }> {
  try {
    const response = await fetch("/api/sabbath/auto-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] triggerAutoUpdate network warning:", e);
  }

  return { status: "offline", message: "Operating in resilient local mode" };
}

/**
 * Fetches Sabbath School Quarterly content for a manually selected specific date from Adventech.
 */
export async function fetchLessonByDate(dateStr: string): Promise<SabbathSchoolLessonPackage & { selectedDate?: string }> {
  try {
    const response = await fetch("/api/sabbath/fetch-by-date", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: dateStr }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] fetchLessonByDate network warning:", e);
  }

  return {
    quarterlyTitle: "Adult Bible Study Guide",
    lessonTitle: "Sabbath School Lesson",
    memoryVerse: "“Thy word is true from the beginning: and every one of thy righteous judgments endureth for ever.” (Psalm 119:160)",
    dailyLessons: [],
    deckCards: [],
    selectedDate: dateStr
  };
}

/**
 * Retrieves live real-time classroom analytics and student activity feed.
 */
export async function getClassroomAnalytics(): Promise<{
  classCode: string;
  className: string;
  teacherName: string;
  totalStudents: number;
  complianceRate: number;
  activeDiscussions: number;
  activityLogsCount: number;
  gapsList: Array<{ topic: string; gapPercentage: number; count: number }>;
  roster: Array<{ id: string; name: string; role: string; status: string; progress: number; lastActive: string }>;
}> {
  try {
    const response = await fetch("/api/sabbath/classroom-analytics");
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] getClassroomAnalytics network warning:", e);
  }

  return {
    classCode: "SDA-7788",
    className: "Berean Adult Sanctuary Class",
    teacherName: "Elder Stephen",
    totalStudents: 14,
    complianceRate: 88,
    activeDiscussions: 5,
    activityLogsCount: 42,
    gapsList: [
      { topic: "The 2300-Day Prophecy Anchor", gapPercentage: 24, count: 6 },
      { topic: "Sanctuary Cleansing & Most Holy Place", gapPercentage: 18, count: 4 },
      { topic: "Seal of God vs Mark of the Beast", gapPercentage: 12, count: 3 }
    ],
    roster: [
      { id: "1", name: "Elder Stephen", role: "Teacher", status: "Active", progress: 100, lastActive: "Just now" },
      { id: "2", name: "Jeremy (You)", role: "Student", status: "Active", progress: 75, lastActive: "Just now" },
      { id: "3", name: "Sister Maria", role: "Student", status: "Active", progress: 90, lastActive: "10m ago" },
      { id: "4", name: "Brother Daniel", role: "Student", status: "Active", progress: 60, lastActive: "1h ago" }
    ]
  };
}

/**
 * Updates classroom enrollment status (join/leave/create class).
 */
export async function updateClassroomEnrollment(payload: {
  action: "enroll" | "leave" | "create_class";
  userName?: string;
  role?: "Teacher" | "Student";
  classCode?: string;
  className?: string;
}): Promise<any> {
  try {
    const response = await fetch("/api/sabbath/enrollment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] updateClassroomEnrollment network warning:", e);
  }

  return { success: true, localFallback: true };
}

/**
 * Records live student activity (lesson completion, chat interaction, probe test, learning gap).
 */
export async function recordClassroomActivity(payload: {
  userName?: string;
  activityType: "lesson_complete" | "chat_discussion" | "deck_probe" | "question_gap";
  topic?: string;
  progressDelta?: number;
}): Promise<any> {
  try {
    const response = await fetch("/api/sabbath/record-activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("[SabbathAPI] recordClassroomActivity network warning:", e);
  }

  return { success: true, localFallback: true };
}

/**
 * Retrieves the current synchronized Sabbath School payload (Videos, EGW notes timestamps, 7 daily lessons)
 */
export async function getSabbathSchoolSyncData(forceRefresh: boolean = false): Promise<any> {
  try {
    const url = forceRefresh ? "/api/sabbath/sync/trigger" : "/api/sabbath/sync/current";
    const method = forceRefresh ? "POST" : "GET";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      const data = await response.json();
      return forceRefresh && data.payload ? data.payload : data;
    }
  } catch (err) {
    console.warn("[SabbathAPI] getSabbathSchoolSyncData warning:", err);
  }
  return null;
}

/**
 * Triggers manual immediate synchronization of weekly Sabbath School content from YouTube and ABSG.
 */
export async function triggerSabbathSchoolSync(): Promise<any> {
  return getSabbathSchoolSyncData(true);
}

/**
 * Retrieves the latest official Sabbath School video links for all 4 channels.
 */
export async function getSabbathSchoolVideos(): Promise<any> {
  try {
    const response = await fetch("/api/sabbath/videos");
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("[SabbathAPI] getSabbathSchoolVideos warning:", err);
  }
  return null;
}

/**
 * Retrieves the latest 7-day EGW notes breakdown with direct timestamp links.
 */
export async function getEgwNotesDailyBreakdown(): Promise<any> {
  try {
    const response = await fetch("/api/sabbath/egw-notes");
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("[SabbathAPI] getEgwNotesDailyBreakdown warning:", err);
  }
  return null;
}

/**
 * Retrieves the 3 horizontal theological takeaways synthesized directly from scraped source website Talking Points.
 */
export async function getTheologicalTakeawaysFromSource(forceRefresh: boolean = false): Promise<any> {
  try {
    const url = `/api/sabbath/theological-takeaways?refresh=${forceRefresh ? "true" : "false"}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("[SabbathAPI] getTheologicalTakeawaysFromSource warning:", err);
  }
  return null;
}

/**
 * Retrieves the raw scraped Talking Points from the source website.
 */
export async function getScrapedLessonTalkingPoints(): Promise<any> {
  try {
    const response = await fetch("/api/sabbath/scraped-talking-points");
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("[SabbathAPI] getScrapedLessonTalkingPoints warning:", err);
  }
  return null;
}


