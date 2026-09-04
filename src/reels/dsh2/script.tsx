import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { Cuts } from '../../engine/screen';
import { Room, Head, Prompt, PunchIn, Cursor, Flash, Streaming, FlashWords, W } from '../../engine/ui';

/**
 * Reel 07 - dsh-reelsmaker, in the reference style.
 *
 * WHAT CHANGED, AND WHY
 *
 * Reel 06 read "show the real tool" as "put a captured web page on screen", and
 * a whole GitHub page scaled into a 1080-wide band renders its text at about
 * eight pixels. The star count was unreadable, so the shot proved nothing and
 * looked like a grey rectangle floating in dead space.
 *
 * The reference reel Aayan sent does not use screen recordings at all. It builds
 * the interface: a prompt that types itself, a cursor that moves and clicks with
 * a scale bounce, a punch-in onto the send button, a flash cut, then output
 * streaming. Everything is composed at phone size instead of shrunk to fit.
 *
 * That structure also happens to BE what this plugin does - type a prompt, send
 * it, watch a reel come out - so the form and the subject are the same thing.
 *
 * WHAT IS REAL HERE
 *
 * The prompt is a real call. The streamed lines are the real progress output of
 * `node lib/make-reel.js`. The reel that plays at the end was rendered by this
 * project. Only the chrome around them is drawn.
 */

const pad = (n: number) => n + 0.25;

/** Keystroke ticks under the typing, spaced to sound like hands rather than a metronome. */
const typing = (from: number, count: number, gap: number) =>
  Array.from({ length: count }, (_, i) => ({
    src: 'sfx/tick.wav',
    at: +(from + i * gap).toFixed(2),
    volume: 0.18,
  }));

const PROMPT = 'make a reel about my new plugin';

export const beats: Beat[] = [
  // --- the room, and the question ------------------------------------------------
  {
    seconds: pad(3.31),
    caption: '',
    vo: 'vo/dsh2/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0, volume: 0.3 }],
    Visual: () => (
      <Room>
        <Head text="What should we make today?" size={76} y={-16} />
      </Room>
    ),
  },

  // --- the prompt types itself -----------------------------------------------------
  {
    seconds: pad(3.65),
    caption: '',
    vo: 'vo/dsh2/02.mp3',
    look: 'clean',
    // Ticks stop when the typing does; the beat runs on a moment longer.
    sfx: typing(0.35, 14, 0.11),
    Visual: () => (
      <Room>
        <Head text="What should we make today?" size={76} y={-16} />
        <Prompt text={PROMPT} startAt={10} cps={22} y={2} />
      </Room>
    ),
  },

  // --- punch in, click, cut ---------------------------------------------------------
  // No voice. The reference lets the click land on its own, and a line over it
  // would fight the sound effect that carries the moment.
  {
    seconds: 1.5,
    caption: '',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0.7, volume: 0.5 }],
    Visual: () => (
      <AbsoluteFill>
        {/* The send button sits at roughly 86% across, 56% down. */}
        <PunchIn at={[86, 56]} to={2.6} startAt={0} frames={20}>
          <Room bloom={1.2}>
            <Head text="What should we make today?" size={76} y={-16} />
            <Prompt text={PROMPT} startAt={-40} cps={22} y={2} />
          </Room>
        </PunchIn>
        <Cursor from={[62, 78]} to={[84, 55]} arriveAt={21} />
        <Flash at={26} />
      </AbsoluteFill>
    ),
  },

  // --- it runs, then what it gives you -----------------------------------------------
  {
    seconds: pad(4.18),
    caption: '',
    vo: 'vo/dsh2/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.1, volume: 0.22 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 1.4,
            node: (
              <Room bloom={0.5}>
                <Streaming
                  startAt={2}
                  every={7}
                  lines={[
                    '$ make_reel',
                    '  generating voice-over',
                    '  01  3.31s',
                    '  02  3.65s',
                    '  03  4.18s',
                    '  rendering 14.6s of video',
                    '  rendering 100%',
                    '',
                    '  out/my-new-plugin.mp4',
                  ]}
                />
              </Room>
            ),
          },
          {
            node: (
              <Room bloom={1.1}>
                <FlashWords words={['spoken.', 'captioned.', 'free.']} size={116} />
              </Room>
            ),
          },
        ]}
      />
    ),
  },

  // --- the thing it made, then the ask ------------------------------------------------
  {
    seconds: pad(3.31),
    caption: '',
    vo: 'vo/dsh2/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.28 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 1.1,
            node: (
              <Room bloom={0.6}>
                {/* The output is vertical, so it is shown vertical - inset, not
                    letterboxed. The mistake in reel 06 was forcing a 16:9 capture
                    into a 9:16 frame and living with the dead space. */}
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '62%',
                      aspectRatio: '9 / 16',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 26,
                      border: `1px solid ${W.panelEdge}`,
                      boxShadow: '0 40px 110px rgba(0,0,0,0.75), 0 0 90px rgba(217,119,54,0.22)',
                    }}
                  >
                    <OffthreadVideo
                      src={staticFile('clips/repurposer.mp4')}
                      startFrom={60}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      muted
                    />
                  </div>
                </AbsoluteFill>
              </Room>
            ),
          },
          {
            node: (
              <Room bloom={1.3}>
                <Head text="Comment REELS" size={92} y={-8} accentWord="REELS" />
                <AbsoluteFill
                  style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '30%' }}
                >
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: W.muted }}>
                    and it lands in your DMs
                  </div>
                </AbsoluteFill>
                <AbsoluteFill
                  style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '16%' }}
                >
                  <div style={{ fontFamily: 'Consolas, monospace', fontSize: 34, color: 'rgba(244,239,234,0.45)' }}>
                    @aayanrealm
                  </div>
                </AbsoluteFill>
              </Room>
            ),
          },
        ]}
      />
    ),
  },
];
