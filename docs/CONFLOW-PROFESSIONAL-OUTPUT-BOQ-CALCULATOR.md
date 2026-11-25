# ConFlow 1 — Professional Interface, BOQ and Calculation Output

**Product owner:** Dimixkoj Enterprises  
**Scope:** Professional title page, model-linked BOQ, construction calculators and improved 3D presentation.

## Delivered interface changes

- A ConFlow-branded cover/overview page with Dimixkoj Enterprises identity, product positioning and direct entry to design.
- Separate BOQ & Costing and Calculators navigation pages.
- Consistent, compact navigation and responsive layouts for desktop and mobile.
- No Archicad connection or external Archicad branding is required for the ConFlow workspace. The interface remains ConFlow-owned.

## CAD-linked BOQ

The BOQ is generated from the current shared CAD model. Each generated line retains a source object ID and refreshes when the model changes. Supported take-off rules in this milestone:

| CAD object | Quantity basis | Unit |
|---|---|---|
| Wall | Length × height, less hosted door/window opening areas | m² |
| Floor slab | Length × width × thickness | m³ |
| Roof | Plan area adjusted by roof pitch (flat roof uses zero pitch) | m² |
| Column / beam | Length × width × height | m³ |
| Door / window | Object count | No. |
| Stair flight and interior fixtures | Object count | No. |
| Landscape zone | Length × width | m² |

The BOQ page supports editable descriptions, units, quantities, waste allowances, rates, contingency, project/client details, notes and print/PDF output. Manual BOQ rows are supported. Quantity overrides are retained when refreshing from CAD. BOQ metadata and rows are stored with the local design document.

## Construction calculators

- Rectangular area
- Rectangular volume
- Nominal concrete material estimate for 1:2:4 and 1:1.5:3 mixes, using a 1.54 dry-volume factor and 50 kg cement bags
- Blockwork count using a nominal 450 × 225 mm block face and a 5% allowance

Each calculator result displays its formula and assumptions and has a separate print-sheet action.

## 3D presentation

- Higher quality WebGL settings: antialiasing, high-performance preference, sRGB output, ACES filmic tone mapping, soft shadows, higher-resolution shadow maps and a three-light setup.
- Procedural surface textures for timber, tile, brick/blockwork and general finishes.
- More detailed starter geometry for beds, sofas, tables, wardrobes, cabinets, plumbing/electrical fixtures, columns and beams.
- Existing orbit, pan, zoom and shared-model view system retained.

## Important measurement and visualisation limits

These are first-stage quantity rules, not a complete professional measurement standard. Wall deductions currently apply to hosted openings only. Wall junctions, deductions for intersecting elements, multiple wall layers, complex roof intersections, finish build-ups, reinforcement schedules, wastage standards and full NRM/SMM measurement rules are not yet implemented. Concrete mix estimates are nominal planning estimates, not a structural mix design. All quantities, rates, material assumptions and calculations must be checked by a qualified construction professional before tender or construction use.

The 3D textures and component details improve presentation, but they do not make the current geometry kernel a complete BIM authoring or photorealistic rendering engine. Lighting, textures and object geometry still require broader device and model QA.

## Build and test

The Android debug APK and Windows installers are built by GitHub Actions. A successful workflow run and uploaded artifact are required before describing an installer or APK as ready for download.
