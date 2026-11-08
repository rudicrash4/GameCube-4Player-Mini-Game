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

// Skala model (34 unit Bedrock * 0.04 = 1.36 unit Three.js)
// Sesuai perintah: tidak terlalu kecil seperti balok datar, tidak terlalu besar dari cube
export const MODEL_SCALE = 0.04;
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
 * Berdasarkan palet warna pemain (P1 Merah, P2 Biru, P3 Hijau, P4 Kuning)
 */
function createPlayerCanvasTexture(primaryHex, darkAccentHex, lightAccentHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Latar belakang transparan
  ctx.clearRect(0, 0, 64, 64);

  // Palet Warna Standar
  const skinTone = "#f7cbab";
  const skinShadow = "#e5b391";
  const white = "#ffffff";
  const darkPants = "#181b2a";
  const darkBoots = "#0f111a";
  const beltColor = "#1e2235";
  const buckleColor = "#f1f5f9";

  // 1. KEPALA (Head Layer 1: UV [0..32, 0..16])
  // Rambut bagian atas / samping
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

  // Rambut depan poni
  ctx.fillStyle = primaryHex;
  ctx.fillRect(8, 8, 8, 2);
  ctx.fillRect(8, 10, 2, 1);
  ctx.fillRect(14, 10, 2, 1);

  // Mata (Kiri & Kanan)
  ctx.fillStyle = white;
  ctx.fillRect(9, 12, 2, 1);
  ctx.fillRect(13, 12, 2, 1);
  ctx.fillStyle = primaryHex; // Pupil warna tema pemain
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(13, 12, 1, 1);

  // Mulut
  ctx.fillStyle = "#cf7162";
  ctx.fillRect(11, 14, 2, 1);

  // 2. KEPALA LAYER LUAR (Head Layer 2 Outer / Helm: UV [32..64, 0..16])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(40, 0, 8, 8); // Up
  ctx.fillRect(48, 0, 8, 8); // Down
  ctx.fillRect(32, 8, 8, 8); // East
  ctx.fillRect(48, 8, 8, 8); // West
  ctx.fillRect(56, 8, 8, 8); // South

  // Bando / Headband depan
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(40, 8, 8, 3);
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(43, 9, 2, 1); // Emblem tengah

  // 3. BADAN (Body Layer 1: UV [16..40, 16..32])
  // Baju Depan (North: [20, 20] sampai [28, 32])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(20, 20, 8, 10);
  // Kerah V-Neck
  ctx.fillStyle = skinTone;
  ctx.fillRect(23, 20, 2, 2);
  // Sabuk pinggang
  ctx.fillStyle = beltColor;
  ctx.fillRect(20, 30, 8, 2);
  ctx.fillStyle = buckleColor;
  ctx.fillRect(23, 30, 2, 2);

  // Baju Belakang (South: [32, 20] sampai [40, 32])
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(32, 20, 8, 10);
  ctx.fillStyle = beltColor;
  ctx.fillRect(32, 30, 8, 2);

  // Sisi Samping Badan (East & West)
  ctx.fillStyle = primaryHex;
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillRect(20, 16, 8, 4); // Bahu atas

  // 4. BADAN LAYER LUAR (Body Layer 2 Outer / Rompi: UV [16..40, 32..48])
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(20, 36, 3, 10); // Rompi kiri
  ctx.fillRect(25, 36, 3, 10); // Rompi kanan
  ctx.fillStyle = lightAccentHex;
  ctx.fillRect(20, 45, 8, 1); // Garis aksen bawah

  // 5. LENGAN KANAN (Right Arm: UV [40..56, 16..32])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(40, 20, 16, 8); // Lengan baju atas
  ctx.fillRect(44, 16, 4, 4); // Bahu atas
  ctx.fillStyle = skinTone;
  ctx.fillRect(40, 28, 16, 4); // Telapak tangan

  // 6. LENGAN KIRI (Left Arm: UV [32..48, 48..64])
  ctx.fillStyle = primaryHex;
  ctx.fillRect(32, 52, 16, 8); // Lengan baju atas
  ctx.fillRect(36, 48, 4, 4); // Bahu atas
  ctx.fillStyle = skinTone;
  ctx.fillRect(32, 60, 16, 4); // Telapak tangan

  // 7. KAKI KANAN (Right Leg: UV [0..16, 16..32])
  ctx.fillStyle = darkPants;
  ctx.fillRect(0, 20, 16, 8); // Celana atas
  ctx.fillRect(4, 16, 4, 4); // Pinggul
  ctx.fillStyle = darkBoots;
  ctx.fillRect(0, 28, 16, 4); // Sepatu boot
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(4, 28, 4, 1); // Lis sepatu warna pemain

  // 8. KAKI KIRI (Left Leg: UV [16..32, 48..64])
  ctx.fillStyle = darkPants;
  ctx.fillRect(16, 52, 16, 8); // Celana atas
  ctx.fillRect(20, 48, 4, 4); // Pinggul
  ctx.fillStyle = darkBoots;
  ctx.fillRect(16, 60, 16, 4); // Sepatu boot
  ctx.fillStyle = darkAccentHex;
  ctx.fillRect(20, 60, 4, 1); // Lis sepatu warna pemain

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
 * Evaluasi track keyframe yang sudah di-parse dan diurutkan
 */
function evalTrack(track, time) {
  if (!track || track.length === 0) return [0, 0, 0];
  if (time <= track[0].time) return track[0].val;
  if (time >= track[track.length - 1].time) return track[track.length - 1].val;

  for (let i = 0; i < track.length - 1; i++) {
    const p0 = track[i];
    const p1 = track[i + 1];
    if (time >= p0.time && time <= p1.time) {
      const alpha = p1.time === p0.time ? 0 : (time - p0.time) / (p1.time - p0.time);
      return [
        p0.val[0] + (p1.val[0] - p0.val[0]) * alpha,
        p0.val[1] + (p1.val[1] - p0.val[1]) * alpha,
        p0.val[2] + (p1.val[2] - p0.val[2]) * alpha,
      ];
    }
  }
  return track[0].val;
}

/**
 * Evaluasi data transformasi Animasi Idle pada waktu t (detik)
 */
function evaluateIdleAnimation(t) {
  // Dalam Molang, math.sin & math.cos menerima derajat
  return {
    root: {
      position: [Math.sin(t * 122.5 * DEG2RAD) * 0.25, 0, 0],
      rotation: [0, 0, 0],
    },
    Waist: {
      position: [0, Math.cos(t * 245 * DEG2RAD) * 0.15 - 0.15, 0],
      rotation: [0, 0, 0],
    },
    Head: {
      position: [0, 0, 0],
      rotation: [
        Math.sin((t * 245 + 25) * DEG2RAD) * -2.75,
        0,
        Math.cos(t * 122.5 * DEG2RAD) * -2.5,
      ],
    },
    Body: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    "Right Arm": {
      position: [0, Math.cos(t * 245 * DEG2RAD) * 0.1 + 0.05, 0],
      rotation: [0, 0, Math.sin(t * 245 * DEG2RAD) * 1.25 + 1.15],
    },
    "Left Arm": {
      position: [0, Math.cos(t * 245 * DEG2RAD) * 0.1 + 0.05, 0],
      rotation: [0, 0, Math.sin(t * 245 * DEG2RAD) * -1.25 - 1.15],
    },
    "Right Leg": {
      position: [0, 0, 0],
      rotation: [0, 0, Math.sin(t * 122.5 * DEG2RAD) * 1.2],
    },
    "Left Leg": {
      position: [0, 0, 0],
      rotation: [0, 0, Math.sin(t * 122.5 * DEG2RAD) * 1.2],
    },
  };
}

/**
 * Evaluasi data transformasi Animasi Move pada waktu t (detik, durasi siklus 0.6667 detik)
 */
function evaluateMoveAnimation(rawT) {
  const moveAnimData = animMoveJson.animations["animation.actor.move"];
  const cycleLength = moveAnimData.animation_length || 0.6667;
  const t = rawT % cycleLength;

  const bodyPos = evalTrack(MOVE_TRACKS.bodyPos, t);
  const headPos = evalTrack(MOVE_TRACKS.headPos, t);
  const rLegRot = evalTrack(MOVE_TRACKS.rLegRot, t);
  const rLegPos = evalTrack(MOVE_TRACKS.rLegPos, t);
  const lLegRot = evalTrack(MOVE_TRACKS.lLegRot, t);
  const lLegPos = evalTrack(MOVE_TRACKS.lLegPos, t);

  return {
    root: {
      position: [0, 0, 0.75],
      rotation: [0, 0, 0],
    },
    Waist: {
      position: [0, 0, 0],
      rotation: [5, 0, -Math.cos(t * 540 * DEG2RAD) * 2],
    },
    Body: {
      position: bodyPos,
      rotation: [0, -Math.sin(t * 540 * DEG2RAD) * 24, 0],
    },
    Head: {
      position: headPos,
      rotation: [
        Math.sin((t * 1080 - 12) * DEG2RAD) * 8,
        -Math.sin((t * 540 - 45) * DEG2RAD) * 6,
        -Math.sin(t * 540 * DEG2RAD) * 4,
      ],
    },
    "Right Arm": {
      position: [0, -Math.cos(t * 1080 * DEG2RAD) * 0.5, 0],
      rotation: [
        Math.sin((t * 540 + 10) * DEG2RAD) * -60,
        Math.sin(t * 540 * DEG2RAD) * 18,
        0,
      ],
    },
    "Left Arm": {
      position: [0, -Math.cos(t * 1080 * DEG2RAD) * 0.5, 0],
      rotation: [
        Math.sin((t * 540 + 10) * DEG2RAD) * 60,
        Math.sin(t * 540 * DEG2RAD) * 18,
        0,
      ],
    },
    "Right Leg": {
      position: rLegPos,
      rotation: rLegRot,
    },
    "Left Leg": {
      position: lLegPos,
      rotation: lLegRot,
    },
  };
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
        mesh.receiveShadow = true;
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
    speed: 8.5,
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

  const accel = 18.0; // Akselerasi halus
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

  // 4. Evaluasi & Blending Animasi Idle <-> Move
  const idlePose = evaluateIdleAnimation(player.idleTime);
  const movePose = evaluateMoveAnimation(player.moveTime);

  const wMove = Math.max(0, Math.min(1, player.animWeightMove));
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

  boneNames.forEach((name) => {
    const boneGroup = player.bonesMap[name];
    if (!boneGroup) return;

    const bIdle = idlePose[name] || { rotation: [0, 0, 0], position: [0, 0, 0] };
    const bMove = movePose[name] || { rotation: [0, 0, 0], position: [0, 0, 0] };

    // Blending rotasi (derajat)
    const rx = bIdle.rotation[0] * wIdle + bMove.rotation[0] * wMove;
    const ry = bIdle.rotation[1] * wIdle + bMove.rotation[1] * wMove;
    const rz = bIdle.rotation[2] * wIdle + bMove.rotation[2] * wMove;

    const baseRot = boneGroup.userData.baseRotation || [0, 0, 0];
    boneGroup.rotation.set(
      (baseRot[0] + rx) * DEG2RAD,
      (baseRot[1] + ry) * DEG2RAD,
      (baseRot[2] + rz) * DEG2RAD,
      "ZYX"
    );

    // Blending translasi posisi
    const px = bIdle.position[0] * wIdle + bMove.position[0] * wMove;
    const py = bIdle.position[1] * wIdle + bMove.position[1] * wMove;
    const pz = bIdle.position[2] * wIdle + bMove.position[2] * wMove;

    const basePos = boneGroup.userData.basePosition || [0, 0, 0];
    boneGroup.position.set(
      basePos[0] + px * MODEL_SCALE,
      basePos[1] + py * MODEL_SCALE,
      basePos[2] + pz * MODEL_SCALE
    );
  });
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
