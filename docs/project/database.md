# Data and persistence

## Current foundation site

The information site has no application database, account system or visitor submission flow. Public project status is versioned JSON in Git. The static information site does not collect identity, Home, world or behavioral records and has no analytics/tracking integration. It uses `sessionStorage` only to carry the visitor’s selected visual theme and motion preference across site routes in the current browser session. GitHub’s hosting request processing is separate from product data behavior.

## LV1 private test data

The [LAN pilot](../planning/LAN-PILOT.md) uses a schema-versioned SQLite database in ignored `.local/lan-pilot/`. Its bounded profiles contain an ID, random-key hash, nickname, chosen color, exact versioned location, save revision and timestamp. Keys remain in their browser's local storage; a key is a limited prototype session credential, not real identity. Server-issued identity selects records; client-provided owner IDs cannot authorize writes. Optimistic revisions and FULL/WAL transactions protect confirmed saves. Live movement is separate from the last acknowledged database record. Malformed/unavailable saved locations remain unchanged until explicit Hub recovery.

Online backup and separate-directory restore are provided; restore never overwrites existing state. Daily/shutdown snapshots and rotated logs are private and excluded from publication. Backups inherit profile-key hashes and must stay private. Lost browser keys have no account-recovery feature. Off-device backup coverage remains unverified. This pilot schema is not an adopted public account or Home database.

## S1 local proof

S1 proposes a clearly labeled local profile and project/draft storage with export/import. No user account, authentication, cloud sync or online access grant exists. A Home creation choice records local **requested** visibility. Imported creative data cannot establish account ownership or import invitation/publisher credentials. A storage result is “saved” only after the transaction completes; errors/abort/corrupt imports preserve the last known-good state. Periodic confirmed saves protect against interruption; an unload event does not prove completion.

The prototype should keep distinct typed records for local profile/avatar choice, returning preference, exact confirmed location (world/version/frame/XYZ/facing/revision), Home configuration/visibility request, immutable world bundle/version and validated player-specific world state. These schemas are candidates until built and tested; do not copy local record shapes directly into an online account database without a scoped design.

## Later authoritative data

Before real online storage, each contract must identify owner/source of truth, controller/processor, read/write authority, purpose/minimization, retention, correction, deletion/export and cross-border transfer. Account identity, appearance entitlements, arrival preference, last confirmed location, personal Home and its requested/current visibility, immutable world source, validated personal world state and current access/eligibility grants are separate boundaries. A world script has no database handle and cannot mutate the player record or mint an access grant. The server revalidates current authorization and compatibility on protected reads, writes, travel and join.

Identity/auth provider, datastore, exact schemas, retention periods, migration and legal basis remain **Unknown** until the S2 task. Keep raw identity documents, face/biometric data, payment secrets and wallet private keys outside the baseline. Actual necessity/legal design and processor agreements need human review. No service or schema is selected merely to fill a template.
