# Recorded product requirements

Preserved from the later discovery PRD. Requirement IDs remain stable; observed implementation is recorded separately in WORK-STATE. Personal funding/availability context is excluded.

| ID | Requirement | Acceptance / open evidence |
| --- | --- | --- |
| R-001 | Persistent online identity | A user's approved identity/profile survives reconnect and participating-world transitions | Requirement; unimplemented |
| R-002 | Social presence and communication | Participants discover one another and communicate under room permissions | Requirement; LV1 implements bounded shared presence; communication and full access policy remain unimplemented |
| R-003 | Worlds and personalization | Users enter different supported worlds and choose permitted avatars/pets/items | Requirement; LV1 implements three built-in worlds and colors; broader personalization/pets/items remain unimplemented |
| R-004 | Many access forms | Selected client types use shared services, with documented capability differences | Requirement; exact parity unknown |
| R-005 | AI characters/experiences | Users interact with labeled AI recreations and source-grounded historical material | Requirement; labeling/source method proposed |
| R-006 | Eventual digital economy | Chosen purchase/earning model preserves entitlements and has defined user terms | Requirement; model unknown |
| R-007 | Open-source contributions | A licensed repository and contribution workflow allow outside work | Requirement; public GitHub repository and Apache-2.0 choice recorded; see D-034–D-036 and current work evidence |
| R-008 | Long-running phased project | Versions have measurable scope and maintained decision/release records | Requirement; proposed milestones |
| R-009 | First release includes children, teens and adults | Reviewed age-appropriate creation/account/sharing flows support eligible users of each group | Requirement from round one; unimplemented |
| R-010 | Prefer free resources and lowest possible cost | Baseline avoids required paid subscriptions; actual hosting/AI limits and credits documented | Requirement from round one; hard ceiling unknown |
| R-011 | World creation/personalization is a core first-version capability | Creator codes, modifies, previews, saves and reopens a world; creation remains one major capability of the larger hub | Requirement; original creator-first wording clarified by owner on 2026-10-15; code/scripting remains selected |
| R-012 | Public world sharing and social interaction | Eligible users discover/join publicly listed worlds and interact under defined permissions | Requirement; text/proximity/party media selected |
| R-013 | Code/scripting is primary creator method | Creator uses a documented world API and tests/publishes a scripted world | Requirement; SDK/runtime unimplemented |
| R-014 | Both coding workflows from start | Same project/SDK works through local tooling and integrated browser editor | Requirement from round three; unimplemented |
| R-015 | Text and proximity voice | World participants communicate through permitted text/spatial voice routes | Requirement from round three; routing/policies unimplemented |
| R-016 | Party/group voice | Eligible group members communicate independently of world transitions | Requirement from round three; persistence behavior proposed |
| R-017 | Trusted creators publish directly | Trusted role can release a valid version without routine human approval of each release | Requirement; trust policy unknown |
| R-018 | Child communication within age group | Server-authorized cohort rules govern protected public text/voice delivery; scope and bands defined | Requirement from round four; details unimplemented |
| R-019 | Worldwide from first public release | Global availability objective with documented lawful regional account/feature rules | Requirement from round four; country review incomplete |
| R-020 | Owner limited maintainer capacity | Milestones/operating plan distinguish limited owner effort from live coverage | Requirement from round four; staffing unknown |
| R-021 | First-demo exploration, personalization and portals | Visitor explores, changes an approved personal configuration, travels and returns with choices intact | Requirement from round five; LV1 implements exploration, colors and confirmed portal travel; personal-space customization remains planned |
| R-022 | Owner-selected personal-space visibility | Owner chooses requested visibility at creation; online visits follow current mode and platform eligibility | Requirement from round six; modes/defaults/editing and enforcement proposed |
| R-023 | Portable development workflow | Selected capable clients/models work from shared project state and acceptance, with verified handoffs | Requirement from round seven; development capability, not a product-side AI launch feature |
| R-024 | The Oasis has a central Hub launch and first-arrival experience | A new account creates/selects an avatar then first spawns in the Hub; the launch dashboard remains available and first arrival cannot be bypassed | Requirement recorded 2026-10-15; LV1 has test-profile onboarding/Hub/dashboard; real accounts and the full arrival product remain unimplemented |
| R-025 | Players own and control avatar/outfit selection | Worlds cannot silently replace, remove or overwrite the player's selected appearance; incompatibility blocks entry or asks the player explicitly | Requirement recorded 2026-10-15; LV1 preserves simple player colors in built-in worlds; full outfits, entitlements and creator-world compatibility remain unimplemented |
| R-026 | Returning players can resume their confirmed exact location | Default Resume stores world/version, coordinate frame, exact XYZ/facing and confirmed save revision; post-onboarding choice can select Resume, Always Hub or existing Always Home; invalid/denied resume preserves its record and offers recovery | Requirement recorded 2026-10-15; LV1 implements confirmed test-profile location/recovery; real accounts, arrival preferences and Homes remain planned |
| R-027 | World travel preserves a usable world view | Prepare an authorized destination while the source stays playable; enable crossing when ready without a blocking loading screen. Before commit failure preserves source/save; after commit recover the confirmed destination. Bound residency and measure readiness, presentation and disposal. | Requirement selected by owner 2026-10-26, D-044; general staged runtime and creator-world enforcement are planned, not established by LV1's fast bundled-world switches |

## Dated scope clarification — 2026-10-15

The initial interview record called world creation/personalization the first-version focus (R-011, D-010). The owner has clarified that **The Oasis is a central launch and social hub**, not a product focused only on creating worlds. Keep creator coding, personalization and trusted publishing as core capabilities and preserve R-011’s stable ID; interpret them within the larger player journey. New accounts first create/select an avatar and arrive in the Hub (R-024); dashboard, discovery, player-owned avatar/Home and world creation are complementary parts of the product. Returning session and appearance ownership are separately traceable in R-025–R-026. Historical source wording remains in the legacy crosswalk.
