# City, districts and specialist buildings

The City hierarchy is **City → district → building**. Your owned twelve plots remain a separate construction block, with the same levels, residents, daily production, faction stories and inline property dock. District maps are authored neighbourhoods with distinct businesses; visiting them does not add or replace a construction recipe.

| District | Specialist buildings |
| --- | --- |
| Cloutside | Fade Court, Sole Custody, Kancel Fried Chicken, 360 Deal Records |
| Liability Hills | Oscar Goblin Studios, Baby Oil Manor, The Red Flag Brothel, Gobstein Yacht Club, Moonwalk Museum |

Each district has its own illustrated map, numbered HTML entrances and a complete accessible street directory. The illustration stays uncropped so map coordinates remain aligned on desktop and mobile. District cards list their buildings; tab progress counts saved building endings. Building pages show the full breadcrumb and return to their parent district. The next-unvisited action stays inside that district.

Cloutside satirizes sneaker prices, barbershop punditry, exploitative record deals and a fast-food franchise. Liability Hills satirizes celebrity excess, publicists, trophies and corrupt VIP entitlement. Existing Oscar Goblin, Jeffrey Gobstein and Baby Oil Supplier portraits retain their character identities. Moonwalk Museum is an original memorabilia business, with glove auctions, staged exhibits and endlessly postponed comeback merchandise.

## Routes and saved progress

District routes are `/city/?zone=cloutside` and `?zone=liability-hills`. A building adds its stable ID, for example `?zone=cloutside&building=kfc`. Legacy links such as `?zone=kfc` and `?zone=yacht-club` still open the same building with its correct parent district. Browser Back and direct reload retain the hierarchy.

The old `city.zoneEndings` field and `city-zone:<building-id>` receipts are retained for compatibility. All four old IDs and their rewards stay unchanged. Five new buildings add three authored choices each. Every building pays once; alternate endings are read-only. District entry is free and gives no reward. Claiming requires a founded City and writable save. The shared reducer validates authored rewards and two-way ending/receipt integrity. No database migration is required.

Reward actions follow the saved outcome: Packs for tickets, your owned block for Influence, and the Trash Market for Trash. Alternate previews do not change that action. District navigation scrolls back to the map header; property paging resets the dock. The block objective retains upgrade/matching-host recovery for paused chapter jobs.

## Art and validation

Two district maps were generated using the built-in imagegen tool. Prompts and final asset paths are in `docs/design/city-district-art-prompts.md`. Runtime WebPs live under `public/assets/city-v3/`; raw PNG masters stay in the full Site source under `docs/art/city-v3/` and are listed in the playable mirror's omitted authoring-assets manifest. Existing City art is preserved.

Focused City tests cover all nine buildings, their twenty-seven choices, one-time rewards, legacy saves, district membership, invalid commands and reward receipt integrity. Production build, representative browser play and the runtime-asset workflow verify the saved release.
