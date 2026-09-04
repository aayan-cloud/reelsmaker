import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { Cuts, FrameSequence, ScreenCard, CodeCard, Statement } from '../../engine/screen';
import { Stage, BigFigure, K } from '../../engine/kinetic';
import D from '../../../tools/vo-durations.dsh.json';

/**
 * Reel 06 - dsh-reelsmaker.
 *
 * CUT RATE IS THE POINT.
 *
 * Two 100k+ view outliers in this exact niche were watched shot by shot before
 * this was written. Both cut every 1.0-2.5 seconds, averaging about 1.5, and
 * both strictly alternate an anchor card with full-screen footage. Reel 05 held
 * one composition per 3-4 second beat and averaged 2 seconds of watch time on
 * 205 Facebook views. So every beat here cuts at least twice.
 *
 * DISCOVERY FRAMING, NOT SELF-PROMOTION.
 *
 * "someone just open sourced X" (78x) and "someone just ran Kimi K3" (83x) beat
 * "I built a thing" consistently. The news here belongs to DeepSeek - a harness
 * that took 211,775 stars in three weeks - and the plugin arrives as the turn
 * rather than the pitch. The first three beats are about somebody else.
 *
 * EVERY NUMBER IS REAL AND CHECKABLE.
 *
 *   211,775 stars      github.com/deepseek-ai/deepseek-harness, read 2026-09-04
 *   3 weeks            repo created 2026-08-13
 *   13,515 plugins     the dsh-plugin topic, same day
 *   "wants an API key" dsh-omi-voice is BYOK; dsh-voice-scribe and dsh-ears use
 *                      browser Web Speech. Nothing there ships a free neural voice.
 *
 * All footage is genuine capture from tools/capture.js - the harness running
 * with this plugin loaded, the real repos, the real Studio.
 */

const pad = (n: number) => n + 0.25;

/**
 * Full-frame captured footage. The half of the alternation that is evidence.
 *
 * NO ENTRANCE ANIMATION. ScreenCard springs in over 26 frames, which is most of
 * a 1.5 second cut - the shot spends half its life dim and arriving, and the
 * first render of this reel came out almost black. At this cut rate a shot has
 * to be fully present on its first frame.
 *
 * A wide capture sits as a bright band on the dark ground rather than being
 * cropped to fill 9:16, because cropping a repo page to vertical throws away the
 * sidebar - which is where the star count lives, and the star count is the
 * evidence.
 */
const shot = (dir: string, count: number, playFps: number, loop = true) => (
  <Stage>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          // Required. FrameSequence renders an AbsoluteFill, which anchors to the
          // nearest POSITIONED ancestor - without this it escapes the band, fills
          // the whole 9:16 frame, and objectFit:cover crops a 16:9 capture down to
          // an unreadable slice of itself.
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.16)',
          borderBottom: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 0 120px rgba(91,140,255,0.28)',
        }}
      >
        <FrameSequence dir={dir} count={count} playFps={playFps} loop={loop} drift={0.06} />
      </div>
    </AbsoluteFill>
  </Stage>
);

/** The anchor card. The half that carries the sentence. */
const say = (lines: string[], hot = -1, accent: string = K.accent) => (
  <Stage>
    <Statement lines={lines} size={lines.join(' ').length > 26 ? 80 : 96} hot={hot} accent={accent} />
  </Stage>
);

export const beats: Beat[] = [
  // --- the news is DeepSeek's, not ours -----------------------------------------
  {
    seconds: pad(D['01']),
    caption: '',
    vo: 'vo/dsh/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.3 }],
    Visual: () => (
      <Cuts
        shots={[
          { node: shot('shots/dsh-repo', 26, 10) },
          { node: say(['deepseek', 'dropped this', '3 weeks ago'], 0) },
        ]}
      />
    ),
  },

  {
    seconds: pad(D['02']),
    caption: '',
    vo: 'vo/dsh/02.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0, volume: 0.4 }],
    Visual: () => (
      <Cuts
        shots={[
          { weight: 1.1, node: shot('shots/dsh-repo', 26, 6) },
          {
            weight: 1,
            node: (
              <Stage>
                <BigFigure value="211,775" label="stars in 3 weeks" accent={K.good} />
              </Stage>
            ),
          },
        ]}
      />
    ),
  },

  {
    seconds: pad(D['03']),
    caption: '',
    vo: 'vo/dsh/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/tick.wav', at: 0.1, volume: 0.3 }],
    Visual: () => (
      <Cuts
        shots={[
          { node: shot('shots/dsh-ui', 24, 5) },
          { node: say(['everything', 'is a plugin']) },
          { weight: 1.2, node: shot('shots/dsh-topic', 20, 8) },
        ]}
      />
    ),
  },

  {
    seconds: pad(D['04']),
    caption: '',
    vo: 'vo/dsh/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.2, volume: 0.22 }],
    Visual: () => (
      <Cuts
        shots={[
          { node: shot('shots/dsh-topic', 20, 9) },
          { node: say(['13,515', 'already built'], 0) },
        ]}
      />
    ),
  },

  // --- the gap ---------------------------------------------------------------------
  {
    seconds: pad(D['05']),
    caption: '',
    vo: 'vo/dsh/05.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/tick.wav', at: 0, volume: 0.35 }],
    Visual: () => (
      <Cuts
        shots={[
          { node: say(['every voice one', 'wants an', 'API key'], 2, K.accentWarm) },
          { node: shot('shots/dsh-topic', 20, 11) },
        ]}
      />
    ),
  },

  {
    seconds: pad(D['06']),
    caption: '',
    vo: 'vo/dsh/06.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0, volume: 0.42 }],
    Visual: () => (
      <Cuts
        shots={[
          { node: say(['mine', 'does not'], 1, K.good) },
          { node: shot('shots/my-repo', 26, 10) },
        ]}
      />
    ),
  },

  // --- what it actually does -----------------------------------------------------------
  {
    seconds: pad(D['07']),
    caption: '',
    vo: 'vo/dsh/07.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.3 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            node: (
              <Stage>
                <CodeCard
                  code={'make_reel({\n  lines: [\n    "DeepSeek dropped a harness.",\n    "Everything in it is a plugin.",\n  ],\n})'}
                  width={88}
                  size={30}
                />
              </Stage>
            ),
          },
          {
            weight: 1.2,
            node: (
              <AbsoluteFill style={{ backgroundColor: '#08080b' }}>
                <Stage />
                <ScreenCard width={86} tilt={-1}>
                  <OffthreadVideo
                    src={staticFile('clips/repurposer.mp4')}
                    startFrom={60}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted
                  />
                </ScreenCard>
              </AbsoluteFill>
            ),
          },
        ]}
      />
    ),
  },

  {
    seconds: pad(D['08']),
    caption: '',
    vo: 'vo/dsh/08.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0.2, volume: 0.35 }],
    Visual: () => (
      <Cuts
        shots={[
          { node: shot('shots/studio-play', 40, 4) },
          { node: say(['free voice.', 'no API key.'], 1, K.good) },
        ]}
      />
    ),
  },

  // --- the CTA ---------------------------------------------------------------------------
  {
    seconds: pad(D['09']),
    caption: '',
    vo: 'vo/dsh/09.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0, volume: 0.4 }],
    Visual: () => (
      <Stage>
        <Statement lines={['comment', 'REELS']} y={-10} size={128} hot={1} accent={K.accent} />
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
