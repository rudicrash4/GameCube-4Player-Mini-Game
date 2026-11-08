/**
 * ==========================================================================
 * GameCube 4Player Mini Game - Root Script
 * Navigasi: Halaman Awal -> Menu Game (Scroll Horizontal & Drag) -> Pemilihan Player -> Games
 * ==========================================================================
 */

function startRootApp() {
  // 1. Elemen Layar (Screens)
  const initialScreen = document.getElementById("initial-screen");
  const gameMenuScreen = document.getElementById("game-menu-screen");
  const playerSelectScreen = document.getElementById("player-select-screen");

  // 2. Tombol Aksi & Kontainer
  const btnPermainan = document.getElementById("btn-permainan");
  const btnBackToInitial = document.getElementById("btn-back-to-initial");
  const btnBackToMenu = document.getElementById("btn-back-to-menu");
  const btnSelect4P = document.getElementById("btn-select-4p");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const gameGrid = document.getElementById("game-grid");
  const menuScrollContainer = document.querySelector(".menu-scroll-container");

  const TOTAL_GAME_BOXES = 30; // Menambahkan lebih banyak slot game untuk digeser ke samping

  /**
   * Helper ganti layar aktif
   */
  function showScreen(targetScreen) {
    [initialScreen, gameMenuScreen, playerSelectScreen].forEach((s) => {
      if (!s) return;
      if (s === targetScreen) {
        s.classList.remove("hidden");
        s.classList.add("active");
      } else {
        s.classList.remove("active");
        s.classList.add("hidden");
      }
    });
  }

  /**
   * Render kotak-kotak game:
   * Slot pertama (Game 1) membuka layar pemilihan pemain di root
   */
  function renderGameBoxes() {
    if (!gameGrid) return;
    gameGrid.innerHTML = "";

    // 1. Kotak Game 1 (Slot Utama)
    const game1Box = document.createElement("div");
    game1Box.className = "game-box game-1-slot";
    game1Box.setAttribute("role", "button");
    game1Box.setAttribute("tabindex", "0");
    game1Box.setAttribute("aria-label", "Pilih Pemain Game 1");

    const game1Label = document.createElement("span");
    game1Label.className = "game-slot-title";
    game1Label.textContent = "GAME 1";
    game1Box.appendChild(game1Label);

    // Klik slot Game 1 -> Masuk ke layar pemilihan pemain (1P, 2P, 3P, 4P) di root index.html
    game1Box.addEventListener("click", () => {
      showScreen(playerSelectScreen);
    });

    gameGrid.appendChild(game1Box);

    // 2. Kotak-kotak berikutnya (slot solid tambahan untuk digeser ke samping)
    for (let i = 2; i <= TOTAL_GAME_BOXES; i++) {
      const box = document.createElement("div");
      box.className = "game-box";
      box.setAttribute("role", "button");
      box.setAttribute("tabindex", "0");
      box.setAttribute("aria-label", `Kotak Game ${i}`);

      const numLabel = document.createElement("span");
      numLabel.className = "game-slot-title";
      numLabel.style.opacity = "0.45";
      numLabel.style.fontSize = "0.9rem";
      numLabel.textContent = `SLOT ${i}`;
      box.appendChild(numLabel);

      gameGrid.appendChild(box);
    }
  }

  /**
   * Mengaktifkan kemampuan geser (Drag to Scroll) mouse & sentuhan halus
   */
  function setupDragToScroll() {
    if (!menuScrollContainer) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    menuScrollContainer.addEventListener("mousedown", (e) => {
      isDown = true;
      menuScrollContainer.classList.add("dragging");
      startX = e.pageX - menuScrollContainer.offsetLeft;
      scrollLeft = menuScrollContainer.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      isDown = false;
      if (menuScrollContainer) {
        menuScrollContainer.classList.remove("dragging");
      }
    });

    menuScrollContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - menuScrollContainer.offsetLeft;
      const walk = (x - startX) * 1.5; // Kecepatan scroll geser
      menuScrollContainer.scrollLeft = scrollLeft - walk;
    });

    // Dukungan scroll roda mouse (wheel) horizontal
    menuScrollContainer.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        menuScrollContainer.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // Buka Menu Game
  function openGameMenu() {
    showScreen(gameMenuScreen);
    renderGameBoxes();
  }

  // Kembali ke Halaman Awal
  function backToInitial() {
    showScreen(initialScreen);
  }

  // Kembali dari Pemilihan Player ke Menu Game
  function backToMenu() {
    showScreen(gameMenuScreen);
  }

  // Masuk ke gameplay game 1 saat mode 4P dipilih
  function launchGame1() {
    window.location.href = "./games/game_1/index.html";
  }

  // Fitur Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Event Listeners
  if (btnPermainan) {
    btnPermainan.addEventListener("click", openGameMenu);
  }

  if (btnBackToInitial) {
    btnBackToInitial.addEventListener("click", backToInitial);
  }

  if (btnBackToMenu) {
    btnBackToMenu.addEventListener("click", backToMenu);
  }

  if (btnSelect4P) {
    btnSelect4P.addEventListener("click", launchGame1);
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", toggleFullscreen);
  }

  setupDragToScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startRootApp);
} else {
  startRootApp();
}
