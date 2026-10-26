/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addNotification, AppNotification } from "./notificationsManager";
import { playNotificationBellRingSound } from "./audioFeedback";

export interface LiveContentRelease {
  id: string;
  sectionId: "28-fundamentals" | "sabbath-school" | "stba-study" | "recall" | "notebook" | "general";
  sectionName: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
  category: "doctrine" | "sabbath-school" | "recall" | "teaching" | "system";
  releaseTimestamp: number;
}

// LocalStorage key for tracking acknowledged live updates so we don't spam notifications on repeat reloads
const ACKNOWLEDGED_UPDATES_KEY = "stba_acknowledged_content_updates";

/**
 * Registry of live section updates.
 * Whenever an update to 28 Fundamentals, Sabbath School lessons, or STBA tracks
 * goes live, an entry here or a call to notifyLiveSectionUpdate() will automatically
 * generate a user notification with sound, animation, and direct navigation links.
 */
export const LIVE_SECTION_RELEASES: LiveContentRelease[] = [
  {
    id: "rel-fb-19-law-god",
    sectionId: "28-fundamentals",
    sectionName: "28 Fundamental Beliefs",
    title: "28 Fundamentals Update: The Law of God",
    description: "Belief #19 exegesis notes on Exodus 20, Romans 3:31, and the perpetuity of the moral law are now live.",
    link: "/doctrine",
    linkText: "Explore Belief #19",
    category: "doctrine",
    releaseTimestamp: Date.now() - 3600000 // 1 hour ago
  },
  {
    id: "rel-ss-corinthians-q3",
    sectionId: "sabbath-school",
    sectionName: "Sabbath School",
    title: "Sabbath School: New Lesson 'Love-driven Ministry' Live",
    description: "Quarterly lesson notes, Ellen G. White commentary, and discussion memory cards are now live.",
    link: "/sabbath-school",
    linkText: "Open Sabbath School",
    category: "sabbath-school",
    releaseTimestamp: Date.now() - 7200000 // 2 hours ago
  },
  {
    id: "rel-fb-24-sanctuary",
    sectionId: "28-fundamentals",
    sectionName: "28 Fundamental Beliefs",
    title: "28 Fundamentals Update: Christ in the Heavenly Sanctuary",
    description: "Belief #24 exegesis on Daniel 8:14, Hebrews 8–9, and the Investigative Judgment is now live with supporting scriptures.",
    link: "/doctrine",
    linkText: "Study Belief #24",
    category: "doctrine",
    releaseTimestamp: Date.now() - 14400000
  },
  {
    id: "rel-stba-prophetic-milestone",
    sectionId: "stba-study",
    sectionName: "STBA Exegesis Track",
    title: "STBA Track Live: Three Angels' Messages",
    description: "Line-upon-line study guide on Revelation 14:6–12, Babylon's fall, and the seal of God is now live.",
    link: "/stba",
    linkText: "Launch STBA Study",
    category: "teaching",
    releaseTimestamp: Date.now() - 28800000
  }
];

/**
 * Retrieve the list of update IDs that have already been acknowledged/notified
 */
export function getAcknowledgedUpdateIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACKNOWLEDGED_UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save an update ID to the acknowledged list
 */
export function markUpdateAsAcknowledged(updateId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getAcknowledgedUpdateIds();
    if (!current.includes(updateId)) {
      current.push(updateId);
      localStorage.setItem(ACKNOWLEDGED_UPDATES_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.warn("Failed to mark update as acknowledged:", err);
  }
}

export interface LiveSectionUpdateOptions {
  sectionId: "28-fundamentals" | "sabbath-school" | "stba-study" | "recall" | "notebook" | "general";
  sectionName: string;
  title: string;
  description: string;
  link: string;
  linkText?: string;
  category?: "doctrine" | "sabbath-school" | "recall" | "teaching" | "system";
  updateId?: string;
  playSound?: boolean;
}

/**
 * Broadcast an update for any key section (28 Fundamentals, Sabbath School, STBA, etc.)
 * Immediately:
 * 1. Creates an in-app notification
 * 2. Plays the resonant notification bell chime
 * 3. Dispatches the swinging bell animation
 * 4. Shows desktop notification if permitted
 */
export function notifyLiveSectionUpdate(options: LiveSectionUpdateOptions): AppNotification {
  const isNotificationsEnabled = typeof window !== "undefined"
    ? localStorage.getItem("stba_notifications_enabled") !== "false"
    : true;

  const isSectionAlertsEnabled = typeof window !== "undefined"
    ? localStorage.getItem("stba_section_updates_notifications") !== "false"
    : true;

  if (!isNotificationsEnabled || !isSectionAlertsEnabled) {
    // If disabled in settings, still register silent notification
  }

  // Create notification in system
  const notification = addNotification(
    {
      title: options.title,
      description: options.description,
      link: options.link,
      linkText: options.linkText || `View in ${options.sectionName}`,
      category: options.category || (options.sectionId === "28-fundamentals" ? "doctrine" : options.sectionId === "sabbath-school" ? "sabbath-school" : "teaching")
    },
    { playSound: options.playSound !== false }
  );

  // If updateId provided, acknowledge it so it won't duplicate
  if (options.updateId) {
    markUpdateAsAcknowledged(options.updateId);
  }

  // Dispatch browser desktop notification if granted
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`${options.sectionName} Live Update`, {
        body: `${options.title}: ${options.description}`,
        icon: "/favicon.ico",
        tag: `stba-update-${options.sectionId}-${Date.now()}`
      });
    } catch (e) {
      console.warn("Desktop notification dispatch skipped:", e);
    }
  }

  // Dispatch custom event for immediate UI awareness
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("stba-section-content-updated", {
        detail: { ...options, notification }
      })
    );
  }

  return notification;
}

/**
 * Check for newly live content releases and automatically generate notifications
 * for any that have not been delivered to the user yet.
 */
export function checkForLiveContentUpdates(): number {
  if (typeof window === "undefined") return 0;

  const isSectionAlertsEnabled = localStorage.getItem("stba_section_updates_notifications") !== "false";
  if (!isSectionAlertsEnabled) return 0;

  const acknowledged = getAcknowledgedUpdateIds();
  let newNotificationsCount = 0;

  // Check all releases in registry
  for (const release of LIVE_SECTION_RELEASES) {
    if (!acknowledged.includes(release.id)) {
      // New update went live! Generate user notification immediately
      notifyLiveSectionUpdate({
        sectionId: release.sectionId,
        sectionName: release.sectionName,
        title: release.title,
        description: release.description,
        link: release.link,
        linkText: release.linkText,
        category: release.category,
        updateId: release.id,
        playSound: true
      });
      newNotificationsCount++;
    }
  }

  return newNotificationsCount;
}

/**
 * Initialize background watcher for live section updates.
 * - Checks immediately on app launch
 * - Sets up a recurring check every 45 seconds
 * - Listens for cross-tab storage and update broadcast events
 */
export function initContentUpdatesWatcher(): () => void {
  if (typeof window === "undefined") return () => {};

  // First check on launch (delayed slightly so audio context is ready if user interacts)
  const initialTimer = setTimeout(() => {
    checkForLiveContentUpdates();
  }, 1200);

  // Background interval check every 45 seconds for freshly published updates
  const intervalId = setInterval(() => {
    checkForLiveContentUpdates();
  }, 45000);

  // Cross-tab and window focus sync: check whenever user returns to the tab
  const handleFocus = () => {
    checkForLiveContentUpdates();
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "stba_sabbath_school_state" || e.key === "stba_tracks_progress") {
      // Content updated in another window/tab
      checkForLiveContentUpdates();
    }
  };

  window.addEventListener("focus", handleFocus);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(intervalId);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("storage", handleStorageChange);
  };
}

/**
 * Test helper for user or developer to simulate a live update to any key section
 */
export function simulateLiveSectionUpdate(
  section: "28-fundamentals" | "sabbath-school" | "stba-study"
): AppNotification {
  if (section === "28-fundamentals") {
    const beliefNumbers = [
      { num: 19, title: "The Law of God", focus: "Exodus 20 & Romans 3:31" },
      { num: 20, title: "The Sabbath", focus: "Genesis 2:1-3 & Revelation 14:7" },
      { num: 24, title: "Christ's Ministry in the Heavenly Sanctuary", focus: "Daniel 8:14 & Hebrews 8" },
      { num: 25, title: "The Second Coming of Christ", focus: "1 Thessalonians 4:16-17 & Titus 2:13" },
      { num: 28, title: "The New Earth", focus: "Isaiah 65:17 & Revelation 21:1-4" }
    ];
    const picked = beliefNumbers[Math.floor(Math.random() * beliefNumbers.length)];

    return notifyLiveSectionUpdate({
      sectionId: "28-fundamentals",
      sectionName: "28 Fundamental Beliefs",
      title: `28 Fundamentals: Belief #${picked.num} (${picked.title}) Updated`,
      description: `New exegesis notes, supporting scriptures (${picked.focus}), and outline points have gone live.`,
      link: "/doctrine",
      linkText: "Study in Doctrine Navigator",
      category: "doctrine",
      playSound: true
    });
  } else if (section === "sabbath-school") {
    const lessons = [
      "Love-driven Ministry in Corinth",
      "The Ministry of Reconciliation",
      "Spiritual Gifts for Edification",
      "Comfort in All Our Tribulation",
      "The Heavenly Sanctuary and the Judgment"
    ];
    const picked = lessons[Math.floor(Math.random() * lessons.length)];

    return notifyLiveSectionUpdate({
      sectionId: "sabbath-school",
      sectionName: "Sabbath School",
      title: `Sabbath School Live: ${picked}`,
      description: `New lesson materials, Ellen G. White commentary, and classroom discussion cards are now active.`,
      link: "/sabbath-school",
      linkText: "Open Sabbath School",
      category: "sabbath-school",
      playSound: true
    });
  } else {
    return notifyLiveSectionUpdate({
      sectionId: "stba-study",
      sectionName: "STBA Exegesis Track",
      title: "STBA Prophetic Outline Live: Revelation 14",
      description: "Comprehensive exegesis of the Three Angels' Messages and the everlasting gospel has gone live.",
      link: "/stba",
      linkText: "Open STBA Study",
      category: "teaching",
      playSound: true
    });
  }
}
