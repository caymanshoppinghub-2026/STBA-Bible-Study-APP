/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  BookOpen,
  Send,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  Feather,
  Flame,
  AlertCircle
} from "lucide-react";
import { RecallQueueItem } from "../../utils/recallScheduler";
import { playCorrectAnswerSound, playHooraySound } from "../../utils/audioFeedback";
import { useApp } from "../../context/AppContext";

interface MiniQuizComponentProps {
  verse: RecallQueueItem;
  sabbathMode?: boolean;
  activeStep?: 1 | 2 | 3;
  onStepChange?: (step: 1 | 2 | 3) => void;
  onComplete: (score: number, answers: Record<string, any>, reflection: string) => void;
  onOpenFullRecall: () => void;
}

export interface ContextQuestionData {
  question: string;
  options: Array<{ text: string; isCorrect: boolean; explanation: string }>;
}

export interface ReflectionAnchorData {
  prompt: string;
  quickAnchors: string[];
}

/**
 * Returns 3 rich exegesis context questions and reflection data for any memory verse
 */
export function getVerseQuizData(verse: RecallQueueItem): {
  contextQuestions: ContextQuestionData[];
  reflectionQ: ReflectionAnchorData;
} {
  const ref = verse.reference.toLowerCase();

  // 1. 2 Timothy 3:16-17
  if (ref.includes("2 timothy 3") || ref.includes("timothy 3")) {
    return {
      contextQuestions: [
        {
          question: "What is the primary biblical foundation and claim of 2 Timothy 3:16?",
          options: [
            {
              text: "All Scripture is God-breathed (Theopneustos), possessing divine authority for doctrine, reproof, correction, and training in righteousness.",
              isCorrect: true,
              explanation: "Sola Scriptura: God breathed His Word, establishing it as the supreme and trustworthy standard of truth."
            },
            {
              text: "Only the New Testament gospel epistles were inspired by God; Old Testament books were mere cultural records.",
              isCorrect: false,
              explanation: "Paul affirmed that 'ALL scripture' is given by inspiration of God, encompassing the entire prophetic canon."
            },
            {
              text: "Scripture is subordinate to human philosophical speculation and ecclesiastical oral tradition.",
              isCorrect: false,
              explanation: "Scripture is the supreme divine standard that judges all human traditions, not vice versa."
            }
          ]
        },
        {
          question: "According to verse 17, what is the ultimate spiritual purpose of Scripture's inspiration?",
          options: [
            {
              text: "That the person of God may be complete, thoroughly equipped for every good work.",
              isCorrect: true,
              explanation: "God's Word is intensely practical—it equips believers fully for Christlike character and active ministry."
            },
            {
              text: "To provide hidden mystic codes accessible only to an elite priesthood.",
              isCorrect: false,
              explanation: "The Bible was given clearly so that every sincere believer can read, understand, and apply truth."
            },
            {
              text: "To exempt believers from personal study once church doctrine has been published.",
              isCorrect: false,
              explanation: "God calls every Christian to study diligently to be approved unto God (2 Timothy 2:15)."
            }
          ]
        },
        {
          question: "How does 2 Timothy 3:16 relate to the historic Adventist hermeneutic?",
          options: [
            {
              text: "It establishes the principle that Scripture interprets Scripture, uniting prophetic harmony across both Testaments.",
              isCorrect: true,
              explanation: "Because the same Holy Spirit inspired all biblical authors, the Bible forms one harmonious divine revelation."
            },
            {
              text: "It suggests Bible teachings should be revised to conform to secular popular opinion.",
              isCorrect: false,
              explanation: "Adventist belief holds that God's eternal Word remains immutable despite cultural shifts."
            },
            {
              text: "It restricts doctrinal understanding exclusively to Old Covenant ceremonial rituals.",
              isCorrect: false,
              explanation: "Scripture reveals God's eternal moral law and the everlasting gospel of Jesus Christ."
            }
          ]
        }
      ],
      reflectionQ: {
        prompt: "How does the divine inspiration of God's Word ground your personal discipleship today?",
        quickAnchors: [
          "Anchors my faith in timeless divine truth over shifting cultural opinions",
          "Renews my daily devotion for character growth and doctrinal clarity",
          "Equips me with love and patience to share Scripture with seeking hearts"
        ]
      }
    };
  }

  // 2. Revelation 14:12
  if (ref.includes("revelation 14") || ref.includes("rev 14")) {
    return {
      contextQuestions: [
        {
          question: "What is the historical and prophetic setting of Revelation 14:12?",
          options: [
            {
              text: "The climactic seal of the Three Angels' Messages, identifying God's end-time remnant amidst the final crisis.",
              isCorrect: true,
              explanation: "Revelation 14:12 presents the decisive character profile of God's faithful people before the Second Coming."
            },
            {
              text: "A ceremonial description of ancient Levitical feast days during King Solomon's temple dedication.",
              isCorrect: false,
              explanation: "Revelation 14 is an end-time apocalyptic prophecy warning all nations of the final judgment and gospel."
            },
            {
              text: "A prophecy predicting that the Ten Commandments would be discarded in the last days.",
              isCorrect: false,
              explanation: "The passage affirms those who 'keep the commandments of God' through the faith of Jesus."
            }
          ]
        },
        {
          question: "What does 'the patience of the saints' signify in Revelation 14:12?",
          options: [
            {
              text: "Patient endurance (hupomone) and steadfast fidelity to God while facing global deception and persecution.",
              isCorrect: true,
              explanation: "Hupomone represents victorious, persevering loyalty to God under severe spiritual trial."
            },
            {
              text: "Passive inaction while ignoring the urgent call to preach the everlasting gospel.",
              isCorrect: false,
              explanation: "True biblical patience is active, holy perseverance in witness and obedience."
            },
            {
              text: "Waiting for earthly political treaties to guarantee religious freedom.",
              isCorrect: false,
              explanation: "The saints look beyond earthly systems to Jesus Christ, their High Priest and King."
            }
          ]
        },
        {
          question: "How are 'the commandments of God' and 'the faith of Jesus' connected in Adventist theology?",
          options: [
            {
              text: "Obedience to God's moral law (including the Seventh-day Sabbath) is the natural fruit of trusting Jesus as Savior and Lord.",
              isCorrect: true,
              explanation: "Faith does not abolish the law; true faith in Christ establishes the law in our hearts (Romans 3:31)."
            },
            {
              text: "Commandment keeping is a legalistic checklist that replaces the need for Christ's grace.",
              isCorrect: false,
              explanation: "Scripture teaches we are saved purely by grace through faith, which produces loving obedience."
            },
            {
              text: "The faith of Jesus eliminates the Ten Commandments for New Testament believers.",
              isCorrect: false,
              explanation: "Jesus affirmed: 'If ye love me, keep my commandments' (John 14:15)."
            }
          ]
        }
      ],
      reflectionQ: {
        prompt: "How does living 'the faith of Jesus' empower your obedience and courage during spiritual battles?",
        quickAnchors: [
          "Gives victorious faith to uphold God's commandments through Christ's strength",
          "Fosters unwavering patience and gentleness when facing worldly pressure",
          "Ignites compassionate zeal to proclaim the Three Angels' warning of love"
        ]
      }
    };
  }

  // 3. Daniel 8:14
  if (ref.includes("daniel 8:14") || ref.includes("dan 8")) {
    return {
      contextQuestions: [
        {
          question: "What prophetic milestone is designated by the 2,300 prophetic days in Daniel 8:14?",
          options: [
            {
              text: "The cleansing of the heavenly sanctuary and the beginning of the pre-advent Investigative Judgment in 1844.",
              isCorrect: true,
              explanation: "Applying the biblical day-year principle (Num 14:34, Ezek 4:6), 2,300 prophetic years extend from 457 BC to 1844 AD."
            },
            {
              text: "A localized six-year skirmish between Antiochus Epiphanes and the Maccabean priests.",
              isCorrect: false,
              explanation: "Historicist SDA exegesis demonstrates that the 2,300 days culminate in the heavenly sanctuary's cosmic antitypical Day of Atonement."
            },
            {
              text: "A promise that the earthly Jerusalem temple would never be overthrown by imperial Rome.",
              isCorrect: false,
              explanation: "The earthly temple fell in 70 AD; Daniel 8:14 points to Christ's ministry in the true heavenly tabernacle (Heb 8:1-2)."
            }
          ]
        },
        {
          question: "What is the sanctuary that is 'cleansed' according to the Epistle to the Hebrews?",
          options: [
            {
              text: "The heavenly sanctuary where Jesus Christ ministers as our High Priest with His own blood (Hebrews 9:23-24).",
              isCorrect: true,
              explanation: "Christ entered the Most Holy Place to cleanse the heavenly sanctuary and vindicate God's righteous character."
            },
            {
              text: "A rebuilt third physical temple in modern earthly Jerusalem.",
              isCorrect: false,
              explanation: "The New Testament locates the true tabernacle in heaven, pitched by the Lord and not by man."
            },
            {
              text: "The secular political capitals of the Western empires.",
              isCorrect: false,
              explanation: "The sanctuary is the dwelling place of God's holy presence and judicial throne."
            }
          ]
        },
        {
          question: "What practical hope does the Investigative Judgment bring to the believer?",
          options: [
            {
              text: "Assurance that Christ our Advocate vindicates all who have committed their lives to Him and trusted His righteousness.",
              isCorrect: true,
              explanation: "The judgment is 'in favor of the saints of the Most High' (Daniel 7:22), guaranteeing eternal redemption in Christ."
            },
            {
              text: "Fear that God is searching for reasons to condemn sincere believers.",
              isCorrect: false,
              explanation: "There is therefore now no condemnation to them which are in Christ Jesus (Romans 8:1)."
            },
            {
              text: "An excuse to delay repentance until the Second Coming occurs.",
              isCorrect: false,
              explanation: "Today is the day of salvation; we are invited to daily surrender to Christ's sanctifying grace."
            }
          ]
        }
      ],
      reflectionQ: {
        prompt: "How does Christ's high-priestly advocacy in heaven inspire peace and daily surrender in your heart?",
        quickAnchors: [
          "Assures me of Christ's all-sufficient righteous advocacy before the Father",
          "Inspires solemn heart-cleansing and daily surrender to the Holy Spirit",
          "Strengthens my confidence that God's loving justice will soon triumph"
        ]
      }
    };
  }

  // 4. Exodus 20:8-11
  if (ref.includes("exodus 20") || ref.includes("sabbath") || ref.includes("ex 20")) {
    return {
      contextQuestions: [
        {
          question: "Why is the Fourth Commandment (Exodus 20:8-11) unique within the Ten Commandments?",
          options: [
            {
              text: "It serves as God's royal seal, containing His name (Lord God), title (Creator), and jurisdiction (Heaven, Earth, and Sea).",
              isCorrect: true,
              explanation: "The Sabbath command explicitly grounds God's authority in His work as the Creator of the universe."
            },
            {
              text: "It was a temporary ceremonial statute invented exclusively for the Hebrew nation at Mount Sinai.",
              isCorrect: false,
              explanation: "The Sabbath was instituted at the close of Creation week (Genesis 2:1-3) for all humanity before sin."
            },
            {
              text: "It forbade all acts of mercy, charity, and medical care on the holy day.",
              isCorrect: false,
              explanation: "Jesus revealed that 'it is lawful to do well on the sabbath days' (Matthew 12:12)."
            }
          ]
        },
        {
          question: "How does the Sabbath connect Creation to Redemption in Scripture?",
          options: [
            {
              text: "It stands as a memorial of God's finished Creation (Gen 2:2) and a sign of Christ's sanctifying deliverance (Ezek 20:12, Deut 5:15).",
              isCorrect: true,
              explanation: "The Sabbath celebrates both God's creative genius and His power to recreate clean hearts in believers."
            },
            {
              text: "It suggests humans can earn salvation through rigorous physical resting.",
              isCorrect: false,
              explanation: "Sabbath rest is entering into Christ's finished work, ceasing from self-righteous striving (Hebrews 4:10)."
            },
            {
              text: "It replaces spiritual worship with empty traditional rituals.",
              isCorrect: false,
              explanation: "The Sabbath is a delight, holy of the Lord and honorable, designed for deep spiritual communion (Isaiah 58:13)."
            }
          ]
        },
        {
          question: "What is the end-time significance of Sabbath worship in Revelation 14:7?",
          options: [
            {
              text: "The First Angel quotes the Fourth Commandment, calling all humanity to 'worship Him that made heaven, and earth, and the sea.'",
              isCorrect: true,
              explanation: "The Sabbath is the central issue in the final controversy regarding whom we worship as Creator and Lord."
            },
            {
              text: "Revelation indicates that the day of worship would change to the first day of the week.",
              isCorrect: false,
              explanation: "Scripture contains no command changing the holy seventh-day Sabbath."
            },
            {
              text: "It suggests worship timing has no relevance to Christian loyalty.",
              isCorrect: false,
              explanation: "God specifically commanded: 'Remember the sabbath day, to keep it holy.'"
            }
          ]
        }
      ],
      reflectionQ: {
        prompt: "How does keeping the Seventh-day Sabbath deepen your spiritual rest and delight in Jesus?",
        quickAnchors: [
          "Provides sacred rest from secular worry, refocusing my mind on the Creator",
          "Enriches family fellowship, church communion, and compassionate outreach",
          "Serves as a weekly celebration of Christ's sanctifying grace in my life"
        ]
      }
    };
  }

  // 5. Generic / Dynamic 3-Question Generator for Any Bible Passage
  const words = verse.text.replace(/[,.;:?!"'()]/g, "").split(/\s+/).filter((w) => w.length > 4);
  const keyword1 = verse.keywords?.[0] || words[0] || "truth";
  const keyword2 = verse.keywords?.[1] || words[1] || "covenant";

  return {
    contextQuestions: [
      {
        question: `What is the central theological truth proclaimed in ${verse.reference}?`,
        options: [
          {
            text: verse.theologicalContext || `Divine revelation in ${verse.reference} calling believers to unreserved faith, obedience, and spiritual holiness.`,
            isCorrect: true,
            explanation: "All Scripture is God-breathed, providing divine instruction for character transformation and righteous living."
          },
          {
            text: "A historical narrative without ongoing moral or doctrinal authority for modern Christian life.",
            isCorrect: false,
            explanation: "Scripture's principles are eternal, written for our admonition and spiritual guidance."
          },
          {
            text: "A philosophical allegory that contradicts the rest of the biblical canon.",
            isCorrect: false,
            explanation: "Scripture interprets Scripture with divine harmony and perfect consistency."
          }
        ]
      },
      {
        question: `How does the key emphasis on "${keyword1}" in ${verse.reference} support Christian discipleship?`,
        options: [
          {
            text: `It reveals God's righteous character and provides divine power for overcoming temptation through Christ.`,
            isCorrect: true,
            explanation: "God gives His Word so that the believer may be thoroughly equipped for every good work."
          },
          {
            text: "It encourages believers to rely on self-effort rather than the Holy Spirit's transforming grace.",
            isCorrect: false,
            explanation: "Discipleship is an inward work of the Holy Spirit writing God's law on our hearts."
          },
          {
            text: "It limits salvation exclusively to intellectual knowledge without heart obedience.",
            isCorrect: false,
            explanation: "True faith works by love and purifies the soul."
          }
        ]
      },
      {
        question: `In what way does ${verse.reference} connect with the broader theme of the Great Controversy?`,
        options: [
          {
            text: "It vindicates God's justice, mercy, and truth against the deceptions and accusations of the enemy.",
            isCorrect: true,
            explanation: "Every passage of Scripture contributes to revealing God's glorious love and victory in Christ."
          },
          {
            text: "It suggests evil and righteousness are equal forces with no final divine judgment.",
            isCorrect: false,
            explanation: "Scripture assures us that God's kingdom and righteousness will ultimately triumph forever."
          },
          {
            text: "It instructs believers to remain neutral between truth and error.",
            isCorrect: false,
            explanation: "God calls us to stand firmly for truth as the needle to the pole."
          }
        ]
      }
    ],
    reflectionQ: {
      prompt: `How does the truth of ${verse.reference} inspire your walk with God and your witness to others today?`,
      quickAnchors: [
        "Strengthens my daily prayer life and heartfelt surrender to Jesus",
        "Inspires me to share biblical truth with kindness and conviction",
        "Deepens my trust in God's promises during seasons of uncertainty"
      ]
    }
  };
}

/**
 * Helper to split text into tokens (words and punctuation) for the cloze challenge
 */
interface VerseToken {
  id: number;
  originalText: string;
  cleanWord: string;
  isKeyWord: boolean;
  isBlank: boolean;
  userAnswer: string | null;
  isCorrect: boolean | null;
}

const COMMON_STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "as", "if", "that", "this", "these", "those", "it", "its",
  "so", "no", "not", "my", "your", "his", "her", "our", "their", "unto", "ye", "thee", "thou", "thy"
]);

function scrambleQuizQuestions(raw: {
  contextQuestions: ContextQuestionData[];
  reflectionQ: ReflectionAnchorData;
}): {
  contextQuestions: ContextQuestionData[];
  reflectionQ: ReflectionAnchorData;
} {
  // Choose a random permutation of target correct-option positions (0 = A, 1 = B, 2 = C)
  // so the correct answer moves unpredictably across A, B, and C and never stays on the same letter
  const positionPermutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0]
  ];
  const targetPositions =
    positionPermutations[Math.floor(Math.random() * positionPermutations.length)];

  const scrambledQuestions = raw.contextQuestions.map((q, qIdx) => {
    const correctOpt = q.options.find((o) => o.isCorrect);
    const wrongOpts = q.options
      .filter((o) => !o.isCorrect)
      .sort(() => Math.random() - 0.5);

    if (!correctOpt || q.options.length !== 3) {
      return {
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
      };
    }

    const targetPos = targetPositions[qIdx % 3];
    const arranged: typeof q.options = [];
    let wrongIdx = 0;
    for (let i = 0; i < 3; i++) {
      if (i === targetPos) {
        arranged.push(correctOpt);
      } else {
        arranged.push(wrongOpts[wrongIdx++]);
      }
    }

    return {
      ...q,
      options: arranged
    };
  });

  return {
    ...raw,
    contextQuestions: scrambledQuestions
  };
}

export const MiniQuizComponent: React.FC<MiniQuizComponentProps> = ({
  verse,
  sabbathMode = false,
  activeStep: propActiveStep,
  onStepChange,
  onComplete,
  onOpenFullRecall
}) => {
  const { showConfetti } = useApp();
  const quizData = useMemo(() => scrambleQuizQuestions(getVerseQuizData(verse)), [verse]);

  // Steps: 1 = Passage Context (3 Questions), 2 = Key Phrases (Cloze Recall), 3 = Personal Anchor
  const [internalStep, setInternalStep] = useState<1 | 2 | 3>(propActiveStep || 1);
  const activeStep = propActiveStep !== undefined ? propActiveStep : internalStep;

  const changeStep = (step: 1 | 2 | 3) => {
    setInternalStep(step);
    onStepChange?.(step);
  };

  // -------------------------------------------------------------
  // STEP 1 STATE: 3 CONTEXT QUESTIONS
  // -------------------------------------------------------------
  const [contextQIndex, setContextQIndex] = useState<number>(0); // 0, 1, 2
  const [contextAnswers, setContextAnswers] = useState<Array<{ selectedIdx: number; isCorrect: boolean } | null>>([
    null,
    null,
    null
  ]);

  const [wrongOptionIndices, setWrongOptionIndices] = useState<Record<number, number[]>>({});

  const handleSelectContextOption = (optionIdx: number) => {
    // If already answered correctly for this question, ignore duplicate clicks while auto-advancing
    if (contextAnswers[contextQIndex]?.isCorrect) return;

    const isCorrect = quizData.contextQuestions[contextQIndex].options[optionIdx].isCorrect;

    if (isCorrect) {
      playCorrectAnswerSound();
      const updated = [...contextAnswers];
      updated[contextQIndex] = { selectedIdx: optionIdx, isCorrect: true };
      setContextAnswers(updated);

      // Automatically move forward to the next question (or Step 2 after Question 3)
      const currentQ = contextQIndex;
      setTimeout(() => {
        if (currentQ < 2) {
          setContextQIndex(currentQ + 1);
        } else {
          changeStep(2);
        }
      }, 750);
    } else {
      // Mark this option as tried/wrong in red so the user can immediately click the correct option to advance
      setWrongOptionIndices((prev) => {
        const existing = prev[contextQIndex] || [];
        if (existing.includes(optionIdx)) return prev;
        return { ...prev, [contextQIndex]: [...existing, optionIdx] };
      });
    }
  };

  // -------------------------------------------------------------
  // STEP 2 STATE: KEY PHRASES CLOZE CHALLENGE
  // Start by hiding 3-5 key words. If user clicks right answer, celebration sound.
  // If user gets a word wrong, add another hidden word!
  // If user gets all correct, confetti celebration reward!
  // -------------------------------------------------------------
  const [hiddenWordCount, setHiddenWordCount] = useState<number>(() => {
    // Initial hidden count: 3 to 4 words depending on verse length
    const rawWords = verse.text.split(/\s+/).filter((w) => w.length > 2);
    return Math.min(4, Math.max(3, Math.floor(rawWords.length / 4)));
  });

  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  const [clozeCompleted, setClozeCompleted] = useState<boolean>(false);
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);

  // Parse and identify key words from the verse
  const { tokens, blankTokens, wordBankOptions } = useMemo(() => {
    const rawWords = verse.text.split(/\s+/);
    const tokenList: VerseToken[] = [];
    let eligibleIndices: number[] = [];

    rawWords.forEach((wordWithPunc, idx) => {
      const clean = wordWithPunc.replace(/[^a-zA-Z0-9]/g, "");
      const isKey = clean.length >= 4 && !COMMON_STOP_WORDS.has(clean.toLowerCase());
      tokenList.push({
        id: idx,
        originalText: wordWithPunc,
        cleanWord: clean,
        isKeyWord: isKey,
        isBlank: false,
        userAnswer: null,
        isCorrect: null
      });

      if (isKey) {
        eligibleIndices.push(idx);
      }
    });

    // If not enough long words, allow shorter ones
    if (eligibleIndices.length < hiddenWordCount) {
      rawWords.forEach((w, idx) => {
        const clean = w.replace(/[^a-zA-Z0-9]/g, "");
        if (clean.length >= 3 && !eligibleIndices.includes(idx)) {
          eligibleIndices.push(idx);
        }
      });
    }

    // Select the first `hiddenWordCount` eligible words to hide (spaced through the verse)
    const selectedIndices = eligibleIndices.slice(0, Math.min(hiddenWordCount, eligibleIndices.length));
    const blanks: VerseToken[] = [];

    tokenList.forEach((token) => {
      if (selectedIndices.includes(token.id)) {
        token.isBlank = true;
        blanks.push(token);
      }
    });

    // Create word bank containing target clean words plus smart distractors
    const targetWords = blanks.map((b) => b.cleanWord);
    const distractors = ["righteousness", "covenant", "commandments", "faith", "sanctuary", "testimony", "grace", "patience", "glory", "truth"]
      .filter((d) => !targetWords.some((t) => t.toLowerCase() === d.toLowerCase()))
      .slice(0, Math.max(2, 6 - targetWords.length));

    // Combine and shuffle
    const allBank = Array.from(new Set([...targetWords, ...distractors])).sort(() => 0.5 - Math.random());

    return {
      tokens: tokenList,
      blankTokens: blanks,
      wordBankOptions: allBank
    };
  }, [verse.text, hiddenWordCount]);

  // Track user answers for each blank token
  const [filledAnswers, setFilledAnswers] = useState<Record<number, { word: string; isCorrect: boolean }>>({});

  // Reset or adjust blank focus when blank tokens change
  useEffect(() => {
    // Find first unfilled blank
    const firstUnfilled = blankTokens.findIndex((b) => !filledAnswers[b.id]);
    if (firstUnfilled !== -1) {
      setActiveBlankIndex(firstUnfilled);
    }
  }, [blankTokens, filledAnswers]);

  // Handle user clicking a word in the word bank for the currently active blank
  const handleSelectBankWord = (word: string) => {
    if (clozeCompleted || blankTokens.length === 0) return;

    const currentBlank = blankTokens[activeBlankIndex];
    if (!currentBlank) return;

    const isMatch = word.toLowerCase() === currentBlank.cleanWord.toLowerCase();

    if (isMatch) {
      // 1. Play celebration sound!
      playCorrectAnswerSound();

      // 2. Mark this blank as correct
      const updated = {
        ...filledAnswers,
        [currentBlank.id]: { word, isCorrect: true }
      };
      setFilledAnswers(updated);
      setPenaltyMessage(null);

      // Check if ALL blanks are now answered correctly
      const allDone = blankTokens.every((b) => b.id === currentBlank.id || updated[b.id]?.isCorrect);

      if (allDone) {
        setClozeCompleted(true);
        // Play hooray sound & trigger fun confetti celebration!
        playHooraySound();
        showConfetti("recall", `Superb! All ${blankTokens.length} key words accurately recalled!`);
        setTimeout(() => {
          changeStep(3);
        }, 900);
      } else {
        // Move to next unfilled blank
        const nextIdx = blankTokens.findIndex((b, idx) => idx !== activeBlankIndex && !updated[b.id]?.isCorrect);
        if (nextIdx !== -1) {
          setActiveBlankIndex(nextIdx);
        }
      }
    } else {
      // WRONG ANSWER:
      // "If they get any word wrong, the prompt will add another hidden word to make it a bit more challenging."
      const totalEligible = tokens.filter((t) => t.isKeyWord || t.cleanWord.length >= 3).length;
      if (hiddenWordCount < totalEligible) {
        setHiddenWordCount((prev) => prev + 1);
        setPenaltyMessage("Added +1 additional hidden word to challenge your recall! Keep going.");
      } else {
        setPenaltyMessage("Incorrect word choice. Look closely at the phrase structure and try again!");
      }
    }
  };

  // -------------------------------------------------------------
  // STEP 3 STATE: PERSONAL DEVOTIONAL ANCHOR
  // -------------------------------------------------------------
  const [selectedAnchor, setSelectedAnchor] = useState<string>("");
  const [reflectionText, setReflectionText] = useState<string>("");

  const handleSubmitAll = () => {
    const correctContextCount = contextAnswers.filter((a) => a?.isCorrect).length;
    const contextScore = Math.round((correctContextCount / 3) * 50);
    const clozeScore = clozeCompleted ? 50 : 25;
    const totalScore = Math.min(100, contextScore + clozeScore);

    onComplete(
      totalScore,
      {
        contextAnswers,
        clozeWordCount: blankTokens.length,
        reflectionAnchor: selectedAnchor
      },
      reflectionText || selectedAnchor
    );
  };

  const currentContextData = quizData.contextQuestions[contextQIndex];
  const currentContextAnswer = contextAnswers[contextQIndex];

  return (
    <div className="space-y-3 text-left" id="mini-recall-quiz-container">
      {/* STEP INDICATOR TABS */}
      <div className="grid grid-cols-4 items-center border-y border-[#1E325C]/80 py-2 text-center">
        {[
          { step: 1 as const, num: "1.", labelTop: "Passage", labelBottom: "Context" },
          { step: 2 as const, num: "2.", labelTop: "Key", labelBottom: "Phrases" },
          { step: 3 as const, num: "3.", labelTop: "Personal", labelBottom: "Anchor" }
        ].map((s) => {
          const isDone = s.step < activeStep;
          const isCurrent = s.step === activeStep;

          return (
            <button
              key={s.step}
              onClick={() => {
                if (isDone || isCurrent) changeStep(s.step);
              }}
              className={`relative px-2 py-0.5 text-xs sm:text-[13px] font-serif transition-all flex flex-col items-center justify-center border-r border-[#1E325C]/80 cursor-pointer ${
                isCurrent
                  ? "text-[#F2C65E] font-bold"
                  : isDone
                  ? "text-[#D5DFEE] hover:text-[#F2C65E]"
                  : "text-[#B2C0D8]/75"
              }`}
            >
              <span className="leading-tight">
                {s.num} {s.labelTop}
              </span>
              <span className="leading-tight">{s.labelBottom}</span>
              {isCurrent && (
                <span className="absolute -bottom-2 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#F2C65E] to-transparent shadow-[0_0_12px_#F2C65E]" />
              )}
            </button>
          );
        })}

        <div className="flex items-center justify-center px-2">
          <span className="text-xs sm:text-[13px] font-serif text-[#F2C65E] font-bold">
            Step {activeStep} of 3
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* STEP 1: PASSAGE CONTEXT (3 QUESTIONS WITH SOUND ON CORRECT ANSWER)        */}
        {/* ========================================================================= */}
        {activeStep === 1 && (
          <motion.div
            key={`step-1-q-${contextQIndex}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-2.5"
          >
            {/* Header with question counter badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#E5B34B]">
                <HelpCircle className="w-4 h-4 text-[#E5B34B] shrink-0" />
                <span className="text-[11px] font-serif uppercase tracking-[0.14em] font-bold text-[#E5B34B]">
                  Context Question {contextQIndex + 1} of 3
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                {[0, 1, 2].map((idx) => {
                  const ans = contextAnswers[idx];
                  return (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === contextQIndex
                          ? "bg-[#F2C65E] scale-125 shadow-[0_0_8px_#F2C65E]"
                          : ans?.isCorrect
                          ? "bg-emerald-400"
                          : ans !== null
                          ? "bg-rose-400"
                          : "bg-[#263C6A]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <h4 className="text-sm sm:text-base font-serif font-bold text-white leading-snug pl-6">
              {currentContextData.question}
            </h4>

            {/* Context Question Options */}
            <div className="space-y-2 pt-0.5">
              {currentContextData.options.map((opt, idx) => {
                const isCorrectlyAnswered = currentContextAnswer?.isCorrect && currentContextAnswer.selectedIdx === idx;
                const isWrongTry = (wrongOptionIndices[contextQIndex] || []).includes(idx);

                let btnStyle =
                  "border-[#1C305C]/80 hover:border-[#E5B34B]/60 bg-[#08152F]/75 text-[#D8E2F2] hover:bg-[#0D1E42]/80";
                let letterStyle = "text-[#E8BC57]";

                if (isCorrectlyAnswered) {
                  btnStyle =
                    "border-emerald-400/90 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 text-white shadow-[0_0_24px_rgba(16,185,129,0.35)]";
                  letterStyle = "text-emerald-400";
                } else if (isWrongTry) {
                  btnStyle = "border-rose-400/75 bg-rose-950/65 text-rose-100";
                  letterStyle = "text-rose-400";
                } else if (currentContextAnswer?.isCorrect) {
                  btnStyle = "border-[#16274C]/60 opacity-45 bg-[#061024]/50 text-[#8EA2C4]";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectContextOption(idx)}
                    disabled={Boolean(currentContextAnswer?.isCorrect)}
                    className={`w-full text-left py-2.5 px-3 rounded-2xl border text-xs sm:text-[13px] leading-snug transition-all cursor-pointer flex items-center space-x-3 ${btnStyle}`}
                  >
                    <span className={`font-serif font-bold text-base sm:text-lg shrink-0 w-5 text-center ${letterStyle}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1">
                      <p className="font-sans text-[#E6ECF8]">{opt.text}</p>
                    </div>
                    {isCorrectlyAnswered && (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isWrongTry && (
                      <X className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: KEY PHRASES (ADAPTIVE BLANKS WITH REWARD & PENALTY ADDITION)      */}
        {/* ========================================================================= */}
        {activeStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3.5"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[#E8BC57]">
                  <Brain className="w-4 h-4" />
                  <span className="text-xs font-serif uppercase tracking-widest font-extrabold">
                    Key Phrase Recall Challenge
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#B2C0D8]">
                  {blankTokens.filter((b) => filledAnswers[b.id]?.isCorrect).length}/{blankTokens.length} Words Recalled
                </span>
              </div>
              <p className="text-xs text-[#B2C0D8]">
                Recall the missing words. Tap a blank slot, then choose the matching word from the bank below:
              </p>
            </div>

            {/* Penalty Notification banner when an incorrect word was clicked */}
            {penaltyMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-rose-950/70 border border-rose-400/50 rounded-xl flex items-center space-x-2 text-rose-200 text-xs font-sans"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{penaltyMessage}</span>
              </motion.div>
            )}

            {/* Interactive Passage View with Blank Slots */}
            <div className="p-4 rounded-2xl bg-[#08152F]/90 border border-[#E5B34B]/35 text-[#E6ECF8] leading-relaxed font-serif text-sm sm:text-base">
              <span className="inline">
                {tokens.map((token) => {
                  if (!token.isBlank) {
                    return <span key={token.id}>{token.originalText} </span>;
                  }

                  const blankIndex = blankTokens.findIndex((b) => b.id === token.id);
                  const isCurrentBlank = activeBlankIndex === blankIndex;
                  const answer = filledAnswers[token.id];

                  if (answer && answer.isCorrect) {
                    return (
                      <span
                        key={token.id}
                        className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/60 text-xs sm:text-sm"
                      >
                        <Check className="w-3 h-3 mr-1 text-emerald-400" />
                        {answer.word}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={token.id}
                      onClick={() => setActiveBlankIndex(blankIndex)}
                      className={`inline-flex items-center px-2.5 py-0.5 mx-1 rounded-lg border font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isCurrentBlank
                          ? "bg-gradient-to-r from-[#2D2414] to-[#1A243B] text-[#F2C65E] border-[#F2C65E] ring-2 ring-[#F2C65E]/40 shadow-[0_0_12px_rgba(242,198,94,0.3)]"
                          : "bg-[#102042] text-[#E8BC57] border-[#E5B34B]/45 hover:bg-[#172C59]"
                      }`}
                    >
                      <span>Slot #{blankIndex + 1}</span>
                    </button>
                  );
                })}
              </span>
            </div>

            {/* Word Bank Chips */}
            {!clozeCompleted ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#B2C0D8] font-bold">
                    Select word for Slot #{activeBlankIndex + 1}:
                  </span>
                  <span className="text-[10px] font-mono text-[#E8BC57] font-extrabold uppercase">
                    Active Target: Blank #{activeBlankIndex + 1}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {wordBankOptions.map((word, idx) => {
                    const isAlreadyUsed = Object.values(filledAnswers).some(
                      (a: { word: string; isCorrect: boolean }) => a && a.word.toLowerCase() === word.toLowerCase() && a.isCorrect
                    );

                    return (
                      <button
                        key={`${word}-${idx}`}
                        onClick={() => handleSelectBankWord(word)}
                        disabled={isAlreadyUsed}
                        className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                          isAlreadyUsed
                            ? "bg-[#061024] border-[#15254A] text-[#5B7099] opacity-40 line-through cursor-not-allowed"
                            : "bg-[#0B1A3A] border-[#243B6E] text-white hover:border-[#E5B34B] hover:bg-[#132652] shadow-2xs active:scale-95"
                        }`}
                      >
                        <span>{word}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-500/15 border border-emerald-400/50 rounded-xl text-center space-y-1"
              >
                <div className="flex items-center justify-center space-x-2 text-emerald-300 font-bold text-sm font-serif">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Passage Key Words Successfully Mastered!</span>
                </div>
                <p className="text-xs text-emerald-200/90 font-sans max-w-sm mx-auto">
                  All {blankTokens.length} missing doctrinal keywords retrieved accurately. Advancing...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PERSONAL DEVOTIONAL ANCHOR & SUBMIT                               */}
        {/* ========================================================================= */}
        {activeStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[#E8BC57]">
                <Feather className="w-4 h-4" />
                <span className="text-xs font-serif uppercase tracking-widest font-extrabold">
                  Personal Reflection Anchor
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-serif font-bold text-white leading-snug">
                {quizData.reflectionQ?.prompt || "How does this truth transform your walk with Christ today?"}
              </h4>
            </div>

            {/* Quick Reflection Anchors */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-[#B2C0D8] block font-semibold">
                Quick Devotional Anchors (Tap to choose):
              </span>
              <div className="space-y-1.5">
                {(quizData.reflectionQ?.quickAnchors || []).map((anchor, idx) => {
                  const isSelected = selectedAnchor === anchor;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedAnchor(anchor);
                        setReflectionText(anchor);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-sans transition-all cursor-pointer flex items-start space-x-2 ${
                        isSelected
                          ? "bg-gradient-to-r from-[#2D2414]/90 via-[#16223B]/95 to-[#2D2414]/90 border-[#E5B34B]/80 text-white shadow-[0_0_16px_rgba(229,179,75,0.22)] font-medium"
                          : "bg-[#08152F]/75 border-[#1C305C]/80 text-[#D8E2F2] hover:border-[#E5B34B]/50"
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? "text-[#F2C65E]" : "text-[#8EA2C4]"}`} />
                      <span>{anchor}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-mono text-[#B2C0D8] block font-semibold">
                Personalize & edit in your own words:
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write a brief personal prayer, conviction, or practical application..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#243B6E] bg-[#061024] text-white placeholder-[#7A8FB5] outline-none focus:ring-1 focus:ring-[#E5B34B] transition-all resize-none font-sans"
              />
            </div>

            {/* SUBMIT ACTIONS STRIP */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={onOpenFullRecall}
                className="text-xs text-[#E8BC57] hover:text-[#F2C65E] font-mono font-bold underline flex items-center space-x-1 cursor-pointer order-2 sm:order-1"
              >
                <span>Go to Full Recall Session</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={handleSubmitAll}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-b from-[#132852] via-[#0B1936] to-[#071024] border border-[#E5B34B]/75 text-white text-xs font-bold font-mono rounded-xl shadow-[0_0_18px_rgba(229,179,75,0.28)] hover:shadow-[0_0_24px_rgba(229,179,75,0.45)] transition-all flex items-center justify-center space-x-2 cursor-pointer order-1 sm:order-2"
                id="submit-mini-recall-btn"
              >
                <ShieldCheck className="w-4 h-4 text-[#E8BC57]" />
                <span>Submit Recall (+1 Day Streak)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
