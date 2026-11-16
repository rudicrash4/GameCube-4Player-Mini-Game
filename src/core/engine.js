// Core Engine (TDD 3, 4, 7): shared renderer, game loop, lifecycle mini-game.
// Tidak berisi gameplay mini-game apa pun.
import * as THREE from 'three';
import { AssetManager } from './asset-manager.js';
import { AudioManager } from './audio-manager.js';
import { GameManager } from './game-manager.js';
import { ScoreManager } from './score-manager.js';
import { HealthSystem } from './health-system.js';
import { InputManager } from './input/input-manager.js';
import { ControlManager } from './input/control-manager.js';
import { PlayerSystem } from './player/player-system.js';

export class Engine {
  /** @param {{canvas:HTMLCanvasElement, controlsRoot:HTMLElement}} opts */
  constructor({ canvas, controlsRoot }) {
    this.canvas = canvas;
    this.controlsRoot = controlsRoot;
    this.renderer = null;
    this.game = null;
    this.state = 'idle'; // idle | running | paused
    this.currentEntry = null;
    this.currentSetup = null;
    this.size = { width: 1, height: 1 };
    this._raf = 0;
    this._last = 0;
    this._busy = false;
  }

  async init() {
    try {
      // Satu shared renderer untuk seluruh aplikasi (tidak dibuat ulang tiap mini-game).
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      throw new Error(`WebGL tidak tersedia di perangkat/browser ini: ${err.message}`);
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.assetManager = new AssetManager();
    this.audioManager = new AudioManager();
    this.gameManager = new GameManager();
    this.scoreManager = new ScoreManager();
    this.healthSystem = new HealthSystem();
    this.inputManager = new InputManager();
    this.controlManager = new ControlManager({ root: this.controlsRoot, inputManager: this.inputManager });
    this.playerManager = new PlayerSystem({ assetManager: this.assetManager });

    this.assetReport = await this.playerManager.load();
    this.resize();
    return this.assetReport;
  }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.size = { width, height };
    this.renderer.setSize(width, height, false);
    this.game?.resize?.(width, height);
  }

  _buildContext(setup) {
    return {
      renderer: this.renderer,
      assetManager: this.assetManager,
      inputManager: this.inputManager,
      audioManager: this.audioManager,
      playerManager: this.playerManager,
      controlManager: this.controlManager,
      scoreManager: this.scoreManager,
      healthSystem: this.healthSystem,
      gameManager: this.gameManager,
      config: { players: setup.players },
      getViewport: () => this.size,
    };
  }

  // ---------- Lifecycle ----------

  async startMinigame(entry, setup) {
    if (this._busy) return;
    this._busy = true;
    try {
      await this.stopMinigame();
      const mod = await entry.load();
      const game = mod.createMinigame();
      this.game = game;
      this.currentEntry = entry;
      this.currentSetup = setup;
      await game.init(this._buildContext(setup));
      game.start();
      this.state = 'running';
      this._startLoop();
    } catch (err) {
      await this.stopMinigame();
      throw err;
    } finally {
      this._busy = false;
    }
  }

  pause() {
    if (this.state !== 'running') return false;
    this.game.pause();
    this.inputManager.setEnabled(false); // input gameplay dinonaktifkan & dibersihkan
    this.state = 'paused';
    return true;
  }

  resume() {
    if (this.state !== 'paused') return false;
    this.inputManager.setEnabled(true);
    this.game.resume();
    this.state = 'running';
    return true;
  }

  /** Hentikan dan inisialisasi ulang mini-game yang sama. */
  async restart() {
    if (!this.currentEntry) return;
    const { currentEntry: entry, currentSetup: setup } = this;
    await this.startMinigame(entry, setup);
  }

  /** destroy() + bersihkan semua resource milik mini-game. Aman dipanggil berulang. */
  async stopMinigame() {
    this._stopLoop();
    const game = this.game;
    this.game = null;
    if (game) {
      try { game.destroy(); } catch (err) { console.error('destroy() gagal:', err); }
    }
    // Jaring pengaman: pastikan tidak ada kontrol/pemain/audio tertinggal.
    this.controlManager?.destroyAll();
    this.playerManager?.destroyAll();
    this.inputManager?.setEnabled(true);
    this.audioManager?.stopAll();
    this.scoreManager?.reset();
    this.healthSystem?.reset();
    this.renderer?.renderLists?.dispose();
    this.state = 'idle';
  }

  getResults() { return this.game?.getResults?.() ?? null; }

  // ---------- Loop ----------

  _startLoop() {
    if (this._raf) return;
    this._last = performance.now();
    this._raf = requestAnimationFrame(this._frame);
  }

  _stopLoop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = 0;
  }

  _frame = (now) => {
    this._raf = requestAnimationFrame(this._frame);
    const dt = Math.min(Math.max((now - this._last) / 1000, 0), 0.05); // deltaTime, dibatasi
    this._last = now;
    const game = this.game;
    if (!game) return;
    if (this.state === 'running') game.update(dt); // saat pause: update tidak dipanggil -> semua berhenti
    game.render();
  };

  debugInfo() {
    return {
      state: this.state,
      hasGame: !!this.game,
      players: this.playerManager?.players.size ?? 0,
      controls: this.controlManager?.count ?? 0,
      assets: this.assetManager?.stats(),
      rafActive: this._raf !== 0,
    };
  }
}
