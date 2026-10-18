import type {FirstRosterId} from '../data/first-roster-batch';
export interface RosterAudioCue {key:string;at:number;frequencies:readonly number[];waveform:OscillatorType;duration:number}
type Row=readonly [number,readonly number[],OscillatorType,number];
// Original synthesized sound motifs; no celebrity voices or copied recordings.
const rows:Record<FirstRosterId,readonly Row[]>={
 CC001:[[.12,[220,330,440],'triangle',.1],[.49,[880,440,220],'sawtooth',.07],[.63,[330,660],'triangle',.08],[.89,[220,165],'square',.12]],
 CC002:[[.24,[920],'triangle',.05],[.38,[1040],'triangle',.05],[.6875,[260,130],'square',.1],[.78,[130],'square',.1]],
 CC006:[[.1,[220,277,330],'sawtooth',.12],[.34,[330,440],'triangle',.12],[.6875,[440,554,660],'sine',.17]],
 CC007:[[.33,[800,600],'triangle',.08],[.5,[1040,920,800],'triangle',.06],[.6875,[392,494,587],'sine',.14],[.9,[110],'triangle',.09]],
 CC012:[[.15,[147,110],'triangle',.15],[.58,[85],'square',.08],[.9,[523],'sine',.12]],
 CC013:[[.32,[900,950,900],'square',.055],[.57,[700,650],'square',.055],[.6875,[180,90],'triangle',.08]],
 CC014:[[.2,[146],'sine',.18],[.48,[294,330,392],'triangle',.09],[.6875,[98,73],'triangle',.14],[.9,[196],'triangle',.08]],
 CC016:[[.15,[165,220,330],'sawtooth',.12],[.48,[1174],'sine',.06],[.6,[1174],'sine',.06],[.6875,[440,554,659],'sine',.17]],
 CC018:[[.15,[110,165,220],'triangle',.16],[.4,[330,494,660],'sine',.13],[.6875,[130,98],'sawtooth',.11]],
 CC023:[[.16,[392,494,587],'sine',.11],[.52,[880,740,660],'triangle',.075],[.6875,[196,130],'sawtooth',.1]],
 CC058:[[.1,[220,330,440],'triangle',.1],[.21,[880],'sine',.08],[.6875,[330,440,554],'sine',.14],[.945,[523,659,784],'sine',.08]],
 CC135:[[.1,[165,220,330],'sawtooth',.1],[.35,[1200],'sine',.07],[.48,[1200],'sine',.07],[.6875,[440,660,880],'triangle',.08]],
};
export function firstRosterCues(id:string,progress:number):RosterAudioCue[]{
 return (rows[id as FirstRosterId]??[]).flatMap(([at,frequencies,waveform,duration],i)=>progress>=at?[{key:`roster:${id}:${i}`,at,frequencies,waveform,duration}]:[]);
}
