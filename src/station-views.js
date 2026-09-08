import study from '../public/models/station-specs.json' with { type: 'json' };

// One dimensional schedule is shared with Blender and the GLB exporter.
export const stationViews = study.stations;
export const tunnelStudy = study.tunnel;
export const routeStudy = study.route;

export function getTunnelRange(index) {
  const station = stationViews[index];
  return { start: station.distance + 5, end: stationViews[index + 1]?.distance - 145 || routeStudy.end };
}

export function getStationView(index, kind = 'platform', aspect = 1) {
  index = Math.max(0, Math.min(stationViews.length - 1, Number(index) || 0));
  const station = stationViews[index];
  const views = ['platform', 'detail', ...(index ? ['concourse'] : []), ...(station.context ? ['entrance'] : []), ...(index === 4 ? ['south'] : []), 'plan', 'section', 'tunnel'];
  if (!views.includes(kind)) kind = 'platform';
  const exterior = kind === 'entrance' || kind === 'south';
  const x = station.platformLayout === 'island' ? 5 : index === 1 ? -6 : -3.9;
  const z = station.distance, core = z + station.coreOffset;
  let position, target, clip = null, clipEnd = null;
  if (kind === 'plan') {
    position = [station.railCenters[1] / 2, 132 / Math.max(.3, aspect), core + .01];
    target = [station.railCenters[1] / 2, 0, core];
    clip = { normal: [0, -1, 0], constant: 3.15 };
  } else if (kind === 'section') {
    position = [-13, 9, core - 14]; target = [station.railCenters[1] / 2, 3.8, core + 3];
    clip = { normal: [0, 0, 1], constant: -core };
    clipEnd = { normal: [0, 0, -1], constant: core + 14 };
  } else if (kind === 'tunnel') {
    const range = getTunnelRange(index);
    const sample = range.start + (index === 0 ? 135 : index === 4 ? 28 : 90);
    position = [0, 2.5, sample]; target = [0, 2.15, sample + 18];
  } else if (kind === 'south') {
    position = [47, 15, z - 35]; target = [37, 6.1, z - 55];
  } else if (kind === 'entrance' && index === 0) {
    position = [-24, 6, z - 109]; target = [-8, 1, z - 83];
  } else if (kind === 'entrance' && index === 4) {
    position = [-17, 13.2, z - 43]; target = [1, 6.8, z - 55];
  } else if (kind === 'entrance') {
    position = [-.5, 11.2, z - 73]; target = [-10, 10.3, z - 58];
  } else if (kind === 'concourse') {
    const cx = station.platformLayout === 'island' ? 5 : 2;
    position = [cx, 6.73, core + (index === 3 ? 34 : 15.5)];
    target = [cx, 6.6, core + (index === 3 ? 50 : 31)];
  } else if (kind === 'detail' && index === 0) {
    position = [-3.3, 3, core - 5]; target = [-7.13, 3.6, core + 2];
  } else {
    position = [x, 2.73, core - (kind === 'detail' ? 7.5 : 14)]; target = [x, 2.98, core + 1];
  }
  const collection = kind === 'tunnel' ? `Tunnel ${station.id}` : exterior ? station.context : `Station ${station.name}`;
  const collections = [collection];
  if (kind === 'tunnel') collections.push(`Station ${station.name}`, ...(stationViews[index + 1] ? [`Station ${stationViews[index + 1].name}`] : []));
  if (kind === 'entrance' && index === 0) collections.push(`Station ${station.name}`);
  if (index === 0 && ['platform', 'detail'].includes(kind)) collections.push(station.context);
  return { kind, views, exterior, position, target, clip, clipEnd, up: kind === 'plan' ? [1, 0, 0] : [0, 1, 0], fov: kind === 'plan' ? 65 : exterior ? 57 : 68, collection, collections };
}
