# Metro de Caracas · Línea 1

Recreación jugable en Three.js y WebGL de una cabina de la Línea 1, desde Caño Amarillo hasta Altamira. El recorrido jugable selecciona cinco estaciones icónicas —Caño Amarillo, Capitolio, Bellas Artes, Plaza Venezuela y Altamira— con un tren de siete coches y arquitectura específica por estación. La Línea 1 histórica tiene 22 estaciones; esa cifra se conserva como referencia documental.

La aplicación web carga los modelos de Blender exportados a `public/models/blender/train.glb` y `environment.glb`, junto con `manifest.json`. La ruta comprimida conserva cinco paradas en 0, 160, 320, 480 y 640 m. Las páginas `/model-review.html` y `/station-review.html` inspeccionan esos mismos GLB; no ejecutan Blender dentro del navegador. Los assets son aproximaciones visuales y no una medición 1:1. Puertas y ruedas no tienen animación en el export actual.

## Controles

- `W` / `↑`: tracción.
- `S` / `↓`: freno de servicio.
- `Espacio`: freno de emergencia; permanece activo hasta detener el tren.
- `E`: abrir o cerrar puertas cuando el tren está detenido en la zona de parada.
- `P`: pausar o continuar.
- `C`: cambiar entre vista de conducción, exterior y aérea.
- `R`: reiniciar el servicio.

`INSPECCIONAR TREN` abre una página de revisión exterior en `/model-review.html`. `INSPECCIONAR ESTACIONES` abre `/station-review.html`, donde puedes revisar las cinco estaciones con vistas de frente, andén y detalle. La revisión de estaciones usa iluminación local y los mismos módulos de arquitectura; las referencias están en [docs/STATION_REFERENCES.md](docs/STATION_REFERENCES.md). Las notas del tren están en [docs/EXTERIOR_MODEL.md](docs/EXTERIOR_MODEL.md).

También hay controles táctiles en pantalla y un control de volumen para el audio procedural. La lista de estaciones se puede desplazar en móvil. El botón `FUENTES` pausa la simulación y abre la investigación completa; al cerrar conserva el estado de pausa anterior.

## Modelo del juego

Las distancias jugables suman 640 m entre la primera y la última parada. No representan kilometraje real, velocidades operativas ni un perfil de vía. El tren y las estaciones se construyen como geometría nativa de Blender a partir de referencias fotográficas; no son modelos oficiales ni un levantamiento topográfico.

La investigación documenta la Línea 1, su orden de estaciones, 750 V CC por tercer riel, ancho estándar, renovación de vía y material rodante histórico. El juego representa un CAF Serie 6 estilizado de siete coches; sus dimensiones se usan como referencia visual y no como una ficha técnica oficial. El audio del juego es procedural: combina tracción, rodadura, ejes, puertas, freno y HVAC, con volumen ajustable y limitación de picos. Las grabaciones reales se mantienen como referencias externas con su licencia/proveniencia en [docs/AUDIO_SOURCES.md](docs/AUDIO_SOURCES.md); la app ofrece un reproductor hospedado por YouTube para comparación y no redistribuye esos archivos. Consulta también [docs/RESEARCH.md](docs/RESEARCH.md).

## Desarrollo

    npm install
    npm run dev

Reconstruir los modelos nativos y exportarlos al juego:

    blender -b --factory-startup --python blender/metro_caracas_scene.py
    npm run export:blender

La construcción guarda `blender/metro_caracas_line1.blend` y vistas de revisión
en `blender/qa/`. Las referencias y límites de precisión están en
[docs/BLENDER_REFERENCE_REBUILD.md](docs/BLENDER_REFERENCE_REBUILD.md).

Validación:

    npm test
    npm run build

## Compartir en la web

El build de `dist/` es estático y se puede subir a cualquier hosting HTTPS. Para
probarlo desde esta máquina en una red local:

    npm run dev

Abre `http://localhost:5173/` en este equipo. El servidor queda ligado a
localhost y no publica el juego en la red.

El botón `COMPARTIR` usa el diálogo nativo del dispositivo cuando existe y, en
su defecto, copia la URL local. Para compartir con otras personas se necesita
publicar `dist/` en GitHub Pages, Netlify, Vercel o un hosting estático similar.
