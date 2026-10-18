const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const source = '/workspace/scratch/80a8c8c1affe/generated_images/exec-f773d7d1-95df-4eab-a6ea-661206e51b08.png';
const out = __dirname;
(async () => {
  await fs.copyFile(source, path.join(out, 'original-sheet.png'));
  const rows = [0, 333, 665, 998];
  const frames = [];
  for (let i = 0; i < 8; i++) {
    const filename = `ending-${String(i + 1).padStart(2, '0')}.webp`;
    const crop = {left: (i % 2) * 591, top: rows[Math.floor(i / 2)], width: 591, height: 332};
    await sharp(source).extract(crop).webp({quality:92, effort:6}).toFile(path.join(out, filename));
    const stat = await fs.stat(path.join(out, filename));
    frames.push({index:i, filename, width:591, height:332, crop, bytes:stat.size});
  }
  const manifest = {
    asset:'Gokart comedic wheel-loss epilogue',
    tool:'built-in image_gen.imagegen',
    mode:'reference-guided generation',
    generatedSource:source,
    reference:'/workspace/scratch/80a8c8c1affe/generated_images/exec-4b446d66-17b5-4f65-9d0c-e7d85d53bb3e.png',
    original:'original-sheet.png', prompt:'prompt.txt',
    sheet:{width:1182,height:1330,columns:2,rows:4},
    processing:'Mechanical rectangular crop only, then WebP quality 92. Alternating 333/332 row allocation; one boundary pixel excluded where needed. No repaint, compositing, or generated in-betweens.',
    frames,
    review:{
      correctGrid:true,
      noGutters:true,
      consistentCharacter:true,
      wholeSeatedBody:true,
      visibleExpressionAndArmChanges:true,
      progressiveWheelMovement:true,
      notes:'Eight actual new drawings. Fist lowers, head turns down then forward, the front screen-left wheel detaches and rolls progressively left through frames 4–7 and exits frame 8. Background camera and wet road remain consistent. Kart slight tilt is subtle; no prominent steam in final. Output dimensions are below requested 1536×1728; frames are delivered at native resolution without invented detail.'
    }
  };
  await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({frames:frames.length,totalFrameBytes:frames.reduce((a,f)=>a+f.bytes,0),frameWidth:591,frameHeight:332}));
})().catch(e=>{console.error(e);process.exitCode=1;});
