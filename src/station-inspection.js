import * as THREE from 'three';
import { stationViews, getTunnelRange } from './station-views.js';

/** Inspect the actual model with a section plane, never a separate drawing. */
export function applyStationCut(renderer, view) {
  if (renderer) renderer.clippingPlanes = [view.clip, view.clipEnd].filter(Boolean).map(clip => new THREE.Plane(new THREE.Vector3(...clip.normal), clip.constant));
}

export function stationMetrics(index, kind) {
  const station = stationViews[index];
  if (kind === 'tunnel') {
    const { start, end } = getTunnelRange(index);
    return `Ø interior 5,16 m · revestimiento 0,22 m · anillos 0,80 m · tramo ${end - start} m`;
  }
  return `Andén ${station.platformLength} m · ${station.platformLayout === 'island' ? 'isla central' : 'dos laterales'} · ancho de vía 1,435 m`;
}

export function createScaleRuler(scene) {
  const ruler = new THREE.Group(); ruler.name = 'Metre scale for station plan';
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 50));
  for (let i = 0; i <= 50; i += 10) points.push(new THREE.Vector3(-1, 0, i), new THREE.Vector3(1, 0, i));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffc45e, depthTest: false });
  const lines = new THREE.LineSegments(geometry, material); lines.renderOrder = 10;
  ruler.add(lines); scene.add(ruler); ruler.visible = false;
  return {
    show(index, kind) {
      ruler.visible = kind === 'plan';
      ruler.position.set(-13, 1.4, stationViews[index].distance - 135);
    },
    hide() { ruler.visible = false; },
    dispose() { geometry.dispose(); material.dispose(); scene.remove(ruler); },
  };
}
