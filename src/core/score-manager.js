// Score Manager (TDD 5.8).

export class ScoreManager {
  constructor() {
    this._scores = new Map();
  }

  add(playerId, points = 1)      { this._scores.set(playerId, this.get(playerId) + points); }
  subtract(playerId, points = 1) { this._scores.set(playerId, this.get(playerId) - points); }
  get(playerId)                  { return this._scores.get(playerId) ?? 0; }
  reset()                        { this._scores.clear(); }

  /** Hasil mini-game, diurutkan dari skor tertinggi. */
  getResults() {
    return [...this._scores.entries()]
      .map(([playerId, score]) => ({ playerId, score }))
      .sort((a, b) => b.score - a.score);
  }
}
