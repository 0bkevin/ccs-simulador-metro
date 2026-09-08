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
  const anisotropy = Math.min(8, renderer?.capabilities.getMaxAnisotropy() || 1);
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
  const ambient = new THREE.HemisphereLight(0xe2e8ed, 0x383a3c, .55);
  scene.add(ambient);
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
  const sources = (manifest?.lighting?.areaLights || []).map(data => ({ ...data,
    point: new THREE.Vector3(...data.position), rotation: new THREE.Quaternion(...data.quaternion) }));
  // Fixed-size pool keeps the hundreds of native fixture sources affordable.
  // Every active emitter retains an authored fixture's EXACT position and size;
  // no invented lights slide along the tunnel with the camera.
  const fixtureLights = Array.from({ length: 24 }, () => {
    const light = new THREE.RectAreaLight(0xffffff, 0, 1, 1);
    scene.add(light); return light;
  });
  // WebGL RectAreaLight has no shadow maps. Two co-located spot proxies carry
  // a small share of the nearest fixtures' output for local occlusion. Cycles
  // uses the original area sources and full area shadows instead.
  const shadowLights = Array.from({ length: 2 }, () => {
    const light = new THREE.SpotLight(0xffffff, 0, 20, Math.PI * .43, .65, 2);
    light.castShadow = true; light.shadow.mapSize.set(512, 512);
    light.shadow.camera.near = .08; light.shadow.bias = -.0001; light.shadow.normalBias = .012;
    scene.add(light, light.target); return light;
  });
  const direction = new THREE.Vector3();
  const smooth = t => { t = THREE.MathUtils.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  function focus(target, collection, exterior = false, drawing = false) {
    const tunnel = collection?.startsWith('Tunnel ');
    const daylight = exterior || collection === 'Station Caño Amarillo' || drawing;
    scene.background.set(daylight ? 0x18212a : 0x060808);
    ambient.intensity = daylight ? .48 : tunnel ? .035 : .13;
    key.intensity = daylight ? 1.8 : 0;
    fill.intensity = daylight ? .22 : 0;
    scene.environmentIntensity = daylight ? .35 : tunnel ? .045 : .15;
    key.target.position.copy(target);
    key.position.copy(target).add(new THREE.Vector3(-18, 28, -12));
    const nearby = drawing ? [] : sources.filter(data => {
      if (data.collection !== collection) return false;
      // Prevent a mezzanine's unshadowed area source from illuminating through
      // its floor slab. A tunnel's other bore is likewise a separate enclosure.
      if (tunnel && Math.abs(data.point.x - target.x) > 4.2) return false;
      const dy = data.point.y - target.y;
      return dy > -.8 && dy < (daylight ? 6 : 3.65);
    }).map(data => ({ data, distance: data.point.distanceTo(target) }))
      .filter(item => item.distance < 42).sort((a, b) => a.distance - b.distance);
    const radius = Math.min(42, nearby[fixtureLights.length]?.distance || 42);
    fixtureLights.forEach((light, i) => {
      const item = nearby[i];
      light.intensity = 0; light.userData.sourceFixture = null;
      if (!item) return;
      const { data, distance } = item;
      light.name = data.name;
      light.position.copy(data.point); light.quaternion.copy(data.rotation);
      light.width = data.width; light.height = data.height;
      light.color.fromArray(data.color);
      // Exposure calibration, not a conversion to surveyed lux or lamp watts.
      const fade = 1 - smooth((distance - radius * .78) / (radius * .22));
      light.intensity = data.power * .30 * fade / (data.width * data.height);
      light.userData.sourceFixture = data.fixtureId; light.userData.sourceCollection = data.collection;
      light.userData.sourcePower = data.power;
    });
    shadowLights.forEach((light, i) => {
      const area = fixtureLights[i];
      light.intensity = area.userData.sourceFixture ? area.userData.sourcePower * .10 : 0;
      light.position.copy(area.position); light.color.copy(area.color);
      direction.set(0, 0, -1).applyQuaternion(area.quaternion);
      light.target.position.copy(area.position).add(direction);
      light.userData.sourceFixture = area.userData.sourceFixture;
    });
  }
  return { focus, sources, fixtureLights, shadowLights, dispose() {
    environment?.dispose(); studio?.dispose(); pmrem?.dispose(); key.shadow.dispose();
    shadowLights.forEach(light => light.shadow.dispose());
  } };
}
