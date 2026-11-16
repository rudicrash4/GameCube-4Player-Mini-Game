// Scene & lighting milik Dummy Minigame (scene sendiri, bukan milik Core).
import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x20232f);

  // Intensitas dipilih untuk pencahayaan fisik Three.js r155+ (tanpa shadow demi performa mobile).
  const ambient = new THREE.AmbientLight(0xffffff, 1.6);
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(5, 12, 8);
  scene.add(ambient, sun);

  return { scene, lights: [ambient, sun] };
}
