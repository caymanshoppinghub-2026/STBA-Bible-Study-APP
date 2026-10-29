/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mapping of biblical book abbreviations to their full spoken phonetic names
const BIBLE_BOOKS: Record<string, string> = {
  // Old Testament
  "gen": "Genesis",
  "genesis": "Genesis",
  "ex": "Exodus",
  "exod": "Exodus",
  "exodus": "Exodus",
  "lev": "Leviticus",
  "levit": "Leviticus",
  "leviticus": "Leviticus",
  "num": "Numbers",
  "numb": "Numbers",
  "numbers": "Numbers",
  "deut": "Deuteronomy",
  "deuteronomy": "Deuteronomy",
  "josh": "Joshua",
  "joshua": "Joshua",
  "judg": "Judges",
  "judges": "Judges",
  "ruth": "Ruth",
  "1 sam": "First Samuel",
  "1 samuel": "First Samuel",
  "1sam": "First Samuel",
  "2 sam": "Second Samuel",
  "2 samuel": "Second Samuel",
  "2sam": "Second Samuel",
  "1 kings": "First Kings",
  "1 kgs": "First Kings",
  "1kgs": "First Kings",
  "2 kings": "Second Kings",
  "2 kgs": "Second Kings",
  "2kgs": "Second Kings",
  "1 chron": "First Chronicles",
  "1 chronicles": "First Chronicles",
  "1 chr": "First Chronicles",
  "2 chron": "Second Chronicles",
  "2 chronicles": "Second Chronicles",
  "2 chr": "Second Chronicles",
  "ezra": "Ezra",
  "neh": "Nehemiah",
  "nehemiah": "Nehemiah",
  "esth": "Esther",
  "esther": "Esther",
  "job": "Job",
  "ps": "Psalm",
  "psa": "Psalm",
  "psalm": "Psalm",
  "psalms": "Psalms",
  "prov": "Proverbs",
  "proverbs": "Proverbs",
  "eccl": "Ecclesiastes",
  "eccles": "Ecclesiastes",
  "ecclesiastes": "Ecclesiastes",
  "song": "Song of Solomon",
  "song of solomon": "Song of Solomon",
  "song of sol": "Song of Solomon",
  "isa": "Isaiah",
  "isaiah": "Isaiah",
  "jer": "Jeremiah",
  "jeremiah": "Jeremiah",
  "lam": "Lamentations",
  "lamentations": "Lamentations",
  "ezek": "Ezekiel",
  "ezekiel": "Ezekiel",
  "dan": "Daniel",
  "daniel": "Daniel",
  "hos": "Hosea",
  "hosea": "Hosea",
  "joel": "Joel",
  "amos": "Amos",
  "obad": "Obadiah",
  "obadiah": "Obadiah",
  "jonah": "Jonah",
  "mic": "Micah",
  "micah": "Micah",
  "nah": "Nahum",
  "nahum": "Nahum",
  "hab": "Habakkuk",
  "habakkuk": "Habakkuk",
  "zeph": "Zephaniah",
  "zephaniah": "Zephaniah",
  "hag": "Haggai",
  "haggai": "Haggai",
  "zech": "Zechariah",
  "zechariah": "Zechariah",
  "mal": "Malachi",
  "malachi": "Malachi",

  // New Testament
  "matt": "Matthew",
  "mat": "Matthew",
  "matthew": "Matthew",
  "mark": "Mark",
  "mk": "Mark",
  "luke": "Luke",
  "lk": "Luke",
  "john": "John",
  "jn": "John",
  "acts": "Acts",
  "rom": "Romans",
  "romans": "Romans",
  "1 cor": "First Corinthians",
  "1 corinthians": "First Corinthians",
  "1cor": "First Corinthians",
  "2 cor": "Second Corinthians",
  "2 corinthians": "Second Corinthians",
  "2cor": "Second Corinthians",
  "gal": "Galatians",
  "galatians": "Galatians",
  "eph": "Ephesians",
  "ephesians": "Ephesians",
  "phil": "Philippians",
  "philippians": "Philippians",
  "col": "Colossians",
  "colossians": "Colossians",
  "1 thess": "First Thessalonians",
  "1 thessalonians": "First Thessalonians",
  "1thess": "First Thessalonians",
  "2 thess": "Second Thessalonians",
  "2 thessalonians": "Second Thessalonians",
  "2thess": "Second Thessalonians",
  "1 tim": "First Timothy",
  "1 timothy": "First Timothy",
  "1tim": "First Timothy",
  "2 tim": "Second Timothy",
  "2 timothy": "Second Timothy",
  "2tim": "Second Timothy",
  "titus": "Titus",
  "philem": "Philemon",
  "philemon": "Philemon",
  "heb": "Hebrews",
  "hebrews": "Hebrews",
  "james": "James",
  "jas": "James",
  "1 pet": "First Peter",
  "1 peter": "First Peter",
  "1pet": "First Peter",
  "2 pet": "Second Peter",
  "2 peter": "Second Peter",
  "2pet": "Second Peter",
  "1 john": "First John",
  "1 jn": "First John",
  "1john": "First John",
  "2 john": "Second John",
  "2 jn": "Second John",
  "2john": "Second John",
  "3 john": "Third John",
  "3 jn": "Third John",
  "3john": "Third John",
  "jude": "Jude",
  "rev": "Revelation",
  "revelation": "Revelation"
};

// Converts integers 1 through 999 into spoken English words
export function numberToWords(num: number): string {
  if (num === 0) return "zero";
  if (num < 0) return `negative ${numberToWords(Math.abs(num))}`;

  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
  ];
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];

  if (num < 20) {
    return ones[num];
  }

  if (num < 100) {
    const tenPart = tens[Math.floor(num / 10)];
    const remainder = num % 10;
    return remainder ? `${tenPart}-${ones[remainder]}` : tenPart;
  }

  if (num < 1000) {
    const hundredPart = `${ones[Math.floor(num / 100)]} hundred`;
    const remainder = num % 100;
    return remainder ? `${hundredPart} ${numberToWords(remainder)}` : hundredPart;
  }

  return String(num);
}

/**
 * Expands scripture references like "2 Cor. 10:1-17" into
 * "Second Corinthians chapter ten, verses one through seventeen"
 */
export function expandScriptureReferences(text: string): string {
  // Regex to match Book (with optional 1/2/3 prefix and optional dot) followed by Chapter:Verse(s)
  // e.g. "2 Cor. 10:1-17", "Matt. 24:14", "Gen. 1:1-3", "1 Thess 4:16"
  const refRegex = /\b([1-3]\s*[A-Za-z]+|[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\.?\s+(\d+):(\d+)(?:[–—\-](\d+))?\b/g;

  return text.replace(refRegex, (match, rawBook, chapterStr, startVerseStr, endVerseStr) => {
    const cleanBookKey = rawBook.toLowerCase().replace(/\./g, "").trim().replace(/\s+/g, " ");
    const bookSpoken = BIBLE_BOOKS[cleanBookKey];

    if (!bookSpoken) {
      // If book isn't in dictionary, leave book as is, but still smooth out chapter and verse
      const ch = parseInt(chapterStr, 10);
      const chSpoken = isNaN(ch) ? chapterStr : numberToWords(ch);
      const sv = parseInt(startVerseStr, 10);
      const svSpoken = isNaN(sv) ? startVerseStr : numberToWords(sv);

      if (endVerseStr) {
        const ev = parseInt(endVerseStr, 10);
        const evSpoken = isNaN(ev) ? endVerseStr : numberToWords(ev);
        return `${rawBook} chapter ${chSpoken}, verses ${svSpoken} through ${evSpoken}`;
      }
      return `${rawBook} chapter ${chSpoken}, verse ${svSpoken}`;
    }

    const ch = parseInt(chapterStr, 10);
    const chSpoken = isNaN(ch) ? chapterStr : numberToWords(ch);
    const sv = parseInt(startVerseStr, 10);
    const svSpoken = isNaN(sv) ? startVerseStr : numberToWords(sv);

    if (endVerseStr) {
      const ev = parseInt(endVerseStr, 10);
      const evSpoken = isNaN(ev) ? endVerseStr : numberToWords(ev);
      return `${bookSpoken} chapter ${chSpoken}, verses ${svSpoken} through ${evSpoken}`;
    }

    return `${bookSpoken} chapter ${chSpoken}, verse ${svSpoken}`;
  });
}

const SCRIPTURE_BOOKS_NARRATION_PATTERN =
  "Genesis|Gen|Exodus|Exod?|Exo|Ex|Leviticus|Lev|Le|Numbers|Num|Nu|Deuteronomy|Deut|Deu|Dt|" +
  "Joshua|Josh|Jos|Judges|Judg|Jdg|Ruth|Ru|" +
  "1\\s*Samuel|2\\s*Samuel|1\\s*Sam|2\\s*Sam|1\\s*Sa|2\\s*Sa|1\\s*Kings|2\\s*Kings|1\\s*Kgs|2\\s*Kgs|1\\s*Ki|2\\s*Ki|" +
  "1\\s*Chronicles|2\\s*Chronicles|1\\s*Chron?|2\\s*Chr|1\\s*Chr|" +
  "Ezra|Ezr|Nehemiah|Neh|Ne|Esther|Esth|Job|Jb|" +
  "Psalms?|Psa|Ps|Proverbs|Prov|Pro|Pr|Ecclesiastes|Eccles|Eccl|Ecc|Song\\s+of\\s+(?:Solomon|Songs)|Song|" +
  "Isaiah|Isa|Is|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Eze|Daniel|Dan|Da|" +
  "Hosea|Hos|Joel|Amos|Am|Obadiah|Obad|Jonah|Jon|Micah|Mic|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|" +
  "Matthew|Matt?|Mat|Mt|Mark|Mrk|Mk|Luke|Luk|Lk|John|Joh|Jn|Acts|Act|Ac|Romans|Rom|Ro|" +
  "1\\s*Corinthians|2\\s*Corinthians|1\\s*Cor|2\\s*Cor|1\\s*Co|2\\s*Co|" +
  "Galatians|Gal|Ephesians|Ephes|Eph|Philippians|Phil|Php|Colossians|Col|" +
  "1\\s*Thessalonians|2\\s*Thessalonians|1\\s*Thess|2\\s*Thess|1\\s*Th|2\\s*Th|" +
  "1\\s*Timothy|2\\s*Timothy|1\\s*Tim|2\\s*Tim|Titus|Tit|Philemon|Philem|Hebrews|Heb|He|" +
  "James|Jas|1\\s*Peter|2\\s*Peter|1\\s*Pet|2\\s*Pet|1\\s*Pe|2\\s*Pe|" +
  "1\\s*John|2\\s*John|3\\s*John|1\\s*Joh|2\\s*Joh|3\\s*Joh|1\\s*Jn|2\\s*Jn|3\\s*Jn|" +
  "Jude|Jud|Revelation|Revel|Rev|Re";

/**
 * Strips inline scripture references, parenthetical citations, translation identifiers,
 * and metadata headings so the narrator reads only the main paragraph prose text naturally.
 */
export function stripScriptureReferencesAndMetadata(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text
    .replace(/\u00A0/g, " ")
    .replace(/[–—\u2013\u2014\u2212]/g, "-");

  // 1. Remove parenthetical scripture citations: e.g. "(see Acts 15:20, 29; 1 Cor. 6:9; Eph. 5:5; Rev. 21:8)",
  // "(1 Cor. 7:1)", "(1 Cor. 10:31, NKJV)", "(John 3:16)", "(cf. Rom. 8:1-4)"
  const parenScriptureRegex = new RegExp(
    `\\s*\\([\\s]*(?:see(?:\\s+also)?|compare|cf\\.?|read|quoted\\s+in)?\\s*(?:[1-3]\\s*)?(?:${SCRIPTURE_BOOKS_NARRATION_PATTERN})\\.?\\s*\\d+[:.]\\d+[\\s\\S]*?\\)`,
    "gi"
  );
  cleaned = cleaned.replace(parenScriptureRegex, "");

  // 2. Remove standalone parenthetical translation tags e.g. "(NKJV)", "(KJV)", "(ESV)", "(NASB)", "(NIV)"
  cleaned = cleaned.replace(/\s*\((?:NKJV|KJV|ESV|NASB|NIV|NLT|RSV|AMP)\)/gi, "");

  // 3. Remove standalone verse citations outside parentheses (e.g. "1 Cor. 10:31", "Rev. 14:12")
  const inlineScriptureRegex = new RegExp(
    `\\b(?:see\\s+|compare\\s+)?(?:[1-3]\\s*)?(?:${SCRIPTURE_BOOKS_NARRATION_PATTERN})\\.?\\s*\\d+[:.]\\d+(?:[–—\\-]\\d+)?(?:,\\s*\\d+(?:[–—\\-]\\d+)?)*\\b`,
    "gi"
  );
  cleaned = cleaned.replace(inlineScriptureRegex, "");

  // 4. Remove metadata brackets e.g. [1], [2], footnote indicators
  cleaned = cleaned.replace(/\[\d+\]/g, "");
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 5. Remove markdown section headers and metadata lines:
  // e.g. "### 1. Introduction to 1 Corinthians 8-10" or "Lesson 1: ..."
  cleaned = cleaned.replace(/^#{1,6}\s*(?:\d+[\.:]\s*)?.*$/gm, "");

  // 6. Clean markdown formatting: bold, italic, blockquotes, bullets
  cleaned = cleaned
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*•]\s+/gm, "");

  // 7. Clean up punctuation and spacing around stripped elements
  cleaned = cleaned
    .replace(/\s*([,;:])\s*/g, "$1 ")
    .replace(/\s+([.?!])/g, "$1")
    .replace(/,\s*,+/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

/**
 * Strips markdown and cleans lesson text to ensure a single, continuous, natural flowing spoken narration
 * containing ONLY the main paragraph text, skipping any inline scripture references or metadata.
 */
export function cleanLessonTextForSpokenNarration(content: any): string {
  let rawText = "";

  if (Array.isArray(content)) {
    rawText = content
      .map((item) => (typeof item === "string" ? item : item?.text || ""))
      .filter(Boolean)
      .join("\n\n");
  } else if (typeof content === "string") {
    rawText = content;
  } else if (content && typeof content === "object") {
    rawText = content.text || content.body || content.content || "";
  }

  if (!rawText.trim()) return "";

  // 1. Strip inline scripture references and metadata so only main paragraph text remains
  let smoothed = stripScriptureReferencesAndMetadata(rawText);

  // 2. Avoid robotic pauses at punctuation
  smoothed = smoothed.replace(/\.{2,}/g, ".");
  smoothed = smoothed.replace(/—|–/g, ", ");
  smoothed = smoothed.replace(/;/g, ",");
  smoothed = smoothed.replace(/\s+/g, " ").trim();

  return smoothed;
}

/**
 * Resolves the Microsoft Emma Multilingual (Natural) voice from Web Speech API.
 * Prioritizes exact variations, Microsoft Emma natural voices, Emma female voice aliases,
 * or high-quality natural female voices.
 */
export function getMicrosoftEmmaVoice(voices?: SpeechSynthesisVoice[]): {
  voice: SpeechSynthesisVoice | null;
  voiceName: string;
  isEmma: boolean;
} {
  const voiceList =
    voices && voices.length > 0
      ? voices
      : typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis.getVoices()
      : [];

  if (!voiceList || voiceList.length === 0) {
    return { voice: null, voiceName: "Microsoft Emma (Natural)", isEmma: false };
  }

  // 1. Direct search for Microsoft Emma Multilingual / Natural
  const emmaMultilingual = voiceList.find((v) => {
    const name = v.name.toLowerCase();
    return (
      name.includes("emma") &&
      name.includes("microsoft") &&
      (name.includes("multilingual") || name.includes("natural"))
    );
  });
  if (emmaMultilingual) {
    return { voice: emmaMultilingual, voiceName: emmaMultilingual.name, isEmma: true };
  }

  // 2. Any Microsoft Emma voice
  const msEmma = voiceList.find((v) => {
    const name = v.name.toLowerCase();
    return name.includes("microsoft") && name.includes("emma");
  });
  if (msEmma) {
    return { voice: msEmma, voiceName: msEmma.name, isEmma: true };
  }

  // 3. Any voice containing "Emma"
  const anyEmma = voiceList.find((v) => v.name.toLowerCase().includes("emma"));
  if (anyEmma) {
    return { voice: anyEmma, voiceName: anyEmma.name, isEmma: true };
  }

  // 4. High-fidelity natural female English voices fallback
  const preferredFemaleVoices = [
    "jenny",
    "aria",
    "samantha",
    "serena",
    "victoria",
    "karen",
    "zira",
    "google us english",
    "michelle",
    "clara",
    "susan"
  ];

  for (const name of preferredFemaleVoices) {
    const match = voiceList.find(
      (v) => v.lang.toLowerCase().startsWith("en") && v.name.toLowerCase().includes(name)
    );
    if (match) {
      return { voice: match, voiceName: `${match.name} (Natural Voice)`, isEmma: false };
    }
  }

  // 5. Any natural English voice
  const naturalEn = voiceList.find(
    (v) =>
      v.lang.toLowerCase().startsWith("en") &&
      (v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("multilingual") ||
        v.name.toLowerCase().includes("online"))
  );
  if (naturalEn) {
    return { voice: naturalEn, voiceName: `${naturalEn.name} (Natural Voice)`, isEmma: false };
  }

  // 6. Default English voice
  const defaultEn = voiceList.find((v) => v.lang.toLowerCase().startsWith("en")) || voiceList[0];
  return { voice: defaultEn, voiceName: defaultEn?.name || "Microsoft Emma (Natural)", isEmma: false };
}

// Backwards compatibility alias
export const getAvaVoice = getMicrosoftEmmaVoice;

/**
 * Calls server endpoint to get Ava's formatted spoken narration script and optional audio
 */
export async function requestAvaLessonNarration(
  lessonTitle: string,
  lessonText: string
): Promise<{ success: boolean; narrationText: string; audioBase64?: string }> {
  try {
    const res = await fetch("/api/sabbath/read-lesson-aloud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonTitle,
        lessonContent: lessonText,
        voice: "Ava"
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.narrationText) {
        return {
          success: true,
          narrationText: data.narrationText,
          audioBase64: data.audio
        };
      }
    }
  } catch (err) {
    console.warn("[Ava Narration Request] Server fallback activated:", err);
  }

  // Instant client-side fallback
  const clientPrepared = cleanLessonTextForSpokenNarration(lessonText);
  return {
    success: true,
    narrationText: clientPrepared
  };
}
