import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cameraClearance, createCameraCollision, sweepCamera } from '../src/camera-collision.js';
import { createStationCamera } from '../src/station-camera.js';
import { stationViews, getStationView, getTunnelTravelRange } from '../src/station-views.js';
import { createWorld } from '../src/blender-world.js';

const v = (x,y,z) => new THREE.Vector3(x,y,z);

test('swept camera stops at thin faces from either side and slides without changing render indices', () => {
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshBasicMaterial({ transparent: true, opacity: .15 }));
  const indices = Array.from(wall.geometry.index.array);
  const collision = createCameraCollision([wall]);
  for (const side of [-1,1]) {
    const a = v(0,0,side*8), b = v(0,0,-side*8);
    assert.equal(collision.blocked(a,a,.3),false);
    assert.equal(collision.blocked(b,b,.3),false);
    assert.equal(collision.blocked(a,b,.3),true, 'continuous sweep catches a pierced face with both endpoints clear');
    const stopped = sweepCamera(a,b,.3,collision);
    assert.ok(side*stopped.z >= .3 && side*stopped.z < .33);
    const slide = sweepCamera(stopped,v(5,2,-side*8),.3,collision);
    assert.equal(collision.blocked(slide,slide,.3),false);
    assert.ok(side*slide.z >= .3 && Math.abs(slide.x-5)<.001 && Math.abs(slide.y-2)<.001);
  }
  assert.deepEqual(Array.from(wall.geometry.index.array),indices);
});

test('camera clearance protects near-plane corners and transformed fixtures', () => {
  const camera = new THREE.PerspectiveCamera(100,3,.25,100);
  const radius = cameraClearance(camera);
  camera.updateMatrixWorld();
  for (const x of [-1,1]) for (const y of [-1,1]) {
    const corner = v(x,y,-1).unproject(camera);
    assert.ok(corner.distanceTo(camera.position)<radius);
  }
  const fixture = new THREE.Mesh(new THREE.BoxGeometry(1,1,1));
  fixture.scale.set(.1,3,2); fixture.rotation.y = .35; fixture.position.set(3,2,7);
  const collision = createCameraCollision([fixture]);
  assert.equal(collision.blocked(v(0,2,7),v(6,2,7),.3),true);
  assert.equal(collision.blocked(v(0,5,7),v(6,5,7),.3),false);
});

async function load(name) {
  const b = await fs.readFile(new URL(`../public/models/blender/${name}.glb`,import.meta.url));
  const loader = new GLTFLoader();
  loader.register(() => ({ name:'camera_geometry_test',loadTexture:()=>Promise.resolve(new THREE.Texture()) }));
  return (await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength), '')).scene;
}
const environment = await load('environment');
const camera = new THREE.PerspectiveCamera(68,1.6,.08,700);
const controls = new OrbitControls(camera);
const guard = createStationCamera({camera,controls,environment});
controls.addEventListener('change',()=>guard.constrain());
function safe(label) {
  assert.ok(guard.contains(), `${label}: camera stays over the modeled floor`);
  assert.ok(guard.isClear(), `${label}: camera does not intersect native geometry at ${camera.position.toArray()}`);
}

test('every station view begins clear and plan switches restore the correct camera orientation', () => {
  for (let i=0;i<5;i++) for (const kind of getStationView(i).views) {
    guard.setView(i,getStationView(i,'plan',camera.aspect));
    guard.setView(i,getStationView(i,kind,camera.aspect));
    safe(`${i}/${kind}`);
    if (kind==='plan') {
      assert.equal(controls.enableRotate,false);
      assert.ok(Math.hypot(camera.position.x-controls.target.x,camera.position.z-controls.target.z)<.011);
    } else assert.deepEqual(camera.up.toArray(),[0,1,0]);
  }
});

test('large orbit, pan and zoom requests cannot escape or enter any station or tunnel', () => {
  for (let i=0;i<5;i++) for (const kind of ['platform','detail',...(i?['concourse']:[]),'tunnel']) {
    const view = getStationView(i,kind,camera.aspect);
    guard.setView(i,view);
    for (let n=0;n<24;n++) {
      const angle = n*2.39996;
      camera.position.add(v(Math.cos(angle)*15, (n%3-1)*25, Math.sin(angle)*90));
      if (n%2===0) controls.target.add(v(Math.cos(angle)*35,(n%3-1)*40,Math.sin(angle)*300));
      controls.update();
      safe(`${i}/${kind}/${n}`);
    }
    // Extreme zoom out/in at the boundary must remain reversible.
    for (const factor of [100,.001,10,.1]) {
      camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
      controls.update(); safe(`${i}/${kind}/zoom ${factor}`);
    }
  }
});

test('tunnel slider retains modeled approach buffers even for jumps past either end', () => {
  for (let i=0;i<5;i++) {
    const {min,max} = getTunnelTravelRange(i);
    guard.setView(i,getStationView(i,'tunnel'));
    for (const [request,expected] of [[-1e6,min],[1e6,max],[min+15,min+15]]) {
      guard.moveTunnel(request); safe(`${i}/slider ${request}`);
      assert.ok(Math.abs(camera.position.z-expected)<.001);
    }
  }
});

test('a tunnel slider move remains stable when orbit controls resume at either end', () => {
  for (let i=0;i<5;i++) {
    const {min,max} = getTunnelTravelRange(i);
    guard.setView(i,getStationView(i,'tunnel'));
    for (const z of [min,max,(min+max)/2]) {
      guard.moveTunnel(z);
      const before = camera.position.clone(), focus = controls.target.clone();
      for (let n=0;n<3;n++) controls.update();
      assert.ok(camera.position.distanceTo(before)<1e-6, `${i}/${z}: idle controls must not teleport the camera`);
      assert.ok(controls.target.distanceTo(focus)<1e-6, `${i}/${z}: look-ahead target must remain stable`);
      // A small zoom request moves the camera locally, including at the end.
      camera.position.sub(controls.target).multiplyScalar(.99).add(controls.target);
      controls.update(); safe(`${i}/${z}/resume zoom`);
      assert.ok(camera.position.distanceTo(before)<.2);
    }
  }
});

test('collision-resolved orbits do not snap when controls update without new input', () => {
  const camera = new THREE.PerspectiveCamera(68,1.6,.08,700);
  const controls = new OrbitControls(camera);
  const guard = createStationCamera({camera,controls,environment});
  // Exercise OrbitControls' actual input deltas without needing a DOM in Node.
  controls.domElement = { clientHeight:800,clientWidth:1280 };
  controls.addEventListener('change',()=>guard.constrain());
  const stable = label => {
    const p = camera.position.clone(), t = controls.target.clone();
    for (let n=0;n<3;n++) controls.update();
    assert.ok(camera.position.distanceTo(p)<1e-4, `${label}: position snapped ${camera.position.distanceTo(p)} m`);
    assert.ok(controls.target.distanceTo(t)<1e-4, `${label}: focus changed without input`);
    assert.ok(guard.isClear() && guard.contains(),label);
  };
  guard.setView(4,getStationView(4,'entrance',1.6));
  controls._dollyIn(.3); controls.update();
  controls._rotateLeft(-1); controls._rotateUp(-.4); controls.update();
  stable('Altamira entrance: orbit after zoom against architecture');
  let seed = 3456;
  const random = () => (seed = (Math.imul(1664525,seed)+1013904223)>>>0)/4294967296;
  for (let i=0;i<5;i++) for (const kind of getStationView(i).views) {
    guard.setView(i,getStationView(i,kind,1.6));
    for (let n=0;n<150;n++) {
      const action = Math.floor(random()*3), a = random()-.5, b = random()-.5;
      if (action===0 && controls.enableRotate) { controls._rotateLeft(a*2); controls._rotateUp(b*1.2); }
      if (action===1 && controls.enablePan) controls._pan(a*800,b*500);
      if (action===2) controls._dollyIn(Math.exp(a*2));
      controls.update(); stable(`${i}/${kind}/${n}`);
    }
  }
  guard.dispose();
});

test('plan panning retains the drawing and section/exterior controls stay above and outside the model', () => {
  for (let i=0;i<5;i++) for (const kind of getStationView(i).views.filter(k=>['plan','section','entrance','south'].includes(k))) {
    const view = getStationView(i,kind,camera.aspect);
    guard.setView(i,view);
    for (let n=0;n<12;n++) {
      const direction = n%2?1:-1;
      camera.position.add(v(direction*200,-300,direction*400));
      if (kind==='plan') controls.target.add(v(direction*400,50,direction*400));
      controls.update(); safe(`${i}/${kind}/${n}`);
      if (kind==='plan') {
        assert.ok(Math.abs(controls.target.x-view.target[0])<=4);
        assert.ok(controls.target.z>=stationViews[i].distance-130 && controls.target.z<=stationViews[i].distance-10);
        assert.ok(Math.hypot(camera.position.x-controls.target.x,camera.position.z-controls.target.z)<.011);
        assert.ok(camera.position.y>=8);
      } else {
        assert.deepEqual(controls.target.toArray(),view.target);
        assert.equal(controls.enablePan,false);
        assert.ok(camera.position.y>controls.target.y);
        assert.ok(camera.position.distanceTo(controls.target)>=controls.minDistance-.001);
      }
    }
  }
});

test('resizing at a wall keeps near-plane corners inside the camera clearance', () => {
  guard.setView(4,getStationView(4,'platform'));
  camera.position.x=50; controls.update(); safe('at platform edge');
  const oldPosition = camera.position.clone();
  for (const aspect of [.46,1.6,12]) {
    camera.aspect=aspect; camera.updateProjectionMatrix(); guard.constrain(); safe(`aspect ${aspect}`);
    assert.ok(camera.position.distanceTo(oldPosition)<.001);
    for (const x of [-1,1]) for (const y of [-1,1]) {
      assert.ok(v(x,y,-1).unproject(camera).distanceTo(camera.position)<guard.radius);
    }
  }
  camera.aspect=1.6;
});

test('moving platform and exterior cameras follow clear lanes through all station architecture', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../public/models/blender/manifest.json',import.meta.url),'utf8'));
  const train = await load('train');
  const world = createWorld(THREE,null,manifest.stations,{environment,train,manifest});
  const collision = createCameraCollision([environment]);
  for (const mode of ['platform','exterior']) {
    world.setCameraMode(mode);
    for (const station of stationViews) for (let local=-144;local<5;local+=1.7) {
      world.update(0,station.distance+local+(mode==='platform'?84:-4.6));
      const p = world.camera.position;
      assert.equal(collision.blocked(p,p,cameraClearance(world.camera)),false, `${mode}/${station.name}: ${p.toArray()}`);
    }
    // Station lanes meet the tunnel lining here. Test the whole environment,
    // including both sides of each handoff, at a much finer interval.
    for (const station of stationViews) for (const seam of [-145,5]) for (let offset=-1.1;offset<=1.1;offset+=.05) {
      world.update(0,station.distance+seam+offset+(mode==='platform'?84:-4.6));
      const p = world.camera.position;
      assert.equal(collision.blocked(p,p,cameraClearance(world.camera)),false, `${mode}/${station.name}/seam ${seam}: ${p.toArray()}`);
    }
  }
  world.dispose();
});

test('in-game plans retain both station ends when resizing between portrait and landscape', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../public/models/blender/manifest.json',import.meta.url),'utf8'));
  const train = await load('train');
  const world = createWorld(THREE,null,manifest.stations,{environment,train,manifest});
  for (let i=0;i<5;i++) {
    const station = stationViews[i];
    world.inspectStation(i,'plan');
    for (const [width,height] of [[390,844],[1280,800]]) {
      world.resize(width,height); world.update(0,2160);
      for (const z of [station.distance-140,station.distance]) {
        const projected = v(station.railCenters[1]/2,1.1,z).project(world.camera);
        assert.ok(Math.abs(projected.x)<1 && Math.abs(projected.y)<1, `${station.name}: plan fits after resize to ${width}/${height}`);
      }
      assert.equal(world.inspection.kind,'plan');
      assert.equal(train.position.z,2160);
    }
  }
  world.dispose();
});
