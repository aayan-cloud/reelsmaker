/**
 * Where the asset library lives.
 *
 * It used to be an absolute path to a folder outside the project, which is
 * fine on one machine and useless in a repo anyone else clones. It is now a
 * folder inside the project, overridable for anyone who wants to keep a big
 * media library on another drive.
 *
 * The binaries are gitignored. Everything in here is reproducible:
 *   node tools/fetch-assets.js   images + music, from assets/SOURCES.txt
 *   node tools/sfx.js            sound effects, synthesised locally
 *   node tools/vo.js <set>       voice-over, free Edge neural TTS
 */
const path = require('path');

const ASSETS = process.env.REEL_ASSETS || path.join(__dirname, '..', 'assets');

module.exports = { ASSETS };
