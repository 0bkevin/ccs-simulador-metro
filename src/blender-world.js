import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createBlenderLighting, prepareBlenderMeshes } from "./blender-presentation.js";
import { getStationView } from "./station-views.js";
import { createTrainInterior } from "./train-interior.js";

/** World adapter for the reviewed Blender export. Coordinates are deliberately
 * untouched: Blender uses Y up and Z along the playable route. */
export function createWorld(THREE, renderer, stations = [], assets) {
  if (!assets?.train || !assets?.environment) throw new Error("Los modelos Blender aún no están disponibles.");
  const scene = new THREE.Scene();
  const lighting = createBlenderLighting(scene, renderer, assets.manifest);
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

  const cameras = {
    forward: new THREE.PerspectiveCamera(70, 1, 0.05, 1200),
    exterior: new THREE.PerspectiveCamera(68, 1, 0.1, 900),
    platform: new THREE.PerspectiveCamera(68, 1, 0.1, 900),
    inspection: new THREE.PerspectiveCamera(68, 1, .2, 700),
    interior: new THREE.PerspectiveCamera(72, 1, .035, 700),
  };
  const interior = createTrainInterior(train, cameras.interior, renderer, assets.manifest);
  let cameraMode = "platform", inspection = null, revision = 0, activeStation = 0;
  const controls = renderer ? new OrbitControls(cameras.inspection, renderer.domElement) : null;
  if (controls) {
    controls.enabled = false;
    controls.enableDamping = false;
    controls.minDistance = .5; controls.maxDistance = 180;
    controls.addEventListener("change", () => { revision++; });
  }
  const activeCamera = () => inspection ? cameras.inspection : cameras[cameraMode];
  function setCameraMode(mode) {
    cameraMode = ["forward", "exterior", "platform", "interior"].includes(mode) ? mode : "platform";
    revision++;
    return activeCamera();
  }
  function inspectStation(index = activeStation, kind = "platform") {
    index = Math.max(0, Math.min(stations.length - 1, Number(index) || 0));
    const view = getStationView(index, kind);
    inspection = { index, ...view };
    for (const root of collectionRoots) root.visible = root.userData.sourceCollection === view.collection;
    const stop = stations[index].distance;
    // Keep the actual consist when it occupies this platform. Distant trains
    // and interstation rails must not float behind an isolated plaza view.
    train.visible = !view.exterior && train.position.z >= stop - 148 && train.position.z <= stop + 150;
    cameras.inspection.position.fromArray(view.position);
    cameras.inspection.fov = view.fov;
    cameras.inspection.updateProjectionMatrix();
    cameras.inspection.lookAt(...view.target);
    if (controls) {
      controls.enabled = true;
      controls.target.fromArray(view.target);
      controls.update();
    }
    lighting.focus(new THREE.Vector3(...view.target), view.collection, view.exterior);
    revision++;
    return inspection;
  }
  function leaveInspection() {
    inspection = null;
    if (controls) controls.enabled = false;
    collectionRoots.forEach(root => { root.visible = true; });
    train.visible = true;
    revision++;
  }
  function update(_dt = 0.016, distance = 0) {
    train.position.set(0, 0, Number(distance) || 0);
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
    const island = ["Bellas Artes", "Altamira"].includes(station?.name);
    const x = island ? 5 : station?.name === "Capitolio" ? -6 : -3.9;
    cameras.platform.position.set(x, 2.73, z - 84);
    cameras.platform.lookAt(x, 2.98, z - 69);
    cameras.exterior.position.set(island ? 5.8 : -5.8, 2.73, z + 4.6);
    cameras.exterior.lookAt(0, 2.1, z - 4);
    interior.update(z, cameraMode === "interior" && !inspection, activeCamera().position.z);
    if (!inspection) {
      const target = cameraMode === "interior" ? cameras.interior.position.clone() : new THREE.Vector3(x, 2.98, cameraMode === "platform" ? z - 69 : z - 4);
      lighting.focus(target, station?.collection);
    }
  }
  function resize(width, height) {
    Object.values(cameras).forEach((camera) => {
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    });
  }
  function dispose() {
    root.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material?.dispose) object.material.dispose();
    });
    controls?.dispose(); lighting.dispose(); interior.dispose();
  }
  return {
    scene, root, train, cameras,
    get camera() { return activeCamera(); },
    get inspection() { return inspection; },
    get activeStation() { return activeStation; },
    get renderRevision() { return revision + interior.revision; },
    get doorFraction() { return 0; },
    setCameraMode, inspectStation, leaveInspection, update, resize, dispose, controls,
    stationAssemblies, railPaths: [], lighting, interior,
    assetSource: assets.source,
    manifest: assets.manifest,
  };
}

export default createWorld;
