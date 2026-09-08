import { createCanoAmarilloStation } from './station-cano.js';
import { addAltamiraEntrance } from './station-altamira-entrance.js';

/*
 * Station assemblies for the Line 1 review scene.
 *
 * World coordinates are deliberately local to a stop: the train's stopping
 * datum is z=0, the consist occupies roughly z=-140..0, and a station group
 * is translated by the caller to the station's route distance.  X is across
 * the railway and Y is up from rail top.
 */

const kits = new WeakMap();

const STATION_LENGTH = 165;
const STATION_CENTER = -70;
const TRACK_GAUGE = 1.435;

function keyForNumber(n) {
  return Number(n).toFixed(3);
}

function getKit(THREE) {
  let kit = kits.get(THREE);
  if (kit) return kit;

  const geometries = new Map();
  const materials = new Map();
  const textures = [];
  const ownedTextures = new Set();

  const material = (name, color, options = {}) => {
    const key = `${name}:${new THREE.Color(color).getHexString()}:${options.roughness ?? .72}:${options.metalness ?? 0}`;
    if (!materials.has(key)) {
      const params = {
        color,
        roughness: options.roughness ?? .72,
        metalness: options.metalness ?? 0,
      };
      if (options.emissive !== undefined) {
        params.emissive = options.emissive;
        params.emissiveIntensity = options.emissiveIntensity || 0;
      }
      materials.set(key, new THREE.MeshStandardMaterial(params));
    }
    return materials.get(key);
  };

  const boxGeometry = (sx, sy, sz) => {
    const key = `box:${keyForNumber(sx)}:${keyForNumber(sy)}:${keyForNumber(sz)}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.BoxGeometry(sx, sy, sz));
    return geometries.get(key);
  };
  const cylinderGeometry = (r, h, radial = 12) => {
    const key = `cylinder:${keyForNumber(r)}:${keyForNumber(h)}:${radial}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(r, r, h, radial));
    return geometries.get(key);
  };
  const planeGeometry = (sx, sy) => {
    const key = `plane:${keyForNumber(sx)}:${keyForNumber(sy)}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.PlaneGeometry(sx, sy));
    return geometries.get(key);
  };
  const tileMaterial = (name, base, grout = 0x5c6062, repeatX = 10, repeatY = 4) => {
    if (typeof document === 'undefined') return material(name, base, { roughness: .88 });
    const key = `tile:${name}:${new THREE.Color(base).getHexString()}:${new THREE.Color(grout).getHexString()}`;
    if (materials.has(key)) return materials.get(key);
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `#${new THREE.Color(base).getHexString()}`;
    ctx.fillRect(0, 0, 96, 96);
    ctx.strokeStyle = `#${new THREE.Color(grout).getHexString()}`;
    ctx.lineWidth = 3;
    for (let p = 0; p <= 96; p += 24) {
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 96); ctx.moveTo(0, p); ctx.lineTo(96, p); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture); ownedTextures.add(texture);
    const out = new THREE.MeshStandardMaterial({ map: texture, roughness: .88 });
    materials.set(key, out);
    return out;
  };
  const signMaterial = (name, base, text = '') => {
    // The sign is a fixed mesh with a texture on its face. It never uses a
    // Sprite, so it remains attached to the station architecture in motion.
    if (typeof document === 'undefined') return material(`sign:${name}`, base, { roughness: .5 });
    const key = `sign:${name}:${base}:${text}`;
    if (materials.has(key)) return materials.get(key);
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `#${new THREE.Color(base).getHexString()}`; ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#161b1d'; ctx.lineWidth = 1; ctx.strokeRect(1, 1, 510, 126);
    ctx.fillStyle = '#fff6db'; ctx.font = 'bold 37px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), 256, 66);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture); ownedTextures.add(texture);
    const out = new THREE.MeshStandardMaterial({ map: texture, roughness: .5 });
    materials.set(key, out);
    return out;
  };
  const emissive = (name, color) => material(`glow:${name}`, color, { roughness: .4, emissive: color, emissiveIntensity: 1.8 });

  kit = {
    THREE, geometries, materials, textures, ownedTextures, material, boxGeometry,
    cylinderGeometry, planeGeometry, tileMaterial, signMaterial, emissive,
    dispose() {
      geometries.forEach((geometry) => geometry.dispose?.());
      materials.forEach((mat) => mat.dispose?.());
      textures.forEach((texture) => texture.dispose?.());
      geometries.clear(); materials.clear(); textures.length = 0;
    },
  };
  kits.set(THREE, kit);
  return kit;
}

function addMesh(kit, parent, geometry, material, name, x = 0, y = 0, z = 0) {
  const mesh = new kit.THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addBox(kit, parent, name, x, y, z, sx, sy, sz, material) {
  return addMesh(kit, parent, kit.boxGeometry(sx, sy, sz), material, name, x, y, z);
}

function addSlabWithHoles(kit, parent, name, x, y, z, sx, sy, sz, material, holes = []) {
  const xMin = x - sx / 2; const xMax = x + sx / 2;
  const zMin = z - sz / 2; const zMax = z + sz / 2;
  const xs = [...new Set([xMin, xMax, ...holes.flatMap((hole) => [Math.max(xMin, hole.x - hole.sx / 2), Math.min(xMax, hole.x + hole.sx / 2)])])].sort((a, b) => a - b);
  const zs = [...new Set([zMin, zMax, ...holes.flatMap((hole) => [Math.max(zMin, hole.z - hole.sz / 2), Math.min(zMax, hole.z + hole.sz / 2)])])].sort((a, b) => a - b);
  for (let xi = 0; xi < xs.length - 1; xi++) for (let zi = 0; zi < zs.length - 1; zi++) {
    const cx = (xs[xi] + xs[xi + 1]) / 2; const cz = (zs[zi] + zs[zi + 1]) / 2;
    if (holes.some((hole) => Math.abs(cx - hole.x) < hole.sx / 2 && Math.abs(cz - hole.z) < hole.sz / 2)) continue;
    addBox(kit, parent, name, cx, y, cz, xs[xi + 1] - xs[xi], sy, zs[zi + 1] - zs[zi], material);
  }
}

function addCylinder(kit, parent, name, x, y, z, radius, height, material, radial = 12) {
  return addMesh(kit, parent, kit.cylinderGeometry(radius, height, radial), material, name, x, y, z);
}

function beamBetween(kit, parent, name, a, b, radius, material) {
  const THREE = kit.THREE;
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start);
  const mesh = addMesh(kit, parent, kit.cylinderGeometry(radius, delta.length(), 8), material, name);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}

function instancedBoxes(kit, parent, name, sx, sy, sz, material, transforms) {
  const THREE = kit.THREE;
  const mesh = new THREE.InstancedMesh(kit.boxGeometry(sx, sy, sz), material, transforms.length);
  mesh.name = name;
  const matrix = new THREE.Matrix4();
  transforms.forEach((item, index) => {
    matrix.compose(new THREE.Vector3(item.x || 0, item.y || 0, item.z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(item.rx || 0, item.ry || 0, item.rz || 0)), item.scale || new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function stationName(station) {
  return String(station?.name || '').trim();
}

function styleFor(name) {
  if (/caño|cano/i.test(name)) return {
    id: 'cano', accent: 0xb8452f, tile: 0x98664d, grout: 0x5d4034, concrete: 0x777b78, steel: 0x788a8d,
  };
  if (/capitolio/i.test(name)) return {
    id: 'capitolio', accent: 0xa46d25, tile: 0xb4a56d, grout: 0x6e6343, concrete: 0x8a8d86, steel: 0x64787c,
  };
  if (/bellas/i.test(name)) return {
    id: 'bellas', accent: 0xc25b32, tile: 0x2e6f88, grout: 0x183f4f, concrete: 0x8d8c82, steel: 0x6e7776,
  };
  if (/plaza venezuela/i.test(name)) return {
    id: 'plaza-venezuela', accent: 0x75644f, tile: 0x857760, grout: 0x514a3e, concrete: 0x8f9189, steel: 0x687a7d,
  };
  if (/altamira/i.test(name)) return {
    id: 'altamira', accent: 0x9b4e2d, tile: 0x9b6a50, grout: 0x593b30, concrete: 0x9a9b94, steel: 0x73817d,
  };
  return { id: 'generic', accent: 0x2d6e8a, tile: 0x788387, grout: 0x4e5558, concrete: 0x828a8a, steel: 0x6a757a };
}

function commonMaterials(kit, style) {
  return {
    platform: kit.tileMaterial(`${style.id}-platform`, 0x505555, 0x2a2f30, 14, 413),
    edge: kit.material(`${style.id}-edge`, 0xf0c624, { roughness: .55 }),
    accent: kit.material(`${style.id}-accent`, style.accent, { roughness: .45, metalness: .1 }),
    tile: kit.tileMaterial(`${style.id}-walls`, style.tile, style.grout, 13, 3),
    tileDark: kit.material(`${style.id}-tile-dark`, style.grout, { roughness: .86 }),
    concrete: kit.material(`${style.id}-concrete`, style.concrete, { roughness: .86 }),
    steel: kit.material(`${style.id}-steel`, style.steel, { roughness: .34, metalness: .72 }),
    black: kit.material(`${style.id}-black`, 0x161b1d, { roughness: .78 }),
    glass: kit.material(`${style.id}-glass`, 0x4b7e8e, { roughness: .12, metalness: .15 }),
    light: kit.emissive(`${style.id}-light`, 0xffe8ac),
    blueLight: kit.emissive(`${style.id}-blue-light`, 0x9cc9d5),
    red: kit.material(`${style.id}-red`, 0xb82727, { roughness: .5 }),
    green: kit.material(`${style.id}-green`, 0x3d6d52, { roughness: .6 }),
  };
}

function addTrackPair(kit, group, mats, railCenters, z0 = -152.5, z1 = 12.5) {
  const THREE = kit.THREE;
  const length = z1 - z0;
  const center = (z0 + z1) / 2;
  addBox(kit, group, 'station track bed', 5, -.48, center, 16, .58, length, mats.black);
  railCenters.forEach((cx, trackIndex) => {
    [-TRACK_GAUGE / 2, TRACK_GAUGE / 2].forEach((offset) => addBox(kit, group, `track ${trackIndex + 1} rail`, cx + offset, .09, center, .105, .16, length, mats.steel));
    addBox(kit, group, `track ${trackIndex + 1} third rail`, cx + 1.75, .32, center, .14, .18, length, mats.edge);
  });
  const ties = [];
  for (let z = z0 + 1; z < z1; z += 3.05) ties.push({ x: 5, y: -.12, z });
  instancedBoxes(kit, group, 'station sleepers', 15, .12, .24, mats.concrete, ties);
}

function addPlatform(kit, group, mats, x, width, name = 'platform', zCenter = STATION_CENTER) {
  addBox(kit, group, name, x, .5, zCenter, width, 1.0, STATION_LENGTH, mats.platform);
  const inner = x < 0 ? x + width / 2 : x - width / 2;
  const edgeX = inner;
  addBox(kit, group, `${name} tactile edge`, edgeX, 1.05, zCenter, .16, .1, STATION_LENGTH, mats.edge);
  const island = x > 0 && width >= 6.5;
  if (island) addBox(kit, group, `${name} outer tactile edge`, x + width / 2, 1.05, zCenter, .16, .1, STATION_LENGTH, mats.edge);
  for (let z = zCenter - 75; z <= zCenter + 75; z += 12) addBox(kit, group, `${name} floor joint`, x, 1.02, z, width, .025, .035, mats.tileDark);
  let boardingIndex = 0;
  for (let z = zCenter - 72; z <= zCenter + 72; z += 24, boardingIndex++) {
    const boardingX = island ? (boardingIndex % 2 === 0 ? x - width / 2 + .7 : x + width / 2 - .7) : (x < 0 ? inner - .72 : inner + .72);
    addBox(kit, group, `${name} boarding position`, boardingX, 1.065, z, 1.0, .035, 2.8, mats.edge);
  }
  return { inner, outer: x < 0 ? x - width / 2 : x + width / 2 };
}

function addWall(kit, group, mats, x, zCenter = STATION_CENTER, height = 5.1) {
  addBox(kit, group, 'warm ceramic wall', x, height / 2 + 1.01, zCenter, .18, height, STATION_LENGTH, mats.tile);
  for (let z = zCenter - 74; z <= zCenter + 74; z += 12) addBox(kit, group, 'wall panel joint', x + (x > 0 ? -.1 : .1), height / 2 + 1.01, z, .03, height - .35, .025, mats.tileDark);
}

function addFixedSign(kit, group, mats, name, x, y, z, face = 0, scale = 1, baseColor = null) {
  const THREE = kit.THREE;
  const panelColor = baseColor ?? mats.black.color?.getHex?.() ?? 0x181b1e;
  const panel = addMesh(kit, group, kit.boxGeometry(3.6 * scale, .78 * scale, .12), kit.signMaterial(name, panelColor, name), `fixed station sign ${name}`, x, y, z);
  panel.rotation.y = face;
  panel.userData.fixedMeshSign = true;
  panel.userData.text = name;
  const postOffset = 1.35 * scale;
  const postY = y - .62 * scale;
  for (const offset of [-postOffset, postOffset]) {
    const px = x + Math.cos(face) * offset;
    const pz = z - Math.sin(face) * offset;
    addCylinder(kit, group, 'fixed station sign support post', px, postY, pz, .035, 1.05 * scale, mats.steel, 8);
  }
  return panel;
}

function addBench(kit, group, mats, x, z, rotation = 0) {
  const bench = new kit.THREE.Group(); bench.name = 'fixed platform bench'; bench.position.set(x, 1.0, z); bench.rotation.y = rotation; group.add(bench);
  addBox(kit, bench, 'bench seat', 0, .45, 0, 2.6, .16, .45, mats.steel);
  addBox(kit, bench, 'bench back', 0, .95, .18, 2.6, .9, .11, mats.steel);
  [-.95, .95].forEach((lx) => addBox(kit, bench, 'bench leg', lx, .2, 0, .13, .4, .13, mats.black));
  return bench;
}

function addBin(kit, group, mats, x, z) {
  addCylinder(kit, group, 'platform litter bin', x, 1.31, z, .24, .62, mats.black, 12);
  addBox(kit, group, 'bin red lid', x, 1.65, z, .42, .08, .42, mats.red);
}

function addRailing(kit, group, mats, points, name = 'handrail') {
  for (let i = 0; i < points.length - 1; i++) beamBetween(kit, group, name, points[i], points[i + 1], .055, mats.steel);
  points.forEach((p) => addCylinder(kit, group, `${name} post`, p[0], p[1] - .38, p[2], .04, .76, mats.steel, 8));
}

function addStairs(kit, group, mats, side, z, options = {}) {
  const count = options.count || 12;
  const width = options.width || 2.7;
  const run = options.run || .42;
  const x = options.x ?? (side < 0 ? -4.7 : 8.3);
  const direction = options.direction ?? 1;
  const zStart = options.zStart ?? (z - count * run / 2);
  const topY = options.topY ?? (1.0 + count * .28);
  const rise = options.rise ?? ((topY - 1.0) / count);
  const stair = new kit.THREE.Group(); stair.name = `${options.name || 'platform stairs'} ${side < 0 ? 'left' : 'right'}`; group.add(stair);
  for (let i = 0; i < count; i++) {
    const stepZ = zStart + direction * (i + .5) * run;
    const y = 1.0 + (i + 1) * rise / 2;
    addBox(kit, stair, 'stair riser', x, y, stepZ, width, (i + 1) * rise, run, mats.concrete);
  }
  const endZ = zStart + direction * count * run;
  const landingY = topY - .09;
  addBox(kit, stair, 'stair upper landing', x, landingY, endZ + direction * 1.1, width, .18, 2.2, mats.concrete);
  const z0 = zStart - direction * .2;
  const z1 = endZ + direction * .6;
  addRailing(kit, stair, mats, [[x - width / 2, 1.65, z0], [x - width / 2, topY + 1.0, z1]], 'stair handrail');
  addRailing(kit, stair, mats, [[x + width / 2, 1.65, z0], [x + width / 2, topY + 1.0, z1]], 'stair handrail');
  return stair;
}

function addStandardLighting(kit, group, mats, xs, zStart = -144, zEnd = 4, y = 5.55, spacing = 12) {
  const transforms = [];
  xs.forEach((x) => { for (let z = zStart; z <= zEnd; z += spacing) transforms.push({ x, y, z }); });
  return instancedBoxes(kit, group, 'recessed linear station lighting', .12, .08, 4.3, mats.light, transforms);
}

function addPlatformFurniture(kit, group, mats, platforms) {
  const left = platforms.left || platforms.island;
  const right = platforms.right;
  if (left) { addBench(kit, group, mats, left.outer + (left.inner - left.outer) * .5, -106); addBench(kit, group, mats, left.outer + (left.inner - left.outer) * .5, -37, Math.PI); addBin(kit, group, mats, left.outer + .7, -86); }
  if (right) { addBench(kit, group, mats, right.outer - (right.outer - right.inner) * .5, -112, Math.PI); addBench(kit, group, mats, right.outer - (right.outer - right.inner) * .5, -44); addBin(kit, group, mats, right.outer - .7, -79); }
}

function buildCapitolio(kit, group, mats, station) {
  const left = addPlatform(kit, group, mats, -4.3, 5.4, 'Capitolio west platform');
  const right = addPlatform(kit, group, mats, 8.3, 5.4, 'Capitolio east platform');
  addWall(kit, group, mats, -7.5); addWall(kit, group, mats, 10.9);
  const mz = -120;
  const slats = [];
  for (let z = -146; z <= 6; z += .26) if (z < mz - 7 || z > mz + 4) slats.push({ x: 1.7, y: 6.05, z });
  instancedBoxes(kit, group, 'Capitolio dark slatted ceiling', 16.2, .12, .2, mats.black, slats);
  const panels = [];
  for (const x of [-4.3, 8.3]) for (let z = -138; z <= -4; z += 13) panels.push({ x, y: 5.94, z });
  instancedBoxes(kit, group, 'Capitolio rectangular fluorescent panels', 2.4, .08, .45, mats.light, panels);
  // The mezzanine is concentrated toward one end, as observed at Capitolio.
  addSlabWithHoles(kit, group, 'Capitolio end mezzanine slab', 1.7, 5.35, mz, 16.0, .28, 19, mats.concrete, [
    { x: -4.3, z: mz - 2.1, sx: 3.4, sz: 10.0 }, { x: 8.3, z: mz - 2.1, sx: 3.4, sz: 10.0 },
  ]);
  addBox(kit, group, 'Capitolio mezzanine fascia', 1.7, 4.72, mz - 9.3, 16.0, 1.0, .25, mats.accent);
  addBox(kit, group, 'Capitolio mezzanine fascia', 1.7, 4.72, mz + 9.3, 16.0, 1.0, .25, mats.accent);
  const beam = addCylinder(kit, group, 'Capitolio broad chamfered concrete beam', 1.7, 6.25, mz - 3.5, .72, 16.6, mats.concrete, 8);
  beam.rotation.z = Math.PI / 2;
  addBox(kit, group, 'Capitolio broad beam haunch west', -5.9, 5.85, mz - 3.5, 1.35, 1.1, 2.3, mats.concrete);
  addBox(kit, group, 'Capitolio broad beam haunch east', 9.3, 5.85, mz - 3.5, 1.35, 1.1, 2.3, mats.concrete);
  addBox(kit, group, 'Capitolio wide concrete pier', -2.3, 3.15, mz - 3.5, 1.8, 4.3, 1.8, mats.concrete);
  addBox(kit, group, 'Capitolio white vertical tile insert', -2.3, 3.15, mz - 2.55, 1.18, 3.25, .06, kit.tileMaterial('Capitolio white vertical tile', 0xe0ddd0, 0xb9b7ac, 1, 7));
  addStairs(kit, group, mats, -1, mz, { name: 'mezzanine stair', x: -4.3, zStart: mz - 5.2, count: 13, topY: 5.49 });
  addStairs(kit, group, mats, 1, mz, { name: 'mezzanine stair', x: 8.3, zStart: mz - 5.2, count: 13, topY: 5.49 });
  addFixedSign(kit, group, mats, stationName(station), -4.45, 4.35, -73, 0, .95);
  addFixedSign(kit, group, mats, stationName(station), 7.95, 4.35, -73, Math.PI, .95);
  addFixedSign(kit, group, mats, 'CONEXIÓN EL SILENCIO', 1.7, 5.75, mz, 0, .65);
  addFixedSign(kit, group, mats, 'SALIDA', 1.7, 4.85, mz + 10.1, 0, .58, 0x181b1e);
  const columns = [];
  for (let z = -140; z <= 0; z += 20) [-6.9, 10.25].forEach((x) => columns.push({ x, y: 3.2, z }));
  instancedBoxes(kit, group, 'Capitolio concrete wall piers', .4, 5.0, .55, mats.concrete, columns);
  addStandardLighting(kit, group, mats, [-4.7, 8.2], -142, 1, 5.75, 13);
  addPlatformFurniture(kit, group, mats, { left, right });
}

function buildBellasArtes(kit, group, mats, station) {
  const island = addPlatform(kit, group, mats, 5.0, 6.8, 'Bellas Artes central island platform');
  addWall(kit, group, mats, -3.0, STATION_CENTER, 5.4); addWall(kit, group, mats, 13.0, STATION_CENTER, 5.4);
  // Bellas Artes has the island-platform family: close black slats sit low
  // over the platform and broad fluorescent panels repeat down both sides.
  const slats = [];
  for (let z = -146; z <= 6; z += .26) if (z < -78 || z > -62) slats.push({ x: 5.0, y: 4.25, z });
  instancedBoxes(kit, group, 'Bellas Artes low slatted ceiling', 6.7, .11, .2, mats.black, slats);
  const fluorescents = [];
  for (const x of [2.45, 7.55]) for (let z = -140; z <= 0; z += 12) fluorescents.push({ x, y: 4.18, z });
  instancedBoxes(kit, group, 'Bellas Artes rectangular fluorescent panels', 1.9, .08, .42, mats.light, fluorescents);
  for (let z = -140; z <= 0; z += 28) {
    addBox(kit, group, 'gallery mural panel west', -2.86, 3.0, z, .08, 3.0, 10.5, mats.accent);
    addBox(kit, group, 'gallery mural panel east', 12.86, 3.0, z, .08, 3.0, 10.5, mats.accent);
    addBox(kit, group, 'mural inset west', -2.80, 3.0, z, .05, 2.35, 7.8, mats.tile);
    addBox(kit, group, 'mural inset east', 12.80, 3.0, z, .05, 2.35, 7.8, mats.tile);
  }
  addFixedSign(kit, group, mats, stationName(station), 5.0, 3.55, -121, 0, 1);
  addFixedSign(kit, group, mats, stationName(station), 5.0, 3.55, -19, Math.PI, 1);
  // Poster frames and low furniture echo the arts district without using
  // floating graphics.
  for (const z of [-126, -88, -50, -12]) {
    addBox(kit, group, 'fixed exhibition poster frame west', -2.71, 2.45, z, .08, 1.65, 1.2, mats.black);
    addBox(kit, group, 'exhibition poster west', -2.65, 2.45, z, .04, 1.35, .9, mats.red);
    addBox(kit, group, 'fixed exhibition poster frame east', 12.71, 2.45, z, .08, 1.65, 1.2, mats.black);
    addBox(kit, group, 'exhibition poster east', 12.65, 2.45, z, .04, 1.35, .9, mats.red);
  }
  // The central escalator/stair block occupies the island and is the main
  // visual anchor when a train is alongside the platform.
  addBox(kit, group, 'Bellas Artes central stair cheek west', 3.05, 2.05, -70, .5, 2.1, 8.0, mats.black);
  addBox(kit, group, 'Bellas Artes central stair cheek east', 6.95, 2.05, -70, .5, 2.1, 8.0, mats.black);
  addBox(kit, group, 'Bellas Artes central upper landing', 5.0, 3.51, -70, 3.4, .18, 2.0, mats.black);
  addBox(kit, group, 'Bellas Artes SALIDA fascia', 5.0, 4.02, -70, 4.7, .32, .55, mats.accent);
  addFixedSign(kit, group, mats, 'SALIDA', 5.0, 4.05, -70, 0, .62, 0x17191b);
  addStairs(kit, group, mats, -1, -70, { name: 'central island stair', x: 5.0, zStart: -75.2, count: 10, width: 2.1, topY: 3.6 });
  addStairs(kit, group, mats, 1, -70, { name: 'central island stair', x: 5.0, zStart: -64.8, count: 10, direction: -1, width: 2.1, topY: 3.6 });
  addStandardLighting(kit, group, mats, [2.35, 7.65], -142, 2, 4.15, 12);
  addPlatformFurniture(kit, group, mats, { island });
  // Low street portal above the underground volume, with the horizontal
  // ventilation grille visible from the exterior camera.
  addBox(kit, group, 'Bellas Artes street portal lintel', 5.0, 7.15, -70, 10.0, .55, 2.2, mats.concrete);
  addBox(kit, group, 'Bellas Artes street portal left pier', .25, 6.0, -70, .65, 2.7, 2.2, mats.concrete);
  addBox(kit, group, 'Bellas Artes street portal right pier', 9.75, 6.0, -70, .65, 2.7, 2.2, mats.concrete);
  for (let x = 1.2; x < 9.2; x += .52) addBox(kit, group, 'Bellas Artes portal ventilation slat', x, 6.45, -68.82, .18, .82, .06, mats.black);
  addFixedSign(kit, group, mats, stationName(station), 5.0, 7.0, -68.8, 0, .78);
}

function buildPlazaVenezuela(kit, group, mats, station) {
  const left = addPlatform(kit, group, mats, -4.35, 5.5, 'Plaza Venezuela west platform');
  const right = addPlatform(kit, group, mats, 8.35, 5.5, 'Plaza Venezuela east platform');
  addWall(kit, group, mats, -7.65, STATION_CENTER, 5.8); addWall(kit, group, mats, 11.1, STATION_CENTER, 5.8);
  const mz = -72;
  const slats = [];
  for (let z = -146; z <= 6; z += .26) if (z < mz - 8 || z > mz + 3) slats.push({ x: 1.72, y: 6.3, z });
  instancedBoxes(kit, group, 'Plaza Venezuela dark transfer ceiling', 17.1, .12, .18, mats.black, slats);
  const panels = [];
  for (const x of [-4.9, 8.35]) for (let z = -138; z <= -4; z += 12) panels.push({ x, y: 6.18, z });
  instancedBoxes(kit, group, 'Plaza Venezuela fluorescent panels', 2.8, .08, .43, mats.light, panels);
  // Transfer station: a broad central transfer bridge is held by paired
  // structural piers and includes the long, visible connection route.
  addSlabWithHoles(kit, group, 'Plaza Venezuela interchange mezzanine', 1.72, 5.55, mz, 17.4, .3, 17, mats.concrete, [
    { x: -4.35, z: mz - 1.8, sx: 3.9, sz: 10.0 }, { x: 8.35, z: mz - 1.8, sx: 3.9, sz: 10.0 },
  ]);
  const galleryColumn = kit.material('Plaza Venezuela warm beige gallery columns', 0xb19e7b, { roughness: .82 });
  for (const x of [-6.8, 10.25]) for (let zz = mz - 7; zz <= mz + 7; zz += 4.6) addCylinder(kit, group, 'Plaza Venezuela beige gallery column', x, 3.15, zz, .42, 5.7, galleryColumn, 16);
  addStairs(kit, group, mats, -1, mz, { name: 'transfer stair', x: -4.35, zStart: mz - 5.5, count: 14, topY: 5.7, width: 3.2 });
  addStairs(kit, group, mats, 1, mz, { name: 'transfer stair', x: 8.35, zStart: mz - 5.5, count: 14, topY: 5.7, width: 3.2 });
  addFixedSign(kit, group, mats, stationName(station), -4.5, 4.4, -112, 0, 1);
  addFixedSign(kit, group, mats, stationName(station), 7.98, 4.4, -112, Math.PI, 1);
  addFixedSign(kit, group, mats, 'LÍNEAS 3 / 4', 1.72, 5.9, mz, 0, .78);
  addFixedSign(kit, group, mats, 'TRANSFERENCIA', 1.72, 5.05, mz + 9.2, 0, .58, 0x17191b);
  const columns = [];
  for (let z = -140; z <= 0; z += 16) [-6.9, 10.35].forEach((x) => columns.push({ x, y: 3.2, z }));
  instancedBoxes(kit, group, 'transfer station columns', .46, 5.0, .65, mats.concrete, columns);
  addBox(kit, group, 'transfer direction floor band west', -4.35, .8, -72, .14, .07, 17, mats.accent);
  addBox(kit, group, 'transfer direction floor band east', 7.8, .8, -72, .14, .07, 17, mats.accent);
  addStandardLighting(kit, group, mats, [-4.55, 8.0], -142, 2, 6.2, 11);
  addPlatformFurniture(kit, group, mats, { left, right });
}

function buildAltamira(kit, group, mats, station) {
  // Altamira is the exception to the side-platform pattern: the paired rails
  // flank a 6.7m central island (edges x=1.65 and x=8.35).
  const island = addPlatform(kit, group, mats, 5.0, 6.8, 'Altamira central island platform');
  addWall(kit, group, mats, -3.0, STATION_CENTER, 4.2); addWall(kit, group, mats, 13.0, STATION_CENTER, 4.2);
  const z = -86;
  // Floating mezzanine tray approximately four metres over the platform;
  // open voids remain visible on both sides of the tray.
  addSlabWithHoles(kit, group, 'Altamira floating mezzanine tray', 5.0, 4.75, z, 15.4, .28, 15.5, mats.concrete, [
    { x: 5.0, z: z - 2.1, sx: 3.0, sz: 10.0 }, { x: 5.0, z: z + 2.1, sx: 3.0, sz: 10.0 },
  ]);
  addBox(kit, group, 'Altamira mezzanine north fascia', 5.0, 4.15, z - 8.4, 15.4, 1.0, .25, mats.accent);
  addBox(kit, group, 'Altamira mezzanine south fascia', 5.0, 4.15, z + 8.4, 15.4, 1.0, .25, mats.accent);
  addStairs(kit, group, mats, -1, z, { name: 'Altamira north stair', x: 5.0, zStart: z - 5.2, count: 12, width: 2.4, topY: 4.89 });
  addStairs(kit, group, mats, 1, z, { name: 'Altamira south stair', x: 5.0, zStart: z + 5.2, count: 12, direction: -1, width: 2.4, topY: 4.89 });
  // Exposed RC macrostructure rises to the street level, with two long voids
  // between beams instead of a generic opaque underground ceiling.
  const beams = [];
  for (let zz = -140; zz <= 0; zz += 20) if (zz < -82 || zz > -58) beams.push({ x: 5, y: 8.2, z: zz });
  instancedBoxes(kit, group, 'Altamira exposed RC transverse beams', 20.4, .48, .55, mats.concrete, beams);
  [-2.6, 12.6].forEach((x) => {
    for (let zz = -140; zz <= 0; zz += 20) addBox(kit, group, 'Altamira macrostructure column', x, 4.35, zz, .7, 8.0, .7, mats.concrete);
  });
  const slats = [];
  for (let zz = -146; zz <= 6; zz += .26) if (zz < -82 || zz > -58) slats.push({ x: 5, y: 7.4, z: zz });
  instancedBoxes(kit, group, 'Altamira dark slatted ceiling', 19.2, .11, .18, mats.black, slats);
  const panels = [];
  for (const x of [2.35, 7.65]) for (let zz = -138; zz <= -4; zz += 12) if (zz < -82 || zz > -58) panels.push({ x, y: 7.3, z: zz });
  instancedBoxes(kit, group, 'Altamira rectangular fluorescent panels', 2.5, .08, .42, mats.light, panels);
  addFixedSign(kit, group, mats, stationName(station), 5.0, 2.55, -42, 0, 1);
  addFixedSign(kit, group, mats, stationName(station), 5.0, 2.55, -117, Math.PI, 1);
  addFixedSign(kit, group, mats, 'PLAZA FRANCISCO DE MIRANDA', 5.0, 5.3, z, 0, .68);
  addFixedSign(kit, group, mats, 'PALO VERDE', 5.0, 3.6, -58, 0, .62, 0x181b1e);
  addFixedSign(kit, group, mats, 'PROPATRIA', 5.0, 3.6, -102, Math.PI, .62, 0x181b1e);
  addFixedSign(kit, group, mats, 'SALIDA', 5.0, 3.6, z + 9.1, 0, .58, 0x16783b);
  addAltamiraEntrance(kit.THREE, group);
  addStandardLighting(kit, group, mats, [3.0, 7.0], -137, -3, 7.25, 13);
  addPlatformFurniture(kit, group, mats, { island });
}

function addPlatformAssembly(kit, group, mats, station) {
  const name = stationName(station);
  if (/capitolio/i.test(name)) return buildCapitolio(kit, group, mats, station);
  if (/bellas/i.test(name)) return buildBellasArtes(kit, group, mats, station);
  if (/plaza venezuela/i.test(name)) return buildPlazaVenezuela(kit, group, mats, station);
  if (/altamira/i.test(name)) return buildAltamira(kit, group, mats, station);
  const left = addPlatform(kit, group, mats, -4.75, 5.5, `${name || 'station'} west platform`);
  const right = addPlatform(kit, group, mats, 8.15, 5.5, `${name || 'station'} east platform`);
  addWall(kit, group, mats, -7.5); addWall(kit, group, mats, 10.9);
  addStandardLighting(kit, group, mats, [-4.5, 8], -142, 2, 5.6, 14);
  addFixedSign(kit, group, mats, name || 'ESTACIÓN', -4.45, 4.3, STATION_CENTER, 0);
  addFixedSign(kit, group, mats, name || 'ESTACIÓN', 7.95, 4.3, STATION_CENTER, Math.PI);
  addPlatformFurniture(kit, group, mats, { left, right });
}

/**
 * Create one physically assembled station.
 *
 * `station` may include `distance`; the returned group remains local so the
 * caller can position it at that route distance.  Altamira returns a 10m
 * track spacing and central island platform; the other selected stations use
 * 4m track spacing and side platforms.
 */
export function createStation(THREE, station = {}) {
  if (!THREE) throw new Error('createStation requires the injected THREE namespace');
  if (/caño|cano/i.test(stationName(station))) return createCanoAmarilloStation(THREE, station);
  const kit = getKit(THREE);
  const style = styleFor(stationName(station));
  const mats = commonMaterials(kit, style);
  const group = new THREE.Group();
  group.name = `Detailed station ${stationName(station) || 'Line 1'}`;
  group.userData.station = station;
  group.userData.stationCenterZ = STATION_CENTER;
  group.userData.platformLength = STATION_LENGTH;
  group.userData.architecture = style.id;

  const altamira = style.id === 'altamira';
  const islandPlatform = altamira || style.id === 'bellas';
  const railCenters = islandPlatform ? [0, 10] : [0, 4];
  addTrackPair(kit, group, mats, railCenters);
  addPlatformAssembly(kit, group, mats, station);

  // Expose dimensions so world integration and camera tests can reason about
  // the station without walking the scene graph.
  const footprint = islandPlatform
    ? { minX: -3.8, maxX: 13.8, minZ: -152.5, maxZ: 12.5, minY: -.8, maxY: 9.2, platform: 'island' }
    : { minX: -7.8, maxX: 11.2, minZ: -152.5, maxZ: 12.5, minY: -.8, maxY: style.id === 'cano' ? 8.5 : 7.4, platform: 'side' };
  const result = {
    group,
    platformY: 1.0,
    railCenters,
    footprint,
    update() {},
    dispose() {},
  };
  group.userData.stationAssembly = result;
  return result;
}

export default createStation;
