/**
 * Sound effects, synthesised.
 *
 *   node tools/sfx.js
 *
 * These are generated rather than downloaded on purpose. Sound is the one
 * asset class where automated content-ID actually bites - a stock whoosh that
 * also appears in ten thousand other uploads is exactly what a fingerprint
 * matcher is good at spotting. Synthesised audio has no fingerprint to match
 * and no licence to keep track of.
 *
 * Everything here is built from three primitives: white noise, a sine sweep,
 * and an amplitude envelope. That is genuinely all a whoosh or an impact is.
 */
const fs = require('fs');
const path = require('path');

const SR = 44100;
const { ASSETS } = require('./assets');
const OUT = require('path').join(ASSETS, 'sfx');

/** 16-bit mono PCM WAV. */
function writeWav(file, samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    // Clamp before scaling: a sample over 1.0 wraps to full-scale negative and
    // arrives as a click, which on a whoosh sounds exactly like a bad edit.
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);        // PCM
  header.writeUInt16LE(1, 22);        // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
  return data.length / 2 / SR;
}

const n = (secs) => new Float32Array(Math.round(secs * SR));
const lerp = (a, b, t) => a + (b - a) * t;

/** Resonant band-pass, one per call. Sweeping its centre is what turns flat
 *  noise into something that reads as movement rather than as hiss. */
function bandpass(input, freqAt, q = 6) {
  const out = new Float32Array(input.length);
  let low = 0, band = 0;
  for (let i = 0; i < input.length; i++) {
    const f = 2 * Math.sin(Math.PI * Math.min(freqAt(i / input.length), SR / 2.2) / SR);
    const high = input[i] - low - (1 / q) * band;
    band += f * high;
    low += f * band;
    out[i] = band;
  }
  return out;
}

const noise = (len) => {
  const a = new Float32Array(len);
  for (let i = 0; i < len; i++) a[i] = Math.random() * 2 - 1;
  return a;
};

/** Amplitude curve. `shape` > 1 hits hard and decays; < 1 swells. */
const env = (i, len, shape) => Math.pow(1 - i / len, shape);

// --- whoosh: noise swept upward, for a scene change ---------------------------
function whoosh(secs = 0.8) {
  const buf = n(secs);
  const src = noise(buf.length);
  const swept = bandpass(src, (t) => lerp(300, 4200, t * t), 4);
  for (let i = 0; i < buf.length; i++) {
    const t = i / buf.length;
    buf[i] = swept[i] * Math.sin(Math.PI * t) * 0.85;
  }
  return buf;
}

// --- impact: sub sine drop plus a noise transient ------------------------------
function impact(secs = 1.1) {
  const buf = n(secs);
  const tail = noise(buf.length);
  const body = bandpass(tail, () => 900, 2);
  let phase = 0;
  for (let i = 0; i < buf.length; i++) {
    const t = i / buf.length;
    const f = lerp(150, 42, Math.pow(t, 0.35));   // the drop is the punch
    phase += (2 * Math.PI * f) / SR;
    buf[i] = Math.sin(phase) * env(i, buf.length, 2.6) * 0.9
      + body[i] * env(i, buf.length, 22) * 0.5;
  }
  return buf;
}

// --- riser: tension into the reversal ------------------------------------------
function riser(secs = 2.4) {
  const buf = n(secs);
  const swept = bandpass(noise(buf.length), (t) => lerp(200, 6000, t * t * t), 8);
  let phase = 0;
  for (let i = 0; i < buf.length; i++) {
    const t = i / buf.length;
    phase += (2 * Math.PI * lerp(110, 660, t * t)) / SR;
    buf[i] = (swept[i] * 0.7 + Math.sin(phase) * 0.18) * Math.pow(t, 1.7);
  }
  return buf;
}

// --- tick: for counters and stepped reveals -------------------------------------
function tick(secs = 0.05) {
  const buf = n(secs);
  const src = bandpass(noise(buf.length), () => 2600, 12);
  for (let i = 0; i < buf.length; i++) buf[i] = src[i] * env(i, buf.length, 14) * 0.8;
  return buf;
}

// --- sub: the deep note under the end card ---------------------------------------
function sub(secs = 2.6) {
  const buf = n(secs);
  let phase = 0;
  for (let i = 0; i < buf.length; i++) {
    const t = i / buf.length;
    phase += (2 * Math.PI * 48) / SR;
    // A touch of odd harmonic so it survives a phone speaker, which cannot
    // reproduce 48Hz at all and would otherwise play silence.
    const s = Math.sin(phase) + 0.25 * Math.sin(phase * 3) + 0.1 * Math.sin(phase * 5);
    buf[i] = s * Math.min(1, t * 8) * env(i, buf.length, 1.4) * 0.5;
  }
  return buf;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, fn] of Object.entries({ whoosh, impact, riser, tick, sub })) {
  const secs = writeWav(path.join(OUT, `${name}.wav`), fn());
  console.log(`${name}.wav  ${secs.toFixed(2)}s`);
}
