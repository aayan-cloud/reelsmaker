import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { PhotoBackdrop, ScreenGrab, WARM } from '../../engine/photo';
import { FunnelToOutro, Stamp } from './visuals';
import { P } from '../../engine/palette';
import D from '../../../tools/vo-durations.meta.json';

/**
 * Reel 02 - "Search what they write, not what they are".
 *
 * WHY THIS IS NOT THE BUG STORY IT USED TO BE
 *
 * The first cut of this reel led with the engine getting a liveness check wrong:
 * "21 leads, same settings again, 15". Technically true and honestly told, but
 * as a piece of marketing it is self-harm. A viewer scrolling Instagram sees a
 * tool that cannot reproduce itself and moves on. Four of six beats were spent
 * on the thing being broken and one on it being fixed, so the residue was
 * "unreliable" - the exact opposite of what a channel selling automation needs.
 *
 * A bug-and-fix arc plays well to developers who already trust you. It is the
 * wrong arc for an audience deciding whether you are worth hiring.
 *
 * So this cut leads with the technique instead. Same honesty, same real
 * numbers, but the reveal is something the viewer can use rather than something
 * that went wrong.
 *
 * EVERY NUMBER VERIFIED LIVE ON 2026-09-02, not taken from the README:
 *
 *   ~25,000   facebook.com/ads/library, IN, "cafe", unordered keyword.
 *             Top results that day: Amazon India (twice), Blinkit,
 *             Battlegrounds Mobile India, District. All national brands.
 *   ~110      same library, IN, "walk-ins welcome", exact phrase.
 *             Real results included a tattoo studio in Parañaque, a camera
 *             shop, a helicopter tour operator, an ortho clinic.
 *             The README said ~130; Meta's active pool had moved. The live
 *             number is the one on screen.
 *   166 -> 14 the verified funnel, identical across three consecutive runs.
 *
 * Screenshots in assets/shots are real captures, not mock-ups, because a viewer
 * who half-believes the claim can go and run the same search themselves.
 */

const pad = (n: number) => n + 0.2;

export const beats: Beat[] = [
  {
    seconds: pad(D['01']),
    caption: 'Meta shows you *every ad running right now*',
    vo: 'vo/meta/01.mp3',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.35 }],
    look: 'terminal',
    // The captures are already clipped to 9:16, so this is a gentle push-in
    // rather than a hunt for the right crop.
    Visual: () => (
      <AbsoluteFill>
        <ScreenGrab src="shots/adlib-cafe-count.png" focus={[30, 30]} from={1.04} to={1.16} dim={0.3} />
        <Stamp value="~25,000" label="ads matching &quot;cafe&quot;" />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['02']),
    caption: 'and the top result is *Amazon*',
    vo: 'vo/meta/02.mp3',
    sfx: [{ src: 'sfx/impact.wav', at: 0.15, volume: 0.4 }],
    look: 'terminal',
    // Further down the same results: who is actually buying these ads.
    Visual: () => <ScreenGrab src="shots/adlib-cafe-who.png" focus={[30, 40]} from={1.1} to={1.26} dim={0.2} />,
  },
  {
    seconds: pad(D['03']),
    caption: 'so search what a small business *writes*',
    vo: 'vo/meta/03.mp3',
    look: 'terminal',
    sfx: [{ src: 'sfx/tick.wav', at: 0.15, volume: 0.5 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/city-night.jpg" drift={20} darken={0.84} blur={7} grade={WARM} />
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 420 }}>
          <div
            style={{
              fontFamily: 'Consolas, Menlo, monospace',
              fontSize: 74,
              color: P.accent,
              border: `2px solid ${P.rule}`,
              background: 'rgba(0,0,0,0.5)',
              padding: '38px 52px',
            }}
          >
            "walk-ins welcome"
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['04']),
    caption: '*110 ads.* tattoo studios. camera shops',
    vo: 'vo/meta/04.mp3',
    sfx: [{ src: 'sfx/riser.wav', at: 0.6, volume: 0.3 }],
    look: 'terminal',
    Visual: () => (
      <AbsoluteFill>
        <ScreenGrab src="shots/adlib-phrase-count.png" focus={[30, 30]} from={1.04} to={1.18} dim={0.3} />
        <Stamp value="~110" label="&quot;walk-ins welcome&quot;" color={P.accent} />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['05']),
    caption: 'keep only the ones with *no working site*',
    vo: 'vo/meta/05.mp3',
    sfx: [{ src: 'sfx/tick.wav', at: 0.1, volume: 0.4 }],
    Visual: () => <ScreenGrab src="shots/leads.png" focus={[38, 40]} from={1.08} to={1.26} dim={0.06} />,
  },
  {
    seconds: pad(D['06']),
    caption: '*14 leads.* all already paying for ads',
    vo: 'vo/meta/06.mp3',
    sfx: [{ src: 'sfx/sub.wav', at: 0.5, volume: 0.4 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/city-night.jpg" drift={130} darken={0.8} blur={6} grade={WARM} />
        <FunnelToOutro
          eyebrow="OPEN SOURCE"
          title="n8n-meta-ad-library-leads"
          sub="free, runs on your own machine"
          handle="@aayanrealm"
        />
      </AbsoluteFill>
    ),
  },
];
