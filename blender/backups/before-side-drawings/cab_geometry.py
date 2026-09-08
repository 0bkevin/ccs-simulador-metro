"""CAF Caracas moulded cab, traced from maintenance manual 161-200-05-603.

Figure 4-1 front elevation and section A-A anchor the silhouette and rake.
This is a photograph/diagram reconstruction, not manufacturer CAD. Metres;
Y vertical, Z longitudinal. The glazing and paint follow the same surface.
"""
import math
from functools import lru_cache
import bpy
from mathutils import Vector, Matrix
from mathutils.geometry import tessellate_polygon, delaunay_2d_cdt


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


# Unlike a rounded rectangle, the front bows out below the window and has
# a continuous crown. These control points follow the manual's VISTA X.
OUTLINE=smooth([(-1.27,.83),(-1.42,1.00),(-1.49,1.53),(-1.49,1.99),
                (-1.36,2.87),(-1.20,3.40),(-.96,3.65),(-.53,3.77),
                (0,3.80),(.53,3.77),(.96,3.65),(1.20,3.40),
                (1.36,2.87),(1.49,1.99),(1.49,1.53),(1.42,1.00),
                (1.27,.83),(.82,.83),(-.82,.83)],3)
YMIN=min(y for x,y in OUTLINE)
YMAX=max(y for x,y in OUTLINE)


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
    q=min(.9999,abs(x)/max(.01,width(y)))
    roll=.26*(1-math.sqrt(1-q*q))
    return 10.04-rake-roll


def rear_width(y):
    r=.29
    if .84+r<=y<=3.68-r:return 1.50
    cy=.84+r if y<2 else 3.68-r
    return 1.50-r+math.sqrt(max(0,r*r-(y-cy)**2))


def side_point(z,y,side,offset=0):
    fy=max(YMIN+.0001,min(YMAX-.0001,y))
    fw=width(fy)
    end=depth(fw,fy)
    t=max(0,min(1,(z-7.35)/max(.1,end-7.35)))
    return (side*((1-t)*rear_width(y)+t*fw+offset),y,z)


def build_cab(collection,mats,center_z,direction,helpers):
    mesh=helpers['_mesh']; box=helpers['_box']; cyl=helpers['_cylinder']; beam=helpers['_beam']
    front_layers=[]
    def place(p):return (p[0],p[1],center_z+direction*p[2])
    def curved(p,offset):return place((p[0],p[1],depth(*p)+offset))

    def panel(name,points,material,offset=.012,mapper=None,subdiv=3):
        """Subdivide in the drawing plane before mapping into 3D.

        Ear-clipped concave boundaries and shared midpoint subdivisions avoid
        fan folds, while all layers use exactly the same depth function.
        """
        if mapper is None:
            front_layers.append((name,points,material))
            return None
        coords=[Vector((x,y,0)) for x,y in points]
        tris=tessellate_polygon([coords])
        triangles=[tuple((coords[v].x,coords[v].y) if isinstance(v,int) else (v.x,v.y) for v in tri) for tri in tris]
        for _ in range(subdiv):
            refined=[]
            for a,b,c in triangles:
                ab=((a[0]+b[0])/2,(a[1]+b[1])/2)
                bc=((b[0]+c[0])/2,(b[1]+c[1])/2)
                ca=((c[0]+a[0])/2,(c[1]+a[1])/2)
                refined.extend(((a,ab,ca),(ab,b,bc),(ca,bc,c),(ab,bc,ca)))
            triangles=refined
        vertices=[];faces=[];lookup={}
        for tri in triangles:
            face=[]
            for p in tri:
                key=(round(p[0],7),round(p[1],7))
                if key not in lookup:
                    lookup[key]=len(vertices)
                    vertices.append(mapper(p) if mapper else curved(p,offset))
                face.append(lookup[key])
            area=(tri[1][0]-tri[0][0])*(tri[2][1]-tri[0][1])-(tri[1][1]-tri[0][1])*(tri[2][0]-tri[0][0])
            if mapper is None and area*direction<0:face.reverse()
            faces.append(tuple(face))
        obj=mesh(name,vertices,faces,material,collection,smooth=True)
        if mapper is None:
            # Analytic normals make reflections continuous across every
            # tessellated patch, including vertices on separate boundaries.
            norms=[]
            for x,y,z in vertices:
                e=.0005
                dx=(depth(x+e,y)-depth(x-e,y))/(2*e)
                dy=(depth(x,y+e)-depth(x,y-e))/(2*e)
                norms.append(tuple(Vector((-dx,-dy,direction)).normalized()))
            obj.data.normals_split_custom_set_from_vertices(norms)
        obj['reference']='161-200-05-603 Fig.4-1; 161-311-05-601'
        return obj

    # Continuous shell between the body and the front drawing. There is no
    # box behind the nose and no planar end-cap poking through the glazing.
    verts=[];faces=[];n=len(OUTLINE)
    for k in range(25):
        t=k/24
        for x,y in OUTLINE:
            ry=.84+(y-YMIN)*(3.68-.84)/(YMAX-YMIN)
            rx=x/max(.001,width(y))*rear_width(ry)
            px=rx*(1-t)+x*t;py=ry*(1-t)+y*t
            pz=7.35*(1-t)+depth(x,y)*t
            verts.append(place((px,py,pz)))
    for k in range(24):
        for i in range(n):
            j=(i+1)%n;a=k*n+i;b=k*n+j
            faces.append((a,a+n,b+n,b) if direction>0 else (a,b,b+n,a+n))
    shell=mesh('CAF moulded curved cab shell',verts,faces,mats['silver_light'],collection,smooth=True)
    shell['construction']='moulded glass-fibre reinforced polyester; source manual section A-A'
    panel('CAF sculpted silver nose',OUTLINE,mats['silver_light'],0,subdiv=3)

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

    wind=fillet([(-1.075,1.96),(-1.15,2.08),(-1.055,3.11),
                 (1.055,3.11),(1.15,2.08),(1.075,1.96),(0,1.84)],.055)
    panel('CAF laminated curved windscreen gasket',wind,mats['black'],.027)
    clear=fillet([(-1.082,2.035),(-1.005,3.055),(1.005,3.055),(1.082,2.035)],.055)
    panel('CAF windscreen clear central area',clear,mats['glass'],.034)
    indicator=fillet([(-.96,3.155),(-.91,3.40),(-.72,3.48),(0,3.51),
                      (.72,3.48),(.91,3.40),(.96,3.155)],.085)
    panel('CAF separate rounded destination glazing',indicator,mats['glass'],.033)

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

    # Broad black notch and the protective rack above the low coupling head.
    notch=smooth([(-.77,.80),(-.69,1.27),(-.54,1.34),(.54,1.34),(.69,1.27),(.77,.80)],2)
    panel('CAF deep central coupler aperture',notch,mats['black'],.039)
    box('CAF coupler protective rack',place((0,1.18,9.99)),(1.22,.11,.15),mats['black'],collection,.025)
    for y in (1.145,1.205):
        box('CAF rack horizontal rib',place((0,y,10.075)),(1.20,.016,.022),mats['steel'],collection,.006)
    cyl('CAF coupler longitudinal drawbar',place((0,.77,10.06)),.10,.62,mats['steel'],collection,vertices=32)
    box('CAF machined coupling face',place((0,.76,10.26)),(.52,.40,.048),mats['copper'],collection,.080)
    for x,r in ((-.135,.112),(.145,.126)):
        cyl('CAF coupling socket',place((x,.79,10.288)),r,.010,mats['black'],collection,vertices=48)
    cyl('CAF male coupling spigot',place((-.135,.79,10.31)),.072,.06,mats['steel'],collection,vertices=32)
    for x,y in ((0,.96),(0,.57),(-.21,.59),(.21,.98)):
        cyl('CAF coupling face fastener',place((x,y,10.294)),.015,.009,mats['steel_light'],collection,vertices=12)
    for a,b in (((.02,.55,10.30),(.17,.43,10.40)),((.17,.43,10.40),(.32,.39,10.37))):
        beam('CAF red pneumatic hose',place(a),place(b),.025,mats['red'],collection,vertices=16)
    for a,b in (((-.28,.74,10.17),(-.42,.61,10.19)),((-.42,.61,10.19),(-.39,.42,10.29))):
        beam('CAF flexible coupling hose',place(a),place(b),.026,mats['black'],collection,vertices=16)

    # The wiper follows the glazing slope instead of hovering on a plane.
    wiper=[(.23,1.98),(-.62,2.40),(-.96,3.01)]
    for i,(a,b) in enumerate(zip(wiper,wiper[1:])):
        beam('CAF windshield wiper arm' if i==0 else 'CAF wiper rubber blade',curved(a,.080),curved(b,.080),.017 if i==0 else .014,mats['black'],collection,vertices=16)
    cyl('CAF wiper spindle',curved(wiper[0],.09),.035,.025,mats['steel'],collection,vertices=24)

    # Side door and small opening light lie on the curved shell. Parametric
    # coordinates are physical longitudinal positions, not a stretched decal.
    door=smooth([(7.48,1.08),(8.29,1.08),(8.44,1.18),(8.44,2.43),
                 (8.24,3.18),(8.04,3.29),(7.51,3.25)],3)
    glass=fillet([(7.60,2.07),(8.24,2.07),(8.24,2.80),(8.03,3.18),
                  (7.60,3.18)],.095)
    for s in (-1,1):
        mapper=lambda p,s=s:place(side_point(p[0],p[1],s,.009))
        panel('CAF cab side access door seal',door,mats['black'],mapper=mapper,subdiv=2)
        inner=[((z-7.95)*.94+7.95,(y-2.15)*.98+2.15) for z,y in door]
        panel('CAF cab side access door',inner,mats['silver_light'],mapper=lambda p,s=s:place(side_point(p[0],p[1],s,.017)),subdiv=2)
        panel('CAF cab opening light gasket',glass,mats['black'],mapper=lambda p,s=s:place(side_point(p[0],p[1],s,.025)),subdiv=2)
        innerglass=[((z-7.94)*.83+7.94,(y-2.70)*.93+2.70) for z,y in glass]
        panel('CAF cab opening light',innerglass,mats['glass'],mapper=lambda p,s=s:place(side_point(p[0],p[1],s,.031)),subdiv=2)
        # Fixed lower pane and opening upper pane, manual Fig.2-3.
        panel('CAF opening light horizontal divider',[(7.64,2.565),(8.195,2.565),(8.195,2.584),(7.64,2.584)],mats['steel'],mapper=lambda p,s=s:place(side_point(p[0],p[1],s,.035)),subdiv=2)
        for z,y in ((7.91,2.69),(7.91,3.115)):
            box('CAF opening light latch',place(side_point(z,y,s,.046)),(.024,.030,.073),mats['steel'],collection,.009)
        handle=place(side_point(7.65,1.96,s,.037))
        box('CAF cab door recessed latch',handle,(.028,.12,.06),mats['black_soft'],collection,.017)

        # Venezuelan delivery flag, traced against manual photograph Fig.2-2.
        anchors=((7.47,1.26),(7.75,1.05),(8.22,2.15),(8.46,2.30),(8.91,1.97),(9.46,1.86))
        def flagheight(z):
            for (a,ya),(b,yb) in zip(anchors,anchors[1:]):
                if z<=b:
                    t=max(0,min(1,(z-a)/(b-a)));t=t*t*(3-2*t)
                    return ya+(yb-ya)*t
            return anchors[-1][1]
        for colour,shift in (('yellow',.16),('blue',0),('red',-.16)):
            vs=[];fs=[]
            for i in range(81):
                z=7.47+(9.46-7.47)*i/80
                for y in (flagheight(z)+shift-.08,flagheight(z)+shift+.08):
                    vs.append(place(side_point(z,y,s,.040)))
            for i in range(80):fs.append((2*i,2*i+1,2*i+3,2*i+2))
            mesh('CAF '+colour+' curved flag sweep',vs,fs,mats[colour],collection,smooth=True)
        for i in range(8):
            z=8.14+i*.09;y=flagheight(z);vs=[]
            for j in range(10):
                a=math.pi/2+j*math.pi/5;r=.028 if j%2==0 else .012
                vs.append(place(side_point(z+r*math.cos(a),y+r*math.sin(a),s,.050)))
            mesh('CAF flag five-point star',vs,[tuple(range(10))],mats['silver_light'],collection)
    # All front materials share one constrained triangulation. This creates
    # flush glazing/paint borders and makes intersecting stacked panels
    # impossible, including around the curved lower silver cheeks.
    vertices2=[];edges=[]
    for _,polygon,_ in front_layers:
        start=len(vertices2)
        vertices2.extend(Vector((x,y)) for x,y in polygon)
        edges.extend((start+i,start+(i+1)%len(polygon)) for i in range(len(polygon)))
    for j in range(1,75):
        y=YMIN+(YMAX-YMIN)*j/75
        w=width(y)
        for i in range(1,75):
            vertices2.append(Vector((-w+2*w*i/75,y)))
    coords,_,triangles,*_=delaunay_2d_cdt(vertices2,edges,[],0,1e-7,False)
    def contains(p,polygon):
        x,y=p;inside=False
        for i,(a,b) in enumerate(polygon):
            c,d=polygon[(i+1)%len(polygon)]
            if (b>y)!=(d>y) and x<(c-a)*(y-b)/(d-b)+a:inside=not inside
        return inside
    faces=[];assign=[]
    for face in triangles:
        xy=(sum(coords[i].x for i in face)/len(face),sum(coords[i].y for i in face)/len(face))
        if not contains(xy,OUTLINE):continue
        material=0
        for index,(_,polygon,_) in enumerate(front_layers):
            if contains(xy,polygon):material=index
        a,b,c=(coords[i] for i in face[:3]);area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
        faces.append(tuple(reversed(face)) if area*direction<0 else face);assign.append(material)
    front=mesh('CAF continuous flush nose surface',[curved((p.x,p.y),.004) for p in coords],faces,front_layers[0][2],collection,smooth=True)
    for _,_,mat in front_layers[1:]:front.data.materials.append(mat)
    for p,slot in zip(front.data.polygons,assign):p.material_index=slot
    normals=[]
    for p in coords:
        e=.0005;x=p.x;y=p.y
        normals.append(tuple(Vector((-(depth(x+e,y)-depth(x-e,y))/(2*e),-(depth(x,y+e)-depth(x,y-e))/(2*e),direction)).normalized()))
    front.data.normals_split_custom_set_from_vertices(normals)
    front['reference']='161-200-05-603 Fig.4-1 front and section A-A; 161-311-05-601 windshield'
    return shell
