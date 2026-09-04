/**
 * Voice-over generation, free.
 *
 *   node tools/vo.js <set>        e.g. node tools/vo.js maps
 *
 * A lines file is either a bare array of {id, text}, or an object with a
 * `lines` array plus `voice`/`rate`/`pitch` overrides. Pace belongs to the
 * set: the documentary reels want a slow read, and the keynote ones sound
 * half-asleep at that speed. Keeping it in the file rather than an env var
 * means a regenerate months from now still sounds like the render you shipped.
 *
 * Reads tools/vo-lines.<set>.json and writes one MP3 per line into
 * assets/vo/<set>/. The set name is required rather than defaulted, because
 * the first version wrote every reel's lines to the same six filenames and
 * silently overwrote the previous reel's voice.
 *
 * Uses Microsoft Edge's neural TTS - the engine behind Edge's Read Aloud. Free,
 * no key. That matters more than it sounds: a reel pipeline that bills per
 * render is a pipeline you stop using after a fortnight.
 */
const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const { ASSETS: LIB } = require('./assets');

const set = process.argv[2];
if (!set) {
  console.error('usage: node tools/vo.js <set>   (e.g. meta, maps)');
  process.exit(1);
}
const linesFile = path.join(__dirname, `vo-lines.${set}.json`);
if (!fs.existsSync(linesFile)) {
  console.error(`no such set: ${linesFile}`);
  process.exit(1);
}

const OUT = path.join(LIB, 'vo', set);

const spec = require(linesFile);
const lines = Array.isArray(spec) ? spec : spec.lines;

// en-GB-RyanNeural reads calmer and lower than the US voices, which suits a
// documentary. Swap for en-US-GuyNeural if you want it warmer.
const VOICE = process.env.VO_VOICE || spec.voice || 'en-GB-RyanNeural';
// Documentary pace. The default reads like a news bulletin.
const RATE = spec.rate || '-8%';
const PITCH = spec.pitch || '-4Hz';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  for (const { id, text } of lines) {
    // toFile() takes a DIRECTORY and writes audio.mp3 inside it - it does not
    // create that directory, and the ENOENT it throws names the file, not the
    // missing folder, which sends you looking in the wrong place.
    const dir = path.join(OUT, id);
    fs.mkdirSync(dir, { recursive: true });
    const { audioFilePath } = await tts.toFile(dir, text, { rate: RATE, pitch: PITCH });
    const final = path.join(OUT, `${id}.mp3`);
    fs.renameSync(audioFilePath, final);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`${id}  ${(fs.statSync(final).size / 1024).toFixed(0)}KB`);
  }
  console.log(`\nset: ${set}   voice: ${VOICE}   rate: ${RATE}   -> ${OUT}`);
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
