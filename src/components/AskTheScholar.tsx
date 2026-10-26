/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  HelpCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Send,
  Loader2,
  Sparkles,
  Info,
  Layers,
  Search,
  Check,
  ChevronDown,
  RefreshCw,
  Compass,
  ArrowRight,
  Bookmark,
  Lock,
  FileDown
} from "lucide-react";
import { jsPDF } from "jspdf";
import { SCRIPTURE_DATABASE } from "../data/scriptureDb";
import { Scripture } from "../types";
import { TtsPlayer } from "./TtsPlayer";

import { getElderStephenVoice } from "./stba/RightPaneTools";

interface Message {
  id: string;
  sender: "user" | "scholar";
  text: string;
  shortAudibleSummary?: string;
  timestamp: Date;
  upgradeCallout?: {
    tier: "Scholar" | "Leader";
    msg: string;
  };
}

interface AskTheScholarProps {
  activeScripture?: Scripture | null;
  onActiveScriptureChange?: (scrip: Scripture) => void;
  userName?: string;
  activeTier?: string;
  onSwitchMode?: (mode: "Explain" | "Teach It" | "STBA" | "Application" | "Syllabus" | "Recall") => void;
}

export const AskTheScholar: React.FC<AskTheScholarProps> = ({
  activeScripture,
  onActiveScriptureChange,
  userName = "Berean",
  activeTier = "Beginner",
  onSwitchMode
}) => {
  // Scripture Selection and Tracking
  const [selectedScripture, setSelectedScripture] = useState<Scripture>(() => {
    if (activeScripture) return activeScripture;
    const flat = Object.values(SCRIPTURE_DATABASE).flat();
    return flat.find(s => s.reference.includes("2 Timothy 3:16") || s.id === "fundamental-fb-1" || s.id === "fb-1") || flat[0] || {
      id: "fundamental-fb-1",
      reference: "2 Timothy 3:16",
      text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.",
      keywords: ["inspiration", "profitable"]
    };
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync activeScripture with internal state changes
  useEffect(() => {
    if (activeScripture && activeScripture.id !== selectedScripture.id) {
      setSelectedScripture(activeScripture);
      setMessages([
        {
          id: "welcome-sync-" + Date.now(),
          sender: "scholar",
          text: `As you explore **${activeScripture.reference}**, I can help you uncover its historical background, lexical grammatical significance, original audience, and spiritual alignment with Seventh-day Adventist historical theology.

What questions do you have about the context, origins, or theological depth of this passage? Ask anything, and I can also summarize it orally for you.`,
          shortAudibleSummary: `As you explore ${activeScripture.reference}, I can help you uncover its historical background, lexical grammatical significance, original audience, and spiritual alignment with Seventh-day Adventist historical theology. What questions do you have about the context, origins, or theological depth of this passage?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [activeScripture, userName]);

  // Chat conversation logs
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      sender: "scholar",
      text: `As you explore **${selectedScripture.reference}**, I can help you uncover its historical background, lexical grammatical significance, original audience, and spiritual alignment with Seventh-day Adventist historical theology.

What questions do you have about the context, origins, or theological depth of this passage? Ask anything, and I can also summarize it orally for you.`,
      shortAudibleSummary: `As you explore ${selectedScripture.reference}, I can help you uncover its historical background, lexical grammatical significance, original audience, and spiritual alignment with Seventh-day Adventist historical theology. What questions do you have about the context, origins, or theological depth of this passage?`,
      timestamp: new Date()
    }
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Click tracking states for onboarding button glows
  const [clickedHistorical, setClickedHistorical] = useState(() => {
    return localStorage.getItem("stba_clicked_historical_sig") === "true";
  });
  const [clickedGreekHebrew, setClickedGreekHebrew] = useState(() => {
    return localStorage.getItem("stba_clicked_greek_hebrew") === "true";
  });

  // Audible Text-to-Speech tracking states
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);

  // Chat window element scroll helper
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom when dialogue increases
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle auto-canceling speak on component unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Format response helper function to render beautiful markdown tags
  const renderFormattedText = (rawStr: string) => {
    const lines = rawStr.split("\n");
    return lines.map((line, idx) => {
      // Heading check
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-navy text-sm tracking-[0.65px] mt-4 mb-2 first:mt-1 border-b border-stone-200 pb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] font-bold text-navy text-md tracking-[0.65px] mt-4 mb-2 first:mt-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      // Bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const text = line.replace(/^[\s*-]+/, "").trim();
        // Replace **bold text**
        return (
          <li key={idx} className="text-xs list-disc list-inside text-stone-700 leading-relaxed ml-2 mb-1.5 pl-1 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px]">
            {parseBoldText(text)}
          </li>
        );
      }
      // Paragraph parsing
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-stone-700 leading-relaxed mb-2 font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px]">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Safe inner bold parser
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-[#111]">{part}</strong>;
      }
      return part;
    });
  };

  // Speech Helper
  const handleSpeak = (text: string, msgId: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported on this browser.");
      return;
    }

    // If already speaking this message, then pause/stop
    if (currentlySpeakingMsgId === msgId && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean up text for TTS (remove brackets, asterisks, abbreviations for smooth speech flow)
    const voiceText = text
      .replace(/\*\*|###|##|\*/g, "")
      .replace(/[\[\]]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(voiceText);
    utterance.rate = 1.0; // Normal pacing
    utterance.pitch = 1.0;

    const bestVoice = getElderStephenVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentlySpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingMsgId(null);
  };

  // Pre-configured context selection helper
  const handleSelectScripture = (scrip: Scripture) => {
    setSelectedScripture(scrip);
    if (onActiveScriptureChange) {
      onActiveScriptureChange(scrip);
    }
    setShowDropdown(false);
    setSearchQuery("");

    // Add immediate scholar greeting updated to the selected verse context
    setMessages([
      {
        id: "switch-" + Date.now(),
        sender: "scholar",
        text: `Wonderful focus selection! We are now examining **${scrip.reference}**:

"${scrip.text}"

Ask me about:
* **The historical origins** (Who wrote it, when, and under what circumstances?)
* **The Greek/Hebrew meanings** of dynamic keywords.
* **The Seventh-day Adventist sanctuary or Great Controversy implications** of this passage.
* **Spiritual applications** to strengthen active faith.`,
        shortAudibleSummary: `We are now examining ${scrip.reference}. Speak or select a topic to dive into its historical meaning.`,
        timestamp: new Date()
      }
    ]);

    // Shut up previous audio
    handleStopSpeech();
  };

  // Download beautifully formatted scriptural exegesis record PDF
  const handleDownloadExegesisPDF = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      
      const marginX = 14;
      const contentWidth = 182; // 210 - 28
      let y = 18;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > 272) {
          doc.addPage();
          drawHeaderAndFooter();
          y = 18;
        }
      };

      const setNavyColor = () => doc.setTextColor(28, 35, 51); // #1C2333
      const setGoldColor = () => doc.setTextColor(201, 151, 58); // #C9973A
      const setMutedTextColor = () => doc.setTextColor(107, 107, 107); // #6B6B6B

      const drawHeaderAndFooter = () => {
        // Top banner horizontal lines
        doc.setDrawColor(201, 151, 58); // #C9973A Gold Accent
        doc.setLineWidth(0.4);
        doc.line(marginX, 8, marginX + contentWidth, 8);
        doc.setDrawColor(232, 228, 218); // #E8E4DA Cream
        doc.setLineWidth(0.2);
        doc.line(marginX, 10, marginX + contentWidth, 10);

        // Footer block
        doc.setDrawColor(232, 228, 218);
        doc.setLineWidth(0.3);
        doc.line(marginX, 282, marginX + contentWidth, 282);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        
        const footText = "STBA SCRIPTURAL EXEGESIS RECORD • PROMPTING COGNITIVE RETENTION & SYSTEM MASTERY";
        doc.text(footText, marginX, 286);
        
        const timestampStr = new Date().toLocaleDateString(undefined, {
          dateStyle: "medium"
        }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        doc.text(`DATE PRINTED: ${timestampStr}`, marginX + contentWidth - doc.getTextWidth(`DATE PRINTED: ${timestampStr}`), 286);
      };

      // Draw initial page decoration
      drawHeaderAndFooter();

      // 1. Document Header Card
      doc.setFillColor(253, 250, 245); // #FDFAF5
      doc.setDrawColor(232, 228, 218); // #E8E4DA
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, y, contentWidth, 42, 3, 3, "FD");

      // App Title
      doc.setFont("times", "bold");
      doc.setFontSize(22);
      setNavyColor();
      doc.text("Study To Be Approved (STBA)", marginX + 8, y + 10);

      // Accent gold line under title
      doc.setDrawColor(201, 151, 58); // #C9973A
      doc.setLineWidth(0.8);
      doc.line(marginX + 8, y + 13, marginX + 65, y + 13);

      doc.setFont("times", "italic");
      doc.setFontSize(9);
      setGoldColor();
      doc.text("You've read it. But do you know it?", marginX + 8, y + 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setNavyColor();
      doc.text("COGNITIVE SCRIPTURE MASTERY — BEREAN EXEGESIS RECORD", marginX + 8, y + 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setMutedTextColor();
      doc.text(`Selected Study Unit: ${selectedScripture.reference}`, marginX + 8, y + 31);
      doc.text(`Theological Focus: Historical Context, Original Greek/Hebrew, Great Controversy Alignment`, marginX + 8, y + 36);

      y += 50;

      // 2. Active Study Scripture Card
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setNavyColor();
      doc.text("ACTIVE BIBLICAL STUDY PORTAL", marginX, y);
      
      doc.setDrawColor(201, 151, 58); // #C9973A accent line
      doc.setLineWidth(0.6);
      doc.line(marginX, y + 1.5, marginX + 32, y + 1.5);

      y += 6;

      // Draw background scripture box
      doc.setFillColor(250, 247, 240); // Slightly darker warm cream #FAF7F0
      doc.setDrawColor(232, 228, 218); // #E8E4DA
      doc.setLineWidth(0.35);

      const splitVerseText = doc.splitTextToSize(`"${selectedScripture.text}"`, contentWidth - 16);
      const boxHeight = (splitVerseText.length * 5) + 16;
      doc.roundedRect(marginX, y, contentWidth, boxHeight, 2, 2, "FD");

      doc.setFont("times", "bold");
      doc.setFontSize(11.5);
      setNavyColor();
      doc.text(selectedScripture.reference, marginX + 8, y + 7);

      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      splitVerseText.forEach((line: string, lIdx: number) => {
        doc.text(line, marginX + 8, y + 14 + (lIdx * 5));
      });

      y += boxHeight + 10;

      // 3. Historical Session Dialogue Transcript
      checkPageOverflow(30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setNavyColor();
      doc.text("HISTORICAL SCHOLAR CONVERSATION TRANSCRIPT", marginX, y);

      doc.setDrawColor(201, 151, 58); // Gold line
      doc.setLineWidth(0.6);
      doc.line(marginX, y + 1.5, marginX + 32, y + 1.5);

      y += 7;

      messages.forEach((msg) => {
        const cleanMsgText = msg.text
          .replace(/\*\*([^*]+)\*\*/g, "$1") // bold remove
          .replace(/###\s+/g, "") // remove heading prefix
          .replace(/##\s+/g, "")
          .trim();

        const isUser = msg.sender === "user";
        const speakerLabel = isUser ? "You" : "Scholar Assistant";
        const timeLabel = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const wrappedMessageLines = doc.splitTextToSize(cleanMsgText, contentWidth - 20);
        const chunkHeight = (wrappedMessageLines.length * 4.8) + 12;

        checkPageOverflow(chunkHeight);

        doc.setFillColor(isUser ? 245 : 255, isUser ? 248 : 255, isUser ? 250 : 255);
        doc.setDrawColor(232, 228, 218);
        doc.setLineWidth(0.25);
        doc.roundedRect(marginX, y, contentWidth, chunkHeight, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        if (isUser) {
          doc.setTextColor(13, 148, 136); // Teal
        } else {
          doc.setTextColor(28, 35, 51); // Navy
        }
        doc.text(`${speakerLabel} (${timeLabel})`, marginX + 5, y + 6);

        // Divider
        doc.setDrawColor(238, 235, 225);
        doc.line(marginX + 5, y + 8, marginX + contentWidth - 5, y + 8);

        // Body message content
        doc.setFont("times", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(70, 70, 70);

        wrappedMessageLines.forEach((line: string, lineIdx: number) => {
          doc.text(line, marginX + 5, y + 13 + (lineIdx * 4.8));
        });

        y += chunkHeight + 4;
      });

      // 4. Ellen White devotion quote block at bottom
      checkPageOverflow(26);

      y += 4;
      doc.setFillColor(253, 250, 245);
      doc.setDrawColor(201, 151, 58);
      doc.setLineWidth(0.4);
      doc.roundedRect(marginX, y, contentWidth, 22, 1.5, 1.5, "FD");

      doc.setFont("times", "bold");
      doc.setFontSize(8.5);
      setGoldColor();
      doc.text("INSPIRATIONAL DEVOTIONAL MEDITATION", marginX + 6, y + 6);

      doc.setFont("times", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const quoteText = `"True education is the harmonious development of the physical, the mental, and the spiritual powers. It prepares the student for the joy of service in this world and for the higher joy of wider service in the world to come." — Ellen White, Education, p. 13`;
      const splitQuote = doc.splitTextToSize(quoteText, contentWidth - 12);
      splitQuote.forEach((qLine: string, qIdx: number) => {
        doc.text(qLine, marginX + 6, y + 11 + (qIdx * 4));
      });

      // Trigger download
      const fileNameStr = selectedScripture.reference.replace(/\s+/g, "_").replace(/:/g, "-");
      doc.save(`STBA_Exegesis_Record_${fileNameStr}.pdf`);
    } catch (e) {
      console.error("[STBA SCHOLAR PDF DOWNLOAD ERROR]", e);
    }
  };

  // Submit study query to Scholar API
  const handleSendMessage = async (textToSend?: string) => {
    const finalQuery = textToSend || inputVal;
    if (!finalQuery.trim() || isLoading) return;

    const finalQueryLower = finalQuery.toLowerCase();
    
    // Check and update onboarding first-time clicks
    const isHistSigQuery = finalQueryLower.includes("historical significance") || finalQueryLower.includes("historical context") || (finalQueryLower.includes("context") && !finalQueryLower.includes("sanctuary") && !finalQueryLower.includes("controversy") && !finalQueryLower.includes("teaching"));
    const isGreekHebrewQuery = finalQueryLower.includes("greek") || finalQueryLower.includes("hebrew") || finalQueryLower.includes("lexical") || finalQueryLower.includes("keyword") || finalQueryLower.includes("word");

    if (isHistSigQuery) {
      setClickedHistorical(true);
      localStorage.setItem("stba_clicked_historical_sig", "true");
    }
    if (isGreekHebrewQuery) {
      setClickedGreekHebrew(true);
      localStorage.setItem("stba_clicked_greek_hebrew", "true");
    }

    // Stop speaking old things
    handleStopSpeech();

    const newUserMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: finalQuery,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) {
      setInputVal("");
    }
    setIsLoading(true);

    try {
      const finalQueryLower = finalQuery.toLowerCase();
      // Only historical significance/context and explanation of key Greek/Hebrew keywords are available under free tier
      const isHistoricalSigFreeQuery = finalQueryLower.includes("historical significance") || finalQueryLower.includes("historical context") || (finalQueryLower.includes("context") && !finalQueryLower.includes("sanctuary") && !finalQueryLower.includes("controversy") && !finalQueryLower.includes("teaching"));
      const isGreekHebrewFreeQuery = finalQueryLower.includes("greek") || finalQueryLower.includes("hebrew") || finalQueryLower.includes("lexical") || finalQueryLower.includes("keyword") || finalQueryLower.includes("word");
      
      const isFreeQuery = isHistoricalSigFreeQuery || isGreekHebrewFreeQuery;
      const activeTier = localStorage.getItem("stba_user_tier") || "Beginner";

      if (activeTier === "Beginner" && !isFreeQuery) {
        const isSanctuary = finalQueryLower.includes("sanctuary") || finalQueryLower.includes("sda") || finalQueryLower.includes("heavenly");
        const isControversy = finalQueryLower.includes("great controversy") || finalQueryLower.includes("controversy");
        const isImplications = finalQueryLower.includes("implications");
        const isTeachingOutlineQuery = finalQueryLower.includes("teaching") || finalQueryLower.includes("teach this") || finalQueryLower.includes("active tips for teaching") || finalQueryLower.includes("teach");

        if (isSanctuary || isControversy || isImplications || isTeachingOutlineQuery) {
          await new Promise((resolve) => setTimeout(resolve, 800)); // nice haptic loading transition delay

          const upgradeCallout = {
            tier: "Scholar" as const,
            msg: "🔒 Noble Berean, the Heavenly Sanctuary, Great Controversy context, and Teaching Tips are part of the Scholar & Leader tiers. Elevate your plan to unseal!",
            ttsText: "noble Berean, the heavenly sanctuary, great controversy context and teaching tips are part of the scholar and leadership tier. Click on the link to upgrade your plan and gain access."
          };

          window.dispatchEvent(new CustomEvent("stba-ai-upgrade-trigger", {
            detail: {
              id: "scholar_study_locked",
              title: "Scholar Tier Required",
              message: "Deep study views like Heavenly Sanctuary/SDA, Great Controversy implications, and Active Teaching Tips are reserved for our Scholar and Leader tiers to optimize your training.",
              tier: "Scholar"
            }
          }));

          const newScholarMsg: Message = {
            id: "scholar-" + Date.now(),
            sender: "scholar",
            text: "", // CRITICAL: empty text so no info is shown!
            shortAudibleSummary: "noble Berean, the heavenly sanctuary, great controversy context and teaching tips are part of the scholar and leadership tier. Click on the link to upgrade your plan and gain access.",
            timestamp: new Date(),
            upgradeCallout
          };

          setMessages((prev) => [...prev, newScholarMsg]);
          setIsLoading(false);
          return;
        }
      }

      // Gather conversational context
      const chatContextHistory = messages.map(m => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text
      }));

      const res = await fetch("/api/study/ask-scholar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference: selectedScripture.reference,
          text: selectedScripture.text,
          question: finalQuery,
          chatHistory: chatContextHistory,
          userName: userName,
          firstQuery: isHistSigQuery,
          secondQuery: isGreekHebrewQuery,
          isFreeTier: activeTier === "Beginner"
        })
      });

      if (!res.ok) {
        throw new Error("Scholar API failed. Using fallback response.");
      }

      const data = await res.json();

      let upgradeCallout: any = undefined;

      if (activeTier === "Beginner" && !isFreeQuery) {
        const isSanctuary = finalQueryLower.includes("sanctuary") || finalQueryLower.includes("sda") || finalQueryLower.includes("heavenly");
        const isControversy = finalQueryLower.includes("great controversy") || finalQueryLower.includes("controversy");
        const isImplications = finalQueryLower.includes("implications");
        const isTeachingOutlineQuery = finalQueryLower.includes("teaching") || finalQueryLower.includes("teach this") || finalQueryLower.includes("active tips for teaching") || finalQueryLower.includes("teach");

        if (isSanctuary || isControversy || isImplications || isTeachingOutlineQuery) {
          upgradeCallout = {
            tier: "Scholar" as const,
            msg: "🔒 Noble Berean, the Heavenly Sanctuary, Great Controversy context, and Teaching Tips are part of the Scholar & Leader tiers. Elevate your plan to unseal!",
            ttsText: "noble Berean, the heavenly sanctuary, great controversy context and teaching tips are part of the scholar and leadership tier. Click on the link to upgrade your plan and gain access."
          };
          window.dispatchEvent(new CustomEvent("stba-ai-upgrade-trigger", {
            detail: {
              id: "scholar_study_locked",
              title: "Scholar Tier Required",
              message: "Deep study views like Heavenly Sanctuary/SDA, Great Controversy implications, and Active Teaching Tips are reserved for our Scholar and Leader tiers to optimize your training.",
              tier: "Scholar"
            }
          }));
        }
      }

      const newScholarMsg: Message = {
        id: "scholar-" + Date.now(),
        sender: "scholar",
        text: upgradeCallout ? "" : data.response,
        shortAudibleSummary: upgradeCallout 
          ? "noble Berean, the heavenly sanctuary, great controversy context and teaching tips are part of the scholar and leadership tier. Click on the link to upgrade your plan and gain access."
          : data.shortAudibleSummary,
        timestamp: new Date(),
        upgradeCallout
      };

      setMessages((prev) => [...prev, newScholarMsg]);

    } catch (err) {
      console.error(err);
      // Fallback fallback response to ensure resilient operation
      const fallbackSummary = `I am delighted to share that ${selectedScripture.reference} connects us directly to the sanctuary focus. God urges us to understand these pillars of faith so that we are prepared to stand approved like the ancient Bereans.`;
      const fallbackResp = `I apologize, there was a minor latency in my query channel. Let me provide a faithful analysis directly from my core systems:

### **The Berean Perspective on ${selectedScripture.reference}**
* **The Central Theme:** This verse is a magnificent testament to God's guiding hand through history. It assures us that our path is secure when we align our life-pacing with Sola Scriptura.
* **The Historical Anchor:** When early Seventh-day Adventist pioneers examined this context in the mid-19th century, they saw a calling to restore the beautiful, untarnished truths of the sanctuary and the pre-advent judgment.
* **Spiritual Practical Application:** In current times, we are urged to lay down our secular assumptions and actively study to verify that we are approved, unashamed workmen.

Let me know if you would like me to discuss specific original language words next!`;

      const fallbackMsg: Message = {
        id: "fallback-" + Date.now(),
        sender: "scholar",
        text: fallbackResp,
        shortAudibleSummary: fallbackSummary,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, fallbackMsg]);

    } finally {
      setIsLoading(false);
    }
  };

  // Flattened SCRIPTURE_DATABASE array for search matching
  const allDatabaseScriptures = Object.entries(SCRIPTURE_DATABASE).flatMap(([trackId, list]) =>
    list.map((scrip) => ({
      ...scrip,
      trackId
    }))
  );

  const filteredScriptures = allDatabaseScriptures.filter((scrip) => {
    const term = searchQuery.toLowerCase();
    return (
      scrip.reference.toLowerCase().includes(term) ||
      scrip.text.toLowerCase().includes(term)
    );
  });

  // Prompt recommendation helpers
  const recommendationPills = [
    "What is the historical significance & context?",
    "Explain key Greek/Hebrew words in this text.",
    "How does this connect to the Heavenly Sanctuary?",
    "Explain the SDA Great Controversy implications.",
    "Give me active tips for teaching this to others."
  ];

  return (
    <div className="w-full bg-[#FAF7F0] border border-[#E8E4DA] rounded-3xl py-10 px-4 sm:px-6 md:py-14 md:px-8 shadow-xs text-left flex flex-col gap-6" id="ask-scholar-hub">
      
      {/* Header Title Segment - Full Width across the top */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8E4DA] pb-4 gap-4" id="scholar-header-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600">
            <MessageSquare className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy flex items-center space-x-2">
              <span>Ask the Scholar</span>
              <span className="text-[10px] font-mono font-extrabold uppercase bg-teal-500/10 text-teal-700 px-2 py-0.5 rounded tracking-wide align-middle">
                auditory active study
              </span>
            </h2>
            <p className="text-xs text-[#6B6B6B]">
              Ask your contextual, historical, or theological questions and receive high-fidelity audible AI exegesis.
            </p>
          </div>
        </div>

        {/* Global Sound Sync Configuration Controls */}
        <div className="flex items-center space-x-2 self-start md:self-auto bg-white p-1.5 rounded-lg border border-[#E8E4DA]">
          <button
            type="button"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (audioEnabled) {
                handleStopSpeech();
              }
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              audioEnabled
                ? "bg-teal-500/15 text-teal-700"
                : "bg-stone-100 text-stone-500 hover:text-stone-700"
            }`}
            title="Toggle read-aloud spoken answers"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Audplay Enabled</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 opacity-70" />
                <span>Audio Muted</span>
              </>
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={handleStopSpeech}
              className="p-1 text-red-500 hover:bg-stone-50 rounded"
              title="Stop speaking"
            >
              <Pause className="w-4 h-4 animate-ping" />
            </button>
          )}
        </div>
      </div>

      {/* TOP ANCHOR: FULL WIDTH ACTIVE SCRIPTURE TARGET */}
      <div className="w-full bg-white p-4 sm:p-5 border border-[#E8E4DA] rounded-xl space-y-4 shadow-2xs text-navy relative animate-fade-in" id="scholar-top-anchor">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A0885B] flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Active Scripture Target</span>
          </span>
          <span className="text-[8.5px] font-mono bg-[#FAF7F0] text-[#6B6B6B] px-2.5 py-0.5 rounded uppercase font-bold border border-[#E8E4DA]">
            Exegesis Anchor
          </span>
        </div>

        {/* Custom Search Selector Box */}
        <div className="relative">
          <div className="flex items-center space-x-1 border border-[#E8E4DA] rounded-lg px-2.5 py-1.5 bg-[#FAF7F0]/40 focus-within:border-teal-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <input
              type="text"
              placeholder="Search Bible Reference..."
              className="bg-transparent text-xs w-full focus:outline-none text-navy placeholder-stone-500 font-sans"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {(searchQuery || showDropdown) && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setSearchQuery("");
                }}
                className="text-[10px] font-bold text-stone-500 hover:text-stone-700"
              >
                Close
              </button>
            )}
          </div>

          {/* Float Dropdown results list */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-56 overflow-y-auto bg-white border border-[#E8E4DA] rounded-lg shadow-md divide-y divide-stone-100">
              {filteredScriptures.length > 0 ? (
                filteredScriptures.slice(0, 8).map((scrip) => {
                  const isSelected = selectedScripture.id === scrip.id;
                  return (
                    <button
                      key={scrip.id}
                      className="w-full text-left p-3 hover:bg-stone-50 transition-colors text-xs space-y-0.5 block flex items-start justify-between cursor-pointer"
                      onClick={() => handleSelectScripture(scrip)}
                    >
                      <div className="space-y-0.5 pr-4 truncate">
                         <span className="font-serif font-bold text-navy block">{scrip.reference}</span>
                         <span className="text-[10px] text-[#6B6B6B] block truncate">{scrip.text}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-xs text-stone-500 text-center">No scriptures matched. Try standard search</div>
              )}
            </div>
          )}
        </div>

        {/* Currently Selected Card block */}
        <div className="p-4 bg-teal-500/[0.03] border-l-4 border-l-teal-600 border border-[#E8E4DA] rounded-r-lg space-y-1 text-navy">
          <h4 className="font-serif font-extrabold text-sm text-teal-900">{selectedScripture.reference}</h4>
          <p className="font-bible text-xs leading-relaxed text-stone-700">
            "{selectedScripture.text}"
          </p>
        </div>
      </div>

      {/* CORE DIVISION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full" id="scholar-main-grid">
        
        {/* LEFT COLUMN (Desktop) / SECOND COLUMN (Mobile): RECOMMENDED QUICK SCHOLAR QUERIES (5 cols) */}
        <div className="order-2 lg:order-1 lg:col-span-5 bg-white p-4 sm:p-5 border border-[#E8E4DA] rounded-xl flex flex-col justify-between shadow-xs" id="scholar-left-options">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A0885B] flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 animate-spin-slow text-teal-600" />
              <span>Recommended Quick Scholar Queries</span>
            </span>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Tap a preset study question below to jump-start your research on this verse:
            </p>
          </div>

          <div className="flex flex-col space-y-2 pt-3 flex-1 justify-center">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes green-pulse-glow {
                0%, 100% {
                  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4), inset 0 0 4px rgba(16, 185, 129, 0.1);
                  border-color: rgba(16, 185, 129, 0.5);
                }
                50% {
                  box-shadow: 0 0 18px rgba(16, 185, 129, 0.85), inset 0 0 10px rgba(16, 185, 129, 0.35);
                  border-color: rgba(16, 185, 129, 1);
                  background-color: rgba(16, 185, 129, 0.08);
                }
              }
              .green-glow-btn {
                animation: green-pulse-glow 1.8s infinite ease-in-out !important;
                border-width: 1.5px !important;
              }
            `}} />
            {recommendationPills.map((pill, pIdx) => {
              const activeTier = localStorage.getItem("stba_user_tier") || "Beginner";
              const textLower = pill.toLowerCase();
              const isFree = textLower.includes("historical significance") || textLower.includes("greek") || textLower.includes("hebrew") || textLower.includes("lexical") || textLower.includes("keyword") || textLower.includes("word");
              const locked = activeTier === "Beginner" && !isFree;

              const isHistSig = textLower.includes("historical significance");
              const isGreekHeb = textLower.includes("greek") || textLower.includes("hebrew");

              let glowClass = "";
              if (isHistSig && !clickedHistorical) {
                glowClass = "green-glow-btn";
              } else if (isGreekHeb && clickedHistorical && !clickedGreekHebrew) {
                glowClass = "green-glow-btn";
              }

              return (
                <button
                  key={pIdx}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(pill)}
                  className={`w-full text-left p-3 rounded-lg border text-[11px] font-serif font-medium transition-all flex items-center justify-between group cursor-pointer focus:outline-none ${
                    locked
                      ? "border-stone-250 bg-stone-100/50 text-stone-400 hover:border-amber-200 hover:bg-amber-50/20"
                      : "border-[#E8E4DA]/80 bg-[#FAF7F0]/20 hover:bg-[#FAF7F0]/70 text-stone-700 hover:text-navy hover:border-teal-400"
                  } ${glowClass}`}
                >
                  <span className="flex items-center space-x-1.5">
                    {locked && <Lock className="w-3 h-3 text-amber-600/70 shrink-0" />}
                    <span className={locked ? "opacity-75" : ""}>{pill}</span>
                  </span>
                  {locked ? (
                    <span className="text-[9px] font-mono font-bold text-amber-700 bg-[#DFC57B]/20 px-1.5 py-0.5 rounded-sm shrink-0 ml-1.5">
                      Scholar+
                    </span>
                  ) : (
                    <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (Desktop) / FIRST COLUMN (Mobile): HIGH-POLISHED INTERACTIVE DIALOGUE (7 cols) */}
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col h-[420px] bg-white border border-[#E8E4DA] rounded-xl overflow-hidden shadow-xs w-full" id="chat-scaffold-right">
          
          {/* Chat Window Frame Header */}
          <div className="bg-[#FAF7F0] border-b border-[#E8E4DA] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold text-navy">
                Scholar Chat Dialogue Center
              </span>
            </div>
            
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "welcome-reset",
                    sender: "scholar",
                    text: `Warm greetings. Let's research **${selectedScripture.reference}** further together. What theological aspects are on your heart?`,
                    shortAudibleSummary: `Let's study the scripture context together. Ask me any question.`,
                    timestamp: new Date()
                  }
                ]);
                handleStopSpeech();
              }}
              className="text-[10px] font-bold text-[#A0885B] uppercase flex items-center space-x-1 hover:text-navy cursor-pointer focus:outline-none"
              title="Reset conversation flow history"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Conversation Bubble List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-[#FAF7F0]/20 max-h-[290px] w-full" id="chat-messages-container">
            {messages.map((msg) => {
              const isScholar = msg.sender === "scholar";
              const speakingThis = currentlySpeakingMsgId === msg.id && isSpeaking;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${
                    isScholar ? "self-start items-start" : "self-end items-end ml-auto"
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl relative break-words overflow-wrap-anywhere w-full ${
                      isScholar
                        ? "bg-white border border-[#E8E4DA] text-navy rounded-tl-none text-left elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased"
                        : "bg-teal-600 text-white rounded-tr-none text-left"
                    }`}
                  >
                    {/* Render Chat Messages */}
                    {isScholar ? (
                      msg.text && (
                        <div className="space-y-0.5 break-words elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px]">
                          {renderFormattedText(msg.text)}
                        </div>
                      )
                    ) : (
                      <p className="text-xs leading-relaxed break-words">{msg.text}</p>
                    )}

                    {/* Audio read aloud speaker button for Scholar messages */}
                    {isScholar && (msg.shortAudibleSummary || msg.text || msg.upgradeCallout) && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200/50 space-y-2">
                        {msg.upgradeCallout && (
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#C9973A] animate-pulse shrink-0" />
                            <span className="text-[9.5px] font-semibold text-amber-700 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-200/10 shrink-0">
                              🔒 Upgrade Advised ({msg.upgradeCallout.tier})
                            </span>
                          </div>
                        )}
                        <TtsPlayer 
                          text={msg.upgradeCallout ? ((msg.upgradeCallout as any).ttsText || msg.upgradeCallout.msg) : (msg.shortAudibleSummary || msg.text)} 
                          messageId={msg.id} 
                          autoPlay={audioEnabled && !msg.id.includes("welcome") && !msg.id.includes("switch")} 
                          label="Elder Stephen"
                          variant="card"
                        />
                      </div>
                    )}

                    {isScholar && msg.upgradeCallout && (
                      <div className="mt-2.5 p-3 bg-amber-500/[0.04] border border-amber-200/40 rounded-xl space-y-1.5 text-left font-sans">
                        <p className="text-[10.5px] text-[#1C2333]/90 leading-relaxed font-serif">
                          {msg.upgradeCallout.msg}
                        </p>
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-stba-upgrade-modal"))}
                          className="w-full text-center py-1.5 bg-[#C9973A] hover:bg-[#B0822F] text-white font-mono font-bold text-[9.5px] tracking-wide uppercase rounded-md shadow-3xs transition-colors cursor-pointer"
                        >
                          Unlock {msg.upgradeCallout.tier} Tier 👑
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bubble Timestamp label */}
                  <span className="text-[8.5px] text-stone-400 font-mono mt-1 px-1">
                    {isScholar ? "Scholar Assistant" : "You"} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Simulated Loading Typing States */}
            {isLoading && (
              <div className="flex flex-col items-start max-w-[85%] self-start pb-2">
                <div className="p-3 bg-white border border-[#E8E4DA] rounded-2xl rounded-tl-none text-left flex items-center space-x-2">
                  <Loader2 className="w-4.5 h-4.5 text-teal-600 animate-spin" />
                  <span className="text-xs text-[#6B6B6B] font-serif">
                    Scholar is checking historical manuscripts...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Chat Lower form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#E8E4DA] flex items-center gap-2 mt-auto"
            id="scholar-chat-input-form"
          >
            <input
              type="text"
              placeholder="Ask a study question on this verse..."
              className="flex-1 text-xs border border-[#E8E4DA] rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500 text-navy placeholder-stone-500"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
              title="Send study question"
            >
              <Send className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownloadExegesisPDF}
              className="p-2.5 bg-[#FAF7F0] hover:bg-[#FAF3E0] border border-[#E8E4DA] hover:border-teal-400 text-stone-700 hover:text-navy rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
              title="Download scriptural exegesis record PDF"
            >
              <FileDown className="w-4 h-4 text-[#C9973A]" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default AskTheScholar;
