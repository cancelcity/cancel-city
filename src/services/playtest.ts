export const PLAYTEST_KEY='cancel-city.playtest.v1';
export const PLAYTEST_CHANGE_EVENT='cancel-city.playtest-change';
const EVENT_NAMES=['route','hidden','visible','clash_play','clash_reply','clash_result','clash_pack','clash_explore','pack_opened','pack_revealed','pack_collected','battle_started','battle_finished','roast_started','roast_finished','squad_saved','save_unavailable','save_ready','test_started','test_finished'] as const;
export type PlaytestEventName=typeof EVENT_NAMES[number];
export type PlaytestFeedback={fun:string;confusing:string;again:'yes'|'maybe'|'no'|''};
export type PlaytestReport={version:1;id:string;startedAt:string;endedAt:string|null;cohort:'new'|'returning';viewport:{width:number;height:number};events:Array<{name:PlaytestEventName;elapsedMs:number;detail?:string}>;feedback?:PlaytestFeedback};
const ROUTES=['/','/packs/','/collection/','/stash/','/battle/','/roast/','/city/','/missions/','/market/','/profile/','/settings/','/leaderboard/','/lore/','/cinema/specials/','/privacy/','/playtest/'];
const DETAILS:Partial<Record<PlaytestEventName,readonly string[]>>={clash_reply:['jab','bait','deadpan'],clash_result:['jab','bait','deadpan'],battle_started:['campaign','daily','practice'],battle_finished:['win','loss'],roast_started:['steady','timed'],roast_finished:['win','loss'],save_unavailable:['offline','auth','loading','storage'],save_ready:['local','cloud']};
const MAX_EVENTS=250;
let stoppedId=''; // A failed stop write must not restart capture in this page.
const isRecord=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const eventName=(value:unknown):value is PlaytestEventName=>typeof value==='string'&&(EVENT_NAMES as readonly string[]).includes(value);
const iso=(value:unknown):value is string=>{if(typeof value!=='string'||value.length!==24)return false;const time=Date.parse(value);return Number.isFinite(time)&&new Date(time).toISOString()===value;};
const dimension=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?Math.min(10000,Math.max(0,Math.trunc(value))):0;
function safeDetail(name:PlaytestEventName,value:unknown){
 if(typeof value!=='string')return undefined;
 if(name==='route'){const path=value.trim().split(/[?#]/,1)[0],canonical=path==='/'?'/':`${path.replace(/\/+$/,'')}/`;return ROUTES.includes(canonical)?canonical:undefined;}
 const detail=value.trim().toLowerCase();return DETAILS[name]?.includes(detail)?detail:undefined;
}
const feedbackText=(value:unknown)=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').trim().slice(0,500).trim():'';
function feedbackFor(value:unknown):PlaytestFeedback|undefined{if(!isRecord(value))return undefined;return {fun:feedbackText(value.fun),confusing:feedbackText(value.confusing),again:typeof value.again==='string'&&['yes','maybe','no',''].includes(value.again)?value.again as PlaytestFeedback['again']:''};}
function storage(){try{return typeof window==='undefined'?null:window.sessionStorage;}catch{return null;}}
function notify(){try{window.dispatchEvent(new CustomEvent(PLAYTEST_CHANGE_EVENT));}catch{/* Recording never depends on a UI listener. */}}
function write(report:PlaytestReport){try{const target=storage();if(!target)return null;target.setItem(PLAYTEST_KEY,JSON.stringify(report));notify();return report;}catch{return null;}}

/** Read-only, and deliberately no automatic opt-in or localStorage fallback. */
export function readPlaytest():PlaytestReport|null{
 try{
  const raw=storage()?.getItem(PLAYTEST_KEY);if(!raw||raw.length>60000)return null;
  const data:unknown=JSON.parse(raw);
  if(!isRecord(data)||data.version!==1||typeof data.id!=='string'||!/^pt-[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(data.id)||!iso(data.startedAt)||data.endedAt!==null&&!iso(data.endedAt)||(data.cohort!=='new'&&data.cohort!=='returning')||!isRecord(data.viewport)||!Array.isArray(data.events)||data.events.length>MAX_EVENTS)return null;
  if(data.id===stoppedId&&data.endedAt===null)return null;
  const start=Date.parse(data.startedAt);if(data.endedAt!==null&&Date.parse(data.endedAt as string)<start)return null;
  const events:PlaytestReport['events']=[];let previous=0;
  for(const event of data.events){
   if(!isRecord(event)||!eventName(event.name)||typeof event.elapsedMs!=='number'||!Number.isSafeInteger(event.elapsedMs)||event.elapsedMs<previous||event.elapsedMs>8640000000000000-start)return null;
   const detail=safeDetail(event.name,event.detail);events.push({name:event.name,elapsedMs:event.elapsedMs,...(detail?{detail}:{})});previous=event.elapsedMs;
  }
  if(data.endedAt!==null&&Date.parse(data.endedAt as string)<start+previous)return null;
  const feedback=feedbackFor(data.feedback);
  return {version:1,id:data.id,startedAt:data.startedAt,endedAt:data.endedAt as string|null,cohort:data.cohort,viewport:{width:dimension(data.viewport.width),height:dimension(data.viewport.height)},events,...(feedback?{feedback}:{})};
 }catch{return null;}
}
function append(report:PlaytestReport,name:PlaytestEventName,detail?:string){
 const elapsedMs=Math.max(0,report.events.at(-1)?.elapsedMs||0,Date.now()-Date.parse(report.startedAt)),safe=safeDetail(name,detail);
 report.events=[...report.events,{name,elapsedMs,...(safe?{detail:safe}:{})}];return report;
}
export function startPlaytest(cohort:PlaytestReport['cohort']):PlaytestReport|null{
 if(typeof window==='undefined'||(cohort!=='new'&&cohort!=='returning'))return null;
 try{
  const id=`pt-${crypto.randomUUID()}`;
  const report=write({version:1,id,startedAt:new Date(Date.now()).toISOString(),endedAt:null,cohort,viewport:{width:dimension(window.innerWidth),height:dimension(window.innerHeight)},events:[{name:'test_started',elapsedMs:0}]});
  if(report)stoppedId='';return report;
 }catch{return null;}
}
export function markPlaytest(name:PlaytestEventName,detail?:string):PlaytestReport|null{
 if(!eventName(name))return null;
 const report=readPlaytest();if(!report||report.endedAt)return null;
 if(report.events.length>=MAX_EVENTS-1)return report; // Keep arrival decisions; reserve one slot for stopping.
 return write(append(report,name,detail));
}
export function finishPlaytest(feedback?:Partial<PlaytestFeedback>):PlaytestReport|null{
 const report=readPlaytest();if(!report)return null;
 if(report.endedAt){if(feedback===undefined)return report;const clean=feedbackFor({...report.feedback,...feedback});if(clean)report.feedback=clean;return write(report);}
 if(report.events.length>=MAX_EVENTS)report.events=report.events.slice(0,MAX_EVENTS-1);
 append(report,'test_finished');report.endedAt=new Date(Date.parse(report.startedAt)+(report.events.at(-1)?.elapsedMs||0)).toISOString();
 const clean=feedbackFor(feedback);if(clean)report.feedback=clean;
 stoppedId=report.id;const saved=write(report);
 if(!saved){try{storage()?.removeItem(PLAYTEST_KEY);}catch{}notify();}
 return saved;
}
export function clearPlaytest(){const report=readPlaytest();if(report)stoppedId=report.id;try{const target=storage();if(!target)return false;target.removeItem(PLAYTEST_KEY);notify();return true;}catch{notify();return false;}}
