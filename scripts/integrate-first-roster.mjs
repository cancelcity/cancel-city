// Print an apply_patch diff; the caller applies it after art review sign-off.
import {readFileSync,existsSync} from 'node:fs';
const target='src/data/actor-cast.json',raw=readFileSync(target,'utf8'),cast=JSON.parse(raw);
const ids=['CC001','CC002','CC006','CC007','CC012','CC013','CC014','CC016','CC018','CC023','CC058','CC135'];
let diff='*** Begin Patch\n*** Update File: '+process.cwd()+'/'+target+'\n';
for(const id of ids){
 const folder=`docs/art/roster-first-batch/${id}`,file=existsSync(`${folder}/metadata.json`)?`${folder}/metadata.json`:`${folder}/actor.json`,m=JSON.parse(readFileSync(file,'utf8'));
 const old=JSON.stringify({[id]:cast[id]},null,2).split('\n').slice(1,-1).join('\n')+',';
 const updated=JSON.stringify({[id]:{baseHeight:m.baseHeight,poses:m.poses}},null,2).split('\n').slice(1,-1).join('\n')+',';
 if(!cast[id]){diff+='@@\n {\n'+updated.split('\n').map(l=>'+'+l).join('\n')+'\n';continue;}
 if(!raw.includes(old))throw Error(`Old cast block not found: ${id}`);
 diff+='@@\n'+old.split('\n').map(l=>'-'+l).join('\n')+'\n'+updated.split('\n').map(l=>'+'+l).join('\n')+'\n';
}
process.stdout.write(diff+'*** End Patch\n');
