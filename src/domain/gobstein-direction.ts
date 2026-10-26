import type {SpecialPlayback} from './cinematic';

/** Normalized cuts share the existing Full/Quick authoritative impact boundary. */
export const GOBSTEIN_TIMING={tamper:.23,cut:.46,impact:.6875,reconnect:.73,report:.86} as const;
export const GOBSTEIN_CARD_ID='CC056';
export type GobsteinPhase='setup'|'tamper'|'blackout'|'aftermath'|'report';
type GobsteinPlayback=Pick<SpecialPlayback,'cardId'|'duoId'|'damage'|'knockout'|'preview'>;

export interface GobsteinFrame {
 progress:number;
 phase:GobsteinPhase;
 blackout:boolean;
 impact:boolean;
 showResult:boolean;
 showActors:boolean;
 showProps:boolean;
 opponentInjured:boolean;
 opponentKnockedOut:boolean;
}

const progressOf=(progress:number)=>Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
export const isGobsteinSolo=(playback:Pick<SpecialPlayback,'cardId'|'duoId'>)=>playback.cardId===GOBSTEIN_CARD_ID&&!playback.duoId;

/** Preview stages the action; real battles use only their committed hit/KO facts. */
export function gobsteinFrame(playback:GobsteinPlayback,progress:number,reduced=false):GobsteinFrame|null {
 if(!isGobsteinSolo(playback))return null;
 const p=reduced?1:progressOf(progress);
 const blackout=!reduced&&p>=GOBSTEIN_TIMING.cut&&p<GOBSTEIN_TIMING.reconnect;
 const impact=reduced||p>=GOBSTEIN_TIMING.impact;
 const visible=!blackout;
 const injured=playback.preview||playback.damage>0||playback.knockout;
 const phase:GobsteinPhase=p<GOBSTEIN_TIMING.tamper?'setup':p<GOBSTEIN_TIMING.cut?'tamper':p<GOBSTEIN_TIMING.reconnect?'blackout':p<GOBSTEIN_TIMING.report?'aftermath':'report';
 return {progress:p,phase,blackout,impact,showResult:impact&&visible,showActors:visible,showProps:visible,opponentInjured:visible&&impact&&injured,opponentKnockedOut:visible&&impact&&!playback.preview&&playback.knockout};
}

export type GobsteinCueName='camera-disconnect'|'dry-hit-1'|'dry-hit-2'|'wall-slam'|'camera-reconnect'|'pen-tick';
export interface GobsteinCue {readonly key:string;readonly at:number;readonly cue:GobsteinCueName}
const CUES:readonly GobsteinCue[]=[
 {key:'gobstein:camera-disconnect',at:GOBSTEIN_TIMING.cut,cue:'camera-disconnect'},
 {key:'gobstein:dry-hit-1',at:.535,cue:'dry-hit-1'},
 {key:'gobstein:dry-hit-2',at:.61,cue:'dry-hit-2'},
 {key:'gobstein:wall-slam',at:GOBSTEIN_TIMING.impact,cue:'wall-slam'},
 {key:'gobstein:camera-reconnect',at:GOBSTEIN_TIMING.reconnect,cue:'camera-reconnect'},
 {key:'gobstein:pen-tick',at:.9,cue:'pen-tick'},
];
const isHitCue=(cue:GobsteinCueName)=>cue==='dry-hit-1'||cue==='dry-hit-2'||cue==='wall-slam';

/** Each call returns only newly crossed cues. Paused/reversed/reduced frames stay silent. */
export function gobsteinCueCrossings(playback:GobsteinPlayback,previousProgress:number,progress:number,reduced=false):GobsteinCue[] {
 if(reduced||!isGobsteinSolo(playback))return [];
 const previous=progressOf(previousProgress),p=progressOf(progress);
 if(p<=previous)return [];
 const hit=playback.preview||playback.damage>0||playback.knockout;
 return CUES.filter(cue=>cue.at>previous&&cue.at<=p&&(hit||!isHitCue(cue.cue))).map(cue=>({...cue}));
}
