# Reelsmaker

Vertical short-form reels written as code instead of keyframed in an editor.
Remotion renders React to MP4; everything that makes the result look like a
*film* rather than a slideshow lives in here.

```bash
npm install
node tools/fetch-assets.js               # images + music, from their original sources
node tools/sfx.js                        # sound effects, synthesised locally
node tools/vo.js repurposer              # voice-over, free Edge neural TTS
npm run dev                              # studio at localhost:3000
npx remotion render Repurposer out/video/reel.mp4
```

**Nothing in that chain needs an account or an API key.** The voice is Microsoft
Edge's neural TTS, the sound effects are synthesised rather than sampled, and the
photos and music are downloaded from their original free-licence sources.

The four reels in `src/reels/` are real ones, kept as working examples.

---

## What this adds over plain Remotion

Remotion gives you a render button: `useCurrentFrame()`, `interpolate`,
`spring`, and a CLI that turns React into an MP4. It is a blank canvas. This is
what fills it.

| | |
| --- | --- |
| `FilmTreatment` | six stacked layers - gate weave, corner blur, texture wash, scan lines, grain, vignette - with no downloaded assets |
| `motion.ts` | `posterizeTime`, `boil`, `gateWeave`, `parallax`, and a hash-based `noise` so renders are reproducible |
| `Captions` | burned-in word-by-word reveal, multi-word accent spans, auto-sizing by line length |
| `Reel` + `Beat` | a reel is *data*; composition length derives from the script so it cannot drift |
| `tools/vo.js` | free neural voice-over, pace per reel |
| `tools/durations.js` | MP3 length by parsing MPEG frame headers - no ffmpeg needed anywhere |
| `tools/sfx.js` | synthesised effects: no samples, no licence, no content-ID risk |
| `tools/capture.js` | real 1920x1080 screen capture, for showing an actual tool instead of a mock-up |

Two visual languages ship with it: a documentary look (`photo.tsx`,
`cards.tsx`, `graph.tsx`) and a product-keynote look (`kinetic.tsx`). A reel
picks one and commits - mixing them reads as an accident.

---

## Licence, honestly

The code here is MIT. **Remotion is not.** It is free for individuals and for
companies of up to three people; beyond that it needs a paid company licence.
See <https://remotion.dev/license>.

No media is redistributed in this repo. `tools/fetch-assets.js` downloads each
file from its original source, and `assets/LICENSES.md` records the licence for
every one.

---

## The one rule worth keeping

**Never invent a number.** Every figure in these scripts is one the tools really
produced on a live run. A reel is packaging; the measured result is the product.
Invent one number to make a beat land better and the whole thing becomes
indistinguishable from the slop it is competing against.

---

## Output layout

```
out/
  frames/   stills from `remotion still` - check shots before a full render
  video/    finished MP4s
```

Both are gitignored. A still costs about a second and a full render a minute or
more, so check frames first and often.

---

## Making a new reel

Three steps. Only the second one takes any thought.

### 1. Write six beats

`src/reels/<name>/script.tsx` exports an array of beats. A beat is one voice
line and the picture that goes under it.

```tsx
export const beats: Beat[] = [
  {
    seconds: 5,
    caption: 'so I aimed it at *25 dentists* in Phoenix',
    Visual: () => <BigStat value={25} countFrom={0} label="places checked" />,
  },
  // ...
];
```

Five or six beats, about five seconds each, ~30 seconds total. This is not an
aesthetic preference:

- **Six is roughly the most a viewer will hold** before the payoff.
- **The reversal has to land by second 12** or the scroll wins.
- Retention on a vertical feed falls off a cliff past 30 seconds.

The shape that works: setup, setup, **reversal**, retry, payoff, lesson.

Captions auto-shrink past ~52 characters. A caption long enough to trigger that
is a caption nobody reads on a phone, so treat the shrink as a warning rather
than a feature. Wrap a span in `*asterisks*` to accent it — one accent per line,
because a hand with five fingers pointing is pointing at nothing.

### 2. Register it

Add a `Composition` in `src/Root.tsx`:

```tsx
const MyReel: React.FC = () => <Reel beats={myBeats} />;

<Composition
  id="MyReel"
  component={MyReel}
  durationInFrames={totalFrames(myBeats, FPS)}
  fps={FPS} width={1080} height={1920}
/>
```

**Beats must not go through `defaultProps`.** Remotion serialises defaultProps to
JSON so the Studio can offer a props editor, and a beat carries a `Visual`
component — a function, which does not survive the round trip. It comes back
`undefined` and React throws a minified `#130` at render time with no hint as to
why. Close over the beats in a wrapper component instead, as above.

### 3. Render

```bash
npx remotion still MyReel out/frames/check.png --frame=90   # ~1s, check a frame
npx remotion render MyReel out/video/my-reel.mp4           # ~90s for 30s of video
```

Always still-check a frame from each beat before committing to a full render.

---

## What's in the engine

### The film treatment

`FilmTreatment.tsx` is the highest-leverage file here. It is what separates a
flat digital image from something that reads as footage, and it does it in six
layers whose *order* is the point:

| | layer | why |
| --- | --- | --- |
| 1 | gate weave | the whole frame drifts sub-pixel, like film through a projector |
| 2 | corner blur | real lenses are not sharp at the edges |
| 3 | texture wash | lifts the blacks so nothing is pure `#000` |
| 4 | scan lines | 1.6px at 16% — the spec that makes it read as broadcast |
| 5 | grain | animated at 12fps, never at frame rate |
| 6 | vignette | last, so it darkens everything above it too |

Three presets: `doc` (warm, heavy), `terminal` (light, keeps code legible), and
`clean` (for the end card, where the repo name has to be readable).

**No downloaded assets.** The grain is an SVG `feTurbulence`, the rest are
gradients. An asset pack is one more thing to lose, and grain over 12px type is
the fastest way to make a reel unwatchable on a phone.

### The motion vocabulary

`motion.ts` is five functions, and two of them do most of the work:

- **`posterizeTime`** — film is not 30fps. Sampling motion at 8–12fps and holding
  each sample is the difference between a picture sliding smoothly and a frame of
  film. Smooth motion reads as PowerPoint; stepped motion reads as cinema.
- **`boil`** — nothing in a real shot is ever perfectly still. A pixel of drift on
  every layer, at different rates, is the whole difference between a collage and
  a scene. Seed each layer differently or they all drift as one.

Then `gateWeave`, `pingPong`, and `parallax`.

`noise()` uses the same murmur3 finaliser as the outreach engine's hash. The
avalanche matters for the same reason it did there: near-consecutive inputs must
not produce near-identical outputs, or the "random" drift comes out as a
straight line.

### The pictures

Two ways to fill a frame, and reels use both.

**Photographs** (`photo.tsx`) are the default, and carry the story beats:
`PhotoBackdrop` for scenery, `PhotoCard` for a bordered print, `PhotoPile`
for the evidence-pile beat.

**Drawn data** (`cards.tsx`) carries the numbers: `PinField`, `BigStat`,
`TerminalCard`, `OutroCard`. Drawing a statistic beats photographing one -
there is no stock image of "0 out of 25", and a number rendered in code can
count up on a posterized clock.

The two compose. Pass `over` to a card and it drops its painted background so
it can sit on a photo; without it the card simply hides the photograph.

---

## Audio

Every reel is voiced, scored and has effects. See **Assets and audio** below for
the pipeline; the short version is `node tools/vo.js <set>`.

Captions are still burned in, because most of the feed watches muted — the audio
is an upgrade for the people who turn it on, never a dependency for the story.

---

## Rules that are load-bearing

1. **Never invent a number.** See above. This is the whole premise.
2. **Beats never go through `defaultProps`.** See step 2.
3. **Build reels scene by scene.** If all six beats live in one timeline, fixing
   beat 1 breaks beat 6 and you find out at render time.
4. **Still-check before you render.** A full render is ~90 seconds; a still is
   about one.

---

## Assets and audio

Everything lives in `assets/`. None of the binaries are committed - the repo
carries only the provenance, and the library rebuilds from it:

```
assets/
  images/    Pexels photos      (Pexels Licence: commercial use, no attribution)
  music/     Mixkit tracks      (Mixkit Free Licence: commercial use, no attribution)
  sfx/       synthesised WAVs   (no licence - generated, not sampled)
  vo/<set>/  Edge neural TTS    (free, no key) - one folder per reel
  shots/     real screen captures (own work, gitignored)
  SOURCES.txt / LICENSES.md     per-file provenance
```

`remotion.config.ts` points `publicDir` at it, so `staticFile('images/owner.jpg')`
just works. Set `REEL_ASSETS` to keep the library on another drive.

The path there is relative, not `path.join(__dirname, ...)`: the config is
compiled before it runs, so `__dirname` is a temp build directory. Get that
wrong and the bundle ends up with an empty public folder - images still render,
audio 404s, and nothing tells you why.

**Licensing is not fussiness here.** Instagram and YouTube both run automated
content-ID, and a strike on a personal-brand account costs far more than
sourcing properly in the first place. Sound is where this actually bites — a
stock whoosh that also appears in ten thousand other uploads is exactly what a
fingerprint matcher is built to catch — which is why the SFX are synthesised
rather than downloaded.

### The audio pipeline

```bash
node tools/vo.js meta         # voice-over MP3s from tools/vo-lines.meta.json
node tools/durations.js meta  # exact lengths -> tools/vo-durations.meta.json
node tools/sfx.js             # regenerate the effects
node tools/shots.js           # recapture the Ad Library screenshots
```

`tools/vo.js` uses Microsoft Edge's neural TTS — the engine behind Edge's Read
Aloud. It is free and needs no key, which matters more than it sounds: a reel
pipeline that bills per render is one you stop using after a fortnight. Voice is
`en-GB-RyanNeural` at `-8%` rate; override with `VO_VOICE`.

**Beat lengths come from the measured MP3s, never from round numbers.** The
script imports `vo-durations.json` and adds breathing room, so editing a line
and re-running the two commands re-times the reel automatically. Timing a beat
to a guess and then wondering why the caption lands late is an hour you don't
get back.

`tools/durations.js` parses MPEG frame headers directly, because there is no
ffmpeg in this project and Remotion 4 doesn't expose one. Estimating from file
size and bitrate is close, but "close" across six beats compounds into captions
a third of a second off the voice by the end.

### Colour: film, not screen

`src/engine/palette.ts` is the single source. Change it there, not in a
component.

The distinction the whole look rests on:

| | screen colour | film colour |
| --- | --- | --- |
| highlights | pure `#fff` | bone `#f0e9dc` |
| accent | electric blue | ochre `#d8a24a` |
| negative | alarm red | oxidised brick `#b04a38` |
| positive | neon green | olive drab `#8d9a63` |
| ground | blue-black | warm ink `#0b0906` |
| shadows | coloured glow | dark and soft only |

**The single biggest tell is glow.** `box-shadow: 0 0 40px <colour>` is what
makes an otherwise good frame read as a UI mock rather than a documentary, so
there are no coloured shadows anywhere in this project.

Two things the palette alone cannot fix:

- **A cold source photo.** The whole-frame grade cannot rescue an image that was
  lit the wrong colour - a blue-LED server room stays blue and fights everything
  warm layered over it. `PhotoBackdrop` takes a per-photo `grade`, and
  `WARM` is the standard teal-to-amber conversion: push hard to sepia, then
  bring the saturation back.
- **Stacked darkening.** Vignette plus `darken` plus `blur` compounds, and
  three moderate values crush a photograph to solid black. If a backdrop is
  invisible, lower `darken` before touching anything else.

### Choosing music without being able to hear it

`node tools/audition.js` decodes every track in the library through Chrome and
prints four numbers, so a track can be picked on evidence rather than on its
title:

| | what it is | what to want under a reel |
| --- | --- | --- |
| `loudness` | mean RMS | mid — the gain compensates, but very quiet tracks need so much boost they get noisy |
| `brightness` | zero-crossing rate, a cheap stand-in for spectral centroid | **low** — bright music fights a dark screen and competes with the visual |
| `pulse` | onsets per second | **steady and above ~3** under a moving camera; sparse tracks make a pan feel like it has stalled |
| `variance` | how much loudness swings | **low** — builds and drops fight a constant-speed camera move |

Measured across the nine cleared tracks:

```
file                      dur    loud   bright  pulse/s  variance
deep-techno-ambience.mp3  123s   0.397   0.105    3.97    0.33
sun-and-his-daughter.mp3  168s   0.249   0.124    1.97    0.28
echoes.mp3                226s   0.116   0.132    0.88    0.37
hazy-after-hours.mp3      127s   0.320   0.241    4.65    0.53
sci-fi-score.mp3           97s   0.220   0.274    2.11    0.30
discover.mp3              144s   0.137   0.332    0.43    0.44
cyberpunk-city.mp3        100s   0.201   0.466    1.12    0.28
deep-urban.mp3            289s   0.245   0.547    3.89    0.49
digital-clouds.mp3        101s   0.174   0.633    3.32    0.64
```

That is how `WorkflowTour` ended up on `deep-techno-ambience`: darkest, most
present, steady pulse, low variance. Its first pick, `sun-and-his-daughter`, was
chosen from the title alone and measures 1.97 onsets/sec — too sparse to carry a
constantly moving shot with no narration.

**This does not replace listening.** It rules out the obviously wrong ones and
shortlists two or three. Swapping is one string in the reel's `<Audio>`.

**Two things to do on every swap:**

- **Compensate the gain.** Tracks differ by 3x in RMS across this library, so
  reusing a gain figure from another reel lands the new track far too hot or too
  quiet. Divide: `newGain = oldGain * (oldLoudness / newLoudness)`.
- **Check for an intro.** `startFrom` skips to the steadiest window when a track
  opens quiet. `deep-techno-ambience` needs no protection here — it is at full
  energy by the first second — but it still starts at 63s, which measured as its
  flattest 27-second stretch (variance 0.03).

### The documentary collage

`src/engine/photo.tsx`. The format being copied layers cut-out characters over
painted backgrounds — which needs transparent PNGs, and stock photography does
not come cut out. So the collage is built the way documentaries actually do it:
a darkened full-bleed `PhotoBackdrop`, with bordered `PhotoCard` prints laid on
top at slight angles, and `PhotoPile` for the evidence-pile beat. Same depth,
same movement, and it works with the rectangular photos you can get for free.

---

## Reels

| id | story | length |
| --- | --- | --- |
| `NoWebsite` | 25 Phoenix dentists → 0 leads; one word changed → 6/6 | 31s |
| `MetaAdLibrary` | search what a business writes, not what it is | 40s |
| `WorkflowTour` | a camera move across the real 30-node workflow | 26s |

Both repos are live: [n8n-google-maps-leads](https://github.com/aayan-cloud/n8n-google-maps-leads) and [n8n-meta-ad-library-leads](https://github.com/aayan-cloud/n8n-meta-ad-library-leads).

### Which story to tell

The first cut of `MetaAdLibrary` led with a bug: the engine had called six live
sites dead, and two identical runs gave 21 leads then 15. True, honestly told,
and **the wrong story to publish**.

A viewer scrolling Instagram does not see rigour, they see a tool that cannot
reproduce itself. Four of six beats were spent on the thing being broken and one
on it being fixed, so the residue was "unreliable" — the opposite of what a
channel that eventually sells automation needs.

A bug-and-fix arc plays well to developers who already trust you. It is the
wrong arc for an audience deciding whether you are worth hiring.

**The rule this produced: lead with a technique the viewer can steal, not with a
mistake you made.** The rewrite leads on searching Meta's Ad Library for what a
small business *writes* rather than what it *is* — same honesty, same real
numbers, but the reveal is useful rather than self-critical. Rigour still earns
its place, as a supporting detail rather than the headline.

### Screenshots are real captures

`node tools/shots.js` drives the installed Chrome through puppeteer-core and
clips each capture to 9:16 at capture time, anchored to a real element's bounding
box rather than to pixel offsets that break when a layout moves.

They are real because the reels state specific numbers, and a viewer who
half-believes one can go and run the same search themselves. A mock-up would make
that check fail, which is worse than showing nothing.

`Stamp` puts the headline number *over* the capture rather than relying on the
number inside it — at the top edge of a 9:16 frame the vignette and corner blur
make small UI text unreadable on a phone.

Lead tables come from real CSV output with **business names masked**. The data is
real; handing a public audience a ready-made list of who to approach is not the
point of the video.

### Verify numbers against the live source, not the README

`~110` in the current cut was `~130` in the engine's README. Meta's active ad pool
moves, so the README figure was right when written and would have been wrong by
the time it reached the screen. Every number in a reel is checked live on the
day, and the check is one search.

### A standing check before you post

An end card must never name a repo that is not live. Verify before rendering:

```bash
curl -s -o /dev/null -w "%{http_code}" https://github.com/aayan-cloud/<repo>
```

A 404 on the one link the whole reel is driving to costs more trust than no
end card at all. Both current reels point at repos confirmed public.
---

## Reel 03: the workflow tour

A camera move across a real n8n workflow, with data pulsing along the edges.
No voice-over, no captions — the format works muted and wordless, and narrating
a visual that already reads just covers it up.

```bash
node tools/graph.js "<path to workflow.json>" ad-library
npx remotion render WorkflowTour out/workflow-tour.mp4
```

### It is the real graph, not a diagram of one

n8n stores the canvas position of every node in its exported JSON, so
`tools/graph.js` can slim a real workflow down to nodes and edges and the reel
draws it exactly as it sits in the editor. The node count on screen is the node
count in n8n.

That is the whole advantage over the reference this format copies. Anyone can
animate a generic "AI agent" graph; almost nobody can animate one that is
actually running in production and link the repo underneath it.

Sticky notes are stripped (they are annotations, not pipeline). Disabled nodes
are **kept and dimmed**, because they are on the canvas in n8n too and dropping
them would make the count on screen disagree with the count in the editor.

### One number drives everything

`wave` is a position in n8n's own x coordinate space. The camera follows it,
edges fire as it passes their source, and nodes light up once the pulse would
have arrived. Camera and animation read the same number, so they cannot drift
apart — which is exactly the class of bug that a per-edge timer approach
produces two days later.

Two things that had to be got right:

- **Loop-back edges.** `Parse Page Results` returns to `Loop Pages`, 660px to
  its left. Timing a pulse across the gap between source and target gives
  `interpolate` a decreasing input range, which it refuses outright. Pulses are
  timed off the source node plus a fixed span instead, so direction stops
  mattering.
- **Node lighting order.** Lighting a node as the wave passed it meant nodes lit
  *before* their incoming pulse arrived, which reads as decoration rather than
  as dataflow. Nodes now light on arrival.

### The pull-back

The reel ends by pulling back to reveal the shape of the whole pipeline. Not all
the way: this graph is 4,600px wide and the frame is 1,080, so a full fit lands
near 0.2 scale where the pipeline is an illegible hairline and the reveal means
nothing. `WIDE = 0.44` shows about half — still obviously a lot of nodes, still
recognisably nodes. The end card sits in the lower third rather than centred, so
it does not cover the thing the pull-back exists to show.

### Reusing it

Any n8n workflow works. Point `tools/graph.js` at another export, add a
`Composition`, and the camera logic needs no changes — it derives its own bounds
from the node positions.
