import React from 'react';
import {
  AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing,
} from 'remotion';
import { boil, noise } from './motion';
import { P } from './palette';

/**
 * The documentary-collage pieces.
 *
 * The format being copied here layers cut-out characters over painted
 * backgrounds. That needs transparent PNGs, and stock photography does not come
 * cut out. So the collage is built the other way that documentaries actually do
 * it: a darkened full-bleed backdrop, with bordered photo *prints* laid on top
 * at slight angles. Same depth, same movement, and it works with the
 * rectangular photos you can actually get for free.
 */

/** Teal-lit source -> warm. Sepia flattens the blue out, saturate puts the life
 *  back, and the small hue rotation stops the result going orange.
 *
 *  The whole-frame film grade cannot rescue a photo that is lit the wrong
 *  colour: a blue-LED server room stays blue and fights every warm thing
 *  layered on top of it. This converts at the source instead. */
export const WARM = 'sepia(0.72) saturate(1.45) hue-rotate(-10deg)';

/** Full-bleed background. Darkened and slightly soft, because it is scenery -
 *  anything competing with the foreground card makes the frame unreadable. */
export const PhotoBackdrop: React.FC<{
  src: string;
  push?: number;
  darken?: number;
  blur?: number;
  /** Pan direction in degrees. Vary it between beats or every scene drifts the
   *  same way and the reel starts to feel mechanical. */
  drift?: number;
  /** Extra CSS filter on this photo only - see WARM above. */
  grade?: string;
}> = ({ src, push = 0.14, darken = 0.62, blur = 3, drift = 0, grade }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.25, 0, 0.3, 1),
  });
  const rad = (drift * Math.PI) / 180;

  return (
    <AbsoluteFill style={{ backgroundColor: P.ink, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${1.12 + push * t}) translate(${Math.cos(rad) * t * 28}px, ${Math.sin(rad) * t * 28}px)`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: `blur(${blur}px)` + (grade ? ` ${grade}` : ''),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(11,9,6,${darken})` }} />
    </AbsoluteFill>
  );
};

/**
 * A photo print: white border, drop shadow, tilted a couple of degrees, with a
 * slow drift of its own. The tilt is what stops it reading as a slideshow.
 */
export const PhotoCard: React.FC<{
  src: string;
  /** Fraction of frame width. */
  width?: number;
  tilt?: number;
  x?: number;
  y?: number;
  seed?: number;
  delay?: number;
  push?: number;
  aspect?: number;
}> = ({ src, width = 0.78, tilt = -2.5, x = 0, y = -6, seed = 1, delay = 0, push = 0.1, aspect = 1.25 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const inT = interpolate(frame - delay, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const grow = interpolate(frame, [0, durationInFrames], [1, 1 + push], {
    extrapolateRight: 'clamp',
  });
  const b = boil(frame, fps, { amount: 2.4, seed });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: `${width * 100}%`,
          aspectRatio: String(aspect),
          background: '#efe6d4',
          padding: '2.2%',
          paddingBottom: '7%',
          boxShadow: '0 40px 90px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.4)',
          transform: `translate(${x + b.x}%, ${y}%) rotate(${tilt + b.rotate}deg) scale(${grow * (0.94 + inT * 0.06)})`,
          opacity: inT,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Several prints thrown down in sequence - the "newspapers flying in" beat.
 * Direction and timing are varied per card from a hash, because evenly spaced
 * cards arriving from the same angle read as a transition effect rather than as
 * a pile of evidence.
 */
export const PhotoPile: React.FC<{ srcs: string[]; every?: number }> = ({ srcs, every = 9 }) => (
  <AbsoluteFill>
    {srcs.map((src, i) => {
      const r = noise(i * 7919);
      const r2 = noise(i * 104729 + 13);
      return (
        <PhotoCard
          key={i}
          src={src}
          width={0.52}
          aspect={1.35}
          tilt={(r - 0.5) * 26}
          x={(r2 - 0.5) * 46}
          y={(noise(i * 31 + 7) - 0.5) * 34 - 6}
          seed={i + 3}
          delay={i * every}
          push={0.05}
        />
      );
    })}
  </AbsoluteFill>
);

/**
 * A screenshot, panned and zoomed toward the part that matters.
 *
 * Screenshots are wide and the frame is 1080x1920, so showing a whole one
 * fits it into a letterboxed strip too small to read on a phone. This instead
 * fills the frame and moves toward a focus point, which is both legible and
 * the closest thing to a camera move you get with a still.
 *
 * `focus` is a percentage position in the image - [8, 7] is the top-left
 * corner region, [50, 50] the middle. Set it to whatever the caption is
 * talking about, or the viewer reads the wrong thing.
 */
export const ScreenGrab: React.FC<{
  src: string;
  focus?: [number, number];
  from?: number;
  to?: number;
  /** Paper tint. Screenshots of white UI are blinding next to a film palette. */
  dim?: number;
}> = ({ src, focus = [50, 50], from = 1.05, to = 1.22, dim = 0.16 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.25, 0, 0.3, 1),
  });
  const b = boil(frame, fps, { amount: 1.6, seed: 21 });

  return (
    <AbsoluteFill style={{ backgroundColor: P.ink, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${z}) translate(${b.x}px, ${b.y}px)`,
          transformOrigin: `${focus[0]}% ${focus[1]}%`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${focus[0]}% ${focus[1]}%`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(11,9,6,${dim})` }} />
    </AbsoluteFill>
  );
};
