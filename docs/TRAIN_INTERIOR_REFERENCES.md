# CAF Serie 6 passenger and operator interiors

The native saloons in `blender/interior_model.py` reconstruct the appearance of
the CAF Caracas trains at delivery, consistent with the existing silver/red
exterior. They are a photo-led reconstruction, not a certified 1:1 CAD model.
No authenticated dimensioned passenger-furniture plan was found in the search.
The code keeps estimated interior measurements separate from the dimensional
anchors already recorded for the car body, doors and windows.

## Operator cab and interior refinement — 8 September 2026

Additional primary material was inspected for this pass:

- The [2010 delivery report](https://www.aporrea.org/actualidad/n170480.html)
  includes a photograph captioned as the delegation inspecting the cab.
  [Local reference](../blender/references/caf-delivery-cab-2010.jpg). It shows
  the charcoal curved desk, dark equipment plates, blue patterned seat with
  black back and armrests, pale molded lining, guillotine side window, warm
  longitudinal ceiling lamp, speaker and overhead ventilation slots.
- The operator's *Guía de ataque de fallas*, revision 5 December 2012,
  [public reader](https://es.scribd.com/document/775121030/trenes-metro-de-caracas),
  printed pages 8 and 10 (reader pages 3 and 5), explicitly identifies Serie 6.
  Its [labeled console photograph](../blender/references/caf-cab-console-guide-2012.jpg)
  fixes the relative layout: gauge and key switches on the left, radio on the
  left worktop, DMI left of HMI, CCTV/SIV to the right, central switch bank,
  and right-hand manipulator. The [display illustrations](../blender/references/caf-cab-displays-guide-2012.jpg)
  support a circular speed dial and a seven-car status schematic. This is an
  operator-authored document hosted by a third party, not an authenticated
  engineering release; the black-and-white scan cannot establish paint colors.
- *167-000-05-601 COSMOS*, edition 2, June 2012,
  [public maintenance-manual reader](https://es.scribd.com/document/750448095/167-000-05-601-COSMOS),
  section 2.2.4 / printed page 2-18, specifies a 10.4-inch 640×480 resistive
  TFT HMI. The model uses a 0.21133 × 0.15850 m active face, calculated from
  that diagonal and aspect ratio; the bezel dimensions remain estimated.
  Like the exterior maintenance manuals, this is a publicly hosted reproduction.

`operator_interior.py` builds both cabs within their respective native interior
collections. The cabin has a closed floor, curved knee recess and instrument
binnacle, recessed screens with captive screws, gauge face and needle, control
collars and caps, emergency mushroom, radio handset and coiled cord, right-hand
controller, suspended upholstered seat, armrests, footrest, vigilance pedal,
rear cabinets, inner door trim, ceiling access panels, speaker and warm fixture.
The rear cab rotates as a complete assembly. Its manipulator stays neutral
while the leading cab reflects the simulator's traction/braking state.

The original photos establish the larger forms and visible equipment, but do
not provide a dimensioned desk or seat plan, exact seat supplier, complete
switch legends, fabric specification, or cabinet contents. Desk and seat sizes,
small fittings, cab lighting power, and unreadable labels remain estimates.
Cab ceiling lamp geometry is observed; its 14 W Blender source is a rendering
parameter. No equipment or dimensions from another CAF fleet were substituted.
The DMI/HMI readouts are authored simulator graphics, **not real CBTC/COSMOS
software**. The CCTV face is an inactive monitor, not fabricated video footage.
The floor, cloth and signs use independently authored textures; source photos
remain outside the public assets and are not mapped onto geometry.

The passenger refinement preserves the documented longitudinal layout and all
112 moving leaves. It adds the molded seat-end wings, rail mounting sockets,
priority-seat graphic strips, ceiling speaker grilles, and door-header access
hardware. Seat profiles are sampled more finely for curved pan/back transitions.
The cab partition now contains an actual transparent pane, rather than a black
rectangle applied over a solid door. Saloon illumination is a neutral white;
the cab fixture retains the warmer tone visible in the delivery photo.

Review in the lightweight train inspector:
`/model-review.html?view=operator`, `?view=cab-seat`, `?view=saloon`, or
`?view=seats`. The car selector reaches all seven saloons and either driving cab.
In the running service, `/?view=operator` opens the operator position; the
interior panel switches between passenger accommodation and the two cab views.
Dragging changes the view direction. W/S and E retain their existing train and
door commands. The passenger travel slider is hidden in cab views.

Native review captures: [operator desk](../blender/qa/native-operator-2026-09-08.png),
[operator seat and partition](../blender/qa/native-operator-seat-2026-09-08.png),
and [passenger saloon](../blender/qa/native-saloon-2026-09-08.png). These are
Cycles renders of the authored meshes. Both cabs pass a native ray sweep to
every DMI/HMI display corner: the apertures cut through the bowed console skin.
The web renderer omits opaque PCF shadows from alpha train glazing, allowing
the windows to illuminate the interior consistently with their transparency.

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
partition separates the passenger accommodation from the operator compartment.
The operator model is described above; its furniture is not surveyed CAD.

The interior meshes, including its panel seams, light diffusers, curved seats,
straps, cantilevers, threshold grooves and bridge strips, are exported into
the actual playable train asset. True openings and transparent glazing belong
to the exterior model; the interior adds gasket rings rather than an opaque
second layer of glass. Native saloon area lights follow both visible strips
at X = ±0.83 m and Y = 3.237 m, pointing downward. Each is 0.25 m wide and
spans its saloon, with 75 W of rendering power. These are rendering parameters chosen for visibility, not claimed
electrical specifications; their web counterparts move with the train.

The default passenger camera height is Y = 2.57 m, approximately 1.50 m above
the estimated floor, with a small lateral offset to avoid a central pole.
The subsequent exterior pass attaches the existing inner door skins to the
moving exterior leaves. Passenger doors now respond to user commands; the
viewing controls do not claim a physical walking or collision simulation.

## Review and verification

- [Native Cycles saloon render](../blender/qa/train-interior-native.png).
- [The same saloon in the playable web scene](../blender/qa/web-train-interior.jpg).
- [Web seat, doorway and gangway views](../blender/qa/web-train-interior-details.jpg).
- [Driving, intermediate and reversed driving cars](../blender/qa/web-train-interior-cars.jpg).

The exported asset was checked for unobstructed aisles in all seven cars,
transparent passenger/door glazing through every exterior layer, and continuous
inter-car bridge floors. The tests also cover the moving passenger camera,
car-relative lighting and consistent look controls in the reversed driving car.
The original passenger pass passed 34 tests. The current pass adds tests of
both operator sightlines, cab floors, guillotine-window clearance, HMI active
dimensions, moving camera anchors, exposed instrument-screen corners and
controller response. On 8 September 2026, all **64 tests passed** and the
production build succeeded. The final native source SHA-256 is
`09763bd2056b145d94362d6228bc6c3d23ca81c98b9d00e3ef02af6aad54d245`;
the exported manifest matches it, and the public and production train,
environment and manifest files match byte-for-byte.

Final browser captures of this operator and passenger refinement:

- [Front operator desk](../blender/qa/web-operator-interior.jpg).
- [Reversed rear operator desk](../blender/qa/web-operator-rear-interior.jpg).
- [Operator seat, side door and partition](../blender/qa/web-operator-seat-interior.jpg).
- [Passenger saloon and priority seating](../blender/qa/web-saloon-interior.jpg).
- [Seated operator view in the playable scene](../blender/qa/web-playable-operator-interior.jpg).

The final playable-scene check exercised the door button through fully closed
and fully open states (animation fractions 0 and 1). The cab readouts updated
with those states, traction moved the front controller by 0.28 radians after
the doors closed, and the rear controller remained neutral. Native Cycles and
browser reviews checked both cabs, screen openings, seat upholstery, saloon
lighting and readable priority signs. The new cab and passenger presets were
also exercised across driving, intermediate and reversed driving car selections.

Browser review exercised all seven car selections and the seat, door and
gangway presets. A deterministic simulation advance of 20.8725 m moved the
interior camera by the same distance; entering and leaving station inspection
restored the passenger view and pause state. The preview browser suspended
animation frames during this automated session, so these checks do not establish
a live frame rate or a real-time keyboard-driving performance result.

## Saloon door attachment correction

The interior door inspection found that passenger-window trim had been reused
on the moving leaves: its gasket and sill lay 21–26 mm ahead of the red skin,
and the separate rectangular skins did not back the full gasket perimeter.
Each leaf now has one formed inner panel with a rounded aperture, a closed
rubber section seated on that panel and a continuous reveal reaching the
existing glass. The inappropriate projecting sill is removed. Perimeter
returns join the inner and exterior skins; all of these parts remain children
of the same moving leaf.

Door headers and jambs have returns to the body, with the release hardware
positioned from the actual sloping header surface. The longitudinal handrails
have curved supports around the light diffusers to ceiling mounting plates;
seat-end and wheelchair rails reach the wall liner, and the partition-door
pull has mounting studs. These are attachment corrections to the existing
photo-led model, not newly verified manufacturer dimensions.

The model inspector includes **PUERTAS DEL SALÓN** for checking the same
doorway in each car with the existing open/close commands. A geometry regression
checks all 112 leaves in closed and open states, requiring the window seal to
overlap and sit within 12 mm of its supporting inner skin. It fails on the
previous export's detached trim.

Native review captures: [doors closed](../blender/qa/native-saloon-doors-closed.png)
and [doors open](../blender/qa/native-saloon-doors-open.png).
Final browser captures: [closed](../blender/qa/web-saloon-doors-closed.jpg)
and [open](../blender/qa/web-saloon-doors-open.jpg). The browser review also
checked the reversed driving car. All **65 tests passed**, including the new
attachment regression, and the production build succeeded. The current native
source SHA-256 is `08ad0e82982a371bc213dd260d184023a6e7284ba383bfa55d525d9ae86e85c8`;
the manifest matches it, public and production assets match byte-for-byte,
and the environment geometry and lighting metadata remain unchanged.

## Saloon lighting correction

The two longitudinal opal strips retain the delivery-photo placement and
curved section. Their former open half-cylinder meshes and doubled, detached
end hoops are replaced by closed mounting channels seated into the ceiling,
3 mm lenses and one narrow retaining band bridging each lens joint. Seated
edge rails finish the sides. The luminous surface is neutral white; its
emission is separate from the satin metal housing.

The follow-up visual pass replaces the uniform emissive white with an authored
256 × 128 optical falloff map packed into the native material and the GLB.
Each cover has its own UV coordinates: the centre is luminous, the wrapped
edges are softer and the socket ends fall off slightly. This makes the convex
section legible without painting dark lines onto the lamp. The satin metal
retaining bands are 34 mm wide and the seated side lips have small bevels.
These optical and fitting dimensions are appearance estimates from the same
reference photographs, not newly discovered manufacturer specifications.

Each car now has two narrow area sources immediately below the visible lenses,
replacing the three broad centreline washes. The manifest carries all fourteen
saloon sources and the two existing cab lamps. The web interior inspector
illuminates the selected car and its neighbours while keeping its orbit camera
independent; exterior views retain only the nearest car's sources.

Direct saloon source power is calibrated to 55 Blender radiant watts per
strip, with a slightly warm neutral tint. For WebGL, one low-power upward
rectangle near the floor approximates reflected light on the ceiling and
upper panels; Cycles computes its own indirect illumination. These seven
renderer helpers are not additional physical train lamps. Only helpers for
the viewed car and its neighbours run, and they turn off in exterior views.

The geometry regression samples both strips across all seven cars for continuous
lens/joint coverage and verifies that each downward-facing source lies directly
below a visible diffuser. Rendering power remains an appearance calibration,
not a measured fleet lamp wattage or certified photometric result.

Reviewed captures: [native ceiling](../blender/qa/native-saloon-lights-ceiling.png),
[native saloon](../blender/qa/native-saloon-lights-saloon.png),
[web ceiling](../blender/qa/web-saloon-lights-ceiling.jpg),
[saloon at the station](../blender/qa/web-saloon-lights-station.jpg), and
[playable saloon in the tunnel](../blender/qa/web-saloon-lights-tunnel.jpg).
The tunnel capture was rendered at a deterministic 220 m route position;
it checks appearance, not a measured live frame rate.
All **68 tests passed** and the production build succeeded. The current native
source SHA-256 is `223b9281727e414b4954f40c888d6a653cff88a9d98e2b4535c36a642d5d3344`;
the export manifest matches it, and the public and production assets match
byte-for-byte. Station geometry and lighting metadata remain unchanged.

The optical pass also retains a [before capture](../blender/qa/web-saloon-lights-before-optics.jpg)
at the same passenger viewpoint as the updated station capture.
