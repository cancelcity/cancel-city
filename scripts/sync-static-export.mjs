import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, cp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function filesIn(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(join(directory, prefix), { withFileTypes: true })) {
    const relative = join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(directory, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported static export entry: ${relative}`);
  }
  return files;
}

async function digest(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

export async function syncStaticExport(root = process.cwd()) {
  const source = join(root, 'out');
  const destination = join(root, 'dist/client');
  await access(join(source, 'index.html'));
  // Superseded Gokart prototypes stay in source history. The active player uses
  // layered-v3; serving every discarded movie exhausted the hosting input limit.
  const superseded = file => file.replaceAll('\\', '/').startsWith('assets/gokart/') && !file.replaceAll('\\', '/').startsWith('assets/gokart/layered-v3/');
  const files = (await filesIn(source)).filter(file => !superseded(file));
  // The Worker build does not reliably copy Next's export. Always overwrite
  // existing HTML/assets, while retaining Cloudflare's generated client files.
  await cp(source, destination, { recursive: true, force: true });
  for (const file of await filesIn(destination)) if (superseded(file)) await rm(join(destination, file));
  for (const file of files) {
    if (await digest(join(source, file)) !== await digest(join(destination, file))) {
      throw new Error(`Published static export differs from Next output: ${file}`);
    }
  }
  return files.length;
}

export async function verifyReleaseBudget(root = process.cwd(), limit = 245 * 1024 * 1024) {
  const directory = join(root, 'dist/client');
  let bytes = 0;
  for (const file of await filesIn(directory)) bytes += (await stat(join(directory, file))).size;
  if (bytes > limit) throw new Error(`Static release is ${(bytes / 1048576).toFixed(1)} MiB; delivery budget is ${(limit / 1048576).toFixed(1)} MiB`);
  return bytes;
}

export async function verifyGokartRelease(root = process.cwd()) {
  const film = JSON.parse(await readFile(join(root, 'src/data/gokart-film.json'), 'utf8'));
  const html = await readFile(join(root, 'dist/client/cinema/gokart/index.html'), 'utf8');
  const source = html.match(/<source\b[^>]*\bsrc="([^"]+)"/i)?.[1];
  if (source !== film.video) throw new Error(`Gokart page uses ${source}, expected ${film.video}`);
  const text = html.replace(/<!--.*?-->/gs, '');
  if (!text.includes(`${film.duration.toFixed(1)} SECONDS`)) {
    throw new Error('Gokart page does not display the current film duration');
  }
  for (const url of [film.video, film.poster, film.captions, ...film.shots.map(shot => shot.thumbnail)]) {
    await access(join(root, 'dist/client', url));
  }
  return { video: source, duration: film.duration };
}

export async function verifyLayeredReleases(root = process.cwd()) {
  const films = JSON.parse(await readFile(join(root, 'src/data/layered-films.json'), 'utf8'));
  const html = await readFile(join(root, 'dist/client/cinema/specials/index.html'), 'utf8');
  if (!html.includes(`src="${films[0].video}"`)) throw new Error('The special gallery uses an outdated first movie');
  for (const film of films) {
    if (!html.includes(film.shots[2].thumbnail)) throw new Error(`Missing film in published gallery: ${film.slug}`);
    for (const url of [film.video, film.poster, film.captions, ...film.shots.map(shot => shot.thumbnail)]) await access(join(root, 'dist/client', url));
  }
  return films.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const count = await syncStaticExport();
  const film = await verifyGokartRelease();
  const releases = await verifyLayeredReleases();
  const bytes = await verifyReleaseBudget();
  console.log(`Verified ${count} exported files; Gokart ${film.duration}s → ${film.video}; ${releases} new films; ${(bytes / 1048576).toFixed(1)} MiB within delivery budget`);
}
