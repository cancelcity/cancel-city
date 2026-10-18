import {SpecialTheme} from '../data/specials';
let context:AudioContext|null=null;
// Original synth cues. Return a cancellation handle for skip, hide and unmount.
export function specialCue(phase:'entrance'|'launch'|'impact',theme:SpecialTheme,volume:number):()=>void{
 if(typeof window==='undefined'||document.hidden||volume<=0)return()=>{};
 try{
  context??=new AudioContext();void context.resume().catch(()=>{});
  const ctx=context,now=ctx.currentTime,nodes:AudioNode[]=[],oscillators:OscillatorNode[]=[];
  const root={screen:150,office:185,street:115,podium:95,exchange:125,occult:80}[theme],duration=phase==='entrance'?.45:phase==='launch'?.35:.55;
  for(let i=0;i<(phase==='impact'?3:2);i++){
   const gain=ctx.createGain(),osc=ctx.createOscillator();nodes.push(gain,osc);oscillators.push(osc);
   osc.type=theme==='office'?'triangle':theme==='exchange'?'square':'sawtooth';
   const start=phase==='entrance'?root*(i+1):phase==='launch'?root*3/(i+1):root*1.4*(i+1);
   osc.frequency.setValueAtTime(start,now);osc.frequency.exponentialRampToValueAtTime(phase==='impact'?Math.max(35,root*.4):phase==='launch'?root*.55:root*3,now+duration);
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,Math.min(1,volume)*.055/(i+1)),now+.035);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02);osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  return()=>{for(const osc of oscillators)try{osc.stop();}catch{}for(const node of nodes)try{node.disconnect();}catch{}};
 }catch{return()=>{};}
}
