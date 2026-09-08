import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/** Load the reviewed Blender export used by every browser view.
 *
 * Keeping manifest validation here makes a missing/stale export visible to the
 * user instead of silently switching to the former procedural scene.
 */
export async function loadBlenderAssets({ base = "/models/blender", onProgress, includeTrain = true } = {}) {
  const manifestUrl = `${base.replace(/\/$/, "")}/manifest.json`;
  const manifestResponse = await fetch(manifestUrl, { cache: "no-store" });
  if (!manifestResponse.ok) throw new Error(`No se pudo cargar ${manifestUrl} (${manifestResponse.status})`);
  const manifest = await manifestResponse.json();
  const assets = manifest.assets || {};
  const trainPath = assets.train?.path;
  const environmentPath = assets.environment?.path;
  if (!manifest.source?.sha256 || !manifest.source?.file || !manifest.train || manifest.train.carCount !== 7 || !trainPath || !environmentPath || !Array.isArray(manifest.stations)) {
    throw new Error("manifest.json no contiene el contrato Blender esperado (source, assets, train.carCount=7 y stations).");
  }
  if (manifest.stations.length !== 5 || manifest.stations.some((stop, index) => Number(stop.distance) !== index * 160)) {
    throw new Error("La exportación Blender debe declarar cinco paradas a 0, 160, 320, 480 y 640 m.");
  }
  const loader = new GLTFLoader();
  const resolveAssetUrl = (path) => path.startsWith("/") ? path : path.startsWith("models/") ? `/${path}` : `${base.replace(/\/$/, "")}/${path}`;
  const load = (path, label) => new Promise((resolve, reject) => {
    const url = resolveAssetUrl(path);
    loader.load(`${url}${url.includes("?") ? "&" : "?"}source=${manifest.source.sha256}`, resolve, (event) => {
      if (onProgress && event.total) onProgress(label, event.loaded / event.total);
    }, (error) => reject(new Error(`No se pudo cargar ${label} (${path}): ${error?.message || error}`)));
  });
  const [train, environment] = await Promise.all([
    includeTrain ? load(trainPath, "tren Blender") : Promise.resolve(null),
    load(environmentPath, "entorno Blender"),
  ]);
  return {
    manifest,
    train: train?.scene ?? null,
    environment: environment.scene,
    source: `Blender · ${manifest.source.sha256}`,
  };
}

export default loadBlenderAssets;
