# Blender Metro de Caracas

Blender 5.2.1 LTS is required.

## Exportación web

El pipeline web parte de `metro_caracas_line1.blend`. La exportación produce
`public/models/blender/train.glb` (los siete coches), `environment.glb` (las
cinco estaciones y su contexto) y `manifest.json` (proveniencia, colecciones y
posiciones de ruta). Three.js carga esos GLB con `GLTFLoader` y conserva el
sistema Y-up de Blender; la ruta avanza sobre el eje Z. Las colecciones de
estación deben conservar nombres que permitan identificar Caño Amarillo,
Capitolio, Bellas Artes, Plaza Venezuela y Altamira.

El juego abre en la vista ANDÉN, a nivel del andén y junto al centro del tren.
INSPECCIONAR ESTACIONES permite recorrer andenes, mezzaninas y accesos dentro
de la misma escena; pausa el servicio y conserva posición, puntuación y puertas.
VOLVER A CONDUCIR (o Esc) recupera la vista y el estado de pausa anterior.
`src/station-views.js` y `src/blender-presentation.js` comparten encuadres y
presentación entre juego y visor. El manifest conserva las quince luces AREA
nativas, omitidas por el GLB: el navegador las reconstruye como RectAreaLight,
con sólo las tres de la estación activa encendidas. La intensidad web se calibra
visualmente; no es una conversión fotométrica de vatios ni reproduce la cavidad
de Workbench píxel por píxel. Las capturas PNG de `qa/` son comprobaciones,
mientras que el juego presenta las mallas y materiales 3D de ese mismo `.blend`.

El navegador no ejecuta Blender Game Engine: sólo presenta la geometría GLB y
la lógica de simulación WebGL. La geometría es una aproximación visual y no una
reconstrucción medida 1:1. Las hojas de puerta se exportan como ensamblajes independientes y se animan
por comando en la web y el controlador nativo. Las ruedas siguen estáticas. Las páginas de revisión se sirven en `http://localhost:5173/` durante
desarrollo; no se abre ningún túnel público.

## Interior de pasajeros

INTERIOR DEL TREN entra al salón dentro del juego. Selecciona uno de los siete
coches, arrastra para mirar o utiliza SALÓN, ASIENTOS, PUERTAS e INTERCONEXIÓN.
El deslizador recorre el coche; W/S conservan tracción y freno. El interior usa
los mismos coches en movimiento y permite ver las estaciones por las ventanas.
Se reconstruyen salones de pasajeros; el puesto del conductor queda pendiente.
Fotos, cotas disponibles y estimaciones: `../docs/TRAIN_INTERIOR_REFERENCES.md`.

`rebuild_train.py` reconstruye exterior e interior conservando las estaciones:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b blender/metro_caracas_line1.blend -t 4 --python blender/rebuild_train.py
/Applications/Blender.app/Contents/MacOS/Blender -b blender/metro_caracas_line1.blend -t 4 --python blender/export_web.py -- --output public/models/blender
```

Las siete colecciones `CAF interior NN` se exportan dentro de `train.glb`.
Sus 21 luces AREA se conservan en `lighting.trainAreaLights` y se mueven con
el tren; sólo se activan las cercanas a la cámara. Los huecos nativos atraviesan
la carrocería, las juntas y las hojas de puerta; el vidrio usa alfa transparente.

Double-click `run_metro_game.command` in Finder, or run:

```sh
blender metro_caracas_line1.blend --python metro_game.py
```

Focus the 3D View and use:

- `W` / `↑`: traction
- `S` / `↓`: brake
- `E`: open or close doors while stopped at a station
- `P`: pause
- `R`: reset the service
- `Esc`: exit driving mode

The playable route is Caño Amarillo → Capitolio → Bellas Artes → Plaza
Venezuela → Altamira. The station distances are compressed for gameplay; the
platform arrangements and architectural features are based on the references
in `../docs/STATION_REFERENCES.md`.

`cab_geometry.py` constructs the curved cab from the front elevation and
longitudinal section in maintenance manual 161-200-05-603, with glazing details
from 161-311-05-601. `body_geometry.py` traces the body cross-section from
161-200-05-602 and defines the referenced door and bogie dimensions.
`train_model.py` builds the body, doors and running gear.
The reference copies and their limitations are recorded in the document below.

## Station architecture workflow

`station_models.py` builds the route, platforms and Caño Amarillo canopy.
`station_architecture.py` authors the individual underground circulation,
mezzanines, equipment and photographed entrances as native Blender meshes.
`rebuild_stations.py` updates those collections while preserving the train:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b blender/metro_caracas_line1.blend -t 4 --python blender/rebuild_stations.py
/Applications/Blender.app/Contents/MacOS/Blender -b blender/metro_caracas_line1.blend -t 4 --python blender/export_web.py -- --output public/models/blender
```

Run from the project root. Both commands exit when finished. The station
inspector loads only `environment.glb` and renders on camera/view changes.
The simulator skips drawing stationary geometry and stops drawing when hidden.
Keep the local server stopped outside the necessary browser inspection session.

The station appearance follows the documented 2012 photographic baseline.
Station-specific dimensions, exact circulation lengths and surrounding city
blocks have not been surveyed. See `../docs/STATION_REFERENCES.md` for the
evidence and remaining estimates. Still renders are in `qa/` and can be reviewed
without running either Blender or a web server.

The current pass models a photo- and diagram-based CAF Serie 6 (2010 delivery livery)
exterior approximation with an aluminium-body reference, RAVAN side band,
repeated glazed doors/windows, articulated end diaphragms, two bogies per car,
underframe equipment, roof pods and rounded driving cab. Station builders add
reference-led platform, roof, finish and civic-context cues. Dimensions and
fine mechanical details remain estimates; see `../docs/BLENDER_REFERENCE_REBUILD.md`.
