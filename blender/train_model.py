"""Native CAF Serie 6 exterior for the Caracas Metro Line 1 consist.

The supplied Caracas CAF photographs are the source for the proportions and
the colour blocking in this module.  Blender uses Y up and Z along the route:
the first cab nose is near Z=0 and the seven cars extend toward negative Z.
All of the visible bodywork is made here as native Blender geometry so the
train remains editable and exports cleanly to glTF.
"""

from __future__ import annotations

import math

import bpy
import bmesh
from mathutils import Vector, Matrix
from mathutils.geometry import delaunay_2d_cdt
from body_geometry import (body_width, body_slope, body_section_for_cab, roof_height,
    BODY_HALF_LENGTH, BOGIE_HALF_SPACING, CAR_PITCH, CAB_JOIN, CAB_SHIFT,
    DOOR_WIDTH, DOOR_HEIGHT, door_centres, saloon_bay_centres)


def _material(name, color, metallic=0.0, roughness=0.45, emission=None):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 2.5
    return material


def _materials():
    materials = {
        "silver": _material("CAF 2010 brushed aluminium", (.52, .55, .55), .62, .32),
        "silver_light": _material("CAF rounded silver shoulder", (.75, .77, .74), .32, .26),
        "white_paint": _material("CAF white printed markings", (.86, .87, .85), 0, .34),
        "silver_dark": _material("CAF lower apron shadow", (.33, .36, .35), .70, .29),
        "red": _material("CAF delivery red", (.62, .008, .006), .0, .30),
        "red_dark": _material("CAF red edge shadow", (.46, .008, .005), .10, .38),
        "black": _material("CAF rubber black", (.006, .008, .009), .08, .52),
        "black_soft": _material("CAF fascia soft black", (.018, .021, .021), .16, .34),
        "glass": _material("CAF smoked blue glazing", (.008, .035, .048), .34, .075),
        "glass_inner": _material("CAF windshield blue depth", (.014, .060, .068), .20, .11),
        "amber": _material("CAF amber destination text", (1.0, .42, .025), .05, .22, (1.0, .16, .01)),
        "yellow": _material("CAF Venezuelan yellow stripe", (1.0, .72, .012), .08, .34),
        "blue": _material("CAF Venezuelan blue stripe", (.015, .10, .72), .12, .34),
        "green": _material("CAF Venezuelan green stripe", (.035, .43, .10), .08, .37),
        "white": _material("CAF headlamp white", (1.0, .89, .62), .05, .21, (1.0, .65, .22)),
        "tail": _material("CAF marker red", (.65, .003, .002), .05, .20),
        "steel": _material("CAF bogie steel", (.042, .049, .052), .70, .38),
        "wheel": _material("CAF running wheel steel", (.025, .029, .030), .82, .30),
        "steel_light": _material("CAF machined bogie edges", (.38, .40, .38), .80, .20),
        "rubber": _material("CAF wheel rubber", (.009, .011, .012), .02, .74),
        "copper": _material("CAF coupler machined metal", (.30, .30, .27), .73, .27),
        "coupler_face": _material("CAF coupler satin machined face", (.36, .37, .34), .78, .38),
        "coupler_cast": _material("CAF coupler dark cast steel", (.027, .032, .031), .72, .43),
        "coupler_blue": _material("CAF coupler blue control hose", (.018, .15, .28), .0, .46),
    }
    glass = _material('CAF passenger transparent glazing', (.16, .25, .28), .05, .16)
    glass.diffuse_color = (.16, .25, .28, .24)
    glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value = .24
    glass.surface_render_method = 'DITHERED'
    materials['passenger_glass'] = glass
    # Dielectric laminated glass: the former opaque, metallic blue material
    # hid the cab and read as a painted panel instead of bonded glazing.
    cab_glass = _material('CAF clear laminated cab glazing', (.18, .23, .25), 0, .10)
    cab_glass.diffuse_color = (.18, .23, .25, .28)
    bsdf = cab_glass.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Alpha'].default_value = .28
    bsdf.inputs['IOR'].default_value = 1.52
    bsdf.inputs['Coat Weight'].default_value = .85
    bsdf.inputs['Coat Roughness'].default_value = .06
    cab_glass.surface_render_method = 'DITHERED'
    materials['cab_glass'] = cab_glass
    materials['frit'] = _material('CAF black ceramic glass border', (.007, .009, .009), 0, .13)
    return materials


def _link(obj, collection):
    collection.objects.link(obj)
    return obj


def _mesh(name, verts, faces, material, collection, smooth=False):
    mesh = bpy.data.meshes.new(name + " mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(material)
    mesh.update()
    obj = _link(bpy.data.objects.new(name, mesh), collection)
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    return obj


def _box(name, loc, dims, material, collection, bevel=0.0):
    a,b,c=(v/2 for v in dims)
    verts=[(-a,-b,-c),(a,-b,-c),(a,b,-c),(-a,b,-c),(-a,-b,c),(a,-b,c),(a,b,c),(-a,b,c)]
    faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(1,2,6,5),(0,4,7,3)]
    obj=_mesh(name,verts,faces,material,collection)
    obj.location=loc
    if bevel:
        modifier = obj.modifiers.new("rounded manufactured edge", "BEVEL")
        modifier.width = bevel
        modifier.segments = 4
    return obj


def _cylinder(name, loc, radius, depth, material, collection, rotation=(0, 0, 0), vertices=32):
    coords=[(radius*math.cos(i*2*math.pi/vertices),radius*math.sin(i*2*math.pi/vertices),z) for z in (-depth/2,depth/2) for i in range(vertices)]
    faces=[(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]
    faces += [tuple(range(vertices-1,-1,-1)),tuple(range(vertices,2*vertices))]
    obj=_mesh(name,coords,faces,material,collection)
    obj.location=loc;obj.rotation_euler=rotation
    for poly in list(obj.data.polygons)[:vertices]: poly.use_smooth=True
    return obj


def _beam(name, a, b, radius, material, collection, vertices=16):
    start, end = Vector(a), Vector(b)
    delta = end - start
    if delta.length < 1.0e-6:
        return None
    obj = _cylinder(name, (start + end) / 2.0, radius, delta.length, material, collection, vertices=vertices)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(delta.normalized())
    return obj


def _tube(name,points,radius,material,collection,segments=8):
    """A continuous pipe/coil mesh, avoiding hundreds of separate cylinders."""
    path=[Vector(p) for p in points];verts=[];faces=[];normal=None;previous=None
    for i,p in enumerate(path):
        tangent=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
        if normal is None:
            axis=Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((1,0,0))
            normal=tangent.cross(axis).normalized()
        else:
            normal=previous.rotation_difference(tangent)@normal
            normal=(normal-tangent*normal.dot(tangent)).normalized()
        binormal=tangent.cross(normal).normalized();previous=tangent
        for j in range(segments):
            a=2*math.pi*j/segments
            verts.append(tuple(p+radius*(math.cos(a)*normal+math.sin(a)*binormal)))
        if i:
            for j in range(segments):
                a=(i-1)*segments+j;b=(i-1)*segments+(j+1)%segments
                faces.append((a,b,b+segments,a+segments))
    faces.extend((tuple(reversed(range(segments))),tuple(range((len(path)-1)*segments,len(path)*segments))))
    return _mesh(name,verts,faces,material,collection,smooth=True)


def _rounded_rect(x0, x1, y0, y1, radius, segments=6):
    """Counter-clockwise rounded rectangle in a 2D plane."""
    x0,x1=sorted((x0,x1));y0,y1=sorted((y0,y1))
    radius = max(0.001, min(radius, (x1 - x0) * 0.5, (y1 - y0) * 0.5))
    corners = (
        (x1 - radius, y1 - radius, 0.0),
        (x0 + radius, y1 - radius, math.pi / 2.0),
        (x0 + radius, y0 + radius, math.pi),
        (x1 - radius, y0 + radius, 3.0 * math.pi / 2.0),
    )
    points = []
    for cx, cy, start in corners:
        for i in range(segments + 1):
            angle = start + math.pi * 0.5 * i / segments
            points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return points


def _side_surface(name, side, y0, y1, z0, z1, material, collection, offset=0.0, radius=0.08, holes=None):
    """Manufactured panel on the actual canted body, with rounded corners."""
    z0,z1=sorted((z0,z1));r=min(radius,(z1-z0)/2,(y1-y0)/2)
    if holes:
        outline = _rounded_rect(z0, z1, y0, y1, r, 8)
        loops = [outline] + [_rounded_rect(a,b,c,d,e,8) for a,b,c,d,e in holes]
        coords=[];edges=[]
        for loop in loops:
            start=len(coords);coords.extend(Vector(p) for p in loop)
            edges.extend((start+i,start+(i+1)%len(loop)) for i in range(len(loop)))
        # Sampling the curved body avoids a single flat triangular patch.
        for j in range(1,33):
            for k in range(1,9):
                coords.append(Vector((z0+(z1-z0)*k/9,y0+(y1-y0)*j/33)))
        vs,_,tris,*_=delaunay_2d_cdt(coords,edges,[],0,1e-7,False)
        def inside(p, loop):
            result=False
            for a,b in zip(loop,loop[1:]+loop[:1]):
                if (a[1]>p[1])!=(b[1]>p[1]) and p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]:result=not result
            return result
        faces=[]
        for tri in tris:
            mid=sum((vs[i] for i in tri),Vector((0,0)))/len(tri)
            if inside(mid,outline) and not any(inside(mid,h) for h in loops[1:]):
                # Coordinates (Z,Y) have a -X positive winding.
                faces.append(tuple(reversed(tri)) if side>0 else tuple(tri))
        obj=_mesh(name,[(side*(body_width(y)+offset),y,z) for z,y in vs],faces,material,collection,True)
        obj.data.normals_split_custom_set_from_vertices([tuple(Vector((side,-body_slope(y),0)).normalized()) for z,y in vs])
        return obj
    ys=sorted(set([y0,y1,y0+r,y1-r]+[y0+(y1-y0)*i/32 for i in range(1,32)]+
        [y0+r*(1-math.cos(i*math.pi/24)) for i in range(13)]+
        [y1-r*(1-math.cos(i*math.pi/24)) for i in range(13)]))
    verts=[];faces=[]
    for y in ys:
        dy=max(0,r-min(y-y0,y1-y))
        inset=r-math.sqrt(max(0,r*r-dy*dy))
        for z in (z0+inset,z1-inset):verts.append((side*(body_width(y)+offset),y,z))
    for i in range(len(ys)-1):
        face=(2*i,2*i+2,2*i+3,2*i+1)
        faces.append(tuple(reversed(face)) if side<0 else face)
    obj=_mesh(name,verts,faces,material,collection,smooth=True)
    obj.data.normals_split_custom_set_from_vertices([tuple(Vector((side,-body_slope(y),0)).normalized()) for x,y,z in verts])
    return obj


# ---------------------------------------------------------------------------
# Continuous car shell and cab geometry


def _cross_section(half_width, bottom, top, roof_radius=None):
    from cab_geometry import OUTLINE, width, YMAX
    return body_section_for_cab(OUTLINE,width,YMAX)


def _loft_shell(center_z, direction, collection, mats, cab):
    section=_cross_section(1.5,.84,3.69);n=len(section)
    end=CAB_JOIN if cab else BODY_HALF_LENGTH
    rings=[-BODY_HALF_LENGTH+(end+BODY_HALF_LENGTH)*i/60 for i in range(61)]
    verts=[(x,y,center_z+direction*u) for u in rings for x,y in section]
    faces=[]
    for k in range(60):
        for i in range(n):
            a=k*n+i;b=k*n+(i+1)%n
            faces.append((a,a+n,b+n,b) if direction>0 else (a,b,b+n,a+n))
    shell=_mesh('CAF extruded aluminium body section',verts,faces,mats['silver'],collection,smooth=True)
    # Actual openings through the original loft. One disjoint cutter includes
    # every passenger/door window and crosses both sides of the body.
    openings=[(u,1.672) for u in saloon_bay_centres(cab)]
    openings += [(u,.702) for u in ((-8.73,) if cab else (-8.73,8.73))]
    apertures=[_rounded_rect(center_z+direction*u-w/2+.009,
        center_z+direction*u+w/2-.009,2.204,3.026,.061,8) for u,w in openings]
    # Doors require a full-height hole through the body, not two window holes.
    apertures += [_rounded_rect(center_z+direction*u-DOOR_WIDTH/2,
        center_z+direction*u+DOOR_WIDTH/2,1.06,1.06+DOOR_HEIGHT,.045,8) for u in door_centres(cab)]
    cutverts=[];cutfaces=[]
    for loop in apertures:
        start=len(cutverts);count=len(loop)
        cutverts.extend((x,y,zz) for x in (-1.9,1.9) for zz,y in loop)
        cutfaces.extend([tuple(start+i for i in range(count)),tuple(start+count+i for i in reversed(range(count)))])
        for i in range(count):cutfaces.append((start+i,start+count+i,start+count+(i+1)%count,start+(i+1)%count))
    cutter=_mesh('Temporary native window apertures',cutverts,cutfaces,mats['black'],collection)
    modifier=shell.modifiers.new('Open passenger glazing apertures','BOOLEAN')
    modifier.operation='DIFFERENCE';modifier.solver='EXACT';modifier.object=cutter
    bpy.context.view_layer.objects.active=shell
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    # The body is an open extrusion. Boolean cuts can retain cutter faces
    # spanning the aisle; keep only the real side-wall aperture surfaces.
    bm = bmesh.new()
    bm.from_mesh(shell.data)
    false_caps = [f for f in bm.faces
                  if min(v.co.y for v in f.verts) >= 1.049
                  and max(v.co.y for v in f.verts) <= 3.094
                  and min(v.co.x for v in f.verts) < -.2
                  and max(v.co.x for v in f.verts) > .2]
    bmesh.ops.delete(bm, geom=false_caps, context='FACES')
    bm.to_mesh(shell.data)
    bm.free()
    shell.data.update()
    bpy.data.objects.remove(cutter,do_unlink=True)
    normals=[]
    for vertex in shell.data.vertices:
        x,y,z=vertex.co
        if abs(x)>.8 and .86<y<3.40:
            normals.append(tuple(Vector((math.copysign(1,x),-body_slope(y),0)).normalized()))
        else:normals.append(tuple(vertex.normal))
    shell.data.normals_split_custom_set_from_vertices(normals)
    # Flat end diaphragms have independent normals; smoothing a large end
    # cap into the side was producing the earlier long triangular highlights.
    for u in ((-BODY_HALF_LENGTH,) if cab else (-BODY_HALF_LENGTH,BODY_HALF_LENGTH)):
        # The gangway is an opening, not an opaque plate across the aisle.
        z=center_z+direction*u
        for side in (-1,1):
            _box('CAF structural gangway jamb',(side*1.205,2.17,z),(.25,2.26,.028),mats['silver_dark'],collection,.018)
        _box('CAF structural gangway header',(0,3.43,z),(2.45,.30,.028),mats['silver_dark'],collection,.025)
        _box('CAF structural gangway sill',(0,1.01,z),(2.72,.075,.028),mats['silver_dark'],collection,.012)
    shell['reference']='161-200-05-602 Fig.2-21 and tables 5-6/5-7'
    shell['construction']='welded aluminium extrusions; traced canted side and rounded roof'
    return shell














def _side_window(name, center_z, direction, side, local_u, width, y0, y1, collection, mats):
    route_center = center_z + direction * local_u
    for suffix,extra,offset,material in (('aluminium rebate',.031,.018,'silver_dark'),
        ('moulded gasket',.023,.030,'black'),('bonded glazing',0,.034,'passenger_glass')):
        _side_surface(f'{name} {suffix}',side,y0-extra,y1+extra,
            route_center-width/2-extra,route_center+width/2+extra,
            mats[material],collection,offset,.070+extra,
            holes=[(route_center-width/2+.004,route_center+width/2-.004,y0+.004,y1-.004,.066)] if material!='passenger_glass' else None)


def _side_text(name,text,side,y,z,size,material,collection,offset=.045):
    curve=bpy.data.curves.new(name,'FONT');curve.body=text;curve.size=size
    curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=3
    obj=_link(bpy.data.objects.new(name,curve),collection);curve.materials.append(material)
    obj.location=(side*(body_width(y)+offset),y,z)
    normal=Vector((side,-body_slope(y),0)).normalized()
    right=Vector((0,0,-side));up=normal.cross(right).normalized()
    obj.rotation_mode='QUATERNION';obj.rotation_quaternion=Matrix((right,up,normal)).transposed().to_quaternion()
    return obj


def _side_logo(side,y,z,collection,mats):
    # Small delivery-era Metro mark; vector geometry stays sharp at close range.
    _side_text('CAF Metro delivery marking','Metro',side,y,z,.145,mats['red'],collection)
    _side_text('CAF Caracas logo subtitle','CARACAS',side,y-.095,z-.060*side,.037,mats['black_soft'],collection)
    cz=z+.225*side;cy=y+.055
    star=[]
    for i in range(10):
        a=math.pi/2+i*math.pi/5;r=.103 if i%2==0 else .040
        yy=cy+r*math.sin(a);zz=cz+r*math.cos(a)
        star.append((side*(body_width(yy)+.043),yy,zz))
    _mesh('CAF Metro logo red star',star,[tuple(range(10))],mats['red'],collection)
    arc=[]
    for i in range(29):
        a=math.pi*.04+i*math.pi*.94/28;yy=y-.050+.245*math.sin(a)
        arc.append((side*(body_width(yy)+.047),yy,cz+.245*math.cos(a)))
    _tube('CAF Metro logo silver arch',arc,.007,mats['silver_dark'],collection)


def _door_leaf(name, center_z, direction, side, local_u, leaf_offset, collection, mats, bay):
    route_center = center_z + direction * (local_u + leaf_offset)
    before=set(collection.objects)
    _side_surface(name,side,1.06,1.06+DOOR_HEIGHT,route_center-.434,route_center+.434,mats['red'],collection,.014,.050,
        holes=[(route_center-.253,route_center+.253,2.202,3.028,.063)])
    _side_window(f'{name} inset window',center_z,direction,side,local_u+leaf_offset,.520,2.195,3.035,collection,mats)
    _side_text('CAF door warning','NO APOYARSE',side,1.96,route_center,.025,mats['silver_light'],collection,.035)
    # Meeting seals and edge returns move with their leaf, leaving a clear
    # opening. Native parent metadata survives material batching on export.
    edge_z=route_center-direction*math.copysign(.434,leaf_offset)
    _side_surface('CAF moving door meeting seal',side,1.065,3.078,edge_z-.006,edge_z+.006,mats['black'],collection,.035,.001)
    for edge in (-.430,.430):
        _side_surface('CAF door folded edge return',side,1.075,3.065,route_center+edge-.006,route_center+edge+.006,mats['red_dark'],collection,-.018,.002)
    car=int(collection.name[-2:])
    local_leaf=1 if leaf_offset>0 else -1
    assembly=bpy.data.objects.new(f'CAF door {car:02d} {side:+d} {bay} {local_leaf:+d}',None)
    collection.objects.link(assembly)
    assembly['doorId']=f'{car:02d}:{side}:{bay}:{local_leaf}'
    assembly['doorSide']=side
    assembly['doorCentreLocal']=local_u
    assembly['doorTravelZ']=direction*local_leaf*.895
    assembly['doorTravelX']=side*.115
    for obj in set(collection.objects)-before-{assembly}:
        obj.parent=assembly
    return assembly


def _side_details(center_z, direction, side, collection, mats, driving=False):
    doors=door_centres(driving)
    for door_index, local_u in enumerate(doors, 1):
        route_center=center_z+direction*local_u
        _side_surface('CAF recessed door portal',side,1.02,3.125,route_center-.91,route_center+.91,mats['black'],collection,.006,.065,
            holes=[(route_center-DOOR_WIDTH/2,route_center+DOOR_WIDTH/2,1.06,1.06+DOOR_HEIGHT,.045)])
        for leaf_offset in (-.442, .442):
            _door_leaf(f"CAF paired door {door_index:02d} leaf", center_z, direction, side, local_u, leaf_offset, collection, mats, door_index)
        # Separate guides and thresholds, visible in the platform-side photo.
        _box('CAF grooved aluminium threshold',(side*(body_width(1.04)+.025),1.035,route_center),(.115,.042,1.79),mats['silver_dark'],collection,.010)
        for off in (-.026,.006,.036):
            _box('CAF threshold anti-slip groove',(side*(body_width(1.04)+off),1.060,route_center),(.010,.003,1.72),mats['black_soft'],collection,.001)
        _side_surface('CAF overhead door guide cover',side,3.12,3.23,route_center-.945,route_center+.945,mats['silver_dark'],collection,.022,.025)
        for edge in (-.85,.85):
            _side_text('CAF door number',str(door_index),side,3.19,route_center+edge,.035,mats['black_soft'],collection,.035)

    for window_index, local_u in enumerate(saloon_bay_centres(driving), 1):
        _side_window(f"CAF passenger window {window_index:02d}",center_z,direction,side,local_u,1.672,2.195,3.035,collection,mats)
        _side_logo(side,1.79,center_z+direction*local_u,collection,mats)
    for local_u in ((-8.73,) if driving else (-8.73,8.73)):
        _side_window('CAF small end window',center_z,direction,side,local_u,.702,2.195,3.035,collection,mats)

    fascia_end=CAB_JOIN if driving else 10.18
    _side_surface('CAF red upper body fascia',side,3.25,3.46,center_z-direction*10.18,center_z+direction*fascia_end,mats['red'],collection,.008,.012)
    _side_surface('CAF roof gutter extrusion',side,3.475,3.496,center_z-direction*10.18,center_z+direction*fascia_end,mats['silver_light'],collection,.016,.008)
    _side_surface('CAF continuous bottom sill',side,.89,1.04,center_z-direction*10.18,center_z+direction*fascia_end,mats['silver_dark'],collection,.012,.015)
    for u in (-9.8,-5.0,0,5.0,7.95):
        if u>fascia_end:continue
        _cylinder('CAF upper fascia countersunk fixing',(side*(body_width(3.355)+.019),3.355,center_z+direction*u),.014,.006,mats['silver_dark'],collection,rotation=(0,math.pi/2,0),vertices=12)
    panel_intervals=[(-10.17,doors[0]-.94)]+[(a+.94,b-.94) for a,b in zip(doors,doors[1:])]
    panel_intervals.append((doors[-1]+.94,CAB_JOIN if driving else 10.17))
    for start_u, end_u in panel_intervals:
        z0=center_z+direction*start_u;z1=center_z+direction*end_u
        for colour,y in (('red',1.43),('yellow',1.365),('green',1.30),('blue',1.235)):
            _side_surface('CAF flush four-colour stripe',side,y-.030,y+.030,z0,z1,mats[colour],collection,.005,.002)
        _side_surface('CAF lower panel access seam',side,1.075,1.092,z0,z1,mats['black_soft'],collection,.015,.003)
        for u in (start_u+.20,end_u-.20):
            _box('CAF lower skirt hinge',(side*(body_width(1.105)+.020),1.105,center_z+direction*u),(.027,.035,.24),mats['silver_light'],collection,.010)
    for u in (-3.55,3.55):
        z=center_z+direction*u
        _side_surface('CAF side inspection hatch seam',side,1.63,1.82,z-.075,z+.075,mats['silver_dark'],collection,.008,.018)
        _side_surface('CAF side inspection hatch',side,1.639,1.811,z-.066,z+.066,mats['silver'],collection,.014,.012)


def _underframe(center_z, direction, collection, mats):
    _box("CAF underframe equipment spine", (0, .72, center_z), (1.20, .40, 8.6), mats["black"], collection, .12)
    _box("CAF battery cabinet", (-.64, .66, center_z + direction * .25), (.38, .55, 1.65), mats["steel"], collection, .06)
    _box("CAF compressor cabinet", (.64, .67, center_z - direction * 1.10), (.42, .58, 1.42), mats["steel"], collection, .07)
    for local_u in (-BOGIE_HALF_SPACING, BOGIE_HALF_SPACING):
        bogie_z = center_z + direction * local_u
        # An open H-frame leaves the two running wheelsets visible. A solid
        # cuboid across the entire bogie masked them in the earlier export.
        _box("CAF bogie cross frame", (0, .70, bogie_z), (2.12, .20, .36), mats["steel"], collection, .07)
        for side in (-1, 1):
            _box("CAF bogie side frame", (side * 1.01, .73, bogie_z), (.16, .20, 2.80), mats["steel"], collection, .065)
            for axle_local in (-1.10, 1.10):
                axle_z = bogie_z + direction * axle_local
                _box("CAF cast axlebox", (side * 1.02, .57, axle_z), (.20, .22, .28), mats["steel"], collection, .055)
                _cylinder("CAF axlebox circular cover", (side * 1.13, .57, axle_z), .082, .025, mats["steel_light"], collection, rotation=(0, math.pi / 2, 0), vertices=24)
        for axle_local in (-1.10, 1.10):
            axle_z = bogie_z + direction * axle_local
            _beam("CAF bogie axle", (-.93, .56, axle_z), (.93, .56, axle_z), .055, mats["steel"], collection, vertices=14)
            # Rail wheels are steel CAF running wheels at gauge positions
            # +/-0.76 m: two axles x two wheels per axle = eight wheels/car.
            for x in (-.76, .76):
                _cylinder("CAF steel rail wheel", (x, .57, axle_z), .44, .18, mats["wheel"], collection, rotation=(0, math.pi / 2.0, 0), vertices=48)
                _cylinder("CAF wheel flange", (x - math.copysign(.078, x), .57, axle_z), .455, .030, mats["wheel"], collection, rotation=(0, math.pi / 2, 0), vertices=48)
                _cylinder("CAF machined wheel hub", (x, .57, axle_z), .16, .20, mats["steel_light"], collection, rotation=(0, math.pi / 2.0, 0), vertices=24)
            for side in (-1, 1):
                _cylinder("CAF brake disc", (side * .91, .57, axle_z), .25, .018, mats["steel"], collection, rotation=(0, math.pi / 2.0, 0), vertices=28)
        for side in (-1, 1):
            for axle_local in (-1.10, 1.10):
                _cylinder("CAF bogie suspension can", (side * .82, .84, bogie_z + direction * axle_local), .105, .34, mats["steel"], collection, rotation=(math.pi / 2.0, 0, 0), vertices=20)
                # Visible primary spring and damper around the axlebox.
                zs=bogie_z+direction*axle_local
                points=[(side*1.00+.080*math.cos(i*math.pi/8),.71+.22*i/64,zs+.080*math.sin(i*math.pi/8)) for i in range(65)]
                _tube('CAF primary suspension coil',points,.013,mats['steel'],collection)
                _beam('CAF primary hydraulic damper',(side*1.15,.52,zs-.20),(side*1.15,.92,zs-.37),.030,mats['black_soft'],collection,12)
                for dz in (-.077,.077):
                    _cylinder('CAF axlebox cover screw',(side*1.149,.57+dz,zs),.011,.012,mats['steel_light'],collection,rotation=(0,math.pi/2,0),vertices=8)
            for y,r in ((.91,.20),(.96,.22),(1.01,.20)):
                _cylinder('CAF secondary air spring bellows',(side*.84,y,bogie_z),r,.066,mats['rubber'],collection,rotation=(math.pi/2,0,0),vertices=32)
            _beam('CAF bogie brake pipe',(side*1.13,.79,bogie_z-1.18),(side*1.13,.79,bogie_z+1.18),.013,mats['steel_light'],collection,10)
            for off in (-1.10,1.10):
                _box('CAF disc brake caliper',(side*.92,.57,bogie_z+direction*(off+.19)),(.21,.30,.17),mats['steel'],collection,.040)
            _box('CAF third rail collector support',(side*1.22,.58,bogie_z),(.20,.13,.54),mats['steel'],collection,.025)
            _box('CAF third rail collector shoe',(side*1.39,.39,bogie_z),(.11,.058,.54),mats['copper'],collection,.020)
        _box("CAF bogie centre bolster", (0, .77, bogie_z), (.58, .30, .48), mats["steel_light"], collection, .07)
    # Long underfloor cabinets and cylinders are visible in Fig.2-3. Their
    # detailed placement and pipe sizes remain estimates from the elevation.
    for side in (-1,1):
        for u,length in ((-4.25,1.15),(-2.72,1.18),(-.90,1.43),(1.1,1.31),(3.18,1.63),(4.7,.90)):
            z=center_z+direction*u
            _box('CAF underfloor removable equipment cabinet',(side*.87,.64,z),(.55,.56,length),mats['steel'],collection,.045)
            _box('CAF equipment cabinet lid',(side*1.153,.66,z),(.018,.46,length-.055),mats['silver_dark'],collection,.015)
            for dz in (-length*.36,length*.36):
                _box('CAF equipment quarter-turn latch',(side*1.172,.75,z+dz),(.018,.052,.024),mats['steel_light'],collection,.006)
            if u in (-2.72,3.18):
                for j in range(12):
                    _box('CAF cabinet cooling louvre',(side*1.18,.50+j*.023,z),(.032,.010,length-.21),mats['black_soft'],collection,.003)
        _beam('CAF underfloor pneumatic line',(side*.61,.41,center_z-4.7),(side*.61,.41,center_z+4.7),.017,mats['steel_light'],collection,10)
    for u in (-4.5,4.4):
        _cylinder('CAF horizontal compressed-air reservoir',(0,.61,center_z+direction*u),.22,1.12,mats['steel'],collection,vertices=32)


def _roof(center_z, direction, collection, mats):
    for x in (-.56,-.28,0,.28,.56):
        _box('CAF longitudinal roof extrusion rib',(x,roof_height(x)+.008,center_z-.5*direction),(.021,.027,15.1),mats['silver_dark'],collection,.009)
    for local_u in (-3.15, 2.65):
        pod_z = center_z + direction * local_u
        _box("CAF shallow HVAC pod", (0, 3.78, pod_z), (1.04, .18, 1.62), mats["silver_light"], collection, .10)
        _box("CAF dark HVAC grille", (0, 3.885, pod_z), (.74, .030, 1.18), mats["black_soft"], collection, .035)
        for vent in [i*.06 for i in range(-9,10)]:
            _box("CAF HVAC grille fin", (0, 3.915, pod_z + direction * vent), (.78, .018, .045), mats["steel"], collection, .006)
        for x in (-.45,.45):
            for dz in (-.67,.67):
                _cylinder('CAF roof pod cover screw',(x,3.880,pod_z+dz),.013,.008,mats['steel_light'],collection,rotation=(math.pi/2,0,0),vertices=10)
    _box("CAF roofline cable tray", (0, 3.83, center_z + direction * .10), (.18, .08, 4.8), mats["black"], collection, .025)


def _diaphragm(center_z, direction, local_u, collection, mats):
    z = center_z + direction * local_u
    for side in (-1,1):
        _box('CAF bellows flexible backing',(side*1.095,2.17,z+direction*.125),(.024,2.26,.248),mats['rubber'],collection,.007)
    for y in (1.04,3.30):
        _box('CAF bellows horizontal backing',(0,y,z+direction*.125),(2.19,.024,.248),mats['rubber'],collection,.007)
    # Accordion folds run around the doorway perimeter, along the gap.
    for k in range(7):
        zz=z+direction*k*.034
        width=1.115+(.038 if k%2==0 else 0)
        for side in (-1,1):
            _box('CAF gangway vertical bellows fold',(side*width,2.17,zz),(.038,2.26,.034),mats['rubber'],collection,.012)
        for y in (1.04,3.30):
            _box('CAF gangway horizontal bellows fold',(0,y,zz),(2*width,.038,.034),mats['rubber'],collection,.012)
    _box('CAF intercar lower coupler',(0,.78,z),(.40,.22,.42),mats['steel'],collection,.050)


def _car(index, center_z, direction, driving, mats):
    name = f"CAF car {index:02d}"
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    else:
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
    collection["vehicle"] = "CAF Serie 6"
    collection["delivery"] = "Caracas Metro 2010"
    collection["route_axis"] = "Z"
    collection["up_axis"] = "Y"
    collection["underframe_length_m"] = 20.4735 if driving else 20.460
    collection["bogie_pivot_spacing_m"] = 15.250
    collection["door_opening_m"] = "1.750 x 2.0225"
    collection['door_centres_local_m']=list(door_centres(driving))
    collection["car_pitch_estimate_m"] = CAR_PITCH
    collection["body_width_m"] = 3.0
    collection["body_roof_m"] = 3.75
    _loft_shell(center_z, direction, collection, mats, driving)
    for side in (-1, 1):
        _side_details(center_z, direction, side, collection, mats, driving)
    _underframe(center_z, direction, collection, mats)
    _roof(center_z, direction, collection, mats)
    _diaphragm(center_z, -direction, BODY_HALF_LENGTH, collection, mats)
    if not driving:
        _diaphragm(center_z, direction, BODY_HALF_LENGTH, collection, mats)
    else:
        from cab_geometry import build_cab
        build_cab(collection,mats,center_z,direction,globals())
    return collection


def build_train():
    """Build and return the seven native CAF car collections."""
    mats = _materials()
    cars = []
    for index in range(1, 8):
        # The 148m consist is centred inside the station's -145..+5m
        # platform envelope when the simulation reaches a stop marker.
        center = -7.73 - (index - 1) * CAR_PITCH
        direction = 1 if index == 1 else -1 if index == 7 else 1
        cars.append(_car(index, center, direction, index in (1, 7), mats))
    return cars


if __name__ == "__main__":
    build_train()
