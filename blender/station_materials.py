"""Authored, packed PBR surface detail. No photograph is used as a texture.

UVs use metre dimensions, so the grain stays small at architectural scale.
The same color, roughness and tangent normals survive the native glTF export.
"""
import math
from array import array
import bpy
from mathutils import Vector

DETAIL_KEYS={'concrete','pale','granite','steel','bronze','rail','floor','roof','ballast','tread'}


def noise(x,y,seed=0):
    n=math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453
    return n-math.floor(n)


def smooth_noise(x,y,period,seed):
    ix,iy=math.floor(x),math.floor(y);fx=x-ix;fy=y-iy
    fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy)
    a=noise(ix%period,iy%period,seed);b=noise((ix+1)%period,iy%period,seed)
    c=noise(ix%period,(iy+1)%period,seed);d=noise((ix+1)%period,(iy+1)%period,seed)
    return (a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy


def packed_map(name,size,values,color=False):
    image=bpy.data.images.get(name) or bpy.data.images.new(name,width=size,height=size)
    image.colorspace_settings.name='sRGB' if color else 'Non-Color'
    image.pixels.foreach_set(values);image.pack()
    return image


def connect_map(mat,label,image,socket,normal=False,strength=.25):
    nodes=mat.node_tree.nodes; links=mat.node_tree.links
    tex=nodes.new('ShaderNodeTexImage');tex.name=label;tex.image=image
    output=tex.outputs['Color']
    if normal:
        node=nodes.new('ShaderNodeNormalMap');node.inputs['Strength'].default_value=strength
        links.new(output,node.inputs['Color']);output=node.outputs['Normal']
    links.new(output,nodes.get('Principled BSDF').inputs[socket])


def finish_materials(materials,palette):
    srgb=lambda v:12.92*v if v<=.0031308 else 1.055*v**(1/2.4)-.055
    size=128
    for key in DETAIL_KEYS:
        mat=materials[key];color,base_rough,_=palette[key]
        metallic=key in ('steel','rail','bronze','tread')
        heights=[]; colors=array('f');roughness=array('f');normals=array('f')
        for y in range(size):
            for x in range(size):
                grain=noise(x,y,5)-.5
                broad=smooth_noise(x/16,y/16,8,3)-.5
                medium=smooth_noise(x/4,y/4,32,7)-.5
                if key=='tread':
                    # Estimated 8 mm cleat pitch. A packed relief map replaces
                    # the old oversized 65 mm black strips on each step.
                    phase=x%8
                    ridge=1 if 2<=phase<=5 else 0
                    variation=(1 if ridge else .42)+grain*.025
                    relief=ridge*.75
                    rough=.27 if ridge else .55
                elif metallic:
                    brush=noise(x,0,9)-.5
                    variation=1+brush*.045+grain*.012
                    relief=brush*.025+grain*.007
                    rough=base_rough+brush*.14+grain*.035
                elif key=='granite':
                    chip=smooth_noise(x/1.6,y/1.6,80,8)-.5
                    variation=1+chip*.38+grain*.10
                    relief=chip*.035
                    rough=base_rough+chip*.12
                elif key=='floor':
                    variation=1+grain*.08+broad*.07
                    relief=0
                    rough=base_rough+broad*.12+grain*.035
                else:
                    pore=1 if noise(x,y,11)>.988 else 0
                    variation=1+broad*.16+medium*.07+grain*.04-pore*.15
                    relief=medium*.12+grain*.022-pore*.09
                    rough=min(.99,base_rough+broad*.08+grain*.025)
                colors.extend((*[srgb(max(.001,v*variation)) for v in color],1))
                roughness.extend((rough,rough,rough,1));heights.append(relief)
        for y in range(size):
            for x in range(size):
                h=lambda a,b:heights[(b%size)*size+a%size]
                n=Vector((-(h(x+1,y)-h(x-1,y)), -(h(x,y+1)-h(x,y-1)),1)).normalized()
                normals.extend((n.x*.5+.5,n.y*.5+.5,n.z*.5+.5,1))
        connect_map(mat,'Surface color',packed_map('Metro '+key+' color',size,colors,True),'Base Color')
        connect_map(mat,'Surface roughness',packed_map('Metro '+key+' roughness',size,roughness),'Roughness')
        if key!='floor':
            connect_map(mat,'Surface micro relief',packed_map('Metro '+key+' normals',size,normals),'Normal',True,.65)
    # Recessed mortar with softly rounded glazed tile edges; color alone was
    # insufficient to read the ceramic as individual pieces under grazing light.
    size=128;heights=[];normals=array('f');rough=array('f')
    for y in range(size):
        for x in range(size):
            edge=min(x,size-x,y*2,(size-y)*2)
            h=min(1,edge/3)
            heights.append(h*.32)
            r=.82 if edge<1.5 else .27+noise(x,y,2)*.055
            rough.extend((r,r,r,1))
    for y in range(size):
        for x in range(size):
            h=lambda a,b:heights[(b%size)*size+a%size]
            n=Vector((h(x-1,y)-h(x+1,y),h(x,y-1)-h(x,y+1),1)).normalized()
            normals.extend((n.x*.5+.5,n.y*.5+.5,n.z*.5+.5,1))
    nm=packed_map('Metro ceramic edge normals',size,normals)
    rm=packed_map('Metro ceramic glaze and mortar roughness',size,rough)
    for key,mat in materials.items():
        if key.startswith('tile_'):
            connect_map(mat,'Recessed ceramic joints',nm,'Normal',True,.6)
            connect_map(mat,'Glaze and mortar',rm,'Roughness')


def apply_finish_uv(mesh,material):
    if material not in DETAIL_KEYS and not material.startswith('tile_'):return
    tile=material.startswith('tile_')
    sx,sy=(.32,.16) if tile else (.32,.32) if material in ('floor','granite') else (.128,.128) if material=='tread' else (.08,.08) if material in ('steel','rail','bronze') else (.64,.64)
    uv=mesh.uv_layers.new(name='Metre-scale surface mapping')
    # Per-face projection gives end faces and horizontal slabs their own valid
    # UVs, instead of stretching a wall projection to zero area on the piers.
    for poly in mesh.polygons:
        axis=max(range(3),key=lambda i:abs(poly.normal[i]))
        for index in poly.loop_indices:
            v=mesh.vertices[mesh.loops[index].vertex_index].co
            u,w=(v.z,v.y) if axis==0 else (v.x,v.z) if axis==1 else (v.x,v.y)
            uv.data[index].uv=(u/sx,w/sy)


def soften_edges(obj,name):
    width=.002 if any(s in name.lower() for s in ('housing','reflector','cabinet','bin','newel base','ticket vending','poster frame','gate top')) else .012 if name=='Exposed structural pier' else .004 if 'closed balustrade' in name else .0008 if name=='Escalator tread' else 0
    if not width:return
    mod=obj.modifiers.new('Manufactured edge radius','BEVEL');mod.width=width;mod.segments=2
    mod.limit_method='ANGLE'
    normal=obj.modifiers.new('Weighted face normals','WEIGHTED_NORMAL');normal.keep_sharp=True
