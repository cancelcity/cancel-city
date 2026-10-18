import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const [id, original, promptPath] = process.argv.slice(2);
if (!/^CC\d{3}$/.test(id) || !original || !promptPath) throw Error('Expected ID, original PNG, prompt text');
const root = process.cwd();
const doc = path.join(root, 'docs/art/roster-first-batch', id);
await fs.mkdir(doc, { recursive: true });
await fs.mkdir(path.join(root, 'public/assets/roster-v2'), { recursive: true });
await fs.copyFile(original, path.join(doc, 'original-sheet.png'));
const {width, height} = await sharp(original).metadata();
const cellWidth = Math.floor(width / 3), cellHeight = Math.floor(height / 2);
const {data:sheet}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const labels=new Uint32Array(width*height), components=[];
for(let p=0;p<labels.length;p++){
 if(labels[p]||sheet[p*4+3]<60)continue;
 const label=components.length+1,queue=[p];labels[p]=label;
 let minX=width,maxX=0,minY=height,maxY=0;
 for(let q=0;q<queue.length;q++){const i=queue[q],x=i%width,y=Math.floor(i/width);minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,k=yy*width+xx;if(xx<0||xx>=width||yy<0||yy>=height||labels[k]||sheet[k*4+3]<60)continue;labels[k]=label;queue.push(k);}}
 components.push({label,n:queue.length,minX,maxX,minY,maxY});
}
const mains=components.toSorted((a,b)=>b.n-a.n).slice(0,6).map(c=>({...c,x:(c.minX+c.maxX)/2,y:(c.minY+c.maxY)/2})).sort((a,b)=>Math.floor(a.y/cellHeight)-Math.floor(b.y/cellHeight)||a.x-b.x);
const owners=new Map(mains.map((c,i)=>[c.label,i]));
const nearest=(x,y)=>mains.reduce((best,c,i)=>{const distance=(x-c.x)**2+(y-c.y)**2;return distance<best.distance?{i,distance}:best},{i:0,distance:Infinity}).i;
for(const c of components)if(!owners.has(c.label))owners.set(c.label,nearest((c.minX+c.maxX)/2,(c.minY+c.maxY)/2));
const poses = [];
// Authored ground contact centres in the original sheet, reviewed visually.
// Signature props can make a silhouette much wider than the person; anchoring
// to the prop bounding box would make the character slide between poses.
const footCentres={CC012:[246,726,1290,215,745,1215],CC013:[294,750,1290,239,765,1265],CC014:[309,790,1315,315,775,1260],CC016:[350,770,1230,305,775,1245]};
let neutral;
let baseHeight;
for (let index = 0; index < 6; index++) {
  // Extract actual connected full figures, not arbitrary grid boundaries.
  // This is mechanical alpha segmentation; no repainting or limb separation.
  const pixels=Buffer.from(sheet);let left=width,right=0,top=height,bottom=0;
  for(let p=0;p<labels.length;p++){const x=p%width,y=Math.floor(p/width),owner=labels[p]?owners.get(labels[p]):nearest(x,y);if(owner!==index){pixels[p*4+3]=0;continue;}if(pixels[p*4+3]>30){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
  left=Math.max(0,left-8);top=Math.max(0,top-8);right=Math.min(width-1,right+8);bottom=Math.min(height-1,bottom+8);
  const cell=await sharp(pixels,{raw:{width,height,channels:4}}).extract({left,top,width:right-left+1,height:bottom-top+1}).png().toBuffer();
  const {data,info} = await sharp(cell).raw().toBuffer({resolveWithObject:true});
  let minX=info.width,minY=info.height,maxX=0,maxY=0,count=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) if(data[(y*info.width+x)*4+3]>30){ minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);count++; }
  if(!count) throw Error(`Empty cell ${index}`);
  if(minX<2||minY<2||maxX>info.width-3||maxY>info.height-3) console.warn(`${id} cell ${index}: edge-touch QA warning`);
  const name=`${id}-roster-v2-${index}.webp`;
  await sharp(cell).webp({quality:92}).toFile(path.join(root,'public/assets/actors',name));
  poses.push({src:`/assets/actors/${name}`,width:info.width,height:info.height,anchor:{x:footCentres[id]?.[index]-left||Math.round((minX+maxX)/2),y:maxY+1},bounds:{minX,minY,maxX,maxY},alphaPixels:count});
  if(index===0){baseHeight=maxY-minY+1;neutral={cell,bounds:{minX,minY,maxX,maxY}};}
}
const n=neutral.bounds;
const pw=n.maxX-n.minX+1, ph=Math.max(1,Math.round((n.maxY-n.minY+1)*.69));
const head = await sharp(neutral.cell).extract({left:n.minX,top:n.minY,width:pw,height:ph}).resize(720,720,{fit:'contain',background:'#f3ead6'}).flatten({background:'#f3ead6'}).webp({quality:93}).toBuffer();
await fs.writeFile(path.join(root,'public/assets/roster-v2',`${id}.webp`),head);
const metadata={id,baseHeight,poses:poses.map(({bounds,alphaPixels,...p})=>p),portrait:`/assets/roster-v2/${id}.webp`,qa:poses.map(({bounds,alphaPixels})=>({bounds,alphaPixels})),tool:'built-in image_gen',prompt:await fs.readFile(promptPath,'utf8'),original:'original-sheet.png'};
await fs.writeFile(path.join(doc,'metadata.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify({id,metadata:path.join(doc,'metadata.json'),dimensions:{width,height},baseHeight,qa:metadata.qa}));
