// Menu Minigames: 4 slot per baris, scroll vertikal, hanya tombol Kembali (tanpa top navigation bar).
import { SLOT_COUNT, getMinigameBySlot } from '../minigames/registry.js';

const NS = 'http://www.w3.org/2000/svg';

// Preview dummy: bentuk sederhana, warna solid (tanpa gradasi).
const DUMMY_BG = ['#4cc9f0', '#ff9f1c', '#6bd66b', '#c77dff', '#ff6b6b', '#2ec4b6'];
const DUMMY_FG = ['#11131c', '#ffffff'];

function svg(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function buildPreview(slot, active) {
  const root = svg('svg', { viewBox: '0 0 80 60', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
  if (active) {
    // Pratinjau Dummy: papan catur abu-abu & putih
    root.append(svg('rect', { width: 80, height: 60, fill: '#f5f5f5' }));
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 0) root.append(svg('rect', { x: c * 10, y: r * 10, width: 10, height: 10, fill: '#9e9e9e' }));
      }
    }
    root.append(svg('rect', { x: 34, y: 20, width: 12, height: 20, rx: 2, fill: '#e53935', stroke: '#11131c', 'stroke-width': 2 }));
    return root;
  }
  const bg = DUMMY_BG[slot % DUMMY_BG.length];
  const fg = DUMMY_FG[slot % DUMMY_FG.length];
  root.append(svg('rect', { width: 80, height: 60, fill: bg }));
  const shape = slot % 3;
  if (shape === 0) root.append(svg('circle', { cx: 40, cy: 30, r: 14, fill: fg }));
  else if (shape === 1) root.append(svg('rect', { x: 26, y: 16, width: 28, height: 28, rx: 4, fill: fg }));
  else root.append(svg('polygon', { points: '40,14 56,44 24,44', fill: fg }));
  return root;
}

export function initMinigameSelectScreen({ root, onBack, onSelect }) {
  const grid = root.querySelector('#slot-grid');
  root.querySelector('#btn-minigames-back').addEventListener('click', onBack);

  for (let slot = 1; slot <= SLOT_COUNT; slot++) {
    const entry = getMinigameBySlot(slot);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot';
    btn.dataset.slot = String(slot);
    btn.disabled = !entry; // prototype: hanya slot 1 yang dapat dipilih
    btn.setAttribute('aria-label', `Slot ${slot}`);

    const num = document.createElement('span');
    num.className = 'slot__num';
    num.textContent = String(slot);
    btn.append(buildPreview(slot, !!entry), num);
    if (entry) btn.addEventListener('click', () => onSelect(entry));
    grid.append(btn);
  }
}
