export class OrientationManager {
  static getVisualSize() {
    const portrait = window.matchMedia("(orientation: portrait)").matches;
    return portrait
      ? {width: window.innerHeight, height: window.innerWidth, rotated: true}
      : {width: window.innerWidth, height: window.innerHeight, rotated: false};
  }
}
