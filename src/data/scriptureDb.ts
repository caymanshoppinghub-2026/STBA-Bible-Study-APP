/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, Scripture } from "../types";

export const TRACK_LIBRARY: Track[] = [
  {
    id: "fundamental-beliefs",
    title: "28 Fundamental Beliefs",
    count: 26,
    color: "amber",
    category: "doctrine",
    badge: "Core Theology",
    description: "An intensive active recall track pacing through foundational tenets, supported by system-mapped proofs.",
    iconName: "book"
  },
  {
    id: "three-angels",
    title: "Three Angels' Messages",
    count: 12,
    color: "teal",
    category: "prophecy",
    badge: "Esoteric Prophecy",
    description: "Revelation 14 focused active semantic tracking, exploring restoration, cosmic sanctuary justice and Sabbath.",
    iconName: "flame"
  },
  {
    id: "sanctuary-doctrine",
    title: "Sanctuary Doctrine",
    count: 9,
    color: "navy",
    category: "doctrine",
    badge: "Advanced Type Study",
    description: "From earthly tabernacle pattern to heaven's realities. Master the exact theological shadows systematically.",
    iconName: "stars"
  },
  {
    id: "sabbath-school",
    title: "Sabbath School Quarterly",
    count: 15,
    color: "amber",
    category: "devotional",
    badge: "Weekly Devotion",
    description: "Active-recall summaries corresponding to the current global adult SDA Sabbath School bible study layout.",
    iconName: "calendar"
  },
  {
    id: "book-by-book",
    title: "Book-by-Book Memory Goals",
    count: 40,
    color: "teal",
    category: "devotional",
    badge: "Verbatim Scope",
    description: "Recall structured scriptures sequentially. Focused on Hebrews, Ephesians, and Romans.",
    iconName: "bookmark"
  },
  {
    id: "priority-doctrines",
    title: "Priority SDA Doctrines",
    count: 7,
    color: "navy",
    category: "doctrine",
    badge: "Accelerated Path",
    description: "An interactive scripture chain covering the law, investigative judgment, and second advent promises.",
    iconName: "shield"
  }
];

export const SCRIPTURE_DATABASE: Record<string, Scripture[]> = {
  "fundamental-beliefs": [
    {
      id: "fb-1",
      reference: "2 Timothy 3:16",
      text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
      keywords: ["inspiration", "profitable", "doctrine", "righteousness"]
    },
    {
      id: "fb-2",
      reference: "Romans 1:16",
      text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
      keywords: ["ashamed", "gospel", "power", "salvation"]
    },
    {
      id: "fb-3",
      reference: "Genesis 1:27",
      text: "So God created man in his own image, in the image of God created he him; male and female created he them.",
      keywords: ["created", "image", "male", "female"]
    }
  ],
  "three-angels": [
    {
      id: "ta-1",
      reference: "Revelation 14:6",
      text: "And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth.",
      keywords: ["angel", "everlasting", "gospel", "preach"]
    },
    {
      id: "ta-2",
      reference: "Revelation 14:7",
      text: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him.",
      keywords: ["voice", "judgment", "glory", "worship"]
    },
    {
      id: "ta-3",
      reference: "Revelation 14:12",
      text: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
      keywords: ["patience", "saints", "commandments", "faith"]
    }
  ],
  "sanctuary-doctrine": [
    {
      id: "sd-1",
      reference: "Daniel 8:14",
      text: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
      keywords: ["sanctuary", "cleansed", "days", "cleansed"]
    },
    {
      id: "sd-2",
      reference: "Hebrews 8:1-2",
      text: "We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; A minister of the sanctuary.",
      keywords: ["priest", "throne", "heavens", "sanctuary"]
    },
    {
      id: "sd-3",
      reference: "Exodus 25:8",
      text: "And let them make me a sanctuary; that I may dwell among them.",
      keywords: ["sanctuary", "dwell", "make", "among"]
    }
  ],
  "sabbath-school": [
    {
      id: "ss-1",
      reference: "Matthew 11:28",
      text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
      keywords: ["come", "labour", "heavy", "rest"]
    },
    {
      id: "ss-2",
      reference: "Mark 2:27",
      text: "And he said unto them, The sabbath was made for man, and not man for the sabbath.",
      keywords: ["sabbath", "made", "man", "for"]
    }
  ],
  "book-by-book": [
    {
      id: "bb-1",
      reference: "Hebrews 11:1",
      text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
      keywords: ["faith", "substance", "hoped", "evidence", "seen"]
    }
  ],
  "priority-doctrines": [
    {
      id: "pd-1",
      reference: "Ecclesiastes 12:13",
      text: "Let us hear the conclusion of the whole matter: Fear God, and keep his commandments: for this is the whole duty of man.",
      keywords: ["conclusion", "matter", "fear", "commandments", "duty"]
    }
  ]
};
