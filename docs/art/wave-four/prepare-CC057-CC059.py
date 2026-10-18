"""Technical alpha contour isolation, scale and ground alignment only.

All sprite color and alpha samples come directly from generated master sheets.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

art = Path(__file__).resolve().parent
root = art.parents[2]
names = ['idle', 'wind-up', 'strike', 'victory', 'flinch', 'embarrassed']

def bounds(a, threshold=16):
    y,x=np.where(a>=threshold)
    return dict(left=int(x.min()),top=int(y.min()),right=int(x.max()),bottom=int(y.max()))

def prepare(id, name):
    im=Image.open(art/f'{id}-poses.png').convert('RGBA')
    rgba=np.array(im); height,width=rgba.shape[:2]
    labels,n=label(rgba[:,:,3]>=8)
    sizes=np.bincount(labels.ravel()); sizes[0]=0
    main_labels=np.argsort(sizes)[-6:]
    main={}
    for value in main_labels:
        yy,xx=np.where(labels==value)
        center=(float(xx.mean()),float(yy.mean()))
        index=(0 if center[1]<height/2 else 3)+min(2,int(center[0]*3/width))
        if index in main: raise ValueError(f'{id}: ambiguous pose components')
        main[index]=(int(value),center)
    if set(main)!=set(range(6)): raise ValueError(f'{id}: missing full body')
    owner={}
    for value in range(1,n+1):
        yy,xx=np.where(labels==value)
        cx,cy=float(xx.mean()),float(yy.mean())
        owner[value]=min(main,key=lambda index:(main[index][1][0]-cx)**2+(main[index][1][1]-cy)**2)
    poses=[]
    for index in range(6):
        selected=np.isin(labels,[v for v,p in owner.items() if p==index])
        selected=binary_dilation(selected,iterations=1)
        isolated=rgba.copy(); isolated[~selected]=0
        bb=bounds(isolated[:,:,3],1)
        crop=(max(0,bb['left']-1),max(0,bb['top']-1),min(width,bb['right']+2),min(height,bb['bottom']+2))
        body=Image.fromarray(isolated).crop(crop)
        size=(round(body.width*.78),round(body.height*.78))
        if size[0]>480 or size[1]>435: raise ValueError(f'{id}: pose {index} exceeds safe canvas {size}')
        body=body.resize(size,Image.Resampling.LANCZOS)
        runtime=Image.new('RGBA',(512,512),(0,0,0,0))
        runtime.alpha_composite(body,((512-body.width)//2,462-body.height))
        dest=root/'public/assets/actors'/f'{id}-{index}.webp'
        runtime.save(dest,'WEBP',quality=80,method=6)
        measured=np.array(Image.open(dest).convert('RGBA'))[:,:,3]
        b=bounds(measured)
        poses.append(dict(index=index,name=('support' if id=='CC058' and index==2 else names[index]),
            path=f'/assets/actors/{id}-{index}.webp',width=512,height=512,
            suggestedAnchor=dict(x=256,y=b['bottom']),alphaBounds=b,
            transparentPixels=int((measured==0).sum()),
            sourceBodyCrop=dict(left=crop[0],top=crop[1],width=crop[2]-crop[0],height=crop[3]-crop[1])))
    portrait=Image.open(art/f'{id}-portrait.png').convert('RGB')
    portrait.resize((1024,1024),Image.Resampling.LANCZOS).save(root/'public/assets/residents'/f'{id}.webp','WEBP',quality=80,method=6)
    portrait.resize((320,320),Image.Resampling.LANCZOS).save(root/'public/assets/residents'/f'{id}-small.webp','WEBP',quality=78,method=6)
    (root/'public/assets/specials'/f'{id}.webp').write_bytes((root/'public/assets/actors'/f'{id}-2.webp').read_bytes())
    metadata=dict(characterId=id,characterName=name,generatedWith='built-in image_gen',source=dict(path=f'docs/art/wave-four/{id}-poses.png',width=width,height=height),sourceGrid=dict(columns=3,rows=2),
        preparation='Connected alpha contours at alpha>=8 isolate complete bodies across nominal grid boundaries. Small detached props/ink details assigned to nearest body; one-pixel alpha edge allowance. Original generated color and alpha preserved, no repainting. Uniform 0.78 scale and transparent 512-square ground alignment at 462. Runtime bounds measured alpha>=16.',poses=poses)
    (art/f'{id}.json').write_text(json.dumps(metadata,indent=2)+'\n')
    return poses

if __name__=='__main__':
    allposes=[]
    for id,name in [('CC057','Baby Oil Supplier'),('CC058','Vaccine Update'),('CC059','Oprahoma')]:
        allposes.extend(prepare(id,name))
    review=Image.new('RGB',(1536,768),'#e7e7e7')
    for i,p in enumerate(allposes):
        actor=Image.open(root/'public'/p['path'].lstrip('/')).convert('RGBA').resize((256,256),Image.Resampling.LANCZOS)
        review.paste(actor,((i%6)*256,(i//6)*256),actor)
    review.save(art/'CC057-CC059-review.png')
    print(json.dumps([dict(path=p['path'],alphaBounds=p['alphaBounds']) for p in allposes],indent=2))
