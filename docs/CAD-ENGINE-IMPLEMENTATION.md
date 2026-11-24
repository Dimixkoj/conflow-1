# ConFlow 1 CAD engine implementation status

## Implemented in this iteration
- Shared parametric object records with stable IDs, metric position, length, width, height, rotation, visibility, material and layer metadata.
- Parametric starter families: wall, door, window, floor slab, roof plane, column, beam, stair, furniture, plumbing fixture, electrical point and landscape zone.
- One model drives the plan worksheet and the 3D axonometric, front, side, elevation, roof-plan and section tabs.
- Model inspector supports parameter editing, material assignment, duplication and deletion.
- Expandable side tool palettes for Architecture, Structure, Interior, MEP and Site/Landscape; model tree and preliminary take-off.
- Local save uses the existing SQLite design-document store and sync queue.
- IFC4 STEP export for the supported object families and a basic IFC STEP importer that reads supported product entities and simple extruded rectangular profiles.
- JSON model export retained.

## Important engineering scope
This is a first working geometry-engine milestone, not yet a production Archicad-equivalent CAD/BIM system. Geometry is currently represented by parametric rectangular solids and rendered by a lightweight custom canvas projection renderer. The six views are generated from the same stored object geometry, but are not yet a complete architectural drafting/projection system. Section is currently a basic orthographic view, not a user-positioned cut plane. Wall-hosted door/window void subtraction, arbitrary profiles, boolean operations, constraints, precision snapping, dimension/annotation tools, robust undo/redo, orbit/pan/zoom controls, advanced roof topology, stairs with code-compliant risers, and full MEP routing remain to be implemented.

## IFC interoperability limits
The exchange currently targets IFC4 STEP files containing the supported architectural product entities and simple rectangular extruded solids. It is not yet a full IFC schema implementation: complex placements, mapped representations, tessellated geometry, material layers, property sets, relationships beyond the basic spatial containment, IFCXML/IFCZIP, and many discipline-specific entities are not fully supported. The file picker currently accepts IFC-like extensions but the parser reads STEP text (.ifc); IFCXML and IFCZIP need dedicated readers. Validate exported files in independent IFC viewers and test round-trip geometry before using them as contractual BIM deliverables.

## Verification still required
- Run the Electron app on Windows and test all six tabs with several objects and different elevations/rotations.
- Test local save/reopen, app restart, and offline persistence.
- Test import/export round trips in at least two independent IFC viewers/BIM tools.
- Verify entity argument counts and GUID validity against IFC4 schema validation.
- Add automated geometry and IFC regression tests before production release.
