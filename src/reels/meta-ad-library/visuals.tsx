import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring,
} from 'remotion';
import { posterizeTime } from '../../engine/motion';
import { P } from '../../engine/palette';

/**
 * Visuals specific to this reel. Reel-specific pieces live with the reel; only
 * things a second reel would reuse are promoted into `engine/`.
 */

const MONO = 'Consolas, Menlo, monospace';
const SANS = 'Arial, Helvetica, sans-serif';

/**
 * Two numbers that should have matched and didn't.
 *
 * The whole beat rests on the viewer noticing that 21 and 15 came from the same
 * settings, so the second number arrives late and in red rather than both
 * appearing together.
 */
export const VersusStat: React.FC<{
  a: number; b: number; labelA: string; labelB: string; revealAt?: number;
}> = ({ a, b, labelA, labelB, revealAt = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inB = spring({ frame: frame - revealAt, fps, config: { damping: 14 }, durationInFrames: 20 });

  const Cell: React.FC<{ v: number; label: string; color: string; o: number; y: number }> = ({
    v, label, color, o, y,
  }) => (
    <div style={{ textAlign: 'center', opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: SANS, fontSize: 34, letterSpacing: '0.3em', color: P.boneFaint }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 280, lineHeight: 0.95, color,
        textShadow: P.shadow }}>
        {v}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 380 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
        <Cell v={a} label={labelA} color={P.bone} o={interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })} y={0} />
        <div style={{ fontFamily: SANS, fontSize: 90, color: P.boneFaint, opacity: inB }}>vs</div>
        <Cell v={b} label={labelB} color={P.bad} o={inB} y={interpolate(inB, [0, 1], [30, 0])} />
      </div>
      <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 40, color: P.boneDim, opacity: inB }}>
        identical settings
      </div>
    </AbsoluteFill>
  );
};

/** The verdict table - what counts as a dead site and what does not. */
export const VerdictTable: React.FC = () => {
  const frame = useCurrentFrame();
  const rows: [string, string, boolean][] = [
    ['domain does not resolve', 'DEAD', true],
    ['404 / 410', 'DEAD', true],
    ['parked or empty page', 'DEAD', true],
    ['timeout', 'INCONCLUSIVE', false],
    ['connection reset', 'INCONCLUSIVE', false],
    ['403 / 429 / 5xx', 'INCONCLUSIVE', false],
  ];
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 400 }}>
      <div style={{ width: '84%', fontFamily: MONO, fontSize: 38 }}>
        {rows.map(([what, verdict, dead], i) => {
          const o = interpolate(frame - i * 7, [0, 10], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 26px', marginBottom: 12, opacity: o,
                background: 'rgba(0,0,0,0.55)',
                borderLeft: `6px solid ${dead ? P.bad : P.good}`,
              }}
            >
              <span style={{ color: P.bone }}>{what}</span>
              <span style={{ color: dead ? P.bad : P.good, fontWeight: 700 }}>{verdict}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * The funnel, then the repo name.
 *
 * One beat rather than two because the numbers ARE the payoff - cutting to a
 * clean end card first would throw away the moment the claim gets evidence.
 */
export const FunnelToOutro: React.FC<{
  /** Small label above the title. */
  eyebrow?: string;
  /** The big line. Put a REPO NAME here only once that repo is actually public -
   *  an end card pointing at a 404 costs more trust than no end card at all. */
  title: string;
  sub: string;
  handle: string;
}> = ({ eyebrow = 'BUILT IN PUBLIC', title, sub, handle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stages: [number, string][] = [[166, 'ads scraped'], [40, 'candidates'], [28, 'site checks'], [14, 'real leads']];
  const max = stages[0][0];

  const outroAt = durationInFrames - Math.round(fps * 3.2);
  const toOutro = interpolate(frame, [outroAt, outroAt + 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 380 }}>
      <div style={{ width: '80%', opacity: 1 - toOutro, transform: `translateY(${-toOutro * 60}px)` }}>
        {stages.map(([n, label], i) => {
          const t = interpolate(frame - i * 10, [0, 18], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
          });
          const last = i === stages.length - 1;
          // Counted on a posterized clock: a number ticking at 30fps is noise,
          // at 12 it reads as a machine working.
          const shown = Math.round(interpolate(posterizeTime(frame - i * 10, fps, 12), [0, 18], [0, n], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          }));
          return (
            <div key={i} style={{ marginBottom: 30, opacity: t }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO,
                fontSize: 40, color: last ? P.good : P.boneDim, marginBottom: 10 }}>
                <span>{label}</span>
                <span style={{ fontWeight: 700 }}>{shown}</span>
              </div>
              <div style={{ height: 22, background: P.rule }}>
                <div style={{ height: '100%', width: `${(n / max) * 100 * t}%`,
                  background: last ? P.good : P.boneDim,
                  boxShadow: 'none' }} />
              </div>
            </div>
          );
        })}
      </div>

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 380,
        opacity: toOutro, transform: `translateY(${(1 - toOutro) * 50}px)` }}>
        <div style={{ textAlign: 'center', fontFamily: SANS }}>
          <div style={{ fontSize: 40, letterSpacing: '0.3em', color: P.boneFaint }}>{eyebrow}</div>
          <div style={{ fontFamily: MONO, fontSize: 68, color: P.bone, margin: '26px 0 16px' }}>{title}</div>
          <div style={{ fontSize: 42, color: P.accent }}>{sub}</div>
          <div style={{ fontSize: 48, color: P.boneDim, marginTop: 56 }}>{handle}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A number stamped over a screenshot.
 *
 * The screenshot is the evidence; this is the headline. Relying on the number
 * as it appears inside the capture does not survive the frame - it sits at the
 * top edge where the vignette is darkest and the corner blur is softest, and on
 * a phone it is simply unreadable. Stamping it also means the viewer reads the
 * figure the caption is talking about rather than whichever number their eye
 * happens to land on.
 */
export const Stamp: React.FC<{
  value: string;
  label: string;
  color?: string;
  /** Distance from the top, in %. */
  top?: number;
}> = ({ value, label, color = P.bone, top = 17 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 10 });
  const rule = interpolate(frame, [6, 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: `${top}%` }}>
      <div
        style={{
          textAlign: 'center',
          opacity: s,
          transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
          background: 'rgba(11,9,6,0.82)',
          padding: '34px 56px 40px',
        }}
      >
        <div
          style={{
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: 170,
            lineHeight: 0.92,
            color,
            letterSpacing: '-0.03em',
            textShadow: P.shadow,
          }}
        >
          {value}
        </div>
        <div
          style={{
            height: 3,
            background: color,
            opacity: 0.85,
            margin: '22px auto 20px',
            width: `${rule * 100}%`,
          }}
        />
        <div
          style={{
            fontFamily: 'Consolas, Menlo, monospace',
            fontSize: 40,
            color: P.boneDim,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
