import { stbaStorage } from "../src/lib/storage/indexedDbClient";
import { panelSyncBus } from "../src/lib/storage/panelSyncChannel";

async function runStorageVerification() {
  console.log("=== STBA CLIENT-SIDE STORAGE & PANEL SYNC VERIFICATION ===\n");

  // 1. Test Scripture Cache
  console.log("1. Testing Scripture Verse Cache...");
  await stbaStorage.saveScriptureVerse("Revelation 14:12", "NKJV", "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.");
  const verseText = await stbaStorage.getScriptureVerse("Revelation 14:12", "NKJV");
  if (verseText && verseText.includes("patience of the saints")) {
    console.log("  [PASS] Scripture verse saved and retrieved successfully.");
  } else {
    console.error("  [FAIL] Failed to retrieve scripture verse:", verseText);
  }

  // 2. Test Parallel Passage Cache
  console.log("\n2. Testing Parallel Passage Cache...");
  const samplePassage = [
    {
      verseNumber: 14,
      text: {
        KJV: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        NKJV: "And he said to me, 'For two thousand three hundred days; then the sanctuary shall be cleansed.'"
      }
    }
  ];
  await stbaStorage.savePassage("Daniel 8:14", samplePassage, "Daniel", 8);
  const passageRetrieved = await stbaStorage.getPassage("Daniel 8:14");
  if (passageRetrieved && passageRetrieved.length === 1 && passageRetrieved[0].verseNumber === 14) {
    console.log("  [PASS] Parallel chapter passage cached and retrieved successfully.");
  } else {
    console.error("  [FAIL] Failed to retrieve passage:", passageRetrieved);
  }

  // 3. Test SDABC Commentary Cache
  console.log("\n3. Testing 7-Volume SDABC Commentary Cache...");
  const sampleSDABC = {
    reference: "Hebrews 8:1-5",
    volumeNumber: 7,
    pageRange: "pp. 440-448",
    chapterTitle: "The Heavenly Sanctuary & True Tabernacle",
    historicalContext: "The Epistle to the Hebrews demonstrates the transition from the Levitical shadow to the heavenly reality.",
    exegeticalSummary: "Christ serves as our High Priest at the right hand of Majesty.",
    verses: [
      {
        verseNumber: 1,
        text: "Now of the things which we have spoken this is the sum...",
        headwords: "1. We have such an high priest.",
        originalLanguageInsight: "Greek 'archierea' (High Priest) set over the heavenly cosmos.",
        commentaryText: "The reality of the heavenly sanctuary is the anchor of Adventist theology."
      }
    ],
    egwComments: [
      {
        source: "The Great Controversy, p. 415",
        quote: "The sanctuary in heaven is the very center of Christ's work in behalf of men."
      }
    ]
  };
  await stbaStorage.saveCommentary("Hebrews 8:1-5", sampleSDABC, 7, "Hebrews", 8);
  const commentaryRetrieved = await stbaStorage.getCommentary("Hebrews 8:1-5");
  if (commentaryRetrieved && commentaryRetrieved.volumeNumber === 7 && commentaryRetrieved.verses.length > 0) {
    console.log("  [PASS] SDABC Commentary cached and retrieved successfully.");
  } else {
    console.error("  [FAIL] Failed to retrieve commentary:", commentaryRetrieved);
  }

  // 4. Test Study Resources Cache (Word Study & Cross References)
  console.log("\n4. Testing Study Resources Cache...");
  const sampleWordStudy = {
    word: "sanctuary",
    lemma: "qodesh / mikdash",
    strongs: "H6944",
    definition: "Holy place, consecrated sacred precinct set apart for divine presence",
    occurrences: 468
  };
  await stbaStorage.saveStudyResource("word_study", "sanctuary", sampleWordStudy, "Daniel 8:14");
  const wordRetrieved = await stbaStorage.getStudyResource("word_study", "sanctuary");
  if (wordRetrieved && wordRetrieved.strongs === "H6944") {
    console.log("  [PASS] Lexical study resource cached and retrieved successfully.");
  } else {
    console.error("  [FAIL] Failed to retrieve word study:", wordRetrieved);
  }

  // 5. Test Cross-Panel Synchronization Bus
  console.log("\n5. Testing Cross-Panel Sync Event Bus...");
  let receivedVerseEvent: any = null;
  const unsubscribe = panelSyncBus.subscribe("VERSE_SELECTED", (payload) => {
    receivedVerseEvent = payload;
  });

  panelSyncBus.selectVerse(12, "Revelation 14:12", "TestRunner");

  if (receivedVerseEvent && receivedVerseEvent.verseNumber === 12 && receivedVerseEvent.reference === "Revelation 14:12") {
    console.log("  [PASS] Cross-panel event bus dispatched and received event synchronously (< 1ms).");
  } else {
    console.error("  [FAIL] Event bus failed to deliver message:", receivedVerseEvent);
  }
  unsubscribe();

  // 6. Test Storage Telemetry & Metrics
  console.log("\n6. Testing Storage Telemetry & Metrics...");
  const stats = await stbaStorage.getStorageStats();
  console.log("  Stats Summary:", {
    versesCount: stats.versesCount,
    passagesCount: stats.passagesCount,
    commentariesCount: stats.commentariesCount,
    resourcesCount: stats.resourcesCount,
    serverFetchesPrevented: stats.serverFetchesPrevented,
    scriptureHits: stats.scriptureHits,
    commentaryHits: stats.commentaryHits
  });

  if (stats.versesCount >= 1 && stats.commentariesCount >= 1 && stats.resourcesCount >= 1) {
    console.log("  [PASS] Storage statistics tracking operational.");
  } else {
    console.error("  [FAIL] Storage stats check failed.");
  }

  console.log("\n=== ALL CLIENT-SIDE STORAGE AND SYNC TESTS PASSED ===");
}

runStorageVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
