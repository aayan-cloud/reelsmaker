/**
 * The motion vocabulary. Everything else in this project is composed out of
 * these five functions, so a new reel is a new arrangement, not new physics.
 *
 * Two ideas do most of the work:
 *
 *   posterizeTime - film is not 30fps. Sampling motion at 8-12fps and holding
 *   each sample is what separates "a picture sliding smoothly" from "a frame of
 *   film". Smooth motion reads as PowerPoint; stepped motion reads as cinema.
 *
 *   boil - nothing in a real shot is ever perfectly still. A pixel of drift on
 *   every layer, at different rates, is the whole difference between a collage
 *   and a scene.
 */

/** Deterministic 0..1 noise. Same finaliser as the outreach engine's hash: the
 *  avalanche matters here too, because near-consecutive frames must not produce
 *  near-identical offsets or the "random" drift comes out as a straight line. */
export const noise = (n: number): number => {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

/** Hold each sample for a whole step, so motion advances in chunks like film. */
export const posterizeTime = (frame: number, fps: number, targetFps = 12): number => {
  const step = Math.max(1, Math.round(fps / targetFps));
  return Math.floor(frame / step) * step;
};

/** Sub-pixel life. Feed a different seed per layer or every layer drifts as one. */
export const boil = (
  frame: number,
  fps: number,
  { amount = 2, seed = 0, rate = 10 }: { amount?: number; seed?: number; rate?: number } = {},
) => {
  const t = posterizeTime(frame, fps, rate) + seed * 977;
  return {
    x: (noise(t) - 0.5) * 2 * amount,
    y: (noise(t + 31) - 0.5) * 2 * amount,
    rotate: (noise(t + 67) - 0.5) * 2 * amount * 0.08,
  };
};

/** The projector gate never held film perfectly still either. Whole-frame only. */
export const gateWeave = (frame: number, fps: number, amount = 1.2) =>
  boil(frame, fps, { amount, seed: 4242, rate: 24 });

/** 0 -> 1 -> 0 across `duration`. For loops that must not snap back. */
export const pingPong = (frame: number, duration: number): number => {
  const cycle = frame % (duration * 2);
  return cycle <= duration ? cycle / duration : 2 - cycle / duration;
};

/** A layer's scale under a push-in. Give the foreground a higher speed than the
 *  background and you have parallax - the cheapest depth cue there is. */
export const parallax = (frame: number, { speed = 1, from = 1 } = {}): number =>
  from + (frame / 100) * speed;
