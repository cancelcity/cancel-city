# Screenshot Court: prepare, then fight (rules v5)

V4 made support actions replace an entire attack, offered a bad two-star tribute trade, and gave LP little relevance until the crew was nearly eliminated. Cloud disconnection plus a saved Roast Night could disable every button. Controls also fell below a laptop viewport. V5 addresses the turn structure, objective, entry path and presentation together.

## A complete turn

1. **Deploy, optionally:** summon one reserve for its printed stars OR tag in an already summoned resident for 1 star. This does not end the turn.
2. **Tactic, optionally:** inspect and confirm one spell or trap, paying its stars. This does not end the turn either. Deployment and tactic may happen in either order.
3. **Fight:** Attack, Defend, Special or Duo ends the turn. End Turn skips fighting if needed.

Both leads start deployed, with their printed cost deducted from six opening stars. Neither side gets a refill on its opening turn. Later turns give 2 stars (cap 6), reset preparation slots and draw one card. Summons and tactics share that budget. No tributes are offered in this three-resident format.

## Win condition and combat

Both sides start with 120 LP. Each knockout costs its owner **40 LP**, plus any overkill. An empty frontline takes direct LP damage. Three cancelled residents therefore necessarily end the duel. Already summoned survivors replace a knockout automatically; other reserves need a paid deployment.

Printed HP, ATK, DEF and stars use the shared formulas in `duel-rules.ts`; foils do not improve them. Campaign enemy HP/ATK retain district scaling, shown on the board. Defense stance subtracts DEF from incoming power, minimum 1, before temporary shields. Defense lasts until that resident attacks, uses a Special or casts a damaging spell. Weakness reduces the next hit by 30%; exposure increases the next incoming hit by 25%. Relevant hits consume shields, weakness and exposure. Piercing ignores DEF and shields, but still triggers traps.

Attack and Defend gain 1 hype. Specials spend 3 hype on the authored resident kit. Duos also spend 1 hype from a summoned matching partner, once per side. Existing faction synergy, passives, artwork and cinematics remain.

## Tactics, traps and fatigue

The eight existing tactic cards retain their printed effects: Receipt exposes, Ratio Storm weakens, Leaked DMs pierces, Apology heals and adds hype, Charity heals summoned allies, and Lawyer Up supplies defense plus a 35% shield. Community Note halves one incoming damaging hit. Cease & Desist cancels one enemy Special, Duo or damaging spell. Traps react automatically once and discard. Countered effects still pay their costs.

A small damaging tactic can bait a trap before a stronger Special. Opponent traps remain face down and forecasts exclude them. The AI plans a full turn from public enemy information rather than scoring a support card as a lost attack.

Build exactly twelve tactics with at most two copies of each of the twenty identities. All twenty are free. Balanced, Pressure, Control, Slop & Cope and Consequences Sold Separately recipes provide starting points. The Balanced recipe has two copies each of Receipt, Apology, Leaked DMs and Ratio Storm, plus one copy of the other four tactics. The AI keeps that Balanced deck; the player’s selected deck is validated by the production API and snapshotted into the match. In-progress matches and rematches retain their original composition. The deck choice is saved in this browser; the cloud battle itself saves its full card state. Four cards start in hand; the hand limit is five. Excess draws discard the new card. The deck does not recycle: each empty-deck draw costs 5 LP, then 10, 15, etc. The hand header and log explain fatigue. This bounds healing/defense loops. The emergency 40-round verdict counts full turns, not preparation commands.

## Example opening

Starter Yasuo has 22 ATK and a 3-star cost, leaving 3 opening stars. Against opening L Ratio's 35% shield:

1. Tweet Receipt costs 2 stars and deals 14 damage through the shield. It exposes the survivor. It is still your turn.
2. Attack deals 28 damage after exposure, gains 1 hype, and ends the turn.

That turn deals 42 damage. Ratio Storm instead deals less damage but weakens the reply. Deploying a fresh resident consumes the same star budget and can protect a wounded lead. Banking stars is also a valid choice.

## Entry, saving and compatibility

Practice is available at `/battle/?practice=1`, in the toolbar and in connection-error banners. It uses a separate browser save without authentication or rewards. It cannot change inventory, cloud battle, account record or Roast Night. Resume keeps the practice fight; choosing a new crew starts a new one; rematch keeps the current crew.

The screen explains disconnection and saved Roast Night instead of leaving unexplained disabled controls. An unfinished old battle may explicitly restart under v5 without recording a loss. Only old rules permit this restart, preventing repeated free resets of a current match. Older saves are never automatically surrendered or replaced. Campaign and daily reward/replay handling remain authoritative.

Checks cover preparation limits, same-turn combat, resource refills, knockout LP, fatigue, save recovery, legal AI completion, production API, legacy rules and the actual browser flow. Passing legality checks alone does not establish fun or competitive balance.

## Card identity, roles and learning

Every collectible character is a **fighter**, with summon stars, HP, ATK, DEF and its authored Special. Specials spend hype; they are not spells in the tactics deck. Fighter role labels describe that actual Special: support, healer, defender, disruptor or striker. No role or damage bonus is derived from cosmetic rarity or foil. The focused twelve-fighter practice roster includes each role and is available as loaners only in practice. Campaign still checks ownership and starter-loaner eligibility on the server. Broader roster balance is not claimed by these labels.

Spells have cyan frames and resolve immediately. Traps and counter traps have pink frames, are set face down, and state their exact reaction. Twenty dedicated raster illustrations depict satirical actions and reactions in the same grotesque inked-comic style as the resident collection. Each tactic has a stable T-number, a city theme, a readable effect and a separate flavour joke. The original SVG action icons remain in the runtime asset archive for compatibility. All themes work with any crew; theme does not add faction restrictions. The same definitions, effects, costs and art feed the collection’s Spells & Traps catalogue, crew/deck lobby, hand inspection and read-only match-deck viewer. Existing character portraits and sprites are unchanged.

`/battle/?learn=1` is a resumable, separate five-lesson rehearsal: attack; inspect and cast a spell then attack; set and trigger Community Note by defending; use the fighter’s Special; deploy and attack after a knockout. Every move uses the real battle engine. The instructor uses ordinary attacks and summons. A clearly labelled second scenario begins with the player’s lead knocked out and 80 LP to teach replacement. These training fixtures never enter the account, reward or ranking flow. Exiting, restarting or continuing into full practice is explicit.

## Scandal season: illustrated tactics

The first illustrated drop contains eight spells and four traps/counters: two cards for each of the six city themes. The full catalogue now contains thirteen spells and seven traps/counters. Search covers titles, effect roles and joke lines. Type/theme filters and enlarged dossiers use the same definitions as the battle hand. The old eight cards keep their costs and effects. The starter deck remains unchanged, and v4 deals only the original eight identities. Existing v5 decks remain valid.

- **AI Slop Tsunami** (spell, 1 star): draw up to two cards from the current pile. Overflow beyond a five-card hand discards. No drawing/recycling from an empty pile; an empty pile makes the spell unavailable. Normal turn fatigue is unchanged.
- **Touch Grass Injunction** (spell, 1 star): heal the frontline up to 12 HP and remove weakness/exposure. No effect on a full, clean fighter, so that action is unavailable.
- **Terms & Conditions Apply** (counter trap, 1 star): cancel the next enemy healing spell or Special with any healing component. Cancel the entire effect, including damage, hype, shields or cleansing. Costs remain spent. Ordinary attacks, pure damage spells and non-healing Specials do not trigger it.
- **Skill Issue Insurance** (trap, 2 stars): before a hit on a wounded surviving frontline, heal it up to 16 HP, bounded by maximum HP. It discards once, before damage is calculated. At full HP it stays set; it never revives a KO, protects empty-frontline LP or prevents a sufficiently large knockout.

One trap slot prevents stacking these reactions. Hidden opposing traps remain excluded from forecasts. Cancelled healing Specials do not play their successful-effect cinematic. Full-resolution generated production masters are retained in the original Site source under `docs/art/tactics`; the playable mirror includes optimized individual runtime WebPs.

## Consequences sold separately: second illustrated drop

Eight new illustrated cards (T013–T020) are free with every crew. The **New drop** filter isolates them in the catalogue, and the **Consequences sold separately** recipe includes all eight plus Receipt, Leaked DMs, Touch Grass and Apology. Existing decks and saved matches keep their cards.

| Card | Type / cost | Actual effect |
| --- | --- | --- |
| Engagement Bait | Spell / 1 | Transfer 1 hype from the living enemy frontline to yours; requires enemy hype and your lead below the 3-hype cap. |
| Offshore Account | Spell / 0 | Pay 12 frontline HP for up to 2 stars, capped at 6. Requires more than 12 HP and room for stars. |
| Rebrand Speedrun | Spell / 2 | Transfer your frontline's weakness and exposure to the living enemy frontline. Requires at least one debuff. |
| Thoughts & Prayers | Spell / 1 | Heal every living summoned ally up to 8 HP, then expose all of them, including full-HP allies. Requires a wounded summoned ally. Terms cancels both heal and drawback. |
| Doomscroll Deluxe | Spell / 0 | Pay 8 frontline HP to draw one actual card. Requires more than 8 HP and a nonempty pile. Does not recycle or bypass fatigue. |
| 404: Accountability Not Found | Counter trap / 2 | Cancel the next ordinary Attack, including direct LP attacks. The attacker still gains hype and ends its turn; no hit consumes weakness, exposure or shields. Ignores spells, Specials and Duos. |
| Chargeback Goblin | Trap / 1 | Before the next damaging spell, Special or Duo hit, refund up to 2 stars, capped at 6. Does not stop damage; can refund even if the hit KOs. Ordinary Attacks do not trigger it. |
| Screenshotted in 4K | Trap / 1 | Before the next damaging hit, expose the attacking resident. Does not reduce that hit and can trigger even if the defender is knocked out. |

HP payments are costs, not incoming attacks: they bypass shields, do not trigger enemy traps and cannot knock out the payer. Both still use the one tactic slot. Stars and draws never exceed existing caps. One face-down trap per side prevents reaction chains. The AI scores lost hype, exposure and weakness as well as whole-turn damage and resource use; hidden enemy traps remain excluded from its planning. Legality and completion checks do not establish competitive balance.
