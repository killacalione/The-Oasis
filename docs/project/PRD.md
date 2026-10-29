# Product requirements

Updated 2026-10-26. **Requirement** records owner intent; **Verified** requires dated implementation evidence; **Proposed** is a candidate; **Unknown** is unresolved. F1 is verified. A bounded private LV1 visitor pilot is implemented; its remaining acceptance gates and full S1/S2 scope are separate.

## Product intent

**The Oasis is a persistent community hub connecting people to a central Hub, player-owned identity and personal Home, community-made worlds, customization and code-based creation.** People may discover and visit worlds made by others or create worlds of their own; visiting does not require programming. World making remains important without defining the entire product. The owner selected The Oasis as the product name on 2026-10-15; RPO HUB is retained as the former name in historical records. See the canonical [experience blueprint](../planning/OASIS-EXPERIENCE.md).

## Required arrival and ownership behavior

- **First arrival:** create an account, create or select an avatar, then first spawn in the Hub with the dashboard available. Direct links, a Home preference or dashboard access cannot skip the first Hub arrival. Future account/system work remains unimplemented.
- **Returning arrival:** Resume the last confirmed exact location by default. After first arrival, permit **Resume**, **Always Hub** or **Always Home**. Home must exist before Always Home can be selected. The dashboard remains readily available from each destination.
- **Exact resume:** preserve immutable world/version reference, coordinate frame, exact X/Y/Z, facing and confirmed save revision. Validate current access, version compatibility, appearance support and coordinates before entry. On failure preserve the saved record and offer Retry, Hub and Home where it exists.
- **Avatar ownership:** the player controls avatar and outfit. World code cannot silently substitute, strip or overwrite the selection. Block entry or ask the player explicitly if a world cannot support the chosen appearance.
- **Continuous world presentation (R-027/D-044):** prepare an authorized destination while the source stays playable. Enable crossing when ready; do not replace the source view with a blocking loading screen. Preserve source/save before commit failure and recover the confirmed destination after commit. This is a future runtime requirement, not a measured zero-latency or arbitrary-world guarantee from LV1.
- **Separation:** account identity/appearance, entitlements, arrival preference, confirmed location, personal Home, immutable world source, validated per-player world state and authorization are distinct records/boundaries. Guest scripts cannot mutate account records or grant access.

These are whole-product requirements. LV1 implements only test-profile arrival, colors, built-in-world travel and confirmed server saves; it has no real accounts or Homes. Its exact limits and acceptance are in the [LAN pilot](../planning/LAN-PILOT.md). The S1 local profile is not a real account.

## Ordered delivery

1. **F0 — Existing foundation, verified:** consolidated source/provenance, public GitHub collaboration, contributor rules, protected PR checks and a curated static progress site.
2. **F1 — The Oasis definition, verified:** experience blueprint, append-only owner decisions, traceable phase gates, agent/contributor reading paths, repository/Pages identity migration and tested status consistency.
3. **LV1 — Private LAN visitor pilot, implemented:** the separately authorized desktop visitor slice comes before the complete S1 creator proof; physical/extended-operation verification remains required.
4. **S1 — Internal local proof, planned:** one versioned World SDK contract and both coding paths; isolated interpreted guest scripts; two original worlds; local Hub/dashboard/avatar/Home demonstrations; personal choices and visibility request; exact location save/resume; recovery, export/import and meaningful hostile/resource/UI checks. No online accounts/grants/services.
5. **S2 — Accounts and shared core, planned:** stage secure accounts/profile/location/Home ownership and eligible discovery, then authoritative shared Hub/rooms/text with changed-client permission tests.
6. **S3 — Proximity and party voice, planned:** authorized routes, lifecycle, recipient denial and resource evidence.
7. **S4 — Trusted publishing, planned:** validated compatible worlds, current grants, direct release, rollback, quarantine and revocation.
8. **S5 — Public readiness, blocked on evidence:** the intended worldwide, all-age operation requires actual age/guardian, region, privacy, accessibility, rights, staffed operations and sustainable funding proof.

The [roadmap](../planning/ROADMAP.md) owns dependencies, stable task IDs and exit criteria. The [requirements register](../planning/REQUIREMENTS.md) preserves R-001–R-023 and records the dated scope correction without rewriting history; [DECISIONS](../planning/DECISIONS.md) is append-only. The [legacy crosswalk](../provenance/LEGACY-CROSSWALK.md) preserves older IDs.

## Public scope and unresolved decisions

The first public release is intended for eligible children, teens and adults, worldwide, with public world discovery/sharing, text, proximity and party voice, and trusted direct publishing. These are recorded requirements, not live capabilities, globally cleared policy or proof of readiness. A public listing does not itself authorize entry; a user's avatar choice or Home visibility request does not grant access.

Exact ages/cohorts, guardian process, country/features, account/auth provider, operator, trust grants, avatar/item compatibility contract, world discovery ranking, personal-space mode semantics, staffing, sustainable budget and device support remain Proposed or Unknown. Payments/tokens/payouts, AI/personas, native/XR breadth, federation, pets and adult-only features remain later scope. No backlog item authorizes those services or collection.

## Foundation acceptance

A fresh checkout can check/build/serve without secrets or dependency installation; humans and portable agent clients can find the correct next task from repository documents alone; requirement/status/roadmap consistency is checked; public progress has one structured source; untrusted fork checks are read-only; deployment publishes generated output from protected `main`; and the local GitHub Desktop remote corresponds to the renamed public repository. Site/theme/browser, PR and Pages evidence are recorded separately in [VERIFY](../../VERIFY.md) and [WORK-STATE](../planning/WORK-STATE.md).
