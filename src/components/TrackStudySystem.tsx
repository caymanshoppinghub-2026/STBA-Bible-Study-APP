/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  Brain,
  Compass,
  Info,
  ChevronRight,
  BookmarkCheck,
  Check,
  BookMarked,
  X,
  RefreshCw,
  TrendingUp,
  FileText,
  Lock
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";
import { DEFAULT_DOCTRINE_TRACKS, DoctrineTrackDb } from "../data/doctrineTracksDb";
import { supabase } from "../lib/supabase";
import { ensureSupabaseAuth } from "../lib/notebookSync";
import { ElderStevenBubble } from "./mentor/ElderStevenBubble";

export const getTrackTitle = (trackId: string): string => {
  const titles: Record<string, string> = {
    "fundamental-beliefs": "28 Fundamental Beliefs",
    "three-angels": "Three Angels’ Messages",
    "sanctuary-doctrine": "Sanctuary Doctrine",
    "sabbath-school": "Sabbath School",
    "book-by-book": "Prophecy Foundations",
    "priority-doctrines": "Christian Living Essentials",
    "zoom-studies": "Zoom Bible Studies"
  };
  return titles[trackId] || "Theological Study Track";
};

// 28 Fundamental Beliefs Detailed Master Data
export interface FBLesson {
  id: string;
  number: number;
  title: string;
  summary: string;
  fullWording: string;
  keyReferences: {
    reference: string;
    text: string;
    commentary?: string;
  }[];
  outline: {
    title: string;
    summary: string;
    key_references: string[];
  }[];
  active_recall_prompts: {
    id: string;
    prompt: string;
    expected_answer: string;
    reference: string;
  }[];
}

export const FB_LESSONS: FBLesson[] = [
  {
    id: "fb-1",
    number: 1,
    title: "The Holy Scriptures",
    summary: "The written Word of God, given by divine inspiration, serving as the infallible rule of faith and practice.",
    fullWording: "The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration. The inspired authors spoke and wrote as they were moved by the Holy Spirit. In this Word, God has committed to humanity the knowledge necessary for salvation. The Holy Scriptures are the supreme, authoritative, and the infallible revelation of His will. They are the standard of character, the test of experience, the definitive revealer of doctrines, and the trustworthy record of God's acts in history.",
    keyReferences: [
      {
        reference: "2 Timothy 3:16",
        text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
        commentary: "Paul establishes 'theopneustos' (God-breathed) as the origin of all scripture. This means scripture carries the absolute authority of God's own voice, providing a complete blueprint for righteous living."
      },
      {
        reference: "2 Peter 1:21",
        text: "For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
        commentary: "Peter clarifies that scripture is not of human initiative; rather, the Holy Spirit moved upon human agents, guiding their thoughts while preserving their human individuality."
      }
    ],
    outline: [
      {
        title: "Divine Origin & Thought Inspiration",
        summary: "God inspired the thoughts of the writers, not merely their literal words, creating a harmonious blend of divine wisdom and human expression.",
        key_references: ["2 Peter 1:21", "1 Thessalonians 2:13"]
      },
      {
        title: "The Supreme Rule of Faith",
        summary: "The Bible stands as the ultimate benchmark to test all human experience, traditions, and doctrines.",
        key_references: ["Isaiah 8:20", "John 17:17"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-1-1",
        prompt: "Recite or explain 2 Timothy 3:16 and outline the fourfold utility of inspired Scripture.",
        expected_answer: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, and for instruction in righteousness.",
        reference: "2 Timothy 3:16"
      },
      {
        id: "fb-prompt-1-2",
        prompt: "According to 2 Peter 1:21, how did prophecy originate and what role did the Holy Spirit play?",
        expected_answer: "Prophecy did not come by the will of man, but holy men of God spoke as they were moved by the Holy Ghost.",
        reference: "2 Peter 1:21"
      }
    ]
  },
  {
    id: "fb-2",
    number: 2,
    title: "The Trinity",
    summary: "There is one God: Father, Son, and Holy Spirit — a unity of three coeternal Persons.",
    fullWording: "There is one God: Father, Son, and Holy Spirit — a unity of three coeternal Persons. God is immortal, all‑powerful, all‑knowing, above all, and ever‑present. He is infinite and beyond human comprehension, yet known through His self‑revelation. God, who is love, is forever worthy of worship, adoration, and service by all creation.",
    keyReferences: [
      {
        reference: "Genesis 1:26",
        text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air...",
        commentary: "The plural pronoun 'Let us' in Creation points to the divine council and collaborative activity of the Triune Godhead in making humanity."
      },
      {
        reference: "Deuteronomy 6:4",
        text: "Hear, O Israel: The Lord our God is one Lord.",
        commentary: "The foundational Shema declares the absolute unity of God. The Hebrew word 'echad' represents a compound unity, affirming one Godhead in three Persons."
      },
      {
        reference: "Isaiah 6:8",
        text: "Also I heard the voice of the Lord, saying, Whom shall I send, and who will go for us? Then said I, Here am I; send me.",
        commentary: "God speaks in both the singular ('Whom shall I send') and the plural ('who will go for us'), revealing the Triune communion within the Godhead."
      },
      {
        reference: "Matthew 28:19",
        text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.",
        commentary: "Jesus commands baptism into the singular 'name' of the Father, Son, and Holy Spirit—affirming their equal divine authority and shared divine essence. While the word ‘trinity’ may not be in the Bible, the concept of this three‑in‑one Godhead is expressed in many places throughout the Bible."
      },
      {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        commentary: "Demonstrates the sacrificial love of the Father in sending the Son, showing how God the Father, God the Son, and God the Holy Spirit work together in ways that a human team would never be able to for a common goal."
      },
      {
        reference: "2 Corinthians 1:21–22",
        text: "Now he which stablisheth us with you in Christ, and hath anointed us, is God; Who hath also sealed us, and given the earnest of the Spirit in our hearts.",
        commentary: "Paul references all three Persons: God the Father who establishes, Christ the Son who anoints, and the Holy Spirit who seals believers."
      },
      {
        reference: "2 Corinthians 13:14",
        text: "The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all. Amen.",
        commentary: "The apostolic blessing explicitly lists all three co-equal Persons of the Godhead, invoking Christ's grace, the Father's love, and the Spirit's fellowship."
      },
      {
        reference: "Ephesians 4:4–6",
        text: "There is one body, and one Spirit, even as ye are called in one hope of your calling; One Lord, one faith, one baptism, One God and Father of all, who is above all, and through all, and in you all.",
        commentary: "Paul details the organic unity of the Christian faith, structured around the one Spirit, the one Lord Jesus Christ, and the one God and Father."
      },
      {
        reference: "1 Peter 1:2",
        text: "Elect according to the foreknowledge of God the Father, through sanctification of the Spirit, unto obedience and sprinkling of the blood of Jesus Christ: Grace unto you, and peace, be multiplied.",
        commentary: "Peter presents the salvation of believers as a collaborative work of the Trinity: planned by the Father, sanctified by the Spirit, and redeemed through the blood of Jesus."
      }
    ],
    outline: [
      {
        title: "The Unity of the Godhead",
        summary: "One God in three coeternal Persons.",
        key_references: ["Deuteronomy 6:4", "Ephesians 4:4–6"]
      },
      {
        title: "The Distinct Persons",
        summary: "Father, Son, and Holy Spirit each fully divine.",
        key_references: ["Matthew 28:19", "2 Corinthians 13:14"]
      },
      {
        title: "The Co‑Eternal Nature",
        summary: "None created; all three have always existed.",
        key_references: ["Hebrews 9:14", "Micah 5:2"]
      },
      {
        title: "The Roles of the Father, Son, and Spirit",
        summary: "Distinct functions in perfect divine harmony.",
        key_references: ["John 3:16", "John 1:1–3", "John 16:7–13"]
      },
      {
        title: "The Trinity in Scripture",
        summary: "Evidenced throughout Old and New Testaments.",
        key_references: ["Genesis 1:26", "Luke 3:22", "Matthew 28:19"]
      },
      {
        title: "The Trinity in Salvation",
        summary: "Collaborative divine work for human redemption.",
        key_references: ["John 3:16", "1 Peter 1:2"]
      },
      {
        title: "The Mystery of the Godhead",
        summary: "Infinite God revealed to finite humanity.",
        key_references: ["Job 11:7", "Isaiah 55:8–9"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-2-1",
        prompt: "Recite Deuteronomy 6:4 and explain how it asserts the unity of the Godhead.",
        expected_answer: "Hear, O Israel: The Lord our God is one Lord. It establishes the singular compound unity and complete oneness of God.",
        reference: "Deuteronomy 6:4"
      },
      {
        id: "fb-prompt-2-2",
        prompt: "Recite Matthew 28:19 and highlight how the Great Commission presents the Trinity.",
        expected_answer: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost, emphasizing the singular name of three co-equal Persons.",
        reference: "Matthew 28:19"
      }
    ]
  },
  {
    id: "fb-3",
    number: 3,
    title: "The Father",
    summary: "God the eternal Father is the Creator, Source, Sustainer, and Sovereign of all creation.",
    fullWording: "God the eternal Father is the Creator, Source, Sustainer, and Sovereign of all creation. He is just and holy, merciful and gracious, slow to anger, and abounding in steadfast love and faithfulness. The qualities and powers exhibited in the Son and the Holy Spirit are also those of the Father.",
    keyReferences: [
      {
        reference: "Genesis 1:1",
        text: "In the beginning God created the heaven and the earth.",
        commentary: "God the eternal Father is revealed as the absolute Creator and Source of all created existence."
      },
      {
        reference: "Deuteronomy 4:35",
        text: "Unto thee it was shewed, that thou mightest know that the Lord he is God; there is none else beside him.",
        commentary: "Establishes the supreme sovereignty and unique self-existent nature of God the Father."
      },
      {
        reference: "Psalm 110:1, 4",
        text: "The Lord said unto my Lord, Sit thou at my right hand, until I make thine enemies thy footstool... The Lord hath sworn, and will not repent, Thou art a priest for ever after the order of Melchizedek.",
        commentary: "Reveals the Father's sovereign decree and prophetic covenant in relation to the Son."
      },
      {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        commentary: "Demonstrates the Father's proactive love and gracious sacrifice in giving His Son for human redemption."
      },
      {
        reference: "John 14:9",
        text: "Jesus saith unto him, Have I been so long time with you, and yet hast thou not known me, Philip? he that hath seen me hath seen the Father; and how sayest thou then, Shew us the Father?",
        commentary: "Affirms that the divine character, love, and attributes exhibited in Jesus Christ are perfect revelations of the Father."
      },
      {
        reference: "1 Corinthians 15:28",
        text: "And when all things shall be subdued unto him, then shall the Son also himself be subject unto him that put all things under him, that God may be all in all.",
        commentary: "Highlights God the Father as the ultimate Sovereign and Source of all restoration."
      },
      {
        reference: "1 Timothy 1:17",
        text: "Now unto the King eternal, immortal, invisible, the only wise God, be honour and glory for ever and ever. Amen.",
        commentary: "Exalts the eternal, immortal, invisible, and all-wise character of God the Father."
      },
      {
        reference: "1 John 4:8",
        text: "He that loveth not knoweth not God; for God is love.",
        commentary: "Declares the foundational nature of the Father's essence and character: 'God is love'."
      },
      {
        reference: "Revelation 4:11",
        text: "Thou art worthy, O Lord, to receive glory and honour and power: for thou hast created all things, and for thy pleasure they are and were created.",
        commentary: "Displays the heavenly adoration directed to God the Father as Creator and Sustainer of all things."
      }
    ],
    outline: [
      {
        title: "WHAT THE BIBLE TELLS US ABOUT GOD THE FATHER",
        summary: "God is our Father in Heaven, Father to the fatherless, and Father of Jesus.",
        key_references: ["1 John 3:1", "Psalm 68:5", "John 14:9"]
      },
      {
        title: "GOD IS THE CREATOR AND SUSTAINER OF LIFE",
        summary: "God created humanity in His image and sustains all living existence.",
        key_references: ["Genesis 1:1", "Revelation 4:11", "Acts 17:28"]
      },
      {
        title: "THE CHARACTER OF GOD",
        summary: "Ten divine attributes revealed in Scripture defining God's nature.",
        key_references: ["1 John 4:8", "1 Timothy 1:17"]
      },
      {
        title: "WHAT IT MEANS TO 'FEAR GOD AND GIVE HIM GLORY'",
        summary: "Reverence, obedience, submission to God's authority, and worship.",
        key_references: ["Ecclesiastes 12:13", "Revelation 14:7"]
      },
      {
        title: "HOW GOD RELATES WITH US, HIS CHILDREN",
        summary: "God desires relationship, listens, helps, comforts, heals, forgives, and guides.",
        key_references: ["John 3:16", "1 Corinthians 15:28"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-3-1",
        prompt: "Explain the Father's role in initiating salvation as shown in John 3:16.",
        expected_answer: "The Father's infinite love led Him to actively send and sacrifice His only begotten Son so we might inherit everlasting life.",
        reference: "John 3:16"
      }
    ]
  },
  {
    id: "fb-4",
    number: 4,
    title: "The Son",
    summary: "God the eternal Son became incarnate in Jesus Christ. Through Him all things were created, the character of God is revealed, the salvation of humanity is accomplished, and the world is judged. Forever truly God, He became also truly human. He lived, was tempted, died for our sins, rose again, ascended to heaven, ministers for us, and will return in glory to restore all things.",
    fullWording: "God the eternal Son became incarnate in Jesus Christ. Through Him all things were created, the character of God is revealed, the salvation of humanity is accomplished, and the world is judged. Forever truly God, He became also truly human. He lived, was tempted, died for our sins, rose again, ascended to heaven, ministers for us, and will return in glory to restore all things.",
    keyReferences: [
      {
        reference: "Isaiah 53:4–6",
        text: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.",
        commentary: "Prophesies the substitutionary sacrifice of Jesus Christ, bearing human sins to bring peace and healing."
      },
      {
        reference: "Daniel 9:25–27",
        text: "Know therefore and understand, that from the going forth of the commandment to restore and to build Jerusalem unto the Messiah the Prince shall be seven weeks, and threescore and two weeks... And after threescore and two weeks shall Messiah be cut off, but not for himself...",
        commentary: "Foretells the precise timing of Messiah's baptism, substitutionary death, and covenant confirmation."
      },
      {
        reference: "Luke 1:35",
        text: "And the angel answered and said unto her, The Holy Ghost shall come upon thee, and the power of the Highest shall overshadow thee: therefore also that holy thing which shall be born of thee shall be called the Son of God.",
        commentary: "Declares the miraculous conception of Jesus Christ by the Holy Spirit, uniting divine nature with human flesh."
      },
      {
        reference: "John 1:1–3, 14",
        text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made... And the Word was made flesh, and dwelt among us...",
        commentary: "Affirms the eternal deity and creative power of Jesus Christ, who became incarnate as the Word made flesh."
      },
      {
        reference: "John 5:22",
        text: "For the Father judgeth no man, but hath committed all judgment unto the Son.",
        commentary: "Reveals that the Father has entrusted all judgment to Jesus Christ, who is both Creator and human Savior."
      },
      {
        reference: "John 10:30",
        text: "I and my Father are one.",
        commentary: "Affirms the absolute unity of essence, purpose, and divine nature between Jesus Christ and the Father."
      },
      {
        reference: "John 14:1–3, 9, 13",
        text: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions... I go to prepare a place for you... he that hath seen me hath seen the Father...",
        commentary: "Promises Christ's second coming, reveals Him as the perfect manifestation of the Father, and promises answers to prayer."
      },
      {
        reference: "Romans 6:23",
        text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
        commentary: "Contrasts the eternal death earned by sin with the free gift of eternal life through Jesus Christ."
      },
      {
        reference: "1 Corinthians 15:3–4",
        text: "For I delivered unto you first of all that which I also received, how that Christ died for our sins according to the scriptures; And that he was buried, and that he rose again the third day according to the scriptures.",
        commentary: "Summarizes the gospel truths: Christ's substitutionary death, burial, and triumphant resurrection."
      },
      {
        reference: "2 Corinthians 3:18",
        text: "But we all, with open face beholding as in a glass the glory of the Lord, are changed into the same image from glory to glory, even as by the Spirit of the Lord.",
        commentary: "Explains how beholding the glory and character of Jesus Christ transforms believers into His divine image."
      },
      {
        reference: "2 Corinthians 5:17–19",
        text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new... God was in Christ, reconciling the world unto himself...",
        commentary: "Declares that Christ brings new creation and complete reconciliation between God and humanity."
      },
      {
        reference: "Philippians 2:5–11",
        text: "Let this mind be in you, which was also in Christ Jesus: Who, being in the form of God, thought it not robbery to be equal with God: But made himself of no reputation, and took upon him the form of a servant...",
        commentary: "Traces Christ's self-emptying humility from equality with God down to death on the cross, followed by His exaltation."
      },
      {
        reference: "Colossians 1:15–19",
        text: "Who is the image of the invisible God, the firstborn of every creature: For by him were all things created... and he is before all things, and by him all things consist...",
        commentary: "Exalts Jesus Christ as Creator, Sustainer of all existence, Head of the Church, and embodiment of divine fullness."
      },
      {
        reference: "Hebrews 2:9–18",
        text: "But we see Jesus, who was made a little lower than the angels for the suffering of death, crowned with glory and honour... Forasmuch then as the children are partakers of flesh and blood, he also himself likewise took part of the same...",
        commentary: "Shows how Jesus shared fully in human flesh to conquer death, sympathize with human weakness, and serve as High Priest."
      },
      {
        reference: "Hebrews 8:1–2",
        text: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary...",
        commentary: "Presents Jesus Christ ministering as High Priest in the heavenly sanctuary on our behalf."
      }
    ],
    outline: [
      {
        title: "WHO IS GOD THE SON?",
        summary: "Jesus is the eternal Son of God, fully divine, co-eternal with the Father, and the Word made flesh.",
        key_references: ["John 1:1–3", "John 10:30", "Philippians 2:5–11"]
      },
      {
        title: "JESUS CHRIST IS OUR CREATOR",
        summary: "Creation was a cooperative act of the Godhead with Jesus as the active agent who formed humanity.",
        key_references: ["John 1:3", "Colossians 1:15–19"]
      },
      {
        title: "JESUS CHRIST CAME TO EARTH",
        summary: "Jesus is fully God and fully man, conceived by the Holy Spirit, fulfilling prophecy in human flesh.",
        key_references: ["Luke 1:35", "Isaiah 9:6"]
      },
      {
        title: "JESUS CHRIST IS OUR SAVIOR, THE MESSIAH",
        summary: "Jesus was tempted without sin, resisted Satan, and came to save the lost.",
        key_references: ["John 3:16", "Daniel 9:25–27"]
      },
      {
        title: "IT IS THROUGH JESUS’ DEATH THAT WE ARE SAVED",
        summary: "Jesus died voluntarily for our sins, bearing our griefs and rising as conqueror over death.",
        key_references: ["Isaiah 53:4–6", "1 Corinthians 15:3–4", "Romans 6:23"]
      },
      {
        title: "JESUS CHRIST IS OUR ADVOCATE",
        summary: "Jesus aids those who are tempted and serves as our High Priest and Advocate in the heavenly sanctuary.",
        key_references: ["Hebrews 2:9–18", "Hebrews 8:1–2"]
      },
      {
        title: "JESUS CHRIST WILL RETURN TO EARTH",
        summary: "Jesus will return personally and visibly to resurrect believers, transform the faithful, and end suffering.",
        key_references: ["John 14:1–3"]
      },
      {
        title: "HOW JESUS’ LIFE, DEATH, AND RESURRECTION AFFECT US",
        summary: "Faith in Jesus brings salvation, transformation, hope, healing, and eternal life.",
        key_references: ["2 Corinthians 3:18", "2 Corinthians 5:17–19"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-4-1",
        prompt: "How does Hebrews 1:3 define Jesus' relationship to the Father's glory and essence?",
        expected_answer: "He is the brightness of His glory and the express image of His person, upholding all things by the word of His power.",
        reference: "Hebrews 1:1-3"
      }
    ]
  },
  {
    id: "fb-5",
    number: 5,
    title: "The Holy Spirit",
    summary: "God the eternal Spirit was active with the Father and the Son in Creation, incarnation, and redemption. He is fully personal, inspires Scripture, empowers Christ’s life, convicts humanity, renews believers, gives spiritual gifts, empowers witness, and leads God’s people into all truth.",
    fullWording: "God the eternal Spirit was active with the Father and the Son in Creation, incarnation, and redemption. He is fully personal, inspires Scripture, empowers Christ’s life, convicts humanity, renews believers, gives spiritual gifts, empowers witness, and leads God’s people into all truth.",
    keyReferences: [
      {
        reference: "Genesis 1:1–2",
        text: "In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
        commentary: "Reveals the Holy Spirit actively present and working with the Father and the Son in the creation of the world."
      },
      {
        reference: "2 Samuel 23:2",
        text: "The Spirit of the Lord spake by me, and his word was in my tongue.",
        commentary: "Shows the Holy Spirit inspiring human prophets to speak and record God's infallible word."
      },
      {
        reference: "Psalm 51:11",
        text: "Cast me not away from thy presence; and take not thy holy spirit from me.",
        commentary: "Expresses David's earnest prayer for God's personal indwelling presence and moral restoration."
      },
      {
        reference: "Isaiah 61:1",
        text: "The Spirit of the Lord God is upon me; because the Lord hath anointed me to preach good tidings unto the meek; he hath sent me to bind up the brokenhearted, to proclaim liberty to the captives, and the opening of the prison to them that are bound...",
        commentary: "Prophesies the Holy Spirit's anointing upon the Messiah for His earthly ministry of deliverance and grace."
      },
      {
        reference: "Luke 1:35",
        text: "And the angel answered and said unto her, The Holy Ghost shall come upon thee, and the power of the Highest shall overshadow thee: therefore also that holy thing which shall be born of thee shall be called the Son of God.",
        commentary: "Demonstrates the Holy Spirit's active power in the miracle of Christ's incarnation."
      },
      {
        reference: "Luke 4:18",
        text: "The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives, and recovering of sight to the blind, to set at liberty them that are bruised...",
        commentary: "Jesus quotes Isaiah 61:1 to declare that His earthly mission is empowered by the Holy Spirit."
      },
      {
        reference: "John 14:16–18, 26",
        text: "And I will pray the Father, and he shall give you another Comforter, that he may abide with you for ever; Even the Spirit of truth... But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance...",
        commentary: "Promises the personal indwelling presence of the Holy Spirit as another Comforter and divine Teacher."
      },
      {
        reference: "John 15:26",
        text: "But when the Comforter is come, whom I will send unto you from the Father, even the Spirit of truth, which proceedeth from the Father, he shall testify of me.",
        commentary: "Affirms that the primary work of the Holy Spirit is to glorify Jesus Christ and testify of His truth."
      },
      {
        reference: "John 16:7–13",
        text: "Nevertheless I tell you the truth; It is expedient for you that I go away: for if I go not away, the Comforter will not come unto you... And when he is come, he will reprove the world of sin, and of righteousness, and of judgment... Howbeit when he, the Spirit of truth, is come, he will guide you into all truth...",
        commentary: "Describes the Spirit's vital work in convicting of sin, leading into all truth, and glorifying Christ."
      },
      {
        reference: "Acts 1:8",
        text: "But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.",
        commentary: "Promises divine power from the Holy Spirit to empower believers for global gospel witness."
      },
      {
        reference: "Acts 5:3",
        text: "But Peter said, Ananias, why hath Satan filled thine heart to lie to the Holy Ghost, and to keep back part of the price of the land?",
        commentary: "Affirms the deity and personality of the Holy Spirit (lying to the Holy Spirit is lying unto God)."
      },
      {
        reference: "Acts 10:38",
        text: "How God anointed Jesus of Nazareth with the Holy Ghost and with power: who went about doing good, and healing all that were oppressed of the devil; for God was with him.",
        commentary: "Highlights how Jesus ministered in the full power and anointing of the Holy Spirit."
      },
      {
        reference: "Romans 5:5",
        text: "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us.",
        commentary: "Reveals how the Holy Spirit fills believers' hearts with God's unconditional love and assurance."
      },
      {
        reference: "1 Corinthians 12:7–11",
        text: "But the manifestation of the Spirit is given to every man to profit withal. For to one is given by the Spirit the word of wisdom... But all these worketh that one and the selfsame Spirit, dividing to every man severally as he will.",
        commentary: "Explains how the Holy Spirit sovereignly bestows spiritual gifts upon every believer for the building up of the church."
      },
      {
        reference: "2 Corinthians 3:18",
        text: "But we all, with open face beholding as in a glass the glory of the Lord, are changed into the same image from glory to glory, even as by the Spirit of the Lord.",
        commentary: "Describes character transformation into Christ's image through the ongoing work of the Holy Spirit."
      },
      {
        reference: "2 Peter 1:21",
        text: "For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
        commentary: "Affirms divine inspiration of Scripture: 'Men moved by the Holy Spirit spoke from God.'"
      }
    ],
    outline: [
      {
        title: "THE HOLY SPIRIT AS PART OF THE TRINITY",
        summary: "The Holy Spirit is fully God, active in Creation, sent as Another Comforter, and continues Christ's ministry.",
        key_references: ["Matthew 28:19", "Genesis 1:1–2", "John 14:16–18"]
      },
      {
        title: "THE HOLY SPIRIT’S ROLE IN FORMING THE SCRIPTURES",
        summary: "All Scripture is inspired by God, written by men moved by the Holy Spirit, who guides interpretation into truth.",
        key_references: ["2 Peter 1:21", "2 Samuel 23:2"]
      },
      {
        title: "THE HOLY SPIRIT SUSTAINED JESUS IN HIS EARTHLY MINISTRY",
        summary: "Jesus ministered through the Spirit's power, anointed at baptism, and empowered for His mission.",
        key_references: ["Luke 4:18", "Acts 10:38"]
      },
      {
        title: "HOW THE HOLY SPIRIT WORKS WITH US",
        summary: "The Spirit convicts of sin, leads into truth, grants peace and assurance, and begins spiritual growth.",
        key_references: ["John 16:7–13", "Romans 5:5"]
      },
      {
        title: "THE SPIRIT INTERPRETS OUR PRAYERS",
        summary: "The Spirit intercedes when we don't know what to pray, aligning our prayers with God's will.",
        key_references: ["Romans 8:26"]
      },
      {
        title: "THE SPIRIT WRITES GOD’S LAW IN OUR HEARTS",
        summary: "The Spirit dwells within believers, writes God's law on the heart, and transforms character.",
        key_references: ["2 Corinthians 3:18", "Ezekiel 36:26–27"]
      },
      {
        title: "THE SPIRIT GIVES STRENGTH TO TESTIFY OF CHRIST",
        summary: "Strengthens the inner person and reveals Christ through Christlike living.",
        key_references: ["Acts 1:8", "Ephesians 3:16"]
      },
      {
        title: "THE BAPTISM OF THE HOLY SPIRIT",
        summary: "Gives power to witness, promised by Jesus, producing boldness, requiring daily surrender.",
        key_references: ["Acts 1:8", "Acts 2:1–4"]
      },
      {
        title: "RECEIVING THE HOLY SPIRIT",
        summary: "God eagerly gives the Spirit; obedience prepares the heart, bearing Christlike fruit, freedom, and hope.",
        key_references: ["Luke 11:13", "Galatians 5:22–23"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-5-1",
        prompt: "What does 2 Peter 1:21 state regarding how the Scriptures were given?",
        expected_answer: "Holy men of God spake as they were moved by the Holy Ghost.",
        reference: "2 Peter 1:21"
      }
    ]
  },
  {
    id: "fb-6",
    number: 6,
    title: "Creation",
    summary: "The literal six-day historic event of God bringing life and order to Earth, crowned by the Sabbath.",
    fullWording: "God is Creator of all things, and has revealed in Scripture the authentic and historical account of His creative activity. He created the universe, and in a recent six-day creation the Lord made 'the heaven and the earth, the sea, and all that in them is,' and rested on the seventh day.",
    keyReferences: [
      {
        reference: "Genesis 1:1-31",
        text: "In the beginning God created the heaven and the earth... And God saw every thing that he had made, and, behold, it was very good.",
        commentary: "The Genesis narrative records a literal six-day creation week of 24-hour days, establishing a historical framework of origins."
      }
    ],
    outline: [
      {
        title: "Literal Six-Day Creative Acts",
        summary: "Our Earth was brought from formless void to beautiful order through the spoken command of God over six literal days.",
        key_references: ["Exodus 20:11", "Psalm 33:6-9"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-6-1",
        prompt: "Summarize the significance of Exodus 20:11 in confirming the duration of Creation.",
        expected_answer: "For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day.",
        reference: "Exodus 20:11"
      }
    ]
  },
  {
    id: "fb-7",
    number: 7,
    title: "The Nature of Humanity",
    summary: "Human beings are an indivisible unity of body, mind, and spirit, made in the image of God.",
    fullWording: "Man and woman were made in the image of God with individuality, the power and freedom to think and to do. Though created free beings, each is an indivisible unity of body, mind, and spirit, dependent upon God for life and breath and all else.",
    keyReferences: [
      {
        reference: "Genesis 1:27",
        text: "So God created man in his own image, in the image of God created he him; male and female created he them.",
        commentary: "Our dignity is anchored in the Imago Dei, demonstrating perfect equality and direct creative design of both male and female."
      },
      {
        reference: "Genesis 2:7",
        text: "And the Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
        commentary: "A living soul is the combination of dust and breath. Humanity does not possess an independent immortal soul; the soul is the whole living person."
      }
    ],
    outline: [
      {
        title: "Imago Dei and Human Value",
        summary: "Every individual is a direct masterpiece of divine creation, possessing equal dignity and freedom of choice.",
        key_references: ["Genesis 1:26-27", "Acts 17:26"]
      },
      {
        title: "The Monistic Indivisible Unity",
        summary: "The body, mind, and spirit form one inseparable whole. There is no conscious existence independent of the physical body.",
        key_references: ["Genesis 2:7", "1 Thessalonians 5:23"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-7-1",
        prompt: "According to Genesis 2:7, how is a 'living soul' formed?",
        expected_answer: "Formed of the dust of the ground and the breath of life, making man a living soul (not giving him an independent soul).",
        reference: "Genesis 2:7"
      }
    ]
  },
  {
    id: "fb-8",
    number: 8,
    title: "The Great Controversy",
    summary: "The cosmic conflict between Christ and Satan regarding the character of God and His law.",
    fullWording: "All humanity is now involved in a great controversy between Christ and Satan regarding the character of God, His law, and His sovereignty over the universe. This conflict began in heaven when a created being, endowed with freedom of choice, in self-exaltation introduced sin into this world.",
    keyReferences: [
      {
        reference: "Revelation 12:4-9",
        text: "And there was war in heaven: Michael and his angels fought against the dragon... and the great dragon was cast out...",
        commentary: "The conflict originated in heaven when Lucifer rebelled against God's government, accusing Him of unfairness and self-exaltation."
      }
    ],
    outline: [
      {
        title: "The Rebellion in Heaven",
        summary: "Sin originated when Lucifer, the highest angel, desired divine equality and rebelled against God's law.",
        key_references: ["Isaiah 14:12-14", "Ezekiel 28:12-18"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-8-1",
        prompt: "Explain how Revelation 12:7-9 outlines the battlefield of the Great Controversy.",
        expected_answer: "It describes war in heaven where Michael and His angels fought the dragon and cast him out to the earth.",
        reference: "Revelation 12:7-9"
      }
    ]
  },
  {
    id: "fb-9",
    number: 9,
    title: "The Life, Death, and Resurrection of Christ",
    summary: "Christ's perfect obedience and ultimate sacrifice provide the sole atonement for human sin.",
    fullWording: "In Christ's life of perfect obedience to God's will, His suffering, death, and resurrection, God provided the only means of atonement for human sin, so that those who by faith accept this atonement may have eternal life.",
    keyReferences: [
      {
        reference: "Romans 5:8",
        text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
        commentary: "Calvary represents the ultimate demonstration of God's character, satisfying both infinite justice and perfect love."
      }
    ],
    outline: [
      {
        title: "The Substitutive Sacrifice of Calvary",
        summary: "Christ suffered the second death on our behalf, bearing our condemnation to offer us His perfect righteousness.",
        key_references: ["2 Corinthians 5:21", "1 Peter 2:24"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-9-1",
        prompt: "Recite Romans 5:8 and explain how Christ's death demonstrates the Father's love.",
        expected_answer: "While we were yet sinners, Christ died for us, demonstrating that God's love is proactive and self-sacrificing.",
        reference: "Romans 5:8"
      }
    ]
  },
  {
    id: "fb-10",
    number: 10,
    title: "The Experience of Salvation",
    summary: "Receiving Christ's justification and sanctification purely by grace through faith.",
    fullWording: "In infinite love and mercy God made Christ, who knew no sin, to be sin for us, so that in Him we might be made the righteousness of God. Led by the Holy Spirit we sense our need, acknowledge our sinfulness, repent of our transgressions, and exercise faith in Jesus.",
    keyReferences: [
      {
        reference: "Romans 1:16",
        text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
        commentary: "The gospel is God's dynamic, recreating power ('dunamis') that justifies us from guilt and sanctifies us from the power of sin."
      }
    ],
    outline: [
      {
        title: "Justification and Adoption",
        summary: "By faith, our guilt is canceled and we are declared righteous through Christ's merits, adopted as children of God.",
        key_references: ["Romans 3:24-26", "Galatians 4:4-7"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-10-1",
        prompt: "Summarize Romans 1:16 regarding the power and scope of the gospel.",
        expected_answer: "The gospel is the power of God unto salvation to everyone who believes, without distinction.",
        reference: "Romans 1:16"
      }
    ]
  },
  {
    id: "fb-11",
    number: 11,
    title: "Growing in Christ",
    summary: "Continual triumph over demonic forces as we walk in fellowship with Jesus daily.",
    fullWording: "By His death on the cross Jesus triumphed over the forces of evil. He who subjugated the demonic spirits during His earthly ministry has broken their power and makes certain our ultimate triumph. In Jesus' love we walk in the light, pray without ceasing, study His Word, and witness to His grace.",
    keyReferences: [
      {
        reference: "Colossians 2:15",
        text: "And having spoiled principalities and powers, he made a shew of them openly, triumphing over them in it.",
        commentary: "The cross disarmed satanic principalities, revealing their absolute defeat and securing spiritual authority for the believer."
      }
    ],
    outline: [
      {
        title: "Triumph Over Darkness",
        summary: "Walking with Jesus releases us from ancestral fear, superstition, and the oppressive power of the enemy.",
        key_references: ["Ephesians 6:10-18", "Colossians 1:13"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-11-1",
        prompt: "According to Colossians 2:15, what was accomplished regarding evil powers at the cross?",
        expected_answer: "He spoiled principalities and powers, making a show of them openly, triumphing over them.",
        reference: "Colossians 2:15"
      }
    ]
  },
  {
    id: "fb-12",
    number: 12,
    title: "The Church",
    summary: "The community of believers called out of the world to worship, grow, and serve.",
    fullWording: "The church is the community of believers who confess Jesus Christ as Lord and Savior. In continuity with the people of God in Old Testament times, we are called out from the world; and we join together for worship, for fellowship, for instruction in the Word, and for the service of humanity.",
    keyReferences: [
      {
        reference: "Ephesians 1:22-23",
        text: "And hath put all things under his feet, and gave him to be the head over all things to the church, Which is his body...",
        commentary: "Christ is the organic, supreme head of the church, which acts as His hands and feet to manifest His character on Earth."
      }
    ],
    outline: [
      {
        title: "The Ecclesia: Called Out",
        summary: "The church is not a physical building, but a dynamic gathering of believers unified by the headship of Christ.",
        key_references: ["Matthew 18:20", "1 Peter 2:9"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-12-1",
        prompt: "Describe the relationship between Christ and the church as shown in Ephesians 1:22-23.",
        expected_answer: "He is the head over all things to the church, which is described as His body, the fullness of Him.",
        reference: "Ephesians 1:22-23"
      }
    ]
  },
  {
    id: "fb-13",
    number: 13,
    title: "The Remnant and Its Mission",
    summary: "The end-time body called to keep the commandments of God and hold the testimony of Jesus.",
    fullWording: "The universal church is composed of all who truly believe in Christ, but in the last days, a time of widespread apostasy, a remnant has been called out to keep the commandments of God and the faith of Jesus. This remnant announces the arrival of the judgment hour, proclaims salvation through Christ, and heralds the approach of His second advent.",
    keyReferences: [
      {
        reference: "Revelation 12:17",
        text: "And the dragon was wroth with the woman, and went to make war with the remnant of her seed, which keep the commandments of God, and have the testimony of Jesus Christ.",
        commentary: "Satan directs his final rage against a specific group defined by two distinct markers: loyalty to God's commandments and holding the prophetic testimony of Jesus."
      }
    ],
    outline: [
      {
        title: "End-Time Remnant Identifiers",
        summary: "The final remnant is recognized by holding fast to God's law (including the Sabbath) and possessing the active gift of prophecy.",
        key_references: ["Revelation 14:12", "Revelation 19:10"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-13-1",
        prompt: "Recite Revelation 12:17 and identify the two specific characteristics of the remnant.",
        expected_answer: "They keep the commandments of God, and have the testimony of Jesus Christ.",
        reference: "Revelation 12:17"
      }
    ]
  },
  {
    id: "fb-14",
    number: 14,
    title: "Unity in the Body of Christ",
    summary: "Equal value and perfect harmony among all members, transcending racial, social, and gender divides.",
    fullWording: "The church is one body with many members, called from every nation, kindred, tongue, and people. In Christ we are a new creation; distinctions of race, culture, learning, and nationality, and differences between high and low, rich and poor, male and female, must not be divisive among us.",
    keyReferences: [
      {
        reference: "Galatians 3:28",
        text: "There is neither Jew nor Greek, there is neither bond nor free, there is there is neither male nor female: for ye are all one in Christ Jesus.",
        commentary: "All human hierarchical divisions are dissolved at the foot of the cross, establishing perfect spiritual equality and mutual honor."
      }
    ],
    outline: [
      {
        title: "Equality at the Cross",
        summary: "No race, social class, or gender is superior in God's eyes; we are one family bound together by His blood.",
        key_references: ["Ephesians 4:1-6", "Colossians 3:11"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-14-1",
        prompt: "Recite Galatians 3:28 and explain its theological impact on human status in the church.",
        expected_answer: "There is neither Jew nor Greek, bond nor free, male nor female: for all are one in Christ, asserting absolute spiritual equality.",
        reference: "Galatians 3:28"
      }
    ]
  },
  {
    id: "fb-15",
    number: 15,
    title: "Baptism",
    summary: "The sacred rite of public covenant confession, symbolizing death to sin and resurrection to life.",
    fullWording: "By baptism we confess our faith in the death and resurrection of Jesus Christ, and testify of our death to sin and of our purpose to walk in newness of life. Thus we acknowledge Christ as Lord and Savior, become His people, and are received as members by His church.",
    keyReferences: [
      {
        reference: "Romans 6:3-4",
        text: "Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism...",
        commentary: "Immersion symbolizes burial with Christ and rising as a brand-new creation, cleansed of old guilt."
      }
    ],
    outline: [
      {
        title: "The Symbolism of Immersion",
        summary: "Scriptural baptism requires complete immersion, representing a burial of the old self and rising to walk in newness of life.",
        key_references: ["Matthew 28:19", "Acts 2:38"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-15-1",
        prompt: "How does Romans 6:4 explain the symbolic action of baptism?",
        expected_answer: "We are buried with Him by baptism into death, that like as Christ was raised from the dead, we should walk in newness of life.",
        reference: "Romans 6:3-4"
      }
    ]
  },
  {
    id: "fb-16",
    number: 16,
    title: "The Lord's Supper",
    summary: "Participation in the emblems of Christ's body and blood, preceded by the ordinance of foot washing.",
    fullWording: "The Lord's Supper is a participation in the emblems of the body and blood of Jesus as an expression of faith in Him, our Lord and Redeemer. In this experience of communion Christ is present to meet and strengthen His people. The service of communion is open to all Christian believers.",
    keyReferences: [
      {
        reference: "1 Corinthians 11:23-26",
        text: "For as often as ye eat this bread, and drink this cup, ye do shew the Lord's death till he come.",
        commentary: "The emblems point backward to the broken body and spilled blood of the cross, and forward to the Second Advent."
      }
    ],
    outline: [
      {
        title: "The Ordinance of Humility",
        summary: "Following Christ's example in John 13, foot washing precedes communion to foster servant-hearted love and reconciliation.",
        key_references: ["John 13:1-17"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-16-1",
        prompt: "What is the dual focus of Communion according to 1 Corinthians 11:26?",
        expected_answer: "To show (proclaim) the Lord's death (past focus) until He comes (future focus).",
        reference: "1 Corinthians 11:23-26"
      }
    ]
  },
  {
    id: "fb-17",
    number: 17,
    title: "Spiritual Gifts and Ministries",
    summary: "Divinely appointed talents bestowed on every member to build up the church body.",
    fullWording: "God bestows upon all members of His church in every age spiritual gifts which each member is to employ in loving ministry for the common good of the church and of humanity. Given by the agency of the Holy Spirit, who apportions to each member as He wills.",
    keyReferences: [
      {
        reference: "Ephesians 4:11-12",
        text: "And he gave some, apostles; and some, prophets... For the perfecting of the saints, for the work of the ministry, for the edifying of the body...",
        commentary: "Gifts are designed for equipping saints for ministry and fostering theological maturity and unity."
      }
    ],
    outline: [
      {
        title: "Priesthood of All Believers",
        summary: "Every member receives unique spiritual abilities from the Spirit to build up the corporate body of Christ.",
        key_references: ["1 Corinthians 12:4-11", "Romans 12:4-8"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-17-1",
        prompt: "What is the ultimate purpose of spiritual gifts as stated in Ephesians 4:12?",
        expected_answer: "For the perfecting of the saints, for the work of the ministry, and for the edifying of the body of Christ.",
        reference: "Ephesians 4:11-12"
      }
    ]
  },
  {
    id: "fb-18",
    number: 18,
    title: "The Gift of Prophecy",
    summary: "The prophetic voice identifying the remnant, manifested pre-eminently in the ministry of Ellen White.",
    fullWording: "The Scriptures testify that one of the gifts of the Holy Spirit is prophecy. This gift is an identifying mark of the remnant church and we believe it was manifested in the ministry of Ellen White. Her writings speak with prophetic authority and provide comfort, guidance, instruction, and correction to the church.",
    keyReferences: [
      {
        reference: "Revelation 19:10",
        text: "...worship God: for the testimony of Jesus is the spirit of prophecy.",
        commentary: "The testimony of Jesus is defined as the prophetic voice of the Spirit, guiding His people through specialized messages in history."
      }
    ],
    outline: [
      {
        title: "A Guideline for the Last Days",
        summary: "The prophetic gift does not replace Scripture; it acts as a lesser light directing minds to the supreme standard of the Bible.",
        key_references: ["Joel 2:28-29", "2 Chronicles 20:20"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-18-1",
        prompt: "How does Revelation 19:10 define the 'testimony of Jesus'?",
        expected_answer: "The testimony of Jesus is defined as the spirit of prophecy, pointing to the ongoing prophetic gift.",
        reference: "Revelation 19:10"
      }
    ]
  },
  {
    id: "fb-19",
    number: 19,
    title: "The Law of God",
    summary: "The Ten Commandments as a transcript of God's character and the unchangeable standard of His judgment.",
    fullWording: "The great principles of God's law are embodied in the Ten Commandments and exemplified in the life of Christ. They express God's love, will, and purposes concerning human conduct and relationships and are binding upon all people in every age. These precepts are the basis of God's covenant with His people and the standard in God's judgment.",
    keyReferences: [
      {
        reference: "Exodus 20:1-17",
        text: "And God spake all these words, saying... [The Ten Commandments]",
        commentary: "The Ten Commandments represent a verbal transcript of God's eternal character of love, outlining our duties to God and our fellow human beings."
      },
      {
        reference: "James 2:10-12",
        text: "For whosoever shall keep the whole law, and yet offend in one point, he is guilty of all... So speak ye, and so do, as they that shall be judged by the law of liberty.",
        commentary: "James affirms that the moral law remains fully binding as an indivisible unit and acts as the unchangeable standard of divine judgment."
      }
    ],
    outline: [
      {
        title: "The Perpetuity of God's Moral Law",
        summary: "The law of God was not nailed to the cross; only the ceremonial shadow laws pointing to Christ ended. The Ten Commandments remain fully binding.",
        key_references: ["Matthew 5:17-19", "Romans 7:12"]
      },
      {
        title: "The Standard of the Final Judgment",
        summary: "God's law acts as a mirror of liberty, examining the secret thoughts and lifestyle choices of every human soul.",
        key_references: ["Ecclesiastes 12:13-14", "James 2:10-12"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-19-1",
        prompt: "Recite or summarize Solomon's conclusion in Ecclesiastes 12:13 regarding human duty.",
        expected_answer: "Fear God, and keep His commandments: for this is the whole duty of man.",
        reference: "Ecclesiastes 12:13"
      }
    ]
  },
  {
    id: "fb-20",
    number: 20,
    title: "The Sabbath",
    summary: "The seventh-day (Saturday) Sabbath, instituted at Creation as a perpetual memorial of rest and worship.",
    fullWording: "The gracious Creator, after the six days of Creation, rested on the seventh day and instituted the Sabbath for all people as a memorial of Creation. The fourth commandment of God's unchangeable law requires the observance of this seventh-day Sabbath as the day of rest, worship, and ministry in harmony with the teaching and practice of Jesus, the Lord of the Sabbath.",
    keyReferences: [
      {
        reference: "Genesis 2:1-3",
        text: "And on the seventh day God ended his work... And God blessed the seventh day, and sanctified it...",
        commentary: "God established the Sabbath before sin entered, making it an unchangeable sanctuary in time for all human beings."
      },
      {
        reference: "Exodus 20:8-11",
        text: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the Lord thy God...",
        commentary: "The fourth commandment anchors the Sabbath directly in God's literal six-day creative acts, commanding us to cease our labor."
      }
    ],
    outline: [
      {
        title: "The Edenic Origin of Time Sanctuary",
        summary: "The Sabbath was blessed, set apart, and sanctified at Creation as a perpetual memorial of our origins.",
        key_references: ["Genesis 2:1-3", "Mark 2:27"]
      },
      {
        title: "The Commandment of Loyalty",
        summary: "The Sabbath is a crucial sign of allegiance between God and His people, demonstrating that He is our sanctifier.",
        key_references: ["Exodus 31:13", "Ezekiel 20:12"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-20-1",
        prompt: "Recite Exodus 20:8-11 and outline the creative reason given for Sabbath rest.",
        expected_answer: "Remember the Sabbath day... For in six days the Lord made heaven and earth... and rested the seventh day; wherefore the Lord blessed the Sabbath day, and hallowed it.",
        reference: "Exodus 20:8-11"
      }
    ]
  },
  {
    id: "fb-21",
    number: 21,
    title: "Stewardship",
    summary: "Grateful management of all resources, time, and possessions, including the return of a faithful tithe.",
    fullWording: "We are God's stewards, entrusted by Him with time and opportunities, abilities and possessions, and the blessings of the earth and its resources. We are responsible to Him for their proper use. We acknowledge God's ownership by faithful service to Him and our fellow human beings, and by returning tithe and giving offerings.",
    keyReferences: [
      {
        reference: "Malachi 3:10",
        text: "Bring ye all the tithes into the storehouse... and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven...",
        commentary: "Returning a tenth of our increase acknowledges God's absolute ownership of everything, cultivating trust and disarming greed."
      }
    ],
    outline: [
      {
        title: "Systematic Benevolence",
        summary: "Stewardship encompasses returning a faithful 10% tithe alongside freewill offerings to fund the proclamation of truth.",
        key_references: ["Leviticus 27:30", "1 Corinthians 9:9-14"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-21-1",
        prompt: "Recite or explain Malachi 3:10 and describe the promise linked to tithes.",
        expected_answer: "Bring all tithes into the storehouse, and God will open the windows of heaven and pour out an abundant blessing.",
        reference: "Malachi 3:10"
      }
    ]
  },
  {
    id: "fb-22",
    number: 22,
    title: "Christian Behavior",
    summary: "Reflecting Christ's lifestyle in modesty, clean language, and simple, healthful habits.",
    fullWording: "We are called to be a godly people who think, feel, and behave in harmony with biblical principles in all aspects of personal and social life. For the Spirit to recreate in us the character of our Lord we involve ourselves only in those things that will produce Christlike purity, health, and joy in our lives.",
    keyReferences: [
      {
        reference: "1 Corinthians 10:31",
        text: "Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God.",
        commentary: "Every mundane daily habit, including our physical diet, is to be actively aligned to glorify God."
      }
    ],
    outline: [
      {
        title: "The Body Temple Principles",
        summary: "Our physical health is intimately linked to spiritual receptivity. We abstain from unclean foods, alcohol, and harmful habits.",
        key_references: ["1 Corinthians 6:19-20", "Romans 12:1"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-22-1",
        prompt: "Explain how 1 Corinthians 10:31 serves as a guide for lifestyle and diet choices.",
        expected_answer: "Whether you eat, drink, or whatever you do, do all to the glory of God, making His honor the standard for all behavior.",
        reference: "1 Corinthians 10:31"
      }
    ]
  },
  {
    id: "fb-23",
    number: 23,
    title: "Marriage and the Family",
    summary: "The lifelong loving union of one man and one woman, reflecting Christ's covenant love.",
    fullWording: "Marriage was divinely established in Eden and affirmed by Jesus to be a lifelong union between a man and a woman in loving companionship. For the Christian a marriage commitment is to God as well as to the spouse, and should be entered into only between a man and a woman who share a common faith.",
    keyReferences: [
      {
        reference: "Genesis 2:24",
        text: "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh.",
        commentary: "Edenic marriage establishes the pattern of complete commitment, forming a safe, loving unit to raise children."
      }
    ],
    outline: [
      {
        title: "The Sacred Covenant",
        summary: "Marriage is a lifelong, sacred covenant designed to mirror the unbroken, faithful love between Christ and His church.",
        key_references: ["Matthew 19:4-6", "Ephesians 5:21-33"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-23-1",
        prompt: "According to Genesis 2:24, what are the three basic steps of marriage?",
        expected_answer: "Leaving father and mother, cleaving to the spouse, and becoming one flesh in a lifelong union.",
        reference: "Genesis 2:24"
      }
    ]
  },
  {
    id: "fb-24",
    number: 24,
    title: "Christ's Ministry in the Heavenly Sanctuary",
    summary: "Christ's dual-phase high-priestly intercession, culminating in the pre-advent judgment since 1844.",
    fullWording: "There is a sanctuary in heaven, the true tabernacle which the Lord pitched and not man. In it Christ ministers on our behalf, making available to believers the benefits of His atoning sacrifice offered once for all on the cross. He was inaugurated as our great High Priest and began His intercessory ministry at His ascension. In 1844, at the end of the prophetic period of 2300 days, He entered the second and last phase of His atoning ministry, which is a work of investigative judgment.",
    keyReferences: [
      {
        reference: "Daniel 8:14",
        text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        commentary: "This massive prophecy ends in 1844 AD, marking the transition of Christ's high-priestly ministry into the Most Holy Place to cleanse the sanctuary."
      },
      {
        reference: "Hebrews 8:1-2",
        text: "We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
        commentary: "Our primary focus of worship is redirected to the real, active heavenly temple where Jesus acts as our supreme High Priest and Mediator."
      }
    ],
    outline: [
      {
        title: "The Cleansing of the Sanctuary",
        summary: "The pre-advent judgment investigates the records of all who have professed faith, demonstrating God's justice before the universe.",
        key_references: ["Daniel 7:9-10", "Leviticus 16:16"]
      },
      {
        title: "The 2300-Day Prophetic Chain",
        summary: "Applying the day-year principle, this prophecy starting in 457 BC represents the exact timeline of salvation history.",
        key_references: ["Numbers 14:34", "Ezekiel 4:6", "Daniel 9:24-27"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-24-1",
        prompt: "Recite Daniel 8:14 and state the prophetic milestone year it identifies.",
        expected_answer: "Unto two thousand and three hundred days; then shall the sanctuary be cleansed. It points to the year 1844 AD.",
        reference: "Daniel 8:14"
      },
      {
        id: "fb-prompt-24-2",
        prompt: "Where is Jesus ministering according to Hebrews 8:2, and who constructed this temple?",
        expected_answer: "He ministers in the sanctuary of the true tabernacle, which the Lord pitched, and not man.",
        reference: "Hebrews 8:1-2"
      }
    ]
  },
  {
    id: "fb-25",
    number: 25,
    title: "The Second Coming of Christ",
    summary: "The literal, visible, audible, and glorious return of Jesus to rescue His saints.",
    fullWording: "The second coming of Christ is the blessed hope of the church, the grand climax of the gospel. The Savior's coming will be literal, personal, visible, and worldwide. When He returns, the righteous dead will be resurrected, and together with the righteous living will be glorified and caught up to heaven, but the unrighteous will die.",
    keyReferences: [
      {
        reference: "Titus 2:13",
        text: "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
        commentary: "The Second Advent is not a secret rapture; it is the physical, glorious climax of Christian faith."
      },
      {
        reference: "1 Thessalonians 4:16",
        text: "For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first.",
        commentary: "The return is highly audible and visible, shaking the heavens as the trumpet summons the sleeping saints."
      }
    ],
    outline: [
      {
        title: "The Literal, Audible Return",
        summary: "Every eye shall see Him; His coming will be a massive, cataclysmic physical event accompanied by the trump of God.",
        key_references: ["Matthew 24:27-30", "Revelation 1:7"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-25-1",
        prompt: "How does 1 Thessalonians 4:16 describe the sounds and actions of the Second Coming?",
        expected_answer: "The Lord will descend with a shout, the voice of the archangel, and the trump of God, and the dead in Christ shall rise first.",
        reference: "1 Thessalonians 4:16"
      }
    ]
  },
  {
    id: "fb-26",
    number: 26,
    title: "Death and Resurrection",
    summary: "The unconscious state of sleep in death, awaiting the call of the lifegiver.",
    fullWording: "The wages of sin is death. But God, who alone is immortal, will grant eternal life to His redeemed. Until that day death is an unconscious state for all people. When Christ, who is our life, appears, the resurrected righteous and the living righteous will be glorified and caught up to meet their Lord.",
    keyReferences: [
      {
        reference: "Ecclesiastes 9:5",
        text: "For the living know that they shall die: but the dead know not any thing, neither have they any more a reward...",
        commentary: "Solomon affirms that death is an absolute sleep of unconsciousness. There is no torment in hell or bliss in heaven immediately at death."
      }
    ],
    outline: [
      {
        title: "The State of the Dead as Sleep",
        summary: "The Bible consistently compares death to a quiet, dreamless sleep, protecting believers from spiritism deceptions.",
        key_references: ["John 11:11-14", "Psalm 146:4"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-26-1",
        prompt: "Recite or explain Ecclesiastes 9:5 regarding the consciousness of the dead.",
        expected_answer: "The living know that they shall die, but the dead know not anything, having no ongoing consciousness.",
        reference: "Ecclesiastes 9:5"
      }
    ]
  },
  {
    id: "fb-27",
    number: 27,
    title: "The Millennium and the End of Sin",
    summary: "The 1000-year reign of saints in heaven, culminating in the absolute destruction of evil.",
    fullWording: "The millennium is the thousand-year reign of Christ with His saints in heaven between the first and second resurrections. During this time the wicked dead will be judged; the earth will be utterly desolate, without living human inhabitants, but occupied by Satan and his angels. At its close Christ with His saints and the Holy City will descend from heaven to earth. The unrighteous dead will then be resurrected, and with Satan and his angels will encircle the city; but fire from God will consume them and cleanse the earth. The universe will thus be freed from sin and sinners forever.",
    keyReferences: [
      {
        reference: "Revelation 20:1-15",
        text: "And I saw thrones, and they sat upon them, and judgment was given unto them... and they lived and reigned with Christ a thousand years.",
        commentary: "The millennium provides an open-book review for the saints, answering every question regarding God's fairness before sin is forever destroyed."
      }
    ],
    outline: [
      {
        title: "The Three Phases of Millennium",
        summary: "The millennium involves the binding of Satan on a desolate Earth, the examination of books in heaven, and the final destruction of sin.",
        key_references: ["Revelation 20:4-6", "Jeremiah 4:23-26"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-27-1",
        prompt: "Where do the saints spend the 1000 years, and what work do they perform according to Revelation 20:4?",
        expected_answer: "They sit on thrones in heaven, and judgment is given unto them as they reign with Christ.",
        reference: "Revelation 20:4"
      }
    ]
  },
  {
    id: "fb-28",
    number: 28,
    title: "The New Earth",
    summary: "The eternal, glorious home of the redeemed in the physical presence of God.",
    fullWording: "On the new earth, in which righteousness dwells, God will provide an eternal home for the redeemed and a perfect environment for everlasting life, love, joy, and learning in His presence. For here God Himself will dwell with His people, and suffering and death will have passed away. The great controversy is ended, and sin is no more. All things, animate and inanimate, declare that God is love; and He shall reign forever. Amen.",
    keyReferences: [
      {
        reference: "Revelation 21:1-4",
        text: "And I saw a new heaven and a new earth... And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow...",
        commentary: "Paradise restored represents the complete vindication of God's character, where the redeemed live in perfect love forever."
      }
    ],
    outline: [
      {
        title: "Paradise Restored",
        summary: "The physical Earth is purified and recreated, serving as the physical, eternal headquarters of God's kingdom.",
        key_references: ["Isaiah 65:17-25", "2 Peter 3:13"]
      }
    ],
    active_recall_prompts: [
      {
        id: "fb-prompt-28-1",
        prompt: "Recite or explain the promise of Revelation 21:4 regarding the removal of suffering.",
        expected_answer: "God shall wipe away all tears; and there shall be no more death, neither sorrow, nor crying, nor any more pain.",
        reference: "Revelation 21:1-4"
      }
    ]
  }
];

// Fallback metadata for tracks that aren't fundamental-beliefs
const TRACK_PREVIEW_DOCS_LOCAL: Record<string, {
  whyThisExists: string;
  learnBullets: string[];
}> = {
  "three-angels": {
    whyThisExists: "As the absolute climax of biblical warnings, the Three Angels' Messages unveil the ultimate issues of the Great Controversy: worship, creative design, and restorative justice.",
    learnBullets: [
      "Unravel the profound symbols of Revelation 14's cosmic warning and its sanctuary origins.",
      "Understand the deceptive mark of the beast and the divine seal that provides safe refuge in Christ.",
      "Discover how the everlasting gospel serves as the foundational key to unlocking all end-time prophecies."
    ]
  },
  "sanctuary-doctrine": {
    whyThisExists: "The sanctuary is the interpretive key of Seventh-day Adventist theology, outlining God's step-by-step layout of reconciliation.",
    learnBullets: [
      "Journey from the dusty outer court of justification to the glorious light of the Most Holy Place.",
      "Decipher the majestic types of Levitical rituals and their dynamic physical fulfillment in the heavens.",
      "Study the pre-advent cleansing of the sanctuary as a revelation of restorative justice."
    ]
  },
  "sabbath-school": {
    whyThisExists: "To renew your spirit through systematic weekly review corresponding to the current adult SDA study materials.",
    learnBullets: [
      "Cultivate deep daily devotion matched with structured adult Sabbath School prompts.",
      "Connect peer discussions with rigorous active recall of crucial weekly memory texts."
    ]
  },
  "book-by-book": {
    whyThisExists: "Master the foundational epistles of Hebrews, Ephesians, and Romans phrase by phrase with persistent intervals.",
    learnBullets: [
      "Recall structured scriptures sequentially for ultimate intellectual defense.",
      "Track complex context shifts and author intents throughout the epistles."
    ]
  },
  "priority-doctrines": {
    whyThisExists: "An interactive scripture chain covering the law, investigative judgment, and second advent promises.",
    learnBullets: [
      "Establish deep foundational safety regarding God's unchangeable law.",
      "Master the quick references needed to defend core truths of the faith."
    ]
  },
  "zoom-studies": {
    whyThisExists: "Follow the complete archive of interactive Zoom Bible studies with structured lesson flow.",
    learnBullets: [
      "Access interactive Zoom Bible study sessions and historical lesson records.",
      "Strengthen doctrinal retention through structured participatory Scripture review."
    ]
  }
};

// ========================================================
// SECTION 1 — TRACK SELECTOR (FIRST PAGE)
// ========================================================
export const TracksPageRedesigned: React.FC = () => {
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { setSelectedTrackId, showConfetti } = useApp();

  // Local storage track progress mapping
  const [trackProgress, setTrackProgress] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("stba_tracks_progress");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      "fundamental-beliefs": 4,
      "three-angels": 1,
      "sanctuary-doctrine": 0,
      "sabbath-school": 2,
      "book-by-book": 0,
      "priority-doctrines": 0,
      "zoom-studies": 0
    };
  });

  const TRACKS_LIST = [
    {
      id: "fundamental-beliefs",
      title: "28 Fundamental Beliefs",
      emoji: "📖",
      desc: "An intensive active recall track pacing through foundational tenets of the Seventh-day Adventist faith, supported by system-mapped biblical proofs.",
      count: 28,
      category: "Core Theology"
    },
    {
      id: "three-angels",
      title: "Three Angels’ Messages",
      emoji: "🔥",
      desc: "Revelation 14 focused active semantic tracking. Explore the sanctuary restoration, the everlasting gospel, cosmic investigative judgment, and Sabbath covenant.",
      count: 3,
      category: "Prophecy"
    },
    {
      id: "sanctuary-doctrine",
      title: "Sanctuary Doctrine",
      emoji: "✨",
      desc: "From earthly tabernacle pattern to heaven's heavenly sanctuary realities. Master the exact theological shadows, high priestly ministry, and Yom Kippur types.",
      count: 3,
      category: "Sanctuary"
    },
    {
      id: "book-by-book",
      title: "Prophecy Foundations",
      emoji: "🛡️",
      desc: "Master the foundational epistles and covenant prophecies of Hebrews, Ephesians, and Romans phrase by phrase with persistent intervals.",
      count: 1,
      category: "Prophecy Foundations"
    },
    {
      id: "priority-doctrines",
      title: "Christian Living Essentials",
      emoji: "🌅",
      desc: "An interactive scripture chain covering the law of God, Christian behavior, stewardship, and second advent glorious promises.",
      count: 1,
      category: "Essentials"
    },
    {
      id: "zoom-studies",
      title: "Zoom Bible Studies",
      emoji: "📹",
      desc: "Follow the complete archive of interactive Zoom Bible studies with structured lesson flow.",
      count: 60,
      category: "Live Studies"
    }
  ];

  const handleCardClick = (trackId: string) => {
    setSelectedTrackId(trackId);
    navigate(`/tracks/${trackId}/intro`);
  };

  return (
    <div className="w-full text-left" id="redesigned-tracks-viewport">
      {/* HEADER SECTION */}
      <div className="mb-8" id="tracks-hero-header">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#DFC57B] font-extrabold block mb-1">
          CURRICULAR SELECTION
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#DFC57B] font-black tracking-tight drop-shadow-xs" id="tracks-page-title">
          Theological Study Tracks
        </h1>
        <p className="text-[#FFFFFF] font-sans text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
          Systematically explore the organic unity of Scripture. Engage in structured, active cognitive recall to master core doctrines, prophecies, and Christian living.
        </p>
      </div>

      {/* TRACKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="tracks-layout-grid">
        {TRACKS_LIST.map((track) => {
          const completed = trackProgress[track.id] || 0;
          const percent = Math.round((completed / track.count) * 100);

          return (
            <div
              key={track.id}
              onClick={() => handleCardClick(track.id)}
              className="bg-white border border-[#E8DDC6]/80 hover:border-[#C9973A] rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[280px] shadow-3xs cursor-pointer group relative overflow-hidden"
              id={`track-card-${track.id}`}
            >
              {/* Highlight ribbon */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1C2333]/10 group-hover:bg-[#C9973A] transition-colors" />

              <div className="space-y-4">
                {/* Category & Icon row */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl p-2 bg-[#FDFAF5] rounded-xl border border-[#E8DDC6]/60 group-hover:scale-105 transition-transform">
                    {track.emoji}
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wide px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/50">
                    {track.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-lg text-[#1C2333] group-hover:text-[#C9973A] transition-colors leading-tight line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed line-clamp-3">
                    {track.desc}
                  </p>
                </div>
              </div>

              {/* Progress HUD */}
              <div className="w-full pt-4 border-t border-[#E8E4DA]/60">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#6B6B6B] mb-1.5">
                  <span className="font-bold">
                    {completed} of {track.count} Lessons Completed
                  </span>
                  <span className="font-black text-[#C9973A]">{percent}%</span>
                </div>
                <div className="w-full bg-[#FAF7F0] h-1.5 rounded-full overflow-hidden border border-[#E8E4DA]/30">
                  <div
                    className="h-full bg-[#C9973A] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================================
// SECTION 2 — TRACK INTRO PAGE
// ========================================================
export const TrackIntroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setSelectedTrackId } = useApp();

  // Find track definition
  const dbTrack = DEFAULT_DOCTRINE_TRACKS[id || ""] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];
  const localDocs = TRACK_PREVIEW_DOCS_LOCAL[id || ""] || TRACK_PREVIEW_DOCS_LOCAL["fundamental-beliefs"];

  const trackTitle = getTrackTitle(id || "");
  const description = dbTrack.description || "Systematic curriculum built for complete cognitive scriptural retention.";
  const whyThisExists = localDocs?.whyThisExists || "This track is designed to outline, expand, and trace the direct biblical chains upholding this sanctuary and prophecy framework.";
  const objectives = localDocs?.learnBullets || [
    "Identify explicit biblical proofs and scripture chains to defend raw bible truth.",
    "Discover the deep internal cohesion and organic unity of these core doctrines.",
    "Engage in structured active recall prompts to ensure lifelong intellectual ownership."
  ];

  useEffect(() => {
    if (id) setSelectedTrackId(id);
  }, [id, setSelectedTrackId]);

  return (
    <div className="w-full text-left space-y-6 animate-fade-in" id="track-intro-container">
      {/* Breadcrumb Back Navigation */}
      <button
        onClick={() => navigate("/tracks")}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C9973A] hover:text-[#1C2333] transition-colors cursor-pointer group"
        id="intro-back-to-library-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-all" />
        <span>Back to Curricula</span>
      </button>

      {/* Track Title banner */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9973A] font-bold">
          STUDY TRACK PREPARATION
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#D4AF37] font-black tracking-tight" id="intro-track-title">
          {trackTitle}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Main Info Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* TRACK INTRODUCTION CARD */}
          <div className="bg-[#FDFAF5] border border-[#E8DDC6] p-6 md:p-8 rounded-2xl space-y-4 shadow-3xs" id="intro-card">
            <h2 className="font-serif text-lg font-bold text-[#1C2333] flex items-center gap-2 border-b border-[#E8DDC6]/50 pb-2.5">
              <Compass className="w-5 h-5 text-[#C9973A]" />
              <span>Track Orientation</span>
            </h2>
            <div className="space-y-4 text-stone-600 font-sans text-sm md:text-base leading-relaxed">
              <p className="font-semibold text-[#1C2333]">
                {description}
              </p>
              <p>
                {whyThisExists}
              </p>
              <p>
                As a serious Berean student, this path will challenge you to go beyond surface-level readings. You will explore historical backgrounds, dissect complex prophetic links, and build direct scripture chains using active recall techniques.
              </p>
            </div>
          </div>

          {/* LEARNING OBJECTIVES SECTION */}
          <div className="bg-white border border-stone-200 p-6 md:p-8 rounded-2xl space-y-4 shadow-3xs" id="intro-objectives">
            <h3 className="font-serif text-md font-extrabold text-[#1C2333] tracking-tight uppercase text-xs font-mono text-[#C9973A]">
              Learning Objectives
            </h3>
            <p className="text-xs text-stone-500 font-sans leading-normal">
              By successfully completing this track, you will accomplish and demonstrate masteries over:
            </p>
            <ul className="space-y-3" id="intro-learning-bullets">
              {objectives.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-stone-600 font-sans">
                  <div className="p-1 bg-[#1C2333]/5 text-[#C9973A] rounded-md shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action column on right */}
        <div className="space-y-4">
          <div className="bg-[#1C2333] border border-[#C9973A]/20 p-6 rounded-2xl text-white space-y-4 shadow-sm relative overflow-hidden" id="intro-start-hud">
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C9973A]/10 rounded-full filter blur-xl pointer-events-none" />
            
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] font-bold block">
              Curriculum Controller
            </span>
            <h4 className="font-serif font-bold text-md text-white">
              Ready to Begin?
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Enter the systematic lesson index and explore each doctrinal chapter in deep detail.
            </p>

            <button
              onClick={() => navigate(`/tracks/${id}/lessons`)}
              className="w-full py-3 px-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-2"
              id="begin-lessons-btn"
            >
              <span>Begin Lesson 1</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// SECTION 3 — LESSON SELECTOR PAGE
// ========================================================
export const LessonSelectorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isFB = id === "fundamental-beliefs";
  const dbTrack = DEFAULT_DOCTRINE_TRACKS[id || ""] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];

  // Generate Lesson List dynamically
  const getLessons = () => {
    if (isFB) {
      return FB_LESSONS.map((fb) => ({
        id: fb.id,
        number: fb.number,
        title: fb.title,
        summary: fb.summary
      }));
    } else {
      // Map outline sections for non-FB tracks
      return (dbTrack.outline?.sections || []).map((sec, idx) => ({
        id: `lesson-${idx + 1}`,
        number: idx + 1,
        title: sec.title,
        summary: sec.summary
      }));
    }
  };

  const lessons = getLessons();
  const trackTitle = getTrackTitle(id || "");

  return (
    <div className="w-full text-left space-y-6 animate-fade-in" id="lesson-selector-container">
      {/* Back button */}
      <button
        onClick={() => navigate(`/tracks/${id}/intro`)}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C9973A] hover:text-[#1C2333] transition-colors cursor-pointer group"
        id="selector-back-to-intro-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-all" />
        <span>Back to Track Intro</span>
      </button>

      {/* Header title */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9973A] font-bold">
          CURRICULAR SYLLABUS
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-[#D4AF37] font-black tracking-tight" id="selector-title">
          {trackTitle} — Lessons
        </h1>
        <p className="text-stone-500 font-sans text-xs md:text-sm">
          Select a doctrinal lesson to study supporting scripture chains and complete your active pre-test recall.
        </p>
      </div>

      {/* LESSONS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2" id="lessons-selector-grid">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => navigate(`/tracks/${id}/lessons/${lesson.number}`)}
            className="p-5 bg-white border border-[#E8DDC6]/80 hover:border-[#C9973A] rounded-xl hover:shadow-2xs transition-all duration-200 cursor-pointer flex gap-4 items-start group text-left"
            id={`lesson-selector-item-${lesson.number}`}
          >
            {/* Belief / Lesson Number indicator */}
            <div className={`w-10 h-10 rounded-lg bg-[#FDFAF5] border border-[#E8DDC6] flex items-center justify-center font-serif font-black ${lesson.number > 9 ? 'text-base tracking-tight' : 'text-lg'} text-[#1C2333] shrink-0 group-hover:bg-[#1C2333] group-hover:text-[#C9973A] group-hover:border-[#1C2333] transition-colors leading-none text-center select-none`}>
              #{lesson.number}
            </div>

            {/* Title and summary details */}
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="font-serif font-black text-sm md:text-base text-[#1C2333] group-hover:text-[#C9973A] transition-colors leading-snug truncate">
                {lesson.title}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 font-sans">
                {lesson.summary}
              </p>
            </div>

            {/* Chevron indicators */}
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#C9973A] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================================
// SECTION 4 — LESSON DETAIL PAGE
// ========================================================

// Master dictionary of common Bible verses used across tracks and lessons to guarantee full scripture text coverage
const getVerseText = (reference: string): string => {
  const fallbackVerses: Record<string, string> = {
    "2 Timothy 3:16": "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
    "2 Peter 1:21": "For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
    "Deuteronomy 6:4": "Hear, O Israel: The Lord our God is one Lord.",
    "Matthew 28:19": "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.",
    "John 3:16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    "Hebrews 1:1-3": "God, who at sundry times and in divers manners spake in time past unto the fathers by the prophets, Hath in these last days spoken unto us by his Son, whom he hath appointed heir of all things, by whom also he made the worlds; Who being the brightness of his glory, and the express image of his person, and upholding all things by the word of his power, when he had by himself purged our sins, sat down on the right hand of the Majesty on high.",
    "John 16:7-13": "Nevertheless I tell you the truth; It is expedient for you that I go away: for if I go not away, the Comforter will not come unto you; but if I depart, I will send him unto you... Howbeit when he, the Spirit of truth, is come, he will guide you into all truth.",
    "John 16:13": "Howbeit when he, the Spirit of truth, is come, he will guide you into all truth: for he shall not speak of himself; but whatsoever he shall hear, that shall he speak: and he will shew you things to come.",
    "Genesis 1:1-31": "In the beginning God created the heaven and the earth... And God saw every thing that he had made, and, behold, it was very good.",
    "Exodus 20:11": "For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.",
    "Genesis 1:27": "So God created man in his own image, in the image of God created he him; male and female created he them.",
    "Genesis 2:7": "And the Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
    "Revelation 12:4-9": "And his tail drew the third part of the stars of heaven, and did cast them to the earth... And there was war in heaven: Michael and his angels fought against the dragon; and the dragon fought and his angels, And prevailed not; neither was their place found any more in heaven...",
    "Revelation 12:7-9": "And there was war in heaven: Michael and his angels fought against the dragon... and the great dragon was cast out, that old serpent, called the Devil, and Satan, which deceiveth the whole world.",
    "Romans 5:8": "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    "Romans 1:16": "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek.",
    "Colossians 2:15": "And having spoiled principalities and powers, he made a shew of them openly, triumphing over them in it.",
    "Ephesians 1:22-23": "And hath put all things under his feet, and gave him to be the head over all things to the church, Which is his body, the fullness of him that filleth all in all.",
    "Revelation 12:17": "And the dragon was wroth with the woman, and went to make war with the remnant of her seed, which keep the commandments of God, and have the testimony of Jesus Christ.",
    "Galatians 3:28": "There is neither Jew nor Greek, there is neither bond nor free, there is neither male nor female: for ye are all one in Christ Jesus.",
    "Romans 6:3-4": "Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life.",
    "1 Corinthians 11:23-26": "For I have received of the Lord that which also I delivered unto you, That the Lord Jesus the same night in which he was betrayed took bread... For as often as ye eat this bread, and drink this cup, ye do shew the Lord's death till he come.",
    "Ephesians 4:11-12": "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ.",
    "Revelation 19:10": "And I fell at his feet to worship him. And he said unto me, See thou do it not: I am thy fellowservant, and of thy brethren that have the testimony of Jesus: worship God: for the testimony of Jesus is the spirit of prophecy.",
    "Exodus 20:1-17": "And God spake all these words, saying... [The Ten Commandments]",
    "James 2:10-12": "For whosoever shall keep the whole law, and yet offend in one point, he is guilty of all... So speak ye, and so do, as they that shall be judged by the law of liberty.",
    "Ecclesiastes 12:13": "Let us hear the conclusion of the whole matter: Fear God, and keep his commandments: for this is the whole duty of man.",
    "Genesis 2:1-3": "Thus the heavens and the earth were finished, and all the host of them. And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made. And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
    "Exodus 20:8-11": "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work... For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.",
    "Malachi 3:10": "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.",
    "1 Corinthians 10:31": "Whether therefore ye eat, or drink, or whatsoever ye do, do all to the glory of God.",
    "Genesis 2:24": "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh.",
    "Daniel 8:14": "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    "Hebrews 8:1-2": "We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
    "Titus 2:13": "Looking for that blessed hope, and the glorious appearing of the great God and our Saviour Jesus Christ.",
    "1 Thessalonians 4:16": "For the Lord himself shall descend from heaven with a shout, with the voice of the archangel, and with the trump of God: and the dead in Christ shall rise first.",
    "Ecclesiastes 9:5": "For the living know that they shall die: but the dead know not any thing, neither have they any more a reward; for the memory of them is forgotten.",
    "Revelation 20:1-15": "And I saw an angel come down from heaven, having the key of the bottomless pit and a great chain in his hand. And he laid hold on the dragon, that old serpent, which is the Devil, and Satan, and bound him a thousand years...",
    "Revelation 20:4": "And I saw thrones, and they sat upon them, and judgment was given unto them: and I saw the souls of them that were beheaded for the witness of Jesus, and for the word of God, and which had not worshipped the beast... and they lived and reigned with Christ a thousand years.",
    "Revelation 21:1-4": "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea. And I John saw the holy city, new Jerusalem, coming down from God out of heaven... And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
    "1 Thessalonians 2:13": "For this cause also thank we God without ceasing, because, when ye received the word of God which ye heard of us, ye received it not as the word of men, but as it is in truth, the word of God, which effectually worketh also in you that believe.",
    "Isaiah 8:20": "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
    "John 17:17": "Sanctify them through thy truth: thy word is truth.",
    "2 Corinthians 13:14": "The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all. Amen.",
    "1 Peter 1:2": "Elect according to the foreknowledge of God the Father, through sanctification of the Spirit, unto obedience and sprinkling of the blood of Jesus Christ: Grace unto you, and peace, be multiplied.",
    "1 John 4:8": "He that loveth not knoweth not God; for God is love.",
    "1 Timothy 1:17": "Now unto the King eternal, immortal, invisible, the only wise God, be honour and glory for ever and ever. Amen.",
    "1 Corinthians 15:28": "And when all things shall be subdued unto him, then shall the Son also himself be subject unto him that put all things under him, that God may be all in all.",
    "Genesis 1:1": "In the beginning God created the heaven and the earth.",
    "John 1:14": "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
    "Philippians 2:5-11": "Let this mind be in you, which was also in Christ Jesus: Who, being in the form of God, thought it not robbery to be equal with God...",
    "John 14:16-18": "And I will pray the Father, and he shall give you another Comforter, that he may abide with you for ever; Even the Spirit of truth; whom the world cannot receive...",
    "Ephesians 1:13-14": "In whom ye also trusted, after that ye heard the word of truth, the gospel of your salvation: in whom also after that ye believed, ye were sealed with that holy Spirit of promise...",
    "Acts 17:26": "And hath made of one blood all nations of men for to dwell on all the face of the earth, and hath determined the times before appointed, and the bounds of their habitation.",
    "1 Thessalonians 5:23": "And the very God of peace sanctify you wholly; and I pray God your whole spirit and soul and body be preserved blameless unto the coming of our Lord Jesus Christ.",
    "Ezekiel 28:12-18": "Son of man, take up a lamentation upon the king of Tyrus, and say unto him, Thus saith the Lord God; Thou sealest up the sum, full of wisdom, and perfect in beauty...",
    "Isaiah 14:12-14": "How art thou fallen from heaven, O Lucifer, son of the morning! how art thou cut down to the ground, which didst weaken the nations!",
    "2 Corinthians 5:21": "For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him.",
    "1 Peter 2:24": "Who his own self bare our sins in his own body on the tree, that we, being dead to sins, should live unto righteousness: by whose stripes ye were healed.",
    "Romans 3:24-26": "Being justified freely by his grace through the redemption that is in Christ Jesus...",
    "Galatians 4:4-7": "But when the fullness of the time was come, God sent forth his Son, made of a woman, made under the law, To redeem them that were under the law, that we might receive the adoption of sons.",
    "Ephesians 6:10-18": "Finally, my brethren, be strong in the Lord, and in the power of his might. Put on the whole armour of God...",
    "Colossians 1:13": "Who hath delivered us from the power of darkness, and hath translated us into the kingdom of his dear Son.",
    "1 Peter 2:9": "But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people; that ye should shew forth the praises of him who hath called you out of darkness into his marvellous light.",
    "Matthew 18:20": "For where two or three are gathered together in my name, there am I in the midst of them.",
    "Ephesians 4:1-6": "I therefore, the prisoner of the Lord, beseech you that ye walk worthy of the vocation wherewith ye are called...",
    "Colossians 3:11": "Where there is neither Greek nor Jew, circumcision nor uncircumcision, Barbarian, Scythian, bond nor free: but Christ is all, and in all.",
    "Acts 2:38": "Then Peter said unto them, Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost.",
    "John 13:1-17": "Now before the feast of the passover, when Jesus knew that his hour was come that he should depart out of this world unto the Father... He riseth from supper, and laid aside his garments; and took a towel, and girded himself. After that he poureth water into a bason, and began to wash the disciples' feet...",
    "1 Corinthians 12:4-11": "Now there are diversities of gifts, but the same Spirit... But all these worketh that one and the selfsame Spirit, dividing to every man severally as he will.",
    "Romans 12:4-8": "For as many as are led by the Spirit of God, they are the sons of God...",
    "2 Chronicles 20:20": "And they rose early in the morning, and went forth into the wilderness of Tekoa: and as they went forth, Jehoshaphat stood and said, Hear me, O Judah, and ye inhabitants of Jerusalem; Believe in the Lord your God, so shall ye be established; believe his prophets, so shall ye prosper.",
    "Joel 2:28-29": "And it shall come to pass afterward, that I will pour out my spirit upon all flesh; and your sons and your daughters shall prophesy, your old men shall dream dreams, your young men shall see visions...",
    "Matthew 5:17-19": "Think not that I am come to destroy the law, or the prophets: I am not come to destroy, but to fulfil.",
    "Romans 7:12": "Wherefore the law is holy, and the commandment holy, and just, and good.",
    "Exodus 31:13": "Speak thou also unto the children of Israel, saying, Verily my sabbaths ye shall keep: for it is a sign between me and you throughout your generations; that ye may know that I am the Lord that doth sanctify you.",
    "Ezekiel 20:12": "Moreover also I gave them my sabbaths, to be a sign between me and them, that they might know that I am the Lord that sanctify them.",
    "Leviticus 27:30": "And all the tithe of the land, whether of the seed of the land, or of the fruit of the tree, is the Lord's: it is holy unto the Lord.",
    "1 Corinthians 9:9-14": "For it is written in the law of Moses, Thou shalt not muzzle the mouth of the ox that treadeth out the corn... Even so hath the Lord ordained that they which preach the gospel should live of the gospel.",
    "1 Corinthians 6:19-20": "What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own? For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God's.",
    "Romans 12:1": "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.",
    "Ephesians 5:21-33": "Submitting yourselves one to another in the fear of God. Wives, submit yourselves unto your own husbands, as unto the Lord... Husbands, love your wives, even as Christ also loved the church, and gave himself for it...",
    "Matthew 19:4-6": "And he answered and said unto them, Have ye not read, that he which made them at the beginning made them male and female... Wherefore they are no more twain, but one flesh. What therefore God hath joined together, let not man put asunder.",
    "Leviticus 16:16": "And he shall make an atonement for the holy place, because of the uncleanness of the children of Israel...",
    "Daniel 7:9-10": "I beheld till the thrones were cast down, and the Ancient of days did sit... thousand thousands ministered unto him, and ten thousand times ten thousand stood before him: the judgment was set, and the books were opened.",
    "Daniel 9:24-27": "Seventy weeks are determined upon thy people and upon thy holy city, to finish the transgression, and to make an end of sins...",
    "Numbers 14:34": "After the number of the days in which ye searched the land, even forty days, each day for a year, shall ye bear your iniquities, even forty years...",
    "Ezekiel 4:6": "And when thou hast accomplished them, lie again on thy right side, and thou shalt bear the iniquity of the house of Judah forty days: I have appointed thee each day for a year.",
    "Matthew 24:27-30": "For as the lightning cometh out of the east, and shineth even unto the west; so shall also the coming of the Son of man be...",
    "Revelation 1:7": "Behold, he cometh with clouds; and every eye shall see him, and they also which pierced him: and all kindreds of the earth shall wail because of him.",
    "John 11:11-14": "These things said he: and after that he saith unto them, Our friend Lazarus sleepeth; but I go, that I may awake him out of sleep... Then said Jesus unto them plainly, Lazarus is dead.",
    "Psalm 146:4": "His breath goeth forth, he returneth to his earth; in that very day his thoughts perish.",
    "Jeremiah 4:23-26": "I beheld the earth, and, lo, it was without form, and void; and the heavens, and they had no light. I beheld the mountains, and, lo, they trembled, and all the hills moved lightly...",
    "Revelation 20:4-6": "And I saw thrones, and they sat upon them, and judgment was given unto them... Blessed and holy is he that hath part in the first resurrection...",
    "Isaiah 65:17-25": "For, behold, I create new heavens and a new earth: and the former shall not be remembered, nor come into mind...",
    "2 Peter 3:13": "Nevertheless we, according to his promise, look for new heavens and a new earth, wherein dwelleth righteousness.",
    "Revelation 14:6": "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people,",
    "Revelation 14:7": "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
    "Revelation 14:8": "And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.",
    "Revelation 14:12": "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    "Jeremiah 51:8": "Babylon is suddenly fallen and destroyed: howl for her; take balm for her pain, if so be she may be healed.",
    "Exodus 20:8": "Remember the sabbath day, to keep it holy.",
    "Exodus 25:8": "And let them make me a sanctuary; that I may dwell among them."
  };

  const cleanRef = reference.trim();
  return fallbackVerses[cleanRef] || fallbackVerses[reference] || "Verily, search the Scriptures to see if these things are so, for in them ye think ye have eternal life.";
};

// Collapsible Outline Card Component using STBA Navy and Gold Palette (No italics)
interface OutlineCardProps {
  title: string;
  summary: string;
  keyReferences: string[];
  onScriptureClick: (ref: string) => void;
  index: number;
}

export const autoScrollToSection = (elementOrId: HTMLElement | string | null, delay = 100) => {
  if (!elementOrId) return;
  setTimeout(() => {
    const el = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    
    let top = 0;
    let current: HTMLElement | null = el;
    while (current) {
      top += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }

    const yOffset = -75; // Account for fixed navbar height so header aligns nicely at top of viewport
    const finalY = Math.max(0, top + yOffset);

    window.scrollTo({
      top: finalY,
      behavior: "smooth"
    });
  }, delay);
};

const OutlineCard: React.FC<OutlineCardProps> = ({
  title,
  summary,
  keyReferences,
  onScriptureClick,
  index,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div
      className="bg-[#FDFAF5] border border-[#E8DDC6] rounded-2xl overflow-hidden shadow-3xs transition-all duration-200"
      id={`outline-card-${index}`}
    >
      {/* Header Area / Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Rule 2 & 5: Disable auto-scroll for nested accordions inside Doctrine Outline to keep viewport stable
        }}
        className="w-full text-left p-5 flex justify-between items-start gap-4 hover:bg-[#FDFAF5]/60 transition-colors cursor-pointer group focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="space-y-1.5 flex-1">
          <h4 className="font-serif font-black text-sm md:text-base text-[#1C2333] tracking-tight group-hover:text-[#C9973A] transition-colors">
            {title}
          </h4>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            {summary}
          </p>
        </div>
        <div className="pt-0.5 shrink-0">
          <ChevronRight
            className={`w-5 h-5 text-[#C9973A] transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded supporting scriptures inside card */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="border-t border-[#E8DDC6]/40 bg-white p-5 space-y-4">
              <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                Supporting Scripture & Verification
              </h5>

              {keyReferences && keyReferences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyReferences.map((ref, krIdx) => {
                    const text = getVerseText(ref);
                    return (
                      <div
                        key={krIdx}
                        className="border border-stone-150 p-4 rounded-xl space-y-2 hover:border-[#C9973A]/30 transition-colors bg-[#FDFAF5]/10"
                        id={`outline-ref-box-${index}-${krIdx}`}
                      >
                        <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                          <button
                            onClick={() => onScriptureClick(ref)}
                            className="font-serif font-black text-xs text-[#1C2333] hover:text-[#C9973A] transition-colors cursor-pointer border-b border-dashed border-stone-300 hover:border-[#C9973A] text-left focus:outline-none"
                          >
                            {ref}
                          </button>
                          <span className="text-[8px] font-mono text-stone-400 uppercase tracking-widest">
                            Verbatim Proof
                          </span>
                        </div>
                        <p className="font-sans text-xs text-stone-700 leading-relaxed">
                          “{text}”
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-stone-400 font-sans">
                  No linked reference texts available for this study outline aspect.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const HOLY_SCRIPTURES_PROOFS = [
  {
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    commentary: "The Psalmist compares God's Word to a lamp that guides our steps and a light that illuminates our life path, demonstrating its practical guidance and divine direction."
  },
  {
    reference: "Proverbs 30:5–6",
    text: "Every word of God is pure: he is a shield unto them that put their trust in him. Add thou not unto his words, lest he reprove thee, and thou be found a liar.",
    commentary: "This passage declares the absolute purity and perfection of God's Word, warning against human additions or alterations which lead to falsehood."
  },
  {
    reference: "Isaiah 8:20",
    text: "To the law and to the testimony: if they speak not according to this word, it is because there is no light in them.",
    commentary: "Isaiah presents the written law and testimonies of God as the infallible benchmark for all truth; any teaching not in harmony with them is devoid of spiritual light."
  },
  {
    reference: "John 17:17",
    text: "Sanctify them through thy truth: thy word is truth.",
    commentary: "Jesus affirms that God's Word is absolute truth, which possesses the power to sanctify and set apart believers for holy service."
  },
  {
    reference: "1 Thessalonians 2:13",
    text: "For this cause also thank we God without ceasing, because, when ye received the word of God which ye heard of us, ye received it not as the word of men, but as it is in truth, the word of God, which effectually worketh also in you that believe.",
    commentary: "Paul highlights that scripture is the genuine word of God, working actively in those who believe, rather than mere human opinion or philosophy."
  },
  {
    reference: "2 Timothy 3:16–17",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, thoroughly furnished unto all good works.",
    commentary: "Paul asserts the full inspiration and divine origin of all Scripture, which serves to completely instruct, correct, and equip the believer."
  },
  {
    reference: "Hebrews 4:12",
    text: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.",
    commentary: "The author of Hebrews describes the Word of God as living and powerful, able to pierce the deepest parts of our being and discern human motives."
  },
  {
    reference: "2 Peter 1:20–21",
    text: "Knowing this first, that no prophecy of the scripture is of any private interpretation. For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
    commentary: "Peter establishes that Scripture did not arise from human intellect or private initiative, but holy men spoke as they were carried along by the Holy Spirit."
  }
];

export const HOLY_SCRIPTURES_OUTLINE = [
  {
    title: "Written by Divine Inspiration",
    content: [
      "God’s holy word, the Bible, is unique among all other books. It was written by more than 40 authors living on three different continents over a span of 1,500 years—yet its words were inspired by God. He inspired human authors, and through them He communicated His will to the rest of humanity (2 Peter 1:20–21).",
      "That’s why the Bible does so well at reaching people at differing points in their lives, amid different situations, and with a wide spectrum of perspectives. The Bible reveals God, but through human eyes, so we can relate.",
      "These days, people question everything. They question the news, authority figures, and even themselves. Amid all the confusion and noise of the world, the Bible can be the one source of information that is completely trustworthy. It teaches us the right way to live, reveals God’s character, and holds the answer to all our big questions.",
      "2 Timothy 3:16 describes Scripture as “breathed out by God” and “profitable for teaching, for reproof, for correction, for training in righteousness.”"
    ]
  },
  {
    title: "Supreme Standard of Truth and Character",
    content: [
      "“Your word is a lamp for my feet, a light on my path” (Psalm 119:105).",
      "Scripture holds instructions, wisdom, and guidance for every decision we might face, serving as a roadmap for life. The Bible’s pages are full of wisdom, telling us what God asks of us and how He wants us to live.",
      "The Bible is also the story of the human race. It tells us how God created humanity to be perfect, how humanity lost that perfection, and how God has been fighting to restore us ever since.",
      "The Bible is the story of humanity’s flaws and failures overcome by God’s love and forgiveness. It reveals our tendencies, the flaws of our fallen nature, and gives examples of what to do and what not to do. It instructs us on the reasoning behind the doctrines we practice and the choices God wants us to make.",
      "Some parts of Scripture can be confusing, but those who sought deeper understanding helped give birth to the Seventh-day Adventist Church—believers who wanted to study the whole Bible for themselves."
    ]
  },
  {
    title: "The Revelation of God's Will",
    content: [
      "The Bible is not like any other book. It is God’s Word sent to human authors and passed down through generations. Only God’s guidance could preserve one cohesive message across so many writers and centuries.",
      "God gave us the Holy Scriptures so He could reveal His character. We don’t have to guess what God is like—He already revealed it in His Word.",
      "God further revealed His will through Jesus, His Son. The four gospels give a detailed account of Jesus’ time on earth, demonstrating God’s character and His love for us.",
      "God is not distant or hidden. He is a loving Father and Creator, eager for us to grow strong in faith and draw closer to Him. That is the image of God Scripture shows us."
    ]
  },
  {
    title: "A Timeless, Relevant Message",
    content: [
      "The Holy Scriptures paint a picture of humanity’s history and offer insight into God’s will and character, but they also hold morals that are just as true today as when they were written.",
      "Society’s morals constantly change, but God’s do not (Matthew 24:35). Christ’s doctrines of loving our neighbors and forgiving those who wrong us will never go out of style. God’s law will always be “Love the Lord your God… and love your neighbor as yourself” (Luke 10:27).",
      "God’s word is timeless—alive and active, sharper than any double-edged sword, discerning the thoughts and attitudes of the heart (Hebrews 4:12).",
      "Even though Scripture was written thousands of years ago, it still has the same strength and impact. God’s wisdom and love remain relevant and alive today.",
      "God’s written word has guided people, inspired nations, and changed hearts throughout history. It is truly God’s love letter to humanity—revealing His character, offering wisdom, and showing how He sent His Son so that we could live."
    ]
  }
];

const pulseAnimationStyles = `
  @keyframes softPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(201, 151, 58, 0.4); }
    50% { transform: scale(1.005); box-shadow: 0 0 0 8px rgba(201, 151, 58, 0); }
  }
  .animate-pulse-soft {
    animation: softPulse 2s infinite ease-in-out;
  }
`;

interface HolyScripturesOutlineCardProps {
  title: string;
  content: string[];
  index: number;
  isLocked: boolean;
  isOpen: boolean;
  hasHighlight: boolean;
  onToggle: () => void;
  onComplete: () => void;
  elderStevenBubble?: React.ReactNode;
  totalSections?: number;
}

const HolyScripturesOutlineCard: React.FC<HolyScripturesOutlineCardProps> = ({
  title,
  content,
  index,
  isLocked,
  isOpen,
  hasHighlight,
  onToggle,
  onComplete,
  elderStevenBubble,
  totalSections = 4,
}) => {
  return (
    <>
      <style>{pulseAnimationStyles}</style>
      <div
        className={`bg-[#FDFAF5] border rounded-2xl overflow-hidden shadow-3xs transition-all duration-300 relative ${
          isLocked
            ? "border-emerald-500/40 bg-emerald-50/10 ring-1 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] opacity-85"
            : hasHighlight
            ? "border-[#C9973A] bg-white ring-2 ring-[#C9973A]/20 animate-pulse-soft"
            : isOpen
            ? "border-[#C9973A] bg-white shadow-2xs"
            : "border-[#E8DDC6] hover:border-[#C9973A]"
        }`}
        id={`holy-scriptures-outline-card-${index}`}
      >
        <button
          onClick={isLocked ? undefined : onToggle}
          disabled={isLocked}
          className={`w-full text-left p-5 flex justify-between items-center gap-4 transition-colors focus:outline-none min-h-[48px] ${
            isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-[#FDFAF5]/60 group"
          }`}
          aria-expanded={isOpen}
        >
          <span className={`font-serif font-black text-sm md:text-base tracking-tight transition-colors uppercase select-none not-italic flex items-center flex-wrap gap-2 ${
            isLocked ? "text-stone-500" : isOpen ? "text-[#C9973A]" : "text-[#1C2333] group-hover:text-[#C9973A]"
          }`}>
            <span>{`Doctrine Outline ${index + 1}: ${title}`}</span>
            {hasHighlight && (
              <span className="text-[10px] font-mono text-white bg-[#C9973A] px-2 py-0.5 rounded-full tracking-normal font-bold shrink-0">
                Start
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full tracking-normal flex items-center gap-1 font-bold shrink-0">
                <Lock className="w-3 h-3 text-emerald-600" /> Locked
              </span>
            )}
          </span>
          <div className="shrink-0">
            {!isLocked && (
              <ChevronRight
                className={`w-5 h-5 text-[#C9973A] transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {!isLocked && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="border-t border-[#E8DDC6]/40 bg-white p-5 space-y-4">
                {elderStevenBubble && (
                  <div className="mb-4">
                    {elderStevenBubble}
                  </div>
                )}
                {content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="font-sans text-sm text-stone-800 leading-relaxed not-italic break-words">
                    {paragraph}
                  </p>
                ))}

                {/* Continue Button */}
                <div className="pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={onComplete}
                    className="px-5 py-2.5 bg-[#1C2333] hover:bg-[#C9973A] text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <span>{index === totalSections - 1 ? "Complete Outline Study" : "Continue to advance"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const HOLY_SCRIPTURES_PRETEST_QUESTIONS = [
  {
    id: "q1",
    question: "Which statement best describes how the Bible was written?",
    options: [
      "A. Written by one author over a short period",
      "B. Written by many authors inspired by God",
      "C. Written by angels directly",
      "D. Written only for ancient cultures"
    ],
    correctAnswerIndex: 1, // B
    focusArea: "WRITTEN BY DIVINE INSPIRATION TO DIVERSE HUMAN BEINGS"
  },
  {
    id: "q2",
    question: "What does 2 Timothy 3:16 teach about Scripture?",
    options: [
      "A. It is optional for Christians",
      "B. It is “breathed out by God” and useful for teaching",
      "C. It is only historical information",
      "D. It is symbolic but not authoritative"
    ],
    correctAnswerIndex: 1, // B
    focusArea: "WRITTEN BY DIVINE INSPIRATION TO DIVERSE HUMAN BEINGS"
  },
  {
    id: "q3",
    question: "What does Psalm 119:105 describe the Bible as?",
    options: [
      "A. A mystery book",
      "B. A lamp and light for life’s path",
      "C. A collection of myths",
      "D. A book of predictions"
    ],
    correctAnswerIndex: 1, // B
    focusArea: "A ROADMAP FOR LIFE"
  },
  {
    id: "q4",
    question: "How does the Bible reveal God’s will?",
    options: [
      "A. Through random stories",
      "B. Through a unified message preserved across centuries",
      "C. Through hidden codes",
      "D. Through cultural traditions alone"
    ],
    correctAnswerIndex: 1, // B
    focusArea: "THE REVELATION OF GOD’S WILL"
  },
  {
    id: "q5",
    question: "Why is the Bible considered timeless?",
    options: [
      "A. Society’s morals never change",
      "B. God’s word remains true across all generations",
      "C. It is rewritten every century",
      "D. It only applies to ancient Israel"
    ],
    correctAnswerIndex: 1, // B
    focusArea: "A TIMELESS, RELEVANT MESSAGE"
  }
];

export const TRINITY_PROOFS = [
  {
    reference: "Genesis 1:26",
    text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.",
    commentary: "The plural pronoun 'Let us' in Creation points to the divine council and collaborative activity of the Triune Godhead in making humanity."
  },
  {
    reference: "Deuteronomy 6:4",
    text: "Hear, O Israel: The Lord our God is one Lord.",
    commentary: "The foundational Shema declares the absolute unity of God. The Hebrew word 'echad' represents a compound unity, affirming one Godhead in three Persons."
  },
  {
    reference: "Isaiah 6:8",
    text: "Also I heard the voice of the Lord, saying, Whom shall I send, and who will go for us? Then said I, Here am I; send me.",
    commentary: "God speaks in both the singular ('Whom shall I send') and the plural ('who will go for us'), revealing the Triune communion within the Godhead."
  },
  {
    reference: "Matthew 28:19",
    text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.",
    commentary: "Jesus commands baptism into the singular 'name' of the Father, Son, and Holy Spirit—affirming their equal divine authority and shared divine essence. While the word ‘trinity’ may not be in the Bible, the concept of this three‑in‑one Godhead is expressed in many places throughout the Bible."
  },
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    commentary: "Demonstrates the sacrificial love of the Father in sending the Son, showing how God the Father, God the Son, and God the Holy Spirit work together in ways that a human team would never be able to for a common goal."
  },
  {
    reference: "2 Corinthians 1:21–22",
    text: "Now he which stablisheth us with you in Christ, and hath anointed us, is God; Who hath also sealed us, and given the earnest of the Spirit in our hearts.",
    commentary: "Paul references all three Persons: God the Father who establishes, Christ the Son who anoints, and the Holy Spirit who seals believers."
  },
  {
    reference: "2 Corinthians 13:14",
    text: "The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all. Amen.",
    commentary: "The apostolic blessing explicitly lists all three co-equal Persons of the Godhead, invoking Christ's grace, the Father's love, and the Spirit's fellowship."
  },
  {
    reference: "Ephesians 4:4–6",
    text: "There is one body, and one Spirit, even as ye are called in one hope of your calling; One Lord, one faith, one baptism, One God and Father of all, who is above all, and through all, and in you all.",
    commentary: "Paul details the organic unity of the Christian faith, structured around the one Spirit, the one Lord Jesus Christ, and the one God and Father."
  },
  {
    reference: "1 Peter 1:2",
    text: "Elect according to the foreknowledge of God the Father, through sanctification of the Spirit, unto obedience and sprinkling of the blood of Jesus Christ: Grace unto you, and peace, be multiplied.",
    commentary: "Peter presents the salvation of believers as a collaborative work of the Trinity: planned by the Father, sanctified by the Spirit, and redeemed through the blood of Jesus."
  }
];

export const TRINITY_OUTLINE = [
  {
    title: "The Unity of the Godhead",
    content: [
      "There is one God: Father, Son, and Holy Spirit — a unity of three coeternal Persons. God is immortal, all‑powerful, all‑knowing, above all, and ever‑present.",
      "This compound unity is declared in Deuteronomy 6:4 ('echad') and Ephesians 4:4–6. Though three distinct Persons, the Godhead possesses absolute oneness of character, purpose, and divine essence."
    ]
  },
  {
    title: "The Distinct Persons",
    content: [
      "The Father, Son, and Holy Spirit are each fully divine, possessing divine intelligence, love, emotion, and sovereign will.",
      "While the word ‘trinity’ may not be in the Bible, the concept of this three‑in‑one Godhead is expressed in many places throughout the Bible.",
      "They are neither three separate gods (polytheism) nor one Person appearing in three temporary modes (modalism)."
    ]
  },
  {
    title: "The Co‑Eternal Nature",
    content: [
      "None of the three divine Persons was created or came into existence at a later point in time.",
      "All three Persons are self-existent, immortal, and eternal—without beginning or end (Hebrews 9:14, Micah 5:2). Their eternal unity is the unshakeable foundation of divine love and sovereignty."
    ]
  },
  {
    title: "The Roles of the Father, Son, and Spirit",
    content: [
      "The Father: Source, sustainer, and loving initiator of the plan of redemption (John 3:16).",
      "The Son: Redeemer, Creator, and Advocate who became incarnate as Jesus Christ (John 1:1–3, 14).",
      "The Spirit: Guide, Comforter, and Sanctifier who convicts human hearts and transforms believers into God's image (John 16:7–13)."
    ]
  },
  {
    title: "The Trinity in Scripture",
    content: [
      "Creation: God said, 'Let us make man in our image' (Genesis 1:26).",
      "Baptism of Jesus: The Father spoke from heaven, the Spirit descended as a dove, and the Son was baptized in the Jordan (Luke 3:22).",
      "Great Commission: Jesus commanded baptism in the singular 'name' of the Father, Son, and Holy Ghost (Matthew 28:19).",
      "Apostolic Blessing: 'The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all' (2 Corinthians 13:14)."
    ]
  },
  {
    title: "The Trinity in Salvation",
    content: [
      "The Father plans redemption, the Son accomplishes redemption on the cross, and the Spirit applies redemption to the believer's life.",
      "God the Father, God the Son, and God the Holy Spirit work together in ways that a human team would never be able to for a common goal."
    ]
  },
  {
    title: "The Mystery of the Godhead",
    content: [
      "God is infinite and beyond full human comprehension, yet known through His self-revelation in Scripture and in Jesus Christ.",
      "God, who is love, is forever worthy of worship, adoration, and service by all creation."
    ]
  }
];

export const TRINITY_PRETEST_QUESTIONS = [
  {
    id: "t1",
    question: "According to Deuteronomy 6:4 and Ephesians 4:4–6, how is the unity of the Godhead declared in Scripture?",
    options: [
      "A. As three separate gods ruling over different domains",
      "B. As 'one Lord' (Deut. 6:4) and 'one God and Father of all, who is above all, and through all, and in you all' (Eph. 4:6)",
      "C. As a temporary union that will be dissolved after redemption",
      "D. As one single divine Person transforming into three temporary modes"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE UNITY OF THE GODHEAD"
  },
  {
    id: "t2",
    question: "Based on Matthew 28:19 and the Doctrinal Outline, how are the distinct Persons of the Godhead identified?",
    options: [
      "A. As Father, Son, and Holy Spirit — coequal Persons sharing one divine nature, in whose singular 'name' believers are baptized",
      "B. As three independent deities with separate purposes",
      "C. As created beings elevated to divine status",
      "D. As symbolic metaphors rather than distinct divine Persons"
    ],
    correctAnswerIndex: 0,
    focusArea: "THE DISTINCT PERSONS"
  },
  {
    id: "t3",
    question: "According to the Doctrinal Outline on The Co-Eternal Nature, what is true regarding the Father, Son, and Holy Spirit?",
    options: [
      "A. The Son was created by the Father in time",
      "B. None of the three divine Persons was created; all three are self-existent, immortal, and eternal",
      "C. The Holy Spirit came into existence at Pentecost",
      "D. Only the Father existed from all eternity past"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE CO-ETERNAL NATURE"
  },
  {
    id: "t4",
    question: "According to John 3:16, 2 Corinthians 1:21–22, and 1 Peter 1:2, what are the distinct roles of the Father, Son, and Holy Spirit in believers?",
    options: [
      "A. Elect according to the foreknowledge of God the Father, through sanctification of the Spirit, unto obedience and sprinkling of the blood of Jesus Christ",
      "B. The Father acts alone in redemption while the Son and Spirit observe",
      "C. The Holy Spirit operates without reference to Christ's sacrifice",
      "D. The Son redeems humanity without the Father's plan or the Spirit's sealing"
    ],
    correctAnswerIndex: 0,
    focusArea: "THE ROLES OF THE FATHER, SON, AND SPIRIT"
  },
  {
    id: "t5",
    question: "In Genesis 1:26, Isaiah 6:8, and 2 Corinthians 13:14, how is the Triune Godhead revealed in text?",
    options: [
      "A. Through plural divine declarations ('Let us make man in our image', 'who will go for us?') and the apostolic blessing of Christ, God, and the Holy Ghost",
      "B. Exclusively through OT apocalyptic symbolisms",
      "C. By describing Jesus and the Spirit as created angels",
      "D. Without any reference to divine plurality or fellowship"
    ],
    correctAnswerIndex: 0,
    focusArea: "THE TRINITY IN SCRIPTURE"
  },
  {
    id: "t6",
    question: "According to the Doctrinal Outline on The Trinity in Salvation, how do the divine Persons work together for human redemption?",
    options: [
      "A. The Father plans redemption, the Son accomplishes redemption on the cross, and the Spirit applies redemption to the believer's life",
      "B. Each divine Person offers an independent path to eternal life",
      "C. The Son acts contrary to the Father's will to save humanity",
      "D. Redemption is accomplished strictly by human effort without divine action"
    ],
    correctAnswerIndex: 0,
    focusArea: "THE TRINITY IN SALVATION"
  },
  {
    id: "t7",
    question: "According to the Doctrinal Outline on The Mystery of the Godhead, how is God known to creation?",
    options: [
      "A. God is finite and fully comprehended through human logic alone",
      "B. God is infinite and beyond full human comprehension, yet known through His self-revelation in Scripture and in Jesus Christ",
      "C. God is completely unknowable and unapproachable by human beings",
      "D. God is known only through human philosophy and cultural tradition"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE MYSTERY OF THE GODHEAD"
  }
];

export const FATHER_PROOFS = [
  {
    reference: "Genesis 1:1",
    text: "In the beginning God created the heaven and the earth.",
    commentary: "God the eternal Father is revealed as the absolute Creator and Source of all created existence."
  },
  {
    reference: "Deuteronomy 4:35",
    text: "Unto thee it was shewed, that thou mightest know that the Lord he is God; there is none else beside him.",
    commentary: "Establishes the supreme sovereignty and unique self-existent nature of God the Father."
  },
  {
    reference: "Psalm 110:1, 4",
    text: "The Lord said unto my Lord, Sit thou at my right hand, until I make thine enemies thy footstool... The Lord hath sworn, and will not repent, Thou art a priest for ever after the order of Melchizedek.",
    commentary: "Reveals the Father's sovereign decree and prophetic covenant in relation to the Son."
  },
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    commentary: "Demonstrates the Father's proactive love and gracious sacrifice in giving His Son for human redemption."
  },
  {
    reference: "John 14:9",
    text: "Jesus saith unto him, Have I been so long time with you, and yet hast thou not known me, Philip? he that hath seen me hath seen the Father; and how sayest thou then, Shew us the Father?",
    commentary: "Affirms that the divine character, love, and attributes exhibited in Jesus Christ are perfect revelations of the Father."
  },
  {
    reference: "1 Corinthians 15:28",
    text: "And when all things shall be subdued unto him, then shall the Son also himself be subject unto him that put all things under him, that God may be all in all.",
    commentary: "Highlights God the Father as the ultimate Sovereign and Source of all restoration."
  },
  {
    reference: "1 Timothy 1:17",
    text: "Now unto the King eternal, immortal, invisible, the only wise God, be honour and glory for ever and ever. Amen.",
    commentary: "Exalts the eternal, immortal, invisible, and all-wise character of God the Father."
  },
  {
    reference: "1 John 4:8",
    text: "He that loveth not knoweth not God; for God is love.",
    commentary: "Declares the foundational nature of the Father's essence and character: 'God is love'."
  },
  {
    reference: "Revelation 4:11",
    text: "Thou art worthy, O Lord, to receive glory and honour and power: for thou hast created all things, and for thy pleasure they are and were created.",
    commentary: "Displays the heavenly adoration directed to God the Father as Creator and Sustainer of all things."
  }
];

export const FATHER_OUTLINE = [
  {
    title: "Biblical Revelation of the Father",
    content: [
      "God is our Father in Heaven and we are His children: 'See what kind of love the Father has given to us, that we should be called children of God.' (1 John 3:1)",
      "God is a Father to the fatherless: 'Father of the fatherless and protector of widows is God in his holy habitation.' (Psalm 68:5)",
      "God is the Father of Jesus, revealing the loving relationship within the eternal Godhead."
    ]
  },
  {
    title: "Creator and Sustainer of Life",
    content: [
      "God created humanity in His image, bestowing dignity, purpose, and moral agency.",
      "God formed humans personally and relationally, breathing into them the breath of life.",
      "God spoke the world into existence by His word and sovereign power (Genesis 1:1, Revelation 4:11).",
      "God sustains life: 'in Him we live and move and have our being' (Acts 17:28)."
    ]
  },
  {
    title: "The Character of God",
    content: [
      "Ten attributes frequently shown in Scripture:",
      "1. God is love (1 John 4:8) | 2. God is just | 3. God is merciful | 4. God is all‑powerful | 5. God is patient",
      "6. God is good | 7. God is holy | 8. God is unchanging | 9. God is all‑knowing | 10. God is ever‑present."
    ]
  },
  {
    title: "Fearing God & Giving Him Glory",
    content: [
      "Reverence: Approaching God with holy awe, honor, and sacred respect.",
      "Obedience: Faithfully keeping His commandments and aligning our lives with His word.",
      "Submission to God’s authority: Surrendering our self-will to His divine leadership and truth.",
      "Worship: Rendering unto Him supreme praise, thanksgiving, and heart devotion."
    ]
  },
  {
    title: "How God Relates to His Children",
    content: [
      "God desires relationship with each of His children.",
      "God listens, helps, comforts, heals, forgives, and guides us through His Word and Spirit.",
      "God cares for us intimately, guiding us with fatherly compassion and steadfast love."
    ]
  }
];

export const FATHER_PRETEST_QUESTIONS = [
  {
    id: "f1",
    question: "According to 1 John 3:1, Psalm 68:5, and the Doctrinal Outline, what does the Bible teach about God as Father?",
    options: [
      "A. God is distant and unconcerned with human suffering",
      "B. God is our Father in Heaven who makes us His children ('See what kind of love the Father has given to us, that we should be called children of God'), is a 'Father of the fatherless and protector of widows', and is the Father of Jesus",
      "C. God acts as Father only to earthly rulers and political leaders",
      "D. God ceased being a Father after the Old Testament era"
    ],
    correctAnswerIndex: 1,
    focusArea: "WHAT THE BIBLE TELLS US ABOUT GOD THE FATHER"
  },
  {
    id: "f2",
    question: "Based on Genesis 1:1, Revelation 4:11, and the Doctrinal Outline, how did God act in creating and sustaining life?",
    options: [
      "A. God created humanity in His image, formed humans personally and relationally, spoke the world into existence, and sustains life ('in Him we live and move and have our being')",
      "B. Creation came into being purely through random chance without divine design or word",
      "C. God created the universe but does not sustain or care for living beings",
      "D. Humans were created by created beings rather than God the Father"
    ],
    correctAnswerIndex: 0,
    focusArea: "GOD IS THE CREATOR AND SUSTAINER OF LIFE"
  },
  {
    id: "f3",
    question: "According to 1 John 4:8, 1 Timothy 1:17, and the Doctrinal Outline, which ten attributes define the character of God the Father?",
    options: [
      "A. God is vengeful, limited in knowledge, partial, and unapproachable",
      "B. God is love, just, merciful, all-powerful, patient, good, holy, unchanging, all-knowing, and ever-present",
      "C. God possesses power but lacks mercy, goodness, and love",
      "D. God's character changes according to human culture and time"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE CHARACTER OF GOD"
  },
  {
    id: "f4",
    question: "According to the Doctrinal Outline, what four principles describe what it means to 'fear God and give Him glory'?",
    options: [
      "A. Superstition, ritual sacrifice, isolation, and pride",
      "B. Reverence, obedience, submission to God's authority, and worship",
      "C. Fearing human opinions, legalism, self-reliance, and tradition",
      "D. Intellectual debate, philosophical doubt, fear of punishment, and isolation"
    ],
    correctAnswerIndex: 1,
    focusArea: "WHAT IT MEANS TO 'FEAR GOD AND GIVE HIM GLORY'"
  },
  {
    id: "f5",
    question: "Based on John 3:16, John 14:9, 1 Corinthians 15:28, and the Doctrinal Outline, how does God relate with us as His children?",
    options: [
      "A. God rejects relationship and remains unapproachable to human prayers",
      "B. God desires relationship, listens, helps, comforts, heals, forgives, guides, and cares for us intimately",
      "C. God relates to humanity only through harsh condemnation without grace",
      "D. God expects humans to save themselves without His help or guidance"
    ],
    correctAnswerIndex: 1,
    focusArea: "HOW GOD RELATES WITH US, HIS CHILDREN"
  }
];

export const SON_PROOFS = [
  {
    reference: "Isaiah 53:4–6",
    text: "Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed. All we like sheep have gone astray; we have turned every one to his own way; and the Lord hath laid on him the iniquity of us all.",
    commentary: "Prophesies the substitutionary sacrifice of Jesus Christ, bearing human sins to bring peace and healing."
  },
  {
    reference: "Daniel 9:25–27",
    text: "Know therefore and understand, that from the going forth of the commandment to restore and to build Jerusalem unto the Messiah the Prince shall be seven weeks, and threescore and two weeks... And after threescore and two weeks shall Messiah be cut off, but not for himself... and he shall confirm the covenant with many for one week...",
    commentary: "Foretells the precise timing of Messiah's baptism, ministry, substitutionary death ('cut off, but not for himself'), and the confirmation of the covenant."
  },
  {
    reference: "Luke 1:35",
    text: "And the angel answered and said unto her, The Holy Ghost shall come upon thee, and the power of the Highest shall overshadow thee: therefore also that holy thing which shall be born of thee shall be called the Son of God.",
    commentary: "Declares the miraculous conception of Jesus Christ by the Holy Spirit, uniting divine nature with human flesh."
  },
  {
    reference: "John 1:1–3, 14",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made... And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
    commentary: "Affirms the eternal deity and creative power of Jesus Christ: 'In the beginning was the Word, and the Word was with God, and the Word was God.'"
  },
  {
    reference: "John 5:22",
    text: "For the Father judgeth no man, but hath committed all judgment unto the Son.",
    commentary: "Reveals that the Father has entrusted all judgment to Jesus Christ, who is qualified as both Creator and human Savior."
  },
  {
    reference: "John 10:30",
    text: "I and my Father are one.",
    commentary: "Affirms the absolute unity of essence, purpose, and divine nature between Jesus Christ and the Father."
  },
  {
    reference: "John 14:1–3, 9, 13",
    text: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions... I go to prepare a place for you. And if I go and prepare a place for you, I will come again, and receive you unto myself... he that hath seen me hath seen the Father... And whatsoever ye shall ask in my name, that will I do...",
    commentary: "Promises Christ's second coming, reveals Him as the perfect manifestation of the Father, and promises answers to prayer in His name."
  },
  {
    reference: "Romans 6:23",
    text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
    commentary: "Contrasts the eternal death earned by human sin with the free gift of eternal life provided through Jesus Christ."
  },
  {
    reference: "1 Corinthians 15:3–4",
    text: "For I delivered unto you first of all that which I also received, how that Christ died for our sins according to the scriptures; And that he was buried, and that he rose again the third day according to the scriptures.",
    commentary: "Summarizes the foundational gospel truths: Christ's substitutionary death, burial, and triumphant resurrection on the third day."
  },
  {
    reference: "2 Corinthians 3:18",
    text: "But we all, with open face beholding as in a glass the glory of the Lord, are changed into the same image from glory to glory, even as by the Spirit of the Lord.",
    commentary: "Explains how beholding the glory and character of Jesus Christ transforms believers into His divine image."
  },
  {
    reference: "2 Corinthians 5:17–19",
    text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new. And all things are of God, who hath reconciled us to himself by Jesus Christ... God was in Christ, reconciling the world unto himself...",
    commentary: "Declares that Christ brings new creation and complete reconciliation between God and humanity."
  },
  {
    reference: "Philippians 2:5–11",
    text: "Let this mind be in you, which was also in Christ Jesus: Who, being in the form of God, thought it not robbery to be equal with God: But made himself of no reputation, and took upon him the form of a servant, and was made in the likeness of men...",
    commentary: "Traces Christ's self-emptying humility from equality with God down to death on the cross, followed by His exaltation above every name."
  },
  {
    reference: "Colossians 1:15–19",
    text: "Who is the image of the invisible God, the firstborn of every creature: For by him were all things created, that are in heaven, and that are in earth... and he is before all things, and by him all things consist. And he is the head of the body, the church... For it pleased the Father that in him should all fulness dwell.",
    commentary: "Exalts Jesus Christ as Creator, Sustainer of all existence, Head of the Church, and embodiment of all divine fullness."
  },
  {
    reference: "Hebrews 2:9–18",
    text: "But we see Jesus, who was made a little lower than the angels for the suffering of death, crowned with glory and honour... Forasmuch then as the children are partakers of flesh and blood, he also himself likewise took part of the same... Wherefore in all things it behoved him to be made like unto his brethren, that he might be a merciful and faithful high priest...",
    commentary: "Shows how Jesus shared fully in human flesh and blood to conquer death, sympathize with human weakness, and serve as High Priest."
  },
  {
    reference: "Hebrews 8:1–2",
    text: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
    commentary: "Presents Jesus Christ ministering as High Priest in the heavenly sanctuary on our behalf."
  }
];

export const SON_OUTLINE = [
  {
    title: "The Identity of God the Son",
    content: [
      "Jesus is the eternal Son of God and one of the three co‑eternal Persons of the Godhead.",
      "Jesus is fully divine (“In Him dwells all the fullness of the Godhead bodily”).",
      "Jesus is the Word: “In the beginning was the Word, and the Word was with God, and the Word was God.” (John 1:1)",
      "Jesus is co‑existent with the Father from everlasting and was publicly affirmed as God’s Son at His baptism.",
      "Jesus declared His divine identity (“I am”) and will return in glory as promised."
    ]
  },
  {
    title: "Jesus Christ Our Creator",
    content: [
      "Creation was a cooperative act of the Godhead.",
      "Jesus is the active agent of creation (“All things were made through Him”).",
      "Jesus formed humanity personally (“formed man of the dust”) and breathed life into humanity.",
      "Jesus created all things visible and invisible (Colossians 1:15–19)."
    ]
  },
  {
    title: "The Incarnation of Jesus Christ",
    content: [
      "Jesus is the “Son of Man” and “Son of God”, fully God and fully man.",
      "Jesus was conceived by the Holy Spirit and fulfilled prophecy (Isaiah 9:6).",
      "Jesus grew in wisdom and stature and is God “manifested in the flesh”."
    ]
  },
  {
    title: "Jesus Christ Our Savior & Messiah",
    content: [
      "Jesus is the Anointed One (Messiah), baptized to “fulfill all righteousness”.",
      "Jesus was tempted in all points yet without sin, resisting Satan and overcoming temptation.",
      "Jesus lived among humanity to bring salvation and came “to save that which was lost”.",
      "“For God so loved the world that He gave His only begotten Son.” (John 3:16)"
    ]
  },
  {
    title: "Salvation Through Christ's Sacrifice",
    content: [
      "Sin brings death; Jesus brings eternal life. Jesus paid the penalty for sin.",
      "Jesus suffered hatred, persecution, and betrayal, submitting to the Father’s will.",
      "Jesus died voluntarily for our sins, fulfilling Isaiah’s prophecy of the suffering servant (Isaiah 53:4–6).",
      "Jesus’ death reveals God’s love; Jesus rested in the tomb, rose from the dead as conqueror, and gives eternal life to His followers."
    ]
  },
  {
    title: "Jesus Christ Our Heavenly Advocate",
    content: [
      "Jesus aids those who are tempted and is our Advocate with the Father.",
      "Jesus pleads His sacrifice on our behalf in the heavenly sanctuary (Hebrews 8:1–2).",
      "Jesus has washed us from our sins and has never lost a case; the Father Himself loves us."
    ]
  },
  {
    title: "The Second Coming of Christ",
    content: [
      "Jesus is preparing a place for His people and will return personally and visibly (John 14:1–3).",
      "The dead in Christ will rise, and believers will be caught up to meet Him.",
      "Jesus will end suffering, sin, and death; believers will be transformed at His coming, and victory over death will be celebrated."
    ]
  },
  {
    title: "The Power of His Life & Resurrection",
    content: [
      "Jesus is the resurrection and the life; faith in Jesus brings salvation.",
      "Jesus writes believers’ names in the Book of Life and empowers believers to become children of God.",
      "Jesus’ sacrifice gives hope, healing, and freedom; Jesus knocks at the door of our hearts.",
      "Jesus is central to Adventist faith and mission; Jesus’ love sustains and empowers us."
    ]
  }
];

export const SON_PRETEST_QUESTIONS = [
  {
    id: "s1",
    question: "According to John 1:1–3, Colossians 1:15–19, and the Doctrine Outline, what does the Bible reveal about the identity and deity of God the Son?",
    options: [
      "A. Jesus is a created angelic being who became divine after His resurrection",
      "B. Jesus is the eternal Son of God, fully divine ('In Him dwells all the fullness of the Godhead bodily'), and the Word who 'was with God, and the Word was God'",
      "C. Jesus was only a good human teacher without pre-existence or divine nature",
      "D. Jesus' deity was acquired temporarily during His earthly baptism"
    ],
    correctAnswerIndex: 1,
    focusArea: "WHO IS GOD THE SON?"
  },
  {
    id: "s2",
    question: "Based on John 1:3, Colossians 1:16, and the Doctrine Outline, what role did Jesus Christ play in Creation?",
    options: [
      "A. Jesus was the active agent of creation through whom all things visible and invisible were made ('All things were made through Him')",
      "B. Creation was performed solely by the Father without the participation of the Son",
      "C. Jesus created only spiritual beings, while the physical world evolved spontaneously",
      "D. Jesus observed Creation but took no active part in forming humanity"
    ],
    correctAnswerIndex: 0,
    focusArea: "JESUS CHRIST IS OUR CREATOR"
  },
  {
    id: "s3",
    question: "According to Isaiah 53:4–6, 1 Corinthians 15:3–4, and the Doctrine Outline, how does Jesus' death save humanity?",
    options: [
      "A. Jesus died as an unfortunate victim of political conflict without spiritual significance",
      "B. Jesus died voluntarily for our sins as our substitutionary sacrifice, bearing our griefs and paying sin's penalty, and rose as conqueror on the third day",
      "C. Jesus' death provides salvation only for those who achieve perfect sinless works prior to grace",
      "D. Sin does not bring death, so Jesus' sacrifice was merely symbolic"
    ],
    correctAnswerIndex: 1,
    focusArea: "IT IS THROUGH JESUS’ DEATH THAT WE ARE SAVED"
  },
  {
    id: "s4",
    question: "Based on Hebrews 2:17–18, Hebrews 8:1–2, and the Doctrine Outline, what is Jesus' current ministry for us in Heaven?",
    options: [
      "A. Jesus is inactive in heaven while waiting for the end of time",
      "B. Jesus serves as our merciful High Priest and Advocate in the heavenly sanctuary, aiding those who are tempted and pleading His sacrifice on our behalf",
      "C. Jesus acts as an uncompromising judge who accuses believers before the Father",
      "D. Jesus' ministry ended completely when He ascended to heaven"
    ],
    correctAnswerIndex: 1,
    focusArea: "JESUS CHRIST IS OUR ADVOCATE"
  },
  {
    id: "s5",
    question: "According to John 14:1–3, Philippians 2:9–11, and the Doctrine Outline, what will happen at the second coming of Jesus Christ?",
    options: [
      "A. Jesus will return secretively in spirit without visible manifestation",
      "B. Jesus will return personally and visibly, resurrect the dead in Christ, transform believers, and end suffering, sin, and death",
      "C. Jesus will not return to earth, but will leave humanity to govern itself indefinitely",
      "D. Only a select group of scholars will perceive His spiritual arrival"
    ],
    correctAnswerIndex: 1,
    focusArea: "JESUS CHRIST WILL RETURN TO EARTH"
  }
];

export const SPIRIT_PROOFS = [
  {
    reference: "Genesis 1:1–2",
    text: "In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
    commentary: "Reveals the Holy Spirit actively present and working with the Father and the Son in the creation of the world."
  },
  {
    reference: "2 Samuel 23:2",
    text: "The Spirit of the Lord spake by me, and his word was in my tongue.",
    commentary: "Shows the Holy Spirit inspiring human prophets to speak and record God's infallible word."
  },
  {
    reference: "Psalm 51:11",
    text: "Cast me not away from thy presence; and take not thy holy spirit from me.",
    commentary: "Expresses David's earnest prayer for God's personal indwelling presence and moral restoration."
  },
  {
    reference: "Isaiah 61:1",
    text: "The Spirit of the Lord God is upon me; because the Lord hath anointed me to preach good tidings unto the meek; he hath sent me to bind up the brokenhearted, to proclaim liberty to the captives, and the opening of the prison to them that are bound...",
    commentary: "Prophesies the Holy Spirit's anointing upon the Messiah for His earthly ministry of deliverance and grace."
  },
  {
    reference: "Luke 1:35",
    text: "And the angel answered and said unto her, The Holy Ghost shall come upon thee, and the power of the Highest shall overshadow thee: therefore also that holy thing which shall be born of thee shall be called the Son of God.",
    commentary: "Demonstrates the Holy Spirit's active power in the miracle of Christ's incarnation."
  },
  {
    reference: "Luke 4:18",
    text: "The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives, and recovering of sight to the blind, to set at liberty them that are bruised...",
    commentary: "Jesus quotes Isaiah 61:1 to declare that His earthly mission is empowered by the Holy Spirit."
  },
  {
    reference: "John 14:16–18, 26",
    text: "And I will pray the Father, and he shall give you another Comforter, that he may abide with you for ever; Even the Spirit of truth... But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance...",
    commentary: "Promises the personal indwelling presence of the Holy Spirit as another Comforter and divine Teacher."
  },
  {
    reference: "John 15:26",
    text: "But when the Comforter is come, whom I will send unto you from the Father, even the Spirit of truth, which proceedeth from the Father, he shall testify of me.",
    commentary: "Affirms that the primary work of the Holy Spirit is to glorify Jesus Christ and testify of His truth."
  },
  {
    reference: "John 16:7–13",
    text: "Nevertheless I tell you the truth; It is expedient for you that I go away: for if I go not away, the Comforter will not come unto you... And when he is come, he will reprove the world of sin, and of righteousness, and of judgment... Howbeit when he, the Spirit of truth, is come, he will guide you into all truth...",
    commentary: "Describes the Spirit's vital work in convicting of sin, leading into all truth, and glorifying Christ."
  },
  {
    reference: "Acts 1:8",
    text: "But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.",
    commentary: "Promises divine power from the Holy Spirit to empower believers for global gospel witness."
  },
  {
    reference: "Acts 5:3",
    text: "But Peter said, Ananias, why hath Satan filled thine heart to lie to the Holy Ghost, and to keep back part of the price of the land?",
    commentary: "Affirms the deity and personality of the Holy Spirit (lying to the Holy Spirit is lying unto God)."
  },
  {
    reference: "Acts 10:38",
    text: "How God anointed Jesus of Nazareth with the Holy Ghost and with power: who went about doing good, and healing all that were oppressed of the devil; for God was with him.",
    commentary: "Highlights how Jesus ministered in the full power and anointing of the Holy Spirit."
  },
  {
    reference: "Romans 5:5",
    text: "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us.",
    commentary: "Reveals how the Holy Spirit fills believers' hearts with God's unconditional love and assurance."
  },
  {
    reference: "1 Corinthians 12:7–11",
    text: "But the manifestation of the Spirit is given to every man to profit withal. For to one is given by the Spirit the word of wisdom... But all these worketh that one and the selfsame Spirit, dividing to every man severally as he will.",
    commentary: "Explains how the Holy Spirit sovereignly bestows spiritual gifts upon every believer for the building up of the church."
  },
  {
    reference: "2 Corinthians 3:18",
    text: "But we all, with open face beholding as in a glass the glory of the Lord, are changed into the same image from glory to glory, even as by the Spirit of the Lord.",
    commentary: "Describes character transformation into Christ's image through the ongoing work of the Holy Spirit."
  },
  {
    reference: "2 Peter 1:21",
    text: "For the prophecy came not in old time by the will of man: but holy men of God spake as they were moved by the Holy Ghost.",
    commentary: "Affirms divine inspiration of Scripture: 'Men moved by the Holy Spirit spoke from God.'"
  }
];

export const SPIRIT_OUTLINE = [
  {
    title: "The Holy Spirit in the Trinity",
    content: [
      "The Holy Spirit is fully God and present in the Great Commission (Matt. 28:19).",
      "Active in Creation (“Spirit of God moved upon the waters”).",
      "Personal presence of God, sent as “Another Comforter”.",
      "The Spirit continues Christ’s ministry on earth."
    ]
  },
  {
    title: "The Spirit's Role in Inspiring Scripture",
    content: [
      "All Scripture is inspired by God; writers were moved by the Holy Spirit (“Men moved by the Holy Spirit spoke from God.” 2 Peter 1:21).",
      "David wrote “in the Spirit”.",
      "The Spirit guides interpretation of Scripture and leads into all truth."
    ]
  },
  {
    title: "Empowering Christ's Earthly Ministry",
    content: [
      "Jesus ministered through the Spirit’s power (“The Spirit of the Lord is upon Me.” Luke 4:18).",
      "The Spirit anointed Jesus at His baptism.",
      "Jesus healed, taught, and cast out demons through the Spirit.",
      "The Spirit empowered Christ’s earthly mission, and now empowers believers in the same way; Christ is our example of Spirit‑filled living."
    ]
  },
  {
    title: "How the Holy Spirit Ministers to Us",
    content: [
      "The Spirit was given to Christ’s followers at Pentecost; His presence is better than Christ’s physical presence.",
      "The Spirit convicts of sin and righteousness, reveals Christ’s holiness, leads to repentance, and begins spiritual growth.",
      "The Spirit leads into truth, gives correct understanding of Scripture, and reveals Christ in Scripture.",
      "The Spirit leads into peace and assurance (no condemnation in Christ, peace with God, joy, hope, and spiritual life)."
    ]
  },
  {
    title: "Interceding in Our Prayers",
    content: [
      "The Spirit intercedes when we don’t know what to pray.",
      "The Spirit aligns our prayers with God’s will.",
      "The Spirit helps all things work together for good."
    ]
  },
  {
    title: "Writing God's Law in Our Hearts",
    content: [
      "The Spirit dwells within believers and writes God’s law on the heart.",
      "Fills believers with God’s love and transforms character."
    ]
  },
  {
    title: "Empowerment to Testify of Christ",
    content: [
      "Strengthens the inner person and places Christ’s character in the heart.",
      "Produces Christlike living and reveals Christ through believers."
    ]
  },
  {
    title: "The Baptism of the Holy Spirit",
    content: [
      "Gives power to witness (Acts 1:8), promised by Jesus and fulfilled at Pentecost.",
      "Produces boldness and Christlike character; the same Spirit that raised Christ empowers believers.",
      "Requires surrender and sanctification, with a daily filling of the Spirit."
    ]
  },
  {
    title: "Receiving the Holy Spirit",
    content: [
      "God eagerly gives the Spirit (ask, seek, knock).",
      "Obedience prepares the heart; rely on the Spirit daily.",
      "The Spirit’s presence is seen through its fruit (Christlike thoughts, words, and actions).",
      "The Spirit brings freedom, healing, and hope."
    ]
  }
];

export const SPIRIT_PRETEST_QUESTIONS = [
  {
    id: "sp1",
    question: "According to 2 Peter 1:21, John 14:16–18, and the Doctrine Outline, what is the nature and divine role of the Holy Spirit?",
    options: [
      "A. The Holy Spirit is an impersonal force without emotion or divine status",
      "B. The Holy Spirit is fully God, co-eternal with the Father and Son, who inspires Scripture ('Men moved by the Holy Spirit spoke from God') and serves as Another Comforter",
      "C. The Holy Spirit is a created angel assigned to record human actions",
      "D. The Holy Spirit's ministry existed only during Old Testament times"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE HOLY SPIRIT AS PART OF THE TRINITY"
  },
  {
    id: "sp2",
    question: "Based on Luke 4:18, Acts 10:38, and the Doctrine Outline, how did the Holy Spirit interact with Jesus during His earthly ministry?",
    options: [
      "A. Jesus operated independently of the Holy Spirit during His earthly ministry",
      "B. The Holy Spirit anointed Jesus at His baptism, empowering His teaching, healing, and mission ('The Spirit of the Lord is upon Me')",
      "C. The Spirit came upon Jesus only at the moment of His crucifixion",
      "D. Jesus received the Holy Spirit after His resurrection from the dead"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE HOLY SPIRIT SUSTAINED JESUS IN HIS EARTHLY MINISTRY"
  },
  {
    id: "sp3",
    question: "According to John 16:7–13, Romans 5:5, and the Doctrine Outline, how does the Holy Spirit work in the heart of a believer?",
    options: [
      "A. The Spirit forces obedience without human repentance or consent",
      "B. The Spirit convicts of sin and righteousness, leads into all truth, sheds God's love in our hearts, and grants spiritual peace and assurance",
      "C. The Spirit isolates believers from reading Scripture",
      "D. The Spirit operates only through political leaders and worldly structures"
    ],
    correctAnswerIndex: 1,
    focusArea: "HOW THE HOLY SPIRIT WORKS WITH US"
  },
  {
    id: "sp4",
    question: "Based on 1 Corinthians 12:7–11, Acts 1:8, and the Doctrine Outline, what is the purpose of the baptism and gifts of the Holy Spirit?",
    options: [
      "A. To provide personal gain and earthly prestige to selected leaders",
      "B. To empower believers with boldness for witness, bestow spiritual gifts for building up the church, and produce Christlike character",
      "C. To replace the Bible with new contradictory revelations",
      "D. To eliminate the need for prayer and fellowship"
    ],
    correctAnswerIndex: 1,
    focusArea: "THE BAPTISM OF THE HOLY SPIRIT"
  },
  {
    id: "sp5",
    question: "According to 2 Corinthians 3:18, Romans 8:26, and the Doctrine Outline, how do believers receive and experience the Holy Spirit daily?",
    options: [
      "A. By asking, seeking, and surrendering daily, allowing the Spirit to intercede in prayer and transform character into Christ's image",
      "B. By performing rigid ritual sacrifices without faith",
      "C. By relying strictly on human willpower without divine assistance",
      "D. Receiving the Spirit occurs automatically once without any ongoing daily relationship"
    ],
    correctAnswerIndex: 0,
    focusArea: "RECEIVING THE HOLY SPIRIT"
  }
];

const shuffleQuestions = (questionsList = HOLY_SCRIPTURES_PRETEST_QUESTIONS) => {
  return questionsList.map((q) => {
    const correctOptionText = q.options[q.correctAnswerIndex];
    const cleanOptions = q.options.map(opt => opt.replace(/^[A-D]\.\s*/, ""));
    const cleanCorrectText = correctOptionText.replace(/^[A-D]\.\s*/, "");
    
    const shuffledClean = [...cleanOptions];
    for (let i = shuffledClean.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledClean[i], shuffledClean[j]] = [shuffledClean[j], shuffledClean[i]];
    }
    
    let correctIdx = 0;
    const shuffledOptionsWithLabels = shuffledClean.map((opt, idx) => {
      const prefix = ["A. ", "B. ", "C. ", "D. "][idx] || "";
      if (opt === cleanCorrectText) {
        correctIdx = idx;
      }
      return `${prefix}${opt}`;
    });

    return {
      id: q.id,
      question: q.question,
      options: shuffledOptionsWithLabels,
      correctAnswerIndex: correctIdx,
      focusArea: q.focusArea
    };
  });
};

export const LessonDetailPage: React.FC = () => {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const userName = user?.name || "Jeremy";

  const isFB = id === "fundamental-beliefs";
  const numId = parseInt(lessonId || "1", 10);
  const dbTrack = DEFAULT_DOCTRINE_TRACKS[id || ""] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];

  // Resolve active lesson structure
  const getActiveLesson = () => {
    if (isFB) {
      // Find matching Fundamental Belief
      const matched = FB_LESSONS.find((fb) => fb.number === numId);
      return matched || FB_LESSONS[0];
    } else {
      // Extract from outline sections
      const sections = dbTrack.outline?.sections || [];
      const secIdx = numId - 1;
      const sec = sections[secIdx] || sections[0];

      // Assemble matching supporting references
      const supporting = (dbTrack.key_references || []).filter((kr) =>
        (sec?.key_references || []).includes(kr.reference)
      ).map((kr) => ({
        reference: kr.reference,
        text: kr.text,
        commentary: "Deeply aligned proof text confirming this prophetic outline aspect."
      }));

      return {
        id: `lesson-${numId}`,
        number: numId,
        title: sec?.title || "Prophecy Outline Part",
        summary: sec?.summary || "",
        fullWording: sec?.summary || "",
        keyReferences: supporting.length > 0 ? supporting : (dbTrack.key_references || []).map(kr => ({
          reference: kr.reference,
          text: kr.text,
          commentary: "Key reference from this prophetic study track."
        })),
        outline: [
          {
            title: sec?.title || "Theological Study Core",
            summary: sec?.summary || "",
            key_references: sec?.key_references || []
          }
        ],
        active_recall_prompts: dbTrack.active_recall_prompts || []
      };
    }
  };

  const lesson = getActiveLesson();
  const trackTitle = getTrackTitle(id || "");
  const isHolyScriptures = lesson.title === "The Holy Scriptures" || (isFB && numId === 1);
  const isTrinity = lesson.title === "The Trinity" || (isFB && numId === 2);
  const isFather = lesson.title === "The Father" || (isFB && numId === 3);
  const isSon = lesson.title === "The Son" || (isFB && numId === 4);
  const isSpirit = lesson.title === "The Holy Spirit" || (isFB && numId === 5);
  const isInteractiveLesson = isHolyScriptures || isTrinity || isFather || isSon || isSpirit;

  const activeProofs = isSpirit ? SPIRIT_PROOFS : isSon ? SON_PROOFS : isFather ? FATHER_PROOFS : isTrinity ? TRINITY_PROOFS : HOLY_SCRIPTURES_PROOFS;
  const activePretestQuestions = isSpirit ? SPIRIT_PRETEST_QUESTIONS : isSon ? SON_PRETEST_QUESTIONS : isFather ? FATHER_PRETEST_QUESTIONS : isTrinity ? TRINITY_PRETEST_QUESTIONS : HOLY_SCRIPTURES_PRETEST_QUESTIONS;
  const activeOutline = isSpirit ? SPIRIT_OUTLINE : isSon ? SON_OUTLINE : isFather ? FATHER_OUTLINE : isTrinity ? TRINITY_OUTLINE : HOLY_SCRIPTURES_OUTLINE;
  const supportingSectionId = isSpirit ? "supportingScriptures_spirit" : isSon ? "supportingScriptures_son" : isFather ? "supportingScriptures_father" : isTrinity ? "supportingScriptures_trinity" : "detail-supporting-texts";
  const pretestSectionId = isSpirit ? "preAssessment_spirit" : isSon ? "preAssessment_son" : isFather ? "preAssessment_father" : isTrinity ? "preAssessment_trinity" : "holy-scriptures-pretest-section";
  const outlineSectionId = isSpirit ? "doctrineOutline_spirit" : isSon ? "doctrineOutline_son" : isFather ? "doctrineOutline_father" : isTrinity ? "doctrineOutline_trinity" : "detail-outline-section";

  // States for interactive module progression
  const [supportingScripturesCompleted, setSupportingScripturesCompleted] = useState<boolean>(false);
  const [isProofsOpen, setIsProofsOpen] = useState<boolean>(false); // Closed by default so it blinks green
  const [openProofIdx, setOpenProofIdx] = useState<number>(-1); // Closed initial state
  const [openedProofIndices, setOpenedProofIndices] = useState<number[]>([]); // Track opened verses so each verse blinks green until opened

  // Pre-Assessment states
  const [randomizedQuestions, setRandomizedQuestions] = useState(() => shuffleQuestions(activePretestQuestions));
  const [pretestSelectedAnswers, setPretestSelectedAnswers] = useState<Record<number, number>>({});
  const [pretestOpenIdx, setPretestOpenIdx] = useState<number>(0); // Question 1 open by default when uncollapsing
  const [pretestVerified, setPretestVerified] = useState<boolean>(false);
  const [pretestResultExpanded, setPretestResultExpanded] = useState<boolean>(true);
  const [pretestMainExpanded, setPretestMainExpanded] = useState<boolean>(false); // Starts CLOSED by default!

  // Outline states
  const [unlockedOutlineIdx, setUnlockedOutlineIdx] = useState<number>(0);
  const [expandedOutlineIdx, setExpandedOutlineIdx] = useState<number>(-1); // currently expanded outline card index
  const [outlineCompleted, setOutlineCompleted] = useState<boolean>(false);

  // States for Elder Steven Virtual Mentor Guidance
  const [stevenStage, setStevenStage] = useState<'welcome' | 'scriptures' | 'scriptures_complete' | 'pretest' | 'pretest_complete' | 'outline_intro' | 'outline_unlocked_0' | 'outline_unlocked_1' | 'outline_unlocked_2' | 'outline_unlocked_3' | 'outline_unlocked_4' | 'outline_unlocked_5' | 'outline_unlocked_6' | 'outline_unlocked_7' | 'outline_unlocked_8' | 'outline_0' | 'outline_1' | 'outline_2' | 'outline_3' | 'outline_4' | 'outline_5' | 'outline_6' | 'outline_7' | 'outline_8' | 'teach_ready' | 'explain_doctrine'>('welcome');

  useEffect(() => {
    const newQuestions = isSpirit ? SPIRIT_PRETEST_QUESTIONS : isSon ? SON_PRETEST_QUESTIONS : isFather ? FATHER_PRETEST_QUESTIONS : isTrinity ? TRINITY_PRETEST_QUESTIONS : HOLY_SCRIPTURES_PRETEST_QUESTIONS;
    setRandomizedQuestions(shuffleQuestions(newQuestions));
    setSupportingScripturesCompleted(false);
    setIsProofsOpen(false);
    setOpenProofIdx(-1);
    setOpenedProofIndices([]);
    setPretestSelectedAnswers({});
    setPretestOpenIdx(0);
    setPretestVerified(false);
    setPretestResultExpanded(true);
    setPretestMainExpanded(false);
    setUnlockedOutlineIdx(0);
    setExpandedOutlineIdx(-1);
    setOutlineCompleted(false);
    setStevenStage('welcome');
  }, [numId, id, isTrinity, isFather, isSon, isSpirit]);

  useEffect(() => {
    if (!isInteractiveLesson) return;
    if (stevenStage === 'explain_doctrine') return; // Preserve active explain mode
    if (stevenStage === 'pretest_complete') return; // Preserve active pretest complete results feedback until user closes card or advances
    if (outlineCompleted) {
      setStevenStage('teach_ready');
    } else if (expandedOutlineIdx >= 0 && expandedOutlineIdx < activeOutline.length) {
      setStevenStage(`outline_${expandedOutlineIdx}` as any);
    } else if (pretestVerified && !pretestMainExpanded) {
      setStevenStage(`outline_unlocked_${unlockedOutlineIdx}` as any);
    } else if (pretestMainExpanded) {
      if (pretestVerified) {
        setStevenStage('pretest_complete');
      } else {
        setStevenStage('pretest');
      }
    } else if (supportingScripturesCompleted) {
      setStevenStage('scriptures_complete');
    } else if (isProofsOpen) {
      setStevenStage('scriptures');
    } else {
      setStevenStage('welcome');
    }
  }, [isInteractiveLesson, isProofsOpen, supportingScripturesCompleted, pretestMainExpanded, pretestVerified, expandedOutlineIdx, unlockedOutlineIdx, outlineCompleted]);

  const toggleProofCard = (idx: number) => {
    if (openProofIdx === idx) {
      setOpenProofIdx(-1);
    } else {
      setOpenProofIdx(idx); // Auto-closes previous text!
      if (!openedProofIndices.includes(idx)) {
        setOpenedProofIndices((prev) => [...prev, idx]);
      }
    }
  };

  const handleConfirmFinalProof = () => {
    setSupportingScripturesCompleted(true);
    setOpenProofIdx(-1);
    setIsProofsOpen(false); // Closes Supporting Scriptures section automatically in place
    setPretestMainExpanded(true); // Pre-Assessment section unlocks & opens
    setPretestOpenIdx(0); // Automatically opens question 1
    setStevenStage("pretest");
    autoScrollToSection(pretestSectionId, 250);
  };

  const getElderStevenSectionTitle = () => {
    if (isSpirit) {
      const titles: Record<string, string> = {
        welcome: "Fundamental Belief 5: The Holy Spirit",
        scriptures: "Step 1 — Supporting Scriptures",
        scriptures_complete: "Step 1 — Supporting Scriptures Completed",
        pretest: "Step 2 — Pre-Assessment Diagnostic",
        pretest_complete: "Step 2 — Pre-Assessment Diagnostic Results",
        outline_intro: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_0: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_1: "Step 3 — Doctrinal Outline 2 Unlocked",
        outline_unlocked_2: "Step 3 — Doctrinal Outline 3 Unlocked",
        outline_unlocked_3: "Step 3 — Doctrinal Outline 4 Unlocked",
        outline_unlocked_4: "Step 3 — Doctrinal Outline 5 Unlocked",
        outline_unlocked_5: "Step 3 — Doctrinal Outline 6 Unlocked",
        outline_unlocked_6: "Step 3 — Doctrinal Outline 7 Unlocked",
        outline_unlocked_7: "Step 3 — Doctrinal Outline 8 Unlocked",
        outline_unlocked_8: "Step 3 — Doctrinal Outline 9 Unlocked",
        outline_0: "Doctrine Outline 1: The Holy Spirit in the Trinity",
        outline_1: "Doctrine Outline 2: The Spirit's Role in Inspiring Scripture",
        outline_2: "Doctrine Outline 3: Empowering Christ's Earthly Ministry",
        outline_3: "Doctrine Outline 4: How the Holy Spirit Ministers to Us",
        outline_4: "Doctrine Outline 5: Interceding in Our Prayers",
        outline_5: "Doctrine Outline 6: Writing God's Law in Our Hearts",
        outline_6: "Doctrine Outline 7: Empowerment to Testify of Christ",
        outline_7: "Doctrine Outline 8: The Baptism of the Holy Spirit",
        outline_8: "Doctrine Outline 9: Receiving the Holy Spirit",
        teach_ready: "Step 4 — Teach It & Recall",
        explain_doctrine: "Explain the Doctrine with AI"
      };
      return titles[stevenStage] || "Fundamental Belief 5: The Holy Spirit";
    }

    if (isSon) {
      const titles: Record<string, string> = {
        welcome: "Fundamental Belief 4: God the Son",
        scriptures: "Step 1 — Supporting Scriptures",
        scriptures_complete: "Step 1 — Supporting Scriptures Completed",
        pretest: "Step 2 — Pre-Assessment Diagnostic",
        pretest_complete: "Step 2 — Pre-Assessment Diagnostic Results",
        outline_intro: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_0: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_1: "Step 3 — Doctrinal Outline 2 Unlocked",
        outline_unlocked_2: "Step 3 — Doctrinal Outline 3 Unlocked",
        outline_unlocked_3: "Step 3 — Doctrinal Outline 4 Unlocked",
        outline_unlocked_4: "Step 3 — Doctrinal Outline 5 Unlocked",
        outline_unlocked_5: "Step 3 — Doctrinal Outline 6 Unlocked",
        outline_unlocked_6: "Step 3 — Doctrinal Outline 7 Unlocked",
        outline_unlocked_7: "Step 3 — Doctrinal Outline 8 Unlocked",
        outline_0: "Doctrine Outline 1: The Identity of God the Son",
        outline_1: "Doctrine Outline 2: Jesus Christ Our Creator",
        outline_2: "Doctrine Outline 3: The Incarnation of Jesus Christ",
        outline_3: "Doctrine Outline 4: Jesus Christ Our Savior & Messiah",
        outline_4: "Doctrine Outline 5: Salvation Through Christ's Sacrifice",
        outline_5: "Doctrine Outline 6: Jesus Christ Our Heavenly Advocate",
        outline_6: "Doctrine Outline 7: The Second Coming of Christ",
        outline_7: "Doctrine Outline 8: The Power of His Life & Resurrection",
        teach_ready: "Step 4 — Teach It & Recall",
        explain_doctrine: "Explain the Doctrine with AI"
      };
      return titles[stevenStage] || "Fundamental Belief 4: God the Son";
    }

    if (isFather) {
      const titles: Record<string, string> = {
        welcome: "Fundamental Belief 3: The Father",
        scriptures: "Step 1 — Supporting Scriptures",
        scriptures_complete: "Step 1 — Supporting Scriptures Completed",
        pretest: "Step 2 — Pre-Assessment Diagnostic",
        pretest_complete: "Step 2 — Pre-Assessment Diagnostic Results",
        outline_intro: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_0: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_1: "Step 3 — Doctrinal Outline 2 Unlocked",
        outline_unlocked_2: "Step 3 — Doctrinal Outline 3 Unlocked",
        outline_unlocked_3: "Step 3 — Doctrinal Outline 4 Unlocked",
        outline_unlocked_4: "Step 3 — Doctrinal Outline 5 Unlocked",
        outline_0: "Doctrine Outline 1: Biblical Revelation of the Father",
        outline_1: "Doctrine Outline 2: Creator and Sustainer of Life",
        outline_2: "Doctrine Outline 3: The Character of God",
        outline_3: "Doctrine Outline 4: Fearing God & Giving Him Glory",
        outline_4: "Doctrine Outline 5: How God Relates to His Children",
        teach_ready: "Step 4 — Teach It & Recall",
        explain_doctrine: "Explain the Doctrine with AI"
      };
      return titles[stevenStage] || "Fundamental Belief 3: The Father";
    }

    if (isTrinity) {
      const titles: Record<string, string> = {
        welcome: "Fundamental Belief 2: The Trinity",
        scriptures: "Step 1 — Supporting Scriptures",
        scriptures_complete: "Step 1 — Supporting Scriptures Completed",
        pretest: "Step 2 — Pre-Assessment Diagnostic",
        pretest_complete: "Step 2 — Pre-Assessment Diagnostic Results",
        outline_intro: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_0: "Step 3 — Doctrinal Outline 1 Unlocked",
        outline_unlocked_1: "Step 3 — Doctrinal Outline 2 Unlocked",
        outline_unlocked_2: "Step 3 — Doctrinal Outline 3 Unlocked",
        outline_unlocked_3: "Step 3 — Doctrinal Outline 4 Unlocked",
        outline_unlocked_4: "Step 3 — Doctrinal Outline 5 Unlocked",
        outline_unlocked_5: "Step 3 — Doctrinal Outline 6 Unlocked",
        outline_unlocked_6: "Step 3 — Doctrinal Outline 7 Unlocked",
        outline_0: "Doctrine Outline 1: The Unity of the Godhead",
        outline_1: "Doctrine Outline 2: The Distinct Persons",
        outline_2: "Doctrine Outline 3: The Co‑Eternal Nature",
        outline_3: "Doctrine Outline 4: The Roles of the Father, Son, and Spirit",
        outline_4: "Doctrine Outline 5: The Trinity in Scripture",
        outline_5: "Doctrine Outline 6: The Trinity in Salvation",
        outline_6: "Doctrine Outline 7: The Mystery of the Godhead",
        teach_ready: "Step 4 — Teach It & Recall",
        explain_doctrine: "Explain the Doctrine with AI"
      };
      return titles[stevenStage] || "Fundamental Belief 2: The Trinity";
    }

    const titles: Record<string, string> = {
      welcome: "Fundamental Belief 1: The Holy Scriptures",
      scriptures: "Step 1 — Supporting Scriptures",
      scriptures_complete: "Step 1 — Supporting Scriptures Completed",
      pretest: "Step 2 — Pre-Assessment Diagnostic",
      pretest_complete: "Step 2 — Pre-Assessment Diagnostic Results",
      outline_intro: "Step 3 — Doctrinal Outline 1 Unlocked",
      outline_unlocked_0: "Step 3 — Doctrinal Outline 1 Unlocked",
      outline_unlocked_1: "Step 3 — Doctrinal Outline 2 Unlocked",
      outline_unlocked_2: "Step 3 — Doctrinal Outline 3 Unlocked",
      outline_unlocked_3: "Step 3 — Doctrinal Outline 4 Unlocked",
      outline_0: "Doctrine Outline 1: Written by Divine Inspiration",
      outline_1: "Doctrine Outline 2: Supreme Standard of Truth and Character",
      outline_2: "Doctrine Outline 3: The Revelation of God's Will",
      outline_3: "Doctrine Outline 4: A Timeless, Relevant Message",
      teach_ready: "Step 4 — Teach It & Recall",
      explain_doctrine: "Explain the Doctrine with AI"
    };
    return titles[stevenStage] || "Fundamental Belief 1: The Holy Scriptures";
  };

  const getElderStevenDialogue = () => {
    if (stevenStage === 'pretest_complete') {
      const correctCount = randomizedQuestions.reduce(
        (acc, q, idx) => (pretestSelectedAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc),
        0
      );
      const scorePercent = Math.round((correctCount / randomizedQuestions.length) * 100);

      if (scorePercent === 100) {
        return `Congratulations, 100%! Very well done. You have shown exceptional insight into this doctrine.`;
      } else {
        const missedAreas = new Set<string>();
        randomizedQuestions.forEach((q, idx) => {
          if (pretestSelectedAnswers[idx] !== q.correctAnswerIndex) {
            missedAreas.add(q.focusArea);
          }
        });
        const focusAreasList = Array.from(missedAreas).join(", ");
        const recommendedSentence = `Based on your missed questions, we recommend focusing on these doctrinal outline sections below: ${focusAreasList}.`;

        return `You achieved a score of ${scorePercent}%.\n\nDon’t be discouraged. Review the key points and continue growing.\n\n${recommendedSentence}`;
      }
    }

    if (isSpirit) {
      const dialogues: Record<string, string> = {
        welcome: `Welcome, ${userName}. Let us begin our study on Lesson Five of Bible Fundamentals: The Holy Spirit.\n\n**Official Doctrinal Statement**:\n“God the eternal Spirit was active with the Father and the Son in Creation, incarnation, and redemption. He is fully personal, inspires Scripture, empowers Christ’s life, convicts humanity, renews believers, gives spiritual gifts, empowers witness, and leads God’s people into all truth.”\n\nThis doctrinal statement forms the foundation of our understanding of the Holy Spirit's divine personality, inspiration, and empowering presence.\n\nNow, click on Step One to open the Supporting Scriptures.`,

        scriptures: `**Supporting Scriptures — The Holy Spirit**\n\nGod the eternal Spirit is revealed throughout Scripture as fully God, active in Creation, inspiring holy writers, empowering Christ, and indwelling believers. Examine each supporting scripture proof text below.`,

        scriptures_complete: `**Supporting Scriptures Completed**\n\nAll key proof texts for The Holy Spirit have been examined.\n\nThe Pre-Assessment Diagnostic is now unlocked below. Click on the Pre-Assessment to test active recall.`,

        pretest: `**Pre-Assessment Diagnostic — The Holy Spirit**\n\nThis is a low-pressure diagnostic baseline to test your active recall on the doctrine of The Holy Spirit.\n\nSelect answers for all 5 questions and click "Finish Pre-Assessment & Verify Recall" when finished.`,

        outline_intro: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_unlocked_0: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_1: `You have unlocked Doctrine Outline 2, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_2: `You have unlocked Doctrine Outline 3, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_3: `You have unlocked Doctrine Outline 4, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_4: `You have unlocked Doctrine Outline 5, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_5: `You have unlocked Doctrine Outline 6, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_6: `You have unlocked Doctrine Outline 7, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_7: `You have unlocked Doctrine Outline 8, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_8: `You have unlocked Doctrine Outline 9, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_0: `The Holy Spirit in the Trinity. Learn how the Spirit is fully God, present in the Great Commission, and continues Christ's ministry on earth. Click Continue when you’re finished.`,
        outline_1: `The Spirit's Role in Inspiring Scripture. Understand how 'men moved by the Holy Spirit spoke from God' and how the Spirit guides interpretation. Click Continue when you’re finished.`,
        outline_2: `Empowering Christ's Earthly Ministry. Discover how 'the Spirit of the Lord is upon Me' empowered Christ's mission. Click Continue when you’re finished.`,
        outline_3: `How the Holy Spirit Ministers to Us. Examine conviction, repentance, guidance into truth, and spiritual peace. Click Continue when you’re finished.`,
        outline_4: `Interceding in Our Prayers. Learn how the Spirit intercedes for us and aligns prayers with God's will. Click Continue when you’re finished.`,
        outline_5: `Writing God's Law in Our Hearts. Understand character transformation and the indwelling Spirit. Click Continue when you’re finished.`,
        outline_6: `Empowerment to Testify of Christ. Discover how the Spirit strengthens the inner person to produce Christlike witness. Click Continue when you’re finished.`,
        outline_7: `The Baptism of the Holy Spirit. Examine the promise of Pentecost, divine power for witness, and daily surrender. Click Continue when you’re finished.`,
        outline_8: `Receiving the Holy Spirit. Understand asking, seeking, obeying, and bearing the fruit of the Spirit. Click Finish to complete the outline.`,

        teach_ready: `**Doctrinal Outline Completed — The Holy Spirit**\n\nThe systematic study for The Holy Spirit is now complete.\n\nChoose a study path below to practice memorization or explain the doctrine in your own words.`,

        explain_doctrine: `**Explain the Doctrine — The Holy Spirit**\n\nPlease explain the doctrine of The Holy Spirit in your own words. Summarize His deity, inspiration of Scripture, anointing of Christ, conviction, spiritual gifts, and daily indwelling.`
      };

      return dialogues[stevenStage] || dialogues.welcome;
    }

    if (isSon) {
      const dialogues: Record<string, string> = {
        welcome: `Welcome, ${userName}. Let us begin our study on Lesson Four of Bible Fundamentals: God the Son.\n\n**Official Doctrinal Statement**:\n“God the eternal Son became incarnate in Jesus Christ. Through Him all things were created, the character of God is revealed, the salvation of humanity is accomplished, and the world is judged. Forever truly God, He became also truly human. He lived, was tempted, died for our sins, rose again, ascended to heaven, ministers for us, and will return in glory to restore all things.”\n\nThis doctrinal statement forms the foundation of our faith in Jesus Christ as our Creator, Savior, Advocate, and returning King.\n\nNow, click on Step One to open the Supporting Scriptures.`,

        scriptures: `**Supporting Scriptures — God the Son**\n\nGod the eternal Son is revealed throughout Scripture as fully God, fully man, Creator, Savior, and Advocate. Examine each supporting scripture proof text below.`,

        scriptures_complete: `**Supporting Scriptures Completed**\n\nAll key proof texts for God the Son have been examined.\n\nThe Pre-Assessment Diagnostic is now unlocked below. Click on the Pre-Assessment to test active recall.`,

        pretest: `**Pre-Assessment Diagnostic — God the Son**\n\nThis is a low-pressure diagnostic baseline to test your active recall on the doctrine of God the Son.\n\nSelect answers for all 5 questions and click "Finish Pre-Assessment & Verify Recall" when finished.`,

        outline_intro: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_unlocked_0: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_1: `You have unlocked Doctrine Outline 2, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_2: `You have unlocked Doctrine Outline 3, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_3: `You have unlocked Doctrine Outline 4, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_4: `You have unlocked Doctrine Outline 5, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_5: `You have unlocked Doctrine Outline 6, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_6: `You have unlocked Doctrine Outline 7, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_7: `You have unlocked Doctrine Outline 8, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_0: `The Identity of God the Son. Learn how Jesus is the eternal Son of God, co-eternal with the Father, and fully divine. Click Continue when you’re finished.`,
        outline_1: `Jesus Christ Our Creator. Discover how all things were created through Him. Click Continue when you’re finished.`,
        outline_2: `The Incarnation of Jesus Christ. Understand the incarnation of Jesus as fully God and fully man. Click Continue when you’re finished.`,
        outline_3: `Jesus Christ Our Savior & Messiah. Examine how Jesus was tempted without sin and came to save the lost. Click Continue when you’re finished.`,
        outline_4: `Salvation Through Christ's Sacrifice. Understand His voluntary sacrifice and resurrection. Click Continue when you’re finished.`,
        outline_5: `Jesus Christ Our Heavenly Advocate. Learn how Jesus ministers for us in heaven and pleads His sacrifice. Click Continue when you’re finished.`,
        outline_6: `The Second Coming of Christ. Examine the promise of His second coming and the resurrection of believers. Click Continue when you’re finished.`,
        outline_7: `The Power of His Life & Resurrection. Understand how faith in Jesus empowers us and brings eternal life. Click Finish to complete the outline.`,

        teach_ready: `**Doctrinal Outline Completed — God the Son**\n\nThe systematic study for God the Son is now complete.\n\nChoose a study path below to practice memorization or explain the doctrine in your own words.`,

        explain_doctrine: `**Explain the Doctrine — God the Son**\n\nPlease explain the doctrine of God the Son in your own words. Summarize His deity, incarnation, creation, sacrifice, advocacy, and second coming.`
      };

      return dialogues[stevenStage] || dialogues.welcome;
    }

    if (isFather) {
      const dialogues: Record<string, string> = {
        welcome: `Welcome, ${userName}. Let us begin our study on Lesson Three of Bible Fundamentals: The Father.\n\n**Official Doctrinal Statement**:\n“God the eternal Father is the Creator, Source, Sustainer, and Sovereign of all creation. He is just and holy, merciful and gracious, slow to anger, and abounding in steadfast love and faithfulness. The qualities and powers exhibited in the Son and the Holy Spirit are also those of the Father.”\n\nThis doctrinal statement forms the foundation of our understanding of God's sovereign care and loving character.\n\nNow, click on Step One to open the Supporting Scriptures.`,

        scriptures: `**Supporting Scriptures — The Father**\n\nGod the Father is revealed throughout Scripture as Creator, Sustainer, and loving Father to humanity. Examine each supporting scripture proof text below.`,

        scriptures_complete: `**Supporting Scriptures Completed**\n\nAll key proof texts for The Father have been examined.\n\nThe Pre-Assessment Diagnostic is now unlocked below. Click on the Pre-Assessment to test active recall.`,

        pretest: `**Pre-Assessment Diagnostic — The Father**\n\nThis is a low-pressure diagnostic baseline to test your active recall on the doctrine of The Father.\n\nSelect answers for all 5 questions and click "Finish Pre-Assessment & Verify Recall" when finished.`,

        outline_intro: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_unlocked_0: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_1: `You have unlocked Doctrine Outline 2, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_2: `You have unlocked Doctrine Outline 3, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_3: `You have unlocked Doctrine Outline 4, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_4: `You have unlocked Doctrine Outline 5, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_0: `Biblical Revelation of the Father. Learn how God is our Father in Heaven, Father of the fatherless, and Father of Jesus. Click Continue when you’re finished.`,
        outline_1: `Creator and Sustainer of Life. Understand how God created humanity in His image and sustains all life. Click Continue when you’re finished.`,
        outline_2: `The Character of God. Discover the ten attributes of God's character revealed in Scripture. Click Continue when you’re finished.`,
        outline_3: `Fearing God & Giving Him Glory. Examine reverence, obedience, submission, and worship. Click Continue when you’re finished.`,
        outline_4: `How God Relates to His Children. Understand how God listens, helps, comforts, heals, forgives, and guides. Click Finish to complete the outline.`,

        teach_ready: `**Doctrinal Outline Completed — The Father**\n\nThe systematic study for The Father is now complete.\n\nChoose a study path below to practice memorization or explain the doctrine in your own words.`,

        explain_doctrine: `**Explain the Doctrine — The Father**\n\nPlease explain the doctrine of The Father in your own words. Summarize His creation, character, sovereign care, and relationship with us as His children.`
      };

      return dialogues[stevenStage] || dialogues.welcome;
    }

    if (isTrinity) {
      const dialogues: Record<string, string> = {
        welcome: `Welcome, ${userName}. Let us begin our study on Lesson Two of Bible Fundamentals: The Trinity.\n\n**Official Doctrinal Statement**:\n“There is one God: Father, Son, and Holy Spirit — a unity of three coeternal Persons. God is immortal, all‑powerful, all‑knowing, above all, and ever‑present. He is infinite and beyond human comprehension, yet known through His self‑revelation. God, who is love, is forever worthy of worship, adoration, and service by all creation.”\n\nWhile the word ‘trinity’ may not be in the Bible, the concept of this three‑in‑one Godhead is expressed in many places throughout the Bible. God the Father, God the Son, and God the Holy Spirit work together in ways that a human team would never be able to for a common goal.\n\nNow, click on Step One to open the Supporting Scriptures.`,

        scriptures: `**Supporting Scriptures — The Trinity**\n\nThe Triune Godhead is revealed throughout Scripture from Genesis to Revelation. Examine each supporting scripture proof text below to understand how Father, Son, and Holy Spirit operate in eternal unity.`,

        scriptures_complete: `**Supporting Scriptures Completed**\n\nAll key proof texts for The Trinity have been examined.\n\nThe Pre-Assessment Diagnostic is now unlocked below. Click on the Pre-Assessment to test active recall.`,

        pretest: `**Pre-Assessment Diagnostic — The Trinity**\n\nThis is a low-pressure diagnostic baseline to test your active recall on the Trinity.\n\nSelect answers for all 5 questions and click "Finish Pre-Assessment & Verify Recall" when finished.`,

        outline_intro: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_unlocked_0: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_1: `You have unlocked Doctrine Outline 2, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_2: `You have unlocked Doctrine Outline 3, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_3: `You have unlocked Doctrine Outline 4, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_4: `You have unlocked Doctrine Outline 5, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_5: `You have unlocked Doctrine Outline 6, ‘Please read each doctrinal section carefully and click Finish to continue.’`,
        outline_unlocked_6: `You have unlocked Doctrine Outline 7, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

        outline_0: `The Unity of the Godhead. This section explains that there is one God in three coeternal Persons. Click Continue when you’re finished.`,
        outline_1: `The Distinct Persons. This section highlights that the Father, Son, and Holy Spirit are each fully divine. Click Continue when you’re finished.`,
        outline_2: `The Co‑Eternal Nature. This section explains that all three Persons have always existed without beginning. Click Continue when you’re finished.`,
        outline_3: `The Roles of the Father, Son, and Spirit. Learn how the Father initiates, the Son redeems, and the Spirit sanctifies. Click Continue when you’re finished.`,
        outline_4: `The Trinity in Scripture. Examine key Bible moments like Creation, Jesus' baptism, and the Great Commission. Click Continue when you’re finished.`,
        outline_5: `The Trinity in Salvation. Understand how the Father, Son, and Holy Spirit work together in perfect harmony to save us. Click Continue when you’re finished.`,
        outline_6: `The Mystery of the Godhead. Recognize that while God is infinite, He reveals Himself in love. Please read carefully and click Finish to complete the outline.`,

        teach_ready: `**Doctrinal Outline Completed — The Trinity**\n\nThe systematic study for The Trinity is now complete.\n\nChoose a study path below to practice memorization or explain the doctrine in your own words.`,

        explain_doctrine: `**Explain the Doctrine — The Trinity**\n\nPlease explain the doctrine of The Trinity in your own words. Summarize the co-eternal unity of Father, Son, and Holy Spirit, their roles in salvation, and their revelation in Scripture.`
      };

      return dialogues[stevenStage] || dialogues.welcome;
    }

    const dialogues: Record<string, string> = {
      welcome: `Welcome, ${userName}. Let us begin our study on Lesson One of Bible Fundamentals: The Holy Scriptures.\n\n**Official Doctrinal Statement**:\n“The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration. The inspired authors spoke and wrote as they were moved by the Holy Spirit. In this Word, God has committed to humanity the knowledge necessary for salvation. The Holy Scriptures are the supreme, authoritative, and infallible revelation of His will. They are the standard of character, the test of experience, the definitive revealer of doctrines, and the trustworthy record of God's acts in history.”\n\nThis official doctrinal statement is vital because God's Word forms the foundation of our entire study and provides our supreme authority for faith and living.\n\nNow, click on Step One to open the Supporting Scriptures.`,

      scriptures: `**Supporting Scriptures**\n\nThe Bible is God's inspired word, written by holy men as they were moved by the Holy Spirit. Scriptural proofs are essential because they reveal Jesus Christ, ground our doctrines in Sola Scriptura, and safeguard us against deception in these last days.\n\nExamine each supporting scripture proof text below.`,

      scriptures_complete: `**Supporting Scriptures Completed**\n\nAll key proof texts have been carefully examined.\n\nThe Pre-Assessment Diagnostic is now unlocked below. Click on the Pre-Assessment to test active recall.`,

      pretest: `**Pre-Assessment Diagnostic**\n\nThis is a low-pressure diagnostic baseline to strengthen memory retention.\n\nSelect answers for all 5 questions and click "Finish Pre-Assessment & Verify Recall" when finished.`,

      outline_intro: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

      outline_unlocked_0: `You have unlocked Doctrine Outline 1, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

      outline_unlocked_1: `You have unlocked Doctrine Outline 2, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

      outline_unlocked_2: `You have unlocked Doctrine Outline 3, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

      outline_unlocked_3: `You have unlocked Doctrine Outline 4, ‘Please read each doctrinal section carefully and click Finish to continue.’`,

      outline_0: `The Holy Scriptures are Written by Divine Inspiration. This section explains that the Bible was inspired by God and written through many different people. Click Continue when you’re finished.`,

      outline_1: `The Holy Scriptures are the Supreme Standard of Truth and Character. This section explains why the Bible is the highest authority for truth and godly living. Click Continue when you’re finished.`,

      outline_2: `The Holy Scriptures are the Revelation of God's Will. Read the outline carefully to understand this wonderful truth. Click Continue when you’re finished.`,

      outline_3: `The Holy Scriptures are a timeless, relevant message for us today. Please read carefully and click Finish to progress to the next level.`,

      teach_ready: `**Doctrinal Outline Completed**\n\nThe systematic study for the Holy Scriptures is now complete.\n\nChoose a study path below to practice memorization or explain the doctrine in your own words.`,

      explain_doctrine: `**Explain the Doctrine**\n\nPlease explain the doctrine of the Holy Scriptures in your own words. Summarize its divine inspiration, supreme authority, and practical relevance to daily life.`
    };

    return dialogues[stevenStage] || dialogues.welcome;
  };

  const handleToggleSection = (idx: number) => {
    if (!pretestVerified || idx > unlockedOutlineIdx) return; // Locked!
    if (expandedOutlineIdx === idx) {
      setExpandedOutlineIdx(-1);
      setStevenStage(`outline_unlocked_${idx}` as any);
    } else {
      setExpandedOutlineIdx(idx);
      setStevenStage(`outline_${idx}` as any);
    }
  };

  const handleCompleteSection = (idx: number) => {
    if (idx < activeOutline.length - 1) {
      const nextIdx = idx + 1;
      setUnlockedOutlineIdx(nextIdx);
      setExpandedOutlineIdx(nextIdx); // Expand next outline automatically and keep in view
      setStevenStage(`outline_${nextIdx}` as any);
    } else {
      setExpandedOutlineIdx(-1);
      setUnlockedOutlineIdx(activeOutline.length); // completed all
      setOutlineCompleted(true);
      setStevenStage('teach_ready');
      autoScrollToSection(isSpirit || isSon || isFather || isTrinity ? "nextLesson" : "holy-scriptures-teach-recall-block", 250);
    }
  };

  const closeCurrentQuestion = () => {
    setPretestOpenIdx(-1);
  };

  const openNextQuestion = (currentIndex: number) => {
    if (currentIndex < 4) {
      const nextIdx = currentIndex + 1;
      setPretestOpenIdx(nextIdx);
      // Rule 2 & 5: Disable auto-scroll for nested questions inside Pre-Assessment to keep viewport stable
    } else {
      setPretestOpenIdx(-1);
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    if (pretestVerified) return;
    setPretestSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
    setTimeout(() => {
      openNextQuestion(questionIndex);
    }, 150);
  };

  const handleToggleQuestion = (index: number) => {
    if (pretestOpenIdx === index) {
      setPretestOpenIdx(-1);
    } else {
      setPretestOpenIdx(index);
      // Rule 2 & 5: Disable auto-scroll for nested questions inside Pre-Assessment to keep viewport stable
    }
  };

  // Safe scripture routing to STBA Study Mode
  const handleScriptureClick = (reference: string) => {
    localStorage.setItem("stba_pending_search_ref", reference);
    navigate(`/stba?ref=${encodeURIComponent(reference)}`);
  };

  return (
    <div className="w-full text-left space-y-6 animate-fade-in" id="lesson-detail-viewport">
      {/* Back button */}
      <button
        onClick={() => navigate(`/tracks/${id}/lessons`)}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C9973A] hover:text-[#1C2333] transition-colors cursor-pointer group"
        id="detail-back-to-selector-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-all" />
        <span>Back to Lesson List</span>
      </button>

      {/* Lesson Header Title */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9973A] font-bold">
          {trackTitle} — Lesson #{lesson.number}
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-[#D4AF37] font-black tracking-tight" id="detail-lesson-title">
          {lesson.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Main Content Pane */}
        <div className="lg:col-span-2 space-y-6">
          {/* FULL BELIEF WORDING CARD */}
          <div className="bg-[#FDFAF5] border border-[#E8DDC6] p-6 rounded-2xl space-y-3.5 shadow-3xs" id="detail-doctrinal-statement">
            <h2 className="font-serif text-xs font-bold uppercase tracking-wider text-[#C9973A] border-b border-[#E8DDC6]/50 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Official Doctrinal Statement</span>
            </h2>
            <p className="text-[#1C2333] font-sans text-sm md:text-base leading-relaxed">
              “{lesson.fullWording}”
            </p>
          </div>

          {/* SUPPORTING TEXTS SECTION */}
          {isInteractiveLesson ? (
            <div className="space-y-4" id={supportingSectionId}>
              <div
                className={`rounded-2xl overflow-hidden shadow-3xs transition-all duration-300 ${
                  !isProofsOpen && !supportingScripturesCompleted
                    ? "bg-[#FDFAF5] border-2 border-emerald-500 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse"
                    : "bg-[#FDFAF5] border border-[#E8DDC6]"
                }`}
                id={`${supportingSectionId}-accordion`}
              >
                {/* Header Area / Toggle Button */}
                <button
                  onClick={() => {
                    const next = !isProofsOpen;
                    setIsProofsOpen(next);
                    if (next) {
                      autoScrollToSection(supportingSectionId);
                    }
                  }}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-[#FDFAF5]/60 transition-colors cursor-pointer group focus:outline-none"
                  aria-expanded={isProofsOpen}
                  id={`${supportingSectionId}.header`}
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <BookMarked className="w-5 h-5 text-[#C9973A] shrink-0" />
                    <h3 className="font-serif font-black text-sm md:text-base text-[#1C2333] tracking-tight group-hover:text-[#C9973A] transition-colors">
                      Supporting Scriptures & Proofs
                    </h3>
                    {!supportingScripturesCompleted && (
                      <span className="text-[10px] font-mono text-white bg-emerald-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                        Step 1 — Unlocked
                      </span>
                    )}
                    {supportingScripturesCompleted && (
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="shrink-0">
                    <ChevronRight
                      className={`w-5 h-5 text-[#C9973A] transition-transform duration-200 ${
                        isProofsOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded supporting scriptures inside card */}
                <AnimatePresence initial={false}>
                  {isProofsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="border-t border-[#E8DDC6]/40 bg-white p-5 space-y-5">
                        <div className="grid grid-cols-1 gap-4">
                          {activeProofs.map((proof, idx) => {
                            const isProofOpen = openProofIdx === idx;
                            const isFinalProof = idx === activeProofs.length - 1;
                            const isBlinkingGreen = !supportingScripturesCompleted && isProofsOpen && !openedProofIndices.includes(idx) && !isProofOpen;
                            return (
                              <div
                                key={idx}
                                className={`border rounded-2xl overflow-hidden transition-all shadow-3xs ${
                                  isProofOpen
                                    ? "bg-white border-[#C9973A] ring-1 ring-[#C9973A]/30"
                                    : isBlinkingGreen
                                    ? "bg-emerald-50/70 border-2 border-emerald-500 ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] animate-pulse"
                                    : "bg-[#FDFAF5]/40 border-[#E8DDC6]"
                                }`}
                                id={`${supportingSectionId}-proof-${idx}`}
                              >
                                <button
                                  onClick={() => toggleProofCard(idx)}
                                  className="w-full text-left p-4.5 flex justify-between items-center gap-3 hover:bg-[#FDFAF5] transition-colors cursor-pointer focus:outline-none min-h-[48px]"
                                  aria-expanded={isProofOpen}
                                >
                                  <span className="font-serif font-black text-xs md:text-sm text-[#1C2333] hover:text-[#C9973A] transition-colors flex items-center gap-2">
                                    {proof.reference}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[9px] font-mono font-bold text-[#C9973A] uppercase tracking-widest bg-white border border-[#E8DDC6]/50 px-2 py-0.5 rounded">
                                      Proof {idx + 1}
                                    </span>
                                    <ChevronRight
                                      className={`w-4 h-4 text-[#C9973A] transition-transform duration-200 ${
                                        isProofOpen ? "rotate-90" : ""
                                      }`}
                                    />
                                  </div>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isProofOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: "easeInOut" }}
                                    >
                                      <div className="p-4 pt-2 border-t border-[#E8DDC6]/35 bg-white space-y-3">
                                        <p className="font-sans text-xs md:text-sm text-stone-800 leading-relaxed font-normal">
                                          “{proof.text}”
                                        </p>
                                        <div className="text-xs text-stone-500 font-sans leading-relaxed pt-2 flex gap-2 items-start border-t border-stone-100">
                                          <Info className="w-3.5 h-3.5 text-[#C9973A] shrink-0 mt-0.5" />
                                          <p className="font-sans not-italic">{proof.commentary}</p>
                                        </div>

                                        {/* Confirmation box on final proof card */}
                                        {isFinalProof && !supportingScripturesCompleted && (
                                          <div className="bg-[#FAF7F0] border-2 border-[#C9973A] p-4 rounded-xl space-y-3 mt-3 shadow-sm">
                                            <p className="text-xs font-serif font-extrabold text-[#1C2333] flex items-center gap-2">
                                              <BookOpen className="w-4 h-4 text-[#C9973A] shrink-0" />
                                              <span>Please confirm that you have carefully read through this final supporting text.</span>
                                            </p>
                                            <button
                                              onClick={handleConfirmFinalProof}
                                              className="w-full py-2.5 px-4 bg-[#C9973A] hover:bg-[#B0822F] text-white font-sans font-extrabold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                                              id="confirm-scripture-reading-btn"
                                            >
                                              <CheckCircle2 className="w-4 h-4 text-white" />
                                              <span>Finish Supporting Scriptures</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="space-y-4" id="detail-supporting-texts">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[#C9973A]" />
                <span>Supporting Scriptures & Proofs</span>
              </h3>

              <div className="space-y-4">
                {lesson.keyReferences.map((ref, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-stone-200/80 p-5 rounded-2xl space-y-3 shadow-3xs hover:border-[#C9973A]/40 transition-colors"
                    id={`supporting-text-box-${idx}`}
                  >
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <button
                        onClick={() => handleScriptureClick(ref.reference)}
                        className="font-serif font-black text-sm text-[#1C2333] hover:text-[#C9973A] transition-colors cursor-pointer border-b border-dashed border-stone-300 hover:border-[#C9973A] text-left focus:outline-none"
                      >
                        {ref.reference}
                      </button>
                      <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest bg-stone-50 border border-stone-200/50 px-2 py-0.5 rounded">
                        Sola Scriptura
                      </span>
                    </div>
                    <p className="font-sans text-sm text-stone-800 leading-relaxed bg-[#FDFAF5]/30 p-3 rounded-lg border border-[#E8DDC6]/20">
                      “{ref.text}”
                    </p>
                    {ref.commentary && (
                      <div className="text-xs text-stone-500 font-sans leading-relaxed pt-1 flex gap-2 items-start">
                        <Info className="w-3.5 h-3.5 text-[#C9973A] shrink-0 mt-0.5" />
                        <p>{ref.commentary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PRE-ASSESSMENT SECTION (LOCKED UNTIL SUPPORTING SCRIPTURES COMPLETE) */}
          {isInteractiveLesson && (
            <div
              className={`rounded-2xl overflow-hidden shadow-3xs transition-all duration-300 mb-6 border ${
                !supportingScripturesCompleted
                  ? "border-stone-200 bg-stone-50/80 opacity-75"
                  : !pretestVerified
                  ? "border-2 border-emerald-500 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse bg-white"
                  : "border border-stone-200 bg-white"
              }`}
              id={pretestSectionId}
            >
              <button
                disabled={!supportingScripturesCompleted}
                onClick={() => {
                  if (!supportingScripturesCompleted) return;
                  const next = !pretestMainExpanded;
                  setPretestMainExpanded(next);
                  if (next) {
                    autoScrollToSection(pretestSectionId);
                  }
                }}
                className={`w-full text-left p-5 flex justify-between items-center gap-4 transition-colors group focus:outline-none min-h-[48px] ${
                  supportingScripturesCompleted ? "hover:bg-[#FDFAF5]/60 cursor-pointer" : "cursor-not-allowed"
                }`}
                aria-expanded={pretestMainExpanded}
                id={`${pretestSectionId}.header`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-sm md:text-base font-black uppercase tracking-wider text-[#1C2333] group-hover:text-[#C9973A] transition-colors">
                    Pre‑Assessment Diagnostic
                  </h3>
                  {!supportingScripturesCompleted && (
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3 text-stone-400" /> Locked (Complete Step 1)
                    </span>
                  )}
                  {supportingScripturesCompleted && !pretestVerified && (
                    <span className="text-[10px] font-mono text-white bg-[#C9973A] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs animate-pulse">
                      Step 2 — Unlocked
                    </span>
                  )}
                  {pretestVerified && (
                    <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Completed
                    </span>
                  )}
                </div>
                <div className="shrink-0">
                  {supportingScripturesCompleted ? (
                    <ChevronRight
                      className={`w-5 h-5 text-[#C9973A] transition-transform duration-200 ${
                        pretestMainExpanded ? "rotate-90" : ""
                      }`}
                    />
                  ) : (
                    <Lock className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {pretestMainExpanded && supportingScripturesCompleted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-2 border-t border-[#E8DDC6]/40 space-y-4">
                      {randomizedQuestions.map((q, qIdx) => {
                        const isOpen = pretestOpenIdx === qIdx;
                        return (
                          <div
                            key={q.id}
                            className="bg-[#FDFAF5] border border-[#E8DDC6] rounded-2xl overflow-hidden shadow-3xs transition-all duration-200"
                            id={`${pretestSectionId}-card-${qIdx}`}
                          >
                            <button
                              onClick={() => handleToggleQuestion(qIdx)}
                              className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-[#FDFAF5]/60 transition-colors cursor-pointer group focus:outline-none min-h-[48px]"
                              aria-expanded={isOpen}
                            >
                              <span className="font-serif font-black text-xs md:text-sm text-[#1C2333] tracking-tight group-hover:text-[#C9973A] transition-colors uppercase select-none not-italic flex items-center gap-2">
                                {`Question ${qIdx + 1}`}
                                {pretestSelectedAnswers[qIdx] !== undefined && (
                                  <span className="text-[9px] bg-[#1C2333]/10 text-[#C9973A] px-2 py-0.5 rounded-full font-mono lowercase tracking-normal font-bold">
                                    answered
                                  </span>
                                )}
                              </span>
                              <div className="shrink-0">
                                <ChevronRight
                                  className={`w-4 h-4 text-[#C9973A] transition-transform duration-200 ${
                                    isOpen ? "rotate-90" : ""
                                  }`}
                                />
                              </div>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                >
                                  <div className="border-t border-[#E8DDC6]/40 bg-white p-5 space-y-4">
                                    <p className="font-sans text-xs md:text-sm font-extrabold text-[#1C2333] leading-relaxed">
                                      {q.question}
                                    </p>
                                    <div className="space-y-2 pt-2">
                                      {q.options.map((opt, optIdx) => {
                                        const isSelected = pretestSelectedAnswers[qIdx] === optIdx;
                                        return (
                                          <button
                                            key={optIdx}
                                            disabled={pretestVerified}
                                            onClick={() => selectAnswer(qIdx, optIdx)}
                                            className={`w-full text-left p-3.5 rounded-xl text-xs md:text-sm transition-all border font-serif cursor-pointer ${
                                              isSelected
                                                ? "bg-[#1C2333] text-white border-[#1C2333]"
                                                : "bg-[#FDFAF5] border-[#E8DDC6] text-[#1C2333] hover:bg-stone-50 hover:border-[#C9973A]"
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {/* Verify Active Recall Button */}
                      {Object.keys(pretestSelectedAnswers).length === randomizedQuestions.length && !pretestVerified && (
                        <div className="pt-4 flex justify-end" id="pretest-verify-action-block">
                          <button
                            onClick={() => {
                              setPretestVerified(true);
                              setPretestResultExpanded(true);
                              setStevenStage('pretest_complete');

                              const correctCount = randomizedQuestions.reduce(
                                (acc, q, idx) => (pretestSelectedAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc),
                                0
                              );
                              const scorePercent = Math.round((correctCount / randomizedQuestions.length) * 100);

                              if (scorePercent === 100) {
                                confetti({
                                  particleCount: 120,
                                  spread: 80,
                                  origin: { y: 0.6 }
                                });
                                setTimeout(() => {
                                  confetti({
                                    particleCount: 80,
                                    spread: 100,
                                    origin: { y: 0.5 }
                                  });
                                }, 300);
                              }

                              setTimeout(() => {
                                autoScrollToSection("pretest-results-block");
                              }, 150);
                            }}
                            className="px-6 py-3 bg-[#1C2333] hover:bg-stone-800 text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-1.5"
                            id="pretest-verify-btn"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#C9973A]" />
                            <span>Finish Pre-Assessment & Verify Recall</span>
                          </button>
                        </div>
                      )}

                      {/* Pre‑Assessment Score results panel */}
                      {pretestVerified && (
                        <div
                          className="bg-[#FDFAF5] border border-[#E8DDC6] rounded-2xl overflow-hidden shadow-3xs transition-all duration-200 mt-6"
                          id="pretest-results-block"
                        >
                          <button
                            onClick={() => {
                              const next = !pretestResultExpanded;
                              setPretestResultExpanded(next);
                              if (next) {
                                autoScrollToSection("pretest-results-block");
                              }
                            }}
                            className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-[#FDFAF5]/60 transition-colors cursor-pointer group focus:outline-none min-h-[48px]"
                            aria-expanded={pretestResultExpanded}
                          >
                            <span className="font-serif font-black text-xs md:text-sm text-[#1C2333] tracking-tight group-hover:text-[#C9973A] transition-colors uppercase select-none not-italic flex items-center gap-2">
                              Your Pre‑Assessment Score
                            </span>
                            <div className="shrink-0">
                              <ChevronRight
                                className={`w-4 h-4 text-[#C9973A] transition-transform duration-200 ${
                                  pretestResultExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {pretestResultExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                              >
                                <div className="border-t border-[#E8DDC6]/40 bg-white p-5 space-y-6 text-left">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Score Display Card */}
                                    <div className="bg-[#FDFAF5] border border-[#E8DDC6]/60 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 shadow-3xs">
                                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider font-bold">
                                        Theological Score
                                      </span>
                                      <span className="font-serif font-black text-3xl text-[#1C2333] tracking-tight">
                                        {(() => {
                                          let correct = 0;
                                          randomizedQuestions.forEach((q, idx) => {
                                            if (pretestSelectedAnswers[idx] === q.correctAnswerIndex) {
                                              correct++;
                                            }
                                          });
                                          return `${Math.round((correct / randomizedQuestions.length) * 100)}%`;
                                        })()}
                                      </span>
                                      <span className="text-[11px] font-sans text-stone-500">
                                        Based on {randomizedQuestions.length} core pillars
                                      </span>
                                    </div>

                                    {/* Score breakdown card */}
                                    <div className="bg-[#FDFAF5] border border-[#E8DDC6]/60 p-4 rounded-xl flex flex-col justify-center space-y-2.5 shadow-3xs">
                                      <div className="flex justify-between items-center text-xs font-sans text-stone-600">
                                        <span>Correct Answers</span>
                                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                                          {(() => {
                                            let correct = 0;
                                            randomizedQuestions.forEach((q, idx) => {
                                              if (pretestSelectedAnswers[idx] === q.correctAnswerIndex) {
                                                correct++;
                                              }
                                            });
                                            return correct;
                                          })()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs font-sans text-stone-600">
                                        <span>Incorrect Answers</span>
                                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                          {(() => {
                                            let correct = 0;
                                            randomizedQuestions.forEach((q, idx) => {
                                              if (pretestSelectedAnswers[idx] === q.correctAnswerIndex) {
                                                correct++;
                                              }
                                            });
                                            return randomizedQuestions.length - correct;
                                          })()}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Options reset card */}
                                    <div className="bg-[#FDFAF5] border border-[#E8DDC6]/60 p-4 rounded-xl flex flex-col justify-center space-y-1 text-left shadow-3xs">
                                      <span className="text-[10px] font-mono text-[#C9973A] uppercase tracking-wider font-bold">
                                        STUDY INSIGHTS
                                      </span>
                                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans">
                                        Review recommendations, then scroll to read the full doctrinal outline.
                                      </p>
                                    </div>
                                  </div>

                                  {/* RECOMMENDED FOCUS AREAS */}
                                  <div className="space-y-3 bg-[#FDFAF5] border border-[#E8DDC6]/60 p-4 rounded-xl shadow-3xs">
                                    <div className="flex items-center gap-1.5 text-[#C9973A] font-serif font-black text-xs uppercase tracking-wider">
                                      <BookOpen className="w-4 h-4 shrink-0" />
                                      <span>Recommended Focus Areas</span>
                                    </div>
                                    {(() => {
                                      const missedAreas = new Set<string>();
                                      randomizedQuestions.forEach((q, idx) => {
                                        if (pretestSelectedAnswers[idx] !== q.correctAnswerIndex) {
                                          missedAreas.add(q.focusArea);
                                        }
                                      });

                                      if (missedAreas.size === 0) {
                                        return (
                                          <p className="text-xs text-teal-700 font-sans font-medium">
                                            You aced the pre-exam — that’s very good. Read the doctrinal outline below for full systematic mastery.
                                          </p>
                                        );
                                      }

                                      return (
                                        <div className="space-y-2">
                                          <p className="text-xs text-stone-600 font-sans">
                                            Based on your missed questions, we recommend focusing on these doctrinal outline sections below:
                                          </p>
                                          <ul className="space-y-1.5">
                                            {Array.from(missedAreas).map((area, idx) => (
                                              <li
                                                key={idx}
                                                className="text-xs font-mono font-bold text-[#1C2333] flex items-center gap-1.5"
                                              >
                                                <span className="w-1.5 h-1.5 bg-[#C9973A] rounded-full" />
                                                {area}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* Action Buttons: Retake & Completed */}
                                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                                    <button
                                      onClick={() => {
                                        setPretestSelectedAnswers({});
                                        setPretestOpenIdx(0);
                                        setPretestVerified(false);
                                        setPretestResultExpanded(false);
                                        setRandomizedQuestions(shuffleQuestions(activePretestQuestions));
                                        setTimeout(() => {
                                          autoScrollToSection(pretestSectionId);
                                        }, 100);
                                      }}
                                      className="px-4 py-2 border border-stone-200 text-stone-600 hover:text-[#C9973A] hover:border-[#C9973A] font-mono font-bold text-xs rounded-xl transition-all uppercase flex items-center gap-1.5 cursor-pointer bg-white"
                                      id="pretest-retake-btn"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>Retake Pre-Test</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setPretestMainExpanded(false);
                                        setStevenStage('outline_intro');
                                        setTimeout(() => {
                                          const outlineEl = document.getElementById(outlineSectionId);
                                          if (outlineEl) {
                                            outlineEl.scrollIntoView({ behavior: "smooth" });
                                          }
                                        }, 150);
                                      }}
                                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-2"
                                      id="pretest-completed-btn"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                      <span>Completed</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* STEP 3: DOCTRINAL OUTLINE SECTION */}
          {isInteractiveLesson ? (
            <div className="space-y-4" id={outlineSectionId}>
              <div className="flex items-center justify-between border-b border-[#E8DDC6] pb-2" id={`${outlineSectionId}.header`}>
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C9973A]" />
                  <span>Doctrine Outline</span>
                </h3>
                {!pretestVerified && (
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Lock className="w-3 h-3 text-stone-400" /> Locked (Complete Step 2)
                  </span>
                )}
                {pretestVerified && !outlineCompleted && (
                  <span className="text-[10px] font-mono text-white bg-[#C9973A] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    Step 3 — Unlocked
                  </span>
                )}
                {outlineCompleted && (
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Completed
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activeOutline.map((section, idx) => {
                  const isLocked = !pretestVerified || idx > unlockedOutlineIdx;
                  const isOpen = pretestVerified && expandedOutlineIdx === idx;
                  const hasHighlight = pretestVerified && !outlineCompleted && unlockedOutlineIdx === idx && expandedOutlineIdx !== idx;

                  return (
                    <HolyScripturesOutlineCard
                      key={idx}
                      title={section.title}
                      content={section.content}
                      index={idx}
                      isLocked={isLocked}
                      isOpen={isOpen}
                      hasHighlight={hasHighlight}
                      onToggle={() => handleToggleSection(idx)}
                      onComplete={() => handleCompleteSection(idx)}
                      totalSections={activeOutline.length}
                    />
                  );
                })}
              </div>

              {/* STEP 4: TEACH IT & RECALL BRANCHING PATHWAYS */}
              <div
                className={`p-6 rounded-2xl border space-y-4 transition-all duration-300 mt-8 ${
                  outlineCompleted
                    ? "bg-[#FDFAF5] border-2 border-[#C9973A] ring-2 ring-[#C9973A]/40 shadow-md animate-pulse-soft"
                    : "bg-stone-50/80 border border-stone-200 opacity-75"
                }`}
                id={isSpirit || isSon || isFather || isTrinity ? "nextLesson" : "holy-scriptures-teach-recall-block"}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#C9973A] shrink-0" />
                    <h3 className="font-serif font-black text-sm md:text-base text-[#1C2333] uppercase tracking-wide">
                      Step 4 — Teach It & Recall Mastery
                    </h3>
                  </div>
                  {!outlineCompleted ? (
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3 text-stone-400" /> Locked (Complete Step 3)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white bg-[#C9973A] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                      Unlocked — Final Step
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {outlineCompleted
                    ? "Praise God! You have completed the systematic outline. Select your desired study pathway below to teach or memorize this doctrine."
                    : "Complete all Doctrinal Outline sections above to unlock the Teach It & Recall pathways."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    disabled={!outlineCompleted}
                    onClick={() => {
                      navigate(`/recall?doctrine=${isSpirit ? "spirit" : isSon ? "son" : isFather ? "father" : isTrinity ? "trinity" : "holy-scriptures"}&mode=texts`, {
                        state: {
                          doctrineId: isSpirit ? "spirit" : isSon ? "son" : isFather ? "father" : isTrinity ? "trinity" : "holy-scriptures",
                          doctrineTitle: isSpirit ? "The Holy Spirit" : isSon ? "God the Son" : isFather ? "The Father" : isTrinity ? "The Trinity" : "Holy Scriptures",
                          mode: "texts"
                        }
                      });
                    }}
                    className={`py-3.5 px-4 font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm ${
                      outlineCompleted
                        ? "bg-[#C9973A] hover:bg-[#B0822F] text-white cursor-pointer shadow-md"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                    id="branch-recall-texts-btn"
                  >
                    <Brain className="w-4 h-4 shrink-0" />
                    <span>Memorize the Text</span>
                  </button>

                  <button
                    disabled={!outlineCompleted}
                    onClick={() => {
                      if (!outlineCompleted) return;
                      navigate("/teach", {
                        state: {
                          autoLive: true,
                          doctrineId: id,
                          lessonId: lesson.number,
                        }
                      });
                    }}
                    className={`py-3.5 px-4 font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm ${
                      outlineCompleted
                        ? "bg-[#1C2333] hover:bg-stone-800 text-white border border-[#C9973A]/30 cursor-pointer shadow-md"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                    id="branch-explain-doctrine-btn"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Explain the Doctrine with AI</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            lesson.outline && lesson.outline.length > 0 && (
              <div className="space-y-4" id="detail-outline-section">
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500">
                  Lesson Study Outline
                </h3>
                <div className="space-y-4">
                  {lesson.outline.map((out: any, idx: number) => {
                    const outRefs: string[] = [];
                    if (out.key_references && Array.isArray(out.key_references)) {
                      outRefs.push(...out.key_references);
                    }
                    if (out.linked_references && Array.isArray(out.linked_references)) {
                      outRefs.push(...out.linked_references);
                    }
                    if (out.linkedReferences && Array.isArray(out.linkedReferences)) {
                      outRefs.push(...out.linkedReferences);
                    }
                    const uniqueRefs = Array.from(new Set(outRefs));

                    return (
                      <OutlineCard
                        key={idx}
                        title={out.title}
                        summary={out.summary}
                        keyReferences={uniqueRefs}
                        onScriptureClick={handleScriptureClick}
                        index={idx}
                      />
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {/* Action column on right */}
        <div className="space-y-4">
          {isInteractiveLesson ? (
            <div className="sticky top-6 space-y-4" id="elder-steven-bubble-container">
              <ElderStevenBubble
                dialogue={getElderStevenDialogue()}
                stage={stevenStage}
                sectionTitle={getElderStevenSectionTitle()}
                showQuestionInput={true}
              />
            </div>
          ) : (
            <div className="bg-[#1C2333] border border-[#C9973A]/20 p-6 rounded-2xl text-white space-y-4 shadow-sm relative overflow-hidden" id="detail-assessment-hud">
              {/* Background design accents */}
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#C9973A]/5 rounded-full filter blur-xl pointer-events-none" />

              <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9973A] font-bold block">
                Cognitive Mastery Assessment
              </span>
              <h4 className="font-serif font-bold text-md text-white">
                Ready to verify retention?
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Test your grasp of this lesson's key scripture proofs. Type your recall in your own words, and receive instant semantic comparison feedback.
              </p>

              <button
                onClick={() => navigate(`/tracks/${id}/lessons/${lesson.number}/pretest`)}
                className="w-full py-3 px-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-2"
                id="detail-start-pretest-btn"
              >
                <Brain className="w-4 h-4" />
                <span>Start Pre‑Test Assessment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// SECTION 5 — PRE‑TEST ASSESSMENT PAGE
// ========================================================
export const LessonPreTestPage: React.FC = () => {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();

  const isFB = id === "fundamental-beliefs";
  const numId = parseInt(lessonId || "1", 10);
  const dbTrack = DEFAULT_DOCTRINE_TRACKS[id || ""] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];

  // Fetch prompts
  const getPrompts = () => {
    if (isFB) {
      const fb = FB_LESSONS.find((f) => f.number === numId) || FB_LESSONS[0];
      return fb.active_recall_prompts;
    } else {
      // Return track-level prompts for non-FB tracks
      return dbTrack.active_recall_prompts || [];
    }
  };

  const prompts = getPrompts();
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [checkedScore, setCheckedScore] = useState<number>(0);
  const [masteredSelection, setMasteredSelection] = useState<"Weak" | "Developing" | "Mastered">("Weak");

  const [savedLogs, setSavedLogs] = useState<Record<string, { score: number; level: string }>>({});
  const [completed, setCompleted] = useState<boolean>(false);

  const activePrompt = prompts[activeIdx] || prompts[0] || {
    id: "default-p",
    prompt: "Summarize the core biblical proof of this study section.",
    expected_answer: "Scripture is the Word of God.",
    reference: "Isaiah 40:8"
  };

  // Helper function to calculate keyword overlap score
  const calculateAccuracy = (input: string, expected: string): number => {
    if (!input.trim()) return 0;
    
    const normalize = (str: string) => 
      str.toLowerCase()
         .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
         .replace(/\s+/g, " ")
         .trim();

    const inputWords = normalize(input).split(" ");
    const expectedWords = normalize(expected).split(" ");

    if (expectedWords.length === 0) return 0;

    let matches = 0;
    expectedWords.forEach((word) => {
      if (word.length > 2) {
        if (inputWords.includes(word)) {
          matches += 1.0;
        } else {
          // Check for close substring match (e.g. inspire vs inspired)
          const closeMatch = inputWords.some((inW) => 
            inW.includes(word) || word.includes(inW)
          );
          if (closeMatch && word.length > 3) {
            matches += 0.85;
          }
        }
      } else {
        if (inputWords.includes(word)) {
          matches += 0.5;
        }
      }
    });

    return Math.min(100, Math.round((matches / expectedWords.length) * 100));
  };

  const handleCheckAnswer = () => {
    if (!userAnswer.trim()) return;
    const score = calculateAccuracy(userAnswer, activePrompt.expected_answer);
    setCheckedScore(score);

    // Auto-rate level based on score
    if (score >= 70) {
      setMasteredSelection("Mastered");
    } else if (score >= 40) {
      setMasteredSelection("Developing");
    } else {
      setMasteredSelection("Weak");
    }

    setHasChecked(true);
  };

  const handleLogMasteryAndNext = async () => {
    // Log recall mastery to Supabase (and state)
    try {
      const sbUser = await ensureSupabaseAuth();
      if (sbUser) {
        const { error } = await supabase
          .from("active_recall_mastery")
          .upsert({
            user_id: sbUser.id,
            track_id: id || "fundamental-beliefs",
            prompt_id: activePrompt.id,
            user_answer: userAnswer,
            accuracy_score: checkedScore,
            mastery_level: masteredSelection,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id,track_id,prompt_id" });

        if (error) {
          console.warn("Supabase active_recall_mastery log error:", error.message);
        }
      }
    } catch (err) {
      console.warn("Supabase auth exception in pretest:", err);
    }

    // Save to local state mapping
    setSavedLogs((prev) => ({
      ...prev,
      [activePrompt.id]: { score: checkedScore, level: masteredSelection }
    }));

    // Save progress to local storage track complete if final
    if (activeIdx < prompts.length - 1) {
      setActiveIdx((prev) => prev + 1);
      setUserAnswer("");
      setHasChecked(false);
    } else {
      // Completed pre-test!
      // Update overall track lesson completed progress
      const savedProgress = localStorage.getItem("stba_tracks_progress");
      let currentProgress: Record<string, number> = {};
      if (savedProgress) {
        try { currentProgress = JSON.parse(savedProgress); } catch(e){}
      }
      // Set to current lesson number if it is higher than saved progress
      const savedVal = currentProgress[id || ""] || 0;
      if (numId > savedVal) {
        currentProgress[id || ""] = numId;
        localStorage.setItem("stba_tracks_progress", JSON.stringify(currentProgress));
      }

      setCompleted(true);
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="p-8 text-center space-y-4 bg-[#FDFAF5] border border-[#E8DDC6] rounded-2xl animate-fade-in">
        <Info className="w-12 h-12 text-[#C9973A] mx-auto" />
        <h2 className="font-serif text-xl font-bold text-[#1C2333]">No Active Prompts Loaded</h2>
        <p className="text-stone-500 max-w-md mx-auto text-sm">
          There are no active recall prompts assigned to this section yet.
        </p>
        <button
          onClick={() => navigate(`/tracks/${id}/lessons/${lessonId}`)}
          className="px-4 py-2 bg-[#1C2333] text-white text-xs rounded-lg uppercase tracking-wider font-bold"
        >
          Return to Lesson Detail
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-left space-y-6 animate-fade-in" id="pretest-viewport">
      {/* Back button */}
      <button
        onClick={() => navigate(`/tracks/${id}/lessons/${lessonId}`)}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C9973A] hover:text-[#1C2333] transition-colors cursor-pointer group"
        id="pretest-back-to-detail-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-all" />
        <span>Return to Lesson Detail</span>
      </button>

      {/* Progress HUD */}
      {!completed && (
        <div className="flex justify-between items-center text-xs font-mono text-stone-400 bg-[#FDFAF5] p-3 border border-[#E8DDC6]/50 rounded-xl" id="pretest-progress-hud">
          <span>Active Prompt: <strong className="text-[#C9973A]">{activeIdx + 1} of {prompts.length}</strong></span>
          <span>Target Scripture: <strong className="text-[#1C2333]">{activePrompt.reference}</strong></span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
            id={`pretest-prompt-block-${activeIdx}`}
          >
            {/* Prompt Instruction Box */}
            <div className="bg-white border border-stone-200 p-6 md:p-8 rounded-2xl space-y-4 shadow-3xs" id="pretest-prompt-question">
              <div className="p-2 bg-[#1C2333]/5 text-[#C9973A] w-max rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-md md:text-lg font-extrabold text-[#1C2333] leading-relaxed">
                {activePrompt.prompt}
              </h2>
            </div>

            {/* Answer Input Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-stone-400 uppercase tracking-wider block font-bold">
                Your Written Scripture Recall
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={hasChecked}
                placeholder="Type your recall here, focusing on the doctrinal substance and key scripture references..."
                rows={4}
                className="w-full bg-[#FDFAF5] border border-[#E8DDC6] focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A] rounded-2xl p-4 font-serif text-sm md:text-base text-[#1C2333] focus:outline-hidden leading-relaxed shadow-3xs resize-none disabled:bg-stone-50 disabled:border-stone-200 disabled:text-stone-500 transition-colors"
                id="pretest-user-textarea"
              />
            </div>

            {/* Verification Buttons */}
            {!hasChecked ? (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCheckAnswer}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-3 bg-[#1C2333] hover:bg-stone-800 disabled:bg-stone-200 text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm cursor-pointer"
                  id="pretest-check-btn"
                >
                  Verify Active Recall
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-2"
                id="pretest-results-block"
              >
                {/* Visual Feedback Overlap Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Semantic Score Box */}
                  <div className="bg-[#FDFAF5] border border-[#E8DDC6] p-5 rounded-2xl space-y-3 shadow-3xs">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">
                      Semantic Analysis HUD
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif font-black text-3xl text-[#1C2333] tracking-tight">
                        {checkedScore}%
                      </span>
                      <span className="text-xs font-sans font-bold text-[#C9973A]">
                        Theological Overlap
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      {checkedScore >= 70
                        ? "Excellent scriptural retention! The essential doctrinal statements and key structures match the Biblical text."
                        : checkedScore >= 40
                        ? "Developing nicely! The central themes are present, but trace closely through the supporting proofs to improve precision."
                        : "Focus and study again. Sola Scriptura demands high familiarity with the precise covenant promises."}
                    </p>
                  </div>

                  {/* Expected Scripture Box */}
                  <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-2 shadow-3xs">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold text-[#C9973A]">
                      Expected Biblical Proof ({activePrompt.reference})
                    </span>
                    <p className="font-serif italic text-sm text-[#1C2333] leading-relaxed">
                      “{activePrompt.expected_answer}”
                    </p>
                  </div>
                </div>

                {/* SELF RATING INPUTS */}
                <div className="bg-[#FDFAF5]/40 border border-stone-200 p-6 rounded-2xl space-y-4" id="pretest-self-override">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-[#1C2333]">
                      How would you evaluate your active recall?
                    </h4>
                    <p className="text-xs text-stone-500 font-sans">
                      As noted in our discipleship rules, do not worry if minor word variations exist, provided the doctrinal content is intact.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {["Weak", "Developing", "Mastered"].map((lvl) => {
                      const isSel = masteredSelection === lvl;
                      const lvlColor =
                        lvl === "Mastered" ? "bg-teal-50 border-teal-500 text-teal-700" :
                        lvl === "Developing" ? "bg-amber-50 border-amber-500 text-amber-700" :
                        "bg-rose-50 border-rose-500 text-rose-700";

                      return (
                        <button
                          key={lvl}
                          onClick={() => setMasteredSelection(lvl as any)}
                          className={`px-4 py-2 text-xs font-mono font-bold border rounded-lg transition-all cursor-pointer ${
                            isSel ? `${lvlColor} ring-1 ring-offset-1` : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                          }`}
                          id={`self-rate-${lvl}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-stone-100">
                    <button
                      onClick={handleLogMasteryAndNext}
                      className="px-6 py-2.5 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                      id="pretest-continue-btn"
                    >
                      <span>
                        {activeIdx < prompts.length - 1 ? "Next Prompt" : "Finish Assessment"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E8DDC6] p-8 md:p-12 rounded-2xl text-center space-y-6 shadow-md"
            id="pretest-complete-splash"
          >
            <div className="p-4 bg-teal-50 border border-teal-100 text-teal-600 rounded-2xl w-max mx-auto shadow-3xs animate-bounce">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#C9973A] uppercase tracking-[0.2em] block font-bold">
                COGNITIVE MASTERY CLEARED
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-[#1C2333] font-black tracking-tight">
                Pre‑Test Lesson Complete!
              </h2>
              <p className="text-stone-500 text-sm md:text-base font-sans max-w-md mx-auto leading-relaxed">
                Your scriptural recall logs have been successfully synced to your discipleship vault. You are growing as a Berean scriptural teacher!
              </p>
            </div>

            {/* Results summaries */}
            <div className="bg-[#FDFAF5] border border-[#E8DDC6]/80 max-w-md mx-auto p-5 rounded-xl text-left space-y-3">
              <h4 className="font-serif font-bold text-xs text-[#1C2333] border-b border-[#E8DDC6]/50 pb-1.5 uppercase font-mono tracking-wider">
                Summary Report
              </h4>
              <div className="flex justify-between items-center text-xs font-sans text-stone-600">
                <span>Total Prompts Answered</span>
                <span className="font-mono font-bold text-[#1C2333]">{prompts.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-sans text-stone-600">
                <span>Lesson Syllabus Status</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-100/40 px-2 py-0.5 rounded uppercase">
                  MASTERED
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <button
                onClick={() => navigate(`/tracks/${id}/lessons`)}
                className="px-6 py-3 bg-[#FDFAF5] hover:bg-[#F2ECE0] border border-[#E8DDC6] text-[#1C2333] font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                id="pretest-exit-lessons-btn"
              >
                <span>Return to Lesson List</span>
              </button>

              <button
                onClick={() => navigate("/tracks")}
                className="px-6 py-3 bg-[#1C2333] hover:bg-stone-800 text-white font-sans font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                id="pretest-exit-tracks-btn"
              >
                <span>Explore All Tracks</span>
                <Compass className="w-4 h-4 text-[#C9973A]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
