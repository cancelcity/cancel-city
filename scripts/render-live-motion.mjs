// Review the same painter used by browser gameplay, without browser automation.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'work/live-review');
await mkdir(out,{recursive:true});
const compilerArgs=['exec','tsc','src/components/live-scene-painter.ts','--module','commonjs','--target','ES2022','--outDir','work/live-preview','--esModuleInterop','--resolveJsonModule','--skipLibCheck'];
if(process.env.SITES_PNPM_BIN)execFileSync(process.execPath,[process.env.SITES_PNPM_BIN,...compilerArgs],{stdio:'inherit'});else execFileSync('pnpm',compilerArgs,{stdio:'inherit'});
await writeFile('work/live-preview/package.json','{"type":"commonjs"}\n');
const require=createRequire(path.join(root,'package.json'));
let canvas;
try{canvas=require('@napi-rs/canvas');}catch{const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;if(!runtime)throw new Error('Install @napi-rs/canvas to run frame review.');canvas=createRequire(path.join(runtime,'package.json'))('@napi-rs/canvas');}
const {createCanvas,loadImage,GlobalFonts}=canvas;
GlobalFonts.registerFromPath(path.join(root,'public/assets/actors/city-display.ttf'),'CityDisplay');
GlobalFonts.registerFromPath(path.join(root,'public/assets/actors/city-mono.ttf'),'CityMono');
const {paintLiveScene,liveSceneAssets}=require(path.join(root,'work/live-preview/components/live-scene-painter.js'));
const {previewSpecial}=require(path.join(root,'work/live-preview/domain/cinematic.js'));
const {specialPlayback}=require(path.join(root,'work/live-preview/domain/cinematic.js'));
const {DUOS}=require(path.join(root,'work/live-preview/data/duos.js'));
const {createMatch,takeTurn,LOANERS}=require(path.join(root,'work/live-preview/domain/battle.js'));
const images={},saved=[];
async function frame(scene,name){
 for(const url of liveSceneAssets(scene))if(!images[url])images[url]=await loadImage(path.join(root,'public',url));
 const before=JSON.stringify(scene),surface=createCanvas(1600,900);paintLiveScene(surface.getContext('2d'),images,scene,1600,900);
 if(JSON.stringify(scene)!==before)throw new Error('Painter mutated game state');
 const file=path.join(out,name+'.png');await writeFile(file,surface.toBuffer('image/png'));saved.push({file,scene});return surface;
}
const sheet=createCanvas(1920,1350),ctx=sheet.getContext('2d');let index=0;
for(const id of ['CC001','CC026','CC037','CC039','CC008'])for(const progress of [.16,.36,.72,.94]){
 const s=await frame({kind:'special',playback:previewSpecial(id),progress,reduced:false},`${id}-${Math.round(progress*100)}`);ctx.drawImage(s,index%4*480,Math.floor(index/4)*270,480,270);index++;
}
await writeFile(path.join(out,'special-contact-sheet.jpg'),sheet.toBuffer('image/jpeg'));
const city=createCanvas(1920,1080),cityCtx=city.getContext('2d');index=0;
for(const kind of ['feed','pr','summit','civic','rocket','afterparty']){
 const reveal={plot:index,before:{kind,level:1,residentId:null},after:{kind,level:2,residentId:null},spent:120,founding:false};
 const s=await frame({kind:'city',reveal,progress:.88,reduced:false},`city-${kind}`);cityCtx.drawImage(s,index%3*640,Math.floor(index/3)*540,640,360);index++;
}
await writeFile(path.join(out,'city-contact-sheet.jpg'),city.toBuffer('image/jpeg'));
const match=createMatch('live-review','street',LOANERS,{version:2}),committed=takeTurn(match,'player',{type:'attack'}),event=committed.events.at(-1);
const battle=createCanvas(1920,810),battleCtx=battle.getContext('2d');index=0;
for(const progress of [.1,.35,.53,.63,.82,.96]){
 const impact=progress>=700/1180;const s=await frame({kind:'battle',match:impact?committed:match,event,progress,impact,reduced:false},`battle-${Math.round(progress*100)}`);battleCtx.drawImage(s,index%3*640,Math.floor(index/3)*405,640,360);index++;
}
await writeFile(path.join(out,'battle-contact-sheet.jpg'),battle.toBuffer('image/jpeg'));
await frame({kind:'special',playback:previewSpecial('CC026'),progress:0,reduced:true},'reduced-karen');
const pack=createCanvas(1920,540),packCtx=pack.getContext('2d');index=0;
for(const progress of [.08,.22,.35,.46,.62,.76,.9,1]){const s=await frame({kind:'pack',progress,reduced:false},`pack-${Math.round(progress*100)}`);packCtx.drawImage(s,index%4*480,Math.floor(index/4)*270,480,270);index++;}
await writeFile(path.join(out,'pack-contact-sheet.jpg'),pack.toBuffer('image/jpeg'));
const extra=createCanvas(1920,2160),extraCtx=extra.getContext('2d');index=0;
for(const id of Array.from({length:8},(_,i)=>`CC0${43+i}`))for(const progress of [.16,.36,.72,.94]){const s=await frame({kind:'special',playback:previewSpecial(id),progress,reduced:false},`new-${id}-${Math.round(progress*100)}`);extraCtx.drawImage(s,index%4*480,Math.floor(index/4)*270,480,270);index++;}
await writeFile(path.join(out,'culture-contact-sheet.jpg'),extra.toBuffer('image/jpeg'));
const duos=createCanvas(1920,1620),duoCtx=duos.getContext('2d');index=0;
for(const duo of DUOS)for(const progress of [.16,.36,.72,.94]){const third=['CC001','CC008'].find(id=>!duo.pair.includes(id))||'CC015',m=createMatch('duo-review-'+duo.id,'street',[...duo.pair,third],{version:3});m.player[0].charge=3;m.player[1].charge=1;const d=takeTurn(m,'player',{type:'duo'}),s=await frame({kind:'special',playback:specialPlayback(d,d.events.at(-1)),progress,reduced:false},`${duo.id}-${Math.round(progress*100)}`);duoCtx.drawImage(s,index%4*480,Math.floor(index/4)*270,480,270);index++;}
await writeFile(path.join(out,'duo-contact-sheet.jpg'),duos.toBuffer('image/jpeg'));
const inc=createCanvas(1920,810),incCtx=inc.getContext('2d');index=0;
for(const buildingKind of ['feed','pr','summit','civic','rocket','afterparty']){const s=await frame({kind:'incident',buildingKind,cardId:buildingKind==='afterparty'?'CC043':'CC007',choice:index%2,progress:.93,reduced:false},`incident-${buildingKind}`);incCtx.drawImage(s,index%3*640,Math.floor(index/3)*405,640,360);index++;}
await writeFile(path.join(out,'incident-contact-sheet.jpg'),inc.toBuffer('image/jpeg'));
for(const progress of [.16,.46,.72,.94])await frame({kind:'pull',cardId:'CC043',isNew:true,copies:1,progress,reduced:false},`pull-${Math.round(progress*100)}`);
const comedy=createCanvas(2400,510),comedyCtx=comedy.getContext('2d');index=0;
for(const id of ['CC001','CC026','CC046'])for(const progress of [.10,.28,.405,.48,.58,.6875,.78,.95]){const s=await frame({kind:'special',playback:previewSpecial(id),progress,reduced:false},`meme-${id}-${progress}`);comedyCtx.drawImage(s,index%8*300,Math.floor(index/8)*170,300,169);index++;}
await writeFile(path.join(out,'comedy-contact-sheet.jpg'),comedy.toBuffer('image/jpeg'));
const reactions=createCanvas(1920,1080),reactionCtx=reactions.getContext('2d');index=0;
for(const [cardId,isNew,copies] of [['CC001',false,2],['CC001',true,1],['CC043',true,1],['CC012',false,1]])for(const progress of [.16,.46,.75,.94]){const s=await frame({kind:'pull',cardId,isNew,copies,progress,reduced:false},`reaction-${cardId}-${isNew}-${progress}`);reactionCtx.drawImage(s,index%4*480,Math.floor(index/4)*270,480,270);index++;}
await writeFile(path.join(out,'reaction-contact-sheet.jpg'),reactions.toBuffer('image/jpeg'));
for(const id of ['CC012','CC027'])for(const progress of [.16,.36,.72,.94])await frame({kind:'special',playback:previewSpecial(id),progress,reduced:false},`redraw-${id}-${progress}`);
for(const cardId of ['CC001','CC026','CC046'])await frame({kind:'special',playback:previewSpecial(cardId),progress:0,reduced:true},`reduced-meme-${cardId}`);
for(const [cardId,isNew,copies] of [['CC001',false,2],['CC001',true,1],['CC043',true,1]])await frame({kind:'pull',cardId,isNew,copies,progress:0,reduced:true},`reduced-reaction-${cardId}-${isNew}`);
const expansion=createCanvas(1920,4320),expansionCtx=expansion.getContext('2d');index=0;
for(const id of Array.from({length:16},(_,i)=>`CC0${51+i}`))for(const progress of [.12,.34,.74,.95]){const s=await frame({kind:'special',playback:previewSpecial(id),progress,reduced:false},`expansion-${id}-${progress}`);expansionCtx.drawImage(s,index%4*480,Math.floor(index/4)*270,480,270);index++;}
await writeFile(path.join(out,'expansion-contact-sheet.jpg'),expansion.toBuffer('image/jpeg'));
for(const id of Array.from({length:16},(_,i)=>`CC0${51+i}`))await frame({kind:'special',playback:previewSpecial(id),progress:0,reduced:true},`reduced-expansion-${id}`);
await writeFile(path.join(out,'review.json'),JSON.stringify({frames:saved.map(({file,scene})=>({file,kind:scene.kind,progress:scene.progress})),browserPlayback:'unverified',stateMutation:false},null,2));
console.log(JSON.stringify({frames:saved.length,contactSheets:['special-contact-sheet.jpg','city-contact-sheet.jpg','battle-contact-sheet.jpg','pack-contact-sheet.jpg','culture-contact-sheet.jpg','duo-contact-sheet.jpg','incident-contact-sheet.jpg','comedy-contact-sheet.jpg','reaction-contact-sheet.jpg','expansion-contact-sheet.jpg'].map(f=>path.join(out,f))}));
