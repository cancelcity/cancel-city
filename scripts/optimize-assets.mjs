import {createRequire} from 'node:module';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const nextRequire=createRequire(require.resolve('next/package.json'));
const sharp=nextRequire('sharp');
const cards=JSON.parse(await readFile(path.join(root,'src/data/catalogue.json'),'utf8'));
const source=path.join(root,'docs/art/residents');
const destination=path.join(root,'public/assets/residents');
await mkdir(destination,{recursive:true});
const records=[];
for(const card of cards){
 const input=path.join(source,`${card.id}.png`),data=await readFile(input);
 const metadata=await sharp(data).metadata();
 if(metadata.width!==1254||metadata.height!==1254)throw new Error(`Invalid source portrait: ${card.id}`);
 const derivatives=[];
 for(const [suffix,width] of [['-small',384],['',1024]]){
  const filename=`${card.id}${suffix}.webp`,output=path.join(destination,filename);
  await sharp(data).resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(output);
  derivatives.push({file:`public/assets/residents/${filename}`,width,bytes:(await stat(output)).size});
 }
 records.push({id:card.id,source:`docs/art/residents/${card.id}.png`,sourceSha256:createHash('sha256').update(data).digest('hex'),sourceBytes:data.length,derivatives});
}
const background=path.join(root,'docs/art/city-backdrop.png');
await sharp(background).resize({width:1920,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(path.join(root,'public/assets/reference/city-backdrop.webp'));
await sharp(path.join(root,'docs/art/title-logo.png')).resize({width:1000,withoutEnlargement:true}).webp({lossless:true,effort:5}).toFile(path.join(root,'public/assets/reference/title-logo.webp'));
await writeFile(path.join(root,'docs/art/asset-processing.json'),JSON.stringify({encoding:'WebP',quality:82,creativeChanges:false,records},null,2)+'\n');
console.log(JSON.stringify({portraits:records.length,runtimePortraitBytes:records.flatMap(r=>r.derivatives).reduce((n,d)=>n+d.bytes,0),sourcePortraitBytes:records.reduce((n,r)=>n+r.sourceBytes,0)}));
