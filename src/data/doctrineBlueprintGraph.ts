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

export interface ConstellationPortalNode {
  id: string;
  label: string;
  targetTrackId: string;
  fromNodeId: string;
  relationTag: string;
  x: number;
  y: number;
}

export interface ConstellationDoctrineNode {
  id: string;
  label: string;
  shortTag: string;
  summary: string;
  sectionIndex: number;
  x: number;
  y: number;
  ring?: 0 | 1 | 2 | 3; // Progressive revelation ring (0 = central hub, 1..3 = outward rings)
  isHub?: boolean;
  connectedTo: string[];
  anchorRefs: string[];
  beliefsIncluded?: string[];
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
  portalNodes: ConstellationPortalNode[];
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
      // RING 0: CENTRAL CORE PILLAR (#1)
      {
        id: "fb-1",
        label: "Sola Scriptura",
        shortTag: "#1 Holy Scriptures",
        summary: "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration—the supreme, authoritative, and infallible revelation of His will.",
        sectionIndex: 0,
        x: 500,
        y: 300,
        ring: 0,
        isHub: true,
        connectedTo: ["fb-2", "fb-3", "fb-4", "fb-5", "fb-6", "fb-7"],
        anchorRefs: [
          "2 Timothy 3:16-17",
          "2 Peter 1:20-21",
          "Isaiah 28:9-10",
          "Isaiah 8:20",
          "1 Timothy 4:15-16",
          "2 Timothy 2:15",
          "Psalm 119:105",
          "Acts 17:11"
        ]
      },
      // RING 1: DOCTRINE OF GOD & HUMANITY (#2 - #7) — expanded spacing
      {
        id: "fb-2",
        label: "The Trinity",
        shortTag: "Belief #2",
        summary: "There is one God: Father, Son, and Holy Spirit, a unity of three co-eternal Persons—immortal, all-powerful, all-knowing, and infinitely loving.",
        sectionIndex: 1,
        x: 500,
        y: 120,
        ring: 1,
        connectedTo: ["fb-1", "fb-3", "fb-4", "fb-5"],
        anchorRefs: ["Deuteronomy 6:4", "Matthew 28:19", "2 Corinthians 13:14", "Ephesians 4:4-6"]
      },
      {
        id: "fb-3",
        label: "God the Father",
        shortTag: "Belief #3",
        summary: "God the eternal Father is the Creator, Source, Sustainer, and Sovereign of all creation—just, holy, merciful, and gracious.",
        sectionIndex: 1,
        x: 335,
        y: 205,
        ring: 1,
        connectedTo: ["fb-1", "fb-2", "fb-6", "fb-8"],
        anchorRefs: ["Genesis 1:1", "John 3:16", "John 14:9", "1 John 4:8"]
      },
      {
        id: "fb-4",
        label: "God the Son",
        shortTag: "Belief #4",
        summary: "God the eternal Son became incarnate in Jesus Christ—forever truly God and truly human—who died for our sins and ministers for us in heaven.",
        sectionIndex: 1,
        x: 665,
        y: 205,
        ring: 1,
        connectedTo: ["fb-1", "fb-2", "fb-9", "fb-10"],
        anchorRefs: ["John 1:1-3", "Philippians 2:5-11", "Colossians 1:15-19", "Hebrews 1:1-3"]
      },
      {
        id: "fb-5",
        label: "God the Holy Spirit",
        shortTag: "Belief #5",
        summary: "God the eternal Spirit was active with the Father and the Son in Creation, incarnation, and redemption—inspiring Scripture and transforming believers.",
        sectionIndex: 1,
        x: 665,
        y: 395,
        ring: 1,
        connectedTo: ["fb-1", "fb-2", "fb-11", "fb-17"],
        anchorRefs: ["John 14:16-17", "John 16:13", "2 Peter 1:21", "Acts 1:8"]
      },
      {
        id: "fb-6",
        label: "Creation",
        shortTag: "Belief #6",
        summary: "God has revealed in Scripture the authentic and historical account of His six-day creative activity, resting on the seventh day as a perpetual memorial.",
        sectionIndex: 2,
        x: 335,
        y: 395,
        ring: 1,
        connectedTo: ["fb-1", "fb-3", "fb-7", "fb-20"],
        anchorRefs: ["Genesis 1:1-2", "Exodus 20:8-11", "Psalm 33:6", "Hebrews 11:3"]
      },
      {
        id: "fb-7",
        label: "Nature of Humanity",
        shortTag: "Belief #7",
        summary: "Made in God's image with individuality and freedom of choice, humanity fell into sin and depends wholly on God's grace for restoration.",
        sectionIndex: 2,
        x: 500,
        y: 480,
        ring: 1,
        connectedTo: ["fb-1", "fb-6", "fb-8", "fb-10"],
        anchorRefs: ["Genesis 1:26-27", "Genesis 2:7", "Psalm 8:4-6", "Romans 5:12"]
      },
      // RING 2: SALVATION & THE CHURCH (#8 - #18) — expanded spacing
      {
        id: "fb-8",
        label: "Great Controversy",
        shortTag: "Belief #8",
        summary: "All humanity is involved in a great controversy between Christ and Satan regarding the character of God, His law, and His sovereignty over the universe.",
        sectionIndex: 0,
        x: 190,
        y: 155,
        ring: 2,
        connectedTo: ["fb-3", "fb-7", "fb-9", "fb-24"],
        anchorRefs: ["Revelation 12:7-9", "Isaiah 14:12-14", "Ezekiel 28:14-15", "Job 1:6-12"]
      },
      {
        id: "fb-9",
        label: "Life, Death & Res.",
        shortTag: "Belief #9",
        summary: "In Christ's life of perfect obedience, His suffering, death, and resurrection, God provided the only means of atonement for human sin.",
        sectionIndex: 0,
        x: 810,
        y: 155,
        ring: 2,
        connectedTo: ["fb-4", "fb-8", "fb-10", "fb-16"],
        anchorRefs: ["John 3:16", "Isaiah 53:5-6", "1 Corinthians 15:3-4", "2 Corinthians 5:21"]
      },
      {
        id: "fb-10",
        label: "Salvation Experience",
        shortTag: "Belief #10",
        summary: "Through Christ we are justified, adopted as God's sons and daughters, and delivered from the lordship of sin by faith and the new birth.",
        sectionIndex: 0,
        x: 865,
        y: 280,
        ring: 2,
        connectedTo: ["fb-4", "fb-7", "fb-9", "fb-11"],
        anchorRefs: ["2 Corinthians 5:17", "Ephesians 2:8-10", "John 3:3-6", "Titus 3:5"]
      },
      {
        id: "fb-11",
        label: "Growing in Christ",
        shortTag: "Belief #11",
        summary: "By His death on the cross Jesus triumphed over the forces of evil; as we abide in Him daily through Word and prayer, we grow into His likeness.",
        sectionIndex: 1,
        x: 840,
        y: 410,
        ring: 2,
        connectedTo: ["fb-5", "fb-10", "fb-12", "fb-22"],
        anchorRefs: ["Colossians 2:6-7", "Galatians 5:22-23", "Psalm 1:1-2", "Philippians 4:8"]
      },
      {
        id: "fb-12",
        label: "The Church",
        shortTag: "Belief #12",
        summary: "The church is the community of believers who confess Jesus Christ as Lord and Saviour, called out for worship, fellowship, and worldwide proclamation.",
        sectionIndex: 1,
        x: 745,
        y: 525,
        ring: 2,
        connectedTo: ["fb-11", "fb-13", "fb-14"],
        anchorRefs: ["Matthew 16:18", "1 Peter 2:9", "Ephesians 1:22-23", "Acts 2:42"]
      },
      {
        id: "fb-13",
        label: "Remnant & Mission",
        shortTag: "Belief #13",
        summary: "In the last days a remnant has been called out to keep the commandments of God and the faith of Jesus, proclaiming the Three Angels' Messages.",
        sectionIndex: 1,
        x: 615,
        y: 585,
        ring: 2,
        connectedTo: ["fb-12", "fb-18", "fb-19", "fb-24"],
        anchorRefs: ["Revelation 12:17", "Revelation 14:6-12", "Matthew 28:19-20", "2 Corinthians 5:20"]
      },
      {
        id: "fb-14",
        label: "Unity in Christ",
        shortTag: "Belief #14",
        summary: "The church is one body with many members called from every nation, kindred, tongue, and people—all equal in Christ without distinction.",
        sectionIndex: 1,
        x: 385,
        y: 585,
        ring: 2,
        connectedTo: ["fb-12", "fb-15", "fb-16"],
        anchorRefs: ["Galatians 3:27-28", "Ephesians 4:3-6", "John 17:20-21", "Psalm 133:1"]
      },
      {
        id: "fb-15",
        label: "Baptism",
        shortTag: "Belief #15",
        summary: "By baptism by immersion we confess our faith in the death and resurrection of Jesus Christ and testify of our death to sin and newness of life.",
        sectionIndex: 1,
        x: 255,
        y: 525,
        ring: 2,
        connectedTo: ["fb-14", "fb-10", "fb-16"],
        anchorRefs: ["Romans 6:1-6", "Matthew 28:19", "Acts 2:38", "Colossians 2:12"]
      },
      {
        id: "fb-16",
        label: "Lord's Supper",
        shortTag: "Belief #16",
        summary: "Participation in the emblems of Christ's body and blood, preceded by foot-washing, proclaims His death until He comes again.",
        sectionIndex: 1,
        x: 160,
        y: 410,
        ring: 2,
        connectedTo: ["fb-9", "fb-14", "fb-15"],
        anchorRefs: ["1 Corinthians 11:23-26", "John 13:14-15", "Matthew 26:26-28", "1 Corinthians 10:16"]
      },
      {
        id: "fb-17",
        label: "Spiritual Gifts",
        shortTag: "Belief #17",
        summary: "God bestows upon all members of His church spiritual gifts to be employed in loving ministry for the common good and maturity of the church.",
        sectionIndex: 1,
        x: 135,
        y: 280,
        ring: 2,
        connectedTo: ["fb-5", "fb-12", "fb-18"],
        anchorRefs: ["Ephesians 4:11-13", "1 Corinthians 12:4-7", "Romans 12:4-8", "1 Peter 4:10-11"]
      },
      {
        id: "fb-18",
        label: "Gift of Prophecy",
        shortTag: "Belief #18",
        summary: "The Scriptures testify that one of the gifts of the Holy Spirit is prophecy—an identifying mark of the remnant church, tested by the Bible.",
        sectionIndex: 1,
        x: 335,
        y: 55,
        ring: 2,
        connectedTo: ["fb-1", "fb-13", "fb-17"],
        anchorRefs: ["Joel 2:28-29", "Revelation 12:17", "Revelation 19:10", "2 Chronicles 20:20"]
      },
      // RING 3: CHRISTIAN LIFE & LAST THINGS (#19 - #28) — expanded outer ring
      {
        id: "fb-19",
        label: "Law of God",
        shortTag: "Belief #19",
        summary: "The great principles of God's law are embodied in the Ten Commandments and exemplified in the life of Christ, expressing God's love and will.",
        sectionIndex: 2,
        x: 665,
        y: 55,
        ring: 3,
        connectedTo: ["fb-2", "fb-13", "fb-20"],
        anchorRefs: ["Exodus 20:1-17", "Matthew 5:17-19", "Romans 3:31", "Psalm 40:8"]
      },
      {
        id: "fb-20",
        label: "The Sabbath",
        shortTag: "Belief #20",
        summary: "The beneficent Creator rested on the seventh day and instituted the Sabbath as a perpetual memorial of Creation and sign of sanctification.",
        sectionIndex: 2,
        x: 945,
        y: 80,
        ring: 3,
        connectedTo: ["fb-6", "fb-19", "fb-21"],
        anchorRefs: ["Exodus 20:8-11", "Genesis 2:1-3", "Isaiah 58:13-14", "Mark 2:27-28", "Luke 4:16"]
      },
      {
        id: "fb-21",
        label: "Stewardship",
        shortTag: "Belief #21",
        summary: "We are God's stewards, entrusted with time, opportunities, abilities, possessions, and the blessings of the earth, returning faithful tithes and offerings.",
        sectionIndex: 2,
        x: 1030,
        y: 230,
        ring: 3,
        connectedTo: ["fb-20", "fb-22"],
        anchorRefs: ["Malachi 3:8-10", "2 Corinthians 9:6-7", "Psalm 24:1", "Matthew 23:23"]
      },
      {
        id: "fb-22",
        label: "Christian Behavior",
        shortTag: "Belief #22",
        summary: "Called to be a godly people, we care for our bodies as temples of the Holy Spirit—practicing temperance, healthful living, and Christlike conduct.",
        sectionIndex: 2,
        x: 1020,
        y: 385,
        ring: 3,
        connectedTo: ["fb-11", "fb-21", "fb-23"],
        anchorRefs: ["1 Corinthians 6:19-20", "Romans 12:1-2", "1 Corinthians 10:31", "3 John 1:2"]
      },
      {
        id: "fb-23",
        label: "Marriage & Family",
        shortTag: "Belief #23",
        summary: "Marriage was divinely established in Eden as a lifelong union in loving companionship, reflecting Christ's covenant love for His church.",
        sectionIndex: 2,
        x: 930,
        y: 525,
        ring: 3,
        connectedTo: ["fb-6", "fb-22"],
        anchorRefs: ["Genesis 2:24", "Ephesians 5:25", "Deuteronomy 6:6-7", "Proverbs 22:6"]
      },
      {
        id: "fb-24",
        label: "Heavenly Sanctuary",
        shortTag: "Belief #24",
        summary: "Christ ministers as High Priest in the true heavenly sanctuary, entering the Most Holy Place in 1844 to perform the investigative judgment.",
        sectionIndex: 1,
        x: 55,
        y: 80,
        ring: 3,
        connectedTo: ["fb-8", "fb-13", "fb-25"],
        anchorRefs: ["Hebrews 8:1-5", "Daniel 8:14", "Exodus 25:8", "Leviticus 16:30", "Revelation 11:19"]
      },
      {
        id: "fb-25",
        label: "Second Coming",
        shortTag: "Belief #25",
        summary: "The second coming of Christ is the blessed hope of the church—literal, personal, visible, and worldwide, when the righteous dead are raised.",
        sectionIndex: 1,
        x: -30,
        y: 230,
        ring: 3,
        connectedTo: ["fb-24", "fb-26"],
        anchorRefs: ["Titus 2:13", "John 14:1-3", "Acts 1:11", "Revelation 1:7", "1 Thessalonians 4:16"]
      },
      {
        id: "fb-26",
        label: "Death & Resurrection",
        shortTag: "Belief #26",
        summary: "The wages of sin is death, an unconscious state for all until the resurrection at Christ's return when immortality is bestowed on the redeemed.",
        sectionIndex: 1,
        x: -20,
        y: 385,
        ring: 3,
        connectedTo: ["fb-7", "fb-25", "fb-27"],
        anchorRefs: ["Ecclesiastes 9:5-6", "John 11:11-14", "1 Thessalonians 4:13-17", "1 Corinthians 15:51-54"]
      },
      {
        id: "fb-27",
        label: "Millennium",
        shortTag: "Belief #27",
        summary: "The millennium is the 1,000-year reign of Christ with His saints in heaven between the first and second resurrections, culminating in the end of sin.",
        sectionIndex: 1,
        x: 70,
        y: 525,
        ring: 3,
        connectedTo: ["fb-26", "fb-28"],
        anchorRefs: ["Revelation 20:1-6", "1 Corinthians 6:2-3", "Jeremiah 4:23-26", "Malachi 4:1"]
      },
      {
        id: "fb-28",
        label: "The New Earth",
        shortTag: "Belief #28",
        summary: "On the New Earth, in which righteousness dwells, God will provide an eternal home for the redeemed—where sin and death will be no more.",
        sectionIndex: 2,
        x: 500,
        y: 655,
        ring: 3,
        connectedTo: ["fb-6", "fb-27", "fb-13"],
        anchorRefs: ["Revelation 21:1-4", "Isaiah 65:17", "2 Peter 3:13", "Isaiah 66:22-23"]
      }
    ],
    scriptureNodes: [
      {
        id: "fb-s1",
        reference: "2 Timothy 3:16",
        verseText: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
        parentNodeId: "fb-2",
        x: 500,
        y: -15
      },
      {
        id: "fb-s2",
        reference: "Exodus 20:11",
        verseText: "For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
        parentNodeId: "fb-20",
        x: 1060,
        y: 30
      },
      {
        id: "fb-s3",
        reference: "Daniel 8:14",
        verseText: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        parentNodeId: "fb-24",
        x: -60,
        y: 30
      },
      {
        id: "fb-s4",
        reference: "Revelation 21:4",
        verseText: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying.",
        parentNodeId: "fb-28",
        x: 700,
        y: 660
      }
    ],
    portalNodes: [
      {
        id: "fb-p-sanctuary",
        label: "Heavenly Sanctuary",
        targetTrackId: "sanctuary-doctrine",
        fromNodeId: "fb-24",
        relationTag: "Belief #24 Bridge",
        x: -75,
        y: 145
      },
      {
        id: "fb-p-angels",
        label: "Three Angels' Messages",
        targetTrackId: "three-angels",
        fromNodeId: "fb-13",
        relationTag: "Remnant Bridge",
        x: 270,
        y: 655
      },
      {
        id: "fb-p-covenant",
        label: "Covenant Foundations",
        targetTrackId: "priority-doctrines",
        fromNodeId: "fb-20",
        relationTag: "Sabbath Bridge",
        x: 1075,
        y: 145
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
    ],
    portalNodes: [
      {
        id: "ta-p-sanctuary",
        label: "Heavenly Sanctuary",
        targetTrackId: "sanctuary-doctrine",
        fromNodeId: "ta-judgment",
        relationTag: "Hour of Judgment",
        x: 500,
        y: 72
      },
      {
        id: "ta-p-beliefs",
        label: "28 Fundamental Beliefs",
        targetTrackId: "fundamental-beliefs",
        fromNodeId: "ta-remnant",
        relationTag: "Full System",
        x: 300,
        y: 535
      },
      {
        id: "ta-p-covenant",
        label: "Covenant Foundations",
        targetTrackId: "priority-doctrines",
        fromNodeId: "ta-seal",
        relationTag: "Sabbath Seal",
        x: 895,
        y: 440
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
    ],
    portalNodes: [
      {
        id: "sn-p-angels",
        label: "Three Angels' Messages",
        targetTrackId: "three-angels",
        fromNodeId: "sn-2300",
        relationTag: "1844 Proclamation",
        x: 500,
        y: 72
      },
      {
        id: "sn-p-beliefs",
        label: "28 Fundamental Beliefs",
        targetTrackId: "fundamental-beliefs",
        fromNodeId: "sn-ark",
        relationTag: "Core System",
        x: 310,
        y: 535
      },
      {
        id: "sn-p-scrolls",
        label: "Sacred Scrolls Exegesis",
        targetTrackId: "book-by-book",
        fromNodeId: "sn-mostholy",
        relationTag: "Daniel & Hebrews",
        x: 895,
        y: 445
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
    ],
    portalNodes: [
      {
        id: "bb-p-sanctuary",
        label: "Heavenly Sanctuary",
        targetTrackId: "sanctuary-doctrine",
        fromNodeId: "bb-hebrews",
        relationTag: "Hebrews Blueprint",
        x: 895,
        y: 455
      },
      {
        id: "bb-p-angels",
        label: "Three Angels' Messages",
        targetTrackId: "three-angels",
        fromNodeId: "bb-revelation",
        relationTag: "Revelation 14",
        x: 310,
        y: 535
      },
      {
        id: "bb-p-beliefs",
        label: "28 Fundamental Beliefs",
        targetTrackId: "fundamental-beliefs",
        fromNodeId: "bb-daniel",
        relationTag: "Systematic Truth",
        x: 500,
        y: 72
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
    ],
    portalNodes: [
      {
        id: "pd-p-beliefs",
        label: "28 Fundamental Beliefs",
        targetTrackId: "fundamental-beliefs",
        fromNodeId: "pd-grace",
        relationTag: "Full Pillar Map",
        x: 500,
        y: 72
      },
      {
        id: "pd-p-angels",
        label: "Three Angels' Messages",
        targetTrackId: "three-angels",
        fromNodeId: "pd-sabbath",
        relationTag: "Creator's Seal",
        x: 895,
        y: 300
      },
      {
        id: "pd-p-zoom",
        label: "Zoom Bible Studies",
        targetTrackId: "zoom-studies",
        fromNodeId: "pd-advent",
        relationTag: "Small-Group Guide",
        x: 310,
        y: 535
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
    ],
    portalNodes: [
      {
        id: "zm-p-beliefs",
        label: "28 Fundamental Beliefs",
        targetTrackId: "fundamental-beliefs",
        fromNodeId: "zm-prophecy",
        relationTag: "Doctrinal Core",
        x: 500,
        y: 72
      },
      {
        id: "zm-p-sanctuary",
        label: "Heavenly Sanctuary",
        targetTrackId: "sanctuary-doctrine",
        fromNodeId: "zm-sanctuary",
        relationTag: "Tabernacle Blueprint",
        x: 880,
        y: 460
      },
      {
        id: "zm-p-covenant",
        label: "Covenant Foundations",
        targetTrackId: "priority-doctrines",
        fromNodeId: "zm-gospel",
        relationTag: "Grace & Obedience",
        x: 500,
        y: 540
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
