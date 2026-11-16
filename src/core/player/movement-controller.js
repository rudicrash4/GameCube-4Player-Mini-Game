// Movement Controller (TDD 11.4/11.5): gerakan dasar berbasis deltaTime.
// Input: x kanan(+), y atas(+) dengan panjang <= 1. Atas = maju = -Z (menjauh dari kamera atas).
import { CHARACTER } from '../../config.js';

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class MovementController {
  constructor({ maxSpeed = CHARACTER.maxSpeed, turnRate = CHARACTER.turnRate, bounds = null } = {}) {
    this.maxSpeed = maxSpeed;
    this.turnRate = turnRate;
    this.bounds = bounds; // {minX,maxX,minZ,maxZ} atau null
    this.x = 0;
    this.z = 0;
    this.yaw = 0;     // 0 = menghadap -Z (atas layar)
    this.amount = 0;  // besar input 0..1
    this.speed = 0;   // kecepatan nyata (unit/detik)
  }

  setPosition(x, z) { this.x = x; this.z = z; }

  update(dt, ix, iy) {
    const len = Math.hypot(ix, iy);
    const amount = Math.min(len, 1); // diagonal tidak lebih cepat: arah dinormalisasi, besar dibatasi 1
    this.amount = amount;
    this.speed = this.maxSpeed * amount;
    if (amount <= 0.0001) return;

    const dx = ix / len;
    const dz = -iy / len;
    this.x += dx * this.speed * dt;
    this.z += dz * this.speed * dt;

    if (this.bounds) {
      const b = this.bounds;
      this.x = Math.min(b.maxX, Math.max(b.minX, this.x));
      this.z = Math.min(b.maxZ, Math.max(b.minZ, this.z));
    }

    // Depan model = -Z. Yaw θ memutar (0,0,-1) menjadi (-sinθ, 0, -cosθ).
    const target = Math.atan2(-dx, -dz);
    const diff = wrapAngle(target - this.yaw);
    const maxTurn = this.turnRate * dt;
    this.yaw = wrapAngle(this.yaw + Math.max(-maxTurn, Math.min(maxTurn, diff)));
  }
}
