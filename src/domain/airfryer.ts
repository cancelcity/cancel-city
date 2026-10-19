import {z} from 'zod';
import type {Save} from './game';

export const routes=['bury','blame','broadcast'] as const;
export const moves=['evidence','divert','apologize','counter'] as const;
export type AirfryerRoute=typeof routes[number];
export type AirfryerMove=typeof moves[number];
export const ROUTES={
 bury:{title:'BUY THE SILENCE',headline:'THE DELETED SPONSOR EMAIL',cost:'−25 Influence · Heat 1/5',copy:'Pay to pull the stream. The sponsor keeps a copy of your takedown request.',receipt:'“Please delete the charity bit. Keep the discount code.” — Palace sponsorship desk',pressure:7,credibility:4,heat:1,proof:2},
 blame:{title:'NAME THE ROOMMATE',headline:'THE UNEDITED GROUP CHAT',cost:'+40 Clout · Heat 3/5',copy:'Blame Infinite Rizz. Yasuo posts the whole group chat, including your approval.',receipt:'“Charity stream?” / “As long as the palace gets a cut.” / “You literally approved this.”',pressure:9,credibility:3,heat:3,proof:4},
 broadcast:{title:'SELL THE SCANDAL',headline:'THE SPONSOR PAYOUT',cost:'+100 Clout, +1 pack · Heat 5/5',copy:'Pin the scandal and sell ad space. The payout proves exactly who profited.',receipt:'AIRFRYER PALACE — Sponsor revenue: 100. Charity transfer: 0. Apology budget: pending.',pressure:11,credibility:2,heat:5,proof:6},
} as const;
export const MOVES={
 evidence:{title:'DROP THE RECEIPT',subtitle:'Use your route’s evidence. Once per hearing.',portrait:'CC001'},
 divert:{title:'CHANGE THE SUBJECT',subtitle:'−2 pressure · −1 credibility. Repeatable.',portrait:'CC063'},
 apologize:{title:'OWN THE MESS',subtitle:'−3 pressure · −1 credibility. Once per hearing.',portrait:'CC135'},
 counter:{title:'FOLLOW THE MONEY',subtitle:'After evidence: −4 pressure, +2 credibility. Without it: +3 pressure, −1 credibility. Once.',portrait:'CC002'},
} as const;
export const QUESTIONS=[
 '“You promised meals for the neighbourhood. Why is the only receipt for a ring light?”',
 '“The stream is deleted. Unfortunately, Yasuo discovered the screenshot button.”',
 '“Your sponsor says the word charity was a vibe. The donors say it was a noun.”',
 '“One final statement. The jury has already opened the group chat.”',
];
const outcome=z.enum(['cleared','notorious','sanctioned']);
const historyEntry=z.object({move:z.enum(moves),pressure:z.number().int().min(0).max(30),credibility:z.number().int().min(0).max(12),line:z.string()});
export const airfryerSchema=z.object({
 phase:z.enum(['quiet','leaked','hearing','resolved']).default('quiet'),
 route:z.enum(routes).nullable().default(null),
 startedAt:z.string().datetime().nullable().default(null),
 heat:z.number().int().min(0).max(5).default(0),
 pressure:z.number().int().min(0).max(30).default(0),
 credibility:z.number().int().min(0).max(12).default(0),
 history:z.array(historyEntry).max(4).default([]),
 outcome:outcome.nullable().default(null),
}).superRefine((s,ctx)=>{
 const issue=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 if(s.phase==='quiet'?(s.startedAt!==null||s.route!==null):(s.startedAt===null))issue('Invalid incident start');
 if((s.phase==='hearing'||s.phase==='resolved')!==(s.route!==null))issue('A hearing requires a response');
 if((s.phase==='resolved')!==(s.outcome!==null)||s.phase==='resolved'&&s.history.length!==4||s.phase!=='resolved'&&s.history.length===4)issue('Invalid verdict');
 if(!s.route&&(s.history.length||s.pressure||s.credibility||s.heat))issue('Unopened hearing has no arguments');
 if(s.route){
  const initial=ROUTES[s.route];let p:number=initial.pressure,c:number=initial.credibility;const used:AirfryerMove[]=[];
  for(const h of s.history){if(h.move!=='divert'&&used.includes(h.move))issue('Evidence and statements can only be used once');const next=argumentEffect(s.route,h.move,p,c,used);if(next.pressure!==h.pressure||next.credibility!==h.credibility||next.line!==h.line)issue('Argument receipt does not match the hearing');p=next.pressure;c=next.credibility;used.push(h.move);}
  if(s.pressure!==p||s.credibility!==c)issue('Hearing counters disagree with saved arguments');
  const verdict=s.history.length===4?verdictFor(p,c):null;
  if(s.outcome!==verdict||s.heat!==(verdict?verdict==='cleared'?0:verdict==='notorious'?3:5:initial.heat))issue('Verdict and heat disagree');
 }
});
export type Airfryer=z.infer<typeof airfryerSchema>;
export const freshAirfryer=():Airfryer=>airfryerSchema.parse({});
export type AirfryerCommand={type:'airfryer-start'}|{type:'airfryer-choose';route:AirfryerRoute}|{type:'airfryer-argue';move:AirfryerMove;round:number};
export const airfryerCommandShapes=[z.object({type:z.literal('airfryer-start')}),z.object({type:z.literal('airfryer-choose'),route:z.enum(routes)}),z.object({type:z.literal('airfryer-argue'),move:z.enum(moves),round:z.number().int().min(0).max(3)})] as const;
export const verdictFor=(pressure:number,credibility:number)=>pressure<=3&&credibility>=3?'cleared':pressure<=5?'notorious':'sanctioned';
export const VERDICTS={
 cleared:{title:'THE RECEIPTS WON.',sign:'OPEN BOOKS. BAD COOKS.',copy:'The sponsor takes the fall. Yasuo keeps the screenshots. The Palace reopens with its accounts taped to the window.',reward:'+1 pack · +50 Influence · +40 XP',relation:'Yasuo: reluctant ally. Infinite Rizz: no longer on the guest list.'},
 notorious:{title:'BAD PRESS. FULL HOUSE.',sign:'AS SEEN IN COURT',copy:'The jury refuses to endorse you. The queue doubles anyway. The Palace puts the scandal on the menu.',reward:'+100 Clout · +40 XP',relation:'Infinite Rizz: business partner. Yasuo: permanently recording.'},
 sanctioned:{title:'LICENSE TO GRIFT: REVOKED.',sign:'UNDER PUBLIC AUDIT',copy:'The jury puts the Palace under public audit. Every sponsored post now comes with a community note.',reward:'+6 Scrap · +40 XP',relation:'Yasuo: resident whistleblower. Infinite Rizz: “never heard of this place”.'},
} as const;
export function argumentEffect(route:AirfryerRoute,move:AirfryerMove,pressure:number,credibility:number,used:AirfryerMove[]){
 let p=pressure,c=credibility,line='';
 if(move==='evidence'){p-=ROUTES[route].proof;c+=1;line=route==='bury'?'The deleted email survives in the sponsor’s inbox. Silence has a paper trail.':route==='blame'?'The full chat names the sponsor. Your roommate was not the only one approving the stream.':'The payout names the sponsor. Even the jury stops scrolling.';}
 if(move==='divert'){p-=2;c-=1;line='Infinite Rizz starts a feud with the microphone. Attention drops. So does your credibility.';}
 if(move==='apologize'){p-=3;c-=1;line='Daenerys admits the charity was an ad. The donors calm down. The confession stays on record.';}
 if(move==='counter'){if(used.includes('evidence')){p-=4;c+=2;line='The sponsor signed the receipt. Your counter-accusation now has evidence behind it.';}else{p+=3;c-=1;line='“Source?” asks the jury. You have not submitted one. The counter-accusation backfires.';}}
 return {pressure:Math.min(30,Math.max(0,p)),credibility:Math.min(12,Math.max(0,c)),line};
}
export function applyAirfryerCommand(s:Save,command:AirfryerCommand,now:Date,award:(id:string,packs:number)=>boolean){
 const a=s.airfryer;
 if(command.type==='airfryer-start'){if(a.phase!=='quiet')throw new Error('This case is already on file.');if(!s.city)throw new Error('Found your block first.');a.phase='leaked';a.startedAt=now.toISOString();return;}
 if(command.type==='airfryer-choose'){
  if(a.phase!=='leaked')throw new Error('Read the leak before choosing a response.');
  if(!s.city)throw new Error('Your block is missing.');
  if(command.route==='bury'&&s.city.influence<25)throw new Error('Buying silence costs 25 Influence.');
  const r=ROUTES[command.route];if(!r)throw new Error('Choose an available response.');
  if(command.route==='bury')s.city.influence-=25;
  if(command.route==='blame')s.career.clout+=40;
  if(command.route==='broadcast'){s.career.clout+=100;award('airfryer:broadcast',1);}
  a.route=command.route;a.phase='hearing';a.heat=r.heat;a.pressure=r.pressure;a.credibility=r.credibility;return;
 }
 if(a.phase!=='hearing'||!a.route||command.round!==a.history.length)throw new Error('This hearing has moved on. Use the current statement.');
 const used=a.history.map(h=>h.move);
 if(!moves.includes(command.move)||command.move!=='divert'&&used.includes(command.move))throw new Error('That statement has already been used.');
 const result=argumentEffect(a.route,command.move,a.pressure,a.credibility,used);
 a.history.push({move:command.move,...result});a.pressure=result.pressure;a.credibility=result.credibility;
 if(a.history.length===4){
  a.phase='resolved';a.outcome=verdictFor(a.pressure,a.credibility);a.heat=a.outcome==='cleared'?0:a.outcome==='notorious'?3:5;
  if(award('airfryer:verdict',a.outcome==='cleared'?1:0)){s.totalXp+=40;if(a.outcome==='cleared'&&s.city)s.city.influence+=50;else if(a.outcome==='notorious')s.career.clout+=100;else s.career.scrap+=6;}
 }
}
export function refineAirfryer(s:Save,ctx:z.RefinementCtx){
 const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 if((s.airfryer.phase==='resolved')!==s.awardedRewardIds.includes('airfryer:verdict'))bad('Case verdict and reward receipt disagree');
 if((s.airfryer.route==='broadcast')!==s.awardedRewardIds.includes('airfryer:broadcast'))bad('Broadcast choice and reward receipt disagree');
 if(s.airfryer.phase!=='quiet'&&!s.city)bad('A city case requires a founded block');
}
