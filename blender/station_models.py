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
        'floor': ((.145,.157,.161), .48, 0), 'grout': ((.072,.078,.080), .88, 0),
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
        'granite': ((.31,.33,.32), .36, .04), 'ceramic': ((.72,.73,.68), .27, 0),
        'capitolio': ((.72,.53,.045), .26, 0), 'mosaic': ((.56,.245,.085), .40, 0),
        'bronze': ((.38,.34,.13), .32, .68), 'glass': ((.20,.29,.28), .16, .14),
        'blue': ((.075,.19,.39), .51, 0), 'red': ((.54,.04,.026), .53, 0),
        'leaf': ((.19,.29,.07), .86, 0), 'soil': ((.09,.07,.04), 1., 0),
    }
    for key, (color, rough, metallic) in palette.items():
        mat = bpy.data.materials.get('L1 architecture / '+key) or bpy.data.materials.new('L1 architecture / '+key)
        mat.diffuse_color = (*color, 1)
        mat.use_nodes = True
        p = mat.node_tree.nodes.get('Principled BSDF')
        p.inputs['Base Color'].default_value = (*color, 1)
        p.inputs['Roughness'].default_value = rough
        p.inputs['Metallic'].default_value = metallic
        if key=='glass':
            p.inputs['Alpha'].default_value=.28
            mat.diffuse_color=(*color,.28)
            if hasattr(mat,'surface_render_method'):mat.surface_render_method='DITHERED'
        if key in ('light','green','orange','skylight'):
            p.inputs['Emission Color'].default_value = (*color,1)
            p.inputs['Emission Strength'].default_value = {'light':5., 'green':.65, 'orange':.4, 'skylight':.18}[key]
        M[key] = mat
    # Authored tile maps replace nearly coplanar grout strips, which shimmered
    # at long platform viewing distances. They are packed into the native file.
    for key in ('ceramic','capitolio','mosaic','beige'):
        mat=M[key].copy();mat.name='L1 architecture / tile_'+key
        pixels=array('f');color=palette[key][0];width,height=128,64
        name='Metro '+key+' ceramic tile color'
        teximage=bpy.data.images.get(name) or bpy.data.images.new(name,width=width,height=height)
        teximage.colorspace_settings.name='sRGB'
        srgb=lambda value: 12.92*value if value<=.0031308 else 1.055*value**(1/2.4)-.055
        for py in range(height):
            for px in range(width):
                seam=px<1 or py<1
                # Very slight fired ceramic variation; no photographic source.
                grain=1+(((px*17+py*23)%13)-6)*.002
                pixels.extend((*[srgb(.14 if seam else v*grain) for v in color],1.))
        teximage.pixels.foreach_set(pixels);teximage.pack()
        node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=teximage;node.interpolation='Linear'
        mat.node_tree.links.new(node.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
        M['tile_'+key]=mat
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
        _box(c,'grout','Rubber tile joints',((x0+x1)/2,1.102,z0+i*.5),(x1-x0,.002,.002))
    for i in range(int((x1-x0)/.5)+1):
        _box(c,'grout','Rubber tile joints',(x0+i*.5,1.102,(z0+z1)/2),(.002,.002,z1-z0))


def _platform(c, name, stop):
    a,b=stop-145,stop+5
    slabs=[(1.66,8.34)] if LAYOUT[name]=='island' else [(-7.1,-1.66),(5.66,11.1)]
    edges=[(1.76,1),(8.24,-1)] if LAYOUT[name]=='island' else [(-1.76,-1),(5.76,1)]
    for x0,x1 in slabs: _floor(c,x0,x1,a,b)
    for edge,d in edges:
        _box(c,'pale','Worn platform coping',(edge,1.103,(a+b)/2),(.34,.006,b-a))
        _box(c,'edge','Yellow platform edge',(edge,1.107,(a+b)/2),(.11,.012,b-a))
        # Open yellow boarding rectangles beside, not in the middle of, the platform.
        # Caño Amarillo reference has a plain safety edge. Underground stations
        # have paired queue boxes and a central discharge lane at the doors.
        for z in ([] if name=='Caño Amarillo' else [a+5+i*4.8 for i in range(29)]):
            xx=edge+d*.68
            for dz in (-1.10,1.10):
                for offset in (-.34,.34):_box(c,'edge','Paired boarding box ends',(xx,1.11,z+dz+offset),(1.05,.012,.042))
                _box(c,'edge','Paired boarding box backs',(edge+d*1.21,1.11,z+dz),(.042,.012,.72))
            for dz in (-.30,0,.30):_box(c,'edge','Central exit lane hatch',(edge+d*1.65,1.11,z+dz),(.72,.012,.035))
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
        for x in xs:
            _beam(c,'yellow','Space-frame circular node plate',(x,low-.037,z),(x,low+.037,z),.102,12)
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
    for x0,x1,mat in ((-7.2,-4.8,'roof'),(-4.8,-3.6,'skylight'),(-3.6,.8,'roof'),(.8,3.2,'skylight'),(3.2,7.6,'roof'),(7.6,8.8,'skylight'),(8.8,11.4,'roof')):
        _box(c,mat,'Canopy panels with central daylight strip',((x0+x1)/2,6.40,(a+b)/2),(x1-x0,.08,150))
    for x in [-7.1+i*.46 for i in range(41)]:
        _box(c,'yellow','Roof panel underside seams',(x,6.34,(a+b)/2),(.032,.045,150))
    for x in (-7.13,11.33):
        # Original photo shows deep, open concrete celosía, not flat glazing.
        # Individual vertical/horizontal webs preserve the shadowed apertures.
        _box(c,'pale','Concrete screen wall base',(x,1.63,(a+b)/2),(.26,1.06,150))
        for zz in [a+i*.28 for i in range(537)]:
            _box(c,'pale','Open concrete screen vertical webs',(x,3.32,zz),(.28,2.24,.045))
        for y in [2.2+i*.28 for i in range(9)]:
            _box(c,'pale','Open concrete screen horizontal webs',(x,y,(a+b)/2),(.28,.045,150))
        for zz in [a+i*4.2 for i in range(36)]:
            _box(c,'concrete','Precast screen bay frame',(x,2.80,zz),(.38,3.40,.20))
        for y in (2.16,4.48):
            _box(c,'concrete','Precast screen continuous surround',(x,y,(a+b)/2),(.36,.16,150))
        _box(c,'black','Station name fascia over glass blocks',(x,4.64,(a+b)/2),(.26,.58,150))
        for z in (a+18,a+48,a+80,a+116):
            _text(c,'Caño Amarillo',(x+(.14 if x<0 else -.14),4.64,z),.33,'white',math.pi/2 if x<0 else -math.pi/2)
    # Thin barrier between tracks, visible in the Caño Amarillo photographs.
    for z in [a+2+i*4 for i in range(37)]:
        _beam(c,'steel','Inter-track safety barrier posts',(2,.02,z),(2,2.20,z),.027,8)
    _box(c,'black','Inter-track continuous name band',(2,2.18,(a+b)/2),(.045,.18,150))
    for z in (a+21,a+59,a+97,a+130):
        _text(c,'Caño Amarillo',(1.967,2.18,z),.13,'white',-math.pi/2)
    for zz in (a+39,a+111):
        _box(c,'edge','Track divider warning band',(2,1.88,zz),(.045,.19,6.4))
        _text(c,'NO CRUCE LAS VÍAS',(1.97,1.88,zz),.10,'black',-math.pi/2)
    for x in (-4.4,8.4):
        for z in [a+5+i*10 for i in range(14)]:
            _box(c,'steel','Canopy fluorescent housing',(x,5.14,z),(.40,.09,1.7))
            _box(c,'light','Canopy fluorescent diffuser',(x,5.085,z),(.32,.02,1.55))
    # Deck edge, drainage, rail clips and roof bracket details remain native.
    _box(c,'concrete','Elevated station structural deck',(2,-.61,(a+b)/2),(18.5,.54,150))
    for x in (-6.8,10.8):
        for zz in [a+8+i*18 for i in range(8)]:
            _box(c,'steel','Platform drainage grate',(x,1.109,zz),(.36,.018,.64))
            for j in range(8):_box(c,'black','Drainage grate slots',(x,1.121,zz-.26+j*.072),(.29,.002,.027))
    from station_architecture import fascia
    for x in (-4.4,8.4):
        for zz in (a+16,b-18):fascia(c,'PALO VERDE' if x<0 else 'PROPATRIA',x,4.44,zz,4.0,.31,sub='Dirección')
    # Native Eevee daylight fills the canopy below its opaque roof panels.
    for z in (a+20,a+65,a+110):
        data=bpy.data.lights.new('Caño Amarillo diffuse skylight','AREA'); data.energy=500;data.size=12
        obj=bpy.data.objects.new(data.name,data);c.objects.link(obj);obj.location=(2,6.2,z);obj.rotation_euler=(-math.pi/2,0,0)


def _flush():
    for (cname,material,name),(verts,faces,smooth) in _batches.items():
        me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces);me.materials.append(M[material]);me.update()
        if material=='floor':
            uv=me.uv_layers.new(name='World-scale rubber pattern')
            for loop in me.loops:
                vertex=me.vertices[loop.vertex_index].co
                uv.data[loop.index].uv=(vertex.x/.32,vertex.z/.32)
        elif material.startswith('tile_'):
            uv=me.uv_layers.new(name='Ceramic modules 320 by 160 mm estimated')
            for loop in me.loops:
                vertex=me.vertices[loop.vertex_index].co
                uv.data[loop.index].uv=(vertex.z/.32,vertex.y/.16)
        for p,s in zip(me.polygons,smooth):p.use_smooth=s
        obj=bpy.data.objects.new(name,me);bpy.data.collections[cname].objects.link(obj)
    _batches.clear()


def build_environment(stops=None,parent=None):
    stops=stops or STOPS; parent=parent or bpy.context.scene.collection
    _batches.clear(); _materials(); _route(parent,stops); result={}
    for name,stop in stops.items():
        c=_collection('Station '+name,parent); result[name]=c
        c['referenceBasis']='2012 UrbanRail station photographs and architectural archive; dimensions estimated; see docs/STATION_REFERENCES.md'
        c['referenceEra']='2012 photographic baseline'
        c['platformLayout']=LAYOUT[name]; c['stopPosition']=stop
        a,b=_platform(c,name,stop)
        for center in ((0,10) if LAYOUT[name]=='island' else (0,4)): _track(c,center,a,b)
        if name=='Caño Amarillo':_cano(c,stop)
        else:
            from station_architecture import build_underground
            build_underground(c,name,stop)
    from station_architecture import altamira_entrance, bellas_entrance
    altamira_entrance(parent,stops['Altamira'])
    bellas_entrance(parent,stops['Bellas Artes'])
    _flush()
    return result


__all__=['STOPS','LAYOUT','build_environment']
