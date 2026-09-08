import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { loadBlenderAssets } from "./blender-assets.js";
import "./style.css";

const mount = document.querySelector("#station-review");
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; mount.append(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x101820); const pmrem = new THREE.PMREMGenerator(renderer); const studio = new RoomEnvironment(THREE); const studioTarget = pmrem.fromScene(studio, .04); scene.environment = studioTarget.texture; scene.environmentIntensity = .72; scene.add(new THREE.HemisphereLight(0xd8e9ff, 0x20242b, 1.8));
const key = new THREE.DirectionalLight(0xffead0, 2.1); key.position.set(-30, 45, 30); scene.add(key); const fill = new THREE.DirectionalLight(0x82b8ff, 1.1); fill.position.set(30, 18, -35); scene.add(fill);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 2000); const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.minDistance = 2; controls.maxDistance = 500;
const ui = document.createElement("section"); ui.className = "station-review-ui"; ui.innerHTML = `<a class="back-link" href="/">← SIMULADOR</a><div class="review-kicker">ARQUITECTURA · EXPORTACIÓN BLENDER</div><h1 id="stationTitle">Cargando…</h1><p id="stationDetail">Modelo GLB real, con colecciones nombradas por estación.</p><label>ESTACIÓN <select id="stationSelect"></select></label><div class="review-actions"><button data-view="front">FRENTE</button><button data-view="platform">ANDÉN</button><button data-view="detail">DETALLE</button></div><p class="review-hint">Arrastra para orbitar · rueda para acercarte</p><p id="stationError" class="review-error" hidden>No se encontró environment.glb o sus colecciones de estación.</p>`; mount.append(ui);
const stations = [{ id: "cano-amarillo", name: "Caño Amarillo", distance: 0, detail: "Estación elevada con cubierta reticulada amarilla." }, { id: "capitolio", name: "Capitolio", distance: 160, detail: "Estación subterránea del centro." }, { id: "bellas-artes", name: "Bellas Artes", distance: 320, detail: "Estación subterránea con andén central." }, { id: "plaza-venezuela", name: "Plaza Venezuela", distance: 480, detail: "Complejo de transferencia." }, { id: "altamira", name: "Altamira", distance: 640, detail: "Estación bajo la plaza y avenida Francisco de Miranda." }];
const select = ui.querySelector("#stationSelect"); stations.forEach((s, i) => { const o = document.createElement("option"); o.value = i; o.textContent = `${i + 1}. ${s.name}`; select.append(o); });
let environment; let active = 0; let roots = [];
function findRoots(collectionNames) {
  const groups = [];
  environment.traverse((o) => { if (!o.isMesh && o.userData?.sourceCollection) groups.push(o); });
  roots = collectionNames.map((name) => groups.find((o) => o.userData.sourceCollection === name));
  if (roots.some((o) => !o)) throw new Error("Falta una colección de estación en el archivo Blender.");
}
function setView(kind) {
  controls.enableDamping = false; controls.update();
  const station = stations[active];
  const x = ["Bellas Artes", "Altamira"].includes(station.name) ? 5 : -4.4;
  const z = station.distance;
  camera.fov = kind === "front" ? 68 : 55;
  camera.updateProjectionMatrix();
  if (kind === "detail") {
    camera.position.set(x, 2.72, z - 81);
    controls.target.set(x, 3.4, z - 65);
  } else {
    camera.position.set(x, 2.72, z - 105);
    controls.target.set(x, 3.0, z - 67);
  }
  controls.update();
  controls.enableDamping = true;
  ui.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === kind));
}
function inspect(index, view = "platform") {
  active = Math.min(4, Math.max(0, Number(index) || 0));
  const selected = roots[active]?.userData.sourceCollection;
  environment.traverse((o) => {
    if (!o.isMesh && o.userData.sourceCollection) o.visible = o.userData.sourceCollection === selected;
  });
  select.value = active;
  ui.querySelector("#stationTitle").textContent = stations[active].name;
  ui.querySelector("#stationDetail").textContent = stations[active].detail + " Reconstrucción basada en fotografías.";
  setView(view);
}
ui.querySelectorAll("[data-view]").forEach((b) => b.onclick = () => setView(b.dataset.view)); select.onchange = () => inspect(select.value);
loadBlenderAssets().then((assets) => { environment = assets.environment; const manifest = assets.manifest; window.__metroReview = { environment, scene, camera, controls, renderer, manifest, assetSource: assets.source, inspect, setView }; environment.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(environment); findRoots(manifest.stations.map((s) => s.collection)); inspect(0); }).catch((error) => { console.error(error); ui.querySelector("#stationError").hidden = false; });
function resize() { camera.aspect = innerWidth / Math.max(1, innerHeight); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); } addEventListener("resize", resize); function frame() { controls.update(); renderer.render(scene, camera); requestAnimationFrame(frame); } frame();
