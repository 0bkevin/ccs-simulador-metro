import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import stations from "../src/route.js";
import { createWorld } from "../src/world.js";

test("tunnel shells clear both driving and return corridors", () => {
  const world = createWorld(THREE, null, stations);
  const tunnels = world.root.getObjectByName("Discrete tunnel segments between station halls");
  const walls = [];
  const arches = [];
  tunnels.traverse((object) => {
    if (object.name.includes("wall segment")) walls.push(object);
    if (object.name.includes("tunnel arch overhead beam")) arches.push(object);
  });
  assert.ok(walls.length > 0);
  assert.ok(arches.length > 0);
  for (const wall of walls) {
    const bounds = new THREE.Box3().setFromObject(wall);
    if (bounds.max.x < 0) assert.ok(bounds.max.x < -1.6, `left wall inner face clears driving train: ${bounds.max.x}`);
    else assert.ok(bounds.min.x > 5.6, `right wall inner face clears return train: ${bounds.min.x}`);
  }
  for (const beam of arches) {
    const bounds = new THREE.Box3().setFromObject(beam);
    assert.ok(bounds.min.y > 4, `arch beam stays above rail corridor: ${bounds.min.y}`);
  }
  world.dispose();
});

test("station footprints and passengers cover the five-stop service", () => {
  const world = createWorld(THREE, null, stations);
  assert.equal(world.stationAssemblies.length, 5);
  world.stationAssemblies.forEach((assembly, index) => {
    assert.equal(assembly.footprint.minZ, -152.5);
    assert.equal(assembly.footprint.maxZ, 12.5);
    assert.deepEqual(assembly.railCenters, stations[index].railCenters);
  });
  assert.deepEqual(world.railPaths.map((path) => [path.x0, path.x1]), [[4, 4], [4, 4], [4, 10], [10, 4], [4, 10], [10, 10]]);
  let passengerCount = 0;
  world.stationRoot.children.forEach((stationGroup, index) => {
    const footprint = world.stationAssemblies[index].footprint;
    stationGroup.traverse((object) => {
      if (object.name !== "station passenger") return;
      passengerCount += 1;
      assert.ok(object.position.x >= footprint.minX && object.position.x <= footprint.maxX);
      assert.ok(object.position.y >= footprint.minY && object.position.y + 1.9 <= footprint.maxY);
      assert.ok(object.position.z >= footprint.minZ && object.position.z <= footprint.maxZ);
    });
  });
  assert.equal(passengerCount, stations.length * 9);
  world.update(.016, 0, { doorsOpen: true });
  world.update(.016, 1800, { doorsOpen: true });
  world.stationRoot.children.forEach((stationGroup, index) => {
    const footprint = world.stationAssemblies[index].footprint;
    stationGroup.traverse((object) => {
      if (object.name !== "station passenger") return;
      assert.ok(object.position.z >= footprint.minZ && object.position.z <= footprint.maxZ);
    });
  });
  world.dispose();
});
