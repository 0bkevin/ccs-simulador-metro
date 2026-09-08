# Native station materials and fixture lighting

The canonical editable asset is `blender/metro_caracas_line1.blend`. All five
stations, tunnels, fixture housings and surface materials are authored there.
The game and station viewer load its exported meshes; materials are not a
browser-only replacement for the Blender model.

## What changed

- Replaced three broad platform washes per station with individual native
  AREA lights attached to the fluorescent tubes, recessed downlights and
  continuous strips. Mezzanines have their own sources at ceiling level.
- Plaza Venezuela L1 retains its two photographed systems: cool continuous
  platform-edge strips and warmer round downlights behind the colonnade.
  Removed the duplicate tube fixtures previously hidden above its strips.
- Added native sources to the tunnel wall bulkheads and throat luminaires.
  Their position and orientation match the actual modeled diffusers.
- Fluorescent fittings now have folded enamel reflectors, separate tube end
  caps, ceramic holders and rounded manufactured edges. Tunnel diffusers have
  retaining clips and a separate housing.
- Packed PBR color/roughness/normal maps add concrete pores, subtle aggregate,
  polished stone, brushed steel/bronze and rubber floor relief. Tile joints
  have recessed mortar and a separate roughness from the glazed face. Surface
  mapping uses metre dimensions and each face's orientation.
- Added escalator panel joints, fixing caps and skirt brushes; folded bin lids,
  feet, cabinet locks and hinges; small bevels on piers and manufactured parts.
- Replaced oversized escalator tread stripes with fine cleat relief at an
  estimated 8 mm pitch, plus actual landing comb teeth. Metal brushing and
  stone aggregate use finer surface mapping for close inspection.
- Removed coincident platform/vestibule slabs at Capitolio; the extension now
  starts beyond the existing platform and renders without a black overlap.
- Repaired the old black rubber normal texture. Changing an image's color
  space after writing generated pixels had reset its buffer. Rebuild and
  native render scripts now validate the packed normal map before proceeding.

## Evidence and limits

Fixture families, layout and relative warm/cool appearance were compared with
the photographs in [the individual station study](STATION_ACCURACY_REVIEW.md).
In particular, [UrbanRail's Altamira 07](https://www.urbanrail.net/am/cara/pix/caracas-gallery1.htm)
shows the paired longitudinal lamps, dark slatted ceiling and textured rubber
floor; [the Plaza Venezuela L1 photographs](https://www.urbanrail.net/am/cara/pix/caracas-gallery4.htm)
show its continuous strips and round inner downlights.

No electrical lamp schedule, IES distribution, measured illuminance or surface
scan was available. Powers, white balance, fitting dimensions and fine wear
are modeling estimates. Native light properties and the export manifest carry
that distinction. Blender radiant watts are not electrical lamp wattages.
The target remains the photographed 2012 station appearance, not a claim about
every subsequent lighting or refurbishment change.

## Native and real-time rendering

The saved scene uses Cycles, AgX, denoising and multiple indirect bounces.
`blender/render_station_lighting.py` renders actual fixture illumination,
occlusion and reflections; its underground reviews disable outdoor studio
lights. The resulting images are in `blender/qa/lighting/`. Older Workbench
images in the parent QA folder remain useful for geometry, but do not verify
materials or actual lighting.

glTF does not encode AREA lights, so `blender/export_web.py` writes each native
source's identity, transform, dimensions, color and rendering power into the
manifest. The web renderer selects up to 24 nearby sources at their original
fixed positions, fading distant contributions and separating platform,
mezzanine and parallel tunnel bores. A light never follows the camera away
from its fixture. Because Three.js WebGL area lights cannot cast shadow maps,
two co-located spot approximations supply local fixture shadows; this is an
explicit real-time approximation of the Cycles area shadows. Ambient fill
and reflection probes approximate indirect bounce, with no artificial sun
inside the underground stations. Plan/section drawings use neutral review
illumination so removed ceilings do not misrepresent a normal station view.

Reproduce the native review after rebuilding:

```sh
blender -b blender/metro_caracas_line1.blend --python blender/rebuild_stations.py
blender -b blender/metro_caracas_line1.blend --python blender/render_station_lighting.py
npm run export:blender
npm test
npm run build
```

The native review does not save over the source scene. `--station altamira`,
`--station tunnel`, `--station details`, `--samples 64` and `--width 1120` can
narrow or refine it. The automated export checks validate actual fixture
attachment, level/bore separation, packed PBR maps and the vestibule floor.
