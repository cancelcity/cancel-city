/* Asset preparation only: node extract-acting-sprites.cjs CC043 'Name' /abs/master.png
   Keeps original master, routes disconnected props and alpha fringe to nearest actor,
   and writes six full-body 512-square WebP frames and runtime anchor metadata. */
const fs=require('fs');
const sharp=require('sharp');
const [id,name,source]=process.argv.slice(2);
if(!id||!name||!source)throw Error('Expected ID, name, source PNG');
function bounds(data,info,min=32){let left=info.width,top=info.height,right=0,bottom=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>min){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);}return{left,top,right,bottom};}
(async()=>{
fs.mkdirSync('docs/art/wave-three',{recursive:true});fs.mkdirSync('public/assets/actors',{recursive:true});
const master='docs/art/wave-three/'+id+'-poses.png';if(source!==master)fs.copyFileSync(source,master);
const{data,info}=await sharp(master).ensureAlpha().raw().toBuffer({resolveWithObject:true}),W=info.width,H=info.height,N=W*H,labels=new Int32Array(N),queue=new Int32Array(N),components=[];
const neighbours=p=>{const x=p%W,y=Math.floor(p/W);return[x?p-1:-1,x<W-1?p+1:-1,y?p-W:-1,y<H-1?p+W:-1];};
let next=0;
for(let p=0;p<N;p++){if(labels[p]||data[p*4+3]<=32)continue;next++;let head=0,tail=0,cx=0,cy=0;queue[tail++]=p;labels[p]=next;while(head<tail){let q=queue[head++],x=q%W,y=Math.floor(q/W);cx+=x;cy+=y;for(const n of neighbours(q))if(n>=0&&!labels[n]&&data[n*4+3]>32){labels[n]=next;queue[tail++]=n;}}components.push({label:next,size:tail,x:cx/tail,y:cy/tail});}
const bodies=components.slice().sort((a,b)=>b.size-a.size).slice(0,6).sort((a,b)=>a.y-b.y);
if(bodies.length!==6||bodies.some(c=>c.size<5000))throw Error('Could not identify six substantial actor bodies');
const main=[...bodies.slice(0,3).sort((a,b)=>a.x-b.x),...bodies.slice(3).sort((a,b)=>a.x-b.x)];
const mainMap=new Map(main.map((c,i)=>[c.label,i]));
let routing=new Int8Array(N);routing.fill(-1);let head=0,tail=0;
for(let p=0;p<N;p++)if(mainMap.has(labels[p])){routing[p]=mainMap.get(labels[p]);queue[tail++]=p;}
while(head<tail){const p=queue[head++];for(const n of neighbours(p))if(n>=0&&routing[n]<0){routing[n]=routing[p];queue[tail++]=n;}}
// Keep each disconnected receipt, sweat mark or prop together rather than splitting it.
const votes=Array.from({length:next+1},()=>new Uint32Array(6));for(let p=0;p<N;p++)if(labels[p])votes[labels[p]][routing[p]]++;
const componentRoute=new Int8Array(next+1);for(let l=1;l<=next;l++){let winner=0;for(let i=1;i<6;i++)if(votes[l][i]>votes[l][winner])winner=i;componentRoute[l]=mainMap.has(l)?mainMap.get(l):winner;}
routing=new Int8Array(N);routing.fill(-1);const distance=new Uint16Array(N);head=0;tail=0;
for(let p=0;p<N;p++)if(labels[p]){routing[p]=componentRoute[labels[p]];queue[tail++]=p;}
while(head<tail){const p=queue[head++];for(const n of neighbours(p))if(n>=0&&routing[n]<0){routing[n]=routing[p];distance[n]=distance[p]+1;queue[tail++]=n;}}
const poses=[];
for(let i=0;i<6;i++){
const isolated=Buffer.from(data);for(let p=0;p<N;p++)if(routing[p]!==i||(data[p*4+3]<=32&&distance[p]>8))isolated[p*4+3]=0;
const b=bounds(isolated,info,2),sourceExtraction={left:Math.max(0,b.left-4),top:Math.max(0,b.top-4),width:Math.min(W,b.right+4)-Math.max(0,b.left-4),height:Math.min(H,b.bottom+4)-Math.max(0,b.top-4)};
const scale=Math.min(.88,472/sourceExtraction.width,452/sourceExtraction.height),sw=Math.round(sourceExtraction.width*scale),sh=Math.round(sourceExtraction.height*scale);
const png=await sharp(isolated,{raw:{width:W,height:H,channels:4}}).extract(sourceExtraction).resize(sw,sh).png().toBuffer(),asset='public/assets/actors/'+id+'-'+i+'.webp';
await sharp({create:{width:512,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:png,left:Math.round((512-sw)/2),top:466-sh}]).webp({quality:90,alphaQuality:100}).toFile(asset);
const runtime=await sharp(asset).raw().toBuffer({resolveWithObject:true}),ab=bounds(runtime.data,runtime.info);let footLeft=512,footRight=0,zero=0;
for(let y=Math.max(ab.top,ab.bottom-36);y<ab.bottom;y++)for(let x=ab.left;x<ab.right;x++)if(runtime.data[(y*512+x)*4+3]>32){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x);}
for(let k=3;k<runtime.data.length;k+=4)if(runtime.data[k]===0)zero++;
poses.push({index:i,name:['idle','windup','strike','victory','flinch','gag'][i],width:512,height:512,asset:'/assets/actors/'+id+'-'+i+'.webp',sourceExtraction,scale,suggestedAnchor:{x:Math.round((footLeft+footRight)/2),y:ab.bottom-1},alphaBounds:ab,alpha:{hasAlpha:true,transparentPixels:zero,transparentFraction:zero/262144}});
}
fs.writeFileSync('docs/art/wave-three/'+id+'.json',JSON.stringify({characterId:id,characterName:name,master,grid:{columns:3,rows:2,width:W,height:H,order:'row-major',note:'Six largest alpha>32 connected bodies identify the six poses. Smaller prop components assigned whole to nearest actor. Original alpha retained near solid artwork, and disconnected distant faint fringe removed. Each full figure cropped, uniformly scaled, square padded. Source master unmodified.'},poses,anchorMethod:'Centre of solid lowest36px (shoe span for ordinary sprites); y at lowest alpha>32 art pixel.'},null,2)+'\n');
console.log(id+' six full-body alpha sprites saved',main.map(c=>({x:Math.round(c.x),y:Math.round(c.y),pixels:c.size})));
})().catch(e=>{console.error(e);process.exit(1)});
