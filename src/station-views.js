// The simulator and the standalone viewer frame the same native architecture.
// Coordinates follow the Y-up Blender scene, not a second station model.
export const stationViews = [
  { id: "cano-amarillo", name: "Caño Amarillo", distance: 0, detail: "Cubierta espacial amarilla, celosías abiertas de concreto y andenes laterales.", reference: "https://fundaayc.com/2014/07/21/1983-estacion-cano-amarillo/" },
  { id: "capitolio", name: "Capitolio", distance: 160, detail: "Vestíbulo de escaleras, pilares de concreto y mezzanina de cerámica amarilla.", reference: "https://www.urbanrail.net/am/cara/pix/caracas-gallery2.htm" },
  { id: "bellas-artes", name: "Bellas Artes", distance: 320, detail: "Andén central y acceso de Avenida México con descansillo semicircular.", context: "Bellas Artes cultural context", reference: "https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm" },
  { id: "plaza-venezuela", name: "Plaza Venezuela", distance: 480, detail: "Andenes de Línea 1, columnata y acceso de transferencia a los niveles inferiores.", reference: "https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm" },
  { id: "altamira", name: "Altamira", distance: 640, detail: "Andén central, mezzaninas y acceso de Plaza Francia perpendicular a las vías.", context: "Altamira Plaza entrance", reference: "https://fundaayc.com/2024/07/14/algo-mas-sobre-la-postal-no-411/" },
];

export function getStationView(index, kind = "platform") {
  const station = stationViews[index];
  const views = ["platform", "detail", ...(index ? ["concourse"] : []), ...(station.context ? ["entrance"] : []), ...(index === 4 ? ["south"] : [])];
  if (!views.includes(kind)) kind = "platform";
  const exterior = kind === "entrance" || kind === "south";
  const x = [2, 4].includes(index) ? 5 : index === 1 ? -6 : -3.9;
  const z = station.distance, core = z - 70;
  let position, target;
  if (kind === "south") {
    position = [47, 15, z - 35]; target = [37, 6.1, z - 55];
  } else if (kind === "entrance" && index === 4) {
    position = [-17, 13.2, z - 43]; target = [1, 6.8, z - 55];
  } else if (kind === "entrance") {
    position = [-.5, 11.2, z - 73]; target = [-10, 10.3, z - 58];
  } else if (kind === "concourse") {
    const cx = [2, 4].includes(index) ? 5 : 2;
    position = [cx, 6.73, core + (index === 3 ? 34 : 15.5)];
    target = [cx, 6.6, core + (index === 3 ? 50 : 31)];
  } else if (kind === "detail" && index === 0) {
    position = [-3.3, 3, core - 5]; target = [-7.13, 3.6, core + 2];
  } else {
    position = [x, 2.73, core - (kind === "detail" ? 7.5 : 14)]; target = [x, 2.98, core + 1];
  }
  return { kind, views, exterior, position, target, fov: exterior ? 57 : 68, collection: exterior ? station.context : `Station ${station.name}` };
}
