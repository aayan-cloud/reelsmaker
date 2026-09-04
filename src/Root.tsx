import React from 'react';
import { Composition } from 'remotion';
import { Reel, totalFrames } from './engine/Reel';
import { beats as noWebsite } from './reels/no-website/script';
import { beats as metaAdLibrary } from './reels/meta-ad-library/script';
import { WorkflowTour, TOUR_SECONDS } from './reels/workflow-tour/Tour';
import { beats as repurposer } from './reels/repurposer/script';
import { beats as reelsmaker } from './reels/reelsmaker/script';
import { FbCover } from './reels/reelsmaker/cover';
import { K } from './engine/kinetic';

const FPS = 30;

/**
 * One wrapper component per reel, closing over its own beats.
 *
 * The beats do NOT go through `defaultProps`. Remotion serialises defaultProps
 * to JSON so the Studio can offer a props editor, and a beat carries a `Visual`
 * component - a function, which does not survive the round trip. It comes back
 * undefined and React throws #130 at render time with no hint as to why.
 */
// Different music per reel, so a viewer who sees two of these in a row does
// not feel like they are watching the same video twice.
const NoWebsite: React.FC = () => (
  <Reel beats={noWebsite} music="music/echoes.mp3" musicVolume={0.13} />
);
// Keynote style rather than documentary, so it gets a cleaner music bed.
const Repurposer: React.FC = () => (
  <Reel
    beats={repurposer}
    music="music/digital-clouds.mp3"
    musicVolume={0.15}
    captionColor={K.text}
    captionAccent={K.accent}
  />
);
// Narrated, so the music drops under the voice. The lines were written to fit
// beats that were already short, rather than letting the voice set the length.
const Reelsmaker: React.FC = () => (
  <Reel beats={reelsmaker} music="music/cyberpunk-city.mp3" musicVolume={0.17} />
);
const MetaAdLibrary: React.FC = () => (
  <Reel beats={metaAdLibrary} music="music/discover.mp3" musicVolume={0.13} />
);

/**
 * Duration is computed from the script so it can never drift - edit a beat's
 * seconds and the render length follows.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="NoWebsite"
      component={NoWebsite}
      durationInFrames={totalFrames(noWebsite, FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="MetaAdLibrary"
      component={MetaAdLibrary}
      durationInFrames={totalFrames(metaAdLibrary, FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {/* No beats: this one is a single continuous camera move, so it does not
        go through the Reel beat engine at all. */}
    <Composition
      id="WorkflowTour"
      component={WorkflowTour}
      durationInFrames={Math.round(TOUR_SECONDS * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {/* Facebook Page cover. Same engine as the reels, so the Page and the
        videos read as one thing. */}
    <Composition id="FbCover" component={FbCover} durationInFrames={1} fps={FPS} width={1640} height={856} />
    <Composition
      id="Reelsmaker"
      component={Reelsmaker}
      durationInFrames={totalFrames(reelsmaker, FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Repurposer"
      component={Repurposer}
      durationInFrames={totalFrames(repurposer, FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
