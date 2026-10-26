import type {Save} from './game';

export function hasPlayedInCity(save:Save|null){
 return !!save&&(save.lifetimePacksOpened>0||save.discoveredCardIds.length>0||!!save.pendingOpening||save.battle.wins+save.battle.losses>0||!!save.battle.active||!!save.roast||!!save.city);
}
export function showFirstClash(save:Save|null,completed:boolean,began=false,challenge=false){
 return challenge||began||!completed&&!hasPlayedInCity(save);
}
