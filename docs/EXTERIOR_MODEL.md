# Exterior model notes

The simulator and `/model-review.html` use the same exported Blender GLB: a photo-based CAF Serie 6 (2010 delivery livery) exterior approximation with seven cars, a red cab, aluminium-body reference, segmented passenger windows, door apertures, two bogies per car, roof equipment, lamps and articulated gangways.

The proportions are practical modelling estimates for camera framing and visual comparison; they are not a certified dimensional drawing or an assertion that every modeled part is 1:1.

## Reference evidence

- The publicly readable copy of CAF/Metro window maintenance manual 161-311-05-601 Ed. 2 (June 2012) lists reference dimensions in section 2.2: windshield 2230 × 1622.5 mm, indicator glass 1957 × 563.5 mm, lamp covers 619 × 442 mm, and passenger glass in large (1672 × 840 mm) and small (702 × 840 mm) formats. The copy is hosted by [Scribd](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas), so it is treated as third-party uploaded evidence rather than independently authenticated engineering documentation.
- Exterior appearance can be compared against the [Metro de Caracas Línea 1 reference photograph](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg) by KarlosCorbella/Metro and the [Bus América gallery photograph](https://bus-america.com/galeria/displayimage.php?pid=26432) (2011).

The references inform proportions and visible part choices. Colors, materials, seams and equipment remain an art-directed interpretation. The web export has no door or wheel animation and does not reconstruct a cab interior.

## Review workflow

Open `/model-review.html` from the `INSPECCIONAR TREN` button in the simulator. The page loads the same `train.glb`, adds a local `RoomEnvironment` reflection setup, neutral studio floor, soft lights and `OrbitControls`. Use `FRENTE`, `LATERAL`, `TRASERA` and `TREN COMPLETO` to inspect the outside from repeatable angles.
