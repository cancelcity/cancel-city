import {BALANCE} from '../data/cards';
import {CITY_BALANCE} from '../data/city';
import {XP_PER_LEVEL} from '../domain/progression';

export function ResourceGuide(){
 return <details className="resource-guide"><summary>WHAT ARE MY RESOURCES FOR?</summary><dl><div><dt>Tickets</dt><dd>1 ticket opens a pack of {BALANCE.packSize} fighter cards. Claim {BALANCE.dailyPacks} free tickets each UTC day after starting your save.</dd></div><div><dt>Trash</dt><dd>Recycle spare regular copies in Market, then spend Trash to craft a fighter you choose. Keep at least one copy.</dd></div><div><dt>XP</dt><dd>Every {XP_PER_LEVEL.toLocaleString('en-US')} XP raises your profile level. Levels are cosmetic; XP is never spent.</dd></div><div><dt>Clout</dt><dd>Your reputation score on your profile. Earn it from rewarded battles and city activities. It is not spent.</dd></div><div><dt>Influence</dt><dd>Build and upgrade your City. Assign residents, then collect production once per UTC day, up to {CITY_BALANCE.dailyCap} across all buildings. Missed collections do not stack.</dd></div></dl></details>;
}
