// Reading journal, persisted to localStorage. Private to the browser — the app
// has no server and sends nothing anywhere.

const KEY = 'cards.journal.v1';

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Storage blocked (private mode, disabled cookies) or corrupt JSON.
    return [];
  }
}

function write(entries) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export const loadJournal = () => read().sort((a, b) => b.date.localeCompare(a.date));

export function saveEntry(entry) {
  const id = `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  write([{ id, ...entry }, ...read()]);
  return id;
}

export function updateNote(id, note) {
  write(read().map((e) => (e.id === id ? { ...e, note } : e)));
}

export function removeEntry(id) {
  write(read().filter((e) => e.id !== id));
}

export function clearJournal() {
  write([]);
}
