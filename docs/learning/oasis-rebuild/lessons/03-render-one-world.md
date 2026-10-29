# Lesson 03 — Render one original world

**Start:** [Lesson 02](02-types-and-contracts.md). **Finish:** one Babylon engine draws a platform and a simple avatar from procedural geometry.

Read the complete [view module](../../../../workshop/steps/03/src/client/view.ts), [browser entry](../../../../workshop/steps/03/src/client/app.ts) and [stage overlay](../../../../workshop/steps/03/). Babylon is pinned to 9.32.0; use the supplied module imports rather than mixing scripts from unrelated examples.

## A scene is a collection with a viewpoint

The engine manages browser graphics resources. A scene groups renderable content. A camera gives the viewpoint. A light affects shading. A mesh supplies shape. A material supplies the surface. A transform parent lets several parts move together.

The avatar can be a body and head before it has animation or detailed art. The platform can be a cylinder or simple ground. Original primitive geometry keeps the first rendering problem small and avoids asset-download dependencies.

## Build it in order

1. Add a labeled, focusable canvas to the page. Preserve HTML controls and status outside it; a canvas does not automatically provide accessible controls for its contents.
2. Create `src/client/view.ts`. Receive the canvas rather than searching the whole page throughout the renderer. Import the specific Babylon classes used by the complete source.
3. Construct one engine and one scene. Set an explicit background. Create a camera and point it at the platform/avatar area.
4. Add a light, a platform mesh and a material. Position them deliberately. Name created objects so debugging a scene is easier than inspecting anonymous objects.
5. Assemble a small avatar under a parent transform. Move that parent to the spawn location. Explain why setting a child position and setting the whole avatar position differ.
6. Start one render loop that asks the current scene to draw. The loop is repeated work, not a function that returns a completed picture once.
7. Connect the browser controller to the view. Keep nickname/color state in the controller/shared data; pass information into the renderer. Update canvas size when its available space changes.
8. Add a clear error path if graphics initialization fails. The rest of the page should explain the failure rather than silently remaining blank.

## Trace the frame

```text
browser schedules frame
→ calculate elapsed time
→ update visual objects
→ scene.render()
→ browser presents pixels
```

The platform exists in world coordinates even if the camera points elsewhere. A dark view can indicate missing lighting; a blank view can indicate the camera or graphics context. Neither proves the HTTP server is unavailable.

## Run and verify

```powershell
npm run check
npm run build
npm start
```

Verify a visible platform and avatar, readable controls and no unexpected browser-console errors. Resize the window and confirm the canvas and render buffer adapt rather than stretching an old image. Use the status and browser developer tools alongside the picture.

## Predictable experiments

1. Change the platform material color. Predict which objects change; a shared material can affect more than one mesh.
2. Remove the light in a scratch version. Observe that scene construction and useful illumination are different concerns.
3. Change the camera target away from the avatar. Restore it after explaining the result.
4. Move the avatar's parent, then move just its head. Identify which transformation changes the assembled character.

Do not add a physics engine to fix a camera problem. The course uses ground-level movement and bounded positions; realistic collision is a separate future topic.

**Move on when:** you can point to the code creating the engine, scene, camera, light, avatar and render loop. Continue to [Lesson 04](04-local-exploration.md).
