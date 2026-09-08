# CAF Serie 6 exterior and door controls

The subsequent [independent exterior audit of 8 September 2026](EXTERIOR_AUDIT.md)
records remaining lighting, optical assembly, mechanical and marking issues.
Passing the checks below does not certify every exterior detail as accurate.

The playable simulator and `/model-review.html` load the same native Blender
export. This pass retains the Caracas CAF delivery appearance of 2010–2011.
It refines the cab windows and materials and makes the passenger doors operable.
It retains the passenger furniture design, stations and route geometry.

## Research reviewed on 7 September 2026

| Source | Provenance and useful evidence | Limits |
| --- | --- | --- |
| [CAF, Electric Urban Mobility Forum, 2 February 2016, slide 8](https://www.euskadi.eus/contenidos/evento/fm_capv_3/es_def/adjuntos/04_CAF_Fernando_Arizmendi_Imanol_Iturrioz.pdf) | Manufacturer presentation hosted by the Basque government; confirms 48 seven-module Caracas units. | Indexed text verified; direct PDF download timed out on this pass. No dimensioned cab surface or paint specification. |
| [INECO, itransporte 49, 2013, pp. 36–39](https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf) | Primary report by the project engineers. PDF page 19 was rendered and visually inspected. The delivery photograph on printed p. 37 is explicitly credited to CAF. It shows the cab glazing, wiper, lamp covers, silver body, red paint, flag sweep and lower coupling. | This is an engineering project report and manufacturer photograph, not a vehicle CAD release. |
| [Metro de Caracas Línea 1 photograph](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg) | Public image page, Karlos Corbella, CC BY-SA 3.0; high resolution delivery view already retained in `blender/references/caracas-caf-front.jpg`. | Photographic proportions vary with perspective; no color calibration. |
| [Propatria, 2011, Bus América PID 26432](https://bus-america.com/galeria/displayimage.php?pid=26432) | Public original side photograph, previously retained as `caracas-caf-reference.jpg`, visually rechecked. Shows red paired doors, the red roof-edge strip, dark window seals, small Metro markings and red/yellow/green/blue lower bands. | Publicly viewable does not mean public domain. Used as a reference, not a texture. |
| [161-311-05-601, Ventanas, Ed. 2, June 2012](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas) | Public reproduction of the fleet maintenance manual. Describes flush curved laminated windshield glass with a black printed border; separate indicator and lamp glazing; side opening windows with a fixed lower pane. Figures 2-2/2-3 were rechecked against the photos. | Third-party upload, not authenticated by the manufacturer. The listed 2230 × 1622.5 mm windshield size is not assumed to be its projected vertical silhouette. |
| [161-200-05-603, Testero delantero](https://es.scribd.com/document/832323381/161-200-05-603-Testero-delantero) | Public manual reproduction; front elevation, section A-A and exploded assembly distinguish the moulded polyester/fibreglass nose, separate cab access doors and glazing. | No survey or original CAD control points; traced shapes remain estimates. |
| [161-200-05-602, Estructura y levante de caja](https://es.scribd.com/document/832322985/161-200-05-602-Estructura-y-levante-de-caja) | Public manual reproduction; body elevations and section 2-21 anchor the canted aluminium shell, four door bays, body openings and bogie spacing. Existing dimensional anchors are retained in `BLENDER_REFERENCE_REBUILD.md`. | Source authentication and whole-train dimensional certification remain unavailable. |
| [Inspección, ataque y fallas de puertas, 23 June 2023](https://www.scribd.com/document/679652090/Manual-Preventivo1) | Public trainee maintenance document explicitly describing the CAF fleet's electrically operated exterior sliding doors. | Training material, not a manufacturer mechanism drawing. It does not establish the model's exact clearance, travel curve or timing. |

Searches covered CAF's current and former sites, CAF Power & Automation,
operator material, engineering reports, cab/body/window manual identifiers,
and passenger/cab door documentation. No authenticated public vehicle CAD,
paint color schedule, full mechanical door linkage drawing or architectural
vehicle blueprint was found. Station architecture papers do not establish
rolling-stock dimensions and were not substituted for train drawings.
Refurbished liveries and other Caracas fleets were excluded from this pass.

## Exterior implementation

- The cab side panels invert the actual nose loft, including the roof
  shoulder's change in height. Each access door replaces a complete aperture
  in the cab shell. Its silver skin, 5 mm perimeter seam, 23 mm window frame,
  transparent panes and divider share one constrained triangulation. The
  rounded door profile surrounds the complete window with a silver reveal;
  corner radii preserve the upright rear and sloped front window edges.
  Seams use constant-width polygon offsets rather than centre scaling.
  Long boundary edges are sampled before surface mapping, so vertical seams
  and glazing frames follow the curved shell instead of spanning recessed
  straight chords. The catches follow the local surface orientation.
- The windshield's trapezoid and lower ceramic border follow the glass drawing.
  Its width is corrected to 2.230 m; the clear area uses transparent dielectric
  glass with a restrained neutral tint. The destination pane stays separate.
  The existing cab partition is trimmed inside the canted shoulder to remove
  its exposed white edge. Nose paint and glass retain a shared constrained triangulation so overlapping
  curved plates cannot expose triangular gaps.
- The nose and access doors use the same silver material as the body. Shared
  analytic normals keep the side reflection continuous at their join. The
  laminated glass has a lighter neutral tint and lower alpha, with a dielectric
  clear coat. The flag stays below/ahead of the side window, follows the shell
  within a few millimetres and meets the front stripes at the curved edge.
  Body silver, red paint, black ceramic frit, rubber and glass remain distinct.
  Color values, roughness and transparency are photographic rendering estimates,
  not manufacturer paint codes or measured optical transmission.

## Coupler correction — 8 September 2026

The exposed coupling assembly is rebuilt at both cab ends in
`blender/coupler_geometry.py`. The delivery photograph shows a machined face
with a projecting guide cone beside a hollow receiving cup. The former three
overlapping dark discs are replaced by separate turned surfaces, actual bores,
a thick cast housing and a supported longitudinal shank. The matching face is
about 0.51 m wide in this fitted reconstruction. The rear assembly is rotated
to preserve its handedness when viewed from outside either cab.

The lower nose now has a real opening through its front skin and underside,
with recessed returns and a drawgear bulkhead. The guard uses stacked channel
sections and mounting struts. A slender red handle attaches to a lower pivot;
the old angular red hose is removed. Flexible black and blue lines follow
continuous bends to fittings alongside the housing.

The visual source is the
[CAF delivery photograph](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg),
also credited to CAF in INECO's report. Voith's
[description of the cone-and-cup coupling principle](https://www.voith.com/corp-en/voith-turbo-perspectives/mechanical-engineering-pioneers-at-voith-turbo.html)
supports the general assembly interpretation; it does not establish the
supplier or exact coupler model fitted to this Caracas train. Internal
mechanism, hose routing and installation dimensions remain photo-fitted
estimates. The model does not simulate mechanical coupling.

The exterior inspector includes an **ENGANCHE** close view at
`/model-review.html?view=coupler`. A native-GLB regression checks the projecting
cone, recessed socket and open nose on both ends, alongside the existing door
and cab-window regressions.

Verified against the rebuilt native file and web export: **60 tests passed**,
production build succeeded, and both couplers were inspected in the browser.
Source SHA-256: `94f077602c7bafb6c17182412c8e5cfd9b560ef29c8cf0da55436966b5ebe157`.
The open cab loft is clipped as a surface rather than using a solid boolean,
which prevents a reversed-cab cutter cap from covering the rear assembly.
Final captures: [front coupling](../blender/qa/web-coupler-exterior.jpg) and
[rear coupling](../blender/qa/web-coupler-rear.jpg).

## Cab crown closure — 8 September 2026

The narrow triangular opening at the top of each cab was a boundary mismatch:
the front triangulation inserted points along the curved crown while the roof
loft spanned that edge with a straight chord. The horizontal bow also collapsed
to an excessively tight radius at the top, pulling the centre forward.

The body section, cab loft and front now share a sampled perimeter. Their
boundary uses the same surface offset, and the horizontal bow transitions to
a finite radius above the destination panel. This closes the slit without
adding a cover plate. A regression sweeps 301 points over each cab crown and
checks for solid exterior skin and a continuous height profile; it fails on
the former export. Native geometry passes the same sweep before export.

The inspector's **TECHO DE CABINA** view at `/model-review.html?view=roof`
provides a direct view of this joint.

Validation: all 61 tests pass and the production build succeeds. Both exported
cab crowns were inspected in the browser: [front roof](../blender/qa/web-cab-roof.jpg)
and [rear roof](../blender/qa/web-rear-cab-roof.jpg). The export matches native
source SHA-256 `eb69b50058d0a2c655bc544b1d6bf2baa3411047781192db8cb3e4601240b360`.

## Door operation

The body and portal now have full-height openings. Every leaf is a native empty
with stable `doorId`, `doorSide`, `doorTravelX` and `doorTravelZ` metadata. Its red
skin, glass, gasket, meeting seal and existing inner skin remain children. The
exporter batches static meshes by material but never merges different leaves.
The GLB contains 112 leaf assemblies: 7 cars × 2 sides × 4 bays × 2 leaves.

`src/train-doors.js` drives a small outward clearance followed by paired slides
along the outside of the body. Each leaf travels 0.895 m longitudinally and
0.115 m outward; estimated opening/closing times are 2.4/2.8 seconds. These are
visual clearance and animation choices, not claimed CAF specifications. Closing
reverses the path and restores the exact authored transform. A reversed command
continues from the current pose without a jump.

The two driving cars have their own door layout. The former intermediate-car
spacing put the leading open passenger leaf over the cab access door. The
[driving-car elevation](../blender/references/body-elevations-2-3.jpg) shows a solid side panel
between these entrances. Driving-car door centres are now fitted at
−7.00, −2.55, 1.90 and 6.35 m relative to each car centre, toward its cab;
intermediate cars retain their existing positions. This moves the leading bay
0.65 m away from the cab and leaves about 0.10 m between the fully open leaf
and the cab-door perimeter. These station coordinates and the clearance are
model estimates, not manufacturer dimensions. Leaf width and full opening
travel are unchanged. Passenger windows, body cutouts, guide covers, thresholds,
lining and adjacent furniture positions follow the same layout, preserving
the complete opening and the existing seat count. Native door nodes export
`doorCentreLocal`, and the manifest records each car's layout.

In the game, **E** or the door button commands opening/closing. The initial train
is parked with its platform doors open. Opening requires a stopped train in the
station stop zone. The three-second boarding dwell is retained. Side platforms
use the left side of the modeled track; island platforms use the right. The
chosen side stays latched while closing. Traction remains blocked until the
last leaf closes. Pausing freezes the motion. Reopening before departure does
not count the same station twice. Stopping alone does not open the doors.

The exterior inspector has **ABRIR**, **CERRAR**, a side selector, **E**, and close
views for **VENTANA DE CABINA** and **PUERTAS**. It loads only the train asset.
The native Blender driving controller also preserves and moves the leaf parents.
Cab access doors and wheels remain static.

## Validation

`test/train-doors.test.js` exercises the real exported GLB: all leaf parents,
attached glass/inner skins, direction at the reversed driving car, pause,
command reversal, exact closure, and ray checks through every open doorway.
Additional rays check both cab side windows, including the upper corners and
lower front panes, and both windshields. The regression checks also verify
identical paint materials and continuous normals across the body/cab join,
and a silver reveal around each side window. Geometry checks also measure
the flush fit along the full door and window edges. Simulation
checks cover explicit commands, station-side selection, stop-zone restrictions
and reopening without duplicate service credit. Browser inspection checks the
same exported train with its visible controls.

A swept-envelope regression checks both sides of both driving cars throughout
opening and closing, requiring at least 50 mm clearance from the cab entrance.
The full-height doorway checks still require every passenger opening to clear.

Final validation: **59 tests passed**, the production build succeeded, the
native Blender door hierarchy check passed, and source/manifest hashes and
public/dist assets match. The unmodified environment asset was retained.
Browser checks exercised E, open/close buttons, pause during motion, reopening,
and rejection while moving; mobile door buttons remain within the viewport.
Final renderer captures: [exterior](../blender/qa/web-train-exterior.jpg),
[cab window](../blender/qa/web-cab-exterior.jpg),
[open doorway](../blender/qa/web-doors-open.jpg), and
[cab entrance with passenger doors open](../blender/qa/web-cab-doors-open.jpg). The final stills use explicit
redraws and deterministic animation advancement because the preview suspended
frames when hidden; they are not a frame-rate benchmark.
