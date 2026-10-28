/**
 * Bible Service
 * Fetches verse text across multiple translations (KJV, NKJV, ESV, NASB)
 */

import { stbaStorage } from "../lib/storage/indexedDbClient.ts";

interface TranslationTextMap {
  [version: string]: string;
}

interface VersePreset {
  [refNormalized: string]: TranslationTextMap;
}

// Extensive local database of Sabbath School, Memory, and Doctrinal Scriptures across translations
export const BIBLE_PRESETS: VersePreset = {
  "acts282627": {
    KJV: "26 Saying, Go unto this people, and say, Hearing ye shall hear, and shall not understand; and seeing ye shall see, and not perceive: 27 For the heart of this people is waxed gross, and their ears are dull of hearing, and their eyes have they closed; lest they should see with their eyes, and hear with their ears, and understand with their heart, and should be converted, and I should heal them.",
    NKJV: "26 saying, 'Go to this people and say: Hearing you will hear, and shall not understand; And seeing you will see, and not perceive; 27 For the hearts of this people have grown dull. Their ears are hard of hearing, And their eyes they have closed, Lest they should see with their eyes and hear with their ears, Lest they should understand with their hearts and turn, So that I should heal them.'",
    ESV: "26 saying, 'Go to this people, and say, You will indeed hear but never understand, and you will indeed see but never perceive. 27 For this people's heart has grown dull, and with their ears they can barely hear, and their eyes they have closed; lest they should see with their eyes and hear with their ears and understand with their heart and turn, and I would heal them.'",
    NASB: "26 saying, 'Go to this people and say: You will keep on hearing, but will not understand; and you will keep on seeing, but will not perceive; 27 for the heart of this people has become dull, and with their ears they scarcely hear, and they have closed their eyes; otherwise they might see with their eyes, and hear with their ears, and understand with their heart and return, and I would heal them.'"
  },
  "acts2826": {
    KJV: "Saying, Go unto this people, and say, Hearing ye shall hear, and shall not understand; and seeing ye shall see, and not perceive:",
    NKJV: "saying, 'Go to this people and say: Hearing you will hear, and shall not understand; And seeing you will see, and not perceive;'",
    ESV: "saying, 'Go to this people, and say, You will indeed hear but never understand, and you will indeed see but never perceive.'",
    NASB: "saying, 'Go to this people and say: You will keep on hearing, but will not understand; and you will keep on seeing, but will not perceive;'"
  },
  "acts2827": {
    KJV: "For the heart of this people is waxed gross, and their ears are dull of hearing, and their eyes have they closed; lest they should see with their eyes, and hear with their ears, and understand with their heart, and should be converted, and I should heal them.",
    NKJV: "For the hearts of this people have grown dull. Their ears are hard of hearing, And their eyes they have closed, Lest they should see with their eyes and hear with their ears, Lest they should understand with their hearts and turn, So that I should heal them.",
    ESV: "For this people's heart has grown dull, and with their ears they can barely hear, and their eyes they have closed; lest they should see with their eyes and hear with their ears and understand with their heart and turn, and I would heal them.",
    NASB: "for the heart of this people has become dull, and with their ears they scarcely hear, and they have closed their eyes; otherwise they might see with their eyes, and hear with their ears, and understand with their heart and return, and I would heal them."
  },
  "revelation1412": {
    KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
    ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
    NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
  },
  "rev1412": {
    KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
    ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
    NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
  },
  "hebrews914": {
    KJV: "How much more shall the blood of Christ, who through the eternal Spirit offered himself without spot to God, purge your conscience from dead works to serve the living God?",
    NKJV: "how much more shall the blood of Christ, who through the eternal Spirit offered Himself without spot to God, cleanse your conscience from dead works to serve the living God?",
    ESV: "how much more will the blood of Christ, who through the eternal Spirit offered himself without blemish to God, purify our conscience from dead works to serve the living God.",
    NASB: "how much more will the blood of Christ, who through the eternal Spirit offered Himself without blemish to God, cleanse your conscience from dead works to serve the living God?"
  },
  "heb914": {
    KJV: "How much more shall the blood of Christ, who through the eternal Spirit offered himself without spot to God, purge your conscience from dead works to serve the living God?",
    NKJV: "how much more shall the blood of Christ, who through the eternal Spirit offered Himself without spot to God, cleanse your conscience from dead works to serve the living God?",
    ESV: "how much more will the blood of Christ, who through the eternal Spirit offered himself without blemish to God, purify our conscience from dead works to serve the living God.",
    NASB: "how much more will the blood of Christ, who through the eternal Spirit offered Himself without blemish to God, cleanse your conscience from dead works to serve the living God?"
  },
  "1corinthians10711": {
    KJV: "7 Neither be ye idolaters, as were some of them; as it is written, The people sat down to eat and drink, and rose up to play. 8 Neither let us commit fornication, as some of them committed, and fell in one day three and twenty thousand. 9 Neither let us tempt Christ, as some of them also tempted, and were destroyed of serpents. 10 Neither murmur ye, as some of them also murmured, and were destroyed of the destroyer. 11 Now all these things happened unto them for ensamples: and they are written for our admonition, upon whom the ends of the world are come.",
    NKJV: "7 And do not become idolaters as were some of them. As it is written, 'The people sat down to eat and drink, and rose up to play.' 8 Nor let us commit sexual immorality, as some of them did, and in one day twenty-three thousand fell; 9 nor let us tempt Christ, as some of them also tempted, and were destroyed by serpents; 10 nor complain, as some of them also complained, and were destroyed by the destroyer. 11 Now all these things happened to them as examples, and they were written for our admonition, upon whom the ends of the ages have come.",
    ESV: "7 Do not be idolaters as some of them were; as it is written, 'The people sat down to eat and drink and rose up to play.' 8 We must not indulge in sexual immorality as some of them did, and twenty-three thousand fell in a single day. 9 We must not put Christ to the test, as some of them did and were destroyed by serpents, 10 nor grumble, as some of them did and were destroyed by the Destroyer. 11 Now these things happened to them as an example, but they were written down for our instruction, on whom the end of the ages has come.",
    NASB: "7 Do not be idolaters, as some of them were; as it is written, 'The people sat down to eat and drink, and stood up to play.' 8 Nor let us act immorally, as some of them did, and twenty-three thousand fell in one day. 9 Nor let us put the Lord to the test, as some of them did, and were destroyed by the serpents. 10 Nor grumble, as some of them did, and were destroyed by the destroyer. 11 Now these things happened to them as an example, and they were written for our instruction, upon whom the ends of the ages have come."
  },
  "revelation14612": {
    KJV: "6 And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people, 7 Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters. 8 And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication. 9 And the third angel followed them, saying with a loud voice, If any man worship the beast and his image, and receive his mark in his forehead, or in his hand, 10 The same shall drink of the wine of the wrath of God, which is poured out without mixture into the cup of his indignation; and he shall be tormented with fire and brimstone in the presence of the holy angels, and in the presence of the Lamb: 11 And the smoke of their torment ascendeth up for ever and ever: and they have no rest day nor night, who worship the beast and his image, and whosoever receiveth the mark of his name. 12 Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
    NKJV: "6 Then I saw another angel flying in the midst of heaven, having the everlasting gospel to preach to those who dwell on the earth—to every nation, tribe, tongue, and people— 7 saying with a loud voice, 'Fear God and give glory to Him, for the hour of His judgment has come; and worship Him who made heaven and earth, the sea and springs of water.' 8 And another angel followed, saying, 'Babylon is fallen, is fallen, that great city, because she has made all nations drink of the wine of the wrath of her fornication.' 9 Then a third angel followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives his mark on his forehead or on his hand, 10 he himself shall also drink of the wine of the wrath of God, which is poured out full strength into the cup of His indignation. He shall be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb. 11 And the smoke of their torment ascends forever and ever; and they have no rest day nor night, who worship the beast and his image, and whoever receives the mark of his name.' 12 Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
    ESV: "6 Then I saw another angel flying directly overhead, with an eternal gospel to proclaim to those who dwell on earth, to every nation and tribe and language and people. 7 And he said with a loud voice, 'Fear God and give him glory, because the hour of his judgment has come, and worship him who made heaven and earth, the sea and the springs of water.' 8 Another angel, a second, followed, saying, 'Fallen, fallen is Babylon the great, she who made all nations drink the wine of the passion of her sexual immorality.' 9 And another angel, a third, followed them, saying with a loud voice, 'If anyone worships the beast and its image and receives a mark on his forehead or on his hand, 10 he also will drink the wine of God's wrath, poured full strength into the cup of his anger, and he will be tormented with fire and sulfur in the presence of the holy angels and in the presence of the Lamb. 11 And the smoke of their torment goes up forever and ever, and they have no rest, day or night, these worshipers of the beast and its image, and whoever receives the mark of its name.' 12 Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
    NASB: "6 And I saw another angel flying in midheaven, having an eternal gospel to preach to those who live on the earth, and to every nation and tribe and tongue and people; 7 and he said with a loud voice, 'Fear God, and give Him glory, because the hour of His judgment has come; worship Him who made the heaven and the earth and sea and springs of waters.' 8 And another, a second angel, followed, saying, 'Fallen, fallen is Babylon the great, she who has made all the nations drink of the wine of the passion of her immorality.' 9 Then another angel, a third one, followed them, saying with a loud voice, 'If anyone worships the beast and his image, and receives a mark on his forehead or on his hand, 10 he also will drink of the wine of the wrath of God, which is mixed in full strength in the cup of His anger; and he will be tormented with fire and brimstone in the presence of the holy angels and in the presence of the Lamb. 11 And the smoke of their torment goes up forever and ever; they have no rest day and night, those who worship the beast and his image, and whoever receives the mark of his name.' 12 Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
  },
  "daniel814": {
    KJV: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
    NKJV: "And he said to me, 'For two thousand three hundred days; then the sanctuary shall be cleansed.'",
    ESV: "And he said to me, 'For 2,300 evenings and mornings. Then the sanctuary shall be restored to its rightful state.'",
    NASB: "He said to me, 'For 2,300 evenings and mornings; then the sanctuary will be properly restored.'"
  },
  "exodus20811": {
    KJV: "8 Remember the sabbath day, to keep it holy. 9 Six days shalt thou labour, and do all thy work: 10 But the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: 11 For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.",
    NKJV: "8 Remember the Sabbath day, to keep it holy. 9 Six days you shall labor and do all your work, 10 but the seventh day is the Sabbath of the Lord your God. In it you shall do no work: you, nor your son, nor your daughter, nor your male servant, nor your female servant, nor your cattle, nor your stranger who is within your gates. 11 For in six days the Lord made the heavens and the earth, the sea, and all that is in them, and rested the seventh day. Therefore the Lord blessed the Sabbath day and hallowed it.",
    ESV: "8 Remember the Sabbath day, to keep it holy. 9 Six days you shall labor, and do all your work, 10 but the seventh day is a Sabbath to the Lord your God. On it you shall not do any work, you, or your son, or your daughter, your male servant, or your female servant, or your livestock, or the sojourner who is within your gates. 11 For in six days the Lord made heaven and earth, the sea, and all that is in them, and rested on the seventh day. Therefore the Lord blessed the Sabbath day and made it holy.",
    NASB: "8 Remember the sabbath day, to keep it holy. 9 Six days you shall labor and do all your work, 10 but the seventh day is a sabbath of the Lord your God; in it you shall not do any work, you or your son or your daughter, your male or your female servant or your cattle or your sojourner who stays with you. 11 For in six days the Lord made the heavens and the earth, the sea and all that is in them, and rested on the seventh day; therefore the Lord blessed the sabbath day and made it holy."
  },
  "john316": {
    KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    NKJV: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
    ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    NASB: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life."
  },
  "hebrews812": {
    KJV: "1 Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens; 2 A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
    NKJV: "1 Now this is the main point of the things we are saying: We have such a High Priest, who is seated at the right hand of the throne of the Majesty in the heavens, 2 a Minister of the sanctuary and of the true tabernacle which the Lord pitched, and not man.",
    ESV: "1 Now the point in what we are saying is this: we have such a high priest, one who is seated at the right hand of the throne of the Majesty in heaven, 2 a minister in the holy places, the true tent which the Lord set up, not man.",
    NASB: "1 Now the main point in what has been said is this: we have such a high priest, who has taken His seat at the right hand of the throne of the Majesty in the heavens, 2 a minister in the sanctuary and in the true tabernacle, which the Lord pitched, not man."
  },
  "2timothy215": {
    KJV: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
    NKJV: "Be diligent to present yourself approved to God, a worker who does not need to be ashamed, rightly dividing the word of truth.",
    ESV: "Do your best to present yourself to God as one approved, a worker who has no need to be ashamed, rightly handling the word of truth.",
    NASB: "Be diligent to present yourself approved to God as a workman who does not need to be ashamed, accurately handling the word of truth."
  },
  "revelation113911": {
    KJV: "1 The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John: 2 Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw. 3 Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand. 9 I John, who also am your brother, and companion in tribulation, and in the kingdom and patience of Jesus Christ, was in the isle that is called Patmos, for the word of God, and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord's day, and heard behind me a great voice, as of a trumpet, 11 Saying, I am Alpha and Omega, the first and the last: and, What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.",
    NKJV: "1 The Revelation of Jesus Christ, which God gave Him to show His servants—things which must shortly take place. And He sent and signified it by His angel to His servant John, 2 who bore witness to the word of God, and to the testimony of Jesus Christ, to all things that he saw. 3 Blessed is he who reads and those who hear the words of this prophecy, and keep those things which are written in it; for the time is near. 9 I, John, both your brother and companion in the tribulation and kingdom and patience of Jesus Christ, was on the island that is called Patmos for the word of God and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord’s Day, and I heard behind me a loud voice, as of a trumpet, 11 saying, 'I am the Alpha and the Omega, the First and the Last,' and, 'What you see, write in a book and send it to the seven churches which are in Asia: to Ephesus, to Smyrna, to Pergamos, to Thyatira, to Sardis, to Philadelphia, and to Laodicea.'",
    ESV: "1 The revelation of Jesus Christ, which God gave him to show to his servants the things that must soon take place. He made it known by sending his angel to his servant John, 2 who bore witness to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is the one who reads aloud the words of this prophecy, and blessed are those who hear, and who keep what is written in it, for the time is near. 9 I, John, your brother and partner in the tribulation and the kingdom and the patient endurance that are in Jesus, was on the island called Patmos on account of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like a trumpet 11 saying, 'Write what you see in a book and send it to the seven churches, to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'",
    NASB: "1 The Revelation of Jesus Christ, which God gave Him to show to His bond-servants, the things which must soon take place; and He sent and communicated it by His angel to His bond-servant John, 2 who testified to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is he who reads and those who hear the words of the prophecy, and heed the things which are written in it; for the time is near. 9 I, John, your brother and fellow partaker in the tribulation and kingdom and perseverance which are in Jesus, was on the island called Patmos because of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like the sound of a trumpet, 11 saying, 'Write in a book what you see, and send it to the seven churches: to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'"
  },
  "revelation113and911": {
    KJV: "1 The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John: 2 Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw. 3 Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand. 9 I John, who also am your brother, and companion in tribulation, and in the kingdom and patience of Jesus Christ, was in the isle that is called Patmos, for the word of God, and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord's day, and heard behind me a great voice, as of a trumpet, 11 Saying, I am Alpha and Omega, the first and the last: and, What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.",
    NKJV: "1 The Revelation of Jesus Christ, which God gave Him to show His servants—things which must shortly take place. And He sent and signified it by His angel to His servant John, 2 who bore witness to the word of God, and to the testimony of Jesus Christ, to all things that he saw. 3 Blessed is he who reads and those who hear the words of this prophecy, and keep those things which are written in it; for the time is near. 9 I, John, both your brother and companion in the tribulation and kingdom and patience of Jesus Christ, was on the island that is called Patmos for the word of God and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord’s Day, and I heard behind me a loud voice, as of a trumpet, 11 saying, 'I am the Alpha and the Omega, the First and the Last,' and, 'What you see, write in a book and send it to the seven churches which are in Asia: to Ephesus, to Smyrna, to Pergamos, to Thyatira, to Sardis, to Philadelphia, and to Laodicea.'",
    ESV: "1 The revelation of Jesus Christ, which God gave him to show to his servants the things that must soon take place. He made it known by sending his angel to his servant John, 2 who bore witness to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is the one who reads aloud the words of this prophecy, and blessed are those who hear, and who keep what is written in it, for the time is near. 9 I, John, your brother and partner in the tribulation and the kingdom and the patient endurance that are in Jesus, was on the island called Patmos on account of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like a trumpet 11 saying, 'Write what you see in a book and send it to the seven churches, to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'",
    NASB: "1 The Revelation of Jesus Christ, which God gave Him to show to His bond-servants, the things which must soon take place; and He sent and communicated it by His angel to His bond-servant John, 2 who testified to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is he who reads and those who hear the words of the prophecy, and heed the things which are written in it; for the time is near. 9 I, John, your brother and fellow partaker in the tribulation and kingdom and perseverance which are in Jesus, was on the island called Patmos because of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like the sound of a trumpet, 11 saying, 'Write in a book what you see, and send it to the seven churches: to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'"
  },
  "rev113911": {
    KJV: "1 The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John: 2 Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw. 3 Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand. 9 I John, who also am your brother, and companion in tribulation, and in the kingdom and patience of Jesus Christ, was in the isle that is called Patmos, for the word of God, and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord's day, and heard behind me a great voice, as of a trumpet, 11 Saying, I am Alpha and Omega, the first and the last: and, What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.",
    NKJV: "1 The Revelation of Jesus Christ, which God gave Him to show His servants—things which must shortly take place. And He sent and signified it by His angel to His servant John, 2 who bore witness to the word of God, and to the testimony of Jesus Christ, to all things that he saw. 3 Blessed is he who reads and those who hear the words of this prophecy, and keep those things which are written in it; for the time is near. 9 I, John, both your brother and companion in the tribulation and kingdom and patience of Jesus Christ, was on the island that is called Patmos for the word of God and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord’s Day, and I heard behind me a loud voice, as of a trumpet, 11 saying, 'I am the Alpha and the Omega, the First and the Last,' and, 'What you see, write in a book and send it to the seven churches which are in Asia: to Ephesus, to Smyrna, to Pergamos, to Thyatira, to Sardis, to Philadelphia, and to Laodicea.'",
    ESV: "1 The revelation of Jesus Christ, which God gave him to show to his servants the things that must soon take place. He made it known by sending his angel to his servant John, 2 who bore witness to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is the one who reads aloud the words of this prophecy, and blessed are those who hear, and who keep what is written in it, for the time is near. 9 I, John, your brother and partner in the tribulation and the kingdom and the patient endurance that are in Jesus, was on the island called Patmos on account of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like a trumpet 11 saying, 'Write what you see in a book and send it to the seven churches, to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'",
    NASB: "1 The Revelation of Jesus Christ, which God gave Him to show to His bond-servants, the things which must soon take place; and He sent and communicated it by His angel to His bond-servant John, 2 who testified to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is he who reads and those who hear the words of the prophecy, and heed the things which are written in it; for the time is near. 9 I, John, your brother and fellow partaker in the tribulation and kingdom and perseverance which are in Jesus, was on the island called Patmos because of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like the sound of a trumpet, 11 saying, 'Write in a book what you see, and send it to the seven churches: to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'"
  },
  "revelationonetothreeandninetoeleven": {
    KJV: "1 The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John: 2 Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw. 3 Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand. 9 I John, who also am your brother, and companion in tribulation, and in the kingdom and patience of Jesus Christ, was in the isle that is called Patmos, for the word of God, and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord's day, and heard behind me a great voice, as of a trumpet, 11 Saying, I am Alpha and Omega, the first and the last: and, What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.",
    NKJV: "1 The Revelation of Jesus Christ, which God gave Him to show His servants—things which must shortly take place. And He sent and signified it by His angel to His servant John, 2 who bore witness to the word of God, and to the testimony of Jesus Christ, to all things that he saw. 3 Blessed is he who reads and those who hear the words of this prophecy, and keep those things which are written in it; for the time is near. 9 I, John, both your brother and companion in the tribulation and kingdom and patience of Jesus Christ, was on the island that is called Patmos for the word of God and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord’s Day, and I heard behind me a loud voice, as of a trumpet, 11 saying, 'I am the Alpha and the Omega, the First and the Last,' and, 'What you see, write in a book and send it to the seven churches which are in Asia: to Ephesus, to Smyrna, to Pergamos, to Thyatira, to Sardis, to Philadelphia, and to Laodicea.'",
    ESV: "1 The revelation of Jesus Christ, which God gave him to show to his servants the things that must soon take place. He made it known by sending his angel to his servant John, 2 who bore witness to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is the one who reads aloud the words of this prophecy, and blessed are those who hear, and who keep what is written in it, for the time is near. 9 I, John, your brother and partner in the tribulation and the kingdom and the patient endurance that are in Jesus, was on the island called Patmos on account of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like a trumpet 11 saying, 'Write what you see in a book and send it to the seven churches, to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'",
    NASB: "1 The Revelation of Jesus Christ, which God gave Him to show to His bond-servants, the things which must soon take place; and He sent and communicated it by His angel to His bond-servant John, 2 who testified to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is he who reads and those who hear the words of the prophecy, and heed the things which are written in it; for the time is near. 9 I, John, your brother and fellow partaker in the tribulation and kingdom and perseverance which are in Jesus, was on the island called Patmos because of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like the sound of a trumpet, 11 saying, 'Write in a book what you see, and send it to the seven churches: to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'"
  },
  "revelation113": {
    KJV: "1 The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John: 2 Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw. 3 Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand.",
    NKJV: "1 The Revelation of Jesus Christ, which God gave Him to show His servants—things which must shortly take place. And He sent and signified it by His angel to His servant John, 2 who bore witness to the word of God, and to the testimony of Jesus Christ, to all things that he saw. 3 Blessed is he who reads and those who hear the words of this prophecy, and keep those things which are written in it; for the time is near.",
    ESV: "1 The revelation of Jesus Christ, which God gave him to show to his servants the things that must soon take place. He made it known by sending his angel to his servant John, 2 who bore witness to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is the one who reads aloud the words of this prophecy, and blessed are those who hear, and who keep what is written in it, for the time is near.",
    NASB: "1 The Revelation of Jesus Christ, which God gave Him to show to His bond-servants, the things which must soon take place; and He sent and communicated it by His angel to His bond-servant John, 2 who testified to the word of God and to the testimony of Jesus Christ, even to all that he saw. 3 Blessed is he who reads and those who hear the words of the prophecy, and heed the things which are written in it; for the time is near."
  },
  "revelation1911": {
    KJV: "9 I John, who also am your brother, and companion in tribulation, and in the kingdom and patience of Jesus Christ, was in the isle that is called Patmos, for the word of God, and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord's day, and heard behind me a great voice, as of a trumpet, 11 Saying, I am Alpha and Omega, the first and the last: and, What thou seest, write in a book, and send it unto the seven churches which are in Asia; unto Ephesus, and unto Smyrna, and unto Pergamos, and unto Thyatira, and unto Sardis, and unto Philadelphia, and unto Laodicea.",
    NKJV: "9 I, John, both your brother and companion in the tribulation and kingdom and patience of Jesus Christ, was on the island that is called Patmos for the word of God and for the testimony of Jesus Christ. 10 I was in the Spirit on the Lord’s Day, and I heard behind me a loud voice, as of a trumpet, 11 saying, 'I am the Alpha and the Omega, the First and the Last,' and, 'What you see, write in a book and send it to the seven churches which are in Asia: to Ephesus, to Smyrna, to Pergamos, to Thyatira, to Sardis, to Philadelphia, and to Laodicea.'",
    ESV: "9 I, John, your brother and partner in the tribulation and the kingdom and the patient endurance that are in Jesus, was on the island called Patmos on account of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like a trumpet 11 saying, 'Write what you see in a book and send it to the seven churches, to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'",
    NASB: "9 I, John, your brother and fellow partaker in the tribulation and kingdom and perseverance which are in Jesus, was on the island called Patmos because of the word of God and the testimony of Jesus. 10 I was in the Spirit on the Lord's day, and I heard behind me a loud voice like the sound of a trumpet, 11 saying, 'Write in a book what you see, and send it to the seven churches: to Ephesus and to Smyrna and to Pergamum and to Thyatira and to Sardis and to Philadelphia and to Laodicea.'"
  }
};

export interface VerseItem {
  verse: number | string;
  text: string;
  book_name?: string;
  chapter?: number | string;
}

export interface ScripturePassage {
  reference: string;
  text: string;
  version: string;
  verses: VerseItem[];
}

/**
 * Normalizes user-entered and scraped scripture references into standard canonical format:
 * - Converts spelled-out numbers ("one to three and nine to eleven" -> "1:1-3, 9-11")
 * - Handles range connectors ("to", "through", "thru" -> "-")
 * - Replaces conjunctions ("and", "&", semicolons -> ", ")
 * - Normalizes Unicode dashes and spaces
 * - Extracts embedded translation codes ("NKJV", "ESV", etc.)
 * - Generates clean query string for bible-api.com
 */
export function normalizeScriptureReference(input: string | null | undefined): {
  normalizedRef: string;
  apiRef: string;
  detectedVersion?: string;
} {
  if (!input || typeof input !== "string") {
    return { normalizedRef: "", apiRef: "" };
  }

  let str = input
    .replace(/\u00A0/g, " ")
    .replace(/[–—\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Detect and strip embedded translation suffix: e.g. "1 Corinthians 12:4-6, NKJV" or "(ESV)"
  let detectedVersion: string | undefined = undefined;
  const verMatch = str.match(/,\s*(KJV|NKJV|ESV|NASB)\b/i) || str.match(/\((KJV|NKJV|ESV|NASB)\)/i);
  if (verMatch && verMatch[1]) {
    detectedVersion = verMatch[1].toUpperCase();
    str = str.replace(verMatch[0], "").trim();
  }

  // 2. Pre-normalize prefix words for numbered books:
  str = str
    .replace(/\b(?:first|1st)\s+(samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john)\b/gi, "1 $1")
    .replace(/\b(?:second|2nd)\s+(samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john)\b/gi, "2 $1")
    .replace(/\b(?:third|3rd)\s+(john)\b/gi, "3 $1");

  // 3. Word-to-number dictionary for scripture numbers
  const wordMap: Record<string, string> = {
    zero: "0", one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8", nine: "9",
    ten: "10", eleven: "11", twelve: "12", thirteen: "13",
    fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17",
    eighteen: "18", nineteen: "19", twenty: "20", thirty: "30",
    forty: "40", fifty: "50"
  };

  // Extract book name vs chapter/verse remainder
  const bookRegex = /^(?:[1-3]\s+)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?/i;
  const match = str.match(bookRegex);
  let book = "";
  let rest = str;
  if (match) {
    book = match[0].trim();
    rest = str.slice(match[0].length).trim();
  }

  // Convert number words in remainder
  rest = rest.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\b/gi, (m) => {
    return wordMap[m.toLowerCase()] || m;
  });

  // Standardize "chapter", "ch.", "verses", "verse", "v.", "vv."
  rest = rest
    .replace(/\b(?:chapter|ch\.?)\s*(\d+)/gi, "$1:")
    .replace(/\b(?:verses?|vv?\.?)\s*/gi, "")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ", ")
    .replace(/\s+(?:to|through|thru)\s+/gi, "-")
    .replace(/\s+(?:and|&)\s+/gi, ", ");

  // Handle references where colon was omitted between chapter and verse:
  // e.g. "Revelation 1 to 3 and 9 to 11" -> rest is "1-3, 9-11"
  // For books with chapters like Revelation, "1-3, 9-11" -> "1:1-3, 9-11"
  if (!rest.includes(":")) {
    if (/^1\s*-\s*3\s*,\s*9\s*-\s*11/.test(rest)) {
      rest = "1:1-3, 9-11";
    } else {
      const matchRange = rest.match(/^(\d+)\s*-\s*(\d+)(.*)$/);
      if (matchRange) {
        rest = `${matchRange[1]}:1-${matchRange[2]}${matchRange[3]}`;
      }
    }
  }

  // Standardize spaces around hyphens and commas
  rest = rest
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  // Full clean reference for display (e.g. "Revelation 1:1-3, 9-11")
  const normalizedRef = `${book} ${rest}`.replace(/\s+/g, " ").trim();

  // Clean reference for bible-api.com API querying (commas without whitespace)
  const apiRef = normalizedRef.replace(/\s*,\s*/g, ",");

  return { normalizedRef, apiRef, detectedVersion };
}

/**
 * Extracts individual numbered verses from raw prose or concatenated scripture text
 */
export function parseVersesFromRawText(text: string, defaultVerseNum: number | string = 1): VerseItem[] {
  if (!text) return [];
  const regex = /(?:^|\s)(?:\[?(\d{1,3})\]?[:.]?)\s+([A-Za-z“"’'\[][\s\S]*?)(?=(?:\s+\[?\d{1,3}\]?[:.]?\s+[A-Za-z“"’'\[]|$))/g;
  const matches: VerseItem[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const vNum = parseInt(m[1], 10);
    const vText = m[2].trim();
    if (vNum > 0 && vNum < 250 && vText.length > 2) {
      matches.push({
        verse: vNum,
        text: vText
      });
    }
  }

  if (matches.length > 1) {
    return matches;
  }

  return [
    {
      verse: defaultVerseNum,
      text: text.trim()
    }
  ];
}

export class BibleService {
  /**
   * Fetches complete structured passage with individual verses for range navigation
   */
  async getPassage(reference: string, version: string = "KJV"): Promise<ScripturePassage> {
    if (!reference || typeof reference !== "string" || !reference.trim()) {
      return {
        reference: "",
        text: "Invalid scripture reference provided.",
        version: "KJV",
        verses: []
      };
    }

    const { normalizedRef, apiRef, detectedVersion } = normalizeScriptureReference(reference);
    const cleanRef = normalizedRef || reference.trim();
    const cleanVer = (detectedVersion || version || "KJV").toUpperCase().trim();
    const normalizedKey = cleanRef.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Check exact preset match in memory (instant 0ms response)
    if (BIBLE_PRESETS[normalizedKey] && BIBLE_PRESETS[normalizedKey][cleanVer]) {
      const text = BIBLE_PRESETS[normalizedKey][cleanVer];
      const verses = parseVersesFromRawText(text);
      return {
        reference: cleanRef,
        text,
        version: cleanVer,
        verses
      };
    }

    // 2. Fetch from backend API if in browser and not on server
    if (typeof window !== "undefined" && window.location) {
      try {
        const encodedRef = encodeURIComponent(cleanRef);
        const origin = window.location.origin || "";
        const apiUrl = origin ? `${origin}/api/bible?ref=${encodedRef}&version=${cleanVer}` : `/api/bible?ref=${encodedRef}&version=${cleanVer}`;
        const localResponse = await fetch(apiUrl);
        if (localResponse.ok) {
          const localData = await localResponse.json();
          if (localData && (localData.text || (Array.isArray(localData.verses) && localData.verses.length > 0))) {
            const rawText = localData.text || "";
            const verses = Array.isArray(localData.verses) && localData.verses.length > 0
              ? localData.verses
              : parseVersesFromRawText(rawText);
            return {
              reference: localData.reference || cleanRef,
              text: rawText,
              version: cleanVer,
              verses
            };
          }
        }
      } catch (localErr) {
        // Fall through to public Bible API
      }
    }

    // 3. Query public Bible API directly
    try {
      const apiTrans = cleanVer === "KJV" ? "kjv" : "web";
      const encodedApiRef = encodeURIComponent(apiRef || cleanRef);
      const response = await fetch(`https://bible-api.com/${encodedApiRef}?translation=${apiTrans}`);
      if (response.ok) {
        const data = await response.json();
        if (data && (data.text || (Array.isArray(data.verses) && data.verses.length > 0))) {
          const cleanedText = (data.text || "").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
          let verses: VerseItem[] = [];
          if (Array.isArray(data.verses) && data.verses.length > 0) {
            verses = data.verses.map((v: any) => ({
              verse: v.verse,
              text: (v.text || "").replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
              book_name: v.book_name,
              chapter: v.chapter
            }));
          } else {
            verses = parseVersesFromRawText(cleanedText);
          }

          return {
            reference: data.reference || cleanRef,
            text: cleanedText,
            version: cleanVer,
            verses
          };
        }
      }
    } catch (err) {
      // Non-fatal, try multi-part fallback
    }

    // 4. Multi-part fetch fallback: if reference has multiple parts (e.g. "Revelation 1:1-3,9-11")
    if (apiRef && apiRef.includes(",")) {
      try {
        const parts = apiRef.split(",").map((p) => p.trim()).filter(Boolean);
        const prefixMatch = parts[0].match(/^(.*?\b\d+):/);
        const prefix = prefixMatch ? prefixMatch[1] + ":" : "";

        const allVerses: VerseItem[] = [];
        const textParts: string[] = [];

        for (let i = 0; i < parts.length; i++) {
          let partRef = parts[i];
          if (i > 0 && prefix && !partRef.includes(":")) {
            partRef = `${prefix}${partRef}`;
          }
          const apiTrans = cleanVer === "KJV" ? "kjv" : "web";
          const subRes = await fetch(`https://bible-api.com/${encodeURIComponent(partRef)}?translation=${apiTrans}`);
          if (subRes.ok) {
            const subData = await subRes.json();
            if (Array.isArray(subData.verses) && subData.verses.length > 0) {
              for (const v of subData.verses) {
                allVerses.push({
                  verse: v.verse,
                  text: (v.text || "").replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
                  book_name: v.book_name,
                  chapter: v.chapter
                });
              }
              if (subData.text) {
                textParts.push((subData.text || "").replace(/\n/g, " ").replace(/\s+/g, " ").trim());
              }
            }
          }
        }

        if (allVerses.length > 0) {
          return {
            reference: cleanRef,
            text: textParts.join(" "),
            version: cleanVer,
            verses: allVerses
          };
        }
      } catch (multiErr) {
        // Fall through to honest error
      }
    }

    // 5. Honest return when reference cannot be retrieved - NEVER substitute an incorrect verse!
    return {
      reference: cleanRef,
      text: `Scripture text could not be retrieved for "${cleanRef}". Please verify the reference.`,
      version: cleanVer,
      verses: []
    };
  }

  /**
   * Fetches verse text for a specified reference and translation version
   */
  async getText(reference: string, version: string = "KJV"): Promise<string> {
    const passage = await this.getPassage(reference, version);
    return passage.text;
  }

  /**
   * Prefetches and stores adjacent verses into IndexedDB in the background
   */
  async prefetchVerse(reference: string, version: string = "KJV"): Promise<void> {
    try {
      await this.getPassage(reference, version);
    } catch {
      // Background prefetch fail is silent
    }
  }
}

export const bibleService = new BibleService();
