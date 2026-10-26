import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getElderStephenVoice } from "./stba/RightPaneTools";

interface TourStep {
  title: string;
  body: string;
}

export const TourOverlay: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [active, setActive] = useState(false);
  const [tourType, setTourType] = useState<"dashboard" | "profile">("dashboard");
  const [stepIndex, setStepIndex] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 100, left: 100 });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [toast, setToast] = useState<string | null>(null);

  const currentTargetRef = useRef<HTMLElement | null>(null);
  const originalStylesRef = useRef<{ position: string; zIndex: string } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Dynamic values computation for personalization
  const userName = user?.name || "Berean";
  const userTier = localStorage.getItem("stba_user_tier") || "Beginner";
  
  // Custom greeting based on local time hours
  const hr = new Date().getHours();
  let greetWord = "Good day";
  if (hr >= 5 && hr < 12) {
    greetWord = "Good morning";
  } else if (hr >= 12 && hr < 17) {
    greetWord = "Good afternoon";
  } else if (hr >= 17 && hr < 22) {
    greetWord = "Good evening";
  } else {
    greetWord = "Good night";
  }
  const timeContextualGreeting = `${greetWord}, ${userName}`;

  // ==========================================
  // DASHBOARD TOUR STEPS (11 Steps)
  // ==========================================
  const dynamicDashboardSteps: TourStep[] = [
    {
      title: "Sola Scriptura Sanctuary",
      body: `${timeContextualGreeting}! Welcome to your personal study command center. Your name, the current date, and active study tracking are displayed right at the top. Everything here is designed to anchor your scriptural exegesis.`
    },
    {
      title: "Alerts & Notifications Hub",
      body: "This is your check-list and verification hub. Elder Stephen alerts you of study milestones and syncs your learning progress across devices automatically."
    },
    {
      title: "Sabbath Rest Safeguard",
      body: "This switch automates the Seventh-day Sabbath study pause. All active spaced retrieval timers and metrics will suspend from Friday sunset to Saturday sunset, allowing you to rest in the Lord."
    },
    {
      title: "SDA Mentor Advisory Panel",
      body: "Meet Elder Stephen, your exegetical bible study mentor. This panel shows the next AI-suggested study to progress in your understanding."
    },
    {
      title: "Suggested Study Step",
      body: "I'll launch your learning directly into explain mode, where we will examine this pivotal text to understand what the intended meaning was, and how we can apply it to our lives."
    },
    {
      title: "Active Curricular Selectors",
      body: "Select mode to transition smoothly between the six modes: Explain Mode, AI-guided Lexical exegesis, Teach It mode, AI Guides you to teach what you've learned. STBA Mode, AI guides you through a 7-step exegesis process, Sabbath School Mode, study the quarterly as a class, and Recall Mode, AI-guided Scripture memorization."
    },
    {
      title: "Ask The Scholar",
      body: "Elder Steven guides you by explaining the Scriptures for your cognitive study focus: ask your contextual, historical, and theological questions and receive SDA focus answers, or type any bible text to get precise biblical clarification."
    },
    {
      title: "Recommended quick scholar queries",
      body: "Tap a preset study question below to jump start your research in the context of the verse that you're studying, receive an SDA biblical understanding. In the historical context, Greek and Hebrew words in the text, how does it connect to the heavenly sanctuary doctrine? Learn how this verse affects the great controversy and learn how to teach it to others."
    },
    {
      title: "Scholar Chat & Dialogue Center",
      body: "Chat with Elder Steven about the context of the scriptures you're studying. And receive in-depth Seventh-day Adventist historical and theological summaries."
    },
    {
      title: "Milestones Vault",
      body: "Celebrate milestones and earn verified badges as you memory-vault scriptures and rise through academic study ranks from Beginner to licensed Lay Teacher."
    },
    {
      title: "Student Profile Settings",
      body: "Configure study preference options, adjust Ellen White exegesis commentary inclusion parameters, manage user credentials, or trigger manual Sabbath-rest overrides."
    }
  ];

  // ==========================================
  // PROFILE SETTINGS & PREFERENCES TOUR STEPS (14 Steps)
  // ==========================================
  const dynamicProfileSteps: TourStep[] = [
    {
      title: "Disciple Profile & Identity",
      body: `${timeContextualGreeting}! Welcome to your Disciple Profile and Preferences setup. Here you can inspect your active Berean tier rank, registered email, and spiritual study identity.`
    },
    {
      title: "Update Profile Credentials & Avatar",
      body: "Customize your disciple display name, update your email address, or upload an avatar representing your dedication to holy Scripture mastery."
    },
    {
      title: "Mastery Level Progression",
      body: "Track your spiritual learning trajectory. Click here at any time to view your full Mastery Roadmap from Beginner Disciple to Scholar and Licensed Lay Teacher."
    },
    {
      title: "Weekly Scribe Heatmap",
      body: "This 7-day heatmap visually records your daily scripture recall exercises, memory vaults, and chapter completions across every day of the week."
    },
    {
      title: "Scribal Badges & Achievements",
      body: "Earn verified biblical study awards and badges like 'Disciple\'s Spark', '7-Day Devoted Streak', and 'Scribe of the Sanctuary' as you store truth in your heart."
    },
    {
      title: "Sabbath School Management Hub",
      body: "This is your centralized Sabbath School management portal, connecting you to quarterly study lessons, classroom enrollment, and discussion tools."
    },
    {
      title: "Role Selection (Student vs Teacher)",
      body: "Switch between Student and Teacher roles. Selecting Teacher unlocks class discussion prompts, teaching outlines, and lesson whiteboard diagrams."
    },
    {
      title: "Sabbath Rest & Auto-Quarterly Controls",
      body: "Enable automatic Sabbath School quarterly updates and configure the Seventh-day Sabbath study rest safeguard to pause reminders from Friday sunset to Saturday sunset."
    },
    {
      title: "Daily Verse Recall Goal",
      body: "Choose how many verses you want to memorize daily (1 to 7 verses) to pace your learning sustainably according to your spiritual bandwidth."
    },
    {
      title: "Spaced Repetition Queue Decay",
      body: "Set active intervals (3, 5, or 7 days) to reactivate memorized verses in the Recall Queue, reinforcing long-term cognitive retention."
    },
    {
      title: "Preferred Bible Translation",
      body: "Choose your primary study translation (KJV, NKJV, ESV, or NIV). All verbatim recall tests will validate against this chosen text source."
    },
    {
      title: "Elder Stephen Speech Engine & AI Voice",
      body: "Choose between the neural Elder Stephen AI Voice (Gemini AI) or high-fidelity Edge Natural read-aloud voices to narrate scripture and guide your exegesis."
    },
    {
      title: "Spirit of Prophecy Commentary",
      body: "Toggle Ellen White commentary integration on or off during your study sessions to add rich historical and theological insights."
    },
    {
      title: "Devotional Reminder Alarms",
      body: "Set your dedicated daily study alarm time so your device alerts you when it's time for your holy quiet hour and daily memory practice."
    },
    {
      title: "Return to Desktop",
      body: "Your Profile & Preferences tour is complete! Make any changes you need, then Click the glowing green 'Return to Desktop' button below to return to your main study command center and begin your active scripture mastery."
    }
  ];

  const activeSteps = tourType === "profile" ? dynamicProfileSteps : dynamicDashboardSteps;

  const getDashboardTargetElement = (index: number): HTMLElement | null => {
    switch (index) {
      case 0:
        return document.getElementById("sidebar-greeting-wrap") || 
               document.getElementById("sidebar-greeting-text") || 
               document.getElementById("stba-top-bar") ||
               document.querySelector("header h2");
      case 1:
        return document.getElementById("topbar-alerts") || 
               document.getElementById("stba-top-bar");
      case 2:
        return document.getElementById("topbar-sabbath-switch") || 
               document.getElementById("stba-top-bar");
      case 3:
        return document.getElementById("ai-mentor-panel") || 
               document.getElementById("dashboard-left-panel");
      case 4:
        return document.getElementById("suggested-next-step-box") || 
               document.getElementById("ai-mentor-panel");
      case 5:
        return document.getElementById("dashboard-mode-selector-nav") || 
               document.getElementById("dashboard-left-panel");
      case 6:
        return document.getElementById("scholar-top-anchor") ||
               document.getElementById("ask-scholar-box") || 
               document.getElementById("ask-scholar-hub");
      case 7:
        return document.getElementById("scholar-left-options");
      case 8:
        return document.getElementById("chat-scaffold-right");
      case 9:
        return document.getElementById("milestones-vault") || 
               document.getElementById("badges-grid-pane") || 
               document.getElementById("dashboard-right-canvas");
      case 10:
        return document.getElementById("topbar-profile-link") || 
               document.getElementById("topbar-tier-badge") || 
               document.body;
      default:
        return null;
    }
  };

  const getProfileTargetElement = (index: number): HTMLElement | null => {
    switch (index) {
      case 0:
        return document.getElementById("user-metadata-card") || 
               document.getElementById("profile-heading-flow") || 
               document.getElementById("profile-settings-page-wrapper");
      case 1:
        return document.getElementById("edit-profile-action") || 
               document.getElementById("user-metadata-card");
      case 2:
        return document.getElementById("mastery-level-badge-action") || 
               document.getElementById("user-metadata-card");
      case 3:
        return document.getElementById("weekly-heatmap-card") || 
               document.getElementById("profile-col-info");
      case 4:
        return document.getElementById("scribal-milestones-card") || 
               document.getElementById("achievements-badges-grid");
      case 5:
        return document.getElementById("sabbath-school-centralized-hub") || 
               document.getElementById("profile-sabbath-role-selection");
      case 6:
        return document.getElementById("profile-sabbath-role-selection") || 
               document.getElementById("sabbath-school-centralized-hub");
      case 7:
        return document.getElementById("sabbath-toggles-grid") || 
               document.getElementById("profile-sabbath-toggle-spot");
      case 8:
        return document.getElementById("select-daily-verses-count") || 
               document.getElementById("preferences-menu-body") || 
               document.getElementById("preferences-menu");
      case 9:
        return document.getElementById("select-queue-frequency") || 
               document.getElementById("preferences-menu-body") || 
               document.getElementById("preferences-menu");
      case 10:
        return document.getElementById("select-bible-version-dropdown") || 
               document.getElementById("preferences-menu-body") || 
               document.getElementById("preferences-menu");
      case 11:
        return document.getElementById("select-ai-voice") || 
               document.getElementById("select-browser-voice") || 
               document.getElementById("preferences-menu-body");
      case 12:
        return document.getElementById("egw-annotations-switch") || 
               document.getElementById("preferences-menu-body");
      case 13:
        return document.getElementById("reminder-time") || 
               document.getElementById("notifications-alarm-switch") || 
               document.getElementById("preferences-menu-body");
      case 14:
        return document.getElementById("return-to-desktop-btn") || 
               document.getElementById("return-study-btn") || 
               document.getElementById("signout-control-flow");
      default:
        return null;
    }
  };

  const getTargetElement = (index: number): HTMLElement | null => {
    if (tourType === "profile") {
      return getProfileTargetElement(index);
    }
    return getDashboardTargetElement(index);
  };

  const cleanupHighlight = () => {
    if (currentTargetRef.current) {
      if (originalStylesRef.current) {
        currentTargetRef.current.style.position = originalStylesRef.current.position;
        currentTargetRef.current.style.zIndex = originalStylesRef.current.zIndex;
      }
      currentTargetRef.current.classList.remove("tour-highlight");
      currentTargetRef.current = null;
      originalStylesRef.current = null;
    }
  };

  const calculatePosition = (targetEl: HTMLElement, tooltipEl: HTMLElement | null) => {
    const rect = targetEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 230;
    const gap = 16;

    let top = 0;
    let left = 0;
    let direction: "top" | "bottom" | "right" | "left" = "top";

    const isInRightPanel = (rect.left + rect.width / 2 > viewportWidth * 0.65) || 
                          !!targetEl.closest("#dashboard-right-sidebar") || 
                          !!targetEl.closest("#topbar-alerts") || 
                          !!targetEl.closest("#topbar-profile-link");

    if (isInRightPanel && (rect.left - tooltipWidth - gap > 0)) {
      left = rect.left - tooltipWidth - gap;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      direction = "right";
    } else {
      const spaceBelow = viewportHeight - rect.bottom;
      if (spaceBelow > tooltipHeight + gap) {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        direction = "top";
      } else {
        top = rect.top - tooltipHeight - gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        direction = "bottom";
      }
    }

    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

    return { top, left, direction };
  };

  const updateTooltipPosition = () => {
    if (currentTargetRef.current) {
      const rect = currentTargetRef.current.getBoundingClientRect();
      const { top, left, direction } = calculatePosition(currentTargetRef.current, tooltipRef.current);
      setTooltipPos({ top, left });

      const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 230;

      let style: React.CSSProperties = {};
      if (direction === "top") {
        const targetCenter = rect.left + rect.width / 2;
        const relativeLeft = targetCenter - left;
        const arrowLeft = Math.max(20, Math.min(300, relativeLeft));
        style = {
          position: "absolute",
          top: "-6px",
          left: `${arrowLeft}px`,
          width: "12px",
          height: "12px",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid #E8E4DC",
          borderTop: "1px solid #E8E4DC",
          transform: "translateX(-50%) rotate(45deg)",
          zIndex: 1003
        };
      } else if (direction === "bottom") {
        const targetCenter = rect.left + rect.width / 2;
        const relativeLeft = targetCenter - left;
        const arrowLeft = Math.max(20, Math.min(300, relativeLeft));
        style = {
          position: "absolute",
          bottom: "-6px",
          left: `${arrowLeft}px`,
          width: "12px",
          height: "12px",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E8E4DC",
          borderBottom: "1px solid #E8E4DC",
          transform: "translateX(-50%) rotate(45deg)",
          zIndex: 1003
        };
      } else if (direction === "right") {
        const targetCenterY = rect.top + rect.height / 2;
        const relativeTop = targetCenterY - top;
        const arrowTop = Math.max(20, Math.min(tooltipHeight - 20, relativeTop));
        style = {
          position: "absolute",
          right: "-6px",
          top: `${arrowTop}px`,
          width: "12px",
          height: "12px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E8E4DC",
          borderRight: "1px solid #E8E4DC",
          transform: "translateY(-50%) rotate(45deg)",
          zIndex: 1003
        };
      }
      setArrowStyle(style);
    }
  };

  const startTour = (type: "dashboard" | "profile" = "dashboard") => {
    cleanupHighlight();
    setTourType(type);
    setStepIndex(0);
    setActive(true);
  };

  const skipTour = () => {
    cleanupHighlight();
    setActive(false);
    if (tourType === "profile") {
      localStorage.setItem("stba_profile_tour_completed", "true");
      sessionStorage.setItem("stba_session_profile_tour_completed", "true");
      window.dispatchEvent(new CustomEvent("stba-profile-tour-completed"));
    } else {
      localStorage.setItem("stba_tour_completed", "true");
      localStorage.setItem("stba_tour_just_completed", "true");
      sessionStorage.setItem("stba_session_tour_completed", "true");
      window.dispatchEvent(new CustomEvent("stba-tour-completed"));
      window.dispatchEvent(new CustomEvent("stba-first-assignment-trigger"));
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const nextStep = () => {
    if (stepIndex < activeSteps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      // Completed!
      cleanupHighlight();
      setActive(false);
      if (tourType === "profile") {
        localStorage.setItem("stba_profile_tour_completed", "true");
        sessionStorage.setItem("stba_session_profile_tour_completed", "true");
        setToast("✦ Profile Tour complete — Disciple settings and preferences successfully configured!");
        window.dispatchEvent(new CustomEvent("stba-profile-tour-completed"));
      } else {
        localStorage.setItem("stba_tour_completed", "true");
        localStorage.setItem("stba_tour_just_completed", "true");
        sessionStorage.setItem("stba_session_tour_completed", "true");
        setToast("✦ Tour complete — unsealing First Retrieval Assignment!");
        window.dispatchEvent(new CustomEvent("stba-tour-completed"));
        window.dispatchEvent(new CustomEvent("stba-first-assignment-trigger"));
      }
      setTimeout(() => {
        setToast(null);
      }, 4500);
    }
  };

  // Listen to Global Tour Events
  useEffect(() => {
    const handleStartDashboardTour = () => {
      if (pathname !== "/dashboard") {
        navigate("/dashboard");
        setTimeout(() => {
          startTour("dashboard");
        }, 500);
      } else {
        startTour("dashboard");
      }
    };

    const handleStartProfileTour = () => {
      // Dispatch tab switch so the preferences/settings tab is active
      window.dispatchEvent(new CustomEvent("stba-ensure-settings-tab"));
      if (pathname !== "/profile") {
        navigate("/profile");
        setTimeout(() => {
          startTour("profile");
        }, 500);
      } else {
        setTimeout(() => {
          startTour("profile");
        }, 200);
      }
    };

    window.addEventListener("start-stba-tour", handleStartDashboardTour);
    window.addEventListener("start-stba-profile-tour", handleStartProfileTour);
    return () => {
      window.removeEventListener("start-stba-tour", handleStartDashboardTour);
      window.removeEventListener("start-stba-profile-tour", handleStartProfileTour);
    };
  }, [pathname, navigate]);

  // Check if profile tour was requested via "Start Your Journey" transition
  useEffect(() => {
    if (pathname === "/profile" && localStorage.getItem("stba_start_profile_tour") === "true") {
      localStorage.removeItem("stba_start_profile_tour");
      window.dispatchEvent(new CustomEvent("stba-ensure-settings-tab"));
      const timer = setTimeout(() => {
        startTour("profile");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Dispatch final step notifications for profile tour button glowing
  useEffect(() => {
    if (active && tourType === "profile") {
      const isFinal = stepIndex === dynamicProfileSteps.length - 1;
      window.dispatchEvent(new CustomEvent("stba-profile-tour-final-step", { detail: { isFinalStep: isFinal } }));
    }
  }, [active, tourType, stepIndex]);

  // Autoplay Tour once for new users on load if they are on dashboard
  useEffect(() => {
    const completed = localStorage.getItem("stba_tour_completed");
    const isNewUser = localStorage.getItem("stba_is_new_user") === "true";
    if (isNewUser && !completed && pathname === "/dashboard") {
      const timer = setTimeout(() => {
        startTour("dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Handle active step transition with scrolling
  useEffect(() => {
    if (!active) return;

    // Clean up previous high-lighting state
    cleanupHighlight();

    // Small delay to allow react cycles to catch up
    const processStep = () => {
      const element = getTargetElement(stepIndex);
      if (!element) return;

      // Scroll into view centered smoothly
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Wait 300ms for scrolling to settle
      setTimeout(() => {
        originalStylesRef.current = {
          position: element.style.position || getComputedStyle(element).position,
          zIndex: element.style.zIndex || getComputedStyle(element).zIndex,
        };

        element.style.position = "relative";
        element.style.zIndex = "1001";
        element.classList.add("tour-highlight");
        currentTargetRef.current = element;

        // Force position recalculation
        updateTooltipPosition();
      }, 300);
    };

    processStep();

    return () => {
      cleanupHighlight();
    };
  }, [stepIndex, active, tourType]);

  // Reposition on window resize
  useEffect(() => {
    if (!active) return;
    const handleResize = () => {
      updateTooltipPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active]);

  // Reposition on scroll as fallback
  useEffect(() => {
    if (!active) return;
    const handleScroll = () => {
      updateTooltipPosition();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [active]);

  // Escape key skipping
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, tourType]);

  // Auto-focus next button
  useEffect(() => {
    if (active && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [stepIndex, active]);

  // Voiceover narration for each active step description matching Elder Stephen properties
  useEffect(() => {
    if (active) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const text = activeSteps[stepIndex]?.body || "";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        
        const bestVoice = getElderStephenVoice();
        
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [active, stepIndex, tourType]);

  if (!active && !toast) return null;

  return (
    <>
      {/* Dynamic Tour Styles Injected */}
      <style id="tour-styles">{`
        .tour-highlight {
          outline: 2.5px solid #C9922A !important;
          outline-offset: 5px !important;
          box-shadow: 0 0 20px rgba(201, 146, 42, 0.4) !important;
          transition: outline 0.15s ease, outline-offset 0.15s ease !important;
        }
        @keyframes tour-toast-fade-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes tour-toast-fade-out {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, 10px); }
        }
        .tour-toast-enter {
          animation: tour-toast-fade-in 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* Tour Vanilla JS Engine Script Holder */}
      <script id="tour-script" dangerouslySetInnerHTML={{ __html: `
        (function() {
          window.__STBA_TOUR_ACTIVE__ = ${active};
          window.__STBA_TOUR_TYPE__ = "${tourType}";
          window.__STBA_CURRENT_STEP__ = ${stepIndex};
          console.log("STBA Guided Tour engine updated. Active: " + ${active} + ", Type: " + "${tourType}" + ", Step: " + ${stepIndex});
        })();
      ` }} />

      {/* Completion Toast notification */}
      {toast && (
        <div
          className="tour-toast-enter"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1A1F2E",
            color: "#FFFFFF",
            borderRadius: "10px",
            padding: "12px 24px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
            zIndex: 1005,
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #C9973A",
            pointerEvents: "none"
          }}
        >
          <span style={{ color: "#C9922A", fontSize: "16px" }}>✦</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Tour semi-transparent dim backdrop (clicks blocked/disabled) */}
      {active && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            transition: "opacity 0.2s ease"
          }}
          id="stba-tour-overlay-dim"
        />
      )}

      {/* Tooltip Popup container */}
      {active && (
        <div
          ref={tooltipRef}
          aria-live="polite"
          style={{
            position: "fixed",
            zIndex: 1002,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E4DC",
            borderRadius: "16px",
            padding: "20px",
            width: "320px",
            boxShadow: "0 10px 36px rgba(0,0,0,0.18)",
            fontFamily: "inherit",
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            transition: "top 0.15s ease-out, left 0.15s ease-out"
          }}
          id="stba-tour-tooltip-panel"
        >
          {/* Directional Pointing Arrow */}
          {arrowStyle && <div style={arrowStyle} />}

          {/* Header Monospace Indicator with Tour Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px"
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                color: "#C9973A",
                fontWeight: "bold",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              {tourType === "profile" ? "Disciple Setup" : "Study Command Center"} • Step {stepIndex + 1} of {activeSteps.length}
            </div>

            <div
              style={{
                fontSize: "9px",
                fontFamily: "monospace",
                backgroundColor: tourType === "profile" ? "rgba(42, 157, 143, 0.12)" : "rgba(201, 151, 58, 0.12)",
                color: tourType === "profile" ? "#2A9D8F" : "#C9973A",
                fontWeight: "bold",
                padding: "2px 6px",
                borderRadius: "4px",
                textTransform: "uppercase"
              }}
            >
              {tourType === "profile" ? "Profile Tour" : "Dashboard"}
            </div>
          </div>

          {/* Step title */}
          <h4
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1C2333",
              marginBottom: "6px"
            }}
          >
            {activeSteps[stepIndex]?.title}
          </h4>

          {/* Step description */}
          <p
            style={{
              fontSize: "12.5px",
              color: "#5B5B5B",
              lineHeight: "1.6",
              margin: 0,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {activeSteps[stepIndex]?.body}
          </p>

          {/* Footer controls row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "18px",
              paddingTop: "12px",
              borderTop: "1px solid #E8E4DA"
            }}
          >
            {/* Dots / Step progress */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                maxWidth: "110px",
                overflowX: "hidden"
              }}
            >
              {activeSteps.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: idx === stepIndex ? "10px" : "5px",
                    height: "5px",
                    borderRadius: "3px",
                    backgroundColor: idx === stepIndex ? "#C9922A" : "#E5E7EB",
                    transition: "all 0.15s ease"
                  }}
                />
              ))}
            </div>

            {/* Navigation Buttons: Back, Skip, Next */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-sans text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded transition-colors"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  ← Back
                </button>
              )}

              <button
                type="button"
                onClick={skipTour}
                className="font-sans text-xs text-stone-400 hover:text-stone-600 focus:outline-none"
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Skip
              </button>

              <button
                ref={nextButtonRef}
                type="button"
                onClick={nextStep}
                className="px-3.5 py-1.5 text-xs text-white font-serif font-bold rounded-lg transition-colors focus:outline-none shadow-xs"
                style={{
                  backgroundColor: "#C9922A",
                  border: "none",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#B0822F")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#C9922A")}
              >
                {stepIndex === activeSteps.length - 1 ? "Finish ✦" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourOverlay;
