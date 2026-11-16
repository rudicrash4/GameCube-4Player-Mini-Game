// Pembangun model dari file geometry Minecraft Bedrock (model_player.json).
//
// Struktur aset: bukan mesh glTF/skeleton skinned, melainkan hirarki "bone" berisi "cube".
// Setiap bone -> THREE.Group (pivot), setiap cube -> THREE.Mesh(BoxGeometry).
// Satuan model = piksel; root diskalakan 1/16.
//
// Konvensi Bedrock -> Three.js (sama seperti Blockbench):
//   - rotasi: urutan Z,Y,X (Euler 'ZYX'), sumbu X dan Y dinegasikan
//   - posisi pada animasi: sumbu X dinegasikan
//   - arah depan model = sisi "north" = -Z

const D2R = Math.PI / 180;

export const ZERO_POSE = Object.freeze([0, 0, 0, 0, 0, 0]);

/** Terapkan rest pose + offset animasi (px, derajat) ke sebuah node. */
export function applyBonePose(node, rest, px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0) {
  node.position.set(rest.px - px, rest.py + py, rest.pz + pz);
  node.rotation.set(-(rest.rx + rx) * D2R, -(rest.ry + ry) * D2R, (rest.rz + rz) * D2R);
}

/**
 * @param {object} p
 * @param {object} p.THREE
 * @param {object} p.geometryJson          isi model_player.json
 * @param {(w:number,h:number,d:number)=>object} p.acquireGeometry  penyedia BoxGeometry (boleh dibagi)
 * @param {(boneName:string)=>object|object[]} p.createMaterials     material solid per bone
 * @param {boolean} [p.includeOverlay=false] cube berinflate (layer kedua skin) ikut dibuat
 */
export function buildBedrockModel({ THREE, geometryJson, acquireGeometry, createMaterials, includeOverlay = false }) {
  const geo = geometryJson['minecraft:geometry']?.[0];
  if (!geo?.bones) throw new Error('Format model tidak dikenali: "minecraft:geometry[0].bones" tidak ada');

  const defs = geo.bones;
  const byName = new Map(defs.map((b) => [b.name, b]));

  const root = new THREE.Group();
  root.name = 'CharacterModel';
  root.scale.setScalar(1 / 16);

  const nodes = new Map();
  for (const def of defs) {
    const node = new THREE.Group();
    node.name = def.name;
    node.rotation.order = 'ZYX';
    nodes.set(def.name, node);
  }

  const bones = [];
  const meshes = [];
  let skippedOverlay = 0;

  for (const def of defs) {
    const node = nodes.get(def.name);
    const parentDef = def.parent ? byName.get(def.parent) : null;
    if (def.parent && !parentDef) throw new Error(`Bone "${def.name}" memiliki parent "${def.parent}" yang tidak ada`);

    const pv = def.pivot ?? [0, 0, 0];
    const pp = parentDef?.pivot ?? [0, 0, 0];
    const rot = def.rotation ?? [0, 0, 0];
    const rest = { px: pv[0] - pp[0], py: pv[1] - pp[1], pz: pv[2] - pp[2], rx: rot[0], ry: rot[1], rz: rot[2] };
    applyBonePose(node, rest);
    (parentDef ? nodes.get(def.parent) : root).add(node);

    const materials = createMaterials(def.name);
    for (const cube of def.cubes ?? []) {
      const isOverlay = (cube.inflate ?? 0) > 0;
      if (isOverlay && !includeOverlay) { skippedOverlay++; continue; }
      const [ox, oy, oz] = cube.origin;
      const [w, h, d] = cube.size;
      const mesh = new THREE.Mesh(acquireGeometry(w, h, d), materials);
      mesh.name = `${def.name}.cube`;
      mesh.position.set(ox + w / 2 - pv[0], oy + h / 2 - pv[1], oz + d / 2 - pv[2]);
      node.add(mesh);
      meshes.push(mesh);
    }
    bones.push({ name: def.name, node, rest });
  }

  return {
    identifier: geo.description?.identifier ?? 'unknown',
    root,
    bones,
    boneNames: bones.map((b) => b.name),
    meshes,
    skippedOverlay,
  };
}
