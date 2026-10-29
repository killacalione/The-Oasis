# Lesson 07 — Confirm saves before reporting travel success

**Start:** [Lesson 06](06-authoritative-multiplayer.md). **Finish:** Save and world travel commit a profile record before the server reports success. A portal crossing and an accessible menu use the same command path.

Read the complete [room](../../../../workshop/steps/07/src/server/room.ts), [browser controller](../../../../workshop/steps/07/src/client/app.ts), [portal tracker](../../../../workshop/steps/07/src/client/portals.ts) and [travel tests](../../../../workshop/steps/07/tests/travel.test.ts). Apply the [stage overlay](../../../../workshop/steps/07/) while retaining the [store](../../../../workshop/steps/05/src/server/store.ts) and earlier helpers.

## Live is not yet durable

The live player map can be newer than the last committed profile. This stage adds a five-second movement checkpoint, an explicit Save action and a save on leaving. A process interruption can lose movement after the last successful commit. The interface displays the confirmed save revision separately from the live coordinates.

For travel, order matters:

```text
validate request and destination → commit destination profile
→ replace live location → send confirmed profile and result
→ browser can report success
```

If the commit fails, keep the previous confirmed record and the source live location. Showing a destination first and hoping storage succeeds later would give the visitor a false success.

## Build it in order

1. Add a `command` message with a bounded request ID and an action of Save or Travel. Check its exact fields. For travel, accept only the destination permitted by the current world's definition; do not trust a client-supplied location.
2. For Save, take the server's current player location and call `Store.save`. Its revision check prevents an old profile copy from silently replacing a newer record. Only replace the room's confirmed profile after the store returns successfully.
3. For Travel, compute the destination spawn on the server and commit it first. Then clear retained movement input, update the live player and send confirmation. Keep the existing room and connection; changing worlds is not a new server join.
4. Cache successful command results by request ID and message fingerprint. A matching duplicate receives the earlier result; different content with that ID is rejected. Read the limit: this cache retains at most 64 successful results per active session. It is not a durable, unlimited exactly-once service across reconnects or restarts.
5. In the browser, keep pending requests by ID, clear held input while an action is pending and show errors. Resolve an action only when its matching result arrives. Refresh the confirmed-profile display from the server's `saved` message.
6. Add the portal tracker. Compare successive received authoritative positions against the portal plane and opening width. Start disarmed when resuming inside its region. A crossing consumes its entry, including a failed or suppressed attempt; leave the opening and cross again to retry.
7. Route the visible Travel and Save buttons through that same command function. Keep feedback readable outside mouse capture. A portal is an input convenience, not a server permission boundary: menu travel is also allowed.

The tracker interpolates where the segment between two positions meets the plane. Merely drawing a glowing frame, standing near it or testing the final point's distance would not implement that crossing behavior.

## A missing reply is an uncertain outcome

The browser waits six seconds for its result. A timeout or lost connection does not prove the server rolled the transaction back: it might have committed before the reply was lost. Show the uncertainty, reconnect and inspect the stored profile instead of asserting that travel failed or retrying every frame.

The native travel test checks matching duplicates within one session. It does not establish that an identical request ID can never execute again after its cache entry is removed or the process restarts. Keep that distinction when designing later recovery work.

## Run and verify

```powershell
npm run check
npm test
npm start
```

Enter your lab profile, move, use Save and record the confirmed revision and location. Use menu travel, then walk through a portal opening. Verify destination, coordinate display and confirmed revision. Reload and Resume; stop/restart the same lab server and Resume again. Compare the stored world and coordinates, not just whether a page appeared.

The [travel tests](../../../../workshop/steps/07/tests/travel.test.ts) use an isolated database to reject an unavailable destination, repeat a successful request once, inject a write failure and restart the server process. They also exercise portal re-entry. Keep deliberate SQL failures inside those test fixtures; never add a failure trigger to a personal or running pilot database.

## Predict, then explain

- When a write fails, name the record and live location that must remain unchanged. Explain why the server sends an error instead of a success result.
- Resume inside the portal region. Predict why no automatic travel occurs until a fresh valid crossing.
- Lose the connection while a request is pending. Explain why reading the confirmed profile is safer than guessing the result from the old picture.
- Compare a duplicate within the current session with the same ID after a restart. Identify the cache's lifetime rather than claiming permanent deduplication.

These tiny worlds are bundled ahead of time and switch scenes locally. This lesson does not add asset streaming, remote-room handoff or the future [prepared-world lifecycle](../FOLLOW-ON.md#continuous-presentation-and-prepared-travel).

**Move on when:** you can trace intent, validation, commit, acknowledgement and presentation, including a failed write and a lost reply. Continue to [Lesson 08](08-verification.md).
