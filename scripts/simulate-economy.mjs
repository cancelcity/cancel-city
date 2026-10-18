// Offline diagnostic of actual game commands. This is not a browser playtest.
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),ts=require('typescript');
const destination=path.join(root,'.sites-runtime/economy-model');
await mkdir(destination,{recursive:true});
await writeFile(path.join(destination,'package.json'),'{"type":"commonjs"}');
for(const relative of ['data/cards','data/combat-kit','data/city','data/props','domain/city','domain/props','domain/battle','domain/game','domain/progression']){
 const output=path.join(destination,`${relative}.js`);await mkdir(path.dirname(output),{recursive:true});
 const source=await readFile(path.join(root,`src/${relative}.ts`),'utf8');
 await writeFile(output,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
}
await writeFile(path.join(destination,'data/catalogue.json'),await readFile(path.join(root,'src/data/catalogue.json')));
const {initialSave,applyCommand}=require(path.join(destination,'domain/game.js'));
const {readyMissions}=require(path.join(destination,'domain/progression.js'));
const {CARDS,BALANCE}=require(path.join(destination,'data/cards.js'));
const players=200,maxDays=180,rows=[];
for(let player=0;player<players;player++){
 let seed=123456789+player*977;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 let now=new Date('2026-10-12T12:00:00Z'),save=initialSave(now,`sim-${player}`),commands=0,firstMythicDay=null,completionDay=null,firstFoilDay=null;
 const run=command=>{save=applyCommand(save,command,now,random,`sim-command-${++commands}`,save.revision);};
 for(let day=1;day<=maxDays;day++){
  now=new Date(Date.UTC(2026,9,11+day,12));run({type:'daily'});let fused=false,opened=0;
  while(true){
   for(const job of readyMissions(save,now))run({type:'claim-mission',missionId:job.id});
   if(!fused){const card=CARDS.find(c=>(save.inventory[c.id]?.regular||0)>=3);if(card){run({type:'fuse',cardId:card.id});fused=true;firstFoilDay??=day;continue;}}
   if(!save.packBalance)break;
   if(++opened>50)throw new Error('Unexpected pack reward loop');
   run({type:'open',sessionId:`sim-pack-${player}-${day}-${opened}`});
   if(firstMythicDay===null&&save.discoveredCardIds.some(id=>CARDS.find(c=>c.id===id)?.rarity==='public-enemy'))firstMythicDay=day;
   if(save.discoveredCardIds.length===CARDS.length)completionDay??=day;
   run({type:'reveal',count:5});run({type:'acknowledge'});
  }
  if(completionDay!==null)break;
 }
 rows.push({firstMythicDay,firstFoilDay,completionDay,packsOpened:save.lifetimePacksOpened,discovered:save.discoveredCardIds.length});
}
const percentile=(values,p)=>{const list=values.filter(v=>v!==null).sort((a,b)=>a-b);return list[Math.min(list.length-1,Math.ceil(list.length*p)-1)]??null;};
const report={balanceVersion:BALANCE.version,players,maxDays,seed:'123456789 + player × 977',scenario:'Every player claims the daily grant, opens every earned pack, claims every ready job, and fuses at most once daily. Battles, mastery and scrap crafting are excluded in this baseline. Monday start. Optimistic engagement; no missed days. Synthetic simulation, not observed players.',firstMythicDay:{p50:percentile(rows.map(r=>r.firstMythicDay),.5),p90:percentile(rows.map(r=>r.firstMythicDay),.9)},firstFoilDay:{p50:percentile(rows.map(r=>r.firstFoilDay),.5),p90:percentile(rows.map(r=>r.firstFoilDay),.9)},collectionCompletion:{finishedWithinHorizon:rows.filter(r=>r.completionDay!==null).length,p50Days:percentile(rows.map(r=>r.completionDay),.5),p90Days:percentile(rows.map(r=>r.completionDay),.9),p99Days:percentile(rows.map(r=>r.completionDay),.99),finishedByDay7:rows.filter(r=>r.completionDay!==null&&r.completionDay<=7).length,finishedByDay30:rows.filter(r=>r.completionDay!==null&&r.completionDay<=30).length,p50Packs:percentile(rows.map(r=>r.packsOpened),.5)},limitations:['Small synthetic cohort; percentiles are estimates.','Completion percentiles are conditional on finishing within the horizon.','Does not model missed days, optional jobs, player attention or all-foil completion.','A no-pity pool always has an unbounded unlucky tail.','Results require product targets and human playtesting before production sign-off.']};
await writeFile(path.join(root,'docs/economy-simulation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
