import React from 'react';
import type { Beat } from '../../engine/Reel';
import { Cuts } from '../../engine/screen';
import { Room, Head, Flash, Streaming, FlashWords } from '../../engine/ui';

/**
 * Reel 08 - the Sunbiz lead pipeline, as a failure.
 *
 * WHY THIS ONE IS NEGATIVE
 *
 * Researched first, per the standing rule. Twelve outliers pulled from Instagram and
 * TikTok in this niche, and the pattern was unambiguous - the biggest multiples over a
 * creator's own median all open by attacking a method people already believe in:
 *
 *   "F*ck cold calling. Do this instead."          192K,  87x median, 338 followers
 *   "SOURCING TRIPS ARE A WASTE OF MONEY."         416K, 124x median
 *   "Everybody talking about AI videos was lying"  230K, 165x median
 *
 * The cold-calling one is the closest match to this subject and came from an account
 * with 338 followers, which is the argument for the format.
 *
 * But NOT ONE of the twelve stays negative to the end. Every one turns at the last beat
 * into "do this instead". A reel that only complains gets agreement and a scroll; the
 * turn is what makes someone comment. So the tone here is hostile the whole way through
 * and the final two beats carry the alternative.
 *
 * EVERY NUMBER IS MEASURED
 *
 * 176 businesses sampled across six cohorts; 17% findable on Maps; 4.5% usable; Google
 * blocked at ~116 lookups; ~22 page loads per lead; ~60 businesses per category search;
 * 27 leads produced. All from this project's own runs - `data/cohort-report.json` and
 * `data/leads.json`. Nothing here is rounded up for the edit.
 */

const pad = (n: number) => n + 0.25;

export const beats: Beat[] = [
  // --- the accusation ---------------------------------------------------------------
  // Full on frame one. The opening half-second is the only part most viewers see, so
  // nothing fades up and nothing springs in.
  {
    seconds: pad(3.55),
    caption: '',
    vo: 'vo/sunbiz/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0, volume: 0.32 }],
    Visual: () => (
      <Room bloom={0.5}>
        <Head
          text="Scraping government records for leads is a waste of time"
          size={84}
          y={-6}
          accentWord="waste"
          instant
        />
      </Room>
    ),
  },

  // --- what looked like a goldmine ---------------------------------------------------
  {
    seconds: pad(5.76),
    caption: '',
    vo: 'vo/sunbiz/02.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.2, volume: 0.2 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 1.2,
            node: (
              <Room bloom={0.6}>
                <Head
                  text="Every new Florida company. Published daily. Free."
                  size={76}
                  y={-4}
                  accentWord="Free."
                  instant
                />
              </Room>
            ),
          },
          {
            node: (
              <Room bloom={0.9}>
                <FlashWords words={['I checked', '176 of them']} size={104} />
              </Room>
            ),
          },
        ]}
      />
    ),
  },

  // --- the two numbers that killed it ------------------------------------------------
  {
    seconds: pad(4.92),
    caption: '',
    vo: 'vo/sunbiz/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0.05, volume: 0.42 }],
    Visual: () => (
      <Room bloom={1.2}>
        <FlashWords words={['17% findable', '4.5% usable']} size={116} />
      </Room>
    ),
  },

  // --- and then it stopped working at all ---------------------------------------------
  {
    seconds: pad(4.87),
    caption: '',
    vo: 'vo/sunbiz/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 2.2, volume: 0.5 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 1.25,
            node: (
              <Room bloom={0.5}>
                {/* The real shape of the run: lookups ticking by, then the wall. */}
                <Streaming
                  startAt={1}
                  every={6}
                  lines={[
                    '  lookup  112 ...',
                    '  lookup  113 ...',
                    '  lookup  114 ...',
                    '  lookup  115 ...',
                    '  lookup  116 ...',
                    '',
                    '  BLOCKED BY GOOGLE',
                  ]}
                />
              </Room>
            ),
          },
          {
            node: (
              <Room bloom={1.3}>
                <Flash at={0} />
                <FlashWords words={['22 page loads', 'for ONE lead']} size={104} />
              </Room>
            ),
          },
        ]}
      />
    ),
  },

  // --- the turn ------------------------------------------------------------------------
  {
    seconds: pad(5.11),
    caption: '',
    vo: 'vo/sunbiz/05.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.3 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 1.1,
            node: (
              <Room bloom={0.7}>
                <Head
                  text="One category search returns 60 at once"
                  size={80}
                  y={-4}
                  accentWord="60"
                  instant
                />
              </Room>
            ),
          },
          {
            node: (
              <Room bloom={1.3}>
                <FlashWords words={['same site', '20x cheaper']} size={112} />
              </Room>
            ),
          },
        ]}
      />
    ),
  },

  // --- the ask --------------------------------------------------------------------------
  {
    seconds: pad(4.97),
    caption: '',
    vo: 'vo/sunbiz/06.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0, volume: 0.28 }],
    Visual: () => (
      <Cuts
        shots={[
          {
            weight: 0.9,
            node: (
              <Room bloom={0.8}>
                <FlashWords words={['27 leads', 'with phone numbers']} size={104} />
              </Room>
            ),
          },
          {
            node: (
              <Room bloom={1.35}>
                <Head
                  text="Comment LEADS"
                  sub="and the code lands in your DMs"
                  size={94}
                  y={-4}
                  accentWord="LEADS"
                  instant
                />
              </Room>
            ),
          },
        ]}
      />
    ),
  },
];
