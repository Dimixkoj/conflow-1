# ConFlow 1 Construction Delivery Centre

## Entry point
The offline-first construction execution and architectural scheduling workspace is available at `renderer/construction-delivery.html` and is embedded as the permanent **Construction Project Execution & Control** module inside the ConFlow main navigation. It is included as a second Vite HTML entry for desktop and Android web builds.

## Current functionality
- Project title, client, location, start date and consultant / contractor leads.
- Sample 35-work-package low-rise construction programme from preliminaries to handover.
- Editable activity dates, durations, dependencies, responsible leads, progress and status.
- Rescheduling audit trail capturing previous / revised date, activity, person entering the change, reason and timestamp.
- Architectural, structural, electrical and mechanical sample schematic diagrams.
- Drawing register with discipline, drawing number, title, revision, issue status, prepared-by, checked-by, approved-by, approval date and approval reference.
- Upload of drawings, photos and evidence. Image attachments are stored in browser IndexedDB; drawing files such as CAD binaries are recorded by filename and should remain in the project file store.
- Stage records for materials, labour, plant, activity, issues, supervisor and typed acknowledgement.
- Daily site reports with workforce, weather, materials, progress, issues, typed preparer acknowledgement and attachments.
- Internal, consultant, client, statutory, laboratory and HSE inspection records; corrective action and reinspection date.
- Client / external satisfaction rating and typed acknowledgement.
- Project workflow chat saved locally on the device.
- Print-ready views for project summary, schedule, drawing register, stage records, daily reports and quality records.
- JSON data export and full local backup / restore including IndexedDB attachments.
- Service-worker shell cache includes the new page.

## Shared cloud data and offline sync
The module continues to save records locally using localStorage and IndexedDB. After the user signs in through the ConFlow company account, they can load or create a shared ConFlow project and manually synchronise CPEC records with the existing Supabase workforce backend.

The additive backend migration creates:
- `construction_project_team` for project-specific assignments: project manager, architect, structural engineer, electrical engineer, mechanical engineer, site supervisor, inspector and client representative.
- `construction_project_records` for versioned project metadata, schedule tasks, drawings, stage records, daily reports, quality / inspection records, satisfaction records and workflow chat.
- `construction_project_audit` for server-generated insert / update audit events visible to project managers and company administrators.
- A private `cpec-project-files` Storage bucket, with project-folder access policies.
- The `cpec_save_record` RPC, which uses expected-version checks and returns a conflict rather than silently overwriting a record changed by another user.
- A Realtime subscription to shared project record changes. The module notifies the user when remote changes arrive; the user starts Sync to reconcile them.

Row Level Security restricts records and files to active ConFlow company members who are either company administrators or assigned to that specific project. Role permissions are record-type aware: inspectors can update inspection / daily / satisfaction records, client representatives can update satisfaction and chat, and the discipline leads have the relevant design / programme / site record access. BuildFlow records remain outside this CPEC table scope.

### Current integration boundaries
- Synchronisation is user-triggered, not continuous background sync. Offline changes remain local until the user reconnects and presses **Sync shared project**.
- If the same record has changed both locally and remotely since the last sync, CPEC retains the local copy and reports a conflict; it does not silently choose a winner. A dedicated side-by-side conflict resolution screen is a later milestone.
- Team assignment currently uses the existing ConFlow Auth user UUID. The person must already be an active ConFlow 1 company member. Email invitations and identity lookup are not yet implemented in this screen.
- Attachments are uploaded to the private bucket when they are locally available and the project is synchronised. The current file limit is 12 MB per attachment. A cloud-only attachment can be downloaded for preview when needed.
- A shared cloud record or file is not automatically a professional approval, signed instruction or statutory acceptance. The project team must still use the controlled approval and document issue process.
- The legacy local-only project data is not automatically migrated to a shared project. Select or create the corresponding cloud project, then synchronise from the device that holds the local records. Review any conflict notice before relying on the cloud copy.

## Drawing and professional-use limitation
The included SVGs are illustrative coordination diagrams only. They are not a complete construction drawing package, signed design, engineering calculation, fabrication detail, permit submission or instruction to build. The appointed architect and appropriately registered structural, electrical and mechanical professionals must prepare, coordinate, check, approve and issue project-specific drawings, specifications, calculations and revisions. Statutory / external inspections and professional sign-offs must be completed by the competent persons and authorities applicable to the project. Typed signature fields are acknowledgements, not cryptographic electronic signatures.

## Build
The Vite configuration includes both `renderer/index.html` and `renderer/construction-delivery.html` as build inputs. Existing Android and Windows workflows should therefore package both pages when the standard build succeeds.


## Explicit sample drawing warning

Illustrative drawing diagrams are examples of discipline layout concepts only. They are not construction-issued drawings, calculations, permit submissions or professional approvals. A status selected by an operator is a project record and is not independently validated by ConFlow. The responsible registered professionals and authorities must issue and approve project-specific documents.
