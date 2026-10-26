/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from "react";

export interface SabbathSchoolClassCard {
  id: string;
  question: string;
  answer: string;
  category: string;
  totalAttempts: number;
  successRate: number; // Percent %
}

interface SabbathSchoolContextType {
  quarterlyTitle: string;
  setQuarterlyTitle: (title: string) => void;
  classDeck: SabbathSchoolClassCard[];
  addClassCard: (card: Omit<SabbathSchoolClassCard, "id" | "totalAttempts" | "successRate">) => void;
  weeklyReflection: string;
  setWeeklyReflection: (val: string) => void;
  lessonsList: string[];
  aggregateGaps: { topic: string; gapPercentage: number; count: number }[];
}

const SabbathSchoolContext = createContext<SabbathSchoolContextType | undefined>(undefined);

export const SabbathSchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quarterlyTitle, setQuarterlyTitle] = useState("The Great Controversy (Sabbath School 2026)");
  
  const [classDeck, setClassDeck] = useState<SabbathSchoolClassCard[]>([
    {
      id: "ssc-1",
      question: "What is the primary theme of the Three Angels' Messages in Revelation 14?",
      answer: "The everlasting gospel, calling all people to worship the Creator, announcement of the fall of Babylon, and warning against the beast's mark.",
      category: "Revelation",
      totalAttempts: 14,
      successRate: 78
    },
    {
      id: "ssc-2",
      question: "Which prophecy predicts the cleansing of the heavenly sanctuary?",
      answer: "The 2300 days prophecy of Daniel 8:14.",
      category: "Daniel",
      totalAttempts: 12,
      successRate: 45 // High gap/struggled topic
    },
    {
      id: "ssc-3",
      question: "What does the Seventh-day Sabbath represent under the lens of the Great Controversy?",
      answer: "God's ultimate seal of authority and sign of loyalty to the Creator, opposing Babylon's counterfeit mark.",
      category: "Sabbath",
      totalAttempts: 15,
      successRate: 92
    }
  ]);

  const [weeklyReflection, setWeeklyReflection] = useState<string>(() => {
    return localStorage.getItem("stba_sabbath_weekly_reflection") || "";
  });

  const handleSetWeeklyReflection = (val: string) => {
    setWeeklyReflection(val);
    localStorage.setItem("stba_sabbath_weekly_reflection", val);
  };

  const addClassCard = (card: Omit<SabbathSchoolClassCard, "id" | "totalAttempts" | "successRate">) => {
    const newCard: SabbathSchoolClassCard = {
      ...card,
      id: `ssc-${Date.now()}`,
      totalAttempts: 0,
      successRate: 100
    };
    setClassDeck((prev) => [...prev, newCard]);
  };

  const lessonsList = [
    "Lesson 1: The War Behind All Wars",
    "Lesson 2: Satan's Great Deceptions & Counterfeits",
    "Lesson 3: The Sanctuary & the Judgment",
    "Lesson 4: God's Eternal Law of Love",
    "Lesson 5: The Seal of God & the Mark of the Beast",
    "Lesson 6: The Return of our Blessed Hope"
  ];

  const aggregateGaps: { topic: string; gapPercentage: number; count: number }[] = [];

  return (
    <SabbathSchoolContext.Provider
      value={{
        quarterlyTitle,
        setQuarterlyTitle,
        classDeck,
        addClassCard,
        weeklyReflection,
        setWeeklyReflection: handleSetWeeklyReflection,
        lessonsList,
        aggregateGaps
      }}
    >
      {children}
    </SabbathSchoolContext.Provider>
  );
};

export const useSabbathSchool = () => {
  const context = useContext(SabbathSchoolContext);
  if (!context) {
    throw new Error("useSabbathSchool must be used within a SabbathSchoolProvider");
  }
  return context;
};
