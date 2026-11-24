const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const Database = require('better-sqlite3');

let db;
let mainWindow;
const variant = process.env.APP_VARIANT === 'buildflow' ? 'buildflow' : 'conflow';

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
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

ipcMain.handle('app:info', () => ({ variant, version: app.getVersion(), online: require('node:os').networkInterfaces() !== null }));
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
ipcMain.handle('sync:status', () => ({
  queued: db.prepare('SELECT COUNT(*) AS count FROM sync_queue').get().count,
  lastAttemptAt: null,
  mode: 'local-first',
  note: 'Local changes are saved on this computer. Cloud sync activates when a sync service is configured.'
}));

app.whenReady().then(() => {
  openDatabase();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (db) db.close(); });
