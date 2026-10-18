const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/sharp');
const root = __dirname;
(async () => {
  const manifest = {
    title: 'Gokart action animation sheets',
    method: 'Built-in imagegen; opaque original PNGs; sharp used only for grid extraction and WebP encoding.',
    reference: '../../generated_images/exec-4b446d66-17b5-4f65-9d0c-e7d85d53bb3e.png',
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
  manifest.editorialNotes = {
    drift: 'All 12 grid cells extracted. Frame 09 is a rear-view camera cut; omit it from a continuous front/side drift or treat it as a deliberate insert. Source frames 01 and 02 are close to the upper hair edge. Do not crop further.',
    driftSuggestedOrder: [1,2,3,4,5,6,7,8,10,11,12],
    rush: '8 frames approach viewer, with real changing framing, lift and facial performance. Late frames intentionally approach the cell edges; hair tips are cut by the generated original in frames 05–08. Preserve the full extracted frame; do not add extra zoom.',
    rushSuggestedOrder: [1,2,3,4,5,6,7,8],
    limitations: 'Generated frame sheets are authored keyframes, not a fully cleaned 24-fps animation. Frame-to-frame design/perspective deviations remain and should be directed with cuts/effects. No interpolation has been invented in extraction.'
  };
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ sheets: manifest.sheets.map(s=>({name:s.name, frames:s.frames.length, bytes:s.frames.reduce((n,f)=>n+f.bytes,0)})), manifest: path.join(root,'manifest.json') }));
})();
