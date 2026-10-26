const fs = require("fs");
const path = require("path");

const rawFilePath = path.join(process.cwd(), "data", "sda-commentary-imports", "exodus_extracted_text.txt");
let rawText = fs.readFileSync(rawFilePath, "utf8");

// 1. Normalize line endings and chapter boundaries
rawText = rawText.replace(/\r/g, "");
rawText = rawText.replace(/([0-9A-Za-z.,])CHAPTER\s*(\d+)/g, "$1\nCHAPTER $2");
rawText = rawText.replace(/CHAPTER\s*(\d{1,2})(\d)\s+([A-Z])/g, "CHAPTER $1\n$2 $3");

// 2. Extract Introduction
const ch1Match = rawText.match(/(?:^|\n)\s*CHAPTER\s+1\b/i);
const introEnd = ch1Match ? ch1Match.index : rawText.indexOf("CHAPTER 1");
const introText = rawText.substring(0, introEnd).trim();

// Parse Introduction Sections
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

// 3. Locate all 40 chapters
const chapterIndices = [];
for (let ch = 1; ch <= 40; ch++) {
  const r = new RegExp("(?:^|\\n)\\s*CHAPTER\\s+" + ch + "(?:\\s+|\\n|$)", "i");
  const m = rawText.search(r);
  if (m !== -1) {
    chapterIndices.push({ chapter: ch, index: m });
  } else {
    console.warn(`Warning: Could not find CHAPTER ${ch}`);
  }
}

chapterIndices.sort((a, b) => a.index - b.index);
console.log(`Found ${chapterIndices.length} chapters.`);

const chaptersData = {};

for (let i = 0; i < chapterIndices.length; i++) {
  const current = chapterIndices[i];
  const next = chapterIndices[i + 1];
  const chapNum = current.chapter;
  const startIdx = current.index;
  const endIdx = next ? next.index : rawText.length;
  let rawChapterContent = rawText.substring(startIdx, endIdx).trim();

  // Find ELLEN G. WHITE COMMENTS section if exists
  const egwIdx = rawChapterContent.indexOf("ELLEN G. WHITE COMMENTS");
  let mainContent = rawChapterContent;
  let egwRaw = "";
  if (egwIdx !== -1) {
    mainContent = rawChapterContent.substring(0, egwIdx).trim();
    // Check if there are trailing citations like "Nichol, F. D." at the end of the chapter
    let egwBody = rawChapterContent.substring(egwIdx + "ELLEN G. WHITE COMMENTS".length).trim();
    const nicholIdx = egwBody.search(/\n\d*\s*Nichol,\s*F\.\s*D\./i);
    if (nicholIdx !== -1) {
      egwRaw = egwBody.substring(0, nicholIdx).trim();
    } else {
      egwRaw = egwBody;
    }
  }

  // Normalize verse headwords so each starts on a new line
  mainContent = mainContent.replace(/([a-z0-9.?!)])(\d+)\.\s+([A-Z“"'])/g, "$1\n$2. $3");

  // Remove the "CHAPTER X" header line
  const lines = mainContent.split("\n");
  let contentStartIndex = 1;
  while (contentStartIndex < lines.length && !lines[contentStartIndex].trim()) {
    contentStartIndex++;
  }

  // First paragraph is chapter summary
  let summary = "";
  let bodyStartIndex = contentStartIndex;
  if (lines[contentStartIndex]) {
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
    if (firstPeriod !== -1 && firstPeriod < 140) {
      headwords = `${vNum}. ${fullVerseText.substring(0, firstPeriod + 1)}`;
      commentary = fullVerseText.substring(firstPeriod + 2).trim();
    } else {
      headwords = `${vNum}. ${fullVerseText.substring(0, 60)}...`;
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
      if (m && m[2].trim().length > 0) {
        const verseRef = m[1].trim();
        const citations = m[2].trim();
        egwEntries.push({
          verseRef: `Ex. ${chapNum}:${verseRef}`,
          citations: citations
        });
      } else if (line.length > 0) {
        egwEntries.push({
          verseRef: `Ex. ${chapNum}`,
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

console.log("Parsed all Exodus chapters:", Object.keys(chaptersData).length);
console.log("Chapter 1 summary:", chaptersData[1].summary.substring(0, 80));
console.log("Chapter 1 verses:", chaptersData[1].verseCount);
console.log("Chapter 20 verses:", chaptersData[20].verseCount);
console.log("Chapter 20 EGW count:", chaptersData[20].egwEntries.length);
console.log("Chapter 40 summary:", chaptersData[40].summary.substring(0, 80));
console.log("Chapter 40 verses:", chaptersData[40].verseCount);

// Save structured JSON
const finalOutput = {
  sourceDocument: "The Second Book of Moses Called EXODUS.docx",
  supabaseBucket: "sda-commentary-imports",
  extractedAt: new Date().toISOString(),
  overview: bookOverview,
  chapters: chaptersData
};

const outputDir = path.join(process.cwd(), "data", "sda-commentary-imports");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, "exodus_commentary_parsed.json"),
  JSON.stringify(finalOutput, null, 2)
);

console.log("Successfully saved data/sda-commentary-imports/exodus_commentary_parsed.json");
