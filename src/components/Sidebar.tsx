/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  List,
  Compass,
  Brain,
  GraduationCap,
  FileText,
  Calendar,
  Headphones,
  HelpCircle,
  Ticket,
  Info,
  X,
  Settings,
  Sparkles,
  ArrowRight,
  BookMarked,
  LogOut
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useSabbathMode } from "../context/SabbathMode";
import { STBA_LOGO_URL } from "../assets/branding";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobileDrawer?: boolean;
  isDesktopFixed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  isMobileDrawer = false,
  isDesktopFixed = false
}) => {
  const { user, logOut } = useApp();
  const { sabbathMode } = useSabbathMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isPathActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "NB";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const primaryStudyModes = [
    { label: "Home / Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Bible Study", path: "/stba", icon: BookOpen },
    { label: "Study Tracks", path: "/tracks", icon: List },
    { label: "Doctrine Navigator", path: "/doctrine", icon: Compass },
    { label: "Active Recall", path: "/recall", icon: Brain },
    { label: "Teach It", path: "/teach", icon: GraduationCap },
    { label: "Notebook", path: "/notebook", icon: FileText },
    { label: "Sabbath School", path: "/sabbath-school", icon: Calendar }
  ];

  const supportLinks = [
    {
      label: "Support",
      icon: Headphones,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-stba-support-modal"));
        onClose?.();
      }
    },
    {
      label: "FAQs",
      icon: HelpCircle,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-stba-faq-modal"));
        onClose?.();
      }
    },
    {
      label: "Submit Ticket",
      icon: Ticket,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-stba-ticket-modal"));
        onClose?.();
      }
    },
    {
      label: "Help Center",
      icon: Info,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-stba-help-center-modal"));
        onClose?.();
      }
    }
  ];

  return (
    <aside
      id="stba-slideout-sidebar"
      className={`h-full w-full bg-[#06162c] flex flex-col justify-between select-none text-left relative z-40 overflow-y-auto ${
        isDesktopFixed ? "border-r border-[#E5B842]/15" : isMobileDrawer ? "p-0" : "border-r border-[#E5B842]/20"
      }`}
    >
      {/* HEADER: LOGO BRAND & CLOSE BUTTON (HIDDEN IF DESKTOP FIXED WITH TOPBAR) */}
      {!isDesktopFixed && (
        <div className="p-4 sm:p-5 border-b border-[#E5B842]/15 flex items-center justify-between shrink-0 bg-[#0a2246]/60 backdrop-blur-md">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center space-x-3 group focus:outline-none"
            id="sidebar-brand-header"
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-[#E5B842]/50 group-hover:ring-[#F3CF65] p-0.5 bg-[#0a2246] overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={STBA_LOGO_URL}
                alt="STBA Seal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-[#F3CF65] text-lg tracking-tight leading-none group-hover:text-amber-200">
                STBA
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#94A3B8] font-bold leading-none mt-1">
                Study To Be Approved™
              </span>
            </div>
          </Link>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#0a2246] text-stone-300 hover:text-white hover:bg-[#0d3060] border border-[#E5B842]/20 transition-colors cursor-pointer"
              aria-label="Close Sidebar"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* BODY: STUDY MODES & SUPPORT DIRECTORY */}
      <div className="p-3 sm:p-4 space-y-5 flex-1 overflow-y-auto">
        {/* PRIMARY STUDY MODES */}
        <div
          className="space-y-1.5"
          id="sidebar-primary-modes-list"
          onMouseLeave={() => setHoveredId(null)}
        >
          {primaryStudyModes.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredId === item.path;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                onMouseEnter={() => setHoveredId(item.path)}
                onFocus={() => setHoveredId(item.path)}
                className={({ isActive: navLinkActive }) => {
                  const isActive = navLinkActive || isPathActive(item.path);
                  return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-sans transition-all duration-150 focus:outline-none border-2 ${
                    isActive
                      ? "bg-gradient-to-r from-[#F9E79F] via-[#F3CF65] to-[#C9973A] text-[#06162c] border-[#F3CF65] font-bold shadow-[0_2px_12px_rgba(243,207,101,0.35)] scale-[1.01]"
                      : isHovered
                      ? "border-[#F3CF65] text-[#F3CF65] bg-[#0a2246]/70 shadow-[0_0_14px_rgba(243,207,101,0.25)] font-semibold scale-[1.01]"
                      : "border-transparent text-stone-300 bg-transparent font-medium hover:text-[#F3CF65]"
                  }`;
                }}
                id={`sidebar-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              >
                {({ isActive: navLinkActive }) => {
                  const isActive = navLinkActive || isPathActive(item.path);
                  return (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-[#06162c] stroke-[2.2]"
                            : isHovered
                            ? "text-[#F3CF65]"
                            : "text-stone-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#E5B842]/20 to-transparent my-3" />

        {/* SUPPORT / HELP MENU */}
        <div
          className="space-y-1"
          id="sidebar-support-links-list"
          onMouseLeave={() => setHoveredId(null)}
        >
          <span className="px-3.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold block mb-1">
            Assistance & Help
          </span>
          {supportLinks.map((item) => {
            const Icon = item.icon;
            const isHighlighted = hoveredId === item.label;

            return (
              <button
                key={item.label}
                onClick={item.action}
                onMouseEnter={() => setHoveredId(item.label)}
                onFocus={() => setHoveredId(item.label)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all duration-150 text-left cursor-pointer focus:outline-none border-2 ${
                  isHighlighted
                    ? "border-[#F3CF65] text-[#F3CF65] bg-[#0a2246]/70 shadow-[0_0_14px_rgba(243,207,101,0.25)] font-bold scale-[1.01]"
                    : "border-transparent text-stone-300 bg-transparent font-medium hover:text-[#F3CF65]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isHighlighted ? "text-[#F3CF65]" : "text-stone-400"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* "GROW DEEPER. TEACH BETTER. LIVE STRONGER." FEATURE CARD */}
        <div
          id="sidebar-grow-deeper-card"
          className="p-4 rounded-2xl glass-card relative overflow-hidden space-y-2.5 text-center sheen-overlay"
        >
          {/* Subtle golden top radiance */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F3CF65] to-transparent opacity-90" />
          
          <div className="w-10 h-10 mx-auto rounded-full bg-[#E5B842]/15 border border-[#E5B842]/40 flex items-center justify-center text-[#F3CF65] shadow-inner">
            <BookMarked className="w-5 h-5" />
          </div>

          <div>
            <h4 className="font-serif font-black text-sm text-white leading-tight">
              Grow Deeper.
              <br />
              Teach Better.
              <br />
              <span className="text-[#F3CF65]">Live Stronger.</span>
            </h4>
          </div>

          <button
            onClick={() => {
              navigate("/tracks");
              onClose?.();
            }}
            className="w-full py-2 px-3 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Explore STBA Features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FOOTER: USER ACCOUNT PROFILE */}
      <div className="p-3.5 border-t border-[#E5B842]/15 bg-[#0a2246]/40 flex items-center justify-between shrink-0">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 min-w-0 group"
          id="sidebar-profile-footer-link"
        >
          <div className="w-8 h-8 rounded-full bg-[#0a2246] text-[#F3CF65] ring-1 ring-[#E5B842]/40 flex items-center justify-center font-serif text-xs font-bold shrink-0 overflow-hidden">
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
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-stone-200 group-hover:text-white truncate leading-tight">
              {user?.name || "Noble Berean"}
            </span>
            <span className="text-[9px] font-mono text-[#F3CF65] uppercase font-semibold">
              Mastery Scholar
            </span>
          </div>
        </Link>

        <Link
          to="/profile"
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-[#F3CF65] hover:bg-[#0a2246] transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
};
export default Sidebar;
