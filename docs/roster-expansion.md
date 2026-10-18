# Cult of Personality update

## Player-facing changes

- Migration no longer downloads a JSON file. A best-effort device checkpoint is kept while progress transfers to the cloud. The transfer does not require writable browser storage. Account deletion clears the checkpoint too.
- Export/import remain voluntary under collapsed Settings data tools. Ordinary play and saving never require installing or downloading a file. Owned-card PNG export remains an explicit optional action.
- The catalogue expands from 30 to 42 residents, grouped as City Intake (30) and Cult of Personality (12). Collection filters by set and displays accurate global/faction counts. New-set labels and new-character promotion appear on cards, Home and packs.
- Lore is now an illustrated casebook with cover posters, six faction dossiers, narrative/perk context, highlighted people of interest, global search, set filtering, owned status and direct pack/battle actions.
- Twelve authored kits are part of gacha, crafting, combat and mastery. Stable IDs CC001–CC030 and all their existing art/stats/kits remain intact. CC031–CC042 have generated standalone portrait masters and responsive WebP derivatives.
- Public-figure-inspired designs use fictional satirical alter egos. Quotes are authored fictional dialogue, not attributed statements by the people inspiring the designs. The wave includes Zuckerberg/pop-superstar/Bezos/Bono/Trump/Elon/Kanye-inspired characters alongside original corporate, political and influencer caricatures.

## Compatibility and economy

Rarity weights remain 60/25/10/4/1. Pool sizes are now 9/9/9/7/8 by rarity. Selection within the selected rarity remains uniform. Pack outcomes already committed before the release do not reroll. Balance version is gacha-4.

Original faction and city completions continue to refer to the original 30 residents, preserving already earned milestones. Separate wave-two faction-pair rewards grant one pack each; collecting all 12 new residents grants three packs, once. Current full album completion displays 42. No former reward is revoked or re-awarded because the catalogue grew.

Daily battles now persist rosterVersion. Existing fights default to the original 30-resident crew pool. New fights use the expanded pool. This prevents a paused daily crew from becoming invalid when the catalogue expands. Legacy combat rules and one-time campaign rewards remain unchanged.

## Art provenance

Built-in imagegen was used once per new portrait with the existing CC026 portrait as style reference. Prompts and source paths are recorded in `docs/art/residents/wave-two-briefs.json` and `wave-two-a.json` through `wave-two-f.json`. Each selected PNG master is 1254×1254 and was visually inspected. All 12 were reviewed together for consistent ink texture, framing, palette and readable character identities. Encoding is documented by `docs/art/asset-processing.json`; runtime images are 384/1024 WebP variants. No creative alteration was performed during encoding.

## Validation limits

Automated rules/API/client tests include legacy set rewards, old daily crew recovery, new catalogue/kit coverage, download-free migration, quota-error migration recovery and the existing concurrency/reward/recovery checks. Layout, touch, audio and full signed-in hosted flows still need supported browser/device QA. Public launch, commercial rights clearance and human balance sign-off are not asserted.

The subsequent agreed city update is implemented. See `docs/city-spec.md` for its actual scope and validation.
