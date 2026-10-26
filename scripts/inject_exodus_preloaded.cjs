const fs = require("fs");
const path = require("path");

const exData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "data", "sda-commentary-imports", "exodus_commentary_parsed.json"),
    "utf8"
  )
);

const preloadedPath = path.join(__dirname, "..", "src", "data", "sdabcPreloadedData.ts");
let content = fs.readFileSync(preloadedPath, "utf8");

// Get Chapter 20 verses 8, 9, 10
const ch20v8 = exData.chapters[20].verses.find(v => v.verseNumber === 8 && v.headwords.includes("Remember"));
const ch20v9 = exData.chapters[20].verses.find(v => v.verseNumber === 9 && v.headwords.includes("labour"));
const ch20v10 = exData.chapters[20].verses.find(v => v.verseNumber === 10 && v.headwords.includes("seventh"));

// Get Chapter 25 verses 1-9
const ch25v2 = exData.chapters[25].verses.find(v => v.verseNumber === 2 && v.headwords.includes("offering"));
const ch25v3 = exData.chapters[25].verses.find(v => v.verseNumber === 3 && v.headwords.includes("Gold"));
const ch25v8 = exData.chapters[25].verses.find(v => v.verseNumber === 8 && v.headwords.includes("sanctuary"));
const ch25v9 = exData.chapters[25].verses.find(v => v.verseNumber === 9 && v.headwords.includes("pattern"));

const ex20Entry = `
  "exodus 20:8-11": {
    reference: "Exodus 20:8-11",
    volumeNumber: 1,
    pageRange: "Vol. 1, pp. 602–607",
    chapterTitle: "The Fourth Commandment: The Seventh-day Sabbath Memorial of Creation",
    historicalContext:
      "The Decalogue stands high above all other moral and spiritual laws. It is comprehensive of all human conduct and suited to every kind of human society, applicable and in force so long as the world shall last (Matt. 5:17-18). It can never become obsolete, for it is the immutable expression of God's will and character. God delivered them to His people both orally and in writing with His own finger on tables of stone (Ex. 31:18; Deut. 4:13). The two tables emphasize two classes of moral obligation: duty to God (first four commandments) and duty to man (last six commandments). At the heart of the first table rests the Fourth Commandment, linking the Creator's sovereign authority with human time and worship (PP 305; GC 434).",
    exegeticalSummary:
      "The Sabbath commandment begins with 'Remember,' directing the mind back to creation week (Gen. 2:1-3) when the Sabbath was blessed and sanctified by God before sin entered. It is Heaven's ordained memorial of divine creative power and the perpetual covenant sign of sanctification between God and His people (Ex. 31:13). Christ confirmed its ongoing validity as Lord of the Sabbath made for all mankind (Mark 2:27-28).",
    verses: [
      {
        verseNumber: 8,
        text: "Remember the sabbath day, to keep it holy.",
        headwords: "${ch20v8 ? ch20v8.headwords.replace(/"/g, '\\"') : "8. Remember."}",
        originalLanguageInsight: "Hebrew: 'Zakor' (infinitive absolute used as emphatic imperative: keep continually in remembrance). 'Shabbath' (cessation, sacred rest). 'Qiddesh' (to consecrate, set apart for sacred communion with God).",
        commentaryText:
          "${ch20v8 ? ch20v8.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "This word does not make the fourth commandment more important than the other nine. All are equally so. But the Sabbath commandment reminds us that the seventh day is holy."}",
        theologicalConnection: "The Perpetuity of the Fourth Commandment & Edenic Origin (Genesis 2:1-3; Revelation 14:7)."
      },
      {
        verseNumber: 9,
        text: "Six days shalt thou labour, and do all thy work:",
        headwords: "${ch20v9 ? ch20v9.headwords.replace(/"/g, '\\"') : "9. Shalt thou labour."}",
        originalLanguageInsight: "Hebrew: 'Sheseth yamim ta'avod' (six days you shall labor). God orders human industry and rest in sacred rhythm.",
        commentaryText:
          "${ch20v9 ? ch20v9.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "This is a permission rather than a command. What work is to be done should be performed on the first six days of the week, so that the Sabbath may be free for the worship of God."}",
        theologicalConnection: "Divine Rhythm of Work and Sacred Rest (Colossians 3:23; Exodus 20:9)."
      },
      {
        verseNumber: 10,
        text: "But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates:",
        headwords: "${ch20v10 ? ch20v10.headwords.replace(/"/g, '\\"') : "10. The seventh day."}",
        originalLanguageInsight: "Hebrew: 'Veyom hashvi'i shabbath l'Adonai Eloheicha' (the seventh day is Sabbath unto Jehovah your God). Universal rest extended to family, servants, and beasts.",
        commentaryText:
          "${ch20v10 ? ch20v10.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "No unnecessary secular labor is to be performed on that day. It is to be spent in religious reflection, worship, and service for God. It provides an opportunity for physical rest and spiritual communion."}",
        theologicalConnection: "Universal Scope of Sabbath Rest & Equitable Compassion (Isaiah 58:13-14; Mark 2:27)."
      },
      {
        verseNumber: 11,
        text: "For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
        headwords: "11. For in six days the LORD made heaven and earth.",
        originalLanguageInsight: "Hebrew: 'Ki sheseth yamim 'asah Adonai' (for in six days Jehovah made). Directly echoed in the First Angel's Message of Revelation 14:7 ('worship Him that made heaven, and earth, and the sea').",
        commentaryText:
          "The reason given for the observance of the Sabbath is that God rested on the seventh day from His work of creation and blessed and hallowed it. The Fourth Commandment is thus grounded in the literal six-day creation week. It refutes both ancient pantheism and modern evolutionary dogmas, binding all men to worship the Creator of the universe.",
        theologicalConnection: "The Seal of God & The First Angel's Message (Genesis 2:1-3; Revelation 14:7; Revelation 7:2-3)."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 305",
        quote: "The law was not spoken at this time exclusively for the benefit of the Hebrews. God honored them by making them the guardians and keepers of His law, but it was to be held as a sacred trust for the whole world. The precepts of the Decalogue are adapted to all mankind, and they were given for the instruction and government of all.",
        theologicalTheme: "The Universal, Perpetual Moral Law of Ten Commandments"
      },
      {
        source: "Patriarchs and Prophets, p. 307",
        quote: "The Sabbath was not for Israel merely, but for the world. It had been made known to man in Eden, and, like the other precepts of the Decalogue, it is of imperishable obligation.",
        theologicalTheme: "The Imperishable Edenic Sabbath"
      },
      {
        source: "The Great Controversy, p. 434",
        quote: "The claim that the Fourth Commandment was a Jewish institution abolished at the cross is refuted by the sacred record: 'Remember the Sabbath day, to keep it holy... for in six days the LORD made heaven and earth.'",
        theologicalTheme: "The Fourth Commandment Grounded in Creation Week"
      },
      {
        source: "Testimonies for the Church, vol. 6, p. 38",
        quote: "The Sabbath is a golden clasp that unites God and His people.",
        theologicalTheme: "The Sabbath as Uniting Clasp of Covenant Love"
      }
    ],
    doctrinalPillars: [
      "The Perpetuity of the Ten Commandments (Exodus 20:1-17; Matt 5:17-18; James 2:10-12)",
      "The Seventh-day Sabbath as Creation Memorial & Covenant Sign (Exodus 20:8-11; Gen 2:1-3; Ex 31:13)",
      "The First Angel's Message Call to Creator Worship (Revelation 14:7 quotes Exodus 20:11)",
      "The Seal of God in the Forehead: Loyalty to the Creator's Law (Revelation 7:2-3; 14:1, 12)"
    ],
    scripturalCrossReferences: [
      "Genesis 2:1-3 (Creation Rest, Blessing, and Sanctification of the Seventh Day)",
      "Exodus 31:13, 16-17 (Sabbath as Sign of Sanctification and Perpetual Covenant)",
      "Isaiah 58:13-14 (Call the Sabbath a Delight, The Holy of the Lord)",
      "Ezekiel 20:12, 20 (Sabbaths as Signs That I Am the Lord That Sanctifies Them)",
      "Mark 2:27-28 (The Sabbath Was Made for Man, Son of Man Lord of the Sabbath)",
      "Hebrews 4:4, 9-10 (There Remaineth Therefore a Sabbath Rest to the People of God)",
      "Revelation 14:7, 12 (Worship the Creator; Here Are They That Keep the Commandments)"
    ],
    teachingOutline: {
      intro: "Hold up a calendar and ask: 'Where does the seven-day weekly cycle come from when no astronomical orbit explains it?' Point directly to the literal Creation week and Exodus 20:8-11.",
      points: [
        "The command begins with 'Remember' because God instituted the Sabbath in Eden before sin entered (Gen 2:1-3).",
        "The Seventh-day Sabbath belongs to the Lord ('the sabbath of the LORD thy God'), not to any single nation or era.",
        "God's own creative rest is the moral model for mankind: six days of labor and a seventh day of holy worship.",
        "In end-time prophecy, Revelation 14:7 quotes Exodus 20:11, summoning the world back to true Creator worship."
      ],
      appeal: "Accept the Sabbath as God's gift of rest and sanctification, entering into covenant loyalty with Jesus, the Lord of the Sabbath."
    }
  },
`;

const ex25Entry = `
  "exodus 25:1-9": {
    reference: "Exodus 25:1-9",
    volumeNumber: 1,
    pageRange: "Vol. 1, pp. 631–636",
    chapterTitle: "The Heavenly Pattern & Earthly Tabernacle: 'Make Me a Sanctuary'",
    historicalContext:
      "While in the mount for forty days and forty nights, Moses was given the divine specifications for the wilderness tabernacle. God commanded that the materials be received only as freewill offerings from those whose hearts were moved (Ex. 25:2; PP 313). The earthly structure, constructed with utmost fidelity to the pattern shown in the mount (Ex. 25:9, 40), was a visible, tangible shadow of the true heavenly sanctuary, where Christ our Great High Priest ministers in the presence of God for us (Heb. 8:1-5; Heb. 9:1-12, 24).",
    exegeticalSummary:
      "Exodus 25 reveals the supreme purpose of the sanctuary: 'And let them make me a sanctuary; that I may dwell among them' (v. 8). Sin separated humanity from the holy presence of God, but through the sacrificial typology and priestly mediation of the sanctuary, God manifested His Shekinah glory and opened the way of reconciliation. The pattern shown to Moses was not a product of human imagination, but an earthly reflection of heavenly realities.",
    verses: [
      {
        verseNumber: 2,
        text: "Speak unto the children of Israel, that they bring me an offering: of every man that giveth it willingly with his heart ye shall take my offering.",
        headwords: "${ch25v2 ? ch25v2.headwords.replace(/"/g, '\\"') : "2. Bring me an offering."}",
        originalLanguageInsight: "Hebrew: 'Terumah' (contribution, offering lifted up to God). 'Yidvenu libbo' (whose heart prompts him willingly). God desires heartfelt consecration, not forced tribute.",
        commentaryText:
          "${ch25v2 ? ch25v2.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "The divine will had been revealed to Israel in the Decalogue, and now God invites His people to build His dwelling place with willing hearts."}",
        theologicalConnection: "Freewill Consecration & Cheerful Stewardship (2 Corinthians 9:7; Exodus 25:2)."
      },
      {
        verseNumber: 3,
        text: "And this is the offering which ye shall take of them; gold, and silver, and brass,",
        headwords: "${ch25v3 ? ch25v3.headwords.replace(/"/g, '\\"') : "3. Gold."}",
        originalLanguageInsight: "Hebrew: 'Zahav' (gold, symbolizing divine purity and royalty), 'kesef' (silver, symbolizing redemption), 'nechosheth' (bronze/copper, symbolizing judgment and durability).",
        commentaryText:
          "${ch25v3 ? ch25v3.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "Three metals were to be used in the tabernacle itself and in its articles of furniture. When the Hebrews left Egypt they had been richly supplied with precious metals and jewels, which they now joyfully dedicated to God."}",
        theologicalConnection: "Materials Consecrated for Divine Glory (1 Chronicles 29:14; Exodus 25:3)."
      },
      {
        verseNumber: 8,
        text: "And let them make me a sanctuary; that I may dwell among them.",
        headwords: "${ch25v8 ? ch25v8.headwords.replace(/"/g, '\\"') : "8. Make me a sanctuary."}",
        originalLanguageInsight: "Hebrew: 'Miqdash' (holy place, sanctuary). 'V'shakhanti b'tokham' (and I will dwell/tabernacle in their midst—source of 'Shekinah').",
        commentaryText:
          "${ch25v8 ? ch25v8.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "Though the Hebrews knew that the great God could not possibly dwell in any building made by men, the sanctuary was to be a visible dwelling place for the God who traveled with them in the wilderness."}",
        theologicalConnection: "The Incarnation & The True Heavenly Tabernacle (John 1:14; Hebrews 8:1-2; Revelation 21:3)."
      },
      {
        verseNumber: 9,
        text: "According to all that I shew thee, after the pattern of the tabernacle, and the pattern of all the instruments thereof, even so shall ye make it.",
        headwords: "${ch25v9 ? ch25v9.headwords.replace(/"/g, '\\"') : "9. After the pattern."}",
        originalLanguageInsight: "Hebrew: 'Tavnith' (blueprint, miniature model, accurate structure reflecting the heavenly archetype).",
        commentaryText:
          "${ch25v9 ? ch25v9.commentaryText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') : "This shows that though the workmanship was man’s the plan was God’s. God has ever counted upon human agencies to cooperate in the building of His house."}",
        theologicalConnection: "Heavenly Sanctuary Archetype & Sola Scriptura Typology (Hebrews 8:5; Hebrews 9:23-24)."
      }
    ],
    egwComments: [
      {
        source: "Patriarchs and Prophets, p. 313",
        quote: "For the building of the sanctuary, great and expensive preparations were necessary... Yet God accepted only freewill offerings. 'Of every man that giveth it willingly with his heart ye shall take My offering' was the divine command.",
        theologicalTheme: "Freewill Offerings for the Sanctuary of God"
      },
      {
        source: "The Great Controversy, pp. 411-413",
        quote: "The earthly sanctuary was built by Moses according to the pattern shown him in the mount. It was 'a figure for the time then present'... As in vision the apostle John was granted a view of the temple of God in heaven, he beheld there 'the ark of His testament' (Revelation 11:19).",
        theologicalTheme: "The Earthly Tabernacle as Shadow of the Heavenly Sanctuary"
      },
      {
        source: "Education, p. 35",
        quote: "The sanctuary in the wilderness was a symbol of the incarnation of Christ: 'Let them make Me a sanctuary; that I may dwell among them.'",
        theologicalTheme: "The Sanctuary Symbolizing the Incarnation"
      }
    ],
    doctrinalPillars: [
      "The Heavenly Sanctuary & Earthly Typology (Exodus 25:8-9, 40; Hebrews 8:1-5; 9:11-12)",
      "Christ's High-Priestly Ministry in Heaven (Hebrews 7:25; 8:1-2; 9:24)",
      "The Ark of the Covenant, Law & Propitiation (Exodus 25:10-22; Revelation 11:19)",
      "The 2,300-Day Prophecy & Cleansing of the Heavenly Sanctuary (Daniel 8:14; Leviticus 16)"
    ],
    scripturalCrossReferences: [
      "Exodus 25:40 (Look That Thou Make Them After Their Pattern Shown in the Mount)",
      "Psalm 77:13 (Thy Way, O God, Is in the Sanctuary: Who Is So Great a God as Our God?)",
      "John 1:14 (The Word Was Made Flesh, and Tabernacled Among Us)",
      "Hebrews 8:1-5 (We Have Such an High Priest, Minister of the True Tabernacle)",
      "Hebrews 9:1-12, 23-24 (Christ Entered Not into the Holy Places Made with Hands, but into Heaven Itself)",
      "Revelation 11:19 (The Temple of God Was Opened in Heaven, and the Ark Was Seen)",
      "Revelation 21:3 (Behold, the Tabernacle of God Is with Men, and He Will Dwell with Them)"
    ],
    teachingOutline: {
      intro: "Ask: 'Why did God ask Israel to build a tent in the scorching desert?' Read Exodus 25:8: 'That I may dwell among them.'",
      points: [
        "God desires intimate, holy fellowship with His people despite the barrier created by sin.",
        "The earthly sanctuary was built exactly according to the heavenly blueprint shown to Moses.",
        "Every piece of furniture—altar of burnt offering, laver, lampstand, table of shewbread, altar of incense, and ark of the covenant—reveals Jesus and His saving ministry.",
        "Today, Jesus ministers for us in the heavenly sanctuary, cleansing us from sin and preparing us for His return."
      ],
      appeal: "Open your heart to be a living temple for God, looking in faith to Jesus our High Priest ministering in the heavenly sanctuary."
    }
  },
`;

// Insert after `"exodus (book overview)"` block
if (!content.includes('"exodus 20:8-11"')) {
  const insertMarker = '  "genesis 1:1-31": {';
  content = content.replace(insertMarker, ex20Entry + ex25Entry + insertMarker);
  console.log("Successfully injected exodus 20:8-11 and exodus 25:1-9!");
} else {
  console.log("exodus 20:8-11 already present.");
}

// Add aliases at the bottom
const aliasMarker = 'PRELOADED_SDABC_DATA["genesis 3"] = PRELOADED_SDABC_DATA["genesis 3:1-15"];';
const exodusAliases = `
PRELOADED_SDABC_DATA["exodus"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus overview"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus book overview"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["ex"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus 1"] = PRELOADED_SDABC_DATA["exodus (book overview)"];
PRELOADED_SDABC_DATA["exodus 20"] = PRELOADED_SDABC_DATA["exodus 20:8-11"];
PRELOADED_SDABC_DATA["exodus 20:8"] = PRELOADED_SDABC_DATA["exodus 20:8-11"];
PRELOADED_SDABC_DATA["exodus 20:8-11"] = PRELOADED_SDABC_DATA["exodus 20:8-11"];
PRELOADED_SDABC_DATA["exodus 25"] = PRELOADED_SDABC_DATA["exodus 25:1-9"];
PRELOADED_SDABC_DATA["exodus 25:8"] = PRELOADED_SDABC_DATA["exodus 25:1-9"];
PRELOADED_SDABC_DATA["exodus 25:1-9"] = PRELOADED_SDABC_DATA["exodus 25:1-9"];
`;

if (!content.includes('PRELOADED_SDABC_DATA["exodus"]')) {
  content = content.replace(aliasMarker, aliasMarker + exodusAliases);
  console.log("Successfully added Exodus canonical aliases!");
}

fs.writeFileSync(preloadedPath, content, "utf8");
console.log("Updated sdabcPreloadedData.ts successfully.");
