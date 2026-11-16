// Fullscreen (TDD 14): hanya diminta setelah interaksi pengguna; kegagalan ditangani.

export function isFullscreenSupported() {
  return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
}

/** Harus dipanggil langsung dari event handler sentuhan/klik. @returns {Promise<boolean>} */
export async function requestFullscreen() {
  const el = document.documentElement;
  const request = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!request || !isFullscreenSupported()) return false;
  try {
    const result = request.call(el, { navigationUI: 'hide' });
    if (result && typeof result.then === 'function') await result;
  } catch (err) {
    console.warn('Fullscreen ditolak:', err);
    return false;
  }
  try {
    await screen.orientation?.lock?.('landscape'); // tidak didukung di semua perangkat
  } catch { /* abaikan */ }
  return true;
}
