import type {GobsteinCueName} from '../domain/gobstein-direction';

let context:AudioContext|null=null;
const noop=()=>{};

/** Original short mechanical transients. No recordings, music, loops or JS timers. */
export function playGobsteinCue(cue:GobsteinCueName,volume:number):()=>void {
 if(typeof window==='undefined'||typeof document==='undefined'||document.hidden||!Number.isFinite(volume)||volume<=0)return noop;
 const level=Math.min(1,volume);
 const nodes:AudioNode[]=[],sources:AudioScheduledSourceNode[]=[];
 let stopped=false;
 const stop=()=>{
  if(stopped)return;
  stopped=true;
  for(const source of sources)try{source.stop();}catch{}
  for(const node of nodes)try{node.disconnect();}catch{}
 };
 try {
  const Audio=window.AudioContext;
  if(!Audio)return noop;
  if(!context||context.state==='closed')context=new Audio();
  const c=context,now=c.currentTime;
  void c.resume().catch(()=>{});
  const connect=(source:AudioScheduledSourceNode,chain:AudioNode[])=>{
   sources.push(source);nodes.push(source,...chain);
   let from:AudioNode=source;
   for(const node of chain){from.connect(node);from=node;}
   from.connect(c.destination);
   source.onended=()=>{for(const node of [source,...chain])try{node.disconnect();}catch{}};
  };
  const envelope=(gain:GainNode,duration:number,peak:number)=>{
   gain.gain.setValueAtTime(.0001,now);
   gain.gain.exponentialRampToValueAtTime(Math.max(.0001,peak*level),now+.003);
   gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  };
  const burst=(duration:number,peak:number,type:BiquadFilterType,frequency:number,seed:number)=>{
   const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),samples=buffer.getChannelData(0);
   let random=seed;
   for(let i=0;i<samples.length;i++){random=(Math.imul(random,1664525)+1013904223)>>>0;samples[i]=(random/4294967296*2-1)*Math.exp(-i/samples.length*3);}
   const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
   source.buffer=buffer;filter.type=type;filter.frequency.value=frequency;filter.Q.value=.7;
   envelope(gain,duration,peak);connect(source,[filter,gain]);source.start(now);source.stop(now+duration+.01);
  };
  const knock=(from:number,to:number,duration:number,peak:number)=>{
   const source=c.createOscillator(),gain=c.createGain();source.type='triangle';
   source.frequency.setValueAtTime(from,now);source.frequency.exponentialRampToValueAtTime(to,now+duration);
   envelope(gain,duration,peak);connect(source,[gain]);source.start(now);source.stop(now+duration+.01);
  };
  switch(cue){
   case 'camera-disconnect':burst(.055,.045,'highpass',1700,56);knock(160,40,.045,.035);break;
   case 'dry-hit-1':burst(.075,.08,'lowpass',650,561);knock(125,42,.07,.09);break;
   case 'dry-hit-2':burst(.095,.095,'lowpass',850,562);knock(145,38,.09,.10);break;
   case 'wall-slam':burst(.20,.14,'lowpass',540,563);burst(.11,.055,'highpass',1100,564);knock(110,28,.19,.16);break;
   case 'camera-reconnect':burst(.055,.035,'bandpass',2600,565);burst(.025,.025,'highpass',3800,566);break;
   case 'pen-tick':burst(.035,.04,'highpass',2700,567);burst(.065,.025,'bandpass',1900,568);break;
  }
  return stop;
 }catch{stop();return noop;}
}
