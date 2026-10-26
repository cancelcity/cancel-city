import {beforeEach,describe,it,expect,vi} from 'vitest';
import {initialSave,applyCommand} from '../src/domain/game';
let storage:Map<string,string>;
beforeEach(()=>{vi.resetModules();storage=new Map();vi.stubGlobal('location',{hostname:'city.test'});vi.stubGlobal('navigator',{locks:{request:vi.fn((_name:string,fn:()=>unknown)=>Promise.resolve().then(fn))}});vi.stubGlobal('localStorage',{getItem:(key:string)=>storage.get(key)||null,setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)});});
const response=(body:unknown)=>Response.json(body);
describe('cloud client recovery',()=>{
 it('requires an explicit migration choice and keeps the legacy backup intact',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');storage.set(SAVE_KEY,JSON.stringify(initialSave(new Date(),'legacy')));vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({save:null,verified:false,publicRank:false})));useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(useGame.getState().migration?.playerId).toBe('legacy');expect(await useGame.getState().enter()).toBe(false);expect(JSON.parse(storage.get(SAVE_KEY)!).playerId).toBe('legacy');});
 it('never replaces an existing cloud account with the browser save',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');storage.set(SAVE_KEY,JSON.stringify(initialSave(new Date(),'old-local')));vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({save:initialSave(new Date(),'cloud-owner'),verified:true,publicRank:false})));useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(useGame.getState().save?.playerId).toBe('cloud-owner');expect(useGame.getState().migration).toBeNull();expect(JSON.parse(storage.get(SAVE_KEY)!).playerId).toBe('old-local');});
 it('refuses offline mutations without altering cached inventory',async()=>{const {useGame,CLOUD_KEY}=await import('../src/state/store');const cached=JSON.stringify(initialSave(new Date(),'cloud'));storage.set(CLOUD_KEY,cached);vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('Network unavailable')));useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().mode).toBe('offline'));expect(await useGame.getState().run({type:'open',sessionId:'x'})).toBe(false);expect(storage.get(CLOUD_KEY)).toBe(cached);});
 it('retries a lost command response with the identical id and revision',async()=>{const {useGame}=await import('../src/state/store');const now=new Date(),save=initialSave(now,'cloud');const requests:{id:string;revision:number}[]=[];const fetchMock=vi.fn().mockResolvedValueOnce(response({save,verified:true,publicRank:false})).mockImplementation(async(_url:string,options:RequestInit)=>{const body=JSON.parse(options.body as string);requests.push(body);if(requests.length===1)throw new Error('Response lost');return response({save:applyCommand(save,body.command,now,()=>0,body.id,body.revision),verified:true,publicRank:false});});vi.stubGlobal('fetch',fetchMock);useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(await useGame.getState().run({type:'open',sessionId:'pack'})).toBe(true);expect(requests).toHaveLength(2);expect(requests[0].id).toBe(requests[1].id);expect(requests[0].revision).toBe(requests[1].revision);expect(useGame.getState().save?.packBalance).toBe(2);});
});
describe('download-free migration',()=>{
 it('keeps progress without starting a file download',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');const old=initialSave(new Date(),'legacy');storage.set(SAVE_KEY,JSON.stringify(old));const download=vi.fn(()=>{throw new Error('No download should occur');});vi.stubGlobal('document',{createElement:download});const saved={...old,playerId:'cloud-owner'};vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(response({save:null,verified:false,publicRank:false})).mockResolvedValueOnce(response({save:saved,verified:false,publicRank:false})));useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(await useGame.getState().migrate(true)).toBe(true);expect(download).not.toHaveBeenCalled();expect(useGame.getState().save?.playerId).toBe('cloud-owner');expect(JSON.parse(storage.get('cancel-city.pre-migration.v1')!).playerId).toBe('legacy');});
 it('does not require writable browser storage to transfer a readable old save',async()=>{const {useGame,SAVE_KEY}=await import('../src/state/store');const old=initialSave(new Date(),'legacy');storage.set(SAVE_KEY,JSON.stringify(old));vi.stubGlobal('localStorage',{getItem:(key:string)=>storage.get(key)||null,setItem:()=>{throw new Error('Quota');},removeItem:(key:string)=>storage.delete(key)});vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(response({save:null,verified:false,publicRank:false})).mockResolvedValueOnce(response({save:{...old,playerId:'cloud'},verified:false,publicRank:false})));useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(await useGame.getState().migrate(true)).toBe(true);expect(useGame.getState().save?.playerId).toBe('cloud');});
});

const anonymous=()=>Response.json({error:'Sign in with ChatGPT to save your city.',code:'AUTH_REQUIRED'},{status:401});
describe('public guest saves',()=>{
 it('creates an isolated guest after an explicit authentication response and saves a complete pack without cloud writes',async()=>{
  const {useGame,GUEST_KEY,SAVE_KEY,CLOUD_KEY}=await import('../src/state/store');
  const cloud=JSON.stringify(initialSave(new Date(),'cloud-owner')),legacy=JSON.stringify(initialSave(new Date(),'legacy'));
  storage.set(CLOUD_KEY,cloud);storage.set(SAVE_KEY,legacy);
  const fetchMock=vi.fn().mockImplementation(async()=>anonymous());vi.stubGlobal('fetch',fetchMock);
  useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));
  expect(useGame.getState()).toMatchObject({mode:'local',guest:true,error:null,save:null,verified:false,publicRank:false});
  expect(await useGame.getState().enter()).toBe(true);
  const id=useGame.getState().save!.playerId;expect(id).not.toBe('cloud-owner');expect(id).not.toBe('legacy');expect(useGame.getState().save!.alias).toMatch(/^GUEST_/);
  expect(await useGame.getState().run({type:'open',sessionId:'guest-pack'})).toBe(true);
  expect(await useGame.getState().run({type:'reveal',count:5})).toBe(true);
  expect(await useGame.getState().run({type:'acknowledge'})).toBe(true);
  const saved=JSON.parse(storage.get(GUEST_KEY)!);expect(saved.playerId).toBe(id);expect(saved.packBalance).toBe(2);expect(saved.pendingOpening).toBeNull();expect(saved.lifetimeCardsPulled).toBe(5);
  expect(storage.get(CLOUD_KEY)).toBe(cloud);expect(storage.get(SAVE_KEY)).toBe(legacy);expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(navigator.locks.request).toHaveBeenCalledWith('cancel-city-guest-save',expect.any(Function));
  vi.resetModules();const reloaded=await import('../src/state/store');reloaded.useGame.getState().hydrate();await vi.waitFor(()=>expect(reloaded.useGame.getState().hydrated).toBe(true));
  expect(reloaded.useGame.getState().save).toEqual(saved);expect(reloaded.useGame.getState().guest).toBe(true);
 });
 it.each(['network','server','forbidden','other-401'] as const)('keeps failures read-only instead of switching an account to guest: %s',async(kind)=>{
  const {useGame,GUEST_KEY,CLOUD_KEY}=await import('../src/state/store');const cloud=JSON.stringify(initialSave(new Date(),'cloud-owner')),guest=JSON.stringify(initialSave(new Date(),'guest-owner'));
  storage.set(CLOUD_KEY,cloud);storage.set(GUEST_KEY,guest);
  const fetchMock=kind==='network'?vi.fn().mockRejectedValue(new Error('Network unavailable')):vi.fn().mockResolvedValue(Response.json({error:'Unavailable',code:kind==='other-401'?'OTHER':'AUTH_REQUIRED'},{status:kind==='server'?503:kind==='forbidden'?403:401}));
  vi.stubGlobal('fetch',fetchMock);useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));
  expect(useGame.getState()).toMatchObject({mode:'offline',guest:false});expect(useGame.getState().save?.playerId).toBe('cloud-owner');expect(await useGame.getState().enter()).toBe(false);expect(await useGame.getState().run({type:'open',sessionId:'blocked'})).toBe(false);expect(storage.get(CLOUD_KEY)).toBe(cloud);expect(storage.get(GUEST_KEY)).toBe(guest);
 });
 it('keeps a partial reveal on refresh',async()=>{
  const {useGame,GUEST_KEY}=await import('../src/state/store');vi.stubGlobal('fetch',vi.fn().mockImplementation(async()=>anonymous()));
  useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));await useGame.getState().enter();await useGame.getState().run({type:'open',sessionId:'unfinished'});await useGame.getState().run({type:'reveal',count:2});
  const saved=JSON.parse(storage.get(GUEST_KEY)!);vi.resetModules();const next=await import('../src/state/store');next.useGame.getState().hydrate();await vi.waitFor(()=>expect(next.useGame.getState().hydrated).toBe(true));expect(next.useGame.getState().save?.pendingOpening).toEqual(saved.pendingOpening);expect(next.useGame.getState().save?.packBalance).toBe(2);
 });
 it('makes quota failures visible without pretending a pack was saved',async()=>{
  const {useGame,GUEST_KEY}=await import('../src/state/store');vi.stubGlobal('fetch',vi.fn().mockImplementation(async()=>anonymous()));
  useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));await useGame.getState().enter();const original=storage.get(GUEST_KEY);
  vi.stubGlobal('localStorage',{getItem:(key:string)=>storage.get(key)||null,setItem:()=>{throw new DOMException('Storage full','QuotaExceededError');},removeItem:(key:string)=>storage.delete(key)});
  expect(await useGame.getState().run({type:'open',sessionId:'unsaved'})).toBe(false);expect(useGame.getState().error).toContain('storage is full');expect(useGame.getState().save?.packBalance).toBe(3);expect(useGame.getState().save?.pendingOpening).toBeNull();expect(storage.get(GUEST_KEY)).toBe(original);
 });
 it('imports and resets only the guest slot, leaving account and legacy records intact',async()=>{
  const {useGame,GUEST_KEY,SAVE_KEY,CLOUD_KEY}=await import('../src/state/store');const cloud=JSON.stringify(initialSave(new Date(),'cloud-owner')),legacy=JSON.stringify(initialSave(new Date(),'legacy'));storage.set(CLOUD_KEY,cloud);storage.set(SAVE_KEY,legacy);
  const fetchMock=vi.fn().mockImplementation(async()=>anonymous());vi.stubGlobal('fetch',fetchMock);useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));
  const restored=initialSave(new Date(),'personal-backup');expect(await useGame.getState().importSave(JSON.stringify(restored))).toBe(true);expect(JSON.parse(storage.get(GUEST_KEY)!).playerId).toBe('personal-backup');expect(useGame.getState()).toMatchObject({verified:false,publicRank:false});
  expect(await useGame.getState().reset()).toBe(true);expect(storage.has(GUEST_KEY)).toBe(false);expect(storage.get(CLOUD_KEY)).toBe(cloud);expect(storage.get(SAVE_KEY)).toBe(legacy);expect(fetchMock).toHaveBeenCalledTimes(1);
 });
 it.each([true,false])('requires a migration choice and retains both device backups after choosing preserve=%s',async(preserve)=>{
  const {useGame,GUEST_KEY,SAVE_KEY}=await import('../src/state/store');const guest=JSON.stringify(initialSave(new Date(),'guest-owner')),legacy=JSON.stringify(initialSave(new Date(),'legacy'));storage.set(GUEST_KEY,guest);storage.set(SAVE_KEY,legacy);
  const fetchMock=vi.fn().mockResolvedValueOnce(response({save:null,verified:false,publicRank:false})).mockResolvedValueOnce(response({save:initialSave(new Date(),'new-account'),verified:!preserve,publicRank:false}));vi.stubGlobal('fetch',fetchMock);
  useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(useGame.getState()).toMatchObject({guest:false,mode:'cloud',migrationSource:'guest'});expect(useGame.getState().migration?.playerId).toBe('guest-owner');expect(await useGame.getState().enter()).toBe(false);
  expect(await useGame.getState().migrate(preserve)).toBe(true);const body=JSON.parse(fetchMock.mock.calls[1][1].body as string);expect(body).toEqual(preserve?{legacy:JSON.parse(guest)}:{});expect(storage.get(GUEST_KEY)).toBe(guest);expect(storage.get(SAVE_KEY)).toBe(legacy);expect(useGame.getState().save?.playerId).toBe('new-account');expect(useGame.getState().migration).toBeNull();
 });
 it('uses an existing account without importing or erasing the separate guest',async()=>{
  const {useGame,GUEST_KEY}=await import('../src/state/store');const guest=JSON.stringify(initialSave(new Date(),'guest-owner'));storage.set(GUEST_KEY,guest);const fetchMock=vi.fn().mockResolvedValue(response({save:initialSave(new Date(),'account-owner'),verified:true,publicRank:false}));vi.stubGlobal('fetch',fetchMock);useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));expect(useGame.getState().save?.playerId).toBe('account-owner');expect(useGame.getState().migration).toBeNull();expect(await useGame.getState().migrate(true)).toBe(false);expect(storage.get(GUEST_KEY)).toBe(guest);expect(fetchMock).toHaveBeenCalledTimes(1);
 });
 it('ignores an older anonymous response after the latest hydration finds an account',async()=>{
  const {useGame}=await import('../src/state/store');let resolveOld!:(value:Response)=>void;const first=new Promise<Response>(resolve=>{resolveOld=resolve;});vi.stubGlobal('fetch',vi.fn().mockReturnValueOnce(first).mockResolvedValueOnce(response({save:initialSave(new Date(),'account-owner'),verified:true,publicRank:false})));
  useGame.getState().hydrate();useGame.getState().hydrate();await vi.waitFor(()=>expect(useGame.getState().hydrated).toBe(true));resolveOld(anonymous());await new Promise(resolve=>setTimeout(resolve,0));expect(useGame.getState()).toMatchObject({mode:'cloud',guest:false});expect(useGame.getState().save?.playerId).toBe('account-owner');
 });
});
