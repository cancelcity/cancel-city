const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const root=path.resolve(__dirname,'../../..');
const specs=[
  {
    "id": "CC018",
    "name": "Gandalf the Grey Market",
    "subject": "a recognizable Gandalf-inspired elderly grey wizard: long silver beard, pointed grey hat, staff, battered grey robe and cloak covered in dangling price tags; customs paperwork tucked into belt",
    "beats": "neutral upright holding staff; suspiciously examining customs papers; bold staff-raised doorway-blocking spell; startled backwards recoil gripping intact staff; smug knowing wizard pose; panicked tangled in own price-tag cloak",
    "prompt": "Use case: illustration-story. Asset type: transparent full-body game pose atlas. Create a coherent 3-column by 2-row sheet of SIX poses of ONE character, reading left-to-right top then bottom. Each cell equal sized, entire body head to feet plus held props fully visible, centered, substantial empty gutters and outer margins. No cropping, no overlapping cells, no labels, no panels, no backgrounds or floor shadows. REAL transparent alpha. Intact whole figures, every limb physically connected, naturally grasped props; never detached limbs. Consistent scale and identity across all six. Style: premium satirical manga/graphic-novel caricature, heavy black ink contours, fine crosshatching and halftone, hand-painted cream highlights, restrained neon lime magenta cyan accents. Rich expressive faces, clothing folds and ink texture. Portrait camera three-quarter view mostly facing right. Not photorealistic, not 3D. Character: a recognizable Gandalf-inspired elderly grey wizard: long silver beard, pointed grey hat, staff, battered grey robe and cloak covered in dangling price tags; customs paperwork tucked into belt. Six ordered poses: neutral upright holding staff; suspiciously examining customs papers; bold staff-raised doorway-blocking spell; startled backwards recoil gripping intact staff; smug knowing wizard pose; panicked tangled in own price-tag cloak.",
    "source": "/workspace/scratch/80a8c8c1affe/generated_images/exec-0283c5cf-7f4b-4aa8-9a64-b66b433ad1ef.png"
  },
  {
    "id": "CC023",
    "name": "Fraudo Baggins",
    "subject": "a recognizable Frodo-inspired small curly brown-haired adult hobbit investment promoter, green cloak, cream shirt, brown waistcoat and trousers, large bare hairy feet, oversized gold referral ring and rolled velvet carpet",
    "beats": "neutral displaying gold ring; sly pitch with ring extended; dramatic carpet-pulling lunge; startled ring-thread recoil; smug successful promoter flourish; panicked caught in rolled carpet with feet visible",
    "prompt": "Use case: illustration-story. Asset type: transparent full-body game pose atlas. Create a coherent 3-column by 2-row sheet of SIX poses of ONE character, reading left-to-right top then bottom. Each cell equal sized, entire body head to feet plus held props fully visible, centered, substantial empty gutters and outer margins. No cropping, no overlapping cells, no labels, no panels, no backgrounds or floor shadows. REAL transparent alpha. Intact whole figures, every limb physically connected, naturally grasped props; never detached limbs. Consistent scale and identity across all six. Style: premium satirical manga/graphic-novel caricature, heavy black ink contours, fine crosshatching and halftone, hand-painted cream highlights, restrained neon lime magenta cyan accents. Rich expressive faces, clothing folds and ink texture. Portrait camera three-quarter view mostly facing right. Not photorealistic, not 3D. Character: a recognizable Frodo-inspired small curly brown-haired adult hobbit investment promoter, green cloak, cream shirt, brown waistcoat and trousers, large bare hairy feet, oversized gold referral ring and rolled velvet carpet. Six ordered poses: neutral displaying gold ring; sly pitch with ring extended; dramatic carpet-pulling lunge; startled ring-thread recoil; smug successful promoter flourish; panicked caught in rolled carpet with feet visible.",
    "source": "/workspace/scratch/80a8c8c1affe/generated_images/exec-fba5bed3-6f95-43e3-bfaa-8e8224478744.png"
  },
  {
    "id": "CC058",
    "name": "GenOS Windows Update",
    "subject": "recognizable Genos-inspired blond young adult anime cyborg: short spiky blond hair, serious handsome face, black sleeveless top, silver metallic arms connected naturally, black trousers and boots, rectangular glowing cyan repair-progress display set into chest plate, no logos",
    "beats": "neutral upright repair display glowing; gathering energy braced anticipation; spectacular whole-body heroic transformation stance; frozen stiff mid-pose staring at chest display; pleased repair-complete support stance; panicked stiff reboot pose looking at stalled chest display",
    "prompt": "Use case: illustration-story. Asset type: game sprite atlas with REAL transparent alpha. A clean 3-column 2-row sheet, SIX miniature full-body illustrations of ONE character. Each figure must be SMALL ENOUGH to leave at least 40 pixels empty padding on ALL FOUR sides within its equal cell, ESPECIALLY below both boots and above hair. No body part or glow may touch cell edge. Feet and entire boots are mandatory visible. Whole connected bodies only. Subject: recognizable Genos-inspired blond young adult anime cyborg: short spiky blond hair, serious handsome face, black sleeveless top, silver metallic arms connected naturally, black trousers and boots, rectangular glowing cyan repair-progress display set into chest plate, no logos. Same identity and clothing in every pose. Ordered poses: neutral upright repair display glowing; gathering energy braced anticipation; spectacular whole-body heroic transformation stance; frozen stiff mid-pose staring at chest display; pleased repair-complete support stance; panicked stiff reboot pose looking at stalled chest display. Bold black ink outlines, manga comic crosshatching and halftone, cream highlights and restrained neon cyan effects. Mostly facing right. Props integrated into character. No panels, words, floor, shadows, labels or background. Generous fully transparent gutters. Make each figure about 70 percent of its cell height, do not fill canvas. No crop anywhere.",
    "source": "/workspace/scratch/80a8c8c1affe/generated_images/exec-24d04483-8059-4f13-b48f-3eda3523395e.png"
  },
  {
    "id": "CC135",
    "name": "Daenerys Airfryer",
    "subject": "recognizable Daenerys-inspired adult dragon queen, long silver hair in braids, elegant charcoal-and-cream royal coat dress with red trim and boots, carrying a compact dragon-shaped countertop airfryer with small wing handles and dragon-head front",
    "beats": "neutral regal stance beside held dragon airfryer; stern pointing cooking-command anticipation; dramatically opening basket from dragon fryer; surprised backwards recoil at hot basket; smug regal temperature-check pose; panicked juggling a smoking fryer basket",
    "prompt": "Use case: illustration-story. Asset type: transparent full-body game pose atlas. Create a coherent 3-column by 2-row sheet of SIX poses of ONE character, reading left-to-right top then bottom. Each cell equal sized, entire body head to feet plus held props fully visible, centered, substantial empty gutters and outer margins. No cropping, no overlapping cells, no labels, no panels, no backgrounds or floor shadows. REAL transparent alpha. Intact whole figures, every limb physically connected, naturally grasped props; never detached limbs. Consistent scale and identity across all six. Style: premium satirical manga/graphic-novel caricature, heavy black ink contours, fine crosshatching and halftone, hand-painted cream highlights, restrained neon lime magenta cyan accents. Rich expressive faces, clothing folds and ink texture. Portrait camera three-quarter view mostly facing right. Not photorealistic, not 3D. Character: recognizable Daenerys-inspired adult dragon queen, long silver hair in braids, elegant charcoal-and-cream royal coat dress with red trim and boots, carrying a compact dragon-shaped countertop airfryer with small wing handles and dragon-head front. Six ordered poses: neutral regal stance beside held dragon airfryer; stern pointing cooking-command anticipation; dramatically opening basket from dragon fryer; surprised backwards recoil at hot basket; smug regal temperature-check pose; panicked juggling a smoking fryer basket. The queen is adult, fully clothed and poised. Keep fryer held directly in hands or at her side, distinguish cooking gadget from a living dragon. Leave extra empty padding around all six figures. No fire glow touching neighboring cells.",
    "source": "/workspace/scratch/80a8c8c1affe/generated_images/exec-76bade53-5274-45b8-949e-1cc6efbe440c.png"
  }
];
const regions={
CC018:[[0,0,512,512],[512,0,512,512],[1024,0,512,512],[0,512,512,512],[512,512,512,512],[1024,512,512,512]],
CC023:[[0,0,512,492],[512,0,480,492],[992,0,544,492],[0,492,512,532],[512,492,480,532],[992,492,544,532]],
CC058:[[0,0,512,512],[512,0,512,512],[1024,0,512,512],[0,512,512,512],[512,512,512,512],[1024,512,512,512]],
CC135:[[0,0,512,515],[512,0,512,515],[1024,0,512,515],[0,515,536,509],[550,515,474,509],[1024,515,512,509]]
};
const anchors={
CC018:[[270,506],[757,505],[1270,496],[265,1012],[750,1008],[1260,1010]],
CC023:[[250,471],[748,477],[1090,379],[260,963],[765,979],[1385,907]],
CC058:[[272,482],[757,478],[1250,490],[272,990],[755,992],[1265,988]],
CC135:[[318,512],[733,508],[1254,507],[335,1000],[770,1012],[1240,996]]
};
(async()=>{
await fs.mkdir(path.join(root,'public/assets/roster-v2'),{recursive:true});
for(const spec of specs){
 const dir=path.join(root,'docs/art/roster-first-batch',spec.id);await fs.mkdir(dir,{recursive:true});
 await fs.copyFile(spec.source,path.join(dir,'original-sheet.png'));
 const actor={baseHeight:spec.id==='CC023'?460:spec.id==='CC058'?450:500,poses:[]};let first;
 for(let i=0;i<6;i++){
  const [left,top,width,height]=regions[spec.id][i];
  const {data,info}=await sharp(spec.source).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let minX=width,minY=height,maxX=0,maxY=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>16){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  minX=Math.max(0,minX-3);minY=Math.max(0,minY-3);maxX=Math.min(width-1,maxX+3);maxY=Math.min(height-1,maxY+3);
  const crop={left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1};
  const src='/assets/actors/'+spec.id+'-roster-v2-'+i+'.webp';
  const out=path.join(root,'public',src);
  await sharp(data,{raw:info}).extract(crop).webp({quality:92,alphaQuality:100}).toFile(out);
  const ax=anchors[spec.id][i][0]-left-minX;const ay=anchors[spec.id][i][1]-top-minY;
  actor.poses.push({src,width:crop.width,height:crop.height,anchor:{x:ax,y:ay}});
  if(i===0)first=out;
 }
 const portrait=await sharp(first).resize({width:620,height:760,fit:'inside'}).toBuffer();
 await sharp({create:{width:768,height:768,channels:4,background:'#f3e7cc'}}).composite([{input:portrait,gravity:'centre'}]).webp({quality:94}).toFile(path.join(root,'public/assets/roster-v2',spec.id+'.webp'));
 await fs.writeFile(path.join(dir,'actor.json'),JSON.stringify(actor,null,2)+'\n');
 await fs.writeFile(path.join(dir,'provenance.json'),JSON.stringify({id:spec.id,name:spec.name,generator:'built-in image_gen',original:'original-sheet.png',portrait:'/assets/roster-v2/'+spec.id+'.webp',prompt:spec.prompt,processing:'Sharp: mechanical cell crop, alpha-aware bounds and webp encoding; no repainting. Whole body anchor metadata manually marked at feet.'},null,2)+'\n');
 console.log(spec.id,JSON.stringify(actor));
}
})().catch(e=>{console.error(e);process.exitCode=1});

