import type {MemeDraw} from './meme-special-painter';
import type {SpecialScene} from './live-scene-painter';
import {EXPANSION_IDS,EXPANSION_GAGS,EXPANSION_DIRECTIONS} from '../data/expansion';
const INK='#111016',PAPER='#f2e8cb',PINK='#ff269e',ACID='#deff00',BLUE='#31d7ff';
const clamp=(n:number)=>Math.max(0,Math.min(1,n)),ease=(n:number)=>1-(1-clamp(n))**3;
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,stroke=INK){c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeStyle=stroke;c.lineWidth=4;c.strokeRect(x,y,w,h);}
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string,stroke=INK){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=4;c.stroke();}}
function poly(c:CanvasRenderingContext2D,points:number[][],color:string){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();}
function panel(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,w:number,h:number,title:string,color=BLUE){box(c,x+7,y+8,w,h,'#0008');box(c,x,y,w,h,PAPER);box(c,x,y,w,34,color);d.text(title,x+w/2,y+17,17,INK,0,w-30);d.text('×',x+w-15,y+16,22,INK);}
function trophy(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,scale=1,silver=false){c.save();c.translate(x,y);c.scale(scale,scale);const col=silver?'#c2cbd4':'#ffd14a';oval(c,0,-64,50,22,col);poly(c,[[-47,-61],[47,-61],[29,8],[0,27],[-29,8]],col);box(c,-9,25,18,38,col);box(c,-45,60,90,22,col);if(silver)d.text('2',0,-19,58,INK);c.restore();}
function gift(c:CanvasRenderingContext2D,x:number,y:number,scale=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);box(c,-46,-39,92,82,PINK);box(c,-7,-39,14,82,ACID);box(c,-49,-51,98,18,PAPER);oval(c,-14,-63,21,12,ACID);oval(c,16,-63,21,12,ACID);c.restore();}
function bottle(c:CanvasRenderingContext2D,x:number,y:number,scale=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);box(c,-31,-63,62,139,'#ffd766');box(c,-16,-88,32,26,PAPER);box(c,-24,-101,66,13,PINK);box(c,-23,-16,46,41,PAPER);c.restore();}
function meat(c:CanvasRenderingContext2D,x:number,y:number,scale=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);box(c,-89,-9,164,18,PAPER);oval(c,-93,-12,15,14,PAPER);oval(c,-93,12,15,14,PAPER);oval(c,5,0,79,48,'#bc5431');oval(c,38,0,35,38,'#e89b52');c.restore();}
function cloud(c:CanvasRenderingContext2D,x:number,y:number,scale:number,color:string){c.save();c.translate(x,y);c.scale(scale,scale);for(const [a,b,r] of [[-60,5,43],[-28,-26,47],[27,-28,51],[62,7,45],[0,18,60]])oval(c,a,b,r,r*.7,color,'');c.restore();}
function beam(c:CanvasRenderingContext2D,x:number,y:number,q:number,color:string){poly(c,[[x,y-21],[x+650*q,y-105*q],[x+650*q,y+105*q],[x,y+21]],color);poly(c,[[x,y-8],[x+650*q,y-43*q],[x+650*q,y+43*q],[x,y+8]],PAPER);}
function spinner(c:CanvasRenderingContext2D,x:number,y:number,p:number,r=110){c.save();c.translate(x,y);c.rotate(p*23);c.lineWidth=19;c.strokeStyle=BLUE;c.beginPath();c.arc(0,0,r,0,Math.PI*1.65);c.stroke();c.lineWidth=5;c.strokeStyle=PAPER;c.stroke();c.restore();}
export function expansionBeat(progress:number,reduced=false){const p=reduced?1:clamp(progress);return p<.23?'setup':p<.46?'windup':p<.6875?'launch':p<.86?'contact':'gag';}
export function expansionVerdict(s:SpecialScene){const a=s.playback;return a.preview?'SCENE PREVIEW':a.support?'SQUAD PATCHED':a.knockout?'CANCELLED':EXPANSION_DIRECTIONS[a.cardId].impact;}

// Each resident stages a different physical gag. All health/reward facts remain in playback.
export function paintExpansionSpecial(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw){
 const a=s.playback,id=a.cardId;if(!EXPANSION_IDS.includes(id)||a.duoId)return false;
 const p=s.reduced?1:clamp(s.progress),beat=expansionBeat(p),dir=EXPANSION_DIRECTIONS[id],launch=ease((p-.46)/.2275),hit=clamp((p-.6875)/.1725),wind=clamp((p-.23)/.23),ending=beat==='gag';
 d.background(p,.60,1.16+Math.sin(p*Math.PI)*.12);if(ending)d.rays('#ded0b0',930,350,true);
 const pose=ending?3:beat==='setup'?0:beat==='windup'?1:2;
 let actorX=285,actorFloor=682,actorHeight=525,actorOpacity=1,actorAngle=-3;
 if(id==='CC065'&&beat==='launch')actorOpacity=1-launch;
 if(id==='CC057'&&(beat==='contact'||ending)){actorAngle=ending?-8:-12-hit*15;if(ending){actorX=350;actorHeight=440;actorFloor=666;}}
 if(id==='CC059'){actorX=345;actorHeight=455;actorFloor=677;}
 d.tag(dir.location,810,58,ending?PAPER:ACID,-2,839);
 if(!ending){d.text(beat==='setup'?dir.setup:dir.attack,839,126,43,beat==='setup'?PAPER:dir.accent,-3,744);}
 const target=()=>{if(!a.support)d.dossier(a.targetId,1064+hit*43,385-Math.sin(hit*Math.PI)*35,210,-hit*21);};
 switch(id){
 case 'CC051':{
  if(!ending){target();for(let i=0;i<5;i++)trophy(c,d,590+i*84,beat==='setup'?358:350+Math.sin(i+p*9)*19,.67);if(beat==='launch'||beat==='contact'){d.receipt(launch,p*4);if(hit){for(let i=0;i<5;i++)d.dust(590+i*84,350,hit,ACID);d.wrap(1064,385,hit);}}}
  else {trophy(c,d,1060,427,1.25);d.tag('TROPHY DECLINED TO COMMENT',916,539,PAPER,3,567);}break;}
 case 'CC052':{
  if(!ending){target();d.weapon('mic',777,383,1.7,8,PINK,'MUTE');const closed=beat==='setup'?0:beat==='windup'?wind*.28:launch;box(c,470,172,335*closed,355,'#701b47');box(c,1210-335*closed,172,335*closed,355,'#701b47');if(p>.4)d.tag('THE MICROPHONE HAS BLOCKED THIS NUMBER',819,566,ACID,-3,798);}
  else {box(c,715,245,468,243,'#701b47');d.text('NO ENCORE',950,361,71,PAPER,0,420);}break;}
 case 'CC053':{
  if(!ending){panel(c,d,577,198,582,315,'ALL-INCLUSIVE TOUR',ACID);poly(c,[[675,244],[817,266],[854,403],[762,468],[650,384]],BLUE);const n=beat==='setup'?2:beat==='windup'?2+Math.floor(wind*7):9;for(let i=0;i<n;i++)box(c,613+i*11%131,248+i*28,421-i%3*43,18,INK);if(beat==='launch'||beat==='contact'){target();for(let i=0;i<5;i++)box(c,467+launch*460,235+i*66,220,29,INK);}}
  else {panel(c,d,668,270,525,218,'YOUR ROUTE',PINK);d.text('████████',932,377,51,INK,0,459);}break;}
 case 'CC054':{
  for(let i=0;i<6;i++)cloud(c,450+i*128,498-Math.sin(p*4+i)*50,.75+launch*.4,ending?'#89a36c':'#65ab6599');box(c,141,335,290,292,'#493660',ACID);box(c,112,466,55,130,PAPER);box(c,409,466,55,130,PAPER);actorFloor=651;actorHeight=487;
  if(!ending){panel(c,d,699,243,464,220,'CALENDAR INVITE',ACID);d.text('DO NOT DISTURB',931,324,48,INK,0,416);d.text('ATTENDANCE: BY CLOUD',931,406,26,INK,0,425);if(beat==='contact')d.tag('RESTORED / GUARDED',899,567,ACID,-3,600);}break;}
 case 'CC055':{
  cloud(c,886,250,2.5,'#516370');if(!ending){target();for(let i=0;i<16;i++){const x=540+i*83%633,y=225+(p*1000+i*57)%360;oval(c,x,y,12,19,ACID);if(i%4===0)d.text('RENEW',x,y+29,14,PAPER,0,88);}if(beat==='windup'){panel(c,d,617,328,435,123,'UMBRELLA FREE PLAN',PINK);d.text('DRYNESS SOLD SEPARATELY',834,410,25,INK,0,398);}}
  else {panel(c,d,697,276,483,192,'UMBRELLA OF THE UMBRELLA',PINK);d.text('PREMIUM WEATHER',939,373,43,INK,0,425);}break;}
 case 'CC056':{
  if(!ending){target();oval(c,829,376,186,205,'#fcd14433',ACID);d.text('VIP',829,354,101,ACID);if(beat==='windup')d.tag('IMMUNITY SOLD SEPARATELY',831,566,PAPER,2,740);if(beat==='launch'||beat==='contact'){d.receipt(launch,p*3);if(hit){d.dust(832,377,hit,ACID);d.wrap(1064,385,hit);}}}
  else {box(c,758,265,366,223,PAPER);d.text('VIP DECLINED',941,373,61,PINK,-7,450);}break;}
 case 'CC057':{
  if(!ending){target();box(c,516,358,328,226,'#ad773e');d.text('ABSURD QUANTITY',680,465,29,PAPER,0,270);for(let i=0;i<7;i++)bottle(c,590+i*62,beat==='setup'?293:316+Math.sin(i+p*8)*25,.52);if(beat==='launch'||beat==='contact'){for(let i=0;i<7;i++)bottle(c,459+launch*(505+i*39),360-Math.sin(launch*Math.PI)*170+i*13,.59,launch*(i-3)*.6);oval(c,789,634,384*launch,19,'#f4c95477');}}
  else {bottle(c,957,421,1.2,-.75);d.tag('TRACTION: OUT OF STOCK',903,553,ACID,-3,623);actorFloor=658;}break;}
 case 'CC058':{
  panel(c,d,618,215,560,298,'UPDATING COMPOSURE',BLUE);box(c,670,312,457,43,INK);box(c,676,318,445*(beat==='setup'?.6:beat==='windup'?.99:1),31,ACID);d.text(beat==='contact'||ending?'PATCH APPLIED':'99% COMPLETE',900,390,49,INK,0,483);if(beat==='launch'||ending)for(let i=0;i<3;i++){panel(c,d,737+i*29,451+i*39,381,77,'RESTART THE RESTART',i%2?PINK:ACID);}
  break;}
 case 'CC059':{
  if(!ending){target();for(let i=0;i<5;i++){const q=beat==='setup'?0:beat==='windup'?wind*.2:clamp(launch-i*.045);gift(c,520+q*(439+i*25),426-Math.sin(q*Math.PI)*210+i*25,.55,q*2+i*.16);}if(beat==='windup')d.tag('DELIVERY AREA: THE ENTIRE STATE',835,566,ACID,-2,779);}
  else {for(let i=0;i<4;i++)gift(c,692+i*141,466,.68,(i-1)*.13);d.tag('PANHANDLE HANDS',932,570,ACID,-3,616);}break;}
 case 'CC060':{
  if(!ending){for(let i=0;i<5;i++){panel(c,d,521+i*36,205+i*51,494,198,`ESCAPE PLAN ${i+1}`,i%2?PINK:ACID);d.text(i===4?'FREE WILL PRO':'ANNUAL PLAN REQUIRED',768+i*36,302+i*51,29,INK,0,446);}if(beat==='launch'||beat==='contact'){target();d.weapon('stamp',498+launch*552,420-Math.sin(launch*Math.PI)*140,1.3,launch*.3,ACID,'PAY');}}
  else {panel(c,d,691,256,488,237,'YOU HAVE ESCAPED TO',ACID);d.text('ANOTHER CHECKOUT',935,378,44,INK,0,434);}break;}
 case 'CC061':{
  if(!ending){const n=beat==='setup'?2:beat==='windup'?2+Math.floor(wind*15):17;for(let i=0;i<n;i++){const x=523+i*73%604,y=192+i*47%306;panel(c,d,x,y,211,124,`FLASHBACK ${i+1}/17`,i%2?BLUE:PINK);d.text('WE MET 12 SECONDS AGO',x+105,y+83,16,INK,0,188);}if(beat==='launch'||beat==='contact'){target();oval(c,474+launch*562,394-Math.sin(launch*Math.PI)*156,52+launch*34,52+launch*34,BLUE);spinner(c,474+launch*562,394,p,44+launch*33);}}
  else {panel(c,d,705,280,479,210,'CUTSCENE CONTROL',BLUE);d.text('SKIP FLASHBACK 18?',944,391,43,INK,0,431);}break;}
 case 'CC062':{
  if(!ending){target();box(c,558,519,556,52,'#875534');for(let i=0;i<4;i++)meat(c,629+i*136,475,.6);if(beat==='launch'||beat==='contact'){c.beginPath();c.moveTo(352,386);c.bezierCurveTo(564,270,651,528,1080*launch,375);c.lineWidth=32;c.strokeStyle=INK;c.stroke();c.lineWidth=23;c.strokeStyle='#f1b176';c.stroke();meat(c,445+launch*579,396-Math.sin(launch*Math.PI)*124,1.34,-launch*.5);}}
  else {box(c,672,396,513,45,'#875534');d.text('LEFTOVERS: 0',931,315,69,PINK,0,580);meat(c,1061,507,.55,.45);}break;}
 case 'CC063':{
  if(!ending){target();spinner(c,1005,381,p,129);d.text('BUFFERING: ∞',897,589,43,BLUE,-3,678);if(beat==='launch'||beat==='contact'){beam(c,446,394,launch,'#b68bff');if(hit)d.dust(1053,386,hit,BLUE);}}
  else {spinner(c,1036,408,p,105);d.tag('FACE: PRIORITY RENDERING',914,554,PAPER,2,611);}break;}
 case 'CC064':{
  if(!ending){target();panel(c,d,593,206,485,230,'URGENT QUEST',ACID);d.text('CABBAGE: 50% OFF',836,303,51,INK,0,439);d.text('THE INTRO IS STILL TALKING',836,390,26,INK,0,445);if(beat==='launch'||beat==='contact'){oval(c,448+launch*601,412,76,47,'#f24b55');for(let i=0;i<4;i++){box(c,483+launch*460-i*65,398+i*17,93,4,PAPER,PAPER);}if(hit)d.dust(1059,385,hit,PINK);}}
  else {panel(c,d,697,253,475,254,'COUPON REDEEMED',ACID);d.text('ONE PUNCH',934,342,69,INK,0,421);d.text('ZERO SPEECHES',934,439,35,PINK,0,416);}break;}
 case 'CC065':{
  if(!ending){target();for(let i=0;i<5;i++){const n=beat==='setup'?1:beat==='windup'?1+Math.floor(wind*4):5;if(i<n){panel(c,d,530+i*68,210+i*63,400,103,`MISSED CALL ${i+1}`,PINK);d.text(i%2?'PARENT MEETING':'PICCOLO IS TYPING',730+i*68,275+i*63,23,INK,0,359);}}if(beat==='launch'||beat==='contact'){d.receipt(launch,p*4);d.tag('CHILDCARE INVOICE: INSTANT TRANSMISSION',834,613,ACID,-2,797);}}
  else {panel(c,d,686,259,495,218,'DESTINATION SEARCH',BLUE);d.text('PARENT MEETING',933,338,45,INK,0,441);d.text('LOCATION NOT FOUND',933,418,32,PINK,0,444);}break;}
 case 'CC066':{
  if(!ending){target();if(beat==='windup')d.tag('FINAL FORM: MAXIMUM FOREHEAD',832,553,ACID,-3,783);if(beat==='launch'||beat==='contact')beam(c,446,383,launch,BLUE);else trophy(c,d,850,381,1.3,true);}
  else {const q=ease((p-.86)/.10);trophy(c,d,327,182+q*92,.72,true);actorAngle=-5;d.tag('SILVER IS A STRATEGIC CHOICE',899,556,PAPER,3,652);}break;}
 }
 d.actor(id,ending&&['CC051','CC052','CC053','CC056','CC057','CC060','CC065','CC066'].includes(id)?5:pose,actorX,actorFloor,actorHeight,actorAngle,actorOpacity);
 if(beat==='contact'){d.dust(1059,386,hit,dir.accent);d.text(expansionVerdict(s),826,570,59,PINK,-4,763);d.tag(a.preview?'PREVIEW':d.result(a),847,655,ACID,-2,737);}
 if(ending){d.text(a.preview?'SPECIAL PREVIEW':a.knockout?'THREAD CLOSED':dir.impact,835,149,60,PINK,-3,760);d.bubble(EXPANSION_GAGS[id][0],822,217,744);d.tag(a.preview?'PREVIEW / NO HYPE SPENT':d.result(a),828,644,ACID,-2,720);}
 return true;
}
