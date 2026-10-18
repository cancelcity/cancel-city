const fs=require('fs');
const sharp=require('sharp');
async function processOne(r){
 const folder=`docs/art/roster-second-batch/${r.id}`;fs.mkdirSync(folder,{recursive:true});fs.mkdirSync('public/assets/actors',{recursive:true});
 fs.copyFileSync(r.source,`${folder}/poses-original.png`);fs.writeFileSync(`${folder}/pose-prompt.txt`,r.prompt+'\n\nLayout repair:\n'+(r.fixPrompt||''));
 const meta=await sharp(r.source).metadata();if(!meta.hasAlpha)throw Error('alpha missing '+r.id);
 const cw=meta.width/3,ch=meta.height/2,poses=[];
 for(let i=0;i<6;i++){
  const x=(i%3)*cw,y=Math.floor(i/3)*ch;
  const cell=sharp(r.source).extract({left:x,top:y,width:cw,height:ch});
  const {data,info}=await cell.clone().ensureAlpha().raw().toBuffer({resolveWithObject:true});let l=cw,t=ch,rr=-1,b=-1;
  for(let py=0;py<ch;py++)for(let px=0;px<cw;px++)if(data[(py*cw+px)*info.channels+3]>18){l=Math.min(l,px);t=Math.min(t,py);rr=Math.max(rr,px);b=Math.max(b,py)}
  if(rr<0)throw Error('empty cell');if(l<8||rr>cw-9||t<8||b>ch-9)console.warn('tight cell',r.id,i,{l,t,rr,b});
  l=Math.max(0,l-4);t=Math.max(0,t-4);rr=Math.min(cw-1,rr+4);b=Math.min(ch-1,b+4);
  const width=rr-l+1,height=b-t+1,src=`/assets/actors/${r.id}-b2-${i}.webp`;
  await cell.clone().extract({left:l,top:t,width,height}).webp({quality:92,alphaQuality:100}).toFile('public'+src);
  const foot=r.feet[i];poses.push({src,width,height,anchor:{x:foot[0]-x-l,y:foot[1]-y-t}});
 }
 const actor={baseHeight:r.baseHeight,poses};fs.writeFileSync(`${folder}/actor.json`,JSON.stringify(actor,null,2)+'\n');console.log(r.id,JSON.stringify(actor));
}
const input=JSON.parse(fs.readFileSync(process.argv[2]));(async()=>{for(const r of input)await processOne(r)})().catch(e=>{console.error(e);process.exit(1)});
