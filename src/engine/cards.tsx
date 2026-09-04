import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { noise, posterizeTime } from './motion';
import { P } from './palette';

/**
 * Procedural pictures.
 *
 * The video this project is modelled on used photographs, because it was
 * telling a story about Netflix and Blockbuster - things the viewer has already
 * seen. A story about a scraper has no stock imagery and no shared memory, so
 * hunting for photos is wasted effort. Drawing the data instead is faster to
 * make, impossible to get a copyright strike over, and on-brand for a channel
 * about code.
 */

export const Backdrop: React.FC<{
  from?: string;
  to?: string;
  /** Skip the painted gradient, so the card can sit over a PhotoBackdrop.
   *  Without this a stat card layered on a photo simply hides the photo. */
  over?: boolean;
  children?: React.ReactNode;
}> = ({
  from = '#241d15',
  to = P.ink,
  over = false,
  children,
}) => (
  <AbsoluteFill
    style={{
      background: over ? undefined : `radial-gradient(ellipse 90% 60% at 50% 32%, ${from}, ${to})`,
      justifyContent: 'center',
      alignItems: 'center',
      // Captions own the bottom of the frame. Everything a card draws sits above
      // that zone, so no scene has to be nudged by hand.
      paddingBottom: 420,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** A field of map pins. `lit` of them come up green (a lead), the rest stay
 *  grey. Staggered, because everything arriving at once reads as a transition
 *  rather than as a result.
 *
 *  Pin size is derived from the count, not fixed. Six fixed-size pins in a 1080
 *  frame is a postage stamp floating in black, and on a phone it reads as
 *  nothing at all. The grid always fills the same width instead. */
export const PinField: React.FC<{
  total?: number;
  lit?: number;
  litColor?: string;
  stagger?: number;
  over?: boolean;
}> = ({ total = 25, lit = 0, litColor = P.good, stagger = 2, over = false }) => {
  const frame = useCurrentFrame();
  const cols = Math.ceil(Math.sqrt(total));
  const GRID = 800;
  const gap = Math.max(18, Math.round(GRID / (cols * 4)));
  const size = Math.min(210, Math.max(44, Math.floor((GRID - gap * (cols - 1)) / cols)));

  return (
    <Backdrop over={over}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gap,
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isLit = i < lit;
          const appear = interpolate(frame - i * stagger, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(1.5)),
          });
          const drop = interpolate(appear, [0, 1], [-size * 0.5, 0]);
          return (
            <div
              key={i}
              style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // The classic CSS teardrop: three round corners, one square,
                // rotated so the square corner becomes the point at the bottom.
                borderRadius: '50% 50% 50% 0',
                transform: `rotate(-45deg) scale(${appear}) translateY(${drop}px)`,
                background: isLit ? litColor : '#3a332a',
                boxShadow: P.shadow,
                opacity: isLit ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: size * 0.36,
                  height: size * 0.36,
                  borderRadius: ' 50%',
                  background: 'rgba(0,0,0,0.55)',
                }}
              />
            </div>
          );
        })}
      </div>
    </Backdrop>
  );
};

/** One enormous number. Counts up if `from` differs from `value`. */
export const BigStat: React.FC<{
  value: number | string;
  label?: string;
  sub?: string;
  color?: string;
  countFrom?: number;
  over?: boolean;
}> = ({ value, label, sub, color = P.bone, countFrom, over = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  let shown: string;
  if (typeof value === 'number' && countFrom !== undefined) {
    // Counted on a posterized clock. A number ticking at 30fps is unreadable
    // and reads as noise; at 12 it reads as a machine working.
    const t = posterizeTime(frame, fps, 12);
    shown = String(
      Math.round(
        interpolate(t, [0, durationInFrames * 0.55], [countFrom, value], {
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        }),
      ),
    );
  } else {
    shown = String(value);
  }

  const pop = interpolate(frame, [0, 12], [0.86, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  return (
    <Backdrop over={over}>
      <div style={{ textAlign: 'center', transform: `scale(${pop})` }}>
        {label ? (
          <div
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 46,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: P.boneFaint,
              marginBottom: 22,
            }}
          >
            {label}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: 400,
            lineHeight: 0.86,
            color,
            textShadow: P.shadow,
          }}
        >
          {shown}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 52,
              color: P.boneDim,
              marginTop: 26,
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </Backdrop>
  );
};

/** Scrolling terminal text. Use for the moment a reel has to show that the
 *  thing is real and actually runs. */
export const TerminalCard: React.FC<{ lines: string[]; speed?: number }> = ({
  lines,
  speed = 6,
}) => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / speed);
  const caretOn = Math.floor(frame / 12) % 2 === 0;

  return (
    <Backdrop from="#0d1117" to="#02040a">
      <div
        style={{
          width: '84%',
          fontFamily: 'Consolas, Menlo, monospace',
          fontSize: 40,
          lineHeight: 1.55,
          color: P.bone,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 18,
          padding: '46px 40px',
        }}
      >
        {lines.slice(0, visible + 1).map((line, i) => (
          <div key={i} style={{ opacity: i === visible ? 0.9 : 1, whiteSpace: 'pre-wrap' }}>
            <span style={{ color: P.accent }}>{line.startsWith('$') ? '' : '  '}</span>
            {line}
            {i === visible && caretOn ? <span style={{ color: P.good }}>_</span> : null}
          </div>
        ))}
      </div>
    </Backdrop>
  );
};

/** The end card. Repo name, handle, one line of what it is. */
export const OutroCard: React.FC<{
  repo: string; handle: string; tagline: string; over?: boolean;
}> = ({ repo, handle, tagline, over = false }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 18], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const fade = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <Backdrop from="#1b2130" to="#04060a" over={over}>
      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${rise}px)`,
          opacity: fade,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ fontSize: 44, color: P.boneFaint, letterSpacing: '0.3em' }}>
          OPEN SOURCE
        </div>
        <div
          style={{
            fontFamily: 'Consolas, Menlo, monospace',
            fontSize: 76,
            color: P.bone,
            margin: '30px 0 18px',
          }}
        >
          {repo}
        </div>
        <div style={{ fontSize: 46, color: P.accent }}>{tagline}</div>
        <div style={{ fontSize: 52, color: P.boneDim, marginTop: 64 }}>
          {handle}
        </div>
      </div>
    </Backdrop>
  );
};

/** Grain-free flash used to hide a hard cut. Two frames is enough. */
export const useFlash = (at: number, length = 3) => {
  const frame = useCurrentFrame();
  return frame >= at && frame < at + length ? 1 - (frame - at) / length : 0;
};

export const jitterSeed = (i: number) => noise(i * 7919);
