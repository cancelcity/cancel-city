import {KITS} from '../data/combat-kit';

// Roles describe the authored Special; they never depend on cosmetic rarity.
export function fighterRole(id:string){
 const kit=KITS[id];
 if(kit.teamHeal)return {name:'SUPPORT',text:'Restores allied HP with a Special.'};
 if(kit.bonus===0&&kit.heal)return {name:'HEALER',text:'Trades Special damage for recovery.'};
 if(kit.shield===.6)return {name:'DEFENDER',text:'Raises a strong temporary shield with a Special.'};
 if(kit.drain||kit.weaken||kit.expose)return {name:'DISRUPTOR',text:'Disrupts enemy hype or changes the next hit.'};
 return {name:'STRIKER',text:kit.pierce?'Special pierces DEF and shields.':'Special focuses on direct damage.'};
}
export const TRAINING_ROSTER=['CC001','CC002','CC003','CC007','CC008','CC010','CC012','CC014','CC015','CC016','CC021','CC027'];
