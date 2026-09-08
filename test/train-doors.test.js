import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createTrainDoors } from '../src/train-doors.js';
import { createSimulation } from '../src/simulation.js';

async function loadTrain() {
  const bytes = await fs.readFile(new URL('../public/models/blender/train.glb', import.meta.url));
  const loader = new GLTFLoader();
  loader.register(() => ({ name: 'headless_geometry_review', loadTexture: () => Promise.resolve(new THREE.Texture()) }));
  return new Promise((resolve, reject) => loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '', gltf => resolve(gltf.scene), reject));
}
const advance = (doors, state, seconds = 3) => { for (let t = 0; t < seconds; t += .05) doors.update(.05, state); };

test('both cab crowns remain closed across the roof and curved front boundary', async () => {
  const train=await loadTrain();train.updateMatrixWorld(true);
  for (const [center,direction] of [[-7.73,1],[-133.49,-1]]) {
    for (const x of [-.08,-.04,-.02,0,.02,.04,.08]) {
      let previous;
      // Sweep the full former slit and the newly shared edge, including its
      // exact centre. A broad side view missed this narrow triangular hole.
      for (let step=0;step<=42;step++) {
        const z=7.95+step*.008;
        const ray=new THREE.Raycaster(new THREE.Vector3(x,5,center+direction*(z+.72)),new THREE.Vector3(0,-1,0),0,1.4);
        const hit=ray.intersectObject(train,true)[0];
        assert.ok(hit && hit.point.y>3.64,`cab ${direction}, crown ${x}, ${z}: continuous exterior skin`);
        assert.equal(hit.object.material.transparent,false,'the crown is closed metal, not a view through glazing');
        if(previous!==undefined)assert.ok(Math.abs(hit.point.y-previous)<.025,'no folded spike or step along the crown');
        previous=hit.point.y;
      }
    }
  }
});

test('both native couplers have a projecting cone, recessed cup and an open nose recess', async () => {
  const train=await loadTrain();train.updateMatrixWorld(true);
  for (const [center,direction] of [[-7.73,1],[-133.49,-1]]) {
    function hit(x,y) {
      const ray=new THREE.Raycaster(new THREE.Vector3(x*direction,y,center+direction*11.72),new THREE.Vector3(0,0,-direction));
      const result=ray.intersectObject(train,true)[0];
      assert.ok(result,`coupler surface exists at ${x}, ${y}`);
      return {z:(result.point.z-center)*direction-.72,material:result.object.material.name};
    }
    const face=hit(.21,.932),cone=hit(-.15,.82),cup=hit(.127,.785);
    assert.match(face.material,/coupler satin machined face/);
    assert.ok(cone.z-face.z>.065,'guide cone must project ahead of the mating face');
    assert.ok(face.z-cup.z>.16,'receiving socket must be hollow, not a black disc on the face');
    for (const x of [-.39,.39]) {
      const recess=hit(x,1.0);
      assert.ok(recess.z<9.60,'open nose reveals equipment behind the shell, not a painted aperture');
    }
  }
});

function doorCentresFor(train, car) {
  const centres=new Set();
  train.traverse(o => {
    if (!o.isMesh && Number(o.userData.doorId?.split(':')[0])===car) centres.add(o.userData.doorCentreLocal);
  });
  assert.equal(centres.size,4);
  assert.ok([...centres].every(Number.isFinite),'native door stations are exported');
  return [...centres].sort((a,b)=>a-b);
}

test('traction stays locked through the entire closing animation', async () => {
  const train = await loadTrain(); const doors = createTrainDoors(train);
  const sim = createSimulation([{ distance: 0 }, { distance: 510 }]);
  sim.start(); doors.update(0,sim.state);
  for (let i=0;i<61;i++) sim.tick(.05);
  sim.setDoors(false);
  for (let i=0;i<56;i++) {
    const state=sim.tick(.05,{ throttle:doors.fraction<.001 });
    assert.equal(state.speed,0,'no movement while leaves are in transit');
    doors.update(.05,state);
  }
  assert.equal(doors.fraction,0);
  assert.ok(sim.tick(.05,{ throttle:doors.fraction<.001 }).speed>0);
});

test('all 112 native leaves move as complete assemblies and return exactly to their closed positions', async () => {
  const train = await loadTrain(); const doors = createTrainDoors(train);
  assert.equal(doors.leaves.length, 112);
  assert.equal(new Set(doors.leaves.map(l => l.object.userData.doorId)).size, 112);
  for (const leaf of doors.leaves) {
    const materials = [];
    leaf.object.traverse(o => { if (o.isMesh) materials.push(o.material.name); });
    assert.ok(materials.some(m => /transparent glazing/.test(m)), 'glass travels with the leaf');
    assert.ok(materials.some(m => /interior red door/.test(m)), 'inner skin travels with the leaf');
  }
  doors.update(0, { doorsOpen: false });
  const state = { doorsOpen: true, doorSide: -1 };
  doors.update(.1, state);
  assert.ok(doors.moving && doors.fraction > 0 && doors.fraction < 1);
  const left = doors.leaves.find(l => l.side === -1);
  assert.ok(left.object.position.x < left.closed.x);
  assert.equal(left.object.position.z, left.closed.z, 'outward clearance precedes the slide');
  const fraction = doors.fraction;
  doors.update(0, state); doors.update(NaN, state); doors.update(-1, state);
  assert.equal(doors.fraction, fraction, 'pause and invalid deltas do not advance animation');
  advance(doors, state);
  assert.equal(doors.fraction, 1); assert.equal(doors.moving, false);
  for (const leaf of doors.leaves) {
    const expected = leaf.closed.clone();
    if (leaf.side === -1) { expected.x += leaf.x; expected.z += leaf.z; }
    assert.ok(leaf.object.position.distanceTo(expected) < 1e-8);
  }
  advance(doors, { doorsOpen: false });
  assert.equal(doors.fraction, 0);
  for (const leaf of doors.leaves) assert.deepEqual(leaf.object.position.toArray(), leaf.closed.toArray());
  // Reversing an in-flight command must not teleport the leaf or accumulate drift.
  doors.update(.1, state); const before = left.object.position.clone();
  doors.update(0, { doorsOpen: false });
  assert.deepEqual(left.object.position.toArray(), before.toArray());
  advance(doors, { doorsOpen: false });
  advance(doors, { doorsOpen: true, doorSide: 1 });
  assert.deepEqual(doors.fractions, { '-1': 0, '1': 1 });
});

test('open doorways are clear through body, portal, seals and inner skins in all seven cars', async () => {
  const train = await loadTrain(); const doors = createTrainDoors(train);
  doors.update(0, { doorsOpen: false }); train.updateMatrixWorld(true);
  function hits(car, side, bay, y, offset) {
    const direction = car === 7 ? -1 : 1;
    const z = -7.73 - (car-1)*20.96 + direction*bay + offset;
    return new THREE.Raycaster(new THREE.Vector3(side*2, y, z), new THREE.Vector3(-side,0,0), 0, 1.1).intersectObject(train,true);
  }
  for (let car=1;car<=7;car++) for (const side of [-1,1]) for (const bay of doorCentresFor(train,car)) {
    assert.ok(hits(car,side,bay,1.8,.25).length, 'closed door seals the opening');
  }
  advance(doors, { doorsOpen: true, doorSide: 'both' }); train.updateMatrixWorld(true);
  for (let car=1;car<=7;car++) for (const side of [-1,1]) for (const bay of doorCentresFor(train,car)) {
    for (const y of [1.3,1.8,2.45,2.9]) for (const offset of [-.55,0,.55]) {
      const found = hits(car,side,bay,y,offset);
      assert.equal(found.length,0,`car ${car}, side ${side}, bay ${bay}, height ${y}: ${found[0]?.object.name}`);
    }
  }
});

test('cab entrances stay clear throughout the passenger door opening and closing sweep', async () => {
  const train=await loadTrain(); const doors=createTrainDoors(train);
  doors.update(0,{doorsOpen:false});
  const cabStart=8.22; // rear edge of the cab access door in the saved model
  const fronts=[];
  for (const [car,center,direction] of [[1,-7.73,1],[7,-133.49,-1]]) for (const side of [-1,1]) {
    const id=`${String(car).padStart(2,'0')}:${side}:4:1`;
    const leaf=doors.leaves.find(l=>l.object.userData.doorId===id);
    assert.ok(leaf,id);
    fronts.push({leaf,center,direction,id});
  }
  for (const open of [true,false]) for(let step=0;step<61;step++) {
    doors.update(.05,{doorsOpen:open,doorSide:'both'}); train.updateMatrixWorld(true);
    for (const {leaf,center,direction,id} of fronts) {
      const bounds=new THREE.Box3().setFromObject(leaf.object,true);
      const front=direction>0?bounds.max.z-center:center-bounds.min.z;
      assert.ok(cabStart-front>=.05,`${id}: cab entrance must have at least 5 cm clearance; got ${(cabStart-front).toFixed(3)} m`);
    }
  }
  assert.equal(doors.fraction,0);
});

test('both cab side windows have clear apertures and the windshield uses dielectric glass', async () => {
  const train = await loadTrain(); train.updateMatrixWorld(true);
  for (const [center,direction] of [[-7.73,1],[-133.49,-1]]) {
    for (const side of [-1,1]) for (const [z,y] of [[7.70,2.3],[8.15,2.3],[7.70,2.9],[7.98,2.9],[7.70,3.10],[7.96,3.10]]) {
      const ray = new THREE.Raycaster(new THREE.Vector3(side*2,y,center+direction*(z+.72)),new THREE.Vector3(-side,0,0),0,1.1);
      const hits = ray.intersectObject(train,true);
      assert.ok(hits.length, 'side pane exists');
      for (const hit of hits) {
        assert.ok(hit.object.material.transparent, `${hit.object.name}: no opaque shell behind the pane`);
        assert.equal(hit.object.material.metalness,0);
      }
    }
    for (const side of [-1,1]) {
      const ray = new THREE.Raycaster(new THREE.Vector3(side*2,3.3,center+direction*8.1),new THREE.Vector3(-side,0,0));
      const hit = ray.intersectObject(train,true)[0];
      assert.ok(hit && !hit.object.material.name.includes('interior'), 'cab partition stays inside the tapered shoulder');
    }
    const ray = new THREE.Raycaster(new THREE.Vector3(0,2.6,center+direction*12),new THREE.Vector3(0,0,-direction));
    const hit=ray.intersectObject(train,true)[0];
    assert.ok(hit?.object.material.transparent, 'windshield is a clear pane within its ceramic border');
    assert.equal(hit.object.material.metalness,0);
  }
});

test('cab paint matches the body at the joint and the window stays inside the access door', async () => {
  const train = await loadTrain(); train.updateMatrixWorld(true);
  for (const [center,direction] of [[-7.73,1],[-133.49,-1]]) for (const side of [-1,1]) {
    function surface(z,y) {
      return new THREE.Raycaster(new THREE.Vector3(side*2,y,center+direction*(z+.72)),new THREE.Vector3(-side,0,0),0,1.1).intersectObject(train,true)[0];
    }
    const body=surface(7.33,2.35),cab=surface(7.37,2.35);
    assert.ok(body && cab, 'continuous shell on both sides of the joint');
    assert.equal(cab.object.material,body.object.material,'same silver finish across the body/cab join');
    assert.ok(body.normal.dot(cab.normal)>.999,'continuous reflection normals across the join');
    // The previous rounded door clipped into the rear/top window corner.
    for (const [z,y] of [[7.555,2.9],[7.555,3.20],[7.85,3.225],[8.15,3.07]]) {
      const hit=surface(z,y);
      assert.equal(hit?.object.material,body.object.material,'silver reveal surrounds the whole window');
    }
    for (const y of [1.9,2.4,2.9]) {
      const shell=surface(7.49,y),seam=surface(7.5025,y),skin=surface(7.52,y);
      assert.ok(seam && skin,'continuous door perimeter');
      assert.ok(Math.abs(seam.point.x-shell.point.x)<.005,'long seam follows the curved body within 5 mm');
      assert.ok(Math.abs(skin.point.x-shell.point.x)<.005,'door skin remains flush alongside the seam');
    }
    for (const y of [2.3,2.9]) {
      const glass=surface(7.64,y),shell=surface(7.49,y);
      assert.ok(glass?.object.material.transparent,'glazing reaches its rear frame');
      assert.ok(Math.abs(glass.point.x-shell.point.x)<.01,'glass boundary follows the curved shell');
    }
  }
});

test('recorded CAF closing warning holds doors open and traction locked before leaf travel', () => {
  const train = new THREE.Group();
  const doors = createTrainDoors(train, { openingSeconds: 2.7, closingSeconds: 3.2, closeWarningSeconds: 3.2 });
  doors.update(0, { doorsOpen: true });
  advance(doors, { doorsOpen: false }, 3);
  assert.equal(doors.fraction, 1, 'warning plays while the doors remain fully open');
  assert.equal(doors.warning, true);
  advance(doors, { doorsOpen: false }, 1);
  assert.ok(doors.fraction > 0 && doors.fraction < 1, 'doors move only after the warning');
  advance(doors, { doorsOpen: false }, 3);
  assert.equal(doors.fraction, 0);
  assert.equal(doors.warning, false);
  advance(doors, { doorsOpen: true }, 3);
  doors.update(.1, { doorsOpen: false });
  assert.equal(doors.warning, true);
  doors.update(.1, { doorsOpen: true });
  assert.equal(doors.warning, false, 'reopening cancels the pending close');
  assert.equal(doors.fraction, 1);
});
