# The Oasis experience blueprint

Updated 2026-10-15 from the owner’s product direction and the preserved requirement/interview record. **Product requirements** describe the intended experience; **Proposed** details are design rules for future implementation; **Unknown** means the owner or evidence has not settled it. Nothing in this blueprint is a live application capability. See the [roadmap](ROADMAP.md) for phase gates and [structured status](../../data/project-status.json) for verified completion.

## Product in one sentence

**The Oasis is a persistent social hub that gives people one welcoming place to start, a player-owned identity and Home, and a way to discover, visit and create community-made worlds.** World creation matters, but it is one destination and contribution path within the wider hub.

The future product is intended for children, teens and adults around the world, subject to actual eligibility, regional, privacy, safety, accessibility, operational and financial readiness. Visitors should not need coding skills. A created world should use a versioned contract and trusted platform controls rather than receive authority over an account, avatar or access grant.

## First arrival — requirement

The first successful account arrival follows this order:

```text
Create account → create or select an avatar → first spawn in the Hub
```

The first spawn is always in the Hub. A new account cannot bypass onboarding by selecting Home as its default, following a direct world link or choosing a dashboard-only first arrival. The launch dashboard is available within the Hub experience so a newcomer can understand the destinations without being forced away from the starting place.

This rule is for a future account product. S1 may demonstrate it with an explicitly labeled local profile; a local profile is not a real account, identity check or server grant.

## The Hub, dashboard and destinations

**Requirement:** the Hub is the central launch and social space. It is the default first arrival, the clear return destination and a way to find where to go next. The product also has a launch dashboard for predictable controls and direct navigation.

The dashboard remains readily available from the Hub, a world or Home. Its core controls stay in consistent locations while its content can feel personal. It is the entry point for:

- **Discover:** find worlds and community spaces the current account is eligible to see and enter.
- **Home:** open or manage the player’s own personal space. Home exists only after the player creates one.
- **Wardrobe:** choose the player-owned avatar and outfit from the items they are allowed to use.
- **Create:** author, validate, preview, save and eventually publish a world through supported tools.
- **Preferences:** select future arrival behavior and accessibility choices.
- **Return:** leave a broken or incompatible destination through a persistent, predictable route.

The public site remains informational. The separately authorized [LV1 private LAN pilot](LAN-PILOT.md) now implements a bounded Hub/dashboard, test-profile colors, two built-in worlds and confirmed saves. Full accounts, Homes, directory, wardrobe/entitlements and creator tools remain future scope. LV1 does not complete this whole-product blueprint.

## Continuous world travel — requirement

Owner-selected R-027/D-044, 2026-10-26: keep the current world playable while an authorized destination prepares. Enable crossing when the destination is ready, without replacing the usable world view with a blocking loading screen. Give nonblocking, keyboard/screen-reader-accessible readiness and failure feedback. Preparation is not permission to reveal protected content or enter a world. Keep active/staged resources bounded.

Before authoritative commit, failure/cancellation preserves the source and its confirmed location. After commit, reconcile the actual confirmed destination rather than silently rolling the save back. Measure preparation, first usable frame, frame-time spikes, peak memory and repeated-travel disposal. LV1's tiny bundled procedural scene replacements motivate this rule but do not implement general staging, streaming or cross-server travel.

## Returning arrival — requirement

After a successful first Hub arrival, the player may choose one of three future sign-in behaviors:

| Preference | Intended behavior |
|---|---|
| **Resume** | Re-enter the last confirmed saved location. This is the default. |
| **Always Hub** | Begin the next sign-in in the Hub. |
| **Always Home** | Begin in the player’s existing personal Home. This option is unavailable until Home exists. |

These choices affect returning sessions only. They never override the required first Hub spawn. The launch dashboard remains accessible whichever returning preference is used.

### Exact resume record

An exact return needs more than a world name. Its durable record identifies:

- the immutable world reference and version the player last entered;
- the coordinate-frame or world-origin contract for that version;
- the exact X, Y and Z position and facing/orientation;
- the last save revision confirmed as durable by the source of truth.

On entry, revalidate that the world/version is available, the account still has current access, the world supports the player’s chosen appearance, and the coordinates are finite and valid for that version. A resumed location is not an access grant.

Successful logout reports success only after the location and profile writes are acknowledged. Periodic saves reduce loss during interruption. A crash can recover only the last confirmed save; a recent movement may be lost. A browser’s `beforeunload` event is unreliable, especially on mobile. `visibilitychange` is a useful checkpoint signal, not proof that an asynchronous write completed. See [MDN lifecycle guidance](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) and [source register S105–S110](../research/SOURCES.md).

If the exact location is unavailable, invalid, denied or incompatible, preserve the saved record and explain the reason. Offer **Retry**, **Hub** and **Home** when Home exists. Never silently erase the record, substitute an avatar, or relocate the player to an unannounced world position. Accessibility may provide a clearly explained safe landing only after the player chooses it.

## Player-owned avatar and wardrobe — requirement

The player controls their avatar and chosen outfit. A world cannot silently replace the player’s character, remove a wearable, overwrite the selection or use an automatic neutral-avatar fallback. Participating worlds must implement the shared appearance contract. If a world cannot support the selected appearance, entry is blocked or the player is asked to make an explicit choice before entry.

Appearance ownership is separate from a world’s immutable source, the player’s world-specific personalization, a saved location and account authorization. Guest world code cannot write the identity/appearance record or grant item ownership. A compatible style/rendering adapter may be proposed later, but it cannot silently change the selected avatar or items.

## Personal Home and visibility — requirement plus proposal

Each player may create a personal Home and choose its requested visibility during creation. Creating a Home is not required to use the Hub, visit permitted worlds, create a world or return to the dashboard. **Always Home** stays unavailable until a Home exists.

Private, Invite-only and Public modes, their initial choice, visit/edit distinction, listing rules and invitation behavior remain design proposals. In S1, any visibility choice is a local requested preference. It is not online ownership, a visitor grant, a trusted publishing role or evidence of child/privacy compliance. Later online Home creation must enforce current platform eligibility and server authorization independently of client controls.

## Discovery, creation and community worlds

Discovery should help people find community-made experiences appropriate for their account and current eligibility. A world listing, source version and permission to enter are separate concepts. Blocked, removed, incompatible or unpublished worlds should explain the outcome and offer a route back to the Hub.

Creators use code and the versioned World SDK through both local development tools and the integrated editor. Visitors can explore and use approved personalization controls without writing code. A creator’s immutable world source is not rewritten by each visitor’s choices; each visitor’s validated personal configuration is stored separately. Trusted direct publishing, public listings and online sharing remain later-stage requirements with separate validation/access gates.

## Travel, save and recovery

Portals request a registered destination. The trusted host validates its identifier, destination version, entry point, current access and compatibility before travel. Guest code cannot choose an arbitrary URL or supply account, age, party or room authority.

For S1, preserve the existing two-original-scene journey: explore, choose an approved color, place or arrange an approved prop, save and export, travel through a portal, interact with a landmark, and return with choices intact. Extend the harness so a local profile first spawns in the demo Hub, opens its dashboard, chooses an avatar and Home preference, and can resume the last confirmed scene location after a save/reload. Home visibility remains local intent only. Failed saves, corrupt imports, failed travel and duplicate portal requests retain the last known-good state and show useful recovery.

Travel and save messages distinguish pending, acknowledged and failed states. An unload event alone never counts as a completed save. Keep a persistent Return-to-Hub action on application views. Successful world changes dispose the outgoing guest runtime and its owned resources.

## Accessibility and interaction

Repeated navigation stays in the same relative order unless the user changes it, supporting predictable movement between destinations ([W3C consistent-navigation guidance](https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation)). The dashboard must work with keyboard and screen reader, preserve focus during transitions and provide a direct route to essential controls. Motion, audio and visual effects need clear user controls and reduced-motion behavior. Exact layouts, input parity, supported devices and assistive-technology results remain Unknown until tested in the actual implementation.

## Data and authority boundaries

Keep the following records conceptually separate; exact backend schemas and providers remain unselected:

| Record | Owner and purpose | Authority boundary |
|---|---|---|
| Account identity/profile | Account service; stable identity and eligible public profile | Never readable or writable by guest scripts beyond approved, minimized display data |
| Avatar/outfit selection and entitlements | Player/platform; owned appearance and permitted wearables | A world cannot replace appearance or mint entitlements |
| Arrival preference and last confirmed location | Player/platform; future spawn and exact resume | Preference cannot bypass first Hub arrival or current access checks |
| Personal Home and requested visibility | Player/platform; Home configuration and owner choice | Visibility request alone does not authorize reads, edits or joins |
| Immutable world source/version | Creator/platform; reviewed project and versioned manifest | Visitor personalization cannot mutate shared source |
| Validated world-personal state | Player/platform; allowed choices and bounded object transforms | Guest runtime does not hold database handles or account authority |
| Access and eligibility grants | Authoritative policy service | Clients/world scripts cannot mint, extend or override grants |

S1 can model these as separate local files or typed records, but must clearly label the profile and storage as local. S2 adds real accounts and server authority only after its own scoped task, current source research and security tests.

## Evidence, proposals and unknowns

| Topic | Classification | Evidence or next gate |
|---|---|---|
| Hub-centered product, avatar ownership and returning choices | Requirement from the owner’s current direction, 2026-10-15 | Recorded in this blueprint and append-only decision log; not implemented |
| Existing creator, avatar/world, exploration and sharing requirements | Preserved requirements R-001–R-023 and legacy crosswalk | [Requirements](REQUIREMENTS.md), [decisions](DECISIONS.md), [crosswalk](../provenance/LEGACY-CROSSWALK.md) |
| Exact resume durability and browser lifecycle | Product requirement informed by current MDN guidance | Persist only acknowledged saves; device/storage guarantees remain untested |
| Consistent navigation | Accessibility design requirement | W3C explanatory guidance is informative; conformance requires implementation testing |
| Private/Invite-only/Public definitions, default and visitor/edit rights | Proposed | Separate owner decision and legal/accessibility review before online use |
| Avatar format, item ownership, adaptation and compatibility | Proposed | Define an interoperable contract and test actual renderer/assets in S1 |
| Account/authentication provider, durable store, real identity verification | Unknown | Decide and assess in S2; no service selected |
| Eligibility, age/guardian process, worldwide country coverage, moderation staffing and operating cost | Unknown | S5 evidence register and human/legal/operator review |
| Product art/world themes, exact Hub map, community listing ranking and dashboard composition | Proposed/Unknown | Do not treat current pixel-art website as the application art specification |

Primary-source notes were checked on 2026-10-15. GitHub’s rename documentation says project Pages URLs are excluded from the normal repository redirect; updating repository/base-path links and checking the new live site is therefore an explicit migration gate. GitHub Desktop supports changing a repository’s primary remote URL after a rename. These sources guide migration steps; the actual repository, remote, deployment and live revision must be verified separately. See [SOURCES](../research/SOURCES.md#s105).
