/**
 * Exact duration of each voice-over MP3, by counting MPEG frames.
 *
 *   node tools/durations.js <set>
 *
 * There is no ffmpeg in this project and Remotion 4 does not expose one, so the
 * frame headers get parsed directly. Guessing from file size and bitrate is
 * close but not exact, and "close" across six beats compounds into a reel whose
 * captions drift a third of a second off the voice by the end.
 */
const fs = require('fs');
const path = require('path');

const { ASSETS: LIB } = require('./assets');

const set = process.argv[2];
if (!set) { console.error('usage: node tools/durations.js <set>'); process.exit(1); }
const VO = path.join(LIB, 'vo', set);

const BITRATES_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const BITRATES_V2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
const RATES_V1 = [44100, 48000, 32000, 0];
const RATES_V2 = [22050, 24000, 16000, 0];

function durationOf(file) {
  const b = fs.readFileSync(file);
  let i = 0;
  // Skip an ID3v2 tag if present - its body can contain bytes that look like a
  // frame sync, which is how a naive scan ends up with a nonsense duration.
  if (b.length > 10 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) {
    i = 10 + ((b[6] & 0x7f) << 21 | (b[7] & 0x7f) << 14 | (b[8] & 0x7f) << 7 | (b[9] & 0x7f));
  }
  let samples = 0, rate = 0;
  while (i < b.length - 4) {
    if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) { i++; continue; }
    const versionBits = (b[i + 1] >> 3) & 0x03;
    const layerBits = (b[i + 1] >> 1) & 0x03;
    if (layerBits !== 1 || versionBits === 1) { i++; continue; }
    const mpeg1 = versionBits === 3;
    const bitrate = (mpeg1 ? BITRATES_V1_L3 : BITRATES_V2_L3)[(b[i + 2] >> 4) & 0x0f];
    const sampleRate = (mpeg1 ? RATES_V1 : RATES_V2)[(b[i + 2] >> 2) & 0x03];
    if (!bitrate || !sampleRate) { i++; continue; }
    const perFrame = mpeg1 ? 1152 : 576;
    const size = Math.floor((perFrame / 8) * bitrate * 1000 / sampleRate) + ((b[i + 2] >> 1) & 0x01);
    if (size < 4) { i++; continue; }
    samples += perFrame; rate = sampleRate; i += size;
  }
  return rate ? samples / rate : 0;
}

const out = {};
let total = 0;
for (const f of fs.readdirSync(VO).filter((f) => f.endsWith('.mp3')).sort()) {
  const d = durationOf(path.join(VO, f));
  out[path.basename(f, '.mp3')] = Number(d.toFixed(2));
  total += d;
  console.log(`${f}  ${d.toFixed(2)}s`);
}
console.log(`\ntotal  ${total.toFixed(2)}s`);
fs.writeFileSync(path.join(__dirname, `vo-durations.${set}.json`), JSON.stringify(out, null, 2));
