/**
 * Screenshot the leads table built from real CSV output.
 *
 * Uses pathToFileURL rather than hand-building a file:/// string. Escaping a
 * Windows path by hand needs a backslash regex, and that is exactly the escape
 * that keeps getting eaten on its way into a file in this project.
 */
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS } = require('./assets');
const DIR = require('path').join(ASSETS, 'shots');

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1240, height: 900, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(path.join(DIR, 'leads.html')).href, { waitUntil: 'networkidle0' });
  await p.screenshot({ path: path.join(DIR, 'leads.png'), fullPage: true });
  console.log('leads.png written');
  await b.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
