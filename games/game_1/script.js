/**
 * ==========================================================================
 * Game 1 - 3D Cube Arena & 4-Player Corner SVG Joysticks (v0.0.3)
 * Menggunakan Three.js dengan Kamera Top-Down 90°, Pencahayaan Kaya, & 16x16 Arena
 * ==========================================================================
 */

import * as THREE from "three";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Elemen DOM
  const playerSelectView = document.getElementById("player-select-view");
  const gameplayView = document.getElementById("gameplay-view");
  const btnMode4P = document.getElementById("btn-mode-4p");
  const btnBackToMain = document.getElementById("btn-back-to-main");
  const btnExitGame = document.getElementById("btn-exit-game");
  const btnResetPositions = document.getElementById("btn-reset-positions");
  const threeContainer = document.getElementById("three-container");
  const landscapeStage = document.getElementById("landscape-stage");

  // 2. Dimensi Arena 16x16 & Fisika
  const ARENA_SIZE = 16;
  const SPACING = 1.0;
  const BLOCK_SIZE = 0.88; // Celah antar kubus ~0.12 agar setiap block terlihat terpisah
  const BLOCK_HEIGHT = 0.6;
  const HALF_SPAN = ((ARENA_SIZE - 1) * SPACING) / 2; // 7.5
  const ARENA_BOUND = HALF_SPAN - 0.1; // Batas pemain agar tidak jatuh dari arena
  const PLAYER_SIZE = 0.9;
  const PLAYER_Y = BLOCK_HEIGHT / 2 + PLAYER_SIZE / 2; // Di atas permukaan balok

  // 3. Konfigurasi 4 Pemain
  const PLAYERS = {
    p1: {
      id: "p1",
      name: "P1",
      color: 0xef4444, // Merah (#ef4444)
      startPos: [-HALF_SPAN + 0.5, PLAYER_Y, HALF_SPAN - 0.5], // Kiri-Bawah (Sudut P1)
      inputX: 0,
      inputY: 0,
      speed: 8.5,
      mesh: null,
    },
    p2: {
      id: "p2",
      name: "P2",
      color: 0x3b82f6, // Biru (#3b82f6)
      startPos: [HALF_SPAN - 0.5, PLAYER_Y, HALF_SPAN - 0.5], // Kanan-Bawah (Sudut P2)
      inputX: 0,
      inputY: 0,
      speed: 8.5,
      mesh: null,
    },
    p3: {
      id: "p3",
      name: "P3",
      color: 0x22c55e, // Hijau (#22c55e)
      startPos: [-HALF_SPAN + 0.5, PLAYER_Y, -HALF_SPAN + 0.5], // Kiri-Atas (Sudut P3)
      inputX: 0,
      inputY: 0,
      speed: 8.5,
      mesh: null,
    },
    p4: {
      id: "p4",
      name: "P4",
      color: 0xeab308, // Kuning (#eab308)
      startPos: [HALF_SPAN - 0.5, PLAYER_Y, -HALF_SPAN + 0.5], // Kanan-Atas (Sudut P4)
      inputX: 0,
      inputY: 0,
      speed: 8.5,
      mesh: null,
    },
  };

  // 4. Inisialisasi Three.js
  let scene, camera, renderer;
  let isGameRunning = false;
  let animationFrameId = null;
  const clock = new THREE.Clock();

  function initThree() {
    if (renderer) return;

    // A. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080711);

    // B. Camera - 90° Top-Down ke Arah Bawah, Tepat di Tengah Arena
    camera = new THREE.PerspectiveCamera(45, 1.6, 0.1, 200);
    updateCameraToFitArena();

    // C. Renderer
    const initialWidth = landscapeStage ? landscapeStage.clientWidth : window.innerWidth;
    const initialHeight = landscapeStage ? landscapeStage.clientHeight : window.innerHeight;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);

    // D. Sistem Pencahayaan Multi-Arah
    setupLighting();

    // E. Arena 3D: Lantai 16 x 16 Block Cube
    createArenaBlocks();

    // F. Panel Besar Biru di Bawah Seluruh Arena (Air)
    createWaterPanel();

    // G. 4 Karakter Pemain Cube
    createPlayerCubes();
  }

  /**
   * Menghitung posisi kamera 90° tegak lurus ke bawah tepat di tengah (0, 0, 0),
   * memastikan SELURUH 16x16 cube dan batas arena selalu masuk ke dalam frame kamera.
   */
  function updateCameraToFitArena() {
    if (!camera || !landscapeStage) return;
    const width = landscapeStage.clientWidth || window.innerWidth;
    const height = landscapeStage.clientHeight || window.innerHeight;
    const aspect = width / (height || 1);

    camera.aspect = aspect;
    camera.fov = 45;

    // Bentang total arena yang harus masuk frame dengan ruang margin aman (16 blok = 16 unit + margin)
    const arenaVisibleSpan = 21.0;
    const vFovRad = (camera.fov * Math.PI) / 360; // Setengah sudut FOV dalam radian
    const tanHalfFov = Math.tan(vFovRad);

    const distYVertical = arenaVisibleSpan / (2 * tanHalfFov);
    const distYHorizontal = arenaVisibleSpan / (2 * tanHalfFov * aspect);

    // Ambil nilai tertinggi agar semua sudut dan baris kubus selalu masuk frame kamera
    const optimalY = Math.max(distYVertical, distYHorizontal, 27.0);

    // Posisi kamera 90 derajat tepat di atas titik tengah arena (0, optimalY, 0)
    camera.position.set(0, optimalY, 0);

    // Menghadap tegak lurus 90 derajat ke bawah (0, 0, 0)
    // Up vector (0, 0, -1) memastikan -Z adalah arah ATAS layar dan +X adalah KANAN layar
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  /**
   * Sistem Pencahayaan Komprehensif
   * Memberikan kedalaman visual 3D yang tajam saat dilihat dari sudut 90° atas
   */
  function setupLighting() {
    // 1. Hemisphere Light (Pencahayaan Langit & Pantulan Air)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0284c7, 1.3);
    hemiLight.position.set(0, 35, 0);
    scene.add(hemiLight);

    // 2. Directional Key Light (Cahaya Utama dari Sudut Kanan-Bawah)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(18, 30, 18);
    scene.add(keyLight);

    // 3. Directional Fill Light (Cahaya Pengisi dari Sudut Berlawanan Kiri-Atas)
    const fillLight = new THREE.DirectionalLight(0xcfd8dc, 1.2);
    fillLight.position.set(-18, 26, -18);
    scene.add(fillLight);

    // 4. Directional Accent Light (Mempertegas Tepi Kubus)
    const accentLight = new THREE.DirectionalLight(0xe0e7ff, 0.9);
    accentLight.position.set(-15, 25, 15);
    scene.add(accentLight);

    // 5. Point Light di Atas Tengah Arena untuk Gradasi Sentral
    const centerPointLight = new THREE.PointLight(0xffffff, 0.7, 40);
    centerPointLight.position.set(0, 10, 0);
    scene.add(centerPointLight);
  }

  // Buat 16 x 16 Block Kubus dengan Celah Terpisah & Pola Solid
  function createArenaBlocks() {
    const blockGeo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_HEIGHT, BLOCK_SIZE);

    // Pola warna solid dua nada halus agar setiap balok terlihat kontras dari atas
    const blockMatA = new THREE.MeshStandardMaterial({
      color: 0x384556, // Solid slate grey
      roughness: 0.35,
      metalness: 0.15,
    });

    const blockMatB = new THREE.MeshStandardMaterial({
      color: 0x2d3748, // Slightly darker solid slate
      roughness: 0.38,
      metalness: 0.15,
    });

    const totalBlocks = ARENA_SIZE * ARENA_SIZE;
    const instancedArenaA = new THREE.InstancedMesh(blockGeo, blockMatA, Math.ceil(totalBlocks / 2));
    const instancedArenaB = new THREE.InstancedMesh(blockGeo, blockMatB, Math.ceil(totalBlocks / 2));

    const dummy = new THREE.Object3D();
    let idxA = 0;
    let idxB = 0;

    for (let r = 0; r < ARENA_SIZE; r++) {
      for (let c = 0; c < ARENA_SIZE; c++) {
        const x = (c - (ARENA_SIZE - 1) / 2) * SPACING;
        const z = (r - (ARENA_SIZE - 1) / 2) * SPACING;
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();

        if ((r + c) % 2 === 0) {
          instancedArenaA.setMatrixAt(idxA++, dummy.matrix);
        } else {
          instancedArenaB.setMatrixAt(idxB++, dummy.matrix);
        }
      }
    }

    instancedArenaA.instanceMatrix.needsUpdate = true;
    instancedArenaB.instanceMatrix.needsUpdate = true;
    scene.add(instancedArenaA);
    scene.add(instancedArenaB);
  }

  // Panel Besar Berwarna Biru di Bawah Seluruh Arena (Air)
  function createWaterPanel() {
    const waterGeo = new THREE.BoxGeometry(38, 0.5, 38);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Solid blue water
      roughness: 0.2,
      metalness: 0.1,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, -0.65, 0);
    scene.add(water);
  }

  // Buat 4 Karakter Pemain Menggunakan Cube Geometry
  function createPlayerCubes() {
    const playerGeo = new THREE.BoxGeometry(PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);

    Object.values(PLAYERS).forEach((player) => {
      const mat = new THREE.MeshStandardMaterial({
        color: player.color,
        roughness: 0.25,
        metalness: 0.2,
      });

      const mesh = new THREE.Mesh(playerGeo, mat);
      mesh.position.set(...player.startPos);
      scene.add(mesh);
      player.mesh = mesh;
    });
  }

  // Reset Posisi Semua Pemain ke 4 Sudut Awal
  function resetAllPlayers() {
    Object.values(PLAYERS).forEach((player) => {
      if (player.mesh) {
        player.mesh.position.set(...player.startPos);
      }
      player.inputX = 0;
      player.inputY = 0;
    });

    // Reset posisi visual knob SVG
    document.querySelectorAll(".joy-inner").forEach((knob) => {
      knob.style.transform = "translate(0px, 0px)";
    });
  }

  // Handle Resize untuk Landscape Stage
  function handleResize() {
    if (!renderer || !camera || !landscapeStage) return;
    const width = landscapeStage.clientWidth;
    const height = landscapeStage.clientHeight;
    if (width === 0 || height === 0) return;

    renderer.setSize(width, height);
    updateCameraToFitArena();
  }

  // 5. Game Loop Three.js
  function tick() {
    if (!isGameRunning) return;

    const delta = Math.min(clock.getDelta(), 0.1);

    // Update Pergerakan 4 Pemain Berdasarkan Input Joystick
    Object.values(PLAYERS).forEach((player) => {
      if (!player.mesh) return;

      if (player.inputX !== 0 || player.inputY !== 0) {
        // Gerakan X (Kiri/Kanan di layar)
        player.mesh.position.x += player.inputX * player.speed * delta;
        // Gerakan Z (Atas/Bawah di layar: inputY positif ke arah bawah layar / +Z)
        player.mesh.position.z += player.inputY * player.speed * delta;

        // Batasi agar pemain tetap di area permukaan arena 16x16
        player.mesh.position.x = Math.max(-ARENA_BOUND, Math.min(ARENA_BOUND, player.mesh.position.x));
        player.mesh.position.z = Math.max(-ARENA_BOUND, Math.min(ARENA_BOUND, player.mesh.position.z));
      }
    });

    // Render Scene 3D
    renderer.render(scene, camera);

    animationFrameId = requestAnimationFrame(tick);
  }

  // 6. Sistem Kontrol Virtual Joystick SVG (Multi-Touch Simultan)
  const activeTouchMap = {}; // touch.identifier -> { updateFn, resetFn }

  function setupSvgJoystick(playerKey, elementId) {
    const zone = document.getElementById(elementId);
    if (!zone) return;

    const knob = zone.querySelector(".joy-inner");

    function updateKnob(clientX, clientY) {
      const rect = zone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = rect.width * 0.36;

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      // Transform knob SVG secara langsung
      knob.style.transform = `translate(${dx}px, ${dy}px)`;

      // Normalisasi input (-1 hingga 1)
      PLAYERS[playerKey].inputX = dx / maxRadius;
      PLAYERS[playerKey].inputY = dy / maxRadius;
    }

    function resetKnob() {
      knob.style.transform = "translate(0px, 0px)";
      PLAYERS[playerKey].inputX = 0;
      PLAYERS[playerKey].inputY = 0;
    }

    // Touch Event Handling
    zone.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
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

  // Global Touch Listeners untuk Multi-Touch 4 Pemain Simultan
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

  // Inisialisasi 4 Joystick SVG di 4 Sudut
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

  // 7. Transisi Layar
  function start4PGame() {
    playerSelectView.classList.remove("active");
    playerSelectView.classList.add("hidden");

    gameplayView.classList.remove("hidden");
    gameplayView.classList.add("active");

    initThree();
    handleResize();
    resetAllPlayers();

    isGameRunning = true;
    clock.start();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(tick);
  }

  function exitToPlayerSelect() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);

    gameplayView.classList.remove("active");
    gameplayView.classList.add("hidden");

    playerSelectView.classList.remove("hidden");
    playerSelectView.classList.add("active");
  }

  // Event Listeners Navigasi (Relatif agar kompatibel dengan GitHub Pages)
  if (btnMode4P) {
    btnMode4P.addEventListener("click", start4PGame);
  }

  if (btnBackToMain) {
    btnBackToMain.addEventListener("click", () => {
      window.location.href = "../../index.html";
    });
  }

  if (btnExitGame) {
    btnExitGame.addEventListener("click", exitToPlayerSelect);
  }

  if (btnResetPositions) {
    btnResetPositions.addEventListener("click", resetAllPlayers);
  }

  window.addEventListener("resize", handleResize);
});
