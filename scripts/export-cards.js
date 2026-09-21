#!/usr/bin/env node
// Writes every card face to dist/cards/<id>.svg, plus the card back.
// Useful for printing a physical deck or dropping faces into other projects.

import { mkdir, writeFile } from 'node:fs/promises';
import { DECK } from '../src/data/deck.js';
import { cardSVG, backSVG } from '../src/js/art.js';

const out = new URL('../dist/cards/', import.meta.url);
await mkdir(out, { recursive: true });

await Promise.all(
  DECK.map((card) => writeFile(new URL(`${card.id}.svg`, out), cardSVG(card, { width: 600 }))),
);
await writeFile(new URL('card-back.svg', out), backSVG({ width: 600 }));

process.stdout.write(`Exported ${DECK.length + 1} SVGs to dist/cards/\n`);
