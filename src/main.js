import { App } from './app.js';

function showFatal(err) {
  console.error(err);
  document.getElementById('error-text').textContent = String(err?.stack || err?.message || err);
  document.getElementById('error-overlay').hidden = false;
}

const app = new App();
window.__MG__ = { app, engine: app.engine }; // hook debug/pengujian (read-only)

app.start().catch(showFatal);
window.addEventListener('unhandledrejection', (e) => showFatal(e.reason));
