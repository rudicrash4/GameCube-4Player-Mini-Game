import { GameManager } from "./core/game-manager.js";
import { ControlManager } from "./core/control-manager.js";

const stage = document.querySelector("#rotated-stage");
const menuView = document.querySelector("#menu-view");
const gameView = document.querySelector("#game-view");
const grid = document.querySelector("#game-grid");
const frame = document.querySelector("#game-frame");
const controlsLayer = document.querySelector("#controls-layer");
const backButton = document.querySelector("#back-button");

const slots = Array.from({length: 12}, (_, i) => ({
  id: i === 0 ? "template" : `slot-${i + 1}`,
  name: i === 0 ? "Template" : `Slot ${i + 1}`,
  path: i === 0 ? "./minigames/template/index.html" : null
}));

const gameManager = new GameManager({ frame, menuView, gameView });
const controls = new ControlManager(controlsLayer, (snapshot) => gameManager.sendInput(snapshot));

slots.forEach((slot, index) => {
  const button = document.createElement("button");
  button.className = "game-slot";
  button.type = "button";
  button.textContent = slot.name;
  button.disabled = !slot.path;
  if (!slot.path) button.style.opacity = ".45";
  if (index === 0) button.addEventListener("click", async () => {
    controls.show();
    await gameManager.open(slot.path);
  });
  grid.appendChild(button);
});

backButton.addEventListener("click", () => {
  controls.hide();
  gameManager.close();
});
window.addEventListener("resize", () => controls.refresh());
