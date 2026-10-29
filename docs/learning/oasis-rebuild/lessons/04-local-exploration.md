# Lesson 04 — Move, look around and change worlds locally

**Start:** [Lesson 03](03-render-one-world.md). **Finish:** one local avatar explores two worlds with natural camera-relative controls and bounded scene resources. This is deliberately still a single-player stage; Sunday moves position authority to the server.

Read the complete [stage overlay](../../../../workshop/steps/04/), especially the [browser controller](../../../../workshop/steps/04/src/client/app.ts), [view](../../../../workshop/steps/03/src/client/view.ts) and [world data](../../../../workshop/steps/02/src/shared/worlds.ts).

## Build it in order

1. Track held keys in a set. Keydown adds; keyup removes. Clear held input on blur/hidden document so a lost keyup cannot leave the avatar moving indefinitely.
2. Convert W/S and D/A to forward/right axes. Opposing keys cancel. Add held-button equivalents with meaningful labels and release/cancel handling.
3. Calculate the world-space direction from camera yaw, then normalize it. Use the pure movement function and elapsed seconds to advance the local avatar. Do not move a fixed distance on every rendered frame.
4. Add an orbit camera. Store yaw and pitch, use a fixed radius and look toward a point above the avatar. Clamp pitch above the flat ground and away from a vertical flip. Provide arrow-key/view-button alternatives.
5. If using mouse look, request pointer lock from a user gesture. React to actual lock state. Capture denial retains controls; Escape clears input and restores focus. Never hide the only error/status region.
6. Define a second world with a distinct color/shape arrangement and spawn. Keep both definitions in shared data. A world ID selects content; it is not a URL to execute arbitrary creator code.
7. Connect a destination control to local travel. Clear held input and place the avatar at the target spawn. Keep the same engine; dispose the old scene before constructing the new one in this introductory stage.
8. Repeat travel several times and inspect scene/resource counts with the browser tools or supplied diagnostics. Counts should return to a bounded range rather than increasing without limit.

## Understand the coordinate basis

For this camera arrangement:

```text
forward = (-sin(yaw), -cos(yaw))
right   = (-cos(yaw),  sin(yaw))
direction = forward × forwardInput + right × rightInput
```

At yaw zero, forward points along −Z and screen-right points along −X. A world-X assumption can therefore reverse the visible controls. Test screen direction at multiple headings; one world-axis sign check is not enough.

Pitch is a local viewing angle. It must not raise the player's Y coordinate or alter ground movement speed. When the camera moves vertically, movement remains projected onto the ground.

## Run and verify

```powershell
npm run check
npm test
npm start
```

Check W/S and A/D, then turn approximately a quarter turn and repeat. Hold each visible movement button. Test vertical orbit, pitch bounds, releasing inputs, resizing and returning from the second world. Try keyboard-only travel and readable focus. Test actual mouse capture only where the browser permits it.

## Exercises and boundaries

- Replace elapsed-time movement with a fixed distance per frame. Predict how a slow renderer and a fast renderer differ; restore the correct calculation.
- Reverse the right vector. Observe both keyboard and matching button behavior, then fix the shared basis once.
- Forget old-scene disposal in a scratch copy. Observe rising counts after repeated travel, then restore disposal.
- Explain why the quick scene switch is not proof of downloaded assets, prepared destinations or cross-server handoff.

This introductory replacement lifecycle is simple because the worlds are tiny and bundled. The product requirement for future worlds is [continuous presentation](../FOLLOW-ON.md#continuous-presentation-and-prepared-travel): keep the source playable while preparing the destination. Do not promise that this stage implements that larger runtime contract.

**Move on when:** your controls match the view, motion uses seconds and scene changes release old resources. Continue to [Lesson 05](05-profiles-and-sqlite.md).
