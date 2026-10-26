export interface SDABCVolume {
  volNumber: number;
  romanNumeral: string;
  title: string;
  scope: string;
  theme: string;
  books: string[];
}

export const SDABC_VOLUMES: SDABCVolume[] = [
  {
    volNumber: 1,
    romanNumeral: "Vol. 1",
    title: "Genesis to Deuteronomy",
    scope: "Pentateuch & Creation to Sinai",
    theme: "Creation, Fall, Patriarchal Covenant, Sanctuary Shadows, & Moral Law",
    books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]
  },
  {
    volNumber: 2,
    romanNumeral: "Vol. 2",
    title: "Joshua to 2 Kings",
    scope: "Theocracy, Judges & Kingdom",
    theme: "Conquest of Canaan, Period of Judges, United & Divided Monarchy, Prophetic Warnings",
    books: ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings"]
  },
  {
    volNumber: 3,
    romanNumeral: "Vol. 3",
    title: "1 Chronicles to Song of Solomon",
    scope: "Historical Annals & Wisdom Literature",
    theme: "Temple Worship, Messianic Psalms, Divine Wisdom, Ecclesiastes & Sovereignty",
    books: ["1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"]
  },
  {
    volNumber: 4,
    romanNumeral: "Vol. 4",
    title: "Isaiah to Malachi",
    scope: "Major & Minor Prophecy",
    theme: "Messianic Hope, Daniel's Prophetic Milestones (2300 Days & Sanctuary Cleansing), The Remnant",
    books: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]
  },
  {
    volNumber: 5,
    romanNumeral: "Vol. 5",
    title: "Matthew to John",
    scope: "The Four Gospels",
    theme: "Incarnation, Life and Miracles of Christ, Calvary's Atoning Sacrifice, Resurrection & Great Commission",
    books: ["Matthew", "Mark", "Luke", "John"]
  },
  {
    volNumber: 6,
    romanNumeral: "Vol. 6",
    title: "Acts to Ephesians",
    scope: "Early Church & Pauline Epistles",
    theme: "Pentecost, Apostolic Mission, Justification by Faith in Romans, Unity of the Body",
    books: ["Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians"]
  },
  {
    volNumber: 7,
    romanNumeral: "Vol. 7",
    title: "Philippians to Revelation",
    scope: "Pastoral Epistles, Hebrews & The Apocalypse",
    theme: "Christ's High Priestly Ministry in Heavenly Sanctuary, Three Angels' Messages, Second Advent & New Jerusalem",
    books: ["Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"]
  }
];

export interface SDABCVerseNote {
  verseNumber: number;
  text: string;
  headwords: string;
  originalLanguageInsight?: string; // Greek / Hebrew
  commentaryText: string;
  theologicalConnection?: string;
}

export interface SDABCEntry {
  reference: string;
  volumeNumber: number;
  pageRange: string;
  chapterTitle: string;
  historicalContext: string;
  exegeticalSummary: string;
  verses: SDABCVerseNote[];
  egwComments: {
    source: string;
    quote: string;
    theologicalTheme: string;
  }[];
  doctrinalPillars: string[];
  scripturalCrossReferences: string[];
  teachingOutline: {
    intro: string;
    points: string[];
    appeal: string;
  };
}

// Helper to determine which SDABC volume contains a book
export function getVolumeForBook(bookName: string): SDABCVolume {
  const clean = bookName.trim().toLowerCase();
  for (const vol of SDABC_VOLUMES) {
    if (vol.books.some(b => b.toLowerCase() === clean)) {
      return vol;
    }
  }
  return SDABC_VOLUMES[6]; // Default to Volume 7
}

// Rapid 0ms Instant Defaults for Volume switching (Volumes 1 through 7)
export const VOLUME_DEFAULT_REFS: Record<number, { ref: string; book: string; chapter: number; verse: number }> = {
  1: { ref: "Genesis 2:1-3", book: "Genesis", chapter: 2, verse: 1 },
  2: { ref: "Joshua 1:7-9", book: "Joshua", chapter: 1, verse: 7 },
  3: { ref: "Psalms 23:1-6", book: "Psalms", chapter: 23, verse: 1 },
  4: { ref: "Daniel 8:13-14", book: "Daniel", chapter: 8, verse: 14 },
  5: { ref: "John 3:16-17", book: "John", chapter: 3, verse: 16 },
  6: { ref: "Romans 8:1-4", book: "Romans", chapter: 8, verse: 1 },
  7: { ref: "Revelation 14:6-12", book: "Revelation", chapter: 14, verse: 6 },
};

// ==========================================
// PRE-COMPILED AUTHENTIC SDABC REPOSITORY
// Covers core doctrinal pillars of Adventism
// ==========================================
export const PRELOADED_SDABC_DATA: Record<string, SDABCEntry> = {
  "revelation 14:6-12": {
    reference: "Revelation 14:6-12",
    volumeNumber: 7,
    pageRange: "pp. 826–834",
    chapterTitle: "The Three Angels' Messages & The Victorious Remnant",
    historicalContext: 
      "Penned by John on the Isle of Patmos (c. A.D. 95) during the reign of Roman Emperor Domitian. In historicist prophecy and the Adventist theological framework, Revelation 14 represents the absolute climax of the cosmic conflict introduced in Revelation 12:17 and Revelation 13:1-18. The three angels' messages are presented immediately preceding the harvest of the earth (Revelation 14:14-20), symbolizing God's final warning proclamation to the inhabitants of the earth in the antitypical Day of Atonement (Leviticus 16:16-30). SDABC Volume 7 expounds these messages as the restoration of primitive apostolic Christianity and the final gathering of God's remnant before the Second Advent.",
    exegeticalSummary:
      "A systematic threefold divine proclamation that restores the pure everlasting gospel, announces the arrival of the pre-advent investigative judgment (Daniel 7:9-10; Daniel 8:14), exposes the fallen spiritual system of mystical Babylon (Revelation 17:1-6; Revelation 18:1-4), warns against the counterfeit mark of the beast, and defines the character of the sealed remnant who keep the commandments of God and the faith of Jesus (Revelation 14:12).",
    verses: [
      {
        verseNumber: 6,
        text: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people,",
        headwords: "6. Another angel. In the midst of heaven. Everlasting gospel. To preach unto them that dwell on the earth.",
        originalLanguageInsight: "Greek: 'mesouranēma' (mid-heaven) designates the meridian where the sun reaches its zenith—denoting universal visibility and unhindered reach. 'Euangelion aionion' (everlasting gospel) confirms that God's plan of salvation by grace through faith is one and immutable from eternity past (Ephesians 1:4; Titus 1:2).",
        commentaryText: 
          "The symbol of an angel flying in mid-heaven signifies the rapid, elevated, and world-wide proclamation of truth under the divine guidance of heaven. It is 'another' angel in sequence with the heavenly messengers of earlier visions. The gospel is called 'everlasting' because it is God's eternal remedy for sin—first promised in Genesis 3:15, ratified through the Abrahamic covenant in Genesis 12:3 and Galatians 3:8, sealed at Calvary, and maintained unchanged through all dispensations (Hebrews 13:8). There is not one gospel for the Jews and another for the Gentiles; one for the Old Testament and another for the New. It is the same gospel of justifying grace in Christ proclaimed to every nation, kindred, tongue, and people as foretold by our Lord in Matthew 24:14.",
        theologicalConnection: "Justification by Faith as the core of the First Angel's Message (Romans 3:24-26)."
      },
      {
        verseNumber: 7,
        text: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
        headwords: "7. Loud voice. Fear God. Hour of his judgment is come. Worship him that made.",
        originalLanguageInsight: "Greek: 'krisis' (the process of judicial investigation / examination of records), distinguishing it from 'krima' (the execution of the sentence). 'Dote auto doxan' (give Him glory) reflects honoring God in character and body temple (1 Corinthians 6:19-20; 1 Corinthians 10:31).",
        commentaryText: 
          "The 'loud voice' denotes the urgent power of the Holy Spirit accompanying this message in the time of the end. To 'fear God' in biblical terminology means to revere Him, surrender our self-will, and depart from evil (Proverbs 8:13; Ecclesiastes 12:13-14). To 'give glory to Him' calls for a life reflecting His character of love and truth, honoring Him in physical, mental, and spiritual conduct (1 Corinthians 6:19-20; 1 Corinthians 10:31). 'The hour of his judgment is come' employs the Greek aorist tense ('ēlthen')—a present reality when the message sounds, referring to the pre-advent investigative judgment beginning in 1844 at the close of the 2,300 prophetic days (Daniel 8:14; Daniel 7:9-10). The call to 'worship him that made heaven, and earth, and the sea' quotes almost verbatim the Fourth Commandment (Exodus 20:8-11; Genesis 2:1-3), restoring the Seventh-day Sabbath as the divine memorial of creation and seal of God against end-time evolutionary and apostate deceptions.",
        theologicalConnection: "The Pre-Advent Judgment (1844) & The Creation Seventh-day Sabbath Memorial (Exodus 20:8-11)."
      },
      {
        verseNumber: 8,
        text: "And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.",
        headwords: "8. Another angel. Babylon is fallen. The wine of the wrath of her fornication.",
        originalLanguageInsight: "Hebrew root 'Babel' (confusion). Greek: 'peptōken' (is fallen), repeated twice for prophetic certainty (Genesis 41:32; Isaiah 21:9).",
        commentaryText: 
          "The second angel follows the first, sounding historically after the rejection of the first angel's message in the summer of 1844. Babylon represents the apostate religious bodies that have departed from the simplicity of the gospel, united with the state (spiritual fornication), and substituted human traditions (such as Sunday sacredness and the dogma of the natural immortality of the soul) for the commandments of God (Genesis 11:1-9; Isaiah 21:9; Revelation 17:1-6; Revelation 18:1-4). The 'wine' represents her intoxicating, deceptive doctrines that numb spiritual perception and lead the world away from Sola Scriptura (Jeremiah 51:7; 2 Thessalonians 2:9-12).",
        theologicalConnection: "Historicist Separation from Apostate Ecclesiastical Systems (Revelation 18:4)."
      },
      {
        verseNumber: 9,
        text: "And the third angel followed them, saying with a loud voice, If any man worship the beast and his image, and receive his mark in his forehead, or in his hand,",
        headwords: "9. Third angel. Beast and his image. Mark in his forehead, or in his hand.",
        originalLanguageInsight: "Greek: 'charagma' (an engraved stamp, brand of ownership or allegiance). Contrasts with the 'sphragis' (seal of the living God in Revelation 7:2-3).",
        commentaryText: 
          "The third angel presents the most solemn warning in all Holy Writ. The 'beast' represents the papal power of Revelation 13:1-10 and Daniel 7:25. The 'image to the beast' is formed by apostate Protestantism in the United States using civil authority to enforce religious dogmas (Revelation 13:11-18). The mark received in the 'forehead' denotes intellectual assent and conviction; in the 'hand' it signifies compliance for economic survival or social convenience without inward conviction (Exodus 13:9; Deuteronomy 6:8). This stands in direct contrast to the seal of God placed in the foreheads of the faithful (Revelation 7:2-3; Ezekiel 9:4).",
        theologicalConnection: "The Mark of the Beast vs. The Seal of the Living God (Revelation 7:2-3)."
      },
      {
        verseNumber: 10,
        text: "The same shall drink of the wine of the wrath of God, which is poured out without mixture into the cup of his indignation; and he shall be tormented with fire and brimstone in the presence of the holy angels, and in the presence of the Lamb:",
        headwords: "10. Poured out without mixture. Cup of his indignation. Fire and brimstone.",
        originalLanguageInsight: "Greek: 'akratou' (unmingled, undiluted with mercy). 'Basanisthesetai' reflects purification/testing under holy presence, resulting in the eternal destruction of sin (Malachi 4:1-3; Psalm 75:8).",
        commentaryText: 
          "God's judgments in history have always been mingled with mercy. But the final plagues (Revelation 15:1; Revelation 16:1-21) represent judgment unmingled with mercy because probation has permanently closed (Revelation 22:11; Psalm 75:8). The destruction is executed in the presence of the Lamb, demonstrating that divine justice is transparent before the entire universe and that God's holiness consumes sin while preserving righteousness (Philippians 2:10-11; Isaiah 33:14).",
        theologicalConnection: "The Seven Last Plagues and the Final Close of Human Probation (Revelation 16:1-21)."
      },
      {
        verseNumber: 11,
        text: "And the smoke of their torment ascendeth up for ever and ever: and they have no rest day nor night, who worship the beast and his image, and whosoever receiveth the mark of his name.",
        headwords: "11. Ascendeth up for ever and ever. No rest day nor night.",
        originalLanguageInsight: "Greek: 'eis aionas aionon' (unto ages of ages), expressing completeness of destruction, equivalent to Hebrew 'olam' (Isaiah 34:10 regarding Edom, which is completely extinct today).",
        commentaryText: 
          "This passage must be interpreted through the totality of Scripture (Sola Scriptura). The smoke ascending 'for ever' describes the permanent, irrevocable results of the punishment, not endless conscious suffering in an eternal torture chamber. As Jude 7 explains of Sodom and Gomorrha, suffering the vengeance of 'eternal fire' resulted in complete turning to ashes (2 Peter 2:6). God's justice annihilates sin and sinners completely so that affliction shall not rise up the second time (Nahum 1:9; Psalm 37:20). Believers are granted immortality only as a gift through Christ at the resurrection (Romans 6:23; 1 Corinthians 15:51-54; 1 Timothy 6:16).",
        theologicalConnection: "Conditional Immortality and the Biblical View of Hell (Malachi 4:1-3; Romans 6:23)."
      },
      {
        verseNumber: 12,
        text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        headwords: "12. Patience of the saints. Commandments of God. Faith of Jesus.",
        originalLanguageInsight: "Greek: 'hupomonē' (steadfast endurance under trial, holding firm). 'Pistin Iesou' (objective: faith in Jesus; subjective: the personal faith OF Jesus lived out in the believer).",
        commentaryText: 
          "Verse 12 provides the divine portrait of God's remnant church in the last days. 'Patience' ('hupomonē') is the steadfast endurance that sustains them through the time of trouble (Daniel 12:1; Matthew 24:13). They are distinguished by two inseparable characteristics: (1) They keep all Ten Commandments, including the fourth-commandment Sabbath, as an expression of love to Christ (Exodus 20:8-11; John 14:15; 1 John 5:3); (2) They possess the 'faith of Jesus'—not merely a theological belief about Him, but the living, trusting faith that enabled Christ Himself to overcome all temptation and triumph on the cross (Galatians 2:20; Revelation 12:17).",
        theologicalConnection: "The Character and Identity of God's End-Time Remnant (Revelation 12:17; Revelation 14:12)."
      }
    ],
    egwComments: [
      {
        source: "The Great Controversy, p. 605",
        quote: "The Sabbath will be the great test of loyalty, for it is the point of truth especially controverted. When the final test shall be brought to bear upon men, then the line of distinction will be drawn between those who serve God and those who serve Him not.",
        theologicalTheme: "The Sabbath as the Final Covenant Test"
      },
      {
        source: "Selected Messages, book 3, p. 172",
        quote: "The third angel's message is the proclamation of the commandments of God and the faith of Jesus Christ. The commandments of God have been proclaimed, but the faith of Jesus has not been proclaimed by Seventh-day Adventists as of equal importance, the law and the gospel going hand in hand. I cannot find language to express this subject in its fullness.",
        theologicalTheme: "Law and Gospel Going Hand in Hand (1888 Message)"
      },
      {
        source: "Testimonies for the Church, vol. 9, p. 19",
        quote: "In a special sense Seventh-day Adventists have been set in the world as watchmen and light bearers. To them has been entrusted the last warning for a perishing world. On them is shining wonderful light from the Word of God. They have been given a work of the most solemn import—the proclamation of the first, second, and third angels' messages.",
        theologicalTheme: "The Entrusted Mission of the Remnant"
      },
      {
        source: "The Great Controversy, p. 436",
        quote: "The announcement, 'The hour of His judgment is come,' points to the closing work of Christ's ministration for the salvation of men. It heralds a truth which must be proclaimed until the Savior's intercession shall cease and He shall return to the earth to take His people to Himself.",
        theologicalTheme: "The Hour of Judgment and Christ's Closing Ministry"
      },
      {
        source: "Evangelism, p. 190",
        quote: "The proclamation of the first, second, and third angels' messages has been located by the word of inspiration. Not a peg of it is to be removed. No human authority has any more right to change the location of these messages than to substitute the New Testament for the Old.",
        theologicalTheme: "Unchanging Anchor of Historicist Prophecy"
      },
      {
        source: "Testimonies for the Church, vol. 6, p. 17",
        quote: "The three angels of Revelation 14 are represented as flying in the midst of heaven, symbolizing the work of those who proclaim the first, second, and third angels' messages. All are linked together. The chain of truth from the first to the third angel is unbroken.",
        theologicalTheme: "The Threefold Connected Chain of Present Truth"
      },
      {
        source: "Early Writings, p. 254",
        quote: "I was pointed down to the time when the third angel's message was closing. The power of God had rested upon His people; they had accomplished their work and were prepared for the trying hour before them. They had received the latter rain, the refreshing from the presence of the Lord, and the living testimony had been revived.",
        theologicalTheme: "Latter Rain and the Close of the Third Angel's Message"
      }
    ],
    doctrinalPillars: [
      "The Pre-Advent Sanctuary Judgment (1844)",
      "The Seventh-day Sabbath as Memorial of Creation",
      "Justification by Faith & The Faith of Jesus",
      "The Seal of God vs. The Mark of the Beast",
      "The Mortality of the Soul (No Eternal Torment)"
    ],
    scripturalCrossReferences: [
      "Exodus 20:8-11 (The Creator's Holy Sabbath)",
      "Daniel 7:9-14 (The Ancient of Days & Judgment Sat)",
      "Daniel 8:14 (Unto 2300 Days, Then Sanctuary Cleansed)",
      "Revelation 12:17 (Remnant keeping Commandments & Testimony of Jesus)",
      "Romans 3:26-31 (Justification Establishing the Law)"
    ],
    teachingOutline: {
      intro: "Open by contrasting the frantic instability of current world events with the cosmic certainty of God's throne room in Revelation 14.",
      points: [
        "Point 1: The Everlasting Gospel is the sole foundation—God's rescue mission through Jesus' righteousness.",
        "Point 2: The Judgment Hour is good news for the believer—Christ our High Priest vindicates His faithful children.",
        "Point 3: Worship is the core battleground—choosing the Creator's Sabbath over human counterfeits.",
        "Point 4: The Mark of the Beast is a test of loyalty and worship, not an invisible microchip.",
        "Point 5: Remnant discipleship combines unyielding obedience with the gentle, overcoming faith OF Jesus."
      ],
      appeal: "Invite listeners to yield completely to Christ today, taking their stand with the remnant who keep the commandments of God and the faith of Jesus."
    }
  },

  "daniel 8:13-14": {
    reference: "Daniel 8:13-14",
    volumeNumber: 4,
    pageRange: "pp. 840–852",
    chapterTitle: "The 2,300 Days & The Cleansing of the Sanctuary",
    historicalContext:
      "Given to the prophet Daniel in Susa during the third year of King Belshazzar (c. 551 B.C.). The vision of the ram (Medo-Persia), he-goat (Greece), and the exceedingly great little horn power (Rome in pagan and papal phases) culminates with the central time prophecy of the entire Bible: the 2,300 evenings and mornings.",
    exegeticalSummary:
      "The foundational prophetic pillar of the Seventh-day Adventist movement. Explains the Day-Year principle (Numbers 14:34; Ezekiel 4:6), the 457 B.C. starting decree of Artaxerxes I (Ezra 7), and the termination in A.D. 1844 when Christ entered the Most Holy Place of the heavenly sanctuary for the final work of investigative judgment and cleansing.",
    verses: [
      {
        verseNumber: 13,
        text: "Then I heard one saint speaking, and another saint said unto that certain saint which spake, How long shall be the vision concerning the daily sacrifice, and the transgression of desolation, to give both the sanctuary and the host to be trodden under foot?",
        headwords: "13. One saint speaking. How long shall be the vision. The daily. Transgression of desolation.",
        originalLanguageInsight: "Hebrew: 'Palmoni' (the Wonderful Numberer / Christ Himself). 'Ha-tamid' (the continual / daily ministry of Christ).",
        commentaryText: 
          "The question 'How long shall be the vision' inquires not merely about the little horn's depredations, but covers the entire span of the vision ('chazon') from the Medo-Persian ram to the end of time. The 'daily' (tamid) refers to the continual heavenly intercession of Christ which the counterfeit horn power attempts to obscure on earth through a human priesthood and sacrifice.",
        theologicalConnection: "Christ's Continual Heavenly Ministry vs. Earthly Counterfeit Systems."
      },
      {
        verseNumber: 14,
        text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        headwords: "14. Two thousand and three hundred days. Then shall the sanctuary be cleansed.",
        originalLanguageInsight: "Hebrew: 'Ereb boqer' (evening-mornings, referring to creation days / sacrificial cycle). 'Nisdaq' (cleansed, justified, restored to its rightful state, vindicated).",
        commentaryText: 
          "In biblical prophetic reckoning, one symbolic day equals one literal year (Num. 14:34; Eze. 4:6). The 2,300 days are 2,300 literal years. Daniel 9 provides the chronological key: the 70 weeks (490 years) were 'cut off' (chathak) for the Jewish nation from the longer 2,300-year timeline, both starting with the decree to restore and rebuild Jerusalem in 457 B.C. Counting 2,300 years from autumn 457 B.C. brings us with mathematical precision to autumn 1844. At that time, the earthly sanctuary having long ceased, the heavenly sanctuary (Heb. 8:1-2; 9:23) entered its antitypical Day of Atonement, wherein Christ began the work of cleansing the sanctuary records and blotting out the sins of His people.",
        theologicalConnection: "The 1844 Antitypical Day of Atonement & Cleansing of the Heavenly Sanctuary."
      }
    ],
    egwComments: [
      {
        source: "The Great Controversy, p. 409",
        quote: "The scripture which above all others had been both the foundation and the central pillar of the advent faith was the declaration: 'Unto two thousand and three hundred days; then shall the sanctuary be cleansed.'",
        theologicalTheme: "The Central Pillar of Advent Faith"
      },
      {
        source: "The Great Controversy, p. 421",
        quote: "In 1844 our High Priest entered the most holy place, to begin the work of the investigative judgment, and to make atonement for all who are shown to be entitled to its benefits.",
        theologicalTheme: "Christ's Most Holy Place Ministry"
      },
      {
        source: "The Great Controversy, p. 423",
        quote: "As anciently the sins of the people were by faith placed upon the sin offering and through its blood transferred, in figure, to the earthly sanctuary, so in the new covenant the sins of the repentant are by faith placed upon Christ and transferred, in fact, to the heavenly sanctuary.",
        theologicalTheme: "Transfer and Cleansing of Sin Records"
      },
      {
        source: "Early Writings, p. 55",
        quote: "I saw the Father rise from the throne, and in a flaming chariot go into the holy of holies within the veil, and sit down. Then Jesus rose up from the throne... and a cloudy chariot with wheels like flaming fire came to where He was. An angel cried, 'Behold, He cometh!' and Jesus stepped into the chariot and was borne to the holiest, where the Father sat.",
        theologicalTheme: "Vision of the 1844 Heavenly Chariot Movement"
      },
      {
        source: "Selected Messages, book 1, p. 125",
        quote: "The passing of the time in 1844 was a period of great events, opening to our astonished eyes the cleansing of the sanctuary, transpiring in heaven, and having decided relation to God's people upon the earth.",
        theologicalTheme: "1844 Great Disappointment and Discovery of the Sanctuary"
      },
      {
        source: "Testimonies for the Church, vol. 5, p. 575",
        quote: "We are in the day of atonement, and we are to work in harmony with Christ's work of cleansing the sanctuary from the sins of the people. Let no one think that he can harbor self and sin and yet be accepted of God.",
        theologicalTheme: "Living in the Antitypical Day of Atonement"
      }
    ],
    doctrinalPillars: [
      "The 2,300 Prophetic Days Timeline (457 B.C. to 1844)",
      "The Day-Year Principle in Biblical Prophecy",
      "Christ's Most Holy Place High-Priestly Ministry",
      "The Investigative Judgment / Cleansing of Sanctuary",
      "The Vindication of God's Character Before the Universe"
    ],
    scripturalCrossReferences: [
      "Leviticus 16:16-30 (The Typical Day of Atonement)",
      "Daniel 9:24-27 (The 70 Weeks Prophetic Chronometer)",
      "Hebrews 8:1-2 (The True Tabernacle in Heaven)",
      "Hebrews 9:23-28 (Cleansing Heavenly Things with Better Sacrifices)",
      "Revelation 11:19 (The Ark of His Testament Seen in Heaven)"
    ],
    teachingOutline: {
      intro: "Show a timeline chart connecting Daniel 8 and Daniel 9, explaining that God measures time with prophetic perfection.",
      points: [
        "Point 1: The vision covers Medo-Persia, Greece, Rome, and reaches to the time of the end.",
        "Point 2: Daniel 9:24-27 provides the starting anchor: the decree of Artaxerxes I in 457 B.C.",
        "Point 3: 457 B.C. + 2,300 years (accounting for no year zero) lands precisely in A.D. 1844.",
        "Point 4: In 1844, Christ our High Priest entered the Most Holy Place of heaven for the final Day of Atonement.",
        "Point 5: The cleansing of the sanctuary is also the cleansing of our daily character temples."
      ],
      appeal: "Exhort every believer to stand confident in the intercession of Jesus, letting Him cleanse our lives of all sin today."
    }
  },

  "exodus 20:8-11": {
    reference: "Exodus 20:8-11",
    volumeNumber: 1,
    pageRange: "pp. 605–609",
    chapterTitle: "The Fourth Commandment: The Memorial of Creation",
    historicalContext:
      "Spoken audibly by God from the summit of Mount Sinai and inscribed with His own finger on tables of stone (c. 1446 B.C.). The fourth commandment occupies the central position of the Decalogue, linking the first four commandments (our duty to God) with the last six (our duty to fellow man).",
    exegeticalSummary:
      "The Sabbath commandment contains the three essential elements of a royal seal: (1) The name of the Lawgiver: 'The Lord thy God'; (2) His official title: 'Creator / Maker'; (3) His sovereign territory: 'Heaven and earth, the sea, and all that in them is'. Observance of the Seventh-day Sabbath is the eternal memorial of divine creative and redemptive power.",
    verses: [
      {
        verseNumber: 8,
        text: "Remember the sabbath day, to keep it holy.",
        headwords: "8. Remember. Sabbath day. Keep it holy.",
        originalLanguageInsight: "Hebrew: 'Zakor' (infinitive absolute: remember continually, keep in mind). 'Shabbat' (cessation, rest).",
        commentaryText: 
          "The word 'Remember' indicates that the Sabbath was not a new institution first introduced at Sinai, but an ancient memorial instituted at Creation (Gen. 2:1-3) and observed by the patriarchs before Sinai (Ex. 16:22-30). To keep it 'holy' means to set it apart from secular commerce, ordinary labor, and worldly amusement for communion with the Creator.",
        theologicalConnection: "The Edenic Origin and Perpetuity of the Sabbath."
      },
      {
        verseNumber: 9,
        text: "Six days shalt thou labour, and do all thy work:",
        headwords: "9. Six days shalt thou labour.",
        originalLanguageInsight: "Hebrew: 'Ta'abod' (labor, serve).",
        commentaryText: 
          "God blesses honest labor. The commandment honors the rhythm of life: six days of productive activity, followed by sacred rest in God's completed work.",
        theologicalConnection: "The Balance of Diligence and Sacred Rest."
      },
      {
        verseNumber: 10,
        text: "But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates:",
        headwords: "10. The seventh day is the sabbath. Thou shalt not do any work.",
        originalLanguageInsight: "Hebrew: 'Yom hashshebi'i' (the specific, definite seventh day, not merely a seventh part of time).",
        commentaryText: 
          "The commandment does not say 'a sabbath' or 'one day in seven', but specifies 'the seventh day'—the day God rested upon, blessed, and sanctified at Creation. The rest extends to the whole household, domestic animals, and the resident foreigner, teaching universal human dignity and compassion under God's covenant.",
        theologicalConnection: "Definite Seventh-day Sanctification & Social Equality."
      },
      {
        verseNumber: 11,
        text: "For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
        headwords: "11. For in six days the Lord made. Blessed the sabbath day, and hallowed it.",
        originalLanguageInsight: "Hebrew: 'Bara' (divine creation out of nothing). 'Waybarek' (and He blessed), 'wayqaddeshehu' (and He set it apart for sacred use).",
        commentaryText: 
          "Verse 11 grounds the moral obligation of Sabbath observance directly in the literal six-day creation week. The Sabbath is God's enduring bulwark against all forms of idolatry, polytheism, and evolutionary theories. Because God rested, blessed, and hallowed the seventh day, it remains blessed and holy throughout all human generations.",
        theologicalConnection: "Creation Memorial and Divine Seal of the Decalogue."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 336",
        quote: "The Sabbath was not for Israel merely, but for the world. It had been made known to man in Eden, and, like the other precepts of the Decalogue, it is of imperishable obligation.",
        theologicalTheme: "Universal Scope of the Sabbath"
      },
      {
        source: "The Desire of Ages, p. 288",
        quote: "The Sabbath is a sign of Christ's power to make us holy... It is the memorial of His creative power in the beginning, and also of His redemptive power to recreate the soul in His divine image.",
        theologicalTheme: "Sabbath as Sign of Creation & Sanctification"
      },
      {
        source: "The Great Controversy, p. 438",
        quote: "The Sabbath of the fourth commandment is the seal of the living God. It points to God as the Creator, and is the sign of His rightful authority over the beings He has made.",
        theologicalTheme: "The Sabbath as the Seal of the Living God"
      },
      {
        source: "Patriarchs and Prophets, p. 307",
        quote: "The law of God was spoken from Sinai with awful grandeur. The fourth commandment alone contains the name and title of the Lawgiver, declaring Him to be the Maker of heaven and earth.",
        theologicalTheme: "The Decalogue Seal Proclaimed at Sinai"
      },
      {
        source: "Testimonies for the Church, vol. 6, p. 349",
        quote: "The Sabbath is a golden clasp that unites God and His people. But the fourth commandment has been broken. God's holy day has been desecrated; but in this time the breach is being repaired.",
        theologicalTheme: "The Golden Clasp of God and His Covenant Remnant"
      },
      {
        source: "The Great Controversy, p. 437",
        quote: "The Sabbath was hallowed at the creation. As ordained for man, it had its origin when 'the morning stars sang together, and all the sons of God shouted for joy.' Peace was upon the world, for earth was in harmony with heaven.",
        theologicalTheme: "The Creation Memorial of Cosmic Harmony"
      }
    ],
    doctrinalPillars: [
      "The Literal Six-Day Creation Week",
      "The Perpetuity of the Moral Law (The Decalogue)",
      "The Seventh Day as God's Unchangeable Memorial",
      "The Sabbath as Sign of Justification and Sanctification",
      "The Seal of God in the Heart of the Decalogue"
    ],
    scripturalCrossReferences: [
      "Genesis 2:1-3 (Creation Sanctification of the Sabbath)",
      "Exodus 31:13-17 (Sabbath as Perpetual Covenant Sign)",
      "Ezekiel 20:12, 20 (Sign that the Lord Sanctifies His People)",
      "Luke 4:16 (Jesus' Custom of Sabbath Observance)",
      "Revelation 14:7 (Call to Worship the Creator of Heaven, Earth, and Sea)"
    ],
    teachingOutline: {
      intro: "Hold up a royal decree with its seal, showing that the Fourth Commandment is God's royal seal of ownership over the universe.",
      points: [
        "Point 1: God said 'Remember' because He foresaw that mankind would forget.",
        "Point 2: The Sabbath is an Edenic gift before sin ever entered the world.",
        "Point 3: The Sabbath identifies who God is: the Creator of heaven and earth.",
        "Point 4: Jesus is Lord of the Sabbath; He rested in the tomb on the Sabbath after finishing redemption.",
        "Point 5: Sabbath rest is resting in the finished righteousness of Jesus Christ."
      ],
      appeal: "Invite seekers to step out in faith and experience the joy, rest, and blessing of keeping God's holy Seventh-day Sabbath."
    }
  },

  "genesis (book overview)": {
    reference: "Genesis (Book Overview)",
    volumeNumber: 1,
    pageRange: "Vol. 1, pp. 201–218",
    chapterTitle: "Genesis: The Book of Origins, Divine Creation & The Patriarchal Covenants",
    historicalContext:
      "1. Title. The Jews designate the book of Genesis according to its word in the Hebrew text, bereshith, 'in the beginning.' The Jewish Talmud, however, calls it the 'Book of Creation of the World.' The name Genesis, meaning 'origin' or 'source,' has been adopted by English translations from the LXX, where this term was first used to indicate the contents of the book. Its subtitle, 'The First Book of Moses,' was not a part of the original Hebrew text, but was added centuries later.\n\n2. Authorship. Jews and Christians alike have considered Moses, the great lawgiver and leader of the Hebrews at the time of the Exodus, the author of the book of Genesis... Ellen G. White says of Moses' sojourn in Midian: 'Here, under the inspiration of the Holy Spirit, he wrote the book of Genesis' (PP 251).\n\n3. Historical Setting. The book of Genesis was written about 1,500 years before Christ (GC v), while the Hebrews were in bondage in Egypt. It contains a sketch of this world's history covering many centuries. The early chapters of Genesis cannot be placed in a historical setting, as we ordinarily think of history. We have no history of the antediluvian world, except that written by Moses.\n\n4. Theme. Every attentive student of Genesis is aware of the main theme of the book: first, the narration of God's dealings with the faithful few who loved and served Him; and, second, the depth of depravity into which those who had left God and His precepts fell. The book of Genesis is the first permanently recorded divine revelation accorded men.\n\n5. Outline (Canonical Structure from SDABC Vol. 1):\nI. From the Creation of the World to Abraham (1:1 to 11:26)\n  A. The creation of heaven and earth (1:1 to 2:25)\n    1. The six days of creation (1:1–31)\n    2. The institution of the Sabbath (2:1–3)\n    3. Details of man's creation and of the Garden in Eden (2:4–25)\n  B. The history of the Fall and its immediate results (3:1 to 5:32)\n    1. The temptation and Fall (3:1–8)\n    2. The expulsion from the garden (3:9–24)\n    3. Cain and Abel (4:1–15)\n    4. The Cainites (4:16–24)\n    5. The generations from Adam to Noah (4:25 to 5:32)\n  C. The Deluge (6:1 to 9:17)\n  D. From Noah to Abraham (9:18 to 11:26)\nII. The Patriarchs Abraham and Isaac (11:27 to 26:35)\nIII. The Patriarch Jacob (27:1 to 36:43)\nIV. Joseph, a Savior (37:1 to 50:26)",
    exegeticalSummary:
      "The book of Genesis forms the theological foundation of the entire biblical canon. It establishes the literal seven-day Creation week ex nihilo, the institution of the Seventh-day Sabbath as the perpetual memorial of the Creator, the entrance of sin through the deception of the serpent, and the Protoevangelium (Gen. 3:15) revealing Christ the Seed of the woman who crushes the serpent's head.",
    verses: [
      {
        verseNumber: 1,
        text: "In the beginning God created the heaven and the earth.",
        headwords: "1. In the beginning. Created. Heaven and the earth.",
        originalLanguageInsight: "Hebrew: 'Bereshith' (in the beginning). 'Bara'' (created) is used exclusively of divine activity producing absolute novelty and transcendent design.",
        commentaryText:
          "These words remind us of the fact that everything human has a beginning. He alone who sits enthroned the sovereign Lord of time is without beginning or end. Genesis 1:1 affirms that God is before all else and that He is the one and only cause of all else. This verse is the foundation of all right thinking in regard to the material world. Here is set forth the impressive truth that 'in the formation of our world, God was not indebted to pre-existing matter' (8T 258). Pantheism, the ancient heresy that robs God of personality by diffusing Him throughout all the universe, is completely refuted by Gen. 1:1.",
        theologicalConnection: "Creation Ex Nihilo & Divine Sovereignty (Psalm 33:6, 9; Hebrews 11:3)."
      },
      {
        verseNumber: 26,
        text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
        headwords: "26. Let us make man. In our image, after our likeness.",
        originalLanguageInsight: "Hebrew: 'Na'aseh 'adam betsalmenu kidmuthenu' (Plural of divine fullness; 'tselem': shadow, outline, concrete representation; 'demuth': similitude of character).",
        commentaryText:
          "The plural 'Let us make' reflects the eternal council of the Godhead—Father, Son, and Holy Spirit. Man was created not as the product of animal evolution, but by a direct, personal divine fiat. 'Man was to bear God's image, both in outward resemblance and in character' (PP 45). That image was most evident in terms of his spiritual nature: possessing intellect, free moral agency, conscience, and the capacity for loving fellowship with his Maker.",
        theologicalConnection: "The Dignity of Humanity & Purpose of Creation (Colossians 3:10)."
      },
      {
        verseNumber: 3,
        text: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
        headwords: "3. God blessed the seventh day. And sanctified it. Because that in it he had rested.",
        originalLanguageInsight: "Hebrew: 'Waybarek' (He blessed, declared an object of divine favor). 'Wayqaddesh' (sanctified, set apart for sacred communion).",
        commentaryText:
          "The blessing on the seventh day implied that it was thereby declared to be a special object of divine favor and a day that would bring blessing to His creatures. The act of sanctification consisted in a declaration that the day was holy, or set apart for holy purposes. The weekly seventh-day Sabbath was instituted more than two millenniums before the first Israelite was born. Jesus declared: 'The sabbath was made for man' (Mark 2:27). The fact that the Sabbath will still be celebrated in the new earth as a day of worship (Isa. 66:23) is a clear indication that God never intended to have its observance transferred to another day.",
        theologicalConnection: "The Edenic Universality of the Seventh-day Sabbath (Exodus 20:8-11)."
      },
      {
        verseNumber: 15,
        text: "And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.",
        headwords: "15. I will put enmity. Between thy seed and her seed. It shall bruise thy head, and thou shalt bruise his heel.",
        originalLanguageInsight: "Hebrew: ''Ebah' (hostility, opposition). 'Zera'' (singular: the Seed, the Messiah). 'Shuph' (to crush, shatter completely).",
        commentaryText:
          "Here the Lord turns from addressing the literal serpent who spoke to Eve, to pronounce judgment on the old serpent the devil. This judgment, expressed in prophetic language, has ever been understood by the Christian church as a prediction of the coming of the Deliverer (Protoevangelium). The Lord Jesus Christ is styled by pre-eminence 'the seed' (Rev. 12:1–5; cf. Gal. 3:16, 19); it was He who came 'to destroy the works of the devil' (Heb. 2:14; 1 John 3:8). 'Bruise,' shuph, means 'to crush.' It is the head of the serpent that is to be crushed, while the serpent does no more than bruise the heel of the woman's seed.",
        theologicalConnection: "The First Gospel Promise (Protoevangelium) & The Great Controversy."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 251",
        quote: "Here, under the inspiration of the Holy Spirit, he wrote the book of Genesis.",
        theologicalTheme: "Moses' Authorship and Divine Inspiration"
      },
      {
        source: "Testimonies for the Church, vol. 8, p. 258",
        quote: "In the formation of our world, God was not indebted to pre-existing matter. On the contrary, all things, material or spiritual, stood up before the Lord Jehovah at His voice and were created for His own purpose.",
        theologicalTheme: "Creation Ex Nihilo by Divine Fiat"
      },
      {
        source: "Patriarchs and Prophets, p. 45",
        quote: "Man was to bear God's image, both in outward resemblance and in character. Christ alone is 'the express image' of the Father; but man was formed in the likeness of God.",
        theologicalTheme: "Man Formed in the Image and Likeness of God"
      },
      {
        source: "Patriarchs and Prophets, p. 48",
        quote: "God saw that a Sabbath was essential for man, even in Paradise. He needed to lay aside his own interests and pursuits for one day of the seven, that he might more fully contemplate the works of God and meditate upon His power and goodness. He needed a Sabbath to remind him more vividly of God and to awaken gratitude because all that he enjoyed and possessed came from the beneficent hand of the Creator.",
        theologicalTheme: "The Sabbath Essential for Man in Unfallen Paradise"
      },
      {
        source: "The Desire of Ages, p. 281",
        quote: "The Sabbath was not for Israel merely, but for the world. It had been made known to man in Eden, and, like the other precepts of the Decalogue, it is of imperishable obligation... As long as the heavens and the earth endure, the Sabbath will continue as a sign of the Creator's power.",
        theologicalTheme: "The Imperishable Obligation of the Edenic Sabbath"
      },
      {
        source: "Patriarchs and Prophets, pp. 65-66",
        quote: "To man the first intimation of redemption was communicated in the sentence pronounced upon Satan in the garden: 'I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.' This sentence, uttered in the hearing of our first parents, was to them a promise. While it foretold war between man and Satan, it declared that the power of the great adversary would finally be broken.",
        theologicalTheme: "The Sentence on Satan as the First Promise of Redemption"
      },
      {
        source: "The Great Controversy, p. 505",
        quote: "It is the grace that Christ implants in the soul which creates in man enmity against Satan. Without this converting grace and renewing power, man would continue the captive of Satan, a servant ever ready to do his bidding.",
        theologicalTheme: "Enmity Against Sin Imparted Exclusively by Divine Grace"
      }
    ],
    doctrinalPillars: [
      "Literal Six-Day Creation Ex Nihilo (No Pre-existing Matter, 8T 258)",
      "The Edenic Seventh-day Sabbath as Perpetual Memorial of Creation (Mark 2:27)",
      "Sola Scriptura & Divine Inspiration of the Mosaic Record (PP 251)",
      "Wholistic Nature of Man: Dust + Breath of Life = Living Soul (Nephesh Chayyah)",
      "The Great Controversy & Protoevangelium: Seed of the Woman Crushing the Serpent (Gen. 3:15)",
      "Justification by Faith Prefigured in the Patriarchal Covenants (Gen. 15:6; Rom. 4:3)"
    ],
    scripturalCrossReferences: [
      "Exodus 20:8-11 (The Fourth Commandment Grounded in Creation Week)",
      "Mark 2:27-28 (The Sabbath Made for Man, Son of Man Lord of the Sabbath)",
      "Hebrews 4:4, 9-10 (God Rested the Seventh Day, A Sabbath Rest Remains)",
      "John 1:1-3, 14 (In the Beginning Was the Word, Maker of All Things)",
      "Romans 5:12-19 (Adam's Transgression & Christ's Gift of Righteousness)",
      "Galatians 3:16, 29 (To Abraham and His Seed, Which Is Christ)",
      "Revelation 12:1-17 (War in Heaven, Enmity Against the Remnant)",
      "Revelation 14:6-7 (Worship Him That Made Heaven, Earth, Sea & Fountains)",
      "Isaiah 66:22-23 (From One Sabbath to Another in the New Earth)"
    ],
    teachingOutline: {
      intro: "Hold up a Bible and ask: 'Where does our knowledge of who we are, where we came from, and why we rest on the Seventh-day Sabbath begin?' Point directly to Genesis.",
      points: [
        "Genesis reveals God as the self-existent, eternal Creator who spoke all things into being without pre-existing matter.",
        "God crowned the Creation week with the Seventh-day Sabbath, blessing and sanctifying it for all mankind in unfallen Eden.",
        "When man fell, God did not abandon humanity, but immediately announced the Protoevangelium (Gen 3:15)—Christ the Seed who crushes Satan.",
        "Sabbath-keeping and Sola Scriptura anchor our faith against end-time evolutionary and apostate deceptions."
      ],
      appeal: "Anchor your life upon the literal truth of Genesis, worshiping the Creator every Seventh-day Sabbath and trusting in Jesus the promised Seed."
    }
  },

  "exodus (book overview)": {
    reference: "Exodus (Book Overview)",
    volumeNumber: 1,
    pageRange: "Vol. 1, pp. 491–504",
    chapterTitle: "Exodus: The Book of Deliverance, The Law & The Sanctuary",
    historicalContext:
      "1. Title. Like each of the other four books of the Pentateuch, Exodus is designated by the Jews according to the first phrase of the Hebrew text, We’eleh shemoth, “And these are the names.” The name Exodus is a compound of two Greek words meaning “the way out” or “the going out” (of the Israelites from Egypt), and was adopted by English translators from the Vulgate, which in turn took it from the LXX. This term refers, of course, to the central theme of the book. The words, “The Second Book of Moses,” do not appear in the Hebrew text but were added at a later time.\n\n2. Authorship. The question of the authorship of the book of Exodus is closely related to that of all the books of the Pentateuch, and Genesis in particular, of which it is the continuation. The book of Exodus plays an important role in the problem of identifying the author of the Pentateuch, since certain of its statements designate Moses as the author of specific parts of it. Moses, for instance, was to record the battle against the Amalekites “in a book” (ch. 17:14). This, together with Num. 33:2, points to the fact that Moses kept a diary. It is evident from Ex. 24:4 that he wrote down the ordinances contained in chs. 20:21 to 23:33, the “book of the covenant” (ch. 24:7). According to ch. 34:27 he is the author of the revelation recorded in vs. 11–26. The evidence preserved in the book of Exodus itself thus points specifically to Moses as the author (PP 245; PP 251).\n\n3. Historical Setting. Moses’ first book, Genesis, presents a brief outline of the history of God’s chosen ones from the creation of the world to the close of the patriarchal age, a period of many centuries. In its first two chapters, however, Exodus, the continuation of Genesis, covers only about 80 years, and in the remaining 38 chapters a period of not more than one or two years. When Ahmose I, founder of the Eighteenth Dynasty, defeated the Hyksos, the rulers of Thebes became undisputed monarchs of all Egypt. As kings of the Eighteenth Dynasty they not only liberated Egypt but subjugated Nubia and Palestine as well, and built a strong and wealthy empire. It was only natural for those rulers, who “knew not Joseph” (Ex. 1:8), to view with suspicion these strangers, the Israelites, who occupied the land of Goshen in the eastern Delta. Ahmose was followed by Amenhotep I (1546-1525 B.C.). His son Thutmose I (1525-1508 B.C.) was the first king to record the use of Asiatic slaves in the construction of his temples. He was followed by his son Thutmose II (1508-1504 B.C.), after whose death Hatshepsut (1504-1482 B.C.) ruled peacefully for 22 years. It is probable that she became the foster mother of Moses. Thutmose III (1482-1450 B.C.) was probably the Pharaoh from whom Moses fled. His son Amenhotep II (1450-1425 B.C.) fits remarkably well into the role of the Pharaoh of the Exodus. It was not the crown prince but another son, Thutmose IV (1425-1412 B.C.), who followed him, the crown prince having died in the tenth plague.\n\n4. Theme. The chief purpose of Moses in writing Exodus was to describe God’s marvelous intervention on behalf of His chosen people, in delivering them from slavery, and His gracious condescension in entering into covenant relation with them. To show that neither their repeated unfaithfulness nor the opposition of the greatest nation of earth could thwart God’s plan for them, is the theme that runs through the book like a golden thread. The stories of the Exodus speak to the imagination of the young and strengthen the faith of those who are older. They call for confidence in God’s leadership today, and bid us to follow humbly wherever He may lead.\n\n5. Outline (Canonical Structure from SDABC Vol. 1):\nI. The Exodus From Egypt (1:1 to 15:21)\n  A. The sojourning in Egypt (1:1–22)\n  B. Moses’ preparation for leadership (2:1 to 4:31)\n  C. The ten plagues and the Exodus (5:1 to 13:16)\n  D. From Succoth to the Red Sea (13:17 to 15:21)\nII. From the Red Sea to Sinai (15:22 to 18:27)\n  A. The journey to Sinai (15:22 to 17:16)\n  B. Jethro’s visit and counsel (18:1–27)\nIII. At Sinai (19:1 to 40:38)\n  A. The establishment of the covenant (19:1 to 24:18)\n    1. Preparation for the covenant (19:1–25)\n    2. The Decalogue (20:1–17)\n    3. The book of the covenant (20:18 to 23:33)\n    4. Ratification of the covenant (24:1–18)\n  B. The sanctuary and its priesthood (25:1 to 31:18)\n    1. Plans and furniture of the tabernacle (25:1 to 27:21)\n    2. The priesthood and its consecration (28:1 to 29:46)\n    3. The altar of incense, laver, and anointing oil (30:1–38)\n    4. The craftsmen and the Sabbath sign (31:1–18)\n  C. Apostasy and renewal of the covenant (32:1 to 34:35)\n  D. The building and erection of the tabernacle (35:1 to 40:38)",
    exegeticalSummary:
      "The Book of Exodus portrays God's mighty deliverance of Israel from Egyptian bondage, the giving of the moral law (the Decalogue) upon Mount Sinai written with the finger of God, and the establishment of the earthly sanctuary as the dwelling place of God among His people ('Let them make me a sanctuary; that I may dwell among them', Ex. 25:8). In Seventh-day Adventist theology, Exodus reveals the foundational types of Christ's high-priestly ministry, the perpetual obligation of the Fourth-Commandment Seventh-day Sabbath as the covenant sign between God and His people, and the divine pattern of salvation from justification through sanctification.",
    verses: [
      {
        verseNumber: 8,
        text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work... For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
        headwords: "8. Remember the sabbath day. 9. Six days shalt thou labour. 10. Seventh day is the sabbath. 11. For in six days the LORD made heaven and earth.",
        originalLanguageInsight: "Hebrew: 'Zakor' (infinitive absolute used as emphatic imperative: keep continually in remembrance). 'Shabbath' (cessation, sacred rest). 'Qiddesh' (to set apart as holy, consecrated to sacred communion).",
        commentaryText:
          "The Sabbath was not instituted at Sinai, but was only here called to mind, having been ordained at creation (Gen. 2:1-3). The command begins with 'Remember,' pointing back to that which already existed. The Sabbath is here declared to be holy, set apart by God for holy purposes. The reason given for its observance is that God rested on the seventh day from His work of creation and blessed and hallowed it. The Fourth Commandment is thus grounded in the literal six-day creation week and binds all men to worship the Creator.",
        theologicalConnection: "The Decalogue & The Creator's Memorial (Genesis 2:1-3; Revelation 14:7)."
      },
      {
        verseNumber: 8,
        text: "And let them make me a sanctuary; that I may dwell among them.",
        headwords: "8. And let them make me a sanctuary; that I may dwell among them.",
        originalLanguageInsight: "Hebrew: 'Miqdash' (holy place, sanctuary, from qadash, holy). 'Shakanti' (that I may dwell/tabernacle, related to Shekinah, divine presence).",
        commentaryText:
          "God's purpose was to dwell among His people. Sin had separated man from God, but through the sanctuary system, God revealed the plan of salvation and His desire for intimate fellowship. The sanctuary was built according to the heavenly pattern shown to Moses on the mount (Ex. 25:9, 40). It was a shadow and type of the true tabernacle in heaven, where Christ now ministers as our High Priest (Heb. 8:1-5; 9:11, 24).",
        theologicalConnection: "The Heavenly Sanctuary & Earthly Shadow (Hebrews 8:1-5; Revelation 11:19)."
      },
      {
        verseNumber: 14,
        text: "And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you.",
        headwords: "14. I AM THAT I AM. Thus shalt thou say... I AM hath sent me unto you.",
        originalLanguageInsight: "Hebrew: ''Ehyeh 'asher 'ehyeh' (from the root hayah, to be; expressing self-existence, eternal unchangeableness, and absolute fidelity).",
        commentaryText:
          "This sublime name expresses the eternal, self-existent nature of God. He is the uncaused Cause of all things, the One who was, who is, and who is to come. Jesus applied this very title to Himself when He declared, 'Before Abraham was, I AM' (John 8:58), asserting His essential deity and eternal pre-existence with the Father.",
        theologicalConnection: "The Deity of Christ & The Eternal Godhead (John 8:58; Hebrews 13:8)."
      },
      {
        verseNumber: 13,
        text: "And the blood shall be to you for a token upon the houses where ye are: and when I see the blood, I will pass over you, and the plague shall not be upon you to destroy you, when I smite the land of Egypt.",
        headwords: "13. And the blood shall be to you for a token... when I see the blood, I will pass over you.",
        originalLanguageInsight: "Hebrew: 'Dam' (blood of the unblemished lamb). 'Pasachti' (I will pass over with protective, saving mercy).",
        commentaryText:
          "The Passover lamb was a vivid type of Christ, 'our passover' sacrificed for us (1 Cor. 5:7). It was not enough that the lamb be slain; its blood had to be applied to the doorposts. Faith in the shed blood of Jesus is the sole protection against condemnation and death. 'When I see the blood, I will pass over you.'",
        theologicalConnection: "Christ Our Passover & Substitutionary Atonement (1 Corinthians 5:7; 1 Peter 1:18-19)."
      },
      {
        verseNumber: 16,
        text: "Wherefore the children of Israel shall keep the sabbath, to observe the sabbath throughout their generations, for a perpetual covenant. It is a sign between me and the children of Israel for ever: for in six days the LORD made heaven and earth, and on the seventh day he rested, and was refreshed.",
        headwords: "16. Keep the sabbath... perpetual covenant. 17. It is a sign between me and the children of Israel for ever.",
        originalLanguageInsight: "Hebrew: ''Oth' (sign, mark, pledge). 'Berith 'olam' (perpetual, everlasting covenant).",
        commentaryText:
          "The Sabbath is here declared to be a sign of the perpetual covenant between God and His people throughout all their generations. It signifies not only God's creative power, but His sanctifying power (Ex. 31:13: 'that ye may know that I am the LORD that doth sanctify you'). As a memorial of creation and redemption, it endures forever.",
        theologicalConnection: "The Perpetual Sabbath Covenant & Sanctification (Ezekiel 20:12, 20)."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 305",
        quote: "The law was not spoken at this time exclusively for the benefit of the Hebrews. God honored them by making them the guardians and keepers of His law, but it was to be held as a sacred trust for the whole world. The precepts of the Decalogue are adapted to all mankind, and they were given for the instruction and government of all. Ten precepts, brief, comprehensive, and authoritative, cover the duty of man to God and to his fellow man; and all based upon the great fundamental principle of love.",
        theologicalTheme: "The Universal, Perpetual Moral Law of Ten Commandments"
      },
      {
        source: "Patriarchs and Prophets, p. 307",
        quote: "The Sabbath was not for Israel merely, but for the world. It had been made known to man in Eden, and, like the other precepts of the Decalogue, it is of imperishable obligation.",
        theologicalTheme: "The Imperishable Obligation of the Seventh-day Sabbath"
      },
      {
        source: "The Great Controversy, p. 434",
        quote: "The claim that the Fourth Commandment was a Jewish institution abolished at the cross is refuted by the sacred record: 'Remember the Sabbath day, to keep it holy... for in six days the LORD made heaven and earth.'",
        theologicalTheme: "The Fourth Commandment Grounded in Creation Week"
      },
      {
        source: "Patriarchs and Prophets, p. 313",
        quote: "For the building of the sanctuary, great and expensive preparations were necessary... Yet God accepted only freewill offerings. 'Of every man that giveth it willingly with his heart ye shall take My offering' was the divine command.",
        theologicalTheme: "Freewill Offerings and the Pattern of the Sanctuary"
      },
      {
        source: "The Great Controversy, pp. 411-413",
        quote: "The earthly sanctuary was built by Moses according to the pattern shown him in the mount. It was 'a figure for the time then present'... As in vision the apostle John was granted a view of the temple of God in heaven, he beheld there 'the ark of His testament' (Revelation 11:19).",
        theologicalTheme: "The Earthly Tabernacle as Shadow of the Heavenly Sanctuary"
      },
      {
        source: "The Desire of Ages, p. 23",
        quote: "From the days of eternity the Lord Jesus Christ was one with the Father... With solemnity Jesus declared: 'Verily, verily, I say unto you, Before Abraham was, I AM.' (John 8:58; Exodus 3:14).",
        theologicalTheme: "Jesus Christ the Self-Existent 'I AM'"
      },
      {
        source: "Patriarchs and Prophets, p. 277",
        quote: "The Passover was to be both commemorative and typical, not only pointing back to the deliverance from Egypt, but forward to the greater deliverance which Christ was to accomplish in freeing His people from the bondage of sin.",
        theologicalTheme: "The Passover Typology Fulfilled in Christ"
      },
      {
        source: "Testimonies for the Church, vol. 6, p. 38",
        quote: "The Sabbath is a golden clasp that unites God and His people.",
        theologicalTheme: "The Sabbath as Uniting Clasp of Covenant Love"
      }
    ],
    doctrinalPillars: [
      "The Moral Perpetuity of the Ten Commandments (Exodus 20:1-17; Matt 5:17-18; James 2:10-12; Rev 14:12)",
      "The Seventh-day Sabbath as Perpetual Covenant Sign & Memorial of Creation (Exodus 20:8-11; 31:13-17; Mark 2:27)",
      "The Heavenly Sanctuary & Earthly Typology ('Make Me a Sanctuary', Exodus 25:8-9, 40; Heb 8:1-5; 9:1-12)",
      "The Ark of the Covenant, Law & Mercy Seat: Propitiation & Atonement (Exodus 25:10-22; Rev 11:19)",
      "The Passover Lamb & Substitutionary Atonement of Christ (Exodus 12:1-28; 1 Cor 5:7; John 1:29)",
      "Deliverance from Bondage & Justification by Grace (Exodus 6:6-8; 14:13-14; Rev 15:2-3 'Song of Moses and the Lamb')",
      "Sola Scriptura & Divine Inspiration of Moses' Writings (Exodus 17:14; 24:4, 7; 34:27; PP 245, 251)",
      "The Three Angels' Messages Link: Rev 14:7 Quotes Exodus 20:11; Rev 14:12 Remnant Keep the Commandments of God"
    ],
    scripturalCrossReferences: [
      "Genesis 2:1-3 (Creation Rest, Blessing, and Sanctification of the Seventh Day)",
      "Exodus 20:8-11 (The Fourth Commandment Memorializing Creation)",
      "Exodus 25:8-9, 40 (The Sanctuary Pattern Shown in the Mount)",
      "Exodus 31:13, 16-17 (Sabbath as Sign of Sanctification and Perpetual Covenant)",
      "Hebrews 8:1-5 (Christ Minister of the True Heavenly Sanctuary)",
      "Hebrews 9:1-12, 24 (The Earthly Sanctuary Figure of the Heavenly)",
      "1 Corinthians 5:7 (Christ Our Passover Sacrificed for Us)",
      "Matthew 5:17-19 (Think Not That I Am Come to Destroy the Law or the Prophets)",
      "Revelation 11:19 (The Temple of God Opened in Heaven, The Ark of His Testament Seen)",
      "Revelation 14:7 (Worship Him That Made Heaven, Earth, Sea & Fountains)",
      "Revelation 14:12 (Here Are They That Keep the Commandments of God and the Faith of Jesus)",
      "Revelation 15:2-3 (The Song of Moses the Servant of God and the Song of the Lamb)"
    ],
    teachingOutline: {
      intro: "Hold up the Bible opened to Exodus and state: 'Exodus is the story of redemption from slavery, the revelation of God's holy law on Mount Sinai, and the blueprint of His dwelling place in the Sanctuary.'",
      points: [
        "Point 1: God delivers His people by grace through the blood of the Passover Lamb (Exodus 12:13; 1 Cor 5:7).",
        "Point 2: God proclaims His eternal Decalogue with His own voice and writes it with His own finger, anchoring the Seventh-day Sabbath in Creation (Exodus 20:8-11).",
        "Point 3: God commands the building of the Sanctuary so He may dwell among us, foreshadowing Christ's high-priestly ministry in the heavenly sanctuary (Exodus 25:8; Heb 8:1-5).",
        "Point 4: The Sabbath is the perpetual covenant sign that the Lord who created us is the Lord who sanctifies us (Exodus 31:13, 16-17)."
      ],
      appeal: "Surrender to the Deliverer who broke the chains of sin, revere His holy law, and enter into His Sabbath rest as we look toward the heavenly sanctuary."
    }
  },

  "genesis 1:1-31": {
    reference: "Genesis 1:1-31",
    volumeNumber: 1,
    pageRange: "pp. 201–218",
    chapterTitle: "The Creation of Heaven and Earth & The Six Literal Days",
    historicalContext:
      "The book of Genesis was written by Moses about 1,500 years before Christ (GC v), while the Hebrews were in bondage in Egypt. 'Under the inspiration of the Holy Spirit, he wrote the book of Genesis' (PP 251). Genesis 1 opens the sacred canon with a majestic, historical record of the literal six-day creation of the heaven, the earth, plant life, marine life, birds, terrestrial animals, and man formed in the image of God. This divine record directly refutes ancient and modern evolutionary theories, dualism, and pantheism, affirming that God alone is eternal and that the material universe was brought into being by His sovereign fiat.",
    exegeticalSummary:
      "A chronological, sevenfold revelation of God's creative power. Genesis 1:1 affirms that God is before all else and that He is the one and only cause of all else. 'In the formation of our world, God was not indebted to pre-existing matter' (8T 258). Each creation day is defined as a literal solar cycle composed of evening and morning, culminating on the sixth day in the creation of man in the image and likeness of God.",
    verses: [
      {
        verseNumber: 1,
        text: "In the beginning God created the heaven and the earth.",
        headwords: "1. In the beginning. God. Created. The heaven and the earth.",
        originalLanguageInsight: "Hebrew: 'Bereshith' ('in the beginning', absolute temporal beginning). 'Bara'' (created) is used exclusively of divine activity producing absolute novelty. ''Elohim' (plural of majesty and fullness).",
        commentaryText:
          "These words remind us of the fact that everything human has a beginning. He alone who sits enthroned the sovereign Lord of time is without beginning or end. The opening words of Scripture draw a striking contrast between all that is human, temporal, and finite, and that which is divine, eternal, and infinite. Our finite minds cannot think of 'the beginning' without thinking of God. Genesis 1:1 affirms that God is before all else and that He is the one and only cause of all else. This verse is the foundation of all right thinking in regard to the material world. Here is set forth the impressive truth that 'in the formation of our world, God was not indebted to pre-existing matter' (8T 258). Pantheism, the ancient heresy that robs God of personality by diffusing Him throughout all the universe, is also exposed and refuted by Gen. 1:1.",
        theologicalConnection: "Creation Ex Nihilo & Absolute Divine Sovereignty (Hebrews 11:3)."
      },
      {
        verseNumber: 2,
        text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
        headwords: "2. Without form, and void. Darkness was upon the face of the deep. Spirit of God moved.",
        originalLanguageInsight: "Hebrew: 'Tohu wabohu' (unformed and unfilled, waste and empty). 'Merachepheth' (hovering, brooding over with tender, creative energy).",
        commentaryText:
          "'Without form, and void' translates the Hebrew 'tohu wabohu'. The words indicate an unorganized, uninhabited state prior to the creative molding of the six days. The earth was not yet prepared for animal and human life. The 'Spirit of God moved' ('merachepheth') over the face of the waters, actively energizing and sustaining the elements ready to receive the organizing word of God.",
        theologicalConnection: "The Role of the Holy Spirit in Divine Creation (Psalm 104:30)."
      },
      {
        verseNumber: 3,
        text: "And God said, Let there be light: and there was light.",
        headwords: "3. God said. Let there be light: and there was light.",
        originalLanguageInsight: "Hebrew: 'Yehi 'or; wayehi 'or' (terse, sovereign imperative: 'Light, be! And light was').",
        commentaryText:
          "God said. This terse Mosaic declaration, 'God said,' 'and it was so,' is the majestic overtone of the creation anthem. God speaks, and reality responds instantly. Light was called into existence on Day 1 to dispel the primeval darkness and establish the first cycle of day and night.",
        theologicalConnection: "Creation by Divine Word Fiat (Psalm 33:6, 9; 2 Corinthians 4:6)."
      },
      {
        verseNumber: 5,
        text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
        headwords: "5. Evening and the morning were the first day.",
        originalLanguageInsight: "Hebrew: ''Ereb' (evening) and 'boqer' (morning) constitute 'yom 'echad' (day one), establishing the scriptural sunset-to-sunset reckoning of holy time.",
        commentaryText:
          "The scriptural day begins at sunset ('the evening and the morning'). The association of evening and morning repeatedly defines the creation days as literal, consecutive 24-hour periods, not vast geological ages.",
        theologicalConnection: "The Scriptural Sunset-to-Sunset Day Cycle (Leviticus 23:32)."
      },
      {
        verseNumber: 26,
        text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
        headwords: "26. Let us make man. In our image, after our likeness.",
        originalLanguageInsight: "Hebrew: 'Na'aseh 'adam betsalmenu kidmuthenu' ('adam: mankind, earth-born; 'tselem': representation, moral sketch; 'demuth': similitude in character).",
        commentaryText:
          "The plural 'Let us make' reflects the divine consultation of the Godhead. Man was created not as the product of animal descent, but by immediate divine creation. 'Man was to bear God's image, both in outward resemblance and in character' (PP 45). Man possessed intellect, reasoning powers, holy affections, and free moral agency.",
        theologicalConnection: "The Image of God in Humanity (Colossians 3:10; Ephesians 4:24)."
      },
      {
        verseNumber: 27,
        text: "So God created man in his own image, in the image of God created he him; male and female created he them.",
        headwords: "27. In the image of God created he him; male and female created he them.",
        originalLanguageInsight: "Hebrew: 'Zakar uneqebah' (male and female, establishing complementary equality and the divine foundation of holy matrimony).",
        commentaryText:
          "Both man and woman were created in the image of God, sharing equal moral dignity and spiritual responsibility before their Creator. The distinction of male and female was instituted in Paradise before sin.",
        theologicalConnection: "Complementary Equality & The Foundation of Biblical Marriage (Matthew 19:4-6)."
      },
      {
        verseNumber: 31,
        text: "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.",
        headwords: "31. Behold, it was very good. The sixth day.",
        originalLanguageInsight: "Hebrew: 'Tob me'od' (supremely excellent, perfect, lacking nothing).",
        commentaryText:
          "God surveyed the completed work of the six days. There was no disease, no decay, no suffering, no death. Creation was 'very good.' This absolute perfection sets the stage for the holy rest of the Seventh day in Genesis 2:1-3.",
        theologicalConnection: "The Original Goodness of Creation & Non-Evolutionary Origin of Death (Romans 5:12)."
      }
    ],
    egwComments: [
      {
        source: "Testimonies for the Church, vol. 8, p. 258",
        quote: "In the formation of our world, God was not indebted to pre-existing matter. On the contrary, all things, material or spiritual, stood up before the Lord Jehovah at His voice and were created for His own purpose.",
        theologicalTheme: "Creation Ex Nihilo by Divine Command"
      },
      {
        source: "Patriarchs and Prophets, p. 45",
        quote: "Man was to bear God's image, both in outward resemblance and in character. Christ alone is 'the express image' of the Father; but man was formed in the likeness of God. His nature was in harmony with the will of God.",
        theologicalTheme: "The Divine Likeness in Character and Physical Form"
      },
      {
        source: "Patriarchs and Prophets, p. 44",
        quote: "As the earth came forth from the hand of its Maker, it was exceedingly beautiful. Its surface was agreeably diversified with hills and plains, interspersed with noble rivers and lovely lakes.",
        theologicalTheme: "The Pristine Beauty of Unfallen Earth"
      },
      {
        source: "Education, p. 109",
        quote: "The creative energy that called the worlds into existence is still exerted to uphold the universe. It is not by inherent energy that nature performs its work. Nature works under the immediate direction and power of God.",
        theologicalTheme: "Continuous Sustaining Power of the Creator"
      },
      {
        source: "Testimonies to Ministers, p. 243",
        quote: "The Spirit of God was at work in the creation of the world, and that same divine Spirit is at work in the recreation of the human heart, fashioning it anew in the likeness of Christ.",
        theologicalTheme: "Creation and Spiritual Recreation by the Holy Spirit"
      }
    ],
    doctrinalPillars: [
      "Literal Six-Day Creation Ex Nihilo (No Pre-existing Matter)",
      "Sola Scriptura & Divine Inspiration of the Mosaic Record",
      "The Dignity of Humanity Created in the Image of God",
      "The Seven-Day Weekly Cycle Anchored at Creation",
      "Rejection of Theistic Evolution, Pantheism, and Materialism"
    ],
    scripturalCrossReferences: [
      "Exodus 20:11 (For in Six Days the LORD Made Heaven and Earth)",
      "Psalm 33:6, 9 (By the Word of the LORD Were the Heavens Made)",
      "John 1:1-3 (All Things Were Made by Him)",
      "Colossians 1:16-17 (By Him Were All Things Created)",
      "Hebrews 11:3 (Through Faith We Understand Worlds Were Framed by Word of God)",
      "Revelation 14:7 (Worship Him That Made Heaven, Earth, Sea, Fountains)"
    ],
    teachingOutline: {
      intro: "Ask: 'If matter is eternal and evolved by accident, what is your purpose?' Present Genesis 1:1—you are the intentional, loved masterpiece of a personal Creator.",
      points: [
        "In the beginning God created—God is eternal, transcendent, and personal.",
        "God created ex nihilo—speaking light and life into existence by His word.",
        "God made man in His own image—giving mankind dignity, purpose, and moral accountability.",
        "The six literal days culminated in God declaring all things 'very good.'"
      ],
      appeal: "Bow before the Creator of heaven and earth, surrendering your heart to Him who makes all things new."
    }
  },

  "genesis 2:1-3": {
    reference: "Genesis 2:1-3",
    volumeNumber: 1,
    pageRange: "pp. 219–224",
    chapterTitle: "The Institution of the Seventh-Day Sabbath in Eden",
    historicalContext:
      "Penned by Moses under divine inspiration during his sojourn in Midian (c. 1500 B.C., PP 251; GC v). Genesis 2:1-3 forms the unbroken crown and climax of the creation week narrative of chapter 1. Verse 1, in solemn retrospect, links the work of the preceding six days with the Sabbath rest that followed. The Sacred Record closely relates the weekly Sabbath to God's completed work of creation and His resting on the seventh day, just as the fourth commandment of the Decalogue does (Exodus 20:8-11). The weekly seventh-day Sabbath was instituted more than two millenniums before the first Israelite was born, ordained in Eden as a universal memorial of creation for all mankind.",
    exegeticalSummary:
      "A threefold divine act inaugurates the Sabbath: God finished His work, God rested (shabath), and God blessed and sanctified (qadash) the seventh day. God did not rest because of exhaustion or weariness (Isa. 40:28), but ceased from previous creative activity as a divine exemplar for man. The Sabbath was sanctified—set apart as holy time—for the perpetual blessing, worship, and spiritual communion of the human race across all generations and into the new earth (Isa. 66:22-23; Mark 2:27).",
    verses: [
      {
        verseNumber: 1,
        text: "Thus the heavens and the earth were finished, and all the host of them.",
        headwords: "1. Were finished. Host of them.",
        originalLanguageInsight: "Hebrew: 'Waykullu' (and they were completed/brought to perfection). 'Ṣaba'' (host, ordered array of all created entities in heaven and earth).",
        commentaryText:
          "The first three verses of the second chapter are actually an unbroken continuation of the creation narrative of the first chapter. Verse 1, in solemn retrospect, links the work of the preceding six days with the Sabbath rest that followed. When God 'ended his work' He left no unfinished business (see Heb. 4:3). The word 'host,' ṣaba', here denotes all created things standing in harmonious, perfected order.",
        theologicalConnection: "The Completed Work of Creation (Hebrews 4:3-4)."
      },
      {
        verseNumber: 2,
        text: "And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.",
        headwords: "2. On the seventh day. He rested. From all his work.",
        originalLanguageInsight: "Hebrew: 'Shabath' (to cease, desist, rest from previous activity). 'Yekal' (had finished / brought to consummation).",
        commentaryText:
          "The verb 'rested,' shabath, means literally 'to cease' from labor or activity (see Gen. 8:22; Job 32:1). As a human artificer completes his work when he has brought it up to his ideal, and thus ceases to work upon it, so in an infinitely higher sense God completed the creation of the world by ceasing to produce anything new, and then 'rested.' God did not rest because He needed it (see Isa. 40:28). Therefore God's rest was the result of neither exhaustion nor fatigue, but a cessation from previous occupation. The Decalogue itself states plainly that God, having worked six days, rested on the seventh day of creation week (Ex. 20:11). The six creation days were earthly days of ordinary duration; in the absence of any clear light to the contrary, we must understand the seventh in the same way (Ex. 20:11; 31:17).",
        theologicalConnection: "The Divine Exemplar for Human Sabbath Rest (Exodus 20:11; Exodus 31:17)."
      },
      {
        verseNumber: 3,
        text: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
        headwords: "3. God blessed the seventh day. And sanctified it. Because that in it he had rested.",
        originalLanguageInsight: "Hebrew: 'Waybarek' (He blessed, declared an object of divine favor). 'Wayqaddesh' (sanctified, set apart for holy, dedicated purposes).",
        commentaryText:
          "An explanation of the meaning and importance of this day of rest is added. Here the Sacred Record closely relates the weekly Sabbath to God's work of creation and His resting on the seventh day, just as the fourth commandment does. The blessing on the seventh day implied that it was thereby declared to be a special object of divine favor and a day that would bring blessing to His creatures. And sanctified it: The act of sanctification consisted in a declaration that the day was holy, or set apart for holy purposes. The weekly seventh-day Sabbath has frequently been considered an institution of the Jewish dispensation, but the Inspired Record declares that it was instituted more than two millenniums before the first Israelite was born. We have, furthermore, the word of Jesus declaring, 'The sabbath was made for man' (Mark 2:27), which indicates clearly that this institution was not ordained for the Jews only but for all mankind as well. The fact that the Sabbath will still be celebrated in the new earth as a day of worship (Isa. 66:23) is a clear indication that God never intended to have its observance transferred to another day. The weekly Sabbath day is the memorial of creation.",
        theologicalConnection: "The Edenic Universality & Perpetual Sanctity of the Seventh-day Sabbath (Mark 2:27; Isaiah 66:23)."
      },
      {
        verseNumber: 7,
        text: "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
        headwords: "7. Formed man of the dust. Breathed into his nostrils. Living soul.",
        originalLanguageInsight: "Hebrew: 'Yatsar' (molded as clay). 'Nishmat chayyim' (breath of lives). 'Nephesh chayyah' (living creature / being).",
        commentaryText:
          "Man did not possess an immortal soul infused into a physical body. Rather, the dust of the ground animated by the divine breath of life produced a living soul ('nephesh chayyah'). When the breath of life returns to God, the living soul ceases to exist until the resurrection (Eccl. 12:7; 1 Cor. 15:45). This fundamental biblical truth anchors Seventh-day Adventist conditional immortality.",
        theologicalConnection: "Wholistic Biblical Anthropology & Conditional Immortality (Genesis 3:19; Ecclesiastes 12:7)."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 48",
        quote: "God saw that a Sabbath was essential for man, even in Paradise. He needed to lay aside his own interests and pursuits for one day of the seven, that he might more fully contemplate the works of God and meditate upon His power and goodness. He needed a Sabbath to remind him more vividly of God and to awaken gratitude because all that he enjoyed and possessed came from the beneficent hand of the Creator.",
        theologicalTheme: "The Sabbath Essential for Man in Unfallen Paradise"
      },
      {
        source: "Patriarchs and Prophets, p. 47",
        quote: "After resting upon the seventh day, God sanctified it, or set it apart, as a day of rest for man. Following the example of the Creator, man was to rest upon this sacred day, that as he should look upon the heavens and the earth, he might reflect upon God's great work of creation.",
        theologicalTheme: "Divine Pattern and Exemplar for Sacred Rest"
      },
      {
        source: "The Desire of Ages, p. 281",
        quote: "The Sabbath was not for Israel merely, but for the world. It had been made known to man in Eden, and, like the other precepts of the Decalogue, it is of imperishable obligation... As long as the heavens and the earth endure, the Sabbath will continue as a sign of the Creator's power.",
        theologicalTheme: "Imperishable Obligation of the Edenic Rest Day"
      },
      {
        source: "The Desire of Ages, p. 283",
        quote: "As long as the heavens and the earth endure, the Sabbath will continue as a sign of the Creator's power. And when Eden shall bloom on earth again, God's holy rest day will be honored by all beneath the sun.",
        theologicalTheme: "The Sabbath Honored Throughout Eternity in the New Earth"
      },
      {
        source: "The Great Controversy, p. 438",
        quote: "By keeping the Sabbath, man shows that he acknowledges God as his Creator and righteous Sovereign; he pledges his allegiance to the government of God.",
        theologicalTheme: "The Sabbath as a Pledge of Allegiance to the Creator"
      },
      {
        source: "Testimonies for the Church, vol. 8, p. 197",
        quote: "The Sabbath is a golden clasp that unites God and His people.",
        theologicalTheme: "The Golden Clasp of Covenant Communion"
      },
      {
        source: "SDABC Volume 1, p. 224 (Appendix References)",
        quote: "Gen. 2:1-3: GC 455; PK 180; PP 47, 336; 9T 212. Gen. 2:2: GC 453; ML 140. Gen. 2:3: DA 281; MB 99; 4T 147, 247. Gen. 2:7: MH 415; PP 56; 2T 300; 8T 264.",
        theologicalTheme: "Official SDABC Chapter 2 Ellen G. White Cross-Reference Index"
      }
    ],
    doctrinalPillars: [
      "The Edenic Seventh-day Sabbath as Perpetual Memorial of Creation",
      "Literal Seventh-Day Rest Instituted Prior to Sin",
      "The Universality of the Sabbath for All Mankind (Mark 2:27)",
      "Wholistic Nature of Man: Dust + Breath of Life = Living Soul (Nephesh Chayyah)",
      "The Eternal Celebration of the Sabbath in the New Earth (Isaiah 66:22-23)"
    ],
    scripturalCrossReferences: [
      "Exodus 20:8-11 (Remember the Sabbath Day, for in Six Days the LORD Made Heaven and Earth)",
      "Exodus 31:16-17 (A Perpetual Covenant and Sign Between Me and the Children of Israel Forever)",
      "Mark 2:27-28 (The Sabbath Was Made for Man, and Not Man for the Sabbath)",
      "Hebrews 4:4, 9-10 (For He Spake in a Certain Place of the Seventh Day on This Wise)",
      "Isaiah 58:13-14 (If Thou Turn Away Thy Foot from the Sabbath, from Doing Thy Pleasure)",
      "Isaiah 66:22-23 (From One Sabbath to Another, Shall All Flesh Come to Worship)",
      "Matthew 24:20 (Pray Ye That Your Flight Be Not in the Winter, Neither on the Sabbath Day)",
      "Revelation 14:7 (Worship Him That Made Heaven, and Earth, and the Sea, and the Fountains)"
    ],
    teachingOutline: {
      intro: "Display a ring or covenant gift: 'Before sin, before pain, before death, God placed a palace of time in our world—the holy Seventh-day Sabbath.'",
      points: [
        "God finished His work on the sixth day and rested on the seventh—setting a divine exemplar of sacred rest.",
        "God blessed and sanctified the seventh day—making it holy time for spiritual fellowship and reflection.",
        "The Sabbath was made for all humanity in Eden more than 2,000 years before Abraham or Israel.",
        "The Sabbath remains God's unchangeable sign of creative and redemptive power, celebrated into the new earth."
      ],
      appeal: "Accept God's invitation to enter into His holy Sabbath rest, worshiping the Creator who sanctified the seventh day for your joy."
    }
  },

  "genesis 3:1-15": {
    reference: "Genesis 3:1-15",
    volumeNumber: 1,
    pageRange: "pp. 225–238",
    chapterTitle: "The Fall of Man, The Great Controversy & The Protoevangelium",
    historicalContext:
      "Recorded by Moses under the guidance of the Holy Spirit (PP 251). Genesis 3 documents the catastrophic entrance of sin into our world through the deception of the serpent, the tragic Fall of our first parents in Eden, and the immediate proclamation of divine redemption. In the Seventh-day Adventist theological framework, Genesis 3:15 is recognized as the Protoevangelium—the first gospel promise—announcing the cosmic struggle between Christ and Satan (the Great Controversy) and guaranteeing the ultimate triumph of the Seed of the woman over the serpent at the cross of Calvary.",
    exegeticalSummary:
      "The narrative traces the subtle temptation of the serpent questioning God's word ('Yea, hath God said?'), the first lie claiming natural immortality ('Ye shall not surely die'), the transgression of eating the forbidden fruit, and God's compassionate pursuit of the fallen couple ('Where art thou?'). In Genesis 3:15, God pronounces judgment upon the serpent, establishing divine enmity against Satan and prophesying that the Seed of the woman (Christ) would crush the serpent's head, though His own heel would be bruised in the conflict.",
    verses: [
      {
        verseNumber: 1,
        text: "Now the serpent was more subtil than any beast of the field which the LORD God had made. And he said unto the woman, Yea, hath God said, Ye shall not eat of every tree of the garden?",
        headwords: "1. Now the serpent was more subtil. Yea, hath God said?",
        originalLanguageInsight: "Hebrew: ''Arum' (prudent, crafty, shrewd). Contrasts with ''arummin' (naked, unashamed) in Gen. 2:25.",
        commentaryText:
          "Satan chose the serpent as his medium to deceive Eve. The strategy of the enemy began by casting doubt upon the plain declaration of God's word: 'Yea, hath God said?' He insinuated that God was restrictive, arbitrary, and withholding good things from His creatures.",
        theologicalConnection: "The Origin of Deception in the Great Controversy (Revelation 12:9; 2 Corinthians 11:3)."
      },
      {
        verseNumber: 4,
        text: "And the serpent said unto the woman, Ye shall not surely die:",
        headwords: "4. Ye shall not surely die.",
        originalLanguageInsight: "Hebrew: 'Lo'-moth temuthun' (emphatic denial: 'Dying, ye shall not die!').",
        commentaryText:
          "The first lie recorded in human history: 'Ye shall not surely die.' Satan flatly contradicted God's word. This falsehood became the foundational dogma of spiritualism, paganism, and the unbiblical theory of the natural immortality of the soul. God had plainly declared that transgression of His law brings death (Gen. 2:17; Rom. 6:23).",
        theologicalConnection: "The First Lie & Biblical Conditional Immortality (Ezekiel 18:4; 1 Timothy 6:16)."
      },
      {
        verseNumber: 9,
        text: "And the LORD God called unto Adam, and said unto him, Where art thou?",
        headwords: "9. Where art thou?",
        originalLanguageInsight: "Hebrew: ''Ayyekah' (a tender cry of seeking love, not an inquisitorial interrogation).",
        commentaryText:
          "God did not wait for the guilty pair to seek Him; in redeeming love He came seeking them. 'Where art thou?' was not asked because God was ignorant of Adam's hiding place, but to awaken in Adam a realization of what he had lost through sin and his desperate need of divine mercy.",
        theologicalConnection: "The Seeking Love of God for the Lost Sinner (Luke 19:10)."
      },
      {
        verseNumber: 15,
        text: "And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.",
        headwords: "15. I will put enmity. Between thy seed and her seed. It shall bruise thy head, and thou shalt bruise his heel.",
        originalLanguageInsight: "Hebrew: ''Ebah' (hostility, active enmity). 'Zera'' (singular: the Seed, Christ the Deliverer). 'Shuph' (to crush, shatter completely).",
        commentaryText:
          "Here the Lord turns from addressing the literal serpent who spoke to Eve, to pronounce judgment on the old serpent the devil. This judgment, expressed in prophetic language, has ever been understood by the Christian church as a prediction of the coming of the Deliverer. Reference is made to the agelong struggle between Satan's 'seed' or followers (John 8:44; Acts 13:10; 1 John 3:10) and the woman's seed. The Lord Jesus Christ is styled by pre-eminence 'the seed' (Rev. 12:1–5; cf. Gal. 3:16, 19); it was He who came 'to destroy the works of the devil' (Heb. 2:14; 1 John 3:8). It shall bruise thy head. 'Bruise,' shuph. This word means 'to crush' or 'to lie in wait for.' It is evident that crushing the head is far more serious than crushing the heel. It is important to notice that although the enmity foretold is to be between the seed of the woman and that of the serpent, it is the head of the serpent and not its seed that is to be crushed. In retaliation, the serpent will have been able to do no more than to bruise the heel of the woman's seed. The 'seed' is put in the singular, indicating, not that a multitude of descendants of the woman jointly shall be engaged in crushing the serpent's head, but rather that a single individual will accomplish this.",
        theologicalConnection: "The Protoevangelium: The Everlasting Gospel of Christ's Triumph (Galatians 3:16; Romans 16:20)."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, pp. 65-66",
        quote: "To man the first intimation of redemption was communicated in the sentence pronounced upon Satan in the garden: 'I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.' This sentence, uttered in the hearing of our first parents, was to them a promise. While it foretold war between man and Satan, it declared that the power of the great adversary would finally be broken.",
        theologicalTheme: "The Protoevangelium as the Promise of the Redeemer"
      },
      {
        source: "The Great Controversy, p. 505",
        quote: "It is the grace that Christ implants in the soul which creates in man enmity against Satan. Without this converting grace and renewing power, man would continue the captive of Satan, a servant ever ready to do his bidding. But the new principle in the soul creates conflict where hitherto had been peace.",
        theologicalTheme: "Enmity Against Sin Imparted Exclusively by Divine Grace"
      },
      {
        source: "The Desire of Ages, p. 115",
        quote: "Christ was to pierce the head of the serpent, while His own heel was bruised. At the cross the enemy of souls was defeated, and the everlasting covenant of redemption was confirmed.",
        theologicalTheme: "The Decisive Triumph of Calvary over the Serpent"
      },
      {
        source: "Patriarchs and Prophets, p. 60",
        quote: "The law of God existed before man was created. It was adapted to the condition of holy beings; even angels were governed by it. There was not a commandment altered or relaxed because of man's transgression.",
        theologicalTheme: "The Perpetuity and Unchangeable Holiness of God's Law"
      },
      {
        source: "SDABC Volume 1, p. 238 (Appendix References)",
        quote: "Gen. 3:1: DA 118; GC 505, 531; PP 53. Gen. 3:4: EW 218; GC 533, 538; PP 96. Gen. 3:15: AA 222; DA 31, 52, 103, 115, 578, 663; Ed 27; EW 178; GC 505, 507; PK 681, 701; PP 65, 77, 370; 9T 283.",
        theologicalTheme: "Official SDABC Chapter 3 Ellen G. White Cross-Reference Index"
      }
    ],
    doctrinalPillars: [
      "The Great Controversy Between Christ and Satan",
      "The Protoevangelium: The First Gospel Promise (Genesis 3:15)",
      "Justification and Enmity Imparted by Converting Grace Alone (GC 505)",
      "The Perpetuity of God's Moral Law Unaltered by the Fall",
      "Biblical Conditional Immortality (Refuting 'Ye Shall Not Surely Die')"
    ],
    scripturalCrossReferences: [
      "Romans 16:20 (And the God of Peace Shall Bruise Satan Under Your Feet Shortly)",
      "Galatians 3:16, 19 (Now to Abraham and His Seed Were the Promises Made; Which Is Christ)",
      "Hebrews 2:14 (That Through Death He Might Destroy Him That Had the Power of Death, the Devil)",
      "1 John 3:8 (For This Purpose the Son of God Was Manifested, That He Might Destroy Works of Devil)",
      "Revelation 12:7-17 (And There Was War in Heaven; Michael and His Angels Fought Against Dragon)",
      "Revelation 20:1-3, 10 (And the Devil That Deceived Them Was Cast into the Lake of Fire and Brimstone)"
    ],
    teachingOutline: {
      intro: "Hold up two opposing banners or symbols: 'Genesis 3 explains why our world is broken, why we struggle with sin, and how God provided the cure in the Seed of the woman.'",
      points: [
        "Satan tempted Eve by doubting God's word and lying about death ('Ye shall not surely die').",
        "Sin brought guilt, alienation, and death into our world.",
        "God immediately intervened in grace, promising that the Seed of the woman (Jesus) would crush the serpent's head.",
        "Through Christ, we receive grace to hate sin and share in His final victory over the devil."
      ],
      appeal: "Put your trust in Jesus Christ, the promised Seed, allowing His grace to crush sin in your heart and give you eternal life."
    }
  },

  "hebrews 8:1-6": {
    reference: "Hebrews 8:1-6",
    volumeNumber: 7,
    pageRange: "pp. 444–452",
    chapterTitle: "The Heavenly Sanctuary & The Superior Priesthood of Christ",
    historicalContext:
      "Written to Hebrew believers facing persecution and the temptation to return to the fading Levitical rituals of the Jerusalem temple (c. A.D. 63-67). Paul establishes that the earthly shadow has been superseded by the eternal reality of Christ's high priestly ministry in heaven.",
    exegeticalSummary:
      "The centerpiece ('kephalaion') of Hebrews is that we have a living High Priest seated at the right hand of the Majesty in the heavens, ministering in the true tabernacle pitched by God and not man.",
    verses: [
      {
        verseNumber: 1,
        text: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens;",
        headwords: "1. This is the sum. We have such an high priest. Set on the right hand.",
        originalLanguageInsight: "Greek: 'kephalaion' (the chief point, the crown, the overarching summit). 'Toiouton' (such a glorious, sinless Priest).",
        commentaryText: 
          "The 'sum' or chief point of all the apostle's arguments is the magnificent reality of Christ's present, active priesthood in heaven. Unlike the dying Aaronite priests who stood ministering repeatedly, Christ has accomplished the once-for-all sacrifice and is seated with the Father in celestial glory, continually making intercession for believers.",
        theologicalConnection: "The Reality of Christ's Living Heavenly Intercession."
      },
      {
        verseNumber: 2,
        text: "A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
        headwords: "2. Minister of the sanctuary. True tabernacle.",
        originalLanguageInsight: "Greek: 'leitourgos' (public minister, officiant). 'Hagion' (the holy places/sanctuary). 'Alēthinē' (real, genuine, original, as opposed to copy/shadow).",
        commentaryText: 
          "The earthly tabernacle built by Moses in the wilderness was only a miniature copy ('typos') of the grand heavenly temple where God's throne is established. Christ ministers not in an earthly building made with human hands, but in the great original sanctuary of the universe.",
        theologicalConnection: "The Heavenly Sanctuary as the Great Original."
      }
    ],
    egwComments: [
      {
        source: "The Great Controversy, p. 415",
        quote: "The sanctuary in heaven, in which Jesus ministers in our behalf, is the great original, of which the sanctuary built by Moses was a copy.",
        theologicalTheme: "The True Sanctuary in Heaven"
      },
      {
        source: "The Great Controversy, p. 417",
        quote: "The holy places of the sanctuary in heaven are represented by the two apartments in the sanctuary on earth. As in vision the apostle John was granted a view of the temple of God in heaven, he beheld there 'seven lamps of fire burning before the throne.'",
        theologicalTheme: "Two Apartments of the Heavenly Temple"
      },
      {
        source: "Patriarchs and Prophets, p. 357",
        quote: "The sacrificial service was directed to Christ's death; the ministration of the priests pointed forward to His heavenly intercession. The earthly sanctuary was a figure for the time then present.",
        theologicalTheme: "Earthly Shadows Pointing to Heavenly Reality"
      },
      {
        source: "Early Writings, p. 251",
        quote: "Jesus entered the most holy place of the heavenly sanctuary in 1844, at the end of the 2,300 days of Daniel 8, to make a final atonement for all who could be benefited by His mediation.",
        theologicalTheme: "Christ's Most Holy Place Final Mediation"
      },
      {
        source: "Selected Messages, book 1, p. 232",
        quote: "Christ's ministration in the heavenly sanctuary is the foundation of our faith. We are to look to Jesus, our High Priest, who ever liveth to make intercession for us.",
        theologicalTheme: "The Heavenly Sanctuary as Anchor of Faith"
      },
      {
        source: "The Desire of Ages, p. 166",
        quote: "The true tabernacle is the church, which the Lord pitched, and not man. Every soul that receives Christ becomes a temple for the indwelling of the Holy Spirit.",
        theologicalTheme: "The Heart as Sanctuary for the Indwelling Spirit"
      }
    ],
    doctrinalPillars: [
      "The Reality of the Heavenly Sanctuary",
      "Christ Our High Priest and Sole Mediator",
      "The Superiority of the New Covenant"
    ],
    scripturalCrossReferences: [
      "Exodus 25:8-9",
      "Hebrews 9:23-28",
      "Daniel 8:14"
    ],
    teachingOutline: {
      intro: "Compare an architectural blueprint to a completed skyscraper: the earthly tabernacle was the blueprint; Christ in heaven is the living reality.",
      points: [
        "We have a living Priest who understands all our infirmities.",
        "He ministers in the genuine sanctuary pitched by the Lord.",
        "His mediation guarantees full pardon, transforming grace, and eternal victory."
      ],
      appeal: "Look up from earthly disappointments to the heavenly sanctuary where Jesus lives to intercede for you."
    }
  },

  // VOLUME 2: JOSHUA TO 2 KINGS (Preloaded Canonical Anchor)
  "joshua 1:7-9": {
    reference: "Joshua 1:7-9",
    volumeNumber: 2,
    pageRange: "pp. 165–172",
    chapterTitle: "Joshua's Covenant Commission: Courage in the Law of God",
    historicalContext:
      "Recorded at the plains of Moab adjacent to Jordan (c. 1406 B.C.) following the death of Moses. Leadership of the covenant people passes to Joshua the son of Nun under direct divine commissioning.",
    exegeticalSummary:
      "A divine mandate uniting courageous leadership with unyielding devotion to God's revealed Torah. Prosperity and success are conditioned upon meditating on the Word day and night and turning not to the right hand or the left.",
    verses: [
      {
        verseNumber: 7,
        text: "Only be thou strong and very courageous, that thou mayest observe to do according to all the law, which Moses my servant commanded thee: turn not from it to the right hand or to the left, that thou mayest prosper whithersoever thou goest.",
        headwords: "7. Strong and very courageous. Observe to do according to all the law. Turn not from it.",
        originalLanguageInsight: "Hebrew: 'Chazaq ve'emats' (be firm and resolute in character). 'Torah' (divine instruction, covenant law).",
        commentaryText: 
          "True courage in the biblical economy is not physical recklessness, but moral fidelity to God's commandments in the face of spiritual opposition and popular custom. God promises prosperity not through worldly expediency, but through strict alignment with His moral law.",
        theologicalConnection: "Obedience to the Divine Law as the Condition of Blessing."
      },
      {
        verseNumber: 8,
        text: "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.",
        headwords: "8. Book of the law shall not depart. Meditate day and night. Good success.",
        originalLanguageInsight: "Hebrew: 'Hagita' (meditate, murmur in reflection, ponder deeply). 'Maskil' (have good spiritual insight and true success).",
        commentaryText: 
          "The 'book of the law' was to be continually spoken, pondered, and obeyed. Biblical meditation is not emptying the mind, but filling the intellect and heart with God's inspired statutes.",
        theologicalConnection: "Sola Scriptura and the Transformative Power of God's Word."
      },
      {
        verseNumber: 9,
        text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
        headwords: "9. Have not I commanded thee? The LORD thy God is with thee.",
        originalLanguageInsight: "Hebrew: 'Al-ta'arots' (do not tremble or be shattered). 'Immeka' (with thee in covenant companionship).",
        commentaryText: 
          "The ultimate remedy for human fear and discouragement is the sovereign presence of God. When a disciple steps forward in obedience to divine command, the Almighty stands with them as their defense.",
        theologicalConnection: "The Sustaining Presence of God in the Remnant's Mission."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 483",
        quote: "Joshua had received the promise that God would be with him, but the condition of success was unwavering fidelity to the divine law. He was not to turn from it to the right hand or to the left.",
        theologicalTheme: "Fidelity to the Law as Condition of Success"
      },
      {
        source: "Prophets and Kings, p. 175",
        quote: "The secret of success is union of the human will with the divine purpose. When we are determined to follow the path of duty at whatever cost, God's mighty angels encamp round about us.",
        theologicalTheme: "Moral Courage and Angelic Deliverance"
      },
      {
        source: "Testimonies for the Church, vol. 4, p. 156",
        quote: "Meditation upon the Word of God gives moral stamina and spiritual wisdom for every emergency. Those who feast on the Scriptures are fortified against the deceptions of Satan.",
        theologicalTheme: "Daily Scriptural Meditation as Spiritual Defense"
      },
      {
        source: "Conflict and Courage, p. 112",
        quote: "The Lord has given us no guarantee that the path of duty will be free from obstacles, but He has promised divine presence that overcomes all fear.",
        theologicalTheme: "God's Abiding Presence Dispelling Fear"
      },
      {
        source: "Steps to Christ, p. 70",
        quote: "Consecrate yourself to God in the morning; make this your very first work. Let your prayer be, 'Take me, O Lord, as wholly Thine.'",
        theologicalTheme: "Morning Consecration and Surrender"
      },
      {
        source: "Patriarchs and Prophets, p. 484",
        quote: "Faith in God's promises made Joshua a hero. We need men today like Joshua, firm as a rock to principle, true to the commandments of God.",
        theologicalTheme: "End-Time Disciples Possessing Joshua's Faith"
      }
    ],
    doctrinalPillars: [
      "The Perpetuity of God's Moral Law",
      "Sola Scriptura and the Centrality of Scripture",
      "Covenant Faith and Victorious Christian Living"
    ],
    scripturalCrossReferences: [
      "Deuteronomy 31:6-8",
      "Psalm 1:1-3",
      "2 Timothy 3:16-17",
      "Revelation 14:12"
    ],
    teachingOutline: {
      intro: "Illustrate the weight of leadership Joshua faced as the mantle fell upon him, contrasting worldly ambition with divine commission.",
      points: [
        "God commissions ordinary people for extraordinary spiritual missions.",
        "The standard of character is God's immutable moral law.",
        "Unceasing meditation on Scripture equips the soul for every trial."
      ],
      appeal: "Determine today to be strong and of good courage, standing uncompromisingly for God's truth."
    }
  },

  // VOLUME 3: 1 CHRONICLES TO SONG OF SOLOMON (Preloaded Canonical Anchor)
  "psalms 23:1-6": {
    reference: "Psalms 23:1-6",
    volumeNumber: 3,
    pageRange: "pp. 702–708",
    chapterTitle: "The Good Shepherd: Divine Guidance & Sanctuary Rest",
    historicalContext:
      "A lyric of King David reflecting upon his youthful pastoral experience in the hills of Bethlehem, viewed through a lifetime of experiencing God's providential deliverance.",
    exegeticalSummary:
      "The shepherd psalm reveals the intimacy of personal faith in Yahweh. Moving from green pastures and still waters through the valley of the shadow of death, it culminates with the banqueting table and eternal dwelling in God's sanctuary house.",
    verses: [
      {
        verseNumber: 1,
        text: "The LORD is my shepherd; I shall not want.",
        headwords: "1. The LORD is my shepherd. I shall not want.",
        originalLanguageInsight: "Hebrew: 'Yahweh ro'i' (Jehovah my Shepherd). 'Lo echsar' (I lack nothing needful).",
        commentaryText: 
          "David identifies the sovereign Creator as his personal Shepherd. Because the infinite God guides the believer, every true spiritual and physical need is anticipated and supplied in Christ.",
        theologicalConnection: "Christ the Good Shepherd in the Plan of Salvation."
      },
      {
        verseNumber: 3,
        text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
        headwords: "3. Restoreth my soul. Paths of righteousness. For his name's sake.",
        originalLanguageInsight: "Hebrew: 'Nafshi yeshobeb' (revives, brings back my life). 'Ma'agle-tsedeq' (ruts/tracks of holiness).",
        commentaryText: 
          "To 'restore the soul' means both spiritual conversion and ongoing revival. The 'paths of righteousness' are the commandments of God, traversed not for self-glory, but for the honor of God's holy name.",
        theologicalConnection: "Sanctification and Surrender in the Christian Walk."
      },
      {
        verseNumber: 6,
        text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.",
        headwords: "6. Goodness and mercy shall follow me. Dwell in the house of the LORD.",
        originalLanguageInsight: "Hebrew: 'Chesed' (steadfast covenant lovingkindness). 'Bebeit Yahweh' (in the temple/sanctuary of Jehovah).",
        commentaryText: 
          "The psalm closes with the believer dwelling forever in the heavenly sanctuary home prepared by Christ, surrounded by unceasing divine goodness and redemptive love.",
        theologicalConnection: "The New Jerusalem and Eternal Rest with Christ."
      }
    ],
    egwComments: [
      {
        source: "The Desire of Ages, p. 476",
        quote: "What a beautiful illustration of Christ's tender care for His sheep is the twenty-third psalm! 'The Lord is my shepherd; I shall not want.' He knows us all by name, and He will never leave nor forsake the soul that trusts Him.",
        theologicalTheme: "Christ the Gentle Shepherd of the Flock"
      },
      {
        source: "Steps to Christ, p. 100",
        quote: "Keep your wants, your joys, your sorrows, your cares, and your fears before God. You cannot burden Him; you cannot fatigue Him. He who numbers the hairs of your head is not indifferent to the wants of His children.",
        theologicalTheme: "Cast All Anxiety on the Heavenly Shepherd"
      },
      {
        source: "The Ministry of Healing, p. 249",
        quote: "Rest in the Lord, and wait patiently for Him. The Lord knows our needs before we ask, and His faithfulness never fails. Through every dark valley He walks beside us.",
        theologicalTheme: "Comfort in the Valley of the Shadow of Death"
      },
      {
        source: "Patriarchs and Prophets, p. 642",
        quote: "David's psalms reflect the varied experiences of human life—its conflicts, sorrows, doubts, and triumphant faith. In communion with God, the weary soul finds rest.",
        theologicalTheme: "Communion with God Restoring the Weary Soul"
      },
      {
        source: "Sons and Daughters of God, p. 219",
        quote: "In the sanctuary of God, David found peace when the perplexities of life pressed upon his soul. The eternal home awaits the faithful.",
        theologicalTheme: "Dwelling in the Heavenly Sanctuary for Eternity"
      },
      {
        source: "Christ's Object Lessons, p. 187",
        quote: "The lost sheep was sought and found by the shepherd. So Christ leaves the ninety and nine sinless worlds to rescue our one fallen planet.",
        theologicalTheme: "The Shepherd's Boundless Sacrifice to Save the Lost"
      }
    ],
    doctrinalPillars: [
      "The Shepherd Ministry of Jesus Christ",
      "Righteousness by Faith and Divine Sanctification",
      "The Promise of Eternal Life in the Sanctuary Home"
    ],
    scripturalCrossReferences: [
      "Isaiah 40:11",
      "Ezekiel 34:11-16",
      "John 10:11-16",
      "Revelation 7:17"
    ],
    teachingOutline: {
      intro: "Describe the arid terrain of Judea where sheep are completely dependent on the shepherd for clean water, green pasture, and protection.",
      points: [
        "Christ provides for every real need of the believer.",
        "He leads us into paths of obedience for His name's sake.",
        "The darkest earthly trial is sanctified by His loving presence."
      ],
      appeal: "Place your hand anew in the hand of the Good Shepherd today."
    }
  },

  // VOLUME 5: MATTHEW TO JOHN (Preloaded Canonical Anchor)
  "john 3:16-17": {
    reference: "John 3:16-17",
    volumeNumber: 5,
    pageRange: "pp. 928–935",
    chapterTitle: "The Heart of the Gospel: God's Boundless Gift",
    historicalContext:
      "Recorded by the apostle John describing Christ's midnight consultation with Nicodemus, a ruler of the Jews, in Jerusalem (c. A.D. 28).",
    exegeticalSummary:
      "The most beloved declaration of redemptive love in the biblical canon. God's self-sacrificing agape love motivated the gift of His only-begotten Son, providing conditional salvation and eternal life to everyone who believes.",
    verses: [
      {
        verseNumber: 16,
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        headwords: "16. God so loved the world. Only begotten Son. Should not perish. Everlasting life.",
        originalLanguageInsight: "Greek: 'Egapēsen' (divine sacrificial agape love). 'Monogenē' (unique, one-of-a-kind, beloved Son). 'Apollētai' (be destroyed, perish eternally). 'Zōēn aiōnion' (life of the age to come / eternal immortality).",
        commentaryText: 
          "The gift of Christ was not made to create love in the Father's heart, but was the spontaneous expression of an eternal love already overflowing. 'Should not perish' contrasts eternal life with final destruction—refuting the non-biblical doctrine of an eternal burning hell where the wicked supposedly suffer forever without perishing.",
        theologicalConnection: "Justification by Faith & Conditional Immortality."
      },
      {
        verseNumber: 17,
        text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
        headwords: "17. Not to condemn the world. That the world through him might be saved.",
        originalLanguageInsight: "Greek: 'Krinē' (pass sentence of condemnation). 'Sōthē' (be rescued, delivered, saved from sin).",
        commentaryText: 
          "Christ's first advent was characterized by redemptive mercy, not judicial execution. The sinner condemns himself by rejecting the light of the gospel.",
        theologicalConnection: "The Merciful Character of God in Christ."
      }
    ],
    egwComments: [
      {
        source: "Steps to Christ, p. 9",
        quote: "The heart of God yearns over His earthly children with a love stronger than death. In giving His Son, He has poured out all heaven to us in one gift.",
        theologicalTheme: "All Heaven Poured Out in One Gift"
      },
      {
        source: "The Desire of Ages, p. 25",
        quote: "By His humanity, Christ touched humanity; by His divinity, He lays hold upon the throne of God. As the Son of man, He gave us an example of obedience; as the Son of God, He gives us power to obey.",
        theologicalTheme: "The Dual Natures and Victorious Power of Christ"
      },
      {
        source: "Christ's Object Lessons, p. 128",
        quote: "The gold of the gospel is love and faith. The love of God in the heart transforms the character and illuminates the life with heavenly grace.",
        theologicalTheme: "Transformative Love of God in the Heart"
      },
      {
        source: "The Great Controversy, p. 504",
        quote: "The cross of Calvary is the monument of infinite love and the pledge of complete redemption. God's justice and mercy are reconciled in Christ.",
        theologicalTheme: "Justice and Mercy Harmonized at Calvary"
      },
      {
        source: "Selected Messages, book 1, p. 302",
        quote: "Looking unto Jesus, the author and finisher of our faith, we are changed into the same image from glory to glory, even as by the Spirit of the Lord.",
        theologicalTheme: "Beholding Christ and Becoming Changed"
      },
      {
        source: "Testimonies for the Church, vol. 5, p. 737",
        quote: "The love of God is broader than the measure of man's mind, and the heart of the Eternal is wonderfully kind. Whosoever will may come.",
        theologicalTheme: "The Universal Invitation of the Everlasting Gospel"
      }
    ],
    doctrinalPillars: [
      "Salvation by Grace Through Faith Alone",
      "The Divinity and Humanity of Jesus Christ",
      "Biblical Conditional Immortality (Soul Mortality)"
    ],
    scripturalCrossReferences: [
      "Romans 5:6-8",
      "1 John 4:9-11",
      "Romans 6:23",
      "Ephesians 2:8-9"
    ],
    teachingOutline: {
      intro: "Hold up a gift and contrast buying something vs receiving an undeserved, priceless present from someone who loves you with their whole life.",
      points: [
        "The origin of salvation is God's infinite, eternal agape love.",
        "The measure of salvation is the sacrifice of His only-begotten Son.",
        "The condition of salvation is living, surrendered faith in Jesus."
      ],
      appeal: "Receive God's greatest gift today by entrusting your whole life to Christ."
    }
  },

  // VOLUME 6: ACTS TO 1 THESSALONIANS (Preloaded Canonical Anchor)
  "romans 8:1-4": {
    reference: "Romans 8:1-4",
    volumeNumber: 6,
    pageRange: "pp. 560–568",
    chapterTitle: "Life in the Spirit: No Condemnation & The Law Fulfilled",
    historicalContext:
      "Written by Paul from Corinth (c. A.D. 57) to the believers in Rome, resolving the tension between the demands of the moral law and the power of the indwelling Spirit.",
    exegeticalSummary:
      "A landmark passage demonstrating that justification removes all condemnation for believers in Christ, while the Holy Spirit empowers the fulfillment of the righteous requirements of God's moral law in daily character.",
    verses: [
      {
        verseNumber: 1,
        text: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.",
        headwords: "1. No condemnation. In Christ Jesus. Walk not after the flesh.",
        originalLanguageInsight: "Greek: 'Ouden katakrima' (not one shred of condemnation/judicial penalty). 'En Christō Iēsou' (vital covenant union with Christ).",
        commentaryText: 
          "The believer united with Christ is acquitted from the curse and death penalty of the broken law. This freedom is evidenced by a transformed lifestyle: walking in the power and direction of the Holy Spirit rather than sinful human inclinations.",
        theologicalConnection: "Justification by Faith and Full Pardon in Christ."
      },
      {
        verseNumber: 2,
        text: "For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death.",
        headwords: "2. Law of the Spirit of life. Free from the law of sin and death.",
        originalLanguageInsight: "Greek: 'Nomos tou pneumatos tēs zōēs' (the dynamic principle/reign of the life-giving Spirit).",
        commentaryText: 
          "The 'law of sin and death' is the enslaving power of sin working in fallen flesh. The 'law of the Spirit' is the supernatural regenerating power that breaks the stranglehold of habitual sin.",
        theologicalConnection: "Regeneration and Victory Over Sin."
      },
      {
        verseNumber: 4,
        text: "That the righteousness of the law might be fulfilled in us, who walk not after the flesh, but after the Spirit.",
        headwords: "4. Righteousness of the law fulfilled in us.",
        originalLanguageInsight: "Greek: 'Dikaiōma tou nomou' (the righteous requirement / moral standard of the law). 'Plērōthē' (fully realized, accomplished).",
        commentaryText: 
          "Grace does not abolish the law, but writes it upon the heart! What the law could not do because of human weakness (justify the guilty), Christ accomplished so that the righteous standard of the Ten Commandments might be reproduced in the believer's character by the Holy Spirit.",
        theologicalConnection: "The Perpetuity and Spiritual Vindication of the Moral Law."
      }
    ],
    egwComments: [
      {
        source: "Steps to Christ, p. 62",
        quote: "We have no righteousness of our own with which to meet the claims of the law of God. But Christ has made a way of escape for us. He lived on earth amid trials and temptations... He died for us, and now He offers to take our sins and give us His righteousness.",
        theologicalTheme: "Righteousness by Faith Meeting the Claims of the Law"
      },
      {
        source: "Selected Messages, book 1, p. 372",
        quote: "There is therefore now no condemnation to them which are in Christ Jesus... The law requires righteousness, and this the sinner owes to the law; but he is incapable of rendering it. The only way in which he can attain to righteousness is through faith in Christ.",
        theologicalTheme: "No Condemnation for the Soul United to Christ"
      },
      {
        source: "Faith and Works, p. 24",
        quote: "Righteousness by faith does not make void the law; it establishes it in the heart by love. The faith that justifies is a faith that works by love and purifies the soul.",
        theologicalTheme: "Faith Establishing the Law Through Love"
      },
      {
        source: "The Desire of Ages, p. 308",
        quote: "The law requires that soul to love God supremely and his neighbor as himself. By the Holy Spirit this divine love is shed abroad in our hearts.",
        theologicalTheme: "Love Fulfilling the Royal Law"
      },
      {
        source: "Testimonies for the Church, vol. 5, p. 744",
        quote: "By the transforming grace of the Holy Spirit, the mind is renewed and the believer walks in the light of God's commandments.",
        theologicalTheme: "Transformation of Character by the Indwelling Spirit"
      },
      {
        source: "Selected Messages, book 1, p. 394",
        quote: "Let the subject be made distinct and plain, that it is not possible for man to merit anything by his best good works. Salvation is through faith in Jesus Christ alone.",
        theologicalTheme: "Salvation Wholly by Grace, Never by Merit"
      }
    ],
    doctrinalPillars: [
      "Justification and Complete Freedom from Condemnation",
      "Sanctification by the Indwelling Holy Spirit",
      "The Perpetuity and Honor of God's Moral Law"
    ],
    scripturalCrossReferences: [
      "Romans 3:31",
      "Galatians 5:16-25",
      "Ezekiel 36:26-27",
      "Revelation 14:12"
    ],
    teachingOutline: {
      intro: "Contrast a prisoner receiving an unconditional governor's pardon with receiving a heart doctor who cures the underlying condition.",
      points: [
        "In Christ, the judicial sentence of condemnation is completely canceled.",
        "The Holy Spirit provides power to conquer old habits of the flesh.",
        "The moral law remains the beautiful character blueprint lived out by grace."
      ],
      appeal: "Step out of the prison of condemnation today into the glorious freedom of the sons of God."
    }
  },
  "acts 28:26-27": {
    reference: "Acts 28:26-27",
    volumeNumber: 6,
    pageRange: "pp. 450–456",
    chapterTitle: "Paul in Rome: Solemn Prophetic Warning from Isaiah 6",
    historicalContext:
      "Acts 28 records the Apostle Paul's arrival in Rome as an ambassador in bonds during the early reign of Nero (c. A.D. 61–63). Calling together the local Jewish leaders, Paul expounded the kingdom of God from morning until evening, persuading them concerning Jesus from the Law of Moses and the Prophets (Acts 28:23). When some believed and others rejected the message, Paul solemnly quoted Isaiah 6:9-10. This marked the definitive canonical turning point where the apostolic proclamation of the gospel turned unreservedly toward the Gentile world.",
    exegeticalSummary:
      "A solemn prophetic exposition of the spiritual peril of deliberate resistance to the Holy Spirit, illustrating that spiritual blindness is the tragic harvest of closing one's own eyes to biblical truth, while affirming that divine healing and salvation remain available to all who repent.",
    verses: [
      {
        verseNumber: 26,
        text: "Saying, Go unto this people, and say, Hearing ye shall hear, and shall not understand; and seeing ye shall see, and not perceive:",
        headwords: "26. Go unto this people. Hearing ye shall hear. And shall not understand. Seeing ye shall see, and not perceive.",
        originalLanguageInsight:
          "Greek: 'Akoē akousete' translates the emphatic Hebrew infinitive absolute ('shāmōa' shim'ū' from Isa. 6:9), meaning 'ye shall indeed hear, yet by no means comprehend.' 'Blepontes blepsete': possessing physical ocular vision, yet spiritually insensitive to the Messiah's identity.",
        commentaryText:
          "Paul quotes the solemn commission given to Isaiah in the heavenly sanctuary vision. God does not arbitrarily harden the hearts of men; rather, persistent, conscious refusal to yield to the convicting power of the Holy Spirit calcifies the moral affections. Light continually spurned leaves the soul in voluntary blindness. The tragedy of Rome was not a deficiency in God's saving grace, but the sorrowful outcome of human obstinacy choosing tradition above Sola Scriptura.",
        theologicalConnection: "The Convicting Ministry of the Holy Spirit, Moral Accountability, and Sola Scriptura."
      },
      {
        verseNumber: 27,
        text: "For the heart of this people is waxed gross, and their ears are dull of hearing, and their eyes have they closed; lest they should see with their eyes, and hear with their ears, and understand with their heart, and should be converted, and I should heal them.",
        headwords: "27. Heart of this people is waxed gross. Ears are dull of hearing. Eyes have they closed. Lest they should be converted, and I should heal them.",
        originalLanguageInsight:
          "Greek: 'Epachunthē' (from pachunō, to become callous, fattened, or impervious to sensation). 'Ekammuōsan' (active voice: they shut their own eyes). The active Greek verb stresses personal human agency: the people themselves deliberately closed their eyes against the light of truth.",
        commentaryText:
          "The fatal spiritual malady was self-inflicted: 'their eyes have they closed.' God's covenant desire is that all people should hear, understand with the heart, be converted, and receive Christ's healing righteousness. But when the soul persistently turns away from prophetic light, spiritual perception atrophies. Yet even in this stern warning, the glorious gospel promise shines through: every sinner who ceases resistance and turns in humble faith to Christ receives immediate spiritual healing, justification, and everlasting peace.",
        theologicalConnection: "Regeneration Through Faith, Christ as the Great Physician, and Free Moral Agency."
      }
    ],
    egwComments: [
      {
        source: "The Acts of the Apostles, pp. 450–453",
        quote: "It was not that God had decreed their destruction, but they had rejected the light until darkness had enveloped their souls. Light had come into the world, and men loved darkness rather than light, because their deeds were evil. He who will not see will soon become incapable of seeing.",
        theologicalTheme: "The Rejection of Light and Spiritual Hardening"
      },
      {
        source: "Christ's Object Lessons, p. 104",
        quote: "The heart that resists the conviction of the Holy Spirit becomes like the beaten roadside. The truth cannot take root. The word of God is plain, but the heart is dull of hearing because of self-will.",
        theologicalTheme: "The Danger of Spiritual Insensibility"
      },
      {
        source: "Selected Messages, book 1, p. 389",
        quote: "Christ is able and willing to heal the backsliding soul, if the sinner will only turn with the heart and accept His converting grace.",
        theologicalTheme: "Christ's Power to Heal the Contrite Heart"
      }
    ],
    doctrinalPillars: [
      "Sola Scriptura (Prophetic Fulfillment in Christ)",
      "Free Moral Agency and Moral Responsibility",
      "Justification and Conversion Through Grace"
    ],
    scripturalCrossReferences: [
      "Isaiah 6:9-10",
      "Matthew 13:14-15",
      "John 12:39-40",
      "Romans 11:7-11",
      "Hebrews 3:7-13"
    ],
    teachingOutline: {
      intro: "Illustrate the human eye adjusting to darkness until it finds light painful, showing how persistent delay deadens spiritual conviction.",
      points: [
        "Scripture reveals that spiritual blindness is chosen when truth is resisted.",
        "God's earnest desire is never condemnation, but conversion and divine healing.",
        "The gospel of grace turns to every open, receptive heart without partiality."
      ],
      appeal: "Today, if you will hear His voice, do not harden your heart; accept Christ's healing righteousness."
    }
  },
  "revelation 14:12": {
    reference: "Revelation 14:12",
    volumeNumber: 7,
    pageRange: "pp. 832–835",
    chapterTitle: "The Victorious Remnant: Commandments of God & Faith of Jesus",
    historicalContext:
      "Written by the Apostle John on the Isle of Patmos (c. A.D. 95) under imperial Roman persecution. In the historicist framework, Revelation 14:12 forms the divine conclusion and golden capstone of the Three Angels' Messages (Revelation 14:6-12), identifying the faithful remnant who triumph over the beast, his image, and his counterfeit mark in earth's final conflict.",
    exegeticalSummary:
      "A theological synthesis of the two identifying marks of God's end-time people: unwavering obedience to all of God's commandments (including the Sabbath) paired with the living, saving faith of Jesus Christ.",
    verses: [
      {
        verseNumber: 12,
        text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        headwords: "12. Here is the patience of the saints. Keep the commandments of God. The faith of Jesus.",
        originalLanguageInsight:
          "Greek: 'Hōde hē hupomonē tōn hagiōn estin' ('Hupomonē': heroic endurance, steadfast perseverance under severe pressure). 'Tērountes' (present active participle: persistently keeping, treasuring). 'Tēn pistin Iēsou' (both the objective apostolic doctrine and the subjective living faith that Jesus exercised).",
        commentaryText:
          "This golden verse defines the spiritual character of God's people in the final crisis of the Great Controversy. When earthly powers enforce counterfeit worship, God's saints stand firm through 'the patience of the saints.' Their obedience is not legalistic effort to earn salvation; it is the spontaneous manifestation of the love of God shed abroad in their hearts. They keep the commandments of God because they possess the faith of Jesus, resting entirely in His imputed and imparted righteousness.",
        theologicalConnection: "The Seal of God, the Sabbath, Justification by Faith, and the Remnant Church."
      }
    ],
    egwComments: [
      {
        source: "The Great Controversy, p. 605",
        quote: "The Sabbath will be the great test of loyalty, for it is the point of truth especially controverted. When the final test shall be brought to bear upon men, then the line of distinction will be drawn between those who serve God and those who serve Him not.",
        theologicalTheme: "The Sabbath as the Final Test of Loyalty"
      },
      {
        source: "Selected Messages, book 3, p. 172",
        quote: "The third angel's message is the proclamation of the commandments of God and the faith of Jesus Christ. The commandments of God have been proclaimed, but the faith of Jesus has not been proclaimed by Seventh-day Adventists as of equal importance, the law and the gospel going hand in hand. I cannot find language to express the subject in its fullness. 'The faith of Jesus.' It is talked of, but not understood.",
        theologicalTheme: "The Law and the Gospel Going Hand in Hand"
      },
      {
        source: "Testimonies for the Church, vol. 6, p. 17",
        quote: "In a special sense Seventh-day Adventists have been set in the world as watchmen and light bearers. Unto them has been entrusted the last warning for a perishing world. On them is shining wonderful light from the Word of God. They have been given a work of the most solemn import—the proclamation of the first, second, and third angels' messages.",
        theologicalTheme: "God's Entrusted Message for the Final Generation"
      }
    ],
    doctrinalPillars: [
      "The Perpetuity of the Ten Commandments & the Seventh-day Sabbath",
      "Justification by Faith in Jesus Christ",
      "The Three Angels' Messages and the Final Remnant"
    ],
    scripturalCrossReferences: [
      "Revelation 12:17",
      "Exodus 20:8-11",
      "Romans 3:31",
      "Galatians 2:20",
      "Hebrews 4:9-11"
    ],
    teachingOutline: {
      intro: "Ask the class what two rails a train requires to travel safely: the law without the gospel is legalism; the gospel without the law is antinomianism.",
      points: [
        "End-time endurance ('hupomonē') is supernatural grace imparted by Christ.",
        "Keeping God's commandments is love in action, centered on the Sabbath memorial of creation and redemption.",
        "The faith of Jesus empowers believers to overcome even as He overcame."
      ],
      appeal: "Anchor your heart in Jesus today, choosing to walk in joyful loyalty to His commandments by faith."
    }
  }
};

// ==========================================
// CANONICAL ALIAS LOOKUPS FOR INSTANT 0MS RESOLUTION
// ==========================================
PRELOADED_SDABC_DATA["genesis"] = PRELOADED_SDABC_DATA["genesis (book overview)"];
PRELOADED_SDABC_DATA["genesis overview"] = PRELOADED_SDABC_DATA["genesis (book overview)"];
PRELOADED_SDABC_DATA["genesis book overview"] = PRELOADED_SDABC_DATA["genesis (book overview)"];
PRELOADED_SDABC_DATA["genesis 1"] = PRELOADED_SDABC_DATA["genesis 1:1-31"];
PRELOADED_SDABC_DATA["genesis 2"] = PRELOADED_SDABC_DATA["genesis 2:1-3"];
PRELOADED_SDABC_DATA["genesis 3"] = PRELOADED_SDABC_DATA["genesis 3:1-15"];
PRELOADED_SDABC_DATA["exodus"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus overview"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus book overview"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["ex"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus 1"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus 20"] = PRELOADED_SDABC_DATA["exodus 20:8-11"];
PRELOADED_SDABC_DATA["exodus 20:8"] = PRELOADED_SDABC_DATA["exodus 20:8-11"];
PRELOADED_SDABC_DATA["exodus 20:8-11"] = PRELOADED_SDABC_DATA["exodus 20:8-11"];
PRELOADED_SDABC_DATA["exodus 25"] = PRELOADED_SDABC_DATA["exodus 25:1-9"];
PRELOADED_SDABC_DATA["exodus 25:8"] = PRELOADED_SDABC_DATA["exodus 25:1-9"];
PRELOADED_SDABC_DATA["exodus 25:1-9"] = PRELOADED_SDABC_DATA["exodus 25:1-9"];
