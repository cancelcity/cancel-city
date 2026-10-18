// Technical alpha alignment and runtime encoding; generated masters stay unchanged.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),sharp=createRequire(require.resolve('next/package.json'))('sharp');
const cards=JSON.parse(await readFile('src/data/catalogue.json','utf8')),records=[];
await mkdir('public/assets/specials',{recursive:true});
for(const card of cards){
 const source=`docs/art/specials/${card.id}.png`,data=await readFile(source),metadata=await sharp(data).metadata();
 if(!metadata.hasAlpha)throw new Error(`Action sprite requires genuine alpha: ${card.id}`);
 const {data:raw,info}=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=-1,bottom=-1,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const alpha=raw[(y*info.width+x)*4+3];if(alpha===0)transparent++;if(alpha>12){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
 if(right<0||transparent/(info.width*info.height)<.04)throw new Error(`Invalid transparent action sprite: ${card.id}`);
 left=Math.max(0,left-6);top=Math.max(0,top-6);right=Math.min(info.width-1,right+6);bottom=Math.min(info.height-1,bottom+6);
 const crop={left,top,width:right-left+1,height:bottom-top+1},resized=await sharp(data).extract(crop).resize({width:768,height:768,fit:'inside'}).png().toBuffer(),size=await sharp(resized).metadata(),padLeft=Math.floor((896-size.width)/2),padTop=896-size.height-64;
 const output=`public/assets/specials/${card.id}.webp`;
 await sharp(resized).extend({left:padLeft,right:896-size.width-padLeft,top:padTop,bottom:64,background:{r:0,g:0,b:0,alpha:0}}).webp({quality:85,effort:5}).toFile(output);
 records.push({id:card.id,source,sourceSha256:createHash('sha256').update(data).digest('hex'),sourceDimensions:[metadata.width,metadata.height],visibleAlphaBounds:crop,runtimeCanvas:[896,896],runtimeBottomMargin:64,output,bytes:(await stat(output)).size});
}
await writeFile('docs/art/specials/asset-processing.json',JSON.stringify({mode:'Alpha-bound alignment, proportional resize, common transparent canvas/baseline and WebP encoding. Generated masters unchanged.',records},null,2)+'\n');
console.log(JSON.stringify({sprites:records.length,runtimeBytes:records.reduce((n,r)=>n+r.bytes,0),largestSpriteBytes:Math.max(...records.map(r=>r.bytes))}));
