import createTrain from './train.js';
import { createStation } from './stations.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* Scene geometry is injected with THREE. Station assemblies are local to the
 * train stop datum (train nose z=0, consist extends toward -z). */
export function createWorld(THREE, container, stations = []) {
  const pmrem = container ? new THREE.PMREMGenerator(container) : null;
  const studio = pmrem ? new RoomEnvironment(THREE) : null;
  const studioTarget = pmrem && studio ? pmrem.fromScene(studio, 0.04) : null;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07121f);
  scene.fog = new THREE.Fog(0x07121f, 90, 650);
  scene.environmentIntensity = .7;
  if (studioTarget) scene.environment = studioTarget.texture;
  const root = new THREE.Group(); root.name = 'Caracas Metro L1 World'; scene.add(root);
  const ambient = new THREE.HemisphereLight(0x98cfff, 0x111722, 1.25); scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xe7eef2, 2.15);
  sun.position.set(-32, 44, 55); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun);
  const trainFill = new THREE.HemisphereLight(0xffe3b5, 0x27333a, .42);
  trainFill.name = 'warm train readability fill'; scene.add(trainFill);

  const mats = {};
  const mat = (name, color, rough = .65, metal = 0) => mats[name] ||= new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const glow = (name, color) => mats[name] ||= new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const M = {
    ballast: mat('ballast', 0x202831), concrete: mat('concrete', 0x5c6871),
    dark: mat('tunnel', 0x111923), steel: mat('steel', 0xadb9bd, .28, .8),
    yellow: mat('safety-yellow', 0xffc928, .5), roof: mat('roof', 0x293a45),
    skin: mat('skin', 0xc58361), shirt: mat('shirt', 0xe1e8eb),
    pants: mat('pants', 0x293f60), shoe: mat('shoe', 0x161b20),
    red: mat('metro-red', 0xd9272e, .34, .25), black: mat('rubber', 0x101317),
  };
  const disposable = [];
  const track = new THREE.Group(); track.name = 'Track and tunnel'; root.add(track);
  const stationRoot = new THREE.Group(); stationRoot.name = 'All Line 1 stations'; root.add(stationRoot);
  const detailedTrain = createTrain(THREE);
  detailedTrain.group.getObjectByName('front CAF driving nose')?.userData.setDestination?.('ALTAMIRA');
  detailedTrain.group.getObjectByName('rear CAF driving nose')?.userData.setDestination?.('ALTAMIRA');
  root.add(detailedTrain.group);
  const train = detailedTrain.group;
  const animated = [];
  let elapsed = 0;
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const mesh = (geometry, material, name, parent = root) => {
    const object = new THREE.Mesh(geometry, material);
    object.name = name || ''; object.castShadow = true; object.receiveShadow = true;
    parent.add(object); if (geometry !== unitBox) disposable.push(geometry); return object;
  };
  const box = (name, x, y, z, sx, sy, sz, material, parent = root) => {
    const object = mesh(unitBox, material, name, parent);
    object.position.set(x, y, z); object.scale.set(sx, sy, sz); return object;
  };
  const boxAlong = (name, x0, z0, x1, z1, width, height, material, parent = track, y = .08) => {
    const dx = x1 - x0, dz = z1 - z0, length = Math.hypot(dx, dz);
    if (length < .01) return;
    const object = box(name, (x0 + x1) / 2, y, (z0 + z1) / 2, width, height, length, material, parent);
    object.rotation.y = Math.atan2(dx, dz); return object;
  };
  const end = Math.max(2600, ...(stations.map(s => Number(s.distance) || 0))) + 300;
  const assemblies = stations.map((station, index) => {
    const assembly = createStation(THREE, station);
    assembly.group.name = assembly.group.name || ('Station ' + (index + 1) + ' ' + (station.name || ''));
    assembly.group.position.z = Number(station.distance) || index * 600;
    stationRoot.add(assembly.group); return assembly;
  });
  const footprints = assemblies.map((assembly, index) => {
    const f = assembly.footprint || {};
    const distance = Number(stations[index].distance) || index * 600;
    return { min: distance + Number(f.minZ ?? -152.5), max: distance + Number(f.maxZ ?? 12.5) };
  });
  const intervals = [];
  let intervalStart = -300;
  let intervalX = Number(stations[0]?.railCenters?.[1]) || 4;
  footprints.forEach((f, index) => {
    if (f.min > intervalStart) {
      const nextX = Number(stations[index]?.railCenters?.[1]) || intervalX;
      intervals.push({ start: intervalStart, finish: f.min, x0: intervalX, x1: nextX });
    }
    intervalStart = f.max;
    intervalX = Number(stations[index]?.railCenters?.[1]) || intervalX;
  });
  intervals.push({ start: intervalStart, finish: end + 300, x0: intervalX, x1: intervalX });

  const pathCenter = (path, z) => {
    const t = Math.max(0, Math.min(1, (z - path.start) / Math.max(1, path.finish - path.start)));
    const smooth = t * t * (3 - 2 * t);
    return path.x0 + (path.x1 - path.x0) * smooth;
  };
  intervals.forEach(path => {
    const left = -3;
    const right = Math.max(path.x0, path.x1) + 3;
    const center = (left + right) / 2;
    const width = right - left;
    box('track bed segment', center, -.48, (path.start + path.finish) / 2, width, .65, path.finish - path.start, M.ballast, track);
  });
  const addTrackPath = (center, start, finish, name) => {
    const count = Math.max(1, Math.ceil((finish - start) / 18));
    for (let i = 0; i < count; i++) {
      const z0 = start + (finish - start) * i / count, z1 = start + (finish - start) * (i + 1) / count;
      const x0 = typeof center === 'function' ? center(z0) : center, x1 = typeof center === 'function' ? center(z1) : center;
      [-.7175, .7175].forEach(offset => boxAlong(name + ' rail foundation', x0 + offset, z0, x1 + offset, z1, .18, .2, M.concrete, track, -.08));
      [-.7175, .7175].forEach(offset => boxAlong(name + ' steel rail', x0 + offset, z0, x1 + offset, z1, .13, .15, M.steel, track, .08));
      boxAlong(name + ' protected third rail', x0 + 1.74, z0, x1 + 1.74, z1, .16, .18, M.yellow, track, .35);
    }
  };
  intervals.forEach(path => {
    addTrackPath(0, path.start, path.finish, 'driving');
    addTrackPath(z => pathCenter(path, z), path.start, path.finish, 'return');
    const sleeperCount = Math.ceil((path.finish - path.start) / 3.1);
    [0, 1].forEach((trackIndex) => {
      const sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, .16, .25), M.roof, sleeperCount);
      sleepers.name = trackIndex ? 'pooled return sleepers' : 'pooled driving sleepers';
      const sleeperMatrix = new THREE.Matrix4();
      for (let i = 0; i < sleeperCount; i++) {
        const z = path.start + i * 3.1;
        const x = trackIndex ? pathCenter(path, z) : 0;
        sleeperMatrix.makeTranslation(x, -.13, z); sleepers.setMatrixAt(i, sleeperMatrix);
      }
      sleepers.instanceMatrix.needsUpdate = true; track.add(sleepers);
    });
  });

  const tunnelSegments = new THREE.Group();
  tunnelSegments.name = 'Discrete tunnel segments between station halls'; track.add(tunnelSegments);
  intervals.forEach(path => {
    const start = path.start, finish = path.finish, center = (start + finish) / 2, length = finish - start;
    if (length < 2) return;
    const tunnelLeft = -3;
    const tunnelRight = Math.max(path.x0, path.x1) + 3;
    const tunnelCenter = (tunnelLeft + tunnelRight) / 2;
    const tunnelWidth = tunnelRight - tunnelLeft;
    box('tunnel ceiling segment', tunnelCenter, 9.55, center, tunnelWidth, .35, length, M.dark, tunnelSegments);
    box('tunnel left wall segment', tunnelLeft, 2, center, .3, 15, length, M.dark, tunnelSegments);
    box('tunnel right wall segment', tunnelRight, 2, center, .3, 15, length, M.dark, tunnelSegments);
    for (let z = start + 16; z < finish; z += 32) {
      const ring = new THREE.Group(); ring.name = 'discrete rectangular tunnel arch'; tunnelSegments.add(ring);
      box('tunnel arch left upright', tunnelLeft + .2, 6.7, z, .25, 5.7, .25, M.concrete, ring);
      box('tunnel arch right upright', tunnelRight - .2, 6.7, z, .25, 5.7, .25, M.concrete, ring);
      box('tunnel arch overhead beam', tunnelCenter, 9.35, z, tunnelWidth, .25, .25, M.concrete, ring);
      box('tunnel fluorescent', tunnelCenter - tunnelWidth / 4, 4.25, z + 1, .12, .08, 3.8, glow('tunnel light', 0xffe9b0), tunnelSegments);
    }
  });

  const addPerson = (x, y, z, shirt, parent) => {
    const group = new THREE.Group(); group.name = 'station passenger'; group.position.set(x, y, z); parent.add(group);
    [-.11, .11].forEach((lx, leg) => {
      const limb = mesh(new THREE.CylinderGeometry(.1, .1, .7, 8), M.pants, 'passenger leg', group);
      limb.position.set(lx, .52, 0); limb.userData.legIndex = leg;
      box('passenger shoe', lx, .13, .08, .18, .1, .34, M.shoe, group);
    });
    mesh(new THREE.CylinderGeometry(.28, .28, .7, 8), shirt, 'passenger torso', group).position.y = 1.15;
    [-.24, .24].forEach(ax => {
      const arm = mesh(new THREE.CylinderGeometry(.065, .065, .62, 8), M.skin, 'passenger arm', group);
      arm.position.set(ax, 1.16, 0); arm.rotation.z = ax < 0 ? -.15 : .15;
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), M.skin); head.position.y = 1.68; group.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.21, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.black); hair.position.y = 1.74; group.add(hair);
    if (Math.abs(z * 7) % 2 > 1) box('passenger backpack', .4, 1, .04, .22, .35, .14, M.red, group);
    group.userData.baseZ = z; group.userData.phase = z * .1; group.userData.speed = .2 + (Math.abs(z * 7) % 20) / 100;
    group.userData.walkParts = group.children.filter(child => child.userData.legIndex !== undefined); animated.push(group);
  };
  assemblies.forEach((assembly, index) => {
    const island = assembly.footprint?.platform === 'island', xBase = island ? 5 : (index % 2 ? 8 : -4);
    [-140, -128, -114, -99, -52, -38, -24, -10, 4].forEach((z, personIndex) => {
      const x = island ? xBase + (personIndex % 2 ? 1 : -1) : xBase + (personIndex % 3) * .45;
      addPerson(x, Number(assembly.platformY || .76), z, personIndex % 3 === 0 ? M.red : personIndex % 3 === 1 ? M.shirt : M.yellow, assembly.group);
    });
  });

  const cameras = {};
  let cameraMode = 'exterior';
  cameras.cab = new THREE.PerspectiveCamera(70, 1, .05, 1200);
  cameras.cab.position.copy(detailedTrain.cabPosition); cameras.cab.lookAt(detailedTrain.cabTarget); detailedTrain.group.add(cameras.cab);
  cameras.interior = new THREE.PerspectiveCamera(68, 1, .05, 1200);
  cameras.interior.position.copy(detailedTrain.interiorPosition); cameras.interior.lookAt(detailedTrain.interiorTarget); detailedTrain.group.add(cameras.interior);
  cameras.exterior = new THREE.PerspectiveCamera(55, 1, .1, 1500); root.add(cameras.exterior);
  cameras.overhead = new THREE.PerspectiveCamera(60, 1, .1, 1800); root.add(cameras.overhead);
  const activeCamera = () => cameras[cameraMode] || cameras.cab;
  function setCameraMode(mode) { if (cameras[mode]) cameraMode = mode; detailedTrain.setView(mode); return activeCamera(); }
  detailedTrain.setView(cameraMode);
  function update(dt = .016, distance = 0, state = {}) {
    elapsed += dt; train.position.z = Number(distance) || 0; detailedTrain.group.position.z = Number(distance) || 0;
    detailedTrain.update(dt, { ...state, speed: state.speed || 0, doorsOpen: Boolean(state.doorsOpen) });
    animated.forEach((person, index) => {
      const gait = elapsed * person.userData.speed * 5 + person.userData.phase;
      person.position.z = person.userData.baseZ + Math.sin(elapsed * person.userData.speed + person.userData.phase) * 1.8;
      person.rotation.y = Math.sin(elapsed * .8 + index) * .25;
      person.userData.walkParts?.forEach((part, n) => { part.rotation.x = Math.sin(gait + n * Math.PI) * .25; });
    });
    cameras.exterior.position.set(train.position.x + 5.2, 2.8, train.position.z + 8.5); cameras.exterior.lookAt(train.position.x, 1.65, train.position.z - 6);
    cameras.overhead.position.set(train.position.x, train.position.y + 32, train.position.z + 28); cameras.overhead.lookAt(0, 0, train.position.z + 35);
    stationRoot.children.forEach(station => { station.visible = Math.abs(station.position.z - distance) < 1250; });
    const near = stations.reduce((best, station) => Math.abs((Number(station.distance) || 0) - distance) < Math.abs((Number(best?.distance) || 0) - distance) ? station : best, stations[0]);
    const open = near?.type === 'elevated' && Math.abs((Number(near.distance) || 0) - distance) < 90;
    ambient.intensity = open ? 1.65 : 1.15; sun.intensity = open ? 2.45 : 1.35;
  }
  function resize(width, height) { Object.values(cameras).forEach(camera => { camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); }); }
  function dispose() { root.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material?.dispose) object.material.dispose(); }); studioTarget?.dispose?.(); studio?.dispose?.(); pmrem?.dispose?.(); detailedTrain.dispose?.(); }
  return { scene, root, train, cameras, get camera() { return activeCamera(); }, get doorFraction() { return detailedTrain.doorFraction; }, setCameraMode, update, resize, dispose, stationRoot, stationAssemblies: assemblies, railPaths: intervals };
}

export default createWorld;
