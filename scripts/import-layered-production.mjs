import {access,cp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const briefs=JSON.parse(await readFile('docs/production/next-twenty-storyboards.json','utf8')).cards;
const file='src/data/layered-films.json',films=JSON.parse(await readFile(file,'utf8'));
const shots=['close','reveal','launch','impact','return','gag'];
for(const slug of process.argv.slice(2)){
 const spec=briefs.find(s=>s.slug===slug);if(!spec)throw Error(`Unknown production brief: ${slug}`);
 if(films.some(f=>f.slug===slug))throw Error(`Already imported: ${slug}`);
 const stage=path.resolve('../asset-stage',slug),destination=`docs/art/layered-specials/${slug}`;
 const manifest=JSON.parse(await readFile(path.join(stage,'manifest.json'),'utf8'));
 if(manifest.sheets.length<2)throw Error(`Incomplete actor set: ${slug}`);
 for(const name of [...manifest.sheets.map(s=>s.path),manifest.background.path]){
  if(!name.startsWith(`${destination}/`))throw Error(`Wrong final asset path: ${name}`);
  await access(path.join(stage,name.slice(destination.length+1)));
 }
 try{await access(destination);throw Error(`Destination already exists: ${destination}`);}catch(error){if(error.code!=='ENOENT')throw error;}
 await cp(stage,destination,{recursive:true,errorOnExist:true,force:false});
 films.push({cardId:spec.cardId,slug,title:spec.title,tagline:spec.tagline,duration:spec.duration,impact:spec.impact,video:`/assets/layered-specials/${slug}-v1/special.mp4`,poster:`/assets/layered-specials/${slug}-v1/poster.webp`,captions:`/assets/layered-specials/${slug}-v1/captions.vtt`,shots:shots.map((id,i)=>({id,title:spec.titles[i],start:i?spec.ends[i-1]:0,end:spec.ends[i],thumbnail:`/assets/layered-specials/${slug}-v1/${id}.webp`,description:spec.descriptions[i]}))});
 console.log(`Imported complete art: ${spec.cardId} / ${slug}`);
}
await writeFile(file,JSON.stringify(films,null,2)+'\n');
