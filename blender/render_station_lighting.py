"""Actual Cycles light/material QA. Does not modify or save the source .blend.

blender -b blender/metro_caracas_line1.blend --python blender/render_station_lighting.py -- --station altamira
Omit --station for all five platforms, the Altamira concourse and a tunnel.
"""
import argparse
import os
import sys
import bpy
sys.path.insert(0,os.path.dirname(__file__))
from station_config import STATIONS
from metro_caracas_scene import look_at_y_up
from station_lighting import setup_station_render, validate_surface_maps

args=argparse.ArgumentParser()
args.add_argument('--station',default='all')
args.add_argument('--samples',type=int,default=48)
args.add_argument('--width',type=int,default=1120)
opt=args.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
scene=bpy.context.scene;setup_station_render(scene);validate_surface_maps()
scene.cycles.samples=opt.samples
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.render.resolution_x=opt.width;scene.render.resolution_y=round(opt.width*.625)
scene.render.resolution_percentage=100
camera=scene.objects['QA camera'];scene.camera=camera;camera.data.lens=24
output=os.path.join(os.path.dirname(__file__),'qa','lighting');os.makedirs(output,exist_ok=True)

def render(name,collections,position,target,daylight=False):
    for c in bpy.data.collections:
        if c.name.startswith(('Station ','Tunnel ','CAF ','Linea 1')) or 'context' in c.name or 'entrance' in c.name:
            c.hide_render=c.name not in collections
    for obj in scene.objects:
        if obj.type=='LIGHT' and obj.name.startswith('QA '):obj.hide_render=True
    sun=scene.objects.get('QA soft sun')
    if sun:sun.hide_render=not daylight
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.18 if daylight else .008
    camera.location=position;look_at_y_up(camera,target)
    scene.render.filepath=os.path.join(output,name+'.png')
    bpy.ops.render.render(write_still=True)

for s in STATIONS:
    if opt.station not in ('all',s['id']):continue
    core=s['distance']-70
    x=5 if s['platformLayout']=='island' else -6 if s['id']=='capitolio' else -3.9
    collections=['Station '+s['name']]
    if s['id']=='cano-amarillo':collections.append('Caño Amarillo urban context')
    render(s['id'],collections,(x,2.73,core-14),(x,2.98,core+1),s['id']=='cano-amarillo')
if opt.station in ('all','concourse'):
    render('altamira-concourse',['Station Altamira'],(5,6.73,2105.5),(5,6.6,2121))
if opt.station in ('all','tunnel'):
    render('tunnel',['Tunnel cano-amarillo'],(0,2.5,145),(0,2.15,163))
if opt.station in ('details','escalator'):
    camera.data.lens=35
    render('altamira-escalator-detail',['Station Altamira'],(4.9,2.4,2087.7),(5.7,2.2,2091.2))
if opt.station=='details':
    camera.data.lens=35
    render('altamira-fixture-detail',['Station Altamira'],(4.2,3.5,2074.5),(2.8,4.4,2076.5))
print('Cycles fixture-lighting review complete:',output)
