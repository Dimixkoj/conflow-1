const $ = (id) => document.getElementById(id);
let projects = [];
const views = ['home','projects','cad','records','sync','settings'];
function showView(name) {
  views.forEach(v => $(v+'-view').classList.toggle('hidden', v !== name));
  document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  $('page-title').textContent = ({home:'Workspace overview',projects:'Projects',cad:'CAD & 3D Studio',records:'Local records',sync:'Synchronisation centre',settings:'Settings'})[name];
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
const dialog = $('project-dialog');
function openDialog(){ $('project-form').reset(); dialog.showModal(); $('project-title').focus(); }
$('new-project').addEventListener('click',openDialog);
$('new-project-2').addEventListener('click',openDialog);
$('close-dialog').addEventListener('click',()=>dialog.close());
$('project-form').addEventListener('submit',async e=>{
  e.preventDefault();
  await window.desktop.saveProject({title:$('project-title').value,description:$('project-description').value});
  dialog.close(); await refresh();
});
function renderRows(target, items) {
  if (!items.length) { $(target).className='empty'; $(target).textContent='No projects saved yet. Create one to begin.'; return; }
  $(target).className='';
  $(target).innerHTML = items.map(p=>'<div class="project-row"><div><b></b><div class="muted"></div></div><span class="muted">Saved locally · Pending sync</span></div>').join('');
  [...$(target).querySelectorAll('.project-row')].forEach((row,i)=>{row.querySelector('b').textContent=items[i].title;row.querySelector('.muted').textContent=items[i].description||'No description';});
}
async function refresh(){
  projects=await window.desktop.listProjects();
  const sync=await window.desktop.getSyncStatus();
  $('project-count').textContent=projects.length;
  $('queue-count').textContent=sync.queued;
  $('sync-queued').textContent=sync.queued;
  $('sync-label').textContent=sync.queued ? sync.queued+' change(s) saved locally' : 'Local storage ready';
  renderRows('recent-projects',projects.slice(0,5));
  renderRows('project-list',projects);
}

let design = { id:'default-design', title:'Untitled drawing', version:0, elements:[] };
let activeTool = 'select';
let selectedId = null;
const elementDefaults = {
  wall:{label:'Wall',width:5,length:4,height:3,thickness:0.15},
  door:{label:'Door',width:0.9,height:2.1,thickness:0.05},
  window:{label:'Window',width:1.2,height:1.2,sill:0.9},
  room:{label:'Room',width:5,length:4,height:3},
  roof:{label:'Roof / slab',width:8,length:6,pitch:25,thickness:0.15},
  stair:{label:'Stair',width:1.2,length:3,height:3},
  plumbing:{label:'Plumbing point',width:0.1,length:0.1},
  electrical:{label:'Electrical point',width:0.1,length:0.1},
  structural:{label:'Structural grid',width:6,length:6},
  landscape:{label:'Landscape zone',width:5,length:4}
};
function cadSetTool(tool){
  activeTool=tool;
  document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));
  $('cad-status').textContent=tool==='select'?'Select an element':tool==='measure'?'Measurement tool selected':'Click the plan to place: '+(elementDefaults[tool]?.label||tool);
}
function cadAddElement(type,x=180+design.elements.length*22,y=150+design.elements.length*18){
  const defaults=elementDefaults[type]||{label:type,width:1,length:1};
  const element={id:'el-'+Date.now()+'-'+Math.floor(Math.random()*9999),type,label:defaults.label,x,y,...defaults};
  design.elements.push(element);selectedId=element.id;renderCad();return element;
}
function renderCad(){
  const g=$('cad-elements');
  g.innerHTML='';
  design.elements.forEach(el=>{
    const w=Math.max(12,(Number(el.width)||1)*18),h=Math.max(12,(Number(el.length)||Number(el.height)||1)*18);
    let shape='';
    if(el.type==='wall') shape='<rect x="'+el.x+'" y="'+el.y+'" width="'+w+'" height="'+Math.max(8,(Number(el.thickness)||.15)*35)+'" rx="2" fill="#76d1c2" stroke="#d4fff5" stroke-width="2"/>';
    else if(el.type==='door') shape='<path d="M'+el.x+' '+(el.y+h)+' V'+el.y+' H'+(el.x+w)+'" fill="none" stroke="#f3c778" stroke-width="5"/><path d="M'+el.x+' '+(el.y+h)+' A'+w+' '+h+' 0 0 1 '+(el.x+w)+' '+el.y+'" fill="none" stroke="#f3c778" stroke-width="1.5" stroke-dasharray="5 4"/>';
    else if(el.type==='window') shape='<rect x="'+el.x+'" y="'+el.y+'" width="'+w+'" height="9" fill="#6eb9ed" stroke="#d3efff" stroke-width="2"/><path d="M'+el.x+' '+(el.y+4)+' H'+(el.x+w)+'" stroke="#17364e"/>';
    else shape='<rect x="'+el.x+'" y="'+el.y+'" width="'+w+'" height="'+h+'" rx="2" fill="'+(el.type==='room'?'#244c62':'#30465d')+'" fill-opacity=".45" stroke="#8ab7c7" stroke-width="2" stroke-dasharray="'+(el.type==='room'?'none':'5 4')+'"/><text x="'+(el.x+5)+'" y="'+(el.y+17)+'" fill="#d7e8f5" font-size="11">'+el.label+'</text>';
    const selected=el.id===selectedId;
    const group='<g data-element="'+el.id+'">'+(selected?'<rect x="'+(el.x-5)+'" y="'+(el.y-5)+'" width="'+(w+10)+'" height="'+(h+10)+'" fill="none" stroke="#f3ca72" stroke-width="1.5" stroke-dasharray="4 3"/>':'')+shape+'</g>';
    g.insertAdjacentHTML('beforeend',group);
  });
  g.querySelectorAll('[data-element]').forEach(node=>node.addEventListener('click',e=>{e.stopPropagation();selectedId=node.dataset.element;cadSetTool('select');renderCad();}));
  $('model-count').textContent=design.elements.length+' elements';
  $('cad-boq').innerHTML=['wall','door','window','room'].map(type=>'<div>'+({wall:'Walls',door:'Doors',window:'Windows',room:'Rooms'}[type])+' <b>'+design.elements.filter(e=>e.type===type).length+'</b></div>').join('');
  renderProperties();
}
function renderProperties(){
  const el=design.elements.find(e=>e.id===selectedId);
  if(!el){$('selected-properties').textContent='No element selected.';return;}
  $('selected-properties').innerHTML='<b>'+el.label+'</b><label>Width (m)<input id="prop-width" type="number" min="0.01" step="0.05" value="'+(el.width||1)+'"></label><label>Length / depth (m)<input id="prop-length" type="number" min="0.01" step="0.05" value="'+(el.length||1)+'"></label><label>Height (m)<input id="prop-height" type="number" min="0.01" step="0.05" value="'+(el.height||1)+'"></label><label>Thickness (m)<input id="prop-thickness" type="number" min="0.01" step="0.01" value="'+(el.thickness||.15)+'"></label><small class="muted">Element ID: '+el.id+'</small>';
  ['width','length','height','thickness'].forEach(key=>{const input=$('prop-'+key);if(input)input.addEventListener('change',()=>{el[key]=Number(input.value)||el[key];renderCad();});});
}
function setCadView(view){
  document.querySelectorAll('[data-cad-view]').forEach(b=>b.classList.toggle('active',b.dataset.cadView===view));
  const is3d=view==='3d';
  $('cad-canvas').classList.toggle('hidden',is3d);
  $('three-d-preview').classList.toggle('hidden',!is3d);
  $('cad-status').textContent=({plan:'2D floor plan', '3d':'3D conceptual preview',front:'Front view',side:'Side view',elevation:'Elevation view',roofplan:'Roof plan',section:'Building section'})[view]+' · linked model';
}
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>cadSetTool(b.dataset.tool)));
document.querySelectorAll('[data-cad-view]').forEach(b=>b.addEventListener('click',()=>setCadView(b.dataset.cadView)));
$('cad-canvas').addEventListener('click',e=>{
  const rect=$('cad-canvas').getBoundingClientRect();
  const x=Math.round((e.clientX-rect.left)/rect.width*900/20)*20;
  const y=Math.round((e.clientY-rect.top)/rect.height*570/20)*20;
  if(activeTool==='select')return;
  if(activeTool==='measure'){$('cad-status').textContent='Measurement point: '+(x/20).toFixed(1)+' m, '+(y/20).toFixed(1)+' m';return;}
  cadAddElement(activeTool,x,y);
});
$('delete-element').addEventListener('click',()=>{design.elements=design.elements.filter(e=>e.id!==selectedId);selectedId=null;renderCad();});
$('cad-new').addEventListener('click',()=>{if(confirm('Start a new drawing? Save your current drawing first if needed.')){design={id:'default-design',title:'Untitled drawing',version:0,elements:[]};selectedId=null;renderCad();}});
$('cad-save').addEventListener('click',async()=>{const saved=await window.desktop.saveDesign({id:design.id,title:design.title,version:design.version,model:design});design.version=saved.version;$('cad-status').textContent='Drawing saved locally · Pending sync';});
$('cad-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(design,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='conflow-design.json';a.click();URL.revokeObjectURL(url);});
async function loadCad(){const saved=await window.desktop.loadDesign();if(saved){design={id:saved.id,title:saved.title,version:saved.version,...JSON.parse(saved.model_json)};}renderCad();}

(async()=>{
  const info=await window.desktop.getInfo();
  const buildflow=info.variant==='buildflow';
  const name=buildflow?'BuildFlow 1':'ConFlow 1';
  $('product-name').textContent=name;$('settings-product').textContent=name;
  $('hero-title').innerHTML=buildflow?'Manage licences.<br>Keep records offline.':'Build with confidence.<br>Keep working offline.';
  $('app-version').textContent=info.version;
  await refresh();
  if(!buildflow) await loadCad();
  else { const cadNav=document.querySelector('[data-view=cad]'); if(cadNav) cadNav.style.display='none'; }
})();
