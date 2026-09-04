import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Room, Head, Prompt } from '../../engine/ui';

/** Style probe: the new warm/serif look, to look at before committing to it. */
export const Probe: React.FC = () => (
  <AbsoluteFill>
    <Room>
      <Head text="What should we make today?" size={76} y={-16} />
      <Prompt text="make a reel about my new plugin" startAt={0} cps={40} y={2} />
    </Room>
  </AbsoluteFill>
);
