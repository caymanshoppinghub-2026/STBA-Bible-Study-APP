/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DoctrinalTheme {
  id: string;
  name: string;
  category: "Pillars of Faith" | "Doctrines of Grace" | "Prophecy & Present Truth" | "Christian Discipleship" | "Biblical Authority";
  description: string;
  color: {
    bg: string;
    border: string;
    text: string;
    activeBg: string;
    glow: string;
    chipBg: string;
  };
  sampleTags: string[];
}

export const DOCTRINAL_THEMES: DoctrinalTheme[] = [
  {
    id: "sabbath-creation",
    name: "The Sabbath & Creation",
    category: "Pillars of Faith",
    description: "The seventh-day memorial of divine creation, sanctuary in time, and perpetual covenant of holy rest.",
    color: {
      bg: "bg-amber-500/10",
      border: "border-amber-400/40",
      text: "text-amber-800",
      activeBg: "bg-amber-500 text-white",
      glow: "rgba(245, 158, 11, 0.25)",
      chipBg: "bg-amber-50 text-amber-900 border-amber-200"
    },
    sampleTags: ["Sabbath", "Creation", "Seventh Day", "Rest", "Fourth Commandment", "Edenic Memorial", "Sanctuary in Time"]
  },
  {
    id: "sanctuary-cleansing",
    name: "Sanctuary & 1844",
    category: "Pillars of Faith",
    description: "Christ's high-priestly ministry in the heavenly sanctuary, the 2300-day prophecy, and investigative judgment.",
    color: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-400/40",
      text: "text-indigo-800",
      activeBg: "bg-indigo-600 text-white",
      glow: "rgba(99, 102, 241, 0.25)",
      chipBg: "bg-indigo-50 text-indigo-900 border-indigo-200"
    },
    sampleTags: ["Sanctuary", "1844", "2300 Days", "Investigative Judgment", "Cleansing", "High Priest", "Most Holy Place", "Atonement"]
  },
  {
    id: "three-angels-remnant",
    name: "Three Angels & Remnant",
    category: "Prophecy & Present Truth",
    description: "The final proclamation of the everlasting gospel, the call out of Babylon, and keeping the commandments and faith of Jesus.",
    color: {
      bg: "bg-rose-500/10",
      border: "border-rose-400/40",
      text: "text-rose-800",
      activeBg: "bg-rose-600 text-white",
      glow: "rgba(244, 63, 94, 0.25)",
      chipBg: "bg-rose-50 text-rose-900 border-rose-200"
    },
    sampleTags: ["Three Angels", "Remnant", "Commandments of God", "Faith of Jesus", "Everlasting Gospel", "Babylon", "Patience of Saints"]
  },
  {
    id: "salvation-grace",
    name: "Salvation & Grace",
    category: "Doctrines of Grace",
    description: "Justification by faith, Christ's all-sufficient sacrifice on Calvary, and the transforming power of the Holy Spirit.",
    color: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-400/40",
      text: "text-emerald-800",
      activeBg: "bg-emerald-600 text-white",
      glow: "rgba(16, 185, 129, 0.25)",
      chipBg: "bg-emerald-50 text-emerald-900 border-emerald-200"
    },
    sampleTags: ["Righteousness by Faith", "Grace", "Calvary", "Justification", "Sanctification", "Redemption", "New Birth"]
  },
  {
    id: "law-decalogue",
    name: "Law of God & Decalogue",
    category: "Pillars of Faith",
    description: "The transcript of God's character, eternal moral baseline, and transcript of righteous love.",
    color: {
      bg: "bg-blue-500/10",
      border: "border-blue-400/40",
      text: "text-blue-800",
      activeBg: "bg-blue-600 text-white",
      glow: "rgba(59, 130, 246, 0.25)",
      chipBg: "bg-blue-50 text-blue-900 border-blue-200"
    },
    sampleTags: ["Decalogue", "Moral Law", "Commandments", "Obedience", "Transcript of Character", "Holy", "Unchangeable"]
  },
  {
    id: "second-advent",
    name: "Second Advent & Prophecy",
    category: "Prophecy & Present Truth",
    description: "The literal, visible return of Jesus Christ in glory, the resurrection of the righteous, and restoration.",
    color: {
      bg: "bg-amber-600/10",
      border: "border-amber-500/40",
      text: "text-amber-900",
      activeBg: "bg-amber-600 text-white",
      glow: "rgba(217, 119, 6, 0.25)",
      chipBg: "bg-amber-100/70 text-amber-950 border-amber-300"
    },
    sampleTags: ["Second Coming", "Blessed Hope", "Resurrection", "Glorification", "Prophecy", "Advent", "Signs of Times"]
  },
  {
    id: "state-of-the-dead",
    name: "State of the Dead & Hope",
    category: "Pillars of Faith",
    description: "Unconscious sleep until resurrection morning, conditional immortality, and liberation from spiritism.",
    color: {
      bg: "bg-slate-500/10",
      border: "border-slate-400/40",
      text: "text-slate-800",
      activeBg: "bg-slate-700 text-white",
      glow: "rgba(100, 116, 139, 0.25)",
      chipBg: "bg-slate-100 text-slate-900 border-slate-300"
    },
    sampleTags: ["State of the Dead", "Sleep in Christ", "Resurrection Morning", "Conditional Immortality", "Soul & Breath"]
  },
  {
    id: "discipleship-diligence",
    name: "Discipleship & Diligence",
    category: "Christian Discipleship",
    description: "Personal study to be approved, rightly dividing the word of truth, prayerful reflection, and holy living.",
    color: {
      bg: "bg-teal-500/10",
      border: "border-teal-400/40",
      text: "text-teal-800",
      activeBg: "bg-teal-600 text-white",
      glow: "rgba(20, 184, 166, 0.25)",
      chipBg: "bg-teal-50 text-teal-900 border-teal-200"
    },
    sampleTags: ["Sola Scriptura", "Workman", "Approved", "Rightly Dividing", "Discipleship", "Hermeneutics", "Memory Hooks"]
  },
  {
    id: "health-temple",
    name: "Health Reform & Living Temple",
    category: "Christian Discipleship",
    description: "Honoring God in body, mind, and spirit as living temples of the Holy Ghost.",
    color: {
      bg: "bg-lime-500/10",
      border: "border-lime-400/40",
      text: "text-lime-800",
      activeBg: "bg-lime-600 text-white",
      glow: "rgba(132, 204, 22, 0.25)",
      chipBg: "bg-lime-50 text-lime-900 border-lime-200"
    },
    sampleTags: ["Living Temple", "Health Reform", "Body Temple", "Temperance", "Glorify God"]
  },
  {
    id: "prophecy-scripture",
    name: "Holy Scripture & Prophecy",
    category: "Biblical Authority",
    description: "Divine inspiration of the 66 canonical books, historical-grammatical hermeneutic, and the testimony of Jesus.",
    color: {
      bg: "bg-violet-500/10",
      border: "border-violet-400/40",
      text: "text-violet-800",
      activeBg: "bg-violet-600 text-white",
      glow: "rgba(139, 92, 246, 0.25)",
      chipBg: "bg-violet-50 text-violet-900 border-violet-200"
    },
    sampleTags: ["Inspiration", "Testimony of Jesus", "Spirit of Prophecy", "Line Upon Line", "Sure Word", "Bible Authority"]
  }
];

export const DOCTRINE_CATEGORIES = [
  "Pillars of Faith",
  "Doctrines of Grace",
  "Prophecy & Present Truth",
  "Christian Discipleship",
  "Biblical Authority"
] as const;

export type DoctrineCategory = typeof DOCTRINE_CATEGORIES[number];

/**
 * Intelligent inference engine: assigns default theme, doctrine category,
 * and canonical tags based on scripture reference, text, keywords, and trackLabel.
 */
export function inferVerseThemeAndDoctrine(verse: {
  reference: string;
  text: string;
  keywords?: string[];
  trackLabel?: string;
  theme?: string;
  doctrineCategory?: string;
  tags?: string[];
}): { theme: string; doctrineCategory: string; tags: string[] } {
  // If explicitly tagged already, preserve and merge
  if (verse.theme && verse.doctrineCategory && verse.tags && verse.tags.length > 0) {
    return {
      theme: verse.theme,
      doctrineCategory: verse.doctrineCategory,
      tags: verse.tags
    };
  }

  const lowerRef = verse.reference.toLowerCase();
  const lowerText = verse.text.toLowerCase();
  const lowerTrack = (verse.trackLabel || "").toLowerCase();
  const combined = `${lowerRef} ${lowerText} ${lowerTrack} ${(verse.keywords || []).join(" ")}`.toLowerCase();

  let theme = "Discipleship & Diligence";
  let doctrineCategory = "Christian Discipleship";
  let baseTags: string[] = [];

  if (combined.includes("sabbath") || combined.includes("seventh day") || combined.includes("sanctified") || lowerRef.startsWith("gen 2") || lowerRef.startsWith("genesis 2") || lowerRef.startsWith("ex 20:8") || lowerRef.startsWith("exodus 20:8")) {
    theme = "The Sabbath & Creation";
    doctrineCategory = "Pillars of Faith";
    baseTags = ["Sabbath", "Creation", "Fourth Commandment", "Rest", "Seventh Day"];
  } else if (combined.includes("sanctuary") || combined.includes("cleansed") || combined.includes("2300") || combined.includes("two thousand") || lowerRef.startsWith("dan 8:14") || lowerRef.startsWith("daniel 8:14") || lowerRef.startsWith("heb 8") || lowerRef.startsWith("hebrews 8")) {
    theme = "Sanctuary & 1844";
    doctrineCategory = "Pillars of Faith";
    baseTags = ["Sanctuary", "1844", "Investigative Judgment", "Cleansing", "2300 Days"];
  } else if (combined.includes("commandments of god") || combined.includes("faith of jesus") || combined.includes("three angels") || combined.includes("patience of the saints") || lowerRef.startsWith("rev 14") || lowerRef.startsWith("revelation 14")) {
    theme = "Three Angels & Remnant";
    doctrineCategory = "Prophecy & Present Truth";
    baseTags = ["Three Angels", "Remnant", "Commandments of God", "Faith of Jesus", "Patience of Saints"];
  } else if (combined.includes("law") || combined.includes("commandment") || lowerRef.startsWith("ex 20") || lowerRef.startsWith("exodus 20") || lowerRef.startsWith("james 2")) {
    theme = "Law of God & Decalogue";
    doctrineCategory = "Pillars of Faith";
    baseTags = ["Decalogue", "Moral Law", "Commandments", "Obedience"];
  } else if (combined.includes("grace") || combined.includes("justified") || combined.includes("faith") || combined.includes("righteousness") || lowerRef.startsWith("eph 2") || lowerRef.startsWith("rom 3") || lowerRef.startsWith("rom 5")) {
    theme = "Salvation & Grace";
    doctrineCategory = "Doctrines of Grace";
    baseTags = ["Righteousness by Faith", "Grace", "Justification", "Salvation"];
  } else if (combined.includes("dead") || combined.includes("sleep") || combined.includes("grave") || combined.includes("resurrection") || lowerRef.startsWith("eccl 9") || lowerRef.startsWith("1 thess 4")) {
    theme = "State of the Dead & Hope";
    doctrineCategory = "Pillars of Faith";
    baseTags = ["State of the Dead", "Sleep in Christ", "Resurrection", "Hope"];
  } else if (combined.includes("coming") || combined.includes("advent") || combined.includes("clouds") || combined.includes("shall return")) {
    theme = "Second Advent & Prophecy";
    doctrineCategory = "Prophecy & Present Truth";
    baseTags = ["Second Coming", "Blessed Hope", "Advent", "Prophecy"];
  } else if (combined.includes("study") || combined.includes("approved") || combined.includes("dividing") || lowerRef.startsWith("2 tim 2:15") || lowerRef.startsWith("2 timothy 2:15")) {
    theme = "Discipleship & Diligence";
    doctrineCategory = "Christian Discipleship";
    baseTags = ["Sola Scriptura", "Workman", "Approved", "Rightly Dividing", "Diligence"];
  } else {
    // Default based on track
    if (lowerTrack.includes("sanctuary")) {
      theme = "Sanctuary & 1844";
      doctrineCategory = "Pillars of Faith";
      baseTags = ["Sanctuary", "Atonement"];
    } else if (lowerTrack.includes("sabbath")) {
      theme = "The Sabbath & Creation";
      doctrineCategory = "Pillars of Faith";
      baseTags = ["Sabbath", "Seventh Day"];
    } else if (lowerTrack.includes("three angels")) {
      theme = "Three Angels & Remnant";
      doctrineCategory = "Prophecy & Present Truth";
      baseTags = ["Three Angels", "Remnant"];
    } else if (lowerTrack.includes("fundamentals") || lowerTrack.includes("doctrine")) {
      theme = "Law of God & Decalogue";
      doctrineCategory = "Pillars of Faith";
      baseTags = ["28 Fundamentals", "Doctrine"];
    }
  }

  // Combine inferred baseTags with any keywords present on the verse
  const rawKeywords = (verse.keywords || []).map((k) => k.charAt(0).toUpperCase() + k.slice(1));
  const mergedTags = Array.from(new Set([...(verse.tags || []), ...baseTags, ...rawKeywords])).filter(Boolean);

  return {
    theme: verse.theme || theme,
    doctrineCategory: verse.doctrineCategory || doctrineCategory,
    tags: mergedTags.length > 0 ? mergedTags : baseTags
  };
}

/**
 * Returns color style configuration for any theme string
 */
export function getThemeColor(themeName: string) {
  const found = DOCTRINAL_THEMES.find(
    (t) => t.name.toLowerCase() === themeName.toLowerCase() || t.id.toLowerCase() === themeName.toLowerCase()
  );
  if (found) return found.color;

  // Fallback pleasant amber/gold palette
  return {
    bg: "bg-[#C9973A]/10",
    border: "border-[#C9973A]/40",
    text: "text-[#A67D2E]",
    activeBg: "bg-[#C9973A] text-white",
    glow: "rgba(201, 151, 58, 0.25)",
    chipBg: "bg-[#FAF7F0] text-[#7A5B1E] border-[#E8E2D1]"
  };
}

/**
 * Popular doctrinal tag suggestions for the tag editor
 */
export const POPULAR_TAG_SUGGESTIONS = [
  "Sabbath",
  "Sanctuary",
  "1844",
  "Investigative Judgment",
  "Three Angels",
  "Remnant",
  "Commandments of God",
  "Faith of Jesus",
  "Creation",
  "Seventh Day",
  "Decalogue",
  "Righteousness by Faith",
  "Grace",
  "Second Coming",
  "State of the Dead",
  "Resurrection",
  "Sola Scriptura",
  "Approved",
  "Workman",
  "Rightly Dividing",
  "Living Temple",
  "Spirit of Prophecy"
];
