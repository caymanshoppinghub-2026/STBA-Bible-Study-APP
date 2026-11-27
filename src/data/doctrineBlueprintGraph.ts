export interface BlueprintPillarChip {
  label: string;
  subtitle: string;
  iconKey: "flame" | "shield" | "sparkles" | "book" | "compass" | "crown";
}

export interface ConstellationScriptureNode {
  id: string;
  reference: string;
  verseText: string;
  parentNodeId: string;
  x: number; // 0..1000 SVG coordinate space
  y: number; // 0..600 SVG coordinate space
}

export interface ConstellationDoctrineNode {
  id: string;
  label: string;
  shortTag: string;
  summary: string;
  sectionIndex: number;
  x: number;
  y: number;
  isHub?: boolean;
  connectedTo: string[];
  anchorRefs: string[];
}

export interface TrackBlueprintSpec {
  trackId: string;
  heroTitle: string;
  shortTitle: string;
  category: string;
  blueprintType: string;
  heroSummary: string;
  primaryPassage: string;
  pillarChips: [BlueprintPillarChip, BlueprintPillarChip, BlueprintPillarChip];
  nodes: ConstellationDoctrineNode[];
  scriptureNodes: ConstellationScriptureNode[];
}

export const TRACK_BLUEPRINTS: Record<string, TrackBlueprintSpec> = {
  "fundamental-beliefs": {
    trackId: "fundamental-beliefs",
    heroTitle: "THE 28 FUNDAMENTAL BELIEFS",
    shortTitle: "28 Fundamental Beliefs",
    category: "Systematic Truth",
    blueprintType: "Pillar Architecture",
    heroSummary:
      "Unveiling the organic unity of God's revealed truth—from the inspired Scriptures and the loving Godhead to redemption, Christian living, and the restoration of all things in Christ.",
    primaryPassage: "2 Timothy 3:16",
    pillarChips: [
      { label: "Sola Scriptura", subtitle: "Divine Inspiration", iconKey: "book" },
      { label: "The Godhead", subtitle: "Father, Son & Spirit", iconKey: "crown" },
      { label: "New Creation", subtitle: "Covenant Restoration", iconKey: "sparkles" }
    ],
    nodes: [
      {
        id: "fb-hub",
        label: "Sola Scriptura",
        shortTag: "Core Pillar",
        summary: "All Scripture is God-breathed—the infallible revelation of His will, the standard of character, and the test of all doctrine.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        isHub: true,
        connectedTo: ["fb-trinity", "fb-creation", "fb-salvation", "fb-law", "fb-sanctuary"],
        anchorRefs: ["2 Timothy 3:16", "2 Peter 1:21"]
      },
      {
        id: "fb-trinity",
        label: "The Godhead",
        shortTag: "Fundamental #2",
        summary: "One God: Father, Son, and Holy Spirit—a unity of three co-eternal Persons united in infinite love and redemptive purpose.",
        sectionIndex: 1,
        x: 305,
        y: 165,
        connectedTo: ["fb-hub", "fb-creation", "fb-salvation"],
        anchorRefs: ["Deuteronomy 6:4", "Matthew 28:19"]
      },
      {
        id: "fb-creation",
        label: "Creation & Image",
        shortTag: "Fundamental #6",
        summary: "God created the heavens and the earth in six literal days, forming humanity in His own image and crowning the week with the Sabbath.",
        sectionIndex: 2,
        x: 700,
        y: 165,
        connectedTo: ["fb-hub", "fb-trinity", "fb-law"],
        anchorRefs: ["Genesis 1:27", "Exodus 20:11"]
      },
      {
        id: "fb-salvation",
        label: "Righteousness by Faith",
        shortTag: "Fundamental #10",
        summary: "In infinite love and mercy God made Christ to be sin for us, that in Him we might be made the righteousness of God through faith.",
        sectionIndex: 0,
        x: 250,
        y: 385,
        connectedTo: ["fb-hub", "fb-trinity", "fb-sanctuary"],
        anchorRefs: ["Romans 1:16", "2 Corinthians 5:17"]
      },
      {
        id: "fb-law",
        label: "Law & Sabbath",
        shortTag: "Fundamental #19-20",
        summary: "The great principles of God's law are embodied in the Ten Commandments and exemplified in the life of Christ, sealed by the seventh-day Sabbath.",
        sectionIndex: 2,
        x: 745,
        y: 380,
        connectedTo: ["fb-hub", "fb-creation", "fb-sanctuary"],
        anchorRefs: ["Exodus 20:8-11", "Romans 3:31"]
      },
      {
        id: "fb-sanctuary",
        label: "Christ's Ministry",
        shortTag: "Fundamental #24",
        summary: "There is a sanctuary in heaven, the true tabernacle which the Lord pitched, where Christ ministers on our behalf as High Priest.",
        sectionIndex: 1,
        x: 500,
        y: 480,
        connectedTo: ["fb-hub", "fb-salvation", "fb-law"],
        anchorRefs: ["Hebrews 8:1-2", "Daniel 8:14"]
      }
    ],
    scriptureNodes: [
      {
        id: "fb-s1",
        reference: "2 Timothy 3:16",
        verseText: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
        parentNodeId: "fb-trinity",
        x: 155,
        y: 110
      },
      {
        id: "fb-s2",
        reference: "Genesis 1:27",
        verseText: "So God created man in his own image, in the image of God created he him; male and female created he them.",
        parentNodeId: "fb-creation",
        x: 845,
        y: 110
      },
      {
        id: "fb-s3",
        reference: "Romans 1:16",
        verseText: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
        parentNodeId: "fb-salvation",
        x: 110,
        y: 445
      },
      {
        id: "fb-s4",
        reference: "Exodus 20:11",
        verseText: "For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
        parentNodeId: "fb-law",
        x: 880,
        y: 455
      },
      {
        id: "fb-s5",
        reference: "Hebrews 8:1-2",
        verseText: "We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle.",
        parentNodeId: "fb-sanctuary",
        x: 660,
        y: 530
      }
    ]
  },

  "three-angels": {
    trackId: "three-angels",
    heroTitle: "THE THREE ANGELS' MESSAGES",
    shortTitle: "Three Angels' Messages",
    category: "Prophetic Commission",
    blueprintType: "Prophetic Milestone",
    heroSummary:
      "God's urgent end-time proclamation in Revelation 14—calling every nation to worship the Creator in the hour of His judgment, flee Babylon's deceptions, and keep the commandments of God and the faith of Jesus.",
    primaryPassage: "Revelation 14:6-12",
    pillarChips: [
      { label: "Everlasting Gospel", subtitle: "First Angel's Call", iconKey: "sparkles" },
      { label: "Babylon Is Fallen", subtitle: "Prophetic Warning", iconKey: "flame" },
      { label: "Faith of Jesus", subtitle: "Remnant Endurance", iconKey: "shield" }
    ],
    nodes: [
      {
        id: "ta-hub",
        label: "Everlasting Gospel",
        shortTag: "Revelation 14:6",
        summary: "The unchanging covenant of redemptive grace proclaimed to every nation, kindred, tongue, and people before Christ's return.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        isHub: true,
        connectedTo: ["ta-judgment", "ta-creator", "ta-babylon", "ta-seal", "ta-remnant"],
        anchorRefs: ["Revelation 14:6", "Matthew 24:14"]
      },
      {
        id: "ta-judgment",
        label: "Hour of Judgment",
        shortTag: "First Angel",
        summary: "The pre-advent investigative judgment announced in Daniel 7 and 8 has commenced in the heavenly sanctuary.",
        sectionIndex: 0,
        x: 300,
        y: 165,
        connectedTo: ["ta-hub", "ta-creator"],
        anchorRefs: ["Revelation 14:7", "Daniel 7:9-10"]
      },
      {
        id: "ta-creator",
        label: "Worship the Creator",
        shortTag: "Sabbath Call",
        summary: "Echoing the fourth commandment word-for-word, calling humanity back to authentic Creator worship.",
        sectionIndex: 0,
        x: 705,
        y: 170,
        connectedTo: ["ta-hub", "ta-judgment", "ta-seal"],
        anchorRefs: ["Revelation 14:7", "Exodus 20:11"]
      },
      {
        id: "ta-babylon",
        label: "Fall of Babylon",
        shortTag: "Second Angel",
        summary: "Exposing spiritual confusion and counterfeit traditions that replace Sola Scriptura with human dogma.",
        sectionIndex: 1,
        x: 245,
        y: 390,
        connectedTo: ["ta-hub", "ta-remnant"],
        anchorRefs: ["Revelation 14:8", "Revelation 18:2-4"]
      },
      {
        id: "ta-seal",
        label: "Seal vs. Mark",
        shortTag: "Third Angel",
        summary: "The final cosmic loyalty test contrasting the Seal of the living God with forced counterfeit worship.",
        sectionIndex: 2,
        x: 750,
        y: 390,
        connectedTo: ["ta-hub", "ta-creator", "ta-remnant"],
        anchorRefs: ["Revelation 14:9-11", "Ezekiel 20:12"]
      },
      {
        id: "ta-remnant",
        label: "Patience of Saints",
        shortTag: "Revelation 14:12",
        summary: "The enduring remnant who keep all the commandments of God and hold fast the living faith of Jesus.",
        sectionIndex: 2,
        x: 500,
        y: 485,
        connectedTo: ["ta-hub", "ta-babylon", "ta-seal"],
        anchorRefs: ["Revelation 14:12", "Revelation 12:17"]
      }
    ],
    scriptureNodes: [
      {
        id: "ta-s1",
        reference: "Revelation 14:6",
        verseText: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth.",
        parentNodeId: "ta-judgment",
        x: 145,
        y: 110
      },
      {
        id: "ta-s2",
        reference: "Revelation 14:7",
        verseText: "Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea.",
        parentNodeId: "ta-creator",
        x: 855,
        y: 115
      },
      {
        id: "ta-s3",
        reference: "Revelation 14:8",
        verseText: "Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.",
        parentNodeId: "ta-babylon",
        x: 105,
        y: 455
      },
      {
        id: "ta-s4",
        reference: "Revelation 14:12",
        verseText: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        parentNodeId: "ta-remnant",
        x: 685,
        y: 530
      }
    ]
  },

  "sanctuary-doctrine": {
    trackId: "sanctuary-doctrine",
    heroTitle: "THE HEAVENLY SANCTUARY",
    shortTitle: "Heavenly Sanctuary",
    category: "Sanctuary Truth",
    blueprintType: "Celestial Blueprint",
    heroSummary:
      "God's master architectural blueprint of salvation—from the earthly shadow of Exodus 25 to Christ's high-priestly mediation in heaven and the 2,300-day cleansing prophecy of Daniel 8:14.",
    primaryPassage: "Hebrews 8:1-5",
    pillarChips: [
      { label: "Outer Court", subtitle: "Calvary & Cleansing", iconKey: "flame" },
      { label: "Holy Place", subtitle: "Daily Mediation", iconKey: "compass" },
      { label: "Most Holy Place", subtitle: "Judgment & Ark", iconKey: "crown" }
    ],
    nodes: [
      {
        id: "sn-hub",
        label: "Heavenly Sanctuary",
        shortTag: "True Tabernacle",
        summary: "The celestial temple where Jesus Christ, our risen High Priest, applies His once-for-all sacrifice for our complete restoration.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        isHub: true,
        connectedTo: ["sn-courtyard", "sn-holy", "sn-mostholy", "sn-2300", "sn-ark"],
        anchorRefs: ["Hebrews 8:1-2", "Exodus 25:8"]
      },
      {
        id: "sn-courtyard",
        label: "Altar & Laver",
        shortTag: "Justification",
        summary: "The bronze altar points to Christ's substitutionary death on Calvary; the laver signifies cleansing and new birth.",
        sectionIndex: 0,
        x: 285,
        y: 175,
        connectedTo: ["sn-hub", "sn-holy"],
        anchorRefs: ["John 1:29", "Titus 3:5"]
      },
      {
        id: "sn-holy",
        label: "Daily Ministration",
        shortTag: "Sanctification",
        summary: "The candlestick, showbread, and incense reveal the Spirit, the Word, and Christ's continuous intercession.",
        sectionIndex: 1,
        x: 715,
        y: 175,
        connectedTo: ["sn-hub", "sn-courtyard", "sn-mostholy"],
        anchorRefs: ["Hebrews 7:25", "Revelation 8:3-4"]
      },
      {
        id: "sn-2300",
        label: "2,300-Day Prophecy",
        shortTag: "Daniel 8:14",
        summary: "The longest prophetic timeline in Scripture, pointing to 1844 and the antitypical Day of Atonement in heaven.",
        sectionIndex: 2,
        x: 255,
        y: 410,
        connectedTo: ["sn-hub", "sn-mostholy"],
        anchorRefs: ["Daniel 8:14", "Daniel 9:24-27"]
      },
      {
        id: "sn-mostholy",
        label: "Day of Atonement",
        shortTag: "Cleansing",
        summary: "The final phase of Christ's ministry—blotting out confessed sin and vindicating God's character before the universe.",
        sectionIndex: 2,
        x: 740,
        y: 410,
        connectedTo: ["sn-hub", "sn-holy", "sn-ark"],
        anchorRefs: ["Leviticus 16:30", "Hebrews 9:23"]
      },
      {
        id: "sn-ark",
        label: "Mercy Seat & Law",
        shortTag: "Revelation 11:19",
        summary: "Justice and mercy meet at the golden mercy seat resting directly above the immutable Ten Commandments.",
        sectionIndex: 1,
        x: 500,
        y: 485,
        connectedTo: ["sn-hub", "sn-mostholy", "sn-2300"],
        anchorRefs: ["Revelation 11:19", "Psalm 85:10"]
      }
    ],
    scriptureNodes: [
      {
        id: "sn-s1",
        reference: "Exodus 25:8",
        verseText: "And let them make me a sanctuary; that I may dwell among them.",
        parentNodeId: "sn-courtyard",
        x: 135,
        y: 120
      },
      {
        id: "sn-s2",
        reference: "Hebrews 7:25",
        verseText: "Wherefore he is able also to save them to the uttermost that come unto God by him, seeing he ever liveth to make intercession for them.",
        parentNodeId: "sn-holy",
        x: 860,
        y: 120
      },
      {
        id: "sn-s3",
        reference: "Daniel 8:14",
        verseText: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        parentNodeId: "sn-2300",
        x: 110,
        y: 470
      },
      {
        id: "sn-s4",
        reference: "Revelation 11:19",
        verseText: "And the temple of God was opened in heaven, and there was seen in his temple the ark of his testament.",
        parentNodeId: "sn-ark",
        x: 685,
        y: 530
      }
    ]
  },

  "book-by-book": {
    trackId: "book-by-book",
    heroTitle: "SACRED SCROLLS EXEGESIS",
    shortTitle: "Sacred Scrolls Exegesis",
    category: "Canonical Exegesis",
    blueprintType: "Verse-by-Verse Walk",
    heroSummary:
      "Journey chapter-by-chapter through the foundational scrolls of Scripture—uniting historical context, original Hebrew and Greek roots, and Christ-centered canonical harmony.",
    primaryPassage: "Romans 12:1-2",
    pillarChips: [
      { label: "Torah & Prophets", subtitle: "Covenant Roots", iconKey: "book" },
      { label: "Gospels & Cross", subtitle: "Life of Christ", iconKey: "crown" },
      { label: "Apocalypse", subtitle: "Prophetic Climax", iconKey: "compass" }
    ],
    nodes: [
      {
        id: "bb-hub",
        label: "Canonical Unity",
        shortTag: "66 Books • One Author",
        summary: "Every scroll from Genesis to Revelation testifies of Jesus Christ and unfolds the Great Controversy between truth and rebellion.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        isHub: true,
        connectedTo: ["bb-daniel", "bb-romans", "bb-hebrews", "bb-revelation", "bb-psalms"],
        anchorRefs: ["Luke 24:27", "Isaiah 28:10"]
      },
      {
        id: "bb-daniel",
        label: "Scroll of Daniel",
        shortTag: "Prophetic Timeline",
        summary: "Empires rise and fall under God's sovereign hand until the everlasting kingdom of the Son of Man is established.",
        sectionIndex: 0,
        x: 300,
        y: 170,
        connectedTo: ["bb-hub", "bb-revelation"],
        anchorRefs: ["Daniel 2:44", "Daniel 8:14"]
      },
      {
        id: "bb-romans",
        label: "Epistle to Romans",
        shortTag: "Gospel Architecture",
        summary: "Paul's systematic exposition of justification by faith, victory over sin, and presenting our bodies as a living sacrifice.",
        sectionIndex: 1,
        x: 705,
        y: 170,
        connectedTo: ["bb-hub", "bb-hebrews"],
        anchorRefs: ["Romans 12:1-2", "Romans 8:1"]
      },
      {
        id: "bb-psalms",
        label: "Psalms & Wisdom",
        shortTag: "Sanctuary Devotion",
        summary: "Inspired songs and proverbs revealing the way of God in the sanctuary and the pursuit of heavenly wisdom.",
        sectionIndex: 0,
        x: 255,
        y: 410,
        connectedTo: ["bb-hub", "bb-daniel"],
        anchorRefs: ["Psalm 77:13", "Proverbs 2:2-5"]
      },
      {
        id: "bb-hebrews",
        label: "Book of Hebrews",
        shortTag: "Better Covenant",
        summary: "Demonstrating Christ's superior priesthood, superior sacrifice, and living intercession in the heavenly sanctuary.",
        sectionIndex: 2,
        x: 745,
        y: 410,
        connectedTo: ["bb-hub", "bb-romans", "bb-revelation"],
        anchorRefs: ["Hebrews 8:1-2", "Hebrews 4:16"]
      },
      {
        id: "bb-revelation",
        label: "The Revelation",
        shortTag: "Victory of the Lamb",
        summary: "The unveiling of Jesus Christ—tracing church history, the Three Angels' Messages, and the New Jerusalem.",
        sectionIndex: 2,
        x: 500,
        y: 485,
        connectedTo: ["bb-hub", "bb-daniel", "bb-hebrews"],
        anchorRefs: ["Revelation 1:1-3", "Revelation 21:1-4"]
      }
    ],
    scriptureNodes: [
      {
        id: "bb-s1",
        reference: "Luke 24:27",
        verseText: "And beginning at Moses and all the prophets, he expounded unto them in all the scriptures the things concerning himself.",
        parentNodeId: "bb-daniel",
        x: 145,
        y: 115
      },
      {
        id: "bb-s2",
        reference: "Romans 12:1-2",
        verseText: "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God.",
        parentNodeId: "bb-romans",
        x: 855,
        y: 115
      },
      {
        id: "bb-s3",
        reference: "Psalm 77:13",
        verseText: "Thy way, O God, is in the sanctuary: who is so great a God as our God?",
        parentNodeId: "bb-psalms",
        x: 115,
        y: 470
      },
      {
        id: "bb-s4",
        reference: "Revelation 1:3",
        verseText: "Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein.",
        parentNodeId: "bb-revelation",
        x: 685,
        y: 530
      }
    ]
  },

  "priority-doctrines": {
    trackId: "priority-doctrines",
    heroTitle: "COVENANT FOUNDATIONS",
    shortTitle: "Covenant Foundations",
    category: "Everlasting Covenant",
    blueprintType: "Covenant Pillars",
    heroSummary:
      "Anchor your discipleship in the immutable pillars of the everlasting covenant—transforming grace, God's holy law written on the heart, seventh-day Sabbath rest, and the blessed hope of Christ's return.",
    primaryPassage: "Exodus 20:8-11",
    pillarChips: [
      { label: "Sovereign Grace", subtitle: "New Heart Promise", iconKey: "sparkles" },
      { label: "Sabbath Rest", subtitle: "Sign of Loyalty", iconKey: "shield" },
      { label: "Blessed Hope", subtitle: "Second Coming", iconKey: "crown" }
    ],
    nodes: [
      {
        id: "pd-hub",
        label: "Everlasting Covenant",
        shortTag: "Hebrews 13:20",
        summary: "God's eternal promise to write His law of love upon the human heart through the blood and Spirit of Jesus Christ.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        isHub: true,
        connectedTo: ["pd-grace", "pd-sabbath", "pd-state", "pd-advent", "pd-stewardship"],
        anchorRefs: ["Jeremiah 31:33", "Hebrews 8:10"]
      },
      {
        id: "pd-grace",
        label: "Grace & Obedience",
        shortTag: "New Birth",
        summary: "Salvation is by grace alone through faith, producing joyful, Spirit-empowered obedience to God's commandments.",
        sectionIndex: 0,
        x: 295,
        y: 170,
        connectedTo: ["pd-hub", "pd-sabbath"],
        anchorRefs: ["Ephesians 2:8-10", "John 14:15"]
      },
      {
        id: "pd-sabbath",
        label: "Seventh-Day Sabbath",
        shortTag: "Memorial of Creation",
        summary: "A weekly sanctuary in time—celebrating God as Creator, Redeemer, and Sanctifier from sundown Friday to sundown Saturday.",
        sectionIndex: 1,
        x: 710,
        y: 170,
        connectedTo: ["pd-hub", "pd-grace", "pd-advent"],
        anchorRefs: ["Exodus 20:8-11", "Isaiah 58:13-14"]
      },
      {
        id: "pd-state",
        label: "State of the Dead",
        shortTag: "Resurrection Hope",
        summary: "Death is an unconscious sleep until the Lifegiver returns and calls the righteous to immortality.",
        sectionIndex: 2,
        x: 255,
        y: 410,
        connectedTo: ["pd-hub", "pd-advent"],
        anchorRefs: ["Ecclesiastes 9:5", "1 Thessalonians 4:16"]
      },
      {
        id: "pd-stewardship",
        label: "Health & Temple",
        shortTag: "Whole-Person Care",
        summary: "Honoring God in body, mind, and spirit as the living temple of the Holy Spirit.",
        sectionIndex: 1,
        x: 745,
        y: 410,
        connectedTo: ["pd-hub", "pd-sabbath"],
        anchorRefs: ["1 Corinthians 6:19-20", "3 John 1:2"]
      },
      {
        id: "pd-advent",
        label: "Second Coming",
        shortTag: "Titus 2:13",
        summary: "The literal, visible, audible, worldwide return of Jesus Christ to gather His redeemed people home.",
        sectionIndex: 2,
        x: 500,
        y: 485,
        connectedTo: ["pd-hub", "pd-state", "pd-sabbath"],
        anchorRefs: ["John 14:1-3", "Acts 1:11"]
      }
    ],
    scriptureNodes: [
      {
        id: "pd-s1",
        reference: "Ephesians 2:8-9",
        verseText: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
        parentNodeId: "pd-grace",
        x: 140,
        y: 115
      },
      {
        id: "pd-s2",
        reference: "Exodus 20:8",
        verseText: "Remember the sabbath day, to keep it holy.",
        parentNodeId: "pd-sabbath",
        x: 860,
        y: 115
      },
      {
        id: "pd-s3",
        reference: "Ecclesiastes 9:5",
        verseText: "For the living know that they shall die: but the dead know not any thing.",
        parentNodeId: "pd-state",
        x: 115,
        y: 470
      },
      {
        id: "pd-s4",
        reference: "John 14:3",
        verseText: "And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.",
        parentNodeId: "pd-advent",
        x: 685,
        y: 530
      }
    ]
  },

  "zoom-studies": {
    trackId: "zoom-studies",
    heroTitle: "ZOOM BIBLE STUDIES",
    shortTitle: "Zoom Bible Studies",
    category: "Fellowship & Synthesis",
    blueprintType: "Interactive Study Archive",
    heroSummary:
      "Structured small-group and live fellowship blueprints—uniting Berean Q&A, prophetic charts, and practical discipleship applications ready to share and teach together.",
    primaryPassage: "2 Timothy 2:15",
    pillarChips: [
      { label: "Berean Inquiry", subtitle: "Line Upon Line", iconKey: "book" },
      { label: "Group Fellowship", subtitle: "Iron Sharpens Iron", iconKey: "compass" },
      { label: "Teach Others", subtitle: "2 Timothy 2:2", iconKey: "sparkles" }
    ],
    nodes: [
      {
        id: "zm-hub",
        label: "Berean Study Model",
        shortTag: "2 Timothy 2:15",
        summary: "Searching the Scriptures daily in community to verify truth, build conviction, and equip disciples to teach others.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        isHub: true,
        connectedTo: ["zm-prophecy", "zm-sanctuary", "zm-gospel", "zm-discipleship"],
        anchorRefs: ["Acts 17:11", "2 Timothy 2:15"]
      },
      {
        id: "zm-prophecy",
        label: "Daniel & Revelation",
        shortTag: "Prophetic Series",
        summary: "Tracing historicist prophetic milestones from Babylon to the final triumph of Christ's kingdom.",
        sectionIndex: 0,
        x: 300,
        y: 185,
        connectedTo: ["zm-hub", "zm-sanctuary"],
        anchorRefs: ["2 Peter 1:19", "Daniel 2:28"]
      },
      {
        id: "zm-sanctuary",
        label: "Sanctuary & Cross",
        shortTag: "Redemption Series",
        summary: "Connecting every piece of tabernacle furniture directly to Christ's saving work for believers today.",
        sectionIndex: 1,
        x: 705,
        y: 185,
        connectedTo: ["zm-hub", "zm-prophecy", "zm-gospel"],
        anchorRefs: ["Hebrews 9:12", "Psalm 77:13"]
      },
      {
        id: "zm-gospel",
        label: "Living Gospel",
        shortTag: "Righteousness",
        summary: "Practical studies on prayer, surrender, victory over temptation, and abiding daily in Christ.",
        sectionIndex: 1,
        x: 700,
        y: 420,
        connectedTo: ["zm-hub", "zm-sanctuary", "zm-discipleship"],
        anchorRefs: ["John 15:5", "Galatians 2:20"]
      },
      {
        id: "zm-discipleship",
        label: "Multiplying Teachers",
        shortTag: "Great Commission",
        summary: "Training everyday believers to lead clear, gracious, Christ-centered Bible studies in homes and online.",
        sectionIndex: 2,
        x: 300,
        y: 420,
        connectedTo: ["zm-hub", "zm-gospel"],
        anchorRefs: ["2 Timothy 2:2", "Matthew 28:19-20"]
      }
    ],
    scriptureNodes: [
      {
        id: "zm-s1",
        reference: "Acts 17:11",
        verseText: "These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily.",
        parentNodeId: "zm-prophecy",
        x: 145,
        y: 125
      },
      {
        id: "zm-s2",
        reference: "2 Timothy 2:15",
        verseText: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
        parentNodeId: "zm-sanctuary",
        x: 855,
        y: 125
      },
      {
        id: "zm-s3",
        reference: "2 Timothy 2:2",
        verseText: "And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also.",
        parentNodeId: "zm-discipleship",
        x: 145,
        y: 475
      }
    ]
  }
};

export const TRACK_BLUEPRINT_ORDER = [
  "fundamental-beliefs",
  "three-angels",
  "sanctuary-doctrine",
  "book-by-book",
  "priority-doctrines",
  "zoom-studies"
] as const;
