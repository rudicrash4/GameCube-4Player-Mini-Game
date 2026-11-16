import { isFullscreenSupported, requestFullscreen } from './fullscreen.js';

export function initOpeningScreen({ root, onContinue }) {
  const start = root.querySelector('#btn-fullscreen');
  const skip = root.querySelector('#btn-skip-fullscreen');

  // Jika Fullscreen API tidak ada (mis. iPhone), cukup satu tombol untuk melanjutkan.
  if (!isFullscreenSupported()) skip.hidden = true;

  start.addEventListener('click', () => {
    start.disabled = true;
    // requestFullscreen dipanggil sinkron di dalam handler klik (syarat user gesture).
    requestFullscreen().finally(() => {
      start.disabled = false;
      onContinue(); // lanjut baik fullscreen berhasil maupun gagal
    });
  });
  skip.addEventListener('click', () => onContinue());
}
