import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';
import { WorkflowCanvas, Graph } from '../../engine/graph';
import { FilmTreatment, LOOKS } from '../../engine/FilmTreatment';
import { P } from '../../engine/palette';
import graph from './ad-library.json';

/**
 * Reel 03 - a camera move across a real n8n workflow.
 *
 * No voice-over and no captions on purpose. This format works muted and
 * wordless: the thing on screen is doing the explaining, and adding narration
 * to it would be covering a visual that already reads.
 *
 * The whole animation is driven by one number, `wave` - a position in n8n's own
 * x coordinate space. The camera follows it, edges fire as it passes them, and
 * nodes light up behind it. One source of truth means the pulses can never
 * drift out of step with the camera.
 *
 * The graph is generated from the real exported workflow:
 *   node tools/graph.js "<workflow.json>" ad-library
 * so the node count on screen is the node count in n8n. Nothing is redrawn.
 */

const G = graph as Graph;

const xs = G.nodes.map((n) => n.x);
const ys = G.nodes.map((n) => n.y);
const X0 = Math.min(...xs);
const X1 = Math.max(...xs);
const CY = (Math.min(...ys) + Math.max(...ys)) / 2 + 48;

// Timeline, in seconds.
const T_HOLD = 2.0;    // sit on the trigger while the title lands
const T_TRAVEL = 17.5; // the pan itself
const T_PULL = 3.0;    // pull back to reveal the whole pipeline
const T_END = 4.0;     // end card over the wide shot
export const TOUR_SECONDS = T_HOLD + T_TRAVEL + T_PULL + T_END;

const CLOSE = 1.45;
// NOT wide enough to fit all 4600px of graph: at that scale (about 0.2) the
// pipeline becomes an illegible hairline and the reveal lands as nothing. This
// shows roughly half of it, which still reads as "a lot of nodes" while the
// nodes remain recognisable as nodes.
const WIDE = 0.44;

export const WorkflowTour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = (n: number) => n * fps;

  const travelEnd = s(T_HOLD + T_TRAVEL);
  const pullEnd = s(T_HOLD + T_TRAVEL + T_PULL);

  // Camera travels the pipeline, then pulls back to the middle of it.
  const travelX = interpolate(frame, [s(T_HOLD), travelEnd], [X0 + 120, X1 + 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.35, 1),
  });
  const camX = interpolate(frame, [travelEnd, pullEnd], [travelX, (X0 + X1) / 2 + 48], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const scale = interpolate(frame, [travelEnd, pullEnd], [CLOSE, WIDE], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // The wave runs slightly ahead of the camera, so a pulse is arriving into
  // frame rather than already finished by the time you see the node.
  const wave = interpolate(frame, [s(T_HOLD * 0.5), travelEnd], [X0 - 200, X1 + 400], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.35, 1),
  });

  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 14 });
  const titleOut = interpolate(frame, [s(T_HOLD + 1.2), s(T_HOLD + 2.2)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const endIn = interpolate(frame, [pullEnd - 12, pullEnd + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0d0d0f' }}>
      {/* 'terminal' rather than 'doc': node labels are 15px in graph space, and
          the heavy grain and vignette of the documentary look would bury them. */}
      <FilmTreatment look={LOOKS.terminal}>
        <WorkflowCanvas graph={G} wave={wave} camX={camX} camY={CY} scale={scale} />
      </FilmTreatment>

      {/* Opening title */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: '16%',
          opacity: titleIn * titleOut,
          transform: `translateY(${interpolate(titleIn, [0, 1], [22, 0])}px)`,
        }}
      >
        <div style={{ textAlign: 'center', background: 'rgba(13,13,15,0.86)', padding: '32px 52px' }}>
          <div
            style={{
              fontFamily: 'Arial Black, Arial, sans-serif',
              fontSize: 78,
              lineHeight: 1.04,
              color: P.bone,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            one click.
            <br />
            <span style={{ color: P.accent }}>{G.nodes.length} nodes.</span>
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: 'Consolas, Menlo, monospace',
              fontSize: 34,
              color: P.boneDim,
            }}
          >
            finds businesses paying for ads
            <br />
            with no working website
          </div>
        </div>
      </AbsoluteFill>

      {/* End card, held in the lower third so the revealed graph stays visible
          above it. Centred, it covered the very thing the pull-back exists to
          show. */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '12%',
          opacity: endIn,
          transform: `translateY(${(1 - endIn) * 40}px)`,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'Arial, Helvetica, sans-serif',
            background: 'rgba(13,13,15,0.9)',
            padding: '40px 60px',
          }}
        >
          <div style={{ fontSize: 38, letterSpacing: '0.3em', color: P.boneFaint }}>OPEN SOURCE</div>
          <div style={{ fontFamily: 'Consolas, Menlo, monospace', fontSize: 62, color: P.bone, margin: '24px 0 14px' }}>
            n8n-meta-ad-library-leads
          </div>
          <div style={{ fontSize: 40, color: P.accent }}>free, runs on your own machine</div>
          <div style={{ fontSize: 46, color: P.boneDim, marginTop: 48 }}>@aayanrealm</div>
        </div>
      </AbsoluteFill>

      {/*
        Chosen on measurements from `node tools/audition.js`, not on the title.
        Against the eight other cleared tracks this one is the darkest
        (brightness 0.105), the most present (RMS 0.397) and has a steady 3.97
        onsets/sec with low variance - which is what sits under a constant camera
        move. The previous pick, sun-and-his-daughter, measured 1.97 onsets/sec:
        too sparse and slow to carry a moving shot with no narration.

        startFrom skips to 63s, the steadiest 27-second window in the track
        (variance 0.03). There is no intro to protect - it is already at full
        energy by the first second - this is purely the flattest stretch.

        Gain is 0.24 rather than the 0.3 used before, because this track is
        about 1.6x louder; at the old gain it would arrive noticeably hotter.
      */}
      <Audio
        src={staticFile('music/deep-techno-ambience.mp3')}
        startFrom={Math.round(63 * fps)}
        volume={(f) =>
          interpolate(f, [0, fps, durationInFrames - fps * 2, durationInFrames], [0, 0.24, 0.24, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
    </AbsoluteFill>
  );
};
