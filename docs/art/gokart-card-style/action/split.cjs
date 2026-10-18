const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const root = __dirname;
(async () => {
  const manifest = {
    title: 'Gokart action: CANCEL CITY card-style redraw',
    method: 'Built-in imagegen style-transfer edit for each original sheet. Sharp used only for regular grid extraction and WebP encoding.',
    references: {
      characterAndStyle: '../../generated_images/exec-7530eca5-c52b-49ce-b42c-b09c2e1f8d82.png',
      actualCard: '../../cancel-city/public/assets/roster-b2/CC010.webp',
      originalSheets: '../../cancel-city/docs/art/gokart/action/'
    },
    sheets: [],
  };
  for (const [name, columns, rows] of [['drift', 3, 4], ['rush', 2, 4]]) {
    const source = path.join(root, `${name}-original.png`);
    const { width, height, hasAlpha } = await sharp(source).metadata();
    const sheet = { name, source: `${name}-original.png`, prompt: `${name}-prompt.txt`, width, height, columns, rows, hasAlpha, frames: [] };
    for (let index = 0; index < columns * rows; index++) {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const left = Math.round(col * width / columns);
      const top = Math.round(row * height / rows);
      const fw = Math.round((col + 1) * width / columns) - left;
      const fh = Math.round((row + 1) * height / rows) - top;
      const filename = `${name}-${String(index + 1).padStart(2, '0')}.webp`;
      await sharp(source).extract({ left, top, width: fw, height: fh }).webp({ quality: 90, effort: 6 }).toFile(path.join(root, filename));
      const bytes = fs.statSync(path.join(root, filename)).size;
      sheet.frames.push({ index: index + 1, file: filename, width: fw, height: fh, sourceRect: { left, top, width: fw, height: fh }, bytes });
    }
    manifest.sheets.push(sheet);
  }
  manifest.review = {
    style: 'Compared to actual CC010 and corrected master: rough scratchy black hatching/stipple, dirty newsprint, flat acid yellow and hot pink, black palm/city silhouettes, grotesque expressive faces, battered red kart. Not an overlaid color filter.',
    motion: 'Same frame order and pose/camera progression preserved. Rush advances through angry gritted concentration to huge yelling mouth. Driver hands and arms stay attached. Kart remains red with cream number-2 roundel.',
    driftSuggestedOrder: [1,2,3,4,5,6,7,8,10,11,12],
    drift09: 'Known rear-view insert is intentionally retained in grid and can be omitted by editor.',
    framing: 'Frame originals preserve close framing. Some tall hair tips approach or cross upper cell edge, and final rush bumper/right wheel reach lower/right edge. Do not zoom further.',
    limitations: 'Generated redrawn keys retain some frame-to-frame linework and perspective variation. No invented intermediate animation or creative pixel edits were used.'
  };
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ sheets: manifest.sheets.map(s=>({name:s.name,width:s.width,height:s.height,frames:s.frames.length,bytes:s.frames.reduce((n,f)=>n+f.bytes,0)})), manifest: path.join(root,'manifest.json') }));
})();
