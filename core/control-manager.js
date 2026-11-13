const COLORS = ["#FF5252", "#42A5F5", "#66BB6A", "#FFCA28"];
const PLAYER_CLASSES = ["p1", "p2", "p3", "p4"];

export class ControlManager {
  constructor(layer, onInput) {
    this.layer = layer;
    this.onInput = onInput;
    this.sticks = [];
    this.visible = false;
    this.states = Array.from({length: 4}, () => ({x: 0, y: 0, active: false}));
    this.build();
    this.hide();
  }

  build() {
    this.layer.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const root = document.createElement("div");
      root.className = `virtual-stick ${PLAYER_CLASSES[i]}`;
      root.dataset.player = String(i + 1);
      const knob = document.createElement("div");
      knob.className = "knob";
      root.appendChild(knob);
      this.layer.appendChild(root);
      const stick = {root, knob, pointerId: null, centerX: 0, centerY: 0, maxRadius: 0, player: i};
      root.addEventListener("pointerdown", e => this.pointerDown(e, stick));
      root.addEventListener("pointermove", e => this.pointerMove(e, stick));
      root.addEventListener("pointerup", e => this.pointerEnd(e, stick));
      root.addEventListener("pointercancel", e => this.pointerEnd(e, stick));
      this.sticks.push(stick);
    }
    this.refresh();
  }

  refresh() {
    for (const s of this.sticks) {
      const rect = s.root.getBoundingClientRect();
      s.centerX = rect.left + rect.width / 2;
      s.centerY = rect.top + rect.height / 2;
      s.maxRadius = rect.width * .29;
    }
  }

  pointerDown(e, s) {
    if (s.pointerId !== null) return;
    e.preventDefault();
    s.pointerId = e.pointerId;
    s.root.setPointerCapture(e.pointerId);
    this.refresh();
    this.updateStick(e, s);
  }

  pointerMove(e, s) {
    if (s.pointerId !== e.pointerId) return;
    e.preventDefault();
    this.updateStick(e, s);
  }

  updateStick(e, s) {
    let dx = e.clientX - s.centerX;
    let dy = e.clientY - s.centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > s.maxRadius) {
      const scale = s.maxRadius / distance;
      dx *= scale; dy *= scale;
    }
    const percent = 100 * (s.maxRadius / (s.root.getBoundingClientRect().width / 2));
    s.knob.style.left = `calc(50% + ${dx}px - 21%)`;
    s.knob.style.top = `calc(50% + ${dy}px - 21%)`;
    const rect = s.root.getBoundingClientRect();
    this.states[s.player] = {
      x: Math.max(-1, Math.min(1, dx / s.maxRadius)),
      y: Math.max(-1, Math.min(1, dy / s.maxRadius)),
      active: true
    };
    this.onInput(this.snapshot());
  }

  pointerEnd(e, s) {
    if (s.pointerId !== e.pointerId) return;
    s.pointerId = null;
    s.knob.style.left = "29%";
    s.knob.style.top = "29%";
    this.states[s.player] = {x: 0, y: 0, active: false};
    this.onInput(this.snapshot());
  }

  snapshot() { return this.states.map(v => ({...v})); }
  show() { this.visible = true; this.layer.hidden = false; this.layer.style.display = "block"; this.refresh(); }
  hide() {
    this.visible = false;
    for (const s of this.sticks) {
      if (s.pointerId !== null) {
        try { s.root.releasePointerCapture(s.pointerId); } catch {}
        s.pointerId = null;
      }
      s.knob.style.left = "29%"; s.knob.style.top = "29%";
    }
    this.states = this.states.map(() => ({x: 0, y: 0, active: false}));
    this.layer.style.display = "none";
  }
}
