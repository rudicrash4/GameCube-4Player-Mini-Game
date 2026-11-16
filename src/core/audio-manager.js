// Audio Manager (TDD 5.10). Prototype belum memiliki aset audio, jadi manager
// ini hanya menyediakan API dasar berbasis HTMLAudioElement.

export class AudioManager {
  constructor() {
    this.muted = false;
    this._sounds = new Map();
  }

  register(id, url, { loop = false, volume = 1 } = {}) {
    const a = new Audio(url);
    a.loop = loop;
    a.volume = volume;
    a.preload = 'auto';
    this._sounds.set(id, a);
  }

  play(id) {
    const a = this._sounds.get(id);
    if (!a || this.muted) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  stop(id) {
    const a = this._sounds.get(id);
    if (a) { a.pause(); a.currentTime = 0; }
  }

  stopAll() { for (const id of this._sounds.keys()) this.stop(id); }

  setMuted(m) { this.muted = !!m; if (m) this.stopAll(); }

  /** Hentikan & buang audio. Dipanggil ketika mini-game dihentikan. */
  dispose() { this.stopAll(); this._sounds.clear(); }
}
