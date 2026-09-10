import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

/**
 * The split-screen presenter layout.
 *
 * Built from a reel Aayan sent as reference (instagram.com/reel/DLlLmRPgX96). Watched
 * and broken down rather than guessed at, and the breakdown corrected two assumptions:
 *
 *   - the presenter is a REAL person at a desk, not an AI avatar
 *   - the format is a split, not a talking head with cutaways: screen recording fills
 *     the upper ~60% and the presenter stays visible in the lower ~40% the whole time
 *
 * That persistent lower band is the thing text-only reels cannot buy. A face is on
 * screen continuously, so there is always a person to watch even while the interesting
 * information is happening above them.
 *
 * Captions in the reference are one to three words at a time, animated word by word,
 * white with a single bright accent colour on the number or the claim. `PunchWords`
 * below does that.
 */

const SANS = 'Segoe UI, -apple-system, Helvetica Neue, Arial, sans-serif';

/**
 * Screen on top, presenter underneath.
 *
 * `screenRatio` is the share of the frame the screen content gets. The reference sits
 * between 0.55 and 0.65 depending on the shot; 0.58 keeps a phone-shaped capture
 * readable while leaving the presenter a band big enough to read expression in.
 */
export const Split: React.FC<{
  screen: React.ReactNode;
  presenter: React.ReactNode;
  screenRatio?: number;
}> = ({ screen, presenter, screenRatio = 0.58 }) => (
  <AbsoluteFill>
    <div style={{ position: 'absolute', inset: 0, bottom: `${(1 - screenRatio) * 100}%`, overflow: 'hidden' }}>
      {screen}
    </div>
    <div style={{ position: 'absolute', inset: 0, top: `${screenRatio * 100}%`, overflow: 'hidden' }}>
      {presenter}
    </div>
    {/* A hairline seam. Without it the two halves read as one broken image. */}
    <div
      style={{
        position: 'absolute',
        top: `${screenRatio * 100}%`,
        left: 0,
        right: 0,
        height: 2,
        background: 'rgba(255,255,255,0.14)',
      }}
    />
  </AbsoluteFill>
);

/**
 * The presenter's own footage, cropped to fill its band.
 *
 * `focus` is where in the SOURCE frame to keep when cropping, as a percentage from the
 * top. It defaults to 32% rather than the centre because a 9:16 clip squeezed into a
 * short band crops from both edges, and centring it cut the presenter's head off at the
 * top of the band - the one part of a person that has to be in shot.
 */
export const Presenter: React.FC<{ src: string; startFrom?: number; focus?: number }> = ({
  src,
  startFrom = 0,
  focus = 32,
}) => (
  <OffthreadVideo
    src={staticFile(src)}
    startFrom={startFrom}
    muted
    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${focus}%` }}
  />
);

/**
 * Stand-in for footage that does not exist yet.
 *
 * Deliberately ugly and labelled. A placeholder that looks like a design decision gets
 * shipped by accident; one that says "camera goes here" does not.
 */
export const PresenterSlot: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'repeating-linear-gradient(45deg,#141418,#141418 22px,#1b1b21 22px,#1b1b21 44px)',
      justifyContent: 'center',
      alignItems: 'center',
      border: '3px dashed rgba(255,122,69,0.55)',
    }}
  >
    <div style={{ textAlign: 'center', fontFamily: SANS, color: 'rgba(255,255,255,0.75)' }}>
      <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em' }}>YOUR CAMERA HERE</div>
      <div style={{ fontSize: 26, marginTop: 12, color: 'rgba(255,255,255,0.45)' }}>
        phone at desk height · 30s talking to lens
      </div>
    </div>
  </AbsoluteFill>
);

/** A still screenshot in the top band, drifting so it does not read as a frozen image. */
export const ScreenShot: React.FC<{ src: string; from?: number; to?: number }> = ({
  src,
  from = 1.02,
  to = 1.12,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#08080b' }}>
      <Img
        src={staticFile(src)}
        style={{ width: '100%', transform: `scale(${scale})`, display: 'block' }}
      />
    </AbsoluteFill>
  );
};

/**
 * Captions the way the reference does them: one to three words on screen at a time,
 * swapping fast, one accent colour for the word that carries the claim.
 *
 * Marked with asterisks - "*$1,500* per message" - same convention the rest of this
 * engine uses. Punctuation must stay INSIDE the closing marker or the asterisk renders
 * literally, which has bitten this project twice.
 */
export const PunchWords: React.FC<{
  text: string;
  perChunk?: number;
  size?: number;
  accent?: string;
  bottom?: string;
}> = ({ text, perChunk = 2, size = 82, accent = '#2ecc8f', bottom = '6%' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; i += perChunk) chunks.push(words.slice(i, i + perChunk));

  const per = Math.max(1, Math.floor(durationInFrames / Math.max(1, chunks.length)));
  const i = Math.min(chunks.length - 1, Math.floor(frame / per));
  const local = frame - i * per;
  // A short pop on each swap. Enough to register the change without bouncing.
  const pop = interpolate(local, [0, 4], [0.9, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom }}>
      <div
        style={{
          display: 'flex',
          gap: '0.28em',
          transform: `scale(${pop})`,
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: '-0.03em',
          textShadow: '0 6px 34px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.9)',
        }}
      >
        {(chunks[i] || []).map((w, n) => {
          const hot = w.startsWith('*') && w.endsWith('*');
          return (
            <span key={n} style={{ color: hot ? accent : '#fff' }}>
              {hot ? w.slice(1, -1) : w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
