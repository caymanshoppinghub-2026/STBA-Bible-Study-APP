/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mic,
  MicOff,
  Square,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Play,
  Volume2,
  VolumeX,
  BookOpen,
  Bookmark,
  Award,
  Zap,
  FolderLock,
  AlertCircle,
  FolderOpen,
  Send,
  MessageSquare,
  TrendingUp,
  BrainCircuit,
  MessageCircle,
  Clock,
  Download,
  FileText,
  Printer,
  Brain,
  ExternalLink,
  Copy,
  Check,
  Scroll,
  Lightbulb,
  PenLine,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Scripture } from "../types";
import { useApp } from "../context/AppContext";
import { callElderStephen } from "../lib/callElderStephen";
import { getElderStephenVoice } from "./stba/RightPaneTools";
import { useLocation, useNavigate } from "react-router-dom";
import { bibleService } from "../services/bibleService";
import { ScriptureLinkedText } from "./stba/ScriptureLinkedText";
import { STBA_LOGO_URL } from "../assets/branding";

// Clean slate active topic placeholder (no hardcoded scripture default)
const CLEAN_SLATE_SCRIPTURE: Scripture = {
  id: "active-study-topic",
  reference: "Active Study Topic",
  text: "Introduce any biblical topic, doctrine, or passage in dialogue with Elder Steven to begin your progressive study.",
  keywords: ["scripture", "covenant", "christ", "truth", "obedience"]
};

// Simulated pre-baked responses for various stages if the user triggers simulator
const SIMULATED_EXPOSITIONS: Record<string, string> = {
  stage1: "In the foundational biblical context, the core message establishes God's covenant character and reveals His redemptive purpose in Christ. By comparing Scripture with Scripture, we see the immediate setting and original meaning clearly.",
  stage2: "Looking at the Great Controversy timeline, God's truth has always been the target of counterfeit traditions. Standing on the plain testimony of the Word anchors the believer against deception.",
  stage3: "This study connects directly to historic Seventh-day Adventist doctrinal harmony, uniting the Old and New Testament witness around the person and ministry of Jesus Christ.",
  stage4: "A practical application for daily discipleship is to translate this biblical principle into intentional prayer, character growth, and faithful obedience in our homes and communities today.",
  stage5: "When inviting a friend, neighbor, or seeker to explore this truth, we lead with warmth, clarity, and Christlike gentleness—opening the Bible together as fellow learners."
};

export interface FundamentalBeliefData {
  number: number;
  title: string;
  summary: string;
  egwQuote: string;
  keyTexts: string[];
}

export interface ScriptureReferenceItem {
  reference: string;
  text: string;
  role?: string;
}

export interface EgwQuoteItem {
  quote: string;
  source: string;
  work: string;
  theologicalContext: string;
}

export interface ExplanatoryNoteItem {
  title: string;
  lexicalOrDoctrinalNote: string;
  howToExplainToOthers: string;
  analogyOrIllustration?: string;
}

export interface TopicOverviewData {
  topicTitle: string;
  scriptureReference: string;
  historicalContext: string;
  quotedScriptures: ScriptureReferenceItem[];
  egwWritings?: EgwQuoteItem[];
  explanatoryNotes?: ExplanatoryNoteItem[];
  lastDaysImportance: string;
  stagesOutline: { stage: number; title: string; focus: string }[];
}

export type LearningTier = "Essential" | "Standard" | "Comprehensive";

export const getDefaultTopicOverview = (scripture: Scripture, doctrineId?: string): TopicOverviewData => {
  const rawRef = (scripture?.reference || "").trim();
  const refLower = rawRef.toLowerCase();

  // 1. THE SABBATH
  if (doctrineId === "sabbath" || refLower.includes("exodus 20:8") || refLower.includes("sabbath") || refLower.includes("genesis 2")) {
    return {
      topicTitle: "The Sabbath: Seal of the Living God & Memorial of Creation",
      scriptureReference: rawRef && rawRef !== "Active Study Topic" ? rawRef : "Exodus 20:8–11",
      historicalContext: "Instituted by the Creator in Eden at Creation before sin entered (Genesis 2:1–3), etched into stone by God's own finger at Mount Sinai (Exodus 20:8–11), and consistently honored by Jesus and His apostles throughout the New Testament (Luke 4:16, Acts 17:2).",
      quotedScriptures: [
        {
          reference: "Genesis 2:1–3",
          text: "Thus the heavens and the earth were finished, and all the host of them. And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made. And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
          role: "Creation Origin & Edenic Blessing"
        },
        {
          reference: "Exodus 20:8–11",
          text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work... For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
          role: "Decalogue Core & Covenant Command"
        },
        {
          reference: "Ezekiel 20:12",
          text: "Moreover also I gave them my sabbaths, to be a sign between me and them, that they might know that I am the LORD that sanctify them.",
          role: "Sign of Sanctification & Covenant Allegiance"
        },
        {
          reference: "Isaiah 58:13–14",
          text: "If thou turn away thy foot from the sabbath, from doing thy pleasure on my holy day; and call the sabbath a delight, the holy of the LORD, honourable; and shalt honour him, not doing thine own ways, nor finding thine own pleasure, nor speaking thine own words: Then shalt thou delight thyself in the LORD...",
          role: "Delight & Spiritual Restoration"
        },
        {
          reference: "Luke 4:16",
          text: "And he came to Nazareth, where he had been brought up: and, as his custom was, he went into the synagogue on the sabbath day, and stood up for to read.",
          role: "Christ's Custom & Apostolic Example"
        },
        {
          reference: "Hebrews 4:9–11",
          text: "There remaineth therefore a rest to the people of God. For he that is entered into his rest, he also hath ceased from his own works, as God did from his. Let us labour therefore to enter into that rest, lest any man fall after the same example of unbelief.",
          role: "New Covenant Rest in Christ"
        },
        {
          reference: "Revelation 14:7",
          text: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
          role: "End-Time Call to Worship the Creator"
        }
      ],
      egwWritings: [
        {
          work: "The Desire of Ages",
          source: "DA 281.3",
          quote: "The Sabbath was hallowed at the creation. As ordained for man, it had its origin when 'the morning stars sang together, and all the sons of God shouted for joy.' Peace brooded over the world; for earth was in harmony with heaven... It points to God as the Maker of all, and is a perpetual memorial of His power and wisdom.",
          theologicalContext: "Establishes that the Sabbath is not a temporary Jewish shadow, but an unchangeable Edenic creation memorial given to all humanity before sin."
        },
        {
          work: "The Great Controversy",
          source: "GC 605.2",
          quote: "The Sabbath will be the great test of loyalty; for it is the point of truth especially controverted. When the final test shall be brought to bear upon men, then the line of demarcation will be drawn between those who serve God and those who serve Him not.",
          theologicalContext: "Highlights the prophetic conflict in Revelation 14 between the seal of God (the seventh-day Sabbath) and the counterfeit mark of human authority."
        },
        {
          work: "Patriarchs and Prophets",
          source: "PP 307.2",
          quote: "The Sabbath is a golden clasp that unites God and His people. It was given to preserve a living knowledge of the true God in the minds of men.",
          theologicalContext: "Reveals the relational, covenantal heart of the Sabbath as a weekly sanctuary in time uniting the soul with Christ."
        }
      ],
      explanatoryNotes: [
        {
          title: "Hebrew Root: Shabbat (שַׁבָּת)",
          lexicalOrDoctrinalNote: "Derived from 'shavat' (to cease, rest, desist from labor, celebrate completion). In Genesis 2:2–3, God ceased not from fatigue, but to contemplate His finished creation and invite humanity to enter His peace.",
          howToExplainToOthers: "Explain to seekers that the Sabbath is not about a rigid list of 'do nots,' but about accepting a royal invitation into God's holy presence. Six days belong to secular pursuit, but the seventh is a sacred appointment with the Creator.",
          analogyOrIllustration: "The Royal Anniversary Analogy: A spouse cannot say, 'I love you, so I will celebrate our anniversary on any day I choose.' The specific day commemorates the historical covenant. Likewise, the 7th day is God's specific memorial of Creation and Redemption."
        },
        {
          title: "The Seal of God Structure in Exodus 20",
          lexicalOrDoctrinalNote: "An authentic governmental seal requires three elements: the name of the lawgiver, their official title or office, and their jurisdictional territory. The 4th Commandment is the only one with all three: The LORD thy God (Name), Creator/Maker (Title), Heaven and Earth (Territory).",
          howToExplainToOthers: "Show how removing or altering the Sabbath strips the Decalogue of its authorizing seal, reducing the moral law to advice rather than the sovereign mandate of the Creator.",
          analogyOrIllustration: "The Notary Seal Analogy: A legal deed or royal proclamation without the official notary seal has no legal force. The Fourth Commandment is the divine notary seal validating the entire moral law."
        }
      ],
      lastDaysImportance: "In Revelation 14's Three Angels' Messages, the final test of cosmic allegiance pivots on worship: worshiping the Creator who made heaven and earth (citing the Fourth Commandment) versus receiving the mark of the beast. The Sabbath stands as God's prophetic seal and sign of loyalty.",
      stagesOutline: [
        { stage: 1, title: "Foundational Overview", focus: "Original Hebrew 'shabbat' (cessation, sacred rest) and covenant context in Genesis 2 and Exodus 20." },
        { stage: 2, title: "The Great Controversy", focus: "Satan's perennial assault on God's law (Daniel 7:25) and repairing the breach (Isaiah 58:12–13)." },
        { stage: 3, title: "Doctrine", focus: "Fundamental Belief #20: The Sabbath as the sign of redemption, sanctification, and eternal rest in Christ." },
        { stage: 4, title: "Application", focus: "Delighting in the Sabbath: preparation, releasing secular toil, family worship, and honoring holy time." },
        { stage: 5, title: "Invitation", focus: "Extending a warm, winsome invitation to seekers to experience the healing rest of Jesus." }
      ]
    };
  }

  // 2. THE SANCTUARY & INVESTIGATIVE JUDGMENT
  if (doctrineId === "sanctuary" || refLower.includes("daniel 8:14") || refLower.includes("hebrews 8") || refLower.includes("sanctuary")) {
    return {
      topicTitle: "Christ in the Heavenly Sanctuary: The Cleansing & Investigative Judgment",
      scriptureReference: rawRef && rawRef !== "Active Study Topic" ? rawRef : "Daniel 8:14",
      historicalContext: "Given to the prophet Daniel during Babylonian exile, unveiling the longest prophetic period of 2,300 prophetic days (years) from 457 BC to 1844, when the anti-typical Day of Atonement commenced in heaven.",
      quotedScriptures: [
        {
          reference: "Daniel 8:14",
          text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
          role: "Prophetic Horizon & 2,300-Day Climax"
        },
        {
          reference: "Leviticus 16:29–34",
          text: "And this shall be a statute for ever unto you... in the seventh month, on the tenth day of the month, ye shall afflict your souls... For on that day shall the priest make an atonement for you, to cleanse you, that ye may be clean from all your sins before the LORD.",
          role: "Typological Day of Atonement"
        },
        {
          reference: "Hebrews 8:1–2",
          text: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
          role: "Christ Our True Heavenly High Priest"
        },
        {
          reference: "Hebrews 9:23–24",
          text: "It was therefore necessary that the patterns of things in the heavens should be purified with these; but the heavenly things themselves with better sacrifices than these. For Christ is not entered into the holy places made with hands, which are the figures of the true; but into heaven itself, now to appear in the presence of God for us.",
          role: "Cleansing of the Heavenly Realities"
        },
        {
          reference: "Daniel 9:24–27",
          text: "Seventy weeks are determined upon thy people and upon thy holy city, to finish the transgression, and to make an end of sins, and to make reconciliation for iniquity, and to bring in everlasting righteousness, and to seal up the vision and prophecy, and to anoint the most Holy.",
          role: "The 70-Week Prophetic Chronometer Anchor"
        },
        {
          reference: "Psalm 77:13",
          text: "Thy way, O God, is in the sanctuary: who is so great a God as our God?",
          role: "The Sanctuary as the Map of Salvation"
        },
        {
          reference: "Revelation 14:6–7",
          text: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
          role: "The Pre-Advent Judgment Proclamation"
        }
      ],
      egwWritings: [
        {
          work: "The Great Controversy",
          source: "GC 423.1",
          quote: "The subject of the sanctuary was the key which unlocked the mystery of the disappointment of 1844. It opened to view a complete system of truth, connected and harmonious, showing that God's hand had directed the great advent movement and revealing present duty as it brought to light the position and work of His people.",
          theologicalContext: "Shows that the sanctuary reveals the total harmony of salvation, connecting Christ's cross with His closing heavenly high-priestly work."
        },
        {
          work: "Patriarchs and Prophets",
          source: "PP 358.1",
          quote: "The earthly sanctuary was pitched by Moses according to the pattern shown him in the mount. The ministration of the earthly sanctuary was divided into two services: the priests ministered daily in the holy place, while once a year the high priest performed a special work of atonement in the most holy place, for the cleansing of the sanctuary.",
          theologicalContext: "Differentiates between Christ's daily intercession for individual forgiveness and His yearly final judgment work of blotting out sin."
        }
      ],
      explanatoryNotes: [
        {
          title: "Hebrew Root: Nitsdaq (נִצְדָּק)",
          lexicalOrDoctrinalNote: "In Daniel 8:14, 'nitsdaq' (passive niphal form of tsadaq) means cleansed, justified, vindicated, restored to rightful standing. It refers to the cosmic vindication of God's character and the cleansing of the sanctuary records from the defilement of sin.",
          howToExplainToOthers: "Explain that the cross was the perfect, once-for-all sacrificial offering, while the sanctuary shows how Jesus actively applies and completes that sacrifice in heaven's courts.",
          analogyOrIllustration: "The Courtroom Ledger Audit: In a financial system, deposits are recorded daily, but at fiscal year-end, an exhaustive audit verifies every transaction, closes the ledgers, and certifies the accounts clean. Christ's investigative judgment is the final cosmic audit vindicating the repentant believer before angels."
        },
        {
          title: "The 2,300-Day Prophetic Timeline (457 BC to 1844)",
          lexicalOrDoctrinalNote: "Using the biblical year-day principle (Numbers 14:34, Ezekiel 4:6), the decree of Artaxerxes in 457 BC (Ezra 7) establishes the starting point. The first 490 years (70 weeks) reached Christ's baptism (27 AD), crucifixion (31 AD), and the gospel going to Gentiles (34 AD). The remaining 1,810 years lead exactly to 1844.",
          howToExplainToOthers: "Use the 70 weeks as the shorter key that unlocks the front part of the longer 2,300-year chain, proving that Bible prophecy predicts Christ's ministry with chronological precision.",
          analogyOrIllustration: "The Measuring Tape: A 23-foot tape measure where the first 4.9 feet are marked off for a specific task. If the first 4.9 feet align perfectly with historic landmarks (the Messiah's arrival), you can have total confidence in where the full 23-foot tape lands."
        }
      ],
      lastDaysImportance: "The sanctuary doctrine unlocks the Great Controversy, revealing that Christ is currently engaged in His closing work of investigative judgment in the Most Holy Place, securing our vindication and cleansing our records before His literal return.",
      stagesOutline: [
        { stage: 1, title: "Foundational Overview", focus: "Original Hebrew 'nitsdaq' (cleansed, vindicated, restored to rightful state) in Daniel 8:14." },
        { stage: 2, title: "The Great Controversy", focus: "The enemy's attack on the heavenly sanctuary and Christ's cosmic vindication before the universe." },
        { stage: 3, title: "Doctrine", focus: "Fundamental Belief #24: Christ's Ministry in the Heavenly Sanctuary." },
        { stage: 4, title: "Application", focus: "Living in the anti-typical Day of Atonement: deep heart surrender, daily abiding, and sanctified character." },
        { stage: 5, title: "Invitation", focus: "Proclaiming the assurance of our compassionate High Priest who ever lives to intercede for us." }
      ]
    };
  }

  // 3. THE SECOND COMING OF CHRIST
  if (doctrineId === "second-coming" || refLower.includes("titus 2:13") || refLower.includes("john 14") || refLower.includes("coming") || refLower.includes("advent")) {
    return {
      topicTitle: "The Second Coming of Christ: The Blessed Hope & Grand Climax",
      scriptureReference: rawRef && rawRef !== "Active Study Topic" ? rawRef : "Titus 2:13",
      historicalContext: "The crowning theme of all Scripture, promised by the prophets, guaranteed by Jesus before His crucifixion, and proclaimed by the apostles as the literal, personal, visible deliverance of God's people from sin, death, and decay.",
      quotedScriptures: [
        {
          reference: "John 14:1–3",
          text: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions... I go to prepare a place for you. And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.",
          role: "The Savior's Covenant Promise"
        },
        {
          reference: "Acts 1:9–11",
          text: "This same Jesus, which is taken up from you into heaven, shall so come in like manner as ye have seen him go into heaven.",
          role: "Literal, Bodily, Visible Ascension & Return"
        },
        {
          reference: "1 Thessalonians 4:16–17",
          text: "For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first: Then we which are alive and remain shall be caught up together with them in the clouds, to meet the Lord in the air...",
          role: "The Resurrection of the Just & Gathering of the Saints"
        },
        {
          reference: "Matthew 24:27",
          text: "For as the lightning cometh out of the east, and shineth even unto the west; so shall also the coming of the Son of man be.",
          role: "Universal, Unmistakable Visibility"
        },
        {
          reference: "Titus 2:13",
          text: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
          role: "The Blessed Hope of the Church"
        },
        {
          reference: "Revelation 1:7",
          text: "Behold, he cometh with clouds; and every eye shall see him, and they also which pierced him: and all kindreds of the earth shall wail because of him. Even so, Amen.",
          role: "Global Climax: Every Eye Shall See Him"
        },
        {
          reference: "Revelation 19:11–16",
          text: "And I saw heaven opened, and behold a white horse; and he that sat upon him was called Faithful and True... King of kings, and Lord of lords.",
          role: "Cosmic Triumph of the Victorious King"
        }
      ],
      egwWritings: [
        {
          work: "The Great Controversy",
          source: "GC 299.1",
          quote: "The doctrine of the Second Advent is the very keynote of the Sacred Scriptures. From the day when the first pair turned their sorrowing steps from Eden, the children of faith have waited the coming of the Promised One to break the destroyer's power and bring them again to the lost Paradise.",
          theologicalContext: "Places the second coming as the centerpiece of redemptive history, restoring what was lost in Eden."
        },
        {
          work: "The Desire of Ages",
          source: "DA 832.2",
          quote: "To the believer, Christ's second coming is not a day of terror, but a day of longing and joy, the hour when the Bridegroom claims His redeemed bride.",
          theologicalContext: "Emphasizes the pastoral comfort, assurance, and loving intimacy of Christ's return for His waiting people."
        }
      ],
      explanatoryNotes: [
        {
          title: "Greek Root: Parousia (παρουσία)",
          lexicalOrDoctrinalNote: "Refers to the personal, bodily arrival and presence of a royal dignitary. Scripture completely refutes the idea of a secret or invisible return; Christ's coming is loud, audible ('trump of God'), and universally visible ('every eye shall see him').",
          howToExplainToOthers: "Contrast the biblical glorious, literal return with popular secret rapture theories by comparing 1 Thess 4:16 (shout, trumpet, resurrection) with Matthew 24:27 (lightning across the sky).",
          analogyOrIllustration: "The Royal Wedding Arrival: A bridegroom does not spirit his bride away secretly under cover of darkness without anyone knowing. The royal king arrives with trumpets sounding, royal heralds shouting, and full public majesty to celebrate the marriage supper."
        }
      ],
      lastDaysImportance: "The Second Coming is the ultimate resolution to the Great Controversy. Without it, the dead remain in the grave, evil goes unpunished, and redemption remains incomplete.",
      stagesOutline: [
        { stage: 1, title: "Foundational Overview", focus: "Greek 'parousia' (literal bodily presence) and biblical descriptions of visibility and sound." },
        { stage: 2, title: "The Great Controversy", focus: "Counterfeit deceptions: Satan impersonating Christ vs. true biblical return." },
        { stage: 3, title: "Doctrine", focus: "Fundamental Belief #25: The Second Coming of Christ." },
        { stage: 4, title: "Application", focus: "Living in constant readiness, purifying the heart, and actively hastening His coming." },
        { stage: 5, title: "Invitation", focus: "Calling loved ones and neighbors to welcome the coming King with joy and peace." }
      ]
    };
  }

  // 4. STATE OF THE DEAD & RESURRECTION
  if (doctrineId === "state-of-dead" || refLower.includes("ecclesiastes 9") || refLower.includes("death") || refLower.includes("resurrection") || refLower.includes("soul")) {
    return {
      topicTitle: "The State of the Dead: The Sleep in Christ & Resurrection Morning",
      scriptureReference: rawRef && rawRef !== "Active Study Topic" ? rawRef : "Ecclesiastes 9:5–6",
      historicalContext: "Satan's first lie in Eden—'Ye shall not surely die' (Genesis 3:4)—forms the root of spiritualism and theological errors. God's Word consistently reveals death as an unconscious sleep until the resurrection at Christ's return.",
      quotedScriptures: [
        {
          reference: "Genesis 2:7",
          text: "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
          role: "The Creation Formula: Dust + Breath = Living Soul"
        },
        {
          reference: "Ecclesiastes 9:5–6",
          text: "For the living know that they shall die: but the dead know not any thing, neither have they any more a reward; for the memory of them is forgotten. Also their love, and their hatred, and their envy, is now perished...",
          role: "Total Unconsciousness in the Grave"
        },
        {
          reference: "Psalm 146:4",
          text: "His breath goeth forth, he returneth to his earth; in that very day his thoughts perish.",
          role: "Cessation of Mental Thought at Death"
        },
        {
          reference: "John 11:11–14",
          text: "These things said he: and after that he saith unto them, Our friend Lazarus sleepeth; but I go, that I may awake him out of sleep... Then said Jesus unto them plainly, Lazarus is dead.",
          role: "Jesus Defines Death as a Sleep"
        },
        {
          reference: "1 Corinthians 15:51–54",
          text: "Behold, I shew you a mystery; We shall not all sleep, but we shall all be changed, In a moment, in the twinkling of an eye, at the last trump... and the dead shall be raised incorruptible... then shall be brought to pass the saying that is written, Death is swallowed up in victory.",
          role: "Immortality Bestowed at the Resurrection"
        },
        {
          reference: "1 Thessalonians 4:13–18",
          text: "But I would not have you to be ignorant, brethren, concerning them which are asleep, that ye sorrow not, even as others which have no hope... Wherefore comfort one another with these words.",
          role: "Pastoral Comfort in the Sleep of Death"
        },
        {
          reference: "Revelation 20:5–6",
          text: "Blessed and holy is he that hath part in the first resurrection: on such the second death hath no power, but they shall be priests of God and of Christ, and shall reign with him a thousand years.",
          role: "The Two Resurrections & Millennial Judgment"
        }
      ],
      egwWritings: [
        {
          work: "The Great Controversy",
          source: "GC 531.1",
          quote: "The theory of the immortality of the soul was one of those false doctrines that Rome, borrowing from paganism, incorporated into the religion of Christendom. Martin Luther classed it with the monstrous fables that form part of the Roman dunghill of decretals.",
          theologicalContext: "Unmasks the pagan origin of natural immortality and vindicates God's justice against eternal torment."
        },
        {
          work: "The Ministry of Healing",
          source: "MH 416.2",
          quote: "To the believer, death is but a small matter. Christ speaks of it as if it were of little moment. 'If a man keep My saying, he shall never see death.' To the Christian, death is but a sleep, a moment of silence and darkness, until the Lifegiver shall awaken him.",
          theologicalContext: "Brings immense pastoral comfort to grieving families, removing fear of ghosts and demonic apparitions."
        }
      ],
      explanatoryNotes: [
        {
          title: "Hebrew Formula: Nephesh Chayyah (נֶפֶשׁ חַיָּה)",
          lexicalOrDoctrinalNote: "In Genesis 2:7, God did not put a soul INTO man. Dust + Breath of Life = Living Soul (nephesh). Man DOES NOT HAVE a soul; man IS a soul. When the breath (ruach) departs, the soul ceases to exist until the resurrection.",
          howToExplainToOthers: "Use the lightbulb analogy to explain the difference between having an immortal ghost and being a living composite being.",
          analogyOrIllustration: "The Lightbulb & Electricity Analogy: A lightbulb alone is cold glass and wire (the body/dust). An electrical current alone is invisible power (the breath of God). When connected, you get light (the living soul). When you flip off the switch, where does the light go? It doesn't go to heaven or float in the room—it simply ceases to exist until the power is reconnected. Death is the switch turned off until the resurrection morning!"
        }
      ],
      lastDaysImportance: "Spiritualism and belief in communication with the dead form Satan's greatest end-time deception, uniting apostate churches and deceiving world leaders through counterfeit demonic apparitions.",
      stagesOutline: [
        { stage: 1, title: "Foundational Overview", focus: "Genesis 2:7 formula and Hebrew 'nephesh' / 'ruach' vs. Greek dualism." },
        { stage: 2, title: "The Great Controversy", focus: "The Eden lie 'ye shall not surely die' and end-time spiritualistic delusions." },
        { stage: 3, title: "Doctrine", focus: "Fundamental Belief #26: Death and Resurrection." },
        { stage: 4, title: "Application", focus: "Shielding against grief exploitation, séances, and demonic medium deceptions." },
        { stage: 5, title: "Invitation", focus: "Offering genuine comfort in Christ who holds the keys of hell and death." }
      ]
    };
  }

  // 5. DYNAMIC CONVERSATIONAL TOPIC OR CLEAN SLATE
  const isCleanSlate = !rawRef || rawRef === "Active Study Topic";
  const activeTopicTitle = isCleanSlate
    ? "Active Conversational Study"
    : `Biblical Study: ${rawRef}`;
  const activeReference = isCleanSlate ? "Selected in Dialogue" : rawRef;

  return {
    topicTitle: activeTopicTitle,
    scriptureReference: activeReference,
    historicalContext: isCleanSlate
      ? "Share any biblical passage, doctrine, or question with Elder Steven in the dialogue stream. As your conversation unfolds, each study stage will unlock methodically."
      : `Examining the biblical context, covenant background, and canonical harmony of ${rawRef} by comparing Scripture with Scripture (Isaiah 28:9–10).`,
    quotedScriptures: [
      ...( !isCleanSlate && scripture?.text ? [{
        reference: rawRef,
        text: scripture.text,
        role: "Primary Conversational Focus"
      }] : []),
      {
        reference: "Isaiah 28:9–10",
        text: "Whom shall he teach knowledge? and whom shall he make to understand doctrine? them that are weaned from the milk, and drawn from the breasts. For precept must be upon precept, precept upon precept; line upon line, line upon line; here a little, and there a little.",
        role: "Biblical Study Principle: Line Upon Line"
      },
      {
        reference: "2 Timothy 3:16–17",
        text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, throughly furnished unto all good works.",
        role: "Divine Inspiration & Authority"
      },
      {
        reference: "John 5:39",
        text: "Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me.",
        role: "Christ: The Living Center of All Scripture"
      },
      {
        reference: "Acts 17:11",
        text: "These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so.",
        role: "The Berean Spirit of Daily Investigation"
      },
      {
        reference: "Revelation 14:12",
        text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        role: "The Faith of Jesus: The Fruit of Truth"
      }
    ],
    egwWritings: [
      {
        work: "Education",
        source: "Ed 190.1",
        quote: "The Bible is its own expositor. Scripture is to be compared with scripture. The student should learn to view the word as a whole, and to see the relation of its parts. He should gain a knowledge of its grand central theme, of God's original purpose for the world, of the rise of the great controversy, and of the work of redemption.",
        theologicalContext: "Articulates the primary biblical principle: letting Scripture interpret itself around the grand central theme of redemption."
      },
      {
        work: "The Great Controversy",
        source: "GC 593.1",
        quote: "None but those who have fortified the mind with the truths of the Bible will stand through the last great conflict. To every soul will come the searching test: Shall I obey God rather than men? The decisive hour is even now at hand. Are our feet planted on the rock of God's immutable word?",
        theologicalContext: "Shows that grounding the mind in God's Word is our essential spiritual anchor in earth's closing scenes."
      }
    ],
    explanatoryNotes: [
      {
        title: "The Line-Upon-Line Principle (Isaiah 28:10)",
        lexicalOrDoctrinalNote: "Scripture interprets Scripture. No single verse stands in isolation. Sound biblical study gathers all scriptural testimonies on the active topic to see the harmonious picture God intended.",
        howToExplainToOthers: "Encourage learners to examine the broad biblical witness from Genesis to Revelation rather than isolating a single phrase out of context.",
        analogyOrIllustration: "The Tapestry Threads: A single colored thread out of context looks like a random string. Woven together with all the other threads in the master weaver's loom, it forms a clear portrait of Jesus Christ."
      },
      {
        title: "Christ-Centered Doctrinal Harmony (John 5:39)",
        lexicalOrDoctrinalNote: "Every biblical doctrine finds its life and meaning in the person and ministry of Jesus Christ—our Creator, Redeemer, High Priest, and Coming King.",
        howToExplainToOthers: "Show how every truth of Scripture reveals God's character of love and draws the heart closer to Christ.",
        analogyOrIllustration: "The Hub and Spokes: Doctrines are like the spokes of a wheel; they only hold together and carry weight when anchored firmly into the central hub—Jesus Christ."
      }
    ],
    lastDaysImportance: "In earth's closing conflict, grounding our faith line upon line in God's Word equips us to stand with the commandment-keeping people of God and share the Three Angels' Messages with clarity and love.",
    stagesOutline: [
      { stage: 1, title: "Foundational Overview", focus: `Core biblical context, primary scripture witness, and foundational meaning of ${isCleanSlate ? "your chosen study topic" : rawRef}.` },
      { stage: 2, title: "The Great Controversy", focus: "The cosmic conflict between truth and error surrounding this biblical theme." },
      { stage: 3, title: "Doctrine", focus: "How this theme connects harmoniously within Seventh-day Adventist biblical beliefs." },
      { stage: 4, title: "Application", focus: "Translating this truth into daily Christian living, prayer, and character growth." },
      { stage: 5, title: "Invitation", focus: "Sharing this truth with friends, family, and seekers with Christlike warmth and clarity." }
    ]
  };
};

export const FUNDAMENTAL_BELIEFS_CATALOG: Record<string, FundamentalBeliefData> = {
  "holy-scriptures": {
    number: 1,
    title: "The Holy Scriptures",
    summary: "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration. They are the standard of character, the test of experience, the definitive revealer of doctrines, and the trustworthy record of God's acts in history.",
    egwQuote: "The Bible is its own expositor. Scripture is to be compared with scripture. The student should learn to view the word as a whole, and to see the relation of its parts.",
    keyTexts: ["2 Timothy 3:16-17", "Psalm 119:105", "Proverbs 30:5-6", "Isaiah 8:20", "John 17:17", "2 Peter 1:19-21"]
  },
  "great-controversy": {
    number: 8,
    title: "The Great Controversy",
    summary: "All humanity is now involved in a great controversy between Christ and Satan regarding the character of God, His law, and His sovereignty over the universe.",
    egwQuote: "The great controversy between good and evil will increase in intensity to the very close of time. In all ages the wrath of Satan has been manifested against the church of Christ.",
    keyTexts: ["Genesis 3:15", "Revelation 12:4-9", "Isaiah 14:12-14", "Ezekiel 28:12-18", "Romans 8:19-22"]
  },
  "sanctuary": {
    number: 24,
    title: "Christ's Ministry in the Heavenly Sanctuary",
    summary: "There is a sanctuary in heaven, the true tabernacle that the Lord set up and not humans. In it Christ ministers on our behalf, making available to believers the benefits of His atoning sacrifice.",
    egwQuote: "The subject of the sanctuary was the key which unlocked the mystery of the disappointment of 1844. It opened to view a complete system of truth, connected and harmonious.",
    keyTexts: ["Hebrews 8:1-5", "Daniel 8:14", "Leviticus 16", "Revelation 14:6-7", "Hebrews 9:11-28"]
  },
  "sabbath": {
    number: 20,
    title: "The Sabbath",
    summary: "The gracious Creator, after the six days of Creation, rested on the seventh day and instituted the Sabbath for all people as a memorial of Creation and a sign of sanctification.",
    egwQuote: "The Sabbath is a golden clasp that unites God and His people. It is a memorial of God's creative power and a token of His sanctifying presence.",
    keyTexts: ["Genesis 2:1-3", "Exodus 20:8-11", "Luke 4:16", "Isaiah 58:13-14", "Hebrews 4:1-11"]
  },
  "second-coming": {
    number: 25,
    title: "The Second Coming of Christ",
    summary: "The second coming of Christ is the blessed hope of the church, the grand climax of the gospel. The Savior's coming will be literal, personal, visible, and worldwide.",
    egwQuote: "The doctrine of the Second Advent is the very keynote of the Sacred Scriptures.",
    keyTexts: ["Titus 2:13", "Hebrews 9:28", "John 14:1-3", "Acts 1:9-11", "Revelation 1:7", "1 Thessalonians 4:16-17"]
  }
};

interface TeachItStudioProps {
  scripture?: Scripture;
  onClose: () => void;
  sabbathMode?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  type?: "standard" | "overview" | "scripture_proof" | "prompt";
  topicTitle?: string;
  scriptureRef?: string;
  scriptureText?: string;
  scriptureIndex?: number;
  totalScriptures?: number;
  historicalContext?: string;
  lastDaysImportance?: string;
  stagesOutline?: { stage: number; title: string; focus: string }[];
}

type PhaseType =
  | "intro"
  | "stage1"
  | "stage2"
  | "stage3"
  | "stage4"
  | "stage5"
  | "feedback";

export const TeachItStudio: React.FC<TeachItStudioProps> = ({
  scripture: propScripture = CLEAN_SLATE_SCRIPTURE,
  onClose,
  sabbathMode = false
}) => {
  const { user, showConfetti, hasTierAccess, openUpgradeModal } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Sequential speech bubble timers
  const sequentialTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearSequentialTimers = () => {
    sequentialTimersRef.current.forEach((t) => clearTimeout(t));
    sequentialTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearSequentialTimers();
    };
  }, []);

  // Direct navigation to Bible study module with target reference
  const handleNavigateToBibleStudy = (reference: string) => {
    if (!reference || !reference.trim()) return;
    const cleanRef = reference.trim();

    cleanupLiveAudioAndWS();
    stopVoiceResponse();
    clearIntervals();
    clearSequentialTimers();
    setIsTimerActive(false);

    localStorage.setItem("stba_pending_search_ref", cleanRef);
    localStorage.setItem("stba_pending_search_tool", "stephen");

    triggerToast(`Opening ${cleanRef} in Bible Study module...`);
    navigate(`/stba?ref=${encodeURIComponent(cleanRef)}`);
  };

  // Resolve Holy Scriptures override
  const params = new URLSearchParams(location.search);
  const stateDoctrine = location.state?.doctrineId;
  const isFromBelief1 = params.get("doctrine") === "holy-scriptures" || stateDoctrine === "holy-scriptures";

  const initialScripture = isFromBelief1 ? {
    id: "holy-scriptures",
    reference: "2 Timothy 3:16",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    keywords: ["inspiration", "profitable", "doctrine", "reproof", "correction", "instruction"]
  } : propScripture;

  const [activeScripture, setActiveScripture] = useState<Scripture>(initialScripture);
  const scripture = activeScripture;

  // Learning tier selection to adapt content volume (Essential / Standard / Comprehensive)
  const [learningTier, setLearningTier] = useState<LearningTier>(() => {
    const saved = localStorage.getItem("stba_learning_tier");
    if (saved === "Essential" || saved === "Standard" || saved === "Comprehensive") {
      return saved;
    }
    return "Standard";
  });

  const handleLearningTierChange = (tier: LearningTier) => {
    setLearningTier(tier);
    localStorage.setItem("stba_learning_tier", tier);
  };

  // Role selections and options
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem("stba_user_role") || user?.role || "Student";
  });
  const [isEvangelist, setIsEvangelist] = useState<boolean>(() => {
    return userRole === "LayEvangelist" || localStorage.getItem("stba_user_role") === "LayEvangelist";
  });
  const [isAudioPrompterEnabled, setIsAudioPrompterEnabled] = useState<boolean>(true);

  // Active state parameters
  const [phase, setPhase] = useState<PhaseType>("intro");
  const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "blackboard" | "scorecard">("chat");
  const [blackboardView, setBlackboardView] = useState<"all" | "scriptures" | "egw" | "pedagogy">("all");
  const [showBlackboardDownloadMenu, setShowBlackboardDownloadMenu] = useState<boolean>(false);
  const blackboardScrollRef = useRef<HTMLDivElement>(null);
  const [blackboardNotes, setBlackboardNotes] = useState<string>(() => {
    return localStorage.getItem(`stba_blackboard_notes_${scripture.id}`) || "";
  });

  const handleDownloadBlackboardPDF = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 44;
      const maxLineWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight = 24) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const writeWrapped = (text: string, fontSize = 10.5, isBold = false, indent = 0, color: [number, number, number] = [30, 35, 45]) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, maxLineWidth - indent);
        lines.forEach((line: string) => {
          checkPageBreak(fontSize + 6);
          doc.text(line, margin + indent, y);
          y += fontSize + 5;
        });
      };

      // Header
      writeWrapped("TEACH IT INTERACTIVE STUDIO • INSTRUCTIONAL STUDY RECORD", 9, true, 0, [180, 130, 40]);
      y += 2;
      writeWrapped(topicOverview?.topicTitle || `Biblical Study: ${scripture.reference}`, 16, true, 0, [20, 26, 39]);
      writeWrapped(`Active Study Topic: ${topicOverview?.scriptureReference || scripture.reference} | Tier: ${learningTier} | Generated: ${new Date().toLocaleDateString()}`, 10, false, 0, [100, 105, 115]);
      y += 10;

      // 1. Overviews
      writeWrapped("1. THEOLOGICAL & PROPHETIC OVERVIEW", 12, true, 0, [180, 130, 40]);
      y += 2;
      writeWrapped("Historical, Cultural & Theological Setting:", 10.5, true);
      writeWrapped(topicOverview?.historicalContext || "Awaiting structured topic overview.", 10, false, 8);
      y += 4;
      writeWrapped("Critical Importance for the Last Days:", 10.5, true);
      writeWrapped(topicOverview?.lastDaysImportance || "Awaiting prophetic context.", 10, false, 8);
      y += 10;

      // 2. Stage-by-Stage Instructional Content
      writeWrapped("2. STAGE-BY-STAGE INSTRUCTIONAL CONTENT (5 STAGES)", 12, true, 0, [180, 130, 40]);
      y += 2;
      stagesList.forEach((stg, idx) => {
        const outlineItem = topicOverview?.stagesOutline?.[idx];
        const stageScore = scoreStats.stageScores[stg.id] || 0;
        writeWrapped(
          `Stage ${stg.number}: ${stg.title} (${stg.subtitle})${stageScore > 0 ? ` — Score: ${stageScore}%` : ""}`,
          10.5,
          true
        );
        writeWrapped(`Overview: ${stg.overview}`, 9.5, false, 10);
        if (outlineItem?.focus) {
          writeWrapped(`Instructional Focus: ${outlineItem.focus}`, 9.5, false, 10);
        }
        writeWrapped(`Stage Scripture Witnesses: ${stg.coreTexts.join(", ")}`, 9.5, false, 10);
        writeWrapped(`Teaching Prompt: ${stg.prompt}`, 9.5, false, 10);
        y += 5;
      });
      y += 6;

      // 3. Scripture References
      const quotes = topicOverview?.quotedScriptures || [];
      writeWrapped(`3. SCRIPTURE REFERENCES (${quotes.length} PASSAGES)`, 12, true, 0, [180, 130, 40]);
      y += 2;
      quotes.forEach((q, idx) => {
        writeWrapped(`${idx + 1}. ${q.reference} [${q.role || "Biblical Witness"}]`, 10, true, 4);
        writeWrapped(`"${q.text}"`, 9.5, false, 14);
        y += 3;
      });
      y += 6;

      // 4. Ellen White Writings
      const egwList = topicOverview?.egwWritings || [];
      writeWrapped("4. ELLEN G. WHITE WRITINGS (SPIRIT OF PROPHECY)", 12, true, 0, [180, 130, 40]);
      y += 2;
      egwList.forEach((e) => {
        writeWrapped(`${e.work} (${e.source})`, 10, true, 4);
        writeWrapped(`"${e.quote}"`, 9.5, false, 12);
        if (e.theologicalContext) {
          writeWrapped(`Theological Illumination: ${e.theologicalContext}`, 9.5, false, 12);
        }
        y += 4;
      });
      y += 6;

      // 5. Pedagogy & Notes
      const notesList = topicOverview?.explanatoryNotes || [];
      writeWrapped("5. PEDAGOGY, TEACHING EXAMPLES & NOTES", 12, true, 0, [180, 130, 40]);
      y += 2;
      notesList.forEach((n) => {
        writeWrapped(`• ${n.title}`, 10, true, 4);
        writeWrapped(`Biblical / Doctrinal Note: ${n.lexicalOrDoctrinalNote}`, 9.5, false, 12);
        writeWrapped(`How to Explain to Others: ${n.howToExplainToOthers}`, 9.5, false, 12);
        if (n.analogyOrIllustration) {
          writeWrapped(`Teaching Example / Analogy: ${n.analogyOrIllustration}`, 9.5, false, 12);
        }
        y += 4;
      });

      if (blackboardNotes.trim()) {
        y += 4;
        writeWrapped("Student Instructional Notes:", 10.5, true, 0);
        writeWrapped(blackboardNotes.trim(), 9.5, false, 8);
      }

      const safeRef = (topicOverview?.scriptureReference || scripture.reference).replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`STBA_Instructional_Slate_${safeRef}.pdf`);
      setShowBlackboardDownloadMenu(false);
      triggerToast("Instructional Slate downloaded as PDF!");
    } catch (err) {
      console.error("PDF generation error:", err);
      triggerToast("Unable to generate PDF.");
    }
  };

  const handleDownloadBlackboardDocs = () => {
    const quotes = topicOverview?.quotedScriptures || [];
    const egwList = topicOverview?.egwWritings || [];
    const notesList = topicOverview?.explanatoryNotes || [];

    const stagesDocHtml = stagesList
      .map((stg, idx) => {
        const outlineItem = topicOverview?.stagesOutline?.[idx];
        const stageScore = scoreStats.stageScores[stg.id] || 0;
        return `
          <div style="margin-bottom:14px; padding:10px 12px; border:1px solid #d6d3cd; border-left:4px solid #C9973A; background:#faf8f5;">
            <p style="margin:0 0 4px 0; font-weight:bold; font-size:12pt; color:#1C2333;">
              Stage ${stg.number}: ${stg.title} — ${stg.subtitle} ${stageScore > 0 ? `(Score: ${stageScore}%)` : ""}
            </p>
            <p style="margin:0 0 4px 0; font-size:10.5pt;"><strong>Stage Overview:</strong> ${stg.overview}</p>
            ${outlineItem?.focus ? `<p style="margin:0 0 4px 0; font-size:10.5pt;"><strong>Stage Focus:</strong> ${outlineItem.focus}</p>` : ""}
            <p style="margin:0 0 4px 0; font-size:10.5pt;"><strong>Key Stage Scriptures:</strong> ${stg.coreTexts.join(", ")}</p>
            <p style="margin:0; font-size:10.5pt;"><strong>Teaching Prompt:</strong> ${stg.prompt}</p>
          </div>
        `;
      })
      .join("");

    const scripturesDocHtml = quotes
      .map(
        (q, idx) => `
        <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #e5e5e5;">
          <p style="margin:0 0 3px 0; font-weight:bold; color:#1C2333;">${idx + 1}. ${q.reference} ${q.role ? `[${q.role}]` : ""}</p>
          <p style="margin:0; color:#333333;">"${q.text}"</p>
        </div>`
      )
      .join("");

    const egwDocHtml = egwList
      .map(
        (e) => `
        <div style="margin-bottom:12px; padding:10px; background:#f9f6f0; border-left:3px solid #C9973A;">
          <p style="margin:0 0 4px 0; font-weight:bold;">${e.work} (${e.source})</p>
          <p style="margin:0 0 4px 0;">"${e.quote}"</p>
          ${e.theologicalContext ? `<p style="margin:0; font-size:10pt; color:#444;"><strong>Theological Illumination:</strong> ${e.theologicalContext}</p>` : ""}
        </div>`
      )
      .join("");

    const pedagogyDocHtml = notesList
      .map(
        (n) => `
        <div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #e5e5e5;">
          <p style="margin:0 0 4px 0; font-weight:bold; color:#1C2333;">${n.title}</p>
          <p style="margin:0 0 4px 0;"><strong>Biblical / Doctrinal Note:</strong> ${n.lexicalOrDoctrinalNote}</p>
          <p style="margin:0 0 4px 0;"><strong>How to Explain to Others:</strong> ${n.howToExplainToOthers}</p>
          ${n.analogyOrIllustration ? `<p style="margin:0;"><strong>Teaching Analogy:</strong> ${n.analogyOrIllustration}</p>` : ""}
        </div>`
      )
      .join("");

    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${topicOverview?.topicTitle || "Biblical Study"}</title>
      </head>
      <body style="font-family: 'Georgia', serif; color: #1a1a1a; line-height: 1.5; padding: 24px;">
        <p style="font-family: monospace; font-size: 9pt; text-transform: uppercase; color: #C9973A; font-weight: bold; margin: 0;">
          Teach It INTERACTIVE STUDIO • Study To Be Approved
        </p>
        <h1 style="font-size: 20pt; margin: 4px 0 6px 0; color: #1C2333;">${topicOverview?.topicTitle || "Biblical Study"}</h1>
        <p style="font-size: 11pt; color: #555; margin: 0 0 18px 0;">
          <strong>Active Topic:</strong> ${topicOverview?.scriptureReference || scripture.reference} • <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </p>

        <h2 style="font-size: 14pt; color: #C9973A; border-bottom: 1px solid #C9973A; padding-bottom: 4px;">1. Theological & Prophetic Overview</h2>
        <p><strong>Historical, Cultural & Theological Setting:</strong><br/>${topicOverview?.historicalContext || ""}</p>
        <p><strong>Critical Importance for the Last Days:</strong><br/>${topicOverview?.lastDaysImportance || ""}</p>

        <h2 style="font-size: 14pt; color: #C9973A; border-bottom: 1px solid #C9973A; padding-bottom: 4px; margin-top: 20px;">2. Stage-by-Stage Instructional Content</h2>
        ${stagesDocHtml}

        <h2 style="font-size: 14pt; color: #C9973A; border-bottom: 1px solid #C9973A; padding-bottom: 4px; margin-top: 20px;">3. Scripture References (${quotes.length} Passages)</h2>
        ${scripturesDocHtml}

        <h2 style="font-size: 14pt; color: #C9973A; border-bottom: 1px solid #C9973A; padding-bottom: 4px; margin-top: 20px;">4. Ellen White's Writings (Spirit of Prophecy)</h2>
        ${egwDocHtml}

        <h2 style="font-size: 14pt; color: #C9973A; border-bottom: 1px solid #C9973A; padding-bottom: 4px; margin-top: 20px;">5. Pedagogy & Notes</h2>
        ${pedagogyDocHtml}
        ${blackboardNotes.trim() ? `<h3>Student Instructional Notes</h3><p>${blackboardNotes.replace(/\n/g, "<br/>")}</p>` : ""}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", docContent], {
      type: "application/msword;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeRef = (topicOverview?.scriptureReference || scripture.reference).replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `STBA_Instructional_Slate_${safeRef}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowBlackboardDownloadMenu(false);
    triggerToast("Instructional Slate downloaded as DOCS (.doc)!");
  };

  // Teach-It Elder Stephen elements
  const [teachingDraftOutline, setTeachingDraftOutline] = useState(() => {
    return localStorage.getItem(`stba_teach_it_outline_${scripture.id}`) || 
      `1. Big Idea: Tracing covenant relationships\n2. Key Text Exposition: "${scripture.text}"\n3. Critical Illustrations\n4. Life Transition & Appeals`;
  });
  const [targetAudience, setTargetAudience] = useState<"Child" | "New Believer" | "Mature Student">("New Believer");
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [outlineFeedback, setOutlineFeedback] = useState("");

  const handleGenerateOutlineWithElder = async () => {
    if (!hasTierAccess("Leader")) {
      openUpgradeModal("Leader", "Homiletic Teaching Outline Verification");
      return;
    }
    if (!teachingDraftOutline.trim()) return;
    setIsGeneratingOutline(true);
    setOutlineFeedback("");
    try {
      const historyLog = chatMessages.map(m => ({
        role: (m.sender === "user" ? "user" : "elder") as "user" | "elder" | "model",
        text: m.text
      }));

      const payload = {
        currentMode: 'Teach It' as const,
        noteTitle: `Teaching Outline: ${scripture.reference}`,
        noteContent: teachingDraftOutline,
        historyLog,
        passage: topicOverview?.scriptureReference || scripture.reference || "Active Study Topic",
        outline: teachingDraftOutline,
        audience: targetAudience,
        userAction: 'teach_it_outline' as const
      };

      const res = await callElderStephen(payload);
      if (res && res.text) {
        setOutlineFeedback(res.text);
      }
    } catch (e) {
      console.error("Failed to generate/evaluate teach outline:", e);
    } finally {
      setIsGeneratingOutline(false);
    }
  };
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Chat message engine
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Speech Recognition engine
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Real-time Scorecard stats (aligned dynamically to the active conversational topic)
  const [scoreStats, setScoreStats] = useState({
    overallScore: 0,
    stageScores: {
      stage1: 0,
      stage2: 0,
      stage3: 0,
      stage4: 0,
      stage5: 0
    } as Record<string, number>,
    foundKeywords: [] as string[],
    gaps: scripture.keywords || [],
    stageFeedback: {
      stage1: "Awaiting foundational overview...",
      stage2: "Awaiting Great Controversy insights...",
      stage3: "Awaiting doctrinal connections...",
      stage4: "Awaiting practical application...",
      stage5: "Awaiting personal invitation & appeal..."
    } as Record<string, string>,
    ellenWhiteQuote: "The Bible is its own expositor. Scripture is to be compared with scripture.",
    devotionalPrompt: "What is God asking you to trust, release, or practice today from this study?"
  });

  const [devotionalReflection, setDevotionalReflection] = useState<string>("");
  const [hasSavedReflection, setHasSavedReflection] = useState<boolean>(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(new Array(16).fill(6));

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stageSelectorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active stage selector button into center on mobile
  useEffect(() => {
    if (stageSelectorRef.current) {
      const activeEl = stageSelectorRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [phase]);

  // Gemini Live Voice variables & states
  const [useLiveVoiceAPI, setUseLiveVoiceAPI] = useState<boolean>(true);
  const [liveWebSocketActive, setLiveWebSocketActive] = useState<boolean>(false);
  const [liveState, setLiveState] = useState<"idle" | "connecting" | "ready" | "recording" | "playing" | "error">("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveBarTranscript, setLiveBarTranscript] = useState<string>("");
  const stage5CompletedRef = useRef<boolean>(false);
  const [activeFundamentalBelief, setActiveFundamentalBelief] = useState<FundamentalBeliefData | null>(null);
  const [publicReadinessScore, setPublicReadinessScore] = useState<number>(88);
  const [evangelistTips, setEvangelistTips] = useState<string[]>([
    "Lead with Christ and His character of love before presenting distinctive doctrinal frameworks.",
    "Translate theological terms into clear, accessible language for non-Adventist listeners.",
    "Appeal directly to Scripture as fellow Bereans, encouraging personal study and conviction."
  ]);
  const [activeGapFilter, setActiveGapFilter] = useState<boolean>(false);

  // Strict Clean Slate: Initial topicOverview is null until explicitly pushed via structured tool updates
  const [topicOverview, setTopicOverview] = useState<TopicOverviewData | null>(null);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState<boolean>(true);

  // Dynamically align activeScripture keywords with the user's chosen conversational topic (without pre-seeding topicOverview)
  const syncConversationalTopic = (rawInput: string) => {
    const trimmed = (rawInput || "").trim();
    if (!trimmed || trimmed.length < 3) return;
    const lower = trimmed.toLowerCase();

    // 1. Check explicit scripture reference (e.g., John 3:16, Exodus 20:8-11, Daniel 8:14)
    const refMatch = trimmed.match(/\b([1-3]?\s*[A-Za-z]+)\s+(\d+:\d+(?:[–-]\d+)?)\b/i);
    if (refMatch) {
      const detectedRef = refMatch[0].trim();
      bibleService.getText(detectedRef, "KJV").then((fetchedText) => {
        const validText =
          fetchedText && !fetchedText.includes("Invalid scripture")
            ? fetchedText
            : `Study of ${detectedRef} in its biblical and doctrinal context.`;
        const cleanWords = validText
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .split(/\s+/)
          .map((w) => w.toLowerCase())
          .filter((w) => w.length > 4 && !["shall", "there", "which", "their", "unto", "wherefore"].includes(w));
        const keywords = Array.from(new Set(cleanWords)).slice(0, 6);
        setActiveScripture({
          id: detectedRef.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          reference: detectedRef,
          text: validText,
          keywords: keywords.length > 0 ? keywords : ["scripture", "covenant", "christ", "truth", "obedience"]
        });
      }).catch(() => {
        setActiveScripture({
          id: detectedRef.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          reference: detectedRef,
          text: `Biblical study centered on ${detectedRef}.`,
          keywords: ["scripture", "covenant", "christ", "truth", "obedience"]
        });
      });
      return;
    }

    // 2. Check core doctrinal topics mentioned in conversation
    if (lower.includes("sabbath") || lower.includes("fourth commandment") || lower.includes("seventh day")) {
      setActiveScripture({
        id: "sabbath-topic",
        reference: "Exodus 20:8–11",
        text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God.",
        keywords: ["remember", "sabbath", "holy", "creator", "rested", "sanctified"]
      });
      setActiveFundamentalBelief(FUNDAMENTAL_BELIEFS_CATALOG["sabbath"]);
    } else if (lower.includes("sanctuary") || lower.includes("investigative judgment") || lower.includes("1844") || lower.includes("atonement")) {
      setActiveScripture({
        id: "sanctuary-topic",
        reference: "Daniel 8:14",
        text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        keywords: ["sanctuary", "cleansed", "high priest", "atonement", "judgment", "intercession"]
      });
      setActiveFundamentalBelief(FUNDAMENTAL_BELIEFS_CATALOG["sanctuary"]);
    } else if (lower.includes("second coming") || lower.includes("blessed hope") || lower.includes("christ's return") || lower.includes("rapture")) {
      setActiveScripture({
        id: "second-coming-topic",
        reference: "Titus 2:13",
        text: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
        keywords: ["blessed hope", "appearing", "clouds", "resurrection", "trumpet", "visible"]
      });
      setActiveFundamentalBelief(FUNDAMENTAL_BELIEFS_CATALOG["second-coming"]);
    } else if (lower.includes("state of the dead") || lower.includes("death") || lower.includes("resurrection") || lower.includes("immortality")) {
      setActiveScripture({
        id: "state-of-dead-topic",
        reference: "Ecclesiastes 9:5–6",
        text: "For the living know that they shall die: but the dead know not any thing, neither have they any more a reward.",
        keywords: ["sleep", "resurrection", "breath", "living soul", "immortality", "victory"]
      });
    } else if (activeScripture.reference === "Active Study Topic" && trimmed.length <= 80) {
      const cleanedTopic = trimmed.replace(/^(let'?s\s+(?:study|discuss|talk\s+about|explore)|i\s+want\s+to\s+(?:study|discuss|learn\s+about)|topic:?)\s+/i, "").trim();
      if (cleanedTopic.length >= 3) {
        const topicWords = cleanedTopic
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .split(/\s+/)
          .map((w) => w.toLowerCase())
          .filter((w) => w.length > 3);
        const dynamicKeywords = Array.from(new Set([...topicWords, "scripture", "christ", "covenant", "application"])).slice(0, 6);
        setActiveScripture({
          id: cleanedTopic.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 32),
          reference: cleanedTopic,
          text: `Conversational Bible study focused on ${cleanedTopic}, comparing Scripture with Scripture.`,
          keywords: dynamicKeywords
        });
      }
    }
  };

  // Strict State-Gated Disclosure States (bound exclusively to post-speech tool accumulation)
  const [isSlateCollapsed, setIsSlateCollapsed] = useState<boolean>(true);
  const [verifiedTurnCount, setVerifiedTurnCount] = useState<number>(0);
  const [unlockedStageCount, setUnlockedStageCount] = useState<number>(0);
  const hasUserRespondedRef = useRef<boolean>(false);

  // Accumulator for structured tool events (setTopicOverview & advanceExegesisStage) flushed strictly post-speech
  const pendingToolUpdatesRef = useRef<{
    topicOverview?: TopicOverviewData;
    stageAdvance?: {
      evaluatedStage: number;
      score: number;
      nextStage: number;
      feedback?: string;
      fundamentalBelief?: FundamentalBeliefData;
      gaps?: string;
      publicReadinessScore?: number;
      evangelistTips?: string[];
    };
  }>({});
  const serverTurnCompleteRef = useRef<boolean>(false);

  // Strict completion handler: no automatic/optimistic stage advancement; stage progression ONLY advances via explicit tool updates
  const recordVerifiedTurnCompletion = (options?: { unlockUpToStage?: number; uncollapseSlate?: boolean }) => {
    setVerifiedTurnCount((prev) => prev + 1);
    if (options?.uncollapseSlate) {
      setIsSlateCollapsed(false);
    }
    if (options?.unlockUpToStage !== undefined) {
      setIsSlateCollapsed(false);
      setUnlockedStageCount((prev) => Math.min(5, Math.max(prev, options.unlockUpToStage!)));
    }
  };

  // Always start instructional area from the very top when switching tabs or topics
  useEffect(() => {
    if (blackboardScrollRef.current) {
      blackboardScrollRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [blackboardView, topicOverview, phase]);

  // Clean exit navigation: Returns to start session screen if in an active session, or to dashboard if on start screen
  const handleExitStudio = () => {
    clearSequentialTimers();
    cleanupLiveAudioAndWS();
    stopVoiceResponse();
    clearIntervals();
    setIsTimerActive(false);
    setIsPaused(false);
    setIsSlateCollapsed(true);
    setVerifiedTurnCount(0);
    setUnlockedStageCount(0);
    setTopicOverview(null);
    pendingToolUpdatesRef.current = {};
    serverTurnCompleteRef.current = false;
    hasUserRespondedRef.current = false;
    if (phase !== "intro") {
      setPhase("intro");
      setChatMessages([]);
      triggerToast("Returned to Start Session screen.");
    } else {
      onClose(); // Navigates to /dashboard
    }
  };

  // 15-Minute Timer & 3-Minute Stage Pace Calculations (900 seconds total, 180s per stage)
  const getStagePaceDetails = () => {
    const activeStageNum = activeStage?.number || 1;
    const stageEndRemaining = 900 - (activeStageNum * 180);
    const stageTimeLeft = Math.max(0, Math.min(180, secondsRemaining - stageEndRemaining));
    const mins = Math.floor(stageTimeLeft / 60);
    const secs = stageTimeLeft % 60;
    return {
      activeStageNum,
      stageTimeLeftFormatted: `${mins}:${secs.toString().padStart(2, "0")}`,
      isOvertime: secondsRemaining < stageEndRemaining
    };
  };

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const activeNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const currentLiveReplyTextRef = useRef<string>("");
  const currentLiveReplyIdRef = useRef<string | null>(null);
  const currentUserTranscriptTextRef = useRef<string>("");
  const currentUserTranscriptIdRef = useRef<string | null>(null);

  const phaseRef = useRef<PhaseType>(phase);
  const scoreStatsRef = useRef(scoreStats);
  const evaluatedStagesLiveRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    scoreStatsRef.current = scoreStats;
  }, [scoreStats]);

  // Helper float to 16bit PCM
  const floatTo16BitPCM = (floatSamples: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(floatSamples.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < floatSamples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, floatSamples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  // Helper convert arraybuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const clearPlaybackQueue = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // Already ended or stopped
      }
    });
    activeNodesRef.current = [];
    nextStartTimeRef.current = 0;
  };

  const cleanupLiveAudioAndWS = () => {
    setLiveWebSocketActive(false);
    setLiveState("idle");
    
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      micStreamRef.current = null;
    }
    clearPlaybackQueue();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const resolveUserName = (): string => {
    if (user?.name) return user.name;
    if ((user as any)?.displayName) return (user as any).displayName;
    try {
      const savedProfile = localStorage.getItem("stba_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name) return parsed.name;
        if (parsed?.displayName) return parsed.displayName;
      }
    } catch (e) {}
    return "Berean";
  };

  const hasReceivedLiveAudioRef = useRef<boolean>(false);
  const hasCompletedOpeningGreetingRef = useRef<boolean>(false);

  const appendLiveReplyChunk = (chunk: string) => {
    currentLiveReplyTextRef.current += chunk;
    const currentId = currentLiveReplyIdRef.current;

    // NOTE: Regex-based stage advancement during streaming chunks is disabled.
    // Stage progression and content disclosure are bound exclusively to post-speech tool events.

    setChatMessages((prev) => {
      if (currentId && prev.some((m) => m.id === currentId)) {
        return prev.map((m) => {
          if (m.id === currentId) {
            return { ...m, text: currentLiveReplyTextRef.current };
          }
          return m;
        });
      } else if (prev.length === 1 && prev[0].id.startsWith("prompt-init-")) {
        // Stream Elder Steven's live spoken opening greeting directly into the initial greeting bubble
        const initId = prev[0].id;
        currentLiveReplyIdRef.current = initId;
        return [
          {
            ...prev[0],
            text: currentLiveReplyTextRef.current.trim()
          }
        ];
      } else {
        const id = `live-ai-${Date.now()}`;
        currentLiveReplyIdRef.current = id;
        return [
          ...prev,
          {
            id,
            sender: "ai",
            text: currentLiveReplyTextRef.current,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  // Strictly post-speech tool accumulation flush: executes ONLY when audio playback drains
  const endLiveReplyAccumulation = () => {
    hasCompletedOpeningGreetingRef.current = true;
    currentLiveReplyTextRef.current = "";
    currentLiveReplyIdRef.current = null;
    serverTurnCompleteRef.current = false;

    const pendingTopic = pendingToolUpdatesRef.current.topicOverview;
    const pendingAdvance = pendingToolUpdatesRef.current.stageAdvance;
    pendingToolUpdatesRef.current = {};

    if (pendingTopic) {
      setTopicOverview((prev) => ({
        ...(prev || {
          topicTitle: "",
          scriptureReference: "",
          historicalContext: "",
          quotedScriptures: [],
          egwWritings: [],
          explanatoryNotes: [],
          lastDaysImportance: "",
          stagesOutline: []
        }),
        ...pendingTopic
      }));
      if (pendingTopic.scriptureReference) {
        setActiveScripture((prev) => ({
          ...prev,
          reference: pendingTopic.scriptureReference,
          text: pendingTopic.quotedScriptures?.[0]?.text || prev.text
        }));
      }
      // Explicitly uncollapse slate and unlock Stage 1 overview & module post-speech when topicOverview tool is pushed
      recordVerifiedTurnCompletion({ unlockUpToStage: 1, uncollapseSlate: true });
      triggerToast("Elder Steven updated the Active Study Topic!");
    }

    if (pendingAdvance) {
      const evaluatedIdx = (pendingAdvance.evaluatedStage || 1) - 1;
      const score = pendingAdvance.score || 90;
      if (pendingAdvance.fundamentalBelief) {
        setActiveFundamentalBelief(pendingAdvance.fundamentalBelief);
      }
      if (pendingAdvance.publicReadinessScore) {
        setPublicReadinessScore(pendingAdvance.publicReadinessScore);
      }
      if (pendingAdvance.evangelistTips && Array.isArray(pendingAdvance.evangelistTips)) {
        setEvangelistTips(pendingAdvance.evangelistTips);
      }
      if (pendingAdvance.evaluatedStage === 5) {
        stage5CompletedRef.current = true;
      }
      triggerAutoAdvanceToNextStage(evaluatedIdx, score, {
        stageFeedback: pendingAdvance.feedback
      });
    }
  };

  const appendUserTranscriptChunk = (chunk: string) => {
    hasUserRespondedRef.current = true;
    currentUserTranscriptTextRef.current += chunk;
    syncConversationalTopic(currentUserTranscriptTextRef.current);
    const currentId = currentUserTranscriptIdRef.current;
    setChatMessages((prev) => {
      if (currentId && prev.some((m) => m.id === currentId)) {
        return prev.map((m) => {
          if (m.id === currentId) {
            return { ...m, text: currentUserTranscriptTextRef.current };
          }
          return m;
        });
      } else {
        const id = `usr-live-${Date.now()}`;
        currentUserTranscriptIdRef.current = id;
        return [
          ...prev,
          {
            id,
            sender: "user",
            text: currentUserTranscriptTextRef.current,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const playPCMChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        initializeAudioContext();
      }
      const ctx = outputAudioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataView = new DataView(bytes.buffer);
      const samplesCount = len / 2;
      const floatSamples = new Float32Array(samplesCount);
      for (let i = 0; i < samplesCount; i++) {
        const intSample = dataView.getInt16(i * 2, true);
        floatSamples[i] = intSample / 32768;
      }
      
      const buffer = ctx.createBuffer(1, samplesCount, 24000);
      buffer.copyToChannel(floatSamples, 0);
      
      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(ctx.destination);
      
      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05; // tiny latency gap
      }
      
      sourceNode.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      
      activeNodesRef.current.push(sourceNode);
      sourceNode.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter((n) => n !== sourceNode);
        if (activeNodesRef.current.length === 0) {
          setLiveState("ready");
          endLiveReplyAccumulation();
          if (stage5CompletedRef.current && phaseRef.current !== "feedback") {
            setTimeout(() => {
              handleAdvanceToScorecard(true);
            }, 800);
          }
        }
      };
    } catch (err) {
      console.error("Failed to parse or play incoming live audio PCM:", err);
    }
  };

  const startGeminiLiveSession = async () => {
    try {
      setLiveState("connecting");
      setLiveError(null);
      
      const isHttps = window.location.protocol === "https:";
      const protocol = isHttps ? "wss:" : "ws:";
      const stateDoctrine = location.state?.doctrineId || "";
      const stateLesson = location.state?.lessonId || "";
      
      const userName = resolveUserName();
      
      const queryParams = new URLSearchParams();
      queryParams.set("mode", "teach");
      if (stateDoctrine) queryParams.set("doctrineId", stateDoctrine);
      if (stateLesson) queryParams.set("lessonId", stateLesson);
      queryParams.set("userName", userName);
      queryParams.set("learningTier", learningTier);
      if (scripture?.reference) queryParams.set("reference", scripture.reference);
      if (scripture?.text) queryParams.set("passageText", scripture.text);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const wsUrl = `${protocol}//${window.location.host}/api/teach/live${queryString}`;
      
      console.log("[STBA Live Voice Debug] Establishing link:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[STBA Live Voice Debug] Handshake completed successfully!");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.error) {
            console.error("[STBA Live Voice Debug] Server message failure:", msg.error);
            setLiveError(msg.error);
            setLiveState("error");
            triggerToast(msg.error);
            ws.close();
            return;
          }

          if (msg.ready) {
            console.log("[STBA Live Voice Debug] Live engine linked up!");
            setLiveState("ready");
            setLiveWebSocketActive(true);
            triggerToast("STBA Live bidirectional voice session initiated!");
            
            // Unmute/resume AudioContext and active microphone input
            initializeAudioContext();
            startMicCapture();
            return;
          }

          if (msg.userTranscript) {
            appendUserTranscriptChunk(msg.userTranscript);
            setLiveBarTranscript(`You: ${msg.userTranscript}`);
          }

          if (msg.audio) {
            hasReceivedLiveAudioRef.current = true;
            currentUserTranscriptIdRef.current = null;
            currentUserTranscriptTextRef.current = "";
            setLiveState("playing");
            playPCMChunk(msg.audio);
          }

          if (msg.text) {
            hasReceivedLiveAudioRef.current = true;
            setLiveState("playing");
            appendLiveReplyChunk(msg.text);
            setLiveBarTranscript(`Elder Steven: ${msg.text}`);
          }

          // Accumulate structured tool updates to be flushed strictly post-speech
          if (msg.topicOverview) {
            console.log("[STBA Live Voice Debug] topicOverview queued for post-speech flush:", msg.topicOverview);
            pendingToolUpdatesRef.current.topicOverview = msg.topicOverview;
            if (activeNodesRef.current.length === 0 && serverTurnCompleteRef.current) {
              endLiveReplyAccumulation();
            }
          }

          if (msg.stageAdvance) {
            console.log("[STBA Live Voice Debug] stageAdvance queued for post-speech flush:", msg.stageAdvance);
            pendingToolUpdatesRef.current.stageAdvance = msg.stageAdvance;
            if (activeNodesRef.current.length === 0 && serverTurnCompleteRef.current) {
              endLiveReplyAccumulation();
            }
          }

          // Do NOT auto-increment turn or unlock stages when turnComplete arrives while audio is still playing
          if (msg.turnComplete) {
            serverTurnCompleteRef.current = true;
            if (activeNodesRef.current.length === 0) {
              endLiveReplyAccumulation();
            }
          }

          if (msg.interrupted) {
            console.log("[STBA Live Voice Debug] Interrupt requested.");
            clearPlaybackQueue();
            setLiveState("ready");
          }
          
          if (msg.closed) {
            console.log("[STBA Live Voice Debug] Connection completed.");
            const hadAudio = hasReceivedLiveAudioRef.current;
            cleanupLiveAudioAndWS();
            if (!hadAudio && isAudioPrompterEnabled) {
              triggerVoiceResponse(
                `Hello ${userName ? `${userName}, ` : ""}I am Elder Steven, your Bible study mentor. What topic would you like to discuss today?`,
                true
              );
            }
          }

        } catch (err) {
          console.error("Live translation extract exception:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("Live Voice Socket generic error:", e);
        setLiveError("Trouble connecting. Keep settings checked.");
        setLiveState("error");
        if (!hasReceivedLiveAudioRef.current && isAudioPrompterEnabled) {
          triggerVoiceResponse(
            `Hello ${userName ? `${userName}, ` : ""}I am Elder Steven, your Bible study mentor. What topic would you like to discuss today?`,
            true
          );
        }
      };

      ws.onclose = () => {
        console.log("Live Voice Socket closed.");
        const hadAudio = hasReceivedLiveAudioRef.current;
        cleanupLiveAudioAndWS();
        if (!hadAudio && isAudioPrompterEnabled) {
          triggerVoiceResponse(
            `Hello ${userName ? `${userName}, ` : ""}I am Elder Steven, your Bible study mentor. What topic would you like to discuss today?`,
            true
          );
        }
      };

    } catch (err: any) {
      console.error("Connection establish aborted:", err);
      setLiveError(err.message || "Unspecified connection exception");
      setLiveState("error");
    }
  };

  const initializeAudioContext = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!inputAudioCtxRef.current) {
      inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });
    }
    if (inputAudioCtxRef.current.state === "suspended") {
      inputAudioCtxRef.current.resume();
    }

    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    if (outputAudioCtxRef.current.state === "suspended") {
      outputAudioCtxRef.current.resume();
    }
    nextStartTimeRef.current = 0;
  };

  const startMicCapture = async () => {
    try {
      initializeAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ctx = inputAudioCtxRef.current!;
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(ctx.destination);

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        // Avoid streaming ambient mic noise while Elder Steven is delivering his initial greeting
        if (!hasCompletedOpeningGreetingRef.current && activeNodesRef.current.length > 0) {
          return;
        }
        
        const floatSamples = e.inputBuffer.getChannelData(0);
        
        let sum = 0;
        for (let i = 0; i < floatSamples.length; i++) {
          sum += floatSamples[i] * floatSamples[i];
        }
        const rms = Math.sqrt(sum / floatSamples.length);
        
        if (rms > 0.015) {
          setLiveState("recording");
          setWaveHeights((prev) => prev.map(() => Math.max(6, Math.floor(rms * 150))));
        } else {
          setWaveHeights((prev) => prev.map(() => Math.max(6, Math.floor(Math.random() * 4) + 4)));
        }

        const pcmBuffer = floatTo16BitPCM(floatSamples);
        const base64 = arrayBufferToBase64(pcmBuffer);
        
        wsRef.current.send(JSON.stringify({ audio: base64 }));
      };

    } catch (err: any) {
      console.warn("Microphone capture unavailable (Elder Steven Live voice output and text chat remain active):", err);
      setIsRecording(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

  const stopVoiceResponse = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (ttsAbortRef.current) {
      try {
        ttsAbortRef.current.abort();
      } catch (_) {}
      ttsAbortRef.current = null;
    }
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = "";
      } catch (_) {}
      ttsAudioRef.current = null;
    }
    clearPlaybackQueue();
  };

  // Elder Steven voice synthesis ("Charon" voice)
  const triggerVoiceResponse = async (rawText: string, forcePlay: boolean = false) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (!isAudioPrompterEnabled) return;
    // If bidirectional Gemini Live WebSocket is actively streaming voice, avoid overlapping audio unless forced as fallback
    if (liveWebSocketActive && !forcePlay) return;

    const cleanText = (rawText || "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#+\s*/g, "")
      .replace(/`+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    if (ttsAbortRef.current) {
      try {
        ttsAbortRef.current.abort();
      } catch (_) {}
    }
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = "";
      } catch (_) {}
      ttsAudioRef.current = null;
    }

    const controller = new AbortController();
    ttsAbortRef.current = controller;

    try {
      setLiveState("playing");
      const res = await fetch("/api/study/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText.slice(0, 900),
          voice: "Charon"
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        setLiveState("idle");
        return;
      }

      const data = await res.json();
      if ((!data?.audio && !data?.wavAudio) || controller.signal.aborted) {
        setLiveState("idle");
        return;
      }

      if (data.audio) {
        // Play raw 24kHz 16-bit PCM directly through the unlocked Web Audio API context
        playPCMChunk(data.audio);
        return;
      }

      const audioSrc = `data:${data.mimeType || "audio/wav"};base64,${data.wavAudio || data.audio}`;
      const audio = new Audio(audioSrc);
      ttsAudioRef.current = audio;

      audio.onended = () => {
        if (ttsAudioRef.current === audio) {
          ttsAudioRef.current = null;
          setLiveState((prev) => (prev === "playing" ? "idle" : prev));
          endLiveReplyAccumulation();
        }
      };
      audio.onerror = () => {
        if (ttsAudioRef.current === audio) {
          ttsAudioRef.current = null;
          setLiveState((prev) => (prev === "playing" ? "idle" : prev));
        }
      };

      await audio.play();
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.warn("Elder Steven voice playback note:", err);
      }
      setLiveState((prev) => (prev === "playing" ? "idle" : prev));
    }
  };

  // Manage steps — Slow and methodical 5-stage learning progression
  const primaryRefForStage1 =
    topicOverview?.scriptureReference && topicOverview.scriptureReference !== "Selected in Dialogue"
      ? topicOverview.scriptureReference
      : "Isaiah 28:9-10";

  const stagesList = [
    {
      id: "stage1" as PhaseType,
      number: 1,
      title: "Foundational Overview",
      subtitle: "Stage 1 • Introduces foundational concepts",
      icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      overview: "Stage 1 introduces foundational concepts of the active topic in its immediate biblical setting, establishing core scriptural terms and central truth before moving into deeper layers.",
      coreTexts: Array.from(new Set([primaryRefForStage1, "Isaiah 28:9-10", "Nehemiah 8:8", "Acts 17:11"])),
      prompt: "What foundational concept stands out to you in this study? Share in your own words what the passage is introducing."
    },
    {
      id: "stage2" as PhaseType,
      number: 2,
      title: "The Great Controversy",
      subtitle: "Stage 2 • Deepens understanding through cosmic & redemptive context",
      icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
      overview: "Stage 2 deepens understanding by examining original biblical nuances, authorial intent, and how this truth illuminates the Great Controversy between Christ and Satan.",
      coreTexts: ["Genesis 3:15", "Revelation 12:7-9", "Job 1:6-12", "Revelation 14:6-12"],
      prompt: "Looking closer at the biblical context, how does this truth deepen our view of God's character in the Great Controversy?"
    },
    {
      id: "stage3" as PhaseType,
      number: 3,
      title: "Doctrine",
      subtitle: "Stage 3 • Explores historical & doctrinal context",
      icon: <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />,
      overview: "Stage 3 explores the historical setting and connects the topic line-upon-line to the harmonious system of Seventh-day Adventist Fundamental Beliefs.",
      coreTexts: ["2 Timothy 3:16-17", "Exodus 20:8-11", "Daniel 8:14", "Revelation 14:12"],
      prompt: "How does the historical context of this study anchor and clarify a core Seventh-day Adventist Fundamental Belief?"
    },
    {
      id: "stage4" as PhaseType,
      number: 4,
      title: "Application",
      subtitle: "Stage 4 • Connects principles to practical application",
      icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
      overview: "Stage 4 connects theological principles to practical daily living—translating doctrinal conviction into concrete habits, character growth, and sanctification.",
      coreTexts: ["Romans 12:1-2", "James 1:22-25", "Philippians 2:12-13", "1 John 3:18"],
      prompt: "How can we connect this principle to practical daily life? What concrete step does this truth call us to practice today?"
    },
    {
      id: "stage5" as PhaseType,
      number: 5,
      title: "Invitation",
      subtitle: "Stage 5 • Invites reflection & personal commitment",
      icon: <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      overview: "Stage 5 invites heartfelt reflection, personal commitment to Christ, and a gentle, winsome appeal to share this truth with others (1 Peter 3:15).",
      coreTexts: ["1 Peter 3:15", "Colossians 4:5-6", "2 Timothy 2:24-25", "Acts 26:28-29"],
      prompt: "As you reflect on our study together, what personal commitment is God placing on your heart—and how would you gently invite a friend to consider this truth?"
    }
  ];

  const getActiveBelief = (): FundamentalBeliefData => {
    if (activeFundamentalBelief) {
      return {
        number: activeFundamentalBelief.number || 1,
        title: activeFundamentalBelief.title || "The Holy Scriptures",
        summary: activeFundamentalBelief.summary || FUNDAMENTAL_BELIEFS_CATALOG["holy-scriptures"].summary,
        egwQuote: activeFundamentalBelief.egwQuote || FUNDAMENTAL_BELIEFS_CATALOG["holy-scriptures"].egwQuote,
        keyTexts: activeFundamentalBelief.keyTexts || FUNDAMENTAL_BELIEFS_CATALOG["holy-scriptures"].keyTexts
      };
    }
    if (isFromBelief1) return FUNDAMENTAL_BELIEFS_CATALOG["holy-scriptures"];
    if (stateDoctrine && FUNDAMENTAL_BELIEFS_CATALOG[stateDoctrine]) {
      return FUNDAMENTAL_BELIEFS_CATALOG[stateDoctrine];
    }
    return FUNDAMENTAL_BELIEFS_CATALOG["holy-scriptures"];
  };

  const getStageWithMostGaps = () => {
    let minScore = 101;
    let worstStage = stagesList[0];
    stagesList.forEach((st) => {
      const sc = scoreStats.stageScores[st.id] ?? 0;
      if (sc < minScore) {
        minScore = sc;
        worstStage = st;
      }
    });
    return {
      stage: worstStage,
      score: minScore === 101 ? 75 : minScore,
      feedback: scoreStats.stageFeedback[worstStage.id] || "This stage showed the greatest opportunity for deeper scriptural evidence and clearer explanation."
    };
  };

  const renderHighlightedScriptureText = (text: string, foundKeywords: string[], gaps: string[]) => {
    if (!text) return null;
    const foundSet = new Set((foundKeywords || []).map((k) => k.toLowerCase().trim()));
    const gapsSet = new Set((gaps || []).map((g) => g.toLowerCase().trim()));

    // Split text by word boundaries
    const tokens = text.split(/(\s+|[.,;!?]+)/);

    return (
      <div className="font-serif text-sm sm:text-base text-stone-200 leading-relaxed select-text p-4 bg-white/5 border border-white/10 rounded-xl">
        {tokens.map((chunk, idx) => {
          const clean = chunk.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (!clean) return <span key={idx}>{chunk}</span>;

          const isFound = Array.from(foundSet).some((kw) => kw.includes(clean) || clean.includes(kw));
          const isGap = !isFound && Array.from(gapsSet).some((g) => g.includes(clean) || clean.includes(g));

          if (isFound) {
            return (
              <span
                key={idx}
                className="bg-[#C9973A]/30 text-amber-200 border-b-2 border-[#C9973A] px-1 py-0.5 rounded font-bold shadow-sm inline-block mx-0.5"
                title="Theological Keyword Mastered"
              >
                {chunk}
              </span>
            );
          }

          if (isGap) {
            return (
              <span
                key={idx}
                className="bg-red-500/20 text-red-300 border-b-2 border-dashed border-red-400/80 px-1 py-0.5 rounded font-semibold inline-block mx-0.5"
                title="Key Theological Gap - Needs Greater Coverage"
              >
                {chunk}
              </span>
            );
          }

          return <span key={idx}>{chunk}</span>;
        })}
      </div>
    );
  };

  const getCurrentStageIndex = (): number => {
    if (phase === "stage1") return 0;
    if (phase === "stage2") return 1;
    if (phase === "stage3") return 2;
    if (phase === "stage4") return 3;
    if (phase === "stage5") return 4;
    return -1;
  };

  const activeStageIndex = getCurrentStageIndex();
  const activeStage = activeStageIndex !== -1 ? stagesList[activeStageIndex] : null;
  const completedStagesCount = stagesList.filter(
    (st) => (scoreStats.stageScores[st.id] || 0) > 0
  ).length;
  const hasActiveDialogue = chatMessages.length > 0;
  // Strict Blackboard gate: Right pane remains completely blank (rendering ONLY the top persistent header)
  // until a user message initializes a new dialogue session
  const hasUserInitializedSession = chatMessages.some((m) => m.sender === "user");

  // Cleanup synthesis and timers
  useEffect(() => {
    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript || interimTranscript) {
          setUserInput((prev) => {
            const base = prev.trim();
            const addition = (finalTranscript || interimTranscript).trim();
            return base ? `${base} ${addition}` : addition;
          });
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      clearIntervals();
      stopVoiceResponse();
      cleanupLiveAudioAndWS();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const hasAutoStartedRef = useRef(false);

  // Auto-start Gemini Live session when navigating from "Explain Doctrine with AI"
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    const searchParams = new URLSearchParams(location.search);
    const autoLiveParam = searchParams.get("autoLive") === "true";
    const stateAutoLive = location.state?.autoLive;

    const isAutoLiveRequested = autoLiveParam || Boolean(stateAutoLive);

    if (isAutoLiveRequested) {
      hasAutoStartedRef.current = true;
      setUseLiveVoiceAPI(true);
      setTimeout(() => {
        handleBeginSession();
      }, 150);
    }
  }, [location.search, location.state]);

  const clearIntervals = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
  };

  // Maintain bottom-anchored chat stream: automatically pin scroll to bottom as messages append upward
  useEffect(() => {
    if (chatContainerRef.current) {
      const el = chatContainerRef.current;
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [chatMessages, isLoading]);

  // Main countdown timer loop - strictly begins when isTimerActive is true
  useEffect(() => {
    if (!isTimerActive || phase === "intro" || phase === "feedback" || isPaused) {
      clearIntervals();
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearIntervals();
          triggerToast("Session time expired! Compiling report...");
          handleAdvanceToScorecard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    waveIntervalRef.current = setInterval(() => {
      setWaveHeights(
        Array.from({ length: 16 }, () => {
          if (isRecording) {
            return Math.floor(Math.random() * 32) + 12;
          }
          if (isLoading) {
            return Math.floor(Math.random() * 16) + 4;
          }
          return Math.floor(Math.random() * 4) + 4;
        })
      );
    }, 100);

    return () => clearIntervals();
  }, [isTimerActive, phase, isPaused, isRecording, isLoading]);

  // Toggle voice recognition
  const handleToggleRecording = () => {
    if (useLiveVoiceAPI) {
      if (liveWebSocketActive) {
        cleanupLiveAudioAndWS();
        setIsRecording(false);
        triggerToast("Live Voice Session deactivated.");
      } else {
        startGeminiLiveSession();
        setIsRecording(true);
      }
      return;
    }

    if (!recognitionRef.current) {
      triggerToast("Speech recognition is not supported or blocked in this browser layout.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      triggerToast("Speech recording completed.");
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        triggerToast("Listening with Voice-to-Text active...");
      } catch (e) {
        console.error("Speech Recognition failed to start:", e);
        triggerToast("Unable to access microphone. Please type instead.");
      }
    }
  };

  // Starting the dialogue session - begins timer, ensures right instructional slate remains completely unmounted/collapsed until explicitly triggered
  const handleBeginSession = () => {
    clearSequentialTimers();
    setIsTimerActive(true);
    setSecondsRemaining(900);
    setChatMessages([]);
    setIsPaused(false);
    setPhase("stage1");
    evaluatedStagesLiveRef.current.clear();

    setScoreStats({
      overallScore: 0,
      stageScores: {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0,
        stage5: 0
      },
      foundKeywords: [],
      gaps: scripture.keywords || [],
      stageFeedback: {
        stage1: "Awaiting foundational overview...",
        stage2: "Awaiting Great Controversy insights...",
        stage3: "Awaiting doctrinal connections...",
        stage4: "Awaiting practical application...",
        stage5: "Awaiting personal invitation & appeal..."
      },
      ellenWhiteQuote: "The Bible is its own expositor. Scripture is to be compared with scripture.",
      devotionalPrompt: "What specific step is God inviting you to take today from this study?"
    });

    stage5CompletedRef.current = false;
    const userName = resolveUserName();

    setLiveBarTranscript(`Elder Steven: Hello ${userName ? `${userName}, ` : ""}I am Elder Steven, your Bible study mentor. What topic would you like to discuss today?`);

    const promptText = `Hello ${userName ? `${userName}, ` : ""}I am Elder Steven, your Bible study mentor. What topic would you like to discuss today?`;

    const promptMsg: ChatMessage = {
      id: `prompt-init-${Date.now()}`,
      sender: "ai",
      type: "prompt",
      text: promptText,
      timestamp: new Date()
    };
    setChatMessages([promptMsg]);

    // Enforce strict state gating: right-hand slate remains completely unmounted/collapsed and topicOverview is null until pushed via tool updates
    setTopicOverview(null);
    setIsSlateCollapsed(true);
    setVerifiedTurnCount(0);
    setUnlockedStageCount(0);
    pendingToolUpdatesRef.current = {};
    serverTurnCompleteRef.current = false;
    hasUserRespondedRef.current = false;

    // Unlock Web Audio API synchronously on user click gesture so Elder Steven's voice plays immediately
    initializeAudioContext();
    hasReceivedLiveAudioRef.current = false;
    hasCompletedOpeningGreetingRef.current = false;

    if (blackboardScrollRef.current) {
      blackboardScrollRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }

    // Proactively initiate Live Gemini voice session if enabled
    if (useLiveVoiceAPI) {
      if (liveWebSocketActive) {
        cleanupLiveAudioAndWS();
      }
      startGeminiLiveSession();
      setIsRecording(true);
    } else {
      triggerVoiceResponse(
        `Hello ${userName ? `${userName}, ` : ""}I am Elder Steven, your Bible study mentor. What topic would you like to discuss today?`,
        true
      );
    }

    triggerToast(`Welcome ${userName}! Study session initialized.`);
  };

  // Explicit structured tool handler: advances to next stage ONLY when invoked by stageAdvance tool
  const triggerAutoAdvanceToNextStage = (
    currentIdx: number,
    numericScore: number,
    additionalData?: {
      foundKeywords?: string[];
      stageFeedback?: string;
      ellenWhiteQuote?: string;
      devotionalPrompt?: string;
    }
  ) => {
    const currentPhase = stagesList[currentIdx]?.id;
    if (!currentPhase) return;

    // 1. Reveal/update score for the evaluated stage & reset session score to 0 for the new stage
    setScoreStats((prev) => {
      const nextStageScores = { ...prev.stageScores };
      nextStageScores[currentPhase] = numericScore;

      const nextFoundKeywords = [...prev.foundKeywords];
      if (additionalData?.foundKeywords && Array.isArray(additionalData.foundKeywords)) {
        additionalData.foundKeywords.forEach((kw) => {
          if (!nextFoundKeywords.includes(kw)) nextFoundKeywords.push(kw);
        });
      }
      const nextGaps = scripture.keywords.filter((kw) => !nextFoundKeywords.includes(kw));

      const nextFeedback = { ...prev.stageFeedback };
      if (additionalData?.stageFeedback) {
        nextFeedback[currentPhase] = additionalData.stageFeedback;
      }

      return {
        ...prev,
        overallScore: 0, // Reset session score for the new stage
        stageScores: nextStageScores,
        foundKeywords: nextFoundKeywords,
        gaps: nextGaps,
        stageFeedback: nextFeedback,
        ellenWhiteQuote: additionalData?.ellenWhiteQuote || prev.ellenWhiteQuote,
        devotionalPrompt: additionalData?.devotionalPrompt || prev.devotionalPrompt
      };
    });

    // 2. Synchronized stage transition bound exclusively to the stageAdvance tool event
    if (currentIdx < 4) {
      const nextIdx = currentIdx + 1;
      const nextStage = stagesList[nextIdx];

      if (nextStage) {
        setPhase(nextStage.id);
        recordVerifiedTurnCompletion({ unlockUpToStage: nextStage.number, uncollapseSlate: true });

        const promptText = `**Stage ${nextStage.number}: ${nextStage.title}**\n\n${nextStage.prompt || ""}`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `sys-next-${Date.now()}`,
            sender: "ai",
            text: promptText,
            timestamp: new Date()
          }
        ]);

        triggerVoiceResponse(
          `I evaluate your Stage ${currentIdx + 1} response at ${numericScore} out of 100. Moving to Stage ${nextStage.number}: ${nextStage.title}. ${nextStage.prompt || ""}`
        );
        triggerToast(`Stage ${currentIdx + 1} score: ${numericScore}%. Advanced to Stage ${nextStage.number}: ${nextStage.title}`);
      }
    } else {
      // Completed final Stage 5!
      recordVerifiedTurnCompletion({ unlockUpToStage: 5, uncollapseSlate: true });
      triggerVoiceResponse(
        `I evaluate your final Stage 5 response at ${numericScore} out of 100. Praise God! You have successfully completed all five stages of our study journey today.`
      );
      triggerToast(`Stage 5 score: ${numericScore}%. All 5 stages completed!`);
      setTimeout(() => {
        handleAdvanceToScorecard(true);
      }, 1000);
    }
  };

  // Sending student dialogue to server
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || userInput).trim();
    if (!textToSend) return;

    // Synchronize active conversational topic keywords with user input
    syncConversationalTopic(textToSend);

    // Append user's chat message
    const userMsgId = `usr-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    const nextMessages = [...chatMessages, newUserMsg];
    hasUserRespondedRef.current = true;
    setChatMessages(nextMessages);
    setUserInput("");
    setIsLoading(true);
    stopVoiceResponse();

    // Ensure recording is stopped
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // If Live Gemini WebSocket is active, send directly to Live API and avoid duplicate REST request
    if (liveWebSocketActive && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ text: textToSend, currentStage: phase }));
        setLiveBarTranscript(`You: ${textToSend}`);
        return;
      } catch (wsErr) {
        console.warn("WebSocket send note:", wsErr);
      }
    }

    try {
      const response = await fetch("/api/teach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scripture,
          messages: nextMessages.map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          stage: phase,
          userRole,
          isEvangelist,
          learningTier
        })
      });

      if (!response.ok) {
        throw new Error("Tutor communications offline.");
      }

      const data = await response.json();
      const stageHeading = phase.replace("stage", "Stage ");
      const numericScore = data.score || 85;
      const baseReply = data.reply || "Wonderful insights, Noble Berean.";
      const extraTeaching =
        data.teachingExample && !baseReply.includes(data.teachingExample)
          ? `\n\n* **Pedagogical Teaching Example**: ${data.teachingExample}`
          : "";
      const extraRefs =
        Array.isArray(data.scriptureReferences) &&
        data.scriptureReferences.length > 0 &&
        !baseReply.includes(data.scriptureReferences[0])
          ? `\n* **Key Biblical Witnesses**: ${data.scriptureReferences.join(" • ")}`
          : "";
      const formattedReply = `**${stageHeading} Evaluation Score: ${numericScore}/100**\n\n${baseReply}${extraTeaching}${extraRefs}`;

      // Append AI response
      const aiMsgId = `ai-${Date.now()}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: formattedReply,
          timestamp: new Date()
        }
      ]);

      // Queue structured tool payloads (topicOverview & stageAdvance) from the response
      if (data.topicOverview) {
        pendingToolUpdatesRef.current.topicOverview = data.topicOverview;
      }
      if (data.stageAdvance) {
        pendingToolUpdatesRef.current.stageAdvance = data.stageAdvance;
      }

      // If audio prompter is disabled, flush accumulated tool updates immediately; otherwise flush post-speech when TTS finishes
      if (!isAudioPrompterEnabled) {
        endLiveReplyAccumulation();
      } else {
        await triggerVoiceResponse(baseReply);
        if (activeNodesRef.current.length === 0 && !ttsAudioRef.current) {
          endLiveReplyAccumulation();
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Tutor connection interrupted. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit stage transition handler when triggered by structured tools
  const handleNextStage = (nextPhase: PhaseType) => {
    stopVoiceResponse();
    setPhase(nextPhase);

    const nextIdx = nextPhase === "stage1" ? 0 : nextPhase === "stage2" ? 1 : nextPhase === "stage3" ? 2 : nextPhase === "stage4" ? 3 : 4;
    const targetStage = stagesList[nextIdx];
    const stagePrompt = targetStage?.prompt || "";
    const stageTitle = targetStage?.title || "Next Stage";

    recordVerifiedTurnCompletion({ unlockUpToStage: nextIdx + 1, uncollapseSlate: true });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-next-${Date.now()}`,
        sender: "ai",
        text: stagePrompt,
        timestamp: new Date()
      }
    ]);

    if (stagePrompt) {
      triggerVoiceResponse(stagePrompt);
    }
    triggerToast(`Advanced target context to ${stageTitle}`);
  };

  const handleAdvanceToScorecard = (keepVoice = false) => {
    if (!keepVoice) {
      stopVoiceResponse();
    }
    clearIntervals();

    // Trigger celebration confetti
    showConfetti('teach', 'Hallelujah! All 5 Study Stages Mastered!');

    // Calculate final cumulative score and dynamically align assessment with the active conversational topic
    const combinedUserDialogue = chatMessages
      .filter((m) => m.sender === "user")
      .map((m) => m.text.toLowerCase())
      .join(" ");

    const activeTopicKeywords =
      scripture.keywords && scripture.keywords.length > 0
        ? scripture.keywords
        : ["scripture", "covenant", "christ", "truth", "obedience"];

    const detectedFound = activeTopicKeywords.filter((kw) =>
      combinedUserDialogue.includes(kw.toLowerCase())
    );

    setScoreStats((prev) => {
      const nextScores = { ...prev.stageScores };
      const completedKeys = Object.keys(nextScores).filter((k) => nextScores[k] > 0);
      let overall = prev.overallScore;
      if (completedKeys.length > 0) {
        const sum = completedKeys.reduce((a, k) => a + nextScores[k], 0);
        overall = Math.round(sum / completedKeys.length);
      } else {
        overall = 85;
      }

      const mergedFound = Array.from(new Set([...prev.foundKeywords, ...detectedFound]));
      const finalFound = mergedFound.length > 0 ? mergedFound : activeTopicKeywords.slice(0, 3);
      const finalGaps = activeTopicKeywords.filter((kw) => !finalFound.includes(kw));

      const activeTopicLabel = topicOverview?.topicTitle || scripture.reference;
      const activeRefLabel = topicOverview?.scriptureReference || scripture.reference;
      const nextFeedback = { ...prev.stageFeedback };
      if (nextFeedback.stage1.startsWith("Awaiting")) {
        nextFeedback.stage1 = `Foundational overview of ${activeTopicLabel} established with clear scriptural context.`;
      }
      if (nextFeedback.stage2.startsWith("Awaiting")) {
        nextFeedback.stage2 = `Connected ${activeTopicLabel} to the Great Controversy theme and God's character of love.`;
      }
      if (nextFeedback.stage3.startsWith("Awaiting")) {
        nextFeedback.stage3 = `Harmonized ${activeTopicLabel} with Seventh-day Adventist doctrinal pillars.`;
      }
      if (nextFeedback.stage4.startsWith("Awaiting")) {
        nextFeedback.stage4 = `Translated ${activeTopicLabel} into practical daily Christian discipleship.`;
      }
      if (nextFeedback.stage5.startsWith("Awaiting")) {
        nextFeedback.stage5 = `Formulated a warm, Christ-centered invitation to share ${activeTopicLabel} with others.`;
      }

      return {
        ...prev,
        stageScores: nextScores,
        overallScore: overall,
        foundKeywords: finalFound,
        gaps: finalGaps,
        stageFeedback: nextFeedback,
        ellenWhiteQuote:
          topicOverview?.egwWritings?.[0]?.quote || prev.ellenWhiteQuote,
        devotionalPrompt: `Reflecting on ${activeTopicLabel} (${activeRefLabel}), what specific step is God inviting you to take today?`
      };
    });

    setPhase("feedback");
    triggerToast("Congratulations! Study Mastery Session Completed!");
  };

  const handleSimulateWisdomInput = () => {
    const rawSim = SIMULATED_EXPOSITIONS[phase];
    if (rawSim) {
      setUserInput(rawSim);
      triggerToast("Preloaded active theological analysis.");
    }
  };

  const handleSaveToSpiritualJournal = () => {
    setHasSavedReflection(true);
    localStorage.setItem(`stba_devotional_${scripture.id}`, devotionalReflection);
    triggerToast("Your heartfelt study devotion has been added to your Memory Vault!");
  };

  const downloadSummaryAsTxt = () => {
    const activeTitle = topicOverview?.topicTitle || scripture.reference;
    const activeRef = topicOverview?.scriptureReference || scripture.reference;
    let output = "";
    output += "============================================================\n";
    output += "         STUDY TO BE APPROVED (STBA) - SESSION SUMMARY       \n";
    output += `         Topic: ${activeTitle} (${activeRef})\n`;
    output += `         Learning Tier: ${learningTier}\n`;
    output += `         Date: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()} \n`;
    output += "============================================================\n\n";

    output += `[ACTIVE STUDY TOPIC]\n`;
    output += `Topic: ${activeTitle}\n`;
    output += `Reference: ${activeRef}\n`;
    output += `Text: "${scripture.text}"\n\n`;

    output += `[OVERALL COGNITIVE EVALUATION]\n`;
    output += `Overall Mastery Score: ${scoreStats.overallScore}%\n`;
    output += `Discipleship Rank: ${getMasteryLevelText(scoreStats.overallScore)}\n`;
    output += `Active Profile Background: ${userRole}\n\n`;

    output += "------------------------------------------------------------\n";
    output += "                 STAGE-BY-STAGE EVALUATION                  \n";
    output += "------------------------------------------------------------\n";
    stagesList.forEach((stg) => {
      const sc = scoreStats.stageScores[stg.id] || 0;
      const feedback = scoreStats.stageFeedback[stg.id] || "No discussion recorded.";
      output += `Stage ${stg.number}: ${stg.title}\n`;
      output += `Score: ${sc}/100\n`;
      output += `Feedback: ${feedback}\n`;
      output += `------------------------------------------------------------\n`;
    });

    output += "\n";
    output += "------------------------------------------------------------\n";
    output += "                 DEVOTIONAL HEART REFLECTION                \n";
    output += "------------------------------------------------------------\n";
    output += `Prompt: ${scoreStats.devotionalPrompt}\n`;
    output += `Your Reflection:\n`;
    output += devotionalReflection.trim() ? devotionalReflection.trim() : "(No reflection text captured in memory journal yet.)";
    output += "\n\n";

    output += "------------------------------------------------------------\n";
    output += "                 SESSION TRANSLOGUE DIALOGUE                \n";
    output += "------------------------------------------------------------\n";
    if (chatMessages.length === 0) {
      output += "(No dialogue text captures. Session completed using voice/audio prompters.)\n";
    } else {
      chatMessages.forEach((msg, idx) => {
        const title = msg.sender === "ai" ? "STBA INTERACTIVE GUIDE" : "STUDENT";
        output += `[${idx + 1}] ${title} (${msg.timestamp.toLocaleTimeString()}):\n`;
        output += `    ${msg.text}\n\n`;
      });
    }

    output += "\n============================================================\n";
    output += "               VINDICATED & APPROVED BEREAN                 \n";
    output += `               "${scoreStats.ellenWhiteQuote}"\n`;
    output += "============================================================\n";

    // Trigger download
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `STBA_${activeRef.replace(/\s+/g, "_")}_Session_Summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Plain-text session report saved successfully!");
  };

  const downloadSummaryAsHtml = () => {
    const activeTitle = topicOverview?.topicTitle || scripture.reference;
    const activeRef = topicOverview?.scriptureReference || scripture.reference;
    let chatHtml = "";
    if (chatMessages.length === 0) {
      chatHtml = `<p style="color: #888;">No textual dialogue logged. Session completed using real-time vocal streams.</p>`;
    } else {
      chatMessages.forEach((msg) => {
        const isAi = msg.sender === "ai";
        chatHtml += `
          <div style="margin-bottom: 16px; padding: 12px; border-radius: 6px; background-color: ${isAi ? '#fdfaf5' : '#f4f5f7'}; border-left: 4px solid ${isAi ? '#C9973A' : '#1C2333'};">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${isAi ? '#C9973A' : '#1C2333'}; font-weight: bold; margin-bottom: 4px;">
              ${isAi ? 'STBA AI GUIDE' : 'STUDENT WORKMAN'} - ${new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div style="font-size: 12.5px; line-height: 1.5; color: #333;">${msg.text}</div>
          </div>
        `;
      });
    }

    let stagesHtml = "";
    stagesList.forEach((stg) => {
      const sc = scoreStats.stageScores[stg.id] || 0;
      const feedback = scoreStats.stageFeedback[stg.id] || "No discussion recorded.";
      stagesHtml += `
        <div style="padding: 12px 0; border-bottom: 1px dashed #e8e4da;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-family: 'Inter', sans-serif; font-size: 13px; color: #222;">Stage ${stg.number}: ${stg.title}</strong>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: bold; color: #C9973A; background-color: #fdfaf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #c9973a20;">
              ${sc}/100
            </span>
          </div>
          <p style="font-size: 12px; color: #666; margin: 0; line-height: 1.45;">${feedback}</p>
        </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>STBA Biblical Study Record: ${activeTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Playfair+Display:wght@500;700&family=JetBrains+Mono:wght@400;700&display=swap');
    
    body {
      background-color: #f6f5f0;
      color: #1a1a1a;
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 40px 20px;
    }
    .paper {
      background-color: #ffffff;
      border: 1px solid #e8e4da;
      border-radius: 16px;
      max-width: 800px;
      margin: 0 auto;
      padding: 50px 60px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      position: relative;
    }
    .seal-border {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 1px solid #c9973a20;
      pointer-events: none;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #C9973A;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      margin: 0;
      color: #1C2333;
      letter-spacing: -0.01em;
    }
    .header p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #C9973A;
      margin: 8px 0 0 0;
      font-weight: 700;
    }
    .scripture-card {
      background-color: #fdfaf5;
      border: 1px solid #C9973A25;
      padding: 20px 24px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .scripture-card h2 {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      margin: 0 0 8px 0;
      color: #C9973A;
    }
    .scripture-card p {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      color: #333;
      line-height: 1.6;
      margin: 0;
    }
    .score-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #1C2333;
      color: #ffffff;
      padding: 20px 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .score-banner h3 {
      font-size: 24px;
      margin: 0;
      font-family: 'Playfair Display', serif;
    }
    .score-badge {
      font-size: 32px;
      font-weight: 800;
      color: #C9973A;
      font-family: 'Inter', sans-serif;
    }
    .section-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #1C2333;
      border-bottom: 1px solid #1c233315;
      padding-bottom: 8px;
      margin-top: 35px;
      margin-bottom: 16px;
      font-weight: 800;
    }
    .reflection-text {
      font-family: 'Playfair Display', serif;
      font-size: 14.5px;
      line-height: 1.6;
      color: #2b2b2b;
      background-color: #fefefc;
      padding: 20px;
      border-left: 3px solid #C9973A;
      border-radius: 0 8px 8px 0;
    }
    .quote {
      text-align: center;
      font-family: 'Playfair Display', serif;
      font-size: 13.5px;
      color: #666;
      border-top: 1px solid #e8e4da;
      padding-top: 20px;
      margin-top: 40px;
    }
    .footer {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #999;
      margin-top: 25px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .paper {
        border: none;
        box-shadow: none;
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
    .btn-print {
      display: block;
      width: fit-content;
      margin: 20px auto 0 auto;
      background-color: #C9973A;
      color: white;
      border: none;
      padding: 10px 24px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-print:hover {
      background-color: #b5852f;
    }
  </style>
</head>
<body>

  <div class="paper">
    <div class="seal-border"></div>
    
    <button class="btn-print no-print" onclick="window.print()">Print This Record / Save PDF</button>

    <div class="header">
      <p>Study To Be Approved (STBA)</p>
      <h1>Biblical Study Mastery Record</h1>
      <p style="color: #666; font-size: 10px; margin-top: 4px;">Conversational Assessment & Stage Evaluation (${learningTier} Tier)</p>
    </div>

    <div class="scripture-card">
      <h2>Active Study Topic: ${activeTitle} (${activeRef})</h2>
      <p>"${scripture.text}"</p>
    </div>

    <div class="score-banner">
      <div>
        <h3 style="margin-bottom: 4px;">Assessment Profile</h3>
        <p style="font-size: 12px; color: #aaa; margin: 0; font-family: 'Inter', sans-serif;">
          Role: <strong>${userRole} background</strong> • Tier: <strong>${learningTier}</strong> • Status: <strong>VERIFIED</strong>
        </p>
      </div>
      <div>
        <div class="score-badge">${scoreStats.overallScore}%</div>
        <p style="font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; margin: 0; text-align: right; color: #C9973A; font-weight: bold;">
          ${getMasteryLevelText(scoreStats.overallScore)}
        </p>
      </div>
    </div>

    <div class="section-title">Cognitive Stage Evaluation Breakdown</div>
    <div>
      ${stagesHtml}
    </div>

    <div class="section-title">Active Recall Keywords Captured</div>
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: #1C2333;">
      <strong>Identified Scriptural Keys:</strong><br/>
      ${(scoreStats.foundKeywords.length > 0 ? scoreStats.foundKeywords : scripture.keywords).map(k => {
        return `<span style="display: inline-block; margin-right: 12px; color: #2E7D32; font-weight: bold;">[✓] ${k}</span>`;
      }).join(' ')}
    </p>

    <div class="section-title">Devotional Heart Reflection</div>
    <div style="margin-top: 10px;">
      <p style="font-size: 12px; color: #666; font-family: 'Inter', sans-serif; font-weight: 500; margin-bottom: 8px;">
        <strong>Prompt:</strong> ${scoreStats.devotionalPrompt}
      </p>
      <div class="reflection-text">
        ${devotionalReflection.trim() ? devotionalReflection.trim().replace(/\n/g, "<br/>") : "(No personal reflection text captured in memory journal yet.)"}
      </div>
    </div>

    <div class="section-title">Historical Session Dialogue Transcript</div>
    <div style="margin-top: 12px;">
      ${chatHtml}
    </div>

    <div class="quote">
      "${scoreStats.ellenWhiteQuote}"
    </div>

    <div class="footer">
      Syllabus Reference Code STBA-STUDY-${scripture.id.toUpperCase()} • STBA SECURE ARCHIVAL LEDGER
    </div>
  </div>

</body>
</html>
`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `STBA_${activeRef.replace(/\s+/g, "_")}_Study_Record.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("HTML/PDF-ready study certificate exported!");
  };

  const getMasteryLevelText = (sc: number): string => {
    if (sc >= 90) return "EVANGELIST LEVEL";
    if (sc >= 80) return "TEACHER LEVEL";
    if (sc >= 70) return "SCHOLAR LEVEL";
    if (sc >= 50) return "STUDENT LEVEL";
    return "BEGINNER LEVEL";
  };

  const formatTimerMMSS = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const stagePaceMarkers = ["15m–12m", "12m–9m", "9m–6m", "6m–3m", "3m–0m"];

  return (
    <div
      id="stba-teach-it-studio"
      className="w-full h-full flex flex-col min-h-0 bg-[#1C2333] text-white font-sans md:rounded-[16px] md:border md:border-white/10 relative shadow-2xl"
      style={{ flex: "1 1 0%" }}
    >
      {/* HEADER CONTROLS HUD */}
      <div className="px-3 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#141A27]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#C9973A]/10 text-[#C9973A] rounded-[8px] animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold tracking-wider text-stone-200 uppercase">
              Teach It INTERACTIVE STUDIO
            </h2>
            <p className="text-[10px] text-stone-400 font-mono">
              AI Bible Study Companion & Recall Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Learning Tier Selector (Adapts content volume & pacing depth) */}
          <div
            className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono"
            title="Select Learning Tier to adapt content volume"
          >
            {(["Essential", "Standard", "Comprehensive"] as LearningTier[]).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => {
                  handleLearningTierChange(tier);
                  triggerToast(`Learning Tier set to ${tier} volume`);
                }}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer font-bold uppercase tracking-wider ${
                  learningTier === tier
                    ? "bg-[#C9973A] text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Audio Synthesizer switch */}
          <button
            onClick={() => {
              const next = !isAudioPrompterEnabled;
              setIsAudioPrompterEnabled(next);
              if (!next) stopVoiceResponse();
              triggerToast(next ? "Voice feedback prompt active" : "Voice feedback prompt muted");
            }}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-mono ${
              isAudioPrompterEnabled
                ? "bg-[#C9973A]/10 border-[#C9973A]/30 text-[#C9973A]"
                : "bg-white/5 border-white/5 text-stone-400 hover:text-white"
            }`}
            title="Toggle Voice Synthesizer Prompter"
          >
            {isAudioPrompterEnabled ? (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Audio Prompter</span>
          </button>

          <button
            onClick={handleExitStudio}
            className="p-1.5 px-3 border border-white/10 hover:border-amber-400/60 text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1.5 font-mono group"
            title={phase !== "intro" ? "Close Studio and Return to Start Screen" : "Return to Study Dashboard"}
          >
            <X className="w-4 h-4 text-stone-400 group-hover:text-red-400" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-bold">
              {phase !== "intro" ? "Close to Start" : "Close to Dashboard"}
            </span>
          </button>
        </div>
      </div>

      {/* DEDICATED SCROLL CONTAINER FOR TEACH-IT STUDIO */}
      <div
        id="teach-it-studio-scroll-container"
        className="flex-1 w-full overflow-y-auto scroll-smooth min-h-0"
        style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          height: "100%",
          flex: "1 1 auto"
        }}
      >
        {/* MAIN CONTAINER PANELS */}
        <div className="p-4 sm:p-6 md:p-8 pb-32 md:pb-8 flex-1 flex flex-col justify-between min-h-0">
        <AnimatePresence mode="wait">
          {/* ============================================== */}
          {/* 1. INTRO / CONFIGURATION SETUP                 */}
          {/* ============================================== */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 py-4 pb-28 md:pb-4 max-w-2xl mx-auto text-center"
              id="teach-it-intro-screen"
            >
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9973A] font-extrabold px-3 py-1 rounded bg-[#C9973A]/10 border border-[#C9973A]/20 inline-block">
                  {topicOverview?.topicTitle || "Interactive Study Studio"}
                </span>

                <h1 className="font-serif text-3.5xl sm:text-5xl font-normal text-white leading-tight tracking-tight pt-2">
                  "You've read it. <br />
                  <span className="text-[#C9973A] font-serif font-medium">But do you know it?"</span>
                </h1>

                <p className="font-sans text-sm sm:text-base text-stone-300 leading-relaxed max-w-[550px] mx-auto pt-2">
                  Engage in a methodical, interactive Bible study session with Elder Steven. Converse at a calm pace, explore any biblical topic stage by stage, and receive a realigned end-of-study assessment tailored to your conversation.
                </p>
              </div>

              {/* Configurations panel */}
              <div className="pt-2 max-w-md mx-auto space-y-4 pb-12 md:pb-0">
                {/* Learning Tier Volume Selector */}
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9973A] font-extrabold">
                      Select Learning Tier (Content Volume)
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      Active: {learningTier}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "Essential" as LearningTier, desc: "Concise & Core" },
                        { id: "Standard" as LearningTier, desc: "Balanced Study" },
                        { id: "Comprehensive" as LearningTier, desc: "Full Depth" }
                      ]
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleLearningTierChange(item.id)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          learningTier === item.id
                            ? "bg-[#C9973A]/20 border-[#C9973A] text-white"
                            : "bg-black/20 border-white/10 text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        <div className="font-mono text-xs font-bold text-[#C9973A]">{item.id}</div>
                        <div className="text-[10px] text-stone-300 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#C9973A]/10 border border-[#C9973A]/25 p-3 rounded-lg text-xs text-[#D2A650] flex flex-col gap-1 leading-normal text-left">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#C9973A]">
                    <Sparkles className="w-4 h-4 text-[#C9973A] shrink-0 animate-pulse" />
                    <span>Interactive Mentor: Elder Steven</span>
                  </div>
                  <span>
                    Engages real-time voice and text interaction. Choose any topic or passage in conversation and unlock study stages methodically!
                  </span>
                </div>

                {/* Evangelist Switch card */}
                {isEvangelist && (
                  <div className="bg-[#C9973A]/10 border-2 border-[#C9973A]/30 p-4 rounded-[12px] text-left flex items-start gap-3.5 shadow-sm">
                    <div className="p-2 rounded-full bg-[#C9973A]/20 text-[#C9973A] shrink-0">
                      <Award className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-mono font-extrabold text-[#C9973A] block">
                        Lay Evangelist Active Scorecard
                      </span>
                      <p className="text-stone-300 text-[11.5px] leading-relaxed mt-1">
                        Evangelistic presentation guidelines triggered. Evaluates your warmth, clarity, and biblical simplicity for seekers!
                      </p>
                    </div>
                  </div>
                )}

                {/* START BUTTON */}
                <button
                  onClick={handleBeginSession}
                  className="w-full py-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-sm uppercase tracking-wider rounded-[8px] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                  id="btn-teach-intro-begin"
                >
                  <BrainCircuit className="w-4 h-4 animate-bounce" />
                  <span>Start Session</span>
                </button>

                {/* RETURN TO DASHBOARD BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    cleanupLiveAudioAndWS();
                    stopVoiceResponse();
                    onClose();
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-sans font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  id="btn-teach-intro-dashboard"
                >
                  <ArrowLeft className="w-4 h-4 text-stone-400" />
                  <span>Return to Study Dashboard</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================== */}
          {/* 2. CORE INTERACTIVE CHAT & LIVE SCORECARD GRID */}
          {/* ============================================== */}
          {phase !== "intro" && phase !== "feedback" && activeStage && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full"
            >
              {/* STATUS & ACTIONS HUD TIMER */}
              <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    {!isPaused ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold text-stone-300">
                    {!isPaused ? "AI Session Live" : "Study Paused"}
                  </span>
                  <span className="text-[10px] font-mono text-[#C9973A] bg-[#C9973A]/10 border border-[#C9973A]/30 px-2 py-0.5 rounded">
                    Tier: {learningTier}
                  </span>
                </div>

                {/* TIMERS HUD PANEL */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                  <div className="px-3 py-1 font-mono font-bold text-stone-200 flex items-center gap-2 border-r border-white/10">
                    <Clock className={`w-3.5 h-3.5 ${isTimerActive && !isPaused ? "text-[#C9973A] animate-pulse" : "text-stone-400"}`} />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-[#C9973A] font-bold">
                        {!isTimerActive ? "15:00 Standby" : `Total: ${formatTimerMMSS(secondsRemaining)}`}
                      </span>
                      {isTimerActive && (
                        <span className="text-[10px] text-stone-300 font-normal border-l border-white/10 pl-2 hidden sm:inline">
                          Stage {getStagePaceDetails().activeStageNum} Pace: {getStagePaceDetails().stageTimeLeftFormatted} left in 3m block
                        </span>
                      )}
                    </div>
                  </div>
                  {isTimerActive ? (
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="p-1 px-2.5 hover:bg-white/10 rounded font-mono text-[10px] uppercase font-bold text-[#C9973A] cursor-pointer transition-colors"
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  ) : (
                    <button
                      onClick={handleBeginSession}
                      className="p-1 px-3 bg-[#C9973A] hover:bg-[#B5852F] rounded font-mono text-[10px] uppercase font-bold text-stone-950 cursor-pointer shadow transition-colors"
                    >
                      Start Session
                    </button>
                  )}
                </div>
              </div>

              {/* TOP STAGE ICONS TIMELINE WITH 3-MINUTE STAGE MARKERS */}
              <div 
                ref={stageSelectorRef}
                className="col-span-12 w-full bg-[#141A27]/60 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm shadow-md" 
                id="timer-breadcrumbs-bar"
              >
                <div className="flex items-center justify-between gap-1 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {stagesList.map((st, idx) => {
                    const isCurrent = phase === st.id;
                    const isVisited = getCurrentStageIndex() > idx;
                    const hasScore = (scoreStats.stageScores[st.id] || 0) > 0;
                    const score = scoreStats.stageScores[st.id] || 0;

                    return (
                      <React.Fragment key={st.id}>
                        {/* Connecting Line between stage icons */}
                        {idx > 0 && (
                          <div className="flex-1 h-0.5 sm:h-1 min-w-[14px] sm:min-w-[28px] max-w-[80px] rounded-full overflow-hidden bg-white/10 relative">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                isVisited || (isCurrent && idx > 0)
                                  ? "bg-gradient-to-r from-emerald-500 to-[#C9973A] w-full"
                                  : "w-0"
                              }`}
                            />
                          </div>
                        )}

                        {/* Stage Icon Node */}
                        <div
                          data-active={isCurrent ? "true" : "false"}
                          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-xl border transition-all select-none flex-shrink-0 cursor-default ${
                            isCurrent
                              ? "bg-[#C9973A]/15 border-[#C9973A] text-white shadow-lg ring-2 ring-[#C9973A]/40"
                              : isVisited
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                              : "bg-white/[0.02] border-white/5 text-stone-500"
                          }`}
                        >
                          {/* Circular icon container */}
                          <div 
                            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center relative transition-transform ${
                              isCurrent
                                ? "bg-[#C9973A] text-stone-950 font-bold shadow-md scale-105"
                                : isVisited
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-white/5 text-stone-400 border border-white/5"
                            }`}
                          >
                            {isVisited && hasScore ? (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                            ) : (
                              st.icon
                            )}
                            {isCurrent && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9973A] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C9973A]"></span>
                              </span>
                            )}
                          </div>

                          {/* Stage details with 3-minute stage pace marker */}
                          <div className="flex flex-col text-left pr-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider">
                              <span className={isCurrent ? "text-[#C9973A] font-extrabold" : isVisited ? "text-emerald-400 font-bold" : "text-stone-500"}>
                                Stage {st.number}
                              </span>
                              <span className="text-[8px] sm:text-[9px] text-[#C9973A]/80 font-bold bg-[#C9973A]/10 px-1 py-0.2 rounded border border-[#C9973A]/20">
                                {stagePaceMarkers[idx]}
                              </span>
                              <span className={`font-bold px-1 py-0.2 rounded text-[8px] sm:text-[9px] ${
                                hasScore
                                  ? "text-emerald-400 bg-emerald-500/20"
                                  : isCurrent
                                  ? "text-[#C9973A] bg-[#C9973A]/20"
                                  : "text-stone-500 bg-white/5"
                              }`}>
                                {score}%
                              </span>
                            </div>
                            <span className={`text-[11px] sm:text-xs font-sans font-bold leading-tight truncate max-w-[100px] sm:max-w-[130px] ${
                              isCurrent ? "text-white" : isVisited ? "text-stone-200" : "text-stone-400"
                            }`}>
                              {st.title}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* MOBILE WORKSPACE TAB SELECTOR */}
              <div 
                className="col-span-12 lg:hidden flex p-1 bg-stone-900/65 rounded-xl border border-white/5 text-[10px] font-mono select-none w-full gap-1 mb-2" 
                id="mobile-workspace-tab-bar"
              >
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("chat")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "chat"
                      ? "bg-[#C9973A] text-white shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Dialogue
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("blackboard")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "blackboard"
                      ? "bg-emerald-700 text-white shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Blackboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileTab("scorecard")}
                  className={`flex-1 py-2.5 rounded-lg text-center font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    activeMobileTab === "scorecard"
                      ? "bg-[#C9973A] text-white shadow shadow-md font-extrabold"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Scorecard
                </button>
              </div>

              {/* STUDY WORKSPACE PANELS: LOCKED ASYMMETRIC TWO-COLUMN GRID (LEFT 5 COLS DIALOGUE + RIGHT 7 COLS INSTRUCTIONAL SLATE) */}
              <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0" id="study-workspace-panels">

                {/* ============================================================== */}
                {/* LEFT PANE: CAPTURES ALL DIALOGUE & PROMPT INPUT BOX (5 COLS)   */}
                {/* ============================================================== */}
                <div
                  id="left-pane-dialogue-flux"
                  className={`lg:col-span-5 min-w-0 w-full bg-[#141A27] rounded-2xl border border-white/10 p-3 sm:p-5 flex-col justify-between shadow-2xl relative overflow-hidden h-[680px] sm:h-[740px] max-h-[740px] ${
                    activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
                  }`}
                >
                  {/* Top Header: Active Stage & Active Topic (Locked at Top) */}
                  <div 
                    className="shrink-0 flex flex-col items-center justify-center text-center w-full px-2 py-2 gap-2 border-b border-white/5 text-[10px] font-mono select-none lg:flex-col lg:items-start lg:text-left"
                    id="chat-metadata-header"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-stone-400 w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="whitespace-nowrap">Active study phase:</span>
                        <span className="text-[#C9973A] font-bold uppercase whitespace-nowrap">
                          Stage {activeStage?.number || 1}: {activeStage?.title || "Foundational Overview"}
                        </span>
                        <span className="text-[9px] text-[#C9973A]/80 font-bold bg-[#C9973A]/10 px-1.5 py-0.2 rounded border border-[#C9973A]/20 ml-1">
                          {stagePaceMarkers[activeStageIndex !== -1 ? activeStageIndex : 0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400 font-mono text-[9.5px]">Active Topic:</span>
                        {topicOverview?.scriptureReference ? (
                          <button
                            type="button"
                            onClick={() => handleNavigateToBibleStudy(topicOverview.scriptureReference)}
                            className="inline-flex items-center gap-1 text-[#C9973A] hover:text-amber-300 font-mono text-[10px] font-bold underline underline-offset-2 decoration-[#C9973A]/40 transition-colors cursor-pointer"
                            title="Open Active Topic in Bible Study Module"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>{topicOverview.scriptureReference}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        ) : (
                          <span className="text-stone-500 font-mono text-[10px]">
                            Awaiting Topic Tool Update
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PROMINENT LIVE VOCAL MENTOR & TRANSCRIPT BAR (Locked Below Header) */}
                  <div className="shrink-0 w-full bg-[#101522] border-2 border-[#C9973A]/40 rounded-2xl p-3 sm:p-3.5 my-3 shadow-xl backdrop-blur-md relative overflow-hidden select-none">
                    <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          liveState === "playing"
                            ? "bg-amber-400 animate-ping"
                            : liveState === "recording"
                            ? "bg-red-500 animate-pulse"
                            : liveState === "ready"
                            ? "bg-emerald-400"
                            : "bg-stone-500"
                        }`} />
                        <span className="font-mono text-xs uppercase tracking-widest font-extrabold text-[#C9973A]">
                          Elder Steven Live Voice
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          liveState === "playing"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : liveState === "recording"
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : liveState === "ready"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-white/5 text-stone-400"
                        }`}>
                          {liveState === "playing" ? "● Speaking" : liveState === "recording" ? "● Streaming Mic" : liveState === "ready" ? "● Listening" : "● Standby"}
                        </span>

                        <button
                          onClick={handleToggleRecording}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            liveWebSocketActive
                              ? "bg-[#C9973A]/20 border-[#C9973A] text-[#C9973A]"
                              : "bg-white/5 border-white/10 text-stone-400 hover:text-white"
                          }`}
                          title={liveWebSocketActive ? "Mute Microphone" : "Start Live Voice"}
                        >
                          {liveWebSocketActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Live Streaming Transcript */}
                    <div className="pt-2 flex items-start gap-2.5 text-xs sm:text-sm">
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#C9973A] shrink-0 bg-[#C9973A]/10 border border-[#C9973A]/30 px-2 py-0.5 rounded font-bold">
                        Live Transcript:
                      </span>
                      <span className="text-stone-100 font-sans leading-relaxed min-h-[20px]">
                        {liveBarTranscript || "Awaiting voice interaction... Speak or type to Elder Steven."}
                      </span>
                    </div>
                  </div>

                  {/* Dialogue Screen / Bottom-Anchored Speech Bubble Stream */}
                  <div
                    ref={chatContainerRef}
                    className="w-full min-w-0 flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain pr-1 pb-4 scrollbar-thin border-b border-white/5"
                    id="chat-scroller-box"
                  >
                    {/* INITIAL DIALOGUE PROMPT STATE */}
                    {!hasActiveDialogue ? (
                      <div
                        id="dialogue-screen-initial-blank"
                        className="w-full flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-4 my-auto select-none opacity-90"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#C9973A]/10 border border-[#C9973A]/30 flex items-center justify-center text-[#C9973A] shadow-inner">
                          <MessageSquare className="w-7 h-7 opacity-85" />
                        </div>
                        <div className="space-y-1.5 max-w-md">
                          <h4 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                            Dialogue Stream Ready
                          </h4>
                          <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                            This column is dedicated exclusively to your live conversational dialogue with Elder Steven. The right instructional slate remains hidden by default and reveals stages sequentially as verified turns complete.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleBeginSession}
                          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9973A] to-[#B5852F] hover:from-[#B5852F] hover:to-[#9F7224] text-stone-950 font-sans font-bold text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Begin Interactive Dialogue</span>
                        </button>
                      </div>
                    ) : (
                      /* Bottom-anchored message stack: mt-auto anchors messages to the bottom and scrolls seamlessly as messages grow */
                      <div className="mt-auto flex flex-col justify-end space-y-4 w-full pt-2">
                        <AnimatePresence initial={false}>
                          {chatMessages.map((msg) => {
                            const isAi = msg.sender === "ai";
                            if (isAi) {
                              return (
                                <motion.div
                                  key={msg.id}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-start gap-3 w-full mr-auto text-left select-text"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-[#C9973A]/20 border border-[#C9973A]/40 flex items-center justify-center text-[#C9973A] shrink-0 font-serif text-xs font-bold shadow-md">
                                    AI
                                  </div>
                                  <div className="flex-1 bg-white/[0.06] text-[#E8E4DA] border border-white/10 rounded-2xl rounded-tl-none p-4 sm:p-5 font-serif font-light leading-relaxed select-text space-y-2 shadow-md">
                                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-2 font-mono text-[10px] text-stone-400">
                                      <span className="font-bold uppercase tracking-wider text-[#C9973A] flex items-center gap-1.5">
                                        <BrainCircuit className="w-3.5 h-3.5" />
                                        <span>Elder Steven • Dialogue Mentor</span>
                                      </span>
                                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                    <div className="whitespace-pre-wrap text-sm sm:text-base font-serif leading-relaxed text-stone-100">
                                      <ScriptureLinkedText
                                        text={msg.text}
                                        onNavigateRef={handleNavigateToBibleStudy}
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            }

                            // USER SPEECH BUBBLE
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 w-full ml-auto flex-row-reverse text-right select-text"
                              >
                                <div className="w-9 h-9 rounded-xl bg-[#C9973A] text-stone-950 flex items-center justify-center shrink-0 font-sans text-xs font-extrabold shadow-md">
                                  You
                                </div>
                                <div className="max-w-[85%] bg-[#C9973A] text-stone-950 rounded-2xl rounded-tr-none p-4 sm:p-5 font-sans leading-relaxed text-sm sm:text-base shadow-md text-left">
                                  <div className="flex items-center justify-between gap-2 border-b border-black/15 pb-1 mb-1.5 font-mono text-[10px] text-stone-900/80">
                                    <span className="font-bold uppercase tracking-wider">Your Dialogue Response</span>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  </div>
                                  <div className="whitespace-pre-wrap select-text font-medium text-stone-950">
                                    <ScriptureLinkedText
                                      text={msg.text}
                                      onNavigateRef={handleNavigateToBibleStudy}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>

                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2.5 mr-auto max-w-[80%]"
                          >
                            <div className="p-2 rounded-full bg-[#C9973A]/10 text-[#C9973A] shrink-0 text-xs animate-pulse">
                              AI
                            </div>
                            <div className="bg-white/5 border border-white/5 p-3 rounded-xl rounded-tl-none flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-[#C9973A] rounded-full animate-bounce [animation-delay:0.4s]" />
                              </div>
                              <span className="font-mono text-[10px] text-stone-400">Preparing response...</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ============================================================== */}
                  {/* PROMPT BOX: LOCKED AT THE BASE OF THE LEFT DIALOGUE PANE       */}
                  {/* ============================================================== */}
                  <div className="shrink-0 space-y-3 pt-3 select-none" id="left-pane-prompt-box">
                    
                    {/* Speech transcription recording indicator banner */}
                    {isRecording && (
                      <div className="bg-red-500/15 border border-red-500/30 px-3 py-1.5 rounded-lg text-[10px] text-red-300 flex items-center justify-between font-mono animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                          <span>Capturing voice input directly into dialogue prompt...</span>
                        </span>
                        <button onClick={handleToggleRecording} className="text-stone-300 hover:text-white underline cursor-pointer">
                          Stop recording
                        </button>
                      </div>
                    )}

                    {/* Dialogue Input Row: Textarea + Send + Mic */}
                    <div className="flex flex-row items-end gap-2 w-full" id="chat-input-row">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isRecording ? "Speak now..." : "Name any biblical topic or type your dialogue response here..."}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isLoading}
                        rows={2}
                        className="flex-1 min-w-0 resize-none rounded-xl px-3.5 py-2.5 text-sm bg-black/30 border border-white/10 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A] scrollbar-thin shadow-inner"
                      />

                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !userInput.trim()}
                        className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-bold disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center group shadow-md"
                        title="Send Dialogue Message"
                      >
                        <Send className="w-4 h-4 group-hover:scale-110" />
                      </button>
                      
                      <button
                        onClick={handleToggleRecording}
                        className={`flex-shrink-0 w-11 h-11 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md ${
                          isRecording ? "bg-red-600 border-red-500 text-white" : "bg-white/5 hover:bg-white/10 border-white/10 text-stone-400 hover:text-white"
                        }`}
                        title="Toggle Mic Dictation"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stage Navigation Controls & Actions Footer at Bottom of Left Pane */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] text-stone-400 font-mono" id="chat-actions-footer">
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <span>Press</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-stone-300 text-[9px]">Enter ↵</kbd>
                        <span>to send dialogue</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {activeStageIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => handleNextStage(stagesList[activeStageIndex - 1].id)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white uppercase tracking-wider rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title={`Return to Stage ${activeStageIndex}`}
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Prev Stage</span>
                          </button>
                        )}
                        {activeStageIndex >= 0 && activeStageIndex < 4 && (
                          <button
                            type="button"
                            onClick={() => handleNextStage(stagesList[activeStageIndex + 1].id)}
                            className="px-2.5 py-1.5 bg-[#C9973A]/15 hover:bg-[#C9973A]/25 border border-[#C9973A]/40 text-[#C9973A] uppercase tracking-wider rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title={`Advance to Stage ${activeStageIndex + 2}`}
                          >
                            <span>Next Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {activeStageIndex >= 4 && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceToScorecard()}
                            className="px-3.5 py-1.5 bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 uppercase tracking-wider rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-md"
                          >
                            Check Analytical Scorecard →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* RIGHT PANE: DEDICATED AI INSTRUCTIONAL AREA (7 COLS ASYMMETRIC) */}
                {/* ============================================================== */}
                <div
                  id="right-pane-blackboard"
                  className={`lg:col-span-7 min-w-0 w-full bg-[#0e1712] rounded-2xl border-4 border-[#3a2c1e] shadow-2xl flex flex-col justify-start items-stretch relative overflow-hidden transition-all duration-300 ${
                    isSlateCollapsed || verifiedTurnCount === 0
                      ? "h-auto lg:h-[680px] sm:lg:h-[740px] lg:max-h-[740px]"
                      : "h-[680px] sm:h-[740px] max-h-[740px]"
                  } ${
                    activeMobileTab === "blackboard" ? "flex" : "hidden lg:flex"
                  }`}
                >
                  {/* 1. PERSISTENT INSTRUCTIONAL SLATE HEADER (LOCKED AT TOP) */}
                  <div
                    id="right-pane-blackboard-header"
                    className="bg-[#132018] border-b border-[#24382a] p-3 sm:p-4 select-none shrink-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#253d2c] border border-[#3b5d44] flex items-center justify-center text-amber-300 shadow-inner">
                          <Scroll className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-serif text-sm sm:text-base font-bold text-[#f5ebd7] tracking-wider uppercase">
                            AI INSTRUCTIONAL AREA • PROGRESSIVE DISCLOSURE SLATE
                          </h3>
                          <p className="text-[10px] font-mono text-[#a5bfa8]">
                            {verifiedTurnCount === 0 || isSlateCollapsed
                              ? "Default State: Unmounted / Collapsed • Awaiting Post-Speech Tool Unlock"
                              : !topicOverview
                              ? "Greeting Complete • Awaiting Topic Selection & Tool Update"
                              : unlockedStageCount === 0
                              ? `Topic Overview Loaded • Active Stage Overview Only (${learningTier} Tier)`
                              : `Methodical Pacing • ${unlockedStageCount} of 5 Stages Revealed (${learningTier} Tier)`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {verifiedTurnCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsSlateCollapsed((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a2c20] hover:bg-[#253d2c] border border-[#3b5d44] text-[#c8decb] text-[10px] font-mono font-bold transition-all cursor-pointer"
                            title={isSlateCollapsed ? "Expand Instructional Slate" : "Collapse Instructional Slate"}
                          >
                            {isSlateCollapsed ? (
                              <>
                                <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
                                <span>Expand Slate</span>
                              </>
                            ) : (
                              <>
                                <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
                                <span>Collapse Slate</span>
                              </>
                            )}
                          </button>
                        )}

                        {topicOverview && unlockedStageCount >= 1 && !isSlateCollapsed && (
                          /* Download Dropdown Button (PDF or DOCS) */
                          <div className="relative">
                            <button
                              type="button"
                              id="blackboard-download-btn"
                              onClick={() => setShowBlackboardDownloadMenu((prev) => !prev)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f3325] hover:bg-[#2b4733] border border-[#3c6145] text-amber-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                              title="Download Instructional Slate as PDF or DOCS"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                              <ChevronDown className="w-3 h-3 opacity-80" />
                            </button>

                            <AnimatePresence>
                              {showBlackboardDownloadMenu && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setShowBlackboardDownloadMenu(false)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#132018] border border-[#3c6145] shadow-2xl p-1.5 z-30 space-y-1"
                                  >
                                    <button
                                      type="button"
                                      onClick={handleDownloadBlackboardPDF}
                                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#253d2c] text-xs font-mono text-amber-100 flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                      <span className="flex items-center gap-2 font-bold">
                                        <Printer className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Download PDF</span>
                                      </span>
                                      <span className="text-[10px] text-[#8ea892]">.pdf</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleDownloadBlackboardDocs}
                                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#253d2c] text-xs font-mono text-amber-100 flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                      <span className="flex items-center gap-2 font-bold">
                                        <FileText className="w-3.5 h-3.5 text-emerald-300" />
                                        <span>Download DOCS</span>
                                      </span>
                                      <span className="text-[10px] text-[#8ea892]">.doc</span>
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 4 Instructional Area Category Tabs — Only rendered once topicOverview is pushed and Stage 1+ is unlocked */}
                    {topicOverview && unlockedStageCount >= 1 && !isSlateCollapsed && (
                      <div className="flex flex-wrap gap-1.5 pt-3 text-[10px] font-mono">
                        {[
                          { id: "all", label: "All Slate" },
                          { id: "scriptures", label: "Scriptures" },
                          { id: "egw", label: "Ellen White" },
                          { id: "pedagogy", label: "Pedagogy & Notes" }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setBlackboardView(tab.id as any)}
                            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-bold ${
                              blackboardView === tab.id
                                ? "bg-amber-300/20 text-amber-200 border border-amber-300/40 shadow-sm"
                                : "text-[#8ea892] hover:text-[#e0ebe1] bg-black/20 hover:bg-black/30 border border-transparent"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. PROGRESSIVE, STATE-MANAGED INSTRUCTIONAL SLATE BODY */}
                  {verifiedTurnCount === 0 || isSlateCollapsed ? null : !topicOverview ? (
                    <div
                      id="slate-empty-placeholder"
                      className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center select-none"
                    >
                      <div className="max-w-md space-y-2 border border-dashed border-[#2f4838] rounded-xl p-6 bg-[#142319]/40">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/80 block font-bold">
                          Awaiting Structured Tool Update
                        </span>
                        <p className="text-xs sm:text-sm text-[#a5bfa8] font-sans leading-relaxed">
                          Share your chosen biblical topic or scripture with Elder Steven. Content cards, scripture references, and stage modules will populate only when explicitly pushed via tool updates after his spoken response completes.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={blackboardScrollRef}
                        className="blackboard-scroll overflow-y-auto overscroll-contain flex-1 min-h-0 flex flex-col justify-start items-stretch content-start p-4 sm:p-5 space-y-5 text-left select-text"
                      >
                        {/* ============================================================ */}
                        {/* CARD 0: ACTIVE STAGE OVERVIEW (REVEALED ON TOOL PUSH)        */}
                        {/* ============================================================ */}
                        <motion.div
                          key={`active-stage-overview-${activeStage?.id || "stage1"}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="bg-[#142319]/95 border-2 border-[#C9973A]/60 rounded-xl p-4 space-y-3 shadow-lg"
                          id="active-stage-overview-card"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#273c2d] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-[#C9973A] text-stone-950 font-mono text-[10px] font-extrabold uppercase tracking-wider">
                                Active Stage {activeStage?.number || 1} Overview
                              </span>
                              <span className="font-serif text-sm sm:text-base font-bold text-[#f5ebd7]">
                                {activeStage?.title || "Foundational Overview"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleNavigateToBibleStudy(topicOverview.scriptureReference)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#203627] hover:bg-[#2b4733] text-amber-200 border border-[#3b5e43] font-mono text-[10px] font-bold transition-all cursor-pointer"
                              title={`Open ${topicOverview.scriptureReference} in Bible Study module`}
                            >
                              <BookOpen className="w-3 h-3 text-[#C9973A]" />
                              <span>{topicOverview.scriptureReference}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[11px] font-mono text-amber-300/90 uppercase tracking-wider font-bold">
                              {activeStage?.subtitle || "Stage 1 • Introduces foundational concepts"}
                            </div>
                            <p className="text-xs sm:text-sm text-[#e8f0e6] font-sans leading-relaxed">
                              {activeStage?.overview || stagesList[0].overview}
                            </p>
                          </div>

                          {/* Stage Progress Strip (1 to 5) showing locked vs unlocked stages */}
                          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {stagesList.map((st, idx) => {
                                const isUnlocked = idx < unlockedStageCount;
                                const isActive = phase === st.id;
                                return (
                                  <span
                                    key={st.id}
                                    className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all ${
                                      isActive
                                        ? "bg-[#C9973A]/25 text-amber-200 border border-[#C9973A]"
                                        : isUnlocked
                                        ? "bg-emerald-950/70 text-emerald-300 border border-emerald-600/40"
                                        : "bg-black/30 text-stone-500 border border-white/5"
                                    }`}
                                  >
                                    {isUnlocked ? "✓" : "🔒"} S{st.number}: {st.title}
                                  </span>
                                );
                              })}
                            </div>
                            {unlockedStageCount === 0 && (
                              <span className="text-[10px] font-mono text-amber-300/90">
                                Reply to Elder Steven to unlock Stage 1 module →
                              </span>
                            )}
                          </div>
                        </motion.div>

                        {/* ============================================================ */}
                        {/* SUBSEQUENT STAGES & MODULES — GATED UNTIL UNLOCKED BY TOOLS  */}
                        {/* ============================================================ */}
                        {unlockedStageCount >= 1 && (
                          <>
                            {/* OVERVIEW & STAGE-SEPARATED INSTRUCTIONAL MODULES (ALL SLATE) */}
                            {blackboardView === "all" && (
                              <div className="space-y-5" id="blackboard-overview-and-stages">
                                {/* A. THEOLOGICAL & PROPHETIC OVERVIEW CARD */}
                                <motion.div
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.35 }}
                                  className="bg-[#142319]/95 border border-amber-400/35 rounded-xl p-4 space-y-3 shadow-lg"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#273c2d] pb-2">
                                    <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Theological & Prophetic Overview ({learningTier} Volume)</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-300">
                                      Unlocked at Turn {verifiedTurnCount}
                                    </span>
                                  </div>

                                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#f5ebd7] leading-snug">
                                    {topicOverview.topicTitle}
                                  </h4>

                                  <div className="space-y-2 text-xs sm:text-sm text-stone-200 font-sans">
                                    <div className="bg-black/25 border border-white/5 rounded-lg p-3 space-y-1">
                                      <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                                        1. Historical, Cultural & Theological Setting:
                                      </span>
                                      <p className="leading-relaxed text-[#e8f0e6]">
                                        <ScriptureLinkedText
                                          text={topicOverview.historicalContext}
                                          onNavigateRef={handleNavigateToBibleStudy}
                                        />
                                      </p>
                                    </div>

                                    {unlockedStageCount >= 2 && learningTier !== "Essential" && (
                                      <div className="bg-amber-950/25 border border-amber-500/25 rounded-lg p-3 space-y-1">
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                                          2. Critical Importance for the Last Days & Final Crisis:
                                        </span>
                                        <p className="leading-relaxed text-[#e8f0e6]">
                                          <ScriptureLinkedText
                                            text={topicOverview.lastDaysImportance}
                                            onNavigateRef={handleNavigateToBibleStudy}
                                          />
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>

                                {/* B. SEQUENTIAL STAGE CARDS (REVEALED ONE BY ONE AS UNLOCKED) */}
                                <div className="space-y-3" id="blackboard-stages-breakdown">
                                  <div className="flex items-center justify-between border-b border-[#273c2d] pb-1.5">
                                    <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                                      <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Progressive Stage Modules ({unlockedStageCount} of 5 Revealed)</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-[#89a58d]">
                                      Active: Stage {activeStage?.number || 1}
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    {stagesList.slice(0, unlockedStageCount).map((stg, idx) => {
                                      const isCurrentStage = phase === stg.id;
                                      const stageScore = scoreStats.stageScores[stg.id] || 0;
                                      const outlineItem = topicOverview.stagesOutline?.[idx];
                                      const stageNote = topicOverview.explanatoryNotes?.[idx % (topicOverview.explanatoryNotes?.length || 1)];
                                      const maxTextsForTier = learningTier === "Essential" ? 1 : learningTier === "Standard" ? 2 : stg.coreTexts.length;

                                      return (
                                        <motion.div
                                          key={stg.id}
                                          initial={{ opacity: 0, y: 12 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className={`rounded-xl p-3.5 sm:p-4 space-y-2.5 border transition-all shadow-md ${
                                            isCurrentStage
                                              ? "bg-[#1a2e22] border-2 border-[#C9973A] ring-1 ring-[#C9973A]/30"
                                              : stageScore > 0
                                              ? "bg-[#142319]/90 border-emerald-600/40"
                                              : "bg-[#142319]/80 border-[#2f4838]"
                                          }`}
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                                            <div className="flex items-center gap-2">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                                                isCurrentStage
                                                  ? "bg-[#C9973A] text-stone-950"
                                                  : stageScore > 0
                                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                  : "bg-[#203627] text-amber-300 border border-[#3b5e43]"
                                              }`}>
                                                Stage {stg.number}
                                              </span>
                                              <span className="font-serif text-sm font-bold text-[#f5ebd7]">
                                                {stg.title}
                                              </span>
                                              <span className="text-[10px] font-mono text-[#89a58d] hidden sm:inline">
                                                • {stg.subtitle}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                              {isCurrentStage && (
                                                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-bold">
                                                  Active Stage
                                                </span>
                                              )}
                                              {stageScore > 0 && (
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                                                  Score: {stageScore}%
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Stage Overview & Focus */}
                                          <div className="text-xs text-stone-200 font-sans space-y-1">
                                            <p className="leading-relaxed text-[#e8f0e6]">
                                              <strong className="text-amber-200 font-mono text-[10px] uppercase tracking-wider">Instructional Overview: </strong>
                                              {stg.overview}
                                            </p>
                                            {outlineItem?.focus && learningTier !== "Essential" && (
                                              <p className="leading-relaxed text-stone-300">
                                                <strong className="text-emerald-300 font-mono text-[10px] uppercase tracking-wider">Topic Focus: </strong>
                                                {outlineItem.focus}
                                              </p>
                                            )}
                                          </div>

                                          {/* Stage Scripture References scaled by Learning Tier */}
                                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#89a58d] font-bold">
                                              Stage Scriptures:
                                            </span>
                                            {stg.coreTexts.slice(0, maxTextsForTier).map((refText) => (
                                              <button
                                                key={refText}
                                                type="button"
                                                onClick={() => handleNavigateToBibleStudy(refText)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#203627] hover:bg-[#2b4733] text-amber-200 border border-[#3b5e43] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                                title={`Open ${refText} in Bible Study`}
                                              >
                                                <BookOpen className="w-2.5 h-2.5 text-[#C9973A]" />
                                                <span>{refText}</span>
                                              </button>
                                            ))}
                                          </div>

                                          {/* Stage Teaching Prompt & Pedagogical Guidance */}
                                          <div className="bg-black/25 border border-white/5 rounded-lg p-2.5 text-xs space-y-1">
                                            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber-300 font-bold block">
                                              Stage {stg.number} Teaching Guide & Prompt:
                                            </span>
                                            <p className="text-stone-200 leading-relaxed">
                                              {stg.prompt}
                                            </p>
                                            {stageNote?.howToExplainToOthers && learningTier !== "Essential" && (
                                              <p className="text-stone-300 font-serif pt-1 border-t border-white/5">
                                                Tip: {stageNote.howToExplainToOthers}
                                              </p>
                                            )}
                                          </div>
                                        </motion.div>
                                      );
                                    })}

                                    {/* Next Gated Stage Indicator */}
                                    {unlockedStageCount < 5 && (
                                      <div className="bg-black/30 border border-dashed border-[#3b5d44] rounded-xl p-3 flex items-center justify-between gap-2 text-xs font-mono text-[#89a58d]">
                                        <span>
                                          🔒 Next Module Gated: Stage {unlockedStageCount + 1} ({stagesList[unlockedStageCount].title})
                                        </span>
                                        <span className="text-[10px] text-amber-300/80">
                                          Unlocks via stageAdvance tool post-speech
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ============================================================ */}
                            {/* SECTION: SCRIPTURE REFERENCES (SCALED BY LEARNING TIER)      */}
                            {/* ============================================================ */}
                            {(blackboardView === "all" || blackboardView === "scriptures") && (
                              <div className="space-y-3" id="blackboard-scriptures-section">
                                {(() => {
                                  const allScriptures = topicOverview.quotedScriptures || [];
                                  const tierMaxScriptures =
                                    learningTier === "Essential"
                                      ? Math.min(2, Math.max(1, unlockedStageCount))
                                      : learningTier === "Standard"
                                      ? Math.min(4, Math.max(2, unlockedStageCount))
                                      : Math.max(2, unlockedStageCount + 2);
                                  const visibleScriptures =
                                    blackboardView === "scriptures"
                                      ? allScriptures.slice(0, learningTier === "Essential" ? 3 : learningTier === "Standard" ? 5 : allScriptures.length)
                                      : allScriptures.slice(0, tierMaxScriptures);

                                  return (
                                    <>
                                      <div className="flex items-center justify-between border-b border-[#273c2d] pb-1.5">
                                        <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                                          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                                          <span>
                                            Scripture Reference Matrix ({visibleScriptures.length} of {allScriptures.length} Shown • {learningTier} Tier)
                                          </span>
                                        </span>
                                        <span className="text-[10px] font-mono text-[#89a58d]">Line upon Line</span>
                                      </div>

                                      <div className="space-y-2.5">
                                        {visibleScriptures.map((item, idx) => (
                                          <div
                                            key={item.reference + idx}
                                            className="bg-[#142319]/90 border border-[#2f4838] rounded-xl p-3.5 sm:p-4 space-y-2 hover:border-amber-400/40 transition-all shadow-md group"
                                          >
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                                              <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded bg-[#203627] text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center border border-[#3b5e43]">
                                                  {idx + 1}
                                                </span>
                                                <span className="text-amber-200 font-serif text-sm font-bold">
                                                  {item.reference}
                                                </span>
                                                {item.role && (
                                                  <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full">
                                                    {item.role}
                                                  </span>
                                                )}
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => handleNavigateToBibleStudy(item.reference)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-mono text-[10px] font-bold shadow transition-all cursor-pointer active:scale-95"
                                                title={`Open ${item.reference} in Bible Study module`}
                                              >
                                                <BookOpen className="w-3 h-3" />
                                                <span>Open in Bible Study</span>
                                                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                                              </button>
                                            </div>

                                            <p className="font-serif text-xs sm:text-sm text-[#e8f0e6] leading-relaxed pt-0.5">
                                              "<ScriptureLinkedText
                                                text={item.text}
                                                onNavigateRef={handleNavigateToBibleStudy}
                                              />"
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  );
                                })()}

                                {/* Stage-Separated Scripture Witnesses when viewing Scriptures Tab */}
                                {blackboardView === "scriptures" && (
                                  <div className="space-y-2.5 pt-2">
                                    <div className="flex items-center justify-between border-b border-[#273c2d] pb-1.5">
                                      <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold">
                                        Stage-Separated Scripture Witnesses (Unlocked Stages 1–{unlockedStageCount})
                                      </span>
                                    </div>
                                    {stagesList.slice(0, unlockedStageCount).map((stg) => (
                                      <div
                                        key={stg.id}
                                        className="bg-[#142319]/85 border border-[#2f4838] rounded-xl p-3 space-y-2"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-serif text-xs font-bold text-amber-200">
                                            Stage {stg.number}: {stg.title}
                                          </span>
                                          <span className="text-[10px] font-mono text-[#89a58d]">{stg.subtitle}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {stg.coreTexts.map((refText) => (
                                            <button
                                              key={refText}
                                              type="button"
                                              onClick={() => handleNavigateToBibleStudy(refText)}
                                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#203627] hover:bg-[#2b4733] text-amber-200 border border-[#3b5e43] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                            >
                                              <BookOpen className="w-3 h-3 text-[#C9973A]" />
                                              <span>{refText}</span>
                                              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ============================================================ */}
                            {/* SECTION: ELLEN WHITE'S WRITINGS (UNLOCKED AT STAGE 2+ OR TAB) */}
                            {/* ============================================================ */}
                            {((blackboardView === "all" && unlockedStageCount >= 2) || blackboardView === "egw") && (
                              <div className="space-y-3" id="blackboard-egw-section">
                                <div className="flex items-center justify-between border-b border-[#273c2d] pb-1.5">
                                  <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Ellen G. White Writings (Spirit of Prophecy)</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-[#89a58d]">Harmonious Commentary</span>
                                </div>

                                <div className="space-y-3">
                                  {(topicOverview.egwWritings || [])
                                    .slice(
                                      0,
                                      learningTier === "Essential"
                                        ? 1
                                        : blackboardView === "egw"
                                        ? undefined
                                        : Math.max(1, unlockedStageCount - 1)
                                    )
                                    .map((egw, idx) => (
                                      <div
                                        key={egw.source + idx}
                                        className="bg-[#17261d]/90 border border-amber-600/30 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-md"
                                      >
                                        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-1.5">
                                          <span className="font-serif text-xs sm:text-sm font-bold text-amber-200">
                                            {egw.work}
                                          </span>
                                          <span className="font-mono text-[10px] text-amber-300/80 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                                            {egw.source}
                                          </span>
                                        </div>

                                        <blockquote className="font-serif text-xs sm:text-sm text-[#f0ece1] leading-relaxed border-l-2 border-[#C9973A] pl-3 py-0.5">
                                          "{egw.quote}"
                                        </blockquote>

                                        {egw.theologicalContext && learningTier !== "Essential" && (
                                          <div className="text-[11px] font-sans text-stone-200 bg-black/35 p-2.5 rounded-lg border border-white/5 space-y-0.5">
                                            <span className="text-amber-300 font-mono font-bold text-[9.5px] uppercase tracking-wider block">
                                              Theological Illumination:
                                            </span>
                                            <p className="leading-relaxed text-stone-300">
                                              {egw.theologicalContext}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* ============================================================ */}
                            {/* SECTION: PEDAGOGY & NOTES (UNLOCKED AT STAGE 3+ OR TAB)      */}
                            {/* ============================================================ */}
                            {((blackboardView === "all" && unlockedStageCount >= 3) || blackboardView === "pedagogy") && (
                              <div className="space-y-4" id="blackboard-pedagogy-section">
                                <div className="flex items-center justify-between border-b border-[#273c2d] pb-1.5">
                                  <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Pedagogy, Teaching Examples & Notes</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-[#89a58d]">Teaching & Discipleship</span>
                                </div>

                                <div className="space-y-3">
                                  {(topicOverview.explanatoryNotes || [])
                                    .slice(
                                      0,
                                      learningTier === "Essential"
                                        ? 1
                                        : blackboardView === "pedagogy"
                                        ? undefined
                                        : unlockedStageCount
                                    )
                                    .map((note, idx) => (
                                      <div
                                        key={note.title + idx}
                                        className="bg-[#142319]/90 border border-[#2f4838] rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-md"
                                      >
                                        <div className="border-b border-[#2f4838] pb-1.5 flex items-center justify-between">
                                          <h4 className="font-serif text-sm font-bold text-amber-200 flex items-center gap-1.5">
                                            <PenLine className="w-3.5 h-3.5 text-[#C9973A]" />
                                            <span>{note.title}</span>
                                          </h4>
                                          <span className="text-[9.5px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded">
                                            Stage {Math.min(5, idx + 1)} Pedagogy
                                          </span>
                                        </div>

                                        <div className="text-xs text-stone-200 font-sans space-y-1">
                                          <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#89a58d] font-bold block">
                                            Biblical / Doctrinal Note:
                                          </span>
                                          <p className="leading-relaxed text-stone-300">
                                            {note.lexicalOrDoctrinalNote}
                                          </p>
                                        </div>

                                        {note.howToExplainToOthers && (
                                          <div className="bg-[#1b2d21] border border-[#3b5f44] p-3 rounded-lg text-xs space-y-1">
                                            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1">
                                              <Sparkles className="w-3 h-3 text-amber-400" />
                                              <span>How to Explain to Others:</span>
                                            </span>
                                            <p className="leading-relaxed text-stone-200">
                                              {note.howToExplainToOthers}
                                            </p>
                                          </div>
                                        )}

                                        {note.analogyOrIllustration && learningTier !== "Essential" && (
                                          <div className="bg-amber-950/20 border border-amber-600/30 p-2.5 rounded-lg text-xs space-y-0.5">
                                            <span className="font-mono text-[9.5px] uppercase tracking-wider text-amber-300/90 font-bold block">
                                              Teaching Example / Concrete Analogy:
                                            </span>
                                            <p className="text-stone-300 leading-relaxed font-serif">
                                              {note.analogyOrIllustration}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                  {/* Scripture Keywords Checklist */}
                                  <div className="bg-[#142319]/80 border border-[#273c2d] p-3 rounded-xl space-y-1.5">
                                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#89a58d] font-bold block">
                                      Active Topic Keywords Checklist:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {scoreStats.foundKeywords.length === 0 ? (
                                        <span className="text-[11px] text-stone-400 font-serif">
                                          Awaiting keywords detection in dialogue...
                                        </span>
                                      ) : (
                                        scoreStats.foundKeywords.map((kw) => (
                                          <span
                                            key={kw}
                                            className="font-mono text-[9.5px] px-2 py-0.5 border rounded-md bg-emerald-950/60 border-emerald-600/40 text-emerald-300 flex items-center gap-1"
                                          >
                                            <span>✓</span>
                                            <span>{kw}</span>
                                          </span>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  {/* Student Blackboard Jottings inside Pedagogy & Notes */}
                                  <div className="space-y-2 pt-1" id="blackboard-jottings-section">
                                    <div className="flex items-center justify-between border-b border-[#273c2d] pb-1.5">
                                      <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
                                        <PenLine className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Student Instructional Notes</span>
                                      </span>
                                      <span className="text-[10px] font-mono text-[#89a58d]">Included in PDF / DOCS Download</span>
                                    </div>

                                    <div className="space-y-2">
                                      <textarea
                                        value={blackboardNotes}
                                        onChange={(e) => {
                                          setBlackboardNotes(e.target.value);
                                          try {
                                            localStorage.setItem(`stba_blackboard_notes_${scripture.id}`, e.target.value);
                                          } catch (_) {}
                                        }}
                                        placeholder="Write your study notes, personal analogies, or stage takeaways here..."
                                        rows={4}
                                        className="w-full bg-[#142319] border border-[#2f4838] rounded-xl p-3 text-xs sm:text-sm font-sans text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 scrollbar-thin resize-y"
                                      />
                                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                                        <span>Saved automatically to session storage</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setBlackboardNotes("");
                                            try {
                                              localStorage.removeItem(`stba_blackboard_notes_${scripture.id}`);
                                            } catch (_) {}
                                            triggerToast("Instructional notes cleared.");
                                          }}
                                          className="text-stone-400 hover:text-red-300 underline cursor-pointer"
                                        >
                                          Clear Notes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* LIVE SCORECARD HUD SUMMARY */}
                            <div className="bg-[#142319]/80 border border-[#2f4838] rounded-xl p-3 sm:p-4 space-y-2 select-none">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-amber-200 font-bold uppercase tracking-wider">
                                  Mastery Scorecard HUD:
                                </span>
                                <span className="text-emerald-400 font-black text-xs">
                                  {scoreStats.overallScore}% ({getMasteryLevelText(scoreStats.overallScore)})
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-300 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(5, (completedStagesCount / 5) * 100)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[9px] font-mono text-[#89a58d]">
                                <span>Stage Progress: {completedStagesCount} of 5 Stages Mastered</span>
                                <span>{Math.round((completedStagesCount / 5) * 100)}% Complete</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* 3. BLACKBOARD WOODEN CHALK RAIL / LEDGE (LOCKED AT BOTTOM OF BLACKBOARD ONCE INITIALIZED) */}
                      <div
                        className="h-7 bg-gradient-to-r from-[#2c1d11] via-[#432d1a] to-[#2c1d11] border-t-2 border-[#5c3e24] shadow-inner flex items-center justify-between px-6 select-none shrink-0"
                        id="blackboard-chalk-rail"
                      >
                        {/* Visual Chalk Sticks */}
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-2 bg-stone-100 rounded-sm shadow rotate-2 border border-stone-300" title="White Chalk" />
                          <div className="w-6 h-2 bg-amber-200 rounded-sm shadow -rotate-1 border border-amber-300" title="Yellow Chalk" />
                          <div className="w-7 h-2 bg-sky-200 rounded-sm shadow rotate-1 border border-sky-300" title="Blue Chalk" />
                        </div>

                        {/* Felt Blackboard Eraser Graphic */}
                        <div 
                          className="w-16 h-3 bg-[#543d2b] border border-[#78593f] rounded-sm flex items-center justify-center text-[7.5px] font-mono text-stone-300 tracking-widest uppercase shadow-md"
                          title="STBA Felt Blackboard Eraser"
                        >
                          ERASER
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ============================================================== */}
                {/* MOBILE SCORECARD VIEW (WHEN ACTIVE TAB IS SCORECARD)           */}
                {/* ============================================================== */}
                {activeMobileTab === "scorecard" && (
                  <div className="col-span-12 lg:hidden w-full space-y-4">
                    <div className="bg-[#141A27] border border-white/10 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] block font-extrabold">Mastery HUD</span>
                          <h3 className="font-serif text-base font-bold text-stone-100">Live Session Score</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#C9973A]/20 to-[#C9973A]/5 border-2 border-[#C9973A] rounded-xl flex items-center justify-center font-bold text-lg text-white">
                          {scoreStats.overallScore}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        {stagesList.map((st) => {
                          const sc = scoreStats.stageScores[st.id] || 0;
                          return (
                            <div key={st.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                              <span className="font-sans text-stone-200">Stage {st.number}: {st.title}</span>
                              <span className="font-mono font-bold text-[#C9973A]">{sc}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* ============================================== */}
          {/* 3. SCORING DASHBOARD REPORT & REFLECTION       */}
          {/* ============================================== */}
          {phase === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left w-full h-full"
              id="teach-it-feedback-screen"
            >
              {/* CELEBRATION HERO BANNER */}
              <div className="w-full bg-gradient-to-r from-amber-500/20 via-[#C9973A]/30 to-emerald-500/20 border-2 border-[#C9973A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#C9973A]/30 border border-[#C9973A] px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-200 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      <span>Active Topic Mastery Celebration • {learningTier} Tier</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                      🎉 {topicOverview?.topicTitle || scripture.reference}: All 5 Stages Completed!
                    </h2>
                    <p className="text-stone-200 text-sm max-w-xl font-sans leading-relaxed">
                      Congratulations on thoroughly analyzing, contextualizing, doctrinally defending, and winsomely preparing to teach <span className="font-bold text-[#C9973A]">{topicOverview?.scriptureReference || scripture.reference}</span>.
                    </p>
                  </div>

                  {/* Grand Total Score Showcase */}
                  <div className="flex flex-col items-center justify-center bg-[#141A27]/90 border border-white/15 p-5 rounded-2xl shadow-xl min-w-[180px] text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold">
                      Grand Total Score
                    </span>
                    <div className="font-sans font-black text-4xl sm:text-5xl text-white my-1 tracking-tight">
                      {scoreStats.overallScore}%
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {getMasteryLevelText(scoreStats.overallScore)}
                    </span>
                    <button
                      onClick={() => showConfetti('teach', 'Hallelujah! All 5 Study Stages Mastered!')}
                      className="mt-3 px-3 py-1 bg-[#C9973A]/20 hover:bg-[#C9973A]/40 border border-[#C9973A]/50 text-amber-200 text-[10px] font-mono uppercase rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Celebrate Again 🎉</span>
                    </button>
                  </div>
                </div>

                {/* 5-STAGE EVALUATION MINI-CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-white/10">
                  {stagesList.map((st) => {
                    const stScore = scoreStats.stageScores[st.id] || scoreStats.overallScore || 85;
                    return (
                      <div
                        key={st.id}
                        className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                          <span>Stage {st.number}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-stone-200 line-clamp-1 mb-2">
                          {st.title}
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-mono text-stone-400">Score:</span>
                          <span className="text-sm font-sans font-black text-emerald-400">
                            {stScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRIMARY ROW: HEADER HERO SUMMARY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Score Circular presentation badge */}
                <div className="lg:col-span-8 bg-[#141A27] border border-white/5 rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative shadow-lg">
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono tracking-widest text-[#C9973A] uppercase font-bold block">
                      Active Conversational Topic Summary • {learningTier} Tier
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {topicOverview?.topicTitle || scripture.reference} ({topicOverview?.scriptureReference || scripture.reference})
                    </h3>
                    <p className="text-stone-300 text-xs sm:text-[12.5px] leading-relaxed max-w-[430px]">
                      {topicOverview?.historicalContext || ""}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 block">ACTIVE PROFILE</span>
                        <span className="text-xs font-semibold text-stone-100">{userRole} background</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 block">LEARNING TIER</span>
                        <span className="text-xs font-semibold text-[#C9973A]">{learningTier} Volume</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular score display */}
                  <div className="flex flex-col items-center gap-1 shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 text-center min-w-[130px]">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-stone-300 block font-bold">
                      Mastery Score
                    </span>
                    
                    <div className="relative w-20 h-20 flex items-center justify-center mt-1">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="text-white/10"
                          strokeWidth="5.5"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="text-[#C9973A]"
                          strokeWidth="5.5"
                          strokeDasharray="201"
                          strokeDashoffset={201 - (201 * scoreStats.overallScore) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-sans font-extrabold text-xl text-white">
                        {scoreStats.overallScore}%
                      </span>
                    </div>

                    <span className="text-[10px] font-mono uppercase text-[#C9973A] mt-2 block font-extrabold">
                      {getMasteryLevelText(scoreStats.overallScore)}
                    </span>
                  </div>
                </div>

                {/* GAPS ALERT CALLOUT BOX */}
                <div className="lg:col-span-4 bg-[#C9973A]/10 border border-[#C9973A]/20 p-5 rounded-[12px] flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Active Recall Gaps Track</span>
                    </span>
                    <h4 className="font-serif font-bold text-sm text-stone-200">
                      Unresolved Topic Nodes ({topicOverview?.topicTitle || scripture.reference})
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scoreStats.gaps.length > 0 ? (
                        scoreStats.gaps.map((g) => (
                          <span key={g} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-mono text-[9px] px-1.5 py-0.5 rounded">
                            • {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 font-mono text-[10px] font-bold">
                          ✓ Perfect recall! No outstanding keyword gaps.
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#C9973A] font-semibold pt-3 block leading-tight">
                    Advice: Incorporate missed terms in follow-up sessions on {topicOverview?.topicTitle || scripture.reference}.
                  </span>
                </div>

              </div>

              {/* KEYWORDS IDENTIFIED IN PASSAGE TEXT */}
              <div className="bg-[#141A27] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#C9973A]/20 text-[#C9973A] rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
                        Theological Keywords Analysis
                      </span>
                      <h4 className="font-serif text-base font-bold text-white">
                        Keywords Identified in {topicOverview?.scriptureReference || scripture.reference}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ {scoreStats.foundKeywords.length} Identified
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      ⚠ {scoreStats.gaps.length} Gaps
                    </span>
                  </div>
                </div>

                {/* Highlighted Passage Text */}
                {renderHighlightedScriptureText(scripture.text, scoreStats.foundKeywords, scoreStats.gaps)}

                {/* Keywords Tag Badges */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] uppercase text-stone-400">Mastered Terms:</span>
                    {scoreStats.foundKeywords.length === 0 ? (
                      <span className="text-stone-500 font-serif text-xs">No keywords detected yet</span>
                    ) : (
                      scoreStats.foundKeywords.map((kw) => (
                        <span key={kw} className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 rounded-lg font-mono text-[11px] font-bold">
                          ✓ {kw}
                        </span>
                      ))
                    )}
                  </div>
                  {scoreStats.gaps.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-[10px] uppercase text-amber-400">Missing Gaps:</span>
                      {scoreStats.gaps.map((g) => (
                        <span key={g} className="px-2.5 py-1 bg-red-500/10 border border-dashed border-red-400/60 text-red-300 rounded-lg font-mono text-[11px]">
                          • {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE-BY-STAGE BREAKDOWN: 5 ROWS */}
              <div className="bg-[#141A27] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#C9973A]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#C9973A] font-extrabold">
                      Stage-by-Stage Study Breakdown ({topicOverview?.topicTitle || scripture.reference})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">5 Distinct Assessment Stages</span>
                </div>

                <div className="space-y-3.5 divide-y divide-white/5" id="stage-breakdown-rows">
                  {stagesList.map((stg) => {
                    const sc = scoreStats.stageScores[stg.id] || 85;
                    const feedback = scoreStats.stageFeedback[stg.id] || `Solid engagement with Stage ${stg.number} (${stg.title}) on ${topicOverview?.topicTitle || scripture.reference}.`;
                    return (
                      <div key={stg.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px] text-stone-300 font-bold">
                              {stg.number}
                            </span>
                            <span className="font-serif font-bold text-stone-200 text-sm">Stage {stg.number}: {stg.title}</span>
                            <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">• {stg.subtitle}</span>
                          </div>
                          <p className="text-xs text-stone-300 font-sans leading-relaxed pl-7">
                            {feedback}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pl-7 sm:pl-0">
                          <div className="w-24 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${sc >= 85 ? "bg-emerald-400" : sc >= 75 ? "bg-[#C9973A]" : "bg-red-400"}`}
                              style={{ width: `${sc}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-black text-stone-200 bg-white/5 px-2.5 py-1 border border-white/10 rounded-lg min-w-[64px] text-center">
                            {sc}/100
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GAPS BY STAGE: PRIORITY THEOLOGICAL GROWTH CARD */}
              {(() => {
                const worstGapInfo = getStageWithMostGaps();
                return (
                  <div id="gaps-by-stage-card" className="bg-[#1C2333] border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold block">
                            Priority Growth Opportunity
                          </span>
                          <h4 className="font-serif text-lg font-bold text-white">
                            Stage with Most Missing Content: Stage {worstGapInfo.stage.number} — {worstGapInfo.stage.title}
                          </h4>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl font-mono text-xs font-bold text-amber-300">
                        Evaluated Score: {worstGapInfo.score}/100
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed">
                      {worstGapInfo.feedback}
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
                      <span className="font-mono text-[10px] text-[#C9973A] uppercase tracking-wider block font-bold">
                        Elder Stephen's Pastoral Recommendation for Stage {worstGapInfo.stage.number}:
                      </span>
                      <p className="text-stone-300 font-serif leading-relaxed">
                        "To bring this stage on {topicOverview?.topicTitle || scripture.reference} to true mastery, focus on anchoring your presentation directly in {worstGapInfo.stage.coreTexts.join(", ")}. In future sessions, articulate how these scriptures address opposing objections before transitioning."
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* SPIRIT OF PROPHECY / EGW CONNECTION (Scaled by Learning Tier) */}
              {learningTier !== "Essential" && (
                <div className="bg-[#141A27] rounded-2xl border border-white/10 p-5 sm:p-6 text-left space-y-3 relative shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 select-none">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C9973A]" />
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#C9973A] uppercase">
                        Spirit of Prophecy Connection • {topicOverview?.topicTitle || scripture.reference}
                      </span>
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono">Surfaced Ellen G. White Text</span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif text-stone-200 leading-relaxed select-text border-l-2 border-[#C9973A] pl-3.5 py-0.5">
                    "{scoreStats.ellenWhiteQuote}"
                  </p>
                </div>
              )}

              {/* EVANGELIST MODE EXTRA CARD: PUBLIC READINESS SCORE & TIPS (Scaled by Learning Tier) */}
              <div className="bg-gradient-to-br from-[#1C2333] to-[#141A27] border-2 border-[#C9973A]/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#C9973A]/20 text-[#C9973A] rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9973A] font-extrabold block">
                        Lay Evangelist & Public Presentation Review
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white">
                        Public Readiness Score ({topicOverview?.topicTitle || scripture.reference})
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3.5 py-1.5 bg-[#C9973A]/20 border border-[#C9973A]/40 rounded-xl text-center">
                      <span className="font-sans font-black text-2xl text-[#D2A650]">
                        {publicReadinessScore || Math.min(100, Math.round((scoreStats.stageScores.stage5 || 85) * 0.95 + 5))}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold block">
                    Tips for Presenting {topicOverview?.topicTitle || scripture.reference} to a Non-Adventist Audience:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {evangelistTips.slice(0, learningTier === "Essential" ? 1 : learningTier === "Standard" ? 2 : 3).map((tip, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-[#C9973A] font-mono text-xs font-bold">
                          <span className="w-5 h-5 rounded-full bg-[#C9973A]/20 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>Tip #{idx + 1}</span>
                        </div>
                        <p className="text-xs text-stone-300 font-sans leading-relaxed">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- HOMILETIC OUTLINE DRAFT & ELDER STEPHEN GENERATOR --- */}
              <div className="bg-[#141A27]/80 border border-[#C9973A]/10 p-5 sm:p-6 rounded-[12px] text-left space-y-4">
                <div className="border-b border-white/5 pb-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#C9973A] font-extrabold block">
                    Teach‑It Studio Homiletics
                  </span>
                  <h3 className="font-serif font-bold text-md sm:text-lg text-white mt-0.5">
                    Homiletic Teaching Outline: {topicOverview?.topicTitle || scripture.reference}
                  </h3>
                  <p className="text-stone-400 text-xs font-medium mt-1 font-sans">
                    Construct your custom teaching segments for {topicOverview?.scriptureReference || scripture.reference}. Elder Stephen will evaluate layout consistency, scriptural harmony, and audience adaptations.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/5 p-2.5 rounded-lg border border-white/10">
                    <label className="text-xs text-stone-300 font-mono font-bold flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-[#C9973A]" />
                      Target Audience Adaptation:
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as any)}
                      className="bg-[#141A27] border border-white/10 rounded px-2.5 py-1 text-xs text-stone-200 outline-none focus:border-[#C9973A] font-sans"
                    >
                      <option value="Child">Child</option>
                      <option value="New Believer">New Believer</option>
                      <option value="Mature Student">Mature Student</option>
                    </select>
                  </div>

                  <textarea
                    value={teachingDraftOutline}
                    onChange={(e) => {
                      setTeachingDraftOutline(e.target.value);
                      localStorage.setItem(`stba_teach_it_outline_${scripture.id}`, e.target.value);
                    }}
                    placeholder={`Enter your lecture introduction, study blocks, and closing appeal for ${topicOverview?.topicTitle || scripture.reference}...`}
                    rows={6}
                    className="w-full bg-[#18181B] border border-stone-800 rounded-lg p-3 text-xs sm:text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] font-sans leading-relaxed"
                  />

                  <div className="flex justify-between items-center">
                    {isGeneratingOutline ? (
                      <span className="text-[10px] font-mono text-[#C9973A] animate-pulse">
                        Evaluating outline architecture...
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-400">
                        Evaluates structure against the Three Angels' message context
                      </span>
                    )}
                    <button
                      disabled={teachingDraftOutline.trim().length < 15 || isGeneratingOutline}
                      onClick={handleGenerateOutlineWithElder}
                      className="px-4 py-2 bg-[#C9973A] hover:bg-[#B5852F] text-stone-950 font-bold rounded-lg text-[10px] font-mono transition-all disabled:opacity-45"
                    >
                      {isGeneratingOutline ? "Coaching..." : "Verify Outline with Elder Stephen"}
                    </button>
                  </div>

                  {outlineFeedback && (
                    <div className="p-3.5 bg-stone-900/90 border-l-2 border-[#C9973A] rounded-lg text-xs leading-relaxed text-stone-300 elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased">
                      &ldquo;{outlineFeedback}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* --- STUDY SOLEMN DEVOTIONAL REFLECTION (AFTER EVERY SESSION) --- */}
              <div className="bg-[#1C2333] border border-[#C9973A]/20 p-5 sm:p-6 rounded-[12px] text-left space-y-4">
                <div className="border-b border-stone-800 pb-2.5">
                  <span className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-[#C9973A] font-extrabold block">
                    Solemn Active Reflection
                  </span>
                  <h3 className="font-serif font-bold text-md sm:text-lg text-white mt-0.5">
                    Devotional Reflection Prompt ({topicOverview?.topicTitle || scripture.reference})
                  </h3>
                  <p className="text-stone-400 text-xs font-medium mt-1 font-serif">
                     "Scripture studied. Now respond. What is God revealing about His character? What is He asking you to trust, release, or do today?"
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-serif block text-stone-200">
                    {scoreStats.devotionalPrompt}
                  </span>

                  <textarea
                    value={devotionalReflection}
                    onChange={(e) => setDevotionalReflection(e.target.value)}
                    placeholder="Write down your heart responses, study vows, life adjustments, or a prayer. These are secured and tracked in your Scripture Memory Vault..."
                    rows={4}
                    disabled={hasSavedReflection}
                    className="w-full bg-[#141A27]/80 border border-stone-800 rounded-lg p-3 text-xs sm:text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#C9973A] font-serif leading-relaxed"
                  />

                  {hasSavedReflection ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-[8px] text-emerald-300 text-xs flex items-center gap-2 font-serif font-light animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Scripture study reflection on {topicOverview?.topicTitle || scripture.reference} committed to your spiritual journal. Peace be with you!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveToSpiritualJournal}
                      disabled={!devotionalReflection.trim()}
                      className="py-2.5 px-6 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-[8px] transition-all cursor-pointer disabled:opacity-40"
                    >
                      Save to Memory Journal
                    </button>
                  )}
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS REQUIRED BY USER */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 select-none">
                <button
                  type="button"
                  onClick={() => {
                    const gapEl = document.getElementById("gaps-by-stage-card");
                    if (gapEl) {
                      gapEl.scrollIntoView({ behavior: "smooth", block: "center" });
                      triggerToast("Scrolled to priority gaps and recommendations!");
                    }
                  }}
                  className="w-full sm:w-auto py-3 px-6 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Study my gaps →</span>
                </button>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Download Summary Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                      className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-white/15"
                      id="btn-download-session-summary"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                    {/* dropdown */}
                    <AnimatePresence>
                      {showDownloadDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowDownloadDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-2 right-0 w-60 bg-[#141A27] border border-white/10 rounded-xl shadow-2xl p-2 z-20 space-y-1"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                downloadSummaryAsTxt();
                                setShowDownloadDropdown(false);
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition flex items-center gap-2 text-xs text-stone-200 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-stone-400" />
                              <span>Plain-Text File (.txt)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                downloadSummaryAsHtml();
                                setShowDownloadDropdown(false);
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-[#C9973A]/10 transition flex items-center gap-2 text-xs text-stone-200 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#C9973A]" />
                              <span>Printable HTML Report</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleExitStudio}
                    className="py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBeginSession}
                    className="py-3 px-6 border border-[#C9973A]/40 hover:border-[#C9973A] text-[#C9973A] font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Start Clean Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveToSpiritualJournal();
                      showConfetti('teach', `Study analysis on ${topicOverview?.topicTitle || scripture.reference} recorded in Memory Vault!`);
                    }}
                    className="py-3 px-6 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save analysis to journal</span>
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      </div>
    </div>
  );
};
