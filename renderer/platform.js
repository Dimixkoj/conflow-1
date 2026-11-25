const appVariant=window.APP_VARIANT==='buildflow'?'buildflow':'conflow';
const dbName=appVariant+'-local-v1';
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(dbName,2);r.onupgradeneeded=()=>{const d=r.result;for(const n of ['projects','designs','queue','records'])if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function all(store){const d=await openDb();return new Promise((resolve,reject)=>{const r=d.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function put(store,item){const d=await openDb();return new Promise((resolve,reject)=>{const r=d.transaction(store,'readwrite').objectStore(store).put(item);r.onsuccess=()=>resolve(item);r.onerror=()=>reject(r.error)})}
async function get(store,id){const d=await openDb();return new Promise((resolve,reject)=>{const r=d.transaction(store).objectStore(store).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
if(!window.desktop){window.desktop={
 getInfo:async()=>({variant:appVariant,version:'android-test',online:navigator.onLine}),
 listProjects:async()=>(await all('projects')).sort((a,b)=>b.updated_at.localeCompare(a.updated_at)),
 saveProject:async p=>{const v={...p,id:p.id||crypto.randomUUID(),updated_at:new Date().toISOString(),sync_state:'pending',version:(p.version||0)+1};await put('projects',v);await put('queue',{id:crypto.randomUUID(),entity_type:'project',entity_id:v.id,created_at:v.updated_at,payload:v});return v},
 loadDesign:async()=>{const a=await all('designs');const x=a.sort((p,q)=>q.updated_at.localeCompare(p.updated_at))[0];return x?{...x,model_json:JSON.stringify(x.model)}:null},
 saveDesign:async d=>{const v={id:d.id||'default-design',title:d.title||'Untitled model',model:d.model||{},version:(d.version||0)+1,updated_at:new Date().toISOString(),sync_state:'pending'};await put('designs',v);await put('queue',{id:crypto.randomUUID(),entity_type:'design_document',entity_id:v.id,created_at:v.updated_at,payload:v});return v},
 getSyncStatus:async()=>({queued:(await all('queue')).length,mode:'local-first',note:'Offline browser storage. Cloud sync is not configured on this Android test build.'}),
 listRecords:async entityType=>(await all('records')).filter(r=>r.entityType===entityType).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),
 saveRecord:async record=>{const v={...record,id:record.id||crypto.randomUUID(),updatedAt:new Date().toISOString(),syncState:'pending'};await put('records',v);await put('queue',{id:crypto.randomUUID(),entity_type:v.entityType,entity_id:v.id,created_at:v.updatedAt,payload:v});return v}
};}
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
