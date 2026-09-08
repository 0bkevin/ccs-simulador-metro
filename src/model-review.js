import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { loadBlenderAssets } from "./blender-assets.js";
import "./style.css";

const host = document.querySelector("#review-canvas");
const status = document.querySelector("#review-status");
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1; host.append(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x20252a);
const pmrem = new THREE.PMREMGenerator(renderer); const studio = new RoomEnvironment(THREE); const studioTarget = pmrem.fromScene(studio, .04); scene.environment = studioTarget.texture; scene.environmentIntensity = .72;
scene.add(new THREE.HemisphereLight(0xd8e9ff, 0x30343a, 1.55));
const key = new THREE.DirectionalLight(0xffecd1, 2.2); key.position.set(35, 45, 40); scene.add(key);
key.castShadow = true; key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: .1, far: 180 });
key.shadow.normalBias = .025; key.shadow.bias = -.0001;
const fill = new THREE.DirectionalLight(0x87c9ff, 1.1); fill.position.set(-35, 18, -50); scene.add(fill);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x3f454a, roughness: .86 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -.05; scene.add(floor);
floor.receiveShadow = true;
const camera = new THREE.PerspectiveCamera(42, innerWidth / Math.max(1, innerHeight), .1, 2000);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .075;
controls.screenSpacePanning = true; controls.minDistance = 1; controls.maxDistance = 1000; controls.maxPolarAngle = Math.PI * .49;
const buttons = [...document.querySelectorAll("[data-view]")]; const names = { threequarter: "TRES CUARTOS", front: "FRENTE", side: "LATERAL", rear: "TRASERA", full: "TREN COMPLETO" };
let bounds;
function frame(view) {
  if (!bounds) return;
  // Finish any damped orbit before applying an explicit inspection view.
  controls.enableDamping = false; controls.update();
  const c = bounds.getCenter(new THREE.Vector3()); const s = bounds.getSize(new THREE.Vector3());
  const length = Math.max(s.x, s.z); const height = Math.max(2, s.y); const side = Math.max(4, Math.min(24, length * .22)); let position;
  camera.fov = view === "front" ? 20 : 42;
  camera.updateProjectionMatrix();
  if (view === "front") {
    position = new THREE.Vector3(0, 2.05, bounds.max.z + 14);
    controls.target.set(0, 2.05, bounds.max.z - .2);
  }
  else if (view === "threequarter") {
    // The driving cab is at the positive Z end; aim there instead of at the
    // centre of the 7-car consist so the exterior inspection reads the nose.
    const cabTarget = new THREE.Vector3(c.x, c.y + .25, bounds.max.z - 4);
    position = new THREE.Vector3(5.5, 3.1, bounds.max.z + 8);
    cabTarget.set(0, 2.1, bounds.max.z - 2);
    controls.target.copy(cabTarget);
  }
  else if (view === "rear") { position = new THREE.Vector3(-5.5, 3.1, bounds.min.z - 8); controls.target.set(0, 2.1, bounds.min.z + 2); }
  else if (view === "side") { position = new THREE.Vector3(19, 2.8, bounds.max.z - 10); controls.target.set(0, 2.1, bounds.max.z - 10); }
  else position = new THREE.Vector3(c.x + length * .65, c.y + height * .8, bounds.max.z + length * .6);
  camera.position.copy(position); if (view === "full") controls.target.copy(c); controls.update(); controls.enableDamping = true; buttons.forEach((b) => b.classList.toggle("active", b.dataset.view === view)); status.textContent = `${names[view]} · BLENDER GLB`;
}
function fail(error) { console.error(error); status.textContent = "NO SE PUDO CARGAR EL GLB"; document.querySelector("#review-error").hidden = false; }
buttons.forEach((b) => b.addEventListener("click", () => frame(b.dataset.view)));
loadBlenderAssets().then((assets) => { const { train } = assets; window.__metroReview = { train, scene, camera, controls, renderer, bounds: null, manifest: assets.manifest, assetSource: assets.source }; train.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(train); bounds = new THREE.Box3().setFromObject(train, true); window.__metroReview.bounds = bounds; floor.position.y = bounds.min.y - .05; const view = new URLSearchParams(location.search).get("view"); frame(Object.hasOwn(names, view) ? view : "threequarter"); }).catch(fail);
function resize() { camera.aspect = innerWidth / Math.max(1, innerHeight); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
addEventListener("resize", resize); function render() { controls.update(); renderer.render(scene, camera); requestAnimationFrame(render); } render();
