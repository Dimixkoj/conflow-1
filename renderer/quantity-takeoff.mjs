export function quantityLinesFor(e,elements=[]){
 const t=e.type,L=Math.max(0,+e.length||0),W=Math.max(0,+e.width||0),H=Math.max(0,+e.height||0),net0=L*H;
 const openings=elements.filter(o=>['door','window'].includes(o.type)&&o.hostId===e.id).reduce((n,o)=>n+(+o.length||0)*(+o.height||0),0),net=Math.max(0,net0-openings),per=2*(L+W),a=[];
 const add=(code,label,unit,qty,basis)=>{if(Number.isFinite(qty)&&qty>=0)a.push({measureCode:code,label,unit,qty,measurementBasis:basis})};
 if(t==='wall'){
  add('wall_area','Blockwork / wall construction area','m²',net,'Wall length × height less hosted door and window openings');
  add('wall_blocks','Standard block units (450 × 225 mm face)','No.',Math.ceil(net/(.45*.225)*1.05),'Net wall area ÷ 0.10125 m² × 1.05 allowance; verify block type and bond');
  add('wall_volume','Wall core volume','m³',net*W,'Net wall area × modelled wall thickness');
  add('wall_plaster','Cement-sand plaster, both faces','m²',net*2,'Net wall area × 2 faces; edit if only one face is plastered');
  add('wall_paint','Wall paint coverage, both faces','m²',net*2,'Net wall area × 2 faces; paint coat count and coverage depend on specification');
 }else if(t==='slab'){
  add('slab_concrete','In-situ slab concrete','m³',L*W*H,'Length × width × modelled slab thickness');
  add('slab_formwork','Soffit formwork','m²',L*W,'Length × width; omit where cast on permanent support');
  add('slab_finish','Floor finish area','m²',L*W,'Plan area; deduct openings manually where applicable');
  add('slab_screed','50 mm floor screed allowance','m³',L*W*.05,'Floor area × assumed 0.05 m screed thickness; edit to project specification');
  add('slab_edge','Slab edge formwork','m²',per*H,'Perimeter × slab thickness; assumes all edges require formwork');
 }else if(t==='roof'){
  const pitch=(e.roofStyle==='flat'?0:(+e.pitch||0))*Math.PI/180,ra=L*W/Math.max(.2,Math.cos(pitch));
  add('roof_cover','Roof covering area','m²',ra,'Plan area adjusted by modelled pitch; hip and valley allowances not included');
  add('roof_membrane','Roof underlay / membrane area','m²',ra,'Same sloping area; laps and waste to be added');
 }else if(t==='column'){
  add('column_concrete','Column concrete','m³',L*W*H,'Column length × width × height');
  add('column_form','Column formwork to four sides','m²',2*(L+W)*H,'Column perimeter × height');
 }else if(t==='beam'){
  add('beam_concrete','Beam concrete','m³',L*W*H,'Beam length × width × depth');
  add('beam_form','Beam soffit and two side formwork','m²',L*(W+2*H),'Length × (soffit width + two side depths); excludes end shutters');
 }else if(t==='foundation'){
  add('footing_concrete','Pad footing concrete','m³',L*W*H,'Footing length × width × depth');
  add('footing_excavation','Pad footing excavation (working allowance)','m³',(L+.6)*(W+.6)*(H+.15),'Assumed 300 mm working space each side and 150 mm depth allowance');
  add('footing_blinding','50 mm blinding concrete','m³',(L+.2)*(W+.2)*.05,'100 mm projection each side × assumed 50 mm thickness');
  add('footing_form','Pad footing side formwork','m²',per*H,'Footing perimeter × depth; exclude sides cast against earth');
 }else if(t==='door'||t==='window')add(t+'_count',t==='door'?'Door set':'Window set','No.',1,'One modelled opening unit');
 else if(t==='stair')add('stair_count','Stair flight','No.',1,'Count of modelled flights; structural concrete and reinforcement require stair detailing');
 else if(t==='landscape'){add('land_area','Landscape / external finish area','m²',L*W,'Length × width');add('land_topsoil','Topsoil allowance (150 mm)','m³',L*W*.15,'Area × assumed 150 mm topsoil depth')}
 else if(['bed','sofa','table','wardrobe','cabinet','furniture','plumbing','electrical'].includes(t))add('fixture_count',e.label||t,'No.',1,'Count of modelled fixture or furniture object');
 else add('object_count',e.label||t,'No.',1,'Count of modelled object');
 return a;
}
