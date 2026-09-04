import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { PhotoBackdrop, PhotoCard } from '../../engine/photo';
import { PinField, BigStat, OutroCard } from '../../engine/cards';
import D from '../../../tools/vo-durations.maps.json';
import { P } from '../../engine/palette';

/**
 * Reel 01 - "Zero out of twenty-five".
 *
 * Every number is one the Maps engine actually produced on a live run: 25
 * Phoenix dentists checked, 0 leads, then 6 of 6 dog groomers in the same city
 * on the same day. Both are in that project's README under "Which niches
 * actually work". Nothing rounded, nothing invented - the measured result is
 * the only reason a viewer would later trust anything sold off the back of it.
 *
 * Shape: setup, setup, REVERSAL, retry, payoff, lesson. The reversal lands at
 * ~8.9s, comfortably inside the 12s the scroll gives you.
 *
 * Beat lengths are the measured voice-over durations. After editing a line:
 *   node tools/vo.js maps && node tools/durations.js maps
 */

const pad = (n: number) => n + 0.35;

export const beats: Beat[] = [
  {
    seconds: pad(D['01']),
    caption: 'it finds local businesses with *no website*',
    vo: 'vo/maps/01.mp3',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.35 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/phoenix.jpg" drift={20} darken={0.66} />
        <PhotoCard src="images/owner-2.jpg" tilt={-2.4} y={-7} seed={2} />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['02']),
    caption: 'so I aimed it at *25 dentists* in Phoenix',
    vo: 'vo/maps/02.mp3',
    sfx: [{ src: 'sfx/tick.wav', at: 0.2, volume: 0.45 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/dentist-2.jpg" drift={150} darken={0.6} blur={3} />
        <BigStat value={25} countFrom={0} label="places checked" sub="Phoenix, AZ" over />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['03']),
    caption: 'every one already had a site. *zero leads*',
    vo: 'vo/maps/03.mp3',
    sfx: [{ src: 'sfx/impact.wav', at: 1.9, volume: 0.5 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/dentist.jpg" drift={300} darken={0.64} blur={4} />
        <BigStat value={0} label="leads found" color={P.bad} sub="0 out of 25" over />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['04']),
    caption: 'then I changed *one word*',
    vo: 'vo/maps/04.mp3',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.4 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/groomer-2.jpg" drift={60} darken={0.6} />
        <PhotoCard src="images/groomer.jpg" tilt={3} y={-7} seed={9} width={0.74} />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['05']),
    caption: '*six out of six.* none of them had one',
    vo: 'vo/maps/05.mp3',
    sfx: [{ src: 'sfx/riser.wav', at: 0.4, volume: 0.3 }],
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/groomer-3.jpg" drift={240} darken={0.58} blur={3} />
        <PinField total={6} lit={6} stagger={7} over />
      </AbsoluteFill>
    ),
  },
  {
    seconds: pad(D['06']),
    caption: 'the tool was fine. the *niche* was dead',
    vo: 'vo/maps/06.mp3',
    sfx: [{ src: 'sfx/sub.wav', at: 1.2, volume: 0.4 }],
    // Repo verified public before this string went in.
    Visual: () => (
      <AbsoluteFill>
        <PhotoBackdrop src="images/phoenix-2.jpg" drift={190} darken={0.76} blur={5} />
        <OutroCard
          repo="n8n-google-maps-leads"
          handle="@aayanrealm"
          tagline="free, open source, runs on your machine"
          over
        />
      </AbsoluteFill>
    ),
  },
];
