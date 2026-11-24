const $ = (id) => document.getElementById(id);
let projects = [];
const views = ['home','projects','records','sync','settings'];
function showView(name) {
  views.forEach(v => $(v+'-view').classList.toggle('hidden', v !== name));
  document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  $('page-title').textContent = ({home:'Workspace overview',projects:'Projects',records:'Local records',sync:'Synchronisation centre',settings:'Settings'})[name];
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
(async()=>{
  const info=await window.desktop.getInfo();
  const buildflow=info.variant==='buildflow';
  const name=buildflow?'BuildFlow 1':'ConFlow 1';
  $('product-name').textContent=name;$('settings-product').textContent=name;
  $('hero-title').innerHTML=buildflow?'Manage licences.<br>Keep records offline.':'Build with confidence.<br>Keep working offline.';
  $('app-version').textContent=info.version;
  await refresh();
})();
