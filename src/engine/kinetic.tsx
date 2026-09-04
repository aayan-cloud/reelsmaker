import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { noise } from './motion';
// Reuse the caption parser rather than writing a second one. The naive version
// tests each word for a leading AND trailing asterisk, which prints the markers
// verbatim on any accent longer than one word - a bug already fixed once in
// Captions.tsx.
import { parseAccents } from './Captions';

/**
 * The product-keynote look: kinetic 3D type, glass panels, floating UI cards.
 *
 * This deliberately breaks the rule in `palette.ts`.
 *
 * That palette exists to stop things looking like a screen: no pure white, no
 * glow, film colour only. Correct for a documentary reel. This style is the
 * opposite on purpose - it is an interface aesthetic, and interfaces glow. Pure
 * white cards, bloom behind the type, frosted panels. Mixing the two would read
 * as an accident, so a reel picks one and commits.
 *
 * Two things carry the whole look:
 *
 *   PERSPECTIVE. Words and cards rotate on X and Y inside a parent with a
 *   perspective value. Without it they scale and slide, which reads as
 *   PowerPoint; with it they turn in space.
 *
 *   BLOOM. A blurred copy of the same element sits behind it. Not a text-shadow:
 *   a real duplicate at higher blur, which is what gives the glow a body rather
 *   than a halo.
 */

export const K = {
  ink: '#08080b',
  inkSoft: '#101016',
  paper: '#f5f6f8',
  paperEdge: '#e6e8ee',
  text: '#ffffff',
  textDim: 'rgba(255,255,255,0.55)',
  onPaper: '#0d0f14',
  onPaperDim: 'rgba(13,15,20,0.55)',
  accent: '#5b8cff',
  accentWarm: '#ff7a45',
  good: '#2ecc8f',
} as const;

const SANS = 'Segoe UI, -apple-system, Helvetica Neue, Arial, sans-serif';
const MONO = 'Consolas, Menlo, monospace';

/**
 * The ground everything sits on.
 *
 * A flat near-black fill is the single thing that makes a keynote reel look
 * cheap: nothing moves, so the eye reads it as a slide rather than a shot. This
 * is three coloured blobs drifting on separate sine periods, well under the
 * background, plus a vignette to stop the corners lifting.
 *
 * The periods are deliberately not multiples of each other. Coprime-ish rates
 * mean the composition never visibly repeats inside a reel, which is the
 * difference between "alive" and "looping wallpaper".
 */
export const Stage: React.FC<{ light?: boolean; children?: React.ReactNode }> = ({
  light = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });

  if (light) {
    return (
      <AbsoluteFill style={{ backgroundColor: K.paper, overflow: 'hidden' }}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 80% 55% at ${42 + t * 12}% ${30 + t * 8}%, #ffffff, ${K.paperEdge})`,
          }}
        />
        {children}
      </AbsoluteFill>
    );
  }

  // Slow drift. Each blob gets its own period and phase so they separate and
  // recombine instead of sliding as one sheet.
  const blob = (period: number, phase: number, ax: number, ay: number) => ({
    x: 50 + Math.sin(frame / period + phase) * ax,
    y: 50 + Math.cos(frame / (period * 1.37) + phase) * ay,
  });
  const a = blob(190, 0, 34, 26);
  const b = blob(260, 2.1, 38, 30);
  const c = blob(150, 4.2, 30, 34);

  return (
    <AbsoluteFill style={{ backgroundColor: K.ink, overflow: 'hidden' }}>
      {/* Base lift, so the blobs are not sitting on pure black. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 55% at ${44 + t * 12}% ${36 + t * 8}%, #242a3d, ${K.ink} 78%)`,
        }}
      />
      {/* The colour. Heavily blurred and low opacity: it should read as light in
          the room, never as a shape you can point at. */}
      <AbsoluteFill style={{ filter: 'blur(80px)', opacity: 0.95 }}>
        <div
          style={{
            position: 'absolute',
            left: `${a.x}%`, top: `${a.y}%`, width: '62%', height: '38%',
            transform: 'translate(-50%, -50%)', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(91,140,255,0.85), rgba(91,140,255,0) 72%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${b.x}%`, top: `${b.y}%`, width: '54%', height: '32%',
            transform: 'translate(-50%, -50%)', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(132,86,240,0.70), rgba(132,86,240,0) 72%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${c.x}%`, top: `${c.y}%`, width: '46%', height: '28%',
            transform: 'translate(-50%, -50%)', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,204,143,0.48), rgba(46,204,143,0) 72%)',
          }}
        />
      </AbsoluteFill>
      {/* Vignette last, so it darkens the blobs too and the corners stay put. */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 86% 70% at 50% 48%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.48) 100%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/**
 * Words that tumble in and settle.
 *
 * Each word gets its own rotation, depth and delay from a hash of its index, so
 * the scatter is deterministic - the same line always lands the same way - but
 * never looks patterned.
 *
 * Wrap a span in *asterisks* to accent it. Spans may be several words long.
 */
export const KineticType: React.FC<{
  text: string;
  size?: number;
  light?: boolean;
  accent?: string;
  /** Frames between each word starting to settle. */
  stagger?: number;
}> = ({ text, size = 132, light = false, accent = K.accent, stagger = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = parseAccents(text);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 70px',
        perspective: 1400,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.06em 0.28em',
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          textTransform: 'uppercase',
          transformStyle: 'preserve-3d',
        }}
      >
        {words.map(({ word, hot }, i) => {
          const s = spring({
            frame: frame - i * stagger,
            fps,
            config: { damping: 14, mass: 0.8 },
            durationInFrames: 30,
          });

          // Deterministic scatter: same line, same landing, every render.
          const rx = (noise(i * 7919) - 0.5) * 90;
          const ry = (noise(i * 104729 + 3) - 0.5) * 90;
          const rz = (noise(i * 31 + 11) - 0.5) * 40;
          const dz = 300 + noise(i * 613) * 500;

          const colour = hot ? accent : light ? K.onPaper : K.text;

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: colour,
                opacity: s,
                transform:
                  `perspective(1400px) ` +
                  `rotateX(${(1 - s) * rx}deg) ` +
                  `rotateY(${(1 - s) * ry}deg) ` +
                  `rotateZ(${(1 - s) * rz}deg) ` +
                  `translateZ(${(1 - s) * -dz}px)`,
                // Bloom only in the dark scenes; on paper it reads as a smudge.
                textShadow: light ? 'none' : `0 0 ${46 * s}px ${hot ? accent : '#8ea6ff'}55`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** A frosted panel. Used for the "everything wants a key" list. */
export const GlassPanel: React.FC<{
  rows: { label: string; note: string; hot?: boolean }[];
  title?: string;
  every?: number;
}> = ({ rows, title, every = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: 1600 }}>
      <div
        style={{
          width: '82%',
          padding: '46px 44px',
          borderRadius: 30,
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(26px)',
          boxShadow: '0 50px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 60}px) rotateX(${(1 - enter) * 14}deg)`,
          fontFamily: SANS,
        }}
      >
        {title ? (
          <div
            style={{
              fontSize: 30,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: K.textDim,
              marginBottom: 30,
            }}
          >
            {title}
          </div>
        ) : null}

        {rows.map((r, i) => {
          const o = interpolate(frame - 10 - i * every, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '26px 4px',
                borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                opacity: o,
                transform: `translateX(${(1 - o) * 26}px)`,
              }}
            >
              <span style={{ fontSize: 44, color: K.text, fontWeight: 600 }}>{r.label}</span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 34,
                  color: r.hot ? K.accentWarm : K.textDim,
                  whiteSpace: 'nowrap',
                }}
              >
                {r.note}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * A bright app card that floats in with depth.
 *
 * `index` drives the stagger and the resting offset, so a stack of these reads
 * as one composition rather than as several unrelated animations.
 */
export const FloatingCard: React.FC<{
  title?: string;
  lines: string[];
  index?: number;
  x?: number;
  y?: number;
  width?: number;
  tilt?: number;
  accent?: string;
  mono?: boolean;
}> = ({ title, lines, index = 0, x = 0, y = 0, width = 74, tilt = 0, accent = K.accent, mono = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: frame - index * 7,
    fps,
    config: { damping: 16, mass: 0.9 },
    durationInFrames: 34,
  });
  const drift = Math.sin((frame + index * 40) / 46) * 5;

  return (
    // x/y are percentages of the FRAME, so they go on this full-size wrapper.
    // Putting them on the card itself makes them percentages of the card, which
    // is a fraction of the distance you asked for - two cards 38 apart landed
    // on top of each other.
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1500,
        transform: `translate(${x}%, ${y}%)`,
      }}
    >
      <div
        style={{
          width: `${width}%`,
          background: '#ffffff',
          borderRadius: 26,
          padding: '34px 36px',
          boxShadow: '0 40px 90px rgba(12,16,30,0.22), 0 4px 14px rgba(12,16,30,0.10)',
          opacity: s,
          transform:
            `translateY(${drift}px) ` +
            `rotate(${tilt}deg) ` +
            `perspective(1500px) rotateX(${(1 - s) * 26}deg) ` +
            `translateY(${(1 - s) * 90}px) scale(${0.94 + s * 0.06})`,
          fontFamily: SANS,
        }}
      >
        {title ? (
          <div
            style={{
              fontSize: 26,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: accent,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            {title}
          </div>
        ) : null}
        {lines.map((l, i) => {
          const o = interpolate(frame - index * 7 - 8 - i * 4, [0, 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                fontFamily: mono ? MONO : SANS,
                fontSize: mono ? 30 : 36,
                lineHeight: 1.42,
                color: K.onPaper,
                opacity: o,
                marginBottom: i === lines.length - 1 ? 0 : 12,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** One enormous figure, bloomed. For the "zero cost" beat. */
export const BigFigure: React.FC<{ value: string; label: string; accent?: string }> = ({
  value,
  label,
  accent = K.good,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 13 }, durationInFrames: 26 });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', transform: `scale(${0.8 + s * 0.2})`, opacity: s }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 330,
            lineHeight: 0.9,
            color: K.text,
            letterSpacing: '-0.05em',
            textShadow: `0 0 90px ${accent}66`,
          }}
        >
          {value}
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontSize: 42,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
