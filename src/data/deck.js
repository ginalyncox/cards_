// Assembles the full 78-card deck from the Major and Minor Arcana sources.

import { MAJORS } from './majors.js';
import { MINORS, SUITS, RANKS } from './minors.js';

const rankLabel = (r) => RANKS.find((x) => x.rank === r).label;

const majorCards = MAJORS.map((c) => ({
  id: `major-${c.num}`,
  name: c.name,
  arcana: 'major',
  suit: null,
  number: c.num,
  roman: ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
    'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'][c.num],
  element: c.element,
  astro: c.astro,
  hebrew: c.hebrew,
  keywords: c.keywords,
  keywordsRev: c.keywordsRev,
  upright: c.upright,
  reversed: c.reversed,
  imagery: c.imagery,
  yesno: c.yesno,
}));

const minorCards = Object.entries(MINORS).flatMap(([suitKey, cards]) =>
  cards.map((c) => ({
    id: `${suitKey}-${c.rank}`,
    name: `${rankLabel(c.rank)} of ${SUITS[suitKey].name}`,
    arcana: 'minor',
    suit: suitKey,
    suitName: SUITS[suitKey].name,
    number: c.rank,
    rankLabel: rankLabel(c.rank),
    isCourt: c.rank > 10,
    element: SUITS[suitKey].element,
    astro: null,
    keywords: c.keywords,
    keywordsRev: c.keywordsRev,
    upright: c.upright,
    reversed: c.reversed,
    imagery: c.imagery,
    yesno: null,
  })),
);

export const DECK = [...majorCards, ...minorCards];
export { SUITS, RANKS };

export const byId = (id) => DECK.find((c) => c.id === id);

/**
 * Fisher-Yates shuffle over a copy of the deck, using crypto randomness when
 * available so the draw is not a predictable PRNG sequence.
 */
export function shuffle(cards = DECK) {
  const out = cards.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomBelow(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomBelow(n) {
  const c = globalThis.crypto;
  if (c && c.getRandomValues) {
    // Rejection sampling keeps the distribution uniform across n.
    const limit = Math.floor(0x100000000 / n) * n;
    const buf = new Uint32Array(1);
    let v;
    do {
      c.getRandomValues(buf);
      [v] = buf;
    } while (v >= limit);
    return v % n;
  }
  return Math.floor(Math.random() * n);
}

/** Draw `count` distinct cards, optionally assigning reversals. */
export function draw(count, { reversals = true, pool = DECK } = {}) {
  return shuffle(pool)
    .slice(0, count)
    .map((card) => ({ card, reversed: reversals && randomBelow(2) === 1 }));
}
