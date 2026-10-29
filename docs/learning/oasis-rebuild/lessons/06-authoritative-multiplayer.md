# Lesson 06 — Let one server decide shared movement

**Start:** [Lesson 05](05-profiles-and-sqlite.md). **Finish:** two independent visitors share one server-owned player map. Each browser draws that map; movement is no longer decided by its render loop. Durable movement saves arrive in lesson 07.

Read the complete [room](../../../../workshop/steps/06/src/server/room.ts), [server entry](../../../../workshop/steps/06/src/server/index.ts), [browser entry](../../../../workshop/steps/06/src/client/app.ts) and [network test](../../../../workshop/steps/06/tests/network.test.ts). The [stage overlay](../../../../workshop/steps/06/) replaces those files while retaining lesson-05 HTTP/storage helpers and earlier renderer/input modules.

## Input is a request, not a position

The browser reports a direction, facing and sequence number. It does not ask the server to trust arbitrary XYZ coordinates. The server validates the message and advances its own player position on its simulation tick. The other visitor sees synchronized state rather than reading the first browser's memory.

```text
held key/button → camera-relative direction message
→ server validates and remembers latest valid input
→ server simulation advances its player map
→ state patch reaches each browser → renderer updates the picture
```

The [Colyseus documentation](https://docs.colyseus.io/) explains room messages and state synchronization. Use the pinned source and lockfile for this course's exact API calls; examples for a newer release can use a different room interface.

## Build it in order

1. Define the synchronized player and room-state schemas in `src/server/room.ts`. A player has a session ID in the map and fields such as name, color, world ID, XYZ and facing. Keep profile credentials out of the synchronized player state.
2. Create one room with five total seats and keep it available after visitors leave. The server entry creates that fixed session and returns its ID through configuration. Joining an arbitrary new room is not part of this application.
3. Authenticate a join using the stored profile token. Reserve the profile during admission and reject a duplicate active profile. On join, populate its live player from the stored location; on leave, remove its live player and input tracking.
4. Receive `move` messages. Check exact fields, safe increasing sequence numbers, finite direction/facing values and their bounds. Replace the remembered intent instead of advancing position once for every packet.
5. Advance positions on the server's 50 ms simulation interval using the shared movement function. Stop using an input after 250 ms without refresh. Normalize and bound movement on the server even when the normal browser already does so.
6. Replace the browser controller. Fetch the room ID, join using its token and listen for synchronized state changes. Send current input every 50 ms. Let the render loop handle viewing and pictures rather than authoritative movement.
7. Handle Leave and Reconnect explicitly. Clear held inputs and release pointer capture on disconnect. This stage disables automatic reconnection; reconnect retrieves the confirmed profile and establishes a new session.

The world IDs still identify destinations inside one room. Five seats means five visitors total, not five in each world. Different-world rendering hides avatars from the picture; all members still receive the shared map, so visual filtering is not a confidentiality boundary.

## Keep the clocks separate

| Work | Timing in this checkpoint | Purpose |
| --- | --- | --- |
| Browser render loop | As the browser schedules frames | Draw and update the local view |
| Browser movement message | Every 50 ms | Refresh intended direction |
| Server simulation | Every 50 ms | Advance authoritative position |
| Room state patches | Every 50 ms | Deliver state changes |

Extra packets do not create extra simulation ticks. A faster renderer does not grant a faster avatar. SQLite is not written on each frame or tick: this stage loads the saved profile but does not yet persist its ongoing movement. Its Travel control is disabled until the next lesson.

## Run and verify

```powershell
npm run check
npm test
npm start
```

Open the printed loopback URL in two independent browser profiles or a normal/private pair. Create different profiles. Verify the roster shows two visitors, each sees the other's movement in the same world, and closing one visitor leaves the other connected. Keep the server terminal running; neither browser is the server host.

Two ordinary tabs can share one local-storage token and correctly fail duplicate-profile admission. They are not a reliable two-person fixture. After reconnecting, this stage restores the stored location rather than promising persistence of its recent live movement.

## Experiments with a boundary

- Read the network test's oversized-vector and stale-sequence cases. Predict why neither should advance the player after input has expired.
- Stop sending input in a scratch client. Compare the 250 ms expiry with instantly stopping when a real keyup sends zero direction.
- Close one browser, then separately stop your lab server. Explain why the first leaves another connection alive and the second disconnects everyone.
- Trace a W press through both programs and identify the single function that applies the authoritative movement step.

The included tests exercise real local HTTP and SDK clients; they are not evidence of two physical computers, hardware rendering, unrestricted network exposure or the full pilot's operating resilience.

**Move on when:** you can identify who owns the live position and explain why state synchronization is not durable storage. Continue to [Lesson 07](07-confirmed-travel.md).
