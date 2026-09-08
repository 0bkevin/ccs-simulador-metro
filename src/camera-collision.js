import { Box3, Line3, Matrix4, Ray, Vector3 } from 'three';
import { CENTER, ExtendedTriangle, MeshBVH } from 'three-mesh-bvh';

// Separate, indirect trees preserve the render meshes' index buffers/materials.
// Build only meshes touched by a camera query, then reuse them across views.
const trees = new WeakMap();

export function cameraClearance(camera) {
  const h = camera.near * Math.tan(camera.fov * Math.PI / 360) / camera.zoom;
  return Math.max(.30, Math.hypot(camera.near, h, h * camera.aspect) + .05);
}

export function createCameraCollision(roots) {
  const entries = [];
  for (const root of roots.filter(Boolean)) {
    root.updateWorldMatrix(true, true);
    root.traverse(mesh => {
      if (!mesh.isMesh || !mesh.geometry.attributes.position) return;
      const geometry = mesh.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const inverse = new Matrix4().copy(mesh.matrixWorld).invert();
      const scales = new Vector3().setFromMatrixScale(inverse);
      entries.push({ geometry, matrix: mesh.matrixWorld.clone(), inverse,
        scale: Math.max(scales.x, scales.y, scales.z),
        uniform: Math.max(scales.x, scales.y, scales.z) - Math.min(scales.x, scales.y, scales.z) < 1e-6,
        box: geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld) });
    });
  }
  const worldBox = new Box3(), localBox = new Box3(), line = new Line3();
  const ray = new Ray(), closest = new Vector3(), intersection = new Vector3();
  const worldTriangle = new ExtendedTriangle(), worldLine = new Line3(), worldRay = new Ray();

  /** Swept sphere: tests the whole movement, including a large wheel/pan jump.
   * Geometry is tested from both sides, including glass and thin panels. */
  function blocked(from, to, radius) {
    worldBox.makeEmpty().expandByPoint(from).expandByPoint(to).expandByScalar(radius);
    worldLine.set(from, to);
    const worldLength = from.distanceTo(to);
    worldRay.origin.copy(from); worldRay.direction.subVectors(to, from).normalize();
    for (const entry of entries) {
      if (!worldBox.intersectsBox(entry.box)) continue;
      let tree = trees.get(entry.geometry);
      if (!tree) {
        tree = new MeshBVH(entry.geometry, { strategy: CENTER, maxLeafSize: 16, indirect: true });
        trees.set(entry.geometry, tree);
      }
      line.start.copy(from).applyMatrix4(entry.inverse);
      line.end.copy(to).applyMatrix4(entry.inverse);
      const localRadius = radius * entry.scale, length = line.distance();
      localBox.makeEmpty().expandByPoint(line.start).expandByPoint(line.end).expandByScalar(localRadius);
      ray.origin.copy(line.start); ray.direction.subVectors(line.end, line.start).normalize();
      if (tree.shapecast({
        intersectsBounds: box => box.intersectsBox(localBox),
        intersectsTriangle: triangle => {
          let tri = triangle, segment = line, cast = ray, limit = length, r = localRadius;
          if (!entry.uniform) {
            worldTriangle.a.copy(triangle.a).applyMatrix4(entry.matrix);
            worldTriangle.b.copy(triangle.b).applyMatrix4(entry.matrix);
            worldTriangle.c.copy(triangle.c).applyMatrix4(entry.matrix);
            worldTriangle.needsUpdate = true;
            tri = worldTriangle; segment = worldLine; cast = worldRay; limit = worldLength; r = radius;
          }
          if (limit < 1e-8) return tri.closestPointToPoint(segment.start, closest).distanceTo(segment.start) < r;
          // closestPointToSegment checks edges and endpoints; explicitly cover
          // a long segment piercing the middle of a large, thin face as well.
          if (cast.intersectTriangle(tri.a, tri.b, tri.c, false, intersection)
              && intersection.distanceToSquared(segment.start) <= limit * limit) return true;
          return tri.closestPointToSegment(segment) < r;
        },
      })) return true;
    }
    return false;
  }
  return { blocked, get meshCount() { return entries.length; } };
}

/** Stop before the first obstruction, then slide along clear axes. */
export function sweepCamera(from, destination, radius, collision, contains = () => true) {
  const probe = new Vector3();
  const clear = (a, b) => {
    // Also catch crossing the empty corner between connected floor regions.
    const count = Math.ceil(a.distanceTo(b) / .25);
    for (let i = 1; i <= count; i++) if (!contains(probe.lerpVectors(a, b, i / count))) return false;
    return !collision.blocked(a, b, radius);
  };
  function advance(a, b) {
    if (a.distanceToSquared(b) < 1e-12) return a.clone();
    if (clear(a, b)) return b.clone();
    let low = 0, high = 1;
    const mid = new Vector3();
    for (let i = 0; i < 13; i++) {
      const t = (low + high) / 2;
      if (clear(a, mid.lerpVectors(a, b, t))) low = t; else high = t;
    }
    // Leave a small gap so the next movement can slide away from the wall.
    return a.clone().lerp(b, Math.max(0, low - .012 / a.distanceTo(b)));
  }
  const result = advance(from, destination);
  if (result.distanceToSquared(destination) > 1e-8) {
    const axes = ['x','z','y'].sort((a,b) => Math.abs(destination[b]-result[b]) - Math.abs(destination[a]-result[a]));
    for (const axis of axes) {
      const step = result.clone(); step[axis] = destination[axis];
      result.copy(advance(result, step));
    }
  }
  return result;
}
