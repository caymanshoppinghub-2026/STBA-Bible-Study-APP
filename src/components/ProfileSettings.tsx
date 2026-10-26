/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Bell,
  BookOpen,
  Settings,
  ChevronRight,
  LogOut,
  Calendar,
  Shield,
  Activity,
  Award,
  Clock,
  Check,
  Compass,
  Sparkles,
  ToggleLeft,
  X,
  Trophy,
  Milestone,
  CheckCircle2,
  Crown,
  Bookmark,
  Lock,
  Unlock,
  Flame,
  GraduationCap,
  UserCheck,
  Users,
  TrendingUp,
  BarChart2,
  RefreshCw,
  ArrowUpRight
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";
import { TeacherRoleGuideModal } from "./sabbathSchool/TeacherRoleGuideModal";
import { getElderStephenVoice, filterEdgeNaturalVoices } from "./stba/RightPaneTools";
import { MasteryPath } from "./MasteryPath";
import { addNotification } from "../utils/notificationsManager";
import { simulateLiveSectionUpdate, checkForLiveContentUpdates } from "../utils/contentUpdatesWatcher";
import { ReflectionJournal } from "./ReflectionJournal";
import { UserStatsPage } from "./UserStatsPage";
import { WeeklyScribeHeatmap } from "./WeeklyScribeHeatmap";
import { triggerManualRecallPopup } from "../utils/recallScheduler";
import { useApp } from "../context/AppContext";
import { saveProfileToSupabase } from "../lib/notebookSync";
import { triggerAutoUpdate } from "../api/sabbathSchoolApi";
import { useSabbathSchoolStore } from "../store/useSabbathSchoolStore";

interface ProfileSettingsProps {
  onNavigate?: (tab: "home" | "tracks" | "vault" | "profile") => void;
  onSignOut?: () => void;
  userName?: string;
  userEmail?: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onNavigate,
  onSignOut,
  userName = "Noble Berean",
  userEmail = "jago.7878@gmail.com"
}) => {
  const { user, setUser, completedVerseIds = [] } = useApp();
  const { sabbathMode, manualOverride, toggleManualOverride } = useSabbathMode();

  const hasCompletedSession = (localStorage.getItem("stba_has_completed_session") === "true") || (localStorage.getItem("stba_completed_verses") !== null && JSON.parse(localStorage.getItem("stba_completed_verses") || "[]").length > 0) || (localStorage.getItem("stba_vaulted_verses") !== null && JSON.parse(localStorage.getItem("stba_vaulted_verses") || "[]").length > 0);

  // Active sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<"settings" | "journal" | "stats">("settings");

  // Edit Profile credentials states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [tempUserName, setTempUserName] = useState("");
  const [tempUserEmail, setTempUserEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showEmailVerificationAlert, setShowEmailVerificationAlert] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studyStreak = (() => {
    const saved = localStorage.getItem("stba_study_streak_count");
    if (saved) return parseInt(saved, 10);
    return hasCompletedSession ? 14 : 0;
  })();

  const totalCompletedVerses = hasCompletedSession ? (completedVerseIds ? completedVerseIds.length : 0) + 46 : 0;
  const chaptersCompleted = hasCompletedSession ? 3 : 0;

  const milestonesList = [
    {
      id: "first_session",
      name: "Disciple's Spark",
      requirement: "Complete your very first active scripture memory session.",
      current: hasCompletedSession ? 1 : 0,
      target: 1,
      earned: hasCompletedSession,
      icon: Sparkles,
      iconColor: "text-amber-500",
      bgAccent: "bg-amber-500/5 border-amber-200",
      verse: "“Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105",
      reward: "Disciple's standard lamp unlocked"
    },
    {
      id: "seven_day_streak",
      name: "7-Day Devoted Streak",
      requirement: "Maintain a study streak of 7 consecutive days to develop spiritual habits.",
      current: studyStreak,
      target: 7,
      earned: studyStreak >= 7,
      icon: Trophy,
      iconColor: "text-amber-600",
      bgAccent: "bg-amber-600/5 border-amber-300",
      verse: "“He that overcometh shall inherit all things; and I will be his God...” — Revelation 21:7",
      reward: "+15 Scriptorium Focus rating"
    },
    {
      id: "bible_chapter_comp",
      name: "Chapter Completed",
      requirement: "Successfully master all verses in one or more active study chapters.",
      current: chaptersCompleted,
      target: 1,
      earned: chaptersCompleted >= 1,
      icon: BookOpen,
      iconColor: "text-emerald-500",
      bgAccent: "bg-emerald-500/5 border-emerald-200",
      verse: "“Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.” — 2 Timothy 2:15",
      reward: "+30 Memory Depth Boost"
    },
    {
      id: "ten_scriptures",
      name: "Scribal Scholar",
      requirement: "Commit at least 10 scriptures to your permanent Memory Vault.",
      current: totalCompletedVerses,
      target: 10,
      earned: totalCompletedVerses >= 10,
      icon: Milestone,
      iconColor: "text-blue-500",
      bgAccent: "bg-blue-500/5 border-blue-200",
      verse: "“Thy word have I hid in mine heart, that I might not sin against thee.” — Psalm 119:11",
      reward: "+10 Scholar Sanity status"
    },
    {
      id: "noble_mastery",
      name: "Covenant Crown",
      requirement: "Reach an outstanding 14-day consecutive active recall study streak.",
      current: studyStreak,
      target: 14,
      earned: studyStreak >= 14,
      icon: Crown,
      iconColor: "text-indigo-500",
      bgAccent: "bg-indigo-500/5 border-indigo-200",
      verse: "“Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life...” — James 1:12",
      reward: "Berean Elder status glow unlocked"
    },
    {
      id: "explorer_compass",
      name: "Theological Voyager",
      requirement: "Explore multiple study tracks to expand your cognitive doctrinal horizons.",
      current: hasCompletedSession ? 4 : 0,
      target: 4,
      earned: hasCompletedSession,
      icon: Compass,
      iconColor: "text-rose-500",
      bgAccent: "bg-rose-500/5 border-rose-200",
      verse: "“Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened...” — Matthew 7:7",
      reward: "+20 Spatial Navigation Accuracy"
    }
  ];

  const activeName = user?.name || userName;
  const activeEmail = user?.email || userEmail;
  const activeProfilePic = user?.profilePic || "";

  const handleEditProfileClick = () => {
    setTempUserName(user?.name || userName || "Noble Berean");
    setTempUserEmail(user?.email || userEmail || "disciple@berean.org");
    setProfilePic(user?.profilePic || profilePic || "");
    setProfileModalOpen(true);
  };

  const processFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) {
      displayMessage("Please select a valid image file (PNG, JPEG, WEBP, or GIF).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      displayMessage("Image is too large. Choose an image under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setProfilePic(reader.result as string);
        displayMessage("Profile picture loaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedName = tempUserName.trim();
    const newEmail = tempUserEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName || trimmedName.length < 2) {
      displayMessage("Display name must be at least 2 characters long.");
      return;
    }

    if (!newEmail || !emailRegex.test(newEmail)) {
      displayMessage("Please enter a valid email address (e.g. disciple@berean.org).");
      return;
    }

    const baseUser = user || {
      name: trimmedName,
      email: newEmail,
      isSda: true,
      firstTrack: "fundamental-beliefs",
      role: "Student" as const,
      isGuest: false,
      emailVerified: true
    };

    let emailChanged = false;
    const oldEmail = baseUser.email;

    if (newEmail && newEmail.toLowerCase() !== oldEmail.toLowerCase()) {
      emailChanged = true;
    }

    const updatedUser = {
      ...baseUser,
      name: trimmedName,
      email: newEmail,
      profilePic: profilePic || baseUser.profilePic,
      emailVerified: emailChanged ? false : baseUser.emailVerified,
    };

    setUser(updatedUser);
    setProfileModalOpen(false);

    if (emailChanged) {
      try {
        await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newEmail })
        });
      } catch (e) {
        console.error("Verification email trigger endpoint error:", e);
      }
      setShowEmailVerificationAlert(true);
    } else {
      displayMessage("Profile picture, username, and email saved permanently!");
    }
  };

  // Sabbath School Store Hook
  const sabbathSchoolStore = useSabbathSchoolStore();
  const { userRole, setUserRole } = sabbathSchoolStore;

  // Automatic Quarterly Update toggle state
  const [autoQuarterlyUpdate, setAutoQuarterlyUpdate] = useState<boolean>(() => {
    const saved = localStorage.getItem("stba_auto_quarterly_update");
    if (saved !== null) return saved === "true";
    return user?.autoQuarterlyUpdate ?? true;
  });

  const toggleAutoQuarterlyUpdate = async () => {
    const nextVal = !autoQuarterlyUpdate;
    setAutoQuarterlyUpdate(nextVal);
    localStorage.setItem("stba_auto_quarterly_update", String(nextVal));

    if (user) {
      setUser({ ...user, autoQuarterlyUpdate: nextVal });
    }

    if (nextVal) {
      displayMessage("Automatic Quarterly Update ON: Scraper engaged for Sabbath School 2026 Q3.");
      try {
        const scraped = await triggerAutoUpdate(true);
        if (scraped && 'quarterlyTitle' in scraped) {
          sabbathSchoolStore.setQuarterlyTitle(scraped.quarterlyTitle);
          sabbathSchoolStore.setLessonTitle(scraped.lessonTitle);
          sabbathSchoolStore.setMemoryVerse(scraped.memoryVerse);
          sabbathSchoolStore.setDailyLessons(scraped.dailyLessons);
          sabbathSchoolStore.setDeckCards(scraped.deckCards);
        }
      } catch (err) {
        console.error("Auto-update scraper trigger error:", err);
      }
    } else {
      displayMessage("Automatic Quarterly Update OFF: Scraper paused.");
    }
  };

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("stba_notifications_enabled") !== "false";
  });
  const [sectionAlertsEnabled, setSectionAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("stba_section_updates_notifications") !== "false";
  });
  const [bibleVersion, setBibleVersion] = useState<"KJV" | "NKJV" | "NIV" | "ESV">(() => {
    return (localStorage.getItem("stba_bible_version") as any) || "KJV";
  });
  const [egwIntegration, setEgwIntegration] = useState(() => {
    return localStorage.getItem("stba_egw_integration") !== "false";
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem("stba_reminder_time") || "07:30";
  });
  const [aiVoice, setAiVoice] = useState<"Kore" | "Aoede" | "Zephyr" | "Fenrir" | "Puck">(() => {
    const saved = localStorage.getItem("stba_ai_voice");
    if (!saved || saved === "Charon") {
      localStorage.setItem("stba_ai_voice", "Puck");
      return "Puck";
    }
    return saved as any;
  });

  const [ttsEngine, setTtsEngine] = useState<"original" | "browser">(() => {
    return (localStorage.getItem("stba_tts_engine") as "original" | "browser") || "original";
  });
  const [browserVoiceUri, setBrowserVoiceUri] = useState<string>(() => {
    return localStorage.getItem("stba_browser_voice_uri") || "";
  });
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        setBrowserVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const [dailyVersesCount, setDailyVersesCount] = useState<number>(() => {
    const saved = localStorage.getItem("stba_daily_verse_limit");
    return saved ? parseInt(saved, 10) : 5;
  });

  // Sabbath School Centralized Management & Date Selector State
  const [sabbathDate, setSabbathDate] = useState<string>(() => {
    return localStorage.getItem("stba_sabbath_selected_date") || new Date().toISOString().split("T")[0];
  });
  const [isFetchingDateData, setIsFetchingDateData] = useState<boolean>(false);
  const [classCodeInput, setClassCodeInput] = useState<string>(() => {
    return localStorage.getItem("stba_sabbath_class_code") || "";
  });
  const [classNameInput, setClassNameInput] = useState<string>(() => {
    return localStorage.getItem("stba_sabbath_class_name") || "";
  });
  const [isEnrolledInClass, setIsEnrolledInClass] = useState<boolean>(() => {
    return localStorage.getItem("stba_sabbath_enrolled") === "true";
  });
  const [isTeacherGuideOpen, setIsTeacherGuideOpen] = useState<boolean>(false);
  const [classRosterList, setClassRosterList] = useState<any[]>([]);
  const [liveAnalyticsData, setLiveAnalyticsData] = useState<any>(null);
  const [isReturnToDesktopGlowing, setIsReturnToDesktopGlowing] = useState<boolean>(() => {
    return localStorage.getItem("stba_profile_tour_completed") === "true" && !sessionStorage.getItem("stba_returned_after_profile_tour");
  });

  // Sync live classroom analytics and roster on mount
  React.useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await sabbathSchoolStore.syncClassroomAnalytics();
        if (data) {
          setLiveAnalyticsData(data);
          if (data.roster) setClassRosterList(data.roster);
        }
      } catch (e) {
        console.error("Failed to load live analytics on profile mount:", e);
      }
    };
    loadAnalytics();

    const handleEnsureSettings = () => {
      setActiveSubTab("settings");
    };
    const handleFinalStep = (e: any) => {
      const isFinal = e?.detail?.isFinalStep ?? true;
      setIsReturnToDesktopGlowing(isFinal);
    };
    const handleTourCompleted = () => {
      setIsReturnToDesktopGlowing(true);
    };

    window.addEventListener("stba-ensure-settings-tab", handleEnsureSettings);
    window.addEventListener("start-stba-profile-tour", handleEnsureSettings);
    window.addEventListener("stba-profile-tour-final-step", handleFinalStep);
    window.addEventListener("stba-profile-tour-completed", handleTourCompleted);
    return () => {
      window.removeEventListener("stba-ensure-settings-tab", handleEnsureSettings);
      window.removeEventListener("start-stba-profile-tour", handleEnsureSettings);
      window.removeEventListener("stba-profile-tour-final-step", handleFinalStep);
      window.removeEventListener("stba-profile-tour-completed", handleTourCompleted);
    };
  }, []);

  const handleFetchDateLesson = async (targetDateStr: string) => {
    if (!targetDateStr) return;
    setIsFetchingDateData(true);
    try {
      setSabbathDate(targetDateStr);
      localStorage.setItem("stba_sabbath_selected_date", targetDateStr);
      sabbathSchoolStore.setActiveLessonDate(targetDateStr);
      const result = await sabbathSchoolStore.fetchLessonByDateStore(targetDateStr);
      displayMessage(`Successfully pulled Adventech lesson for ${targetDateStr}: "${result.lessonTitle}"`);
    } catch (err: any) {
      displayMessage(`Error fetching lesson for ${targetDateStr}: ${err.message || 'Network error'}`);
    } finally {
      setIsFetchingDateData(false);
    }
  };

  const handleEnrollmentToggle = async () => {
    try {
      if (isEnrolledInClass) {
        await sabbathSchoolStore.enrollInClass({
          action: "leave",
          userName: activeName
        });
        setIsEnrolledInClass(false);
        localStorage.setItem("stba_sabbath_enrolled", "false");
        displayMessage("Successfully unenrolled from Sabbath School class.");
      } else {
        const res = await sabbathSchoolStore.enrollInClass({
          action: "enroll",
          userName: activeName,
          role: userRole,
          classCode: classCodeInput,
          className: classNameInput
        });
        setIsEnrolledInClass(true);
        localStorage.setItem("stba_sabbath_enrolled", "true");
        localStorage.setItem("stba_sabbath_class_code", classCodeInput);
        localStorage.setItem("stba_sabbath_class_name", classNameInput);
        if (res.roster) setClassRosterList(res.roster);
        displayMessage(`Successfully enrolled in ${classNameInput} (${classCodeInput}) as ${userRole}.`);
      }
    } catch (err: any) {
      displayMessage(`Enrollment action failed: ${err.message || 'Server error'}`);
    }
  };

  const [queueFrequency, setQueueFrequency] = useState<number>(() => {
    const saved = localStorage.getItem("stba_recall_queue_frequency");
    return saved ? parseInt(saved, 10) : 3;
  });

  const [recallPopupsEnabled, setRecallPopupsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("stba_recall_popups_enabled") !== "false";
  });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Modal selector for viewing the scribal mastery progression map
  const [masteryMapOpen, setMasteryMapOpen] = useState(false);

  // Interaction alert simulations
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const displayMessage = (msg: string) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(null), 3000);
  };

  const renderUserStatsTab = () => {
    return <UserStatsPage isEmbedded={true} />;
  };

  const activityWeeks = [
    { day: "Su", active: hasCompletedSession ? true : false },
    { day: "Mo", active: hasCompletedSession ? true : false },
    { day: "Tu", active: false },
    { day: "We", active: hasCompletedSession ? true : false },
    { day: "Th", active: hasCompletedSession ? true : false },
    { day: "Fr", active: false },
    { day: "Sa", active: hasCompletedSession ? true : false } // Sabbath study is verified
  ];

  return (
    <div
      id="profile-settings-page-wrapper"
      className="w-full text-left"
    >
      {/* APP NOTIFIER TOAST (SIMULATED) */}
      <AnimatePresence>
        {infoMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#1C2333] text-white py-3 px-4 text-xs rounded-xl shadow-lg border border-gold/20 flex items-center space-x-2"
          >
            <span className="p-1 rounded-full bg-gold/10 text-gold text-[10px]">✓</span>
            <span className="font-sans font-medium">{infoMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION WRAPPING */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E4DA] pb-5 mb-8 gap-4" id="profile-heading-flow">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#C9973A] font-bold block mb-1">
            Student Settings & Achievements
          </span>
          <h1 className="font-serif font-extrabold text-3.5xl text-[#1C2333]" id="profile-title">
            Disciple Profile
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">Manage your active recall pacing, translation metrics, & Sabbath rest options.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("settings");
              window.dispatchEvent(new CustomEvent("start-stba-profile-tour"));
            }}
            className="p-2 text-[10px] uppercase font-mono tracking-wide bg-[#C9973A]/15 hover:bg-[#C9973A]/25 text-[#A67D2E] border border-[#C9973A]/40 hover:border-[#C9973A] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
            title="Take the Profile Settings & Preferences Guided Tour"
            id="profile-tour-replay-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9973A]" />
            <span>Take Profile Tour</span>
          </button>

          <div className="p-2 text-[10px] uppercase font-mono tracking-wide bg-[#C9973A]/10 text-gold border border-[#C9973A]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5" id="member-duration-tag">
            <Calendar className="w-3.5 h-3.5" />
            <span>Student Member Since Oct 2026</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher for Settings, Journal, and Stats */}
      <div className="flex border-b border-[#E8E4DA] mb-6 space-x-6 text-sm" id="profile-sub-tabs">
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`pb-3 font-sans font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer relative ${
            activeSubTab === "settings" ? "text-[#C9973A] font-semibold" : "text-stone-400 hover:text-stone-700"
          }`}
          id="tab-btn-settings"
        >
          <span>Settings & Profile</span>
          {activeSubTab === "settings" && (
            <motion.div layoutId="profile-subtab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9973A]" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("journal")}
          className={`pb-3 font-sans font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer relative ${
            activeSubTab === "journal" ? "text-[#C9973A] font-semibold" : "text-stone-400 hover:text-stone-700"
          }`}
          id="tab-btn-journal"
        >
          <span>My Journal</span>
          {activeSubTab === "journal" && (
            <motion.div layoutId="profile-subtab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9973A]" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("stats")}
          className={`pb-3 font-sans font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer relative ${
            activeSubTab === "stats" ? "text-[#C9973A] font-semibold" : "text-stone-400 hover:text-stone-700"
          }`}
          id="tab-btn-stats"
        >
          <span>User Stats</span>
          {activeSubTab === "stats" && (
            <motion.div layoutId="profile-subtab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9973A]" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "stats" ? (
          <motion.div
            key="stats-tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {renderUserStatsTab()}
          </motion.div>
        ) : activeSubTab === "journal" ? (
          <motion.div
            key="journal-tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <ReflectionJournal sabbathMode={sabbathMode} />
          </motion.div>
        ) : (
          <motion.div
            key="settings-tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {/* MAIN LAYOUT GRID (Responsive 2-column layout on Tablet+) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile-core-grid">
        
        {/* LEFT COLUMN: User Card, Level Badge & Activity Heatmap */}
        <div className="space-y-6 lg:col-span-1" id="profile-col-info">
          
          {/* USER INFO SECTION WITH MASTERY LEVEL BADGE */}
          <section
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              sabbathMode
                ? "bg-[#FAF7F0] border-[#E8E2D1]"
                : "bg-white border-[#E8E4DA] shadow-sm"
            }`}
            id="user-metadata-card"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Profile Avatar Sphere */}
              <div className="w-20 h-20 rounded-full bg-[#1C2333] text-gold border-2 border-[#C9973A] flex items-center justify-center font-serif text-2xl font-extrabold shadow-sm relative group overflow-hidden">
                {activeProfilePic ? (
                  <img
                    src={activeProfilePic}
                    alt={activeName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{activeName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2)}</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2A9D8F] text-white border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                  ★
                </div>
              </div>

              <div>
                <h2 className="font-serif font-extrabold text-2xl text-[#1C2333]" id="user-display-name">
                  {activeName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5" id="user-display-email">
                  {activeEmail}
                </p>
              </div>

              {/* Mastery progress badge: interactive! */}
              <button
                onClick={() => setMasteryMapOpen(true)}
                className="w-full bg-[#FAF7F0] hover:bg-[#F3EFE3] border border-[#E8E2D1] rounded-xl p-3 text-left transition-all relative group"
                id="mastery-level-badge-action"
                title="Click to view total mastery syllabus"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#C9973A]/10 text-[#C9973A] rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-extrabold block">
                      {hasCompletedSession ? "Mastery Status" : "Profile Stats"}
                    </span>
                    <span className="font-serif font-extrabold text-[#1C2333] text-sm group-hover:text-[#C9973A] transition-colors flex items-center gap-1.5">
                      {hasCompletedSession ? "Scholar Level" : "Beginner Level"}
                      {hasCompletedSession && <Sparkles className="w-3.5 h-3.5 text-gold" style={{ display: "inline" }} />}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-405 absolute right-3.5 top-1/2 -translate-y-1/2 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {!hasCompletedSession && (
                <div className="w-full p-3 bg-[#FAF7F0]/60 border border-[#E8E2D1] rounded-xl text-left space-y-1 text-xs text-stone-700">
                  <p className="font-sans font-medium text-[#1C2333]">
                    Your Disciple Profile grows as you memorize Scripture and complete sessions.
                  </p>
                  <p className="text-stone-500 italic text-[11px] leading-relaxed">
                    Finish your first study to begin your progression journey.
                  </p>
                </div>
              )}

              <button
                onClick={handleEditProfileClick}
                className="text-xs font-semibold text-[#A67D2E] hover:underline"
                id="edit-profile-action"
              >
                Update Profile Picture & User Name and Email
              </button>
            </div>
          </section>

          {/* WEEKLY ACTIVITY HEATMAP (7-day tracker dots) */}
          <WeeklyScribeHeatmap
            sabbathMode={sabbathMode}
            onOpenStats={() => setActiveSubTab("stats")}
          />

          {/* SCRIBAL MILESTONES & DISCIPLE BADGES */}
          <section
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              sabbathMode
                ? "bg-[#FAF7F0] border-[#E8E2D1]"
                : "bg-white border-[#E8E4DA] shadow-sm"
            }`}
            id="scribal-milestones-card"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#C9973A]">
                  <Trophy className="w-4 h-4" />
                  <h3 className="font-serif font-bold text-[#1C2333] text-sm">Scribal Achievements</h3>
                </div>
                <span className="text-[10px] font-mono font-extrabold bg-[#C9973A]/10 text-[#C9973A] px-2.5 py-1 rounded-full">
                  {milestonesList.filter(m => m.earned).length} / {milestonesList.length} Cleared
                </span>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed font-sans">
                Earn collectible badges and dignity tokens by completing your active memorization schedules and staying faithful:
              </p>

              {/* Grid of Badges */}
              <div className="grid grid-cols-3 gap-2.5" id="achievements-badges-grid">
                {milestonesList.map((bg) => {
                  const IconComponent = bg.icon;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedMilestone(bg)}
                      className={`p-2 py-3.5 rounded-xl border flex flex-col items-center text-center justify-between transition-all duration-300 cursor-pointer relative group ${
                        bg.earned
                          ? `${bg.bgAccent} hover:shadow-md hover:scale-105 active:scale-95`
                          : sabbathMode
                          ? "bg-stone-100/40 border-[#E8E2D1] opacity-40 hover:opacity-100"
                          : "bg-stone-50 border-stone-150 opacity-40 hover:opacity-100"
                      }`}
                      id={`badge-button-${bg.id}`}
                      title={`Click to view achievement details for ${bg.name}`}
                    >
                      {/* Compact Locked indicator */}
                      {!bg.earned && (
                        <div className="absolute top-1 right-1 text-[#C9973A] text-[7px] font-bold z-10 leading-none">
                          🔒
                        </div>
                      )}

                      <div className="h-9 w-9 rounded-xl bg-white border border-stone-150 flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:rotate-6 shadow-3xs">
                        <IconComponent className={`w-4.5 h-4.5 ${bg.earned ? bg.iconColor : "text-stone-300"}`} />
                      </div>

                      <div className="space-y-1 w-full">
                        <p className={`text-[9.5px] font-serif font-bold leading-tight truncate px-0.5 ${bg.earned ? "text-stone-850" : "text-stone-400 font-medium"}`}>
                          {bg.name}
                        </p>
                        
                        {/* Compact progress bar */}
                        <div className="w-full bg-stone-250 h-0.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full transition-all duration-500 ${bg.earned ? "bg-[#C9973A]" : "bg-stone-300"}`}
                            style={{ width: `${Math.min(100, (bg.current / bg.target) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Sabbath School Toggle, Preferred Selection Menu Lists, and Change Password */}
        <div className="space-y-6 lg:col-span-2" id="profile-col-preference-inputs">

          {/* CENTRALIZED SABBATH SCHOOL MANAGEMENT SECTION */}
          <section className="space-y-4" id="sabbath-school-centralized-hub">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-[#C9973A] font-bold block flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Sabbath School Management</span>
              </span>
              <span className="text-[10px] font-bold bg-[#C9973A]/10 text-[#C9973A] border border-[#C9973A]/20 px-2.5 py-0.5 rounded-full uppercase">
                Central Hub
              </span>
            </div>

            {/* 1. TEACHER / STUDENT ROLE & ENROLLMENT CARD */}
            <section
              className={`p-5 rounded-2xl border transition-all duration-500 text-left space-y-4 ${
                sabbathMode
                  ? "bg-[#FAF7F0] border-[#E8E2D1]"
                  : "bg-white border-[#E8E4DA] shadow-sm"
              }`}
              id="profile-sabbath-role-selection"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-[#C9973A]" />
                    <span className="font-serif font-extrabold text-[#1C2333] text-base">
                      Sabbath School Role & Enrollment
                    </span>
                    <span className="text-[10px] font-bold bg-[#C9973A]/10 text-[#C9973A] border border-[#C9973A]/20 px-2.5 py-0.5 rounded-full uppercase leading-none">
                      {userRole === "Teacher" ? "Teacher Mode" : "Student Mode"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Select whether you are a Teacher or Student and manage your Sabbath School class enrollment code to sync with live classroom feeds.
                  </p>
                </div>

                {/* Role selector buttons */}
                <div className="flex items-center bg-stone-100/90 p-1.5 rounded-xl border border-stone-200 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    id="profile-role-btn-student"
                    onClick={() => {
                      setUserRole("Student");
                      displayMessage("Sabbath School role set to Student. Section personalized.");
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userRole === "Student"
                        ? "bg-[#C9973A] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    id="profile-role-btn-teacher"
                    onClick={() => {
                      setUserRole("Teacher");
                      setIsTeacherGuideOpen(true);
                      displayMessage("Sabbath School role set to Teacher. Section personalized.");
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userRole === "Teacher"
                        ? "bg-[#C9973A] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Teacher</span>
                  </button>
                </div>
              </div>

              {/* Class Enrollment Form & Status */}
              <div className="pt-3 border-t border-stone-200/60 space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                      Class Room Name & Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={classNameInput}
                        onChange={(e) => setClassNameInput(e.target.value)}
                        placeholder="Classroom Name (e.g. Berean Adult Class)"
                        className="px-3 py-1.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg text-stone-800 w-full focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
                      />
                      <input
                        type="text"
                        value={classCodeInput}
                        onChange={(e) => setClassCodeInput(e.target.value)}
                        placeholder="Class Code"
                        className="px-3 py-1.5 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-lg text-[#C9973A] w-36 focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
                      />
                    </div>
                  </div>

                  <div className="self-end md:self-center">
                    <button
                      type="button"
                      onClick={handleEnrollmentToggle}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isEnrolledInClass
                          ? "bg-stone-200 hover:bg-stone-300 text-stone-800"
                          : "bg-[#C9973A] hover:bg-[#B3832F] text-white shadow-sm"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{isEnrolledInClass ? "Leave Class" : "Enroll / Join Class"}</span>
                    </button>
                  </div>
                </div>

                {/* Enrolled Roster Accordion Preview */}
                {isEnrolledInClass && (
                  <div className="bg-stone-50/80 rounded-xl p-3 border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#C9973A]" />
                        <span>Enrolled Roster ({classRosterList.length} members)</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono font-bold">
                        Live Analytics Synced
                      </span>
                    </div>

                    {classRosterList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 text-xs">
                        {classRosterList.map((student, idx) => (
                          <div
                            key={student.id || idx}
                            className="bg-white p-2 rounded-lg border border-stone-200/70 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-stone-800 flex items-center gap-1">
                                <span>{student.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                  student.role === "Teacher" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"
                                }`}>
                                  {student.role}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-500">{student.status} • {student.lastActive}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-600">{student.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-stone-500 italic bg-white rounded-lg border border-stone-200/60">
                        No students enrolled yet. Share your classroom code ({classCodeInput}) to invite students to join.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 2. MANUAL DATE SELECTOR FOR PAST/FUTURE LESSON DATA */}
            <section
              className={`p-5 rounded-2xl border transition-all duration-500 text-left space-y-4 ${
                sabbathMode
                  ? "bg-[#FAF7F0] border-[#E8E2D1]"
                  : "bg-white border-[#E8E4DA] shadow-sm"
              }`}
              id="profile-sabbath-date-selector"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#C9973A]" />
                  <span className="font-serif font-extrabold text-[#1C2333] text-base">
                    Specific Date Lesson Data Selection
                  </span>
                  <span className="text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20 px-2.5 py-0.5 rounded-full uppercase leading-none">
                    Adventech Scraper
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Select specific dates to manually pull past or future Sabbath School quarterly content directly from Adventech into your study workspace.
                </p>
              </div>

              {/* Date Input and Preset Shortcuts */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 flex items-center gap-2.5">
                    <label htmlFor="sabbath-date-picker-input" className="text-xs font-bold text-stone-700 shrink-0 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#C9973A]" />
                      <span>Select Date:</span>
                    </label>
                    <input
                      type="date"
                      value={sabbathSchoolStore.activeLessonDate || sabbathDate}
                      onChange={(e) => handleFetchDateLesson(e.target.value)}
                      disabled={isFetchingDateData}
                      className="px-3.5 py-2 text-xs font-bold font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#C9973A] w-full cursor-pointer disabled:opacity-50"
                      id="sabbath-date-picker-input"
                      title="Select date to dynamically fetch and display Sabbath School lesson content"
                    />
                  </div>
                  {isFetchingDateData && (
                    <span className="text-xs font-mono text-amber-700 flex items-center gap-1.5 shrink-0 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C9973A]" />
                      <span>Loading lesson...</span>
                    </span>
                  )}
                </div>

                {/* Date Presets: Reconfigured to Previous Quarter & Previous Week */}
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-stone-500 font-medium text-[10px] uppercase font-mono">Quick Date Shortcuts:</span>
                  <button
                    type="button"
                    id="btn-shortcut-previous-quarter"
                    onClick={() => {
                      const curDateStr = sabbathSchoolStore.activeLessonDate || sabbathDate || "2026-10-17";
                      let finalDate = "2026-07-25";
                      if (!curDateStr.startsWith("2026-10") && !curDateStr.startsWith("2026-11") && !curDateStr.startsWith("2026-12")) {
                        const cur = new Date(curDateStr);
                        cur.setDate(cur.getDate() - 84);
                        finalDate = cur.toISOString().split("T")[0];
                      }
                      handleFetchDateLesson(finalDate);
                    }}
                    disabled={isFetchingDateData}
                    title="Load Previous Quarter Lesson and Update Calendar"
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    Previous Quarter
                  </button>
                  <button
                    type="button"
                    id="btn-shortcut-previous-week"
                    onClick={() => {
                      const cur = new Date(sabbathSchoolStore.activeLessonDate || sabbathDate || "2026-10-17");
                      cur.setDate(cur.getDate() - 7);
                      handleFetchDateLesson(cur.toISOString().split("T")[0]);
                    }}
                    disabled={isFetchingDateData}
                    title="Load Previous Week's Lesson and Update Calendar"
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    Previous Week
                  </button>
                </div>

                {/* Currently Loaded Data Badge */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700 space-y-1">
                  <div className="font-bold text-stone-900 flex items-center justify-between">
                    <span>Active Lesson Content Loaded:</span>
                    <span className="text-[10px] font-mono font-bold text-teal-700">{sabbathSchoolStore.quarterlyTitle}</span>
                  </div>
                  <div className="text-stone-600 italic">“{sabbathSchoolStore.lessonTitle}”</div>
                  <div className="text-[10px] text-stone-500 truncate font-mono">Memory Text: {sabbathSchoolStore.memoryVerse}</div>
                </div>
              </div>
            </section>

            {/* 3. AUTOMATIC QUARTERLY UPDATE & REAL-TIME METRICS CARDS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" id="sabbath-toggles-grid">
              {/* AUTOMATIC QUARTERLY UPDATE CARD */}
              <section
                className={`p-5 rounded-2xl border transition-all duration-500 text-left flex flex-col justify-between ${
                  autoQuarterlyUpdate
                    ? "bg-[#F0F7F4] border-[#B2DFDB] shadow-md"
                    : sabbathMode
                    ? "bg-[#FAF7F0] border-[#E8E2D1]"
                    : "bg-white border-[#E8E4DA] shadow-sm"
                }`}
                id="profile-auto-quarterly-toggle-spot"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-extrabold text-[#1C2333] text-base">Automatic Quarterly Update</span>
                        {autoQuarterlyUpdate ? (
                          <span className="text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase leading-none flex items-center gap-1">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            Scraper ON
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-stone-150 text-stone-500 border border-stone-200 px-2 py-0.5 rounded-full uppercase leading-none">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        Auto-pulls the New Sabbath School Quarterly content for the week from Adventech every Sabbath at 11 a.m.
                      </p>
                    </div>

                    {/* Toggle switch */}
                    <div className="flex flex-col items-center gap-1 shrink-0 select-none">
                      <button
                        onClick={toggleAutoQuarterlyUpdate}
                        className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none cursor-pointer flex items-center ${
                          autoQuarterlyUpdate ? "bg-teal-600" : "bg-stone-300"
                        }`}
                        title="Automatic Quarterly Update Scraper ON or OFF"
                        id="switch-auto-quarterly"
                        aria-label="Automatic Quarterly Update toggle switch"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                            autoQuarterlyUpdate ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[8.5px] font-mono font-black text-stone-500 uppercase">
                        {autoQuarterlyUpdate ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      id="btn-run-sabbath-sync"
                      onClick={async () => {
                        displayMessage("One-Click Override: Syncing Adventech & ABSG for upcoming week (Oct 17–23)...");
                        try {
                          const upcomingSabbathDate = "2026-10-17";
                          await sabbathSchoolStore.fetchWeeklySyncData(true);
                          sabbathSchoolStore.setActiveLessonDate(upcomingSabbathDate);
                          setSabbathDate(upcomingSabbathDate);
                          try {
                            localStorage.setItem("stba_sabbath_selected_date", upcomingSabbathDate);
                          } catch (e) {}
                          displayMessage("One-Click Override complete! Upcoming week (Oct 17–23) synced. Calendar reset to Sabbath.");
                        } catch (err: any) {
                          displayMessage(`Manual sync override failed: ${err.message || 'Error'}`);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      title="Fetches and displays the most recent week's lesson content, serving as a reliable manual override for the automatic weekly update"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Run Sabbath School 11 AM Sync Now</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2.5 mt-3 border-t border-stone-100/80 flex items-center justify-between text-[9.5px] font-mono text-stone-400">
                  <span>Target: sabbath-school.adventech.io</span>
                  <span className={autoQuarterlyUpdate ? "text-teal-700 font-bold" : ""}>
                    {autoQuarterlyUpdate ? "Scheduled: Every Sabbath at 11:00 AM" : "Scraper Disabled"}
                  </span>
                </div>
              </section>

              {/* SABBATH QUIETUDE & REST CARD */}
              <section
                className={`p-5 rounded-2xl border transition-all duration-500 text-left flex flex-col justify-between ${
                  manualOverride
                    ? "bg-[#FFF9EA] border-[#F0D5A6] shadow-md"
                    : sabbathMode
                    ? "bg-[#FAF7F0] border-[#E8E2D1]"
                    : "bg-white border-[#E8E4DA] shadow-sm"
                }`}
                id="profile-sabbath-toggle-spot"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-extrabold text-[#1C2333] text-base">Sabbath Quietude & Rest</span>
                        {sabbathMode ? (
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase leading-none">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-stone-150 text-stone-500 border border-stone-200 px-2 py-0.5 rounded-full uppercase leading-none">
                            Sunset
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Silences metrics, converts theme to warm cream, and highlights Sabbath School study every Friday.
                      </p>
                    </div>

                    {/* Toggle switch */}
                    <div className="flex flex-col items-center gap-1 shrink-0 select-none">
                      <button
                        onClick={toggleManualOverride}
                        className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none cursor-pointer flex items-center ${
                          manualOverride ? "bg-[#C9973A]" : "bg-stone-300"
                        }`}
                        title="Manual SabbathRest ON or OFF"
                        id="switch-manual-sabbath"
                        aria-label="Sabbath Mode manual controller switch"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                            manualOverride ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[8.5px] font-mono font-black text-stone-500 uppercase">
                        {manualOverride ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 mt-3 border-t border-stone-100/80 flex items-center justify-between text-[9.5px] font-mono text-stone-400">
                  <span>Friday 6pm–Saturday 6pm</span>
                  <span className={manualOverride ? "text-[#C9973A] font-bold" : ""}>
                    {manualOverride ? "Manual Active" : "Auto Armed"}
                  </span>
                </div>
              </section>
            </div>
          </section>

          {/* STUDY PREFERENCES LIST & FORM VALUES */}
          <section className="space-y-3" id="preferences-menu">
            <span className="text-xs uppercase font-mono tracking-widest text-[#C9973A] font-bold block">
              Bible Study Preferences
            </span>

            <div
              className={`rounded-2xl border divide-y overflow-hidden ${
                sabbathMode
                  ? "bg-[#FAF7F0] border-[#E8E2D1] divide-[#E8E2D1]/40"
                  : "bg-white border-[#E8E4DA] divide-stone-100 shadow-sm"
              }`}
              id="preferences-menu-body"
            >
              {/* Daily memory verses (1-7) preference */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Daily Verse Recall Goal</h4>
                  <p className="text-xs text-stone-500">Configure active learning target capacity (1–7 verses rotated daily).</p>
                </div>

                <select
                  value={dailyVersesCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDailyVersesCount(val);
                    localStorage.setItem("stba_daily_verse_limit", val.toString());
                    localStorage.setItem("stba_settings_customized", "true");
                    if (user && !user.isGuest) {
                      saveProfileToSupabase(user);
                    }
                    displayMessage(`Daily target adjusted to ${val} verses.`);
                  }}
                  className="px-3 py-1.5 text-xs font-bold font-sans rounded-xl border border-stone-200 outline-none bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C9973A]/40 transition-all"
                  aria-label="Select Daily Verses Count"
                  id="select-daily-verses-count"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Verse' : 'Verses'} per day</option>
                  ))}
                </select>
              </div>

              {/* Recall Queue frequency (1-3-5-7) days preference */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Spaced Recall Repetition Decay</h4>
                  <p className="text-xs text-stone-500">Set active intervals (1, 3, or 5 days) to reactivate memorized verses in the Recall Queue.</p>
                </div>

                <select
                  value={queueFrequency}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQueueFrequency(val);
                    localStorage.setItem("stba_recall_queue_frequency", val.toString());
                    localStorage.setItem("stba_settings_customized", "true");
                    if (user && !user.isGuest) {
                      saveProfileToSupabase(user);
                    }
                    displayMessage(`Recall queue offset set to ${val}-day decay interval.`);
                  }}
                  className="px-3 py-1.5 text-xs font-bold font-sans rounded-xl border border-stone-200 outline-none bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C9973A]/40 transition-all"
                  aria-label="Select Spaced Repetition Queue Frequency"
                  id="select-queue-frequency"
                >
                  {[1, 2, 3, 5, 7].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'day' : 'days'} decay spacing</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Session Recall Pop-Ups Toggle & Immediate Test Button */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#1C2333]">Dynamic Study Session Recall Pop-Ups</h4>
                    <span className="text-[10px] font-mono font-extrabold uppercase bg-amber-100 text-[#8F6516] px-1.5 py-0.5 rounded">
                      Live Tutor
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Automatically prompt active recall checks across all study modes (Tracks, Doctrine, Sabbath School, Vault).
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      triggerManualRecallPopup();
                      displayMessage("Simulating dynamic Recall Pop-Up from current queue...");
                    }}
                    className="px-2.5 py-1.5 text-xs font-mono font-bold text-[#C9973A] bg-amber-50 hover:bg-amber-100/80 border border-[#C9973A]/40 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                    id="test-recall-popup-btn"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Pop-Up Now</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = !recallPopupsEnabled;
                      setRecallPopupsEnabled(next);
                      localStorage.setItem("stba_recall_popups_enabled", next ? "true" : "false");
                      localStorage.setItem("stba_settings_customized", "true");
                      displayMessage(next ? "Dynamic recall pop-ups enabled." : "Dynamic recall pop-ups disabled.");
                    }}
                    className={`px-3 py-1.5 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                      recallPopupsEnabled
                        ? "bg-[#1C2333] text-white border-[#1C2333]"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                    id="toggle-recall-popups-btn"
                  >
                    {recallPopupsEnabled ? "Active" : "Paused"}
                  </button>
                </div>
              </div>

              {/* 1. Notifications toggle preference */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Morning Study Reminders</h4>
                  <p className="text-xs text-stone-500">Get gentle alarms on your browser setup to build a consistent streak.</p>
                </div>

                <button
                  onClick={async () => {
                    const nextVal = !notificationsEnabled;
                    setNotificationsEnabled(nextVal);
                    localStorage.setItem("stba_notifications_enabled", nextVal ? "true" : "false");
                    localStorage.setItem("stba_settings_customized", "true");
                    if (user && !user.isGuest) {
                      saveProfileToSupabase(user);
                    }

                    if (nextVal) {
                      if (typeof window !== "undefined" && "Notification" in window) {
                        if (Notification.permission === "default") {
                          const permission = await Notification.requestPermission();
                          if (permission === "granted") {
                            displayMessage("Notifications permitted! Daily reminder is active.");
                            return;
                          } else {
                            displayMessage("Notification permission denied by browser.");
                            return;
                          }
                        } else if (Notification.permission === "denied") {
                          displayMessage("Please enable notifications in your browser settings to receive reminders.");
                          return;
                        }
                      }
                    }
                    displayMessage(`Study reminders successfully ${nextVal ? "Armed" : "Disarmed"}`);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none flex items-center cursor-pointer ${
                    notificationsEnabled ? "bg-[#2A9D8F]" : "bg-stone-200"
                  }`}
                  aria-label="Toggle notifications reminders enabled status"
                  id="notifications-alarm-switch"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 1b. Key Section Live Updates (28 Fundamentals, Sabbath School, STBA tracks) */}
              <div className="p-4 bg-stone-50/70 border-t border-b border-stone-150 space-y-3">
                <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#1C2333]">Key Section Live Content Alerts</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-full">
                        28 Fundamentals • Sabbath School • STBA
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Automatically receive an immediate notification with bell chime whenever updates to the 28 Fundamentals, Sabbath School lessons, or STBA tracks go live.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const nextVal = !sectionAlertsEnabled;
                      setSectionAlertsEnabled(nextVal);
                      localStorage.setItem("stba_section_updates_notifications", nextVal ? "true" : "false");
                      displayMessage(`Key Section Live Alerts ${nextVal ? "Activated" : "Muted"}`);
                    }}
                    className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none flex items-center cursor-pointer ${
                      sectionAlertsEnabled ? "bg-[#2A9D8F]" : "bg-stone-200"
                    }`}
                    aria-label="Toggle key section live updates notifications"
                    id="section-updates-alerts-switch"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        sectionAlertsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Instant Verification Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                    Test Live Updates:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      simulateLiveSectionUpdate("28-fundamentals");
                      displayMessage("28 Fundamentals live update notification broadcasted!");
                    }}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#1C2333] bg-white border border-stone-200 hover:border-[#C9973A] rounded-lg shadow-xs hover:bg-[#FDFAF5] cursor-pointer transition-all"
                  >
                    📜 28 Fundamentals Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      simulateLiveSectionUpdate("sabbath-school");
                      displayMessage("Sabbath School lesson live notification broadcasted!");
                    }}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#1C2333] bg-white border border-stone-200 hover:border-[#C9973A] rounded-lg shadow-xs hover:bg-[#FDFAF5] cursor-pointer transition-all"
                  >
                    📅 Sabbath School Lesson Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const count = checkForLiveContentUpdates();
                      displayMessage(count > 0 ? `Detected ${count} new live section updates!` : "All key sections are up to date.");
                    }}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg shadow-xs cursor-pointer transition-all"
                  >
                    🔍 Check Live Releases
                  </button>
                </div>
              </div>

              {/* 2. Select Bible preferred Translation */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Preferred Bible Translation</h4>
                  <p className="text-xs text-stone-500">Your verbatim scripture recall tests will validate against this text source.</p>
                </div>

                <select
                  value={bibleVersion}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setBibleVersion(val);
                    localStorage.setItem("stba_bible_version", val);
                    if (user && !user.isGuest) {
                      saveProfileToSupabase(user);
                    }
                    displayMessage(`Preferred translation set to ${val}`);
                  }}
                  className="px-3 py-1.5 text-xs font-bold font-sans rounded-xl border border-stone-200 outline-none bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C9973A]/40"
                  aria-label="Select preferred Bible translation select box"
                  id="select-bible-version-dropdown"
                >
                  <option value="KJV">King James Version (KJV)</option>
                  <option value="NKJV">New King James Version (NKJV)</option>
                  <option value="NIV">New International Version (NIV)</option>
                  <option value="ESV">English Standard Version (ESV)</option>
                </select>
              </div>

              {/* Select AI / Browser Voice Settings */}
              <div className="p-4 space-y-4 border-b border-stone-150">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1C2333]">Elder Stephen Speech Engine & Voice Selection</h4>
                  <p className="text-xs text-stone-500 font-sans">
                    Choose between the original Elder Stephen AI Voice (Gemini AI) or your browser's built-in speech synthesis (Edge Read Aloud API).
                  </p>
                </div>

                {/* 1. Speech Engine Selection Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTtsEngine("original");
                      localStorage.setItem("stba_tts_engine", "original");
                      window.dispatchEvent(new Event("stba_voice_changed"));
                      displayMessage("Speech Engine set to Original Elder Stephen AI Voice");
                    }}
                    className={`flex-1 p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-between cursor-pointer transition ${
                      ttsEngine === "original"
                        ? "bg-[#C9973A]/10 border-[#C9973A] text-[#8C641D] shadow-2xs"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-stone-900">Original Elder Stephen Voice</span>
                      <span className="text-[10px] text-stone-500 font-normal">Gemini Neural Audio Engine</span>
                    </div>
                    {ttsEngine === "original" && <Check className="w-4 h-4 text-[#C9973A] shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTtsEngine("browser");
                      localStorage.setItem("stba_tts_engine", "browser");
                      window.dispatchEvent(new Event("stba_voice_changed"));
                      displayMessage("Speech Engine set to Browser Synthesized Voice (Edge Read Aloud)");
                    }}
                    className={`flex-1 p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-between cursor-pointer transition ${
                      ttsEngine === "browser"
                        ? "bg-teal-50 border-teal-600 text-teal-900 shadow-2xs"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-teal-950">Browser Synthesized Voice</span>
                      <span className="text-[10px] text-teal-700 font-normal">Edge / Web Speech API</span>
                    </div>
                    {ttsEngine === "browser" && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                </div>

                {/* 2. Dynamic Settings Based on Selected Engine */}
                {ttsEngine === "browser" ? (
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 space-y-2">
                    <label className="text-xs font-bold text-teal-900 block">Select Premium Edge Natural Voice (Web Speech API):</label>
                    {(() => {
                      const filteredEdgeVoices = filterEdgeNaturalVoices(browserVoices);
                      const defaultAndrew = filteredEdgeVoices.find(v => v.name.toLowerCase().includes("andrew")) || filteredEdgeVoices[0];
                      const activeVoiceValue = browserVoiceUri || (defaultAndrew ? defaultAndrew.voiceURI : "");

                      return (
                        <select
                          value={activeVoiceValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBrowserVoiceUri(val);
                            localStorage.setItem("stba_browser_voice_uri", val);
                            window.dispatchEvent(new Event("stba_voice_changed"));
                            const voiceObj = browserVoices.find(v => v.voiceURI === val || v.name === val);
                            displayMessage(`Browser voice updated to ${voiceObj?.name || val}`);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold font-sans rounded-xl border border-teal-200 outline-none bg-white text-stone-800 focus:ring-2 focus:ring-teal-500/30"
                          aria-label="Select preferred browser speech synthesis voice"
                          id="select-browser-voice"
                        >
                          {filteredEdgeVoices.length === 0 ? (
                            <option value="">⭐ Microsoft Andrew Online Natural (Default)</option>
                          ) : (
                            filteredEdgeVoices.map((v, idx) => (
                              <option key={v.voiceURI || idx} value={v.voiceURI}>
                                ⭐ {v.name} ({v.lang})
                              </option>
                            ))
                          )}
                        </select>
                      );
                    })()}
                    <p className="text-[10.5px] text-teal-800 font-medium">
                      Note: Default Web Speech API voice set to <strong>Microsoft Andrew Online Natural</strong>. Only high-fidelity Edge Natural voices are listed.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-2">
                    <label className="text-xs font-bold text-amber-950 block">AI Voice Character Model:</label>
                    <select
                      value={aiVoice}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setAiVoice(val);
                        localStorage.setItem("stba_ai_voice", val);
                        window.dispatchEvent(new Event("stba_voice_changed"));
                        if (user && !user.isGuest) {
                          saveProfileToSupabase(user);
                        }
                        displayMessage(`AI Narration Voice updated to ${val}`);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold font-sans rounded-xl border border-amber-200 outline-none bg-white text-stone-800 focus:ring-2 focus:ring-amber-500/30"
                      aria-label="Select preferred Gemini AI voice character"
                      id="select-ai-voice"
                    >
                      <option value="Puck">Elder Stephen's Natural Voice (Default - Puck)</option>
                      <option value="Kore">Theological Scholar (Kore)</option>
                      <option value="Aoede">Creative Lyricist (Aoede)</option>
                      <option value="Zephyr">Meditative Devotional (Zephyr)</option>
                      <option value="Fenrir">Pulpit Preacher (Fenrir)</option>
                    </select>
                  </div>
                )}

                {/* 3. Test Playback Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-500">Test current voice configuration:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if ("speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                        const sampleText = "Greetings. I am Elder Stephen. Welcome to your Scripture study session.";
                        const utt = new SpeechSynthesisUtterance(sampleText);
                        utt.rate = 1.0;
                        const v = getElderStephenVoice();
                        if (v) utt.voice = v;
                        window.speechSynthesis.speak(utt);
                        displayMessage(`Playing voice sample using ${v ? v.name : "default voice"}`);
                      } else {
                        displayMessage("Speech synthesis is not supported in this browser.");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold font-sans bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-250 cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Test Voice Sample</span>
                  </button>
                </div>
              </div>

              {/* 3. Ellen White annotations toggle */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Spirit of Prophecy Annotations</h4>
                  <p className="text-xs text-stone-500">Inject curated Ellen White quotes dynamically at the end of study reviews.</p>
                </div>

                <button
                  onClick={() => {
                    const nextEgw = !egwIntegration;
                    setEgwIntegration(nextEgw);
                    localStorage.setItem("stba_egw_integration", nextEgw ? "true" : "false");
                    if (user && !user.isGuest) {
                      saveProfileToSupabase(user);
                    }
                    displayMessage(`EGW insights ${nextEgw ? "loaded into workspace" : "retracted"}`);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-all outline-none flex items-center cursor-pointer ${
                    egwIntegration ? "bg-[#2A9D8F]" : "bg-stone-200"
                  }`}
                  aria-label="Toggle Ellen White comments inclusion in studies"
                  id="egw-annotations-switch"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      egwIntegration ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Reminder alarm exact pick time */}
              <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Reminder Alarm Target</h4>
                  <p className="text-xs text-stone-500">Silence interruptions and establish a structured devotional hour.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => {
                      const nextTime = e.target.value;
                      setReminderTime(nextTime);
                      localStorage.setItem("stba_reminder_time", nextTime);
                      if (user && !user.isGuest) {
                        saveProfileToSupabase(user);
                      }
                      displayMessage(`Morning review set for ${nextTime} successfully.`);
                    }}
                    className="px-3 py-1.5 text-xs font-bold font-mono rounded-xl border border-stone-200 outline-none bg-stone-50 text-stone-800 focus:ring-1 focus:ring-[#C9973A]/40 transition-[box-shadow]"
                    aria-label="Select Morning reminder trigger time picker input"
                    id="reminder-time"
                  />
                  
                  <button
                    onClick={() => {
                      // Trigger rich in-app notification chime sound and subtle bell animation
                      addNotification({
                        title: "STBA Daily Study Reminder",
                        description: "Daily reminders are active! Take holy quiet for your Scripture retention goal.",
                        link: "/recall",
                        linkText: "Open Active Recall",
                        category: "recall"
                      });

                      if (typeof window !== "undefined" && "Notification" in window) {
                        if (Notification.permission === "granted") {
                          try {
                            new Notification("STBA Bible Study System", {
                              body: "Daily reminders are functioning perfectly! Blessed study hour.",
                            });
                            displayMessage("Test notification chime & alert sent successfully!");
                          } catch (e) {
                            displayMessage("Desktop alert blocked, but in-app notification chime succeeded!");
                          }
                        } else {
                          Notification.requestPermission().then((perm) => {
                            if (perm === "granted") {
                              try {
                                new Notification("STBA Bible Study System", {
                                  body: "Notification permission granted! Reminders active.",
                                });
                                displayMessage("Notification permission granted! Test chime sent.");
                              } catch (e) {
                                displayMessage("Permission enabled, in-app chime triggered.");
                              }
                            } else {
                              displayMessage("In-app notification alert played. Desktop alerts denied.");
                            }
                          });
                        }
                      } else {
                        displayMessage("In-app notification chime played successfully!");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold font-mono rounded-xl border border-amber-500/20 text-[#C18C2A] bg-amber-500/5 hover:bg-amber-500/10 active:scale-95 transition-all cursor-pointer"
                    aria-label="Send test reminder notification"
                    id="test-reminder-button"
                  >
                    ⚡ Test Reminder
                  </button>
                </div>
              </div>

              {/* 5. Account change password trigger */}
              <button
                onClick={() => {
                  if (!user || user.isGuest) {
                    displayMessage("Only signed-in users can update their security password. Please register or log in.");
                  } else {
                    setPasswordModalOpen(true);
                  }
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 text-left transition-all outline-none border-none"
                aria-label="Trigger user password update modal window"
                id="update-pass-dialog-action"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-[#1C2333]">Account Security & Credentials</h4>
                  <p className="text-xs text-stone-500">Update system password and view current sessions.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </button>
            </div>
          </section>

          {/* STYLES FOR GLOWING GREEN DESKTOP RETURN CUE */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes emerald-return-glow {
                0%, 100% {
                  box-shadow: 0 0 16px 4px rgba(16, 185, 129, 0.65), 0 0 35px 8px rgba(16, 185, 129, 0.35);
                  border-color: #34D399;
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 28px 10px rgba(16, 185, 129, 0.95), 0 0 55px 18px rgba(16, 185, 129, 0.6);
                  border-color: #6EE7B7;
                  transform: scale(1.025);
                }
              }
              .glowing-green-desktop-btn {
                animation: emerald-return-glow 2s infinite ease-in-out !important;
                background: linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%) !important;
                color: #FFFFFF !important;
                border: 2px solid #34D399 !important;
              }
            `
          }} />

          {/* SIGN OUT & BACK TO WORKSPACE CONTROLS */}
          <section className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100" id="signout-control-flow">
            <button
              onClick={() => {
                if (onSignOut) onSignOut();
              }}
              className="flex-1 py-3.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-xs rounded-xl shadow-inner transition-all flex items-center justify-center space-x-2 uppercase tracking-widest cursor-pointer"
              id="sign-out-profile-btn"
              aria-label="Disengage and Sign Out"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign out of session</span>
            </button>

            <button
              onClick={() => {
                setIsReturnToDesktopGlowing(false);
                sessionStorage.setItem("stba_returned_after_profile_tour", "true");
                localStorage.setItem("stba_returned_from_profile_tour", "true");
                localStorage.setItem("stba_onboarding_explain_first", "true");
                window.dispatchEvent(new CustomEvent("stba-returned-from-profile-tour"));
                window.dispatchEvent(new CustomEvent("stba-first-assignment-trigger"));
                if (onNavigate) onNavigate("home");
              }}
              className={`flex-1 py-3.5 px-6 font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 flex items-center justify-center space-x-2.5 uppercase tracking-widest cursor-pointer ${
                isReturnToDesktopGlowing
                  ? "glowing-green-desktop-btn ring-4 ring-emerald-400/50"
                  : "bg-[#1C2333] hover:bg-[#2A344A] text-white shadow-md border border-stone-700/30"
              }`}
              id="return-to-desktop-btn"
              data-testid="return-to-desktop-btn"
              aria-label="Return to Desktop"
            >
              <BookOpen className={`w-4 h-4 ${isReturnToDesktopGlowing ? "text-emerald-200" : "text-gold"}`} style={{ display: "inline" }} />
              <span>Return to Desktop</span>
              {isReturnToDesktopGlowing && (
                <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-emerald-950/80 text-emerald-300 rounded-md font-mono border border-emerald-400/50 font-bold uppercase tracking-wider animate-bounce">
                  ✦ Click to Return
                </span>
              )}
            </button>
          </section>

        </div>

      </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: SCRIPTURAL MASTERY PATH PROGRESSION MAP OVERLAY */}
      <AnimatePresence>
        {masteryMapOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="mastery-map-dialog">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMasteryMapOpen(false)}
              className="fixed inset-0 bg-[#1C2333]"
              id="mastery-map-light-veil"
            />
            
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-[#FAF9F5] rounded-3xl w-full max-w-4xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl border"
                id="mastery-map-box"
              >
                <button
                  onClick={() => setMasteryMapOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-full border bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition shadow-sm z-20"
                  aria-label="Dismiss Mastery Progression popup"
                  id="dismiss-mastery-dialog"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="max-w-3xl mx-auto">
                  <MasteryPath onClose={() => setMasteryMapOpen(false)} embedded={true} />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CHANGE PASSWORD OVERLAY */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="password-dialog">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setPasswordModalOpen(false)}
              className="fixed inset-0 bg-[#1C2333]"
            />

            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-stone-100"
              >
                <h3 className="font-serif font-extrabold text-[#111] text-lg text-left mb-2">Change Password</h3>
                <p className="text-xs text-stone-500 text-left mb-4 leading-relaxed">
                  Provide your current secure passcode, followed by your new desired credential key.
                </p>

                <div className="space-y-3.5 text-left">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 block mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-stone-200 px-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9973A]/40"
                      aria-label="Enter current password input text box"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 block mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-stone-200 px-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C9973A]/40"
                      aria-label="Enter new desired password input text box"
                    />
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => {
                      setPasswordModalOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!currentPassword || !newPassword) {
                        displayMessage("Please complete all password input blocks.");
                        return;
                      }
                      if (newPassword.length < 6) {
                        displayMessage("Password must be at least 6 characters.");
                        return;
                      }
                      if (user) {
                        setUser({
                          ...user,
                          password: newPassword
                        });
                        displayMessage("Password updated and saved successfully!");
                      } else {
                        displayMessage("Only signed-in users can update their security password.");
                      }
                      setPasswordModalOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                    }}
                    className="flex-1 py-2.5 bg-[#1C2333] hover:bg-[#2A344A] text-white font-bold text-xs rounded-xl uppercase tracking-widest cursor-pointer"
                  >
                    Update Key
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: UPDATE PROFILE PICTURE, USER NAME & EMAIL OVERLAY */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="edit-profile-dialog">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleSaveProfile} // Saves on exit when backdrop is clicked!
              className="fixed inset-0 bg-[#1C2333]"
            />

            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="relative bg-[#FDFAF5] border border-[#E8E4DA] rounded-2xl w-full max-w-md p-6 shadow-2xl text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif font-extrabold text-[#1C2333] text-lg">Update Profile Settings</h3>
                  <button
                    onClick={handleSaveProfile} // Saves on exit
                    className="text-stone-400 hover:text-stone-700 focus:outline-none transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  
                  {/* Avatar Upload Hub (Drag & Drop + Input Select) */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-stone-400 block mb-2 font-sans">
                      Profile Picture
                    </span>
                    
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="w-16 h-16 rounded-full bg-[#1C2333] text-gold border-2 border-[#C9973A] flex items-center justify-center font-serif text-xl font-extrabold overflow-hidden shrink-0 shadow-inner">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt="Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{tempUserName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0,2) || "NB"}</span>
                        )}
                      </div>

                      {/* Drag & drop upload surface */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                          isDragOver
                            ? "border-[#C9973A] bg-[#C9973A]/10 text-[#C9973A]"
                            : "border-stone-200 bg-white hover:border-[#C9973A] text-stone-500 hover:text-[#C9973A]"
                        }`}
                      >
                        <p className="text-[10.5px] font-sans font-medium">
                          {isDragOver ? "Drop image now!" : "Drag image here or click to upload"}
                        </p>
                        <p className="text-[8.5px] font-mono text-stone-400 mt-1">Supports PNG, JPG (Max 3MB)</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username input */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-stone-400 block mb-1 font-sans">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={tempUserName}
                      onChange={(e) => setTempUserName(e.target.value)}
                      placeholder="e.g. Stephen Haskell"
                      className="w-full font-serif font-bold text-sm text-[#1C2333] bg-white border border-[#E8E4DA] focus:border-[#C9973A] px-3.5 py-2.5 rounded-lg outline-none focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  {/* Email input */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-stone-400 block mb-1 font-sans">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={tempUserEmail}
                      onChange={(e) => setTempUserEmail(e.target.value)}
                      placeholder="e.g. student@stba.com"
                      className="w-full font-serif font-semibold text-stone-700 bg-white border border-[#E8E4DA] focus:border-[#C9973A] px-3.5 py-2.5 rounded-lg outline-none focus:outline-none transition-colors text-xs"
                      required
                    />
                  </div>

                  <p className="text-[9.5px] text-stone-400 italic leading-snug">
                    *Changing your email address will require re-verifying your account. Access to the Memory Vault and aggregate charts will be locked until the verification code is provided.
                  </p>

                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 flex gap-2.5">
                  <button
                    onClick={() => {
                      setProfileModalOpen(false);
                      displayMessage("Edit session cancelled. No changes were committed.");
                    }}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-sans font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile} // Saves on exit
                    className="flex-1 py-3 bg-[#1C2333] hover:bg-[#2A344A] text-white font-serif font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Save & Exit
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: NEW EMAIL VERIFICATION ADVICE NOTIFICATION POPUP */}
      <AnimatePresence>
        {showEmailVerificationAlert && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="verification-warning-dialog">
            {/* Background shade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailVerificationAlert(false)}
              className="fixed inset-0 bg-[#1C2333]"
            />

            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-[#FDFAF5] border border-stone-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-200 text-[#C9973A] flex items-center justify-center font-bold text-xl mb-3.5">
                  ✉
                </div>
                
                <h3 className="font-serif font-extrabold text-[#1C2333] text-lg mb-1.5 leading-tight">Verification Required!</h3>
                
                <p className="text-stone-600 font-sans text-xs leading-relaxed mb-4 text-center">
                  We have dispatched a simulated academic authentication link to <br/>
                  <strong className="text-[#1C2333] font-bold break-all">{tempUserEmail}</strong>.
                  <br/><br/>
                  Please inspect your inbox immediately and input the code in the top banner header to re-verify your scholar dashboard metrics tracking.
                </p>

                <button
                  onClick={() => setShowEmailVerificationAlert(false)}
                  className="w-full py-3 bg-[#1C2333] hover:bg-[#C9973A] text-white font-serif font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Understood, I will check (Close)
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS ACHIEVEMENT SPECIAL CORONATION BADGE OVERLAY DETAIL MODAL */}
      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 z-[100] overflow-y-auto" id="profile-milestone-popup-veil">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
              className="fixed inset-0 bg-[#1C2333]"
              id="milestone-lightbox-bg-darker"
            />
            
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 320 }}
                className="relative bg-[#FDFAF5] rounded-3xl w-full max-w-sm p-6 sm:p-7 overflow-hidden shadow-2xl border border-amber-200"
                id="milestone-glowing-popup-window"
              >
                {/* Visual glow styling for premium aesthetics */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="absolute top-4 right-4 p-2 rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 transition cursor-pointer z-10"
                  aria-label="Dismiss milestone popup window details"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center space-y-4 pt-2.5">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner relative transition-transform">
                    {(() => {
                      const BIcon = selectedMilestone.icon;
                      return <BIcon className={`w-8 h-8 ${selectedMilestone.earned ? selectedMilestone.iconColor : "text-stone-300"}`} />;
                    })()}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/15 text-[#A67D2E] px-2.5 py-1 rounded-full">
                      {selectedMilestone.earned ? "🏆 Achievement Cleared" : "🔒 Achievement Locked"}
                    </span>
                    <h3 className="font-serif font-extrabold text-[#111] text-xl pt-1">
                      {selectedMilestone.name}
                    </h3>
                  </div>

                  {/* Objective Requirements Container */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200/60 text-left space-y-1.5 shadow-3xs">
                    <p className="text-[9px] text-[#A67D2E] font-mono tracking-widest uppercase font-extrabold leading-tight">
                      Milestone Requirement
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">
                      {selectedMilestone.requirement}
                    </p>
                    
                    {/* Linear dynamic progress meter bar */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px]">
                      <div className="flex justify-between items-center text-stone-500">
                        <span>Milestone objective progress:</span>
                        <span className="font-mono font-semibold text-stone-850">
                          {selectedMilestone.current} / {selectedMilestone.target}
                        </span>
                      </div>
                      <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${selectedMilestone.earned ? "bg-[#C9973A]" : "bg-stone-300"}`}
                          style={{ width: `${Math.min(100, (selectedMilestone.current / selectedMilestone.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sacred scripture verse text inspiration banner */}
                  <div className="bg-[#FAF7F0] border border-[#E8E2D1] p-4 rounded-xl text-left space-y-1.5 font-sans relative">
                    <p className="text-[9px] text-[#A67D2E] font-mono tracking-widest font-extrabold pb-0.5 uppercase">
                      INSPIRATIONAL REFLECTION
                    </p>
                    <p className="text-xs italic text-stone-750 leading-relaxed font-serif">
                      {selectedMilestone.verse}
                    </p>
                    {selectedMilestone.earned && (
                      <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 pt-1.5 border-t border-stone-200/50">
                        🎁 <span className="font-semibold text-stone-700">Unlocked Token:</span> {selectedMilestone.reward}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedMilestone(null)}
                      className="w-full py-2.5 bg-gradient-to-r from-[#C9973A] to-[#B0822F] text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-md transition-all shadow-sm cursor-pointer"
                    >
                      {selectedMilestone.earned ? "Amen, Thank God!" : "Strive with Sincerity"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher Role Selection Guide Popup Modal */}
      <TeacherRoleGuideModal
        isOpen={isTeacherGuideOpen}
        onClose={() => setIsTeacherGuideOpen(false)}
        classNameInput={classNameInput}
        classCodeInput={classCodeInput}
        setClassNameInput={setClassNameInput}
        setClassCodeInput={setClassCodeInput}
        readingTheme="light"
      />
    </div>
  );
};

export default ProfileSettings;
