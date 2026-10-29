# Instructor guide

Teach a runnable idea, then make its failure boundary visible. Students should leave able to identify which process owns a position, which process draws it and which record survives a crash. Completing the full product, operating public servers and mastering programming independently are not weekend outcomes.

## Before class

1. Read the [student setup](STUDENT.md), [architecture](ARCHITECTURE.md) and all eight lessons.
2. Freeze the supplied course revision and dependency lockfile. Record the actual commit; do not silently teach from a moving branch.
3. Verify Node 24.22.1, npm, Git, an editor and a compatible desktop browser on the teaching machines. Download dependencies and matching Playwright Chromium before class if bandwidth is limited. Do not include `node_modules`, profile keys or runtime databases in a public course repository.
4. Materialize every checkpoint into separate empty scratch folders and run its available checks. Keep the final checkpoint ready as a recovery copy. Generated workspaces are disposable only when you deliberately identify them as such.
5. Use the default loopback port 2571 for the student app. A separate full-pilot reference may use port 2570. Leave an existing pilot on 2567 and any soak on its own port/data directory untouched.
6. Prepare two independent browser profiles or contexts for the multiplayer demonstration. A second ordinary tab may reuse the first token and correctly fail duplicate-profile admission.
7. Test pointer lock in the actual teaching browser. Keep keyboard/button controls available if the embedding environment denies capture. Check readable text, focus and keyboard travel controls.
8. Use a lab-only profile for crash/write-failure exercises. Never inject failures into a personal or running visitor-pilot database.

No firewall, router, VPN, power or Windows startup configuration is needed for the default workshop. Physical LAN work is a separate extension and requires explicit interface selection and evidence.

## A credible weekend schedule

Allow roughly 12–14 guided teaching hours, plus breaks and tool setup. A novice class will vary. Preserve the learning checkpoints if the class needs longer; do not compress the entire recovery/security syllabus into the last hour.

| Session | Guided time | Demonstration and student result |
| --- | --- | --- |
| Saturday 1 | 75 min | Files, values, events: form updates visible player state |
| Saturday 2 | 75 min | Modules, TypeScript and build: a checked contract and pure movement math |
| Saturday 3 | 90 min | Engine, scene, mesh/material/light/camera: one original world |
| Saturday 4 | 120 min | Frame time, coordinates and orbit: local exploration and two scenes |
| Sunday 5 | 90 min | HTTP and SQLite: invited profile survives restart |
| Sunday 6 | 120 min | Colyseus and authority: two visitors see server-owned movement |
| Sunday 7 | 90 min | Transactions and commands: confirmed Save and portal travel |
| Sunday 8 | 90 min | Assertions, browser automation and explanation: final verification |

If behind, reduce decorative geometry, colors and optional exercises. Keep server authority, commit-before-success, an accessible travel route and the distinction between observed and durable state. Use a materialized checkpoint to unblock syntax trouble only after the student can explain the skipped difference.

## Run each lesson as a short evidence cycle

1. Show the target behavior without opening the code.
2. Ask students to predict which responsibility implements it.
3. Introduce the smallest concept needed.
4. Add or change the named complete files, explaining imports and new functions.
5. Run the checkpoint command and observe the result.
6. Introduce one controlled failure; ask for a prediction before running it.
7. Record expected/observed behavior and the boundary that explains it.

Do not ask a beginner to memorize a library's complete API. Ask them to locate the entrypoint, trace values and explain the lifecycle. Keep a visible process diagram throughout Sunday.

## Demonstration script

Start with the final checkpoint and say: “This browser draws pictures. This terminal runs the shared server. This database remembers confirmed records.” Point to each surface.

Create one pseudonymous profile. Change its color and inspect the visible data/status. Open a second independent context, create another profile and observe the roster and avatar movement. Close the first browser and show that the second remains connected. The first browser was never the multiplayer host process.

Travel through a portal, explicitly Save and note the confirmed revision. Stop the lab server, restart it with its existing lab data, then reconnect. Verify world and coordinates rather than merely showing that the page loaded. Describe any motion after the last acknowledged save as potentially unconfirmed.

Finally show the full pilot's third world and operational checks. Identify those as later reference material, not secretly included weekend requirements. Explain why its fast bundled-scene transition does not yet implement general asset streaming or cross-server travel.

## Assessment and answer key

Use a paired demonstration plus short oral explanation. Award two points per item: one for correct observed behavior and one for the student's explanation. A minimum of 8/10 with no mistaken authority/save boundary is a useful workshop completion criterion; it is not a professional security certification.

| Prompt | Expected explanation |
| --- | --- |
| Which program decides the shared position? | The server validates intent and advances position on its simulation tick. The browser renders snapshots. |
| Which record survives restart? | A successfully committed/acknowledged profile record. Recent live motion can differ from that record. |
| Why are scene switches quick here? | Small procedural world code is bundled in advance; the app retains its server room/connection. There is still finite construction and communication work. |
| Why can two normal tabs fail the two-player exercise? | They can share one browser-stored profile token. The server rejects a second active connection for that profile. |
| Why does visible progress not prove completion? | A rendered change, a sent request, a durable acknowledgement, a passed test and a published release are different evidence. |

Ask one additional tracing question: “Start at a W key press and end at the other visitor seeing movement.” A correct answer includes input set → direction message → server validation → server step → synchronized state → rendering/interpolation. SQLite is not written on each rendered frame.

### Exercise answers by lesson

| Lesson exercise | Expected result and explanation |
| --- | --- |
| 01: change the object but omit rendering | Data changes while the page stays old; state and presentation need an explicit connection. |
| 01: move the handler call out of the event | The change occurs while loading instead of in response to the user's action. |
| 02: make a field the wrong type | The type check fails before running. A runtime malformed message still needs validation. |
| 02/04: remove vector normalization | Combined forward/right movement is about √2 times as fast when both axes are one. |
| 03: remove the light or move the camera target | The scene may still exist but appear dark or outside the view. A black view is not proof the server failed. |
| 04: use distance per frame instead of per second | Movement speed varies with rendering rate. Multiply speed by elapsed seconds. |
| 04: reverse the screen-right basis | A/D and matching buttons move opposite their screen labels at the tested headings. |
| 05: restart after confirmed creation/save | SQLite retains the record; browser storage retains the credential used to retrieve it. Clearing the credential does not delete the database record. |
| 06: send an oversized vector or stale sequence | The server rejects/limits it; clients cannot create extra simulation steps by sending faster. |
| 07: fail a database write | No success acknowledgement, unchanged last confirmed record, clear failure; a new valid request can succeed after repair. |
| 07: resume inside a portal region | No immediate automatic travel; leave/re-enter to create a new crossing. |
| 08: close one visitor | Other visitors keep their server connection. Killing the server is a different failure. |

## A short debugging ladder

| Symptom | Inspect first | Avoid this inference |
| --- | --- | --- |
| `node:sqlite` or runtime requirement error | `node --version` in the actual terminal | That a package manager install selected the right runtime |
| Browser cannot connect | Foreground server output and exact URL/port | That the firewall must be changed |
| Black or empty world | Browser console, WebGL availability, camera and light | That multiplayer is necessarily down |
| Profile already connected | Other contexts using that token | That the five-seat room is full |
| No second avatar | Distinct profiles, same world, synchronized roster | That a different world is a different private room |
| Save looks stale | Last acknowledgement and live position separately | That a rendered frame is a disk commit |
| Portal does not trigger | Crossing the opening, armed state, busy state and server result | That the mesh alone implements travel |
| Sidebar remains visible | Actual pointer lock result/error | That capture always succeeds in embedded browsers |
| Browser tests cannot launch | Matching Playwright browser installation/cache | That the application itself failed |

Change one variable at a time. Read actual source versions, console errors and process identities. Keep the last working checkpoint. A reset means materializing into another empty folder, not deleting a student's project or a running server lock.

## Record evidence rather than percentages

For each classroom run record date, course/source revision, checkpoint number, Node/browser version, command, expected result, observed result and coverage limits. Separate native tests, automated browser contexts and actual physical computers. Software-renderer FPS is useful but does not certify a physical GPU. A process restart is not a Windows reboot. A local backup is not an off-device recovery test.

After the workshop, use [Follow-on engineering](FOLLOW-ON.md) to add operating resilience in bounded lessons. Keep the pilot's LV1 acceptance and the larger S1/S2 gates independent of class completion.
