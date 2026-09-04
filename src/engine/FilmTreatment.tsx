import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { gateWeave, posterizeTime } from './motion';

/**
 * The film look. Wrap a scene in this and a flat digital image starts reading
 * as footage.
 *
 * This is the single highest-leverage component in the project. Six layers, in
 * this order, because the order is what makes it convincing:
 *
 *   1. gate weave   - the whole frame drifts, sub-pixel
 *   2. corner blur  - lenses are not sharp at the edges
 *   3. texture A    - a bright, low-contrast wash that lifts the blacks
 *   4. scan lines   - 1.6px, 16% (the spec that makes it feel like a broadcast)
 *   5. grain        - animated at 12fps, never at frame rate
 *   6. vignette     - last, so it darkens everything above it too
 *
 * Nothing here needs a downloaded asset. The grain is feTurbulence and the rest
 * is gradients, which is deliberate: an asset pack is one more thing to lose.
 */

export type Treatment = {
  grain?: number;
  scanLines?: number;
  vignette?: number;
  cornerBlur?: number;
  weave?: number;
  grade?: string;
};

export const LOOKS: Record<string, Treatment> = {
  // The default. Warm, heavy, 1970s documentary.
  doc: { grain: 0.24, scanLines: 0.13, vignette: 0.56, cornerBlur: 6, weave: 1.2,
    // Warm and slightly desaturated. Film never records the saturation a screen
    // emits, and pulling it back is most of what makes a stock photo stop
    // looking like a stock photo.
    grade: 'sepia(0.26) saturate(0.76) contrast(1.14) brightness(0.99)' },
  // For screen recordings and data. Keeps text legible - grain over 12px type
  // is the fastest way to make a reel unwatchable on a phone.
  terminal: { grain: 0.12, scanLines: 0.07, vignette: 0.4, cornerBlur: 2, weave: 0.6,
    grade: 'sepia(0.1) saturate(0.9) contrast(1.06)' },
  // Clean. For the last beat, when you want the repo name to be readable.
  clean: { grain: 0.07, scanLines: 0, vignette: 0.28, cornerBlur: 0, weave: 0.4,
    grade: 'sepia(0.12) saturate(0.88)' },
};

export const FilmTreatment: React.FC<{ look?: Treatment; children: React.ReactNode }> = ({
  look = LOOKS.doc,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = gateWeave(frame, fps, look.weave ?? 1.2);

  // Grain must advance on its own clock. Tied to the frame it strobes; held at
  // 12fps it reads as emulsion.
  const seed = posterizeTime(frame, fps, 12);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `translate(${w.x}px, ${w.y}px) rotate(${w.rotate}deg) scale(1.02)`,
          filter: look.grade && look.grade !== 'none' ? look.grade : undefined,
        }}
      >
        {children}
      </AbsoluteFill>

      {look.cornerBlur ? (
        <AbsoluteFill
          style={{
            backdropFilter: `blur(${look.cornerBlur}px)`,
            WebkitMaskImage:
              'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 55%, black 100%)',
            maskImage:
              'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 55%, black 100%)',
          }}
        />
      ) : null}

      {/* Texture sandwich, layer A: lifts the blacks so nothing is pure #000. */}
      <AbsoluteFill
        style={{
          background:
            // Both ends warm. The old version put a blue wash in the shadows,
            // which is a digital-teal look, not a film one.
            'linear-gradient(115deg, rgba(255,224,176,0.13), rgba(0,0,0,0) 46%, rgba(186,118,58,0.08))',
          mixBlendMode: 'screen',
        }}
      />

      {look.scanLines ? (
        <AbsoluteFill
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,${look.scanLines}) 0px, rgba(0,0,0,${look.scanLines}) 1.6px, rgba(0,0,0,0) 1.6px, rgba(0,0,0,0) 4.2px)`,
          }}
        />
      ) : null}

      {look.grain ? (
        <AbsoluteFill style={{ opacity: look.grain, mixBlendMode: 'overlay' }}>
          <svg width="100%" height="100%">
            <filter id={`grain-${seed}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves={3}
                seed={seed}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
          </svg>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,${look.vignette ?? 0.7}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
