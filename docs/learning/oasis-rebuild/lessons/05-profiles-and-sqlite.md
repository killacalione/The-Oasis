# Lesson 05 — Give a profile a durable record

**Start:** [Lesson 04](04-local-exploration.md). **Finish:** a local HTTP server creates a pseudonymous profile in SQLite and a returning browser retrieves it. Movement is still local in this stage; moving the avatar does not yet save its new position.

Read the complete [store](../../../../workshop/steps/05/src/server/store.ts), [HTTP routes](../../../../workshop/steps/05/src/server/http.ts), [server entry](../../../../workshop/steps/05/src/server/index.ts), [browser profile helper](../../../../workshop/steps/05/src/client/profiles.ts) and [browser entry](../../../../workshop/steps/05/src/client/app.ts). Apply the [stage overlay](../../../../workshop/steps/05/) over the earlier files, or materialize lesson 5 into another empty folder.

## Three places can hold different information

| Place | What this stage keeps there | What happens when it closes |
| --- | --- | --- |
| Browser memory | The current local position and rendered view | Reload discards that live position |
| Browser local storage | A random profile token | The same browser origin can retrieve it later, unless storage is blocked or cleared |
| Server SQLite file | Profile identity, nickname, color, confirmed location and revision | The record remains when the Node process stops |

The token is a credential, not the complete profile or an account password. The database stores its hash. Losing the browser token does not delete the database record, but this course has no lost-key recovery service. Keep tokens, invitations and databases out of public source and shared notes.

## Build it in order

1. Add `src/server/store.ts`. Open `workshop.sqlite` inside the selected data directory and create the profile table if it is absent. The default is `.local/data` inside your learning project. Leave a running pilot's data directory untouched.
2. Create profiles from validated nicknames and listed colors. Generate identity and token on the server. Every new profile starts in the Hub; the small X offset spaces classmates apart. Begin its save revision at 1.
3. Use prepared statements and bound values for profile fields and token lookup. A value is data for a placeholder, not text to splice into an SQL command. Read the [Node SQLite reference](https://nodejs.org/docs/latest-v24.x/api/sqlite.html) alongside the pinned source; this course uses `DatabaseSync` on Node 24.22.1.
4. Add the HTTP helper and server entry. Serve only the named browser assets and explicit API routes. Check the expected host/origin and accept a bounded JSON object for profile creation. Return a useful error instead of treating malformed input as a profile.
5. Add `src/client/profiles.ts`. Request the local classroom invitation, submit nickname/color/invitation, store the returned token, and use it when retrieving the profile. Show request failures in the feedback region.
6. Replace the browser controller with the lesson-05 version. Use the returned nickname, color and saved location for arrival. Continue local movement from lesson 04. Do not connect the Save button or claim that local travel updated SQLite yet.
7. Read `Store.save` and its test now, even though the browser does not call it in this stage. It checks the expected revision, commits one transaction and returns a new confirmed profile. A stale revision or failed write must leave the earlier record intact. Lesson 07 connects this responsibility to live movement and commands.

The workshop serves its invitation to the local browser and binds only to `127.0.0.1`. This is a loopback classroom convenience, not a private invitation-delivery or public account system. Keep the host/origin checks and do not widen the binding to demonstrate multiplayer.

## Trace creation and resume

```text
form submission → HTTP request → validate fields and invitation
→ create profile record → return token and profile
→ browser retains token → later request retrieves stored profile
```

The browser's request is asynchronous: the response arrives later. The SQLite calls in this small store are synchronous: they finish or throw before the next statement in that function. Neither property means an arbitrary rendered position was committed.

## Run and verify

In the lesson-05 learning folder:

```powershell
npm run check
npm test
npm start
```

Create a profile and record its nickname, color and initial location without recording its token. Stop your foreground server with Ctrl+C, restart it in the same project/data directory, reload the same browser origin and use Resume. The stored profile should return.

Move before another reload. This stage returns to its stored location, because movement is still browser memory. That is the intended boundary, not proof of a broken database. The [store test](../../../../workshop/steps/05/tests/store.test.ts) separately exercises a committed save, a stale-revision conflict, rollback after an injected write failure and reopening the same test database.

## Predict, then inspect

- Clear the token only in a disposable classroom browser context. Predict why the server record still exists but automatic resume is unavailable. Use a new test profile rather than editing a personal database.
- Restart with a new, empty lab data directory. Explain why the old browser token cannot identify a record in that different database.
- Compare an HTTP error with a SQL failure in the supplied test. Identify where each is detected and what feedback reaches the caller.
- Explain why world version, coordinate frame and save revision are three different fields.

**Move on when:** you can distinguish the token, the live position and the stored record, and trace creation/resume across browser and server. Continue to [Lesson 06](06-authoritative-multiplayer.md).
