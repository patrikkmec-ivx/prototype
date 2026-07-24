// Load-time smoke test. Static gates cannot see a reference passed as a callback
// (G.map(vGauge)), which is how the v163 dead-code removal escaped every gate.
// Executing the script does see it.
const {JSDOM} = require('jsdom');
const fs = require('fs');
const file = process.argv[2] || 'index.html';
const html = fs.readFileSync(file, 'utf8');
const dom = new JSDOM(html, {runScripts: 'outside-only', pretendToBeVisual: true});
dom.window.matchMedia = q => ({matches:false, media:q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}});
dom.window.scrollTo = () => {};
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
let err = null;
try { dom.window.eval(script); } catch (e) { err = e; }
const d = dom.window.document;
const SK = /[ľĺŕôäťďňČčŠšŽžŤŇĎĽŔÔÄ]/;
const w = d.createTreeWalker(d.body, dom.window.NodeFilter.SHOW_TEXT);
let n, sk = 0, tot = 0, ex = [];
while ((n = w.nextNode())) {
  const v = n.nodeValue.trim(); if (!v) continue; tot++;
  if (SK.test(v)) { sk++; if (ex.length < 8) ex.push(v.slice(0, 60)); }
}
console.log('start-up          :', err ? 'THREW  ' + err.message.slice(0,90) : 'clean');
console.log('html lang         :', d.documentElement.lang);
console.log('switcher agrees   :', d.getElementById('langEN').classList.contains('on') === (d.documentElement.lang === 'en'));
console.log('rendered text nodes:', tot, '| Slovak:', sk);
ex.forEach(e => console.log('    ', e));
process.exit(err ? 1 : 0);
