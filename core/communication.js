export const MessageType = Object.freeze({
  READY: "MINIGAME_READY",
  INPUT: "CORE_INPUT",
  START: "CORE_START",
  RESULT: "MINIGAME_RESULT"
});

export function sendToCore(type, payload = {}) {
  if (window.parent === window) return;
  window.parent.postMessage({type, ...payload}, location.origin);
}
