# Screenshot Court: card duel rules (v4)

This is Cancel City's own compact card duel, inspired by summoning and stance-based card games. It is not a full implementation of Yu-Gi-Oh.

## Residents and resources

- Bring three owned residents or starter loaners. All start unsummoned in reserve. Cards in your collection are never consumed.
- Both players start with 120 LP, 6 stars and four spell/trap cards. From each side's second turn, gain 2 stars (maximum 10) and draw one card (hand maximum 5).
- Take one action per turn: summon, tag in, attack, defend, Special, Duo, play a spell/trap, or pass. All costs and effects are validated by the domain engine used by both local play and the production API. There is no client-controlled chain multiplier.
- Resident stats come from one shared function: HP = round(65 + Shame × .3), ATK = round(16 + Clout × .1), DEF = round(4 + Chaos × .09). Star cost = clamp(ceil((HP + 2 × ATK + DEF − 95) / 16), 1, 5). Faction/rarity labels do not secretly alter these stats; campaign enemy HP/ATK retain district scaling, shown on their battle cards.

## Summoning, tributes and positions

Summon a reserve by spending its printed stars. It enters the frontline; a previously summoned frontline becomes a summoned bench resident. Optionally cancel a different surviving summoned resident as a tribute to reduce the cost by 2 stars, minimum 1. This affects only the current duel. Tagging in an already summoned resident costs 1 star. Each is the turn's action.

An attack deals ATK damage. Against defense stance, subtract DEF first (minimum 1), then apply any temporary percentage shield. Weakness reduces attack power by 30%; exposure increases incoming power by 25%. A Community Note trap halves the resulting hit. Round the final damage to an integer, minimum 1. Piercing effects ignore DEF and percentage shields, but still trigger traps.

Defense stance persists until that resident attacks, uses a Special or casts a damaging spell. Temporary shields, weakness and exposure are consumed by a damaging hit. Excess damage goes to LP. An empty frontline takes direct LP damage. Knockouts promote only an already summoned surviving resident; reserves require a paid summon.

## Abilities and spell cards

Attack and defend each gain 1 hype. Specials spend 3 hype on the existing authored resident kit. Duos also spend 1 hype from a summoned matching partner and can be used once per side. Existing faction passives and starting synergy remain: three matching factions give 2 initial hype; three different factions give a 35% initial shield. No Special is called a tribute.

The eight-card Drama & Receipts deck is shuffled deterministically from the saved match ID and side. Drawing, hand, costs, discards and set traps persist with the match. When the draw pile is empty, discard cards recycle in order. The set trap is not part of the discard until triggered.

| Card | Stars | Actual effect |
| --- | ---: | --- |
| 2014 Tweet Receipt | 2 | ATK damage; expose the survivor |
| Ukulele Apology | 1 | Restore 20 frontline HP; gain 1 hype |
| Fake Charity Stream | 3 | Restore 12 HP to every surviving summoned ally |
| Lawyer Up | 1 | Defense stance plus a temporary 35% shield |
| Community Note | 2 | Set a trap: halve the next damaging incoming hit, then discard |
| Cease & Desist | 2 | Set a counter trap: cancel the next enemy Special, Duo or damaging spell, then discard |
| Leaked DMs | 3 | ATK + 10 damage, ignoring DEF and temporary shields |
| Ratio Storm | 2 | ATK − 5 damage; weaken the survivor's next hit |

One trap may be set per side. Reactions trigger automatically; there is no manual reaction stack. A countered effect still consumes its stars, card, hype and/or once-per-duel Duo use. Opponent trap identity is hidden in the UI until activation. The AI uses the same legal-action and effect functions as the player.

## Completion and compatibility

Win when opposing LP reaches zero or all three opposing residents have zero HP. After 80 actions (40 rounds), compare LP, then total remaining HP as fractions of each resident's maximum; a tie goes to the city. Surrender records a loss. Campaign, daily, practice and mastery reward handling use the existing authoritative command path and replay protection.

The current Court UI explicitly starts `rulesVersion: 4`. Older clients and saved battles retain versions 1–3 and their existing rules and presentation. No existing match, collection or Roast Night session is automatically reset or surrendered. Existing Special/Duo cinematics and artwork remain available.

Validation covers star spending/refills, tributes, stances, shields, LP overflow/direct attacks, both trap types, spells, save recovery, legal AI completion, production API commands and legacy battle regressions. Automated legality checks do not establish competitive balance; costs and pacing should be tuned from actual play.
