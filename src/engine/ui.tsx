import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

/**
 * The designed-interface look.
 *
 * WHY THIS EXISTS, AND WHY IT REPLACES THE SCREENSHOT APPROACH
 *
 * Reel 06 tried to satisfy "show the real tool" by scaling captured web pages
 * into a letterboxed band. On a 1080-wide phone frame that renders the text at
 * roughly eight pixels - nobody can read the star count, so the shot proves
 * nothing and looks like a grey rectangle floating in space.
 *
 * The reference reel does not use screen recordings at all. It BUILDS the
 * interface: a prompt box that types itself, a cursor that moves and clicks with
 * a bounce, a punch-in onto the button, a flash cut, then streaming output. Every
 * element is drawn at a size that reads on a phone because it was composed for
 * one, rather than shrunk to fit.
 *
 * That is also more honest for our purposes than it sounds. The words typed and
 * the output streamed are the real ones our tool takes and produces; only the
 * chrome around them is drawn.
 */

/** Warm palette, lifted from the reference: terracotta on near-black, cream type. */
export const W = {
  ink: '#0D0C0B',
  inkDeep: '#080808',
  cream: '#F4EFEA',
  muted: '#8C867F',
  accent: '#D97736',
  accentDeep: '#CC6536',
  panel: '#1F1D1B',
  panelEdge: '#332F2B',
} as const;

const SERIF = 'Georgia, Tiempos Headline, Times New Roman, serif';
const SANS = 'Segoe UI, Inter, -apple-system, Helvetica Neue, Arial, sans-serif';
const MONO = 'Consolas, JetBrains Mono, Menlo, monospace';

/**
 * Near-black ground with one warm bloom behind the content.
 *
 * A single large, heavily blurred radial at low opacity. Bigger and softer than
 * instinct suggests: at 20-30% it reads as light in a room, and anything
 * stronger reads as a coloured circle someone drew.
 */
export const Room: React.FC<{ children?: React.ReactNode; bloom?: number }> = ({
  children,
  bloom = 1,
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 38) * 0.06;

  return (
    <AbsoluteFill style={{ backgroundColor: W.ink, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 66% 40% at 50% 48%, rgba(217,119,54,${0.34 * bloom * pulse}), rgba(13,12,11,0) 72%)`,
          filter: 'blur(40px)',
        }}
      />
      {children}
      {/* Vignette last, so the corners stay put under everything above. */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 88% 72% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Serif headline, the reference's voice. Title case, not shouting. */
export const Head: React.FC<{
  text: string;
  size?: number;
  y?: number;
  accentWord?: string;
  /** Skip the entrance. The FIRST frame of a reel must already be full - a
   *  headline fading up over 14 frames means the opening half-second, the only
   *  part most viewers see, is an empty screen. */
  instant?: boolean;
  sub?: string;
}> = ({ text, size = 84, y = 0, accentWord, instant = false, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = instant ? 1 : spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });

  return (
    <AbsoluteFill
      style={{ justifyContent: 'center', alignItems: 'center', padding: '0 70px', transform: `translateY(${y}%)` }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontSize: size,
          lineHeight: 1.14,
          color: W.cream,
          textAlign: 'center',
          opacity: s,
          // Drifts up on entry rather than springing - the reference is calm.
          transform: `translateY(${(1 - s) * 18}px)`,
          textShadow: '0 0 60px rgba(217,119,54,0.30)',
        }}
      >
        {text.split(' ').map((word, i) => (
          <span key={i} style={{ color: accentWord && word.toLowerCase().includes(accentWord.toLowerCase()) ? W.accent : undefined }}>
            {word}{' '}
          </span>
        ))}
        {/* The subline belongs to the headline, so it is grouped with it rather
            than pinned to the bottom of the frame. Stranding it 30% away reads
            as two unrelated things that happen to share a screen. */}
        {sub ? (
          <div style={{ marginTop: 26, fontSize: size * 0.36, color: W.muted, lineHeight: 1.3 }}>{sub}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/**
 * A prompt box that types itself.
 *
 * `startAt` and `cps` are in frames and characters-per-second so the typing can
 * be sync-locked to a keystroke sound rather than guessed at.
 */
export const Prompt: React.FC<{
  text: string;
  placeholder?: string;
  startAt?: number;
  cps?: number;
  model?: string;
  y?: number;
  instant?: boolean;
}> = ({
  text,
  placeholder = 'How can I help you today?',
  startAt = 0,
  cps = 26,
  model = 'reelsmaker',
  y = 0,
  instant = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = instant ? 1 : spring({ frame, fps, config: { damping: 200 }, durationInFrames: 16 });

  const typed = Math.max(0, Math.floor(((frame - startAt) / fps) * cps));
  const shown = text.slice(0, typed);
  const done = typed >= text.length;
  const caret = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', transform: `translateY(${y}%)` }}>
      <div
        style={{
          width: '84%',
          background: W.panel,
          border: `1px solid ${W.panelEdge}`,
          borderRadius: 22,
          padding: '30px 30px 22px',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 26}px)`,
          boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 34, color: shown ? W.cream : W.muted, minHeight: 46, lineHeight: 1.35 }}>
          {shown || placeholder}
          {!done && caret ? <span style={{ color: W.accent }}>▌</span> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 26, gap: 14 }}>
          <div style={{ fontFamily: SANS, fontSize: 30, color: W.muted }}>+</div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 24,
              color: W.muted,
              border: `1px solid ${W.panelEdge}`,
              borderRadius: 999,
              padding: '7px 16px',
            }}
          >
            {model} ⌄
          </div>
          <div style={{ flex: 1 }} />
          {/* The send button. The punch-in lands here, so it has to be findable. */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              background: W.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: '#1a0f06',
              fontWeight: 700,
            }}
          >
            ↑
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Camera punch-in toward a point.
 *
 * `at` is a percentage of the frame, so a shot can name where it is going
 * without knowing pixel positions. Scaling around a focal point means
 * translating by the offset from centre as well as scaling, or the target slides
 * out of frame exactly when it should be filling it.
 */
export const PunchIn: React.FC<{
  children: React.ReactNode;
  at?: [number, number];
  to?: number;
  startAt?: number;
  frames?: number;
}> = ({ children, at = [50, 50], to = 2.4, startAt = 0, frames = 18 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [startAt, startAt + frames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const scale = 1 + (to - 1) * t;
  const dx = ((50 - at[0]) / 100) * 1080 * (scale - 1);
  const dy = ((50 - at[1]) / 100) * 1920 * (scale - 1);

  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, transformOrigin: 'center' }}>
      {children}
    </AbsoluteFill>
  );
};

/** The pixel cursor, moving to a target and clicking with a bounce. */
export const Cursor: React.FC<{ from?: [number, number]; to: [number, number]; arriveAt: number }> = ({
  from = [30, 80],
  to,
  arriveAt,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [arriveAt - 16, arriveAt], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const x = from[0] + (to[0] - from[0]) * t;
  const y = from[1] + (to[1] - from[1]) * t;
  // scale(1) -> 0.92 -> 1 on contact, which is what reads as a click.
  const press = interpolate(frame, [arriveAt, arriveAt + 3, arriveAt + 8], [1, 0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `scale(${press})` }}>
        <svg width="42" height="42" viewBox="0 0 24 24">
          <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.5 L12 14.5 L19 14 Z" fill="#fff" stroke="#000" strokeWidth="1.2" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/** A white flash on the cut. Two frames; longer reads as a mistake. */
export const Flash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 1, at, at + 3], [0, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{ backgroundColor: '#fff', opacity: o }} />;
};

/** Output streaming in a terminal, line by line. */
export const Streaming: React.FC<{ lines: string[]; startAt?: number; every?: number }> = ({
  lines,
  startAt = 0,
  every = 5,
}) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor((frame - startAt) / every));

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 50px' }}>
      <div
        style={{
          width: '100%',
          fontFamily: MONO,
          fontSize: 30,
          lineHeight: 1.6,
          color: W.accent,
          whiteSpace: 'pre-wrap',
        }}
      >
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} style={{ opacity: interpolate(frame - startAt - i * every, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** One word at a time, flash-cut. The reference ends on these. */
export const FlashWords: React.FC<{ words: string[]; size?: number }> = ({ words, size = 120 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const per = Math.max(1, Math.floor(durationInFrames / words.length));
  const i = Math.min(words.length - 1, Math.floor(frame / per));

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: size,
          color: W.cream,
          textShadow: '0 0 70px rgba(217,119,54,0.5)',
        }}
      >
        {words[i]}
      </div>
    </AbsoluteFill>
  );
};
