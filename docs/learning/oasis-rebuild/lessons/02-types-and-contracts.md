# Lesson 02 — Types, modules and shared meaning

**Start:** a working [Lesson 01](01-browser-events.md). **Finish:** a type-checked browser build, shared world/location definitions and independently testable movement math.

Complete additions/replacements: [typed browser entry](../../../../workshop/steps/02/src/client/app.ts), [world definitions](../../../../workshop/steps/02/src/shared/worlds.ts), [contracts](../../../../workshop/steps/02/src/shared/contracts.ts). Compare the [stage overlay](../../../../workshop/steps/02/) and [template tooling](../../../../workshop/template/).

## What changes

JavaScript still runs the application. TypeScript checks extra rules while you work. A module explicitly exports values/types and imports what it needs. A contract gives two parts of the program the same meaning for a message or record.

The `.ts` browser entry replaces the lesson-01 entry in the build. An earlier `app.js` may still exist in a cumulative checkpoint; read the build script to identify the entry actually bundled. File presence alone does not prove execution.

## Build it in order

1. Read the template's dependency pins, TypeScript configuration and build script. Identify the browser entry and output. Install from the lockfile rather than selecting unrelated latest versions during class.
2. Create `src/shared/worlds.ts`. Define the permitted world IDs and named world data: identity, appearance, boundary and spawn. Treat one metre as the coordinate unit and positive Y as up. Keep player movement on Y=0 for this exercise.
3. Define a location with world ID, world version, coordinate frame, XYZ and facing. Version identifies a content contract; the frame names the coordinate convention. Neither is the SQLite save revision introduced later.
4. Create `src/shared/contracts.ts` for the shapes that browser/server will eventually exchange. Begin with profile, movement input and command/result concepts supplied by the complete source. Do not put browser DOM objects into shared contracts.
5. Move the browser entry to `src/client/app.ts`. Add types to its state and selected elements. Keep the same visible behavior as lesson 01; the purpose is a checked boundary, not extra decoration.
6. Add pure movement calculations. Receive a location, input direction and elapsed seconds; produce the next location without accessing the DOM, network or database. Normalize directions, cap an extreme elapsed step, and keep positions inside the world boundary.
7. Read the stage's tests and run them. For each assertion, state what an incorrect implementation would do. A pure function is particularly easy to test because the same inputs should produce the same output.

## A contract is not a runtime guard

```ts
type MovementInput = {
  seq: number;
  dx: number;
  dz: number;
  facing: number;
};
```

This helps your editor/checker detect mistakes in your own typed code. It cannot stop another browser from sending `Infinity`, a string or an unexpected field. Runtime validation is a separate server responsibility in Sunday lessons.

Movement uses units:

```text
nextX = oldX + directionX × metresPerSecond × seconds
```

Use `max(1, vectorLength)` as the divisor when limiting a direction to unit length. It leaves small/zero vectors alone and prevents a diagonal vector of length √2 from creating extra speed.

## Run and verify

```powershell
npm run check
npm run build
npm test
npm start
```

The checker and build have different purposes. A successful bundle is not proof that the type check passed. Open the generated page and verify that earlier nickname/color behavior still works.

Deliberately assign a string where a numeric coordinate is expected. The check must fail. Fix it before continuing. Then reason about invalid runtime input: type annotations cannot reject that message after compilation.

## Exercises

- Calculate five metres/second × 0.05 seconds before running the function. Expected distance: 0.25 metres.
- Compare straight and diagonal direction lengths. Remove normalization in a scratch copy, observe the difference, and restore it.
- Try zero direction and verify no division-by-zero/NaN appears.
- Explain why changing a world version and incrementing a save revision solve different problems.

**Move on when:** you can explain input, output and side effects of the movement function and distinguish build, type check and runtime validation. Continue to [Lesson 03](03-render-one-world.md).
