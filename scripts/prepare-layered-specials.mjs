// Preserve original pixels. Separate disconnected intact actors by alpha label;
// never infer body pieces or crop to a grid that crosses another drawing.
import {createRequire} from 'node:module';
import path from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const runtime=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json')),sharp=runtime('sharp');
const films=JSON.parse(await readFile('src/data/layered-films.json','utf8'));
for(const film of films){
 if(process.argv.length>2&&!process.argv.slice(2).includes(film.slug))continue;
 const root=`docs/art/layered-specials/${film.slug}`,manifest=JSON.parse(await readFile(`${root}/manifest.json`,'utf8')),groups={};
 for(const sheet of manifest.sheets){
  const {data,info}=await sharp(sheet.path).ensureAlpha().raw().toBuffer({resolveWithObject:true}),W=info.width,H=info.height,N=W*H,labels=new Int32Array(N),queue=new Int32Array(N),components=[];
  let label=0,clear=0;for(let i=0;i<N;i++)if(data[i*4+3]<8)clear++;
  if(clear/N<.1)throw Error(`No usable transparency: ${sheet.path}`);
  for(let seed=0;seed<N;seed++){
   if(labels[seed]||data[seed*4+3]<48)continue;label++;let head=0,tail=0,x0=W,y0=H,x1=0,y1=0;queue[tail++]=seed;labels[seed]=label;
   while(head<tail){const p=queue[head++],x=p%W,y=Math.floor(p/W);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=yy*W+xx;if(!labels[j]&&data[j*4+3]>=48){labels[j]=label;queue[tail++]=j;}}
   }
   if(tail>12000&&y1-y0<H/sheet.rows*1.5&&x1-x0<W/sheet.cols*1.8)components.push({label,area:tail,x0,y0,x1,y1,row:Math.floor((y0+y1)/2/H*sheet.rows)});
  }
  components.sort((a,b)=>a.row-b.row||a.x0-b.x0);
  const complete=components.filter((b,i)=>!(sheet.excludePoseIndices??[]).includes(i+1)&&b.x0>0&&b.y0>0&&b.x1<W-1&&b.y1<H-1);
  if(complete.length<6)throw Error(`Too few complete drawings in ${sheet.path}: ${complete.length}`);
  const frames=[];await mkdir(`${root}/actors`,{recursive:true});
  for(let index=0;index<complete.length;index++){
   const b=complete[index],x0=Math.max(0,b.x0-2),y0=Math.max(0,b.y0-2),w=Math.min(W,b.x1+3)-x0,h=Math.min(H,b.y1+3)-y0,pixels=Buffer.alloc(w*h*4);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const xx=x+x0,yy=y+y0,p=yy*W+xx;let keep=labels[p]===b.label;
    if(!keep&&data[p*4+3]<48)for(let dy=-1;dy<=1&&!keep;dy++)for(let dx=-1;dx<=1;dx++){const nx=xx+dx,ny=yy+dy;if(nx>=0&&ny>=0&&nx<W&&ny<H&&labels[ny*W+nx]===b.label){keep=true;break;}}
    if(keep)for(let k=0;k<4;k++)pixels[(y*w+x)*4+k]=data[p*4+k];
   }
   const file=`${root}/actors/${sheet.role}-${String(index).padStart(2,'0')}.webp`;await sharp(pixels,{raw:{width:w,height:h,channels:4}}).webp({quality:94}).toFile(file);
   frames.push({file,width:w,height:h,sourceBounds:{x:x0,y:y0,w,h},area:b.area});
  }
  groups[sheet.role]=frames;console.log(`${film.slug}/${sheet.role}: ${frames.length} intact actors`);
 }
 const background=`${root}/background.webp`;await sharp(manifest.background.path).removeAlpha().webp({quality:95}).toFile(background);
 const props={};for(const [name,source] of Object.entries(manifest.props??{})){const file=`${root}/${name}-prop.webp`;await sharp(source).trim({background:'#00000000',threshold:8}).webp({quality:95}).toFile(file);props[name]=file;}
 await writeFile(`${root}/render-input.json`,JSON.stringify({background,groups,props,method:'RGBA connected component isolation; original pixels retained, no limb rig or redraw'},null,2));
}
