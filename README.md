# ConFlow 1 + BuildFlow 1 — Windows Desktop Foundation

This repository contains a shared Electron desktop shell that produces **two separate Windows installers**:

- ConFlow 1 — construction workspace
- BuildFlow 1 — licence and administration workspace

## Current foundation

- Electron desktop shell with context isolation and a restricted preload bridge.
- SQLite local database in the current Windows user's application-data directory.
- Project records are written locally before any network operation.
- Every local write is added to a durable sync queue.
- Separate Windows NSIS installer build jobs in GitHub Actions.

## Important implementation status

This is the first desktop foundation, not a completed production release. Cloud synchronisation is deliberately not enabled until a real authenticated sync API and conflict-resolution contract are connected. Payment processing, licence issuance, encrypted database storage, backups, the full CAD/3D/BOQ modules, and production signing are not yet implemented.

## Build locally

Requires Node.js 22 and Windows build tools where needed.

```bash
npm install
npm run start:conflow
npm run start:buildflow
npm run dist:conflow
npm run dist:buildflow
```

The two build commands create separate NSIS installer artifacts in `release/`.

## Offline and sync design

SQLite is the source of truth while offline. Mutations are stored in `sync_queue` and must be replayed idempotently by the future sync adapter. The planned server contract must support stable record IDs, version numbers, idempotency keys, soft deletion, and conflict responses. Conflicts must be preserved for review rather than silently overwriting newer work.

## Required next milestones

1. Add schema migrations, encrypted sensitive fields, backup/restore and automated tests.
2. Implement the authenticated sync adapter and retry/backoff with conflict review.
3. Bring the existing ConFlow feature modules into the desktop shell.
4. Implement BuildFlow owner/buyer licence flows and central licence register.
5. Add legal acceptance records, payment provider integrations, installer signing and release QA.
