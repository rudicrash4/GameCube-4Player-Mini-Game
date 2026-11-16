// Input Manager (TDD 5.3). Menyimpan kanal input PER PEMAIN (bukan satu variabel global).

const NEUTRAL = Object.freeze({ x: 0, y: 0, magnitude: 0 });

export class InputManager {
  constructor() {
    this.enabled = true;
    this._joysticks = new Map(); // playerId -> VirtualJoystick
    this._buttons = new Map();   // `${playerId}:${name}` -> VirtualButton

    // Input harus bersih ketika aplikasi kehilangan fokus.
    this._ac = new AbortController();
    const opt = { signal: this._ac.signal };
    window.addEventListener('blur', () => this.resetAll(), opt);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.resetAll(); }, opt);
  }

  registerJoystick(playerId, joystick) {
    joystick.setEnabled(this.enabled);
    this._joysticks.set(playerId, joystick);
  }
  unregisterJoystick(playerId) { this._joysticks.delete(playerId); }

  registerButton(playerId, name, button) {
    button.setEnabled(this.enabled);
    this._buttons.set(`${playerId}:${name}`, button);
  }
  unregisterButton(playerId, name) { this._buttons.delete(`${playerId}:${name}`); }

  /** @returns {{x:number,y:number,magnitude:number}} nilai joystick pemain (x kanan+, y atas+). */
  getAxes(playerId) {
    if (!this.enabled) return NEUTRAL;
    return this._joysticks.get(playerId) ?? NEUTRAL;
  }

  isPressed(playerId, name) {
    return this.enabled && !!this._buttons.get(`${playerId}:${name}`)?.pressed;
  }

  /** Aktif/nonaktifkan seluruh input gameplay (dipakai Pause). */
  setEnabled(enabled) {
    this.enabled = enabled;
    for (const j of this._joysticks.values()) j.setEnabled(enabled);
    for (const b of this._buttons.values()) b.setEnabled(enabled);
  }

  resetAll() {
    for (const j of this._joysticks.values()) j.release();
    for (const b of this._buttons.values()) b.reset();
  }

  clear() {
    this._joysticks.clear();
    this._buttons.clear();
  }

  destroy() {
    this.clear();
    this._ac.abort();
  }
}
