/* =====================================================================
   LE FIL — écran de la Soirée entrepreneuriat Genius N7
   Un seul fil incandescent, du début à la fin de la soirée.
   Moments : 1 attente (boucle) · 2 acte I · 3 acte II · 4 acte III · 5 apéro
   Les réglages de la soirée (lieu de l'apéro, troisième guest) sont dans
   reglages.js : il n'y a rien à changer ici.
   ===================================================================== */
(function () {
  'use strict';

  const W = 1920, H = 1080;
  const HZ = 640;            // l'horizon : la ligne de repos du fil
  const N = 3400;            // nombre de points du fil
  const STEP = 1 / 60;       // pas de simulation fixe (étincelles, événements)

  const D = window.FIL_DONNEES;
  const REG = window.REGLAGES || {};

  // ------------------------------------------------------------------
  // Outils
  // ------------------------------------------------------------------
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const eio = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eout = t => 1 - Math.pow(1 - t, 3);
  const ein = t => t * t;
  const eback = t => { const c1 = 1.15, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  function mulberry(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // bruit 1D lisse (scintillement du tungstène)
  function noise1(x) {
    const i = Math.floor(x), f = x - i;
    const h = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const u = f * f * (3 - 2 * f);
    return lerp(h(i), h(i + 1), u) * 2 - 1;
  }
  function polyLen(p) {
    let L = 0;
    for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
    return L;
  }
  function chaikin(p, iters) {
    let a = p;
    for (let k = 0; k < iters; k++) {
      if (a.length < 6) return a;
      const b = [a[0], a[1]];
      for (let i = 0; i < a.length - 2; i += 2) {
        const x0 = a[i], y0 = a[i + 1], x1 = a[i + 2], y1 = a[i + 3];
        b.push(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1, 0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1);
      }
      b.push(a[a.length - 2], a[a.length - 1]);
      a = b;
    }
    return a;
  }
  function distPointSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const L2 = dx * dx + dy * dy || 1e-9;
    const t = clamp(((px - x0) * dx + (py - y0) * dy) / L2, 0, 1);
    return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
  }

  // ------------------------------------------------------------------
  // L'écriture : Hershey Script, une police tracée d'un seul trait
  // ------------------------------------------------------------------
  const REMPLACE = { '’': "'", '‘': "'", 'œ': 'oe', 'Œ': 'Oe', '…': '...', ' ': ' ', ' ': ' ' };
  const ESPACE = 270;          // largeur d'une espace entre deux mots (unités de police)
  const CAP = 662;             // hauteur des capitales (unités de police)

  // Les accents des minuscules de la Hershey Script flottent très haut (à hauteur des capitales) :
  // avec l'inclinaison de l'écriture, l'aigu de « Soirée » ou de « Mêlée » finissait au-dessus de la
  // lettre suivante. On les redescend à la hauteur du point du i, juste au-dessus de leur lettre :
  // l'aigu et le grave pointent sur le sommet de la lettre, le circonflexe et le tréma se centrent
  // sur son axe incliné. Les capitales ne sont pas touchées (leurs accents tombent juste).
  (function recaleAccents() {
    const F = D.script.glyphs;
    const XH = 284;           // hauteur des minuscules
    const ECART = 110;        // du sommet de la lettre au bas de l'accent (au moins 96 : voir « marque » plus bas)
    const PENTE = 0.25;       // inclinaison de l'axe de la lettre
    const boite = sps => {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const sp of sps) for (let i = 0; i < sp.length; i += 2) {
        x0 = Math.min(x0, sp[i]); x1 = Math.max(x1, sp[i]); y0 = Math.min(y0, sp[i + 1]); y1 = Math.max(y1, sp[i + 1]);
      }
      return { x0, x1, y0, y1, l: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2 };
    };
    for (const ch of Object.keys(F)) {
      const base = ch.normalize('NFD')[0];
      if (base === ch || !/^[a-z]$/.test(base)) continue;
      const corps = [], marques = [];
      for (const sp of F[ch][1]) (boite([sp]).y0 > XH + 60 ? marques : corps).push(sp);
      if (!marques.length || !corps.length) continue;
      // sommet de la lettre : le milieu de ce qui dépasse en haut de son corps
      const bc = boite(corps);
      let s0 = 1e9, s1 = -1e9;
      for (const sp of corps) for (let i = 0; i < sp.length; i += 2) if (sp[i + 1] >= bc.y1 - 40) { s0 = Math.min(s0, sp[i]); s1 = Math.max(s1, sp[i]); }
      const xs = (s0 + s1) / 2, y0 = bc.y1 + ECART;
      let m = marques, k = 1;
      const bm = boite(m);
      const trait = m.length === 1 && m[0].length === 4;                 // aigu, grave : un trait droit
      if (trait) k = Math.min(1, 160 / Math.hypot(bm.l, bm.h));         // l'aigu, très long, ramené à la taille du grave
      else if (m.length === 1) k = Math.min(1, 150 / bm.l);             // circonflexe un peu plus petit
      else if (m.every(sp => { const b = boite([sp]); return b.l < 90 && b.h < 90; })) {
        // tréma : les deux points, très écartés, se rapprochent au-dessus de la lettre
        m = m.map(sp => { const d = (boite([sp]).cx - bm.cx) * -0.45; return sp.map((v, i) => (i % 2 === 0 ? v + d : v)); });
      }
      // point d'accroche : le bas d'un trait (l'aigu, le grave), sinon le milieu du bas de l'accent
      let ax = bm.cx, ay = bm.y0, nx = xs + PENTE * (ECART + bm.h * k / 2);
      if (trait) { const j = m[0][1] < m[0][3] ? 0 : 2; ax = m[0][j]; ay = m[0][j + 1]; nx = xs + PENTE * ECART; }
      const places = m.map(sp => sp.map((v, i) => (i % 2 === 0 ? nx + (v - ax) * k : y0 + (v - ay) * k)));
      F[ch] = [F[ch][0], corps.concat(places)];
    }
  })();

  function glyphes(str) {
    const F = D.script.glyphs;
    const out = [];
    let x = 0;
    for (const c0 of str) {
      const rep = REMPLACE[c0] !== undefined ? REMPLACE[c0] : c0;
      for (const ch of rep) {
        if (ch === ' ') { out.push({ ch, x0: x, subs: [], espace: true }); x += ESPACE; continue; }
        let g = F[ch];
        if (!g) { const base = ch.normalize('NFD')[0]; g = F[base] || F['?']; }
        out.push({ ch, x0: x, subs: g[1] });
        x += g[0];
      }
    }
    return { glyphes: out, largeur: x };
  }

  // Étendue d'encre d'une ligne (unités de police, y vers le haut)
  function encre(str) {
    const L = glyphes(str);
    let mn = 1e9, mx = -1e9, haut = -1e9, bas = 1e9;
    for (const g of L.glyphes) for (const sp of g.subs) for (let i = 0; i < sp.length; i += 2) {
      mn = Math.min(mn, g.x0 + sp[i]); mx = Math.max(mx, g.x0 + sp[i]);
      haut = Math.max(haut, sp[i + 1]); bas = Math.min(bas, sp[i + 1]);
    }
    if (mn > mx) { mn = 0; mx = L.largeur; haut = CAP; bas = 0; }
    return { mn, mx, l: mx - mn, haut, bas };
  }

  // Une ligne cursive -> segments visibles du fil, dans l'ordre d'écriture :
  // le corps de chaque mot, puis ses points et accents.
  function lignesCursive(str, s, ox, oy) {
    const k = s / 1000;
    const L = glyphes(str);
    const mots = []; let cur = null;
    for (const g of L.glyphes) {
      if (g.espace) { cur = null; continue; }
      if (!cur) { cur = []; mots.push(cur); }
      cur.push(g);
    }
    const runs = [];
    for (const mot of mots) {
      const corps = [], marques = [];
      for (const g of mot) {
        const lettre = /[a-zà-ÿ]/.test(g.ch);
        const subs = g.subs.map(sp => {
          const a = new Array(sp.length);
          for (let i = 0; i < sp.length; i += 2) { a[i] = ox + (g.x0 + sp[i]) * k; a[i + 1] = oy - sp[i + 1] * k; }
          return a;
        });
        const lens = subs.map(polyLen);
        const maxL = Math.max.apply(null, lens.concat([0]));
        subs.forEach((a, j) => {
          const sp = g.subs[j];
          let mnY = 1e9, mxY = -1e9;
          for (let i = 1; i < sp.length; i += 2) { mnY = Math.min(mnY, sp[i]); mxY = Math.max(mxY, sp[i]); }
          const marque = lettre && subs.length > 1 && lens[j] < 0.5 * maxL && (mnY >= 380 || mxY <= 5);
          (marque ? marques : corps).push({ a, g, j });
        });
      }
      // chaîner le corps du mot
      let run = null, prev = null;
      for (const c of corps) {
        const a = c.a;
        let visible = false;
        if (run) {
          const ex = run[run.length - 2], ey = run[run.length - 1];
          const gap = Math.hypot(a[0] - ex, a[1] - ey) / k;
          if (prev && prev.g === c.g) {
            // à l'intérieur d'une lettre : court, ou retour sur un trait existant
            let retrace = false;
            for (let i = 0; i + 3 < a.length && i < 8; i += 2) if (distPointSeg(ex, ey, a[i], a[i + 1], a[i + 2], a[i + 3]) < 22 * k) retrace = true;
            const pa = prev.a;
            for (let i = Math.max(0, pa.length - 10); i + 3 < pa.length; i += 2) if (distPointSeg(a[0], a[1], pa[i], pa[i + 1], pa[i + 2], pa[i + 3]) < 22 * k) retrace = true;
            visible = gap < 200 || (gap < 460 && retrace);
          } else {
            visible = gap < 200;
          }
        }
        if (visible) {
          const same = Math.hypot(a[0] - run[run.length - 2], a[1] - run[run.length - 1]) < 0.01;
          for (let i = same ? 2 : 0; i < a.length; i++) run.push(a[i]);
        } else {
          run = a.slice();
          runs.push({ pts: run, marque: false });
        }
        prev = c;
      }
      for (const m of marques) runs.push({ pts: m.a.slice(), marque: true });
    }
    // le fil est souple : il arrondit les angles du tracé
    for (const r of runs) r.pts = chaikin(r.pts, r.marque ? 2 : 3);
    return runs;
  }

  // ------------------------------------------------------------------
  // Construction d'une forme du fil (N points)
  // ------------------------------------------------------------------
  function Trace() { this.p = []; }
  Trace.prototype.add = function (pts, opt) {
    opt = opt || {};
    if (pts.length < 4) pts = [pts[0], pts[1], pts[0], pts[1]];
    this.p.push({ pts, vis: opt.vis !== false, tw: opt.tw != null ? opt.tw : 1, blank: !!opt.blank, evt: opt.evt || null, marque: !!opt.marque });
    return this;
  };
  Trace.prototype.fin = function () { const l = this.p[this.p.length - 1]; return l ? [l.pts[l.pts.length - 2], l.pts[l.pts.length - 1]] : [-80, HZ]; };
  // relier le dernier point au début du prochain segment (saut invisible ou trait visible)
  Trace.prototype.relie = function (x, y, visible) {
    const [ex, ey] = this.fin();
    if (Math.hypot(x - ex, y - ey) > 0.5) this.add([ex, ey, x, y], { vis: !!visible, tw: visible ? 0.6 : 0.08 });
    return this;
  };
  Trace.prototype.horizon = function (x1, opt) {
    const [ex] = this.fin();
    this.relie(ex, HZ, true);
    this.add([ex, HZ, x1, HZ], Object.assign({ tw: 0.22 }, opt || {}));
    return this;
  };

  function forme(trace) {
    const P = trace.p;
    let tot = 0;
    for (const p of P) { p.len = polyLen(p.pts); p.wl = p.vis ? p.len : p.len * 0.2; tot += p.wl; }
    const alloc = P.map(p => Math.max(2, Math.round(p.wl / tot * N)));
    let diff = N - alloc.reduce((a, b) => a + b, 0);
    while (diff !== 0) {
      let best = -1;
      for (let i = 0; i < alloc.length; i++) if ((diff > 0 || alloc[i] > 2) && (best < 0 || alloc[i] > alloc[best])) best = i;
      const d = diff > 0 ? 1 : -1;
      alloc[best] += d; diff -= d;
    }
    const x = new Float32Array(N), y = new Float32Array(N), v = new Float32Array(N), w = new Float32Array(N);
    const onH = new Uint8Array(N), blank = new Uint8Array(N);
    const evts = [];
    let n = 0, tcum = 0;
    for (let pi = 0; pi < P.length; pi++) {
      const p = P[pi], m = alloc[pi], pts = p.pts;
      const cum = [0];
      for (let i = 2; i < pts.length; i += 2) cum.push(cum[cum.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]));
      const L = cum[cum.length - 1];
      let seg = 0;
      for (let j = 0; j < m; j++) {
        const d = m > 1 ? (j / (m - 1)) * L : 0;
        while (seg < cum.length - 2 && cum[seg + 1] < d) seg++;
        const s0 = cum[seg], s1 = cum[seg + 1] != null ? cum[seg + 1] : s0;
        const f = s1 > s0 ? (d - s0) / (s1 - s0) : 0;
        const X = pts[seg * 2] + (pts[seg * 2 + 2] - pts[seg * 2]) * f || pts[seg * 2];
        const Y = pts[seg * 2 + 1] + (pts[seg * 2 + 3] - pts[seg * 2 + 1]) * f || pts[seg * 2 + 1];
        x[n] = X; y[n] = Y; v[n] = p.vis ? 1 : 0;
        w[n] = tcum + d * p.tw;
        onH[n] = Math.abs(Y - HZ) < 0.6 ? 1 : 0;
        blank[n] = p.blank ? 1 : 0;
        n++;
      }
      if (p.evt) evts.push({ kind: p.evt.kind, at: tcum + p.evt.f * L * p.tw, x: p.evt.x, y: p.evt.y });
      tcum += L * p.tw;
    }
    for (let i = 0; i < N; i++) w[i] /= tcum || 1;
    for (const e of evts) e.at /= tcum || 1;
    return { x, y, v, w, onH, blank, evts };
  }

  // ------------------------------------------------------------------
  // Les formes de la soirée
  // ------------------------------------------------------------------
  const X0 = -90, X1 = W + 90;
  const TEXTE_G = 400;                      // axe gauche des noms et des légendes
  const SPK_X = 236, SPK_DX = 54, SPK_HAUT = 150;

  function formePlate() {
    const t = new Trace();
    t.add([X0, HZ, X1, HZ], { tw: 1 });
    return forme(t);
  }

  // couper un nom en deux lignes équilibrées
  function coupe(nom) {
    const mots = nom.trim().split(/\s+/);
    if (mots.length < 2) return [nom.trim()];
    let best = null;
    for (let i = 1; i < mots.length; i++) {
      const a = mots.slice(0, i).join(' '), b = mots.slice(i).join(' ');
      const m = Math.max(encre(a).l, encre(b).l);
      if (!best || m < best.m) best = { m, l: [a, b] };
    }
    return best.l;
  }

  // Bloc cursif (1 ou 2 lignes), la dernière ligne posée sur l'horizon
  function blocCursif(lignes, opt) {
    const ext = lignes.map(encre);
    const n = lignes.length;
    const il = opt.interligne || 0.8;
    const maxU = Math.max.apply(null, ext.map(e => e.l));
    let s = Math.min(opt.tailleMax, opt.largeurMax / maxU * 1000);
    if (opt.haut != null) s = Math.min(s, (HZ - opt.haut) / ((n - 1) * il + ext[0].haut / 1000));
    const out = [];
    let haut = 1e9, bas = -1e9;
    lignes.forEach((l, i) => {
      const e = ext[i];
      const base = HZ - (n - 1 - i) * il * s;
      const ox = opt.centre != null ? opt.centre - (e.mn + e.l / 2) * s / 1000 : opt.gauche - e.mn * s / 1000;
      out.push({ runs: lignesCursive(l, s, ox, base), gauche: ox + e.mn * s / 1000, droite: ox + e.mx * s / 1000, base });
      haut = Math.min(haut, base - e.haut * s / 1000);
      bas = Math.max(bas, base - e.bas * s / 1000);
    });
    return { lignes: out, s, haut, bas, gauche: Math.min.apply(null, out.map(l => l.gauche)) };
  }

  function ajouteBloc(t, bloc) {
    const s = bloc.s;
    let premier = true;
    for (const L of bloc.lignes) {
      for (const r of L.runs) {
        const sx = r.pts[0], sy = r.pts[1];
        const [ex, ey] = t.fin();
        // le fil ne se montre en quittant l'horizon que si l'écriture commence au ras de la ligne
        const proche = premier && Math.abs(ey - HZ) < 1 && Math.abs(sy - HZ) < 0.1 * s && sx > ex - 4 && sx - ex < 0.6 * s;
        t.relie(sx, sy, proche);
        t.add(r.pts, { tw: r.marque ? 0.7 : 1, marque: r.marque });
        premier = false;
      }
    }
    // retour à l'horizon : si le dernier trait finit près de la ligne, une queue cursive s'y pose
    const last = bloc.lignes[bloc.lignes.length - 1];
    const dernier = t.p[t.p.length - 1];
    let queue = null;
    if (!dernier.marque) {
      const a = dernier.pts;
      const n = a.length / 2;
      // la sortie de la dernière lettre remonte : le fil la quitte à son point le plus bas
      let j = n - 1;
      while (j > 0 && a[2 * j - 1] >= a[2 * j + 1] - 0.25) j--;
      const yb = a[2 * j + 1];
      if (j < n - 1 && j > 2 && Math.abs(yb - HZ) < 0.1 * s) {
        a.length = 2 * (j + 1);
        queue = { long: 0.32 * s, h1: 0.1 * s, h2: 0.16 * s, monte: 0 };
      } else if (Math.abs(a[2 * n - 1] - HZ) < 0.32 * s && a[2 * n - 2] > last.droite - 0.25 * s) {
        queue = { long: 0.45 * s, h1: 0.08 * s, h2: 0.22 * s, monte: -0.3 };
      }
    }
    if (queue) {
      const a = dernier.pts;
      const [ex, ey] = t.fin();
      let bx = a[a.length - 4], by = a[a.length - 3];
      for (let j = a.length - 4; j >= 0; j -= 2) { bx = a[j]; by = a[j + 1]; if (Math.hypot(ex - bx, ey - by) > 8) break; }
      let tx = ex - bx, ty = Math.max(ey - by, queue.monte * Math.hypot(ex - bx, ey - by));
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const xr = ex + queue.long;
      const P = [ex, ey, ex + tx * queue.h1, ey + ty * queue.h1, xr - queue.h2, HZ, xr, HZ];
      const q = [];
      for (let i = 1; i <= 20; i++) {
        const u = i / 20, a0 = (1 - u) ** 3, a1 = 3 * (1 - u) ** 2 * u, a2 = 3 * (1 - u) * u * u, a3 = u ** 3;
        q.push(a0 * P[0] + a1 * P[2] + a2 * P[4] + a3 * P[6], a0 * P[1] + a1 * P[3] + a2 * P[5] + a3 * P[7]);
      }
      t.add([ex, ey].concat(q), { tw: 0.8 });
    } else {
      const [ex] = t.fin();
      t.relie(Math.max(last.droite, ex) + 24, HZ, false);
    }
    return t;
  }

  // les actes I, II, III : autant de pics que le numéro
  function ajoutePics(t, n) {
    const x0 = SPK_X - (n - 1) * SPK_DX / 2;
    for (let i = 0; i < n; i++) {
      const xc = x0 + i * SPK_DX;
      t.horizon(xc - 7);
      t.add([xc - 7, HZ, xc, SPK_HAUT, xc + 7, HZ], { tw: 0.35, evt: { kind: 'pic', f: 0.5, x: xc, y: SPK_HAUT } });
    }
  }

  function formeActe(n, nom) {
    const t = new Trace();
    t.add([X0, HZ, X0 + 10, HZ], { tw: 0.2 });
    ajoutePics(t, n);
    if (nom) {
      const bloc = blocCursif(coupe(nom), { gauche: TEXTE_G, largeurMax: 1300, tailleMax: 340, haut: SPK_HAUT, interligne: 0.8 });
      t.horizon(TEXTE_G - 40);
      ajouteBloc(t, bloc);
      t.horizon(X1, { tw: 0.2 });
      const f = forme(t);
      f.bloc = bloc;
      return f;
    }
    // le troisième, tant qu'il n'est pas confirmé : la ligne reste tendue, vide
    t.horizon(TEXTE_G - 40, { tw: 0.25 });
    t.horizon(W - 150, { tw: 1.6, blank: true });
    t.horizon(X1, { tw: 0.2 });
    const f = forme(t);
    f.vide = true;
    return f;
  }

  function formeTitre(lignes, opt) {
    const t = new Trace();
    t.add([X0, HZ, X0 + 10, HZ], { tw: 0.2 });
    const bloc = blocCursif(lignes, opt);
    t.horizon(bloc.gauche - 60);
    ajouteBloc(t, bloc);
    t.horizon(X1, { tw: 0.2 });
    const f = forme(t);
    f.bloc = bloc;
    return f;
  }

  // Le logo : l'ampoule G, tracée par le fil
  const LOGO = (function () {
    const cs = D.logo.contours.map(c => { const a = []; for (let i = 0; i < c.length; i += 2) a.push([c[i], c[i + 1]]); return a; });
    const area = c => { let s = 0; for (let i = 0; i < c.length; i++) { const p = c[i], q = c[(i + 1) % c.length]; s += p[0] * q[1] - q[0] * p[1]; } return Math.abs(s / 2); };
    cs.sort((a, b) => area(b) - area(a));
    const [anneau, barre, culot] = cs;
    let vmax = -1; for (const p of culot) vmax = Math.max(vmax, p[1]);
    return { anneau, barre, culot, vmax };
  })();
  const LOGO_S = 930, LOGO_CX = W / 2;
  const logoXY = p => [LOGO_CX + (p[0] - 0.5) * LOGO_S, HZ - 3 + (p[1] - LOGO.vmax) * LOGO_S];
  function tourne(c, ax, ay) {
    let bi = 0, bd = 1e18;
    c.forEach((p, i) => { const [x, y] = logoXY(p); const d = (x - ax) ** 2 + (y - ay) ** 2; if (d < bd) { bd = d; bi = i; } });
    const r = c.slice(bi).concat(c.slice(0, bi));
    const pts = [];
    for (const p of r.concat([r[0]])) { const [x, y] = logoXY(p); pts.push(x, y); }
    return chaikin(pts, 1);
  }
  function formeLogo() {
    const t = new Trace();
    t.add([X0, HZ, X0 + 10, HZ], { tw: 0.2 });
    const culot = tourne(LOGO.culot, LOGO_CX - 140, HZ);
    const anneau = tourne(LOGO.anneau, LOGO_CX - 120, HZ - 80);
    const barre = tourne(LOGO.barre, LOGO_CX + 120, HZ - 80);
    t.horizon(culot[0] - 2);
    t.relie(culot[0], culot[1], true);
    t.add(culot, { tw: 0.8 });
    t.relie(anneau[0], anneau[1], false);
    t.add(anneau, { tw: 1 });
    t.relie(barre[0], barre[1], false);
    t.add(barre, { tw: 1 });
    let xr = -1e9; for (let i = 0; i < culot.length; i += 2) xr = Math.max(xr, culot[i]);
    t.relie(xr + 6, HZ, false);
    t.horizon(X1, { tw: 0.2 });
    return forme(t);
  }
  const LOGO_CENTRE = (function () {
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const p of LOGO.anneau) { const [x, y] = logoXY(p); a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); }
    return [(a + b) / 2, (c + d) / 2];
  })();
  const LOGO_PATH = (function () {
    const p = new Path2D();
    for (const c of [LOGO.anneau, LOGO.barre, LOGO.culot]) {
      c.forEach((q, i) => { const [x, y] = logoXY(q); if (i === 0) p.moveTo(x, y); else p.lineTo(x, y); });
      p.closePath();
    }
    return p;
  })();

  // ------------------------------------------------------------------
  // Les mots de la soirée
  // ------------------------------------------------------------------
  function aLieu(lieu) {
    const l = (lieu || '').trim();
    if (/^le\s/i.test(l)) return 'au ' + l.replace(/^le\s+/i, '');
    if (/^les\s/i.test(l)) return 'aux ' + l.replace(/^les\s+/i, '');
    if (/^l['’]/i.test(l)) return 'à l’' + l.replace(/^l['’]\s*/i, '');
    return 'à ' + l;
  }

  const GUESTS = [
    { n: 1, nom: 'Tristan Vincent', ligne: 'Créateur de contenu, plus de 600\u00a0000 abonnés.' },   // espace insécable : « 600 000 » ne se coupe pas
    { n: 2, nom: 'Thibaut Lucas', ligne: 'Ingénieur ENSEEIHT, cofondateur et CEO de Picsellia.' },
    { n: 3, nom: (REG.troisiemeGuest || '').trim(), ligne: (REG.troisiemeGuestPresentation || '').trim() },
  ];

  const F = {};
  function formeLieu(txt) {
    const s1 = Math.min(330, 1500 / encre(txt).l * 1000);
    if (s1 >= 240 || !/\s/.test(txt.trim())) return formeTitre([txt], { centre: W / 2, largeurMax: 1500, tailleMax: 330 });
    // un nom de lieu long s'écrit sur deux lignes
    return formeTitre(coupe(txt), { centre: W / 2, largeurMax: 1500, tailleMax: 260, haut: 220, interligne: 1.05 });
  }
  function prepare() {
    F.plate = formePlate();
    F.logo = formeLogo();
    F.titre = formeTitre(['Soirée', 'entrepreneuriat'], { gauche: TEXTE_G, largeurMax: 1350, tailleMax: 400, interligne: 0.8 });
    F.actes = GUESTS.map(g => formeActe(g.n, g.nom || null));
    F.lieu = formeLieu(aLieu(REG.lieuApero || 'La Mêlée'));
  }

  // ------------------------------------------------------------------
  // Le fil vivant : morphoses
  // ------------------------------------------------------------------
  const fil = {
    x: new Float32Array(N), y: new Float32Array(N), v: new Float32Array(N),
    ax: new Float32Array(N), ay: new Float32Array(N), av: new Float32Array(N),
    cible: null, t0: 0, cd: 0.5, wd: 3, S: 0.75, ondes: 0,
  };
  const CHAUD = new Float32Array(N);   // chaleur de chaque point (le trait tout juste écrit est blanc)

  const allumage = { t0: 0.3, d: 2.6, actif: true };

  function etatInitial() {
    const f = F.plate;
    fil.x.set(f.x); fil.y.set(f.y); fil.v.fill(0);
    fil.ax.set(f.x); fil.ay.set(f.y); fil.av.fill(0);
    fil.cible = f; fil.t0 = -100; fil.cd = 0.01; fil.wd = 0.01; fil.S = 0;
  }

  function calculeFil(t) {
    const f = fil, B = f.cible;
    const cdt = clamp((t - f.t0) / f.cd, 0, 1);
    const ec = ein(cdt);
    const tw = f.t0 + f.cd;
    const twang = t > tw ? Math.exp(-(t - tw) / 0.32) * Math.sin(2 * Math.PI * 6.5 * (t - tw)) : 0;
    const twA = f.ondes;
    const rd = f.wd * (1 - f.S);
    const tSlide0 = f.t0 + 0.3 * f.cd;
    for (let i = 0; i < N; i++) {
      const tr = f.t0 + f.cd + 0.12 + f.wd * f.S * B.w[i];
      const er = clamp((t - tr) / rd, 0, 1);
      const es = eio(clamp((t - tSlide0) / (tr - tSlide0 + 0.25 * rd), 0, 1));
      const yc = lerp(f.ay[i], HZ, ec);                  // l'ancienne forme se couche sur l'horizon
      const x = lerp(f.ax[i], B.x[i], es);               // glisse le long de l'horizon
      const up = er > 0 ? eback(er) : 0;                  // la nouvelle forme se lève
      let y = yc + (B.y[i] - HZ) * up;
      const u = (x - X0) / (X1 - X0);
      if (twA > 0 && er < 1) y += twA * twang * Math.sin(Math.PI * u * 3) * (1 - er);
      f.x[i] = x; f.y[i] = y;
      const v1 = lerp(f.av[i], 1, ec);
      let v = v1, h = 0;
      if (B.v[i] < 0.5) v = v1 * (1 - clamp((t - tr + 0.2) / 0.2, 0, 1));   // un saut invisible s'éteint avant de se lever
      else if (er > 0) {
        {
          v = lerp(v1, 1, clamp(er * 2, 0, 1));
          const age = t - tr - 0.5 * rd;
          h = age < 0 ? clamp(er * 2, 0, 1) : Math.exp(-age / 0.9);
        }
      }
      f.v[i] = v; CHAUD[i] = h;
    }
    if (allumage.actif) {
      if (t > allumage.t0 + allumage.d + 0.3) allumage.actif = false;
      else for (let i = 0; i < N; i++) {
        const a = clamp((t - allumage.t0 - allumage.d * i / (N - 1)) / 0.1, 0, 1);
        f.v[i] *= a;
        const age = t - allumage.t0 - allumage.d * i / (N - 1);
        if (age > 0) CHAUD[i] = Math.max(CHAUD[i], Math.exp(-age / 0.7));
      }
    }
  }

  // le courant : une impulsion parcourt le fil de temps en temps, une fois la forme posée
  function courant(t) {
    const f = fil, B = f.cible;
    const tFin = f.t0 + f.cd + 0.12 + f.wd + 0.8;
    if (t < tFin) return;
    const ph = ((t - tFin) % 8) / 2.8 - 0.08;
    if (ph > 1.1) return;
    for (let i = 0; i < N; i++) {
      if (B.v[i] < 0.5) continue;
      const d = (B.w[i] - ph) / 0.03;
      if (d > -4 && d < 4) CHAUD[i] = Math.max(CHAUD[i], 0.75 * Math.exp(-d * d));
    }
  }

  function morph(cible, t, o) {
    o = o || {};
    calculeFil(t);
    fil.ax.set(fil.x); fil.ay.set(fil.y); fil.av.set(fil.v);
    applyModifs(t, fil.ax, fil.ay, false); // inclure la vibration courante dans l'instantané
    fil.cible = cible; fil.t0 = t;
    fil.cd = o.cd != null ? o.cd : 0.55;
    fil.wd = o.wd != null ? o.wd : 3;
    fil.S = o.S != null ? o.S : 0.76;
    fil.ondes = o.ondes != null ? o.ondes : 26;
    // pics -> éclairs, au passage de la tête
    for (const e of cible.evts) {
      const tr = t + fil.cd + 0.12 + fil.wd * fil.S * e.at + fil.wd * (1 - fil.S) * 0.55;
      planifie(tr, tt => eclair(e.x, e.y, 1, tt));
    }
  }

  // modificateurs dépendant du temps
  const fx = {
    puissance: tween(0.75), flood: tween(0), ampoule: tween(0), encre: tween(0), tension: tween(0),
    brins: tween(0), brinsBlanc: tween(0), slack: tween(0), cartouche: tween(0),
  };
  function tween(v) { return { a: v, b: v, t0: 0, d: 0.0001, e: eio }; }
  function tw(name, b, t, d, e) { const T = fx[name]; T.a = val(T, t); T.b = b; T.t0 = t; T.d = Math.max(0.0001, d); T.e = e || eio; }
  function val(T, t) { return lerp(T.a, T.b, T.e(clamp((t - T.t0) / T.d, 0, 1))); }

  // vivant : la respiration et la vibration (incluses dans l'instantané d'une morphose) ;
  // le fil détendu (slack) ne s'applique qu'au rendu, à tout ce qui repose sur l'horizon
  function applyModifs(t, xs, ys, vivant) {
    const B = fil.cible;
    const sl = vivant ? val(fx.slack, t) : 0;
    const te = val(fx.tension, t);
    const rd = fil.wd * (1 - fil.S);
    const t1 = fil.t0 + fil.cd + 0.12;
    for (let i = 0; i < N; i++) {
      const x = xs[i];
      const u = (x - X0) / (X1 - X0);
      if (sl > 0.0005) {
        const cx = 0.5 + 0.06 * Math.sin(0.21 * t);
        const q = (u - cx) / 0.62;
        const sag = (52 + 16 * Math.sin(0.43 * t)) * Math.max(0, 1 - q * q);
        const k = B.onH[i] ? 1 : 1 - clamp((t - t1 - fil.wd * fil.S * B.w[i]) / (rd || 1e-6), 0, 1);
        ys[i] += k * sl * (sag + 5 * Math.sin(2 * Math.PI * 0.11 * t + 3 * u) * Math.sin(Math.PI * u));
      }
      if (!B.onH[i]) continue;
      // respiration du fil au repos
      let dy = 1.3 * Math.sin(2 * Math.PI * (0.23 * t) + 7 * u) * Math.sin(Math.PI * u);
      if (te > 0 && B.blank[i]) {
        const a = (u - 0.18) / 0.75;
        const env = Math.sin(Math.PI * clamp(a, 0, 1));
        dy += te * env * (6.5 * Math.sin(2 * Math.PI * 11 * t) * Math.sin(Math.PI * a * 2) + 3 * Math.sin(2 * Math.PI * 17.3 * t + 1) * Math.sin(Math.PI * a * 5));
      }
      // seulement une fois la forme posée
      const tr = fil.t0 + fil.cd + 0.12 + fil.wd * fil.S * B.w[i];
      const er = clamp((t - tr) / rd, 0, 1);
      ys[i] += dy * er;
    }
  }

  // ------------------------------------------------------------------
  // Événements, étincelles, éclairs
  // ------------------------------------------------------------------
  let file = [];          // événements planifiés {t, fn}
  function planifie(t, fn) { file.push({ t, fn }); file.sort((a, b) => a.t - b.t); }
  const eclairs = [];
  function eclair(x, y, k, t) { eclairs.push({ x, y, k, t0: t != null ? t : tSim }); }

  const etincelles = [];
  let rand = mulberry(7);
  function tete(t) {
    // position de la tête d'écriture (là où le fil se lève)
    if (allumage.actif && t >= allumage.t0 && t <= allumage.t0 + allumage.d) {
      return { i: Math.min(N - 1, Math.floor((t - allumage.t0) / allumage.d * (N - 1))), cache: false };
    }
    const f = fil, B = f.cible;
    const rd = f.wd * (1 - f.S);
    const base = f.t0 + f.cd + 0.12;
    if (t < base || t > base + f.wd + 0.2) return null;
    const w = (t - base - rd * 0.35) / (f.wd * f.S || 1e-6);
    if (w < 0 || w > 1) return null;
    let lo = 0, hi = N - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (B.w[m] < w) lo = m + 1; else hi = m; }
    return { i: lo, cache: B.v[lo] < 0.5 };
  }
  function pasSimulation(t) {
    const h = tete(t);
    if (h && !h.cache && fil.v[h.i] > 0.3 && rand() < 0.75) {
      const a = -Math.PI / 2 + (rand() - 0.5) * 2.4;
      const sp = 140 + rand() * 480;
      etincelles.push({ x: fil.x[h.i], y: fil.y[h.i], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vie: 0, max: 0.3 + rand() * 0.5 });
    }
    for (let i = etincelles.length - 1; i >= 0; i--) {
      const p = etincelles[i];
      p.vie += STEP;
      if (p.vie > p.max) { etincelles.splice(i, 1); continue; }
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 1250 * STEP;
      p.x += p.vx * STEP; p.y += p.vy * STEP;
    }
    if (etincelles.length > 160) etincelles.splice(0, etincelles.length - 160);
  }

  // ------------------------------------------------------------------
  // Rendu
  // ------------------------------------------------------------------
  const cv = document.getElementById('scene');
  const ctx = cv.getContext('2d', { alpha: false });   // image opaque : l'écran n'a rien à mélanger derrière
  // Si l'ordinateur peine (images trop espacées), l'image est calculée un peu plus petite
  // et l'écran l'agrandit : la fluidité passe avant la finesse. Rien ne change sur une machine à l'aise.
  const PALIERS = [1, 5 / 6, 2 / 3];
  let palier = 0, ECH = 1;
  function appliquePalier(p) {
    palier = clamp(p, 0, PALIERS.length - 1); ECH = PALIERS[palier];
    const w = Math.round(W * ECH), h = Math.round(H * ECH);
    cv.width = w; cv.height = h;
    // les grands calques sont à la taille réelle de l'image : ils se posent sans être recalculés
    if (ECH === 1) { fond = fondHD; or = orHD; orP = orProfondHD; }
    else { fond = reduit(fondHD, w, h); or = reduit(orHD, w, h); orP = reduit(orProfondHD, w, h); }
    voile = couche(w, h);
    // trois couches de lumière, de la plus serrée à la plus large, puis leur réunion et le reflet
    gA = couche(Math.round(W / 2 * ECH), Math.round(H / 2 * ECH));
    gB = couche(Math.round(W / 4 * ECH), Math.round(H / 4 * ECH));
    gC = couche(Math.round(W / 16 * ECH), Math.ceil(68 * ECH));
    gL = couche(Math.round(W / 2 * ECH), Math.round(H / 2 * ECH));   // un seul agrandissement plein écran
    refl = couche(Math.round(W / 4 * ECH), Math.round(110 * ECH));
  }
  function couche(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d'); }
  function reduit(src, w, h) {
    const c = couche(w, h);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(src.canvas, 0, 0, w, h);
    return c;
  }
  const fondHD = couche(W, H), orHD = couche(W, H), orProfondHD = couche(W, H);   // peints une fois, en pleine définition
  let fond = null, or = null, orP = null, voile = null;                         // ceux du palier courant (appliquePalier)
  let gA = null, gB = null, gC = null, gL = null, refl = null;
  const sprite = couche(128, 128);
  const scratch = couche(W, 520);

  function grain(c, amp, seed) {
    const r = mulberry(seed);
    const img = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() + r() - 1) * amp;
      d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n, 0, 255); d[i + 2] = clamp(d[i + 2] + n * 1.1, 0, 255);
    }
    c.putImageData(img, 0, 0);
  }
  function peintFond() {
    const c = fondHD;
    let g = c.createRadialGradient(W * 0.5, HZ - 60, 40, W * 0.5, HZ, W * 0.78);
    g.addColorStop(0, '#0c1438');
    g.addColorStop(0.55, '#070b26');
    g.addColorStop(1, '#03040f');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // le sol de la scène se devine sous l'horizon
    g = c.createLinearGradient(0, HZ, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,6,0.55)');
    c.fillStyle = g; c.fillRect(0, HZ, W, H - HZ);
    grain(c, 5, 11);

    // la lumière de l'ampoule : le dégradé doré du logo Genius
    const o = orHD;
    g = o.createLinearGradient(0, 0, W, H);
    const gr = D.logo.gradient;
    g.addColorStop(0, gr[0]); g.addColorStop(0.42, gr[1]); g.addColorStop(0.7, gr[2]); g.addColorStop(1, gr[3]);
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    grain(o, 3.5, 23);

    // l'or de l'apéro : le même dégradé, bien plus profond (de l'ambre au brun doré), pour que
    // l'or inonde l'écran sans éblouir un amphi plongé dans le noir ; le texte s'y écrit en clair
    const q = orProfondHD;
    g = q.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#8a6220'); g.addColorStop(0.42, '#6e4a16'); g.addColorStop(0.7, '#573710'); g.addColorStop(1, '#3a2209');
    q.fillStyle = g; q.fillRect(0, 0, W, H);
    grain(q, 3, 29);

    const s = sprite;
    g = s.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.12, 'rgba(255,246,222,0.9)');
    g.addColorStop(0.35, 'rgba(255,184,90,0.32)');
    g.addColorStop(1, 'rgba(255,120,30,0)');
    s.fillStyle = g; s.fillRect(0, 0, 128, 128);
  }

  // couleurs du tungstène selon la puissance (0.7 braise, 1 ambre doré, 1.6 blanc)
  function chaleur(p) {
    const k = clamp((p - 0.4) / 1.2, 0, 1);
    return {
      coeur: [255, Math.round(lerp(232, 255, k)), Math.round(lerp(186, 246, k))],
      corps: [255, Math.round(lerp(168, 232, k)), Math.round(lerp(78, 176, k))],
      halo: [255, Math.round(lerp(128, 214, k)), Math.round(lerp(34, 120, k))],
      ambiant: [255, Math.round(lerp(96, 168, k)), Math.round(lerp(22, 74, k))],
    };
  }
  // la lumière dorée part d'une source (l'ampoule, ou le fil) et gagne tout l'écran
  const BORD = 300;
  const lisse = f => f * f * (3 - 2 * f);   // rampe douce (aucune ligne visible au bord de la lumière)
  // profond : l'or sombre de l'apéro (orP) ; sinon l'or vif de l'ampoule (or)
  const lumOr = { cx: W / 2, cy: HZ, ky: 1, R: 1500, bande: false, profond: false };
  function sourceOr(cx, cy, ky) {
    lumOr.cx = cx; lumOr.cy = cy; lumOr.ky = ky; lumOr.bande = false; lumOr.profond = false;
    let m = 0;
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) m = Math.max(m, Math.hypot(x - cx, (y - cy) / ky));
    lumOr.R = m + BORD;
  }
  function bandeOr(cy) {
    lumOr.cy = cy; lumOr.bande = true;
    lumOr.R = Math.max(cy, H - cy) + BORD;
  }
  function couverture(x, y, flood) {
    if (flood >= 0.999) return 1;
    if (flood <= 0.001) return 0;
    if (lumOr.bande) return lisse(clamp((flood * lumOr.R - Math.abs(y - lumOr.cy)) / BORD, 0, 1));
    const d = Math.hypot(x - lumOr.cx, (y - lumOr.cy) / lumOr.ky);
    return lisse(clamp((flood * lumOr.R - d) / BORD, 0, 1));
  }
  function peintOr(flood) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const src = lumOr.profond ? orP : or;
    if (flood >= 0.999) { ctx.drawImage(src.canvas, 0, 0); ctx.setTransform(ECH, 0, 0, ECH, 0, 0); return; }
    const L = lumOr, R = flood * L.R, v = voile;
    v.setTransform(1, 0, 0, 1, 0, 0);
    v.globalCompositeOperation = 'copy';
    v.drawImage(src.canvas, 0, 0);
    v.globalCompositeOperation = 'destination-in';
    if (L.bande) {
      v.setTransform(ECH, 0, 0, ECH, 0, 0);
      const a = Math.min(1, R / BORD), r0 = Math.max(0, R - BORD), s1 = (R - r0) / (2 * R || 1);
      const g = v.createLinearGradient(0, L.cy - R, 0, L.cy + R);
      // bords en courbe douce (pas de rampe droite : l'œil y verrait une ligne)
      for (let k = 0; k <= 8; k++) {
        const f = k / 8, al = 'rgba(0,0,0,' + (a * lisse(f)).toFixed(3) + ')';
        g.addColorStop(clamp(s1 * f, 0, 0.5), al);
        g.addColorStop(clamp(1 - s1 * f, 0.5, 1), al);
      }
      v.fillStyle = g;
      v.fillRect(0, 0, W, H);
      v.setTransform(1, 0, 0, 1, 0, 0);
      v.globalCompositeOperation = 'source-over';
      ctx.drawImage(v.canvas, 0, 0);
      ctx.setTransform(ECH, 0, 0, ECH, 0, 0);
      return;
    }
    v.setTransform(ECH, 0, 0, ECH * L.ky, 0, ECH * L.cy * (1 - L.ky));
    const g = v.createRadialGradient(L.cx, L.cy, Math.max(0, R - BORD), L.cx, L.cy, Math.max(1, R));
    for (let k = 0; k <= 8; k++) g.addColorStop(k / 8, 'rgba(0,0,0,' + (1 - lisse(k / 8)).toFixed(3) + ')');
    v.fillStyle = g;
    v.fillRect(0, -L.cy * (1 - L.ky) / L.ky, W, H / L.ky);
    v.setTransform(1, 0, 0, 1, 0, 0);
    v.globalCompositeOperation = 'source-over';
    ctx.drawImage(v.canvas, 0, 0);
    ctx.setTransform(ECH, 0, 0, ECH, 0, 0);
  }
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')';

  const NIV = 10;                         // niveaux de chaleur
  function chemins(xs, ys, vs, hs) {
    const plein = new Path2D(), demi = new Path2D();
    const chauds = new Array(NIV).fill(null);
    let ouvP = false, ouvD = false, nivPrec = 0;
    for (let i = 0; i < N - 1; i++) {
      const v = Math.min(vs[i], vs[i + 1]);
      if (v >= 0.66) {
        if (!ouvP) { plein.moveTo(xs[i], ys[i]); ouvP = true; }
        plein.lineTo(xs[i + 1], ys[i + 1]);
        ouvD = false;
      } else if (v >= 0.3) {
        if (!ouvD) { demi.moveTo(xs[i], ys[i]); ouvD = true; }
        demi.lineTo(xs[i + 1], ys[i + 1]);
        ouvP = false;
      } else { ouvP = false; ouvD = false; }
      const niv = v >= 0.66 ? Math.min(NIV, Math.round(0.5 * (hs[i] + hs[i + 1]) * NIV)) : 0;
      if (niv > 0) {
        const p = chauds[niv - 1] || (chauds[niv - 1] = new Path2D());
        if (niv !== nivPrec) p.moveTo(xs[i], ys[i]);
        p.lineTo(xs[i + 1], ys[i + 1]);
      }
      nivPrec = niv;
    }
    return { plein, demi, chauds };
  }

  // une couche de lumière : seul le flou du trait y est dessiné (le trait lui-même reste hors champ)
  function couchePrete(g, sc, flou, couleur) {
    const cw = g.canvas.width;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.shadowColor = 'rgba(0,0,0,0)';
    g.clearRect(0, 0, cw, g.canvas.height);
    g.setTransform(sc, 0, 0, sc, -(cw + 64), 0);
    g.shadowOffsetX = cw + 64; g.shadowOffsetY = 0;
    g.shadowBlur = flou; g.shadowColor = rgba(couleur, 1);
    g.lineCap = 'round'; g.lineJoin = 'round';
  }
  const LUM = {
    A: { flou: 6, ep: 5, k: 0.95 },     // serré
    B: { flou: 10, ep: 12, k: 0.8 },    // moyen
    C: { flou: 9, ep: 48, k: 0.7 },     // la lumière dans la pièce
  };
  function lumiere(lum, P, C) {
    const e = ECH;
    couchePrete(gC, e / 16, LUM.C.flou * e, C.ambiant); gC.lineWidth = LUM.C.ep;
    for (const L of lum) { gC.strokeStyle = 'rgba(0,0,0,' + clamp(L.a, 0, 1).toFixed(3) + ')'; gC.stroke(L.p); }
    couchePrete(gB, e / 4, LUM.B.flou * e, C.halo); gB.lineWidth = LUM.B.ep;
    for (const L of lum) { gB.strokeStyle = 'rgba(0,0,0,' + clamp(L.a, 0, 1).toFixed(3) + ')'; gB.stroke(L.p); }
    couchePrete(gA, e / 2, LUM.A.flou * e, C.corps); gA.lineWidth = LUM.A.ep;
    for (const L of lum) { gA.strokeStyle = 'rgba(0,0,0,' + clamp(L.a, 0, 1).toFixed(3) + ')'; gA.stroke(L.p); }

    // les couches s'additionnent à mi-résolution (agrandir par étapes adoucit aussi la lumière)
    const L = gL, lw = gL.canvas.width, lh = gL.canvas.height;
    L.setTransform(1, 0, 0, 1, 0, 0);
    L.globalCompositeOperation = 'source-over'; L.globalAlpha = 1;
    L.clearRect(0, 0, lw, lh);
    L.imageSmoothingEnabled = true; L.imageSmoothingQuality = 'low';
    L.globalCompositeOperation = 'lighter';
    L.globalAlpha = clamp(LUM.C.k * P, 0, 1); L.drawImage(gC.canvas, 0, 0, lw, gC.canvas.height * 8);
    L.globalAlpha = clamp(LUM.B.k * P, 0, 1); L.drawImage(gB.canvas, 0, 0, lw, lh);
    L.globalAlpha = clamp(LUM.A.k * P, 0, 1); L.drawImage(gA.canvas, 0, 0);

    // reflet sur le sol de la scène : flou, court, il s'efface vite
    const rw = refl.canvas.width, rh = refl.canvas.height;
    refl.globalCompositeOperation = 'source-over';
    refl.setTransform(1, 0, 0, 1, 0, 0);
    refl.clearRect(0, 0, rw, rh);
    refl.setTransform(1, 0, 0, -1, 0, 0);
    refl.drawImage(gB.canvas, 0, Math.round(HZ / 4 * e) - rh, rw, rh, 0, -rh, rw, rh);
    refl.setTransform(1, 0, 0, 1, 0, 0);
    refl.globalCompositeOperation = 'destination-in';
    const g = refl.createLinearGradient(0, 0, 0, 70 * e);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    refl.fillStyle = g; refl.fillRect(0, 0, rw, rh);
    refl.globalCompositeOperation = 'source-over';
    L.globalAlpha = clamp(0.5 * P, 0, 1);
    L.drawImage(refl.canvas, 0, (HZ + 3) / 2 * e, lw, 2 * rh);

    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    ctx.drawImage(L.canvas, 0, 0, W, H);
  }

  const RX = new Float32Array(N), RY = new Float32Array(N);

  function rendu(t) {
    calculeFil(t);
    RX.set(fil.x); RY.set(fil.y);
    applyModifs(t, RX, RY, true);
    courant(t);

    const P0 = val(fx.puissance, t);
    const flick = 1 + 0.03 * noise1(t * 9.3) + 0.015 * noise1(t * 23.1);
    const P = P0 * flick;
    const flood = val(fx.flood, t);
    const amp = val(fx.ampoule, t);
    const enc = val(fx.encre, t);
    const brins = val(fx.brins, t);
    const C = chaleur(P);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';     // bilinéaire : la lumière est déjà floue, et c'est bien plus léger
    ctx.drawImage(fond.canvas, 0, 0);
    ctx.setTransform(ECH, 0, 0, ECH, 0, 0); // tout le reste se dessine en coordonnées 1920 × 1080

    const plein = flood >= 0.999;          // l'or couvre tout : inutile de dessiner le fil incandescent
    const ch = chemins(RX, RY, fil.v, CHAUD);
    const filA = plein ? 0 : 1 - enc;
    const brinsP = brins > 0.001 ? cheminsBrins(t, brins) : null;
    const brinsA = plein ? 0 : clamp(brins * 1.3, 0, 1);

    // ---- la lumière (couches floues)
    const lum = [];
    if (filA > 0.001) {
      lum.push({ p: ch.plein, a: filA }, { p: ch.demi, a: 0.4 * filA });
    }
    if (brinsP && brinsA > 0.001) {
      // un seul tracé pour la lumière des neuf brins : un seul flou au lieu de neuf
      const tous = new Path2D();
      for (const p of brinsP) tous.addPath(p);
      lum.push({ p: tous, a: 0.75 * brinsA });
    }
    if (lum.length) lumiere(lum, P, C);

    // ---- les brins
    if (brinsP && brinsA > 0.001) dessineBrins(brinsP, brinsA, P, C);

    // ---- le fil lui-même
    if (filA > 0.001) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = filA;
      ctx.strokeStyle = rgba(C.corps, 0.6 * P); ctx.lineWidth = 6.5; ctx.stroke(ch.plein);
      ctx.strokeStyle = rgba(C.corps, 0.22 * P); ctx.stroke(ch.demi);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgba(C.coeur, 0.96 * P); ctx.lineWidth = 3.2; ctx.stroke(ch.plein);
      ctx.strokeStyle = rgba(C.coeur, 0.35 * P); ctx.stroke(ch.demi);
      // le trait tout juste écrit est chauffé à blanc, puis refroidit
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'butt';
      for (let k = 0; k < NIV; k++) {
        const p = ch.chauds[k];
        if (!p) continue;
        const a = (k + 1) / NIV;
        ctx.strokeStyle = 'rgba(255,212,150,' + (0.16 * a).toFixed(3) + ')'; ctx.lineWidth = 13; ctx.stroke(p);
        ctx.strokeStyle = 'rgba(255,250,238,' + (0.5 * a).toFixed(3) + ')'; ctx.lineWidth = 4.4; ctx.stroke(p);
      }
      ctx.lineCap = 'round';

      // vibration de la ligne tendue : l'enveloppe floue d'une corde pincée
      const te = val(fx.tension, t);
      if (te > 0.01 && fil.cible.vide) dessineCorde(t, te, C, P, filA);

      // tête d'écriture
      const h = tete(t);
      if (h && !h.cache) {
        const r = 58 + 26 * P;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = filA;
        ctx.drawImage(sprite.canvas, RX[h.i] - r, RY[h.i] - r, 2 * r, 2 * r);
        ctx.drawImage(sprite.canvas, RX[h.i] - r * 0.3, RY[h.i] - r * 0.3, r * 0.6, r * 0.6);
      }
      ctx.globalAlpha = 1;
    }

    // ---- étincelles
    if (etincelles.length) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.globalAlpha = 1;
      for (const p of etincelles) {
        const k = 1 - p.vie / p.max;
        ctx.strokeStyle = 'rgba(255,' + Math.round(170 + 80 * k) + ',' + Math.round(80 + 150 * k * k) + ',' + (0.85 * k).toFixed(3) + ')';
        ctx.lineWidth = 1.2 + 1.8 * k;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02); ctx.stroke();
      }
    }

    // ---- la lumière dorée gagne l'écran
    if (flood > 0.001) peintOr(flood);
    const blanc = val(fx.brinsBlanc, t);
    if (brinsP && flood > 0.02 && blanc > 0.001) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = flood * blanc * 0.45;
      ctx.strokeStyle = '#fff8ea'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const p of brinsP) ctx.stroke(p);
      ctx.globalAlpha = 1;
    }

    // ---- l'ampoule s'allume : le logo Genius, blanc sur la lumière dorée
    if (amp > 0.001) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.globalAlpha = clamp(amp, 0, 1);
      ctx.shadowColor = 'rgba(255,240,200,' + (0.9 * (1 - flood * 0.6)).toFixed(3) + ')';
      ctx.shadowBlur = 60 * ECH;
      ctx.fillStyle = '#ffffff';
      ctx.fill(LOGO_PATH);
      ctx.restore();
    }

    // ---- éclairs
    for (let i = eclairs.length - 1; i >= 0; i--) {
      const e = eclairs[i];
      const a = (t - e.t0);
      if (a < 0) continue;
      if (a > 1.4) { eclairs.splice(i, 1); continue; }
      const k = e.k * Math.exp(-a / 0.22);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(k, 0, 1);
      const r = 260 + 900 * a;
      ctx.drawImage(sprite.canvas, e.x - r, e.y - r, 2 * r, 2 * r);
      ctx.fillStyle = 'rgba(255,196,120,' + (0.09 * k).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // ---- le fil sur l'or de l'apéro : sur cet or profond, il s'écrit en clair et garde une lueur
    // retenue (plus forte, elle éclaircirait le fond autour des lettres et brouillerait le texte)
    if (enc > 0.001) {
      lumiere([{ p: ch.plein, a: 0.6 * enc }, { p: ch.demi, a: 0.25 * enc }], Math.min(P, 1), C);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff3dc'; ctx.lineWidth = 6.5;
      ctx.globalAlpha = enc; ctx.stroke(ch.plein);
      ctx.globalAlpha = enc * 0.4; ctx.stroke(ch.demi);
      ctx.globalAlpha = 1;
      const h = tete(t);
      if (h && !h.cache) {
        ctx.globalCompositeOperation = 'lighter';
        const r = 56;
        ctx.drawImage(sprite.canvas, RX[h.i] - r, RY[h.i] - r, 2 * r, 2 * r);
      }
    }

    // ---- légendes
    dessineLegendes(t, flood);
    dessineCartouche(t, flood);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function dessineCorde(t, te, C, P, filA) {
    const B = fil.cible;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let g = 0; g < 2; g++) {
      const sgn = g === 0 ? 1 : -1;
      const p = new Path2D();
      let open = false;
      for (let i = 0; i < N; i += 3) {
        if (!B.blank[i]) { open = false; continue; }
        const u = (RX[i] - X0) / (X1 - X0);
        const a = (u - 0.18) / 0.75;
        const env = Math.sin(Math.PI * clamp(a, 0, 1));
        const y = HZ + sgn * te * env * 9.5 * Math.abs(Math.sin(Math.PI * a * 2));
        if (!open) { p.moveTo(RX[i], y); open = true; } else p.lineTo(RX[i], y);
      }
      ctx.globalAlpha = filA * 0.45;
      ctx.strokeStyle = rgba(C.corps, 0.5 * P);
      ctx.lineWidth = 3;
      ctx.stroke(p);
    }
    ctx.globalAlpha = 1;
  }

  // les brins : le fil se démultiplie
  const NB = 9;
  function brinY(k, u, t, ouv) {
    const c = (k - (NB - 1) / 2) / ((NB - 1) / 2);
    const e = Math.pow(clamp(u, 0, 1), 1.35);
    const onde = Math.sin(2 * Math.PI * (1.05 * u - 0.11 * t) + k * 1.9) * (0.55 + 0.35 * Math.sin(k * 2.3 + 1));
    return HZ + ouv * e * (c * 390 + 80 * onde);
  }
  function cheminsBrins(t, ouv) {
    const out = [];
    for (let k = 0; k < NB; k++) {
      const p = new Path2D();
      for (let j = 0; j <= 160; j++) {
        const u = j / 160;
        const x = lerp(X0, X1, u), y = brinY(k, u, t, ouv);
        if (j === 0) p.moveTo(x, y); else p.lineTo(x, y);
      }
      out.push(p);
    }
    return out;
  }
  function dessineBrins(brinsP, a, P, C) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const p of brinsP) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a;
      ctx.strokeStyle = rgba(C.corps, 0.5 * P); ctx.lineWidth = 5; ctx.stroke(p);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgba(C.coeur, 0.92); ctx.lineWidth = 2.4; ctx.stroke(p);
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------
  // Légendes (police B612, dessinée à Toulouse pour les cockpits Airbus)
  // ------------------------------------------------------------------
  const POLICE = '"B612 Fil", "Helvetica Neue", Arial, sans-serif';
  const TONS = { creme: '#f3ecdc', encre: '#0b1030', laiton: '#d9b866' };
  const mesure = couche(8, 8);
  const legendes = [];

  // « AIn7 » : en B612, le I capital n'est qu'un trait et se lit « l » de loin (« Aln7 »). Dans ce nom,
  // il est dessiné avec des empattements, aux épaisseurs de B612 (fût 0,105 em, barres 0,08 em, comme
  // le pied du 1 de la même police) : il se lit I même au fond de l'amphi.
  const MOT_I = 'AIn7';
  const I_AV = 0.42;                                   // avance du I à empattements (em ; le I de B612 : 0,30)
  function morceaux(l) {                               // la ligne en morceaux : du texte, ou null pour ce I
    const out = []; let i0 = 0, j;
    while ((j = l.indexOf(MOT_I, i0)) >= 0) { out.push(l.slice(i0, j + 1), null); i0 = j + 2; }
    out.push(l.slice(i0));
    return out;
  }
  function largeurTexte(c, l, taille) {
    let w = 0;
    for (const m of morceaux(l)) w += m === null ? I_AV * taille : c.measureText(m).width;
    return w;
  }
  function ecritTexte(c, l, x, y, taille) {
    for (const m of morceaux(l)) {
      if (m !== null) { c.fillText(m, x, y); x += c.measureText(m).width; continue; }
      const cx = x + I_AV * taille / 2, f = 0.105 * taille, b = 0.08 * taille, e = 0.32 * taille, h = 0.75 * taille;
      c.fillRect(cx - f / 2, y - h, f, h);            // fût
      c.fillRect(cx - e / 2, y - h, e, b);            // empattement du haut
      c.fillRect(cx - e / 2, y - b, e, b);            // empattement du bas
      x += I_AV * taille;
    }
  }

  function coupeTexte(txt, taille, largeurMax) {
    mesure.font = '400 ' + taille + 'px ' + POLICE;
    const mots = txt.split(' ');
    const lignes = []; let cur = '';
    for (const m of mots) {
      const essai = cur ? cur + ' ' + m : m;
      if (cur && largeurTexte(mesure, essai, taille) > largeurMax) { lignes.push(cur); cur = m; }
      else cur = essai;
    }
    if (cur) lignes.push(cur);
    return lignes;
  }

  // o : x, y (ligne de base), taille, align ('gauche' | 'centre'), t, ton ('creme' | 'encre' | 'laiton' | 'auto'), largeurMax
  //     tons : deux tons au choix pour une légende qui change sur l'or (sinon 'auto' : crème puis encre)
  //     fixe : légende hors de la liste (qu'effaceLegendes n'efface pas)
  function legende(txt, o) {
    const taille = o.taille || 54;
    const lh = Math.round(taille * 1.32);
    const lignes = coupeTexte(txt, taille, o.largeurMax || 1400);
    mesure.font = '400 ' + taille + 'px ' + POLICE;
    const larg = Math.ceil(Math.max.apply(null, lignes.map(l => largeurTexte(mesure, l, taille))));
    const pad = Math.ceil(taille * 0.5);
    const w = larg + 2 * pad, h = Math.min(520, lh * (lignes.length - 1) + Math.ceil(taille * 1.4) + 2 * pad);
    const tons = o.tons || (o.ton === 'auto' ? ['creme', 'encre'] : [o.ton || 'creme']);
    const e = ECH;
    const imgs = tons.map(ton => {
      const c = couche(Math.ceil(w * e), Math.ceil(h * e));
      c.setTransform(e, 0, 0, e, 0, 0);
      c.font = '400 ' + taille + 'px ' + POLICE;
      c.textBaseline = 'alphabetic';
      c.fillStyle = TONS[ton];
      lignes.forEach((l, i) => {
        const lw = largeurTexte(c, l, taille);
        ecritTexte(c, l, o.align === 'centre' ? pad + (larg - lw) / 2 : pad, pad + taille + i * lh, taille);
      });
      return c.canvas;
    });
    const x = Math.round(o.align === 'centre' ? o.x - larg / 2 - pad : o.x - pad);
    const y = Math.round(o.y - taille - pad);
    const L = { imgs, auto: tons.length > 1, x, y, w, h, t0: o.t, dur: o.dur || 0.9, sortie: 1e9 };
    if (!o.fixe) legendes.push(L);
    return L;
  }

  // La date et le lieu restent lisibles pendant toute l'attente : une légende discrète et fixe, en bas
  // de l'écran (laiton sur la nuit, encre quand l'or passe). Elle s'efface seulement le temps où la
  // date s'écrit en grand sous le titre, pour ne pas la montrer deux fois.
  const DATE_LIEU = 'Jeudi 26 novembre 2026, amphi B00, ENSEEIHT';
  let cartouche = null;
  function prepareCartouche() {
    cartouche = legende(DATE_LIEU, { x: W / 2, y: 985, taille: 44, align: 'centre', tons: ['laiton', 'encre'], fixe: true });
  }
  function dessineCartouche(t, flood) {
    const a = val(fx.cartouche, t);
    if (!cartouche || a < 0.003) return;
    const L = cartouche;
    const k = couverture(L.x + L.w / 2, L.y + L.h / 2, flood);
    ctx.globalCompositeOperation = 'source-over';
    for (const [img, kk] of [[L.imgs[0], 1 - k], [L.imgs[1], k]]) {
      if (a * kk < 0.003) continue;
      ctx.globalAlpha = a * kk;
      ctx.drawImage(img, 0, 0, img.width, img.height, L.x, L.y, L.w, L.h);
    }
    ctx.globalAlpha = 1;
  }
  function effaceLegendes(t) { for (const l of legendes) if (l.sortie > t) l.sortie = t; }

  function dessineLegendes(t, flood) {
    ctx.globalCompositeOperation = 'source-over';
    const DOUX = 180;
    for (let i = legendes.length - 1; i >= 0; i--) {
      const L = legendes[i];
      const a = clamp((t - L.t0) / L.dur, 0, 1);
      const out = clamp((t - L.sortie) / 0.5, 0, 1);
      if (out >= 1) { legendes.splice(i, 1); continue; }
      if (a <= 0) continue;
      const k = L.auto ? couverture(L.x + L.w / 2, L.y + L.h / 2, flood) : 0;
      const couches = L.auto ? [[L.imgs[0], 1 - k], [L.imgs[1], k]] : [[L.imgs[0], 1]];
      for (const [img, k] of couches) {
        const al = k * (1 - out);
        if (al < 0.003) continue;
        ctx.globalAlpha = al;
        const iw = img.width, ih = img.height, ke = iw / L.w;
        if (a >= 1) { ctx.drawImage(img, 0, 0, iw, ih, L.x, L.y, L.w, L.h); continue; }
        // apparition : un balayage doux, de gauche à droite
        const xe = -DOUX + (L.w + 2 * DOUX) * eout(a);
        scratch.globalCompositeOperation = 'source-over';
        scratch.clearRect(0, 0, iw, ih);
        scratch.drawImage(img, 0, 0);
        scratch.globalCompositeOperation = 'destination-in';
        const g = scratch.createLinearGradient((xe - DOUX) * ke, 0, xe * ke, 0);
        g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        scratch.fillStyle = g; scratch.fillRect(0, 0, iw, ih);
        scratch.globalCompositeOperation = 'source-over';
        ctx.drawImage(scratch.canvas, 0, 0, iw, ih, L.x, L.y, L.w, L.h);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ligne de base d'une légende sous un bloc cursif (en dessous des jambages éventuels)
  const sousBloc = (bloc, taille) => Math.round(Math.max(HZ + 100, bloc.bas + 28 + 0.76 * taille));

  // ------------------------------------------------------------------
  // Les moments
  // ------------------------------------------------------------------
  const MOMENTS = [];
  const leg = (txt, o) => legende(txt, o);

  function scenarioActe(k, t, enBoucle) {
    const g = GUESTS[k];
    const f = F.actes[k];
    effaceLegendes(t);
    tw('tension', 0, t, 0.5);
    tw('slack', 0, t, 0.6);
    tw('puissance', enBoucle ? 0.95 : 1.1, t, 0.8);
    morph(f, t, { cd: 0.55, wd: f.vide ? 2.2 : 3.6, S: f.vide ? 0.8 : 0.93, ondes: 28 });
    const fin = t + 0.55 + 0.12 + (f.vide ? 2.2 : 3.6);
    planifie(fin - 0.4, tt => leg('Acte', { x: SPK_X, y: HZ + 100, taille: 54, align: 'centre', t: tt, ton: 'laiton' }));
    if (f.vide) {
      planifie(fin - 0.8, tt => tw('tension', 1, tt, 1.6, eout));
      if (enBoucle) planifie(fin + 0.3, tt => leg('Son nom s’écrira ce soir.', { x: TEXTE_G, y: HZ + 100, taille: 54, t: tt }));
      else planifie(fin - 0.6, tt => tw('puissance', 1.35, tt, 1.2));
    } else if (g.ligne) {
      const x = Math.round(f.bloc.gauche);
      planifie(fin - 0.2, tt => leg(g.ligne, { x, y: sousBloc(f.bloc, 54), taille: 54, t: tt, largeurMax: W - x - 110 }));
    }
  }

  // 1. L'attente : le fil s'allume et se repose, puis la boucle (60 s) tourne
  const repos = t => { effaceLegendes(t); tw('tension', 0, t, 0.6); tw('puissance', 0.72, t, 1.5); tw('slack', 1, t, 2.6); morph(F.plate, t, { cd: 0.9, wd: 2.4, S: 0.9, ondes: 0 }); };
  MOMENTS.push({
    nom: 'Attente',
    intro: 5.5,
    introCues: [[0.0, repos], [1.0, t => tw('cartouche', 1, t, 1.8)]],
    periode: 60,
    cues: [
      [0.0, t => { effaceLegendes(t); tw('slack', 0, t, 0.5); tw('puissance', 0.9, t, 1); morph(F.logo, t, { cd: 0.5, wd: 3.8, S: 0.82, ondes: 24 }); }],
      [4.2, t => leg('Genius N7, avec AIn7', { x: W / 2, y: HZ + 100, taille: 56, align: 'centre', t, ton: 'auto' })],
      [5.6, t => { tw('puissance', 1.6, t, 0.5, ein); }],
      [6.0, t => { sourceOr(LOGO_CENTRE[0], LOGO_CENTRE[1], 1); tw('ampoule', 1, t, 0.5, eout); tw('flood', 1, t, 1.3, eout); }],
      [9.4, t => { tw('flood', 0, t, 1.5, eio); tw('ampoule', 0, t, 1.8, eio); tw('puissance', 0.9, t, 1.4); }],
      [12.2, t => { effaceLegendes(t); morph(F.titre, t, { cd: 0.5, wd: 3.6, S: 0.93, ondes: 26 }); }],
      [16.2, t => leg(DATE_LIEU, { x: Math.round(F.titre.bloc.gauche), y: sousBloc(F.titre.bloc, 54), taille: 54, t })],
      [16.9, t => tw('cartouche', 0, t, 0.6)],          // la date est écrite en grand : la légende fixe s'efface
      [22.1, t => tw('cartouche', 1, t, 0.9)],          // et revient pendant que la grande s'en va
      [22.5, t => scenarioActe(0, t, true)],
      [32.0, t => scenarioActe(1, t, true)],
      [41.5, t => scenarioActe(2, t, true)],
      [51.5, repos],
    ],
  });

  // 2-4. Les actes
  [0, 1, 2].forEach(k => MOMENTS.push({
    nom: 'Acte ' + ['I', 'II', 'III'][k],
    cues: [[0, t => scenarioActe(k, t, false)]],
  }));

  // 5. L'apéro
  MOMENTS.push({
    nom: 'Apéro',
    cues: [
      [0.0, t => { effaceLegendes(t); tw('tension', 0, t, 0.4); tw('slack', 0, t, 0.4); tw('puissance', 1.05, t, 0.8); morph(F.plate, t, { cd: 0.5, wd: 0.8, S: 0.3, ondes: 30 }); }],
      [1.2, t => { tw('brins', 1, t, 2.8, eio); }],
      [3.6, t => { tw('puissance', 1.7, t, 0.9, ein); }],
      [4.3, t => { bandeOr(HZ); lumOr.profond = true; tw('flood', 1, t, 1.1, eio); tw('brinsBlanc', 1, t, 1.6); }],
      [5.4, t => { tw('encre', 1, t, 0.4); morph(F.lieu, t, { cd: 0.3, wd: 2.8, S: 0.93, ondes: 0 }); }],
      [5.9, t => leg('La conversation continue', { x: W / 2, y: Math.round(F.lieu.bloc.haut - 50), taille: 72, align: 'centre', t, ton: 'creme' })],
      [8.7, t => leg('Apéro et rencontres', { x: W / 2, y: sousBloc(F.lieu.bloc, 58), taille: 58, align: 'centre', t, ton: 'creme' })],
      [10.5, t => { tw('brinsBlanc', 0, t, 4, eio); }],
    ],
  });

  // ------------------------------------------------------------------
  // Pilotage
  // ------------------------------------------------------------------
  let tSim = 0;               // temps simulé (s)
  let moment = 0, debutMoment = 0, cycle = 0, prochain = 0, prochainIntro = 0;

  function lanceMoment(m, t) {
    moment = clamp(m, 0, MOMENTS.length - 1);
    debutMoment = t; cycle = 0; prochain = 0; prochainIntro = 0;
    file = [];
    // retour progressif des effets globaux
    tw('flood', 0, t, 0.8); tw('ampoule', 0, t, 0.6); tw('encre', 0, t, 0.35); tw('brins', 0, t, 0.8); tw('brinsBlanc', 0, t, 0.5);
    tw('cartouche', 0, t, 0.5);   // la date et le lieu ne restent que pendant l'attente (qui les rallume)
    document.title = MOMENTS[moment].nom + ' · Le fil';
  }

  function avance(t) {
    // déclenche les repères du moment, puis les événements planifiés, au pas fixe
    while (tSim + STEP <= t + 1e-9) {
      tSim += STEP;
      const M = MOMENTS[moment];
      const I = M.introCues || [];
      while (prochainIntro < I.length && debutMoment + I[prochainIntro][0] <= tSim) { const c = I[prochainIntro++]; c[1](debutMoment + c[0]); }
      const base = debutMoment + (M.intro || 0);
      for (;;) {
        const c = M.cues[prochain];
        if (!c) {
          if (M.periode && tSim >= base + (cycle + 1) * M.periode) { cycle++; prochain = 0; continue; }
          break;
        }
        const tc = base + cycle * (M.periode || 0) + c[0];
        if (tc <= tSim) { prochain++; c[1](tc); } else break;
      }
      while (file.length && file[0].t <= tSim) { const e = file.shift(); e.fn(e.t); }
      pasSimulation(tSim);
    }
  }

  // ------------------------------------------------------------------
  // Démarrage
  // ------------------------------------------------------------------
  function chargePolice() {
    try {
      if (!window.FIL_POLICE || typeof FontFace === 'undefined') return Promise.resolve();
      const bin = atob(window.FIL_POLICE);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const ff = new FontFace('B612 Fil', u8.buffer, { weight: '400', style: 'normal' });
      return ff.load().then(f => { document.fonts.add(f); }).catch(() => {});
    } catch (e) { return Promise.resolve(); }
  }

  let qForcee = false;
  function demarre() {
    prepare();
    peintFond();
    const params = new URLSearchParams(location.search);
    // ?q=0|1|2 impose la finesse de l'image (0 = pleine définition) au lieu de l'adaptation automatique
    if (params.has('q')) qForcee = true;
    appliquePalier(qForcee ? (parseInt(params.get('q'), 10) || 0) : 0);
    prepareCartouche();
    etatInitial();
    if (params.has('t')) {
      // mode image figée : index.html?m=<moment 1-5>&t=<secondes>
      const m = parseInt(params.get('m') || '1', 10) - 1;
      const tt = parseFloat(params.get('t') || '0');
      rand = mulberry(7 + m);
      if (m > 0) {
        // état de départ réaliste : le fil au repos, déjà allumé
        allumage.actif = false;
        fil.v.fill(1); fil.av.fill(1);
        tw('puissance', 0.75, 0, 0.001);
      }
      lanceMoment(m, 0);
      avance(tt);
      rendu(tt);
      window.__filPret = true;
      return;
    }

    lanceMoment(0, 0);
    let t0 = null, prec = null;
    // Fluidité : l'écart moyen entre deux images est mesuré sur un tour entier de l'attente
    // (même contenu d'un tour à l'autre). Plus de 24 ms : on essaie une image plus légère au tour suivant ;
    // on la garde seulement si elle accélère vraiment (sinon l'écran est simplement limité, par exemple
    // à 30 images par seconde en économie d'énergie : on revient). Une machine à l'aise n'est jamais touchée.
    const adapt = { fini: qForcee, tour: -2, somme: 0, n: 0, ref: 0 };
    function juge(moy) {
      if (adapt.ref) {
        if (moy < adapt.ref * 0.88) {                                    // plus fluide : on garde
          adapt.ref = 0;
          if (moy > 24 && palier < PALIERS.length - 1) { adapt.ref = moy; appliquePalier(palier + 1); }
          else adapt.fini = true;
        } else { appliquePalier(palier - 1); adapt.fini = true; }       // aucun gain : on revient
      } else if (moy > 24 && palier < PALIERS.length - 1) { adapt.ref = moy; appliquePalier(palier + 1); }
      else adapt.fini = true;
    }
    function boucle(now) {
      if (t0 == null) t0 = now;
      let t = (now - t0) / 1000;
      if (t - tSim > 0.5) { t0 += (t - tSim - 0.1) * 1000; t = tSim + 0.1; }  // après une pause : ne pas rattraper des secondes
      const dt = prec == null ? 0 : now - prec;
      prec = now;
      avance(t);
      if (!adapt.fini) {
        const A = MOMENTS[0];
        const k = moment === 0 ? Math.floor((tSim - debutMoment - A.intro) / A.periode) : -2;
        if (k !== adapt.tour) {
          if (adapt.tour >= 0 && k === adapt.tour + 1 && adapt.n >= 600) { juge(adapt.somme / adapt.n); prec = null; }
          adapt.tour = k; adapt.somme = 0; adapt.n = 0;
        } else if (k >= 0 && dt > 0 && dt < 250) { adapt.somme += dt; adapt.n++; }
      }
      rendu(tSim);
      requestAnimationFrame(boucle);
    }
    requestAnimationFrame(boucle);

    // Garder l'ordinateur éveillé tant que l'écran est affiché : sans action au clavier pendant
    // l'attente, il pourrait sinon se mettre en veille. Sans effet si le navigateur ne le permet pas.
    let verrouEveil = null;
    function eveil() {
      try {
        if (verrouEveil || !navigator.wakeLock || document.visibilityState !== 'visible') return;
        navigator.wakeLock.request('screen').then(v => {
          verrouEveil = v;
          v.addEventListener('release', () => { verrouEveil = null; });
        }).catch(() => {});
      } catch (e) { /* rien */ }
    }
    eveil();
    document.addEventListener('visibilitychange', eveil);

    function aller(m) {
      if (m < 0 || m >= MOMENTS.length || m === moment) return;
      lanceMoment(m, tSim);
    }
    window.addEventListener('keydown', e => {
      const k = e.key;
      eveil();
      // une touche maintenue enfoncée se répète (e.repeat) : seule la première pression compte,
      // sinon l'écran défilerait jusqu'à l'apéro
      const rep = e.repeat;
      // chiffres : par la position de la touche, pour qu'un clavier AZERTY marche sans Maj (« & » = 1)
      const chiffre = /^(?:Digit|Numpad)([1-5])$/.exec(e.code || '');
      if (chiffre && !e.ctrlKey && !e.metaKey && !e.altKey) { if (!rep) aller(parseInt(chiffre[1], 10) - 1); return; }
      if (k === 'ArrowRight' || k === ' ' || k === 'Spacebar' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); if (!rep) aller(moment + 1); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); if (!rep) aller(moment - 1); }
      else if (/^[1-5]$/.test(k)) { if (!rep) aller(parseInt(k, 10) - 1); }
      else if ((k === 'f' || k === 'F') && !rep) {
        const d = document, el = d.documentElement;
        const plein = d.fullscreenElement || d.webkitFullscreenElement;
        if (!plein) (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
        else (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
      }
    });

    // Sur un téléphone (sans clavier) : toucher la moitié droite de l'écran = moment suivant, la moitié
    // gauche = moment précédent. Seuls les doigts comptent (pointerType « touch ») : un clic de souris
    // en régie ne fait rien. Glisser ou pincer pour zoomer ne compte pas comme un toucher.
    let doigt = null;
    window.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') return;
      doigt = e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;   // un deuxième doigt annule
    });
    window.addEventListener('pointercancel', () => { doigt = null; });
    window.addEventListener('pointerup', e => {
      if (e.pointerType !== 'touch' || !doigt || e.pointerId !== doigt.id) return;
      const bouge = Math.hypot(e.clientX - doigt.x, e.clientY - doigt.y);
      doigt = null;
      if (bouge > 30) return;
      eveil();
      const vv = window.visualViewport;                   // la partie visible, même si l'on a zoomé
      const milieu = vv ? vv.offsetLeft + vv.width / 2 : window.innerWidth / 2;
      aller(e.clientX >= milieu ? moment + 1 : moment - 1);
    });
  }

  chargePolice().then(demarre);
})();
