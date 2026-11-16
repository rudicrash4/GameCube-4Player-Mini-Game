// Player Selection: P1..P4. Prototype: hanya P4 yang aktif.
import { PLAYER_COLORS } from '../config.js';

const AVAILABLE_COUNTS = new Set([4]);

export function initPlayerSelectScreen({ root, onBack, onSelect }) {
  const row = root.querySelector('#player-row');
  root.querySelector('#btn-players-back').addEventListener('click', onBack);

  for (let count = 1; count <= 4; count++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'player-btn';
    btn.dataset.count = String(count);
    btn.style.background = PLAYER_COLORS[count - 1].css;
    btn.disabled = !AVAILABLE_COUNTS.has(count);

    const label = document.createElement('span');
    label.textContent = `P${count}`;
    const dots = document.createElement('span');
    dots.className = 'player-btn__dots';
    for (let i = 0; i < count; i++) dots.append(document.createElement('i'));
    btn.append(label, dots);

    if (!btn.disabled) btn.addEventListener('click', () => onSelect(count));
    row.append(btn);
  }
}
