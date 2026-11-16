// Daftar slot mini-game. Prototype: hanya slot 1 (Dummy) yang memiliki modul.
// Modul dimuat malas (dynamic import) sehingga tiap mini-game tetap terpisah.

export const SLOT_COUNT = 16; // 4 kolom x 4 baris

export const MINIGAMES = [
  { slot: 1, id: 'dummy', title: 'Dummy', load: () => import('./dummy/index.js') },
];

export function getMinigameBySlot(slot) {
  return MINIGAMES.find((m) => m.slot === slot) ?? null;
}
