"""Author small surface graphics; reference photos are never used as textures.
Run with system Python + Pillow before rebuilding the native interior.
Cab displays follow the documented instrument type; their state is illustrative.
"""
from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFont

OUT=Path(__file__).parent/'textures';OUT.mkdir(exist_ok=True)
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
def font(n):return ImageFont.truetype(FONT,n)
def text(d,xy,s,n=16,fill='#d5dbd9',anchor='mm'):d.text(xy,s,font=font(n),fill=fill,anchor=anchor)

im=Image.new('RGB',(480,570),'#091218');d=ImageDraw.Draw(im)
d.rectangle((12,12,468,54),fill='#1b2d38');text(d,(240,33),'CBTC · DMI',20)
cx,cy,r=240,304,182
for i in range(61):
    a=math.radians(-225+i*4.5);r0=r-(18 if i%5==0 else 9)
    d.line((cx+r0*math.cos(a),cy+r0*math.sin(a),cx+r*math.cos(a),cy+r*math.sin(a)),fill='#a6b7bf',width=2)
    if i%5==0:text(d,(cx+(r-39)*math.cos(a),cy+(r-39)*math.sin(a)),str(i*2),16)
d.line((cx,cy,cx+r*.78*math.cos(math.radians(-225)),cy+r*.78*math.sin(math.radians(-225))),fill='#eeeecc',width=5)
d.ellipse((cx-8,cy-8,cx+8,cy+8),fill='#a7bbc3')
text(d,(240,367),'0',48,fill='#f0f5df');text(d,(240,409),'km/h',19)
d.rectangle((36,459,444,508),outline='#475b65',width=2);text(d,(240,484),'PUERTAS CERRADAS',20,fill='#b3d4b7')
text(d,(240,540),'CABINA  ·  SERVICIO',15);im.save(OUT/'cab-dmi.png')

im=Image.new('RGB',(640,480),'#142127');d=ImageDraw.Draw(im)
d.rectangle((0,0,640,43),fill='#30434a');text(d,(128,22),'ESTADO DEL TREN',20)
text(d,(562,22),'COSMOS',18)
for i in range(7):
    x=40+i*81;d.rounded_rectangle((x,138,x+68,191),radius=6,outline='#bed2c6',width=2)
    for y in (143,175):
        for dx in (14,34,53):d.rectangle((x+dx,y,x+dx+8,y+9),fill='#438466')
    text(d,(x+34,121),['M','N','R','N','R','N','M'][i],16)
    for dx in (17,51):d.ellipse((x+dx-5,195,x+dx+5,205),outline='#afc2ba',width=2)
for i,s in enumerate(['PUERTAS CERRADAS','FRENO APLICADO','VELOCIDAD  0 km/h']):text(d,(46,259+i*37),s,18,anchor='lm')
for i,s in enumerate(['ESTADO','ANOMALÍAS','CONTROL']):
    d.rectangle((i*213,433,(i+1)*213-2,479),fill='#819095');text(d,(i*213+106,457),s,17,fill='#11212a')
im.save(OUT/'cab-hmi.png')

im=Image.new('RGB',(660,436),'#10191c');d=ImageDraw.Draw(im)
for i in range(4):
    x=(i%2)*330;y=(i//2)*218
    d.rectangle((x+3,y+3,x+326,y+214),outline='#293c43',width=2)
    text(d,(x+18,y+19),'CCTV '+str(i+1),14,fill='#677c84',anchor='lm')
text(d,(330,218),'MONITOR',18,fill='#6b7e84');im.save(OUT/'cab-cctv.png')

rng=random.Random(6001);im=Image.new('RGB',(256,256));p=im.load()
for y in range(256):
    for x in range(256):
        v=rng.randint(-7,7)+(6 if (x+y)%3==0 else 0)
        p[x,y]=(max(0,25+v),max(0,53+v),max(0,91+v))
d=ImageDraw.Draw(im)
for i in range(130):
    x=rng.randrange(256);y=rng.randrange(256)
    d.line((x,y,x+1,y+3),fill=rng.choice(['#71858c','#3c7291','#a6a18c']))
im.save(OUT/'cab-seat-weave.png')

# Four small priority-seat pictograms, as visible above the blue bench.
im=Image.new('RGB',(768,96),'#e4e6df');d=ImageDraw.Draw(im)
for i in range(4):
    x=8+i*92;d.rectangle((x,8,x+80,88),fill='#163b85')
    d.ellipse((x+27,17,x+41,31),fill='#eeeeeb')
    d.line((x+33,35,x+34,56,x+52,57,x+60,76),fill='#eeeeeb',width=6)
    if i==0:
        d.arc((x+14,43,x+47,79),30,310,fill='#eeeeeb',width=4)
    elif i==1:
        d.line((x+43,39,x+59,49,x+63,77),fill='#eeeeeb',width=4)
    elif i==2:d.ellipse((x+32,34,x+48,53),fill='#eeeeeb')
    else:d.ellipse((x+47,36,x+58,48),fill='#eeeeeb')
text(d,(560,48),'ASIENTOS PREFERENCIALES',23,fill='#334555')
im.save(OUT/'priority-seating.png')
print('Authored five interior surface textures in',OUT)
