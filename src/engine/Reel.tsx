import React from 'react';
import {
  AbsoluteFill, Sequence, useVideoConfig, Audio, staticFile, interpolate,
} from 'remotion';
import { FilmTreatment, LOOKS } from './FilmTreatment';
import { Captions } from './Captions';

/**
 * A beat is one voice line and the picture that goes under it.
 *
 * `seconds` should come from the measured length of the voice-over MP3
 * (`node tools/durations.js`), never from a round number you liked. Timing a
 * beat to a guess and then wondering why the caption lands late is an hour you
 * do not get back.
 */
export type Beat = {
  seconds: number;
  caption: string;
  look?: keyof typeof LOOKS;
  /** Distance from the bottom, in %. Raise it when a picture needs the lower third. */
  captionBottom?: number;
  /** Voice-over file, relative to the asset library: 'vo/01.mp3'. */
  vo?: string;
  /** Effects, with `at` in seconds from the start of the beat. */
  sfx?: { src: string; at?: number; volume?: number }[];
  Visual: React.FC;
};

export const Reel: React.FC<{
  beats: Beat[];
  /** Music file, relative to the asset library. Ducked and faded automatically. */
  music?: string;
  musicVolume?: number;
  /**
   * Caption colours. A reel commits to one look, so these are set once here
   * rather than on every beat. Left unset they use the film palette, which is
   * wrong for a keynote reel - warm cream type and a gold accent sitting next
   * to cool white and blue reads as a fourth colour nobody chose.
   */
  captionColor?: string;
  captionAccent?: string;
}> = ({ beats, music, musicVolume = 0.16, captionColor, captionAccent }) => {
  const { fps } = useVideoConfig();
  const total = beats.reduce((n, b) => n + Math.round(b.seconds * fps), 0);
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {beats.map((beat, i) => {
        const from = cursor;
        const duration = Math.round(beat.seconds * fps);
        cursor += duration;
        return (
          <Sequence key={i} from={from} durationInFrames={duration} name={`Beat ${i + 1}`}>
            <FilmTreatment look={LOOKS[beat.look ?? 'doc']}>
              <beat.Visual />
            </FilmTreatment>
            {/* A beat whose visual already carries the words (kinetic type)
                passes an empty caption, and gets no second copy of them. */}
            {beat.caption ? (
              <Captions
                text={beat.caption}
                bottom={beat.captionBottom ?? 15}
                color={captionColor}
                accent={captionAccent}
              />
            ) : null}
            {beat.vo ? <Audio src={staticFile(beat.vo)} /> : null}
            {(beat.sfx ?? []).map((s, j) => (
              <Sequence key={j} from={Math.round((s.at ?? 0) * fps)} name={`sfx ${s.src}`}>
                <Audio src={staticFile(s.src)} volume={s.volume ?? 0.5} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}

      {music ? (
        <Audio
          src={staticFile(music)}
          // Music sits under the voice, and lifts slightly once the voice stops.
          // A flat bed either buries the narration or vanishes entirely.
          volume={(f) =>
            interpolate(
              f,
              [0, fps * 1.2, total - fps * 2.5, total],
              [0, musicVolume, musicVolume, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Sum a script's runtime, so the composition length can never drift from the
 *  script - a mismatch shows up as a black tail you only notice after upload. */
export const totalFrames = (beats: Beat[], fps: number) =>
  beats.reduce((n, b) => n + Math.round(b.seconds * fps), 0);
