/**
 * ==========================================================================
 * Game 1 - 3D Cube Arena 6×10 (White Blocks) & Fullscreen Portrait (v0.0.5)
 * - Canvas Fullscreen Memenuhi Layar
 * - Arena 6×10 Blok Kubus Putih dengan Jarak/Celah Minimal
 * - Pencahayaan Bayangan Realistis 70° Teroptimasi (PCFShadowMap 1024)
 * - Kamera 90° Top-Down dengan Margin Blok ke Tepi Layar ~10%
 * - Zero-Allocation Animation Solver & Penghapusan Layout Reflow Touch
 * - 4 Joystick SVG di 4 Pojok Layar Portrait & Menu Pause SVG
 * ==========================================================================
 */

import * as THREE from "three";
import {
  createPlayerCharacter,
  updatePlayerCharacter,
  resetPlayerCharacter,
} from "./playerCharacter.js";

function startApp() {
  // 1. Elemen DOM
  const btnPause = document.getElementById("btn-pause");
  const pauseModal = document.getElementById("pause-modal");
  const btnResume = document.getElementById("btn-resume");
  const btnRestart = document.getElementById("btn-restart");
  const btnExit = document.getElementById("btn-exit");
  const threeContainer = document.getElementById("three-container");

  // State Jeda Game
  let isGamePaused = false;

  // 2. Dimensi Arena 6 × 10 & Fisika
  const ARENA_COLS = 6;  // Sumbu X (Lebar = 6 kolom)
  const ARENA_ROWS = 10; // Sumbu Z (Panjang = 10 baris)
  const SPACING = 1.0;
  const BLOCK_SIZE = 0.96; // Jarak/celah antarblock diperkecil (0.04)
  const BLOCK_HEIGHT = 0.55;

  const HALF_SPAN_X = ((ARENA_COLS - 1) * SPACING) / 2; // 2.5
  const HALF_SPAN_Z = ((ARENA_ROWS - 1) * SPACING) / 2; // 4.5

  const ARENA_BOUND_X = HALF_SPAN_X - 0.1; // 2.4
  const ARENA_BOUND_Z = HALF_SPAN_Z - 0.1; // 4.4

  // Posisi kaki karakter tepat menapak di permukaan balok lantai (Y = 0.275)
  const PLAYER_Y = BLOCK_HEIGHT / 2;

  // 3. Konfigurasi 4 Pemain pada 4 Sudut Arena 6 × 10
  const PLAYERS = {
    p1: {
      id: "p1",
      name: "P1",
      color: 0xef4444, // Merah (#ef4444)
      startPos: [-HALF_SPAN_X + 0.5, PLAYER_Y, HALF_SPAN_Z - 0.5], // Sudut Kiri-Bawah (X: -2.0, Z: +4.0)
      inputX: 0,
      inputY: 0,
      speed: 3.8, // Kecepatan nyaman dan terkendali
      character: null,
    },
    p2: {
      id: "p2",
      name: "P2",
      color: 0x3b82f6, // Biru (#3b82f6)
      startPos: [HALF_SPAN_X - 0.5, PLAYER_Y, HALF_SPAN_Z - 0.5], // Sudut Kanan-Bawah (X: +2.0, Z: +4.0)
      inputX: 0,
      inputY: 0,
      speed: 3.8,
      character: null,
    },
    p3: {
      id: "p3",
      name: "P3",
      color: 0x22c55e, // Hijau (#22c55e)
      startPos: [-HALF_SPAN_X + 0.5, PLAYER_Y, -HALF_SPAN_Z + 0.5], // Sudut Kiri-Atas (X: -2.0, Z: -4.0)
      inputX: 0,
      inputY: 0,
      speed: 3.8,
      character: null,
    },
    p4: {
      id: "p4",
      name: "P4",
      color: 0xeab308, // Kuning (#eab308)
      startPos: [HALF_SPAN_X - 0.5, PLAYER_Y, -HALF_SPAN_Z + 0.5], // Sudut Kanan-Atas (X: +2.0, Z: -4.0)
      inputX: 0,
      inputY: 0,
      speed: 3.8,
      character: null,
    },
  };

  // 4. Inisialisasi Three.js
  let scene, camera, renderer;
  let animationFrameId = null;
  const clock = new THREE.Clock();

  function initThree() {
    if (renderer) return;

    // A. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06050e);

    // B. Camera - 90° Top-Down ke Arah Bawah dengan POV 0.9 Radian (~51.566°)
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    const aspect = initialWidth / (initialHeight || 1);

    // Konversi POV 0.9 radian ke derajat (0.9 * 180 / PI ≈ 51.566°)
    const povDegrees = (0.9 * 180) / Math.PI;
    camera = new THREE.PerspectiveCamera(povDegrees, aspect, 0.1, 300);
    camera.zoom = 0.9; // Terapkan faktor skala POV 0.9

    updateCameraToFitArena();

    // C. Renderer Fullscreen Teroptimasi Tinggi
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      precision: "mediump", // Performa tinggi di mobile tanpa kehilangan ketajaman visual
    });
    renderer.setSize(initialWidth, initialHeight);
    // Batasi pixel ratio ke 1.5 untuk mencegah GPU fill-rate throttling di layar ponsel resolusi tinggi
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Jauh lebih ringan & lancar dibanding PCFSoftShadowMap
    threeContainer.appendChild(renderer.domElement);

    // D. Sistem Pencahayaan Multi-Arah dengan Bayangan 70° Teroptimasi
    setupLighting();

    // E. Arena 3D: Lantai 6 × 10 Block Cube Berwarna Putih
    createArenaBlocks();

    // F. Panel Besar Biru di Bawah Seluruh Arena (Air Diperluas)
    createWaterPanel();

    // G. 4 Karakter Pemain Cube di 4 Sudut
    createPlayerCubes();
  }

  /**
   * Menghitung posisi kamera 90° tegak lurus ke bawah tepat di tengah (0, 0, 0),
   * memastikan jarak dari sisi block samping ke tepi layar kamera adalah berkisar 10% (arena 6 kolom mengisi 80% lebar layar).
   */
  function updateCameraToFitArena() {
    if (!camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / (height || 1);

    camera.aspect = aspect;
    camera.fov = (0.9 * 180) / Math.PI; // 0.9 radian
    camera.zoom = 0.9;

    // Lebar arena 6 kolom = 6.0 unit.
    // Agar jarak tepi blok ke sisi layar berkisar 10% di kiri dan 10% di kanan:
    // Blok mengisi 80% lebar layar -> target visible width = 6.0 / 0.80 = 7.5 unit
    const targetWidth = 6.0 / 0.80;  // 7.5 unit (margin kiri 10%, margin kanan 10%)
    const targetHeight = 10.0 / 0.80; // 12.5 unit (untuk arena 10 baris)

    const halfFovRad = 0.45; // 0.9 / 2 radian
    const tanHalfFov = Math.tan(halfFovRad);

    const distYHorizontal = (targetWidth * camera.zoom) / (2 * tanHalfFov * aspect);
    const distYVertical = (targetHeight * camera.zoom) / (2 * tanHalfFov);

    // Ketinggian kamera optimal memastikan jarak dari sisi blok samping berkisar 10% ke tepi layar
    const optimalY = Math.max(distYHorizontal, distYVertical);

    camera.position.set(0, optimalY, 0);

    // 90° Top-Down: menghadap tegak lurus ke bawah (0, 0, 0)
    // Up vector (0, 0, -1) memastikan -Z adalah ATAS dan +X adalah KANAN
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  /**
   * Pencahayaan dengan Bayangan Nyata pada Sudut 70° (Shadow Light 70° Teroptimasi)
   */
  function setupLighting() {
    // 1. Hemisphere Light (Cahaya Langit & Pantulan Air Biru)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0284c7, 1.25);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    // 2. Key Light 70° dengan Bayangan Tajam Lembut (Light 70°)
    // tan(70°) ≈ 2.7475. Y = 18.0 -> horizontal = 6.55 (X = 3.5, Z = 5.5 -> hypot = 6.519)
    // Sudut elevasi: atan2(18.0, 6.519) * 180 / PI = 70.08°
    const shadowLight = new THREE.DirectionalLight(0xffffff, 2.2);
    shadowLight.position.set(3.5, 18.0, 5.5);
    shadowLight.castShadow = true;
    // 1024x1024 adalah resolusi bayangan sangat tajam & ringan di perangkat mobile
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;
    shadowLight.shadow.camera.near = 1.0;
    shadowLight.shadow.camera.far = 35;
    // Frustum presisi membungkus arena 6 × 10
    shadowLight.shadow.camera.left = -5.0;
    shadowLight.shadow.camera.right = 5.0;
    shadowLight.shadow.camera.top = 7.5;
    shadowLight.shadow.camera.bottom = -7.5;
    shadowLight.shadow.bias = -0.0005;
    shadowLight.shadow.normalBias = 0.02;
    scene.add(shadowLight);

    // 3. Fill Light Halus dari Arah Berlawanan
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.7);
    fillLight.position.set(-10, 15, -10);
    scene.add(fillLight);
  }

  // Buat 6 × 10 Block Kubus Berwarna Putih dengan Jarak/Celah Minimal
  function createArenaBlocks() {
    const blockGeo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_HEIGHT, BLOCK_SIZE);

    // Material balok kubus berwarna PUTIH
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Murni Putih Sesuai Permintaan
      roughness: 0.22,
      metalness: 0.08,
    });

    const totalBlocks = ARENA_COLS * ARENA_ROWS; // 60 Blok (6 × 10)
    const instancedArena = new THREE.InstancedMesh(blockGeo, blockMat, totalBlocks);
    instancedArena.castShadow = true;
    instancedArena.receiveShadow = true;
    const dummy = new THREE.Object3D();

    let index = 0;
    for (let r = 0; r < ARENA_ROWS; r++) {
      for (let c = 0; c < ARENA_COLS; c++) {
        const x = (c - (ARENA_COLS - 1) / 2) * SPACING;
        const z = (r - (ARENA_ROWS - 1) / 2) * SPACING;
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        instancedArena.setMatrixAt(index++, dummy.matrix);
      }
    }

    instancedArena.instanceMatrix.needsUpdate = true;
    scene.add(instancedArena);
  }

  // Panel Besar Biru di Bawah Seluruh Arena (Air Diperluas)
  function createWaterPanel() {
    // Diperluas hingga 85 × 110 unit agar air membentang luas di luar arena 6×10
    const waterGeo = new THREE.BoxGeometry(85, 0.6, 110);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Biru Air Segar Solid
      roughness: 0.18,
      metalness: 0.12,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, -0.65, 0);
    water.receiveShadow = true;
    scene.add(water);
  }

  // Buat 4 Karakter Pemain Menggunakan Model Bedrock 3D di 4 Sudut
  function createPlayerCubes() {
    Object.values(PLAYERS).forEach((player) => {
      player.character = createPlayerCharacter(player, scene);
    });
  }

  // Reset Posisi Semua Pemain ke 4 Sudut Awal
  function resetAllPlayers() {
    Object.values(PLAYERS).forEach((player) => {
      if (player.character) {
        resetPlayerCharacter(player.character, player.startPos);
      }
      player.inputX = 0;
      player.inputY = 0;
    });

    // Reset posisi visual knob SVG
    document.querySelectorAll(".joy-inner").forEach((knob) => {
      if (knob instanceof HTMLElement || knob instanceof SVGElement) {
        knob.style.transform = "translate(0px, 0px)";
      }
    });
  }

  // Handle Resize Fullscreen
  function handleResize() {
    if (!renderer || !camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === 0 || height === 0) return;

    renderer.setSize(width, height);
    updateCameraToFitArena();
    refreshAllJoystickMetrics();
  }

  // 5. Game Loop Three.js
  function tick() {
    const delta = Math.min(clock.getDelta(), 0.1);

    // Update Pergerakan, Fisika Velocity, dan Animasi 4 Pemain
    if (!isGamePaused) {
      Object.values(PLAYERS).forEach((player) => {
        if (!player.character) return;
        updatePlayerCharacter(
          player.character,
          delta,
          player.inputX,
          player.inputY,
          ARENA_BOUND_X,
          ARENA_BOUND_Z
        );
      });
    }

    // Render Scene 3D (Tetap render agar adegan 3D terlihat jelas di balik overlay pause)
    renderer.render(scene, camera);

    animationFrameId = requestAnimationFrame(tick);
  }

  // 6. Sistem Kontrol Virtual Joystick SVG di 4 Pojok Layar (Multi-Touch Simultan Bebas Reflow)
  const activeTouchMap = {}; // touch.identifier -> { updateFn, resetFn }
  const joystickMetrics = {};

  function refreshJoystickMetrics(playerKey, zone) {
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    joystickMetrics[playerKey] = {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      maxRadius: rect.width * 0.36,
    };
  }

  function refreshAllJoystickMetrics() {
    ["p1", "p2", "p3", "p4"].forEach((key) => {
      const z = document.getElementById(`joystick-${key}`);
      if (z) refreshJoystickMetrics(key, z);
    });
  }

  function setupSvgJoystick(playerKey, elementId) {
    const zone = document.getElementById(elementId);
    if (!zone) return;

    const knob = zone.querySelector(".joy-inner");
    refreshJoystickMetrics(playerKey, zone);

    function updateKnob(clientX, clientY) {
      if (isGamePaused) return;
      const m = joystickMetrics[playerKey];
      if (!m) return;

      let dx = clientX - m.centerX;
      let dy = clientY - m.centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = m.maxRadius;

      if (dist > maxRadius) {
        const inv = maxRadius / dist;
        dx *= inv;
        dy *= inv;
      }

      // Transform knob SVG menggunakan GPU compositor (translate3d)
      knob.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

      // Normalisasi input (-1 hingga 1)
      PLAYERS[playerKey].inputX = dx / maxRadius;
      PLAYERS[playerKey].inputY = dy / maxRadius;
    }

    function resetKnob() {
      knob.classList.add("releasing");
      knob.style.transform = "translate3d(0px, 0px, 0)";
      setTimeout(() => {
        knob.classList.remove("releasing");
      }, 160);
      PLAYERS[playerKey].inputX = 0;
      PLAYERS[playerKey].inputY = 0;
    }

    // Touch Event Handling dengan metrik ter-cache (Mencegah patah-patah reflow di mobile)
    zone.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        refreshJoystickMetrics(playerKey, zone);
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          activeTouchMap[t.identifier] = {
            updateFn: updateKnob,
            resetFn: resetKnob,
          };
          updateKnob(t.clientX, t.clientY);
        }
      },
      { passive: false }
    );

    // Mouse Event Handling (Untuk Pengujian di Desktop)
    let isMouseDown = false;
    zone.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      refreshJoystickMetrics(playerKey, zone);
      updateKnob(e.clientX, e.clientY);

      function onMouseMove(me) {
        if (!isMouseDown) return;
        updateKnob(me.clientX, me.clientY);
      }

      function onMouseUp() {
        isMouseDown = false;
        resetKnob();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  }

  // Global Touch Listeners untuk Multi-Touch 4 Pemain Simultan (Bebas Reflow)
  window.addEventListener(
    "touchmove",
    (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (activeTouchMap[t.identifier]) {
          activeTouchMap[t.identifier].updateFn(t.clientX, t.clientY);
        }
      }
    },
    { passive: false }
  );

  function handleTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (activeTouchMap[t.identifier]) {
        activeTouchMap[t.identifier].resetFn();
        delete activeTouchMap[t.identifier];
      }
    }
  }

  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("touchcancel", handleTouchEnd);

  // Inisialisasi 4 Joystick SVG di 4 Pojok Layar
  setupSvgJoystick("p1", "joystick-p1");
  setupSvgJoystick("p2", "joystick-p2");
  setupSvgJoystick("p3", "joystick-p3");
  setupSvgJoystick("p4", "joystick-p4");

  // Keyboard Desktop Fallback
  const keysDown = {};
  window.addEventListener("keydown", (e) => {
    keysDown[e.key.toLowerCase()] = true;
    syncKeyboard();
  });

  window.addEventListener("keyup", (e) => {
    delete keysDown[e.key.toLowerCase()];
    syncKeyboard();
  });

  function syncKeyboard() {
    // P1: WASD
    let p1x = 0, p1y = 0;
    if (keysDown["a"]) p1x -= 1;
    if (keysDown["d"]) p1x += 1;
    if (keysDown["w"]) p1y -= 1;
    if (keysDown["s"]) p1y += 1;
    if (p1x !== 0 || p1y !== 0 || (!keysDown["a"] && !keysDown["d"] && !keysDown["w"] && !keysDown["s"])) {
      if (!activeTouchMapCountFor("p1")) {
        PLAYERS.p1.inputX = p1x;
        PLAYERS.p1.inputY = p1y;
      }
    }

    // P2: Panah (Arrow Keys)
    let p2x = 0, p2y = 0;
    if (keysDown["arrowleft"]) p2x -= 1;
    if (keysDown["arrowright"]) p2x += 1;
    if (keysDown["arrowup"]) p2y -= 1;
    if (keysDown["arrowdown"]) p2y += 1;
    if (p2x !== 0 || p2y !== 0 || (!keysDown["arrowleft"] && !keysDown["arrowright"] && !keysDown["arrowup"] && !keysDown["arrowdown"])) {
      if (!activeTouchMapCountFor("p2")) {
        PLAYERS.p2.inputX = p2x;
        PLAYERS.p2.inputY = p2y;
      }
    }

    // P3: IJKL
    let p3x = 0, p3y = 0;
    if (keysDown["j"]) p3x -= 1;
    if (keysDown["l"]) p3x += 1;
    if (keysDown["i"]) p3y -= 1;
    if (keysDown["k"]) p3y += 1;
    if (p3x !== 0 || p3y !== 0 || (!keysDown["j"] && !keysDown["l"] && !keysDown["i"] && !keysDown["k"])) {
      if (!activeTouchMapCountFor("p3")) {
        PLAYERS.p3.inputX = p3x;
        PLAYERS.p3.inputY = p3y;
      }
    }

    // P4: TFGH
    let p4x = 0, p4y = 0;
    if (keysDown["f"]) p4x -= 1;
    if (keysDown["h"]) p4x += 1;
    if (keysDown["t"]) p4y -= 1;
    if (keysDown["g"]) p4y += 1;
    if (p4x !== 0 || p4y !== 0 || (!keysDown["f"] && !keysDown["h"] && !keysDown["t"] && !keysDown["g"])) {
      if (!activeTouchMapCountFor("p4")) {
        PLAYERS.p4.inputX = p4x;
        PLAYERS.p4.inputY = p4y;
      }
    }
  }

  function activeTouchMapCountFor(playerKey) {
    return Object.values(activeTouchMap).some((item) => item.playerKey === playerKey);
  }

  // 7. Kontrol Menu Pause (Lanjutkan, Ulangi, Keluar)
  function openPauseMenu() {
    isGamePaused = true;
    if (pauseModal) {
      pauseModal.classList.add("active");
    }

    // Netralkan input joystick ketika game dipause
    Object.values(PLAYERS).forEach((player) => {
      player.inputX = 0;
      player.inputY = 0;
    });
    document.querySelectorAll(".joy-inner").forEach((knob) => {
      if (knob instanceof HTMLElement || knob instanceof SVGElement) {
        knob.style.transform = "translate(0px, 0px)";
      }
    });
  }

  function closePauseMenu() {
    isGamePaused = false;
    clock.getDelta(); // Reset selisih waktu agar karakter tidak melompat setelah unpause
    if (pauseModal) {
      pauseModal.classList.remove("active");
    }
  }

  if (btnPause) {
    btnPause.addEventListener("click", openPauseMenu);
  }

  if (btnResume) {
    btnResume.addEventListener("click", closePauseMenu);
  }

  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      resetAllPlayers();
      closePauseMenu();
    });
  }

  if (btnExit) {
    btnExit.addEventListener("click", () => {
      window.location.href = "../../index.html";
    });
  }

  // Keyboard shortcut untuk Pause (Escape atau Tombol P)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      if (isGamePaused) {
        closePauseMenu();
      } else {
        openPauseMenu();
      }
    }
  });

  window.addEventListener("resize", handleResize);

  // 8. Mulai Langsung Gameplay 3D Fullscreen
  initThree();
  handleResize();
  resetAllPlayers();
  clock.start();
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(tick);
}

// Jalankan inisialisasi dengan pengecekan readyState
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
