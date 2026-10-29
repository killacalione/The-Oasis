# Architecture

## Current foundation

One canonical repository contains maintained Oasis product documents, contributor and portable-role guidance, structured status/site copy and a dependency-free static-site generator. `data/project-status.json` is the public progress source; `npm run build` renders five static routes plus same-origin CSS, session-preference JavaScript, a hand-authored inline SVG scene and source-revision metadata into ignored `dist/`. PR CI validates generated routes and local links; trusted `main` builds deploy only curated `dist/` through GitHub Pages. The information site has no application backend, database, authentication, analytics or remote asset dependency. It uses browser `sessionStorage` only for the visual theme and motion preference. It is not the product dashboard or a playable Hub.

## LV1 — implemented private visitor topology

The separate [LAN pilot](../planning/LAN-PILOT.md) uses TypeScript, Babylon 9.32.0, Colyseus core 0.18.10 / WebSocket transport 0.18.2 / SDK 0.18.6 / schema 5.0.8, and Node24 native SQLite. Exact transitive dependencies are locked. Express 5.3.0 is the transport's required runtime peer. One precreated five-client room contains authoritative player state for three built-in worlds; public room creation is denied. Browsers render only the current world. Profiles and confirmed locations live in SQLite, separate from live state. One server process owns the data directory. Static application assets are an explicit allowlist under generated `pilot/dist/`, which is never uploaded to Pages.

HTTP and WebSocket Host/Origin checks, invitation enrollment, hashed profile keys, strict commands, server-timed bounded movement, durable acknowledgement, recovery and renderer disposal are implemented and tested separately. All world code and geometry is bundled first-party content. No guest runtime or sandbox is claimed. Production renderer, identity, storage, media and publishing choices beyond LV1 remain unselected. The following whole-product topology remains future scope.

## Product topology — proposed

The future client centers on a persistent Hub with an always-available launch dashboard. The dashboard opens eligible world discovery, a player’s own Home, the Wardrobe, creation tools and preferences. New accounts first create/select an avatar and spawn in the Hub; returning preferences can resume, choose Hub or choose an existing Home. See the [experience blueprint](../planning/OASIS-EXPERIENCE.md). The full product rules extend beyond the LV1 visitor slice.

## Trust and data boundaries — required, implementation unselected

The future trusted host owns interface, renderer, navigation, local or online save acknowledgement, avatar selection, travel validation and guest lifecycle. A versioned World SDK/project contract is shared by local source tools and the integrated editor. Guest code runs in an interpreted runtime with independently interruptible execution, validated capability messages, bounded queues/commands and host/renderer budgets. It cannot access account records, change player-owned appearance, mint grants or decide world permissions.

Keep these domains separate: account identity/profile; avatar/outfit entitlements; arrival preferences; the last confirmed location; personal Home configuration/requested visibility; immutable creator-owned world source/version; validated player-specific world state; and server-authoritative access/eligibility. Validate world/version, access, coordinates and avatar compatibility before resume/join. A failed or denied move leaves the saved record intact and offers explicit recovery.

Babylon, Monaco and QuickJS remain candidate components until a bounded S1 spike tests exact pins, behavior and dependency/network boundaries in the actual environment. No renderer, editor, runtime, storage, identity provider or backend is selected for production. Later authoritative rooms, durable state, text/media authorization and publishing are separate stage decisions. Voice stays outside guest code. Client adapters document actual capability differences. Adult-only functions remain separately gated from all-age surfaces.

## Required future world lifecycle

R-027/D-044 require **prepare → ready → commit → present → retire**. Keep the source interactive while loading authorized content, building destination resources and establishing admission. Readiness is not an access grant. Enable travel only when presentation is prepared; commit server authority/durability once, present the staged destination, then dispose the source. Cancellation before commit preserves the source and save. Interruption after commit reconciles with that committed record rather than silently restoring an older source save. Bound residency, initially one source plus one staged destination, and measure preparation/first-frame/frame-time/memory/disposal behavior.

This is a requirement for future world hosting/SDK work. The current LV1 renderer disposes the source and synchronously constructs tiny bundled scenes. It does not implement general asset streaming, prepared-scene handoff or cross-server migration. The separate [beginner workshop](../learning/README.md) teaches the current boundaries and uses isolated local data; it is not a production runtime or S1 implementation.

## Evidence

Current information-site structure and tests are documented in [testing](testing.md) and [VERIFY](../../VERIFY.md). Application boundaries and provider choices remain proposed; a document, candidate SDK or static-site check does not verify a playable Oasis experience or safe guest runtime.

See [SDK](../planning/WORLD-SDK.md), [S1](../planning/S1-IMPLEMENTATION-BRIEF.md), [demo](../planning/DEMO-EXPERIENCE.md), [space access](../planning/SPACE-ACCESS.md), [security](security.md) and [voice](../planning/VOICE-DESIGN.md).
