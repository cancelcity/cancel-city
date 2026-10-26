import {describe,expect,it} from 'vitest';
import {clashChallengeUrl,clashPlainText,clashVerdictFilename,wrapClashText} from '../src/services/clash-export-text';

describe('shareable clash image text',()=>{
 it('keeps quotes and HTML-looking jokes as plain text while removing controls',()=>{expect(clashPlainText('  <b>this you?</b>\n\u0000 "yes"  ')).toBe('<b>this you?</b> "yes"');});
 it('wraps long reply words without dropping letters or exceeding the text box',()=>{const text='A'.repeat(157),lines=wrapClashText(text,24,value=>value.length);expect(lines.join('')).toBe(text);expect(lines.every(line=>line.length<=24)).toBe(true);});
 it('keeps a full long exchange readable over multiple lines',()=>{const text='Your controller has spent more time flying across the room than you have spent learning the controls.';const lines=wrapClashText(text,26,value=>value.length);expect(lines.join(' ')).toBe(text);expect(lines.every(line=>line.length<=26)).toBe(true);});
 it('encodes the actual replay seed and carries no private progress or active route',()=>{const url=clashChallengeUrl('first-clash-controller-2','https://cancel.example/collection/?player=private');expect(url).toBe('https://cancel.example/?clash=first-clash-controller-2');expect(()=>clashChallengeUrl('seed','javascript:alert(1)')).toThrow();});
 it('produces a bounded PNG filename without path separators',()=>{const file=clashVerdictFilename('../CLASH/"gamer"'.repeat(50));expect(file).toMatch(/^cancel-city-clash-[a-z0-9-]+\.png$/);expect(file.length).toBeLessThanOrEqual(89);});
});
