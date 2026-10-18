import {KAREN_CUES} from '../domain/karen-direction';
let context:AudioContext|null=null;
const buffers=new Map<string,AudioBuffer>(),loads=new Map<string,Promise<void>>();
function audioContext(){context??=new AudioContext();return context;}
export async function prepareKarenAudio(){
 try{const ctx=audioContext();await Promise.all([...new Set(KAREN_CUES.map(c=>c.file))].map(file=>{
  if(loads.has(file))return loads.get(file)!;
  const pending=fetch(`/assets/karen/audio/${file}.wav`).then(r=>{if(!r.ok)throw new Error('Sound unavailable');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).then(b=>{buffers.set(file,b);}).catch(()=>{});loads.set(file,pending);return pending;
 }));}catch{}
}
export function unlockKarenAudio(){try{void audioContext().resume().catch(()=>{});void prepareKarenAudio();}catch{}}
export function playKarenCue(file:string,volume:number):()=>void{
 if(document.hidden||volume<=0)return()=>{};
 try{const ctx=audioContext(),buffer=buffers.get(file);if(!buffer||ctx.state!=='running')return()=>{};const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=Math.max(0,Math.min(.8,volume));source.connect(gain);gain.connect(ctx.destination);source.start();source.onended=()=>{source.disconnect();gain.disconnect();};return()=>{try{source.stop();}catch{}source.disconnect();gain.disconnect();};}catch{return()=>{};}
}
