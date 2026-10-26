/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TopicalVerse {
  verseNumber: number;
  reference: string;
  text: {
    KJV: string;
    NKJV: string;
    ESV: string;
    NASB: string;
  };
}

export const CURATED_TOPICAL_THEMES: Record<string, TopicalVerse[]> = {
  grace: [
    {
      verseNumber: 8,
      reference: "Genesis 6:8",
      text: {
        KJV: "But Noah found grace in the eyes of the LORD.",
        NKJV: "But Noah found grace in the eyes of the LORD.",
        ESV: "But Noah found favor in the eyes of the LORD.",
        NASB: "But Noah found favor in the eyes of the LORD."
      }
    },
    {
      verseNumber: 17,
      reference: "Exodus 33:17",
      text: {
        KJV: "And the LORD said unto Moses, I will do this thing also that thou hast spoken: for thou hast found grace in my sight, and I know thee by name.",
        NKJV: "So the LORD said to Moses, 'I will also do this thing that you have spoken; for you have found grace in My sight, and I know you by name.'",
        ESV: "And the LORD said to Moses, 'This very thing that you have spoken I will do, for you have found favor in my sight, and I know you by name.'",
        NASB: "The LORD said to Moses, 'I will also do this thing of which you have spoken; for you have found favor in My sight and I have known you by name.'"
      }
    },
    {
      verseNumber: 34,
      reference: "Proverbs 3:34",
      text: {
        KJV: "Surely he scorneth the scorners: but he giveth grace unto the lowly.",
        NKJV: "Surely He scorns the scornful, But gives grace to the humble.",
        ESV: "Toward the scorners he is scornful, but to the humble he gives favor.",
        NASB: "Though He scoffs at the scoffers, Yet He gives grace to the afflicted."
      }
    },
    {
      verseNumber: 10,
      reference: "Zechariah 12:10",
      text: {
        KJV: "And I will pour upon the house of David, and upon the inhabitants of Jerusalem, the spirit of grace and of supplications: and they shall look upon me whom they have pierced...",
        NKJV: "And I will pour on the house of David and on the inhabitants of Jerusalem the Spirit of grace and supplication; then they will look on Me whom they pierced...",
        ESV: "And I will pour out on the house of David and the inhabitants of Jerusalem a spirit of grace and pleas for mercy, so that, when they look on me, on him whom they have pierced...",
        NASB: "I will pour out on the house of David and on the inhabitants of Jerusalem, the Spirit of grace and of supplication, so that they will look on Me whom they have pierced..."
      }
    },
    {
      verseNumber: 40,
      reference: "Luke 2:40",
      text: {
        KJV: "And the child grew, and waxed strong in spirit, filled with wisdom: and the grace of God was upon him.",
        NKJV: "And the Child grew and became strong in spirit, filled with wisdom; and the grace of God was upon Him.",
        ESV: "And the child grew and became strong, filled with wisdom. And the favor of God was upon him.",
        NASB: "The Child continued to grow and become strong, increasing in wisdom; and the grace of God was upon Him."
      }
    },
    {
      verseNumber: 14,
      reference: "John 1:14",
      text: {
        KJV: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
        NKJV: "And the Word became flesh and dwelt among us, and we beheld His glory, the glory as of the only begotten of the Father, full of grace and truth.",
        ESV: "And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.",
        NASB: "And the Word became flesh, and dwelt among us, and we saw His glory, glory as of the only begotten from the Father, full of grace and truth."
      }
    },
    {
      verseNumber: 16,
      reference: "John 1:16",
      text: {
        KJV: "And of his fulness have all we received, and grace for grace.",
        NKJV: "And of His fullness we have all received, and grace for grace.",
        ESV: "For from his fullness we have all received, grace upon grace.",
        NASB: "For of His fullness we have all received, and grace upon grace."
      }
    },
    {
      verseNumber: 17,
      reference: "John 1:17",
      text: {
        KJV: "For the law was given by Moses, but grace and truth came by Jesus Christ.",
        NKJV: "For the law was given through Moses, but grace and truth came through Jesus Christ.",
        ESV: "For the law was given through Moses; grace and truth came through Jesus Christ.",
        NASB: "For the Law was given through Moses; grace and truth were realized through Jesus Christ."
      }
    },
    {
      verseNumber: 33,
      reference: "Acts 4:33",
      text: {
        KJV: "And with great power gave the apostles witness of the resurrection of the Lord Jesus: and great grace was upon them all.",
        NKJV: "And with great power the apostles gave witness to the resurrection of the Lord Jesus. And great grace was upon them all.",
        ESV: "And with great power the apostles were giving their testimony to the resurrection of the Lord Jesus, and great grace was upon them all.",
        NASB: "And with great power the apostles were giving testimony to the resurrection of the Lord Jesus, and abundant grace was upon them all."
      }
    },
    {
      verseNumber: 11,
      reference: "Acts 15:11",
      text: {
        KJV: "But we believe that through the grace of the Lord Jesus Christ we shall be saved, even as they.",
        NKJV: "But we believe that through the grace of the Lord Jesus Christ we shall be saved in the same manner as they.",
        ESV: "But we believe that we will be saved through the grace of the Lord Jesus, just as they will.",
        NASB: "But we believe that we are saved through the grace of the Lord Jesus, in the same way as they also are."
      }
    },
    {
      verseNumber: 24,
      reference: "Romans 3:24",
      text: {
        KJV: "Being justified freely by his grace through the redemption that is in Christ Jesus:",
        NKJV: "being justified freely by His grace through the redemption that is in Christ Jesus,",
        ESV: "and are justified by his grace as a gift, through the redemption that is in Christ Jesus,",
        NASB: "being justified as a gift by His grace through the redemption which is in Christ Jesus;"
      }
    },
    {
      verseNumber: 1,
      reference: "Romans 5:1",
      text: {
        KJV: "Therefore being justified by faith, we have peace with God through our Lord Jesus Christ:",
        NKJV: "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ,",
        ESV: "Therefore, since we have been justified by faith, we have peace with God through our Lord Jesus Christ.",
        NASB: "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ,"
      }
    },
    {
      verseNumber: 2,
      reference: "Romans 5:2",
      text: {
        KJV: "By whom also we have access by faith into this grace wherein we stand, and rejoice in hope of the glory of God.",
        NKJV: "through whom also we have access by faith into this grace in which we stand, and rejoice in hope of the glory of God.",
        ESV: "Through him we have also obtained access by faith into this grace in which we stand, and we rejoice in hope of the glory of God.",
        NASB: "through whom also we have obtained our introduction by faith into this grace in which we stand; and we exult in hope of the glory of God."
      }
    },
    {
      verseNumber: 15,
      reference: "Romans 5:15",
      text: {
        KJV: "But not as the offence, so also is the free gift. For if through the offence of one many be dead, much more the grace of God, and the gift by grace, which is by one man, Jesus Christ, hath abounded unto many.",
        NKJV: "But the free gift is not like the offense. For if by the one man's offense many died, much more the grace of God and the gift by the grace of the one Man, Jesus Christ, abounded to many.",
        ESV: "But the free gift is not like the trespass. For if many died through one man's trespass, much more have the grace of God and the free gift by the grace of that one man Jesus Christ abounded for many.",
        NASB: "But the free gift is not like the transgression. For if by the transgression of the one the many died, much more did the grace of God and the gift by the grace of the one Man, Jesus Christ, abound to the many."
      }
    },
    {
      verseNumber: 20,
      reference: "Romans 5:20",
      text: {
        KJV: "Moreover the law entered, that the offence might abound. But where sin abounded, grace did much more abound:",
        NKJV: "Moreover the law entered that the offense might abound. But where sin abounded, grace abounded much more,",
        ESV: "Now the law came in to increase the trespass, but where sin increased, grace abounded all the more,",
        NASB: "The Law came in so that the transgression would increase; but where sin increased, grace abounded all the more,"
      }
    },
    {
      verseNumber: 21,
      reference: "Romans 5:21",
      text: {
        KJV: "That as sin hath reigned unto death, even so might grace reign through righteousness unto eternal life by Jesus Christ our Lord.",
        NKJV: "so that as sin reigned in death, even so grace might reign through righteousness to eternal life through Jesus Christ our Lord.",
        ESV: "so that, as sin reigned in death, grace also might reign through righteousness leading to eternal life through Jesus Christ our Lord.",
        NASB: "so that, as sin reigned in death, even so grace would reign through righteousness to eternal life through Jesus Christ our Lord."
      }
    },
    {
      verseNumber: 14,
      reference: "Romans 6:14",
      text: {
        KJV: "For sin shall not have dominion over you: for ye are not under the law, but under grace.",
        NKJV: "For sin shall not have dominion over you, for you are not under law but under grace.",
        ESV: "For sin will have no dominion over you, since you are not under law but under grace.",
        NASB: "For sin shall not be master over you, for you are not under law but under grace."
      }
    },
    {
      verseNumber: 6,
      reference: "Romans 11:6",
      text: {
        KJV: "And if by grace, then is it no more of works: otherwise grace is no more grace. But if it be of works, then is it no more grace: otherwise work is no more work.",
        NKJV: "And if by grace, then it is no longer of works; otherwise grace is no longer grace. But if it is of works, it is no longer grace; otherwise work is no longer work.",
        ESV: "But if it is by grace, it is no longer on the basis of works; otherwise grace would no longer be grace.",
        NASB: "But if it is by grace, it is no longer on the basis of works, otherwise grace is no longer grace."
      }
    },
    {
      verseNumber: 10,
      reference: "1 Corinthians 15:10",
      text: {
        KJV: "But by the grace of God I am what I am: and his grace which was bestowed upon me was not in vain; but I laboured more abundantly than they all: yet not I, but the grace of God which was with me.",
        NKJV: "But by the grace of God I am what I am, and His grace toward me was not in vain; but I labored more abundantly than they all, yet not I, but the grace of God which was with me.",
        ESV: "But by the grace of God I am what I am, and his grace toward me was not in vain. On the contrary, I worked harder than any of them, though it was not I, but the grace of God that is with me.",
        NASB: "But by the grace of God I am what I am, and His grace toward me did not prove vain; but I labored even more than all of them, yet not I, but the grace of God with me."
      }
    },
    {
      verseNumber: 9,
      reference: "2 Corinthians 8:9",
      text: {
        KJV: "For ye know the grace of our Lord Jesus Christ, that, though he was rich, yet for your sakes he became poor, that ye through his poverty might be rich.",
        NKJV: "For you know the grace of our Lord Jesus Christ, that though He was rich, yet for your sakes He became poor, that you through His poverty might become rich.",
        ESV: "For you know the grace of our Lord Jesus Christ, that though he was rich, yet for your sake he became poor, so that you by his poverty might become rich.",
        NASB: "For you know the grace of our Lord Jesus Christ, that though He was rich, yet for your sake He became poor, so that you through His poverty might become rich."
      }
    },
    {
      verseNumber: 8,
      reference: "2 Corinthians 9:8",
      text: {
        KJV: "And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work:",
        NKJV: "And God is able to make all grace abound toward you, that you, always having all sufficiency in all things, may have an abundance for every good work.",
        ESV: "And God is able to make all grace abound to you, so that having all sufficiency in all things at all times, you may abound in every good work.",
        NASB: "And God is able to make all grace abound to you, so that always having all sufficiency in everything, you may have an abundance for every good work;"
      }
    },
    {
      verseNumber: 9,
      reference: "2 Corinthians 12:9",
      text: {
        KJV: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.",
        NKJV: "And He said to me, 'My grace is sufficient for you, for My strength is made perfect in weakness.' Therefore most gladly I will rather boast in my infirmities, that the power of Christ may rest upon me.",
        ESV: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.",
        NASB: "And He has said to me, 'My grace is sufficient for you, for power is perfected in weakness.' Most gladly, therefore, I will rather boast about my weaknesses, so that the power of Christ may dwell in me."
      }
    },
    {
      verseNumber: 6,
      reference: "Galatians 1:6",
      text: {
        KJV: "I marvel that ye are so soon removed from him that called you into the grace of Christ unto another gospel:",
        NKJV: "I marvel that you are turning away so soon from Him who called you in the grace of Christ, to a different gospel,",
        ESV: "I am astonished that you are so quickly deserting him who called you in the grace of Christ and are turning to a different gospel—",
        NASB: "I am amazed that you are so quickly deserting Him who called you by the grace of Christ, for a different gospel;"
      }
    },
    {
      verseNumber: 21,
      reference: "Galatians 2:21",
      text: {
        KJV: "I do not frustrate the grace of God: for if righteousness come by the law, then Christ is dead in vain.",
        NKJV: "I do not set aside the grace of God; for if righteousness comes through the law, then Christ died in vain.",
        ESV: "I do not nullify the grace of God, for if righteousness were through the law, then Christ died for no purpose.",
        NASB: "I do not nullify the grace of God, for if righteousness comes through the Law, then Christ died needlessly."
      }
    },
    {
      verseNumber: 7,
      reference: "Ephesians 1:7",
      text: {
        KJV: "In whom we have redemption through his blood, the forgiveness of sins, according to the riches of his grace;",
        NKJV: "In Him we have redemption through His blood, the forgiveness of sins, according to the riches of His grace",
        ESV: "In him we have redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace,",
        NASB: "In Him we have redemption through His blood, the forgiveness of our trespasses, according to the riches of His grace"
      }
    },
    {
      verseNumber: 5,
      reference: "Ephesians 2:5",
      text: {
        KJV: "Even when we were dead in sins, hath quickened us together with Christ, (by grace ye are saved;)",
        NKJV: "even when we were dead in trespasses, made us alive together with Christ (by grace you have been saved),",
        ESV: "even when we were dead in our trespasses, made us alive together with Christ—by grace you have been saved—",
        NASB: "even when we were dead in our transgressions, made us alive together with Christ (by grace you have been saved),"
      }
    },
    {
      verseNumber: 8,
      reference: "Ephesians 2:8",
      text: {
        KJV: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:",
        NKJV: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God,",
        ESV: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God,",
        NASB: "For by grace you have been saved through faith; and that not of yourselves, it is the gift of God;"
      }
    },
    {
      verseNumber: 9,
      reference: "Ephesians 2:9",
      text: {
        KJV: "Not of works, lest any man should boast.",
        NKJV: "not of works, lest anyone should boast.",
        ESV: "not a result of works, so that no one may boast.",
        NASB: "not as a result of works, so that no one may boast."
      }
    },
    {
      verseNumber: 6,
      reference: "Colossians 4:6",
      text: {
        KJV: "Let your speech be alway with grace, seasoned with salt, that ye may know how ye ought to answer every man.",
        NKJV: "Let your speech always be with grace, seasoned with salt, that you may know how you ought to answer each one.",
        ESV: "Let your speech always be gracious, seasoned with salt, so that you may know how you ought to answer each person.",
        NASB: "Let your speech always be with grace, as though seasoned with salt, so that you will know how you should respond to each person."
      }
    },
    {
      verseNumber: 16,
      reference: "2 Thessalonians 2:16",
      text: {
        KJV: "Now our Lord Jesus Christ himself, and God, even our Father, which hath loved us, and hath given us everlasting consolation and good hope through grace,",
        NKJV: "Now may our Lord Jesus Christ Himself, and our God and Father, who has loved us and given us everlasting consolation and good hope by grace,",
        ESV: "Now may our Lord Jesus Christ himself, and God our Father, who loved us and gave us eternal comfort and good hope through grace,",
        NASB: "Now may our Lord Jesus Christ Himself and God our Father, who has loved us and given us eternal comfort and good hope by grace,"
      }
    },
    {
      verseNumber: 14,
      reference: "1 Timothy 1:14",
      text: {
        KJV: "And the grace of our Lord was exceeding abundant with faith and love which is in Christ Jesus.",
        NKJV: "And the grace of our Lord was exceedingly abundant, with faith and love which are in Christ Jesus.",
        ESV: "and the grace of our Lord overflowed for me with the faith and love that are in Christ Jesus.",
        NASB: "and the grace of our Lord was more than abundant, with the faith and love which are found in Christ Jesus."
      }
    },
    {
      verseNumber: 9,
      reference: "2 Timothy 1:9",
      text: {
        KJV: "Who hath saved us, and called us with an holy calling, not according to our works, but according to his own purpose and grace, which was given us in Christ Jesus before the world began,",
        NKJV: "who has saved us and called us with a holy calling, not according to our works, but according to His own purpose and grace which was given to us in Christ Jesus before time began,",
        ESV: "who saved us and called us to a holy calling, not because of our works but because of his own purpose and grace, which he gave us in Christ Jesus before the ages began,",
        NASB: "who has saved us and called us with a holy calling, not according to our works, but according to His own purpose and grace which was granted us in Christ Jesus from all eternity,"
      }
    },
    {
      verseNumber: 11,
      reference: "Titus 2:11",
      text: {
        KJV: "For the grace of God that bringeth salvation hath appeared to all men,",
        NKJV: "For the grace of God that brings salvation has appeared to all men,",
        ESV: "For the grace of God has appeared, bringing salvation for all people,",
        NASB: "For the grace of God has appeared, bringing salvation to all men,"
      }
    },
    {
      verseNumber: 12,
      reference: "Titus 2:12",
      text: {
        KJV: "Teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly, in this present world;",
        NKJV: "teaching us that, denying ungodliness and worldly lusts, we should live soberly, righteously, and godly in the present age,",
        ESV: "training us to renounce ungodliness and worldly passions, and to live self-controlled, upright, and godly lives in the present age,",
        NASB: "instructing us to deny ungodliness and worldly desires and to live sensibly, righteously and godly in the present age,"
      }
    },
    {
      verseNumber: 7,
      reference: "Titus 3:7",
      text: {
        KJV: "That being justified by his grace, we should be made heirs according to the hope of eternal life.",
        NKJV: "that having been justified by His grace we should become heirs according to the hope of eternal life.",
        ESV: "so that being justified by his grace we might become heirs according to the hope of eternal life.",
        NASB: "so that being justified by His grace we would be made heirs according to the hope of eternal life."
      }
    },
    {
      verseNumber: 9,
      reference: "Hebrews 2:9",
      text: {
        KJV: "But we see Jesus, who was made a little lower than the angels for the suffering of death, crowned with glory and honour; that he by the grace of God should taste death for every man.",
        NKJV: "But we see Jesus, who was made a little lower than the angels, for the suffering of death crowned with glory and honor, that He, by the grace of God, might taste death for everyone.",
        ESV: "But we see him who for a little while was made lower than the angels, namely Jesus, crowned with glory and honor because of the suffering of death, so that by the grace of God he might taste death for everyone.",
        NASB: "But we do see Him who was made for a little while lower than the angels, namely, Jesus, because of the suffering of death crowned with glory and honor, so that by the grace of God He might taste death for everyone."
      }
    },
    {
      verseNumber: 16,
      reference: "Hebrews 4:16",
      text: {
        KJV: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
        NKJV: "Let us therefore come boldly to the throne of grace, that we may obtain mercy and find grace to help in time of need.",
        ESV: "Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need.",
        NASB: "Therefore let us draw near with confidence to the throne of grace, so that we may receive mercy and find grace to help in time of need."
      }
    },
    {
      verseNumber: 6,
      reference: "James 4:6",
      text: {
        KJV: "But he giveth more grace. Wherefore he saith, God resisteth the proud, but giveth grace unto the humble.",
        NKJV: "But He gives more grace. Therefore He says: 'God resists the proud, But gives grace to the humble.'",
        ESV: "But he gives more grace. Therefore it says, 'God opposes the proud but gives grace to the humble.'",
        NASB: "But He gives a greater grace. Therefore it says, 'God is opposed to the proud, but gives grace to the humble.'"
      }
    },
    {
      verseNumber: 13,
      reference: "1 Peter 1:13",
      text: {
        KJV: "Wherefore gird up the loins of your mind, be sober, and hope to the end for the grace that is to be brought unto you at the revelation of Jesus Christ;",
        NKJV: "Therefore gird up the loins of your mind, be sober, and rest your hope fully upon the grace that is to be brought to you at the revelation of Jesus Christ;",
        ESV: "Therefore, preparing your minds for action, and being sober-minded, set your hope fully on the grace that will be brought to you at the revelation of Jesus Christ.",
        NASB: "Therefore, prepare your minds for action, keep sober in spirit, fix your hope completely on the grace to be brought to you at the revelation of Jesus Christ."
      }
    },
    {
      verseNumber: 10,
      reference: "1 Peter 5:10",
      text: {
        KJV: "But the God of all grace, who hath called us unto his eternal glory by Christ Jesus, after that ye have suffered a while, make you perfect, stablish, strengthen, settle you.",
        NKJV: "But may the God of all grace, who called us to His eternal glory by Christ Jesus, after you have suffered a while, perfect, establish, strengthen, and settle you.",
        ESV: "And after you have suffered a little while, the God of all grace, who has called you to his eternal glory in Christ, will himself restore, confirm, strengthen, and establish you.",
        NASB: "After you have suffered for a little while, the God of all grace, who called you to His eternal glory in Christ, will Himself perfect, confirm, strengthen and establish you."
      }
    },
    {
      verseNumber: 18,
      reference: "2 Peter 3:18",
      text: {
        KJV: "But grow in grace, and in the knowledge of our Lord and Saviour Jesus Christ. To him be glory both now and for ever. Amen.",
        NKJV: "but grow in the grace and knowledge of our Lord and Savior Jesus Christ. To Him be the glory both now and forever. Amen.",
        ESV: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ. To him be the glory both now and to the day of eternity. Amen.",
        NASB: "but grow in the grace and knowledge of our Lord and Savior Jesus Christ. To Him be the glory, both now and to the day of eternity. Amen."
      }
    },
    {
      verseNumber: 21,
      reference: "Revelation 22:21",
      text: {
        KJV: "The grace of our Lord Jesus Christ be with you all. Amen.",
        NKJV: "The grace of our Lord Jesus Christ be with you all. Amen.",
        ESV: "The grace of the Lord Jesus be with all. Amen.",
        NASB: "The grace of the Lord Jesus be with all. Amen."
      }
    }
  ],

  faith: [
    {
      verseNumber: 6,
      reference: "Genesis 15:6",
      text: {
        KJV: "And he believed in the LORD; and he counted it to him for righteousness.",
        NKJV: "And he believed in the LORD, and He accounted it to him for righteousness.",
        ESV: "And he believed the LORD, and he counted it to him as righteousness.",
        NASB: "Then he believed in the LORD; and He reckoned it to him as righteousness."
      }
    },
    {
      verseNumber: 4,
      reference: "Habakkuk 2:4",
      text: {
        KJV: "Behold, his soul which is lifted up is not upright in him: but the just shall live by his faith.",
        NKJV: "Behold the proud, His soul is not upright in him; But the just shall live by his faith.",
        ESV: "Behold, his soul is puffed up; it is not upright within him, but the righteous shall live by his faith.",
        NASB: "Behold, as for the proud one, His soul is not right within him; But the righteous will live by his faith."
      }
    },
    {
      verseNumber: 10,
      reference: "Matthew 8:10",
      text: {
        KJV: "When Jesus heard it, he marvelled, and said to them that followed, Verily I say unto you, I have not found so great faith, no, not in Israel.",
        NKJV: "When Jesus heard it, He marveled, and said to those who followed, 'Assuredly, I say to you, I have not found such great faith, not even in Israel!'",
        ESV: "When Jesus heard this, he marveled and said to those who followed him, 'Truly, I tell you, with no one in Israel have I found such faith.'",
        NASB: "Now when Jesus heard this, He marveled and said to those who were following, 'Truly I say to you, I have not found such great faith with anyone in Israel.'"
      }
    },
    {
      verseNumber: 22,
      reference: "Matthew 9:22",
      text: {
        KJV: "But Jesus turned him about, and when he saw her, he said, Daughter, be of good comfort; thy faith hath made thee whole. And the woman was made whole from that hour.",
        NKJV: "But Jesus turned around, and when He saw her He said, 'Be of good cheer, daughter; your faith has made you well.' And the woman was made well from that hour.",
        ESV: "Jesus turned, and seeing her he said, 'Take heart, daughter; your faith has made you well.' And instantly the woman was made well.",
        NASB: "But Jesus turning and seeing her said, 'Daughter, take courage; your faith has made you well.' At once the woman was made well."
      }
    },
    {
      verseNumber: 22,
      reference: "Mark 11:22",
      text: {
        KJV: "And Jesus answering saith unto them, Have faith in God.",
        NKJV: "So Jesus answered and said to them, 'Have faith in God.'",
        ESV: "And Jesus answered them, 'Have faith in God.'",
        NASB: "And Jesus answered saying to them, 'Have faith in God.'"
      }
    },
    {
      verseNumber: 5,
      reference: "Luke 17:5",
      text: {
        KJV: "And the apostles said unto the Lord, Increase our faith.",
        NKJV: "And the apostles said to the Lord, 'Increase our faith.'",
        ESV: "The apostles said to the Lord, 'Increase our faith!'",
        NASB: "The apostles said to the Lord, 'Increase our faith!'"
      }
    },
    {
      verseNumber: 17,
      reference: "Romans 1:17",
      text: {
        KJV: "For therein is the righteousness of God revealed from faith to faith: as it is written, The just shall live by faith.",
        NKJV: "For in it the righteousness of God is revealed from faith to faith; as it is written, 'The just shall live by faith.'",
        ESV: "For in it the righteousness of God is revealed from faith for faith, as it is written, 'The righteous shall live by faith.'",
        NASB: "For in it the righteousness of God is revealed from faith to faith; as it is written, 'BUT THE RIGHTEOUS man SHALL LIVE BY FAITH.'"
      }
    },
    {
      verseNumber: 28,
      reference: "Romans 3:28",
      text: {
        KJV: "Therefore we conclude that a man is justified by faith without the deeds of the law.",
        NKJV: "Therefore we conclude that a man is justified by faith apart from the deeds of the law.",
        ESV: "For we hold that one is justified by faith apart from works of the law.",
        NASB: "For we maintain that a man is justified by faith apart from works of the Law."
      }
    },
    {
      verseNumber: 1,
      reference: "Romans 5:1",
      text: {
        KJV: "Therefore being justified by faith, we have peace with God through our Lord Jesus Christ:",
        NKJV: "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ,",
        ESV: "Therefore, since we have been justified by faith, we have peace with God through our Lord Jesus Christ.",
        NASB: "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ,"
      }
    },
    {
      verseNumber: 17,
      reference: "Romans 10:17",
      text: {
        KJV: "So then faith cometh by hearing, and hearing by the word of God.",
        NKJV: "So then faith comes by hearing, and hearing by the word of God.",
        ESV: "So faith comes from hearing, and hearing through the word of Christ.",
        NASB: "So faith comes from hearing, and hearing by the word of Christ."
      }
    },
    {
      verseNumber: 7,
      reference: "2 Corinthians 5:7",
      text: {
        KJV: "(For we walk by faith, not by sight:)",
        NKJV: "For we walk by faith, not by sight.",
        ESV: "for we walk by faith, not by sight.",
        NASB: "for we walk by faith, not by sight—"
      }
    },
    {
      verseNumber: 20,
      reference: "Galatians 2:20",
      text: {
        KJV: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
        NKJV: "I have been crucified with Christ; it is no longer I who live, but Christ lives in me; and the life which I now live in the flesh I live by faith in the Son of God, who loved me and gave Himself for me.",
        ESV: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me.",
        NASB: "I have been crucified with Christ; and it is no longer I who live, but Christ lives in me; and the life which I now live in the flesh I live by faith in the Son of God, who loved me and gave Himself up for me."
      }
    },
    {
      verseNumber: 16,
      reference: "Ephesians 6:16",
      text: {
        KJV: "Above all, taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked.",
        NKJV: "above all, taking the shield of faith with which you will be able to quench all the fiery darts of the wicked one.",
        ESV: "In all circumstances take up the shield of faith, with which you can extinguish all the flaming darts of the evil one;",
        NASB: "in addition to all, taking up the shield of faith with which you will be able to extinguish all the flaming arrows of the evil one."
      }
    },
    {
      verseNumber: 1,
      reference: "Hebrews 11:1",
      text: {
        KJV: "Now faith is the substance of things hoped for, the evidence of things not seen.",
        NKJV: "Now faith is the substance of things hoped for, the evidence of things not seen.",
        ESV: "Now faith is the assurance of things hoped for, the conviction of things not seen.",
        NASB: "Now faith is the assurance of things hoped for, the conviction of things not seen."
      }
    },
    {
      verseNumber: 6,
      reference: "Hebrews 11:6",
      text: {
        KJV: "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.",
        NKJV: "But without faith it is impossible to please Him, for he who comes to God must believe that He is, and that He is a rewarder of those who diligently seek Him.",
        ESV: "And without faith it is impossible to please him, for whoever would draw near to God must believe that he exists and that he rewards those who seek him.",
        NASB: "And without faith it is impossible to please Him, for he who comes to God must believe that He is and that He is a rewarder of those who seek Him."
      }
    },
    {
      verseNumber: 2,
      reference: "Hebrews 12:2",
      text: {
        KJV: "Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.",
        NKJV: "looking unto Jesus, the author and finisher of our faith, who for the joy that was set before Him endured the cross, despising the shame, and has sat down at the right hand of the throne of God.",
        ESV: "looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before him endured the cross, despising the shame, and is seated at the right hand of the throne of God.",
        NASB: "fixing our eyes on Jesus, the author and perfecter of faith, who for the joy set before Him endured the cross, despising the shame, and has sat down at the right hand of the throne of God."
      }
    },
    {
      verseNumber: 17,
      reference: "James 2:17",
      text: {
        KJV: "Even so faith, if it hath not works, is dead, being alone.",
        NKJV: "Thus also faith by itself, if it does not have works, is dead.",
        ESV: "So also faith by itself, if it does not have works, is dead.",
        NASB: "Even so faith, if it has no works, is dead, being by itself."
      }
    },
    {
      verseNumber: 26,
      reference: "James 2:26",
      text: {
        KJV: "For as the body without the spirit is dead, so faith without works is dead also.",
        NKJV: "For as the body without the spirit is dead, so faith without works is dead also.",
        ESV: "For as the body apart from the spirit is dead, so also faith apart from works is dead.",
        NASB: "For just as the body without the spirit is dead, so also faith without works is dead."
      }
    },
    {
      verseNumber: 4,
      reference: "1 John 5:4",
      text: {
        KJV: "For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith.",
        NKJV: "For whatever is born of God overcomes the world. And this is the victory that has overcome the world—our faith.",
        ESV: "For everyone who has been born of God overcomes the world. And this is the victory that has overcome the world—our faith.",
        NASB: "For whatever is born of God overcomes the world; and this is the victory that has overcome the world—our faith."
      }
    },
    {
      verseNumber: 12,
      reference: "Revelation 14:12",
      text: {
        KJV: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.",
        NKJV: "Here is the patience of the saints; here are those who keep the commandments of God and the faith of Jesus.",
        ESV: "Here is a call for the endurance of the saints, those who keep the commandments of God and their faith in Jesus.",
        NASB: "Here is the perseverance of the saints who keep the commandments of God and their faith in Jesus."
      }
    }
  ],

  sabbath: [
    {
      verseNumber: 2,
      reference: "Genesis 2:2",
      text: {
        KJV: "And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.",
        NKJV: "And on the seventh day God ended His work which He had done, and He rested on the seventh day from all His work which He had done.",
        ESV: "And on the seventh day God finished his work that he had done, and he rested on the seventh day from all his work that he had done.",
        NASB: "By the seventh day God completed His work which He had done, and He rested on the seventh day from all His work which He had done."
      }
    },
    {
      verseNumber: 3,
      reference: "Genesis 2:3",
      text: {
        KJV: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.",
        NKJV: "Then God blessed the seventh day and sanctified it, because in it He rested from all His work which God had created and made.",
        ESV: "So God blessed the seventh day and made it holy, because on it God rested from all his work that he had done in creation.",
        NASB: "Then God blessed the seventh day and sanctified it, because in it He rested from all His work which God had created and made."
      }
    },
    {
      verseNumber: 23,
      reference: "Exodus 16:23",
      text: {
        KJV: "And he said unto them, This is that which the LORD hath said, To morrow is the rest of the holy sabbath unto the LORD...",
        NKJV: "Then he said to them, 'This is what the LORD has said: 'Tomorrow is a Sabbath rest, a holy Sabbath to the LORD...''",
        ESV: "he said to them, 'This is what the LORD has commanded: 'Tomorrow is a day of solemn rest, a holy Sabbath to the LORD...''",
        NASB: "then he said to them, 'This is what the LORD meant: Tomorrow is a sabbath observance, a holy sabbath to the LORD...'"
      }
    },
    {
      verseNumber: 8,
      reference: "Exodus 20:8",
      text: {
        KJV: "Remember the sabbath day, to keep it holy.",
        NKJV: "Remember the Sabbath day, to keep it holy.",
        ESV: "Remember the Sabbath day, to keep it holy.",
        NASB: "Remember the sabbath day, to keep it holy."
      }
    },
    {
      verseNumber: 9,
      reference: "Exodus 20:9",
      text: {
        KJV: "Six days shalt thou labour, and do all thy work:",
        NKJV: "Six days you shall labor and do all your work,",
        ESV: "Six days you shall labor, and do all your work,",
        NASB: "Six days you shall labor and do all your work,"
      }
    },
    {
      verseNumber: 10,
      reference: "Exodus 20:10",
      text: {
        KJV: "But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work...",
        NKJV: "but the seventh day is the Sabbath of the LORD your God. In it you shall do no work...",
        ESV: "but the seventh day is a Sabbath to the LORD your God. On it you shall not do any work...",
        NASB: "but the seventh day is a sabbath of the LORD your God; in it you shall not do any work..."
      }
    },
    {
      verseNumber: 11,
      reference: "Exodus 20:11",
      text: {
        KJV: "For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.",
        NKJV: "For in six days the LORD made the heavens and the earth, the sea, and all that is in them, and rested the seventh day. Therefore the LORD blessed the Sabbath day and hallowed it.",
        ESV: "For in six days the LORD made heaven and earth, the sea, and all that is in them, and rested on the seventh day. Therefore the LORD blessed the Sabbath day and made it holy.",
        NASB: "For in six days the LORD made the heavens and the earth, the sea and all that is in them, and rested on the seventh day; therefore the LORD blessed the sabbath day and made it holy."
      }
    },
    {
      verseNumber: 13,
      reference: "Exodus 31:13",
      text: {
        KJV: "Speak thou also unto the children of Israel, saying, Verily my sabbaths ye shall keep: for it is a sign between me and you throughout your generations; that ye may know that I am the LORD that doth sanctify you.",
        NKJV: "Speak also to the children of Israel, saying: 'Surely My Sabbaths you shall keep, for it is a sign between Me and you throughout your generations, that you may know that I am the LORD who sanctifies you.'",
        ESV: "You are to speak to the people of Israel and say, 'Above all you shall keep my Sabbaths, for this is a sign between me and you throughout your generations, that you may know that I, the LORD, sanctify you.'",
        NASB: "But as for you, speak to the sons of Israel, saying, 'You shall surely observe My sabbaths; for this is a sign between Me and you throughout your generations, that you may know that I am the LORD who sanctifies you.'"
      }
    },
    {
      verseNumber: 13,
      reference: "Isaiah 58:13",
      text: {
        KJV: "If thou turn away thy foot from the sabbath, from doing thy pleasure on my holy day; and call the sabbath a delight, the holy of the LORD, honourable; and shalt honour him, not doing thine own ways, nor finding thine own pleasure, nor speaking thine own words:",
        NKJV: "If you turn away your foot from the Sabbath, From doing your pleasure on My holy day, And call the Sabbath a delight, The holy day of the LORD honorable, And shall honor Him, not doing your own ways, Nor finding your own pleasure, Nor speaking your own words,",
        ESV: "If you turn back your foot from the Sabbath, from pursuing your own pleasure on my holy day, and call the Sabbath a delight and the holy day of the LORD honorable; if you honor it, not going your own ways, or seeking your own pleasure, or talking idly;",
        NASB: "If because of the sabbath, you turn your foot From doing your own pleasure on My holy day, And call the sabbath a delight, the holy day of the LORD honorable, And honor it, desisting from your own ways, From seeking your own pleasure And speaking your own word,"
      }
    },
    {
      verseNumber: 14,
      reference: "Isaiah 58:14",
      text: {
        KJV: "Then shalt thou delight thyself in the LORD; and I will cause thee to ride upon the high places of the earth, and feed thee with the heritage of Jacob thy father: for the mouth of the LORD hath spoken it.",
        NKJV: "Then you shall delight yourself in the LORD; And I will cause you to ride on the high hills of the earth, And feed you with the heritage of Jacob your father. The mouth of the LORD has spoken.",
        ESV: "then you shall take delight in the LORD, and I will make you ride on the heights of the earth; I will feed you with the heritage of Jacob your father, for the mouth of the LORD has spoken.",
        NASB: "Then you will take delight in the LORD, And I will make you ride on the heights of the earth; And I will feed you with the heritage of Jacob your father, for the mouth of the LORD has spoken."
      }
    },
    {
      verseNumber: 20,
      reference: "Ezekiel 20:20",
      text: {
        KJV: "And hallow my sabbaths; and they shall be a sign between me and you, that ye may know that I am the LORD your God.",
        NKJV: "Hallow My Sabbaths, and they will be a sign between Me and you, that you may know that I am the LORD your God.",
        ESV: "and keep my Sabbaths holy, that they may be a sign between me and you, that you may know that I am the LORD your God.",
        NASB: "Sanctify My sabbaths; and they shall be a sign between Me and you, that you may know that I am the LORD your God."
      }
    },
    {
      verseNumber: 8,
      reference: "Matthew 12:8",
      text: {
        KJV: "For the Son of man is Lord even of the sabbath day.",
        NKJV: "For the Son of Man is Lord even of the Sabbath.",
        ESV: "For the Son of Man is lord of the Sabbath.",
        NASB: "For the Son of Man is Lord of the Sabbath."
      }
    },
    {
      verseNumber: 27,
      reference: "Mark 2:27",
      text: {
        KJV: "And he said unto them, The sabbath was made for man, and not man for the sabbath:",
        NKJV: "And He said to them, 'The Sabbath was made for man, and not man for the Sabbath.'",
        ESV: "And he said to them, 'The Sabbath was made for man, not man for the Sabbath.'",
        NASB: "Jesus said to them, 'The Sabbath was made for man, and not man for the Sabbath.'"
      }
    },
    {
      verseNumber: 16,
      reference: "Luke 4:16",
      text: {
        KJV: "And he came to Nazareth, where he had been brought up: and, as his custom was, he went into the synagogue on the sabbath day, and stood up for to read.",
        NKJV: "So He came to Nazareth, where He had been brought up. And as His custom was, He went into the synagogue on the Sabbath day, and stood up to read.",
        ESV: "And he came to Nazareth, where he had been brought up. And as was his custom, he went to the synagogue on the Sabbath day, and he stood up to read.",
        NASB: "And He came to Nazareth, where He had been brought up; and as was His custom, He entered the synagogue on the Sabbath, and stood up to read."
      }
    },
    {
      verseNumber: 4,
      reference: "Hebrews 4:4",
      text: {
        KJV: "For he spake in a certain place of the seventh day on this wise, And God did rest the seventh day from all his works.",
        NKJV: "For He has spoken in a certain place of the seventh day in this way: 'And God rested on the seventh day from all His works';",
        ESV: "For he has somewhere spoken of the seventh day in this way: 'And God rested on the seventh day from all his works.'",
        NASB: "For He has said somewhere concerning the seventh day: 'AND GOD RESTED ON THE SEVENTH DAY FROM ALL HIS WORKS';"
      }
    },
    {
      verseNumber: 9,
      reference: "Hebrews 4:9",
      text: {
        KJV: "There remaineth therefore a rest to the people of God.",
        NKJV: "There remains therefore a rest for the people of God.",
        ESV: "So then, there remains a Sabbath rest for the people of God,",
        NASB: "So there remains a Sabbath rest for the people of God."
      }
    },
    {
      verseNumber: 7,
      reference: "Revelation 14:7",
      text: {
        KJV: "Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.",
        NKJV: "saying with a loud voice, 'Fear God and give glory to Him, for the hour of His judgment has come; and worship Him who made heaven and earth, the sea and springs of water.'",
        ESV: "And he said with a loud voice, 'Fear God and give him glory, because the hour of his judgment has come, and worship him who made heaven and earth, the sea and the springs of water.'",
        NASB: "and he said with a loud voice, 'Fear God, and give Him glory, because the hour of His judgment has come; worship Him who made the heaven and the earth and sea and springs of waters.'"
      }
    }
  ],

  sanctuary: [
    {
      verseNumber: 8,
      reference: "Exodus 25:8",
      text: {
        KJV: "And let them make me a sanctuary; that I may dwell among them.",
        NKJV: "And let them make Me a sanctuary, that I may dwell among them.",
        ESV: "And let them make me a sanctuary, that I may dwell in their midst.",
        NASB: "Let them construct a sanctuary for Me, that I may dwell among them."
      }
    },
    {
      verseNumber: 22,
      reference: "Exodus 25:22",
      text: {
        KJV: "And there I will meet with thee, and I will commune with thee from above the mercy seat, from between the two cherubims which are upon the ark of the testimony...",
        NKJV: "And there I will meet with you, and I will speak with you from above the mercy seat, from between the two cherubim which are on the ark of the Testimony...",
        ESV: "There I will meet with you, and from above the mercy seat, from between the two cherubim that are on the ark of the testimony, I will speak with you...",
        NASB: "There I will meet with you; and from above the mercy seat, from between the two cherubim which are upon the ark of the testimony, I will speak to you..."
      }
    },
    {
      verseNumber: 2,
      reference: "Leviticus 16:2",
      text: {
        KJV: "And the LORD said unto Moses, Speak unto Aaron thy brother, that he come not at all times into the holy place within the vail before the mercy seat, which is upon the ark; that he die not...",
        NKJV: "and the LORD said to Moses: 'Tell Aaron your brother not to come at just any time into the Holy Place inside the veil, before the mercy seat which is on the ark, lest he die...'",
        ESV: "and the LORD said to Moses, 'Tell Aaron your brother not to come at any time into the Holy Place inside the veil, before the mercy seat that is on the ark, so that he may not die...'",
        NASB: "The LORD said to Moses: 'Tell your brother Aaron that he shall not enter at any time into the holy place inside the veil, before the mercy seat which is on the ark, or he will die...'"
      }
    },
    {
      verseNumber: 13,
      reference: "Psalms 77:13",
      text: {
        KJV: "Thy way, O God, is in the sanctuary: who is so great a God as our God?",
        NKJV: "Your way, O God, is in the sanctuary; Who is so great a God as our God?",
        ESV: "Your way, O God, is holy. What god is great like our God?",
        NASB: "Your way, O God, is holy; What god is great like our God?"
      }
    },
    {
      verseNumber: 14,
      reference: "Daniel 8:14",
      text: {
        KJV: "And he said unto me, Unto two thousand and three hundred days; then shall the sanctuary be cleansed.",
        NKJV: "And he said to me, 'For two thousand three hundred days; then the sanctuary shall be cleansed.'",
        ESV: "And he said to me, 'For 2,300 evenings and mornings. Then the sanctuary shall be restored to its rightful state.'",
        NASB: "He said to me, 'For 2,300 evenings and mornings; then the sanctuary will be properly restored.'"
      }
    },
    {
      verseNumber: 1,
      reference: "Hebrews 8:1",
      text: {
        KJV: "Now of the things which we have spoken this is the sum: We have such an high priest, who is set on the right hand of the throne of the Majesty in the heavens;",
        NKJV: "Now this is the main point of the things we are saying: We have such a High Priest, who is seated at the right hand of the throne of the Majesty in the heavens,",
        ESV: "Now the point in what we are saying is this: we have such a high priest, one who is seated at the right hand of the throne of the Majesty in heaven,",
        NASB: "Now the main point in what has been said is this: we have such a high priest, who has taken His seat at the right hand of the throne of the Majesty in the heavens,"
      }
    },
    {
      verseNumber: 2,
      reference: "Hebrews 8:2",
      text: {
        KJV: "A minister of the sanctuary, and of the true tabernacle, which the Lord pitched, and not man.",
        NKJV: "a Minister of the sanctuary and of the true tabernacle which the Lord pitched, and not man.",
        ESV: "a minister in the holy places, the true tent which the Lord set up, not man.",
        NASB: "a minister in the sanctuary and in the true tabernacle, which the Lord pitched, not man."
      }
    },
    {
      verseNumber: 11,
      reference: "Hebrews 9:11",
      text: {
        KJV: "But Christ being come an high priest of good things to come, by a greater and more perfect tabernacle, not made with hands, that is to say, not of this building;",
        NKJV: "But Christ came as High Priest of the good things to come, with the greater and more perfect tabernacle not made with hands, that is, not of this creation.",
        ESV: "But when Christ appeared as a high priest of the good things that have come, then through the greater and more perfect tent (not made with hands, that is, not of this creation)",
        NASB: "But when Christ appeared as a high priest of the good things to come, He entered through the greater and more perfect tabernacle, not made with hands, that is to say, not of this creation;"
      }
    },
    {
      verseNumber: 12,
      reference: "Hebrews 9:12",
      text: {
        KJV: "Neither by the blood of goats and calves, but by his own blood he entered in once into the holy place, having obtained eternal redemption for us.",
        NKJV: "Not with the blood of goats and calves, but with His own blood He entered the Most Holy Place once for all, having obtained eternal redemption.",
        ESV: "he entered once for all into the holy places, not by means of the blood of goats and calves but by means of his own blood, thus securing an eternal redemption.",
        NASB: "and not through the blood of goats and calves, but through His own blood, He entered the holy place once for all, having obtained eternal redemption."
      }
    },
    {
      verseNumber: 19,
      reference: "Revelation 11:19",
      text: {
        KJV: "And the temple of God was opened in heaven, and there was seen in his temple the ark of his testament: and there were lightnings, and voices, and thunderings, and an earthquake, and great hail.",
        NKJV: "Then the temple of God was opened in heaven, and the ark of His covenant was seen in His temple. And there were lightnings, noises, thunderings, an earthquake, and great hail.",
        ESV: "Then God's temple in heaven was opened, and the ark of his covenant was seen within his temple. There were flashes of lightning, rumblings, peals of thunder, an earthquake, and heavy hail.",
        NASB: "And the temple of God which is in heaven was opened; and the ark of His covenant appeared in His temple, and there were flashes of lightning and sounds and peals of thunder and an earthquake and a great hailstorm."
      }
    }
  ]
};

export function getCuratedThemeVerses(topicQuery: string): TopicalVerse[] | null {
  if (!topicQuery) return null;
  const clean = topicQuery.trim().toLowerCase();
  
  for (const [key, verses] of Object.entries(CURATED_TOPICAL_THEMES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return verses;
    }
  }
  return null;
}
