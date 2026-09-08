"""Export the authored Caracas Metro scene for the web.

This script is intentionally run by Blender in background mode.  It reads the
source blend, evaluates modifiers, makes a temporary export scene, and never
saves the source file.  The source scene uses Y as height and Z as the route
axis; ``export_yup=False`` is therefore deliberate.

Usage::

    blender -b blender/metro_caracas_line1.blend --python blender/export_web.py -- \
      --output public/models/blender
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

import bpy
from mathutils import Vector


TRAIN_COLLECTIONS = [f"CAF car {i:02d}" for i in range(1, 8)]
INTERIOR_COLLECTIONS = [f"CAF interior {i:02d}" for i in range(1, 8)]
sys.path.insert(0, os.path.dirname(__file__))
from station_config import STATIONS, SPEC
STATION_COLLECTIONS = [(s['id'], s['name'], 'Station '+s['name'], s['distance']) for s in STATIONS]
CONTEXT_COLLECTIONS = [
    "Altamira Plaza entrance",
    "Caño Amarillo urban context",
    "Capitolio historic context",
    "Bellas Artes cultural context",
    "Plaza Venezuela urban context",
]
LABEL_NAMES = {"front destination sign", "Metro de Caracas", "front destination sign.001", "Metro de Caracas.001"}


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--output", default="public/models/blender")
    p.add_argument("--source", default=bpy.data.filepath)
    return p.parse_args(argv)


def source_hash(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def area_lights(scene, prefix=('Station ', 'Tunnel ', 'Bellas Artes cultural context', 'Altamira Plaza entrance')):
    """Preserve native area lights, which glTF's punctual-light extension omits."""
    result = []
    for obj in scene.objects:
        if obj.type != 'LIGHT' or obj.data.type != 'AREA':
            continue
        if not any(c.name.startswith(prefix) for c in obj.users_collection):
            continue
        light = obj.data
        position, rotation, scale = obj.matrix_world.decompose()
        result.append({
            'name': obj.name,
            'collection': obj.users_collection[0].name,
            'position': list(position),
            'quaternion': [rotation.x, rotation.y, rotation.z, rotation.w],
            'color': list(light.color),
            'power': light.energy,
            'width': light.size * abs(scale.x),
            'height': (light.size_y if light.shape in {'RECTANGLE', 'ELLIPSE'} else light.size) * abs(scale.y),
            'fixtureId': obj.get('fixtureId', obj.name),
            'family': obj.get('fixtureFamily', 'train interior'),
            'tone': obj.get('tone', 'fluorescent'),
            'basis': obj.get('lightingBasis', 'Native train interior source'),
        })
    return result


def bounds_init():
    return [Vector((float("inf"),) * 3), Vector((float("-inf"),) * 3)]


def bounds_add(bounds, point):
    bounds[0].x = min(bounds[0].x, point.x)
    bounds[0].y = min(bounds[0].y, point.y)
    bounds[0].z = min(bounds[0].z, point.z)
    bounds[1].x = max(bounds[1].x, point.x)
    bounds[1].y = max(bounds[1].y, point.y)
    bounds[1].z = max(bounds[1].z, point.z)


def bounds_json(bounds):
    if bounds[0].x == float("inf"):
        return {"min": [0, 0, 0], "max": [0, 0, 0], "size": [0, 0, 0]}
    mn, mx = bounds
    return {
        "min": [round(float(v), 5) for v in mn],
        "max": [round(float(v), 5) for v in mx],
        "size": [round(float(mx[i] - mn[i]), 5) for i in range(3)],
    }


def source_objects(collection_names, include_labels=False, exclude_names=None):
    exclude_names = exclude_names or set()
    result = []
    for name in collection_names:
        coll = bpy.data.collections.get(name)
        if coll:
            result.extend(o for o in coll.objects if o.type in {"MESH", "FONT", "CURVE", "SURFACE", "META"} and o.name not in exclude_names)
    if include_labels:
        coll = bpy.data.collections.get("Collection")
        if coll:
            result.extend(o for o in coll.objects if o.name in LABEL_NAMES and o.name not in exclude_names)
    # An object can be linked into multiple collections. Preserve one copy.
    seen = set()
    return [o for o in result if not (o.as_pointer() in seen or seen.add(o.as_pointer()))]


def make_export_scene(asset_name, source_objs, source_depsgraph):
    scene = bpy.data.scenes.new(f"Web export {asset_name}")
    root = bpy.data.collections.new(asset_name)
    scene.collection.children.link(root)
    depsgraph = source_depsgraph
    groups = defaultdict(list)
    stats = {"meshes": 0, "triangles": 0, "bounds": bounds_init(), "collections": {}}
    made = []
    source_by_obj = {}
    moving_parents = {}

    for src in source_objs:
        # Use the evaluated object so bevels and every other viewport modifier
        # are baked into the exported mesh.
        evaluated = src.evaluated_get(depsgraph)
        try:
            mesh = evaluated.to_mesh()
        except RuntimeError:
            continue
        if mesh is None or not mesh.vertices:
            if mesh is not None:
                evaluated.to_mesh_clear()
            continue
        mesh = mesh.copy()
        evaluated.to_mesh_clear()
        mesh.name = f"{asset_name} {src.name} baked"
        out = bpy.data.objects.new(src.name, mesh)
        root.objects.link(out)
        out.matrix_world = src.matrix_world.copy()
        source_collection = src.users_collection[0].name if src.users_collection else "Uncategorized"
        out["sourceCollection"] = source_collection
        out["sourceObject"] = src.name
        for poly in mesh.polygons:
            stats["triangles"] += max(0, len(poly.vertices) - 2)
        stats["meshes"] += 1
        key = tuple(m.name if m else "__none__" for m in mesh.materials)
        motion = src.parent if src.parent and (src.parent.get('doorId') or src.parent.get('cabControlId')) else None
        motion_id = (motion.get('doorId') or motion.get('cabControlId')) if motion else None
        if motion:
            if motion_id not in moving_parents:
                parent = bpy.data.objects.new(motion.name, None)
                root.objects.link(parent)
                for prop in ('doorId','doorSide','doorCentreLocal','doorTravelX','doorTravelZ','cabControlId','cabControl','carIndex','cabDirection'):
                    if prop in motion:parent[prop] = motion[prop]
                parent.matrix_world=motion.matrix_world.copy()
                parent['sourceCollection'] = motion.users_collection[0].name
                moving_parents[motion_id] = parent
            out['motionId'] = motion_id
            if motion.get('doorId'):out['doorId'] = motion_id
        groups[(source_collection, key, motion_id)].append(out)
        source_by_obj[out.name] = source_collection
        coll_name = source_collection
        cstats = stats["collections"].setdefault(coll_name, {"meshes": 0, "triangles": 0, "bounds": bounds_init()})
        cstats["meshes"] += 1
        cstats["triangles"] += sum(max(0, len(p.vertices) - 2) for p in mesh.polygons)
        for vertex in mesh.vertices:
            bounds_add(stats["bounds"], out.matrix_world @ vertex.co)
            bounds_add(cstats["bounds"], out.matrix_world @ vertex.co)
        made.append(out)

    # Switch to the temporary scene before any selection or join operation;
    # Blender rejects selecting objects outside the active view layer.
    bpy.context.window.scene = scene
    bpy.context.window.view_layer = scene.view_layers[0]

    # Parent collection groups to named empties. Objects keep their world
    # matrices, so the original scene coordinates remain inspectable in Three.
    empties = {}
    for collection_name in stats["collections"]:
        empty = bpy.data.objects.new(collection_name, None)
        empty.empty_display_type = "PLAIN_AXES"
        empty["sourceCollection"] = collection_name
        empty["sourceAsset"] = asset_name
        root.objects.link(empty)
        empties[collection_name] = empty
    for obj in made:
        collection_name = source_by_obj.get(obj.name, "Uncategorized")
        world = obj.matrix_world.copy()
        obj.parent = moving_parents.get(obj.get('motionId')) or empties.get(collection_name)
        obj.matrix_world = world
    for parent in moving_parents.values():
        parent.parent = empties[parent['sourceCollection']]

    # Join compatible static meshes by collection and material signature. The
    # active object's world transform is retained by Blender's join operator.
    for (collection_name, _materials, _motion_id), objects in groups.items():
        if len(objects) < 2:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()

    # Select the temporary scene's complete hierarchy for GLB export.
    for obj in scene.objects:
        if obj.type == "MESH":
            # Joining evaluated meshes can leave redundant edge/loop data.
            # Validate the disposable export copy, preserving the native file.
            obj.data.validate(verbose=False, clean_customdata=False)
            obj.data.update()
    bpy.context.view_layer.objects.active = root.objects[0] if root.objects else None
    for obj in scene.objects:
        obj.select_set(True)
    return scene, stats


def export_scene(scene, filepath):
    bpy.context.window.scene = scene
    bpy.context.window.view_layer = scene.view_layers[0]
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=False,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_extras=True,
        export_keep_originals=False,
        use_active_scene=True,
        export_hierarchy_full_collections=False,
    )


def clean_scene(scene):
    bpy.data.scenes.remove(scene)


def main():
    args = parse_args()
    source = os.path.abspath(args.source)
    output = os.path.abspath(args.output)
    os.makedirs(output, exist_ok=True)
    if os.path.abspath(bpy.data.filepath) != source:
        raise RuntimeError(f"Loaded blend does not match --source: {bpy.data.filepath}")
    loaded_hash = source_hash(source)
    # Interior rebuilds can leave thousands of unlinked mesh datablocks.
    # Purge only those orphans in this disposable process: join() otherwise
    # scans every stale ID for each mesh. The authored source is never saved.
    bpy.data.orphans_purge(do_local_ids=True, do_linked_ids=False, do_recursive=True)
    from station_lighting import validate_surface_maps
    validate_surface_maps()
    source_scene = bpy.context.scene
    lighting = {'areaLights': area_lights(source_scene), 'trainAreaLights': area_lights(source_scene, 'CAF interior '),
                'basis': 'Native fixture sources; photo-led appearance, estimated rendering power; not measured photometry',
                'powerUnit': 'Blender radiant watts; not electrical lamp wattage'}
    source_depsgraph = source_scene.view_layers[0].depsgraph

    train_objs = source_objects(TRAIN_COLLECTIONS + INTERIOR_COLLECTIONS, include_labels=True)
    env_names = ["Collection", "Linea 1 route", *["Tunnel "+s["id"] for s in STATIONS], *[x[2] for x in STATION_COLLECTIONS], *CONTEXT_COLLECTIONS]
    env_objs = source_objects(env_names, include_labels=False, exclude_names=LABEL_NAMES)
    if len(train_objs) == 0 or len(env_objs) == 0:
        raise RuntimeError(f"Unexpected empty source selection train={len(train_objs)} environment={len(env_objs)}")

    scenes = []
    records = {}
    try:
        for asset_name, objects, filename in (("train", train_objs, "train.glb"), ("environment", env_objs, "environment.glb")):
            scene, stats = make_export_scene(asset_name, objects, source_depsgraph)
            scenes.append(scene)
            export_scene(scene, os.path.join(output, filename))
            records[asset_name] = {
                "path": f"models/blender/{filename}",
                "meshes": stats["meshes"],
                "triangles": stats["triangles"],
                "bounds": bounds_json(stats["bounds"]),
                "collections": {
                    key: {"meshes": value["meshes"], "triangles": value["triangles"], "bounds": bounds_json(value["bounds"])}
                    for key, value in stats["collections"].items()
                },
            }
            print(f"[export_web] wrote {filename}: {stats['meshes']} meshes, {stats['triangles']} triangles")
    finally:
        for scene in scenes:
            clean_scene(scene)

    if source_hash(source) != loaded_hash:
        raise RuntimeError('Source .blend changed during export; rebuild the export from the saved source')
    manifest = {
        "schema": "metro-blender-web-export/1",
        "source": {"file": os.path.basename(source), "sha256": loaded_hash},
        "coordinateSystem": {"up": "Y", "routeAxis": "Z", "exportYup": False},
        "scale": {"units": "metres", "route": SPEC["route"], "tunnel": SPEC["tunnel"]},
        "train": {"carCount": len(TRAIN_COLLECTIONS), "collections": TRAIN_COLLECTIONS,
            "doors": {"leafCount": 112, "baysPerSidePerCar": 4,
                "centresLocalMetres": {name:list(bpy.data.collections[name]['door_centres_local_m']) for name in TRAIN_COLLECTIONS},
                "mechanism": "paired exterior sliding leaves", "nodeProperty": "doorId",
                "travelMetres": .895, "clearanceMetres": .115,
                "timingBasis": "visual estimate; not a manufacturer cycle specification"},
            "interior": {
                "collections": [name for name in INTERIOR_COLLECTIONS if bpy.data.collections.get(name)],
                "cars": [{"index": i, "center": float(bpy.data.collections[name]['center_z']),
                    "direction": int(bpy.data.collections[name]['direction']),
                    "floorY": float(bpy.data.collections[name]['floor_y_m']),
                    "eyeY": float(bpy.data.collections[name]['eye_y_m']),
                    **({"cabEyeLocal": list(bpy.data.collections[name]['cab_eye_local_m'])} if 'cab_eye_local_m' in bpy.data.collections[name] else {})}
                    for i,name in enumerate(INTERIOR_COLLECTIONS,1) if bpy.data.collections.get(name)],
            }},
        "stations": [
            {**STATIONS[i], "collection": collection}
            for i, (station_id, name, collection, distance) in enumerate(STATION_COLLECTIONS)
        ],
        "assets": records,
        "lighting": lighting,
    }
    with open(os.path.join(output, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"[export_web] wrote manifest.json (source sha256 {manifest['source']['sha256']})")


if __name__ == "__main__":
    main()
