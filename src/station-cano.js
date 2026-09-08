/*
 * Caño Amarillo, Line 1
 *
 * This assembly is intentionally independent from the generic station kit.
 * The real station is elevated, has two side platforms, and is dominated by
 * a yellow tubular space-frame roof.  Coordinates are local to a stopping
 * datum: rail top is y=0, the consist occupies z=-140..0, and the 165 m
 * station envelope runs z=-152.5..12.5.
 */

const LENGTH = 165;
const Z_MIN = -152.5;
const Z_MAX = 12.5;
const Z_CENTER = (Z_MIN + Z_MAX) / 2;
const RAIL_CENTERS = [0, 4];
const PLATFORM_TOP = 1;

function makeMaterials(THREE) {
  const textureMaterials = [];
  const mat = (name, color, options = {}) => {
    const params = {
      color,
      roughness: options.roughness ?? .76,
      metalness: options.metalness ?? 0,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
    };
    if (options.side !== undefined) params.side = options.side;
    if (options.emissive !== undefined) params.emissive = options.emissive;
    if (options.emissiveIntensity !== undefined) params.emissiveIntensity = options.emissiveIntensity;
    const material = new THREE.MeshStandardMaterial(params);
    material.name = name;
    return material;
  };
  const gridMaterial = () => {
    if (typeof document === 'undefined') return mat('fine gray platform grid', 0x8a8d89, { roughness: .9 });
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8b8e8b'; ctx.fillRect(0, 0, 96, 96);
    ctx.strokeStyle = '#666b69'; ctx.lineWidth = 2;
    for (let p = 0; p <= 96; p += 12) {
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 96); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(96, p); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // The source has eight cells per side. Repeat by the physical station
    // dimensions so each grid cell is about 0.3 m in both directions instead
    // of stretching a single tile down the full station length.
    texture.repeat.set(5.9 / (8 * .3), LENGTH / (8 * .3));
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .9 });
    material.name = 'fine gray platform grid';
    textureMaterials.push(material, texture);
    return material;
  };
  const sign = (text) => {
    if (typeof document === 'undefined') return mat(`station sign ${text}`, 0x161b1d, { roughness: .45 });
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 112;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#161b1d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff6db'; ctx.font = '700 44px Arial'; ctx.textBaseline = 'middle';
    ctx.fillText(String(text || 'Caño Amarillo').toUpperCase(), 24, 57);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    material.name = `station sign ${text}`;
    textureMaterials.push(material, texture);
    return material;
  };
  return {
    platform: gridMaterial(),
    concrete: mat('exposed concrete', 0x747875, { roughness: .88 }),
    concreteDark: mat('concrete shadow', 0x4d5554, { roughness: .92 }),
    steel: mat('rail steel', 0xaab4b3, { roughness: .3, metalness: .78 }),
    yellow: mat('safety yellow', 0xf0bf19, { roughness: .48, metalness: .08 }),
    truss: mat('painted yellow space frame', 0xe0ae10, { roughness: .5, metalness: .15 }),
    roof: mat('opaque gray roof strips', 0x626967, { roughness: .83 }),
    skylight: mat('translucent roof skylights', 0xc8d7cb, { roughness: .24, transparent: true, opacity: .62, side: THREE.DoubleSide }),
    black: mat('sign fascia and dark track bed', 0x151a1b, { roughness: .8 }),
    glassBlock: mat('glass block rear wall', 0x69878b, { roughness: .3, transparent: true, opacity: .78 }),
    plaza: mat('lower plaza paving', 0x676d69, { roughness: .9 }),
    earth: mat('hillside earth', 0x514f3c, { roughness: 1 }),
    foliage: mat('hillside foliage', 0x245c3f, { roughness: 1 }),
    light: mat('roof fluorescent light', 0xffefb4, { roughness: .35, emissive: 0xffdf8a, emissiveIntensity: 1.9 }),
    signName: sign('Caño Amarillo'),
    owned: textureMaterials,
  };
}

function geometryCache(THREE) {
  const boxes = new Map();
  const cylinders = new Map();
  const cacheBox = (sx, sy, sz) => {
    const key = [sx, sy, sz].join(':');
    if (!boxes.has(key)) boxes.set(key, new THREE.BoxGeometry(sx, sy, sz));
    return boxes.get(key);
  };
  const cacheCylinder = (radius, radial = 8) => {
    const key = `${radius}:${radial}`;
    if (!cylinders.has(key)) cylinders.set(key, new THREE.CylinderGeometry(radius, radius, 1, radial));
    return cylinders.get(key);
  };
  return { boxes, cylinders, cacheBox, cacheCylinder };
}

function addBox(THREE, cache, parent, name, x, y, z, sx, sy, sz, material, rotationZ = 0) {
  const mesh = new THREE.Mesh(cache.cacheBox(sx, sy, sz), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotationZ;
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(THREE, cache, parent, name, x, y, z, radius, height, material, radial = 10) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radial), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addInstancedBoxes(THREE, cache, parent, name, sx, sy, sz, material, transforms) {
  const mesh = new THREE.InstancedMesh(cache.cacheBox(sx, sy, sz), material, transforms.length);
  mesh.name = name;
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  transforms.forEach((item, index) => {
    quaternion.setFromEuler(new THREE.Euler(item.rx || 0, item.ry || 0, item.rz || 0));
    scale.set(item.sx || 1, item.sy || 1, item.sz || 1);
    matrix.compose(new THREE.Vector3(item.x || 0, item.y || 0, item.z || 0), quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addInstancedTubes(THREE, cache, parent, name, radius, material, members) {
  const mesh = new THREE.InstancedMesh(cache.cacheCylinder(radius, 8), material, members.length);
  mesh.name = name;
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  const delta = new THREE.Vector3();
  const midpoint = new THREE.Vector3();
  members.forEach((member, index) => {
    start.set(member[0][0], member[0][1], member[0][2]);
    end.set(member[1][0], member[1][1], member[1][2]);
    delta.subVectors(end, start);
    const length = delta.length();
    midpoint.addVectors(start, end).multiplyScalar(.5);
    quaternion.setFromUnitVectors(up, delta.normalize());
    matrix.compose(midpoint, quaternion, new THREE.Vector3(1, length, 1));
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function roofY(x) {
  // Low eaves and a raised central ridge create the pitched skylight profile.
  const distance = Math.abs(x - 2);
  return 7.75 - Math.min(distance, 9.5) * .16;
}

function platform(THREE, cache, parent, mats, x, name, edgeX) {
  addBox(THREE, cache, parent, name, x, .5, Z_CENTER, 5.9, 1, LENGTH, mats.platform);
  addBox(THREE, cache, parent, `${name} yellow tactile edge`, edgeX, 1.05, Z_CENTER, .16, .1, LENGTH, mats.yellow);
  return { inner: edgeX, outer: x < 0 ? x - 2.95 : x + 2.95 };
}

function buildRoof(THREE, cache, parent, mats) {
  const xNodes = [-7.2, -4.4, -1.8, .3, 2, 3.7, 6.3, 8.8, 11.2];
  const zNodes = [];
  for (let z = Z_MIN; z <= Z_MAX + .01; z += 8.25) zNodes.push(Math.min(z, Z_MAX));
  const longitudinal = [];
  const transverse = [];
  const diagonals = [];
  for (let i = 0; i < xNodes.length; i++) {
    for (let j = 0; j < zNodes.length - 1; j++) {
      longitudinal.push([[xNodes[i], roofY(xNodes[i]), zNodes[j]], [xNodes[i], roofY(xNodes[i]), zNodes[j + 1]]]);
    }
  }
  for (let j = 0; j < zNodes.length; j++) {
    for (let i = 0; i < xNodes.length - 1; i++) {
      transverse.push([[xNodes[i], roofY(xNodes[i]), zNodes[j]], [xNodes[i + 1], roofY(xNodes[i + 1]), zNodes[j]]]);
    }
  }
  for (let j = 0; j < zNodes.length - 1; j++) {
    for (let i = 0; i < xNodes.length - 1; i++) {
      const a = [xNodes[i], roofY(xNodes[i]), zNodes[j]];
      const b = [xNodes[i + 1], roofY(xNodes[i + 1]), zNodes[j + 1]];
      const c = [xNodes[i + 1], roofY(xNodes[i + 1]), zNodes[j]];
      const d = [xNodes[i], roofY(xNodes[i]), zNodes[j + 1]];
      diagonals.push([a, b], [c, d]);
    }
  }
  addInstancedTubes(THREE, cache, parent, 'dense yellow roof longitudinal tubes', .085, mats.truss, longitudinal);
  addInstancedTubes(THREE, cache, parent, 'dense yellow roof transverse tubes', .085, mats.truss, transverse);
  addInstancedTubes(THREE, cache, parent, 'dense yellow roof diagonal tubes', .07, mats.truss, diagonals);

  // The roof is carried by visible yellow tubular posts along both platform
  // backs. Short branches turn each post into a triangular frame bay instead
  // of leaving the space-frame floating above the platforms.
  const supports = [];
  for (const x of [-6.5, 10.5]) {
    for (let z = Z_MIN + 4.125; z < Z_MAX; z += 8.25) {
      const top = [x, roofY(x), z];
      supports.push([[x, 1.02, z], top]);
      supports.push([[x, 1.08, z], [x - (x < 0 ? .72 : -.72), roofY(x - (x < 0 ? .72 : -.72)), z]]);
      supports.push([[x, 1.08, z], [x + (x < 0 ? .72 : -.72), roofY(x + (x < 0 ? .72 : -.72)), z]]);
    }
  }
  addInstancedTubes(THREE, cache, parent, 'yellow tubular roof support columns', .115, mats.truss, supports);

  // The steel frame carries broad opaque strips at the eaves and narrow
  // translucent bands around the raised center, matching the station photo.
  addBox(THREE, cache, parent, 'opaque gray roof strip west', -5.525, 6.97, Z_CENTER, 3.35, .12, LENGTH, mats.roof, .13);
  addBox(THREE, cache, parent, 'opaque gray roof strip west inner', -2.9, 7.42, Z_CENTER, 1.9, .1, LENGTH, mats.roof, .09);
  addBox(THREE, cache, parent, 'opaque gray roof strip east inner', 6.9, 7.42, Z_CENTER, 1.9, .1, LENGTH, mats.roof, -.09);
  addBox(THREE, cache, parent, 'opaque gray roof strip east', 9.525, 6.97, Z_CENTER, 3.35, .12, LENGTH, mats.roof, -.13);
  addBox(THREE, cache, parent, 'pitched translucent central skylight west', 0, 7.53, Z_CENTER, 3.9, .055, LENGTH, mats.skylight, .08);
  addBox(THREE, cache, parent, 'pitched translucent central skylight east', 4, 7.53, Z_CENTER, 3.9, .055, LENGTH, mats.skylight, -.08);
}

function buildRearWalls(THREE, cache, parent, mats) {
  const transforms = [];
  for (const x of [-7.43, 11.43]) {
    for (let z = Z_MIN + .45; z < Z_MAX; z += 1.1) {
      if (x < 0 && z > -75 && z < -65) continue;
      for (let row = 0; row < 5; row++) transforms.push({ x, y: 1.48 + row * .88, z });
    }
  }
  addBox(THREE, cache, parent, 'dark rear wall backing east', 11.43, 3.2, Z_CENTER, .12, 4.35, LENGTH, mats.black);
  addBox(THREE, cache, parent, 'dark rear wall backing west north', -7.43, 3.2, (Z_MIN - 75) / 2, .12, 4.35, -75 - Z_MIN, mats.black);
  addBox(THREE, cache, parent, 'dark rear wall backing west south', -7.43, 3.2, (-65 + Z_MAX) / 2, .12, 4.35, Z_MAX + 65, mats.black);
  addInstancedBoxes(THREE, cache, parent, 'glass block grid rear walls', .16, .72, .9, mats.glassBlock, transforms);
}

function buildGuardrails(THREE, cache, parent, mats) {
  const posts = [];
  for (let z = Z_MIN; z <= Z_MAX; z += 8.25) {
    posts.push({ x: -7.43, y: 1.72, z }, { x: 11.43, y: 1.72, z });
  }
  addInstancedBoxes(THREE, cache, parent, 'yellow platform guardrail posts', .12, 1.45, .12, mats.yellow, posts);
  addBox(THREE, cache, parent, 'yellow guardrail west upper', -7.43, 2.35, Z_CENTER, .12, .12, LENGTH, mats.yellow);
  addBox(THREE, cache, parent, 'yellow guardrail east upper', 11.43, 2.35, Z_CENTER, .12, .12, LENGTH, mats.yellow);
  addBox(THREE, cache, parent, 'yellow guardrail west lower', -7.43, 1.45, Z_CENTER, .12, .1, LENGTH, mats.yellow);
  addBox(THREE, cache, parent, 'yellow guardrail east lower', 11.43, 1.45, Z_CENTER, .12, .1, LENGTH, mats.yellow);
}

function buildSupportsAndPlaza(THREE, cache, parent, mats) {
  addBox(THREE, cache, parent, 'elevated concrete deck', 2, -.65, Z_CENTER, 19.2, .55, LENGTH, mats.concreteDark);
  addBox(THREE, cache, parent, 'lower paved plaza', 2, -3.2, Z_CENTER, 37, .25, 195, mats.plaza);
  const supports = [];
  for (let z = Z_MIN + 8; z < Z_MAX; z += 24) {
    supports.push({ x: -6.1, y: -1.9, z }, { x: 1.9, y: -1.9, z }, { x: 10.1, y: -1.9, z });
  }
  addInstancedBoxes(THREE, cache, parent, 'elevated concrete support piers', .72, 4.55, .72, mats.concrete, supports);

  // Low-poly valley foliage and hillsides give the exposed station its
  // Caracas context without turning the reference scene into a city model.
  const trees = [];
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1;
    trees.push({ x: side * (15 + (i % 4) * 2.2), y: -1.25, z: -145 + (i * 19) % 160 });
  }
  const treeMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(1.6, 4.8, 7), mats.foliage, trees.length);
  treeMesh.name = 'lower plaza hillside vegetation';
  const treeMatrix = new THREE.Matrix4();
  trees.forEach((item, index) => { treeMatrix.makeTranslation(item.x, item.y, item.z); treeMesh.setMatrixAt(index, treeMatrix); });
  treeMesh.instanceMatrix.needsUpdate = true; treeMesh.castShadow = true; treeMesh.receiveShadow = true; parent.add(treeMesh);
}

function buildAccessLandmark(THREE, cache, parent, mats) {
  const x = -10.5;
  const z = -70;
  addBox(THREE, cache, parent, 'exposed concrete entrance landing', x, -.5, z, 5.0, .45, 9.5, mats.concrete);
  const steps = [];
  // The exposed stair climbs across the west side of the deck: its lower
  // landing is on the plaza and its upper landing meets the -7.5 m outer
  // edge of the west platform at platform height.
  const rise = .25;
  for (let i = 0; i < 16; i++) {
    const height = (i + 1) * rise;
    steps.push({ x: -10.5 + (i + .5) * .2, y: -3.05 + height / 2, z });
  }
  addInstancedBoxes(THREE, cache, parent, 'entrance concrete stair treads', .2, 1, 4.4, mats.concrete, steps.map((step, i) => ({ ...step, sy: (i + 1) * rise })));
  addBox(THREE, cache, parent, 'entrance upper platform landing', -7.15, 1.05, z, .7, .1, 4.4, mats.concrete);
  addBox(THREE, cache, parent, 'entrance stair parapet north', x - .0, -.2, z - 2.45, 3.6, 3.4, .48, mats.concrete);
  addBox(THREE, cache, parent, 'entrance stair parapet south', x - .0, -.2, z + 2.45, 3.6, 3.4, .48, mats.concrete);
  addBox(THREE, cache, parent, 'entrance projecting concrete beam', x, 1.82, z, 5.5, .48, 1.0, mats.concrete);
}

function buildLights(THREE, cache, parent, mats) {
  const lights = [];
  for (const x of [-5.3, -.3, 4.3, 9.25]) for (let z = Z_MIN + 8; z < Z_MAX; z += 13.2) lights.push({ x, y: 6.2, z });
  addInstancedBoxes(THREE, cache, parent, 'roof fluorescent light strips', 2.2, .07, .18, mats.light, lights);
}

/**
 * Create the elevated Caño Amarillo station in local stopping coordinates.
 * `station.name` is accepted for integration, but the visible sign remains
 * the historically correct Caño Amarillo name.
 */
export function createCanoAmarilloStation(THREE, station = {}) {
  if (!THREE) throw new Error('createCanoAmarilloStation requires the injected THREE namespace');
  const cache = geometryCache(THREE);
  const mats = makeMaterials(THREE);
  const group = new THREE.Group();
  group.name = `Caño Amarillo elevated station${station.name ? ` · ${station.name}` : ''}`;
  group.userData.station = station;
  group.userData.architecture = 'elevated yellow tubular space-frame with two side platforms';
  group.userData.stationCenterZ = Z_CENTER;
  group.userData.platformLength = LENGTH;
  group.userData.elevated = true;

  const left = platform(THREE, cache, group, mats, -4.55, 'Caño Amarillo west side platform', -1.6);
  const right = platform(THREE, cache, group, mats, 8.55, 'Caño Amarillo east side platform', 5.6);
  // Track centers are x=0 and x=4. Rails stay at y=0 so the train and other
  // route assemblies can use the shared stopping datum without an offset.
  addBox(THREE, cache, group, 'elevated track bed', 2, -.28, Z_CENTER, 7.5, .55, LENGTH, mats.black);
  for (const [index, center] of RAIL_CENTERS.entries()) {
    addBox(THREE, cache, group, `Caño track ${index + 1} left rail`, center - .7175, .08, Z_CENTER, .13, .16, LENGTH, mats.steel);
    addBox(THREE, cache, group, `Caño track ${index + 1} right rail`, center + .7175, .08, Z_CENTER, .13, .16, LENGTH, mats.steel);
    addBox(THREE, cache, group, `Caño track ${index + 1} protected third rail`, center + 1.74, .32, Z_CENTER, .15, .18, LENGTH, mats.yellow);
  }
  const sleepers = [];
  for (let z = Z_MIN + 1.5; z < Z_MAX; z += 3.05) sleepers.push({ x: 2, y: -.08, z });
  addInstancedBoxes(THREE, cache, group, 'elevated station sleepers', 6.2, .14, .25, mats.concrete, sleepers);

  buildRearWalls(THREE, cache, group, mats);
  buildGuardrails(THREE, cache, group, mats);
  buildRoof(THREE, cache, group, mats);
  buildLights(THREE, cache, group, mats);
  buildSupportsAndPlaza(THREE, cache, group, mats);
  buildAccessLandmark(THREE, cache, group, mats);

  // Fixed fascia signs face inward from both rear walls. PlaneGeometry keeps
  // the lettering legible from either platform without adding a texture atlas.
  for (const [x, rotationY] of [[-7.34, Math.PI / 2], [11.34, -Math.PI / 2]]) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.8, .78), mats.signName);
    sign.name = 'Caño Amarillo station name fascia';
    sign.position.set(x, 4.78, Z_CENTER);
    sign.rotation.y = rotationY;
    sign.castShadow = false; sign.receiveShadow = false;
    group.add(sign);
  }

  const footprint = {
    minX: -13.2,
    maxX: 13.2,
    minZ: Z_MIN,
    maxZ: Z_MAX,
    minY: -3.45,
    maxY: 8.1,
    platform: 'side',
    elevated: true,
  };
  const result = {
    group,
    platformY: PLATFORM_TOP,
    railCenters: [...RAIL_CENTERS],
    footprint,
    update() {},
    dispose() {
      if (result._disposed) return;
      result._disposed = true;
      group.traverse((object) => {
        if (object.geometry) object.geometry.dispose?.();
        if (object.material && object.material.dispose) object.material.dispose();
      });
      cache.boxes.clear(); cache.cylinders.clear();
      mats.owned.forEach((item) => item.dispose?.());
    },
  };
  group.userData.stationAssembly = result;
  return result;
}

export default createCanoAmarilloStation;
