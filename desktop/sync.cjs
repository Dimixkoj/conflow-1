const { net } = require('electron');

function startSync(db) {
  const endpoint = process.env.DIMIXKOJ_SYNC_URL;
  const token = process.env.DIMIXKOJ_SYNC_TOKEN;
  let running = false;
  let retryDelay = 5000;

  async function flushQueue() {
    if (running || !endpoint || !net.isOnline()) return;
    const rows = db.prepare('SELECT * FROM sync_queue ORDER BY id LIMIT 50').all();
    if (!rows.length) return;
    running = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: 'Bearer ' + token } : {})
        },
        body: JSON.stringify({
          client: 'dimixkoj-desktop',
          batch: rows.map(row => ({
            idempotencyKey: 'desktop-' + row.id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            operation: row.operation,
            payload: JSON.parse(row.payload),
            queuedAt: row.created_at
          }))
        })
      });
      if (!response.ok) throw new Error('Sync server returned HTTP ' + response.status);
      const result = await response.json();
      const accepted = new Set(Array.isArray(result.accepted) ? result.accepted : []);
      const remove = db.prepare('DELETE FROM sync_queue WHERE id = ?');
      const mark = db.prepare("UPDATE projects SET sync_state='synced' WHERE id=?");
      const markField = db.prepare("UPDATE field_records SET sync_state='synced' WHERE id=?");
      const tx = db.transaction(() => {
        for (const row of rows) {
          if (accepted.has('desktop-' + row.id)) {
            remove.run(row.id);
            if (row.entity_type === 'project') mark.run(row.entity_id);
            if (['staff','site_report','team_message','whatsapp_review'].includes(row.entity_type)) markField.run(row.entity_id);
          }
        }
      });
      tx();
      retryDelay = 5000;
    } catch (error) {
      db.prepare('UPDATE sync_queue SET attempts=attempts+1, last_error=? WHERE id IN (' +
        rows.map(() => '?').join(',') + ')').run(String(error.message || error), ...rows.map(r => r.id));
      retryDelay = Math.min(retryDelay * 2, 5 * 60 * 1000);
    } finally {
      running = false;
      if (db.prepare('SELECT COUNT(*) AS count FROM sync_queue').get().count > 0) {
        setTimeout(flushQueue, retryDelay);
      }
    }
  }

  const timer = setInterval(flushQueue, 30000);
  flushQueue();
  return () => clearInterval(timer);
}

module.exports = { startSync };
