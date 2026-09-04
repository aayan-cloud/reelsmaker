/**
 * Pull still frames out of a video file.
 *
 *   node tools/frames.js "<path to mp4>" [count]
 *
 * There is no ffmpeg on this machine, so this decodes with Chrome: load the
 * file into a <video>, seek, draw to a canvas, read the pixels back. Slower
 * than ffmpeg and perfectly adequate for looking at a reference clip.
 *
 * Needs --allow-file-access-from-files, or a file:// page cannot load a file://
 * video and you get a silent zero-duration element rather than an error.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS } = require('./assets');
const OUT = require('path').join(ASSETS, 'ref');

const src = process.argv[2];
const count = Number(process.argv[3] || 12);
if (!src) { console.error('usage: node tools/frames.js "<mp4>" [count]'); process.exit(1); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      // Both are needed: the page must be allowed to read a file:// video, and
      // the canvas must not be tainted by it when the pixels are read back.
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1400 });

  const url = pathToFileURL(path.resolve(src)).href;
  // setContent leaves the page on an opaque origin, which cannot load a file://
  // resource at all - the video element just sits at readyState 0 until the
  // timeout, with no error to explain why. A real file:// page can.
  const holder = path.join(OUT, "_player.html");
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(holder, `<body style="margin:0;background:#000"><video id="v" src="${url}" muted preload="auto"></video></body>`);
  await page.goto(pathToFileURL(holder).href, { waitUntil: "load" });

  const meta = await page.evaluate(async () => {
    const v = document.getElementById('v');
    // Check readyState BEFORE waiting. preload="auto" on a local file often
    // finishes before this code runs, and an onloadedmetadata handler attached
    // after the fact never fires - the wait then times out on a video that
    // loaded perfectly.
    if (v.readyState < 1) {
      await new Promise((res, rej) => {
        v.onloadedmetadata = res;
        v.onerror = () => rej(new Error('video failed to load'));
        setTimeout(() => rej(new Error('timed out loading video')), 30000);
      });
    }
    return { duration: v.duration, w: v.videoWidth, h: v.videoHeight };
  });
  console.log(`duration ${meta.duration.toFixed(1)}s   ${meta.w}x${meta.h}`);

  for (let i = 0; i < count; i++) {
    // Skip the very start and end - a screen recording usually opens on a
    // half-loaded page and closes on the recorder's own overlay.
    const t = meta.duration * (0.04 + (0.92 * i) / Math.max(1, count - 1));
    const dataUrl = await page.evaluate(async (time) => {
      const v = document.getElementById('v');
      await new Promise((res) => {
        if (Math.abs(v.currentTime - time) < 0.001) return res();
        v.onseeked = res;
        v.currentTime = time;
      });
      const c = document.createElement('canvas');
      c.width = v.videoWidth; c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      return c.toDataURL('image/jpeg', 0.86);
    }, t);
    const file = path.join(OUT, `f${String(i).padStart(2, '0')}-${t.toFixed(1)}s.jpg`);
    fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log(`${path.basename(file)}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
  await browser.close();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
