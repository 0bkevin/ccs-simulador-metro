"""Delivery-photo reconstruction of the exposed CAF Caracas coupling assembly.

The head silhouette, cone/cup, guard and red handle follow the CAF delivery
photograph. Installation dimensions are fitted estimates, not supplier CAD.
Coordinates are cab-local, Y up, positive Z toward the coupling face.
"""
import math

import bmesh
import bpy
from mathutils import Vector
from mathutils.geometry import delaunay_2d_cdt


def cut_recess(shell, outline, place):
    """Clip an open loft against a convex recess without adding boolean caps.

    A solid boolean can invert its interpretation at the reversed, open cab
    loft and insert the cutter's end face. Surface clipping preserves only
    original skin fragments, so neither driving end can acquire a false cap.
    """
    a=Vector(place((0,0,0)));axis=Vector(place((0,0,1)))-a
    area=sum(p[0]*q[1]-q[0]*p[1] for p,q in zip(outline,outline[1:]+outline[:1]))
    sign=1 if area>0 else -1
    planes=[(Vector((0,0,1)),-9.35)]
    for p,q in zip(outline,outline[1:]+outline[:1]):
        nx=-(q[1]-p[1])*sign;ny=(q[0]-p[0])*sign
        n=Vector((nx,ny,0)).normalized()
        planes.append((n,-n.x*p[0]-n.y*p[1]))

    def split(poly,n,d):
        inside=[];outside=[]
        for p,q in zip(poly,poly[1:]+poly[:1]):
            dp=n.dot(p)+d;dq=n.dot(q)+d
            (inside if dp>=-1e-9 else outside).append(p)
            if (dp>=-1e-9)!=(dq>=-1e-9):
                point=p+(q-p)*(dp/(dp-dq));inside.append(point);outside.append(point)
        return inside,outside

    old=shell.data;old.calc_loop_triangles();verts=[];faces=[];indices={}
    def emit(poly):
        if len(poly)<3:return
        if sum((poly[i]-poly[0]).cross(poly[i+1]-poly[0]).length for i in range(1,len(poly)-1))<1e-12:return
        face=[]
        for p in poly:
            key=tuple(round(v,8) for v in p)
            if key not in indices:indices[key]=len(verts);verts.append(place(p))
            if not face or face[-1]!=indices[key]:face.append(indices[key])
        if face[-1]==face[0]:face.pop()
        if len(set(face))>=3:faces.append(face)
    for tri in old.loop_triangles:
        poly=[]
        for index in tri.vertices:
            v=old.vertices[index].co
            poly.append(Vector((v.x,v.y,(v-a).dot(axis))))
        # Preserve unrelated skin without triangulation slivers at every
        # clipping plane; only the lower front shell can meet this recess.
        if max(p.z for p in poly)<9.35 or min(p.y for p in poly)>1.341 or min(p.x for p in poly)>.781 or max(p.x for p in poly)<-.781:
            emit(poly);continue
        for n,d in planes:
            poly,outside=split(poly,n,d);emit(outside)
            if len(poly)<3:break
    data=bpy.data.meshes.new('CAF open lower cab skin mesh')
    data.from_pydata(verts,[],faces)
    for mat in old.materials:data.materials.append(mat)
    for face in data.polygons:face.use_smooth=True
    data.update();shell.data=data
    bpy.data.meshes.remove(old)


def build_coupler(collection, mats, place, direction, helpers):
    mesh, box, beam, tube = (helpers[k] for k in ('_mesh', '_box', '_beam', '_tube'))
    from cab_geometry import fillet
    cab_place=place
    # A rear coupling is rotated, not mirrored: its cone/cup handedness must
    # stay the same when looking at either mating face from outside the train.
    def place(p):
        return cab_place((direction*p[0],p[1],p[2]))

    def block(name, p, size, mat, bevel=.004):
        return box('CAF coupler '+name, place(p), size, mat, collection, bevel)

    def rod(name, a, b, radius, mat, segments=24):
        return beam('CAF coupler '+name, place(a), place(b), radius, mat, collection, segments)

    def lathe(name, x, y, profile, mat, segments=64):
        # Hollow turned surfaces, rather than cylinders capping the sockets.
        verts=[place((x+r*math.cos(i*math.tau/segments),
                      y+r*math.sin(i*math.tau/segments), z))
               for r,z in profile for i in range(segments)]
        faces=[]
        for row in range(len(profile)-1):
            for i in range(segments):
                a=row*segments+i;b=row*segments+(i+1)%segments
                face=(a,b,b+segments,a+segments)
                faces.append(face)
        return mesh('CAF coupler '+name,verts,faces,mat,collection,smooth=True)

    outline=fillet([(-.255,-.174),(-.255,.162),(-.229,.190),(-.086,.190),
                    (-.057,.220),(.025,.224),(.075,.190),(.229,.190),
                    (.255,.162),(.255,-.162),(.229,-.188),(.071,-.188),
                    (.047,-.228),(-.031,-.228),(-.062,-.188),(-.229,-.188)],.023,5)
    outline=[(x,y+.760) for x,y in outline]
    # The left opening carries a projecting guide cone; the right one remains
    # a genuinely recessed receiving cup. Smaller bores are pneumatic ports.
    holes=[(-.127,.785,.103),(.127,.785,.113),(.006,.963,.018),
           (.006,.626,.014),(.006,.580,.019)]

    def in_polygon(p, polygon):
        x,y=p;inside=False
        for (a,b),(c,d) in zip(polygon,polygon[1:]+polygon[:1]):
            if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:inside=not inside
        return inside

    def pierced_plate(name, z_back, z_front, mat, bevel):
        loops=[outline]+[[(x+r*math.cos(i*math.tau/64),y+r*math.sin(i*math.tau/64))
                         for i in range(64)] for x,y,r in holes]
        verts2=[];edges=[]
        for loop in loops:
            start=len(verts2);verts2.extend(Vector(p) for p in loop)
            edges.extend((start+i,start+(i+1)%len(loop)) for i in range(len(loop)))
        coords,_,triangles,*_=delaunay_2d_cdt(verts2,edges,[],0,1e-8,False)
        verts=[place((p.x,p.y,z)) for z in (z_back,z_front) for p in coords]
        count=len(coords);faces=[]
        for tri in triangles:
            p=sum((coords[i] for i in tri),Vector((0,0)))/len(tri)
            if not in_polygon(p,outline) or any((p.x-x)**2+(p.y-y)**2<r*r for x,y,r in holes):continue
            a,b,c=(coords[i] for i in tri[:3]);positive=(b-a).cross(c-a)>0
            face=tuple(tri) if positive else tuple(reversed(tri))
            faces.extend((tuple(reversed(face)),tuple(i+count for i in face)))
        # Link the same CDT vertices around every outer and inner boundary.
        for loop in loops:
            ids=[min(range(count),key=lambda i:(coords[i]-Vector(p)).length_squared) for p in loop]
            for a,b in zip(ids,ids[1:]+ids[:1]):faces.append((a,b,b+count,a+count))
        obj=mesh('CAF coupler '+name,verts,faces,mat,collection)
        bm=bmesh.new();bm.from_mesh(obj.data)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
        mod=obj.modifiers.new('small machined edge breaks','BEVEL');mod.width=bevel;mod.segments=3
        return obj

    # Deep black cast housing behind a distinct, lightly machined mating face.
    pierced_plate('cast head housing',10.075,10.256,mats['coupler_cast'],.003)
    pierced_plate('machined mating face',10.256,10.286,mats['coupler_face'],.0015)
    lathe('receiving cup',.127,.785,[(.113,10.287),(.110,10.265),
          (.079,10.160),(.071,10.075),(.071,10.045)],mats['coupler_cast'])
    lathe('cup machined lip',.127,.785,[(.1135,10.287),(.109,10.288),
          (.107,10.272)],mats['coupler_face'])
    rod('cup recessed back',(.127,.785,10.036),(.127,.785,10.044),.071,mats['black'])
    cone=lathe('projecting guide cone',-.127,.785,[(.102,10.249),(.100,10.285),
          (.093,10.309),(.059,10.385),(.036,10.409),(0,10.409)],mats['coupler_cast'])
    cutter=block('temporary guide slot',(-.127,.785,10.409),(.026,.040,.065),mats['black'],0)
    mod=cone.modifiers.new('guide cone lock slot','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter
    bpy.context.view_layer.objects.active=cone;bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter,do_unlink=True)
    block('forged locking link',(-.048,.783,10.371),(.117,.028,.037),mats['coupler_cast'],.008)
    rod('locking link pin',(-.067,.760,10.371),(-.067,.806,10.371),.011,mats['coupler_face'])
    for x,y,r in holes[2:]:
        lathe('pneumatic port sleeve',x,y,[(r,10.288),(r*.80,10.289),
              (r*.77,10.241)],mats['coupler_face'],32)
        rod('pneumatic port depth',(x,y,10.225),(x,y,10.229),r*.80,mats['black'])

    # The shank visibly connects the head to a supported mounting yoke.
    block('rear mounting crossmember',(0,.82,9.405),(1.08,.18,.17),mats['coupler_cast'],.015)
    block('drawgear bearing',(0,.780,9.540),(.37,.32,.31),mats['coupler_cast'],.030)
    rod('longitudinal shank',(0,.775,9.49),(0,.775,10.145),.112,mats['steel'])
    for z in (9.62,9.66,9.70):
        lathe('drawgear collar',0,.775,[(.112,z-.013),(.139,z-.008),
              (.139,z+.008),(.112,z+.013)],mats['black_soft'],48)
    block('head support saddle',(0,.572,10.078),(.40,.045,.35),mats['coupler_cast'],.010)
    for side in (-1,1):
        block('mounting cheek',(side*.30,.80,9.52),(.058,.31,.32),mats['coupler_cast'],.008)
        rod('yoke pivot pin',(side*.28,.79,9.53),(side*.35,.79,9.53),.056,mats['steel_light'])
        rod('guard mounting strut',(side*.49,.94,9.43),(side*.49,1.185,10.07),.036,mats['coupler_cast'])

    # Two stacked channel sections reproduce the broad slatted black guard.
    block('protective guard web',(0,1.155,10.025),(1.28,.190,.035),mats['coupler_cast'])
    for y in (1.065,1.155,1.245):
        block('guard channel flange',(0,y,10.056),(1.30,.015,.115),mats['coupler_cast'])
    for x in (-.615,0,.615):
        block('guard upright',(x,1.155,10.065),(.018,.190,.035),mats['coupler_cast'])
    for x in (-.54,-.32,.32,.54):
        rod('guard mounting bolt',(x,1.278,10.009),(x,1.278,10.024),.011,mats['coupler_face'],6)
    block('guard top mounting rail',(0,1.271,9.997),(1.15,.033,.045),mats['coupler_cast'])

    # The visible red part is modeled as a slender rigid release handle,
    # attached to a pivot, rather than the old two-elbow red hose.
    rod('release spindle',(.015,.545,10.18),(.015,.545,10.284),.022,mats['coupler_face'])
    rod('red release handle',(.015,.542,10.264),(.225,.440,10.292),.014,mats['red_dark'])
    rod('release grip',(.155,.474,10.283),(.235,.436,10.294),.018,mats['red'])

    # Flexible lines terminate in fittings on the housing and drawgear.
    paths=[('black supply hose',[(-.225,.905,10.13),(-.36,.86,10.02),(-.40,.64,9.97),
             (-.34,.52,9.88),(-.19,.54,9.74),(-.18,.71,9.59)],.013,mats['rubber']),
           ('blue control line',[(-.247,.900,10.16),(-.294,.845,10.15),(-.305,.636,10.12),
             (-.269,.602,10.09),(-.202,.622,10.03)],.008,mats['coupler_blue'])]
    for name,points,r,mat in paths:
        # Catmull-Rom samples give continuous hose bends with supported ends.
        padded=[points[0],*points,points[-1]];path=[]
        for i in range(1,len(padded)-2):
            a,b,c,d=(Vector(p) for p in padded[i-1:i+3])
            for j in range(10):
                t=j/10
                path.append(place(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)))
        path.append(place(points[-1]));tube('CAF coupler '+name,path,r,mat,collection,12)
        for p,q in ((points[0],points[1]),(points[-1],points[-2])):
            q=Vector(p)+(Vector(q)-Vector(p)).normalized()*.028
            rod('hose end fitting',p,q,r*1.65,mats['coupler_face'],6)
