# Follow-on engineering: from weekend core to a platform

The weekend's two-world learning app is a smaller demonstration. The full three-world LV1 pilot provides additional operational and validation patterns. Neither establishes a complete public Oasis platform. Read the current [roadmap](../../planning/ROADMAP.md) and [work ledger](../../planning/WORK-STATE.md) before choosing implementation work.

## Reproduce the full pilot a responsibility at a time

| Extension | Implementation lesson | Required evidence |
| --- | --- | --- |
| More complete validation | Check exact shape, finite values, allowed IDs, payload size and caller ownership | Modified clients fail without changing another profile or the last good save |
| Bounded request rates | Bound work per connection and per HTTP caller | Excess work is rejected clearly; normal players remain usable |
| Revision and duplicate handling | Keep request correlation separate from optimistic database revisions | Identical repeats do not apply twice; reused IDs with changed content fail |
| Explicit reconnect | Stop input/action replay, authenticate again and read confirmed state | A forced server interruption restores the acknowledged record |
| Invalid-save recovery | Preserve incompatible/corrupt records until explicit recovery | No silent relocation or overwrite when resume fails |
| Resource lifecycle | Dispose departed avatars, scenes, materials and stale preparation | Repeated travel retains bounded scenes/resources |
| Bounded observability | Revision, readiness, resource counters and rotated logs | Logs have a size bound; log failures do not undo committed saves |
| Backup and restore | Use a consistent database snapshot and verify its records | Restore into a different empty directory; prove its known saved profile works |
| Process supervisor | Restart unexpected exits with backoff/failure limits | Crash recovery works; repeated bad startup stops visibly |
| Long-run evidence | Record sampled clients/errors/resources and coverage | Full elapsed duration, enough samples and no unexplained gaps |

The pilot's remembered command results are bounded to a connection. Do not describe that as persistent exactly-once behavior. A missing response can be ambiguous: the server may have committed before the connection failed. Inspect the confirmed record after reconnect instead of blindly issuing an inverse operation.

The reference's `DatabaseSync` calls and several filesystem operations execute synchronously. Slow storage can delay the Node event loop. Before increasing capacity, measure event-loop delay, database latency, simulation timing and resource pressure; selecting an asynchronous API or storage worker is a design change to verify, not an automatic scale guarantee.

## Continuous presentation and prepared travel

**Requirement R-027 / decision D-044:** keep the current world playable while a destination is prepared. Enable crossing only when ready and avoid replacing the world view with a blocking loading screen. This is the owner's chosen product behavior. General creator-world enforcement is future work, not a claim about today's loader.

Today's small scenes feel fast because their definitions/builders are bundled, geometry is simple, and the connection/room stays active. The renderer currently disposes the source scene before building the target. That is not the lifecycle to retain for arbitrary downloaded assets.

A future runtime separates responsibilities:

```text
resolve destination/version
→ authorize permitted preparation
→ prepare assets, scene and destination admission
→ establish readiness while source stays playable
→ enable crossing
→ commit authoritative travel once
→ present the prepared destination
→ retire source resources
```

Do not equate a downloaded asset with complete readiness. The scene may need construction, material/shader work, a valid camera/spawn, collision/runtime setup and server admission. A client readiness report is not an access grant. Protected destination content must obey current authorization before preloading.

| Failure moment | Required result |
| --- | --- |
| Asset or runtime preparation fails | Keep the source world and confirmed source record usable |
| A destination is cold or unavailable | Explain its status without taking away the source world |
| Access is denied/revoked before entry | Do not deliver protected content or admit the player |
| No authoritative commit has happened | Cancel preparation without changing the confirmed location |
| Commit happened but confirmation was lost | Reconcile with the committed destination after reconnect |
| Presentation fails after commit | Offer explicit recovery; do not pretend the durable move never happened |

Start with one active world and one staged neighbor. Bound preparation time/work, asset bytes, queues, cache residency and cancellation. Dispose obsolete work. Preloading every world is not a sustainable substitute for a lifecycle.

Add a controlled delayed-preparation exercise before large worlds: delay the target for two seconds and verify the source still renders/responds, crossing is gated, cancellation works and no save changes before commit. Then inject failure before and after commit and inspect the durable record. Measure preparation duration, crossing-to-first-frame delay, frame-time spikes, peak memory and repeated-travel disposal separately. Steady FPS does not measure travel latency.

Babylon asset containers and scene-readiness APIs are possible mechanisms. They do not implement permission checks, transaction ordering, cross-server reservations or recovery by themselves. A future SDK should expose a controlled prepare/activate/dispose lifecycle rather than giving guest code unrestricted host objects.

## What “always on” will require

The current Node server survives a player's browser closing. Its supervisor can recover an unexpected child-process exit. The PC, networking, storage and supervisor must remain available; Windows restart/autostart and redundant hosting are separate operating decisions.

Durable personal state can persist while a player is absent. That does not require rendering or continuously simulating every empty Home. Later architecture should distinguish stored content, scheduled world work, active simulation instances and rendered views. One central launch point does not imply one machine must simulate the entire eventual universe.

When capacity actually requires multiple instances, the platform will need authoritative identity/ownership, destination routing, admission reservations, version compatibility and a clear handoff of authority. Those services must preserve the same confirmed-travel semantics. Regions, storage providers and deployment products are not selected by this course.

## The product phases remain separate

### Finish LV1 acceptance

Complete two physical computers on the selected LAN interface, representative renderer/accessibility checks, controlled host-restart behavior, off-device restoration and independent full-soak verification. The original soak at `ce0edb` applies to that revision only. SDK clients on loopback do not render, certify physical LAN reachability or demonstrate five-device graphics capacity.

### S1: local creator proof

Define one versioned World SDK/project format for local tools and the browser editor. Carry prepared-world travel, capabilities and resource budgets into that contract before importing large creator worlds. Prove independently stoppable interpreted guest execution with bounded queues and a validated host bridge. A worker or Node `vm` alone does not establish safe arbitrary guest execution.

Then prove both authoring paths open equivalent projects and complete the local avatar/Home, approved customization, exact save/export/import and recovery journey. Guest worlds must not gain direct account/database/access-control authority or silently overwrite player-owned appearance. S1 remains planned until its own deliverables and hostile cases pass.

### S2: accounts and shared core

Introduce real accounts, ownership, data migration/export/deletion, eligible discovery, authoritative rooms and text. Store and enforce permissions on the server. Hiding a mesh or button is not access control. Revalidate availability, access, version, appearance compatibility and coordinates on resume.

### S3: world and party voice

Prove microphone lifecycle, explicit outgoing route, proximity/party recipients, travel continuity, mute/block/revocation and forbidden-delivery behavior. Media remains outside guest code. Voice is a different protocol/operations problem from synchronized position data.

### S4: trusted publishing

Validate source, assets, provenance, capabilities, budgets and compatibility; assign immutable versions; enforce trusted release grants; support rollback, delist and quarantine. A local validator is not a publishing service or a permission grant.

### S5: worldwide/all-age operation

Verify representative devices/accessibility, region/age/guardian eligibility, privacy processes, moderation and appeals, incident coverage, sustainable cost and independent readiness review. The ambition remains visible while evidence determines release scope. A classroom prototype, synthetic load test or checkbox cannot establish worldwide readiness.

AI personas, an economy, federation, native clients and XR remain later exploration. Preserve the operating and authority boundaries before choosing those products or collecting new categories of user data.
