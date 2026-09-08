import study from '../public/models/station-specs.json' with { type: 'json' };
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/** Load the reviewed Blender export used by every browser view.
 *
 * Keeping manifest validation here makes a missing/stale export visible to the
 * user instead of silently switching to the former procedural scene.
 */
export async function loadBlenderAssets({ base = "/models/blender", onProgress, includeTrain = true, includeEnvironment = true } = {}) {
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
  if (manifest.stations.length !== 5 || manifest.stations.some((stop, index) => stop.id !== study.stations[index].id || Number(stop.distance) !== study.stations[index].distance)) {
    throw new Error("La exportación Blender no coincide con las cinco estaciones del estudio a escala. Reconstruye y exporta el entorno.");
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
    includeEnvironment ? load(environmentPath, "entorno Blender") : Promise.resolve(null),
  ]);
  return {
    manifest,
    train: train?.scene ?? null,
    environment: environment?.scene ?? null,
    source: `Blender · ${manifest.source.sha256}`,
  };
}

export default loadBlenderAssets;
