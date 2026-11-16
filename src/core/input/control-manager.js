// Control Manager: membuat & menghancurkan kontrol virtual (HTML/CSS) milik pemain.
import { VirtualJoystick } from './virtual-joystick.js';
import { VirtualButton } from './virtual-button.js';

// Posisi sudut layar per slot pemain (GDD 5): P1 kiri-bawah, P2 kanan-bawah, P3 kiri-atas, P4 kanan-atas.
const CORNERS = ['bl', 'br', 'tl', 'tr'];

export class ControlManager {
  constructor({ root, inputManager }) {
    this.root = root;
    this.input = inputManager;
    this._joysticks = [];
    this._buttons = [];
  }

  createJoystick(player) {
    const joystick = new VirtualJoystick({
      container: this.root,
      playerId: player.id,
      color: player.colorCss,
      position: CORNERS[player.slot % CORNERS.length],
    });
    this.input.registerJoystick(player.id, joystick);
    this._joysticks.push({ playerId: player.id, joystick });
    return joystick;
  }

  createButton(player, name, style) {
    const button = new VirtualButton({
      container: this.root, playerId: player.id, name, color: player.colorCss, style,
    });
    this.input.registerButton(player.id, name, button);
    this._buttons.push({ playerId: player.id, name, button });
    return button;
  }

  /** Hancurkan semua kontrol (listener & DOM dilepas). Aman dipanggil berulang. */
  destroyAll() {
    for (const { playerId, joystick } of this._joysticks) {
      this.input.unregisterJoystick(playerId);
      joystick.destroy();
    }
    for (const { playerId, name, button } of this._buttons) {
      this.input.unregisterButton(playerId, name);
      button.destroy();
    }
    this._joysticks = [];
    this._buttons = [];
  }

  get count() { return this._joysticks.length + this._buttons.length; }
}
