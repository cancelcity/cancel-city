import type {MemeDraw} from './meme-special-painter';
import type {Roast,RoastEvent} from '../domain/roast';
import {ROAST_OPPONENTS} from '../domain/roast';
export interface RoastScene{kind:'roast';roast:Roast;event?:RoastEvent;progress:number;reduced:boolean;finale?:boolean;time?:number}
const INK='#111016',PAPER='#eee5cd',PINK='#ff269e',ACID='#deff00',BLUE='#31d7ff';
const clamp=(n:number)=>Math.max(0,Math.min(1,n)),ease=(n:number)=>1-(1-clamp(n))**3;
function shape(c:CanvasRenderingContext2D,pts:number[][],fill:string,stroke=INK){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=4;c.stroke();}
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeStyle=INK;c.lineWidth=4;c.strokeRect(x,y,w,h);}
function mic(c:CanvasRenderingContext2D,x:number,y:number,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.strokeStyle='#bcb7bb';c.lineWidth=6;c.beginPath();c.moveTo(0,-105);c.lineTo(0,0);c.moveTo(-35,15);c.lineTo(0,0);c.lineTo(35,15);c.stroke();c.fillStyle=INK;c.fillRect(-13,-133,26,43);c.strokeStyle=PAPER;c.lineWidth=2;c.strokeRect(-13,-133,26,43);c.restore();}
function snack(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,a=0){c.save();c.translate(x,y);c.rotate(a);box(c,-88,-174,176,277,PINK);box(c,-70,-155,99,178,INK);for(let j=0;j<6;j++)box(c,-61+j%2*43,-143+Math.floor(j/2)*49,27,38,j%2?ACID:BLUE);box(c,46,-142,20,91,PAPER);box(c,-58,43,119,26,INK);d.text('SNACKS / NO REFUNDS',0,91,13,INK,0,164);c.restore();}
function paintClub(c:CanvasRenderingContext2D,s:RoastScene,d:MemeDraw){
 const r=s.roast,e=s.event,p=s.reduced?1:clamp(s.progress),animating=!!e&&p<1,round=animating&&p<.68?e.round:r.round;
 const enemy=ROAST_OPPONENTS[round].cardId,actor=e?.side==='player'&&animating?e.actorId:r.team[r.active].cardId;
 const t=(s.time??0)/1000,impact=!!e&&p>=.5&&e.round===round,win=r.winner==='player';
 d.image('/assets/roast/venue-v2.webp',640,360,1280,720);
 const shade=c.createLinearGradient(0,0,0,720);shade.addColorStop(0,'#08060999');shade.addColorStop(.2,'#08060900');shade.addColorStop(.76,'#08060900');shade.addColorStop(1,'#08060977');c.fillStyle=shade;c.fillRect(0,0,1280,720);
 let ax=350,tx=924,ap=0,tp=0,aa=0,ta=0,af=510,tf=512;
 const bob=s.reduced?0:Math.sin(t*1.7)*2;
 if(animating){
  const q=Math.sin(clamp((p-.1)/.75)*Math.PI);
  if(e.side==='player'){
   ap=e.tone==='deadpan'?0:e.kind==='guard'||e.kind==='copium'?1:p<.45?1:2;tp=impact&&e.damage>0?4:0;
   if(e.kind==='attack'||e.kind==='reply'&&e.tone!=='deadpan'||e.kind==='special'||e.kind==='bonk'){ax+=q*48;tx+=impact?q*25:0;ta=impact?q*4:0;}
   if(e.kind==='switch'){ax=235+ease(p)*115;ap=0;}
   if(e.kind==='bonk')d.image('/assets/props/P001.webp',575+ease(p)*100,360-q*60,165,undefined,-35+ease(p)*65);
   if(e.kind==='copium')d.image('/assets/props/P003.webp',494,420,160,undefined,q*5);
   if(e.kind==='megaphone')d.image('/assets/props/P004.webp',490,315,165,undefined,-18);
  }else{tp=p<.5?1:2;ap=impact&&e.damage>0?4:1;aa=impact?q*-3:0;ax-=impact?q*18:0;}
  if(e.collision&&impact){ta=16*ease((p-.5)/.5);tx+=44*ease((p-.5)/.5);d.dust(tx,398,clamp((p-.5)*2),PINK);d.weapon('paper',1050-(p-.5)*330,300-Math.sin(p*Math.PI)*90,.35,p*130,ACID,'BILL');}
 }
 if(r.phase==='finished'){ap=win?3:5;tp=win?5:3;}
 c.save();c.fillStyle='#08060877';for(const x of [ax,tx]){c.beginPath();c.ellipse(x,514,94,14,0,0,Math.PI*2);c.fill();}c.restore();
 mic(c,635,510,-.04+(animating&&e?.collision?ease(p)*-.7:0));
 d.actor(actor,ap,ax,af+bob,352,aa);d.actor(enemy,tp,tx,tf-bob,352,ta);
 if(r.copium)d.image('/assets/props/P003.webp',210,462,79,undefined,-7);
 d.tag(`ACT ${round+1} / 3 · ${ROAST_OPPONENTS[round].name}`,640,42,PAPER,-1,730);
 if(impact&&e&&(!s.finale||p<.8)){
  if(e.damage)d.tag(`−${e.damage} HP`,e.side==='player'?1020:245,259,PINK,e.side==='player'?5:-5,205);
  if(e.heal)d.tag(`+${e.heal} HP`,246,195,BLUE,-3,205);
  if(e.collision)d.tag('THE WHOLE ROOM SAW THAT.',640,567,ACID,-2,620);
 }
 if(s.finale){d.tag(win?'LAST WORD: YOURS.':'THE BOUNCER HAS HEARD ENOUGH.',640,163,win?ACID:PINK,-3,760);}
 else d.tag(r.crowd>=35?'THE ROOM IS YOURS.':r.crowd<=-20?'YOU’RE LOSING THE ROOM.':'MAKE THEM PICK A SIDE.',640,657,r.crowd>=35?ACID:r.crowd<=-20?PINK:PAPER,-1,650);
}
export function paintRoast(c:CanvasRenderingContext2D,s:RoastScene,d:MemeDraw){
 if(s.roast.version===2){paintClub(c,s,d);return;}
 const r=s.roast,e=s.event,p=s.reduced?1:clamp(s.progress),q=ease(clamp((p-.28)/.38)),impact=p>=.68,finale=!!s.finale,win=r.winner==='player',round=e&&p<.68?e.round:r.round,enemy=ROAST_OPPONENTS[round].cardId,actor=e?.side==='player'?e.actorId:r.team[r.active].cardId,t=(s.time??0)/1000,cheer=r.crowd>=25,boo=r.crowd<=-25;
 d.background(0,.74,1.12);box(c,85,123,1110,515,'#28232e');box(c,122,146,1036,456,'#23192b');
 for(let j=0;j<14;j++){const x=94+j*85;shape(c,[[x,118],[x+79,118],[x+74,182],[x+12,174]],j%2?'#962559':'#731b45');}
 shape(c,[[89,151],[245,151],[199,592],[91,633]],'#862050');shape(c,[[1191,151],[1035,151],[1081,592],[1191,633]],'#862050');
 for(let j=0;j<4;j++){c.strokeStyle='#be367755';c.lineWidth=4;c.beginPath();c.moveTo(103+j*26,171);c.lineTo(101+j*19,588);c.moveTo(1176-j*26,171);c.lineTo(1187-j*19,588);c.stroke();}
 const glow=c.createRadialGradient(644,311,10,644,311,450);glow.addColorStop(0,'#e7d8bb23');glow.addColorStop(1,'#e7d8bb00');c.fillStyle=glow;c.fillRect(195,159,878,428);
 shape(c,[[171,555],[1105,555],[1198,648],[83,648]],'#785747');shape(c,[[83,648],[1198,648],[1198,672],[83,672]],'#3c2b2d');for(let j=0;j<9;j++){c.strokeStyle='#14121a66';c.lineWidth=2;c.beginPath();c.moveTo(237+j*93,555);c.lineTo(123+j*121,648);c.stroke();}
 d.tag('MUNICIPAL ROAST NIGHT / NO ONE PASSED THE VIBE CHECK',640,61,ACID,-2,1110);d.text(finale?'THE COUNCIL WILL BE HEARING ABOUT THIS':ROAST_OPPONENTS[round].name,643,172,48,PAPER,-2,821);
 let ax=365,tx=883,af=598,tf=600,ap=0,tp=0,aa=0,ta=0,ah=327,th=330;
 const pending=r.pending,animating=!!e&&p<1;
 if(pending){ap=pending.kind==='special'?1:0;tp=pending.kind==='special'?0:1;d.bubble(pending.kind==='special'?'WAIT FOR THE PUNCHLINE.':ROAST_OPPONENTS[r.round].intro,663,239,678);if(pending.kind==='dodge')d.weapon('mic',818+Math.sin(t*2)*13,352,1.2,-25,PINK,'BAD TAKE');}
 else if(animating){
  if(e.side==='player'){
   ap=p<.24?0:p<.48?1:p<.82?2:3;tp=impact?4:0;
   if(e.kind==='attack'||e.kind==='bonk'){ax=365+q*185;tx=883+Math.sin(q*Math.PI)*37;if(e.kind==='bonk')d.image('/assets/props/P001.webp',575+q*143,412-q*54,203,undefined,-38+q*65);}
   if(e.kind==='guard'){ap=1;shape(c,[[283,326],[430,314],[445,456],[368,518],[277,451]],BLUE);d.text('PR',361,402,38,INK,0,105);}
   if(e.kind==='switch'){ax=210+q*169;d.actor(e.actorId,5,218-q*250,589,241,-9,1-q);}
   if(e.kind==='copium'){ap=1;d.image('/assets/props/P003.webp',555,446,222,undefined,Math.sin(p*9)*4);for(let j=0;j<4;j++)d.dust(550+j*25,378-j*16,p*.5,BLUE);}
   if(e.kind==='megaphone'){ap=2;d.image('/assets/props/P004.webp',569,394,235,undefined,-18);for(let j=0;j<3;j++){c.beginPath();c.ellipse(740+j*47,396,30+j*12,72+j*18,0,-.85,.85);c.strokeStyle=ACID;c.lineWidth=6;c.stroke();}}
  }else{tp=p<.45?1:p<.72?2:5;ap=impact&&e.damage>0?4:e.grade==='perfect'?5:1;if(e.kind==='dodge'){d.weapon('mic',883-q*460,361-Math.sin(q*Math.PI)*88,1.1,-24+q*260,PINK,'LIABILITY');if(e.grade==='perfect'){ah=357-q*123;af=598;}}if(e.kind==='interrupt'&&e.grade==='perfect'){tp=impact?5:1;d.tag('NOBODY ASKED / NOBODY ASKED / NOBODY ASKED',680,287,ACID,-4,788);}}
  if(e.collision&&impact){const v=ease((p-.68)/.28);tx=898+v*68;tf=600+v*30;ta=v*27;mic(c,978,589,-v*.85);snack(c,d,1111,462,v*.13);d.weapon('paper',976-v*246,382-Math.sin(v*Math.PI)*118,.5,v*187,ACID,'INVOICE');d.weapon('paper',1084-v*78,429-Math.sin(v*Math.PI)*84,.4,v*-233,PINK,'SNACK');}
 }
 if(!e?.collision||!impact){mic(c,593,592,-.11);snack(c,d,1111,462);}
 if(r.copium)d.image('/assets/props/P003.webp',213,486,108,undefined,-5);
 if(finale){const f=s.reduced?1:clamp((p-.16)/.64),zoom=p<.2?1+p*.25:1;ap=win?3:5;tp=5;ax=300;tx=965;af=615;tf=615;ah=330;th=290;c.save();c.translate(640,413);c.scale(zoom,zoom);c.translate(-640,-413);if(win){d.actor('CC007',p<.5?1:5,650,596,292,-3);d.weapon('paper',651,373+Math.sin(f*Math.PI)*28,1.1,-8+f*11,PAPER,p>.55?'DENIED':'GRANT');if(p>.55)d.weapon('stamp',653,278+ease((p-.55)/.12)*99,.6,4,PINK,'DENIED');if(p>.72)for(let j=0;j<18;j++)d.weapon('paper',210+j*54,218+clamp((p-.72)*3)*(j%4*42+86),.12,j*19, j%2?PINK:ACID,'BILL');}c.restore();d.bubble(win?(p<.55?'THE MAYOR PROMISED A CULTURAL GRANT.':'YOUR APPLAUSE HAS BEEN RECLASSIFIED AS NOISE POLLUTION.'):'THE CITY HAS AWARDED YOU ONE LAST BAD REVIEW.',650,245,846);}
 d.actor(actor,ap,ax,af,ah,aa);d.actor(enemy,tp,tx,tf,th,ta);
 if(!pending&&!finale&&impact&&e){if(e.damage)d.tag(`−${e.damage} COMPOSURE`,e.side==='player'?929:347,343,PINK,e.side==='player'?5:-5,300);if(e.heal)d.tag(`+${e.heal} RESTORED`,350,253,BLUE,-4,300);if(e.grade)d.tag(e.grade.toUpperCase()+(e.grade==='perfect'?' / THE ROOM IS YOURS':''),649,238,ACID,-3,686);}
 // The audience is cast from existing illustrated actors, not generic floating icons.
 const audience=['CC007','CC028','CC074','CC068','CC043','CC083','CC015','CC008'];
 for(let j=0;j<audience.length;j++){const x=92+j*151,pose=finale&&win?3:cheer?3:boo?5:0,bob=s.reduced?0:Math.sin(t*3+j*.9)*(cheer?6:2);d.actor(audience[j],pose,x,765+bob,142,j%2?5:-4);}
 box(c,452,649,377,44,INK);d.text(cheer?'THE FRONT ROW HAS SWITCHED SIDES':boo?'THE FRONT ROW IS POSTING THROUGH IT':'THE FRONT ROW IS WITHHOLDING JUDGMENT',641,671,17,cheer?ACID:boo?PINK:PAPER,0,361);
 if(animating&&!pending&&!finale&&p>.18&&p<.34){d.rays(e!.side==='player'?PINK:BLUE,341,368);d.actor(e!.actorId,1,312,843,762,-4);d.tag('LIVE CLOSE UP / THE ROOM WILL REMEMBER THIS',875,105,ACID,-3,627);d.text(e!.title,864,268,65,PAPER,-4,650);d.bubble(e!.side==='player'?'I HAVE PREPARED ABSOLUTELY NOTHING.':'THIS COULD HAVE BEEN ONE SENTENCE.',864,461,621);}
 if(finale&&p>.84){d.tag(win?(r.rewarded?'+1 PACK / +60 XP / FIRST CLEAR SAVED':'ENCORE / NO REPEAT REWARDS'):'NO REWARD / YOUR COLLECTION IS SAFE',645,386,ACID,-2,703);d.text(win?'THE CITY HAS BEEN ROASTED.':'THE CITY HAS OUTPOSTED YOU.',645,474,57,PAPER,-3,871);}
}
