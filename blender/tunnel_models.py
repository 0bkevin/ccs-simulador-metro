"""Short playable railway using Perri's Caracas standard ribbed tunnel rings.

5.16 m clear diameter, .22 m lining, .80 m rings: Perri 2004 pp.15–16.
Rail height, cross passages, hardware and all longitudinal alignments are
modelling assumptions. A double-track box throat separates the circular bores
from the 4 m track spacing at side-platform stations: bores never intersect.
"""
import math
from station_models import _box, _beam, _geometry, _collection, _track
from station_config import SPEC, STATIONS, TUNNEL
from station_lighting import fixture_light

R = TUNNEL['innerDiameter']/2
OUTER = R + TUNNEL['liningThickness']
CY = TUNNEL['centerY']


def tube_patch(c, name, cx, z0, z1, r0, r1, a0=0, a1=math.tau, steps=32, material='concrete'):
    """Closed annular sector, with inward-facing bore and outward-facing back."""
    vertices=[]; faces=[]
    for i in range(steps+1):
        a=a0+(a1-a0)*i/steps
        for z,r in ((z0,r0),(z1,r0),(z0,r1),(z1,r1)):
            vertices.append((cx+r*math.cos(a),CY+r*math.sin(a),z))
    for i in range(steps):
        q=i*4; n=q+4
        faces.extend([(q,n,n+1,q+1), (q,q+2,n+2,n),(q+1,n+1,n+3,q+3)])
        # Internal rib backs touch the continuous lining and cannot be seen.
        if r1 >= OUTER:faces.append((q+2,q+3,n+3,n+2))
    faces.extend([(0,1,3,2),(steps*4,steps*4+2,steps*4+3,steps*4+1)])
    _geometry(c,material,name,vertices,[tuple(reversed(face)) for face in faces])


def bore(c, cx, a, b):
    # A recessed backing skin plus structural ribs makes the box pockets visible
    # in Perri's photograph. The ribs define the quoted clear bore diameter.
    tube_patch(c,'Tunnel continuous lining backing',cx,a,b,R+.14,OUTER)
    pitch=TUNNEL['ringLength']
    count=math.ceil((b-a)/pitch)
    for i in range(count+1):
        z=min(b-.065,a+i*pitch)
        tube_patch(c,'Precast circumferential ring ribs 800 mm',cx,z,z+.065,R,R+.14)
    # Six ordinary segments and a smaller crown key, each with recessed panels.
    key=math.radians(12); ordinary=(math.tau-key)/6
    boundaries=[math.pi/2-key/2,math.pi/2+key/2]
    boundaries += [boundaries[-1]+ordinary*i for i in range(1,6)]
    for j,a0 in enumerate(boundaries):
        a1=boundaries[(j+1)%7] if j<6 else boundaries[0]+math.tau
        cells=1 if j==0 else 6
        for k in range(cells):
            angle=a0+(a1-a0)*k/cells
            tube_patch(c,'Longitudinal webs of precast segments',cx,a,b,R,R+.14,angle-.014,angle+.014,1)
        # Segment seams are deeper than the shallow panel divisions.
        tube_patch(c,'Seven segment joints including crown key',cx,a,b,R-.001,R+.01,a0-.004,a0+.004,1,'grout')
    _track(c,cx,a,b)
    _box(c,'concrete','Tunnel invert slab',(cx,-.41,(a+b)/2),(3.5,.35,b-a))
    # Service ledge and cables remain outside the rolling-stock envelope.
    _box(c,'concrete','Service cable bench',(cx-2.05,.12,(a+b)/2),(.47,.63,b-a))
    _box(c,'black','Longitudinal drainage channel',(cx-1.71,-.18,(a+b)/2),(.18,.09,b-a))
    for y in (.68,.82,.96):
        _beam(c,'black','Wall service cable',(cx-2.28,y,a),(cx-2.28,y,b),.028,6)
    for i in range(math.ceil((b-a)/3)):
        z=min(b-.1,a+1.5+i*3)
        _box(c,'steel','Cable rack brackets',(cx-2.34,.81,z),(.16,.46,.05))
    for i in range(math.ceil((b-a)/12)):
        z=min(b-.8,a+6+i*12)
        _box(c,'steel','Tunnel bulkhead luminaire',(cx-2.36,2.38,z),(.16,.20,.90))
        _box(c,'utility_light','Tunnel light diffuser',(cx-2.267,2.38,z),(.025,.12,.74))
        for dz in (-.40,.40):
            _box(c,'steel','Bulkhead diffuser retaining clips',(cx-2.245,2.38,z+dz),(.027,.19,.028))
        fixture_light(c,'tunnel bulkhead',(cx-2.245,2.38,z),.74,.12,38,'utility',(1,0,0))


def transition_track(c, x0, x1, a, b):
    def point(t):
        return x0+(x1-x0)*(t*t*(3-2*t)),a+(b-a)*t
    n=max(2,math.ceil((b-a)/1.5))
    for i in range(n):
        x,z=point(i/n);xx,zz=point((i+1)/n)
        for off in (-.7175,.7175):
            _beam(c,'rail','Continuous return-track throat rails',(x+off,.125,z),(xx+off,.125,zz),.035,8)
        _beam(c,'steel','Return-track conductor through throat',(x+1.29,.28,z),(xx+1.29,.28,zz),.065,6)
    for i in range(math.ceil((b-a)/.67)):
        t=min(1,(i*.67+.33)/(b-a));x,z=point(t)
        _box(c,'concrete','Throat sleepers',(x,-.005,z),(2.5,.16,.22))


def throat(c, x0, x1, a, b, covered=True, arched=False):
    _track(c,0,a,b)
    transition_track(c,x0,x1,a,b)
    # Piecewise plan follows the return track; main line remains continuous.
    n=max(1,math.ceil((b-a)/3))
    for i in range(n):
        t=(i+.5)/n; x=x0+(x1-x0)*t*t*(3-2*t);z=a+(b-a)*t;length=(b-a)/n+.015
        _box(c,'ballast','Throat track formation',(x/2,-.23,z),(x+5.8,.46,length))
        for wallx in (-3.1,x+3.1):
            _box(c,'concrete','Throat retaining wall',(wallx,2.25 if covered else 1.0,z),(.4,5.3 if covered else 2.8,length))
        if covered and not arched:_box(c,'concrete','Cut-and-cover throat roof',(x/2,4.85,z),(x+6.6,.4,length))
        if arched:
            # Perri p.22 distinguishes the Metro's broad double-track arch
            # from the smaller old road tunnel beside it. Only the Metro mouth
            # is represented here; the approach profile remains estimated.
            vertices=[];faces=[]
            for j in range(33):
                t=math.pi*j/32
                for zz,extra in ((z-length/2,0),(z+length/2,0),(z-length/2,.35),(z+length/2,.35)):
                    vertices.append((x/2+(x/2+3.1+extra)*math.cos(t),1.0+(4.4+extra)*math.sin(t),zz))
            for j in range(32):
                q=j*4;nn=q+4
                faces.extend([(q,q+1,nn+1,nn),(q+2,nn+2,nn+3,q+3),(q,nn,nn+2,q+2),(q+1,q+3,nn+3,nn+1)])
            _geometry(c,'concrete','Caño Amarillo double-track arched approach',vertices,faces)
    if covered:
        for i in range(math.ceil((b-a)/10)):
            z=min(b-.5,a+5+i*10)
            _box(c,'steel','Throat luminaire housing',(-2.6,3.89,z),(.21,.08,1.19))
            _box(c,'utility_light','Throat fluorescent strip',(-2.6,3.8,z),(.15,.14,1.1))
            fixture_light(c,'throat fluorescent',(-2.6,3.72,z),.15,1.1,48,'utility')


def portal(c, cx, z):
    # Square-to-circle bulkhead, with a real hole for the train.
    vertices=[];faces=[]
    for i in range(65):
        a=math.tau*i/64;cs,sn=math.cos(a),math.sin(a)
        scale=min(3.05/max(abs(cs),.00001),3.05/max(abs(sn),.00001))
        vertices.extend([(cx+R*cs,CY+R*sn,z),(cx+scale*cs,CY+scale*sn,z)])
    for i in range(64):
        q=i*2;faces.extend([(q,q+2,q+3,q+1),(q+1,q+3,q+2,q)])
    _geometry(c,'concrete','Concrete portal with open circular bore',vertices,faces)
    tube_patch(c,'Portal circular reveal',cx,z-.22,z+.22,R,OUTER+.10)


def build_route(parent, stops):
    c=_collection('Linea 1 route',parent)
    first,last=list(stops.values())[0],list(stops.values())[-1]
    throat(c,4,4,SPEC['route']['start'],first-145,False)
    for i,(left,right) in enumerate(zip(STATIONS,STATIONS[1:])):
        a,b=stops[left['name']]+5,stops[right['name']]-145
        coll=_collection('Tunnel '+left['id'],parent)
        coll['referenceBasis']='Perri 2004 pp.15–17, standard bore; shortened alignment and fittings estimated'
        coll['inner_diameter_m']=2*R;coll['lining_thickness_m']=OUTER-R
        coll['start_z']=a;coll['end_z']=b
        x0,x1=left['railCenters'][1],right['railCenters'][1]
        spacing=max(TUNNEL['minimumBoreSpacing'],x0,x1)
        # First station emerges beside El Calvario. Keep an open-air approach
        # before the portal; do not attach a tunnel to its yellow canopy.
        open_length=45 if i==0 else 0
        if open_length:throat(coll,x0,x0,a,a+open_length,False)
        ta,tb=a+open_length+55,b-55
        throat(coll,x0,spacing,a+open_length,ta,arched=i==0)
        throat(coll,spacing,x1,tb,b)
        for cx in (0,spacing):
            bore(coll,cx,ta,tb)
            portal(coll,cx,ta);portal(coll,cx,tb)
        if spacing>6.1:
            for z in (ta,tb):_box(coll,'concrete','Twin bore portal central pier',(spacing/2,CY,z),(spacing-6.1,6.1,.3))
    tail=_collection('Tunnel altamira',parent)
    for cx in (0,10):
        bore(tail,cx,last+5,SPEC['route']['end'])
        portal(tail,cx,last+5)
    tail['start_z']=last+5;tail['end_z']=SPEC['route']['end']
