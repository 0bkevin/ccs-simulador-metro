"""CAF Caracas moulded cab, traced from maintenance manual 161-200-05-603.

Figure 4-1 front elevation and section A-A anchor the silhouette and rake.
This is a photograph/diagram reconstruction, not manufacturer CAD. Metres;
Y vertical, Z longitudinal. The glazing and paint follow the same surface.
"""
import math
from functools import lru_cache
import bpy
import bmesh
from mathutils import Vector, Matrix
from mathutils.geometry import delaunay_2d_cdt
from body_geometry import body_width, body_section_for_cab, CAB_SHIFT


def smooth(points, passes=3):
    for _ in range(passes):
        result=[]
        for i,p in enumerate(points):
            q=points[(i+1)%len(points)]
            result.extend(((.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]),
                           (.25*p[0]+.75*q[0],.25*p[1]+.75*q[1])))
        points=result
    return points


def fillet(points,radius=.06,segments=8):
    """Round only the corners, preserving the drawing's straight glass edges."""
    result=[]
    for i,p in enumerate(points):
        before=Vector(points[i-1]);corner=Vector(p);after=Vector(points[(i+1)%len(points)])
        incoming=(before-corner);outgoing=(after-corner)
        r=min(radius,incoming.length*.24,outgoing.length*.24)
        a=corner+incoming.normalized()*r;b=corner+outgoing.normalized()*r
        for j in range(segments+1):
            t=j/segments;q=(1-t)*(1-t)*a+2*(1-t)*t*corner+t*t*b
            result.append(tuple(q))
    return result


def inset(points, distance):
    """Constant-width inset, rather than scaling about a polygon's centre."""
    area=sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points,points[1:]+points[:1]))
    sign=1 if area>0 else -1
    result=[]
    for i,p in enumerate(points):
        p=Vector(p)
        a=(p-Vector(points[i-1])).normalized()
        b=(Vector(points[(i+1)%len(points)])-p).normalized()
        na=Vector((-a.y,a.x))*sign;nb=Vector((-b.y,b.x))*sign
        result.append(tuple(p+(na+nb)*distance/(1+na.dot(nb))))
    return result


def resample(points, spacing=.025):
    """Sample straight drawing edges before bending them onto the shell.

    Interior grid points cannot split constrained boundary edges. Without
    these samples a two-metre vertical seam becomes a recessed 3D chord.
    """
    result=[]
    for a,b in zip(points,points[1:]+points[:1]):
        count=max(1,math.ceil(math.hypot(b[0]-a[0],b[1]-a[1])/spacing))
        result.extend((a[0]+(b[0]-a[0])*i/count,a[1]+(b[1]-a[1])*i/count) for i in range(count))
    return result


# Fig.2-3: an upright rear edge, a raked upper front edge and two panes.
# The access door surrounds the complete window, including its top corners.
CAB_DOOR=fillet([(7.50,1.10),(8.39,1.10),(8.39,2.73),
                (8.13,3.28),(7.50,3.28)],.14,12)
CAB_WINDOW=fillet([(7.61,2.07),(8.25,2.07),(8.25,2.80),
                  (8.035,3.18),(7.61,3.18)],.095,12)
CAB_CLEAR=inset(CAB_WINDOW,.023)


# Unlike a rounded rectangle, the front bows out below the window and has
# a continuous crown. These control points follow the manual's VISTA X.
OUTLINE=smooth([(-1.27,.83),(-1.42,1.00),(-1.49,1.53),(-1.49,1.99),
                (-1.36,2.87),(-1.20,3.40),(-.96,3.65),(-.53,3.77),
                (0,3.80),(.53,3.77),(.96,3.65),(1.20,3.40),
                (1.36,2.87),(1.49,1.99),(1.49,1.53),(1.42,1.00),
                (1.27,.83),(.82,.83),(-.82,.83)],3)
# The loft, body section and front triangulation must use the SAME boundary.
# Previously the front alone inserted a centre point across the crown edge;
# its curved position was 26 cm ahead of the loft's straight chord.
OUTLINE=resample(OUTLINE,.030)
YMIN=min(y for x,y in OUTLINE)
YMAX=max(y for x,y in OUTLINE)
FRONT_OFFSET=.004


@lru_cache(maxsize=32768)
def width(y):
    xs=[]
    for i,(x1,y1) in enumerate(OUTLINE):
        x2,y2=OUTLINE[(i+1)%len(OUTLINE)]
        if min(y1,y2)<=y<=max(y1,y2) and abs(y2-y1)>1e-9:
            xs.append(x1+(x2-x1)*(y-y1)/(y2-y1))
    return max([abs(x) for x in xs],default=.001)


def depth(x,y):
    # Section A-A: the crown is substantially behind the lower nose. The
    # old 0.42m straight rake was the principal cause of the flat bus shape.
    t=max(0,min(1,(y-.83)/(YMAX-.83)))
    rake=1.68*t*t + .12*t
    # The nose's horizontal bow must not collapse to a tiny radius at the
    # crown. Fade to a finite breadth above the destination panel, preserving
    # the windshield/lamp shape and avoiding the former sharp centre spike.
    crown=max(0,min(1,(y-3.48)/(YMAX-3.48)))
    crown=crown*crown*(3-2*crown)
    bow_width=width(y)*(1-crown)+1.05*crown
    q=min(.9999,abs(x)/max(.01,bow_width))
    roll=.26*(1-math.sqrt(1-q*q))
    return 10.04-rake-roll


def rear_width(y):
    return body_width(y)


def side_point(z,y,side,offset=0):
    return (side*(_side_width(z,y)+offset),y,z)


@lru_cache(maxsize=65536)
def _side_width(z,y):
    # Invert the actual loft, including its changing shoulder height. A
    # linear Z fraction is not its loft parameter and put windows under the
    # metal at the crown and above it at the lower edge.
    ratio=(3.69-3.10)/(YMAX-3.10)
    lo,hi=0.,1.
    for _ in range(28):
        t=(lo+hi)/2;blend=t*t*(3-2*t)
        fy=y if y<=3.10 else 3.10+(y-3.10)/((1-blend)*ratio+blend)
        fy=max(YMIN+.0001,min(YMAX-.0001,fy))
        ry=fy if fy<=3.10 else 3.10+(fy-3.10)*ratio
        end=depth(width(fy),fy)+FRONT_OFFSET
        if 7.35*(1-t)+end*t<z:lo=t
        else:hi=t
    return rear_width(ry)*(1-blend)+width(fy)*blend


def build_cab(collection,mats,center_z,direction,helpers):
    mesh=helpers['_mesh']; box=helpers['_box']; cyl=helpers['_cylinder']; beam=helpers['_beam']
    front_layers=[]
    def place(p):return (p[0],p[1],center_z+direction*(p[2]+CAB_SHIFT))
    def curved(p,offset):return place((p[0],p[1],depth(*p)+offset))

    def contains(p,polygon):
        x,y=p;inside=False
        for i,(a,b) in enumerate(polygon):
            c,d=polygon[(i+1)%len(polygon)]
            if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:inside=not inside
        return inside

    def panel(name,points,material,offset=0,subdiv=3):
        # Recorded outlines are resolved into the single front surface below.
        # The legacy offset/subdiv arguments do not create raised paint plates.
        front_layers.append((name,points,material))

    # Continuous shell between the body and the front drawing. There is no
    # box behind the nose and no planar end-cap poking through the glazing.
    verts=[];faces=[];n=len(OUTLINE)
    rear_section=body_section_for_cab(OUTLINE,width,YMAX)
    for k in range(25):
        t=k/24
        blend=t*t*(3-2*t)
        for (x,y),(rx,ry) in zip(OUTLINE,rear_section):
            px=rx*(1-blend)+x*blend;py=ry*(1-blend)+y*blend
            pz=7.35*(1-t)+(depth(x,y)+FRONT_OFFSET)*t
            verts.append(place((px,py,pz)))
    for k in range(24):
        for i in range(n):
            j=(i+1)%n;a=k*n+i;b=k*n+j
            faces.append((a,a+n,b+n,b) if direction>0 else (a,b,b+n,a+n))
    shell=mesh('CAF moulded curved cab shell',verts,faces,mats['silver'],collection,smooth=True)
    shell['construction']='moulded glass-fibre reinforced polyester; source manual section A-A'
    panel('CAF sculpted silver nose',OUTLINE,mats['silver'],0,subdiv=3)

    red=smooth([(-1.38,1.25),(-1.47,1.66),(-1.43,2.18),(-1.31,2.94),
                (-1.15,3.42),(-.94,3.59),(-.48,3.67),(0,3.69),
                (.48,3.67),(.94,3.59),(1.15,3.42),(1.31,2.94),
                (1.43,2.18),(1.47,1.66),(1.38,1.25),(.80,1.25),
                (.65,1.38),(-.65,1.38),(-.80,1.25)],3)
    panel('CAF red paint following moulded nose',red,mats['red'],.007)
    # The delivery flag continues round the shoulder onto the red front,
    # stopping at the black fascia. Both colours share the nose tessellation.
    for colour,low,high in (('blue',1.78,1.94),('yellow',1.94,2.10)):
        ys=[low+(high-low)*i/12 for i in range(13)]
        stripe=[(-width(y),y) for y in ys]+[(width(y),y) for y in reversed(ys)]
        panel('CAF '+colour+' front shoulder stripe',stripe,mats[colour])
    mask=smooth([(-1.13,1.51),(-1.30,1.62),(-1.30,2.05),(-1.18,2.96),
                 (-1.04,3.41),(-.78,3.54),(0,3.57),(.78,3.54),
                 (1.04,3.41),(1.18,2.96),(1.30,2.05),(1.30,1.62),
                 (1.13,1.51),(0,1.46)],3)
    panel('CAF bowed black nose fascia',mask,mats['black_soft'],.016)

    wind=fillet([(-1.075,1.96),(-1.115,2.08),(-1.035,3.11),
                 (1.035,3.11),(1.115,2.08),(1.075,1.96),(.40,1.84),(-.40,1.84)],.038)
    panel('CAF laminated windscreen ceramic border',wind,mats['frit'],.027)
    clear=fillet([(-1.067,2.055),(-.998,3.055),(.998,3.055),(1.067,2.055)],.035)
    panel('CAF windscreen clear central area',clear,mats['cab_glass'],.034)
    indicator=fillet([(-.96,3.155),(-.91,3.40),(-.72,3.48),(0,3.51),
                      (.72,3.48),(.91,3.40),(.96,3.155)],.085)
    panel('CAF separate rounded destination glazing',indicator,mats['frit'],.033)

    # Destination is mounted behind its own indicator glazing, above the
    # windshield, as shown in the manual exploded view.
    curve=bpy.data.curves.new('CAF destination amber matrix','FONT')
    curve.body='ALTAMIRA';curve.size=.16;curve.align_x='CENTER';curve.align_y='CENTER'
    curve.extrude=.001
    text=bpy.data.objects.new('CAF destination ALTAMIRA',curve);collection.objects.link(text)
    text.data.materials.append(mats['amber']);text.location=curved((0,3.32),.048)
    e=.0001;dy=(depth(0,3.32+e)-depth(0,3.32-e))/(2*e)
    normal=Vector((0,-dy,direction)).normalized()
    right=Vector((direction,0,0));up=normal.cross(right).normalized()
    text.rotation_mode='QUATERNION'
    text.rotation_quaternion=Matrix((right,up,normal)).transposed().to_quaternion()

    lamp=fillet([(-1.19,1.62),(-.66,1.54),(-.54,1.84),(-1.18,1.99)],.065)
    for s in (-1,1):
        points=lamp if s<0 else [(-x,y) for x,y in reversed(lamp)]
        panel('CAF recessed swept lamp cover',points,mats['black'],.030)
        cx=sum(x for x,y in points)/len(points);cy=sum(y for x,y in points)/len(points)
        lens=[(cx+(x-cx)*.94,cy+(y-cy)*.90) for x,y in points]
        panel('CAF lamp protective glazing',lens,mats['black_soft'],.037)
        for x,y,r,mat in ((s*.96,1.74,.100,mats['white']),(s*.78,1.72,.063,mats['tail'])):
            p=curved((x,y),.018)
            rim=cyl('CAF recessed optical bezel',p,r+.007,.010,mats['steel'],collection,vertices=48)
            optic=cyl('CAF inset lamp lens',(p[0],p[1],p[2]+direction*.010),r,.009,mat,collection,vertices=48)
            e=.0005
            normal=Vector((-(depth(x+e,y)-depth(x-e,y))/(2*e),-(depth(x,y+e)-depth(x,y-e))/(2*e),direction)).normalized()
            for part in (rim,optic):
                part.rotation_mode='QUATERNION';part.rotation_quaternion=Vector((0,0,1)).rotation_difference(normal)

    # A genuine opening through the lower nose, including the underside of
    # the loft. Keeping a black front polygon here concealed the drawgear.
    notch=fillet([(-.78,.74),(-.69,1.25),(-.54,1.34),
                  (.54,1.34),(.69,1.25),(.78,.74)],.080,10)
    panel('CAF coupler opening boundary',notch,mats['black'])
    from coupler_geometry import cut_recess, build_coupler
    cut_recess(shell,notch,place)
    # Return surfaces stay behind the cut edge. The bottom is left open.
    edge=resample(notch,.035);vs=[];fs=[]
    for i,(x,y) in enumerate(edge):
        vs.extend((curved((x,y),.001),place((x,y,9.36))))
    for i,(x,y) in enumerate(edge):
        j=(i+1)%len(edge)
        if min(y,edge[j][1])<.835:continue
        face=(2*i,2*j,2*j+1,2*i+1)
        fs.append(face if direction>0 else tuple(reversed(face)))
    lining=mesh('CAF coupler recess inner returns',vs,fs,mats['coupler_cast'],collection)
    # Thin manufactured returns are two-sided on their physical mesh.
    solid=lining.modifiers.new('recess wall thickness','SOLIDIFY');solid.thickness=.012
    box('CAF recessed drawgear bulkhead',place((0,1.075,9.34)),(1.18,.47,.045),mats['coupler_cast'],collection,.008)
    build_coupler(collection,mats,place,direction,helpers)

    # The wiper follows the glazing slope instead of hovering on a plane.
    wiper=[(.23,1.98),(-.62,2.40),(-.96,3.01)]
    for i,(a,b) in enumerate(zip(wiper,wiper[1:])):
        beam('CAF windshield wiper arm' if i==0 else 'CAF wiper rubber blade',curved(a,.080),curved(b,.080),.017 if i==0 else .014,mats['black'],collection,vertices=16)
    cyl('CAF wiper spindle',curved(wiper[0],.09),.035,.025,mats['steel'],collection,vertices=24)

    # Side door and small opening light lie on the curved shell. Parametric
    # coordinates are physical longitudinal positions, not a stretched decal.
    door=CAB_DOOR;glass=CAB_WINDOW;innerglass=CAB_CLEAR
    # Replace the entire access-door area. The door, frame and glass will
    # share one tessellation, with no stacked opaque panels behind the pane.
    cv=[];cf=[];n=len(door)
    for x in (-2.,2.):
        cv.extend(place((x,y,z)) for z,y in door)
    cf.extend((tuple(range(n)),tuple(reversed(range(n,2*n)))))
    cf.extend((i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n))
    cutter=mesh('Temporary cab access door apertures',cv,cf,mats['black'],collection)
    bm=bmesh.new();bm.from_mesh(cutter.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(cutter.data);bm.free()
    modifier=shell.modifiers.new('Real cab access door openings','BOOLEAN')
    modifier.operation='DIFFERENCE';modifier.solver='EXACT';modifier.object=cutter
    bpy.context.view_layer.objects.active=shell;bpy.ops.object.modifier_apply(modifier=modifier.name)
    bm=bmesh.new();bm.from_mesh(shell.data)
    caps=[f for f in bm.faces if min(v.co.x for v in f.verts)<-.2 and max(v.co.x for v in f.verts)>.2
          and min(v.co.y for v in f.verts)>1.09 and max(v.co.y for v in f.verts)<3.29]
    bmesh.ops.delete(bm,geom=caps,context='FACES');bm.to_mesh(shell.data);bm.free()
    bpy.data.objects.remove(cutter,do_unlink=True)
    # Use the same analytic surface normals on the shell and its inserts.
    # At the body joint this becomes the body-section normal exactly.
    normals=[]
    for vertex in shell.data.vertices:
        x,y,world_z=vertex.co
        z=(world_z-center_z)*direction-CAB_SHIFT
        if abs(x)>.8 and .86<y<3.40:
            e=.0001
            dz=(_side_width(z+e,y)-_side_width(z-e,y))/(2*e)
            dy=(_side_width(z,y+e)-_side_width(z,y-e))/(2*e)
            normals.append(tuple(Vector((math.copysign(1,x),-dy,-direction*dz)).normalized()))
        else:normals.append(tuple(vertex.normal))
    shell.data.normals_split_custom_set_from_vertices(normals)

    def side_surface(name,layers,s):
        """One flush surface for every material in a cab access door."""
        coords=[];edges=[]
        for polygon,_ in layers:
            polygon=resample(polygon)
            start=len(coords);coords.extend(Vector(p) for p in polygon)
            edges.extend((start+i,start+(i+1)%len(polygon)) for i in range(len(polygon)))
        for j in range(1,88):
            for i in range(1,37):coords.append(Vector((7.50+.89*i/37,1.10+2.18*j/88)))
        coords,_,tris,*_=delaunay_2d_cdt(coords,edges,[],0,1e-7,False)
        faces=[];slots=[]
        for tri in tris:
            mid=sum((coords[i] for i in tri),Vector((0,0)))/len(tri)
            if not contains(mid,door):continue
            slot=0
            for index,(polygon,_) in enumerate(layers):
                if contains(mid,polygon):slot=index
            a,b,c=(coords[i] for i in tri[:3]);area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
            faces.append(tuple(reversed(tri)) if area*s*direction>0 else tuple(tri));slots.append(slot)
        obj=mesh(name,[place(side_point(p.x,p.y,s,.0015)) for p in coords],faces,layers[0][1],collection,True)
        for _,material in layers[1:]:obj.data.materials.append(material)
        for face,slot in zip(obj.data.polygons,slots):face.material_index=slot
        normals=[]
        for z,y in coords:
            e=.0001
            dz=(_side_width(z+e,y)-_side_width(z-e,y))/(2*e)
            dy=(_side_width(z,y+e)-_side_width(z,y-e))/(2*e)
            normals.append(tuple(Vector((s,-dy,-direction*dz)).normalized()))
        obj.data.normals_split_custom_set_from_vertices(normals)
        obj['reference']='161-311-05-601 Fig.2-3; 161-200-05-603 Fig.4-1'
        return obj

    for s in (-1,1):
        side_surface('CAF flush cab access door and opening light',[
            (door,mats['black_soft']),
            (inset(door,.005),mats['silver']),
            (glass,mats['steel_light']),
            (inset(glass,.003),mats['frit']),
            (innerglass,mats['cab_glass']),
            ([(7.63,2.568),(8.23,2.568),(8.23,2.579),(7.63,2.579)],mats['steel_light']),
        ],s)
        # Attach the small catches to the local curved window plane.
        def fitting(name,z,y,dims,material):
            e=.0001
            dy=(_side_width(z,y+e)-_side_width(z,y-e))/(2*e)
            dz=(_side_width(z+e,y)-_side_width(z-e,y))/(2*e)
            normal=Vector((s,-dy,-direction*dz)).normalized()
            up=Vector((s*dy,1,0)).normalized();along=normal.cross(up).normalized()
            part=box(name,Vector(place(side_point(z,y,s,.002)))+normal*(dims[0]/2),dims,material,collection,.004)
            part.rotation_mode='QUATERNION';part.rotation_quaternion=Matrix((normal,up,along)).transposed().to_quaternion()
        for z,y in ((7.93,2.72),(7.83,3.145)):
            fitting('CAF opening light catch',z,y,(.014,.026,.062),mats['steel'])
        fitting('CAF cab door recessed latch',7.64,1.94,(.012,.095,.048),mats['black_soft'])

        # Venezuelan delivery flag, traced against manual photograph Fig.2-2.
        # The crest is ahead of the window, not painted over its lower pane.
        # Keep the trough inside the lower sill as in the delivery photograph.
        anchors=((7.47,1.27),(7.73,1.12),(8.12,1.47),(8.50,2.26),(8.91,1.97),(9.12,1.86))
        slopes=[(b[1]-a[1])/(b[0]-a[0]) for a,b in zip(anchors,anchors[1:])]
        tangents=[slopes[0]]+[0 if a*b<=0 else 2*a*b/(a+b) for a,b in zip(slopes,slopes[1:])]+[0]
        def flagheight(z):
            for index,((a,ya),(b,yb)) in enumerate(zip(anchors,anchors[1:])):
                if z<=b:
                    t=max(0,min(1,(z-a)/(b-a)));h=b-a
                    return (2*t**3-3*t*t+1)*ya+(t**3-2*t*t+t)*h*tangents[index]+(-2*t**3+3*t*t)*yb+(t**3-t*t)*h*tangents[index+1]
            return anchors[-1][1]
        for colour,shift in (('yellow',.16),('blue',0),('red',-.16)):
            vs=[];fs=[]
            for i in range(121):
                z=7.47+(9.62-7.47)*i/120
                for j in range(5):
                    y=flagheight(z)+shift-.08+.16*j/4
                    # Meet the front stripe at the actual curved edge. A
                    # constant end Z left a silver wedge through the flag.
                    zz=z if z<=9.12 else 9.12+(z-9.12)/.50*(depth(width(y),y)-9.12+.004)
                    vs.append(place(side_point(zz,y,s,.0035)))
            for i in range(120):
                for j in range(4):
                    a=5*i+j;face=(a,a+1,a+6,a+5)
                    fs.append(face if s*direction>0 else tuple(reversed(face)))
            flag=mesh('CAF '+colour+' curved flag sweep',vs,fs,mats[colour],collection,smooth=True)
            normals=[]
            for x,y,wz in vs:
                z=(wz-center_z)*direction-CAB_SHIFT;e=.0001
                dz=(_side_width(z+e,y)-_side_width(z-e,y))/(2*e)
                dy=(_side_width(z,y+e)-_side_width(z,y-e))/(2*e)
                normals.append(tuple(Vector((s,-dy,-direction*dz)).normalized()))
            flag.data.normals_split_custom_set_from_vertices(normals)
        for i in range(8):
            z=8.23+i*.085;y=flagheight(z);vs=[]
            for j in range(10):
                a=math.pi/2+j*math.pi/5;r=.028 if j%2==0 else .012
                vs.append(place(side_point(z+r*math.cos(a),y+r*math.sin(a),s,.005)))
            mesh('CAF flag five-point star',vs,[tuple(range(10))],mats['white_paint'],collection)
    # All front materials share one constrained triangulation. This creates
    # flush glazing/paint borders and makes intersecting stacked panels
    # impossible, including around the curved lower silver cheeks.
    vertices2=[];edges=[]
    for _,polygon,_ in front_layers:
        polygon=resample(polygon,.035)
        start=len(vertices2)
        vertices2.extend(Vector((x,y)) for x,y in polygon)
        edges.extend((start+i,start+(i+1)%len(polygon)) for i in range(len(polygon)))
    for j in range(1,75):
        y=YMIN+(YMAX-YMIN)*j/75
        w=width(y)
        for i in range(1,75):
            vertices2.append(Vector((-w+2*w*i/75,y)))
    coords,_,triangles,*_=delaunay_2d_cdt(vertices2,edges,[],0,1e-7,False)
    faces=[];assign=[]
    for face in triangles:
        xy=(sum(coords[i].x for i in face)/len(face),sum(coords[i].y for i in face)/len(face))
        if not contains(xy,OUTLINE) or contains(xy,notch):continue
        material=0
        for index,(_,polygon,_) in enumerate(front_layers):
            if contains(xy,polygon):material=index
        a,b,c=(coords[i] for i in face[:3]);area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
        faces.append(tuple(reversed(face)) if area*direction<0 else face);assign.append(material)
    front=mesh('CAF continuous flush nose surface',[curved((p.x,p.y),FRONT_OFFSET) for p in coords],faces,front_layers[0][2],collection,smooth=True)
    for _,_,mat in front_layers[1:]:front.data.materials.append(mat)
    for p,slot in zip(front.data.polygons,assign):p.material_index=slot
    normals=[]
    for p in coords:
        e=.0005;x=p.x;y=p.y
        normals.append(tuple(Vector((-(depth(x+e,y)-depth(x-e,y))/(2*e),-(depth(x,y+e)-depth(x,y-e))/(2*e),direction)).normalized()))
    front.data.normals_split_custom_set_from_vertices(normals)
    front['reference']='161-200-05-603 Fig.4-1 front and section A-A; 161-311-05-601 windshield'
    return shell
