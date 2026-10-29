# The existing Oasis, from source to saved journey

**Source reference:** [753ba4ffe15394f96f2dbbb6811d0fe20fee1522](https://github.com/killacalione/The-Oasis/tree/753ba4ffe15394f96f2dbbb6811d0fe20fee1522), reviewed 2026-10-26. This chapter describes the complete three-world LV1 pilot. The two-world workshop deliberately introduces fewer responsibilities at once. Use [Sources](SOURCES.md) to distinguish source facts, recorded tests, requirements and future proposals.

## 1. Two applications and three runtime responsibilities

The public information site explains the project. Repository scripts build five static pages into root `dist/`; GitHub Pages hosts that curated output. It cannot, by itself, keep your Node multiplayer process running.

The playable pilot has three active responsibilities:

```text
browser: input, HTML interface and 3D pictures
        ↕ HTTP requests and a WebSocket connection
Node server: authentication, admission, validation and shared simulation
        ↕ SQLite transactions
database: confirmed profile records
```

Each browser renders its own view. The server exchanges structured data such as player positions; it does not send a video of a centrally rendered world. Browser and server can run on one PC while remaining separate programs.

The implementation imports native `node:http` for its HTTP server and routes. Express is present in the dependency manifest but is not used by the pilot application. React, a general physics engine and a creator editor are not prerequisites for this implementation.

## 2. Read the code in responsibility order

| Responsibility | Source | Question to answer |
| --- | --- | --- |
| Shared meaning | [Contracts](../../../pilot/shared/contracts.ts), [worlds and movement](../../../pilot/shared/worlds.ts) | What information can cross a boundary? |
| Pictures and lifecycle | [World view](../../../pilot/client/world-view.ts) | What gets created, drawn and disposed? |
| Input and crossings | [Navigation](../../../pilot/client/navigation.ts) | How do actions become valid geometric intent? |
| Browser coordination | [Application](../../../pilot/client/app.ts) | How do interface, network and renderer cooperate? |
| Shared authority | [Room](../../../pilot/server/room.ts) | Who can change the live player map? |
| Durability | [Store](../../../pilot/server/store.ts) | When is a result committed? |
| HTTP and operation | [Server](../../../pilot/server/index.ts), [supervisor](../../../pilot/scripts/supervise.mjs) | How does the process admit requests and recover? |
| Evidence | [Integration tests](../../../pilot/tests/integration.test.ts), [browser checks](../../../pilot/scripts/browser-test.mjs) | Which claims are actually exercised? |

This is also a useful debugging order. A visible problem can originate in a different responsibility from the one displaying it.

## 3. Startup and arrival

The Windows launcher selects a checksum-verified portable Node 24.22.1 runtime, installs locked dependencies if absent, builds output and starts a supervisor. The supervisor launches the server. A server data-directory lock prevents a second process from accidentally opening that store.

The browser loads HTML, CSS and the JavaScript module. It creates the Babylon view before joining multiplayer, so an initial scene can appear behind the arrival dialog. The browser then requests configuration and checks whether it holds a profile token.

A new visitor submits nickname, color and invitation. The server validates those values, generates a profile UUID and a random 32-byte token, returns the token once, and stores its SHA-256 hash. New profiles start in the Hub. Returning tokens retrieve the last confirmed profile; an invalid or incompatible location is preserved until explicit recovery.

The browser stores the token locally. It is a credential used to identify a pseudonymous test profile. It is not the profile data, a password, an age check, a finished account service or a lost-key recovery mechanism. One active connection per profile is enforced, including pending joins. There are at most 50 stored profiles and five simultaneous room seats in the pilot.

## 4. A world is not a server room

The server creates one Colyseus `oasis` room with a shared player map. Each player includes `worldId`. The Hub, island and observatory are three content/location identifiers inside that single room.

Five seats means five visitors in total, not five per destination. World travel does not find another server, reserve a remote room or reconnect the WebSocket. All room members receive the shared player map. The renderer filters which avatars it draws by world ID; this visual filtering is not a confidentiality or private-world boundary. Future private/eligible worlds need server-scoped delivery.

## 5. The renderer turns data into frames

Babylon's engine owns rendering resources and draws repeated frames. Each scene contains a camera, lights, meshes and materials. A mesh is geometry. A material describes its surface. A `TransformNode` groups avatar or portal parts under a shared position/rotation.

The three worlds are constructed from original primitive geometry: platforms, boxes, capsules, spheres, cylinders and toruses. They do not download a large model or texture set at a portal crossing. The world definitions and scene-building code are included in the initial client bundle.

Each frame calculates elapsed time, updates orbit angles, updates visible avatars and renders the active scene. The view eases avatar positions toward the latest server coordinates:

```text
amount = min(1, elapsedSeconds × 14)
displayed = lerp(previousDisplayed, latestServerPosition, amount)
```

`lerp` means linear interpolation: choose a point partway between two positions. It smooths snapshots already received. The client does not predict future authoritative movement and reconcile corrections afterward. Reduced-motion mode skips this easing and disables the decorative rotating beacon.

Current world replacement disposes the outgoing scene before synchronously constructing the new scene. That prevents old scenes accumulating, but it is not a prepared destination/streaming system. [Continuous-presentation follow-on work](FOLLOW-ON.md#continuous-presentation-and-prepared-travel) changes that lifecycle before large asset-based worlds arrive.

## 6. Five clocks have different jobs

| Clock | Pilot configuration | Purpose |
| --- | --- | --- |
| Browser render loop | As rendering permits | Draw the latest view |
| Browser movement messages | Every 50 ms | Refresh desired direction/facing |
| Server simulation | Every 50 ms | Advance authoritative position |
| Colyseus patches | Every 50 ms | Synchronize changed state |
| Durable movement checkpoints | Every five seconds | Reduce unsaved movement loss |

Fifty milliseconds is 1/20 of a second: approximately 20 Hz. A browser at 60 FPS can draw multiple frames between server updates. Sixty FPS does not mean sixty SQLite writes each second. The synthetic soak uses SDK clients and its own input cadence, not a browser render loop.

## 7. Input becomes server-owned movement

Held keys and buttons are stored in sets. Forward input is W minus S; right input is D minus A. Opposing inputs cancel. Camera yaw converts those relative axes to world directions:

```text
forward = (-sin(yaw), -cos(yaw))
right   = (-cos(yaw),  sin(yaw))
```

For this left-handed scene and camera arrangement, yaw zero looks toward negative Z and screen-right points toward negative X. The earlier inverted controls came from mixing this screen basis with a different assumed world basis.

The client divides the combined vector by `max(1, length)`. This keeps diagonal movement from becoming approximately 1.414 times faster and avoids dividing zero by zero.

The outgoing movement message is `{ seq, dx, dz, facing }`. It contains intended direction, not a requested absolute XYZ. The server checks exact fields, finite bounds and monotonically increasing sequence numbers. It keeps only the newest valid input and stops using it after 250 ms without refresh.

On its own simulation tick, the server advances at five metres per second, normalizes again, bounds elapsed time and projects positions back inside the circular platform. At 0.05 seconds a normal step is about 0.25 metres. Sending extra packets does not create extra simulation ticks. Player Y remains zero; scenery does not form a general collision world.

## 8. Orbit camera and interface lifecycle

Yaw rotates around the vertical axis; pitch changes elevation. The camera looks toward a target 1.3 metres above the avatar. At a fixed radius:

```text
horizontal = radius × cos(pitch)
cameraX = targetX + sin(yaw) × horizontal
cameraY = targetY + sin(pitch) × radius
cameraZ = targetZ + cos(yaw) × horizontal
```

Pitch is bounded from −4° to 80° in the pilot. It stays local; looking upward does not move the player into the air or become saved avatar position. Saved facing is yaw.

Pointer lock is a browser state machine. A user gesture requests it. Actual `pointerlockchange` controls dashboard hiding, inert/focus state and layout. Escape or lost capture clears held input and restores controls. Denied capture keeps keyboard/button navigation usable. A `ResizeObserver` resizes the render buffer when sidebar visibility changes canvas size without a window resize.

Status feedback remains exposed to assistive technology in both interaction modes. Hiding a dashboard must not also hide the only error message or trap keyboard focus.

## 9. Portal geometry and portal behavior are separate

The glowing frame is a visible mesh group. Crossing behavior compares successive authoritative positions received by the browser. For a current Z-aligned portal, it detects a segment passing through the plane and interpolates the X coordinate at the intersection:

```text
fraction = (portalZ − previousZ) / (currentZ − previousZ)
crossingX = previousX + fraction × (currentX − previousX)
```

The intersection must fall within the 2.9-metre opening. A wider rearming threshold, ±1.8 metres in X and ±1.25 in Z, prevents repeated entry while standing nearby. Resuming inside starts unarmed. An entry consumed during a pending or failed action requires exit and re-entry before another automatic request.

Detection is client-side convenience, not server-enforced proof of physical proximity. Dashboard travel is intentionally available. The server still validates the requested destination and controls persistence.

## 10. Commands and the save boundary

Travel, appearance and Save use correlated request IDs. The browser tracks a pending request, clears held input and avoids overlapping interface actions. A successful command ID is cached within the connection's last 128 results; identical reuse returns the result, while changed content with the same ID is rejected. This in-memory cache is not persistent exactly-once behavior across reconnects.

Travel proceeds in this order:

```text
request → validate destination → commit target spawn in SQLite
        → clear previous movement → change replicated location
        → send confirmed profile/result → present destination
```

Hub return is permitted independently of portal adjacency. Current travel uses a fixed target spawn; it does not transform crossing position or velocity through a spatially adjoining portal.

Distinguish three records: current server simulation, current browser presentation and the last confirmed durable profile. The database stores one `profiles` table: ID, token hash, nickname, color, location JSON, save revision and update time. Location JSON identifies world/version, coordinate frame, XYZ and facing. World version `1.0.0`, save revision 4, Node version 24.22.1 and Git revision `753ba4f` version different things.

The store runs `BEGIN IMMEDIATE`, updates only the expected profile ID/revision, increments the revision, and commits. Zero updated rows means a conflict. Errors roll back. A saved acknowledgement is emitted only after commit. Seeing a player move is therefore not proof the movement is durable. A crash can lose movement after the last confirmed checkpoint.

## 11. Requests and operating limits

The native HTTP server explicitly handles configuration, invited profile creation, authenticated profile lookup, invalid-save Hub recovery, the one allowed room-join route and a small static-file allowlist. Both `/healthz` and `/readyz` currently perform the same readiness/database check; their names do not prove two independent diagnostic mechanisms.

Host/Origin checks, message validation, request size/rate limits and a fixed room reduce the bounded pilot surface. HTTP/WS and browser-held test credentials are a private local/LAN prototype arrangement, not public-service readiness.

SQLite uses WAL and `synchronous=FULL`. Its `DatabaseSync` calls run synchronously on the Node event loop. Slow storage or a lock wait can delay simulation and acknowledgements. WAL does not turn synchronous JavaScript into nonblocking work.

The server rotates bounded logs, produces daily/orderly-shutdown backups and retains 14 automatic snapshots. Backup validation checks integrity, schema and saved records. Restore requires a separate empty directory. A same-disk backup cannot recover a lost disk.

The supervisor retries unexpected exits after three seconds and stops after five rapid failures. Closing a player's browser leaves the server running. Rebooting Windows stops both server and supervisor; no automatic Windows service/startup configuration is installed. Explicit reconnect retrieves confirmed state after an interruption.

## 12. Why the current travel feels fast

Three small bundled procedural scenes, one room, one connection and a local server avoid many costs a remote creator world would introduce. There is still finite disk, network, CPU and GPU work. Initial bundle transfer pays some cost before arrival. All scene code being bundled does not mean all destination scenes are already prepared in memory.

The recorded roughly 60 FPS measurement is steady software-renderer evidence, not a portal-latency measurement or physical-GPU certification. Future seamless travel needs separately measured preparation, admission, first-frame timing, memory and failure recovery.

The [follow-on chapter](FOLLOW-ON.md) explains how these small contracts grow toward creation tools, accounts/Homes, communication, publishing and the full product without relabeling planned features as implemented.
