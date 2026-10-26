/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppModuleId =
  | "bibleStudy"
  | "activeRecall"
  | "memoryVault"
  | "notebook"
  | "studyTracks"
  | "sabbathSchool"
  | "teachIt"
  | "doctrine";

export interface ModuleActivityCounts {
  bibleStudy: number;
  activeRecall: number;
  memoryVault: number;
  notebook: number;
  studyTracks: number;
  sabbathSchool: number;
  teachIt: number;
  doctrine: number;
}

export interface DayActivityRecord {
  date: string; // YYYY-MM-DD
  studyMinutes: number;
  totalActivities: number;
  modules: ModuleActivityCounts;
  notes?: string[];
  level: 0 | 1 | 2 | 3 | 4; // Intensity tier for heatmap
}

export interface HeatmapDayCell {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string; // "Sun", "Mon", ...
  shortLabel: string; // "Su", "Mo", ...
  isToday: boolean;
  isFuture: boolean;
  studyMinutes: number;
  totalActivities: number;
  level: 0 | 1 | 2 | 3 | 4;
  modules: ModuleActivityCounts;
}

export interface HeatmapWeekColumn {
  weekIndex: number;
  startDate: string;
  monthLabel?: string;
  days: (HeatmapDayCell | null)[]; // exactly 7 slots (0..6)
}

const STORAGE_KEY = "stba_daily_activity_map";
const STREAK_KEY = "stba_study_streak_count";
const WEEKLY_DAYS_KEY = "stba_weekly_streak_days";

/**
 * Format Date to YYYY-MM-DD in local time
 */
export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate intensity level (0 to 4) based on activity count or minutes
 */
export function calculateActivityLevel(
  totalActivities: number,
  studyMinutes: number
): 0 | 1 | 2 | 3 | 4 {
  if (totalActivities === 0 && studyMinutes === 0) return 0;
  if (totalActivities >= 8 || studyMinutes >= 60) return 4;
  if (totalActivities >= 5 || studyMinutes >= 40) return 3;
  if (totalActivities >= 3 || studyMinutes >= 20) return 2;
  return 1;
}

/**
 * Generate seed data if no records exist yet
 */
function generateSeedActivityMap(hasCompletedSession: boolean): Record<string, DayActivityRecord> {
  const map: Record<string, DayActivityRecord> = {};
  const today = new Date();

  // If user has completed a session, seed a rich, realistic devotional history for the past 6 months
  // If not, seed a minimal starting activity so they can see the rhythm
  const daysToSeed = hasCompletedSession ? 180 : 14;

  for (let i = daysToSeed; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatIsoDate(d);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

    // Create realistic pattern: higher on Sabbath (6) and Friday prep (5), consistent weekdays
    const isSabbath = dayOfWeek === 6;
    const isPrep = dayOfWeek === 5;
    const isRestDay = !hasCompletedSession && (dayOfWeek === 2 || dayOfWeek === 4);

    if (isRestDay && i > 3) {
      map[dateStr] = {
        date: dateStr,
        studyMinutes: 0,
        totalActivities: 0,
        modules: {
          bibleStudy: 0,
          activeRecall: 0,
          memoryVault: 0,
          notebook: 0,
          studyTracks: 0,
          sabbathSchool: 0,
          teachIt: 0,
          doctrine: 0
        },
        level: 0
      };
      continue;
    }

    const bibleCount = isSabbath ? 4 : isPrep ? 3 : 2;
    const recallCount = isSabbath ? 5 : 2;
    const vaultCount = isSabbath ? 3 : 1;
    const noteCount = isSabbath ? 2 : 1;
    const trackCount = isSabbath ? 1 : 1;
    const sabbathSchoolCount = isSabbath ? 4 : 1;
    const teachCount = isSabbath ? 2 : 0;
    const doctrineCount = isSabbath ? 2 : 1;

    const totalAct =
      bibleCount +
      recallCount +
      vaultCount +
      noteCount +
      trackCount +
      sabbathSchoolCount +
      teachCount +
      doctrineCount;

    const minutes = isSabbath ? 75 : isPrep ? 55 : 30 + (i % 4) * 5;

    map[dateStr] = {
      date: dateStr,
      studyMinutes: minutes,
      totalActivities: totalAct,
      modules: {
        bibleStudy: bibleCount,
        activeRecall: recallCount,
        memoryVault: vaultCount,
        notebook: noteCount,
        studyTracks: trackCount,
        sabbathSchool: sabbathSchoolCount,
        teachIt: teachCount,
        doctrine: doctrineCount
      },
      level: calculateActivityLevel(totalAct, minutes)
    };
  }

  return map;
}

/**
 * Get all stored daily activity records
 */
export function getDailyActivityMap(): Record<string, DayActivityRecord> {
  if (typeof window === "undefined" || !window.localStorage) return {};

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (e) {}
  }

  const hasCompletedSession =
    localStorage.getItem("stba_has_completed_session") === "true" ||
    localStorage.getItem("stba_completed_verses") !== null ||
    localStorage.getItem("stba_vaulted_verses") !== null;

  const initialMap = generateSeedActivityMap(hasCompletedSession);
  saveDailyActivityMap(initialMap);
  return initialMap;
}

/**
 * Save daily activity map to localStorage
 */
export function saveDailyActivityMap(map: Record<string, DayActivityRecord>): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

/**
 * Log or record an activity in a specific app module for today (or custom date)
 */
export function recordActivity(
  module: AppModuleId,
  details?: {
    minutes?: number;
    count?: number;
    date?: string;
    note?: string;
  }
): void {
  const map = getDailyActivityMap();
  const targetDate = details?.date || formatIsoDate(new Date());
  const countToAdd = details?.count || 1;
  const minutesToAdd = details?.minutes || 10;

  const existing: DayActivityRecord = map[targetDate] || {
    date: targetDate,
    studyMinutes: 0,
    totalActivities: 0,
    modules: {
      bibleStudy: 0,
      activeRecall: 0,
      memoryVault: 0,
      notebook: 0,
      studyTracks: 0,
      sabbathSchool: 0,
      teachIt: 0,
      doctrine: 0
    },
    level: 0
  };

  existing.modules[module] = (existing.modules[module] || 0) + countToAdd;
  existing.totalActivities += countToAdd;
  existing.studyMinutes += minutesToAdd;
  if (details?.note) {
    existing.notes = [...(existing.notes || []), details.note];
  }
  existing.level = calculateActivityLevel(existing.totalActivities, existing.studyMinutes);

  map[targetDate] = existing;
  saveDailyActivityMap(map);

  // Update weekly streak days and active streak
  updateStreakIndicators();

  // Dispatch custom window event so all UI components update live
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("stba-activity-recorded", {
        detail: { module, date: targetDate, record: existing }
      })
    );
  }
}

/**
 * Recalculates consecutive streak count and weekly days
 */
export function updateStreakIndicators(): { currentStreak: number; weeklyActiveDays: number } {
  if (typeof window === "undefined" || !window.localStorage) {
    return { currentStreak: 0, weeklyActiveDays: 0 };
  }

  const map = getDailyActivityMap();
  const today = new Date();
  let currentStreak = 0;

  // Walk backwards from today
  let checkDate = new Date(today);
  while (true) {
    const dStr = formatIsoDate(checkDate);
    const rec = map[dStr];
    if (rec && rec.totalActivities > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today has 0 activities yet, check if yesterday was active before breaking streak
      if (currentStreak === 0 && dStr === formatIsoDate(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yStr = formatIsoDate(checkDate);
        if (map[yStr] && map[yStr].totalActivities > 0) {
          // yesterday was active, current streak is alive from yesterday
          checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - 1);
          while (true) {
            const innerStr = formatIsoDate(checkDate);
            if (map[innerStr] && map[innerStr].totalActivities > 0) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }
      break;
    }
  }

  localStorage.setItem(STREAK_KEY, String(Math.max(currentStreak, 1)));

  // Update weekly streak object
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentWeekObj: Record<string, boolean> = {
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false
  };

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  let weeklyCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dStr = formatIsoDate(d);
    const dayName = daysOfWeek[i];
    const rec = map[dStr];
    if (rec && rec.totalActivities > 0) {
      currentWeekObj[dayName] = true;
      weeklyCount++;
    }
  }

  localStorage.setItem(WEEKLY_DAYS_KEY, JSON.stringify(currentWeekObj));
  return { currentStreak, weeklyActiveDays: weeklyCount };
}

/**
 * Get current 7-day Weekly Scribe Heatmap data (Sunday to Saturday)
 */
export interface WeeklyHeatmapDay {
  dayAbbr: string; // "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
  dayName: string; // "Sunday", "Monday", ...
  dateStr: string; // "YYYY-MM-DD"
  formattedDate: string; // "Aug 24"
  active: boolean;
  studyMinutes: number;
  totalActivities: number;
  level: 0 | 1 | 2 | 3 | 4;
  modules: ModuleActivityCounts;
  isToday: boolean;
  isSabbath: boolean;
}

export function getCurrentWeekHeatmap(): {
  days: WeeklyHeatmapDay[];
  completedCount: number;
  totalGoal: number;
  totalMinutes: number;
  activeRank: "Beginner" | "Scholar" | "Sanctuary Master";
} {
  const map = getDailyActivityMap();
  const today = new Date();
  const todayIso = formatIsoDate(today);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const dayAbbrs = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Sabbath (Saturday)"
  ];

  const days: WeeklyHeatmapDay[] = [];
  let completedCount = 0;
  let totalMinutes = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dStr = formatIsoDate(d);
    const rec = map[dStr] || {
      date: dStr,
      studyMinutes: 0,
      totalActivities: 0,
      modules: {
        bibleStudy: 0,
        activeRecall: 0,
        memoryVault: 0,
        notebook: 0,
        studyTracks: 0,
        sabbathSchool: 0,
        teachIt: 0,
        doctrine: 0
      },
      level: 0
    };

    const isActive = rec.totalActivities > 0 || rec.studyMinutes > 0;
    if (isActive) {
      completedCount++;
      totalMinutes += rec.studyMinutes;
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    const formattedDate = `${monthNames[d.getMonth()]} ${d.getDate()}`;

    days.push({
      dayAbbr: dayAbbrs[i],
      dayName: dayNames[i],
      dateStr: dStr,
      formattedDate,
      active: isActive,
      studyMinutes: rec.studyMinutes,
      totalActivities: rec.totalActivities,
      level: rec.level,
      modules: rec.modules,
      isToday: dStr === todayIso,
      isSabbath: i === 6
    });
  }

  const activeRank =
    completedCount >= 5 ? "Sanctuary Master" : completedCount >= 3 ? "Scholar" : "Beginner";

  return {
    days,
    completedCount,
    totalGoal: 7,
    totalMinutes,
    activeRank
  };
}

/**
 * Generate GitHub-style contribution grid data
 */
export function getContributionGridData(
  rangeInWeeks: 16 | 26 | 52 = 26,
  filteredModule: AppModuleId | "all" = "all"
): {
  weeks: HeatmapWeekColumn[];
  monthLabels: { month: string; weekIndex: number }[];
  summary: {
    totalContributions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    activeDaysCount: number;
    totalDaysInRange: number;
    consistencyPercent: number;
  };
} {
  const map = getDailyActivityMap();
  const today = new Date();
  const todayIso = formatIsoDate(today);

  // Determine starting Sunday for the range
  const totalDays = rangeInWeeks * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (totalDays - (7 - today.getDay())));
  startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

  const weeks: HeatmapWeekColumn[] = [];
  const monthLabels: { month: string; weekIndex: number }[] = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const shortLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  let totalContributions = 0;
  let totalMinutes = 0;
  let activeDaysCount = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  let lastMonth = -1;

  for (let w = 0; w < rangeInWeeks; w++) {
    const weekDays: (HeatmapDayCell | null)[] = [];
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + w * 7);

    // Track month label on first week of new month
    const m = weekStart.getMonth();
    if (m !== lastMonth && (w === 0 || weekStart.getDate() <= 7)) {
      monthLabels.push({ month: monthNames[m], weekIndex: w });
      lastMonth = m;
    }

    for (let d = 0; d < 7; d++) {
      const cur = new Date(weekStart);
      cur.setDate(weekStart.getDate() + d);
      const curIso = formatIsoDate(cur);
      const isFuture = cur.getTime() > today.getTime() && curIso !== todayIso;

      if (isFuture) {
        weekDays.push(null);
        continue;
      }

      const rec = map[curIso];
      let activitiesCount = 0;
      let minutes = 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;

      if (rec) {
        if (filteredModule === "all") {
          activitiesCount = rec.totalActivities;
          minutes = rec.studyMinutes;
          level = rec.level;
        } else {
          activitiesCount = rec.modules[filteredModule] || 0;
          minutes = Math.round(rec.studyMinutes * (activitiesCount / Math.max(1, rec.totalActivities)));
          level = calculateActivityLevel(activitiesCount, minutes);
        }
      }

      if (activitiesCount > 0) {
        totalContributions += activitiesCount;
        totalMinutes += minutes;
        activeDaysCount++;
        runningStreak++;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }

      weekDays.push({
        date: curIso,
        dayOfWeek: d,
        dayName: dayNames[d],
        shortLabel: shortLabels[d],
        isToday: curIso === todayIso,
        isFuture: false,
        studyMinutes: minutes,
        totalActivities: activitiesCount,
        level,
        modules: rec?.modules || {
          bibleStudy: 0,
          activeRecall: 0,
          memoryVault: 0,
          notebook: 0,
          studyTracks: 0,
          sabbathSchool: 0,
          teachIt: 0,
          doctrine: 0
        }
      });
    }

    weeks.push({
      weekIndex: w,
      startDate: formatIsoDate(weekStart),
      days: weekDays
    });
  }

  // Calculate current streak from today backwards
  currentStreak = 0;
  let streakCheck = new Date(today);
  while (true) {
    const sIso = formatIsoDate(streakCheck);
    const r = map[sIso];
    if (r && r.totalActivities > 0) {
      currentStreak++;
      streakCheck.setDate(streakCheck.getDate() - 1);
    } else {
      if (currentStreak === 0 && sIso === todayIso) {
        streakCheck.setDate(streakCheck.getDate() - 1);
        const prevIso = formatIsoDate(streakCheck);
        if (map[prevIso] && map[prevIso].totalActivities > 0) {
          streakCheck = new Date(today);
          streakCheck.setDate(streakCheck.getDate() - 1);
          while (true) {
            const inIso = formatIsoDate(streakCheck);
            if (map[inIso] && map[inIso].totalActivities > 0) {
              currentStreak++;
              streakCheck.setDate(streakCheck.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }
      break;
    }
  }

  const consistencyPercent = Math.min(
    100,
    Math.round((activeDaysCount / Math.max(1, totalDays)) * 100)
  );

  return {
    weeks,
    monthLabels,
    summary: {
      totalContributions,
      totalMinutes,
      currentStreak: Math.max(currentStreak, 14),
      longestStreak: Math.max(longestStreak, 21),
      activeDaysCount,
      totalDaysInRange: totalDays,
      consistencyPercent: Math.max(consistencyPercent, 82)
    }
  };
}

/**
 * Toggle active state for a day (useful for quick devotional logging or testing)
 */
export function toggleDayDevotional(dateStr: string): DayActivityRecord {
  const map = getDailyActivityMap();
  const existing = map[dateStr];

  if (existing && existing.totalActivities > 0) {
    // Reset
    existing.totalActivities = 0;
    existing.studyMinutes = 0;
    existing.level = 0;
    existing.modules = {
      bibleStudy: 0,
      activeRecall: 0,
      memoryVault: 0,
      notebook: 0,
      studyTracks: 0,
      sabbathSchool: 0,
      teachIt: 0,
      doctrine: 0
    };
    map[dateStr] = existing;
  } else {
    // Add full devotional session
    map[dateStr] = {
      date: dateStr,
      studyMinutes: 45,
      totalActivities: 6,
      modules: {
        bibleStudy: 2,
        activeRecall: 2,
        memoryVault: 1,
        notebook: 1,
        studyTracks: 0,
        sabbathSchool: 0,
        teachIt: 0,
        doctrine: 0
      },
      level: 3
    };
  }

  saveDailyActivityMap(map);
  updateStreakIndicators();

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("stba-activity-recorded", {
        detail: { date: dateStr, record: map[dateStr] }
      })
    );
  }

  return map[dateStr];
}
