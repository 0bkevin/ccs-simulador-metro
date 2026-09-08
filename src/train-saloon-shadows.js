import * as THREE from 'three';

export const SALOON_SHADOW_SHARE = .45;

/** Four local shadow maps approximate the nearby parts of the long area lamps.
 * Sources stay at fixed lens sections; only their blend follows the viewer. */
export function createSaloonShadows(train, group, renderer, manifest, gain) {
  const stripsByCar = new Map();
  for (const source of manifest.lighting?.trainAreaLights || []) {
    if (source.family !== 'saloon opal strip') continue;
    const carIndex = Number(source.collection.slice(-2));
    const count = Math.ceil(source.height / 2);
    const spacing = source.height / count;
    const sections = Array.from({length:count},(_,i) => source.position[2] + spacing * (i + .5 - count / 2));
    if (!stripsByCar.has(carIndex)) stripsByCar.set(carIndex,[]);
    stripsByCar.get(carIndex).push({source,sections,spacing,count});
  }
  const lights = Array.from({length:4},(_,i) => {
    const light = new THREE.SpotLight(0xffffff,0,9,.95,.65,2);
    light.name = `Saloon soft shadow ${i+1}`;
    light.castShadow = true;light.visible = false;
    light.shadow.mapSize.set(512,512);
    light.shadow.camera.near = .05;
    light.shadow.bias = -.0001;light.shadow.normalBias = .004;
    light.shadow.radius = 3;
    group.add(light,light.target);
    return light;
  });
  const defaultShadowType = renderer?.shadowMap?.type;
  function shadowStyle(active) {
    if (defaultShadowType === undefined) return;
    const type = active ? THREE.PCFShadowMap : defaultShadowType;
    if (renderer.shadowMap.type === type) return;
    renderer.shadowMap.type = type;renderer.shadowMap.needsUpdate = true;
    // PCF respects each lamp's filter radius. Restore the world's original
    // filter outside the saloon, and invalidate the cached shader variants.
    let root = train;while(root.parent)root=root.parent;
    const materials = new Set();
    root.traverse(object => {
      for(const material of Array.isArray(object.material)?object.material:[object.material])if(material)materials.add(material);
    });
    for(const material of materials)material.needsUpdate=true;
  }
  function update(carIndex, viewingZ, active) {
    const strips = stripsByCar.get(carIndex) || [];
    active = active && strips.length === 2;
    shadowStyle(active);
    lights.forEach(light => {light.visible=active;light.intensity=0;});
    if (!active) return false;
    strips.forEach(({source,sections,spacing,count},side) => {
      const focus = THREE.MathUtils.clamp(viewingZ,sections[0],sections.at(-1));
      const nearest = sections.map((z,index)=>({z,index,distance:Math.abs(z-focus)}))
        .sort((a,b)=>a.distance-b.distance).slice(0,2);
      nearest.forEach(({z,index,distance},slot) => {
        const light = lights[side*2+slot];
        light.position.set(source.position[0],source.position[1],z);
        light.target.position.copy(light.position);light.target.position.y-=1;
        light.color.fromArray(source.color);
        // Complementary smooth weights cross-fade fixed lamp sections rather
        // than dragging a spotlight (and its shadow) along with the camera.
        const t = THREE.MathUtils.clamp(distance/spacing,0,1);
        const weight = 1-t*t*(3-2*t);
        light.intensity = source.power * gain * SALOON_SHADOW_SHARE * 3 / count * weight;
        light.userData.carIndex = carIndex;
        light.userData.sourceFixture = source.fixtureId;
        light.userData.sourceSection = index;
      });
    });
    return true;
  }
  return {lights,update,dispose() {
    shadowStyle(false);
    lights.forEach(light=>{light.shadow.dispose();light.removeFromParent();light.target.removeFromParent();});
  }};
}
