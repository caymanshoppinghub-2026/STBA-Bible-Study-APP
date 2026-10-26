/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Layers, 
  BookOpenCheck, 
  Sparkles, 
  Calendar, 
  Play, 
  Check, 
  Compass, 
  BookOpen,
  ArrowRight,
  Shield,
  HelpCircle,
  Award,
  Heart,
  ChevronRight,
  Copy,
  Lock,
  MessageSquare
} from "lucide-react";
import { Scripture } from "../types";
import { StudyRoadmap } from "./StudyRoadmap";

// =========================================================================
// CENTRALIZED DYNAMIC EXEGESIS & GUIDANCE ENGINE
// =========================================================================
export interface AiGuidanceContent {
  passage: {
    reference: string;
    text: string;
  };
  bigIdea: string;
  points: string[];
  originalRoots: { word: string; meaning: string }[];
  teachingOutline: { title: string; points: string[] }[];
  transitions: string[];
  groupQuestions: string[];
  lifeSteps: string[];
  reflectionPrompts: string[];
  doctrinalDepth: { doctrine: string; statement: string };
  crossReferences: string[];
  weeklyPlan: { id: string; week: string; objective: string; checked: boolean }[];
  masteryChecks: { step: string; status: "cleared" | "active" | "pending" }[];
}

export const getAiGuidance = (scripture: Scripture): AiGuidanceContent => {
  const ref = scripture.reference || "2 Timothy 3:16";
  const txt = scripture.text || "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.";
  const kw = scripture.keywords || [];

  // Hand-crafted for 2 Timothy 3:16
  if (ref.includes("2 Timothy 3:16") || scripture.id === "fb-1") {
    return {
      passage: { reference: "2 Timothy 3:16", text: txt },
      bigIdea: "The Divine inspiration of Scripture serves as our absolute spiritual compass, guarding our minds against human traditions and the active fluency illusion.",
      points: [
        "Inspiration: The Holy Writ is God-breathed (Theopneustos), bearing the direct seal of His creative authority.",
        "Fourfold Profit: Systematically designed for teaching doctrine, exposing error (reproof), correcting path, and training in righteousness.",
        "Character Goal: Perfecting the soul so that the covenant servant is fully mature and thoroughly equipped."
      ],
      originalRoots: [
        { word: "Theopneustos (Greek)", meaning: "God-breathe, animated directly by the breath of the Holy Spirit (divine genesis)." },
        { word: "Elegchon (Greek)", meaning: "Reproof; active conviction of truth to dismantle hidden assumptions." }
      ],
      teachingOutline: [
        { title: "I. Sola Scriptura Foundation", points: ["Contrast human folklore with the breathed transcript of God.", "The historical reliability of our prophetic canon."] },
        { title: "II. The Fourfold Profit Model", points: ["Doctrine: The structural roadmap of absolute truth.", "Reproof & Correction: The diagnostic surgical calibration.", "Righteous Instruction: Daily walk matches the Sanctuary reality."] },
        { title: "III. The Remnant Equipped", points: ["Verbatim retrieval as the shield against end-time deception.", "Stand approved before the judgment seat of God."] }
      ],
      transitions: [
        "With the divine origin established, let us transition to studying how this profit system corrects our daily steps...",
        "Having structured this homiletic outline, let's step from theory into active scribal response journaling..."
      ],
      groupQuestions: [
        "How does knowing scripture is 'God-breathed' change your response to challenging prophecies?",
        "Why is active scripture recall a vital safeguard against modern spiritual deceptions?"
      ],
      lifeSteps: [
        "Durable Recall: Study 2 Timothy 3:16 verbatim at sunrise until 100% memory accuracy is cleared.",
        "Commit: Identify one theological assumption you hold that needs correcting under the direct searchlight of Scripture."
      ],
      reflectionPrompts: [
        "In what area of your personal character are you currently resisting scriptural correction?",
        "How does a passive reading habit trigger a safe-looking but deceptive 'fluency illusion' in your walk?"
      ],
      doctrinalDepth: {
        doctrine: "Fundamental Belief #1: The Holy Scriptures",
        statement: "The Holy Scriptures are the infallible revelation of His will. They are the standard of character, the test of experience, the authoritative revealer of doctrines, and the trustworthy record of God’s acts in history."
      },
      crossReferences: ["2 Peter 1:19-21", "Psalm 119:105", "Hebrews 4:12"],
      weeklyPlan: [
        { id: "wp-1", week: "Week 01", objective: "Verify historical canon reliability.", checked: true },
        { id: "wp-2", week: "Week 02", objective: "Unpack original Greek root terms.", checked: true },
        { id: "wp-3", week: "Week 03", objective: "Pass verbatim memory checks in Recall suite.", checked: false },
        { id: "wp-4", week: "Week 04", objective: "Deliver outline study to seeker class.", checked: false }
      ],
      masteryChecks: [
        { step: "SDA Pre-test Calibrated", status: "cleared" },
        { step: "Verbatim Memorization Complete", status: "active" },
        { step: "48-Hour Interleaved Recall Delay", status: "pending" }
      ]
    };
  }

  // Hand-crafted for Daniel 8:14
  if (ref.includes("Daniel 8:14") || scripture.id === "sd-1") {
    return {
      passage: { reference: "Daniel 8:14", text: txt },
      bigIdea: "The cleansing of the heavenly sanctuary starting in 1844 represents Christ's vindicating work of pre-advent judgment, revealing God's absolute justice.",
      points: [
        "The Prophetic Countdown: The 2300 chronological days represent the longest apocalyptic timeline in the entire Bible.",
        "Sanctuary Cleansing: A heavenly Day of Atonement that exposes earthly deceptions and certifies God's covenant keepers.",
        "Christ's Advocate Role: Reassurance that Jesus represents our names securely in the presence of the Father."
      ],
      originalRoots: [
        { word: "Nisdak (Hebrew)", meaning: "Vindicated, cleansed, restored to its rightful, holy and justified state." },
        { word: "Yom Kippur (Hebrew)", meaning: "The Day of Atonement; the annual cleansing of the tabernacle pattern." }
      ],
      teachingOutline: [
        { title: "I. Prophetic Mathematics", points: ["Explain the year-day principle (Ezekiel 4:6).", "Link the start of the 2300 days to 457 B.C. in Daniel 9."] },
        { title: "II. Christ In the Most Holy Place", points: ["Expose the shift from earthly shadows to heavenly realities.", "Examine Hebrews 9:23 and the heavenly cleansing process."] },
        { title: "III. Vindicating His Saints", points: ["How the investigative judgment vindicates the faith of true believers.", "An appeal to abide daily under Christ's high-priestly shelter."] }
      ],
      transitions: [
        "Since our dates are mathematically locked, let us transition to studying how our high priest acts inside the veil...",
        "With the heavenly sanctuary cleansed, let us transition to registering how we keep the inner temple of our soul holy..."
      ],
      groupQuestions: [
        "Why is Christ's work of cleansing the sanctuary a source of deep joy rather than legalistic distress?",
        "How do the dates 457 B.C. and 1844 A.D. confirm that God acts in perfect, unswerving chronological order?"
      ],
      lifeSteps: [
        "Prophetic Frame: Sketch out the 2,300-day graphic roadmap to explain the pre-advent judgment to a study group.",
        "Prayer Sanctuary: Set aside 15 minutes to thank Christ for representing your name in the heavenly Most Holy Place."
      ],
      reflectionPrompts: [
        "Is there an area of your walk where you are trying to hide guilt indeed of letting Christ cleanse it?",
        "How does Christ's active high-priestly mediation inspire your confidence to share His final warning today?"
      ],
      doctrinalDepth: {
        doctrine: "Fundamental Belief #24: Christ’s Ministry in the Heavenly Sanctuary",
        statement: "There is a sanctuary in heaven, the true tabernacle which the Lord set up. In it Christ ministers on our behalf, making available to believers the benefits of His atoning sacrifice offered once for all."
      },
      crossReferences: ["Hebrews 9:23-28", "Leviticus 16:15-18", "Daniel 9:24-27"],
      weeklyPlan: [
        { id: "wp-1", week: "Week 01", objective: "Study the Levitical shadow sanctuary.", checked: true },
        { id: "wp-2", week: "Week 02", objective: "Calculate the 70-weeks link in Daniel 9.", checked: true },
        { id: "wp-3", week: "Week 03", objective: "Verify 1844 chronologies.", checked: false },
        { id: "wp-4", week: "Week 04", objective: "Preach standard-bearer sanctuary outlines.", checked: false }
      ],
      masteryChecks: [
        { step: "Yom Kippur Symbolism", status: "cleared" },
        { step: "Mathematical Calculation", status: "active" },
        { step: "Passage Verbatim Mastery", status: "pending" }
      ]
    };
  }

  // Hand-crafted for Revelation 14:12
  if (ref.includes("Revelation 14:12") || scripture.id === "ta-3") {
    return {
      passage: { reference: "Revelation 14:12", text: txt },
      bigIdea: "In the final climax of the planetary great controversy, God's remnant church stands characterized by holy patience, commandment loyalty, and the faith of Jesus.",
      points: [
        "The Endurance Profile: Patience (hypomone) represents active, unswerving standing under the beast's coercive decree.",
        "The Obedience Seal: Guarding the commandments of God, specifically the Sabbath sign of creative lordship.",
        "The Inner Faith: Possessing the exact personal faith *of* Jesus that triumphed over Calvary's darkest hours."
      ],
      originalRoots: [
        { word: "Hypomone (Greek)", meaning: "Endurance, steadfastness; remaining active under intense pressure without breaking." },
        { word: "Pistis Iesou (Greek)", meaning: "The Faith of Jesus; Christ's own unyielding faith planted inside His remnant flock." }
      ],
      teachingOutline: [
        { title: "I. The Remnant Identified", points: ["The dual identifiers: Law of God and Faith of Jesus.", "Why obedience is the natural consequence of true saving grace."] },
        { title: "II. The Sabbath Seal", points: ["Demonstrate how the fourth commandment serves as the heart of covenant loyalty.", "The clash between divine rest and human striving."] },
        { title: "III. Conquering by the Faith of Jesus", points: ["Define how we receive Christ's personal faith to pass the final crisis.", "Appeal to lock in uncompromised loyalty to God's standard."] }
      ],
      transitions: [
        "Since the patience of the saints is forged in fire, let us transition to charting how the Faith of Jesus sustains us...",
        "With the remnant specifications defined, let's step into structuring the weekly plan to teach this across our circle..."
      ],
      groupQuestions: [
        "What is the difference between having faith 'in' Jesus vs possessing the actual 'faith of' Jesus?",
        "How does the holy Seventh-day Sabbath act as an unshielded test of covenant loyalty in the final crisis?"
      ],
      lifeSteps: [
        "Sabbath Consecration: Shut off all secular texts and tasks 30 minutes before sunset to enter God's rest.",
        "Witness: Share one instance where the 'faith of Jesus' gave you courage to stand for truth in small choices."
      ],
      reflectionPrompts: [
        "Are you attempting to keep the commandments of God in your own strength, or through the Faith of Jesus?",
        "Where is your patience currently being tested, and how can you rest completely in the Father's care?"
      ],
      doctrinalDepth: {
        doctrine: "Fundamental Belief #12: The Remnant and Its Mission",
        statement: "The universal church is composed of all who truly believe, but in the last days, a remnant has been called out to keep the commandments of God and have the faith of Jesus. This remnant announces the arrival of judgment."
      },
      crossReferences: ["Revelation 12:17", "Leviticus 23:3", "Ephesians 2:8-10"],
      weeklyPlan: [
        { id: "wp-1", week: "Week 01", objective: "Trace the Great Controversy origin.", checked: true },
        { id: "wp-2", week: "Week 02", objective: "Distinguish legalism from faith obedience.", checked: true },
        { id: "wp-3", week: "Week 03", objective: "Master Greek 'Pistis Iesou' verbatim.", checked: false },
        { id: "wp-4", week: "Week 04", objective: "Announce three angels' messages locally.", checked: false }
      ],
      masteryChecks: [
        { step: "Patience Greek Translation", status: "cleared" },
        { step: "Sabbath loyalty certification", status: "active" },
        { step: "Verbatim memory vault sealed", status: "pending" }
      ]
    };
  }

  // Smart Dynamic Context-Aware Generator for any other scripture
  const hasSabbath = kw.some(k => ["sabbath", "rest", "delight", "holy"].includes(k.toLowerCase())) || txt.toLowerCase().includes("sabbath");
  const hasSanctuary = kw.some(k => ["sanctuary", "priest", "cleanse", "dwell", "temple"].includes(k.toLowerCase())) || txt.toLowerCase().includes("sanctuary");
  const hasCommandments = kw.some(k => ["commandments", "law", "keep", "conclusion"].includes(k.toLowerCase())) || txt.toLowerCase().includes("commandment");
  const hasJudgment = kw.some(k => ["judgment", "come", "advent", "quickly", "days"].includes(k.toLowerCase())) || txt.toLowerCase().includes("judgment");

  let themeTitle = "Sola Scriptura Standards";
  let sdaObj = "Fundamental Belief #1: The Holy Scriptures";
  let sdaStatement = "The Holy Scriptures are the infallible revelation of God's will. They serve as the authoritative standard of faith and practice.";
  let originalWord = "Sola Scriptura (Latin)";
  let originalMeaning = "Scripture alone; the absolute yardstick of Christian faith and doctrine.";
  let idea = `The message of ${ref} invites us into active, thorough alignment with God's revealed instruction, ensuring durable memory of his sacred decrees.`;
  let outlineIntro = "Introduction: Establish Sola Scriptura standards.";
  let outlineBody = "Body: Analyze the covenant responsibilities in the passage.";
  let outlineConc = "Conclusion: Commit the heart and mind to active retrieval.";
  let question1 = `How does ${ref} challenge us to step away from passive study habits and pursue deep, verbalized mastery?`;
  let question2 = "In what ways does this verse support the final covenant unity of God's people?";
  
  if (hasSabbath) {
    themeTitle = "Sabbath Rest Covenant";
    sdaObj = "Fundamental Belief #20: The Sabbath";
    sdaStatement = "The gracious Creator, after the six days of Creation, rested on the seventh day and instituted the Sabbath for all people as a perpetual memorial.";
    originalWord = "Shabbat (Hebrew)";
    originalMeaning = "To cease, rest, or pause from active human striving.";
    idea = `The sacred rest detailed in ${ref} represents a beautiful seal of God's creative work and invites us to rest in His grace.`;
    outlineIntro = "Introduction: The Creation roots of Seventh-day Sanctification.";
    outlineBody = "Body: The weekly Sabbath as an active sign of the everlasting covenant.";
    outlineConc = "Conclusion: Entering the rest of Jesus with a clean heart on the evening watch.";
  } else if (hasSanctuary) {
    themeTitle = "Heavenly Sanctuary & High Priest";
    sdaObj = "Fundamental Belief #24: Christ's Ministry in the Heavenly Sanctuary";
    sdaStatement = "Jesus serves as our High Priest in the true tabernacle in heaven, making available the final fruits of His eternal redeeming covenant.";
    originalWord = "Mikdash (Hebrew)";
    originalMeaning = "Sacred space; refuge; the divine dwelling pattern.";
    idea = `The sanctuary theme in ${ref} redirects our eyes within the veil, where Jesus mediates on our behalf before the Father's throne.`;
    outlineIntro = "Introduction: Understanding the patterns and shadows of the Tabernacle.";
    outlineBody = "Body: The Day of Atonement and Christ's final work of clearing and cleansing.";
    outlineConc = "Conclusion: Standing approved before the high priest with absolute security.";
  } else if (hasCommandments) {
    themeTitle = "The Commandment Covenant";
    sdaObj = "Fundamental Belief #19: The Law of God";
    sdaStatement = "The great principles of God's law are embodied in the Ten Commandments and exemplified in the life of Christ. They express God's love.";
    originalWord = "Mitzvah (Hebrew)";
    originalMeaning = "A divine directive or commandment indicating covenant obedience.";
    idea = `The law of God in ${ref} serves to guide our feet, acting as a mirror of His character and a standard of covenant love.`;
    outlineIntro = "Introduction: The eternal, unchanging nature of the law.";
    outlineBody = "Body: How grace inspires and empowers our obedience.";
    outlineConc = "Conclusion: A joyful petition to have His directions stamped on our hearts.";
  } else if (hasJudgment) {
    themeTitle = "The Prophetic Standard";
    sdaObj = "Fundamental Belief #25: The Second Coming of Christ";
    sdaStatement = "The second advent of Christ is the magnificent hope of the church, the grand climax of the master plan of salvation.";
    originalWord = "Krisis (Greek)";
    originalMeaning = "Evaluation, decision, or the divine separation of truth from error.";
    idea = `The prophetic timelines of ${ref} call us to recognize the late watch of the relative planetary hour, urging deep readiness.`;
    outlineIntro = "Introduction: The certainty of prophecy and divine timekeeping.";
    outlineBody = "Body: The Three Angels' Messages and the pre-advent evaluation.";
    outlineConc = "Conclusion: Living as standard-bearers with Christ's reward in view.";
  }

  return {
    passage: { reference: ref, text: txt },
    bigIdea: idea,
    points: [
      `Sola Scriptura: Anchoring every word of ${ref} directly in the biblical context rather than tradition.`,
      `Pastoral Counsel: Recognizing God's personal, loving instructions to your study path.`,
      `Active Retrieval: Verbalizing this truth to overcome active memory decay.`
    ],
    originalRoots: [
      { word: originalWord, meaning: originalMeaning },
      { word: "Berean (Acts 17:11)", meaning: "Checking the scriptures daily to verify apostolic teachings." }
    ],
    teachingOutline: [
      { title: outlineIntro, points: ["Define key theological words in the passage.", "Assess the historical and literal background."] },
      { title: outlineBody, points: ["Deconstruct the core spiritual command.", "Unify this passage with other cross-referenced proofs."] },
      { title: "Conclusion & Appeal", points: [outlineConc, "Formulate a clear standard-bearer commitment to share this truth."] }
    ],
    transitions: [
      `Having grounded this verse in the original ${originalWord} meanings, let's transition to evaluating its doctrinal scope...`,
      "Now, let's step from teaching into active journaling to capture how this truth shapes our personal walk..."
    ],
    groupQuestions: [
      question1,
      question2
    ],
    lifeSteps: [
      `Write out ${ref} by hand three times in your study journal to build muscle recall.`,
      "Discuss this scripture's deep covenant meaning with one friend or seeker class."
    ],
    reflectionPrompts: [
      "Where is your heart currently struggling to submit to this biblical truth?",
      "How does this verse challenge your current lifestyle priorities?"
    ],
    doctrinalDepth: {
      doctrine: sdaObj,
      statement: sdaStatement
    },
    crossReferences: ["Psalm 119:9", "Joshua 1:8", "John 17:17"],
    weeklyPlan: [
      { id: "wp-1", week: "Week 01", objective: "Initialize verbatim memorization.", checked: true },
      { id: "wp-2", week: "Week 02", objective: "Evaluate grammatical keywords.", checked: false },
      { id: "wp-3", week: "Week 03", objective: "Study related historical Adventist literature.", checked: false },
      { id: "wp-4", week: "Week 04", objective: "Incorporate into local Sabbath presentation.", checked: false }
    ],
    masteryChecks: [
      { step: "Passage Parsing", status: "cleared" },
      { step: "Semantic Recall Match", status: "active" },
      { step: "Sabbath Sun-down Review", status: "pending" }
    ]
  };
};

// =========================================================================
// TEACH IT VIEW
// =========================================================================
interface TeachItViewProps {
  onLaunchTeachIt: (scripture: Scripture) => void;
  scriptures: Scripture[];
  activeScripture?: Scripture | null;
}

export const TeachItView: React.FC<TeachItViewProps> = ({ 
  onLaunchTeachIt, 
  scriptures,
  activeScripture
}) => {
  const currentVerse = activeScripture || scriptures[0];
  const guidance = getAiGuidance(currentVerse);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6 pt-1 text-left" id="right-canvas-teach-it">
      {/* Dynamic Header */}
      <div className="border-b border-stone-200 pb-4">
        <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-700 px-2.5 py-1 rounded-md font-bold">
          Teach It Mode Active Guidance
        </span>
        <h3 className="font-serif font-extrabold text-2xl text-[#1C2333] pt-2">
          Pedagogical Homiletic Studio
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Currently outlining: <strong className="text-teal-800 font-bold">{guidance.passage.reference}</strong>. Translate this truth into clear, uncompromised group lessons.
        </p>
      </div>

      {/* Target Passage Reference Box */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5">
          <span className="text-[8.5px] font-mono text-[#A0885B] uppercase block font-bold">ACTIVE SERMON ANCHOR:</span>
          <span className="font-serif font-bold text-[#1C2333] text-sm">{guidance.passage.reference}</span>
          <p className="font-serif text-xs text-stone-600">"{guidance.passage.text}"</p>
        </div>
        <button
          onClick={() => onLaunchTeachIt(currentVerse)}
          className="py-2 px-3.5 bg-teal-650 hover:bg-teal-700 text-white font-mono text-[10px] uppercase font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <span>Oral Practice Verbatim</span>
          <Play className="w-3 h-3 fill-current" />
        </button>
      </div>

      {/* 2-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Teaching Outline (Wants: Teaching outline, transitions) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold flex items-center justify-between">
              <span>HOMILETICAL TEACHING OUTLINE</span>
              <span className="text-[8.5px] text-teal-700 lowercase">Big Idea → Points → Explanation</span>
            </h4>

            <div className="space-y-3" id="homiletic-outline-list">
              {guidance.teachingOutline.map((section, idx) => (
                <div key={idx} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[9px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <h5 className="font-serif font-black text-xs text-[#1C2333]">{section.title}</h5>
                  </div>
                  <div className="p-3.5 space-y-2">
                    {section.points.map((pt, pIdx) => (
                      <p key={pIdx} className="text-xs text-stone-750 font-serif flex items-start space-x-2">
                        <span className="text-teal-605 mt-1 shrink-0 font-bold">•</span>
                        <span>{pt}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRANSITIONS BLOCK */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              AI GUIDED TEACHING TRANSITIONS (Avoid Awkward Jumps)
            </span>
            <div className="space-y-2" id="homiletic-transitions">
              {guidance.transitions.map((trans, idx) => (
                <div key={idx} className="p-3 bg-teal-50/60 border-l-2 border-teal-500 rounded-r-xl relative text-xs text-teal-900 leading-relaxed font-serif">
                  "{trans}"
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Group Questions & Formula Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* GROUP QUESTIONS (Wants: group questions) */}
          <div className="bg-[#FAF7F0] border border-[#E8E4DA] p-4 rounded-2xl space-y-3">
            <h4 className="font-serif font-extrabold text-navy text-sm flex items-center gap-1.5 border-b border-[#E8E4DA]/60 pb-2">
              <MessageSquare className="w-4 h-4 text-teal-650 shrink-0" />
              <span>Socratic Group Questions</span>
            </h4>
            <p className="text-[10.5px] text-stone-600 font-serif leading-relaxed">
              Use these contextual prompts to inspire discussion and check semantic theological understanding inside your Sabbath lesson circles:
            </p>

            <div className="space-y-2.5 pt-1.5" id="homiletic-discussion-prompts">
              {guidance.groupQuestions.map((q, idx) => (
                <div key={idx} className="bg-white p-3 border border-[#E8E4DA]/60 rounded-xl text-xs space-y-1.5 text-left relative shadow-3xs hover:border-[#C9973A] transition-all group">
                  <p className="font-serif text-stone-800 leading-normal pl-1">
                    "{q}"
                  </p>
                  <div className="flex justify-between items-center text-[9px] font-mono pt-1 text-stone-400">
                    <span>Prompt {idx + 1}</span>
                    <button
                      onClick={() => handleCopy(q, idx)}
                      className="text-teal-700 hover:text-teal-950 flex items-center gap-1 cursor-pointer bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200/50"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sola Scriptura Guidelines */}
          <div className="p-4 border border-stone-200 rounded-2xl bg-white space-y-2 text-xs">
            <h5 className="font-serif font-bold text-[#1C2333]">SDA Homiletical Rules</h5>
            <ul className="space-y-1.5 text-[11px] text-stone-600 list-disc pl-4 font-sans leading-relaxed">
              <li>Always cite Scripture proofs to clarify controversial items.</li>
              <li>Avoid highly speculative timelines or unbiblical charts.</li>
              <li>Keep Christ at the absolute center of every prophecy and warning.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// STBA VIEW
// =========================================================================
interface STBAViewProps {
  pretestFinished: boolean;
  pretestSelectedAnswer: number | null;
  onPretestAnswer: (answerIndex: number) => void;
  onStartRecall: () => void;
  activeScripture?: Scripture | null;
  scriptures: Scripture[];
}

export const STBAView: React.FC<STBAViewProps> = ({
  pretestFinished,
  pretestSelectedAnswer,
  onPretestAnswer,
  onStartRecall,
  activeScripture,
  scriptures
}) => {
  const currentVerse = activeScripture || scriptures[0];
  const guidance = getAiGuidance(currentVerse);

  return (
    <div className="space-y-6 pt-1 text-left" id="right-canvas-stba">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <span className="text-[10px] font-mono uppercase bg-teal-500/10 text-teal-700 px-2.5 py-1 rounded-md font-bold">
          STBA Mode Active Guidance
        </span>
        <h3 className="font-serif font-bold text-2xl text-[#1C2333] pt-2">
          Diagnostic Doctrinal Calibration
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Selected validation anchor: <strong className="text-teal-800 font-bold">{guidance.passage.reference}</strong>. Establish deep Seventh-day Adventist doctoral clarity.
        </p>
      </div>

      {/* Target Doctrinal Quote Panel (Wants: SDA doctrinal depth) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pre-Test & Cross References (Wants: cross-references) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Inline Pre-Test Widget Frame */}
          <div className="bg-[#FAF7F0] border border-[#E8E4DA] p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#E8E4DA]/60 pb-2 text-[#1C2333]">
              <Compass className="w-4 h-4 text-teal-600 animate-spin-slow shrink-0" />
              <h4 className="font-serif font-bold text-xs sm:text-sm">Diagnostic Pre-test: {guidance.passage.reference}</h4>
            </div>

            <p className="text-xs text-stone-800 leading-relaxed font-serif pl-1">
              {guidance.passage.reference.includes("Timothy") ? (
                <>
                  "All scripture is given by inspiration of God, and is profitable for doctrine, for ________, for correction, for instruction in righteousness..."
                </>
              ) : guidance.passage.reference.includes("Daniel") ? (
                <>
                  "Unto two thousand and three hundred days; then shall the ________ be cleansed."
                </>
              ) : (
                <>
                  "Here is the patience of the saints: here are they that keep the ________ of God, and the faith of Jesus."
                </>
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-serif">
              {(guidance.passage.reference.includes("Timothy") 
                ? ["remembrance", "reproof", "holiness", "meditation"]
                : guidance.passage.reference.includes("Daniel")
                ? ["sanctuary", "temple", "generation", "remnant"]
                : ["traditions", "laws", "commandments", "sabbaths"]
              ).map((ans, idx) => {
                const isCorrect = guidance.passage.reference.includes("Timothy") 
                  ? idx === 1 
                  : guidance.passage.reference.includes("Daniel")
                  ? idx === 0 
                  : idx === 2;
                return (
                  <button
                    key={idx}
                    onClick={() => onPretestAnswer(idx)}
                    className={`py-2.5 px-4 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                      pretestSelectedAnswer === idx
                        ? isCorrect
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold"
                          : "bg-rose-50 border-rose-300 text-rose-900"
                        : "bg-white border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <span>{idx + 1}. {ans}</span>
                    {pretestFinished && isCorrect && <span className="text-xs font-mono font-bold text-emerald-600">Correct✓</span>}
                    {pretestFinished && pretestSelectedAnswer === idx && !isCorrect && <span className="text-xs font-mono font-bold text-rose-600">Incorrect✕</span>}
                  </button>
                );
              })}
            </div>

            {pretestFinished && (
              <div className="p-3 bg-white rounded-lg border border-[#E8E4DA] text-[11px] leading-relaxed text-stone-650 font-sans">
                💡 {guidance.passage.reference.includes("Timothy")
                  ? "Correct alignment! 'Reproof' (Greek-lemma 'elegchon') represents structural conviction of truth to dismantle hidden assumptions."
                  : guidance.passage.reference.includes("Daniel")
                  ? "Correct alignment! 'Sanctuary' (Hebrew 'Mikdash') represents the cosmic sanctuary center of Christ's active priestly mediation."
                  : "Correct alignment! 'Commandments' (Greek 'Entolas') represents the Decalogue written on hearts by the Spirit."}
              </div>
            )}

            <button
              onClick={onStartRecall}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1"
            >
              <span>Begin Active Verbatim Recall</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CROSS-REFERENCES */}
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              CROSS-REFERENCED STUDY CHAIN (Scripture Interprets Scripture)
            </span>
            <div className="space-y-2" id="stba-cross-references">
              {guidance.crossReferences.map((refStr, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-3.5 rounded-xl flex items-center justify-between shadow-2xs hover:border-teal-300 transition-all">
                  <div className="flex items-center space-x-3 pr-2">
                    <div className="w-7 h-7 bg-[#C9973A]/10 text-[#C9973A] rounded-lg flex items-center justify-center font-mono text-[10.5px] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-serif font-black text-xs text-[#1C2333]">{refStr}</h5>
                      <p className="text-[10px] text-stone-400 font-mono">Doctrinal correlation proof text</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: SDA Doctrinal Depth Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4" id="stba-doctrinal-depth">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              SDA DOCTRINAL DEPTH & FOCUS
            </span>

            <div className="p-3 bg-teal-50/50 border border-teal-200/50 text-[#1C2333] rounded-lg">
              <div className="flex items-center gap-1.5 text-teal-800 font-serif text-[11.5px] font-bold">
                <Shield className="w-4 h-4 text-[#C9973A] shrink-0" />
                <span>{guidance.doctrinalDepth.doctrine}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-[10.5px] font-mono uppercase tracking-wider text-stone-505 font-bold">Official Statement of Belief:</h5>
              <p className="text-xs text-stone-700 leading-relaxed font-serif bg-white p-3.5 rounded-xl border border-stone-150">
                "{guidance.doctrinalDepth.statement}"
              </p>
            </div>

            {/* Original word roots */}
            <div className="space-y-2 pt-1 border-t border-stone-200">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-505 font-bold block">Original Grammatical Roots:</span>
              <div className="space-y-2.5">
                {guidance.originalRoots.map((root, bIdx) => (
                  <div key={bIdx} className="bg-white p-3 rounded-xl border border-stone-150 text-[11px] space-y-0.5 leading-snug">
                    <strong className="font-serif text-[#1C2333] font-bold block">{root.word}</strong>
                    <span className="font-serif text-stone-505 text-[10.5px]">"{root.meaning}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// APPLICATION VIEW (SCRIBAL JOURNAL)
// =========================================================================
interface ApplicationViewProps {
  reflectionInput: string;
  setReflectionInput: (val: string) => void;
  onSaveReflection: () => void;
  savedReflections: string[];
  detailedReflections: any[];
  activeScripture?: Scripture | null;
  scriptures: Scripture[];
}

export const ApplicationView: React.FC<ApplicationViewProps> = ({
  reflectionInput,
  setReflectionInput,
  onSaveReflection,
  savedReflections,
  detailedReflections,
  activeScripture,
  scriptures
}) => {
  const currentVerse = activeScripture || scriptures[0];
  const guidance = getAiGuidance(currentVerse);

  return (
    <div className="space-y-6 pt-1 text-left" id="right-canvas-application">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-700 px-2.5 py-1 rounded-md font-bold">
          Application Mode Active Guidance
        </span>
        <h3 className="font-serif font-extrabold text-2xl text-[#1C2333] pt-2">
          Scribal Devotional Diary
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Active anchor: <strong className="text-teal-800 font-bold">{guidance.passage.reference}</strong>. Capture practical trust steps to build durable character records.
        </p>
      </div>

      <div className="bg-white border border-[#E8E4DA] p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="space-y-0.5">
          <span className="text-[8.5px] font-mono text-[#A0885B] uppercase block font-bold">STUDY VERSE:</span>
          <span className="font-serif font-bold text-[#1C2333] text-sm">{guidance.passage.reference}</span>
          <p className="font-serif text-xs text-stone-600">"{guidance.passage.text}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input box & Life Steps (Wants: Life steps, journaling) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#FAF7F0] border border-[#E8E4DA] p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase text-[#A0885B] block font-bold">
                LOG DEVOTIONAL REFLECTION (Journaling)
              </span>
              <p className="text-xs text-stone-505 font-serif leading-relaxed">
                Take a quiet moment. Under the guidance of early sanctuary truths, what is the Holy spirit prompting you to release, trust, or modify today? Draft your covenants:
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                placeholder="I realize that my daily pacing needs structural rest, mapping 2 Tim 3:16 closer into my heart..."
                className="w-full h-24 p-3 bg-white border border-[#E8E4DA] rounded-xl focus:outline-none focus:border-teal-500 text-xs font-sans text-navy"
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
              />

              <button
                onClick={onSaveReflection}
                disabled={!reflectionInput.trim()}
                className="py-2.5 px-4 bg-teal-650 hover:bg-teal-700 font-mono text-xs uppercase tracking-wide text-white rounded-lg disabled:opacity-40 cursor-pointer font-bold transition-all hover:shadow-xs active:scale-97"
              >
                Store Devotional Covenants
              </button>
            </div>
          </div>

          {/* ACTIVE LIFE STEPS */}
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              AI PROPOSED TRUST STEPS (Durable Action Plan)
            </span>
            <div className="space-y-2.5" id="homiletic-life-steps">
              {guidance.lifeSteps.map((stepStr, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-stone-200 rounded-xl flex items-start space-x-3.5 shadow-3xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <strong className="font-serif text-xs text-[#1C2333] font-black uppercase tracking-wide block">Action {idx + 1}</strong>
                    <p className="text-xs text-stone-650 font-serif leading-relaxed mt-0.5">
                      {stepStr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Reflection Prompts & Diaries (Wants: reflection prompts) */}
        <div className="lg:col-span-5 space-y-4">
          {/* REFLECTION PROMPTS */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              AI PASTORAL REFLECTION PROMPTS
            </h4>
            <div className="space-y-2.5" id="application-prompts">
              {guidance.reflectionPrompts.map((prompt, idx) => (
                <div key={idx} className="bg-white p-3 border border-stone-150 rounded-xl text-xs space-y-1 font-serif leading-relaxed text-stone-700">
                  "{prompt}"
                </div>
              ))}
            </div>
          </div>

          {/* ARCHIVES */}
          <div className="space-y-3" id="spiritual-response-archives">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              SCRIBAL RESPONSE COVENANTS ({detailedReflections.length + savedReflections.length})
            </span>

            {detailedReflections.length > 0 ? (
              <div className="space-y-3">
                {detailedReflections.map((ref) => (
                  <div key={ref.id} className="bg-white border border-[#E8E4DA] p-4 rounded-xl space-y-3 shadow-3xs">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                      <strong className="font-serif text-[11.5px] text-teal-850 truncate max-w-[150px]">{ref.passage}</strong>
                      <span className="text-[9.5px] text-stone-400 font-mono">
                        {new Date(ref.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs leading-relaxed">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[8px] text-stone-400 font-bold uppercase block">Personal Diary logs:</span>
                        <p className="text-stone-705 font-serif">"{ref.character || ref.trust || "Active study reflection complete."}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedReflections.length > 0 ? (
              <div className="space-y-2">
                {savedReflections.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-150 text-xs text-stone-605 leading-relaxed">
                    "{item}"
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 bg-stone-50 border border-dashed rounded-xl text-center text-stone-400 font-serif text-xs">
                No reflection diaries logged yet. Type above to store.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// SYLLABUS VIEW
// =========================================================================
interface SyllabusViewProps {
  activeScripture?: Scripture | null;
  scriptures: Scripture[];
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  activeScripture,
  scriptures
}) => {
  const currentVerse = activeScripture || scriptures[0];
  const guidance = getAiGuidance(currentVerse);
  const [weeklyObjectives, setWeeklyObjectives] = useState(guidance.weeklyPlan);

  // Sync state if scripture updates
  React.useEffect(() => {
    setWeeklyObjectives(guidance.weeklyPlan);
  }, [currentVerse]);

  const toggleObjective = (id: string) => {
    setWeeklyObjectives(prev => 
      prev.map(obj => obj.id === id ? { ...obj, checked: !obj.checked } : obj)
    );
  };

  return (
    <div className="space-y-6 pt-1 text-left" id="right-canvas-syllabus">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-700 px-2.5 py-1 rounded-md font-bold">
          Syllabus Mode Active Guidance
        </span>
        <h3 className="font-serif font-extrabold text-2xl text-[#1C2333] pt-2">
          Bible Curriculum Sequence
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Currently planning: <strong className="text-teal-800 font-bold">{guidance.passage.reference}</strong>. Track checkpoints and sequential roadmap goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Weekly Plan Builder (Wants: Weekly plan builder) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FAF7F0] border border-[#E8E4DA] p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase text-[#A0885B] block font-bold">
                ACTIVE WEEKLY STUDY PLAN BUILDER
              </span>
              <p className="text-xs text-stone-505 font-serif leading-relaxed">
                Check off core weekly milestones during your four-week study calendar for {guidance.passage.reference}:
              </p>
            </div>

            <div className="space-y-2.5" id="syllabus-weekly-planner">
              {weeklyObjectives.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => toggleObjective(obj.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer select-none bg-white ${
                    obj.checked 
                      ? "border-emerald-250 bg-emerald-50/20" 
                      : "border-[#E8E4DA]/80 hover:border-teal-400"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    obj.checked 
                      ? "bg-emerald-600 border-emerald-600 text-white" 
                      : "border-stone-300 bg-white"
                  }`}>
                    {obj.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-[9.5px] font-mono text-stone-400 font-bold block leading-none">{obj.week}</span>
                    <p className={`text-xs font-serif leading-tight mt-1 ${obj.checked ? "text-stone-400 line-through" : "text-stone-800"}`}>
                      {obj.objective}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Core Adults Quarterly Synopsis */}
          <div className="bg-white border border-stone-200 p-4 rounded-2xl space-y-2 text-xs font-serif">
            <h5 className="font-serif font-black text-[#1C2333] flex items-center gap-1.5 leading-none">
              <Calendar className="w-4 h-4 text-teal-650" />
              <span>SDA General Conference Lesson Sync</span>
            </h5>
            <p className="text-stone-605 text-[11px] leading-relaxed">
              "The sanctuary pattern and planetary justice serves as the quarterly anchor. Incorporate verbal-recall tests at Friday sun-down to certify memory vault completions."
            </p>
          </div>
        </div>

        {/* Right Column: Chronological Aprendi Roadmap */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">
              PLANNING MILESTONE TIMELINE
            </span>
            <StudyRoadmap />
          </div>
        </div>
      </div>
    </div>
  );
};
