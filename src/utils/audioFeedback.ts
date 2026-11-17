/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Web Audio API Synthesizer for STBA Discipleship Audio Cues
 * Generates pure synthesizer chimes without external audio asset dependencies.
 */

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!globalAudioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        globalAudioCtx = new AudioCtxClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    console.debug("Web Audio Context not available", e);
    return null;
  }
}

/**
 * Subtle gentle reminder ping sound when the Recall pop-up appears
 */
export function playReminderPingSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone gentle harmonic bell ping (A5 880Hz + E6 1318.5Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.2);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.5, now);
    osc2.frequency.exponentialRampToValueAtTime(2637, now + 0.15);

    // Smooth subtle envelope: starts quiet, soft peak, gentle ring-down
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.16, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);
  } catch (e) {
    console.debug("Unable to play reminder ping", e);
  }
}

/**
 * Cheerful celebration / correct answer sound when user chooses the right answer
 */
export function playCorrectAnswerSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sparkling 3-note ascending chime: G5 (783.99Hz) -> C6 (1046.50Hz) -> E6 (1318.51Hz)
    const notes = [783.99, 1046.50, 1318.51];
    const delays = [0, 0.08, 0.16];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + delays[idx];
      const duration = 0.35;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });
  } catch (e) {
    console.debug("Unable to play correct answer sound", e);
  }
}

/**
 * Cheerful "hooray" celebration sound when the user finishes interacting with the Recall Pop-Up
 */
export function playHooraySound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Joyful ascending major arpeggio: C5 (523.25) -> E5 (659.25) -> G5 (783.99) -> C6 (1046.50) -> E6 (1318.5)
    const chordFrequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const delays = [0, 0.09, 0.18, 0.28, 0.38];

    chordFrequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + delays[index];
      const duration = index >= 3 ? 0.65 : 0.45;

      osc.type = index === 3 || index === 4 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      // Warm slight vibrato on final sustained high note
      if (index >= 3) {
        osc.frequency.linearRampToValueAtTime(freq * 1.015, noteTime + duration);
      }

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });

    // Add a soft golden shimmer layer in the background for extra cheer
    setTimeout(() => {
      try {
        if (!ctx) return;
        const shimmerNow = ctx.currentTime;
        const shimmerOsc = ctx.createOscillator();
        const shimmerGain = ctx.createGain();

        shimmerOsc.type = "sine";
        shimmerOsc.frequency.setValueAtTime(2093, shimmerNow); // C7 bell resonance
        shimmerGain.gain.setValueAtTime(0.001, shimmerNow);
        shimmerGain.gain.linearRampToValueAtTime(0.08, shimmerNow + 0.02);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, shimmerNow + 0.5);

        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);

        shimmerOsc.start(shimmerNow);
        shimmerOsc.stop(shimmerNow + 0.5);
      } catch (e) {}
    }, 380);
  } catch (e) {
    console.debug("Unable to play hooray sound", e);
  }
}

/**
 * Crystal-clear golden bell chime sound whenever a new notification arrives
 * Dual-strike resonant bell chime with authentic acoustic overtones.
 */
export function playNotificationBellRingSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Bell chime 1: Primary strike (A5 880Hz + overtone E6 1318.5Hz + bell sparkle 2637Hz)
    const bell1Strike = ctx.createOscillator();
    const bell1Overtone = ctx.createOscillator();
    const bell1Sparkle = ctx.createOscillator();
    const gain1 = ctx.createGain();

    bell1Strike.type = "sine";
    bell1Strike.frequency.setValueAtTime(880, now);
    bell1Strike.frequency.exponentialRampToValueAtTime(876, now + 0.8);

    bell1Overtone.type = "sine";
    bell1Overtone.frequency.setValueAtTime(1760, now);
    bell1Overtone.frequency.exponentialRampToValueAtTime(1750, now + 0.6);

    bell1Sparkle.type = "triangle";
    bell1Sparkle.frequency.setValueAtTime(2637, now);
    bell1Sparkle.frequency.exponentialRampToValueAtTime(2620, now + 0.4);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    bell1Strike.connect(gain1);
    bell1Overtone.connect(gain1);
    bell1Sparkle.connect(gain1);
    gain1.connect(ctx.destination);

    bell1Strike.start(now);
    bell1Overtone.start(now);
    bell1Sparkle.start(now);
    bell1Strike.stop(now + 0.95);
    bell1Overtone.stop(now + 0.95);
    bell1Sparkle.stop(now + 0.95);

    // Bell chime 2: Secondary melodic follow chime (C#6 1108.7Hz + E6 1318.5Hz) struck 130ms later
    const strikeTime2 = now + 0.13;
    const bell2Strike = ctx.createOscillator();
    const bell2Overtone = ctx.createOscillator();
    const gain2 = ctx.createGain();

    bell2Strike.type = "sine";
    bell2Strike.frequency.setValueAtTime(1318.5, strikeTime2);
    bell2Strike.frequency.exponentialRampToValueAtTime(1310, strikeTime2 + 1.1);

    bell2Overtone.type = "sine";
    bell2Overtone.frequency.setValueAtTime(2093, strikeTime2); // High C7 resonance
    bell2Overtone.frequency.exponentialRampToValueAtTime(2080, strikeTime2 + 0.7);

    gain2.gain.setValueAtTime(0.001, strikeTime2);
    gain2.gain.linearRampToValueAtTime(0.24, strikeTime2 + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, strikeTime2 + 1.25);

    bell2Strike.connect(gain2);
    bell2Overtone.connect(gain2);
    gain2.connect(ctx.destination);

    bell2Strike.start(strikeTime2);
    bell2Overtone.start(strikeTime2);
    bell2Strike.stop(strikeTime2 + 1.25);
    bell2Overtone.stop(strikeTime2 + 1.25);
  } catch (e) {
    console.debug("Unable to play notification bell ring sound", e);
  }
}

/**
 * Tactile slider whoosh + warm harmonic glide sound effect for the Discipleship Vault
 * side tab (hover expansion, drawer slide-out open, and drawer slide-in close).
 */
export function playVaultSlideSound(mode: "hover" | "open" | "close" = "open"): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = mode === "hover" ? 0.12 : mode === "open" ? 0.24 : 0.19;

    // 1. Filtered noise buffer for authentic mechanical/velvet slider swoosh
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(mode === "hover" ? 3.5 : 2.4, now);

    if (mode === "open") {
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1650, now + duration);
    } else if (mode === "close") {
      filter.frequency.setValueAtTime(1450, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + duration);
    } else {
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.exponentialRampToValueAtTime(1250, now + duration);
    }

    const noiseGain = ctx.createGain();
    const peakNoiseGain = mode === "hover" ? 0.045 : 0.09;
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(peakNoiseGain, now + duration * 0.35);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);

    // 2. Subtle warm harmonic glide accompanying the slider motion
    const glideOsc = ctx.createOscillator();
    const glideGain = ctx.createGain();
    glideOsc.type = "sine";

    if (mode === "open") {
      glideOsc.frequency.setValueAtTime(330, now); // E4
      glideOsc.frequency.exponentialRampToValueAtTime(659.25, now + duration); // E5
      glideGain.gain.setValueAtTime(0.001, now);
      glideGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      glideGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.06);
    } else if (mode === "close") {
      glideOsc.frequency.setValueAtTime(587.33, now); // D5
      glideOsc.frequency.exponentialRampToValueAtTime(293.66, now + duration); // D4
      glideGain.gain.setValueAtTime(0.001, now);
      glideGain.gain.linearRampToValueAtTime(0.065, now + 0.03);
      glideGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.04);
    } else {
      glideOsc.frequency.setValueAtTime(392, now); // G4
      glideOsc.frequency.exponentialRampToValueAtTime(523.25, now + duration); // C5
      glideGain.gain.setValueAtTime(0.001, now);
      glideGain.gain.linearRampToValueAtTime(0.035, now + 0.02);
      glideGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    }

    glideOsc.connect(glideGain);
    glideGain.connect(ctx.destination);

    glideOsc.start(now);
    glideOsc.stop(now + duration + 0.07);
  } catch (e) {
    console.debug("Unable to play vault slide sound", e);
  }
}
