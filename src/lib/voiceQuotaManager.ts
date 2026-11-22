/**
 * Monthly Live Voice Allowance & Upgrade Gate Middleware for Elder Stephen
 * Keeps Gemini 3.8 Live API costs predictable per subscription tier.
 */

const VOICE_USAGE_STORAGE_KEY = "stba_voice_usage_v1";

export type StbaSubscriptionTier = "Beginner" | "Scholar" | "Leader";

export const TIER_VOICE_LIMIT_MINUTES: Record<StbaSubscriptionTier, number> = {
  Beginner: 10, // Free tier: 10 mins/month trial of Elder Stephen Live Voice
  Scholar: 90,  // $9.99/mo tier: 90 mins/month (~$1.35 max API cost)
  Leader: 240,  // Leader tier: 240 mins/month (~$3.60 max API cost)
};

export interface VoiceQuotaStatus {
  tier: StbaSubscriptionTier;
  monthKey: string;
  usedSeconds: number;
  limitSeconds: number;
  remainingSeconds: number;
  usedMinutes: number;
  limitMinutes: number;
  remainingMinutes: number;
  percentUsed: number;
  isExhausted: boolean;
}

export function normalizeSubscriptionTier(rawTier?: string | null): StbaSubscriptionTier {
  const clean = String(rawTier || "").trim().toLowerCase();
  if (clean.includes("leader") || clean.includes("partner") || clean.includes("pastor")) {
    return "Leader";
  }
  if (clean.includes("scholar") || clean.includes("berean") || clean.includes("disciple")) {
    return "Scholar";
  }
  return "Beginner";
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function readStoredUsage(): { monthKey: string; usedSeconds: number } {
  const currentMonth = getCurrentMonthKey();
  try {
    const raw = localStorage.getItem(VOICE_USAGE_STORAGE_KEY);
    if (!raw) return { monthKey: currentMonth, usedSeconds: 0 };
    const parsed = JSON.parse(raw);
    if (parsed?.monthKey === currentMonth && Number.isFinite(Number(parsed.usedSeconds))) {
      return { monthKey: currentMonth, usedSeconds: Math.max(0, Number(parsed.usedSeconds)) };
    }
  } catch {}
  return { monthKey: currentMonth, usedSeconds: 0 };
}

export function getVoiceQuotaStatus(rawTier?: string | null): VoiceQuotaStatus {
  const resolvedTier = normalizeSubscriptionTier(
    rawTier || (typeof window !== "undefined" ? localStorage.getItem("stba_user_tier") : null)
  );
  const limitMinutes = TIER_VOICE_LIMIT_MINUTES[resolvedTier];
  const limitSeconds = limitMinutes * 60;
  const { monthKey, usedSeconds } = readStoredUsage();
  const remainingSeconds = Math.max(0, limitSeconds - usedSeconds);

  return {
    tier: resolvedTier,
    monthKey,
    usedSeconds,
    limitSeconds,
    remainingSeconds,
    usedMinutes: Math.round((usedSeconds / 60) * 10) / 10,
    limitMinutes,
    remainingMinutes: Math.ceil(remainingSeconds / 60),
    percentUsed: Math.min(100, Math.round((usedSeconds / limitSeconds) * 100)),
    isExhausted: remainingSeconds <= 0,
  };
}

export function consumeVoiceSeconds(seconds: number, rawTier?: string | null): VoiceQuotaStatus {
  const currentMonth = getCurrentMonthKey();
  const current = readStoredUsage();
  const nextSeconds = Math.max(0, current.usedSeconds + Math.max(0, seconds));

  try {
    localStorage.setItem(
      VOICE_USAGE_STORAGE_KEY,
      JSON.stringify({ monthKey: currentMonth, usedSeconds: nextSeconds })
    );
  } catch {}

  const status = getVoiceQuotaStatus(rawTier);
  try {
    window.dispatchEvent(new CustomEvent("stba-voice-quota-updated", { detail: status }));
  } catch {}

  return status;
}

export function getNextUpgradeTier(tier: StbaSubscriptionTier): "Scholar" | "Leader" {
  return tier === "Beginner" ? "Scholar" : "Leader";
}

export function checkVoiceAccessOrPromptUpgrade(
  openUpgradeModal?: (requiredTier?: "Scholar" | "Leader", featureName?: string) => void,
  rawTier?: string | null
): { allowed: boolean; status: VoiceQuotaStatus } {
  const status = getVoiceQuotaStatus(rawTier);
  if (!status.isExhausted) {
    return { allowed: true, status };
  }

  const nextTier = getNextUpgradeTier(status.tier);
  const featureLabel = `Elder Stephen Live Voice (${status.limitMinutes} min/mo ${status.tier} allowance used)`;
  if (openUpgradeModal) {
    openUpgradeModal(nextTier, featureLabel);
  }
  return { allowed: false, status };
}
