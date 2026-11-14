/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Strips any preliminary prompt/persona instructions, role labels, bracketed stage directions,
 * vocal burst tags, and markdown formatting so Gemini TTS / Live voice speaks ONLY the exact
 * intended text.
 */
export function sanitizeVerbatimSpeechText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  let cleaned = rawText
    // Remove any accidental preliminary persona/instruction prefixes
    .replace(
      /^you are elder stephen[^:]*:\s*/i,
      ""
    )
    .replace(
      /^read this (?:guidance|text|passage|scripture)[^:]*:\s*/i,
      ""
    )
    .replace(
      /^speak only the exact[^:]*:\s*/i,
      ""
    )
    .replace(/^\[?\s*system instruction[^\]]*\]?:?\s*/gi, "")
    .replace(/^begin reading:\s*/i, "")
    // Remove speaker/role prefixes
    .replace(/^(?:Elder Stephen|Elder Stevens|Dr\.?\s*Adams|DrA|Ava|Narrator):\s*/gim, "")
    // Remove scripted vocal bursts or backchannel tokens that can cause sigh/shh artifacts
    .replace(/<(?:breath|sigh|laugh|gasp|pant|yawn|cough|throat-clear|shh+)>/gi, " ")
    .replace(/\|[a-z]+\|/gi, " ")
    // Strip markdown formatting and bracketed annotations
    .replace(/\*\*|###|##|#|\*|`/g, "")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/Dr\.\s*Adams/g, "Doctor Adams")
    // Replace trailing ellipses or em-dashes that trigger trailing vocoder sighs/'shh' noises
    .replace(/\.{2,}/g, ".")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\bshh+\b[.!?]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Ensure clean terminal punctuation so the TTS vocoder closes the final phoneme cleanly
  if (cleaned && !/[.!?]["']?$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}

/**
 * Extracts raw 16-bit little-endian PCM bytes from a Uint8Array that may either be
 * a WAV file (with a 44-byte RIFF/WAVE header from Gemini 3.8 unary TTS) or raw L16 PCM.
 */
export function extractRawPcmBytes(bytes: Uint8Array): Uint8Array {
  if (
    bytes.length > 44 &&
    bytes[0] === 0x52 && // 'R'
    bytes[1] === 0x49 && // 'I'
    bytes[2] === 0x46 && // 'F'
    bytes[3] === 0x46 && // 'F'
    bytes[8] === 0x57 && // 'W'
    bytes[9] === 0x41 && // 'A'
    bytes[10] === 0x56 && // 'V'
    bytes[11] === 0x45 // 'E'
  ) {
    // Walk WAV subchunks to find the 'data' chunk
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const isDataChunk =
        bytes[offset] === 0x64 && // 'd'
        bytes[offset + 1] === 0x61 && // 'a'
        bytes[offset + 2] === 0x74 && // 't'
        bytes[offset + 3] === 0x61; // 'a'
      const chunkSize =
        bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24);
      const dataStart = offset + 8;
      if (isDataChunk) {
        const safeEnd =
          chunkSize > 0 && dataStart + chunkSize <= bytes.length
            ? dataStart + chunkSize
            : bytes.length;
        const evenLength = (safeEnd - dataStart) & ~1;
        return bytes.subarray(dataStart, dataStart + evenLength);
      }
      if (chunkSize < 0 || dataStart + chunkSize > bytes.length) {
        break;
      }
      offset = dataStart + chunkSize + (chunkSize & 1);
    }
    // Fallback: strip standard 44-byte WAV header
    const fallbackLen = (bytes.length - 44) & ~1;
    return bytes.subarray(44, 44 + fallbackLen);
  }

  const evenLen = bytes.length & ~1;
  return bytes.subarray(0, evenLen);
}

/**
 * Decodes base64 Gemini audio (WAV or raw 24kHz 16-bit PCM) into a Float32Array
 * and strips any trailing sound effects, breaths, or sibilant 'shh' noises from the end
 * of the audio stream.
 */
export function decodeAndCleanGeminiPcm(
  base64Audio: string,
  options: { sampleRate?: number; isStreamingChunk?: boolean } = {}
): Float32Array {
  const sampleRate = options.sampleRate || 24000;
  const isStreamingChunk = Boolean(options.isStreamingChunk);

  const binaryString = window.atob(base64Audio);
  const len = binaryString.length;
  const rawBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    rawBytes[i] = binaryString.charCodeAt(i);
  }

  const pcmBytes = extractRawPcmBytes(rawBytes);
  const sampleCount = pcmBytes.byteLength >> 1;
  if (sampleCount === 0) {
    return new Float32Array(0);
  }

  const dataView = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
  const samples = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    samples[i] = dataView.getInt16(i * 2, true) / 32768.0;
  }

  // Remove DC offset so zero-crossing and silence detection are accurate
  let mean = 0;
  for (let i = 0; i < sampleCount; i++) {
    mean += samples[i];
  }
  mean /= sampleCount;
  if (Math.abs(mean) > 0.0001) {
    for (let i = 0; i < sampleCount; i++) {
      samples[i] -= mean;
    }
  }

  const frameSize = Math.floor(sampleRate * 0.01); // 10ms frames (240 samples at 24kHz)
  const numFrames = Math.floor(sampleCount / frameSize);
  if (numFrames < 6) {
    return samples;
  }

  const rms = new Float32Array(numFrames);
  const zcr = new Float32Array(numFrames);
  const hfRatio = new Float32Array(numFrames);

  for (let f = 0; f < numFrames; f++) {
    const base = f * frameSize;
    let sumSq = 0;
    let diffSq = 0;
    let crossings = 0;
    let prev = samples[base];

    for (let i = 0; i < frameSize; i++) {
      const cur = samples[base + i];
      sumSq += cur * cur;
      const diff = cur - prev;
      diffSq += diff * diff;
      if ((cur >= 0 && prev < 0) || (cur < 0 && prev >= 0)) {
        crossings++;
      }
      prev = cur;
    }

    rms[f] = Math.sqrt(sumSq / frameSize);
    zcr[f] = crossings / frameSize;
    hfRatio[f] = sumSq > 1e-9 ? diffSq / sumSq : 0;
  }

  // For streaming chunks, suppress any trailing high-frequency unvoiced 'shh'/hiss frames
  if (isStreamingChunk) {
    let endFrame = numFrames - 1;
    const maxTailFrames = Math.min(numFrames - 1, 25); // up to 250ms at end of chunk
    let trimmed = 0;
    while (
      endFrame > 2 &&
      trimmed < maxTailFrames &&
      ((zcr[endFrame] > 0.21 && hfRatio[endFrame] > 0.5 && rms[endFrame] < 0.06) ||
        rms[endFrame] < 0.003)
    ) {
      endFrame--;
      trimmed++;
    }
    if (trimmed > 2) {
      const keptSamples = Math.min(sampleCount, (endFrame + 1) * frameSize);
      const fadeLen = Math.min(240, keptSamples);
      for (let i = 0; i < fadeLen; i++) {
        const gain = 0.5 * (1 + Math.cos((Math.PI * i) / fadeLen));
        samples[keptSamples - fadeLen + i] *= gain;
      }
      return samples.subarray(0, keptSamples);
    }
    return samples;
  }

  // Full narration buffer analysis: compute reference voiced RMS (85th percentile of active frames)
  const activeRms: number[] = [];
  for (let f = 0; f < numFrames; f++) {
    if (rms[f] > 0.004) {
      activeRms.push(rms[f]);
    }
  }
  activeRms.sort((a, b) => a - b);
  const voicedRefRms =
    activeRms.length > 0
      ? activeRms[Math.min(activeRms.length - 1, Math.floor(activeRms.length * 0.85))]
      : 0.05;

  const silenceThreshold = Math.max(0.0035, voicedRefRms * 0.04);
  const voicedThreshold = Math.max(0.011, voicedRefRms * 0.14);

  // 1. Trim leading silence / click
  let startFrame = 0;
  while (startFrame < numFrames - 4 && rms[startFrame] < silenceThreshold) {
    startFrame++;
  }
  startFrame = Math.max(0, startFrame - 1);

  // 2. Trim trailing silence
  let endFrame = numFrames - 1;
  while (endFrame > startFrame + 4 && rms[endFrame] < silenceThreshold) {
    endFrame--;
  }

  // 3. Detect and strip any detached trailing sound effect / sigh / 'shh' burst in the final 900ms
  const searchWindowFrames = Math.min(90, endFrame - startFrame - 10);
  if (searchWindowFrames > 12) {
    const windowStart = endFrame - searchWindowFrames;
    // Scan backward from endFrame to see if there is a low-energy gap (>= 40ms = 4 frames)
    // followed by a trailing noise/breath/shh burst
    let gapEnd = -1;
    let gapStart = -1;
    for (let f = endFrame - 2; f >= windowStart; f--) {
      if (rms[f] < silenceThreshold * 1.75) {
        if (gapEnd === -1) gapEnd = f;
        gapStart = f;
      } else if (gapEnd !== -1) {
        if (gapEnd - gapStart + 1 >= 4) {
          break;
        }
        gapEnd = -1;
        gapStart = -1;
      }
    }

    if (gapEnd !== -1 && gapStart !== -1 && gapEnd - gapStart + 1 >= 4) {
      const burstFrames = endFrame - gapEnd;
      if (burstFrames > 0 && burstFrames <= 55) {
        let burstSumRms = 0;
        let burstMaxRms = 0;
        let burstSumZcr = 0;
        let burstSumHf = 0;
        for (let f = gapEnd + 1; f <= endFrame; f++) {
          burstSumRms += rms[f];
          if (rms[f] > burstMaxRms) burstMaxRms = rms[f];
          burstSumZcr += zcr[f];
          burstSumHf += hfRatio[f];
        }
        const avgZcr = burstSumZcr / burstFrames;
        const avgHf = burstSumHf / burstFrames;
        const avgRms = burstSumRms / burstFrames;
        // If the detached tail is a sibilant 'shh'/hiss or a quieter breath/sound effect, strip it
        if (
          avgZcr > 0.16 ||
          avgHf > 0.42 ||
          burstMaxRms < voicedRefRms * 0.55 ||
          avgRms < voicedRefRms * 0.3
        ) {
          endFrame = gapStart;
          while (endFrame > startFrame + 4 && rms[endFrame] < silenceThreshold * 1.5) {
            endFrame--;
          }
        }
      }
    }
  }

  // 4. Strip attached trailing 'shh' / sibilant hiss / breath decay at the end of the final word
  const maxAttachedTailFrames = Math.min(60, endFrame - startFrame - 6); // up to 600ms
  let strippedAttached = 0;
  while (endFrame > startFrame + 6 && strippedAttached < maxAttachedTailFrames) {
    const isHighFreqSibilantOrShh =
      (zcr[endFrame] > 0.18 || hfRatio[endFrame] > 0.45) &&
      rms[endFrame] < voicedRefRms * 0.48;
    const isLowEnergyBreathTail = rms[endFrame] < voicedThreshold * 0.72;

    if (isHighFreqSibilantOrShh || isLowEnergyBreathTail) {
      endFrame--;
      strippedAttached++;
    } else {
      break;
    }
  }

  // Allow a tiny 15ms natural release only if the next frame is NOT high-frequency 'shh' noise
  if (
    endFrame + 1 < numFrames &&
    zcr[endFrame + 1] < 0.17 &&
    hfRatio[endFrame + 1] < 0.42 &&
    rms[endFrame + 1] < voicedRefRms * 0.35
  ) {
    endFrame = Math.min(numFrames - 1, endFrame + 1);
  }

  const startSample = startFrame * frameSize;
  const endSample = Math.min(sampleCount, (endFrame + 1) * frameSize);
  if (endSample <= startSample) {
    return samples;
  }

  const trimmed = samples.slice(startSample, endSample);

  // 5. Apply smooth 8ms fade-in and 30ms raised-cosine fade-out to eliminate any click or tail artifact
  const fadeInSamples = Math.min(Math.floor(sampleRate * 0.008), Math.floor(trimmed.length / 4));
  for (let i = 0; i < fadeInSamples; i++) {
    const gain = 0.5 * (1 - Math.cos((Math.PI * i) / fadeInSamples));
    trimmed[i] *= gain;
  }

  const fadeOutSamples = Math.min(Math.floor(sampleRate * 0.03), Math.floor(trimmed.length / 3));
  const fadeOutStart = trimmed.length - fadeOutSamples;
  for (let i = 0; i < fadeOutSamples; i++) {
    const gain = 0.5 * (1 + Math.cos((Math.PI * i) / fadeOutSamples));
    trimmed[fadeOutStart + i] *= gain;
  }

  return trimmed;
}

/**
 * Resamples an input Float32Array from any hardware AudioContext sample rate
 * (e.g., 48000 Hz, 44100 Hz, or 16000 Hz) to 16000 Hz mono with anti-aliasing
 * box-averaging so Gemini Live VAD and speech recognition receive clean 16kHz audio.
 */
export function resampleFloat32To16kHz(
  input: Float32Array,
  inputSampleRate: number = 16000
): Float32Array {
  if (!input || input.length === 0) {
    return new Float32Array(0);
  }
  const targetRate = 16000;
  if (!inputSampleRate || Math.abs(inputSampleRate - targetRate) <= 50) {
    return input;
  }

  const ratio = inputSampleRate / targetRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  if (ratio > 1) {
    // Downsampling (e.g. 48kHz -> 16kHz or 44.1kHz -> 16kHz) with box filter
    for (let i = 0; i < outputLength; i++) {
      const start = i * ratio;
      const end = Math.min(input.length, (i + 1) * ratio);
      const startIdx = Math.floor(start);
      const endIdx = Math.ceil(end);
      let sum = 0;
      let weightSum = 0;
      for (let j = startIdx; j < endIdx && j < input.length; j++) {
        const wStart = Math.max(start, j);
        const wEnd = Math.min(end, j + 1);
        const weight = Math.max(0, wEnd - wStart);
        sum += input[j] * weight;
        weightSum += weight;
      }
      output[i] = weightSum > 0 ? sum / weightSum : input[Math.min(startIdx, input.length - 1)];
    }
  } else {
    // Upsampling via linear interpolation
    for (let i = 0; i < outputLength; i++) {
      const srcPos = i * ratio;
      const idx0 = Math.floor(srcPos);
      const idx1 = Math.min(input.length - 1, idx0 + 1);
      const frac = srcPos - idx0;
      output[i] = input[idx0] * (1 - frac) + input[idx1] * frac;
    }
  }

  return output;
}

/**
 * Converts a Float32Array of microphone samples at `inputSampleRate` into
 * a Base64-encoded 16-bit signed little-endian 16kHz mono PCM payload
 * (`audio/pcm;rate=16000`) for Gemini Live `sendRealtimeInput`.
 */
export function encodeFloat32To16kHzPcmBase64(
  input: Float32Array,
  inputSampleRate: number = 16000
): string {
  const resampled = resampleFloat32To16kHz(input, inputSampleRate);
  const buffer = new ArrayBuffer(resampled.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < resampled.length; i++) {
    const clamped = Math.max(-1, Math.min(1, resampled[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength)))
    );
  }
  return window.btoa(binary);
}

