// Layar gameplay: tombol Pause (tengah bawah) + Pause Menu (Lanjut / Ulang / Keluar).

export function initGameScreen({ root, onPause, onResume, onRestart, onExit }) {
  const pauseBtn = root.querySelector('#btn-pause');
  const overlay = root.querySelector('#pause-overlay');

  pauseBtn.addEventListener('click', onPause);
  root.querySelector('#btn-resume').addEventListener('click', onResume);
  root.querySelector('#btn-restart').addEventListener('click', onRestart);
  root.querySelector('#btn-exit').addEventListener('click', onExit);

  return {
    setPaused(paused) {
      overlay.hidden = !paused;
      pauseBtn.hidden = paused;
    },
  };
}
