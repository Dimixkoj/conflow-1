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

This is the first desktop foundation, not a completed production release. A background sync worker now retries queued batches while online when a real sync endpoint is configured. Cloud sync is not active until the owner supplies and validates that endpoint and its response contract. Payment processing, licence issuance, encrypted database storage, backups, the full CAD/3D/BOQ modules, and production signing are not yet implemented.

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

SQLite is the source of truth while offline. Mutations are stored in `sync_queue` and must be replayed idempotently by the future sync adapter. Set DIMIXKOJ_SYNC_URL to the full HTTPS endpoint and optionally DIMIXKOJ_SYNC_TOKEN to a bearer token. The endpoint receives a JSON batch and must return JSON with an accepted array containing the idempotency keys it safely committed. The server must support stable record IDs, version numbers, idempotency keys, soft deletion, and conflict responses. The current worker only removes accepted operations; server-side conflict reconciliation and a user-facing conflict review screen remain to be implemented.

## Required next milestones

1. Add schema migrations, encrypted sensitive fields, backup/restore and automated tests.
2. Implement the authenticated sync adapter and retry/backoff with conflict review.
3. Validate the sync endpoint contract, authentication, server-side idempotency and conflict handling.
4. Bring the existing ConFlow feature modules into the desktop shell.
5. Implement BuildFlow owner/buyer licence flows and central licence register.
6. Add legal acceptance records, payment provider integrations, installer signing and release QA.
