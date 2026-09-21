import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DECK, SUITS, draw, shuffle, byId } from '../src/data/deck.js';
import { SPREADS } from '../src/data/spreads.js';
import { cardSVG, backSVG, CARD_SIZE, FONT } from '../src/js/art.js';

test('the deck holds exactly 78 unique cards', () => {
  assert.equal(DECK.length, 78);
  assert.equal(new Set(DECK.map((c) => c.id)).size, 78);
  assert.equal(new Set(DECK.map((c) => c.name)).size, 78);
});

test('22 majors numbered 0-21 and 56 minors in four suits of 14', () => {
  const majors = DECK.filter((c) => c.arcana === 'major');
  assert.equal(majors.length, 22);
  assert.deepEqual(majors.map((c) => c.number).sort((a, b) => a - b), [...Array(22).keys()]);

  for (const suit of Object.keys(SUITS)) {
    const cards = DECK.filter((c) => c.suit === suit);
    assert.equal(cards.length, 14, `${suit} should have 14 cards`);
    assert.deepEqual(cards.map((c) => c.number), [...Array(14).keys()].map((n) => n + 1));
    assert.equal(cards.filter((c) => c.isCourt).length, 4);
  }
});

test('every card carries complete interpretive text', () => {
  for (const card of DECK) {
    assert.ok(card.keywords.length >= 3, `${card.name} keywords`);
    assert.ok(card.keywordsRev.length >= 3, `${card.name} reversed keywords`);
    assert.ok(card.upright.length > 60, `${card.name} upright meaning`);
    assert.ok(card.reversed.length > 40, `${card.name} reversed meaning`);
    assert.ok(card.imagery.length > 40, `${card.name} imagery`);
    assert.ok(card.element, `${card.name} element`);
  }
});

test('byId finds cards and returns undefined for nonsense', () => {
  assert.equal(byId('major-13').name, 'Death');
  assert.equal(byId('cups-14').name, 'King of Cups');
  assert.equal(byId('nope'), undefined);
});

test('shuffle keeps every card exactly once', () => {
  const s = shuffle();
  assert.equal(s.length, 78);
  assert.equal(new Set(s.map((c) => c.id)).size, 78);
});

test('draws never repeat a card within one reading', () => {
  for (let i = 0; i < 200; i += 1) {
    const hand = draw(10);
    assert.equal(new Set(hand.map((d) => d.card.id)).size, 10);
  }
});

test('reversals can be switched off', () => {
  const hand = draw(78, { reversals: false });
  assert.ok(hand.every((d) => d.reversed === false));
});

test('reversals appear roughly half the time when enabled', () => {
  const hand = draw(78, { reversals: true });
  const reversed = hand.filter((d) => d.reversed).length;
  // Generous bounds: this only needs to catch a stuck flag, not prove fairness.
  assert.ok(reversed > 15 && reversed < 63, `got ${reversed} reversals of 78`);
});

test('every spread has enough positions to draw and valid grid slots', () => {
  for (const s of SPREADS) {
    assert.ok(s.positions.length > 0 && s.positions.length <= 78);
    for (const p of s.positions) {
      assert.ok(p.label && p.meaning, `${s.id} position text`);
      assert.ok(p.col >= 1 && p.col <= s.cols, `${s.id} ${p.label} column fits`);
      assert.ok(p.row >= 1);
    }
  }
});

test('every card renders to well-formed SVG, upright and reversed', () => {
  for (const card of DECK) {
    for (const reversed of [false, true]) {
      const svg = cardSVG(card, { reversed });
      assert.match(svg, /^<svg xmlns=/);
      assert.ok(svg.endsWith('</svg>'));
      assert.equal((svg.match(/<svg/g) || []).length, 1);
      assert.ok(svg.includes('role="img"') && svg.includes('aria-label'));
      assert.ok(svg.includes(`data-orientation="${reversed ? 'reversed' : 'upright'}"`));
      const centre = `rotate(180 ${CARD_SIZE.width / 2} ${CARD_SIZE.height / 2})`;
      assert.equal(svg.includes(centre), reversed);
    }
  }
});

test('card faces are self-contained, with no shared document ids', () => {
  // Every face is inlined into one page, so an id or url() reference would
  // collide across cards.
  for (const card of DECK) {
    const svg = cardSVG(card);
    assert.ok(!svg.includes(' id="'), `${card.name} declares an id`);
    assert.ok(!svg.includes('url(#'), `${card.name} references an id`);
  }
});

test('faces render as hard-edged pixels', () => {
  for (const card of DECK) {
    const svg = cardSVG(card);
    assert.ok(svg.includes('shape-rendering="crispEdges"'), `${card.name} is not crisp`);
    assert.ok(!svg.includes('gradient'), `${card.name} uses a gradient`);
  }
});

test('the card back is identical for every card', () => {
  assert.equal(backSVG(), backSVG());
  assert.ok(!backSVG().includes('rotate(180'));
});

test('no card face emits invalid geometry', () => {
  const numeric = /(?:\s(?:r|rx|ry|width|height)=")(-?[\d.]+)"/g;
  for (const card of DECK) {
    const svg = cardSVG(card);
    assert.ok(!svg.includes('NaN') && !svg.includes('undefined'), `${card.name} has an unresolved value`);
    for (const [, value] of svg.matchAll(numeric)) {
      assert.ok(Number(value) >= 0, `${card.name} has a negative length or radius: ${value}`);
    }
  }
});

test('every card title fits inside the card', () => {
  // The pixel font has no fallback, so an over-long line would run off the
  // card edge rather than wrapping or shrinking.
  for (const card of DECK) {
    const svg = cardSVG(card);
    for (const [, x, w] of svg.matchAll(/<rect x="(-?\d+)" y="\d+" width="(\d+)"/g)) {
      assert.ok(Number(x) >= 0, `${card.name} paints left of the card edge`);
      assert.ok(Number(x) + Number(w) <= CARD_SIZE.width, `${card.name} paints past the right edge`);
    }
  }
});

test('the pixel font covers every character used on a card', () => {
  const used = new Set();
  for (const card of DECK) {
    const title = (card.arcana === 'major' ? card.name : `${card.rankLabel} of ${card.suitName}`).toUpperCase();
    const numeral = card.arcana === 'major' ? card.roman : String(card.number);
    [...title, ...numeral].forEach((ch) => used.add(ch));
  }
  for (const ch of used) {
    assert.ok(FONT[ch], `no glyph for ${JSON.stringify(ch)}`);
  }
});
