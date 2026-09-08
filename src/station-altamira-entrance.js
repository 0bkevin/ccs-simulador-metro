/*
 * Plaza Altamira entrance, kept separate from the underground station shell.
 * The reference entrance is an open, sunken civic space: paired broad stairs,
 * a bridge across the void, pale exposed concrete, teal railings and a shallow
 * turquoise pool.  No solid street deck is placed over the opening here.
 */

function materials(THREE) {
  const out = {};
  const standard = (name, color, options = {}) => {
    const params = { color, roughness: options.roughness ?? .78, metalness: options.metalness ?? 0 };
    if (options.transparent) { params.transparent = true; params.opacity = options.opacity ?? .7; }
    const material = new THREE.MeshStandardMaterial(params); material.name = name; return material;
  };
  out.concrete = standard('Altamira pale exposed reinforced concrete', 0xc1c6bc, { roughness: .92 });
  out.concreteShadow = standard('Altamira concrete shadow', 0x8f9991, { roughness: .92 });
  out.teal = standard('Altamira teal green railing', 0x4b8178, { roughness: .52, metalness: .16 });
  out.tealDark = standard('Altamira planter trim', 0x35645d, { roughness: .68 });
  out.water = standard('Altamira shallow turquoise water', 0x43b8ae, { roughness: .14, transparent: true, opacity: .72 });
  out.black = standard('Altamira black fascia', 0x151a1c, { roughness: .62 });
  out.green = standard('Altamira planted beds', 0x3c7c4d, { roughness: .96 });
  out.yellow = standard('Altamira warm flower beds', 0xd6ba35, { roughness: .9 });
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#151a1c'; ctx.fillRect(0, 0, 640, 128);
    ctx.fillStyle = '#fff6db'; ctx.font = '700 56px Arial'; ctx.textBaseline = 'middle'; ctx.fillText('ALTAMIRA', 30, 67);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    out.sign = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    out.sign.userData.texture = texture;
  } else out.sign = out.black;
  return out;
}

function box(THREE, group, name, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}

function beam(THREE, group, name, a, b, radius, material) {
  const start = new THREE.Vector3(...a); const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start); const length = delta.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), material);
  mesh.name = name; mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}

function railing(THREE, group, name, points, material) {
  for (let i = 0; i < points.length - 1; i++) beam(THREE, group, name, points[i], points[i + 1], .07, material);
  points.forEach((point) => beam(THREE, group, `${name} post`, [point[0], 5.05, point[2]], point, .045, material));
}

function stairs(THREE, group, name, x, zStart, count, width, material, lowerY, topY, runLength = 8, railMaterial = material) {
  const rise = (topY - lowerY) / count;
  const run = runLength / count;
  for (let i = 0; i < count; i++) {
    const height = (i + 1) * rise;
    box(THREE, group, `${name} tread`, x, lowerY + height / 2, zStart + (i + .5) * run, width, height, run, material);
  }
  box(THREE, group, `${name} upper landing`, x, topY + .09, zStart + runLength + .2, width + .35, .18, 2.1, material);
  const railZ0 = zStart - .2;
  const railZ1 = zStart + runLength + .6;
  for (const side of [-1, 1]) {
    const railX = x + side * (width / 2 - .12);
    beam(THREE, group, `${name} teal handrail`, [railX, lowerY + .88, railZ0], [railX, topY + 1.0, railZ1], .045, railMaterial);
    for (const fraction of [0, .5, 1]) {
      const postZ = railZ0 + (railZ1 - railZ0) * fraction;
      const postY = lowerY + (topY - lowerY) * fraction;
      beam(THREE, group, `${name} teal handrail post`, [railX, postY, postZ], [railX, postY + .88, postZ], .032, railMaterial);
    }
  }
}

function planter(THREE, group, name, x, z, mats) {
  box(THREE, group, `${name} concrete planter`, x, 8.94, z, 3.4, .32, 4.8, mats.concrete);
  box(THREE, group, `${name} planted soil`, x, 9.14, z, 2.85, .12, 4.2, mats.green);
  for (const dx of [-.9, 0, .9]) {
    const shrub = new THREE.Mesh(new THREE.ConeGeometry(.35, .75, 7), mats.green);
    shrub.name = `${name} shrub`; shrub.position.set(x + dx, 9.55, z + (dx * .7)); shrub.castShadow = true; group.add(shrub);
  }
}

/**
 * Add the Plaza Altamira north entrance to an existing station group.
 * Returns camera presets in the same local coordinates as the station.
 */
export function addAltamiraEntrance(THREE, group) {
  if (!THREE || !group) throw new Error('addAltamiraEntrance requires THREE and a station group');
  const mats = materials(THREE);
  const centerX = 5;
  const centerZ = -70;

  // Street-level paving deliberately stops at the opening; the middle is an
  // open void with stairs and a bridge rather than a closed deck.
  // Split the side paving around the stair openings so daylight can reach the
  // sunken flights; a single slab here would hide the stairs completely.
  for (const [z, depth] of [[-64.5, 8.0], [-86.0, 9.0]]) {
    box(THREE, group, 'Altamira street plaza west', -1.6, 8.72, z, 6.8, .28, depth, mats.concrete);
    box(THREE, group, 'Altamira street plaza east', 11.6, 8.72, z, 6.8, .28, depth, mats.concrete);
  }
  box(THREE, group, 'Altamira north street apron', centerX, 8.72, -57.8, 20, .28, 3.5, mats.concrete);
  box(THREE, group, 'Altamira south street apron', centerX, 8.72, -82.2, 20, .28, 3.5, mats.concrete);

  // Pale retaining walls frame the sunken vestibule and leave a wide central
  // opening visible from the street.
  // Leave a broad opening at the two stair/bridge crossings. Continuous
  // retaining walls would seal the lower walks behind the bridge abutments.
  for (const [z, depth] of [[-64.0, 8.0], [-85.0, 8.0]]) {
    box(THREE, group, 'Altamira retaining wall west', -1.0, 6.85, z, .55, 4.0, depth, mats.concrete);
    box(THREE, group, 'Altamira retaining wall east', 11.0, 6.85, z, .55, 4.0, depth, mats.concrete);
  }
  box(THREE, group, 'Altamira vestibule north wall', centerX, 6.85, -59.3, 12.5, 4.0, .55, mats.concrete);

  // Each side stair has a lower vestibule-to-bridge flight and an upper
  // bridge-to-street flight. The landings meet at y=7.2, the bridge deck.
  // `topY` is the underside of the 180 mm landing slab. Passing bridge top
  // minus slab thickness makes the finished landing meet its destination
  // surface exactly: y=7.20 at the bridge and y=8.86 at street level.
  stairs(THREE, group, 'Altamira west lower broad stair', -3.0, -78.7, 9, 3.8, mats.concrete, 5.12, 7.02, 4, mats.teal);
  stairs(THREE, group, 'Altamira west upper broad stair', -3.0, -74.7, 8, 3.8, mats.concrete, 7.2, 8.68, 4, mats.teal);
  stairs(THREE, group, 'Altamira east lower broad stair', 13.0, -78.7, 9, 3.8, mats.concrete, 5.12, 7.02, 4, mats.teal);
  stairs(THREE, group, 'Altamira east upper broad stair', 13.0, -74.7, 8, 3.8, mats.concrete, 7.2, 8.68, 4, mats.teal);

  // The pedestrian bridge crosses the open void at y≈7, with a second lower
  // vestibule walkway visible below it.
  const bridgeZ = -74.7;
  box(THREE, group, 'Altamira central pedestrian bridge', centerX, 7.05, bridgeZ, 13.2, .3, 2.9, mats.concrete);
  box(THREE, group, 'Altamira bridge teal edge north', centerX, 7.48, bridgeZ - 1.25, 13.2, .72, .12, mats.teal);
  box(THREE, group, 'Altamira bridge teal edge south', centerX, 7.48, bridgeZ + 1.25, 13.2, .72, .12, mats.teal);
  for (const x of [-1.3, 11.3]) {
    beam(THREE, group, 'Altamira bridge railing', [x, 7.45, bridgeZ - 1.25], [x, 7.45, bridgeZ + 1.25], .06, mats.teal);
  }

  // Lower vestibule walks and the shallow turquoise pool from the reference.
  box(THREE, group, 'Altamira lower vestibule west walk', -.1, 5.02, -70, 2.4, .2, 17.5, mats.concreteShadow);
  box(THREE, group, 'Altamira lower vestibule east walk', 10.1, 5.02, -70, 2.4, .2, 17.5, mats.concreteShadow);
  box(THREE, group, 'Altamira shallow turquoise pool', centerX, 5.08, -80.0, 7.4, .14, 4.6, mats.water);
  box(THREE, group, 'Altamira pool pale rim north', centerX, 5.18, -82.4, 8.1, .22, .45, mats.concrete);
  box(THREE, group, 'Altamira pool pale rim south', centerX, 5.18, -77.6, 8.1, .22, .45, mats.concrete);
  box(THREE, group, 'Altamira pool pale rim west', 1.1, 5.18, -80, .45, .22, 4.8, mats.concrete);
  box(THREE, group, 'Altamira pool pale rim east', 8.9, 5.18, -80, .45, .22, 4.8, mats.concrete);

  planter(THREE, group, 'Altamira west street planter', -4.5, -61, mats);
  planter(THREE, group, 'Altamira east street planter', 14.5, -61, mats);
  planter(THREE, group, 'Altamira west south planter', -4.5, -84, mats);
  planter(THREE, group, 'Altamira east south planter', 14.5, -84, mats);

  const fascia = new THREE.Mesh(new THREE.PlaneGeometry(4.8, .8), mats.sign);
  fascia.name = 'Altamira black station fascia'; fascia.position.set(centerX, 6.05, -59.0); fascia.rotation.y = Math.PI; fascia.scale.x = -1; group.add(fascia);
  group.userData.altamiraEntrance = {
    streetY: 8.86,
    vestibuleY: 5.12,
    bridgeY: 7.2,
    cameraPreset: {
      position: [26, 15, -36],
      target: [5, 6.1, -70],
    },
    cameraPresets: {
      exterior: { position: [26, 15, -36], target: [5, 6.1, -70] },
      vestibule: { position: [18, 8.3, -51], target: [5, 5.5, -72] },
    },
  };
  return group.userData.altamiraEntrance;
}

export default addAltamiraEntrance;
