/* Technical derivative preparation only: preserve generated color/alpha;
 * isolate grid subjects, uniformly resize, and ground-align their alpha.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const root = path.resolve(__dirname, '../../..');
const names = ['idle', 'wind-up', 'strike', 'victory', 'flinch', 'embarrassed'];

function alphaBounds(data, width, height, threshold = 16) {
  let left = width, top = height, right = -1, bottom = -1, transparentPixels = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const a = data[(y * width + x) * 4 + 3];
    if (!a) transparentPixels++;
    if (a < threshold) continue;
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return {left, top, right, bottom, transparentPixels};
}

async function prepare(id, name, columns) {
  const source = path.join(__dirname, id + '-poses.png');
  const {data, info} = await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const actors = [];
  for (let col = 0; col < 3; col++) {
    const left = columns[col], width = columns[col + 1] - left, height = info.height;
    const seen = new Uint8Array(width * height), labels = new Int32Array(width * height);
    const queue = new Int32Array(width * height), groups = [];
    let label = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const at = y * width + x;
      if (seen[at] || data[(y * info.width + left + x) * 4 + 3] < 8) continue;
      label++;
      let head = 0, tail = 0, sumY = 0;
      queue[tail++] = at; seen[at] = 1;
      while (head < tail) {
        const i = queue[head++], cx = i % width, cy = Math.floor(i / width);
        labels[i] = label; sumY += cy;
        for (const [nx, ny] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const n = ny * width + nx;
          if (seen[n] || data[(ny * info.width + left + nx) * 4 + 3] < 8) continue;
          seen[n] = 1; queue[tail++] = n;
        }
      }
      groups[label] = {count:tail, row:sumY / tail < height / 2 ? 0 : 1};
    }
    for (let row = 0; row < 2; row++) {
      const index = row * 3 + col, keep = new Uint8Array(width * height);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const group = groups[labels[y * width + x]];
        if (!group || group.row !== row) continue;
        // One-pixel dilation retains the original antialiased alpha edges.
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) keep[ny * width + nx] = 1;
        }
      }
      const rgba = Buffer.alloc(width * height * 4);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        if (!keep[y * width + x]) continue;
        const s = (y * info.width + left + x) * 4, d = (y * width + x) * 4;
        data.copy(rgba, d, s, s + 4);
      }
      const b = alphaBounds(rgba, width, height, 1);
      const body = {left:Math.max(0,b.left-1), top:Math.max(0,b.top-1), width:0, height:0};
      body.width = Math.min(width,b.right+2)-body.left;
      body.height = Math.min(height,b.bottom+2)-body.top;
      const scaledWidth = Math.round(body.width * .78), scaledHeight = Math.round(body.height * .78);
      if (scaledWidth > 480 || scaledHeight > 435) throw new Error(id + ':' + index + ' exceeds actor safe frame');
      const scaled = await sharp(rgba,{raw:{width,height,channels:4}}).extract(body).resize(scaledWidth,scaledHeight).png().toBuffer();
      const dest = path.join(root,'public/assets/actors',id + '-' + index + '.webp');
      await sharp({create:{width:512,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
        .composite([{input:scaled,left:Math.round((512-scaledWidth)/2),top:462-scaledHeight}]).webp({quality:80}).toFile(dest);
      const measured = await sharp(dest).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      const mb = alphaBounds(measured.data,512,512);
      actors[index] = {index,name:names[index],path:'/assets/actors/'+id+'-'+index+'.webp',width:512,height:512,
        suggestedAnchor:{x:256,y:mb.bottom},alphaBounds:{left:mb.left,top:mb.top,right:mb.right,bottom:mb.bottom},
        transparentPixels:mb.transparentPixels,sourceColumn:{left,top:0,width,height},sourceBodyCrop:body};
    }
  }
  const portrait = path.join(__dirname,id+'-portrait.png');
  await sharp(portrait).resize(1024,1024).webp({quality:80}).toFile(path.join(root,'public/assets/residents',id+'.webp'));
  await sharp(portrait).resize(320,320).webp({quality:78}).toFile(path.join(root,'public/assets/residents',id+'-small.webp'));
  await fs.copyFile(path.join(root,'public/assets/actors',id+'-2.webp'),path.join(root,'public/assets/specials',id+'.webp'));
  await fs.writeFile(path.join(__dirname,id+'.json'),JSON.stringify({characterId:id,characterName:name,generatedWith:'built-in image_gen',
    source:{path:'docs/art/wave-four/'+id+'-poses.png',width:info.width,height:info.height},sourceGrid:{columns:3,rows:2},
    preparation:'Connected alpha contour crop at alpha>=8 distinguishes vertically interleaved neighbors, with one-pixel edge allowance preserving original RGBA. No repainting or background replacement. Uniform 0.78 scale and transparent 512-square ground alignment at 462. Runtime bounds measured alpha>=16.',poses:actors},null,2)+'\n');
  return actors;
}

(async()=>{
  const poses = [...await prepare('CC063','Infinite Rizz',[0,500,998,1536]),...await prepare('CC064','Big Bald Energy',[0,510,1010,1536])];
  const composites=[];
  for (let i=0;i<poses.length;i++) {
    const input=await sharp(path.join(root,'public',poses[i].path)).resize(256,256).png().toBuffer();
    composites.push({input,left:(i%6)*256,top:Math.floor(i/6)*256});
  }
  await sharp({create:{width:1536,height:512,channels:3,background:'#eeeeee'}}).composite(composites).png().toFile(path.join(__dirname,'CC063-CC064-review.png'));
  process.stdout.write(JSON.stringify(poses.map(p=>({path:p.path,alphaBounds:p.alphaBounds,anchor:p.suggestedAnchor})),null,2)+'\n');
})().catch(error=>{process.stderr.write(error.stack+'\n');process.exitCode=1;});
