const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const root = __dirname;
function alphaStats(data, width, height) {
  let zero=0, partial=0, opaque=0, left=width, top=height, right=-1, bottom=-1;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const a=data[(y*width+x)*4+3];
    if(a===0) zero++; else { if(a===255) opaque++; else partial++; if(a>8){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);} }
  }
  const visited=new Uint8Array(width*height), components=[];
  for(let start=0;start<width*height;start++) {
    if(visited[start]||data[start*4+3]<=64)continue;
    const queue=[start];visited[start]=1;let count=0,l=width,t=height,r=0,b=0;
    for(let j=0;j<queue.length;j++) {
      const k=queue[j],x=k%width,y=Math.floor(k/width);count++;l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);
      for(const nk of [x? k-1:-1,x<width-1?k+1:-1,y?k-width:-1,y<height-1?k+width:-1]) {
        if(nk<0||visited[nk]||data[nk*4+3]<=64)continue;visited[nk]=1;queue.push(nk);
      }
    }
    if(count>=30)components.push({pixels:count,left:l,top:t,width:r-l+1,height:b-t+1});
  }
  components.sort((a,b)=>b.pixels-a.pixels);
  return {zero,partial,opaque,transparentFraction:zero/(width*height),bounds:{left,top,width:right-left+1,height:bottom-top+1},components};
}
(async () => {
 const manifest={title:'Gokart action subject layers',method:'Built-in imagegen background-extraction edit. Sharp used only for regular cell extraction, RGBA WebP encoding and alpha inspection.',sheets:[]};
 for(const [name,columns,rows] of [['drift',3,4],['rush',2,4]]) {
  const source=path.join(root,`${name}-original.png`),meta=await sharp(source).metadata();
  const sheet={name,source:`${name}-original.png`,prompt:`${name}-prompt.txt`,width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha,columns,rows,frames:[]};
  for(let index=0;index<columns*rows;index++) {
   const col=index%columns,row=Math.floor(index/columns),left=Math.round(col*meta.width/columns),top=Math.round(row*meta.height/rows),width=Math.round((col+1)*meta.width/columns)-left,height=Math.round((row+1)*meta.height/rows)-top;
   const rectangle={left,top,width,height},file=`${name}-${String(index+1).padStart(2,'0')}.webp`;
   const rgba=await sharp(source).extract(rectangle).ensureAlpha().raw().toBuffer();
   const alpha=alphaStats(rgba,width,height);
   await sharp(source).extract(rectangle).webp({quality:92,alphaQuality:100,effort:4}).toFile(path.join(root,file));
   sheet.frames.push({index:index+1,file,width,height,sourceRect:rectangle,bytes:fs.statSync(path.join(root,file)).size,alpha});
  }
  manifest.sheets.push(sheet);
 }
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify(manifest.sheets.map(s=>({name:s.name,width:s.width,height:s.height,hasAlpha:s.hasAlpha,frames:s.frames.map(f=>({index:f.index,transparentFraction:f.alpha.transparentFraction,components:f.alpha.components})),bytes:s.frames.reduce((n,f)=>n+f.bytes,0)})),null,2));
})();
