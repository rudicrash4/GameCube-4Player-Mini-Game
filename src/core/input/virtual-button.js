// Virtual Button (TDD 5.5). Disediakan untuk mini-game yang membutuhkan tombol aksi.
// Dummy Minigame belum memakainya.

export class VirtualButton {
  constructor({ container, playerId, name, color, style = {} }) {
    this.playerId = playerId;
    this.name = name;
    this.pointerId = null;
    this.pressed = false;
    this.enabled = true;

    this.el = document.createElement('div');
    this.el.className = 'vbtn';
    this.el.dataset.player = playerId;
    this.el.dataset.button = name;
    this.el.style.setProperty('--pc', color);
    Object.assign(this.el.style, style);
    container.append(this.el);

    this._ac = new AbortController();
    const opt = { signal: this._ac.signal };
    this.el.addEventListener('pointerdown', (e) => {
      if (!this.enabled || this.pointerId !== null) return;
      e.preventDefault();
      this.pointerId = e.pointerId;
      try { this.el.setPointerCapture(e.pointerId); } catch { /* noop */ }
      this._set(true);
    }, opt);
    const up = (e) => { if (e.pointerId === this.pointerId) this._release(); };
    this.el.addEventListener('pointerup', up, opt);
    this.el.addEventListener('pointercancel', up, opt);
    this.el.addEventListener('lostpointercapture', up, opt);
  }

  _set(v) { this.pressed = v; this.el.classList.toggle('is-pressed', v); }

  _release() {
    const id = this.pointerId;
    this.pointerId = null;
    if (id !== null) { try { this.el.releasePointerCapture(id); } catch { /* noop */ } }
    this._set(false);
  }

  reset() { this._release(); }
  setEnabled(v) { this.enabled = v; if (!v) this._release(); }
  destroy() { this._release(); this._ac.abort(); this.el.remove(); }
}
