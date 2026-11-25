// Conceptual service-life and maintenance screening only. Not structural analysis.
export const EXPOSURE_PRESETS={
 sheltered:{label:'Sheltered',weather:0.65,moisture:0.65},
 normal:{label:'Normal exposure',weather:1,moisture:1},
 coastal:{label:'Coastal / salt air',weather:1.45,moisture:1.35},
 wet:{label:'High rainfall / damp',weather:1.35,moisture:1.55},
 harsh:{label:'High heat / UV',weather:1.3,moisture:.8}
};
const materialFactor=m=>({Concrete:1,Blockwork:1.05,Brick:.8,Steel:1.25,Aluminium:.65,'Stainless Steel':.45,Timber:1.5,'Oak Timber':1.15,'Walnut Timber':1.2,Glass:.8,Paint:1.7,Plaster:1.35,Tile:.65,Porcelain:.45,Marble:.75,Granite:.55,Asphalt:1.1,Default:1.15}[m]??1.15);
export function simulateServiceLife(elements=[],opts={}){
 const years=Math.max(10,Math.min(20,Number(opts.years)||20));
 const occupancy=Math.max(0,Math.min(100,Number(opts.occupancy)||50));
 const exposure=EXPOSURE_PRESETS[opts.exposure]||EXPOSURE_PRESETS.normal;
 const maintenance=Math.max(0,Math.min(100,Number(opts.maintenance)||50));
 const rows=elements.filter(e=>['wall','slab','roof','column','beam','foundation','stair','window','door'].includes(e.type)).map(e=>{
  const p=e.properties||{},condition=Math.max(1,Math.min(5,Number(p.condition)||3));
  const structural=['column','beam','foundation','slab','stair','wall'].includes(e.type);
  const loadFactor=structural?1+(occupancy/100)*.42:1+(occupancy/100)*.12;
  const weatherFactor=exposure.weather*(e.type==='roof'||e.type==='window'?1.25:1);
  const moistureFactor=exposure.moisture*(['roof','window','door','wall'].includes(e.type)?1.2:1);
  const careFactor=1.35-(maintenance/100)*.7;
  const base=materialFactor(e.material||'Default');
  const annualIndex=Math.max(.1,base*weatherFactor*moistureFactor*loadFactor*careFactor*(6-condition)/3);
  const threshold=structural?4.8:3.6;
  const maintenanceYear=Math.max(1,Math.min(years,Math.ceil(threshold/annualIndex)));
  const projected=Math.min(100,annualIndex*years*5.5);
  const tier=projected>=70?'High attention':projected>=40?'Monitor': 'Routine';
  return {id:e.id,label:e.label||e.type,type:e.type,material:e.material||'Default',structural,condition,annualIndex:+annualIndex.toFixed(2),maintenanceYear,projectedDeterioration:+projected.toFixed(1),tier,inspection:'Visual inspection and qualified professional assessment required'};
 });
 const high=rows.filter(x=>x.tier==='High attention').length;
 return {years,occupancy,exposure:exposure.label,maintenance,rows,summary:{elements:rows.length,highAttention:high,monitor:rows.filter(x=>x.tier==='Monitor').length,routine:rows.filter(x=>x.tier==='Routine').length},notice:'Screening scenario only. Not a structural calculation, load-capacity check, code-compliance assessment, remaining-life certification or prediction of collapse. No member is declared safe or unsafe. A licensed structural engineer must inspect, model loads, check reinforcement/material tests, foundations, deterioration and applicable Nigerian codes.'};
}
