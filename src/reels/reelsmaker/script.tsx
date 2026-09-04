import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { FrameSequence, ScreenCard, CodeCard, Statement } from '../../engine/screen';
import { Stage } from '../../engine/kinetic';
import D from '../../../tools/vo-durations.reelsmaker.json';

/**
 * Reel 05 - Reelsmaker.
 *
 * BUILT FROM RESEARCH, NOT INSTINCT.
 *
 * 22 outlier reels in this niche were pulled and read before a line of this was
 * written. Three findings shaped it, and each one contradicts what the earlier
 * reels in this project did:
 *
 *   1. BEFORE/AFTER IS THE BODY. Every one of the biggest multipliers was a
 *      comparison - 795x, 264x ("2 HOURS" vs "10 MINUTES"), 216x, 188x. So the
 *      spine here is a text file on one side and the finished video on the
 *      other, and the finished video is a real one this repo actually rendered.
 *
 *   2. SHORTER, AND LOOPING. The top performers run 7-23 seconds with
 *      `is_looped: true`. The earlier reels here ran 23-30s. This is 14.
 *
 *   3. SHORT LINES. Many of the biggest outliers had no narration at all. This
 *      keeps a voice, because the channel has one, but the lines are written to
 *      fit beats that were already short rather than the other way round - which
 *      is what made the earlier reels here run long.
 *
 * Every number is measured. 94 seconds is the real render time of the Repurposer
 * reel on this machine, timed on 2026-09-04; 23 seconds is its real length. The
 * footage is genuine capture from `tools/capture.js`, not a mock-up.
 */

const FPS = 30;
// Beats are timed from the measured length of each voice MP3, never a round
// number. Timing a beat to a guess is how a line gets cut off mid-word.
const sec = (n: number) => n + 0.3;

// A real beat from the Repurposer script - the file that produced the video
// playing beside it. Trimmed to what fits on a phone screen, nothing invented.
const REAL_CODE = `{
  seconds: 3.6,
  vo: 'vo/repurposer/01.mp3',
  sfx: [{ src: 'sfx/whoosh.wav' }],
  Visual: () => (
    <KineticType
      text="ANY LINK INTO *5 HOOKS*"
    />
  ),
}`;

export const beats: Beat[] = [
  // --- hook: the comparison, immediately ---------------------------------------
  // No build-up. The outliers put the before and the after on screen in the first
  // frame, and so does this.
  {
    seconds: sec(D['01']),
    caption: '',
    vo: 'vo/reelsmaker/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.3 }],
    Visual: () => (
      <Stage>
        <CodeCard code={REAL_CODE} y={-9} width={88} size={28} />
        <ScreenCard y={27} width={82} tilt={-1.2} index={1}>
          <OffthreadVideo
            src={staticFile('clips/repurposer.mp4')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
          />
        </ScreenCard>
        <Statement lines={['this reel', 'is a text file']} y={-40} size={84} hot={1} accent="#5b8cff" />
      </Stage>
    ),
  },

  // --- the tool, actually running ------------------------------------------------
  {
    seconds: sec(D['02']),
    caption: '',
    vo: 'vo/reelsmaker/02.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/tick.wav', at: 0.1, volume: 0.35 }],
    Visual: () => (
      <Stage>
        <ScreenCard y={-4} width={96}>
          <FrameSequence dir="shots/studio-play" count={40} playFps={4} drift={0.05} />
        </ScreenCard>
        {/* NOT "no timeline" - Remotion Studio plainly has one, and it is on screen
            in this very shot. The true claim is that nobody dragged anything into
            it: the timeline is generated from the beats array. Writing a line the
            footage contradicts is the fastest way to lose a viewer. */}
        <Statement lines={['nothing here', 'was dragged.']} y={27} size={86} hot={1} accent="#5b8cff" />
      </Stage>
    ),
  },

  // --- the measured payoff ---------------------------------------------------------
  {
    seconds: sec(D['03']),
    caption: '',
    vo: 'vo/reelsmaker/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0, volume: 0.4 }],
    Visual: () => (
      <Stage>
        <CodeCard code={'npx remotion render Repurposer'} y={-10} width={90} size={36} />
        <Statement lines={['a finished reel', 'in 94 seconds']} y={10} size={92} hot={1} accent="#2ecc8f" />
      </Stage>
    ),
  },

  // --- free, and the proof is a real repo ---------------------------------------------
  {
    seconds: sec(D['04']),
    caption: '',
    vo: 'vo/reelsmaker/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.2, volume: 0.25 }],
    Visual: () => (
      <Stage>
        <ScreenCard y={-6} width={96}>
          <FrameSequence dir="shots/repo-scroll" count={36} playFps={9} loop={false} />
        </ScreenCard>
        <Statement lines={['free.', 'open source.']} y={30} size={88} hot={1} accent="#5b8cff" />
      </Stage>
    ),
  },

  // --- the CTA the research insists on ---------------------------------------------------
  // "Comment WORD and I'll send it" appeared in the 886K reel, the 336K one and
  // four others. A bio link appeared in none of them.
  {
    seconds: sec(D['05']),
    caption: '',
    vo: 'vo/reelsmaker/05.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0, volume: 0.4 }],
    Visual: () => (
      <Stage>
        <Statement lines={['comment', 'REELS']} y={-10} size={128} hot={1} accent="#5b8cff" />
        <Statement lines={['and it lands in your DMs']} y={7} size={44} />
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '18%' }}>
          <div style={{ fontFamily: 'Consolas, Menlo, monospace', fontSize: 40, color: 'rgba(255,255,255,0.6)' }}>
            @aayanrealm
          </div>
        </AbsoluteFill>
      </Stage>
    ),
  },
];

export const REELSMAKER_FPS = FPS;
