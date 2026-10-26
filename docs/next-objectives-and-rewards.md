# Next objectives and readable rewards

The home notice and its primary button use the same `nextObjective` selector. This is a recommendation, not a new quest or reward system; viewing it never changes a save.

Recommendations preserve the five starter steps. Afterwards they resume a pending pack or active account game, continue an open Airfryer case, surface manually claimable jobs, offer the first block foundation, then select the next uncleared campaign district. Campaign finishers can try the first rewarded Roast show, the city case, an active building job, the daily case, or more City Stories. Completed automatic rewards are never advertised as needing a claim.

Destinations use the actual service: foundation opens `/city/?view=block`, a job opens its Missions category, and a campaign recommendation opens its district in crew preparation. Battle query parameters accept known districts and modes only; the existing campaign locks still apply. Daily suggestions and mission eligibility refresh against the current UTC date.

`rewards.ts` describes the current reward rules for presentation. It does not grant currency or change balance. Before a match the offer shows remaining first-clear rewards, Clout, and eligible mastery bonuses for the chosen crew. Afterwards `match.reward` remains the ticket/XP receipt. A detailed split is inferred only for current matches whose totals reconcile exactly; legacy or unusual receipts keep their recorded totals without invented history. Roast distinguishes the first account clear, a reward-free encore, and independent practice.

`packBalance` is displayed as tickets: one ticket opens one pack of five fighter cards. Pack receipts show recorded XP, discoveries/duplicates, and identified automatic ticket bonuses. Trash crafts chosen fighters; XP raises a cosmetic profile level; Clout is reputation; Influence builds the block. None of these explanations imply a combat stat increase.

Validation for this pass: 55 targeted progression/reward/game tests and TypeScript passed. Browser checks followed foundation to the next campaign district, inspected the saved victory receipt, opened/revealed/collected a real local pack (40 XP, three discoveries, two duplicate copies), and claimed the resulting discovery milestone through the home shortcut. The mobile home objective fits at 390 px without horizontal overflow. No production player data was altered.
