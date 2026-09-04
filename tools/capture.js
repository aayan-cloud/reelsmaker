/**
 * Real screen capture of n8n actually running, as a frame sequence.
 *
 *   node tools/capture.js --main <workflowId> <name> [frames] [everyMs]
 *   node tools/capture.js --login                  (only if not using --main)
 *
 * WHY THIS EXISTS
 *
 * Every high-performing reel in this niche shows the real tool on screen: a
 * GitHub page scrolling, an actual interface, nodes going green. The reels in
 * this project show beautiful *recreations* instead - kinetic type, glass
 * panels, cards - and a viewer cannot verify a recreation. Polish reads as an
 * advert; a screen recording reads as a peer showing you something. So the
 * opening shot has to be the genuine article.
 *
 * WHY 16:9 AND NOT 1080x1920
 *
 * n8n's canvas is a wide graph. Forcing it into a 9:16 viewport shows about
 * four nodes, which communicates nothing. Captured at 1920x1080 it can sit
 * inside the vertical reel as a screen - which is what the outlier reels in
 * this niche do anyway, and it doubles as a landscape cut for YouTube.
 *
 * WHY PUPPETEER RATHER THAN A SCREEN RECORDER
 *
 * Deterministic framing. The canvas transform is set in code, so the same
 * command produces the same shot every time instead of depending on where the
 * window happened to be. Same argument as `shots.js`.
 *
 * TWO WAYS TO BE LOGGED IN
 *
 *   --main   reuse the everyday Chrome profile, which is already signed in to
 *            n8n. No password is typed by anyone. Chrome must be CLOSED first,
 *            because Chrome holds an exclusive lock on its profile.
 *
 *   default  a dedicated profile in the asset library, signed in once with
 *            `--login`. Slower to set up, but does not need Chrome closed and
 *            keeps automation away from every other logged-in session.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const puppeteer = require('puppeteer-core');

const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const { ASSETS: LIB } = require('./assets');
// Kept outside the project on purpose: it holds an n8n session cookie.
const OWN_PROFILE = path.join(os.homedir(), 'AppData', 'Local', 'aayan-reels-chrome-n8n');
const MAIN_PROFILE = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
const N8N = process.env.N8N_URL || 'http://127.0.0.1:5678';

const W = Number(process.env.CAP_W || 1920);
const H = Number(process.env.CAP_H || 1080);

const flags = process.argv.filter((a) => a.startsWith('--'));
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const loginMode = flags.includes('--login');
const useMain = flags.includes('--main');
const [workflowId, name, frameCount, everyMs] = args;

/**
 * Bring the graph into view.
 *
 * n8n's own zoom-to-fit does not move the pane on a freshly loaded workflow -
 * measured: the transform stays at `translate(0px, 0px) scale(1)` while the
 * nodes sit at x~4700, far outside the viewport. That is why the canvas looks
 * empty when you open it, and it is not a broken import. So compute the fit.
 *
 * `zoom` above 1 crops into the middle rather than fitting everything. Fitting
 * 21 nodes across 1920px still leaves the labels small; a reel wants a few
 * legible nodes, not the whole map.
 */
const fitCanvas = (page, zoom) =>
  page.evaluate((z) => {
    const pane = document.querySelector('.vue-flow__transformationpane');
    const flow = document.querySelector('.vue-flow');
    if (!pane || !flow) return null;
    pane.style.transform = 'translate(0px, 0px) scale(1)';
    const p0 = pane.getBoundingClientRect();
    const ns = [...document.querySelectorAll('.vue-flow__node')].map((n) => n.getBoundingClientRect());
    if (!ns.length) return null;
    const minX = Math.min(...ns.map((r) => r.x)) - p0.x;
    const maxX = Math.max(...ns.map((r) => r.right)) - p0.x;
    const minY = Math.min(...ns.map((r) => r.y)) - p0.y;
    const maxY = Math.max(...ns.map((r) => r.bottom)) - p0.y;
    const w = maxX - minX;
    const h = maxY - minY;
    const fr = flow.getBoundingClientRect();
    const m = 40;
    const s = Math.min((fr.width - 2 * m) / w, (fr.height - 2 * m) / h) * z;
    pane.style.transform =
      `translate(${(fr.width - w * s) / 2 - minX * s}px, ${(fr.height - h * s) / 2 - minY * s}px) scale(${s})`;
    return { nodes: ns.length, scale: +s.toFixed(3) };
  }, zoom);

(async () => {
  const userDataDir = useMain ? MAIN_PROFILE : OWN_PROFILE;
  if (!useMain) fs.mkdirSync(userDataDir, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: loginMode ? false : 'new',
      userDataDir,
      // A headful window must size itself. Forcing `defaultViewport` to
      // 1920x1080 on a smaller display made Chrome start with no window at all -
      // MainWindowHandle 0, nothing to sign in to. The capture viewport is set
      // explicitly further down instead, which works regardless of window size.
      defaultViewport: loginMode ? null : { width: W, height: H },
      args: loginMode
        ? ['--start-maximized', '--window-position=0,0']
        : ['--window-size=' + W + ',' + H, '--hide-scrollbars'],
    });
  } catch (e) {
    if (useMain && /already running|ProcessSingleton|profile|lock/i.test(e.message)) {
      console.error('Chrome is still running, and it holds an exclusive lock on its profile.');
      console.error('Close every Chrome window and run this again.');
      process.exit(1);
    }
    throw e;
  }

  const page = (await browser.pages())[0] || (await browser.newPage());
  // In login mode the viewport follows the real window until capture starts, so
  // the person signing in sees a normal browser rather than a cropped one.
  if (!loginMode) await page.setViewport({ width: W, height: H });

  /**
   * Wait for a human to sign in, in a window they can see.
   *
   * Closing the browser the moment the redirect fires loses the cookie: Chrome
   * flushes its cookie store lazily, so an immediate exit writes nothing and the
   * next headless run lands straight back on /signin. Hence the settle wait -
   * and hence `--login` capturing in the SAME session rather than trusting the
   * cookie to survive at all.
   */
  const waitForSignIn = async () => {
    console.log('\nSign in to n8n in the window that just opened. Waiting...');
    await page.waitForFunction(() => !/signin|setup/.test(location.pathname), { timeout: 0 });
    console.log('Signed in. Letting Chrome flush the cookie...');
    await new Promise((r) => setTimeout(r, 5000));
  };

  if (loginMode && !workflowId) {
    await page.goto(N8N, { waitUntil: 'domcontentloaded' });
    await waitForSignIn();
    console.log('Done. The cookie is in ' + userDataDir + '.');
    await browser.close();
    return;
  }

  // --url captures any public page scrolling instead of an n8n run.
  //
  // Worth having because the most repeated visual across the outlier reels in
  // this niche is simply a GitHub repo scrolling past. It needs no login, so it
  // is the one real shot that is always available.
  if (flags.includes('--url')) {
    const [url, shotName, fc, gapMs] = args;
    const n = Number(fc || 40);
    const step = Number(gapMs || 120);
    const dir = path.join(LIB, 'shots', shotName || 'page');
    fs.mkdirSync(dir, { recursive: true });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // --play captures a moving page instead of a scrolling one. Space is
    // Remotion Studio's play shortcut, and pressing it beats hunting for a
    // button whose markup changes between versions.
    if (flags.includes('--play')) {
      await page.keyboard.press('Space');
      for (let i = 0; i < n; i++) {
        await new Promise((r) => setTimeout(r, step));
        await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
      }
      console.log(n + ' frames -> ' + dir + '  (playing, ' + step + 'ms apart)');
      await browser.close();
      return;
    }

    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    // Stop a viewport short so the last frames are content, not dead space.
    const per = Math.max(1, Math.floor((pageHeight - H) / n));
    for (let i = 0; i < n; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * per);
      await new Promise((r) => setTimeout(r, step));
      await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
    }
    console.log(n + ' frames -> ' + dir + '  (page ' + pageHeight + 'px, ' + per + 'px per frame)');
    await browser.close();
    return;
  }

  if (!workflowId || !name) {
    console.error('usage: node tools/capture.js --main <workflowId> <name> [frames] [everyMs]');
    console.error('       node tools/capture.js --url <url> <name> [frames] [everyMs]');
    await browser.close();
    process.exit(1);
  }

  const total = Number(frameCount || 48);
  const gap = Number(everyMs || 350);
  const OUT = path.join(LIB, 'shots', name);
  fs.mkdirSync(OUT, { recursive: true });

  const target = N8N + '/workflow/' + workflowId;
  await page.goto(target, { waitUntil: 'networkidle2' });

  // Landed on the sign-in page. With --login there is a visible window, so wait
  // for a human rather than failing; headless has nobody to ask.
  if (/signin|setup/.test(new URL(page.url()).pathname)) {
    if (!loginMode) {
      console.error('Not signed in. Re-run with --login and this same workflow id:');
      console.error('  node tools/capture.js --login ' + workflowId + ' ' + (name || '<name>'));
      await browser.close();
      process.exit(1);
    }
    await waitForSignIn();
    await page.goto(target, { waitUntil: 'networkidle2' });
  }
  // Now that nobody needs to look at it, pin the exact capture size.
  await page.setViewport({ width: W, height: H });

  try {
    await page.waitForSelector('.vue-flow__node', { timeout: 20000 });
  } catch {
    console.error('Signed in, but no nodes rendered for workflow ' + workflowId + '.');
    await browser.close();
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 1500));
  console.log('canvas:', await fitCanvas(page, 1.0));

  // Frame 0 is the graph at rest, before anything runs.
  await page.screenshot({ path: path.join(OUT, '0000.png') });

  const run = await page.$('[data-test-id^="execute-workflow-button"]');
  if (run) await run.click();
  else console.warn('No execute button found - capturing the idle canvas only.');

  for (let i = 1; i < total; i++) {
    await new Promise((r) => setTimeout(r, gap));
    await page.screenshot({ path: path.join(OUT, String(i).padStart(4, '0') + '.png') });
    if (i % 10 === 0) console.log('  ' + i + '/' + total);
  }

  console.log('\n' + total + ' frames -> ' + OUT);
  console.log((gap * total) / 1000 + 's of real time; play at ' + Math.round(1000 / gap) + 'fps to keep it honest');
  await browser.close();
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
