export class GameManager {
  constructor({frame, menuView, gameView}) {
    this.frame = frame;
    this.menuView = menuView;
    this.gameView = gameView;
    this.allowedOrigin = location.origin;
    this.onMessage = this.onMessage.bind(this);
    window.addEventListener("message", this.onMessage);
  }

  async open(path) {
    this.menuView.hidden = true;
    this.gameView.hidden = false;
    this.frame.src = path;
    await new Promise(resolve => {
      const done = () => { this.frame.removeEventListener("load", done); resolve(); };
      this.frame.addEventListener("load", done);
    });
  }

  sendInput(players) {
    if (!this.frame.contentWindow) return;
    this.frame.contentWindow.postMessage({type: "CORE_INPUT", players}, this.allowedOrigin);
  }

  onMessage(event) {
    if (event.origin !== this.allowedOrigin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "MINIGAME_READY") {
      this.frame.contentWindow?.postMessage({type: "CORE_START", players: 4}, this.allowedOrigin);
    }
    if (data.type === "MINIGAME_RESULT") {
      console.info("Mini-game result:", data.result);
    }
  }

  close() {
    this.frame.src = "about:blank";
    this.gameView.hidden = true;
    this.menuView.hidden = false;
  }
}
