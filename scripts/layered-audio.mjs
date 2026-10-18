import {writeFile} from 'node:fs/promises';
// Original synthesized foley. No third-party music or voice recordings.
export async function writeScore(film,file){
 const rate=48000,n=Math.round(film.duration*rate),samples=new Float64Array(n);let seed=12391;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 const tone=(at,length,frequency,gain=.25,fall=0)=>{for(let k=0;k<length*rate;k++){const i=Math.round(at*rate)+k;if(i>=n)break;const t=k/rate,p=t/length,env=Math.min(1,p*20)*Math.exp(-p*3)*(1-p);samples[i]+=Math.sin(2*Math.PI*(frequency*t+fall*t*t/2))*gain*env;}};
 const rush=(at,length,gain=.3,low=.12)=>{let filtered=0;for(let k=0;k<length*rate;k++){const i=Math.round(at*rate)+k;if(i>=n)break;filtered+=low*(noise()-filtered);const p=k/(length*rate),env=Math.sin(Math.PI*p)**1.5;samples[i]+=filtered*gain*env;}};
 tone(.015,.28,90,.27,-130);
 if(film.slug==='homelesslander'){tone(.58,.5,65,.22,35);rush(1.25,1.55,.85,.15);rush(film.impact,.32,1.15,.5);tone(film.impact,.5,72,.6,-110);for(let i=0;i<8;i++)rush(3.12+i*.24,.1,.24,.75);tone(4.7,.3,110,.2,-190);}
 if(film.slug==='master-cheese'){tone(.68,.14,620,.18);tone(.85,.15,930,.16);for(let i=0;i<5;i++){rush(1.48+i*.25,.13,.85,.55);tone(1.48+i*.25,.2,120,.25,-330);}rush(film.impact,.45,1.1,.38);tone(film.impact,.55,64,.65,-85);for(let i=0;i<3;i++)tone(4.5+i*.28,.2,420-i*60,.2,-1000);tone(5.3,.25,1160,.12);}
 if(film.slug==='mrleast'){for(let i=0;i<4;i++)tone(.15+i*.085,.15,[392,494,587,784][i],.16);rush(1.5,1.1,.65,.22);rush(film.impact,.3,1.2,.55);tone(film.impact,.55,64,.65,-80);tone(3.88,.45,1470,.18);tone(3.89,.38,2130,.12);tone(4.8,.4,220,.12,-280);rush(5.05,.28,.06,.8);}
 if(film.slug==='nanami'){for(const at of [.65,1.05,1.45])tone(at,.08,850,.1);rush(2.15,.7,.6,.2);rush(film.impact,.18,1.15,.6);tone(film.impact,.36,80,.5,-170);tone(4.12,.13,1100,.18);tone(4.3,.2,1650,.18);for(let i=0;i<4;i++)rush(4.5+i*.18,.08,.2,.17);}
 if(film.slug==='freezer'){tone(.5,.4,160,.2,-120);rush(1.35,1.2,.4,.05);tone(2.45,.15,220,.16,-350);rush(film.impact,.65,.8,.13);tone(film.impact,.55,105,.25,-110);tone(4.35,.18,170,.25,-220);tone(5.05,.28,800,.12);}
 if(film.slug==='powerpoint'){tone(.6,.09,680,.17);tone(1.35,.1,880,.15);for(let i=0;i<7;i++)rush(1.7+i*.19,.12,.3,.5);rush(film.impact,.45,.75,.2);tone(film.impact,.4,350,.25,450);tone(4.3,.25,660,.18);tone(4.55,.25,830,.18);tone(5.2,.4,170,.13,-180);}
 if(film.slug==='kobeni'){tone(.65,.12,950,.12);rush(1.55,.65,.35,.25);for(let i=0;i<4;i++)tone(1.8+i*.2,.18,1100+i*170,.14);tone(film.impact,.35,1450,.2);tone(3.45,.45,880,.18);tone(3.5,.4,1320,.1);tone(4.8,.4,240,.17,-300);}
 if(film.slug==='gordon-ramen'){tone(.85,.15,1200,.14);tone(1.15,.28,160,.26,-180);rush(1.55,1.25,.6,.13);rush(film.impact,.45,.95,.18);tone(film.impact,.4,90,.35,-110);rush(4,.5,.15,.04);tone(4.75,.4,100,.22,-100);}
 if(film.slug==='usoppgpt'){for(let i=0;i<8;i++)rush(.65+i*.1,.035,.18,.7);rush(1.55,1.2,.5,.13);tone(2.1,.6,110,.1,150);rush(film.impact,.32,1.1,.38);tone(film.impact,.5,70,.6,-110);for(let i=0;i<3;i++)tone(3.85+i*.13,.28,440+i*110,.15);tone(4.9,.55,150,.2,-160);}
 if(film.slug==='light-yagamod'){for(let i=0;i<9;i++)rush(1.4+i*.14,.055,.22,.85);rush(film.impact,.18,1.2,.75);tone(film.impact,.4,64,.6,-90);for(let i=0;i<3;i++)tone(3.9+i*.15,.2,700-i*160,.18);tone(5,.5,120,.2,-140);}
 if(film.slug==='copy-paste-kakashi'){tone(.65,.16,880,.12);for(let i=0;i<5;i++){rush(1.45+i*.25,.2,.35,.18);tone(1.45+i*.25,.18,180,.13,320);}rush(film.impact,.4,.7,.5);tone(3.9,.2,1040,.17);tone(4.15,.25,620,.17);tone(5.1,.45,150,.18,-180);}
 if(film.slug==='sauron-surveillance'){tone(.6,.55,85,.24,70);for(let i=0;i<5;i++)tone(1.5+i*.22,.12,750+i*80,.12);rush(film.impact,.5,1,.24);tone(film.impact,.6,58,.6,-65);for(let i=0;i<5;i++)rush(4.35+i*.19,.09,.2,.8);tone(5.25,.28,1040,.14);}
 if(film.slug==='infinite-rizz'){for(let i=0;i<4;i++)tone(.6+i*.18,.35,220+i*110,.15);rush(1.5,1.4,.4,.07);tone(2.4,.7,360,.13,220);rush(film.impact,.4,.8,.18);tone(film.impact,.6,100,.3,160);tone(4.9,.5,340,.17,-500);}
 if(film.slug==='big-bald-energy'){tone(.7,.14,1200,.11);rush(1.7,.8,.18,.12);rush(film.impact,.2,1.4,.8);tone(film.impact,.6,48,.8,-45);rush(film.impact+.08,.65,.8,.1);tone(4.6,.15,1000,.15);tone(4.9,.5,160,.22,-160);}
 if(film.slug==='eternal-second'){tone(.6,.65,85,.2,80);rush(1.5,1.5,.7,.07);tone(2.1,.9,120,.15,130);rush(film.impact,.6,1.25,.2);tone(film.impact,.7,55,.7,-40);tone(4.8,.3,1320,.18);tone(5.12,.4,220,.23,-200);}
 if(film.slug==='fraudo-baggins'){for(let i=0;i<4;i++)tone(.65+i*.12,.25,520+i*140,.13);rush(1.7,1.15,.5,.17);tone(2.5,.45,900,.16,700);rush(film.impact,.35,1,.4);tone(film.impact,.5,76,.5,-90);rush(4.6,.6,.5,.3);tone(5.2,.35,130,.2,-140);}
 if(film.slug==='daenerys-airfryer'){for(let i=0;i<5;i++)tone(1.4+i*.25,.08,700,.1);tone(film.impact,.18,1200,.18);tone(film.impact+.18,.18,1600,.15);rush(film.impact+.08,.45,.65,.14);for(let i=0;i<3;i++)tone(4.2+i*.12,.1,1900-i*240,.1);tone(5.2,.45,160,.2,-180);}
 if(film.slug==='l-ratio'){tone(.7,.1,1000,.1);for(let i=0;i<5;i++)rush(1.6+i*.23,.1,.25,.6);rush(film.impact,.2,1,.65);tone(film.impact,.5,70,.55,-90);for(let i=0;i<4;i++)tone(4.3+i*.17,.14,700-i*120,.12);tone(5.1,.4,130,.2,-150);}
 if(film.slug==='yasuo-zero-ten'){rush(.7,.3,.15,.15);rush(1.45,1.35,.8,.15);rush(film.impact,.2,1.1,.6);tone(film.impact,.4,70,.5,-90);tone(3.95,.2,1100,.14);tone(4.18,.2,750,.14);tone(5,.45,140,.2,-160);}
 const nextCues={
  'erwin-linkedin':[[.7,.2,350,.16],[1.5,.5,130,.2,150],[4.8,.2,880,.16],[5.05,.3,1320,.13]],
  'gandalf-grey-market':[[.7,.5,95,.2],[2,.8,180,.14,180],[4.5,.2,320,.18],[5.1,.3,1200,.15]],
  'genos-windows-update':[[.7,.1,900,.13],[1.6,.7,110,.15,280],[2.6,.1,1050,.12],[5.25,.22,440,.15],[5.45,.25,660,.15],[5.65,.3,880,.14]],
  'sully-hr':[[.7,.4,75,.2],[1.6,1.2,58,.2,-14],[4.6,.25,450,.17],[5,.5,150,.18,-170]],
  'olaf-global-warming':[[.7,.2,1500,.11],[1.6,.6,700,.08,-200],[4.5,.5,90,.12],[5,.3,1100,.12]],
  'dutch-pyramid-scheme':[[.7,.2,600,.15],[1.6,.15,1100,.12],[1.9,.15,1400,.12],[2.2,.15,1700,.12],[5,.5,160,.18,-150]],
  'absent-father':[[.7,.3,110,.15],[1.5,1,150,.2,160],[2.95,.2,1600,.16,-7000],[4.8,.12,950,.09]],
  'anti-anti-meat':[[.7,.2,180,.15],[1.6,.4,270,.13,-150],[4.5,.3,800,.11],[5.1,.4,400,.12]],
  'power-of-friendship':[[.7,.2,392,.12],[1.5,.2,440,.12],[1.8,.2,523,.12],[2.1,.2,659,.12],[4.6,.2,440,.12],[4.9,.2,523,.12],[5.2,.2,659,.12]],
  'touch-grass-final-boss':[[.7,.25,150,.14],[1.8,.5,220,.12,120],[5.1,.18,1300,.1],[5.3,.2,1800,.1]]
 };
 if(nextCues[film.slug]){for(const args of nextCues[film.slug])tone(...args);rush(1.6,1.1,.4,.14);rush(film.impact,.32,.8,.25);tone(film.impact,.35,70,.4,-80);}
 let peak=0;for(const sample of samples)peak=Math.max(peak,Math.abs(sample));const gain=.78/Math.max(1,peak),pcm=Buffer.alloc(n*4);
 for(let i=0;i<n;i++){const fade=Math.min(1,i/(rate*.008),(n-i)/(rate*.04)),v=Math.max(-32767,Math.min(32767,Math.round(samples[i]*gain*fade*32767)));pcm.writeInt16LE(v,i*4);pcm.writeInt16LE(Math.round(v*.96),i*4+2);}
 const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);await writeFile(file,Buffer.concat([header,pcm]));
}
