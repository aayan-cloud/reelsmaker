/**
 * One palette, so a look change is one file rather than a hunt through six.
 *
 * These are film colours, not screen colours. The distinction that matters:
 *
 *   Screen colour is additive and wants to glow - electric blue, neon green,
 *   pure #fff, a bloom around every bright element. It reads as a dashboard.
 *
 *   Film colour is subtractive and never fully saturates. Highlights go to bone
 *   rather than white, accents sit in the ochre/brick range that print and
 *   emulsion actually reproduce, and nothing emits light. Shadows are soft and
 *   dark, not coloured halos.
 *
 * The single biggest tell is glow. `box-shadow: 0 0 40px <colour>` is the thing
 * that makes an otherwise good frame look like a UI mock, so there are no
 * coloured shadows anywhere in this project - only dark ones.
 */
export const P = {
  /** Warm off-white. Pure #fff is the other big tell - it does not exist on film. */
  bone: '#f0e9dc',
  boneDim: 'rgba(240,233,220,0.62)',
  boneFaint: 'rgba(240,233,220,0.4)',

  /** The accent. Ochre reads as archival without being sepia-toned kitsch. */
  accent: '#d8a24a',

  /** Bad news: oxidised brick, not alarm red. */
  bad: '#b04a38',
  /** Good news: olive drab, not neon green. */
  good: '#8d9a63',

  /** Grounds. Warm-dark, never blue-black. */
  ink: '#0b0906',
  panel: 'rgba(18,14,10,0.62)',
  rule: 'rgba(240,233,220,0.14)',

  /** The only legal shadow: dark and soft. */
  shadow: '0 3px 18px rgba(0,0,0,0.85)',
  shadowDeep: '0 40px 90px rgba(0,0,0,0.78)',
} as const;
