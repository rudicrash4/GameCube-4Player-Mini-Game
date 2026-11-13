export class PlayerManager {
  constructor(count = 4) {
    this.players = Array.from({length: count}, (_, i) => ({
      id: i + 1, color: ["#FF5252", "#42A5F5", "#66BB6A", "#FFCA28"][i],
      input: {x: 0, y: 0, active: false}
    }));
  }
  updateInputs(inputs) {
    inputs.forEach((input, i) => { if (this.players[i]) this.players[i].input = {...input}; });
  }
  getPlayers() { return this.players; }
}
