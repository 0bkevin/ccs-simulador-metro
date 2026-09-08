import study from '../public/models/station-specs.json' with { type: 'json' };
/**
 * Ruta jugable comprimida de la Línea 1 del Metro de Caracas.
 *
 * The real line has 22 stations. The playable slice deliberately focuses on
 * five architecturally distinctive stops so each one has a readable footprint.
 * `distance` is game distance in metres, not survey kilometreage.
 */
export const lineInfo = {
  id: 'L1',
  name: 'Línea 1 — Caño Amarillo ↔ Altamira',
  color: '#d71920',
  realLengthKm: 20.36,
  realStationCount: 22,
  stations: 5,
  gaugeMm: 1435,
  power: '750 V CC por tercer riel',
  operation: 'Metro pesado eléctrico; operación protegida por control automático de tren',
};

const red = lineInfo.color;

// Oeste → este. Distancias jugables redondeadas para una partida manejable.
const routeDescriptions = [
  { id: 'cano-amarillo', name: 'Caño Amarillo', distance: 0, color: red, type: 'elevated', platformLayout: 'side', railCenters: [0, 4], interchange: null, detail: 'Estación elevada junto al antiguo eje ferroviario Caracas–La Guaira, con cubierta reticulada amarilla y andenes laterales.' },
  { id: 'capitolio', name: 'Capitolio', distance: 900, color: red, type: 'subterránea', platformLayout: 'side', railCenters: [0, 4], interchange: 'Conexión peatonal con El Silencio (Línea 2)', detail: 'Estación profunda del centro con mezzanina y conexión peatonal hacia El Silencio.' },
  { id: 'bellas-artes', name: 'Bellas Artes', distance: 1800, color: red, type: 'subterránea', platformLayout: 'island', railCenters: [0, 10], interchange: null, detail: 'Estación profunda con andén central bajo el eje cultural de Bellas Artes.' },
  { id: 'plaza-venezuela', name: 'Plaza Venezuela', distance: 2800, color: red, type: 'subterránea', platformLayout: 'side', railCenters: [0, 4], interchange: 'Líneas 3 y 4 (conexiones del complejo)', detail: 'Complejo de transferencia con niveles y pasillos de conexión de alta demanda.' },
  { id: 'altamira', name: 'Altamira', distance: 3900, color: red, type: 'subterránea', platformLayout: 'island', railCenters: [0, 10], interchange: null, detail: 'Estación de tres niveles bajo la plaza y avenida Francisco de Miranda, con andén central y mezzanina.' },
];

export const stations = routeDescriptions.map((station, index) => ({ ...station, ...study.stations[index] }));
export default stations;
