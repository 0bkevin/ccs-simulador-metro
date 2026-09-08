"""Native CAF Serie 6 exterior for the Caracas Metro Line 1 consist.

The supplied Caracas CAF photographs are the source for the proportions and
the colour blocking in this module.  Blender uses Y up and Z along the route:
the first cab nose is near Z=0 and the seven cars extend toward negative Z.
All of the visible bodywork is made here as native Blender geometry so the
train remains editable and exports cleanly to glTF.
"""

from __future__ import annotations

import math

import bpy
from mathutils import Vector


def _material(name, color, metallic=0.0, roughness=0.45, emission=None):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 2.5
    return material


def _materials():
    return {
        "silver": _material("CAF 2010 brushed aluminium", (.52, .55, .55), .72, .25),
        "silver_light": _material("CAF rounded silver shoulder", (.75, .77, .74), .66, .22),
        "silver_dark": _material("CAF lower apron shadow", (.33, .36, .35), .70, .29),
        "red": _material("CAF delivery red", (.62, .008, .006), .0, .30),
        "red_dark": _material("CAF red edge shadow", (.46, .008, .005), .10, .38),
        "black": _material("CAF rubber black", (.006, .008, .009), .08, .52),
        "black_soft": _material("CAF fascia soft black", (.018, .021, .021), .16, .34),
        "glass": _material("CAF smoked blue glazing", (.008, .035, .048), .34, .075),
        "glass_inner": _material("CAF windshield blue depth", (.014, .060, .068), .20, .11),
        "amber": _material("CAF amber destination text", (1.0, .42, .025), .05, .22, (1.0, .16, .01)),
        "yellow": _material("CAF Venezuelan yellow stripe", (1.0, .72, .012), .08, .34),
        "blue": _material("CAF Venezuelan blue stripe", (.015, .10, .72), .12, .34),
        "green": _material("CAF Venezuelan green stripe", (.035, .43, .10), .08, .37),
        "white": _material("CAF headlamp white", (1.0, .89, .62), .05, .21, (1.0, .65, .22)),
        "tail": _material("CAF marker red", (.65, .003, .002), .05, .20),
        "steel": _material("CAF bogie steel", (.042, .049, .052), .70, .38),
        "wheel": _material("CAF running wheel steel", (.025, .029, .030), .82, .30),
        "steel_light": _material("CAF machined bogie edges", (.38, .40, .38), .80, .20),
        "rubber": _material("CAF wheel rubber", (.009, .011, .012), .02, .74),
        "copper": _material("CAF coupler machined metal", (.30, .30, .27), .73, .27),
    }


def _link(obj, collection):
    collection.objects.link(obj)
    return obj


def _mesh(name, verts, faces, material, collection, smooth=False):
    mesh = bpy.data.meshes.new(name + " mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(material)
    mesh.update()
    obj = _link(bpy.data.objects.new(name, mesh), collection)
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    return obj


def _box(name, loc, dims, material, collection, bevel=0.0):
    a,b,c=(v/2 for v in dims)
    verts=[(-a,-b,-c),(a,-b,-c),(a,b,-c),(-a,b,-c),(-a,-b,c),(a,-b,c),(a,b,c),(-a,b,c)]
    faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(1,2,6,5),(0,4,7,3)]
    obj=_mesh(name,verts,faces,material,collection)
    obj.location=loc
    if bevel:
        modifier = obj.modifiers.new("rounded manufactured edge", "BEVEL")
        modifier.width = bevel
        modifier.segments = 4
    return obj


def _cylinder(name, loc, radius, depth, material, collection, rotation=(0, 0, 0), vertices=32):
    coords=[(radius*math.cos(i*2*math.pi/vertices),radius*math.sin(i*2*math.pi/vertices),z) for z in (-depth/2,depth/2) for i in range(vertices)]
    faces=[(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
    faces += [tuple(range(vertices-1,-1,-1)),tuple(range(vertices,2*vertices))]
    obj=_mesh(name,coords,faces,material,collection)
    obj.location=loc;obj.rotation_euler=rotation
    for poly in list(obj.data.polygons)[:vertices]: poly.use_smooth=True
    return obj


def _beam(name, a, b, radius, material, collection, vertices=16):
    start, end = Vector(a), Vector(b)
    delta = end - start
    if delta.length < 1.0e-6:
        return None
    obj = _cylinder(name, (start + end) / 2.0, radius, delta.length, material, collection, vertices=vertices)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(delta.normalized())
    return obj


def _rounded_rect(x0, x1, y0, y1, radius, segments=6):
    """Counter-clockwise rounded rectangle in a 2D plane."""
    x0,x1=sorted((x0,x1));y0,y1=sorted((y0,y1))
    radius = max(0.001, min(radius, (x1 - x0) * 0.5, (y1 - y0) * 0.5))
    corners = (
        (x1 - radius, y1 - radius, 0.0),
        (x0 + radius, y1 - radius, math.pi / 2.0),
        (x0 + radius, y0 + radius, math.pi),
        (x1 - radius, y0 + radius, 3.0 * math.pi / 2.0),
    )
    points = []
    for cx, cy, start in corners:
        for i in range(segments + 1):
            angle = start + math.pi * 0.5 * i / segments
            points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return points


def _side_surface(name, side, y0, y1, z0, z1, material, collection, offset=0.0, radius=0.08):
    """Rounded plane on one side of the aluminium shell."""
    if z1 < z0:
        z0, z1 = z1, z0
    points = _rounded_rect(z0, z1, y0, y1, radius, segments=5)
    verts = [(side * (1.50 + offset), y, z) for z, y in points]
    face = tuple(reversed(range(len(verts)))) if side > 0 else tuple(range(len(verts)))
    return _mesh(name, verts, [face], material, collection, smooth=True)


# ---------------------------------------------------------------------------
# Continuous car shell and cab geometry


def _cross_section(half_width, bottom, top, roof_radius=None):
    """Rounded roof cross-section, shared by every body loft ring."""
    points=_rounded_rect(-half_width,half_width,bottom,top,.29,segments=12)
    return points+[points[0]]


def _loft_shell(center_z, direction, collection, mats, cab):
    if cab:
        rings = [
            (-9.68, 1.43, 0.84, 3.58),
            (-8.75, 1.50, 0.84, 3.68),
            (7.35, 1.50, 0.84, 3.68),
        ]
    else:
        rings = [
            (-9.68, 1.43, 0.84, 3.58),
            (-8.75, 1.50, 0.84, 3.68),
            (8.75, 1.50, 0.84, 3.68),
            (9.68, 1.43, 0.84, 3.58),
        ]
    verts = []
    for u, half, bottom, top in rings:
        for x, y in _cross_section(half, bottom, top, roof_radius=.29):
            z = center_z + direction * u
            verts.append((x, y, z))
    ring_size = len(_cross_section(1.5, 0.63, 3.68))
    faces = []
    for ring_index in range(len(rings) - 1):
        for point_index in range(ring_size - 1):
            a = ring_index * ring_size + point_index
            faces.append((a, a + 1, (ring_index + 1) * ring_size + point_index + 1, (ring_index + 1) * ring_size + point_index))
    faces.append(tuple(range(ring_size - 1, -1, -1)))
    last = (len(rings) - 1) * ring_size
    faces.append(tuple(last + i for i in range(ring_size - 1)))
    shell = _mesh("CAF continuous rounded body loft", verts, faces, mats["silver"], collection, smooth=True)
    shell["source"] = "Caracas CAF Serie 6 2010 delivery photographs"
    shell["construction"] = "continuous lofted cross-sections"
    shell["estimated_dimensions_m"] = "20.0 length x 3.0 width x 3.68 body roof"
    return shell














def _side_window(name, center_z, direction, side, local_u, width, y0, y1, collection, mats):
    route_center = center_z + direction * local_u
    _side_surface(f"{name} black gasket", side, y0 - .055, y1 + .055, route_center - direction * (width * .5 + .055), route_center + direction * (width * .5 + .055), mats["black"], collection, .026, .10)
    _side_surface(name, side, y0, y1, route_center - direction * width * .5, route_center + direction * width * .5, mats["glass"], collection, .041, .075)


def _door_leaf(name, center_z, direction, side, local_u, leaf_offset, collection, mats):
    route_center = center_z + direction * (local_u + leaf_offset)
    _side_surface(name, side, 1.06, 3.50, route_center - direction * .385, route_center + direction * .385, mats["red"], collection, .018, .11)
    _side_window(f"{name} tall inset window", center_z, direction, side, local_u + leaf_offset, .49, 1.94, 3.26, collection, mats)


def _side_details(center_z, direction, side, collection, mats, driving=False):
    door_centers = (-6.70, -2.24, 2.24, 6.70)
    for door_index, local_u in enumerate(door_centers, 1):
        for leaf_offset in (-.405, .405):
            _door_leaf(f"CAF paired door {door_index:02d} leaf", center_z, direction, side, local_u, leaf_offset, collection, mats)
        route_center = center_z + direction * local_u
        _beam("CAF door centre rubber seam", (side * 1.526, 1.08, route_center - direction * .015), (side * 1.526, 3.46, route_center - direction * .015), .018, mats["black"], collection, vertices=12)
        for edge in (-.84, .84):
            z_edge = route_center + direction * edge
            _beam("CAF door outer rubber seam", (side * 1.526, 1.08, z_edge), (side * 1.526, 3.46, z_edge), .014, mats["black"], collection, vertices=12)
        for leaf_offset in (-.405, .405):
            handle_z = center_z + direction * (local_u + leaf_offset)
            _box("CAF small door instruction label", (side * 1.548, 1.76, handle_z), (.008, .06, .12), mats["silver_light"], collection, .006)

    for window_index, local_u in enumerate((-4.48, 0.0, 4.48), 1):
        _side_window(f"CAF passenger window {window_index:02d}", center_z, direction, side, local_u, 1.672, 2.29, 3.13, collection, mats)
    _side_window("CAF rear small shoulder window", center_z, direction, side, -8.24, .702, 2.31, 3.15, collection, mats)

    # The 2011 Propatria side photograph shows an uninterrupted red roof
    # fascia, but lower four-colour bands only on the silver body panels.
    # Passenger door leaves are solid red down to the threshold.
    fascia_end = 7.35 if driving else 8.95
    _box("CAF continuous red roof edge fascia", (side * 1.492, 3.57, center_z + direction * (fascia_end - 8.95)/2), (.030, .16, fascia_end + 8.95), mats["red"], collection, .020)
    panel_intervals = [(-8.95, -7.55), (-5.85, -3.09), (-1.39, 1.39), (3.09, 5.85)]
    if not driving:
        panel_intervals.append((7.55, 8.95))
    for start_u, end_u in panel_intervals:
        for colour, y in (("red", 1.41), ("yellow", 1.35), ("green", 1.29), ("blue", 1.23)):
            _box("CAF body panel rainbow band", (side * 1.518, y, center_z + direction * (start_u + end_u) / 2), (.018, .056, end_u - start_u), mats[colour], collection, .003)


def _underframe(center_z, direction, collection, mats):
    _box("CAF underframe equipment spine", (0, .72, center_z), (1.20, .40, 8.6), mats["black"], collection, .12)
    _box("CAF battery cabinet", (-.64, .66, center_z + direction * .25), (.38, .55, 1.65), mats["steel"], collection, .06)
    _box("CAF compressor cabinet", (.64, .67, center_z - direction * 1.10), (.42, .58, 1.42), mats["steel"], collection, .07)
    for local_u in (-6.65, 6.65):
        bogie_z = center_z + direction * local_u
        # An open H-frame leaves the two running wheelsets visible. A solid
        # cuboid across the entire bogie masked them in the earlier export.
        _box("CAF bogie cross frame", (0, .70, bogie_z), (2.12, .20, .36), mats["steel"], collection, .07)
        for side in (-1, 1):
            _box("CAF bogie side frame", (side * 1.01, .68, bogie_z), (.16, .18, 2.22), mats["steel"], collection, .065)
            for axle_local in (-.82, .82):
                axle_z = bogie_z + direction * axle_local
                _box("CAF cast axlebox", (side * 1.02, .57, axle_z), (.20, .22, .28), mats["steel"], collection, .055)
                _cylinder("CAF axlebox circular cover", (side * 1.13, .57, axle_z), .082, .025, mats["steel_light"], collection, rotation=(0, math.pi / 2, 0), vertices=24)
        for axle_local in (-.82, .82):
            axle_z = bogie_z + direction * axle_local
            _beam("CAF bogie axle", (-.93, .56, axle_z), (.93, .56, axle_z), .055, mats["steel"], collection, vertices=14)
            # Rail wheels are steel CAF running wheels at gauge positions
            # +/-0.76 m: two axles x two wheels per axle = eight wheels/car.
            for x in (-.76, .76):
                _cylinder("CAF steel rail wheel", (x, .57, axle_z), .44, .18, mats["wheel"], collection, rotation=(0, math.pi / 2.0, 0), vertices=48)
                _cylinder("CAF wheel flange", (x - math.copysign(.078, x), .57, axle_z), .455, .030, mats["wheel"], collection, rotation=(0, math.pi / 2, 0), vertices=48)
                _cylinder("CAF machined wheel hub", (x, .57, axle_z), .16, .20, mats["steel_light"], collection, rotation=(0, math.pi / 2.0, 0), vertices=24)
            for side in (-1, 1):
                _cylinder("CAF brake disc", (side * .91, .57, axle_z), .25, .018, mats["steel"], collection, rotation=(0, math.pi / 2.0, 0), vertices=28)
        for side in (-1, 1):
            for axle_local in (-.82, .82):
                _cylinder("CAF bogie suspension can", (side * .82, .84, bogie_z + direction * axle_local), .105, .34, mats["steel"], collection, rotation=(math.pi / 2.0, 0, 0), vertices=20)
        _box("CAF bogie centre bolster", (0, .77, bogie_z), (.58, .30, .48), mats["steel_light"], collection, .07)


def _roof(center_z, direction, collection, mats):
    for local_u in (-3.15, 2.65):
        pod_z = center_z + direction * local_u
        _box("CAF shallow HVAC pod", (0, 3.78, pod_z), (1.04, .18, 1.62), mats["silver_light"], collection, .10)
        _box("CAF dark HVAC grille", (0, 3.885, pod_z), (.74, .030, 1.18), mats["black_soft"], collection, .035)
        for vent in (-.42, -.14, .14, .42):
            _box("CAF HVAC grille fin", (0, 3.915, pod_z + direction * vent), (.78, .018, .045), mats["steel"], collection, .006)
    _box("CAF roofline cable tray", (0, 3.83, center_z + direction * .10), (.18, .08, 4.8), mats["black"], collection, .025)


def _diaphragm(center_z, direction, local_u, collection, mats):
    z = center_z + direction * local_u
    _box("CAF rubber intercar gangway", (0, 2.02, z), (2.36, 2.55, .18), mats["black"], collection, .10)
    for x in (-.86, -.43, 0.0, .43, .86):
        _box("CAF gangway accordion rib", (x, 2.02, z + direction * .105), (.055, 2.22, .035), mats["rubber"], collection, .012)


def _car(index, center_z, direction, driving, mats):
    name = f"CAF car {index:02d}"
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    else:
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
    collection["vehicle"] = "CAF Serie 6"
    collection["delivery"] = "Caracas Metro 2010"
    collection["route_axis"] = "Z"
    collection["up_axis"] = "Y"
    collection["car_length_m"] = 20.0
    collection["body_width_m"] = 3.0
    collection["body_roof_m"] = 3.75
    _loft_shell(center_z, direction, collection, mats, driving)
    for side in (-1, 1):
        _side_details(center_z, direction, side, collection, mats, driving)
    _underframe(center_z, direction, collection, mats)
    _roof(center_z, direction, collection, mats)
    _diaphragm(center_z, direction, -9.70, collection, mats)
    if not driving:
        _diaphragm(center_z, direction, 9.70, collection, mats)
    else:
        from cab_geometry import build_cab
        build_cab(collection,mats,center_z,direction,globals())
    return collection


def build_train():
    """Build and return the seven native CAF car collections."""
    mats = _materials()
    cars = []
    for index in range(1, 8):
        center = -10.01 - (index - 1) * 19.92
        direction = 1 if index == 1 else -1 if index == 7 else 1
        cars.append(_car(index, center, direction, index in (1, 7), mats))
    return cars


if __name__ == "__main__":
    build_train()
