"""Photo-led native passenger saloon for the Caracas CAF Serie 6.

Delivery photograph (Beasain, November 2010) and ALAMYS's April 2015
Caracas interior photo govern the finishes and longitudinal seating. These
are not dimensioned interior plans. Heights and furniture sizes below are
explicit estimates fitted to the existing maintenance-drawing body envelope.
Y is up, Z runs along the railway; do not rotate to Blender's usual Z-up.
"""
from __future__ import annotations

import math
import random
import bpy
from mathutils import Vector
from body_geometry import BODY_HALF_LENGTH, CAR_PITCH, DOOR_CENTRES, body_width
from train_model import _material, _mesh, _box as _native_box, _beam, _tube, _cylinder, _rounded_rect

FLOOR_Y = 1.07
EYE_Y = 2.57
CEILING_Y = 3.40
SEAT_PITCH = .475
REFERENCE = 'docs/TRAIN_INTERIOR_REFERENCES.md'


def _box(name,loc,dims,material,collection,bevel=0):
    obj=_native_box(name,loc,dims,material,collection,bevel)
    if bevel:
        # Millimetre edge breaks do not need the exterior cab's four-step
        # bevel tessellation repeated on thousands of tiny saloon fittings.
        obj.modifiers[-1].segments=1 if bevel<.020 else 2
    return obj


def car_frame(index):
    return -7.73 - (index - 1) * CAR_PITCH, -1 if index == 7 else 1


def _materials():
    mats = {
        'liner': _material('CAF interior warm white molded liner', (.76,.77,.73), .04,.4),
        'shell': _material('CAF interior pale seat perimeter', (.78,.79,.75), .05,.32),
        'red': _material('CAF interior vermilion seating', (.72,.035,.019), .02,.29),
        'blue': _material('CAF interior blue priority seating', (.014,.022,.34), .03,.25),
        'door': _material('CAF interior red door skin', (.60,.018,.010), .05,.34),
        'steel': _material('CAF interior satin stainless steel', (.55,.58,.56), .82,.26),
        'dark': _material('CAF interior black seals and straps', (.016,.021,.023), .03,.60),
        'seam': _material('CAF interior narrow panel joints', (.19,.23,.24), .12,.55),
        'floor': _material('CAF interior blue flecked resilient flooring', (.24,.37,.42), .0,.74),
        'light': _material('CAF interior opal light diffusers', (.88,.92,.94), .0,.34, (.76,.86,1.0)),
    }
    # Small authored repeat, not reference photography. Metre-scaled UVs keep
    # the fine blue-floor flecks a surface finish rather than oversized gravel.
    mat=mats['floor']; nodes=mat.node_tree.nodes; links=mat.node_tree.links
    for node in list(nodes):
        if node.type=='TEX_IMAGE': nodes.remove(node)
    size=128; rng=random.Random(1612010); pixels=[]
    def linear_to_srgb(v): return 12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055
    for _ in range(size*size):
        delta=rng.uniform(-.055,.055)
        if rng.random()<.055: delta-=.075
        pixels.extend([linear_to_srgb(max(.02,c+delta)) for c in (.24,.37,.42)]+[1])
    old=bpy.data.images.get('CAF original blue floor flecks')
    if old: bpy.data.images.remove(old)
    im=bpy.data.images.new('CAF original blue floor flecks',width=size,height=size)
    im.colorspace_settings.name='sRGB'; im.pixels.foreach_set(pixels); im.pack()
    tex=nodes.new('ShaderNodeTexImage');tex.image=im;tex.interpolation='Linear';tex.extension='REPEAT'
    links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
    return mats


def _floor(name,z0,z1,width,mats,coll):
    obj=_box(name,(0,FLOOR_Y-.022,(z0+z1)/2),(width,.044,z1-z0),mats['floor'],coll)
    uv=obj.data.uv_layers.new(name='floor metres')
    for face in obj.data.polygons:
        for li in face.loop_indices:
            v=obj.data.vertices[obj.data.loops[li].vertex_index].co
            uv.data[li].uv=(v.x/.25,v.z/.25)
    return obj


def _panel(name,side,y0,y1,z0,z1,mat,coll,inset=.065):
    """An inward-facing wall patch following the existing canted section."""
    verts=[]
    for i in range(9):
        y=y0+(y1-y0)*i/8
        verts.extend([(side*(body_width(y)-inset),y,z0),(side*(body_width(y)-inset),y,z1)])
    faces=[(2*i,2*i+1,2*i+3,2*i+2) for i in range(8)]
    if side<0: faces=[tuple(reversed(f)) for f in faces]
    return _mesh(name,verts,faces,mat,coll,True)


def _inner_window(side,zc,width,mats,coll):
    # Ring only: real apertures and glazing belong to the exterior shell.
    outer=_rounded_rect(zc-width/2-.050,zc+width/2+.050,2.147,3.083,.090,5)
    inner=_rounded_rect(zc-width/2,zc+width/2,2.195,3.035,.065,5)
    verts=[(side*(body_width(y)-.069),y,z) for z,y in outer+inner]
    n=len(outer);faces=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    _mesh('CAF interior recessed window gasket',verts,faces,mats['dark'],coll,True)
    _panel('CAF interior window reveal sill',side,2.12,2.147,zc-width/2-.052,zc+width/2+.052,mats['steel'],coll,.074)


def _walls(center,direction,driving,mats,coll):
    u0=-10.21;u1=8.10 if driving else 10.21
    z0,z1=sorted([center+direction*u0,center+direction*u1])
    windows=[(center+direction*u,1.672) for u in (-4.666,0,4.666)]
    windows +=[(center+direction*u,.702) for u in ((-8.73,) if driving else (-8.73,8.73))]
    doorz=[center+direction*u for u in DOOR_CENTRES]
    for side in (-1,1):
        # Split all lining at door edges; leave each real doorway clear.
        cuts=sorted([z0,z1]+[z+off for z in doorz for off in (-.9,.9)])
        for a,b in zip(cuts,cuts[1:]):
            if any(abs((a+b)/2-z)<.89 for z in doorz): continue
            _panel('CAF interior below-window molded lining',side,FLOOR_Y,2.15,a,b,mats['liner'],coll)
            _panel('CAF interior upper window header',side,3.083,3.22,a,b,mats['liner'],coll)
            wc=[(z,w) for z,w in windows if a<z<b]
            edges=sorted([a,b]+[z+off for z,w in wc for off in (-w/2-.050,w/2+.050)])
            for aa,bb in zip(edges,edges[1:]):
                if any(abs((aa+bb)/2-z)<w/2+.049 for z,w in wc): continue
                _panel('CAF interior window pier',side,2.15,3.083,aa,bb,mats['liner'],coll)
            _panel('CAF interior stainless skirting',side,FLOOR_Y+.012,1.21,a,b,mats['steel'],coll,.074)
        for z,w in windows: _inner_window(side,z,w,mats,coll)
        for z in doorz:
            for leaf in (-1,1):
                zz=z+leaf*.442
                _panel('CAF interior door lower red panel',side,FLOOR_Y,2.147,zz-.433,zz+.433,mats['door'],coll,.048)
                _panel('CAF interior door upper red panel',side,3.083,3.105,zz-.433,zz+.433,mats['door'],coll,.048)
                for edge in (-1,1):
                    _panel('CAF interior door window red stile',side,2.147,3.083,zz+edge*.37-.063,zz+edge*.37+.063,mats['door'],coll,.048)
                _inner_window(side,zz,.520,mats,coll)
            _panel('CAF interior door meeting seal',side,FLOOR_Y,3.10,z-.007,z+.007,mats['dark'],coll,.074)
            _panel('CAF interior rounded door mechanism header',side,3.115,3.24,z-.915,z+.915,mats['liner'],coll,.095)
            for edge in (-1,1):
                _panel('CAF interior door jamb',side,FLOOR_Y,3.16,z+edge*.89-.026,z+edge*.89+.026,mats['steel'],coll,.09)
            _box('CAF interior door threshold',(side*1.35,FLOOR_Y+.006,z),(.17,.012,1.77),mats['steel'],coll)
            for x in (1.30,1.34,1.38):
                _box('CAF interior threshold grooves',(side*x,FLOOR_Y+.014,z),(.006,.003,1.72),mats['dark'],coll)


# One continuous molded seat, traced from its visible S section. At its sides
# the shell curls upward; broad pan and back remain softly dished, not cuboids.
SEAT_PROFILE=((1.305,2.145),(1.30,2.135),(1.286,2.095),(1.266,1.96),
              (1.235,1.79),(1.213,1.65),(1.19,1.585),(1.15,1.55),
              (1.085,1.535),(.96,1.54),(.84,1.557),(.785,1.565),(.760,1.548),(.758,1.527))


def _seat(side,z,mat,mats,coll):
    def surface(name,painted):
        verts=[];faces=[];count=10
        profile=SEAT_PROFILE[1:-1] if painted else SEAT_PROFILE
        for row,(x,y) in enumerate(profile):
            t=row/(len(profile)-1)
            half=(.206 if painted else .231)*(1-.08*math.exp(-t*30))
            for j in range(count+1):
                s=j/count*2-1
                # White perimeter is visible around a smaller colored face.
                relief=.020*s*s
                back=t<.51
                xx=x-(relief if back else 0)-(.004 if painted else 0)
                yy=y+(0 if back else relief)+(.003 if painted else 0)
                verts.append((side*xx,yy,z+s*half))
        for i in range(len(profile)-1):
            for j in range(count):
                k=i*(count+1)+j;faces.append((k,k+1,k+count+2,k+count+1))
        if side>0: faces=[tuple(reversed(f)) for f in faces]
        obj=_mesh(name,verts,faces,mat if painted else mats['shell'],coll,True)
        if not painted:
            solid=obj.modifiers.new('molded shell thickness','SOLIDIFY');solid.thickness=.022
        return obj
    obj=surface('CAF interior individual molded seat shell',False)
    surface('CAF interior contoured blue priority seat' if mat==mats['blue'] else 'CAF interior contoured red passenger seat',True)
    obj['interior_role']='seat';obj['seat_pan_height_estimate_m']=.47


def _smooth_path(points,steps=3):
    points=[Vector(p) for p in points];result=[]
    for i in range(len(points)-1):
        a=points[max(0,i-1)];b=points[i];c=points[i+1];d=points[min(len(points)-1,i+2)]
        for j in range(steps):
            t=j/steps
            result.append(tuple(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)))
    return result+[tuple(points[-1])]


def _bench(side,zc,count,priority,mats,coll):
    width=count*SEAT_PITCH
    for k in range(count):_seat(side,zc+(k-(count-1)/2)*SEAT_PITCH,mats['blue' if priority else 'red'],mats,coll)
    _box('CAF interior suspended bench support',(side*1.225,1.46,zc),(.15,.11,width-.13),mats['steel'],coll,.015)
    for zz in (zc-width*.32,zc+width*.32):
        _beam('CAF interior wall-mounted seat cantilever',(side*1.39,1.31,zz),(side*.94,1.46,zz),.035,mats['steel'],coll,10)
    for end in (-1,1):
        z=zc+end*(width/2+.028)
        # Swept steel armrest and curved stanchion visible in both photographs.
        points=[(side*x,y,z) for x,y in ((1.33,1.96),(1.18,1.84),(.96,1.72),(.79,1.71),(.74,1.78),(.735,1.90),(.75,2.16),(.81,2.47),(.86,2.79),(.92,3.04),(1.03,3.13),(1.15,3.16))]
        _tube('CAF interior curved seat-end stanchion',_smooth_path(points),.018,mats['steel'],coll,8)
    return width


def _seating(center,direction,driving,index,mats,coll):
    for side in (-1,1):
        for u in (-4.666,0,4.666):
            # Accessible saloon at the cab end: ALAMYS shows 3 opposite 5.
            priority=driving and u==4.666
            count=3 if priority and side==1 else 5
            offset=-.475 if count==3 else 0
            _bench(side,center+direction*(u+offset),count,priority,mats,coll)
            if count==3:
                z=center+direction*(u+1.0)
                _beam('CAF interior wheelchair bay horizontal support',(side*1.29,1.91,z-.40),(side*1.29,1.91,z+.40),.018,mats['steel'],coll,12)
                for dz in (-.35,.35):
                    _beam('CAF interior wheelchair bay rail mounting',(side*1.29,1.91,z+dz),(side*1.40,1.91,z+dz),.018,mats['steel'],coll,12)
        for u in ((-8.96,) if driving else (-8.96,8.96)):
            _bench(side,center+direction*u,3,False,mats,coll)
    # Thin floor-to-ceiling centre poles at vestibules, one in each door bay.
    for u in DOOR_CENTRES:
        z=center+direction*u
        _beam('CAF interior vestibule centre pole',(0,FLOOR_Y,z),(0,3.36,z),.0175,mats['steel'],coll,12)
        for y in (FLOOR_Y+.009,3.36):
            _cylinder('CAF interior pole mounting rose',(0,y,z),.050,.014,mats['steel'],coll,(math.pi/2,0,0),16)


def _ceiling(center,direction,driving,mats,coll):
    z0,z1=sorted([center-direction*10.22,center+direction*(8.10 if driving else 10.22)])
    section=[(-1.29,3.10),(-1.20,3.22),(-1.05,3.32),(-.83,3.38),(-.58,3.40),(.58,3.40),(.83,3.38),(1.05,3.32),(1.20,3.22),(1.29,3.10)]
    verts=[(x,y,z) for z in (z0,z1) for x,y in section];n=len(section)
    _mesh('CAF interior curved ceiling vault',verts,[(i,i+1,i+1+n,i+n) for i in range(n-1)],mats['liner'],coll,True)
    nseg=math.ceil((z1-z0)/2.0)
    for k in range(nseg):
        za=z0+k*(z1-z0)/nseg+.012;zb=z0+(k+1)*(z1-z0)/nseg-.012
        _box('CAF interior central ceiling access panel',(0,3.385,(za+zb)/2),(1.11,.018,zb-za),mats['liner'],coll,.025)
        for x in (-.56,.56): _box('CAF interior ceiling longitudinal joint',(x,3.377,(za+zb)/2),(.003,.004,zb-za),mats['seam'],coll)
        _box('CAF interior ceiling transverse joint',(0,3.374,za),(1.10,.005,.003),mats['seam'],coll)
        for x in (-.49,.49):
            _cylinder('CAF interior ceiling panel quarter turn',(x,3.37,za+.09),.012,.005,mats['steel'],coll,(math.pi/2,0,0),12)
        for side in (-1,1):
            # Cylindrical-ended opal diffuser housing follows the photo's
            # curved shoulder, with no square fluorescent blocks.
            profile=[(side*(.83+.14*math.cos(math.pi*i/12)),3.32-.075*math.sin(math.pi*i/12)) for i in range(13)]
            vv=[(x,y,z) for z in (za+.015,zb-.015) for x,y in profile]
            ff=[(j,j+1,j+14,j+13) for j in range(12)]
            if side<0:ff=[tuple(reversed(f)) for f in ff]
            _mesh('CAF interior continuous curved opal diffuser',vv,ff,mats['light'],coll,True)
            for z in (za,zb):
                _tube('CAF interior diffuser stainless end trim',[(x,y,z) for x,y in profile],.011,mats['steel'],coll,8)
            for x in (.635,.655):
                _box('CAF interior continuous HVAC slot',(side*x,3.363,(za+zb)/2),(.009,.007,zb-za),mats['dark'],coll)
    for side in (-1,1):
        _beam('CAF interior longitudinal handrail',(side*.78,3.065,z0+.45),(side*.78,3.065,z1-.45),.018,mats['steel'],coll,12)
        for k in range(int((z1-z0-.9)/.73)):
            z=z0+.8+k*.73
            # Narrow black flexible teardrop loops, not triangular bus grips.
            points=[]
            for i in range(25):
                a=2*math.pi*i/24
                points.append((side*.78+.061*math.sin(a)*(1-.28*math.cos(a)),2.873+.145*math.cos(a),z))
            _tube('CAF interior black hanging hand loop',points,.010,mats['dark'],coll,8)
            _box('CAF interior hand loop suspension web',(side*.78,3.034,z),(.023,.052,.012),mats['dark'],coll,.003)
            _box('CAF interior hand loop rail clamp',(side*.78,3.055,z),(.041,.045,.035),mats['steel'],coll,.006)
    for u in (-4.5,4.5):
        z=center+direction*u
        _cylinder('CAF interior CCTV ceiling housing',(0,3.365,z),.062,.035,mats['liner'],coll,(math.pi/2,0,0),20)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=1,location=(0,3.337,z))
        obj=bpy.context.object;obj.name='CAF interior smoked CCTV dome';obj.scale=(.045,.028,.045)
        for c in list(obj.users_collection):c.objects.unlink(obj)
        coll.objects.link(obj);obj.data.materials.append(mats['dark'])
        for p in obj.data.polygons:p.use_smooth=True
    for u in (-6,0,6):
        data=bpy.data.lights.new('CAF interior ceiling area wash','AREA');data.energy=42;data.color=(.82,.90,1.0);data.shape='RECTANGLE';data.size=1.8;data.size_y=4.7
        obj=bpy.data.objects.new('CAF interior ceiling area wash',data);coll.objects.link(obj);obj.location=(0,3.29,center+direction*u)
        obj.rotation_mode='QUATERNION';obj.rotation_quaternion=Vector((0,0,-1)).rotation_difference(Vector((0,-1,0)))
        obj['interior_light']=True


def _end_portal(center,direction,u,mats,coll,cab=False):
    z=center+direction*u
    for side in (-1,1):
        _box('CAF interior cab bulkhead cheek' if cab else 'CAF interior open gangway lining',(side*(.98 if cab else 1.15),2.22,z),(.89 if cab else .34,2.30,.075),mats['liner'],coll,.025)
    _box('CAF interior end lintel',(0,3.29,z),(2.30,.22,.09),mats['liner'],coll,.025)
    if cab:
        _box('CAF interior driver partition door',(0,2.135,z+direction*.004),(.81,2.11,.034),mats['liner'],coll,.036)
        # Door's small closed smoked window as photographed, not a claimed cab.
        _box('CAF interior partition window gasket',(0,2.69,z-direction*.022),(.47,.65,.016),mats['dark'],coll,.038)
        _beam('CAF interior partition door pull',(.27,2.03,z-direction*.055),(.27,2.27,z-direction*.055),.013,mats['steel'],coll,12)
    else:
        bridge_half=CAR_PITCH*.5-abs(u)+.001
        _floor('CAF interior flush intercar bridge',z-bridge_half,z+bridge_half,2.14,mats,coll)
        for off in (-.21,-.14,-.07,0,.07,.14,.21):
            _box('CAF interior gangway floor articulation strip',(0,FLOOR_Y+.003,z+off),(2.12,.006,.009),mats['steel'],coll)


def build_interior():
    """Replace only CAF interior NN collections and return the seven collections.

    Does not alter exterior, stations, source path or scene render settings.
    Root integration must open shell windows and end gangways separately.
    """
    mats=_materials();collections=[]
    for index in range(1,8):
        name=f'CAF interior {index:02d}'
        coll=bpy.data.collections.get(name)
        if coll:
            for obj in list(coll.objects): bpy.data.objects.remove(obj,do_unlink=True)
        else:
            coll=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(coll)
        center,direction=car_frame(index);driving=index in (1,7)
        coll['vehicle']='CAF Serie 6';coll['reference_document']=REFERENCE
        coll['accuracy_status']='Photo-led delivery interior; furniture dimensions and repeated seat allocation estimated'
        coll['car_index']=index;coll['floor_y_m']=FLOOR_Y;coll['eye_y_m']=EYE_Y
        coll['center_z']=center;coll['direction']=direction
        z0,z1=sorted([center-direction*10.23,center+direction*(8.10 if driving else 10.23)])
        _floor('CAF interior uninterrupted saloon floor',z0,z1,2.73,mats,coll)
        _walls(center,direction,driving,mats,coll)
        _seating(center,direction,driving,index,mats,coll)
        _ceiling(center,direction,driving,mats,coll)
        _end_portal(center,direction,-10.20,mats,coll)
        _end_portal(center,direction,8.10 if driving else 10.20,mats,coll,cab=driving)
        collections.append(coll)
    return collections


if __name__=='__main__': build_interior()
