// Arena Dummy: lantai persegi pola papan catur abu-abu & putih, datar, tanpa texture.
// Satu BufferGeometry dengan vertex color -> satu draw call.
import * as THREE from 'three';

export const ARENA_CONFIG = {
  size: 16,         // sisi arena (unit dunia)
  tile: 2,          // sisi satu kotak
  colorA: 0x9e9e9e, // abu-abu
  colorB: 0xf5f5f5, // putih
};

export function createArena(config = ARENA_CONFIG) {
  const { size, tile, colorA, colorB } = config;
  const n = Math.round(size / tile);
  const half = size / 2;
  const tiles = n * n;

  const positions = new Float32Array(tiles * 6 * 3);
  const normals = new Float32Array(tiles * 6 * 3);
  const colors = new Float32Array(tiles * 6 * 3);
  const ca = new THREE.Color(colorA);
  const cb = new THREE.Color(colorB);

  let v = 0;
  const push = (x, z, c) => {
    positions[v * 3] = x; positions[v * 3 + 1] = 0; positions[v * 3 + 2] = z;
    normals[v * 3] = 0; normals[v * 3 + 1] = 1; normals[v * 3 + 2] = 0;
    colors[v * 3] = c.r; colors[v * 3 + 1] = c.g; colors[v * 3 + 2] = c.b;
    v++;
  };

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x0 = -half + i * tile, x1 = x0 + tile;
      const z0 = -half + j * tile, z1 = z0 + tile;
      const c = (i + j) % 2 === 0 ? ca : cb;
      // Dua segitiga menghadap +Y (atas)
      push(x0, z0, c); push(x0, z1, c); push(x1, z1, c);
      push(x0, z0, c); push(x1, z1, c); push(x1, z0, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Arena';

  return {
    mesh,
    size,
    tilesPerSide: n,
    dispose() {
      mesh.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}
