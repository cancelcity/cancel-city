import type {WeaponFamily} from '../data/live-direction';
let context:AudioContext|null=null;
export function liveCue(phase:'windup'|'launch'|'impact'|'gag',family:WeaponFamily,volume:number){
 if(typeof window==='undefined'||document.hidden||volume<=0)return()=>{};
 try{
  context??=new AudioContext();const c=context;void c.resume().catch(()=>{});const now=c.currentTime,nodes:AudioNode[]=[],sources:(OscillatorNode|AudioBufferSourceNode)[]=[];
  const add=(from:number,to:number,duration:number,gain:number,delay=0,type:OscillatorType='triangle')=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,now+delay);o.frequency.exponentialRampToValueAtTime(Math.max(25,to),now+delay+duration);g.gain.setValueAtTime(.0001,now+delay);g.gain.exponentialRampToValueAtTime(Math.max(.0001,gain*volume),now+delay+.01);g.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);o.connect(g);g.connect(c.destination);o.start(now+delay);o.stop(now+delay+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};nodes.push(o,g);sources.push(o);};
  const noise=(duration:number,gain:number)=>{const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);let seed=26;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*Math.exp(-i/data.length*4);}const s=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();s.buffer=buffer;filter.type='lowpass';filter.frequency.value=family==='paper'?1700:family==='rocket'?650:2800;g.gain.value=gain*volume;s.connect(filter);filter.connect(g);g.connect(c.destination);s.start(now);s.onended=()=>{s.disconnect();filter.disconnect();g.disconnect();};nodes.push(s,filter,g);sources.push(s);};
  if(phase==='windup'){if(family==='paper')for(let i=0;i<5;i++)add(1100+i*120,620,.05,.025,i*.06,'square');else add(family==='rocket'?60:150,420,.34,.035,0,'sawtooth');}
  else if(phase==='launch'){noise(.38,.11);add(family==='rocket'?90:520,family==='rocket'?510:95,.35,.035,0,'sawtooth');}
  else if(phase==='impact'){add(155,38,.19,.15);noise(.22,.12);if(family==='controller')add(550,140,.12,.025,.035,'square');if(family==='stamp')add(950,420,.06,.05);if(family==='shield')add(440,880,.3,.04,0,'sine');}
  else add(family==='rocket'?180:1200,family==='rocket'?55:460,.15,.035,0,'sine');
  return()=>{for(const s of sources)try{s.stop();}catch{}for(const n of nodes)try{n.disconnect();}catch{}};
 }catch{return()=>{};}
}

export function memeCue(cue:'disconnect'|'ticket'|'cash',volume:number){
 if(typeof window==='undefined'||document.hidden||volume<=0)return()=>{};
 try{context??=new AudioContext();const c=context;void c.resume().catch(()=>{});const now=c.currentTime,sources:OscillatorNode[]=[],gains:GainNode[]=[];const tones=cue==='disconnect'?[740,494,247]:cue==='ticket'?[910,1170]:[1318,1760,2093];tones.forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain(),start=now+i*.068;o.type=cue==='cash'?'sine':'triangle';o.frequency.setValueAtTime(hz,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.055),start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+.11);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+.12);o.onended=()=>{o.disconnect();g.disconnect();};sources.push(o);gains.push(g);});return()=>{for(const o of sources)try{o.stop();}catch{}for(const g of gains)try{g.disconnect();}catch{}};}catch{return()=>{};}
}

export function signatureCue(notes:readonly {frequency:number;delay:number;duration:number;waveform:OscillatorType}[],volume:number){
 if(typeof window==='undefined'||document.hidden||volume<=0)return()=>{};
 try{context??=new AudioContext();const c=context;void c.resume().catch(()=>{});const now=c.currentTime,sources:OscillatorNode[]=[],gains:GainNode[]=[];for(const note of notes){const o=c.createOscillator(),g=c.createGain(),start=now+note.delay;o.type=note.waveform;o.frequency.setValueAtTime(note.frequency,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0001,Math.min(1,volume)*.025),start+.01);g.gain.exponentialRampToValueAtTime(.0001,start+note.duration);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+note.duration+.01);o.onended=()=>{o.disconnect();g.disconnect();};sources.push(o);gains.push(g);}return()=>{for(const o of sources)try{o.stop();}catch{}for(const g of gains)try{g.disconnect();}catch{}};}catch{return()=>{};}
}
