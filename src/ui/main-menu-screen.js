export function initMainMenuScreen({ root, onMatch, onFreePlay }) {
  root.querySelector('#btn-match').addEventListener('click', onMatch);
  root.querySelector('#btn-freeplay').addEventListener('click', onFreePlay);
}

/** Match Mode: belum memiliki gameplay pada prototype, hanya placeholder dengan navigasi kembali. */
export function initMatchScreen({ root, onBack }) {
  root.querySelector('#btn-match-back').addEventListener('click', onBack);
}
