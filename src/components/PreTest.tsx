/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpenCheck,
  Compass,
  FileText,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  topic: string; // Used for gap analysis focus tracking
}

// Map each track ID to robust specialized theological questions
const TRACK_QUIZZES: Record<string, QuizQuestion[]> = {
  "fundamental-beliefs": [
    {
      id: 1,
      question: "How is the Protestant Bible inspired according to standard Adventist theology?",
      options: [
        "Mechanical dictation where writers acted as typewriter keys.",
        "Inspiration of the writers, where holy men of God were moved by the Holy Spirit (inspiration of thought, not verbal dictation).",
        "It is merely a outstanding piece of poetic human literature.",
        "It represents symbolic adaptations of old historical folklore."
      ],
      correctAnswerIndex: 1,
      topic: "Inspiration of Scripture (Belief 1)"
    },
    {
      id: 2,
      question: "The biblical Godhead (Trinity) consists of how many co-eternal, co-equal Persons?",
      options: [
        "One Person playing three different roles sequentially (Modalism).",
        "Three separate gods with different agendas and powers (Tritheism).",
        "Three co-eternal, co-equal Persons: Father, Son, and Holy Spirit, who are undivided in purposes and operations.",
        "Only the Father is eternal; the Son and Spirit are subordinate, created beings."
      ],
      correctAnswerIndex: 2,
      topic: "The Nature of God (Beliefs 2-5)"
    },
    {
      id: 3,
      question: "Under the SDA Fundamental Beliefs, the Creation week was:",
      options: [
        "A standard evolutionary sequence spanning millions of years.",
        "A purely figurative allegory pointing to general spiritual growth.",
        "A literal, historic six-day event crowned by the sanctified seventh-day Sabbath.",
        "An experimental phase overseen by galactic angelic messengers."
      ],
      correctAnswerIndex: 2,
      topic: "Literal Creation and Sabbath origin (Beliefs 6 & 20)"
    },
    {
      id: 4,
      question: "What is the biblical definition of human nature as an indivisible whole?",
      options: [
        "An immortal soul housed inside a physical body that is discarded at death.",
        "A biological body operated by a non-material entity that can travel out-of-body.",
        "An indivisible unity of body, mind, and spirit where life exists only as God maintains the breath of life.",
        "An immortal essence containing fragmented, divine pre-existent memories."
      ],
      correctAnswerIndex: 2,
      topic: "State of the Dead & Human Nature (Beliefs 7 & 26)"
    },
    {
      id: 5,
      question: "In Seventh-day Adventist sanctuary doctrine, the investigative judgment began in:",
      options: [
        "1844 AD, at the culmination of the 2300 prophetic days of Daniel 8:14.",
        "31 AD, at the exact moment of Christ's crucifixion on Calvary.",
        "70 AD, with the destruction of the earthly Jerusalem temple.",
        "It will commence only at the end of the millennium."
      ],
      correctAnswerIndex: 0,
      topic: "The Cleansing of the Sanctuary (Belief 24)"
    }
  ],
  "three-angels": [
    {
      id: 1,
      question: "What is the core message of the first angel flying in the midst of heaven (Revelation 14:6-7)?",
      options: [
        "The physical destruction of Babylon.",
        "The warning against receiving the beast's mark in the forehead.",
        "The declaration of the everlasting gospel, the arrival of the hour of judgment, and a call to worship the Creator.",
        "A direct request to set up wilderness communes."
      ],
      correctAnswerIndex: 2,
      topic: "The First Angel's Message"
    },
    {
      id: 2,
      question: "What is Babylon described as representing in the Second Angel's Message?",
      options: [
        "An ancient physical city currently being excavated in Iraq.",
        "The spiritual apostasy and confusion arising from mixing false doctrines with the pure gospel.",
        "The secular scientific establishment.",
        "The political alliance of Eastern European nations."
      ],
      correctAnswerIndex: 1,
      topic: "The Second Angel's Message (Spiritual Babylon)"
    },
    {
      id: 3,
      question: "According to Revelation 14:12, what has preserved the 'patience of the saints'?",
      options: [
        "Academic standing and political status in the world.",
        "Living in deep wilderness isolation with stored food.",
        "Keeping the ten commandments of God and possessing the active, living faith of Jesus.",
        "A physical marker or chip placed under the shoulder."
      ],
      correctAnswerIndex: 2,
      topic: "End-time Remnant Identifiers"
    },
    {
      id: 4,
      question: "The Third Angel's warning points directly to:",
      options: [
        "Rejecting the false worship systems of Babylon to secure allegiance to God under trial.",
        "The physical starvation coming to cities.",
        "The literal invasion of earthly spaces by extraterrestrials.",
        "The replacement of paper currencies with digital credits."
      ],
      correctAnswerIndex: 0,
      topic: "The Third Angel's Message"
    },
    {
      id: 5,
      question: "The 'everlasting gospel' in the messages indicates that:",
      options: [
        "A brand new way of salvation has been formulated for the final generation.",
        "The same unchangeable plan of redemptive grace is the active foundation of all end-time prophecy.",
        "Only those who speak ancient Greek or Hebrew can fully understand final warnings.",
        "The old covenants have zero relevance for modern Adventism."
      ],
      correctAnswerIndex: 1,
      topic: "The Everlasting Gospel Unity"
    }
  ],
  "sanctuary-doctrine": [
    {
      id: 1,
      question: "Which sanctuary compartment represents daily ministry and reconciliation through blood intercession?",
      options: [
        "The Outer Court altar environment only.",
        "The Holy Place, containing the Table of Shewbread and Golden Altar of Incense.",
        "The Most Holy Place, which houses the Ark of the Covenant.",
        "Only the physical court gates."
      ],
      correctAnswerIndex: 1,
      topic: "Holy Place daily intercession priesthood"
    },
    {
      id: 2,
      question: "How did the Mosaic earthly tabernacle pattern get its blueprint?",
      options: [
        "Israelite artisans designed it using memories of Egyptian temples.",
        "Moses received general oral outlines but drafted the blueprints from local materials.",
        "It was built exactly according to the heavenly blueprint shown to Moses on Mount Sinai.",
        "It was copy-adapted from the desert tabernacles of local Midianite nomads."
      ],
      correctAnswerIndex: 2,
      topic: "Antitypical heavenly temple reality"
    },
    {
      id: 3,
      question: "What occurred at the end of the prophetic '2300 days' of Daniel 8:14?",
      options: [
        "The earthly temple was rebuilt by Antiochus Epiphanes.",
        "Christ shifted His high-priestly ministry from the Holy to the Most Holy Place, beginning the investigative sanctuary cleansing.",
        "The physical earth was prepared to receive the immediate literal Second Advent.",
        "Christianity was declared the state religion of Rome."
      ],
      correctAnswerIndex: 1,
      topic: "Investigative cleansing of the sanctuary"
    },
    {
      id: 4,
      question: "The Day of Atonement ('Yom Kippur') rituals culminate in placing the sins of Israel on:",
      options: [
        "The spotless high priest himself.",
        "The Lord's goat offered on the inner altar.",
        "The scapegoat (Azazel), representing the originator of sin, led away to perish in the wilderness.",
        "The outer pillars of the camp."
      ],
      correctAnswerIndex: 2,
      topic: "Final sin transference & scapegoat type"
    },
    {
      id: 5,
      question: "According to the book of Hebrews, Christ's priesthood:",
      options: [
        "Is a figurative concept with no active heavenly sanctuary duties.",
        "Is modeled after the compromised Levitical order of Aaron.",
        "Is an active Melchizedek order priesthood, transacting real salvation within the heavenly sanctuary.",
        "Began only when the Protestant Reformation commenced in Europe."
      ],
      correctAnswerIndex: 2,
      topic: "Hebrews high priestly order"
    }
  ],
  "sabbath-school": [
    {
      id: 1,
      question: "What is the primary spiritual goal of class study as counselled by Ellen White?",
      options: [
        "Participating in standard social debates and intellectual showing off.",
        "Systematic daily bible diving to write truths on the heart and activate missionary spirit.",
        "Evaluating local political news against church budgets.",
        "Simply reading standard quarterly booklets on Sabbath morning without prior study."
      ],
      correctAnswerIndex: 1,
      topic: "Active Personal Bible Study Habits"
    },
    {
      id: 2,
      question: "The Seventh-day Sabbath is a core covenant memorial of what two divine achievements?",
      options: [
        "The exodus of Hebrew nomads and the construction of Solomon's Temple.",
        "Creation of the physical world and our spiritual redemption in Christ.",
        "The signing of early reform treaties and the establishment of local institutions.",
        "The discovery of the Dead Sea scrolls and the standard calendar reform."
      ],
      correctAnswerIndex: 1,
      topic: "Creation & Redemption Sabbath Seals"
    },
    {
      id: 3,
      question: "When Christ said 'The sabbath was made for man, and not man for the sabbath' (Mark 2:27), He meant:",
      options: [
        "The Sabbath is an optional secular suggestion that can be placed on any day of choice.",
        "The Seventh-day Sabbath is a restorative, blessable gift designed for human well-being, freed from legalistic shackles.",
        "Only the elite Jewish nation is bound to observe seventh-day rest.",
        "The Sabbath was abolished entirely in favor of continuous spiritual meditation."
      ],
      correctAnswerIndex: 1,
      topic: "Christological Sabbath Context"
    },
    {
      id: 4,
      question: "As the 'noble Bereans' of Acts 17:11, we should approach standard teachings by:",
      options: [
        "Blindly accepting pastoral advice without any personal review.",
        "Rejecting all historical consensus to create custom private theological models.",
        "Searching the scriptures daily to verify whether the assertions are backed by a 'Thus saith the Lord.'",
        "Waiting for an audible voice or vision to confirm the text."
      ],
      correctAnswerIndex: 2,
      topic: "The Protestant Berean Verification Principle"
    },
    {
      id: 5,
      question: "The 'Everlasting Covenant' is founded on:",
      options: [
        "Human promises to achieve flawless legal performance.",
        "God's sovereign promise to write His law in our hearts and forgive our iniquities through Christ's sacrifice.",
        "Strict national boundary codes and dietary legal enforcement.",
        "The mechanical repetition of temple prayers."
      ],
      correctAnswerIndex: 1,
      topic: "Eternal Covenant Promise"
    }
  ],
  "book-by-book": [
    {
      id: 1,
      question: "According to Hebrews Chapter 1 and 2, Christ's authority is:",
      options: [
        "Equivalent to the highest ranks of created angels.",
        "A provisional human office that ended at the cross.",
        "Infinite, superior to angels, inheriting a co-eternal name as the exact imprint of the Father's substance.",
        "A purely symbolic metaphor added by later copyists."
      ],
      correctAnswerIndex: 2,
      topic: "Christology of Hebrews"
    },
    {
      id: 2,
      question: "Ephesians Chapter 2 declares that salvation is:",
      options: [
        "Earned step-by-step through our ritual adherence and church membership details.",
        "A cooperative blend of human moral excellence and divine backup help.",
        "Received entirely by grace through faith, as a gift from God, so that no man can boast.",
        "Only guaranteed to those who have memorized the entire law of Moses."
      ],
      correctAnswerIndex: 2,
      topic: "Ephesians Theology of Grace"
    },
    {
      id: 3,
      question: "According to Hebrews 11:1, biological or historical 'evidence' is:",
      options: [
        "Completely opposed to spiritual faith, which exists in a vacuum.",
        "Complemented by faith, which is 'the substance of things hoped for, the evidence of things not seen.'",
        "The absolute only source of truth; any unseen thing must be rejected.",
        "Irrelevant for a real Bible student."
      ],
      correctAnswerIndex: 1,
      topic: "Biblical Definition of Faith (Hebrews 11)"
    },
    {
      id: 4,
      question: "In Romans 12:1, taking our 'bodies as a living sacrifice' implies:",
      options: [
        "Physical self-harming standard ascetic practices.",
        "Surrendering our physical organs, health habits, and mental capacity clean and holy is our logical act of worship.",
        "Only our inner spirit counts; physical lifestyle choices do not impact saving faith.",
        "Offering up animal substitutes in local communities."
      ],
      correctAnswerIndex: 1,
      topic: "Body Stewardship & Lifestyle Integration (Romans 12)"
    },
    {
      id: 5,
      question: "The overarching goal of Epistle study is:",
      options: [
        "To write arguments to win debates against members of other churches.",
        "To capture the living, functional character of Christ built into standard social relations.",
        "To compile historical data about travel routes in first-century Greece.",
        "To formulate complex, abstract philosophical arguments that cannot be verbalized."
      ],
      correctAnswerIndex: 1,
      topic: "Pragmatic Epistle Applied Theology"
    }
  ],
  "priority-doctrines": [
    {
      id: 1,
      question: "The seventh-day Sabbath serves primarily as:",
      options: [
        "A Jewish legislative holiday obsolete since Calvary.",
        "A permanent, unchangeable sign of creative authority, sanctification, and eternal love.",
        "An optional calendar day that can be switched to Sunday for convenience.",
        "A symbolic rest to be observed only inside our hearts without stopping daily labor."
      ],
      correctAnswerIndex: 1,
      topic: "The Sabbath Covenant Seal"
    },
    {
      id: 2,
      question: "A cornerstone SDA priority doctrine is 'soul sleep' in the state of the dead. It maintains that:",
      options: [
        "The disembodied soul flies instantly to heaven or the fires of hell at death.",
        "Death is an unconscious, silent sleep, awaiting the call of Christ on the resurrection morning.",
        "The dead can return as spirit guides to comfort living family members.",
        "Human lives disintegrate into absolute nothingness, with no future resurrection possibilities."
      ],
      correctAnswerIndex: 1,
      topic: "The State of the Dead (Biblical Sleep)"
    },
    {
      id: 3,
      question: "How does SDA priority theology define the 'Spirit of Prophecy'?",
      options: [
        "The unique political predictions made by historical reformers.",
        "The testimony of Jesus made active through prophetic guidance, seen in the life and writings of Ellen White.",
        "The capacity of every Christian to predict financial markets correctly.",
        "The early Roman creeds created by church councils."
      ],
      correctAnswerIndex: 1,
      topic: "The Gift of Prophecy (SDA Pillar)"
    },
    {
      id: 4,
      question: "In Ecclesiastes 12:13, Solomon declares that the 'whole duty of man' is to:",
      options: [
        "Obtain high credentials and argue points of law.",
        "Fear God and keep His commandments.",
        "Seek worldly material comfort while keeping a quiet nominal church membership.",
        "Formulate individual private standards of morality."
      ],
      correctAnswerIndex: 1,
      topic: "God's Law & Human Duty standard"
    },
    {
      id: 5,
      question: "How will Christ's glorious Second Advent be experiences according to scripture?",
      options: [
        "As a quiet mystical event within human brainwaves.",
        "Literally, audibly with a loud trumpet, and visually seen by all eyes simultaneously.",
        "Directly in a secret desert compound in the Middle East.",
        "Through standard social justice and reform laws globally."
      ],
      correctAnswerIndex: 1,
      topic: "The Second Advent Reality"
    }
  ]
};

export const PreTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { setSelectedTrackId, trackStatsAllowed } = useApp();

  const trackId = id || "fundamental-beliefs";
  const questions = TRACK_QUIZZES[trackId] || TRACK_QUIZZES["fundamental-beliefs"];

  // State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleClearSelections = () => {
    setSelectedAnswers({});
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert("Please answer all questions before submitting. Every response helps build an accurate profile.");
      return;
    }
    setIsSubmitted(true);
  };

  // Gap analysis computation
  const getResults = () => {
    const strongAreas: string[] = [];
    const focusAreas: string[] = [];
    let correctCount = 0;

    questions.forEach((q) => {
      const selectedIdx = selectedAnswers[q.id];
      const isCorrect = selectedIdx === q.correctAnswerIndex;
      if (isCorrect) {
        correctCount++;
        strongAreas.push(q.topic);
      } else {
        focusAreas.push(q.topic);
      }
    });

    // Provide a customized initial lesson recommendation based on score
    // 0-2 correct: Start with Lesson 1 or 2
    // 3-4 correct: Skip ahead to lesson 3 or 4
    // 5 correct: Recommend Lesson 5 or highly focused study
    let startingPointLessonIndex = 1;
    let startingPointName = "Study 1: The Word of God";

    if (trackId === "fundamental-beliefs") {
      if (correctCount >= 4) {
        startingPointLessonIndex = 5;
        startingPointName = "Study 5: God the Holy Spirit";
      } else if (correctCount >= 2) {
        startingPointLessonIndex = 3;
        startingPointName = "Study 3: The Sanctuary and Father's Sovereign Character";
      } else {
        startingPointLessonIndex = 1;
        startingPointName = "Study 1: The Word of God";
      }
    } else if (trackId === "three-angels") {
      if (correctCount >= 4) {
        startingPointLessonIndex = 4;
        startingPointName = "Study 4: Worship Him Who Made Heaven";
      } else if (correctCount >= 2) {
        startingPointLessonIndex = 2;
        startingPointName = "Study 2: Fear God and Give Glory";
      } else {
        startingPointLessonIndex = 1;
        startingPointName = "Study 1: The Everlasting Gospel";
      }
    } else if (trackId === "sanctuary-doctrine") {
      if (correctCount >= 4) {
        startingPointLessonIndex = 5;
        startingPointName = "Study 5: The Investigative Cleansing Cleansed";
      } else if (correctCount >= 2) {
        startingPointLessonIndex = 3;
        startingPointName = "Study 3: The Holy Place Sanctuary Service";
      } else {
        startingPointLessonIndex = 1;
        startingPointName = "Study 1: The Earthly Shadow Pattern";
      }
    } else {
      // General fallbacks
      startingPointLessonIndex = 1;
      startingPointName = "Study 1: Primary Foundational Proofs";
    }

    return {
      correctCount,
      totalCount: questions.length,
      strongAreas,
      focusAreas,
      startingPointName,
      startingPointLessonIndex
    };
  };

  const results = getResults();

  const handleLaunchStudy = () => {
    // Set this track active in AppContext
    setSelectedTrackId(trackId);

    // Update track progress in localStorage to start at zero or lessons
    if (trackStatsAllowed) {
      const savedProgress = localStorage.getItem("stba_tracks_progress");
      let progressMap: Record<string, number> = {};
      if (savedProgress) {
        try {
          progressMap = JSON.parse(savedProgress);
        } catch (e) {}
      }
      // We register they have completed 0 studies, starting fresh with their recommendation
      progressMap[trackId] = 0;
      localStorage.setItem("stba_tracks_progress", JSON.stringify(progressMap));
    } else {
      console.warn("STBA Secure Guard: Stats logging bypass under unverified context.");
    }

    // Navigating with state recommendation
    navigate("/stba", {
      state: {
        presetId: trackId,
        recommendedLessonIndex: results.startingPointLessonIndex
      }
    });
  };

  const trackTitles: Record<string, string> = {
    "fundamental-beliefs": "28 Fundamental Beliefs",
    "three-angels": "Three Angels' Messages",
    "sanctuary-doctrine": "Sanctuary Doctrine",
    "sabbath-school": "Sabbath School Quarterly",
    "book-by-book": "Book-by-Book Memory Goals",
    "priority-doctrines": "Priority SDA Doctrines"
  };

  const currentTrackTitle = trackTitles[trackId] || "Selected Track";

  return (
    <div className="w-full text-left" id="pretest-viewport">
      
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(`/tracks/${trackId}/preview`)}
        className="inline-flex items-center space-x-2 text-[#6B6B6B] hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-all mb-6 cursor-pointer"
        id="pretest-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Track Study</span>
      </button>

      {/* HEADER SECTION */}
      <div className="mb-8" id="pretest-header">
        <span className="text-xs font-mono uppercase tracking-[0.15em] text-[#C9973A] font-bold block mb-1">
          Prerequisite Assessment
        </span>
        <h1 className="font-serif text-2xl md:text-3.5xl text-[#1C2333] font-bold tracking-tight">
          Track Pre-Test: {currentTrackTitle}
        </h1>
        <p className="text-[#6B6B6B] font-sans text-sm mt-1.5">
          Establish an accurate conceptual baseline of your current structural understanding before starting active recall.
        </p>
      </div>

      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pretest-form-layout">
          {/* QUESTIONS LIST */}
          <div className="lg:col-span-2 space-y-6" id="questions-box">
            {questions.map((q, qIndex) => {
              const selectedOption = selectedAnswers[q.id];
              const isOpen = openQuestionId === q.id;
              const hasAnswered = selectedOption !== undefined;
              
              return (
                <div
                  key={q.id}
                  className={`bg-white border rounded-[12px] shadow-2xs text-left overflow-hidden transition-all duration-200 ${
                    isOpen 
                      ? "border-teal-600 ring-1 ring-teal-600/20" 
                      : "border-[#E8E4DA] hover:border-stone-400"
                  }`}
                  id={`question-card-${q.id}`}
                >
                  {/* ACCORDION HEADER - Clicking expands/closes */}
                  <button
                    type="button"
                    onClick={() => setOpenQuestionId(isOpen ? null : q.id)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer transition-colors hover:bg-stone-50/50 bg-[#FAF9F5]/40"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className={`text-xs font-mono font-bold leading-none px-2.5 py-1.5 rounded border shrink-0 ${
                        hasAnswered 
                          ? "bg-teal-50 border-teal-200 text-teal-700" 
                          : "bg-[#FAF7F0] border-[#E8DDC6] text-[#C9973A]"
                      }`}>
                        Q{qIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif font-bold text-base text-[#1C2333] leading-snug">
                          {q.question}
                        </h3>
                        {hasAnswered && !isOpen && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-teal-700 font-sans font-medium">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                            <span className="truncate">Selected: {q.options[selectedOption]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 shrink-0 flex items-center gap-2">
                      {hasAnswered && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200/55 hidden sm:inline-block">
                          Answered
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-stone-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  </button>

                  {/* ACCORDION CONTENT */}
                  {isOpen && (
                    <div className="p-5 md:p-6 pt-0 border-t border-stone-100 bg-[#FDFAF5]/25 space-y-4">
                      <div className="space-y-2.5 pl-0 sm:pl-10 mt-4">
                        {q.options.map((option, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full p-3.5 rounded-[8px] text-xs sm:text-sm font-sans text-left transition-all duration-200 border flex items-start gap-3 cursor-pointer ${
                                isSelected
                                  ? "bg-[#1C2333]/5 border-[#1A1A1A] text-[#1A1A1A] font-semibold"
                                  : "bg-white hover:bg-[#FDFAF5]/80 border-[#E8E4DA] text-[#6B6B6B] hover:text-[#1A1A1A]"
                              }`}
                              id={`question-${q.id}-option-${optIdx}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                  isSelected
                                    ? "border-[#C9973A] bg-[#C9973A]"
                                    : "border-stone-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ACTION FOOTER */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleClearSelections}
                className="px-5 py-3 border border-[#E8E4DA] text-[#6B6B6B] hover:text-[#1A1A1A] text-xs font-sans font-bold uppercase tracking-wider rounded-[8px] hover:bg-[#FDFAF5]/40 transition-all cursor-pointer"
              >
                Clear Selections
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-[#1C2333] hover:bg-[#253046] text-[#C9973A] text-xs font-sans font-bold uppercase tracking-wider rounded-[8px] transition-all shadow-md cursor-pointer"
                id="submit-pretest-btn"
              >
                Submit Pre-Test Answers
              </button>
            </div>
          </div>

          {/* INSTRUCTION CARD FOR PREREQ */}
          <div className="space-y-6" id="instructions-sidebar">
            <div className="bg-[#FDFAF5] border border-[#E8E4DA] p-5 rounded-[12px] shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-[#C9973A]">
                <Info className="w-5 h-5 shrink-0" />
                <h3 className="font-serif font-bold text-sm text-[#1C2333]">
                  Diagnostic Directive
                </h3>
              </div>
              <p className="font-sans text-xs sm:text-[13px] text-[#6B6B6B] leading-relaxed">
                "Answer honestly — don't guess. This isn't graded. It tells us what to focus on."
              </p>
              <div className="border-t border-[#E8E4DA] pt-3.5 space-y-3 font-sans text-xs text-[#6B6B6B] leading-relaxed">
                <p>
                  Our active schema maps cognitive gaps dynamically. If you don't know an answer, select your best estimate without external aids.
                </p>
                <p>
                  Upon submission, you will receive a diagnostic gap analysis isolating strong theological foundations from active study opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RESULTS SHEET FOR GAP ANALYSIS */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-[#E8E4DA] p-6 md:p-8 rounded-[12px] shadow-md space-y-8"
          id="pretest-results-box"
        >
          {/* HEADER SUMMARY PILL */}
          <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E8E4DA]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#2A9D8F] justify-center md:justify-start">
                <BookOpenCheck className="w-6 h-6" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Baseline Profile Complete
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1C2333] tracking-tight">
                Your Theological Diagnostic Report
              </h2>
            </div>

            {/* Score circle */}
            <div className="flex items-center justify-center gap-3.5 shrink-0">
              <div className="text-right">
                <span className="text-xs text-[#6B6B6B] font-mono block uppercase">
                  Assessment Score
                </span>
                <span className="text-xs font-sans text-[#6B6B6B]">
                  {results.correctCount === results.totalCount
                    ? "Exceptional conceptual footing!"
                    : "Excellent starting context."}
                </span>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#E8E4DA] flex flex-col items-center justify-center">
                <span className="text-xl font-serif font-bold text-[#1C2333]">
                  {results.correctCount}
                </span>
                <span className="text-[10px] text-[#6B6B6B] font-mono leading-none border-t border-[#E8DDC6] w-8 text-center mt-0.5 pt-0.5">
                  {results.totalCount}
                </span>
              </div>
            </div>
          </div>

          {/* GAP ANALYSIS STAGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* STRONG AREAS */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-mono font-bold text-[#2A9D8F] uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strong Areas (Pristine Schema)</span>
              </h3>
              
              {results.strongAreas.length > 0 ? (
                <div className="bg-[#2A9D8F]/5 border border-[#2A9D8F]/15 p-4 rounded-[8px] space-y-2.5">
                  {results.strongAreas.map((topic, index) => (
                    <div key={index} className="flex items-start gap-2.5 font-sans text-xs sm:text-sm text-[#1C2333]">
                      <span className="text-[#2A9D8F] font-bold mt-0.5">✓</span>
                      <span>{topic}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#6B6B6B] pt-2 border-t border-[#2A9D8F]/10 leading-relaxed font-sans">
                    These active memory anchors are fully mapped. We will bypass heavy repeating intervals on these to preserve maximum mental energy.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-[8px] bg-stone-50 border border-stone-200 text-stone-500 font-sans text-xs">
                  No areas exceeded mastery threshold. All topics will benefit deeply from active recall scheduling.
                </div>
              )}
            </div>

            {/* FOCUS AREAS */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-mono font-bold text-[#C9973A] uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Focus Areas (Study Opportunities)</span>
              </h3>
              
              {results.focusAreas.length > 0 ? (
                <div className="bg-[#C9973A]/5 border border-[#C9973A]/15 p-4 rounded-[8px] space-y-2.5">
                  {results.focusAreas.map((topic, index) => (
                    <div key={index} className="flex items-start gap-2.5 font-sans text-xs sm:text-sm text-[#1C2333]">
                      <span className="text-[#C9973A] font-bold mt-0.5">•</span>
                      <span>{topic}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#6B6B6B] pt-2 border-t border-[#C9973A]/10 leading-relaxed font-sans">
                    These concepts are currently affected by the fluency illusion. Spacing recall cards with early focus blocks will solidify these anchors.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-[8px] bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 font-sans text-xs">
                  Flawless baseline diagnostic! Bypassing normal introductory stages.
                </div>
              )}
            </div>
          </div>

          {/* STARTING POINT RECOMMENDATION BOX */}
          <div className="p-5 bg-[#FAF7F0] border border-[#E8DDC6] rounded-[8px] text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#C9973A] font-bold bg-[#C9973A]/10 px-2.5 py-0.5 rounded">
                Personalized Recommendation
              </span>
              <h4 className="font-serif font-bold text-base text-[#1C2333]">
                Starting Point: {results.startingPointName}
              </h4>
              <p className="text-[#6B6B6B] font-sans text-xs sm:text-[13px] leading-relaxed max-w-[680px]">
                Based on your pre-assessment profile, we suggest entering the syllabus chain at this specific junction to solidify your doctrinal sequence efficiently.
              </p>
            </div>

            <button
              onClick={handleLaunchStudy}
              className="py-3 px-5 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              id="results-launch-btn"
            >
              <span>Begin Study Session</span>
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PreTest;
