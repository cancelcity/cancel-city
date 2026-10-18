# Cancel City: production readiness and release gates

Baseline audit date: 11 October 2026. **Update: the online beta now implements accounts, D1 saves, server-owned RNG/rewards, six-district authored combat, scrap market, lore, optional rankings and operator tools. See [online-release.md](online-release.md) for current source/evidence and remaining gates. The baseline checklist below predates that upgrade; unchecked launch evidence remains outstanding.** Scope: Next.js, TypeScript and Tailwind; a free web game focused on gacha, collecting, cosmetic fusion and single-player AI battles. Punk art follows the four supplied mockups. Payments, trading, multiplayer and crypto remain separate releases. The playable battle contract is in `docs/battle-spec.md`; browser combat QA and balancing remain unsigned.

**Current verdict: playable private prototype. Public production launch is not signed off.** Publishing an executable build does not establish production readiness. The online upgrade implements an account service and authoritative backend; operational drills and public launch evidence remain unsigned.

This document separates implemented source behaviour, completed automated checks and missing release evidence. Every unchecked item needs an owner and evidence before its applicable release. A paid, social, native-app or blockchain expansion requires an additional scope review; it cannot inherit sign-off automatically.

## 1. Decide what “finished” promises

Two valid first releases have different requirements:

| Release | Promise | Required authority |
| --- | --- | --- |
| Free local collecting game | Progress belongs to this browser; backups are manual; no competitive or transferable value | A backend is optional. Local saves and device time are acceptable if disclosed. Browser QA, accessibility, performance, privacy, rights and operational readiness still apply. |
| Online game with persistent player collections | A player can recover their account and continue across devices; progression has a trusted history | Accounts, a database and server-owned time, RNG, entitlements, inventory and rewards are mandatory. Local storage becomes a cache. |

Recommended target: finish and test the free gacha game first, then build and verify the online account service before promising durable cross-device ownership. Keep the local prototype available while that work is done. Do not launch payments against unsigned client saves.

Product owner decisions that must be recorded:

- [ ] Local or online launch; what is guaranteed about saved progress.
- [ ] Intended audience, minimum age, launch countries, language and browser support.
- [ ] Whether beta progress survives launch; how existing local saves are treated.
- [ ] Gacha rules, free pack supply, duplicate conversion, odds and no-pity policy.
- [ ] Target first-session length, first foil, first Mythic and collection completion.
- [ ] What completion looks like and why a player returns after obtaining all 30 residents.
- [ ] Launch support contact, accountable operator, hosting budget and incident owner.

Do not count a future market, leaderboard, battle arena or wallet as unfinished gacha requirements unless it is included in the launch promise. Remove or clearly label their previews in public navigation.

## 2. Audited implementation status

| Area | Current source | Evidence / limit |
| --- | --- | --- |
| Gacha | Five independent draws with replacement; regular cards only; published 60/25/10/4/1 rarity weights | Deterministic boundary and rule tests. No pity or guaranteed rare slot. |
| Content | 30 stable card IDs, six factions, cosmetic stats and flavour abilities | Catalogue/rule checks. Content and commercial rights approval are still needed. |
| Art | 30 individually generated, inspected square portrait masters; responsive WebP variants; backdrop and logo | Masters, prompts and encoding provenance in `docs/art/`. No runtime screenshot crops. Screen fidelity requires browser review. |
| Opening recovery | Pack consumed and outcomes saved before animation; reveal state survives reload | Rules and persistence tests. Actual refresh/browser lifecycle tests remain outstanding. |
| Progression | Three welcome packs; three daily packs; limited daily/weekly jobs; one-time journey and automatic milestone rewards | UTC periods, duplicate claims, reset boundaries and clock rollback tested. Device time remains untrusted. |
| Fusion | Three regular copies become one cosmetic foil; discoveries remain complete | Rules and persistence tests. No battle advantage or tradable value. |
| Saves | Validated browser storage, backups/import/reset, schema-1-to-2 migration, revisions and Web Locks | 41 automated tests across rules, progression and mocked browser persistence. No database, cloud save or account recovery. |
| UX | Home, packs, album/detail view, jobs, settings, tutorial, optional sound, reduced motion, owned-card PNG downloads | Source implemented. Actual layout, focus, touch, audio and download behaviour require browser/device QA. |
| Hosting | Next.js static export to the existing private Site | Reproducible packaging and source provenance. Owner-private hosting access is not a game account system. |
| Production services | Not implemented | No authoritative API, player database, operations dashboard, error telemetry or scheduled backup/restore service. |
| Distribution | Private audience retained | Public launch audience, domain, policies and support arrangements are not approved or configured. |

The persistence suite uses memory storage and a simulated lock queue. It proves store logic under those inputs; it does not prove real Safari/Chrome behaviour, storage eviction, private-browsing compatibility or device performance.

## 3. Complete and approve the game experience

- [ ] A new player reaches their first opening without instruction from the developer; the tutorial can be dismissed and reopened.
- [ ] Rules are consistent across screens: all packs free, five draws, duplicates possible, foils come from fusion, stats and levels cosmetic.
- [ ] Pack preview cards are unmistakably examples, not guaranteed outcomes. Display the odds before opening.
- [ ] Reveal-next, reveal-all, skip, finish, depleted balance and resumed opening all have clear feedback and no dead ends.
- [ ] New versus duplicate labels and quantities are correct even when the same resident appears twice in one pack.
- [ ] Daily reset and Monday weekly reset are understandable across time zones; completed but unclaimed timed jobs expire according to a disclosed policy.
- [ ] Fusion confirmation names the consumed copies and output; selection/foil state cannot export or consume a different card during a change.
- [ ] Owned regular and foil downloads render correctly, preserve readable titles/quotes and behave on mobile browsers.
- [ ] Collection search, sort, faction/ownership filters, empty results, full completion and foil-only ownership work consistently.
- [ ] Define a completion celebration, long-term foil goals and any future content schedule. Avoid advertising live seasons or events that do not exist.
- [ ] Review all copy, names, stats and humour; fix confusing abbreviations, unintended artefacts and placeholder text.
- [ ] Human playtests demonstrate that opening, collecting and duplicates stay enjoyable after the initial pack supply runs out.

Pass evidence: a recorded first-time player session, approved gameplay contract, screenshots of all important states and a resolved usability issue list. More systems are not a substitute for a satisfying collecting loop.

## 4. Economy and gacha validation

The current offline model runs actual `applyCommand` rules for 200 seeded synthetic players over at most 180 days. Players claim all available jobs, open every pack and fuse at most once per day; there are no missed days. Results in `docs/economy-simulation.json`:

| Milestone | Median | 90th percentile |
| --- | --- | --- |
| First Mythic | Day 1 | Day 6 |
| First foil | Day 1 | Day 1 |
| All 30 residents | Day 35 | Day 64 |

The sample's 99th percentile collection completion is day 90. All 200 finished inside the horizon. These are estimates for optimistic synthetic engagement, not a promised completion time, retention measurement or human playtest. A no-pity pool has an unbounded unlucky tail.

- [ ] Approve target milestone ranges and decide whether the tail is acceptable; a pity or crafting change needs its own versioned design and odds disclosure.
- [ ] Model missed days, opening-only players, optional fusion, unclaimed jobs, different start weekdays and return after long absences.
- [ ] Model all-foil completion and the point at which duplicates cease to be interesting.
- [ ] Test rarity and per-card frequencies using adequate samples and predefined tolerances; retain random boundary tests.
- [ ] Confirm every obtainable resident belongs to a nonempty rarity pool; weights sum to one; content IDs and variants are unique and valid.
- [ ] Verify all pack sources use the advertised pool and odds; foils and levels do not secretly change them.
- [ ] Measure resource sources and sinks; rewards are bounded per period and cannot form an unlimited reward loop.
- [ ] Version the pool, reward configuration and balances. Existing committed openings retain their original results and balance version after updates.
- [ ] Approve handling of retired cards, new sets, corrected odds and players affected by a faulty release.

Pass evidence: approved targets, reproducible simulation reports, statistical checks and human feedback. Rerun after any probability, reward, fusion or catalogue change.

## 5. Accounts and authoritative backend — online release

The frontend may remain Next.js/TypeScript/Tailwind. The current static export cannot serve gameplay API routes itself; pair it with a supported API runtime or migrate to supported server hosting. Choose a relational database and transactional service, not an additional client-storage layer.

### Account lifecycle

- [ ] Implement sign-in, sign-out, session expiry and recovery with a maintained identity provider or reviewed authentication implementation.
- [ ] Define guest-to-account linking, duplicate-account handling and ownership transfer policy. Keep private hosting login distinct from player identity.
- [ ] Verify email/link expiry and one-time use when applicable; prevent account enumeration and login abuse.
- [ ] Recover progress on another device; handle concurrent sessions and lost/revoked sessions gracefully.
- [ ] Account export/deletion, banned accounts, support recovery and administrative access have documented rules.

### Data and transactions

Store players, per-variant inventory, pack balances, immutable resource transactions, openings/pulls, reward claims, progress counters and command receipts. Content and balance versions must be identifiable.

- [ ] Resolve player identity from the verified session; never trust a supplied player ID or client balance.
- [ ] Server time owns daily/weekly periods and reward eligibility.
- [ ] Server-generated secure randomness owns pack outcomes; client animation only displays committed results.
- [ ] A pack transaction atomically validates entitlement, deducts exactly one pack, writes all five pulls, updates inventory/progress and records the opening.
- [ ] A fusion transaction atomically consumes three regular copies and credits one foil; concurrent requests cannot overspend.
- [ ] Unique database constraints enforce one reward per player/job/period and one command receipt per player/idempotency key.
- [ ] Reusing a key with the same request returns the original result; using it with a different request is rejected.
- [ ] Failure before commit awards nothing. Failure after commit but before response recovers the same opening on retry; it never rerolls or charges twice.
- [ ] Balances and quantities cannot become negative; database constraints and transaction isolation enforce the invariant.
- [ ] Reveal/acknowledgement never grants the same inventory again. Pending openings survive logout, deployment and service restart.
- [ ] Server-authoritative history supports audited recovery, reconciliation and compensation.
- [ ] Document offline/read-only behaviour, retries, stale state, API version compatibility and maintenance mode.

### Existing local saves

- [ ] Choose a migration policy before account launch. Unsigned browser saves can be edited and cannot prove earned value.
- [ ] Preserve existing collections in the local edition. If cloud migration is offered, validate IDs and caps, prevent repeated imports, disclose eligibility and keep unverified legacy items separate from trusted competitive/purchased inventory.
- [ ] Never silently destroy an existing save or upload its balance as trusted account ownership.
- [ ] Test database and client-schema migrations, interrupted upgrades and backwards compatibility with still-open clients.

Pass evidence: deployed staging API, schema and migration review, integration tests, cross-device QA and adversarial concurrency/replay tests. This is the largest missing engineering workstream for the online edition.

## 6. Reliability, recovery and abuse

- [ ] Test refresh/close/crash during every stage of an opening and fusion, including a write failure and request timeout.
- [ ] Test double clicks, parallel tabs/devices, replays, stale revisions, duplicate commands and simultaneous daily/mission claims.
- [ ] Verify storage unavailable/full/corrupt, private browsing, missing Web Locks and browser eviction. Supported/unsupported behaviour must be clear and non-destructive.
- [ ] Bound imported file size and collection sizes; reject malformed, unknown-card, impossible-counter and future-schema saves without overwriting the original.
- [ ] Test empty catalogue/pool, missing artwork, malformed content and unavailable services.
- [ ] For online operation, rate-limit requests by account and relevant network signals; enforce request size and resource limits.
- [ ] Apply account/bot abuse controls proportional to actual rewards; include entitlement farming and administrative reward abuse in the threat model.
- [ ] Automate encrypted backups with explicit retention and access rules. Test an isolated restore, not merely backup creation.
- [ ] Set acceptable recovery point and recovery time targets; alert on failed backups and replication/restore problems.
- [ ] Reconcile resource ledger and inventory; a support correction records actor, reason and transaction rather than editing quantities silently.

Pass evidence: failure-injection results, concurrency tests, restore exercise and a recovery runbook. No unresolved issue may lose earned items, duplicate grants or block ordinary recovery.

## 7. UI, visual fidelity and accessibility

- [ ] Compare home, packs, album/dossier and playable battle presentation to the four references in real browsers. Jobs should use the same art direction.
- [ ] Review at 1440 × 900, 768 × 1024, 390 × 844 and 320 px width; include short-height landscape, safe areas and long names.
- [ ] Verify scrolling, overlapping pack cards, fixed footer, detail-panel positioning, zoom and touch hit areas.
- [ ] Every action works with keyboard; focus is visible, dialogs trap/restore it, Escape works and no overlay obscures the focused control.
- [ ] Screen readers understand balance changes, new/duplicate/rarity state, disabled actions, reward collection and validation errors.
- [ ] Rarity, ownership and completion use words or other cues in addition to colour.
- [ ] Sound is optional; reduced-motion settings and OS preference remove unnecessary motion; check flashes/photosensitive effects.
- [ ] Measure text and non-text contrast and verify content/functionality at 200% text zoom and appropriate reflow.
- [ ] Use WCAG 2.2 AA as the acceptance target; check all applicable criteria, including target spacing and accessible authentication once accounts exist. Aim for 44 px touch targets where practical; AA minimum target sizing is 24 px with defined exceptions.

Pass evidence: manual keyboard and screen-reader sessions, measured contrast, responsive screenshots and resolved accessibility findings. Automated scans alone do not establish conformance.

## 8. Browser QA and release testing

- [ ] Automate end-to-end journeys in an approved browser test environment: new player → tutorial → daily grant → pack → reload → same outcome → collect → filter → fuse → job → backup/restore → reset.
- [ ] Exercise current Chrome, Edge, Firefox and Safari; include real iOS Safari and Android Chrome, not only desktop emulation.
- [ ] Test slow/flaky connections, offline transitions, tab backgrounding, page restore, touch, audio policies and mobile image downloads.
- [ ] Test UTC midnight, Monday reset, daylight-saving changes, device time rollback/advance and return after inactivity. Online tests must prove device time is ignored.
- [ ] Cover schema-1/2 saves, corrupted saves, failed writes, replaced saves and obsolete clients after deployment.
- [ ] Online release adds authentication, authorization, transaction, migration, backup and API integration tests.
- [ ] Test recovery after a server commits but the response is lost, and compatibility during a rolling deployment.
- [ ] Run staging load/soak tests against an agreed launch demand and headroom; document sustained throughput, p95 latency, database contention and cost.
- [ ] Run a small invited beta, resolve reproducible issues and repeat only affected checks plus the core regression path.

The current creation environment has no supported browser QA capability. No browser tests, measured screen fidelity, device tests or performance scores are claimed in this audit. These checks must run in an environment with the approved browser tooling.

Pass evidence: test reports for the exact release candidate, device matrix, bug triage and product sign-off. No unresolved critical/high issue in supported core flows.

## 9. Performance and asset delivery

Standalone PNG portrait masters total about 111.5 MB and stay in source documentation. The deployed responsive portrait derivatives total about 15.2 MB across all 60 files; that is not a measured initial page transfer. The backdrop/logo derivatives total about 1.2 MB. Native image selection and lazy loading are implemented, but real transfer/decoding behaviour remains unmeasured.

- [ ] Measure initial transfer, image selection, image decoding, memory, animation smoothness and battery use on an ordinary mobile device.
- [ ] Set route and asset budgets; avoid shipping source masters/mockups, requesting every full-size card at startup or refetching unchanged artwork.
- [ ] Tune responsive derivatives, lazy loading, backdrop treatment and caching based on measurements; verify logo/backdrop do not delay first interaction.
- [ ] Establish cache rules for HTML and versioned assets; deployments must not mix incompatible content, scripts and odds versions.
- [ ] Check broken asset paths, fallback states, icon/metadata/share previews and direct deep links.
- [ ] Target LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at the 75th percentile, measured separately on mobile and desktop. Before sufficient field traffic exists, use lab interaction tests as preliminary evidence and monitor real traffic after launch.
- [ ] Online release needs API/database latency budgets, indexes, connection/concurrency limits and bounded background jobs.

Pass evidence: measured route reports and field monitoring, not just a Lighthouse score or successful build.

## 10. Security and supply chain

- [ ] Use a scoped threat model and OWASP ASVS checklist with a specified version; protect actual assets and services, not hypothetical features.
- [ ] Review dependencies and lockfile for known advisories; remove unused template dependencies/services and maintain a patch process. No dependency vulnerability audit is claimed as completed here.
- [ ] Prevent secrets from entering source, browser bundles, build logs or backups; restrict and rotate deployment/admin credentials.
- [ ] Configure HTTPS, appropriate security headers, tested CSP, framing policy, referrer policy and permissions at the actual hosting layer. Static-export configuration alone does not prove emitted response headers.
- [ ] Validate all external input; prevent script injection in aliases/content/imports and injection in database/administrative queries.
- [ ] Online APIs need per-object authorization, secure sessions/cookies, CSRF/origin protections where applicable, correct CORS and privilege separation.
- [ ] Protect staff tools with strong authentication, least privilege and audit trails; restrict support inventory adjustments and balance changes.
- [ ] Verify production access controls and storage/database permissions; use no public debug endpoint or hidden admin UI as security.
- [ ] Review logs/telemetry for personal data and session tokens; define retention and access.
- [ ] Perform an independent security review before paid, competitive or transferable rewards. Resolve findings and record accepted residual risks.

Pass evidence: security configuration tests, advisory report, authorization/adversarial tests and review findings resolved or explicitly accepted by the accountable owner.

## 11. Privacy, content rights and policies

- [ ] Identify the operator, intended markets and audience; decide minimum age and treatment of minors before collecting account data.
- [ ] Inventory actual data flows: host access logs, local saves, account identifiers, support requests and any analytics/errors. A local game still has hosting/data disclosures.
- [ ] Publish accurate privacy, terms and support/contact information. Explain local-save limits, backup responsibilities, ownership and the free/no-cash-value nature of rewards.
- [ ] Online operation needs a lawful processing basis, purpose/retention rules, processor arrangements, applicable transfer safeguards and working access/export/deletion procedures.
- [ ] Add only necessary telemetry; document why each field is collected. Do not send entire saves or personal identifiers unnecessarily.
- [ ] Assess storage/tracker use. Consent-dependent analytics or advertising must wait for consent; strictly necessary storage has different conditions. A cookie banner is not automatically required merely because a local save exists.
- [ ] Check age suitability of satire, violence, gambling presentation and other content; use relevant distribution ratings when needed.
- [ ] Confirm commercial rights and provenance for references, portraits, logo, sounds and any embedded fonts; review third-party names/marks and satire for intended markets. Generation provenance is not legal clearance.
- [ ] Include required dependency/asset licence notices and a process for rights/content complaints.
- [ ] If public usernames, profiles or communication are added, implement reporting, blocking, moderation, appeal and abuse-response policies before those features launch.

Pass evidence: operator-approved policies, completed data map and rights register, configured consent where applicable and tested privacy procedures. Legal review should address the actual launch countries and business model.

## 12. Deployment, observability and operations

- [ ] Use separate development/staging/production configuration and data. Staging must not consume live player entitlements or send production messages.
- [ ] Automate reproducible dependency install, lint, type checking, unit/integration tests, asset validation and production build before deploy; pin/runtime-version the toolchain.
- [ ] Keep the exact source SHA, build artifact and release notes linked. Version database/content changes alongside application changes.
- [ ] Add appropriate error boundaries/recovery pages, genuine 404/maintenance states and readable failures without raw internal errors.
- [ ] Configure actual launch domain/audience, TLS, routing, metadata/favicon/share image and private staging access. Public access has not been changed by this finishing pass.
- [ ] Monitor uptime, client errors, API failures, save/transaction failure rates, latency, suspicious grant volume and resource/cost limits.
- [ ] Define launch service objectives and alert thresholds; alerts reach a named responsible person and have an escalation path.
- [ ] Provide a minimally scoped admin/support workflow for account recovery, audited compensation, content/balance configuration and feature flags.
- [ ] Prove code rollback, compatible database recovery and an emergency stop for faulty openings/rewards. Existing committed openings must remain recoverable.
- [ ] Document an incident and breach response plan, communication channel, deployment checklist and maintenance responsibilities.
- [ ] Set backup/telemetry retention and spending alerts; estimate monthly cost from measured workloads and keep operational headroom.
- [ ] Establish support/bug reporting, triage severity, response expectations, release notes and the first post-launch maintenance plan.

Pass evidence: CI report, staged deployment/rollback exercise, tested alerts, restore drill, support runbook and assigned operational ownership.

## 13. Extra gates if the scope expands

| Expansion | Additional requirements before launch |
| --- | --- |
| Paid packs/currency | Region-specific randomized-reward/consumer/age review; applicable odds disclosure; provider/store eligibility; server-verified purchases; signed webhook verification; idempotent fulfillment; reconciliation; failed/pending payments; refunds/chargebacks; entitlements; receipts; currency/tax/invoicing rules; customer support and spending safeguards. Never fulfill from the browser's success page. |
| Trading/market | Server-owned transfer ledger and atomic settlement; ownership checks; fraud and multi-account controls; economic/cash-out policy; dispute/reversal rules; market/legal review; trust/safety support. |
| Leaderboards/social | Server-verifiable scoring; anti-cheat; public-profile privacy; username/content moderation; reporting/blocking and fair reset rules. |
| Multiplayer battles | Competitive rules, server-authoritative outcomes, matchmaking, deterministic resolution/replay, balancing, abuse protection and combat-specific QA. The current single-player engine does not provide these services. |
| Native app stores | Distribution-specific review, ratings, purchases, privacy declarations, device testing, signing and store support. Apple specifically requires pre-purchase odds for purchased randomized items; web and other-store rules need their own review. |
| Crypto | Separate product/legal design; wallet ownership verification; safe signing flows and network handling; custody/recovery policy; chain/contract design and independent audits if contracts hold or transfer value; transaction/reorg monitoring; key management; incident controls; applicable regional obligations and no misleading value/return claims. Do this after the ordinary game and online inventory are reliable. |

None of these expansions is necessary to finish a free gacha collecting release. Their presence in a mockup is not authorization or evidence of implementation.

## 14. Execution order and final sign-off

1. Approve the launch promise, supported audience and product/economy targets.
2. Complete real browser/mobile/accessibility QA and human playtesting of the free local game; fix findings and approve art/content.
3. For online launch, implement accounts, transactional backend, server-owned rewards/RNG and the migration policy; test recovery and replay/concurrency.
4. Complete privacy/rights, security, performance and staging capacity checks for the actual services.
5. Wire CI, alerts, backups, restore, rollback, support and operational ownership; exercise them.
6. Run an invited beta against the exact launch candidate; reconcile inventory/rewards and resolve launch-blocking issues.
7. Record product, engineering, operations and applicable legal sign-off; only then change the launch audience and announce it.

Release checklist:

- [ ] All applicable P0/P1 requirements above have an owner and evidence link; none are silently deferred.
- [ ] No known critical/high security issue, progress-loss bug, double-grant bug or broken core flow remains.
- [ ] First-time players complete the loop unaided on every supported device/browser.
- [ ] Recovery, migration, retries and concurrent actions are proven against the deployed system.
- [ ] Performance and capacity meet the agreed targets; costs and alerting are understood.
- [ ] Backups restore, rollback works and someone can respond to an incident.
- [ ] Policies, support, asset rights, audience and honest feature claims are approved.
- [ ] Paid/social/crypto gates are either completed for enabled features or those features remain disabled and clearly outside the release.

## References

These sources guide acceptance targets and applicable policy checks; they do not certify the current game:

- OWASP ASVS: https://owasp.org/projects/asvs
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Core Web Vitals targets and measurement: https://web.dev/articles/vitals
- CNIL cookies/trackers and necessary-storage exceptions: https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi
- CNIL audience measurement conditions: https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies-solutions-pour-les-outils-de-mesure-daudience
- CNIL videogame privacy guidance: https://www.cnil.fr/fr/jeux-video-protege-ta-vie-privee
- Apple App Review Guidelines, section 3.1.1: https://developer.apple.com/app-store/review/guidelines/
