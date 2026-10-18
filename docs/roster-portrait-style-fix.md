# First twelve card portraits — deck style correction

The first-batch card portraits were neutral full-body acting-sheet crops on cream backgrounds. They did not match the original deck's dominant faces, foreground props, bright backgrounds and distressed ink. Replace only those twelve portraits with dedicated, reference-guided card illustrations.

The existing original portraits (notably CC001, CC006, CC014, CC026 and CC043) supply framing, palette and texture references. Current first-batch artwork supplies character identity, outfit and prop references. Each dedicated square image uses prominent head/shoulders, an expressive caricature, heavy scratchy black linework and halftone texture, saturated full-bleed colour, and city/splatter motifs. Exact prompts, original generated masters and provenance are retained in `docs/art/roster-card-portraits-v3/<ID>/`.

Selected art is encoded mechanically as `public/assets/roster-v3/<ID>.webp` (896 square) and `<ID>-small.webp` (384 square). No acting sprites or special directors are changed. The new names, card IDs, inventory, rarity, stats, combat kits and odds are preserved. Prior portrait versions remain in the repository.

`portraitSourceSet` keeps compact and large portraits on the same selected artwork. Previously, the first-batch full-size candidates referenced the new portraits while the small candidates still pointed to the previous resident illustrations, so phone and desktop could show different identities. Untouched cards retain their original paths and candidate widths.

Verification: compare all twelve at both card thumbnail and full size against original deck neighbours; check runtime dimensions and candidate paths; run the existing gameplay/save tests plus responsive-candidate regression; typecheck and production build. Browser rendering cannot be checked here because browser automation is unavailable. Native publication result confirms deployment, not browser appearance.
