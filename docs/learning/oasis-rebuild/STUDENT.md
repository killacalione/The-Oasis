# Student guide: build a place you can explain

You will write a small browser world, give an avatar controls, connect two visitors and remember a confirmed location. No programming experience is assumed. A guided weekend is an introduction; independent fluency comes from repeating the exercises and the follow-on work.

## What you need

- A desktop computer with an editor and a browser able to render WebGL.
- Git for obtaining the course source and recording your own checkpoints.
- Node **24.22.1** with npm available in the class terminal. The pilot scripts require Node 24; a generic “24 or newer” label is not the complete requirement.
- The course repository or instructor-supplied source package, with the exact dependency lockfile.
- Space for a new learning project. Keep it separate from any running pilot, personal profile database or soak directory.

Open a terminal and check the tools:

```powershell
node --version
npm --version
git --version
```

The Node output must be `v24.22.1`. Ask the instructor to resolve a different version before proceeding. Do not change firewall, VPN, power, router or startup settings as part of this course.

The workshop defaults to `http://127.0.0.1:2571`. `127.0.0.1` means this computer. Another computer cannot use your loopback address to reach your server. A physical LAN exercise requires a separately selected interface and operating decision; it is outside the default workshop.

## Two ways to work

**Build path:** start with a blank application folder. Read each lesson, create its named files, type and explain the code, and use the complete source files to check your work. The template provides visible package/build tooling; it does not conceal application behavior.

**Recovery path:** materialize a completed lesson into a new folder when you need a known checkpoint. From the course repository root:

```powershell
node workshop/materialize.mjs --lesson 1 --into ../oasis-lesson-01
cd ../oasis-lesson-01
npm ci --ignore-scripts
npm start
```

The destination must be absent or empty. The materializer refuses to merge into a nonempty project or follow a destination symlink. Stop and inspect an unexpected refusal; never delete your work just to make a command succeed. Use a new destination for another checkpoint.

The code links in the lessons show complete files. Their relative paths are paths **inside your learning project**, not commands to edit the full pilot. A later lesson may replace a complete file; compare it with your version to understand each new responsibility. Leave unmentioned earlier files in place.

Press Ctrl+C in the server terminal to stop a foreground workshop instance. Keep that terminal visible while learning; its errors are useful evidence. If port 2571 is occupied, stop your own previous workshop instance or choose another port for that terminal:

```powershell
$env:OASIS_PORT = '2572'
npm start
```

Do not stop a process merely because it uses a familiar port. Identify your instance first. Changing the port changes the browser origin, so it also changes which browser-stored profile key is automatically available.

## What the commands mean

| Command | Purpose | What success does not prove |
| --- | --- | --- |
| `npm ci --ignore-scripts` | Install the dependency versions in the lockfile | That your code is correct |
| `npm run build` | Produce files the browser/server can run | That types or runtime behavior passed |
| `npm run check` | Check the stage's source types | That network input is trustworthy |
| `npm start` | Build and start the local foreground application | That another physical device can reach it |
| `npm test` | Run the included non-browser checks for that stage | That graphics or keyboard behavior works |
| `npm run browser` | Run the stage's browser verification | That every device or browser was covered |

The installed stage determines which checks exist and which behavior they cover. Lesson 08 explains the complete verification flow. Package scripts are ordinary commands named in `package.json`; open that file and read them.

## Small vocabulary, used repeatedly

| Word | Meaning | Example |
| --- | --- | --- |
| Variable | A name referring to a value | `selectedColor` |
| Object | Related named values grouped together | `{ name: 'Aster', color: '#65dcc0' }` |
| Function | A named operation you can call | Calculate a movement step |
| Event | Something the program can react to | A click or a received message |
| Module | A file that explicitly imports/exports code | Share movement math between files |
| Promise | A value representing work that finishes later | A server request |
| State | Data describing a situation | The current player map |
| Client | A visitor's browser application | Draws that visitor's view |
| Server | A separate coordinating program | Decides shared movement |
| Scene | Renderable objects, lights and camera | The visible island |
| World | A named destination and its rules/content | `hub` or `island` |
| Room | A multiplayer session | The fixed shared session |
| Database | Durable structured records | Last confirmed location |
| Acknowledgement | A response confirming an operation's result | Save committed as revision 3 |
| Origin | Scheme, host and port together | `http://127.0.0.1:2571` |

An HTML file describes page structure. CSS describes presentation. JavaScript performs behavior. TypeScript checks additional development-time rules and is transformed into runnable JavaScript. Node executes JavaScript outside the browser.

## Read code with four questions

For each function, write short answers:

1. What information does it receive?
2. What information does it produce or change?
3. Where does it run: browser, server or build tool?
4. What happens if its work fails or arrives late?

For an unfamiliar line, identify names first, then operations. In `distance = speed * seconds`, the names have meanings and units. At five metres per second for 0.05 seconds, the distance is 0.25 metres.

## Your learning record

After each lesson record the stage, command, result and one explanation in your own words. For a failure, record expected behavior, observed behavior and the smallest change that fixed it. Do not put profile tokens, invitations, databases or personal logs into a public repository or shared worksheet.

Use independent browser profiles for two visitors. Two ordinary tabs can share the same browser-stored token and therefore represent the same person. The server deliberately rejects duplicate active connections for one profile. A normal/private pair or isolated automated contexts makes a clearer two-person experiment.

Begin with [Lesson 01](lessons/01-browser-events.md). Use the [architecture walkthrough](ARCHITECTURE.md) to understand the finished pilot, and the [instructor guide](INSTRUCTOR.md) for the exercise answers after you have attempted them.
