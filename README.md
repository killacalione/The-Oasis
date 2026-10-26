# The Oasis

**The Oasis is an open-source project for a welcoming, persistent hub that connects people to personal spaces and community-made worlds.** People will be able to arrive in a central Hub, find a world to visit, personalize an avatar and Home, or build a world of their own. Creation is a core capability inside the larger hub experience; people should not need to write code just to visit.

## What exists today

The **F1 product definition and community foundation is verified**. A separate **LV1 private LAN visitor pilot is implemented**: a desktop-browser 3D Hub, two original worlds, shared presence for up to five invited adult testers, avatar colors, portal travel and acknowledged SQLite saves. It is not a public application service. Real accounts, Homes, creator tools, guest code, chat, voice and publishing remain unimplemented; S1 and S2 remain planned. The [pilot runbook](docs/planning/LAN-PILOT.md) and [work ledger](docs/planning/WORK-STATE.md) separate source, actual checks and the remaining physical/extended-operation gates.

## Try the private visitor pilot

On Windows, from this repository root:

```powershell
.\pilot\Start-Oasis.cmd
```

Open `http://127.0.0.1:2567`. The launcher uses an isolated Node 24.22.1 runtime and pinned dependencies without replacing system Node. Choose an avatar and enter the Hub. Follow the [runbook](docs/planning/LAN-PILOT.md) for explicit LAN binding, host invitations, controls, tests, restart, backup and separate restore. No firewall, VPN, power, router or Windows startup setting is changed by the launcher. Two physical computers and a full 24-hour run remain separate acceptance evidence.

## Start here

- New to the project? Read the [project brief](PROJECT-BRIEF.md) and [experience blueprint](docs/planning/OASIS-EXPERIENCE.md).
- Want to see what comes next? Read the [phased roadmap and acceptance gates](docs/planning/ROADMAP.md) and [requirements](docs/planning/REQUIREMENTS.md).
- Want current evidence? Start with [Progress](https://killacalione.github.io/The-Oasis/progress/) and [VERIFY](VERIFY.md).
- Want to contribute? Read [CONTRIBUTING](CONTRIBUTING.md), then discuss ideas or propose a small, testable issue.
- Looking for engineering boundaries? Follow [AGENTS.md](AGENTS.md), [architecture](docs/project/Architecture.md), [security](docs/project/security.md), [testing](docs/project/testing.md) and the task-specific handoff in [WORK-STATE](docs/planning/WORK-STATE.md). Use `roles/implementation-engineer.md` as the portable implementation role when assigned; native Codex prompts are client adapters, not portable instructions.

## Run the project information site

Requires Node.js 24 or newer. No dependency installation is needed.

```sh
npm run check
npm run build
npm run dev
```

Open the URL printed by the local server. The site reads `data/project-status.json`, generates five static routes and publishes no application accounts, comments, telemetry or product runtime. GitHub Actions validates pull requests and deploys only generated `dist/` from `main`.

## Contribute

Use the public [Discussions](https://github.com/killacalione/The-Oasis/discussions) for questions and early proposals. Use [Issues](https://github.com/killacalione/The-Oasis/issues) for bounded work with a clear outcome and acceptance criteria. Changes follow the protected `main` pull-request workflow. Read the [Code of Conduct](CODE_OF_CONDUCT.md); report vulnerabilities through [private security reporting](SECURITY.md).

## Product boundaries

The intended first public release serves eligible children, teens and adults and includes public world discovery, text/proximity/party voice and trusted direct publishing. These are requirements under research, not live services or launch-readiness claims. LV1 is only the authorized invited-adult LAN visitor slice. S1 remains an unfinished internal creator/local proof with no real accounts, online publishing, payments, recording or child-data collection. LV1 pins its own tested stack; public-service providers and production architecture remain unselected.

## Provenance and license

This foundation consolidates two supplied planning packages. The [merge report](docs/provenance/MERGE-REPORT.md) describes identical files, meaningful differences and preserved legacy requirements. Original inputs and an earlier prototype remain preserved locally; unreviewed input artifacts are excluded from publication. New maintained files and accepted contributions use [Apache-2.0](LICENSE). Third-party assets and code retain their own licenses and attribution; see [NOTICE](NOTICE) and [governance](GOVERNANCE.md).
