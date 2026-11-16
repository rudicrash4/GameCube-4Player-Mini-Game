// Virtual Joystick (TDD 5.4 & 11.7). Dua lingkaran: outer (dasar) + inner (analog).
// Setiap instance memiliki pointerId sendiri -> multi-touch antar pemain tidak saling ganggu.

const DEADZONE = 0.08;

function hexToRgb(css) {
  const h = css.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

export class VirtualJoystick {
  /**
   * @param {{container:HTMLElement, playerId:string, color:string, position?:string}} opts
   *        color: CSS hex (#rrggbb); position: bl | br | tl | tr
   */
  constructor({ container, playerId, color, position = 'bl' }) {
    this.playerId = playerId;
    this.pointerId = null;
    this.enabled = true;

    // Nilai input: x kanan(+), y atas(+), magnitude 0..1 (sudah melewati deadzone)
    this.x = 0;
    this.y = 0;
    this.magnitude = 0;

    this._maxDist = 1;
    this._cx = 0;
    this._cy = 0;

    const [r, g, b] = hexToRgb(color);
    this.el = document.createElement('div');
    this.el.className = `vjoy vjoy--${position}`;
    this.el.dataset.player = playerId;
    this.el.style.setProperty('--pc', color);
    this.el.style.setProperty('--pc-soft', `rgba(${r},${g},${b},.28)`);
    this.el.style.setProperty('--pc-active', `rgba(${r},${g},${b},.5)`);

    this.outer = document.createElement('div');
    this.outer.className = 'vjoy__outer';
    this.inner = document.createElement('div');
    this.inner.className = 'vjoy__inner';
    this.el.append(this.outer, this.inner);
    container.append(this.el);

    this._ac = new AbortController();
    const opt = { signal: this._ac.signal };
    this.el.addEventListener('pointerdown', this._onDown, opt);
    this.el.addEventListener('pointermove', this._onMove, opt);
    this.el.addEventListener('pointerup', this._onUp, opt);
    this.el.addEventListener('pointercancel', this._onUp, opt);
    this.el.addEventListener('lostpointercapture', this._onUp, opt);
    this.el.addEventListener('contextmenu', (e) => e.preventDefault(), opt);
  }

  _onDown = (e) => {
    if (!this.enabled || this.pointerId !== null) return; // hanya satu pointer per joystick
    e.preventDefault();
    this.pointerId = e.pointerId;
    try { this.el.setPointerCapture(e.pointerId); } catch { /* pointer sintetis */ }
    this._measure();
    this.el.classList.add('is-active');
    this._move(e.clientX, e.clientY);
  };

  _onMove = (e) => {
    if (e.pointerId !== this.pointerId) return; // sentuhan lain diabaikan
    e.preventDefault();
    this._move(e.clientX, e.clientY);
  };

  _onUp = (e) => {
    if (e.pointerId !== this.pointerId) return;
    this._release();
  };

  _measure() {
    const o = this.outer.getBoundingClientRect();
    const i = this.inner.getBoundingClientRect();
    this._cx = o.left + o.width / 2;
    this._cy = o.top + o.height / 2;
    // Inner tidak boleh keluar dari outer: jarak maks = radius outer - radius inner.
    this._maxDist = Math.max(1, o.width / 2 - i.width / 2);
  }

  _move(clientX, clientY) {
    const dx = clientX - this._cx;
    const dy = clientY - this._cy;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, this._maxDist);
    const ux = dist > 0 ? dx / dist : 0;
    const uy = dist > 0 ? dy / dist : 0;

    // Posisi visual inner (dibatasi radius)
    this.inner.style.transform = `translate(-50%, -50%) translate(${ux * clamped}px, ${uy * clamped}px)`;

    // Nilai analog dengan deadzone, lalu dinormalisasi ke 0..1
    const raw = clamped / this._maxDist;
    const m = raw < DEADZONE ? 0 : (raw - DEADZONE) / (1 - DEADZONE);
    this.magnitude = m;
    this.x = ux * m;
    this.y = -uy * m; // layar: bawah(+) -> y atas(+)
  }

  _release() {
    const id = this.pointerId;
    this.pointerId = null;
    if (id !== null) {
      try { this.el.releasePointerCapture(id); } catch { /* sudah lepas */ }
    }
    this.reset();
  }

  /** Lepas pointer yang sedang dipakai dan kembalikan ke posisi netral. */
  release() { this._release(); }

  reset() {
    this.x = 0;
    this.y = 0;
    this.magnitude = 0;
    this.inner.style.transform = 'translate(-50%, -50%)';
    this.el.classList.remove('is-active');
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.el.classList.toggle('is-disabled', !enabled);
    if (!enabled) this._release();
  }

  destroy() {
    this._release();
    this._ac.abort(); // melepas seluruh event listener
    this.el.remove();
  }
}
