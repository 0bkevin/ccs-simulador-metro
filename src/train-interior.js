import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

/** Native passenger saloon camera and lights. No replacement web geometry. */
export function createTrainInterior(train, camera, renderer, manifest) {
  const cars = manifest.train.interior?.cars || [];
  const lightGroup = new THREE.Group();
  lightGroup.name = "Blender passenger lighting";
  train.add(lightGroup);
  RectAreaLightUniformsLib.init();
  const lights = (manifest.lighting?.trainAreaLights || []).map(data => {
    const light = new THREE.RectAreaLight(new THREE.Color().fromArray(data.color), data.power / (data.width * data.height), data.width, data.height);
    light.name = data.name;
    light.position.fromArray(data.position);
    light.quaternion.fromArray(data.quaternion);
    light.userData.carIndex = Number(data.collection.slice(-2));
    light.visible = false;
    lightGroup.add(light);
    return light;
  });
  let carIndex = 1, view = "saloon", enabled = false, revision = 0, dragging = null;
  let yaw = 0, pitch = 0, travel = 6.63;
  const anchor = new THREE.Vector3(.22, 2.57, 0);
  function select(index = carIndex, kind = "saloon") {
    carIndex = Math.max(1, Math.min(cars.length || 7, Number(index) || 1));
    view = ["saloon", "seats", "doors", "gangway", "operator", "cab-seat"].includes(kind) ? kind : "saloon";
    if (view === 'operator' || view === 'cab-seat') carIndex = carIndex > 4 ? 7 : 1;
    const car = cars[carIndex - 1];
    yaw = 0; pitch = 0; travel = 6.63;
    anchor.set(.22, car?.eyeY || 2.57, 0);
    if (view === "seats") { travel = 4.25; anchor.x = -.22; anchor.y = 2.22; yaw = -1.3; pitch = -.36; }
    if (view === "doors") { travel = 2.333; anchor.x = .28; yaw = -Math.PI / 2; pitch = -.08; }
    if (view === "gangway") { travel = -8.6; anchor.x = .22; }
    if (view === "operator") {
      const eye = car?.cabEyeLocal || [0,2.60,9.04];
      anchor.set(eye[0] * (car?.direction || 1),eye[1],0); travel=eye[2]; yaw=Math.PI; pitch=-.15;
    }
    if (view === "cab-seat") { travel=9.55;anchor.x=.64*(car?.direction || 1);anchor.y=2.55;yaw=-.48;pitch=-.35; }
    revision++;
  }
  function update(distance, active, viewingZ = distance) {
    enabled = active && cars.length > 0;
    const car = cars[carIndex - 1];
    if (enabled && car) {
      camera.position.set(anchor.x, anchor.y, distance + car.center + car.direction * travel);
      camera.lookAt(camera.position.x + car.direction * Math.sin(yaw) * Math.cos(pitch), camera.position.y + Math.sin(pitch), camera.position.z - car.direction * Math.cos(yaw) * Math.cos(pitch));
    }
    // Interior and adjacent-car illumination follows the consist. Platform
    // views light just the cars nearest the camera, not all 21 area sources.
    const near = enabled ? carIndex : cars.reduce((best, c) => Math.abs(distance + c.center - viewingZ) < Math.abs(distance + (cars[best - 1]?.center || 0) - viewingZ) ? c.index : best, 1);
    for (const light of lights) light.visible = train.visible && Math.abs(light.userData.carIndex - near) <= (enabled ? 1 : 0);
  }
  function move(value) {
    if (view === 'operator' || view === 'cab-seat') return;
    travel = Math.max(-9.6, Math.min(7.6, Number(value) || 0)); revision++;
  }
  const element = renderer?.domElement;
  const down = event => {
    if (!enabled || event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    element.setPointerCapture(event.pointerId);
  };
  const drag = event => {
    if (!enabled || !dragging || dragging.id !== event.pointerId) return;
    yaw -= (event.clientX - dragging.x) * .004;
    pitch = Math.max(-1.1, Math.min(1.1, pitch - (event.clientY - dragging.y) * .004));
    dragging.x = event.clientX; dragging.y = event.clientY; revision++;
  };
  const up = () => { dragging = null; };
  element?.addEventListener("pointerdown", down);
  element?.addEventListener("pointermove", drag);
  element?.addEventListener("pointerup", up);
  element?.addEventListener("pointercancel", up);
  return { select, update, move, cars, lights,
    get revision() { return revision; },
    get state() { return { carIndex, view, travel, enabled }; },
    dispose() { element?.removeEventListener("pointerdown", down); element?.removeEventListener("pointermove", drag); element?.removeEventListener("pointerup", up); element?.removeEventListener("pointercancel", up); },
  };
}
