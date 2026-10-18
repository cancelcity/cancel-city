// Runtime sprite alignment/encoding only. Generated masters stay unchanged.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),sharp=createRequire(require.resolve('next/package.json'))('sharp');
const ids=['feed','pr','summit','civic','rocket','afterparty'],records=[];
await mkdir('public/assets/city',{recursive:true});
for(const id of ids)for(const level of [1,2,3]){
 const source=`docs/art/city/${id}-l${level}.png`,data=await readFile(source),metadata=await sharp(data).metadata();
 if(!metadata.hasAlpha)throw new Error(`City sprite needs alpha: ${source}`);
 const {data:raw,info}=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=-1,bottom=-1,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const alpha=raw[(y*info.width+x)*4+3];if(alpha===0)transparent++;if(alpha>12){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
 if(right<0||transparent/info.width/info.height<.05)throw new Error(`Invalid transparent sprite: ${source}`);
 left=Math.max(0,left-5);top=Math.max(0,top-5);right=Math.min(info.width-1,right+5);bottom=Math.min(info.height-1,bottom+5);
 const crop={left,top,width:right-left+1,height:bottom-top+1};
 const resized=await sharp(data).extract(crop).resize({width:600,height:590,fit:'inside'}).png().toBuffer(),size=await sharp(resized).metadata();
 const padLeft=Math.floor((640-size.width)/2),padTop=640-size.height-25;
 const output=`public/assets/city/${id}-l${level}.webp`;
 await sharp(resized).extend({left:padLeft,right:640-size.width-padLeft,top:padTop,bottom:25,background:{r:0,g:0,b:0,alpha:0}}).webp({quality:86,effort:5}).toFile(output);
 records.push({id,level,source,sourceSha256:createHash('sha256').update(data).digest('hex'),sourceDimensions:[metadata.width,metadata.height],visibleAlphaBounds:crop,runtimeCanvas:[640,640],runtimeBottomMargin:25,output,bytes:(await stat(output)).size});
}
const backdrop='docs/art/city/neighbourhood.png',backgroundData=await readFile(backdrop);
await sharp(backgroundData).resize({width:1600,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile('public/assets/city/neighbourhood.webp');
await writeFile('docs/art/city/asset-processing.json',JSON.stringify({mode:'Runtime alpha-bound crop, proportional resize, common transparent canvas/baseline, WebP encoding. Masters unchanged.',records,backdrop:{source:backdrop,sourceSha256:createHash('sha256').update(backgroundData).digest('hex'),output:'public/assets/city/neighbourhood.webp',bytes:(await stat('public/assets/city/neighbourhood.webp')).size}},null,2)+'\n');
console.log(JSON.stringify({sprites:records.length,runtimeSpriteBytes:records.reduce((n,r)=>n+r.bytes,0)}));
