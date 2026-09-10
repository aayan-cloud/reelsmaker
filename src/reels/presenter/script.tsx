import React from 'react';
import type { Beat } from '../../engine/Reel';
import { Stage } from '../../engine/kinetic';
import { Split, ScreenShot, Presenter, PunchWords } from '../../engine/split';

/**
 * Reel 10 - the reference format. Screen on top, presenter underneath, all the way
 * through.
 *
 * WHAT THIS IS WAITING ON
 *
 * One thing: thirty seconds of Aayan talking to a phone at desk height. The lower band
 * is a labelled placeholder until that file exists at assets/clips/aayan.mp4, at which
 * point `PresenterSlot` swaps for `Presenter` and nothing else changes.
 *
 * The reference reel (instagram.com/reel/DLlLmRPgX96) was watched rather than guessed
 * at, and the breakdown corrected the brief in two places worth recording:
 *
 *   - the presenter there is a REAL person, not an AI-generated one
 *   - it runs 106 seconds and ends on "comment automate", not on a refusal
 *
 * The voice-over reused here is the same six lines already recorded for reel 09, so this
 * runs at 26 seconds rather than 106. Going to the reference's length means writing a
 * walkthrough, which needs the presenter footage first anyway.
 *
 * Captions are the reference's: two words at a time, swapping fast, one accent colour on
 * the word carrying the claim.
 */

const pad = (n: number) => n + 0.25;

/**
 * The presenter band is licensed stock footage, NOT Aayan and NOT AI-generated.
 *
 * The AI route is closed: the account is on the free plan and the model returns
 * "Requires basic plan or higher", and a 26-second reel would need roughly 200 credits
 * at 32.5 per five seconds. This clip is Mixkit Free Licence, commercial use, no
 * attribution required.
 *
 * A person TALKING was deliberately rejected. Stock footage of someone speaking cannot
 * match a voice-over, so their lips visibly say something else and the whole frame reads
 * as fake. This clip is a man on a phone at a desk - he is occupied rather than
 * addressing the viewer, so nothing has to sync. It also happens to be the exact subject
 * of the reel, which is someone phoning businesses.
 *
 * `startFrom` differs per beat so a 14.6s clip covers a 26s reel without looping
 * visibly.
 */
const CLIP = 'clips/mixkit-44748.mp4';

const beat = (screen: React.ReactNode, words: string, startFrom: number) => () => (
  <Stage>
    <Split screen={screen} presenter={<Presenter src={CLIP} startFrom={startFrom} />} />
    <PunchWords text={words} />
  </Stage>
);

export const beats: Beat[] = [
  {
    seconds: pad(3.14),
    caption: '',
    vo: 'vo/stopasking/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0, volume: 0.5 }],
    Visual: beat(
      <ScreenShot src="shots/sunbiz/terminal.png" />,
      '*Stop* asking me to automate your cold outreach',
      0,
    ),
  },
  {
    seconds: pad(3.96),
    caption: '',
    vo: 'vo/stopasking/02.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 1.5, volume: 0.55 }],
    Visual: beat(
      <ScreenShot src="shots/sunbiz/table.png" />,
      'One marketing text costs *$1,500* in Florida',
      110,
    ),
  },
  {
    seconds: pad(4.97),
    caption: '',
    vo: 'vo/stopasking/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.1, volume: 0.24 }],
    Visual: beat(
      <ScreenShot src="shots/sunbiz/terminal.png" from={1.1} to={1.02} />,
      'I scraped the whole state registry *4.5%* were usable',
      250,
    ),
  },
  {
    seconds: pad(3.19),
    caption: '',
    vo: 'vo/stopasking/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 1.1, volume: 0.55 }],
    Visual: beat(
      <ScreenShot src="shots/sunbiz/blocked.png" />,
      'Then Google *blocked* me',
      30,
    ),
  },
  {
    seconds: pad(3.82),
    caption: '',
    vo: 'vo/stopasking/05.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.32 }],
    Visual: beat(
      <ScreenShot src="shots/sunbiz/maps-2.png" from={1.02} to={1.1} />,
      '*22* page loads for one lead',
      150,
    ),
  },
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
    Visual: beat(
      <ScreenShot src="shots/sunbiz/maps-4.png" from={1.04} to={1.12} />,
      'Your list is *garbage* your tool is a *lawsuit* don\'t ask me to build it',
      250,
    ),
  },
];
