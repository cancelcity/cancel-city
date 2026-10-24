"""Restore the exact runtime assets for the recorded Cancel City source version."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path, PurePosixPath
import hashlib
import json
import os
import time
import urllib.request


def restore(root: Path):
    manifest = json.loads((root / '.openai/github-assets.json').read_text())
    base = manifest['base_url'].rstrip('/')
    if base not in {'https://cancel-city-gacha.wiryant4.chatgpt.site', 'https://cancel-city-gacha.tokieth.chatgpt.site'}:
        raise ValueError('Unexpected asset origin')

    def one(item):
        rel = PurePosixPath(item['path'])
        if rel.is_absolute() or '..' in rel.parts or not (rel.parts[0] == 'public' or str(rel).startswith('scripts/cinema/fonts/')):
            raise ValueError('Unsafe asset path')
        target = root.joinpath(*rel.parts)
        if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == item['sha256']:
            return False
        source = PurePosixPath(item.get('source_path', item['path']))
        if source.is_absolute() or '..' in source.parts or source.parts[0] != 'public':
            raise ValueError('Unsafe asset source')
        url = base + '/' + str(source.relative_to('public'))
        for attempt in range(5):
            try:
                request = urllib.request.Request(url, headers={'User-Agent': 'CancelCitySourceMirror/1.0'})
                with urllib.request.urlopen(request, timeout=90) as response:
                    data = response.read()
                if len(data) != item['size'] or hashlib.sha256(data).hexdigest() != item['sha256']:
                    raise ValueError('Asset checksum mismatch: ' + str(rel))
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_name(target.name + '.download')
                temporary.write_bytes(data)
                os.replace(temporary, target)
                return True
            except Exception:
                if attempt == 4:
                    raise
                time.sleep(2 ** attempt)

    changed = 0
    failures = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        pending = {pool.submit(one, entry): entry for entry in manifest['files']}
        for i, future in enumerate(as_completed(pending), 1):
            try:
                changed += bool(future.result())
            except Exception as error:
                failures.append(str(pending[future]['path']) + ': ' + str(error))
            if i % 100 == 0 or i == len(pending):
                print(f'Checked {i}/{len(pending)} runtime assets', flush=True)
    if failures:
        raise RuntimeError('\n'.join(failures))
    print(f'Verified all {len(manifest["files"])} assets; restored {changed}.')


if __name__ == '__main__':
    restore(Path(__file__).resolve().parents[1])
