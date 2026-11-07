/**
 * ==========================================================================
 * GameCube 4Player Mini Game - Root Script (v0.0.2)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const initialScreen = document.getElementById("initial-screen");
  const gameMenuScreen = document.getElementById("game-menu-screen");
  const btnPermainan = document.getElementById("btn-permainan");
  const btnBack = document.getElementById("btn-back-to-initial");
  const btnRotate = document.getElementById("btn-rotate");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const gameGrid = document.getElementById("game-grid");

  const TOTAL_GAME_BOXES = 25;

  /**
   * Render kotak-kotak game:
   * Slot pertama mengarah ke games/game_1
   */
  function renderGameBoxes() {
    if (!gameGrid) return;
    gameGrid.innerHTML = "";

    // 1. Kotak Game 1 (Slot Utama)
    const game1Box = document.createElement("div");
    game1Box.className = "game-box game-1-slot";
    game1Box.setAttribute("role", "button");
    game1Box.setAttribute("tabindex", "0");
    game1Box.setAttribute("aria-label", "Mainkan Game 1");

    const game1Label = document.createElement("span");
    game1Label.className = "game-slot-title";
    game1Label.textContent = "GAME 1";
    game1Box.appendChild(game1Label);

    // Navigasi ke folder games/game_1
    game1Box.addEventListener("click", () => {
      window.location.href = "/games/game_1/index.html";
    });

    gameGrid.appendChild(game1Box);

    // 2. Kotak-kotak berikutnya (slot solid tambahan)
    for (let i = 2; i <= TOTAL_GAME_BOXES; i++) {
      const box = document.createElement("div");
      box.className = "game-box";
      box.setAttribute("role", "button");
      box.setAttribute("tabindex", "0");
      box.setAttribute("aria-label", `Kotak Game ${i}`);

      gameGrid.appendChild(box);
    }
  }

  // Buka Menu Game
  function openGameMenu() {
    if (!initialScreen || !gameMenuScreen) return;
    initialScreen.classList.remove("active");
    initialScreen.classList.add("hidden");
    gameMenuScreen.classList.remove("hidden");
    gameMenuScreen.classList.add("active");
    renderGameBoxes();
  }

  // Kembali ke Halaman Awal
  function backToInitial() {
    if (!initialScreen || !gameMenuScreen) return;
    gameMenuScreen.classList.remove("active");
    gameMenuScreen.classList.add("hidden");
    initialScreen.classList.remove("hidden");
    initialScreen.classList.add("active");
  }

  // Fitur Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback jika API diblokir browser
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Fitur Rotasi Layar (Landscape toggle)
  async function toggleRotation() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        if (screen.orientation.type.includes("portrait")) {
          await screen.orientation.lock("landscape");
        } else {
          await screen.orientation.unlock();
        }
      } else {
        // Fallback visual rotation toggle jika browser tidak mengizinkan orientation lock
        document.body.classList.toggle("simulated-landscape");
      }
    } catch {
      document.body.classList.toggle("simulated-landscape");
    }
  }

  // Event Listeners
  if (btnPermainan) {
    btnPermainan.addEventListener("click", openGameMenu);
  }

  if (btnBack) {
    btnBack.addEventListener("click", backToInitial);
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", toggleFullscreen);
  }

  if (btnRotate) {
    btnRotate.addEventListener("click", toggleRotation);
  }
});
