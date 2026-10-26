import {describe,expect,it} from 'vitest';
import {navigationGroup,PRIMARY_DESTINATIONS} from '../src/domain/navigation';
describe('navigation families',()=>{
 it('keeps playable flows together across deep links',()=>{for(const path of ['/','/battle/?learn=1','/battle/?practice=1','/roast/','/missions/?tab=daily'])expect(navigationGroup(path)).toBe('play');});
 it('keeps collecting, opening and exchanging in the same family',()=>{for(const path of ['/collection/?type=tactics','/packs/','/market/','/stash/#props'])expect(navigationGroup(path)).toBe('collection');});
 it('does not mistake cinema or unrelated paths for City',()=>{expect(navigationGroup('/city/?view=block')).toBe('city');for(const path of ['/cinema/gobstein/','/cityscape/','/profile/','/settings/'])expect(navigationGroup(path)).toBeNull();});
 it('retains a direct route to every main destination',()=>{expect(PRIMARY_DESTINATIONS.map(link=>[link.label,link.href])).toEqual([['PLAY','/'],['COLLECTION','/collection/'],['CITY','/city/']]);});
});
