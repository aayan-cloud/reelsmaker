import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { Cuts } from '../../engine/screen';
import { Stage, KineticType, BigFigure, K } from '../../engine/kinetic';
import { Flash } from '../../engine/ui';

/**
 * Reel 09 - "stop asking me to automate your cold outreach". Real screens, negative
 * the whole way.
 *
 * WHY THIS WAS REBUILT FROM SCRATCH
 *
 * The first two cuts were word cards - kinetic type on a gradient, every single frame.
 * That is a slideshow, and it is exactly what this project's own capture.js warns
 * against in its header: "the reels in this project show beautiful recreations instead
 * ... a viewer cannot verify a recreation. Polish reads as an advert; a screen recording
 * reads as a peer showing you something."
 *
 * The outlier research done for this reel said the same thing and was ignored while
 * writing it. Of twelve outliers pulled from Instagram and TikTok, the formats were
 * "split screen (creator + screen recording)", "talking head with b-roll cutaways",
 * "screen recording with voiceover", "POV / screen recording blend". Not one was
 * animated text on a background.
 *
 * So every beat here is now a real screenshot, captured by tools/shot-sunbiz.js:
 *
 *   terminal.png   the prospector's real stdout, hit marks and all
 *   blocked.png    what the run actually printed when Google cut it off
 *   maps-N.png     live Google Maps panels for real leads
 *   table.png      the real CSV rows, real businesses, real phone numbers
 *
 * The strongest frame in the reel is Google's own "Add missing information -> Add
 * website" prompt sitting under a 4.7-star business with 277 reviews. That is Google
 * saying the website is missing, in Google's interface, about a business a viewer can
 * look up themselves. Nothing drawn could compete with it.
 *
 * Text is now an OVERLAY on the footage rather than the content of the frame.
 */

const pad = (n: number) => n + 0.25;

/**
 * A real screenshot, filling most of the phone frame, drifting slowly.
 *
 * The drift matters. A static screenshot held for three seconds reads as a still image
 * and the eye leaves; a slow push keeps it alive without competing with the text. Width
 * is 54% rather than full-bleed so the captures stay phone-shaped and there is room for
 * a line above them.
 */
const Proof: React.FC<{ src: string; from?: number; to?: number; y?: number; w?: number }> = ({
  src,
  from = 1,
  to = 1.09,
  y = 6,
  // Width has to follow the capture's shape. The Maps panels are tall and narrow and
  // want ~54%; the terminal and table shots are landscape and disappear at that width.
  w = 54,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: `${w}%`,
          transform: `translateY(${y}%) scale(${scale})`,
          borderRadius: 26,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 46px 120px rgba(0,0,0,0.85), 0 0 90px rgba(255,122,69,0.18)',
        }}
      >
        <Img src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
      </div>
    </AbsoluteFill>
  );
};

/** One line of text riding above the footage, not replacing it. */
const Over: React.FC<{ text: string; top?: string }> = ({ text, top = '9%' }) => (
  <AbsoluteFill style={{ alignItems: 'center', paddingTop: top }}>
    <div
      style={{
        maxWidth: '86%',
        textAlign: 'center',
        fontFamily: 'Segoe UI, -apple-system, Helvetica Neue, Arial, sans-serif',
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.08,
        letterSpacing: '-0.02em',
        color: '#fff',
        textShadow: '0 8px 40px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.9)',
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Handle: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '12%' }}>
    <div style={{ fontFamily: 'Consolas, monospace', fontSize: 34, color: 'rgba(255,255,255,0.42)' }}>
      @aayanrealm
    </div>
  </AbsoluteFill>
);

export const beats: Beat[] = [
  // --- the refusal, over the tool actually running --------------------------------------
  {
    seconds: pad(3.14),
    caption: '',
    vo: 'vo/stopasking/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0, volume: 0.5 }],
    Visual: () => (
      <Stage>
        <Proof src="shots/sunbiz/terminal.png" y={12} w={84} />
        <Over text="Stop asking me to automate your cold outreach" />
      </Stage>
    ),
  },

  // --- reason one: it is a lawsuit ---------------------------------------------------------
  {
    seconds: pad(3.96),
    caption: '',
    vo: 'vo/stopasking/02.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 1.5, volume: 0.55 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            node: (
              <Stage>
                <Proof src="shots/sunbiz/table.png" y={10} w={82} />
                <Over text="One marketing text. In Florida." />
              </Stage>
            ),
          },
          {
            weight: 1.3,
            node: (
              <Stage>
                <Flash at={0} />
                <BigFigure value="$1,500" label="PER MESSAGE" accent={K.accentWarm} />
              </Stage>
            ),
          },
        ]}
      />
    ),
  },

  // --- reason two: the data is worse than they think -----------------------------------------
  {
    seconds: pad(4.97),
    caption: '',
    vo: 'vo/stopasking/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.1, volume: 0.24 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 1.15,
            node: (
              <Stage>
                <Proof src="shots/sunbiz/terminal.png" y={12} w={84} from={1.06} to={1} />
                <Over text="I scraped the entire state registry" />
              </Stage>
            ),
          },
          {
            node: (
              <Stage>
                <Flash at={0} />
                <BigFigure value="4.5%" label="ACTUALLY USABLE" accent={K.accentWarm} />
              </Stage>
            ),
          },
        ]}
      />
    ),
  },

  // --- reason three: it does not even finish ---------------------------------------------------
  // The real terminal, with the real message. This is the beat that would be worthless
  // as a drawn card and is unarguable as a screenshot.
  {
    seconds: pad(3.19),
    caption: '',
    vo: 'vo/stopasking/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 1.1, volume: 0.55 }],
    Visual: () => (
      <Stage>
        <Proof src="shots/sunbiz/blocked.png" y={10} w={86} from={1} to={1.11} />
        <Over text="Then Google blocked me" />
      </Stage>
    ),
  },

  // --- the cost -----------------------------------------------------------------------------------
  {
    seconds: pad(3.82),
    caption: '',
    vo: 'vo/stopasking/05.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.32 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            node: (
              <Stage>
                <BigFigure value="22" label="PAGE LOADS PER LEAD" accent={K.accentWarm} />
              </Stage>
            ),
          },
          {
            weight: 1.2,
            node: (
              <Stage>
                {/* Google's own "Add website" prompt, on a 4.7-star business. */}
                <Proof src="shots/sunbiz/maps-2.png" y={7} from={1.04} to={1.12} />
                <Over text="To find one of these" />
              </Stage>
            ),
          },
        ]}
      />
    ),
  },

  // --- the verdict, three hits -----------------------------------------------------------------------
  {
    seconds: pad(5.76),
    caption: '',
    vo: 'vo/stopasking/06.mp3',
    look: 'clean',
    sfx: [
      { src: 'sfx/impact.wav', at: 0.1, volume: 0.5 },
      { src: 'sfx/impact.wav', at: 1.7, volume: 0.5 },
      { src: 'sfx/sub.wav', at: 3.3, volume: 0.4 },
    ],
    Visual: () => (
      <Cuts
        shots={[
          {
            node: (
              <Stage>
                <Proof src="shots/sunbiz/maps-4.png" y={8} from={1.05} to={1.11} />
                <Over text="Your list is garbage" />
              </Stage>
            ),
          },
          {
            node: (
              <Stage>
                <Flash at={0} />
                <KineticType text="Your tool is a *lawsuit*" size={116} stagger={2} accent={K.accentWarm} />
              </Stage>
            ),
          },
          {
            weight: 1.5,
            node: (
              <Stage>
                <Flash at={0} />
                <KineticType text="*Don't* ask me to build it" size={118} stagger={2} accent={K.accentWarm} />
                <Handle />
              </Stage>
            ),
          },
        ]}
      />
    ),
  },
];
