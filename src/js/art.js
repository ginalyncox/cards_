// Pixel card faces for the Wilds deck — original RWS scenes redrawn in a
// cartoony 16-bit adventure palette (verdant fields, temple stone, night caves).
// Not affiliated with any game franchise; no third-party sprites are used.

const W = 200;
const H = 340;
const S = 4; // logical pixel size in SVG units

const C = {
  cream: '#f0e6c8',
  parchment: '#e8d4a8',
  ink: '#1a1420',
  outline: '#0c0810',
  sky: '#6ec8f0',
  skyDeep: '#3a90c8',
  night: '#1a2850',
  nightDeep: '#0c1838',
  grass: '#48a838',
  grassDark: '#287820',
  leaf: '#70d040',
  dirt: '#c88040',
  dirtDark: '#905028',
  stone: '#8898a8',
  stoneDark: '#506070',
  sand: '#e8c878',
  gold: '#f0c030',
  goldBright: '#fff060',
  red: '#e03830',
  redDark: '#a01818',
  blue: '#3080e0',
  blueDark: '#1848a0',
  water: '#2890d0',
  waterDeep: '#186090',
  greenHero: '#28a828',
  greenDark: '#187018',
  tunic: '#38c838',
  flesh: '#f0c890',
  fleshDark: '#d09860',
  hair: '#c86820',
  white: '#f8f8f0',
  grey: '#a0a8b0',
  violet: '#7858b0',
  violetDark: '#483078',
  heart: '#e84868',
  rupee: '#40e880',
};

const el = (tag, attrs = {}, kids = '') => {
  const a = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `<${tag} ${a}>${kids}</${tag}>`;
};

const rect = (x, y, w, h, fill, extra = {}) => el('rect', { x, y, width: w, height: h, fill, ...extra });

/** One logical pixel (or a block of them) on the card grid. */
const px = (gx, gy, gw, gh, fill) => rect(gx * S, gy * S, gw * S, gh * S, fill);

/** Paint a row-string sprite. Digits/letters map through `palette`; `.` is skip; `,` is transparent skip. */
function sprite(ox, oy, rows, palette) {
  let out = '';
  rows.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      if (ch === '.' || ch === ' ') return;
      const fill = palette[ch];
      if (fill) out += px(ox + dx, oy + dy, 1, 1, fill);
    });
  });
  return out;
}

const frame = () =>
  rect(0, 0, W, H, C.cream) +
  rect(S, S, W - 2 * S, H - 2 * S, C.ink) +
  rect(2 * S, 2 * S, W - 4 * S, H - 4 * S, C.parchment);

const sceneBox = (fill) => px(4, 6, 42, 68, fill);

const groundBand = (gy = 52, fill = C.grass, dark = C.grassDark) =>
  px(4, gy, 42, 68 - gy, fill) + px(4, gy, 42, 1, dark);

const skyBand = (fill = C.sky) => px(4, 6, 42, 46, fill);

// --- tiny props -------------------------------------------------------------

const sun = (gx = 36, gy = 10) =>
  px(gx, gy, 6, 6, C.gold) +
  px(gx + 1, gy + 1, 4, 4, C.goldBright) +
  px(gx - 2, gy + 2, 2, 2, C.gold) +
  px(gx + 6, gy + 2, 2, 2, C.gold) +
  px(gx + 2, gy - 2, 2, 2, C.gold) +
  px(gx + 2, gy + 6, 2, 2, C.gold);

const moon = (gx = 34, gy = 10) =>
  px(gx, gy, 6, 6, C.white) +
  px(gx + 2, gy + 1, 4, 4, C.night);

const starPx = (gx, gy, fill = C.goldBright) =>
  px(gx + 1, gy, 1, 3, fill) + px(gx, gy + 1, 3, 1, fill);

const mountain = (gx, gy, w = 12, h = 10, fill = C.stoneDark) => {
  let out = '';
  for (let i = 0; i < h; i += 1) {
    const half = Math.floor(((i + 1) / h) * (w / 2));
    out += px(gx + Math.floor(w / 2) - half, gy + i, half * 2 + 1, 1, fill);
  }
  out += px(gx + Math.floor(w / 2) - 1, gy, 2, 2, C.white);
  return out;
};

const tree = (gx, gy) =>
  px(gx + 2, gy + 6, 2, 5, C.dirtDark) +
  px(gx, gy + 1, 6, 5, C.grassDark) +
  px(gx + 1, gy, 4, 2, C.leaf) +
  px(gx + 1, gy + 3, 4, 2, C.leaf);

const heart = (gx, gy) =>
  px(gx, gy + 1, 2, 2, C.heart) +
  px(gx + 3, gy + 1, 2, 2, C.heart) +
  px(gx, gy + 2, 5, 2, C.heart) +
  px(gx + 1, gy + 4, 3, 1, C.heart) +
  px(gx + 2, gy + 5, 1, 1, C.heart);

const gem = (gx, gy, fill = C.rupee) =>
  px(gx + 1, gy, 2, 1, fill) +
  px(gx, gy + 1, 4, 3, fill) +
  px(gx + 1, gy + 4, 2, 1, fill) +
  px(gx + 1, gy + 1, 1, 1, C.white);

/** Chunky adventurer in a green tunic — generic hero, not a franchise sprite. */
const hero = (gx, gy, { facing = 'front', hat = true, arm = 'down' } = {}) => {
  const P = {
    k: C.ink,
    s: C.flesh,
    d: C.fleshDark,
    g: C.tunic,
    G: C.greenDark,
    h: C.hair,
    c: C.greenHero,
    w: C.white,
    b: C.blueDark,
  };
  const rows = hat
    ? [
        '..kkk..',
        '.kccck.',
        'kkcccck',
        '.ksssk.',
        '..sss..',
        '.kgggk.',
        'kgggggk',
        'kg.g.gk',
        '.kgggk.',
        '.G...G.',
        '.b...b.',
        '.b...b.',
      ]
    : [
        '..hhh..',
        '.hsssh.',
        '.hsssh.',
        '..sss..',
        '.kgggk.',
        'kgggggk',
        'kg.g.gk',
        '.kgggk.',
        '.G...G.',
        '.b...b.',
        '.b...b.',
      ];
  let out = sprite(gx, gy, rows, P);
  if (arm === 'up') out += px(gx - 1, gy + 5, 1, 3, C.flesh) + px(gx + 7, gy + 5, 1, 3, C.flesh);
  if (arm === 'out') out += px(gx - 2, gy + 6, 2, 1, C.flesh) + px(gx + 7, gy + 6, 2, 1, C.flesh);
  if (facing === 'side') out += px(gx + 5, gy + 3, 1, 1, C.ink);
  return out;
};

const figureRobed = (gx, gy, robe, { crown = false, tall = 14 } = {}) => {
  let out = px(gx + 2, gy, 4, 3, C.flesh) + px(gx + 3, gy + 1, 1, 1, C.ink);
  if (crown) out += px(gx + 1, gy - 2, 6, 2, C.gold) + px(gx + 2, gy - 3, 1, 1, C.goldBright) + px(gx + 5, gy - 3, 1, 1, C.goldBright);
  out += px(gx, gy + 3, 8, tall - 5, robe) + px(gx + 1, gy + tall - 2, 2, 2, C.ink) + px(gx + 5, gy + tall - 2, 2, 2, C.ink);
  return out;
};

// --- suit emblems -----------------------------------------------------------

const wand = (gx, gy) =>
  px(gx + 1, gy, 1, 10, C.dirt) +
  px(gx, gy, 3, 2, C.leaf) +
  px(gx + 1, gy - 1, 1, 1, C.leaf);

const cup = (gx, gy) =>
  px(gx, gy, 5, 1, C.gold) +
  px(gx, gy + 1, 5, 4, C.gold) +
  px(gx + 1, gy + 5, 3, 1, C.gold) +
  px(gx + 2, gy + 6, 1, 2, C.gold) +
  px(gx + 1, gy + 8, 3, 1, C.gold) +
  px(gx + 1, gy + 2, 3, 2, C.goldBright);

const sword = (gx, gy) =>
  px(gx + 1, gy, 1, 9, C.grey) +
  px(gx + 1, gy, 1, 1, C.white) +
  px(gx, gy + 8, 3, 1, C.dirtDark) +
  px(gx + 1, gy + 9, 1, 2, C.dirtDark);

const pentacle = (gx, gy) =>
  px(gx + 1, gy, 4, 1, C.gold) +
  px(gx, gy + 1, 6, 4, C.gold) +
  px(gx + 1, gy + 5, 4, 1, C.gold) +
  px(gx + 2, gy + 2, 2, 2, C.dirtDark) +
  px(gx + 1, gy + 3, 1, 1, C.dirtDark) +
  px(gx + 4, gy + 3, 1, 1, C.dirtDark);

const EMBLEM = {
  wands: (x, y) => wand(x, y),
  cups: (x, y) => cup(x, y),
  swords: (x, y) => sword(x, y),
  pentacles: (x, y) => pentacle(x, y),
};

const PIP_LAYOUT = {
  1: [[22, 32]],
  2: [[22, 22], [22, 44]],
  3: [[22, 20], [14, 44], [30, 44]],
  4: [[14, 22], [30, 22], [14, 44], [30, 44]],
  5: [[14, 20], [30, 20], [22, 34], [14, 48], [30, 48]],
  6: [[14, 18], [30, 18], [14, 34], [30, 34], [14, 50], [30, 50]],
  7: [[14, 16], [30, 16], [22, 26], [14, 36], [30, 36], [14, 52], [30, 52]],
  8: [[14, 14], [30, 14], [14, 28], [30, 28], [14, 42], [30, 42], [14, 56], [30, 56]],
  9: [[14, 14], [30, 14], [14, 28], [30, 28], [22, 36], [14, 44], [30, 44], [14, 58], [30, 58]],
  10: [[14, 12], [30, 12], [14, 24], [30, 24], [22, 18], [22, 42], [14, 36], [30, 36], [14, 54], [30, 54]],
};

const COURT_SEAT = {
  11: (suit) => hero(14, 42, { hat: false }) + EMBLEM[suit](34, 36),
  12: (suit) => px(10, 50, 14, 4, C.dirt) + hero(12, 36) + EMBLEM[suit](34, 32),
  13: (suit) =>
    px(12, 36, 12, 18, C.stone) + px(14, 40, 3, 4, C.night) + figureRobed(16, 30, C.blue, { crown: true }) + EMBLEM[suit](34, 34),
  14: (suit) =>
    px(10, 34, 16, 20, C.stoneDark) + px(12, 38, 4, 5, C.night) + figureRobed(15, 28, C.red, { crown: true }) + EMBLEM[suit](34, 32),
};

// --- Major Arcana scenes ----------------------------------------------------

const MAJOR_SCENE = {
  0: () => skyBand() + groundBand(56, C.sand, C.dirt) + mountain(28, 28, 14, 12, C.violet) +
    sun(8, 10) + hero(16, 40, { arm: 'out' }) + px(28, 58, 3, 2, C.white) + gem(36, 48, C.rupee),
  1: () => skyBand(C.gold) + groundBand(54, C.grassDark, C.greenDark) +
    px(12, 48, 26, 4, C.dirtDark) + hero(18, 34, { hat: false, arm: 'up' }) +
    cup(10, 42) + wand(36, 38) + sword(8, 50) + pentacle(34, 50) +
    px(22, 12, 6, 2, C.goldBright) + px(20, 14, 2, 2, C.goldBright) + px(28, 14, 2, 2, C.goldBright),
  2: () => sceneBox(C.night) + px(8, 20, 4, 40, C.ink) + px(38, 20, 4, 40, C.white) +
    figureRobed(18, 28, C.blue, { tall: 22 }) + moon(22, 12) + starPx(10, 14) + starPx(34, 16, C.white),
  3: () => skyBand() + groundBand(50, C.sand, C.dirt) + tree(6, 40) + tree(38, 42) +
    figureRobed(18, 30, C.white, { crown: true, tall: 20 }) + heart(8, 28) + heart(36, 28) + sun(34, 10),
  4: () => skyBand(C.redDark) + groundBand(54, C.dirt, C.dirtDark) + mountain(4, 24, 16, 14, C.stoneDark) +
    mountain(30, 22, 14, 16, C.stone) + px(14, 34, 18, 20, C.stone) + figureRobed(18, 28, C.red, { crown: true }),
  5: () => skyBand(C.stone) + groundBand(54, C.dirt, C.dirtDark) +
    px(8, 18, 5, 36, C.stoneDark) + px(37, 18, 5, 36, C.stoneDark) +
    figureRobed(18, 26, C.violet, { crown: true, tall: 22 }) +
    px(20, 56, 8, 2, C.gold) + hero(8, 52, { hat: false }) + hero(34, 52, { hat: false }),
  6: () => skyBand() + groundBand(56) + sun(20, 8) +
    hero(10, 42, { hat: false }) + hero(28, 42, { hat: false }) +
    heart(20, 30) + tree(4, 44) + tree(40, 44),
  7: () => skyBand() + groundBand(56, C.dirt, C.dirtDark) +
    px(14, 38, 20, 14, C.stone) + px(16, 42, 4, 4, C.night) + px(28, 42, 4, 4, C.night) +
    figureRobed(18, 24, C.blue, { crown: true }) +
    px(10, 52, 6, 4, C.white) + px(32, 52, 6, 4, C.ink) + gem(22, 34, C.gold),
  8: () => skyBand(C.gold) + groundBand(54) + hero(12, 38, { arm: 'out' }) +
    px(28, 46, 10, 8, C.dirt) + px(30, 42, 6, 4, C.dirtDark) + px(32, 40, 2, 2, C.ink) +
    px(20, 12, 8, 2, C.goldBright) + heart(8, 24),
  9: () => sceneBox(C.nightDeep) + groundBand(54, C.stone, C.stoneDark) +
    figureRobed(18, 28, C.grey, { tall: 20 }) + starPx(34, 18) + starPx(10, 22, C.white) +
    lantern(22, 40),
  10: () => sceneBox(C.night) +
    px(16, 24, 18, 18, C.gold) + px(19, 27, 12, 12, C.parchment) + px(23, 31, 4, 4, C.ink) +
    starPx(8, 12, C.white) + starPx(38, 12, C.white) + starPx(8, 56, C.white) + starPx(38, 56, C.white) +
    gem(10, 34) + gem(36, 34, C.gold),
  11: () => skyBand(C.violet) + groundBand(54, C.stone, C.stoneDark) +
    px(8, 18, 4, 36, C.stoneDark) + px(38, 18, 4, 36, C.stoneDark) +
    figureRobed(18, 28, C.red, { crown: true }) + sword(12, 30) +
    px(28, 36, 6, 2, C.gold) + px(28, 40, 2, 2, C.gold) + px(32, 40, 2, 2, C.gold),
  12: () => skyBand() + groundBand(58) +
    px(12, 16, 26, 2, C.dirtDark) + px(24, 18, 2, 8, C.dirtDark) +
    el('g', { transform: `rotate(180 ${25 * S} ${40 * S})` }, hero(18, 28, { hat: false })) +
    gem(22, 18, C.goldBright),
  13: () => skyBand(C.stoneDark) + groundBand(54, C.dirtDark, C.ink) +
    sun(20, 48) + px(14, 40, 20, 10, C.white) + figureRobed(18, 22, C.ink, { tall: 18 }) +
    px(34, 24, 2, 16, C.ink) + px(36, 24, 8, 5, C.white) + flag(36, 24),
  14: () => skyBand() + groundBand(54) + figureRobed(18, 28, C.white, { tall: 20 }) +
    cup(10, 36) + cup(34, 38) + px(15, 40, 18, 1, C.water) + sun(34, 10) + gem(22, 18, C.gold),
  15: () => sceneBox(C.ink) + figureRobed(18, 22, C.violetDark, { tall: 18 }) +
    px(16, 18, 3, 3, C.grey) + px(29, 18, 3, 3, C.grey) +
    hero(8, 48, { hat: false }) + hero(32, 48, { hat: false }) +
    px(20, 42, 8, 2, C.red) + starPx(10, 12, C.red) + starPx(36, 12, C.red),
  16: () => sceneBox(C.nightDeep) +
    px(18, 22, 12, 32, C.stone) + px(16, 20, 16, 3, C.dirtDark) + px(20, 28, 3, 4, C.night) +
    bolt(28, 8) + bolt(10, 14) +
    px(10, 44, 4, 4, C.flesh) + px(36, 48, 4, 4, C.flesh),
  17: () => sceneBox(C.night) +
    starPx(22, 12, C.goldBright) + starPx(10, 16, C.white) + starPx(36, 14, C.white) +
    starPx(14, 26, C.white) + starPx(34, 26, C.gold) +
    px(4, 52, 42, 12, C.water) + px(4, 52, 42, 1, C.waterDeep) +
    hero(18, 40, { hat: false, arm: 'out' }) + gem(8, 56, C.rupee),
  18: () => sceneBox(C.nightDeep) + moon(20, 10) +
    px(8, 30, 8, 24, C.stoneDark) + px(34, 30, 8, 24, C.stoneDark) +
    px(22, 40, 6, 20, C.dirt) + px(20, 58, 10, 4, C.water) +
    px(22, 56, 3, 2, C.blue) + howl(14, 48) + howl(32, 50),
  19: () => skyBand(C.gold) + groundBand(54) + sun(18, 10) +
    px(4, 48, 42, 2, C.leaf) + hero(18, 40, { arm: 'out' }) +
    flower(8, 50) + flower(36, 52),
  20: () => skyBand(C.stone) + px(4, 50, 42, 14, C.water) +
    figureRobed(18, 18, C.white, { tall: 16 }) +
    px(14, 52, 20, 10, C.dirtDark) + hero(18, 48, { hat: false, arm: 'up' }) +
    starPx(10, 12, C.gold) + starPx(36, 12, C.gold),
  21: () => skyBand() + groundBand(58, C.leaf, C.grassDark) +
    px(10, 16, 30, 2, C.greenHero) + px(10, 16, 2, 40, C.greenHero) + px(38, 16, 2, 40, C.greenHero) + px(10, 54, 30, 2, C.greenHero) +
    hero(18, 34, { arm: 'up' }) +
    starPx(8, 10, C.gold) + starPx(38, 10, C.gold) + starPx(8, 60, C.gold) + starPx(38, 60, C.gold),
};

function lantern(gx, gy) {
  return px(gx, gy, 3, 4, C.gold) + px(gx + 1, gy + 1, 1, 2, C.goldBright) + px(gx + 1, gy - 2, 1, 2, C.dirtDark);
}

function bolt(gx, gy) {
  return px(gx, gy, 2, 2, C.goldBright) + px(gx - 1, gy + 2, 2, 2, C.gold) + px(gx, gy + 4, 2, 3, C.goldBright) +
    px(gx + 2, gy + 3, 2, 1, C.gold);
}

function flag(gx, gy) {
  return px(gx, gy, 8, 5, C.white) + px(gx + 1, gy + 1, 2, 2, C.red) + px(gx + 4, gy + 1, 2, 2, C.red);
}

function howl(gx, gy) {
  return px(gx, gy + 2, 4, 3, C.grey) + px(gx + 3, gy, 2, 3, C.grey) + px(gx + 4, gy + 1, 1, 1, C.ink);
}

function flower(gx, gy) {
  return px(gx + 1, gy, 1, 1, C.red) + px(gx, gy + 1, 3, 1, C.red) + px(gx + 1, gy + 2, 1, 2, C.grassDark);
}

// --- special pip scenes -----------------------------------------------------

const PIP_SCENE = {
  'swords-3': () => skyBand(C.stone) + groundBand(58, C.stoneDark, C.ink) +
    heart(20, 28) + sword(18, 18) + sword(24, 22) + sword(21, 36),
  'swords-9': () => sceneBox(C.nightDeep) +
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => sword(8 + (i % 3) * 12, 12 + Math.floor(i / 3) * 14)).join('') +
    px(12, 52, 24, 10, C.parchment) + px(14, 54, 6, 4, C.flesh) + heart(28, 56),
  'wands-10': () => skyBand() + groundBand(56) +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => wand(8 + (i % 5) * 7, 16 + Math.floor(i / 5) * 12)).join('') +
    hero(18, 42),
  'pentacles-5': () => sceneBox(C.night) + groundBand(54, C.stone, C.stoneDark) +
    px(28, 14, 14, 28, C.gold) + [0, 1, 2, 3, 4].map((i) => pentacle(30, 16 + i * 5)).join('') +
    hero(8, 42, { hat: false }) + hero(16, 46, { hat: false }),
  'cups-3': () => skyBand() + groundBand(56) +
    hero(8, 42, { hat: false }) + hero(18, 40) + hero(30, 42, { hat: false }) +
    cup(10, 28) + cup(20, 24) + cup(32, 28),
};

function scene(card) {
  if (card.arcana === 'major') return MAJOR_SCENE[card.number]();
  if (PIP_SCENE[card.id]) return PIP_SCENE[card.id]();
  const skyFill = card.suit === 'swords' ? C.stone : card.suit === 'cups' ? C.skyDeep : C.sky;
  const gFill = card.suit === 'pentacles' ? C.dirt : C.grass;
  const gDark = card.suit === 'pentacles' ? C.dirtDark : C.grassDark;
  const base = skyBand(skyFill) + groundBand(54, gFill, gDark);
  if (card.number > 10) return base + COURT_SEAT[card.number](card.suit);
  return base + PIP_LAYOUT[card.number].map(([x, y]) => EMBLEM[card.suit](x, y)).join('');
}

function titleFor(card) {
  if (card.arcana === 'major') return card.name.toUpperCase();
  return `${card.rankLabel} of ${card.suitName}`.toUpperCase();
}

function numeralFor(card) {
  if (card.arcana === 'major') return card.roman;
  return card.isCourt ? '' : String(card.number);
}

/** Pixel banner title — short names fit; longer ones shrink via letter-spacing. */
function titleText(label, y) {
  const size = label.length > 18 ? 7 : label.length > 12 ? 8 : 9;
  return el('text', {
    x: W / 2,
    y,
    'text-anchor': 'middle',
    'font-size': size,
    'font-family': "'Press Start 2P', monospace",
    fill: C.cream,
    'letter-spacing': label.length > 16 ? -0.4 : 0.5,
  }, label.length > 22 ? `${label.slice(0, 20)}…` : label);
}

let faceSeq = 0;

/** Render one card face as a standalone SVG string. */
export function cardSVG(card, { reversed = false, width = 200 } = {}) {
  const clipId = `face-${card.id}-${(faceSeq += 1)}`;
  const body = scene(card);
  const numeral = numeralFor(card);
  const inner = [
    frame(),
    el('g', { 'clip-path': `url(#${clipId})` }, body),
    // Pixel inset border around the art window
    px(4, 6, 42, 1, C.ink) + px(4, 73, 42, 1, C.ink) + px(4, 6, 1, 68, C.ink) + px(45, 6, 1, 68, C.ink),
    // Title plate
    px(4, 74, 42, 9, C.ink) + px(5, 75, 40, 7, C.greenDark),
    numeral
      ? el('text', {
        x: W / 2,
        y: 5 * S - 2,
        'text-anchor': 'middle',
        'font-size': 8,
        'font-family': "'Press Start 2P', monospace",
        fill: C.ink,
      }, numeral)
      : '',
    titleText(titleFor(card), H - 14),
  ].join('');

  const defs = el('defs', {}, el('clipPath', { id: clipId }, rect(4 * S, 6 * S, 42 * S, 68 * S, '#fff')));
  const spin = reversed ? ` transform="rotate(180 ${W / 2} ${H / 2})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${width}" height="${(width * H) / W}" role="img" data-card="${card.id}" data-orientation="${reversed ? 'reversed' : 'upright'}" aria-label="${titleFor(card)}${reversed ? ', reversed' : ''}" style="image-rendering:pixelated">${defs}<g${spin}>${inner}</g></svg>`;
}

/** The card back — overworld night with a glowing gem lattice. */
export function backSVG({ width = 200 } = {}) {
  const tiles = [];
  for (let y = 8; y < 78; y += 8) {
    for (let x = 6; x < 44; x += 8) {
      tiles.push(px(x, y, 5, 5, C.blueDark));
      tiles.push(px(x + 1, y + 1, 3, 3, C.night));
      tiles.push(gem(x + 1, y + 1, (x + y) % 16 === 0 ? C.gold : C.rupee));
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${width}" height="${(width * H) / W}" role="img" aria-label="Face-down card" style="image-rendering:pixelated">${rect(0, 0, W, H, C.nightDeep)}${px(2, 2, 46, 81, C.ink)}${px(3, 3, 44, 79, C.night)}${tiles.join('')}${px(3, 3, 44, 1, C.gold)}${px(3, 81, 44, 1, C.gold)}${px(3, 3, 1, 79, C.gold)}${px(46, 3, 1, 79, C.gold)}</svg>`;
}

export const PALETTE = C;
