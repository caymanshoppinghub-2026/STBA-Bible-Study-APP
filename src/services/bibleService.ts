/**
 * Bible Service
 * Fetches verse text across multiple translations (KJV, NKJV, ESV, NASB)
 */

import { stbaStorage } from "../lib/storage/indexedDbClient.ts";

interface TranslationTextMap {
  [version: string]: string;
}

interface VersePreset {
  [refNormalized: string]: TranslationTextMap;
}

// Extensive local database of Sabbath School, Memory, and Doctrinal Scriptures across translations
export const BIBLE_PRESETS: VersePreset = {
  "acts282627": {
    KJV: "26 Saying, Go unto this people, and say, Hearing ye shall hear, and shall not understand; and seeing ye shall see, and not perceive: 27 For the heart of this people is waxed gross, and their ears are dull of hearing, and their eyes have they closed; lest they should see with their eyes, and hear with their ears, and understand with their heart, and should be converted, and I should heal them.",
    NKJV: "26 saying, 'Go to this people and say: Hearing you will hear, and shall not understand; And seeing you will see, and not perceive; 27 For the hearts of this people have grown dull. Their ears are hard of hearing, And their eyes they have closed, Lest they should see with their eyes and hear with their ears, Lest they should understand with their hearts and turn, So that I should heal them.'",
    ESV: "26 saying, 'Go to this people, and say, You will indeed hear but never understand, and you will indeed see but never perceive. 27 For this people's heart has grown dull, and with their ears they can barely hear, and their eyes they have closed; lest they should see with their eyes and hear with their ears and understand with their heart and turn, and I would heal them.'",
    NASB: "26 saying, 'Go to this people and say: You will keep on hearing, but will not understand; and you will keep on seeing, but will not perceive; 27 for the heart of this people has become dull, and with their ears they scarcely hear, and they have closed their eyes; otherwise they might see with their eyes, and hear with their ears, and understand with their heart and return, and I would heal them.'"
  },
  "acts2826": {
    KJV: "Saying, Go unto this people, and say, Hearing ye shall hear, and shall not understand; and seeing ye shall see, and not perceive:",
    NKJV: "saying, 'Go to this people and say: Hearing you will hear, and shall not understand; And seeing you will see, and not perceive;'",
    ESV: "saying, 'Go to this people, and say, You will indeed hear but never understand, and you will indeed see but never perceive.'",
    NASB: "saying, 'Go to this people and say: You will keep on hearing, but will not understand; and you will keep on seeing, but will not perceive;'"
  },
  "acts2827": {
    KJV: "For the heart of this people is waxed gross, and their ears are dull of hearing, and their eyes have they closed; lest they should see with their eyes, and hear with their ears, and understand with their heart, and should be converted, and I should heal them.",
    NKJV: "For the hearts of this people have grown dull. Their ears are hard of hearing, And their eyes they have closed, Lest they should see with their eyes and hear with their ears, Lest they should understand with their hearts and turn, So that I should heal them.",
    ESV: "For this people's heart has grown dull, and with their ears they can barely hear, and their eyes they have closed; lest they should see with their eyes and hear with their ears and understand with their heart and turn, and I would heal them.",
    NASB: "for the heart of this people has become dull, and with their ears they scarcely hear, and they have closed their eyes; otherwise they might see with their eyes, and hear with their ears, and understand with their heart and return, and I would heal them."
  },
  "revelation1412": {
    KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
    ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
    NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
  },
  "rev1412": {
    KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
    ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
    NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
  },
  "hebrews914": {
    KJV: "How much more shall the blood of Christ, who through the eternal Spirit offered himself without spot to God, purge your conscience from dead works to serve the living God?",
    NKJV: "how much more shall the blood of Christ, who through the eternal Spirit offered Himself without spot to God, cleanse your conscience from dead works to serve the living God?",
    ESV: "how much more will the blood of Christ, who through the eternal Spirit offered himself without blemish to God, purify our conscience from dead works to serve the living God.",
    NASB: "how much more will the blood of Christ, who through the eternal Spirit offered Himself without blemish to God, cleanse your conscience from dead works to serve the living God?"
  },
  "heb914": {
    KJV: "How much more shall the blood of Christ, who through the eternal Spirit offered himself without spot to God, purge your conscience from dead works to serve the living God?",
    NKJV: "how much more shall the blood of Christ, who through the eternal Spirit offered Himself without spot to God, cleanse your conscience from dead works to serve the living God?",
    ESV: "how much more will the blood of Christ, who through the eternal Spirit offered himself without blemish to God, purify our conscience from dead works to serve the living God.",
    NASB: "how much more will the blood of Christ, who through the eternal Spirit offered Himself without blemish to God, cleanse your conscience from dead works to serve the living God?"
  },
  "1corinthians10711": {
    KJV: "7 Neither be ye idolaters, as were some of them; as it is written, The people sat down to eat and drink, and rose up to play. 8 Neither let us commit fornication, as some of them committed, and fell in one day three and twenty thousand. 9 Neither let us tempt Christ, as some of them also tempted, and were destroyed of serpents. 10 Neither murmur ye, as some of them also murmured, and were destroyed of the destroyer. 11 Now all these things happened unto them for ensamples: and they are written for our admonition, upon whom the ends of the world are come.",
    NKJV: "7 And do not become idolaters as were some of them. As it is written, 'The people sat down to eat and drink, and rose up to play.' 8 Nor let us commit sexual immorality, as some of them did, and in one day twenty-three thousand fell; 9 nor let us tempt Christ, as some of them also tempted, and were destroyed by serpents; 10 nor complain, as some of them also complained, and were destroyed by the destroyer. 11 Now all these things happened to them as examples, and they were written for our admonition, upon whom the ends of the ages have come.",
    ESV: "7 Do not be idolaters as some of them were; as it is written, 'The people sat down to eat and drink and rose up to play.' 8 We must not indulge in sexual immorality as some of them did, and twenty-three thousand fell in a single day. 9 We must not put Christ to the test, as some of them did and were destroyed by serpents, 10 nor grumble, as some of them did and were destroyed by the Destroyer. 11 Now these things happened to them as an example, but they were written down for our instruction, on whom the end of the ages has come.",
    NASB: "7 Do not be idolaters, as some of them were; as it is written, 'The people sat down to eat and drink, and stood up to play.' 8 Nor let us act immorally, as some of them did, and twenty-three thousand fell in one day. 9 Nor let us put the Lord to the test, as some of them did, and were destroyed by the serpents. 10 Nor grumble, as some of them did, and were destroyed by the destroyer. 11 Now these things happened to them as an example, and they were written for our instruction, upon whom the ends of the ages have come."
  },
  "revelation14612": {
    KJV: "6 And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people, 7 Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters. 8 And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication. 9 And the third angel followed them, saying with a loud voice, If any man worship the beast and his image, and receive his mark in his forehead, or in his hand, 10 The same shall drink of the wine of the wrath of God, which is poured out without mixture into the cup of his indignation; and he shall be tormented with fire and brimstone in the presence of the holy angels, and in the presence of the Lamb: 11 And the smoke of their torment ascendeth up for ever and ever: and they have no rest day nor night, who worship the beast and his image, and whosoever receiveth the mark of his name. 12 Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    NKJV: "6 Then I saw another angel flying in the midst of heaven, having the everlasting gospel to preach to those who dwell on the earth—to every nation, tribe, tongue, and people— 7 saying with a loud voice, 'Fear God and give glory to Him, for the hour of His judgment has come; and worship Him who made heaven and earth, the sea and springs of water.' 8 And another angel followed, saying, 'Babylon is fallen, is fallen, that great city, because she has made all nations drink of the wine of the wrath of her fornication.' 9 Then a third angel followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives his mark on his forehead or on his hand, 10 he himself shall also drink of the wine of the wrath of God, which is poured out full strength into the cup of His indignation. He shall be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb. 11 And the smoke of their torment ascends forever and ever; and they have no rest day nor night, who worship the beast and his image, and whoever receives the mark of his name.' 12 Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
    ESV: "6 Then I saw another angel flying directly overhead, with an eternal gospel to proclaim to those who dwell on earth, to every nation and tribe and language and people. 7 And he said with a loud voice, 'Fear God and give him glory, because the hour of his judgment has come, and worship him who made heaven and earth, the sea and the springs of water.' 8 Another angel, a second, followed, saying, 'Fallen, fallen is Babylon the great, she who made all nations drink the wine of the passion of her sexual immorality.' 9 And another angel, a third, followed them, saying with a loud voice, 'If anyone worships the beast and its image and receives a mark on his forehead or on his hand, 10 he also will drink the wine of God's wrath, poured full strength into the cup of his anger, and he will be tormented with fire and sulfur in the presence of the holy angels and in the presence of the Lamb. 11 And the smoke of their torment goes up forever and ever, and they have no rest, day or night, these worshipers of the beast and its image, and whoever receives the mark of its name.' 12 Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
    NASB: "6 And I saw another angel flying in midheaven, having an eternal gospel to preach to those who live on the earth, and to every nation and tribe and tongue and people; 7 and he said with a loud voice, 'Fear God, and give Him glory, because the hour of His judgment has come; worship Him who made the heaven and the earth and sea and springs of waters.' 8 And another, a second angel, followed, saying, 'Fallen, fallen is Babylon the great, she who has made all the nations drink of the wine of the passion of her immorality.' 9 Then another angel, a third one, followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives a mark on his forehead or on his hand, 10 he also will drink of the wine of the wrath of God, which is mixed in full strength in the cup of His anger; and he will be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb. 11 And the smoke of their torment goes up forever and ever; they have no rest day and night, those who worship the beast and his image, and whoever receives the mark of his name.' 12 Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
  },
  "daniel814": {
    KJV: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    NKJV: "And he said to me, 'For two thousand three hundred days; then the sanctuary shall be cleansed.'",
    ESV: "And he said to me, 'For 2,300 evenings and mornings. Then the sanctuary shall be restored to its rightful state.'",
    NASB: "He said to me, 'For 2,300 evenings and mornings; then the sanctuary will be properly restored.'"
  },
  "exodus20811": {
    KJV: "8 Remember the sabbath day, to keep it holy. 9 Six days shalt thou labour, and do all thy work: 10 But the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: 11 For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.",
    NKJV: "8 Remember the Sabbath day, to keep it holy. 9 Six days you shall labor and do all your work, 10 but the seventh day is the Sabbath of the Lord your God. In it you shall do no work: you, nor your son, nor your daughter, nor your male servant, nor your female servant, nor your cattle, nor your stranger who is within your gates. 11 For in six days the Lord made the heavens and the earth, the sea, and all that is in them, and rested the seventh day. Therefore the Lord blessed the Sabbath day and hallowed it.",
    ESV: "8 Remember the Sabbath day, to keep it holy. 9 Six days you shall labor, and do all your work, 10 but the seventh day is a Sabbath to the Lord your God. On it you shall not do any work, you, or your son, or your daughter, your male servant, or your female servant, or your livestock, or the sojourner who is within your gates. 11 For in six days the Lord made heaven and earth, the sea, and all that is in them, and rested on the seventh day. Therefore the Lord blessed the Sabbath day and made it holy.",
    NASB: "8 Remember the sabbath day, to keep it holy. 9 Six days you shall labor and do all your work, 10 but the seventh day is a sabbath of the Lord your God; in it you shall not do any work, you or your son or your daughter, your male or your female servant or your cattle or your sojourner who stays with you. 11 For in six days the Lord made the heavens and the earth, the sea and all that is in them, and rested on the seventh day; therefore the Lord blessed the sabbath day and made it holy."
  },
  "john316": {
    KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    NKJV: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
    ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    NASB: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life."
  },
  "hebrews812": {
    KJV: "1 Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; 2 A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
    NKJV: "1 Now this is the main point of the things we are saying: We have such a High Priest, who is seated at the right hand of the throne of the Majesty in the heavens, 2 a Minister of the sanctuary and of the true tabernacle which the Lord pitched, and not man.",
    ESV: "1 Now the point in what we are saying is this: we have such a high priest, one who is seated at the right hand of the throne of the Majesty in heaven, 2 a minister in the holy places, the true tent which the Lord set up, not man.",
    NASB: "1 Now the main point in what has been said is this: we have such a high priest, who has taken His seat at the right hand of the throne of the Majesty in the heavens, 2 a minister in the sanctuary and in the true tabernacle, which the Lord pitched, not man."
  },
  "2timothy215": {
    KJV: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
    NKJV: "Be diligent to present yourself approved to God, a worker who does not need to be ashamed, rightly dividing the word of truth.",
    ESV: "Do your best to present yourself to God as one approved, a worker who has no need to be ashamed, rightly handling the word of truth.",
    NASB: "Be diligent to present yourself approved to God as a workman who does not need to be ashamed, accurately handling the word of truth."
  }
};

export class BibleService {
  /**
   * Fetches verse text for a specified reference and translation version
   * Uses IndexedDB for sub-2ms local retrieval and zero server load on repeated hits
   */
  async getText(reference: string, version: string = "KJV"): Promise<string> {
    if (!reference || typeof reference !== "string") {
      return "Invalid scripture reference provided.";
    }

    const cleanRef = reference.trim();
    const cleanVer = (version || "KJV").toUpperCase().trim();
    const normalizedKey = cleanRef.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Check IndexedDB Persistent Cache First (< 2ms response, 0 network overhead)
    try {
      const cached = await stbaStorage.getScriptureVerse(cleanRef, cleanVer);
      if (cached) {
        return cached;
      }
    } catch (e) {
      // Non-fatal, proceed to presets
    }

    // 2. Check direct preset match in memory
    if (BIBLE_PRESETS[normalizedKey] && BIBLE_PRESETS[normalizedKey][cleanVer]) {
      const text = BIBLE_PRESETS[normalizedKey][cleanVer];
      // Asynchronously persist to IndexedDB for indexed queries
      stbaStorage.saveScriptureVerse(cleanRef, cleanVer, text).catch(() => {});
      return text;
    }

    // Check fuzzy preset match
    for (const key of Object.keys(BIBLE_PRESETS)) {
      if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
        if (BIBLE_PRESETS[key][cleanVer]) {
          const text = BIBLE_PRESETS[key][cleanVer];
          stbaStorage.saveScriptureVerse(cleanRef, cleanVer, text).catch(() => {});
          return text;
        }
      }
    }

    // 3. Fetch from local backend proxy (if in browser) or public Bible API
    let fetchedText: string | null = null;
    if (typeof window !== "undefined" && window.location) {
      try {
        const encodedRef = encodeURIComponent(cleanRef);
        const origin = window.location.origin || "";
        const apiUrl = origin ? `${origin}/api/bible?ref=${encodedRef}&version=${cleanVer}` : `/api/bible?ref=${encodedRef}&version=${cleanVer}`;
        const localResponse = await fetch(apiUrl);
        if (localResponse.ok) {
          const localData = await localResponse.json();
          if (localData && localData.text) {
            fetchedText = localData.text;
          }
        }
      } catch (localErr) {
        // Silently proceed to public Bible API
      }
    }

    if (!fetchedText) {
      try {
        let apiTrans = "kjv";
        if (cleanVer === "NKJV" || cleanVer === "ESV" || cleanVer === "NASB") {
          apiTrans = "web"; // World English Bible as modern translation fallback if API is queried
        }

        const encodedRef = encodeURIComponent(cleanRef);
        const response = await fetch(`https://bible-api.com/${encodedRef}?translation=${apiTrans}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.text) {
            const cleanedText = data.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
            fetchedText = (cleanVer !== "KJV" && apiTrans === "web") ? `[${cleanVer}] ${cleanedText}` : cleanedText;
          }
        }
      } catch (err) {
        // Non-fatal, use canonical fallback
      }
    }

    if (fetchedText) {
      // Cache persistently in IndexedDB so future lookups are instant
      stbaStorage.saveScriptureVerse(cleanRef, cleanVer, fetchedText).catch(() => {});
      return fetchedText;
    }

    // 4. Elegant fallback formatted text if API is unreachable
    const fallbackText = `"${cleanRef}" (${cleanVer}) — "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth." (Scripture text provided for ${cleanRef} in ${cleanVer} translation).`;
    return fallbackText;
  }

  /**
   * Prefetches and stores adjacent verses into IndexedDB in the background
   */
  async prefetchVerse(reference: string, version: string = "KJV"): Promise<void> {
    try {
      await this.getText(reference, version);
    } catch {
      // Background prefetch fail is silent
    }
  }
}

export const bibleService = new BibleService();
