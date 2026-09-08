# CAF Serie 6 exterior audit — 8 September 2026

**Result: partial conformance. The exterior is not ready for a claim of full
photographic or mechanical accuracy.** The previous cab/body finish and
passenger-door clearance corrections pass their regressions. Lighting, front
optical assemblies, several mechanical details and markings still need work.

The user requested an independent agent review. `exterior_audit` reviewed the
native generation code, exported asset and public references without editing
the model. The parent checked the running GLB, rendering configuration and test
coverage. This document consolidates both reviews; it does not claim the
findings have been fixed.

## Scope and evidence

The target is the CAF Caracas delivery appearance of 2010–2011. Later repaints
and other Caracas fleets are excluded. Scope includes the outside surfaces,
equipment, exterior light behavior and what is visible through cab glazing.
Passenger interior design and station architecture are outside this audit.

- Reviewed commit: `7c37a0ef1bb3bc8b3f813c4f274b442943abcf62`.
- Native source SHA-256: `7f704ad6319a3d668137388dde3c6f5d3280d44f86f77c2f0b578b0ad338cc3d`.
- Train GLB SHA-256: `df56ccb67bd56841f8ef6eae7a10bc17b06cda95b8fd26e24355151169d360bb`.
- The native source hash matches the manifest and the asset identity reported
  by the running inspector at `http://127.0.0.1:5175/model-review.html`.
- `npm test`: **59 passed, 0 failed**, rerun during this audit.
- New renderer evidence: [front](../blender/qa/audit-front-2026-09-08.jpg),
  [roof and side](../blender/qa/audit-roof-2026-09-08.jpg),
  [underframe and markings](../blender/qa/audit-underframe-2026-09-08.jpg).
  These are explicit redraws from the running inspector, not performance tests.

The main primary visual reference is the CAF-credited delivery photograph on
printed p. 37 of [INECO's project report](https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf).
The larger overhead station photograph below it depicts a different fleet and
must not be used to specify the CAF roof. The public
[delivery side photograph](https://bus-america.com/galeria/displayimage.php?pid=26432)
and [high-resolution front photograph](https://commons.wikimedia.org/wiki/File:Metro_de_caracas_linea_1.jpg)
support visible proportions and markings, but cannot establish calibrated paint
values. The source register and limitations are in [EXTERIOR_MODEL.md](EXTERIOR_MODEL.md).

The public reproductions of the CAF/Metro
[window manual](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas),
[nose manual](https://es.scribd.com/document/832323381/161-200-05-603-Testero-delantero)
and [body manual](https://es.scribd.com/document/832322985/161-200-05-602-Estructura-y-levante-de-caja)
are useful evidence, but are third-party uploads, not authenticated manufacturer
releases. No exact CAD, paint schedule or complete fleet-specific equipment
installation package was available for sign-off.

## Findings, in correction order

### E01 — High: headlamps and tail markers have no operating state

Both cab ends share emissive white headlamp material at intensity 2.5. The red
marker material has zero emission. The loaded train contains no light objects,
and the game does not create train headlight beams or select exterior lamps by
active cab. Thus the model cannot represent forward illumination and a distinct
rear marker state. This is a confirmed implementation gap; exact CAF switching
modes remain unverified because the referenced exterior-light manual
`161-372-05-601` was not located.

Evidence: [train_model.py](../blender/train_model.py), lines 53–54;
[cab_geometry.py](../blender/cab_geometry.py), lines 218–225;
[blender-world.js](../src/blender-world.js), `update`, lines 91–129;
[blender-presentation.js](../src/blender-presentation.js), lighting construction.

Correction: give the two cab ends separate lamp metadata/material instances,
add directional light sources aligned with the optics, and drive front/rear
states from the selected cab. Verify front, rear and unlit states in daylight
and a dark tunnel. Document assumed behavior until a fleet-specific operating
reference is available.

### E02 — High: gameplay treats transparent glazing as opaque shadow casters

The inspector disables shadows for transparent meshes. Gameplay's
`prepareBlenderMeshes` sets `castShadow = true` on every mesh. In the actual GLB,
all **123 transparent meshes** change from non-casting in the inspector to
casting under gameplay preparation. Three's PCF depth pass does not use their
blend opacity to produce partial-transmission shadows. This can make windows
look dark or blocked in the game even when the inspector looks correct.

Evidence: [blender-presentation.js](../src/blender-presentation.js), lines 14–25;
[model-review.js](../src/model-review.js), lines 87–93;
[blender-world.js](../src/blender-world.js), lines 23 and 31. Browser inspection
temporarily applied the gameplay preparer to the loaded train and restored the
original flags afterward.

Correction: share an intentional glazing/shadow policy between gameplay and
inspection. Validate the real exported window materials under station and
tunnel lights, including the passenger-door glass while moving.

### E03 — Medium: lamp covers are opaque patches with exposed circular optics

The object named `CAF lamp protective glazing` uses opaque `black_soft`.
White/red cylinders project ahead of that surface. The front capture shows
flat discs instead of optics inside a covered assembly. The CAF-credited photo
shows a continuous reflective cover; the reproduced window manual, §2.1.1 and
§2.2.1, describes clear tempered lamp glazing with printed mounting borders.

Evidence: [cab_geometry.py](../blender/cab_geometry.py), lines 211–225;
[front capture](../blender/qa/audit-front-2026-09-08.jpg);
[window manual](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas).

Correction: create a transparent outer cover with its dark border, recessed
reflector/lens geometry and supported mounting details. Check it from the
front and oblique angles before tuning lamp brightness.

### E04 — Medium: the destination lettering sits outside its opaque cover

The destination surface uses opaque ceramic-frit material. `ALTAMIRA` is placed
at a longitudinal surface offset of 48 mm, while the shared nose mesh is at
4 mm: a 44 mm authored offset in front of the cover at the text origin. The
comment stating that it is behind the glass contradicts the geometry. The
default font also lacks the display's illuminated matrix appearance. The
destination itself is consistent with the existing Altamira service; this is
an assembly/rendering defect, not a claim that the route name is wrong.

Evidence: [cab_geometry.py](../blender/cab_geometry.py), lines 194–209 and 403;
[window manual §2.1.1](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas).

Correction: separate transparent cover, dark display cavity and recessed
emitting display. Verify text placement, legibility and reflections in both
cab ends, with an explicit runtime source for the destination string.

### E05 — Medium: the wiper's rubber does not contact the windshield

The arm and blade both use an 80 mm longitudinal offset. The independent
geometry review estimates a 26–50 mm blade-to-surface gap along the sampled
path after allowing for its radius. That is a model calculation, not a CAF
dimension. Following the windshield's general slope is insufficient to make
the rubber touch its curved surface.

Evidence: [cab_geometry.py](../blender/cab_geometry.py), lines 245–249.

Correction: retain the arm's mechanical clearance and fit the rubber contact
edge to the glass. Verify contact along the complete blade on both cab ends.
Wiper animation is not required to correct this static assembly defect.

### E06 — Medium: the central coupler opening has no depth

**Follow-up:** the subsequent [coupler correction](EXTERIOR_MODEL.md#coupler-correction--8-september-2026)
replaces this painted aperture with an open recess and rebuilds the exposed
assembly at both ends. Native and exported geometry checks pass, with browser
captures recorded in that document. The finding below describes the audited
baseline, not the corrected export. Exact supplier/installation dimensions
remain unverified.

The named `CAF deep central coupler aperture` is a black region of the same
continuous front mesh. It has no actual opening, inner wall or visible cavity.
The delivery photograph shows open space and mechanical structure behind the
protective rack. The simplified coupling face and hoses reproduce the broad
arrangement but do not resolve that missing depth.

Evidence: [cab_geometry.py](../blender/cab_geometry.py), lines 227–243 and
379–405; [CAF-credited photo](https://www.revistaitransporte.es/wp-content/uploads/2016/02/2013_49.pdf).

Correction: exclude the aperture from the front skin, add recessed walls and
supported coupling structure, then check side/front silhouettes and occlusion.

### E07 — Medium: running gear is generic across vehicle types and remains static

`_underframe` receives no vehicle type and builds the same bogies and cabinets
for all seven cars. There is no traction motor/gearbox geometry. The reproduced
body manual distinguishes powered M/N vehicles and an unpowered R vehicle.
The exported runtime also translates the complete train without rotating
wheels. Passing wheel-animation tests do not cover this asset: those tests
instantiate the legacy procedural `src/train.js` model.

Evidence: [train_model.py](../blender/train_model.py), lines 415–473 and 531;
[blender-world.js](../src/blender-world.js), `update`;
[train.test.js](../test/train.test.js), lines 4 and 32–46;
[body manual §2.1.1](https://es.scribd.com/document/832322985/161-200-05-602-Estructura-y-levante-de-caja).

Correction: encode verified M/N/R formation and equipment differences, retain
wheel assemblies as movable export nodes, and test rolling behavior using the
native GLB. Detailed motor, cabinet and collector shapes need installation
references before they can be called accurate.

### E08 — Medium: markings use substitute typography and omit identifying details

The side mark uses default-font `Metro` and uppercase `CARACAS`, unlike the
distinctive italic wordmark and lowercase subtitle in the side reference.
Fleet/car identification is absent. The windshield has a solid ceramic border
but lacks the graduated transition and manufacturing mark described in the
reproduced window manual. Existing door warning text is present; its exact
lettering and small service labels have not been certified.

Evidence: [train_model.py](../blender/train_model.py), lines 326–350;
[cab_geometry.py](../blender/cab_geometry.py), lines 189–193;
[delivery side photograph](https://bus-america.com/galeria/displayimage.php?pid=26432);
[window manual](https://es.scribd.com/document/832322162/161-311-05-601-Ventanas).

Correction: reproduce legible reference lettering and supported label
locations. Do not invent fleet numbers or glass certifications to fill gaps.

### E09 — Medium: the view through the windshield is dominated by a blank partition

The current front render shows a broad pale bulkhead through the windshield.
The glazing is transparent; the visible result comes from the sparse cab
behind it. The geometry contains the partition but no driving desk or other
cab equipment to break up that flat background. This remains an exterior
appearance issue even with correct glass opacity.

Evidence: [front capture](../blender/qa/audit-front-2026-09-08.jpg);
[interior_model.py](../blender/interior_model.py), `_end_portal`, lines 278–300.

Correction: model only the reference-supported cab surfaces and equipment
visible through exterior glazing, and review them with the exterior lighting.
Do not hide the problem by making the windshield opaque again.

## Coverage and remaining reference limits

| Exterior category | Review result |
| --- | --- |
| Seven-car consist, two driving ends | Broad arrangement agrees with references. |
| Four paired door bays per side per car | Present; 112 leaf assemblies verified in the real GLB. |
| Passenger opening/closing commands | Existing tests cover complete leaves, reversal, pause, exact closure, open apertures and traction interlock. |
| Passenger/cab door separation | Swept clearance regression passes on both sides of both driving cars; approximately 97 mm at full opening. Preserve the recent correction. Exact CAF station coordinates remain estimates. |
| Cab access doors/windows | Clear apertures, silver reveals, flush edges and body/cab normals pass existing geometry checks. Absolute outline/control points remain photograph/manual-derived estimates. Cab doors and opening window sections remain static. |
| Body/cab silver transition | Shared material and continuous join normals verified; no reason to reintroduce the previous abrupt material split. |
| Red doors/nose/fascia, lower bands, flag | Overall delivery arrangement agrees: red–yellow–green–blue lower bands, Venezuelan flag with eight stars. Exact sweep curves, paint codes and gloss are not established. |
| Windshield and passenger glass | Transparent apertures verified. Shadow policy, visible cab background, optical thickness/transmission and small printed details still need work. |
| Headlamps/red markers | Assemblies present; cover construction and operational illumination fail review (E01/E03). |
| Destination panel | Present; layering and lettering need correction (E04). |
| Wiper, cab catches, seals | Broad elements present. Wiper contact fails review (E05); exact hardware sizes and types remain estimates. |
| Front coupler, guard and hoses | Broad arrangement present; aperture and mechanism incomplete (E06). |
| Bogies, brakes, springs, collectors | Elements present; type-specific geometry, installation dimensions and wheel motion incomplete (E07). |
| Roof ribs, HVAC, cable tray | Present, but two generic pods and one tray repeat on every car. No adequate fleet-specific roof installation evidence for sign-off. |
| Underfloor cabinets, reservoirs, piping | Present but duplicated/fitted estimates; no complete installation evidence for sign-off. |
| Inter-car bellows and lower couplers | Broad arrangement present. Detailed cross-section, attachment and articulation not verified. |
| Logos, vehicle numbers, warnings and service labels | Partial; substitute typography and missing identifiers remain (E08). |
| Small bolts, drains, washer outlets, aerials and service fittings | Cannot certify completeness from the available photos/manual excerpts. Require a fleet detail survey or appropriate equipment drawings. |

Roof evidence must establish equipment layout by car type before more detail
is added to [train_model.py](../blender/train_model.py), `_roof`, lines 476–488.
Photographs under uncontrolled lighting cannot certify the current RGB,
metalness, roughness or glass alpha values. Door travel (0.895 m), outward
clearance (0.115 m), and opening/closing time (2.4/2.8 s) remain documented model
choices rather than manufacturer specifications.

## Validation limits and next acceptance checks

The 59 passing tests protect the existing implementation, particularly the
recent door and glazing fixes. They do not establish complete photorealism.
The legacy procedural train tests must not be used as evidence that native
Blender wheel animation, head/tail behavior or every exterior component works.

For the correction pass, preserve the current door/glazing regressions and add
focused checks for native-asset lamp states, shared shadow treatment and wheel
nodes. Review front, rear, both cab sides, open/closed doors, roof and underframe
under the same lighting as reference comparisons. Inspect the actual gameplay
renderer as well as the studio inspector. Accept only claims supported by
those checks; keep unresolved drawing/color/installation details marked as
estimates.
