import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Beat } from '../../engine/Reel';
import { Stage, KineticType, GlassPanel, FloatingCard, BigFigure, K } from '../../engine/kinetic';
import D from '../../../tools/vo-durations.repurposer.json';

/**
 * Reel 04 - the Link Repurposer.
 *
 * THE TOPIC IS STATED IN THE FIRST FOUR SECONDS.
 *
 * The first cut opened with "every AI workflow wants an API key", which is the
 * setup, not the subject: a viewer would not learn what the tool actually does
 * until second twelve, long after the scroll. Beat one now says what it is, and
 * the API-key complaint becomes the reason to care rather than the opening.
 *
 * Everything on screen is real:
 *   - the hooks in beat 5 are the actual output of a run against a Guardian
 *     article, written by qwen2.5-14b on this machine
 *   - "90 seconds" is the measured time for that run
 *   - zero cost is literal: nothing in the chain has a paid API
 *
 * Visually this is the keynote style, not the documentary one, so it uses
 * `kinetic.tsx` and its own palette. See the note at the top of that file for
 * why the two never mix inside one reel.
 */

const pad = (n: number) => n + 0.3;

export const beats: Beat[] = [
  // --- what it is, immediately ------------------------------------------------
  {
    seconds: pad(D['01']),
    caption: '', // the kinetic type is the line
    vo: 'vo/repurposer/01.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0, volume: 0.3 }],
    Visual: () => (
      <Stage>
        <KineticType text="ANY LINK INTO *5 HOOKS* AND A CAPTION" size={124} />
      </Stage>
    ),
  },

  // --- why that is not already solved ------------------------------------------
  {
    seconds: pad(D['02']),
    caption: '', // the kinetic type is the line
    vo: 'vo/repurposer/02.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/tick.wav', at: 0.1, volume: 0.4 }],
    Visual: () => (
      <Stage>
        <KineticType text="EVERY OTHER TOOL WANTS AN *API KEY*" size={128} accent={K.accentWarm} />
      </Stage>
    ),
  },

  // --- the evidence, from n8n's own trending list -------------------------------
  {
    seconds: pad(D['03']),
    caption: 'n8n’s own trending list, all of it *paid*',
    vo: 'vo/repurposer/03.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/riser.wav', at: 0.8, volume: 0.28 }],
    Visual: () => (
      <Stage>
        <GlassPanel
          title="trending on n8n"
          rows={[
            { label: 'Talk to your Sheets', note: 'ChatGPT-5', hot: true },
            { label: 'RAG chatbot for docs', note: 'Gemini', hot: true },
            { label: 'Analyze landing pages', note: 'OpenAI', hot: true },
            { label: 'Generate viral videos', note: 'VEO 3', hot: true },
          ]}
        />
      </Stage>
    ),
  },

  // --- the turn ------------------------------------------------------------------
  {
    seconds: pad(D['04']),
    caption: '', // the kinetic type is the line
    vo: 'vo/repurposer/04.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/impact.wav', at: 0, volume: 0.45 }],
    Visual: () => (
      <Stage>
        <KineticType text="MINE RUNS ON *MY OWN LAPTOP*" size={132} accent={K.good} />
      </Stage>
    ),
  },

  // --- the actual output ----------------------------------------------------------
  // Real hooks from a real run against a Guardian article. Not written for the
  // video: this is what the model returned.
  {
    seconds: pad(D['05']),
    caption: 'paste a link. *90 seconds later* it is done',
    vo: 'vo/repurposer/05.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/whoosh.wav', at: 0.1, volume: 0.32 }],
    Visual: () => (
      <AbsoluteFill>
        <Stage />
        <FloatingCard
          index={0}
          y={-20}
          width={78}
          tilt={-1.6}
          title="the link"
          mono
          lines={['theguardian.com/commentisfree/', 'september-reset-better-person']}
        />
        <FloatingCard
          index={1}
          y={7}
          width={80}
          tilt={1.2}
          title="hooks it wrote"
          lines={[
            '1. September resets beat January resolutions.',
            '2. Tiny steps like 10-minute workouts stick.',
            '3. Panic is an underrated motivator.',
          ]}
        />
      </AbsoluteFill>
    ),
  },

  // --- the payoff -------------------------------------------------------------------
  {
    seconds: pad(D['06']),
    caption: '*zero cost per run.* open source',
    // The handle and the caption both want the lower third. Give the caption
    // the floor and park the handle well above it, or they print on top of
    // each other.
    captionBottom: 8,
    vo: 'vo/repurposer/06.mp3',
    look: 'clean',
    sfx: [{ src: 'sfx/sub.wav', at: 0.4, volume: 0.4 }],
    Visual: () => (
      <AbsoluteFill>
        <Stage />
        <BigFigure value="$0" label="per run, forever" />
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '30%' }}>
          <div
            style={{
              fontFamily: 'Consolas, Menlo, monospace',
              fontSize: 40,
              color: 'rgba(255,255,255,0.62)',
            }}
          >
            @aayanrealm
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    ),
  },
];
