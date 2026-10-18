/* Technical derivatives: isolate generated alpha contours without repainting. */
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const root = path.resolve(__dirname, '../../..');
const names = ['idle', 'wind-up', 'strike', 'victory', 'flinch', 'embarrassed'];
function bounds(data, W, H, threshold=16) {
  let left=W,top=H,right=-1,bottom=-1,transparentPixels=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const a=data[(y*W+x)*4+3]; if(!a)transparentPixels++;
    if(a<threshold)continue;
    left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  return {left,top,right,bottom,transparentPixels};
}
async function prepare(id,name){
  const {data,info}=await sharp(path.join(__dirname,id+'-poses.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const W=info.width,H=info.height,N=W*H,seen=new Uint8Array(N),labels=new Int32Array(N),queue=new Int32Array(N),groups=[];
  let label=0;
  for(let at=0;at<N;at++){
    if(seen[at]||data[at*4+3]<8)continue;
    label++;let head=0,tail=0,left=W,right=-1,top=H,bottom=-1,sumX=0,sumY=0;
    queue[tail++]=at;seen[at]=1;
    while(head<tail){
      const i=queue[head++],x=i%W,y=Math.floor(i/W);labels[i]=label;
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);sumX+=x;sumY+=y;
      for(const n of [i-1,i+1,i-W,i+W]){
        if(n<0||n>=N||seen[n]||data[n*4+3]<8||Math.abs(n%W-x)>1)continue;
        seen[n]=1;queue[tail++]=n;
      }
    }
    groups[label]={label,count:tail,left,right,top,bottom,cx:sumX/tail,cy:sumY/tail};
  }
  const mains=groups.filter(Boolean).sort((a,b)=>b.count-a.count).slice(0,6);
  const assigned=new Set();
  for(const g of mains){g.index=(g.cy<H/2?0:3)+Math.min(2,Math.floor(g.cx/(W/3)));assigned.add(g.index);}
  if(assigned.size!==6)throw new Error(id+' six major silhouettes not distinct');
  for(const g of groups.filter(Boolean)){
    if(g.index!==undefined)continue;
    const distance=m=>Math.max(0,m.left-g.right,g.left-m.right)**2+Math.max(0,m.top-g.bottom,g.top-m.bottom)**2;
    g.index=mains.reduce((best,m)=>distance(m)<distance(best)?m:best).index;
  }
  const poses=[];
  for(let index=0;index<6;index++){
    const keep=new Uint8Array(N),rgba=Buffer.alloc(N*4);
    for(let at=0;at<N;at++){
      if(groups[labels[at]]?.index!==index)continue;
      const x=at%W,y=Math.floor(at/W);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const nx=x+dx,ny=y+dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H)keep[ny*W+nx]=1;
      }
    }
    for(let at=0;at<N;at++)if(keep[at])data.copy(rgba,at*4,at*4,at*4+4);
    const b=bounds(rgba,W,H,1),crop={left:Math.max(0,b.left-1),top:Math.max(0,b.top-1),width:0,height:0};
    crop.width=Math.min(W,b.right+2)-crop.left;crop.height=Math.min(H,b.bottom+2)-crop.top;
    const scale=.78,width=Math.round(crop.width*scale),height=Math.round(crop.height*scale);
    if(width>480||height>435)throw new Error(id+':'+index+' exceeds safe frame');
    const actor=await sharp(rgba,{raw:{width:W,height:H,channels:4}}).extract(crop).resize(width,height).png().toBuffer();
    const dest=path.join(root,'public/assets/actors',id+'-'+index+'.webp');
    await sharp({create:{width:512,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
      .composite([{input:actor,left:Math.round((512-width)/2),top:462-height}]).webp({quality:80}).toFile(dest);
    const decoded=await sharp(dest).ensureAlpha().raw().toBuffer({resolveWithObject:true}),mb=bounds(decoded.data,512,512);
    poses.push({index,name:names[index],path:'/assets/actors/'+id+'-'+index+'.webp',width:512,height:512,
      suggestedAnchor:{x:256,y:mb.bottom},alphaBounds:{left:mb.left,top:mb.top,right:mb.right,bottom:mb.bottom},
      transparentPixels:mb.transparentPixels,sourceBodyCrop:crop});
  }
  const portrait=path.join(__dirname,id+'-portrait.png');
  await sharp(portrait).resize(1024,1024).webp({quality:80}).toFile(path.join(root,'public/assets/residents',id+'.webp'));
  await sharp(portrait).resize(320,320).webp({quality:78}).toFile(path.join(root,'public/assets/residents',id+'-small.webp'));
  await fs.copyFile(path.join(root,'public/assets/actors',id+'-2.webp'),path.join(root,'public/assets/specials',id+'.webp'));
  await fs.writeFile(path.join(__dirname,id+'.json'),JSON.stringify({characterId:id,characterName:name,generatedWith:'built-in image_gen',
    source:{path:'docs/art/wave-four/'+id+'-poses.png',width:W,height:H},sourceGrid:{columns:3,rows:2},
    preparation:'Six disconnected alpha silhouettes isolated using connected contours at alpha>=8. Small disconnected details assigned to nearest main silhouette bounds; one-pixel allowance retains original antialiasing RGBA. No repainting. Uniform0.78 resize and 512-square transparent ground alignment at462. Final pixel bounds measured alpha>=16.',poses},null,2)+'\n');
  return poses;
}
(async()=>{
  const all=[...await prepare('CC051','Oscar Goblin'),...await prepare('CC052','Sentence Is Just a Number'),...await prepare('CC053','Island Guide')];
  const comps=[];
  for(let i=0;i<all.length;i++)comps.push({input:await sharp(path.join(root,'public',all[i].path)).resize(256,256).png().toBuffer(),left:i%6*256,top:Math.floor(i/6)*256});
  await sharp({create:{width:1536,height:768,channels:3,background:'#eeeeee'}}).composite(comps).png().toFile(path.join(__dirname,'CC051-CC053-review.png'));
  process.stdout.write(JSON.stringify(all.map(p=>({path:p.path,bounds:p.alphaBounds,anchor:p.suggestedAnchor})),null,2)+'\n');
})().catch(e=>{process.stderr.write(e.stack+'\n');process.exitCode=1;});
