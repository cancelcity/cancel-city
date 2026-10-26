import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {PLAYTEST_CHANGE_EVENT,PLAYTEST_KEY,clearPlaytest,finishPlaytest,markPlaytest,readPlaytest,startPlaytest,type PlaytestEventName} from '../src/services/playtest';

const epoch=Date.parse('2026-10-26T10:00:00.000Z');let sequence=0;
let contents:Map<string,string>,changes:string[];
let target:{getItem:ReturnType<typeof vi.fn>;setItem:ReturnType<typeof vi.fn>;removeItem:ReturnType<typeof vi.fn>};
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(epoch);contents=new Map();changes=[];
 target={getItem:vi.fn((key:string)=>contents.get(key)??null),setItem:vi.fn((key:string,value:string)=>{contents.set(key,value);}),removeItem:vi.fn((key:string)=>{contents.delete(key);})};
 vi.stubGlobal('crypto',{randomUUID:()=>`00000000-0000-4000-8000-${String(++sequence).padStart(12,'0')}`});
 vi.stubGlobal('window',{sessionStorage:target,innerWidth:390,innerHeight:844,dispatchEvent:(event:Event)=>{changes.push(event.type);return true;}});
});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});

describe('optional session-only playtest recorder',()=>{
 it('does not opt visitors in or write anything when bridges report ordinary play',()=>{
  expect(readPlaytest()).toBeNull();expect(markPlaytest('route','/packs/')).toBeNull();expect(markPlaytest('pack_opened')).toBeNull();expect(finishPlaytest()).toBeNull();expect(target.setItem).not.toHaveBeenCalled();expect(changes).toEqual([]);
 });
 it('starts only explicitly with a fresh pseudonym, dimensions and no player identifiers',()=>{
  const report=startPlaytest('new');expect(report).toMatchObject({version:1,cohort:'new',startedAt:'2026-10-26T10:00:00.000Z',endedAt:null,viewport:{width:390,height:844},events:[{name:'test_started',elapsedMs:0}]});expect(report?.id).toMatch(/^pt-/);expect(startPlaytest('returning')?.id).not.toBe(report?.id);expect([...contents.keys()]).toEqual([PLAYTEST_KEY]);expect(changes.every(name=>name===PLAYTEST_CHANGE_EVENT)).toBe(true);
 });
 it('records only allowed names and safe detail tokens, stripping route queries and hashes',()=>{
  startPlaytest('new');markPlaytest('route','/city/?zone=private&email=person@example.com#alias');markPlaytest('clash_reply','JAB');markPlaytest('save_unavailable','email person@example.com');markPlaytest('pack_collected','CC021 / player-id');markPlaytest('route','/collection/CC021/');const writes=target.setItem.mock.calls.length;expect(markPlaytest('personal_email' as PlaytestEventName,'secret')).toBeNull();expect(target.setItem).toHaveBeenCalledTimes(writes);
  expect(readPlaytest()?.events.slice(1)).toEqual([{name:'route',elapsedMs:0,detail:'/city/'},{name:'clash_reply',elapsedMs:0,detail:'jab'},{name:'save_unavailable',elapsedMs:0},{name:'pack_collected',elapsedMs:0},{name:'route',elapsedMs:0}]);expect(contents.get(PLAYTEST_KEY)).not.toMatch(/person@example|private|alias|CC021|player-id/);
 });
 it('preserves arrival events, caps ordinary marks at249 and reserves the250th for stopping',()=>{
  startPlaytest('returning');for(let i=1;i<=300;i++){vi.setSystemTime(epoch+i);markPlaytest('visible');}expect(readPlaytest()?.events).toHaveLength(249);const report=finishPlaytest();expect(report?.events).toHaveLength(250);expect(report?.events.at(-1)).toEqual({name:'test_finished',elapsedMs:300});expect(report?.events[0]).toEqual({name:'test_started',elapsedMs:0});expect(report?.events[1].elapsedMs).toBe(1);
 });
 it('resumes from sessionStorage after module reload and clamps elapsed time across clock rollback',async()=>{
  const started=startPlaytest('new');vi.setSystemTime(epoch+5000);markPlaytest('hidden');vi.resetModules();const resumed=await import('../src/services/playtest');expect(resumed.readPlaytest()?.id).toBe(started?.id);vi.setSystemTime(epoch-1000);expect(resumed.markPlaytest('visible')?.events.at(-1)?.elapsedMs).toBe(5000);expect(resumed.finishPlaytest()?.endedAt).toBe('2026-10-26T10:00:05.000Z');
 });
 it('does not write or auto-repair corrupt reports and strips unrelated stored fields on read',()=>{
  const started=startPlaytest('new')!;const writes=target.setItem.mock.calls.length;contents.set(PLAYTEST_KEY,'{broken');expect(readPlaytest()).toBeNull();expect(markPlaytest('visible')).toBeNull();contents.set(PLAYTEST_KEY,JSON.stringify({...started,alias:'DO NOT EXPORT',events:[{name:'route',elapsedMs:0,detail:'/packs/?email=hidden',saveId:'secret'}]}));expect(readPlaytest()?.events).toEqual([{name:'route',elapsedMs:0,detail:'/packs/'}]);expect(JSON.stringify(readPlaytest())).not.toMatch(/DO NOT EXPORT|secret|email/);contents.set(PLAYTEST_KEY,JSON.stringify({...started,events:[{name:'visible',elapsedMs:-1}]}));expect(readPlaytest()).toBeNull();expect(target.setItem).toHaveBeenCalledTimes(writes);
 });
 it('finishes once, bounds explicit feedback and prevents later gameplay events',()=>{
  startPlaytest('new');vi.setSystemTime(epoch+12000);const report=finishPlaytest({fun:'good\n\u0000 '.repeat(600),confusing:'  Finding the next action.  ',again:'maybe'});expect(report?.endedAt).toBe('2026-10-26T10:00:12.000Z');expect(report?.feedback?.fun.length).toBeLessThanOrEqual(500);expect(report?.feedback?.fun).not.toContain('\u0000');expect(report?.feedback?.confusing).toBe('Finding the next action.');const writes=target.setItem.mock.calls.length;expect(markPlaytest('pack_opened')).toBeNull();expect(finishPlaytest()).toEqual(report);expect(target.setItem).toHaveBeenCalledTimes(writes);
 });
 it('saves the questionnaire after End Test without changing duration or reopening capture',()=>{
  startPlaytest('returning');vi.setSystemTime(epoch+30000);const ended=finishPlaytest();vi.setSystemTime(epoch+60000);const answered=finishPlaytest({fun:'The first comeback.',confusing:'Where the pack button went.',again:'yes'});expect(answered?.feedback).toEqual({fun:'The first comeback.',confusing:'Where the pack button went.',again:'yes'});expect(answered?.endedAt).toBe(ended?.endedAt);expect(answered?.events).toEqual(ended?.events);expect(markPlaytest('pack_opened')).toBeNull();expect(finishPlaytest({again:'maybe'})?.feedback).toEqual({...answered?.feedback,again:'maybe'});
 });
 it('fails safely when browser storage is absent, blocked, full or cleared',()=>{
  target.setItem.mockImplementationOnce(()=>{throw new Error('quota');});expect(startPlaytest('new')).toBeNull();expect(contents.size).toBe(0);expect(changes).toEqual([]);startPlaytest('new');target.getItem.mockImplementationOnce(()=>{throw new Error('blocked');});expect(markPlaytest('visible')).toBeNull();target.setItem.mockImplementationOnce(()=>{throw new Error('quota');});expect(finishPlaytest()).toBeNull();expect(markPlaytest('pack_opened')).toBeNull();expect(clearPlaytest()).toBe(true);expect(readPlaytest()).toBeNull();vi.stubGlobal('window',undefined);expect(startPlaytest('new')).toBeNull();expect(readPlaytest()).toBeNull();expect(clearPlaytest()).toBe(false);
 });
 it('honors stop in this page even when both final save and removal are denied',()=>{
  startPlaytest('new');target.setItem.mockImplementation(()=>{throw new Error('denied');});target.removeItem.mockImplementation(()=>{throw new Error('denied');});expect(finishPlaytest()).toBeNull();const attempts=target.setItem.mock.calls.length;expect(markPlaytest('route','/battle/')).toBeNull();expect(target.setItem).toHaveBeenCalledTimes(attempts);
 });
});
