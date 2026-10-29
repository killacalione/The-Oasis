# LV1 — private LAN visitor pilot

Authorized by the owner on 2026-10-26: simple original 3D, desktop browsers, 2–5 invited adults, this Windows PC, LAN only initially, visitor experience before creator tools. **Implemented** means source exists. LV1 stays implemented until its physical and extended-operation acceptance gates have actual evidence. S1 and S2 remain planned.

## What runs

The Concourse is the first Hub. Tideglass Island and Quiet Orbit are two original, bundled worlds. Each browser renders its view with Babylon.js. One Node/Colyseus process owns a fixed five-client session, movement, appearance, travel and save acknowledgements. It broadcasts state for the three built-in worlds; these worlds have no private-room policy. SQLite persists separate pseudonymous profiles and their last confirmed locations. There are no Homes, real accounts, chat, voice, publishing, imported assets or guest scripts.

The 3D scenery is original code-generated geometry. Decorative scenery has no general physics simulation. Movement is ground-level, five metres/second, bounded to each platform's circular traversable area. Crossing a glowing portal opening from either side requests confirmed travel; passing beside its pillars does not. Dashboard destination buttons are the non-spatial alternative. A selected color belongs to the player and follows travel. New profiles begin in the Hub. Returning profiles resume their exact acknowledged world/version/frame/XYZ/facing. Incompatible or corrupt saved locations are retained until the visitor explicitly chooses Hub recovery.

## Start on Windows

Run from the repository root:

```powershell
.\pilot\Start-Oasis.cmd
```

The wrapper uses a project-local, checksum-verified **Node 24.22.1** under ignored `.local/tools/`. It does not replace the system runtime. If dependencies are absent it runs the lockfile-based `npm ci --ignore-scripts`; `-InstallDependencies` requests a fresh dependency installation. It builds the pilot, then starts its restart supervisor. The default address is `http://127.0.0.1:2567`. Keep the launcher running; Ctrl+C stops it. No Windows startup task or service is installed.

For the first LAN test, explicitly select an IPv4 address actually assigned to an active Ethernet or Wi-Fi interface:

```powershell
# Replace this documentation example with the selected interface's real address.
.\pilot\Start-Oasis.cmd -LanAddress 192.168.1.50
```

The server rejects wildcard/public binding. The wrapper does not automatically select a VPN adapter, configure router forwarding, install another VPN, change power settings, or create firewall rules. LAN reachability and compatibility with the owner's existing networking remain a physical test gate. This is HTTP/WS on a trusted private LAN with test profiles; it is not an internet-hosting or sensitive-data configuration.

The host invitation is in `.local/lan-pilot/invite.txt`; share it only with the selected adult testers. The local loopback UI fills it on the host machine. A LAN visitor must enter it. Each browser receives its own random profile key, stores it locally and uses it to resume. The server stores only the key's hash. A profile can have one active connection. Lost/cleared browser keys have no account-recovery process; they are prototype credentials, not verified identity. A maximum of 50 stored profiles bounds accidental enrollment. The global simultaneous-client limit is five, including reserved seats.

## Controls and saves

- W/A/S/D move relative to the camera. Left/right arrow keys turn; up/down tilt the third-person orbit. Hold the visible movement/view buttons as an alternative. Pitch is local, bounded above ground and does not change movement speed or saved avatar facing.
- Mouse look is optional and supports horizontal and vertical motion. Successful capture hides the dashboard and expands the rendered world. Escape or lost capture restores the dashboard and clears held input. Capture denial leaves keyboard/button controls available. The browser may restrict capture on a plain-HTTP LAN origin.
- A nearby hint names the portal destination. Entry is observed from server-reported positions; the existing server-authorized travel/save operation remains authoritative. Travel consumes one crossing and clears movement. Loading inside an opening or a failed/pending travel requires leaving and crossing again; standing there never repeatedly requests travel. Travel/error feedback stays available during capture. Dashboard destinations and Return to Hub remain available after Escape.
- The dashboard remains available for world destinations, appearance, Save, Return to Hub and Leave.
- Movement is simulated at 20 Hz using server time. Invalid/oversized/nonfinite fields, client-supplied coordinates and cross-profile action fields are rejected. Inputs expire after 250 ms, clear after travel and stop being sent while the page is hidden.
- Travel, appearance changes, manual Save, five-second movement checkpoints and final disconnect save through SQLite transactions. Only committed writes receive a saved revision. A failed write keeps the last confirmed record and reports failure. Crash recovery is limited to that record.
- Duplicate successful command IDs within the connection's last 128 results return the same result. This bounded cache is not an across-reconnect exactly-once guarantee. Clients do not buffer or replay actions after disconnection. Reconnect explicitly reauthenticates and loads the confirmed save, including after a server restart.
- World content is bundled locally. Travel does not fetch arbitrary URLs. Renderer failures show a message and preserve the server's confirmed state; Return to Hub remains available. Browser storage failure produces a persistent warning.

## Data, backup and restore

`pilot/dist/` is generated application output. `.local/lan-pilot/` contains `oasis.sqlite`, its WAL/SHM files, a process lock, invitation, bounded logs and backups. Keep all of these out of Git and Pages. SQLite uses WAL, FULL synchronous durability, prepared parameters and optimistic save revisions. `node:sqlite` in this Node release is a release-candidate API, tested here for the bounded pilot rather than adopted as a public-production guarantee.

Using Node 24 in the current shell:

```powershell
$env:PATH = "$PWD\.local\tools\node-v24.22.1-win-x64;$env:PATH"
npm run pilot:backup
npm run pilot:restore -- --from .local/lan-pilot/backups/SELECTED-BACKUP.sqlite --into .local/restore-check
```

Replace the selected backup filename. Backup uses SQLite's online backup API and verifies integrity. Restore requires a separate empty directory and never overwrites current data. To verify recovery through the browser, stop the original server, then start the restored copy using the **same original host name and port** with only its data directory changed. Browser profile keys belong to that exact origin; another port or host name cannot read them automatically. For the default loopback launch:

```powershell
$env:OASIS_DATA_DIR = '.local/restore-check'
$env:OASIS_PORT = '2567'
npm run pilot:start
```

Open the same original URL and resume a known profile. Keep the original data directory untouched. Running a separate restored instance on a different port is also possible, but requires an explicitly transferred private test key for programmatic validation; do not paste keys into shared reports or treat new-profile enrollment as a successful restore test.

The live server makes daily and orderly-shutdown backups, retaining 14 automatic snapshots. Manual snapshots are retained until deliberately managed. Logs rotate at approximately 1 MiB through three previous files. Logging errors are counted without changing committed-save outcomes. A local backup on the same disk does not cover loss of that disk; off-device backup location and coverage remain unverified.

The supervisor restarts unexpected exits after three seconds and stops after five rapid failures. A live data directory cannot be opened by a second pilot server. A stale lock is reclaimed only when its recorded process is no longer running. If startup is refused, inspect the launcher/log before changing files; do not delete another running server's lock. No reboot is performed by this project.

## Commands and evidence

```powershell
npm run check
npm run build
npm run pilot:check
npm run pilot:test
npm run pilot:browser
npm run pilot:soak -- --hours 24
```

All pilot commands require Node 24.22.1. `pilot:test` includes the compatibility build and real SDK/HTTP/SQLite integration tests. `pilot:browser` uses Playwright with installed Chromium; `OASIS_BROWSER_EXECUTABLE` can select an existing compatible browser executable. CI installs the matching Chromium on its disposable runner. It writes screenshots and a JSON report under ignored `artifacts/lan-pilot/`.

`pilot:soak` runs an isolated server with five **synthetic SDK clients on loopback**, not five physical devices. It checks travel, confirmed saves, client count, failures, CPU/memory and liveness. Evidence is written under the printed `.local/soak-*/evidence/` directory: `summary.json` records running/passed/failed, start/due/completion times and tested revision; `samples.jsonl` contains minute samples. Early process termination is not a pass. A short run checks the harness only; it does not satisfy 24 hours.

`GET /healthz` and `/readyz` report liveness/readiness, exact revision, Node version, uptime, capacity, memory, cumulative CPU time, storage bytes and failure counters. API responses and logs omit profile tokens and invitation contents. HTTP and WebSocket requests enforce the configured Host/Origin. Only the fixed room can be joined; public room creation and discovery endpoints are denied. These tests do not certify public-service security.

## Acceptance still required

| Check | Required evidence |
| --- | --- |
| Two physical computers | Two independent desktop browsers on the selected LAN interface see each other, move and travel; a third uninvited browser cannot enroll. Local browser contexts are a separate automated check. |
| Capacity | Five simultaneous clients work; the sixth fails clearly without creating another room. |
| Durable state | Appearance and acknowledged exact location survive travel, reload, process crash/restart and restored backup. Failed writes, invalid worlds, changed clients and duplicate requests preserve the correct record. |
| Host/browser independence | Closing the host player's browser leaves another client connected. Test a controlled host restart separately; automatic Windows startup is not configured. |
| 24-hour operation | A full 24-hour run completes with recorded failures, resource use, saves and disconnects. Synthetic socket evidence does not establish multi-device rendering performance. |
| Rendering | At least 30 FPS at 1280×720 on the explicitly recorded desktop/browser/renderer. Keyboard, reduced motion, mouse release, reflow and repeated-travel resource cleanup are checked separately. |
| Release | Required site and pilot checks pass at the reviewed commit. Human maintainers merge. Pages uploads only the information site's `dist/`, never the pilot, credentials or data. |

Actual results, revisions and remaining gaps belong in [WORK-STATE](WORK-STATE.md) and [VERIFY](../../VERIFY.md). Keep S1 dual authoring/guest containment and S2 accounts/Home/access/text requirements intact. Remote access, voice, trusted publishing and public worldwide/all-age readiness retain their later gates.

## Research baseline

- [Babylon cameras and inputs](https://doc.babylonjs.com/features/featuresDeepDive/cameras/customizingCameraInputs/)
- [Colyseus rooms](https://docs.colyseus.io/room), [state](https://docs.colyseus.io/state), [server input](https://docs.colyseus.io/netcode/server-input)
- [Node 24 SQLite API and online backup](https://nodejs.org/docs/latest-v24.x/api/sqlite.html)
- Exact npm pins and transitive integrity are in the root lockfile. The modular Colyseus core/transport is used instead of its optional cloud/Redis/admin umbrella. Express is a runtime peer imported by that transport.
