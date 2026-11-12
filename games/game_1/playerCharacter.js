/**
 * ==========================================================================
 * Player Character Module (Bedrock Geometry & Animation Controller)
 * - Membaca model Bedrock JSON (geometry.unknown) dari /aset/player/model_player.json
 * - Menghasilkan tekstur procedural Minecraft/GameCube beresolusi tajam sesuai warna masing-masing pemain
 * - Mengontrol animasi Idle dan Move dari JSON dengan transisi blending halus (crossfade)
 * - Mengatur kecepatan animasi proporsional terhadap tarikan virtual joystick (0.0 - 1.0)
 * - Rotasi arah hadap otomatis selaras vektor gerak (smooth shortest-arc slerp)
 * - Sistem fisika dengan momentum/velocity ringan dan gesekan alami
 * ==========================================================================
 */

import * as THREE from "three";
import { modelJson, animIdleJson, animMoveJson } from "./playerAssets.js";

// Skala model diperbesar agar karakter terlihat jelas, besar dan proporsional di arena 10×6
export const MODEL_SCALE = 0.065;
const DEG2RAD = Math.PI / 180;

/**
 * Normalisasi sudut ke rentang [-PI, PI]
 */
function normalizeAngle(ang) {
  while (ang > Math.PI) ang -= Math.PI * 2;
  while (ang < -Math.PI) ang += Math.PI * 2;
  return ang;
}

/**
 * Interpolasi sudut melalui busur terpendek
 */
function lerpAngle(from, to, t) {
  const diff = normalizeAngle(to - from);
  return from + diff * Math.min(Math.max(t, 0), 1);
}

/**
 * Menghasilkan Texture Canvas 64x64 pixel art tajam untuk setiap pemain
 * Seluruh body setiap pemain diwarnai penuh sesuai warna pemain (P1 Merah, P2 Biru, P3 Hijau, P4 Kuning)
 */
function createPlayerCanvasTexture(primaryHex, darkAccentHex, lightAccentHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Latar belakang transparan
  ctx.clearRect(0, 0, 64, 64);

  // Palet Warna: Seluruh tubuh mengenakan seragam warna pemain (primary + aksen)
  const skinTone = "#f7cbab";
  const white = "#ffffff";

  // 1. KEPALA (Head Layer 1: UV [0..32, 0..16])
  // Rambut / Helm bagian atas & samping (Warna Pemain Penuh)
  ctx.fillStyle = primaryHex;
  ctx.fillRect(8, 0, 8, 8); // Up (top of head)
  ctx.fillRect(16, 0, 8, 8); // Down (neck)

  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(0, 8, 8, 8); // East (Right ear side)
  ctx.fillRect(16, 8, 8, 8); // West (Left ear side)
  ctx.fillRect(24, 8, 8, 8); // South (Back of head)

  // Wajah (North: [8, 8] sampai [16, 16])
  ctx.fillStyle = skinTone;
  ctx.fillRect(8, 8, 8, 8);

  // Rambut depan / topi pemain
  ctx.fillStyle = primaryHex;
  ctx.fillRect(8, 8, 8, 2);
  ctx.fillRect(8, 10, 2, 1);
  ctx.fillRect(14, 10, 2, 1);

  // Mata (Kiri & Kanan) dengan pupil warna pemain
  ctx.fillStyle = white;
  ctx.fillRect(9, 12, 2, 1);
  ctx.fillRect(13, 12, 2, 1);
  ctx.fillStyle = primaryHex;
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(13, 12, 1, 1);

  // Mulut
  ctx.fillStyle = "#cf7162";
  ctx.fillRect(11, 14, 2, 1);

  // 2. KEPALA LAYER LUAR (Head Layer 2 Outer / Helm & Bando: UV [32..64, 0..16])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(40, 0, 8, 8); // Up
  ctx.fillRect(48, 0, 8, 8); // Down
  ctx.fillRect(32, 8, 8, 8); // East
  ctx.fillRect(48, 8, 8, 8); // West
  ctx.fillRect(56, 8, 8, 8); // South

  // Bando depan aksen pemain
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(40, 8, 8, 3);
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(43, 9, 2, 1); // Emblem tengah

  // 3. BADAN / TORSO (Body Layer 1: UV [16..40, 16..32]) - WARNA PEMAIN PENUH
  // Baju Depan (North: [20, 20] sampai [28, 32])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(20, 20, 8, 10);
  // Kerah
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(23, 20, 2, 2);
  // Sabuk pinggang aksen pemain
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(20, 30, 8, 2);
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(23, 30, 2, 2); // Gesper sabuk

  // Baju Belakang (South: [32, 20] sampai [40, 32])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(32, 20, 8, 10);
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(32, 30, 8, 2);

  // Sisi Samping Badan (East & West)
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillStyle = primaryHex;
  ctx.fillRect(20, 16, 8, 4); // Bahu atas

  // 4. BADAN LAYER LUAR (Body Layer 2 Outer / Rompi & Pelindung: UV [16..40, 32..48])
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(20, 36, 8, 10); // Rompi penuh warna aksen pemain
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(22, 38, 4, 4); // Emblem dada terang
  ctx.fillRect(20, 45, 8, 1); // Garis bawah

  // 5. LENGAN KANAN (Right Arm: UV [40..56, 16..32]) - WARNA PEMAIN PENUH
  // Lengan atas, siku, dan sarung tangan seluruhnya warna pemain
  ctx.fillStyle = primaryHex;
  ctx.fillRect(40, 20, 16, 8); // Lengan baju atas
  ctx.fillRect(44, 16, 4, 4); // Bahu atas
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(40, 28, 16, 4); // Sarung tangan warna pemain (bukan warna kulit)

  // Lengan Kanan Layer Luar (UV [40..56, 32..48])
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(40, 36, 16, 3); // Manset lengan

  // 6. LENGAN KIRI (Left Arm: UV [32..48, 48..64]) - WARNA PEMAIN PENUH
  ctx.fillStyle = primaryHex;
  ctx.fillRect(32, 52, 16, 8); // Lengan baju atas
  ctx.fillRect(36, 48, 4, 4); // Bahu atas
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(32, 60, 16, 4); // Sarung tangan warna pemain

  // Lengan Kiri Layer Luar (UV [48..64, 48..64])
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(48, 52, 16, 3); // Manset lengan

  // 7. KAKI KANAN (Right Leg: UV [0..16, 16..32]) - WARNA PEMAIN PENUH (Bukan Hitam)
  // Celana & sepatu boot seluruhnya diwarnai warna tema pemain
  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 20, 16, 8); // Celana paha warna pemain
  ctx.fillRect(4, 16, 4, 4); // Pinggul atas
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(0, 28, 16, 4); // Sepatu boot warna aksen pemain
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(0, 31, 16, 1); // Sol sepatu aksen terang

  // Kaki Kanan Layer Luar (UV [0..16, 32..48])
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(0, 36, 16, 6); // Pelindung lutut aksen pemain

  // 8. KAKI KIRI (Left Leg: UV [16..32, 48..64]) - WARNA PEMAIN PENUH (Bukan Hitam)
  ctx.fillStyle = primaryHex;
  ctx.fillRect(16, 52, 16, 8); // Celana paha warna pemain
  ctx.fillRect(20, 48, 4, 4); // Pinggul atas
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(16, 60, 16, 4); // Sepatu boot warna aksen pemain
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(16, 63, 16, 1); // Sol sepatu aksen terang

  // Kaki Kiri Layer Luar (UV [0..16, 48..64])
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(0, 52, 16, 6); // Pelindung lutut aksen pemain

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Terapkan koordinat UV Bedrock JSON ke atribut UV Three.js BoxGeometry
 */
function applyBedrockUv(geometry, cubeUv, texW = 64, texH = 64) {
  const uvAttr = geometry.attributes.uv;
  if (!uvAttr || !cubeUv) return;

  // Urutan 6 Sisi Tiga Dimensi pada BoxGeometry Three.js:
  // 0: East (+X), 1: West (-X), 2: Up (+Y), 3: Down (-Y), 4: South (+Z), 5: North (-Z)
  const faceKeys = ["east", "west", "up", "down", "south", "north"];

  for (let f = 0; f < 6; f++) {
    const key = faceKeys[f];
    const faceUv = cubeUv[key];
    if (!faceUv) continue;

    const u = faceUv.uv[0];
    const v = faceUv.uv[1];
    const du = faceUv.uv_size[0];
    const dv = faceUv.uv_size[1];

    const u0 = u / texW;
    const u1 = (u + du) / texW;
    const v0 = 1.0 - v / texH;
    const v1 = 1.0 - (v + dv) / texH;

    const baseIdx = f * 4;
    // Vertex 0: Top-Left
    uvAttr.setXY(baseIdx + 0, u0, v0);
    // Vertex 1: Top-Right
    uvAttr.setXY(baseIdx + 1, u1, v0);
    // Vertex 2: Bottom-Left
    uvAttr.setXY(baseIdx + 2, u0, v1);
    // Vertex 3: Bottom-Right
    uvAttr.setXY(baseIdx + 3, u1, v1);
  }

  uvAttr.needsUpdate = true;
}

// Pre-parse 6 keyframed tracks animasi Move sekali saat modul dimuat
const moveBonesData = animMoveJson.animations["animation.actor.move"].bones;

function parseKeyframeTrack(keyframesObj) {
  if (!keyframesObj) return [];
  return Object.entries(keyframesObj)
    .map(([timeStr, val]) => ({
      time: parseFloat(timeStr),
      val: Array.isArray(val) ? val : [0, 0, 0],
    }))
    .sort((a, b) => a.time - b.time);
}

const MOVE_TRACKS = {
  bodyPos: parseKeyframeTrack(moveBonesData.Body?.position),
  headPos: parseKeyframeTrack(moveBonesData.Head?.position),
  rLegRot: parseKeyframeTrack(moveBonesData["Right Leg"]?.rotation),
  rLegPos: parseKeyframeTrack(moveBonesData["Right Leg"]?.position),
  lLegRot: parseKeyframeTrack(moveBonesData["Left Leg"]?.rotation),
  lLegPos: parseKeyframeTrack(moveBonesData["Left Leg"]?.position),
};

/**
 * Evaluasi track keyframe yang sudah di-parse dan diurutkan tanpa alokasi memori baru
 */
function evalTrackOut(track, time, out) {
  if (!track || track.length === 0) {
    out[0] = 0; out[1] = 0; out[2] = 0;
    return out;
  }
  const first = track[0];
  const last = track[track.length - 1];
  if (time <= first.time) {
    out[0] = first.val[0]; out[1] = first.val[1]; out[2] = first.val[2];
    return out;
  }
  if (time >= last.time) {
    out[0] = last.val[0]; out[1] = last.val[1]; out[2] = last.val[2];
    return out;
  }

  for (let i = 0; i < track.length - 1; i++) {
    const p0 = track[i];
    const p1 = track[i + 1];
    if (time >= p0.time && time <= p1.time) {
      const alpha = p1.time === p0.time ? 0 : (time - p0.time) / (p1.time - p0.time);
      out[0] = p0.val[0] + (p1.val[0] - p0.val[0]) * alpha;
      out[1] = p0.val[1] + (p1.val[1] - p0.val[1]) * alpha;
      out[2] = p0.val[2] + (p1.val[2] - p0.val[2]) * alpha;
      return out;
    }
  }
  out[0] = first.val[0]; out[1] = first.val[1]; out[2] = first.val[2];
  return out;
}

// Objek pose statis yang digunakan berulang kali untuk menghindari Garbage Collection
const IDLE_POSE = {
  root: { pos: [0, 0, 0], rot: [0, 0, 0] },
  Waist: { pos: [0, 0, 0], rot: [0, 0, 0] },
  Head: { pos: [0, 0, 0], rot: [0, 0, 0] },
  Body: { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Right Arm": { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Left Arm": { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Right Leg": { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Left Leg": { pos: [0, 0, 0], rot: [0, 0, 0] },
};

const MOVE_POSE = {
  root: { pos: [0, 0, 0], rot: [0, 0, 0] },
  Waist: { pos: [0, 0, 0], rot: [0, 0, 0] },
  Head: { pos: [0, 0, 0], rot: [0, 0, 0] },
  Body: { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Right Arm": { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Left Arm": { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Right Leg": { pos: [0, 0, 0], rot: [0, 0, 0] },
  "Left Leg": { pos: [0, 0, 0], rot: [0, 0, 0] },
};

/**
 * Isi data animasi Idle ke buffer statis IDLE_POSE (Zero GC Allocation)
 */
function fillIdleAnimation(t) {
  const pRoot = IDLE_POSE.root;
  pRoot.pos[0] = Math.sin(t * 122.5 * DEG2RAD) * 0.25; pRoot.pos[1] = 0; pRoot.pos[2] = 0;
  pRoot.rot[0] = 0; pRoot.rot[1] = 0; pRoot.rot[2] = 0;

  const pWaist = IDLE_POSE.Waist;
  pWaist.pos[0] = 0; pWaist.pos[1] = Math.cos(t * 245 * DEG2RAD) * 0.15 - 0.15; pWaist.pos[2] = 0;
  pWaist.rot[0] = 0; pWaist.rot[1] = 0; pWaist.rot[2] = 0;

  const pHead = IDLE_POSE.Head;
  pHead.pos[0] = 0; pHead.pos[1] = 0; pHead.pos[2] = 0;
  pHead.rot[0] = Math.sin((t * 245 + 25) * DEG2RAD) * -2.75;
  pHead.rot[1] = 0;
  pHead.rot[2] = Math.cos(t * 122.5 * DEG2RAD) * -2.5;

  const pBody = IDLE_POSE.Body;
  pBody.pos[0] = 0; pBody.pos[1] = 0; pBody.pos[2] = 0;
  pBody.rot[0] = 0; pBody.rot[1] = 0; pBody.rot[2] = 0;

  const pRArm = IDLE_POSE["Right Arm"];
  pRArm.pos[0] = 0; pRArm.pos[1] = Math.cos(t * 245 * DEG2RAD) * 0.1 + 0.05; pRArm.pos[2] = 0;
  pRArm.rot[0] = 0; pRArm.rot[1] = 0; pRArm.rot[2] = Math.sin(t * 245 * DEG2RAD) * 1.25 + 1.15;

  const pLArm = IDLE_POSE["Left Arm"];
  pLArm.pos[0] = 0; pLArm.pos[1] = Math.cos(t * 245 * DEG2RAD) * 0.1 + 0.05; pLArm.pos[2] = 0;
  pLArm.rot[0] = 0; pLArm.rot[1] = 0; pLArm.rot[2] = Math.sin(t * 245 * DEG2RAD) * -1.25 - 1.15;

  const pRLeg = IDLE_POSE["Right Leg"];
  pRLeg.pos[0] = 0; pRLeg.pos[1] = 0; pRLeg.pos[2] = 0;
  pRLeg.rot[0] = 0; pRLeg.rot[1] = 0; pRLeg.rot[2] = Math.sin(t * 122.5 * DEG2RAD) * 1.2;

  const pLLeg = IDLE_POSE["Left Leg"];
  pLLeg.pos[0] = 0; pLLeg.pos[1] = 0; pLLeg.pos[2] = 0;
  pLLeg.rot[0] = 0; pLLeg.rot[1] = 0; pLLeg.rot[2] = Math.sin(t * 122.5 * DEG2RAD) * 1.2;
}

/**
 * Isi data animasi Move ke buffer statis MOVE_POSE (Zero GC Allocation)
 */
function fillMoveAnimation(rawT) {
  const moveAnimData = animMoveJson.animations["animation.actor.move"];
  const cycleLength = moveAnimData.animation_length || 0.6667;
  const t = rawT % cycleLength;

  const pRoot = MOVE_POSE.root;
  pRoot.pos[0] = 0; pRoot.pos[1] = 0; pRoot.pos[2] = 0.75;
  pRoot.rot[0] = 0; pRoot.rot[1] = 0; pRoot.rot[2] = 0;

  const pWaist = MOVE_POSE.Waist;
  pWaist.pos[0] = 0; pWaist.pos[1] = 0; pWaist.pos[2] = 0;
  pWaist.rot[0] = 5; pWaist.rot[1] = 0; pWaist.rot[2] = -Math.cos(t * 540 * DEG2RAD) * 2;

  const pBody = MOVE_POSE.Body;
  evalTrackOut(MOVE_TRACKS.bodyPos, t, pBody.pos);
  pBody.rot[0] = 0; pBody.rot[1] = -Math.sin(t * 540 * DEG2RAD) * 24; pBody.rot[2] = 0;

  const pHead = MOVE_POSE.Head;
  evalTrackOut(MOVE_TRACKS.headPos, t, pHead.pos);
  pHead.rot[0] = Math.sin((t * 1080 - 12) * DEG2RAD) * 8;
  pHead.rot[1] = -Math.sin((t * 540 - 45) * DEG2RAD) * 6;
  pHead.rot[2] = -Math.sin(t * 540 * DEG2RAD) * 4;

  const pRArm = MOVE_POSE["Right Arm"];
  pRArm.pos[0] = 0; pRArm.pos[1] = -Math.cos(t * 1080 * DEG2RAD) * 0.5; pRArm.pos[2] = 0;
  pRArm.rot[0] = Math.sin((t * 540 + 10) * DEG2RAD) * -60;
  pRArm.rot[1] = Math.sin(t * 540 * DEG2RAD) * 18;
  pRArm.rot[2] = 0;

  const pLArm = MOVE_POSE["Left Arm"];
  pLArm.pos[0] = 0; pLArm.pos[1] = -Math.cos(t * 1080 * DEG2RAD) * 0.5; pLArm.pos[2] = 0;
  pLArm.rot[0] = Math.sin((t * 540 + 10) * DEG2RAD) * 60;
  pLArm.rot[1] = Math.sin(t * 540 * DEG2RAD) * 18;
  pLArm.rot[2] = 0;

  const pRLeg = MOVE_POSE["Right Leg"];
  evalTrackOut(MOVE_TRACKS.rLegPos, t, pRLeg.pos);
  evalTrackOut(MOVE_TRACKS.rLegRot, t, pRLeg.rot);

  const pLLeg = MOVE_POSE["Left Leg"];
  evalTrackOut(MOVE_TRACKS.lLegPos, t, pLLeg.pos);
  evalTrackOut(MOVE_TRACKS.lLegRot, t, pLLeg.rot);
}

/**
 * Konstruksi Karakter Pemain 3D dari Model Bedrock JSON
 */
export function createPlayerCharacter(playerConfig, scene) {
  const geoDesc = modelJson["minecraft:geometry"][0];
  const bonesData = geoDesc.bones;

  // Palet Warna Pemain
  const colorMap = {
    p1: { primary: "#ef4444", dark: "#991b1b", light: "#fca5a5" },
    p2: { primary: "#3b82f6", dark: "#1d4ed8", light: "#93c5fd" },
    p3: { primary: "#22c55e", dark: "#15803d", light: "#86efac" },
    p4: { primary: "#eab308", dark: "#b45309", light: "#fde047" },
  };

  const palette = colorMap[playerConfig.id] || {
    primary: "#ef4444",
    dark: "#991b1b",
    light: "#fca5a5",
  };

  // Tekstur Skin Pixel Art Tajam Berdasarkan Warna Pemain
  const playerTexture = createPlayerCanvasTexture(
    palette.primary,
    palette.dark,
    palette.light
  );

  const playerMaterial = new THREE.MeshStandardMaterial({
    map: playerTexture,
    roughness: 0.35,
    metalness: 0.12,
    transparent: false,
  });

  // Kontainer Utama Karakter di World Space
  const rootGroup = new THREE.Group();
  rootGroup.name = `player_${playerConfig.id}_root`;
  rootGroup.position.set(...playerConfig.startPos);

  // Group root bone (untuk animasi root)
  const rootBoneGroup = new THREE.Group();
  rootBoneGroup.name = "root";
  rootGroup.add(rootBoneGroup);

  const bonesMap = {
    root: rootBoneGroup,
  };

  // Buat setiap Bone Group
  bonesData.forEach((bone) => {
    const group = new THREE.Group();
    group.name = bone.name;
    bonesMap[bone.name] = group;

    // Simpan data pivot dan rotasi dasar
    group.userData = {
      pivot: bone.pivot || [0, 0, 0],
      parentName: bone.parent,
      baseRotation: bone.rotation || [0, 0, 0],
      basePosition: [0, 0, 0],
    };

    // Buat kubus pada bone
    if (bone.cubes && bone.cubes.length > 0) {
      bone.cubes.forEach((cube) => {
        const inflate = cube.inflate || 0;
        const sx = (cube.size[0] + inflate * 2) * MODEL_SCALE;
        const sy = (cube.size[1] + inflate * 2) * MODEL_SCALE;
        const sz = (cube.size[2] + inflate * 2) * MODEL_SCALE;

        const boxGeo = new THREE.BoxGeometry(sx, sy, sz);

        if (cube.uv) {
          applyBedrockUv(boxGeo, cube.uv, 64, 64);
        }

        const mesh = new THREE.Mesh(boxGeo, playerMaterial);

        // Posisi tengah kubus relatif terhadap pivot bone
        const pivot = bone.pivot || [0, 0, 0];
        const cx = (cube.origin[0] - inflate + (cube.size[0] + inflate * 2) / 2 - pivot[0]) * MODEL_SCALE;
        const cy = (cube.origin[1] - inflate + (cube.size[1] + inflate * 2) / 2 - pivot[1]) * MODEL_SCALE;
        const cz = (cube.origin[2] - inflate + (cube.size[2] + inflate * 2) / 2 - pivot[2]) * MODEL_SCALE;

        mesh.position.set(cx, cy, cz);
        mesh.castShadow = true;
        mesh.receiveShadow = false; // Optimasi GPU: Hindari 80x fragment shadow map lookup per frame pada anggota tubuh
        group.add(mesh);
      });
    }
  });

  // Sambungkan hierarki bone sesuai parent
  bonesData.forEach((bone) => {
    const boneGroup = bonesMap[bone.name];
    const pivot = bone.pivot || [0, 0, 0];

    if (bone.parent && bonesMap[bone.parent]) {
      const parentGroup = bonesMap[bone.parent];
      const parentPivot = parentGroup.userData.pivot;

      // Posisi relatif terhadap pivot parent
      const rx = (pivot[0] - parentPivot[0]) * MODEL_SCALE;
      const ry = (pivot[1] - parentPivot[1]) * MODEL_SCALE;
      const rz = (pivot[2] - parentPivot[2]) * MODEL_SCALE;

      boneGroup.position.set(rx, ry, rz);
      boneGroup.userData.basePosition = [rx, ry, rz];
      parentGroup.add(boneGroup);
    } else {
      // Tanpa parent: sambungkan langsung ke rootBoneGroup
      const rx = pivot[0] * MODEL_SCALE;
      const ry = pivot[1] * MODEL_SCALE;
      const rz = pivot[2] * MODEL_SCALE;

      boneGroup.position.set(rx, ry, rz);
      boneGroup.userData.basePosition = [rx, ry, rz];
      rootBoneGroup.add(boneGroup);
    }

    // Set rotasi dasar
    const baseRot = bone.rotation || [0, 0, 0];
    boneGroup.rotation.set(
      baseRot[0] * DEG2RAD,
      baseRot[1] * DEG2RAD,
      baseRot[2] * DEG2RAD,
      "ZYX"
    );
  });

  // Tentukan sudut hadap awal menghadap ke arah tengah arena
  const startX = playerConfig.startPos[0];
  const startZ = playerConfig.startPos[2];
  const initialAngle = Math.atan2(startX, startZ); // Menghadap pusat (0, 0)

  rootGroup.rotation.y = initialAngle;
  scene.add(rootGroup);

  return {
    id: playerConfig.id,
    rootGroup,
    rootBoneGroup,
    bonesMap,
    x: startX,
    z: startZ,
    y: playerConfig.startPos[1],
    vx: 0,
    vz: 0,
    speed: playerConfig.speed || 3.8,
    currentAngle: initialAngle,
    animWeightMove: 0.0, // 0 = Idle murni, 1 = Move murni
    idleTime: Math.random() * 2.0, // Stagger animasi idle
    moveTime: 0.0,
  };
}

/**
 * Update Siklus Fisika (Velocity Ringan) dan Animasi Player
 */
export function updatePlayerCharacter(player, delta, inputX, inputY, boundX, boundZ) {
  const mag = Math.hypot(inputX, inputY);
  const isMovingInput = mag > 0.06;

  // 1. Fisika: Velocity Ringan (Inersia Halus & Gesekan)
  const targetVx = inputX * player.speed;
  const targetVz = inputY * player.speed;

  const accel = 14.0; // Akselerasi halus & responsif sesuai kecepatan baru 3.8
  player.vx += (targetVx - player.vx) * Math.min(accel * delta, 1.0);
  player.vz += (targetVz - player.vz) * Math.min(accel * delta, 1.0);

  // Jika input berhenti dan kecepatan sangat kecil, hentikan total
  if (!isMovingInput && Math.hypot(player.vx, player.vz) < 0.08) {
    player.vx = 0;
    player.vz = 0;
  }

  // Update Posisi
  player.x += player.vx * delta;
  player.z += player.vz * delta;

  // Pembatas Arena (Boundary Clamp)
  if (player.x < -boundX) {
    player.x = -boundX;
    player.vx = 0;
  } else if (player.x > boundX) {
    player.x = boundX;
    player.vx = 0;
  }

  if (player.z < -boundZ) {
    player.z = -boundZ;
    player.vz = 0;
  } else if (player.z > boundZ) {
    player.z = boundZ;
    player.vz = 0;
  }

  player.rootGroup.position.x = player.x;
  player.rootGroup.position.z = player.z;

  // 2. Rotasi Arah Hadap (Arah Player Benar Selaras Gerakan)
  const currentSpeed = Math.hypot(player.vx, player.vz);
  if (currentSpeed > 0.15) {
    // Top-down camera: -Z adalah ATAS, +X adalah KANAN
    // Model hadap depan adalah -Z, sehingga sudut target = Math.atan2(-vx, -vz)
    const targetAngle = Math.atan2(-player.vx, -player.vz);
    player.currentAngle = lerpAngle(player.currentAngle, targetAngle, Math.min(14.0 * delta, 1.0));
    player.rootGroup.rotation.y = player.currentAngle;
  }

  // 3. Kontrol Animasi & Kecepatan Proporsional Joystick
  // Perintah: Jika joystick ditarik penuh -> speed 1, jika ditarik pelan -> animasi diperlambat
  const targetWeight = isMovingInput || currentSpeed > 0.3 ? 1.0 : 0.0;
  player.animWeightMove += (targetWeight - player.animWeightMove) * Math.min(10.0 * delta, 1.0);

  // Kecepatan putar animasi move proporsional terhadap tarikan joystick
  const moveAnimRate = Math.max(0.25, Math.min(1.0, mag || currentSpeed / player.speed));
  player.moveTime += delta * moveAnimRate;
  player.idleTime += delta;

  // 4. Evaluasi & Blending Animasi Idle <-> Move (Zero-Allocation & Fast-Path)
  const wMove = Math.max(0, Math.min(1, player.animWeightMove));
  const isPureIdle = wMove <= 0.001;
  const isPureMove = wMove >= 0.999;

  if (isPureIdle) {
    fillIdleAnimation(player.idleTime);
  } else if (isPureMove) {
    fillMoveAnimation(player.moveTime);
  } else {
    fillIdleAnimation(player.idleTime);
    fillMoveAnimation(player.moveTime);
  }

  const wIdle = 1.0 - wMove;

  const boneNames = [
    "root",
    "Waist",
    "Head",
    "Body",
    "Right Arm",
    "Left Arm",
    "Right Leg",
    "Left Leg",
  ];

  for (let bi = 0; bi < boneNames.length; bi++) {
    const name = boneNames[bi];
    const boneGroup = player.bonesMap[name];
    if (!boneGroup) continue;

    const baseRot = boneGroup.userData.baseRotation || [0, 0, 0];
    const basePos = boneGroup.userData.basePosition || [0, 0, 0];

    let rx, ry, rz, px, py, pz;

    if (isPureIdle) {
      const bIdle = IDLE_POSE[name];
      rx = bIdle.rot[0]; ry = bIdle.rot[1]; rz = bIdle.rot[2];
      px = bIdle.pos[0]; py = bIdle.pos[1]; pz = bIdle.pos[2];
    } else if (isPureMove) {
      const bMove = MOVE_POSE[name];
      rx = bMove.rot[0]; ry = bMove.rot[1]; rz = bMove.rot[2];
      px = bMove.pos[0]; py = bMove.pos[1]; pz = bMove.pos[2];
    } else {
      const bIdle = IDLE_POSE[name];
      const bMove = MOVE_POSE[name];
      rx = bIdle.rot[0] * wIdle + bMove.rot[0] * wMove;
      ry = bIdle.rot[1] * wIdle + bMove.rot[1] * wMove;
      rz = bIdle.rot[2] * wIdle + bMove.rot[2] * wMove;
      px = bIdle.pos[0] * wIdle + bMove.pos[0] * wMove;
      py = bIdle.pos[1] * wIdle + bMove.pos[1] * wMove;
      pz = bIdle.pos[2] * wIdle + bMove.pos[2] * wMove;
    }

    boneGroup.rotation.set(
      (baseRot[0] + rx) * DEG2RAD,
      (baseRot[1] + ry) * DEG2RAD,
      (baseRot[2] + rz) * DEG2RAD,
      "ZYX"
    );

    boneGroup.position.set(
      basePos[0] + px * MODEL_SCALE,
      basePos[1] + py * MODEL_SCALE,
      basePos[2] + pz * MODEL_SCALE
    );
  }
}

/**
 * Reset Posisi dan Velocity Player
 */
export function resetPlayerCharacter(player, startPos) {
  player.x = startPos[0];
  player.z = startPos[2];
  player.vx = 0;
  player.vz = 0;
  player.animWeightMove = 0;

  // Arah hadap kembali menghadap pusat (0, 0)
  player.currentAngle = Math.atan2(startPos[0], startPos[2]);
  player.rootGroup.rotation.y = player.currentAngle;
  player.rootGroup.position.set(player.x, player.y, player.z);
}
