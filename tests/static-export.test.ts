import { afterEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { syncStaticExport, verifyGokartRelease, verifyReleaseBudget } from '../scripts/sync-static-export.mjs';

const temporary: string[] = [];
afterEach(async () => { for (const root of temporary.splice(0)) await rm(root, { recursive: true, force: true }); });

it('overwrites stale published pages and media while retaining Worker metadata', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cancel-city-export-')); temporary.push(root);
  const put = async (path: string, content: string) => {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), content);
  };
  const video = '/assets/current.mp4';
  const film = { video, duration: 5.8, poster: '/poster.webp', captions: '/captions.vtt', shots: [] };
  const current = `<video><source src="${video}"></video><small>5.8<!-- --> SECONDS</small>`;
  await put('src/data/gokart-film.json', JSON.stringify(film));
  await put('out/index.html', 'home');
  await put('out/cinema/gokart/index.html', current);
  await put('out/assets/current.mp4', 'new video bytes');
  await put('out/poster.webp', 'poster');
  await put('out/captions.vtt', 'captions');
  await put('out/assets/gokart/card-style-v2/full-throttle.mp4', 'superseded prototype');
  await put('dist/client/cinema/gokart/index.html', '<source src="/old-9.6s.mp4">');
  await put('dist/client/assets/current.mp4', 'stale video bytes');
  await put('dist/client/.assetsignore', 'wrangler.json\n');

  await expect(verifyGokartRelease(root)).rejects.toThrow('expected /assets/current.mp4');
  expect(await syncStaticExport(root)).toBe(5);
  expect(await readFile(join(root, 'dist/client/cinema/gokart/index.html'), 'utf8')).toBe(current);
  expect(await readFile(join(root, 'dist/client/assets/current.mp4'), 'utf8')).toBe('new video bytes');
  expect(await readFile(join(root, 'dist/client/.assetsignore'), 'utf8')).toBe('wrangler.json\n');
  expect(await verifyGokartRelease(root)).toEqual({ video, duration: 5.8 });
  await expect(readFile(join(root, 'dist/client/assets/gokart/card-style-v2/full-throttle.mp4'))).rejects.toThrow();
  expect(await verifyReleaseBudget(root, 1024)).toBeLessThan(1024);
  await expect(verifyReleaseBudget(root, 1)).rejects.toThrow('delivery budget');
});
