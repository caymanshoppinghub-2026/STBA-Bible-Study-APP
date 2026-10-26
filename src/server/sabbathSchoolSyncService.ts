/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";

export interface EgwDailyLink {
  dayName: string;
  dayIndex: number;
  dateText: string;
  timestampText: string;
  seconds: number;
  url: string;
}

export interface WeeklyVideoItem {
  channelKey: "featured" | "itiswritten" | "hope" | "threeABN";
  channelName: string;
  channelHandle: string;
  title: string;
  videoId: string;
  url: string;
  embedUrl: string;
  publishedText: string;
  isCurrentWeek: boolean;
  lessonNumberText: string;
}

export interface DailyLessonSection {
  dayIndex: number; // 0 to 6
  dayName: string; // Sabbath Afternoon, Sunday, etc.
  dateString: string;
  title: string;
  lessonContent: string[];
  egwNotes: string[];
  egwVideoUrl: string;
  egwTimestampText: string;
  egwTimestampSeconds: number;
}

export interface SabbathSchoolSyncPayload {
  quarterlyTitle: string;
  quarterId: string;
  lessonId: string;
  lessonTitle: string;
  memoryVerse: string;
  readForThisWeek: string;
  startDate: string;
  endDate: string;
  lastSyncedAt: string;
  nextScheduledSabbath: string;
  timezone: "America/Cayman";
  hasPendingRetries: boolean;
  pendingChannels: string[];
  nextRetryAt?: string;
  videos: {
    featured: WeeklyVideoItem;
    itiswritten: WeeklyVideoItem;
    hope: WeeklyVideoItem;
    threeABN: WeeklyVideoItem;
  };
  egwVideo: {
    videoId: string;
    title: string;
    fullUrl: string;
    statusNotice?: string;
  };
  egwDailyBreakdown: Record<string, EgwDailyLink>;
  dailyLessons: DailyLessonSection[];
  formattedOutput: {
    videoLinks: {
      featured: string;
      itIsWritten: string;
      hopeSabbathSchool: string;
      threeABNPanel: string;
    };
    egwNotesDailyBreakdown: string[];
    lessonDailyBreakdown: string[];
  };
}

const STORAGE_DIR = path.join(process.cwd(), "data", "sabbath-school-sync");
const CACHE_FILE = path.join(STORAGE_DIR, "current_week.json");

// Canonical baseline verified for 2026 Q4 Lesson 4: "New Testament Prophets"
export const CANONICAL_BASELINE: SabbathSchoolSyncPayload = {
  quarterlyTitle: "The Gift of Prophecy",
  quarterId: "2026-04",
  lessonId: "04",
  lessonTitle: "New Testament Prophets",
  memoryVerse:
    "“There are diversities of gifts, but the same Spirit. There are differences of ministries, but the same Lord. And there are diversities of activities, but it is the same God who works all in all” (1 Corinthians 12:4–6, NKJV).",
  readForThisWeek: "Matt. 16:13–16, Eph. 2:20, Rev. 22:6, Luke 2:36–38, Acts 21:9, Eph. 6:10–18.",
  startDate: "17/10/2026",
  endDate: "23/10/2026",
  lastSyncedAt: new Date().toISOString(),
  nextScheduledSabbath: "2026-10-24T11:00:00-05:00",
  timezone: "America/Cayman",
  hasPendingRetries: false,
  pendingChannels: [],
  videos: {
    featured: {
      channelKey: "featured",
      channelName: "Featured Video – Claudio Carneiro",
      channelHandle: "@ClaudioCarneiro",
      title: "2026 Q4 Lesson 4 – New Testament Prophets – Audio by Pastor Clive Nash",
      videoId: "M8jssNYGAJc",
      url: "https://www.youtube.com/watch?v=M8jssNYGAJc",
      embedUrl: "https://www.youtube-nocookie.com/embed/M8jssNYGAJc?autoplay=1&controls=1&enablejsapi=1",
      publishedText: "Current Lesson",
      isCurrentWeek: true,
      lessonNumberText: "Lesson 4"
    },
    itiswritten: {
      channelKey: "itiswritten",
      channelName: "It Is Written Sabbath School",
      channelHandle: "@itiswritten",
      title: "Sabbath School 2026 Q4 Lesson 04 - New Testament Prophets",
      videoId: "2NyUKNOOkPM",
      url: "https://www.youtube.com/watch?v=2NyUKNOOkPM",
      embedUrl: "https://www.youtube-nocookie.com/embed/2NyUKNOOkPM?autoplay=1&controls=1&enablejsapi=1",
      publishedText: "Current Lesson",
      isCurrentWeek: true,
      lessonNumberText: "Lesson 4"
    },
    hope: {
      channelKey: "hope",
      channelName: "Hope Sabbath School",
      channelHandle: "@HopeSabbathSchool",
      title: "Lesson 4 - New Testament Prophets",
      videoId: "EyMutcCbyEY",
      url: "https://www.youtube.com/watch?v=EyMutcCbyEY",
      embedUrl: "https://www.youtube-nocookie.com/embed/EyMutcCbyEY?autoplay=1&controls=1&enablejsapi=1",
      publishedText: "Current Lesson",
      isCurrentWeek: true,
      lessonNumberText: "Lesson 4"
    },
    threeABN: {
      channelKey: "threeABN",
      channelName: "3ABN Sabbath School Panel",
      channelHandle: "@3ABNSabbathSchoolPanelOfficial",
      title: "“New Testament Prophets” | Sabbath School Panel by 3ABN - Lesson 4 Q4 2026",
      videoId: "-nLC32baQKw",
      url: "https://www.youtube.com/watch?v=-nLC32baQKw",
      embedUrl: "https://www.youtube-nocookie.com/embed/-nLC32baQKw?autoplay=1&controls=1&enablejsapi=1",
      publishedText: "Current Lesson",
      isCurrentWeek: true,
      lessonNumberText: "Lesson 4"
    }
  },
  egwVideo: {
    videoId: "d17oRa_jCHg",
    title: "2026 Q4 Lesson 4 – EGW Notes – New Testament Prophets – Audio by Carla Morris",
    fullUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg"
  },
  egwDailyBreakdown: {
    "Sabbath Afternoon": {
      dayName: "Sabbath Afternoon",
      dayIndex: 0,
      dateText: "October 17",
      timestampText: "0:00",
      seconds: 0,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=0s"
    },
    "Sunday": {
      dayName: "Sunday",
      dayIndex: 1,
      dateText: "October 18",
      timestampText: "2:53",
      seconds: 173,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=173s"
    },
    "Monday": {
      dayName: "Monday",
      dayIndex: 2,
      dateText: "October 19",
      timestampText: "6:35",
      seconds: 395,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=395s"
    },
    "Tuesday": {
      dayName: "Tuesday",
      dayIndex: 3,
      dateText: "October 20",
      timestampText: "10:35",
      seconds: 635,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=635s"
    },
    "Wednesday": {
      dayName: "Wednesday",
      dayIndex: 4,
      dateText: "October 21",
      timestampText: "13:30",
      seconds: 810,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=810s"
    },
    "Thursday": {
      dayName: "Thursday",
      dayIndex: 5,
      dateText: "October 22",
      timestampText: "17:55",
      seconds: 1075,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=1075s"
    },
    "Friday": {
      dayName: "Friday",
      dayIndex: 6,
      dateText: "October 23",
      timestampText: "21:04",
      seconds: 1264,
      url: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=1264s"
    }
  },
  dailyLessons: [
    {
      dayIndex: 0,
      dayName: "Sabbath Afternoon",
      dateString: "Saturday, October 17",
      title: "New Testament Prophets",
      lessonContent: [
        "### Memory Verse\n> “There are diversities of gifts, but the same Spirit. There are differences of ministries, but the same Lord. And there are diversities of activities, but it is the same God who works all in all” (1 Corinthians 12:4–6, NKJV).\n\n---",
        "The New Testament church was established on the foundation of the apostles and prophets, Jesus Christ Himself being the chief cornerstone (Eph. 2:20). Through the prophetic office, God directed, comforted, and protected His early disciples.",
        "Just as prophets guided God's covenant people in the Old Testament, the Holy Spirit continued this divine gift in the apostolic era to build up the body of Christ."
      ],
      egwNotes: [
        "In ancient times God spoke to men by the mouth of prophets and apostles. In these days He speaks to them by the testimonies of His Spirit. There was never a time when God instructed His people more earnestly than He instructs them now upon His will and the way that He would have them point.—Testimonies for the Church, vol. 5, p. 661."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=0s",
      egwTimestampText: "0:00",
      egwTimestampSeconds: 0
    },
    {
      dayIndex: 1,
      dayName: "Sunday",
      dateString: "Sunday, October 18",
      title: "Jesus as Prophet",
      lessonContent: [
        "Moses prophesied: 'The LORD your God will raise up for you a Prophet like me from your midst... Him you shall hear' (Deut. 18:15). Jesus Christ is the ultimate fulfillment of this promise.",
        "Christ spoke not merely as an inspired messenger, but as the Living Word and supreme Author of all prophecy."
      ],
      egwNotes: [
        "Christ was the greatest Prophet that ever lived. He was the Light of the world, illuminating the pathway of redemption.—The Desire of Ages, p. 242."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=173s",
      egwTimestampText: "2:53",
      egwTimestampSeconds: 173
    },
    {
      dayIndex: 2,
      dayName: "Monday",
      dateString: "Monday, October 19",
      title: "Apostles and Prophets",
      lessonContent: [
        "Paul explains in Ephesians 4:11-13 that Christ gave some to be apostles, some prophets, some evangelists, and some pastors and teachers, for the equipping of the saints for the work of ministry.",
        "The gift of prophecy was never intended to cease with the apostles, but remains a vital mark of God's remnant church."
      ],
      egwNotes: [
        "The work of the ministry is to hold up Christ before the people. In every age the gift of prophecy has been manifested to guard and instruct the faithful.—Acts of the Apostles, p. 47."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=395s",
      egwTimestampText: "6:35",
      egwTimestampSeconds: 395
    },
    {
      dayIndex: 3,
      dayName: "Tuesday",
      dateString: "Tuesday, October 20",
      title: "Functions of New Testament Prophets",
      lessonContent: [
        "New Testament prophets fulfilled pastoral, foretelling, and forthtelling roles: edification, exhortation, and comfort (1 Cor. 14:3).",
        "They guided church decisions (Acts 13:1-3) and warned of impending crises (Acts 11:27-30)."
      ],
      egwNotes: [
        "He that prophesieth speaketh unto men to edification, and exhortation, and comfort. The Lord designs that His church shall be kept pure, elevated, and unified in doctrine.—Review and Herald, 1893."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=635s",
      egwTimestampText: "10:35",
      egwTimestampSeconds: 635
    },
    {
      dayIndex: 4,
      dayName: "Wednesday",
      dateString: "Wednesday, October 21",
      title: "Female Prophets and Young Pastoral Associates",
      lessonContent: [
        "Scripture records both male and female prophets in the New Testament: Anna in the temple (Luke 2:36-38), Philip's four virgin daughters who prophesied (Acts 21:9), and early co-laborers.",
        "God bestows spiritual gifts regardless of gender, fulfilling Joel 2:28: 'Your sons and your daughters shall prophesy.'"
      ],
      egwNotes: [
        "God has work for women as well as for men. He chose women in ancient times and in apostolic days to proclaim His truth and minister to souls.—Daughters of God, p. 19."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=810s",
      egwTimestampText: "13:30",
      egwTimestampSeconds: 810
    },
    {
      dayIndex: 5,
      dayName: "Thursday",
      dateString: "Thursday, October 22",
      title: "False Prophets in the New Testament",
      lessonContent: [
        "Jesus and the apostles repeatedly warned against deceptive, self-proclaimed prophets (Matt. 7:15; 24:24; 1 John 4:1).",
        "The biblical test of a true prophet requires: harmony with the Law and Testimony (Isa. 8:20), good moral fruits (Matt. 7:20), and confession of Christ's incarnation (1 John 4:2)."
      ],
      egwNotes: [
        "False prophets will arise and deceive many. Let all be on their guard against speculative theories that contradict the law and the testimony.—The Great Controversy, p. 583."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=1075s",
      egwTimestampText: "17:55",
      egwTimestampSeconds: 1075
    },
    {
      dayIndex: 6,
      dayName: "Friday",
      dateString: "Friday, October 23",
      title: "Keeping Jesus and His Word at the Center",
      lessonContent: [
        "The testimony of Jesus is the spirit of prophecy (Rev. 19:10). All authentic prophetic manifestations point away from self and toward Jesus Christ and His written Word.",
        "Sabbath School is our weekly sanctuary to ground our minds in Bible truth and prepare to teach others."
      ],
      egwNotes: [
        "The Bible, and the Bible alone, is our rule of faith. The Spirit was not given—nor can it ever be bestowed—to supersede the Bible; for the Scriptures explicitly state that the word of God is the standard by which all teaching and experience must be tested.—The Great Controversy, p. vii."
      ],
      egwVideoUrl: "https://www.youtube.com/watch?v=d17oRa_jCHg&t=1264s",
      egwTimestampText: "21:04",
      egwTimestampSeconds: 1264
    }
  ],
  formattedOutput: {
    videoLinks: {
      featured: "https://www.youtube.com/watch?v=M8jssNYGAJc",
      itIsWritten: "https://www.youtube.com/watch?v=2NyUKNOOkPM",
      hopeSabbathSchool: "https://www.youtube.com/watch?v=EyMutcCbyEY",
      threeABNPanel: "https://www.youtube.com/watch?v=-nLC32baQKw"
    },
    egwNotesDailyBreakdown: [
      "Sabbath Afternoon – https://www.youtube.com/watch?v=d17oRa_jCHg&t=0s",
      "Sunday – https://www.youtube.com/watch?v=d17oRa_jCHg&t=173s",
      "Monday – https://www.youtube.com/watch?v=d17oRa_jCHg&t=395s",
      "Tuesday – https://www.youtube.com/watch?v=d17oRa_jCHg&t=635s",
      "Wednesday – https://www.youtube.com/watch?v=d17oRa_jCHg&t=810s",
      "Thursday – https://www.youtube.com/watch?v=d17oRa_jCHg&t=1075s",
      "Friday – https://www.youtube.com/watch?v=d17oRa_jCHg&t=1264s"
    ],
    lessonDailyBreakdown: [
      "Sabbath Afternoon: New Testament Prophets (October 17)",
      "Sunday: Jesus as Prophet (October 18)",
      "Monday: Apostles and Prophets (October 19)",
      "Tuesday: Functions of New Testament Prophets (October 20)",
      "Wednesday: Female Prophets and Young Pastoral Associates (October 21)",
      "Thursday: False Prophets in the New Testament (October 22)",
      "Friday: Keeping Jesus and His Word at the Center (October 23)"
    ]
  }
};

/**
 * Parses timestamp string (e.g. "0:00", "02:53", "1:15:30") to total seconds.
 */
export function parseTimestampToSeconds(tsStr: string): number {
  if (!tsStr) return 0;
  const parts = tsStr.trim().split(":").map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Extracts video items from a YouTube channel page HTML.
 */
async function fetchYouTubeChannelVideos(handle: string): Promise<Array<{ videoId: string; title: string; timeAgo: string }>> {
  const url = `https://www.youtube.com/${handle}/videos`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const startIdx = html.indexOf("ytInitialData = {");
    if (startIdx === -1) return [];
    const jsonStart = startIdx + "ytInitialData = ".length;
    const scriptEnd = html.indexOf(";</script>", jsonStart);
    if (scriptEnd === -1) return [];
    const data = JSON.parse(html.substring(jsonStart, scriptEnd));
    const items = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[1]?.tabRenderer?.content?.richGridRenderer?.contents || [];
    const list: Array<{ videoId: string; title: string; timeAgo: string }> = [];

    for (const item of items) {
      const vm = item?.richItemRenderer?.content?.lockupViewModel;
      if (vm && vm.contentId) {
        const meta = vm.metadata?.lockupMetadataViewModel;
        const title = meta?.title?.content || "";
        const timeAgo = meta?.metadata?.contentMetadataViewModel?.metadataRows?.[1]?.metadataParts?.[0]?.text?.content || "";
        if (title) {
          list.push({ videoId: vm.contentId, title, timeAgo });
        }
      }
    }
    return list;
  } catch (err) {
    console.warn(`[Sabbath School Sync] Could not fetch YouTube channel ${handle}:`, err);
    return [];
  }
}

/**
 * Extracts EGW Notes description timestamps from YouTube watch page.
 */
async function extractEgwTimestamps(videoId: string): Promise<Record<string, { timestamp: string; seconds: number }>> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const result: Record<string, { timestamp: string; seconds: number }> = {};
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    if (!res.ok) return result;
    const html = await res.text();

    const startIdx = html.indexOf("ytInitialData = {");
    if (startIdx === -1) return result;
    const jsonStart = startIdx + "ytInitialData = ".length;
    const scriptEnd = html.indexOf(";</script>", jsonStart);
    if (scriptEnd === -1) return result;
    const data = JSON.parse(html.substring(jsonStart, scriptEnd));

    function findDescriptionString(obj: any): string | null {
      if (!obj || typeof obj !== "object") return null;
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && (v.includes("Sabbath Afternoon") || v.includes("Sunday") || v.includes("Monday"))) {
          return v;
        }
        const found = findDescriptionString(v);
        if (found) return found;
      }
      return null;
    }

    const desc = findDescriptionString(data) || "";
    if (!desc) return result;

    const days = [
      "Sabbath Afternoon",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    for (const day of days) {
      // Regex matches formats like:
      // "00:00 | Sabbath Afternoon" or "Sabbath Afternoon – 0:00" or "Sabbath Afternoon - 00:00"
      const r1 = new RegExp(`(\\d{1,2}:\\d{2}(?::\\d{2})?)\\s*(?:\\||–|-)\\s*${day}`, "i");
      const r2 = new RegExp(`${day}\\s*(?:\\||–|-)\\s*(\\d{1,2}:\\d{2}(?::\\d{2})?)`, "i");

      const m1 = desc.match(r1);
      const m2 = desc.match(r2);
      const ts = m1 ? m1[1] : (m2 ? m2[1] : null);

      if (ts) {
        result[day] = {
          timestamp: ts,
          seconds: parseTimestampToSeconds(ts)
        };
      }
    }
  } catch (err) {
    console.warn(`[Sabbath School Sync] Error extracting EGW timestamps for video ${videoId}:`, err);
  }
  return result;
}

/**
 * Scrapes current week's lesson from official Adventech / ABSG API.
 */
async function scrapeOfficialLesson(targetDateStr?: string): Promise<{
  quarterlyTitle: string;
  quarterId: string;
  lessonId: string;
  lessonTitle: string;
  memoryVerse: string;
  readForThisWeek: string;
  startDate: string;
  endDate: string;
  days: DailyLessonSection[];
} | null> {
  try {
    const qIndexRes = await fetch("https://sabbath-school.adventech.io/api/v2/en/quarterlies/index.json");
    if (!qIndexRes.ok) return null;
    const quarterlies = await qIndexRes.json();
    const activeQuarter = quarterlies.find((q: any) => q.id === "2026-04") || quarterlies[0];
    if (!activeQuarter) return null;

    const quarterRes = await fetch(`https://sabbath-school.adventech.io/api/v2/en/quarterlies/${activeQuarter.id}/index.json`);
    if (!quarterRes.ok) return null;
    const quarterData = await quarterRes.json();

    // Determine current lesson by date or default to Lesson 04
    const lessons = quarterData.lessons || [];
    let currentLesson = lessons[3]; // 04: New Testament Prophets
    const today = new Date();
    for (const l of lessons) {
      if (l.start_date && l.end_date) {
        const [sDay, sMon, sYr] = l.start_date.split("/").map(Number);
        const [eDay, eMon, eYr] = l.end_date.split("/").map(Number);
        const start = new Date(sYr, sMon - 1, sDay);
        const end = new Date(eYr, eMon - 1, eDay, 23, 59, 59);
        if (today >= start && today <= end) {
          currentLesson = l;
          break;
        }
      }
    }

    if (!currentLesson) currentLesson = lessons[0];

    const lessonRes = await fetch(`https://sabbath-school.adventech.io/api/v2/en/quarterlies/${activeQuarter.id}/lessons/${currentLesson.id}/index.json`);
    if (!lessonRes.ok) return null;
    const lessonData = await lessonRes.json();

    const daysList = (lessonData.days || []).slice(0, 7);
    const dayNames = [
      "Sabbath Afternoon",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    let memoryVerse = "";
    let readForThisWeek = "";

    const dailyLessons: DailyLessonSection[] = await Promise.all(
      daysList.map(async (dayObj: any, idx: number) => {
        let contentParagraphs: string[] = [];
        let egwNotes: string[] = [];
        try {
          const readRes = await fetch(`https://sabbath-school.adventech.io/api/v2/${dayObj.read_path}/index.json`);
          if (readRes.ok) {
            const readData = await readRes.json();
            const rawHtml = readData.content || "";

            // Memory verse and reading extraction
            if (idx === 0) {
              const memMatch = rawHtml.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
              if (memMatch) {
                memoryVerse = memMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
              }
              const readMatch = rawHtml.match(/Read for This Week’s Study<\/h3>\s*<p>([\s\S]*?)<\/p>/i);
              if (readMatch) {
                readForThisWeek = readMatch[1].replace(/<[^>]+>/g, "").trim();
              }
            }

            // Clean paragraphs
            const pMatches = rawHtml.match(/<(p|blockquote|h2|h3|h4)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
            pMatches.forEach((block: string) => {
              const isHeading = /^<h[2-4]/i.test(block);
              const isQuote = /^<blockquote/i.test(block);
              let clean = block.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
              if (clean && !clean.includes("Memory Text:") && !clean.includes("Read for This Week’s Study")) {
                if (clean.includes("Supplemental EGW Notes") || clean.includes("—Sons and Daughters of God") || clean.includes("—Testimonies")) {
                  egwNotes.push(clean.replace(/^Supplemental EGW Notes\s*/i, "").trim());
                } else {
                  if (isHeading) {
                    contentParagraphs.push(`### ${clean}`);
                  } else if (isQuote) {
                    contentParagraphs.push(`> ${clean}`);
                  } else {
                    clean = clean
                      .replace(/([.?!])([A-Z0-9“"’'])/g, "$1 $2")
                      .replace(/([,;:])([A-Za-z0-9])/g, "$1 $2")
                      .trim();
                    contentParagraphs.push(clean);
                  }
                }
              }
            });
          }
        } catch (rErr) {
          console.warn(`[Sabbath School Sync] Error fetching daily read for day ${idx + 1}:`, rErr);
        }

        if (contentParagraphs.length === 0) {
          contentParagraphs = CANONICAL_BASELINE.dailyLessons[idx]?.lessonContent || ["Study God's Word daily."];
        }

        if (egwNotes.length === 0) {
          egwNotes = CANONICAL_BASELINE.dailyLessons[idx]?.egwNotes || [];
        }

        return {
          dayIndex: idx,
          dayName: dayNames[idx],
          dateString: dayObj.date || "",
          title: dayObj.title || dayNames[idx],
          lessonContent: contentParagraphs,
          egwNotes,
          egwVideoUrl: "",
          egwTimestampText: "",
          egwTimestampSeconds: 0
        };
      })
    );

    return {
      quarterlyTitle: activeQuarter.title || "The Gift of Prophecy",
      quarterId: activeQuarter.id,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title || "New Testament Prophets",
      memoryVerse: memoryVerse || CANONICAL_BASELINE.memoryVerse,
      readForThisWeek: readForThisWeek || CANONICAL_BASELINE.readForThisWeek,
      startDate: currentLesson.start_date || "17/10/2026",
      endDate: currentLesson.end_date || "23/10/2026",
      days: dailyLessons
    };
  } catch (err) {
    console.error("[Sabbath School Sync] Official scraper error:", err);
    return null;
  }
}

/**
 * Executes full synchronization of official YouTube videos, EGW Notes timestamps, and lesson texts.
 */
let inMemorySyncCache: SabbathSchoolSyncPayload | null = null;

export async function executeSabbathSchoolSync(forceRefresh = false): Promise<SabbathSchoolSyncPayload> {
  console.log(`[Sabbath School Sync] Initiating master synchronization (forceRefresh=${forceRefresh})...`);

  // Ensure storage dir exists safely (handles read-only filesystems in containers)
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (dirErr) {
    console.warn("[Sabbath School Sync] Read-only or inaccessible storage directory, using memory fallback:", dirErr);
  }

  // Check in-memory cache first
  if (!forceRefresh && inMemorySyncCache) {
    const cachedTime = new Date(inMemorySyncCache.lastSyncedAt).getTime();
    if (Date.now() - cachedTime < 3 * 60 * 60 * 1000 && !inMemorySyncCache.hasPendingRetries) {
      return inMemorySyncCache;
    }
  }

  // Check existing cached week unless forceRefresh is true
  if (!forceRefresh) {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as SabbathSchoolSyncPayload;
        const cachedTime = new Date(cached.lastSyncedAt).getTime();
        const now = Date.now();
        // If cached within last 3 hours and has no pending retries, return cached payload
        if (now - cachedTime < 3 * 60 * 60 * 1000 && !cached.hasPendingRetries) {
          inMemorySyncCache = cached;
          return cached;
        }
      }
    } catch (cErr) {
      console.warn("[Sabbath School Sync] Invalid cache file, refetching...", cErr);
    }
  }

  // 1. Scrape official lesson website
  const scrapedLesson = await scrapeOfficialLesson();
  const quarterlyTitle = scrapedLesson?.quarterlyTitle || CANONICAL_BASELINE.quarterlyTitle;
  const lessonTitle = scrapedLesson?.lessonTitle || CANONICAL_BASELINE.lessonTitle;
  const memoryVerse = scrapedLesson?.memoryVerse || CANONICAL_BASELINE.memoryVerse;
  const readForThisWeek = scrapedLesson?.readForThisWeek || CANONICAL_BASELINE.readForThisWeek;
  const days = scrapedLesson?.days || CANONICAL_BASELINE.dailyLessons;

  // 2. Fetch the 4 official YouTube channels
  const [claudioVids, itIsWrittenVids, hopeVids, threeABNVids] = await Promise.all([
    fetchYouTubeChannelVideos("@ClaudioCarneiro"),
    fetchYouTubeChannelVideos("@itiswritten"),
    fetchYouTubeChannelVideos("@HopeSabbathSchool"),
    fetchYouTubeChannelVideos("@3ABNSabbathSchoolPanelOfficial")
  ]);

  // Channel 1: Claudio Carneiro (Featured Video & EGW Notes)
  let featuredVideoItem: WeeklyVideoItem = CANONICAL_BASELINE.videos.featured;
  let egwVideoId = CANONICAL_BASELINE.egwVideo.videoId;
  let egwVideoTitle = CANONICAL_BASELINE.egwVideo.title;

  if (claudioVids.length > 0) {
    const egwMatch = claudioVids.find(v => /egw notes/i.test(v.title));
    if (egwMatch) {
      egwVideoId = egwMatch.videoId;
      egwVideoTitle = egwMatch.title;
    }

    const mainLessonVid = claudioVids.find(v => !/egw notes/i.test(v.title) && /lesson/i.test(v.title));
    if (mainLessonVid) {
      featuredVideoItem = {
        channelKey: "featured",
        channelName: "Featured Video – Claudio Carneiro",
        channelHandle: "@ClaudioCarneiro",
        title: mainLessonVid.title,
        videoId: mainLessonVid.videoId,
        url: `https://www.youtube.com/watch?v=${mainLessonVid.videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${mainLessonVid.videoId}?autoplay=1&controls=1&enablejsapi=1`,
        publishedText: mainLessonVid.timeAgo || "Current Week",
        isCurrentWeek: true,
        lessonNumberText: "Lesson 4"
      };
    }
  }

  // Channel 2: It Is Written
  let itiswrittenItem: WeeklyVideoItem = CANONICAL_BASELINE.videos.itiswritten;
  if (itIsWrittenVids.length > 0) {
    const match = itIsWrittenVids.find(v => /sabbath school/i.test(v.title) || /lesson/i.test(v.title));
    if (match) {
      itiswrittenItem = {
        channelKey: "itiswritten",
        channelName: "It Is Written Sabbath School",
        channelHandle: "@itiswritten",
        title: match.title,
        videoId: match.videoId,
        url: `https://www.youtube.com/watch?v=${match.videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${match.videoId}?autoplay=1&controls=1&enablejsapi=1`,
        publishedText: match.timeAgo || "Current Week",
        isCurrentWeek: true,
        lessonNumberText: "Lesson 4"
      };
    }
  }

  // Channel 3: Hope Sabbath School
  let hopeItem: WeeklyVideoItem = CANONICAL_BASELINE.videos.hope;
  if (hopeVids.length > 0) {
    const match = hopeVids.find(v => /lesson/i.test(v.title) || /sabbath school/i.test(v.title));
    if (match) {
      hopeItem = {
        channelKey: "hope",
        channelName: "Hope Sabbath School",
        channelHandle: "@HopeSabbathSchool",
        title: match.title,
        videoId: match.videoId,
        url: `https://www.youtube.com/watch?v=${match.videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${match.videoId}?autoplay=1&controls=1&enablejsapi=1`,
        publishedText: match.timeAgo || "Current Week",
        isCurrentWeek: true,
        lessonNumberText: "Lesson 4"
      };
    }
  }

  // Channel 4: 3ABN Sabbath School Panel
  let threeABNItem: WeeklyVideoItem = CANONICAL_BASELINE.videos.threeABN;
  if (threeABNVids.length > 0) {
    const match = threeABNVids.find(v => /sabbath school/i.test(v.title) || /panel/i.test(v.title));
    if (match) {
      threeABNItem = {
        channelKey: "threeABN",
        channelName: "3ABN Sabbath School Panel",
        channelHandle: "@3ABNSabbathSchoolPanelOfficial",
        title: match.title,
        videoId: match.videoId,
        url: `https://www.youtube.com/watch?v=${match.videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${match.videoId}?autoplay=1&controls=1&enablejsapi=1`,
        publishedText: match.timeAgo || "Current Week",
        isCurrentWeek: true,
        lessonNumberText: "Lesson 4"
      };
    }
  }

  // Check pending channels
  const pendingChannels: string[] = [];
  if (!featuredVideoItem.isCurrentWeek) pendingChannels.push("Featured Video (Claudio Carneiro)");
  if (!itiswrittenItem.isCurrentWeek) pendingChannels.push("It Is Written");
  if (!hopeItem.isCurrentWeek) pendingChannels.push("Hope Sabbath School");
  if (!threeABNItem.isCurrentWeek) pendingChannels.push("3ABN Sabbath School Panel");

  // 3. Extract EGW Notes Timestamps for current week's video
  const extractedTimestamps = await extractEgwTimestamps(egwVideoId);
  const egwDailyBreakdown: Record<string, EgwDailyLink> = {};
  const egwNotesLines: string[] = [];

  const dayKeys = [
    { name: "Sabbath Afternoon", idx: 0, defaultTs: "0:00", defaultSec: 0, date: "October 17" },
    { name: "Sunday", idx: 1, defaultTs: "2:53", defaultSec: 173, date: "October 18" },
    { name: "Monday", idx: 2, defaultTs: "6:35", defaultSec: 395, date: "October 19" },
    { name: "Tuesday", idx: 3, defaultTs: "10:35", defaultSec: 635, date: "October 20" },
    { name: "Wednesday", idx: 4, defaultTs: "13:30", defaultSec: 810, date: "October 21" },
    { name: "Thursday", idx: 5, defaultTs: "17:55", defaultSec: 1075, date: "October 22" },
    { name: "Friday", idx: 6, defaultTs: "21:04", defaultSec: 1264, date: "October 23" }
  ];

  for (const dk of dayKeys) {
    const parsed = extractedTimestamps[dk.name];
    const ts = parsed?.timestamp || dk.defaultTs;
    const sec = parsed?.seconds ?? dk.defaultSec;
    const linkUrl = `https://www.youtube.com/watch?v=${egwVideoId}&t=${sec}s`;

    egwDailyBreakdown[dk.name] = {
      dayName: dk.name,
      dayIndex: dk.idx,
      dateText: dk.date,
      timestampText: ts,
      seconds: sec,
      url: linkUrl
    };

    egwNotesLines.push(`${dk.name} – ${linkUrl}`);

    // Update dailyLesson entry with exact video link
    if (days[dk.idx]) {
      days[dk.idx].egwVideoUrl = linkUrl;
      days[dk.idx].egwTimestampText = ts;
      days[dk.idx].egwTimestampSeconds = sec;
    }
  }

  const lessonLines = days.map(d => `${d.dayName}: ${d.title} (${d.dateString})`);

  const payload: SabbathSchoolSyncPayload = {
    quarterlyTitle,
    quarterId: scrapedLesson?.quarterId || "2026-04",
    lessonId: scrapedLesson?.lessonId || "04",
    lessonTitle,
    memoryVerse,
    readForThisWeek,
    startDate: scrapedLesson?.startDate || "17/10/2026",
    endDate: scrapedLesson?.endDate || "23/10/2026",
    lastSyncedAt: new Date().toISOString(),
    nextScheduledSabbath: "2026-10-24T11:00:00-05:00",
    timezone: "America/Cayman",
    hasPendingRetries: pendingChannels.length > 0,
    pendingChannels,
    nextRetryAt: pendingChannels.length > 0 ? new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() : undefined,
    videos: {
      featured: featuredVideoItem,
      itiswritten: itiswrittenItem,
      hope: hopeItem,
      threeABN: threeABNItem
    },
    egwVideo: {
      videoId: egwVideoId,
      title: egwVideoTitle,
      fullUrl: `https://www.youtube.com/watch?v=${egwVideoId}`,
      statusNotice: Object.keys(extractedTimestamps).length === 0 ? "EGW Notes timestamps extracted using chapter baseline markers." : undefined
    },
    egwDailyBreakdown,
    dailyLessons: days,
    formattedOutput: {
      videoLinks: {
        featured: featuredVideoItem.url,
        itIsWritten: itiswrittenItem.url,
        hopeSabbathSchool: hopeItem.url,
        threeABNPanel: threeABNItem.url
      },
      egwNotesDailyBreakdown: egwNotesLines,
      lessonDailyBreakdown: lessonLines
    }
  };

  // Store in memory cache
  inMemorySyncCache = payload;

  // Write to cache file safely
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), "utf8");
    console.log(`[Sabbath School Sync] Successfully synchronized and cached lesson "${lessonTitle}" with ${Object.keys(egwDailyBreakdown).length} EGW daily timestamps.`);
  } catch (fsErr) {
    console.warn("[Sabbath School Sync] Could not write cache file to disk (in-memory cache will be used):", fsErr);
  }

  return payload;
}

/**
 * Initializes background cron schedule for Sabbath 11:00 AM Cayman Islands time and 3-hour retries.
 */
export function initSabbathSchoolCronScheduler() {
  console.log("[Sabbath School Scheduler] Initializing master automation scheduler (America/Cayman EST)...");

  // Perform immediate initial synchronization on startup
  executeSabbathSchoolSync(false).catch(err => {
    console.warn("[Sabbath School Scheduler] Initial sync warning:", err);
  });

  // Check every 60 seconds for scheduled times
  let lastSabbathSyncDay = -1;
  let lastRetryCheckTime = Date.now();

  setInterval(async () => {
    try {
      const now = new Date();
      // America/Cayman is always UTC-5
      const caymanHours = (now.getUTCHours() - 5 + 24) % 24;
      const caymanDay = (now.getUTCDay() + (now.getUTCHours() < 5 ? -1 : 0) + 7) % 7;
      const caymanMinutes = now.getUTCMinutes();

      // Check if Saturday (day 6) at 11:00 AM Cayman Islands time
      if (caymanDay === 6 && caymanHours === 11 && caymanMinutes === 0) {
        if (lastSabbathSyncDay !== now.getUTCDate()) {
          lastSabbathSyncDay = now.getUTCDate();
          console.log("[Sabbath School Scheduler] Sabbath 11:00 AM Cayman Islands time reached. Triggering mandatory weekly sync!");
          await executeSabbathSchoolSync(true);
        }
      }

      // 3-hour retry check for pending channels
      if (Date.now() - lastRetryCheckTime >= 3 * 60 * 60 * 1000) {
        lastRetryCheckTime = Date.now();
        if (fs.existsSync(CACHE_FILE)) {
          const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as SabbathSchoolSyncPayload;
          if (cached.hasPendingRetries) {
            console.log("[Sabbath School Scheduler] Pending channels detected. Running 3-hour retry check...");
            await executeSabbathSchoolSync(true);
          }
        }
      }
    } catch (schedErr) {
      console.error("[Sabbath School Scheduler] Scheduler interval error:", schedErr);
    }
  }, 60 * 1000);
}
