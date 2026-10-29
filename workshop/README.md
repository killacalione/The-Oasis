# Runnable classroom checkpoints

`manifest.json` is the changed-file index. `template/` supplies the pinned standalone tools, license and package lock. `steps/01` through `steps/08` are cumulative **complete-file** overlays, not patch fragments. Read each changed file while building your own empty application; use a generated checkpoint only to compare or recover.

Generate one independent application:

```powershell
node workshop/materialize.mjs --lesson 4 --into .local/my-lesson-04
cd .local/my-lesson-04
npm ci --ignore-scripts
npm run check
npm test
npm start
```

Use Node24.22.1. Generation refuses a nonempty destination or symbolic-link ancestor and never installs packages or starts a server. Generated projects use port2571 on loopback, a distinct profile key and their own ignored data. Lesson08 adds `npm run browser`; see its generated README. Nothing imports the maintained pilot or needs its private data.

From a repository with dependencies installed, `node workshop/verify.mjs` materializes and type-checks/builds/tests all eight checkpoints without installing packages. `node workshop/verify.mjs --browser` verifies the final checkpoint with two isolated browser profiles and meaningful travel/save/control/failure cases. Reports and screenshots remain under ignored `.local/`. Physical LAN, hardware/assistive coverage and full pilot operation are separate evidence.

The classroom version deliberately omits the maintained pilot's fuller rate limiting, invalid-location recovery UI, data-directory process lock, log rotation, automatic backup/restore, restart supervisor and soak. It never binds beyond127.0.0.1. Do not treat a checkpoint as an internet service or a completed creator platform. See the project learning guide for the source-backed architecture and follow-on lessons.
