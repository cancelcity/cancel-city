import {specialAt, SpecialMotif} from './specials';
import type {BuildingKind} from './city';
import {EXPANSION_GAGS} from './expansion';

export type WeaponFamily = 'psychic'|'camera'|'key'|'grass'|'badge'|'phone'|'controller'|'hammer'|'paper'|'rocket'|'stamp'|'screen'|'shield'|'pasta'|'laser'|'rug'|'storm'|'mic';
export function weaponFamily(motif:SpecialMotif):WeaponFamily {
  if(['psychic','camera','grass','badge','phone'].includes(motif))return motif as WeaponFamily;
  if(motif==='masterkey')return 'key';
  if(motif==='controller')return 'controller';
  if(motif==='hammer')return 'hammer';
  if(motif==='rocket'||motif==='yacht')return 'rocket';
  if(motif==='laser')return 'laser';
  if(motif==='rug')return 'rug';
  if(motif==='pasta')return 'pasta';
  if(['podium','statue','clock','paywall','invoice'].includes(motif))return 'stamp';
  if(['manager','resume','reply','spotlight','apology','delivery'].includes(motif))return 'paper';
  if(['bots','feed','chains','fans','avatar','strings','key'].includes(motif))return 'screen';
  if(['wellness','neutral','leaves','bunker','diamond'].includes(motif))return 'shield';
  if(['megaphone','encore','ego','comeback','alarm'].includes(motif))return 'mic';
  return 'storm';
}
export function sceneSeed(value:string){let n=2166136261;for(const letter of value)n=Math.imul(n^letter.charCodeAt(0),16777619);return n>>>0;}
const JOKES:Partial<Record<string,readonly string[]>>={
 ...EXPANSION_GAGS,
 CC001:['MY CONTROLLER HAS A LAWYER.','REPORTED FOR BEING BETTER.','RAGE QUIT. AUTO-RECONNECTED.'],
 CC003:['SOURCE: MY OWN REPLY.','THE JOKE HAS LEFT THE THREAD.','THREAD 48 OF 47.'],
 CC004:['IT GENERATED ANOTHER AGENT.','THE SLOP HAS BECOME SENTIENT.','HALLUCINATION: DELIVERED.'],
 CC007:['PAID IN EXPOSURE. AGAIN.','THE OVERTIME IS A PERSONALITY TEST.','PROMOTED TO EXTRA WORK.'],
 CC008:['BURNOUT HAS BEEN RESCHEDULED.','MORALE WILL CONTINUE UNTIL IMPROVED.'],
 CC012:['DIALOGUE SKIPPED. NEUTRALITY BILLED.','FOUR OPTIONS. ALL BOTH SIDES.','OPINION.EXE IS NOT RESPONDING.'],
 CC027:['IT IS SO OVER. THE BEANS ARE SO BACK.','ELEVEN SECOND OUTAGE. TWELVE PAGE MANIFESTO.','THE BEAN ICEBERG HAS A DIVORCE ARC.'],
 CC031:['THANK YOU FOR THE DATA COOKIE.','YES YES YES. TERMS UPDATED.','THE AUDIENCE IS SIX BOTS.'],
 CC021:['THE CHART IS JUST UPSIDE DOWN.','THE MOON IS IN ANOTHER GARAGE.'],
 CC026:['I AM THE MANAGER.','ONE STAR. WOULD ESCALATE AGAIN.','THE RECEIPT HAS A RECEIPT.'],
 CC037:['DEFEAT HAS BEEN REBRANDED.','THE STAMP SAYS I WON.','BIGGEST VICTORY. TINY FOOTNOTE.'],
 CC039:['HOTFIX: GRAVITY.','LAUNCH FAILED SUCCESSFULLY.','THE ROCKET IS NOW A SUBSCRIPTION.'],
 CC043:['THE COMMENT SECTION HURT ITSELF IN CONFUSION.','SUPER EFFECTIVE. LEGALLY QUESTIONABLE.'],
 CC044:['CHAT. WE HAVE CLIPPED OUR OWN DIGNITY.','THUMBNAIL FACE: PERMANENT.'],
 CC045:['THE APOLOGY HAS ENTERED CHECKOUT.','INNER PEACE: TRIAL EXPIRED.'],
 CC046:['RENT FREE? THE DEPOSIT SAYS OTHERWISE.','THE PODCAST HAS EVICTED THE AUDIENCE.'],
 CC047:['AUNTIE FOUND THE ORIGINAL DATE.','THE UNCLE IS SUDDENLY OFFLINE.'],
 CC048:['YOUR PERSONALITY HAS BEEN RECOMMENDED.','THE BOT CHILDREN ARE CLAPPING.'],
 CC049:['DAYLIGHT HAS ZERO PATCH NOTES.','THE TREE REFUSES TO ELABORATE.'],
 CC050:['BLUE CHECK. RED BANK ACCOUNT.','CREDIBILITY HAS AUTO-RENEWED.'],
 CC042:['THIS APOLOGY HAS A SPONSOR.','THE TEARS ARE BEHIND A PAYWALL.'],
};
export function specialJoke(cardId:string,seed:number){const s=specialAt(cardId),list=JOKES[cardId]??[s.quote,`${s.prop}. NOW WITH CONSEQUENCES.`,s.setup];return list[seed%list.length];}
export const CITY_GAGS:Record<BuildingKind,readonly [string,string,string]>={
 feed:['SIGNAL: TERMINALLY ONLINE','THE PIGEON REQUESTED A SOURCE.','THE TOWER RATIOED ITS OWN BROADCAST.'],
 pr:['COPIUM CLINIC ONLINE','DIAGNOSIS: IT IS SO OVER.','PRESCRIPTION: WE ARE SO BACK.'],
 summit:['OUTSIDE: HARD MODE','THE TREE HAS NO REPLY BUTTON.','THE NPC INVOICED THE SUNLIGHT.'],
 civic:['QUEST UPDATED: KEEP WAITING','THE PODIUM REPEATED ITS DIALOGUE.','THE CROWD IS SIX BOTS.'],
 rocket:['COUNTDOWN: SOON','GRAVITY IS A SERVICE OUTAGE.','MOONSHOT. LANDED NEXT DOOR.'],
 afterparty:['ICEBERG DEPTH: 4 A.M.','THE SPOON GUY HAS A DIVORCE ARC.','THE BEANS KNOW THE TIMESTAMPS.'],
};
export const CITY_HOSTS:Record<BuildingKind,string>={feed:'CC001',pr:'CC007',summit:'CC012',civic:'CC037',rocket:'CC039',afterparty:'CC027'};
