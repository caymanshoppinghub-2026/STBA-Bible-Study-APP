/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyLesson } from "../api/sabbathSchoolApi";
import { separateLessonAndEgwNotes } from "./sabbathUtils";

export interface TheologicalTakeawayItem {
  id: number;
  chapterTag: string;
  title: string;
  description: string;
  bulletPoints?: string[];
  supportingVerses: string[];
  egwConnection?: {
    note: string;
    source: string;
  };
}

export interface EgwQuoteItem {
  theme: string;
  quote: string;
  source: string;
  dayLabel?: string;
  dailyTopic?: string;
}

// Preset Takeaways for standard Sabbath School lessons: 3 Core Weekly Points summarizing the entire week (Days 1–7)
const THEOLOGICAL_TAKEAWAY_PRESETS: Record<string, TheologicalTakeawayItem[]> = {
  "new testament prophets": [
    {
      id: 1,
      chapterTag: "Days 1–3 Synthesis",
      title: "1. Jesus as Supreme Prophet and Foundation of the Church",
      description: "Across the opening days, Scripture reveals that Jesus Christ is the supreme Prophet who uniquely embodies the Word made flesh. The New Testament church is grounded on the foundation of the apostles and prophets, with Christ Himself as the chief cornerstone.",
      bulletPoints: [
        "Jesus fulfills Moses' prophecy (Deut. 18:15) as the definitive Prophet, Priest, and King whose words carry supreme divine authority.",
        "Unlike Old Testament prophets who delivered preparatory messages, Jesus delivers full divine revelation in His person and ministry.",
        "The apostolic foundation and prophetic ministry complement each other to build a unified, enduring church body (Eph. 2:20)."
      ],
      supportingVerses: ["Hebrews 1:1–3", "Matthew 16:13–16", "Ephesians 2:20", "John 1:14"],
      egwConnection: {
        note: "In Christ is the fullness of the Godhead bodily. All prophetic revelation throughout biblical history finds its center, truth, and vindication in His life, death, and resurrection.",
        source: "The Desire of Ages, p. 25"
      }
    },
    {
      id: 2,
      chapterTag: "Day 4 & Mid-Week Heart",
      title: "2. Functions of New Testament Prophets in the Body of Christ",
      description: "New Testament prophets operated within local congregations to provide spiritual guidance, encouragement, warning, and moral exhortation. Prophetic ministry was given to equip believers, protect against deceptive snares, and foster Christlike character.",
      bulletPoints: [
        "New Testament prophets functioned alongside pastors and teachers to edify, exhort, and comfort the flock of God.",
        "The prophetic gift was distributed without gender partiality, as demonstrated by the prophetess Anna and Philip's four prophesying daughters (Acts 21:9).",
        "Prophetic messages were never intended to supersede Scripture, but to guide the church in applying biblical truths faithfully."
      ],
      supportingVerses: ["1 Corinthians 12:28", "Acts 21:9–11", "Ephesians 4:11–13", "Luke 2:36–38"],
      egwConnection: {
        note: "The gifts of the Spirit are given to the church for its protection, unity, and completion in love until the Lord's return.",
        source: "The Acts of the Apostles, p. 550"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Climax",
      title: "3. Testing False Prophets and Centering on God's Word",
      description: "In the closing days, the lesson warns against deceptive false prophets who arise in the last days. Every prophetic claim must be tested by biblical fruit, loyalty to Jesus' commandments, and strict fidelity to Sola Scriptura.",
      bulletPoints: [
        "Jesus warned that deceptive signs and wonders would emerge in the last days to deceive even the elect if possible (Matt. 24:24).",
        "Disciples must test spirits according to Sola Scriptura: 'To the law and to the testimony; if they speak not according to this word, there is no light in them' (Isa. 8:20).",
        "The end-time remnant church is recognized by keeping the commandments of God and having the testimony of Jesus, which is the Spirit of Prophecy (Rev. 12:17, 19:10)."
      ],
      supportingVerses: ["1 John 4:1–3", "Matthew 24:24", "Isaiah 8:20", "Revelation 14:12"],
      egwConnection: {
        note: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them. God's Word is the detector of all error.",
        source: "The Great Controversy, p. 593"
      }
    }
  ],
  "the gift of prophecy": [
    {
      id: 1,
      chapterTag: "Days 1–3 Synthesis",
      title: "1. Divine Communication with Fallen Humanity",
      description: "God instituted the prophetic gift in Eden after the Fall to maintain open communication with humanity, revealing His character, calling sinners to repentance, and pointing to Christ.",
      bulletPoints: [
        "Prophecy is God's redemptive bridge to communicate divine will to fallen human beings who can no longer see Him face-to-face.",
        "True prophecy uplifts Jesus Christ as the only Redeemer and points sinners to repentance and restoration.",
        "God reveals secret things to His servants the prophets to prepare His people for decisive events in salvation history (Amos 3:7)."
      ],
      supportingVerses: ["Hebrews 1:1–2", "Genesis 3:15", "Amos 3:7"],
      egwConnection: {
        note: "Through His prophets God has made known to men His purpose to redeem a fallen world through Jesus Christ.",
        source: "Patriarchs and Prophets, p. 364"
      }
    },
    {
      id: 2,
      chapterTag: "Day 4 & Mid-Week Heart",
      title: "2. The Spirit Distributes Prophetic Gifts Sovereignly",
      description: "The Holy Spirit distributes the gift of prophecy according to divine wisdom to strengthen, comfort, and guide the church across generations.",
      bulletPoints: [
        "The prophetic gift is not self-appointed but sovereignly imparted by the Holy Spirit as He wills (1 Cor. 12:11).",
        "Prophetic counsel calls believers away from worldliness and strengthens their trust in the living God.",
        "Both men and women were called to prophetic office in Scripture to witness for God's truth."
      ],
      supportingVerses: ["1 Corinthians 12:4–11", "Joel 2:28–29", "Acts 2:17–18"],
      egwConnection: {
        note: "The Holy Spirit distributes gifts to every believer for the building up of the church in love.",
        source: "Christ’s Object Lessons, p. 327"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Climax",
      title: "3. The Remnant Safeguard in the Final Conflict",
      description: "In the end-time conflict between truth and counterfeit deception, God provides the Spirit of Prophecy as a lamp to guide the remnant safely to the heavenly Canaan.",
      bulletPoints: [
        "The Spirit of Prophecy is a biblical identifier of God's remnant church in the last days (Rev. 12:17, 19:10).",
        "Prophetic guidance clarifies biblical truths and exposes the subtle sophistries of the adversary.",
        "Believing God's prophets brings spiritual prosperity, stability, and unyielding faith (2 Chron. 20:20)."
      ],
      supportingVerses: ["Revelation 12:17", "Revelation 19:10", "2 Chronicles 20:20"],
      egwConnection: {
        note: "Believe in the Lord your God, so shall ye be established; believe His prophets, so shall ye prosper.",
        source: "Testimonies, vol. 5, p. 681"
      }
    }
  ],
  "spiritual gifts": [
    {
      id: 1,
      chapterTag: "Days 1–3 Synthesis",
      title: "1. One Spirit, Diverse Gifts for Unified Edification",
      description: "Across Days 1 through 3, Scripture demonstrates that the Holy Spirit sovereignly imparts diverse spiritual gifts to every believer. These gifts are not distributed for personal status or rivalry, but to build an interdependent body of Christ where every member functions in coordinated unity.",
      bulletPoints: [
        "The Holy Spirit sovereignly dispenses gifts according to divine wisdom, not human merit or rivalry.",
        "Every member is an essential organ in the body of Christ with distinct responsibilities for unified growth.",
        "Spiritual gifts are given for mutual edification and service, never for self-exaltation or division."
      ],
      supportingVerses: ["1 Corinthians 12:4–7", "1 Corinthians 12:12–14", "1 Corinthians 12:25–27"],
      egwConnection: {
        note: "God assigns to every man his work according to his ability. The harmony of the church depends on the unity of its members in Christ. Diversity of gifts is ordained of God for the symmetrical growth of the church.",
        source: "Christ’s Object Lessons, p. 326; Testimonies, vol. 5, p. 236"
      }
    },
    {
      id: 2,
      chapterTag: "Day 4 & Day 7 Devotion",
      title: "2. The Indispensable Supremacy of Agape Love",
      description: "In the pivotal center of the week (Day 4) and Friday's devotion (Day 7), Paul demonstrates that even the most spectacular spiritual gifts, profound wisdom, or sacrificial martyrdom are completely worthless without unselfish agape love. Love is the enduring character of God that outlasts every temporary spiritual gift.",
      bulletPoints: [
        "Agape love is the indispensable motive that gives spiritual validity to all talents, ministries, and sacrifices.",
        "Gifts without sacrificial love are spiritually hollow, noisy, and unprofitable in God's eyes.",
        "Love endures through trials and outlasts all temporary spiritual manifestations into eternity."
      ],
      supportingVerses: ["1 Corinthians 13:1–3", "1 Corinthians 13:4–8", "1 Corinthians 13:13", "2 Corinthians 2:4"],
      egwConnection: {
        note: "Love is the active principle that transforms character and unites hearts in unselfish service. Consecrate your gifts wholly to the Master's service.",
        source: "The Acts of the Apostles, p. 550; Patriarchs and Prophets, p. 590"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–6 & Day 7 Mission",
      title: "3. Reverent Order, Clear Truth, and Prophetic Testing",
      description: "In the closing days of the week (Days 5 to 7), the study emphasizes that spiritual gifts must be exercised with clear intelligibility, self-restraint, and reverent order in public worship so all are edified, with all prophetic claims tested faithfully by Sola Scriptura.",
      bulletPoints: [
        "Order and intelligibility in worship honor God and build up the understanding of all present.",
        "Prophetic utterances and spiritual teachings must be tested faithfully against Sola Scriptura.",
        "The ultimate objective of every gift is holy character development, unity, and missionary proclamation."
      ],
      supportingVerses: ["1 Corinthians 14:1–3", "1 Corinthians 14:26", "1 Corinthians 14:33, 40", "1 Thessalonians 5:20–21"],
      egwConnection: {
        note: "God is a God of order, and everything connected with His work should be conducted with sacred reverence. To the law and to the testimony: if they speak not according to this word, there is no light in them.",
        source: "Testimonies, vol. 5, p. 491; The Great Controversy, p. 593"
      }
    }
  ],
  "all to the glory of god": [
    {
      id: 1,
      chapterTag: "Days 1–3 Synthesis",
      title: "1. Love Over Knowledge: Guarding Weaker Brethren",
      description: "Across the opening days, Paul establishes that theological knowledge without love puffs up with pride. True Christian maturity exercises personal freedom with humble self-restraint so as never to become a stumbling block to others.",
      supportingVerses: ["1 Corinthians 8:1–3", "1 Corinthians 8:9–13", "Romans 14:13–15"],
      egwConnection: {
        note: "Christ’s followers must remember that every soul is purchased with His blood. We are not to live for ourselves, but for the salvation and building up of our brethren.",
        source: "The Desire of Ages, p. 439"
      }
    },
    {
      id: 2,
      chapterTag: "Day 4 & Mid-Week Service",
      title: "2. Relinquishing Rights for the Sake of the Gospel",
      description: "Paul presents his own apostolic ministry as a template of Christlike self-denial, willingly surrendering personal entitlements and adapting graciously to diverse cultures to win souls for Christ.",
      supportingVerses: ["1 Corinthians 9:16–19", "1 Corinthians 9:22–23", "Philippians 2:5–8"],
      egwConnection: {
        note: "He who has the mind of Christ will make any sacrifice to win souls. The apostle Paul chose hardship and surrendered rights that he might advance the kingdom of God.",
        source: "Gospel Workers, p. 115"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Climax",
      title: "3. Fleeing Idolatry & Doing All to God’s Glory",
      description: "Reviewing Israel's Wilderness wanderings, Paul warns that spiritual privileges offer no immunity against presumption. Every Christian decision—whether eating, drinking, or worshiping—must be governed by 'Do all to the glory of God.'",
      supportingVerses: ["1 Corinthians 10:6–12", "1 Corinthians 10:24", "1 Corinthians 10:31"],
      egwConnection: {
        note: "In every act of life, whether large or small, our supreme question should be: Will this glorify God? True religion leaves its impression on every deed.",
        source: "Messages to Young People, p. 382"
      }
    }
  ],
  "the sanctuary covenant": [
    {
      id: 1,
      chapterTag: "Days 1–3 Foundation",
      title: "1. The True Heavenly Tabernacle & High Priest",
      description: "Christ ministers in the authentic heavenly sanctuary erected by God and not man, mediating a new and superior covenant built upon better promises.",
      supportingVerses: ["Hebrews 8:1–6", "Hebrews 9:11–12", "Hebrews 9:24"],
      egwConnection: {
        note: "The sanctuary in heaven is the very center of Christ's work in behalf of men. It concerns every soul living upon the earth.",
        source: "The Great Controversy, p. 488"
      }
    },
    {
      id: 2,
      chapterTag: "Day 4 Prophetic Pivot",
      title: "2. The 2300-Day Prophecy & Sanctuary Cleansing",
      description: "At the end of the prophetic 2300 days (1844), the pre-advent investigative judgment began in the Most Holy Place to vindicate God's character and cleanse the heavenly sanctuary.",
      supportingVerses: ["Daniel 8:14", "Daniel 7:9–10", "Leviticus 16:16–19"],
      egwConnection: {
        note: "At the termination of the 2300 days in 1844, Christ entered the most holy place of the heavenly sanctuary to perform the closing work of atonement.",
        source: "The Great Controversy, p. 422"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Application",
      title: "3. Bold Access Through Christ's Cleansing Blood",
      description: "Having a compassionate High Priest, believers enter the heavenly sanctuary with full assurance of faith, experiencing personal cleansing from sin and steadfast endurance.",
      supportingVerses: ["Hebrews 4:14–16", "Hebrews 10:19–23", "Revelation 11:19"],
      egwConnection: {
        note: "We have a High Priest who is touched with the feeling of our infirmities. Let us come boldly unto the throne of grace, that we may obtain mercy.",
        source: "Steps to Christ, p. 97"
      }
    }
  ],
  "three angels end-time remnant message": [
    {
      id: 1,
      chapterTag: "Days 1–2 First Angel",
      title: "1. The Everlasting Gospel & Creator Worship",
      description: "Calling the global family in the hour of investigative judgment to fear God, give Him glory, and worship the Creator of heaven, earth, sea, and fountains of waters.",
      supportingVerses: ["Revelation 14:6–7", "Exodus 20:8–11", "Ecclesiastes 12:13–14"],
      egwConnection: {
        note: "The message of Revelation 14, proclaiming that the hour of God's judgment is come, is given in the time of the end.",
        source: "The Great Controversy, p. 356"
      }
    },
    {
      id: 2,
      chapterTag: "Days 3–4 Second & Third Angels",
      title: "2. The Fall of Babylon & Counterfeit Warning",
      description: "Unmasking spiritual apostasy and religious confusion, warning all humanity against Satan's counterfeit worship systems, human tradition, and the mark of the beast.",
      supportingVerses: ["Revelation 14:8–11", "Revelation 18:1–4", "Daniel 7:25"],
      egwConnection: {
        note: "Babylon is said to be 'the mother of harlots.' By her daughters must be symbolized churches that cling to her dogmas and traditions.",
        source: "The Great Controversy, p. 382"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Remnant Character",
      title: "3. The Commandments of God & Faith of Jesus",
      description: "Identifying God's faithful end-time remnant who exhibit steadfast patience, preserve God's holy law including the Seventh-day Sabbath, and demonstrate the living faith of Jesus.",
      supportingVerses: ["Revelation 14:12", "Revelation 12:17", "James 2:10–12"],
      egwConnection: {
        note: "The commandments of God and the faith of Jesus are blended. They are not to be separated. The law of God cannot be obeyed without the grace of Christ.",
        source: "Selected Messages, book 2, p. 385"
      }
    }
  ],
  "the war behind all wars": [
    {
      id: 1,
      chapterTag: "Days 1–2 Cosmic Origin",
      title: "1. Lucifer's Rebellion in Heavenly Realms",
      description: "Evil originated when Lucifer pridefully rebelled against God's government of love, sparking the cosmic conflict that led to his expulsion from heaven.",
      supportingVerses: ["Revelation 12:7–9", "Isaiah 14:12–15", "Ezekiel 28:14–17"],
      egwConnection: {
        note: "Sin originated in self-seeking. Lucifer, the covering cherub, desired to be first in heaven. He sought to gain control of heavenly beings.",
        source: "The Desire of Ages, p. 21"
      }
    },
    {
      id: 2,
      chapterTag: "Days 3–4 Calvary Victory",
      title: "2. Victory at the Cross of Calvary",
      description: "Satan's true character was fully unmasked at the cross. Believers conquer the accuser by the blood of the Lamb and the word of their testimony.",
      supportingVerses: ["Revelation 12:10–11", "John 12:31–32", "Colossians 2:14–15"],
      egwConnection: {
        note: "At the cross of Calvary love and selfishness stood face to face. Here was their final manifestation. Christ had lived only to comfort and bless.",
        source: "The Desire of Ages, p. 57"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Final Conflict",
      title: "3. Dragon's Wrath Against the Remnant",
      description: "Satan unleashes his final deception and wrath against the remnant church, but Christ's faithful people stand secure under God's sovereign protection.",
      supportingVerses: ["Revelation 12:17", "Ephesians 6:10–18", "Romans 16:20"],
      egwConnection: {
        note: "The dragon was wroth with the woman, and went to make war with the remnant of her seed. In this final conflict God's faithful people will triumph.",
        source: "Testimonies, vol. 8, p. 41"
      }
    }
  ],
  "satan's great deceptions": [
    {
      id: 1,
      chapterTag: "Days 1–2 Spiritualism",
      title: "1. The Immortality Lie & Modern Spiritualism",
      description: "Satan's primal lie in Eden ('You shall not surely die') forms the dangerous foundation of modern spiritualism, near-death claims, and communication with the dead.",
      supportingVerses: ["Genesis 3:4", "Ecclesiastes 9:5–6", "1 Timothy 4:1–2"],
      egwConnection: {
        note: "Through the two great errors, the immortality of the soul and Sunday sacredness, Satan will bring the people under his deceptions.",
        source: "The Great Controversy, p. 588"
      }
    },
    {
      id: 2,
      chapterTag: "Days 3–4 Counterfeits",
      title: "2. Counterfeit Miracles & False Christs",
      description: "In the closing hours, deceptive spiritual manifestations and counterfeit revivals will attempt to deceive even the elect if possible.",
      supportingVerses: ["2 Corinthians 11:13–15", "2 Thessalonians 2:9–11", "Matthew 24:24"],
      egwConnection: {
        note: "Satan can present a counterfeit so closely resembling the truth that it deceives those who are willing to be deceived.",
        source: "The Great Controversy, p. 528"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Safeguard",
      title: "3. Sola Scriptura: The Only True Safeguard",
      description: "Every doctrine, feeling, impression, and miracle must be judged strictly by the unchanging Word of God: 'To the law and to the testimony!'",
      supportingVerses: ["Isaiah 8:20", "Acts 17:11", "2 Timothy 3:16–17"],
      egwConnection: {
        note: "None but those who have fortified the mind with the truths of the Bible will stand through the last great conflict.",
        source: "The Great Controversy, p. 593"
      }
    }
  ],
  "god's eternal law of love": [
    {
      id: 1,
      chapterTag: "Days 1–2 Character",
      title: "1. Transcript of the Divine Character",
      description: "The Ten Commandments are not arbitrary rules, but an eternal transcript of God's holy, just, and benevolent character of love.",
      supportingVerses: ["Exodus 20:1–17", "Psalm 19:7–11", "Romans 7:12"],
      egwConnection: {
        note: "The law of God, from its very nature, is unchangeable. It is a revelation of the will and the character of its Author.",
        source: "The Great Controversy, p. 467"
      }
    },
    {
      id: 2,
      chapterTag: "Days 3–4 Grace & Law",
      title: "2. Grace Establishes the Law in the Heart",
      description: "Salvation is entirely by grace through faith, and genuine faith produces a willing, Spirit-empowered obedience that writes the law upon the heart.",
      supportingVerses: ["Romans 3:31", "Hebrews 8:10", "John 14:15"],
      egwConnection: {
        note: "Grace is not opposed to the law. True faith works by love and purifies the soul, leading to cheerful conformity to God’s will.",
        source: "Faith and Works, p. 95"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Standard",
      title: "3. The Law of Liberty & End-Time Standard",
      description: "All humanity will be judged by the royal law of liberty, which upholds all ten commandments as an indivisible standard of holiness.",
      supportingVerses: ["James 2:10–12", "Ecclesiastes 12:13–14", "1 John 5:2–3"],
      egwConnection: {
        note: "The law of God is the standard of character. It is the rule of life, and will be the standard in the judgment.",
        source: "Christ’s Object Lessons, p. 315"
      }
    }
  ],
  "the seal of god": [
    {
      id: 1,
      chapterTag: "Days 1–2 The Sign",
      title: "1. The Sabbath: God's Eternal Sign of Loyalty",
      description: "From Creation to the New Earth, the Seventh-day Sabbath stands as God's perpetual seal of authority, sanctification, and allegiance.",
      supportingVerses: ["Genesis 2:1–3", "Exodus 20:8–11", "Ezekiel 20:12, 20"],
      egwConnection: {
        note: "The Sabbath is a golden clasp that unites God and His people. It is the sign of God's creative and redeeming power.",
        source: "Testimonies, vol. 6, p. 351"
      }
    },
    {
      id: 2,
      chapterTag: "Days 3–4 Counterfeit",
      title: "2. The Counterfeit Mark of Apostasy",
      description: "In the final crisis, human religious laws and economic boycotts will enforce a counterfeit rest day, creating the supreme test of worship.",
      supportingVerses: ["Revelation 13:14–17", "Daniel 7:25", "Matthew 15:9"],
      egwConnection: {
        note: "Sunday-keeping is not yet the mark of the beast, and will not be until the decree goes forth causing men to worship this idol sabbath.",
        source: "Evangelism, p. 234"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Settlement",
      title: "3. Settled Into the Truth: The Heavenly Seal",
      description: "The seal of the living God is placed upon believers who are settled into the truth both intellectually and spiritually so they cannot be moved.",
      supportingVerses: ["Revelation 7:1–4", "Ephesians 4:30", "Revelation 14:1"],
      egwConnection: {
        note: "The seal of the living God will be placed upon those only who bear a likeness to Christ in character.",
        source: "The Faith I Live By, p. 287"
      }
    }
  ],
  "the return of our blessed hope": [
    {
      id: 1,
      chapterTag: "Days 1–2 The Promise",
      title: "1. The Literal, Visible Return of Jesus",
      description: "Christ's second coming is not metaphorical or secret; every eye shall see Him returning in literal glory and celestial majesty.",
      supportingVerses: ["Titus 2:13", "Acts 1:9–11", "Revelation 1:7"],
      egwConnection: {
        note: "The coming of Christ has been the hope of His true followers in all ages. The Saviour's parting promise upon Olivet filled their hearts with hope.",
        source: "The Great Controversy, p. 299"
      }
    },
    {
      id: 2,
      chapterTag: "Days 3–4 Resurrection",
      title: "2. The Blessed Resurrection & Translation",
      description: "At the trump of God, the sleeping righteous will be raised incorruptible, and the living faithful transformed in the twinkling of an eye.",
      supportingVerses: ["1 Thessalonians 4:16–17", "1 Corinthians 15:51–54", "John 5:28–29"],
      egwConnection: {
        note: "Amid the reeling of the earth, the flash of lightning, and the roar of thunder, the voice of the Son of God calls forth the sleeping saints.",
        source: "The Great Controversy, p. 644"
      }
    },
    {
      id: 3,
      chapterTag: "Days 5–7 Watchfulness",
      title: "3. Holy Living, Watchful Readiness & Mission",
      description: "Awaiting our Lord demands vigilant prayer, personal consecration, and urgent proclamation of the gospel to every nation.",
      supportingVerses: ["2 Peter 3:11–14", "Matthew 24:42–44", "Matthew 28:19–20"],
      egwConnection: {
        note: "To wait for Christ's appearing is to engage in earnest work for Him. Watchfulness and active labor must be combined.",
        source: "Testimonies, vol. 5, p. 468"
      }
    }
  ]
};

// Preset EGW Notes for standard Sabbath School lessons
const EGW_NOTE_PRESETS: Record<string, EgwQuoteItem[]> = {
  "spiritual gifts": [
    {
      theme: "Spirit & Intellectual Service",
      quote: "Through Christ the hidden glory of the holy of holies stands revealed. The Holy Spirit imparts gifts to every believer as He wills for the edification of the body.",
      source: "Sons and Daughters of God, p. 228",
      dayLabel: "Day 1 (Saturday, August 1)"
    },
    {
      theme: "Divine Truth & Character",
      quote: "God assigns to every man his work according to his ability. The talents that Christ entrusts to His church represent the gifts and graces imparted by the Holy Spirit.",
      source: "Christ’s Object Lessons, p. 326",
      dayLabel: "Day 2 (Sunday, August 2)"
    },
    {
      theme: "Spirit & Intellectual Service",
      quote: "The harmony of the church depends on the unity of its members in Christ. Diversity of gifts is ordained of God for the symmetrical growth of the church.",
      source: "Testimonies, vol. 5, p. 236",
      dayLabel: "Day 3 (Monday, August 3)"
    },
    {
      theme: "God's Supreme Love",
      quote: "Love is the active principle that transforms character and unites hearts in unselfish service.",
      source: "The Acts of the Apostles, p. 550",
      dayLabel: "Day 4 (Tuesday, August 4)"
    },
    {
      theme: "Law & Gospel",
      quote: "God is a God of order, and everything connected with His work should be conducted with sacred reverence.",
      source: "Testimonies, vol. 5, p. 491",
      dayLabel: "Day 5 (Wednesday, August 5)"
    },
    {
      theme: "Divine Truth & Character",
      quote: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
      source: "The Great Controversy, p. 593",
      dayLabel: "Day 6 (Thursday, August 6)"
    }
  ],
  "all to the glory of god": [
    {
      theme: "Divine Truth & Character",
      quote: "Knowledge without love puffs up the soul, but true Christian love edifies and unites. We must ever consider the conscience of our weaker brethren.",
      source: "Testimonies, vol. 4, p. 561",
      dayLabel: "Day 1"
    },
    {
      theme: "Spirit & Intellectual Service",
      quote: "Paul voluntarily yielded his personal rights and privileges in order that he might win souls for Christ.",
      source: "The Acts of the Apostles, p. 314",
      dayLabel: "Day 2"
    },
    {
      theme: "Law & Gospel",
      quote: "Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God. In every habit and choice, self is to be lost sight of in Christ.",
      source: "Ministry of Healing, p. 320",
      dayLabel: "Day 3"
    },
    {
      theme: "Divine Truth & Character",
      quote: "Let him that thinketh he standeth take heed lest he fall. Past victories offer no security against future presumption.",
      source: "Patriarchs and Prophets, p. 421",
      dayLabel: "Day 4"
    }
  ],
  "the sanctuary covenant": [
    {
      theme: "Sanctuary & Redemption",
      quote: "The sanctuary in heaven is the very center of Christ's work in behalf of men. It concerns every soul living upon the earth. It opens to view the plan of redemption.",
      source: "The Great Controversy, p. 488",
      dayLabel: "Day 1"
    },
    {
      theme: "Sanctuary & Redemption",
      quote: "As in the typical service there was a work of atonement at the close of the year, so before Christ's work for the redemption of men is completed there is a work of atonement for the removal of sin from the sanctuary.",
      source: "The Great Controversy, p. 421",
      dayLabel: "Day 2"
    },
    {
      theme: "The Cross & Atonement",
      quote: "Christ's priestly intercessions before the mercy seat assure us that we may approach the throne of grace with holy boldness, finding mercy in time of need.",
      source: "Patriarchs and Prophets, p. 356",
      dayLabel: "Day 3"
    },
    {
      theme: "Sanctuary & Redemption",
      quote: "The subject of the sanctuary and the investigative judgment should be clearly understood by the people of God.",
      source: "The Great Controversy, p. 488",
      dayLabel: "Day 4"
    }
  ],
  "three angels end-time remnant message": [
    {
      theme: "Divine Truth & Character",
      quote: "The proclamation of the first, second, and third angels' messages is to be carried to every nation, kindred, tongue, and people. It is the last warning message to a dying world.",
      source: "Testimonies, vol. 6, p. 19",
      dayLabel: "Day 1"
    },
    {
      theme: "Law & Gospel",
      quote: "The fear of God and worship of the Creator are at the center of the first angel's message. We are called to honor Him as the Maker of heaven and earth by keeping His holy Sabbath.",
      source: "The Great Controversy, p. 436",
      dayLabel: "Day 2"
    },
    {
      theme: "Divine Truth & Character",
      quote: "Babylon is fallen because she has substituted human traditions and false doctrines for the word of God.",
      source: "The Great Controversy, p. 389",
      dayLabel: "Day 3"
    },
    {
      theme: "Law & Gospel",
      quote: "Here are they that keep the commandments of God and the faith of Jesus. This is the mark of God's remnant people in the final crisis.",
      source: "Testimonies, vol. 7, p. 104",
      dayLabel: "Day 4"
    }
  ],
  "the war behind all wars": [
    {
      theme: "Sanctuary & Redemption",
      quote: "War broke out in heaven because Lucifer coveted the supremacy belonging to the Son of God alone. Pride transformed the covering cherub into the enemy of God.",
      source: "Patriarchs and Prophets, p. 35",
      dayLabel: "Day 1"
    },
    {
      theme: "The Cross & Atonement",
      quote: "At the cross of Calvary, Satan's true character was unmasked before the unfallen universe, and his doom was forever sealed.",
      source: "The Desire of Ages, p. 761",
      dayLabel: "Day 2"
    },
    {
      theme: "Law & Gospel",
      quote: "The dragon was wroth with the woman, and went to make war with the remnant of her seed. Satan's enmity against God's law-abiding people will intensify until the end of time.",
      source: "The Great Controversy, p. 592",
      dayLabel: "Day 3"
    }
  ],
  "satan's great deceptions": [
    {
      theme: "Divine Truth & Character",
      quote: "Satan comes transformed as an angel of light, presenting deceptive errors wrapped in apparent truth. Only those who have fortified their minds with the Scriptures will stand through the last great delusion.",
      source: "The Great Controversy, p. 593",
      dayLabel: "Day 1"
    },
    {
      theme: "Law & Gospel",
      quote: "The word of God is our only safeguard. To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
      source: "Testimonies, vol. 5, p. 690",
      dayLabel: "Day 2"
    }
  ],
  "god's eternal law of love": [
    {
      theme: "Law & Gospel",
      quote: "The law of God is a transcript of His character. It embodies the principle of love, which is the foundation of God's government in heaven and on earth.",
      source: "Steps to Christ, p. 60",
      dayLabel: "Day 1"
    },
    {
      theme: "God's Supreme Love",
      quote: "Love to God and love to man are the two great principles upon which hang all the law and the prophets. Obedience is not a cold requirement, but the fruit of love.",
      source: "The Desire of Ages, p. 607",
      dayLabel: "Day 2"
    }
  ],
  "the seal of god": [
    {
      theme: "Law & Gospel",
      quote: "The Sabbath is the seal of God's authority as Creator. As the Sabbath has been made the sign of loyalty to God, so the counterfeit sabbath is the sign of allegiance to the beast.",
      source: "The Great Controversy, p. 605",
      dayLabel: "Day 1"
    },
    {
      theme: "Divine Truth & Character",
      quote: "An impression of the truth is to be stamped upon the soul by the Holy Spirit. Those who receive the seal of God will be settled into the truth, both intellectually and spiritually, so that they cannot be moved.",
      source: "Testimonies, vol. 5, p. 216",
      dayLabel: "Day 2"
    }
  ],
  "the return of our blessed hope": [
    {
      theme: "Sanctuary & Redemption",
      quote: "The coming of the Lord has been in all ages the hope of His true followers. The Savior's parting promise on Mount Olivet illuminated the future for His disciples.",
      source: "The Great Controversy, p. 302",
      dayLabel: "Day 1"
    },
    {
      theme: "The Cross & Atonement",
      quote: "He shall come in the clouds of heaven with power and great glory, accompanied by thousands of holy angels to gather His elect.",
      source: "The Desire of Ages, p. 828",
      dayLabel: "Day 2"
    }
  ]
};

/**
 * Returns 3 theological takeaways perfectly synchronized with the given lesson title, memory verse, and daily lessons.
 */
export function getTheologicalTakeaways(
  lessonTitle: string,
  memoryVerse: string,
  dailyLessons: DailyLesson[]
): TheologicalTakeawayItem[] {
  const normalizedTitle = (lessonTitle || "").toLowerCase().trim();

  // 1. Direct match with preset keys
  for (const key of Object.keys(THEOLOGICAL_TAKEAWAY_PRESETS)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return THEOLOGICAL_TAKEAWAY_PRESETS[key];
    }
  }

  // 2. Keyword matching for common themes
  if (normalizedTitle.includes("prophet") || normalizedTitle.includes("prophecy")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["new testament prophets"];
  }
  if (normalizedTitle.includes("corinth") || normalizedTitle.includes("gift")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["spiritual gifts"];
  }
  if (normalizedTitle.includes("sanctuary") || normalizedTitle.includes("covenant") || normalizedTitle.includes("cleansing")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["the sanctuary covenant"];
  }
  if (normalizedTitle.includes("angel") || normalizedTitle.includes("remnant") || normalizedTitle.includes("babylon")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["three angels end-time remnant message"];
  }
  if (normalizedTitle.includes("war") || normalizedTitle.includes("dragon") || normalizedTitle.includes("conflict")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["the war behind all wars"];
  }
  if (normalizedTitle.includes("deception") || normalizedTitle.includes("counterfeit")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["satan's great deceptions"];
  }
  if (normalizedTitle.includes("law") || normalizedTitle.includes("commandment")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["god's eternal law of love"];
  }
  if (normalizedTitle.includes("seal") || normalizedTitle.includes("mark")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["the seal of god"];
  }
  if (normalizedTitle.includes("return") || normalizedTitle.includes("hope") || normalizedTitle.includes("coming")) {
    return THEOLOGICAL_TAKEAWAY_PRESETS["the return of our blessed hope"];
  }

  // 3. Dynamic synthesis from daily lessons for custom imported/scraped content
  if (dailyLessons && dailyLessons.length >= 3) {
    const d1 = dailyLessons[0];
    const d2 = dailyLessons[1];
    const d3 = dailyLessons[2];
    const d4 = dailyLessons[3] || d3;
    const d5 = dailyLessons[4] || d4;
    const d6 = dailyLessons[5] || d5;
    const d7 = dailyLessons[6] || d5;

    const stringifyLessonContent = (content: any): string => {
      if (!content) return "";
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content.map((item) => (typeof item === "string" ? item : item?.text || "")).join(" ");
      }
      return "";
    };

    const extractScriptures = (texts: string[], fallback: string[]): string[] => {
      const found: string[] = [];
      const regex = /(?:[123]?\s*)?[A-Z][a-z]+\.?\s*\d+:\d+(?:–\d+|-?\d+)?/g;
      for (const t of texts) {
        if (!t) continue;
        const matches = t.match(regex);
        if (matches) {
          for (const m of matches) {
            const clean = m.trim();
            if (!found.includes(clean) && clean.length > 4) {
              found.push(clean);
              if (found.length >= 3) break;
            }
          }
        }
        if (found.length >= 3) break;
      }
      return found.length > 0 ? found : fallback;
    };

    const cleanContentSnippet = (text: string | any, fallback: string) => {
      const str = stringifyLessonContent(text);
      if (str) {
        const cleaned = str.replace(/#+\s*/g, "").replace(/>\s*/g, "").replace(/\n/g, " ").trim();
        if (cleaned.length > 30) {
          return cleaned.substring(0, 190) + "...";
        }
      }
      return fallback;
    };

    const extractEgw = (days: DailyLesson[]): { note: string; source: string } | undefined => {
      for (const day of days) {
        if (day.egwNotes && day.egwNotes.length > 0) {
          const raw = day.egwNotes[0];
          const parts = raw.split(/—|-{2,}/);
          return {
            note: parts[0]?.trim() || raw.trim(),
            source: parts[1]?.trim() || "Ellen White Comments"
          };
        }
      }
      return undefined;
    };

    return [
      {
        id: 1,
        chapterTag: "Days 1–3 Synthesis",
        title: `1. ${d1?.title || "Foundational Biblical Principle"}`,
        description: cleanContentSnippet(
          d1?.content || d2?.content,
          "Establishing the primary biblical foundation and scriptural exposition of the week's theme."
        ),
        bulletPoints: [
          `Ground faith in the primary biblical foundation revealed in ${d1?.title || "Scripture"}.`,
          "Examine the historical-grammatical context to discover God's original intent for His church.",
          "Recognize divine authority over human philosophy and tradition."
        ],
        supportingVerses: extractScriptures([stringifyLessonContent(d1?.content), stringifyLessonContent(d2?.content), stringifyLessonContent(d3?.content)], ["Romans 12:1–2", "1 Corinthians 12:4–7"]),
        egwConnection: extractEgw([d1, d2, d3]) || {
          note: "God calls for a complete consecration to His service, revealing His truth through His Word.",
          source: "Testimonies, vol. 5, p. 236"
        }
      },
      {
        id: 2,
        chapterTag: "Day 4 & Mid-Week Heart",
        title: `2. ${d4?.title || d3?.title || "Doctrinal Core & Spiritual Growth"}`,
        description: cleanContentSnippet(
          d4?.content || d3?.content,
          "Connecting line upon line to uncover the deeper spiritual application and Christ-centered character development."
        ),
        bulletPoints: [
          "Cultivate unselfish agape love as the supreme principle of Christian discipleship.",
          "Deepen personal fellowship with Jesus Christ through daily prayer and submission.",
          "Allow the Holy Spirit to transform motives, speech, and practical ministry toward others."
        ],
        supportingVerses: extractScriptures([stringifyLessonContent(d4?.content), stringifyLessonContent(d3?.content)], ["1 Corinthians 13:4–8", "Galatians 5:22–23"]),
        egwConnection: extractEgw([d4, d3]) || {
          note: "Love is the active principle that transforms character and unites hearts in unselfish service.",
          source: "The Acts of the Apostles, p. 550"
        }
      },
      {
        id: 3,
        chapterTag: "Days 5–7 Climax",
        title: `3. ${d6?.title || d5?.title || "Practical & Prophetic Application"}`,
        description: cleanContentSnippet(
          d6?.content || d5?.content || d7?.content,
          "Applying God's eternal truth to daily discipleship, reverent worship, and missionary proclamation."
        ),
        bulletPoints: [
          "Test all spiritual claims and teachings strictly by the standard of Sola Scriptura.",
          "Prepare for end-time challenges with an intelligent, obedient knowledge of God's Word.",
          "Share the everlasting gospel with clarity, reverence, and missionary zeal."
        ],
        supportingVerses: extractScriptures([stringifyLessonContent(d5?.content), stringifyLessonContent(d6?.content), stringifyLessonContent(d7?.content)], ["Revelation 14:12", "1 Thessalonians 5:21"]),
        egwConnection: extractEgw([d5, d6, d7]) || {
          note: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
          source: "The Great Controversy, p. 593"
        }
      }
    ];
  }

  // Fallback to default New Testament Prophets or Spiritual Gifts takeaways
  return THEOLOGICAL_TAKEAWAY_PRESETS["new testament prophets"] || THEOLOGICAL_TAKEAWAY_PRESETS["spiritual gifts"];
}

/**
 * Parses raw takeaway description text into structured paragraphs and bullet points if formatted with markdown bullets.
 */
export function formatTakeawayContent(description: string): { paragraphs: string[]; bulletPoints: string[] } {
  if (!description) return { paragraphs: [], bulletPoints: [] };
  const lines = description.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const paragraphs: string[] = [];
  const bulletPoints: string[] = [];

  for (const line of lines) {
    if (/^[-*•]\s+/.test(line)) {
      bulletPoints.push(line.replace(/^[-*•]\s+/, "").trim());
    } else {
      paragraphs.push(line);
    }
  }

  return { paragraphs, bulletPoints };
}

/**
 * Returns Ellen White notes synchronized with the active Sabbath School lesson.
 */
export function getEgwNotesForLesson(
  dailyLessons: DailyLesson[],
  lessonTitle: string
): EgwQuoteItem[] {
  const normalizedTitle = (lessonTitle || "").toLowerCase().trim();
  const extracted: EgwQuoteItem[] = [];

  // 1. First, check if dailyLessons contains explicit EGW notes
  if (dailyLessons && Array.isArray(dailyLessons)) {
    dailyLessons.forEach((day) => {
      const { egwParagraphs } = separateLessonAndEgwNotes(day.content, (day as any).egwNotes);
      egwParagraphs.forEach((p) => {
        let text = p.trim();
        let source = "Ellen White Notes";

        const emDashPos = text.lastIndexOf("—");
        const enDashPos = text.lastIndexOf("–");
        const dashPos = emDashPos !== -1 ? emDashPos : enDashPos;

        if (dashPos !== -1 && dashPos > text.length - 150) {
          source = text.substring(dashPos + 1).trim();
          text = text.substring(0, dashPos).trim();
        }

        let theme = day.label ? `Lesson Note (${day.label})` : "Spirit of Prophecy Insight";
        const lower = text.toLowerCase();
        if (lower.includes("sanctuary") || lower.includes("holiest") || lower.includes("mercy seat")) {
          theme = "Sanctuary & Redemption";
        } else if (lower.includes("spirit") || lower.includes("faculties") || lower.includes("talents") || lower.includes("gift")) {
          theme = "Spirit & Intellectual Service";
        } else if (lower.includes("cross") || lower.includes("atonement") || lower.includes("sacrifice")) {
          theme = "The Cross & Atonement";
        } else if (lower.includes("love") || lower.includes("repentance")) {
          theme = "God's Supreme Love";
        } else if (lower.includes("law") || lower.includes("commandment")) {
          theme = "Law & Gospel";
        } else if (lower.includes("education") || lower.includes("truth")) {
          theme = "Divine Truth & Character";
        }

        if (text && !extracted.some((item) => item.quote === text)) {
          extracted.push({
            theme,
            quote: text,
            source: source.startsWith("Ellen") ? source : `Ellen G. White, ${source}`,
            dayLabel: day.label,
            dailyTopic: day.title || theme
          });
        }
      });
    });
  }

  // If relocated notes exist from daily lessons, return them directly to replace legacy presets
  if (extracted.length > 0) {
    return extracted;
  }

  const mapPresetsWithTopic = (list: EgwQuoteItem[]): EgwQuoteItem[] => {
    return list.map((item, idx) => ({
      ...item,
      dailyTopic: item.dailyTopic || item.theme || `Topic ${idx + 1}`
    }));
  };

  // 3. Fallback to preset EGW quotes matching the lesson title if no daily lessons provided
  for (const key of Object.keys(EGW_NOTE_PRESETS)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return mapPresetsWithTopic(EGW_NOTE_PRESETS[key]);
    }
  }

  if (normalizedTitle.includes("sanctuary") || normalizedTitle.includes("covenant")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["the sanctuary covenant"]);
  }
  if (normalizedTitle.includes("angel") || normalizedTitle.includes("remnant")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["three angels end-time remnant message"]);
  }
  if (normalizedTitle.includes("war") || normalizedTitle.includes("dragon")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["the war behind all wars"]);
  }
  if (normalizedTitle.includes("deception")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["satan's great deceptions"]);
  }
  if (normalizedTitle.includes("law") || normalizedTitle.includes("commandment")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["god's eternal law of love"]);
  }
  if (normalizedTitle.includes("seal") || normalizedTitle.includes("mark")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["the seal of god"]);
  }
  if (normalizedTitle.includes("return") || normalizedTitle.includes("hope")) {
    return mapPresetsWithTopic(EGW_NOTE_PRESETS["the return of our blessed hope"]);
  }

  return mapPresetsWithTopic(EGW_NOTE_PRESETS["spiritual gifts"]);
}
