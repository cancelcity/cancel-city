# Cancel City online beta implementation

Status: implemented private beta candidate. This is not a public production sign-off.

**Roster update:** see [roster-expansion.md](roster-expansion.md) for the current 42-card catalogue, set-preserving rewards, daily-roster compatibility and removal of automatic JSON downloads.

**City update:** the agreed buildable neighbourhood is now implemented. See [city-spec.md](city-spec.md) for twelve plots, Influence, stories/jobs and API/save compatibility.

**Memetic update:** see [memetic-pass.md](memetic-pass.md) for the original shitpost archive, resident reply threads and internet-culture content pass. No gameplay or save-schema change accompanies this update.

**Special cinematic update:** see [special-cinematics.md](special-cinematics.md) for 42 action sprites, authored special scenes, playback/skip controls, previews and committed-event/AI timing. Gameplay rules and schema remain compatible.

**City motion and props update:** see [city-motion-and-props.md](city-motion-and-props.md) for the camera/ambient/construction pass, twelve milestone props, cosmetic equipment, city display and additive save compatibility.

## Delivered

The actual Next.js 16 + TypeScript + Tailwind frontend remains intact. `next build` exports HTML/assets; a separate Vite/Cloudflare build packages those assets with a custom API Worker. D1 is provisioned by Sites under `DB`; schema-only Drizzle migrations are packaged in `dist/.openai/drizzle`.

- Thirty authored ability kits, six once-per-resident faction passives, exposure, two squad synergies, scored AI choices and six districts. Campaign unlocks in order; previously cleared legacy districts remain replayable. Practice yields no win/loss, mastery or pack credit.
- One daily UTC remix win earns 1 pack + 25 XP. District first clears earn 1 pack + 50 XP. Each resident's 3/10 mastery milestones each award one pack + 20 XP once. No unlimited battle pack farming.
- Three squad presets, combat guidance, stats, mastery counts, enemy-turn intent and themed impacts. All effects respect reduced motion.
- Scrap recycling preserves the last owned copy. Regular-only recycling pays 2/4/7/12/20 by rarity; crafting costs 20/35/60/100/180. No exchange during a pending opening or live battle. Crafting increments discovery, not fake lifetime pack pulls. Foils remain cosmetic.
- Full faction/resident lore, genuine opt-in verified rankings, original procedural music, differentiated synth effects, feedback, data notice and operator console.
- Site-authenticated cloud accounts. Stable site-scoped ID owns records; email is not stored in player data. API requires both platform identity headers. Client never chooses account ownership, current time or random numbers.
- Revision compare-and-swap is one atomic SQL update. Successful request IDs persist with the canonical save (last 200); retries reuse an ID. A lost open-pack response returns the already committed outcome. A concurrent differing command receives a conflict. Old evicted command IDs still face revision, pending-session and reward-ID checks.
- Browser storage is a display cache on hosted deployment; offline mutations are refused. Localhost development uses the old locked browser repository. Local persistence failures do not publish rewards.
- Existing browser progress gets an in-game migration choice with a device checkpoint and no automatic downloads. Imported saves remain playable but unverified. Existing cloud records are never silently overwritten by import; reset is required. Legacy v1 battle rules persist until those battles finish.
- Server-side validation, parameterized SQL, same-origin JSON writes, 180 writes/user/minute, bounded request bodies, no-store private API responses, security headers, sanitized error references and worker logs.
- Account export/deletion, operator metrics/reports and paginated player backups. Feedback expires after 30 days on subsequent authenticated writes. Rate buckets expire after two minutes on writes.

## Operations

`/api/health` checks database availability without exposing player records. `/admin/` requires `ADMIN_USER_ID` or a configured `ADMIN_EMAIL` matching platform-authenticated identity. The current private site's owner email is configured as a secret by the hosting service. Never grant access based on a browser-supplied alias or playerId.

`GAME_PAUSED=true` stops new entries and reward-generating actions while allowing committed pack reveals/acknowledgements, settings, surrender and finished-match exit. Set it with Sites runtime configuration and redeploy to apply the new environment revision. Do not change the current private audience as part of maintenance.

The operator can export records in pages of 50. These files contain game account identifiers and saves; keep them access controlled. This is a manual export, not an automated backup schedule. Account exports do not prove a whole-database restore. Before public launch, configure provider recovery/backup retention, exercise restoration in an isolated database, validate schema compatibility and reconcile inventory/rewards. Do not apply destructive restore SQL to live players without an explicit incident decision and backup.

Rollback: preserve exact source SHA and packaged Worker. Deploy an existing saved compatible version through Sites. The first D1 migration is additive; do not roll back to the old local-only release expecting cloud progress to appear there. Use a version that understands the same schema. A code rollback does not undo applied database migrations. Pause grants first if a defect can over-award; preserve committed openings and diagnose request IDs in worker logs.

Content changes: edit catalogue/kit/district files with stable IDs, run validation, update balance version when odds/economy change, review migration compatibility and publish a versioned build. The current console deliberately cannot arbitrarily grant inventory or edit RNG. Audited support compensation and editable CMS content remain later operational work.

## Evidence and remaining gates

Automated API tests use actual in-memory SQLite and the generated migration, with a D1-shaped adapter. They cover authentication, origin checks, per-account ownership, server-controlled command types, request replay, concurrent CAS conflicts, import ranking restrictions, opt-in fields and rate limits. This is not evidence of hosted dispatch sign-in, real D1 latency or browser behavior.

Required before public launch: real signed-in account round trip on two devices; pack refresh and lost network recovery; real mobile/keyboard/screen-reader/motion/audio/download QA; measured performance and capacity; dependency/security review; moderation procedures for public aliases; human combat/economy playtests; commercial art/font/reference rights review; approved operator/support/retention/privacy/terms/age/country decisions; tested automatic monitoring/alerts, backup restoration and rollback drills. No automatic operational alert recipient is configured. No human fun/balance sign-off or legal clearance is claimed.

Crypto, real-money purchases, player trading, PvP matchmaking and mobile app stores remain outside this free private beta.

Synthetic diagnostic: `docs/combat-simulation.json` evaluates 180 deterministic fights using one basic player heuristic. After tuning only v2 enemy scaling, the 30 starter-heavy squads win 30/28/26/21 times in districts 1–4; none win districts 5–6 under the basic heuristic. Legacy v1 scales remain unchanged. Full-squad tactics and endgame difficulty still need human balancing. This is an unresolved balance/playtest gate, not evidence that the full game is fairly balanced. The older 200-player gacha baseline excludes new battle/mastery/crafting rewards and cannot certify the revised economy.
