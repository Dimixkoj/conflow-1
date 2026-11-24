# ConFlow 1 — Complete CAD, BIM-lite and 3D Studio Redesign

**Product owner:** Dimixkoj Enterprises  
**Product:** ConFlow 1  
**Design principle:** One native, connected design workspace. Do not require Synaps or an external design synchronisation service.

## 1. Workspace architecture

The CAD Studio is a single project workspace with switchable work surfaces and shared model data:

- 2D Drafting
- 3D Model / Conceptual Preview
- Front and side elevations
- Roof plan
- Building sections
- Interior design
- Site and landscape plan
- Measurements and take-off
- BOQ and project costing
- Site inspection / field capture

Changing a wall, opening, floor, roof, ceiling or room should update all dependent views and quantity schedules from the same parametric model. View tabs are coordinated projections, not independent drawings.

## 2. 2D CAD drafting

- Metric-first drawing with configurable units, scale, grid, snap, orthogonal / angle constraints and coordinate readout.
- Infinite or large-format drawing board, pan, zoom, selection window, multi-select, move, rotate, mirror, copy, array, trim, extend, offset, fillet, dimension and annotation.
- Layers with visibility, lock, colour, lineweight and discipline grouping.
- Reusable symbol library: doors, windows, gates, plumbing, sanitary fixtures, electrical points, lighting, structural columns/beams/grids, furniture, landscaping and agricultural/site symbols.
- User-created blocks and saved templates.
- Drawing sheets, title blocks, revision history, drawing numbers, paper sizes, scales, drawn-by / checked-by fields and issue dates.
- Snapshots and undo/redo history.

## 3. Parametric architectural objects

Each object exposes editable parameters, constraints and material/specification metadata.

- Walls: length, height, thickness, base/top level, wall type, finish, openings, joins and alignment.
- Floors and slabs: perimeter, thickness, level, finish, slope, openings and edge conditions.
- Roofs: flat RC deck, gable, hip, lean-to and hybrid roof forms; pitch, overhang, fascia, ridge, gutters and roof covering.
- Ceilings: height, levels, bulkheads, suspended systems, coves, lighting recesses and finish.
- Doors: width, height, frame, leaf, swing direction, opening type, material and hardware.
- Windows: width, height, sill level, frame, glazing, louvre and opening style.
- Gates: width, height, swing/slide type, leaf configuration, posts and material.
- Stairs and ramps: rise, going, width, landing, headroom and slope.
- Columns, beams, foundations and structural grids as architectural coordination objects. These are not a substitute for structural engineering design or code checks.

## 4. 3D model and view system

- Orbit, pan, zoom, walk-through and selectable model elements.
- Model tree, levels/storeys, groups, hide/isolate, section box and clipping planes.
- Conceptual massing progressing to dimensioned architectural geometry.
- Live 2D/3D synchronisation: plan edits update model geometry; model edits update plan and elevations where the object supports it.
- Coordinated views: 3D conceptual, front, side, elevations, roof plan and sections.
- Material and finish library with surface colour, texture, reflectivity and roughness.
- Sun / shadow studies and camera viewpoints as a later visualisation phase.
- Explicit model quality status: conceptual, dimensioned, coordinated, or issued-for-review. Never label an unverified conceptual model as construction-ready.

## 5. Interior design

Interior workspace connected to room geometry:
- Bedrooms, kitchens, bathrooms, living areas, offices and circulation.
- Furniture, cabinetry, wardrobes, counters, sanitary ware and appliances.
- Ceiling types, lighting fixtures, switching zones and lighting layouts.
- Floor, wall and ceiling finishes; tile patterns and paint schedules.
- Room dimensions, areas, finish schedules and furniture clearances.
- Modern, contemporary, minimalist, Scandinavian, Japandi, Mediterranean, Spanish, colonial, Victorian, traditional/classic and mixed styles.

## 6. Site, landscape and field capture

- Site boundary, setbacks, north arrow, contours/levels, access, parking, drainage, landscape and external works.
- Reusable landscape, greenhouse, farm, pond, snailery and site-infrastructure symbols.
- Field measurements, photo annotations, notes, coordinates and inspection reports.
- Bluetooth laser distance-meter integration where device/vendor APIs permit.
- LiDAR scanning where supported by device hardware and platform APIs; always offer manual measurement fallback.
- Offline field records with queued sync.

## 7. Import and export

Planned import: sketch/photo/PDF underlay, DXF, supported CAD interchange, and 3D formats selected after library/compatibility review. DWG support requires a properly licensed compatible SDK or conversion workflow; do not promise unrestricted native DWG editing without it.

Planned export: PDF drawing sheets, DXF, CSV/Excel schedules, JSON project archive, image snapshots and supported 3D interchange. Export must preserve units, layers, scale and metadata where the format allows.

## 8. BOQ, measurement and cost connection

Model quantities should feed the existing ConFlow BOQ and cost manager:
- Wall areas and volumes, floor/roof areas, concrete volumes, openings, finishes, doors/windows counts and site works.
- Material, labour, plant, transport, wastage, overhead and contingency rates.
- User-editable measurement rules, waste factors, rate libraries and regional assumptions.
- Traceable quantity source: model element, formula, dimensions, unit and last modified revision.
- Manual override must be labelled and auditable.
- Drawing/model revision changes should flag affected BOQ items for review instead of silently changing an issued estimate.

## 9. Offline-first and data integrity

- Native local project database and file store.
- Autosave, explicit save, local version history and recovery after unexpected shutdown.
- Every model edit becomes a durable queued change with project ID, model revision, entity ID and idempotency key.
- When online, sync with the central service; preserve conflicting versions for review.
- No external Synaps dependency.
- Exportable local project archive and backup/restore.
- Sync state is visible: Local, Pending, Syncing, Synced, Conflict, Error.

## 10. Professional drawing output

Every drawing sheet can carry the DIMIXKOJ ENTERPRISES title block with project name, drawing title/number, scale, drawn-by, checked-by, revision, paper size, issue date and approval/signature fields. PDF print sets should include sheet numbering and a drawing register.

## 11. Safety, accuracy and compliance

- Structural, geotechnical, fire, electrical and plumbing outputs are coordination aids unless independently checked by appropriately qualified professionals.
- Display calculation assumptions, units, formula sources and limitations.
- Jurisdiction-specific code settings must be explicit and versioned; never silently infer a statutory standard.
- Nigerian-law-aware Legal & Compliance Centre: terms, privacy/data protection, licence, third-party services, professional responsibility and safety notices, and versioned acceptance/audit history.

## 12. Implementation status

The current desktop branch now contains the first CAD Studio interface, local design-document persistence, basic 2D element placement, property editing, indicative counts and a conceptual 3D placeholder.

Not yet complete: true geometric kernel, constraint solver, dimension engine, accurate multi-view projection, real parametric wall/opening/roof/floor geometry, full interior library, robust undo/redo, importers, LiDAR/Bluetooth drivers, production BOQ formulas, PDF/DXF/DWG/Excel pipelines, and model-aware conflict resolution.

The next technical milestone is to introduce a structured geometry/model layer and renderer (2D vector scene + true 3D engine), then build each parametric object against shared model entities. The current SVG mock-up must not be represented as a full CAD/BIM engine.
