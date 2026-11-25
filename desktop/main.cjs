const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('node:path');
const Database = require('better-sqlite3');

let db;
let mainWindow;
let stopSync;
const variant = process.env.APP_VARIANT === 'buildflow' ? 'buildflow' : 'conflow';
const { startSync } = require('./sync.cjs');
app.setName(variant === 'buildflow' ? 'BuildFlow 1' : 'ConFlow 1');

function openDatabase() {
  const file = path.join(app.getPath('userData'), 'dimixkoj-local.sqlite');
  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at TEXT NOT NULL,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      version INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);
    CREATE TABLE IF NOT EXISTS design_documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, model_json TEXT NOT NULL, updated_at TEXT NOT NULL, sync_state TEXT NOT NULL DEFAULT 'pending', version INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS field_records (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      project_id TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_state TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE INDEX IF NOT EXISTS idx_field_records_type ON field_records(entity_type, updated_at);

  `);
}

function enqueue(type, id, operation, payload) {
  db.prepare(`INSERT INTO sync_queue
    (entity_type, entity_id, operation, payload, created_at)
    VALUES (?, ?, ?, ?, ?)`)
    .run(type, id, operation, JSON.stringify(payload), new Date().toISOString());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#101827',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

ipcMain.handle('app:info', () => ({ variant, version: app.getVersion(), online: net.isOnline() }));
ipcMain.handle('projects:list', () => db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all());
ipcMain.handle('projects:save', (_event, input) => {
  if (!input || typeof input.title !== 'string' || !input.title.trim()) {
    throw new Error('A project title is required.');
  }
  const id = input.id || require('node:crypto').randomUUID();
  const now = new Date().toISOString();
  const record = {
    id,
    title: input.title.trim(),
    description: String(input.description || ''),
    status: String(input.status || 'draft'),
    updated_at: now,
    sync_state: 'pending',
    version: Number(input.version || 0) + 1
  };
  const save = db.transaction(() => {
    db.prepare(`INSERT INTO projects (id,title,description,status,updated_at,sync_state,version)
      VALUES (@id,@title,@description,@status,@updated_at,@sync_state,@version)
      ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description,
      status=excluded.status, updated_at=excluded.updated_at, sync_state='pending',
      version=excluded.version`).run(record);
    enqueue('project', id, 'upsert', record);
  });
  save();
  return record;
});
ipcMain.handle('design:load', () => db.prepare('SELECT * FROM design_documents ORDER BY updated_at DESC LIMIT 1').get() || null);
ipcMain.handle('design:save', (_event, input) => {
  const id = input.id || 'default-design'; const now = new Date().toISOString();
  const record = { id, title: String(input.title || 'Untitled drawing'), model_json: JSON.stringify(input.model || {}), updated_at: now, sync_state: 'pending', version: Number(input.version || 0) + 1 };
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO design_documents (id,title,model_json,updated_at,sync_state,version) VALUES (@id,@title,@model_json,@updated_at,@sync_state,@version) ON CONFLICT(id) DO UPDATE SET title=excluded.title,model_json=excluded.model_json,updated_at=excluded.updated_at,sync_state='pending',version=excluded.version`).run(record);
    enqueue('design_document', id, 'upsert', record);
  }); tx(); return record;
});
ipcMain.handle('records:list', (_event, entityType) => db.prepare('SELECT * FROM field_records WHERE entity_type=? ORDER BY updated_at DESC').all(String(entityType)).map(r=>({id:r.id,entityType:r.entity_type,projectId:r.project_id,payload:JSON.parse(r.payload_json),updatedAt:r.updated_at,syncState:r.sync_state})));
ipcMain.handle('records:save', (_event, input) => {
  if (!input || !/^[a-zA-Z][a-zA-Z0-9_-]{1,40}$/.test(String(input.entityType||''))) throw new Error('Invalid record type.');
  const id=String(input.id||require('node:crypto').randomUUID()),now=new Date().toISOString(),payload=input.payload||{};
  const record={id,entity_type:String(input.entityType),project_id:input.projectId||null,payload_json:JSON.stringify(payload),updated_at:now,sync_state:'pending'};
  const tx=db.transaction(()=>{db.prepare(`INSERT INTO field_records(id,entity_type,project_id,payload_json,updated_at,sync_state) VALUES(@id,@entity_type,@project_id,@payload_json,@updated_at,@sync_state) ON CONFLICT(id) DO UPDATE SET entity_type=excluded.entity_type,project_id=excluded.project_id,payload_json=excluded.payload_json,updated_at=excluded.updated_at,sync_state='pending'`).run(record);enqueue(record.entity_type,record.id,'upsert',{...payload,id,projectId:record.project_id});});
  tx();return {id,entityType:record.entity_type,projectId:record.project_id,payload,updatedAt:now,syncState:'pending'};
});
ipcMain.handle('sync:status', () => ({
  queued: db.prepare('SELECT COUNT(*) AS count FROM sync_queue').get().count,
  lastAttemptAt: null,
  mode: 'local-first',
  note: process.env.DIMIXKOJ_SYNC_URL ? 'Automatic sync is configured and will retry while online.' : 'Local changes are saved on this computer. Set DIMIXKOJ_SYNC_URL to enable cloud sync.'
}));

app.whenReady().then(() => {
  openDatabase();
  stopSync = startSync(db);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (stopSync) stopSync(); if (db) db.close(); });
