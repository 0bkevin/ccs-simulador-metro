import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createStation } from '../src/stations.js';

const stationNames = ['Caño Amarillo', 'Capitolio', 'Bellas Artes', 'Plaza Venezuela', 'Altamira'];

function finiteObject(object) {
  return [object.position.x, object.position.y, object.position.z, ...object.matrixWorld.elements].every(Number.isFinite);
}

function inspectAssembly(name) {
  const assembly = createStation(THREE, { name });
  assembly.group.updateMatrixWorld(true);
  let finite = true;
  let instanceCount = 0;
  const objects = [];
  const matrix = new THREE.Matrix4();
  assembly.group.traverse((object) => {
    objects.push(object);
    finite &&= finiteObject(object);
    if (!object.isInstancedMesh) return;
    instanceCount += object.count;
    for (let i = 0; i < object.count; i++) {
      object.getMatrixAt(i, matrix);
      finite &&= matrix.elements.every(Number.isFinite);
    }
  });
  return { assembly, objects, finite, instanceCount };
}

test('all selected station assemblies have finite object and instance transforms', () => {
  for (const name of stationNames) {
    const { finite, instanceCount } = inspectAssembly(name);
    assert.equal(finite, true, `${name} contains a non-finite transform`);
    assert.ok(instanceCount > 10, `${name} should use instanced repetitive architecture`);
  }
});

test('all station geometry attributes and bounds contain finite values', () => {
  for (const name of stationNames) {
    const { objects } = inspectAssembly(name);
    for (const object of objects) {
      const geometry = object.geometry;
      if (!geometry) continue;
      for (const attribute of Object.values(geometry.attributes)) {
        assert.ok([...attribute.array].every(Number.isFinite), `${name} ${object.name} has a non-finite ${attribute.name}`);
      }
      if (geometry.index) assert.ok([...geometry.index.array].every(Number.isFinite), `${name} ${object.name} has a non-finite index`);
      geometry.computeBoundingBox(); geometry.computeBoundingSphere();
      if (geometry.boundingBox) assert.ok([...geometry.boundingBox.min.toArray(), ...geometry.boundingBox.max.toArray()].every(Number.isFinite));
      if (geometry.boundingSphere) assert.ok([...geometry.boundingSphere.center.toArray(), geometry.boundingSphere.radius].every(Number.isFinite));
    }
  }
});

test('platform arrangements preserve the Line 1 clearances', () => {
  const side = [inspectAssembly('Capitolio').assembly, inspectAssembly('Plaza Venezuela').assembly];
  for (const { footprint, railCenters } of side.map(({ footprint, railCenters }) => ({ footprint, railCenters }))) {
    assert.equal(railCenters[0], 0);
    assert.equal(railCenters[1], 4);
    assert.equal(footprint.platform, 'side');
  }
  for (const name of ['Bellas Artes', 'Altamira']) {
    const { assembly } = inspectAssembly(name);
    assert.deepEqual(assembly.railCenters, [0, 10]);
    assert.equal(assembly.footprint.platform, 'island');
    const island = assembly.group.getObjectByName(`${name} central island platform`) || assembly.group.getObjectByName('Altamira central island platform');
    assert.ok(island, `${name} central island platform missing`);
    assert.equal(island.position.x - island.geometry.parameters.width / 2, 1.6);
    assert.equal(island.position.x + island.geometry.parameters.width / 2, 8.4);
  }
});

test('boarding position markings remain inside each platform footprint', () => {
  for (const name of stationNames) {
    const { assembly, objects } = inspectAssembly(name);
    const marks = objects.filter((object) => /boarding position/.test(object.name));
    if (name === 'Caño Amarillo') continue;
    assert.ok(marks.length >= 7, `${name} should have repeated boarding marks`);
    for (const mark of marks) {
      const box = new THREE.Box3().setFromObject(mark);
      assert.ok(box.min.z >= assembly.footprint.minZ - 1e-6, `${name} boarding mark starts outside station`);
      assert.ok(box.max.z <= assembly.footprint.maxZ + 1e-6, `${name} boarding mark ends outside station`);
    }
  }
});

test('rails terminate at the declared station footprint', () => {
  for (const name of stationNames) {
    const { assembly, objects } = inspectAssembly(name);
    const railMeshes = objects.filter((object) => /rail/.test(object.name) && object.geometry?.parameters?.depth > 100);
    assert.ok(railMeshes.length >= 2, `${name} has no long rail meshes`);
    for (const rail of railMeshes) {
      const box = new THREE.Box3().setFromObject(rail);
      assert.ok(box.min.z >= assembly.footprint.minZ - 1e-6, `${name} rail starts before footprint`);
      assert.ok(box.max.z <= assembly.footprint.maxZ + 1e-6, `${name} rail ends after footprint`);
    }
  }
});

test('stairs and landings stay outside the train envelope below mezzanine height', () => {
  for (const name of stationNames) {
    const { assembly, objects } = inspectAssembly(name);
    const trainEnvelopes = assembly.railCenters.map((center) => [center - 1.6, center + 1.6]);
    for (const stair of objects.filter((object) => /stair/i.test(object.name) && object.geometry)) {
      const box = new THREE.Box3().setFromObject(stair);
      if (box.min.y >= 4.5) continue;
      for (const [minX, maxX] of trainEnvelopes) {
        const intersectsTrainEnvelope = box.min.x < maxX && box.max.x > minX;
        assert.equal(intersectsTrainEnvelope, false, `${name} stair ${stair.name} crosses a train envelope`);
      }
    }
  }
});

test('mezzanine slabs leave real vertical openings for their stair runs', () => {
  for (const name of ['Capitolio', 'Plaza Venezuela', 'Altamira']) {
    const { objects } = inspectAssembly(name);
    const slabObjects = objects.filter((object) => /mezzanine (?:end )?slab|interchange mezzanine|floating mezzanine tray/i.test(object.name) && object.geometry);
    assert.ok(slabObjects.length > 1, `${name} mezzanine should be split around stair openings`);
    const stairObjects = objects.filter((object) => /stair riser|stair upper landing/i.test(object.name));
    assert.ok(stairObjects.length > 2, `${name} should expose physical stair components`);
    for (const stair of stairObjects) {
      const stairBox = new THREE.Box3().setFromObject(stair);
      for (const slab of slabObjects) {
        const slabBox = new THREE.Box3().setFromObject(slab);
        assert.equal(slabBox.intersectsBox(stairBox), false, `${name} slab ${slab.name} closes ${stair.name}`);
      }
    }
    const risers = objects.filter((object) => /stair riser/i.test(object.name));
    for (const riser of risers.filter((_, index) => index % 2 === 0)) {
      const box = new THREE.Box3().setFromObject(riser);
      const point = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y + .02, (box.min.z + box.max.z) / 2);
      for (const slab of slabObjects) {
        const slabBox = new THREE.Box3().setFromObject(slab);
        const overheadRayHitsSlab = slabBox.min.x <= point.x && slabBox.max.x >= point.x && slabBox.min.z <= point.z && slabBox.max.z >= point.z && slabBox.max.y > point.y;
        assert.equal(overheadRayHitsSlab, false, `${name} stair ray from ${riser.name} hits ${slab.name}`);
      }
    }
  }
  const { objects } = inspectAssembly('Bellas Artes');
  assert.equal(objects.some((object) => object.name === 'Bellas Artes central stair block'), false);
  assert.ok(objects.some((object) => object.name.includes('central stair cheek')));
});

test('Caño Amarillo uses a repeated space-frame roof', () => {
  const { objects } = inspectAssembly('Caño Amarillo');
  const trusses = objects.filter((object) => /dense yellow roof/.test(object.name));
  assert.ok(trusses.length >= 3);
  assert.ok(trusses.some((object) => object.isInstancedMesh && object.count > 100), 'long roof should be instanced');
  const matrix = new THREE.Matrix4(); const scale = new THREE.Vector3();
  const longMembers = trusses.flatMap((object) => {
    if (!object.isInstancedMesh) return [];
    const lengths = [];
    for (let index = 0; index < object.count; index++) { object.getMatrixAt(index, matrix); matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale); lengths.push(Math.max(scale.x, scale.y, scale.z)); }
    return lengths;
  });
  assert.ok(longMembers.some((length) => length > 1), 'roof truss instances should have physical member lengths');
});
