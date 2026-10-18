import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const [id,filesJson,anchorsJson,promptsJson]=process.argv.slice(2);
const files=JSON.parse(filesJson),anchors=JSON.parse(anchorsJson),doc=path.resolve('docs/art/roster-second-batch',id),poses=[];
await fs.mkdir(doc,{recursive:true});
let baseHeight;
for(let i=0;i<3;i++){
 await fs.copyFile(files[i],path.join(doc,`original-pose-${i}.png`));
 const {data,info}=await sharp(files[i]).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let minX=info.width,minY=info.height,maxX=0,maxY=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>60){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
 if(minX<1||minY<1||maxX>=info.width-1||maxY>=info.height-1)throw Error('Sprite clipped at sheet edge '+i);
 const left=Math.max(0,minX-10),top=Math.max(0,minY-10),width=Math.min(info.width-1,maxX+10)-left+1,height=Math.min(info.height-1,maxY+10)-top+1;
 const name=`${id}-b2-${i}.webp`;
 await sharp(files[i]).extract({left,top,width,height}).resize({height:720,withoutEnlargement:true}).webp({quality:92}).toFile('public/assets/actors/'+name);
 const out=await sharp('public/assets/actors/'+name).metadata(),ratio=out.height/height;
 poses.push({src:'/assets/actors/'+name,width:out.width,height:out.height,anchor:{x:Math.round((anchors[i][0]-left)*ratio),y:Math.round((anchors[i][1]-top)*ratio)}});
 if(i===0)baseHeight=Math.round((anchors[i][1]-minY)*ratio);
}
const metadata={id,baseHeight,poses:[poses[0],poses[1],poses[2],poses[1],poses[2],poses[0]],uniquePoses:3,slotMap:[0,1,2,1,2,0],portrait:`/assets/roster-b2/${id}.webp`,small:`/assets/roster-b2/${id}-small.webp`,tool:'built-in image_gen',productionNote:'Three individually generated intact upright whole-character poses. Six cinematic slots reuse these three sources. Original multi-pose sheets were rejected by the image tool at output stage with category other; no six-unique-pose claim.'};
await fs.writeFile(path.join(doc,'actor.json'),JSON.stringify(metadata,null,2)+'\n');
await fs.writeFile(path.join(doc,'prompts.json'),promptsJson+'\n');
console.log(JSON.stringify(metadata));
