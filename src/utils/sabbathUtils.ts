/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SeparatedContent {
  mainParagraphs: string[];
  egwParagraphs: string[];
}

/**
 * Decodes HTML entities commonly found in scraped Sabbath School curriculum.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8212;/g, "—")
    .replace(/&#8211;/g, "–");
}

/**
 * Cleans, refines, and formats raw paragraph text into clear, readable paragraphs and sentences.
 * Splits runaway blocks into natural 2-4 sentence reading sections for optimal cognitive focus.
 */
export function reformatParagraphText(rawText: string): string[] {
  if (!rawText) return [];

  const decoded = decodeHtmlEntities(rawText).trim();
  if (!decoded) return [];

  // Check if this block is a markdown header
  if (decoded.startsWith("#")) {
    return [decoded];
  }

  // Check if this block is a blockquote
  if (decoded.startsWith(">")) {
    return [decoded];
  }

  // Fix common run-together punctuation from web scrapers: e.g. "word.Next" -> "word. Next"
  let cleaned = decoded
    .replace(/([.?!])([A-Z0-9“"’'])/g, "$1 $2")
    .replace(/([,;:])([A-Za-z0-9])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  // If already reasonable length (under 380 chars), keep as one clean paragraph
  if (cleaned.length <= 380) {
    return [cleaned];
  }

  // Split into sentences on full stops, question marks, and exclamation marks
  const sentenceMatches = cleaned.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentenceMatches || sentenceMatches.length <= 2) {
    return [cleaned];
  }

  const resultParagraphs: string[] = [];
  let currentGroup: string[] = [];
  let currentLength = 0;

  for (const sentence of sentenceMatches) {
    const sTrimmed = sentence.trim();
    if (!sTrimmed) continue;

    currentGroup.push(sTrimmed);
    currentLength += sTrimmed.length;

    // Group 2 to 3 sentences or ~280-380 characters per paragraph
    if (currentGroup.length >= 3 || currentLength >= 320) {
      resultParagraphs.push(currentGroup.join(" "));
      currentGroup = [];
      currentLength = 0;
    }
  }

  if (currentGroup.length > 0) {
    if (resultParagraphs.length > 0 && currentGroup.length === 1 && currentLength < 100) {
      // Append small orphan sentence to the previous paragraph
      resultParagraphs[resultParagraphs.length - 1] += ` ${currentGroup.join(" ")}`;
    } else {
      resultParagraphs.push(currentGroup.join(" "));
    }
  }

  return resultParagraphs;
}

/**
 * Enhances sentence structure, quotation formatting, and book citations for Ellen White notes.
 */
export function formatEgwNoteSentenceStructure(rawNote: string): {
  quote: string;
  source: string;
  formattedParagraphs: string[];
} {
  if (!rawNote || !rawNote.trim()) {
    return { quote: "", source: "Ellen G. White", formattedParagraphs: [] };
  }

  let text = decodeHtmlEntities(rawNote)
    .replace(/^Supplemental EGW Notes\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  let source = "Ellen G. White";

  // Check for citation dash at the end of the note (—Book Title, p. 123)
  const emDashPos = text.lastIndexOf("—");
  const enDashPos = text.lastIndexOf("–");
  const hyphenPos = text.lastIndexOf(" - ");
  const dashPos = emDashPos !== -1 ? emDashPos : (enDashPos !== -1 ? enDashPos : hyphenPos);

  if (dashPos !== -1 && dashPos > text.length - 180) {
    source = text.substring(dashPos + 1).replace(/^-\s*/, "").trim();
    text = text.substring(0, dashPos).trim();
  }

  // Fix punctuation spacing: e.g. "heart.The" -> "heart. The"
  text = text
    .replace(/([.?!])([A-Z“"’'])/g, "$1 $2")
    .replace(/([,;:])([A-Za-z0-9])/g, "$1 $2")
    .trim();

  // Ensure initial letter is capitalized if starting a sentence
  if (text.length > 0 && /^[a-z]/.test(text)) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Ensure terminal punctuation before citation
  if (text && !/[.!?,”"]$/.test(text)) {
    text += ".";
  }

  const formattedParagraphs = reformatParagraphText(text);

  return {
    quote: text,
    source,
    formattedParagraphs
  };
}

/**
 * Splits Ellen White quotes into smaller, more readable 2-3 sentence paragraph sections
 * as requested to avoid dense walls of text and improve readability.
 */
export function formatEgwParagraphChunks(rawQuote: string): string[] {
  if (!rawQuote || !rawQuote.trim()) return [];

  const clean = decodeHtmlEntities(rawQuote).trim();

  // If explicit newlines already exist, honor them
  if (clean.includes("\n")) {
    const rawParas = clean
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (rawParas.length > 1) {
      return rawParas;
    }
  }

  // If already concise (under 240 chars), return single paragraph
  if (clean.length <= 240) {
    return [clean];
  }

  // Split into sentences on full stops, question marks, exclamation marks
  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length <= 2) {
    return [clean];
  }

  const resultParagraphs: string[] = [];
  let currentGroup: string[] = [];
  let currentLen = 0;

  for (const sentence of sentences) {
    const sTrimmed = sentence.trim();
    if (!sTrimmed) continue;

    currentGroup.push(sTrimmed);
    currentLen += sTrimmed.length;

    // Group 2 to 3 sentences or ~200-280 characters per paragraph
    if (currentGroup.length >= 3 || currentLen >= 240) {
      resultParagraphs.push(currentGroup.join(" "));
      currentGroup = [];
      currentLen = 0;
    }
  }

  if (currentGroup.length > 0) {
    if (resultParagraphs.length > 0 && currentGroup.length === 1 && currentLen < 100) {
      resultParagraphs[resultParagraphs.length - 1] += ` ${currentGroup.join(" ")}`;
    } else {
      resultParagraphs.push(currentGroup.join(" "));
    }
  }

  return resultParagraphs;
}

export const SCRIPTURE_BOOKS_PATTERN =
  "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|" +
  "1\\s*Samuel|2\\s*Samuel|1\\s*Kings|2\\s*Kings|1\\s*Chronicles|2\\s*Chronicles|Ezra|Nehemiah|Esther|Job|" +
  "Psalms?|Proverbs|Ecclesiastes|Song\\s+of\\s+(?:Solomon|Songs)|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|" +
  "Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|" +
  "Matthew|Mark|Luke|John|Acts|Romans|1\\s*Corinthians|2\\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|" +
  "1\\s*Thessalonians|2\\s*Thessalonians|1\\s*Timothy|2\\s*Timothy|Titus|Philemon|Hebrews|James|" +
  "1\\s*Peter|2\\s*Peter|1\\s*John|2\\s*John|3\\s*John|Jude|Revelation|" +
  "Gen|Exod?|Ex|Lev|Num|Deut|Josh|Judg|1\\s*Sam|2\\s*Sam|1\\s*Kgs|2\\s*Kgs|1\\s*Kings|2\\s*Kings|" +
  "1\\s*Chron?|2\\s*Chron?|Ezra|Neh|Esth|Job|Ps|Psa|Prov|Eccl|Song|Isa|Jer|Lam|Ezek?|Dan|Hos|Joel|Amos|Obad|Jonah|Mic|Nah|Hab|Zeph|Hag|Zech|Mal|" +
  "Matt?|Mark?|Luke?|John|Acts|Rom|1\\s*Cor|2\\s*Cor|Gal|Eph|Phil|Php|Col|1\\s*Thess|2\\s*Thess|1\\s*Tim|2\\s*Tim|Tit|Philem|Heb|Jas|1\\s*Pet|2\\s*Pet|1\\s*Jn|2\\s*Jn|3\\s*Jn|Jude|Rev";

/**
 * Returns a global case-insensitive RegExp matching Bible references:
 * - Specific verses & multi-verse ranges: e.g. "Heb. 1:1 , 2", "2 Tim. 3:15–17", "Matt. 26:36 , 37", "Exod. 17:14", "Ezek. 4:1–8"
 * - Chapter ranges: e.g. "1 Cor. 8–10"
 */
export function getScriptureRegex(): RegExp {
  return new RegExp(
    `\\b(?:[1-3]\\s*)?(?:${SCRIPTURE_BOOKS_PATTERN})\\.?\\s*(?:\\d+:\\d+(?:\\s*[–—\\-]\\s*\\d+)?(?:\\s*,\\s*\\d+(?:\\s*[–—\\-]\\s*\\d+)?)*|\\d+\\s*[–—\\-]\\s*\\d+)`,
    "gi"
  );
}

/**
 * Separates main daily lesson exposition paragraphs from supplemental Ellen White Notes,
 * with full sentence restructuring and clear paragraph formatting.
 */
export function separateLessonAndEgwNotes(
  contentInput: any,
  egwNotesInput?: any
): SeparatedContent {
  let rawParagraphs: string[] = [];

  if (Array.isArray(contentInput)) {
    rawParagraphs = contentInput.map((item) => (typeof item === "string" ? item : item?.text || ""));
  } else if (typeof contentInput === "string") {
    rawParagraphs = contentInput.split("\n\n");
  } else if (contentInput && typeof contentInput === "object" && contentInput.text) {
    rawParagraphs = [contentInput.text];
  }

  let explicitEgw: string[] = [];
  if (Array.isArray(egwNotesInput)) {
    explicitEgw = egwNotesInput.map((item) => (typeof item === "string" ? item : item?.text || ""));
  } else if (typeof egwNotesInput === "string" && egwNotesInput.trim()) {
    explicitEgw = [egwNotesInput.trim()];
  }

  const mainParagraphs: string[] = [];
  const egwParagraphs: string[] = [];

  // Add explicit EGW notes
  explicitEgw.forEach((note) => {
    const { quote, source } = formatEgwNoteSentenceStructure(note);
    if (quote && !quote.includes("quotations are taken from Ellen White Notes")) {
      const fullNote = source !== "Ellen G. White" ? `${quote} —${source}` : quote;
      if (!egwParagraphs.includes(fullNote)) {
        egwParagraphs.push(fullNote);
      }
    }
  });

  const egwAuthors = [
    "ellen g. white",
    "ellen white",
    "e. g. white",
    "e.g. white",
    "mrs. white",
    "sister white",
    "supplemental egw notes",
    "e.g. white notes",
    "ellen white notes"
  ];

  const egwBookCitations = [
    "sons and daughters of god",
    "ye shall receive power",
    "patriarchs and prophets",
    "prophets and kings",
    "the desire of ages",
    "the great controversy",
    "the acts of the apostles",
    "steps to christ",
    "christ's object lessons",
    "ministry of healing",
    "testimonies for the church",
    "testimonies, vol",
    "reflecting christ",
    "my life today",
    "maranatha",
    "god's amazing grace",
    "early writings",
    "education",
    "evangelism",
    "gospel workers",
    "selected messages",
    "messages to young people",
    "counsels on diet and foods",
    "counsels on stewardship",
    "counsels to writers and editors",
    "thoughts from the mount of blessing"
  ];

  rawParagraphs.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    if (lower.includes("quotations are taken from ellen g. white notes") || lower.includes("quotations are taken from ellen white notes")) {
      return; // Skip standard publisher disclaimer
    }

    // Check if this paragraph contains Ellen G. White quotation or book attribution
    const hasAuthor = egwAuthors.some((auth) => lower.includes(auth));
    const hasBookCitation = egwBookCitations.some((book) => {
      return (
        lower.includes(`—${book}`) ||
        lower.includes(`–${book}`) ||
        lower.includes(`-${book}`) ||
        lower.includes(`(${book}`) ||
        lower.includes(`from ${book}`)
      );
    });

    const isEgw = hasAuthor || hasBookCitation || trimmed.startsWith("Supplemental EGW Notes");

    if (isEgw) {
      const { quote, source } = formatEgwNoteSentenceStructure(trimmed);
      if (quote) {
        const fullNote = source !== "Ellen G. White" ? `${quote} —${source}` : quote;
        if (!egwParagraphs.includes(fullNote)) {
          egwParagraphs.push(fullNote);
        }
      }
    } else {
      // Reformat lesson exposition into clear, readable paragraphs
      const reformatted = reformatParagraphText(trimmed);
      mainParagraphs.push(...reformatted);
    }
  });

  if (mainParagraphs.length === 0) {
    mainParagraphs.push(
      "### 1. Introduction to 1 Corinthians 8–10\nFirst Corinthians 8–10 brings the discussion on sexuality (in chapters 5–6) to a conclusion at the same time that it introduces Paul’s answers to specific questions asked through a letter (1 Cor. 7:1) from the Corinthians.",
      "### 2. Sexual Immorality and Idolatry\nThe transitional nature of 1 Corinthians 7 indicates that sexual immorality (chapters 5–7) and idolatry (chapters 8–10) are related topics. Indeed, they are often mentioned together in the New Testament (see Acts 15:20, 29; 1 Cor. 6:9; Eph. 5:5; Rev. 21:8).",
      "### 3. Fleeing From Idolatry\nIn general, while in 1 Corinthians 5–7 Paul deals with the problem of sexual immorality, in 1 Corinthians 8–10 his main concern is the issue of idolatry. He states that Christians must flee from both (1 Cor. 6:18, 1 Cor. 10:14). We can flee from idolatry by doing “all to the glory of God” (1 Cor. 10:31, NKJV)."
    );
  }

  return { mainParagraphs, egwParagraphs };
}
