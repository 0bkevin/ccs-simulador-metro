import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

export function configureBlenderRenderer(renderer) {
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .86;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

export function prepareBlenderMeshes(root, renderer) {
  const anisotropy = Math.min(4, renderer?.capabilities.getMaxAnisotropy() || 1);
  root.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      for (const key of ["map", "normalMap", "roughnessMap"]) {
        if (material?.[key]) material[key].anisotropy = anisotropy;
      }
    }
  });
}

export function createBlenderLighting(scene, renderer, manifest) {
  const pmrem = renderer ? new THREE.PMREMGenerator(renderer) : null;
  const studio = pmrem ? new RoomEnvironment() : null;
  const environment = pmrem?.fromScene(studio, .04);
  if (environment) scene.environment = environment.texture;
  scene.background = new THREE.Color(0x18212a);
  scene.environmentIntensity = .35;
  scene.add(new THREE.HemisphereLight(0xe2e8ed, 0x383a3c, .55));
  const key = new THREE.DirectionalLight(0xfff1df, 1.8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: .5, far: 100 });
  key.shadow.bias = -.0002;
  key.shadow.normalBias = .025;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xc4d4e1, .22);
  fill.position.set(30, 18, -35);
  scene.add(fill);

  // glTF does not carry Blender AREA lights. The exporter preserves their
  // transforms, size, color and source power alongside the meshes instead.
  RectAreaLightUniformsLib.init();
  const washes = new Map();
  for (const data of manifest?.lighting?.areaLights || []) {
    // Preserve native proportions; this exposure calibration is not a physical
    // conversion from Blender watts to Three.js photometric units.
    const light = new THREE.RectAreaLight(new THREE.Color().fromArray(data.color), data.power / (data.width * data.height), data.width, data.height);
    light.name = data.name;
    light.position.fromArray(data.position);
    light.quaternion.fromArray(data.quaternion);
    light.userData.sourceCollection = data.collection;
    light.visible = false;
    scene.add(light);
    if (!washes.has(data.collection)) washes.set(data.collection, []);
    washes.get(data.collection).push(light);
  }
  function focus(target, collection, exterior = false) {
    key.target.position.copy(target);
    key.position.copy(target).add(new THREE.Vector3(-18, 28, -12));
    // Only one station's three native washes participates in each frame.
    for (const [name, lights] of washes) for (const light of lights) light.visible = !exterior && name === collection;
  }
  return { focus, washes, dispose() { environment?.dispose(); studio?.dispose(); pmrem?.dispose(); key.shadow.dispose(); } };
}
