/*
 * Exposed CAF Series 6 running gear.
 *
 * All dimensions are metres.  Coordinates use y up, x across the track and z
 * along the train.  createBogie() is centred at the rail top (y = 0), has
 * wheel centres at y = .43 and axle centres at z = +/- 1.0.  Wheel motion is
 * available as bogie.userData.update(dt, speed), with speed in m/s and the
 * sign following +z.  The roof and coupler are local assemblies so a car
 * builder can place them without knowing their parent transform.
 *
 * Geometry and materials are cached per injected THREE namespace.  Call
 * disposeTrainHardware(THREE) once after all hardware groups have been removed
 * from a scene; never dispose a cache from an individual bogie.
 *
 * The geometry is an inspection-friendly approximation of the visible CAF
 * hardware.  It is not a claim about hidden engineering dimensions.
 */

const THREE_CONTEXTS = new WeakMap();

function context(THREE) {
  let c = THREE_CONTEXTS.get(THREE);
  if (c) return c;
  const materials = new Map();
  const geometries = new Map();
  const mat = (key, color, options = {}) => {
    if (!materials.has(key)) {
      materials.set(key, new THREE.MeshStandardMaterial({
        color,
        roughness: .48,
        metalness: .65,
        ...options,
      }));
    }
    return materials.get(key);
  };
  c = {
    THREE,
    materials,
    geometries,
    steel: mat('steel', 0x3f4c51, { roughness: .42, metalness: .82 }),
    steelDark: mat('steelDark', 0x252f34, { roughness: .34, metalness: .88 }),
    steelBright: mat('steelBright', 0xb6c1c0, { roughness: .27, metalness: .82 }),
    wheel: mat('wheel', 0x262d30, { roughness: .25, metalness: .92 }),
    wheelFace: mat('wheelFace', 0x8e9999, { roughness: .3, metalness: .88 }),
    brake: mat('brake', 0x7b2428, { roughness: .45, metalness: .45 }),
    rubber: mat('rubber', 0x151b1d, { roughness: .9, metalness: .04 }),
    hose: mat('hose', 0x101619, { roughness: .72, metalness: .18 }),
    spring: mat('spring', 0xa7b1ad, { roughness: .35, metalness: .8 }),
    yellow: mat('yellow', 0xf2bf27, { roughness: .39, metalness: .35 }),
    red: mat('red', 0xb91e27, { roughness: .36, metalness: .25 }),
    dark: mat('dark', 0x0c1215, { roughness: .8, metalness: .08 }),
    vent: mat('vent', 0x59666a, { roughness: .58, metalness: .64 }),
  };
  THREE_CONTEXTS.set(THREE, c);
  return c;
}

function geometry(c, key, factory) {
  if (!c.geometries.has(key)) c.geometries.set(key, factory());
  return c.geometries.get(key);
}

function mesh(c, parent, name, g, material) {
  const o = new c.THREE.Mesh(g, material);
  o.name = name;
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}

function box(c, parent, name, size, position, material, bevel = .025) {
  const [sx, sy, sz] = size;
  const key = `rounded:${sx}:${sy}:${sz}:${bevel}`;
  const g = geometry(c, key, () => roundedBoxGeometry(c.THREE, sx, sy, sz, bevel));
  const o = mesh(c, parent, name, g, material);
  o.position.set(position[0], position[1], position[2]);
  return o;
}

function cylinder(c, parent, name, radius, depth, position, material, radial = 12, axis = 'y') {
  const key = `cylinder:${radius}:${depth}:${radial}`;
  const g = geometry(c, key, () => new c.THREE.CylinderGeometry(radius, radius, depth, radial));
  const o = mesh(c, parent, name, g, material);
  o.position.set(position[0], position[1], position[2]);
  if (axis === 'x') o.rotation.z = Math.PI / 2;
  if (axis === 'z') o.rotation.x = Math.PI / 2;
  return o;
}

function tubeBetween(c, parent, name, a, b, radius, material, radial = 8) {
  const va = new c.THREE.Vector3(a[0], a[1], a[2]);
  const vb = new c.THREE.Vector3(b[0], b[1], b[2]);
  const delta = vb.clone().sub(va);
  const length = delta.length();
  const o = cylinder(c, parent, name, radius, length, [0, 0, 0], material, radial, 'y');
  o.position.copy(va).add(vb).multiplyScalar(.5);
  o.quaternion.setFromUnitVectors(new c.THREE.Vector3(0, 1, 0), delta.normalize());
  return o;
}

function roundedBoxGeometry(THREE, sx, sy, sz, bevel) {
  // RoundedBoxGeometry is not part of core THREE.  Extruding a rounded
  // rectangle gives the same small edge highlights without importing an
  // example module into this injected-THREE hardware file.
  if (THREE.RoundedBoxGeometry) return new THREE.RoundedBoxGeometry(sx, sy, sz, 2, Math.min(bevel, Math.min(sx, sy, sz) * .45));
  const r = Math.min(bevel, sx * .45, sy * .45, sz * .45);
  // ExtrudeGeometry expands a bevel beyond the source profile.  Inset the
  // source dimensions so the resulting outside dimensions remain the values
  // requested by the caller (important for the compact .55 m coupler head
  // and the 1.6 x 2.4 m roof housing).
  const innerX = sx - 2 * r;
  const innerY = sy - 2 * r;
  const innerZ = sz - 2 * r;
  const shape = new THREE.Shape();
  shape.moveTo(-innerX / 2 + r, -innerY / 2);
  shape.lineTo(innerX / 2 - r, -innerY / 2);
  shape.quadraticCurveTo(innerX / 2, -innerY / 2, innerX / 2, -innerY / 2 + r);
  shape.lineTo(innerX / 2, innerY / 2 - r);
  shape.quadraticCurveTo(innerX / 2, innerY / 2, innerX / 2 - r, innerY / 2);
  shape.lineTo(-innerX / 2 + r, innerY / 2);
  shape.quadraticCurveTo(-innerX / 2, innerY / 2, -innerX / 2, innerY / 2 - r);
  shape.lineTo(-innerX / 2, -innerY / 2 + r);
  shape.quadraticCurveTo(-innerX / 2, -innerY / 2, -innerX / 2 + r, -innerY / 2);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: innerZ,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: r,
    bevelThickness: r,
    curveSegments: 3,
  });
  // ExtrudeGeometry's depth is +z and its shape is x/y, as desired here.
  g.translate(0, 0, -sz / 2);
  g.computeVertexNormals();
  return g;
}

function lathe(c, key, points, radial = 24) {
  return geometry(c, key, () => new c.THREE.LatheGeometry(
    points.map(([r, axial]) => new c.THREE.Vector2(r, axial)), radial,
  ));
}

function springGeometry(c) {
  const curve = new c.THREE.Curve();
  curve.getPoint = (t, target = new c.THREE.Vector3()) => {
    const a = t * 4 * Math.PI * 2;
    return target.set(.11 * Math.cos(a), .37 * (t - .5), .11 * Math.sin(a));
  };
  return geometry(c, 'primary helical spring .11 .37 4', () => new c.THREE.TubeGeometry(
    curve, 32, .024, 7, false,
  ));
}

function brakeDisc(c, parent, x, y, z, side) {
  const disc = cylinder(c, parent, 'ventilated brake disc', .285, .045, [x, y, z], c.brake, 24, 'x');
  const ring = cylinder(c, parent, 'brake disc inner hub', .105, .058, [x + side * .012, y, z], c.steelBright, 16, 'x');
  ring.scale.set(1, 1, 1);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    cylinder(c, parent, 'brake disc ventilation boss', .018, .064, [x + side * .016, y + Math.sin(a) * .19, z + Math.cos(a) * .19], c.steelDark, 8, 'x');
  }
  return disc;
}

function makeWheel(c, parent, axle, x, z) {
  const THREE = c.THREE;
  const wheelProfile = [
    [.105, -.132], [.29, -.132], [.345, -.116], [.385, -.084],
    [.412, -.038], [.425, .012], [.428, .055], [.456, .082],
    [.47, .103], [.45, .128], [.39, .132], [.105, .132],
  ];
  const wheel = mesh(c, axle, 'profiled steel wheel with flange', lathe(c, 'profiled steel wheel .43', wheelProfile, 32), c.wheel);
  // The flange is on the positive axial side of the LatheGeometry profile;
  // mirror the axle rotation so each flange faces the track centreline.
  wheel.rotation.z = x < 0 ? -Math.PI / 2 : Math.PI / 2;
  wheel.position.x = x;
  const side = x < 0 ? -1 : 1;
  // The visible outer face sits outside the frame.  A separate hub and bolt
  // circle make the axle orientation legible at close camera distances.
  const faceX = x + side * .145;
  cylinder(c, axle, 'wheel hub cap', .125, .065, [faceX, 0, 0], c.wheelFace, 16, 'x');
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    cylinder(c, axle, 'wheel hub bolt', .018, .078, [faceX + side * .04, Math.sin(a) * .205, Math.cos(a) * .205], c.steelBright, 8, 'x');
  }
  if (side > 0) brakeDisc(c, axle, x - .118, 0, 0, side);
  return wheel;
}

function makeAxle(c, wheelAssembly, z, index) {
  const THREE = c.THREE;
  const axle = new THREE.Group();
  axle.name = `wheelset ${index + 1} axle at z ${z}`;
  axle.position.set(0, .43, z);
  wheelAssembly.add(axle);
  cylinder(c, axle, 'solid wheelset axle', .105, 1.92, [0, 0, 0], c.steelDark, 16, 'x');
  makeWheel(c, axle, axle, -.7175, 0);
  makeWheel(c, axle, axle, .7175, 0);
  return axle;
}

export function createBogie(THREE) {
  const c = context(THREE);
  const g = new THREE.Group();
  g.name = 'CAF Series 6 exposed bogie';
  g.userData.dimensions = { wheelRadius: .43, wheelCentersX: [-.7175, .7175], axleCentersZ: [-1, 1], railTopY: 0 };

  const wheelAssembly = new THREE.Group();
  wheelAssembly.name = 'rotating wheelset assembly';
  g.add(wheelAssembly);
  const wheelsets = [-1, 1].map((z, i) => makeAxle(c, wheelAssembly, z, i));

  // The side beams, end transoms, centre bolster and pivot describe the
  // exposed welded bogie frame around the wheelsets.
  for (const x of [-.88, .88]) {
    box(c, g, 'chamfered bogie side beam', [.18, .34, 2.34], [x, .77, 0], c.steel, .045);
    for (const z of [-1, 1]) {
      box(c, g, 'axle box with inspection cap', [.27, .37, .42], [x, .66, z], c.steelDark, .05);
      cylinder(c, g, 'axle box round cap', .105, .032, [x + Math.sign(x) * .145, .67, z], c.steelBright, 16, 'x');
    }
  }
  for (const z of [-1.03, 1.03]) box(c, g, 'bogie end transom', [1.76, .28, .18], [0, .73, z], c.steel, .035);
  box(c, g, 'central bolster', [1.36, .24, 1.16], [0, .98, 0], c.steelDark, .06);
  box(c, g, 'centre pivot plate', [.78, .13, .75], [0, 1.14, 0], c.steelBright, .045);
  cylinder(c, g, 'centre pivot pin', .15, .26, [0, 1.31, 0], c.steelDark, 20, 'y');
  // Secondary air springs between bolster and car body.
  for (const x of [-.53, .53]) {
    for (const z of [-.34, .34]) {
      cylinder(c, g, 'secondary suspension air spring', .14, .17, [x, 1.22, z], c.rubber, 16, 'y');
      cylinder(c, g, 'air spring upper collar', .16, .035, [x, 1.32, z], c.steelBright, 16, 'y');
    }
  }
  // Primary coil springs, dampers and motor/gear cases are deliberately
  // offset so that the wheel flanges remain visible from both sides.
  for (const x of [-.7, .7]) {
    for (const z of [-.78, .78]) {
      const spring = mesh(c, g, 'helical primary coil spring', springGeometry(c), c.spring);
      spring.position.set(x, .67, z);
      const damper = tubeBetween(c, g, 'angled primary damper', [x, .76, z], [x * .82, .38, z + Math.sign(z) * .12], .045, c.steelDark, 10);
      cylinder(c, g, 'damper rubber bellows', .07, .11, [damper.position.x, .54, damper.position.z], c.rubber, 12, 'y');
    }
  }
  for (const x of [-.49, .49]) {
    for (const z of [-.55, .55]) {
      box(c, g, 'longitudinal traction motor', [.30, .36, .83], [x, .43, z], c.steelDark, .055);
      cylinder(c, g, 'traction motor end cover', .13, .035, [x + (x < 0 ? -.17 : .17), .43, z], c.steelBright, 16, 'x');
      tubeBetween(c, g, 'motor gearcase link', [x, .54, z], [x * 1.1, .52, z + Math.sign(z) * .28], .055, c.steel, 9);
    }
  }
  // Brake rigging and a pair of clipped hoses add the fine black lines that
  // remain visible between the bright wheels and frame.
  for (const z of [-1, 1]) {
    tubeBetween(c, g, 'brake cross shaft', [-.8, .54, z], [.8, .54, z], .034, c.steelDark, 8);
    for (const x of [-.72, .72]) tubeBetween(c, g, 'brake caliper arm', [x, .55, z], [x, .56, z + Math.sign(z) * .18], .026, c.steelBright, 8);
  }
  tubeBetween(c, g, 'bogie brake pipe left', [-.95, .42, -1.05], [-.95, .42, 1.05], .024, c.hose, 8);
  tubeBetween(c, g, 'bogie brake pipe right', [.95, .42, -1.05], [.95, .42, 1.05], .024, c.hose, 8);

  let wheelAngle = 0;
  g.userData.wheelAssembly = wheelAssembly;
  g.userData.update = (dt = .016, speed = 0) => {
    const step = Number.isFinite(Number(dt)) ? Math.max(0, Math.min(.1, Number(dt))) : 0;
    const velocity = Number.isFinite(Number(speed)) ? Number(speed) : 0;
    wheelAngle += velocity * step / .43;
    for (const wheelset of wheelsets) wheelset.rotation.x = wheelAngle;
    g.userData.wheelRotation = wheelAngle;
    return g;
  };
  return g;
}

function roofFan(c, parent, x, y, z) {
  cylinder(c, parent, 'recessed HVAC fan well', .39, .022, [x, y, z], c.dark, 32, 'y');
  cylinder(c, parent, 'HVAC fan rim', .43, .026, [x, y + .012, z], c.steelBright, 32, 'y');
  cylinder(c, parent, 'HVAC fan hub', .075, .05, [x, y + .038, z], c.steelDark, 16, 'y');
  for (let i = 0; i < 6; i++) {
    const blade = box(c, parent, 'rounded HVAC fan blade', [.055, .018, .27], [x, y + .045, z + .14], c.vent, .018);
    blade.rotation.y = i * Math.PI / 3;
  }
}

export function createRoofEquipment(THREE) {
  const c = context(THREE);
  const g = new THREE.Group();
  g.name = 'CAF Series 6 rounded roof HVAC equipment';
  g.userData.dimensions = { width: 1.6, length: 2.4, height: .3 };
  box(c, g, 'low rounded HVAC housing', [1.6, .26, 2.4], [0, .16, 0], c.steelBright, .095);
  box(c, g, 'HVAC upper service lid', [1.42, .055, 2.15], [0, .315, 0], c.steel, .03);
  // Rounded transverse ribs catch highlights like the folded CAF roof sheets.
  for (const z of [-.96, -.48, 0, .48, .96]) {
    box(c, g, 'rounded HVAC roof rib', [1.48, .045, .07], [0, .35, z], c.steelBright, .02);
  }
  for (const x of [-.56, .56]) box(c, g, 'HVAC longitudinal seam', [.04, .03, 2.15], [x, .36, 0], c.steel, .015);
  // Slats on both long sides are slightly recessed behind a perimeter rail.
  for (const x of [-.806, .806]) {
    box(c, g, 'HVAC side vent perimeter', [.035, .16, 2.06], [x, .17, 0], c.steelDark, .02);
    for (let i = -5; i <= 5; i++) box(c, g, 'HVAC side vent slat', [.025, .095, .145], [x + (x < 0 ? .025 : -.025), .19, i * .17], c.vent, .018);
  }
  // End vents and a recessed fan remain visible from a roof or elevated view.
  for (const z of [-1.15, 1.15]) {
    box(c, g, 'HVAC end vent frame', [1.26, .14, .035], [0, .18, z], c.steelDark, .018);
    for (let i = -4; i <= 4; i++) box(c, g, 'HVAC end vent slat', [.12, .10, .025], [i * .14, .19, z + (z < 0 ? .021 : -.021)], c.vent, .012);
  }
  roofFan(c, g, 0, .322, .42);
  // Compact electrical isolators at the opposite end, kept low to preserve
  // the subdued roof silhouette.
  for (const x of [-.38, .38]) {
    cylinder(c, g, 'roof electrical isolator', .055, .11, [x, .42, -.73], c.steelDark, 12, 'y');
    cylinder(c, g, 'roof isolator cap', .075, .025, [x, .485, -.73], c.red, 12, 'y');
  }
  return g;
}

function couplerHose(c, parent, side) {
  const THREE = c.THREE;
  const points = [
    new THREE.Vector3(side * .16, .105, -.275),
    new THREE.Vector3(side * .21, .07, -.19),
    new THREE.Vector3(side * .24, .08, .02),
    new THREE.Vector3(side * .18, .18, .24),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const key = 'coupler air hose curve';
  // The same curve shape can be shared; mirrored hose geometry is safe as its
  // curve points are generated independently below when the sign differs.
  const hose = mesh(c, parent, 'articulated brake airline hose', geometry(c, `${key}:${side}`, () => new THREE.TubeGeometry(curve, 18, .018, 7, false)), c.hose);
  return hose;
}

export function createCoupler(THREE) {
  const c = context(THREE);
  const g = new THREE.Group();
  g.name = 'CAF Series 6 Scharfenberg coupler';
  g.userData.dimensions = { width: .55, height: .4, length: .65 };
  // The origin is the coupler mounting datum at y=0,z=0.  The head projects
  // toward -z and the support articulates back toward the car at +z.
  box(c, g, 'articulated coupler drawbar', [.28, .20, .42], [0, .17, .17], c.steelDark, .055);
  box(c, g, 'coupler yaw joint', [.40, .25, .20], [0, .20, .34], c.steel, .06);
  cylinder(c, g, 'coupler pivot pin', .085, .34, [0, .23, .32], c.steelBright, 16, 'x');
  box(c, g, 'compact Scharfenberg head', [.55, .34, .25], [0, .25, -.13], c.steelBright, .06);
  box(c, g, 'coupler black face insert', [.46, .25, .035], [0, .25, -.272], c.dark, .035);
  // Twin circular sockets and their surrounding metal rings are the most
  // characteristic close-up feature of this compact coupler head.
  for (const x of [-.135, .135]) {
    cylinder(c, g, 'coupler socket rubber recess', .072, .028, [x, .25, -.295], c.rubber, 20, 'z');
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.082, .014, 8, 20), c.steelBright);
    ring.name = 'coupler socket chamfer ring';
    ring.position.set(x, .25, -.316);
    g.add(ring);
  }
  cylinder(c, g, 'central coupler latch', .055, .035, [0, .25, -.302], c.red, 16, 'z');
  for (const [x, y] of [[-.215, .105], [.215, .105], [-.215, .395], [.215, .395]]) {
    cylinder(c, g, 'coupler face bolt', .018, .045, [x, y, -.3], c.steelDark, 10, 'z');
  }
  box(c, g, 'lower coupler catcher', [.23, .08, .18], [0, .06, -.12], c.steelDark, .025);
  couplerHose(c, g, -1);
  couplerHose(c, g, 1);
  // A small red emergency handle hangs below the face, matching the exposed
  // service hardware visible in the supplied front reference.
  tubeBetween(c, g, 'coupler emergency handle stem', [.14, .16, -.29], [.19, .075, -.33], .018, c.red, 8);
  cylinder(c, g, 'coupler emergency handle', .024, .10, [.22, .06, -.33], c.red, 10, 'x');
  return g;
}

/**
 * Release the shared cache after the owning train and every hardware group
 * have been removed.  This is intentionally module-wide: fourteen bogies can
 * share one wheel, spring, frame and fastener geometry safely.
 */
export function disposeTrainHardware(THREE) {
  const c = THREE_CONTEXTS.get(THREE);
  if (!c) return;
  for (const g of c.geometries.values()) g.dispose?.();
  for (const m of c.materials.values()) m.dispose?.();
  THREE_CONTEXTS.delete(THREE);
}
