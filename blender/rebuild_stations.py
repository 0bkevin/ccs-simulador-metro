"""Update only station collections in the saved Blender source and render QA.

Run with Blender -b blender/metro_caracas_line1.blend --python this_file.
The train is kept as authored. The background process exits after saving.
"""
import os
import sys
import bpy

sys.path.insert(0,os.path.dirname(__file__))
from station_models import STOPS, build_environment
from metro_caracas_scene import look_at_y_up, visibility, render_qa, QA

scene=bpy.context.scene
source=bpy.data.filepath
if not source:raise RuntimeError('Open the canonical .blend before rebuilding stations')
build_environment(STOPS)
scene['station_reference_document']='docs/STATION_REFERENCES.md'
scene['station_accuracy_status']='2012 photograph-led station-specific architecture; estimated dimensions; compressed alignment'
scene['station_reference_era']='2012'
camera=scene.objects.get('QA camera')
if camera is None:
    camera=bpy.data.objects.new('QA camera',bpy.data.cameras.new('QA camera'))
    scene.collection.objects.link(camera)
scene.camera=camera
engine=scene.render.engine
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=1280;scene.render.resolution_y=800
scene.display.shading.light='STUDIO'
scene.display.shading.color_type='MATERIAL'
scene.display.shading.show_shadows=True
scene.display.shading.show_cavity=True
scene.display.shading.cavity_type='BOTH'
scene.display.shading.curvature_ridge_factor=1.25
scene.display.shading.curvature_valley_factor=1.1
names=['Station '+n for n in STOPS]+['Altamira Plaza entrance','Bellas Artes cultural context','Linea 1 route']
visibility(['CAF car','CAF interior'],False)
os.makedirs(QA,exist_ok=True)
for i,(name,stop) in enumerate(STOPS.items(),1):
    visibility(names,False);visibility(['Station '+name],True)
    x=5 if name in ('Bellas Artes','Altamira') else (-6.0 if name=='Capitolio' else -3.9)
    core=stop-70
    camera.data.lens=24
    camera.location=(x,2.73,core-14)
    render_qa(scene,camera,f'station-{i:02d}-{name.lower().replace(" ","-")}.png',(x,2.98,core+1))
    if name!='Caño Amarillo':
        camera.data.lens=22
        cx=5 if name in ('Bellas Artes','Altamira') else 2
        camera.location=(cx,6.73,core+15.5 if name!='Plaza Venezuela' else core+34)
        render_qa(scene,camera,f'station-{i:02d}-concourse.png',(cx,6.6,core+31 if name!='Plaza Venezuela' else core+50))
for coll,file,position,target in (
    ('Bellas Artes cultural context','bellas-artes-street.png',(-.5,11.2,247),(-10,10.3,262)),
    ('Altamira Plaza entrance','altamira-north-plaza.png',(-17,13.2,597),(1,6.8,585)),
    ('Altamira Plaza entrance','altamira-south-plaza.png',(47,15,605),(37,6.1,585)),
):
    visibility(names,False);visibility([coll],True)
    camera.data.lens=30;camera.location=position
    render_qa(scene,camera,file,target)
visibility(names+['CAF car','CAF interior'],True)
scene.render.engine=engine
camera.location=(-4.4,2.73,-84);camera.data.lens=26
look_at_y_up(camera,(-4.4,3,-68))
scene['reference_document']='docs/BLENDER_REFERENCE_REBUILD.md'
bpy.ops.wm.save_as_mainfile(filepath=source)
print('Station rebuild saved; native train preserved:',source)
