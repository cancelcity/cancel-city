// Mechanical atlas region detection only; never repaints or removes generated alpha.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
const runtime=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const sharp=runtime('sharp');
const input='public/assets/karen/rig.png';
const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const x=[0,320,630,960,1254].map(v=>Math.round(v/1254*info.width));
const y=[0,330,625,915,1254].map(v=>Math.round(v/1254*info.height));
const frames=[];
for(let row=0;row<4;row++)for(let col=0;col<4;col++){
 let left=x[col+1],top=y[row+1],right=x[col],bottom=y[row];
 for(let yy=y[row];yy<y[row+1];yy++)for(let xx=x[col];xx<x[col+1];xx++)if(data[(yy*info.width+xx)*4+3]>160){left=Math.min(left,xx);top=Math.min(top,yy);right=Math.max(right,xx);bottom=Math.max(bottom,yy);}
 if(right<=left||bottom<=top)throw new Error('Empty rig region');
 frames.push([left,top,right-left+1,bottom-top+1]);
}
await writeFile('src/data/karen-rig.json',JSON.stringify({width:info.width,height:info.height,frames},null,2)+'\n');
console.log(JSON.stringify({atlas:input,width:info.width,height:info.height,parts:frames.length}));
const cashier=await sharp('public/assets/karen/cashier.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const cashierFrames=[];
for(let row=0;row<2;row++)for(let col=0;col<2;col++){
 const w=cashier.info.width,h=cashier.info.height,x0=Math.round(col*w/2),x1=Math.round((col+1)*w/2),y0=Math.round(row*h/2),y1=Math.round((row+1)*h/2);
 let l=x1,r=x0,t=y1,b=y0;
 for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)if(cashier.data[(yy*w+xx)*4+3]>160){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);}
 cashierFrames.push([l,t,r-l+1,b-t+1]);
}
await writeFile('src/data/karen-cashier.json',JSON.stringify({frames:cashierFrames},null,2)+'\n');
await sharp('public/assets/karen/office.png').resize(1280,720,{fit:'fill'}).webp({quality:88}).toFile('public/assets/karen/office.webp');
