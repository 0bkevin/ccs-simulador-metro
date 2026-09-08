# CAF Serie 6 passenger interior

The native saloons in `blender/interior_model.py` reconstruct the appearance of
the CAF Caracas trains at delivery, consistent with the existing silver/red
exterior. They are a photo-led reconstruction, not a certified 1:1 CAD model.
No authenticated dimensioned passenger-furniture plan was found in the search.
The code keeps estimated interior measurements separate from the dimensional
anchors already recorded for the car body, doors and windows.

## Direct visual evidence

- [First-train acceptance in Beasain, November 2010](https://www.aporrea.org/actualidad/n170480.html).
  Published by Luigino Bracci Roa, reproducing Pablo Siris's account of the
  ministry delegation receiving the first CAF train. Its original passenger
  photograph is retained for source inspection as
  [`caf-delivery-interior-2010.jpg`](../blender/references/caf-delivery-interior-2010.jpg).
  The photo shows longitudinal molded seats with pale perimeter shells,
  red/orange ordinary seats and blue priority seats, a three-seat group
  opposite a five-seat group beside an open accessible bay, blue fine-flecked
  flooring, pale molded wall liners, red inside door skins, curved stainless
  seat-end rails, black elongated hanging loops, two longitudinal curved light
  diffusers, ceiling access panels and a small CCTV dome. These observations
  describe visible features, not an independently measured seating schedule.
- [ALAMYS: material rolling stock preferences, 24 April 2015](https://alamys.org/es/noticias/blog-que-material-rodante-prefieren-los-operadores-de-latinoamerica/).
  The Caracas section of the operator association's article explicitly
  describes longitudinal seating and inter-car passenger connections. Its
  illustration labelled “Lay out en Zona de Pasajeros, Línea 1” is a
  **photograph, not a technical floor plan**. It shows the same blue seat
  treatment, the open space beside the short bench, cantilevered bench
  supports, curved rails and the pale cab partition with a small door window.
  Retained as
  [`caf-alamys-interior-2015.jpg`](../blender/references/caf-alamys-interior-2015.jpg).

The two source photographs are reference-only copies outside `public/`; they
are not redistributed inside the game as textures. The small floor finish
texture is independently authored procedural noise with explicit metre UVs.
Priority signs, route maps, emergency instructions and equipment labels that
could not be read or located confidently are not invented as authentic text.

## Dimensional anchors and estimates

The existing exterior uses the Caracas maintenance-document reproductions
linked in [BLENDER_REFERENCE_REBUILD.md](BLENDER_REFERENCE_REBUILD.md). Those
copies are third-party-hosted documentation, not authenticated manufacturer
CAD. Their door and glazing dimensions constrain the new liners and apertures.

| Feature | Evidence and treatment |
| --- | --- |
| N/R body length, 20.460 m | Recorded underframe dimension in 161-200-05-602, table 5-7; current body extent ±10.230 m |
| Structural doors, 1.750 × 2.0225 m | Same manual, table 5-8; interior trim follows the existing four door bays |
| Passenger glazing, 1.672 / 0.702 × 0.840 m | 161-311-05-601; gasket rings leave the corresponding exterior apertures open |
| Floor Y = 1.070 m | Estimated to align with the existing door threshold; not a measured rail-to-floor specification |
| Ceiling centre Y = 3.400 m | Estimated liner below the existing curved roof; side shoulders descend to Y = 3.100 m |
| Seat pan Y ≈ 1.54 m, back top Y = 2.145 m | Photo-scaled estimates, approximately 0.47 m above the floor at the pan |
| Individual seat pitch = 0.475 m | Photo-scaled estimate; five seats fit in each main inter-door bay |
| Seat shells | Curved continuous S profiles with a dished face and a separate pale perimeter, not block seats |
| Steel handrail radius = 0.018 m | Photo-scaled estimate; bends interpolated smoothly |
| Saloon floor width = 2.730 m | Fit to the existing canted body, not a manufacturer clear-width claim |
| Inter-car pitch = 20.960 m | Existing estimated 0.50 m underframe gap; retained unchanged |
| Passage bridge width = 2.140 m | Fit inside the existing bellows; root integration opens the structural end diaphragms |

The repeated layout currently yields 34 modeled seats in each driving car and
42 in each intermediate car: 278 in total. **This is a modeled allocation,
not a verified fleet seat count.** The shortened three-seat blue group and
opposite five-seat group are placed in the driving-car passenger bay; the
photos do not establish every intermediate car's priority-seat allocation.
Likewise, floor joints, minor fittings, exact lighting power and CCTV spacing
are estimated. No dimensions from another CAF fleet have been substituted.

## Excluded references

BFG International's photographs labelled “Caracas Metro Train Interiors” show
beige transverse seats and a narrow red inter-car door, characteristic of a
different Caracas fleet. They were visually reviewed and rejected for this
CAF Serie 6 reconstruction. Search results for refurbished Alsthom cars,
Metro Los Teques, Metro Valencia and IFE Tuy Medio were also excluded rather
than mixed into the delivery CAF saloon.

## Native and web integration

`build_interior()` replaces only the seven `CAF interior 01` through `07`
collections. It preserves the authored train exterior and stations. Each
collection records its reference document, car index, centre, direction,
floor height and the estimated-accuracy status. The native source uses metres,
Y up and Z along the route.

Car `i` has centre `Z = -7.73 - (i - 1) × 20.96`; its local longitudinal
coordinate `u` maps to `Z = centre + direction × u`. Direction is +1 except
for car 7, where it is -1. The driving saloon ends at local `u = 8.10`; its
partition closes off the unmodeled driver's equipment. This pass models the
passenger accommodation, not a surveyed control desk.

The interior meshes, including its panel seams, light diffusers, curved seats,
straps, cantilevers, threshold grooves and bridge strips, are exported into
the actual playable train asset. True openings and transparent glazing belong
to the exterior model; the interior adds gasket rings rather than an opaque
second layer of glass. Native area lights sit at Y = 3.29 and local
`u = -6, 0, 6` per car, pointing downward, with 1.8 × 4.7 m rectangles and
42 W each. These are rendering parameters chosen for visibility, not claimed
electrical specifications; their web counterparts move with the train.

The default passenger camera height is Y = 2.57 m, approximately 1.50 m above
the estimated floor, with a small lateral offset to avoid a central pole.
Doors remain closed/static in this export; the viewing controls do not claim
a physical walking or collision simulation.

## Review and verification

- [Native Cycles saloon render](../blender/qa/train-interior-native.png).
- [The same saloon in the playable web scene](../blender/qa/web-train-interior.jpg).
- [Web seat, doorway and gangway views](../blender/qa/web-train-interior-details.jpg).
- [Driving, intermediate and reversed driving cars](../blender/qa/web-train-interior-cars.jpg).

The exported asset was checked for unobstructed aisles in all seven cars,
transparent passenger/door glazing through every exterior layer, and continuous
inter-car bridge floors. The tests also cover the moving passenger camera,
car-relative lighting and consistent look controls in the reversed driving car.
The full suite passes 34 tests. The production build's GLBs and manifest match
the native source export.

Browser review exercised all seven car selections and the seat, door and
gangway presets. A deterministic simulation advance of 20.8725 m moved the
interior camera by the same distance; entering and leaving station inspection
restored the passenger view and pause state. The preview browser suspended
animation frames during this automated session, so these checks do not establish
a live frame rate or a real-time keyboard-driving performance result.
