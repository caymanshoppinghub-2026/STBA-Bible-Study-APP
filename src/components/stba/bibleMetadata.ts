export interface BookMetadata {
  name: string;
  aliases: string[];
  chapters: number[];
}

export const BIBLE_METADATA: BookMetadata[] = [
  {
    name: "Genesis",
    aliases: ["gen", "genesis", "ge"],
    chapters: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26]
  },
  {
    name: "Exodus",
    aliases: ["ex", "exodus", "exo"],
    chapters: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38]
  },
  {
    name: "Leviticus",
    aliases: ["lev", "leviticus", "le"],
    chapters: [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34]
  },
  {
    name: "Numbers",
    aliases: ["num", "numbers", "nu"],
    chapters: [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13]
  },
  {
    name: "Deuteronomy",
    aliases: ["deut", "deuteronomy", "de", "dt"],
    chapters: [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12]
  },
  {
    name: "Joshua",
    aliases: ["josh", "joshua", "jos", "js"],
    chapters: [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33]
  },
  {
    name: "Judges",
    aliases: ["judg", "judges", "jdg", "jg"],
    chapters: [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25]
  },
  {
    name: "Ruth",
    aliases: ["ruth", "ru", "rth"],
    chapters: [22, 23, 18, 22]
  },
  {
    name: "1 Samuel",
    aliases: ["1 sam", "1 samuel", "1sa", "1s"],
    chapters: [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 28, 22, 44, 25, 12, 25, 11, 31, 13]
  },
  {
    name: "2 Samuel",
    aliases: ["2 sam", "2 samuel", "2sa", "2s"],
    chapters: [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25]
  },
  {
    name: "1 Kings",
    aliases: ["1 kings", "1ki", "1k"],
    chapters: [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54]
  },
  {
    name: "2 Kings",
    aliases: ["2 kings", "2ki", "2k"],
    chapters: [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30]
  },
  {
    name: "1 Chronicles",
    aliases: ["1 chr", "1 chronicles", "1ch"],
    chapters: [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30]
  },
  {
    name: "2 Chronicles",
    aliases: ["2 chr", "2 chronicles", "2ch"],
    chapters: [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 32, 27, 30, 36, 27, 21, 33, 25, 33, 27, 23]
  },
  {
    name: "Ezra",
    aliases: ["ezra", "ezr", "ez"],
    chapters: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44]
  },
  {
    name: "Nehemiah",
    aliases: ["neh", "nehemiah", "ne"],
    chapters: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31]
  },
  {
    name: "Esther",
    aliases: ["est", "esther", "esth"],
    chapters: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3]
  },
  {
    name: "Job",
    aliases: ["job", "jb"],
    chapters: [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17]
  },
  {
    name: "Psalms",
    aliases: ["ps", "psalms", "psalm", "psa"],
    chapters: [
      6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 
      24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 
      8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 
      16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 
      8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 11, 15, 21, 10, 9, 14, 9, 6
    ]
  },
  {
    name: "Proverbs",
    aliases: ["prov", "proverbs", "pr"],
    chapters: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31]
  },
  {
    name: "Ecclesiastes",
    aliases: ["eccl", "ecclesiastes", "ecc", "ec"],
    chapters: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14]
  },
  {
    name: "Song of Solomon",
    aliases: ["song of solomon", "song", "sos", "canticles"],
    chapters: [17, 17, 11, 16, 16, 13, 13, 14]
  },
  {
    name: "Isaiah",
    aliases: ["isa", "isaiah", "is"],
    chapters: [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24]
  },
  {
    name: "Jeremiah",
    aliases: ["jer", "jeremiah", "je"],
    chapters: [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 28, 30, 5, 28, 7, 47, 39, 46, 64, 34]
  },
  {
    name: "Lamentations",
    aliases: ["lam", "lamentations", "la"],
    chapters: [22, 22, 66, 22, 21]
  },
  {
    name: "Ezekiel",
    aliases: ["ezek", "ezekiel", "ezk"],
    chapters: [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 10, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 35, 35]
  },
  {
    name: "Daniel",
    aliases: ["dan", "daniel", "dn"],
    chapters: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13]
  },
  {
    name: "Hosea",
    aliases: ["hos", "hosea"],
    chapters: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9]
  },
  {
    name: "Joel",
    aliases: ["joel", "jl"],
    chapters: [20, 32, 21]
  },
  {
    name: "Amos",
    aliases: ["amos", "am"],
    chapters: [15, 16, 15, 13, 27, 14, 17, 14, 15]
  },
  {
    name: "Obadiah",
    aliases: ["obad", "obadiah", "ob"],
    chapters: [21]
  },
  {
    name: "Jonah",
    aliases: ["jon", "jonah", "jonah"],
    chapters: [17, 10, 10, 11]
  },
  {
    name: "Micah",
    aliases: ["mic", "micah", "mi"],
    chapters: [16, 13, 12, 13, 15, 16, 20]
  },
  {
    name: "Nahum",
    aliases: ["nah", "nahum", "na"],
    chapters: [15, 13, 19]
  },
  {
    name: "Habakkuk",
    aliases: ["hab", "habakkuk", "hb"],
    chapters: [17, 20, 19]
  },
  {
    name: "Zephaniah",
    aliases: ["zeph", "zephaniah", "zep", "zp"],
    chapters: [18, 15, 20]
  },
  {
    name: "Haggai",
    aliases: ["hag", "haggai", "hg"],
    chapters: [15, 23]
  },
  {
    name: "Zechariah",
    aliases: ["zech", "zechariah", "zec", "zc"],
    chapters: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 14]
  },
  {
    name: "Malachi",
    aliases: ["mal", "malachi", "ml"],
    chapters: [14, 17, 18, 6]
  },
  {
    name: "Matthew",
    aliases: ["matt", "matthew", "mt"],
    chapters: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20]
  },
  {
    name: "Mark",
    aliases: ["mark", "mk", "mr"],
    chapters: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20]
  },
  {
    name: "Luke",
    aliases: ["luke", "lk", "lu"],
    chapters: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53]
  },
  {
    name: "John",
    aliases: ["john", "jn", "joh"],
    chapters: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25]
  },
  {
    name: "Acts",
    aliases: ["acts", "act", "ac"],
    chapters: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31]
  },
  {
    name: "Romans",
    aliases: ["rom", "romans", "ro", "rm"],
    chapters: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27]
  },
  {
    name: "1 Corinthians",
    aliases: ["1 cor", "1 corinthians", "1co", "1c"],
    chapters: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24]
  },
  {
    name: "2 Corinthians",
    aliases: ["2 cor", "2 corinthians", "2co", "2c"],
    chapters: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14]
  },
  {
    name: "Galatians",
    aliases: ["gal", "galatians", "ga"],
    chapters: [24, 21, 29, 31, 26, 18]
  },
  {
    name: "Ephesians",
    aliases: ["eph", "ephesians", "ep"],
    chapters: [23, 22, 21, 32, 33, 24]
  },
  {
    name: "Philippians",
    aliases: ["phil", "philippians", "php", "pp"],
    chapters: [30, 30, 21, 23]
  },
  {
    name: "Colossians",
    aliases: ["col", "colossians", "cl"],
    chapters: [29, 23, 25, 18]
  },
  {
    name: "1 Thessalonians",
    aliases: ["1 thess", "1 thessalonians", "1th"],
    chapters: [10, 20, 13, 18, 28]
  },
  {
    name: "2 Thessalonians",
    aliases: ["2 thess", "2 thessalonians", "2th"],
    chapters: [12, 17, 18]
  },
  {
    name: "1 Timothy",
    aliases: ["1 tim", "1 timothy", "1ti", "1tm"],
    chapters: [20, 15, 16, 16, 25, 21]
  },
  {
    name: "2 Timothy",
    aliases: ["2 tim", "2 timothy", "2ti", "2tm"],
    chapters: [18, 26, 17, 22]
  },
  {
    name: "Titus",
    aliases: ["titus", "tit", "tt"],
    chapters: [16, 15, 15]
  },
  {
    name: "Philemon",
    aliases: ["philem", "philemon", "phm"],
    chapters: [25]
  },
  {
    name: "Hebrews",
    aliases: ["heb", "hebrews", "he"],
    chapters: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25]
  },
  {
    name: "James",
    aliases: ["jas", "jam", "jame", "james", "jm"],
    chapters: [27, 26, 18, 17, 20]
  },
  {
    name: "1 Peter",
    aliases: ["1 pet", "1 peter", "1pe"],
    chapters: [25, 25, 22, 19, 14]
  },
  {
    name: "2 Peter",
    aliases: ["2 pet", "2 peter", "2pe"],
    chapters: [21, 22, 18]
  },
  {
    name: "1 John",
    aliases: ["1 john", "1jn", "1jo"],
    chapters: [10, 29, 24, 21, 21]
  },
  {
    name: "2 John",
    aliases: ["2 john", "2jn", "2jo"],
    chapters: [13]
  },
  {
    name: "3 John",
    aliases: ["3 john", "3jn", "3jo"],
    chapters: [14]
  },
  {
    name: "Jude",
    aliases: ["jude", "jud"],
    chapters: [25]
  },
  {
    name: "Revelation",
    aliases: ["rev", "revelation", "re"],
    chapters: [
      20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 
      19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 
      27, 21
    ]
  }
];

export function getPreviousVerse(reference: string, currentVerse: number): { reference: string; verseNumber: number } | null {
  const parsed = parseVerseRef(reference, currentVerse);
  if (!parsed) return null;

  const { bookIndex, chapter, verse } = parsed;
  const book = BIBLE_METADATA[bookIndex];

  // If we can go back in the same chapter
  if (verse > 1) {
    return {
      reference: `${book.name} ${chapter}:${verse - 1}`,
      verseNumber: verse - 1
    };
  }

  // If we are at verse 1 of chapter > 1
  if (chapter > 1) {
    const prevChapter = chapter - 1;
    const prevChapterMaxVerse = book.chapters[prevChapter - 1];
    return {
      reference: `${book.name} ${prevChapter}:${prevChapterMaxVerse}`,
      verseNumber: prevChapterMaxVerse
    };
  }

  // If we are at chapter 1, verse 1 of book > 0
  if (bookIndex > 0) {
    const prevBook = BIBLE_METADATA[bookIndex - 1];
    const prevBookLastChapter = prevBook.chapters.length;
    const prevBookLastVerse = prevBook.chapters[prevBookLastChapter - 1];
    return {
      reference: `${prevBook.name} ${prevBookLastChapter}:${prevBookLastVerse}`,
      verseNumber: prevBookLastVerse
    };
  }

  // At Genesis 1:1, return itself or null
  return null;
}

export function getNextVerse(reference: string, currentVerse: number): { reference: string; verseNumber: number } | null {
  const parsed = parseVerseRef(reference, currentVerse);
  if (!parsed) return null;

  const { bookIndex, chapter, verse } = parsed;
  const book = BIBLE_METADATA[bookIndex];
  const currentChapterMaxVerse = book.chapters[chapter - 1];

  // If we can go to next verse in the same chapter
  if (verse < currentChapterMaxVerse) {
    return {
      reference: `${book.name} ${chapter}:${verse + 1}`,
      verseNumber: verse + 1
    };
  }

  // If we are at the last verse of the chapter, and there is a next chapter
  if (chapter < book.chapters.length) {
    return {
      reference: `${book.name} ${chapter + 1}:1`,
      verseNumber: 1
    };
  }

  // Last verse of last chapter of the book, go to next book if available
  if (bookIndex < BIBLE_METADATA.length - 1) {
    const nextBook = BIBLE_METADATA[bookIndex + 1];
    return {
      reference: `${nextBook.name} 1:1`,
      verseNumber: 1
    };
  }

  // At Revelation 22:21, return itself or null
  return null;
}

function parseVerseRef(reference: string, currentVerse: number): { bookIndex: number; chapter: number; verse: number } | null {
  // Regex to extract Book Name, Chapter, and Verse
  // Support both "Titus 1:1-5" or "Revelation 14:6" or single words "Isaiah 53"
  const clean = reference.trim();
  const bookRegex = /^([1-3|I|II|III]?\s*[A-Za-z\s.]+)\s*(\d+)(?:[\s:.]*(\d+)?(?:\s*[-–—]\s*(\d+))?)?$/i;
  const match = clean.match(bookRegex);

  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  const chapter = parseInt(match[2]);
  let verse = currentVerse;

  if (match[3]) {
    // If verse is specified in ref, but we have a customverse index, we prefer the actual verse context
    if (!verse) {
      verse = parseInt(match[3]);
    }
  } else {
    if (!verse) {
      verse = 1;
    }
  }

  // Find book index
  const bookIndex = BIBLE_METADATA.findIndex(b => 
    b.name.toLowerCase() === rawBook || b.aliases.includes(rawBook)
  );

  if (bookIndex === -1) return null;

  return {
    bookIndex,
    chapter,
    verse
  };
}

export interface ScriptureLookupResult {
  isScripture: boolean;
  canonicalRef: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  isSingleVerse: boolean;
  isRange: boolean;
  isVagueBookOnly: boolean;
}

/**
 * Intuitively parses a scripture lookup query according to user rules:
 * 1. Vague reference (e.g., 'Genesis') -> defaults to Genesis 1:1 and loads the first 20 verses ("Genesis 1:1-20")
 * 2. Specific reference (e.g., 'John 1:3') -> displays that exact single verse ("John 1:3")
 * 3. Range (e.g., 'John 3:16-20') -> displays all verses in the range ("John 3:16-20")
 * 4. Chapter-only (e.g., 'Genesis 1') -> loads first 20 verses of chapter 1 ("Genesis 1:1-20")
 */
export function parseScriptureLookup(query: string): ScriptureLookupResult | null {
  if (!query || typeof query !== "string") return null;
  const clean = query.trim();
  if (!clean) return null;

  // Support comma or semicolon separated multiple references (e.g. "John 3:16, Romans 8:28")
  if (/[,;]/.test(clean)) {
    const parts = clean.split(/[,;]/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const parsedParts = parts.map(p => parseScriptureLookup(p)).filter((r): r is ScriptureLookupResult => r !== null);
      if (parsedParts.length > 0) {
        return {
          ...parsedParts[0],
          canonicalRef: parsedParts.map(p => p.canonicalRef).join(", "),
          isSingleVerse: parsedParts.length === 1 && parsedParts[0].isSingleVerse,
          isRange: parsedParts.length > 1 || parsedParts[0].isRange
        };
      }
    }
  }

  // Normalize leading Roman numerals (e.g. "I John" -> "1 John", "II Tim" -> "2 Tim", "III John" -> "3 John")
  const normalizedClean = clean
    .replace(/^III\s+/i, "3 ")
    .replace(/^II\s+/i, "2 ")
    .replace(/^I\s+/i, "1 ")
    .replace(/^3rd\s+/i, "3 ")
    .replace(/^2nd\s+/i, "2 ")
    .replace(/^1st\s+/i, "1 ");

  // Regex to match:
  // Group 1: Book name with optional numeral prefix (e.g. "Genesis", "1 John", "2 Tim", "Jam")
  // Group 2: Chapter number (optional)
  // Group 3: Start verse (optional — supports colon OR space shorthand like "James 1 2")
  // Group 4: End verse (optional — supports "James 1 2-27" or "James 1:2-27")
  const refRegex = /^([1-3]?\s*[A-Za-z][A-Za-z\s.]*?)(?:\s*(\d+)(?:[\s:.]+(\d+)(?:\s*[-–—]\s*(\d+)?)?)?)?\s*$/i;
  const match = normalizedClean.match(refRegex);

  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  const rawBookCompact = rawBook.replace(/\s+/g, "");
  const rawChapter = match[2];
  const rawStartVerse = match[3];
  const rawEndVerse = match[4];

  // Match against BIBLE_METADATA (exact name/alias first, then unambiguous prefix match)
  let bookMeta = BIBLE_METADATA.find(b => {
    const bName = b.name.toLowerCase();
    const bNameCompact = bName.replace(/\s+/g, "");
    if (bName === rawBook || bNameCompact === rawBookCompact) return true;
    return b.aliases.some(a => {
      const normA = a.toLowerCase().replace(/\./g, "").trim();
      return normA === rawBook || normA.replace(/\s+/g, "") === rawBookCompact;
    });
  });

  if (!bookMeta && rawBookCompact.length >= 1) {
    bookMeta = BIBLE_METADATA.find(b => {
      const bName = b.name.toLowerCase();
      const bNameCompact = bName.replace(/\s+/g, "");
      return bName.startsWith(rawBook) || bNameCompact.startsWith(rawBookCompact);
    });
  }

  if (!bookMeta) return null;

  // 1. Vague reference (e.g. 'Genesis' or 'gen') -> default to Genesis 1:1 and load first 20 verses
  if (!rawChapter) {
    const maxVerses = bookMeta.chapters[0] || 20;
    const endVerse = Math.min(20, maxVerses);
    return {
      isScripture: true,
      canonicalRef: `${bookMeta.name} 1:1-${endVerse}`,
      book: bookMeta.name,
      chapter: 1,
      startVerse: 1,
      endVerse,
      isSingleVerse: false,
      isRange: true,
      isVagueBookOnly: true
    };
  }

  const chapterNum = parseInt(rawChapter, 10);
  const maxChapter = bookMeta.chapters.length;
  const validChapter = Math.min(Math.max(1, chapterNum), maxChapter);
  const maxVerseInChapter = bookMeta.chapters[validChapter - 1] || 30;

  // 2. Chapter only (e.g. 'Genesis 1' or 'John 3') -> load first 20 verses of that chapter
  if (!rawStartVerse) {
    const endVerse = Math.min(20, maxVerseInChapter);
    return {
      isScripture: true,
      canonicalRef: `${bookMeta.name} ${validChapter}:1-${endVerse}`,
      book: bookMeta.name,
      chapter: validChapter,
      startVerse: 1,
      endVerse,
      isSingleVerse: false,
      isRange: true,
      isVagueBookOnly: false
    };
  }

  const startVerseNum = Math.min(maxVerseInChapter, Math.max(1, parseInt(rawStartVerse, 10)));

  // 3. Specific reference (e.g. 'John 1:3') -> exact single verse
  if (!rawEndVerse) {
    return {
      isScripture: true,
      canonicalRef: `${bookMeta.name} ${validChapter}:${startVerseNum}`,
      book: bookMeta.name,
      chapter: validChapter,
      startVerse: startVerseNum,
      endVerse: startVerseNum,
      isSingleVerse: true,
      isRange: false,
      isVagueBookOnly: false
    };
  }

  // 4. Range (e.g. 'John 3:16-20') -> all verses within that range
  const endVerseNum = Math.min(maxVerseInChapter, Math.max(startVerseNum, parseInt(rawEndVerse, 10)));
  return {
    isScripture: true,
    canonicalRef: `${bookMeta.name} ${validChapter}:${startVerseNum}-${endVerseNum}`,
    book: bookMeta.name,
    chapter: validChapter,
    startVerse: startVerseNum,
    endVerse: endVerseNum,
    isSingleVerse: false,
    isRange: true,
    isVagueBookOnly: false
  };
}

// Curated Logos-style Pericope / Section Headings for key chapters across Scripture
const CHAPTER_PERICOPES: Record<string, string> = {
  "Genesis 1": "The Creation of the World",
  "Genesis 2": "The Seventh-Day Sabbath & Eden",
  "Genesis 3": "The Fall & First Gospel Promise",
  "Genesis 6": "Noah Finds Grace in the Eyes of the LORD",
  "Exodus 20": "The Ten Commandments",
  "Exodus 25": "The Pattern of the Heavenly Sanctuary",
  "Leviticus 16": "The Day of Atonement",
  "Deuteronomy 6": "The Great Commandment (Shema)",
  "Joshua 1": "God Commissions Joshua — Be Strong & Courageous",
  "Joshua 24": "Choose You This Day Whom Ye Will Serve",
  "Job 1": "Job's Faithfulness & the Great Controversy",
  "Job 19": "I Know That My Redeemer Liveth",
  "Psalms 1": "The Way of the Righteous and the Wicked",
  "Psalms 19": "The Heavens Declare the Glory of God",
  "Psalms 23": "The LORD Is My Shepherd",
  "Psalms 51": "Create in Me a Clean Heart, O God",
  "Psalms 91": "Dwelling in the Secret Place of the Most High",
  "Psalms 119": "Thy Word Is a Lamp Unto My Feet",
  "Proverbs 3": "Trust in the LORD With All Thine Heart",
  "Ecclesiastes 9": "The Living Know That They Shall Die",
  "Ecclesiastes 12": "Remember Now Thy Creator — Fear God",
  "Isaiah 8": "To the Law and to the Testimony",
  "Isaiah 53": "The Suffering Servant — Wounded for Our Transgressions",
  "Isaiah 58": "The True Fast & Repairing the Sabbath Breach",
  "Jeremiah 31": "The New Covenant Written on the Heart",
  "Daniel 2": "Nebuchadnezzar's Dream & God's Eternal Kingdom",
  "Daniel 7": "The Four Beasts & the Pre-Advent Judgment",
  "Daniel 8": "The 2,300 Days & Cleansing of the Sanctuary",
  "Daniel 9": "Daniel's Prayer & the Seventy Weeks Prophecy",
  "Daniel 12": "The Time of the End & Resurrection",
  "Joel 2": "The Outpouring of the Latter Rain Spirit",
  "Jonah 1": "Jonah's Call & Flight from Nineveh",
  "Malachi 3": "The Messenger of the Covenant & Faithful Stewardship",
  "Matthew 4": "The Temptation of Jesus in the Wilderness",
  "Matthew 5": "The Sermon on the Mount & Beatitudes",
  "Matthew 24": "Signs of Christ's Second Coming",
  "Matthew 28": "The Resurrection & Great Commission",
  "Mark 2": "The Son of Man Is Lord Also of the Sabbath",
  "Luke 4": "Jesus' Custom on the Sabbath & Nazareth Ministry",
  "Luke 15": "The Lost Sheep, Lost Coin, and Prodigal Son",
  "John 1": "In the Beginning Was the Word — The Word Made Flesh",
  "John 3": "Born Again & For God So Loved the World",
  "John 11": "I Am the Resurrection and the Life — Jesus Wept",
  "John 14": "Let Not Your Heart Be Troubled — I Will Come Again",
  "John 15": "I Am the True Vine",
  "John 17": "Christ's High Priestly Prayer",
  "Acts 2": "Pentecost & the Outpouring of the Holy Spirit",
  "Romans 3": "Justified Freely by His Grace Through Faith",
  "Romans 6": "Dead to Sin, Alive in Christ",
  "Romans 8": "No Condemnation & Life in the Spirit",
  "1 Corinthians 13": "The More Excellent Way of Love",
  "1 Corinthians 15": "The Resurrection of Christ and the Saints",
  "2 Corinthians 5": "New Creatures & Ambassadors for Christ",
  "2 Corinthians 12": "My Grace Is Sufficient for Thee",
  "Galatians 2": "Crucified With Christ — Justification by Faith",
  "Galatians 5": "Freedom in Christ & the Fruit of the Spirit",
  "Ephesians 2": "Saved by Grace Through Faith",
  "Ephesians 6": "The Whole Armour of God",
  "Philippians 2": "The Mind & Humility of Christ",
  "Philippians 4": "Rejoice in the Lord & Peace of God",
  "Colossians 1": "The Supremacy of Christ, Creator & Redeemer",
  "1 Thessalonians 4": "The Second Coming & Resurrection of the Dead in Christ",
  "2 Timothy 2": "Study to Shew Thyself Approved Unto God",
  "2 Timothy 3": "All Scripture Is Given by Inspiration of God",
  "Titus 2": "The Grace of God That Bringeth Salvation",
  "Hebrews 4": "A Sabbath Rest Remains for the People of God",
  "Hebrews 8": "Christ Our High Priest in the Heavenly Sanctuary",
  "Hebrews 9": "The Earthly & Heavenly Sanctuary Ministry",
  "Hebrews 11": "The Hall of Faith",
  "James 1": "Count It All Joy — Faith, Trials & Asking for Wisdom",
  "James 2": "Faith Without Works Is Dead & the Royal Law",
  "James 3": "Taming the Tongue & Wisdom from Above",
  "James 4": "Draw Nigh to God & Resist the Devil",
  "James 5": "Patience Until the Coming of the Lord & Prayer",
  "1 Peter 2": "A Chosen Generation & Royal Priesthood",
  "2 Peter 1": "A More Sure Word of Prophecy",
  "1 John 1": "Walking in the Light & Confession of Sin",
  "1 John 4": "God Is Love — Testing the Spirits",
  "Jude 1": "Contend Earnestly for the Faith Once Delivered",
  "Revelation 1": "The Revelation of Jesus Christ on Patmos",
  "Revelation 12": "The Great Controversy & the Remnant Church",
  "Revelation 13": "The Two Beasts & the Mark of the Beast",
  "Revelation 14": "The Three Angels' Messages & Harvest of the Earth",
  "Revelation 20": "The Millennium & Final Judgment",
  "Revelation 21": "A New Heaven and a New Earth",
  "Revelation 22": "The River of Life — Surely I Come Quickly"
};

export function getChapterPericope(bookName: string, chapter: number): string {
  const key = `${bookName} ${chapter}`;
  if (CHAPTER_PERICOPES[key]) return CHAPTER_PERICOPES[key];
  const book = BIBLE_METADATA.find(b => b.name.toLowerCase() === bookName.toLowerCase());
  const verses = book?.chapters[chapter - 1];
  return verses ? `${bookName} Chapter ${chapter} (${verses} verses)` : `${bookName} Chapter ${chapter}`;
}

export interface ScriptureAutocompleteState {
  topBook: BookMetadata | null;
  matchingBooks: BookMetadata[];
  ghostSuffix: string;
  suggestedFullRef: string;
  pericope: string;
  chapterInfo: {
    book: string;
    chapter: number;
    maxChapter: number;
    maxVerse: number;
    startVerse?: number;
    hasTrailingHyphen: boolean;
  } | null;
}

/**
 * Provides Logos-style progressive book pre-fill, clean book-only suggestions,
 * pericope heading preview, and end-of-chapter verse count helper on hyphen (-).
 */
export function getScriptureAutocomplete(rawInput: string): ScriptureAutocompleteState {
  const trimmedStart = (rawInput || "").trimStart();
  if (!trimmedStart) {
    return {
      topBook: null,
      matchingBooks: [],
      ghostSuffix: "",
      suggestedFullRef: "",
      pericope: "",
      chapterInfo: null
    };
  }

  const normalized = trimmedStart
    .replace(/^III\s+/i, "3 ")
    .replace(/^II\s+/i, "2 ")
    .replace(/^I\s+/i, "1 ")
    .replace(/^3rd\s+/i, "3 ")
    .replace(/^2nd\s+/i, "2 ")
    .replace(/^1st\s+/i, "1 ");

  const hasTrailingHyphen = /[-–—]\s*$/.test(normalized);
  const partsMatch = normalized.match(/^([1-3]?\s*[A-Za-z][A-Za-z\s.]*?)(?:\s+(\d+)(?:[\s:.]+(\d+)(?:\s*[-–—]\s*(\d+)?)?)?)?\s*$/i);

  const bookQueryRaw = (partsMatch ? partsMatch[1] : normalized).trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  const bookQueryCompact = bookQueryRaw.replace(/\s+/g, "");
  const chapterRaw = partsMatch?.[2];
  const startVerseRaw = partsMatch?.[3];

  // Filter canonical Bible books cleanly (prefix match first, then alias match)
  const prefixMatches = BIBLE_METADATA.filter(b => {
    const bLow = b.name.toLowerCase();
    return bLow.startsWith(bookQueryRaw) || bLow.replace(/\s+/g, "").startsWith(bookQueryCompact);
  });

  const aliasMatches = BIBLE_METADATA.filter(b => {
    if (prefixMatches.includes(b)) return false;
    return b.aliases.some(a => {
      const aLow = a.toLowerCase().replace(/\./g, "").trim();
      return aLow === bookQueryRaw || aLow.startsWith(bookQueryRaw) || aLow.replace(/\s+/g, "").startsWith(bookQueryCompact);
    });
  });

  const matchingBooks = [...prefixMatches, ...aliasMatches].slice(0, 10);
  const topBook = matchingBooks[0] || null;

  if (!topBook) {
    return {
      topBook: null,
      matchingBooks: [],
      ghostSuffix: "",
      suggestedFullRef: "",
      pericope: "",
      chapterInfo: null
    };
  }

  // Case 1: User typed book + chapter (and optionally verse / trailing hyphen)
  if (chapterRaw) {
    const chNum = Math.min(Math.max(1, parseInt(chapterRaw, 10)), topBook.chapters.length);
    const maxVerse = topBook.chapters[chNum - 1] || 30;
    const startV = startVerseRaw ? Math.min(maxVerse, Math.max(1, parseInt(startVerseRaw, 10))) : undefined;
    const pericope = getChapterPericope(topBook.name, chNum);

    // If user typed a trailing hyphen (e.g. "James 1 2-"), ghost-complete the last verse of the chapter!
    const ghostSuffix = hasTrailingHyphen ? String(maxVerse) : "";
    const suggestedFullRef = hasTrailingHyphen && startV
      ? `${topBook.name} ${chNum}:${startV}-${maxVerse}`
      : startV
        ? `${topBook.name} ${chNum}:${startV}`
        : `${topBook.name} ${chNum}`;

    return {
      topBook,
      matchingBooks: matchingBooks.slice(0, 5),
      ghostSuffix,
      suggestedFullRef,
      pericope,
      chapterInfo: {
        book: topBook.name,
        chapter: chNum,
        maxChapter: topBook.chapters.length,
        maxVerse,
        startVerse: startV,
        hasTrailingHyphen
      }
    };
  }

  // Case 2: User is typing a book name prefix (e.g. "J" -> "Joshua", "Ja" -> "James")
  const rawBookTyped = trimmedStart;
  const topBookName = topBook.name;
  let ghostSuffix = "";
  if (topBookName.toLowerCase().startsWith(rawBookTyped.toLowerCase())) {
    ghostSuffix = topBookName.slice(rawBookTyped.length);
  }

  return {
    topBook,
    matchingBooks,
    ghostSuffix,
    suggestedFullRef: `${topBook.name} 1`,
    pericope: getChapterPericope(topBook.name, 1),
    chapterInfo: {
      book: topBook.name,
      chapter: 1,
      maxChapter: topBook.chapters.length,
      maxVerse: topBook.chapters[0] || 30,
      hasTrailingHyphen: false
    }
  };
}
