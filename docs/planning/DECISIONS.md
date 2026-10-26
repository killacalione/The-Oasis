> Adoption checkpoint 2026-10-15: D-015 is Apache-2.0 for new maintained files. D-020's former RPO HUB working name and D-035's original repository selection are historical; the owner has now selected **The Oasis** and an in-place repository rename to `killacalione/The-Oasis`. The additions below clarify the whole-product Hub experience while preserving earlier creator requirements and decision rows. F0 remains verified; F1 establishes the product definition before S1.

# Decision log

Owner intent comes from the initial vision and interview rounds one/two/three/four/five/six/seven on 2026-10-14. Recorded owner answers are requirements; implementation and safety workflow choices remain proposals. Preserve these IDs.

## LV1 authorization, 2026-10-26

D-044: the owner approved implementing a separate private **LAN visitor pilot** after F1: a shared 3D Hub, desktop browsers, this Windows PC, 2–5 invited adults, original built-in worlds and simple 3D visuals. Visitor movement/appearance/travel and acknowledged durable saves precede creator tools. This deliberately advances a bounded shared visitor slice without completing or removing S1 dual authoring/guest containment or S2 real-account/Home/access requirements. Default binding is loopback; only an explicitly selected private LAN interface may be enabled. Public hosting, firewall/VPN/power/startup changes, voice, publishing and child-data collection are not incidental implementation steps. See [LV1](LAN-PILOT.md) for exact implementation and acceptance boundaries.

| ID | Decision | State | Consequence / next evidence |
|---|---|---|---|
| D-001 | Long-running extensible online hub | Requirement | Versioned worlds/interfaces and phased planning |
| D-002 | Eventual open-source GitHub participation | Requirement | License/governance/contributor flow before publication |
| D-003 | Shared identity across participating worlds and access forms | Requirement; exact portability unknown | Versioned contracts and authorized client adapters |
| D-010 | Core first-session activity | Requirement: creating and personalizing worlds | Creator workflow becomes the first prototype focus |
| D-011 | First-release audience | Requirement: children, teens and adults | All-age UX and reviewed age/parent/data/sharing behavior; legal classification still unknown |
| D-012 | Budget direction | Requirement: free sources, education benefits, lowest cost; exact ceiling unknown | Target no new subscriptions for internal prototype; verify benefits and actual later online costs |
| D-013 | Weekly effort | Requirement: owner limited maintainer capacity for steering/testing/operational review | Exact weekly schedule, helpers, live response coverage and first tester group unknown |
| D-014 | First supported clients/XR device | Unknown | Physical spike acceptance |
| D-015 | Code/content license and stewardship | Unknown | Contributor/publication policy |
| D-016 | Code/scripting and public sharing | Requirement: code/scripting creation; public world sharing and social interaction in first online release | Trusted creators publish directly; language/script capabilities, trust grants and age/contact policy remain open |
| D-017 | Currency purchases/transfers/payouts | Unknown | Distinct legal/accounting flows |
| D-018 | AI memory and persona rights | Unknown | Consent/retention/source policy |
| D-019 | Single operator versus federation | Unknown | Hosting/trust/moderation authority |
| D-020 | Product/repo name and owner | Unknown | Naming/brand screening and future repository |
| D-021 | Exact Rea project/tool | Likely match: morluto/rea, Reverse Engineer Anything; owner intent unconfirmed | Original repository read; no active REA tool/plugin match; optional local integration still unexecuted |
| P-001 | Code-driven World SDK with creator preview | Proposed implementation of confirmed coding priority | JS/TS candidate; both local and browser coding required; runtime/APIs need spike |
| P-002 | Compare Hubs with Babylon/Colyseus/LiveKit | Proposed; social comparison deprioritized | First compare creator workflow; retain social comparison for online milestone |
| P-003 | Earned non-transferable points before real purchases | Proposed | Confirm economy priorities; no financial model selected |
| P-004 | Invited all-age pilot before public launch | Proposed testing milestone; not first-release visibility | First online release remains public as requested; verify data/parent/social scope |
| P-005 | Internal no-account code SDK/isolated preview precursor | Proposed; replaces drag-and-drop-first proposal | Two original code-authored worlds, Run/Stop/logs/export and hostile-case runtime evidence |
| P-006 | Temporary education benefits and free-tier limits | Proposed operating approach | User selected Pack/Azure/other and uncertainty; exact approvals/remaining allowances unverified |
| D-022 | Primary creator method | Requirement: code and scripting | Define versioned world SDK; do not require visitors to code |
| D-023 | First online-release visibility/interaction | Requirement: public sharing and social interaction | Public listing/joining with age/permission rules; not automatic unrestricted DMs or unreviewed uploads |
| D-024 | Optional funding resources | Unknown; no private account or benefit information is published | Verify actual resource availability privately before relying on it |
| P-007 | JS/TS plus QuickJS-in-Wasm worker runtime | Proposed candidate | Independent watchdog, bounded host bridge and pinned hostile tests before adoption |
| P-008 | Human review for each trusted release | Superseded by D-027 | Trusted direct publication retains automated checks, revocation and moderator enforcement |
| D-025 | Both creator coding environments | Requirement: local VS Code/GitHub and integrated browser code editor from start | One SDK/source/bundle contract, validation and publishing authority |
| D-026 | First-release communication | Requirement: text chat, proximity voice and party/group voice | Separate world/party routing; age/contact/media authorization and quota tests |
| D-027 | Trusted publishing | Requirement: trusted creators publish directly | Trust-grant criteria/minor eligibility/revocation remain open; no per-release human queue by default |
| P-009 | LiveKit world and persistent party voice | Proposed transport design | Prove forbidden-recipient denial; SDK/mic lifecycle and limits tested |
| P-010 | Monaco desktop browser editor with same SDK as VS Code | Proposed editor choice | MIT and desktop limitation observed; mobile fallback and package/compiler scope tested |
| D-028 | Child public communication | Requirement: children communicate with their age group in public rooms | Exact cohort/minimum age, assurance and party/text/indirect-channel extent need definition |
| D-029 | First-release geography | Requirement: worldwide from start | Country-aware lawful eligibility/features; not globally cleared or equal rules assumed |
| P-011 | Separate age-group instances/channels | Proposed implementation | Server grants and all message/media/UGC paths isolated; bands not selected |
| P-012 | Capacity-limited global beta and scheduled covered sessions | Proposed launch model | Preserve worldwide public goal; staffing/legal/resource coverage must be demonstrated |
| D-030 | First demo visitor activities | Requirement: explore, personalize spaces, and travel through portals | Restore personal choices after travel; exact themes, controls, visibility semantics and storage implementation are proposed |
| P-013 | Two scenes with separate visitor draft state | Proposed implementation of D-030 | Island/plaza and moon/observatory themes; approved personalization controls, host travel and recoverable local save/export; not selected art or public-home policy |
| D-031 | Personal-space visibility selection | Requirement: owner chooses visibility when creating the space | Exact modes/defaults, later changes and guest editing remain proposed; server authorization needed online |
| P-014 | Separate visibility and action permissions | Proposed: Private, Invite-only and Public-to-eligible modes, Private initial selection, read-only visitors and live revocation | Preserve owner choice within age/contact/guardian/region/content policy; prove denied delivery, not merely hidden UI |
| D-032 | Development agents and model flexibility | Requirement: Codex, Hermes, Copilot and other agents; mainly cloud models, switching plus compatible local tool-use/reasoning models | Portable context/handoff and actual per-client/model checks; no fixed provider chosen or runtime configured |
| P-015 | Shared project context with client adapters | Proposed: AGENTS, common role text, task state, capability records and one writer per checkout | Preserve Codex TOMLs as adapters and add a Copilot router; test loading, tools, model switch and handoff on actual devices |

Change history: 2026-10-14 — initial vision recorded; round one selected creating/personalizing worlds, children/teens/adults, and free/lowest-cost resources with some education benefits. Original social-first alpha proposal revised. Round two selected code/scripting and public sharing/social interaction; benefit selections include uncertainty. Round three requires both coding environments, text/proximity/party voice and direct trusted publishing. Round four selects child communication within their age group, worldwide initial availability and limited maintainer capacity. Exact cohorts/age assurance, country eligibility, trust/operations, grants and devices remain open. Next entries must cite owner answers or actual evidence, distinguishing choices from implementation verification.

## Round-five change record

Owner selected exploration, personalizing spaces and portal travel. Added D-030 and P-013; exact original scene themes and private local draft default remain proposals. No implementation, public-home visibility policy or cloud sync verified.

## Round-six change record

Owner chooses personal-space visibility at creation (D-031). Added proposed P-014 and access design; exact child defaults, editing/invite flow and live implementation remain unverified. Found likely REA original repository using web/GitHub; connector discovery returned no active REA capability, so local integration is documented rather than claimed installed.

## Round-seven change record

Owner extends the developer workflow to multiple agents and cloud/local models (D-032). Prepared portable workflow, handoff and state/capability records (P-015). Existing role text/TOML mirrors and bootstrap preserved. Copilot free/student manual-model limitation and Codex/Hermes bridge documentation mismatch are source observations, not tested local configurations. No client, API budget, model download or agent bridge configured.

## The Oasis clarification, 2026-10-15

The owner selected the name **The Oasis** and clarified that the product is a central launch/community Hub where people can arrive, find other worlds, make a Home, personalize a player-owned avatar and create worlds themselves. This supersedes the former working brand and corrects how the earlier creator-first focus is scoped; it does not erase R-011, D-010, D-022 or the coding/creation requirements. New accounts first create/select an avatar and arrive in the Hub. Return preferences apply after that first arrival. Exact resume, avatar compatibility and explicit recovery are requirements for future product work. A proposed local S1 demonstration is not a real account, durable online location or access grant.

The owner separately selected an **in-place** migration of the existing repository and Pages identity. GitHub's current official rename guidance says ordinary repository references/Git traffic redirect but project Pages URLs are an exception; GitHub Desktop documents updating the local primary remote. Therefore migration, the new deployed Pages base and live revision require direct verification. See current primary source notes S105–S109 and task evidence in WORK-STATE.

## Foundation decisions, 2026-10-15

| ID | Decision | Evidence |
| --- | --- | --- |
| D-033 | Establish public/local Git, Desktop link, contributor workflow and Pages progress before application building | Current owner instruction |
| D-034 | Use Apache-2.0 for new maintained project code/contributions | Explicit owner selection |
| D-035 | Create public killacalione/RPO-HUB | Explicit owner selection |
| D-036 | Merge both packages into the top-level project-foundation-new-project folder, retaining meaningful differences and removing accidental duplicates | Current owner instruction |
| D-037 | Product name is **The Oasis**; RPO HUB remains a historical working/repository name | Explicit owner selection in current conversation, 2026-10-15 |
| D-038 | The product is a central community launch/social Hub connecting player identity, Home, discovery, community worlds, customization and creation; creation is not the entire product | Owner clarification in current conversation, 2026-10-15; recorded as R-024 |
| D-039 | New accounts create/select an avatar and first spawn in the Hub; the dashboard is available in that experience and first arrival cannot be bypassed | Owner-approved product foundation plan, 2026-10-15; future requirement only |
| D-040 | After the first Hub arrival, returning entry supports Resume (default), Always Hub and Always Home, with Home unavailable until created | Owner-approved product foundation plan, 2026-10-15; future requirement only |
| D-041 | The player owns avatar/outfit choice; worlds cannot silently replace it. Incompatible appearance blocks entry or asks the player explicitly | Owner-approved product foundation plan, 2026-10-15; future requirement only |
| D-042 | Resume preserves world/version, coordinate frame, exact XYZ/facing and confirmed save revision; only acknowledged durable saves count, and failure preserves the record with explicit recovery options | Owner-approved product foundation plan informed by current browser lifecycle sources S109–S110; future behavior, not implemented |
| D-043 | Rename the existing public repository in place to `killacalione/The-Oasis`, update the local remote and migrate Pages to the new project path, preserving repository history/protection/provenance | Explicit owner selection in current conversation, 2026-10-15; execution evidence belongs in WORK-STATE/VERIFY |
