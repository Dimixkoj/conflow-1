# ConFlow 1 CAD/BIM and Android milestone

## Implemented
- Three.js WebGL model viewport with orthographic projections and interactive OrbitControls for orbit, pan and zoom.
- Parametric metric objects with editable position, dimensions, rotation, material, visibility, layer and host relationships.
- Rectangular wall CSG subtraction for hosted doors and windows, plus visible door/window objects.
- Shared model drives 2D plan, 3D, front, side, elevation, roof plan and section. Section uses a movable clipping plane; orthographic views show basic model-derived dimensions.
- Grid snapping, nearby object-edge snapping, object picking, undo/redo, mirror, duplicate/offset and starter length-based trim/extend controls.
- Roof starter profiles: flat, gable, hip and skillion; stair flights; beds, sofas, tables, wardrobes, kitchen cabinets, furniture, plumbing, electrical and landscape objects.
- IFC4 STEP export/import subset with spatial containment, ConFlow property sets, IFCDOOR/IFCWINDOW fill elements, IFCOPENINGELEMENTs, void/fill relationships and material/layer parameters.
- A programmatic IFC export/import round-trip test passed for a wall and hosted door, including restored host relationship and material.
- Capacitor 7 Android wrapper configuration, IndexedDB local-storage fallback, service-worker caching and an Android debug-APK GitHub Actions workflow.

## Android test APK
The workflow is `.github/workflows/android-apk.yml`. On a successful run it uploads an artifact named `ConFlow-1-Android-debug` for 30 days. Open the [Android workflow page](https://github.com/Dimixkoj/conflow-1/actions/workflows/android-apk.yml), select a successful run and download its artifact.

## Limits and verification
This is an engineering prototype, not a certified or production-ready BIM/CAD application.
- CSG openings currently use rectangular cutters through rectangular wall solids. Curved walls, compound wall layers, complex junctions and arbitrary profiles are not supported.
- The selected CSG library describes itself as experimental and warns numerical corner cases can produce non-manifold output. Geometry must be independently checked before construction use.
- Trim/extend currently adjust object length in increments; they are not full intersection-aware CAD operations. Mirror is a basic world-axis mirror.
- Dimensions are starter model-derived annotations, not a complete professional dimensioning/printing system.
- Roofs and stairs are starter parametric families; complex roof junctions, code-checked stair design, handrails and structural detailing remain outstanding.
- IFC is a constrained IFC4 subset, not complete schema support. Validate with independent IFC validators and BIM tools before contractual use.
- The APK workflow is committed but no successful APK build or physical Android installation has yet been confirmed. Windows, Android WebView/WebGL, offline restart, CSG stability and independent IFC round-trip testing remain to be verified.

## Build commands
```bash
npm install
npm run build:web
npm run start:conflow
```

The Android workflow runs `npm install`, `npm run build:web`, `npx cap add android`, `npx cap sync android`, then `./gradlew assembleDebug`.
