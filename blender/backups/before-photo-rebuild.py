"""Procedural Blender scene for the Caracas Metro Line 1 replica.

Run with:
    blender -b --python blender/metro_caracas_scene.py

The scene deliberately keeps source observations separate from measured data:
the five stop locations are a playable scale interpretation, while platform
layouts, finishes, signs, roof structures, and the Altamira entrance follow
the downloaded architectural references in docs/STATION_REFERENCES.md.
"""

import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "blender", "metro_caracas_line1.blend")
RENDER = os.path.join(ROOT, "blender", "metro_caracas_preview.png")


def mat(name, color, metallic=0.0, roughness=0.7, emission=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1)
        bsdf.inputs["Emission Strength"].default_value = 3.0
    return m


RED = mat("CAF Caracas red", (0.68, 0.015, 0.025), metallic=.15, roughness=.35)
RED_DARK = mat("red lower skirt", (0.26, 0.008, 0.012), roughness=.45)
SILVER = mat("CAF stainless steel", (.48, .54, .56), metallic=.78, roughness=.24)
WINDOW = mat("smoked blue black glazing", (.008, .035, .055), metallic=.3, roughness=.08)
BLACK = mat("rubber and fascia", (.008, .011, .013), roughness=.65)
CHARCOAL = mat("charcoal equipment", (.025, .03, .034), metallic=.35, roughness=.48)
DOOR_FRAME = mat("door rubber seals", (.018, .022, .024), roughness=.58)
RAVAN_WHITE = mat("RAVAN silver highlight", (.72, .76, .77), metallic=.65, roughness=.24)
STEEL = mat("track and brushed steel", (.32, .38, .4), metallic=.8, roughness=.26)
YELLOW = mat("Caracas safety yellow", (.95, .63, .015), metallic=.08, roughness=.42)
WHITE = mat("warm station lettering", (1.0, .86, .57), roughness=.5)
CONCRETE = mat("board formed concrete", (.35, .37, .35), roughness=.88)
CONCRETE_LIGHT = mat("pale Altamira concrete", (.63, .67, .62), roughness=.9)
PLATFORM = mat("fine gray platform", (.22, .25, .25), roughness=.92)
TILE_BROWN = mat("Altamira brown tile", (.38, .20, .13), roughness=.8)
TILE_YELLOW = mat("Capitolio yellow tile", (.63, .53, .29), roughness=.82)
TILE_BLUE = mat("Bellas Artes blue tile", (.09, .25, .34), roughness=.8)
BEIGE = mat("Plaza Venezuela warm columns", (.58, .49, .35), roughness=.82)
TEAL = mat("Altamira teal railings", (.08, .31, .28), metallic=.2, roughness=.48)
WATER = mat("Altamira turquoise water", (.03, .55, .53), roughness=.12)
GREEN = mat("planted beds", (.06, .28, .10), roughness=1)
BRICK = mat("historic red brick", (.36, .10, .065), roughness=.9)
PAVING = mat("urban paving", (.30, .32, .31), roughness=.86)
ARCH_BLUE = mat("historic blue metal", (.035, .11, .17), metallic=.25, roughness=.52)
OBELISK = mat("Plaza Francia obelisk stone", (.55, .57, .54), roughness=.7)
FOUNTAIN = mat("fountain water", (.05, .38, .50), roughness=.16)
LIGHT = mat("fluorescent warm light", (1.0, .72, .3), emission=(1.0, .55, .12))
HEADLIGHT = mat("headlight", (1.0, .94, .72), emission=(1.0, .86, .48))
TAIL = mat("red marker lamp", (.9, .015, .02), emission=(.9, .01, .01))
DESTINATION = mat("destination amber", (1.0, .43, .06), emission=(1.0, .2, .02))
RAINBOW = [
    mat("livery red stripe", (.82, .02, .03), roughness=.45),
    mat("livery orange stripe", (.95, .31, .02), roughness=.45),
    mat("livery yellow stripe", (1.0, .74, .02), roughness=.45),
    mat("livery green stripe", (.08, .47, .16), roughness=.45),
    mat("livery blue stripe", (.05, .22, .65), roughness=.45),
]


def link(obj, collection=None):
    (collection or bpy.context.collection).objects.link(obj)
    return obj


def box(name, loc, scale, material, bevel=0.0, collection=None):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material:
        o.data.materials.append(material)
    if bevel:
        mod = o.modifiers.new("rounded edges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    if collection and o.name not in collection.objects:
        for c in list(o.users_collection): c.objects.unlink(o)
        collection.objects.link(o)
    return o


def cyl(name, loc, radius, depth, material, rotation=(0, 0, 0), vertices=16, collection=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    if material: o.data.materials.append(material)
    if collection and o.name not in collection.objects:
        for c in list(o.users_collection): c.objects.unlink(o)
        collection.objects.link(o)
    return o


def cone(name, loc, radius1, radius2, depth, material, rotation=(0, 0, 0), vertices=12, collection=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    if material:
        o.data.materials.append(material)
    if collection and o.name not in collection.objects:
        for c in list(o.users_collection): c.objects.unlink(o)
        collection.objects.link(o)
    return o


def beam(name, a, b, radius, material, collection=None):
    a, b = Vector(a), Vector(b)
    d = b - a
    o = cyl(name, (a + b) / 2, radius, d.length, material, vertices=10, collection=collection)
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return o


def text(name, body, loc, size, material=WHITE, rotation=(math.pi / 2, 0, 0), align="CENTER"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.align_x = align
    cu.size = size
    cu.extrude = .012
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rotation
    o.data.materials.append(material)
    return o


def make_track(z0, z1, centers=(0, 4), collection=None):
    box("ballast bed", (2, -.55, (z0 + z1) / 2), (12, .55, z1 - z0), BLACK, collection=collection)
    for center in centers:
        for off in (-.7175, .7175):
            box("steel running rail", (center + off, .02, (z0 + z1) / 2), (.12, .16, z1 - z0), STEEL, collection=collection)
        box("third rail", (center + 1.74, .24, (z0 + z1) / 2), (.13, .18, z1 - z0), YELLOW, collection=collection)
        for z in [z0 + 2 + i * 3.2 for i in range(max(0, int((z1-z0)/3.2)))]:
            box("sleeper", (center, -.12, z), (2.6, .14, .22), CONCRETE, collection=collection)


def car_body(index, z, driving=False, collection=None):
    car = bpy.data.collections.new(f"CAF car {index + 1:02d}")
    bpy.context.scene.collection.children.link(car)
    # The Line 1 CAF cars are stainless-steel, slightly tapered metro shells.
    # A second rounded roof cap gives the side profile the shallow curved roof
    # visible in the reference photographs instead of a square extruded box.
    body = box(f"CAF car {index + 1:02d} rounded shell", (0, 1.94, z), (3.0, 3.26, 19.2), SILVER, bevel=.38, collection=car)
    box(f"CAF car {index + 1:02d} roof radius", (0, 3.57, z), (2.72, .42, 18.65), RAVAN_WHITE, bevel=.20, collection=car)
    box(f"CAF car {index + 1:02d} lower black skirt", (0, .57, z), (2.92, .36, 18.92), BLACK, bevel=.10, collection=car)
    box(f"CAF car {index + 1:02d} red sill belt", (0, 1.08, z), (2.96, .16, 18.86), RED, bevel=.04, collection=car)
    # The narrow RAVAN (red, orange, yellow, green, blue) livery stripe runs
    # continuously below the window line on both sides of the real cars.
    for side in (-1, 1):
        x = side * 1.505
        box("black continuous window gasket", (x, 2.70, z), (.055, .12, 18.55), BLACK, collection=car)
        for j, stripe in enumerate(RAINBOW):
            box("CAF RAVAN rainbow side stripe", (x + side * .018, 1.28 - j * .085, z), (.07, .055, 18.1), stripe, collection=car)
        # Seven glazed bays with rounded dark frames. Three bays are paired
        # passenger doors; this matches the repeated CAF door rhythm.
        for dz in (-7.65, -5.15, -2.55, 0.0, 2.55, 5.15, 7.65):
            is_door = abs(dz) in (5.15, 0.0)
            width = 1.42 if is_door else 1.20
            height = 1.38 if is_door else 1.30
            box("side glazed door/window", (x + side * .018, 2.36, z + dz), (.065, height, width), WINDOW, bevel=.16, collection=car)
            # Silver mullion and black rubber seal keep each aperture legible.
            box("side aperture lower sill", (x + side * .035, 1.62, z + dz), (.075, .07, width + .10), SILVER, bevel=.02, collection=car)
            box("side aperture upper frame", (x + side * .035, 3.10, z + dz), (.075, .07, width + .10), DOOR_FRAME, bevel=.02, collection=car)
        for dz in (-6.42, -3.84, -1.28, 1.28, 3.84, 6.42):
            box("vertical red door mullion", (x + side * .04, 2.32, z + dz), (.08, 1.72, .09), RED, bevel=.025, collection=car)
    # Underframe, traction equipment, two bogies, axles and visible wheels.
    box("underframe center equipment", (0, .40, z), (1.18, .36, 8.5), CHARCOAL, bevel=.08, collection=car)
    for bz in (z - 5.4, z + 5.4):
        box("bogie frame", (0, .37, bz), (2.35, .28, 2.35), CHARCOAL, bevel=.08, collection=car)
        for x in (-.8, .8):
            cyl("bogie axle box", (x, .36, bz), .16, .30, STEEL, rotation=(0, math.pi / 2, 0), vertices=16, collection=car)
        for x in (-1.05, 1.05):
            cyl("wheel", (x, .27, bz), .43, .17, BLACK, rotation=(0, math.pi / 2, 0), vertices=24, collection=car)
            cyl("wheel hub", (x * 1.01, .27, bz), .14, .19, STEEL, rotation=(0, math.pi / 2, 0), vertices=16, collection=car)
        for zz in (-.72, .72):
            cyl("bogie brake disc", (0, .18, bz + zz), .23, .10, STEEL, rotation=(math.pi / 2, 0, 0), vertices=18, collection=car)
    # Rooftop HVAC pods, access covers and insulators.
    box("roof HVAC main", (0, 3.83, z), (1.35, .30, 3.9), CONCRETE, bevel=.14, collection=car)
    for dz in (-1.55, 1.55):
        box("roof HVAC end grille", (0, 4.00, z + dz), (1.05, .04, .18), BLACK, bevel=.03, collection=car)
        cyl("roof insulator", (0, 4.02, z + dz), .08, .45, YELLOW, rotation=(math.pi / 2, 0, 0), collection=car)
    if driving:
        # CAF S6 driving cab: silver rounded nose, deep black windshield, low
        # apron and the red/amber/blue RAVAN band carried across the front.
        box("CAF rounded driving nose", (0, 1.98, z + 9.25), (3.0, 3.1, 2.8), SILVER, bevel=.55, collection=car)
        box("large swept black windshield", (0, 2.72, z + 10.69), (2.15, 1.18, .08), WINDOW, bevel=.20, collection=car)
        box("driver lower black apron", (0, .90, z + 10.72), (2.60, .58, .12), BLACK, bevel=.12, collection=car)
        for j, stripe in enumerate((RAINBOW[0], RAINBOW[2], RAINBOW[4])):
            box("front RAVAN stripe", (0, 1.28 + j * .12, z + 10.77), (2.25, .06, .08), stripe, bevel=.015, collection=car)
        for x in (-.86, .86):
            cyl("front headlight", (x, 1.70, z + 10.78), .22, .10, HEADLIGHT, vertices=20, collection=car)
            cyl("front marker lamp", (x, 1.24, z + 10.79), .075, .10, TAIL, vertices=16, collection=car)
        box("front bumper", (0, .56, z + 10.80), (2.28, .36, .42), STEEL, bevel=.10, collection=car)
        box("automatic coupler", (0, .38, z + 11.06), (.66, .34, .52), CHARCOAL, bevel=.12, collection=car)
        beam("coupler red air hose", (-.36, .48, z + 11.13), (-.58, .38, z + 10.92), .035, RED, car)
        text("front destination sign", "PALO VERDE", (0, 3.40, z + 10.79), .20, DESTINATION, rotation=(0, 0, 0))
        text("Metro de Caracas", "METRO", (0, 2.92, z + 10.79), .13, BLACK, rotation=(0, 0, 0))
    else:
        # Inter-car gangway: black bellows and a silver diaphragm.
        box("rear gangway diaphragm", (0, 2.0, z - 9.72), (2.35, 2.35, .16), CHARCOAL, bevel=.12, collection=car)
    return car


def station_platform(name, z, layout="side", kind="underground"):
    g = bpy.data.collections.new(f"Station {name}")
    bpy.context.scene.collection.children.link(g)
    if layout == "island":
        box(f"{name} island platform", (5, .5, z), (6.8, 1.0, 82), PLATFORM, collection=g)
        for x in (1.6, 8.4): box("yellow tactile edge", (x, 1.04, z), (.16, .1, 82), YELLOW, collection=g)
        rail_centers = (0, 10)
    else:
        box(f"{name} west side platform", (-4.35, .5, z), (5.5, 1.0, 82), PLATFORM, collection=g)
        box(f"{name} east side platform", (8.35, .5, z), (5.5, 1.0, 82), PLATFORM, collection=g)
        for x in (-1.6, 5.6): box("yellow tactile edge", (x, 1.04, z), (.16, .1, 82), YELLOW, collection=g)
        rail_centers = (0, 4)
    make_track(z - 41, z + 41, rail_centers, g)
    # The real platforms use dark gridded floor tiles, yellow edge bands and
    # repeated boarding boxes. Fine seams make the compressed scale read like
    # a long station rather than a single blank slab.
    platform_xs = (5,) if layout == "island" else (-4.35, 8.35)
    for x in platform_xs:
        for zz in range(int(z - 40), int(z + 41), 2):
            box("platform tile seam", (x, 1.015, zz), (5.0 if layout == "island" else 4.2, .018, .028), BLACK, collection=g)
        for xx in ([x - 2.1, x, x + 2.1] if layout == "side" else [x - 2.1, x, x + 2.1]):
            box("platform cross seam", (xx, 1.02, z), (.025, .02, 80), BLACK, collection=g)
    # Tight floor seams/boarding markers.
    for x in ((5,) if layout == "island" else (-4.35, 8.35)):
        for zz in range(int(z - 36), int(z + 37), 12):
            box("boarding marker", (x if layout == "island" else (-1.0 if x < 0 else 6.0), 1.07, zz), (1.0, .035, 2.6), YELLOW, collection=g)
    if kind == "elevated":
        for x in (-7.5, 11.5):
            box("elevated deck", (x * .18, -.7, z), (19, .55, 82), CONCRETE, collection=g)
        # Caño Amarillo’s distinctive yellow tubular canopy.
        for zz in range(int(z - 38), int(z + 39), 8):
            for x in (-7.0, 11.0):
                beam("yellow roof support", (x, 1.0, zz), (x, 6.2, zz), .1, YELLOW, g)
            nodes = [(-7.0, 6.1, zz), (-4.0, 6.9, zz), (0.0, 7.5, zz), (4.0, 6.9, zz), (11.0, 6.1, zz)]
            for a, b in zip(nodes, nodes[1:]): beam("yellow space-frame roof", a, b, .07, YELLOW, g)
            for i in range(len(nodes) - 1):
                beam("triangular roof brace", nodes[i], (nodes[i+1][0], 6.1, zz + 3.4), .045, YELLOW, g)
        box("Caño translucent roof", (2, 7.1, z), (7.5, .08, 82), mat("translucent roof", (.65, .76, .68), roughness=.25), collection=g)
        box("Caño gray roof west", (-5.5, 6.85, z), (3.0, .12, 82), CONCRETE, collection=g)
        box("Caño gray roof east", (9.5, 6.85, z), (3.0, .12, 82), CONCRETE, collection=g)
        for x in (-7.45, 11.45): box("glass block rear wall", (x, 3.0, z), (.12, 4.2, 82), WINDOW, collection=g)
    else:
        # Photographic underground vocabulary: dark slats, linear fixtures,
        # station-specific wall finishes, and an open stair/mezzanine pocket.
        wallmat = TILE_BROWN if name == "Altamira" else TILE_YELLOW if name == "Capitolio" else TILE_BLUE if name == "Bellas Artes" else CONCRETE
        box("station left wall", (-7.7 if layout == "side" else -3.0, 3.3, z), (.25, 5.0, 82), wallmat, collection=g)
        box("station right wall", (11.0 if layout == "side" else 13.0, 3.3, z), (.25, 5.0, 82), wallmat, collection=g)
        for zz in range(int(z - 38), int(z + 39), 2):
            ceiling_x = 1.7 if layout == "side" else 5.0
            width = 16.5 if layout == "side" else 7.0
            box("dark slatted ceiling", (ceiling_x, 6.1 if name != "Bellas Artes" else 4.35, zz), (width, .12, .18), BLACK, collection=g)
        for zz in range(int(z - 34), int(z + 35), 12):
            box("rectangular fluorescent fixture", (0 if layout == "side" else 5, 5.95 if name != "Bellas Artes" else 4.25, zz), (2.4, .08, .45), LIGHT, collection=g)
        if name == "Capitolio":
            box("Capitolio chamfered stair beam", (1.7, 5.6, z - 9), (15.8, 1.0, 1.5), CONCRETE, bevel=.28, collection=g)
            box("Capitolio white tiled pier", (-2.3, 3.2, z - 9), (1.8, 4.2, 1.8), CONCRETE, collection=g)
            box("Capitolio white tile insert", (-2.3, 3.2, z - 8.05), (1.2, 3.1, .08), WHITE, collection=g)
            # Short El Silencio transfer portal at the end of the platform.
            box("Capitolio Line 2 transfer portal", (5.0, 3.2, z - 29), (5.3, 4.3, .35), TILE_YELLOW, bevel=.12, collection=g)
            box("Capitolio transfer dark opening", (5.0, 3.0, z - 29.15), (3.9, 2.8, .12), BLACK, bevel=.10, collection=g)
            text("Capitolio transfer sign", "LINEA 2  EL SILENCIO", (5.0, 4.55, z - 28.95), .22, WHITE)
        if name == "Bellas Artes":
            box("Bellas Artes central escalator cheek", (5, 2.15, z), (3.8, 2.2, 8), BLACK, bevel=.2, collection=g)
            text("Bellas Artes departure sign", "SALIDA", (5, 4.0, z), .3, WHITE)
            box("Bellas Artes island stair landing", (5, 2.25, z + 11), (4.2, 2.0, 6.0), CONCRETE, bevel=.25, collection=g)
            for zz in (z - 11, z + 11):
                box("Bellas Artes orange exit fascia", (5, 4.05, zz), (3.5, .14, .42), YELLOW, bevel=.05, collection=g)
        if name == "Plaza Venezuela":
            for x in (-6.8, 10.25):
                for zz in range(int(z - 10), int(z + 11), 5): cyl("warm transfer gallery column", (x, 3.2, zz), .42, 5.8, BEIGE, rotation=(math.pi / 2, 0, 0), vertices=20, collection=g)
            text("transfer sign", "TRANSFERENCIA  LINEA 2 / LINEA 3", (0, 6.3, z), .22, WHITE)
            # A lower transfer shaft makes the L1/L3 interchange legible while
            # keeping the playable route on the upper Line 1 level.
            box("Plaza Venezuela transfer shaft", (1.7, 3.75, z + 19), (4.2, .25, 12), CONCRETE, collection=g)
            for zz in range(int(z + 14), int(z + 25), 2):
                box("Plaza Venezuela escalator tread", (1.7, 3.9, zz), (3.2, .12, .22), STEEL, collection=g)
            box("Plaza Venezuela digital departure board", (2.2, 5.2, z - 20), (4.8, .12, 1.05), BLACK, bevel=.05, collection=g)
            text("Plaza Venezuela departure board", "L1  PALO VERDE   02 MIN", (2.2, 5.28, z - 20), .14, DESTINATION)
        if name == "Altamira":
            box("Altamira mezzanine", (5, 4.75, z - 15), (15.0, .28, 16), CONCRETE_LIGHT, collection=g)
            text("Altamira direction sign", "PALO VERDE     PROPATRIA", (5, 5.25, z - 15), .22, WHITE)
            box("Altamira green exit fascia", (5, 5.32, z + 16), (4.8, .12, .42), TEAL, bevel=.04, collection=g)
            text("Altamira exit sign", "SALIDA", (5, 5.40, z + 16), .20, WHITE)
    text(f"{name} station sign", name.upper(), (0, 4.8, z - 34), .34, WHITE)
    return g


def altamira_entrance(z):
    g = bpy.data.collections.new("Altamira Plaza entrance")
    bpy.context.scene.collection.children.link(g)
    box("Altamira street plaza west", (-1.6, 8.7, z), (6.8, .3, 22), CONCRETE_LIGHT, collection=g)
    box("Altamira street plaza east", (11.6, 8.7, z), (6.8, .3, 22), CONCRETE_LIGHT, collection=g)
    box("Altamira turquoise pool", (5, 5.1, z + 10), (7.4, .14, 4.7), WATER, collection=g)
    box("Altamira pedestrian bridge", (5, 7.05, z), (13.2, .3, 3.0), CONCRETE_LIGHT, collection=g)
    for x in (-1.3, 11.3): beam("teal bridge railing", (x, 7.3, z - 1.3), (x, 7.3, z + 1.3), .06, TEAL, g)
    for side in (-1, 1):
        x = -3 if side < 0 else 13
        for i in range(12):
            yy = 5.1 + i * .3
            zz = z - 7 + i * .5
            box("broad Altamira stair", (x, yy, zz), (3.8, .6 + i * .03, .5), CONCRETE_LIGHT, collection=g)
            beam("Altamira teal stair rail", (x - 1.7, yy + .5, zz - .2), (x - 1.7, yy + .7, zz + .5), .045, TEAL, g)
    for x in (-4.5, 14.5):
        box("Altamira planter", (x, 9.0, z - 9), (3.0, .45, 5.0), CONCRETE_LIGHT, collection=g)
        box("Altamira planted bed", (x, 9.3, z - 9), (2.6, .15, 4.3), GREEN, collection=g)
    # Plaza Francia landmark: a tall stone obelisk and a semicircular south
    # amphitheatre, both visible above the sunken Metro access in the reference.
    cone("Altamira Plaza Francia obelisk", (5, 12.0, z + 7), .72, .18, 8.8, OBELISK, rotation=(math.pi / 2, 0, 0), vertices=6, collection=g)
    for i in range(5):
        box("Altamira amphitheatre terrace", (5, 8.9 - i * .35, z - 1.8 - i * 1.15), (11.0 - i * .75, .30, .65), CONCRETE_LIGHT, bevel=.10, collection=g)
    for x in (2.0, 5.0, 8.0):
        box("Altamira cascade basin", (x, 8.95, z + 11), (1.7, .12, 2.0), FOUNTAIN, bevel=.20, collection=g)
    text("Altamira entrance fascia", "ALTAMIRA", (5, 6.1, z - 10), .48, WHITE)
    return g


def surface_contexts(stops):
    """Add the distinctive public-space cues around each station.

    The route is deliberately compressed for play, but the surface landmarks
    keep the five stops visually different when the exterior camera rises out
    of the platforms.
    """
    # Caño Amarillo: elevated viaduct, white station box, blue light poles and
    # the small Gardel memorial plaza documented beside the station.
    z = stops["Caño Amarillo"]
    g = bpy.data.collections.new("Caño Amarillo urban context")
    bpy.context.scene.collection.children.link(g)
    for x in (-6.8, 10.8):
        for zz in (z - 30, z - 10, z + 10, z + 30):
            box("Caño elevated viaduct pier", (x, -3.4, zz), (.72, 6.2, .72), CONCRETE_LIGHT, bevel=.08, collection=g)
    box("Caño station white concrete box", (1.9, 8.1, z), (17.0, .55, 54), CONCRETE_LIGHT, bevel=.12, collection=g)
    box("Caño recessed dark entrance", (1.9, 8.48, z - 25), (6.0, .08, 4.4), BLACK, bevel=.10, collection=g)
    box("Caño Metro pylon", (-4.8, 5.3, z - 25), (.75, 5.5, .75), YELLOW, bevel=.12, collection=g)
    text("Caño pylon letter", "M", (-4.8, 8.1, z - 25), .55, RED)
    for i, zz in enumerate((z - 4.0, z - 2.7, z - 1.4)):
        cyl("Gardel memorial figure", (-3.0 + i * .38, 2.4, zz), .18, 1.8, CHARCOAL, rotation=(math.pi / 2, 0, 0), vertices=12, collection=g)
        cyl("Gardel memorial head", (-3.0 + i * .38, 3.45, zz), .28, .45, CHARCOAL, rotation=(math.pi / 2, 0, 0), vertices=16, collection=g)
    return g


def capitolio_surface(z):
    """Historic-center red-brick Capitolio entrance block."""
    g = bpy.data.collections.new("Capitolio historic context")
    bpy.context.scene.collection.children.link(g)
    box("Capitolio brick facade", (1.8, 6.5, z - 24), (15.0, 2.8, 10.0), BRICK, bevel=.18, collection=g)
    # Three deep entrance bays with blue metal frames and light interiors.
    for zz in (z - 27.1, z - 24.0, z - 20.9):
        box("Capitolio arched entry surround", (1.8, 8.0, zz), (4.0, 1.0, 2.35), ARCH_BLUE, bevel=.38, collection=g)
        box("Capitolio entry opening", (1.8, 8.45, zz), (2.85, .12, 1.52), BLACK, bevel=.25, collection=g)
    box("Capitolio projecting station sign", (1.8, 8.35, z - 15.8), (6.8, .35, .95), BLACK, bevel=.06, collection=g)
    text("Capitolio facade sign", "M   CAPITOLIO", (1.8, 8.56, z - 15.8), .28, WHITE)
    return g


def bellas_artes_surface(z):
    """Low entrance portal beside the cultural district."""
    g = bpy.data.collections.new("Bellas Artes cultural context")
    bpy.context.scene.collection.children.link(g)
    box("Bellas Artes entrance landing", (5.0, 2.6, z - 25), (10.5, .55, 9.2), PAVING, bevel=.18, collection=g)
    box("Bellas Artes concrete portal", (5.0, 6.1, z - 25), (8.6, .55, 3.6), CONCRETE_LIGHT, bevel=.35, collection=g)
    box("Bellas Artes ventilation grille", (5.0, 6.44, z - 25), (6.4, .08, 1.05), BLACK, bevel=.12, collection=g)
    box("Bellas Artes black Metro fascia", (5.0, 5.5, z - 29.0), (6.4, .12, .78), BLACK, bevel=.05, collection=g)
    text("Bellas Artes street sign", "M   BELLAS ARTES", (5.0, 5.64, z - 29.0), .24, WHITE)
    for x in (0.6, 9.4):
        box("Bellas Artes museum wall", (x, 4.0, z - 37), (3.3, 4.0, 5.0), CONCRETE_LIGHT, bevel=.15, collection=g)
    return g


def plaza_venezuela_surface(z):
    """A small Plaza Venezuela fountain / transfer forecourt."""
    g = bpy.data.collections.new("Plaza Venezuela urban context")
    bpy.context.scene.collection.children.link(g)
    box("Plaza Venezuela paved forecourt", (2.0, 7.1, z - 25), (18.0, .35, 15.0), PAVING, collection=g)
    box("Plaza Venezuela fountain basin", (2.0, 7.45, z - 25), (8.2, .16, 5.5), FOUNTAIN, bevel=.25, collection=g)
    for x in (-1.0, 5.0):
        beam("Plaza Venezuela fountain jet", (x, 7.55, z - 25), (2.0, 10.3, z - 25), .07, WATER, g)
    box("Plaza Venezuela transfer sign pylon", (10.2, 8.9, z - 25), (.55, 3.8, .55), YELLOW, bevel=.08, collection=g)
    text("Plaza Venezuela pylon", "M   L1 / L3", (10.2, 10.85, z - 25), .24, BLACK)
    return g


def build_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for c in list(bpy.data.collections):
        if c.name != "Collection" and c.users == 0: bpy.data.collections.remove(c)
    # Long route track and five distinctive stations.
    route = bpy.data.collections.new("Linea 1 route")
    bpy.context.scene.collection.children.link(route)
    make_track(-220, 700, (0, 4), route)
    stops = [("Caño Amarillo", 0, "side", "elevated"), ("Capitolio", 160, "side", "underground"), ("Bellas Artes", 320, "island", "underground"), ("Plaza Venezuela", 480, "side", "underground"), ("Altamira", 640, "island", "underground")]
    for name, z, layout, kind in stops:
        station_platform(name, z, layout, kind)
    altamira_entrance(640)
    stop_map = {name: z for name, z, _layout, _kind in stops}
    surface_contexts(stop_map)
    capitolio_surface(stop_map["Capitolio"])
    bellas_artes_surface(stop_map["Bellas Artes"])
    plaza_venezuela_surface(stop_map["Plaza Venezuela"])
    # Seven-car CAF consist starts at Caño Amarillo, nose points +Z.
    for i in range(7): car_body(i, -9.6 - i * 19.6, driving=(i in (0, 6)))
    # Trackside markers and city context.
    for z in range(-180, 701, 40):
        box("yellow platform distance marker", (-7.0, .35, z), (.12, .7, .12), YELLOW, collection=route)
    # Camera and world lighting.
    # Side three-quarter view keeps the CAF consist readable while still
    # showing the Caño Amarillo space-frame behind it.
    bpy.ops.object.camera_add(location=(22, 7, -52))
    cam = bpy.context.object
    cam.name = "Metro exterior review camera"
    bpy.context.scene.camera = cam
    target = Vector((0, 2.0, -52))
    # World Y is vertical in this scene. Blender's conventional camera helper
    # uses local Y as the up axis and rolls a side-on view by 90°; tracking Z
    # keeps the train's longitudinal Z axis horizontal in review renders.
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Z").to_euler()
    cam.data.lens = 52
    bpy.ops.object.light_add(type="AREA", location=(10, 18, 18))
    bpy.context.object.data.energy = 2200
    bpy.context.object.data.shape = "DISK"
    bpy.context.object.data.size = 18
    bpy.ops.object.light_add(type="AREA", location=(20, 11, -52))
    fill = bpy.context.object
    fill.name = "exterior camera fill"
    fill.data.energy = 1800
    fill.data.shape = "DISK"
    fill.data.size = 14
    fill.rotation_euler = (Vector((0, 2.0, -52)) - fill.location).to_track_quat("-Z", "Z").to_euler()
    bpy.ops.object.light_add(type="SUN", location=(-20, 25, 15))
    bpy.context.object.data.energy = 2.0
    bpy.context.object.rotation_euler = (math.radians(25), math.radians(-25), math.radians(-25))
    # Dark studio world keeps the red CAF silhouette readable.
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (.006, .012, .02, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = .45
    scene = bpy.context.scene
    # Blender 5.2 exposes the realtime engine as BLENDER_EEVEE.
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 65
    scene.render.image_settings.file_format = "PNG"
    # Use Workbench for deterministic headless inspection renders. The saved
    # scene is restored to Eevee below so it remains ready for normal Blender
    # lighting and materials when opened interactively.
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_shadows = True
    scene.display.shading.show_cavity = True
    scene.display.shading.cavity_type = "WORLD"
    scene.render.filepath = RENDER
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.filepath = RENDER
    station_collections = [
        bpy.data.collections.get(f"Station {name}")
        for name in ("Caño Amarillo", "Capitolio", "Bellas Artes", "Plaza Venezuela", "Altamira")
    ]
    # First render: a clean CAF exterior inspection without the canopy hiding
    # the car body. The complete stations remain in the .blend file.
    for collection in station_collections:
        if collection:
            collection.hide_render = True
    cam.location = (15, 6.4, 22)
    target = Vector((0, 2.0, 0))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Z").to_euler()
    fill.rotation_euler = (target - fill.location).to_track_quat("-Z", "Z").to_euler()
    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    bpy.ops.render.render(write_still=True)
    # Second render: the characteristic open Altamira civic entrance.
    for collection in station_collections:
        if collection:
            collection.hide_render = False
    cam.data.lens = 43
    cam.location = (28, 19, 675)
    target = Vector((5, 5.0, 640))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Z").to_euler()
    fill.rotation_euler = (target - fill.location).to_track_quat("-Z", "Z").to_euler()
    station_render = os.path.join(ROOT, "blender", "metro_caracas_altamira_preview.png")
    scene.render.filepath = station_render
    bpy.ops.render.render(write_still=True)
    scene.render.filepath = RENDER
    scene.render.engine = "BLENDER_EEVEE"
    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    print(f"Saved {OUT}")
    print(f"Rendered {RENDER}")


if __name__ == "__main__":
    build_scene()
