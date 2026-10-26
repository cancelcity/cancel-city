# Navigation and first-fight focus

The main header now has three destinations: Play, Collection and City. The grouped game menu preserves battles, Roast Night, objectives, packs, market, props, profile/rankings, settings/save, archive, special animations, privacy and help. Deep links highlight their parent destination. Escape closes the game menu and returns focus to its summary.

Play leads with the existing contextual next objective and one Continue link. Other activities and the character catalogue are expandable. Collection shortcuts remain available. The objective selection, starter journey, guest/cloud boundary, economy and battle rules are unchanged.

Lessons use compact navigation, one instruction banner and lesson options. Combat pages omit the promotional ticker. Healthy browser/cloud save labels are compact; error, migration, offline and save-action notices retain their existing presentation and behavior.

At widths up to 700px, active fighters share one row. Reserves, tactics and log use disclosures; relevant spell/trap lessons expose the hand automatically. An empty player frontline exposes surviving deployment choices automatically. Cancelled cards are omitted from the compact field, with battle events retained in the log. Enemy reserves remain optional. Attack, Defend and Special share a sticky command panel. Card inspection and confirmation still use the existing handlers.

## Verification

- TypeScript and all 511 tests pass. The suite ran with four workers and a 20-second per-test timeout after parallel asset hashing exceeded the default five-second timeout while the development server was compiling.
- Browser checks at 390×844 covered attack, spell, trap, defend, special confirmation, replacement deployment and the replacement attack. Initial action buttons measured y675–745, fully within the viewport. Deployment did not consume the fight action.
- Checked the 680px breakpoint for scrollable combat, plus desktop hand/control sizing. This is responsive browser QA, not a physical-device or human usability study.
- Header menu, Escape, primary navigation and expandable activities were checked through the UI. No new runtime artwork or dependencies are introduced.
