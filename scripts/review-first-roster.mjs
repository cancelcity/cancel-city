// Same deterministic painter as live gameplay; offline QA, not browser playback.
import {createRequire} from 'node:module';
import {execFileSync,spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {once} from 'node:events';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'work/first-roster-review'),compiled=path.join(root,'work/first-roster-compiled');
await mkdir(out,{recursive:true});
const args=['exec','tsc','src/components/live-scene-painter.ts','src/data/first-roster-batch.ts','--module','commonjs','--target','ES2022','--outDir',compiled,'--esModuleInterop','--resolveJsonModule','--skipLibCheck'];
if(process.env.SITES_PNPM_BIN)execFileSync(process.execPath,[process.env.SITES_PNPM_BIN,...args],{stdio:'inherit'});else execFileSync('pnpm',args,{stdio:'inherit'});
await writeFile(path.join(compiled,'package.json'),'{"type":"commonjs"}');
const require=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json')),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('public/assets/actors/city-display.ttf','CityDisplay');GlobalFonts.registerFromPath('public/assets/actors/city-mono.ttf','CityMono');
const app=createRequire(path.join(compiled,'package.json')),{paintLiveScene,liveSceneAssets}=app('./components/live-scene-painter.js'),{previewSpecial}=app('./domain/cinematic.js'),{FIRST_ROSTER_BATCH}=app('./data/first-roster-batch.js');
const images={},times=[.1,.26,.4,.54,.65,.6875,.78,.95],reports=[];
async function frame(id,progress,reduced=false){
 const base=previewSpecial(id),scene={kind:'special',playback:{...base,targetId:base.support?'CC008':base.targetId},progress,reduced};
 for(const src of liveSceneAssets(scene))if(!images[src])images[src]=await loadImage(path.join(root,'public',src));
 const before=JSON.stringify(scene),surface=createCanvas(1280,720);paintLiveScene(surface.getContext('2d'),images,scene,1280,720);
 if(JSON.stringify(scene)!==before)throw Error('Painter mutated scene');return surface;
}
for(const {id} of FIRST_ROSTER_BATCH){
 const sheet=createCanvas(1920,1080),ctx=sheet.getContext('2d');
 for(let i=0;i<times.length;i++){const surface=await frame(id,times[i]);ctx.drawImage(surface,i%3*640,Math.floor(i/3)*360,640,360);if(i===7)await writeFile(path.join(out,`${id}-verdict.png`),surface.toBuffer('image/png'));}
 ctx.drawImage(await frame(id,0,true),1280,720,640,360);await writeFile(path.join(out,`${id}.jpg`),sheet.toBuffer('image/jpeg'));
 // Review the entire 4.8 seconds, not just still frames. No audio in offline clips.
 const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','25','-i','pipe:0','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,`${id}.mp4`)],{stdio:['pipe','inherit','inherit']});
 const exited=once(ff,'exit');for(let i=0;i<120;i++){const surface=await frame(id,i/119);if(!ff.stdin.write(surface.toBuffer('image/png')))await once(ff.stdin,'drain');}ff.stdin.end();const [code]=await exited;if(code!==0)throw Error('Video encoding failed');
 reports.push({id,frames:120,contactSheet:9,stateMutation:false});console.log(`${id}: 120 full-speed frames rendered / contact sheet ready`);
}
await writeFile(path.join(out,'review.json'),JSON.stringify({browserPlayback:'unverified',phoneLayout:'unverified',offlineFullSpeedFrames:1440,contactFrames:108,reports},null,2));
