/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAccount, Track, Scripture } from "../types";
import { saveProfileToSupabase, fetchProfileFromSupabase } from "../lib/notebookSync";

interface AppContextType {
  user: UserAccount | null;
  setUser: (u: UserAccount | null) => void;
  completedVerseIds: string[];
  addCompletedVerseId: (id: string) => void;
  selectedTrackId: string;
  setSelectedTrackId: (id: string) => void;
  trackStatsAllowed: boolean;
  verifyUserEmail: (code?: string) => Promise<boolean>;
  favoriteScriptures: Scripture[];
  toggleFavoriteScriptures: (scripture: Scripture) => void;
  isFavoriteScripture: (id: string) => boolean;
  updateFavoriteScriptureNotes: (id: string, notes: string) => void;
  activeConfetti: { active: boolean; reason: 'notebook' | 'track' | 'search' | 'recall' | 'teach' | ''; message: string } | null;
  showConfetti: (reason: 'notebook' | 'track' | 'search' | 'recall' | 'teach', customMsg?: string) => void;
  closeConfetti: () => void;
  isBottomBarVisible: boolean;
  setIsBottomBarVisible: (visible: boolean) => void;
  resetBottomBarTimer: (delay?: number) => void;
  logOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Zero-out routine: runs immediately on first load to wipe legacy mock data/scores and reset cleanly.
  useEffect(() => {
    const isZeroed = localStorage.getItem("stba_db_zeroed_v4");
    if (!isZeroed) {
      localStorage.removeItem("stba_user_profile");
      localStorage.removeItem("stba_completed_verses");
      localStorage.removeItem("stba_tracks_progress");
      localStorage.removeItem("stba_reflections");
      localStorage.removeItem("stba_reflections_detailed");
      localStorage.removeItem("stba_ss_is_imported");
      localStorage.removeItem("stba_ss_daily_lessons");
      localStorage.removeItem("stba_ss_deck_cards");
      localStorage.removeItem("stba_memory_vault_list");
      localStorage.setItem("stba_db_zeroed_v4", "true");
    }
  }, []);

  const [user, setUserState] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("stba_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    // Start as unauthenticated (null) by default as requested.
    return null;
  });

  const [completedVerseIds, setCompletedVerseIds] = useState<string[]>(() => {
    const savedUser = localStorage.getItem("stba_user_profile");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.emailVerified) {
          const saved = localStorage.getItem("stba_completed_verses");
          if (saved) {
            return JSON.parse(saved);
          }
        }
      } catch (e) {}
    }
    // Default stats are zeroed out initially
    return [];
  });

  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    return localStorage.getItem("stba_selected_track") || "fundamental-beliefs";
  });

  const [favoriteScriptures, setFavoriteScriptures] = useState<Scripture[]>(() => {
    const saved = localStorage.getItem("stba_favorite_scriptures");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const toggleFavoriteScriptures = (scripture: Scripture) => {
    setFavoriteScriptures((prev) => {
      const exists = prev.some((s) => s.id === scripture.id);
      let next;
      if (exists) {
        next = prev.filter((s) => s.id !== scripture.id);
      } else {
        next = [...prev, scripture];
      }
      localStorage.setItem("stba_favorite_scriptures", JSON.stringify(next));
      return next;
    });
  };

  const isFavoriteScripture = (id: string) => {
    return favoriteScriptures.some((s) => s.id === id);
  };

  const updateFavoriteScriptureNotes = (id: string, notes: string) => {
    setFavoriteScriptures((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, notes } : s);
      localStorage.setItem("stba_favorite_scriptures", JSON.stringify(next));
      return next;
    });
  };

  const setUser = (u: UserAccount | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("stba_user_profile", JSON.stringify(u));
      if (!u.isGuest) {
        saveProfileToSupabase(u);
      }
    } else {
      localStorage.removeItem("stba_user_profile");
      localStorage.removeItem("stba_completed_verses");
      localStorage.removeItem("stba_tracks_progress");
      localStorage.removeItem("stba_reflections");
      localStorage.removeItem("stba_reflections_detailed");
      localStorage.removeItem("stba_ss_is_imported");
      localStorage.removeItem("stba_ss_daily_lessons");
      localStorage.removeItem("stba_ss_deck_cards");
      localStorage.removeItem("stba_memory_vault_list");
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("stba_ss_welcomed");
          Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith("stba_ss_welcomed")) {
              sessionStorage.removeItem(k);
            }
          });
        }
      } catch (e) {}
      setCompletedVerseIds([]);
    }
  };

  // Fetch permanent profile and settings from Supabase on load
  useEffect(() => {
    const loadProfile = async () => {
      const saved = localStorage.getItem("stba_user_profile");
      if (saved) {
        try {
          const profileLocal = JSON.parse(saved);
          if (profileLocal && !profileLocal.isGuest) {
            const profileRemote = await fetchProfileFromSupabase();
            if (profileRemote) {
              setUserState(profileRemote);
              localStorage.setItem("stba_user_profile", JSON.stringify(profileRemote));
              // Trigger a state reload if settings changed
              window.dispatchEvent(new Event("stba_voice_changed"));
            }
          }
        } catch (e) {
          console.error("Error loading remote profile:", e);
        }
      }
    };
    loadProfile();
  }, []);

  const addCompletedVerseId = (id: string) => {
    // Only capture and track stat information after signup and email verification
    if (!user || !user.emailVerified) {
      console.warn("STBA Guardian: Stats tracking blocked. Email verification is required.");
      return;
    }
    setCompletedVerseIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("stba_completed_verses", JSON.stringify(next));
      return next;
    });
  };

  // Real and simulated email verification checking
  const verifyUserEmail = async (code?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code })
      });
      if (response.ok) {
        const payload = await response.json();
        const updatedUser = { ...user, emailVerified: true };
        setUser(updatedUser);
        
        // Re-align or load completed verse indices if they were in transition
        const saved = localStorage.getItem("stba_completed_verses");
        if (saved) {
          try {
            setCompletedVerseIds(JSON.parse(saved));
          } catch (err) {}
        }
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn("[STBA AUTH] Verification failed:", errData.error || "Invalid response");
        return false;
      }
    } catch (e) {
      console.error("[STBA AUTH MODULE] Email verification dispatch failed:", e);
      return false;
    }
  };

  const [activeConfetti, setActiveConfetti] = useState<{ active: boolean; reason: 'notebook' | 'track' | 'search' | 'recall' | 'teach' | ''; message: string } | null>(null);

  const showConfetti = (reason: 'notebook' | 'track' | 'search' | 'recall' | 'teach', customMsg?: string) => {
    const storageKey = `stba_first_${reason}_celebrated`;
    const alreadyCelebrated = localStorage.getItem(storageKey);
    if (alreadyCelebrated === "true") {
      return;
    }

    localStorage.setItem(storageKey, "true");

    let message = customMsg || "";
    if (!message) {
      switch (reason) {
        case 'notebook':
          message = "Praise God! You have established your very first Scripture Notebook! This holy journal will serve as a sanctuary for your exegetical observations, deep-dives into biblical covenants, and reflections on the character of God.";
          break;
        case 'track':
          message = "Congratulations! You have completed your first discipleship Study Track! By systematically mastering these lessons, you are arming your mind with defensive truths to stand firm and share God's everlasting gospel with a searching world.";
          break;
        case 'search':
          message = "Amen! You have completed your first active Scripture Search in the STBA Word engine! Navigating line-upon-line, here a little and there a little, is how we allow God's word to unfold and guide our paths.";
          break;
        case 'recall':
          message = "Incredible work! You have completed your first Verbatim Active Recall session! Committing the precise Word of God to the storage of your memory is the ultimate defensive armor in times of distress and trial.";
          break;
        case 'teach':
          message = "Hallelujah! You have finished your first Teach It training session! Guiding others, preparing outlines, and explaining the sanctuary, Sabbath, or salvation in clear ways is how we fulfill the commission to 'teach others who will teach others'.";
          break;
      }
    }

    setActiveConfetti({
      active: true,
      reason,
      message
    });
  };

  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const bottomBarTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetBottomBarTimer = (delay = 4000) => {
    if (bottomBarTimerRef.current) clearTimeout(bottomBarTimerRef.current);
    bottomBarTimerRef.current = setTimeout(() => {
      setIsBottomBarVisible(false);
    }, delay);
  };

  const closeConfetti = () => {
    setActiveConfetti(null);
  };

  useEffect(() => {
    localStorage.setItem("stba_selected_track", selectedTrackId);
  }, [selectedTrackId]);

  // Derive variable checking if profile is active and verified
  const trackStatsAllowed = !!(user && user.emailVerified);

  const logOut = () => {
    setUser(null);
    localStorage.removeItem("stba_user_profile");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        completedVerseIds,
        addCompletedVerseId,
        selectedTrackId,
        setSelectedTrackId,
        trackStatsAllowed,
        verifyUserEmail,
        favoriteScriptures,
        toggleFavoriteScriptures,
        isFavoriteScripture,
        updateFavoriteScriptureNotes,
        activeConfetti,
        showConfetti,
        closeConfetti,
        isBottomBarVisible,
        setIsBottomBarVisible,
        resetBottomBarTimer,
        logOut
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
