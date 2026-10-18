// Technical delivery derivatives only; selected artwork and generated masters stay intact.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),sharp=createRequire(require.resolve('next/package.json'))('sharp');
const records=[];
for(let n=1;n<=66;n++){
 const id=`CC${String(n).padStart(3,'0')}`,file=`public/assets/residents/${id}.webp`,data=await readFile(file),meta=await sharp(data).metadata();
 if(meta.width!==896)await sharp(data).resize(896,896,{fit:'cover'}).webp({quality:78,effort:5}).toFile(file);
 records.push({id,inputSha256:createHash('sha256').update(data).digest('hex'),inputWidth:meta.width,runtimeWidth:896,beforeBytes:data.length,afterBytes:(await stat(file)).size});
}
await mkdir('docs/art/wave-four',{recursive:true});
await writeFile('docs/art/wave-four/runtime-portrait-encoding.json',JSON.stringify({mode:'Proportional resize and WebP delivery encoding of selected portraits. No creative edits. All original generated masters retained.',records},null,2)+'\n');
console.log(JSON.stringify({portraits:records.length,beforeBytes:records.reduce((n,r)=>n+r.beforeBytes,0),afterBytes:records.reduce((n,r)=>n+r.afterBytes,0)}));
