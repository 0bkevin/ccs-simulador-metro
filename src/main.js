import * as THREE from "three";
import researchText from "../docs/RESEARCH.md?raw";
import stationResearchText from "../docs/STATION_REFERENCES.md?raw";
import stationAccuracyText from "../docs/STATION_ACCURACY_REVIEW.md?raw";
import { stationMetrics } from "./station-inspection.js";
import blenderReferenceText from "../docs/BLENDER_REFERENCE_REBUILD.md?raw";
import exteriorReferenceText from "../docs/EXTERIOR_MODEL.md?raw";
import stations, { lineInfo } from "./route.js";
import { createWorld } from "./blender-world.js";
import { loadBlenderAssets } from "./blender-assets.js";
import { configureBlenderRenderer } from "./blender-presentation.js";
import { stationViews, getTunnelTravelRange } from "./station-views.js";
import { createSimulation } from "./simulation.js";
import { createMetroAudio, actualRecordings, audioDescription } from "./audio.js";
import { recordingManifest } from "./audio-recordings.js";
import "./style.css";

async function boot() {
const app = document.querySelector("#app");
app.innerHTML = `<div class="asset-loading" role="status"><div class="asset-loading-mark">M</div><div class="asset-loading-title">Cargando exportación Blender</div><div class="asset-loading-detail" id="assetLoadingDetail">Validando manifest.json…</div></div>`;
let blenderAssets;
try {
  blenderAssets = await loadBlenderAssets({
    onProgress: (label, progress) => {
      const detail = document.querySelector("#assetLoadingDetail");
      if (detail) detail.textContent = `${label} · ${Math.round(progress * 100)}%`;
    },
  });
} catch (error) {
  const message = String(error?.message || error);
  app.innerHTML = `<div class="asset-error" role="alert"><div class="asset-loading-mark">!</div><h1>No se pudo abrir el mundo Blender</h1><p>${message.replace(/[&<>]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[char]))}</p><p>Comprueba que <code>public/models/blender/manifest.json</code>, <code>train.glb</code> y <code>environment.glb</code> estén publicados y vuelve a cargar.</p><button onclick="location.reload()">REINTENTAR</button></div>`;
  throw error;
}
const data = (Array.isArray(stations) ? stations : []).map((station, index) => ({
  ...station,
  ...(blenderAssets.manifest.stations[index] || {}),
  distance: Number(blenderAssets.manifest.stations[index]?.distance ?? station.distance),
}));
app.replaceChildren();
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "low-power",
});
configureBlenderRenderer(renderer);
renderer.setSize(innerWidth, innerHeight);
app.append(renderer.domElement);
const world = createWorld(THREE, renderer, data, blenderAssets);
world.resize(innerWidth, innerHeight);
const sim = createSimulation(data, { routeEnd: getTunnelTravelRange(data.length - 1).max - 5 });
const metroAudio = createMetroAudio({ stops: data, onStatus: syncAudioButton });
window.__metro = {
  world,
  sim,
  audio: metroAudio,
  renderer,
  assetSource: blenderAssets.source,
  manifest: blenderAssets.manifest,
  assetsReady: true,
};

const ui = document.createElement("div");
ui.className = "ui";
ui.innerHTML = `
<div class="topbar"><div class="brand"><i>M</i><span>Metro de Caracas</span></div><div class="route-title">Línea 1 · dirección Altamira</div><div class="clock" id="clock">06:42:18</div></div>
<div class="route-panel"><div class="route-label">Recorrido · ${data.length} estaciones</div><div class="station-list" id="stationList"></div></div>
<div class="next"><div class="route-label">Objetivo</div><strong id="next">Caño Amarillo</strong><span id="distance">PUERTAS ABIERTAS</span></div>
<div class="mode" id="mode">PUERTAS / EMBARQUE</div>
<div class="progress"><b id="progress"></b></div>
<div class="bottom"><div class="hint"><kbd>W</kbd>/<kbd>↑</kbd> tracción &nbsp; <kbd>S</kbd>/<kbd>↓</kbd> freno &nbsp; <kbd>E</kbd> puertas &nbsp; <kbd>Espacio</kbd> emergencia</div><div class="meters"><div class="lever"><button data-a="brake">FRENO</button><button data-a="throttle">TRACCIÓN</button><button data-a="emergency">EMERGENCIA</button></div><div class="speed"><strong id="speed">00</strong><small> km/h</small><div class="bar"><b id="speedbar"></b></div></div></div></div>
<div class="controls"><button id="doors">PUERTAS</button><button id="pause">PAUSA</button><button id="camera">VISTA: EXTERIOR</button><button id="inspect" class="inspect">INSPECCIONAR TREN</button><button id="inspectStations" class="inspect">INSPECCIONAR ESTACIONES</button><button id="recover">RECUPERAR</button><button id="reset">REINICIAR</button><button id="sound">SONIDO</button><label title="Volumen del audio">VOL <input id="volume" type="range" min="0" max="100" value="65" aria-label="Volumen"></label><button id="share">COMPARTIR</button><button id="sources">FUENTES</button></div>
<div class="toast" id="toast"></div>
<div class="overlay" id="intro"><div class="card"><div class="corner">SIMULADOR 01 / CABINA</div><div class="eyebrow">Servicio de pasajeros · turno mañana</div><h1>Línea 1<br>en marcha.</h1><p>Conduce el tren desde Caño Amarillo hasta Altamira. Detente dentro de la zona de parada, abre puertas durante tres segundos y continúa.</p><button class="start" id="start">Abrir cabina</button><button class="secondary" id="inspectIntro">INSPECCIONAR TREN</button><button class="secondary" id="inspectStationsIntro">INSPECCIONAR ESTACIONES</button><p class="fine">Cinco estaciones, andenes de 150 m y túneles para conducir. Recorrido abreviado de 2,16 km. La línea histórica completa tiene ${lineInfo.realStationCount} estaciones.</p></div></div>
<div class="overlay" id="complete" style="display:none"><div class="card"><div class="eyebrow">Servicio finalizado</div><h1>Altamira</h1><p>Has servido las ${data.length} estaciones de este recorrido.</p><p class="scoreline">Puntuación <strong id="finalScore">100</strong></p><button class="start" id="restart">REINICIAR SERVICIO</button><button class="secondary" id="completeSources">VER FUENTES</button></div></div>
<div class="overlay" id="sourceModal" style="display:none"><div class="card source-card"><button class="corner" id="closeSources">CERRAR ×</button><div class="eyebrow">Documentación</div><h1>Fuentes</h1><p>Investigación sobre diseño, estaciones, trenes y mecánica de la Línea 1. Fuentes primarias consultadas:</p><div class="source-links"><a href="https://openjicareport.jica.go.jp/pdf/11789237_03.pdf" target="_blank" rel="noreferrer">JICA · datos de línea</a><a href="https://www.aschinfraestructuras.com/linea-caracas" target="_blank" rel="noreferrer">ASCH · rehabilitación de vía</a><a href="https://admin.cafmobility.com/uploads/281_CAF_Catalogo_General_ES_601604d06c.pdf" target="_blank" rel="noreferrer">CAF · catálogo</a><a href="https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf" target="_blank" rel="noreferrer">INECO · tren CAF y rehabilitación</a><a href="https://www.alstom.com/fr/press-releases-news/2005/9/ALSTOM-remporte-un-contrat-cle-en-main-pour-le-Metro-de-Caracas-au-Venezuela-20050916" target="_blank" rel="noreferrer">Alstom · Metro de Caracas</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm" target="_blank" rel="noreferrer">UrbanRail · Altamira y Bellas Artes</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm" target="_blank" rel="noreferrer">UrbanRail · Capitolio</a><a href="https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm" target="_blank" rel="noreferrer">UrbanRail · Plaza Venezuela</a><a href="https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/" target="_blank" rel="noreferrer">Fundación Arquitectura y Ciudad · Altamira</a><a href="https://recyt.fecyt.es/index.php/CyTET/article/download/83795/61863/276024" target="_blank" rel="noreferrer">Bemergui · arquitectura de estaciones</a></div><p><small>El audio utiliza fragmentos atribuidos a videos del Metro de Caracas. Consulta aquí cada grabación y su fuente.</small></p><button class="secondary" id="realListen">VER GRABACIÓN CAF/ALSTOM</button><iframe id="realFrame" title="Referencia real del Metro de Caracas" style="display:none;width:100%;aspect-ratio:16/9;border:0;margin-top:1rem" allow="autoplay; encrypted-media" allowfullscreen></iframe><div id="audioSources"></div><pre id="researchText"></pre><pre id="stationResearchText"></pre></div></div>`;
app.append(ui);
const stationPanel = document.createElement("section");
stationPanel.className = "station-review-ui in-game-stations";
stationPanel.hidden = true;
stationPanel.setAttribute("aria-label", "Explorar estaciones");
stationPanel.innerHTML = `<button id="returnToGame" class="back-link">← VOLVER A CONDUCIR</button><div class="review-kicker">EXPLORAR ESTACIÓN · JUEGO EN PAUSA</div><h1 id="gameStationTitle"></h1><p id="gameStationDetail"></p><label>ESTACIÓN <select id="gameStationSelect" aria-label="Estación para explorar"></select></label><div class="review-actions"><button data-station-view="platform">ANDÉN</button><button data-station-view="detail">DETALLE</button><button data-station-view="concourse">MEZZANINA</button><button data-station-view="entrance">ACCESO</button><button data-station-view="south">PLAZA SUR</button><button data-station-view="plan">PLANTA</button><button data-station-view="section">CORTE</button><button data-station-view="tunnel">TÚNEL</button></div><p id="gameStationMetrics" class="station-metrics"></p><label id="gameTunnelTravelLabel" hidden>RECORRER TÚNEL <input id="gameTunnelTravel" type="range" step="1" aria-label="Recorrer túnel en metros"></label><p class="review-hint">Planta y corte: geometría del modelo en metros; medidas de estación estimadas.</p><p class="review-hint">Arrastra para mirar · rueda para acercarte.<br>Tu recorrido se conserva. Esc para volver.</p>`;
ui.append(stationPanel);

const $ = (id) => ui.querySelector("#" + id);
const list = $("stationList");
data.forEach((station, index) => {
  const item = document.createElement("div");
  item.className = "station";
  item.textContent = station.name;
  item.dataset.i = index;
  list.append(item);
});
$("researchText").textContent = researchText;
$("stationResearchText").textContent = stationAccuracyText + "\n\n" + stationResearchText;
const modelResearch = document.createElement('pre');
modelResearch.textContent = `${exteriorReferenceText}\n\n${blenderReferenceText}`;
$("stationResearchText").before(modelResearch);
const referencePhoto = document.createElement('a');
referencePhoto.href = 'https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg';
referencePhoto.target = '_blank'; referencePhoto.rel = 'noopener noreferrer';
referencePhoto.textContent = 'CAF Serie 6 · fotografía original usada para el modelo';
ui.querySelector('.source-links').prepend(referencePhoto);
$("audioSources").textContent = audioDescription.authenticity;
actualRecordings.forEach((recording) => {
  const link = document.createElement("a");
  link.href = recording.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `${recording.title} — ${recording.creator}`;
  link.style.display = "block";
  $("audioSources").append(link);
});
const audioReview = document.createElement("details");
const audioSummary = document.createElement("summary");
audioSummary.textContent = "ESCUCHAR LOS 17 FRAGMENTOS DEL JUEGO";
audioReview.append(audioSummary);
const audioLabels = {
  idle: "Tren detenido", rolling: "Rodadura en túnel", traction: "Salida del CAF", braking: "Frenado del CAF",
  "brake-release": "Final de la parada", "doors-open": "Apertura de puertas", "doors-close": "Aviso y cierre de puertas",
};
for (const [id, clip] of Object.entries(recordingManifest.clips)) {
  const station = data.find(stop => id.endsWith(stop.id));
  const label = audioLabels[id] || `${id.startsWith("arrival-") ? "Anuncio" : "Ambiente"} · ${station?.name || id}`;
  const row = document.createElement("div"); row.className = "audio-recording";
  const title = document.createElement("div"); title.textContent = label;
  const player = document.createElement("audio"); player.controls = true; player.preload = "none";
  player.src = clip.url; player.setAttribute("aria-label", label);
  player.addEventListener("play", () => {
    audioReview.querySelectorAll("audio").forEach(other => { if (other !== player) other.pause(); });
    $("realFrame").src = ""; $("realFrame").style.display = "none";
  });
  const source = document.createElement("a"); source.href = `https://www.youtube.com/watch?v=${clip.source}&t=${Math.floor(clip.start)}s`;
  source.target = "_blank"; source.rel = "noopener noreferrer"; source.textContent = "Ver fragmento original ↗";
  row.append(title, player, source); audioReview.append(row);
}
$("audioSources").append(audioReview);
$("realListen").onclick = () => {
  audioReview.querySelectorAll("audio").forEach(player => player.pause());
  $("realFrame").src = "https://www.youtube-nocookie.com/embed/Ej0X90zrtNg";
  $("realFrame").style.display = "block";
};

let throttle = false;
let brake = false;
let emergency = false;
let cameraMode = 0;
const cameraModes = ["platform", "exterior", "forward", "interior"];
const cameraLabels = { platform: "ANDÉN", exterior: "EXTERIOR", forward: "MARCHA", interior: "INTERIOR" };
$("camera").textContent = "VISTA: ANDÉN";
let soundOn = false;
let soundRequest = 0;
function syncAudioButton(status) {
  soundOn = status.enabled;
  $("sound").textContent = !soundOn ? "SONIDO" : status.loading ? "CARGANDO AUDIO…" : "SONIDO ON";
  $("sound").setAttribute("aria-pressed", String(soundOn));
}
function updateAudio(dt = 0, state = sim.state) {
  metroAudio.update(dt, { ...state, hidden: document.hidden, doorFraction: world.doorFraction,
    doorAudio: world.doors.audio, throttle: throttle && world.doorFraction < 0.001,
    brake, emergency, cameraMode: cameraModes[cameraMode] });
}
function togglePause() {
  sim.pause();
  last = performance.now();
  updateAudio();
  toast(sim.state.paused ? "Pausa" : "Continuar");
}
let sourcePaused = false;
let sourceOpen = false;
let lastComplete = false;
let inspectionPaused = false;
const stationSelect = $("gameStationSelect");
data.forEach((station, index) => {
  const option = document.createElement("option");
  option.value = index; option.textContent = station.name; stationSelect.append(option);
});
function inspectStation(index = world.activeStation, kind = "platform") {
  if (!world.inspection) {
    inspectionPaused = sim.state.paused;
    setInputState(false); emergency = false;
    sim.pause(true);
    updateAudio();
  }
  const view = world.inspectStation(index, kind);
  const station = stationViews[view.index];
  stationSelect.value = view.index;
  $("gameStationTitle").textContent = station.name;
  $("gameStationDetail").textContent = station.detail;
  $("gameStationMetrics").textContent = stationMetrics(view.index, view.kind);
  $("gameTunnelTravelLabel").hidden = view.kind !== "tunnel";
  const tunnelRange = getTunnelTravelRange(view.index);
  $("gameTunnelTravel").min = tunnelRange.min; $("gameTunnelTravel").max = tunnelRange.max;
  $("gameTunnelTravel").value = world.camera.position.z;
  stationPanel.querySelectorAll("[data-station-view]").forEach(button => {
    button.hidden = !view.views.includes(button.dataset.stationView);
    button.classList.toggle("active", button.dataset.stationView === view.kind);
    button.setAttribute("aria-pressed", button.dataset.stationView === view.kind);
  });
  stationPanel.hidden = false;
  interiorPanel.hidden = true;
  ui.classList.add("station-inspecting");
}
function leaveStation() {
  world.leaveInspection();
  stationPanel.hidden = true;
  ui.classList.remove("station-inspecting");
  interiorPanel.hidden = cameraModes[cameraMode] !== "interior";
  sim.pause(inspectionPaused);
  last = performance.now();
  updateAudio();
}
stationSelect.onchange = () => inspectStation(Number(stationSelect.value));
stationPanel.querySelectorAll("[data-station-view]").forEach(button => {
  button.onclick = () => inspectStation(world.inspection.index, button.dataset.stationView);
});
$("returnToGame").onclick = leaveStation;
$("gameTunnelTravel").oninput = event => {
  world.moveTunnel(event.target.value);
  event.target.value = world.camera.position.z;
};

const interiorPanel = document.createElement("section");
interiorPanel.className = "interior-controls"; interiorPanel.hidden = true;
interiorPanel.setAttribute("aria-label", "Interior del tren");
interiorPanel.innerHTML = `<div class="route-label">Interior · CAF Serie 6</div><label>COCHE <select id="interiorCar" aria-label="Coche del tren"></select></label><div class="interior-presets"><button data-interior-view="saloon">SALÓN</button><button data-interior-view="seats">ASIENTOS</button><button data-interior-view="doors">PUERTAS</button><button data-interior-view="gangway">INTERCONEXIÓN</button><button data-interior-view="operator">PUESTO DEL OPERADOR</button><button data-interior-view="cab-seat">ASIENTO DEL OPERADOR</button></div><label id="interiorTravelLabel">RECORRER COCHE <input id="interiorTravel" type="range" min="-9.6" max="7.6" step=".01" value="6.63" aria-label="Posición dentro del coche"></label><p>Arrastra para mirar alrededor.<br>W / S controlan el tren · E abre o cierra puertas.</p>`;
ui.append(interiorPanel);
for (let index = 1; index <= 7; index++) {
  const option = document.createElement("option"); option.value = index;
  option.textContent = `${index} · ${index === 1 || index === 7 ? "Extremo" : "Intermedio"}`;
  $("interiorCar").append(option);
}
function interiorPreset(kind = "saloon") {
  world.interior.select(Number($("interiorCar").value), kind);
  $("interiorCar").value = world.interior.state.carIndex;
  $("interiorTravelLabel").hidden = ['operator','cab-seat'].includes(kind);
  $("interiorTravel").value = world.interior.state.travel;
  interiorPanel.querySelectorAll("[data-interior-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.interiorView === kind);
    button.setAttribute("aria-pressed", button.dataset.interiorView === kind);
  });
}
$("interiorCar").onchange = () => interiorPreset();
$("interiorTravel").oninput = event => world.interior.move(event.target.value);
interiorPanel.querySelectorAll("[data-interior-view]").forEach(button => {
  button.onclick = () => interiorPreset(button.dataset.interiorView);
});
function selectCamera(index) {
  cameraMode = index;
  world.setCameraMode(cameraModes[index]);
  $("camera").textContent = `VISTA: ${cameraLabels[cameraModes[index]]}`;
  interiorPanel.hidden = cameraModes[index] !== "interior";
}
const interiorButton = document.createElement("button");
interiorButton.id = "enterInterior"; interiorButton.className = "inspect";
interiorButton.textContent = "INTERIOR DEL TREN";
interiorButton.onclick = () => { selectCamera(3); interiorPreset(); };
$("camera").after(interiorButton);
const interiorIntro = document.createElement("button");
interiorIntro.className = "secondary"; interiorIntro.textContent = "VER INTERIOR";
interiorIntro.onclick = () => { sim.start(); $("intro").style.display = "none"; selectCamera(3); interiorPreset(); };
$("inspectIntro").after(interiorIntro);

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("show"), 1700);
}

function setInputState(value = false) {
  throttle = value;
  brake = value;
}

function toggleDoors() {
  if (sourceOpen || world.inspection) return;
  const old = sim.state;
  const next = sim.toggleDoors();
  if (old.doorsOpen !== next.doorsOpen) last = performance.now();
  world.doors.update(0, next);
  updateAudio(0, next);
  if (old.doorsOpen !== next.doorsOpen)
    toast(next.doorsOpen ? "Abriendo puertas del andén" : "Cerrando puertas");
  else if (old.paused) toast("Continúa el servicio para accionar las puertas");
  else if (old.speed > .04) toast("Detén el tren para abrir las puertas");
  else if (old.dwell > 0) toast("Espera el embarque");
  else toast("Fuera de zona de parada");
}

function openSources() {
  if (sourceOpen) return;
  setInputState(false);
  emergency = false;
  sourcePaused = sim.state.paused;
  sim.pause(true);
  updateAudio();
  sourceOpen = true;
  $("sourceModal").style.display = "grid";
}

function closeSources() {
  if (!sourceOpen) return;
  sourceOpen = false;
  $("sourceModal").style.display = "none";
  audioReview.querySelectorAll("audio").forEach(player => { player.pause(); player.currentTime = 0; });
  $("realFrame").src = "";
  $("realFrame").style.display = "none";
  sim.pause(sourcePaused);
  last = performance.now();
  updateAudio();
}

function resetService() {
  if (world.inspection) leaveStation();
  setInputState(false);
  emergency = false;
  selectCamera(0);
  metroAudio.reset();
  const state = sim.reset();
  world.doors.reset(sim.state);
  last = performance.now();
  updateAudio();
  $("intro").style.display = "none";
  $("complete").style.display = "none";
  lastComplete = false;
  toast("Servicio reiniciado");
  return state;
}

function command(event) {
  if (world.inspection) {
    if (event.code === "Escape") { event.preventDefault(); leaveStation(); }
    return;
  }
  if (sourceOpen || event.repeat || !sim.state.started) return;
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement ||
    event.target instanceof HTMLTextAreaElement
  )
    return;
  const handled = [
    "KeyW",
    "ArrowUp",
    "KeyS",
    "ArrowDown",
    "Space",
    "KeyE",
    "KeyC",
    "KeyP",
    "KeyR",
  ];
  if (!handled.includes(event.code)) return;
  event.preventDefault();
  if (event.code === "KeyW" || event.code === "ArrowUp") throttle = true;
  if (event.code === "KeyS" || event.code === "ArrowDown") brake = true;
  if (event.code === "Space") {
    emergency = true;
    toast("Freno de emergencia");
  }
  if (event.code === "KeyE") toggleDoors();
  if (event.code === "KeyC") {
    selectCamera((cameraMode + 1) % cameraModes.length);
  }
  if (event.code === "KeyP") {
    togglePause();
  }
  if (event.code === "KeyR") resetService();
}

function release(event) {
  if (event.code === "KeyW" || event.code === "ArrowUp") throttle = false;
  if (event.code === "KeyS" || event.code === "ArrowDown") brake = false;
}

addEventListener("keydown", command);
addEventListener("keyup", release);
addEventListener("blur", () => {
  setInputState(false);
  emergency = false;
  sim.pause(true);
  updateAudio();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    setInputState(false);
    emergency = false;
    sim.pause(true);
    updateAudio();
    audioReview.querySelectorAll("audio").forEach(player => player.pause());
    $("realFrame").src = "";
    $("realFrame").style.display = "none";
  }
});
addEventListener("pagehide", () => metroAudio.update(0, { ...sim.state, hidden: true }));

$("start").onclick = () => {
  sim.start();
  last = performance.now();
  updateAudio();
  $("intro").style.display = "none";
  toast("Caño Amarillo · servicio listo");
};
$("doors").onclick = toggleDoors;
$("pause").onclick = togglePause;
$("recover").onclick = () => {
  sim.recover();
  toast("Tren recuperado · penalización aplicada");
};
$("reset").onclick = resetService;
$("camera").onclick = () => {
  selectCamera((cameraMode + 1) % cameraModes.length);
};
$("inspect").onclick = () => {
  window.location.href = "/model-review.html";
};
$("inspectIntro").onclick = () => {
  window.location.href = "/model-review.html";
};
$("inspectStations").onclick = () => {
  inspectStation();
};
$("inspectStationsIntro").onclick = () => {
  inspectStation();
};
$("sound").setAttribute("aria-pressed", "false");
$("sound").onclick = async () => {
  const request = ++soundRequest;
  const requested = !soundOn;
  soundOn = requested;
  $("sound").textContent = requested ? "CARGANDO AUDIO…" : "SONIDO";
  $("sound").setAttribute("aria-pressed", String(requested));
  await metroAudio.setEnabled(requested);
  if (request !== soundRequest) return;
  const status = metroAudio.status();
  syncAudioButton(status);
  if (requested && !status.loading && !soundOn) {
    toast(status.error || (status.total ? "No se pudo cargar el audio. Pulsa SONIDO para reintentar." : "Grabaciones originales pendientes · consulta FUENTES"));
  } else if (soundOn && status.failed.length) {
    toast("Algunas grabaciones no se pudieron cargar. Vuelve a activar SONIDO para reintentar.");
  }
};
$("volume").oninput = (event) => metroAudio.setVolume(event.target.value);
$("sources").onclick = openSources;
$("share").onclick = async () => {
  const shareData = {
    title: "Metro de Caracas · Línea 1",
    text: "Conduce el Metro de Caracas desde Caño Amarillo hasta Altamira.",
    url: window.location.href,
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      toast("Enlace copiado");
    }
  } catch (error) {
    if (error?.name !== "AbortError") toast("Copia el enlace del navegador");
  }
};
$("completeSources").onclick = openSources;
$("closeSources").onclick = closeSources;
$("restart").onclick = resetService;

document.querySelectorAll("[data-a]").forEach((button) => {
  const down = () => {
    if (sourceOpen || world.inspection) return;
    if (button.dataset.a === "throttle") throttle = true;
    if (button.dataset.a === "brake") brake = true;
    if (button.dataset.a === "emergency") {
      emergency = true;
      toast("Freno de emergencia");
    }
  };
  const up = () => {
    if (button.dataset.a === "throttle") throttle = false;
    if (button.dataset.a === "brake") brake = false;
  };
  button.onpointerdown = down;
  button.onpointerup = up;
  button.onpointercancel = up;
  button.onpointerleave = up;
});

const total = data.at(-1)?.distance || 1;
let last = performance.now();
let lastRenderedState = "";

function update(now) {
  if (document.hidden) {
    last = now;
    requestAnimationFrame(update);
    return;
  }
  const elapsed = Math.max(0, (now - last) / 1000);
  const dt = Math.min(elapsed, 0.05);
  last = now;
  const state = sim.tick(dt, { throttle: throttle && world.doorFraction < 0.001, brake, emergency });
  if (state.speed <= 0.01) emergency = false;
  world.update(state.paused ? 0 : elapsed, state.position, {
    doorsOpen: state.doorsOpen,
    doorSide: state.doorSide,
    speed: state.speed,
    throttle,
    brake,
    emergency,
  });
  updateAudio(dt, state);
  const target = data[state.target];
  const kmh = Math.round(state.speed * 3.6);
  $("speed").textContent = String(kmh).padStart(2, "0");
  $("speedbar").style.width = Math.min(100, (kmh / 65) * 100) + "%";
  $("progress").style.width =
    Math.min(100, (state.position / total) * 100) + "%";
  $("clock").textContent = new Date().toLocaleTimeString("es-VE", {
    hour12: false,
  });
  $("next").textContent = state.complete ? data.at(-1)?.name || "—" : target?.name || "—";
  $("distance").textContent = state.missed
    ? "PARADA OMITIDA · RECUPERAR"
    : state.complete
      ? "FIN DE LÍNEA"
      : state.doorsOpen
        ? `EMBARQUE · ${Math.ceil(state.dwell)} s`
        : `${Math.max(0, Math.round((target?.distance || 0) - state.position))} m · ${state.score} PTS`;
  $("doors").textContent = world.doors.warning ? "AVISO DE CIERRE…" : world.doors.moving
    ? (state.doorsOpen ? "ABRIENDO PUERTAS…" : "CERRANDO PUERTAS…")
    : (state.doorsOpen ? "CERRAR PUERTAS · E" : "ABRIR PUERTAS · E");
  $("pause").textContent = state.paused ? "CONTINUAR" : "PAUSA";
  $("recover").style.display = state.missed ? "" : "none";
  const mode = state.paused
    ? "PAUSA"
    : state.doorsOpen
      ? "PUERTAS / EMBARQUE"
      : emergency
        ? "EMERGENCIA"
        : brake
          ? "FRENANDO"
          : throttle
            ? "TRACCIÓN"
            : "DERIVA";
  const stoppingDistance = target ? (state.speed * state.speed) / (2 * 2.5) : 0;
  $("mode").textContent = `${mode} · PARADA ${Math.round(stoppingDistance)} m`;
  list.querySelectorAll(".station").forEach((item, index) => {
    item.classList.toggle("current", index === state.target);
    item.classList.toggle("passed", index < state.target);
  });
  if (state.complete && !lastComplete) {
    lastComplete = true;
    $("finalScore").textContent = state.score;
    $("complete").style.display = "grid";
  }
  // Static Blender geometry need not be redrawn while the train is stationary.
  const renderedState = `${state.position}:${cameraMode}:${state.doorsOpen}:${world.renderRevision}`;
  if (renderedState !== lastRenderedState) {
    renderer.render(world.scene, world.camera);
    lastRenderedState = renderedState;
  }
  requestAnimationFrame(update);
}

if (['interior','operator'].includes(new URLSearchParams(location.search).get("view"))) {
  selectCamera(3); interiorPreset(new URLSearchParams(location.search).get('view') === 'operator' ? 'operator' : 'saloon');
}
world.update(0, sim.state.position, {
  doorsOpen: sim.state.doorsOpen,
  doorSide: sim.state.doorSide,
  speed: sim.state.speed,
});
renderer.render(world.scene, world.camera);
requestAnimationFrame(update);
addEventListener("resize", () => {
  world.resize(innerWidth, innerHeight);
  renderer.setSize(innerWidth, innerHeight);
  lastRenderedState = "";
});
}

boot().catch((error) => console.error("Metro bootstrap failed", error));
