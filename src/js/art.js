// Vector card faces drawn in the Rider-Waite-Smith palette.
//
// These are original symbolic renderings, not reproductions of the 1909
// plates: flat shapes, heavy outlines and the same colour language Pamela
// Colman Smith used, composed from the emblems each card is known by.

const W = 200;
const H = 340;

const C = {
  cream: '#f4e7ca',
  ink: '#2b2118',
  sky: '#bcd9e8',
  night: '#25324a',
  blue: '#2f5d8a',
  red: '#b0392c',
  gold: '#e3b33b',
  green: '#587f4b',
  grey: '#9aa0a6',
  white: '#f7f4ec',
  flesh: '#e6c39a',
  violet: '#6b5b95',
  earth: '#c9a063',
};

const el = (tag, attrs = {}, kids = '') => {
  const a = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `<${tag} ${a}>${kids}</${tag}>`;
};

const rect = (x, y, w, h, fill, extra = {}) => el('rect', { x, y, width: w, height: h, fill, ...extra });
const circle = (cx, cy, r, fill, extra = {}) => el('circle', { cx, cy, r, fill, ...extra });
const path = (d, fill, extra = {}) => el('path', { d, fill, ...extra });
const line = (x1, y1, x2, y2, stroke, sw = 2) => el('line', { x1, y1, x2, y2, stroke, 'stroke-width': sw, 'stroke-linecap': 'round' });
const poly = (points, fill, extra = {}) => el('polygon', { points, fill, ...extra });
const stroked = { stroke: C.ink, 'stroke-width': 2, 'stroke-linejoin': 'round' };
const thin = { stroke: C.ink, 'stroke-width': 1.4 };

// --- scene primitives -------------------------------------------------------

const sky = (fill = C.sky) => rect(14, 22, W - 28, H - 70, fill);
const ground = (fill = C.green, top = 250) => rect(14, top, W - 28, H - 48 - top, fill);

const mountains = (y = 250, fill = C.violet) =>
  path(`M14 ${y} L58 ${y - 46} L96 ${y - 6} L128 ${y - 54} L172 ${y} L186 ${y} L186 ${y + 8} L14 ${y + 8} Z`, fill, thin);

const sunDisc = (cx, cy, r, fill = C.gold) => {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return line(cx + Math.cos(a) * (r + 3), cy + Math.sin(a) * (r + 3), cx + Math.cos(a) * (r + 11), cy + Math.sin(a) * (r + 11), fill, 3);
  }).join('');
  return rays + circle(cx, cy, r, fill, thin);
};

const crescent = (cx, cy, r, fill = C.white) =>
  path(`M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * 0.74} ${r * 0.9} 0 1 1 ${cx} ${cy - r} Z`, fill, thin);

const star = (cx, cy, r, points = 8, fill = C.gold) => {
  const pts = [];
  for (let i = 0; i < points * 2; i += 1) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return poly(pts.join(' '), fill, thin);
};

/** A robed standing figure — the workhorse of the Major Arcana scenes. */
const figure = (cx, baseY, h, robe, { halo = false, crown = false, arms = 'down' } = {}) => {
  const headR = h * 0.12;
  const headY = baseY - h + headR;
  const shoulder = headY + headR + h * 0.06;
  let out = '';
  if (halo) out += circle(cx, headY, headR * 1.9, C.gold, { opacity: 0.55 });
  out += path(
    `M${cx - h * 0.26} ${baseY} L${cx - h * 0.13} ${shoulder} Q${cx} ${shoulder - h * 0.06} ${cx + h * 0.13} ${shoulder} L${cx + h * 0.26} ${baseY} Z`,
    robe,
    stroked,
  );
  out += circle(cx, headY, headR, C.flesh, thin);
  if (crown) out += poly(
    `${cx - headR} ${headY - headR * 0.9} ${cx - headR * 0.5} ${headY - headR * 1.7} ${cx} ${headY - headR} ${cx + headR * 0.5} ${headY - headR * 1.7} ${cx + headR} ${headY - headR * 0.9}`,
    C.gold, thin,
  );
  if (arms === 'up') out += line(cx - h * 0.1, shoulder + 4, cx - h * 0.3, shoulder - h * 0.22, C.flesh, 5) + line(cx + h * 0.1, shoulder + 4, cx + h * 0.3, shoulder - h * 0.22, C.flesh, 5);
  if (arms === 'out') out += line(cx - h * 0.1, shoulder + 6, cx - h * 0.34, shoulder + 2, C.flesh, 5) + line(cx + h * 0.1, shoulder + 6, cx + h * 0.34, shoulder + 2, C.flesh, 5);
  if (arms === 'split') out += line(cx - h * 0.1, shoulder + 4, cx - h * 0.28, shoulder - h * 0.24, C.flesh, 5) + line(cx + h * 0.1, shoulder + 6, cx + h * 0.3, shoulder + h * 0.14, C.flesh, 5);
  return out;
};

const pillar = (x, fill) => rect(x, 86, 20, 172, fill, stroked);

const tower = (x, y, w, h, fill = C.grey) =>
  rect(x, y, w, h, fill, stroked) +
  rect(x - 4, y - 10, w + 8, 10, C.earth, stroked) +
  rect(x + w / 2 - 6, y + 22, 12, 20, C.night, thin);

// --- suit emblems -----------------------------------------------------------

const wand = (cx, cy, h = 54, angle = 0) => {
  const g = `<g transform="translate(${cx} ${cy}) rotate(${angle})">`;
  return `${g}${rect(-3.5, -h / 2, 7, h, C.earth, stroked)}${path(`M0 ${-h / 2} q-12 -6 -14 -18 q12 2 14 12 q2 -10 14 -12 q-2 12 -14 18 Z`, C.green, thin)}</g>`;
};

const cup = (cx, cy, s = 1) => {
  const g = `<g transform="translate(${cx} ${cy}) scale(${s})">`;
  return `${g}${path('M-16 -18 L16 -18 Q16 6 0 10 Q-16 6 -16 -18 Z', C.gold, stroked)}${rect(-3, 9, 6, 12, C.gold, thin)}${path('M-11 21 Q0 27 11 21 Q11 25 0 26 Q-11 25 -11 21 Z', C.gold, thin)}</g>`;
};

const sword = (cx, cy, h = 60, angle = 0) => {
  const g = `<g transform="translate(${cx} ${cy}) rotate(${angle})">`;
  return `${g}${poly(`0,${-h / 2} 5,${-h / 2 + 12} 5,${h / 2 - 20} 0,${h / 2 - 12} -5,${h / 2 - 20} -5,${-h / 2 + 12}`, C.grey, stroked)}${rect(-13, h / 2 - 20, 26, 5, C.earth, thin)}${rect(-2.5, h / 2 - 15, 5, 15, C.earth, thin)}</g>`;
};

const pentacle = (cx, cy, r = 17) => {
  const pts = [];
  for (let i = 0; i < 5; i += 1) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r * 0.8).toFixed(1)},${(cy + Math.sin(a) * r * 0.8).toFixed(1)}`);
  }
  return circle(cx, cy, r, C.gold, stroked) + poly(pts.join(' '), 'none', { stroke: C.ink, 'stroke-width': 1.6 });
};

const EMBLEM = {
  wands: (x, y) => wand(x, y, 46),
  cups: (x, y) => cup(x, y, 0.78),
  swords: (x, y) => sword(x, y, 52),
  pentacles: (x, y) => pentacle(x, y, 14),
};

// Traditional pip arrangements, in card coordinates.
const PIP_LAYOUT = {
  1: [[100, 150]],
  2: [[100, 110], [100, 195]],
  3: [[100, 100], [68, 190], [132, 190]],
  4: [[68, 105], [132, 105], [68, 195], [132, 195]],
  5: [[66, 100], [134, 100], [100, 152], [66, 205], [134, 205]],
  6: [[66, 96], [134, 96], [66, 152], [134, 152], [66, 208], [134, 208]],
  7: [[66, 92], [134, 92], [66, 146], [134, 146], [100, 118], [66, 202], [134, 202]],
  8: [[64, 90], [136, 90], [64, 138], [136, 138], [64, 186], [136, 186], [64, 232], [136, 232]],
  9: [[64, 90], [136, 90], [64, 136], [136, 136], [100, 160], [64, 190], [136, 190], [64, 236], [136, 236]],
  10: [[64, 86], [136, 86], [64, 128], [136, 128], [100, 107], [100, 190], [64, 170], [136, 170], [64, 232], [136, 232]],
};

// Court emblems sit beside the figure rather than over it — a blade or wand
// drawn across the robe disappears into it at card size.
const COURT_SEAT = {
  11: (suit) => figure(88, 250, 130, C.green) + EMBLEM[suit](144, 182),
  12: (suit) =>
    path('M52 250 q10 -46 48 -46 q40 0 46 46 Z', C.white, stroked) +
    figure(94, 208, 108, C.red) + EMBLEM[suit](146, 166),
  13: (suit) => rect(54, 150, 84, 100, C.earth, stroked) + figure(96, 250, 136, C.blue, { crown: true }) + EMBLEM[suit](152, 184),
  14: (suit) => rect(48, 140, 96, 110, C.earth, stroked) + figure(92, 250, 142, C.red, { crown: true }) + EMBLEM[suit](154, 178),
};

// --- Major Arcana scenes ----------------------------------------------------

const MAJOR_SCENE = {
  0: () => sky() + ground(C.gold, 258) + mountains(258, C.violet) + sunDisc(152, 66, 13) + figure(92, 258, 126, C.gold, { arms: 'split' }) + circle(132, 250, 9, C.white, thin),
  1: () => sky(C.gold) + ground(C.green, 250) + rect(62, 214, 76, 14, C.earth, stroked) + figure(100, 214, 118, C.white, { arms: 'split' }) + el('text', { x: 100, y: 58, 'text-anchor': 'middle', 'font-size': 26, fill: C.ink }, '∞') + cup(74, 224, 0.4) + pentacle(126, 224, 8),
  2: () => rect(14, 22, W - 28, H - 70, C.night) + pillar(38, C.ink) + pillar(142, C.white) + figure(100, 250, 130, C.blue) + crescent(100, 244, 12),
  3: () => sky() + ground(C.gold, 240) + figure(100, 250, 124, C.white, { crown: true }) + star(100, 168, 9, 5, C.green) + circle(58, 262, 7, C.earth, thin) + circle(142, 262, 7, C.earth, thin),
  4: () => sky(C.red) + ground(C.earth, 254) + rect(60, 148, 80, 106, C.grey, stroked) + figure(100, 250, 124, C.red, { crown: true }),
  5: () => sky(C.grey) + ground(C.earth, 254) + pillar(40, C.grey) + pillar(140, C.grey) + figure(100, 250, 128, C.red, { crown: true, arms: 'up' }) + line(88, 262, 112, 262, C.gold, 4),
  6: () => sky() + ground(C.green, 258) + sunDisc(100, 58, 14) + figure(66, 258, 108, C.flesh) + figure(134, 258, 108, C.flesh) + path('M92 132 q8 -18 16 0 q-8 6 -16 0 Z', C.white, thin),
  7: () => sky() + ground(C.earth, 252) + rect(62, 176, 76, 58, C.grey, stroked) + figure(100, 176, 96, C.blue, { crown: true }) + circle(74, 246, 12, C.white, thin) + circle(126, 246, 12, C.night, thin),
  8: () => sky(C.gold) + ground(C.green, 254) + figure(84, 254, 122, C.white) + path('M118 254 q6 -40 32 -40 q22 0 22 40 Z', C.earth, stroked) + el('text', { x: 84, y: 118, 'text-anchor': 'middle', 'font-size': 22, fill: C.ink }, '∞'),
  9: () => rect(14, 22, W - 28, H - 70, C.night) + ground(C.white, 250) + figure(100, 250, 130, C.grey, { arms: 'split' }) + star(140, 162, 10, 6) + circle(140, 162, 16, 'none', { stroke: C.gold, 'stroke-width': 2 }),
  10: () => sky(C.night) + circle(100, 160, 58, C.gold, stroked) + circle(100, 160, 34, C.cream, thin) + circle(100, 160, 10, C.ink) + star(40, 62, 10, 4, C.white) + star(160, 62, 10, 4, C.white) + star(40, 258, 10, 4, C.white) + star(160, 258, 10, 4, C.white),
  11: () => sky(C.violet) + pillar(38, C.grey) + pillar(142, C.grey) + figure(100, 250, 126, C.red, { crown: true }) + sword(72, 176, 58) + line(112, 168, 150, 168, C.gold, 3) + circle(112, 180, 8, C.gold, thin) + circle(150, 180, 8, C.gold, thin),
  // The Hanged Man is drawn upright, then turned over as a group — a negative
  // figure height would produce invalid negative radii.
  12: () => sky() + ground(C.green, 262) + line(52, 96, 148, 96, C.earth, 7) + line(100, 96, 100, 132, C.earth, 7) +
    el('g', { transform: 'rotate(180 100 180)' }, figure(100, 228, 96, C.blue, { halo: true })),
  13: () => sky(C.grey) + ground(C.earth, 256) + sunDisc(100, 240, 10) + path('M46 256 q12 -48 54 -48 q42 0 46 48 Z', C.white, stroked) + figure(100, 208, 104, C.ink) + rect(140, 130, 3, 70, C.ink) + rect(143, 130, 34, 22, C.ink, thin),
  14: () => sky() + ground(C.green, 258) + figure(100, 258, 128, C.white, { halo: true, arms: 'out' }) + cup(64, 186, 0.55) + cup(136, 196, 0.55) + line(74, 186, 128, 198, C.blue, 3),
  15: () => rect(14, 22, W - 28, H - 70, C.ink) + figure(100, 226, 112, C.violet, { arms: 'up' }) + poly('84,140 76,116 94,128', C.grey, thin) + poly('116,140 124,116 106,128', C.grey, thin) + figure(58, 268, 74, C.flesh) + figure(142, 268, 74, C.flesh),
  16: () => rect(14, 22, W - 28, H - 70, C.night) + tower(78, 120, 44, 138) + poly('120,30 92,104 112,104 88,160 140,84 118,84 142,30', C.gold, thin) + poly('64,90 44,74 66,72', C.gold, thin) + circle(50, 200, 8, C.flesh, thin) + circle(152, 214, 8, C.flesh, thin),
  17: () => rect(14, 22, W - 28, H - 70, C.night) + star(100, 78, 20, 8) + star(48, 60, 8, 8, C.white) + star(152, 60, 8, 8, C.white) + star(60, 108, 7, 8, C.white) + star(142, 108, 7, 8, C.white) + rect(14, 244, W - 28, 48, C.blue) + figure(100, 250, 104, C.white, { arms: 'out' }),
  18: () => rect(14, 22, W - 28, H - 70, C.night) + circle(100, 76, 26, C.white, thin) + crescent(106, 76, 20, C.gold) + tower(36, 148, 34, 96) + tower(130, 148, 34, 96) + rect(88, 200, 24, 92, C.earth) + circle(100, 268, 12, C.blue, thin),
  19: () => sky(C.gold) + ground(C.green, 258) + sunDisc(100, 84, 32) + rect(14, 226, W - 28, 12, C.green, thin) + figure(100, 258, 96, C.red, { arms: 'out' }),
  20: () => sky(C.grey) + rect(14, 234, W - 28, 58, C.blue) + figure(100, 160, 108, C.white, { arms: 'out' }) + rect(56, 244, 88, 44, C.earth, stroked) + figure(100, 244, 62, C.grey, { arms: 'up' }),
  21: () => sky() + el('ellipse', { cx: 100, cy: 160, rx: 62, ry: 92, fill: 'none', stroke: C.green, 'stroke-width': 10 }) + figure(100, 226, 116, C.violet, { arms: 'split' }) + star(40, 54, 9, 4, C.gold) + star(160, 54, 9, 4, C.gold) + star(40, 266, 9, 4, C.gold) + star(160, 266, 9, 4, C.gold),
};

// --- card assembly ----------------------------------------------------------

// Smith's innovation was giving the pips full scenes. A plain emblem grid
// covers most of them, but the handful of cards people recognise by their
// picture rather than their count get a scene of their own.
const PIP_SCENE = {
  'swords-3': () => rect(14, 22, W - 28, H - 70, C.grey) +
    path('M100 210 q-44 -30 -44 -62 q0 -24 22 -24 q16 0 22 18 q6 -18 22 -18 q22 0 22 24 q0 32 -44 62 Z', C.red, stroked) +
    sword(100, 150, 120) + sword(100, 150, 120, 42) + sword(100, 150, 120, -42),
  'swords-9': () => rect(14, 22, W - 28, H - 70, C.night) +
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => sword(46 + (i % 3) * 8 + Math.floor(i / 3) * 4, 64 + i * 14, 108, 90)).join('') +
    rect(36, 212, 128, 80, C.cream, stroked) + rect(36, 236, 128, 56, C.red, stroked) +
    circle(66, 224, 15, C.flesh, thin),
  'wands-10': () => sky() + ground(C.green, 262) +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => wand(70 + (i % 5) * 15, 118 + Math.floor(i / 5) * 12, 70, -22 + (i % 5) * 9)).join('') +
    figure(100, 262, 108, C.red),
  'pentacles-5': () => rect(14, 22, W - 28, H - 70, C.night) + ground(C.white, 250) +
    rect(112, 66, 62, 132, C.gold, stroked) +
    [0, 1, 2, 3, 4].map((i) => pentacle(143, 90 + i * 26, 10)).join('') +
    figure(56, 250, 104, C.grey) + figure(90, 250, 90, C.earth) +
    line(40, 160, 34, 250, C.earth, 4),
  'cups-3': () => sky() + ground(C.green, 262) +
    figure(60, 262, 110, C.red) + figure(100, 262, 116, C.white) + figure(140, 262, 110, C.gold) +
    cup(60, 150, 0.6) + cup(100, 142, 0.6) + cup(140, 150, 0.6),
};

function scene(card) {
  if (card.arcana === 'major') return MAJOR_SCENE[card.number](card);
  if (PIP_SCENE[card.id]) return PIP_SCENE[card.id]();
  const base = sky(card.suit === 'swords' ? C.grey : C.sky) + ground(card.suit === 'pentacles' ? C.earth : C.green, 262);
  if (card.number > 10) return base + COURT_SEAT[card.number](card.suit);
  const emblem = EMBLEM[card.suit];
  return base + PIP_LAYOUT[card.number].map(([x, y]) => emblem(x, y)).join('');
}

function titleFor(card) {
  if (card.arcana === 'major') return card.name.toUpperCase();
  return `${card.rankLabel} of ${card.suitName}`.toUpperCase();
}

function numeralFor(card) {
  if (card.arcana === 'major') return card.roman;
  return card.isCourt ? '' : String(card.number);
}

/** Render one card face as a standalone SVG string. */
let faceSeq = 0;

export function cardSVG(card, { reversed = false, width = 200 } = {}) {
  // Inline SVGs share one document, so the clip path needs a unique id.
  const clipId = `face-${card.id}-${(faceSeq += 1)}`;
  const body = scene(card);
  const numeral = numeralFor(card);
  const inner = [
    rect(0, 0, W, H, C.cream, { rx: 10 }),
    rect(6, 6, W - 12, H - 12, 'none', { rx: 6, stroke: C.ink, 'stroke-width': 2 }),
    el('g', { 'clip-path': `url(#${clipId})` }, body),
    rect(14, 22, W - 28, H - 70, 'none', { stroke: C.ink, 'stroke-width': 2 }),
    numeral ? el('text', { x: W / 2, y: 18, 'text-anchor': 'middle', 'font-size': 13, 'font-family': 'Georgia, serif', fill: C.ink }, numeral) : '',
    el('text', { x: W / 2, y: H - 20, 'text-anchor': 'middle', 'font-size': 13, 'letter-spacing': 1.2, 'font-family': 'Georgia, serif', fill: C.ink }, titleFor(card)),
  ].join('');

  const defs = el('defs', {}, el('clipPath', { id: clipId }, rect(14, 22, W - 28, H - 70, '#fff')));
  const spin = reversed ? ` transform="rotate(180 ${W / 2} ${H / 2})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${width}" height="${(width * H) / W}" role="img" data-card="${card.id}" data-orientation="${reversed ? 'reversed' : 'upright'}" aria-label="${titleFor(card)}${reversed ? ', reversed' : ''}">${defs}<g${spin}>${inner}</g></svg>`;
}

/** The card back — the same for every card, so it gives nothing away. */
export function backSVG({ width = 200 } = {}) {
  const grid = [];
  for (let y = 30; y < H - 30; y += 26) {
    for (let x = 22; x < W - 20; x += 26) {
      grid.push(star(x, y, 7, 4, C.gold));
      grid.push(circle(x, y, 2.6, C.cream));
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${width}" height="${(width * H) / W}" role="img" aria-label="Face-down card">${rect(0, 0, W, H, C.night, { rx: 10 })}${rect(8, 8, W - 16, H - 16, 'none', { rx: 6, stroke: C.gold, 'stroke-width': 2 })}${el('g', { opacity: 0.85 }, grid.join(''))}</svg>`;
}

export const PALETTE = C;
