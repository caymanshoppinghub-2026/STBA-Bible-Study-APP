/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  volume = 0.08,
  type: OscillatorType = "sine"
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Gentle two-note ascending chime for smooth step transitions */
export function playTransitionChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playTone(ctx, 523.25, 0, 0.22, 0.06, "sine"); // C5
    playTone(ctx, 659.25, 0.09, 0.28, 0.06, "sine"); // E5
  } catch {}
}

/** Warm celebratory triad arpeggio when a drill or mastery milestone is achieved */
export function playCelebrationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playTone(ctx, 523.25, 0, 0.25, 0.07, "triangle"); // C5
    playTone(ctx, 659.25, 0.09, 0.25, 0.07, "triangle"); // E5
    playTone(ctx, 783.99, 0.18, 0.30, 0.07, "triangle"); // G5
    playTone(ctx, 1046.5, 0.28, 0.45, 0.08, "sine"); // C6
  } catch {}
}

/** Soft, subtle tap cue when a locked card or incomplete drill is clicked */
export function playGentleNudge(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playTone(ctx, 330, 0, 0.14, 0.04, "sine");
  } catch {}
}

/** Crisp, warm rising "whoop!" pop sound when Elder Stephen's speech bubble appears */
export function playBubblePopSound(): void {
  playElderBubblePop();
}

export function playElderBubblePop(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  } catch {}
}

/** Bright, crisp rising "weep!" pop sound when the user's speech bubble appears */
export function playUserBubblePop(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.13);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.065, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  } catch {}
}
