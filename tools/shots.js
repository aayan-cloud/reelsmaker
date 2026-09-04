/**
 * Real screenshots for the reels, cropped to 9:16 at capture time.
 *
 *   node tools/shots.js
 *
 * Why crop here rather than pan over a wide image in Remotion: a desktop
 * screenshot is much wider than 1080x1920, so framing it later means guessing
 * percentages and re-rendering to check. Clipping at capture is deterministic,
 * and the clip is anchored to a real element's bounding box rather than to
 * numbers that break the next time Meta moves its layout.
 *
 * Why real captures at all: the reels state specific numbers, and a viewer who
 * half-believes one can go and run the same search. A mock-up would make that
 * check fail, which is worse than showing nothing.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS } = require('./assets');
const OUT = require('path').join(ASSETS, 'shots');
const AD_LIB = 'https://www.facebook.com/ads/library/';

const RATIO = 1080 / 1920;
const CLIP_H = 1300;
const CLIP_W = Math.round(CLIP_H * RATIO);

const pages = [
  {
    key: 'cafe',
    // Searching for what a business IS.
    url: `${AD_LIB}?active_status=active&ad_type=all&country=IN&q=cafe&search_type=keyword_unordered&media_type=all`,
  },
  {
    key: 'phrase',
    // Searching for what a small business WRITES.
    url: `${AD_LIB}?active_status=active&ad_type=all&country=IN&q=%22walk-ins%20welcome%22&search_type=keyword_exact_phrase&media_type=all`,
  },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--lang=en-GB'],
  });

  for (const { key, url } of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 2600, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await new Promise((r) => setTimeout(r, 7000));

    // Anchor on the result-count line rather than a hard-coded y.
    const anchor = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('div,span,h1,h2'))
        .find((e) => /^~[\d,]+ results$/.test((e.textContent || '').trim()));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, text: el.textContent.trim() };
    });
    if (!anchor) throw new Error(`${key}: could not find the result count`);

    const shots = [
      // The headline number, with the first row of ads under it.
      { name: `adlib-${key}-count`, x: Math.max(0, anchor.x - 30), y: Math.max(0, anchor.y - 60) },
      // Further down: who is actually advertising.
      { name: `adlib-${key}-who`, x: Math.max(0, anchor.x - 30), y: anchor.y + 330 },
    ];

    for (const s of shots) {
      const file = path.join(OUT, `${s.name}.png`);
      await page.screenshot({ path: file, clip: { x: s.x, y: s.y, width: CLIP_W, height: CLIP_H } });
      console.log(`${s.name}.png  ${anchor.text}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
    }
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
