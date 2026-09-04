import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { P } from './palette';

/**
 * Burned-in captions, revealed word by word.
 *
 * Wrap a span in *asterisks* to accent it. The span may be several words -
 * "*six out of six.*" - so the markers are tracked across the split rather than
 * tested per word. Getting that wrong prints the asterisks on screen, which is
 * exactly as bad as it sounds.
 *
 * These are not optional. Reels are watched muted; a reel whose story lives
 * only in the voiceover is a reel nobody hears.
 */

type Token = { word: string; hot: boolean };

export const parseAccents = (text: string): Token[] => {
  const tokens: Token[] = [];
  let open = false;
  for (const raw of text.split(' ')) {
    if (!raw) continue;
    let word = raw;
    const starts = word.startsWith('*');
    if (starts) word = word.slice(1);
    const ends = word.endsWith('*');
    if (ends) word = word.slice(0, -1);
    tokens.push({ word, hot: open || starts });
    if (starts && !ends) open = true;
    else if (ends) open = false;
  }
  return tokens;
};

export const Captions: React.FC<{
  text: string;
  accent?: string;
  /** Base colour for un-accented words. Defaults to the film palette bone. */
  color?: string;
  /** Distance from the bottom of the frame, as a percentage. */
  bottom?: number;
  /** Leave unset and it sizes itself down as the line gets longer. */
  size?: number;
}> = ({ text, accent = P.accent, color = P.bone, bottom = 16, size }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const tokens = parseAccents(text);
  const chars = tokens.reduce((n, t) => n + t.word.length + 1, 0);
  // A fixed size overflows the moment a line runs long, and an overflowing
  // caption is the one thing a viewer definitely notices.
  const fontSize = size ?? (chars > 52 ? 62 : chars > 38 ? 74 : chars > 26 ? 86 : 98);

  // Spread the reveal over the first 60% of the beat so the finished line has
  // time to be read before the cut.
  const perWord = (durationInFrames * 0.6) / Math.max(tokens.length, 1);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
      {/* Scrim. White type over a busy picture is unreadable without one. */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0) 42%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2px 16px',
          marginBottom: `${bottom}%`,
          paddingLeft: 64,
          paddingRight: 64,
          fontFamily: 'Arial Black, Arial Bold, Arial, Helvetica, sans-serif',
          fontWeight: 900,
          fontSize,
          lineHeight: 1.06,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          textShadow: '0 4px 26px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
        }}
      >
        {tokens.map((t, i) => {
          const s = spring({
            frame: frame - i * perWord,
            fps,
            config: { damping: 200 },
            durationInFrames: 8,
          });
          return (
            <span
              key={i}
              style={{
                color: t.hot ? accent : color,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                display: 'inline-block',
              }}
            >
              {t.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
