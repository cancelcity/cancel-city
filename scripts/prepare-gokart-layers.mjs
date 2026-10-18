// Mechanical separation of complete, disconnected sprites in generated alpha
// sheets. Overlapping/merged sprites are excluded instead of reconstructing art.
import {createRequire} from 'node:module';
import path from 'node:path';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const runtime=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json')),sharp=runtime('sharp');
const root='docs/art/gokart-layered';
const sources=[
 {id:'reveal',folder:'intro',key:'735ce53c-fa2e-4d4d-b86b-12a3851d2e0a',cols:2,rows:4},
 {id:'drift',folder:'action',key:'e56c6748-ea62-497c-89c5-6364ede31d14',cols:3,rows:4},
 {id:'rush',folder:'action',key:'802c818e-0157-4467-99d8-4dfcf21a36a8',cols:2,rows:4},
 {id:'impact',folder:'impact',key:'f18c7d7a-689e-4aca-813b-c8fc64d96cb6',cols:2,rows:4},
 {id:'ending',folder:'ending',key:'d6fe5792-2d51-42cb-82ab-96917c81dde4',cols:2,rows:4},
];
const film=JSON.parse(await readFile('src/data/gokart-film.json','utf8')),report=[];
for(const source of sources){const dir=`${root}/${source.folder}`;await mkdir(dir,{recursive:true});const original=`${dir}/${source.id}-alpha-source.png`;
 try{await readFile(original);}catch{await copyFile(`/workspace/scratch/80a8c8c1affe/generated_images/exec-${source.key}.png`,original);}
 const {data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width:W,height:H}=info,N=W*H,labels=new Int32Array(N),queue=new Int32Array(N);let label=0;const components=[];
 for(let seed=0;seed<N;seed++){if(labels[seed]||data[seed*4+3]<=24)continue;label++;let head=0,tail=0;queue[tail++]=seed;labels[seed]=label;let x0=W,y0=H,x1=0,y1=0;
  while(head<tail){const p=queue[head++],x=p%W,y=Math.floor(p/W);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=W||yy<0||yy>=H)continue;const j=yy*W+xx;if(!labels[j]&&data[j*4+3]>24){labels[j]=label;queue[tail++]=j;}}}
  if(tail>15000&&y1-y0+1<H/source.rows*1.5){const row=Math.min(source.rows-1,Math.floor(((y0+y1)/2)/H*source.rows)),col=Math.min(source.cols-1,Math.floor(((x0+x1)/2)/W*source.cols));if(source.id==='drift'&&row===2&&col===2)continue;components.push({label,area:tail,x0,y0,x1,y1,row,col});}
 }
 components.sort((a,b)=>a.row-b.row||a.col-b.col);const frames=[];
 for(let i=0;i<components.length;i++){const b=components[i],x0=Math.max(0,b.x0-2),y0=Math.max(0,b.y0-2),w=Math.min(W,b.x1+3)-x0,h=Math.min(H,b.y1+3)-y0,pixels=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xx=x+x0,yy=y+y0,p=yy*W+xx;let keep=labels[p]===b.label;if(!keep&&data[p*4+3]<=24){for(let dy=-1;dy<=1&&!keep;dy++)for(let dx=-1;dx<=1;dx++){const nx=xx+dx,ny=yy+dy;if(nx>=0&&nx<W&&ny>=0&&ny<H&&labels[ny*W+nx]===b.label){keep=true;break;}}}if(keep)for(let k=0;k<4;k++)pixels[(y*w+x)*4+k]=data[p*4+k];}
  const file=`${dir}/${source.id}-clean-${String(i).padStart(2,'0')}.webp`;await sharp(pixels,{raw:{width:w,height:h,channels:4}}).webp({quality:94}).toFile(file);frames.push({file,sourceBounds:{x:x0,y:y0,w,h},component:b});
 }
 if(!frames.length)throw Error(`No complete actors for ${source.id}`);film.shots.find(s=>s.id===source.id).drawings=frames.map(f=>f.file);report.push({shot:source.id,source:original,frames,method:'Original RGBA component isolation and rectangular crop; merged/overlapping subjects excluded; no invented pixels or redraw'});console.log(`${source.id}: ${frames.length} complete alpha actors`);
}
await writeFile(`${root}/component-extraction.json`,JSON.stringify(report,null,2));await writeFile('src/data/gokart-film.json',JSON.stringify(film,null,2)+'\n');
