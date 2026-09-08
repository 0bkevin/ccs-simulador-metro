"""Body section traced from CAF Caracas maintenance drawing 2-21.

Source 161-200-05-602, Ed.2 (2012). The section is traced, not dimensioned
manufacturer CAD. Door openings and bogie pivot spacing use its tables.
Y is height, Z is the route axis; units are metres.
"""
import math
from functools import lru_cache

BODY_BOTTOM = .84
BODY_TOP = 3.69
BODY_HALF_LENGTH = 10.23  # N/R underframe 20460 mm, table 5-7
BOGIE_HALF_SPACING = 7.625  # 15250 mm, tables 5-6 / 5-7
CAR_PITCH = 20.96  # estimated 0.50 m gap between underframes
CAB_SHIFT = .72
CAB_JOIN = 7.35 + CAB_SHIFT
DOOR_WIDTH = 1.750  # structural opening, table 5-8
DOOR_HEIGHT = 2.0225
DOOR_CENTRES = (-7.00, -2.333, 2.333, 7.00)

# (height, half breadth), traced on the outside of the extrusion diagram.
# PCHIP derivatives preserve the continuous waist without overshoot.
SECTION = ((.84,1.365),(1.04,1.416),(1.40,1.477),(1.72,1.500),
           (1.92,1.496),(2.12,1.469),(2.56,1.394),(3.02,1.316),
           (3.22,1.230),(3.43,1.088),(3.60,.820),(3.68,.565),(3.69,.440))
_d=[(SECTION[i+1][1]-SECTION[i][1])/(SECTION[i+1][0]-SECTION[i][0]) for i in range(len(SECTION)-1)]
_m=[_d[0]]
for i in range(1,len(SECTION)-1):
    a,b=_d[i-1],_d[i]
    h0=SECTION[i][0]-SECTION[i-1][0];h1=SECTION[i+1][0]-SECTION[i][0]
    _m.append(0 if a*b<=0 else (3*(h0+h1))/((2*h1+h0)/a+(h1+2*h0)/b))
_m.append(_d[-1])


@lru_cache(maxsize=32768)
def body_width(y):
    if y<=SECTION[0][0]:return SECTION[0][1]
    if y>=SECTION[-1][0]:return SECTION[-1][1]
    for i,((a,x0),(b,x1)) in enumerate(zip(SECTION,SECTION[1:])):
        if y<=b:
            h=b-a;t=(y-a)/h
            return (2*t**3-3*t*t+1)*x0+(t**3-2*t*t+t)*h*_m[i]+(-2*t**3+3*t*t)*x1+(t**3-t*t)*h*_m[i+1]


def body_slope(y):
    e=.0001
    return (body_width(y+e)-body_width(y-e))/(2*e)


def body_section_for_cab(outline, cab_width, ymax):
    # Shared perimeter topology on the shell and cab prevents the old
    # disconnected end-cap normals and the broad triangular roof crease.
    section=[]
    for x,y in outline:
        ry=y if y<=3.10 else 3.10+(y-3.10)*(BODY_TOP-3.10)/(ymax-3.10)
        ry=max(BODY_BOTTOM,ry)
        section.append((x/max(.001,cab_width(y))*body_width(ry),ry))
    return section


def roof_height(x):
    # Invert the shoulder branch for roof fittings and gutters.
    x=abs(x)
    if x<=SECTION[-1][1]:return BODY_TOP
    low,high=1.72,BODY_TOP
    for _ in range(24):
        mid=(low+high)/2
        if body_width(mid)>x:low=mid
        else:high=mid
    return (low+high)/2
