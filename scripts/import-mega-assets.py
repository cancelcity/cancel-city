"""Import only complete, inspected staging folders. No painting or rerolling."""
from pathlib import Path
from PIL import Image
import json, shutil
root=Path(__file__).resolve().parents[1]
ready=set(json.loads((root/'src/data/mega-ready.json').read_text()))
cast=json.loads((root/'src/data/actor-cast.json').read_text())
imported=[]
for folder in sorted((root/'work/mega-staging').glob('CC*')):
    cid=folder.name
    if not (folder/'completed.json').exists() or cid in ready:continue
    prompt=next((name for name in ['exactprompt.md','exact-prompt.md','prompt.md'] if (folder/name).exists()),'prompt.md')
    required=['portrait.png','poses.png','portrait.webp','small.webp','special.webp','metadata.json',prompt,'review.jpg']+[f'actor-{i}.webp' for i in range(6)]
    if any(not (folder/f).exists() for f in required):raise ValueError(f'Incomplete {cid}')
    metadata=json.loads((folder/'metadata.json').read_text())
    poses=[]
    for i in range(6):
        with Image.open(folder/f'actor-{i}.webp') as im:
            extrema=im.getchannel('A').getextrema() if im.mode=='RGBA' else None
            if not extrema or extrema[0]!=0 or extrema[1]<240:raise ValueError(f'{cid}-{i} lacks genuine transparent background and opaque body')
            bounds=im.getchannel('A').getbbox()
            if not bounds or bounds[0]<2 or bounds[1]<2 or bounds[2]>im.width-2 or bounds[3]>im.height-2:raise ValueError(f'{cid}-{i} clipped bounds {bounds}')
            p=next(p for p in metadata['poses'] if p['index']==i)
            anchor=p['suggestedAnchor']
            if not 0<=anchor['x']<=im.width or not 0<=anchor['y']<=im.height:raise ValueError('Invalid anchor')
            poses.append({'src':f'/assets/actors/{cid}-{i}.webp','width':im.width,'height':im.height,'anchor':anchor})
    target=root/'docs/art/wave-five';target.mkdir(parents=True,exist_ok=True)
    for old,new in [('portrait.png',f'{cid}-portrait.png'),('poses.png',f'{cid}-poses.png'),('metadata.json',f'{cid}.json'),(prompt,f'{cid}-prompt.md'),('review.jpg',f'{cid}-review.jpg')]:shutil.copy2(folder/old,target/new)
    if (folder/'provenance.json').exists():shutil.copy2(folder/'provenance.json',target/f'{cid}-provenance.json')
    for old,destination in [('portrait.webp',f'public/assets/residents/{cid}.webp'),('small.webp',f'public/assets/residents/{cid}-small.webp'),('special.webp',f'public/assets/specials/{cid}.webp')]+[(f'actor-{i}.webp',f'public/assets/actors/{cid}-{i}.webp') for i in range(6)]:shutil.copy2(folder/old,root/destination)
    bounds=metadata['poses'][0]['alphaBounds'];cast[cid]={'baseHeight':bounds['bottom']-bounds['top'],'poses':poses}
    ready.add(cid);imported.append(cid)
(root/'src/data/mega-ready.json').write_text(json.dumps(sorted(ready),indent=2)+'\n')
(root/'src/data/actor-cast.json').write_text(json.dumps(cast,indent=2)+'\n')
print(json.dumps({'imported':imported,'ready':len(ready)}))
