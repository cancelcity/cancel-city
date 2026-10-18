const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
async function run(id, input, prompt) {
  const dir = path.join('docs/art/roster-first-batch', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync('public/assets/roster-v2', { recursive: true });
  fs.copyFileSync(input, path.join(dir, 'original-sheet.png'));
  fs.writeFileSync(path.join(dir, 'prompt.txt'), prompt + '\nBuilt-in image_gen; original alpha preserved. Mechanical equal-cell crops only.\n');
  const metadata = await sharp(input).metadata();
  const cw = Math.floor(metadata.width / 3), ch = Math.floor(metadata.height / 2);
  const poses = []; let baseHeight = 0;
  for (let index = 0; index < 6; index++) {
    const extra = index===2 && id==='CC001' ? 32 : 0;
    const ph=id==='CC006' && index===1 ? 502 : ch+extra;
    const crop = { left: (index % 3) * cw, top: Math.floor(index / 3) * ch, width: cw, height: ph };
    const { data, info } = await sharp(input).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let minY = ch, maxY = -1, minX = cw, maxX = -1;
    for (let y = 0; y < ph; y++) for (let x = 0; x < cw; x++) if (data[(y*cw+x)*4+3] > 200) { minY=Math.min(minY,y); maxY=Math.max(maxY,y); minX=Math.min(minX,x); maxX=Math.max(maxX,x); }
    if (maxY < 0) throw new Error(`Empty pose ${id}/${index}`);
    let sx = 0, count = 0;
    for (let y = Math.max(minY, maxY-15); y <= maxY; y++) for (let x = minX; x <= maxX; x++) if(data[(y*cw+x)*4+3] > 200) { sx += x; count++; }
    const anchor = { x: Math.round((minX+maxX)/2), y: maxY };
    baseHeight = Math.max(baseHeight, maxY-minY+1);
    const src = `/assets/actors/${id}-roster-v2-${index}.webp`;
    await sharp(input).extract(crop).webp({ quality: 93 }).toFile(`public${src}`);
    poses.push({src,width:cw,height:ph,anchor});
    if(index===0) await sharp(input).extract(crop).trim({threshold:8}).resize(700,700,{fit:'contain',background:'#f7edcf'}).flatten({background:'#f7edcf'}).webp({quality:94}).toFile(`public/assets/roster-v2/${id}.webp`);
  }
  const result = {id,portrait:`/assets/roster-v2/${id}.webp`,baseHeight,poses};
  fs.writeFileSync(path.join(dir,'metadata.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
Promise.all(jobs.map(j => run(j.id,j.input,j.prompt))).catch(e=>{ console.error(e);process.exit(1); });
