/* Daniel Inc. · low-poly 3D desk (three.js). Change U to use another GitHub account.
   Repos load live from the GitHub API on every page load. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const U = 'danieltheparasite', A = 'https://api.github.com', MAX = 24, R = document.documentElement;
const $ = s => document.querySelector(s), E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const ls = { g: k => { try { return localStorage.getItem(k); } catch { return null; } }, s: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const S = { user: null, list: [], sel: null, cached: false, ok: false, view: 'home', lid: false, la: 0, scr: 'desk', typed: '', pend: null, theme: (+ls.g('dinc-theme') || 0) % 5 };
const THEMES = [[210, 0xffe14d], [335, 0xff8ad0], [150, 0x7dffb0], [28, 0xffa94d], [265, 0xb8aaff]]; // [hue, sticky-note color]
const hsh = s => Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
const ago = t => { const s = (Date.now() - t) / 1e3; for (const [n, w] of [[31536e3, 'year'], [2592e3, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']]) if (s >= n) { const v = Math.floor(s / n); return v + ' ' + w + (v > 1 ? 's' : '') + ' ago'; } return 'just now'; };
const site$ = u => u && (/^https?:/.test(u) ? u : 'https://' + u);
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ctex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const wrapT = (x, t, px, py, w, lh, max) => { let l = '', n = 0; for (const s of String(t).split(/\s+/)) { const tt = l ? l + ' ' + s : s; if (x.measureText(tt).width > w && l) { x.fillText(l, px, py); py += lh; l = s; if (++n >= max) return py; } else l = tt; } x.fillText(l, px, py); return py + lh; };

/* renderer, camera, controls */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
$('#stage').append(renderer.domElement);
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0, 12, 30);
const cam = new THREE.PerspectiveCamera(42, 1, .1, 60);
const HOME = { p: new THREE.Vector3(0, 3, 6.6), t: new THREE.Vector3(0, 1.2, 0) }, BOOKV = { p: new THREE.Vector3(-2.2, 2.2, 3.7), t: new THREE.Vector3(-2.7, .1, 1) };
cam.position.copy(HOME.p);
const ctl = new OrbitControls(cam, renderer.domElement);
Object.assign(ctl, { enableDamping: true, minDistance: 1.5, maxDistance: 9, maxPolarAngle: Math.PI * .52, minAzimuthAngle: -1.15, maxAzimuthAngle: 1.15, enablePan: false }); ctl.target.copy(HOME.t);

/* low-poly helpers */
const M = (c, o) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .85, ...o });
const add = (g, m, x, y, z, p = scene) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
const bx = (p, w, h, d, c, x, y, z, o) => add(new THREE.BoxGeometry(w, h, d), c.isMaterial ? c : M(c, o), x, y, z, p);
const cy = (p, rt, rb, h, s, c, x, y, z, o) => add(new THREE.CylinderGeometry(rt, rb, h, s), c.isMaterial ? c : M(c, o), x, y, z, p);
const ico = (p, r, c, x, y, z, o, d = 0) => add(new THREE.IcosahedronGeometry(r, d), c.isMaterial ? c : M(c, o), x, y, z, p);
const grp = (x, y, z, ud) => { const g = new THREE.Group(); g.position.set(x, y, z); g.userData = ud || {}; scene.add(g); return g; };

/* lights */
const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, .5); scene.add(hemi);
const moon = new THREE.DirectionalLight(0x8899ff, .8); moon.position.set(3, 6, -4); scene.add(moon);
const key = new THREE.DirectionalLight(0xffe2b8, .5); key.position.set(-2, 6, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 5, bottom: -3 }); scene.add(key);
const lampSpot = new THREE.SpotLight(0xffe14d, 26, 10, .8, .7, 1.4), lampGlow = new THREE.PointLight(0xffe14d, 3, 7, 1.6), glow = new THREE.PointLight(0x9a6bff, 0, 5, 1.6);
lampSpot.position.set(-3.8, 2.3, -.3); lampSpot.target.position.set(-3, 0, .4); lampGlow.position.set(-3.8, 2.3, -.1); glow.position.set(0, 1.1, .5); scene.add(lampSpot, lampSpot.target, lampGlow, glow);

/* room: wall with window, desk, night city */
const wallMat = M(0x333355), woodMat = M(0x6b3f2a), deskMat = M(0x7a4a30, { roughness: .6 });
bx(scene, 4, 6, .2, wallMat, -5, 2.2, -1.8); bx(scene, 4, 6, .2, wallMat, 5, 2.2, -1.8); bx(scene, 6, 1.9, .2, wallMat, 0, .15, -1.8); bx(scene, 6, 1.6, .2, wallMat, 0, 4.4, -1.8);
bx(scene, 6.8, .14, .5, woodMat, 0, 1.12, -1.6); bx(scene, .1, 2.5, .1, woodMat, 0, 2.35, -1.82); bx(scene, 6, .1, .1, woodMat, 0, 2.35, -1.82);
for (let i = 0; i < 6; i++) bx(scene, 6.4, .07, .14, i % 2 ? 0x8a5a3a : 0x6b3f2a, 0, 3.55 - i * .09, -1.55);
bx(scene, 9.6, .4, 3.8, deskMat, 0, -.2, .1); bx(scene, 9.6, 5, .4, 0x1a1a24, 0, -2.8, 1.9);
const win = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .1, .02), new THREE.MeshBasicMaterial(), 200), mtx = new THREE.Matrix4(), col = new THREE.Color(); let wi = 0;
for (let i = 0; i < 30; i++) {
  const w = .5 + Math.random() * .5, h = 3 + Math.random() * 2.4, x = -9 + i * .62, z = -4 - Math.random() * 3, hu = Math.random();
  bx(scene, w, h, w, M(new THREE.Color().setHSL(hu, .45, .14), { emissive: new THREE.Color().setHSL(hu, .9, .3), emissiveIntensity: .3 }), x, -1.5 + h / 2, z);
  for (let k = 0; k < 6 && wi < 200; k++, wi++) { mtx.setPosition(x + (Math.random() - .5) * w * .8, -1.5 + Math.random() * h, z + w / 2 + .02); win.setMatrixAt(wi, mtx); win.setColorAt(wi, col.set([0xffd27a, 0x7ff0ff, 0xff7ad9, 0xfff3c4][wi % 4])); }
}
scene.add(win);

/* wall-mounted pipe lamp, its bulb buried under sticky notes */
const pipe = M(0x2a2b30, { metalness: .7, roughness: .4 }), lamp = new THREE.Group(); scene.add(lamp);
cy(lamp, .28, .28, .06, 10, pipe, -3.8, 3.2, -1.67).rotation.x = Math.PI / 2; cy(lamp, .07, .07, 1.05, 6, pipe, -3.8, 3.2, -1.17).rotation.x = Math.PI / 2;
ico(lamp, .11, pipe, -3.8, 3.2, -.65); cy(lamp, .07, .07, .6, 6, pipe, -3.8, 2.9, -.65); cy(lamp, .12, .12, .2, 8, pipe, -3.8, 2.5, -.65);
ico(lamp, .22, M(0xffe9a0, { emissive: 0xffc861, emissiveIntensity: .6 }), -3.8, 2.25, -.65, null, 1);
const notes = [], bc = new THREE.Vector3(-3.8, 2.25, -.65);
for (let i = 0; i < 13; i++) {
  const m = add(new THREE.PlaneGeometry(.3, .3), M(0xffe14d, { side: THREE.DoubleSide }), 0, 0, 0, lamp);
  if (i < 9) { const d = new THREE.Vector3(Math.random() - .5, Math.random() * -.9 - .1, Math.random() - .3).normalize(); m.position.copy(bc).addScaledVector(d, .26); m.lookAt(m.position.clone().add(d)); }
  else { m.position.set(-3.8, 3.15 - (i - 9) * .22, -.65 + (i % 2 ? .08 : -.08)); m.rotation.y = i % 2 ? 1.2 : -1.2; }
  m.rotateZ(Math.random() * 1.5); notes.push(m);
}

/* ASUS ROG Zephyrus: closed black lid with erratic strip lights */
const LZ = .15, lap = grp(0, 0, LZ, { kind: 'laptop', tip: `<b>Daniel's ASUS ROG Zephyrus</b><br>AMD Ryzen AI 9 HX 370 (2.00 GHz)<br>32 GB RAM · 1.86 TB storage<br>NVIDIA RTX 5070 Ti Laptop GPU, 12 GB` });
bx(lap, 3, .12, 2.1, 0x23252c, 0, .06, .3, { metalness: .4, roughness: .55 }); cy(lap, .06, .06, 2.6, 6, 0x15161a, 0, .125, -.75).rotation.z = Math.PI / 2;
bx(lap, .28, .01, .9, 0x15161a, -1.3, .122, -.05); bx(lap, .28, .01, .9, 0x15161a, 1.3, .122, -.05); bx(lap, 1.3, .006, .7, 0x31343d, 0, .123, .82);
const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(.13, .05, .13), M(0xffffff, { roughness: .6 }), 70);
for (let r = 0, n = 0; r < 5; r++) for (let k = 0; k < 14; k++, n++) { mtx.setPosition(-1.07 + k * .165, .145, -.5 + r * .15); keys.setMatrixAt(n, mtx); keys.setColorAt(n, col.set(r === 4 && k > 4 && k < 9 ? 0x4a4e5c : (n % 9 === 0 ? 0x5b3fa8 : 0x2c2f38))); }
keys.castShadow = true; lap.add(keys);
const lidP = new THREE.Group(); lidP.position.set(0, .125, -.75); lap.add(lidP);
bx(lidP, 3, .06, 2.1, 0x15161a, 0, .03, 1.05, { metalness: .5, roughness: .4 }); bx(lidP, .55, .01, .14, 0x70737e, -.95, .062, 1.88, { metalness: .8, roughness: .3 });
const cv = cvs(512, 320), g = cv.getContext('2d'), tex = ctex(cv);
const scr = add(new THREE.PlaneGeometry(2.8, 1.75), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, -.002, 1.05, lidP); scr.rotation.x = Math.PI / 2; scr.castShadow = false;
const NS = 28, strip = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .012, .045), new THREE.MeshBasicMaterial({ toneMapped: false }), NS), sOn = [], sT = [], cOn = new THREE.Color(0xbfe9ff), cOff = new THREE.Color(0x07080b);
for (let i = 0; i < NS; i++) { const f = i / (NS - 1); mtx.makeRotationY(-Math.atan2(1.4, 2.3)); mtx.setPosition(-1.15 + f * 2.3, .066, .35 + f * 1.4); strip.setMatrixAt(i, mtx); sOn[i] = Math.random() > .5; sT[i] = Math.random(); }
lidP.add(strip); let glitch = false, gT = 1;

/* RGB mouse */
const rgbM = new THREE.MeshBasicMaterial({ toneMapped: false }), mo = grp(1.95, 0, .65, { kind: 'mouse', tip: '<b>Kreo Hawk</b>' }); mo.rotation.y = .25;
bx(mo, .32, .09, .5, 0x16171c, 0, .075, 0, { roughness: .4 }); bx(mo, .33, .025, .52, rgbM, 0, .02, 0); bx(mo, .04, .012, .2, rgbM, 0, .124, .08); cy(mo, .035, .035, .06, 8, rgbM, 0, .128, -.1).rotation.z = Math.PI / 2;
const mLight = new THREE.PointLight(0xffffff, 1.4, 2, 2); mLight.position.set(1.95, .25, .65); scene.add(mLight);

/* Tangzu Waner Red Lion IEMs */
const iem = grp(-3.4, 0, -.3, { kind: 'iem', tip: '<b>Tangzu Waner</b><br>Red Lion Edition' }), red = M(0xd4101c, { transparent: true, opacity: .86, emissive: 0x6a0008, emissiveIntensity: .9, roughness: .2 });
for (const s of [-1, 1]) {
  const sh = add(new THREE.DodecahedronGeometry(.17, 0), red, s * .2, .13, 0, iem); sh.scale.set(1, .8, .55); sh.rotation.set(.3, s * .4, s * .3);
  ico(iem, .09, M(0x7a0010, { emissive: 0x300004 }), s * .2, .15, .06).scale.set(1, .8, .4); cy(iem, .045, .04, .12, 6, 0xd9a441, s * .2, .13, -.17, { metalness: .6 }).rotation.x = Math.PI / 2; ico(iem, .06, 0xf1e8d8, s * .2, .13, -.27);
}
for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(.34 + k * .05, .014, 5, 22), M(0x7a3326, { roughness: .6 }), 0, .02 + k * .02, .25, iem).rotation.x = Math.PI / 2;
cy(iem, .035, .035, .22, 6, 0x15161a, .55, .03, .62).rotation.z = Math.PI / 2; cy(iem, .018, .018, .12, 6, 0xd9a441, .72, .03, .62, { metalness: .7 }).rotation.z = Math.PI / 2;

/* big red button: changes the theme */
const btn = grp(-2.3, 0, -1.05, { kind: 'btn', tip: '<b>Big red button</b><br>Changes the theme' }); cy(btn, .5, .55, .1, 14, 0x1c1d24, 0, .05, 0);
const cap = cy(btn, .38, .4, .16, 14, M(0xe3101e, { emissive: 0x7a0008, emissiveIntensity: .8 }), 0, .18, 0); let capT = 0;

/* toy car: drag it around the desk */
const car = grp(1.9, 0, 1.55, { kind: 'car', tip: '<b>Toy car</b><br>Drag me around' }), carT = new THREE.Vector3(1.9, 0, 1.55), wheels = [];
bx(car, .5, .14, .26, 0xff7a1a, 0, .13, 0, { roughness: .4 }); bx(car, .26, .12, .22, 0x9fd8ff, -.04, .26, 0, { roughness: .2 }); bx(car, .08, .04, .3, 0x1c1d24, -.22, .24, 0);
bx(car, .02, .04, .06, M(0xfff3c4, { emissive: 0xfff3c4, emissiveIntensity: 1.5 }), .26, .14, .08); bx(car, .02, .04, .06, M(0xfff3c4, { emissive: 0xfff3c4, emissiveIntensity: 1.5 }), .26, .14, -.08);
for (const [x, z] of [[.16, .15], [.16, -.15], [-.16, .15], [-.16, -.15]]) { const w = new THREE.Group(); w.position.set(x, .07, z); car.add(w); cy(w, .07, .07, .05, 8, 0x15161a, 0, 0, 0).rotation.x = Math.PI / 2; wheels.push(w); }

/* low-poly hands (palm, four fingers, thumb, sleeve) */
function mkHand(s) {
  const g = new THREE.Group(), sk = M(0xe3ab88), sk2 = M(0xcf9772), fs = [];
  bx(g, .34, .1, .36, sk, 0, 0, 0); bx(g, .24, .14, .8, 0x2b2f4a, 0, .01, .58);
  [[-.12, .2], [-.04, .24], [.04, .23], [.12, .18]].forEach(([x, l]) => { const f = new THREE.Group(); f.position.set(x, 0, -.18); g.add(f); bx(f, .065, .07, l * .55, sk2, 0, 0, -l * .275); const f2 = new THREE.Group(); f2.position.set(0, 0, -l * .55); f.add(f2); bx(f2, .058, .06, l * .45, sk, 0, 0, -l * .225); fs.push(f); });
  const th = new THREE.Group(); th.position.set(-s * .19, 0, -.1); th.rotation.y = s * .7; g.add(th); bx(th, .07, .07, .17, sk2, 0, 0, -.085); bx(th, .06, .06, .12, sk, 0, 0, -.23);
  g.userData.fs = fs; g.traverse(o => o.raycast = () => {}); g.scale.setScalar(1.15); g.visible = false; g.position.set(s * .9, -.8, 3.4); scene.add(g); return g;
}
const hands = [mkHand(-1), mkHand(1)]; let hMode = 'rest', lidWant = false, lidGo = false;
const edge = a => new THREE.Vector3(0, .125 - 2.1 * Math.sin(a), -.75 + LZ + 2.1 * Math.cos(a));
const handGoal = i => { const s = i ? 1 : -1; if (hMode === 'lid') return edge(S.la).add(new THREE.Vector3(s * .8, .12, .22)); if (hMode === 'type') return new THREE.Vector3(s * .55, .42, .3); return new THREE.Vector3(s * .9, -.8, 3.4); };

/* repository books (one per repo, each a different color) */
const books = [], ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), OPEN = new THREE.Vector3(-2.5, .0125, 1.05); let openB = null;
const inside = new THREE.Group(), cL = cvs(512, 400), cR = cvs(512, 400), cN = cvs(256, 208), pgM = c => new THREE.MeshBasicMaterial({ map: ctex(c) });
const pL = add(new THREE.PlaneGeometry(.9, .7), pgM(cL), -1, .1085, 0, inside), pR = add(new THREE.PlaneGeometry(.9, .7), pgM(cR), .02, .0845, 0, inside), nt = add(new THREE.PlaneGeometry(.44, .36), pgM(cN), .2, .0865, .17, inside);
[pL, pR, nt].forEach(p => { p.rotation.x = -Math.PI / 2; p.castShadow = false; }); nt.rotation.z = .12; nt.userData.kind = 'note'; inside.visible = false;
function shelf() {
  books.forEach(b => scene.remove(b)); books.length = 0; openB = null; inside.visible = false;
  S.list.slice(0, MAX).forEach((r, i) => {
    const hu = hsh(r.n) % 360, col = new THREE.Color().setHSL(hu / 360, .55, .42), k = i % 12, g = new THREE.Group();
    bx(g, 1, .025, .78, col, 0, 0, 0); bx(g, .94, .07, .72, 0xf1e8cf, .02, .0475, 0); bx(g, .03, .12, .78, col.clone().offsetHSL(0, 0, -.08), -.51, .0475, 0);
    const lb = bx(g, .94, .07, .72, 0xf1e8cf, -1, .0475, 0); lb.visible = false; const cp = new THREE.Group(); cp.position.set(-.5, .095, 0); g.add(cp); bx(cp, 1, .025, .78, col, .5, 0, 0);
    const c = cvs(256, 32), x = c.getContext('2d'); x.fillStyle = `hsl(${hu} 55% 30%)`; x.fillRect(0, 0, 256, 32); x.fillStyle = '#fff'; x.font = '700 20px "Pixelify Sans",monospace'; x.textBaseline = 'middle'; x.fillText(r.n.slice(0, 20), 8, 17);
    const sp = add(new THREE.PlaneGeometry(.74, .1), new THREE.MeshBasicMaterial({ map: ctex(c) }), -.527, .0475, 0, g); sp.rotation.y = -Math.PI / 2; sp.castShadow = false;
    g.userData = { kind: 'book', r, cp, lb, home: new THREE.Vector3(3.35 + (i < 12 ? 0 : 1), .0125 + k * .125, .2 + (Math.random() - .5) * .06), hr: Math.PI / 2 + (Math.random() - .5) * .08 };
    g.position.copy(g.userData.home); g.rotation.y = g.userData.hr; scene.add(g); books.push(g);
  });
}
function paintBook() {
  const r = S.sel; if (!r) return; const a = cL.getContext('2d'), b = cR.getContext('2d');
  [a, b].forEach(x => { x.fillStyle = '#f7f0dc'; x.fillRect(0, 0, 512, 400); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(x === a ? 500 : 0, 0, 12, 400); x.fillStyle = '#2a2620'; x.textBaseline = 'top'; });
  a.font = '700 34px "Pixelify Sans",monospace'; wrapT(a, r.n, 28, 28, 456, 38, 2); a.font = '500 20px "Space Mono",monospace'; a.fillText(r.l || 'No language', 28, 150); a.fillText(`${r.st} stars  ${r.f} forks`, 28, 184); a.fillText('Updated ' + ago(r.p), 28, 218);
  b.font = '500 21px "Space Mono",monospace'; wrapT(b, r.d || 'No description yet.', 28, 28, 456, 30, 10);
  const n = cN.getContext('2d'); n.fillStyle = '#' + new THREE.Color(THEMES[S.theme][1]).getHexString(); n.fillRect(0, 0, 256, 208); n.fillStyle = '#222'; n.textBaseline = 'top';
  if (r.h) { n.font = '700 20px "Pixelify Sans",monospace'; n.fillText('Website', 16, 14); n.font = '700 16px "Courier New",Courier,monospace'; wrapT(n, site$(r.h).replace(/^https?:\/\//, ''), 16, 56, 224, 22, 3); n.font = '500 15px "Pixelify Sans",monospace'; n.fillText('Click to open', 16, 170); }
  [pL, pR, nt].forEach(p => p.material.map.needsUpdate = true); nt.visible = !!r.h;
}

/* laptop screen: wallpaper, or a browser typing the website address */
function paintScr() {
  const w = 512, h = 320;
  if (S.scr === 'browser') { g.fillStyle = '#eef0f6'; g.fillRect(0, 0, w, h); g.fillStyle = '#d5d8e4'; g.fillRect(0, 0, w, 36); g.fillStyle = '#fff'; g.fillRect(14, 6, w - 28, 24); g.fillStyle = '#1b1d27'; g.font = '16px "Courier New",Courier,monospace'; g.textBaseline = 'middle'; g.fillText((S.typed || '') + (Math.floor(Date.now() / 450) % 2 ? '|' : ''), 22, 19); g.fillStyle = '#8a8fa3'; g.fillText('Loading…', w / 2 - 40, h / 2); }
  else {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#b84dff'); gr.addColorStop(.55, '#5f6cff'); gr.addColorStop(1, '#12c8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    [['rgba(255,255,255,.18)', [[170, 170], [290, 90], [420, 130], [350, 210]]], ['rgba(120,255,255,.2)', [[230, 200], [330, 150], [400, 190], [300, 245]]], ['rgba(255,255,255,.12)', [[120, 140], [200, 110], [250, 160], [160, 190]]]].forEach(([c, p]) => { g.fillStyle = c; g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.fill(); });
    g.fillStyle = '#e8e8ee'; g.fillRect(16, 14, 22, 22); g.fillStyle = '#ffd166'; g.fillRect(16, 58, 24, 18);
  }
  g.fillStyle = 'rgba(12,14,22,.92)'; g.fillRect(0, h - 22, w, 22); for (let i = 0; i < 9; i++) { g.fillStyle = ['#4cc2ff', '#e8e8ee', '#ffd166', '#a78bfa'][i % 4]; g.fillRect(w / 2 - 70 + i * 16, h - 16, 10, 10); }
  tex.needsUpdate = true;
}

/* themes: the big red button cycles them (room, desk, lamp light and sticky notes) */
let hue = 210;
function tint() {
  const [h, n] = THEMES[S.theme]; hue = h; R.style.setProperty('--h', h); const c = (o, s, l) => new THREE.Color().setHSL(((h + o) % 360 + 360) % 360 / 360, s, l, THREE.SRGBColorSpace);
  scene.background = c(0, .45, .06); scene.fog.color.copy(scene.background); wallMat.color.copy(c(10, .4, .3)); hemi.color.copy(c(0, .7, .6)); hemi.groundColor.copy(c(40, .5, .2)); moon.color.copy(c(20, .8, .7)); deskMat.color.copy(c(30, .45, .27));
  lampSpot.color.set(n); lampGlow.color.set(n); notes.forEach((m, i) => { m.material.color.set(n).offsetHSL(0, 0, (i % 3 - 1) * .04); m.material.emissive.copy(m.material.color).multiplyScalar(.28); }); paintBook();
}
const press = () => { capT = performance.now() + 220; S.theme = (S.theme + 1) % THEMES.length; ls.s('dinc-theme', S.theme); tint(); };

/* camera moves, laptop lid, typing, deployed site on the laptop screen */
const site = $('#site'), bar = $('#bar'); let goal = null, tmr = 0;
const go = v => { goal = { p: v.p.clone(), t: v.t.clone() }; };
function setOut() { const r = S.sel, u = r && site$(r.h); $('#out').href = S.view === 'screen' && u ? u : r ? r.u : 'https://github.com/' + U; $('#out').textContent = S.view === 'screen' && u ? 'Open site in new tab' : 'Open on GitHub'; }
function setView(v) { S.view = v; bar.hidden = v === 'home'; ctl.enabled = v !== 'screen'; setOut(); }
const hideSite = () => { site.hidden = true; if (site.src && site.src !== 'about:blank') site.src = 'about:blank'; };
function pick(r) { if (S.view === 'screen' || S.sel === r) return; const b = books.find(x => x.userData.r === r); if (!b) return; S.sel = r; openB = b; b.add(inside); paintBook(); setView('book'); go(BOOKV); }
function eject() { clearInterval(tmr); S.typed = ''; S.scr = 'desk'; hMode = 'rest'; S.pend = null; hideSite(); S.sel = null; openB = null; paintScr(); setView('home'); go(HOME); }
function openLid() { if (!S.lid && !lidWant) { lidWant = true; hMode = 'lid'; } }
function typeSite() { S.pend = S.sel; if (!S.lid) openLid(); else startType(); }
function zoomScr() { scr.updateWorldMatrix(true, false); const c = scr.localToWorld(new THREE.Vector3()), n = new THREE.Vector3(0, 0, 1).transformDirection(scr.matrixWorld), k = Math.tan(cam.fov * Math.PI / 360), d = Math.max(.93 / k, 1.48 / (k * cam.aspect)) * 1.04; goal = { p: c.clone().addScaledVector(n, d), t: c }; }
function startType() {
  const u = site$(S.pend.h); S.scr = 'browser'; S.typed = ''; hMode = 'type'; setView('screen'); zoomScr(); paintScr(); let i = 0; clearInterval(tmr);
  tmr = setInterval(() => { S.typed = u.slice(0, ++i); paintScr(); if (i >= u.length) { clearInterval(tmr); setTimeout(() => { if (S.view === 'screen') { site.src = u; site.hidden = false; place(); hMode = 'rest'; } }, 700); } }, 85);
}
function place() {
  cam.updateMatrixWorld(); scr.updateWorldMatrix(true, false); const P = (x, y) => { const v = scr.localToWorld(new THREE.Vector3(x, y, 0)).project(cam); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; };
  const a = P(-1.4, .875 - 1.75 * 36 / 320), b = P(1.4, -.875 + 1.75 * 22 / 320); Object.assign(site.style, { left: a[0] + 'px', top: a[1] + 'px', width: b[0] - a[0] + 'px', height: b[1] - a[1] + 'px' });
}

/* pointer: hover tooltips, clicks, car dragging */
const tip = $('#tip'), cvEl = renderer.domElement, plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pv = new THREE.Vector3(); let down = null, drag = false;
const vis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; }, own = o => { while (o) { if (o.userData.kind) return o; o = o.parent; } return null; };
const hit = e => { mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, cam); const h = ray.intersectObjects(scene.children, true).find(x => vis(x.object)); return h && own(h.object); };
cvEl.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; const o = hit(e); if (o && o.userData.kind === 'car') { drag = true; ctl.enabled = false; } });
cvEl.addEventListener('pointerup', e => {
  if (drag) { drag = false; ctl.enabled = S.view !== 'screen'; return; } if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const o = hit(e); if (!o) return; const k = o.userData.kind; if (k === 'book') pick(o.userData.r); else if (k === 'note') typeSite(); else if (k === 'laptop') openLid(); else if (k === 'btn') press();
});
cvEl.addEventListener('pointermove', e => {
  if (drag) { ray.setFromCamera(mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), cam); if (ray.ray.intersectPlane(plane, pv)) carT.set(Math.max(-4.3, Math.min(4.3, pv.x)), 0, Math.max(-1.4, Math.min(1.75, pv.z))); return; }
  if (S.view === 'screen') return; const o = hit(e), d = o && (o.userData.tip || (o.userData.r && `<b>${E(o.userData.r.n)}</b>${o.userData.r.h ? '<br>Has a live site' : ''}`)); cvEl.style.cursor = o ? 'pointer' : ''; tip.style.opacity = d ? 1 : 0; if (d) { tip.innerHTML = d; tip.style.transform = `translate(${Math.min(e.clientX + 14, innerWidth - 310)}px,${e.clientY + 14}px)`; }
});

/* GitHub data (ETag cached: 304 replies cost no rate limit) */
async function gh(path) {
  const k = 'dinc:' + path; let c = null; try { c = JSON.parse(ls.g(k)); } catch {}
  try { const r = await fetch(A + path, { headers: { Accept: 'application/vnd.github+json', ...(c && c.t ? { 'If-None-Match': c.t } : {}) } }); if (r.status === 304 && c) return c.d; if (!r.ok) throw 0; const d = await r.json(); ls.s(k, JSON.stringify({ t: r.headers.get('ETag'), d })); return d; }
  catch { if (c) { S.cached = true; return c.d; } throw 0; }
}
async function repos() { let all = []; for (let p = 1; p <= 3; p++) { const d = await gh(`/users/${U}/repos?per_page=100&sort=pushed&page=${p}`); all = all.concat(d); if (d.length < 100) break; } return all; }
const prog = (n, t) => { $('#fill').style.width = n + '%'; $('#boot-status').textContent = t; };
async function load() {
  S.cached = false; prog(20, `Calling github.com/${U}…`); const [u, r] = await Promise.allSettled([gh(`/users/${U}`), repos()]); prog(85, 'Stacking the books…');
  if (u.status === 'fulfilled') S.user = u.value; S.ok = r.status === 'fulfilled';
  if (S.ok) S.list = r.value.map(x => ({ n: x.name, d: x.description, l: x.language, st: x.stargazers_count, f: x.forks_count, p: +new Date(x.pushed_at || x.created_at), c: +new Date(x.created_at), u: x.html_url, h: x.homepage })).sort((a, b) => b.p - a.p);
  S.sel = null; shelf();
  $('#items').innerHTML = S.list.slice(0, MAX).map((r, i) => `<li><button data-i="${i}" style="--lc:hsl(${hsh(r.n) % 360} 55% 50%)"><i></i>${E(r.n)}${r.h ? '<small>live</small>' : ''}</button></li>`).join('') || '<li>No public repositories found.</li>';
  $('#sync').textContent = S.ok ? (S.cached ? 'GitHub did not answer; showing the copy saved on your last visit.' : `Synced with github.com/${U}. Refresh to pick up new repositories.${S.list.length > MAX ? ` The desk shows the ${MAX} most recent of ${S.list.length}.` : ''}`) : 'GitHub did not answer. Check your connection and press R.';
  prog(100, 'Ready'); setTimeout(() => $('#loader').classList.add('done'), 350);
}
async function refresh() { const b = $('#b-refresh'); b.disabled = true; b.textContent = 'Syncing…'; eject(); await load(); b.disabled = false; b.textContent = 'Refresh'; }

/* UI wiring */
$('#b-list').onclick = e => { const l = $('#list'); l.hidden = !l.hidden; e.currentTarget.setAttribute('aria-expanded', !l.hidden); };
$('#items').onclick = e => { const b = e.target.closest('button'); if (b) pick(S.list[+b.dataset.i]); };
$('#b-refresh').onclick = refresh; $('#back').onclick = eject;
addEventListener('keydown', e => { if (e.metaKey || e.ctrlKey || e.altKey) return; const k = e.key.toLowerCase(); if (k === 'escape') eject(); else if (k === 'r') refresh(); });
function size() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); cam.aspect = w / h; cam.fov = w / h < 1 ? 62 : 42; cam.updateProjectionMatrix(); }
addEventListener('resize', () => { size(); if (S.view === 'screen') zoomScr(); });

/* loop */
const clock = new THREE.Clock(), prev = new THREE.Vector3();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (goal) { cam.position.lerp(goal.p, .09); ctl.target.lerp(goal.t, .09); if (cam.position.distanceTo(goal.p) < .02) { cam.position.copy(goal.p); ctl.target.copy(goal.t); goal = null; } }
  ctl.update();
  /* lid opened by the two hands */
  if (lidWant && !S.lid) { if (!lidGo && hands[0].position.distanceTo(handGoal(0)) < .25) lidGo = true; if (lidGo) { S.la += (-1.85 - S.la) * .04; if (S.la < -1.84) { S.la = -1.85; S.lid = true; lidWant = lidGo = false; if (S.pend) startType(); else hMode = 'rest'; } } }
  lidP.rotation.x = S.la; glow.intensity = S.lid ? 2.5 + Math.sin(t * 3) * .2 : 0;
  hands.forEach((h, i) => { h.position.lerp(handGoal(i), .12); h.visible = hMode !== 'rest' || h.position.y > -.3; h.userData.fs.forEach((f, j) => f.rotation.x = hMode === 'type' ? -.2 - Math.abs(Math.sin(t * 13 + j * 1.9 + i * 2.3)) * .4 : -.15); });
  /* erratic strip lights */
  if (t > gT) { glitch = !glitch; gT = t + (glitch ? .05 + Math.random() * .15 : .6 + Math.random() * 2.5); }
  for (let i = 0; i < NS; i++) { if (t > sT[i]) { sOn[i] = !sOn[i]; sT[i] = t + .03 + Math.random() * .45; } strip.setColorAt(i, glitch || !sOn[i] ? cOff : cOn); } strip.instanceColor.needsUpdate = true;
  /* RGB mouse, big button, books, toy car */
  rgbM.color.setHSL((t * .25) % 1, 1, .5); mLight.color.copy(rgbM.color);
  cap.position.y += ((performance.now() < capT ? .12 : .18) - cap.position.y) * .3;
  books.forEach(b => { const op = b === openB, u = b.userData; b.position.lerp(op ? OPEN : u.home, .12); b.rotation.y += ((op ? 0 : u.hr) - b.rotation.y) * .12; u.cp.rotation.z += ((op ? -3.1 : 0) - u.cp.rotation.z) * .12; u.lb.visible = u.cp.rotation.z < -.4; if (op) inside.visible = u.cp.rotation.z < -2.6; });
  if (!openB) inside.visible = false;
  prev.copy(car.position); car.position.lerp(carT, .3); const dx = car.position.x - prev.x, dz = car.position.z - prev.z, mv = Math.hypot(dx, dz);
  if (mv > .004) { let da = Math.atan2(-dz, dx) - car.rotation.y; da = ((da + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; car.rotation.y += da * .25; wheels.forEach(w => w.rotation.z -= mv / .07); }
  if (S.view === 'screen' && !site.hidden) place();
  renderer.render(scene, cam);
});
size(); tint(); paintScr();
(document.fonts ? Promise.all([document.fonts.load('700 16px "Pixelify Sans"'), document.fonts.load('15px "Space Mono"')]).catch(() => 0) : Promise.resolve()).then(() => { paintScr(); paintBook(); load(); });
