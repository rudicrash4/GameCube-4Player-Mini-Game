// UI System: menampilkan satu layar pada satu waktu (memakai atribut hidden).

export class ScreenManager {
  constructor(root) {
    this.screens = new Map();
    root.querySelectorAll('[data-screen]').forEach((el) => this.screens.set(el.dataset.screen, el));
    this.current = null;
    this.onChange = null;
  }

  show(name) {
    if (!this.screens.has(name)) throw new Error(`Layar "${name}" tidak ada`);
    for (const [n, el] of this.screens) el.hidden = n !== name;
    this.current = name;
    this.onChange?.(name);
  }
}
