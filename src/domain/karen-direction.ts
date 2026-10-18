import type {CinematicMode,SceneTiming,SpecialPlayback} from './cinematic';

export const KAREN_TIMING:SceneTiming={full:11000,impact:7600,short:2400,shortImpact:1520,reduced:650,reducedImpact:0,normal:1180};
export const KAREN_SHOTS=[
 {id:'charge',start:0,end:1450,title:'An incorrect charge'},
 {id:'twitch',start:1450,end:3100,title:'The eye twitch'},
 {id:'unroll',start:3100,end:4600,title:'She kept the receipts'},
 {id:'escape',start:4600,end:5950,title:'An attempted escape'},
 {id:'fold',start:5950,end:7400,title:'The arena becomes a form'},
 {id:'denied',start:7400,end:8650,title:'Refund denied'},
 {id:'shutter',start:8650,end:11000,title:'Customer service is closed'},
] as const;
export type KarenShot=typeof KAREN_SHOTS[number]['id'];
export const KAREN_CUES=[
 {id:'room',at:0,file:'room'}, {id:'tick',at:1900,file:'tick'},
 {id:'printer',at:3140,file:'printer'}, {id:'paper',at:3780,file:'paper'},
 {id:'step',at:4640,file:'step'}, {id:'catch',at:5350,file:'paper'},
 {id:'snap',at:6170,file:'snap'}, {id:'fold',at:6740,file:'fold'},
 {id:'stamp',at:7600,file:'stamp'}, {id:'shutter',at:9290,file:'shutter'},
] as const;
export const isKarenBenchmark=(playback:Pick<SpecialPlayback,'cardId'|'duoId'>)=>playback.cardId==='CC026'&&!playback.duoId;
export const saturate=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export const smooth=(n:number)=>{const p=saturate(n);return p*p*(3-2*p);};
export const mix=(a:number,b:number,t:number)=>a+(b-a)*saturate(t);
// The replay is a separate edit: no rapid time-compression of the eye close-up.
export function karenTime(progress:number,mode:CinematicMode,reduced=false){
 if(reduced)return 11000;
 const p=saturate(progress);if(mode!=='quick')return p*11000;
 const ms=p*2400;
 const edit=[[0,3100],[400,4600],[900,5950],[1520,7600],[1850,8650],[2400,11000]];
 for(let i=1;i<edit.length;i++)if(ms<=edit[i][0])return mix(edit[i-1][1],edit[i][1],(ms-edit[i-1][0])/(edit[i][0]-edit[i-1][0]));
 return 11000;
}
export function karenShotAt(time:number){return KAREN_SHOTS.find(s=>time<s.end)??KAREN_SHOTS[KAREN_SHOTS.length-1];}
export function karenState(progress:number,mode:CinematicMode='full',reduced=false){
 const time=karenTime(progress,mode,reduced),shot=karenShotAt(time);
 return {time,shot:shot.id,u:saturate((time-shot.start)/(shot.end-shot.start)),reduced,impact:time>=7600,blink:time>=1950&&time<2080,unroll:smooth((time-3100)/1300),catch:smooth((time-5200)/500),fold:smooth((time-5950)/1350),stamp:smooth((time-7410)/190),shutter:smooth((time-9290)/1450)};
}
export function karenCuesBetween(previous:number,current:number,mode:CinematicMode){
 // Quick cut deliberately excludes ambience, close-up and long printer setup.
 const cues=mode==='quick'?KAREN_CUES.filter(c=>c.at>=4600):KAREN_CUES;
 return cues.filter(c=>c.at>=previous&&c.at<current);
}
