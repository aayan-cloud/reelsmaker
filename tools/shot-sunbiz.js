/**
 * Real footage for the outreach reel.
 *
 *   node tools/shot-sunbiz.js
 *
 * WHY PORTRAIT AND NOT 16:9
 *
 * The existing ScreenCard is 16:9, and a wide capture dropped into a 1080x1920 reel
 * becomes a thin band with eight-pixel text. That is what made an earlier reel here
 * unreadable. These are shot at 1000x1500 so a real screen can fill most of a phone
 * frame at a size someone can actually read.
 *
 * WHAT IS BEING SHOT
 *
 * Only things that are genuinely true and genuinely checkable:
 *   - live Google Maps pages for real leads, showing reviews and NO website button
 *   - the real terminal output of the prospector run, verbatim from the log
 *   - the real CSV, with the businesses that are actually in it
 *
 * The point is that a viewer can pause, read the business name, search it themselves
 * and find the same thing. A recreation cannot survive that and a screenshot can.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS } = require('./assets');
const OUT = path.join(ASSETS, 'shots', 'sunbiz');
const LEADS = String.raw`C:\Users\Aayan\Documents\sunbiz-leads\data\leads.json`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** The terminal, rendered from the real run. Text is copied from the actual output. */
const TERMINAL = `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;height:100%;background:#0a0a0c;}
  pre{margin:0;padding:56px 44px;color:#d8d8dc;font:600 30px/1.65 Consolas,Menlo,monospace;
      white-space:pre-wrap;}
  .p{color:#6f7078}
  .hit{color:#ff7a45;font-weight:800}
  .bad{color:#ff4d4d;font-weight:800}
  .ok{color:#2ecc8f;font-weight:800}
</style>
<pre><span class="p">$</span> npm run prospect

mobile mechanic Jacksonville FL
  40 businesses  ...<span class="hit">##</span>.....<span class="hit">#</span>.
mobile mechanic Tampa FL
  21 businesses  ....<span class="hit">#</span>.<span class="hit">#</span>..<span class="hit">##</span>.
mobile car detailing Orlando FL
  62 businesses  <span class="hit">#</span>........<span class="hit">#</span>..
mobile car detailing Tampa FL
  62 businesses  ......<span class="hit">#</span>.<span class="hit">##</span>..

<span class="ok">27 businesses with NO website</span>
</pre>`;

/** The block. This is what the run actually printed when Google cut it off. */
const BLOCKED = `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;height:100%;background:#0a0a0c;}
  pre{margin:0;padding:56px 44px;color:#d8d8dc;font:600 30px/1.65 Consolas,Menlo,monospace;
      white-space:pre-wrap;}
  .p{color:#6f7078}
  .bad{color:#ff4d4d;font-weight:800}
</style>
<pre><span class="p">$</span> node lib/cohort.js 30

  lookup  113 ...
  lookup  114 ...
  lookup  115 ...
  lookup  116 ...

  <span class="bad">BLOCKED by Google - stopping</span>
</pre>`;

const table = (rows) => `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;background:#0a0a0c;color:#eaeaee;
            font:500 27px/1.5 Segoe UI,-apple-system,Helvetica Neue,Arial,sans-serif;}
  table{border-collapse:collapse;width:100%;}
  th{ text-align:left;padding:22px 20px;font-size:22px;letter-spacing:.14em;
      text-transform:uppercase;color:#8a8b93;border-bottom:1px solid #26262c;}
  td{padding:20px;border-bottom:1px solid #17171b;white-space:nowrap;}
  .rev{color:#ff7a45;font-weight:800}
  .tel{color:#9fb4ff;font-variant-numeric:tabular-nums}
  .none{color:#ff4d4d;font-weight:700}
</style>
<table>
<tr><th>Business</th><th>Reviews</th><th>Phone</th><th>Website</th></tr>
${rows.map((r) => `<tr><td>${r.title.slice(0, 30)}</td><td class="rev">${r.reviews}</td>` +
  `<td class="tel">${r.phone}</td><td class="none">NONE</td></tr>`).join('\n')}
</table>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const leads = JSON.parse(fs.readFileSync(LEADS, 'utf8'))
    .filter((l) => l.phone)
    .sort((a, b) => b.reviews - a.reviews);

  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--lang=en-US'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 2 });
  await p.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
  );

  // --- local pages ---------------------------------------------------------------
  // Clipped to the content, not the viewport. A 1000x1500 shot of a terminal whose output
  // is 700px tall leaves half the card empty black, and inside a reel that reads as a
  // rendering bug rather than a screenshot.
  for (const [name, html] of [['terminal', TERMINAL], ['blocked', BLOCKED], ['table', table(leads.slice(0, 9))]]) {
    await p.setContent(html, { waitUntil: 'domcontentloaded' });
    const box = await p.evaluate(() => {
      const el = document.querySelector('pre, table');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { width: Math.ceil(r.right), height: Math.ceil(r.bottom) };
    });
    await p.screenshot({
      path: path.join(OUT, name + '.png'),
      clip: box ? { x: 0, y: 0, width: Math.min(box.width + 44, 1000), height: box.height + 44 } : undefined,
    });
    console.log(`${name}.png  ${box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'full'}`);
  }

  // --- live Maps place pages -------------------------------------------------------
  // The proof shot: a real business, real review count, and no Website button on the
  // panel. Anyone can open the same page and see the same thing.
  /**
   * Shot on a PHONE viewport, not a desktop one.
   *
   * On desktop Maps the place panel is a column down the left and the other half of the
   * frame is a map of central Florida, which says nothing and wastes the space a reel
   * has least of. The mobile layout renders the same panel full width, so the capture
   * is already phone-shaped and needs no cropping - and it looks like what a viewer
   * would see if they looked the business up themselves, which is the entire point.
   *
   * The frame to watch for is Google's own "Add website" prompt under "Add missing
   * information". That is Google saying the website is missing, about a five-star
   * business, in Google's own interface. Nothing drawn could be more convincing.
   */
  // Mobile emulation was tried and abandoned: Maps on a phone user-agent throws an
  // "Open the Google Maps app?" dialog that greys out the entire page, and dismissing it
  // reliably is more moving parts than cropping. Desktop, clipped to the panel, gets the
  // same phone-shaped result deterministically.
  // The panel's bounds are read from the DOM rather than hardcoded. Two hand-measured
  // clips in a row cut through the text - Maps shifts the column depending on the search
  // box and the photo strip, so eyeballing pixel offsets off a screenshot does not
  // survive the next business. `div[role="main"]` IS the panel; ask it where it is.
  for (const [i, lead] of leads.slice(0, 4).entries()) {
    try {
      await p.goto(lead.mapsUrl + '?hl=en', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForSelector('h1', { timeout: 20000 }).catch(() => {});
      await wait(3800);

      const box = await p.evaluate(() => {
        const el = document.querySelector('div[role="main"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.width, height: r.height };
      });

      const clip = box && box.width > 200
        ? { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 1040) }
        : undefined;

      const file = path.join(OUT, `maps-${i + 1}.png`);
      await p.screenshot({ path: file, clip });
      console.log(`maps-${i + 1}.png  ${lead.title}  ${lead.reviews} rev` +
        (clip ? `  panel ${Math.round(clip.width)}x${Math.round(clip.height)}` : '  FULL PAGE'));
    } catch (e) {
      console.log(`maps-${i + 1} FAILED: ${e.message.slice(0, 80)}`);
    }
  }

  await b.close();
  console.log('\n-> ' + OUT);
})();
