// Kamera Dummy: PerspectiveCamera diam di atas arena, mengarah ke bawah.
// Tidak mengikuti pemain. Ketinggian dihitung dari ukuran arena & aspect layar.
import * as THREE from 'three';

export const CAMERA_FOV = 45;                    // derajat (vertikal)
export const CAMERA_TILT = 0 * Math.PI / 180;   // kemiringan kecil dari tegak lurus agar karakter terbaca
const MARGIN = 1.15;                              // ruang cadangan di sekeliling arena

/** Jarak kamera agar seluruh arena persegi terlihat pada aspect tertentu. */
export function computeCameraDistance(arenaSize, aspect) {
  const half = arenaSize / 2;
  const tanV = Math.tan((CAMERA_FOV * Math.PI / 180) / 2);
  const byHeight = (half * MARGIN) / tanV;
  const byWidth = (half * MARGIN) / (tanV * aspect);
  return Math.max(byHeight, byWidth);
}

/** Posisikan ulang kamera (dipanggil saat init dan saat resize). */
export function fitCamera(camera, arenaSize, aspect) {
  const d = computeCameraDistance(arenaSize, aspect);
  camera.aspect = aspect;
  camera.position.set(0, d * Math.cos(CAMERA_TILT), d * Math.sin(CAMERA_TILT));
  camera.lookAt(0, 0, 0); // menghadap ke bawah, pusat arena
  camera.updateProjectionMatrix();
  return d;
}

export function createCamera(arenaSize, aspect) {
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 300);
  fitCamera(camera, arenaSize, aspect);
  return camera;
}
