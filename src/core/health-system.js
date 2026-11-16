// Health System (TDD 5.6). Mini-game menentukan nilai HP dan aturan perubahannya.

export class HealthSystem {
  constructor() {
    this._hp = new Map(); // id -> { hp, max }
    this.onChange = null; // (id, hp, max) => void
  }

  register(id, max = 100) { this._hp.set(id, { hp: max, max }); }
  get(id)     { return this._hp.get(id)?.hp ?? 0; }
  isDead(id)  { return this.get(id) <= 0; }
  damage(id, amount) { this._set(id, this.get(id) - amount); }
  heal(id, amount)   { this._set(id, this.get(id) + amount); }
  reset()            { this._hp.clear(); }

  _set(id, value) {
    const e = this._hp.get(id);
    if (!e) return;
    e.hp = Math.min(e.max, Math.max(0, value));
    this.onChange?.(id, e.hp, e.max);
  }
}
