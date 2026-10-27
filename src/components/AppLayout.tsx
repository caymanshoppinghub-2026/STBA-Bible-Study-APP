/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  BookOpen,
  List,
  Brain,
  User,
  Settings,
  X,
  ShieldAlert,
  Lock
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TourOverlay } from "./TourOverlay";
import { FloatingQuickNote } from "./notebook/FloatingQuickNote";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sabbathMode } = useSabbathMode();
  const { user, verifyUserEmail, isBottomBarVisible, setIsBottomBarVisible, resetBottomBarTimer } = useApp();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState("");
  const [sandboxCode, setSandboxCode] = useState("");
  const width = useWindowWidth();
  const isMobile = width < 768;
  const { pathname } = useLocation();
  const isImmersive = pathname === "/stba" || pathname === "/recall" || pathname === "/teach" || pathname === "/notebook" || pathname === "/sabbath-school";

  const isBottomBarVisibleRef = React.useRef(isBottomBarVisible);
  useEffect(() => {
    isBottomBarVisibleRef.current = isBottomBarVisible;
  }, [isBottomBarVisible]);

  useEffect(() => {
    if (!isMobile) return;

    // Show initially and on route change, then auto-retract after 4s of inactivity
    setIsBottomBarVisible(true);
    resetBottomBarTimer(4000);

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      // When collapsed, only trigger if user touches the bottom retracted tab (bottom 30px)
      // to avoid triggering when the user taps or types in the lowered text box
      const threshold = isBottomBarVisibleRef.current ? 70 : 30;
      if (touch.clientY >= window.innerHeight - threshold) {
        setIsBottomBarVisible(true);
        resetBottomBarTimer(4000);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const threshold = isBottomBarVisibleRef.current ? 70 : 30;
      if (e.clientY >= window.innerHeight - threshold) {
        setIsBottomBarVisible(true);
        resetBottomBarTimer(4000);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isBottomBarVisibleRef.current && e.clientY >= window.innerHeight - 25) {
        setIsBottomBarVisible(true);
        resetBottomBarTimer(4000);
      }
    };

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 25 && isBottomBarVisibleRef.current) {
        setIsBottomBarVisible(false);
      } else if (currentScrollY < lastScrollY - 35 && !isBottomBarVisibleRef.current) {
        setIsBottomBarVisible(true);
        resetBottomBarTimer(4000);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  const triggerSendCode = async (quiet: boolean = false) => {
    if (!user || user.isGuest || user.emailVerified) return;
    if (!quiet) setResending(true);
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.name })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (!quiet) {
            setResendStatusMsg(data.message || "Code sent successfully!");
            setTimeout(() => setResendStatusMsg(""), 4000);
          }
          if (data.fallbackCode) {
            setSandboxCode(data.fallbackCode);
          } else {
            setSandboxCode("");
          }
        }
      }
    } catch (err) {
      console.error("[STBA AUTH] Failed to trigger code:", err);
      if (!quiet) {
        setResendStatusMsg("Failed to communicate with authorization server.");
        setTimeout(() => setResendStatusMsg(""), 4000);
      }
    } finally {
      if (!quiet) setResending(false);
    }
  };

  useEffect(() => {
    if (user && !user.emailVerified && !user.isGuest) {
      triggerSendCode(true);
    }
  }, [user?.email, user?.emailVerified, user?.isGuest]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 5) return;
    setVerifying(true);
    try {
      const success = await verifyUserEmail(verificationCode);
      if (success) {
        setSuccessMsg("Your email has been verified! Stats tracking is now unlocked.");
        setSandboxCode("");
        setTimeout(() => {
          setShowCodeModal(false);
          setSuccessMsg("");
          setVerificationCode("");
        }, 2500);
      } else {
        alert("Invalid or expired verification code. Please check your spelling or request a new code.");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming code.");
    } finally {
      setVerifying(false);
    }
  };

  // Bottom nav elements mapping
  const mobileNavItems = [
    { label: "Home", path: "/dashboard", icon: LayoutDashboard },
    { label: "Study", path: "/stba", icon: BookOpen },
    { label: "Tracks", path: "/tracks", icon: List },
    { label: "Recall", path: "/recall", icon: Brain },
    { label: "Profile", path: "/profile", icon: User }
  ];

  return (
    <div
      className={`flex text-left transition-colors duration-500 ${
        isLight ? "bg-[#FAF8F5] text-stone-900" : "bg-[#06162c] text-white"
      } ${
        isImmersive ? "h-screen max-h-screen overflow-hidden w-full" : "min-h-screen"
      }`}
      id="stba-overall-app-layout"
    >
      {/* UNIFIED SLIDE-IN NAVIGATION DRAWER FROM LEFT (OVERLAY-FREE / NO DIMMING OR BLUR) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Invisible transparent click-catcher (no dimming, no blur, keeps background 100% visible) */}
            <div
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-transparent cursor-pointer"
              id="navigation-drawer-click-outside"
              aria-label="Close navigation"
            />

            {/* Navigation drawer sliding smoothly in from the left over the fully visible content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 320,
                mass: 0.75
              }}
              className="fixed inset-y-0 left-0 z-50 w-[290px] max-w-[85vw] shadow-2xl shadow-black/90 overflow-hidden bg-[#06162c] border-r border-[#E5B842]/40 block text-left"
              id="navigation-drawer-body"
            >
              <Sidebar
                isMobileDrawer
                onClose={() => setMobileDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CORE WORKSPACE VIEW */}
      <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 ${isLight ? "bg-[#FAF8F5]" : "bg-[#06162c]"} ${isImmersive ? "h-full max-h-full overflow-hidden" : ""}`} id="stba-content-workspace">
        {/* PENDING VERIFICATION ALERT BANNER */}
        {user && !user.emailVerified && (
          <div className="bg-[#1C2333] border-b border-[#C9973A]/30 text-stone-200 px-5 py-3.5 text-xs font-sans flex flex-wrap md:flex-nowrap items-center justify-between gap-4 z-40 animate-fade-in shrink-0 shadow-lg relative overflow-hidden">
            {/* Embedded custom style for clean, performance-optimized initial 3-blink and periodic 60-second pulse beacon */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes initial-3-blinks {
                0%, 100% {
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0px rgba(201, 151, 58, 0);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 20px 6px rgba(201, 151, 10, 0.85);
                  transform: scale(1.04);
                }
              }
              @keyframes gold-beacon-blink {
                0%, 94%, 100% {
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0px rgba(201, 151, 58, 0);
                  transform: scale(1);
                }
                96% {
                  box-shadow: 0 0 20px 6px rgba(201, 151, 10, 0.85);
                  transform: scale(1.04);
                }
                98% {
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0px rgba(201, 151, 58, 0);
                  transform: scale(0.97);
                }
              }
              .premium-gold-blink {
                animation: initial-3-blinks 1s ease-in-out 3, gold-beacon-blink 60s infinite ease-in-out 3s;
              }
            `}} />

            {/* Soft decorative background glow to give a premium feel */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#C9973A]/5 to-transparent pointer-events-none" />
            
            <div className="flex items-start sm:items-center space-x-3.5 z-10">
              <div className="flex-shrink-0 p-1.5 bg-[#C9973A]/10 border border-[#C9973A]/20 rounded-lg text-[#C9973A]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-[#C9973A] bg-[#C9973A]/10 px-2 py-0.5 rounded border border-[#C9973A]/20">
                    {user.isGuest ? "Guest Session Mode" : "Pending Verification"}
                  </span>
                  <span className="text-stone-400 font-sans text-[11px]">
                    {user.isGuest 
                      ? "Advanced spaced repetition, daily streaks, and memory vault items won't be saved long-term."
                      : "Spaced repetition analytics & scripture memory vault are currently offline."}
                  </span>
                </div>
                <div className="text-stone-350 font-sans text-xs leading-relaxed max-w-2xl mt-1">
                  {user.isGuest ? (
                    <span>Logged in as guest scholar. Fill out your full name and email address on sign-up to unlock complete dashboard persistence.</span>
                  ) : (
                    <span>Verification code sent to email: <strong className="text-white font-medium">{user.email}</strong>. Unlock stats logging, permanent memory tracks, and collaborative study decks with your scholarly profile.</span>
                  )}
                </div>
              </div>
            </div>

            {!user.isGuest && (
              <button
                onClick={() => setShowCodeModal(true)}
                className="premium-gold-blink w-full md:w-auto px-4 py-2 bg-[#C9973A] hover:bg-[#b8872f] text-white font-serif font-bold tracking-tight rounded-lg shadow-md hover:shadow-[#C9973A]/10 transition-all duration-300 transform active:scale-95 cursor-pointer z-10 shrink-0 flex items-center justify-center space-x-1.5 border border-[#C9973A]/20"
              >
                <Lock className="w-3.5 h-3.5 text-stone-100" />
                <span>Enter Code</span>
              </button>
            )}
          </div>
        )}

        {/* TOP COMPONENT */}
        <TopBar
          onOpenMobileDrawer={() => setMobileDrawerOpen((prev) => !prev)}
          onToggleDesktopSidebar={() => setMobileDrawerOpen((prev) => !prev)}
          isSidebarOpen={mobileDrawerOpen}
        />

        {/* PAGE CONTENT CONTAINER (PADDED AND CENTERED) */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out min-h-0 ${
            isImmersive ? "p-0 h-full flex flex-col overflow-hidden" : isMobile ? (isBottomBarVisible ? "p-2 pb-16" : "p-2 pb-6") : "p-4 sm:p-6 lg:p-8"
          }`}
          id="stba-app-main-pane"
        >
          {/* Centered container keeping margins within clean bounds */}
          <div className={`w-full mx-auto transition-all duration-300 ease-in-out ${isImmersive ? "max-w-none h-full flex flex-col min-h-0 overflow-hidden" : `max-w-7xl 2xl:max-w-[1500px] ${isMobile ? (isBottomBarVisible ? "pb-16" : "pb-6") : "pb-16 sm:pb-4"}`}`}>
            {children}
          </div>
        </main>

        {/* RESPONSIVE BOTTOM NAVIGATION BAR FOR MOBILE SCREENS ONLY WITH AUTO-RETRACT */}
        {isMobile && (
          <>
            {/* Subtle bottom indicator tab when retracted */}
            {!isBottomBarVisible && (
              <div
                onClick={() => {
                  setIsBottomBarVisible(true);
                  resetBottomBarTimer(4000);
                }}
                className="fixed bottom-0 inset-x-0 h-6 z-36 flex items-center justify-center cursor-pointer bg-gradient-to-t from-stone-900/20 to-transparent select-none animate-in fade-in duration-200"
                title="Tap to reveal navigation"
              >
                <div className="w-14 h-1 rounded-full bg-[#C9973A] shadow-md opacity-90 animate-pulse" />
              </div>
            )}

            <nav
              onTouchStart={() => resetBottomBarTimer(5000)}
              onClick={() => resetBottomBarTimer(5000)}
              className={`fixed bottom-0 inset-x-0 h-16 border-t grid grid-cols-5 items-center z-35 transition-all duration-300 ease-in-out select-none will-change-transform ${
                isBottomBarVisible
                  ? "translate-y-0 opacity-100 shadow-2xl pointer-events-auto"
                  : "translate-y-full opacity-0 pointer-events-none"
              } ${
                sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]/60" : "bg-white border-stone-200"
              }`}
              id="mobile-bottom-bar-nav"
            >
              {/* Dismiss / Retract Grab Handle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBottomBarVisible(false);
                }}
                className={`absolute -top-2.5 left-1/2 -translate-x-1/2 h-3 px-3 rounded-t-md border-t border-x flex items-center justify-center cursor-pointer active:scale-95 transition-colors ${
                  sabbathMode
                    ? "bg-[#FAF7F0] border-[#E8E2D1]/80 hover:bg-[#F3EFE6]"
                    : "bg-white border-stone-200 hover:bg-stone-50"
                }`}
                title="Retract navigation bar"
                aria-label="Retract navigation bar"
              >
                <div className="w-6 h-0.5 rounded-full bg-[#C9973A]/70" />
              </button>
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => resetBottomBarTimer(4000)}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center h-full w-full py-1.5 focus:outline-none transition-all ${
                        isActive ? "text-[#C9973A]" : "text-stone-500 hover:text-stone-800"
                      }`
                    }
                    title={item.label}
                    id={`mobile-bottom-tab-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5 shrink-0 mx-auto" />
                    <span className="text-[10px] font-sans font-semibold mt-1 block text-center truncate w-full px-1">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </>
        )}

        {/* VERIFICATION SPECIAL MODAL PORT OVERLAY */}
        <AnimatePresence>
          {showCodeModal && (
            <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#FDFAF5] border border-[#E8E2D1] rounded-xl p-6 max-w-sm w-full shadow-lg text-left"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#1C2333]">Verify Academic Account</h3>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {successMsg ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] mb-2 font-bold text-xl">
                      ✓
                    </div>
                    <p className="text-xs font-serif font-medium text-stone-800 leading-relaxed">{successMsg}</p>
                  </div>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-4">
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      We have dispatched an activation code to <br/>
                      <strong className="text-stone-900">{user?.email || "your email"}</strong>. Please input the verification token below to authorize stats logging.
                    </p>
                    
                    {sandboxCode && (
                      <div className="p-3 bg-[#C1A87D]/10 border border-[#C9973A]/30 rounded-lg text-xs text-stone-800 space-y-1">
                        <p className="font-semibold text-[#C9973A] text-[10px] uppercase font-sans tracking-wide">Developer Sandbox Notice</p>
                        <p className="text-[11px] text-stone-600 leading-relaxed">SMTP mail server is not configured in secrets. Check server terminal logs, or use sandbox bypass code below:</p>
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 border border-[#E8E4DA] rounded font-mono text-[#1C2333] font-bold text-sm tracking-widest mt-1">
                          <span>{sandboxCode}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(sandboxCode);
                              setResendStatusMsg("Copied code!");
                              setTimeout(() => setResendStatusMsg(""), 2000);
                            }}
                            className="text-[10px] text-[#C9973A] hover:underline font-sans font-medium cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-mono font-extrabold uppercase text-stone-400 font-sans tracking-wider">6-Digit Verification Code</label>
                        {resendStatusMsg ? (
                          <span className="text-[10px] font-medium text-[#C9973A] font-sans">{resendStatusMsg}</span>
                        ) : (
                          <button
                            type="button"
                            disabled={resending}
                            onClick={() => triggerSendCode(false)}
                            className="text-[10px] font-semibold text-[#C9973A] hover:underline focus:outline-none cursor-pointer font-sans"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="144000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center text-lg tracking-widest font-mono p-3 bg-white border border-[#E8E4DA] rounded-lg focus:outline-none focus:border-[#C9973A]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifying}
                      className="w-full py-3 bg-[#1C2333] hover:bg-[#C9973A] text-white font-serif font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      {verifying ? "Verifying Token..." : "Confirm & Unlock Stats →"}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FLOATING QUICK-NOTE ACTION BUTTON IN STUDY MODES */}
        <FloatingQuickNote />

        {/* GUIDED ONBOARDING SYSTEM TOUR */}
        <TourOverlay />
      </div>
    </div>
  );
};

export default AppLayout;
