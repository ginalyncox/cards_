# Cards

A complete Rider-Waite-Smith tarot deck and companion app, drawn as 8-bit pixel
art. Seventy-eight cards with meanings, spreads and a private reading journal.

No build step, no dependencies, no server, no network calls. Open it and read.

## Run it

```bash
npm start          # serves at http://localhost:8080
```

Any static file server works — the app is plain ES modules. You can also host
`index.html` and `src/` on GitHub Pages or any static host as-is.

## What's in it

**The deck.** All 78 cards: 22 Major Arcana and four suits of 14. Every card
carries keywords, an upright reading, a reversed reading, its element, and a
description of what is in the picture. Majors also carry their astrological and
Hebrew-letter attributions.

**The art.** Every card face is painted onto a 20x26 grid of chunky pixels in
the flat, limited-palette style of an NES adventure game, then emitted as SVG
rectangles (runs of one colour merged into a single rect) so it stays crisp at
any size. Titles and numerals use a hand-built 4x5 pixel font. The Major
Arcana, the sixteen court cards and the best-known pips are drawn as scenes;
the remaining pips show their suit emblem in the traditional counting
arrangement. Export the whole deck with `npm run build:cards`, which writes
`dist/cards/*.svg`.

**Six spreads.** Daily Card, Past/Present/Future, Situation/Action/Outcome,
Horseshoe, Celtic Cross and Year Ahead. Cards deal face down; tap to turn each
one, tap again for the full reading in context of its position.

**Reversals.** On by default, switchable per draw. Reversed cards rotate and
show their reversed keywords.

**Library.** Browse or search all 78 by name, keyword or meaning, filtered by
arcana or suit.

**Journal.** Save a reading, add a note, come back to it. Entries live in your
browser's local storage and are exportable as JSON. Nothing is uploaded
anywhere — there is nowhere for it to go.

## Layout

```
index.html              the whole app shell
src/data/majors.js      22 Major Arcana
src/data/minors.js      56 Minor Arcana, by suit
src/data/deck.js        assembles the deck; shuffle and draw
src/data/spreads.js     spread layouts and position meanings
src/js/art.js           pixel canvas, sprites, font, card faces and back
src/js/app.js           views, reading board, library, journal wiring
src/js/journal.js       localStorage persistence
src/js/learn.js         reference text for the Learn tab
src/css/app.css         styles
scripts/serve.js        dependency-free static server
scripts/export-cards.js writes every card to dist/cards/*.svg
test/deck.test.js       deck integrity, draw behaviour and render checks
```

## Tests

```bash
npm test
```

Covers deck completeness (78 unique cards, correct suit and rank structure),
that every card has full interpretive text, that draws never repeat a card,
that reversals can be switched off, that spread positions fit their grids, that
every card renders to valid, hard-edged SVG in both orientations, that no title
paints past the card edge, and that the pixel font has a glyph for every
character a card uses.

## Shuffling

Draws use a Fisher-Yates shuffle over `crypto.getRandomValues` with rejection
sampling, so the distribution is uniform and the order is not a predictable
PRNG sequence. It falls back to `Math.random` only where crypto is unavailable.

## Licence

MIT — see [LICENSE](LICENSE).

The card meanings and the pixel art are original work by Gina Lyn Cox, written
and drawn in the Rider-Waite-Smith tradition. The original 1909 plates by
Pamela Colman Smith are public domain in the United States; no scans of them
are distributed here, and copyright status varies by country.

## A note on scope

This is for reflection and entertainment. It is not medical, legal, financial
or mental-health advice. If something in your life is urgent, please talk to a
qualified professional rather than a deck of cards.
