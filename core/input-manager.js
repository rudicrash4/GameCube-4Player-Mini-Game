// Pointer events are handled by ControlManager. This module provides a stable
// normalized input shape for mini-games and future keyboard/gamepad support.
export function normalizePlayerInput(input = {}) {
  const x = Number.isFinite(input.x) ? Math.max(-1, Math.min(1, input.x)) : 0;
  const y = Number.isFinite(input.y) ? Math.max(-1, Math.min(1, input.y)) : 0;
  return {x, y, active: Boolean(input.active)};
}
