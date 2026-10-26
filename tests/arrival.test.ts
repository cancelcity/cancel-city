import {describe,it,expect} from 'vitest';
import {initialSave} from '../src/domain/game';
import {showFirstClash} from '../src/domain/arrival';

describe('first arrival gate',()=>{
 it('shows a fresh visitor the playable introduction without waiting for an account',()=>{expect(showFirstClash(null,false)).toBe(true);expect(showFirstClash(initialSave(new Date(),'new'),false)).toBe(true);});
 it('returns an established player to their game and respects an explicit challenge',()=>{const save=initialSave(new Date(),'returning');save.lifetimePacksOpened=1;expect(showFirstClash(save,false)).toBe(false);expect(showFirstClash(save,true,false,true)).toBe(true);});
 it('does not interrupt a started scene when account hydration finishes',()=>{const save=initialSave(new Date(),'returning');save.battle.wins=1;expect(showFirstClash(save,false,true)).toBe(true);});
 it('keeps the introduction dismissed when a player goes straight to the game',()=>{expect(showFirstClash(null,true)).toBe(false);});
});
