import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { Box3, Vector3, Texture, Raycaster } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createSimulation } from "../src/simulation.js";
import * as THREE from "three";
import { createWorld } from "../src/blender-world.js";
import { getStationView } from "../src/station-views.js";
import { createBlenderLighting } from "../src/blender-presentation.js";

const base = new URL("../public/models/blender/", import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL("manifest.json", base), "utf8"));
async function load(name) {
  const b = await fs.readFile(new URL(name + ".glb", base));
  const loader = new GLTFLoader();
  // Node validates geometry and transforms; the real texture decoder is
  // exercised in the browser review. No DOM image loader exists in Node.
  loader.register(() => ({ name: "headless_geometry_review", loadTexture: () => Promise.resolve(new Texture()) }));
  return new Promise((resolve, reject) => loader.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), "", resolve, reject));
}

test("the playable camera frames each native station from its platform, below its roof", async () => {
  const environment = (await load("environment")).scene;
  const train = (await load("train")).scene;
  const world = createWorld(THREE, null, manifest.stations, { environment, train, manifest });
  const ray = new Raycaster();
  for (const [index, stop] of manifest.stations.entries()) {
    world.update(0, stop.distance);
    world.scene.updateMatrixWorld(true);
    assert.equal(world.activeStation, index);
    const camera = world.camera;
    assert.ok(camera.position.z > stop.distance - 145 && camera.position.z < stop.distance + 5);
    assert.ok(camera.position.y > 1.1 && camera.position.y < 4.3);
    ray.set(camera.position, new Vector3(0, -1, 0));
    const floor = ray.intersectObject(world.stationAssemblies[index], true)[0];
    assert.ok(floor && Math.abs(floor.point.y - 1.1) < .035, `${stop.name}: camera stands on native platform`);
    assert.ok(Math.abs(camera.position.x) > 1.6, "camera is outside the train body");
  }
  world.dispose();
});

test("in-game station inspection uses native collections and retains the driving train", async () => {
  const environment = (await load("environment")).scene;
  const train = (await load("train")).scene;
  const world = createWorld(THREE, null, manifest.stations, { environment, train, manifest });
  world.update(0, 237);
  for (let index = 0; index < 5; index++) {
    for (const kind of getStationView(index).views) {
      const revision = world.renderRevision;
      const preset = getStationView(index, kind);
      world.inspectStation(index, kind);
      world.update(0, 237);
      assert.deepEqual(world.camera.position.toArray(), preset.position);
      assert.ok(world.renderRevision > revision, "station changes redraw even while paused");
      assert.equal(train.position.z, 237, "inspection must never teleport the driving train");
      if (preset.exterior) assert.equal(train.visible, false, "a remote train must not appear below the isolated plaza");
      const visible = [];
      environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection && o.visible) visible.push(o.userData.sourceCollection); });
      assert.ok(visible.includes(preset.collection), `${index}/${kind}: authored collection visible`);
      assert.deepEqual(visible.sort(), preset.collections.slice().sort());
      const activeLights = world.lighting.fixtureLights.filter(l => l.intensity > 0);
      assert.ok(activeLights.length <= 24, "bounded renderer light budget");
      if (['plan','section'].includes(kind)) assert.equal(activeLights.length, 0);
      else if (!preset.exterior) assert.ok(activeLights.length > 0, `${index}/${kind}: actual fixture sources illuminate the model`);
      for (const light of activeLights) {
        const source = manifest.lighting.areaLights.find(s => s.fixtureId === light.userData.sourceFixture);
        assert.ok(source, "the active light exists in the Blender source");
        assert.equal(source.collection, preset.collection);
        assert.deepEqual(light.position.toArray(), source.position);
      }
    }
  }
  world.leaveInspection(); world.update(0, 237);
  assert.equal(world.inspection, null);
  assert.equal(train.visible, true);
  assert.equal(world.stationAssemblies.filter(o => o.visible).length, 5);
  environment.traverse(o => { if (o.isMesh) assert.ok(o.castShadow && o.receiveShadow); });
  world.dispose();
});

test("each station exports its individual fixture sources, with platform and concourse illumination", () => {
  const lights = manifest.lighting.areaLights;
  assert.equal(new Set(lights.map(l => l.fixtureId)).size, lights.length);
  for (const station of manifest.stations) {
    const local = lights.filter(l => l.collection === station.collection);
    assert.ok(local.length >= 28, station.name);
    if (station.name !== 'Caño Amarillo') {
      assert.ok(local.some(l => l.position[1] < 5));
      assert.ok(local.some(l => l.position[1] > 7));
    }
    for (const light of local) {
      const direction = new Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().fromArray(light.quaternion));
      assert.ok(direction.y < -.999);
      assert.ok(light.position[2] > station.distance - 145 && light.position[2] < station.distance + 5);
      assert.ok(light.width > 0 && light.height > 0 && light.power > 0);
      assert.match(light.basis, /estimated/);
    }
  }
  const plaza = lights.filter(l => l.collection === 'Station Plaza Venezuela');
  assert.ok(plaza.some(l => l.family === 'recessed downlight' && l.tone === 'warm'));
  assert.ok(plaza.some(l => l.family === 'continuous platform strip'));
  assert.ok(!lights.some(l => /diffuse wash|diffuse skylight/.test(l.name)));
});

test("fixture selection stays at the authored position, separates levels and never lights through the other tunnel bore", () => {
  const lighting = createBlenderLighting(new THREE.Scene(), null, manifest);
  for (const [anchor, collection] of [
    [[5,2.73,2076], 'Station Altamira'], [[5,6.73,2105], 'Station Altamira'],
    [[0,2.5,145], 'Tunnel cano-amarillo'], [[0,2.5,177], 'Tunnel cano-amarillo'],
  ]) {
    lighting.focus(new Vector3(...anchor), collection);
    const active = lighting.fixtureLights.filter(l => l.intensity > 0);
    assert.ok(active.length > 0 && active.length <= 24);
    for (const light of active) {
      const source = manifest.lighting.areaLights.find(s => s.fixtureId === light.userData.sourceFixture);
      assert.deepEqual(light.position.toArray(), source.position);
      assert.deepEqual(light.quaternion.toArray(), source.quaternion);
      if (collection.startsWith('Tunnel ')) assert.ok(Math.abs(light.position.x - anchor[0]) < 4.2);
      else assert.ok(light.position.y - anchor[1] < 3.65);
    }
    for (const shadow of lighting.shadowLights) {
      assert.ok(active.some(l => l.userData.sourceFixture === shadow.userData.sourceFixture));
      assert.ok(shadow.castShadow);
    }
  }
  lighting.dispose();
});

test("exported fixture sources sit directly below or in front of their modeled fittings", async () => {
  const environment = (await load('environment')).scene;
  environment.updateMatrixWorld(true);
  const ray = new Raycaster(); ray.far = .16;
  const checked = new Set();
  for (const light of manifest.lighting.areaLights) {
    const key = `${light.collection}/${light.family}`;
    if (checked.has(key)) continue;
    checked.add(key);
    let root;
    environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection === light.collection) root = o; });
    assert.ok(root, light.collection);
    const towardHousing = new Vector3(0,0,1).applyQuaternion(new THREE.Quaternion(...light.quaternion));
    ray.set(new Vector3(...light.position), towardHousing);
    assert.ok(ray.intersectObject(root, true).length > 0, `${key}: source must be attached to real fixture geometry`);
  }
  const materials = new Map();
  environment.traverse(o => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.set(m.name,m); });
  for (const name of ['floor','concrete','granite','steel','bronze','tread','tile_mosaic','tile_ceramic']) {
    const material = [...materials.values()].find(m => m.name === `L1 architecture / ${name}`);
    assert.ok(material?.map && material.normalMap && material.roughnessMap, `${name}: packed color, relief and roughness survive export`);
  }
});

test("Capitolio's widened vestibules extend the platform without overlapping its floor", async () => {
  const environment = (await load('environment')).scene;
  environment.updateMatrixWorld(true);
  let station;
  environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection === 'Station Capitolio') station = o; });
  const ray = new Raycaster();
  for (const x of [-8.23,-6.03,9.93,12.23]) {
    ray.set(new Vector3(x,2.73,426.23),new Vector3(0,-1,0));
    const floor = ray.intersectObject(station,true).filter(h => Math.abs(h.point.y-1.1)<.0001);
    assert.equal(floor.length,1,`x=${x}: exactly one floor surface, no coplanar black patches`);
  }
});

test("published GLBs match the native Blender source and transformed bounds", async () => {
  const source = await fs.readFile(new URL("../blender/metro_caracas_line1.blend", import.meta.url));
  assert.equal(createHash("sha256").update(source).digest("hex"), manifest.source.sha256, "export must be rebuilt after native source changes");
  for (const name of ["train", "environment"]) {
    const gltf = await load(name);
    assert.equal(gltf.scenes.length, 1, "export only the active scene, avoiding duplicated train/environment geometry");
    // Precise vertex bounds avoid inflating rotated text/curved trim groups.
    const bounds = new Box3().setFromObject(gltf.scene, true);
    for (const end of ["min", "max"]) {
      manifest.assets[name].bounds[end].forEach((expected, axis) => {
        assert.ok(Math.abs(bounds[end].getComponent(axis) - expected) < .025, `${name} ${end} axis ${axis} includes all parent transforms`);
      });
    }
    let meshes = 0;
    gltf.scene.traverse((object) => {
      if (!object.isMesh) return;
      meshes++;
      assert.ok(object.geometry.attributes.position.count > 0);
      for (const value of object.matrixWorld.elements) assert.ok(Number.isFinite(value));
    });
    assert.ok(meshes > 0);
  }
});

test("the assets contain seven separate car collections and exactly five station layouts", async () => {
  const train = (await load("train")).scene;
  const environment = (await load("environment")).scene;
  const collections = (scene) => {
    const names = new Set();
    scene.traverse((o) => { if (o.userData.sourceCollection) names.add(o.userData.sourceCollection); });
    return names;
  };
  const carNames = [...collections(train)].filter((n) => /^CAF car \d\d$/.test(n));
  assert.deepEqual(carNames.sort(), Array.from({ length: 7 }, (_, i) => `CAF car ${String(i + 1).padStart(2, "0")}`));
  const envNames = [...collections(environment)];
  assert.ok(!envNames.some((n) => n.startsWith("CAF car")), "environment must not contain a stationary duplicate train");
  assert.deepEqual(envNames.filter((n) => n.startsWith("Station ")).sort(), manifest.stations.map((s) => s.collection).sort());
  const trainBounds = new Box3().setFromObject(train, true);
  const size = trainBounds.getSize(new Vector3());
  assert.ok(size.x > 2.8 && size.x < 3.7, `car width ${size.x}`);
  assert.ok(size.y > 3.3 && size.y < 4.7, `car height ${size.y}`);
  assert.ok(size.z > 145 && size.z < 153, `seven-car length ${size.z}`);
  assert.ok(trainBounds.min.z >= -145 && trainBounds.max.z <= 5,
    "the whole consist must fit the 150m station envelope at its stop marker");
  assert.deepEqual(manifest.coordinateSystem, { up: "Y", routeAxis: "Z", exportYup: false });
});

test("all five exported stop positions are playable without missing a station", () => {
  const sim = createSimulation(manifest.stations).start();
  for (let i = 0; i < 70000 && !sim.state.complete; i++) {
    const s = sim.state;
    if (s.doorsOpen) {
      sim.tick(.05);
      if (sim.state.dwell <= 0) sim.toggleDoors();
    } else {
      const gap = manifest.stations[s.target].distance - s.position;
      if (s.speed < .04 && Math.abs(gap) <= 12) sim.toggleDoors();
      else sim.tick(.05, { brake: gap <= s.speed * s.speed / 5 + 3, throttle: gap > s.speed * s.speed / 5 + 3 });
    }
    assert.equal(sim.state.missed, false);
  }
  assert.equal(sim.state.complete, true);
  assert.equal(sim.state.serviceCount, 5);
  assert.equal(sim.state.score, 100);
});

test("native station platforms retain their side/island topology and usable floor level", async () => {
  const environment = (await load("environment")).scene;
  environment.updateMatrixWorld(true);
  const ray = new Raycaster();
  for (const station of manifest.stations) {
    const group = environment.getObjectByProperty("name", station.collection.replaceAll(" ", "_")) ||
      (() => { let found; environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection === station.collection) found = o; }); return found; })();
    assert.ok(group, `native collection ${station.collection}`);
    const island = ["Bellas Artes", "Altamira"].includes(station.name);
    const platforms = island ? [2.8, 7.2] : [-4.4, 8.4];
    for (const x of platforms) {
      ray.set(new Vector3(x, 1.30, station.distance - 110), new Vector3(0, -1, 0));
      const hit = ray.intersectObject(group, true)[0];
      assert.ok(hit && Math.abs(hit.point.y - 1.1) < .035, `${station.name}: platform at x=${x}`);
    }
    for (const x of [0, island ? 10 : 4]) {
      ray.set(new Vector3(x, 1.30, station.distance - 110), new Vector3(0, -1, 0));
      const hit = ray.intersectObject(group, true)[0];
      assert.ok(hit && hit.point.y < .35, `${station.name}: tracks must remain below the boarding floor`);
    }
  }
});

test("the driving cab retains the swept-back crown visible in the maintenance side section", async () => {
  const train = (await load("train")).scene;
  train.updateMatrixWorld(true);
  let upper = -Infinity, lower = -Infinity;
  const point = new Vector3();
  train.traverse((object) => {
    if (!object.isMesh) return;
    let parent = object;
    while (parent && parent.userData.sourceCollection !== "CAF car 01") parent = parent.parent;
    if (!parent) return;
    const positions = object.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      if (Math.abs(point.x) > .5) continue;
      if (point.y > 3.5 && point.y < 3.7) upper = Math.max(upper, point.z);
      if (point.y > 1.4 && point.y < 1.6) lower = Math.max(lower, point.z);
    }
  });
  assert.ok(Number.isFinite(upper) && Number.isFinite(lower), "both sections must contain geometry");
  assert.ok(lower - upper > 1.1 && lower - upper < 2.2,
    `cab crown must sweep behind its lower face; measured depth difference ${lower - upper}m`);
});

test("the exported passenger body narrows above its waist as in section 2-21", async () => {
  const train = (await load("train")).scene;
  train.updateMatrixWorld(true);
  let waist = 0, windowTop = 0;
  const point = new Vector3();
  train.traverse((object) => {
    if (!object.isMesh) return;
    let parent = object;
    while (parent && parent.userData.sourceCollection !== "CAF car 01") parent = parent.parent;
    if (!parent) return;
    const positions = object.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      if (point.z < -18 || point.z > -4) continue;
      if (point.y > 1.65 && point.y < 1.85) waist = Math.max(waist, Math.abs(point.x));
      if (point.y > 2.98 && point.y < 3.05) windowTop = Math.max(windowTop, Math.abs(point.x));
    }
  });
  assert.ok(waist > 1.48 && waist < 1.60, `body waist half breadth ${waist}`);
  assert.ok(windowTop > 1.28 && windowTop < 1.41, `window top half breadth ${windowTop}`);
  assert.ok(waist - windowTop > .11, "sides must taper instead of returning to vertical box walls");
});

test('standard tunnel bores are inward-facing, scaled and clear of the train', async () => {
  const environment = (await load('environment')).scene;
  environment.updateMatrixWorld(true);
  const ray = new Raycaster();
  for (const [index, station] of manifest.stations.entries()) {
    let tunnel;
    environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection === `Tunnel ${station.id}`) tunnel = o; });
    assert.ok(tunnel, `${station.name}: native tunnel exists`);
    const a = station.distance + 5;
    const end = manifest.stations[index + 1]?.distance - 145 || manifest.scale.route.end;
    assert.ok(end - a >= 235, 'usable full-size railway sample');
    // Sample exactly in a structural ring, not the deliberately recessed cell.
    const ringStart = a + (index === 0 ? 100 : index === 4 ? 0 : 55);
    const z = ringStart + 16 * .8 + .03;
    for (const angle of [.30, .75, 1.2, 1.9, 2.45, 2.9]) {
      ray.set(new Vector3(0, 1.8, z), new Vector3(Math.cos(angle), Math.sin(angle), 0));
      const hit = ray.intersectObject(tunnel, true)[0];
      assert.ok(hit, `${station.name}: visible lining from inside at ${angle}`);
      assert.ok(Math.abs(hit.distance - 2.58) < .02, `${station.name}: 5.16 m clear diameter (${hit.distance})`);
    }
    // Rolling-stock width at floor/window/roof levels must fit along the whole
    // driven line, including the open portal and rectangular transition throats.
    for (let zz = a + 1; zz < end - 1; zz += 7.3) {
      for (const [x, y] of [[-1.53,1.75],[1.53,1.75],[-1.37,3],[1.37,3],[-.8,3.8],[.8,3.8]]) {
        ray.set(new Vector3(x,y,zz), new Vector3(0,0,1));
        const hit = ray.intersectObject(tunnel, true)[0];
        assert.ok(!hit || hit.distance > Math.min(6, end-zz), `${station.name}: obstruction at ${x}/${y}/${zz}`);
      }
    }
  }
});

test('inspection cuts reset and tunnel cameras stay within the playable bore', async () => {
  const environment = (await load('environment')).scene;
  const train = (await load('train')).scene;
  const world = createWorld(THREE, null, manifest.stations, { environment, train, manifest });
  for (let index = 0; index < 5; index++) {
    const plan = world.inspectStation(index, 'plan');
    assert.deepEqual(world.camera.up.toArray(), [1,0,0]);
    assert.equal(plan.clip.constant, 3.15);
    const tunnel = world.inspectStation(index, 'tunnel');
    assert.equal(tunnel.clip, null);
    const originalTrainZ = train.position.z;
    world.moveTunnel(manifest.stations[index].distance + 160);
    assert.equal(train.position.z, originalTrainZ, 'tunnel exploration must not move the train');
    assert.deepEqual(world.camera.up.toArray(), [0,1,0]);
  }
  world.leaveInspection();
  for (const mode of ['forward','platform','exterior','interior']) {
    world.setCameraMode(mode); world.update(0, 220);
    assert.ok(Math.abs(world.camera.position.x) < 1.55, `${mode}: camera inside the train/bore in transit`);
  }
  world.dispose();
});
