import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadBlenderAssets } from "./blender-assets.js";
import { configureBlenderRenderer, createBlenderLighting, prepareBlenderMeshes } from "./blender-presentation.js";
import { stationViews as stations, getStationView } from "./station-views.js";
import "./style.css";

const mount = document.querySelector("#station-review");
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
configureBlenderRenderer(renderer);
renderer.setSize(innerWidth, innerHeight);
mount.append(renderer.domElement);
const scene = new THREE.Scene();
let lighting;
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .2, 700);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.minDistance = .5; controls.maxDistance = 180;
function render() { if (!document.hidden) renderer.render(scene, camera); }
controls.addEventListener("change", render);

const ui = document.createElement("section");
ui.className = "station-review-ui";
ui.innerHTML = `<a class="back-link" href="/">← SIMULADOR</a><div class="review-kicker">ESTACIONES · MODELOS BLENDER</div><h1 id="stationTitle">Cargando…</h1><p id="stationDetail"></p><label>ESTACIÓN <select id="stationSelect"></select></label><div class="review-actions"><button data-view="platform">ANDÉN</button><button data-view="detail">DETALLE</button><button data-view="concourse">MEZZANINA</button><button data-view="entrance">ACCESO</button><button data-view="south">PLAZA SUR</button></div><p class="review-hint">Arrastra para orbitar · rueda para acercarte.<br>El visor descansa cuando no interactúas.</p><p class="review-hint">Aspecto de referencia: fotografías de 2012. Dimensiones aproximadas y trazado comprimido.</p><a id="stationReference" class="back-link" target="_blank" rel="noopener noreferrer">VER REFERENCIA ORIGINAL ↗</a><p id="stationError" class="review-error" hidden>No se pudo cargar el modelo Blender.</p>`;
mount.append(ui);
const select = ui.querySelector("#stationSelect");
stations.forEach((s, i) => { const o = document.createElement("option"); o.value = i; o.textContent = `${i + 1}. ${s.name}`; select.append(o); });
let environment; let active = 0; let roots = []; let activeView = "platform";
function findRoots(collectionNames) {
  const groups = [];
  environment.traverse((o) => { if (!o.isMesh && o.userData?.sourceCollection) groups.push(o); });
  roots = collectionNames.map((name) => groups.find((o) => o.userData.sourceCollection === name));
  if (roots.some((o) => !o)) throw new Error("Falta una colección de estación en el archivo Blender.");
}
function setView(kind = "platform") {
  if (!environment) return;
  const station = stations[active];
  const view = getStationView(active, kind);
  kind = view.kind;
  activeView = kind;
  environment.traverse((o) => {
    if (!o.isMesh && o.userData.sourceCollection) o.visible = o.userData.sourceCollection === view.collection;
  });
  camera.fov = view.fov;
  camera.updateProjectionMatrix();
  camera.position.fromArray(view.position);
  controls.target.fromArray(view.target);
  controls.update();
  lighting.focus(controls.target, view.collection, view.exterior);
  ui.querySelectorAll("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === kind);
    b.hidden = !view.views.includes(b.dataset.view);
  });
  const url = new URL(location.href); url.searchParams.set("station", station.id); url.searchParams.set("view", kind); history.replaceState(null, "", url);
  render();
}
function inspect(index, view = "platform") {
  active = Math.min(4, Math.max(0, Number(index) || 0)); select.value = active;
  ui.querySelector("#stationTitle").textContent = stations[active].name;
  ui.querySelector("#stationDetail").textContent = stations[active].detail;
  ui.querySelector("#stationReference").href = stations[active].reference;
  setView(view);
}
ui.querySelectorAll("[data-view]").forEach((b) => b.onclick = () => setView(b.dataset.view));
select.onchange = () => inspect(select.value);
loadBlenderAssets({ includeTrain: false }).then((assets) => {
  environment = assets.environment;
  prepareBlenderMeshes(environment, renderer);
  lighting = createBlenderLighting(scene, renderer, assets.manifest);
  window.__metroReview = { environment, scene, camera, controls, renderer, manifest: assets.manifest, assetSource: assets.source, inspect, setView, render, get activeView() { return activeView; } };
  scene.add(environment); findRoots(assets.manifest.stations.map((s) => s.collection));
  const params = new URLSearchParams(location.search);
  const index = stations.findIndex((s) => s.id === params.get("station"));
  inspect(index < 0 ? 0 : index, params.get("view") || "platform");
}).catch((error) => { console.error(error); ui.querySelector("#stationError").hidden = false; });
addEventListener("resize", () => {
  camera.aspect = innerWidth / Math.max(1, innerHeight); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); render();
});
document.addEventListener("visibilitychange", render);
