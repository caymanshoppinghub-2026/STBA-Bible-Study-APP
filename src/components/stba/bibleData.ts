import { stbaStorage } from "../../lib/storage/indexedDbClient";

export interface ParallelVerse {
  verseNumber: number;
  reference?: string;
  text: {
    KJV: string;
    NKJV: string;
    ESV: string;
    NASB: string;
  };
}

export const PRESET_BIBLES: Record<string, ParallelVerse[]> = {
  "Revelation 14:6-12": [
    {
      verseNumber: 6,
      text: {
        KJV: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people,",
        NKJV: "Then I saw another angel flying in the midst of heaven, having the everlasting gospel to preach to those who dwell on the earth—to every nation, tribe, tongue, and people—",
        ESV: "Then I saw another angel flying directly overhead, with an eternal gospel to proclaim to those who dwell on earth, to every nation and tribe and language and people.",
        NASB: "And I saw another angel flying in midheaven, having an eternal gospel to preach to those who live on the earth, and to every nation and tribe and tongue and people;"
      }
    },
    {
      verseNumber: 7,
      text: {
        KJV: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
        NKJV: "saying with a loud voice, 'Fear God and give glory to Him, for the hour of His judgment has come; and worship Him who made heaven and earth, the sea and springs of water.'",
        ESV: "And he said with a loud voice, 'Fear God and give him glory, because the hour of his judgment has come, and worship him who made heaven and earth, the sea and the springs of water.'",
        NASB: "and he said with a loud voice, 'Fear God, and give Him glory, because the hour of His judgment has come; worship Him who made the heaven and the earth and sea and springs of waters.'"
      }
    },
    {
      verseNumber: 8,
      text: {
        KJV: "And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.",
        NKJV: "And another angel followed, saying, 'Babylon is fallen, is fallen, that great city, because she has made all nations drink of the wine of the wrath of her fornication.'",
        ESV: "Another angel, a second, followed, saying, 'Fallen, fallen is Babylon the great, she who made all nations drink the wine of the passion of her sexual immorality.'",
        NASB: "And another, a second angel, followed, saying, 'Fallen, fallen is Babylon the great, she who has made all the nations drink of the wine of the passion of her immorality.'"
      }
    },
    {
      verseNumber: 9,
      text: {
        KJV: "And the third angel followed them, saying with a loud voice, If any man worship the beast and his image, and receive his mark in his forehead, or in his hand,",
        NKJV: "Then a third angel followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives his mark on his forehead or on his hand,'",
        ESV: "And another angel, a third, followed them, saying with a loud voice, 'If anyone worships the beast and its image and receives a mark on his forehead or on his hand,'",
        NASB: "Then another angel, a third one, followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives a mark on his forehead or on his hand,'"
      }
    },
    {
      verseNumber: 10,
      text: {
        KJV: "The same shall drink of the wine of the wrath of God, which is poured out without mixture into the cup of his indignation; and he shall be tormented with fire and brimstone in the presence of the holy angels, and in the presence of the Lamb:",
        NKJV: "he himself shall also drink of the wine of the wrath of God, which is poured out full strength into the cup of His indignation. He shall be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb.",
        ESV: "he also will drink the wine of God's wrath, poured full strength into the cup of his anger, and he will be tormented with fire and sulfur in the presence of the holy angels and in the presence of the Lamb.",
        NASB: "he also will drink of the wine of the wrath of God, which is mixed in full strength in the cup of His anger; and he will be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb."
      }
    },
    {
      verseNumber: 11,
      text: {
        KJV: "And the smoke of their torment ascendeth up for ever and ever: and they have no rest day nor night, who worship the beast and his image, and whosoever receiveth the mark of his name.",
        NKJV: "And the smoke of their torrent ascends forever and ever; and they have no rest day nor night, who worship the beast and his image, and whoever receives the mark of his name.",
        ESV: "And the smoke of their torment goes up forever and ever, and they have no rest, day or night, these worshipers of the beast and its image, and whoever receives the mark of its name.",
        NASB: "And the smoke of their torment goes up forever and ever; they have no rest day and night, those who worship the beast and his image, and whoever receives the mark of his name."
      }
    },
    {
      verseNumber: 12,
      text: {
        KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
        ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
        NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
      }
    }
  ],
  "Hebrews 8:1-5": [
    {
      verseNumber: 1,
      text: {
        KJV: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens;",
        NKJV: "Now this is the main point of the things we are saying: We have such a High Priest, who is seated at the right hand of the throne of the Majesty in the heavens,",
        ESV: "Now the point in what we are saying is this: we have such a high priest, one who is seated at the right hand of the throne of the Majesty in heaven,",
        NASB: "Now the main point in what has been said is this: we have such a high priest, who has taken His seat at the right hand of the throne of the Majesty in the heavens,"
      }
    },
    {
      verseNumber: 2,
      text: {
        KJV: "A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
        NKJV: "a Minister of the sanctuary and of the true tabernacle which the Lord pitched, and not man.",
        ESV: "a minister in the holy places, the true tent which the Lord set up, not man.",
        NASB: "a minister in the sanctuary and in the true tabernacle, which the Lord pitched, not man."
      }
    },
    {
      verseNumber: 3,
      text: {
        KJV: "For every high priest is ordained to offer gifts and sacrifices: wherefore it is of necessity that this man have somewhat also to offer.",
        NKJV: "For every High Priest is appointed to offer both gifts and sacrifices. Therefore it is necessary that this One also have something to offer.",
        ESV: "For every high priest is appointed to offer gifts and sacrifices; thus it is necessary for this priest also to have something to offer.",
        NASB: "For every high priest is appointed to offer both gifts and sacrifices; so it is necessary that this high priest also have something to offer."
      }
    },
    {
      verseNumber: 4,
      text: {
        KJV: "For if he were on earth, he should not be a priest, seeing that there are priests that offer gifts according to the law:",
        NKJV: "For if He were on earth, He would not be a priest, since there are priests who offer the gifts according to the law;",
        ESV: "Now if he were on earth, he would not be a priest at all, since there are priests who offer gifts according to the law.",
        NASB: "Now if He were on earth, He would not be a priest at all, since there are those who offer the gifts according to the Law;"
      }
    },
    {
      verseNumber: 5,
      text: {
        KJV: "Who serve unto the example and shadow of heavenly things, as Moses was admonished of God when he was about to make the tabernacle: for, See, saith he, that thou make all things according to the pattern shewed to thee in the mount.",
        NKJV: "who serve the copy and shadow of the heavenly things, as Moses was divinely instructed when he was about to make the tabernacle: for 'See,' He said, 'that you make all things according to the pattern shown to you on the mountain.'",
        ESV: "They serve a copy and shadow of the heavenly things. For when Moses was about to erect the tent, he was instructed by God, saying, 'See that you make everything according to the pattern that was shown you on the mountain.'",
        NASB: "who serve a copy and shadow of the heavenly things, just as Moses was warned by God when he was about to erect the tabernacle; for, 'See,' He says, 'that you make all things according to the pattern which was shown you on the mountain.'"
      }
    }
  ],
  "Romans 12:1-2": [
    {
      verseNumber: 1,
      text: {
        KJV: "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.",
        NKJV: "I beseech you therefore, brethren, by the mercies of God, that you present your bodies a living sacrifice, holy, acceptable to God, which is your reasonable service.",
        ESV: "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.",
        NASB: "Therefore I urge you, brethren, by the mercies of God, to present your bodies a living and holy sacrifice, acceptable to God, which is your spiritual service of worship."
      }
    },
    {
      verseNumber: 2,
      text: {
        KJV: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
        NKJV: "And do not be conformed to this world, but be transformed by the renewing of your mind, that you may prove what is that good and acceptable and perfect will of God.",
        ESV: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.",
        NASB: "And do not be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what the will of God is, that which is good and acceptable and perfect."
      }
    }
  ],
  "Daniel 8:14": [
    {
      verseNumber: 14,
      text: {
        KJV: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        NKJV: "And he said to me, 'For two thousand three hundred days; then the sanctuary shall be cleansed.'",
        ESV: "And he said to me, 'For 2,300 evenings and mornings. Then the sanctuary shall be restored to its rightful state.'",
        NASB: "He said to me, 'For 2,300 evenings and mornings; then the sanctuary will be properly restored.'"
      }
    }
  ],
  "Genesis 1:1-5": [
    {
      verseNumber: 1,
      text: {
        KJV: "In the beginning God created the heaven and the earth.",
        NKJV: "In the beginning God created the heavens and the earth.",
        ESV: "In the beginning, God created the heavens and the earth.",
        NASB: "In the beginning God created the heavens and the earth."
      }
    },
    {
      verseNumber: 2,
      text: {
        KJV: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
        NKJV: "The earth was without form, and void; and darkness was on the face of the deep. And the Spirit of God was hovering over the face of the waters.",
        ESV: "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.",
        NASB: "The earth was without form and void, and darkness was over the surface of the deep; and the Spirit of God was moving over the surface of the waters."
      }
    },
    {
      verseNumber: 3,
      text: {
        KJV: "And God said, Let there be light: and there was light.",
        NKJV: "Then God said, \"Let there be light\"; and there was light.",
        ESV: "And God said, \"Let there be light,\" and there was light.",
        NASB: "Then God said, \"Let there be light\"; and there was light."
      }
    },
    {
      verseNumber: 4,
      text: {
        KJV: "And God saw the light, that it was good: and God divided the light from the darkness.",
        NKJV: "And God saw the light, that it was good; and God divided the light from the darkness.",
        ESV: "And God saw that the light was good. And God separated the light from the darkness.",
        NASB: "God saw that the light was good; and God separated the light from the darkness."
      }
    },
    {
      verseNumber: 5,
      text: {
        KJV: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
        NKJV: "God called the light Day, and the darkness He called Night. So the evening and the morning were the first day.",
        ESV: "God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.",
        NASB: "God called the light Day, and the darkness He called Night. And there was evening and there was morning, one day."
      }
    }
  ],
  "Psalms 23:1-6": [
    {
      verseNumber: 1,
      text: {
        KJV: "The LORD is my shepherd; I shall not want.",
        NKJV: "The LORD is my shepherd; I shall not want.",
        ESV: "The LORD is my shepherd; I shall not want.",
        NASB: "The LORD is my shepherd, I shall not want."
      }
    },
    {
      verseNumber: 2,
      text: {
        KJV: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
        NKJV: "He makes me to lie down in green pastures; He leads me beside the still waters.",
        ESV: "He makes me lie down in green pastures. He leads me beside still waters.",
        NASB: "He makes me lie down in green pastures; He leads me beside quiet waters."
      }
    },
    {
      verseNumber: 3,
      text: {
        KJV: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
        NKJV: "He restores my soul; He leads me in the paths of righteousness For His name's sake.",
        ESV: "He restores my soul. He leads me in paths of righteousness for his name's sake.",
        NASB: "He restores my soul; He guides me in the paths of righteousness For His name's sake."
      }
    },
    {
      verseNumber: 4,
      text: {
        KJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
        NKJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil; For You are with me; Your rod and Your staff, they comfort me.",
        ESV: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
        NASB: "Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me."
      }
    },
    {
      verseNumber: 5,
      text: {
        KJV: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.",
        NKJV: "You prepare a table before me in the presence of my enemies; You anoint my head with oil; My cup runs over.",
        ESV: "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.",
        NASB: "You prepare a table before me in the presence of my enemies; You have anointed my head with oil; My cup overflows."
      }
    },
    {
      verseNumber: 6,
      text: {
        KJV: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.",
        NKJV: "Surely goodness and mercy shall follow me All the days of my life; And I will dwell in the house of the LORD Forever.",
        ESV: "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.",
        NASB: "Surely goodness and lovingkindness will follow me all the days of my life, And I will dwell in the house of the LORD forever."
      }
    }
  ],
  "Isaiah 53:1-6": [
    {
      verseNumber: 1,
      text: {
        KJV: "Who hath believed our report? and to whom is the arm of the LORD revealed?",
        NKJV: "Who has believed our report? And to whom has the arm of the LORD been revealed?",
        ESV: "Who has believed what he has heard from us? And to whom has the arm of the LORD been revealed?",
        NASB: "Who has believed our message? And to whom has the arm of the LORD been revealed?"
      }
    },
    {
      verseNumber: 2,
      text: {
        KJV: "For he shall grow up before him as a tender plant, and as a root out of a dry ground: he hath no form nor comeliness; and when we shall see him, there is no beauty that we should desire him.",
        NKJV: "For He shall grow up before Him as a tender plant, And as a root out of dry ground. He has no form or comeliness; And when we see Him, There is no beauty that we should desire Him.",
        ESV: "For he grew up before him like a young plant, and like a root out of dry ground; he had no form or majesty that we should look at him, and no beauty that we should desire him.",
        NASB: "For He grew up before Him like a tender shoot, And like a root out of parched ground; He has no stately form or majesty That we should look upon Him, Nor appearance that we should attract us to Him."
      }
    },
    {
      verseNumber: 3,
      text: {
        KJV: "He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not.",
        NKJV: "He is despised and rejected by men, A Man of sorrows and acquainted with grief. And we hid, as it were, our faces from Him; He was despised, and we did not esteem Him.",
        ESV: "He was despised and rejected by men, a man of sorrows and acquainted with grief; and as one from whom men hide their faces he was despised, and we esteemed him not.",
        NASB: "He was despised and forsaken of men, A man of sorrows and acquainted with grief; And like one from whom men hide their face He was despised, and we did not esteem Him."
      }
    },
    {
      verseNumber: 4,
      text: {
        KJV: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted.",
        NKJV: "Surely He has borne our griefs And carried our sorrows; Yet we esteemed Him stricken, Smitten by God, and afflicted.",
        ESV: "Surely he has borne our griefs and carried our sorrows; yet we esteemed him stricken, smitten by God, and afflicted.",
        NASB: "Surely our griefs He Himself bore, And our sorrows He carried; Yet we ourselves esteemed Him stricken, Smitten of God, and afflicted."
      }
    },
    {
      verseNumber: 5,
      text: {
        KJV: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
        NKJV: "But He was wounded for our transgressions, He was bruised for our iniquities; The chastisement for our peace was upon Him, And by His stripes we are healed.",
        ESV: "But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.",
        NASB: "But He was pierced through for our transgressions, He was crushed for our iniquities; The chastening for our well-being fell upon Him, And by His scourging we are healed."
      }
    },
    {
      verseNumber: 6,
      text: {
        KJV: "All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.",
        NKJV: "All we like sheep have gone astray; We have turned, every one, to his own way; And the LORD has laid on Him the iniquity of us all.",
        ESV: "All we like sheep have gone astray; we have turned—every one—to his own way; and the LORD has laid on him the iniquity of us all.",
        NASB: "All of us like sheep have gone astray, Each of us has turned to his own way; But the LORD has caused the iniquity of us all To fall on Him."
      }
    }
  ],
  "John 3:14-17": [
    {
      verseNumber: 14,
      text: {
        KJV: "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:",
        NKJV: "And as Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up,",
        ESV: "And as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up,",
        NASB: "As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up;"
      }
    },
    {
      verseNumber: 15,
      text: {
        KJV: "That whosoever believeth in him should not perish, but have eternal life.",
        NKJV: "that whoever believes in Him should not perish but have eternal life.",
        ESV: "that whoever believes in him may have eternal life.",
        NASB: "so that whoever believes will in Him have eternal life."
      }
    },
    {
      verseNumber: 16,
      text: {
        KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        NKJV: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
        ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
        NASB: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life."
      }
    },
    {
      verseNumber: 17,
      text: {
        KJV: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
        NKJV: "For God did not send His Son into the world to condemn the world, but that the world through Him might be saved.",
        ESV: "For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.",
        NASB: "For God did not send the Son into the world to judge the world, but that the world might be saved through Him."
      }
    }
  ]
};

/**
 * Robust helper that attempts to parse verses from the loaded report translations array
 * if the selected scriptures do not exist in the hardcoded database above.
 */
export function getParallelVerses(reference: string, translationsFromReport?: { version: string; text: string }[]): ParallelVerse[] {
  // 1. Check presets first with smart book-name mapping
  const cleanRef = reference.trim();
  const lowerRef = cleanRef.toLowerCase();

  if (lowerRef === "genesis" || lowerRef.startsWith("genesis 1") || lowerRef.startsWith("gen 1") || lowerRef.startsWith("gen ")) {
    return PRESET_BIBLES["Genesis 1:1-5"];
  }
  if (lowerRef === "psalms" || lowerRef === "psalm" || lowerRef.startsWith("psalms 23") || lowerRef.startsWith("psalm 23") || lowerRef.startsWith("psa ")) {
    return PRESET_BIBLES["Psalms 23:1-6"];
  }
  if (lowerRef === "isaiah" || lowerRef.startsWith("isaiah 53") || lowerRef.startsWith("isa 53") || lowerRef.startsWith("isa ")) {
    return PRESET_BIBLES["Isaiah 53:1-6"];
  }
  if (lowerRef === "john" || lowerRef.startsWith("john 3") || lowerRef.startsWith("joh ")) {
    return PRESET_BIBLES["John 3:14-17"];
  }
  if (lowerRef === "revelation" || lowerRef.startsWith("revelation 14") || lowerRef.startsWith("rev 14") || lowerRef.startsWith("rev ")) {
    return PRESET_BIBLES["Revelation 14:6-12"];
  }

  for (const presetKey of Object.keys(PRESET_BIBLES)) {
    if (presetKey.toLowerCase().replace(/\s+/g, '') === cleanRef.toLowerCase().replace(/\s+/g, '')) {
      return PRESET_BIBLES[presetKey];
    }
  }

  // 2. Fallback to parsing from loaded step1.translations if present
  if (translationsFromReport && translationsFromReport.length > 0) {
    const KJV_text = translationsFromReport.find(t => t.version === 'KJV')?.text || '';
    const NKJV_text = translationsFromReport.find(t => t.version === 'NKJV')?.text || '';
    const ESV_text = translationsFromReport.find(t => t.version === 'ESV')?.text || '';
    const NASB_text = translationsFromReport.find(t => t.version === 'NASB')?.text || '';

    // If it has multiple verses, split them by standard verse numbers or sentences
    // we make a best effort to split or return as a single verse.
    const splitRegex = /(?:\bv\.?\s*(\d+)|\b(\d+)\b)/g;
    
    // For simplicity and high-fidelity, if no specific verses are parsed, we encapsulate the entire text
    return [
      {
        verseNumber: 1,
        text: {
          KJV: KJV_text || "Scripture text loading...",
          NKJV: NKJV_text || "Scripture text loading...",
          ESV: ESV_text || "Scripture text loading...",
          NASB: NASB_text || "Scripture text loading..."
        }
      }
    ];
  }

  return [
    {
      verseNumber: 1,
      text: {
        KJV: "Select a scripture passage to begin parallel translations study.",
        NKJV: "Select a scripture passage to begin parallel translations study.",
        ESV: "Select a scripture passage to begin parallel translations study.",
        NASB: "Select a scripture passage to begin parallel translations study."
      }
    }
  ];
}

/**
 * Full chapter datasets for full chapter loading in the Bible Reader
 */
export const FULL_CHAPTER_BIBLES: Record<string, ParallelVerse[]> = {
  "Hebrews 9": [
    { verseNumber: 1, text: { KJV: "Then verily the first covenant had also ordinances of divine service, and a worldly sanctuary.", NKJV: "Then indeed, even the first covenant had ordinances of divine service and the earthly sanctuary.", ESV: "Now even the first covenant had regulations for worship and an earthly place of holiness.", NASB: "Now even the first covenant had regulations of divine service and the earthly sanctuary." } },
    { verseNumber: 2, text: { KJV: "For there was a tabernacle made; the first, wherein was the candlestick, and the table, and the shewbread; which is called the sanctuary.", NKJV: "For a tabernacle was prepared: the first part, in which was the lampstand, the table, and the showbread, which is called the sanctuary;", ESV: "For a tent was prepared, the first section, in which were the lampstand and the table and the bread of the Presence. It is called the Holy Place.", NASB: "For there was a tabernacle prepared, the outer one, in which were the lampstand and the table and the sacred bread; this is called the holy place." } },
    { verseNumber: 3, text: { KJV: "And after the second veil, the tabernacle which is called the Holiest of all;", NKJV: "and behind the second veil, the part of the tabernacle which is called the Holiest of All,", ESV: "Behind the second curtain was a second section called the Most Holy Place,", NASB: "Behind the second veil there was a tabernacle which is called the Holy of Holies," } },
    { verseNumber: 4, text: { KJV: "Which had the golden censer, and the ark of the covenant overlaid round about with gold, wherein was the golden pot that had manna, and Aaron's rod that budded, and the tables of the covenant;", NKJV: "which had the golden censer and the ark of the covenant overlaid on all sides with gold, in which were the golden pot that had the manna, Aaron's rod that budded, and the tablets of the covenant;", ESV: "having the golden altar of incense and the ark of the covenant covered on all sides with gold, in which was a golden urn holding the manna, and Aaron's staff that budded, and the tablets of the covenant.", NASB: "having a golden altar of incense and the ark of the covenant covered on all sides with gold, in which was a golden jar holding the manna, and Aaron's rod which budded, and the tables of the covenant;" } },
    { verseNumber: 5, text: { KJV: "And over it the cherubims of glory shadowing the mercyseat; of which we cannot now speak particularly.", NKJV: "and above it were the cherubim of glory overshadowing the mercy seat. Of these things we cannot now speak in detail.", ESV: "Above it were the cherubim of glory overshadowing the mercy seat. Of these things we cannot now speak in detail.", NASB: "and above it were the cherubim of glory overshadowing the mercy seat; but of these things we cannot now speak in detail." } },
    { verseNumber: 6, text: { KJV: "Now when these things were thus ordained, the priests went always into the first tabernacle, accomplishing the service of God.", NKJV: "Now when these things had been thus prepared, the priests always went into the first part of the tabernacle, performing the services.", ESV: "These preparations having thus been made, the priests go regularly into the first section, performing their ritual duties,", NASB: "Now when these things have been so prepared, the priests are continually entering the outer tabernacle performing the divine worship," } },
    { verseNumber: 7, text: { KJV: "But into the second went the high priest alone once every year, not without blood, which he offered for himself, and for the errors of the people:", NKJV: "But into the second part the high priest went alone once a year, not without blood, which he offered for himself and for the people's sins committed in ignorance;", ESV: "but into the second only the high priest goes, and he but once a year, and not without taking blood, which he offers for himself and for the unintentional sins of the people.", NASB: "but into the second, only the high priest enters once a year, not without taking blood, which he offers for himself and for the sins of the people committed in ignorance." } },
    { verseNumber: 8, text: { KJV: "The Holy Ghost this signifying, that the way into the holiest of all was not yet made manifest, while as the first tabernacle was yet standing:", NKJV: "the Holy Spirit indicating this, that the way into the Holiest of All was not yet made manifest while the first tabernacle was still standing.", ESV: "By this the Holy Spirit indicates that the way into the holy places is not yet opened as long as the first section is still standing", NASB: "The Holy Spirit is signifying this, that the way into the holy place has not yet been disclosed while the outer tabernacle is still standing," } },
    { verseNumber: 9, text: { KJV: "Which was a figure for the time then present, in which were offered both gifts and sacrifices, that could not make him that did the service perfect, as pertaining to the conscience;", NKJV: "It was symbolic for the present time in which both gifts and sacrifices are offered which cannot make him who performed the service perfect in regard to the conscience—", ESV: "(which is symbolic for the present age). According to this arrangement, gifts and sacrifices are offered that cannot perfect the conscience of the worshiper,", NASB: "which is a symbol for the present time. Accordingly both gifts and sacrifices are offered which cannot make the worshiper perfect in conscience," } },
    { verseNumber: 10, text: { KJV: "Which stood only in meats and drinks, and divers washings, and carnal ordinances, imposed on them until the time of reformation.", NKJV: "concerned only with foods and drinks, various washings, and fleshly ordinances imposed until the time of reformation.", ESV: "but deal only with food and drink and various washings, regulations for the body imposed until the time of reformation.", NASB: "since they relate only to food and drink and various washings, regulations for the body imposed until a time of reformation." } },
    { verseNumber: 11, text: { KJV: "But Christ being come an high priest of good things to come, by a greater and more perfect tabernacle, not made with hands, that is to say, not of this building;", NKJV: "But Christ came as High Priest of the good things to come, with the greater and more perfect tabernacle not made with hands, that is, not of this creation.", ESV: "But when Christ appeared as a high priest of the good things that have come, then through the greater and more perfect tent (not made with hands, that is, not of this creation),", NASB: "But when Christ appeared as a high priest of the good things to come, He entered through the greater and more perfect tabernacle, not made with hands, that is to say, not of this creation;" } },
    { verseNumber: 12, text: { KJV: "Neither by the blood of goats and calves, but by his own blood he entered in once into the holy place, having obtained eternal redemption for us.", NKJV: "Not with the blood of goats and calves, but with His own blood He entered the Most Holy Place once for all, having obtained eternal redemption.", ESV: "he entered once for all into the holy places, not by means of the blood of goats and calves but by means of his own blood, thus securing an eternal redemption.", NASB: "and not through the blood of goats and calves, but through His own blood, He entered the holy place once for all, having obtained eternal redemption." } },
    { verseNumber: 13, text: { KJV: "For if the blood of bulls and of goats, and the ashes of an heifer sprinkling the unclean, sanctifieth to the purifying of the flesh:", NKJV: "For if the blood of bulls and goats and the ashes of a heifer, sprinkling the unclean, sanctifies for the purifying of the flesh,", ESV: "For if the blood of goats and bulls, and the sprinkling of defiled persons with the ashes of a heifer, sanctify for the purification of the flesh,", NASB: "For if the blood of goats and bulls and the ashes of a heifer sprinkling those who have been defiled sanctify for the cleansing of the flesh," } },
    { verseNumber: 14, text: { KJV: "How much more shall the blood of Christ, who through the eternal Spirit offered himself without spot to God, purge your conscience from dead works to serve the living God?", NKJV: "how much more shall the blood of Christ, who through the eternal Spirit offered Himself without spot to God, cleanse your conscience from dead works to serve the living God?", ESV: "how much more will the blood of Christ, who through the eternal Spirit offered himself without blemish to God, purify our conscience from dead works to serve the living God.", NASB: "how much more will the blood of Christ, who through the eternal Spirit offered Himself without blemish to God, cleanse your conscience from dead works to serve the living God?" } },
    { verseNumber: 15, text: { KJV: "And for this cause he is the mediator of the new testament, that by means of death, for the redemption of the transgressions that were under the first testament, they which are called might receive the promise of eternal inheritance.", NKJV: "And for this reason He is the Mediator of the new covenant, by means of death, for the redemption of the transgressions under the first covenant, that those who are called may receive the promise of the eternal inheritance.", ESV: "Therefore he is the mediator of a new covenant, so that those who are called may receive the promised eternal inheritance, since a death has occurred that redeems them from the transgressions committed under the first covenant.", NASB: "For this reason He is the mediator of a new covenant, so that, since a death has taken place for the redemption of the transgressions that were committed under the first covenant, those who have been called may receive the promise of the eternal inheritance." } },
    { verseNumber: 16, text: { KJV: "For where a testament is, there must also of necessity be the death of the testator.", NKJV: "For where there is a testament, there must also of necessity be the death of the testator.", ESV: "For where a will is involved, the death of the one who made it must be established.", NASB: "For where a covenant is, there must of necessity be the death of the one who made it." } },
    { verseNumber: 17, text: { KJV: "For a testament is of force after men are dead: otherwise it is of no strength at all while the testator liveth.", NKJV: "For a testament is in force after men are dead, since it has no power at all while the testator lives.", ESV: "For a will takes effect only at death, since it is not in force as long as the one who made it is alive.", NASB: "For a covenant is valid only when men are dead, for it is never in force while the one who made it lives." } },
    { verseNumber: 18, text: { KJV: "Whereupon neither the first testament was dedicated without blood.", NKJV: "Therefore not even the first covenant was dedicated without blood.", ESV: "Therefore not even the first covenant was inaugurated without blood.", NASB: "Therefore even the first covenant was not inaugurated without blood." } },
    { verseNumber: 19, text: { KJV: "For when Moses had spoken every precept to all the people according to the law, he took the blood of calves and of goats, with water, and scarlet wool, and hyssop, and sprinkled both the book, and all the people,", NKJV: "For when Moses had spoken every precept to all the people according to the law, he took the blood of calves and goats, with water, scarlet wool, and hyssop, and sprinkled both the book itself and all the people,", ESV: "For when every commandment of the law had been declared by Moses to all the people, he took the blood of calves and goats, with water and scarlet wool and hyssop, and sprinkled both the book itself and all the people,", NASB: "For when every commandment had been spoken by Moses to all the people according to the Law, he took the blood of the calves and the goats, with water and scarlet wool and hyssop, and sprinkled both the book itself and all the people," } },
    { verseNumber: 20, text: { KJV: "Saying, This is the blood of the testament which God hath enjoined unto you.", NKJV: "saying, 'This is the blood of the covenant which God has commanded you.'", ESV: "saying, 'This is the blood of the covenant that God commanded for you.'", NASB: "saying, 'This is the blood of the covenant which God commanded you.'" } },
    { verseNumber: 21, text: { KJV: "Moreover he sprinkled with blood both the tabernacle, and all the vessels of the ministry.", NKJV: "Then likewise he sprinkled with blood both the tabernacle and all the vessels of the ministry.", ESV: "And in the same way he sprinkled with the blood both the tent and all the vessels used in worship.", NASB: "And in the same way he sprinkled both the tabernacle and all the vessels of the ministry with the blood." } },
    { verseNumber: 22, text: { KJV: "And almost all things are by the law purged with blood; and without shedding of blood is no remission.", NKJV: "And according to the law almost all things are purified with blood, and without shedding of blood there is no remission.", ESV: "Indeed, under the law almost everything is purified with blood, and without the shedding of blood there is no forgiveness of sins.", NASB: "And according to the Law, one may almost say, all things are cleansed with blood, and without shedding of blood there is no forgiveness." } },
    { verseNumber: 23, text: { KJV: "It was therefore necessary that the patterns of things in the heavens should be purified with these; but the heavenly things themselves with better sacrifices than these.", NKJV: "Therefore it was necessary that the copies of the things in the heavens should be purified with these, but the heavenly things themselves with better sacrifices than these.", ESV: "Thus it was necessary for the copies of the heavenly things to be purified with these rites, but the heavenly things themselves with better sacrifices than these.", NASB: "Therefore it was necessary for the copies of the things in the heavens to be cleansed with these, but the heavenly things themselves with better sacrifices than these." } },
    { verseNumber: 24, text: { KJV: "For Christ is not entered into the holy places made with hands, which are the figures of the true; but into heaven itself, now to appear in the presence of God for us:", NKJV: "For Christ has not entered the holy places made with hands, which are copies of the true, but into heaven itself, now to appear in the presence of God for us;", ESV: "For Christ has entered, not into holy places made with hands, which are copies of the true things, but into heaven itself, now to appear in the presence of God on our behalf.", NASB: "For Christ did not enter a holy place made with hands, a mere copy of the true one, but into heaven itself, now to appear in the presence of God for us;" } },
    { verseNumber: 25, text: { KJV: "Nor yet that he should offer himself often, as the high priest entereth into the holy place every year with blood of others;", NKJV: "not that He should offer Himself often, as the high priest enters the Most Holy Place every year with blood of another—", ESV: "Nor was it to offer himself repeatedly, as the high priest enters the holy places every year with blood not his own,", NASB: "nor was it that He would offer Himself often, as the high priest enters the holy place year by year with blood that is not his own." } },
    { verseNumber: 26, text: { KJV: "For then must he often have suffered since the foundation of the world: but now once in the end of the world hath he appeared to put away sin by the sacrifice of himself.", NKJV: "He then would have had to suffer often since the foundation of the world; but now, once at the end of the ages, He has appeared to put away sin by the sacrifice of Himself.", ESV: "for then he would have had to suffer repeatedly since the foundation of the world. But as it is, he has appeared once for all at the end of the ages to put away sin by the sacrifice of himself.", NASB: "Otherwise, He would have needed to suffer often since the foundation of the world; but now once at the consummation of the ages He has been manifested to put away sin by the sacrifice of Himself." } },
    { verseNumber: 27, text: { KJV: "And as it is appointed unto men once to die, but after this the judgment:", NKJV: "And as it is appointed for men to die once, but after this the judgment,", ESV: "And just as it is appointed for man to die once, and after that comes judgment,", NASB: "And inasmuch as it is appointed for men to die once and after this comes judgment," } },
    { verseNumber: 28, text: { KJV: "So Christ was once offered to bear the sins of many; and unto them that look for him shall he appear the second time without sin unto salvation.", NKJV: "so Christ was offered once to bear the sins of many. To those who eagerly wait for Him He will appear a second time, apart from sin, for salvation.", ESV: "so Christ, having been offered once to bear the sins of many, will appear a second time, not to deal with sin but to save those who are eagerly waiting for him.", NASB: "so Christ also, having been offered once to bear the sins of many, will appear a second time for salvation without reference to sin, to those who eagerly await Him." } }
  ],
  "John 3": [
    { verseNumber: 1, text: { KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:", NKJV: "There was a man of the Pharisees named Nicodemus, a ruler of the Jews.", ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.", NASB: "Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews;" } },
    { verseNumber: 2, text: { KJV: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.", NKJV: "This man came to Jesus by night and said to Him, 'Rabbi, we know that You are a teacher come from God; for no one can do these signs that You do unless God is with him.'", ESV: "This man came to Jesus by night and said to him, 'Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do unless God is with him.'", NASB: "this man came to Jesus by night and said to Him, 'Rabbi, we know that You have come from God as a teacher; for no one can do these signs that You do unless God is with him.'" } },
    { verseNumber: 3, text: { KJV: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.", NKJV: "Jesus answered and said to him, 'Most assuredly, I say to you, unless one is born again, he cannot see the kingdom of God.'", ESV: "Jesus answered him, 'Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God.'", NASB: "Jesus answered and said to him, 'Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God.'" } },
    { verseNumber: 4, text: { KJV: "Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?", NKJV: "Nicodemus said to Him, 'How can a man be born when he is old? Can he enter a second time into his mother's womb and be born?'", ESV: "Nicodemus said to him, 'How can a man be born when he is old? Can he enter a second time into his mother's womb and be born?'", NASB: "Nicodemus said to Him, 'How can a man be born when he is old? He cannot enter a second time into his mother's womb and be born, can he?'" } },
    { verseNumber: 5, text: { KJV: "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.", NKJV: "Jesus answered, 'Most assuredly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God.'", ESV: "Jesus answered, 'Truly, truly, I say to you, unless one is born of water and the Spirit, he cannot enter the kingdom of God.'", NASB: "Jesus answered, 'Truly, truly, I say to you, unless one is born of water and the Spirit he cannot enter into the kingdom of God.'" } },
    { verseNumber: 6, text: { KJV: "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.", NKJV: "That which is born of the flesh is flesh, and that which is born of the Spirit is spirit.", ESV: "That which is born of the flesh is flesh, and that which is born of the Spirit is spirit.", NASB: "That which is born of the flesh is flesh, and that which is born of the Spirit is spirit." } },
    { verseNumber: 7, text: { KJV: "Marvel not that I said unto thee, Ye must be born again.", NKJV: "Do not marvel that I said to you, 'You must be born again.'", ESV: "Do not marvel that I said to you, 'You must be born again.'", NASB: "Do not be amazed that I said to you, 'You must be born again.'" } },
    { verseNumber: 8, text: { KJV: "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.", NKJV: "The wind blows where it wishes, and you hear the sound of it, but cannot tell where it comes from and where it goes. So is everyone who is born of the Spirit.", ESV: "The wind blows where it wishes, and you hear its sound, but you do not know where it comes from or where it goes. So it is with everyone who is born of the Spirit.", NASB: "The wind blows where it wishes and you hear the sound of it, but do not know where it comes from and where it is going; so is everyone who is born of the Spirit." } },
    { verseNumber: 9, text: { KJV: "Nicodemus answered and said unto him, How can these things be?", NKJV: "Nicodemus answered and said to Him, 'How can these things be?'", ESV: "Nicodemus said to him, 'How can these things be?'", NASB: "Nicodemus said to Him, 'How can these things be?'" } },
    { verseNumber: 10, text: { KJV: "Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?", NKJV: "Jesus answered and said to him, 'Are you the teacher of Israel, and do not know these things?'", ESV: "Jesus answered him, 'Are you the teacher of Israel and yet you do not understand these things?'", NASB: "Jesus answered and said to him, 'Are you the teacher of Israel and do not understand these things?'" } },
    { verseNumber: 11, text: { KJV: "Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.", NKJV: "Most assuredly, I say to you, We speak what We know and testify what We have seen, and you do not receive Our witness.", ESV: "Truly, truly, I say to you, we speak of what we know, and bear witness to what we have seen, but you do not receive our testimony.", NASB: "Truly, truly, I say to you, we speak of what we know and testify of what we have seen, and you do not accept our testimony." } },
    { verseNumber: 12, text: { KJV: "If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?", NKJV: "If I have told you earthly things and you do not believe, how will you believe if I tell you heavenly things?", ESV: "If I have told you earthly things and you do not believe, how can you believe if I tell you heavenly things?", NASB: "If I told you earthly things and you do not believe, how will you believe if I tell you heavenly things?" } },
    { verseNumber: 13, text: { KJV: "And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.", NKJV: "No one has ascended to heaven but He who came down from heaven, that is, the Son of Man who is in heaven.", ESV: "No one has ascended into heaven except he who descended from heaven, the Son of Man.", NASB: "No one has ascended into heaven, but He who descended from heaven: the Son of Man." } },
    { verseNumber: 14, text: { KJV: "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:", NKJV: "And as Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up,", ESV: "And as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up,", NASB: "As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up;" } },
    { verseNumber: 15, text: { KJV: "That whosoever believeth in him should not perish, but have eternal life.", NKJV: "that whoever believes in Him should not perish but have eternal life.", ESV: "that whoever believes in him may have eternal life.", NASB: "so that whoever believes will in Him have eternal life." } },
    { verseNumber: 16, text: { KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", NKJV: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.", ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", NASB: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life." } },
    { verseNumber: 17, text: { KJV: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.", NKJV: "For God did not send His Son into the world to condemn the world, but that the world through Him might be saved.", ESV: "For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.", NASB: "For God did not send the Son into the world to judge the world, but that the world might be saved through Him." } },
    { verseNumber: 18, text: { KJV: "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.", NKJV: "He who believes in Him is not condemned; but he who does not believe is condemned already, because he has not believed in the name of the only begotten Son of God.", ESV: "Whoever believes in him is not condemned, but whoever does not believe is condemned already, because he has not believed in the name of the only Son of God.", NASB: "He who believes in Him is not judged; he who does not believe has been judged already, because he has not believed in the name of the only begotten Son of God." } },
    { verseNumber: 19, text: { KJV: "And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.", NKJV: "And this is the condemnation, that the light has come into the world, and men loved darkness rather than light, because their deeds were evil.", ESV: "And this is the judgment: the light has come into the world, and people loved the darkness rather than the light because their works were evil.", NASB: "This is the judgment, that the Light has come into the world, and men loved the darkness rather than the Light, for their deeds were evil." } },
    { verseNumber: 20, text: { KJV: "For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.", NKJV: "For everyone practicing evil hates the light and does not come to the light, lest his deeds should be exposed.", ESV: "For everyone who does wicked things hates the light and does not come to the light, lest his works should be exposed.", NASB: "For everyone who does evil hates the Light, and does not come to the Light for fear that his deeds will be exposed." } },
    { verseNumber: 21, text: { KJV: "But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.", NKJV: "But he who does the truth comes to the light, that his deeds may be clearly seen, that they have been done in God.", ESV: "But whoever does what is true comes to the light, so that it may be clearly seen that his works have been carried out in God.", NASB: "But he who practices the truth comes to the Light, so that his deeds may be manifested as having been wrought in God." } },
    { verseNumber: 22, text: { KJV: "After these things came Jesus and his disciples into the land of Judaea; and there he tarried with them, and baptized.", NKJV: "After these things Jesus and His disciples came into the land of Judea, and there He remained with them and baptized.", ESV: "After this Jesus and his disciples went into the Judean countryside, and he remained there with them and was baptizing.", NASB: "After these things Jesus and His disciples came into the land of Judea, and there He was spending time with them and baptizing." } },
    { verseNumber: 23, text: { KJV: "And John also was baptizing in Aenon near to Salim, because there was much water there: and they came, and were baptized.", NKJV: "Now John also was baptizing in Aenon near Salim, because there was much water there. And they came and were baptized.", ESV: "John also was baptizing at Aenon near Salim, because water was plentiful there, and people were coming and being baptized", NASB: "John also was baptizing in Aenon near Salim, because there was much water there; and people were coming and were being baptized" } },
    { verseNumber: 24, text: { KJV: "For John was not yet cast into prison.", NKJV: "For John had not yet been thrown into prison.", ESV: "(for John had not yet been put in prison).", NASB: "for John had not yet been thrown into prison." } },
    { verseNumber: 25, text: { KJV: "Then there arose a question between some of John's disciples and the Jews about purifying.", NKJV: "Then there arose a dispute between some of John's disciples and the Jews about purification.", ESV: "Now a discussion arose between some of John's disciples and a Jew over purification.", NASB: "Therefore there arose a discussion on the part of John's disciples with a Jew about purification." } },
    { verseNumber: 26, text: { KJV: "And they came unto John, and said unto him, Rabbi, he that was with thee beyond Jordan, to whom thou barest witness, behold, the same baptizeth, and all men come to him.", NKJV: "And they came to John and said to him, 'Rabbi, He who was with you beyond the Jordan, to whom you have testified—behold, He is baptizing, and all are coming to Him!'", ESV: "And they came to John and said to him, 'Rabbi, he who was with you across the Jordan, to whom you bore witness—look, he is baptizing, and all are going to him.'", NASB: "And they came to John and said to him, 'Rabbi, He who was with you beyond the Jordan, to whom you have testified, behold, He is baptizing and all are coming to Him.'" } },
    { verseNumber: 27, text: { KJV: "John answered and said, A man can receive nothing, except it be given him from heaven.", NKJV: "John answered and said, 'A man can receive nothing unless it has been given to him from heaven.'", ESV: "John answered, 'A person cannot receive even one thing unless it is given him from heaven.'", NASB: "John answered and said, 'A man can receive nothing unless it has been given him from heaven.'" } },
    { verseNumber: 28, text: { KJV: "Ye yourselves bear me witness, that I said, I am not the Christ, but that I am sent before him.", NKJV: "You yourselves bear me witness, that I said, 'I am not the Christ,' but, 'I have been sent before Him.'", ESV: "You yourselves bear me witness, that I said, 'I am not the Christ, but I have been sent before him.'", NASB: "You yourselves are my witnesses that I said, 'I am not the Christ,' but, 'I have been sent ahead of Him.'" } },
    { verseNumber: 29, text: { KJV: "He that hath the bride is the bridegroom: but the friend of the bridegroom, which standeth and heareth him, rejoiceth greatly because of the bridegroom's voice: this my joy therefore is fulfilled.", NKJV: "He who has the bride is the bridegroom; but the friend of the bridegroom, who stands and hears him, rejoices greatly because of the bridegroom's voice. Therefore this joy of mine is fulfilled.", ESV: "The one who has the bride is the bridegroom. The friend of the bridegroom, who stands and hears him, rejoices greatly at the bridegroom's voice. Therefore this joy of mine is now complete.", NASB: "He who has the bride is the bridegroom; but the friend of the bridegroom, who stands and hears him, rejoices greatly because of the bridegroom's voice. So this joy of mine has been made full." } },
    { verseNumber: 30, text: { KJV: "He must increase, but I must decrease.", NKJV: "He must increase, but I must decrease.", ESV: "He must increase, but I must decrease.", NASB: "He must increase, but I must decrease." } },
    { verseNumber: 31, text: { KJV: "He that cometh from above is above all: he that is of the earth is earthly, and speaketh of the earth: he that cometh from heaven is above all.", NKJV: "He who comes from above is above all; he who is of the earth is earthly and speaks of the earth. He who comes from heaven is above all.", ESV: "He who comes from above is above all. He who is of the earth belongs to the earth and speaks in an earthly way. He who comes from heaven is above all.", NASB: "He who comes from above is above all, he who is of the earth is from the earth and speaks of the earth. He who comes from heaven is above all." } },
    { verseNumber: 32, text: { KJV: "And what he hath seen and heard, that he testifieth; and no man receiveth his testimony.", NKJV: "And what He has seen and heard, that He testifies; and no one receives His testimony.", ESV: "He bears witness to what he has seen and heard, yet no one receives his testimony.", NASB: "What He has seen and heard, of that He testifies; and no one receives His testimony." } },
    { verseNumber: 33, text: { KJV: "He that hath received his testimony hath set to his seal that God is true.", NKJV: "He who has received His testimony has certified that God is true.", ESV: "Whoever receives his testimony sets his seal to this, that God is true.", NASB: "He who has received His testimony has set his seal to this, that God is true." } },
    { verseNumber: 34, text: { KJV: "For he whom God hath sent speaketh the words of God: for God giveth not the Spirit by measure unto him.", NKJV: "For He whom God has sent speaks the words of God, for God does not give the Spirit by measure.", ESV: "For he whom God has sent utters the words of God, for he gives the Spirit without measure.", NASB: "For He whom God has sent speaks the words of God; for He gives the Spirit without measure." } },
    { verseNumber: 35, text: { KJV: "The Father loveth the Son, and hath given all things into his hand.", NKJV: "The Father loves the Son, and has given all things into His hand.", ESV: "The Father loves the Son and has given all things into his hand.", NASB: "The Father loves the Son and has given all things into His hand." } },
    { verseNumber: 36, text: { KJV: "He that believeth on the Son hath everlasting life: and he that believeth not the Son shall not see life; but the wrath of God abideth on him.", NKJV: "He who believes in the Son has everlasting life; and he who does not believe the Son shall not see life, but the wrath of God abides on him.", ESV: "Whoever believes in the Son has eternal life; whoever does not obey the Son shall not see life, but the wrath of God remains on him.", NASB: "He who believes in the Son has eternal life; but he who does not obey the Son will not see life, but the wrath of God abides on him." } }
  ],
  "Revelation 14": [
    { verseNumber: 1, text: { KJV: "Then I looked, and behold, a Lamb standing on Mount Zion, and with Him one hundred and forty-four thousand, having His Father's name written on their foreheads.", NKJV: "Then I looked, and behold, a Lamb standing on Mount Zion, and with Him one hundred and forty-four thousand, having His Father's name written on their foreheads.", ESV: "Then I looked, and behold, on Mount Zion stood the Lamb, and with him 144,000 who had his name and his Father's name written on their foreheads.", NASB: "Then I looked, and behold, the Lamb was standing on Mount Zion, and with Him one hundred and forty-four thousand, having His name and the name of His Father written on their foreheads." } },
    { verseNumber: 2, text: { KJV: "And I heard a voice from heaven, like the voice of many waters, and like the voice of loud thunder. And I heard the sound of harpists playing their harps.", NKJV: "And I heard a voice from heaven, like the voice of many waters, and like the voice of loud thunder. And I heard the sound of harpists playing their harps.", ESV: "And I heard a voice from heaven like the roar of many waters and like the sound of loud thunder. The voice I heard was like the sound of harpists playing on their harps,", NASB: "And I heard a voice from heaven, like the sound of many waters and like the sound of loud thunder, and the voice which I heard was like the sound of harpists playing on their harps." } },
    { verseNumber: 3, text: { KJV: "They sang as it were a new song before the throne, before the four living creatures, and the elders; and no one could learn that song except the hundred and forty-four thousand who were redeemed from the earth.", NKJV: "They sang as it were a new song before the throne, before the four living creatures, and the elders; and no one could learn that song except the hundred and forty-four thousand who were redeemed from the earth.", ESV: "and they were singing a new song before the throne and before the four living creatures and before the elders. No one could learn that song except the 144,000 who had been redeemed from the earth.", NASB: "And they sang a new song before the throne and before the four living creatures and the elders; and no one could learn the song except the one hundred and forty-four thousand who had been purchased from the earth." } },
    { verseNumber: 4, text: { KJV: "These are the ones who were not defiled with women, for they are virgins. These are the ones who follow the Lamb wherever He goes. These were redeemed from among men, being firstfruits to God and to the Lamb.", NKJV: "These are the ones who were not defiled with women, for they are virgins. These are the ones who follow the Lamb wherever He goes. These were redeemed from among men, being firstfruits to God and to the Lamb.", ESV: "It is these who have not defiled themselves with women, for they are virgins. It is these who follow the Lamb wherever he goes. These have been redeemed from mankind as firstfruits for God and the Lamb,", NASB: "These are the ones who have not been defiled with women, for they have kept themselves chaste. These are the ones who follow the Lamb wherever He goes. These have been purchased from among men as first fruits to God and to the Lamb." } },
    { verseNumber: 5, text: { KJV: "And in their mouth was found no deceit, for they are without fault before the throne of God.", NKJV: "And in their mouth was found no deceit, for they are without fault before the throne of God.", ESV: "and in their mouth no lie was found, for they are blameless.", NASB: "And no lie was found in their mouth; they are blameless." } },
    { verseNumber: 6, text: { KJV: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people,", NKJV: "Then I saw another angel flying in the midst of heaven, having the everlasting gospel to preach to those who dwell on the earth—to every nation, tribe, tongue, and people—", ESV: "Then I saw another angel flying directly overhead, with an eternal gospel to proclaim to those who dwell on earth, to every nation and tribe and language and people.", NASB: "And I saw another angel flying in midheaven, having an eternal gospel to preach to those who live on the earth, and to every nation and tribe and tongue and people;" } },
    { verseNumber: 7, text: { KJV: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.", NKJV: "saying with a loud voice, 'Fear God and give glory to Him, for the hour of His judgment has come; and worship Him who made heaven and earth, the sea and springs of water.'", ESV: "And he said with a loud voice, 'Fear God and give him glory, because the hour of his judgment has come, and worship him who made heaven and earth, the sea and the springs of water.'", NASB: "and he said with a loud voice, 'Fear God, and give Him glory, because the hour of His judgment has come; worship Him who made the heaven and the earth and sea and springs of waters.'" } },
    { verseNumber: 8, text: { KJV: "And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.", NKJV: "And another angel followed, saying, 'Babylon is fallen, is fallen, that great city, because she has made all nations drink of the wine of the wrath of her fornication.'", ESV: "Another angel, a second, followed, saying, 'Fallen, fallen is Babylon the great, she who made all nations drink the wine of the passion of her sexual immorality.'", NASB: "And another, a second angel, followed, saying, 'Fallen, fallen is Babylon the great, she who has made all the nations drink of the wine of the passion of her immorality.'" } },
    { verseNumber: 9, text: { KJV: "And the third angel followed them, saying with a loud voice, If any man worship the beast and his image, and receive his mark in his forehead, or in his hand,", NKJV: "Then a third angel followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives his mark on his forehead or on his hand,'", ESV: "And another angel, a third, followed them, saying with a loud voice, 'If anyone worships the beast and its image and receives a mark on his forehead or on his hand,'", NASB: "Then another angel, a third one, followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives a mark on his forehead or on his hand,'" } },
    { verseNumber: 10, text: { KJV: "The same shall drink of the wine of the wrath of God, which is poured out without mixture into the cup of his indignation; and he shall be tormented with fire and brimstone in the presence of the holy angels, and in the presence of the Lamb:", NKJV: "he himself shall also drink of the wine of the wrath of God, which is poured out full strength into the cup of His indignation. He shall be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb.", ESV: "he also will drink the wine of God's wrath, poured full strength into the cup of his anger, and he will be tormented with fire and sulfur in the presence of the holy angels and in the presence of the Lamb.", NASB: "he also will drink of the wine of the wrath of God, which is mixed in full strength in the cup of His anger; and he will be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb." } },
    { verseNumber: 11, text: { KJV: "And the smoke of their torment ascendeth up for ever and ever: and they have no rest day nor night, who worship the beast and his image, and whosoever receiveth the mark of his name.", NKJV: "And the smoke of their torment ascends forever and ever; and they have no rest day nor night, who worship the beast and his image, and whoever receives the mark of his name.", ESV: "And the smoke of their torment goes up forever and ever, and they have no rest, day or night, these worshipers of the beast and its image, and whoever receives the mark of its name.", NASB: "And the smoke of their torment goes up forever and ever; they have no rest day and night, those who worship the beast and his image, and whoever receives the mark of his name." } },
    { verseNumber: 12, text: { KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.", NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.", ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.", NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus." } },
    { verseNumber: 13, text: { KJV: "And I heard a voice from heaven saying unto me, Write, Blessed are the dead which die in the Lord from henceforth: Yea, saith the Spirit, that they may rest from their labours; and their works do follow them.", NKJV: "Then I heard a voice from heaven saying to me, 'Write: Blessed are the dead who die in the Lord from now on.' 'Yes,' says the Spirit, 'that they may rest from their labors, and their works follow them.'", ESV: "And I heard a voice from heaven saying, 'Write this: Blessed are the dead who die in the Lord from now on.' 'Blessed indeed,' says the Spirit, 'that they may rest from their labors, for their deeds follow them!'", NASB: "And I heard a voice from heaven, saying, 'Write, Blessed are the dead who die in the Lord from now on!' 'Yes,' says the Spirit, 'so that they may rest from their labors, for their deeds follow with them.'" } },
    { verseNumber: 14, text: { KJV: "And I looked, and behold a white cloud, and upon the cloud one sat like unto the Son of man, having on his head a golden crown, and in his hand a sharp sickle.", NKJV: "Then I looked, and behold, a white cloud, and on the cloud sat One like the Son of Man, having on His head a golden crown, and in His hand a sharp sickle.", ESV: "Then I looked, and behold, a white cloud, and seated on the cloud one like a son of man, with a golden crown on his head, and a sharp sickle in his hand.", NASB: "Then I looked, and behold, a white cloud, and sitting on the cloud was one like a son of man, having a golden crown on His head and a sharp sickle in His hand." } },
    { verseNumber: 15, text: { KJV: "And another angel came out of the temple, crying with a loud voice to him that sat on the cloud, Thrust in thy sickle, and reap: for the time is come for thee to reap; for the harvest of the earth is ripe.", NKJV: "And another angel came out of the temple, crying with a loud voice to Him who sat on the cloud, 'Thrust in Your sickle and reap, for the time has come for You to reap, for the harvest of the earth is ripe.'", ESV: "And another angel came out of the temple, calling with a loud voice to him who sat on the cloud, 'Put in your sickle, and reap, for the hour to reap has come, for the harvest of the earth is fully ripe.'", NASB: "And another angel came out of the temple, crying out with a loud voice to Him who sat on the cloud, 'Put in Your sickle and reap, for the hour to reap has come, because the harvest of the earth is ripe.'" } },
    { verseNumber: 16, text: { KJV: "And he that sat on the cloud thrust in his sickle on the earth; and the earth was reaped.", NKJV: "So He who sat on the cloud thrust in His sickle on the earth, and the earth was reaped.", ESV: "So he who sat on the cloud swung his sickle across the earth, and the earth was reaped.", NASB: "Then He who sat on the cloud swung His sickle over the earth, and the earth was reaped." } },
    { verseNumber: 17, text: { KJV: "And another angel came out of the temple which is in heaven, he also having a sharp sickle.", NKJV: "Then another angel came out of the temple which is in heaven, he also having a sharp sickle.", ESV: "Then another angel came out of the temple in heaven, and he too had a sharp sickle.", NASB: "And another angel came out of the temple which is in heaven, and he also had a sharp sickle." } },
    { verseNumber: 18, text: { KJV: "And another angel came out from the altar, which had power over fire; and cried with a loud cry to him that had the sharp sickle, saying, Thrust in thy sharp sickle, and gather the clusters of the vine of the earth; for her grapes are fully ripe.", NKJV: "And another angel came out from the altar, who had power over fire, and he cried with a loud cry to him who had the sharp sickle, saying, 'Thrust in your sharp sickle and gather the clusters of the vine of the earth, for her grapes are fully ripe.'", ESV: "And another angel came out from the altar, the angel who has authority over the fire, and he called with a loud voice to the one who had the sharp sickle, 'Put in your sharp sickle and gather the clusters of the vine of the earth, for its grapes are ripe.'", NASB: "Then another angel, the one who has power over fire, came out from the altar; and he called with a loud voice to him who had the sharp sickle, saying, 'Put in your sharp sickle and gather the clusters of the vine of the earth, because her grapes are ripe.'" } },
    { verseNumber: 19, text: { KJV: "And the angel thrust in his sickle into the earth, and gathered the vine of the earth, and cast it into the great winepress of the wrath of God.", NKJV: "So the angel thrust his sickle into the earth and gathered the vine of the earth, and threw it into the great winepress of the wrath of God.", ESV: "So the angel swung his sickle across the earth and gathered the grape harvest of the earth and threw it into the great winepress of the wrath of God.", NASB: "So the angel swung his sickle to the earth and gathered the clusters from the vine of the earth, and threw them into the great winepress of the wrath of God." } },
    { verseNumber: 20, text: { KJV: "And the winepress was trodden without the city, and blood came out of the winepress, even unto the horse bridles, by the space of a thousand and six hundred furlongs.", NKJV: "And the winepress was trampled outside the city, and blood came out of the winepress, up to the horses' bridles, for one thousand six hundred furlongs.", ESV: "And the winepress was trodden outside the city, and blood flowed from the winepress, as high as a horse's bridle, for 1,600 stadia.", NASB: "And the winepress was trodden outside the city, and blood came out from the winepress, up to the horses' bridles, for a distance of two hundred miles." } }
  ],
  "Hebrews 8": [
    { verseNumber: 1, text: { KJV: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens;", NKJV: "Now this is the main point of the things we are saying: We have such a High Priest, who is seated at the right hand of the throne of the Majesty in the heavens,", ESV: "Now the point in what we are saying is this: we have such a high priest, one who is seated at the right hand of the throne of the Majesty in heaven,", NASB: "Now the main point in what has been said is this: we have such a high priest, who has taken His seat at the right hand of the throne of the Majesty in the heavens," } },
    { verseNumber: 2, text: { KJV: "A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.", NKJV: "a Minister of the sanctuary and of the true tabernacle which the Lord pitched, and not man.", ESV: "a minister in the holy places, the true tent which the Lord set up, not man.", NASB: "a minister in the sanctuary and in the true tabernacle, which the Lord pitched, not man." } },
    { verseNumber: 3, text: { KJV: "For every high priest is ordained to offer gifts and sacrifices: wherefore it is of necessity that this man have somewhat also to offer.", NKJV: "For every High Priest is appointed to offer both gifts and sacrifices. Therefore it is necessary that this One also have something to offer.", ESV: "For every high priest is appointed to offer gifts and sacrifices; thus it is necessary for this priest also to have something to offer.", NASB: "For every high priest is appointed to offer both gifts and sacrifices; so it is necessary that this high priest also have something to offer." } },
    { verseNumber: 4, text: { KJV: "For if he were on earth, he should not be a priest, seeing that there are priests that offer gifts according to the law:", NKJV: "For if He were on earth, He would not be a priest, since there are priests who offer the gifts according to the law;", ESV: "Now if he were on earth, he would not be a priest at all, since there are priests who offer gifts according to the law.", NASB: "Now if He were on earth, He would not be a priest at all, since there are those who offer the gifts according to the Law;" } },
    { verseNumber: 5, text: { KJV: "Who serve unto the example and shadow of heavenly things, as Moses was admonished of God when he was about to make the tabernacle: for, See, saith he, that thou make all things according to the pattern shewed to thee in the mount.", NKJV: "who serve the copy and shadow of the heavenly things, as Moses was divinely instructed when he was about to make the tabernacle: for 'See,' He said, 'that you make all things according to the pattern shown to you on the mountain.'", ESV: "They serve a copy and shadow of the heavenly things. For when Moses was about to erect the tent, he was instructed by God, saying, 'See that you make everything according to the pattern that was shown you on the mountain.'", NASB: "who serve a copy and shadow of the heavenly things, just as Moses was warned by God when he was about to erect the tabernacle; for, 'See,' He says, 'that you make all things according to the pattern which was shown you on the mountain.'" } },
    { verseNumber: 6, text: { KJV: "But now hath he obtained a more excellent ministry, by how much also he is the mediator of a better covenant, which was established upon better promises.", NKJV: "But now He has obtained a more excellent ministry, inasmuch as He is also Mediator of a better covenant, which was established on better promises.", ESV: "But as it is, Christ has obtained a ministry that is as much more excellent than the old as the covenant he mediates is better, since it is enacted on better promises.", NASB: "But now He has obtained a more excellent ministry, by as much as He is also the mediator of a better covenant, which has been enacted on better promises." } },
    { verseNumber: 7, text: { KJV: "For if that first covenant had been faultless, then should no place have been sought for the second.", NKJV: "For if that first covenant had been faultless, then no place would have been sought for a second.", ESV: "For if that first covenant had been faultless, there would have been no occasion to look for a second.", NASB: "For if that first covenant had been faultless, there would have been no occasion sought for a second." } },
    { verseNumber: 8, text: { KJV: "For finding fault with them, he saith, Behold, the days come, saith the Lord, when I will make a new covenant with the house of Israel and with the house of Judah:", NKJV: "Because finding fault with them, He says: 'Behold, the days are coming, says the LORD, when I will make a new covenant with the house of Israel and with the house of Judah—'", ESV: "For he finds fault with them when he says: 'Behold, the days are coming, declares the Lord, when I will establish a new covenant with the house of Israel and with the house of Judah,'", NASB: "For finding fault with them, He says, 'Behold, days are coming, says the Lord, When I will effect a new covenant With the house of Israel and with the house of Judah;'" } },
    { verseNumber: 9, text: { KJV: "Not according to the covenant that I made with their fathers in the day when I took them by the hand to lead them out of the land of Egypt; because they continued not in my covenant, and I regarded them not, saith the Lord.", NKJV: "'not according to the covenant that I made with their fathers in the day when I took them by the hand to lead them out of the land of Egypt; because they did not continue in My covenant, and I disregarded them, says the LORD.'", ESV: "'not like the covenant that I made with their fathers on the day when I took them by the hand to lead them out of the land of Egypt. For they did not continue in my covenant, and so I showed no concern for them, declares the Lord.'", NASB: "'Not like the covenant which I made with their fathers On the day when I took them by the hand To lead them out of the land of Egypt; For they did not continue in My covenant, And I did not care for them, says the Lord.'" } },
    { verseNumber: 10, text: { KJV: "For this is the covenant that I will make with the house of Israel after those days, saith the Lord; I will put my laws into their mind, and write them in their hearts: and I will be to them a God, and they shall be to me a people:", NKJV: "'For this is the covenant that I will make with the house of Israel after those days, says the LORD: I will put My laws in their mind and write them on their hearts; and I will be their God, and they shall be My people.'", ESV: "'For this is the covenant that I will make with the house of Israel after those days, declares the Lord: I will put my laws into their minds, and write them on their hearts, and I will be their God, and they shall be my people.'", NASB: "'For this is the covenant that I will make with the house of Israel After those days, says the Lord: I will put My laws into their minds, And I will write them on their hearts. And I will be their God, And they shall be My people.'" } },
    { verseNumber: 11, text: { KJV: "And they shall not teach every man his neighbour, and every man his brother, saying, Know the Lord: for all shall know me, from the least to the greatest.", NKJV: "'None of them shall teach his neighbor, and none his brother, saying, \"Know the LORD,\" for all shall know Me, from the least of them to the greatest of them.'", ESV: "'And they shall not teach, each one his neighbor and each one his brother, saying, \"Know the Lord,\" for they shall all know me, from the least of them to the greatest.'", NASB: "'And they shall not teach everyone his fellow citizen, And everyone his brother, saying, \"Know the Lord,\" For all will know Me, From the least to the greatest of them.'" } },
    { verseNumber: 12, text: { KJV: "For I will be merciful to their unrighteousness, and their sins and their iniquities will I remember no more.", NKJV: "'For I will be merciful to their unrighteousness, and their sins and their lawless deeds I will remember no more.'", ESV: "'For I will be merciful toward their iniquities, and I will remember their sins no more.'", NASB: "'For I will be merciful to their iniquities, And I will remember their sins no more.'" } },
    { verseNumber: 13, text: { KJV: "In that he saith, A new covenant, he hath made the first old. Now that which decayeth and waxeth old is ready to vanish away.", NKJV: "In that He says, 'A new covenant,' He has made the first obsolete. Now what is becoming obsolete and growing old is ready to vanish away.", ESV: "In speaking of a new covenant, he makes the first one obsolete. And what is becoming obsolete and growing old is ready to vanish away.", NASB: "When He said, 'A new covenant,' He has made the first obsolete. But whatever is becoming obsolete and growing old is ready to disappear." } }
  ],
  "Psalms 23": [
    { verseNumber: 1, text: { KJV: "The Lord is my shepherd; I shall not want.", NKJV: "The LORD is my shepherd; I shall not want.", ESV: "The Lord is my shepherd; I shall not want.", NASB: "The Lord is my shepherd, I shall not want." } },
    { verseNumber: 2, text: { KJV: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.", NKJV: "He makes me to lie down in green pastures; He leads me beside the still waters.", ESV: "He makes me lie down in green pastures. He leads me beside still waters.", NASB: "He makes me lie down in green pastures; He leads me beside quiet waters." } },
    { verseNumber: 3, text: { KJV: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.", NKJV: "He restores my soul; He leads me in the paths of righteousness For His name's sake.", ESV: "He restores my soul. He leads me in paths of righteousness for his name's sake.", NASB: "He restores my soul; He guides me in the paths of righteousness For His name's sake." } },
    { verseNumber: 4, text: { KJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.", NKJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil; For You are with me; Your rod and Your staff, they comfort me.", ESV: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.", NASB: "Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me." } },
    { verseNumber: 5, text: { KJV: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.", NKJV: "You prepare a table before me in the presence of my enemies; You anoint my head with oil; My cup runs over.", ESV: "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.", NASB: "You prepare a table before me in the presence of my enemies; You have anointed my head with oil; My cup overflows." } },
    { verseNumber: 6, text: { KJV: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.", NKJV: "Surely goodness and mercy shall follow me All the days of my life; And I will dwell in the house of the LORD Forever.", ESV: "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.", NASB: "Surely goodness and lovingkindness will follow me all the days of my life, And I will dwell in the house of the Lord forever." } }
  ],
  "Romans 12": [
    { verseNumber: 1, text: { KJV: "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.", NKJV: "I beseech you therefore, brethren, by the mercies of God, that you present your bodies a living sacrifice, holy, acceptable to God, which is your reasonable service.", ESV: "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.", NASB: "Therefore I urge you, brethren, by the mercies of God, to present your bodies a living and holy sacrifice, acceptable to God, which is your spiritual service of worship." } },
    { verseNumber: 2, text: { KJV: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.", NKJV: "And do not be conformed to this world, but be transformed by the renewing of your mind, that you may prove what is that good and acceptable and perfect will of God.", ESV: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.", NASB: "And do not be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what the will of God is, that which is good and acceptable and perfect." } },
    { verseNumber: 3, text: { KJV: "For I say, through the grace given unto me, to every man that is among you, not to think of himself more highly than he ought to think; but to think soberly, according as God hath dealt to every man the measure of faith.", NKJV: "For I say, through the grace given to me, to everyone who is among you, not to think of himself more highly than he ought to think, but to think soberly, as God has dealt to each one a measure of faith.", ESV: "For by the grace given to me I say to everyone among you not to think of himself more highly than he ought to think, but to think with sober judgment, each according to the measure of faith that God has assigned.", NASB: "For through the grace given to me I say to everyone among you not to think more highly of himself than he ought to think; but to think so as to have sound judgment, as God has allotted to each a measure of faith." } },
    { verseNumber: 4, text: { KJV: "For as we have many members in one body, and all members have not the same office:", NKJV: "For as we have many members in one body, but all the members do not have the same function,", ESV: "For as in one body we have many members, and the members do not all have the same function,", NASB: "For just as we have many members in one body and all the members do not have the same function," } },
    { verseNumber: 5, text: { KJV: "So we, being many, are one body in Christ, and every one members one of another.", NKJV: "so we, being many, are one body in Christ, and individually members of one another.", ESV: "so we, though many, are one body in Christ, and individually members one of another.", NASB: "so we, who are many, are one body in Christ, and individually members one of another." } },
    { verseNumber: 6, text: { KJV: "Having then gifts differing according to the grace that is given to us, whether prophecy, let us prophesy according to the proportion of faith;", NKJV: "Having then gifts differing according to the grace that is given to us, let us use them: if prophecy, let us prophesy in proportion to our faith;", ESV: "Having gifts that differ according to the grace given to us, let us use them: if prophecy, in proportion to our faith;", NASB: "Since we have gifts that differ according to the grace given to us, each of us is to exercise them accordingly: if prophecy, according to the proportion of his faith;" } },
    { verseNumber: 7, text: { KJV: "Or ministry, let us wait on our ministering: or he that teacheth, on teaching;", NKJV: "or ministry, let us use it in our ministering; he who teaches, in teaching;", ESV: "if service, in our serving; the one who teaches, in his teaching;", NASB: "if service, in his serving; or he who teaches, in his teaching;" } },
    { verseNumber: 8, text: { KJV: "Or he that exhorteth, on exhortation: he that giveth, let him do it with simplicity; he that ruleth, with diligence; he that sheweth mercy, with cheerfulness.", NKJV: "he who exhorts, in exhortation; he who gives, with liberality; he who leads, with diligence; he who shows mercy, with cheerfulness.", ESV: "the one who exhorts, in his exhortation; the one who contributes, in generosity; the one who leads, with zeal; the one who does acts of mercy, with cheerfulness.", NASB: "or he who exhorts, in his exhortation; he who gives, with liberality; he who leads, with diligence; he who shows mercy, with cheerfulness." } },
    { verseNumber: 9, text: { KJV: "Let love be without dissimulation. Abhor that which is evil; cleave to that which is good.", NKJV: "Let love be without hypocrisy. Abhor what is evil. Cling to what is good.", ESV: "Let love be genuine. Abhor what is evil; hold fast to what is good.", NASB: "Let love be without hypocrisy. Abhor what is evil; cling to what is good." } },
    { verseNumber: 10, text: { KJV: "Be kindly affectioned one to another with brotherly love; in honour preferring one another;", NKJV: "Be kindly affectionate to one another with brotherly love, in honor giving preference to one another;", ESV: "Love one another with brotherly affection. Outdo one another in showing honor.", NASB: "Be devoted to one another in brotherly love; give preference to one another in honor;" } },
    { verseNumber: 11, text: { KJV: "Not slothful in business; fervent in spirit; serving the Lord;", NKJV: "not lagging in diligence, fervent in spirit, serving the Lord;", ESV: "Do not be slothful in zeal, be fervent in spirit, serve the Lord.", NASB: "not lagging behind in diligence, fervent in spirit, serving the Lord;" } },
    { verseNumber: 12, text: { KJV: "Rejoicing in hope; patient in tribulation; continuing instant in prayer;", NKJV: "rejoicing in hope, patient in tribulation, continuing steadfastly in prayer;", ESV: "Rejoice in hope, be patient in tribulation, be constant in prayer.", NASB: "rejoicing in hope, persevering in tribulation, devoted to prayer," } },
    { verseNumber: 13, text: { KJV: "Distributing to the necessity of saints; given to hospitality.", NKJV: "distributing to the needs of the saints, given to hospitality.", ESV: "Contribute to the needs of the saints and seek to show hospitality.", NASB: "contributing to the needs of the saints, practicing hospitality." } },
    { verseNumber: 14, text: { KJV: "Bless them which persecute you: bless, and curse not.", NKJV: "Bless those who persecute you; bless and do not curse.", ESV: "Bless those who persecute you; bless and do not curse them.", NASB: "Bless those who persecute you; bless and do not curse." } },
    { verseNumber: 15, text: { KJV: "Rejoice with them that do rejoice, and weep with them that weep.", NKJV: "Rejoice with those who rejoice, and weep with those who weep.", ESV: "Rejoice with those who rejoice, weep with those who weep.", NASB: "Rejoice with those who rejoice, and weep with those who weep." } },
    { verseNumber: 16, text: { KJV: "Be of the same mind one toward another. Mind not high things, but condescend to men of low estate. Be not wise in your own conceits.", NKJV: "Be of the same mind toward one another. Do not set your mind on high things, but associate with the humble. Do not be wise in your own opinion.", ESV: "Live in harmony with one another. Do not be haughty, but associate with the lowly. Never be wise in your own sight.", NASB: "Be of the same mind toward one another; do not be haughty in mind, but associate with the lowly. Do not be wise in your own estimation." } },
    { verseNumber: 17, text: { KJV: "Recompense to no man evil for evil. Provide things honest in the sight of all men.", NKJV: "Repay no one evil for evil. Have regard for good things in the sight of all men.", ESV: "Repay no one evil for evil, but give thought to do what is honorable in the sight of all.", NASB: "Never pay back evil for evil to anyone. Respect what is right in the sight of all men." } },
    { verseNumber: 18, text: { KJV: "If it be possible, as much as lieth in you, live peaceably with all men.", NKJV: "If it is possible, as much as depends on you, live peaceably with all men.", ESV: "If possible, so far as it depends on you, live peaceably with all.", NASB: "If possible, so far as it depends on you, be at peace with all men." } },
    { verseNumber: 19, text: { KJV: "Dearly beloved, avenge not yourselves, but rather give place unto wrath: for it is written, Vengeance is mine; I will repay, saith the Lord.", NKJV: "Beloved, do not avenge yourselves, but rather give place to wrath; for it is written, 'Vengeance is Mine, I will repay,' says the Lord.", ESV: "Beloved, never avenge yourselves, but leave it to the wrath of God, for it is written, 'Vengeance is mine, I will repay, says the Lord.'", NASB: "Never take your own revenge, beloved, but leave room for the wrath of God, for it is written, 'Vengeance is Mine, I will repay,' says the Lord." } },
    { verseNumber: 20, text: { KJV: "Therefore if thine enemy hunger, feed him; if he thirst, give him drink: for in so doing thou shalt heap coals of fire on his head.", NKJV: "Therefore 'If your enemy is hungry, feed him; If he is thirsty, give him a drink; For in so doing you will heap coals of fire on his head.'", ESV: "To the contrary, 'if your enemy is hungry, feed him; if he is thirsty, give him something to drink; for by so doing you will heap burning coals on his head.'", NASB: "'But if your enemy is hungry, feed him, and if he is thirsty, give him a drink; for in so doing you will heap burning coals on his head.'" } },
    { verseNumber: 21, text: { KJV: "Be not overcome of evil, but overcome evil with good.", NKJV: "Do not be overcome by evil, but overcome evil with good.", ESV: "Do not be overcome by evil, but overcome evil with good.", NASB: "Do not be overcome by evil, but overcome evil with good." } }
  ],
  "Genesis 1": [
    { verseNumber: 1, text: { KJV: "In the beginning God created the heaven and the earth.", NKJV: "In the beginning God created the heavens and the earth.", ESV: "In the beginning, God created the heavens and the earth.", NASB: "In the beginning God created the heavens and the earth." } },
    { verseNumber: 2, text: { KJV: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.", NKJV: "The earth was without form, and void; and darkness was on the face of the deep. And the Spirit of God was hovering over the face of the waters.", ESV: "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.", NASB: "The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters." } },
    { verseNumber: 3, text: { KJV: "And God said, Let there be light: and there was light.", NKJV: "Then God said, 'Let there be light'; and there was light.", ESV: "And God said, 'Let there be light,' and there was light.", NASB: "Then God said, 'Let there be light'; and there was light." } },
    { verseNumber: 4, text: { KJV: "And God saw the light, that it was good: and God divided the light from the darkness.", NKJV: "And God saw the light, that it was good; and God divided the light from the darkness.", ESV: "And God saw that the light was good. And God separated the light from the darkness.", NASB: "God saw that the light was good; and God separated the light from the darkness." } },
    { verseNumber: 5, text: { KJV: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.", NKJV: "God called the light Day, and the darkness He called Night. So the evening and the morning were the first day.", ESV: "God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.", NASB: "God called the light day, and the darkness He called night. And there was evening and there was morning, one day." } },
    { verseNumber: 26, text: { KJV: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.", NKJV: "Then God said, 'Let Us make man in Our image, according to Our likeness; let them have dominion over the fish of the sea, over the birds of the air, and over the cattle, over all the earth and over every creeping thing that creeps on the earth.'", ESV: "Then God said, 'Let us make man in our image, after our likeness. And let them have dominion over the fish of the sea and over the birds of the heavens and over the livestock and over all the earth and over every creeping thing that creeps on the earth.'", NASB: "Then God said, 'Let Us make man in Our image, according to Our likeness; and let them rule over the fish of the sea and over the birds of the sky and over the cattle and over all the earth, and over every creeping thing that creeps on the earth.'" } },
    { verseNumber: 27, text: { KJV: "So God created man in his own image, in the image of God created he him; male and female created he them.", NKJV: "So God created man in His own image; in the image of God He created him; male and female He created them.", ESV: "So God created man in his own image, in the image of God he created him; male and female he created them.", NASB: "God created man in His own image, in the image of God He created him; male and female He created them." } },
    { verseNumber: 31, text: { KJV: "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.", NKJV: "Then God saw everything that He had made, and indeed it was very good. So the evening and the morning were the sixth day.", ESV: "And God saw everything that he had made, and behold, it was very good. And there was evening and there was morning, the sixth day.", NASB: "God saw all that He had made, and behold, it was very good. And there was evening and there was morning, the sixth day." } }
  ],
  "Daniel 8": [
    { verseNumber: 14, text: { KJV: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.", NKJV: "And he said to me, 'For two thousand three hundred days; then the sanctuary shall be cleansed.'", ESV: "And he said to me, 'For 2,300 evenings and mornings. Then the sanctuary shall be restored to its rightful state.'", NASB: "He said to me, 'For 2,300 evenings and mornings; then the sanctuary will be properly restored.'" } }
  ],
  "Isaiah 53": [
    { verseNumber: 1, text: { KJV: "Who hath believed our report? and to whom is the arm of the Lord revealed?", NKJV: "Who has believed our report? And to whom has the arm of the LORD been revealed?", ESV: "Who has believed what he has heard from us? And to whom has the arm of the Lord been revealed?", NASB: "Who has believed our message? And to whom has the arm of the Lord been revealed?" } },
    { verseNumber: 2, text: { KJV: "For he shall grow up before him as a tender plant, and as a root out of a dry ground: he hath no form nor comeliness; and when we shall see him, there is no beauty that we should desire him.", NKJV: "For He shall grow up before Him as a tender plant, and as a root out of dry ground. He has no form or comeliness; and when we see Him, there is no beauty that we should desire Him.", ESV: "For he grew up before him like a young plant, and like a root out of dry ground; he had no form or majesty that we should look at him, and no beauty that we should desire him.", NASB: "For He grew up before Him like a tender shoot, and like a root out of parched ground; He has no stately form or majesty that we should look upon Him, nor appearance that we should be attracted to Him." } },
    { verseNumber: 3, text: { KJV: "He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not.", NKJV: "He is despised and rejected by men, a Man of sorrows and acquainted with grief. And we hid, as it were, our faces from Him; He was despised, and we did not esteem Him.", ESV: "He was despised and rejected by men, a man of sorrows and acquainted with grief; and as one from whom men hide their faces he was despised, and we esteemed him not.", NASB: "He was despised and forsaken of men, a man of sorrows and acquainted with grief; and like one from whom men hide their face He was despised, and we did not esteem Him." } },
    { verseNumber: 4, text: { KJV: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted.", NKJV: "Surely He has borne our griefs and carried our sorrows; yet we esteemed Him stricken, smitten by God, and afflicted.", ESV: "Surely he has borne our griefs and carried our sorrows; yet we esteemed him stricken, smitten by God, and afflicted.", NASB: "Surely our griefs He Himself bore, and our sorrows He carried; yet we ourselves esteemed Him stricken, smitten of God, and afflicted." } },
    { verseNumber: 5, text: { KJV: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.", NKJV: "But He was wounded for our transgressions, He was bruised for our iniquities; the chastisement for our peace was upon Him, and by His stripes we are healed.", ESV: "But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.", NASB: "But He was pierced through for our transgressions, He was crushed for our iniquities; the chastening for our well-being fell upon Him, and by His scourging we are healed." } },
    { verseNumber: 6, text: { KJV: "All we like sheep have gone astray; we have turned every one to his own way; and the Lord hath laid on him the iniquity of us all.", NKJV: "All we like sheep have gone astray; we have turned, every one, to his own way; and the LORD has laid on Him the iniquity of us all.", ESV: "All we like sheep have gone astray; we have turned—every one—to his own way; and the Lord has laid on him the iniquity of us all.", NASB: "All of us like sheep have gone astray, each of us has turned to his own way; but the Lord has caused the iniquity of us all to fall on Him." } }
  ],
  "1 Corinthians 13": [
    { verseNumber: 1, text: { KJV: "Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.", NKJV: "Though I speak with the tongues of men and of angels, but have not love, I have become sounding brass or a clanging cymbal.", ESV: "If I speak in the tongues of men and of angels, but have not love, I am a noisy gong or a clanging cymbal.", NASB: "If I speak with the tongues of men and of angels, but do not have love, I have become a noisy gong or a clanging cymbal." } },
    { verseNumber: 2, text: { KJV: "And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am nothing.", NKJV: "And though I have the gift of prophecy, and understand all mysteries and all knowledge, and though I have all faith, so that I could remove mountains, but have not love, I am nothing.", ESV: "And if I have prophetic powers, and understand all mysteries and all knowledge, and if I have all faith, so as to remove mountains, but have not love, I am nothing.", NASB: "If I have the gift of prophecy, and know all mysteries and all knowledge; and if I have all faith, so as to remove mountains, but do not have love, I am nothing." } },
    { verseNumber: 3, text: { KJV: "And though I bestow all my goods to feed the poor, and though I give my body to be burned, and have not charity, it profiteth me nothing.", NKJV: "And though I bestow all my goods to feed the poor, and though I give my body to be burned, but have not love, it profits me nothing.", ESV: "If I give away all I have, and if I deliver up my body to be burned, but have not love, I gain nothing.", NASB: "And if I give all my possessions to feed the poor, and if I surrender my body to be burned, but do not have love, it profits me nothing." } },
    { verseNumber: 4, text: { KJV: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,", NKJV: "Love suffers long and is kind; love does not envy; love does not parade itself, is not puffed up;", ESV: "Love is patient and kind; love does not envy or boast; it is not arrogant", NASB: "Love is patient, love is kind and is not jealous; love does not brag and is not arrogant," } },
    { verseNumber: 5, text: { KJV: "Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;", NKJV: "does not behave rudely, does not seek its own, is not provoked, thinks no evil;", ESV: "or rude. It does not insist on its own way; it is not irritable or resentful;", NASB: "does not act unbecomingly; it does not seek its own, is not provoked, does not take into account a wrong suffered," } },
    { verseNumber: 6, text: { KJV: "Rejoiceth not in iniquity, but rejoiceth in the truth;", NKJV: "does not rejoice in iniquity, but rejoices in the truth;", ESV: "it does not rejoice at wrongdoing, but rejoices with the truth.", NASB: "does not rejoice in unrighteousness, but rejoices with the truth;" } },
    { verseNumber: 7, text: { KJV: "Beareth all things, believeth all things, hopeth all things, endureth all things.", NKJV: "bears all things, believes all things, hopes all things, endures all things.", ESV: "Love bears all things, believes all things, hopes all things, endures all things.", NASB: "bears all things, believes all things, hopes all things, endures all things." } },
    { verseNumber: 8, text: { KJV: "Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.", NKJV: "Love never fails. But whether there are prophecies, they will fail; whether there are tongues, they will cease; whether there is knowledge, it will vanish away.", ESV: "Love never ends. As for prophecies, they will pass away; as for tongues, they will cease; as for knowledge, it will pass away.", NASB: "Love never fails; but if there are gifts of prophecy, they will be done away; if there are tongues, they will cease; if there is knowledge, it will be done away." } },
    { verseNumber: 13, text: { KJV: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", NKJV: "And now abide faith, hope, love, these three; but the greatest of these is love.", ESV: "So now faith, hope, and love abide, these three; but the greatest of these is love.", NASB: "But now faith, hope, love, abide these three; but the greatest of these is love." } }
  ],
  "Exodus 20": [
    { verseNumber: 1, text: { KJV: "And God spake all these words, saying,", NKJV: "And God spoke all these words, saying:", ESV: "And God spoke all these words, saying,", NASB: "Then God spoke all these words, saying," } },
    { verseNumber: 2, text: { KJV: "I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.", NKJV: "'I am the LORD your God, who brought you out of the land of Egypt, out of the house of bondage.'", ESV: "'I am the Lord your God, who brought you out of the land of Egypt, out of the house of slavery.'", NASB: "'I am the Lord your God, who brought you out of the land of Egypt, out of the house of slavery.'" } },
    { verseNumber: 3, text: { KJV: "Thou shalt have no other gods before me.", NKJV: "'You shall have no other gods before Me.'", ESV: "'You shall have no other gods before me.'", NASB: "'You shall have no other gods before Me.'" } },
    { verseNumber: 8, text: { KJV: "Remember the sabbath day, to keep it holy.", NKJV: "Remember the Sabbath day, to keep it holy.", ESV: "Remember the Sabbath day, to keep it holy.", NASB: "Remember the sabbath day, to keep it holy." } },
    { verseNumber: 9, text: { KJV: "Six days shalt thou labour, and do all thy work:", NKJV: "Six days you shall labor and do all your work,", ESV: "Six days you shall labor, and do all your work,", NASB: "Six days you shall labor and do all your work," } },
    { verseNumber: 10, text: { KJV: "But the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates:", NKJV: "but the seventh day is the Sabbath of the LORD your God. In it you shall do no work: you, nor your son, nor your daughter, nor your male servant, nor your female servant, nor your cattle, nor your stranger who is within your gates.", ESV: "but the seventh day is a Sabbath to the Lord your God. On it you shall not do any work, you, or your son, or your daughter, your male servant, or your female servant, or your livestock, or the sojourner who is within your gates.", NASB: "but the seventh day is a sabbath of the Lord your God; in it you shall not do any work, you or your son or your daughter, your male or your female servant or your cattle or your sojourner who stays with you." } },
    { verseNumber: 11, text: { KJV: "For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.", NKJV: "For in six days the LORD made the heavens and the earth, the sea, and all that is in them, and rested the seventh day. Therefore the LORD blessed the Sabbath day and hallowed it.", ESV: "For in six days the Lord made heaven and earth, the sea, and all that is in them, and rested on the seventh day. Therefore the Lord blessed the Sabbath day and made it holy.", NASB: "For in six days the Lord made the heavens and the earth, the sea and all that is in them, and rested on the seventh day; therefore the Lord blessed the sabbath day and made it holy." } }
  ],
  "2 Timothy 2": [
    { verseNumber: 15, text: { KJV: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.", NKJV: "Be diligent to present yourself approved to God, a worker who does not need to be ashamed, rightly dividing the word of truth.", ESV: "Do your best to present yourself to God as one approved, a worker who has no need to be ashamed, rightly handling the word of truth.", NASB: "Be diligent to present yourself approved to God as a workman who does not need to be ashamed, accurately handling the word of truth." } }
  ]
};

// In-memory cache for dynamically fetched chapters
const DYNAMIC_CHAPTER_CACHE: Record<string, ParallelVerse[]> = {};

/**
 * Retrieves full chapter verses for a selected chapter/reference
 */
export function getFullChapterVerses(refOrKey: string, reportTranslations?: any[]): ParallelVerse[] {
  if (!refOrKey) return [];
  const clean = refOrKey.trim();
  const lower = clean.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, "");

  // 1. Direct check in dynamic cache
  if (DYNAMIC_CHAPTER_CACHE[clean]) return DYNAMIC_CHAPTER_CACHE[clean];
  if (DYNAMIC_CHAPTER_CACHE[stripped]) return DYNAMIC_CHAPTER_CACHE[stripped];

  // 2. Direct check in preset dictionary
  for (const key of Object.keys(FULL_CHAPTER_BIBLES)) {
    if (
      key.toLowerCase() === lower ||
      key.toLowerCase().replace(/[^a-z0-9]/g, "") === stripped
    ) {
      return FULL_CHAPTER_BIBLES[key];
    }
  }

  // 3. Smart alias checking
  if (stripped.startsWith("heb") || stripped.startsWith("hebrews")) {
    if (stripped.includes("9")) return FULL_CHAPTER_BIBLES["Hebrews 9"];
    return FULL_CHAPTER_BIBLES["Hebrews 8"];
  }
  if (stripped.startsWith("rev") || stripped.startsWith("revelation")) {
    return FULL_CHAPTER_BIBLES["Revelation 14"];
  }
  if (stripped.startsWith("joh") || stripped.startsWith("john") || stripped.startsWith("jn")) {
    return FULL_CHAPTER_BIBLES["John 3"];
  }
  if (stripped.startsWith("psa") || stripped.startsWith("psalm") || stripped.startsWith("ps")) {
    return FULL_CHAPTER_BIBLES["Psalms 23"];
  }
  if (stripped.startsWith("rom") || stripped.startsWith("romans")) {
    return FULL_CHAPTER_BIBLES["Romans 12"];
  }
  if (stripped.startsWith("gen") || stripped.startsWith("genesis")) {
    return FULL_CHAPTER_BIBLES["Genesis 1"];
  }
  if (stripped.startsWith("isa") || stripped.startsWith("isaiah")) {
    return FULL_CHAPTER_BIBLES["Isaiah 53"];
  }
  if (stripped.startsWith("dan") || stripped.startsWith("daniel")) {
    return FULL_CHAPTER_BIBLES["Daniel 8"];
  }
  if (stripped.includes("1cor") || stripped.includes("1corinthians") || stripped.includes("corinthians")) {
    return FULL_CHAPTER_BIBLES["1 Corinthians 13"];
  }
  if (stripped.startsWith("ex") || stripped.startsWith("exodus")) {
    return FULL_CHAPTER_BIBLES["Exodus 20"];
  }
  if (stripped.includes("2tim") || stripped.includes("2timothy") || stripped.includes("timothy")) {
    return FULL_CHAPTER_BIBLES["2 Timothy 2"];
  }

  // Fallback to report or generic verses
  return getParallelVerses(refOrKey, reportTranslations);
}

/**
 * Asynchronously fetches a full chapter and updates in-memory cache
 * Checks IndexedDB first for instant local cache retrieval
 */
export async function fetchChapterVersesAsync(refOrKey: string): Promise<ParallelVerse[] | null> {
  if (!refOrKey) return null;
  const clean = refOrKey.trim();
  const lower = clean.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, "");

  // 1. Return synchronous in-memory match if available
  const existing = getFullChapterVerses(clean);
  if (existing && existing.length > 1) {
    return existing;
  }

  // 2. Check IndexedDB persistent store (< 2ms, zero server traffic)
  try {
    const cached = await stbaStorage.getPassage(clean);
    if (cached && cached.length > 0) {
      DYNAMIC_CHAPTER_CACHE[clean] = cached;
      DYNAMIC_CHAPTER_CACHE[stripped] = cached;
      return cached;
    }
  } catch (e) {
    // Non-fatal
  }

  // 3. Fallback to network fetch if not locally cached
  try {
    const encoded = encodeURIComponent(clean);
    const resp = await fetch(`https://bible-api.com/${encoded}?translation=kjv`);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        const loaded: ParallelVerse[] = data.verses.map((v: any) => ({
          verseNumber: v.verse,
          text: {
            KJV: v.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
            NKJV: v.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
            ESV: v.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
            NASB: v.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
          }
        }));
        DYNAMIC_CHAPTER_CACHE[clean] = loaded;
        DYNAMIC_CHAPTER_CACHE[stripped] = loaded;

        // Persist to IndexedDB for instant subsequent retrieval
        stbaStorage.savePassage(clean, loaded).catch(() => {});
        return loaded;
      }
    }
  } catch (err) {
    console.warn("Async chapter fetch note:", err);
  }

  return null;
}


