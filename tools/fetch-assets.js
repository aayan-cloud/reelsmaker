/**
 * Download the images and music this project uses.
 *
 *   node tools/fetch-assets.js
 *
 * The binaries are not in the repo - nobody wants a 55MB clone, and
 * redistributing someone else's photo library is a different licence question
 * from linking to it. What IS in the repo is `assets/SOURCES.txt`, which records
 * where every file came from and under what licence, so this script can put the
 * library back byte for byte.
 *
 * Everything else is generated rather than downloaded:
 *
 *   node tools/sfx.js        sound effects, synthesised - no samples, no licence
 *   node tools/vo.js <set>   voice-over, free Edge neural TTS - no API key
 *
 * So a fresh clone reaches a full render with three commands and no account
 * anywhere.
 */
const fs = require('fs');
const path = require('path');
const { ASSETS } = require('./assets');

const SOURCES = path.join(ASSETS, 'SOURCES.txt');

if (!fs.existsSync(SOURCES)) {
  console.error('No ' + SOURCES + ' - nothing to fetch.');
  process.exit(1);
}

/**
 * A line looks like one of these:
 *
 *   owner.jpg  105657B  <- https://images.pexels.com/...  (Pexels Licence)
 *   music/discover.mp3  <- https://assets.mixkit.co/music/587/587.mp3  (Mixkit)
 *
 * The size is optional and only some lines carry a folder. A bare filename is
 * an image, because that is where the early lines were written from.
 */
const parse = (line) => {
  const [left, right] = line.split('<-');
  if (!right) return null;
  const name = left.trim().split(/\s+/)[0];
  const url = right.trim().split(/\s+/)[0];
  if (!name || !/^https?:\/\//.test(url)) return null;
  return { rel: name.includes('/') ? name : 'images/' + name, url };
};

const wanted = fs
  .readFileSync(SOURCES, 'utf8')
  .split('\n')
  .map(parse)
  .filter(Boolean);

(async () => {
  let got = 0;
  let skipped = 0;
  let failed = 0;

  for (const { rel, url } of wanted) {
    const dest = path.join(ASSETS, rel);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      skipped++;
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      got++;
      console.log('  got   ' + rel + '  ' + (fs.statSync(dest).size / 1024).toFixed(0) + 'KB');
    } catch (e) {
      failed++;
      console.log('  FAIL  ' + rel + '  ' + e.message);
    }
  }

  console.log('\n' + got + ' downloaded, ' + skipped + ' already present, ' + failed + ' failed');
  if (failed) console.log('A failure usually means the host moved the file. See assets/SOURCES.txt.');
  console.log('\nNext:  node tools/sfx.js        (sound effects)');
  console.log('       node tools/vo.js repurposer  (voice-over)');
})();
