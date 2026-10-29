# Lesson 01 — Make the browser respond

**Start:** [Student setup](../STUDENT.md). **Finish:** a small form changes a player object and renders its current values. No 3D or network is needed yet.

Complete files: [HTML](../../../../workshop/steps/01/src/client/index.html), [CSS](../../../../workshop/steps/01/src/client/style.css), [JavaScript](../../../../workshop/steps/01/src/client/app.js). Visible tooling: [template](../../../../workshop/template/).

## What you are learning

HTML gives elements meaning: a heading, a label, an input and a button. CSS changes their appearance. JavaScript listens for an event and performs work. An object keeps related values together. Rendering here means writing those values into the page; later it will also mean drawing 3D frames.

Keep the player object separate from the text that displays it. The page is a presentation of state, not the state's only storage location.

## Build it in order

1. Create a new empty learning folder. Reproduce the visible template package/build/server tooling there, keeping paths intact. Open `package.json` and identify what `npm start` will execute. The tooling serves a local page; it is not yet a multiplayer authority.
2. Create `src/client/index.html`. Add the document language, a title, a main heading and a form. Give the nickname input a visible label. Give every element the JavaScript will select a stable ID. Add a status/output element and load the script as a module.
3. Create `src/client/style.css`. Make the form readable, preserve a visible keyboard-focus outline, and use enough contrast. Keep browser-native inputs/buttons so keyboard and accessibility semantics exist before adding a canvas.
4. Create `src/client/app.js`. Define one object holding the current nickname/color. Locate the form and output elements. Stop and check that each selected ID actually exists in the HTML.
5. Write a render function that reads the object and updates visible output with text. Use text content for user-supplied strings; do not treat a nickname as HTML markup.
6. Register a form-submit or button event handler. Prevent ordinary form navigation where appropriate, read the current input, update the object, then call render. Registration passes a function to the browser so it can run later.
7. Call render once to show the initial state. Compare the complete files after your version works. Explain each import, ID and function before copying a correction.

## Read this pattern aloud

```js
const player = { name: 'Explorer', color: '#65dcc0' };

function render() {
  output.textContent = JSON.stringify(player, null, 2);
}
```

`const` names an object reference. The braces group fields. `render` is a function; defining it does not call it. `JSON.stringify` turns the object's data into readable text. The output is a view of the object, not durable storage.

## Run and verify

In your learning folder:

```powershell
npm ci --ignore-scripts
npm start
```

Open the address printed by the foreground server, normally `http://127.0.0.1:2571`. Enter a nickname, activate the form with the keyboard and verify that the output changes without leaving the page. Inspect the browser console; expected syntax errors are zero. Stop your server with Ctrl+C before launching another instance on the same port.

For a known checkpoint instead, run the [materializer](../../../../workshop/materialize.mjs) from the course repository with `--lesson 1 --into` a new empty path, then install and start inside that generated folder.

## Predict, then break it

1. Update `player.name` but omit the render call. Predict which value changes and which view stays old; then observe it.
2. Call the handler during setup instead of passing it as an event callback. Predict when it runs.
3. Change one JavaScript-selected ID in the HTML only. Read the resulting error and trace which lookup no longer found an element.

Restore the working version after each experiment. Record the event → state change → presentation chain in your own words. Reloading still resets ordinary in-memory state; nothing in this lesson claims a save.

**Move on when:** you can locate the state object, event handler and render function and explain their order. Continue to [Lesson 02](02-types-and-contracts.md).
