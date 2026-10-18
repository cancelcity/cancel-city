# City motion and collectible props

The city now has a cinematic arrival, smooth plot framing, mouse/pen dragging, native touch scrolling, restrained background parallax, atmospheric light/cloud layers and six authored building loops. The free game also has a twelve-item cosmetic stash at `/stash/`: milestone rewards, resident loadouts and a city display plinth. The 42 existing resident kits, combat damage, gacha probabilities and city prices remain compatible.

## Playing the update

1. Open **Props** from the navigation or **Prop stash** from Collection. Entering the game makes the Bonk Stick ready to claim.
2. Inspect a prop to see its milestone, description and progress. Claiming saves ownership before the loot scene starts.
3. Choose an available resident and equip the prop. Owned props are reusable across residents, with one equipped prop per resident. Resident dossiers link directly to the stash.
4. Preview specials at `/battle/?specials=1`, or use an ability in a scored or practice battle. The equipped weapon swings, a gadget launches/glows, or a trophy rises during the original cinematic. These visuals do not add damage, effects, rarity odds or stat bonuses.
5. Found a city, then choose **Display in my city**. One reusable prop sits on the foreground plinth; selecting it opens its stash detail. Display and equipment can coexist.
6. Build or upgrade to see scaffolding, a contractor, dust and the final building reveal. Daily Influence pickup sends icons from visible assigned plots toward the wallet after successful collection.

## The twelve rewards

| ID | Prop | Milestone |
| --- | --- | --- |
| P001 | The Bonk Stick | Enter the game |
| P002 | Moderator’s Ban Hammer | 1 scored battle win |
| P003 | Emergency Copium Tank | 5 lifetime packs opened |
| P004 | Apology Megaphone | Claim the daily pack grant once |
| P005 | Touch-Grass Blade | Discover 5 residents |
| P006 | Mandatory Wellness Mace | Fuse 1 foil |
| P007 | RGB Keyboard of Wrath | 15 lifetime packs opened |
| P008 | Certified Rug-Pull Carpet | Craft 3 residents after this update |
| P009 | Golden Tax Umbrella | Have 3 built city plots |
| P010 | Exposure Lanyard | Upgrade a building to level 2 |
| P011 | Cursed Selfie Staff | 5 scored battle wins |
| P012 | Nonna’s Rolling Pin | Claim 1 city story-job reward |

Milestones use existing saved lifetime progress where available. Crafting has a new counter because historical saves did not track lifetime crafts. Highest city level is recorded across replacement and moving; the current saved level also unlocks P010 on existing cities. Practice wins do not count as scored wins. Every prop can be earned once; rarity labels describe collectible presentation and do not specify random drop odds. Claims are manual; there is no paid item gacha, item economy, trading or crypto feature.

The requested dildo-shaped asset was rejected by built-in image generation. P001 uses a clearly nonsexual neon-pink foam paddle with a flat rectangular head and a squiggly handle. No API/CLI fallback or alternative tool was used to bypass the rejection. Exact successful prompts and the failed attempt are recorded in the artwork provenance.

## Motion and accessibility

City scenes have their own device preference: **Full motion**, **Quick scenes**, or **Instant / still**. It is saved under `cancel-city.city-cinematics.v1`; battle special preferences retain their existing key. Full construction scenes run for 2.6 seconds, quick ones for 0.7 seconds. Loot scenes run for 1.7 seconds or 0.65 seconds. System/in-game reduced motion uses a 0.45-second static result. Both scene types use native modal dialogs, a focusable Skip button and Escape. Leaving or skipping does not undo or repeat the saved command.

Asset loading pauses the scene clock, bounded at 1.8 seconds so an asset failure cannot trap the player. Hidden tabs pause the scene and its CSS animation; background sounds stop. Existing sound opt-in/volume settings control synthesized cues. City ambient loops stop while hidden, in still/reduced mode and during map dialogs. Arrival occurs once per city per browser tab session. Dragging or manual navigation interrupts camera motion. Camera targets clamp to actual rendered map dimensions, including minimum height and zoom.

## Persistence and server rules

Save schema remains 2, with an additive `props` object (version 1): owned IDs, resident loadout, city display, successful new crafts, and highest city level. Old saves default to an empty stash. This uses the existing D1 player JSON record; no SQL migration or new storage binding is required.

- `prop-claim` verifies a known prop, the saved milestone and nonownership. It writes ownership and `prop:<ID>` together; it grants no XP, packs, Influence, scrap or resident copies.
- `prop-equip` checks prop ownership and an owned regular/foil resident or starter loaner. Null unequips.
- `prop-display` checks ownership and a founded city. Null clears the plinth.
- Existing authenticated ownership, server-controlled commands, revision compare-and-swap and request IDs protect all three commands. A lost response reuses its request ID; competing revisions cannot grant twice.
- Save validation requires ownership/reward agreement, valid IDs, owned equipment, available residents and a founded city for display.
- If a compatible older server removed the new object while retaining reward markers, the current decoder reconstructs earned prop ownership. It cannot recover discarded loadouts, display choice or craft/highest-level counters. Roll back to versions that preserve `props` whenever possible.
- Maintenance blocks new prop grants while allowing cosmetic equip/display changes. Hosted offline mutation remains refused. Failed local writes do not publish ownership or equipment.

Construction and pickup presentation only starts after `run()` succeeds. A failed build/claim produces no reveal. Reloading preserves results without automatically replaying a scene. Special presentation reads equipment for player residents; enemies keep their authored original props. Equipment never changes a committed event or battle rules.

## Art assets and reproducibility

Built-in `image_gen.imagegen` generated all twelve transparent illustrations. The inspected style reference is `docs/art/residents/CC026.png`. No API key or external image-generation service was used.

- Exact briefs: `docs/art/props/briefs.json`.
- Exact successful prompts, reference paths, original output locations, hashes and P009 framing repair: `docs/art/props/group-a-provenance.json`, `group-b-provenance.json`, `group-c-provenance.json`.
- Unchanged generated PNG masters: `docs/art/props/P001.png` through `P012.png`.
- Runtime files: `public/assets/props/P001.webp` through `P012.webp`.
- Technical processing and source hashes: `docs/art/props/asset-processing.json`.
- Regenerate transparent WebP derivatives with `node scripts/prepare-prop-assets.mjs`. It only alpha-bound crops, proportionally resizes, pads and encodes. It does not creatively repaint generated pixels.

Each runtime image is 768 × 768 with genuine alpha; all twelve total **1,595,754 bytes**, the largest **196,426 bytes**. A four-column contact sheet was visually inspected on a dark background: all twelve complete objects are readable with consistent ink, painted texture and punk colors. Tiny nearly transparent edge artifacts are retained in the original masters; technical alpha-bound cropping excludes them in runtime framing.

## Verification and limits

191 automated tests pass, including the original 165 and new ownership, milestones, finite rewards, request replay, CAS conflicts, account scope, maintenance, failed-write recovery, loaded equipment, camera bounds, custom clocks and deployable artwork checks. TypeScript checking passes. Packaging runs the production Next.js/Worker build before source push and publication.

City and gacha synthetic diagnostics also run with the new additive save field. Ten scripted city players retain all twelve finite job rewards by day 30 with a maximum 160 daily Influence; the 200-player 42-card gacha baseline remains explicitly limited to its optimistic synthetic scenario. No player playtest or complete economy/balance sign-off is inferred.

The supported browser-control plugin is unavailable in this managed environment. Following Sites instructions, no preview server, browser installation or alternate browser-control path was used. Rendered page layout, real touch/device performance, screen-reader focus, hosted sign-in, cross-device saves and actual frame/sound timing still need browser QA. This release remains a private beta.
