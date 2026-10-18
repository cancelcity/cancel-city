// Offline review of the same scene painter used in the browser. No player saves are read.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite/package.json'))('esbuild');
const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {createCanvas,loadImage,GlobalFonts}=runtime?createRequire(path.join(runtime,'package.json'))('@napi-rs/canvas'):require('@napi-rs/canvas');
const out=path.resolve('work/court-review');
await fs.mkdir(out,{recursive:true});
await build({stdin:{contents:"export {paintLiveScene,liveSceneAssets} from './src/components/live-scene-painter'; export {createMatch,takeTurn,LOANERS} from './src/domain/battle';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:path.join(out,'painter.mjs')});
const {paintLiveScene,liveSceneAssets,createMatch,takeTurn,LOANERS}=await import(path.join(out,'painter.mjs'));
GlobalFonts.registerFromPath('public/assets/actors/city-display.ttf','CityDisplay');
GlobalFonts.registerFromPath('public/assets/actors/city-mono.ttf','CityMono');
const starter=createMatch('offline-starter','street',LOANERS,{version:3});
const attack=takeTurn(starter,'player',{type:'attack'}),guard=takeTurn(starter,'player',{type:'guard'}),tag=takeTurn(starter,'player',{type:'switch',slot:1});
const weak=structuredClone(starter);weak.enemy[0].hp=1;
const knockout=takeTurn(weak,'player',{type:'attack'});
const famous=createMatch('offline-recognizable','corporate',['CC063','CC064','CC066'],{version:3});
const wide=createMatch('offline-wide','crypto',['CC049','CC052','CC060'],{version:3});
const examples=[
 {name:'starter-idle',match:starter},
 {name:'anticipation',match:starter,event:attack.events.at(-1),progress:.3,impact:false},
 {name:'attack-contact',match:attack,event:attack.events.at(-1),progress:.64,impact:true},
 {name:'guard',match:guard,event:guard.events.at(-1),progress:.65,impact:true},
 {name:'tag-in',match:tag,event:tag.events.at(-1),progress:.65,impact:true},
 {name:'knockout-contact',match:knockout,event:knockout.events.at(-1),progress:.7,impact:true},
 {name:'next-resident',match:knockout},
 {name:'recognizable-crew',match:famous},
 {name:'wide-residents',match:wide},
];
const images={};
for(const example of examples){const scene={kind:'battle',progress:1,impact:true,reduced:false,time:4200,...example};for(const src of liveSceneAssets(scene))if(!images[src])images[src]=await loadImage(path.resolve('public'+src));}
for(const example of examples){const canvas=createCanvas(1600,900),scene={kind:'battle',progress:1,impact:true,reduced:false,time:4200,...example};paintLiveScene(canvas.getContext('2d'),images,scene,1600,900);await fs.writeFile(path.join(out,example.name+'.png'),await canvas.encode('png'));console.log(path.join(out,example.name+'.png'));}
