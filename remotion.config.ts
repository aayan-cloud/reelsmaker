import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Reels are posted to Reels / Shorts / TikTok, all of which re-encode.
// CRF 18 keeps the film grain from turning into mud after their pass.
Config.setCrf(18);

// Assets live in ./assets, so a clone works without editing anything. Set
// REEL_ASSETS to keep a large media library somewhere else.
//
// Relative, not path.join(__dirname, ...): this file is compiled before it runs,
// so __dirname is a temp build directory, and the bundle silently ends up with
// an empty public folder. Images still render, audio 404s, and nothing says why.
Config.setPublicDir(process.env.REEL_ASSETS || './assets');
