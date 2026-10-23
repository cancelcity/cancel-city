'use client';

import {useCallback,useEffect,useRef,useState} from 'react';

export type CornerAudioCue='paper'|'arrival'|'resolve'|'door';
type Cue={sources:AudioScheduledSourceNode[];nodes:AudioNode[];remaining:number};
type CornerAudio={
 context:AudioContext;
 master:GainNode;
 noise:AudioBuffer;
 sources:AudioScheduledSourceNode[];
 nodes:AudioNode[];
 cues:Set<Cue>;
 queue:Promise<void>;
 gestureResume:Promise<void>|null;
 disposed:boolean;
};
type AudioWindow=Window&{webkitAudioContext?:typeof AudioContext};

// Deliberately quiet: the illustrated scene and dialogue remain the focus.
const OUTPUT_GAIN=.20;

function disconnect(node:AudioNode){try{node.disconnect();}catch{/* Already disconnected. */}}
function stop(source:AudioScheduledSourceNode){try{source.stop();}catch{/* Already ended. */}}
function clearCue(audio:CornerAudio,cue:Cue){
 if(!audio.cues.delete(cue))return;
 cue.sources.forEach(source=>{source.onended=null;stop(source);});
 cue.nodes.forEach(disconnect);
}
function mute(audio:CornerAudio){
 if(audio.disposed)return;
 audio.master.gain.cancelScheduledValues(audio.context.currentTime);
 audio.master.gain.setValueAtTime(0,audio.context.currentTime);
 [...audio.cues].forEach(cue=>clearCue(audio,cue));
}
function dispose(audio:CornerAudio){
 if(audio.disposed)return;
 mute(audio);audio.disposed=true;
 audio.sources.forEach(stop);audio.nodes.forEach(disconnect);
 if(audio.context.state!=='closed')void audio.context.close().catch(()=>{});
}

function createAudio():CornerAudio{
 const Constructor=window.AudioContext||(window as AudioWindow).webkitAudioContext;
 if(!Constructor)throw new Error('Street sound is unavailable in this browser. You can still play with sound off.');
 const context=new Constructor({latencyHint:'interactive'});
 try{
  const master=context.createGain(),limiter=context.createDynamicsCompressor();
  master.gain.value=0;
  limiter.threshold.value=-18;limiter.knee.value=12;limiter.ratio.value=6;limiter.attack.value=.015;limiter.release.value=.25;
  master.connect(limiter);limiter.connect(context.destination);
  const noise=context.createBuffer(1,Math.ceil(context.sampleRate*3),context.sampleRate),data=noise.getChannelData(0);
  for(let index=0;index<data.length;index++)data[index]=(Math.random()*2-1)*.7;
  const audio:CornerAudio={context,master,noise,sources:[],nodes:[master,limiter],cues:new Set(),queue:Promise.resolve(),gestureResume:null,disposed:false};
  const loop=context.createBufferSource(),highpass=context.createBiquadFilter(),lowpass=context.createBiquadFilter(),hiss=context.createGain();
  loop.buffer=noise;loop.loop=true;highpass.type='highpass';highpass.frequency.value=170;lowpass.type='lowpass';lowpass.frequency.value=650;hiss.gain.value=.055;
  loop.connect(highpass);highpass.connect(lowpass);lowpass.connect(hiss);hiss.connect(master);loop.start();
  audio.sources.push(loop);audio.nodes.push(loop,highpass,lowpass,hiss);
  // A faint mains hum, with no sharp neon-click loop or repeating melody.
  for(const [frequency,volume] of [[60,.017],[120,.006]]){
   const source=context.createOscillator(),gain=context.createGain();
   source.type='sine';source.frequency.value=frequency;gain.gain.value=volume;
   source.connect(gain);gain.connect(master);source.start();audio.sources.push(source);audio.nodes.push(source,gain);
  }
  // Low, slowly breathing bass leaking through the studio wall.
  const bass=context.createOscillator(),bassGain=context.createGain(),breath=context.createOscillator(),breathGain=context.createGain();
  bass.type='sine';bass.frequency.value=46; bassGain.gain.value=.023;breath.frequency.value=.11;breathGain.gain.value=.009;
  bass.connect(bassGain);bassGain.connect(master);breath.connect(breathGain);breathGain.connect(bassGain.gain);bass.start();breath.start();
  audio.sources.push(bass,breath);audio.nodes.push(bass,bassGain,breath,breathGain);
  return audio;
 }catch(error){void context.close().catch(()=>{});throw error;}
}

function cueSound(audio:CornerAudio,kind:CornerAudioCue){
 const {context}=audio,now=context.currentTime;
 // Clicking repeatedly should never build up a wall of overlapping effects.
 if(audio.cues.size>=3)clearCue(audio,audio.cues.values().next().value!);
 const cue:Cue={sources:[],nodes:[],remaining:0};audio.cues.add(cue);
 const finish=()=>{cue.remaining--;if(cue.remaining<=0)clearCue(audio,cue);};
 const envelope=(start:number,duration:number,volume:number)=>{
  const gain=context.createGain();gain.gain.value=0;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(Math.min(.32,volume),start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);gain.connect(audio.master);cue.nodes.push(gain);return gain;
 };
 const tone=(start:number,duration:number,from:number,to:number,volume:number,type:OscillatorType='sine')=>{
  const source=context.createOscillator();source.type=type;source.frequency.setValueAtTime(from,start);source.frequency.exponentialRampToValueAtTime(Math.max(1,to),start+duration);
  source.connect(envelope(start,duration,volume));source.onended=finish;cue.sources.push(source);cue.nodes.push(source);cue.remaining++;source.start(start);source.stop(start+duration+.02);
 };
 const rustle=(start:number,duration:number,from:number,to:number,volume:number)=>{
  const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=audio.noise;filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(to,start+duration);
  source.connect(filter);filter.connect(envelope(start,duration,volume));source.onended=finish;cue.sources.push(source);cue.nodes.push(source,filter);cue.remaining++;source.start(start);source.stop(start+duration+.02);
 };
 if(kind==='paper'){
  rustle(now,.16,2300,650,.20);rustle(now+.08,.14,1700,900,.11);
 }else if(kind==='arrival'){
  // A distant car glides up, rather than a horn or siren.
  rustle(now,.8,180,520,.20);tone(now,.72,83,48,.09);tone(now+.6,.14,65,40,.055);
 }else if(kind==='door'){
  rustle(now,.18,600,240,.12);tone(now+.06,.18,140,58,.11);tone(now+.16,.32,720,660,.012);
 }else{
  // A restrained two-note payoff under the final reaction.
  tone(now,.32,294,294,.065);tone(now+.14,.44,440,440,.055);rustle(now,.10,1400,700,.06);
 }
}

/** Opt-in street ambience. Call toggle directly from the sound button's click. */
export function useCornerAudio(paused=false):{enabled:boolean;toggle:()=>Promise<void>;playCue:(kind:CornerAudioCue)=>void;error:string|null}{
 const [enabled,setEnabled]=useState(false),[error,setError]=useState<string|null>(null);
 const audioRef=useRef<CornerAudio|null>(null),enabledRef=useRef(false),pausedRef=useRef(paused),mountedRef=useRef(false);
 pausedRef.current=paused;
 const canPlay=useCallback(()=>enabledRef.current&&!pausedRef.current&&typeof document!=='undefined'&&!document.hidden,[]);
 const reconcile=useCallback((audio:CornerAudio)=>{
  // Serialize suspension/resumption: rapid clicks cannot leave an old resume
  // playing after a newer mute, pause or hidden-page transition.
  audio.queue=audio.queue.catch(()=>{}).then(async()=>{
   if(audio.disposed)return;
   const gesture=audio.gestureResume;audio.gestureResume=null;
   if(gesture)await gesture;
   if(audio.disposed)return;
   if(canPlay()){
    await audio.context.resume();
    if(audio.disposed)return;
    if(canPlay()){
     audio.master.gain.cancelScheduledValues(audio.context.currentTime);
     audio.master.gain.setTargetAtTime(Math.min(.22,OUTPUT_GAIN),audio.context.currentTime,.12);
     return;
    }
   }
   mute(audio);
   if(audio.context.state==='running')await audio.context.suspend();
  }).catch(()=>{
   if(audio.disposed)return;
   dispose(audio);
   if(audioRef.current===audio){
    audioRef.current=null;enabledRef.current=false;
    if(mountedRef.current){setEnabled(false);setError('Street sound could not start. Tap Sound to try again.');}
   }
  });
  return audio.queue;
 },[canPlay]);
 const toggle=useCallback(async()=>{
  if(!mountedRef.current)return;
  const next=!enabledRef.current;enabledRef.current=next;setEnabled(next);setError(null);
  let audio=audioRef.current;
  if(!next){if(audio){mute(audio);await reconcile(audio);}return;}
  try{
   if(!audio||audio.disposed){audio=createAudio();audioRef.current=audio;}
   // This resume starts in the actual button gesture, before any await.
   if(canPlay()){
    audio.gestureResume=audio.context.resume();
    // Mark the promise handled immediately, even if a prior transition is queued.
    void audio.gestureResume.catch(()=>{});
   }
   await reconcile(audio);
  }catch(cause){
   if(audio)dispose(audio);
   audioRef.current=null;enabledRef.current=false;
   if(mountedRef.current){setEnabled(false);setError(cause instanceof Error?cause.message:'Street sound is unavailable. You can keep playing with sound off.');}
  }
 },[canPlay,reconcile]);
 const playCue=useCallback((kind:CornerAudioCue)=>{
  const audio=audioRef.current;
  if(!audio||audio.disposed||!canPlay()||audio.context.state!=='running')return;
  try{cueSound(audio,kind);}catch{/* A missed cue must never interrupt an encounter. */}
 },[canPlay]);
 useEffect(()=>{
  mountedRef.current=true;
  const visibility=()=>{const audio=audioRef.current;if(!audio)return;if(!canPlay())mute(audio);void reconcile(audio);};
  document.addEventListener('visibilitychange',visibility);
  return()=>{
   mountedRef.current=false;enabledRef.current=false;document.removeEventListener('visibilitychange',visibility);
   if(audioRef.current)dispose(audioRef.current);audioRef.current=null;
  };
 },[canPlay,reconcile]);
 useEffect(()=>{const audio=audioRef.current;if(!audio)return;if(paused)mute(audio);void reconcile(audio);},[paused,reconcile]);
 return {enabled,toggle,playCue,error};
}
