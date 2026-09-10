import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

/**
 * A website mockup, scrolled top to bottom, framed as a phone.
 *
 * The point of this video is that the business owner sees their own site working on a
 * phone before they have paid anything. So it has to LOOK like a phone - a bare panning
 * screenshot reads as a picture of a document, and the whole pitch is "this is real".
 *
 * Panning a tall still rather than screen-recording a browser is deliberate: there is no
 * ffmpeg on this machine, the capture is deterministic, and a real scroll recording
 * judders at whatever frame rate the browser felt like giving.
 */
export const Scroll: React.FC<{ src: string; pageHeight: number; label: string }> = ({
  src,
  pageHeight,
  label,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  // Phone screen geometry inside the 1080x1920 frame.
  const screenW = Math.round(width * 0.78);
  const screenH = Math.round(height * 0.7);
  const scale = screenW / 1080;
  const scaledPage = pageHeight * scale;
  const travel = Math.max(0, scaledPage - screenH);

  // Hold at the top for a beat so the hero registers, then scroll, then hold at the end.
  const hold = Math.round(durationInFrames * 0.12);
  const y = interpolate(
    frame,
    [hold, durationInFrames - hold],
    [0, -travel],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) },
  );

  return (
    <AbsoluteFill style={{ background: '#0a0a0c', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: '6%',
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: 34,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.01em',
          textAlign: 'center',
          maxWidth: '86%',
        }}
      >
        {label}
      </div>

      <div
        style={{
          width: screenW,
          height: screenH,
          borderRadius: 34,
          overflow: 'hidden',
          position: 'relative',
          border: '10px solid #17181b',
          boxShadow: '0 40px 120px rgba(0,0,0,0.85), 0 0 80px rgba(255,138,61,0.14)',
          background: '#fff',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            display: 'block',
            transform: `translateY(${y}px)`,
            willChange: 'transform',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '6%',
          fontFamily: 'Consolas, monospace',
          fontSize: 26,
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        @aayanrealm
      </div>
    </AbsoluteFill>
  );
};
