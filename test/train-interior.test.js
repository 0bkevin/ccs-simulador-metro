import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createTrainInterior } from "../src/train-interior.js";
import { createTrainCab } from '../src/train-cab.js';

const base = new URL("../public/models/blender/", import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL("manifest.json", base), "utf8"));
const buffer = await fs.readFile(new URL("train.glb", base));
const loader = new GLTFLoader();
loader.register(() => ({ name: "headless_geometry_review", loadTexture: () => Promise.resolve(new THREE.Texture()) }));
const { scene: train } = await new Promise((resolve, reject) => loader.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), "", resolve, reject));
train.updateMatrixWorld(true);

test("seven native saloons have floors, curved seating and complete ceiling geometry", () => {
  assert.equal(manifest.train.interior.cars.length, 7);
  for (const [i, name] of manifest.train.interior.collections.entries()) {
    const stats = manifest.assets.train.collections[name];
    assert.ok(stats.meshes > 100 && stats.triangles > 10000);
    let root;
    train.traverse(o => { if (!o.isMesh && o.userData.sourceAsset === 'train' && o.userData.sourceCollection === name) root = o; });
    assert.ok(root, name);
    const car = manifest.train.interior.cars[i];
    const ray = new THREE.Raycaster(new THREE.Vector3(.22,car.eyeY,car.center),new THREE.Vector3(0,-1,0));
    const floor = ray.intersectObject(root,true)[0];
    assert.ok(floor && Math.abs(floor.point.y-car.floorY)<.01, name + " floor accessible");
    ray.set(new THREE.Vector3(.22,car.eyeY,car.center+.3),new THREE.Vector3(0,1,0));
    const ceiling=ray.intersectObject(root,true)[0];
    assert.ok(ceiling && ceiling.point.y>3.3 && ceiling.point.y<3.41, name + " ceiling closes the saloon");
  }
});

test("passenger and door windows are genuinely transparent through every opaque shell layer", () => {
  for (const car of manifest.train.interior.cars) {
    const doors=manifest.train.doors.centresLocalMetres[`CAF car ${String(car.index).padStart(2,'0')}`];
    const windows=doors.slice(1).map((b,i)=>(doors[i]+b)/2);
    for (const u of [...windows,doors[2]+.442]) {
      for (const side of [-1,1]) {
        const ray = new THREE.Raycaster(new THREE.Vector3(side*.35,2.45,car.center+car.direction*u),new THREE.Vector3(side,0,0),0,1.3);
        const hit=ray.intersectObject(train,true)[0];
        assert.ok(hit, `car${car.index} u${u} glazing exists`);
        assert.ok(hit.object.material.transparent && hit.object.material.opacity<.5, `car${car.index} u${u}: ${hit.object.name} must not block glazing`);
      }
    }
  }
});

test("exterior aperture cuts leave the passenger aisle unobstructed", () => {
  for (const car of manifest.train.interior.cars) {
    const ray = new THREE.Raycaster(new THREE.Vector3(.22,car.eyeY,car.center+car.direction*7.4),new THREE.Vector3(0,0,-car.direction),0,15);
    assert.equal(ray.intersectObject(train,true).length,0,`car ${car.index}: no window-cutter faces across aisle`);
  }
});

test("gangways remain open with continuous floors between all seven cars", () => {
  for (let index=0;index<6;index++) {
    const z=(manifest.train.interior.cars[index].center+manifest.train.interior.cars[index+1].center)/2;
    const ray=new THREE.Raycaster(new THREE.Vector3(.22,2.57,z+.6),new THREE.Vector3(0,0,-1),0,1.2);
    assert.equal(ray.intersectObject(train,true).length,0,"no opaque structural end cap");
    ray.set(new THREE.Vector3(.22,1.3,z),new THREE.Vector3(0,-1,0));
    const floor=ray.intersectObject(train,true)[0];
    assert.ok(floor && Math.abs(floor.point.y-1.07)<.025,"bridge floor joins adjacent cars");
  }
});

test("interior camera and lights follow the moving train without exceeding the car envelope", () => {
  const camera=new THREE.PerspectiveCamera();
  const interior=createTrainInterior(train,camera,null,manifest);
  assert.equal(interior.lights.length,23);
  for(const car of manifest.train.interior.cars){
    interior.select(car.index);interior.update(0,true);
    const before=camera.position.clone();
    interior.update(160,true);
    assert.ok(Math.abs(camera.position.z-before.z-160)<1e-5);
    assert.ok(Math.abs(camera.position.x)<.6 && camera.position.y>car.floorY && camera.position.y<3.3);
    interior.move(99);assert.equal(interior.state.travel,7.6);
    interior.move(-99);assert.equal(interior.state.travel,-9.6);
    assert.ok(interior.lights.filter(l=>l.visible).length<=10);
  }
  interior.dispose();
});

test('both operator cabs have a clear eye line, solid floor and correctly sized native HMI', () => {
  train.updateMatrixWorld(true);
  for (const car of manifest.train.interior.cars.filter(c=>c.cabEyeLocal)) {
    assert.ok([1,7].includes(car.index));
    const [x,y,u]=car.cabEyeLocal;
    const eye=new THREE.Vector3(x,y,car.center+car.direction*u);
    const ray=new THREE.Raycaster(eye,new THREE.Vector3(0,0,car.direction),0,2);
    const glazing=ray.intersectObject(train,true)[0];
    assert.ok(glazing?.object.material.transparent,'operator looks through the windshield, not opaque desk or wall');
    for(const longitudinal of [8.42,8.8,9.2,9.55,9.9]) {
      ray.set(new THREE.Vector3(.50,1.19,car.center+car.direction*longitudinal),new THREE.Vector3(0,-1,0));ray.far=.3;
      const floor=ray.intersectObject(train,true)[0];
      assert.ok(floor && Math.abs(floor.point.y-1.07)<.012,'cab footwell has a continuous floor');
    }
    for(const side of [-1,1]) {
      ray.set(new THREE.Vector3(0,2.65,car.center+car.direction*8.67),new THREE.Vector3(side,0,0));ray.far=1.6;
      const window=ray.intersectObject(train,true)[0];
      assert.ok(window?.object.material.transparent,'inner trim keeps guillotine windows clear');
    }
    let hmi;
    train.traverse(o=>{if(o.isMesh && /CAF cab HMI active display/.test(o.material.name) && o.userData.sourceCollection===`CAF interior ${String(car.index).padStart(2,'0')}`)hmi=o;});
    assert.ok(hmi,'native HMI face exported');
    const bounds=new THREE.Box3().setFromObject(hmi,true),size=bounds.getSize(new THREE.Vector3());
    assert.ok(Math.abs(size.x-.21133)<.001,'HMI active width matches 10.4-inch 4:3 specification');
    assert.ok(Math.abs(Math.hypot(size.y,size.z)-.1585)<.001,'inclined HMI keeps its specified active height');
    const screens=[];
    train.traverse(o=>{if(o.isMesh && /CAF cab (?:DMI|HMI) active display/.test(o.material.name) && o.userData.sourceCollection===`CAF interior ${String(car.index).padStart(2,'0')}`)screens.push(o);});
    for(const screen of screens) {
      const midpoint=new THREE.Box3().setFromObject(screen,true).getCenter(new THREE.Vector3());
      const positions=screen.geometry.getAttribute('position');
      for(let i=0;i<positions.count;i++) {
        const target=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(screen.matrixWorld).lerp(midpoint,.20);
        ray.set(eye,target.clone().sub(eye).normalize());ray.far=eye.distanceTo(target)+.01;
        const visible=ray.intersectObject(train,true)[0];
        assert.equal(visible?.object.material.name,screen.material.name,'every display corner remains in front of the console skin');
      }
    }
  }
  assert.equal(manifest.train.interior.cars.filter(c=>c.cabEyeLocal).length,2);
});

test('operator viewpoints select a driving car and remain attached to either end', () => {
  const camera=new THREE.PerspectiveCamera();const interior=createTrainInterior(train,camera,null,manifest);
  for(const [selected,expected] of [[2,1],[6,7]]) {
    interior.select(selected,'operator');interior.update(0,true);
    assert.equal(interior.state.carIndex,expected);
    const car=manifest.train.interior.cars[expected-1],before=camera.position.clone();
    assert.ok(camera.getWorldDirection(new THREE.Vector3()).z*car.direction>.98);
    interior.move(-9);assert.equal(interior.state.travel,car.cabEyeLocal[2],'passenger travel slider cannot move through the cab wall');
    interior.update(220,true);assert.ok(Math.abs(camera.position.z-before.z-220)<1e-6);
    interior.select(expected,'saloon');interior.move(-4);assert.equal(interior.state.travel,-4);
  }
  interior.dispose();
});

test('native master controller follows traction and brake and remains neutral while doors are open', () => {
  const cab=createTrainCab(train);assert.equal(cab.controllers.length,2);
  const lead=cab.controllers.find(c=>c.carIndex===1),rear=cab.controllers.find(c=>c.carIndex===7);
  cab.update({throttle:true});assert.ok(lead.object.quaternion.angleTo(lead.rest)>.2);
  assert.ok(rear.object.quaternion.angleTo(rear.rest)<1e-7,'inactive rear cab stays neutral');
  cab.update({throttle:true},.5);assert.ok(lead.object.quaternion.angleTo(lead.rest)<1e-7);
  cab.update({brake:true});assert.ok(lead.object.quaternion.angleTo(lead.rest)>.3);
  const revision=cab.revision;cab.update({brake:true});assert.equal(cab.revision,revision);
  cab.update({});assert.ok(lead.object.quaternion.angleTo(lead.rest)<1e-7);
  cab.dispose();
});

test("look dragging keeps the same pitch and local direction in either driving car", () => {
  const element = new EventTarget();
  element.setPointerCapture = () => {};
  const camera = new THREE.PerspectiveCamera();
  const interior = createTrainInterior(train,camera,{domElement:element},manifest);
  const point = (type,x,y) => {
    const event = new Event(type);
    Object.assign(event,{pointerId:1,button:0,clientX:x,clientY:y});
    element.dispatchEvent(event);
  };
  for (const index of [1,7]) {
    interior.select(index); interior.update(0,true);
    point("pointerdown",0,0); point("pointermove",250,-100); point("pointerup",250,-100);
    interior.update(0,true);
    const direction = camera.getWorldDirection(new THREE.Vector3());
    const orientation = index === 7 ? -1 : 1;
    assert.ok(Math.abs(direction.y-Math.sin(.4))<1e-6,"pitch does not depend on yaw");
    assert.ok(Math.abs(direction.x-orientation*Math.sin(-1)*Math.cos(.4))<1e-6,"local horizontal dragging is consistent");
  }
  interior.dispose();
});
