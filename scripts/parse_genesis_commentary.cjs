const fs = require("fs");
const path = require("path");

const rawText = fs.readFileSync("./data/extracted_docx_text.txt", "utf8");

// 1. Extract Introduction
const introEnd = rawText.indexOf("CHAPTER 1");
const introText = rawText.substring(0, introEnd).trim();

// Book Overview Sections
const titleMatch = introText.match(/1\.\s+Title\.\s+([\s\S]*?)(?=2\.\s+Authorship)/i);
const authorshipMatch = introText.match(/2\.\s+Authorship\.\s+([\s\S]*?)(?=3\.\s+Historical Setting)/i);
const histSettingMatch = introText.match(/3\.\s+Historical Setting\.\s+([\s\S]*?)(?=4\.\s+Theme)/i);
const themeMatch = introText.match(/4\.\s+Theme\.\s+([\s\S]*?)(?=5\.\s+Outline)/i);
const outlineMatch = introText.match(/5\.\s+Outline\.\s+([\s\S]*)$/i);

const bookOverview = {
  title: titleMatch ? titleMatch[1].trim() : "",
  authorship: authorshipMatch ? authorshipMatch[1].trim() : "",
  historicalSetting: histSettingMatch ? histSettingMatch[1].trim() : "",
  theme: themeMatch ? themeMatch[1].trim() : "",
  outline: outlineMatch ? outlineMatch[1].trim() : "",
  fullIntro: introText
};

// 2. Map all 50 chapters
const chapterPattern = /(?:^|\n|\[|\d|;)\s*CHAPTER\s+(\d+)\b/gi;
const chapterIndices = [];
let m;
while ((m = chapterPattern.exec(rawText)) !== null) {
  chapterIndices.push({
    chapter: parseInt(m[1], 10),
    index: m.index + (m[0].indexOf("CHAPTER"))
  });
}

const uniqueChapters = [];
const seen = new Set();
for (const ci of chapterIndices) {
  if (!seen.has(ci.chapter) && ci.chapter >= 1 && ci.chapter <= 50) {
    seen.add(ci.chapter);
    uniqueChapters.push(ci);
  }
}
uniqueChapters.sort((a, b) => a.chapter - b.chapter);

const chaptersData = {};

for (let i = 0; i < uniqueChapters.length; i++) {
  const current = uniqueChapters[i];
  const next = uniqueChapters[i + 1];
  const chapNum = current.chapter;
  const startIdx = current.index;
  const endIdx = next ? next.index : rawText.length;
  const rawChapterContent = rawText.substring(startIdx, endIdx).trim();

  // Find ELLEN G. WHITE COMMENTS section if exists
  const egwIdx = rawChapterContent.indexOf("ELLEN G. WHITE COMMENTS");
  let mainContent = rawChapterContent;
  let egwRaw = "";
  if (egwIdx !== -1) {
    mainContent = rawChapterContent.substring(0, egwIdx).trim();
    egwRaw = rawChapterContent.substring(egwIdx + "ELLEN G. WHITE COMMENTS".length).trim();
  }

  // Normalize verse headwords so each starts on a new line
  mainContent = mainContent.replace(/([a-z0-9.?!)])(\d+)\.\s+([A-Z“"'])/g, "$1\n$2. $3");

  // Remove the "CHAPTER X" header line
  const lines = mainContent.split("\n");
  let contentStartIndex = 1;
  while (contentStartIndex < lines.length && !lines[contentStartIndex].trim()) {
    contentStartIndex++;
  }

  // First paragraph is typically chapter summary (e.g., "1 The creation of heaven and earth...")
  let summary = "";
  let bodyStartIndex = contentStartIndex;
  if (lines[contentStartIndex]) {
    // If the line contains a verse marker like "1. In the beginning", split it
    const lineStr = lines[contentStartIndex].trim();
    const vMatch = lineStr.match(/(\d+)\.\s+([A-Z“"'].*)/);
    if (vMatch && vMatch.index > 0) {
      summary = lineStr.substring(0, vMatch.index).trim();
      lines[contentStartIndex] = lineStr.substring(vMatch.index).trim();
      bodyStartIndex = contentStartIndex;
    } else if (!vMatch) {
      summary = lineStr;
      bodyStartIndex = contentStartIndex + 1;
    }
  }

  // Parse Verse Notes
  const bodyText = lines.slice(bodyStartIndex).join("\n");
  
  const verseMatches = [];
  const versePattern = /(?:^|\n)(\d+)\.\s+([A-Z“"'].*?)(?=(?:\n\d+\.\s+[A-Z“"'])|$)/gs;
  let vm;
  while ((vm = versePattern.exec(bodyText)) !== null) {
    const vNum = parseInt(vm[1], 10);
    const fullVerseText = vm[2].trim();
    
    const firstPeriod = fullVerseText.indexOf(". ");
    let headwords = "";
    let commentary = fullVerseText;
    if (firstPeriod !== -1 && firstPeriod < 120) {
      headwords = `${vNum}. ${fullVerseText.substring(0, firstPeriod + 1)}`;
      commentary = fullVerseText.substring(firstPeriod + 2).trim();
    } else {
      headwords = `${vNum}. ${fullVerseText.substring(0, 50)}...`;
    }

    verseMatches.push({
      verseNumber: vNum,
      headwords,
      commentaryText: commentary
    });
  }

  // Parse Ellen G. White comments for this chapter
  const egwEntries = [];
  if (egwRaw) {
    const egwLines = egwRaw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    for (const line of egwLines) {
      const m = line.match(/^([0-9,\-\s]+)\s*(.*)$/);
      if (m) {
        const verseRef = m[1].trim();
        const citations = m[2].trim();
        if (citations) {
          egwEntries.push({
            verseRef: `Gen. ${chapNum}:${verseRef}`,
            citations: citations
          });
        }
      } else {
        egwEntries.push({
          verseRef: `Gen. ${chapNum}`,
          citations: line
        });
      }
    }
  }

  chaptersData[chapNum] = {
    chapter: chapNum,
    summary,
    verseCount: verseMatches.length,
    verses: verseMatches,
    egwRaw,
    egwEntries
  };
}

console.log("Parsed all chapters:", Object.keys(chaptersData).length);
console.log("Chapter 1 summary:", chaptersData[1].summary.substring(0, 100));
console.log("Chapter 1 verse count:", chaptersData[1].verseCount);
console.log("Chapter 1 EGW entries count:", chaptersData[1].egwEntries.length);

// Save structured JSON
const finalOutput = {
  sourceDocument: "Genesis Book Overview & Commentary.docx",
  supabaseBucket: "sda-commentary-imports",
  extractedAt: new Date().toISOString(),
  overview: bookOverview,
  chapters: chaptersData
};

fs.writeFileSync(
  "./data/sda-commentary-imports/genesis_commentary_parsed.json",
  JSON.stringify(finalOutput, null, 2)
);

console.log("Successfully saved ./data/sda-commentary-imports/genesis_commentary_parsed.json");
