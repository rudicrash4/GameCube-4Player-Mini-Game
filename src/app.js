// App: menyambungkan UI System dengan Core Engine dan mengatur alur navigasi.
//
// OPENING -> MAIN MENU -> FREE PLAY (MINIGAME SELECTION) -> PLAYER SELECTION -> DUMMY MINIGAME <-> PAUSE
import { Engine } from './core/engine.js';
import { ScreenManager } from './ui/screen-manager.js';
import { initOpeningScreen } from './ui/opening-screen.js';
import { initMainMenuScreen, initMatchScreen } from './ui/main-menu-screen.js';
import { initMinigameSelectScreen } from './ui/minigame-select-screen.js';
import { initPlayerSelectScreen } from './ui/player-select-screen.js';
import { initGameScreen } from './ui/game-screen.js';

export class App {
  constructor() {
    this.uiRoot = document.getElementById('ui-root');
    this.canvas = document.getElementById('game-canvas');
    this.nav = new ScreenManager(this.uiRoot);
    this.engine = new Engine({ canvas: this.canvas, controlsRoot: document.getElementById('controls-root') });
    this.selectedMinigame = null;
    this.gameScreen = null;
  }

  async start() {
    await this.engine.init(); // renderer + aset global (model & animasi)

    const root = (id) => document.getElementById(id);
    const nav = this.nav;

    initOpeningScreen({ root: root('screen-opening'), onContinue: () => nav.show('main-menu') });
    initMainMenuScreen({
      root: root('screen-main-menu'),
      onMatch: () => nav.show('match'),
      onFreePlay: () => { this.engine.gameManager.mode = 'free-play'; nav.show('minigames'); },
    });
    initMatchScreen({ root: root('screen-match'), onBack: () => nav.show('main-menu') });
    initMinigameSelectScreen({
      root: root('screen-minigames'),
      onBack: () => nav.show('main-menu'),
      onSelect: (entry) => { this.selectedMinigame = entry; nav.show('players'); },
    });
    initPlayerSelectScreen({
      root: root('screen-players'),
      onBack: () => nav.show('minigames'),
      onSelect: (count) => this.enterGame(count),
    });
    this.gameScreen = initGameScreen({
      root: root('screen-game'),
      onPause: () => this.pauseGame(),
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartGame(),
      onExit: () => this.exitGame(),
    });

    // Resize & auto-pause saat aplikasi tersembunyi / berputar ke portrait.
    window.addEventListener('resize', () => this.engine.resize());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pauseGame(); });
    window.matchMedia('(orientation: portrait)').addEventListener('change', (e) => { if (e.matches) this.pauseGame(); });

    nav.show('opening');
  }

  async enterGame(humanCount) {
    const players = this.engine.gameManager.configurePlayers(humanCount);
    this.gameScreen.setPaused(false);
    this.nav.show('game');
    this.canvas.hidden = false;
    this.engine.resize();
    try {
      await this.engine.startMinigame(this.selectedMinigame, { players });
    } catch (err) {
      console.error(err);
      await this.leaveGame();
      throw err;
    }
  }

  pauseGame() {
    if (this.engine.pause()) this.gameScreen.setPaused(true);
  }

  resumeGame() {
    if (this.engine.resume()) this.gameScreen.setPaused(false);
  }

  async restartGame() {
    this.gameScreen.setPaused(false);
    await this.engine.restart();
  }

  async exitGame() {
    await this.leaveGame();
  }

  async leaveGame() {
    await this.engine.stopMinigame(); // destroy() + bersihkan resource
    this.canvas.hidden = true;
    this.gameScreen.setPaused(false);
    this.nav.show('players'); // kembali ke menu sebelumnya
  }
}
