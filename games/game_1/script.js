/**
 * ==========================================================================
 * Game 1 Script - 4-Player Corner Joysticks & Movement Engine
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Elemen Antarmuka
  const playerSelectView = document.getElementById("player-select-view");
  const gameplayView = document.getElementById("gameplay-view");
  const btnMode4P = document.getElementById("btn-mode-4p");
  const btnBackToMain = document.getElementById("btn-back-to-main");
  const btnExitGame = document.getElementById("btn-exit-game");
  const btnResetPositions = document.getElementById("btn-reset-positions");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  // 2. Data Pemain & Kontrol
  const PLAYERS = {
    p1: {
      id: "p1",
      name: "P1",
      color: "#ef4444",
      glowColor: "rgba(239, 68, 68, 0.4)",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 22,
      inputX: 0,
      inputY: 0,
      speed: 4.8,
    },
    p2: {
      id: "p2",
      name: "P2",
      color: "#3b82f6",
      glowColor: "rgba(59, 130, 246, 0.4)",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 22,
      inputX: 0,
      inputY: 0,
      speed: 4.8,
    },
    p3: {
      id: "p3",
      name: "P3",
      color: "#22c55e",
      glowColor: "rgba(34, 197, 94, 0.4)",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 22,
      inputX: 0,
      inputY: 0,
      speed: 4.8,
    },
    p4: {
      id: "p4",
      name: "P4",
      color: "#eab308",
      glowColor: "rgba(234, 179, 8, 0.4)",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 22,
      inputX: 0,
      inputY: 0,
      speed: 4.8,
    },
  };

  let animationFrameId = null;
  let isGameActive = false;

  // 3. Setup Ukuran Canvas Responsif
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }

  // 4. Inisialisasi Posisi Awal 4 Pemain
  function resetPlayerPositions() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    PLAYERS.p1.x = w * 0.28;
    PLAYERS.p1.y = h * 0.65;
    PLAYERS.p2.x = w * 0.72;
    PLAYERS.p2.y = h * 0.65;
    PLAYERS.p3.x = w * 0.28;
    PLAYERS.p3.y = h * 0.35;
    PLAYERS.p4.x = w * 0.72;
    PLAYERS.p4.y = h * 0.35;

    Object.values(PLAYERS).forEach((p) => {
      p.vx = 0;
      p.vy = 0;
      p.inputX = 0;
      p.inputY = 0;
    });
  }

  // 5. Game Loop & Rendering (60fps)
  function gameLoop() {
    if (!isGameActive) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    // Gambar Garis Lapangan Lembut
    drawArenaField(width, height);

    // Update dan Gambar Masing-masing Pemain
    Object.values(PLAYERS).forEach((player) => {
      // Hitung kecepatan berdasarkan input joystick
      player.vx = player.inputX * player.speed;
      player.vy = player.inputY * player.speed;

      player.x += player.vx;
      player.y += player.vy;

      // Batasi agar pemain tetap di dalam arena layar
      const pad = player.radius + 6;
      if (player.x < pad) player.x = pad;
      if (player.x > width - pad) player.x = width - pad;
      if (player.y < pad) player.y = pad;
      if (player.y > height - pad) player.y = height - pad;

      // Gambar Karakter Player
      drawPlayer(player);
    });

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Gambar Lapangan Mini Game
  function drawArenaField(width, height) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 2;

    // Lingkaran Tengah
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Garis Tengah Horizontal & Vertikal
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.restore();
  }

  // Gambar Karakter Pemain
  function drawPlayer(player) {
    ctx.save();

    // Bayangan / Glow
    ctx.shadowColor = player.glowColor;
    ctx.shadowBlur = 12;

    // Badan Lingkaran Solid
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // Border Karakter
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Teks Label ID Pemain (P1, P2, P3, P4)
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.name, player.x, player.y);

    ctx.restore();
  }

  // 6. Logika Multi-Touch Joystick 4 Sudut
  const activeTouches = {}; // Menyimpan touch identifier -> player key

  function setupJoystick(playerKey, elementId) {
    const zone = document.getElementById(elementId);
    if (!zone) return;

    const base = zone.querySelector(".joystick-base");
    const knob = zone.querySelector(".joystick-knob");

    function updateKnobPosition(clientX, clientY) {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const maxRadius = rect.width * 0.38;

      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }

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

    // Touch Event Handling (Multitouch Simultan)
    zone.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          activeTouches[touch.identifier] = {
            playerKey,
            update: updateKnobPosition,
            reset: resetKnob,
          };
          updateKnobPosition(touch.clientX, touch.clientY);
        }
      },
      { passive: false }
    );

    // Mouse / Pointer Event Handling (Untuk Pengujian di Desktop)
    let isMouseDown = false;

    zone.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      updateKnobPosition(e.clientX, e.clientY);

      function onMouseMove(moveEvent) {
        if (!isMouseDown) return;
        updateKnobPosition(moveEvent.clientX, moveEvent.clientY);
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

  // Global Touch Move & End Listeners untuk Melacak Multi-Touch
  window.addEventListener(
    "touchmove",
    (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (activeTouches[touch.identifier]) {
          activeTouches[touch.identifier].update(touch.clientX, touch.clientY);
        }
      }
    },
    { passive: false }
  );

  function handleTouchEndGlobal(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (activeTouches[touch.identifier]) {
        activeTouches[touch.identifier].reset();
        delete activeTouches[touch.identifier];
      }
    }
  }

  window.addEventListener("touchend", handleTouchEndGlobal);
  window.addEventListener("touchcancel", handleTouchEndGlobal);

  // Inisialisasi 4 Joystick di 4 Sudut
  setupJoystick("p1", "joystick-p1");
  setupJoystick("p2", "joystick-p2");
  setupJoystick("p3", "joystick-p3");
  setupJoystick("p4", "joystick-p4");

  // Dukungan Keyboard Desktop untuk Pengujian Mudah
  const keysDown = {};
  window.addEventListener("keydown", (e) => {
    keysDown[e.key.toLowerCase()] = true;
    updateKeyboardInputs();
  });

  window.addEventListener("keyup", (e) => {
    delete keysDown[e.key.toLowerCase()];
    updateKeyboardInputs();
  });

  function updateKeyboardInputs() {
    // P1: WASD
    let p1X = 0;
    let p1Y = 0;
    if (keysDown["a"]) p1X -= 1;
    if (keysDown["d"]) p1X += 1;
    if (keysDown["w"]) p1Y -= 1;
    if (keysDown["s"]) p1Y += 1;
    if (p1X !== 0 || p1Y !== 0 || (!keysDown["a"] && !keysDown["d"] && !keysDown["w"] && !keysDown["s"])) {
      if (PLAYERS.p1.inputX === 0 && PLAYERS.p1.inputY === 0) {
        PLAYERS.p1.inputX = p1X;
        PLAYERS.p1.inputY = p1Y;
      }
    }

    // P2: Panah (Arrow Keys)
    let p2X = 0;
    let p2Y = 0;
    if (keysDown["arrowleft"]) p2X -= 1;
    if (keysDown["arrowright"]) p2X += 1;
    if (keysDown["arrowup"]) p2Y -= 1;
    if (keysDown["arrowdown"]) p2Y += 1;
    if (p2X !== 0 || p2Y !== 0 || (!keysDown["arrowleft"] && !keysDown["arrowright"] && !keysDown["arrowup"] && !keysDown["arrowdown"])) {
      if (PLAYERS.p2.inputX === 0 && PLAYERS.p2.inputY === 0) {
        PLAYERS.p2.inputX = p2X;
        PLAYERS.p2.inputY = p2Y;
      }
    }

    // P3: IJKL
    let p3X = 0;
    let p3Y = 0;
    if (keysDown["j"]) p3X -= 1;
    if (keysDown["l"]) p3X += 1;
    if (keysDown["i"]) p3Y -= 1;
    if (keysDown["k"]) p3Y += 1;
    if (p3X !== 0 || p3Y !== 0 || (!keysDown["j"] && !keysDown["l"] && !keysDown["i"] && !keysDown["k"])) {
      if (PLAYERS.p3.inputX === 0 && PLAYERS.p3.inputY === 0) {
        PLAYERS.p3.inputX = p3X;
        PLAYERS.p3.inputY = p3Y;
      }
    }

    // P4: TFGH
    let p4X = 0;
    let p4Y = 0;
    if (keysDown["f"]) p4X -= 1;
    if (keysDown["h"]) p4X += 1;
    if (keysDown["t"]) p4Y -= 1;
    if (keysDown["g"]) p4Y += 1;
    if (p4X !== 0 || p4Y !== 0 || (!keysDown["f"] && !keysDown["h"] && !keysDown["t"] && !keysDown["g"])) {
      if (PLAYERS.p4.inputX === 0 && PLAYERS.p4.inputY === 0) {
        PLAYERS.p4.inputX = p4X;
        PLAYERS.p4.inputY = p4Y;
      }
    }
  }

  // 7. Transisi Layar
  function start4PGame() {
    playerSelectView.classList.remove("active");
    playerSelectView.classList.add("hidden");

    gameplayView.classList.remove("hidden");
    gameplayView.classList.add("active");

    resizeCanvas();
    resetPlayerPositions();

    isGameActive = true;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function exitToPlayerSelect() {
    isGameActive = false;
    cancelAnimationFrame(animationFrameId);

    gameplayView.classList.remove("active");
    gameplayView.classList.add("hidden");

    playerSelectView.classList.remove("hidden");
    playerSelectView.classList.add("active");
  }

  // Event Listeners Navigasi
  if (btnMode4P) {
    btnMode4P.addEventListener("click", start4PGame);
  }

  if (btnBackToMain) {
    btnBackToMain.addEventListener("click", () => {
      window.location.href = "/index.html";
    });
  }

  if (btnExitGame) {
    btnExitGame.addEventListener("click", exitToPlayerSelect);
  }

  if (btnResetPositions) {
    btnResetPositions.addEventListener("click", resetPlayerPositions);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
  });
});
