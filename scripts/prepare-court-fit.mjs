import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url),runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {createCanvas,loadImage}=runtime?createRequire(path.join(runtime,'package.json'))('@napi-rs/canvas'):require('@napi-rs/canvas');
const cast=JSON.parse(await fs.readFile('src/data/actor-cast.json','utf8')),result={};
for(const [id,actor] of Object.entries(cast)){
 const pose=actor.poses[0],image=await loadImage(path.resolve('public'+pose.src)),canvas=createCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const {data}=ctx.getImageData(0,0,image.width,image.height);
 let x0=image.width,y0=image.height,x1=0,y1=0;
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(data[(y*image.width+x)*4+3]>30){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 result[id]={width:x1-x0+1,height:y1-y0+1};
}
await fs.writeFile('src/data/court-fit.json',JSON.stringify(result)+'\n');
console.log(`Measured ${Object.keys(result).length} resident silhouettes. No artwork was changed.`);
