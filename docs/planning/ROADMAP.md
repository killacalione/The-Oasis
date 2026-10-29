# The Oasis roadmap and phase gates

This is the authoritative description of phase order, dependencies, deliverables and exit evidence. It contains no promised dates or completion percentages. **Structured status** in [project-status.json](../../data/project-status.json) is the only source for verified public completion; [WORK-STATE](WORK-STATE.md) records actual task-level source revisions and evidence. A phase is not complete because its document, branch or local check exists.

## Product shape

The Oasis is a persistent community hub with a central Hub, player-owned avatar and Home, a launch dashboard, community-world discovery, creation tools and eventually shared social experiences. First entry is account creation → avatar creation/selection → Hub. Returning players may resume their last confirmed exact location or choose Always Hub/Home. World creation remains a first-class destination, not the sole product. The [experience blueprint](OASIS-EXPERIENCE.md) governs these journeys.

## Phases and exit gates

| Phase | Outcome and dependency | Deliverable and acceptance gate | State source |
|---|---|---|---|
| **F0 — Existing foundation** | A consolidated, traceable public project exists before app development. | Preserve meaningful differences and provenance; public Git and contribution workflow; protected PR checks; curated Pages progress; local/Desktop remote link evidence. Verify the deployed revision and source records separately. | F0 row in structured status; bootstrap evidence in [VERIFY](../../VERIFY.md). |
| **F1 — The Oasis definition** | The product and contributor path are understandable without chat history. Depends on F0. | Canonical experience blueprint; stable requirement/decision traceability; phase task IDs and evidence gates; aligned architecture/data/security/testing and portable handoff; The Oasis branding; existing repository renamed in place; local remote and Pages base migrated; protected workflow and live revision verified. No application services are started. | F1 row in structured status and active task in [WORK-STATE](WORK-STATE.md). |
| **LV1 — Private LAN visitor pilot** | Owner-authorized 2026-10-26 after F1, before the full creator proof. | Desktop browsers, 2–5 invited adults, original Hub/island/observatory, avatar colors, authoritative shared presence/travel and acknowledged SQLite saves. Verify modified-client denials, crash/restart, backup restoration, two physical computers, renderer behavior and a full 24-hour run. No public application service. | [LAN pilot runbook](LAN-PILOT.md), LV1 structured status and actual evidence in WORK-STATE. S1/S2 stay planned. |
| **S1 — Internal local proof** | Exercise the most uncertain visitor and creator loop before online services. Depends on F1 scope and a bounded tested stack. | One versioned World SDK/project contract in local tools and browser editor; editor source/diagnostics/logs/Run/Stop/import/export/validation; hostile guest interpreted-runtime containment; two original worlds; local Hub/dashboard, profile/avatar/Home and visibility request; personal customization; exact saved-location/portal travel/return/reload/export/import; explicit recovery. No real accounts, public deployment, uploads, child-data collection or online grants. Acceptance must pass in the actual supported desktop environment and report unavailable devices honestly. | S1 structured status stays planned until its required source/runtime/tests are actually complete. |
| **S2 — Accounts and shared core** | Convert local identity and spaces to authoritative online records. Depends on S1 contracts and separate privacy/security/product gates. | Stage A: select and test identity provider, profile/appearance ownership, durable confirmed location, Home ownership and migration/deletion/export. Stage B: eligible world discovery and authoritative shared Hub/rooms/text. Changed-client, access denial, duplicate/replay, live revocation and recovery tests prove permissions. Preserve first-Hub/return rules and avatar ownership across world transitions. | Separate evidence for account/persistence and multiplayer/access; do not make account sign-in imply multiplayer is complete. |
| **S3 — Proximity and party voice** | Add the already-required world and persistent-party voice routes. Depends on S2 membership, eligibility and text/room authority. | Prove capture/mute lifecycle, world-versus-party routing, authorized recipients, proximity behavior, travel/reconnect, block/revocation and forbidden-delivery behavior with changed clients. Show the outgoing route. Record quotas, device/codec gaps and no-recording defaults. | Voice-specific tests, actual provider behavior and operational controls. |
| **S4 — Trusted world publishing** | Let authorized creators release compatible worlds directly without a routine per-release human queue. Depends on versioned SDK/runtime, identity, access policy and moderation/rollback operations. | Validate source/schema/assets/provenance/capabilities/budgets/compatibility on both authoring paths; immutable release IDs; current ownership/trust grants; direct release; rollback, delist, quarantine and revocation; no creator or guest can self-grant. Prove releases and denials with real service tests. | Publishing/security/rights evidence; a checklist or local validator alone is not trusted service readiness. |
| **S5 — Public worldwide readiness** | Operate the intended worldwide, all-age public product. Depends on every required feature above and actual region-by-region readiness. | Evidence-backed country/age/guardian/contact and privacy policy; accessibility and device coverage; content/rights and abuse reporting; staffed moderation/incident/appeal/deletion operations; provider, budget and sustainable payer; security and legal review. No global-ready claim from a checkbox, synthetic tests or local prototype. | Public-release and global-readiness registers plus human operator/legal review; blocked until every launch gate is evidenced. |

## Continuous presentation across phases

R-027/D-044 apply across future world-runtime phases: keep the source playable during authorized destination preparation, separate readiness from admission and durable commit, and prove continuous presentation with bounded resources. Include this lifecycle in S1's SDK/runtime contract before adding asset-heavy creator worlds. LV1's fast bundled scene switches and the separate beginner workshop do not complete this general requirement or any S1/S2 gate.

## Stable task IDs

Keep these IDs stable when work moves between issues, branches, contributors or clients. Record the active ID and one writer in [WORK-STATE](WORK-STATE.md). Add tasks with prerequisites, observable acceptance, evidence owner and explicit authorization gate before starting a phase. Split a task when the evidence or authority boundary differs; do not inflate status.

| ID | Bounded task | Prerequisite / exit evidence |
|---|---|---|
| F0-T01 | Consolidate source and preserve provenance | Verified merge report, legacy crosswalk and input archive hashes |
| F0-T02 | Establish public repository and contribution rules | Verified repo, license, conduct, governance, security reporting and PR checks |
| F0-T03 | Publish evidence-led foundation site | Main validation/deployment and matching live revision |
| F1-T01 | Establish The Oasis product/experience decisions | Owner rules trace to requirements and append-only decision entries |
| F1-T02 | Align roadmap, domain boundaries and contributor handoff | Cross-document consistency check; next task is runnable from files alone |
| F1-T03 | Migrate existing repository and Pages identity in place | History/protection preserved; new remote, workflow, base path and live source verified |
| F1-T04 | Close foundation evidence and status | Required check/build, link/consistency/accessibility review, deployed live revision and accurate structured status |
| LV1-T01 | Pin and build the bounded visitor runtime | Node24, TypeScript, Babylon, modular Colyseus and SQLite integration; original scenes and accessible controls |
| LV1-T02 | Enforce one five-client session and confirmed persistence | Authenticated test profiles, authority/denial/duplicate cases, exact resume, process restart and restored backup |
| LV1-T03 | Verify the LAN pilot and operating limits | Browser/resource evidence, two physical computers, host conditions and 24-hour recorded run; no public-service claim |
| S1-T01 | Inspect environment; compare and pin bounded spike stack | Exact current primary docs, available dependencies/devices, choice and limitations recorded |
| S1-T02 | Define one versioned SDK/project contract and dual-authoring flow | Local and integrated editor bundles validate and reopen equivalently |
| S1-T03 | Contain guest scripts and bound the host/renderer bridge | Real hostile cases; independent stop/termination; queues, commands and resources measured |
| S1-T04 | Build the two original journey worlds and shared immutable contract | World A → approved personal changes → World B interaction → return; provenance recorded |
| S1-T05 | Demonstrate local onboarding, Hub/dashboard, avatar and Home | New local profile first enters Hub; dashboard works; Home selection/visibility intent is local; world cannot overwrite appearance |
| S1-T06 | Persist exact resume and recover local personal state | Version/frame/X-Y-Z/facing/confirmed revision; save/reload/export/import; failure keeps last good state |
| S1-T07 | Verify browser interaction and resource lifecycle | Keyboard/reduced motion, failure/repeated travel, disposal, memory/renderer budgets in actual device; gaps named |
| S2-T01 | Select and validate account/profile storage contracts | Provider decision, consent/data map, security and export/deletion evidence |
| S2-T02 | Enforce avatar ownership, Home and exact location server-side | Changed-client tests; current version, compatibility, authorization and recovery evidence |
| S2-T03 | Enforce eligible discovery and world/Hub access | Audience rules, changed-client denial, revocation, blocks and no protected leakage |
| S2-T04 | Operate shared Hub/rooms and text | Membership, history/retention, moderation, reconnect, rate and forbidden-delivery tests |
| S3-T01 | Implement explicit mic/route lifecycle | Actual browser/device/provider lifecycle and world/party continuity evidence |
| S3-T02 | Prove proximity, party and access-scoped voice | Near/far, travel, block/revoke, same-peer suppression, hostile-client forbidden-delivery evidence |
| S4-T01 | Validate community world submissions and compatibility | Asset/source/capability/resource/rights validation on both authoring paths |
| S4-T02 | Operate trusted direct release and response controls | Current grants, direct release, rollback/quarantine/delist/revoke drills and owner coverage |
| S5-T01 | Complete region and age/guardian/communication readiness | Current human/legal-reviewed country register, actual provider/data flows and access tests |
| S5-T02 | Prove accessibility, operations and sustainable public capacity | Representative device/assistive-tech checks, staffed incidents, appeals, budgets and operator readiness |

Task IDs specify work, not authorization to perform it. Application tasks start only when the owner scopes/authorizes that phase; high-risk online features retain their own approval gates.

## Later backlog

AI personas and memory, economy/payments, pets, federation, native clients and XR remain visible as later product exploration. None has a phase date, selected architecture or authority to collect data, charge users or publish a service. Each needs a separate requirements, rights, safety, cost and operating decision before implementation.

## Research and confidence

The owner’s product direction and original R-001–R-023 record are **Requirements**; revised arrival and Hub rules are **Requirements recorded 2026-10-15**. The local/static foundation and existing Git/Pages workflow are **Verified** only to the revisions and checks in [VERIFY](../../VERIFY.md). The exact account provider, online storage, renderer/editor/runtime, avatar format, world discovery/ranking, visibility semantics, eligibility process, country coverage, operations staffing and budget are **Proposed or Unknown**. No primary documentation search establishes actual runtime security, real-user age, global legality or community demand.

Research source notes include [repository rename behavior (S105)](../research/SOURCES.md#s105), [Pages publishing behavior (S106)](../research/SOURCES.md#s106), [GitHub Desktop remote update (S107)](../research/SOURCES.md#s107), [consistent navigation (S108)](../research/SOURCES.md#s108) and [browser save lifecycle (S109–S110)](../research/SOURCES.md#s109). Recheck volatile platform behavior at the relevant phase; preserve the observed command/result rather than relying on an old note.
