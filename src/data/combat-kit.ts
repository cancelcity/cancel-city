export interface CombatKit {bonus:number;heal?:number;shield?:.35|.6;drain?:number;weaken?:boolean;pierce?:boolean;expose?:boolean;recharge?:number;teamHeal?:number;cleanse?:boolean;style:'ratio'|'wellness'|'riot'|'propaganda'|'rug'|'curse'}
import {EXPANSION_KITS} from './expansion';
import {MEGA_KITS} from './mega';
// Authored kits use the existing character names and ability labels.
export const KITS:Record<string,CombatKit>={
 CC001:{bonus:18,weaken:true,style:'ratio'},CC002:{bonus:8,drain:3,style:'ratio'},CC003:{bonus:3,expose:true,recharge:1,style:'ratio'},CC004:{bonus:13,expose:true,style:'ratio'},CC005:{bonus:10,drain:2,shield:.35,style:'ratio'},
 CC006:{bonus:8,heal:14,recharge:1,style:'wellness'},CC007:{bonus:0,heal:28,teamHeal:8,style:'wellness'},CC008:{bonus:0,heal:25,cleanse:true,shield:.6,style:'wellness'},CC009:{bonus:10,teamHeal:10,style:'wellness'},CC010:{bonus:7,heal:18,shield:.35,style:'wellness'},
 CC011:{bonus:10,weaken:true,shield:.35,style:'riot'},CC012:{bonus:0,heal:20,shield:.6,recharge:1,style:'riot'},CC013:{bonus:14,drain:1,heal:10,style:'riot'},CC014:{bonus:22,style:'riot'},CC015:{bonus:14,pierce:true,weaken:true,style:'riot'},
 CC016:{bonus:0,teamHeal:15,shield:.6,style:'propaganda'},CC017:{bonus:10,expose:true,style:'propaganda'},CC018:{bonus:17,pierce:true,style:'propaganda'},CC019:{bonus:15,weaken:true,drain:1,style:'propaganda'},CC020:{bonus:12,drain:2,expose:true,style:'propaganda'},
 CC021:{bonus:20,pierce:true,style:'rug'},CC022:{bonus:6,shield:.6,heal:12,style:'rug'},CC023:{bonus:12,drain:2,pierce:true,style:'rug'},CC024:{bonus:18,pierce:true,expose:true,style:'rug'},CC025:{bonus:6,heal:20,cleanse:true,recharge:1,style:'rug'},
 CC026:{bonus:17,heal:12,style:'curse'},CC027:{bonus:8,shield:.6,cleanse:true,style:'curse'},CC028:{bonus:5,expose:true,weaken:true,style:'curse'},CC029:{bonus:16,heal:18,drain:1,style:'curse'},CC030:{bonus:12,heal:18,teamHeal:5,style:'curse'},
 CC031:{bonus:9,drain:3,expose:true,style:'ratio'},CC032:{bonus:15,weaken:true,recharge:1,style:'ratio'},
 CC033:{bonus:15,pierce:true,shield:.35,style:'wellness'},CC034:{bonus:1,heal:16,drain:2,style:'wellness'},
 CC035:{bonus:11,teamHeal:7,shield:.35,style:'riot'},CC036:{bonus:3,teamHeal:18,cleanse:true,style:'riot'},
 CC037:{bonus:19,expose:true,recharge:1,style:'propaganda'},CC038:{bonus:4,heal:15,shield:.6,style:'propaganda'},
 CC039:{bonus:21,pierce:true,drain:2,style:'rug'},CC040:{bonus:9,weaken:true,pierce:true,style:'rug'},
 CC041:{bonus:23,heal:9,style:'curse'},CC042:{bonus:2,heal:24,cleanse:true,style:'curse'},
 CC043:{bonus:16,expose:true,heal:6,style:'curse'},CC044:{bonus:11,recharge:2,weaken:true,style:'ratio'},
 CC045:{bonus:5,heal:17,shield:.35,cleanse:true,style:'wellness'},CC046:{bonus:14,drain:2,shield:.35,style:'propaganda'},
 CC047:{bonus:7,cleanse:true,expose:true,teamHeal:6,style:'curse'},CC048:{bonus:18,drain:3,weaken:true,style:'ratio'},
 CC049:{bonus:0,teamHeal:12,shield:.35,cleanse:true,style:'riot'},CC050:{bonus:11,drain:1,recharge:1,pierce:true,style:'rug'},
 ...EXPANSION_KITS,
 ...MEGA_KITS,
};
export const PASSIVES={
 'terminally-online':{name:'First reply',text:'First call out removes 1 enemy hype.'},
 'corporate-hell':{name:'Emergency PR',text:'Once per fight, restore 8 composure when below one third.'},
 'international-incidents':{name:'Diplomatic immunity',text:'First guard clears weakness and exposure.'},
 'politics-hypocrisy':{name:'Spin cycle',text:'First ability refunds 1 hype.'},
 'crypto-degenerates':{name:'Exit liquidity',text:'First ability against a guarded target deals 8 extra base damage.'},
 'cursed-society':{name:'Main character',text:'First knockout restores up to 12 composure.'},
} as const;
