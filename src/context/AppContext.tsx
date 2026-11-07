/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserAccount, Track, Scripture, SubscriptionTier } from "../types";
import { saveProfileToSupabase, fetchProfileFromSupabase } from "../lib/notebookSync";

export interface UpgradeModalState {
  isOpen: boolean;
  requiredTier: "Scholar" | "Leader";
  featureName?: string;
}

interface AppContextType {
  user: UserAccount | null;
  setUser: (u: UserAccount | null) => void;
  userTier: SubscriptionTier;
  setUserTier: (tier: SubscriptionTier, billingCycle?: "monthly" | "annual") => void;
  hasTierAccess: (requiredTier: SubscriptionTier) => boolean;
  upgradeModalState: UpgradeModalState;
  openUpgradeModal: (requiredTier?: "Scholar" | "Leader", featureName?: string) => void;
  closeUpgradeModal: () => void;
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

const TIER_RANK: Record<SubscriptionTier, number> = {
  Beginner: 0,
  Scholar: 1,
  Leader: 2,
};

function normalizeTier(raw?: string | null): SubscriptionTier {
  if (!raw) return "Beginner";
  const lower = raw.toLowerCase();
  if (lower.includes("leader")) return "Leader";
  if (lower.includes("scholar")) return "Scholar";
  return "Beginner";
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
    return null;
  });

  // Strict subscription tier resolution: only honor verified paid entitlement or explicit profile tier; default strictly to "Beginner"
  const [userTier, setUserTierState] = useState<SubscriptionTier>(() => {
    try {
      const entitlementRaw = localStorage.getItem("stba_tier_entitlement_v1");
      if (entitlementRaw) {
        const entitlement = JSON.parse(entitlementRaw);
        if (entitlement && entitlement.verified === true && (entitlement.tier === "Scholar" || entitlement.tier === "Leader")) {
          return entitlement.tier;
        }
      }
      const savedProfile = localStorage.getItem("stba_user_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.tier && (parsed.tier === "Scholar" || parsed.tier === "Leader")) {
          return parsed.tier;
        }
      }
    } catch (e) {}
    localStorage.setItem("stba_user_tier", "beginner");
    return "Beginner";
  });

  const [upgradeModalState, setUpgradeModalState] = useState<UpgradeModalState>({
    isOpen: false,
    requiredTier: "Scholar",
    featureName: undefined,
  });

  const setUserTier = useCallback((tier: SubscriptionTier, billingCycle: "monthly" | "annual" = "monthly") => {
    const normalized = normalizeTier(tier);
    setUserTierState(normalized);
    localStorage.setItem("stba_user_tier", normalized.toLowerCase());

    const entitlement = {
      tier: normalized,
      verified: normalized !== "Beginner",
      billingCycle,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("stba_tier_entitlement_v1", JSON.stringify(entitlement));

    setUserState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, tier: normalized };
      localStorage.setItem("stba_user_profile", JSON.stringify(updated));
      if (!updated.isGuest) {
        if (typeof navigator !== "undefined" && navigator.onLine) {
          saveProfileToSupabase(updated);
        } else {
          localStorage.setItem("stba_pending_tier_sync", JSON.stringify(entitlement));
        }
      }
      return updated;
    });

    window.dispatchEvent(new CustomEvent("stba-tier-updated", { detail: { tier: normalized } }));
  }, []);

  const hasTierAccess = useCallback(
    (requiredTier: SubscriptionTier): boolean => {
      return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
    },
    [userTier]
  );

  const openUpgradeModal = useCallback((requiredTier: "Scholar" | "Leader" = "Scholar", featureName?: string) => {
    setUpgradeModalState({
      isOpen: true,
      requiredTier,
      featureName,
    });
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Listen globally for 'open-stba-upgrade-modal' custom events & offline-to-online tier sync
  useEffect(() => {
    const handleOpenUpgradeEvent = (evt: Event) => {
      const customEvt = evt as CustomEvent<{ requiredTier?: "Scholar" | "Leader"; featureName?: string }>;
      const reqTier = customEvt.detail?.requiredTier || "Scholar";
      const feat = customEvt.detail?.featureName;
      openUpgradeModal(reqTier, feat);
    };

    const handleOnlineSync = () => {
      try {
        const pendingSync = localStorage.getItem("stba_pending_tier_sync");
        const savedProfile = localStorage.getItem("stba_user_profile");
        if (pendingSync && savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && !parsedProfile.isGuest) {
            saveProfileToSupabase(parsedProfile);
            localStorage.removeItem("stba_pending_tier_sync");
          }
        }
      } catch (e) {}
    };

    window.addEventListener("open-stba-upgrade-modal", handleOpenUpgradeEvent);
    window.addEventListener("online", handleOnlineSync);
    return () => {
      window.removeEventListener("open-stba-upgrade-modal", handleOpenUpgradeEvent);
      window.removeEventListener("online", handleOnlineSync);
    };
  }, [openUpgradeModal]);

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
      if (u.tier) {
        const normalized = normalizeTier(u.tier);
        setUserTierState(normalized);
        localStorage.setItem("stba_user_tier", normalized.toLowerCase());
      }
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
      localStorage.removeItem("stba_tier_entitlement_v1");
      localStorage.setItem("stba_user_tier", "beginner");
      setUserTierState("Beginner");
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
              if (profileRemote.tier) {
                const remoteTier = normalizeTier(profileRemote.tier);
                setUserTierState(remoteTier);
                localStorage.setItem("stba_user_tier", remoteTier.toLowerCase());
              }
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

  const verifyUserEmail = async (code?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code })
      });
      if (response.ok) {
        await response.json();
        const updatedUser = { ...user, emailVerified: true };
        setUser(updatedUser);
        
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
        userTier,
        setUserTier,
        hasTierAccess,
        upgradeModalState,
        openUpgradeModal,
        closeUpgradeModal,
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

