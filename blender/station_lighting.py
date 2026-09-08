"""Native fixture sources, in metres, shared with the web export.

Fixture arrangement/type follows the photographs. Output and white balance are
rendering estimates: no lamp schedule, measured lux or IES files were available.
Blender area-light watts below are radiant rendering power, NOT electrical load.
"""
import math
import bpy
from mathutils import Vector

COLORS = {'fluorescent': (.84, .91, 1.0), 'warm': (1.0, .78, .51),
          'utility': (.92, 1.0, .85), 'daylight': (.83, .91, 1.0)}


def fixture_light(c, family, position, width, height, power, tone='fluorescent', direction=(0,-1,0)):
    name=f'{c.name} / {family} / {position[0]:.2f},{position[1]:.2f},{position[2]:.2f}'
    data=bpy.data.lights.new(name,'AREA')
    data.shape='RECTANGLE'; data.size=width; data.size_y=height
    data.energy=power; data.color=COLORS[tone]
    if hasattr(data,'normalize'): data.normalize=True
    data.use_shadow=True
    obj=bpy.data.objects.new(name,data); c.objects.link(obj)
    obj.location=position
    # Local -Z emits; local X remains the long transverse fixture axis.
    obj.rotation_mode='QUATERNION'
    obj.rotation_quaternion=Vector(direction).to_track_quat('-Z','Y')
    if direction==(0,-1,0):
        obj.rotation_mode='XYZ'; obj.rotation_euler=(-math.pi/2,0,0)
    obj['fixtureFamily']=family; obj['tone']=tone
    obj['lightingBasis']='Photo-led appearance; radiant power and color estimated; no measured photometry'
    obj['fixtureId']=name
    return obj


def setup_station_render(scene):
    """Save an actually lit native scene, not a Workbench material-color view."""
    scene.render.engine='CYCLES'
    scene.cycles.samples=48
    scene.cycles.use_denoising=True
    scene.cycles.max_bounces=6
    scene.cycles.diffuse_bounces=4
    scene.cycles.glossy_bounces=4
    scene.cycles.use_light_tree=True
    scene.view_settings.view_transform='AgX'
    scene.view_settings.exposure=0
    scene.world.use_nodes=True
    bg=scene.world.node_tree.nodes.get('Background')
    bg.inputs['Color'].default_value=(.67,.77,1,1)
    bg.inputs['Strength'].default_value=.18
    # Daylight is only useful outdoors. Opaque native slabs/screens occlude it
    # in Cycles; underground review renders explicitly disable this sun.
    sun=bpy.data.objects.get('QA soft sun')
    if sun:
        sun.data.energy=1.5; sun.data.angle=math.radians(8)
        # The architectural scene is Y-up; the old studio Euler angles aimed
        # this sun upward. Match the above-canopy daylight used by the viewer.
        sun.rotation_mode='QUATERNION'
        sun.rotation_quaternion=Vector((18,-28,12)).to_track_quat('-Z','Y')
    for name in ('QA warm key','QA cool fill'):
        if bpy.data.objects.get(name):bpy.data.objects[name].hide_render=True
    scene['station_lighting_basis']='Native fixture AREA lights; photo-led type/tone, estimated rendering power; see docs/STATION_LIGHTING.md'


def validate_surface_maps():
    image=bpy.data.images['Metro rubber flooring stud normals']
    blue=list(image.pixels)[2::4]
    assert min(blue)>.85, 'Invalid rubber normal map: blue channel must point outward, not turn the floor black'
    for image in bpy.data.images:
        if image.name.startswith('Metro ') and image.name.endswith(('normals','roughness',' color')):
            assert image.packed_file, f'Surface texture must be packed: {image.name}'
