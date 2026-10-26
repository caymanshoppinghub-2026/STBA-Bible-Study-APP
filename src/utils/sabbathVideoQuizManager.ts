/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoQuizOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface VideoQuizQuestion {
  id: string;
  checkpointIndex: number;
  timestampSeconds: number;
  timestampLabel: string;
  title: string;
  question: string;
  options: VideoQuizOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  scriptureRef: string;
  channel: string;
  channelName: string;
  segmentTopic?: string;
  contextSummary?: string;
}

export const CHANNEL_NAMES: Record<string, string> = {
  percy: "Dr. Percy Harrold – The Conditions of Fellowship",
  featured: "Featured Video – Claudio Carneiro",
  itiswritten: "It Is Written – Sabbath School Lesson",
  hope: "Hope Sabbath School – Weekly Study",
  threeABN: "3ABN Sabbath School Panel",
  egwNotes: "Ellen White Notes – Daily Commentary",
  ssPM: "3ABN Sabbath School Panel"
};

// Curated high-yield SDA doctrinal questions structured around natural, logical segment breakpoints
// in the telecast where a complete theological theme has just concluded.
export const CURATED_CHANNEL_QUIZZES: Record<string, VideoQuizQuestion[]> = {
  // 0. Dr. Percy Harrold – The Conditions of Fellowship (Lesson 9)
  percy: [
    {
      id: "percy-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 165,
      timestampLabel: "2:45",
      segmentTopic: "The Ministry of Affliction & Sacred Tears",
      contextSummary: "Dr. Percy Harrold introduces Paul's deep pastoral anguish and personal tears when writing to the church at Corinth (2 Cor 2:4).",
      title: "The Conditions of Fellowship (2 Cor 2:4)",
      question: "In this foundational teaching segment, what is the central theme of 2 Corinthians 2:4, and how does it establish the biblical foundation for Christian fellowship?",
      options: [
        {
          id: "A",
          text: "The importance of financial support and administrative control in the church."
        },
        {
          id: "B",
          text: "The need for sacrificial love, pastoral grief over sin, and genuine unity among believers."
        },
        {
          id: "C",
          text: "The assertion of apostolic authority to punish dissenters without appeal."
        },
        {
          id: "D",
          text: "The necessity of imposing legalistic ceremonial penances before restoration."
        }
      ],
      correctAnswer: "B",
      explanation: "Paul's earnest appeal with many tears in 2 Corinthians 2:4 demonstrates that genuine fellowship in the body of Christ is rooted in sacrificial, restoring love and unity rather than punitive harshness.",
      scriptureRef: "2 Corinthians 2:4",
      channel: "percy",
      channelName: "Dr. Percy Harrold – The Conditions of Fellowship"
    },
    {
      id: "percy-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 330,
      timestampLabel: "5:30",
      segmentTopic: "Forgiveness & Restoring Holy Fellowship",
      contextSummary: "Discussion on handling church discipline with redemptive mercy to prevent a repentant believer from being overwhelmed by despair (2 Cor 2:7–8).",
      title: "Forgiveness & Restoration in the Church (2:7–8)",
      question: "When a believer has caused grief in the congregation (2 Cor 2:7), what pastoral counsel does Paul give to preserve holy fellowship?",
      options: [
        {
          id: "A",
          text: "Publicly ostracize and permanently banish them from Sabbath worship."
        },
        {
          id: "B",
          text: "Forgive and comfort them, lest they be swallowed up with too much sorrow, and reaffirm love toward them."
        },
        {
          id: "C",
          text: "Require them to perform public penance before the congregation."
        },
        {
          id: "D",
          text: "Ignore moral transgression entirely without offering pastoral guidance."
        }
      ],
      correctAnswer: "B",
      explanation: "Paul instructs the church to forgive and comfort the penitent member so they are not consumed by overwhelming sorrow, reaffirming Christ's transforming love (2 Corinthians 2:7–8).",
      scriptureRef: "2 Corinthians 2:7–8",
      channel: "percy",
      channelName: "Dr. Percy Harrold – The Conditions of Fellowship"
    },
    {
      id: "percy-cp-3",
      checkpointIndex: 3,
      timestampSeconds: 540,
      timestampLabel: "9:00",
      segmentTopic: "Defeating Satan's Schemes through Reconciliation",
      contextSummary: "Exegesis on 2 Corinthians 2:11 showing how unresolved bitterness and unforgiveness allow the adversary to fracture church unity.",
      title: "Defeating Satan's Devices Through Reconciliation (2:11)",
      question: "According to 2 Corinthians 2:11, why is prompt mutual forgiveness essential among Christian believers in church fellowship?",
      options: [
        {
          id: "A",
          text: "Lest Satan should take advantage of us; for we are not ignorant of his devices."
        },
        {
          id: "B",
          text: "To prove that biblical discipline is unnecessary in church governance."
        },
        {
          id: "C",
          text: "To avoid civil Roman court lawsuits."
        },
        {
          id: "D",
          text: "Because Christian fellowship requires compromising doctrinal truth."
        }
      ],
      correctAnswer: "A",
      explanation: "Unforgiveness, bitterness, and division create an open door for Satan to divide the body of Christ. Disciples must overcome his schemes through compassionate reconciliation (2 Corinthians 2:11).",
      scriptureRef: "2 Corinthians 2:11",
      channel: "percy",
      channelName: "Dr. Percy Harrold – The Conditions of Fellowship"
    },
    {
      id: "percy-cp-4",
      checkpointIndex: 4,
      timestampSeconds: 780,
      timestampLabel: "13:00",
      segmentTopic: "The Triumphal Procession & Fragrance of Christ",
      contextSummary: "Paul's climax in 2 Corinthians 2:14–17 depicting believers being led in Christ's triumph and diffusing His heavenly knowledge.",
      title: "The Triumph and Fragrance of Christ in Ministry (2:14–15)",
      question: "In 2 Corinthians 2:14–15, how does Paul describe the ultimate outcome of faithful Christian fellowship and gospel ministry?",
      options: [
        {
          id: "A",
          text: "Secular political power and institutional dominance over surrounding cultures."
        },
        {
          id: "B",
          text: "God always leads us in triumph in Christ, diffusing through us the fragrance of His knowledge in every place."
        },
        {
          id: "C",
          text: "Complete personal exemption from trials, persecution, or grief."
        },
        {
          id: "D",
          text: "Peddling the Word of God for commercial gain and popularity."
        }
      ],
      correctAnswer: "B",
      explanation: "God leads His people in perpetual spiritual triumph through Christ Jesus, making our loving fellowship and faithful testimony a sweet savor of the knowledge of God to the world (2 Corinthians 2:14–15).",
      scriptureRef: "2 Corinthians 2:14–15",
      channel: "percy",
      channelName: "Dr. Percy Harrold – The Conditions of Fellowship"
    }
  ],
  featured: [
    {
      id: "featured-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 165,
      timestampLabel: "2:45",
      segmentTopic: "Comfort in Tribulation for Service",
      contextSummary: "Pastor Claudio Carneiro opens by exploring 2 Corinthians 1:3–4 and how personal trials train believers to minister Christ's comfort to others.",
      title: "Introduction & Comfort in Tribulation (2 Cor 1:3–4)",
      question: "In this opening foundational segment, according to 2 Corinthians 1:3–4, why does the 'Father of mercies and God of all comfort' comfort believers in all their tribulations?",
      options: [
        {
          id: "A",
          text: "To guarantee that Christians will be exempted from any future trial or loss in this world."
        },
        {
          id: "B",
          text: "So that we may be able to comfort those in any trouble with the comfort we ourselves receive from God."
        },
        {
          id: "C",
          text: "To prove that worldly wealth and personal ease are the guaranteed rewards of piety."
        },
        {
          id: "D",
          text: "As a sign that physical suffering is always a punishment for personal sins."
        }
      ],
      correctAnswer: "B",
      explanation: "Scripture teaches that God comforts us in all our tribulation so that we become compassionate conduits of His comfort, equipping us to minister tenderly to others undergoing affliction (2 Corinthians 1:3–4).",
      scriptureRef: "2 Corinthians 1:3–4",
      channel: "featured",
      channelName: "Featured Video – Claudio Carneiro"
    },
    {
      id: "featured-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 330,
      timestampLabel: "5:30",
      segmentTopic: "Shattering Self-Reliance on the Living God",
      contextSummary: "Examination of Paul's perils in Asia and why God allowed the sentence of death to rest upon his ministry (2 Cor 1:8–9).",
      title: "Relying on God Who Raises the Dead (2 Cor 1:8–9)",
      question: "In the discussion on Paul's severe hardships in Asia (2 Cor 1:8–9), what divine purpose did facing the 'sentence of death' accomplish?",
      options: [
        {
          id: "A",
          text: "That they should not rely on themselves, but on God who raises the dead."
        },
        {
          id: "B",
          text: "To convince Paul to cease his missionary journeys and retire."
        },
        {
          id: "C",
          text: "To demonstrate that human willpower alone is sufficient to overcome earthly peril."
        },
        {
          id: "D",
          text: "To prove that the gospel message was failing under imperial persecution."
        }
      ],
      correctAnswer: "A",
      explanation: "Paul explicitly states that having the sentence of death in themselves shattered all self-reliance, anchoring total faith in the resurrection power of God Almighty (2 Corinthians 1:9).",
      scriptureRef: "2 Corinthians 1:8–9",
      channel: "featured",
      channelName: "Featured Video – Claudio Carneiro"
    },
    {
      id: "featured-cp-3",
      checkpointIndex: 3,
      timestampSeconds: 540,
      timestampLabel: "9:00",
      segmentTopic: "All Promises 'Yes' and 'Amen' in Christ",
      contextSummary: "A deep dive into 2 Corinthians 1:20 showing how Christ is the faithful guarantor of all divine covenants and promises.",
      title: "All God's Promises are Yes in Christ (2 Cor 1:20)",
      question: "From the biblical exegesis just presented, what does Paul affirm in 2 Corinthians 1:20 concerning all the promises of God?",
      options: [
        {
          id: "A",
          text: "They are conditional upon human perfection prior to salvation."
        },
        {
          id: "B",
          text: "They were fulfilled exclusively for national ancient Israel and expired."
        },
        {
          id: "C",
          text: "For all the promises of God in Him are 'Yes,' and in Him 'Amen,' to the glory of God through us."
        },
        {
          id: "D",
          text: "They depend on the political stability and approval of worldly kingdoms."
        }
      ],
      correctAnswer: "C",
      explanation: "In Christ Jesus, every divine promise finds its definitive 'Yes' and steadfast 'Amen'. Christ is the infallible guarantor of all covenant blessings promised by the Father (2 Corinthians 1:20).",
      scriptureRef: "2 Corinthians 1:20",
      channel: "featured",
      channelName: "Featured Video – Claudio Carneiro"
    },
    {
      id: "featured-cp-4",
      checkpointIndex: 4,
      timestampSeconds: 780,
      timestampLabel: "13:00",
      segmentTopic: "Treasure in Earthen Vessels: Divine Power",
      contextSummary: "Conclusion on 2 Corinthians 4:7 explaining why God entrusts His transcendent gospel to mortal, frail human messengers.",
      title: "Treasure in Earthen Vessels (2 Cor 4:7)",
      question: "Reflecting on this concluding segment, why does God place the glorious treasure of gospel ministry into frail 'earthen vessels' (2 Corinthians 4:7)?",
      options: [
        {
          id: "A",
          text: "To prove that only scholarly or wealthy believers can effectively share the message."
        },
        {
          id: "B",
          text: "That the excellence of the power may be of God and not of ourselves."
        },
        {
          id: "C",
          text: "Because God cannot work through angels or supernatural revelations."
        },
        {
          id: "D",
          text: "To encourage believers to focus on physical adornment and human charisma."
        }
      ],
      correctAnswer: "B",
      explanation: "God chooses mortal, frail human instruments so that all glory, transforming power, and salvation are clearly recognized as belonging to God alone, never to human eloquence (2 Corinthians 4:7).",
      scriptureRef: "2 Corinthians 4:7",
      channel: "featured",
      channelName: "Featured Video – Claudio Carneiro"
    }
  ],

  // 2. Ellen White Notes – Daily Commentary
  egwNotes: [
    {
      id: "egw-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 70,
      timestampLabel: "1:10",
      segmentTopic: "Secret of Divine Power in Consecrated Ministry",
      contextSummary: "Ellen White's profound observations on the necessity of uninterrupted communion with God before attempting public service (Sabbath Afternoon study).",
      title: "Secret of Divine Power in Ministry",
      question: "In this opening segment of Ellen G. White's commentary on gospel ministry, what is identified as the indispensable source of spiritual power in Christian labor?",
      options: [
        {
          id: "A",
          text: "Popular applause and secular intellectual accolades."
        },
        {
          id: "B",
          text: "Unbroken communion with Christ through earnest prayer and deep meditation on the Word of God."
        },
        {
          id: "C",
          text: "Compromising distinctive doctrinal truths to attract large crowds."
        },
        {
          id: "D",
          text: "Relying on administrative machinery rather than the Holy Spirit's presence."
        }
      ],
      correctAnswer: "B",
      explanation: "Ellen White emphasizes that genuine spiritual power is never generated by human talent, but is born in the secret place of prayer and complete surrender to Christ (Gospel Workers, p. 254).",
      scriptureRef: "Acts of the Apostles, p. 326",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    },
    {
      id: "egw-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 260,
      timestampLabel: "4:20",
      segmentTopic: "Trials as God's Character-Refining Crucible",
      contextSummary: "Counsel from the Sunday study regarding the misunderstood disciple and how God utilizes adverse providences to purge self and polish the soul.",
      title: "Trials as Divine Refining Agents",
      question: "Based on the commentary just examined, how does Ellen White characterize the afflictions and misunderstandings endured by faithful disciples?",
      options: [
        {
          id: "A",
          text: "As God's providential crucible to purge dross and polish character for the heavenly courts."
        },
        {
          id: "B",
          text: "As evidence that God has completely forsaken the suffering soul."
        },
        {
          id: "C",
          text: "As meaningless accidents in a chaotic, godless universe."
        },
        {
          id: "D",
          text: "As a mandate to retaliate harshly against all critics and accusers."
        }
      ],
      correctAnswer: "A",
      explanation: "Ellen White writes: 'God brings His people into trying places that they may realize their own weakness and lean upon His strength... Every trial is an agent of His providence to refine them' (Desire of Ages, p. 382).",
      scriptureRef: "Testimonies for the Church, Vol. 5, p. 344",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    },
    {
      id: "egw-cp-3",
      checkpointIndex: 3,
      timestampSeconds: 475,
      timestampLabel: "7:55",
      segmentTopic: "The Seal of the Spirit: Intellectual & Spiritual Stability",
      contextSummary: "Insightful commentary from the Monday study on 2 Corinthians 1:22 defining the spiritual seal of God in the minds and hearts of His remnant.",
      title: "The Seal of the Spirit (2 Cor 1:22)",
      question: "According to Ellen G. White's insights reviewed on 2 Corinthians 1:22, what is the seal of the Spirit in the life of the remnant?",
      options: [
        {
          id: "A",
          text: "A physical brand engraved on the skin."
        },
        {
          id: "B",
          text: "A settling into the truth, both intellectually and spiritually, so that believers cannot be moved."
        },
        {
          id: "C",
          text: "A sudden emotional ecstasy that bypasses obedience to God's law."
        },
        {
          id: "D",
          text: "A certificate issued by an earthly organization."
        }
      ],
      correctAnswer: "B",
      explanation: "'It is not any seal or mark that can be seen, but a settling into the truth, both intellectually and spiritually, so they cannot be moved' (Ellen G. White, 4BC 1161).",
      scriptureRef: "2 Corinthians 1:22; 4BC 1161",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    },
    {
      id: "egw-cp-4",
      checkpointIndex: 4,
      timestampSeconds: 655,
      timestampLabel: "10:55",
      segmentTopic: "The Transformative Law of Beholding Christ",
      contextSummary: "Exposition from the Tuesday study of 2 Corinthians 3:18 and the foundational psychological law governing character development.",
      title: "Beholding and Becoming Changed (2 Cor 3:18)",
      question: "In this segment on 2 Corinthians 3:18 ('beholding as in a mirror the glory of the Lord'), what fundamental law of the human mind does Ellen White articulate?",
      options: [
        {
          id: "A",
          text: "By mere debate and argument, human nature changes automatically."
        },
        {
          id: "B",
          text: "By beholding we become changed into the same divine image from glory to glory."
        },
        {
          id: "C",
          text: "Man can transform himself apart from Christ's righteousness."
        },
        {
          id: "D",
          text: "Looking at worldly standards helps us appreciate heavenly holiness."
        }
      ],
      correctAnswer: "B",
      explanation: "'It is a law both of the intellectual and the spiritual nature that by beholding we become changed. The mind gradually adapts itself to the subjects upon which it is allowed to dwell' (Great Controversy, p. 555).",
      scriptureRef: "2 Corinthians 3:18; GC 555",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    },
    {
      id: "egw-cp-5",
      checkpointIndex: 5,
      timestampSeconds: 835,
      timestampLabel: "13:55",
      segmentTopic: "Ambassadors for Christ & Ministry of Reconciliation",
      contextSummary: "Wednesday's commentary on 2 Corinthians 5:18–20 emphasizing our sacred commission as heavenly ambassadors imploring the world to be reconciled to God.",
      title: "Ambassadors for Christ (2 Cor 5:18–20)",
      question: "According to Ellen White's commentary on 2 Corinthians 5:20, what is the solemn privilege and sacred responsibility of believers as 'ambassadors for Christ'?",
      options: [
        {
          id: "A",
          text: "To represent the interests and character of Heaven, pleading with souls as if God were pleading through us to be reconciled to God."
        },
        {
          id: "B",
          text: "To seek civil legislative authority to enforce religious observance."
        },
        {
          id: "C",
          text: "To condemn sinners harshly without presenting Christ's redeeming grace."
        },
        {
          id: "D",
          text: "To isolate entirely from society and avoid all communication with unbelievers."
        }
      ],
      correctAnswer: "A",
      explanation: "'Christ has made His church the depositary of sacred truth... We are ambassadors for Christ, standing in His place, pleading with men to lay down their rebellion and be reconciled to God' (Great Controversy, p. 518).",
      scriptureRef: "2 Corinthians 5:18–20; GC 518",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    },
    {
      id: "egw-cp-6",
      checkpointIndex: 6,
      timestampSeconds: 1045,
      timestampLabel: "17:25",
      segmentTopic: "The Temple of the Living God & Holy Calling",
      contextSummary: "Thursday's exposition of 2 Corinthians 6:14–18 exploring the spiritual purity required of God's remnant sanctuary temple.",
      title: "Temple of the Living God (2 Cor 6:14–18)",
      question: "In the study of 2 Corinthians 6:14–18, what divine promise does God give to those who separate from worldly corruptions and honor His sanctuary truth?",
      options: [
        {
          id: "A",
          text: "He will exempt them from all earthly labor and trials."
        },
        {
          id: "B",
          text: "'I will dwell in them and walk among them. I will be their God, and they shall be My people... I will be a Father to you.' "
        },
        {
          id: "C",
          text: "He will give them secular dominion over world governments."
        },
        {
          id: "D",
          text: "That personal character development is no longer necessary."
        }
      ],
      correctAnswer: "B",
      explanation: "God covenants to tabernacle in the hearts of His faithful people: 'I will dwell in them and walk among them. I will be their God, and they shall be My people... and you shall be My sons and daughters, says the Lord Almighty' (2 Corinthians 6:16–18).",
      scriptureRef: "2 Corinthians 6:14–18; PP 458",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    },
    {
      id: "egw-cp-7",
      checkpointIndex: 7,
      timestampSeconds: 1245,
      timestampLabel: "20:45",
      segmentTopic: "Godly Sorrow Leading to Genuine Repentance",
      contextSummary: "Friday's concluding reflections on 2 Corinthians 7:9–11 distinguishing between true godly sorrow that produces repentance vs worldly regret.",
      title: "Godly Sorrow vs Worldly Sorrow (2 Cor 7:9–11)",
      question: "In this concluding Friday segment, how does Ellen White distinguish between 'godly sorrow' and the 'sorrow of the world' (2 Cor 7:10)?",
      options: [
        {
          id: "A",
          text: "Godly sorrow mourns over sin itself because it wounds the Saviour, while worldly sorrow only regrets the painful consequences of being caught."
        },
        {
          id: "B",
          text: "Godly sorrow never results in any confession or restitution."
        },
        {
          id: "C",
          text: "Worldly sorrow produces permanent spiritual transformation."
        },
        {
          id: "D",
          text: "Both types of sorrow are identical in the eyes of God."
        }
      ],
      correctAnswer: "A",
      explanation: "'Godly sorrow works repentance to salvation not to be repented of... The soul is led to see the hateful character of sin, and to turn from it, grieving that Christ was wounded' (Steps to Christ, p. 23).",
      scriptureRef: "2 Corinthians 7:9–11; SC 23",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary"
    }
  ],

  // 3. It Is Written – Sabbath School Lesson (Stewardship and Mission)
  itiswritten: [
    {
      id: "iiw-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 80,
      timestampLabel: "1:20",
      segmentTopic: "Stewardship and Mission: Consecration First",
      contextSummary: "Pastor John Bradshaw opens with 2 Corinthians 8:1–5, explaining that Christian stewardship begins with personal surrender to the Lord.",
      title: "Stewardship and Mission: Consecration First",
      question: "In this opening segment of the study on Stewardship and Mission, what is highlighted as the primary foundation of Christian stewardship (2 Cor. 8:1–5)?",
      options: [
        {
          id: "A",
          text: "Accumulating institutional wealth to gain political and financial leverage."
        },
        {
          id: "B",
          text: "Giving oneself first to the Lord, after which financial and personal resources joyfully advance His mission."
        },
        {
          id: "C",
          text: "Purchasing divine favor and salvation through mandatory monetary dues."
        },
        {
          id: "D",
          text: "Giving only when all personal earthly luxuries have been satisfied."
        }
      ],
      correctAnswer: "B",
      explanation: "True Christian stewardship begins with personal surrender. The Macedonian believers 'first gave their own selves to the Lord,' making their mission generosity a genuine overflow of God's grace (2 Corinthians 8:5).",
      scriptureRef: "2 Corinthians 8:1–5",
      channel: "itiswritten",
      channelName: "It Is Written – Sabbath School Lesson"
    },
    {
      id: "iiw-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 170,
      timestampLabel: "2:50",
      segmentTopic: "The Grace of Giving & Christ's Poverty",
      contextSummary: "A study of 2 Corinthians 8:9 and how Christ's self-emptying sacrifice serves as the supreme motive for gospel generosity.",
      title: "The Grace of Giving & Christ's Poverty",
      question: "Based on the insights presented in this segment, what supreme motivation does the apostle Paul provide for our sacrificial support of the gospel mission?",
      options: [
        {
          id: "A",
          text: "That other people may be eased while givers are financially burdened."
        },
        {
          id: "B",
          text: "To establish moral superiority over other religious systems of antiquity."
        },
        {
          id: "C",
          text: "The example of our Lord Jesus Christ, who though He was rich, yet for our sakes became poor that we through His poverty might become rich."
        },
        {
          id: "D",
          text: "To erect grand monuments in Corinth to commemorate individual patrons."
        }
      ],
      correctAnswer: "C",
      explanation: "Christ is the ultimate model of mission and stewardship: 'For you know the grace of our Lord Jesus Christ, that though He was rich, yet for your sakes He became poor, that you through His poverty might become rich' (2 Corinthians 8:9).",
      scriptureRef: "2 Corinthians 8:7–9",
      channel: "itiswritten",
      channelName: "It Is Written – Sabbath School Lesson"
    },
    {
      id: "iiw-cp-3",
      checkpointIndex: 3,
      timestampSeconds: 270,
      timestampLabel: "4:30",
      segmentTopic: "Cheerful Sowing & Abounding Grace",
      contextSummary: "Practical instruction from 2 Corinthians 9:6–8 on giving with cheerful purpose and trusting God's limitless replenishment.",
      title: "Cheerful Sowing & Abounding Grace",
      question: "Examining the principles presented on 2 Corinthians 9:6–8, what does Scripture teach concerning the spirit of mission giving?",
      options: [
        {
          id: "A",
          text: "God loves a cheerful giver who gives purposed in heart, and God is able to make all grace abound for every good work."
        },
        {
          id: "B",
          text: "Giving should be extracted through guilt, coercion, and public manipulation."
        },
        {
          id: "C",
          text: "Only wealthy church members are called to support the global mission of the church."
        },
        {
          id: "D",
          text: "Sacrificial giving depletes the believer, leaving them without divine replenishment."
        }
      ],
      correctAnswer: "A",
      explanation: "'Let each one give as he purposes in his heart, not grudgingly or of necessity; for God loves a cheerful giver. And God is able to make all grace abound toward you' (2 Corinthians 9:7–8).",
      scriptureRef: "2 Corinthians 9:6–8",
      channel: "itiswritten",
      channelName: "It Is Written – Sabbath School Lesson"
    },
    {
      id: "iiw-cp-4",
      checkpointIndex: 4,
      timestampSeconds: 375,
      timestampLabel: "6:15",
      segmentTopic: "Mission Harvest & Thanksgiving to God",
      contextSummary: "The telecast conclusion focusing on how faithful ministry and unselfish stewardship cause thanksgivings to abound to the glory of God.",
      title: "Mission Harvest & Thanksgiving to God",
      question: "In this concluding segment, what ultimate outcome results from faithful stewardship and mission mobilization (2 Cor. 9:11–13)?",
      options: [
        {
          id: "A",
          text: "It generates praise and political honors for church administrators."
        },
        {
          id: "B",
          text: "It abounds through many thanksgivings to God, glorifying Him for the obedience of our confession to the gospel of Christ."
        },
        {
          id: "C",
          text: "It replaces the necessity of personal prayer and witness."
        },
        {
          id: "D",
          text: "It ensures that the church will never face opposition from the secular world."
        }
      ],
      correctAnswer: "B",
      explanation: "Faithful stewardship in mission creates a harvest of righteousness and abundant praise: 'For the administration of this service not only supplies the needs of the saints, but also is abounding through many thanksgivings to God' (2 Corinthians 9:12).",
      scriptureRef: "2 Corinthians 9:11–13",
      channel: "itiswritten",
      channelName: "It Is Written – Sabbath School Lesson"
    }
  ],

  // 4. Hope Channel Sabbath School – Weekly Study
  hope: [
    {
      id: "hope-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 70,
      timestampLabel: "1:10",
      segmentTopic: "Integrity and Godly Sincerity in Ministry",
      contextSummary: "Hope Sabbath School panel opens with 2 Corinthians 1:12 on conducting oneself with transparent simplicity and divine grace.",
      title: "Integrity and Transparency in Ministry",
      question: "In this opening segment of the Hope Sabbath School study, what is emphasized from 2 Corinthians 1:12 regarding Christian integrity?",
      options: [
        {
          id: "A",
          text: "Paul conducted himself with simplicity and godly sincerity, not with fleshly wisdom but by the grace of God."
        },
        {
          id: "B",
          text: "Christian leaders should employ manipulative secular rhetoric to manage believers."
        },
        {
          id: "C",
          text: "Doctrinal convictions should be altered depending on political convenience."
        },
        {
          id: "D",
          text: "Apostolic authority requires secretive deliberations hidden from members."
        }
      ],
      correctAnswer: "A",
      explanation: "Paul emphasizes transparent, sincere Christian character guided by God's unmerited grace rather than manipulative worldly wisdom (2 Corinthians 1:12).",
      scriptureRef: "2 Corinthians 1:12",
      channel: "hope",
      channelName: "Hope Sabbath School – Weekly Study"
    },
    {
      id: "hope-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 155,
      timestampLabel: "2:35",
      segmentTopic: "The Guarantee (Arrhabon) of the Spirit",
      contextSummary: "Exegesis on 2 Corinthians 1:22 explaining the theological significance of the Holy Spirit as God's down payment on our redemption.",
      title: "The Guarantee of the Spirit (2 Cor 1:22)",
      question: "What does Paul signify when stating God 'sealed us and gave us the Spirit in our hearts as a pledge / guarantee' (2 Cor 1:22)?",
      options: [
        {
          id: "A",
          text: "That the Holy Spirit is an ephemeral feeling that departs during adversity."
        },
        {
          id: "B",
          text: "The Spirit is the down-payment (arrhabon) assuring our complete future redemption in Christ's eternal kingdom."
        },
        {
          id: "C",
          text: "That salvation requires no ongoing faith or growth in grace."
        },
        {
          id: "D",
          text: "That divine promises are arbitrary and subject to cancellation."
        }
      ],
      correctAnswer: "B",
      explanation: "The Greek word 'arrhabon' signifies a non-refundable deposit or pledge guaranteeing the full consummation of eternal redemption in the kingdom of God (2 Corinthians 1:22, Eph 1:13–14).",
      scriptureRef: "2 Corinthians 1:22",
      channel: "hope",
      channelName: "Hope Sabbath School – Weekly Study"
    },
    {
      id: "hope-cp-3",
      checkpointIndex: 3,
      timestampSeconds: 255,
      timestampLabel: "4:15",
      segmentTopic: "Ministry of the Spirit Gives Life vs. Letter",
      contextSummary: "Discussion on the New Covenant in 2 Corinthians 3:6 and how the Holy Spirit writes God's holy law on human hearts.",
      title: "Ministry of the Spirit Gives Life (2 Cor 3:6)",
      question: "On 2 Corinthians 3:6, why does Paul declare that 'the letter kills, but the Spirit gives life'?",
      options: [
        {
          id: "A",
          text: "The moral law of the Ten Commandments was repealed and no longer applies."
        },
        {
          id: "B",
          text: "The letter of the law reveals sin and condemns, but the Holy Spirit writes the law on the heart and imparts divine life to obey."
        },
        {
          id: "C",
          text: "Reading the written Scriptures is spiritually counterproductive."
        },
        {
          id: "D",
          text: "Disciples may selectively choose which biblical commands to heed."
        }
      ],
      correctAnswer: "B",
      explanation: "Legalistic external observance cannot produce spiritual life; the letter of the law condemns the transgressor, but the Spirit of Christ regenerates the soul and empowers willing obedience (Romans 8:3–4, 2 Cor 3:6).",
      scriptureRef: "2 Corinthians 3:6",
      channel: "hope",
      channelName: "Hope Sabbath School – Weekly Study"
    },
    {
      id: "hope-cp-4",
      checkpointIndex: 4,
      timestampSeconds: 345,
      timestampLabel: "5:45",
      segmentTopic: "Fixing Eyes on Unseen Eternal Realities",
      contextSummary: "Concluding discussion on 2 Corinthians 4:16–18 contrasting momentary affliction with the eternal weight of glory.",
      title: "Fixing Eyes on What is Eternal (2 Cor 4:17–18)",
      question: "In this concluding section on 2 Corinthians 4:16–18, how are disciples sustained when enduring outward difficulties?",
      options: [
        {
          id: "A",
          text: "By looking not at the things which are seen (temporal), but at the things which are unseen (eternal)."
        },
        {
          id: "B",
          text: "By pursuing immediate worldly wealth and distraction."
        },
        {
          id: "C",
          text: "By isolating completely from community and church fellowship."
        },
        {
          id: "D",
          text: "By pretending that pain and grief are mere illusions."
        }
      ],
      correctAnswer: "A",
      explanation: "Our light affliction, which is but for a moment, is working for us a far more exceeding and eternal weight of glory as we gaze upon eternal heavenly realities (2 Corinthians 4:17–18).",
      scriptureRef: "2 Corinthians 4:17–18",
      channel: "hope",
      channelName: "Hope Sabbath School – Weekly Study"
    }
  ],

  // 5. 3ABN Sabbath School Panel
  threeABN: [
    {
      id: "3abn-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 90,
      timestampLabel: "1:30",
      segmentTopic: "The Great Controversy & Unmasking the Adversary",
      contextSummary: "3ABN panel opens by framing 2 Corinthians 1:3–7 within the cosmic conflict between Christ and Satan over God's character.",
      title: "The Great Controversy & Purpose in Trials",
      question: "From the Great Controversy perspective highlighted on the 3ABN panel in this segment, what is Satan's core tactic during our afflictions?",
      options: [
        {
          id: "A",
          text: "To tempt us to doubt God's goodness, righteousness, and loving character."
        },
        {
          id: "B",
          text: "To lead believers to study Bible prophecies with greater diligence."
        },
        {
          id: "C",
          text: "To encourage believers to keep God's seventh-day Sabbath holy."
        },
        {
          id: "D",
          text: "To reconcile repentant sinners back to Christ Jesus."
        }
      ],
      correctAnswer: "A",
      explanation: "Throughout the cosmic conflict, Satan seeks to misrepresent God's character as harsh or unloving. Christ's comfort in trials vindicates God's covenant love and refutes the adversary's lies.",
      scriptureRef: "2 Corinthians 1:3–7; Revelation 12:10",
      channel: "threeABN",
      channelName: "3ABN Sabbath School Panel"
    },
    {
      id: "3abn-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 195,
      timestampLabel: "3:15",
      segmentTopic: "Christ's Sanctuary Ministry & Covenant Assurance",
      contextSummary: "The panel connects 2 Corinthians 1:20 with Christ's ongoing high priestly intercession in the Most Holy Place of the heavenly sanctuary.",
      title: "Christ's Sanctuary Ministry & Our Assurance",
      question: "How does Christ's high priestly ministry in the heavenly sanctuary connect with 2 Corinthians 1:20?",
      options: [
        {
          id: "A",
          text: "Christ is passively waiting without interceding for repentant believers."
        },
        {
          id: "B",
          text: "As our Great High Priest, Jesus applies His own blood and merits to secure and fulfill every divine promise on our behalf."
        },
        {
          id: "C",
          text: "The sanctuary truth has no relevance to New Testament believers."
        },
        {
          id: "D",
          text: "Earthly priests must intercede between man and Christ."
        }
      ],
      correctAnswer: "B",
      explanation: "In the heavenly sanctuary, Jesus ministers as our Advocate and High Priest (Hebrews 8:1–2), guaranteeing that every promise of forgiveness, cleansing, and grace is steadfastly realized.",
      scriptureRef: "Hebrews 8:1–2; 2 Corinthians 1:20",
      channel: "threeABN",
      channelName: "3ABN Sabbath School Panel"
    },
    {
      id: "3abn-cp-3",
      checkpointIndex: 3,
      timestampSeconds: 300,
      timestampLabel: "5:00",
      segmentTopic: "The Veil Removed in Christ",
      contextSummary: "Panelists explore 2 Corinthians 3:14–16, showing how the Holy Spirit illuminates both Old and New Testament Scriptures when one turns to Jesus.",
      title: "The Veil Removed in Christ",
      question: "On 2 Corinthians 3:14–16, what happens to the spiritual veil that obscures understanding of Scripture?",
      options: [
        {
          id: "A",
          text: "The veil remains permanently impenetrable to human minds."
        },
        {
          id: "B",
          text: "The veil is taken away in Christ whenever one turns their heart to the Lord."
        },
        {
          id: "C",
          text: "Human philosophy alone removes the veil from spiritual truth."
        },
        {
          id: "D",
          text: "The Old Testament has no Christ-centered typology or gospel."
        }
      ],
      correctAnswer: "B",
      explanation: "When anyone turns to Christ, the Holy Spirit lifts the veil of unbelief and tradition, revealing how all Old Testament types, prophecies, and sanctuary rituals point directly to Jesus (2 Corinthians 3:16).",
      scriptureRef: "2 Corinthians 3:14–16",
      channel: "threeABN",
      channelName: "3ABN Sabbath School Panel"
    },
    {
      id: "3abn-cp-4",
      checkpointIndex: 4,
      timestampSeconds: 405,
      timestampLabel: "6:45",
      segmentTopic: "Remnant Endurance & the Three Angels' Messages",
      contextSummary: "Climactic discussion linking 2 Corinthians 4:17 with Revelation 14:12—the faith of Jesus enabling the remnant to stand firm.",
      title: "The Three Angels' Messages & Eternal Glory",
      question: "How does 2 Corinthians 4:17 ('eternal weight of glory') inspire the Remnant in proclaiming the Three Angels' Messages (Rev 14:6–12)?",
      options: [
        {
          id: "A",
          text: "It empowers saints to endure end-time trials with the patience of Jesus, keeping God's commandments with eyes fixed on the Second Coming."
        },
        {
          id: "B",
          text: "It encourages believers to conform to popular worldly religious systems."
        },
        {
          id: "C",
          text: "It promises that the faithful will experience no final persecution."
        },
        {
          id: "D",
          text: "It instructs the church to stop evangelizing the world."
        }
      ],
      correctAnswer: "A",
      explanation: "The glorious certainty of Christ's return and eternal reign gives God's end-time remnant the divine stamina (hypomone) to keep the commandments of God and the faith of Jesus (Revelation 14:12).",
      scriptureRef: "Revelation 14:12; 2 Corinthians 4:17–18",
      channel: "threeABN",
      channelName: "3ABN Sabbath School Panel"
    }
  ]
};

// Aliases for matching
CURATED_CHANNEL_QUIZZES.ssPM = CURATED_CHANNEL_QUIZZES.threeABN;

/**
 * Retrieve curated questions for a given channel, with intelligent day-based filtering
 * for EGW Notes so questions align directly with the active lesson study day.
 */
export function getCuratedQuestionsForChannel(channel: string, egwDayIndex?: number): VideoQuizQuestion[] {
  const normKey = channel === "featured" ? "percy" : (channel === "ssPM" ? "threeABN" : channel);
  const baseQuestions = CURATED_CHANNEL_QUIZZES[normKey] || CURATED_CHANNEL_QUIZZES.percy;

  if (normKey === "egwNotes" && typeof egwDayIndex === "number" && egwDayIndex >= 0) {
    // EGW Lesson days start at: Day 0: 0s, Day 1: 189s, Day 2: 407s, Day 3: 580s, Day 4: 761s, Day 5: 970s, Day 6: 1177s
    const dayStarts = [0, 189, 407, 580, 761, 970, 1177];
    const startTime = dayStarts[egwDayIndex] || 0;
    if (startTime > 0) {
      const relevant = baseQuestions.filter((q) => q.timestampSeconds >= startTime - 20);
      if (relevant.length > 0) {
        return relevant;
      }
    }
  }

  return baseQuestions;
}

/**
 * Fetch dynamic AI-generated video quiz questions from the backend API,
 * falling back gracefully to the curated local questions.
 */
export async function fetchVideoQuizQuestions(params: {
  channel: string;
  lessonTitle?: string;
  quarterlyTitle?: string;
  dayTopic?: string;
  memoryVerse?: string;
  content?: string;
  egwDayIndex?: number;
}): Promise<VideoQuizQuestion[]> {
  const channelKey = params.channel === "ssPM" ? "threeABN" : params.channel;
  const fallbackList = getCuratedQuestionsForChannel(channelKey, params.egwDayIndex);

  try {
    const res = await fetch("/api/sabbath/video-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: channelKey,
        channelName: CHANNEL_NAMES[channelKey] || "Sabbath School Telecast",
        lessonTitle: params.lessonTitle,
        quarterlyTitle: params.quarterlyTitle,
        dayTopic: params.dayTopic,
        memoryVerse: params.memoryVerse,
        content: params.content,
        egwDayIndex: params.egwDayIndex
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (err) {
    console.warn("[VideoQuiz] API fetch failed, using curated SDA questions:", err);
  }

  return fallbackList;
}

export interface SavedVideoQuizAttempt {
  id: string;
  questionId: string;
  checkpointIndex: number;
  timestampSeconds: number;
  timestampLabel: string;
  title: string;
  question: string;
  options: VideoQuizOption[];
  userAnswer: "A" | "B" | "C" | "D";
  correctAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  explanation: string;
  scriptureRef: string;
  channel: string;
  channelName: string;
  lessonTitle: string;
  answeredAt: string;
}

export const VIDEO_QUIZ_STORAGE_KEY = "stba_sabbath_video_quiz_results";
export const SSQ_VIDEO_QUIZ_EVENT = "ssq-video-quiz-updated";

export function getSavedVideoQuizAttempts(): SavedVideoQuizAttempt[] {
  try {
    const raw = localStorage.getItem(VIDEO_QUIZ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error("Failed to parse saved video quiz attempts:", err);
  }
  return [];
}

export function saveVideoQuizAttempt(attempt: Omit<SavedVideoQuizAttempt, "id" | "answeredAt">): SavedVideoQuizAttempt {
  const existing = getSavedVideoQuizAttempts();
  const newAttempt: SavedVideoQuizAttempt = {
    ...attempt,
    id: `svq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    answeredAt: new Date().toISOString()
  };

  // Replace any earlier attempt for the exact same question to keep the latest reflection, or prepend
  const filtered = existing.filter((item) => item.questionId !== attempt.questionId);
  const updated = [newAttempt, ...filtered];

  try {
    localStorage.setItem(VIDEO_QUIZ_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SSQ_VIDEO_QUIZ_EVENT, { detail: updated }));
    }
  } catch (err) {
    console.error("Failed to save video quiz attempt:", err);
  }
  return newAttempt;
}

export function clearVideoQuizAttempts(): void {
  try {
    localStorage.removeItem(VIDEO_QUIZ_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SSQ_VIDEO_QUIZ_EVENT, { detail: [] }));
    }
  } catch (err) {
    console.error("Failed to clear video quiz attempts:", err);
  }
}

export function seedDefaultVideoQuizAttemptsIfEmpty(): SavedVideoQuizAttempt[] {
  const existing = getSavedVideoQuizAttempts();
  if (existing.length > 0) return existing;

  const samples: SavedVideoQuizAttempt[] = [
    {
      id: "svq-sample-1",
      questionId: "featured-cp-1",
      checkpointIndex: 1,
      timestampSeconds: 45,
      timestampLabel: "0:45",
      title: "Introduction & Purpose of Divine Comfort",
      question: "According to 2 Corinthians 1:3–4, why does the 'Father of mercies and God of all comfort' comfort believers in their tribulations?",
      options: [
        { id: "A", text: "To exempt faithful Christians from ever having to face future trials in this world." },
        { id: "B", text: "So that we may be able to comfort those in any trouble with the comfort we ourselves have received from God." },
        { id: "C", text: "To prove that worldly success and ease are guaranteed rewards of righteous living." },
        { id: "D", text: "As a sign that physical suffering only affects those lacking sufficient spiritual faith." }
      ],
      userAnswer: "B",
      correctAnswer: "B",
      isCorrect: true,
      explanation: "God comforts believers in affliction so they can become empathetic channels of mercy to comfort others in need with the divine solace they personally experienced from God (2 Cor. 1:3–4).",
      scriptureRef: "2 Corinthians 1:3–4",
      channel: "featured",
      channelName: "Featured Video – Claudio Carneiro",
      lessonTitle: "Love-driven Ministry",
      answeredAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "svq-sample-2",
      questionId: "featured-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 90,
      timestampLabel: "1:30",
      title: "The Sincerity of Apostolic Ministry",
      question: "In 2 Corinthians 1:12, what does the apostle Paul boast regarding his conduct toward the Corinthian church?",
      options: [
        { id: "A", text: "His mastery of Greek philosophical rhetoric and worldly eloquence." },
        { id: "B", text: "His impressive financial contributions and administrative titles." },
        { id: "C", text: "His simplicity and godly sincerity, not with fleshly wisdom but by the grace of God." },
        { id: "D", text: "His strict adherence to rabbinic traditions outside of Christ's gospel." }
      ],
      userAnswer: "C",
      correctAnswer: "C",
      isCorrect: true,
      explanation: "Paul rejoices in the testimony of a clean conscience: his ministry was conducted in simplicity, transparency, and godly sincerity, empowered solely by the grace of God rather than deceptive worldly rhetoric (2 Cor. 1:12).",
      scriptureRef: "2 Corinthians 1:12",
      channel: "featured",
      channelName: "Featured Video – Claudio Carneiro",
      lessonTitle: "Love-driven Ministry",
      answeredAt: new Date(Date.now() - 2400000).toISOString()
    },
    {
      id: "svq-sample-3",
      questionId: "egwNotes-cp-2",
      checkpointIndex: 2,
      timestampSeconds: 90,
      timestampLabel: "1:30",
      title: "Daily Grace for Every Conflict",
      question: "In Ellen White's commentary on Paul's trials, what does she emphasize about the supply of divine grace for the Christian?",
      options: [
        { id: "A", text: "Grace is only granted once at conversion and is never replenished during daily conflict." },
        { id: "B", text: "Every trial is met with an equal or greater measure of overcoming grace from Christ." },
        { id: "C", text: "God allows suffering to demonstrate human endurance independent of the Holy Spirit." },
        { id: "D", text: "Believers should seek out suffering actively to earn divine favor." }
      ],
      userAnswer: "B",
      correctAnswer: "B",
      isCorrect: true,
      explanation: "Ellen White highlights that as the trials and heartaches of God's people multiply, so does the abundant, all-sufficient grace of Christ to sustain and sanctify the soul in every conflict.",
      scriptureRef: "2 Corinthians 12:9",
      channel: "egwNotes",
      channelName: "Ellen White Notes – Daily Commentary",
      lessonTitle: "Love-driven Ministry",
      answeredAt: new Date(Date.now() - 1200000).toISOString()
    }
  ];

  try {
    localStorage.setItem(VIDEO_QUIZ_STORAGE_KEY, JSON.stringify(samples));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SSQ_VIDEO_QUIZ_EVENT, { detail: samples }));
    }
  } catch (err) {
    console.error("Failed to seed default attempts:", err);
  }
  return samples;
}

