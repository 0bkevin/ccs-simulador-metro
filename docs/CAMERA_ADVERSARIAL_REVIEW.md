# Camera adversarial review

Reviewed camera change `a1e1490` with an independent review agent and a separate
local integration/browser review. All four confirmed findings below were
reproduced before fixing them.

| Finding | Reproduction and impact | Correction |
| --- | --- | --- |
| Tunnel slider caused a later camera jump | Move to the maximum tunnel distance, then update OrbitControls without input. The camera moved backward by 18–106 m, depending on the station. The fixed cursor radius and focus bounds conflicted with the slider's look-ahead target. | Interior focus bounds allow the viewing distance beyond the camera region, and no stale cursor-radius limit is applied. Camera containment still uses the actual floor/bore bounds. |
| Gameplay camera clipped station/tunnel seams | At Altamira, exterior travel around 2160.2 m and platform travel around 2248.7 m put near-plane edges through tunnel lining starting at 2164.78 m. Earlier tests only checked station meshes and missed the neighboring tunnel. | Hand off station lanes one metre inside each end. Regression tests include the entire environment and sample seams every 0.05 m. |
| Collision correction caused delayed orbit snaps | At Altamira's entrance, zoom in and orbit against architecture; a subsequent idle update moved the accepted camera by 0.329 m. Other input sequences produced larger jumps when a slide violated an orbit distance or angle limit. | Keep the previous accepted position and focus whenever a collision correction would violate the controls' limits. Valid slides still work. |
| In-game plan cropped after viewport rotation | Open a plan at 1280×800, then resize to 390×844. The old camera height remained; a station end projected to screen coordinate −2.92, outside the visible −1…1 range. | Reapply the plan framing and control limits on resize. Both station ends now remain visible in portrait and landscape for all five stations. |

Verification after the fixes:

- Regression tests cover each reproduction, repeated idle updates after slider
  travel, and 150 deterministic mixed orbit/pan/zoom inputs for every view.
- The independent agent checked 14,229 route camera positions, including the
  previously failing seams and near-plane intersections, with no failures.
- A separate agent run checked 8,250 mixed camera inputs across 33 station views,
  each followed by an idle update: no unsafe camera poses or delayed snaps.
- Default poses across seven aspect ratios remained stable through repeated
  idle updates.
- Browser checks confirmed tunnel wheel input stays local after slider travel,
  the game remains paused during inspection, and plan framing survives viewport
  rotation. Visual inspection of the final tunnel sample showed the camera
  enclosed by the bore, with no exposed exterior or object interior.

No further reproducible bug remained in these reviewed paths. These checks cover
the current native Blender export and controls; later model or navigation changes
should rerun the geometry and input regressions.
