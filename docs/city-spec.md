# Cancel City neighbourhood v1

Implemented scope: one illustrated fixed-plot neighbourhood, twelve plots, six faction building types, three levels, resident assignments, capped Influence, story missions and cosmetic epilogues. Crypto/payments and a full city simulator are outside this release.

## Player loop

Found the city → build/assign residents → collect daily Influence → upgrade → read/accept a resident story → play packs/fusion/crafting/battles → claim a finite job reward → unlock the next chapter/epilogue.

Founding is optional and grants 200 Influence once, a free level-1 Feed Tower and CC001 as a city loaner. CC001, CC008 and CC015 are free loaners, matching the battle starter policy. Other residents must be owned, including foil-only ownership. Assignment consumes no card and does not remove battle availability. One resident has one address; assigning them elsewhere clears their previous city assignment.

## Plots and construction

| Plots | Requirement |
| --- | --- |
| 1–6 | Open at founding |
| 7 | Discover 5 residents |
| 8 | Discover 10 residents |
| 9 | Clear Comment Section |
| 10 | Win 3 scored battles |
| 11 | Discover 20 residents |
| 12 | Clear Outrage Network |

| Building | Faction | Build cost |
| --- | --- | --- |
| Feed Tower | Terminally Online | 60 Influence |
| PR Factory | Corporate Hell | 75 |
| Summit Club | International Incidents | 80 |
| City Hall | Politics & Hypocrisy | 90 |
| Rocket Garage | Crypto Degenerates | 100 |
| Afterparty House | Cursed Society | 70 |

Construction is instant. Level 2 costs 120; level 3 costs 240. Moving to another unlocked plot swaps both occupants for free, preserving levels/residents. Replacing a building is explicitly confirmed: pay the new type's base cost, reset this plot to level 1, keep its resident. No refund or XP from rebuilding; no resource loop.

## Production

Unassigned buildings produce zero. Assigned buildings produce 25/35/45 base Influence at levels 1/2/3, plus 15 for a resident and 10 when their faction matches. Regulars and foils have equal production. Collection is one pickup per UTC day, based on current buildings, capped at 160 globally. Build/assign/upgrade before picking up. Missed pickups do not stack, and rebuilding/assignment after pickup does not create another claim that day. Source clock is server time; client date is only display.

Influence is distinct from Market scrap. It buys city construction/upgrades and cannot be converted directly into packs or tradable rewards. City production grants no XP. Starter production is 50/day from the matched loaner at Feed Tower.

## Stories and finite rewards

Each building type has two job chapters and a level-3 epilogue. A matching resident and the required building level make a chapter available. Chapter 2 additionally requires chapter 1's claimed reward. Reading/accepting a job starts future activity at progress zero, with no retroactive credit. Tracking pauses if no eligible matching resident is assigned; returning a resident resumes saved progress.

| Type | Chapter 1 | Chapter 2 |
| --- | --- | --- |
| Feed | Open 2 packs | Open 5 more |
| PR | Fuse 1 foil | Fuse 2 more |
| Summit | Win 1 scored battle | Win 3 more |
| City Hall | Claim daily packs once | Claim on 3 more UTC days |
| Rocket | Craft 1 resident | Craft 2 more |
| Afterparty | Win 1 scored battle | Win 2 more |

For battle jobs, a matching assigned resident must appear in the winning squad. Practice and surrender do not count. Each job grants one pack. First chapters additionally grant 50 Influence + 25 XP; second chapters grant 80 Influence + 50 XP. The complete city job budget is **12 packs, 780 Influence and 450 XP once**, independent of daily production. Reward IDs and contract claims are validated together. Epilogues add no repeated currency/pack/XP rewards.

Three/six/twelve rewarded jobs add map decorations. Building all six types permanently unlocks Block Party mood; finishing six jobs unlocks Golden Hour. Theme unlocks persist after rebuilding. Default mood is After Hours.

## Implementation and recovery

- `src/data/city.ts`: prices, buildings, jobs and authored chapters.
- `src/domain/city.ts`: validated city schema, construction/ownership/production/contract rules and activity recording.
- `src/domain/game.ts`: city field defaults to null for old saves; commands share existing revision/idempotency processing.
- `worker/index.ts`: authenticated city command shapes; same-origin writes, server time, CAS and maintenance gate.
- `src/components/city.tsx`, `app/city.css`: map, scroll/zoom, buildings, assignment, upgrades, story dialogs, finite jobs and moods.
- `src/components/city-jobs.tsx`: neighbourhood jobs inside the existing Jobs board.

City lives in the existing D1 player save JSON. No new SQL table or migration is needed. The same atomic row update commits wallet/layout/assignments/job progress/rewards together. Client retries reuse request IDs. Invalid/stale commands and failed persistence do not publish local resource changes. Offline mutations remain disabled. Existing schema-1/2 collections, pending pack outcomes and active battles remain compatible.

Backups include city state. Reset/deletion removes it with the account record. No automatic file download was introduced. Rollbacks must use a version that understands city v1; a pre-city server could discard unknown city data during validated writes. Keep a compatible saved release or pause gameplay until recovery is ready.

## Artwork and motion

Six building identities × three generated level variants = 18 transparent sprites, plus one hand-inked empty-lot skyline backdrop. Built-in imagegen used; prompts, generation/edit chains, alpha checks and framing repairs are under `docs/art/city/`. Generated masters remain unchanged; runtime derivatives use alpha-bound alignment, proportional resizing, a common 640px transparent canvas/baseline and WebP encoding. Selected runtime sprites total about 2.09 MB; this is not measured initial transfer.

Residents use animated portrait markers. Small road vehicles, soft window-light changes, construction entrances and saved-action toasts add activity. Reduced motion disables ambient animation; hidden tabs pause the moving residents/vehicles. The city is fixed-plot 2D/isometric presentation, without road editing, collision/pathfinding, construction queues, continuous offline production or PvP raids.

## Validation and limits

151 automated tests pass across rules, old-save recovery, city ownership, plot/price/level bounds, daily UTC cap, no missed-day stacking, duplicate/replayed commands, scored resident battles, chapter gates, finite claims, epilogues, permanent themes, real-SQLite API concurrency and storage failures. Typecheck, lint and exact-source build are required for publication.

`docs/city-simulation.json` uses ten synthetic 30-day policies calling actual commands. All ten built all six types by day 3 and completed twelve jobs by day 30. No player received more than 12 city-job packs or 160 production Influence per day. Optimistic uninterrupted engagement and a simple battle heuristic do not establish real player pacing, fun or economy sign-off.

Supported browser/device QA is unavailable in the current environment. Actual layout, panning, zoom, keyboard/screen-reader behavior, touch, reduced-motion/audio behavior and signed-in two-device round trips remain unverified. Artwork was visually inspected; successful compilation does not certify those interaction/layout checks. Public production, performance, operational restore/rollback and commercial rights gates remain as recorded in the overall readiness documents.
