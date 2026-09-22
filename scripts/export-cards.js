#!/usr/bin/env node
// Writes every card face to dist/cards/<id>.svg, plus the card back.
// Useful for printing a physical deck or dropping faces into other projects.

import { copyFile, mkdir, rename, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DECK } from '../src/data/deck.js';
import { cardSVG, backSVG } from '../src/js/art.js';

const out = new URL('../dist/cards/', import.meta.url);
const zip = new URL('../dist/cards.zip', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const zipNext = new URL(`../dist/cards-${process.pid}.zip`, import.meta.url);
const font = new URL('../src/fonts/PressStart2P-Regular.ttf', import.meta.url);
const run = promisify(execFile);
await mkdir(out, { recursive: true });

await Promise.all(
  DECK.map((card) => writeFile(new URL(`${card.id}.svg`, out), cardSVG(card, {
    width: 600,
    fontHref: 'PressStart2P-Regular.ttf',
  }))),
);
await Promise.all([
  writeFile(new URL('card-back.svg', out), backSVG({ width: 600 })),
  copyFile(font, new URL('PressStart2P-Regular.ttf', out)),
]);

// Ship a self-contained download: every SVG can load the adjacent font file.
// Build a fresh temporary archive so removed/renamed cards never remain inside.
await run('zip', ['-q', '-r', zipNext.pathname, 'cards'], { cwd: dist.pathname });
await rename(zipNext, zip);

process.stdout.write(`Exported ${DECK.length + 1} SVGs, font, and dist/cards.zip\n`);
