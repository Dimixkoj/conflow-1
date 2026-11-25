// Analytical idealisation builder. Geometry/connectivity only; no loads or design checks are inferred.
export const ANALYTICAL_SCHEMA='conflow-analytical-model/1.0';
const structuralTypes=new Set(['beam','column','slab','wall','foundation']);
const vec=(e)=>({x:Number(e.x)||0,y:Number(e.y)||0,z:Number(e.z)||0});
const round=(n,t)=>Math.round(n/t)*t;
export function buildAnalyticalModel(project,{tolerance=.025}={}){
 const elements=(project?.elements||[]).filter(e=>structuralTypes.has(e.type));
 const nodes=[],nodeMap=new Map(),members=[],warnings=[];
 const nodeFor=p=>{const k=[round(p.x,tolerance),round(p.y,tolerance),round(p.z,tolerance)].join('|');if(!nodeMap.has(k)){const id='N'+(nodes.length+1).toString().padStart(4,'0');nodeMap.set(k,id);nodes.push({id,coordinates:{x:p.x,y:p.y,z:p.z},restraints:{ux:null,uy:null,uz:null,rx:null,ry:null,rz:null},restraintStatus:'UNASSIGNED'});}return nodeMap.get(k)};
 for(const e of elements){
  const p=vec(e),rot=(Number(e.rotation)||0)*Math.PI/180;
  if(e.type==='beam'||e.type==='column'){
   let a,b;
   if(e.type==='column'){a={...p};b={...p,z:p.z+(Number(e.height)||0)}}
   else{a={...p,x:p.x-(Number(e.length)||0)*Math.cos(rot)/2,y:p.y-(Number(e.length)||0)*Math.sin(rot)/2};b={...p,x:p.x+(Number(e.length)||0)*Math.cos(rot)/2,y:p.y+(Number(e.length)||0)*Math.sin(rot)/2}}
   const ni=nodeFor(a),nj=nodeFor(b);if(ni===nj){warnings.push(e.id+': zero-length analytical member');continue}
   members.push({id:'M_'+e.id,sourceElementId:e.id,kind:'FRAME',elementType:e.type,nodeI:ni,nodeJ:nj,section:{width:Number(e.width)||null,depth:Number(e.width)||null,overallHeight:Number(e.height)||null,source:'CAD nominal dimensions; engineer verification required'},material:{name:e.material||'UNSPECIFIED',grade:null,designProperties:null},orientationDeg:Number(e.rotation)||0,release:{start:null,end:null},designStatus:'NOT_ANALYSED'});
  }else{
   members.push({id:'M_'+e.id,sourceElementId:e.id,kind:e.type==='foundation'?'FOUNDATION_REGION':'SHELL',elementType:e.type,referencePoint:p,dimensions:{length:Number(e.length)||0,width:Number(e.width)||0,thickness:Number(e.height)||0},material:{name:e.material||'UNSPECIFIED',grade:null,designProperties:null},meshStatus:'NOT_MESHED',designStatus:'NOT_ANALYSED'});
   if(e.type==='wall')warnings.push(e.id+': wall analytical plane, openings and wall junctions require explicit panel meshing and connectivity review');
   if(e.type==='foundation')warnings.push(e.id+': foundation soil springs and geotechnical restraints are unassigned');
  }
 }
 if(!nodes.length)warnings.push('No beam/column frame nodes found. Shell and foundation elements are listed but not meshed.');
 return {schema:ANALYTICAL_SCHEMA,projectId:project.id,projectTitle:project.title,sourceRevision:project.revision?.number||project.version||1,units:{length:project.units||'m',force:'kN',stress:'MPa'},nodes,members,supports:[],loadCases:[],combinations:[],mesh:{status:'NOT_GENERATED',method:null,elementSize:null},solver:{name:null,version:null,status:'NOT_RUN'},warnings,requiredEngineeringInputs:['Confirm analytical grid and member centre-lines','Review merged nodes and member connectivity','Assign support restraints and foundation springs','Confirm section dimensions, material grades and reinforcement','Define self-weight policy and dead loads','Define occupancy/use loads and load patterns','Define wind, rain, thermal, seismic and other applicable actions','Define code-specific load combinations and factors','Mesh and validate wall/slab shell connectivity','Independent licensed structural engineer review']};
}
export function validateAnalyticalModel(a,project){
 if(!a||a.schema!==ANALYTICAL_SCHEMA)throw new Error('Unsupported analytical model schema');
 const sourceIds=new Set((project?.elements||[]).map(e=>e.id)),nodeIds=new Set(a.nodes.map(n=>n.id));
 const issues=[];
 for(const m of a.members){if(!sourceIds.has(m.sourceElementId))issues.push(m.id+': source CAD object is missing');if(m.kind==='FRAME'&&(!nodeIds.has(m.nodeI)||!nodeIds.has(m.nodeJ)))issues.push(m.id+': invalid node connectivity');if(m.kind==='FRAME'&&m.nodeI===m.nodeJ)issues.push(m.id+': zero length');}
 if(!a.members.length)issues.push('No structural members found');
 if(a.nodes.some(n=>n.restraintStatus==='UNASSIGNED'))issues.push('One or more supports/restraints are unassigned');
 if(a.members.some(m=>!m.material?.grade))issues.push('Material grades are not assigned');
 if(a.loadCases.length===0)issues.push('No load cases defined');
 if(a.combinations.length===0)issues.push('No design load combinations defined');
 return {valid:issues.length===0,issues,memberCount:a.members.length,nodeCount:a.nodes.length};
}
