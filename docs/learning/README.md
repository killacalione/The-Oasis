# Learn to rebuild The Oasis

This package turns the visitor pilot into a beginner workshop and an engineering reference. The weekend builds a smaller application from a blank application folder: two procedural worlds, an orbit camera, movement, two independent visitors, portal travel and a confirmed SQLite save. The full pilot remains the reference for later recovery, operations and security lessons.

## Choose a route

| Reader | Start here | Continue with |
| --- | --- | --- |
| Student new to programming | [Student guide](oasis-rebuild/STUDENT.md) | Lessons [01](oasis-rebuild/lessons/01-browser-events.md) through [08](oasis-rebuild/lessons/08-verification.md) |
| Instructor | [Instructor guide](oasis-rebuild/INSTRUCTOR.md) | [Assessment and answer key](oasis-rebuild/INSTRUCTOR.md#assessment-and-answer-key) |
| Developer studying the existing application | [Architecture walkthrough](oasis-rebuild/ARCHITECTURE.md) | [Follow-on engineering](oasis-rebuild/FOLLOW-ON.md) |
| Reader checking a factual claim | [Sources and evidence](oasis-rebuild/SOURCES.md) | The linked source at the frozen reference revision |

The [workshop source](../../workshop/) contains complete files for each lesson and a checkpoint materializer. A generated checkpoint is a normal standalone project. The materializer does not install dependencies, start services, overwrite an existing project, copy the owner's profiles, or modify the visitor pilot.

## The eight lessons

| Lesson | Observable result |
| --- | --- |
| [01 — Browser events](oasis-rebuild/lessons/01-browser-events.md) | A form updates an explicit player object and its visible description |
| [02 — Types and contracts](oasis-rebuild/lessons/02-types-and-contracts.md) | A checked build and a tested, bounded movement function |
| [03 — One rendered world](oasis-rebuild/lessons/03-render-one-world.md) | An engine draws a lit platform and an avatar |
| [04 — Local exploration](oasis-rebuild/lessons/04-local-exploration.md) | Natural movement, orbit controls, two worlds and resource cleanup |
| [05 — Profiles and SQLite](oasis-rebuild/lessons/05-profiles-and-sqlite.md) | An invited test profile survives a server restart |
| [06 — Authoritative multiplayer](oasis-rebuild/lessons/06-authoritative-multiplayer.md) | Two independent browser profiles see server-owned movement |
| [07 — Confirmed travel](oasis-rebuild/lessons/07-confirmed-travel.md) | Save and portal commands commit before they report success |
| [08 — Verification](oasis-rebuild/lessons/08-verification.md) | Tests demonstrate behavior and name their coverage limits |

## Evidence boundaries

The application reference is [753ba4ffe15394f96f2dbbb6811d0fe20fee1522](https://github.com/killacalione/The-Oasis/tree/753ba4ffe15394f96f2dbbb6811d0fe20fee1522), reviewed on 2026-10-26. Its ledger records 18 native/integration tests and 18 browser checks. Those are pilot results, not a claim that a workshop checkpoint passed the same suite. Workshop results must identify their own revision, stage, environment and command.

The original 24-hour synthetic run was started against `ce0edb915efd8e08543412304604fd238682c723`. It was still running at the teaching-plan checkpoint on 2026-10-26. Consult the current [work ledger](../planning/WORK-STATE.md) and private run evidence for its eventual result. Do not substitute wall-clock duration or a summary label for sample coverage.

LV1 remains implemented with acceptance pending. S1 and S2 remain planned. Creating this educational package does not complete either phase or publish an application service.

## The travel rule we are carrying forward

Keep the current world playable while preparing a destination. Make crossing available when the destination is ready, without replacing the world view with a blocking loading screen. The current small bundled scenes make transitions quick; generalized prepared-world travel is a future runtime requirement. The distinction and failure ordering are explained in [Follow-on engineering](oasis-rebuild/FOLLOW-ON.md#continuous-presentation-and-prepared-travel).
