// Konfigurasi global. Tidak berisi logika gameplay mini-game apa pun.

export const MAX_PLAYERS = 4;

/** Warna pemain (TDD 11.9). Dipakai untuk karakter DAN joystick. */
export const PLAYER_COLORS = [
  { hex: 0xe53935, css: '#e53935' }, // P1 merah
  { hex: 0x1e88e5, css: '#1e88e5' }, // P2 biru
  { hex: 0x43a047, css: '#43a047' }, // P3 hijau
  { hex: 0xfdd835, css: '#fdd835' }, // P4 kuning
];

/** Aset global karakter (format geometry & animasi Minecraft Bedrock). */
export const ASSET_PATHS = {
  characterModel: 'assets/character/model_player.json',
  animations: {
    idle: 'assets/character/animation_idle.json',
    move: 'assets/character/animation_move.json',
  },
};

/** Nama clip yang benar-benar ada di file animasi. Tidak ada nama karangan. */
export const ANIMATION_IDS = {
  idle: 'animation.actor.idle',
  move: 'animation.actor.move',
};

/** Material solid untuk karakter (model tidak memiliki texture). */
export const CHARACTER = {
  unitsPerPixel: 1 / 16,   // 1 piksel Bedrock = 1/16 unit dunia -> tinggi karakter ~2.1 unit
  skinColor: 0xf2c9a0,
  faceColor: 0x7a5c45,     // sisi depan kepala (north) dibuat lebih gelap agar arah hadap terbaca
  legColor: 0x3b3f4c,
  maxSpeed: 4.0,           // unit dunia per detik pada input joystick 1.0
  turnRate: 16,            // radian per detik
  moveEpsilon: 0.02,       // di bawah ini dianggap diam (Idle)
  blendTime: 0.12,         // detik, transisi Idle <-> Walk
};
