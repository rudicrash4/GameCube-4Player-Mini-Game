// STUB Three.js — hanya untuk pengujian logika/DOM/navigasi di lingkungan tanpa akses CDN.
// BUKAN pengganti Three.js: tidak ada rendering nyata. Mencatat statistik dispose/render
// di globalThis.__3 agar kebocoran resource dapat diperiksa.

const S = (globalThis.__3 = globalThis.__3 || {
  geometriesCreated: 0, geometriesDisposed: 0,
  materialsCreated: 0, materialsDisposed: 0,
  renders: 0, rendererCreated: 0,
});

class Vec {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  setScalar(s) { return this.set(s, s, s); }
}
export class Vector3 extends Vec {}
export class Euler extends Vec { constructor(x, y, z, order = 'XYZ') { super(x, y, z); this.order = order; } }
export class Color {
  constructor(hex = 0) { this.setHex(hex); }
  setHex(h) { this.r = ((h >> 16) & 255) / 255; this.g = ((h >> 8) & 255) / 255; this.b = (h & 255) / 255; return this; }
}

export class Object3D {
  constructor() {
    this.name = ''; this.children = []; this.parent = null;
    this.position = new Vector3(); this.rotation = new Euler(0, 0, 0); this.scale = new Vector3(1, 1, 1);
  }
  add(...o) { for (const c of o) { c.removeFromParent(); c.parent = this; this.children.push(c); } return this; }
  remove(c) { const i = this.children.indexOf(c); if (i >= 0) { this.children.splice(i, 1); c.parent = null; } return this; }
  removeFromParent() { this.parent?.remove(this); return this; }
  clear() { for (const c of [...this.children]) this.remove(c); return this; }
  traverse(fn) { fn(this); for (const c of this.children) c.traverse(fn); }
  lookAt() {}
}
export class Group extends Object3D {}
export class Scene extends Object3D { constructor() { super(); this.background = null; } }
export class Mesh extends Object3D { constructor(geometry, material) { super(); this.geometry = geometry; this.material = material; } }
export class AmbientLight extends Object3D { constructor(c, i) { super(); this.intensity = i; } }
export class DirectionalLight extends Object3D { constructor(c, i) { super(); this.intensity = i; } }
export class PerspectiveCamera extends Object3D {
  constructor(fov, aspect) { super(); this.fov = fov; this.aspect = aspect; }
  updateProjectionMatrix() {}
}

export class BufferAttribute { constructor(array, itemSize) { this.array = array; this.itemSize = itemSize; this.count = array.length / itemSize; } }
export class BufferGeometry {
  constructor() { this.attributes = {}; S.geometriesCreated++; this.disposed = false; }
  setAttribute(n, a) { this.attributes[n] = a; return this; }
  dispose() { if (!this.disposed) { this.disposed = true; S.geometriesDisposed++; } }
}
export class BoxGeometry extends BufferGeometry { constructor(w, h, d) { super(); this.parameters = { w, h, d }; } }

class Material {
  constructor(p = {}) { Object.assign(this, p); S.materialsCreated++; this.disposed = false; }
  dispose() { if (!this.disposed) { this.disposed = true; S.materialsDisposed++; } }
}
export class MeshLambertMaterial extends Material {}

export class WebGLRenderer {
  constructor({ canvas } = {}) { this.domElement = canvas; S.rendererCreated++; this.renderLists = { dispose() {} }; }
  setPixelRatio() {}
  setSize(w, h) { this.width = w; this.height = h; }
  render() { S.renders++; }
  dispose() {}
}
