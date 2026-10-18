// Offline art QA only. Browser card rendering still needs a playback review.
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const runtime=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'));
const sharp=runtime('sharp'),{createCanvas,loadImage,GlobalFonts}=runtime('@napi-rs/canvas');
GlobalFonts.registerFromPath('public/assets/actors/city-display.ttf','CityDisplay');
const ids=['CC001','CC002','CC006','CC007','CC012','CC013','CC014','CC016','CC018','CC023','CC058','CC135'];
const out='work/roster-portrait-review';await mkdir(out,{recursive:true});
const sheet=createCanvas(1280,1520),ctx=sheet.getContext('2d');ctx.fillStyle='#17131e';ctx.fillRect(0,0,1280,1520);
const sources=[...['CC001','CC006','CC014','CC026'].map(id=>({id,file:`public/assets/residents/${id}.webp`,old:true})),...ids.map(id=>({id,file:`public/assets/roster-v3/${id}.webp`,old:false}))];
const reports=[];
for(let i=0;i<sources.length;i++){
 const item=sources[i],x=i%4*320,y=Math.floor(i/4)*380,im=await loadImage(item.file);ctx.drawImage(im,x+8,y+8,304,304);
 ctx.fillStyle=item.old?'#f2e8cb':'#deff00';ctx.font='24px CityDisplay';ctx.textAlign='center';ctx.fillText(`${item.old?'ORIGINAL DECK':'RESTYLED'} / ${item.id}`,x+160,y+346);
 if(item.old)continue;
 for(const [suffix,size] of [['',896],['-small',384]]){const file=`public/assets/roster-v3/${item.id}${suffix}.webp`,data=await readFile(file),m=await sharp(data).metadata();if(m.width!==size||m.height!==size)throw Error(`Wrong dimensions: ${file}`);if(m.hasAlpha)throw Error(`Card portrait must be opaque: ${file}`);reports.push({file,width:m.width,height:m.height,bytes:data.length});}
}
await writeFile(`${out}/deck-comparison.jpg`,sheet.toBuffer('image/jpeg'));
await writeFile(`${out}/review.json`,JSON.stringify({portraits:12,derivatives:24,browserRendering:'unverified',reports},null,2));
console.log(JSON.stringify({portraits:12,derivatives:24,comparison:path.resolve(`${out}/deck-comparison.jpg`)}));
