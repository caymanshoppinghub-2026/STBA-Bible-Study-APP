/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { playNotificationBellRingSound } from "./audioFeedback";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  createdAt: number;
  read: boolean;
  readAt?: number;
  link: string;
  linkText?: string;
  category?: "sabbath-school" | "recall" | "teaching" | "doctrine" | "system";
}

const STORAGE_KEY = "stba_user_notifications_v1";
export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Default seed notifications for discipleship workflow
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-ss-1",
    title: "Sabbath School Lesson Ready",
    description: "Lesson 9: The Heavenly Sanctuary & The Investigative Judgment study notes and exegesis are available.",
    time: "10m ago",
    createdAt: Date.now() - 10 * 60 * 1000,
    read: false,
    link: "/sabbath-school",
    linkText: "Open Sabbath School Mode",
    category: "sabbath-school"
  },
  {
    id: "notif-recall-2",
    title: "Daily Recall Milestone",
    description: "You're 2 verses away from your daily Scripture retention target. Strengthen your memory today!",
    time: "2h ago",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
    link: "/recall",
    linkText: "Launch Active Recall",
    category: "recall"
  },
  {
    id: "notif-teach-3",
    title: "New Teaching Released",
    description: "“The New Covenant — God's Everlasting Promise” exegesis outline is now live in STBA Study.",
    time: "1d ago",
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    read: false,
    link: "/stba",
    linkText: "Open STBA Study",
    category: "teaching"
  },
  {
    id: "notif-doc-4",
    title: "Doctrine Navigator Study",
    description: "Deepen your exegesis on Revelation 14:6-12 and the Three Angels' Messages with Scripture references.",
    time: "2d ago",
    createdAt: Date.now() - 48 * 60 * 60 * 1000,
    read: false,
    link: "/doctrine",
    linkText: "Explore Doctrine",
    category: "doctrine"
  }
];

/**
 * Filter out read notifications that have passed the 1-week retention period.
 * Read notifications remain visible for 7 days, after which they disappear automatically.
 */
function pruneExpiredNotifications(list: AppNotification[]): AppNotification[] {
  const now = Date.now();
  return list.filter((item) => {
    if (!item.read) return true; // Unread notifications remain visible indefinitely
    const readTimestamp = item.readAt || item.createdAt;
    return now - readTimestamp < ONE_WEEK_MS; // Retain read notifications for ~1 week
  });
}

/**
 * Retrieve current notifications from localStorage, pruning any read notifications older than 1 week.
 */
export function getStoredNotifications(): AppNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }

    const parsed: AppNotification[] = JSON.parse(raw);
    const pruned = pruneExpiredNotifications(parsed);

    // If any expired notifications were filtered out, update localStorage
    if (pruned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    }

    return pruned;
  } catch (err) {
    console.error("Error reading stored notifications:", err);
    return DEFAULT_NOTIFICATIONS;
  }
}

/**
 * Save notifications list to localStorage and broadcast change event
 */
function saveNotifications(list: AppNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("stba-notifications-changed", { detail: list }));
  } catch (err) {
    console.error("Error saving notifications:", err);
  }
}

/**
 * Mark a specific notification as read. Places green checkmark status and records readAt timestamp.
 */
export function markNotificationAsRead(id: string): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => {
    if (n.id === id) {
      return {
        ...n,
        read: true,
        readAt: n.readAt || Date.now()
      };
    }
    return n;
  });
  saveNotifications(updated);
  return updated;
}

/**
 * Mark all notifications as read.
 * Places a small green checkmark next to each notification and keeps them visible for 1 week.
 */
export function markAllNotificationsAsRead(): AppNotification[] {
  const current = getStoredNotifications();
  const now = Date.now();
  const updated = current.map((n) => ({
    ...n,
    read: true,
    readAt: n.readAt || now
  }));
  saveNotifications(updated);
  return updated;
}

/**
 * Add a new notification:
 * - Saves to localStorage
 * - Plays the resonant notification bell ringing chime sound
 * - Broadcasts events to trigger subtle bell swinging animation and UI updates
 */
export function addNotification(
  item: Omit<AppNotification, "id" | "createdAt" | "read" | "time"> & {
    time?: string;
  },
  options?: { playSound?: boolean }
): AppNotification {
  const current = getStoredNotifications();
  const now = Date.now();

  const newNotification: AppNotification = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    time: item.time || "Just now",
    read: false
  };

  const updated = [newNotification, ...current];
  saveNotifications(updated);

  // Play ringing sound if requested (default true)
  if (options?.playSound !== false) {
    try {
      playNotificationBellRingSound();
    } catch (e) {
      console.warn("Audio chime notice:", e);
    }
  }

  // Dispatch event specifically to trigger bell animation
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("stba-new-notification-arrived", {
        detail: newNotification
      })
    );
  }

  return newNotification;
}

/**
 * Helper to dispatch a simulated test notification for quick verification of
 * the ringing sound, subtle animation, direct links, and green checkmark.
 */
export function triggerTestNotification(type: "sabbath-school" | "recall" | "teaching" = "sabbath-school"): AppNotification {
  if (type === "sabbath-school") {
    return addNotification({
      title: "Sabbath School Lesson Live",
      description: "Lesson 9: The Heavenly Sanctuary — exegesis study notes, teacher helps, and golden verses are ready for review.",
      link: "/sabbath-school",
      linkText: "Open Sabbath School Mode",
      category: "sabbath-school"
    });
  } else if (type === "recall") {
    return addNotification({
      title: "Daily Memory Challenge",
      description: "“Study to shew thyself approved unto God” (2 Tim 2:15) is up for your spaced repetition review!",
      link: "/recall",
      linkText: "Launch Active Recall",
      category: "recall"
    });
  } else {
    return addNotification({
      title: "New STBA Berean Study Note",
      description: "A new doctrinal synthesis on Justification by Faith and the Law of God has been added.",
      link: "/stba",
      linkText: "Explore STBA Mode",
      category: "teaching"
    });
  }
}
