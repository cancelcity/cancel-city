# Cancel City playability audit

Audit date: 22 October 2026. This document records the current working-tree audit and fixes, not a claim about an already published release.

**Status:** implementation and bounded local browser play completed. This is a playability audit, not a catalogue-wide balance certification. Publication/source identity is recorded in `.openai/source-provenance.json`.

## Player model

- **Tickets / packs:** one Ticket opens one pack of five independent fighter draws. Three welcome packs and three daily packs are free. Tactics are free and are not pack drops.
- **Trash / scrap:** recycle spare regular fighter copies, then spend Trash to craft a chosen regular fighter. Keep at least one regular or foil copy of each owned resident.
- **Influence:** build and upgrade the optional City. Production is collected once per UTC day, with a shared cap of 160.
- **Clout:** reputation score, not spendable currency. **XP:** cosmetic account levels, with 1,000 XP per level.
- **Foils, stickers, crown badges and equipped cosmetic props:** change appearance, not fighter stats. Stickers and crown badges are saved on the current device.
- **Battle practice:** independent browser save, no account rewards. Account campaign/daily battles and Roast Night retain their separate save/reward rules.

## Confirmed static findings and focused changes

| ID | Finding and player consequence | Change / current status |
| --- | --- | --- |
| W01 | Street Beef selected the still-active event after its ending had already been rewarded. “Next Street Beef” could therefore fail until the five-minute atmosphere expired. | `src/domain/city.ts` now selects an unfinished active event or the next unresolved event. `src/components/city.tsx` retains the correct verdict/portrait, advances immediately and shows a completed state after all twenty incidents. |
| W02 | The Level 5 journey goal used 100 XP per level while Profile and header used 1,000. A Level 1 player could receive the Level 5 reward. | Shared `XP_PER_LEVEL`, `levelForXp` and `levelProgress` exports in `src/domain/progression.ts`. The goal now requires 4,000 total XP. Existing claimed reward markers are preserved. Profile and header use the shared calculation. |
| W03 | “Ascend Tier III” presented a free browser appearance toggle as combat/account progression. | Dossier wording now calls it a cosmetic crown badge, identifies device storage and states that combat stats are unchanged. The card stamp now says “CROWN BADGE.” No progression or inventory is removed. |
| W04 | Crafting a new resident recorded discovery and XP but omitted weekly discovery activity, despite the job promising credit for discovering residents. | `src/domain/game.ts` counts a newly crafted discovery once toward the current week. Crafting another copy does not add discovery credit. |
| W05 | Prop resident selection rendered only the first sixteen eligible residents with no further access. | `src/components/stash.tsx` renders the full eligible roster with name, card ID and faction search. Owned residents and free loaners remain the eligibility rule. |
| W06 | Market filters could remove the selected resident from the shelf while the old resident remained the crafting/recycling target. | `src/components/market.tsx` derives its recipe from the filtered list, clears it when no results exist, offers clear filters and shows the missing Trash amount. |
| W07 | City upgrades displayed higher building output even when the shared production cap meant zero additional collectible income. This is a presentation problem, not a changed economic rule. | `cityUpgradePreview` reports actual city income before/after. Management explains the cap, zero-income upgrades and chapter/epilogue prerequisites. The main City panel also shows the actual before/after and distinguishes an unassigned resident from a capped city. |
| W08 | The same rarity IDs appeared as Uncommon/Mythic in odds but Rare/Legendary in some card and prop badges. | `rarityBadgeLabel` now reads the catalogue rarity name. No rarity weights, stats or drop tables changed. |
| W09 | Rankings silently substituted fictional opponents on empty/error responses and inserted the current player into the numbered list even when opted out. | `src/components/community.tsx` shows only fetched public accounts in live rankings, with loading/error/empty states. The player's private score and the explicitly fictional Hall of Shame are separate and cannot imply public participation. |
| W10 | The reward shortcut opened the Cases tab even when the ready reward belonged to weekly, journey or neighbourhood jobs. | `src/components/missions.tsx` links to the first ready reward category through `?tab=`, falling back to Daily Jobs when none are ready. Tabs use the URL, so direct links open the requested board. |

## Additional first-session review

- **Tactic deck navigation — fixed:** a draft with fewer than twelve cards is intentionally not persisted. Collection now disables its Battle link for an incomplete or invalid draft and displays “COMPLETE YOUR 12-CARD DECK FIRST,” preventing a silent switch to the previous complete deck.
- **Rules linkage:** the shared help dialog is mounted globally in Bootstrap and reachable from the header. It explains Battle, Roast Night, resources and cosmetic rewards, with a direct guided Battle link. Per-mode detailed rules remain necessary; the short guide is not a complete combat specification.
- **Jobs navigation:** shortcuts now open an appropriate ready category (W10). This changes navigation only; reward calculations and acceptance requirements are unchanged.
- **Lore and Feedback:** no additional blocking rules contradiction was confirmed in this bounded static pass. Feedback uses the production authenticated endpoint; no fabricated feedback report was submitted as part of the audit.

## Focused checks completed

Command executed once for these world fixes:

```text
node node_modules/vitest/vitest.mjs run tests/world-consistency.test.ts tests/progression.test.ts tests/city.test.ts
```

Result: **44 tests passed across three files**.

The new checks cover the displayed level threshold and preserved earlier reward, once-only crafted discovery credit, immediate progression through all twenty Street Beef incidents, and real upgrade income below/at the City cap. Existing progression and City tests cover established save/reward behavior. Edited TSX files also passed a syntax parse.

These checks do not establish that every fighter, tactic combination, opponent or economic choice is balanced. Catalogue-wide balance would need separate targeted match data and repeated human play.

## First-session and combat findings

| ID | Player-facing problem | Implemented change |
| --- | --- | --- |
| J01 | Localhost auto-created a record, claimed rewards, opened/revealed a pack and built a City without player input. | Removed bootstrap demo progression. Fresh local play starts with untouched welcome tickets. |
| J02 | Beginner guide existed in code but was not mounted; Home Continue always led to City. | Visible pack → lesson → practice guide. Home prioritizes pending pulls, active account encounters and actual learning progress. |
| J03 | Save migration, disconnected reasons and Help were missing on Home/City/Battle because they sat behind early returns. | Shared save status, migration choice and Help mounted once across routes. Practice stays available during connection problems. |
| J04 | Offline Settings appeared writable, then silently rejected actions. Browser saves were described as cloud saves. | Controls explain read-only state and offer retry; local/cloud/cached records have accurate descriptions. Export remains available. |
| J05 | Navigation alternated between Cards/Collection, Events/Jobs and thematic combat names. | Stable Collection, Battle and Jobs labels, with thematic names as secondary context. |
| B01 | Change Crew tried to leave an unfinished account battle and could strand the player in an error. | Preserve the account match, open its docket and explicitly Resume Saved Battle. |
| B02 | Practice could silently load an old crew/deck after a new selection. | Explicit resume saved crew/deck or start fresh with selected crew/deck. Route parameters follow lesson/practice/crew changes for refresh recovery. |
| B03 | Special effects were hidden in hover-only titles and committed immediately. | Inspect → Use confirmation with effect, cost, turn consequence and forecast. Battle uses HP; Roast uses composure. |
| B04 | Deploy secretly replaced the frontline. | Deploy & Take Frontline explicitly names both consequences. |
| B05 | A partial tactics draft could navigate away and silently use the last valid deck. | Collection requires a valid twelve-card deck before its launch CTA enables. Draft validation explains what remains. |
| R01 | Roast implied crowd was the victory goal and hid its 36-move loss rule. | Persistent actual goal, moves left and closing warning; all three opponents must break while a crew member survives. |
| R02 | Roast previews showed outgoing damage but omitted the automatic response and resource changes. | Deal / Take / Hype / Room forecasts simulate the real reducer, including interruptions, knockouts, act clears and timeout. |
| R03 | Crew choice hid starting composure and Special effects. | Casting displays both and explains tag-in turn cost. |

## Observed browser play

Used ordinary visible UI controls at a fresh `localhost:3001` browser origin. No production player record was reset, imported, surrendered or otherwise modified. No hidden save injection or scripted combat policy replaced the browser play.

- Opened one real welcome pack, revealed all five fighters and collected it. The guide advanced to Learn Battle; catalogue previews are explicitly labelled as previews.
- Completed all five guided lessons: ordinary attack, spell plus subsequent attack, set trap plus its automatic defense trigger, inspected/confirmed Special, and knockout replacement with a reserve.
- Completed a full independent practice duel, winning in turn 9 at 120 LP against 0 enemy LP. Used exposure, weakening, healing, a piercing spell, a counter trap and a protection trap. Hidden enemy traps correctly changed the printed forecast. Left/resumed practice during review; the turn, HP, crew, deck and set trap persisted.
- Founded a City, collected its first 50 Influence, built a second Watchtower and assigned owned BatExpense without displacing the starter resident. Production changed from 50 to 100/day. Upgrade preview accurately showed 100 → 110/day and its 120 Influence cost.
- Resolved EV01, immediately opened EV02 through Next Street Beef, then resolved EV02 with a different resource reward. The same already-resolved event did not repeat.
- Market search selected BatExpense as the matching recipe, stated the missing 20 Trash, and removed the recipe entirely for an empty search. Crafting/recycling transactions were not forced with fabricated resources.
- Profile agreed with the actual session: 50 XP, Level 1, five discoveries, one pack and zero scored battle wins. Practice correctly earned no account win/reward. Rankings separated the private score from public participation and fictional characters.
- Settings correctly identified the browser save. Global Help opened from Rankings. No reset/import or feedback submission was performed.
- Played Roast practice through act one using bait → jab → Special → deadpan, advancing to Karen with 32/36 moves remaining. Outgoing damage, return damage and hype matched the new previews. Inspected the real desktop layout and fixed goal placement in its compact grid. This bounded pass did not finish all three acts or exercise legacy v1 timing.

## Validation and limits

- 44 world/progression/City checks passed across three focused files.
- 31 combat/Roast checks passed, including eight new forecast edge cases.
- 11 first-session journey checks passed.
- TypeScript completed successfully; the final production build includes its own typecheck.
- Existing React effect/ref lint debt remains in older combat components. It was not suppressed or rewritten as part of the audit; lint is not claimed clean.
- No runtime artwork was replaced or removed. Current portraits, actor identities, production masters and asset manifest entries are preserved.

## Remaining design work

1. **Beginner difficulty:** the full practice match is winnable, but its AI and twelve-card tactics still demand planning. Six bounded naive-policy games finished in 8–12 rounds; simple first-district policies lost. Those simulations are diagnostic, not balance data. A separate forgiving beginner opponent is preferable to claiming this is effortless.
2. **City interaction depth:** constructing a building currently traverses multiple nested dialogs and confirmation. A single plot sheet with building, assignment and next story would be easier to learn.
3. **Small-screen readability:** compact desktop controls are improved for lessons; the entire mobile experience has not been replayed end to end in this pass.
4. **Healing summaries:** crew-healing Specials update every eligible fighter correctly, but some event summaries report frontline healing rather than the crew total. This does not change health outcomes.
5. **Scope:** live authenticated migration/offline recovery, every fighter/tactic matchup, all story branches and complete long-term economy balance are not established by this audit. Domain checks cover deterministic regressions; further human play should guide balancing.
