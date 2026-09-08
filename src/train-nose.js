/*
 * CAF Series 6 cab nose, in metres.
 *
 * The group origin is the rounded nose tip datum at rail level and the
 * positive local z direction is forward.  The complete red fiberglass face is
 * a curved XY surface, with a swept boundary shell joining the body at
 * z=-2.8.  Windows, lamps, destination glass, apron and wipers all sample the
 * same surface function, so there are no flat plates floating in front of the
 * nose.  `rear: true` mirrors the finished assembly in z for a rear cab.
 */

const NOSE_CONTEXTS = new WeakMap();

function context(THREE) {
  let c = NOSE_CONTEXTS.get(THREE);
  if (c) return c;
  const materials = new Map();
  const material = (key, color, options = {}) => {
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .48, metalness: .35, ...options }));
    return materials.get(key);
  };
  c = {
    THREE,
    materials,
    red: material('nose red fiberglass', 0xd9242c, { roughness: .32, metalness: .18 }),
    redEdge: material('nose red edge', 0xa51922, { roughness: .4, metalness: .22 }),
    black: material('nose black mask', 0x0b1114, { roughness: .74, metalness: .12 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x102a37, roughness: .12, metalness: .25, transmission: .12, transparent: true, opacity: .86, side: THREE.FrontSide }),
    glassReflection: new THREE.MeshBasicMaterial({ color: 0x76909a, transparent: true, opacity: .18, depthWrite: false }),
    silver: material('nose lower silver apron', 0xd3d8d6, { roughness: .3, metalness: .76 }),
    silverShade: material('nose apron shadow', 0x8d999c, { roughness: .4, metalness: .7 }),
    whiteLamp: new THREE.MeshStandardMaterial({ color: 0xf6f2dd, roughness: .18, metalness: .18, emissive: 0xd8cda9, emissiveIntensity: .32 }),
    redLamp: material('nose red lamp lens', 0xd83a37, { roughness: .2, metalness: .25, emissive: 0x3d0607, emissiveIntensity: .25 }),
    amber: new THREE.MeshBasicMaterial({ color: 0xffb526, transparent: true, depthWrite: false, toneMapped: false }),
    wiper: material('windshield wiper rubber', 0x111719, { roughness: .85, metalness: .1 }),
  };
  c.destination = null;
  NOSE_CONTEXTS.set(THREE, c);
  return c;
}

function mesh(THREE, parent, name, geometry, material) {
  const o = new THREE.Mesh(geometry, material);
  o.name = name;
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}

function surfaceZ(x, y) {
  const vertical = Math.max(0, Math.min(1, (y - .5) / 3.08));
  const side = Math.min(1, Math.abs(x) / 1.5);
  // Top rake is deeper than the lower apron; the cheeks also sweep back.
  return -.025 - .61 * Math.pow(vertical, 1.35) - .34 * side * side * (.28 + .72 * vertical);
}

function surfacePoint(THREE, x, y, lift = .008) {
  return new THREE.Vector3(x, y, surfaceZ(x, y) + lift);
}

function surfaceNormal(THREE, x, y) {
  const e = .001;
  const dzdx = (surfaceZ(x + e, y) - surfaceZ(x - e, y)) / (2 * e);
  const dzdy = (surfaceZ(x, y + e) - surfaceZ(x, y - e)) / (2 * e);
  return new THREE.Vector3(-dzdx, -dzdy, 1).normalize();
}

function superellipseShape(THREE, cx = 0, cy = 2.05, rx = 1.5, ry = 1.55, exponent = 3.35) {
  const shape = new THREE.Shape();
  const samples = 72;
  for (let i = 0; i <= samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const x = cx + rx * Math.sign(cos) * Math.pow(Math.abs(cos), 2 / exponent);
    const y = cy + ry * Math.sign(sin) * Math.pow(Math.abs(sin), 2 / exponent);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function roundedRectShape(THREE, cx, cy, width, height, radius) {
  const x0 = cx - width / 2, x1 = cx + width / 2;
  const y0 = cy - height / 2, y1 = cy + height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x0 + r, y0);
  shape.lineTo(x1 - r, y0); shape.quadraticCurveTo(x1, y0, x1, y0 + r);
  shape.lineTo(x1, y1 - r); shape.quadraticCurveTo(x1, y1, x1 - r, y1);
  shape.lineTo(x0 + r, y1); shape.quadraticCurveTo(x0, y1, x0, y1 - r);
  shape.lineTo(x0, y0 + r); shape.quadraticCurveTo(x0, y0, x0 + r, y0);
  return shape;
}

function ellipseShape(THREE, cx, cy, rx, ry, samples = 32) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function lowerApronShape(THREE) {
  // Lower silver follows the rounded superellipse perimeter instead of
  // extending as a rectangular plate beyond the nose's narrow bottom tip.
  const shape = new THREE.Shape();
  const s = (.90 - 2.05) / 1.55;
  const leftEnd = -Math.PI - Math.asin(s);
  const rightEnd = Math.asin(s);
  const point = (theta) => [
    1.5 * Math.sign(Math.cos(theta)) * Math.pow(Math.abs(Math.cos(theta)), 2 / 3.35),
    2.05 + 1.55 * Math.sign(Math.sin(theta)) * Math.pow(Math.abs(Math.sin(theta)), 2 / 3.35),
  ];
  const bottom = point(-Math.PI / 2);
  shape.moveTo(bottom[0], bottom[1]);
  for (let i = 1; i <= 28; i++) {
    const theta = -Math.PI / 2 + (leftEnd + Math.PI / 2) * i / 28;
    const p = point(theta); shape.lineTo(p[0], p[1]);
  }
  const left = point(leftEnd);
  shape.lineTo(left[0], .90);
  shape.lineTo(-left[0], .90);
  for (let i = 1; i <= 28; i++) {
    const theta = rightEnd + (-Math.PI / 2 - rightEnd) * i / 28;
    const p = point(theta); shape.lineTo(p[0], p[1]);
  }
  shape.closePath();
  return shape;
}

function shapeOnSurface(THREE, shape, lift = .01) {
  // ShapeGeometry triangulates a planar outline with long interior chords.
  // Warping those chords onto the nose creates visible red triangles and can
  // make a glass panel cut through the face.  Triangulate in XY, recursively
  // split any edge over 12 cm, then sample z at every generated vertex.
  const contour = shape.extractPoints(4).shape;
  const triangles = THREE.ShapeUtils.triangulateShape(contour, []);
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const edgeLimit = .12;
  const bounds = contour.reduce((b, p) => ({ minX: Math.min(b.minX, p.x), maxX: Math.max(b.maxX, p.x), minY: Math.min(b.minY, p.y), maxY: Math.max(b.maxY, p.y) }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  const addTriangle = (a, b, c, depth = 0) => {
    const ab = a.distanceTo(b), bc = b.distanceTo(c), ca = c.distanceTo(a);
    if (depth < 8 && Math.max(ab, bc, ca) > edgeLimit) {
      const abm = a.clone().add(b).multiplyScalar(.5);
      const bcm = b.clone().add(c).multiplyScalar(.5);
      const cam = c.clone().add(a).multiplyScalar(.5);
      addTriangle(a, abm, cam, depth + 1);
      addTriangle(abm, b, bcm, depth + 1);
      addTriangle(cam, bcm, c, depth + 1);
      addTriangle(abm, bcm, cam, depth + 1);
      return;
    }
    const base = positions.length / 3;
    for (const p of [a, b, c]) {
      positions.push(p.x, p.y, surfaceZ(p.x, p.y) + lift);
      const n = surfaceNormal(THREE, p.x, p.y);
      normals.push(n.x, n.y, n.z);
      // Three's CanvasTexture uses the conventional bottom-to-top V mapping.
      uvs.push((p.x - bounds.minX) / Math.max(.001, bounds.maxX - bounds.minX), (p.y - bounds.minY) / Math.max(.001, bounds.maxY - bounds.minY));
    }
    indices.push(base, base + 1, base + 2);
  };
  for (const tri of triangles) {
    let a = contour[tri[0]], b = contour[tri[1]], c = contour[tri[2]];
    if ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) < 0) [b, c] = [c, b];
    addTriangle(a, b, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function panel(THREE, parent, name, shape, material, lift = .01) {
  return mesh(THREE, parent, name, shapeOnSurface(THREE, shape, lift), material);
}

function transitionShell(THREE) {
  const outline = [];
  const samples = 96;
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const cos = Math.cos(a), sin = Math.sin(a), exponent = 3.35;
    outline.push([
      1.5 * Math.sign(cos) * Math.pow(Math.abs(cos), 2 / exponent),
      2.05 + 1.55 * Math.sign(sin) * Math.pow(Math.abs(sin), 2 / exponent),
    ]);
  }
  const rings = 6;
  const positions = [];
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    for (const [x, y] of outline) {
      const front = surfaceZ(x, y);
      positions.push(x * (1 - .015 * t), y, front + (-2.8 - front) * t);
    }
  }
  const indices = [];
  for (let r = 0; r < rings; r++) {
    for (let i = 0; i < samples; i++) {
      const j = (i + 1) % samples;
      const a = r * samples + i;
      const b = r * samples + j;
      const d = (r + 1) * samples + i;
      const c = (r + 1) * samples + j;
      // Reversed winding gives outward normals: the swept shell lies behind
      // the curved front and its exterior points away from the car interior.
      indices.push(a, d, b, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeDestinationCanvas(text = 'PALO VERDE') {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '700 132px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,145,20,.35)'; ctx.shadowBlur = 13;
  ctx.fillStyle = '#ffb52e';
  ctx.fillText(String(text).slice(0, 18).toUpperCase(), 512, 160);
  ctx.shadowBlur = 0;
  // A fine segmented baseline keeps it reading as an LED destination glass.
  ctx.fillStyle = 'rgba(255,177,45,.82)';
  for (let x = 214; x < 812; x += 20) ctx.fillRect(x, 260, 11, 4);
  return canvas;
}

function makeDestinationTexture(THREE, c, text) {
  const canvas = makeDestinationCanvas(text);
  if (!canvas) {
    const data = new Uint8Array([0, 0, 0, 0]);
    return { texture: new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat), canvas: null };
  }
  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, canvas };
}

function pathTube(THREE, parent, name, points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), radius, 7, false);
  return mesh(THREE, parent, name, geometry, material);
}

function makeWipers(THREE, g, glassY0) {
  // The reference has one asymmetric double-link wiper, hinged low on the
  // driver's side, rather than a mirrored pair of eyebrows.
  const pivot = surfacePoint(THREE, -.67, glassY0 + .04, .035);
  const elbow = surfacePoint(THREE, -.72, 2.08, .039);
  const bladeEnd = surfacePoint(THREE, -.05, 2.57, .042);
  pathTube(THREE, g, 'conforming windshield wiper double link', [pivot, elbow, bladeEnd], .018, context(THREE).wiper);
  const blade = [
    surfacePoint(THREE, -.05, 2.57, .045),
    surfacePoint(THREE, .24, 2.54, .045),
    surfacePoint(THREE, .53, 2.43, .045),
  ];
  pathTube(THREE, g, 'conforming windshield wiper blade', blade, .026, context(THREE).wiper);
}

export function createCAFNose(THREE, { destination = 'PALO VERDE', rear = false } = {}) {
  const c = context(THREE);
  const g = new THREE.Group();
  g.name = `CAF Series 6 ${rear ? 'rear' : 'front'} cab nose`;
  g.userData.surfaceAt = (x, y, lift = 0) => surfacePoint(THREE, x, y, lift);
  g.userData.dimensions = { width: 3, railFloorY: 0, roofY: 3.58, bodyJoinZ: -2.8, windshield: [2.23, 1.6225], destinationGlass: [1.957, .5635], lampCover: [.619, .442] };

  const opaqueCabSurfaces = [];
  const redFace = panel(THREE, g, 'continuous curved red fiberglass cab face', superellipseShape(THREE), c.red, 0);
  opaqueCabSurfaces.push(redFace);
  const shell = mesh(THREE, g, 'swept red nose cheek shell to body joint', transitionShell(THREE), c.red);
  opaqueCabSurfaces.push(shell);

  // One broad flush mask continues down around the lamps, as on the CAF nose,
  // while a red perimeter remains visible at the cheeks and roof.
  panel(THREE, g, 'continuous rounded black windshield and lamp mask', roundedRectShape(THREE, 0, 2.28, 2.66, 2.40, .42), c.black, .014);
  panel(THREE, g, 'large curved CAF windshield glass', roundedRectShape(THREE, 0, 2.17, 2.23, 1.6225, .17), c.glass, .028);
  // A restrained reflection strip follows the top edge without obscuring the
  // cab interior view.
  panel(THREE, g, 'windshield upper reflection', roundedRectShape(THREE, 0, 2.81, 1.86, .10, .035), c.glassReflection, .04);

  // Destination glass is amber canvas lettering in a black recess, with no
  // opaque yellow pill behind it.
  panel(THREE, g, 'destination black recess', roundedRectShape(THREE, 0, 3.22, 2.12, .62, .25), c.black, .017);
  const destinationData = makeDestinationTexture(THREE, c, destination);
  const destinationMaterial = new THREE.MeshBasicMaterial({ map: destinationData.texture, transparent: true, depthWrite: false, toneMapped: false });
  const destinationGlass = panel(THREE, g, 'amber destination glass PALO VERDE', roundedRectShape(THREE, 0, 3.22, 1.957, .5635, .10), destinationMaterial, .035);

  const lampY = 1.18;
  for (const side of [-1, 1]) {
    const x = side * .92;
    panel(THREE, g, 'tapered black lower lamp housing', roundedRectShape(THREE, x, lampY, .619, .442, .12), c.black, .019);
    panel(THREE, g, 'standalone circular white headlamp lens', ellipseShape(THREE, x + side * .115, lampY + .005, .10, .10), c.whiteLamp, .035);
    panel(THREE, g, 'standalone circular red lamp lens', ellipseShape(THREE, x - side * .115, lampY + .005, .05, .05), c.redLamp, .043);
  }

  // Lower silver apron is split around a real central U-notch.  The black
  // recess behind it remains visible when the mechanical coupler is attached.
  const apron = panel(THREE, g, 'silver lower apron following rounded nose', lowerApronShape(THREE), c.silver, .022);
  opaqueCabSurfaces.push(apron);
  panel(THREE, g, 'thin black lower apron lip', roundedRectShape(THREE, 0, .87, 2.15, .09, .025), c.black, .032);
  panel(THREE, g, 'central coupler U-notch recess', roundedRectShape(THREE, 0, .64, .72, .31, .10), c.black, .034);
  g.userData.couplerMount = surfacePoint(THREE, 0, .63, .065);
  g.userData.couplerRotationY = Math.PI;

  makeWipers(THREE, g, 1.79);

  let destinationText = String(destination).toUpperCase();
  g.userData.setDestination = (next = 'PALO VERDE') => {
    destinationText = String(next).slice(0, 18).toUpperCase();
    const fresh = makeDestinationTexture(THREE, c, destinationText);
    destinationGlass.material.map?.dispose?.();
    destinationGlass.material.map = fresh.texture;
    destinationGlass.material.needsUpdate = true;
    c.destination = fresh;
    g.userData.destination = destinationText;
    return destinationText;
  };
  g.userData.destination = destinationText;
  g.userData.opaqueCabSurfaces = opaqueCabSurfaces;
  g.userData.opaqueSurfaces = opaqueCabSurfaces;
  // A true 180° yaw keeps the rear destination lettering readable from the
  // rear camera.  Negative z scale mirrors the canvas glyphs into backwards
  // text even though it visually points the nose the right way.
  if (rear) g.rotation.y = Math.PI;
  return g;
}
