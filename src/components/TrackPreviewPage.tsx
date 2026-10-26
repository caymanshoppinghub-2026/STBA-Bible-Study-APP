/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  Quote,
  Compass,
  Check,
  CheckCircle2,
  BookmarkCheck,
  BookMarked,
  Brain,
  Mic,
  HelpCircle,
  Sparkles,
  List,
  Loader2,
  FileText,
  Bookmark
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";
import { loadNotes, saveNotes } from "../data/notebookData";
import { SCRIPTURE_DATABASE, TRACK_LIBRARY } from "../data/scriptureDb";
import { Track, Scripture } from "../types";
import { StudyNote } from "../types/notebook";
import { ensureSupabaseAuth, saveNoteToSupabase, getDeterministicUUID } from "../lib/notebookSync";
import { loadTrackProgress, saveTrackProgress } from "../lib/trackSync";
import { supabase } from "../lib/supabase";
import { DEFAULT_DOCTRINE_TRACKS, DoctrineTrackDb } from "../data/doctrineTracksDb";

interface TrackExtraDetail {
  learnBullets: string[];
  framingQuote: string;
  framingSource: string;
  theologicalContext: string;
  requiredReadingBible: string;
  requiredReadingEgw: string;
  whyThisExists: string;
}

// Complete rich library of theological commentary and settings for each of the 6 tracks
const TRACK_PREVIEW_DOCS: Record<string, TrackExtraDetail> = {
  "fundamental-beliefs": {
    learnBullets: [
      "Discover the deep internal cohesion and organic unity of our 28 biblical tenets of faith.",
      "Identify explicit biblical proofs and scripture chains to defend raw bible truth during the final hour.",
      "Understand the structural architecture of the corporate Seventh-day Adventist sanctuary theology."
    ],
    framingQuote: "The Scripture of truth is the absolute benchmark of validation. Unless your conviction is anchored in its safe authority, you will conform to the surrounding storm.",
    framingSource: "Ellen White",
    theologicalContext: "This track assumes familiarity with basic Bible reading but no prior knowledge of SDA doctrine. You will encounter concepts that may challenge assumptions shaped by evangelical Christianity. Approach each study with an open Bible and a willingness to let Scripture speak.",
    requiredReadingBible: "John 5:39 — 'Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me.'",
    requiredReadingEgw: "Selected Messages, Vol. 1, Ch. 15 — 'The Bible, and the Bible alone, is to be our creed, the sole bond of union.'",
    whyThisExists: "The 28 Fundamentals represent our collective study of Scripture as a safe shield in the Great Controversy. Vindicating the character of God from satanic charges requires a systematic grasp of His love and justice. This track provides a protective fortress for the intellect, preparing you to give a reasonable answer to any inquirer."
  },
  "three-angels": {
    learnBullets: [
      "Unravel the profound symbols of Revelation 14's cosmic warning and its sanctuary origins.",
      "Understand the deceptive mark of the beast and the divine seal that provides safe refuge in Christ.",
      "Discover how the everlasting gospel serves as the foundational key to unlocking all end-time prophecies."
    ],
    framingQuote: "The proclamation of the first, second, and third angels' messages has been located by divine authority as our paramount mission.",
    framingSource: "Evangelism (p. 192)",
    theologicalContext: "Prophetic language uses intensive symbols to construct structural realities. This track assumes a deep reverence for Daniel and Revelation as complementary covenants, demanding rigorous cross-referencing rather than sensational speculation. True prophecy always centers on Christ's high-priestly victory.",
    requiredReadingBible: "Revelation 1:3 — 'Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand.'",
    requiredReadingEgw: "Testimonies for the Church, Vol. 8, Ch. 2 — 'In a special sense Seventh-day Adventists have been set in the world as watchmen and light-bearers.'",
    whyThisExists: "As the absolute climax of biblical warnings, the Three Angels' Messages unveil the ultimate issues of the Great Controversy: worship, creative design, and restorative justice. This track exists to rescue souls from Babylon's toxic spiritual mixture. Fully mastering these verses prepares you to act as a watchman for the final hour."
  },
  "sanctuary-doctrine": {
    learnBullets: [
      "Journey from the dusty outer court of justification to the glorious light of the Most Holy Place.",
      "Decipher the majestic types of Levitical rituals and their dynamic physical fulfillment in the heavens.",
      "Study the pre-advent cleansing of the sanctuary as a revelation of restorative justice."
    ],
    framingQuote: "The subject of the sanctuary and the investigative judgment should be clearly understood by the people of God.",
    framingSource: "The Great Controversy (p. 488)",
    theologicalContext: "The sanctuary is the interpretive key of Seventh-day Adventist theology. This track demands close study of Hebrews alongside Leviticus, tracing the movement of the high priest. Beware of viewing it as a legalistic arithmetic; instead, it is God's step-by-step layout of reconciliation.",
    requiredReadingBible: "Psalm 77:13 — 'Thy way, O God, is in the sanctuary: who is so great a God as our God?'",
    requiredReadingEgw: "The Great Controversy, Ch. 23 — 'The sanctuary in heaven is the very center of Christ's work in behalf of men.'",
    whyThisExists: "In the Great Controversy, Satan's main attack is directed against the sanctuary because it displays God's dual character of infinite justice and perfect love. Understanding this restorative progression provides a shield against the deception of cheap grace. This study anchors your soul inside the second veil."
  },
  "sabbath-school": {
    learnBullets: [
      "Cultivate deep daily devotion matched with structured adult Sabbath School prompts.",
      "Connect peer discussions with rigorous active recall of crucial weekly memory texts.",
      "Bridge the gap between biblical context and practical everyday spiritual renewal."
    ],
    framingQuote: "The Sabbath School is an important branch of the missionary work ... not merely because it gives a knowledge of God’s word, but because it works in the heart.",
    framingSource: "Counsels on Sabbath School Work (p. 9)",
    theologicalContext: "This devotional track leverages the international study layout of the Seventh-day Adventist Church. Approach this quarterly with deliberate focus, avoiding passive skimming. Each session expects you to commit the memory text to permanent storage before class discussion.",
    requiredReadingBible: "Acts 17:11 — 'These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily...'",
    requiredReadingEgw: "Counsels on Sabbath School Work, Ch. 1 — 'Let the teachers of the Sabbath School seek to understand the truths they are to teach.'",
    whyThisExists: "Global unity requires common study. This track binds the world church together in spiritual focus, protecting the mind against apostasy. By mastering these current studies, you participate in the corporate spiritual growth of the remnant, enhancing class dialogue and leading souls toward decisions."
  },
  "book-by-book": {
    learnBullets: [
      "Memorize critical doctrinal blocks of Hebrews, Ephesians, and Romans systematically.",
      "Anchor whole chapters in physical memory using cognitive spacing principles.",
      "Build linguistic neural networks to keep the scriptures alive under trial. "
    ],
    framingQuote: "Let the glorious promises of God’s word be stored in the memory, to protect the soul against temptation.",
    framingSource: "Our Father Cares (p. 231)",
    theologicalContext: "Verbatim scripture memorization is the ultimate defensive armor in the final crisis. This track requires sustained active recall of sequential verses. We recommend practicing early in the morning when the mind is free of worldly chatter.",
    requiredReadingBible: "Psalm 119:11 — 'Thy word have I hid in mine heart, that I might not sin against thee.'",
    requiredReadingEgw: "The Great Controversy, Ch. 37 — 'None but those who have fortified the mind with the truths of the Bible will stand through the last great conflict.'",
    whyThisExists: "When external Bibles are taken or restricted, the text must remain in your head. The Great Controversy will demand a prompt defense from memory. Hid in the heart, the Word is an unquenchable light. This track cultivates mental discipline to standard-proof your faith against worldly confusion."
  },
  "priority-doctrines": {
    learnBullets: [
      "Explore the law of God, soul sleep, the spirit of prophecy, and the glorious advent in close sequence.",
      "Establish a clear, logical biblical chain to address tough questions posed by non-Adventists.",
      "Master the defense of Seventh-day Adventist distinctives from the Bible alone."
    ],
    framingQuote: "We must be prepared to give a reason of the hope that is in us with meekness and fear.",
    framingSource: "Evangelism (p. 256)",
    theologicalContext: "This track targets high-stake doctrines that directly contradict popular evangelical traditions. It assumes basic scriptural appreciation but requires a mind willing to parse literal Hebrew and Greek contexts. Maintain strict logic paired with compassionate delivery.",
    requiredReadingBible: "1 River 3:15 — 'But sanctify the Lord God in your hearts: and be ready always to give an answer to every man...'",
    requiredReadingEgw: "Testimonies for the Church, Vol. 5, Ch. 12 — 'Our ministers and laymen must be able to justify our faith from the Bible alone.'",
    whyThisExists: "We are called to proclaim distinct final warning truths. This track trains you as a spiritual first responder to rescue souls from modern spiritualist delusions. When you understand the state of the dead and the authority of the Law, you stand on absolute granite against the coming storm."
  }
};

const TRACK_LABELS: Record<string, { title: string; count: number; category: string; badge: string; color: "amber" | "teal" | "navy" }> = {
  "fundamental-beliefs": { title: "28 Fundamental Beliefs", count: 26, category: "doctrine", badge: "Core Theology", color: "amber" },
  "three-angels": { title: "Three Angels' Messages", count: 12, category: "prophecy", badge: "Esoteric Prophecy", color: "teal" },
  "sanctuary-doctrine": { title: "Sanctuary Doctrine", count: 9, category: "doctrine", badge: "Advanced Type Study", color: "navy" },
  "sabbath-school": { title: "Sabbath School Quarterly", count: 15, category: "devotion", badge: "Weekly Devotion", color: "amber" },
  "book-by-book": { title: "Book-by-Book Memory Goals", count: 40, category: "book-by-book", badge: "Verbatim Scope", color: "teal" },
  "priority-doctrines": { title: "Priority SDA Doctrines", count: 7, category: "evangelism", badge: "Accelerated Path", color: "navy" },
  "zoom-studies": { title: "Zoom Bible Studies", count: 60, category: "live", badge: "Live Studies", color: "amber" }
};

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

// Interactive diagnostic quizzes for all 6 tracks
const QUIZ_DATABASE: Record<string, QuizQuestion[]> = {
  "fundamental-beliefs": [
    {
      question: "How is the Protestant Bible inspired according to standard Adventist theology?",
      options: [
        "Mechanical dictation where writers acted as typewriter keys.",
        "Inspiration of the writers (thought inspiration), where holy men were moved by the Holy Spirit.",
        "It is merely a collection of outstanding human literature."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "The biblical Godhead (Trinity) consists of how many co-eternal Persons?",
      options: [
        "One Person playing three different roles sequentially.",
        "Three co-eternal, co-equal Persons: Father, Son, and Holy Spirit.",
        "Only the Father is eternal; the Son is a created being."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "Under the SDA Fundamental Beliefs, the Creation week was:",
      options: [
        "A standard evolutionary sequence spanning millions of years.",
        "A purely figurative allegory pointing to general spiritual growth.",
        "A literal, historic six-day event crowned by the sanctified seventh-day Sabbath."
      ],
      correctAnswerIndex: 2
    }
  ],
  "three-angels": [
    {
      question: "What is the core message of the first angel flying in the midst of heaven (Revelation 14:6-7)?",
      options: [
        "The physical destruction of Babylon's historical walls.",
        "The everlasting gospel, the arrival of judgment, and a call to worship the Creator.",
        "A warning to set up isolated wilderness communes."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "What does 'Babylon' represent in the Second Angel's Message?",
      options: [
        "A literal ancient physical city being rebuilt in Mesopotamia.",
        "Spiritual apostasy and confusion arising from mixing false doctrines with the pure gospel.",
        "The secular scientific establishment and technology."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "According to Revelation 14:12, what preserves the patience of the end-time saints?",
      options: [
        "Keeping the commandments of God and possessing the faith of Jesus.",
        "Worldly financial security and high-status connections.",
        "Strict political activism in secular governments."
      ],
      correctAnswerIndex: 0
    }
  ],
  "sanctuary-doctrine": [
    {
      question: "Which sanctuary compartment represents daily ministry and reconciliation?",
      options: [
        "The Outer Court altar exclusively.",
        "The Holy Place, containing the Table of Shewbread and Golden Altar of Incense.",
        "The Most Holy Place behind the second veil."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "How did the Mosaic earthly tabernacle pattern get its blueprint?",
      options: [
        "Israelite artisans designed it using Egyptian temple models.",
        "It was built exactly according to the heavenly blueprint shown to Moses on Mount Sinai.",
        "Moses drafted the blueprints based on desert geography."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "In Seventh-day Adventist sanctuary theology, the investigative judgment began in:",
      options: [
        "1844 AD, at the culmination of the 2300 prophetic days of Daniel 8:14.",
        "31 AD, at the exact moment of Christ's crucifixion.",
        "70 AD, with the destruction of the earthly Jerusalem temple."
      ],
      correctAnswerIndex: 0
    }
  ],
  "sabbath-school": [
    {
      question: "What is the primary purpose of the Sabbath School according to counsels?",
      options: [
        "To act as a social club for church members to network.",
        "To give a knowledge of God’s word and work in the heart for active discipleship.",
        "To raise funds for church maintenance budgets."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "In Mark 2:27, Christ declares that the Sabbath was made for:",
      options: [
        "Jewish people exclusively as a local ceremonial rule.",
        "Mankind as a perpetual blessing of rest and communion with the Creator.",
        "Future angelic beings who do not live on the physical earth."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "True Christian Rest, as presented in Matthew 11:28, is:",
      options: [
        "Purely physical sleep and weekend recreation.",
        "A resting relationship in Christ, releasing the burden of self-justification.",
        "A state of sensory deprivation and silent chanting."
      ],
      correctAnswerIndex: 1
    }
  ],
  "book-by-book": [
    {
      question: "How does Hebrews 11:1 define biblical Faith?",
      options: [
        "Blind credulity without any historical or biblical evidence.",
        "The substance of things hoped for, the evidence of things not seen.",
        "A fluctuating feeling based on daily material fortune."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "What is the recommended mindset for verbatim Scripture memorization?",
      options: [
        "Quick passive skimming of verses right before falling asleep.",
        "Systematic active recall and spaced intervals, preferably during quiet morning hours.",
        "Scanning pages rapidly while listening to upbeat music."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "Memorizing Scripture is presented in STBA as:",
      options: [
        "A defensive armor to stand through the final crisis and protect the soul.",
        "A competitive hobby to earn badges and impress leaders.",
        "An academic chore required only for elders and pastors."
      ],
      correctAnswerIndex: 0
    }
  ],
  "priority-doctrines": [
    {
      question: "What does Ecclesiastes 12:13 state is the 'whole duty of man'?",
      options: [
        "Fear God, and keep his commandments.",
        "Gain extensive worldly wealth and academic acclaim.",
        "Achieve mystical enlightenment through isolated contemplation."
      ],
      correctAnswerIndex: 0
    },
    {
      question: "What is the Seventh-day Adventist view on the 'State of the Dead'?",
      options: [
        "Human souls transition immediately to heaven or hell at death.",
        "Death is an unconscious sleep; the dead remain in graves until the resurrection.",
        "The departed can actively observe and communicate with the living."
      ],
      correctAnswerIndex: 1
    },
    {
      question: "The binding nature of God's Ten Commandments indicates that they are:",
      options: [
        "Abolished at the cross and replaced by generic love.",
        "A perpetual transcript of God's character, still fully authoritative today.",
        "Ceremonial guidelines intended only for pre-Christian Israel."
      ],
      correctAnswerIndex: 1
    }
  ]
};

// Rich layered exegesis details (Context, Doctrine, Application)
const EXEGETICAL_STUDY_DATA: Record<string, { context: string; doctrine: string; application: string }> = {
  "2 Timothy 3:16": {
    context: "Written by the Apostle Paul from a cold Roman dungeon to his young protege Timothy. Paul was facing imminent martyrdom under Emperor Nero, making this statement his absolute final theological testament on the authority of truth.",
    doctrine: "Verbal vs. Thought Inspiration. SDA hermeneutics hold that God inspired the writers with thoughts (moving holy men through the Spirit), which they then conveyed in their own human words. The Bible is the union of the divine and human.",
    application: "Anchor your personal conviction in the clear text of Scripture rather than shifting culture, public consensus, or emotional feelings. Let the Bible actively correct your lifestyle daily."
  },
  "Romans 1:16": {
    context: "Paul was writing to the church in Rome—the epicentre of imperial power, military might, and philosophical pride. While Rome valued material domination, Paul champions a quiet spiritual power that heals souls.",
    doctrine: "The Righteousness of Christ. The gospel is God's dynamic, restorative power ('dunamis') to recreate the broken image of God in humans. Salvation is an unmerited gift received purely by faith.",
    application: "Never shrink from declaring the distinctive, unpopular truths of the Three Angels' messages. Knowing Christ has conquered sin and death gives you courage to stand as a light-bearer in your community."
  },
  "Genesis 1:27": {
    context: "Authored by Moses during Israel's Wilderness wandering, designed to teach a newly freed nation of slaves their true origin and dignity, standing in stark contrast to the bizarre polytheistic myths of Egypt.",
    doctrine: "Imago Dei & Literal Creation. Human beings did not evolve from animal ancestors through millions of years of bloodshed. We are direct masterpieces of divine design. Body, mind, and spirit form an indivisible, holy wholeness.",
    application: "Treat your physical body temple with absolute reverence through clean, balanced health habits. Recognizing that you are made in the image of God defines your eternal worth."
  },
  "Revelation 14:6": {
    context: "A vision given to John on Patmos. The first angel flies in 'mid-heaven' (or the zenith), representing that this warning has global visibility and urgent, rapid distribution to every nation, tongue, and tribe.",
    doctrine: "The Everlasting Gospel. There is only one plan of salvation throughout human history, from Genesis to Revelation. Christ's sacrificial, substituting righteousness is the absolute core of the final warning messages.",
    application: "Whenever you share Bible prophecy, ground it thoroughly in Christ's saving love. Do not present timelines as cold academic proofs; show them as the dynamic layout of Jesus' justice."
  },
  "Revelation 14:7": {
    context: "Introduced as the antitypical Day of Atonement, the investigative judgment beginning in 1844, calling humanity back to true, original worship as the world collapses in Babylon's spiritual confusion.",
    doctrine: "The Judgment Hour & Creation Sabbath. 'Fear God and give glory to Him.' A direct command to worship the Creator of the heavens and earth, using language quoted directly from the Fourth Commandment.",
    application: "Living under the judgment is not a matter of legalistic fear. It means living transparently before God, letting the blood of Jesus cover your past and transform your character daily."
  },
  "Revelation 14:12": {
    context: "The climax of the great controversy between Christ and Satan over the law of God. The remnant stand unyielding through the final testing hour, upheld by absolute devotion.",
    doctrine: "Commandments of God & Faith of Jesus. The final saints are identified by their faithful obedience to all ten commandments (including the Seventh-day Sabbath) and possessing the identical faith that carried Jesus through Gethsemane.",
    application: "Spend quiet time in the early morning building a personal relationship with Christ. Only a deep, living trust in Him will give you the stamina and 'patience' to stand under trial."
  },
  "Daniel 8:14": {
    context: "Given to Daniel during the Babylonian captivity when the earthly temple lay in blackened ruins. The angel Gabriel reassures him that although earthly powers would defile truth, God's heavenly ministry would be vindicated.",
    doctrine: "The Sanctuary Cleansing. Ending the 2300-year prophecy in 1844, this marks the transition of Christ's high-priestly intercession into the Most Holy Place, reviewing the books of life and vindicating His people.",
    application: "Cooperate with your Savior in cleansing your personal soul-temple. Let Him examine your heart, remove hidden anger, and replace bad habits with His fruit."
  },
  "Hebrews 8:1-2": {
    context: "Written to first-century Hebrew Christians who were mourning the loss of the majestic earthly temple. Paul redirects their eyes upward, explaining that the earthly shadow has been replaced by an infinite, glorious reality.",
    doctrine: "The Heavenly Priesthood of Christ. Jesus is our only true Mediator, pleading His blood in the true tabernacle pitched by God, not man. We have direct access to Him without needing earthly priests.",
    application: "Enter boldly into prayer. Whenever you feel overwhelmed by guilt or spiritual fatigue, remember you have a sympathetic High Priest in heaven who lives to plead your cause."
  },
  "Exodus 25:8": {
    context: "Delivered to Moses on Mount Sinai amidst thunder and cloud. God instructs a wandering people to build a physical structure using voluntary offerings given from 'willing hearts.'",
    doctrine: "The Sanctuary Pattern. Every sacrifice, furnishing, and curtain in the earthly sanctuary was an interactive, physical object lesson outlining the entire plan of salvation—from Calvary to the Judgment.",
    application: "God's deepest, most passionate desire is to 'dwell among' His people. Clear out any clutter of worldly noise or pride, and invite Him into your heart today."
  },
  "Matthew 11:28": {
    context: "Uttered by Christ to the common working people of Galilee, who were spiritually exhausted, bent double under the massive load of legalistic traditions and oral restrictions piled on by the Pharisees.",
    doctrine: "Law and Grace. True Christian rest is not a reward for perfect self-reliant effort. It is the foundation of obedience. We obey His law because we are secure in His rest.",
    application: "Lay down your heavy bags of performance anxiety, religious pride, or feelings of inadequacy. Take a deep breath and rest in Christ's finished work of salvation."
  },
  "Mark 2:27": {
    context: "Spoken by Christ in response to the legalistic Pharisees who accused His disciples of 'working' because they rubbed heads of grain in their hands to eat while walking through a field on the Sabbath.",
    doctrine: "The Sabbath Covenant. The Sabbath was created at Eden, long before any Jewish economy, as a perpetual sanctuary in time designed for human rest, relationship, and celebrating our Creator's love.",
    application: "Welcome the Sabbath hours with joy rather than view them as a list of restrictions. Treat it as a weekly date-night with your Creator, stepping away from phones and work."
  },
  "Hebrews 11:1": {
    context: "Written to early believers who were facing intense social ostracism, seizure of property, and physical threats, tempting them to slide back into the comfortable physical safety of the old temple rituals.",
    doctrine: "Saving Faith. Biblical faith is not blind optimism or emotional positive thinking. It is a solid, historical assurance resting on God's demonstrated track record and covenant promises.",
    application: "Even when your path is shrouded in dark uncertainty, trust the clear directives of Scripture. God's promises are solid granite; they will hold you when everything else collapses."
  },
  "Ecclesiastes 12:13": {
    context: "Authored by King Solomon at the twilight of his life. Having experimented with unlimited wealth, sensual pleasure, and intellectual power, he looks back and declares that a life lived apart from God is hollow vanity.",
    doctrine: "The Perpetuity of the Law. The moral law of God is a transcript of His unchangeable character, reflecting justice and love. Obedience is the natural, grateful output of a saved soul.",
    application: "Align your life's priorities today. Do not chase after temporary worldly applause or material assets. Make fearing God and keeping His commandments your joyful focus."
  }
};

export const TrackPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { user, showConfetti, trackStatsAllowed } = useApp();

  const trackId = id && TRACK_LABELS[id] ? id : "fundamental-beliefs";
  const trackInfo = TRACK_LABELS[trackId];
  const doc = TRACK_PREVIEW_DOCS[trackId];

  const [savedNotebookPageId, setSavedNotebookPageId] = useState<string | null>(() => {
    return localStorage.getItem(`stba_track_notebook_page_id_${trackId}`);
  });

  const [dbTrack, setDbTrack] = useState<DoctrineTrackDb>(() => {
    return DEFAULT_DOCTRINE_TRACKS[trackId] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];
  });
  const [loadingTrackDb, setLoadingTrackDb] = useState<boolean>(true);

  const [hasRemoteProgress, setHasRemoteProgress] = useState<boolean>(false);
  const [isStepsCollapsed, setIsStepsCollapsed] = useState<boolean>(false);

  // Discipleship 7-Step State System
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_track_current_step_${trackId}`);
    return saved !== null ? Number(saved) : 0; // 0: Choose Track
  });

  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_track_unlocked_step_${trackId}`);
    return saved !== null ? Number(saved) : 0;
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem(`stba_track_quiz_answers_${trackId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(`stba_track_quiz_submitted_${trackId}`) === "true";
  });

  const [quizScore, setQuizScore] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_track_quiz_score_${trackId}`);
    return saved !== null ? Number(saved) : 0;
  });

  const [studiedVerses, setStudiedVerses] = useState<string[]>(() => {
    const saved = localStorage.getItem(`stba_track_studied_verses_${trackId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [recalledVerses, setRecalledVerses] = useState<Record<string, "Weak" | "Developing" | "Mastered">>(() => {
    const saved = localStorage.getItem(`stba_track_recalled_verses_${trackId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [recallInputs, setRecallInputs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`stba_track_recall_inputs_${trackId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [recallChecks, setRecallChecks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`stba_track_recall_checks_${trackId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [teachNotes, setTeachNotes] = useState<string>(() => {
    return localStorage.getItem(`stba_track_teach_notes_${trackId}`) || "";
  });

  const [teachEvaluation, setTeachEvaluation] = useState<any>(() => {
    const saved = localStorage.getItem(`stba_track_teach_evaluation_${trackId}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(() => {
    return localStorage.getItem(`stba_track_saved_${trackId}`) === "true";
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [isGlowing, setIsGlowing] = useState<boolean>(false);

  // Active studied verse in Step 4/5
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  // active tab inside STBA study: 'context' | 'doctrine' | 'application' | 'cross_references'
  const [activeLayerTab, setActiveLayerTab] = useState<"context" | "doctrine" | "application" | "cross_references">("context");

  // Fetch scriptures for current track
  const keyScriptures: Scripture[] = SCRIPTURE_DATABASE[trackId] || [];

  // Persist State to localStorage on change
  useEffect(() => {
    localStorage.setItem(`stba_track_current_step_${trackId}`, currentStep.toString());
    localStorage.setItem(`stba_track_unlocked_step_${trackId}`, maxUnlockedStep.toString());
  }, [currentStep, maxUnlockedStep, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_quiz_answers_${trackId}`, JSON.stringify(quizAnswers));
  }, [quizAnswers, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_quiz_submitted_${trackId}`, quizSubmitted ? "true" : "false");
  }, [quizSubmitted, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_quiz_score_${trackId}`, quizScore.toString());
  }, [quizScore, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_studied_verses_${trackId}`, JSON.stringify(studiedVerses));
  }, [studiedVerses, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_recalled_verses_${trackId}`, JSON.stringify(recalledVerses));
  }, [recalledVerses, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_recall_inputs_${trackId}`, JSON.stringify(recallInputs));
  }, [recallInputs, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_recall_checks_${trackId}`, JSON.stringify(recallChecks));
  }, [recallChecks, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_teach_notes_${trackId}`, teachNotes);
  }, [teachNotes, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_teach_evaluation_${trackId}`, teachEvaluation ? JSON.stringify(teachEvaluation) : "");
  }, [teachEvaluation, trackId]);

  useEffect(() => {
    localStorage.setItem(`stba_track_saved_${trackId}`, saveSuccess ? "true" : "false");
  }, [saveSuccess, trackId]);

  useEffect(() => {
    if (savedNotebookPageId) {
      localStorage.setItem(`stba_track_notebook_page_id_${trackId}`, savedNotebookPageId);
    } else {
      localStorage.removeItem(`stba_track_notebook_page_id_${trackId}`);
    }
  }, [savedNotebookPageId, trackId]);

  // Load doctrine track structure from Supabase doctrine_tracks
  useEffect(() => {
    const fetchDoctrineTrack = async () => {
      setLoadingTrackDb(true);
      try {
        const { data, error } = await supabase
          .from("doctrine_tracks")
          .select("*")
          .eq("id", trackId)
          .maybeSingle();

        if (data) {
          // Supabase auto-parses JSONB columns. We map it nicely.
          setDbTrack({
            id: data.id,
            description: data.description || "",
            outline: typeof data.outline === "string" ? JSON.parse(data.outline) : data.outline,
            key_references: typeof data.key_references === "string" ? JSON.parse(data.key_references) : data.key_references,
            stba_sequence: typeof data.stba_sequence === "string" ? JSON.parse(data.stba_sequence) : data.stba_sequence,
            active_recall_prompts: typeof data.active_recall_prompts === "string" ? JSON.parse(data.active_recall_prompts) : data.active_recall_prompts,
            teach_it_rubric: typeof data.teach_it_rubric === "string" ? JSON.parse(data.teach_it_rubric) : data.teach_it_rubric,
          });
        } else {
          setDbTrack(DEFAULT_DOCTRINE_TRACKS[trackId] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"]);
        }
      } catch (err) {
        console.warn("Error fetching doctrine_tracks, falling back to static config:", err);
        setDbTrack(DEFAULT_DOCTRINE_TRACKS[trackId] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"]);
      } finally {
        setLoadingTrackDb(false);
      }
    };
    fetchDoctrineTrack();
  }, [trackId]);

  // Load track progress from Supabase if authenticated
  useEffect(() => {
    const loadCloudProgress = async () => {
      if (!trackStatsAllowed) return;
      try {
        const sbUser = await ensureSupabaseAuth();
        if (!sbUser) return;

        const progress = await loadTrackProgress(sbUser.id, trackId);
        if (progress) {
          setHasRemoteProgress(true);
          const data = progress.data;
          if (data) {
            if (data.pre_test_score) {
              setQuizScore(data.pre_test_score.score || 0);
              setQuizSubmitted(data.pre_test_score.submitted || false);
              if (data.pre_test_score.answers) {
                setQuizAnswers(data.pre_test_score.answers);
              }
            }
            if (data.studied_texts) {
              setStudiedVerses(data.studied_texts);
            }
            if (data.active_recall) {
              if (data.active_recall.masteryLevel) {
                setRecalledVerses(data.active_recall.masteryLevel);
              }
              if (data.active_recall.inputs) {
                setRecallInputs(data.active_recall.inputs);
              }
              if (data.active_recall.checks) {
                setRecallChecks(data.active_recall.checks);
              }
            }
            if (data.teach_it) {
              if (data.teach_it.generatedSummary) {
                setTeachNotes(data.teach_it.generatedSummary);
              }
              if (data.teach_it.grading) {
                setTeachEvaluation(data.teach_it.grading);
              }
            }
            if (data.saved_to_notebook) {
              setSaveSuccess(data.saved_to_notebook);
            }
            if (data.saved_notebook_page_id) {
              setSavedNotebookPageId(data.saved_notebook_page_id);
            }

            // Derive maxUnlockedStep and currentStep based on progress
            let maxStep = 0;
            if (data.pre_test_score?.submitted) {
              maxStep = Math.max(maxStep, 2); // unlock starting point (index 2)
            }
            if (data.recommended_starting_point) {
              maxStep = Math.max(maxStep, 3); // unlock scripture study (index 3)
            }
            if (data.studied_texts && data.studied_texts.length > 0) {
              maxStep = Math.max(maxStep, 4); // unlock active recall (index 4)
            }
            if (data.active_recall?.masteryLevel && Object.keys(data.active_recall.masteryLevel).length > 0) {
              maxStep = Math.max(maxStep, 5); // unlock teach-it (index 5)
            }
            if (data.teach_it?.grading) {
              maxStep = Math.max(maxStep, 6); // unlock save & sync (index 6)
            }
            setMaxUnlockedStep(maxStep);
            setCurrentStep(maxStep);
          }
        }
      } catch (err) {
        console.error("Failed to load track progress from Supabase:", err);
      }
    };
    loadCloudProgress();
  }, [trackId, trackStatsAllowed]);

  // Synchronize progress helper
  const syncProgressToSupabase = async (overrideData?: any) => {
    if (!trackStatsAllowed) return;
    try {
      const sbUser = await ensureSupabaseAuth();
      if (!sbUser) return;

      const currentQuizScore = overrideData?.quizScore !== undefined ? overrideData.quizScore : quizScore;
      const currentQuizSubmitted = overrideData?.quizSubmitted !== undefined ? overrideData.quizSubmitted : quizSubmitted;
      const currentQuizAnswers = overrideData?.quizAnswers !== undefined ? overrideData.quizAnswers : quizAnswers;
      const currentStudiedVerses = overrideData?.studiedVerses !== undefined ? overrideData.studiedVerses : studiedVerses;
      const currentRecalledVerses = overrideData?.recalledVerses !== undefined ? overrideData.recalledVerses : recalledVerses;
      const currentRecallInputs = overrideData?.recallInputs !== undefined ? overrideData.recallInputs : recallInputs;
      const currentRecallChecks = overrideData?.recallChecks !== undefined ? overrideData.recallChecks : recallChecks;
      const currentTeachNotes = overrideData?.teachNotes !== undefined ? overrideData.teachNotes : teachNotes;
      const currentTeachEvaluation = overrideData?.teachEvaluation !== undefined ? overrideData.teachEvaluation : teachEvaluation;
      const currentSaveSuccess = overrideData?.saveSuccess !== undefined ? overrideData.saveSuccess : saveSuccess;
      const currentSavedPageId = overrideData?.savedNotebookPageId !== undefined ? overrideData.savedNotebookPageId : savedNotebookPageId;

      const questions = QUIZ_DATABASE[trackId] || [];
      const pct = questions.length > 0 ? currentQuizScore / questions.length : 0;
      let recLevel = null;
      if (currentQuizSubmitted) {
        if (pct <= 0.34) {
          recLevel = "Beginner Discipleship Layout";
        } else if (pct <= 0.7) {
          recLevel = "Intermediate Discipleship Layout";
        } else {
          recLevel = "Advanced Discipleship Layout";
        }
      }

      const progressData = {
        pre_test_score: currentQuizSubmitted ? { score: currentQuizScore, submitted: true, answers: currentQuizAnswers } : null,
        recommended_starting_point: recLevel,
        studied_texts: currentStudiedVerses,
        active_recall: {
          masteryLevel: currentRecalledVerses,
          inputs: currentRecallInputs,
          checks: currentRecallChecks
        },
        teach_it: currentTeachEvaluation ? {
          grading: currentTeachEvaluation,
          generatedSummary: currentTeachNotes
        } : null,
        saved_to_notebook: currentSaveSuccess,
        saved_notebook_page_id: currentSavedPageId
      };

      const isCreation = !hasRemoteProgress;
      await saveTrackProgress(sbUser.id, trackId, progressData, isCreation, trackInfo.title);
      setHasRemoteProgress(true);
    } catch (err) {
      console.error("Failed to sync progress to Supabase:", err);
    }
  };

  // Stepper names and descriptions
  const steps = [
    { label: "Choose Track", desc: "Select a doctrinal focus" },
    { label: "Pre-Test", desc: "Diagnostic diagnostic assessment" },
    { label: "Starting Point", desc: "Recommended study layout" },
    { label: "Scripture Study", desc: "Layered contextual exegesis" },
    { label: "Active Recall", desc: "Spaced retrieval & memorization" },
    { label: "Teach-It Mode", desc: "Discipleship demonstration" },
    { label: "Save & Sync", desc: "Commit summary to Notebook" }
  ];

  // Helper to handle navigation to unlocked steps
  const handleGoToStep = (stepIdx: number) => {
    if (stepIdx <= maxUnlockedStep) {
      setCurrentStep(stepIdx);
      setActiveVerseIndex(0);
      setActiveLayerTab("context");
    } else {
      displayToast(`Please complete the preceding steps to unlock this lesson stage.`);
    }
  };

  const handleNextStep = () => {
    const nextIdx = currentStep + 1;
    if (nextIdx < steps.length) {
      if (nextIdx > maxUnlockedStep) {
        setMaxUnlockedStep(nextIdx);
      }
      setCurrentStep(nextIdx);
      setActiveVerseIndex(0);
      setActiveLayerTab("context");
      setTimeout(() => {
        syncProgressToSupabase();
      }, 50);
    }
  };

  const handlePrevStep = () => {
    const prevIdx = currentStep - 1;
    if (prevIdx >= 0) {
      setCurrentStep(prevIdx);
      setActiveVerseIndex(0);
      setActiveLayerTab("context");
    }
  };

  const displayToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Step 2 Quiz submission
  const handleQuizSubmit = () => {
    const questions = QUIZ_DATABASE[trackId] || [];
    let score = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    showConfetti('track', `Diagnostic complete! Pre-test score: ${score}/${questions.length}`);
    syncProgressToSupabase({
      quizScore: score,
      quizSubmitted: true
    });
  };

  const getStartingLevel = () => {
    const questions = QUIZ_DATABASE[trackId] || [];
    const pct = quizScore / questions.length;
    if (pct <= 0.34) {
      return {
        level: "Beginner Discipleship Layout",
        focus: "Foundational narratives, literal meanings, and historical context of basic texts.",
        desc: "We recommend reviewing basic outlines meticulously and spending ample time in the Historical Context panels."
      };
    } else if (pct <= 0.7) {
      return {
        level: "Intermediate Discipleship Layout",
        focus: "Doctrinal relationships, structural cross-references, and prophetic symbols.",
        desc: "Focus on the connections between texts (line upon line) and the Doctrinal Truth tabs."
      };
    } else {
      return {
        level: "Advanced Discipleship Layout",
        focus: "Evangelistic application, advanced type-study shadows, and verbal presentation.",
        desc: "Challenge yourself to teach the doctrine with absolute clarity. Refine your Teach-It presentation notes."
      };
    }
  };

  // Step 4: Mark verse studied
  const toggleVerseStudied = (verseId: string) => {
    let nextStudied: string[];
    if (studiedVerses.includes(verseId)) {
      nextStudied = studiedVerses.filter(v => v !== verseId);
    } else {
      nextStudied = [...studiedVerses, verseId];
      displayToast("Verse context marked as fully studied!");
    }
    setStudiedVerses(nextStudied);
    syncProgressToSupabase({ studiedVerses: nextStudied });
  };

  const allVersesStudied = keyScriptures.every(v => studiedVerses.includes(v.id));

  // Step 5: Active Recall Diff Match & accuracy helper
  const calculateAccuracy = (input: string, actual: string) => {
    const clean = (s: string) => 
      s.toLowerCase()
       .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
       .replace(/\s+/g, " ")
       .trim();
       
    const inputClean = clean(input);
    const actualClean = clean(actual);
    if (!inputClean || !actualClean) return 0;

    const inputWords = inputClean.split(" ");
    const actualWords = actualClean.split(" ");

    let matches = 0;
    const inputWordSet = new Set(inputWords);

    actualWords.forEach(word => {
      if (inputWordSet.has(word)) {
        matches += 1;
      } else {
        const closeMatch = inputWords.some(inW => 
          inW.includes(word) || word.includes(inW)
        );
        if (closeMatch && word.length > 3) {
          matches += 0.85;
        }
      }
    });

    return Math.min(100, Math.round((matches / actualWords.length) * 100));
  };

  const handleCheckRecall = (verseId: string) => {
    setRecallChecks(prev => ({ ...prev, [verseId]: true }));
  };

  const logRecallMastery = async (promptId: string, userAnswer: string, score: number, lvl: "Weak" | "Developing" | "Mastered") => {
    if (!trackStatsAllowed) return;
    try {
      const sbUser = await ensureSupabaseAuth();
      if (!sbUser) return;
      
      const { error } = await supabase
        .from("active_recall_mastery")
        .upsert({
          user_id: sbUser.id,
          track_id: trackId,
          prompt_id: promptId,
          user_answer: userAnswer,
          accuracy_score: score,
          mastery_level: lvl,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,track_id,prompt_id" });
        
      if (error) {
        console.warn("Error logging active recall mastery:", error.message);
      }
    } catch (err) {
      console.warn("Exception in logRecallMastery:", err);
    }
  };

  const rateRecallStrength = async (verseId: string, rating: "Weak" | "Developing" | "Mastered") => {
    const nextRecalled = { ...recalledVerses, [verseId]: rating };
    setRecalledVerses(nextRecalled);
    displayToast(`Recall marked as ${rating}!`);
    syncProgressToSupabase({ recalledVerses: nextRecalled });

    // Find active prompt and log to active_recall_mastery
    const activeVerse = keyScriptures.find(v => v.id === verseId);
    if (activeVerse) {
      const matchedPrompt = dbTrack.active_recall_prompts.find(p => p.reference === activeVerse.reference);
      const activePrompt = matchedPrompt || {
        id: `default-${activeVerse.id}`,
        prompt: `Without looking, try to recall and write down the key theological message of ${activeVerse.reference}, focusing on its doctrinal importance.`,
        expected_answer: activeVerse.text,
        reference: activeVerse.reference
      };
      const userAnswer = recallInputs[verseId] || "";
      const score = calculateAccuracy(userAnswer, activePrompt.expected_answer);
      await logRecallMastery(activePrompt.id, userAnswer, score, rating);
    }
  };

  const allVersesRecalled = keyScriptures.every(v => recalledVerses[v.id] === "Mastered" || recalledVerses[v.id] === "Developing");

  // Step 6: Submit to Elder Stephen
  const handleTeachItSubmit = () => {
    if (teachNotes.trim().length < 15) {
      displayToast("Please write a more detailed explanation (at least 15 characters) before submitting.");
      return;
    }

    setEvaluating(true);
    setTimeout(() => {
      const questions = QUIZ_DATABASE[trackId] || [];
      const scorePct = quizScore / questions.length;
      let grade = "A";
      let comment = "";

      // Look for key doctrinal terms inside user's writing to customize commentary
      const lowercaseNotes = teachNotes.toLowerCase();
      const hasJesus = lowercaseNotes.includes("jesus") || lowercaseNotes.includes("christ") || lowercaseNotes.includes("savior");
      const hasLove = lowercaseNotes.includes("love") || lowercaseNotes.includes("grace") || lowercaseNotes.includes("mercy") || lowercaseNotes.includes("gift");
      const hasBible = lowercaseNotes.includes("bible") || lowercaseNotes.includes("scripture") || lowercaseNotes.includes("word") || lowercaseNotes.includes("verse");

      if (scorePct >= 0.9 && hasJesus && hasLove) {
        grade = "A+ Stellar";
        comment = "Exquisite. Your summary is saturated with the righteousness of Christ and the love of God. You have successfully bypassed the cold legalism trap that so often catches theological debaters. Elder Stephen is highly satisfied.";
      } else if (hasJesus && hasLove) {
        grade = "A- Excellent";
        comment = "Beautifully Christ-centered. You explained the doctrine in terms of a relationship with Jesus. For refinement, ensure you connect the specific biblical references closely so your listeners can trace the answers in their own Bibles.";
      } else if (hasJesus) {
        grade = "B+ Balanced";
        comment = "A solid, biblically faithful outline. You correctly positioned Jesus as the core. To improve, try making the analogy even simpler so a child can understand. Remember: 'To teach is to make simple.'";
      } else {
        grade = "B developing";
        comment = "Accurate on doctrinal mechanics, but a bit academic. Try incorporating the infinite love of Jesus and His saving grace. True doctrine must always point to the character of our sympathetic High Priest.";
      }

      const rubCategoryScores = {
        understanding: hasBible ? Math.round(90 + Math.random() * 8) : Math.round(75 + Math.random() * 10),
        accuracy: hasJesus ? Math.round(92 + Math.random() * 6) : Math.round(78 + Math.random() * 8),
        memorization: allVersesRecalled ? Math.round(94 + Math.random() * 5) : Math.round(80 + Math.random() * 8),
        clarity: teachNotes.length > 100 ? Math.round(92 + Math.random() * 7) : Math.round(80 + Math.random() * 7),
        doctrinal_alignment: (hasJesus && hasLove) ? Math.round(96 + Math.random() * 3) : Math.round(82 + Math.random() * 8)
      };

      const evaluation = {
        grade,
        comment,
        strengths: "Your explanation is biblically sound and highlights standard Seventh-day Adventist distinctives clearly.",
        analogy: trackId === "three-angels" 
          ? "Tell a story about a loving father who sends a warning letter to his children to escape a burning house before it falls. The three messages are that loving warning letter."
          : trackId === "sanctuary-doctrine"
          ? "Describe the sanctuary as a great celestial hospital. Just as a patient moves from check-in to surgery and then recovery, the sanctuary shows our step-by-step healing from sin."
          : "Compare God's law to a protective guardrail on a beautiful mountain road, keeping us safe in our Father's paradise.",
        appeal: "Always invite your students to make a decision of love and surrender. Never argue; win souls through Christ-centered warmth.",
        scores: rubCategoryScores
      };

      setTeachEvaluation(evaluation);
      setEvaluating(false);
      showConfetti('teach', `Teach-It graded successfully: ${grade}!`);
      
      syncProgressToSupabase({
        teachEvaluation: evaluation,
        teachNotes: teachNotes
      });
    }, 1500);
  };

  // Step 7: Save to Notebook
  const handleSaveToNotebook = () => {
    setIsGlowing(true);
    setTimeout(() => {
      setIsGlowing(false);
    }, 800);
    
    try {
      const notes = loadNotes();
      
      // Build notes content
      const scriptureOutlines = keyScriptures.map((v, i) => {
        const exe = EXEGETICAL_STUDY_DATA[v.reference] || { context: "", doctrine: "", application: "" };
        return `### ${i+1}. ${v.reference}\n\n* **Text**: "${v.text}"\n* **Historical Context**: ${exe.context}\n* **Doctrinal Truth**: ${exe.doctrine}\n* **Devotional Application**: ${exe.application}\n`;
      }).join("\n");

      const notebookContent = `# Discipleship Study: ${trackInfo.title}
      
## Track Overview
* **Focus Category**: ${trackInfo.badge}
* **Diagnostic Level**: ${getStartingLevel().level}
* **Pre-Test Score**: ${quizScore}/${(QUIZ_DATABASE[trackId] || []).length}

---

## Key Scripture Outline
${scriptureOutlines}

---

## Teach-It Summary Notes
* **My Explanation**:
> "${teachNotes}"

* **Elder Stephen Evaluation & Grade**: **${teachEvaluation?.grade || "Graded"}**
* **Theological Strengths**: ${teachEvaluation?.strengths || ""}
* **Christ-Centered Analogy**: ${teachEvaluation?.analogy || ""}
* **Refinement Appeal**: ${teachEvaluation?.appeal || ""}

---
*Created via STBA Cognitive Scripture Mastery System (CSMS) Track Studies.*`;

      // Define standard note object
      const newNote: StudyNote = {
        id: `stba-track-${trackId}-${Date.now()}`,
        title: `Discipleship Outline: ${trackInfo.title}`,
        summary: `Syllabus track study outline with Elder Stephen evaluation (${teachEvaluation?.grade || "Graded"}).`,
        content: notebookContent,
        category: 'theology',
        scriptureTags: keyScriptures.map(v => v.reference),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: true,
        children: [],
        order: notes.length,
        expanded: false
      };

      notes.push(newNote);
      saveNotes(notes);

      // Save complete track progress
      const savedProgress = localStorage.getItem("stba_tracks_progress");
      let progressMap: Record<string, number> = {};
      if (savedProgress) {
        try {
          progressMap = JSON.parse(savedProgress);
        } catch (e) {}
      }
      progressMap[trackId] = trackInfo.count; // mark fully complete
      localStorage.setItem("stba_tracks_progress", JSON.stringify(progressMap));

      setSaveSuccess(true);
      setSavedNotebookPageId(newNote.id);
      showConfetti('notebook', "Study outline fully synchronized with user's Notebook!");

      if (trackStatsAllowed) {
        saveNoteToSupabase(newNote).catch(err => {
          console.error("Failed to save note to Supabase from TrackPreviewPage:", err);
        });

        // Save outline, key_references, and Teach-It summary into notebook_pages linked to doctrine_tracks + track_progress
        ensureSupabaseAuth().then(async (sbUser) => {
          if (sbUser) {
            try {
              const { error: pageError } = await supabase
                .from("notebook_pages")
                .upsert({
                  id: getDeterministicUUID(newNote.id),
                  user_id: sbUser.id,
                  track_id: trackId,
                  title: newNote.title,
                  content: newNote.content,
                  outline: dbTrack.outline,
                  key_references: dbTrack.key_references,
                  teach_it_summary: teachEvaluation,
                  updated_at: new Date().toISOString()
                }, { onConflict: "id" });
              if (pageError) {
                console.warn("Error saving directly to notebook_pages in Supabase:", pageError.message);
              } else {
                console.log("Successfully synchronized with notebook_pages in Supabase!");
              }
            } catch (err) {
              console.warn("Exception saving to notebook_pages in Supabase:", err);
            }
          }
        });
      }

      syncProgressToSupabase({
        saveSuccess: true,
        savedNotebookPageId: newNote.id
      });
    } catch (err) {
      console.error("Save to notebook failed:", err);
      displayToast("Error saving study outline.");
    }
  };

  const handleResetTrack = () => {
    localStorage.removeItem(`stba_track_current_step_${trackId}`);
    localStorage.removeItem(`stba_track_unlocked_step_${trackId}`);
    localStorage.removeItem(`stba_track_quiz_answers_${trackId}`);
    localStorage.removeItem(`stba_track_quiz_submitted_${trackId}`);
    localStorage.removeItem(`stba_track_quiz_score_${trackId}`);
    localStorage.removeItem(`stba_track_studied_verses_${trackId}`);
    localStorage.removeItem(`stba_track_recalled_verses_${trackId}`);
    localStorage.removeItem(`stba_track_recall_inputs_${trackId}`);
    localStorage.removeItem(`stba_track_recall_checks_${trackId}`);
    localStorage.removeItem(`stba_track_teach_notes_${trackId}`);
    localStorage.removeItem(`stba_track_teach_evaluation_${trackId}`);
    localStorage.removeItem(`stba_track_saved_${trackId}`);
    localStorage.removeItem(`stba_track_notebook_page_id_${trackId}`);

    setCurrentStep(0);
    setMaxUnlockedStep(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setStudiedVerses([]);
    setRecalledVerses({});
    setRecallInputs({});
    setRecallChecks({});
    setTeachNotes("");
    setTeachEvaluation(null);
    setSaveSuccess(false);
    setSavedNotebookPageId(null);
    setHasRemoteProgress(false);
    setActiveVerseIndex(0);
    setActiveLayerTab("context");

    if (trackStatsAllowed) {
      const resetData = {
        pre_test_score: null,
        recommended_starting_point: null,
        studied_texts: [],
        active_recall: {
          masteryLevel: {},
          inputs: {},
          checks: {}
        },
        teach_it: null,
        saved_to_notebook: false,
        saved_notebook_page_id: null
      };
      ensureSupabaseAuth().then(sbUser => {
        if (sbUser) {
          saveTrackProgress(sbUser.id, trackId, resetData, false, trackInfo.title);
        }
      });
    }

    displayToast("Track study progress reset successfully.");
  };

  // Elder Stephen Discipleship Corner content
  const getElderStephenAdvice = () => {
    switch (currentStep) {
      case 0:
        return "Welcome, student of truth! Select a study track that challenges your understanding. To gain standard approval, we must move systematically through each holy design.";
      case 1:
        return "The diagnostic pre-test is not a barrier or a trial of judgment. It is simply a map showing where the Holy Spirit must guide your learning. Answer with absolute, quiet sincerity.";
      case 2:
        return "No matter if you are recommended a Beginner or Advanced starting layout, remember: every single word of Scripture is layered with infinite beauty. Let us accept our starting point with humility.";
      case 3:
        return "Here we study each text with microscopic focus. Read the historical context first, identify the unshakeable doctrine, and then allow the Spirit to apply the truth directly to your daily walk.";
      case 4:
        return "Memory is the ultimate fortress of the remnant. In the final hours, Bibles may be taken, but the scripture hid inside your heart can never be extinguished. Practice active, blind recall until it becomes part of you.";
      case 5:
        return "To teach is to love. True discipleship is completing the loop—retaining truth, understanding its depth, and then explaining it with such warmth and simplicity that even a little child can find Christ.";
      case 6:
        return "Excellent! You have run a faithful race. Let us preserve this sacred outline, your personalized study notes, and the elder evaluations inside your permanent Notebook for future ministry and reference.";
      default:
        return "Study to show thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.";
    }
  };

  return (
    <div className="w-full text-left animate-fade-in" id="TrackStudiesMode">
      
      {/* HEADER BAR AND BACK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#E8E4DA]/60 pb-5">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/tracks")}
            className="inline-flex items-center space-x-2 text-[#6B6B6B] hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            id="track-pipeline-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Syllabus Catalog</span>
          </button>
          
          <h1 className="font-serif text-2xl md:text-3xl text-[#1C2333] font-bold tracking-tight mt-2 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#C9973A]" />
            <span>Guided Study: {trackInfo.title}</span>
          </h1>
        </div>
      </div>

      {/* HUD TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1C2333] border border-[#C9973A]/20 text-white rounded-[12px] p-4 shadow-lg flex items-center gap-3"
            id="pipeline-toast"
          >
            <div className="p-1 rounded-full bg-[#C9973A]/10 text-[#C9973A]">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-sans font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* STEPPER SIDEBAR (Left on Desktop, Top on Mobile) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#E8E4DA] p-4 rounded-[12px] shadow-3xs" id="ProgressStepper">
            <button
              onClick={() => setIsStepsCollapsed(!isStepsCollapsed)}
              className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-[#6B6B6B] uppercase tracking-widest border-b border-[#F5F2EB] pb-2.5 mb-4 hover:text-stone-900 transition-colors focus:outline-none cursor-pointer"
            >
              <span>Discipleship Steps</span>
              {isStepsCollapsed ? (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              )}
            </button>
            
            <AnimatePresence initial={false}>
              {!isStepsCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {/* Steps list */}
                  <div className="space-y-2 text-left">
                    {steps.map((step, idx) => {
                      const isActive = currentStep === idx;
                      const isUnlocked = idx <= maxUnlockedStep;
                      const isDone = idx < currentStep;

                      return (
                        <motion.button
                          key={idx}
                          id={`StepIndicator-${idx + 1}`}
                          disabled={!isUnlocked}
                          onClick={() => handleGoToStep(idx)}
                          animate={{
                            scale: isActive ? 1.05 : 1.0,
                          }}
                          transition={{
                            duration: 0.16,
                            ease: "easeOut",
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 outline-none select-none ${
                            isActive 
                              ? "bg-[#1C2333] text-white border-l-4 border-[#C9973A] shadow-xs" 
                              : isUnlocked
                              ? "hover:bg-[#FDFAF5] text-stone-700 hover:text-stone-900" 
                              : "opacity-40 text-stone-400 cursor-not-allowed"
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isDone ? (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-[#C9973A] text-white" : "bg-[#2A9D8F]/15 text-[#2A9D8F]"}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <motion.path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M4.5 12.75l6 6 9-13.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border ${isActive ? "border-[#C9973A] text-[#C9973A]" : "border-stone-300"}`}>
                                {idx + 1}
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 leading-none">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-sans font-bold block">{step.label}</span>
                              <span 
                                id={`StepStatus-${idx + 1}`} 
                                className={`text-[8px] font-mono uppercase px-1 rounded font-bold ${
                                  isActive 
                                    ? "bg-[#C9973A]/20 text-[#C9973A]" 
                                    : isDone 
                                    ? "bg-[#2A9D8F]/10 text-[#2A9D8F]" 
                                    : "bg-stone-100 text-stone-400"
                                }`}
                              >
                                {isActive ? "active" : isDone ? "completed" : "locked"}
                              </span>
                            </div>
                            <p className={`text-[10px] line-clamp-1 ${isActive ? "text-stone-300" : "text-stone-500"}`}>{step.desc}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Reset Progress Button at the bottom of the card */}
                  {currentStep > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#F5F2EB]">
                      <button
                        onClick={handleResetTrack}
                        className="w-full py-2.5 border border-stone-200 hover:border-red-200 text-[#6B6B6B] hover:text-red-600 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all bg-stone-50/50 hover:bg-white cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
                      >
                        Reset Progress
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ELDER STEPHEN'S DISCIPLESHIP CORNER */}
          <div className="bg-[#FDFAF5] border border-[#E8DDC6] p-5 rounded-[12px] relative overflow-hidden text-left shadow-3xs">
            <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-[#C9973A]/10 to-transparent rounded-full filter blur-xl" />
            <div className="space-y-2.5 relative z-10">
              <span className="text-[9px] font-mono font-extrabold tracking-widest text-[#C9973A] uppercase block">
                Elder Stephen Discipleship Corner
              </span>
              <p className="font-serif italic text-xs text-[#1C2333] leading-relaxed">
                "{getElderStephenAdvice()}"
              </p>
              <div className="text-right">
                <span className="text-[9px] font-sans font-extrabold text-[#C9973A] tracking-wider uppercase">
                  — Elder Stephen, CSMS Mentor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN STEP WORKSPACE (Right column) */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="bg-white border border-[#E8E4DA] rounded-[12px] p-6 md:p-8 shadow-2xs text-left"
              id="ScreenContainer"
            >
              
              {/* STEP 1: CHOOSE TRACK */}
              {currentStep === 0 && (
                <div className="space-y-6" id="Step1ChooseTrack">
                  <div className="border-b border-[#F5F2EB] pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                      Step 1 of 7
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                      Choose Your Study Path Focus
                    </h2>
                    <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                      Select any major syllabus course track below to load its scripture outline and pre-test assessment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="TrackCardList">
                    {Object.keys(TRACK_LABELS).map((tid) => {
                      const t = TRACK_LABELS[tid];
                      const active = trackId === tid;
                      return (
                        <motion.div
                          key={tid}
                          id={`TrackCard-${tid}`}
                          onClick={() => {
                            navigate(`/tracks/${tid}/preview`);
                            displayToast(`Focus loaded: ${t.title}`);
                          }}
                          whileHover={{ 
                            scale: active ? 1.02 : 1.01,
                            boxShadow: "0 0 15px rgba(201, 151, 58, 0.25)"
                          }}
                          animate={{
                            scale: active ? 1.02 : 1.0,
                            backgroundColor: active ? "#FDFAF5" : "#ffffff",
                            borderColor: active ? "#C9973A" : "#E8E4DA"
                          }}
                          transition={{ duration: 0.2 }}
                          className="p-4 border rounded-xl cursor-pointer flex flex-col justify-between h-[150px] relative group"
                        >
                          <div className="space-y-1.5 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-sans font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-[#6B6B6B]">
                                {t.category}
                              </span>
                              {active && (
                                <span className="text-[9px] font-mono font-bold text-[#C9973A] uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9973A] animate-ping" />
                                  Active Study
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-sm md:text-base text-[#1C2333] group-hover:text-[#C9973A] transition-colors leading-tight">
                              {t.title}
                            </h3>
                            <p className="text-[11px] text-stone-500 leading-normal line-clamp-2">
                              {TRACK_PREVIEW_DOCS[tid]?.learnBullets[0]}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 border-t border-stone-100 pt-2">
                            <span>{t.count} Chapters / Sections</span>
                            <span className="text-[#C9973A] group-hover:underline font-bold uppercase tracking-wider flex items-center gap-0.5">
                              Select Focus <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      id="ContinueButton"
                    >
                      <span>Confirm Track & Pre-Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PRE-TEST */}
              {currentStep === 1 && (
                <div className="space-y-6" id="Step2PreTest">
                  <div className="border-b border-[#F5F2EB] pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                      Step 2 of 7
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                      Diagnostic Pre-Test Assessment
                    </h2>
                    <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                      Evaluate your current scripture knowledge in the <strong>{trackInfo.title}</strong> syllabus. Answer honestly; results establish your starting path.
                    </p>
                  </div>

                  {/* Quiz progress bar */}
                  <div className="space-y-2 p-4 bg-[#FDFAF5]/40 border border-[#E8E4DA]/40 rounded-xl" id="QuizProgressBar">
                    <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                      <span>Questions Answered</span>
                      <span>{Object.keys(quizAnswers).length} of {(QUIZ_DATABASE[trackId] || []).length} completed</span>
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#C9973A] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(Object.keys(quizAnswers).length / (QUIZ_DATABASE[trackId] || []).length) * 100}%` }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-6 text-left" id="QuestionList">
                    {(QUIZ_DATABASE[trackId] || []).map((q, qIdx) => {
                      const selectedOpt = quizAnswers[qIdx];
                      return (
                        <motion.div 
                          key={qIdx} 
                          id={`QuestionCard-${qIdx}`} 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: qIdx * 0.08, ease: "easeOut" }}
                          className="space-y-3 bg-[#FDFAF5]/30 border border-[#E8E4DA]/50 p-4 rounded-xl text-left"
                        >
                          <span className="text-[10px] font-mono text-[#C9973A] font-black uppercase tracking-widest">
                            Question {qIdx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-sm sm:text-base text-[#1C2333] leading-snug">
                            {q.question}
                          </h4>
                          
                          <div className="space-y-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  disabled={quizSubmitted}
                                  onClick={() => {
                                    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                  }}
                                  className={`w-full text-left p-3 text-xs sm:text-sm font-sans border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected 
                                      ? "border-[#C9973A] bg-[#FDFAF5] text-[#1C2333] font-semibold" 
                                      : "border-[#E8E4DA] bg-white hover:bg-[#FDFAF5]/20 text-stone-600"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C9973A] shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Submit Button & Results summary */}
                  {quizSubmitted ? (
                    <div className="bg-[#2A9D8F]/5 border border-[#2A9D8F]/20 p-5 rounded-xl space-y-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-[#2A9D8F]" />
                        <h4 className="font-serif font-black text-sm text-[#2A9D8F] uppercase tracking-wider">
                          Pre-Test Complete: Result Recorded
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600">
                        You scored <strong className="text-[#2A9D8F]">{quizScore} / {(QUIZ_DATABASE[trackId] || []).length}</strong>. The system has calculated your target study tier: <strong className="text-[#1C2333]">{getStartingLevel().level}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-4 border-t border-[#F5F2EB]">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < (QUIZ_DATABASE[trackId] || []).length}
                        className="px-6 py-3 bg-[#1C2333] hover:bg-[#2A344A] disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        id="SubmitButton"
                      >
                        <span>Submit Diagnostic Assessment</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-stone-200 text-[#6B6B6B] hover:text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      id="BackButton"
                    >
                      Back
                    </button>
                    {quizSubmitted && (
                      <button
                        onClick={handleNextStep}
                        className="px-5 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        id="ContinueButton"
                      >
                        <span>Continue to Starting Point</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: RECOMMENDED STARTING POINT */}
              {currentStep === 2 && (
                <div className="space-y-6" id="Step3RecommendedStartingPoint">
                  <div className="border-b border-[#F5F2EB] pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                      Step 3 of 7
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                      Recommended Starting Level Layout
                    </h2>
                    <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                      Based on your pre-test diagnostic, we have customized your active recall path.
                    </p>
                  </div>

                  {/* Recommendation Card */}
                  <motion.div 
                    initial={{ height: 0, opacity: 0, overflow: "hidden" }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.26, ease: "easeOut" }}
                    className="bg-[#FDFAF5] border border-[#E8DDC6] p-5 rounded-xl space-y-4 text-left" 
                    id="DoctrineSummaryCard"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono font-extrabold tracking-widest text-[#C9973A] uppercase bg-amber-50 px-2.5 py-0.5 rounded border border-[#C9973A]/20">
                          Target Placement
                        </span>
                        <span className="text-xs text-[#6B6B6B] font-mono font-bold">
                          Diagnostic Score: {quizScore} / {(QUIZ_DATABASE[trackId] || []).length}
                        </span>
                      </div>
                      <h3 className="font-serif font-extrabold text-base sm:text-lg text-[#1C2333]" id="DoctrineTitle">
                        {getStartingLevel().level}: {trackInfo.title}
                      </h3>
                      
                      {/* Description displayed as "Purpose of Doctrine" */}
                      <div className="bg-white/80 p-3.5 border border-[#E8DDC6]/50 rounded-xl space-y-1" id="PurposeSection">
                        <span className="text-[9px] font-mono font-black text-[#C9973A] uppercase tracking-widest block">
                          Purpose of Doctrine
                        </span>
                        <p className="text-xs sm:text-sm text-stone-700 font-serif italic leading-relaxed">
                          "{dbTrack.description}"
                        </p>
                      </div>

                      <p className="text-xs text-stone-500 italic pt-1">
                        {getStartingLevel().desc}
                      </p>
                    </div>

                    {/* Render outline as a sectioned page */}
                    <div className="space-y-4 pt-3 border-t border-[#E8DDC6]/60 text-left" id="OutlineSection">
                      <span className="text-[10px] font-mono font-extrabold text-[#1C2333] uppercase tracking-widest block">
                        Theological Core Course Outline
                      </span>
                      
                      <div className="space-y-3.5">
                        {dbTrack.outline.sections.map((section, sIdx) => (
                          <div 
                            key={sIdx} 
                            className="p-3.5 bg-stone-50 border border-stone-200/60 rounded-xl hover:border-[#C9973A]/30 transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif font-extrabold text-[#1C2333] text-xs sm:text-sm leading-snug">
                                {section.title}
                              </h4>
                              <span className="text-[9px] font-mono bg-[#1C2333]/5 text-[#1C2333] px-1.5 py-0.5 rounded font-bold shrink-0">
                                Section {sIdx + 1}
                              </span>
                            </div>
                            
                            <p className="text-xs text-stone-600 leading-relaxed font-sans">
                              {section.summary}
                            </p>
                            
                            {/* Linked Key References */}
                            {section.key_references && section.key_references.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-stone-200/50">
                                <span className="text-[8px] font-mono text-stone-400 font-extrabold uppercase tracking-wider mr-1">
                                  Linked Proofs:
                                </span>
                                {section.key_references.map((ref, rIdx) => (
                                  <span 
                                    key={rIdx}
                                    className="px-2 py-0.5 bg-white border border-[#E8DDC6]/50 text-[#C9973A] font-mono text-[9px] rounded-full font-bold shadow-3xs"
                                  >
                                    {ref}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#E8DDC6]/60" id="TextExplanationList">
                      <span className="text-[10px] font-mono text-[#C9973A] uppercase tracking-widest block font-extrabold">
                        Key Scripture Proof Chain
                      </span>
                      
                      {keyScriptures.map((v, idx) => (
                        <div key={v.id} className="flex gap-3 bg-white/70 border border-[#E8DDC6]/40 p-3 rounded-lg text-xs font-sans text-stone-700">
                          <span className="font-mono text-[#C9973A] font-bold text-[10px] shrink-0">
                            [{idx + 1}]
                          </span>
                          <div className="space-y-1">
                            <span className="font-extrabold text-[#1C2333] font-mono block">
                              {v.reference}
                            </span>
                            <p className="italic text-stone-500 line-clamp-2">
                              "{v.text}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-stone-200 text-[#6B6B6B] hover:text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      id="BackButton"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      id="StartStudyButton"
                    >
                      <span>Study Key Texts (STBA Mode)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: STUDY EACH TEXT (STBA MODE) */}
              {currentStep === 3 && (() => {
                const activeVerse = keyScriptures[activeVerseIndex];
                const verseSequence = dbTrack.stba_sequence.filter(
                  item => item.primary_reference === activeVerse.reference
                );
                const fallbackSequence = [
                  {
                    type: "context" as const,
                    primary_reference: activeVerse.reference,
                    cross_references: ["2 Peter 1:21"],
                    doctrinal_focus: "Historical Context",
                    content: EXEGETICAL_STUDY_DATA[activeVerse.reference]?.context || "Historical background commentary for this sacred passage."
                  },
                  {
                    type: "doctrine" as const,
                    primary_reference: activeVerse.reference,
                    cross_references: ["John 17:17"],
                    doctrinal_focus: "Doctrinal Truth",
                    content: EXEGETICAL_STUDY_DATA[activeVerse.reference]?.doctrine || "SDA-aligned doctrinal definition explaining this Scripture proof."
                  },
                  {
                    type: "application" as const,
                    primary_reference: activeVerse.reference,
                    cross_references: ["Psalm 119:105"],
                    doctrinal_focus: "Devotional Application",
                    content: EXEGETICAL_STUDY_DATA[activeVerse.reference]?.application || "Practical, daily applications to make this truth a living experience."
                  }
                ];
                const currentSequence = verseSequence.length > 0 ? verseSequence : fallbackSequence;
                
                // Ensure activeLayerTab matches one of the types in currentSequence
                const activeItem = currentSequence.find(i => i.type === activeLayerTab) || currentSequence[0];
                const activeTabType = activeItem ? activeItem.type : "context";

                return (
                  <div className="space-y-6" id="Step4StudyEachText">
                    <div className="border-b border-[#F5F2EB] pb-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                        Step 4 of 7
                      </span>
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                        STBA Verse Study (Layered Exegesis)
                      </h2>
                      <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                        Carefully analyze each key scripture proof in this track. Review each sequence layer (Context, Doctrine, Application, Cross References) before marking each as studied.
                      </p>
                    </div>

                    {keyScriptures.length > 0 ? (
                      <div className="space-y-5 text-left">
                        {/* Verse Navigator banner */}
                        <div className="flex items-center justify-between bg-stone-50 border border-stone-200/60 p-3 rounded-xl" id="VerseList">
                          <button
                            disabled={activeVerseIndex === 0}
                            onClick={() => {
                              const nextIdx = Math.max(0, activeVerseIndex - 1);
                              setActiveVerseIndex(nextIdx);
                              const nextVerse = keyScriptures[nextIdx];
                              const nextSeq = dbTrack.stba_sequence.filter(item => item.primary_reference === nextVerse.reference);
                              setActiveLayerTab(nextSeq[0]?.type || "context");
                            }}
                            className="p-1 text-stone-500 hover:text-[#1C2333] disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
                          <div className="text-center font-mono text-xs text-stone-500">
                            Verse <span className="font-bold text-[#1C2333]">{activeVerseIndex + 1}</span> of <span className="font-bold text-[#1C2333]">{keyScriptures.length}</span>
                          </div>

                          <button
                            disabled={activeVerseIndex === keyScriptures.length - 1}
                            onClick={() => {
                              const nextIdx = Math.min(keyScriptures.length - 1, activeVerseIndex + 1);
                              setActiveVerseIndex(nextIdx);
                              const nextVerse = keyScriptures[nextIdx];
                              const nextSeq = dbTrack.stba_sequence.filter(item => item.primary_reference === nextVerse.reference);
                              setActiveLayerTab(nextSeq[0]?.type || "context");
                            }}
                            className="p-1 text-stone-500 hover:text-[#1C2333] disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Display active verse text */}
                        <motion.div 
                          key={activeVerseIndex}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="bg-[#FDFAF5] border border-[#E8DDC6] p-5 rounded-xl space-y-2 text-center" 
                          id="VerseCard"
                        >
                          <span className="text-[10px] font-mono text-[#C9973A] font-extrabold uppercase tracking-widest">
                            Active Scripture Proof
                          </span>
                          <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#1C2333]">
                            {activeVerse.reference}
                          </h3>
                          <p className="font-bible italic text-sm sm:text-base text-stone-800 leading-relaxed pt-2">
                            "{activeVerse.text}"
                          </p>
                        </motion.div>

                        {/* Dynamic Tabs row based on sequence */}
                        <div className="flex border-b border-stone-200 overflow-x-auto scrollbar-none" id="exegesis-tabs">
                          {currentSequence.map((seqItem) => {
                            const isActive = activeTabType === seqItem.type;
                            const label = 
                              seqItem.type === "context" ? "📜 Context" : 
                              seqItem.type === "doctrine" ? "🔬 Doctrine" : 
                              seqItem.type === "application" ? "❤️ Application" : 
                              "🔗 Cross References";
                            return (
                              <button
                                key={seqItem.type}
                                onClick={() => setActiveLayerTab(seqItem.type)}
                                className={`flex-1 py-2.5 text-[11px] font-sans font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap px-3 ${
                                  isActive 
                                    ? "border-[#C9973A] text-[#C9973A]" 
                                    : "border-transparent text-stone-400 hover:text-stone-600"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Exegesis content details with focus, primary ref, cross references, and main text */}
                        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                          
                          {/* 1. Doctrinal Focus Block */}
                          <div className="bg-white border border-stone-200/60 p-3 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-extrabold block">
                                Doctrinal Focus Layer
                              </span>
                              <h4 className="font-serif font-extrabold text-[#1C2333] text-xs sm:text-sm">
                                {activeItem?.doctrinal_focus || "Scriptural Exegesis"}
                              </h4>
                            </div>
                            <span className="px-2.5 py-0.5 bg-[#C9973A]/10 text-[#C9973A] border border-[#C9973A]/20 rounded-full font-mono text-[9px] uppercase font-black tracking-wider shrink-0">
                              {activeItem?.type}
                            </span>
                          </div>

                          {/* 2. References list */}
                          <div className="space-y-1.5 bg-white border border-stone-200/60 p-3 rounded-xl">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-extrabold block">
                              Active Reference Links
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-[#1C2333] font-mono text-[9px] rounded font-extrabold">
                                Primary: {activeItem?.primary_reference}
                              </span>
                              {activeItem?.cross_references && activeItem.cross_references.map((xref, xIdx) => (
                                <span 
                                  key={xIdx}
                                  className="px-2 py-0.5 bg-white border border-[#E8DDC6]/50 text-[#C9973A] font-mono text-[9px] rounded-full font-bold shadow-3xs hover:bg-[#FDFAF5] transition-all cursor-pointer"
                                >
                                  🔗 {xref}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 3. Main Text Content */}
                          <div className="bg-white border border-stone-200/60 p-4 rounded-xl space-y-1">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
                              Theological Exposition
                            </span>
                            <p className="text-stone-800 leading-relaxed font-sans text-xs sm:text-sm">
                              {activeItem?.content}
                            </p>
                          </div>
                        </div>

                        {/* Studied checkbox tracker */}
                        <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#1C2333] block">Mark Verse as Completed</span>
                            <p className="text-[10px] text-stone-500">Check this box after completing your active study of all sequence layers.</p>
                          </div>
                          
                          <motion.button
                            id="LaunchSTBAButton"
                            onClick={() => toggleVerseStudied(activeVerse.id)}
                            animate={{
                              opacity: [0.8, 1.0, 0.8],
                            }}
                            transition={{
                              duration: 2.0,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                              studiedVerses.includes(activeVerse.id)
                                ? "bg-[#2A9D8F] border-[#2A9D8F] text-white"
                                : "bg-white border-stone-300 text-transparent"
                            }`}
                          >
                            <Check className="w-5 h-5 stroke-[3px]" />
                          </motion.button>
                        </div>

                        {/* Cumulative Progress bar of studied verses */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                            <span>Track Exegesis Progress</span>
                            <span>{studiedVerses.length} of {keyScriptures.length} Studied</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2A9D8F] rounded-full transition-all duration-500"
                              style={{ width: `${(studiedVerses.length / keyScriptures.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-stone-500 text-sm">No scripture verses mapped to this track.</div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                      <button
                        onClick={handlePrevStep}
                        className="px-4 py-2 border border-stone-200 text-[#6B6B6B] hover:text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        id="BackButton"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!allVersesStudied}
                        className="px-5 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                        id="ContinueButton"
                      >
                        <span>Continue to Active Recall</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {!allVersesStudied && (
                      <p className="text-[10px] text-stone-400 italic text-right mt-1">
                        *Please check 'Mark Verse as Completed' for all {keyScriptures.length} scriptures to unlock active recall practice.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* STEP 5: ACTIVE RECALL MODE */}
              {currentStep === 4 && (() => {
                const activeVerse = keyScriptures[activeVerseIndex];
                const matchedPrompt = dbTrack.active_recall_prompts.find(
                  p => p.reference === activeVerse.reference
                );
                const activePrompt = matchedPrompt || {
                  id: `default-${activeVerse.id}`,
                  prompt: `Without looking, try to recall and write down the key theological message of ${activeVerse.reference}, focusing on its doctrinal importance.`,
                  expected_answer: activeVerse.text,
                  reference: activeVerse.reference
                };

                return (
                  <div className="space-y-6" id="Step5ActiveRecall">
                    <div className="border-b border-[#F5F2EB] pb-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                        Step 5 of 7
                      </span>
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                        Active Recall Memorization Arena
                      </h2>
                      <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                        Practice retrieving the scripture text and dynamic doctrine prompts from memory. Enter the words into the text block to calculate your retrieval accuracy.
                      </p>
                    </div>

                    {keyScriptures.length > 0 ? (
                      <div className="space-y-5 text-left">
                        {/* Active verse header */}
                        <div className="flex items-center justify-between bg-stone-50 border border-stone-200/60 p-3 rounded-xl">
                          <button
                            disabled={activeVerseIndex === 0}
                            onClick={() => {
                              setActiveVerseIndex(prev => Math.max(0, prev - 1));
                            }}
                            className="p-1 text-stone-500 hover:text-[#1C2333] disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          
                          <div className="text-center font-mono text-xs text-stone-500">
                            Practice Verse <span className="font-bold text-[#1C2333]">{activeVerseIndex + 1}</span> of <span className="font-bold text-[#1C2333]">{keyScriptures.length}</span>
                          </div>

                          <button
                            disabled={activeVerseIndex === keyScriptures.length - 1}
                            onClick={() => {
                              setActiveVerseIndex(prev => Math.min(keyScriptures.length - 1, prev + 1));
                            }}
                            className="p-1 text-stone-500 hover:text-[#1C2333] disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Prompt Display Card */}
                        <div className="p-4 bg-[#FDFAF5] border border-[#E8DDC6] rounded-xl space-y-1 shadow-3xs">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
                            Active Recall Challenge Prompt
                          </span>
                          <p className="text-xs sm:text-sm font-serif italic text-stone-800 leading-relaxed">
                            "{activePrompt.prompt}"
                          </p>
                        </div>

                        {/* 3D PERSPECTIVE FLIP CARD WRAPPER */}
                        <div className="w-full relative h-[180px] md:h-[160px]" style={{ perspective: "1000px" }}>
                          <motion.div
                            animate={{ rotateY: recallChecks[activeVerse.id] ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full h-full relative"
                            style={{ transformStyle: "preserve-3d" }}
                          >
                            {/* FRONT SIDE (Clue Card) */}
                            <div 
                              className="absolute inset-0 w-full h-full bg-[#FDFAF5] border border-[#E8DDC6] p-5 rounded-xl flex flex-col justify-center items-center space-y-2 text-center"
                              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                            >
                              <span className="text-[10px] font-mono text-[#C9973A] font-extrabold uppercase tracking-widest block">
                                Scripture Memory Aid: Word Clues
                              </span>
                              <h3 className="font-serif font-extrabold text-lg text-[#1C2333]">
                                {activeVerse.reference}
                              </h3>
                              
                              {/* Word fill-in-the-blank puzzle */}
                              <p className="font-bible text-xs sm:text-sm text-stone-600 leading-relaxed italic line-clamp-3">
                                "{activeVerse.text.split(" ").map((word, idx) => {
                                  const isKeyword = activeVerse.keywords.some(k => word.toLowerCase().includes(k.toLowerCase()));
                                  return isKeyword ? "_____ " : `${word} `;
                                }).join("")}"
                              </p>
                            </div>
                            
                            {/* BACK SIDE (Canonical Answer Card) */}
                            <div 
                              className="absolute inset-0 w-full h-full bg-[#FDFAF5] border border-[#C9973A] p-5 rounded-xl flex flex-col justify-center items-center space-y-2 text-center"
                              style={{ 
                                backfaceVisibility: "hidden", 
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)" 
                              }}
                            >
                              <span className="text-[10px] font-mono text-[#2A9D8F] font-extrabold uppercase tracking-widest block">
                                Canonical Authorized KJV Text
                              </span>
                              <h3 className="font-serif font-extrabold text-lg text-[#1C2333]">
                                {activeVerse.reference}
                              </h3>
                              <p className="font-bible italic text-xs sm:text-sm text-stone-800 leading-relaxed">
                                "{activeVerse.text}"
                              </p>
                            </div>
                          </motion.div>
                        </div>

                        {/* Text recall box */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[#C9973A] uppercase tracking-widest font-black block">
                            Type Your Verbatim Recall Attempt
                          </label>
                          <textarea
                            rows={3}
                            value={recallInputs[activeVerse.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRecallInputs(prev => ({ ...prev, [activeVerse.id]: val }));
                            }}
                            placeholder="Type what you can recall of either the memory verse or the theological answer..."
                            className="w-full p-3 text-xs sm:text-sm font-sans rounded-xl border border-stone-200 outline-none bg-stone-50 text-stone-800 focus:ring-1 focus:ring-[#C9973A] transition-all"
                          />
                        </div>

                        {/* Accuracy Check button */}
                        {recallChecks[activeVerse.id] ? (
                          <div className="space-y-4 animate-fade-in">
                            {/* Accuracy gauge */}
                            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-stone-700 block">Theological Core Match</span>
                                <p className="text-[10px] text-stone-500">Checking semantic accuracy against the dynamic expected answer.</p>
                              </div>
                              
                              <div className="text-center font-mono shrink-0">
                                <span className="text-xl sm:text-2xl font-black text-[#C9973A]">
                                  {calculateAccuracy(
                                    recallInputs[activeVerse.id] || "", 
                                    activePrompt.expected_answer
                                  )}%
                                </span>
                              </div>
                            </div>

                            {/* Full expected answer comparison */}
                            <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs space-y-1.5">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 block font-bold">
                                Expected Doctrinal Core Answer
                              </span>
                              <p className="font-sans text-stone-800 italic">
                                "{activePrompt.expected_answer}"
                              </p>
                            </div>

                            {/* Self assessment rating */}
                            <div className="space-y-2 bg-[#FDFAF5]/40 border border-[#E8DDC6]/40 p-4 rounded-xl">
                              <span className="text-[10px] font-mono text-[#C9973A] uppercase tracking-widest font-black block text-center mb-1">
                                Rate Your Retrieval Strength
                              </span>
                              <div className="grid grid-cols-3 gap-2">
                                {(["Weak", "Developing", "Mastered"] as const).map((lvl) => {
                                  const selected = recalledVerses[activeVerse.id] === lvl;
                                  return (
                                    <motion.button
                                      key={lvl}
                                      whileTap={{ scale: 1.1 }}
                                      onClick={() => rateRecallStrength(activeVerse.id, lvl)}
                                      className={`py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                                        selected 
                                          ? lvl === "Mastered" 
                                            ? "bg-[#2A9D8F] border-[#2A9D8F] text-white" 
                                            : lvl === "Developing"
                                            ? "bg-[#C9973A] border-[#C9973A] text-white"
                                            : "bg-red-500 border-red-500 text-white"
                                          : "bg-white border-stone-200 hover:bg-stone-50 text-stone-500"
                                      }`}
                                    >
                                      {lvl}
                                    </motion.button>
                                  );
                                })}
                              </div>

                              {recalledVerses[activeVerse.id] && (
                                <div className="text-center text-[10px] font-mono text-stone-500 pt-1">
                                  Spaced repetition interval: <strong className="text-stone-700">
                                    {recalledVerses[activeVerse.id] === "Mastered" 
                                      ? "7 days" 
                                      : recalledVerses[activeVerse.id] === "Developing"
                                      ? "3 days"
                                      : "24 hours"}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCheckRecall(activeVerse.id)}
                              disabled={!(recallInputs[activeVerse.id] || "").trim()}
                              className="px-4 py-2 bg-[#1C2333] hover:bg-[#2A344A] disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>Check My Accuracy</span>
                              <Brain className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Cumulative recalled bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                            <span>Mastered Memory Verses</span>
                            <span>{Object.values(recalledVerses).filter(v => v === "Mastered" || v === "Developing").length} of {keyScriptures.length} Saved</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#C9973A] rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(Object.values(recalledVerses).filter(v => v === "Mastered" || v === "Developing").length / keyScriptures.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-stone-500 text-sm">No scripture verses mapped to this track.</div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                      <button
                        onClick={handlePrevStep}
                        className="px-4 py-2 border border-stone-200 text-[#6B6B6B] hover:text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        id="BackButton"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!allVersesRecalled}
                        className="px-5 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                        id="ContinueButton"
                      >
                        <span>Continue to Teach-It</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {!allVersesRecalled && (
                      <p className="text-[10px] text-stone-400 italic text-right mt-1">
                        *Please rate all {keyScriptures.length} scriptures as 'Mastered' or 'Developing' to unlock Teach-It verification mode.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* STEP 6: TEACH-IT MODE */}
              {currentStep === 5 && (
                <div className="space-y-6" id="Step6TeachItMode">
                  <div className="border-b border-[#F5F2EB] pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                      Step 6 of 7
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                      Teach-It Studio (Discipleship Evaluation)
                    </h2>
                    <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                      A true workman must be able to teach others. Write your personal explanation of <strong>{trackInfo.title}</strong> as if explaining it to a child or a new seeker.
                    </p>
                  </div>

                  {/* Rubric Evaluation Criteria Header */}
                  <div className="bg-[#FDFAF5] border border-[#E8DDC6] p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono text-[#C9973A] font-extrabold uppercase tracking-widest block text-left">
                      Evaluation Rubric Criteria (Discipleship Excellence)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      {dbTrack.teach_it_rubric.categories.map((cat) => {
                        const iconMap = {
                          understanding: "💡",
                          accuracy: "🎯",
                          memorization: "🧠",
                          clarity: "🗣️",
                          doctrinal_alignment: "⚖️"
                        };
                        return (
                          <div key={cat.key} className="bg-white p-3 border border-stone-200/60 rounded-lg space-y-1 text-left">
                            <span className="text-xs font-bold text-[#1C2333] flex items-center gap-1">
                              <span>{iconMap[cat.key as keyof typeof iconMap] || "📌"}</span>
                              <span>{cat.label}</span>
                            </span>
                            <p className="text-[10px] text-stone-500 leading-relaxed">
                              {cat.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Composing outline area */}
                  <div className="space-y-3.5 text-left">
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-xs space-y-1">
                      <span className="text-[#C9973A] font-bold block">💡 Suggestion for Analogy:</span>
                      <p className="text-stone-600 leading-normal">
                        {trackId === "three-angels" 
                          ? "Avoid dense timelines first. Focus on the 'Everlasting Gospel'—God's perfect, patient character of love calling children back before the storm." 
                          : "Make the sanctuary relatable. Describe it as a magnificent map pointing the way directly to Jesus' warm embrace."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#C9973A] uppercase tracking-widest font-black block">
                        Compose Your Teaching Analogy & Outline Notes
                      </label>
                      <textarea
                        rows={6}
                        value={teachNotes}
                        onChange={(e) => setTeachNotes(e.target.value)}
                        placeholder="Type out your lesson plan, child illustration, and key points..."
                        className="w-full p-4 text-xs sm:text-sm font-sans rounded-xl border border-stone-200 outline-none bg-stone-50 text-stone-800 focus:ring-1 focus:ring-[#C9973A] transition-all leading-relaxed"
                        id="teach-notes-textarea"
                      />
                    </div>

                    {/* Grading feedback workspace */}
                    {evaluating ? (
                      <div className="p-10 text-center flex flex-col items-center justify-center gap-3 border border-[#E8DDC6] rounded-xl shimmer-bg bg-[#FDFAF5]/30">
                        <Loader2 className="w-8 h-8 text-[#C9973A] animate-spin" />
                        <span className="text-xs font-mono text-[#C9973A] font-extrabold uppercase tracking-widest animate-pulse">
                          Elder Stephen is evaluating your exegesis...
                        </span>
                      </div>
                    ) : teachEvaluation ? (
                      <motion.div 
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.12
                            }
                          }
                        }}
                        className="bg-[#FDFAF5] border border-[#E8DDC6] p-5 rounded-xl space-y-4 text-xs sm:text-sm text-stone-700 text-left"
                      >
                        <motion.div 
                          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                          className="flex items-center justify-between border-b border-[#E8DDC6] pb-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-[#2A9D8F]" />
                            <h4 className="font-serif font-black uppercase tracking-wider text-[#1C2333]">
                              Elder Stephen's Discipleship Grade
                            </h4>
                          </div>
                          <span className="px-3 py-1 bg-[#C9973A] text-white rounded-lg text-xs font-mono font-black shadow-3xs uppercase tracking-wider">
                            Grade: {teachEvaluation.grade}
                          </span>
                        </motion.div>

                        <div className="space-y-4 leading-relaxed text-left">
                          <motion.p 
                            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                            className="font-serif italic text-stone-800 bg-white p-3 border border-stone-200 rounded-lg"
                          >
                            "{teachEvaluation.comment}"
                          </motion.p>

                          {/* Category Score Breakdown */}
                          {teachEvaluation.scores && (
                            <motion.div 
                              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                              className="bg-white p-4 border border-stone-200/80 rounded-xl space-y-3"
                            >
                              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-extrabold block">
                                Rubric Evaluation Performance
                              </span>
                              <div className="space-y-2.5">
                                {dbTrack.teach_it_rubric.categories.map((cat) => {
                                  const score = teachEvaluation.scores?.[cat.key] || 80;
                                  return (
                                    <div key={cat.key} className="space-y-1">
                                      <div className="flex justify-between items-center text-xs font-sans">
                                        <span className="font-bold text-stone-700">{cat.label}</span>
                                        <span className="font-mono text-[#C9973A] font-extrabold">{score}%</span>
                                      </div>
                                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-[#C9973A] rounded-full transition-all duration-500" 
                                          style={{ width: `${score}%` }} 
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}

                          <motion.div 
                            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs"
                          >
                            <div className="space-y-1 bg-stone-50 p-3 rounded-lg border border-stone-200/50">
                              <span className="font-bold text-[#1C2333] block">🔬 Recommended Child Analogy:</span>
                              <p className="text-stone-600 leading-normal">{teachEvaluation.analogy}</p>
                            </div>
                            <div className="space-y-1 bg-stone-50 p-3 rounded-lg border border-stone-200/50">
                              <span className="font-bold text-[#1C2333] block">🎯 Pastoral Refinement Appeal:</span>
                              <p className="text-stone-600 leading-normal">{teachEvaluation.appeal}</p>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={handleTeachItSubmit}
                          disabled={teachNotes.trim().length < 15}
                          className="px-5 py-3 bg-[#1C2333] hover:bg-[#2A344A] disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          id="submit-evaluation-btn"
                        >
                          <span>Request Elder Stephen's Grade</span>
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-stone-200 text-[#6B6B6B] hover:text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      id="BackButton"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!teachEvaluation}
                      className="px-5 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      id="ContinueButton"
                    >
                      <span>Continue to Notebook Sync</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {!teachEvaluation && (
                    <p className="text-[10px] text-stone-400 italic text-right mt-1">
                      *Please submit your teaching explanation and request a grade to unlock the Notebook sync stage.
                    </p>
                  )}
                </div>
              )}

              {/* STEP 7: SAVE OUTLINE TO NOTEBOOK */}
              {currentStep === 6 && (
                <div className="space-y-6" id="Step7SaveOutline">
                  <div className="border-b border-[#F5F2EB] pb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block mb-1">
                      Step 7 of 7
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#1C2333] tracking-tight">
                      Synchronize Discipleship Outline to Notebook
                    </h2>
                    <p className="text-[#6B6B6B] text-xs font-sans mt-1">
                      Excellent work! You have finished the full learning pipeline. Commit this outline and Elder Stephen's assessment directly to your personal Bible Notebook.
                    </p>
                  </div>

                  {saveSuccess ? (
                    <div className="bg-[#2A9D8F]/5 border border-[#2A9D8F]/20 p-6 rounded-xl text-center space-y-4 animate-fade-in">
                      <div className="w-12 h-12 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] flex items-center justify-center mx-auto shadow-3xs">
                        <BookmarkCheck className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="font-serif font-extrabold text-lg text-[#1C2333]">
                          Study Outline Synchronized successfully!
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 max-w-[480px] mx-auto leading-relaxed">
                          A fresh study page has been generated in your **Notebook**. All key references, custom exegesis layers, and your teach evaluation have been preserved securely.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => navigate("/notebook")}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#1C2333] hover:bg-[#2A344A] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-3xs"
                          id="nav-to-notebook-btn"
                        >
                          📖 Open Notebook
                        </button>
                        <button
                          onClick={() => {
                            navigate("/tracks");
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 border border-stone-200 hover:bg-[#FDFAF5]/30 text-stone-600 hover:text-stone-900 font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          🔄 Study Another Track
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 text-left">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="border border-stone-200 rounded-xl overflow-hidden shadow-3xs"
                      >
                        <div className="bg-[#1C2333] text-white p-4">
                          <h4 className="font-serif font-bold text-sm sm:text-base">
                            Study Summary: {trackInfo.title}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-300 uppercase tracking-wider">
                            CSMS Discipleship Workbook Summary
                          </span>
                        </div>
                        
                        <div className="p-4 bg-stone-50/50 space-y-3 text-xs sm:text-sm text-stone-600 border-t border-stone-200">
                          <div>
                            <strong className="text-[#1C2333]">Course Target:</strong> {trackInfo.badge}
                          </div>
                          <div>
                            <strong className="text-[#1C2333]">Diagnostic Score:</strong> {quizScore} / 3 ({getStartingLevel().level})
                          </div>
                          <div>
                            <strong className="text-[#1C2333]">Studied References:</strong> {keyScriptures.map(v => v.reference).join(", ")}
                          </div>
                          <div>
                            <strong className="text-[#1C2333]">Teach-It Assessment Grade:</strong> <span className="text-[#C9973A] font-bold">{teachEvaluation?.grade}</span>
                          </div>
                          <div className="pt-2 border-t border-stone-200 text-stone-500 italic max-h-[80px] overflow-y-auto">
                            "{teachNotes.substring(0, 150)}..."
                          </div>
                        </div>
                      </motion.div>

                      <div className="flex justify-center pt-4">
                        <motion.button
                          onClick={handleSaveToNotebook}
                          animate={isGlowing ? {
                            boxShadow: [
                              "0 0 0px 0px rgba(201, 151, 58, 0)",
                              "0 0 20px 6px rgba(201, 151, 58, 0.6)",
                              "0 0 0px 0px rgba(201, 151, 58, 0)"
                            ],
                            scale: [1, 1.05, 1]
                          } : {}}
                          transition={{ duration: 0.8 }}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                          id="sync-to-notebook-cta"
                        >
                          <BookMarked className="w-4 h-4" />
                          <span>Create Page & Save Outline</span>
                        </motion.button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center pt-4 border-t border-[#F5F2EB]" id="NavigationControls">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 border border-stone-200 text-[#6B6B6B] hover:text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      id="BackButton"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default TrackPreviewPage;
