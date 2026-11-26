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

This is the first desktop foundation, not a completed production release. A background sync worker now retries queued batches while online when a real sync endpoint is configured. The shared Dimixkoj Enterprise Supabase client is now wired for email authentication and app-scoped project upload. Other workforce records and conflict-aware bidirectional sync remain staged for subsequent milestones. Payment processing, licence issuance, encrypted database storage, backups, the full CAD/3D/BOQ modules, and production signing are not yet implemented.

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


## Shared workforce backend

Both app builds use the Dimixkoj Enterprise Supabase project with distinct `app_key` values (`conflow1` and `buildflow1`). The renderer uses only the public publishable key; authorization is enforced by Supabase Auth and RLS. Sign in with the registered company owner or an active app member, then use **Sync projects** to upload local project headers to the correct app workspace. This first client integration does not yet sync CAD models, BOQ lines, staff profiles, attendance, chat, attachments, or offline conflict resolution.

## Permanent ConFlow module — Construction Project Execution & Control

The ConFlow renderer now includes a permanent **Construction Project Execution & Control** workspace, accessible from the main navigation. It provides an end-to-end, editable sample programme and local registers for project particulars, architectural / structural / electrical / mechanical drawing issues, materials, labour, plant, work-package leadership, stage evidence, daily reports, rescheduling, workflow messages, internal and external inspections, client satisfaction and printable outputs.

The four embedded SVGs are expressly illustrative coordination samples and must not be used for construction. Drawing records now capture discipline, drawing number, title, revision, issue status, prepared-by, checked-by, approved-by, approval date and approval reference. Approved-for-construction status is a record entered by the user's authorised project team; the software does not independently validate professional credentials or approve designs.

### Professional and safety controls

- The appointed architect and appropriately registered structural, electrical and mechanical professionals remain responsible for discipline-specific design, calculations, coordination, revision issue and approvals.
- Statutory permits, authority inspections, material tests, concealed-work hold points, HSE controls and client / consultant acceptance must be recorded against the actual project requirements and applicable Nigerian and local law.
- A typed name in an acknowledgement field is not a cryptographic signature or a substitute for a legally accepted signature workflow.
- Chat is a coordination record, not a substitute for controlled drawings, RFIs, site instructions, contract notices or signed inspection forms.
- CPEC now connects to the existing Dimixkoj Workforce Supabase backend for project-scoped shared records, assigned project teams, a private file bucket, server-generated change audit events, Realtime change notifications and expected-version conflict detection.
- The local workspace remains available offline. Cloud synchronisation is user-triggered; simultaneous edits are reported as conflicts and retained locally rather than silently overwritten.
- Project team assignments support project managers, architects, structural / electrical / mechanical engineers, site supervisors, inspectors and client representatives. The current assignment screen requires an existing active ConFlow 1 company member's Auth user UUID; email invitations are a later milestone.
- CPEC cloud records cover project metadata, schedule tasks, drawings, stage records, daily reports, quality / inspection records, client satisfaction and workflow chat. Attachments upload to a private project bucket when the device is online (12 MB per file in this module).
- Existing local CPEC records are not automatically migrated; select or create the matching shared project and synchronise from the device holding the local records.

See [the module implementation notes](docs/CONSTRUCTION-DELIVERY-CENTRE.md).
