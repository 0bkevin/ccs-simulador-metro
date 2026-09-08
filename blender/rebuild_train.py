"""Rebuild CAF exterior apertures and passenger interior, preserving stations.

Blender -b blender/metro_caracas_line1.blend -t 4 --python blender/rebuild_train.py
Add -- --render for a native Cycles saloon check. No GUI or server is started.
"""
import os
import sys
import bpy
sys.path.insert(0, os.path.dirname(__file__))
from train_model import build_train
from interior_model import build_interior
from metro_caracas_scene import look_at_y_up

scene = bpy.context.scene
source = bpy.data.filepath
if not source: raise RuntimeError('Open the canonical source first')
build_train()
interiors = build_interior()
scene['interior_reference_document'] = 'docs/TRAIN_INTERIOR_REFERENCES.md'
scene['interior_accuracy_status'] = 'CAF delivery passenger saloons and operator cabs from photographs and equipment guide; furniture dimensions estimated, no authenticated interior CAD'
bpy.context.view_layer.update()
camera = scene.objects.get('QA camera')
camera.location = (.22, 2.57, -1.1)
camera.data.lens = 21
look_at_y_up(camera, (.22, 2.57, -14))
scene.camera = camera
bpy.ops.wm.save_as_mainfile(filepath=source)
print('Saved exterior apertures and seven native saloons; stations preserved', flush=True)
if '--render' in sys.argv:
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 960
    scene.render.resolution_y = 600
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(os.path.dirname(source),'qa','train-interior-native.png')
    bpy.ops.render.render(write_still=True)
