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


## Separate Presentation Studio and environmental / durability controls

The application now separates Technical CAD from Presentation Studio. Both views use the same live model document; the presentation canvas is moved between workspaces rather than cloning or modifying the underlying CAD geometry. Technical CAD retains the drawing/model workflow, while Presentation Studio provides a clean client-visualisation canvas.

Presentation controls include Draft/Balanced/High quality, weather/season appearance presets (clear, rain, snow, winter, summer, sunrise and sunset), studio/daylight/golden-hour lighting, solar azimuth (degrees), solar elevation (degrees), exposure, environment reflection strength, and a real-time contact-shading approximation. Rain/snow particle effects and wet/snow ground appearance are visual previews, not meteorological simulations or local weather forecasts. Solar azimuth/elevation are direct scene-light controls; they are not yet calculated from project latitude, longitude, date, timezone or a surveyed north orientation.

The studio accepts user-supplied image texture maps for selected architectural materials, downscaled to a maximum 2048-pixel edge and saved inside the local project document. This gives designers a route to use licensed real-world albedo/base-colour textures. Procedural starter textures remain available. Full PBR workflows still need separate normal, roughness, metallic, displacement and ambient-occlusion maps, physically calibrated UV mapping, manufacturer material library, true screen-space or ray-traced AO, path tracing/global illumination, denoising and render farm/offline output. This milestone is a real-time presentation upgrade and is not equivalent to V-Ray, Enscape or Lumion output quality.

Roof geometry has additional ridge/eaves/fascia detail, window geometry includes more frame/sill/mullion detail, and landscape zones include deterministic procedural tree/shrub placeholders. These are visual placeholders, not manufacturer-grade component families or horticultural specifications.

### 10–20 year service-life screening — safety boundary

The Presentation Studio includes a conceptual maintenance-screening panel for 10, 15 or 20-year horizons. Inputs include occupancy/use intensity, exposure category (sheltered, normal, coastal/salt, wet/high rainfall, harsh heat/UV), maintenance quality and a user-entered observed condition rating for key model elements. It produces a transparent scenario index, attention category and suggested inspection/maintenance review year by model element. Assumptions and the explicit limitations notice are displayed with the results.

This feature is NOT finite-element analysis, structural load or pressure calculation, wind/rain load analysis, fatigue analysis, reinforcement/corrosion model, code check, remaining-life prediction, or a declaration that any element is strong, weak, safe or unsafe. Occupancy is a scenario input only; actual imposed loads must come from occupancy type, use class, code and engineer's design basis. The screening formula is heuristic and cannot predict structural performance or failure. Structural adequacy requires complete structural drawings, material strengths and tests, reinforcement details, geotechnical data, loads and combinations, exposure assumptions, inspection records and a validated analysis by a licensed structural engineer under applicable Nigerian standards. Do not use these screening outputs for design approval, occupancy approval, insurance, tender certification or construction decisions.

The PNG export also offers 1×, 2× and 3× supersampled output (subject to device memory/GPU limits). This increases pixel dimensions from the viewport render; it is not a substitute for offline path tracing.


## Professional presentation and analysis integration milestone

### PBR material channels
- Presentation Studio now accepts per-material **albedo/base colour, normal, roughness, metallic and displacement/height** texture channels.
- Imported images are converted to WebP and capped at a 2048-pixel maximum edge before being embedded in the local project model.
- Normal, roughness, metallic and displacement maps are treated as non-colour data; albedo maps use sRGB.
- Material channels are loaded into Three.js physically based MeshStandardMaterial / MeshPhysicalMaterial properties.
- Displacement is currently a basic shader/material channel and may have limited visible effect on low-subdivision architectural primitives. UV calibration, texture scale controls, tangent-space validation, high-density tessellation and a manufacturer-verified PBR catalogue remain future work.

### Lighting, detailed assets and rendering
- The renderer uses Three.js physically based materials, a PMREM RoomEnvironment image-based environment, directional sunlight, hemisphere fill, shadows and emissive point-light fixtures for interior lighting.
- Added more detailed parametric bed, sofa, table, wardrobe and cabinet forms, plus a simple emissive light fixture object. These are starter asset families, not a full furniture/lighting manufacturer library.
- The render queue stores named camera/view snapshots and exports them sequentially as PNG files at the selected supersampling scale.
- **Important renderer boundary:** the queue is currently a WebGL real-time capture queue. It is not an offline path tracer, and no true path-tracing denoiser, multi-bounce global illumination, physically accurate caustics or V-Ray/Enscape/Lumion integration is included yet. Current contact shading is an adjustable lighting/shadow approximation, not a screen-space AO render pass. The app must not advertise this milestone as V-Ray-equivalent.
- A future renderer adapter should support a native/offline path-tracing backend, progressive accumulation, denoising, render farm execution, render presets and export of camera/material/light packages without altering the technical CAD model.

### Structural analysis integration boundary
- Added `renderer/structural-analysis-bridge.mjs`, a solver-neutral exchange contract that exports analytical member geometry and an explicit list of solver-required inputs.
- Added import validation for external member results with solver name/version, analysis date, units, design code, engineer metadata, CAD member IDs, status, utilisation and governing combination.
- This is an **integration bridge only**. It does not calculate loads, load combinations, structural actions, member capacity, reinforcement, buckling, deflection, foundation bearing, fatigue or deterioration. It does not verify an external solver's mathematics or certify the engineer's model.
- The exchange intentionally requires the external solver and licensed engineer to define connectivity, restraints, sections, materials, reinforcement, geotechnical parameters, actions and code-specific combinations. Applicable Nigerian Standards and the adopted code / National Annex must be confirmed for each project.
- Imported PASS/FAIL/REVIEW values are displayed as solver-reported results and are not independently endorsed by ConFlow. Signed design checks and professional review remain mandatory.

### Automated checks
- `tests/structural-analysis-bridge.test.mjs` covers exchange package creation, metadata/result validation, unknown member rejection and invalid status rejection.
- Run all tests with `npm test`.


## Controlled project model, analytical idealisation and offline-render adapter

### One controlled project model
- Added `renderer/project-governance.mjs` with a shared project schema, revision chain and independent workflow approvals for technical CAD, Presentation Studio, quantity surveying / BOQ and structural engineering.
- Approvals record approver, role, timestamp, notes and the exact model revision. A subsequent model edit increments the revision and marks prior approvals stale.
- This is an in-app workflow record, not a cryptographic signature, identity-provider verification or statutory professional certification. Access control and server-side immutable audit storage are future work.

### Structural analytical idealisation
- Added `renderer/analytical-model.mjs`. CAD beams and columns are idealised as frame members with centre-line end nodes; nearby coordinates are merged using a configurable geometric tolerance.
- Slabs and walls are represented as shell regions; foundations are represented as foundation regions. These are not yet meshed finite elements.
- The analytical package records source CAD IDs, dimensions, material placeholders, member connectivity, units, restraints, load cases, combinations and explicit missing-input warnings.
- The current builder does not infer supports, soil springs, diaphragm constraints, releases, effective lengths, reinforcement, load magnitudes, code factors or design combinations. Load case and combination labels entered in the interface are identifiers/descriptions only; they do not contain calculated load patterns or factors.
- A geometry/connectivity validation pass checks source references, frame-node links, unassigned restraints, material grades and missing load case / combination entries.
- The existing external solver result importer remains an exchange validator. ConFlow does **not** execute a finite-element solver or independently calculate member forces, utilisation, deflection, stability, reinforcement or foundation capacity in this milestone. A solver adapter and licensed structural engineer must validate analytical idealisation, meshing, loads, code settings and signed results before design use.

### Offline renderer adapter
- Added `renderer/offline-render-adapter.mjs` to export a renderer-neutral job manifest containing the controlled project ID and revision, CAD scene, embedded material maps, camera and environment settings.
- External render results can be matched to the original job and project revision using a provenance schema.
- This separates the offline-render backend contract from the current WebGL real-time viewport. No offline path tracer, denoiser or external renderer binary is bundled or executed by this milestone.

### Test coverage
- `tests/project-architecture.test.mjs` tests approval invalidation, required approver metadata, frame node/member generation, missing analytical inputs, source-member validation and offline render job provenance.
- Run `npm test` to execute all tests.


## Workforce, site reporting and company communication

### Staff and labourer profiles
- Added a People & Site workspace with staff directory records: full name, company position, access-role label, employment type, phone, trade / skill and active status.
- The selected staff profile is shown in the application header and linked to site reports and group messages.
- Role labels include labourer, site supervisor, project manager, quantity surveyor, architect, engineer, staff and company admin.
- Current implementation is a local staff register, not verified authentication or secure role-based authorisation. Production deployment must connect employee identity to sign-in, company-managed invitations, role-based access control and audit logs before confidential data is shared.

### Site reports and field feedback
- Site reports are linked to a project and registered staff member and capture work activity, location, percentage progress, site summary, issues, action required and attachments.
- Attachments are stored with the local report record and enter the existing sync queue for the configured company endpoint.
- Site feedback appears immediately in the local project feed. Cross-device live updates require a configured backend/realtime service and are not active by default.

### Managed group chat
- Added company general, site supervisors and project-specific team channels.
- Messages are attributed to the selected staff profile, stored offline-first and queued through the existing company sync transport.
- The present implementation is a local message queue; it is not yet a realtime multi-device chat server. Delivery, read receipts, moderation, retention and membership controls require a backend service.

### WhatsApp work-record submission
- Staff can manually choose a WhatsApp-exported text file, associate it with a project and staff profile, confirm permission to share, and submit it for company review.
- Site report summaries can be opened in WhatsApp using a prefilled share link.
- ConFlow does not scrape personal WhatsApp accounts, intercept private messages or read chat history in the background. Direct integration requires the official WhatsApp Business Platform / Cloud API, a verified business setup, approved permissions and webhook/backend configuration. Personal chats must remain staff-controlled and unrelated personal or sensitive content should be removed before submission.
- Selected WhatsApp exports and site report records are queued for the configured company sync endpoint. No endpoint is configured by this milestone unless the company has separately supplied one.

### Privacy and compliance controls
- Staff must be informed about what work data is collected, why it is processed, who can review it and how long it is retained. Obtain appropriate consent / lawful basis and provide correction and access procedures under applicable Nigerian data-protection requirements.
- Do not use this local role selector as proof of identity or authority. Secure login, server-side access checks, encryption, retention/deletion controls and company audit trails remain mandatory production work.
