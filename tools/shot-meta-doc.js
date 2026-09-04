/**
 * Capture Meta's own Cloud API migration doc, clipped to 9:16.
 *
 * This is the evidence for the whole reel: the claim that automating WhatsApp
 * costs you the WhatsApp app on that number is Meta's, in writing, not mine.
 * A viewer can open the same URL and read the same paragraph.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS } = require('./assets');
const OUT = require('path').join(ASSETS, 'shots');
const URL_DOC =
  'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/migrate-existing-whatsapp-number-to-a-business-account';

const CLIP_H = 1300;
const CLIP_W = Math.round(CLIP_H * (1080 / 1920));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--lang=en-GB'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1300, height: 2400, deviceScaleFactor: 2 });
  await p.goto(URL_DOC, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 9000));

  // Anchor on the sentence itself rather than a fixed offset, so a docs
  // redesign moves the crop instead of silently capturing the wrong paragraph.
  const anchor = await p.evaluate(() => {
    // Every ancestor also "contains" the sentence, so a plain find() returns
    // the page wrapper and the crop lands on the site header. Take the SMALLEST
    // matching element - that is the paragraph itself.
    const hits = Array.from(document.querySelectorAll('p,li,div')).filter((e) =>
      /you must first delete your WhatsApp Messenger account/i.test(e.textContent || ''),
    );
    const el = hits.sort((x, y) => x.textContent.length - y.textContent.length)[0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y + window.scrollY, n: hits.length, text: el.textContent.trim().slice(0, 140) };
  });
  console.log('hits:', anchor && anchor.n);
  if (!anchor) throw new Error('could not find the migration sentence - has the doc changed?');
  console.log('anchor:', anchor.text);

  const file = path.join(OUT, 'meta-cloud-api-doc.png');
  await p.screenshot({
    path: file,
    clip: { x: Math.max(0, anchor.x - 40), y: Math.max(0, anchor.y - 150), width: CLIP_W, height: CLIP_H },
  });
  console.log(`meta-cloud-api-doc.png  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  await b.close();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
