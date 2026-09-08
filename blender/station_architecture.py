"""Native station-specific architecture, traced from the reference photographs.

Y is height, Z is the game route. A platform is 1.1 m above track datum.
The 2012 photographs establish visible materials and spatial relationships,
not surveyed dimensions. Inferred bay sizes stay explicit in this module.
No reference photo is embedded as a surface texture.
"""
import math
import bpy
from station_models import _box, _beam, _geometry, _text, _collection, M

FLOOR = 1.1
MEZZ = 5.1
STREET = 9.1


def slab(c, x0, x1, z0, z1, y=MEZZ, mat='granite', name='Concourse slab'):
    _box(c, mat, name, ((x0+x1)/2, y-.14, (z0+z1)/2), (x1-x0, .28, z1-z0))
    # Subtle joints: the photographs show a fine polished stone grid upstairs.
    for i in range(1, int(z1-z0)):
        _box(c, 'grout', 'Concourse stone joints', ((x0+x1)/2,y+.001,z0+i), (x1-x0,.002,.003))


def disc(c, mat, name, x, y, z, r, segments=24):
    vertices=[(x,y,z)]+[(x+r*math.cos(i*math.tau/segments),y+r*math.sin(i*math.tau/segments),z) for i in range(segments)]
    _geometry(c,mat,name,vertices,[(0,i+1,(i+1)%segments+1) for i in range(segments)])


def sphere(c,mat,name,x,y,z,r):
    vertices=[];faces=[];around=24;rows=12
    for j in range(rows+1):
        phi=math.pi*j/rows
        for i in range(around):
            theta=math.tau*i/around
            vertices.append((x+r*math.sin(phi)*math.cos(theta),y+r*math.cos(phi),z+r*math.sin(phi)*math.sin(theta)))
    for j in range(rows):
        for i in range(around):
            a=j*around+i;b=j*around+(i+1)%around
            faces.append((a,b,b+around,a+around))
    _geometry(c,mat,name,vertices,faces,True)


def arrow(c,x,y,z,color='orange',direction=0,r=.145):
    disc(c,color,'Circular wayfinding pictogram',x,y,z,r)
    # Upward arrow, rotated within the sign plane. No unsupported font glyphs.
    points=[(-.024,-.082),(.024,-.082),(.024,.015),(.068,.015),(0,.086),(-.068,.015),(-.024,.015)]
    cs,sn=math.cos(direction),math.sin(direction)
    vertices=[(x+a*cs-b*sn,y+a*sn+b*cs,z+.0015) for a,b in points]
    _geometry(c,'black','Wayfinding arrow',vertices,[(0,1,2,3,4,5,6)])


def fascia(c,label,x,y,z,width=3.0,size=.26,color='white',sub=None,arrows=False,background='black'):
    _box(c,background,'Modular enamel sign',(x,y,z),(width,.52,.085))
    for face in (-1,1):
        angle=0 if face==1 else math.pi
        _text(c,label,(x,y-(.065 if sub else 0),z+face*.046),size,color,angle)
        if sub: _text(c,sub,(x,y+.15,z+face*.047),.135,color,angle)
    if arrows:
        for dx in (-width*.39,width*.39):
            arrow(c,x+dx,y,z+.049,color)
            # Separate back-facing graphic, with its winding reversed.
            from station_models import _batches
            before={k:len(v[0]) for k,v in _batches.items()}
            arrow(c,x+dx,y,z+.049,color)
            for k,data in _batches.items():
                start=before.get(k,0)
                for i in range(start,len(data[0])):
                    xx,yy,zz=data[0][i];data[0][i]=(xx,yy,2*z-zz)
                for i,face in enumerate(data[1]):
                    if face and min(face)>=start:data[1][i]=tuple(reversed(face))
    for dx in (-width*.38,width*.38):
        _beam(c,'black','Enamel sign hanger',(x+dx,y+.26,z),(x+dx,4.43 if y<4.5 else 8.2,z),.010,6)


def guard(c,x0,z0,x1,z1,y=MEZZ,mat='steel',glass=False):
    length=math.hypot(x1-x0,z1-z0)
    count=max(1,math.ceil(length/1.5))
    for i in range(count+1):
        t=i/count; x=x0+(x1-x0)*t; z=z0+(z1-z0)*t
        _beam(c,mat,'Balustrade posts',(x,y,z),(x,y+1.05,z),.022,8)
    for dy in ((.17,1.05) if glass else (.48,1.05)):
        _beam(c,mat,'Continuous balustrade rails',(x0,y+dy,z0),(x1,y+dy,z1),.030,10)
    if glass:
        # Slightly tinted glazing, not a solid opaque wall.
        for i in range(count):
            t0=(i+.03)/count;t1=(i+.97)/count
            a=(x0+(x1-x0)*t0,y+.22,z0+(z1-z0)*t0)
            b=(x0+(x1-x0)*t1,y+.22,z0+(z1-z0)*t1)
            _geometry(c,'glass','Mezzanine glazed infill',[a,b,(b[0],y+.95,b[2]),(a[0],y+.95,a[2])],[(0,1,2,3),(3,2,1,0)])


def escalator(c,x,z,width=1.2,base=FLOOR,height=4,metal='steel',fixed=False,reverse=False):
    """30-degree flight with landing combs, closed skirt and rounded handrails."""
    batches=__import__('station_models')._batches
    old={k:len(v[0]) for k,v in batches.items()} if reverse else {}
    run=height*math.sqrt(3); n=round(height/.18); rise=height/n; tread=run/n
    name='Fixed stair' if fixed else 'Escalator'
    for i in range(n):
        yy=base+(i+1)*rise; zz=z+i*tread
        _box(c,'granite' if fixed else 'tread',name+' tread',(x,yy-rise/2,zz+tread/2),(width,rise,tread))
        if fixed:_box(c,'pale',name+' riser shadow',(x,yy-rise*.5,zz-.001),(width,rise*.82,.006))
        _box(c,'rail',name+' tread nose',(x,yy+.003,zz+.015),(width,.007,.025))
    for side in (-1,1):
        xx=x+side*(width/2+.075)
        # Closed four-sided skirt avoids the paper-thin floating old stairs.
        thickness=.09
        profile=[(base-.05,z-.45),(base+1.00,z-.45),(base+1.00,z+.12),
                 (base+height+1.00,z+run),(base+height+1.00,z+run+.50),
                 (base+height-.04,z+run+.50),(base-.05,z+.1)]
        vertices=[(xx+dx,yy,zz) for dx in (-thickness/2,thickness/2) for yy,zz in profile]
        m=len(profile);faces=[tuple(range(m-1,-1,-1)),tuple(range(m,2*m))]
        faces.extend((i,(i+1)%m,(i+1)%m+m,i+m) for i in range(m))
        _geometry(c,'concrete' if fixed else metal,name+' closed balustrade',vertices,faces)
        if fixed:
            _beam(c,'steel','Fixed staircase handrail',(xx,base+.98,z),(xx,base+height+.98,z+run),.032,10)
        else:
            # Rubber handrail turns smoothly around each newel and onto the slope.
            path=[]
            for i in range(13):
                t=math.pi+i*math.pi/12
                path.append((xx,base+.80+.23*math.sin(t),z-.16+.23*math.cos(t)))
            path += [(xx,base+1.035,z+.12),(xx,base+height+1.035,z+run),(xx,base+height+1.035,z+run+.42)]
            for i in range(1,len(path)):
                _beam(c,'black','Rounded escalator rubber handrail',path[i-1],path[i],.044,10)
            for dz,yy in ((-.39,base+.84),(run+.35,base+height+.84)):
                _box(c,'red','Escalator emergency stop',(xx-side*.052,yy,z+dz),(.014,.065,.065))
            # Separate stainless cladding panels, lower skirt and fixing caps.
            # These small breaks let the metal catch light as manufactured parts.
            for i in range(1,math.ceil(run/1.25)):
                zz=z+i*1.25
                yy=base+height*(zz-z)/run
                _box(c,'black','Escalator cladding panel joint',(xx-side*.046,yy+.52,zz),(.003,.84,.003))
                for dy in (.15,.84):
                    _beam(c,'rail','Escalator panel fixing',(xx-side*.048,yy+dy,zz+.025),(xx-side*.052,yy+dy,zz+.025),.007,8)
            _beam(c,'black','Escalator skirt brush',(xx-side*.060,base+.10,z+.12),(xx-side*.060,base+height+.10,z+run),.014,6)
        for yy,zz in ((base+.31,z-.43),(base+height+.25,z+run+.44)):
            _box(c,'steel',name+' newel base',(xx,yy,zz),(.15,.58,.20))
    for yy,zz in ((base,z-.65),(base+height,z+run+.78)):
        _box(c,'steel' if fixed else 'tread','Landing comb plate',(x,yy+.012,zz),(width,.025,.72))
        if not fixed:
            direction=1 if yy==base else -1
            for j in range(1,int(width/.008)):
                _box(c,'rail','Fine landing comb teeth',(x-width/2+j*.008,yy+.027,zz+direction*.33),(.003,.004,.06))
    if reverse:
        for key,data in batches.items():
            if key[0]!=c.name:continue
            start=old.get(key,0)
            for i in range(start,len(data[0])):
                xx,yy,zz=data[0][i];data[0][i]=(xx,yy,2*z-zz)
            # Reflection reverses winding. Reverse only newly added faces.
            for i,face in enumerate(data[1]):
                if face and min(face)>=start:data[1][i]=tuple(reversed(face))
    return run


def luminaire(c,x,y,z,longitudinal=False,round_light=False):
    from station_lighting import fixture_light
    if round_light:
        _beam(c,'steel','Round downlight trim',(x,y+.07,z),(x,y,z),.16,16)
        _beam(c,'warm_light','Round recessed diffuser',(x,y-.006,z),(x,y-.012,z),.126,24)
        fixture_light(c,'recessed downlight',(x,y-.018,z),.25,.25,22,'warm')
        return
    w,d=(.32,1.30) if longitudinal else (1.30,.32)
    _box(c,'steel','Fluorescent reflector tray',(x,y,z),(w,.07,d))
    _box(c,'reflector','White enamel reflector',(x,y-.037,z),(w-.025,.009,d-.025))
    for side in (-1,1):
        _box(c,'reflector','Folded reflector lip',
             (x+side*(w/2-.012) if longitudinal else x,y-.050,z if longitudinal else z+side*(d/2-.012)),
             (.018,.045,d) if longitudinal else (w,.045,.018))
    for side in (-1,1):
        a=(x+side*.095,y-.05,z-.58) if longitudinal else (x-.58,y-.05,z+side*.095)
        b=(x+side*.095,y-.05,z+.58) if longitudinal else (x+.58,y-.05,z+side*.095)
        _beam(c,'light','Paired fluorescent tube',a,b,.019,12)
        for end in (-1,1):
            xx=x+side*.095 if longitudinal else x+end*.557
            zz=z+end*.557 if longitudinal else z+side*.095
            _beam(c,'steel','Fluorescent tube end cap',(xx,y-.05,zz-.02) if longitudinal else (xx-.02,y-.05,zz),
                  (xx,y-.05,zz+.02) if longitudinal else (xx+.02,y-.05,zz),.020,12)
    for end in (-1,1):
        _box(c,'ceramic','Tube lampholder',(x if longitudinal else x+end*.605,y-.04,z+end*.605 if longitudinal else z),(.25 if longitudinal else .055,.055,.055 if longitudinal else .25))
    fixture_light(c,'paired fluorescent',(x,y-.080,z),w-.12,d-.10,55)


def ceiling(c,x0,x1,z0,z1,y=4.57,fixtures=(),longitudinal=False):
    _box(c,'black','Ceiling service void',((x0+x1)/2,y+.22,(z0+z1)/2),(x1-x0,.055,z1-z0))
    for i in range(int((z1-z0)/.17)):
        _box(c,'slat','Black suspended ceiling fins',((x0+x1)/2,y,z0+.10+i*.17),(x1-x0,.13,.038))
    for x in fixtures:
        for j in range(int((z1-z0)/3)):
            luminaire(c,x,y-.105,z0+1.5+j*3,longitudinal)


def pier(c,x,z,y0=FLOOR,y1=4.8,material='concrete',width=.72):
    _box(c,material,'Exposed structural pier',(x,(y0+y1)/2,z),(width,y1-y0,.82))
    _box(c,'black','Pier skirting',(x,y0+.07,z),(width+.02,.14,.84))
    # Form-tie marks remain visible on exposed concrete in the concourse photos.
    for yy in (y0+.6,y0+1.8,y0+2.8):
        if yy < y1:
            for dx in (-width*.30,width*.30): disc(c,'grout','Concrete form tie',x+dx,yy,z+.413,.012,8)


def wall(c,name,x,z0,z1,finish='ceramic',y0=FLOOR,y1=4.3):
    inward=1 if x<2 else -1
    face=x+inward*.15
    _box(c,'concrete','Station retaining structure',(x,(y0+y1)/2,(z0+z1)/2),(.28,y1-y0+.6,z1-z0))
    _box(c,'tile_'+finish,'Station wall ceramic field',(face,(y0+y1)/2,(z0+z1)/2),(.025,y1-y0,z1-z0))
    for i in range(int((z1-z0)/5)):
        zz=z0+2.5+i*5
        _box(c,'ceramic' if name=='Altamira' else 'concrete','Wall structural pilaster',(face+inward*.035,(y0+y1)/2,zz),(.12,y1-y0,.30))
    offset=y0-FLOOR
    for yy in (y0+.14,3.34+offset):
        _box(c,'black','Horizontal wall trim',(face+inward*.08,yy,(z0+z1)/2),(.06,.12,z1-z0))
    for zz in (z0+15,z0+48,z0+84,z0+124):
        if zz>z1-2.4:continue
        _box(c,'black','Wall station-name panel',(face+inward*.11,3.68+offset,zz),(.065,.47,4.8))
        _text(c,name,(face+inward*.147,3.68+offset,zz),.28,'white',math.pi/2 if inward==1 else -math.pi/2)
    # Brushed aluminium poster frames in the photographed wall bays. Graphic
    # contents are authored station information, not copied advertisements.
    for zz in (z0+23,z0+65,z0+106):
        if zz>z1-.5:continue
        _box(c,'steel','Recessed poster frame',(face+inward*.05,2.38+offset,zz),(.07,1.55,.96))
        _box(c,'black','Poster frame gasket',(face+inward*.095,2.38+offset,zz),(.02,1.43,.84))
        _box(c,'pale','Station information panel',(face+inward*.108,2.38+offset,zz),(.006,1.37,.78))
        _text(c,'METRO\nDE CARACAS',(face+inward*.114,2.50+offset,zz),.11,'black',math.pi/2 if inward==1 else -math.pi/2)


def furniture(c,x,z,y=FLOOR):
    _box(c,'steel','Brushed platform bin',(x,y+.43,z),(.42,.86,.38))
    _box(c,'black','Litter aperture',(x,y+.72,z+.197),(.31,.13,.012))
    _box(c,'steel','Bin folded lid',(x,y+.88,z),(.45,.045,.41))
    _box(c,'black','Bin removable liner joint',(x,y+.84,z+.193),(.38,.008,.008))
    for dx in (-.16,.16):
        _box(c,'black','Bin rubber feet',(x+dx,y+.025,z),(.045,.05,.29))
    _box(c,'steel','Information cabinet',(x,y+1.05,z+4.5),(.60,2.10,.18))
    _box(c,'black','Information cabinet inset',(x,y+1.22,z+4.598),(.48,1.38,.012))
    _text(c,'INFORMACIÓN',(x,y+1.68,z+4.607),.063)
    _box(c,'red','Fire equipment marker',(x,y+.22,z+4.607),(.30,.14,.015))
    for yy in (y+.4,y+1.75):
        _beam(c,'steel','Cabinet door hinge',(x-.28,yy-.055,z+4.59),(x-.28,yy+.055,z+4.59),.014,10)
    _beam(c,'rail','Cabinet lock',(x+.23,y+.90,z+4.59),(x+.23,y+.90,z+4.612),.021,12)


def ticket_hall(c,name,cx,z0,z1,width=16,finish='ceramic'):
    left,right=cx-width/2,cx+width/2
    slab(c,left,right,z0,z1)
    ceiling(c,left,right,z0,z1,8.24,fixtures=(cx-4,cx,cx+4))
    for x in (left+.30,right-.30): wall(c,name,x,z0,z1,finish,MEZZ,8.15)
    for x in (cx-4.3,cx+4.3):
        for zz in (z0+3,z1-3):pier(c,x,zz,MEZZ,8.3)
    # Stainless original ticket equipment, with recessed selectors and delivery.
    for i in range(4):
        x=cx+width/2-3.7+i*.84;zz=z1-.40
        _box(c,'steel','Original ticket vending machine',(x,MEZZ+1.08,zz),(.81,2.16,.47))
        _box(c,'black','Ticket machine illuminated header',(x,MEZZ+1.79,zz-.243),(.71,.29,.012))
        _text(c,'BOLETOS',(x,MEZZ+1.79,zz-.252),.115,'white',math.pi)
        _box(c,'black','Fare selector recess',(x+.16,MEZZ+1.00,zz-.249),(.19,.67,.014))
        for row in range(7):
            _box(c,'ceramic','Fare selector keys',(x+.17,MEZZ+.74+row*.085,zz-.26),(.105,.043,.018))
        _box(c,'black','Ticket delivery slot',(x-.11,MEZZ+.42,zz-.25),(.28,.11,.015))
        _box(c,'black','Coin acceptor',(x-.18,MEZZ+1.43,zz-.25),(.055,.11,.015))
    # Tripod turnstiles leave circulation lanes open between the cabinets.
    for i in range(5):
        x=cx-2.8+i*1.16; zz=z0+3.7
        _box(c,'steel','Ticket gate cabinet',(x,MEZZ+.53,zz),(.32,1.06,1.12))
        _box(c,'black','Ticket gate top',(x,MEZZ+1.066,zz),(.325,.025,1.13))
        for angle in (0,math.tau/3,2*math.tau/3):
            _beam(c,'steel','Tripod barrier arm',(x+.18,MEZZ+.78,zz),(x+.64,MEZZ+.78+.22*math.cos(angle),zz+.22*math.sin(angle)),.022,8)
        _box(c,'green','Gate ready indicator',(x,MEZZ+1.083,zz-.35),(.08,.006,.045))
    fascia(c,'BOLETOS',cx+width/2-2.45,7.45,z1-1,3.45,.26,sub='Venta de pasajes')
    fascia(c,'SALIDA',cx+4.2,7.55,z0+2.0,2.5,.30,'green' if name=='Altamira' else 'orange',arrows=True)


def island_structure(c,name,stop):
    a,b=stop-145,stop+5; core=stop-70
    finish='mosaic' if name=='Altamira' else 'ceramic'
    for x in (-4.,14.):wall(c,name,x,a,b,finish)
    # Two separate escalator cores: opposite directions expose both ends of the
    # island, as seen in Altamira 07/08. Bay positions are photographic estimates.
    cores=(core,core+47)
    holes=[(zz-1.0,zz+8.6) for zz in cores]
    segments=[(a,holes[0][0]),(holes[0][1],holes[1][0]),(holes[1][1],b)]
    for z0,z1 in segments:ceiling(c,-4,14,z0,z1,4.57,(2.8,7.2),name=='Altamira')
    for zz in cores:
        if name=='Altamira':
            escalator(c,5,zz,1.26,metal='bronze')
        else:escalator(c,5,zz,1.30)
        for x0,x1 in ((1.66,4.12),(5.88,8.34)):
            slab(c,x0,x1,zz-1.1,zz+8.6,name='Floating mezzanine edge slab')
            _box(c,'concrete','Exposed mezzanine fascia',((x0+x1)/2,4.77,zz-1.12),(x1-x0,.65,.24))
        slab(c,-4,14,zz+8.6,zz+12.3,name='Mezzanine cross passage')
        ceiling(c,-4,14,zz-1.1,zz+12.3,8.3,(2.8,7.2))
        # The photographed escalator is housed in a structural core, not a
        # freestanding ladder. Side cheeks carry the floating mezzanine edges.
        for x in (4.06,5.94):
            _box(c,'concrete','Island core load-bearing cheek',(x,2.96,zz+4.0),(.26,3.72,8.0))
            if name=='Bellas Artes':
                _box(c,'steel','Bellas Artes brushed core cladding',(x+(-.14 if x<5 else .14),2.86,zz+4.0),(.022,3.48,8.0))
                for dz in (1.2,3.6,6.0):
                    _box(c,'black','Core cladding vertical seam',(x+(-.153 if x<5 else .153),2.86,zz+dz),(.006,3.48,.016))
        # Broad concrete fascias in Altamira are visible above the green exits.
        if name=='Altamira':
            for x0,x1 in ((1.66,4.12),(5.88,8.34)):
                _box(c,'concrete','Altamira deep floating tray beam',((x0+x1)/2,4.55,zz-.7),(x1-x0,.72,.5))
                pier(c,(x0+x1)/2,zz+10,MEZZ,8.3,width=.62)
        for x in (4.10,5.90):guard(c,x,zz-1.0,x,zz+8.5,glass=True)
        for x in (4.15,5.85):
            _box(c,'concrete','Escalator foot pedestal',(x,1.64,zz-.22),(.29,1.08,.54))
        if name=='Altamira':
            for x,label in ((2.9,'PALO VERDE'),(7.1,'PROPATRIA')):
                fascia(c,label,x,4.02,zz-3.1,3.35,.28,sub='Dirección')
                fascia(c,'SALIDA',x,3.46,zz-1.6,2.0,.25,'green',arrows=True)
        else:
            fascia(c,'SALIDA',5,4.04,zz-1.55,6.42,.34,'orange',arrows=True)
            fascia(c,'Bellas Artes',2.60,4.21,zz-11.0,2.5,.23)
            fascia(c,'Bellas Artes',7.40,4.21,zz-11.0,2.5,.23)
    # Ticket hall connects to the rear landing of the first escalator.
    ticket_hall(c,name,5,core+12.3,core+34,width=18,finish=finish)
    # Join both core landings at mezzanine level; a suspended disconnected
    # second exit is not a usable architectural model.
    slab(c,-4,14,core+34,cores[1]-1.1,name='Connecting mezzanine gallery')
    ceiling(c,-4,14,core+34,cores[1]-1.1,8.3,(2.8,7.2))
    for x in (-3.7,13.7):wall(c,name,x,core+34,cores[1]-1.1,finish,MEZZ,8.15)
    for x in (3.25,6.75):
        for zz in (a+15,b-14):furniture(c,x,zz)
    return core


def capitolio(c,stop):
    a,b=stop-145,stop+5; core=stop-70
    # The stair group occupies a widened recess behind a column line. A clear
    # platform lane passes it on the track side (Capitolio photograph 07).
    for x in (-7.2,11.2):
        wall(c,'Capitolio',x,a,core-16,'ceramic')
        wall(c,'Capitolio',x,core+12,b,'ceramic')
    ceiling(c,-7.2,11.2,a,core-16,4.57,(-4.5,8.5))
    ceiling(c,-7.2,11.2,core+12,b,4.57,(-4.5,8.5))
    for side in (-1,1):
        cx=-6.7 if side==-1 else 10.7
        # Local vestibule floor extends behind the narrow platform.
        # Extend only outside the existing platform. A second slab over its
        # top created coincident faces and black shading in actual Cycles light.
        x0,x1=(cx-3.15,-7.1) if side==-1 else (11.1,cx+3.15)
        slab(c,x0,x1,core-18,core+12,FLOOR,'floor','Widened Capitolio platform vestibule')
        escalator(c,cx-1.35,core,1.30)
        escalator(c,cx+.95,core,2.15,fixed=True)
        for dx in (-2.85,2.85):pier(c,cx+dx,core-.55,width=.84)
        wall(c,'Capitolio',cx+side*3.15,core-18,core+12,'capitolio')
        # The column nearest the platform carries the characteristic pale tile strip.
        x=cx-side*2.85
        _box(c,'ceramic','White tiled strip on Capitolio stair pier',(x,2.9,core-.97),(.26,3.5,.016))
        for j in range(20):_box(c,'grout','Pier tile joints',(x,1.2+j*.17,core-.98),(.26,.003,.005))
        _box(c,'concrete','Capitolio deep portal beam',(cx,4.39,core-.65),(6.52,.58,.68))
        ceiling(c,cx-3.2,cx+3.2,core-16,core-.95,4.5,(cx,))
        ceiling(c,cx-3.2,cx+3.2,core-.95,core+12,8.25,(cx-1.5,cx+1.5))
        fascia(c,'SALIDA',cx,3.92,core-1.15,3.15,.3,'orange',arrows=True)
        slab(c,cx-3.2,cx+3.2,core+7.9,core+12)
    # Continuous lanes alongside the circulation recesses retain headroom.
    for x0,x1 in ((-3.7,-1.6),(5.6,7.7)):
        ceiling(c,x0,x1,core-16,core+12,4.57,((x0+x1)/2,))
    ceiling(c,-1.6,5.6,core-16,core+12,4.77)
    ticket_hall(c,'Capitolio',2,core+12,core+37,width=22,finish='capitolio')
    # Capitolio 06 shows substantial paired piers and deep intersecting beams
    # in the ticket hall, plus a glazed information/control kiosk.
    for x in (-3.4,2,7.4):
        for zz in (core+20,core+29):pier(c,x,zz,MEZZ,8.3,width=.82)
        _box(c,'concrete','Capitolio concourse longitudinal beam',(x,8.0,core+24.5),(1.1,.5,25))
    _box(c,'ceramic','Capitolio information counter',(-7.4,MEZZ+.52,core+29),(2.6,1.04,3.6))
    for x in (-8.7,-6.1):
        _box(c,'glass','Information kiosk glazing',(x,MEZZ+1.69,core+29),(.025,1.25,3.6))
    fascia(c,'Información',-7.4,7.45,core+27.15,2.75,.22)
    # Bright yellow tiled concourse piers and a central fixed flight between
    # escalators reproduce the Avenida Universidad hall photograph 03.
    for x in (-2.2,6.2):pier(c,x,core+33,MEZZ,8.3,'capitolio',1.1)
    for x,fixed,width in ((-.25,False,1.22),(2,True,2.3),(4.25,False,1.22)):
        escalator(c,x,core+37,width,MEZZ,4,fixed=fixed)
    slab(c,-1,5,core+44,core+48,STREET)
    for x in (-4.6,8.6):
        for zz in (a+17,core-18,b-16):fascia(c,'Capitolio',x,4.12,zz,3.8,.28)
        furniture(c,x+( -1.65 if x<0 else 1.65),a+25)
    fascia(c,'EL SILENCIO · LÍNEA 2',-5.7,7.46,core+17,5.7,.25,sub='Transferencia')


def plaza_venezuela(c,stop):
    a,b=stop-145,stop+5; core=stop-70
    wall(c,'Plaza Venezuela',-7.2,a,core-7,'beige')
    wall(c,'Plaza Venezuela',-7.2,core+13,b,'beige')
    wall(c,'Plaza Venezuela',11.2,a,b,'beige')
    # Open colonnades define the transfer platform, with two lighting systems:
    # linear lamps at the edge and round lamps in the inner circulation aisle.
    ceiling(c,-7.2,11.2,a,core+21.5,4.75)
    ceiling(c,-7.2,8.55,core+21.5,core+30.5,4.75)
    ceiling(c,10.35,11.2,core+21.5,core+30.5,4.75)
    ceiling(c,-7.2,11.2,core+30.5,b,4.75)
    ceiling(c,8.55,10.35,core+21.5,core+30.5,8.25,(9.45,))
    for x in (-5.5,9.5):
        for zz in [a+9+i*12 for i in range(12)]:
            if x>0 and core+21<zz<core+31:continue
            pier(c,x,zz,y1=4.82,width=.82)
        for z0,z1 in ([(a,b)] if x<0 else [(a,core+21.5),(core+30.5,b)]):
            _box(c,'concrete','Longitudinal transfer hall beam',(x,4.40,(z0+z1)/2),(1.0,.62,z1-z0))
        for zz in [a+3+i*3.0 for i in range(49)]:luminaire(c,x+(-.75 if x<0 else .75),4.28,zz,round_light=True)
    # Continuous edge lighting and tiled pier faces distinguish the L1 hall
    # from the separate L3 gallery. Spacing is a photographic interpretation.
    for x in (-2.65,6.65):
        for i in range(30):
            _box(c,'steel','Plaza Venezuela edge-light channel',(x,4.43,a+2.5+i*5),(.4,.11,4.86))
            _box(c,'light','Plaza Venezuela continuous edge diffuser',(x,4.36,a+2.5+i*5),(.28,.025,4.78))
            from station_lighting import fixture_light
            fixture_light(c,'continuous platform strip',(x,4.342,a+2.5+i*5),.28,4.78,135)
    for x in (-5.5,9.5):
        for zz in [a+9+i*12 for i in range(12)]:
            if x>0 and core+21<zz<core+31:continue
            _box(c,'tile_beige','Plaza Venezuela ochre pier facing',(x,2.89,zz-.423),(.76,3.46,.018))
    # A recessed transfer opening descends behind the side platform. The L3
    # track level is not fabricated or merged into the Line 1 station box.
    slab(c,-13.8,-7.1,core-7,core,FLOOR,'floor','Transfer vestibule approach')
    slab(c,-13.8,-7.1,core+8,core+13,FLOOR,'floor','Transfer upper landing')
    wall(c,'Plaza Venezuela',-14,core-7,core+13,'beige')
    ceiling(c,-14,-7.1,core-7,core+13,4.75,(-11.,))
    for x in (-12.1,-9.7):escalator(c,x,core+1,1.35,FLOOR-4,4)
    slab(c,-13.8,-8.8,core-3,core+.6,FLOOR-4,'granite','Lower transfer landing')
    for x0,x1 in ((-13.8,-13.0),(-11.25,-10.55),(-8.82,-7.1)):
        slab(c,x0,x1,core,core+8.0,FLOOR,'floor','Transfer stair aperture rim')
    guard(c,-13.1,core,-13.1,core+8,FLOOR)
    guard(c,-8.8,core,-8.8,core+8,FLOOR)
    for zz in (a+26,core-10,core+24):
        # These pale, dark-lettered transfer signs are specific to the L1 photos.
        fascia(c,'EL VALLE',-4.25,4.10,zz,4.15,.32,'black',sub='Trenes Dirección',background='ceramic')
        fascia(c,'Línea 2 / Línea 3',-4.25,3.49,zz+1.0,3.8,.29,'black',sub='Transferencia',background='ceramic')
    for x in (-3.9,7.9):
        for zz in (a+12,a+60,a+109):fascia(c,'Plaza Venezuela',x,4.19,zz,4.8,.25)
        furniture(c,x+(-2.6 if x<0 else 2.6),a+31)
    # Small mezzanine connected by a distinct side flight, retained above the
    # platform access pocket, not a clone of Capitolio's yellow hall.
    escalator(c,9.45,core+22,1.35)
    slab(c,8.5,10.4,core+29,core+31)
    ticket_hall(c,'Plaza Venezuela',2,core+31,core+54,18,'beige')


def bellas_entrance(parent,stop):
    c=_collection('Bellas Artes cultural context',parent);cx=-10;z=stop-58
    _box(c,'concrete','Street substructure beneath entrance',(cx,6.9,z-6.2),(17,3.6,12.4))
    slab(c,cx-8.5,cx+8.5,z-12.4,z,STREET-.4,'granite','Avenida México pavement')
    for x in (cx-3.3,cx+3.3):
        _box(c,'concrete','Entrance stairwell retaining wall',(x,7.1,z+4),(.27,4,8))
    _box(c,'concrete','Entrance stairwell rear wall',(cx,6.4,z+8.2),(6.7,2.6,.25))
    slab(c,cx-3.2,cx+3.2,z+7.8,z+9,MEZZ,'granite','Lower entrance landing')
    # Avenida México portal with a real semicircular two-step forecourt.
    for radius,y in ((5.6,STREET-.20),(5.05,STREET)):
        verts=[(cx,y,z)]+[(cx+radius*math.cos(i*math.pi/48),y,z-radius*math.sin(i*math.pi/48)) for i in range(49)]
        _geometry(c,'granite','Rounded Bellas Artes entrance landing',verts,[(0,i+1,i+2) for i in range(48)])
        for i in range(48):
            t0=i*math.pi/48;t1=(i+1)*math.pi/48
            p=[(cx+radius*math.cos(t),yy,z-radius*math.sin(t)) for yy in (y-.2,y) for t in (t0,t1)]
            _geometry(c,'concrete','Curved entrance step riser',p,[(0,1,3,2)])
    for x in (cx-3.45,cx+3.45):
        _box(c,'concrete','Bellas Artes street portal upright',(x,STREET+1.45,z-.28),(.45,2.9,.55))
        _box(c,'concrete','Bellas Artes rear portal pier',(x,STREET+1.45,z+4),(.45,2.9,.40))
        for i in range(12):_box(c,'steel','Entrance horizontal ventilation louvres',(x,STREET+.50+i*.17,z+2.1),(.16,.07,3.8))
    _box(c,'concrete','Bellas Artes portal lintel',(cx,STREET+2.95,z+1.8),(7.38,.45,5.0))
    _box(c,'black','Bellas Artes original street fascia',(cx,STREET+2.93,z-.73),(6.9,.55,.08))
    _text(c,'Bellas Artes',(cx-.65,STREET+2.93,z-.777),.38,'white',math.pi)
    _text(c,'M',(cx+2.98,STREET+2.93,z-.777),.48,'orange',math.pi)
    escalator(c,cx-1.35,z+6.9,1.4,MEZZ,4,reverse=True)
    escalator(c,cx+1.18,z+6.9,2.3,MEZZ,4,fixed=True,reverse=True)
    for x in (cx-1.45,cx+1.45):luminaire(c,x,STREET+2.69,z+.3)
    c['referenceBasis']='UrbanRail Bellas Artes 02, Avenida México. Dimensions and location within compressed route estimated.'


def altamira_entrance(parent,stop):
    """North plaza descent and built south amphitheatre, on a cross-route axis.

    Corrects the previous placement of the plaza axis parallel to the trains.
    The guide's plan establishes the perpendicular N/S relationship only;
    courtyard widths and the shortened street crossing are estimates.
    """
    c=_collection('Altamira Plaza entrance',parent);z=stop-55
    # Design in local X across the plaza, local Z away from the station. Rotate
    # into the world at the end: north becomes -X and route remains world Z.
    old={k:len(v[0]) for k,v in __import__('station_models')._batches.items()}
    old_objects=set(c.objects)
    for x0,x1 in ((-15,-6),(6,15)):
        slab(c,x0,x1,-6,28,STREET,'pale','Plaza north terrace')
    slab(c,-6,6,-3,23,MEZZ,'granite','Sunken plaza courtyard')
    # Two-stage descent, side flights flanking the water axis.
    for x in (-4.55,4.55):
        escalator(c,x,1.0,2.2,MEZZ,2,fixed=True)
        slab(c,x-1.15,x+1.15,4.5,6.1,MEZZ+2,'granite','Mid-height plaza landing')
        escalator(c,x,6.1,2.2,MEZZ+2,2,fixed=True)
    slab(c,-6,6,5.2,7.0,MEZZ+2,'pale','Footbridge across north entrance')
    for zz in (5.2,7.0):guard(c,-6,zz,6,zz,MEZZ+2,'teal')
    for x in (-6,6):
        _box(c,'pale','Sunken plaza retaining cheek',(x,7.06,10),(.35,4.1,26))
        guard(c,x,-2,x,23,STREET,'teal')
    _box(c,'water','Lower turquoise reflecting basin',(0,MEZZ+.06,4.4),(5.8,.10,10.0))
    _geometry(c,'pale','Water cascade inclined bed', [(-3,MEZZ+.02,9),(3,MEZZ+.02,9),(3,STREET-.08,22),(-3,STREET-.08,22)],[(0,1,2,3)])
    # Cascade surface declines to the lower pool, a visible defining feature.
    _geometry(c,'water','Inclined waterfall', [(-2.9,MEZZ+.12,9),(2.9,MEZZ+.12,9),(2.9,STREET+.02,22),(-2.9,STREET+.02,22)],[(0,1,2,3)])
    for row in range(25):
        zz=9.2+row*.5;yy=MEZZ+.12+(zz-9)/13*3.9
        for col in range(9):
            _box(c,'pale','Cascade water-breaking studs',(-2.6+col*.65,yy+.045,zz),(.14,.12,.15))
    for x in (-9,9):
        _box(c,'pale','Flowerbed coping',(x,STREET+.22,15),(4,.45,18))
        _box(c,'soil','Planted soil',(x,STREET+.46,15),(3.7,.035,17.7))
        for i in range(58):
            xx=x+math.sin(i*7.13)*1.5;zz=6.5+(i%29)*.61
            for leaf in range(5):
                t=leaf*math.tau/5+i;cs,sn=math.cos(t),math.sin(t)
                length=.32+(i%3)*.07; yy=STREET+.48
                verts=[(xx,yy,zz),(xx+cs*length*.5-sn*.095,yy+.20,zz+sn*length*.5+cs*.095),(xx+cs*length,yy+.43,zz+sn*length),(xx+cs*length*.5+sn*.095,yy+.20,zz+sn*length*.5-cs*.095)]
                _geometry(c,'leaf','Pointed flowerbed leaves',verts,[(0,1,2,3),(3,2,1,0)],True)
            if i%2==0:sphere(c,'yellow','Small yellow plaza flowers',xx,STREET+1.02,zz,.064)
    # Concrete spherical finials are visible in the entrance photograph.
    for x in (-6,6):
        _box(c,'pale','Bridge finial pedestal',(x,STREET+.36,9.8),(.60,.75,.60))
        sphere(c,'pale','Concrete spherical finial',x,STREET+1.02,9.8,.32)
    # Built south entrance: semicircular amphitheatre rather than the unbuilt
    # angular competition sketch. This is a separate sunken public court.
    south=-31
    slab(c,-12,12,south-12,south+3,MEZZ,'granite','South amphitheatre floor')
    for step in range(12):
        r0=4.6+step*.57;r1=r0+.58;yy=MEZZ+.32*(step+1)
        vertices=[];faces=[]
        for i in range(49):
            t=i*math.pi/48
            vertices.extend([(r0*math.cos(t),yy,south-r0*math.sin(t)),(r1*math.cos(t),yy,south-r1*math.sin(t)),(r0*math.cos(t),yy-.32,south-r0*math.sin(t))])
        for i in range(48):
            q=i*3;faces.extend([(q,q+3,q+4,q+1),(q,q+2,q+5,q+3)])
        _geometry(c,'pale','Semicircular south amphitheatre terraces',vertices,faces)
    _box(c,'pale','South entrance back wall',(0,MEZZ+1.7,south+2),(24,3.4,.35))
    for x in (-7.5,0,7.5):
        _box(c,'black','South access opening',(x,MEZZ+1.20,south+1.81),(2.7,2.4,.06))
    # Portal and a short lower-level cross passage connect the courtyard to the
    # station mezzanine. Surface surroundings beyond this are not reconstructed.
    slab(c,-5.5,5.5,south+2,-3,MEZZ,'granite','Transverse mezzanine approach')
    fascia(c,'Altamira',0,MEZZ+2.70,-2,4.1,.30)
    # Rotate authored entrance batches into the north/south axis perpendicular
    # to the rail alignment; the station centroid is X=5.
    batches=__import__('station_models')._batches
    for key,data in batches.items():
        if key[0]!=c.name:continue
        for i in range(old.get(key,0),len(data[0])):
            x,y,zz=data[0][i];data[0][i]=(5-zz,y,z+x)
    for obj in set(c.objects)-old_objects:
        x,y,zz=obj.location;obj.location=(5-zz,y,z+x);obj.rotation_euler.y-=math.pi/2
    c['referenceBasis']='Guía Caracas Plaza Francia plan; UrbanRail Altamira 03; FAC built south amphitheatre photographs. Plaza transverse axis verified; dimensions estimated.'


def build_underground(c,name,stop):
    if name=='Capitolio':capitolio(c,stop)
    elif name=='Plaza Venezuela':plaza_venezuela(c,stop)
    else:island_structure(c,name,stop)


__all__=['build_underground','bellas_entrance','altamira_entrance','luminaire','fascia','escalator']


def cano_entrance(parent,stop):
    """Bemergui 1992 pp.230–231: exposed stair cheeks and paved side plazas.

    Photograph-supported form; dimensions, access bay and ground datum are
    estimates, not a claim to have recovered the complete construction plan.
    """
    c=_collection('Caño Amarillo urban context',parent)
    ground=-3.5; rise=FLOOR-ground; z=stop-92
    slab(c,-23,27,stop-149,stop+9,ground,'granite','Caño Amarillo paved exterior plaza')
    for x in (-10.1,14.1):
        escalator(c,x,z,3.1,ground,rise,fixed=True)
        # Solid sloping exposed-concrete cheeks, observed in the architect's
        # access photo, replace the generic narrow stair rail silhouette.
        run=rise*math.sqrt(3)
        for side in (-1,1):
            xx=x+side*1.75
            verts=[(xx+dx,yy,zz) for dx in (-.14,.14) for yy,zz in
                   ((ground,z-.5),(ground+1.1,z-.5),(FLOOR+1.1,z+run+.7),(FLOOR-.25,z+run+.7))]
            _geometry(c,'concrete','Caño Amarillo solid stair parapet',verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
        slab(c,x-1.75,x+1.75,z+run,z+run+5,FLOOR,'granite','Caño Amarillo access landing')
        slab(c,-10.1 if x<0 else 11.05,-7.0 if x<0 else 14.1,stop-84,stop-79,FLOOR,'floor','Screen access bridge')
        for zz in (stop-84,stop-79):
            guard(c,x,zz,-7.1 if x<0 else 11.1,zz,FLOOR,'steel')
    for x in (-5.7,9.7):
        for zz in range(-135,0,15):
            pier(c,x,stop+zz,ground,-.86,width=.80)
    for x in (-18.5,22.5):
        for zz in (stop-127,stop-44):
            _box(c,'concrete','Angular plaza planter',(x,ground+.45,zz),(5,.9,11))
            _box(c,'soil','Planter soil',(x,ground+.92,zz),(4.5,.04,10.5))
            for i in range(8):sphere(c,'plant','Low plaza planting',x+math.sin(i*3)*1.4,ground+1.2,zz-4+i*1.1,.48)
    c['referenceBasis']='Mario Bemergui, 1992, photographs 4–5 (pp.230–231); access form observed, footprint estimated'
