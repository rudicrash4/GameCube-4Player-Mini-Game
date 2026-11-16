// Asset Manager (TDD 5.9 & 16): cache JSON + resource ber-reference-count.

export class AssetManager {
  constructor() {
    this._json = new Map();     // url -> Promise<json> (aset global, tidak dibuang)
    this._entries = new Map();  // key -> { value, refs, dispose }
  }

  /** Muat JSON satu kali saja; pemanggilan berikutnya memakai cache. */
  loadJSON(url) {
    if (!this._json.has(url)) {
      const p = fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Gagal memuat aset "${url}" (HTTP ${res.status})`);
          return res.json();
        })
        .catch((err) => {
          this._json.delete(url);
          throw err;
        });
      this._json.set(url, p);
    }
    return this._json.get(url);
  }

  /** Ambil resource bersama (mis. geometri). Dibuat saat pertama kali diminta. */
  acquire(key, factory, dispose) {
    let entry = this._entries.get(key);
    if (!entry) {
      entry = { value: factory(), refs: 0, dispose };
      this._entries.set(key, entry);
    }
    entry.refs++;
    return entry.value;
  }

  /** Lepas satu reference; resource dibuang ketika tidak ada yang memakai lagi. */
  release(key) {
    const entry = this._entries.get(key);
    if (!entry) return;
    entry.refs--;
    if (entry.refs <= 0) {
      try { entry.dispose?.(entry.value); } catch (e) { console.error(e); }
      this._entries.delete(key);
    }
  }

  stats() {
    return { json: this._json.size, shared: this._entries.size };
  }
}
