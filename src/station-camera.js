import { Box3, Spherical, Vector3 } from 'three';
import { cameraClearance, createCameraCollision, sweepCamera } from './camera-collision.js';
import { stationViews, getTunnelTravelRange } from './station-views.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const finite = v => [v.x, v.y, v.z].every(Number.isFinite);
const rectangle = (x0,x1,z0,z1) => ({ x0,x1,z0,z1 });

/** Floor regions follow the authored Blender slabs. Separate level presets
 * avoid flying over stair openings or crossing the track bed while panning. */
export function stationCameraRegion(index, kind) {
  const station = stationViews[index], stop = station.distance, core = stop + station.coreOffset;
  if (kind === 'tunnel') {
    const { min, max } = getTunnelTravelRange(index);
    return { rectangles: [rectangle(-1.4,1.4,min,max)], minY: 1.35, maxY: 3.25, inset: false };
  }
  if (kind === 'concourse') {
    const cx = station.platformLayout === 'island' ? 5 : 2;
    const width = index === 1 ? 22 : 18;
    const start = core + (index === 1 ? 12 : index === 3 ? 31 : 12.3);
    const end = core + (index === 1 ? 37 : index === 3 ? 54 : 34);
    return { rectangles: [rectangle(cx-width/2,cx+width/2,start,end)], minY: 5.85, maxY: 7.45 };
  }
  if (kind === 'platform' || kind === 'detail') {
    const island = station.platformLayout === 'island';
    const rectangles = [rectangle(island ? 1.66 : -7.1,island ? 8.34 : -1.66,stop-141,stop+1)];
    if (index === 1) rectangles.push(rectangle(-9.85,-7.1,core-18,core+12));
    return { rectangles, minY: 1.8, maxY: index === 0 ? 4.35 : 3.85 };
  }
  return null;
}

function contains(region, p, radius) {
  if (p.y < region.minY-1e-6 || p.y > region.maxY+1e-6) return false;
  const r = region.inset === false ? 0 : radius;
  return [[-r,-r],[-r,r],[r,-r],[r,r]].every(([dx,dz]) => region.rectangles.some(b =>
    p.x+dx >= b.x0-1e-6 && p.x+dx <= b.x1+1e-6 && p.z+dz >= b.z0-1e-6 && p.z+dz <= b.z1+1e-6));
}

function project(region, point, radius) {
  const p = point.clone(); p.y = clamp(p.y, region.minY, region.maxY);
  if (contains(region,p,radius)) return p;
  const inset = region.inset === false ? 0 : radius;
  let closest, distance = Infinity;
  for (const b of region.rectangles) {
    const q = new Vector3(clamp(p.x,b.x0+inset,b.x1-inset),p.y,clamp(p.z,b.z0+inset,b.z1-inset));
    const d = q.distanceToSquared(p);
    if (d < distance) { closest = q; distance = d; }
  }
  return closest;
}

/** Shared by standalone station review and the in-game inspection camera. */
export function createStationCamera({ camera, controls = null, environment }) {
  const roots = new Map(), collisionCache = new Map();
  environment.traverse(o => { if (!o.isMesh && o.userData.sourceCollection) roots.set(o.userData.sourceCollection,o); });
  const target = controls?.target || new Vector3();
  const lastPosition = new Vector3(), lastTarget = new Vector3();
  let state = null, adjusting = false, radius = cameraClearance(camera);

  function collisions(view) {
    const names = view.collections.slice().sort(), key = names.join('|');
    if (!collisionCache.has(key)) collisionCache.set(key, createCameraCollision(names.map(n => roots.get(n))));
    return collisionCache.get(key);
  }
  function configureControls(view) {
    if (!controls) return;
    const offset = camera.position.clone().sub(target);
    const spherical = new Spherical().setFromVector3(offset), distance = offset.length();
    Object.assign(controls, { enableDamping: false, enableRotate: true, enablePan: true,
      screenSpacePanning: true, zoomToCursor: false, minDistance: .45, maxDistance: 35,
      minPolarAngle: .06, maxPolarAngle: Math.PI-.06, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity,
      minTargetRadius: 0, maxTargetRadius: 180, rotateSpeed: .65, panSpeed: .65, zoomSpeed: .7 });
    controls.cursor.copy(target);
    if (view.kind === 'plan') {
      controls.enableRotate = false;
      controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI;
      controls.minDistance = 8; controls.maxDistance = distance*1.15; controls.maxTargetRadius = 68;
    } else if (!state.region) {
      controls.enablePan = false;
      controls.minDistance = distance*.65; controls.maxDistance = distance*1.25;
      controls.minAzimuthAngle = spherical.theta-.55; controls.maxAzimuthAngle = spherical.theta+.55;
      controls.minPolarAngle = Math.max(.08,spherical.phi-.22);
      controls.maxPolarAngle = Math.min(Math.PI/2-.025,spherical.phi+.22);
      if (view.kind === 'section') {
        const box = new Box3().setFromObject(roots.get(view.collection));
        box.min.z = -view.clip.constant; box.max.z = view.clipEnd.constant;
        const extent = new Vector3(...['x','y','z'].map(k => Math.max(Math.abs(box.min[k]-target[k]),Math.abs(box.max[k]-target[k]))));
        controls.minDistance = Math.max(controls.minDistance,extent.length()+.6);
      } else {
        const minHeight = state.index === 0 ? 2.4 : 9.6;
        controls.maxPolarAngle = Math.min(controls.maxPolarAngle,
          Math.acos(clamp((minHeight-target.y)/controls.minDistance,-1,1)));
      }
    }
  }
  function constrainTarget() {
    if (state.view.kind === 'plan') {
      const center = new Vector3(...state.view.target);
      target.y = center.y;
      const station = stationViews[state.index];
      target.x = clamp(target.x,center.x-4,center.x+4);
      target.z = clamp(target.z,station.distance-130,station.distance-10);
    } else if (!state.region) target.fromArray(state.view.target);
    else {
      const rects = state.region.rectangles;
      target.x = clamp(target.x,Math.min(...rects.map(b=>b.x0)),Math.max(...rects.map(b=>b.x1)));
      target.z = clamp(target.z,Math.min(...rects.map(b=>b.z0)),Math.max(...rects.map(b=>b.z1)));
      target.y = clamp(target.y,state.region.minY-.5,state.region.maxY+.3);
    }
  }
  function remember() { lastPosition.copy(camera.position); lastTarget.copy(target); }
  function fitNearPlane() {
    // Keep the whole near plane inside the same clearance sphere, even after
    // resizing to an unusually wide viewport while pressed against a wall.
    const tangent = Math.tan(camera.fov*Math.PI/360)/camera.zoom;
    const near = Math.min(.08,.24/Math.hypot(1,tangent,tangent*camera.aspect));
    if (camera.near !== near) { camera.near = near; camera.updateProjectionMatrix(); }
  }

  function setView(index, view) {
    adjusting = true;
    state = { index, view, region: stationCameraRegion(index,view.kind), collision: null };
    camera.up.fromArray(view.up); camera.fov = view.fov; camera.near = .08;
    camera.updateProjectionMatrix(); camera.position.fromArray(view.position); target.fromArray(view.target);
    fitNearPlane();
    radius = cameraClearance(camera);
    configureControls(view);
    if (controls) controls.update(); else camera.lookAt(target);
    // Plan/section are deliberately clipped drawings; keep their cameras above
    // or outside the retained slice instead of colliding with removed geometry.
    if (!['plan','section'].includes(view.kind)) {
      state.collision = collisions(view);
      if (state.collision.blocked(camera.position,camera.position,radius)) {
        const original = camera.position.clone();
        outer: for (const distance of [.5,1,1.5,2]) for (const [x,y,z] of [[0,0,-1],[1,0,0],[-1,0,0],[0,1,0]]) {
          const p = original.clone().add(new Vector3(x,y,z).multiplyScalar(distance));
          if ((!state.region || contains(state.region,p,radius)) && !state.collision.blocked(p,p,radius)) {
            camera.position.copy(p); break outer;
          }
        }
      }
    }
    camera.lookAt(target); camera.updateMatrixWorld(); remember(); adjusting = false;
  }

  function constrain() {
    if (!state || adjusting) return false;
    fitNearPlane();
    const nextRadius = cameraClearance(camera);
    if (camera.position.distanceToSquared(lastPosition)<1e-12 && target.distanceToSquared(lastTarget)<1e-12 && nextRadius===radius) return false;
    adjusting = true; radius = nextRadius;
    if (!finite(camera.position) || !finite(target)) { camera.position.copy(lastPosition); target.copy(lastTarget); }
    const requested = camera.position.clone(), previousTarget = target.clone();
    const pan = target.distanceToSquared(lastTarget)>1e-10;
    constrainTarget();
    // If a pan tries to move its focus outside the station, cancel that excess
    // translation before resolving the camera itself.
    if (pan) camera.position.add(target.clone().sub(previousTarget));
    requested.copy(camera.position);
    if (state.region) {
      const desired = project(state.region,camera.position,radius);
      camera.position.copy(sweepCamera(lastPosition,desired,radius,state.collision,p=>contains(state.region,p,radius)));
    } else if (state.collision) {
      camera.position.copy(sweepCamera(lastPosition,camera.position,radius,state.collision));
    } else if (state.view.kind === 'plan') {
      const height = clamp(camera.position.y,8,controls?.maxDistance || 200);
      camera.position.set(target.x,height,target.z+.01);
    }
    if (pan && state.region) { target.add(camera.position.clone().sub(requested)); constrainTarget(); }
    camera.lookAt(target); camera.updateMatrixWorld(); remember(); adjusting = false;
    return true;
  }

  function moveTunnel(distance) {
    if (state?.view.kind !== 'tunnel' || !Number.isFinite(Number(distance))) return;
    const range = getTunnelTravelRange(state.index), z = clamp(Number(distance),range.min,range.max);
    // The slider follows the clear, authored driving bore; sweep from the last
    // accepted position even if the slider jumps across most of the section.
    const desired = new Vector3(0,2.5,z);
    camera.position.copy(sweepCamera(lastPosition,desired,radius,state.collision,p=>contains(state.region,p,radius)));
    target.copy(camera.position).add(new Vector3(0,-.35,18));
    camera.lookAt(target); camera.updateMatrixWorld(); remember();
  }
  return { setView, constrain, moveTunnel, get adjusting() { return adjusting; },
    get radius() { return radius; }, get region() { return state?.region; },
    isClear(position = camera.position) { return !state?.collision || !state.collision.blocked(position,position,radius); },
    contains(position = camera.position) { return !state?.region || contains(state.region,position,radius); },
    clear() { state = null; }, dispose() { collisionCache.clear(); roots.clear(); } };
}
