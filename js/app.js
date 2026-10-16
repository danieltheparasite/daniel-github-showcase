/* Daniel Inc. · low-poly 3D desk (three.js). Change U to use another GitHub account.
   Repos load live from the GitHub API on every page load. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const U = 'danieltheparasite', A = 'https://api.github.com', MAX = 24, R = document.documentElement;
const $ = s => document.querySelector(s), E = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const ls = { g: k => { try { return localStorage.getItem(k); } catch { return null; } }, s: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const S = { fileOpen: false, act: null, ev: [], sig: '', dirty: false, user: null, list: [], sel: null, cached: false, ok: false, view: 'home', lid: false, la: 0, scr: 'desk', typed: '', pend: null, theme: (+ls.g('dinc-theme') || 0) % 5 };
const THEMES = [[210, 0xffe14d], [335, 0xff8ad0], [150, 0x7dffb0], [28, 0xffa94d], [265, 0xb8aaff]]; // [hue, sticky-note color]
const hsh = s => Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
const LC = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', HTML: '#e34c26', CSS: '#9b5cf0', Java: '#b07219', C: '#8a8a8a', 'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584', Shell: '#89e051', 'Jupyter Notebook': '#da5b0b' };
const raw = l => !l ? '#8b93a7' : LC[l] || `hsl(${hsh(l) % 360} 65% 62%)`;
const ago = t => { const s = (Date.now() - t) / 1e3; for (const [n, w] of [[31536e3, 'year'], [2592e3, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']]) if (s >= n) { const v = Math.floor(s / n); return v + ' ' + w + (v > 1 ? 's' : '') + ' ago'; } return 'just now'; };
const site$ = u => u && (/^https?:/.test(u) ? u : 'https://' + u);
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ctex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const wrapT = (x, t, px, py, w, lh, max) => { let l = '', n = 0; for (const s of String(t).split(/\s+/)) { const tt = l ? l + ' ' + s : s; if (x.measureText(tt).width > w && l) { x.fillText(l, px, py); py += lh; l = s; if (++n >= max) return py; } else l = tt; } x.fillText(l, px, py); return py + lh; };

/* renderer, camera, controls */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
$('#stage').append(renderer.domElement);
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0, 12, 30); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; document.querySelector('.fallback')?.remove();
const cam = new THREE.PerspectiveCamera(42, 1, .1, 60);
const HOME = { p: new THREE.Vector3(0, 3, 6.6), t: new THREE.Vector3(0, 1.2, 0) }, BOOKV = { p: new THREE.Vector3(-2.2, 2.2, 3.7), t: new THREE.Vector3(-2.7, .1, 1.1) };
cam.position.copy(HOME.p);
const ctl = new OrbitControls(cam, renderer.domElement);
Object.assign(ctl, { enableDamping: true, minDistance: 2, maxDistance: 8.5, minPolarAngle: .25, maxPolarAngle: 1.4, minAzimuthAngle: -1, maxAzimuthAngle: 1, enablePan: false }); ctl.target.copy(HOME.t);

/* low-poly helpers */
const M = (c, o) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .85, envMapIntensity: .25, ...o });
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
bx(scene, 4, 8, .2, wallMat, -5, 1.4, -1.8); bx(scene, 4, 8, .2, wallMat, 5, 1.4, -1.8); bx(scene, 6, 3.7, .2, wallMat, 0, -.75, -1.8); bx(scene, 6, 1.8, .2, wallMat, 0, 4.5, -1.8);
bx(scene, 6.8, .14, .5, woodMat, 0, 1.12, -1.6); bx(scene, .1, 2.5, .1, woodMat, 0, 2.35, -1.82); bx(scene, 6, .1, .1, woodMat, 0, 2.35, -1.82);
for (let i = 0; i < 6; i++) bx(scene, 6.4, .07, .2, i % 2 ? 0x8a5a3a : 0x6b3f2a, 0, 3.55 - i * .09, -1.6);
[[14.4, .2, 14, 0x2a2622, 0, -2.7, 5.2], [14.4, .2, 14, wallMat, 0, 5.5, 5.2], [.2, 8, 14, wallMat, -7.1, 1.4, 5.2], [.2, 8, 14, wallMat, 7.1, 1.4, 5.2]].forEach(a => { bx(scene, ...a).castShadow = false; });
bx(scene, 9.6, .16, 3.7, deskMat, 0, -.08, .15); for (const x of [-4.5, 4.5]) for (const z of [-1.55, 1.85]) bx(scene, .3, 2.44, .3, 0x2a2d38, x, -1.38, z);
const WN = 2600, win = new THREE.InstancedMesh(new THREE.BoxGeometry(.055, .075, .02), new THREE.MeshBasicMaterial({ toneMapped: false }), WN), mtx = new THREE.Matrix4(), col = new THREE.Color(), WP = [0xffc46b, 0xffd9a0, 0xff9f43, 0x9fe7ff, 0xfff3c4], wOn = [], blink = []; let wi = 0;
for (let l = 0; l < 3; l++) for (let x = -11; x < 11;) {
  const w = .5 + Math.random() * .9, h = 2.4 + l + Math.random() * 2.6, z = -4.2 - l * 2.4 - Math.random() * .6, y0 = -1.4, hu = .55 + Math.random() * .12;
  bx(scene, w, h, w, M(new THREE.Color().setHSL(hu, .3, .07 + l * .025), { roughness: .9 }), x + w / 2, y0 + h / 2, z);
  if (Math.random() < .55) bx(scene, w * .6, .35 + Math.random() * .5, w * .6, M(new THREE.Color().setHSL(hu, .3, .09 + l * .025)), x + w / 2, y0 + h + .2, z);
  if (Math.random() < .4) { cy(scene, .012, .012, .8, 4, 0x333333, x + w / 2, y0 + h + .6, z); blink.push(bx(scene, .05, .05, .05, M(0xff2a2a, { emissive: 0xff2a2a, emissiveIntensity: 2 }), x + w / 2, y0 + h + 1, z)); }
  for (let r = 0; r < h / .2; r++) for (let c = 0; c < w / .13; c++) if (wi < WN && Math.random() < .5) { mtx.setPosition(x + .08 + c * .13, y0 + .15 + r * .2, z + w / 2 + .012); win.setMatrixAt(wi, mtx); win.setColorAt(wi, col.set(WP[(Math.random() * 5) | 0])); wOn[wi++] = 1; }
  x += w + .05 + Math.random() * .12;
}
win.count = wi; scene.add(win);
add(new THREE.CylinderGeometry(.28, .5, 6, 4), M(0x1a2230, { emissive: 0x6a5a8a, emissiveIntensity: .4 }), 2.6, 1.6, -7.2).rotation.y = Math.PI / 4; cy(scene, .02, .05, 1.3, 4, M(0xdddddd, { emissive: 0xffffff, emissiveIntensity: .6 }), 2.6, 5.2, -7.2);
const hc = cvs(4, 128), hg = hc.getContext('2d'), hgr = hg.createLinearGradient(0, 0, 0, 128); hgr.addColorStop(0, 'rgba(255,140,60,0)'); hgr.addColorStop(1, 'rgba(255,140,60,.55)'); hg.fillStyle = hgr; hg.fillRect(0, 0, 4, 128);
const haze = new THREE.Mesh(new THREE.PlaneGeometry(26, 7), new THREE.MeshBasicMaterial({ map: ctex(hc), transparent: true, depthWrite: false, fog: false })); haze.position.set(0, .9, -10); scene.add(haze);


/* wall-mounted pipe lamp, its bulb buried under sticky notes */
const pipe = M(0x2a2b30, { metalness: .7, roughness: .4 }), lamp = new THREE.Group(); scene.add(lamp);
cy(lamp, .28, .28, .06, 10, pipe, -3.8, 3.2, -1.67).rotation.x = Math.PI / 2; cy(lamp, .07, .07, 1.05, 6, pipe, -3.8, 3.2, -1.17).rotation.x = Math.PI / 2;
ico(lamp, .11, pipe, -3.8, 3.2, -.65); cy(lamp, .07, .07, .6, 6, pipe, -3.8, 2.9, -.65); cy(lamp, .12, .12, .2, 8, pipe, -3.8, 2.5, -.65);
const bulbM = M(0xffe9a0, { emissive: 0xffc861, emissiveIntensity: .6 }); ico(lamp, .22, bulbM, -3.8, 2.25, -.65, null, 1);
const notes = [], bc = new THREE.Vector3(-3.8, 2.25, -.65);
for (let i = 0; i < 13; i++) {
  const m = add(new THREE.PlaneGeometry(.3, .3), M(0xffe14d, { side: THREE.DoubleSide }), 0, 0, 0, lamp);
  if (i < 9) { const d = new THREE.Vector3(Math.random() - .5, Math.random() * -.9 - .1, Math.random() - .3).normalize(); m.position.copy(bc).addScaledVector(d, .26); m.lookAt(m.position.clone().add(d)); }
  else { m.position.set(-3.8, 3.15 - (i - 9) * .22, -.65 + (i % 2 ? .08 : -.08)); m.rotation.y = i % 2 ? 1.2 : -1.2; }
  m.rotateZ(Math.random() * 1.5); notes.push(m);
}

lamp.userData = { kind: 'lamp', tip: '<b>Lamp</b><br>Click to dim it, then switch it off' };

/* ASUS ROG Zephyrus: closed black metal lid with erratic strip lights, glowing keys */
const MET = { metalness: .9, roughness: .28, envMapIntensity: 1.3 };
const LZ = .15, lap = grp(0, 0, LZ, { kind: 'laptop', tip: `<b>Daniel's ASUS ROG Zephyrus</b><br>AMD Ryzen AI 9 HX 370 (2.00 GHz)<br>32 GB RAM · 1.86 TB storage<br>NVIDIA RTX 5070 Ti Laptop GPU, 12 GB` });
bx(lap, 3, .12, 2.1, 0x2b2e36, 0, .06, .3, MET); cy(lap, .06, .06, 2.6, 6, 0x15161a, 0, .15, -.75, MET).rotation.z = Math.PI / 2;
bx(lap, .28, .01, .9, 0x15161a, -1.3, .122, -.05); bx(lap, .28, .01, .9, 0x15161a, 1.3, .122, -.05); bx(lap, 1.3, .006, .7, 0x3a3e49, 0, .123, .82, MET);
const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(.13, .05, .13), M(0xffffff, { roughness: .5 }), 70), kg = new THREE.InstancedMesh(new THREE.BoxGeometry(.155, .008, .155), new THREE.MeshBasicMaterial({ toneMapped: false }), 70);
for (let r = 0, n = 0; r < 5; r++) for (let k = 0; k < 14; k++, n++) { mtx.setPosition(-1.07 + k * .165, .145, -.5 + r * .15); keys.setMatrixAt(n, mtx); keys.setColorAt(n, col.set(0x20232b)); mtx.setPosition(-1.07 + k * .165, .131, -.5 + r * .15); kg.setMatrixAt(n, mtx); kg.setColorAt(n, col.set(0xeaf2ff)); }
keys.castShadow = true; lap.add(keys, kg);
const lidP = new THREE.Group(); lidP.position.set(0, .185, -.75); lap.add(lidP);
bx(lidP, 3, .06, 2.1, 0x1b1d22, 0, .03, 1.05, MET); bx(lidP, .55, .01, .14, 0x70737e, -.95, .062, 1.88, { metalness: .9, roughness: .3 });
const cv = cvs(1024, 640), g = cv.getContext('2d'), tex = ctex(cv);
const scr = add(new THREE.PlaneGeometry(2.8, 1.75), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, -.002, 1.05, lidP); scr.rotation.x = Math.PI / 2; scr.castShadow = false;
const NS = 64, strip = new THREE.InstancedMesh(new THREE.BoxGeometry(.034, .012, .026), new THREE.MeshBasicMaterial({ toneMapped: false }), NS), sOn = [], sT = [], cOn = new THREE.Color(0xbfe9ff), cOff = new THREE.Color(0x07080b);
for (let i = 0; i < NS; i++) { const f = i / (NS - 1); mtx.makeRotationY(-Math.atan2(1.4, 2.3)); mtx.setPosition(-1.15 + f * 2.3, .066, .35 + f * 1.4); strip.setMatrixAt(i, mtx); sOn[i] = Math.random() > .5; sT[i] = Math.random(); }
lidP.add(strip); let glitch = false, gT = 1;

/* RGB mouse (Kreo Hawk): faceted shell, split buttons, wheel, RGB glow */
const rgbM = new THREE.MeshBasicMaterial({ toneMapped: false }), mo = grp(1.95, 0, .65, { kind: 'mouse', tip: "<b>Daniel's Kreo Hawk Gaming Mouse</b>" }); mo.rotation.y = .25;
add(new THREE.SphereGeometry(.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x16171c, { metalness: .5, roughness: .3, envMapIntensity: 1 }), 0, .012, 0, mo).scale.set(.3, .2, .56);
bx(mo, .006, .004, .2, 0x050506, 0, .112, -.1); cy(mo, .03, .03, .04, 8, rgbM, 0, .104, -.17).rotation.z = Math.PI / 2; bx(mo, .07, .004, .03, rgbM, 0, .11, .12);
bx(mo, .004, .01, .3, rgbM, -.143, .05, .02); bx(mo, .004, .01, .3, rgbM, .143, .05, .02); add(new THREE.CylinderGeometry(.5, .5, .012, 14), rgbM, 0, .006, 0, mo).scale.set(.34, 1, .6);
const mLight = new THREE.PointLight(0xffffff, 1.4, 2, 2); mLight.position.set(1.95, .25, .65); scene.add(mLight);

/* big red button: changes the theme */
const btn = grp(-2.3, 0, -1.05, { kind: 'btn', tip: '<b>Big red button</b><br>Changes the theme' }); cy(btn, .5, .55, .1, 14, 0x1c1d24, 0, .05, 0);
const cap = cy(btn, .38, .4, .16, 14, M(0xe3101e, { emissive: 0x7a0008, emissiveIntensity: .8 }), 0, .18, 0); let capT = 0;

/* toy car: sleek teal coupe with underglow, drag it around the desk */
const car = grp(1.9, 0, 1.55, { kind: 'car', tip: '<b>Toy car</b><br>Drag me around' }), carT = new THREE.Vector3(1.9, 0, 1.55), wheels = [];
const paint = M(0x14c8b4, { metalness: .6, roughness: .22, envMapIntensity: 1 }), glass = M(0x0b1622, { metalness: .7, roughness: .08, envMapIntensity: 1.4 }), blk = M(0x15161a, { roughness: .5 });
const shp = a => new THREE.Shape(a.map(([x, y]) => new THREE.Vector2(x, y))), ext = (a, d) => { const e = new THREE.ExtrudeGeometry(shp(a), { depth: d, bevelEnabled: false }); e.translate(0, 0, -d / 2); return e; };
add(ext([[-.21, 0], [.21, 0], [.21, .03], [.15, .05], [.04, .056], [-.1, .058], [-.2, .052], [-.21, .04]], .2), paint, 0, .035, 0, car); add(ext([[-.15, 0], [-.085, .05], [.03, .052], [.115, 0]], .17), glass, -.02, .09, 0, car);
bx(car, .014, .048, .176, paint, -.02, .114, 0); bx(car, .115, .006, .176, paint, -.027, .143, 0); bx(car, .04, .008, .2, blk, .215, .04, 0);
bx(car, .025, .006, .19, blk, -.19, .118, 0); bx(car, .008, .03, .008, blk, -.19, .1, .07); bx(car, .008, .03, .008, blk, -.19, .1, -.07);
const lt = new THREE.MeshBasicMaterial({ color: 0xfff3c4, toneMapped: false }), tl2 = new THREE.MeshBasicMaterial({ color: 0xff2a38, toneMapped: false }), ug = new THREE.MeshBasicMaterial({ color: 0x14ffe0, toneMapped: false });
bx(car, .008, .016, .055, lt, .212, .066, .065); bx(car, .008, .016, .055, lt, .212, .066, -.065); bx(car, .008, .014, .17, tl2, -.212, .062, 0); bx(car, .34, .008, .17, ug, 0, .03, 0);
const carGlow = new THREE.PointLight(0x14e8d0, 1.6, 1.8, 2); scene.add(carGlow);
for (const [x, z] of [[.13, .105], [.13, -.105], [-.13, .105], [-.13, -.105]]) { const w = new THREE.Group(); w.position.set(x, .045, z); car.add(w); cy(w, .045, .045, .03, 10, blk, 0, 0, 0).rotation.x = Math.PI / 2; cy(w, .026, .026, .034, 6, M(0xc9ced8, { metalness: .8, roughness: .3 }), 0, 0, 0).rotation.x = Math.PI / 2; wheels.push(w); }

const OB = [[-1.75, 1.75, -1.3, 1.6], [1.6, 2.3, .3, 1], [-2.85, -1.75, -1.6, -.5], [-4.35, -2.75, -.7, .6], [2.9, 4.8, -.35, .75]]; // laptop, mouse, red button, file, book stacks
function avoid(v) { const r = .24; for (const [x0, x1, z0, z1] of openB ? OB.concat([[-4.05, -1.95, .7, 1.6]]) : OB) if (v.x > x0 - r && v.x < x1 + r && v.z > z0 - r && v.z < z1 + r) { const d = [v.x - x0 + r, x1 + r - v.x, v.z - z0 + r, z1 + r - v.z], k = d.indexOf(Math.min(...d)); if (k === 0) v.x = x0 - r; else if (k === 1) v.x = x1 + r; else if (k === 2) v.z = z0 - r; else v.z = z1 + r; } return v; }
/* confidential dossier: pixel-art file with the live GitHub overview */
const fcv = cvs(768, 560), fg = fcv.getContext('2d'), sc = cvs(256, 187), P = sc.getContext('2d'), ftex = ctex(fcv), pic = new Image(); ftex.magFilter = THREE.NearestFilter; pic.src = 'assets/profile.png'; const wp = new Image(); wp.src = 'assets/wallpaper.png'; wp.onload = () => paintScr(); pic.onload = () => { paintScr(); paintFile(); };
const file = grp(-3.55, 0, -.05, { kind: 'file', tip: '<b>Top secret</b><br>Click to open the profile dossier' }); file.rotation.y = .12;
bx(file, 1.5, .03, 1.1, 0xc9a15f, 0, .015, 0, { roughness: .9 }); add(new THREE.PlaneGeometry(1.46, 1.06), new THREE.MeshBasicMaterial({ map: ftex, toneMapped: false }), 0, .0335, 0, file).rotation.x = -Math.PI / 2;
function paintFile() {
  const W = 256, H = 187, u = S.user || {}, h2 = (hue + 150) % 360, ok = pic.complete && pic.naturalWidth; P.imageSmoothingEnabled = false; P.textAlign = 'left'; P.textBaseline = 'top';
  if (!S.fileOpen) {
    P.fillStyle = '#d9b36e'; P.fillRect(0, 0, W, H); P.fillStyle = 'rgba(90,55,10,.14)'; for (let i = 0; i < 160; i++) P.fillRect((i * 97) % W, (i * 53) % H, 1, 1); P.fillStyle = 'rgba(0,0,0,.1)'; P.fillRect(0, 0, W, 3); P.fillRect(0, H - 3, W, 3); P.fillRect(0, 0, 3, H); P.fillRect(W - 3, 0, 3, H);
    P.save(); P.translate(88, 96); P.rotate(-.14); P.strokeStyle = '#c0262d'; P.lineWidth = 3; P.strokeRect(-60, -15, 120, 30); P.fillStyle = '#c0262d'; P.font = '700 19px "Pixelify Sans",monospace'; P.textAlign = 'center'; P.textBaseline = 'middle'; P.fillText('TOP SECRET', 0, 1); P.restore(); P.textAlign = 'left'; P.textBaseline = 'top';
    P.fillStyle = '#f4f1ea'; P.fillRect(150, 12, 86, 100); P.fillStyle = '#111'; P.fillRect(156, 18, 74, 74); if (ok) P.drawImage(pic, 156, 18, 74, 74); P.fillStyle = '#8a8d96'; P.fillRect(184, 6, 18, 12); P.fillStyle = '#333'; P.font = '500 7px "Space Mono",monospace'; P.fillText('@' + U, 157, 98);
    P.fillStyle = '#5a3a12'; P.font = '500 9px "Space Mono",monospace'; P.fillText('DANIEL INC. / CONFIDENTIAL', 10, 168);
  } else {
    P.fillStyle = '#efe6cf'; P.fillRect(0, 0, W, H); P.fillStyle = '#2a2620'; P.fillRect(0, 0, W, 16); P.fillStyle = '#ffd166'; P.font = '700 11px "Pixelify Sans",monospace'; P.fillText('PROFILE DOSSIER · CONFIDENTIAL', 6, 2);
    P.fillStyle = Math.floor(Date.now() / 500) % 2 ? '#3dff7a' : '#1c6b38'; P.fillRect(214, 5, 6, 6); P.fillStyle = '#fff'; P.font = '700 9px "Pixelify Sans",monospace'; P.fillText('LIVE', 224, 3);
    P.fillStyle = '#111'; P.fillRect(7, 21, 38, 38); if (ok) P.drawImage(pic, 9, 23, 34, 34);
    P.fillStyle = '#2a2620'; P.font = '700 13px "Pixelify Sans",monospace'; P.fillText((u.name || U).slice(0, 24), 52, 22); P.font = '500 8px "Space Mono",monospace'; P.fillStyle = '#6b6350'; P.fillText('@' + U, 52, 37); P.fillStyle = '#2a2620'; wrapT(P, u.bio || 'Projects by Daniel Inc.', 52, 47, 198, 10, 2);
    const stars = S.list.reduce((a, r) => a + r.st, 0), forks = S.list.reduce((a, r) => a + r.f, 0);
    [[S.list.length, 'repos'], [stars, 'stars'], [forks, 'forks'], [u.followers || 0, 'followers'], [u.following || 0, 'following']].forEach(([n, l], i) => { const x = 7 + i * 49; P.fillStyle = '#2a2620'; P.fillRect(x, 66, 45, 24); P.fillStyle = `hsl(${h2} 80% 62%)`; P.font = '700 12px "Pixelify Sans",monospace'; P.fillText(n, x + 4, 67); P.fillStyle = '#d9d2bd'; P.font = '500 7px "Space Mono",monospace'; P.fillText(l, x + 4, 81); });
    const a = S.act || { days: [], weeks: [], total: 0 }, mx = Math.max(1, ...a.days), wm = Math.max(1, ...a.weeks); P.fillStyle = '#6b6350'; P.font = '500 7px "Space Mono",monospace'; P.fillText(`90 DAYS · ${a.total} COMMITS`, 7, 94); P.fillText('PER WEEK', 138, 94);
    for (let i = 0; i < 91; i++) { const n = a.days[i] || 0, lv = n ? 1 + Math.min(3, Math.floor(n / (mx / 3.01))) : 0; P.fillStyle = lv ? `hsl(${h2} 75% ${72 - lv * 12}%)` : '#d8cfb4'; P.fillRect(7 + ((i / 7) | 0) * 8, 104 + (i % 7) * 7, 7, 6); }
    a.weeks.forEach((n, c) => { const h = Math.round(n / wm * 46); P.fillStyle = `hsl(${h2} 75% 55%)`; P.fillRect(138 + c * 9, 152 - h, 7, Math.max(1, h)); }); P.fillStyle = '#2a2620'; P.fillRect(138, 153, 117, 1);
    const lc = {}; S.list.forEach(r => { const k = r.l || 'Other'; lc[k] = (lc[k] || 0) + 1; }); const en = Object.entries(lc).sort((x, y) => y[1] - x[1]).slice(0, 6), tot = S.list.length || 1; let lx = 7;
    en.forEach(([k, n]) => { const w = Math.max(2, Math.round(n / tot * 242)); P.fillStyle = raw(k); P.fillRect(lx, 160, w, 6); lx += w; });
    en.slice(0, 4).forEach(([k, n], i) => { P.fillStyle = raw(k); P.fillRect(7 + i * 62, 171, 5, 5); P.fillStyle = '#2a2620'; P.font = '500 7px "Space Mono",monospace'; P.fillText(`${k.slice(0, 8)} ${Math.round(n / tot * 100)}%`, 15 + i * 62, 170); });
    P.fillStyle = '#6b6350'; P.fillText(`Synced ${S.t ? S.t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'} · rechecks GitHub every minute`, 7, 180);
  }
  fg.imageSmoothingEnabled = false; fg.drawImage(sc, 0, 0, 768, 560); ftex.needsUpdate = true;
}

/* low-poly hands (palm, four fingers, thumb, sleeve) */
function mkHand(s) {
  const g = new THREE.Group(), sk = M(0xe3ab88), sk2 = M(0xcf9772), fs = [];
  bx(g, .34, .1, .36, sk, 0, 0, 0); bx(g, .24, .14, .8, 0x2b2f4a, 0, .01, .58);
  [[-.12, .2], [-.04, .24], [.04, .23], [.12, .18]].forEach(([x, l]) => { const f = new THREE.Group(); f.position.set(x, 0, -.18); g.add(f); bx(f, .065, .07, l * .55, sk2, 0, 0, -l * .275); const f2 = new THREE.Group(); f2.position.set(0, 0, -l * .55); f.add(f2); bx(f2, .058, .06, l * .45, sk, 0, 0, -l * .225); fs.push(f); });
  const th = new THREE.Group(); th.position.set(-s * .19, 0, -.1); th.rotation.y = s * .7; g.add(th); bx(th, .07, .07, .17, sk2, 0, 0, -.085); bx(th, .06, .06, .12, sk, 0, 0, -.23);
  g.userData.fs = fs; g.traverse(o => o.raycast = () => {}); g.scale.setScalar(1.15); g.visible = false; g.position.set(s * .9, -.8, 3.4); scene.add(g); return g;
}
const hands = [mkHand(-1), mkHand(1)]; let hMode = 'rest', lidWant = false, lidGo = false;
const edge = a => new THREE.Vector3(0, .185 - 2.1 * Math.sin(a), -.75 + LZ + 2.1 * Math.cos(a));
const handGoal = i => { const s = i ? 1 : -1; if (hMode === 'lid') return edge(S.la).add(new THREE.Vector3(s * .8, .12, .22)); if (hMode === 'type') return new THREE.Vector3(s * .55, .42, .3); return new THREE.Vector3(s * .9, -.8, 3.4); };

/* repository books (one per repo, each a different color) */
const books = [], ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), OPEN = new THREE.Vector3(-2.5, .0125, 1.15); let openB = null;
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

/* laptop screen: pixel-art wallpaper of Daniel, or a browser typing the website address */
function fit(x, t, maxW, size) { let s = size; x.font = `${s}px "Courier New",Courier,monospace`; while (x.measureText(t).width > maxW && s > 11) { s--; x.font = `${s}px "Courier New",Courier,monospace`; } if (x.measureText(t).width > maxW) { let n = t.length; while (n > 4 && x.measureText('…' + t.slice(-n)).width > maxW) n--; t = '…' + t.slice(-n); } return t; }
function paintScr() {
  const w = 1024, h = 640; g.textBaseline = 'middle';
  if (S.scr === 'browser') {
    g.fillStyle = '#e9ebf3'; g.fillRect(0, 0, w, h); g.fillStyle = '#cfd3e2'; g.fillRect(0, 0, w, 34); g.fillStyle = '#f7f8fc'; g.fillRect(12, 6, 240, 28); g.fillStyle = `hsl(${hue + 150} 80% 55%)`; g.fillRect(22, 14, 12, 12);
    g.fillStyle = '#2a2d3a'; g.font = '14px sans-serif'; g.fillText(((S.typed || '').replace(/^https?:\/\//, '').split('/')[0] || 'New tab').slice(0, 24), 42, 21);
    g.fillStyle = '#f7f8fc'; g.fillRect(0, 34, w, 42); g.fillStyle = '#6b7088'; g.font = '22px sans-serif'; g.fillText('‹   ›   ⟳', 18, 56); g.fillStyle = '#fff'; g.fillRect(120, 40, w - 160, 30); g.strokeStyle = '#c4c9da'; g.lineWidth = 2; g.strokeRect(120, 40, w - 160, 30);
    g.fillStyle = '#4a9d5b'; g.fillRect(132, 50, 9, 9); g.fillStyle = '#1b1d27'; g.fillText(fit(g, (S.typed || '') + (Math.floor(Date.now() / 450) % 2 ? '|' : ' '), w - 160 - 52, 17), 152, 56);
    g.fillStyle = '#8a8fa3'; g.font = '20px sans-serif'; g.fillText('Loading…', w / 2 - 40, h / 2);
  } else {
    if (wp.complete && wp.naturalWidth) { g.imageSmoothingEnabled = false; g.drawImage(wp, 0, 0, w, h); g.imageSmoothingEnabled = true; } else { g.fillStyle = '#3a2a4a'; g.fillRect(0, 0, w, h); }
    [['Recycle Bin', 18, '#e8e8ee'], ['Docs', 100, '#ffd166']].forEach(([n, y, c]) => { g.fillStyle = c; g.fillRect(24, y, 34, 34); g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.shadowColor = '#000'; g.shadowBlur = 4; g.fillText(n, 20, y + 46); g.shadowBlur = 0; });
  }
  g.fillStyle = 'rgba(14,16,26,.93)'; g.fillRect(0, h - 40, w, 40);
  for (let i = 0; i < 8; i++) { g.fillStyle = ['#4cc2ff', '#e8e8ee', '#ffd166', '#a78bfa', '#ff7a7a', '#7dffb0', '#ffa94d', '#9fd8ff'][i]; g.fillRect(w / 2 - 100 + i * 26, h - 30, 20, 20); }
  g.fillStyle = '#e8e8ee'; g.font = '15px sans-serif'; g.fillText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), w - 78, h - 20); tex.needsUpdate = true;
}

/* themes: the big red button cycles them (room, desk, lamp light and sticky notes) */
const LV = [1, .4, 0]; let lv = 0, hue = 210;
function lights() { const v = LV[lv]; lampSpot.intensity = 26 * v; lampGlow.intensity = 3 * v; bulbM.emissiveIntensity = .6 * v; hemi.intensity = .5 * (.2 + .8 * v); key.intensity = .5 * (.2 + .8 * v); moon.intensity = .8 * (.35 + .65 * v); notes.forEach(m => m.material.emissive.copy(m.material.color).multiplyScalar(.28 * v)); }
const dimLights = () => { lv = (lv + 1) % 3; lights(); };
function tint() {
  const [h, n] = THEMES[S.theme]; hue = h; R.style.setProperty('--h', h); const c = (o, s, l) => new THREE.Color().setHSL(((h + o) % 360 + 360) % 360 / 360, s, l, THREE.SRGBColorSpace);
  scene.background = c(0, .45, .06); scene.fog.color.copy(scene.background); wallMat.color.copy(c(10, .4, .3)); hemi.color.copy(c(0, .7, .6)); hemi.groundColor.copy(c(40, .5, .2)); moon.color.copy(c(20, .8, .7)); deskMat.color.copy(c(30, .45, .27));
  lampSpot.color.set(n); lampGlow.color.set(n); notes.forEach((m, i) => { m.material.color.set(n).offsetHSL(0, 0, (i % 3 - 1) * .04); m.material.emissive.copy(m.material.color).multiplyScalar(.28 * LV[lv]); }); paintBook(); paintFile();
}
const press = () => { capT = performance.now() + 220; S.theme = (S.theme + 1) % THEMES.length; ls.s('dinc-theme', S.theme); tint(); };

/* camera moves, laptop lid, typing, deployed site on the laptop screen */
const site = $('#site'), bar = $('#bar'); let goal = null, tmr = 0;
const go = v => { goal = { p: v.p.clone(), t: v.t.clone() }; };
function setOut() { const r = S.sel, u = r && site$(r.h); $('#out').href = S.view === 'screen' && u ? u : r ? r.u : 'https://github.com/' + U; $('#out').textContent = S.view === 'screen' && u ? 'Open site in new tab' : 'Open on GitHub'; }
function setView(v) { S.view = v; bar.hidden = v === 'home'; ctl.enabled = v !== 'screen'; setOut(); }
const hideSite = () => { site.hidden = true; if (site.src && site.src !== 'about:blank') site.src = 'about:blank'; };
function pick(r) { if (S.view === 'screen' || S.sel === r) return; const b = books.find(x => x.userData.r === r); if (!b) return; S.sel = r; openB = b; b.add(inside); paintBook(); setView('book'); go(BOOKV); }
function eject() { clearInterval(tmr); S.fileOpen = false; paintFile(); if (S.dirty) { S.dirty = false; setTimeout(() => { shelf(); items(); }, 600); } S.typed = ''; S.scr = 'desk'; hMode = 'rest'; S.pend = null; hideSite(); S.sel = null; openB = null; paintScr(); setView('home'); go(HOME); }
const FILEV = { p: new THREE.Vector3(-3.55, 2.7, 1.15), t: new THREE.Vector3(-3.55, .03, -.05) };
function openFile() { if (S.view === 'screen') return; S.sel = null; openB = null; S.fileOpen = true; tip.style.opacity = 0; paintFile(); setView('file'); go(FILEV); }
function openLid() { if (!S.lid && !lidWant) { lidWant = true; hMode = 'lid'; } }
function typeSite() { S.pend = S.sel; if (!S.lid) openLid(); else startType(); }
function zoomScr() { scr.updateWorldMatrix(true, false); const c = scr.localToWorld(new THREE.Vector3()), n = new THREE.Vector3(0, 0, 1).transformDirection(scr.matrixWorld), k = Math.tan(cam.fov * Math.PI / 360), d = Math.max(.93 / k, 1.48 / (k * cam.aspect)) * 1.04; goal = { p: c.clone().addScaledVector(n, d), t: c }; }
function startType() {
  const u = site$(S.pend.h); S.scr = 'browser'; S.typed = ''; hMode = 'type'; setView('screen'); zoomScr(); paintScr(); let i = 0; clearInterval(tmr);
  tmr = setInterval(() => { S.typed = u.slice(0, ++i); paintScr(); if (i >= u.length) { clearInterval(tmr); setTimeout(() => { if (S.view === 'screen') { site.src = u; site.hidden = false; place(); hMode = 'rest'; } }, 700); } }, 85);
}
function place() {
  cam.updateMatrixWorld(); scr.updateWorldMatrix(true, false); const P = (x, y) => { const v = scr.localToWorld(new THREE.Vector3(x, y, 0)).project(cam); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; };
  const a = P(-1.4, .875 - 1.75 * 76 / 640), b = P(1.4, -.875 + 1.75 * 40 / 640); Object.assign(site.style, { left: a[0] + 'px', top: a[1] + 'px', width: b[0] - a[0] + 'px', height: b[1] - a[1] + 'px' });
}

/* pointer: hover tooltips, clicks, car dragging */
const tip = $('#tip'), cvEl = renderer.domElement, plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pv = new THREE.Vector3(); let down = null, drag = false;
const vis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; }, own = o => { while (o) { if (o.userData.kind) return o; o = o.parent; } return null; };
const hit = e => { mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, cam); const h = ray.intersectObjects(scene.children, true).find(x => vis(x.object)); return h && own(h.object); };
cvEl.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; const o = hit(e); if (o && o.userData.kind === 'car') { drag = true; ctl.enabled = false; } });
cvEl.addEventListener('pointerup', e => {
  if (drag) { drag = false; ctl.enabled = S.view !== 'screen'; return; } if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const o = hit(e); if (!o) return; const k = o.userData.kind; if (k === 'book') pick(o.userData.r); else if (k === 'note') typeSite(); else if (k === 'laptop') openLid(); else if (k === 'btn') press(); else if (k === 'lamp') dimLights(); else if (k === 'file') openFile();
});
cvEl.addEventListener('pointermove', e => {
  if (drag) { ray.setFromCamera(mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), cam); if (ray.ray.intersectPlane(plane, pv)) carT.set(Math.max(-4.3, Math.min(4.3, pv.x)), 0, Math.max(-1.4, Math.min(1.75, pv.z))); avoid(carT); return; }
  if (S.view === 'screen') return; const o = hit(e), d = o && !(o.userData.kind === 'file' && S.fileOpen) && (o.userData.tip || (o.userData.r && `<b>${E(o.userData.r.n)}</b>${o.userData.r.h ? '<br>Has a live site' : ''}`)); cvEl.style.cursor = o ? 'pointer' : ''; tip.style.opacity = d ? 1 : 0; if (d) { tip.innerHTML = d; tip.style.transform = `translate(${Math.min(e.clientX + 14, innerWidth - 310)}px,${e.clientY + 14}px)`; }
});

/* GitHub data (ETag cached: 304 replies cost no rate limit); re-synced every minute */
async function gh(path) {
  const k = 'dinc:' + path; let c = null; try { c = JSON.parse(ls.g(k)); } catch {}
  try { const r = await fetch(A + path, { headers: { Accept: 'application/vnd.github+json', ...(c && c.t ? { 'If-None-Match': c.t } : {}) } }); if (r.status === 304 && c) return c.d; if (!r.ok) throw 0; const d = await r.json(); ls.s(k, JSON.stringify({ t: r.headers.get('ETag'), d })); return d; }
  catch { if (c) { S.cached = true; return c.d; } throw 0; }
}
async function repos() { let all = []; for (let p = 1; p <= 3; p++) { const d = await gh(`/users/${U}/repos?per_page=100&sort=pushed&page=${p}`); all = all.concat(d); if (d.length < 100) break; } return all; }
function activity(ev, list) {
  const m = {}, k = d => d.toISOString().slice(0, 10);
  for (const e of ev) if (e.type === 'PushEvent') { const d = k(new Date(e.created_at)); m[d] = (m[d] || 0) + Math.max(1, (e.payload && e.payload.size) || 1); }
  if (!ev.length) list.forEach(r => { const d = k(new Date(r.p)); m[d] = (m[d] || 0) + 1; });
  const days = []; for (let i = 90; i >= 0; i--) days.push(m[k(new Date(Date.now() - i * 864e5))] || 0);
  const weeks = []; for (let c = 0; c < 13; c++) weeks.push(days.slice(c * 7, c * 7 + 7).reduce((a, b) => a + b, 0));
  return { days, weeks, total: days.reduce((a, b) => a + b, 0) };
}
const prog = (n, t) => window.boot && window.boot.p(n, t);
async function sync() {
  S.cached = false; const [u, r, e1, e2] = await Promise.allSettled([gh(`/users/${U}`), repos(), gh(`/users/${U}/events/public?per_page=100&page=1`), gh(`/users/${U}/events/public?per_page=100&page=2`)]);
  if (u.status === 'fulfilled') S.user = u.value; S.ok = r.status === 'fulfilled';
  if (S.ok) { S.list = r.value.map(x => ({ n: x.name, d: x.description, l: x.language, st: x.stargazers_count, f: x.forks_count, p: +new Date(x.pushed_at || x.created_at), c: +new Date(x.created_at), u: x.html_url, h: x.homepage })).sort((a, b) => b.p - a.p); S.sig = S.list.map(x => x.n).join(); }
  S.ev = [...(e1.value || []), ...(e2.value || [])]; S.act = activity(S.ev, S.list); S.t = new Date(); paintFile(); paintScr();
}
function items() {
  $('#items').innerHTML = S.list.slice(0, MAX).map((r, i) => `<li><button data-i="${i}" style="--lc:hsl(${hsh(r.n) % 360} 55% 50%)"><i></i>${E(r.n)}${r.h ? '<small>live</small>' : ''}</button></li>`).join('') || '<li>No public repositories found.</li>';
  $('#sync').textContent = S.ok ? (S.cached ? 'GitHub did not answer; showing the copy saved on your last visit.' : `Live from github.com/${U}, rechecked every minute.${S.list.length > MAX ? ` The desk shows the ${MAX} most recent of ${S.list.length}.` : ''}`) : 'GitHub did not answer. Check your connection and press R.';
}
async function load() { prog(25, `Calling github.com/${U}…`); await sync(); prog(85, 'Stacking the books…'); S.sel = null; shelf(); items(); prog(100, 'Ready'); setTimeout(() => $('#loader').classList.add('done'), 450); }
async function tick() { const old = S.sig; await sync(); if (S.sig !== old) { if (openB) S.dirty = true; else { shelf(); items(); } } }
async function refresh() { const b = $('#b-refresh'); b.disabled = true; b.textContent = 'Syncing…'; eject(); await load(); b.disabled = false; b.textContent = 'Refresh'; }

/* UI wiring */
$('#b-list').onclick = e => { const l = $('#list'); l.hidden = !l.hidden; e.currentTarget.setAttribute('aria-expanded', !l.hidden); };
$('#items').onclick = e => { const b = e.target.closest('button'); if (b) pick(S.list[+b.dataset.i]); };
$('#b-refresh').onclick = refresh; $('#back').onclick = eject;
addEventListener('keydown', e => { if (e.metaKey || e.ctrlKey || e.altKey) return; const k = e.key.toLowerCase(); if (k === 'escape') eject(); else if (k === 'r') refresh(); });
function size() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); cam.aspect = w / h; cam.fov = w / h < 1 ? 62 : 42; cam.updateProjectionMatrix(); }
addEventListener('resize', () => { size(); if (S.view === 'screen') zoomScr(); });

/* loop */
const clock = new THREE.Clock(), prev = new THREE.Vector3(); let lastT = 0, fl = 0;
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime(), dt = Math.min(.05, t - lastT); lastT = t;
  if (goal) { cam.position.lerp(goal.p, .09); ctl.target.lerp(goal.t, .09); if (cam.position.distanceTo(goal.p) < .02) { cam.position.copy(goal.p); ctl.target.copy(goal.t); goal = null; } }
  ctl.update(); cam.position.set(Math.max(-6.4, Math.min(6.4, cam.position.x)), Math.max(.4, Math.min(5, cam.position.y)), Math.max(-1, Math.min(9, cam.position.z)));
  /* lid opened by the two hands */
  if (lidWant && !S.lid) { if (!lidGo && hands[0].position.distanceTo(handGoal(0)) < .25) lidGo = true; if (lidGo) { S.la += (-1.85 - S.la) * .04; if (S.la < -1.84) { S.la = -1.85; S.lid = true; lidWant = lidGo = false; if (S.pend) startType(); else hMode = 'rest'; } } }
  lidP.rotation.x = S.la; glow.intensity = S.lid ? 2.5 + Math.sin(t * 3) * .2 : 0;
  hands.forEach((h, i) => { h.position.lerp(handGoal(i), .12); h.visible = hMode !== 'rest' || h.position.y > -.3; h.userData.fs.forEach((f, j) => f.rotation.x = hMode === 'type' ? -.2 - Math.abs(Math.sin(t * 13 + j * 1.9 + i * 2.3)) * .4 : -.15); });
  /* erratic strip lights */
  if (t > gT) { glitch = !glitch; gT = t + (glitch ? .05 + Math.random() * .15 : .6 + Math.random() * 2.5); }
  for (let i = 0; i < NS; i++) { if (t > sT[i]) { sOn[i] = !sOn[i]; sT[i] = t + .03 + Math.random() * .45; } strip.setColorAt(i, glitch || !sOn[i] ? cOff : cOn); } strip.instanceColor.needsUpdate = true;
  /* RGB mouse, big button, books, toy car */
  rgbM.color.setHSL((t * .25) % 1, 1, .5); mLight.color.copy(rgbM.color);
  if (Math.random() < .08) { const i = (Math.random() * wi) | 0; wOn[i] ^= 1; win.setColorAt(i, col.set(wOn[i] ? WP[i % 5] : 0x050608)); win.instanceColor.needsUpdate = true; } blink.forEach((b, i) => b.visible = Math.sin(t * 1.4 + i * 2) > .5);
  carGlow.position.set(car.position.x, .1, car.position.z); if (S.fileOpen && ((t * 2) | 0) !== fl) { fl = (t * 2) | 0; paintFile(); }
  cap.position.y += ((performance.now() < capT ? .12 : .18) - cap.position.y) * .3;
  books.forEach(b => { const op = b === openB, u = b.userData; b.position.lerp(op ? OPEN : u.home, .12); b.rotation.y += ((op ? 0 : u.hr) - b.rotation.y) * .12; u.cp.rotation.z += ((op ? -3.1 : 0) - u.cp.rotation.z) * .12; u.lb.visible = u.cp.rotation.z < -.4; if (op) inside.visible = u.cp.rotation.z < -2.6; });
  if (!openB) inside.visible = false;
  prev.copy(car.position); car.position.lerp(carT, .3); avoid(car.position); const dx = car.position.x - prev.x, dz = car.position.z - prev.z, mv = Math.hypot(dx, dz);
  if (mv > .004) { let da = Math.atan2(-dz, dx) - car.rotation.y; da = ((da + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; car.rotation.y += da * .25; wheels.forEach(w => w.rotation.z -= mv / .045); }
  if (S.view === 'screen' && !site.hidden) place();
  renderer.render(scene, cam);
});
size(); tint(); paintScr();
(document.fonts ? Promise.all([document.fonts.load('700 16px "Pixelify Sans"'), document.fonts.load('15px "Space Mono"')]).catch(() => 0) : Promise.resolve()).then(() => { paintScr(); paintBook(); paintFile(); load(); setInterval(() => { if (!document.hidden) tick(); }, 60000); });
