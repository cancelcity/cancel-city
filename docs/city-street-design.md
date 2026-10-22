# City streetfront and fixed landmarks

The City uses a painted 2D street background with separate existing transparent building sprites. Every displayed property is read from the same twelve saved plots; art is never substituted for owned progression. Six addresses are visible at once, with all twelve available in the address ribbon. Selection drives one inline property dock for building, assignment, chapters, job acceptance/claims and true capped upgrade previews. Advanced Records retains the old move/rename/archive tools.

The approved streetfront mockup is the art direction. The shipped composition adapts to available viewport space and actual occupied properties. Existing resident portraits, building levels and actor sprites are preserved.

## New fixed destinations

| Destination | Purpose | Save behavior |
| --- | --- | --- |
| Gobstein Yacht Club | VIP corruption, unpaid invoices and receipts | One authored choice and reward |
| Baby Oil Manor | Bulk delivery, slippery supply chains and excess | One authored choice and reward |
| The Red Flag Brothel | Adults-only venue, bad customers and worse excuses | One authored choice and reward |
| Kancel Fried Chicken | Corporate fast-food parody and fictional employee misery | One authored choice and reward |

Venues are separate fixed locations, not extra buildable kinds. District URLs use `?zone=yacht-club`, `oil-manor`, `red-flag-house` and `kfc`. All are accessible for reading. Choosing requires a founded City and writable save. Choices are validated on the shared game API and applied by the same reducer for account/local play. Once chosen, alternate outcomes are clearly labelled story-only and grant no further loot.

Old City saves default `zoneEndings` to `{}`. Each saved outcome must have its `city-zone:<id>` reward receipt and vice versa. Existing plots, story contracts, Influence, daily production, saves and rewards are retained. New reward markers cannot be forged by UI arguments.

## Artwork

Five backgrounds generated with the built-in imagegen tool and art-directed against the approved mockup. Original PNG masters live in the Site source under `docs/art/city-v2/`; optimized WebP runtime assets live under `public/assets/city-v2/`. Raw masters are optional authoring material, recorded in the playable mirror's omitted-assets manifest. Existing runtime art is retained.

## Focused validation

39 City checks passed, covering known/invalid zone choices, finite rewards/replays, forged receipts and backward-compatible saves, together with existing City/world rules. TypeScript passes. Browser review covers property selection, inline building/assignment, saved venue choice and alternative read-only outcome, URL persistence and mobile layout. Production build and asset verification are performed for the saved release.
