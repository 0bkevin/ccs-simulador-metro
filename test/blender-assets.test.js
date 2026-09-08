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
      assert.ok(!visible.some(c => c.startsWith("Station ") && c !== preset.collection));
      const activeLights = [...world.lighting.washes.values()].flat().filter(l => l.visible);
      assert.equal(activeLights.length, preset.exterior ? 0 : 3);
    }
  }
  world.leaveInspection(); world.update(0, 237);
  assert.equal(world.inspection, null);
  assert.equal(train.visible, true);
  assert.equal(world.stationAssemblies.filter(o => o.visible).length, 5);
  environment.traverse(o => { if (o.isMesh) assert.ok(o.castShadow && o.receiveShadow); });
  world.dispose();
});

test("the export retains all fifteen native station area lights and their downward orientation", () => {
  const lights = manifest.lighting.areaLights;
  assert.equal(lights.length, 15);
  for (const station of manifest.stations) {
    const local = lights.filter(l => l.collection === station.collection);
    assert.equal(local.length, 3, station.name);
    for (const light of local) {
      const direction = new Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().fromArray(light.quaternion));
      assert.ok(direction.y < -.999);
      assert.ok(light.position[2] > station.distance - 145 && light.position[2] < station.distance + 5);
      assert.ok(light.width > 0 && light.height > 0 && light.power > 0);
    }
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
