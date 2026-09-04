import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

/**
 * Real captured footage, shown as footage.
 *
 * WHY THIS EXISTS
 *
 * The other engine files draw stylised recreations - kinetic type, glass panels,
 * cards. They look better than a screenshot and they are worth nothing as proof:
 * a viewer cannot check a recreation, and polish reads as an advert. Across 22
 * outlier reels in this niche, every single one showed a genuine interface.
 *
 * So `tools/capture.js` records the real thing at 1920x1080 and these components
 * put it on screen without pretending it is anything else.
 */

const MONO = 'Consolas, Menlo, monospace';

/**
 * A folder of numbered PNGs, played back as a clip.
 *
 * `playFps` is the rate the frames were CAPTURED at, not the composition's fps.
 * Capturing every 250ms and playing at 30fps would run the footage 7x fast and
 * turn a calm timeline into a seizure; passing 4 here plays it at real speed.
 */
export const FrameSequence: React.FC<{
  dir: string;
  count: number;
  playFps: number;
  /** Slow drift so a static capture still has life in it. */
  drift?: number;
  loop?: boolean;
}> = ({ dir, count, playFps, drift = 0, loop = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const raw = Math.floor((frame / fps) * playFps);
  const i = loop ? raw % count : Math.min(raw, count - 1);
  const name = String(i).padStart(4, '0') + '.png';

  const k = interpolate(frame, [0, 300], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile(dir + '/' + name)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${1.04 + k * drift})`,
        }}
      />
    </AbsoluteFill>
  );
};

/** A capture inset in a rounded screen, floating on a dark ground. */
export const ScreenCard: React.FC<{
  children: React.ReactNode;
  y?: number;
  width?: number;
  tilt?: number;
  index?: number;
}> = ({ children, y = 0, width = 92, tilt = 0, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - index * 5, fps, config: { damping: 18, mass: 0.8 }, durationInFrames: 26 });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: 1600, transform: `translateY(${y}%)` }}>
      <div
        style={{
          width: `${width}%`,
          aspectRatio: '16 / 9',
          borderRadius: 22,
          overflow: 'hidden',
          position: 'relative',
          // Frosted rim: a bright hairline on top, a dark one underneath. That
          // pair is what reads as glass; a single flat border reads as a box.
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow:
            '0 40px 120px rgba(0,0,0,0.8), 0 0 90px rgba(91,140,255,0.22), ' +
            'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.4)',
          opacity: s,
          transform: `rotate(${tilt}deg) perspective(1600px) rotateX(${(1 - s) * 18}deg) translateY(${(1 - s) * 70}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Source code, typed out.
 *
 * Deliberately not syntax-highlighted to a theme nobody recognises: two colours,
 * one for strings and one for everything else, is legible at phone size where a
 * six-colour theme turns into confetti.
 */
export const CodeCard: React.FC<{
  code: string;
  y?: number;
  width?: number;
  size?: number;
  /** Frames per character. 0 shows it all at once. */
  typeSpeed?: number;
}> = ({ code, y = 0, width = 92, size = 30, typeSpeed = 0 }) => {
  const frame = useCurrentFrame();
  const shown = typeSpeed > 0 ? code.slice(0, Math.floor(frame / typeSpeed)) : code;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `translateY(${y}%)` }}>
      <div
        style={{
          width: `${width}%`,
          background: 'linear-gradient(160deg, rgba(22,26,38,0.82), rgba(10,12,18,0.78))',
          backdropFilter: 'blur(26px)',
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 22,
          padding: '32px 30px',
          boxShadow:
            '0 40px 100px rgba(0,0,0,0.72), 0 0 70px rgba(91,140,255,0.16), ' +
            'inset 0 1px 0 rgba(255,255,255,0.22)',
          fontFamily: MONO,
          fontSize: size,
          lineHeight: 1.5,
          color: '#c9d1d9',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
        }}
      >
        {shown.split(/('[^']*')/).map((part, i) =>
          part.startsWith("'") ? (
            <span key={i} style={{ color: '#a5d6ff' }}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
        {typeSpeed > 0 && shown.length < code.length ? <span style={{ color: '#58a6ff' }}>▍</span> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Big flat statement type. Music-only reels carry the whole story here. */
export const Statement: React.FC<{
  lines: string[];
  y?: number;
  size?: number;
  accent?: string;
  /** Index of the line to paint in the accent colour. */
  hot?: number;
}> = ({ lines, y = 0, size = 96, accent = '#5b8cff', hot = -1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateY(${y}%)`,
        padding: '0 60px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {lines.map((l, i) => {
          const s = spring({ frame: frame - i * 4, fps, config: { damping: 200 }, durationInFrames: 12 });
          return (
            <div
              key={i}
              style={{
                fontFamily: 'Arial Black, Arial Bold, Arial, sans-serif',
                fontWeight: 900,
                fontSize: size,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: i === hot ? accent : '#ffffff',
                opacity: s,
                transform: `translateY(${(1 - s) * 22}px)`,
                textShadow: '0 6px 40px rgba(0,0,0,0.9)',
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
