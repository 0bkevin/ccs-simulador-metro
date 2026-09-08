import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadBlenderAssets } from "./blender-assets.js";
import { configureBlenderRenderer, createBlenderLighting, prepareBlenderMeshes } from "./blender-presentation.js";
import { stationViews as stations, getStationView, getTunnelRange } from "./station-views.js";
import { applyStationCut, stationMetrics, createScaleRuler } from "./station-inspection.js";
import "./style.css";

const mount = document.querySelector("#station-review");
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
configureBlenderRenderer(renderer);
renderer.setSize(innerWidth, innerHeight);
mount.append(renderer.domElement);
const scene = new THREE.Scene();
let lighting;
const scaleRuler = createScaleRuler(scene);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .2, 700);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.minDistance = .5; controls.maxDistance = 260;
function render() {
  if (!document.hidden) {
    if (lighting && environment) {
      const view = getStationView(active, activeView, camera.aspect);
      lighting.focus(camera.position, view.collection, view.exterior, ['plan','section'].includes(activeView));
    }
    renderer.render(scene, camera);
  }
}
controls.addEventListener("change", render);

const ui = document.createElement("section");
ui.className = "station-review-ui";
ui.innerHTML = `<a class="back-link" href="/">← SIMULADOR</a><div class="review-kicker">ESTACIONES · ESTUDIO A ESCALA</div><h1 id="stationTitle">Cargando…</h1><p id="stationDetail"></p><label>ESTACIÓN <select id="stationSelect"></select></label><div class="review-actions"><button data-view="platform">ANDÉN</button><button data-view="detail">DETALLE</button><button data-view="concourse">MEZZANINA</button><button data-view="entrance">ACCESO</button><button data-view="south">PLAZA SUR</button><button data-view="plan">PLANTA</button><button data-view="section">CORTE</button><button data-view="tunnel">TÚNEL</button></div><p id="stationMetrics" class="station-metrics"></p><label id="tunnelTravelLabel" hidden>RECORRER TÚNEL <input id="tunnelTravel" type="range" step="1" aria-label="Recorrer túnel en metros"></label><p id="scaleHint" class="review-hint" hidden>Regla amarilla: 50 m, divisiones de 10 m. Corte horizontal a 3,15 m.</p><p class="review-hint">Arrastra para orbitar · rueda para acercarte.<br>El visor descansa cuando no interactúas.</p><details class="station-evidence"><summary>Fuentes y precisión</summary><p id="stationEvidence"></p><p id="stationPlanStatus"></p><p>Aspecto de referencia: 2012. Geometría en metros; conexiones abreviadas para jugar. Planta y corte muestran el modelo, no un plano original.</p></details><a id="stationReference" class="back-link" target="_blank" rel="noopener noreferrer">VER REFERENCIA ORIGINAL ↗</a><p id="stationError" class="review-error" hidden>No se pudo cargar el modelo Blender.</p>`;
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
  const view = getStationView(active, kind, camera.aspect);
  kind = view.kind;
  activeView = kind;
  environment.traverse((o) => {
    if (!o.isMesh && o.userData.sourceCollection) o.visible = view.collections.includes(o.userData.sourceCollection);
  });
  applyStationCut(renderer, view);
  scaleRuler.show(active, kind);
  camera.up.fromArray(view.up);
  camera.fov = view.fov;
  camera.updateProjectionMatrix();
  camera.position.fromArray(view.position);
  controls.target.fromArray(view.target);
  controls.update();
  lighting.focus(camera.position, view.collection, view.exterior, kind === "plan" || kind === "section");
  ui.querySelector("#stationMetrics").textContent = stationMetrics(active, kind);
  ui.querySelector("#scaleHint").hidden = kind !== "plan";
  ui.querySelector("#tunnelTravelLabel").hidden = kind !== "tunnel";
  const range = getTunnelRange(active), travel = ui.querySelector("#tunnelTravel");
  travel.min = range.start + 2; travel.max = range.end - 2; travel.value = camera.position.z;
  ui.querySelectorAll("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === kind);
    b.setAttribute("aria-pressed", b.dataset.view === kind);
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
  ui.querySelector("#stationEvidence").textContent = stations[active].evidence;
  ui.querySelector("#stationPlanStatus").textContent = stations[active].planStatus;
  setView(view);
}
ui.querySelectorAll("[data-view]").forEach((b) => b.onclick = () => setView(b.dataset.view));
select.onchange = () => inspect(select.value);
ui.querySelector("#tunnelTravel").oninput = event => {
  const z = Number(event.target.value); camera.position.set(0, 2.5, z); controls.target.set(0, 2.15, z + 18);
  controls.update(); lighting.focus(camera.position, `Tunnel ${stations[active].id}`); render();
};
loadBlenderAssets({ includeTrain: false }).then((assets) => {
  environment = assets.environment;
  prepareBlenderMeshes(environment, renderer);
  lighting = createBlenderLighting(scene, renderer, assets.manifest);
  window.__metroReview = { environment, scene, camera, controls, renderer, lighting, manifest: assets.manifest, assetSource: assets.source, inspect, setView, render, get activeView() { return activeView; } };
  scene.add(environment); findRoots(assets.manifest.stations.map((s) => s.collection));
  const params = new URLSearchParams(location.search);
  const index = stations.findIndex((s) => s.id === params.get("station"));
  inspect(index < 0 ? 0 : index, params.get("view") || "platform");
}).catch((error) => { console.error(error); ui.querySelector("#stationError").hidden = false; });
addEventListener("resize", () => {
  camera.aspect = innerWidth / Math.max(1, innerHeight); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
  if (activeView === "plan") setView(activeView); else render();
});
document.addEventListener("visibilitychange", render);
