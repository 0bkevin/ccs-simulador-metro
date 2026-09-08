const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const ease = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };

/** Drive the native leaf assemblies without changing their baked geometry.
 * The short outward clearance precedes the slide along the car side. Travel
 * and cycle time are visual estimates; the asset records that distinction.
 */
export function createTrainDoors(train) {
  const leaves = [];
  train.traverse(object => {
    const data = object.userData;
    if (!object.isMesh && data.doorId && Number.isFinite(data.doorTravelZ)) {
      leaves.push({ object, closed: object.position.clone(), side: data.doorSide,
        x: data.doorTravelX, z: data.doorTravelZ });
    }
  });
  const fractions = { '-1': 0, '1': 0 };
  let initialized = false, moving = false, revision = 0;
  function update(dt = 0, { doorsOpen = false, doorSide = -1 } = {}) {
    const step = Number.isFinite(dt) ? clamp(dt, 0, .1) : 0;
    moving = false;
    for (const side of [-1, 1]) {
      const target = doorsOpen && (doorSide === 'both' || Number(doorSide) === side) ? 1 : 0;
      const old = fractions[side];
      fractions[side] = initialized
        ? old + Math.sign(target - old) * Math.min(Math.abs(target - old), step / (target ? 2.4 : 2.8))
        : target;
      if (Math.abs(fractions[side] - target) < 1e-9) fractions[side] = target;
      if (fractions[side] !== old) revision++;
      moving ||= fractions[side] !== target;
    }
    initialized = true;
    for (const leaf of leaves) {
      const t = fractions[leaf.side];
      leaf.object.position.copy(leaf.closed);
      leaf.object.position.x += leaf.x * ease(t / .14);
      leaf.object.position.z += leaf.z * ease((t - .14) / .86);
    }
  }
  return { update, leaves,
    get fraction() { return Math.max(fractions[-1], fractions[1]); },
    get moving() { return moving; },
    get revision() { return revision; },
    get fractions() { return { ...fractions }; },
  };
}
