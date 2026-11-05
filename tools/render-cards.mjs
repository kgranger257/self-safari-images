// Render Self Safari "Speech Bubble" quote cards to 1080x1080 JPGs.
// Usage: node tools/render-cards.mjs <cards.json> [outDir]
//   cards.json: array of { n, color (hex bg), B (quote), C (author) }
//   outDir default: reflections/  (writes reflection-<n>.jpg)
// Needs Playwright + the bundled Chromium in this environment.
import { createRequire } from 'module';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const cardsPath = process.argv[2];
const outDir = process.argv[3] || 'reflections';
if (!cardsPath) { console.error('usage: node tools/render-cards.mjs <cards.json> [outDir]'); process.exit(1); }
const cards = JSON.parse(readFileSync(cardsPath, 'utf8'));
mkdirSync(outDir, { recursive: true });

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function pageHtml(c){
  // Quote font-size scales down for longer quotes so it always fits the bubble.
  const len = String(c.B).length;
  const size = len > 170 ? 52 : len > 130 ? 60 : len > 95 ? 68 : len > 60 ? 76 : 82;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Lora:ital,wght@0,700;1,600&display=swap">
<style>
 html,body{margin:0;padding:0}
 .card{width:1080px;height:1080px;background:${c.color};display:flex;flex-direction:column;
   align-items:center;justify-content:space-between;padding:88px 84px;color:#fff;text-align:center;
   font-family:"Montserrat",sans-serif;box-sizing:border-box}
 .mark{font-weight:600;font-size:30px;letter-spacing:11px;text-transform:uppercase;color:rgba(255,255,255,.95)}
 .bubble{position:relative;background:#fff;border-radius:40px;width:100%;flex:1;margin:50px 0;
   display:flex;align-items:center;justify-content:center;padding:62px 56px;box-sizing:border-box}
 .bubble::after{content:"";position:absolute;left:17%;bottom:-34px;border-left:34px solid transparent;
   border-right:60px solid transparent;border-top:54px solid #fff}
 .quote{font-family:"Lora",serif;font-weight:700;color:#242424;font-size:${size}px;line-height:1.16;margin:0;letter-spacing:-.5px}
 .author{font-family:"Lora",serif;font-style:italic;font-weight:600;color:#fff;font-size:42px;margin:0 0 6px}
 .site{font-weight:500;font-size:27px;letter-spacing:3px;color:rgba(255,255,255,.82)}
</style></head><body>
<div class="card">
 <div class="mark">Self Safari</div>
 <div class="bubble"><p class="quote">${esc(c.B)}</p></div>
 <div><p class="author">— ${esc(c.C)}</p><div class="site">selfsafari.org</div></div>
</div></body></html>`;
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  args: ['--no-sandbox']
});
const ctx = await browser.newContext({ viewport:{width:1080,height:1080}, deviceScaleFactor:1, ignoreHTTPSErrors:true });
const page = await ctx.newPage();
for (const c of cards){
  await page.setContent(pageHtml(c), { waitUntil:'load' });
  try { await page.evaluate(() => document.fonts.ready); } catch(e){}
  await page.waitForTimeout(800);
  const out = resolve(outDir, `reflection-${c.n}.jpg`);
  await page.screenshot({ path: out, type:'jpeg', quality:90 });
  console.log('rendered', out);
}
await browser.close();
