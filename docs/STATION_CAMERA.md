# Station camera boundaries

The game inspection and `/station-review.html` share `src/station-camera.js`.
Orbit, pan and zoom resolve before rendering, using the previous accepted
position rather than treating the orbit target as a safe location. The target
can be inside an escalator or another architectural feature.

`src/camera-collision.js` sweeps a 0.30 m camera sphere against triangles from
the visible native Blender collections. Thin faces, back faces and transparent
glass all block movement. An indirect `three-mesh-bvh` tree is built lazily per
encountered mesh, preserving its render indices and material groups. Movement
stops before contact and can slide along a clear axis. The near plane fits
inside this sphere, including its corners after viewport resizing.

The floor bounds follow each station's side or island platform and Capitolio's
widened vestibule. Separate mezzanine presets confine movement to the ticket
halls. These are navigation bounds for the authored model, not surveyed public
access limits. Users change levels and exterior areas with the view buttons.
Platform views also retain neighboring tunnel collections to fill their ends.

Tunnel exploration stays in the driven bore, from 8 m beyond the start to
24 m before the end of each modeled connection. The slider uses the same
collision sweep as dragging. Plan panning remains over the station footprint;
section and entrance views limit orbit angles and distance around a fixed
focus. Their intended cutaway and exterior perspectives remain available.

The game's moving platform and exterior cameras use clear lanes beside the
stairs and columns, handing off to the bore camera one metre inside the station
ends to clear the overlapping tunnel lining. The simulation's configured route end stops an overrun
before its leading camera can leave the final tunnel; the existing missed-stop
recovery returns the train to Altamira.

Validation in `test/station-camera.test.js` covers continuous face crossings,
glass, nonuniform mesh transforms, sliding, near-plane clearance, all five
native station presets, large camera movements, tunnel limits, plan transitions,
viewport resizing and moving camera lanes. The simulation test covers a missed
final stop and recovery. Browser checks additionally exercise wheel events,
mouse and touch handlers, mobile layout, the in-game view buttons and returning
to the paused service. Native `.blend` and GLB geometry are unchanged by this
camera update.

The follow-up [adversarial review](CAMERA_ADVERSARIAL_REVIEW.md) found and fixed
four regressions. Accepted collision poses now also satisfy the orbit limits,
tunnel look-ahead targets remain stable after slider movement, and the in-game
plan refits when the viewport changes orientation.
