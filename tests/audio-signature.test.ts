import {expect,it} from 'vitest';
import {CARDS} from '../src/data/cards';
import {characterSignature} from '../src/domain/audio-signature';
it('gives each live resident a unique deterministic bounded original synth ident',()=>{const signatures=CARDS.map(c=>characterSignature(c.id));expect(new Set(signatures.map(s=>JSON.stringify(s))).size).toBe(CARDS.length);for(let i=0;i<CARDS.length;i++){expect(characterSignature(CARDS[i].id)).toEqual(signatures[i]);expect(signatures[i]).toHaveLength(4);for(const note of signatures[i]){expect(note.frequency).toBeGreaterThanOrEqual(220);expect(note.frequency).toBeLessThan(1600);expect(note.delay+note.duration).toBeLessThan(1);}}expect(()=>characterSignature('constructor')).toThrow();});
