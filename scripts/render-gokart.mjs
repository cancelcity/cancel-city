// Reproducible editorial assembly of generated shot drawings. No generated in-betweens.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
const runtime=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'));
const {createCanvas,loadImage}=runtime('@napi-rs/canvas'),sharp=runtime('sharp');
const film=JSON.parse(await readFile('src/data/gokart-film.json','utf8'));
const videoFile=`public${film.video}`,posterFile=`public${film.poster}`;
const out=path.dirname(videoFile),work='work/gokart';await mkdir(out,{recursive:true});await mkdir(work,{recursive:true});
const W=1280,H=720,FPS=30,surface=createCanvas(W,H),c=surface.getContext('2d'),images={};
for(const shot of film.shots)for(const file of shot.drawings)images[file]=await loadImage(file);
const clamp=v=>Math.min(1,Math.max(0,v));
function cover(im,scale=1,dx=0,dy=0){const k=Math.max(W/im.width,H/im.height)*scale,w=im.width*k,h=im.height*k;c.drawImage(im,(W-w)/2+dx,(H-h)/2+dy,w,h);}
function shotAt(t){return [...film.shots].reverse().find(s=>t>=s.start)??film.shots[0];}
function paint(t){
 const shot=shotAt(t),p=clamp((t-shot.start)/(shot.end-shot.start));
 const n=shot.drawings.length,index=Math.min(n-1,Math.floor(p*n));
 c.fillStyle='#0b0b0b';c.fillRect(0,0,W,H);c.save();
 // Modest continuous camera drift between discrete authored drawings.
 const zoom=shot.id==='ignition'?1+p*.025:shot.id==='rush'||shot.id==='ending'?1:1.015;
 const shake=shot.id==='impact'&&p>.35&&p<.8?(1-p)*5:0;
 cover(images[shot.drawings[index]],zoom,Math.sin(t*59)*shake,Math.cos(t*83)*shake);
 c.restore();
 // Restrained lens falloff maintains the painted lighting; no full-screen strobing.
 const vignette=c.createRadialGradient(W/2,H*.46,W*.22,W/2,H*.46,W*.75);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#0b0b0b22');c.fillStyle=vignette;c.fillRect(0,0,W,H);
 // Comedic ending gets a clean hold without text covering the acting.
 if(t>film.duration-.18){c.globalAlpha=clamp((t-(film.duration-.18))/.18);c.fillStyle='#0b0b0b';c.fillRect(0,0,W,H);c.globalAlpha=1;}
 return {shot,index};
}
// Original stereo Foley/synth bed. Deterministic, sample-free, with silence for the gag.
const RATE=48000,count=Math.ceil(RATE*film.duration),left=new Float64Array(count),right=new Float64Array(count);let seed=918273;
const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
const add=(i,value,pan=0)=>{left[i]+=value*Math.sqrt((1-pan)/2);right[i]+=value*Math.sqrt((1+pan)/2);};
function tone(at,dur,f0,f1,amp,pan=0){let phase=0;for(let j=0;j<dur*RATE;j++){const i=Math.floor(at*RATE)+j;if(i>=count)break;const u=j/(dur*RATE),env=Math.sin(Math.PI*u)**.7*Math.exp(-u*2);phase+=2*Math.PI*(f0+(f1-f0)*u)/RATE;add(i,Math.sin(phase)*env*amp,pan);}}
function hiss(at,dur,amp,pan=0){let low=0;for(let j=0;j<dur*RATE;j++){const i=Math.floor(at*RATE)+j;if(i>=count)break;const u=j/(dur*RATE);low=low*.7+noise()*.3;add(i,low*Math.exp(-u*5)*Math.min(1,u*90)*amp,pan);}}
let phase=0,air=0;for(let i=0;i<count;i++){const t=i/RATE;
 if(t<6.55){let f=t<1.2?36+Math.sin(t*47)*8:t<2.5?45+(t-1.2)*40:95+(t-2.5)*30;f-=Math.floor(Math.max(0,t-2.5)*1.45)*16;phase+=f*2*Math.PI/RATE;const gain=(t<.85?.045:t<2.5?.075:.11)*(t>5.8?clamp((6.55-t)/.75):1);air=.93*air+.07*noise();add(i,(Math.sin(phase)+.4*Math.sin(phase*2)+.23*Math.sin(phase*5))*gain+air*.02,Math.sin(t)*.2);}
 if(t>1.1&&t<6.45){const u=clamp((t-1.1)/4.9),env=Math.sin(Math.PI*clamp((t-1.1)/5.35))**.7;add(i,(Math.sin(t*2*Math.PI*55)+Math.sin(t*2*Math.PI*82.407)*.35)*env*.035);}
 if(t>2.5&&t<4.25){const u=(t-2.5)/1.75,env=Math.sin(Math.PI*u);add(i,Math.sin(t*(1100+Math.sin(t*26)*160)*2*Math.PI)*env*.025+(noise()*.015)*env,u*.8-.4);}
}
hiss(.12,.09,.16);tone(.22,.23,70,28,.22);hiss(.44,.13,.22);tone(.62,.22,52,21,.2);
tone(1.2,1.22,100,240,.1);hiss(2.47,.35,.3,-.6);tone(4.15,.9,130,480,.09);hiss(4.26,.8,.35,.4);
tone(5.48,.7,85,26,.42);hiss(5.48,.85,.72);tone(5.5,.15,200,65,.2);hiss(5.76,.4,.35,-.5);hiss(6.05,.28,.28,.6);
// A beat of quiet, then the wheel taps the wet road and rolls away.
for(const [t,a] of [[7.42,.16],[7.77,.13],[8.03,.1],[8.23,.07],[8.4,.045]]){tone(t,.12,390,90,a,-.65);hiss(t,.07,a*.35,-.65);}
tone(8.92,.34,392,392,.045);tone(9.02,.3,293.66,293.66,.04);
const pcm=Buffer.alloc(count*4);let peak=0;for(let i=0;i<count;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}const gain=.82/Math.max(.82,peak);for(let i=0;i<count;i++){pcm.writeInt16LE(Math.round(Math.tanh(left[i]*gain)*32767),i*4);pcm.writeInt16LE(Math.round(Math.tanh(right[i]*gain)*32767),i*4+2);}
const wav=Buffer.alloc(44);wav.write('RIFF');wav.writeUInt32LE(36+pcm.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(RATE,24);wav.writeUInt32LE(RATE*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length,40);await writeFile(`${work}/soundtrack.wav`,Buffer.concat([wav,pcm]));
const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',`${FPS}`,'-i','pipe:0','-i',`${work}/soundtrack.wav`,'-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','192k','-af','loudnorm=I=-17:TP=-1.5:LRA=9','-movflags','+faststart','-t',`${film.duration}`,videoFile],{stdio:['pipe','inherit','inherit']});const exited=once(ff,'exit');
const total=Math.round(film.duration*FPS),counts={};for(let i=0;i<total;i++){const info=paint(i/FPS);counts[`${info.shot.id}:${info.index}`]=(counts[`${info.shot.id}:${info.index}`]??0)+1;const data=c.getImageData(0,0,W,H).data;if(!ff.stdin.write(Buffer.from(data.buffer,data.byteOffset,data.byteLength)))await once(ff.stdin,'drain');}ff.stdin.end();const [code]=await exited;if(code!==0)throw Error('Gokart video encoding failed');
await sharp(film.sourceMaster??'docs/art/gokart/master.png').resize(1280,720,{fit:'cover'}).webp({quality:91}).toFile(posterFile);
const contact=createCanvas(1920,1440),cc=contact.getContext('2d');let cell=0;
for(const shot of film.shots){const chosen=Math.min(shot.drawings.length-1,shot.id==='ending'?6:Math.floor(shot.drawings.length/2));await sharp(shot.drawings[chosen]).resize(384,216,{fit:'cover'}).webp({quality:90}).toFile(`public${shot.thumbnail}`);for(const fraction of [.2,.72]){paint(shot.start+(shot.end-shot.start)*fraction);cc.drawImage(surface,cell%3*640,Math.floor(cell/3)*360,640,360);cell++;}}
await writeFile(`${work}/contact.jpg`,contact.toBuffer('image/jpeg'));
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',videoFile],{encoding:'utf8'}));
await writeFile(film.renderReport??'docs/art/gokart/render-report.json',JSON.stringify({duration:film.duration,fps:FPS,drawingsUsed:Object.keys(counts).length,renderedFrames:total,frameCounts:counts,sourceResolution:'Native cropped sheet drawings; encoded at 1280x720. Encoding is not a claim of 720p source detail.',audio:'Original synthesized stereo Foley and tonal bed, no samples or third-party recordings',verification:{decoded:true,browserPlayback:'unverified',phoneLayout:'unverified',audiblePlayback:'unverified'},probe},null,2));console.log(`Encoded ${total} frames, ${Object.keys(counts).length} unique drawings, ${film.duration}s`);
