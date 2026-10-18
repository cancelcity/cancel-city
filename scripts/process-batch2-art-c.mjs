import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');
const [id,portrait,sheet,anchorsJson,promptsJson]=process.argv.slice(2);
const doc=path.resolve('docs/art/roster-second-batch',id);
await fs.mkdir(doc,{recursive:true});
await fs.mkdir('public/assets/roster-b2',{recursive:true});
await fs.mkdir('public/assets/actors',{recursive:true});
await fs.copyFile(portrait,path.join(doc,'original-portrait.png'));
await fs.copyFile(sheet,path.join(doc,'original-sheet.png'));
await fs.writeFile(path.join(doc,'prompts.json'),promptsJson+'\n');
for(const [suffix,size] of [['',896],['-small',384]])await sharp(portrait).resize(size,size,{fit:'cover'}).flatten({background:'#00c9ee'}).webp({quality:90}).toFile(`public/assets/roster-b2/${id}${suffix}.webp`);
const {data,info}=await sharp(sheet).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const cw=Math.floor(info.width/3),ch=Math.floor(info.height/2),anchors=JSON.parse(anchorsJson),poses=[];
const labels=new Uint32Array(info.width*info.height),components=[];
for(let p=0;p<labels.length;p++){
 if(labels[p]||data[p*4+3]<60)continue;
 const label=components.length+1,queue=[p];labels[p]=label;
 let minX=info.width,minY=info.height,maxX=0,maxY=0;
 for(let q=0;q<queue.length;q++){
  const n=queue[q],x=n%info.width,y=Math.floor(n/info.width);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,k=yy*info.width+xx;if(xx<0||xx>=info.width||yy<0||yy>=info.height||labels[k]||data[k*4+3]<60)continue;labels[k]=label;queue.push(k);}
 }
 components.push({label,n:queue.length,minX,minY,maxX,maxY,x:(minX+maxX)/2,y:(minY+maxY)/2});
}
const mains=[...components].sort((a,b)=>b.n-a.n).slice(0,6).sort((a,b)=>Math.floor(a.y/ch)-Math.floor(b.y/ch)||a.x-b.x);
const nearest=(x,y)=>mains.reduce((b,c,i)=>{const d=(x-c.x)**2+(y-c.y)**2;return d<b.d?{i,d}:b},{i:0,d:Infinity}).i;
const owners=new Map(mains.map((c,i)=>[c.label,i]));
for(const c of components)if(!owners.has(c.label))owners.set(c.label,nearest(c.x,c.y));
let baseHeight;
for(let i=0;i<6;i++){
 let minX=info.width,minY=info.height,maxX=0,maxY=0,count=0;
 const pixels=Buffer.from(data);
 for(let p=0;p<labels.length;p++){const x=p%info.width,y=Math.floor(p/info.width),owner=labels[p]?owners.get(labels[p]):nearest(x,y);if(owner!==i){pixels[p*4+3]=0;continue;}if(pixels[p*4+3]>=60){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}}
 if(!count)throw Error('Empty pose '+i);
 if(minX<1||minY<1||maxX>=info.width-1||maxY>=info.height-1)throw Error('Pose touches sheet edge '+i);
 const left=Math.max(0,minX-8),top=Math.max(0,minY-8),width=Math.min(info.width-1,maxX+8)-left+1,height=Math.min(info.height-1,maxY+8)-top+1;
 const name=`${id}-b2-${i}.webp`;
 await sharp(pixels,{raw:{width:info.width,height:info.height,channels:4}}).extract({left,top,width,height}).webp({quality:92}).toFile('public/assets/actors/'+name);
 const a=anchors[i];
 poses.push({src:'/assets/actors/'+name,width,height,anchor:{x:Math.round(a[0]-left),y:Math.round(a[1]-top)}});
 if(i===0)baseHeight=anchors[0][1]-minY;
}
const metadata={id,baseHeight,poses,portrait:`/assets/roster-b2/${id}.webp`,small:`/assets/roster-b2/${id}-small.webp`,tool:'built-in image_gen'};
await fs.writeFile(path.join(doc,'actor.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(metadata));
