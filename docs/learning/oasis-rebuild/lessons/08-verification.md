# Lesson 08 — Demonstrate behavior and name the limits

**Start:** [Lesson 07](07-confirmed-travel.md). **Finish:** repeatable checks demonstrate the classroom application's behavior, and your evidence record says which checkpoint, environment and scenarios were covered.

The only new stage file is the complete [browser verifier](../../../../workshop/steps/08/scripts/browser.mjs). It replaces the template's earlier browser placeholder. Read it with the [native travel tests](../../../../workshop/steps/07/tests/travel.test.ts), [course verifier](../../../../workshop/verify.mjs) and [checkpoint materializer](../../../../workshop/materialize.mjs). Lesson 08 retains the application built in lesson 07.

## Match each claim to a check

| Claim | Evidence to collect |
| --- | --- |
| Source has the expected types | Stage type check |
| Browser/server output can be produced | Build result |
| A movement calculation, store or protocol case behaves correctly | Its native test and assertions |
| The real page connects, responds and renders | Browser actions, observed state and unexpected errors |
| The learning package is portable | Materialize into another empty folder and verify its contents |
| Another physical PC can use the pilot | Separate authorized physical-LAN evidence, outside this lesson |

A green command proves only the checks it ran. Screenshots do not prove database commits, and native SDK clients do not exercise keyboard/canvas behavior. Automated software rendering does not certify a physical GPU.

## Build the final browser check in order

1. Build the generated lesson and create an isolated test data directory. Start its own loopback server on an available port. Do not reuse a personal database or stop an unrelated process occupying a familiar port.
2. Launch the matching Playwright Chromium browser. Use separate browser contexts for independent visitors. Contexts isolate browser storage, unlike two ordinary tabs sharing one profile. See the [Playwright context reference](https://playwright.dev/docs/browser-contexts).
3. Create two profiles and wait for the shared roster/state. Wait for an observable result with a timeout rather than assuming a fixed delay always means the network is ready.
4. Exercise movement relative to the actual camera at two headings, plus vertical orbit. Compare numeric state as well as visible feedback; an application that draws a picture can still move in the wrong direction.
5. Exercise menu travel, reload/Resume and exact confirmed-location recovery. In the isolated fixture, inject a failed write and verify the prior confirmed record and world remain intact.
6. Close one visitor and verify the other stays connected. Seed a separate test profile just before the portal, cross with actual keyboard input and verify that travel occurs once and held input clears.
7. Record unexpected primary-page errors, checks, versions and coverage gaps. Save the final screenshot as supporting evidence. Always close the browser and stop the test's own server in cleanup, including after an assertion fails.

Read the test's `finally` block before running it. Cleanup belongs to the test, not to an assumption that its happy path will finish. A server-process restart is a different scenario from a Windows reboot.

## Run the final generated lesson

In a materialized lesson-08 project, after installing its locked dependencies and matching browser:

```powershell
npm run check
npm test
npm run browser
```

The browser script builds the application and manages its test server; do not start a second foreground server for that command. If Chromium is missing, follow the [student/instructor setup](../INSTRUCTOR.md#before-class) for the pinned browser installation. A browser-launch failure is a tooling failure, not a passed or failed application scenario.

The generated lesson writes its browser report and screenshot under its ignored `.local/` directory. Keep a failed report when investigating a failure; record the correction and subsequent result rather than relabeling the old run.

## Verify the complete course separately

These commands run from the integrated course repository root, not from the generated student project:

```powershell
npm run workshop:check
npm run workshop:browser
npm run workshop:build
```

The first materializes and checks all eight checkpoints, including native tests and overwrite/protected-path refusal cases. It records whether the operating system allowed the symbolic-link fixture. The second checks the final checkpoint in a browser. The third produces the handbook/source package under ignored `artifacts/oasis-workshop/`.

Inspect generated handbook links, all eight lesson chapters and source appendices. Inspect the package manifest and extract the ZIP into a new scratch location; materialize a checkpoint from that extracted source. Verify the package excludes tokens, invitations, runtime databases, `.local`, dependencies and test outputs. A packaging command that exits successfully is not by itself proof that every lesson or link is present.

## Write a useful result

Record source revision or explicitly label a working tree, checkpoint number, date, exact Node/browser version, command, result and the behaviors actually exercised. Keep native, browser, physical-device and deployment evidence separate. Use the [evidence labels](../SOURCES.md#labels-used-throughout-the-package) and the [instructor assessment](../INSTRUCTOR.md#assessment-and-answer-key).

For the final exercise, show two visitors, close one, travel and demonstrate a confirmed location after restarting the lab server. Explain which program owns the live position and which record survives. A classmate should be able to follow your evidence without trusting a completion percentage.

**Finish when:** your checks are repeatable and you can explain both their results and their coverage limits. Continue with [Follow-on engineering](../FOLLOW-ON.md) for later recovery, security, operations and creator-runtime work. Workshop completion does not complete the full pilot's LV1 acceptance or the S1/S2 roadmap.
