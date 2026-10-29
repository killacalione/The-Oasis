# Proposed World SDK and runtime boundary

Round-two owner requirement: code/scripting first; public sharing/social interaction for children, teens and adults in the first online release. **Proposed:** JavaScript/TypeScript SDK, Babylon.js renderer and QuickJS-in-Wasm in a dedicated terminable browser worker. This is a candidate for internal testing, not an implemented or approved hostile-script runtime. Both local VS Code/GitHub and integrated browser editing are required from start. Actual language/runtime/API details remain open. Both produce one bundle and use one validation/publish contract.

## Creator journey

Write a small world project using standard source files; validate/build; run isolated preview; inspect errors/logs; export/save a version; submit/publish under the selected policy; other eligible users discover and join the released world. Visitors can explore without writing code. AI coding tools can generate the same source/manifest later, subject to identical validation and permissions.

The API below is illustrative design notation, not an existing package or runnable supported code:

```typescript
export default defineWorld({
  setup(world) {
    const portal = world.spawn("portal", { position: [0, 0, 4] });
    portal.onInteract(visitor => world.requestTravel(visitor, "moon"));
  }
});
```

`requestTravel` proposes an action. The trusted host/server verifies target world, eligibility, current actor/session and permissions before performing it. The guest receives copied/limited visitor data, never the account object. No package name, import path or method implementation has been selected.

## Candidate contracts

| Boundary | Proposed capability | Verification requirement |
|---|---|---|
| World manifest | ID/version, author/provenance, assets, content rating, declared API capabilities | Reject unsupported versions, missing rights and unacceptable resources |
| Guest script | Approved object commands, transforms/materials, copied input/interaction events | No direct renderer/DOM/session/credential/private-data handles |
| Guest-host bridge | Plain bounded messages and explicit capability IDs | Validate ownership/IDs, finite numeric ranges, payload/queue size and commands per frame |
| Trusted renderer | Own actual Babylon objects and graphics assets | Separate mesh/texture/entity/GPU/command budgets; VM limits do not cover host work |
| Server | Membership, publication status, age/contact policy and durable/shared state | Validate user intents and authority, deny client impersonation/grants/balances |
| Publisher | Immutable/versioned released bundles and rollback/quarantine | Chosen review process, visible provenance, removal and update policy |

Start with interactive objects, simple events and permitted travel as a scope proposal. Demanding gameplay rules, arbitrary app code, npm/native dependencies, remote networking and server-side guest execution require separate decisions. Extend the versioned SDK over time without granting blanket host authority.

## Runtime experiment

QuickJS exposes heap/stack limits and interrupt callbacks [S54]. Execute guest JS inside that interpreter, not native worker `eval`/`Function`. Add independent main-thread watchdog/worker termination, bounded host callbacks/queues, reset/dispose on reload and restricted worker network/CSP. A worker is an execution compartment, not an automatic permission sandbox [S56]. Native Node `vm` is expressly unsuitable for untrusted-code security [S55].

Upstream issue 219 reports an expensive operation that did not call the interrupt handler [S60]. It was observed open by the reviewer but not reproduced; affected current revisions are unknown. Consequently interrupt callbacks alone are not a wall-clock guarantee. A watchdog still needs a responsive trusted host, and renderer/bridge work has separate limits. Select/pin a revision and test hostile cases before any public guest execution.

If iframe-based visual isolation is used, review separate origin, CSP, message authorization, permissions and navigation. Same-origin `allow-scripts` plus `allow-same-origin` can defeat the iframe boundary [S57]. SDK messages must be treated as untrusted even with an isolated frame. Wasm, TypeScript and source review do not themselves establish safety.

## Bounded internal spike

Two original code-authored scenes, one interaction/portal, Run/Stop, logs/errors, local save/export/reimport and no accounts/automatic uploads/remote AI. Add meaningful tests of infinite loops, large allocations, promise-job floods, oversized bridge messages, invalid IDs, forbidden API calls, repeated reload/dispose and worker termination. Confirm the editor/host remains usable and that rendering resources are bounded. Actual numeric thresholds depend on measured target hardware and remain Unknown.

A local Node room server can test two clients without adding cloud spending. Compare conventional Node rooms against a separate Workers/Durable Objects implementation after choosing social scope. Node compatibility flags do not prove the entire selected framework runs on Workers [S58]; active simulations may consume duration quotas instead of hibernating [S45]. No permanent free public-server or sandbox guarantee exists yet.

Full browser npm environments such as WebContainers add compatibility and licensing questions; commercial production API use needs a license under its current terms [S59]. They are optional authoring-tool choices, not a requirement for the first world SDK.

## Remaining decisions

Language/runtime and world API details; age/contact and moderator/publisher ownership; child parent/account rules and exact student benefits. Both authoring paths, text/proximity/party voice and direct trusted publishing are confirmed. See the concrete [v0.1 scope](V0.1-SPEC.md). See [public release](PUBLIC-RELEASE.md), [decisions](DECISIONS.md), [cost plan](COST-PLAN.md) and [sources](../research/SOURCES.md).

## Round-five visitor state and travel

Exploration, personalization and portals are selected (D-030). Proposed SDK lets code declare approved props/options and request host actions; visitors use trusted controls without coding. Keep immutable world source/version separate from a personal configuration referencing it. The host validates object ownership, IDs/transforms, target and lifecycle; online server authority additionally enforces owner/instance/version/edit and country/cohort grants. Guest code cannot choose public-home visibility, write another draft, navigate arbitrary URLs or change parties. See [demo design](DEMO-EXPERIENCE.md). Babylon supports interaction triggers [S82], but engine events alone do not establish this authorization contract.

## Round-six visibility authority

The space owner selects visibility through trusted creation/settings UI, not arbitrary guest code. S1 stores a requested preference only. Online server validates owner/space/action/current policy; a public mode does not grant editing, trusted publication, another cohort or media access. Imported project data cannot supply ownership/invite credentials. See [space access](SPACE-ACCESS.md).

## Continuous presentation requirement — R-027 / D-044

Future host lifecycle separates preparation, readiness, authoritative commit, presentation and retirement. Prepare only permitted destination versions/assets while the source remains playable. Scene/GPU readiness and server admission are separate checks; neither grants authorization. Delay or cancel preparation without discarding the source, mutating its confirmed save or presenting a fullscreen loading page. After durable travel commits, interruption must reconcile to that destination; do not overwrite it with an older source record.

Keep active/staged worlds and cache/queue/asset budgets bounded. Start with one source and one staged neighbor; cancel obsolete work and prove repeated-travel disposal. Validate cold/warm assets, unavailable targets, revocation, denied delivery, cancellation, post-commit lost responses, first-frame latency, frame-time spikes and peak memory. These are future SDK/runtime acceptance obligations, not implemented general creator support. The [workshop](../learning/README.md) explains LV1's bundled procedural shortcut and the later lifecycle.
