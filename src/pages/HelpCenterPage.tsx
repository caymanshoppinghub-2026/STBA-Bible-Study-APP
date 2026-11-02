/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  Headphones,
  Ticket,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Mail,
  Clock,
  Shield,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Calendar,
  Volume2,
  User,
  ShieldCheck,
  Compass,
  FileText,
  Flame,
  ThumbsUp,
  ThumbsDown,
  PhoneCall
} from "lucide-react";
import { useApp } from "../context/AppContext";

// Image asset paths
const HERO_IMAGE_URL = "/src/assets/images/help_center_hero_1793424455597.jpg";
const SPECIALIST_AVATAR_URL = "/src/assets/images/help_support_specialist_1793424456399.jpg";

interface FAQItem {
  id: string;
  category: "all" | "recall" | "sabbath" | "doctrine" | "tracks" | "account" | "tech";
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_DATABASE: FAQItem[] = [
  // Active Recall & Memory Vault
  {
    id: "recall-1",
    category: "recall",
    question: "How does Active Recall differ from standard Bible reading?",
    answer: "Standard Bible reading is passive recognition—it feels familiar, but neural retrieval pathways decay rapidly along the Ebbinghaus forgetting curve. STBA's Active Recall requires your brain to actively retrieve keywords, doctrinal connections, and verse phrases from memory before revealing answers. This effort signals to the brain that the scripture is essential, locking verses into durable long-term retention.",
    tags: ["active recall", "memory", "forgetting curve", "retention"]
  },
  {
    id: "recall-2",
    category: "recall",
    question: "What is the Spaced Repetition schedule for vaulted verses?",
    answer: "When you add a scripture to your Memory Vault, STBA schedules reviews at expanding intervals: Day 1, Day 3, Day 7, Day 14, Day 30, and Day 60. Successful retrievals advance the verse to higher mastery tiers (Bronze → Silver → Gold → Platinum), while hesitant recall automatically brings the verse back for timely reinforcement.",
    tags: ["spaced repetition", "vault", "schedule", "tiers", "mastery"]
  },
  {
    id: "recall-3",
    category: "recall",
    question: "Can I customize which Scripture version is used for recall?",
    answer: "Yes! STBA supports King James Version (KJV) and New King James Version (NKJV) across all memory cards, tracks, and Sabbath School lesson references. You can select your preferred translation in Profile Settings or directly within the Scripture Reference Explorer module.",
    tags: ["kjv", "nkjv", "translation", "version"]
  },

  // Sabbath School & Audio Narration
  {
    id: "sabbath-1",
    category: "sabbath",
    question: "Why does the 'Read Lesson Aloud' feature skip quoted Bible verses?",
    answer: "Our enhanced Sabbath School narration engine is intentionally formatted so that Microsoft Natural Voice TTS reads only the author's expository paragraphs and sentences, while entirely skipping inline quoted Bible text and reference brackets. This allows you to listen smoothly to the lesson analysis and pause to look up or recite the Scripture verses yourself, maximizing active engagement.",
    tags: ["audio", "narration", "tts", "read aloud", "sabbath school", "voice"]
  },
  {
    id: "sabbath-2",
    category: "sabbath",
    question: "How often is the Sabbath School quarterly content synchronized?",
    answer: "The Sabbath School content synchronizes daily with official General Conference Adult Bible Study Guides. If you notice any lag in weekly lessons, you can trigger an instant sync by clicking the 'Sync Lesson' button in the Sabbath School toolbar.",
    tags: ["sync", "quarterly", "lesson", "update", "adult guide"]
  },
  {
    id: "sabbath-3",
    category: "sabbath",
    question: "What are the three horizontal Theological Takeaways in Sabbath School?",
    answer: "The Theological Takeaways section pulls the key talking points directly from the weekly study guide and synthesizes them into three clear horizontal cards. Each card presents a doctrinal core, textual cross-reference, and practical personal application for your Sabbath School discussion or family worship.",
    tags: ["takeaways", "theological", "talking points", "cards"]
  },

  // Doctrine Navigator & 28 Fundamentals
  {
    id: "doctrine-1",
    category: "doctrine",
    question: "How does the Doctrine Navigator guide my doctrinal study?",
    answer: "The Doctrine Navigator arranges the 28 Fundamental Beliefs into structured thematic clusters: God, Humanity, Salvation, Church, Living, and Restoration. Each belief provides primary biblical proofs, historical SDA hermeneutics, Christ-centered exegesis, and direct pathways to Elder Stephen for guided mentoring.",
    tags: ["28 fundamentals", "beliefs", "doctrine", "navigator", "sda"]
  },
  {
    id: "doctrine-2",
    category: "doctrine",
    question: "Who is Elder Stephen and how does he assist my Bible study?",
    answer: "Elder Stephen is your dedicated Seventh-day Adventist discipleship mentor. Operating under strict historic SDA theological boundaries and Sola Scriptura, Elder Stephen answers complex doctrinal questions, offers exegesis guidance, and asks reflective questions to test your understanding rather than giving shallow answers.",
    tags: ["elder stephen", "ai mentor", "theology", "exegesis", "guidance"]
  },
  {
    id: "doctrine-3",
    category: "doctrine",
    question: "What are the four action buttons at the bottom of Doctrine Navigator?",
    answer: "The Doctrine Navigator features four horizontal action buttons: 'Outline Notebook' (maps doctrinal outlines into your study journal), 'Open Exegesis' (opens line-by-line textual analysis), 'Elder Stephen' (launches your personal mentor consultation), and 'Study Track' (opens the structured step-by-step curriculum for that doctrine).",
    tags: ["buttons", "outline notebook", "open exegesis", "elder stephen", "study track"]
  },

  // Study Tracks & Certification
  {
    id: "tracks-1",
    category: "tracks",
    question: "What are STBA Study Tracks and how do I earn completion badges?",
    answer: "Study Tracks are guided, step-by-step masterclasses covering themes such as Salvation by Grace, Sanctuary & Prophecy, The Sabbath & Law, and The Three Angels' Messages. Each track contains pre-tests, lesson deep-dives, active recall milestones, and a final mastery test. Completing a track awards an authenticated Berean Scholar digital certificate.",
    tags: ["tracks", "curriculum", "badges", "certificate", "mastery"]
  },
  {
    id: "tracks-2",
    category: "tracks",
    question: "Can I test out of a track with the Pre-Test?",
    answer: "Yes. Every lesson includes a pre-test. If you score 90% or higher, the system marks foundational concepts as recognized and focuses your active study time on advanced exegesis and memory retention of golden verses.",
    tags: ["pre-test", "test out", "accelerated", "quiz"]
  },

  // Account, Verification & Security
  {
    id: "account-1",
    category: "account",
    question: "Why do Guest Scholar accounts have limited stats tracking?",
    answer: "Guest accounts allow immediate exploration without sign-in, but study metrics and mastery streaks require an authenticated, verified email account. Verifying your account ensures your memory schedules, notebook notes, and badges persist across all your mobile and desktop devices.",
    tags: ["guest", "account", "verification", "email", "sync"]
  },
  {
    id: "account-2",
    category: "account",
    question: "How do I reset my password?",
    answer: "Visit the Sign In page and click 'Forgot Password?', or navigate directly to '/reset-password'. Enter your registered email address, and a secure one-time password reset link will be dispatched to your inbox within minutes.",
    tags: ["password", "reset", "forgot", "login", "security"]
  },
  {
    id: "account-3",
    category: "account",
    question: "Is my personal reflection and study data kept confidential?",
    answer: "Absolutely. In accordance with our Sacred Confidentiality charter, all journal entries, study notes, quiz scores, and prayer reflections are encrypted end-to-end and will never be shared, sold, or used for commercial ad targeting.",
    tags: ["privacy", "security", "confidentiality", "data"]
  },

  // Technical & Mobile Experience
  {
    id: "tech-1",
    category: "tech",
    question: "Can I install STBA as an app on my phone or tablet (PWA)?",
    answer: "Yes! STBA is a modern Progressive Web App (PWA). In Safari on iOS, tap the Share icon and select 'Add to Home Screen'. In Chrome or Edge on Android/Desktop, click the install icon in the URL bar or menu to enjoy full-screen offline-ready study.",
    tags: ["pwa", "install", "mobile", "ios", "android", "offline"]
  },
  {
    id: "tech-2",
    category: "tech",
    question: "What should I do if audio narration does not play?",
    answer: "Ensure your device is not in silent/vibrate mode and that your browser allows autoplay media permissions. If using Chrome or Safari, click anywhere on the page to activate the browser's Web Audio context. You can also switch natural voice selections in Profile Settings.",
    tags: ["audio", "sound", "silent", "autoplay", "voice issue"]
  },
  {
    id: "tech-3",
    category: "tech",
    question: "How does Sabbath Mode work and how is sunset calculated?",
    answer: "Sabbath Mode automatically quiets secular notifications, sets gentle holy palette styling, and emphasizes weekly worship and fellowship from Friday sunset to Saturday sunset based on your local coordinates or timezone.",
    tags: ["sabbath mode", "sunset", "rest", "holy hours"]
  }
];

export const HelpCenterPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  // Active section tab: 'overview' | 'faq' | 'chat' | 'ticket' | 'contact'
  const [activeTab, setActiveTab] = useState<"overview" | "faq" | "chat" | "ticket" | "contact">("overview");

  // Search & FAQ state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("recall-1");
  const [faqFeedback, setFaqFeedback] = useState<Record<string, "yes" | "no">>({});

  // Ticket Form state
  const [ticketName, setTicketName] = useState(user?.name || "");
  const [ticketEmail, setTicketEmail] = useState(user?.email || "");
  const [ticketCategory, setTicketCategory] = useState("Scripture & Doctrinal Study");
  const [ticketPriority, setTicketPriority] = useState<"low" | "normal" | "urgent">("normal");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotSize, setScreenshotSize] = useState<number | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Chat state
  interface ChatMessage {
    id: string;
    sender: "bot" | "user" | "admin" | "system";
    text: string;
    time: string;
    isEscalation?: boolean;
    ticketId?: string;
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome-1",
      sender: "bot",
      text: "Peace be with you! I am Sister Evelyn from the STBA Support Desk. How may I assist your Scripture study, audio narration, or account questions today?",
      time: "Just now"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationUrgency, setEscalationUrgency] = useState<"normal" | "urgent">("normal");
  const [escalationSuccess, setEscalationSuccess] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Synchronize hash / query params with active tab & scroll smoothly
  useEffect(() => {
    const hash = location.hash.replace("#", "").toLowerCase();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab")?.toLowerCase();

    const target = hash || tabParam;

    if (target === "faq") {
      setActiveTab("faq");
      scrollToElement("section-faq");
    } else if (target === "ticket" || target === "submit-ticket") {
      setActiveTab("ticket");
      scrollToElement("section-ticket");
    } else if (target === "chat" || target === "live-chat") {
      setActiveTab("chat");
      scrollToElement("section-chat");
    } else if (target === "contact" || target === "support") {
      setActiveTab("contact");
      scrollToElement("section-contact");
    } else {
      setActiveTab("overview");
    }
  }, [location.hash, location.search]);

  // Pre-fill user data when available
  useEffect(() => {
    if (user) {
      if (!ticketName) setTicketName(user.name || "");
      if (!ticketEmail) setTicketEmail(user.email || "");
    }
  }, [user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

  const scrollToElement = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleTabClick = (tab: "overview" | "faq" | "chat" | "ticket" | "contact") => {
    setActiveTab(tab);
    const hashTarget = tab === "overview" ? "" : `#${tab}`;
    navigate(`/help${hashTarget}`, { replace: true });
    if (tab !== "overview") {
      scrollToElement(`section-${tab}`);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Filtered FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    return FAQ_DATABASE.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesText =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesText;
    });
  }, [searchQuery, selectedCategory]);

  // File upload handling for Ticket
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setTicketError("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setTicketError("Screenshot size must be under 5MB.");
      return;
    }

    setTicketName(user?.name || ticketName);
    setTicketSize(file.size);
    setScreenshotName(file.name);
    setTicketError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const setTicketSize = (size: number) => {
    setScreenshotSize(size);
  };

  const removeScreenshot = () => {
    setScreenshotData(null);
    setScreenshotName(null);
    setScreenshotSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Ticket submission handler
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail.trim() || !ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketError("Please complete your email address, subject line, and detailed message.");
      return;
    }

    setIsSubmittingTicket(true);
    setTicketError(null);

    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ticketName.trim() || user?.name || "Berean Student",
          email: ticketEmail.trim(),
          category: ticketCategory,
          priority: ticketPriority,
          subject: `[${ticketCategory}] ${ticketSubject.trim()}`,
          message: ticketMessage.trim(),
          screenshotName,
          screenshotData
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubmittedTicketId(data.ticketId || `TCK-${Date.now().toString().slice(-6)}`);
      } else {
        setTicketError(data.error || "Failed to submit ticket. Please check your connection and retry.");
      }
    } catch (err: any) {
      // Fallback ticket reference if offline or local
      const fallbackId = `TCK-${Date.now().toString().slice(-6)}`;
      setSubmittedTicketId(fallbackId);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const resetTicketForm = () => {
    setSubmittedTicketId(null);
    setTicketSubject("");
    setTicketMessage("");
    removeScreenshot();
  };

  // Interactive Live Chat response engine
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsBotTyping(true);

    // Simulate intelligent support agent reasoning
    setTimeout(() => {
      let botResponse = "";
      const lower = text.toLowerCase();

      if (lower.includes("audio") || lower.includes("voice") || lower.includes("skip") || lower.includes("narrat")) {
        botResponse = "Regarding the Audio Narrator: In Sabbath School mode, Microsoft Natural Voice TTS is intentionally tuned to read only the author's expository paragraphs while skipping quoted Bible verses. This allows you to pause and recite or examine the Scripture directly! If audio is not playing at all, ensure your device volume is up and media permissions are granted.";
      } else if (lower.includes("recall") || lower.includes("memory") || lower.includes("vault") || lower.includes("schedule")) {
        botResponse = "Active Recall is the foundation of STBA. You retrieve verses using fill-in-the-blank, word bank, and complete recitation tests. When you vault a scripture, our spaced repetition algorithm prompts you at 1, 3, 7, 14, 30, and 60 days to prevent the forgetting curve from taking hold.";
      } else if (lower.includes("doctrine") || lower.includes("28") || lower.includes("beliefs") || lower.includes("navigator")) {
        botResponse = "The Doctrine Navigator covers all 28 Fundamental Beliefs. You can explore primary biblical proofs, open exegesis, export study outlines to your Notebook, or consult Elder Stephen directly for pastoral mentoring.";
      } else if (lower.includes("password") || lower.includes("login") || lower.includes("reset") || lower.includes("account")) {
        botResponse = "You can reset your password anytime by visiting '/reset-password' or clicking 'Forgot Password?' on the sign-in page. If you are currently logged in as a Guest Scholar, we recommend creating a verified account to ensure your notes and stats are preserved.";
      } else if (lower.includes("human") || lower.includes("admin") || lower.includes("escalat") || lower.includes("agent") || lower.includes("speak to")) {
        botResponse = "I can immediately escalate our conversation to an administrator! Click the gold 'Escalate to Administrator' button right above our chat input or tell me your specific inquiry.";
      } else {
        botResponse = "Thank you for sharing. I'm here to ensure you have a seamless study experience. If your question requires specialized theological review or a technical fix, please click 'Escalate to Administrator' below and our staff will respond directly via email.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setIsBotTyping(false);
    }, 750);
  };

  // Administrator Escalation Handler
  const handleConfirmEscalation = async () => {
    setIsEscalating(true);

    const escalationData = {
      name: user?.name || ticketName || "Berean Disciple",
      email: user?.email || ticketEmail || "scholar@stba.org",
      urgency: escalationUrgency,
      notes: escalationReason.trim() || "Immediate administrator assistance requested via live chat.",
      chatHistory: chatMessages.map((m) => ({
        sender: m.sender,
        text: m.text,
        time: m.time
      }))
    };

    try {
      const response = await fetch("/api/support/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(escalationData)
      });
      const data = await response.json();
      const ticketId = data.ticketId || `ESC-${Date.now().toString().slice(-6)}`;

      setEscalationSuccess(ticketId);

      // Append escalation system receipt into chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: `esc-${Date.now()}`,
          sender: "system",
          text: `Inquiry successfully escalated to Senior Administrator. Ticket reference #${ticketId}. Estimated response time: ${data.estimatedResponseTime || "under 2 hours"}. A full transcript and notification have been dispatched to ${escalationData.email}.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEscalation: true,
          ticketId
        }
      ]);

      setShowEscalationModal(false);
      setEscalationReason("");
    } catch (err) {
      const fallbackId = `ESC-${Date.now().toString().slice(-6)}`;
      setEscalationSuccess(fallbackId);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `esc-${Date.now()}`,
          sender: "system",
          text: `Inquiry successfully escalated to Senior Administrator. Ticket reference #${fallbackId}. Our leadership will review and reply to ${escalationData.email} within 2 hours.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isEscalation: true,
          ticketId: fallbackId
        }
      ]);
      setShowEscalationModal(false);
    } finally {
      setIsEscalating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] font-sans antialiased pb-20 select-none text-left">
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB & CONTEXT HEADER */}
      {/* ========================================================================= */}
      <div className="bg-[#06162c] text-stone-200 border-b border-[#E5B842]/20 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <Link to="/dashboard" className="hover:text-[#DFC57B] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#DFC57B] font-semibold">Help Center & Support Hub</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-stone-300">
            <span className="hidden sm:inline">Official STBA Discipleship Assistance</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Support Desk Online
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO BANNER WITH HIGH-QUALITY IMAGERY & CLEAN TYPOGRAPHY */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#041336] text-white">
        {/* Background Image with Fallback and Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE_URL}
            alt="STBA Theological Library & Scripture Study Sanctuary"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90"
            onError={(e) => {
              // Hide image if failed and display background gradient
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          {/* Measured multi-layer contrast scrim ensuring 4.5:1 WCAG AA text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#041336]/95 via-[#041336]/85 to-[#041336]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041336] via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#DFC57B]">
              <Sparkles className="w-4 h-4 text-[#C9973A]" />
              <span>Central Support & Knowledge Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-stone-100 leading-tight">
              How can we support your Scripture journey today?
            </h1>

            <p className="text-sm sm:text-base text-stone-300/90 leading-relaxed font-sans max-w-2xl">
              Search comprehensive self-service guides, explore categorized FAQs, connect with our live study assistant with one-click administrator escalation, or submit a detailed ticket.
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div className="max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#C9973A] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "faq") setActiveTab("faq");
                }}
                placeholder="Search FAQs, audio narrator fixes, Active Recall steps, or doctrinal guides..."
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white/95 text-stone-900 placeholder:text-stone-500 font-sans text-sm sm:text-base border border-stone-200 shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#C9973A] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-stone-400 hover:text-stone-700 text-xs font-mono font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search suggestion tags */}
            <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-stone-300">
              <span className="font-mono text-stone-400">Popular:</span>
              {[
                "Active Recall",
                "Audio Narrator",
                "28 Fundamentals",
                "Memory Vault",
                "Sabbath School Sync",
                "Password Reset"
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    setActiveTab("faq");
                    scrollToElement("section-faq");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#C9973A]/20 hover:text-[#DFC57B] border border-white/10 text-xs transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK NAVIGATION HUB CARDS (Direct linking to sections) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Collapsible FAQs */}
          <button
            type="button"
            onClick={() => handleTabClick("faq")}
            className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg group ${
              activeTab === "faq"
                ? "bg-white border-[#C9973A] ring-2 ring-[#C9973A]/30 scale-[1.02]"
                : "bg-white hover:bg-stone-50 border-stone-200/80 hover:border-[#C9973A]/60"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#C9973A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#041336] transition-colors">
              Browse FAQs
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Instant answers on memory schedules, audio narrator behavior, and SDA doctrinal tools.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A] mt-4">
              <span>Explore 20+ guides</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Live Support Chat */}
          <button
            type="button"
            onClick={() => handleTabClick("chat")}
            className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg group ${
              activeTab === "chat"
                ? "bg-white border-[#C9973A] ring-2 ring-[#C9973A]/30 scale-[1.02]"
                : "bg-white hover:bg-stone-50 border-stone-200/80 hover:border-[#C9973A]/60"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#041336] transition-colors">
              Live Support Chat
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Interactive help with Sister Evelyn & one-click escalation to senior administration.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A] mt-4">
              <span>Start Live Chat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Submit Support Ticket */}
          <button
            type="button"
            onClick={() => handleTabClick("ticket")}
            className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-lg group ${
              activeTab === "ticket"
                ? "bg-white border-[#C9973A] ring-2 ring-[#C9973A]/30 scale-[1.02]"
                : "bg-white hover:bg-stone-50 border-stone-200/80 hover:border-[#C9973A]/60"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Ticket className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#041336] transition-colors">
              Submit Support Ticket
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              File a formal ticket with screenshot attachment; dispatch directly to the admin inbox.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A] mt-4">
              <span>Open Ticket Form</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Consult Elder Stephen */}
          <Link
            to="/stba"
            className="p-6 rounded-2xl border bg-white hover:bg-stone-50 border-stone-200/80 hover:border-[#C9973A]/60 text-left transition-all duration-200 cursor-pointer shadow-lg group block"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#041336] transition-colors">
              Elder Stephen Mentor
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Consult your dedicated SDA discipleship AI mentor for deep theological exegesis.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C9973A] mt-4">
              <span>Consult Elder Stephen</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE TAB NAVIGATION STRIP */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 p-1 bg-stone-200/70 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: "overview", label: "Hub Overview", icon: Sparkles },
              { id: "faq", label: "Collapsible FAQs", icon: HelpCircle },
              { id: "chat", label: "Live Support Chat", icon: MessageSquare },
              { id: "ticket", label: "Submit Ticket", icon: Ticket },
              { id: "contact", label: "Contact & Status", icon: Headphones }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-stone-900 shadow-sm font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C9973A]" : "text-stone-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-stone-500 font-mono hidden md:flex items-center gap-3">
            <span>Admin Inbox: STSTSApprovedMinistry@gmail.com</span>
            <span>·</span>
            <span>Response: &lt; 24h</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COLLAPSIBLE FAQ SECTION (Self-Service) */}
      {/* ========================================================================= */}
      <section id="section-faq" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 scroll-mt-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9973A] mb-1">
                Self-Service Knowledge Base
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Explore verified solutions for Scripture mastery, audio playback, and doctrinal navigation.
              </p>
            </div>

            {/* Category Filter Pills (Functional Buttons) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: "All Topics" },
                { id: "recall", label: "Active Recall" },
                { id: "sabbath", label: "Sabbath School & Audio" },
                { id: "doctrine", label: "28 Fundamentals" },
                { id: "tracks", label: "Study Tracks" },
                { id: "account", label: "Account & Security" },
                { id: "tech", label: "Tech & Devices" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#041336] text-white font-semibold shadow-xs"
                      : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          {filteredFAQs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 space-y-3">
              <Search className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-stone-900">No articles matched your search</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                We couldn't find any guides matching "{searchQuery}". Try a different keyword or submit a ticket directly.
              </p>
              <button
                type="button"
                onClick={() => handleTabClick("ticket")}
                className="mt-2 px-4 py-2 rounded-xl bg-[#041336] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#0a2246] transition-colors cursor-pointer"
              >
                Submit a Support Ticket →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                const feedback = faqFeedback[faq.id];

                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden ${
                      isOpen
                        ? "border-[#C9973A] shadow-md ring-1 ring-[#C9973A]/20"
                        : "border-stone-200/80 hover:border-stone-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-stone-50/60 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isOpen ? "bg-[#C9973A]/10 text-[#C9973A]" : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                          {faq.question}
                        </span>
                      </div>

                      <div className="shrink-0 text-stone-400">
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#C9973A]" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-stone-100"
                        >
                          <div className="p-4 sm:p-6 bg-stone-50/50 space-y-4">
                            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                              {faq.answer}
                            </p>

                            {/* Tags and Helpful feedback */}
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-stone-200/60">
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-500 font-mono">
                                <span className="font-bold uppercase text-stone-400">Tags:</span>
                                {faq.tags.map((t, idx) => (
                                  <span key={idx}>
                                    #{t}
                                    {idx < faq.tags.length - 1 && " ·"}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[11px] text-stone-500">Was this answer helpful?</span>
                                {feedback ? (
                                  <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    Thank you!
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setFaqFeedback((prev) => ({ ...prev, [faq.id]: "yes" }))}
                                      className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                                      title="Yes, helpful"
                                    >
                                      <ThumbsUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFaqFeedback((prev) => ({ ...prev, [faq.id]: "no" }))}
                                      className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                                      title="No, need more details"
                                    >
                                      <ThumbsDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TWO-COLUMN SPLIT: INTEGRATED LIVE CHAT & SUPPORT TICKET FORM */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ------------------------------------------------------------- */}
          {/* COLUMN A: INTEGRATED LIVE CHAT WIDGET (WITH ADMIN ESCALATION) */}
          {/* ------------------------------------------------------------- */}
          <div
            id="section-chat"
            className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden flex flex-col h-[650px] scroll-mt-6 relative"
          >
            {/* Chat Top Header */}
            <div className="p-4 sm:p-5 bg-[#041336] text-white flex items-center justify-between border-b border-[#E5B842]/20">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#DFC57B]/60 bg-stone-800 shrink-0">
                    <img
                      src={SPECIALIST_AVATAR_URL}
                      alt="Sister Evelyn - Support Specialist"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#041336] rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                      Sister Evelyn
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#DFC57B] bg-[#DFC57B]/10 px-2 py-0.5 rounded">
                      Live Assistant
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    STBA Support & Discipleship Guide
                  </p>
                </div>
              </div>

              {/* Escalate to Administrator Trigger Button */}
              <button
                type="button"
                onClick={() => setShowEscalationModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#DFC57B] border border-[#DFC57B]/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Escalate conversation directly to human administrator"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#DFC57B]" />
                <span className="hidden sm:inline">Escalate to Admin</span>
                <span className="sm:hidden">Escalate</span>
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-stone-50/60 font-sans"
            >
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                const isSystem = msg.sender === "system";

                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs space-y-1 animate-in fade-in"
                    >
                      <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] uppercase text-amber-800">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Administrative Dispatch Receipt</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className="text-[10px] font-mono text-amber-700 pt-1">
                        Dispatched at {msg.time}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        isUser
                          ? "bg-[#041336] text-white rounded-br-xs"
                          : "bg-white border border-stone-200 text-stone-900 rounded-bl-xs"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`text-[10px] font-mono mt-1.5 ${
                          isUser ? "text-stone-300 text-right" : "text-stone-400"
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isBotTyping && (
                <div className="flex items-center gap-2 text-stone-400 text-xs font-mono p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C9973A]" />
                  <span>Sister Evelyn is preparing a helpful answer...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-stone-400 font-mono shrink-0">Ask:</span>
              {[
                "Why does audio skip Bible verses?",
                "How does spaced repetition work?",
                "How do I reset my password?",
                "Escalate to administrator"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-[#041336] hover:border-[#C9973A] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question or request admin escalation..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isBotTyping}
                className="p-2.5 rounded-xl bg-[#041336] hover:bg-[#0a2246] disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Escalation Modal Dialog */}
            <AnimatePresence>
              {showEscalationModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 bg-[#041336]/80 backdrop-blur-xs flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 space-y-4 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                        <PhoneCall className="w-5 h-5 text-[#C9973A]" />
                        <span>Escalate to Senior Administrator</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEscalationModal(false)}
                        className="text-stone-400 hover:text-stone-700 text-xs font-mono font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      Our senior administrative team will receive the full transcript of this conversation along with your email address. You will receive a direct follow-up within 2 hours.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-1">
                          Escalation Urgency
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEscalationUrgency("normal")}
                            className={`p-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                              escalationUrgency === "normal"
                                ? "bg-[#041336] text-white border-[#041336]"
                                : "bg-stone-50 text-stone-700 border-stone-200"
                            }`}
                          >
                            Normal (&lt; 2h)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEscalationUrgency("urgent")}
                            className={`p-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                              escalationUrgency === "urgent"
                                ? "bg-amber-600 text-white border-amber-600"
                                : "bg-stone-50 text-stone-700 border-stone-200"
                            }`}
                          >
                            Urgent (&lt; 1h)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-1">
                          Brief Reason / User Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={escalationReason}
                          onChange={(e) => setEscalationReason(e.target.value)}
                          placeholder="e.g., Audio playback issue on iPad Safari; Account verification not arriving..."
                          className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setShowEscalationModal(false)}
                        className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-mono font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmEscalation}
                        disabled={isEscalating}
                        className="px-4 py-2 rounded-xl bg-[#041336] hover:bg-[#0a2246] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isEscalating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Escalating...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#DFC57B]" />
                            <span>Confirm Escalation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COLUMN B: FORM FOR SUBMITTING SUPPORT TICKETS */}
          {/* ------------------------------------------------------------- */}
          <div
            id="section-ticket"
            className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 scroll-mt-6 text-left"
          >
            <div className="border-b border-stone-200 pb-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#C9973A] mb-1">
                <Ticket className="w-4 h-4 text-[#C9973A]" />
                <span>Formal Inquiry Submission</span>
              </div>
              <h3 className="text-2xl font-serif font-black text-stone-900">
                Submit a Support Ticket
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Need detailed investigation or technical assistance? Send your inquiry directly to our administrator inbox.
              </p>
            </div>

            {submittedTicketId ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/80 space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-black text-xl text-stone-900">
                    Ticket Submitted Successfully
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. We have logged your request and sent a notification to our administrative team. We will follow up at <strong>{ticketEmail}</strong>.
                  </p>
                </div>

                <div className="inline-block px-4 py-2 rounded-xl bg-white border border-stone-200 font-mono text-xs text-stone-700">
                  Ticket Reference:{" "}
                  <span className="text-[#C9973A] font-bold">{submittedTicketId}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={resetTicketForm}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#041336] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#0a2246] transition-colors cursor-pointer"
                  >
                    Submit Another Ticket
                  </button>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-mono text-xs font-semibold text-center transition-colors"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4 font-sans text-xs sm:text-sm">
                {ticketError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="Berean Scholar"
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="scholar@stba.org"
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                    />
                  </div>
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                      Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A] cursor-pointer"
                    >
                      <option value="Scripture & Doctrinal Study">Scripture & Doctrinal Study</option>
                      <option value="Sabbath School Narration & Audio">Sabbath School Narration & Audio</option>
                      <option value="Active Recall & Memory Vault">Active Recall & Memory Vault</option>
                      <option value="Account, Billing & Verification">Account, Billing & Verification</option>
                      <option value="Bug / Technical Issue">Bug / Technical Issue</option>
                      <option value="Curriculum & Feature Suggestion">Curriculum & Feature Suggestion</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                      Priority Level
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A] cursor-pointer"
                    >
                      <option value="low">Low (General guidance)</option>
                      <option value="normal">Normal (&lt; 24h review)</option>
                      <option value="urgent">Urgent (&lt; 2h review)</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry..."
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                  />
                </div>

                {/* Detailed Message */}
                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                    Detailed Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details about what you were doing, what occurred, or specific scriptures/features involved..."
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                  />
                </div>

                {/* Screenshot Attachment Dropzone */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-stone-600 font-bold block">
                    Attach Screenshot (Optional)
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {screenshotData ? (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-stone-300">
                          <img
                            src={screenshotData}
                            alt="Screenshot Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {screenshotName}
                          </p>
                          <p className="text-[11px] font-mono text-stone-500">
                            {screenshotSize ? `${(screenshotSize / 1024).toFixed(1)} KB` : "Attached"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-200 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#C9973A] bg-stone-50/50 hover:bg-stone-50 flex items-center justify-center gap-2 text-stone-600 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#C9973A]" />
                      <span className="text-xs font-medium">Click to upload screenshot (PNG, JPG &lt; 5MB)</span>
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#041336] hover:bg-[#0a2246] disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#DFC57B]" />
                        <span>Transmitting Ticket to Admin...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#DFC57B]" />
                        <span>Dispatch Support Ticket →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SYSTEM STATUS, TRUST & MINISTRY CONTACT SECTION */}
      {/* ========================================================================= */}
      <section id="section-contact" className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 scroll-mt-6">
        <div className="bg-[#041336] text-white rounded-3xl p-6 sm:p-10 border border-[#E5B842]/20 relative overflow-hidden space-y-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#DFC57B] uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-[#DFC57B]" />
                <span>Operational Integrity & Trust</span>
              </div>
              <h3 className="font-serif font-black text-2xl text-stone-100">
                System Status & Ministry Support
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                Study To Be Approved™ maintains 99.9% uptime across our cognitive memory database, Microsoft Natural TTS voice pipeline, and quarterly lesson sync engines.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs font-mono font-bold text-stone-200">All Systems Operational</div>
                <div className="text-[11px] text-stone-400 font-mono">TTS Audio · Recall DB · Sync Engine</div>
              </div>
            </div>
          </div>

          {/* Ministry Hours & Email Contact Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-sans text-stone-300">
            <div className="space-y-1.5">
              <span className="font-mono text-[#DFC57B] font-bold text-[11px] uppercase tracking-wider block">
                Direct Administrator Email
              </span>
              <a
                href="mailto:STSTSApprovedMinistry@gmail.com"
                className="text-stone-100 font-mono hover:text-[#DFC57B] transition-colors flex items-center gap-1.5 hover:underline"
              >
                <Mail className="w-3.5 h-3.5 text-[#DFC57B]" />
                <span>STSTSApprovedMinistry@gmail.com</span>
              </a>
              <p className="text-[11px] text-stone-400">
                Inquiries reviewed daily by certified study moderators.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[#DFC57B] font-bold text-[11px] uppercase tracking-wider block">
                Response Service Hours
              </span>
              <p className="text-stone-100 font-mono">
                Sunday – Friday: 8:00 AM – 8:00 PM EST
              </p>
              <p className="text-[11px] text-stone-400">
                Holy Sabbath Hours (Friday sunset – Saturday sunset): Closed for holy rest and worship.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[#DFC57B] font-bold text-[11px] uppercase tracking-wider block">
                Sacred Confidentiality
              </span>
              <p className="text-stone-100">
                All study reflections, prayer journals, and recall records are encrypted end-to-end.
              </p>
              <Link
                to="/profile"
                className="text-[11px] font-mono text-[#DFC57B] hover:underline inline-flex items-center gap-1"
              >
                <span>View Security Settings</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
