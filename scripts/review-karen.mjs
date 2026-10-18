// Same display list as the direct PixiJS GPU renderer, reviewed offline.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out='work/karen-review';await mkdir(out,{recursive:true});
execFileSync(process.execPath,[process.env.SITES_PNPM_BIN,'exec','tsc','src/components/karen-renderer.ts','--module','commonjs','--target','ES2022','--outDir','work/karen-compiled','--esModuleInterop','--resolveJsonModule','--skipLibCheck'],{stdio:'inherit'});
await writeFile('work/karen-compiled/package.json','{"type":"commonjs"}');
const require=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json')),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');GlobalFonts.registerFromPath('public/assets/actors/city-mono.ttf','CityMono');
const app=createRequire(path.join(process.cwd(),'work/karen-compiled/package.json')),{karenDisplayList,paintKarenFrame}=app('./components/karen-renderer.js');
const images={},sources=['/assets/karen/rig.png','/assets/karen/cashier.png','/assets/karen/office.webp','/assets/specials/CC003.webp'];
for(const src of sources)images[src]=await loadImage('public'+src);
const times=[500,1400,1900,2050,3300,4100,4900,5600,6100,6800,7300,7550,7610,8200,8900,9450,10100,10999];
const sheet=createCanvas(1920,Math.ceil(times.length/3)*385),contact=sheet.getContext('2d');let index=0;
for(const time of times){const nodes=karenDisplayList(time/11000),frame=createCanvas(1280,720);paintKarenFrame(frame.getContext('2d'),images,nodes);await writeFile(`${out}/${time}.png`,frame.toBuffer('image/png'));contact.drawImage(frame,index%3*640,Math.floor(index/3)*385,640,360);contact.fillStyle='#f5e7cd';contact.font='15px monospace';contact.fillText(time+' ms',index%3*640+8,Math.floor(index/3)*385+377);index++;}
await writeFile(`${out}/contact.jpg`,sheet.toBuffer('image/jpeg'));
// Review every full-cut frame for nonfinite geometry and serializable scene state.
for(let ms=0;ms<=11000;ms+=1000/60){const nodes=karenDisplayList(ms/11000);if(JSON.stringify(nodes).includes('null'))throw Error('Invalid scene geometry');}
for(const mode of ['quick','full']){const nodes=karenDisplayList(.8,mode,true),frame=createCanvas(1280,720);paintKarenFrame(frame.getContext('2d'),images,nodes);await writeFile(`${out}/reduced-${mode}.png`,frame.toBuffer('image/png'));}
console.log(JSON.stringify({contact:path.resolve(out,'contact.jpg'),reviewedFrames:times.length+2,geometryFrames:661,browserPlayback:'unverified',gpuPlayback:'unverified',audioListening:'unverified'}));
