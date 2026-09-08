"""Rebuild native CAF saloons without disturbing the authored exterior/stations.

Blender -b source.blend -t 4 --python blender/rebuild_interior.py -- --output /tmp/review.blend
Omit --output only when deliberately updating the canonical source.
Does not export or start a GUI/server. Exterior apertures are a separate pass.
"""
import argparse
import os
import sys
import bpy

sys.path.insert(0,os.path.dirname(__file__))
from interior_model import build_interior

parser=argparse.ArgumentParser()
parser.add_argument('--output')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
source=bpy.data.filepath
if not source: raise RuntimeError('Open the saved metro source before rebuilding its interior')
collections=build_interior()
bpy.context.scene['interior_reference_document']='docs/TRAIN_INTERIOR_REFERENCES.md'
bpy.context.scene['interior_accuracy_status']='CAF delivery passenger interior from original photos; estimated dimensions, no authenticated interior CAD'
for coll in collections:
    print(coll.name,len(coll.objects),'objects',sum(1 for o in coll.objects if o.get('interior_role')=='seat'),'seats')
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.output or source))
print('Saved native CAF passenger interior:',args.output or source)
