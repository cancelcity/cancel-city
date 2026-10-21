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

The twelve-card deck has two copies each of Receipt, Apology, Leaked DMs and Ratio Storm, plus one copy of the other four tactics. Four cards start in hand; the hand limit is five. Excess draws discard the new card. The deck does not recycle: each empty-deck draw costs 5 LP, then 10, 15, etc. The hand header and log explain fatigue. This bounds healing/defense loops. The emergency 40-round verdict counts full turns, not preparation commands.

## Example opening

Starter Yasuo has 22 ATK and a 3-star cost, leaving 3 opening stars. Against opening L Ratio's 35% shield:

1. Tweet Receipt costs 2 stars and deals 14 damage through the shield. It exposes the survivor. It is still your turn.
2. Attack deals 28 damage after exposure, gains 1 hype, and ends the turn.

That turn deals 42 damage. Ratio Storm instead deals less damage but weakens the reply. Deploying a fresh resident consumes the same star budget and can protect a wounded lead. Banking stars is also a valid choice.

## Entry, saving and compatibility

Practice is available at `/battle/?practice=1`, in the toolbar and in connection-error banners. It uses a separate browser save without authentication or rewards. It cannot change inventory, cloud battle, account record or Roast Night. Resume keeps the practice fight; choosing a new crew starts a new one; rematch keeps the current crew.

The screen explains disconnection and saved Roast Night instead of leaving unexplained disabled controls. An unfinished old battle may explicitly restart under v5 without recording a loss. Only old rules permit this restart, preventing repeated free resets of a current match. Older saves are never automatically surrendered or replaced. Campaign and daily reward/replay handling remain authoritative.

Checks cover preparation limits, same-turn combat, resource refills, knockout LP, fatigue, save recovery, legal AI completion, production API, legacy rules and the actual browser flow. Passing legality checks alone does not establish fun or competitive balance.
