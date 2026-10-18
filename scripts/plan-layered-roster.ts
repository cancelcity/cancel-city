import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {CARDS} from '../src/data/cards';
import {specialAt} from '../src/data/specials';
import {LAYERED_FILMS} from '../src/data/layered-films';
import actors from '../src/data/actor-cast.json';
const next=JSON.parse(await readFile('docs/production/next-twenty.json','utf8'));
const priority=['CC010','CC019','CC017','CC011','CC012','CC016','CC004','CC007','CC014',...next.cards.map((c:{cardId:string})=>c.cardId)];
const assetCast=actors as Record<string,{poses:unknown[]}>;
const records=await Promise.all(CARDS.map(async card=>{
 const direction=specialAt(card.id),film=LAYERED_FILMS.find(f=>f.cardId===card.id);
 let verified=false;if(film)try{const report=JSON.parse(await readFile(`docs/art/layered-specials/${film.slug}/render-report.json`,'utf8'));verified=report.verification.decoded&&report.verification.duration&&report.backgroundStability.every((s:{lockedBackgroundIdentical:boolean})=>s.lockedBackgroundIdentical);}catch{}
 const queued=next.cards.find((c:{cardId:string})=>c.cardId===card.id);let artReady=false;
 if(queued?.productionSlug)try{const manifest=JSON.parse(await readFile(`docs/art/layered-specials/${queued.productionSlug}/manifest.json`,'utf8'));artReady=manifest.sheets.length>=2&&!!manifest.background.path;}catch{}
 const status=verified?'render-verified':film?'in-production':artReady?'art-ready':'queued';
 if(queued)queued.status=status;
 return {cardId:card.id,name:card.name,ability:card.ability,status,priority:priority.includes(card.id)?priority.indexOf(card.id)+1:100+card.number,reference:card.art,existingWholeBodyPoses:assetCast[card.id]?.poses.length??0,film:film?.video??null,storyboard:{setup:direction.setup,attack:direction.attack,impact:direction.impact,ending:card.quote},qualityGate:['matching card identity and scratched ink style','intact alpha actors','fixed opaque scenery','continuous camera and prop trajectories','character-specific setup, impact and ending','decoded media and exact duration','production archive contains current page and assets']};
}));
records.sort((a,b)=>a.priority-b.priority);
await writeFile('docs/production/next-twenty.json',JSON.stringify(next,null,2)+'\n');
await mkdir('docs/production',{recursive:true});
await writeFile('docs/production/layered-roster.json',JSON.stringify({target:CARDS.length,reference:'/cinema/gokart/',renderVerified:records.filter(r=>r.status==='render-verified').length,notes:'Render verification is local QA, not a claim of browser or audible playback. Publication is recorded by native Site versions. Gokart is a standalone style prototype and is not counted as a separate roster card.',cards:records},null,2)+'\n');
await writeFile('docs/production/layered-roster.md',`# Layered cinematic production\n\nTarget: all ${CARDS.length} active roster cards. The approved Gokart prototype is the style and compositing reference. Each finished card requires a distinct attack and ending; queued cards retain their current special. IDs, kits, inventory and pull odds are unchanged.\n\n| Card | Character | Status | Existing intact poses |\n| --- | --- | --- | --- |\n`+records.map(r=>`| ${r.cardId} | ${r.name} | ${r.status} | ${r.existingWholeBodyPoses} |`).join('\n')+'\n');
console.log(`${CARDS.length} cards tracked; ${records.filter(r=>r.status==='render-verified').length} films verified.`);
