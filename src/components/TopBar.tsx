/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Check,
  CheckCheck,
  ArrowRight,
  X,
  Calendar,
  Sparkles,
  BookOpen,
  Shield,
  Volume2,
  Radio
} from "lucide-react";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";
import { STBA_LOGO_URL } from "../assets/branding";
import {
  AppNotification,
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  triggerTestNotification
} from "../utils/notificationsManager";
import { playNotificationBellRingSound } from "../utils/audioFeedback";
import { simulateLiveSectionUpdate, checkForLiveContentUpdates } from "../utils/contentUpdatesWatcher";

interface TopBarProps {
  onOpenMobileDrawer: () => void;
  onToggleDesktopSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileDrawer,
  onToggleDesktopSidebar,
  isSidebarOpen
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { user } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [isBellRinging, setIsBellRinging] = useState(false);

  // Sync notifications from manager and listen to external notification events
  useEffect(() => {
    // Initial fetch to prune any expired notifications (> 7 days)
    setNotifications(getStoredNotifications());

    const handleNotificationsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification[]>;
      if (customEvent.detail) {
        setNotifications(customEvent.detail);
      } else {
        setNotifications(getStoredNotifications());
      }
    };

    const handleNewNotificationArrived = () => {
      // Trigger subtle bell ringing animation and refresh list
      setIsBellRinging(true);
      setNotifications(getStoredNotifications());

      // Auto-clear ringing animation state after 2.2 seconds
      const timer = setTimeout(() => {
        setIsBellRinging(false);
      }, 2200);

      return () => clearTimeout(timer);
    };

    window.addEventListener("stba-notifications-changed", handleNotificationsChanged);
    window.addEventListener("stba-new-notification-arrived", handleNewNotificationArrived);

    return () => {
      window.removeEventListener("stba-notifications-changed", handleNotificationsChanged);
      window.removeEventListener("stba-new-notification-arrived", handleNewNotificationArrived);
    };
  }, []);

  // Prevent background scrolling and lock touch events to the notification panel when open on mobile
  useEffect(() => {
    if (showNotifications) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getInitials = (name?: string) => {
    if (!name) return "NB";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleMenuClick = () => {
    if (onOpenMobileDrawer) {
      onOpenMobileDrawer();
    } else if (onToggleDesktopSidebar) {
      onToggleDesktopSidebar();
    }
  };

  // Mark all notifications as read -> places small green checkmarks on all items
  const handleMarkAllAsRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  // Direct link selection handler
  const handleSelectNotification = (item: AppNotification) => {
    // Mark as read with small green checkmark
    const updated = markNotificationAsRead(item.id);
    setNotifications(updated);
    setShowNotifications(false);

    // Direct navigation to relevant section (e.g. Sabbath School, Recall, Teaching, Doctrine)
    if (item.link) {
      navigate(item.link);
    }
  };

  // Trigger simulated notification test with chime sound and animation
  const handleTriggerTestNotification = () => {
    const types: Array<"sabbath-school" | "recall" | "teaching"> = ["sabbath-school", "recall", "teaching"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    triggerTestNotification(randomType);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "sabbath-school":
        return <Calendar className="w-3.5 h-3.5 text-amber-400" />;
      case "recall":
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
      case "teaching":
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case "doctrine":
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#F3CF65]" />;
    }
  };

  return (
    <header
      id="stba-top-bar"
      className="h-[68px] bg-[#06162c]/95 backdrop-blur-md border-b border-[#E5B842]/20 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30 transition-all duration-300 select-none text-left shadow-lg shadow-black/20"
    >
      {/* LEFT: SLIDE-OUT MENU TOGGLE & STBA LOGO BRANDING */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 shrink-0">
        {/* Mobile / Tablet Menu Button */}
        <button
          id="stba-sidebar-toggle-btn"
          onClick={handleMenuClick}
          className="p-2 -ml-1.5 rounded-xl bg-[#0d3060]/60 hover:bg-[#0d3060] text-[#F3CF65] border border-[#E5B842]/30 focus:outline-none transition-all cursor-pointer shadow-xs active:scale-95 group flex items-center justify-center"
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          id="topbar-brand-link"
          className="flex items-center space-x-2.5 group focus:outline-none"
        >
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-[#E5B842]/50 group-hover:ring-[#F3CF65] transition-all p-0.5 bg-[#0a2246] overflow-hidden flex items-center justify-center shadow-md shadow-[#E5B842]/10">
              <img
                src={STBA_LOGO_URL}
                alt="STBA Official Seal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#F3CF65] rounded-full border-2 border-[#06162c] shadow-xs" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-[#F3CF65] text-lg sm:text-xl tracking-tight leading-none group-hover:text-amber-200 transition-colors">
                STBA
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] uppercase font-mono tracking-widest text-[#94A3B8] font-bold leading-none mt-0.5">
              Study To Be Approved™
            </span>
          </div>
        </Link>
      </div>

      {/* RIGHT: HUD (NOTIFICATION BELL, USER PROFILE) */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0" id="topbar-actions-hud">
        {/* NOTIFICATIONS BELL WITH BADGE */}
        <div className="relative">
          <button
            id="topbar-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl bg-[#0a2246]/60 hover:bg-[#0d3060] text-stone-300 hover:text-[#F3CF65] border border-[#E5B842]/20 transition-all cursor-pointer relative focus:outline-none hover:scale-105 active:scale-95 ${
              isBellRinging ? "animate-bell-glow border-[#F3CF65] text-[#F3CF65]" : ""
            }`}
            aria-label="View notifications"
            title="Notifications"
          >
            {/* Subtle swinging animation when notification arrives */}
            <Bell className={`w-4 h-4 ${isBellRinging ? "animate-bell-ring text-[#F3CF65]" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#E5B842] text-[#06162c] font-mono font-black text-[10px] rounded-full flex items-center justify-center border border-[#06162c] shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* DESKTOP NOTIFICATION POPOVER */}
          {showNotifications && (
            <div
              id="topbar-notifications-dropdown"
              className="hidden sm:block absolute right-0 top-12 w-88 sm:w-96 bg-[#0a2246] border border-[#E5B842]/40 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-left font-sans backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#0d3060]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F3CF65]" />
                  <span className="font-serif font-bold text-sm text-white">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3CF65] text-[#06162c]">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      All caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0d3060] hover:bg-[#134080] text-[11px] font-mono font-bold text-[#F3CF65] border border-[#E5B842]/30 cursor-pointer active:scale-95 transition-all"
                      title="Mark all notifications as read with green checkmarks"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark All as Read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Section Updates Status Banner */}
              <div className="mt-2 mb-1 px-2.5 py-1.5 bg-[#081a33] border border-[#0d3060] rounded-xl flex items-center justify-between gap-1 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 min-w-0 text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate">Auto-Alerts: 28 FB • Sabbath School</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => simulateLiveSectionUpdate("28-fundamentals")}
                    title="Simulate a 28 Fundamentals live update notification"
                    className="px-1.5 py-0.5 rounded bg-[#0d3060] hover:bg-[#134080] text-[#F3CF65] hover:text-white cursor-pointer font-bold"
                  >
                    + 28 FB
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateLiveSectionUpdate("sabbath-school")}
                    title="Simulate a Sabbath School lesson live update notification"
                    className="px-1.5 py-0.5 rounded bg-[#0d3060] hover:bg-[#134080] text-[#F3CF65] hover:text-white cursor-pointer font-bold"
                  >
                    + SS Lesson
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-[#0d3060]/70 max-h-80 overflow-y-auto my-2 space-y-1 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotification(item)}
                      className={`group p-3 rounded-xl transition-all cursor-pointer border ${
                        item.read
                          ? "bg-[#081b38]/60 border-transparent hover:bg-[#0d3060]/50 hover:border-[#0d3060]"
                          : "bg-[#0d3060]/80 border-[#E5B842]/30 hover:border-[#F3CF65]/60 hover:bg-[#0d3060]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="p-1 rounded-md bg-[#06162c] shrink-0 border border-[#E5B842]/20">
                            {getCategoryIcon(item.category)}
                          </span>
                          <span className="font-serif font-bold text-xs text-stone-200 truncate group-hover:text-[#F3CF65] transition-colors">
                            {item.title}
                          </span>
                        </div>

                        {/* Read status with Small Green Check Mark, or New Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.read ? (
                            <span
                              className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.5 rounded-full"
                              title="Read • Retained for 7 days"
                            >
                              <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                              <span>Read</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#F3CF65] bg-[#F3CF65]/15 border border-[#F3CF65]/40 px-1.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F3CF65] animate-ping" />
                              <span>New</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-stone-400 whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 font-sans mt-1 leading-snug pl-6">
                        {item.description}
                      </p>

                      {/* Direct Link Action prompt */}
                      <div className="mt-2 pl-6 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#F3CF65] group-hover:text-amber-200 group-hover:underline">
                          <span>{item.linkText || "Open Section"}</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                        {item.read && (
                          <span className="text-[9px] font-mono text-stone-500">
                            Visible for 7 days
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer with Test Bell & Close */}
              <div className="pt-2.5 border-t border-[#0d3060] flex justify-between items-center text-[11px] font-mono text-stone-400">
                <button
                  type="button"
                  onClick={handleTriggerTestNotification}
                  className="flex items-center gap-1 text-[10px] text-[#F3CF65] hover:underline cursor-pointer"
                  title="Simulate a new incoming notification to test ringing sound and animation"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Test Bell Chime</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="px-2 py-0.5 rounded-md bg-[#06162c] text-stone-300 hover:text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* MOBILE FULL-SCREEN NOTIFICATION CENTER OVERLAY (PORTAL TO BODY TO COMPLETELY COVER SCREEN) */}
          {showNotifications && typeof document !== "undefined" && createPortal(
            <div
              id="mobile-fullscreen-notifications-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Notifications Center"
              className="sm:hidden fixed inset-0 w-screen h-screen h-[100dvh] z-[999999] bg-[#06162c] flex flex-col text-left overflow-hidden m-0 p-0 border-0"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100dvh",
                zIndex: 999999,
                backgroundColor: "#06162c",
                opacity: 1
              }}
            >
              {/* Mobile Full-Screen Header */}
              <div className="pt-[max(12px,env(safe-area-inset-top,12px))] pb-3.5 px-4 bg-[#0a2246] border-b border-[#E5B842]/30 flex items-center justify-between shrink-0 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#0d3060] border border-[#E5B842]/40 text-[#F3CF65] shadow-xs">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-base text-white leading-tight">
                      Notifications
                    </h2>
                    <p className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                      {unreadCount > 0
                        ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                        : "All notifications read"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d3060] hover:bg-[#134080] text-stone-200 hover:text-white border border-[#E5B842]/30 cursor-pointer active:scale-95 transition-all shadow-sm"
                  aria-label="Close Notifications"
                >
                  <span className="text-xs font-mono font-semibold">Close</span>
                  <X className="w-4 h-4 text-[#F3CF65]" />
                </button>
              </div>

              {/* Mobile Action Bar: Mark All Read & Test Bell */}
              <div className="px-4 py-2 bg-[#081a33] border-b border-[#0d3060] flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d3060] text-xs font-mono font-bold text-[#F3CF65] border border-[#E5B842]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark All Read</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => simulateLiveSectionUpdate("28-fundamentals")}
                    className="px-2 py-1.5 rounded-lg bg-[#0a2246] text-[#F3CF65] text-[11px] font-mono font-bold border border-[#0d3060] active:scale-95 cursor-pointer"
                    title="Simulate 28 Fundamentals live update"
                  >
                    + 28 FB
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateLiveSectionUpdate("sabbath-school")}
                    className="px-2 py-1.5 rounded-lg bg-[#0a2246] text-[#F3CF65] text-[11px] font-mono font-bold border border-[#0d3060] active:scale-95 cursor-pointer"
                    title="Simulate Sabbath School lesson live update"
                  >
                    + SS
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerTestNotification}
                    className="flex items-center gap-1 p-2 rounded-lg bg-[#0a2246] text-stone-300 text-[11px] font-mono font-semibold border border-[#0d3060] active:scale-95 cursor-pointer"
                    title="Test Bell Ringing Sound"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#F3CF65]" />
                  </button>
                </div>
              </div>

              {/* Mobile Live Section Update Indicator Bar */}
              <div className="px-4 py-1.5 bg-[#061224] border-b border-[#0d3060]/70 flex items-center justify-between text-[10px] font-mono text-stone-300 shrink-0">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Section Updates: Monitoring Active
                </span>
                <span className="text-stone-400">28 FB • Sabbath School</span>
              </div>

              {/* Mobile Notification Full-Screen Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#06162c] overscroll-contain">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center text-stone-400 text-sm font-sans flex flex-col items-center justify-center">
                    <Bell className="w-10 h-10 text-stone-600 mb-3 stroke-[1.5]" />
                    <span>No active notifications.</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotification(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                        item.read
                          ? "bg-[#0a2246]/60 border-[#0d3060]"
                          : "bg-[#0a2246] border-[#E5B842]/40 shadow-lg shadow-black/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#06162c] border border-[#E5B842]/20">
                            {getCategoryIcon(item.category)}
                          </span>
                          <span className="font-serif font-bold text-sm text-white">
                            {item.title}
                          </span>
                        </div>

                        {/* Read status with Small Green Check Mark */}
                        {item.read ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded-full shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                            <span>Read</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#F3CF65] bg-[#F3CF65]/15 border border-[#F3CF65]/40 px-2 py-0.5 rounded-full shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F3CF65] animate-ping" />
                            <span>New</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-300 font-sans mt-2 leading-relaxed pl-8">
                        {item.description}
                      </p>

                      <div className="mt-3 pl-8 flex items-center justify-between pt-2.5 border-t border-[#0d3060]/60">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#F3CF65]">
                          <span>{item.linkText || "Open Section"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-stone-400">
                            {item.time}
                          </span>
                          {item.read && (
                            <span className="text-[9px] font-mono text-stone-500">
                              • 7d retention
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mobile Full Screen Footer */}
              <div className="p-4 pb-[max(16px,env(safe-area-inset-bottom,16px))] bg-[#0a2246] border-t border-[#0d3060] flex items-center justify-between text-xs font-mono text-stone-400 shrink-0 shadow-2xl">
                <span className="text-[10px] text-stone-400">Read items retained 7 days</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0d3060] hover:bg-[#134080] text-white font-bold cursor-pointer active:scale-95 transition-all border border-[#E5B842]/30 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Back to Study</span>
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* PROFILE PICTURE USER AVATAR */}
        <Link
          to="/profile"
          id="topbar-profile-avatar"
          className="flex items-center pl-1 focus:outline-none group"
          title="Account Profile & Settings"
        >
          <div className="w-8.5 h-8.5 rounded-full bg-[#0a2246] text-[#F3CF65] ring-2 ring-[#E5B842]/50 group-hover:ring-[#F3CF65] transition-all flex items-center justify-center font-serif text-xs font-bold overflow-hidden shadow-sm">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user?.name || "User"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;

