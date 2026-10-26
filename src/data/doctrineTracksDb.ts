export interface DoctrineSection {
  title: string;
  summary: string;
  key_references: string[];
}

export interface DoctrineOutline {
  sections: DoctrineSection[];
}

export interface KeyReference {
  id: string;
  reference: string;
  text: string;
}

export interface STBASequenceItem {
  type: "context" | "doctrine" | "application" | "cross_references";
  primary_reference: string;
  cross_references: string[];
  doctrinal_focus: string;
  content: string;
}

export interface ActiveRecallPrompt {
  id: string;
  prompt: string;
  expected_answer: string;
  reference?: string;
}

export interface RubricCategory {
  key: "understanding" | "accuracy" | "memorization" | "clarity" | "doctrinal_alignment";
  label: string;
  description: string;
}

export interface TeachItRubric {
  categories: RubricCategory[];
}

export interface DoctrineTrackDb {
  id: string;
  description: string;
  outline: DoctrineOutline;
  key_references: KeyReference[];
  stba_sequence: STBASequenceItem[];
  active_recall_prompts: ActiveRecallPrompt[];
  teach_it_rubric: TeachItRubric;
}

export const DEFAULT_DOCTRINE_TRACKS: Record<string, DoctrineTrackDb> = {
  "fundamental-beliefs": {
    id: "fundamental-beliefs",
    description: "Discover the deep internal cohesion and organic unity of our 28 biblical tenets of faith, anchored in Sola Scriptura.",
    outline: {
      sections: [
        {
          title: "The Holy Scriptures (Fundamental #1)",
          summary: "The Holy Scriptures are the written Word of God, given by divine inspiration through holy men of God who spoke and wrote as they were moved by the Holy Spirit.",
          key_references: ["2 Timothy 3:16", "2 Peter 1:21"]
        },
        {
          title: "The Trinity & The Godhead (Fundamental #2)",
          summary: "There is one God: Father, Son, and Holy Spirit, a unity of three co-eternal Persons. God is immortal, all-powerful, and infinitely loving.",
          key_references: ["Deuteronomy 6:4", "Matthew 28:19"]
        },
        {
          title: "The Character of God in Creation (Fundamental #5)",
          summary: "God is the Creator of all things, and has revealed in Scripture the authentic and historical account of His creative activity.",
          key_references: ["Genesis 1:27", "Exodus 20:11"]
        }
      ]
    },
    key_references: [
      {
        id: "fb-1",
        reference: "2 Timothy 3:16",
        text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness."
      },
      {
        id: "fb-2",
        reference: "Romans 1:16",
        text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth."
      },
      {
        id: "fb-3",
        reference: "Genesis 1:27",
        text: "So God created man in his own image, in the image of God created he him; male and female created he them."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "2 Timothy 3:16",
        cross_references: ["2 Peter 1:21", "Luke 24:27"],
        doctrinal_focus: "Thought Inspiration vs Verbal Dictation",
        content: "Written by the Apostle Paul from a cold Roman dungeon to his young protege Timothy. Paul was facing imminent martyrdom under Emperor Nero, making this statement his absolute final theological testament on the authority of truth."
      },
      {
        type: "doctrine",
        primary_reference: "2 Timothy 3:16",
        cross_references: ["John 5:39", "Isaiah 8:20"],
        doctrinal_focus: "Sola Scriptura & Divine Inspiration",
        content: "SDA hermeneutics hold that God inspired the writers with thoughts (moving holy men through the Spirit), which they then conveyed in their own human words. The Bible is the union of the divine and human."
      },
      {
        type: "application",
        primary_reference: "2 Timothy 3:16",
        cross_references: ["Psalm 119:105"],
        doctrinal_focus: "Inerrant Guardrail for Lifestyle",
        content: "Anchor your personal conviction in the clear text of Scripture rather than shifting culture, public consensus, or emotional feelings. Let the Bible actively correct your lifestyle daily."
      },
      {
        type: "cross_references",
        primary_reference: "2 Timothy 3:16",
        cross_references: ["2 Peter 1:21", "Luke 24:44", "John 17:17"],
        doctrinal_focus: "Organic Scriptural Harmony",
        content: "Connecting the Old and New Testaments reveals a single, coherent plan of salvation. As 2 Peter 1:21 says, prophecy came not by the will of man, but holy men spoke as they were moved by the Holy Ghost."
      },
      // Romans 1:16
      {
        type: "context",
        primary_reference: "Romans 1:16",
        cross_references: ["Acts 9:15", "Romans 15:15"],
        doctrinal_focus: "The Might of Rome vs. The Power of Grace",
        content: "Paul was writing to the church in Rome—the epicentre of imperial power, military might, and philosophical pride. While Rome valued material domination, Paul champions a quiet spiritual power that heals souls."
      },
      {
        type: "doctrine",
        primary_reference: "Romans 1:16",
        cross_references: ["Galatians 2:16", "Ephesians 2:8"],
        doctrinal_focus: "Restorative Justification by Faith",
        content: "The Righteousness of Christ. The gospel is God's dynamic, restorative power ('dunamis') to recreate the broken image of God in humans. Salvation is an unmerited gift received purely by faith."
      },
      {
        type: "application",
        primary_reference: "Romans 1:16",
        cross_references: ["Mark 8:38"],
        doctrinal_focus: "Unashamed Boldness of Witness",
        content: "Never shrink from declaring the distinctive, unpopular truths of the Three Angels' messages. Knowing Christ has conquered sin and death gives you courage to stand as a light-bearer in your community."
      },
      {
        type: "cross_references",
        primary_reference: "Romans 1:16",
        cross_references: ["1 Corinthians 1:18", "Romans 3:22", "Habakkuk 2:4"],
        doctrinal_focus: "The Just Shall Live By Faith",
        content: "Paul builds on Habakkuk 2:4 to demonstrate that righteousness is not achieved by legalistic ceremonialism, but received through absolute trust in God's covenant faithfulness."
      },
      // Genesis 1:27
      {
        type: "context",
        primary_reference: "Genesis 1:27",
        cross_references: ["Genesis 2:7", "Deuteronomy 4:32"],
        doctrinal_focus: "Wilderness Realities and Egypt's Myths",
        content: "Authored by Moses during Israel's Wilderness wandering, designed to teach a newly freed nation of slaves their true origin and dignity, standing in stark contrast to the bizarre polytheistic myths of Egypt."
      },
      {
        type: "doctrine",
        primary_reference: "Genesis 1:27",
        cross_references: ["Colossians 3:10", "1 Thessalonians 5:23"],
        doctrinal_focus: "Imago Dei & Indivisible Wholeness",
        content: "Human beings did not evolve from animal ancestors through millions of years of bloodshed. We are direct masterpieces of divine design. Body, mind, and spirit form an indivisible, holy wholeness."
      },
      {
        type: "application",
        primary_reference: "Genesis 1:27",
        cross_references: ["1 Corinthians 6:19"],
        doctrinal_focus: "Honoring the Body Temple",
        content: "Treat your physical body temple with absolute reverence through clean, balanced health habits. Recognizing that you are made in the image of God defines your eternal worth."
      },
      {
        type: "cross_references",
        primary_reference: "Genesis 1:27",
        cross_references: ["Genesis 1:26", "Matthew 19:4", "James 3:9"],
        doctrinal_focus: "Creative Equality and Identity",
        content: "Jesus refers back to Genesis in Matthew 19:4, confirming that male and female equality was established at the literal beginning, establishing the sacred foundation of human identity."
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-1",
        prompt: "Recite or explain the theological significance of 2 Timothy 3:16 regarding the divine origin and practical utility of God's Word.",
        expected_answer: "Scripture is inspired of God and profitable for doctrine, reproof, correction, and instruction in righteousness.",
        reference: "2 Timothy 3:16"
      },
      {
        id: "fb-prompt-2",
        prompt: "According to Romans 1:16, why is Paul not ashamed, and what is the gospel's true definition?",
        expected_answer: "He is not ashamed of the gospel of Christ because it is the power of God unto salvation to everyone who believes.",
        reference: "Romans 1:16"
      },
      {
        id: "fb-prompt-3",
        prompt: "What does Genesis 1:27 reveal about the origin, dignity, and gender equality of humanity?",
        expected_answer: "God created man in His own image, both male and female, as direct masterworks of His love.",
        reference: "Genesis 1:27"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Scriptural Understanding", description: "Demonstrates clear conceptual grasp of the texts' historical background." },
        { key: "accuracy", label: "Theological Accuracy", description: "Presents correct SDA doctrines of thought inspiration and justification." },
        { key: "memorization", label: "Verse Retrieval", description: "Correctly recalls key scriptures and coordinates reference links." },
        { key: "clarity", label: "Pedagogical Simplicity", description: "Explains concepts simply, using a relatable analogy fit for a child." },
        { key: "doctrinal_alignment", label: "SDA Faithful Alignment", description: "Keeps Christ's character of love and Sola Scriptura at the center." }
      ]
    }
  },
  "three-angels": {
    id: "three-angels",
    description: "Revelation 14 focused active semantic tracking, exploring restoration, cosmic sanctuary justice and Sabbath.",
    outline: {
      sections: [
        {
          title: "The First Angel's Message (Rev 14:6-7)",
          summary: "Proclaims the everlasting gospel, announces the arrival of the investigative judgment hour, and calls all humanity to worship the Creator on His holy Sabbath.",
          key_references: ["Revelation 14:6", "Revelation 14:7"]
        },
        {
          title: "The Second Angel's Message (Rev 14:8)",
          summary: "Announces the spiritual fall of Babylon, warning against drinking her toxic, confused mixtures of false traditions and state-church alliances.",
          key_references: ["Revelation 14:8", "Jeremiah 51:8"]
        },
        {
          title: "The Third Angel's Message (Rev 14:9-12)",
          summary: "Gives a solemn warning against receiving the mark of the beast, highlighting the ultimate remnant of saints who keep the commandments of God and the faith of Jesus.",
          key_references: ["Revelation 14:12", "Exodus 20:8"]
        }
      ]
    },
    key_references: [
      {
        id: "ta-1",
        reference: "Revelation 14:6",
        text: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth."
      },
      {
        id: "ta-2",
        reference: "Revelation 14:7",
        text: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him."
      },
      {
        id: "ta-3",
        reference: "Revelation 14:12",
        text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "Revelation 14:6",
        cross_references: ["Ephesians 3:9"],
        doctrinal_focus: "The Zenith Flight of Truth",
        content: "A vision given to John on Patmos. The first angel flies in 'mid-heaven' (or the zenith), representing that this warning has global visibility and urgent, rapid distribution to every nation, tongue, and tribe."
      },
      {
        type: "doctrine",
        primary_reference: "Revelation 14:6",
        cross_references: ["Romans 1:16", "Galatians 1:8"],
        doctrinal_focus: "The Everlasting Gospel Unity",
        content: "The Everlasting Gospel. There is only one plan of salvation throughout human history, from Genesis to Revelation. Christ's sacrificial, substituting righteousness is the absolute core of the final warning messages."
      },
      {
        type: "application",
        primary_reference: "Revelation 14:6",
        cross_references: ["Luke 24:47"],
        doctrinal_focus: "Win Hearts with Christ's Mercy",
        content: "Whenever you share Bible prophecy, ground it thoroughly in Christ's saving love. Do not present timelines as cold academic proofs; show them as the dynamic layout of Jesus' justice."
      },
      {
        type: "cross_references",
        primary_reference: "Revelation 14:6",
        cross_references: ["Genesis 3:15", "Hebrews 13:8"],
        doctrinal_focus: "Perpetual Gospel Covenant",
        content: "This gospel has been everlasting because it is based on Christ's unchangeable sacrifice which was planned before the foundation of the world."
      },
      // Revelation 14:7
      {
        type: "context",
        primary_reference: "Revelation 14:7",
        cross_references: ["Leviticus 16:30"],
        doctrinal_focus: "Antitypical Day of Atonement",
        content: "Introduced as the antitypical Day of Atonement, the investigative judgment beginning in 1844, calling humanity back to true, original worship as the world collapses in Babylon's spiritual confusion."
      },
      {
        type: "doctrine",
        primary_reference: "Revelation 14:7",
        cross_references: ["Ecclesiastes 12:14", "Exodus 20:11"],
        doctrinal_focus: "Judgment & Creative Sabbath",
        content: "The Judgment Hour & Creation Sabbath. 'Fear God and give glory to Him.' A direct command to worship the Creator of the heavens and earth, using language quoted directly from the Fourth Commandment."
      },
      {
        type: "application",
        primary_reference: "Revelation 14:7",
        cross_references: ["1 John 4:18"],
        doctrinal_focus: "Confidence, Not Fear, in Judgment",
        content: "Living under the judgment is not a matter of legalistic fear. It means living transparently before God, letting the blood of Jesus cover your past and transform your character daily."
      },
      {
        type: "cross_references",
        primary_reference: "Revelation 14:7",
        cross_references: ["Daniel 7:10", "Exodus 20:11", "Acts 17:31"],
        doctrinal_focus: "Worship of the Sovereign Creator",
        content: "The call to worship Him who made heaven and earth links directly back to the Sabbath commandment of Exodus 20:11, identifying the true focal point of worship."
      },
      // Revelation 14:12
      {
        type: "context",
        primary_reference: "Revelation 14:12",
        cross_references: ["Revelation 12:17"],
        doctrinal_focus: "Final Conflict over Authority",
        content: "The climax of the great controversy between Christ and Satan over the law of God. The remnant stand unyielding through the final testing hour, upheld by absolute devotion."
      },
      {
        type: "doctrine",
        primary_reference: "Revelation 14:12",
        cross_references: ["Philippians 2:5", "Romans 3:31"],
        doctrinal_focus: "Obedience Linked with Faith",
        content: "Commandments of God & Faith of Jesus. The final saints are identified by their faithful obedience to all ten commandments (including the Seventh-day Sabbath) and possessing the identical faith that carried Jesus through Gethsemane."
      },
      {
        type: "application",
        primary_reference: "Revelation 14:12",
        cross_references: ["Ephesians 6:13"],
        doctrinal_focus: "Morning Watch and Character Stamina",
        content: "Spend quiet time in the early morning building a personal relationship with Christ. Only a deep, living trust in Him will give you the stamina and 'patience' to stand under trial."
      },
      {
        type: "cross_references",
        primary_reference: "Revelation 14:12",
        cross_references: ["Revelation 12:17", "Luke 18:8", "Hebrews 12:2"],
        doctrinal_focus: "Remnant Character Markers",
        content: "This matches Revelation 12:17, demonstrating that the remnant preserve the commandments of God and have the testimony of Jesus."
      }
    ],
    active_recall_prompts: [
      {
        id: "ta-prompt-1",
        prompt: "What is the mission of the first angel flying in heaven according to Revelation 14:6, and what is his message called?",
        expected_answer: "The angel flies having the everlasting gospel to preach to all who dwell on the earth.",
        reference: "Revelation 14:6"
      },
      {
        id: "ta-prompt-2",
        prompt: "Recite the three components of the first angel's loud command in Revelation 14:7.",
        expected_answer: "Fear God, give glory to Him for the hour of His judgment is come, and worship Him who made heaven and earth.",
        reference: "Revelation 14:7"
      },
      {
        id: "ta-prompt-3",
        prompt: "How are the final saints of God described in Revelation 14:12?",
        expected_answer: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        reference: "Revelation 14:12"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Prophetic Scope", description: "Demonstrates clear understanding of Revelation 14 and sanctuary origins." },
        { key: "accuracy", label: "Doctrinal Safeguard", description: "Presents correct distinctions regarding the mark of the beast vs the divine seal." },
        { key: "memorization", label: "Prophetic Chains", description: "Recalls verses perfectly, linking prophetic patterns systematically." },
        { key: "clarity", label: "Simplifying Symbols", description: "Explains complex seals and beasts using simple, love-filled, relatable analogies." },
        { key: "doctrinal_alignment", label: "Remnant Identity Focus", description: "Anchors the proclamation strictly in the commandments of God and the faith of Jesus." }
      ]
    }
  },
  "sanctuary-doctrine": {
    id: "sanctuary-doctrine",
    description: "From earthly tabernacle pattern to heaven's realities. Master the exact theological shadows systematically.",
    outline: {
      sections: [
        {
          title: "The Cleansing Command (Daniel 8:14)",
          summary: "Provides the epic mathematical timeline of 2300 days pointing to the investigative judgment and the cleansing of the sanctuary in 1844.",
          key_references: ["Daniel 8:14"]
        },
        {
          title: "The Great High Priest (Hebrews 8:1-2)",
          summary: "Declares that Christ is our ultimate Minister in the true heavenly tabernacle, fulfilling every shadow of earthly Levitical services.",
          key_references: ["Hebrews 8:1-2"]
        },
        {
          title: "The Earthly Pattern (Exodus 25:8)",
          summary: "God asks for a physical sanctuary built from willing hearts, so that He may visually dwell among His people and teach them the steps of salvation.",
          key_references: ["Exodus 25:8"]
        }
      ]
    },
    key_references: [
      {
        id: "sd-1",
        reference: "Daniel 8:14",
        text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed."
      },
      {
        id: "sd-2",
        reference: "Hebrews 8:1-2",
        text: "We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary."
      },
      {
        id: "sd-3",
        reference: "Exodus 25:8",
        text: "And let them make me a sanctuary; that I may dwell among them."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "Daniel 8:14",
        cross_references: ["Daniel 9:24"],
        doctrinal_focus: "Exile and Earthly Temple Ruins",
        content: "Given to Daniel during the Babylonian captivity when the earthly temple lay in blackened ruins. The angel Gabriel reassures him that although earthly powers would defile truth, God's heavenly ministry would be vindicated."
      },
      {
        type: "doctrine",
        primary_reference: "Daniel 8:14",
        cross_references: ["Leviticus 16:16", "Daniel 9:25"],
        doctrinal_focus: "The Day of Atonement cleansing",
        content: "Ending the 2300-year prophecy in 1844, this marks the transition of Christ's high-priestly intercession into the Most Holy Place, reviewing the books of life and vindicating His people."
      },
      {
        type: "application",
        primary_reference: "Daniel 8:14",
        cross_references: ["1 Corinthians 3:16"],
        doctrinal_focus: "Vindicating the Personal Temple",
        content: "Cooperate with your Savior in cleansing your personal soul-temple. Let Him examine your heart, remove hidden anger, and replace bad habits with His fruit."
      },
      {
        type: "cross_references",
        primary_reference: "Daniel 8:14",
        cross_references: ["Daniel 9:24-27", "Numbers 14:34", "Ezekiel 4:6"],
        doctrinal_focus: "Day-Year Principle",
        content: "Using the day-year principle found in Numbers 14:34 and Ezekiel 4:6, this massive 2300-year prophecy is unlocked, aligning with Daniel 9's 70-week prophecy."
      },
      // Hebrews 8:1-2
      {
        type: "context",
        primary_reference: "Hebrews 8:1-2",
        cross_references: ["Hebrews 9:11"],
        doctrinal_focus: "Consolations to Temple-less Hebrews",
        content: "Written to first-century Hebrew Christians who were mourning the loss of the majestic earthly temple. Paul redirects their eyes upward, explaining that the earthly shadow has been replaced by an infinite, glorious reality."
      },
      {
        type: "doctrine",
        primary_reference: "Hebrews 8:1-2",
        cross_references: ["1 Timothy 2:5", "Hebrews 4:14"],
        doctrinal_focus: "Direct Mediation in the Heavenly Sanctuary",
        content: "The Heavenly Priesthood of Christ. Jesus is our only true Mediator, pleading His blood in the true tabernacle pitched by God, not man. We have direct access to Him without needing earthly priests."
      },
      {
        type: "application",
        primary_reference: "Hebrews 8:1-2",
        cross_references: ["Hebrews 4:16"],
        doctrinal_focus: "Bold Access to Grace",
        content: "Enter boldly into prayer. Whenever you feel overwhelmed by guilt or spiritual fatigue, remember you have a sympathetic High Priest in heaven who lives to plead your cause."
      },
      {
        type: "cross_references",
        primary_reference: "Hebrews 8:1-2",
        cross_references: ["Hebrews 9:24", "Hebrews 7:25", "Psalm 110:4"],
        doctrinal_focus: "Melchizedek Priesthood",
        content: "Jesus' priestly ministry is superior to the Aaronic lineage, operating after the order of Melchizedek, directly in the presence of God."
      },
      // Exodus 25:8
      {
        type: "context",
        primary_reference: "Exodus 25:8",
        cross_references: ["Exodus 24:18"],
        doctrinal_focus: "The Sinai Tabernacle Commission",
        content: "Delivered to Moses on Mount Sinai amidst thunder and cloud. God instructs a wandering people to build a physical structure using voluntary offerings given from 'willing hearts.'"
      },
      {
        type: "doctrine",
        primary_reference: "Exodus 25:8",
        cross_references: ["Colossians 2:17", "Hebrews 9:1-5"],
        doctrinal_focus: "Interactive Object Lesson of Salvation",
        content: "The Sanctuary Pattern. Every sacrifice, furnishing, and curtain in the earthly sanctuary was an interactive, physical object lesson outlining the entire plan of salvation—from Calvary to the Judgment."
      },
      {
        type: "application",
        primary_reference: "Exodus 25:8",
        cross_references: ["Ephesians 2:22"],
        doctrinal_focus: "Clearing Local Temple Clutter",
        content: "God's deepest, most passionate desire is to 'dwell among' His people. Clear out any clutter of worldly noise or pride, and invite Him into your heart today."
      },
      {
        type: "cross_references",
        primary_reference: "Exodus 25:8",
        cross_references: ["Exodus 25:9", "Exodus 25:40", "Revelation 11:19"],
        doctrinal_focus: "Divine Pattern and Blueprint",
        content: "Moses was repeatedly warned to build according to the exact pattern shown on the mount, which was a copy of the ultimate heavenly temple."
      }
    ],
    active_recall_prompts: [
      {
        id: "sd-prompt-1",
        prompt: "Recite Daniel 8:14 and outline the mathematical meaning of the 2300-day prophecy in Adventist theology.",
        expected_answer: "Unto 2300 days, then shall the sanctuary be cleansed. This points to the start of the investigative judgment in 1844.",
        reference: "Daniel 8:14"
      },
      {
        id: "sd-prompt-2",
        prompt: "Where is our High Priest currently ministering according to Hebrews 8:1-2, and who pitched this tabernacle?",
        expected_answer: "He is set on the right hand of the throne of Majesty in the heavens, a minister of the sanctuary which the Lord pitched, not man.",
        reference: "Hebrews 8:1-2"
      },
      {
        id: "sd-prompt-3",
        prompt: "What is God's purpose in asking His people to construct a sanctuary in Exodus 25:8?",
        expected_answer: "Let them make Me a sanctuary; that I may dwell among them.",
        reference: "Exodus 25:8"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Levitical Shadows", description: "Demonstrates clear understanding of the sanctuary structure (Court, Holy, Most Holy)." },
        { key: "accuracy", label: "Mediatorial Sincerity", description: "Correctly outlines Christ's dual-phase heavenly intercession (1844 onward)." },
        { key: "memorization", label: "Atonement Chains", description: "Retrieves Hebrew study verses and Levitical matches flawlessly." },
        { key: "clarity", label: "Hospital Analogy", description: "Communicates the complex sanctuary steps using the simple, non-legalistic 'hospital' analogy." },
        { key: "doctrinal_alignment", label: "Vindicated Character", description: "Aligns the judgment hour with God's ultimate character of love and restorative justice." }
      ]
    }
  },
  "sabbath-school": {
    id: "sabbath-school",
    description: "Active-recall summaries corresponding to the current global adult SDA Sabbath School bible study layout.",
    outline: {
      sections: [
        {
          title: "Sabbath Rest in Christ (Matthew 11:28)",
          summary: "Jesus invites all who are heavy laden to find true rest in Him, establishing rest as the true foundation of obedience.",
          key_references: ["Matthew 11:28"]
        },
        {
          title: "The Sabbath Covenant Maker (Mark 2:27)",
          summary: "The Sabbath was created for man's happiness and relationship, not to act as a burden of legalistic restrictions.",
          key_references: ["Mark 2:27"]
        }
      ]
    },
    key_references: [
      {
        id: "ss-1",
        reference: "Matthew 11:28",
        text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest."
      },
      {
        id: "ss-2",
        reference: "Mark 2:27",
        text: "And he said unto them, The sabbath was made for man, and not man for the sabbath."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "Matthew 11:28",
        cross_references: ["Matthew 11:29-30"],
        doctrinal_focus: "Pharisaic Burdens and Galilee commoners",
        content: "Uttered by Christ to the common working people of Galilee, who were spiritually exhausted, bent double under the massive load of legalistic traditions and oral restrictions piled on by the Pharisees."
      },
      {
        type: "doctrine",
        primary_reference: "Matthew 11:28",
        cross_references: ["Galatians 3:24", "Romans 5:1"],
        doctrinal_focus: "Law as a Mirror and Rest as Foundation",
        content: "True Christian rest is not a reward for perfect self-reliant effort. It is the foundation of obedience. We obey His law because we are secure in His rest."
      },
      {
        type: "application",
        primary_reference: "Matthew 11:28",
        cross_references: ["Philippians 4:6-7"],
        doctrinal_focus: "Laying Down Bags of Performance",
        content: "Lay down your heavy bags of performance anxiety, religious pride, or feelings of inadequacy. Take a deep breath and rest in Christ's finished work of salvation."
      },
      {
        type: "cross_references",
        primary_reference: "Matthew 11:28",
        cross_references: ["Exodus 33:14", "Jeremiah 6:16", "Hebrews 4:9"],
        doctrinal_focus: "The Sabbath rest of Hebrews 4",
        content: "This spiritual rest points directly to the ultimate Sabbath-rest remaining for the people of God, as explored systematically in Hebrews 4."
      },
      // Mark 2:27
      {
        type: "context",
        primary_reference: "Mark 2:27",
        cross_references: ["Mark 2:23-26"],
        doctrinal_focus: "Rubbing Heads of Grain in fields",
        content: "Spoken by Christ in response to the legalistic Pharisees who accused His disciples of 'working' because they rubbed heads of grain in their hands to eat while walking through a field on the Sabbath."
      },
      {
        type: "doctrine",
        primary_reference: "Mark 2:27",
        cross_references: ["Genesis 2:1-3", "Exodus 20:8-11"],
        doctrinal_focus: "Sabbath as Edenic Memorial",
        content: "The Sabbath Covenant. The Sabbath was created at Eden, long before any Jewish economy, as a perpetual sanctuary in time designed for human rest, relationship, and celebrating our Creator's love."
      },
      {
        type: "application",
        primary_reference: "Mark 2:27",
        cross_references: ["Isaiah 58:13-14"],
        doctrinal_focus: "Delighting in the Sanctuary of Time",
        content: "Welcome the Sabbath hours with joy rather than view them as a list of restrictions. Treat it as a weekly date-night with your Creator, stepping away from phones and work."
      },
      {
        type: "cross_references",
        primary_reference: "Mark 2:27",
        cross_references: ["Luke 4:16", "Genesis 2:3", "Ezekiel 20:12"],
        doctrinal_focus: "Sanctifying and Sign-Covenant",
        content: "Ezekiel 20:12 shows the Sabbath is a sign that God is the one who sanctifies His people. Jesus' habit was to enter the synagogue on Sabbath, validating His own creation."
      }
    ],
    active_recall_prompts: [
      {
        id: "ss-prompt-1",
        prompt: "Recite Matthew 11:28 and describe the rest Jesus promises to those who labor.",
        expected_answer: "Come unto Me, all ye that labor and are heavy laden, and I will give you rest.",
        reference: "Matthew 11:28"
      },
      {
        id: "ss-prompt-2",
        prompt: "According to Mark 2:27, why was the Sabbath made, and what did Jesus prioritize?",
        expected_answer: "The Sabbath was made for man, and not man for the Sabbath.",
        reference: "Mark 2:27"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Devotional Insight", description: "Demonstrates active daily reflection and engagement with the quarterly topic." },
        { key: "accuracy", label: "Covenant Grace", description: "Maintains clear distinction between legalistic Sabbath restrictions and Christian liberty." },
        { key: "memorization", label: "Quarterly Anchoring", description: "Perfect retrieval of weekly memory texts and cross-references." },
        { key: "clarity", label: "Sabbath Delight Analogy", description: "Frames Sabbath as a joyful 'weekly date' with the Creator using simple terms." },
        { key: "doctrinal_alignment", label: "Christ as Lord of the Sabbath", description: "Maintains Jesus as the ultimate Lord, Creator, and Rest of the Sabbath." }
      ]
    }
  },
  "book-by-book": {
    id: "book-by-book",
    description: "Recall structured scriptures sequentially. Focused on Hebrews, Ephesians, and Romans.",
    outline: {
      sections: [
        {
          title: "Saving Faith (Hebrews 11:1)",
          summary: "Systematically defines biblical faith not as blind hope, but as solid historical assurance in God's demonstrated covenant track record.",
          key_references: ["Hebrews 11:1"]
        }
      ]
    },
    key_references: [
      {
        id: "bb-1",
        reference: "Hebrews 11:1",
        text: "Now faith is the substance of things hoped for, the evidence of things not seen."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "Hebrews 11:1",
        cross_references: ["Hebrews 10:38-39"],
        doctrinal_focus: "Consolation during Seizures of Property",
        content: "Written to early believers who were facing intense social ostracism, seizure of property, and physical threats, tempting them to slide back into the comfortable physical safety of the old temple rituals."
      },
      {
        type: "doctrine",
        primary_reference: "Hebrews 11:1",
        cross_references: ["Romans 10:17", "Ephesians 2:8"],
        doctrinal_focus: "Faith Built on Evidence and Word",
        content: "Saving Faith. Biblical faith is not blind optimism or emotional positive thinking. It is a solid, historical assurance resting on God's demonstrated track record and covenant promises."
      },
      {
        type: "application",
        primary_reference: "Hebrews 11:1",
        cross_references: ["Proverbs 3:5-6"],
        doctrinal_focus: "Standing on Granite Promises",
        content: "Even when your path is shrouded in dark uncertainty, trust the clear directives of Scripture. God's promises are solid granite; they will hold you when everything else collapses."
      },
      {
        type: "cross_references",
        primary_reference: "Hebrews 11:1",
        cross_references: ["Genesis 15:6", "Hebrews 11:6", "Habakkuk 2:4"],
        doctrinal_focus: "Enoch, Abraham, and the Pioneers of Faith",
        content: "Habakkuk 2:4 is quoted again to introduce the massive roll-call of faith in Hebrews 11, tracing God's victories in the lives of historical believers."
      }
    ],
    active_recall_prompts: [
      {
        id: "bb-prompt-1",
        prompt: "Recite Hebrews 11:1 and define biblical faith in terms of 'substance' and 'evidence.'",
        expected_answer: "Faith is the substance of things hoped for, the evidence of things not seen.",
        reference: "Hebrews 11:1"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Contextual Anchoring", description: "Explains how the early church faced persecution and holds fast to faith." },
        { key: "accuracy", label: "Faith vs Works", description: "Maintains correct Protestant and SDA views of saving faith as active, loving trust." },
        { key: "memorization", label: "Verbatim Memorization", description: "Perfect sequential, word-for-word memorization of Hebrews passages." },
        { key: "clarity", label: "Mountain Guide Analogy", description: "Compares faith to a sturdy rope or guide rails on a foggy trail in simple words." },
        { key: "doctrinal_alignment", label: "Righteousness by Faith", description: "Anchors all memory goals in Christ's unyielding righteousness and grace." }
      ]
    }
  },
  "priority-doctrines": {
    id: "priority-doctrines",
    description: "An interactive scripture chain covering the law, investigative judgment, and second advent promises.",
    outline: {
      sections: [
        {
          title: "The Perpetuity of the Law (Ecclesiastes 12:13)",
          summary: "Solomon's ultimate conclusion summarizes our entire duty as fearing God and keeping His unchangeable, protective commandments.",
          key_references: ["Ecclesiastes 12:13"]
        }
      ]
    },
    key_references: [
      {
        id: "pd-1",
        reference: "Ecclesiastes 12:13",
        text: "Let us hear the conclusion of the whole matter: Fear God, and keep his commandments: for this is the whole duty of man."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "Ecclesiastes 12:13",
        cross_references: ["Ecclesiastes 1:2"],
        doctrinal_focus: "Solomon's twilight reflections",
        content: "Authored by King Solomon at the twilight of his life. Having experimented with unlimited wealth, sensual pleasure, and intellectual power, he looks back and declares that a life lived apart from God is hollow vanity."
      },
      {
        type: "doctrine",
        primary_reference: "Ecclesiastes 12:13",
        cross_references: ["Romans 7:12", "James 2:10"],
        doctrinal_focus: "Transcript of God's Character",
        content: "The Perpetuity of the Law. The moral law of God is a transcript of His unchangeable character, reflecting justice and love. Obedience is the natural, grateful output of a saved soul."
      },
      {
        type: "application",
        primary_reference: "Ecclesiastes 12:13",
        cross_references: ["John 14:15"],
        doctrinal_focus: "Fearing God with Grateful Praise",
        content: "Align your life's priorities today. Do not chase after temporary worldly applause or material assets. Make fearing God and keeping His commandments your joyful focus."
      },
      {
        type: "cross_references",
        primary_reference: "Ecclesiastes 12:13",
        cross_references: ["Ecclesiastes 12:14", "Revelation 14:12", "Deuteronomy 10:12"],
        doctrinal_focus: "Obedience Linked to Judgment",
        content: "Ecclesiastes 12:14 notes God shall bring every work into judgment, immediately linking obedience to protective judgment, which matches Revelation 14:12."
      }
    ],
    active_recall_prompts: [
      {
        id: "pd-prompt-1",
        prompt: "Recite Solomon's ultimate conclusion of the whole matter in Ecclesiastes 12:13.",
        expected_answer: "Fear God, and keep his commandments: for this is the whole duty of man.",
        reference: "Ecclesiastes 12:13"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Law and Covenants", description: "Demonstrates deep clarity of the perpetuity of God's ten commandments." },
        { key: "accuracy", label: "Grace-Centered Duty", description: "Presents obedience as a grateful response to salvation rather than a transaction." },
        { key: "memorization", label: "Scripture Chains", description: "Retrieves priority verses and links prophetic commands flawlessly." },
        { key: "clarity", label: "Guardrail Analogy", description: "Frames God's commandments as loving guardrails designed to keep children safe." },
        { key: "doctrinal_alignment", label: "Three Angels Alignment", description: "Perfectly coordinates the moral law of God with the Everlasting Gospel." }
      ]
    }
  },
  "zoom-studies": {
    id: "zoom-studies",
    description: "Follow the complete archive of interactive Zoom Bible studies with structured lesson flow.",
    outline: {
      sections: [
        {
          title: "Session 1: The Sanctuary Blueprint & The Lamb of God",
          summary: "Introduction to the divine layout of salvation tracing the sanctuary from Moses to Revelation.",
          key_references: ["Exodus 25:8", "Hebrews 8:1-2", "Revelation 1:12-13"]
        },
        {
          title: "Session 2: Prophetic Timeframes & Daniel's Visions",
          summary: "Deep-dive active exegesis of Daniel 8:14 and the 2300 days prophecy.",
          key_references: ["Daniel 8:14", "Daniel 9:24-27", "Ezra 7:7-13"]
        }
      ]
    },
    key_references: [
      {
        id: "zs-1",
        reference: "Acts 17:11",
        text: "These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so."
      },
      {
        id: "zs-2",
        reference: "Exodus 25:8",
        text: "And let them make me a sanctuary; that I may dwell among them."
      }
    ],
    stba_sequence: [
      {
        type: "context",
        primary_reference: "Acts 17:11",
        cross_references: ["2 Timothy 2:15", "John 5:39"],
        doctrinal_focus: "Berean Noble Inquiry",
        content: "Paul and Silas visited the synagogue of Berea. Unlike the Thessalonian opposition, the Bereans actively tested apostolic preaching against the written Hebrew scriptures daily."
      },
      {
        type: "doctrine",
        primary_reference: "Acts 17:11",
        cross_references: ["Isaiah 8:20"],
        doctrinal_focus: "Sola Scriptura as Standard of Faith",
        content: "All teachings, live studies, and prophetic interpretations must stand the test of the law and the testimony."
      }
    ],
    active_recall_prompts: [
      {
        id: "zs-prompt-1",
        prompt: "Recite the noble practice of the Bereans in Acts 17:11.",
        expected_answer: "They received the word with all readiness of mind, and searched the scriptures daily, whether those things were so.",
        reference: "Acts 17:11"
      }
    ],
    teach_it_rubric: {
      categories: [
        { key: "understanding", label: "Berean Exegesis", description: "Demonstrates faithful biblical verification." },
        { key: "accuracy", label: "Doctrinal Alignment", description: "Maintains harmony with historic SDA hermeneutics." },
        { key: "memorization", label: "Live Memory Texts", description: "Recalls study texts accurately." },
        { key: "clarity", label: "Discussion Facilitation", description: "Presents clear, engaging interactive questions." },
        { key: "doctrinal_alignment", label: "Three Angels Framework", description: "Anchors all lessons in Christ and present truth." }
      ]
    }
  }
};
