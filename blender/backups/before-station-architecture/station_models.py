"""Photograph-led station architecture. Y is vertical; Z follows the route.

Dimensions other than Altamira's published vertical organisation are modelling
estimates. The five 150 m envelopes and 160 m stop spacing compress the route.
All geometry is native mesh/font data; reference photographs are not textures.
"""
import math
from array import array
import bpy
from mathutils import Vector

STOPS = {'Caño Amarillo': 0., 'Capitolio': 160., 'Bellas Artes': 320., 'Plaza Venezuela': 480., 'Altamira': 640.}
LAYOUT = {n: ('island' if n in ('Bellas Artes', 'Altamira') else 'side') for n in STOPS}
M = {}
_batches = {}


def _materials():
    palette = {
        'floor': ((.115,.135,.143), .86, 0), 'grout': ((.062,.073,.078), .95, 0),
        'edge': ((.92,.63,.06), .65, 0), 'rail': ((.39,.43,.46), .26, .78),
        'steel': ((.29,.33,.34), .32, .65), 'ballast': ((.058,.060,.058), 1., 0),
        'concrete': ((.40,.42,.40), .93, 0), 'pale': ((.62,.63,.57), .89, 0),
        'black': ((.016,.021,.025), .60, .08), 'slat': ((.026,.031,.035), .65, .15),
        'yellow': ((.88,.56,.04), .38, .20), 'roof': ((.54,.56,.50), .72, 0),
        'skylight': ((.68,.77,.73), .31, 0), 'glassblock': ((.32,.39,.38), .39, .10),
        'ochre': ((.58,.44,.12), .43, 0), 'terracotta': ((.44,.24,.115), .52, 0),
        'beige': ((.57,.51,.39), .69, 0), 'teal': ((.045,.31,.28), .40, .23),
        'water': ((.055,.30,.28), .19, .15), 'plant': ((.08,.20,.085), .95, 0),
        'white': ((.87,.88,.82), .48, 0), 'orange': ((1.,.37,.035), .42, 0),
        'green': ((.12,.92,.18), .40, 0), 'light': ((.89,.95,1.), .24, 0),
    }
    for key, (color, rough, metallic) in palette.items():
        mat = bpy.data.materials.get('L1 architecture / '+key) or bpy.data.materials.new('L1 architecture / '+key)
        mat.diffuse_color = (*color, 1)
        mat.use_nodes = True
        p = mat.node_tree.nodes.get('Principled BSDF')
        p.inputs['Base Color'].default_value = (*color, 1)
        p.inputs['Roughness'].default_value = rough
        p.inputs['Metallic'].default_value = metallic
        if key in ('light','green','orange','skylight'):
            p.inputs['Emission Color'].default_value = (*color,1)
            p.inputs['Emission Strength'].default_value = {'light':5., 'green':.65, 'orange':.4, 'skylight':.18}[key]
        M[key] = mat
    # Procedurally authored rubber-stud normal map, embedded in the .blend.
    # This is a reusable material detail, not photography from the references.
    image=bpy.data.images.get('Metro rubber flooring stud normals')
    if not image:
        image=bpy.data.images.new('Metro rubber flooring stud normals',width=256,height=256)
        values=array('f')
        def height(px,py):
            xx=(px%16-7.5)/7.5; yy=(py%16-7.5)/7.5
            r=math.sqrt(xx*xx+yy*yy)
            return max(0.,1-r*r)**3*.42
        for py in range(256):
            for px in range(256):
                dx=(height(px+1,py)-height(px-1,py))*2
                dy=(height(px,py+1)-height(px,py-1))*2
                n=Vector((-dx,-dy,1.)).normalized()
                values.extend((n.x*.5+.5,n.y*.5+.5,n.z*.5+.5,1.))
        image.pixels.foreach_set(values);image.colorspace_settings.name='Non-Color';image.pack()
    nodes=M['floor'].node_tree.nodes; links=M['floor'].node_tree.links
    tex=nodes.get('Stud relief texture') or nodes.new('ShaderNodeTexImage');tex.name='Stud relief texture';tex.image=image
    normal=nodes.get('Stud relief') or nodes.new('ShaderNodeNormalMap');normal.name='Stud relief';normal.inputs['Strength'].default_value=.65
    links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])


def _collection(name, parent):
    old = bpy.data.collections.get(name)
    if old:
        for obj in list(old.objects): bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(old)
    c = bpy.data.collections.new(name)
    parent.children.link(c)
    return c


def _geometry(c, material, feature, vertices, faces, smooth=False):
    key = (c.name, material, feature)
    batch = _batches.setdefault(key, [[], [], []])
    offset = len(batch[0]); batch[0].extend(vertices)
    batch[1].extend(tuple(offset+i for i in face) for face in faces)
    batch[2].extend([smooth]*len(faces))


def _box(c, mat, name, p, size):
    x,y,z=p; a,b,d=(v/2 for v in size)
    v=[(x-a,y-b,z-d),(x+a,y-b,z-d),(x+a,y+b,z-d),(x-a,y+b,z-d),
       (x-a,y-b,z+d),(x+a,y-b,z+d),(x+a,y+b,z+d),(x-a,y+b,z+d)]
    _geometry(c,mat,name,v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(1,2,6,5),(0,4,7,3)])


def _beam(c, mat, name, a, b, radius=.035, segments=10):
    a,b=Vector(a),Vector(b); direction=(b-a).normalized()
    u=direction.cross(Vector((0,1,0)))
    if u.length<.01: u=direction.cross(Vector((1,0,0)))
    u.normalize(); v=direction.cross(u).normalized()
    vertices=[tuple(p+radius*(u*math.cos(i*2*math.pi/segments)+v*math.sin(i*2*math.pi/segments))) for p in (a,b) for i in range(segments)]
    faces=[(i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments)]
    faces += [tuple(range(segments-1,-1,-1)), tuple(range(segments,2*segments))]
    _geometry(c,mat,name,vertices,faces,True)


def _text(c, body, p, size=.25, color='white', rotation=0):
    curve=bpy.data.curves.new(body,'FONT'); curve.body=body
    curve.align_x='CENTER'; curve.align_y='CENTER'; curve.size=size
    curve.extrude=.001; curve.resolution_u=5
    obj=bpy.data.objects.new(body,curve); c.objects.link(obj)
    obj.location=p; obj.rotation_euler=(0,rotation,0); curve.materials.append(M[color])


def _sign(c, body, x, y, z, width=3.7, color='white', size=.24, both=True):
    _box(c,'black','Suspended enamel sign fascia',(x,y,z),(width,.48,.09))
    _text(c,body,(x,y,z+.05),size,color)
    if both: _text(c,body,(x,y,z-.05),size,color,math.pi)
    if y < 4.4:
        for dx in (-width*.36,width*.36):
            _beam(c,'black','Sign suspension',(x+dx,y+.24,z),(x+dx,4.48,z),.012,6)


def _floor(c, x0,x1,z0,z1):
    _box(c,'floor','Platform slab',((x0+x1)/2,.55,(z0+z1)/2),(x1-x0,1.1,z1-z0))
    # Fine tile grid reproduces the scale of the rubber flooring rather than
    # the previous five-metre decorative divisions. Geometry survives glTF.
    for i in range(int((z1-z0)/.5)+1):
        _box(c,'grout','Rubber tile joints',((x0+x1)/2,1.102,z0+i*.5),(x1-x0,.004,.009))
    for i in range(int((x1-x0)/.5)+1):
        _box(c,'grout','Rubber tile joints',(x0+i*.5,1.102,(z0+z1)/2),(.009,.004,z1-z0))


def _platform(c, name, stop):
    a,b=stop-145,stop+5
    slabs=[(1.66,8.34)] if LAYOUT[name]=='island' else [(-7.1,-1.66),(5.66,11.1)]
    edges=[(1.76,1),(8.24,-1)] if LAYOUT[name]=='island' else [(-1.76,-1),(5.76,1)]
    for x0,x1 in slabs: _floor(c,x0,x1,a,b)
    for edge,d in edges:
        _box(c,'edge','Yellow platform edge',(edge,1.107,(a+b)/2),(.16,.012,b-a))
        # Open yellow boarding rectangles beside, not in the middle of, the platform.
        for z in [a+5+i*4.8 for i in range(29)]:
            xx=edge+d*.68
            for dz in (-.82,.82): _box(c,'edge','Boarding rectangles',(xx,1.11,z+dz),(1.05,.012,.055))
            _box(c,'edge','Boarding rectangles',(edge+d*1.21,1.11,z),(.055,.012,1.64))
            _box(c,'edge','Boarding centre arrow',(xx,1.112,z),(.07,.012,.52))
            _geometry(c,'edge','Boarding arrow heads',[(xx-.19,1.112,z+.03),(xx+.19,1.112,z+.03),(xx,1.112,z+.29)],[(0,1,2)])
    return a,b


def _track(c, center, a,b):
    _box(c,'ballast','Ballast track bed',(center,-.18,(a+b)/2),(3.18,.42,b-a))
    for i in range(int((b-a)/.67)):
        _box(c,'concrete','Concrete sleepers',(center,-.005,a+.33+i*.67),(2.50,.16,.22))
    for x in (center-.7175,center+.7175):
        _box(c,'rail','Rail head',(x,.125,(a+b)/2),(.065,.05,b-a))
        _box(c,'steel','Rail web and foot',(x,.066,(a+b)/2),(.035,.078,b-a))
    _box(c,'steel','Covered conductor rail',(center+1.29,.28,(a+b)/2),(.16,.12,b-a))
    for i in range(int((b-a)/3)):
        _box(c,'pale','Conductor rail insulators',(center+1.29,.12,a+1.5+i*3),(.24,.20,.21))


def _route(parent, stops):
    c=_collection('Linea 1 route',parent)
    ordered=list(stops.items())
    _track(c,0,-240,ordered[0][1]-145); _track(c,4,-240,ordered[0][1]-145)
    for (n,s),(nn,ns) in zip(ordered,ordered[1:]):
        a,b=s+5,ns-145; _track(c,0,a,b)
        x0=10 if LAYOUT[n]=='island' else 4; x1=10 if LAYOUT[nn]=='island' else 4
        if x0==x1: _track(c,x0,a,b)
        else:
            # Only the unused return track changes lateral position. This
            # compressed throat is a game connection, not a surveyed alignment.
            for i in range(20):
                t0,t1=i/20,(i+1)/20
                f=lambda t: x0+(x1-x0)*(t*t*(3-2*t))
                for off in (-.7175,.7175):
                    _beam(c,'rail','Compressed return track transition',(f(t0)+off,.125,a+(b-a)*t0),(f(t1)+off,.125,a+(b-a)*t1),.035,8)
            _box(c,'ballast','Throat bed',(5,-.2,(a+b)/2),(13,.42,b-a))
    _track(c,0,ordered[-1][1]+5,800); _track(c,10,ordered[-1][1]+5,800)


def _stairs(c,x,z, height=4., width=1.65, escalator=True):
    """Ascend +Z from platform to a matching mezzanine landing."""
    run=height*1.72; steps=round(height/.18); rise=height/steps; tread=run/steps
    mat='black' if escalator else 'pale'
    for i in range(steps):
        yy=1.1+(i+1)*rise
        _box(c,mat,'Escalator treads' if escalator else 'Concrete stair treads',(x,yy-rise*.5,z+(i+.5)*tread),(width,rise,tread+.003))
        _box(c,'rail' if escalator else 'concrete','Tread nosing',(x,yy+.002,z+i*tread+.025),(width,.014,.04))
    for side in (-1,1):
        xx=x+side*(width/2+.10)
        # Proper sloping sheet-metal balustrades, not upright rectangular blocks.
        a=(xx,1.20,z); b=(xx,1.20+height,z+run); cc=(xx,2.05+height,z+run); d=(xx,2.05,z)
        _geometry(c,'steel' if escalator else 'pale','Stair and escalator balustrades',[a,b,cc,d],[(0,1,2,3),(3,2,1,0)])
        _beam(c,'black' if escalator else 'steel','Sloping handrail',d,cc,.043,12)
        for zz,yy in ((z,2.05),(z+run,2.05+height)):
            _beam(c,'black' if escalator else 'steel','Landing handrail',(xx,yy,zz-.38),(xx,yy,zz+.38),.043,12)
    _box(c,'floor','Upper circulation landing',(x,1.1+height-.13,z+run+1),(width+.45,.26,2.))


def _wall(c,name,stop):
    a,b=stop-145,stop+5; island=LAYOUT[name]=='island'
    xs=(-3.,13.) if island else (-7.2,11.2)
    finish='terracotta' if name=='Altamira' else ('beige' if name=='Plaza Venezuela' else 'pale')
    for x in xs:
        _box(c,'concrete','Retaining wall',(x,2.75,(a+b)/2),(.23,6.4,150))
        _box(c,'black','Lower track retaining wall',(x+(.125 if x<0 else -.125),.45,(a+b)/2),(.025,1.5,150))
        _box(c,finish,'Ceramic wall finish',(x+( .125 if x<0 else -.125),2.73,(a+b)/2),(.022,2.8,150))
        for yy in (1.35,1.85,2.35,2.85,3.35,3.85):
            _box(c,'grout','Ceramic horizontal joints',(x+(.141 if x<0 else -.141),yy,(a+b)/2),(.008,.01,150))
        for z in [a+.5+i*.5 for i in range(300)]:
            _box(c,'grout','Ceramic vertical joints',(x+(.141 if x<0 else -.141),2.7,z),(.008,2.8,.01))
        _box(c,'black','Continuous wall name fascia',(x+(.18 if x<0 else -.18),4.,(a+b)/2),(.12,.52,150))
        for z in (a+22,a+57,a+93,a+128):
            _text(c,name,(x+(.247 if x<0 else -.247),4.,z),.30,'white',math.pi/2 if x<0 else -math.pi/2)
    return xs


def _ceiling(c,name,stop):
    a,b=stop-145,stop+5; island=LAYOUT[name]=='island'
    cx=5 if island else 2; width=16 if island else 18.4
    core=stop-70; opening=(core-1,core+11)
    # Low suspended black ceiling around a double-height circulation opening.
    for z0,z1 in ((a,opening[0]),(opening[1],b)):
        _box(c,'slat','Dark ceiling backing',(cx,4.59,(z0+z1)/2),(width,.10,z1-z0))
        for i in range(int((z1-z0)/.20)):
            _box(c,'slat','Closely spaced transverse ceiling fins',(cx,4.49,z0+i*.20),(width,.11,.085))
    _box(c,'concrete','Double-height structural ceiling',(cx,7.4,core+5),(width,.4,12))
    # Leave the opening over the stair core, with lower ceilings on either side.
    for dx in (-1,1):
        _box(c,'slat','Ceiling beside circulation opening',(cx+dx*6,4.57,core+5),(4,.12,12))
    for z in (core-1.3,core+11.3):
        _box(c,'concrete','Exposed transverse structural beam',(cx,4.55,z),(width,.55,.54))
    platform_x=(3.,7.) if island else (-4.35,8.35)
    for z in [a+3+i*4 for i in range(37)]:
        for x in platform_x:
            _box(c,'steel','Recessed luminaire housing',(x,4.38,z),(.36,.08,2.45))
            _box(c,'light','Cool white fluorescent diffuser',(x,4.335,z),(.29,.016,2.30))
    # Actual Blender lights illuminate the saved native scene as well as the
    # emissive geometry. Browser lighting is configured by the world adapter.
    for z in (a+24,core-22,core+28,b-12):
        light=bpy.data.lights.new(name+' fluorescent wash','AREA'); light.energy=190; light.shape='RECTANGLE';light.size=7;light.size_y=4
        obj=bpy.data.objects.new(light.name,light);c.objects.link(obj);obj.location=(cx,4.25,z);obj.rotation_euler=(-math.pi/2,0,0)


def _underground(c,name,stop):
    _wall(c,name,stop); _ceiling(c,name,stop)
    island=LAYOUT[name]=='island'; core=stop-70
    if island:
        _stairs(c,5,core,height=4.,width=1.60)
        # Two thin floating slabs frame the central escalator aperture.
        for x in (2.8,7.2):
            _box(c,'concrete','Mezzanine slab beside escalator',(x,5.0,core+4.8),(2.5,.22,12))
            _box(c,'terracotta' if name=='Altamira' else 'concrete','Mezzanine front fascia',(x,4.74,core-1.1),(2.5,.62,.22))
        for x,destination in ((2.8,'PALO VERDE'),(7.2,'PROPATRIA')):
            _sign(c,destination,x,3.97,core-3.4,2.55,'white',.235)
            _sign(c,'SALIDA ↗',x,3.36,core-2.4,1.65,'green' if name=='Altamira' else 'orange',.23)
    else:
        # Side-platform access sits behind the platform; the active track stays clear.
        _stairs(c,-4.55,core,height=4,width=1.55)
        _stairs(c,-6.20,core,height=4,width=1.30,escalator=False)
        for x in (-3.28,9.8):
            for z in (core-2.5,core+10.8):
                _box(c,'beige' if name=='Plaza Venezuela' else 'pale','Square structural columns',(x,2.83,z),(.72,3.46,.84))
        _box(c,'ochre' if name=='Capitolio' else 'beige','Access hall wall',(-7.04,3.5,core+4.5),(.06,4.3,12))
        _sign(c,'SALIDA ↑',-4.45,3.81,core-2.5,3.9,'orange',.31)
        label='CONEXIÓN  EL SILENCIO · LÍNEA 2' if name=='Capitolio' else 'LÍNEA 2 / LÍNEA 3  →'
        _sign(c,label,8.3,3.77,core-4,4.7,'white',.225)
    for z in (stop-126,stop-22):
        for x in ((5,) if island else (-4.4,8.4)):
            _sign(c,name.upper(),x,3.82,z,4.5,'white',.27)
    # Wall service cabinets and brushed-steel waste bins are visible in the photos.
    for x in ((5.,) if island else (-6.6,10.6)):
        for z in (stop-118,stop-30):
            _box(c,'steel','Platform litter bin',(x,1.55,z),(.43,.90,.43))
            _box(c,'black','Bin aperture',(x,1.92,z+.22),(.30,.13,.014))


def _cano(c,stop):
    a,b=stop-145,stop+5
    # Square-on-square space frame: every upper node is supported by four
    # diagonals into the lower grid. No dangling trusses or trackside posts.
    xs=[-7.1+i*2.3 for i in range(9)]; zs=[a+i*2.5 for i in range(61)]
    low,high=5.3,6.25
    for x in xs:
        _beam(c,'yellow','Lower longitudinal space-frame chords',(x,low,a),(x,low,b),.043)
    for z in zs:
        _beam(c,'yellow','Lower transverse space-frame chords',(xs[0],low,z),(xs[-1],low,z),.043)
    for i in range(len(xs)-1):
        x=(xs[i]+xs[i+1])/2
        _beam(c,'yellow','Upper longitudinal chords',(x,high,a+1.25),(x,high,b-1.25),.042)
        for j in range(len(zs)-1):
            z=(zs[j]+zs[j+1])/2
            for xx,zz in ((xs[i],zs[j]),(xs[i+1],zs[j]),(xs[i],zs[j+1]),(xs[i+1],zs[j+1])):
                _beam(c,'yellow','Four-way pyramidal roof bracing',(x,high,z),(xx,low,zz),.031,8)
    for z in [a+1.25+i*2.5 for i in range(60)]:
        _beam(c,'yellow','Upper transverse chords',(-5.95,high,z),(10.15,high,z),.040)
    for x in (-6.95,10.95):
        for z in [a+2.5+i*10 for i in range(15)]:
            _beam(c,'yellow','Outer steel canopy columns',(x,1.1,z),(x,low,z),.072,12)
    for x0,x1,mat in ((-7.2,-1.,'roof'),(-1.,5.,'skylight'),(5.,11.4,'roof')):
        _box(c,mat,'Canopy panels with central daylight strip',((x0+x1)/2,6.40,(a+b)/2),(x1-x0,.08,150))
    for x in (-7.13,11.33):
        _box(c,'concrete','Glass block wall base',(x,1.60,(a+b)/2),(.23,1.,150))
        _box(c,'glassblock','Translucent block wall',(x,3.27,(a+b)/2),(.18,2.30,150))
        for z in [a+i*.32 for i in range(470)]:
            _box(c,'pale','Glass block vertical mortar',(x,3.27,z),(.205,2.3,.025))
        for y in [2.12+i*.32 for i in range(8)]:
            _box(c,'pale','Glass block horizontal mortar',(x,y,(a+b)/2),(.205,.025,150))
        _box(c,'black','Station name fascia over glass blocks',(x,4.64,(a+b)/2),(.26,.58,150))
        for z in (a+18,a+48,a+80,a+116):
            _text(c,'Caño Amarillo',(x+(.14 if x<0 else -.14),4.64,z),.33,'white',math.pi/2 if x<0 else -math.pi/2)
    # Thin barrier between tracks, visible in the Caño Amarillo photographs.
    for z in [a+2+i*4 for i in range(37)]:
        _beam(c,'steel','Inter-track safety barrier posts',(2,.02,z),(2,2.20,z),.027,8)
    _box(c,'black','Inter-track continuous name band',(2,2.18,(a+b)/2),(.045,.18,150))
    for z in (a+21,a+59,a+97,a+130):
        _text(c,'Caño Amarillo',(1.967,2.18,z),.13,'white',-math.pi/2)
    for x in (-4.4,8.4):
        for z in [a+5+i*10 for i in range(14)]:
            _box(c,'steel','Canopy fluorescent housing',(x,5.14,z),(.40,.09,1.7))
            _box(c,'light','Canopy fluorescent diffuser',(x,5.085,z),(.32,.02,1.55))
    # Native Eevee daylight fills the canopy below its opaque roof panels.
    for z in (a+20,a+65,a+110):
        data=bpy.data.lights.new('Caño Amarillo diffuse skylight','AREA'); data.energy=500;data.size=12
        obj=bpy.data.objects.new(data.name,data);c.objects.link(obj);obj.location=(2,6.2,z);obj.rotation_euler=(-math.pi/2,0,0)


def _altamira_entrance(parent,stop):
    c=_collection('Altamira Plaza entrance',parent); z=stop-65
    # Separate surface ensemble. It does not intrude into the platform volume.
    for x in (-5.,15.):
        _box(c,'pale','Plaza terrace',(x,9.10,z),(8,.35,23))
        _box(c,'terracotta','Sunken court retaining face',(x+(4 if x<0 else -4),7.5,z),(.25,3.2,23))
    _box(c,'pale','Sunken entrance landing',(5,6.6,z),(12,.3,23))
    _box(c,'water','Entrance reflecting pool',(5,6.81,z+7),(5,.08,7))
    _box(c,'pale','Footbridge crossing the sunken plaza',(5,9.12,z),(28,.28,2.4))
    for zz in (z-1.2,z+1.2):
        for yy in (9.64,10.12): _beam(c,'teal','Bridge horizontal balustrade',(-9,yy,zz),(19,yy,zz),.043)
        for x in range(-9,20): _beam(c,'teal','Bridge balustrade posts',(x,9.24,zz),(x,10.12,zz),.032)
    for x in (-.1,10.1):
        for i in range(14):
            _box(c,'pale','Broad plaza entrance stairs',(x,6.8+i*.175,z-10+i*.42),(3.6,.175,.425))
        for dx in (-1.65,1.65):
            _beam(c,'teal','Plaza stair handrails',(x+dx,7.7,z-10),(x+dx,9.98,z-4.5),.043)
    for x in (-3.,13.):
        _box(c,'pale','Raised planter bed',(x,9.52,z+6),(2.6,.5,7))
        _box(c,'plant','Low planted bed',(x,9.80,z+6),(2.3,.12,6.6))
    _sign(c,'M   ALTAMIRA',5,8.55,z-4.5,4.5,'white',.37,False)


def _flush():
    for (cname,material,name),(verts,faces,smooth) in _batches.items():
        me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces);me.materials.append(M[material]);me.update()
        if material=='floor':
            uv=me.uv_layers.new(name='World-scale rubber pattern')
            for loop in me.loops:
                vertex=me.vertices[loop.vertex_index].co
                uv.data[loop.index].uv=(vertex.x/.32,vertex.z/.32)
        for p,s in zip(me.polygons,smooth):p.use_smooth=s
        obj=bpy.data.objects.new(name,me);bpy.data.collections[cname].objects.link(obj)
    _batches.clear()


def build_environment(stops=None,parent=None):
    stops=stops or STOPS; parent=parent or bpy.context.scene.collection
    _batches.clear(); _materials(); _route(parent,stops); result={}
    for name,stop in stops.items():
        c=_collection('Station '+name,parent); result[name]=c
        c['referenceBasis']='Original station photographs; dimensions estimated; see docs/STATION_REFERENCES.md'
        c['platformLayout']=LAYOUT[name]; c['stopPosition']=stop
        a,b=_platform(c,name,stop)
        for center in ((0,10) if LAYOUT[name]=='island' else (0,4)): _track(c,center,a,b)
        if name=='Caño Amarillo':_cano(c,stop)
        else:_underground(c,name,stop)
    _altamira_entrance(parent,stops['Altamira']); _flush()
    return result


__all__=['STOPS','LAYOUT','build_environment']
