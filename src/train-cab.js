import * as THREE from 'three';

/** Animate the authored cab controller and instrument faces with game state.
 * The layout follows the source guide; these are simplified simulator readouts,
 * not an implementation of the real train's CBTC or COSMOS software.
 */
export function createTrainCab(train) {
  const controllers = [], dmiMaterials = new Set(), hmiMaterials = new Set();
  train.traverse(object => {
    if (!object.isMesh && object.userData.cabControl === 'master') {
      controllers.push({object,rest:object.quaternion.clone(),carIndex:Number(object.userData.carIndex)});
    }
    for (const material of object.isMesh ? (Array.isArray(object.material) ? object.material : [object.material]) : []) {
      if (/CAF cab DMI active display/.test(material.name)) dmiMaterials.add(material);
      if (/CAF cab HMI active display/.test(material.name)) hmiMaterials.add(material);
    }
  });
  const faces=[];
  if (typeof document !== 'undefined') {
    for (const [kind,materials,w,h] of [['dmi',dmiMaterials,480,570],['hmi',hmiMaterials,640,480]]) {
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');if (!ctx) continue;
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
      const originals=[...materials].map(material=>({material,map:material.map,emissiveMap:material.emissiveMap}));
      for (const material of materials) {material.map=texture;material.emissiveMap=texture;material.needsUpdate=true;}
      faces.push({kind,ctx,texture,originals});
    }
  }
  let signature='',revision=0;
  function update(state = {}, doorFraction = 0) {
    const speed=Math.max(0,Number(state.speed)||0)*3.6;
    const open=doorFraction>.001 || !!state.doorsOpen;
    const brake=!!state.brake || !!state.emergency;
    const demand=brake ? -.34 : state.throttle && !open ? .28 : 0;
    for (const {object,rest,carIndex} of controllers) {
      object.quaternion.copy(rest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),carIndex===1 ? demand : 0));
    }
    const next=`${speed.toFixed(1)}:${open}:${brake}:${demand}`;
    if (signature===next) return;
    signature=next;revision++;
    for (const {kind,ctx:c,texture} of faces) {
      const w=c.canvas.width,h=c.canvas.height;
      c.fillStyle='#101d24';c.fillRect(0,0,w,h);c.textAlign='center';c.textBaseline='middle';
      const text=(s,x,y,size=18,color='#d7e2df')=>{c.fillStyle=color;c.font=`${size}px Arial`;c.fillText(s,x,y);};
      c.fillStyle='#30434a';c.fillRect(0,0,w,43);
      if (kind==='dmi') {
        text('CBTC · DMI',240,23,20);
        const cx=240,cy=304,r=182;
        for(let i=0;i<=60;i++) {
          const a=(-225+i*4.5)*Math.PI/180,rr=r-(i%5===0?18:9);
          c.strokeStyle='#a6b7bf';c.lineWidth=2;c.beginPath();c.moveTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));c.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));c.stroke();
          if(i%5===0)text(String(i*2),cx+(r-39)*Math.cos(a),cy+(r-39)*Math.sin(a),16);
        }
        const a=(-225+Math.min(120,speed)/120*270)*Math.PI/180;
        c.strokeStyle='#eef2cf';c.lineWidth=5;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+r*.78*Math.cos(a),cy+r*.78*Math.sin(a));c.stroke();
        text(String(Math.round(speed)),240,367,48,'#f0f5df');text('km/h',240,409,19);
        text(open?'PUERTAS ABIERTAS':'PUERTAS CERRADAS',240,484,20,open?'#efbd78':'#b3d4b7');
        text(brake?'FRENO APLICADO':'SERVICIO',240,540,15);
      } else {
        text('ESTADO DEL TREN',135,23,20);text('COSMOS',562,23,18);
        for(let i=0;i<7;i++) {
          const x=40+i*81;c.strokeStyle='#bed2c6';c.lineWidth=2;c.strokeRect(x,138,68,53);
          c.fillStyle=open?'#d0a252':'#438466';
          for(const y of [143,175])for(const dx of [14,34,53])c.fillRect(x+dx,y,8,9);
          text(['M','N','R','N','R','N','M'][i],x+34,121,16);
          for(const dx of [17,51]){c.beginPath();c.arc(x+dx,200,5,0,Math.PI*2);c.stroke();}
        }
        c.textAlign='left';text(open?'PUERTAS ABIERTAS':'PUERTAS CERRADAS',46,259,18);
        text(brake?'FRENO APLICADO':'SERVICIO',46,296,18);text(`VELOCIDAD  ${Math.round(speed)} km/h`,46,333,18);
        c.textAlign='center';for(const [i,s] of ['ESTADO','ANOMALÍAS','CONTROL'].entries()) {
          c.fillStyle='#819095';c.fillRect(i*213,433,211,47);text(s,i*213+106,457,17,'#11212a');
        }
      }
      texture.needsUpdate=true;
    }
  }
  update();
  return {update,controllers,get revision(){return revision;},dispose(){
    for(const {texture,originals} of faces){for(const {material,map,emissiveMap} of originals){material.map=map;material.emissiveMap=emissiveMap;}texture.dispose();}
  }};
}
