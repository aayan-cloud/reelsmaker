/**
 * Measure music tracks so one can be chosen on evidence rather than on title.
 *
 *   node tools/audition.js
 *
 * I cannot hear these files, and "Sun and His Daughter" tells you nothing about
 * whether a track sits under a dark technical visual. Chrome can decode the
 * audio, so this pulls four numbers out of each one:
 *
 *   loudness   mean RMS over the body of the track. How present it is.
 *   brightness spectral centroid, 0-1. Low is warm and dark; high is thin and
 *              bright. A workflow tour wants low - bright music fights a dark
 *              screen and starts competing with the visual for attention.
 *   pulse      onset rate per second. A proxy for tempo and busyness. Under
 *              bare visuals with no narration you want a steady pulse, not a
 *              track that keeps stopping and starting.
 *   variance   how much the loudness swings across the track. High variance
 *              means big builds and drops, which fight a constant-speed camera
 *              move; low variance sits underneath it.
 *
 * None of this is taste. It is enough to rule out the obviously wrong ones and
 * shortlist two or three worth a human listen.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS } = require('./assets');
const MUSIC = require('path').join(ASSETS, 'music');

(async () => {
  const files = fs.readdirSync(MUSIC).filter((f) => f.endsWith('.mp3')).sort();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage();
  const holder = path.join(MUSIC, '_audition.html');
  fs.writeFileSync(holder, '<body>audition</body>');
  await page.goto(pathToFileURL(holder).href, { waitUntil: 'load' });

  const rows = [];
  for (const f of files) {
    const url = pathToFileURL(path.join(MUSIC, f)).href;
    const r = await page.evaluate(async (src) => {
      const buf = await (await fetch(src)).arrayBuffer();
      const ctx = new OfflineAudioContext(1, 1, 44100);
      const audio = await ctx.decodeAudioData(buf);
      const data = audio.getChannelData(0);
      const sr = audio.sampleRate;

      // Skip the first and last 8%: intros fade in and outros fade out, and
      // both would drag the averages toward silence.
      const a = Math.floor(data.length * 0.08);
      const b = Math.floor(data.length * 0.92);

      const WIN = Math.floor(sr * 0.05);
      const rms = [];
      for (let i = a; i + WIN < b; i += WIN) {
        let s = 0;
        for (let j = i; j < i + WIN; j++) s += data[j] * data[j];
        rms.push(Math.sqrt(s / WIN));
      }
      const mean = rms.reduce((x, y) => x + y, 0) / rms.length;
      const variance = Math.sqrt(rms.reduce((x, y) => x + (y - mean) ** 2, 0) / rms.length) / (mean || 1);

      // Onsets: a window markedly louder than the one before it.
      let onsets = 0;
      for (let i = 1; i < rms.length; i++) if (rms[i] > rms[i - 1] * 1.35 && rms[i] > mean * 0.6) onsets++;
      const seconds = (b - a) / sr;

      // Brightness by zero-crossing rate, which tracks the spectral centroid
      // closely enough for ranking and costs one pass instead of an FFT.
      let cross = 0;
      for (let i = a + 1; i < b; i++) if ((data[i - 1] < 0) !== (data[i] < 0)) cross++;

      return {
        dur: audio.duration,
        loudness: mean,
        variance,
        pulse: onsets / seconds,
        brightness: cross / (b - a) * 10,
      };
    }, url);
    rows.push({ file: f, ...r });
  }
  await browser.close();
  fs.rmSync(holder, { force: true });

  rows.sort((x, y) => x.brightness - y.brightness);
  console.log('file'.padEnd(26) + 'dur    loud   bright  pulse/s  variance');
  for (const r of rows) {
    console.log(
      r.file.padEnd(26) +
        `${r.dur.toFixed(0).padStart(3)}s   ` +
        `${r.loudness.toFixed(3)}  ` +
        `${r.brightness.toFixed(3).padStart(6)}  ` +
        `${r.pulse.toFixed(2).padStart(6)}   ` +
        `${r.variance.toFixed(2)}`,
    );
  }
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
