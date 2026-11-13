import * as THREE from "three";
import { PlayerManager } from "../../core/player-manager.js";
import { normalizePlayerInput } from "../../core/input-manager.js";
import { sendToCore, MessageType } from "../../core/communication.js";

const root = document.querySelector("#game-root");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0B0D12");

const renderer = new THREE.WebGLRenderer({antialias: false, alpha: false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(root.clientWidth, root.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

const aspect = root.clientWidth / root.clientHeight;
const camera = new THREE.OrthographicCamera(-6.2 * aspect, 6.2 * aspect, 6.2, -6.2, .1, 100);
camera.position.set(0, 18, 0);
camera.up.set(0, 0, -1);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2));
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(-4, 12, 6);
scene.add(light);

// Arena: 10 columns x 6 rows, centered with visible margin around the board.
const board = new THREE.Group();
scene.add(board);
const tileGeometry = new THREE.BoxGeometry(.98, .12, .98);
const tileMaterials = [
  new THREE.MeshStandardMaterial({color: "#D9DDE2", roughness: 1}),
  new THREE.MeshStandardMaterial({color: "#8D969F", roughness: 1})
];
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 10; col++) {
    const tile = new THREE.Mesh(tileGeometry, tileMaterials[(row + col) % 2]);
    tile.position.set(col - 4.5, 0, row - 2.5);
    board.add(tile);
  }
}
const edge = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(10, .13, 6)),
  new THREE.LineBasicMaterial({color: "#F4F6F8", transparent: true, opacity: .45})
);
edge.position.y = .005;
board.add(edge);

const playerManager = new PlayerManager(4);
const playerColors = ["#FF5252", "#42A5F5", "#66BB6A", "#FFCA28"];
const starts = [[-3.5,-1.5],[3.5,-1.5],[-3.5,1.5],[3.5,1.5]];
const players = playerColors.map((color, i) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(.68, .68, .68),
    new THREE.MeshStandardMaterial({color, roughness: .7})
  );
  mesh.position.set(starts[i][0], .48, starts[i][1]);
  scene.add(mesh);
  return mesh;
});

let inputs = Array.from({length: 4}, () => ({x: 0, y: 0, active: false}));
let started = false;
window.addEventListener("message", event => {
  if (event.origin !== location.origin) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === MessageType.INPUT && Array.isArray(data.players)) {
    inputs = data.players.slice(0, 4).map(normalizePlayerInput);
  }
  if (data.type === MessageType.START) started = true;
});

function resize() {
  const w = root.clientWidth, h = root.clientHeight;
  if (!w || !h) return;
  const a = w / h;
  const viewHeight = 6.2;
  camera.left = -viewHeight * a;
  camera.right = viewHeight * a;
  camera.top = viewHeight;
  camera.bottom = -viewHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", resize);

let previous = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - previous) / 1000, .05);
  previous = now;
  if (started) {
    for (let i = 0; i < players.length; i++) {
      const input = inputs[i];
      const speed = 3.4;
      players[i].position.x += input.x * speed * dt;
      players[i].position.z += input.y * speed * dt;
      players[i].position.x = THREE.MathUtils.clamp(players[i].position.x, -4.55, 4.55);
      players[i].position.z = THREE.MathUtils.clamp(players[i].position.z, -2.55, 2.55);
      if (Math.abs(input.x) + Math.abs(input.y) > .08) {
        players[i].rotation.y = Math.atan2(input.x, input.y);
      }
    }
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
sendToCore(MessageType.READY, {controls: {joystick: true, players: 4}});
