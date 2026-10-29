# Oasis weekend learning checkpoint

This is a standalone generated teaching project, not the maintained LAN pilot. It uses two original procedural worlds and a loopback-only server. No public hosting, accounts, guest scripts, backups, supervisor or global readiness is implied.

Use Node **24.22.1**. Run `npm ci --ignore-scripts`, `npm run check`, `npm test`, then `npm start`. The default URL is **http://127.0.0.1:2571/**. Set `OASIS_PORT` in this terminal to choose another port. Ctrl+C stops the foreground process. No process is started during generation.

Lesson 01 teaches events. Lesson 02 adds TypeScript/contracts. Lesson 03 adds procedural rendering. Lesson 04 adds local camera-relative movement and two worlds. Lesson 05 adds profile HTTP/SQLite (movement still local and not durably saved). Lesson 06 makes movement authoritative/shared (durable movement/travel arrives in 07). Lesson 07 adds confirmed Save, portal travel and reconnect. Lesson 08 adds browser automation. `lesson.json` identifies this checkpoint.

At lesson05+, the host generates `.local/data/invite.txt`; the loopback UI fills it. Every browser keeps a separate test token under `oasis-workshop-profile`. Use independent browser profiles/private contexts to test two visitors. New profiles always begin in Hub. Lost browser tokens have no account recovery. Never distribute your generated `.local/`, tokens or invitation as course source.

Data is under `.local/data/` or `OASIS_DATA_DIR`. The local directory is not a backup. Do not run two servers against the same data directory. This class deliberately omits the pilot's fuller operating safeguards; use the maintained pilot runbook for backup, restore, supervision and soak verification.

Lesson08: `npx playwright install chromium`, then `npm run browser`. Tests create disposable local data and an isolated server on a free loopback port; they never use port2567 or the active pilot's data. Reports stay under `.local/`.

Adapted from The Oasis source checkpoint753ba4f; see LICENSE and NOTICE.
