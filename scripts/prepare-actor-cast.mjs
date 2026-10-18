import {readFile,writeFile,access,copyFile} from 'node:fs/promises';
const ids=['CC001','CC007','CC012','CC026','CC027','CC037','CC039','CC042',...Array.from({length:24},(_,i)=>`CC0${43+i}`)],cast={};
for(const id of ids){
 const metadata=JSON.parse(await readFile(Number(id.slice(2))>=51?`docs/art/wave-four/${id}.json`:['CC012','CC027'].includes(id)?`docs/art/meme-pass/${id}.json`:id==='CC026'?'docs/art/cinema/poses.json':Number(id.slice(2))>=42?`docs/art/wave-three/${id}.json`:`docs/art/live-motion/${id}.json`,'utf8'));
 // Karen's film sheet predates the common idle/windup/strike/win/hit/gag order.
 const order=id==='CC026'?[0,2,3,4,5,1]:[0,1,2,3,4,5];
 const poses=await Promise.all(order.map(async index=>{const p=metadata.poses.find(p=>p.index===index),src=id==='CC026'?`/assets/cinema/karen-pose-${index}.webp`:`/assets/actors/${id}-${index}.webp`;await access(`public${src}`);return {src,width:p.width??512,height:p.height??512,anchor:p.suggestedAnchor};}));
 const bounds=metadata.poses[0].alphaBounds;
 cast[id]={baseHeight:bounds.bottom-bounds.top,poses};
}
await writeFile('src/data/actor-cast.json',JSON.stringify(cast,null,2)+'\n');
await copyFile('scripts/cinema/fonts/LICENSE.txt','public/assets/actors/FONT-LICENSE.txt');
console.log(JSON.stringify({casts:ids,frames:ids.length*6}));
