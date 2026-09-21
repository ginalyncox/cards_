import { DECK, SUITS, draw, byId } from '../data/deck.js';
import { SPREADS, spreadById } from '../data/spreads.js';
import { cardSVG, backSVG } from './art.js';
import { loadJournal, saveEntry, updateNote, removeEntry, clearJournal } from './journal.js';
import { LEARN_HTML } from './learn.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let current = null; // { spread, question, reversals, cards: [{card, reversed, revealed}] }

// --- navigation -------------------------------------------------------------

function showView(name) {
  $$('.view').forEach((v) => v.classList.toggle('hidden', v.dataset.view !== name));
  $$('.tab').forEach((t) => {
    if (t.dataset.view === name) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
  if (name === 'journal') renderJournal();
  if (window.location.hash.slice(1) !== name) window.location.hash = name;
}

$$('.tab').forEach((t) => t.addEventListener('click', () => showView(t.dataset.view)));

// --- reading ----------------------------------------------------------------

const spreadSelect = $('#spread');
spreadSelect.innerHTML = SPREADS.map((s) => `<option value="${s.id}">${s.name} (${s.positions.length})</option>`).join('');

function showBlurb() {
  const s = spreadById(spreadSelect.value);
  $('#spread-blurb').textContent = `${s.blurb} Cards land face down — tap each one to turn it.`;
}
spreadSelect.addEventListener('change', showBlurb);
showBlurb();

$('#draw-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const spread = spreadById(spreadSelect.value);
  const reversals = $('#reversals').checked;
  current = {
    spread,
    question: $('#question').value.trim(),
    reversals,
    cards: draw(spread.positions.length, { reversals }).map((d) => ({ ...d, revealed: false })),
  };
  renderBoard();
  $('#board-actions').classList.remove('hidden');
});

function renderBoard() {
  const board = $('#board');
  const { spread, cards } = current;
  board.style.gridTemplateColumns = `repeat(${spread.cols}, minmax(0, var(--card-w, 146px)))`;
  board.innerHTML = spread.positions
    .map((pos, i) => {
      const slot = cards[i];
      const face = slot.revealed
        ? cardSVG(slot.card, { reversed: slot.reversed })
        : backSVG();
      // The crossing card's own label is hidden behind it, so name the
      // position in the caption instead.
      const name = slot.revealed
        ? `${slot.card.name}${slot.reversed ? ' <span class="rev">reversed</span>' : ''}`
        : '';
      const caption = pos.cross && name ? `${pos.label} — ${name}` : name;
      return `<div class="slot${pos.cross ? ' cross' : ''}" style="grid-column:${pos.col};grid-row:${pos.row}">
        <p class="slot-label">${pos.label}</p>
        <button class="card-button" type="button" data-index="${i}"
          aria-label="${pos.label}: ${slot.revealed ? slot.card.name : 'face down, tap to reveal'}">${face}</button>
        <p class="caption">${caption}</p>
      </div>`;
    })
    .join('');
}

$('#board').addEventListener('click', (e) => {
  const btn = e.target.closest('.card-button');
  if (!btn || !current) return;
  const slot = current.cards[Number(btn.dataset.index)];
  if (!slot.revealed) {
    slot.revealed = true;
    renderBoard();
  } else {
    openCard(slot.card, slot.reversed, current.spread.positions[Number(btn.dataset.index)]);
  }
});

$('#reveal-all').addEventListener('click', () => {
  if (!current) return;
  current.cards.forEach((c) => { c.revealed = true; });
  renderBoard();
});

$('#save-reading').addEventListener('click', () => {
  if (!current) return;
  current.cards.forEach((c) => { c.revealed = true; });
  renderBoard();
  saveEntry({
    date: new Date().toISOString(),
    spreadId: current.spread.id,
    spreadName: current.spread.name,
    question: current.question,
    cards: current.cards.map((c, i) => ({
      id: c.card.id,
      name: c.card.name,
      reversed: c.reversed,
      position: current.spread.positions[i].label,
    })),
    note: '',
  });
  showView('journal');
});

// --- library ----------------------------------------------------------------

function matches(card, q, arcana) {
  if (arcana === 'major' && card.arcana !== 'major') return false;
  if (arcana && arcana !== 'major' && card.suit !== arcana) return false;
  if (!q) return true;
  const hay = [card.name, ...card.keywords, ...card.keywordsRev, card.upright, card.reversed, card.imagery]
    .join(' ')
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderLibrary() {
  const q = $('#search').value.trim();
  const arcana = $('#filter-arcana').value;
  const found = DECK.filter((c) => matches(c, q, arcana));
  $('#library-count').textContent = `${found.length} of ${DECK.length} cards`;
  $('#library').innerHTML = found
    .map(
      (c) => `<figure>
        <button class="card-button" type="button" data-id="${c.id}" aria-label="${c.name}">${cardSVG(c, { width: 146 })}</button>
        <figcaption>${c.name}</figcaption>
      </figure>`,
    )
    .join('');
}

$('#search').addEventListener('input', renderLibrary);
$('#filter-arcana').addEventListener('change', renderLibrary);
$('#library-form').addEventListener('submit', (e) => e.preventDefault());
$('#library').addEventListener('click', (e) => {
  const btn = e.target.closest('.card-button');
  if (btn) openCard(byId(btn.dataset.id), false);
});
renderLibrary();

// --- card detail ------------------------------------------------------------

const dialog = $('#card-dialog');
$('#card-dialog .close').addEventListener('click', () => dialog.close());

function openCard(card, reversed = false, position = null) {
  const facts = [
    card.arcana === 'major' ? `Major Arcana ${card.roman}` : `${card.suitName} — ${SUITS[card.suit].domain}`,
    `Element: ${card.element}`,
    card.astro ? `Astrology: ${card.astro}` : null,
    card.hebrew ? `Hebrew letter: ${card.hebrew}` : null,
  ].filter(Boolean);

  $('#dialog-body').innerHTML = `<div class="detail">
    <div class="art">${cardSVG(card, { reversed })}</div>
    <div>
      <h2>${card.name}${reversed ? ' <small>(reversed)</small>' : ''}</h2>
      <p class="sub">${facts.join(' &middot; ')}</p>
      ${position ? `<h3>Position: ${position.label}</h3><p>${position.meaning}</p>` : ''}
      <h3>${reversed ? 'Reversed keywords' : 'Keywords'}</h3>
      <ul class="chips">${(reversed ? card.keywordsRev : card.keywords).map((k) => `<li>${k}</li>`).join('')}</ul>
      <h3>Upright</h3><p>${card.upright}</p>
      <h3>Reversed</h3><p>${card.reversed}</p>
      <h3>In the picture</h3><p>${card.imagery}</p>
    </div>
  </div>`;
  dialog.showModal();
}

// --- journal ----------------------------------------------------------------

function renderJournal() {
  const entries = loadJournal();
  $('#journal-count').textContent = entries.length
    ? `${entries.length} saved reading${entries.length === 1 ? '' : 's'}`
    : 'No saved readings yet.';
  $('#journal').innerHTML = entries
    .map(
      (e) => `<article class="entry" data-id="${e.id}">
        <header>
          <h3>${e.spreadName}</h3>
          <time datetime="${e.date}">${new Date(e.date).toLocaleString()}</time>
        </header>
        ${e.question ? `<p><em>${escapeHTML(e.question)}</em></p>` : ''}
        <ol>${e.cards.map((c) => `<li><strong>${c.position}:</strong> ${c.name}${c.reversed ? ' (reversed)' : ''}</li>`).join('')}</ol>
        <textarea placeholder="What did this mean to you?" aria-label="Note">${escapeHTML(e.note || '')}</textarea>
        <div class="row">
          <button type="button" data-act="save">Save note</button>
          <button type="button" class="danger" data-act="delete">Delete</button>
        </div>
      </article>`,
    )
    .join('');
}

$('#journal').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const entry = btn.closest('.entry');
  const id = entry.dataset.id;
  if (btn.dataset.act === 'save') {
    updateNote(id, $('textarea', entry).value);
    btn.textContent = 'Saved';
    setTimeout(() => { btn.textContent = 'Save note'; }, 1400);
  } else if (window.confirm('Delete this reading?')) {
    removeEntry(id);
    renderJournal();
  }
});

$('#clear-journal').addEventListener('click', () => {
  if (window.confirm('Delete every saved reading? This cannot be undone.')) {
    clearJournal();
    renderJournal();
  }
});

$('#export-journal').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(loadJournal(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'tarot-journal.json' });
  a.click();
  URL.revokeObjectURL(url);
});

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// --- learn ------------------------------------------------------------------

$('#learn').innerHTML = LEARN_HTML;

// --- boot -------------------------------------------------------------------

const startView = window.location.hash.slice(1);
showView(['read', 'library', 'journal', 'learn'].includes(startView) ? startView : 'read');
