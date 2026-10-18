// Technical transparency alignment and runtime encoding. Original generated PNGs stay unchanged.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),sharp=createRequire(require.resolve('next/package.json'))('sharp');
const records=[];await mkdir('public/assets/props',{recursive:true});
for(let i=1;i<=12;i++){
 const id=`P${String(i).padStart(3,'0')}`,source=`docs/art/props/${id}.png`,data=await readFile(source),metadata=await sharp(data).metadata();
 if(!metadata.hasAlpha)throw new Error(`Prop requires alpha: ${id}`);
 const {data:raw,info}=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=-1,bottom=-1,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const alpha=raw[(y*info.width+x)*4+3];if(alpha===0)transparent++;if(alpha>12){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
 if(right<0||transparent/(info.width*info.height)<.04)throw new Error(`Invalid transparency: ${id}`);
 left=Math.max(0,left-6);top=Math.max(0,top-6);right=Math.min(info.width-1,right+6);bottom=Math.min(info.height-1,bottom+6);
 const crop={left,top,width:right-left+1,height:bottom-top+1},resized=await sharp(data).extract(crop).resize({width:648,height:648,fit:'inside'}).png().toBuffer(),size=await sharp(resized).metadata();
 const padLeft=Math.floor((768-size.width)/2),padTop=Math.floor((768-size.height)/2),output=`public/assets/props/${id}.webp`;
 await sharp(resized).extend({left:padLeft,right:768-size.width-padLeft,top:padTop,bottom:768-size.height-padTop,background:{r:0,g:0,b:0,alpha:0}}).webp({quality:85,effort:5}).toFile(output);
 records.push({id,source,sourceSha256:createHash('sha256').update(data).digest('hex'),sourceDimensions:[metadata.width,metadata.height],visibleAlphaBounds:crop,runtimeCanvas:[768,768],output,bytes:(await stat(output)).size});
}
await writeFile('docs/art/props/asset-processing.json',JSON.stringify({mode:'Alpha-bound crop, proportional resize, common transparent canvas and WebP encoding. Generated masters unchanged.',records},null,2)+'\n');
const tiles=[];
for(const [index,r] of records.entries()){
 const tile=await sharp(r.output).resize(260,260).png().toBuffer(),x=index%4*300,y=Math.floor(index/4)*310;
 tiles.push({input:tile,left:x+20,top:y+12});
 tiles.push({input:Buffer.from(`<svg width="300" height="38"><text x="150" y="28" text-anchor="middle" fill="#e8dfc8" font-family="sans-serif" font-size="20">${r.id}</text></svg>`),left:x,top:y+270});
}
await mkdir('.sites-runtime/qa',{recursive:true});
await sharp({create:{width:1200,height:930,channels:4,background:'#27232c'}}).composite(tiles).png().toFile('.sites-runtime/qa/props-contact.png');
console.log(JSON.stringify({props:records.length,runtimeBytes:records.reduce((n,r)=>n+r.bytes,0),largestPropBytes:Math.max(...records.map(r=>r.bytes))}));
