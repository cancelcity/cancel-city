// Offline policy diagnostic of actual commands. Not human difficulty or retention evidence.
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),require=createRequire(import.meta.url),ts=require('typescript'),destination=path.join(root,'.sites-runtime/city-model');
await mkdir(destination,{recursive:true});await writeFile(path.join(destination,'package.json'),'{"type":"commonjs"}');
for(const relative of ['data/cards','data/combat-kit','data/city','data/props','domain/city','domain/props','domain/battle','domain/game','domain/progression']){const output=path.join(destination,`${relative}.js`);await mkdir(path.dirname(output),{recursive:true});await writeFile(output,ts.transpileModule(await readFile(`src/${relative}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);}
await writeFile(path.join(destination,'data/catalogue.json'),await readFile('src/data/catalogue.json'));
const {applyCommand,initialSave,EXCHANGE}=require(path.join(destination,'domain/game.js')),{CARDS}=require(path.join(destination,'data/cards.js')),{BUILDINGS,CITY_BALANCE}=require(path.join(destination,'data/city.js')),{cityJobs,plotUnlock,cityCanCollect}=require(path.join(destination,'domain/city.js')),{readyMissions}=require(path.join(destination,'domain/progression.js')),{LOANERS,maxHp}=require(path.join(destination,'domain/battle.js')),{KITS}=require(path.join(destination,'data/combat-kit.js'));
const rows=[];
for(let player=0;player<10;player++){
 let now=new Date('2026-10-12T12:00:00Z'),save=initialSave(now,`sim-${player}`),seq=0,seed=912367+player*977,allTypesDay=null,allJobsDay=null,firstLevel3Day=null;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const run=command=>{save=applyCommand(save,command,now,random,`sim-${++seq}`,save.revision);};
 run({type:'city-start'});
 const owns=id=>LOANERS.includes(id)||(save.inventory[id]?.regular||0)+(save.inventory[id]?.foil||0)>0;
 const claim=()=>{for(const m of readyMissions(save,now))run({type:'claim-mission',missionId:m.id});for(const j of cityJobs(save))if(j.available&&j.state&&!j.state.claimed&&j.state.progress>=j.target)run({type:'city-claim',contractId:j.id});};
 const arrange=()=>{
  for(const [index,b] of BUILDINGS.entries())if(!save.city.plots[index]&&save.city.influence>=b.cost)run({type:'city-build',plot:index,kind:b.id});
  for(const [index,b] of BUILDINGS.entries())if(save.city.plots[index]){const candidates=CARDS.filter(c=>c.faction===b.faction&&owns(c.id)).sort((a,b)=>b.stats.clout-a.stats.clout),best=candidates[0];if(best&&save.city.plots[index].residentId!==best.id)run({type:'city-assign',plot:index,residentId:best.id});}
  for(const [index,b] of BUILDINGS.entries()){const plot=save.city.plots[index];if(plot?.level===1&&save.city.contracts[`${b.id}:1`]?.claimed&&save.city.influence>=120)run({type:'city-upgrade',plot:index});if(plot?.level===2&&save.city.contracts[`${b.id}:2`]?.claimed&&save.city.influence>=240)run({type:'city-upgrade',plot:index});}
  for(const j of cityJobs(save))if(j.available&&!j.state)run({type:'city-accept',contractId:j.id});
 };
 for(let day=1;day<=30;day++){
  now=new Date(Date.UTC(2026,9,11+day,12));run({type:'daily'});arrange();claim();
  let packs=0;while(save.packBalance>0){if(++packs>50)throw new Error('Unexpected reward loop');run({type:'open',sessionId:`pack-${day}-${packs}`});run({type:'reveal',count:5});run({type:'acknowledge'});arrange();claim();}
  const foil=CARDS.find(c=>(save.inventory[c.id]?.regular||0)>=3);if(foil)run({type:'fuse',cardId:foil.id});
  for(const c of CARDS)while((save.inventory[c.id]?.regular||0)>1)run({type:'recycle',cardId:c.id});
  for(let craft=0;craft<2;craft++)if(cityJobs(save).some(j=>j.kind==='rocket'&&j.state&&!j.state.claimed&&j.state.progress<j.target)&&save.career.scrap>=20){const candidate=CARDS.find(c=>c.rarity==='nobody'&&!owns(c.id))||CARDS[0];if(save.career.scrap>=EXCHANGE[candidate.rarity].craft)run({type:'craft',cardId:candidate.id});}
  for(let fight=0;fight<2;fight++){
   const desired=cityJobs(save).filter(j=>j.event==='win'&&j.available&&j.state&&!j.state.claimed&&j.state.progress<j.target).map(j=>j.host.residentId),team=[...new Set([...desired,...LOANERS])].slice(0,3);run({type:'battle-start',matchId:`fight-${day}-${fight}`,districtId:'street',team});
   while(save.battle.active.phase!=='finished'){const m=save.battle.active;if(m.phase==='enemy')run({type:'battle-enemy',matchId:m.id,step:m.step});else{const f=m.player[m.playerActive],k=KITS[f.cardId],special=f.charge===3&&(k.bonus>0||f.hp<maxHp(f.cardId,m.districtId,'player',2)*.7);run({type:'battle-act',matchId:m.id,step:m.step,action:{type:special?'ability':'attack'}});}}
   claim();arrange();
  }
  if(cityCanCollect(save.city,now)){const before=save.city.lifetimeGenerated;run({type:'city-collect'});if(save.city.lifetimeGenerated-before>CITY_BALANCE.dailyCap)throw new Error('Daily cap exceeded');}arrange();claim();
  if(save.city.plots.filter(Boolean).length>=6)allTypesDay??=day;if(save.city.plots.some(b=>b?.level===3))firstLevel3Day??=day;if(Object.values(save.city.contracts).filter(c=>c.claimed).length===12)allJobsDay??=day;
 }
 rows.push({player,allTypesDay,firstLevel3Day,allJobsDay,claimedJobs:Object.values(save.city.contracts).filter(c=>c.claimed).length,generatedInfluence:save.city.lifetimeGenerated,cityPackRewards:save.awardedRewardIds.filter(id=>id.startsWith('city-job:')).length,discovered:save.discoveredCardIds.length,levels:save.city.plots.slice(0,6).map(b=>b?.level||0)});
}
const report={players:rows.length,days:30,policy:'No missed days. Claims ordinary jobs, opens all earned packs, fuses once daily, recycles spare regulars, crafts for rocket jobs, and attempts two heuristic street battles per day. Builds one of each type, upgrades after chapter rewards. Does not simulate filling extra decorative plots.',limits:['Synthetic policy, not measured human fun/retention or a complete economy balance approval.','Battles use a simple player heuristic.','Server clock, network failure and real devices are covered separately or remain QA gates.'],rows};await writeFile('docs/city-simulation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({players:10,allSixByDay3:rows.filter(r=>r.allTypesDay&&r.allTypesDay<=3).length,allJobsByDay30:rows.filter(r=>r.allJobsDay).length,minimumClaimedJobs:Math.min(...rows.map(r=>r.claimedJobs)),maximumGenerated:Math.max(...rows.map(r=>r.generatedInfluence)),maximumCityPackRewards:Math.max(...rows.map(r=>r.cityPackRewards))}));
