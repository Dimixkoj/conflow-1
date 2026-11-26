# ConFlow 1 Construction Delivery Centre

## Entry point
The offline-first construction execution and architectural scheduling workspace is available at `renderer/construction-delivery.html` and is embedded as the permanent **Construction Project Execution & Control** module inside the ConFlow main navigation. It is included as a second Vite HTML entry for desktop and Android web builds.

## Current functionality
- Project title, client, location, start date and consultant / contractor leads.
- Sample 35-work-package low-rise construction programme from preliminaries to handover.
- Editable activity dates, durations, dependencies, responsible leads, progress and status.
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

## Data and sync status
This module saves records locally using localStorage and IndexedDB and is designed to remain usable offline after the page has been cached. The module's chat and records are currently device-local and are **not yet synchronised** with the shared Supabase workforce backend. Team-wide chat, role-based access, server-side audit trails, conflict resolution and shared attachment storage require a subsequent backend integration milestone.

## Drawing and professional-use limitation
The included SVGs are illustrative coordination diagrams only. They are not a complete construction drawing package, signed design, engineering calculation, fabrication detail, permit submission or instruction to build. The appointed architect and appropriately registered structural, electrical and mechanical professionals must prepare, coordinate, check, approve and issue project-specific drawings, specifications, calculations and revisions. Statutory / external inspections and professional sign-offs must be completed by the competent persons and authorities applicable to the project. Typed signature fields are acknowledgements, not cryptographic electronic signatures.

## Build
The Vite configuration includes both `renderer/index.html` and `renderer/construction-delivery.html` as build inputs. Existing Android and Windows workflows should therefore package both pages when the standard build succeeds.


## Explicit sample drawing warning

Illustrative drawing diagrams are examples of discipline layout concepts only. They are not construction-issued drawings, calculations, permit submissions or professional approvals. A status selected by an operator is a project record and is not independently validated by ConFlow. The responsible registered professionals and authorities must issue and approve project-specific documents.
