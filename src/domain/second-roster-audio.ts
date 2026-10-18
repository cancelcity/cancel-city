import type {SecondRosterId} from '../data/second-roster-batch';
import type {RosterAudioCue} from './first-roster-audio';
type Row=readonly [number,readonly number[],OscillatorType,number];
// Original synthesized effects, individually timed to each physical gag.
const rows:Record<SecondRosterId,readonly Row[]>={
 CC003:[[.22,[740,880],'triangle',.07],[.48,[1100],'sine',.09],[.6875,[220,147],'square',.11],[.91,[196,147],'triangle',.09]],
 CC004:[[.21,[880,960,1040],'square',.045],[.48,[220,440],'sawtooth',.09],[.6875,[110,73],'triangle',.12]],
 CC005:[[.27,[110,165],'sawtooth',.17],[.46,[660,740,880],'sine',.08],[.6875,[196,130],'triangle',.11],[.9,[880],'square',.055]],
 CC008:[[.25,[165,110],'triangle',.15],[.49,[850],'triangle',.07],[.6875,[392,494,587],'sine',.17]],
 CC009:[[.24,[550,494],'sine',.1],[.48,[330,294,220],'triangle',.09],[.6875,[440,660],'sine',.16],[.9,[147],'triangle',.07]],
 CC010:[[.15,[220,277,330],'triangle',.12],[.5,[660,440,220],'sawtooth',.07],[.6875,[98,73],'triangle',.12],[.9,[165,110],'square',.08]],
 CC011:[[.2,[950],'square',.035],[.4,[950],'square',.035],[.6875,[220,147],'triangle',.09],[.76,[1174,880],'sine',.08]],
 CC017:[[.13,[440,554,660],'triangle',.1],[.49,[1318],'sine',.05],[.6875,[147,98],'triangle',.12],[.9,[880,740],'sine',.07]],
 CC019:[[.18,[220,330,440],'sawtooth',.1],[.51,[920,880,740],'square',.05],[.6875,[130,98],'triangle',.11],[.94,[196,130],'sine',.09]],
 CC021:[[.17,[196,247,294],'triangle',.1],[.38,[740,880],'sine',.05],[.6875,[98,65],'sawtooth',.12],[.89,[130],'triangle',.1]],
};
export function secondRosterCues(id:string,progress:number):RosterAudioCue[]{return (rows[id as SecondRosterId]??[]).flatMap(([at,frequencies,waveform,duration],i)=>progress>=at?[{key:`second-roster:${id}:${i}`,at,frequencies,waveform,duration}]:[]);}
