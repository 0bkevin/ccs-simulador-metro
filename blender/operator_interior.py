"""CAF Serie 6 cab, reconstructed from the 2010 delivery photograph and
the operator's 2012 equipment diagram (guide p.8). Equipment positions and
finishes are observed; desk, seat and trim dimensions are photo-scaled.
The COSMOS manual specifies the HMI's 10.4-inch, 4:3 active display.
"""
import math
import os
import bpy
import bmesh
from mathutils import Vector, Matrix
from mathutils.geometry import delaunay_2d_cdt
from train_model import _material, _mesh, _box, _beam, _tube, _cylinder
from cab_geometry import CAB_WINDOW, OUTLINE, inset, side_point, depth, fillet, resample
from body_geometry import CAB_SHIFT


def _finish(obj):
    if obj.type == 'MESH':
        for face in obj.data.polygons:face.use_smooth=True
        if not obj.data.uv_layers and any(m and 'woven' in m.name for m in obj.data.materials):
            uv=obj.data.uv_layers.new(name='cloth metres')
            for face in obj.data.polygons:
                axis=max(range(3),key=lambda i:abs(face.normal[i]))
                a,b=[i for i in range(3) if i!=axis]
                for li in face.loop_indices:
                    p=obj.data.vertices[obj.data.loops[li].vertex_index].co
                    uv.data[li].uv=(p[a]/.20,p[b]/.20)
        normal=obj.modifiers.new('manufactured surface normals','WEIGHTED_NORMAL')
        normal.keep_sharp=True; normal.weight=50
    return obj


def _label(text, location, size, mat, coll, tilt=0):
    data=bpy.data.curves.new('CAF cab engraved label','FONT')
    data.body=text;data.size=size;data.align_x='CENTER';data.align_y='CENTER';data.resolution_u=2
    obj=bpy.data.objects.new('CAF cab label '+text,data);coll.objects.link(obj)
    obj.location=location;obj.rotation_euler=(tilt,math.pi,0);data.materials.append(mat)
    return obj


def _texture(mat, filename, emission=False):
    nodes=mat.node_tree.nodes;links=mat.node_tree.links
    for n in list(nodes):
        if n.type=='TEX_IMAGE':nodes.remove(n)
    path=os.path.join(os.path.dirname(__file__),'textures',filename)
    im=bpy.data.images.load(path,check_existing=True);im.pack()
    tex=nodes.new('ShaderNodeTexImage');tex.image=im
    bsdf=nodes.get('Principled BSDF');links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
    if emission:
        links.new(tex.outputs['Color'],bsdf.inputs['Emission Color'])
        bsdf.inputs['Emission Strength'].default_value=.65


def _screen(kind,x,y,u,w,h,mats,coll,binnacle):
    # Inclined equipment panel faces the seated operator (-Z).
    tilt=.31
    # Real recessed mounting aperture: a flat monitor cannot conform to the
    # bowed binnacle. The original uncut skin hid the lower display corners.
    cutter=_box('temporary instrument aperture',(x,y,u),(w+.061,h+.061,.40),mats['black'],coll)
    cutter.rotation_euler.x=tilt
    boolean=binnacle.modifiers.new('recess for '+kind,'BOOLEAN');boolean.operation='DIFFERENCE';boolean.solver='EXACT';boolean.object=cutter
    bpy.context.view_layer.objects.active=binnacle
    bpy.ops.object.modifier_apply(modifier=boolean.name)
    bpy.data.objects.remove(cutter,do_unlink=True)
    bezel=_finish(_box('CAF cab '+kind+' bolted bezel',(x,y,u),(w+.055,h+.055,.056),mats['black'],coll,.015))
    bezel.rotation_euler.x=tilt
    basis=Matrix.Rotation(tilt,4,'X');center=Vector((x,y,u))
    p=lambda xx,yy,zz:tuple(center+basis@Vector((xx,yy,zz)))
    verts=[p(w/2,-h/2,-.030),p(-w/2,-h/2,-.030),p(-w/2,h/2,-.030),p(w/2,h/2,-.030)]
    mat=mats[kind]
    obj=_mesh('CAF cab '+kind+' display',verts,[(0,1,2,3)],mat,coll)
    uv=obj.data.uv_layers.new(name='display')
    for loop,co in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=co
    for dx in (-w/2-.016,w/2+.016):
        for dy in (-h/2-.016,h/2+.016):
            _cylinder('CAF cab display captive screw',p(dx,dy,-.033),.004,.004,mats['steel'],coll,vertices=12)
    _label(kind.upper(),p(0,h/2+.020,-.035),.010,mats['label'],coll,tilt)


def build_operator(index, center, direction, coll, shared):
    """Build in canonical car coordinates, then rotate the complete rear cab.
    Looking forward (+Z), the operator's right hand is on negative X.
    All objects remain in CAF interior NN, including the cab's light source.
    """
    before=set(coll.objects)
    m={
        'liner':shared['liner'],'steel':shared['steel'],'black':shared['dark'],
        'label':_material('CAF cab ivory engraved legends',(.78,.80,.75),0,.65),
        'desk':_material('CAF cab charcoal molded desk',(.048,.051,.061),0,.66),
        'panel':_material('CAF cab black instrument plates',(.012,.015,.019),.12,.48),
        'upholstery':_material('CAF cab blue woven seat cloth',(.012,.039,.11),0,.95),
        'seatback':_material('CAF cab charcoal vinyl seat shell',(.017,.021,.028),0,.58),
        'rubber':_material('CAF cab ribbed rubber floor',(.065,.077,.087),0,.86),
        'red':_material('CAF cab emergency mushroom red',(.48,.008,.005),0,.38),
        'yellow':_material('CAF cab amber switch cap',(.50,.28,.022),0,.36),
        'green':_material('CAF cab green switch cap',(.018,.24,.065),0,.38),
        'lamp':_material('CAF cab warm ceiling diffuser',(.89,.87,.70),0,.4,(1,.90,.70)),
        'dmi':_material('CAF cab DMI active display',(.02,.03,.04),0,.53),
        'hmi':_material('CAF cab HMI active display',(.02,.03,.04),0,.53),
        'cctv':_material('CAF cab CCTV monitor glass',(.008,.012,.016),0,.25),
    }
    for kind in ('dmi','hmi','cctv'):_texture(m[kind],'cab-'+kind+'.png',True)
    _texture(m['upholstery'],'cab-seat-weave.png')
    # Pale internal windshield surround, with its own true opening. Exterior
    # red paint must not double as the cabin's interior finish.
    clear=fillet([(-1.10,2.035),(-1.034,3.085),(1.034,3.085),(1.10,2.035)],.035)
    def contains(p,poly):
        x,y=p;inside=False
        for (a,b),(c,d) in zip(poly,poly[1:]+poly[:1]):
            if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:inside=not inside
        return inside
    points=[];edges=[]
    for poly in (OUTLINE,clear):
        ring=resample(poly,.045);n=len(points)
        points.extend(Vector(p) for p in ring);edges.extend((n+i,n+(i+1)%len(ring)) for i in range(len(ring)))
    for row in range(36):
        y=1.67+row*.055
        for col in range(49):
            p=(-1.44+col*.06,y)
            if contains(p,OUTLINE):points.append(Vector(p))
    coords,_,triangles,*_=delaunay_2d_cdt(points,edges,[],0,1e-7,False)
    faces=[]
    for f in triangles:
        p=tuple(sum(coords[i][j] for i in f)/len(f) for j in (0,1))
        if p[1]<1.66 or not contains(p,OUTLINE) or contains(p,clear):continue
        a,b,c=(coords[i] for i in f[:3]);area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
        faces.append(tuple(reversed(f)) if area>0 else f)
    _mesh('CAF cab pale internal windshield surround',[(p.x,p.y,depth(p.x,p.y)+CAB_SHIFT-.055) for p in coords],faces,m['liner'],coll,True)
    # Fitted floor and rear cabinets, contained inside the already reviewed nose.
    _box('CAF cab continuous rubber floor',(0,1.045,9.23),(2.53,.05,2.26),m['rubber'],coll)
    for side in (-1,1):
        _finish(_box('CAF cab rear equipment cabinet',(side*.91,2.13,8.205),(.72,2.05,.16),m['liner'],coll,.025))
        _box('CAF cab cabinet door seam',(side*.91,2.13,8.296),(.003,1.95,.006),shared['seam'],coll)
        for yy in (1.39,2.89):
            _cylinder('CAF cab cabinet quarter turn',(side*.65,yy,8.303),.012,.007,m['steel'],coll,vertices=16)
        # Door's guillotine window reveals follow the existing exterior contour.
        outer=CAB_WINDOW;inner=inset(outer,.033)
        verts=[side_point(u,y,side,-.042) for u,y in outer+inner]
        verts=[(x,y,u+CAB_SHIFT) for x,y,u in verts];n=len(outer)
        faces=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        if side>0:faces=[tuple(reversed(f)) for f in faces]
        _mesh('CAF cab internal guillotine window frame',verts,faces,m['liner'],coll,True)
        _beam('CAF cab inner door grab handle',(side*1.31,1.78,8.42),(side*1.31,2.01,8.42),.013,m['steel'],coll)
        _finish(_box('CAF cab internal door latch',(side*1.33,1.91,8.35),(.05,.058,.12),m['black'],coll,.015))
    # White overhead trim and the warm linear fixture seen in the delivery photo.
    sec=[(-1.10,3.18),(-.93,3.35),(-.67,3.43),(0,3.45),(.67,3.43),(.93,3.35),(1.10,3.18)]
    vs=[(x,y,u) for u in (8.12,8.92) for x,y in sec]
    _mesh('CAF cab molded ceiling',vs,[(i,i+1,i+8,i+7) for i in range(6)],m['liner'],coll,True)
    for side in (-1,1):
        _finish(_box('CAF cab ceiling access lid',(side*.39,3.405,8.52),(.64,.028,.71),m['liner'],coll,.023))
        _box('CAF cab ceiling panel joint',(side*.75,3.397,8.52),(.003,.009,.73),shared['seam'],coll)
    _finish(_box('CAF cab recessed luminaire trim',(0,3.398,8.52),(.185,.026,.70),m['steel'],coll,.025))
    _finish(_box('CAF cab warm opal strip',(0,3.379,8.52),(.135,.014,.65),m['lamp'],coll,.023))
    _cylinder('CAF cab ceiling speaker',(.78,3.29,8.55),.070,.021,m['liner'],coll,(math.pi/2,0,0),24)
    for row in range(6):
        for col in range(7):
            if (row-2.5)**2+(col-3)**2<10:
                _cylinder('CAF cab speaker perforation',(.78+(col-3)*.012,3.277,8.55+(row-2.5)*.012),.0025,.002,m['black'],coll,(math.pi/2,0,0),6)
    for side in (-1,1):
        _box('CAF cab overhead ventilation grille',(side*.94,3.20,8.53),(.115,.018,.24),m['black'],coll)
        for j in range(9):_box('CAF cab vent louvre',(side*.94,3.189,8.43+j*.024),(.10,.005,.008),m['liner'],coll)
    _beam('CAF cab sunblind cassette',(-.86,3.27,9.24),(.86,3.27,9.24),.036,m['black'],coll,20)
    # A continuous curved worktop with the characteristic central knee recess.
    # Profiles are expressed front-to-back. The outer boundary bows with the nose.
    xs=[-1.18+i*2.36/48 for i in range(49)]
    verts=[]
    for x in xs:
        a=abs(x)/1.18
        front=10.10-.25*a*a
        rear=9.30-.39*a*a
        verts.extend([(x,1.99,rear),(x,2.045,front),(x,1.93,front),(x,1.91,rear)])
    faces=[]
    for i in range(48):
        for j in range(4):faces.append((4*i+j,4*i+(j+1)%4,4*(i+1)+(j+1)%4,4*(i+1)+j))
    faces += [(3,2,1,0),tuple(range(192,196))]
    obj=_mesh('CAF cab continuous curved operator desk',verts,faces,m['desk'],coll,True)
    bevel=obj.modifiers.new('soft molded desk perimeter','BEVEL');bevel.width=.023;bevel.segments=3
    _finish(obj)
    # Wraparound upper instrument binnacle, with no invented steering wheel.
    verts=[]
    for x in xs:
        a=abs(x)/1.18;u=9.98-.23*a*a
        verts.extend([(x,2.05,u-.20),(x,2.39-.09*a*a,u-.09),(x,2.42-.09*a*a,u+.025),(x,2.03,u+.09)])
    faces=[]
    for i in range(48):
        for j in range(4):faces.append((4*i+j,4*(i+1)+j,4*(i+1)+(j+1)%4,4*i+(j+1)%4))
    faces += [(0,1,2,3),(195,194,193,192)]
    binnacle=_mesh('CAF cab curved instrument binnacle',verts,faces,m['desk'],coll,True)
    bm=bmesh.new();bm.from_mesh(binnacle.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(binnacle.data);bm.free()
    for side in (-1,1):
        _finish(_box('CAF cab console pedestal',(side*.98,1.52,9.71),(.36,.83,.61),m['liner'],coll,.055))
        _box('CAF cab pedestal kick panel',(side*.98,1.30,9.385),(.26,.35,.017),m['panel'],coll,.015)
        for j in range(6):_box('CAF cab pedestal cooling slot',(side*.98,1.27+j*.026,9.374),(.20,.008,.005),m['black'],coll)
    _screen('dmi',.34,2.231,9.844,.240,.285,m,coll,binnacle)
    _screen('hmi',-.025,2.247,9.854,.21133,.15850,m,coll,binnacle)
    _screen('cctv',-.47,2.221,9.821,.330,.218,m,coll,binnacle)
    # Pressure gauge, on the upper-left equipment bank in the operator diagram.
    _cylinder('CAF cab pressure gauge bezel',(.69,2.302,9.76),.060,.027,m['steel'],coll,vertices=40)
    _cylinder('CAF cab pressure gauge ivory face',(.69,2.302,9.744),.052,.006,m['label'],coll,vertices=40)
    for i in range(11):
        a=math.radians(-140+i*28)
        _beam('CAF cab manometer tick',(.69+.044*math.sin(a),2.302+.044*math.cos(a),9.739),(.69+.038*math.sin(a),2.302+.038*math.cos(a),9.739),.0009,m['black'],coll,6)
    _beam('CAF cab pressure needle',(.69,2.302,9.736),(.715,2.326,9.736),.0015,m['black'],coll,8)
    _label('bar',(.69,2.279,9.733),.009,m['panel'],coll)
    # Flush control banks, positive-depth collars, caps and restrained legends.
    def plate(name,x,u,w,h):
        return _finish(_box(name,(x,2.015,u),(w,.024,h),m['panel'],coll,.013))
    def button(x,u,color,label=''):
        _cylinder('CAF cab switch metal collar',(x,2.039,u),.019,.008,m['steel'],coll,(math.pi/2,0,0),20)
        _cylinder('CAF cab pushbutton '+label,(x,2.047,u),.0135,.013,m[color],coll,(math.pi/2,0,0),20)
        if label:_label(label,(x,2.032,u-.033),.011,m['label'],coll,-math.pi/2)
    plate('CAF cab central switch bank',0,9.52,.69,.27)
    labels=[('yellow','LUCES'),('green','MARCHA'),('label','PUERTAS'),('label','CIERRE')]
    for i,(color,label) in enumerate(labels):
        for j in range(2):button(.26-i*.17,9.47+j*.12,color,label if j==0 else '')
    # Emergency mushroom on its yellow legend plate.
    _cylinder('CAF cab emergency yellow bezel',(.39,2.04,9.62),.040,.009,m['yellow'],coll,(math.pi/2,0,0),32)
    _cylinder('CAF cab emergency stop stem',(.39,2.067,9.62),.017,.043,m['black'],coll,(math.pi/2,0,0),24)
    _finish(_cylinder('CAF cab emergency stop mushroom',(.39,2.095,9.62),.035,.025,m['red'],coll,(math.pi/2,0,0),32))
    plate('CAF cab lower right switch bank',-.89,9.36,.29,.25)
    for x in (-.98,-.89,-.80):
        for u in (9.30,9.41):button(x,u,'label')
    plate('CAF cab key switch bank',.95,9.51,.23,.28)
    for x,label in ((.89,'KS'),(1.01,'SMC')):
        button(x,9.53,'black',label)
        _box('CAF cab key blade',(x,2.078,9.53),(.009,.033,.022),m['steel'],coll,.002)
    # Left-hand radio handset and coiled cord.
    plate('CAF cab radio plinth',.67,9.39,.23,.33)
    for yy,zz in ((2.063,9.29),(2.068,9.50)):
        _finish(_box('CAF cab radio handset earpiece',(.68,yy,zz),(.091,.050,.072),m['black'],coll,.026))
    _finish(_box('CAF cab radio handset grip',(.68,2.083,9.40),(.042,.035,.20),m['black'],coll,.017))
    _tube('CAF cab radio coiled cable',[(.72+.012*math.cos(i*.8),1.96-i*.001,9.22+.012*math.sin(i*.8)) for i in range(160)],.003,m['black'],coll,6)
    # Right-hand manipulator, retained as a separate assembly by the exporter.
    plate('CAF cab traction controller gate',-.56,9.36,.22,.31)
    _finish(_box('CAF cab controller slotted boot',(-.56,2.044,9.36),(.12,.031,.20),m['black'],coll,.028))
    pivot=bpy.data.objects.new(f'CAF cab {index:02d} master controller',None);coll.objects.link(pivot)
    pivot.location=(-.56,2.065,9.36);pivot['cabControlId']=f'{index}:master';pivot['cabControl']='master';pivot['carIndex']=index;pivot['cabDirection']=direction
    stem=_beam('CAF cab controller lever stem',(-.56,2.065,9.36),(-.56,2.205,9.36),.013,m['steel'],coll)
    grip=_finish(_box('CAF cab controller palm grip',(-.56,2.207,9.36),(.115,.053,.066),m['black'],coll,.024))
    bpy.context.view_layer.update()
    for obj in (stem,grip):
        world=obj.matrix_world.copy();obj.parent=pivot;obj.matrix_world=world
    # Suspended blue fabric seat and black moulded back, visible in delivery photo.
    _finish(_box('CAF cab seat floor mounting',(0,1.095,8.91),(.42,.04,.44),m['black'],coll,.025))
    _cylinder('CAF cab seat suspension column',(0,1.32,8.91),.105,.43,m['black'],coll,(math.pi/2,0,0),28)
    for j in range(6):_cylinder('CAF cab suspension bellows rib',(0,1.21+j*.033,8.91),.116,.016,m['black'],coll,(math.pi/2,0,0),28)
    _finish(_box('CAF cab seat cushion',(0,1.64,8.95),(.51,.15,.50),m['upholstery'],coll,.063))
    back=_finish(_box('CAF cab shaped seat back',(0,2.00,8.67),(.53,.78,.14),m['seatback'],coll,.075));back.rotation_euler.x=-.09
    pad=_finish(_box('CAF cab blue back upholstery',(0,2.02,8.757),(.425,.67,.048),m['upholstery'],coll,.065));pad.rotation_euler.x=-.09
    for side in (-1,1):
        _beam('CAF cab seat arm bracket',(side*.28,1.67,8.80),(side*.28,1.86,8.87),.019,m['black'],coll)
        _finish(_box('CAF cab seat padded armrest',(side*.29,1.88,8.98),(.08,.055,.38),m['seatback'],coll,.026))
    _finish(_box('CAF cab anti-slip footrest',(0,1.18,9.60),(.62,.055,.27),m['black'],coll,.025))
    for j in range(10):_box('CAF cab footrest tread',(0,1.211,9.49+j*.023),(.57,.007,.008),m['rubber'],coll)
    _finish(_box('CAF cab vigilance pedal',(.22,1.18,9.41),(.13,.055,.14),m['black'],coll,.02))
    lamp=bpy.data.lights.new('CAF cab warm ceiling source','AREA');lamp.energy=14;lamp.color=(1,.91,.77);lamp.shape='RECTANGLE';lamp.size=.65;lamp.size_y=.8
    obj=bpy.data.objects.new('CAF cab warm ceiling source',lamp);coll.objects.link(obj);obj.location=(0,3.34,8.56)
    obj.rotation_mode='QUATERNION';obj.rotation_quaternion=Vector((0,0,-1)).rotation_difference(Vector((0,-1,0)))
    obj['interior_light']=True
    bpy.context.view_layer.update()
    transform=Matrix.Translation((0,0,center))@Matrix.Rotation(0 if direction==1 else math.pi,4,'Y')
    for obj in set(coll.objects)-before:
        if not obj.parent:obj.matrix_world=transform@obj.matrix_world
    coll['cab_eye_local_m']=[0,2.60,9.04]
    coll['cab_reference']='Delivery cab photograph 2010; equipment guide 2012 p.8; COSMOS HMI 10.4 inch'
