import provenance from '../public/audio/recordings/provenance.json' with { type: 'json' };

const base = import.meta.env?.BASE_URL || '/';
const stationIds = ['cano-amarillo', 'capitolio', 'bellas-artes', 'plaza-venezuela', 'altamira'];
export const recordingManifest = {
  clips: Object.fromEntries(Object.entries(provenance.clips).map(([id, clip]) =>
    [id, { ...clip, url: `${base}audio/recordings/${clip.file}` }])),
  stations: Object.fromEntries(stationIds.map(id =>
    [id, { arrival: `arrival-${id}`, ambience: `ambience-${id}` }])),
};

export const actualRecordings = [
  {
    title: 'Anuncios de las estaciones de línea 1 del Metro de Caracas',
    url: 'https://www.youtube.com/watch?v=ph1OAT0vqgY',
    creator: 'Venezuela Transport Info', date: '2021-11-20',
    authenticity: 'Uploader identifies Line 1 station announcements. Short attributed excerpts used in the local prototype.',
  },
  {
    title: 'Metro de Caracas · compilación de trenes Alstom y CAF',
    url: 'https://www.youtube.com/watch?v=Ej0X90zrtNg',
    creator: 'Danimijaresgd', date: '2024-07-17',
    authenticity: 'Uploader identifies Line 1 CAF Serie 6 footage alongside other rolling stock. Comparison reference only; not bundled.',
  },
  {
    title: 'Recorrido en CAF S6 Overhaul Gris por Línea 1 (Ago 2024)',
    url: 'https://www.youtube.com/watch?v=CAF0q0Humks',
    creator: 'Venezuela Transport Info', date: '2024-08-24',
    authenticity: 'Creator documents a CAF S6 MR-74 ride on 2024-08-19. Train and station ambience excerpts retain their original pitch.',
  },
];
export const audioDescription = {
  authenticity: '17 fragmentos de grabaciones del Metro de Caracas: tren CAF, puertas, frenado, anuncios y ambiente de las cinco estaciones. Sin sonidos generados.',
  layers: ['Tren CAF', 'Puertas y aviso de cierre', 'Frenado', 'Anuncio de llegada por estación', 'Ambiente por estación'],
};
