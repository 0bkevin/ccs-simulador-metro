import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createBlenderLighting, prepareBlenderMeshes } from "./blender-presentation.js";
import { getStationView } from "./station-views.js";
import { createTrainInterior } from "./train-interior.js";
import { createTrainCab } from './train-cab.js';
import { applyStationCut, createScaleRuler } from './station-inspection.js';
import { createStationCamera } from './station-camera.js';
import { createTrainDoors } from './train-doors.js';

/** World adapter for the reviewed Blender export. Coordinates are deliberately
 * untouched: Blender uses Y up and Z along the playable route. */
export function createWorld(THREE, renderer, stations = [], assets) {
  if (!assets?.train || !assets?.environment) throw new Error("Los modelos Blender aún no están disponibles.");
  const scene = new THREE.Scene();
  const lighting = createBlenderLighting(scene, renderer, assets.manifest);
  const scaleRuler = createScaleRuler(scene);
  scene.fog = new THREE.Fog(0x18212a, 260, 900);
  const root = new THREE.Group();
  root.name = "Caracas Metro L1 · Blender export";
  scene.add(root);
  const environment = assets.environment;
  environment.name = "Blender environment · five stops";
  root.add(environment);
  prepareBlenderMeshes(environment, renderer);
  const collectionRoots = [];
  environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection) collectionRoots.push(o); });
  const stationAssemblies = stations.map(station => collectionRoots.find(o => o.userData.sourceCollection === station.collection));
  if (stationAssemblies.some(o => !o)) throw new Error("Falta una estación Blender en el entorno del juego.");
  const train = assets.train;
  train.name = "Blender train · 7 cars";
  root.add(train);
  prepareBlenderMeshes(train, renderer);
  // PCF shadows cannot represent the alpha glazing. Keep it from casting a
  // solid window-shaped shadow across the passenger saloon or operator desk.
  train.traverse(object => {
    if(object.isMesh) {
      const materials=Array.isArray(object.material)?object.material:[object.material];
      object.castShadow=materials.some(material=>!material.transparent);
    }
  });
  const doors = createTrainDoors(train);

  const cameras = {
    forward: new THREE.PerspectiveCamera(70, 1, 0.05, 1200),
    exterior: new THREE.PerspectiveCamera(68, 1, 0.1, 900),
    platform: new THREE.PerspectiveCamera(68, 1, 0.1, 900),
    inspection: new THREE.PerspectiveCamera(68, 1, .2, 700),
    interior: new THREE.PerspectiveCamera(72, 1, .035, 700),
  };
  const interior = createTrainInterior(train, cameras.interior, renderer, assets.manifest);
  const cab = createTrainCab(train);
  let cameraMode = "platform", inspection = null, revision = 0, activeStation = 0;
  const controls = renderer ? new OrbitControls(cameras.inspection, renderer.domElement) : null;
  const cameraGuard = createStationCamera({ camera: cameras.inspection, controls, environment });
  if (controls) {
    controls.enabled = false;
    controls.enableDamping = false;
    controls.addEventListener("change", () => {
      if (cameraGuard.adjusting) return;
      cameraGuard.constrain(); revision++;
    });
  }
  const activeCamera = () => inspection ? cameras.inspection : cameras[cameraMode];
  function setCameraMode(mode) {
    cameraMode = ["forward", "exterior", "platform", "interior"].includes(mode) ? mode : "platform";
    revision++;
    return activeCamera();
  }
  function inspectStation(index = activeStation, kind = "platform") {
    index = Math.max(0, Math.min(stations.length - 1, Number(index) || 0));
    const view = getStationView(index, kind, cameras.inspection.aspect);
    inspection = { index, ...view };
    for (const root of collectionRoots) root.visible = view.collections.includes(root.userData.sourceCollection);
    applyStationCut(renderer, view);
    scaleRuler.show(index, view.kind);
    const stop = stations[index].distance;
    // Keep the actual consist when it occupies this platform. Distant trains
    // and interstation rails must not float behind an isolated plaza view.
    train.visible = ['platform', 'detail', 'concourse'].includes(view.kind) && train.position.z >= stop - 148 && train.position.z <= stop + 150;
    if (controls) controls.enabled = true;
    cameraGuard.setView(index, view);
    lighting.focus(cameras.inspection.position, view.collection, view.exterior, ['plan', 'section'].includes(view.kind));
    revision++;
    return inspection;
  }
  function leaveInspection() {
    inspection = null;
    applyStationCut(renderer, {}); scaleRuler.hide();
    if (controls) controls.enabled = false;
    cameraGuard.clear();
    collectionRoots.forEach(root => { root.visible = true; });
    train.visible = true;
    revision++;
  }
  function moveTunnel(distance) {
    if (inspection?.kind !== 'tunnel' || !Number.isFinite(Number(distance))) return;
    cameraGuard.moveTunnel(distance);
    lighting.focus(cameras.inspection.position, inspection.collection);
    revision++;
  }
  function update(_dt = 0.016, distance = 0, state = {}) {
    train.position.set(0, 0, Number(distance) || 0);
    doors.update(_dt, state);
    cab.update(state,doors.fraction);
    const z = train.position.z;
    cameras.forward.position.set(0, 2.5, z + 5.0);
    cameras.forward.lookAt(0, 2, z + 15);
    // Frame the architectural core from platform level instead of looking
    // through the outside end wall or down onto the opaque underground roof.
    const car = interior.cars[interior.state.carIndex - 1];
    const anchor = cameraMode === "interior" && car ? z + car.center + car.direction * interior.state.travel : cameraMode === "platform" ? z - 84 : z + 4.6;
    activeStation = stations.findIndex(stop => anchor <= stop.distance + 5);
    if (activeStation < 0) activeStation = stations.length - 1;
    const station = stations[activeStation];
    // The neighboring tunnel lining overlaps the slab ends. Hand off a metre
    // inside either end, leaving clearance for the camera's near-plane corners.
    const inPlatformLane = (position, stop) => position >= stop.distance - 144 && position <= stop.distance + 4;
    const onPlatform = inPlatformLane(anchor, station);
    const island = ["Bellas Artes", "Altamira"].includes(station?.name);
    // Clear camera lanes run beside the escalators and colonnades. The old
    // centerline positions crossed the island cores and Capitolio's stairs.
    const x = island ? 2.5 : station?.name === "Capitolio" ? -2.65 : -3.9;
    cameras.platform.position.set(onPlatform ? x : 0, 2.73, onPlatform ? z - 84 : z + 5);
    cameras.platform.lookAt(onPlatform ? x : 0, 2.98, onPlatform ? z - 69 : z + 23);
    const exteriorAtStation = stations.some(stop => inPlatformLane(z + 4.6, stop));
    cameras.exterior.position.set(exteriorAtStation ? (island ? 7.5 : x) : 0, 2.73, z + 4.6);
    cameras.exterior.lookAt(0, 2.1, exteriorAtStation ? z - 4 : z + 22);
    interior.update(z, cameraMode === "interior" && !inspection, activeCamera().position.z);
    if (inspection) {
      cameraGuard.constrain();
      lighting.focus(cameras.inspection.position, inspection.collection, inspection.exterior, ['plan','section'].includes(inspection.kind));
    } else {
      const target = activeCamera().position.clone();
      const litStation = stations.find(stop => target.z >= stop.distance - 145 && target.z <= stop.distance + 5);
      const tunnelIndex = Math.max(0, stations.findLastIndex(stop => target.z > stop.distance + 5));
      lighting.focus(target, litStation?.collection || `Tunnel ${stations[tunnelIndex].id}`);
    }
  }
  function resize(width, height) {
    Object.values(cameras).forEach((camera) => {
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    });
    if (inspection?.kind === 'plan') {
      const { index } = inspection;
      const view = getStationView(index,'plan',cameras.inspection.aspect);
      inspection = { index, ...view };
      cameraGuard.setView(index,view);
    } else cameraGuard.constrain();
    revision++;
  }
  function dispose() {
    root.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material?.dispose) object.material.dispose();
    });
    controls?.dispose(); cameraGuard.dispose(); lighting.dispose(); interior.dispose(); cab.dispose(); scaleRuler.dispose();
  }
  return {
    scene, root, train, cameras,
    get camera() { return activeCamera(); },
    get inspection() { return inspection; },
    get activeStation() { return activeStation; },
    get renderRevision() { return revision + interior.revision + doors.revision + cab.revision; },
    get doorFraction() { return doors.fraction; },
    doors,
    setCameraMode, inspectStation, leaveInspection, moveTunnel, update, resize, dispose, controls,
    stationAssemblies, railPaths: [], lighting, interior, cab, cameraGuard,
    assetSource: assets.source,
    manifest: assets.manifest,
  };
}

export default createWorld;
