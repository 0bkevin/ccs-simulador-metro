/*
 * CAF Series 6 / Metro de Caracas exterior identity decals.
 *
 * These are transparent canvas textures intended to sit a few millimetres
 * above the silver cab side and side panel.  UV orientation is explicit:
 * U=0 is the front end of the plane, U=1 is toward the rear, V=0 is the
 * bottom edge and V=1 is the roof/window edge.  For the cab artwork, place a
 * 2.6 m (U) x 1.4 m (V) plane over the cab side below the driver window; the
 * transparent margin leaves the silver shell visible around the ribbon.
 */

const textureCache = new WeakMap();

function cacheFor(THREE) {
  let cache = textureCache.get(THREE);
  if (!cache) {
    cache = {};
    textureCache.set(THREE, cache);
  }
  return cache;
}

function canvasFor(width, height) {
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  return null;
}

function fallbackTexture(THREE, metadata) {
  const data = new Uint8Array([0, 0, 0, 0]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.userData = { ...metadata, canvasFallback: true };
  return texture;
}

function finishTexture(THREE, canvas, metadata) {
  if (!canvas) return fallbackTexture(THREE, metadata);
  const texture = new THREE.CanvasTexture(canvas);
  if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData = metadata;
  return texture;
}

function bezierPath(ctx, start, curves) {
  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  for (const curve of curves) ctx.bezierCurveTo(...curve);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx, x, y, outer, inner, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + i * Math.PI / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawFlagRibbon(ctx, width, height) {
  // Keep the graphic in the middle of the transparent canvas so a decal plane
  // can be scaled or clipped against the cab window and red nose naturally.
  const sx = width / 2048;
  const sy = height / 1024;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Red is the lower sweep and is laid down first so the blue and yellow
  // ribbons retain clean, anti-aliased shared edges.
  ctx.fillStyle = '#d9282f';
  bezierPath(ctx, [116, 407], [
    [327, 493, 423, 704, 699, 823],
    [1018, 960, 1436, 899, 1880, 699],
    [1574, 1010, 1070, 1040, 656, 934],
    [360, 858, 253, 615, 116, 520],
  ]);

  ctx.fillStyle = '#154f9b';
  bezierPath(ctx, [143, 324], [
    [371, 433, 482, 607, 716, 704],
    [1028, 833, 1388, 799, 1788, 634],
    [1520, 877, 1066, 938, 684, 822],
    [417, 738, 314, 518, 143, 432],
  ]);

  ctx.fillStyle = '#f4c51f';
  bezierPath(ctx, [124, 133], [
    [376, 188, 414, 378, 621, 492],
    [859, 623, 1192, 654, 1862, 538],
    [1560, 744, 1082, 812, 703, 681],
    [403, 578, 294, 362, 124, 300],
  ]);

  // Eight small white stars sit along the blue band, following its rising
  // curve.  They remain sparse and contained inside the flag artwork.
  ctx.fillStyle = '#fff8e8';
  const stars = [
    [530, 555], [605, 608], [687, 658], [778, 690],
    [876, 710], [980, 720], [1086, 714], [1192, 694],
  ];
  stars.forEach(([x, y]) => drawStar(ctx, x, y, 16, 6.6));

  // A compact blue leading field makes the ribbon read as a flag motif where
  // it curls up toward the driver-side sill, while retaining a silver margin.
  ctx.fillStyle = '#164c97';
  bezierPath(ctx, [116, 137], [
    [157, 217, 207, 281, 285, 329],
    [359, 374, 400, 416, 426, 451],
    [326, 404, 226, 329, 116, 251],
    [88, 211, 95, 165, 116, 137],
  ]);
  ctx.fillStyle = '#f4c51f';
  bezierPath(ctx, [116, 132], [
    [161, 189, 213, 252, 300, 302],
    [360, 338, 399, 380, 427, 430],
    [359, 392, 265, 317, 116, 227],
    [91, 195, 99, 151, 116, 132],
  ]);
  ctx.restore();
}

/**
 * Transparent 2048x1024 cab-side flag ribbon.  The returned CanvasTexture is
 * cached per injected THREE namespace and can be reused by both side planes.
 */
export function createCabLiveryTexture(THREE) {
  const cache = cacheFor(THREE);
  if (cache.cab) return cache.cab;
  const metadata = {
    kind: 'cab-side Venezuelan flag ribbon',
    width: 2048,
    height: 1024,
    uv: 'U front-to-back; V bottom-to-top',
    recommendedPlane: { width: 2.6, height: 1.4, placement: 'cab side below driver window' },
  };
  const canvas = canvasFor(metadata.width, metadata.height);
  if (canvas) drawFlagRibbon(canvas.getContext('2d'), metadata.width, metadata.height);
  cache.cab = finishTexture(THREE, canvas, metadata);
  return cache.cab;
}

function drawMetroMark(ctx, width, height) {
  const sx = width / 512;
  const sy = height / 256;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#b7262d';
  ctx.fillStyle = '#b7262d';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(110, 128, 67, 0, Math.PI * 2);
  ctx.stroke();
  // Simplified M-shaped transit mark inside the ring.
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(72, 153);
  ctx.lineTo(72, 105);
  ctx.lineTo(110, 137);
  ctx.lineTo(148, 105);
  ctx.lineTo(148, 153);
  ctx.stroke();
  ctx.font = 'italic 62px Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Metro', 185, 128);
  ctx.restore();
}

/**
 * Transparent 512x256 small red Metro emblem for the silver side panel.
 * Keep this decal physically small; it is an exterior identity cue rather
 * than a destination display or a large piece of body graphics.
 */
export function createMetroMarkTexture(THREE) {
  const cache = cacheFor(THREE);
  if (cache.metro) return cache.metro;
  const metadata = {
    kind: 'Metro side identity mark',
    width: 512,
    height: 256,
    uv: 'U front-to-back; V bottom-to-top',
    recommendedPlane: { width: .42, height: .21, placement: 'centre of silver side panel' },
  };
  const canvas = canvasFor(metadata.width, metadata.height);
  if (canvas) drawMetroMark(canvas.getContext('2d'), metadata.width, metadata.height);
  cache.metro = finishTexture(THREE, canvas, metadata);
  return cache.metro;
}

