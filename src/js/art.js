// Card faces drawn as 8-bit pixel art.
//
// Everything on a card is painted onto a 20x26 grid of chunky pixels, in the
// flat, hard-edged, limited-palette style of an NES adventure game: solid
// colour backgrounds, squat big-headed figures, no gradients and no
// anti-aliasing. Pixels are emitted as SVG rectangles (runs of the same colour
// merged into one rect) so the cards stay crisp at any size.

const COLS = 20;
const ROWS = 26;
const PX = 8; // units per pixel

const CARD_W = 24 * PX; // 192
const CARD_H = 40 * PX; // 320
const ART_X = 2 * PX;
const ART_Y = 4 * PX;

const PAL = {
  0: '#101018', // outline
  w: '#fcfcfc',
  k: '#bcbcbc',
  K: '#6c6c74',
  f: '#fcd8a8', // skin
  r: '#f83800',
  R: '#a81000',
  o: '#fc9838',
  y: '#f8c838', // gold
  Y: '#fcfc98', // pale yellow
  g: '#20a820',
  G: '#106810',
  b: '#5cbcfc', // day sky
  B: '#0058f8',
  N: '#182058', // night
  t: '#e4a05c', // sand
  T: '#883000', // wood
  p: '#c840c8',
  P: '#6844fc',
  c: '#f8e0b0', // card stock
};

const TRANSPARENT = '_';

// --- pixel canvas -----------------------------------------------------------

const canvas = (bg = TRANSPARENT) => Array.from({ length: ROWS }, () => Array(COLS).fill(bg));

function fill(cv, x, y, w, h, ch) {
  for (let j = Math.max(0, y); j < Math.min(ROWS, y + h); j += 1) {
    for (let i = Math.max(0, x); i < Math.min(COLS, x + w); i += 1) cv[j][i] = ch;
  }
}

/** Paint a sprite at (x, y). `subs` swaps placeholder chars for palette keys. */
function stamp(cv, sprite, x, y, subs = {}) {
  sprite.forEach((row, j) => {
    [...row].forEach((raw, i) => {
      const ch = subs[raw] ?? raw;
      if (ch === TRANSPARENT) return;
      const px = x + i;
      const py = y + j;
      if (px >= 0 && px < COLS && py >= 0 && py < ROWS) cv[py][px] = ch;
    });
  });
}

/** Turn the grid into SVG rects, merging horizontal runs of one colour. */
function paint(cv) {
  const out = [];
  for (let j = 0; j < ROWS; j += 1) {
    let i = 0;
    while (i < COLS) {
      const ch = cv[j][i];
      let run = 1;
      while (i + run < COLS && cv[j][i + run] === ch) run += 1;
      if (ch !== TRANSPARENT && PAL[ch]) {
        out.push(`<rect x="${ART_X + i * PX}" y="${ART_Y + j * PX}" width="${run * PX}" height="${PX}" fill="${PAL[ch]}"/>`);
      }
      i += run;
    }
  }
  return out.join('');
}

// --- 4x5 pixel font --------------------------------------------------------
// Three pixels wide is too narrow to keep U/V/W/M apart, so glyphs are four
// wide with one pixel of tracking.

const GLYPH_W = 4;
const ADVANCE = GLYPH_W + 1;

const FONT = {
  A: ['0110', '1001', '1111', '1001', '1001'], B: ['1110', '1001', '1110', '1001', '1110'],
  C: ['0111', '1000', '1000', '1000', '0111'], D: ['1110', '1001', '1001', '1001', '1110'],
  E: ['1111', '1000', '1110', '1000', '1111'], F: ['1111', '1000', '1110', '1000', '1000'],
  G: ['0111', '1000', '1011', '1001', '0111'], H: ['1001', '1001', '1111', '1001', '1001'],
  I: ['1110', '0100', '0100', '0100', '1110'], J: ['0011', '0001', '0001', '1001', '0110'],
  K: ['1001', '1010', '1100', '1010', '1001'], L: ['1000', '1000', '1000', '1000', '1111'],
  M: ['1111', '1111', '1001', '1001', '1001'], N: ['1001', '1101', '1011', '1001', '1001'],
  O: ['0110', '1001', '1001', '1001', '0110'], P: ['1110', '1001', '1110', '1000', '1000'],
  Q: ['0110', '1001', '1001', '1011', '0111'], R: ['1110', '1001', '1110', '1010', '1001'],
  S: ['0111', '1000', '0110', '0001', '1110'], T: ['1111', '0100', '0100', '0100', '0100'],
  U: ['1001', '1001', '1001', '1001', '1111'], V: ['1001', '1001', '1001', '1001', '0110'],
  W: ['1001', '1001', '1111', '1111', '0110'], X: ['1001', '1001', '0110', '1001', '1001'],
  Y: ['1001', '1001', '0110', '0100', '0100'], Z: ['1111', '0001', '0110', '1000', '1111'],
  0: ['0110', '1001', '1001', '1001', '0110'], 1: ['0010', '0110', '0010', '0010', '0111'],
  2: ['1110', '0001', '0110', '1000', '1111'], 3: ['1110', '0001', '0110', '0001', '1110'],
  4: ['1001', '1001', '1111', '0001', '0001'], 5: ['1111', '1000', '1110', '0001', '1110'],
  6: ['0110', '1000', '1110', '1001', '0110'], 7: ['1111', '0001', '0010', '0100', '0100'],
  8: ['0110', '1001', '0110', '1001', '0110'], 9: ['0110', '1001', '0111', '0001', '0110'],
  ' ': ['0000', '0000', '0000', '0000', '0000'], '-': ['0000', '0000', '1111', '0000', '0000'],
};

const textWidth = (s, scale) => (s.length * ADVANCE - 1) * scale;

/** Draw a string in the pixel font, centred on `cx`, top at `y`. */
function pixelText(s, cx, y, scale, colour) {
  const x0 = Math.round(cx - textWidth(s, scale) / 2);
  const out = [];
  [...s].forEach((chRaw, n) => {
    const glyph = FONT[chRaw] || FONT[' '];
    glyph.forEach((row, j) => {
      let i = 0;
      while (i < GLYPH_W) {
        if (row[i] === '1') {
          let run = 1;
          while (i + run < GLYPH_W && row[i + run] === '1') run += 1;
          out.push(`<rect x="${x0 + n * ADVANCE * scale + i * scale}" y="${y + j * scale}" width="${run * scale}" height="${scale}" fill="${colour}"/>`);
          i += run;
        } else i += 1;
      }
    });
  });
  return out.join('');
}

/** Greedy wrap onto at most two lines of `max` characters. */
function wrap(s, max) {
  const lines = [''];
  for (const word of s.split(' ')) {
    const line = lines[lines.length - 1];
    if (!line) lines[lines.length - 1] = word;
    else if (line.length + 1 + word.length <= max) lines[lines.length - 1] = `${line} ${word}`;
    else lines.push(word);
  }
  return lines.slice(0, 2);
}

// --- sprites ----------------------------------------------------------------
// 'C' is a placeholder for the robe colour, swapped in at stamp time.

const S = {
  figure: [
    '__0000__', '_0ffff0_', '_0f00f0_', '_0ffff0_', '__CCCC__', '_fCCCCf_',
    '_fCCCCf_', '__CCCC__', '__CCCC__', '__CCCC__', '__C__C__', '__T__T__',
  ],
  figureUp: [
    'f_0000_f', 'f0ffff0f', 'f0f00f0f', '_0ffff0_', '__CCCC__', '__CCCC__',
    '__CCCC__', '__CCCC__', '__CCCC__', '__CCCC__', '__C__C__', '__T__T__',
  ],
  figureOut: [
    '__0000__', '_0ffff0_', '_0f00f0_', '_0ffff0_', 'f_CCCC_f', 'ffCCCCff',
    '__CCCC__', '__CCCC__', '__CCCC__', '__CCCC__', '__C__C__', '__T__T__',
  ],
  figureHung: [
    '__T__T__', '__C__C__', '__CCCC__', '__CCCC__', '__CCCC__', '_fCCCCf_',
    '_fCCCCf_', '__CCCC__', '_0ffff0_', '_0f00f0_', '_0ffff0_', '__0000__',
  ],
  skeleton: [
    '__0000__', '_0wwww0_', '_0w00w0_', '_0wwww0_', '__KKKK__', '_wKKKKw_',
    '_wKKKKw_', '__KKKK__', '__KKKK__', '__KKKK__', '__K__K__', '__0__0__',
  ],
  child: ['_0000_', '0ffff0', '0f00f0', '_CCCC_', 'fCCCCf', '_CCCC_', '_C__C_', '_0__0_'],
  crown: ['y_yy_y', 'yyyyyy'],
  horns: ['p_____p', 'pp___pp'],
  wings: ['w_______w', 'ww_____ww', 'www___www'],
  sun: [
    '_Y__Y__Y_', '__yyyyy__', '_yyyyyyy_', 'Yyy0y0yyY', '_yyyyyyy_',
    'Yyy000yyY', '_yyyyyyy_', '__yyyyy__', '_Y__Y__Y_',
  ],
  moon: ['__ww__', '_www__', 'ww____', 'ww____', 'ww____', 'ww____', '_www__', '__ww__'],
  fullMoon: ['_wwww_', 'wwwwww', 'ww0w0w', 'wwwwww', 'ww000w', '_wwww_'],
  star: ['__Y__', '_YYY_', 'YYYYY', '_YYY_', '__Y__'],
  bigStar: ['___Y___', '_Y_Y_Y_', '__YYY__', 'YYYYYYY', '__YYY__', '_Y_Y_Y_', '___Y___'],
  tower: [
    'k_kk_kk_', 'kkkkkkkk', '0KkkkkK0', '_KkrrkK_', '_KkkkkK_', '_KkkkkK_',
    '_KkrrkK_', '_KkkkkK_', '_KkkkkK_', '_KkkkkK_', '_KkrrkK_', '_KkkkkK_',
    '_KkkkkK_', '0KkkkkK0',
  ],
  cup: ['_yyyyy_', 'yyyyyyy', '_0yyy0_', '__yyy__', '___y___', '___y___', '_yyyyy_', 'yyyyyyy'],
  sword: ['__k__', '__k__', '_kkk_', '_kkk_', '_kkk_', '_kkk_', '_kkk_', '_kkk_', 'TTTTT', '__T__', '__T__', '__y__'],
  wand: ['g_g', 'gTg', '_T_', '_T_', '_T_', '_T_', '_T_', '_T_', '_T_', '_T_', '_T_'],
  pentacle: ['_yyyyy_', 'yy000yy', 'y00y00y', 'y0yyy0y', 'yy0y0yy', 'y0y_y0y', '_yyyyy_'],
  wandS: ['_g_g_', '__T__', '__T__', '__T__', '__T__', '__T__'],
  cupS: ['yyyyy', 'yyyyy', '_yyy_', '__y__', '__y__', 'yyyyy'],
  swordS: ['__k__', '__k__', '_kkk_', '_kkk_', 'TTTTT', '__T__'],
  pentS: ['_yyy_', 'yy0yy', 'y0y0y', 'yy0yy', 'y0_0y', '_yyy_'],
  tree: ['__ggg__', '_ggggg_', 'ggggggg', '_ggggg_', 'ggggggg', '__TTT__', '__TTT__'],
  lion: ['_oo____oo_', 'oooooooooo', 'oo0oooo0oo', 'oooooooooo', '_ooo00ooo_', '__oooooo__', '__o0__0o__'],
  horse: ['__________w_', '_________www', '_wwwwwwwww0w', 'wwwwwwwwwwww', 'wwwwwwwwwww_', '_w_ww__ww_w_', '_w_ww__ww_w_', '_0_00__00_0_'],
  dog: ['w_w___', 'wwwww_', 'wwwwww', 'w_w_w_', '0_0_0_'],
  wheel: [
    '___yyyyy___', '_yyyyyyyyy_', '_yyy000yyy_', 'yyy00000yyy', 'yyy00y00yyy',
    'yyy0yyy0yyy', 'yyy00y00yyy', 'yyy00000yyy', '_yyy000yyy_', '_yyyyyyyyy_',
    '___yyyyy___',
  ],
  heart: ['_rr___rr_', 'rrrrrrrrr', 'rrrrrrrrr', 'rrrrrrrrr', '_rrrrrrr_', '__rrrrr__', '___rrr___', '____r____'],
  scales: ['_____0_____', '00000000000', '0___0____0_', '0___0____0_', 'yyy_0__yyy_', '_y__0___y__'],
  bolt: ['___YY', '__YY_', '_YY__', 'YYYY_', '__YY_', '_YY__', 'YY___'],
  chest: ['TTTTTTTT', 'TyyyyyyT', 'TTTTTTTT', 'TTTyyTTT', 'TTTTTTTT'],
};

const mountains = (cv, y, ch) => {
  const peaks = [[0, 4], [5, 6], [12, 5], [16, 4]];
  for (const [x, h] of peaks) {
    for (let j = 0; j < h; j += 1) {
      fill(cv, x + (h - j) - 1, y + j, (j + 1) * 2, 1, ch);
    }
  }
  fill(cv, 0, y + 6, COLS, 1, ch);
};

const pillars = (cv, ch1, ch2) => {
  fill(cv, 1, 2, 3, 22, ch1);
  fill(cv, 16, 2, 3, 22, ch2);
};

// --- Major Arcana scenes ----------------------------------------------------

const MAJOR_SCENE = {
  0: (cv) => { fill(cv, 0, 0, COLS, 20, 'b'); fill(cv, 0, 20, COLS, 6, 't'); mountains(cv, 13, 'P'); stamp(cv, S.sun, 10, 1); stamp(cv, S.figureUp, 3, 12, { C: 'y' }); stamp(cv, S.dog, 13, 19); },
  1: (cv) => { fill(cv, 0, 0, COLS, 21, 'y'); fill(cv, 0, 21, COLS, 5, 'g'); stamp(cv, S.star, 8, 1); stamp(cv, S.figureUp, 6, 8, { C: 'w' }); fill(cv, 3, 20, 14, 1, 'T'); stamp(cv, S.cupS, 4, 14); stamp(cv, S.pentS, 12, 14); },
  2: (cv) => { fill(cv, 0, 0, COLS, ROWS, 'N'); pillars(cv, '0', 'w'); stamp(cv, S.figure, 6, 9, { C: 'B' }); stamp(cv, S.moon, 7, 1); },
  3: (cv) => { fill(cv, 0, 0, COLS, 18, 'b'); fill(cv, 0, 18, COLS, 8, 'y'); stamp(cv, S.tree, 0, 11); stamp(cv, S.tree, 13, 11); stamp(cv, S.figure, 6, 11, { C: 'w' }); stamp(cv, S.crown, 7, 9); },
  4: (cv) => { fill(cv, 0, 0, COLS, 21, 'R'); fill(cv, 0, 21, COLS, 5, 'T'); fill(cv, 4, 7, 12, 14, 'K'); stamp(cv, S.figure, 6, 11, { C: 'r' }); stamp(cv, S.crown, 7, 9); },
  5: (cv) => { fill(cv, 0, 0, COLS, 21, 'k'); fill(cv, 0, 21, COLS, 5, 'T'); pillars(cv, 'K', 'K'); stamp(cv, S.figureUp, 6, 8, { C: 'r' }); stamp(cv, S.crown, 7, 6); stamp(cv, S.child, 1, 18, { C: 'w' }); stamp(cv, S.child, 13, 18, { C: 'w' }); },
  6: (cv) => { fill(cv, 0, 0, COLS, 21, 'b'); fill(cv, 0, 21, COLS, 5, 'g'); stamp(cv, S.sun, 6, 0); stamp(cv, S.tree, 0, 10); stamp(cv, S.tree, 13, 10); stamp(cv, S.figure, 3, 12, { C: 'f' }); stamp(cv, S.figure, 10, 12, { C: 'f' }); },
  7: (cv) => { fill(cv, 0, 0, COLS, 20, 'b'); fill(cv, 0, 20, COLS, 6, 't'); fill(cv, 4, 15, 12, 7, 'K'); stamp(cv, S.figure, 6, 6, { C: 'B' }); stamp(cv, S.crown, 7, 4); fill(cv, 2, 22, 5, 3, 'w'); fill(cv, 13, 22, 5, 3, '0'); },
  8: (cv) => { fill(cv, 0, 0, COLS, 20, 'Y'); fill(cv, 0, 20, COLS, 6, 'g'); stamp(cv, S.figure, 2, 10, { C: 'w' }); stamp(cv, S.lion, 9, 14); stamp(cv, S.star, 4, 5); },
  9: (cv) => { fill(cv, 0, 0, COLS, 21, 'N'); fill(cv, 0, 21, COLS, 5, 'w'); stamp(cv, S.figure, 5, 10, { C: 'K' }); stamp(cv, S.bigStar, 12, 9); },
  10: (cv) => { fill(cv, 0, 0, COLS, ROWS, 'N'); stamp(cv, S.wheel, 4, 8); stamp(cv, S.star, 1, 1); stamp(cv, S.star, 14, 1); stamp(cv, S.star, 1, 20); stamp(cv, S.star, 14, 20); },
  11: (cv) => { fill(cv, 0, 0, COLS, ROWS, 'P'); pillars(cv, 'k', 'k'); stamp(cv, S.figure, 6, 11, { C: 'r' }); stamp(cv, S.crown, 7, 9); stamp(cv, S.scales, 5, 4); },
  12: (cv) => { fill(cv, 0, 0, COLS, 21, 'b'); fill(cv, 0, 21, COLS, 5, 'g'); fill(cv, 3, 1, 14, 1, 'T'); fill(cv, 9, 2, 1, 3, 'T'); stamp(cv, S.figureHung, 6, 5, { C: 'B' }); },
  13: (cv) => { fill(cv, 0, 0, COLS, 21, 'k'); fill(cv, 0, 21, COLS, 5, 'T'); stamp(cv, S.horse, 3, 15); stamp(cv, S.skeleton, 5, 5); fill(cv, 14, 3, 1, 8, '0'); fill(cv, 15, 3, 4, 4, '0'); },
  14: (cv) => { fill(cv, 0, 0, COLS, 21, 'b'); fill(cv, 0, 21, COLS, 5, 'g'); stamp(cv, S.figureOut, 6, 11, { C: 'w' }); stamp(cv, S.wings, 5, 15); stamp(cv, S.cupS, 1, 14); stamp(cv, S.cupS, 14, 16); },
  15: (cv) => { fill(cv, 0, 0, COLS, ROWS, '0'); stamp(cv, S.figure, 6, 6, { C: 'p' }); stamp(cv, S.horns, 6, 4); stamp(cv, S.child, 1, 18, { C: 'R' }); stamp(cv, S.child, 13, 18, { C: 'R' }); fill(cv, 6, 18, 8, 1, 'k'); },
  16: (cv) => { fill(cv, 0, 0, COLS, ROWS, 'N'); stamp(cv, S.tower, 6, 10); stamp(cv, S.bolt, 8, 1); stamp(cv, S.child, 0, 15, { C: 'B' }); stamp(cv, S.child, 14, 18, { C: 'r' }); },
  17: (cv) => { fill(cv, 0, 0, COLS, 21, 'N'); fill(cv, 0, 21, COLS, 5, 'B'); stamp(cv, S.bigStar, 6, 1); stamp(cv, S.star, 1, 3); stamp(cv, S.star, 14, 3); stamp(cv, S.star, 3, 9); stamp(cv, S.star, 15, 9); stamp(cv, S.figureOut, 6, 11, { C: 'w' }); },
  18: (cv) => { fill(cv, 0, 0, COLS, ROWS, 'N'); stamp(cv, S.fullMoon, 7, 1); stamp(cv, S.tower, 0, 9); stamp(cv, S.tower, 12, 9); fill(cv, 9, 9, 2, 17, 't'); stamp(cv, S.dog, 7, 21); },
  19: (cv) => { fill(cv, 0, 0, COLS, 20, 'b'); fill(cv, 0, 20, COLS, 6, 'g'); stamp(cv, S.sun, 6, 1); fill(cv, 0, 17, COLS, 2, 'G'); stamp(cv, S.child, 7, 15, { C: 'r' }); },
  20: (cv) => { fill(cv, 0, 0, COLS, 20, 'k'); fill(cv, 0, 20, COLS, 6, 'B'); stamp(cv, S.figureOut, 6, 4, { C: 'w' }); stamp(cv, S.wings, 5, 8); stamp(cv, S.child, 1, 18, { C: 'k' }); stamp(cv, S.child, 13, 18, { C: 'k' }); },
  21: (cv) => { fill(cv, 0, 0, COLS, ROWS, 'b'); fill(cv, 4, 4, 12, 18, 'g'); fill(cv, 4, 4, 2, 2, 'b'); fill(cv, 14, 4, 2, 2, 'b'); fill(cv, 4, 20, 2, 2, 'b'); fill(cv, 14, 20, 2, 2, 'b'); fill(cv, 6, 6, 8, 14, 'b'); stamp(cv, S.figureUp, 6, 8, { C: 'p' }); stamp(cv, S.star, 0, 0); stamp(cv, S.star, 15, 0); stamp(cv, S.star, 0, 21); stamp(cv, S.star, 15, 21); },
};

// --- Minor Arcana -----------------------------------------------------------

const EMBLEM = { wands: S.wandS, cups: S.cupS, swords: S.swordS, pentacles: S.pentS };
const BIG_EMBLEM = { wands: S.wand, cups: S.cup, swords: S.sword, pentacles: S.pentacle };

const PIP_POS = {
  1: [[7, 10]],
  2: [[7, 4], [7, 15]],
  3: [[7, 2], [2, 13], [12, 13]],
  4: [[2, 4], [12, 4], [2, 15], [12, 15]],
  5: [[2, 3], [12, 3], [7, 10], [2, 17], [12, 17]],
  6: [[2, 2], [12, 2], [2, 10], [12, 10], [2, 18], [12, 18]],
  7: [[2, 1], [12, 1], [7, 7], [2, 13], [12, 13], [2, 19], [12, 19]],
  8: [[2, 1], [12, 1], [2, 7], [12, 7], [2, 13], [12, 13], [2, 19], [12, 19]],
  9: [[2, 1], [12, 1], [2, 7], [12, 7], [7, 10], [2, 13], [12, 13], [2, 19], [12, 19]],
  10: [[2, 1], [12, 1], [7, 4], [2, 7], [12, 7], [2, 13], [12, 13], [7, 16], [2, 19], [12, 19]],
};

const SUIT_BG = {
  wands: ['b', 't'],
  cups: ['b', 'g'],
  swords: ['K', 'G'],
  pentacles: ['b', 'T'],
};

const COURT = {
  11: (cv, suit) => { stamp(cv, S.figure, 3, 11, { C: 'g' }); stamp(cv, BIG_EMBLEM[suit], 13, 10); },
  12: (cv, suit) => { stamp(cv, S.horse, 2, 17); stamp(cv, S.figure, 3, 6, { C: 'r' }); stamp(cv, BIG_EMBLEM[suit], 14, 5); },
  13: (cv, suit) => { fill(cv, 2, 8, 10, 15, 'T'); stamp(cv, S.figure, 3, 11, { C: 'B' }); stamp(cv, S.crown, 4, 9); stamp(cv, BIG_EMBLEM[suit], 13, 10); },
  14: (cv, suit) => { fill(cv, 1, 7, 12, 16, 'T'); stamp(cv, S.figure, 3, 11, { C: 'r' }); stamp(cv, S.crown, 4, 9); stamp(cv, BIG_EMBLEM[suit], 14, 9); },
};

// Smith's innovation was giving the pips full scenes. A plain emblem grid
// covers most of them; the ones people recognise by picture get their own.
const PIP_SCENE = {
  'swords-3': (cv) => { fill(cv, 0, 0, COLS, ROWS, 'K'); stamp(cv, S.heart, 5, 9); stamp(cv, S.sword, 3, 7); stamp(cv, S.sword, 8, 6); stamp(cv, S.sword, 13, 7); },
  'swords-9': (cv) => {
    fill(cv, 0, 0, COLS, ROWS, 'N');
    for (let i = 0; i < 9; i += 1) fill(cv, 3 + (i % 3), 1 + i * 2, 14 - (i % 3), 1, 'k');
    fill(cv, 2, 19, 16, 7, 'w'); fill(cv, 2, 22, 16, 4, 'r'); fill(cv, 4, 17, 4, 3, 'f');
  },
  'wands-10': (cv) => {
    fill(cv, 0, 0, COLS, 21, 'b'); fill(cv, 0, 21, COLS, 5, 'g');
    for (let i = 0; i < 10; i += 1) fill(cv, 4 + (i % 5) * 2, 5 + Math.floor(i / 5) * 2, 1, 8, 'T');
    stamp(cv, S.figure, 6, 14, { C: 'r' });
  },
  'pentacles-5': (cv) => {
    fill(cv, 0, 0, COLS, 21, 'N'); fill(cv, 0, 21, COLS, 5, 'w');
    fill(cv, 12, 2, 7, 16, 'y');
    for (let i = 0; i < 5; i += 1) stamp(cv, S.pentS, 13, 2 + i * 3);
    stamp(cv, S.figure, 1, 12, { C: 'K' }); stamp(cv, S.child, 8, 17, { C: 'T' });
  },
  'cups-3': (cv) => {
    fill(cv, 0, 0, COLS, 21, 'b'); fill(cv, 0, 21, COLS, 5, 'g');
    stamp(cv, S.figure, 0, 12, { C: 'r' }); stamp(cv, S.figure, 6, 11, { C: 'w' }); stamp(cv, S.figure, 12, 12, { C: 'y' });
    stamp(cv, S.cupS, 1, 5); stamp(cv, S.cupS, 7, 4); stamp(cv, S.cupS, 13, 5);
  },
};

// --- card assembly ----------------------------------------------------------

function scene(card) {
  const cv = canvas();
  if (card.arcana === 'major') {
    MAJOR_SCENE[card.number](cv);
    return cv;
  }
  if (PIP_SCENE[card.id]) {
    PIP_SCENE[card.id](cv);
    return cv;
  }
  const [skyCh, groundCh] = SUIT_BG[card.suit];
  fill(cv, 0, 0, COLS, 22, skyCh);
  fill(cv, 0, 22, COLS, 4, groundCh);
  if (card.number > 10) COURT[card.number](cv, card.suit);
  else for (const [x, y] of PIP_POS[card.number]) stamp(cv, EMBLEM[card.suit], x, y);
  return cv;
}

const titleFor = (card) => (card.arcana === 'major' ? card.name : `${card.rankLabel} of ${card.suitName}`).toUpperCase();
const numeralFor = (card) => {
  if (card.arcana === 'major') return card.roman;
  return card.isCourt ? '' : String(card.number);
};

/** Render one card face as a standalone SVG string. */
export function cardSVG(card, { reversed = false, width = 200 } = {}) {
  const title = titleFor(card);
  const numeral = numeralFor(card);
  const lines = wrap(title, 11);
  const titleTop = CARD_H - 4 * PX - lines.length * 18 + 2;

  const frame = [
    `<rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="${PAL.c}"/>`,
    `<rect x="${PX}" y="${PX}" width="${CARD_W - 2 * PX}" height="${CARD_H - 2 * PX}" fill="none" stroke="${PAL[0]}" stroke-width="${PX / 2}"/>`,
    `<rect x="${ART_X - PX / 2}" y="${ART_Y - PX / 2}" width="${COLS * PX + PX}" height="${ROWS * PX + PX}" fill="${PAL[0]}"/>`,
  ].join('');

  const body = paint(scene(card));
  // Scale 3 keeps the glyphs clear of the art window's frame at y = 28.
  const numeralText = numeral ? pixelText(numeral, CARD_W / 2, PX + 4, 3, PAL[0]) : '';
  const titleText = lines
    .map((ln, i) => pixelText(ln, CARD_W / 2, titleTop + i * 18, 3, PAL[0]))
    .join('');

  const spin = reversed ? ` transform="rotate(180 ${CARD_W / 2} ${CARD_H / 2})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="${width}" height="${Math.round((width * CARD_H) / CARD_W)}" shape-rendering="crispEdges" role="img" data-card="${card.id}" data-orientation="${reversed ? 'reversed' : 'upright'}" aria-label="${title}${reversed ? ', reversed' : ''}"><g${spin}>${frame}${body}${numeralText}${titleText}</g></svg>`;
}

/** The card back — identical for every card, so it gives nothing away. */
export function backSVG({ width = 200 } = {}) {
  const cv = canvas('N');
  for (let y = 1; y < ROWS - 2; y += 5) {
    for (let x = 1; x < COLS - 2; x += 5) {
      stamp(cv, S.star, x, y, {});
    }
  }
  const frame = [
    `<rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="${PAL.c}"/>`,
    `<rect x="${PX}" y="${PX}" width="${CARD_W - 2 * PX}" height="${CARD_H - 2 * PX}" fill="none" stroke="${PAL[0]}" stroke-width="${PX / 2}"/>`,
    `<rect x="${ART_X - PX / 2}" y="${ART_Y - PX / 2}" width="${COLS * PX + PX}" height="${ROWS * PX + PX}" fill="${PAL[0]}"/>`,
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="${width}" height="${Math.round((width * CARD_H) / CARD_W)}" shape-rendering="crispEdges" role="img" aria-label="Face-down card"><g>${frame}${paint(cv)}${pixelText('CARDS', CARD_W / 2, CARD_H - 5 * PX, 3, PAL[0])}</g></svg>`;
}

export const PALETTE = PAL;
export const CARD_SIZE = { width: CARD_W, height: CARD_H };
export { FONT };
