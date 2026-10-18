// Emit separate apply_patch diffs. The owner applies reviewed metadata only.
import {readFileSync} from 'node:fs';
const file='src/data/actor-cast.json',raw=readFileSync(file,'utf8'),cast=JSON.parse(raw),ids=process.argv.slice(2);
if(!ids.length)throw Error('Pass reviewed actor IDs');
const patches=ids.map(id=>{const m=JSON.parse(readFileSync(`docs/art/roster-second-batch/${id}/actor.json`,'utf8'));if(m.poses.length!==6)throw Error('Six runtime pose slots required');const updated=JSON.stringify({[id]:{baseHeight:m.baseHeight,poses:m.poses}},null,2).split('\n').slice(1,-1).join('\n')+',';let hunk;
 if(cast[id]){const old=JSON.stringify({[id]:cast[id]},null,2).split('\n').slice(1,-1).join('\n')+',';if(!raw.includes(old))throw Error('Cast context mismatch');hunk=old.split('\n').map(l=>'-'+l).join('\n')+'\n'+updated.split('\n').map(l=>'+'+l).join('\n');}else hunk=' {\n'+updated.split('\n').map(l=>'+'+l).join('\n');
 return `*** Begin Patch\n*** Update File: ${process.cwd()}/${file}\n@@\n${hunk}\n*** End Patch\n`;
});process.stdout.write(JSON.stringify(patches));
