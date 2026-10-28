/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ResetPasswordPage } from './components/STBA/ResetPasswordPage';
import { LandingPage } from "./components/LandingPage";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { Dashboard } from "./components/Dashboard";
import { STBAStudyMode } from "./components/STBAStudyMode";
import { TracksPage } from "./components/TracksPage";
import {
  TracksPageRedesigned,
  TrackIntroPage,
  LessonSelectorPage,
  LessonDetailPage,
  LessonPreTestPage
} from "./components/TrackStudySystem";
import { TrackPreviewPage } from "./components/TrackPreviewPage";
import { DoctrineNavigator } from "./components/DoctrineNavigator";
import { PreTest } from "./components/PreTest";
import { ActiveRecallStudio } from "./components/ActiveRecallStudio";
import { TeachItStudio } from "./components/TeachItStudio";
import { MemoryVault } from "./components/MemoryVault";
import { SabbathSchoolPage } from "./pages/SabbathSchoolPage";
import { ProfileSettings } from "./components/ProfileSettings";
import { SignInPage } from "./components/SignInPage";
import { SignUpPage } from "./components/SignUpPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotebookPage } from "./pages/NotebookPage";
import { UserStatsPage } from "./components/UserStatsPage";
import { Confetti } from "./components/Confetti";
import { RecallPopupModal } from "./components/recall/RecallPopupModal";

import { AppProvider, useApp } from "./context/AppContext";
import { SabbathSchoolProvider } from "./context/SabbathSchoolContext";
import { SabbathModeProvider, useSabbathMode } from "./context/SabbathMode";
import { ElderStephenProvider } from "./context/ElderStephenContext";
import { addNotification } from "./utils/notificationsManager";
import { initContentUpdatesWatcher } from "./utils/contentUpdatesWatcher";
import { AppLayout } from "./components/AppLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { MediaInitializationProvider, StartupSafetyWrapper } from "./components/MediaInitializationProvider";
import { SpeedInsights } from '@vercel/speed-insights/react';

function PublicLayout({ children }: { children: React.ReactNode }) {
  const { sabbathMode } = useSabbathMode();
  return (
    <div
      className={`min-h-screen w-full transition-colors duration-1000 ${
        sabbathMode ? "bg-[#FAF7F0] text-[#2C2314]" : "bg-[#FAF9F5] text-[#1A1A1A]"
      }`}
      id="public-routing-layout"
    >
      {children}
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sabbathMode, toggleManualOverride } = useSabbathMode();
  const { user, setUser } = useApp();

  const fallbackUser = {
    name: "Guest Scholar",
    email: "guest@stba.org",
    isSda: true,
    firstTrack: "fundamental-beliefs",
    isGuest: true,
    emailVerified: false // Guest scholars start unverified so we block stats tracking!
  };

  const activeUser = user || fallbackUser;

  // Scroll to top on route change with manual scroll restoration safety
  React.useEffect(() => {
    if (location.pathname === "/dashboard") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      document.documentElement.scrollTo({ top: 0, behavior: "instant" });
      document.body.scrollTo({ top: 0, behavior: "instant" });

      const dashboardScrollContainer = document.getElementById("dashboard-full-container");
      if (dashboardScrollContainer) {
        dashboardScrollContainer.scrollTo({ top: 0, behavior: "instant" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.key]);

  // Daily study reminder check scheduler
  React.useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const checkDailyReminder = () => {
      const isEnabled = localStorage.getItem("stba_notifications_enabled") !== "false";
      if (!isEnabled) return;
      if (Notification.permission !== "granted") return;

      const reminderTime = localStorage.getItem("stba_reminder_time") || "07:30";
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (currentTimeStr === reminderTime) {
        const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const lastSent = localStorage.getItem("stba_last_reminder_date");

        if (lastSent !== todayStr) {
          localStorage.setItem("stba_last_reminder_date", todayStr);

          // Trigger in-app notification with golden bell ringing sound and icon animation
          addNotification({
            title: "Daily Scripture Study Reminder",
            description: "It's your scheduled study hour! Spend holy quiet and review your verses in Active Recall.",
            link: "/recall",
            linkText: "Start Active Recall",
            category: "recall"
          });

          try {
            new Notification("STBA Bible Study Reminder", {
              body: "Excellent study hour is here! Take a few moments of holy quiet and complete your Daily Verse Recall.",
              tag: "stba-daily-reminder",
              requireInteraction: true
            });
          } catch (e) {
            console.error("Spawning study alarm browser notification failed:", e);
          }
        }
      }
    };

    // Run check every 45 seconds
    const intervalId = setInterval(checkDailyReminder, 45 * 1000);
    checkDailyReminder();

    return () => clearInterval(intervalId);
  }, []);

  // Background watcher for live section updates (28 Fundamentals, Sabbath School, STBA tracks)
  React.useEffect(() => {
    const cleanup = initContentUpdatesWatcher();
    return cleanup;
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full min-h-screen"
      >
        <Routes location={location}>
          
          {/* PUBLIC MARKETING LANDING PAGE */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage
                  onStartOnboarding={(isSignIn, targetTier) => {
                    if (isSignIn) {
                      navigate("/signin", { state: { isSignIn } });
                    } else {
                      navigate("/signup", { state: { targetTier } });
                    }
                  }}
                  isSabbathMode={sabbathMode}
                  setIsSabbathMode={toggleManualOverride}
                />
              </PublicLayout>
            }
          />

          {/* PUBLIC SIGN IN PORTAL */}
          <Route
            path="/signin"
            element={
              <PublicLayout>
                <SignInPage />
              </PublicLayout>
            }
          />

          {/* PUBLIC SIGN UP PORTAL */}
          <Route
            path="/signup"
            element={
              <PublicLayout>
                <SignUpPage />
              </PublicLayout>
            }
          />

          {/* PUBLIC SIGN UP PORTAL ALIAS */}
          <Route
            path="/sign-up"
            element={
              <PublicLayout>
                <SignUpPage />
              </PublicLayout>
            }
          />

          {/* PUBLIC CREATE ACCOUNT ROUTE ALIAS */}
          <Route
            path="/create-account"
            element={
              <PublicLayout>
                <SignUpPage />
              </PublicLayout>
            }
          />

          {/* ADMIN MANAGEMENT DASHBOARD */}
          <Route
            path="/admin"
            element={
              <PublicLayout>
                <AdminDashboard />
              </PublicLayout>
            }
          />

          {/* PUBLIC ONBOARDING SECURE SYSTEM */}
          <Route
            path="/onboarding"
            element={
              <PublicLayout>
                <div className="max-w-[560px] mx-auto px-4 py-8">
                  <OnboardingFlow
                    onComplete={(profile) => {
                      setUser(profile);
                      navigate("/dashboard");
                    }}
                    onExploreFirst={() => {
                      setUser(activeUser);
                      navigate("/dashboard");
                    }}
                    isSabbathMode={sabbathMode}
                    isSignIn={location.state?.isSignIn || false}
                  />
                </div>
              </PublicLayout>
            }
          />

          {/* AUTHENTICATED CORE DESKTOP PORTAL LAYOUTS */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard
                  key={location.key || location.pathname}
                  user={activeUser}
                  isSabbathMode={sabbathMode}
                  onToggleSabbathMode={toggleManualOverride}
                  onLogOut={() => {
                    setUser(null);
                    navigate("/");
                  }}
                />
              </AppLayout>
            }
          />

          <Route
            path="/stba"
            element={
              <AppLayout>
                <STBAStudyMode />
              </AppLayout>
            }
          />

          <Route
            path="/tracks"
            element={
              <AppLayout>
                <TracksPageRedesigned />
              </AppLayout>
            }
          />

          <Route
            path="/tracks/:id/intro"
            element={
              <AppLayout>
                <TrackIntroPage />
              </AppLayout>
            }
          />

          <Route
            path="/tracks/:id/lessons"
            element={
              <AppLayout>
                <LessonSelectorPage />
              </AppLayout>
            }
          />

          <Route
            path="/tracks/:id/lessons/:lessonId"
            element={
              <AppLayout>
                <LessonDetailPage />
              </AppLayout>
            }
          />

          <Route
            path="/tracks/:id/lessons/:lessonId/pretest"
            element={
              <AppLayout>
                <LessonPreTestPage />
              </AppLayout>
            }
          />

          <Route
            path="/tracks/:id/preview"
            element={
              <AppLayout>
                <TrackPreviewPage />
              </AppLayout>
            }
          />

          <Route
            path="/tracks/:id/pretest"
            element={
              <AppLayout>
                <PreTest />
              </AppLayout>
            }
          />

          <Route
            path="/recall"
            element={
              <AppLayout>
                <ActiveRecallStudio />
              </AppLayout>
            }
          />

          <Route
            path="/teach"
            element={
              <AppLayout>
                <TeachItStudio
                  sabbathMode={sabbathMode}
                  onClose={() => navigate("/dashboard")}
                />
              </AppLayout>
            }
          />

          <Route
            path="/vault"
            element={
              <AppLayout>
                <MemoryVault
                  sabbathMode={sabbathMode}
                  onNavigate={(tab) => {
                    navigate(tab === "home" ? "/dashboard" : `/${tab}`);
                  }}
                  onLaunchRecallPractice={(scripture) => {
                    navigate("/recall", { state: { scripture } });
                  }}
                />
              </AppLayout>
            }
          />

          <Route
            path="/sabbath-school"
            element={
              <AppLayout>
                <SabbathSchoolPage />
              </AppLayout>
            }
          />

          <Route
            path="/notebook"
            element={
              <AppLayout>
                <NotebookPage />
              </AppLayout>
            }
          />

          <Route
            path="/doctrine"
            element={
              <AppLayout>
                <DoctrineNavigator />
              </AppLayout>
            }
          />

          <Route
            path="/stats"
            element={
              <AppLayout>
                <UserStatsPage />
              </AppLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <AppLayout>
                <div className="w-full py-2 sm:py-4">
                  <ProfileSettings
                    onNavigate={(tab) => {
                      navigate(tab === "home" ? "/dashboard" : `/${tab}`);
                    }}
                    onSignOut={() => {
                      setUser(null);
                      navigate("/");
                    }}
                    userName={activeUser.name}
                    userEmail={activeUser.email}
                  />
                </div>
              </AppLayout>
            }
          />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
        <Confetti />
        <RecallPopupModal />
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <MediaInitializationProvider>
          <StartupSafetyWrapper>
            <SabbathModeProvider>
              <AppProvider>
                <SabbathSchoolProvider>
                  <ElderStephenProvider>
                    <AnimatedRoutes />
                  </ElderStephenProvider>
                </SabbathSchoolProvider>
              </AppProvider>
            </SabbathModeProvider>
          </StartupSafetyWrapper>
        </MediaInitializationProvider>
      </ThemeProvider>
      <SpeedInsights scriptSrc="https://va.vercel-scripts.com/v1/speed-insights/script.js" />
    </Router>
  );
}

export default App;
