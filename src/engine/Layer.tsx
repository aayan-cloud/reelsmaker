import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { boil } from './motion';

/**
 * One plane of a scene. `depth` is the only dial that matters:
 *
 *   0.0  the far background - pushes in slowly, drifts least
 *   1.0  the subject
 *   1.8  something in front of the subject
 *
 * Depth drives push-in speed AND drift amount together, which is the whole
 * trick. A background that pushes in at the same rate as the character is a
 * flat picture being zoomed. Different rates and the brain reads it as space.
 */
export const Layer: React.FC<{
  depth?: number;
  /** Total scale gained over the layer's life. 0.08 = an 8% push-in. */
  push?: number;
  seed?: number;
  /** Sub-pixel drift. Set to 0 for text, which must never wobble. */
  life?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ depth = 1, push = 0.08, seed = 0, life = 2, style, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1 + push * (0.4 + depth)],
    { extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0, 0.25, 1) },
  );

  const b = life ? boil(frame, fps, { amount: life * (0.4 + depth * 0.6), seed }) : null;

  return (
    <AbsoluteFill
      style={{
        transform: b
          ? `scale(${scale}) translate(${b.x}px, ${b.y}px) rotate(${b.rotate}deg)`
          : `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * The fake shadow from the video: duplicate the subject, blacken it, skew it
 * onto the floor. Costs nothing and is the difference between a character
 * standing on the ground and a cut-out floating over it.
 */
export const GroundShadow: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  skew?: number;
}> = ({ children, opacity = 0.45, skew = -38 }) => (
  <AbsoluteFill
    style={{
      transform: `translateY(38%) scaleY(0.34) skewX(${skew}deg)`,
      transformOrigin: 'bottom center',
      filter: `brightness(0) blur(9px) opacity(${opacity})`,
    }}
  >
    {children}
  </AbsoluteFill>
);
