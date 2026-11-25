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


## Expanded architectural materials, geometry and measurement rules

The structural toolbox now includes a parametric pad footing. The material selector has been expanded with concrete, blockwork, timber species/finishes, glass, steel, aluminium, stainless steel, ceramic tile, porcelain, marble, granite, brick, plaster, paint, gypsum board, carpet, asphalt, sand, soil, waterproofing and insulation. Procedural material textures use deterministic seeds so the same finish does not randomly change every time the model is rebuilt.

Architectural geometry has been refined with a framed and panelled door leaf, hardware detail, stair handrails and starter pad-footing/blinding geometry. These are presentation-level starter components; they are not fabrication or structural shop drawings.

### Expanded model-linked measurement rules

| Model object | Generated BOQ lines |
|---|---|
| Wall | Net blockwork area, nominal block count, wall core volume, plaster to both faces, paint area to both faces |
| Slab | Concrete, soffit formwork, floor finish area, assumed 50 mm screed, edge formwork |
| Roof | Sloping roof covering and underlay areas based on pitch |
| Column | Concrete and four-side formwork |
| Beam | Concrete and soffit plus two-side formwork |
| Pad footing | Concrete, excavation with stated working-space allowance, 50 mm blinding and side formwork |
| Landscape | Surface area and assumed 150 mm topsoil |
| Doors/windows/stairs/fixtures | Count-based measurement lines |

The new measurement rules are isolated in `renderer/quantity-takeoff.mjs` and have unit tests in `tests/quantity-takeoff.test.mjs`. Run `npm test` to execute them. The Windows and Android build workflows now run this test suite before packaging.

### Measurement assumptions and exclusions

The 450 × 225 mm block face, 5% block allowance, 50 mm screed, 150 mm topsoil, 300 mm working space around pad footings, 150 mm excavation depth allowance and 50 mm blinding are explicit starter assumptions. Edit or remove generated lines to suit the specification and actual site conditions. The system does not yet calculate reinforcement schedules, bar bending schedules, detailed excavation support, stepped/combined/strip/raft foundations, wall junction deductions, complex roof coverings, measured openings deductions for all finish layers, stair concrete, labour outputs or complete NRM/SMM/standard method measurement rules. No structural member sizing or reinforcement design is implied.

All quantities remain subject to review by the quantity surveyor/engineer and applicable Nigerian project specifications and standards before tender, payment or construction.


## Construction Measurement and Estimating Engine — milestone implementation

The BOQ now has a trade-oriented structure with dedicated sections for preliminaries, substructure, superstructure, roofing, finishes, electrical installations, plumbing installations, mechanical installations, external works, furniture/equipment, provisional and prime cost sums, and unclassified/QS review items. Section totals feed a trade collection page and a grand summary. Manual lines can be allocated to a trade; CAD-generated lines are assigned by measurement code and model object type.

A project can select an NRM2-oriented or POMI-oriented work-section profile. This is a configurable classification and document structure, not a claim of full compliance with either copyrighted measurement standard. A qualified QS must apply the adopted edition's detailed rules, preambles, item coverage, deductions, descriptions and units. The software does not reproduce licensed standard text.

Each line supports a specification, working-drawing reference, source CAD object, measurement basis/dimension sheet, editable quantity, waste percentage, pricing type and QS verification state. CAD dimension sheets currently show the model object's length, width and height plus the generated formula/basis; they do not yet derive a complete drawing dimension paper, grid/level references or every opening/junction deduction. Manual items should carry a drawing reference and checked dimensions before tender issue.

Measured rate build-up now separates labour, materials, plant, overhead and profit. Material waste is applied to the material component only and displayed separately from the measured quantity. PC and PS items have separate amount entry and a dedicated trade section rather than being disguised as measured quantities. An explicit legacy unit-rate override is retained for older BOQ records; it should be replaced by a documented build-up before tender.

### Professional verification boundary

Current model take-off remains a developing rules engine. It does not yet provide complete NRM2/POMI measurement clauses, a full dimension paper with squaring sheets, automatic drawing-sheet extraction, reinforcement tonnage/BBS, comprehensive services measurement, full excavation/earthworks, or every deduction and deemed-to-be-included rule. Market rates are not automatically verified against current Jos, Lagos or other Nigerian supplier/contractor quotations. No current market price is represented as authoritative. QS review, current quotations and project-specific specifications remain mandatory before issue for pricing.

Tests: npm test now includes the original CAD take-off tests and the new trade classification, rate build-up, PC/PS and dimension-sheet tests.


## 3D Presentation Studio — photorealistic presentation foundation

The CAD viewport now has a presentation-mode switch that removes technical grid/axis overlays and uses a clean architectural backdrop, a generated studio environment map, physically based environment reflections, improved daylight/fill/rim lighting, ACES filmic tone mapping, soft shadows, and upgraded PBR material response for timber, masonry, stone, metals and glass. The presentation controls expose Draft/Balanced/High quality, Daylight/Golden Hour/Studio lighting, exposure adjustment and PNG capture of the current 3D viewport.

This is a rendering-quality foundation, not a claim of V-Ray/Lumion/Enscape-equivalent photorealism. Current materials are procedural starter textures; high-resolution manufacturer textures, detailed normal/roughness maps, vegetation and entourage libraries, advanced global illumination, denoising, render queues and high-resolution offline rendering remain future work. Final image quality depends on model detail, device GPU and selected quality mode.
