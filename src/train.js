import { createBogie as createHardwareBogie, createRoofEquipment, createCoupler as createHardwareCoupler } from './train-hardware.js';
import { createCAFNose } from './train-nose.js';
import { createCabLiveryTexture, createMetroMarkTexture } from './train-livery.js';

/*
 * Caracas Metro CAF Series 6 exterior.
 *
 * The train is modelled as a sampled skin rather than a collection of cuboids.
 * Coordinates are metres. The front cab is at z=0 and the seven cars run
 * towards -Z. The cross section is a 40 point rounded trapezoid; the driving
 * ends are lofts whose width, roof height, and rake change over 2.8 metres.
 */

export function createTrain(THREE) {
  const root = new THREE.Group();
  root.name = 'Caracas CAF Series 6 train';

  const geometries = new Map();
  const materials = {};
  const meshes = [];
  const doors = [];
  const wheels = [];
  const controls = [];
  const hardwareBogies = [];
  const textures = [];
  const decalMaterials = [];

  const mat = (name, color, roughness = .5, metalness = 0, extra = {}) =>
    materials[name] ||= new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const basic = (name, color, extra = {}) => materials[name] ||= new THREE.MeshBasicMaterial({ color, ...extra });
  const M = {
    silver: mat('CAF satin silver', 0xc9d0d0, .27, .7),
    silverShadow: mat('CAF lower silver', 0x8f9a9d, .34, .64),
    red: mat('CAF end and door red', 0xd5252c, .3, .08),
    redDeep: mat('CAF red recess', 0x82151d, .38, .08),
    black: mat('rubber and black mask', 0x0a1014, .72, .06),
    seal: mat('window gasket', 0x11191d, .64, .12),
    glass: mat('side smoked glass', 0x102b39, .11, .35, { side: THREE.DoubleSide }),
    windshield: new THREE.MeshPhysicalMaterial({ color: 0x08151d, roughness: .08, metalness: .45, clearcoat: .7, clearcoatRoughness: .06, transparent: true, opacity: .94, side: THREE.DoubleSide }),
    glassHighlight: basic('windshield reflection', 0x89b7c1, { transparent: true, opacity: .13, side: THREE.DoubleSide, depthWrite: false }),
    white: mat('lamp white', 0xf7f1d5, .22, .08),
    redLamp: basic('lamp red', 0xed2434),
    yellow: mat('yellow handrail', 0xffc725, .38, .1),
    stripeYellow: mat('Caracas yellow stripe', 0xf0c52d, .42, .08),
    stripeGreen: mat('Caracas green stripe', 0x3e9d51, .42, .08),
    stripeBlue: mat('Caracas blue stripe', 0x2d63aa, .42, .08),
    bogie: mat('bogie steel', 0x35434a, .55, .72),
    wheel: mat('wheel dark steel', 0x222b2f, .27, .9),
    coupler: mat('coupler graphite', 0x262c2f, .7, .78),
    hose: mat('coupler hoses', 0x151b1f, .85, .1),
    roof: mat('roof equipment', 0x657176, .46, .6),
    floor: mat('interior floor behind glass', 0x30383b, .86),
    interior: mat('dark interior', 0x383b38, .78),
    amber: basic('destination amber', 0xffbd2e),
    cyan: basic('cab displays', 0x72eaff),
  };

  const cache = (key, factory) => {
    if (!geometries.has(key)) geometries.set(key, factory());
    return geometries.get(key);
  };
  const mesh = (name, geometry, material, parent = root) => {
    const o = new THREE.Mesh(geometry, material);
    o.name = name;
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    meshes.push(o);
    return o;
  };
  const box = (name, x, y, z, sx, sy, sz, material, parent = root) => {
    const g = cache(`box:${sx}:${sy}:${sz}`, () => new THREE.BoxGeometry(sx, sy, sz));
    const o = mesh(name, g, material, parent);
    o.position.set(x, y, z);
    return o;
  };
  const cylinder = (name, x, y, z, radius, depth, material, parent = root, radial = 16) => {
    const g = cache(`cylinder:${radius}:${depth}:${radial}`, () => new THREE.CylinderGeometry(radius, radius, depth, radial));
    const o = mesh(name, g, material, parent);
    o.position.set(x, y, z);
    return o;
  };
  const tube = (name, a, b, radius, material, parent = root, radial = 8) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const delta = vb.clone().sub(va), length = delta.length();
    const o = cylinder(name, 0, 0, 0, radius, length, material, parent, radial);
    o.position.copy(va).add(vb).multiplyScalar(.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return o;
  };
  const SIDE_SEGMENTS = 40;
  const shellPoint = (theta, width = 1.5, bottom = .62, top = 3.58) => {
    // A high exponent holds a straight side wall and rolls into a broad arch.
    const q = 6;
    const c = Math.cos(theta), s = Math.sin(theta);
    return [width * Math.sign(c) * Math.pow(Math.abs(c), 2 / q),
      (bottom + top) / 2 + (top - bottom) / 2 * Math.sign(s) * Math.pow(Math.abs(s), 2 / q)];
  };
  const shellXAtY = (y, width = 1.5, bottom = .62, top = 3.58) => {
    const t = Math.max(-1, Math.min(1, (y - (bottom + top) / 2) / ((top - bottom) / 2)));
    return width * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 6)), 1 / 6);
  };
  function shellGeometry(key, rows) {
    return cache(key, () => {
      const positions = [], indices = [];
      rows.forEach(row => {
        for (let j = 0; j < SIDE_SEGMENTS; j++) {
          const [x, y] = shellPoint((j / SIDE_SEGMENTS) * Math.PI * 2, row.width, row.bottom, row.top);
          positions.push(x, y, row.z);
        }
      });
      for (let i = 0; i < rows.length - 1; i++) {
        for (let j = 0; j < SIDE_SEGMENTS; j++) {
          const a = i * SIDE_SEGMENTS + j, b = i * SIDE_SEGMENTS + (j + 1) % SIDE_SEGMENTS;
          const c = (i + 1) * SIDE_SEGMENTS + (j + 1) % SIDE_SEGMENTS, d = (i + 1) * SIDE_SEGMENTS + j;
          indices.push(a, b, d, b, c, d);
        }
      }
      const front = positions.length / 3; positions.push(0, (rows[0].bottom + rows[0].top) / 2, rows[0].z);
      const rear = positions.length / 3; positions.push(0, (rows[rows.length - 1].bottom + rows[rows.length - 1].top) / 2, rows[rows.length - 1].z);
      for (let j = 0; j < SIDE_SEGMENTS; j++) {
        const n = (j + 1) % SIDE_SEGMENTS;
        indices.push(front, n, j);
        const a = (rows.length - 1) * SIDE_SEGMENTS + j, b = (rows.length - 1) * SIDE_SEGMENTS + n;
        indices.push(rear, a, b);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setIndex(indices); g.computeVertexNormals();
      return g;
    });
  }

  function patchGeometry(key, rows, cols, point, reverse = false) {
    return cache(key, () => {
      const positions = [], uvs = [], indices = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const u = c / (cols - 1), v = r / (rows - 1);
        uvs.push(u, v);
        positions.push(...point(u, v));
      }
      for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c, b = a + 1, d = (r + 1) * cols + c, e = d + 1;
        if (reverse) indices.push(a, d, b, d, e, b);
        else indices.push(a, b, d, b, e, d);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      g.setIndex(indices); g.computeVertexNormals();
      return g;
    });
  }

  function sidePatch(name, side, centerZ, width, bottom, top, material, parent = root, key = name, offset = .018) {
    const g = patchGeometry(`side:${key}:${side}:${centerZ}:${width}:${bottom}:${top}:${offset}`, 12, 18, (u, v) => {
      const y = bottom + (top - bottom) * v;
      const corner = Math.min(.16, .08 / Math.max(.01, top - bottom));
      const edge = v < corner ? .92 + .08 * (v / corner) : v > 1 - corner ? .92 + .08 * ((1 - v) / corner) : 1;
      const z = centerZ + (u - .5) * 2 * width * edge;
      const x = side * (shellXAtY(y) + offset);
      return [x, y, z];
    }, side > 0);
    return mesh(name, g, material, parent);
  }
  function sideBand(name, side, z0, z1, y, height, material, parent = root) {
    const x0 = side * (shellXAtY(y - height / 2) + .022), x1 = side * (shellXAtY(y + height / 2) + .022);
    const g = patchGeometry(`band:${name}:${side}:${z0}:${z1}:${y}:${height}`, 2, 2, (u, v) => [x0 + (x1 - x0) * v, y - height / 2 + height * v, z0 + (z1 - z0) * u], side > 0);
    return mesh(name, g, material, parent);
  }

  function roundedWindow(name, side, z, width, parent) {
    sidePatch(`${name} black gasket`, side, z, width + .11, 1.945, 2.885, M.seal, parent, `${name}:gasket`, .028);
    return sidePatch(`${name} curved dark glass`, side, z, width, 2.00, 2.83, M.glass, parent, `${name}:glass`, .045);
  }

  function makeNose(parent, flip = false, zOrigin = 0) {
    const nose = createCAFNose(THREE, { destination: 'PALO VERDE', rear: flip });
    nose.name = flip ? 'rear CAF driving nose' : 'front CAF driving nose';
    nose.position.z = zOrigin;
    const coupler = createHardwareCoupler(THREE);
    coupler.name = flip ? 'rear exposed automatic coupler' : 'front exposed automatic coupler';
    coupler.position.copy(nose.userData.couplerMount);
    coupler.rotation.y = nose.userData.couplerRotationY;
    nose.add(coupler);
    const cabSidePatch = (name, side, zFront, zRear, yBottom, yTop, material, key, offset = .028) => {
      const g = patchGeometry(`cab-side:${key}:${side}:${zFront}:${zRear}:${yBottom}:${yTop}:${offset}`, 14, 20, (u, v) => {
        const z = zFront + (zRear - zFront) * u;
        const y = yBottom + (yTop - yBottom) * v;
        const normalizedY = Math.min(1, Math.abs((y - 2.05) / 1.55));
        const x0 = 1.5 * Math.pow(Math.max(0, 1 - Math.pow(normalizedY, 3.35)), 1 / 3.35);
        const zFace = nose.userData.surfaceAt(side * x0, y).z;
        const rowFront = Math.min(zFront, zFace - .01);
        const rowZ = rowFront + (zRear - rowFront) * u;
        const t = Math.max(0, Math.min(1, (rowZ - zFace) / (-2.8 - zFace)));
        const x = side * (x0 * (1 - .015 * t) + offset);
        return [x, y, rowZ];
      }, side < 0);
      return mesh(name, g, material, nose);
    };
    for (const side of [-1, 1]) {
      cabSidePatch('silver cab side panel below driver window', side, -.8, -2.78, .90, 3.18, M.silver, `silver-panel:${side}`, .008);
      const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x102b39, roughness: .12, metalness: .3, side: THREE.DoubleSide });
      decalMaterials.push(windowMaterial);
      cabSidePatch('cab side guillotine window gasket', side, -.95, -2.05, 1.94, 3.07, M.seal, `window-gasket:${side}`, .014);
      cabSidePatch('cab side guillotine window', side, -.95, -2.05, 2.00, 3.01, windowMaterial, `window:${side}`, .020);
      cabSidePatch('cab side guillotine horizontal seam', side, -.92, -2.08, 2.485, 2.525, M.seal, `window-seam:${side}`, .026);
      const livery = createCabLiveryTexture(THREE);
      const liveryMaterial = new THREE.MeshStandardMaterial({ map: livery, transparent: true, roughness: .36, metalness: .08, side: THREE.DoubleSide });
      decalMaterials.push(liveryMaterial);
      cabSidePatch('conforming Venezuelan cab flag ribbon', side, -.32, -2.68, 1.04, 1.92, liveryMaterial, `flag:${side}`, .016);
    }
    parent.add(nose);
    return nose;
  }

  function makeBogie(parent, z, index) {
    const g = createHardwareBogie(THREE); g.name = `detailed CAF bogie ${index}`; g.position.z = z; parent.add(g);
    hardwareBogies.push(g);
    return g;
  }

  function makeGangway(z) {
    const g = new THREE.Group(); g.name = 'flexible black gangway'; g.position.z = z; root.add(g);
    const ribGeometry = cache('rounded gangway bellows rib', () => {
      const points = [];
      const addArc = (cx, cy, start, end) => { for (let i = 0; i <= 5; i++) { const a = start + (end - start) * i / 5; points.push([cx + .16 * Math.cos(a), cy + .16 * Math.sin(a)]); } };
      addArc(.84, 3.14, 0, Math.PI / 2); addArc(-.84, 3.14, Math.PI / 2, Math.PI); addArc(-.84, .86, Math.PI, Math.PI * 1.5); addArc(.84, .86, Math.PI * 1.5, Math.PI * 2);
      const inner = points.map(([x, y]) => [x * .91, 2 + (y - 2) * .91]);
      const positions = [], indices = [];
      for (let i = 0; i < points.length; i++) positions.push(points[i][0], points[i][1], 0, inner[i][0], inner[i][1], 0);
      for (let i = 0; i < points.length; i++) { const n = (i + 1) % points.length; indices.push(i * 2, n * 2, i * 2 + 1, n * 2, n * 2 + 1, i * 2 + 1); }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
    });
    for (let i = 0; i < 8; i++) {
      const rib = mesh('gangway rounded bellows rib', ribGeometry, M.black, g); rib.position.z = -.32 + i * (.64 / 7);
    }
    box('gangway floor bridge', 0, .74, 0, 1.7, .10, .78, M.bogie, g);
  }

  function makeInterior(car, index) {
    const interiorLength = index === 0 || index === 6 ? 16.4 : 19.1;
    const interiorCenter = index === 0 ? -1.2 : index === 6 ? 1.2 : 0;
    box('dark passenger floor', 0, .84, interiorCenter, 2.72, .10, interiorLength, M.floor, car);
    box('dark passenger ceiling', 0, 3.46, interiorCenter, 2.72, .08, interiorLength, M.interior, car);
    for (const z of [-7.6, -2.55, 2.55, 7.6]) if (!((index === 0 && z > 7.2) || (index === 6 && z < -7.2))) for (const side of [-1, 1]) {
      box('muted interior seat', side * .96, 1.19, z, .68, .38, 1.55, M.redDeep, car);
      tube('interior yellow pole', [side * .88, 1.0, z], [side * .88, 3.25, z], .025, M.yellow, car, 8);
    }
  }

  function makeCabInterior() {
    const cab = new THREE.Group(); cab.name = 'usable driver cab interior'; cab.position.z = -.12; root.add(cab);
    box('cab floor', 0, .92, -1.35, 2.46, .12, 2.0, M.floor, cab);
    box('cab dashboard', 0, 1.42, -1.45, 2.20, .16, .54, M.black, cab);
    const display = box('cab cyan speed display', -.64, 1.56, -1.72, .62, .16, .03, M.cyan, cab); display.rotation.x = -.16;
    const throttle = box('cab throttle handle', -.78, 1.72, -1.43, .07, .20, .07, M.yellow, cab); throttle.rotation.x = -.3;
    const brake = box('cab brake handle', -.53, 1.72, -1.43, .07, .20, .07, M.red, cab); brake.rotation.x = -.22;
    controls.push({ throttle, brake });
    box('cab left side wall', -1.40, 2.15, -1.25, .1, 2.1, 2.2, M.redDeep, cab);
    box('cab right side wall', 1.40, 2.15, -1.25, .1, 2.1, 2.2, M.redDeep, cab);
  }

  const metroMarkTexture = createMetroMarkTexture(THREE);
  const metroMarkMaterial = new THREE.MeshStandardMaterial({ map: metroMarkTexture, transparent: true, roughness: .42, metalness: .1, side: THREE.DoubleSide });
  decalMaterials.push(metroMarkMaterial);
  const cars = [];
  for (let i = 0; i < 7; i++) {
    const car = new THREE.Group(); car.name = `CAF Series 6 car ${i + 1}`; car.position.z = -10 - i * 20; root.add(car); cars.push(car);
    const frontBodyZ = i === 0 ? 7.18 : 9.58;
    const rearBodyZ = i === 6 ? -7.18 : -9.58;
    mesh('continuous rounded silver car shell', shellGeometry(`car-shell:${i}`, [{ z: rearBodyZ, width: 1.5, bottom: .62, top: 3.58 }, { z: frontBodyZ, width: 1.5, bottom: .62, top: 3.58 }]), M.silver, car);
    for (const side of [-1, 1]) {
      sideBand('red lower skirt', side, rearBodyZ, frontBodyZ, .91, .07, M.red, car);
      sideBand('yellow lower stripe', side, rearBodyZ, frontBodyZ, .985, .055, M.stripeYellow, car);
      sideBand('green lower stripe', side, rearBodyZ, frontBodyZ, 1.05, .055, M.stripeGreen, car);
      sideBand('blue lower stripe', side, rearBodyZ, frontBodyZ, 1.115, .055, M.stripeBlue, car);
      sideBand('narrow red roof belt', side, rearBodyZ, frontBodyZ, 3.39, .10, M.red, car);
      sidePatch('small Metro side identity mark', side, 0, .21, 1.34, 1.55, metroMarkMaterial, car, `metro-mark:${i}:${side}`, .04);
      [-8.62, -4.36, 0, 4.36, 8.62].forEach((z, n) => { if (!(i === 0 && z > 7.5) && !(i === 6 && z < -7.5)) roundedWindow('rounded side passenger window', side, z, [.351, .836, .836, .836, .351][n], car); });
      const doorCenters = i === 0 ? [-6.8, -2.25, 2.25, 6.3] : i === 6 ? [-6.3, -2.25, 2.25, 6.8] : [-6.8, -2.25, 2.25, 6.8];
      for (const doorZ of doorCenters) {
        sidePatch('dark paired-door aperture', side, doorZ, .88, 1.01, 3.19, M.black, car, `aperture:${i}:${side}:${doorZ}`, .025);
        for (const leafSide of [-1, 1]) {
        const leaf = new THREE.Group(); leaf.name = 'paired sliding red door leaf';
        leaf.position.set(0, 0, doorZ + leafSide * .42); car.add(leaf);
        sidePatch('red sliding door leaf', side, 0, .43, 1.01, 3.19, M.red, leaf, `door:${i}:${side}:${doorZ}:${leafSide}`, .035);
        sidePatch('door smoked upper glass', side, 0, .29, 1.75, 2.83, M.glass, leaf, `door-glass:${i}:${side}:${doorZ}:${leafSide}`, .052);
          doors.push({ object: leaf, closed: doorZ + leafSide * .42, open: doorZ + leafSide * 1.12 });
        }
        sidePatch('paired door centre seam', side, doorZ, .018, 1.03, 3.18, M.seal, car, `door-seam:${i}:${side}:${doorZ}`, .062);
      }
      for (const doorZ of doorCenters) cylinder('door yellow handle', side * (shellXAtY(1.72) + .06), 1.72, doorZ, .032, .10, M.yellow, car, 10).rotation.x = Math.PI / 2;
    }
    makeInterior(car, i); makeBogie(car, -6.4, i * 2 + 1); makeBogie(car, 6.4, i * 2 + 2);
    const roofEquipment = createRoofEquipment(THREE); roofEquipment.position.y = 3.48; car.add(roofEquipment);
    for (const z of [-7.4, -2.5, 2.5, 7.4]) box('underfloor equipment', 0, .36, z, 1.18, .26, 1.55, M.black, car);
    if (i < 6) makeGangway(-20 * (i + 1));
  }
  makeNose(root, false, 0); makeNose(root, true, -140); makeCabInterior();

  const cabPosition = new THREE.Vector3(0, 2.25, -.72), cabTarget = new THREE.Vector3(0, 2.25, 20);
  const interiorPosition = new THREE.Vector3(0, 2.12, -5.7), interiorTarget = new THREE.Vector3(0, 2.08, -24);
  let doorFraction = 0, initialized = false, elapsed = 0;
  function setView(mode = 'exterior') {
    root.userData.viewMode = mode;
    const cabInterior = root.getObjectByName('usable driver cab interior');
    if (cabInterior) cabInterior.visible = mode === 'cab';
    cars[0].traverse(o => { if (o.name.includes('rounded side passenger window') || o.name.includes('door smoked')) o.visible = mode !== 'cab'; });
    const frontNose = root.children.find(o => o.name === 'front CAF driving nose');
    frontNose?.traverse(o => {
      if (!o.isMesh) return;
      const n = o.name;
      if (frontNose.userData.opaqueSurfaces?.includes(o)) o.visible = mode !== 'cab';
      if (n.includes('nose skin') || n.includes('front mask') || n.includes('windshield') || n.includes('lower apron') || n.includes('upper cheek') || n.includes('cab ') || n.includes('destination indicator') || n.includes('lamp recess') || n.includes('headlamp') || n.includes('marker lamp') || n.includes('front windshield wiper')) o.visible = mode !== 'cab';
      if (n.includes('destination')) o.visible = mode !== 'cab';
    });
    return root;
  }
  function update(dt = .016, state = {}) {
    const raw = Number(dt), step = Number.isFinite(raw) ? Math.max(0, Math.min(raw, .1)) : 0;
    elapsed += step;
    const target = state.doorsOpen ? 1 : 0;
    if (!initialized) { doorFraction = target; initialized = true; } else doorFraction += Math.sign(target - doorFraction) * Math.min(Math.abs(target - doorFraction), step);
    doors.forEach(d => { d.object.position.z = d.closed + (d.open - d.closed) * doorFraction; });
    const speed = Number(state.speed) || 0;
    hardwareBogies.forEach(bogie => bogie.userData.update?.(step, speed));
    wheels.forEach(w => { w.wheel.rotation.x += speed * step / w.radius; });
    const throttle = Math.max(0, Math.min(1, Number(state.throttle) || (state.throttle ? 1 : 0))), brake = Math.max(0, Math.min(1, Number(state.brake) || (state.brake ? 1 : 0)));
    controls.forEach(c => { c.throttle.rotation.x = -.30 - throttle * .42; c.brake.rotation.x = -.22 - brake * .34; });
    root.userData.elapsed = elapsed;
  }
  function dispose() { geometries.forEach(g => g.dispose?.()); Object.values(materials).forEach(m => m.dispose?.()); decalMaterials.forEach(m => m.dispose?.()); textures.forEach(t => t.dispose?.()); }
  root.userData.length = 140;
  root.userData.validation = { cars: cars.length, gangways: 6, bogies: hardwareBogies.length, wheels: hardwareBogies.length * 4, sideSegments: SIDE_SEGMENTS, noseLoftRows: 8, doorsPerSidePerCar: 4, wheelGauge: 1.435, noseFrontZ: 0, rearBodyZ: -140 };
  setView('cab');
  return { group: root, update, setView, cabPosition, cabTarget, interiorPosition, interiorTarget, length: 140, dispose, get doorFraction() { return doorFraction; } };
}

export default createTrain;
