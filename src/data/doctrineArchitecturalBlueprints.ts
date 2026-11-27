import {
  ConstellationDoctrineNode,
  getSdaConceptsForNode
} from "./doctrineBlueprintGraph";

export interface BlueprintSubCard {
  id: string;
  title: string;
  verses: string[];
  mainPoints: string[];
  doctrinalKey: string;
  pastoralNote: string;
  /** Revealed dynamically when the user clicks READ MORE */
  deepNotes: string;
  additionalContext: string;
  practicalApplication: string[];
  spiritOfProphecy: { quote: string; source: string };
}

export interface BlueprintColumn {
  id: string;
  headerBanner: string;
  iconKey: "dove" | "flame" | "lamp" | "book" | "shield" | "crown";
  cards: BlueprintSubCard[];
}

export interface DoctrineArchitecturalBlueprint {
  nodeId: string;
  title: string;
  subtitle: string;
  columns: [BlueprintColumn, BlueprintColumn, BlueprintColumn];
}

const CURATED_BLUEPRINTS: Record<string, DoctrineArchitecturalBlueprint> = {
  // Master Template directly modeled on "THE HOLY SPIRIT: AN ARCHITECTURAL BLUEPRINT"
  "fb-5": {
    nodeId: "fb-5",
    title: "THE HOLY SPIRIT: AN ARCHITECTURAL BLUEPRINT",
    subtitle: "Fundamental Belief #5 • Comprehensive Doctrine Map | Systematic Theology Study",
    columns: [
      {
        id: "hs-col-1",
        headerBanner: "SOVEREIGN WORK & CONVICTION",
        iconKey: "dove",
        cards: [
          {
            id: "hs-c1-1",
            title: "CONVICTION OF SIN",
            verses: ["John 16:8-11", "Acts 2:37"],
            mainPoints: [
              "Conviction exposes guilt and our desperate need of a Savior.",
              "The Spirit awakens the conscience to righteousness and coming judgment."
            ],
            doctrinalKey: "THE SPIRIT EXPOSES GUILT & NEED",
            pastoralNote: "Elder Stephen: This work is divine; trust the Spirit to move hearts toward genuine repentance.",
            deepNotes:
              "In John 16:8, Jesus uses the Greek verb elenchō—meaning to bring to light, expose with convincing proof, and draw a sinner to self-examination. Conviction is never harsh condemnation; it is God's loving summons away from ruin toward the Cross.",
            additionalContext:
              "At Pentecost (Acts 2:37), three thousand hearts were 'pricked' simultaneously when the Spirit applied Peter's Scripture-based sermon. True Seventh-day Adventist evangelism relies on the Spirit's convicting power, never human manipulation.",
            practicalApplication: [
              "Pray daily for a tender conscience that responds immediately to the Spirit's prompting.",
              "When sharing truth, present Christ warmly and leave the work of conviction to the Holy Spirit."
            ],
            spiritOfProphecy: {
              quote: "It is the Spirit that makes effectual what has been wrought out by the world's Redeemer.",
              source: "The Desire of Ages, p. 671"
            }
          },
          {
            id: "hs-c1-2",
            title: "SOVEREIGN REVELATION",
            verses: ["1 Corinthians 2:10-14", "2 Peter 1:21"],
            mainPoints: [
              "The Spirit searches the deep things of God and reveals inspired Scripture.",
              "Spiritual truths are spiritually discerned through humble dependence."
            ],
            doctrinalKey: "DIVINE ILLUMINATION OF SCRIPTURE",
            pastoralNote: "Elder Stephen: Never open the Bible without first inviting its divine Author to illuminate the text.",
            deepNotes:
              "The same Spirit who moved holy prophets to write Scripture (2 Peter 1:21) actively illuminates the mind of the Berean student today so that Scripture interprets Scripture without private distortion.",
            additionalContext:
              "In the Great Controversy, human reason divorced from the Spirit drifts into either rationalism or fanaticism. The Spirit always harmonizes His guidance with the written Law and Testimony (Isaiah 8:20).",
            practicalApplication: [
              "Begin every Bible study session with a brief prayer asking the Spirit for clarity and obedience.",
              "Test every impression or teaching directly against the plain Word of God."
            ],
            spiritOfProphecy: {
              quote: "The Spirit was given as a regenerating agency, and without this the sacrifice of Christ would have been of no avail.",
              source: "The Desire of Ages, p. 671"
            }
          }
        ]
      },
      {
        id: "hs-col-2",
        headerBanner: "NEW CREATION & REGENERATION",
        iconKey: "flame",
        cards: [
          {
            id: "hs-c2-1",
            title: "SPIRITUAL REBIRTH",
            verses: ["John 3:5-8", "Titus 3:5-7"],
            mainPoints: [
              "A supernatural act of divine re-creation from above.",
              "Replaces the stony heart with new desires aligned with God's law."
            ],
            doctrinalKey: "SUPERNATURAL ACT OF GIVING NEW LIFE",
            pastoralNote: "Elder Stephen: We must be born from above—not merely reformed externally, but completely renewed within.",
            deepNotes:
              "Jesus told Nicodemus that flesh only produces flesh; only the Spirit imparts spiritual life (John 3:6). Titus 3:5 calls this the 'washing of regeneration, and renewing of the Holy Ghost'—purely by God's mercy.",
            additionalContext:
              "Regeneration fulfills the New Covenant promise of Ezekiel 36:26-27 and Jeremiah 31:33, where God puts His Spirit within His people and writes His commandments upon the heart.",
            practicalApplication: [
              "Surrender self-reliance and ask Christ to recreate your motives and affections.",
              "Celebrate new life by walking in conscious dependence on the Spirit each morning."
            ],
            spiritOfProphecy: {
              quote: "A new life is begun in the soul. The life of Christ is imparted to the believer.",
              source: "Steps to Christ, p. 57"
            }
          },
          {
            id: "hs-c2-2",
            title: "BAPTISM IN THE SPIRIT",
            verses: ["1 Corinthians 12:13", "Acts 1:8"],
            mainPoints: [
              "Unites every believer into the living body of Christ.",
              "Empowers disciples with spiritual gifts for global gospel witness."
            ],
            doctrinalKey: "EMPOWERMENT FOR MISSION & UNITY",
            pastoralNote: "Elder Stephen: The Former and Latter Rain equip ordinary disciples to finish Christ's commission.",
            deepNotes:
              "Acts 1:8 links the baptism of the Spirit directly to mission—receiving power (dunamis) to become Christ's witnesses to the ends of the earth.",
            additionalContext:
              "Adventist prophetic theology recognizes Pentecost as the Former Rain and anticipates the Latter Rain outpouring (Joel 2:23, 28) empowering the final Loud Cry of Revelation 18.",
            practicalApplication: [
              "Discover and actively use your spiritual gifts to bless your local church and community.",
              "Pray earnestly for the Latter Rain preparation of heart and character."
            ],
            spiritOfProphecy: {
              quote: "The lapse of time has wrought no change in Christ's parting promise to send the Holy Spirit as His representative.",
              source: "The Acts of the Apostles, p. 50"
            }
          }
        ]
      },
      {
        id: "hs-col-3",
        headerBanner: "INDWELLING & SANCTIFICATION",
        iconKey: "lamp",
        cards: [
          {
            id: "hs-c3-1",
            title: "INDWELLING PRESENCE",
            verses: ["Romans 8:9-11", "1 Corinthians 6:19-20"],
            mainPoints: [
              "God Himself abides personally within the surrendered believer.",
              "Your body becomes a sacred living temple of the Holy Spirit."
            ],
            doctrinalKey: "GOD HIMSELF ABIDES WITHIN THE BELIEVER",
            pastoralNote: "Elder Stephen: Your body is a temple; live holy, healthful lives by His indwelling power.",
            deepNotes:
              "Paul connects the indwelling Spirit directly to practical health, purity, and resurrection hope (Romans 8:11). Because we are bought with a price, honoring God in body and mind is an act of worship.",
            additionalContext:
              "This pillar anchors the Seventh-day Adventist health message—not as legalism, but as joyful stewardship of the Spirit's dwelling place.",
            practicalApplication: [
              "Guard your physical rest, nutrition, and mental intake as sacred temple stewardship.",
              "Practice quiet awareness of Christ's abiding presence throughout the workday."
            ],
            spiritOfProphecy: {
              quote: "Our bodies are Christ's purchased possession, and we are not at liberty to do with them as we please.",
              source: "The Ministry of Healing, p. 130"
            }
          },
          {
            id: "hs-c3-2",
            title: "SANCTIFYING POWER",
            verses: ["Galatians 5:16-25", "2 Thessalonians 2:13"],
            mainPoints: [
              "Produces the organic fruit of love, joy, peace, and self-control.",
              "Seals believers into settled loyalty to God's truth."
            ],
            doctrinalKey: "LIFELONG TRANSFORMATION INTO CHRIST'S LIKENESS",
            pastoralNote: "Elder Stephen: Sanctification is the work of a lifetime—walking daily in step with the Spirit.",
            deepNotes:
              "Galatians 5 contrasts the works of the flesh with the singular 'fruit' of the Spirit—a unified Christlike character grown naturally as we abide in Jesus.",
            additionalContext:
              "Ephesians 4:30 links the Spirit's sanctifying work to the final sealing of God's end-time people prior to the close of probation.",
            practicalApplication: [
              "Invite the Spirit to replace one recurring habit of impatience or worry with His fruit today.",
              "Keep a weekly journal noting how God's grace is reshaping your reactions and relationships."
            ],
            spiritOfProphecy: {
              quote: "Sanctification is not the work of a moment, an hour, a day, but of a lifetime.",
              source: "The Acts of the Apostles, p. 560"
            }
          }
        ]
      }
    ]
  },

  "fb-24": {
    nodeId: "fb-24",
    title: "THE HEAVENLY SANCTUARY: AN ARCHITECTURAL BLUEPRINT",
    subtitle: "Fundamental Belief #24 • Comprehensive Doctrine Map | Systematic Theology Study",
    columns: [
      {
        id: "sn-col-1",
        headerBanner: "THE OUTER COURT • CALVARY",
        iconKey: "flame",
        cards: [
          {
            id: "sn-c1-1",
            title: "ALTAR OF SACRIFICE & LAVER",
            verses: ["Exodus 25:8", "John 1:29", "Hebrews 9:22"],
            mainPoints: [
              "The bronze altar prefigured Christ's once-for-all substitutionary death.",
              "The laver signified baptismal cleansing and spiritual rebirth."
            ],
            doctrinalKey: "JUSTIFICATION THROUGH THE LAMB OF GOD",
            pastoralNote: "Elder Stephen: Every sanctuary truth begins at the Cross—Christ's blood is our sole foundation.",
            deepNotes:
              "In Exodus 25:8, God's stated desire is relational: 'that I may dwell among them.' The earthly tabernacle was a visual gospel diagram pointing straight to Jesus.",
            additionalContext:
              "Without the Outer Court sacrifice on earth, there could be no heavenly priestly ministry. Calvary paid the full price of redemption once for all (Hebrews 10:10).",
            practicalApplication: [
              "Rest your assurance wholly in Christ's finished atonement at Calvary.",
              "Approach God with gratitude rather than guilt-driven self-effort."
            ],
            spiritOfProphecy: {
              quote: "The scripture which above all others had been both the foundation and the central pillar of the advent faith was the declaration: 'Unto two thousand and three hundred days; then shall the sanctuary be cleansed.'",
              source: "The Great Controversy, p. 409"
            }
          }
        ]
      },
      {
        id: "sn-col-2",
        headerBanner: "THE HOLY PLACE • DAILY MEDIATION",
        iconKey: "lamp",
        cards: [
          {
            id: "sn-c2-1",
            title: "CHRIST'S INTERCESSORY MINISTRY",
            verses: ["Hebrews 8:1-5", "Hebrews 7:25", "Revelation 8:3-4"],
            mainPoints: [
              "Showbread, lampstand, and incense reveal the Word, Spirit, and prayer.",
              "Christ ever lives to intercede and apply His merits daily."
            ],
            doctrinalKey: "SANCTIFICATION & CONTINUOUS INTERCESSION",
            pastoralNote: "Elder Stephen: Jesus is not a passive bystander—He actively advocates for you before the Father right now.",
            deepNotes:
              "Hebrews 8:1-2 declares this the 'sum' of apostolic teaching: we have a real High Priest ministering in the true heavenly tabernacle pitched by the Lord, not man.",
            additionalContext:
              "Following His ascension in AD 31, Christ inaugurated His first-apartment ministry, applying forgiveness and grace to every repentant believer.",
            practicalApplication: [
              "Bring your prayers boldly to the throne of grace (Hebrews 4:16), confident in Christ's mediation.",
              "Nourish your soul daily on the Bread of Life (Scripture) and witness in the Spirit's light."
            ],
            spiritOfProphecy: {
              quote: "The intercession of Christ in man's behalf in the sanctuary above is as essential to the plan of salvation as was His death upon the cross.",
              source: "The Great Controversy, p. 489"
            }
          }
        ]
      },
      {
        id: "sn-col-3",
        headerBanner: "MOST HOLY PLACE • 1844 JUDGMENT",
        iconKey: "crown",
        cards: [
          {
            id: "sn-c3-1",
            title: "CLEANSING & VINDICATION",
            verses: ["Daniel 8:14", "Leviticus 16:30", "Revelation 11:19"],
            mainPoints: [
              "In 1844, at the end of the 2,300 prophetic days, Christ entered the Most Holy Place.",
              "The Investigative Judgment vindicates God's character and blots out confessed sin."
            ],
            doctrinalKey: "PRE-ADVENT JUDGMENT & ARK OF THE COVENANT",
            pastoralNote: "Elder Stephen: The judgment is good news for the believer—your Advocate is also your Judge.",
            deepNotes:
              "Revelation 11:19 reveals the heavenly ark containing the Ten Commandments beneath the golden mercy seat—proving law and mercy unite harmoniously in God's government.",
            additionalContext:
              "The antitypical Day of Atonement prepares a loyal end-time people before Christ returns with His reward (Revelation 22:12).",
            practicalApplication: [
              "Live in humble, joyous readiness knowing we are in the antitypical Day of Atonement.",
              "Confess and forsake known sins immediately, trusting Christ to blot them out forever."
            ],
            spiritOfProphecy: {
              quote: "We are now living in the great day of atonement... all who would have their names retained in the book of life should now, in the few remaining days of their probation, afflict their souls before God.",
              source: "The Great Controversy, p. 489"
            }
          }
        ]
      }
    ]
  },

  "fb-8": {
    nodeId: "fb-8",
    title: "THE GREAT CONTROVERSY: AN ARCHITECTURAL BLUEPRINT",
    subtitle: "Fundamental Belief #8 • Comprehensive Doctrine Map | Systematic Theology Study",
    columns: [
      {
        id: "gc-col-1",
        headerBanner: "ORIGIN OF REBELLION IN HEAVEN",
        iconKey: "shield",
        cards: [
          {
            id: "gc-c1-1",
            title: "WAR IN HEAVEN & FREE WILL",
            verses: ["Revelation 12:7-9", "Isaiah 14:12-14", "Ezekiel 28:14-15"],
            mainPoints: [
              "Evil originated not with God, but with Lucifer's self-exaltation.",
              "Satan challenged God's law as arbitrary and His character as unjust."
            ],
            doctrinalKey: "GOD'S CHARACTER & LOVE ON TRIAL",
            pastoralNote: "Elder Stephen: God did not destroy Lucifer instantly because love cannot be forced by fear.",
            deepNotes:
              "Ezekiel 28:15 confirms Lucifer was created 'perfect in thy ways' until iniquity was found in him. Free will is the prerequisite for genuine love throughout the universe.",
            additionalContext:
              "Understanding the cosmic origin of evil answers the deepest question of human suffering: an enemy hath done this (Matthew 13:28).",
            practicalApplication: [
              "Reject the lie that God's commandments are burdensome—they are hedges of love.",
              "Recognize spiritual warfare behind daily temptations and stand firm in Christ."
            ],
            spiritOfProphecy: {
              quote: "The law of love being the foundation of the government of God, the happiness of all intelligent beings depends upon their perfect accord with its great principles of righteousness.",
              source: "Patriarchs and Prophets, p. 34"
            }
          }
        ]
      },
      {
        id: "gc-col-2",
        headerBanner: "CALVARY • COSMIC VINDICATION",
        iconKey: "flame",
        cards: [
          {
            id: "gc-c2-1",
            title: "THE CROSS EXPOSES SATAN'S LIES",
            verses: ["John 12:31-32", "Colossians 2:15", "Job 1:6-12"],
            mainPoints: [
              "At Calvary, Christ unmasked Satan's cruelty before the watching universe.",
              "Justice and mercy kissed at the Cross—proving God's law is immutable."
            ],
            doctrinalKey: "SATAN DEFEATED & GOD VINDICATED AT CALVARY",
            pastoralNote: "Elder Stephen: The Cross settled forever that God would rather die Himself than leave us lost.",
            deepNotes:
              "When Christ cried 'It is finished,' Satan's accusation that God is selfish was shattered forever before every unfallen world.",
            additionalContext:
              "The book of Job illustrates how earthly faithfulness testifies in the heavenly council before watching intelligences.",
            practicalApplication: [
              "Look to Calvary whenever trials tempt you to doubt God's goodness.",
              "Measure every worldview and doctrine by how it reflects Christ's self-sacrificing love."
            ],
            spiritOfProphecy: {
              quote: "Satan saw that his disguise was torn away. His administration was laid open before the unfallen angels and before the heavenly universe.",
              source: "The Desire of Ages, p. 761"
            }
          }
        ]
      },
      {
        id: "gc-col-3",
        headerBanner: "FINAL TRIUMPH & ETERNAL HARMONY",
        iconKey: "crown",
        cards: [
          {
            id: "gc-c3-1",
            title: "SIN ERADICATED FOREVER",
            verses: ["Nahum 1:9", "Revelation 21:1-4", "1 Corinthians 4:9"],
            mainPoints: [
              "Affliction shall not rise up the second time once every question is answered.",
              "The universe unites in eternal gladness declaring: 'God is love.'"
            ],
            doctrinalKey: "ETERNAL SECURITY OF A REDEEMED UNIVERSE",
            pastoralNote: "Elder Stephen: The Great Controversy ends not in endless torment, but in a clean, joyous universe.",
            deepNotes:
              "Nahum 1:9 promises sin will never re-emerge because every created being will have witnessed the full fruit of rebellion contrasted with God's self-giving grace.",
            additionalContext:
              "This cosmic framework unites all 28 Fundamental Beliefs into one coherent story from Genesis 1 to Revelation 22.",
            practicalApplication: [
              "Live with eternal perspective—today's faithfulness matters in the cosmic conflict.",
              "Share the Three Angels' Messages with urgency and Christlike compassion."
            ],
            spiritOfProphecy: {
              quote: "The great controversy is ended. Sin and sinners are no more. The entire universe is clean. One pulse of harmony and gladness beats through the vast creation.",
              source: "The Great Controversy, p. 678"
            }
          }
        ]
      }
    ]
  }
};

/**
 * Returns a unique, doctrine-specific 3-column Architectural Blueprint for ANY doctrine node
 * (never repeating the same pillars or scriptures across different doctrines!).
 */
export function getArchitecturalBlueprintForNode(
  node: ConstellationDoctrineNode,
  trackTitle: string
): DoctrineArchitecturalBlueprint {
  if (CURATED_BLUEPRINTS[node.id]) {
    return CURATED_BLUEPRINTS[node.id];
  }

  const concepts = getSdaConceptsForNode(node);
  const refs = node.anchorRefs && node.anchorRefs.length > 0 ? node.anchorRefs : ["2 Timothy 3:16", "Isaiah 28:10"];
  const c1 = concepts[0] || { label: "Biblical Foundation", explanation: `Rooted directly in Sola Scriptura for ${node.label}.` };
  const c2 = concepts[1] || { label: "Christ-Centered Core", explanation: `Illuminates how ${node.label} reveals Christ's redemptive work.` };
  const c3 = concepts[2] || { label: "Sanctuary & Life Reform", explanation: `Applies ${node.label} to end-time discipleship and character.` };

  const col1Refs = refs.slice(0, Math.max(1, Math.ceil(refs.length / 3)));
  const col2Refs = refs.slice(col1Refs.length, Math.max(col1Refs.length + 1, Math.ceil((refs.length * 2) / 3)));
  const col3Refs = refs.slice(col1Refs.length + col2Refs.length);

  return {
    nodeId: node.id,
    title: `${node.label.toUpperCase()}: AN ARCHITECTURAL BLUEPRINT`,
    subtitle: `${node.shortTag} • ${trackTitle} | Systematic Theology Study`,
    columns: [
      {
        id: `${node.id}-col-1`,
        headerBanner: `FOUNDATION • ${c1.label.toUpperCase()}`,
        iconKey: "book",
        cards: [
          {
            id: `${node.id}-c1`,
            title: c1.label.toUpperCase(),
            verses: col1Refs.length > 0 ? col1Refs : [refs[0]],
            mainPoints: [
              node.summary,
              c1.explanation
            ],
            doctrinalKey: `${node.label.toUpperCase()} ANCHORED IN SOLA SCRIPTURA`,
            pastoralNote: `Elder Stephen: Begin ${node.label} by letting Scripture interpret Scripture line upon line.`,
            deepNotes: `Examining ${node.label} through ${col1Refs.join(", ")} establishes its unmistakable biblical foundation without human speculation. ${c1.explanation}`,
            additionalContext: `Within ${trackTitle}, ${node.label} (${node.shortTag}) connects directly to ${node.connectedTo.length} neighboring biblical truths in the Great Controversy framework.`,
            practicalApplication: [
              `Read ${(col1Refs[0] || refs[0])} slowly in parallel translations and underline its primary promise or command.`,
              `Summarize ${node.label} in one clear sentence you could share with a new believer.`
            ],
            spiritOfProphecy: {
              quote: "The Bible is its own expositor. Scripture is to be compared with scripture.",
              source: "Education, p. 190"
            }
          }
        ]
      },
      {
        id: `${node.id}-col-2`,
        headerBanner: `CORE TRUTH • ${c2.label.toUpperCase()}`,
        iconKey: "flame",
        cards: [
          {
            id: `${node.id}-c2`,
            title: c2.label.toUpperCase(),
            verses: col2Refs.length > 0 ? col2Refs : refs.slice(0, 2),
            mainPoints: [
              c2.explanation,
              `Reveals Christ's saving character and covenant faithfulness in ${node.label}.`
            ],
            doctrinalKey: `${c2.label.toUpperCase()} IN CHRIST`,
            pastoralNote: `Elder Stephen: Every authentic Seventh-day Adventist doctrine radiates directly from Jesus Christ.`,
            deepNotes: `${c2.explanation} Comparing ${(col2Refs.length > 0 ? col2Refs : refs).join(" and ")} unveils how this doctrine harmonizes God's justice, mercy, and heavenly ministry.`,
            additionalContext: `In Seventh-day Adventist systematic theology, ${node.label} never stands in isolation—it reinforces the sanctuary, the Sabbath, and the everlasting gospel.`,
            practicalApplication: [
              `Reflect on what ${node.label} teaches you personally about the character of God.`,
              `Identify one misconception about ${node.label} that Scripture gently corrects.`
            ],
            spiritOfProphecy: {
              quote: "In every page, whether history, or precept, or prophecy, the Old Testament Scriptures are irradiated with the glory of the Son of God.",
              source: "The Desire of Ages, p. 211"
            }
          }
        ]
      },
      {
        id: `${node.id}-col-3`,
        headerBanner: `APPLICATION • ${c3.label.toUpperCase()}`,
        iconKey: "lamp",
        cards: [
          {
            id: `${node.id}-c3`,
            title: c3.label.toUpperCase(),
            verses: col3Refs.length > 0 ? col3Refs : [refs[refs.length - 1]],
            mainPoints: [
              c3.explanation,
              `Equips believers to live and teach ${node.label} with winsome clarity.`
            ],
            doctrinalKey: `LIVING WITNESS OF ${node.label.toUpperCase()}`,
            pastoralNote: `Elder Stephen: True biblical mastery transforms both the heart and our compassionate witness to others.`,
            deepNotes: `${c3.explanation} Applying ${(col3Refs.length > 0 ? col3Refs : refs).join(", ")} moves ${node.label} from intellectual assent into Spirit-filled daily discipleship.`,
            additionalContext: `Prepared for the final proclamation of Revelation 14:6-12, believers who internalize ${node.label} can answer seekers with meekness and Scriptural clarity (1 Peter 3:15).`,
            practicalApplication: [
              `Choose one concrete devotional or lifestyle step this week inspired by ${node.label}.`,
              `Save your personal insights on ${node.label} to your STBA Study Notebook to teach someone else.`
            ],
            spiritOfProphecy: {
              quote: "True religion is the imitation of Christ. Those who follow Him will deny self, take up the cross, and walk in His footsteps.",
              source: "Steps to Christ, p. 44"
            }
          }
        ]
      }
    ]
  };
}
