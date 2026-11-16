// Game Manager: state sesi (mode, susunan pemain). Tidak berisi gameplay.
import { MAX_PLAYERS, PLAYER_COLORS } from '../config.js';

export class GameManager {
  constructor() {
    this.mode = 'free-play'; // 'free-play' | 'match'
    this.players = [];
  }

  /**
   * Susun slot pemain. humanCount pemain manusia, sisanya bot (GDD 4.1).
   * Prototype: hanya humanCount = 4, jadi belum ada bot.
   */
  configurePlayers(humanCount) {
    const count = Math.max(1, Math.min(MAX_PLAYERS, humanCount));
    this.players = Array.from({ length: MAX_PLAYERS }, (_, slot) => ({
      slot,
      id: `P${slot + 1}`,
      name: `P${slot + 1}`,
      color: PLAYER_COLORS[slot].hex,
      colorCss: PLAYER_COLORS[slot].css,
      isBot: slot >= count,
    }));
    return this.players;
  }

  getPlayers() { return this.players; }
}
