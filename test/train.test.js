import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTrain } from '../src/train.js';

test('CAF exterior has seven finite curved cars and both driving noses', () => {
  const train = createTrain(THREE);
  const v = train.group.userData.validation;
  assert.equal(v.cars, 7);
  assert.equal(v.bogies, 14);
  assert.equal(v.gangways, 6);
  assert.ok(v.sideSegments >= 32);
  assert.ok(v.noseLoftRows >= 8);
  assert.equal(v.doorsPerSidePerCar, 4);
  assert.equal(v.noseFrontZ, 0);
  assert.equal(v.rearBodyZ, -140);
  assert.ok(train.group.getObjectByName('front CAF driving nose'));
  assert.ok(train.group.getObjectByName('rear CAF driving nose'));
  const windshield = train.group.getObjectByName('large curved CAF windshield glass');
  windshield.geometry.computeBoundingBox();
  assert.ok(windshield.geometry.boundingBox.max.x - windshield.geometry.boundingBox.min.x > 2.1);
  assert.ok(windshield.geometry.boundingBox.max.z - windshield.geometry.boundingBox.min.z > .4, 'windshield should follow the nose rake');
  train.group.traverse(object => {
    if (!object.isMesh) return;
    const position = object.geometry?.getAttribute?.('position');
    if (!position) return;
    for (let i = 0; i < position.count * position.itemSize; i++) assert.ok(Number.isFinite(position.array[i]), `${object.name} has a non-finite vertex`);
  });
  train.dispose();
});

test('CAF door animation is deterministic at zero dt and hardware wheels update', () => {
  const train = createTrain(THREE);
  train.update(0, { doorsOpen: false, speed: 20 });
  assert.equal(train.doorFraction, 0);
  train.update(0, { doorsOpen: true, speed: 20 });
  assert.equal(train.doorFraction, 0);
  const bogie = train.group.getObjectByName('detailed CAF bogie 1');
  const wheelAtZeroDt = bogie.userData.wheelRotation;
  train.update(0, { doorsOpen: true, speed: 20 });
  assert.equal(bogie.userData.wheelRotation, wheelAtZeroDt);
  train.update(.1, { doorsOpen: true, speed: 20 });
  assert.ok(train.doorFraction > 0);
  assert.ok(bogie.userData.wheelRotation > wheelAtZeroDt);
  train.update(0, { doorsOpen: true, speed: 20 });
  assert.equal(train.doorFraction, .1);
  const leaves = [];
  train.group.traverse(object => { if (object.name === 'paired sliding red door leaf') leaves.push(object); });
  assert.notEqual(leaves[0].position.z, leaves[1].position.z, 'paired door leaves need separate closed centres');
  train.setView('cab');
  train.setView('exterior');
  train.dispose();
});
