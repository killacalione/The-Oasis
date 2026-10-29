# Sources, versions and evidence labels

Reviewed 2026-10-26. Implementation explanations are grounded in the frozen pilot [753ba4ffe15394f96f2dbbb6811d0fe20fee1522](https://github.com/killacalione/The-Oasis/tree/753ba4ffe15394f96f2dbbb6811d0fe20fee1522), not inferred from a framework advertisement. The workshop is a new educational derivative with separate checks. Official documentation informed the earlier source review through Context7 and primary-source browsing; documentation describes APIs, not evidence that this application passed a test.

## Labels used throughout the package

| Label | Meaning |
| --- | --- |
| Source fact | Behavior directly present in the identified code |
| Recorded verified evidence | A command/runtime result recorded for its own revision and environment |
| Requirement | Product behavior selected by the owner |
| Proposed/future | An approach or capability not yet established by implementation evidence |
| Unknown/unverified | Evidence is missing; do not fill the gap with an assumption |

## Frozen implementation and planning references

- [Shared contracts](../../../pilot/shared/contracts.ts) and [world definitions](../../../pilot/shared/worlds.ts): field shapes, versions, coordinates, valid locations and movement.
- [Browser controller](../../../pilot/client/app.ts), [navigation](../../../pilot/client/navigation.ts) and [world renderer](../../../pilot/client/world-view.ts): arrival, inputs, scene lifecycle and portal behavior.
- [HTTP service](../../../pilot/server/index.ts), [room](../../../pilot/server/room.ts) and [store](../../../pilot/server/store.ts): routing, admission, simulation, commit ordering and storage.
- [Launcher](../../../pilot/scripts/Start-Pilot.ps1), [supervisor](../../../pilot/scripts/supervise.mjs), [administration](../../../pilot/server/admin.ts) and [soak harness](../../../pilot/scripts/soak.mjs): operation and measurement boundaries.
- [Native tests](../../../pilot/tests/integration.test.ts) and [browser checks](../../../pilot/scripts/browser-test.mjs): what the reference suite exercises.
- [Current work ledger](../../planning/WORK-STATE.md), [LAN pilot runbook](../../planning/LAN-PILOT.md), [requirements](../../planning/REQUIREMENTS.md), [decisions](../../planning/DECISIONS.md) and [roadmap](../../planning/ROADMAP.md): acceptance, provenance and future scope.

The ledger records 18 native/integration and 18 browser checks for the interaction-corrected pilot. Browser performance used Chromium 153.0.8010.12 and SwiftShader software rendering at 1280×720, with a measured median around 60 FPS. This is neither physical-GPU certification nor measured portal-transfer latency. No new test result is implied by this source list.

The public information-site release record reported `9dfc8f18c89c876fccbb4fbf2ac5bafed89ee75d` at the teaching-plan inspection. The playable branch and local preview are separate release surfaces. The original 24-hour synthetic run used `ce0edb915efd8e08543412304604fd238682c723` and was pending at that inspection. Consult current evidence for later status; never copy an old pending/passed statement into a new revision's report.

The classroom installs pinned Express 5.3.0 for the Colyseus transport compatibility dependency. Its application routes still use native Node HTTP. The classroom lockfile must work independently of dependencies installed in the full pilot checkout.

## Exact course/toolchain pins

| Component | Pin |
| --- | --- |
| Node | 24.22.1 |
| TypeScript / Node type definitions | 6.0.2 / 24.10.1 |
| Babylon core | 9.32.0 |
| Colyseus core / SDK | 0.18.10 / 0.18.6 |
| Colyseus schema / WebSocket transport | 5.0.8 / 0.18.2 |
| esbuild / Playwright | 0.28.2 / 1.63.0 |

Retain the lockfile as well as top-level version pins. The full pilot also installs Express 5.3.0, but native Node routing is the actual application implementation. The workshop need not add an unused Express abstraction to explain HTTP.

## Primary reading

| Topic | Official source | Why it matters |
| --- | --- | --- |
| JavaScript foundations | [MDN JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) | Values, functions, objects, modules and asynchronous work |
| TypeScript types | [TypeScript basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types) | Type annotations are erased; runtime validation still matters |
| Bundling | [esbuild TypeScript content](https://esbuild.github.io/content-types/#typescript) | Transforming source and checking types are separate operations |
| Rendering | [Babylon documentation](https://doc.babylonjs.com/) | Engine, scene, camera, meshes, materials and lifecycle |
| Prepared assets | [Babylon asset containers](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/importers/assetContainers.md) | Manage loaded content separately from active scene contents |
| State synchronization | [Colyseus state](https://docs.colyseus.io/state) | Server mutation and client state patches |
| Persistence | [Colyseus database guidance](https://docs.colyseus.io/database) | Durable application storage is separate from synchronized room state |
| Browser transport | [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) | Persistent two-way communication |
| Pointer lock | [MDN Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API) | Real browser lock state, user gestures, denial and release |
| Node SQLite | [Node 24 API](https://nodejs.org/docs/latest-v24.x/api/sqlite.html) | Synchronous database operations and backup API |
| Database snapshots | [SQLite backup API](https://www.sqlite.org/backup.html) | Consistent online copying and its limits |
| Browser verification | [Playwright contexts](https://playwright.dev/docs/browser-contexts), [browser binaries](https://playwright.dev/docs/browsers) | Isolated storage and version-matched test browsers |
| Static publication | [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | Static-site hosting is separate from a running multiplayer server |

Documentation can evolve after the course pins. Prefer the course source and installed package declarations for exact syntax, and re-resolve current primary documentation before changing versions. No library documentation establishes production security, physical device coverage, actual participant eligibility or global compliance.
