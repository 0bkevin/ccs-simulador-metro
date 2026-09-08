"""Canonical Blender source scene for the Caracas Line 1 web export.

Geometry is authored by ``train_model.build_train`` and
``station_models.build_environment``. This module only assembles the native
scene, lighting, deterministic QA renders, and source metadata. Blender uses
Y up and Z along the route; no axis conversion is performed.
"""

from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "blender", "metro_caracas_line1.blend")
QA = os.path.join(ROOT, "blender", "qa")
sys.path.insert(0, os.path.dirname(__file__))

from train_model import build_train  # noqa: E402
from interior_model import build_interior
from station_models import STOPS, build_environment  # noqa: E402


def look_at_y_up(obj, target):
    forward = (Vector(target) - obj.location).normalized()
    world_up = Vector((0, 1, 0))
    right = forward.cross(world_up).normalized()
    up = right.cross(forward).normalized()
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Matrix((right, up, -forward)).transposed().to_quaternion()


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.users == 0:
            bpy.data.collections.remove(collection)


def setup_world(scene):
    world = scene.world or bpy.data.worlds.new("Metro studio world")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.018, 0.028, 0.04, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.32
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene["metro_coordinate_up"] = "Y"
    scene["metro_route_axis"] = "Z"
    scene["metro_station_distances"] = "0,160,320,480,640"
    scene["metro_train_cars"] = 7


def add_lighting(scene):
    for name, location, energy, size, target in (
        ("QA warm key", (12, 22, 20), 1500, 14, (0, 1.5, 0)),
        ("QA cool fill", (-18, 10, -30), 1000, 18, (0, 2, -30)),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        light.location = location
        look_at_y_up(light, target)
    data = bpy.data.lights.new("QA soft sun", "SUN")
    data.energy = 1.4
    sun = bpy.data.objects.new("QA soft sun", data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(28), math.radians(-22), math.radians(-25))


def visibility(prefixes, visible):
    for collection in bpy.data.collections:
        if any(collection.name == prefix or collection.name.startswith(prefix) for prefix in prefixes):
            collection.hide_render = not visible


def render_qa(scene, camera, filename, target):
    scene.camera = camera
    look_at_y_up(camera, target)
    scene.render.filepath = os.path.join(QA, filename)
    bpy.ops.render.render(write_still=True)


def build_scene():
    os.makedirs(QA, exist_ok=True)
    clear_scene()
    scene = bpy.context.scene
    setup_world(scene)
    train_collections = build_train()
    train_collections += build_interior()
    station_collections = build_environment(STOPS)
    add_lighting(scene)

    camera_data = bpy.data.cameras.new("QA camera")
    camera = bpy.data.objects.new("QA camera", camera_data)
    scene.collection.objects.link(camera)
    camera_data.lens = 52

    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    station_names = [f"Station {name}" for name in STOPS]
    train_names = [collection.name for collection in train_collections]
    # Workbench gives deterministic, lit geometry QA quickly in headless CI;
    # the saved native scene remains Eevee-ready for interactive inspection.
    qa_engine = scene.render.engine
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_shadows = True
    scene.display.shading.show_cavity = True
    visibility(station_names + ["Linea 1 route", "Altamira Plaza entrance", "Bellas Artes cultural context"], False)
    camera.location = (6.0, 3.3, 13.0)
    render_qa(scene, camera, "train-front.png", (0, 2.0, 2.0))
    camera.location = (15.0, 4.5, -64.0)
    camera_data.lens = 58
    render_qa(scene, camera, "train-side.png", (0, 2.0, -64.0))

    visibility(station_names + ["Linea 1 route", "Altamira Plaza entrance", "Bellas Artes cultural context"], True)
    visibility(train_names, False)
    camera_data.lens = 25
    for index, (name, distance) in enumerate(STOPS.items(), 1):
        layout_x = 5.0 if name in ("Bellas Artes", "Altamira") else -4.35
        camera.location = (layout_x, 2.72, distance - 94.0)
        safe_name = name.lower().replace(" ", "-")
        render_qa(scene, camera, f"station-{index:02d}-{safe_name}.png", (layout_x, 3.05, distance - 65.0))

    visibility(train_names, True)
    scene.render.engine = qa_engine
    camera.location = (6.0, 3.3, 10.0)
    camera_data.lens = 40
    look_at_y_up(camera, (0, 2.0, -1.0))
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                area.spaces.active.region_3d.view_perspective = 'CAMERA'
                area.spaces.active.overlay.show_floor = False
                area.spaces.active.shading.color_type = 'MATERIAL'
    scene['reference_document'] = 'docs/BLENDER_REFERENCE_REBUILD.md'
    scene['accuracy_status'] = 'Photo-based reconstruction; dimensions estimated except provisional component references.'
    scene.render.filepath = os.path.join(QA, "train-front.png")
    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    print(f"Saved canonical source: {OUT}")
    print(f"QA renders: {QA}")
    return train_collections, station_collections


if __name__ == "__main__":
    build_scene()
