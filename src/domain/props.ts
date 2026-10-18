import {z} from 'zod';
import {CARD_BY_ID} from '../data/cards';
import {PROPS,PROP_BY_ID,PropDefinition} from '../data/props';
import {LOANERS} from './battle';
import type {Save,Command} from './game';
const count=z.number().int().nonnegative().safe();
const propId=z.string().refine(id=>Object.hasOwn(PROP_BY_ID,id),'Unknown prop');
const residentId=z.string().refine(id=>Object.hasOwn(CARD_BY_ID,id),'Unknown resident');
export const propsSchema=z.object({version:z.literal(1),ownedIds:z.array(propId).max(PROPS.length),loadout:z.record(residentId,propId),cityDisplay:propId.nullable(),crafts:count,highestCityLevel:count.max(3)}).superRefine((props,ctx)=>{
 const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 if(new Set(props.ownedIds).size!==props.ownedIds.length)bad('Duplicate prop ownership');
 if(Object.values(props.loadout).some(id=>!props.ownedIds.includes(id)))bad('Equipped prop must be owned');
 if(props.cityDisplay&&!props.ownedIds.includes(props.cityDisplay))bad('Displayed prop must be owned');
});
export type PropsState=z.infer<typeof propsSchema>;
export const freshProps=():PropsState=>({version:1,ownedIds:[],loadout:{},cityDisplay:null,crafts:0,highestCityLevel:0});
export type PropCommand={type:'prop-claim';propId:string}|{type:'prop-equip';residentId:string;propId:string|null}|{type:'prop-display';propId:string|null};
export const propCommandShapes=[z.object({type:z.literal('prop-claim'),propId}),z.object({type:z.literal('prop-equip'),residentId,propId:propId.nullable()}),z.object({type:z.literal('prop-display'),propId:propId.nullable()})] as const;
export class PropRuleError extends Error{constructor(public code:string,message:string){super(message);}}
export function propProgress(save:Save|null,definition:PropDefinition){
 if(!save)return 0;
 switch(definition.milestone){
  case 'entry':return 1;
  case 'wins':return save.battle.wins;
  case 'packs':return save.lifetimePacksOpened;
  case 'daily':return Number(!!save.lastDailyClaimDate);
  case 'discoveries':return save.discoveredCardIds.length;
  case 'fusions':return save.lifetimeFusions;
  case 'crafts':return save.props.crafts;
  case 'buildings':return save.city?.plots.filter(Boolean).length||0;
  case 'upgrades':return Number(Math.max(save.props.highestCityLevel,...(save.city?.plots.map(b=>b?.level||0)||[0]))>=2);
  case 'city-jobs':return Object.values(save.city?.contracts||{}).filter(c=>c.claimed).length;
 }
}
export function propsFor(save:Save|null){return PROPS.map(p=>({...p,progress:Math.min(p.target,propProgress(save,p)),owned:save?.props.ownedIds.includes(p.id)||false,ready:!!save&&!save.props.ownedIds.includes(p.id)&&propProgress(save,p)>=p.target}));}
const ownsResident=(save:Save,id:string)=>LOANERS.includes(id)||(save.inventory[id]?.regular||0)+(save.inventory[id]?.foil||0)>0;
export function refineProps(save:Save,ctx:z.RefinementCtx){
 const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 if(Object.keys(save.props.loadout).some(id=>!ownsResident(save,id)))bad('Prop loadout resident must be owned or a loaner');
 if(save.props.cityDisplay&&!save.city)bad('Prop city display requires a founded city');
 for(const id of save.props.ownedIds)if(!save.awardedRewardIds.includes(`prop:${id}`))bad('Prop ownership requires its reward marker');
 if(save.awardedRewardIds.some(id=>id.startsWith('prop:')&&!save.props.ownedIds.includes(id.slice(5))))bad('Prop reward marker requires ownership');
}
export function applyPropCommand(save:Save,command:PropCommand){
 if(command.type==='prop-claim'){
  const prop=Object.hasOwn(PROP_BY_ID,command.propId)?PROP_BY_ID[command.propId]:null;
  if(!prop)throw new PropRuleError('PROP_UNKNOWN','Choose a known prop.');
  if(save.props.ownedIds.includes(prop.id))throw new PropRuleError('PROP_ALREADY_OWNED','This prop is already in your stash.');
  if(propProgress(save,prop)<prop.target)throw new PropRuleError('PROP_LOCKED',prop.goal);
  save.props.ownedIds.push(prop.id);save.awardedRewardIds.push(`prop:${prop.id}`);return;
 }
 const id=command.propId;
 if(id&&!save.props.ownedIds.includes(id))throw new PropRuleError('PROP_OWNERSHIP','Collect this prop before equipping or displaying it.');
 if(command.type==='prop-equip'){
  if(!Object.hasOwn(CARD_BY_ID,command.residentId)||!ownsResident(save,command.residentId))throw new PropRuleError('PROP_RESIDENT_OWNERSHIP','Choose an owned resident or starter loaner.');
  if(id)save.props.loadout[command.residentId]=id;else delete save.props.loadout[command.residentId];
 }else{
  if(!save.city)throw new PropRuleError('PROP_CITY_MISSING','Found your city before displaying a prop.');
  save.props.cityDisplay=id;
 }
}
export function recordPropActivity(save:Save,before:Save,command:Command){
 if(command.type==='craft')save.props.crafts++;
 save.props.highestCityLevel=Math.max(save.props.highestCityLevel,...(before.city?.plots.map(b=>b?.level||0)||[0]),...(save.city?.plots.map(b=>b?.level||0)||[0]));
}
