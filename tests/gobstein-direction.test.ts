import {afterEach,describe,expect,it,vi} from 'vitest';
import {cinematicDuration,cinematicImpactAt,previewSpecial,type SpecialPlayback} from '../src/domain/cinematic';
import {GOBSTEIN_TIMING,gobsteinCueCrossings,gobsteinFrame,isGobsteinSolo} from '../src/domain/gobstein-direction';
import {playGobsteinCue} from '../src/services/gobstein-audio';

const playback=(changes:Partial<SpecialPlayback>={}):SpecialPlayback=>({...previewSpecial('CC056'),preview:false,damage:24,...changes});
afterEach(()=>vi.unstubAllGlobals());

describe('Technical Difficulties uses committed combat facts',()=>{
 it('keeps the real impact boundary while concealing the interrupted camera feed',()=>{
  for(const mode of ['full','quick'] as const){
   const duration=cinematicDuration(mode,false),impact=cinematicImpactAt(mode,false);
   expect(impact/duration).toBe(GOBSTEIN_TIMING.impact);
   expect(gobsteinFrame(playback(),(impact-1)/duration)).toMatchObject({blackout:true,impact:false,showResult:false,showActors:false,showProps:false,opponentInjured:false});
   expect(gobsteinFrame(playback(),impact/duration)).toMatchObject({blackout:true,impact:true,showResult:false,showActors:false,showProps:false,opponentInjured:false});
  }
  expect(gobsteinFrame(playback(),GOBSTEIN_TIMING.reconnect)).toMatchObject({phase:'aftermath',impact:true,showResult:true,showActors:true,showProps:true,opponentInjured:true});
 });
 it('keeps actors, props and premature results out of the entire blackout interval',()=>{
  const p=playback();
  expect(gobsteinFrame(p,GOBSTEIN_TIMING.cut-.0001)?.showActors).toBe(true);
  for(const time of [.46,.5,.61,.6875,.729999])expect(gobsteinFrame(p,time)).toMatchObject({phase:'blackout',blackout:true,showActors:false,showProps:false,showResult:false});
  expect(gobsteinFrame(p,GOBSTEIN_TIMING.report)).toMatchObject({phase:'report',blackout:false,showResult:true});
 });
 it('does not show a cancelled or shielded attack as an injury or knockout',()=>{
  const blocked=playback({damage:0,knockout:false});
  for(const time of [0,.46,.6875,.73,.86,1])expect(gobsteinFrame(blocked,time)).toMatchObject({opponentInjured:false,opponentKnockedOut:false});
  expect(gobsteinFrame(playback({damage:17,knockout:false}),1)).toMatchObject({opponentInjured:true,opponentKnockedOut:false});
  expect(gobsteinFrame(playback({damage:0,knockout:true}),1)).toMatchObject({opponentInjured:true,opponentKnockedOut:true});
  expect(gobsteinFrame(previewSpecial('CC056'),1)).toMatchObject({opponentInjured:true,opponentKnockedOut:false});
 });
 it('selects the same stable reduced tableau regardless of elapsed progress',()=>{
  for(const p of [playback(),playback({damage:0}),playback({knockout:true})]){
   const final=gobsteinFrame(p,1,true);
   expect(final).toMatchObject({progress:1,phase:'report',blackout:false,showResult:true,showActors:true,showProps:true});
   for(const time of [-2,0,.46,.6875,.9,5,Number.NaN])expect(gobsteinFrame(p,time,true)).toEqual(final);
   expect(gobsteinCueCrossings(p,0,1,true)).toEqual([]);
  }
 });
 it('preserves other characters and Duo scenes and never changes playback participants or outcomes',()=>{
  expect(isGobsteinSolo(playback({propId:'some-prop'}))).toBe(true);
  for(const p of [playback({cardId:'CC026'}),playback({duoId:'some-duo'})]){
   expect(isGobsteinSolo(p)).toBe(false);expect(gobsteinFrame(p,1)).toBeNull();expect(gobsteinCueCrossings(p,0,1)).toEqual([]);
  }
  const p=Object.freeze(playback({targetId:'CC142',side:'enemy',damage:7,knockout:false})),before=JSON.stringify(p);
  gobsteinFrame(p,1);gobsteinCueCrossings(p,0,1);expect(JSON.stringify(p)).toBe(before);
 });
});

describe('CCTV audio follows presentation progress',()=>{
 it('crosses each physical cue once and aligns the slam with the committed contact',()=>{
  const p=playback(),all=gobsteinCueCrossings(p,0,1),segmented=[];
  let previous=0;
  for(const progress of [.1,.46,.57,.61,.6875,.73,.86,1]){segmented.push(...gobsteinCueCrossings(p,previous,progress));previous=progress;}
  expect(segmented).toEqual(all);
  expect(all.map(cue=>cue.cue)).toEqual(['camera-disconnect','dry-hit-1','dry-hit-2','wall-slam','camera-reconnect','pen-tick']);
  expect(new Set(all.map(cue=>cue.key)).size).toBe(all.length);
  expect(all.find(cue=>cue.cue==='wall-slam')?.at).toBe(GOBSTEIN_TIMING.impact);
  expect(gobsteinCueCrossings(p,.6875,.6875)).toEqual([]);expect(gobsteinCueCrossings(p,.9,.46)).toEqual([]);
 });
 it('keeps camera and paperwork sounds but suppresses all violent sounds for an actual zero-damage result',()=>{
  expect(gobsteinCueCrossings(playback({damage:0,knockout:false}),0,1).map(cue=>cue.cue)).toEqual(['camera-disconnect','camera-reconnect','pen-tick']);
  const preview=previewSpecial('CC056'),before=JSON.stringify(preview);
  expect(gobsteinCueCrossings(preview,0,1).map(cue=>cue.cue)).toEqual(['camera-disconnect','dry-hit-1','dry-hit-2','wall-slam','camera-reconnect','pen-tick']);
  expect(preview).toMatchObject({preview:true,damage:0,heal:0,knockout:false});expect(JSON.stringify(preview)).toBe(before);
 });
 it('returns silent cancellation handles without creating audio when unavailable, hidden or volume is invalid',()=>{
  const constructor=vi.fn();vi.stubGlobal('window',{AudioContext:constructor});vi.stubGlobal('document',{hidden:true});
  const hiddenStop=playGobsteinCue('wall-slam',.5);hiddenStop();hiddenStop();expect(constructor).not.toHaveBeenCalled();
  vi.stubGlobal('document',{hidden:false});
  for(const volume of [0,-1,Number.NaN,Number.POSITIVE_INFINITY])playGobsteinCue('wall-slam',volume)();
  expect(constructor).not.toHaveBeenCalled();
  vi.stubGlobal('window',undefined);expect(()=>playGobsteinCue('pen-tick',.5)()).not.toThrow();
 });
 it('cancels every scheduled impact voice and disconnects its graph with an idempotent stop',()=>{
  const voices:{stop:ReturnType<typeof vi.fn>}[]=[],nodes:{disconnect:ReturnType<typeof vi.fn>}[]=[];
  const parameter=()=>({value:0,setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()});
  const node=()=>{const value={connect:vi.fn(),disconnect:vi.fn()};nodes.push(value);return value;};
  const source=()=>{const value={...node(),start:vi.fn(),stop:vi.fn(),onended:null,frequency:parameter(),type:'triangle',buffer:null};voices.push(value);return value;};
  const fake={state:'running',currentTime:10,sampleRate:48000,destination:{},resume:vi.fn(async()=>{}),createOscillator:source,createBufferSource:source,createBiquadFilter:()=>({...node(),type:'lowpass',frequency:parameter(),Q:parameter()}),createGain:()=>({...node(),gain:parameter()}),createBuffer:(_channels:number,length:number)=>({getChannelData:()=>new Float32Array(length)})};
  vi.stubGlobal('window',{AudioContext:vi.fn(function(){return fake;})});vi.stubGlobal('document',{hidden:false});
  const stop=playGobsteinCue('wall-slam',.5);
  expect(voices).toHaveLength(3);
  for(const voice of voices)expect(voice.stop).toHaveBeenCalledTimes(1);
  stop();stop();
  for(const voice of voices)expect(voice.stop).toHaveBeenCalledTimes(2);
  for(const graphNode of nodes)expect(graphNode.disconnect).toHaveBeenCalledTimes(1);
 });
});
