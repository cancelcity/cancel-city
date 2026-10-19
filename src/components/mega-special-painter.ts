import type {MemeDraw} from './meme-special-painter';
import type {SpecialScene} from './live-scene-painter';
import {MEGA_SCENES} from '../data/mega';
import {CARD_BY_ID} from '../data/cards';
import {PROP_BY_ID} from '../data/props';
const INK='#111016',PAPER='#f2e8cb',PINK='#ff269e',ACID='#deff00',BLUE='#31d7ff';
const clamp=(n:number)=>Math.max(0,Math.min(1,n)),ease=(n:number)=>1-(1-clamp(n))**3;
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string){c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeStyle=INK;c.lineWidth=5;c.strokeRect(x,y,w,h);}
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();}
function path(c:CanvasRenderingContext2D,pts:number[][],fill:string){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();}
function panel(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,w:number,h:number,title:string,color:string){rect(c,x+8,y+10,w,h,'#0008');rect(c,x,y,w,h,PAPER);rect(c,x,y,w,34,color);d.text(title,x+w/2,y+17,18,INK,0,w-40);}
function starburst(c:CanvasRenderingContext2D,x:number,y:number,r1:number,r2:number,points:number,fill:string){
 const pts:number[][]=[];
 for(let i=0;i<points*2;i++){
  const a=i*Math.PI/points,r=i%2?r1:r2;
  pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);
 }
 path(c,pts,fill);
}
function prop(c:CanvasRenderingContext2D,d:MemeDraw,m:string,x:number,y:number,q:number,color:string,word:string){
 c.save();c.translate(x,y);c.rotate(Math.sin(q*3)*.13);c.scale(.7+q*.5,.7+q*.5);
 if(['keyboard','bongo','alarm','records','waveform','voicenote','speech','intro','vacuumcleaner'].includes(m)){
  if(m==='keyboard'){rect(c,-130,-40,260,80,PAPER);for(let i=0;i<16;i++){rect(c,-124+i*16,-34,14,66,i%3===0?INK:PAPER);}d.text('PLAY THEM OUT',0,74,23,color,0,300);}
  else if(m==='bongo'){for(const xx of [-62,62]){rect(c,xx-45,-3,90,73,PINK);oval(c,xx,-5,48,17,PAPER);}d.weapon('hammer',0,-106,.7,q*12,ACID,'ORDER');}
  else if(m==='records'){oval(c,0,0,105,105,INK);oval(c,0,0,35,35,color);for(let i=0;i<3;i++)d.text(String(i+1),-110+i*110,142,33,PAPER);}
  else if(m==='vacuumcleaner'){rect(c,-85,-35,170,100,color);oval(c,-50,68,30,30,INK);oval(c,50,68,30,30,INK);c.beginPath();c.moveTo(70,-25);c.bezierCurveTo(160,-160,-30,-170,5,-70);c.strokeStyle=PAPER;c.lineWidth=18;c.stroke();}
  else {d.weapon('mic',0,0,1.2,0,color,'VOLUME');for(let i=0;i<6;i++){c.beginPath();c.arc(0,0,75+i*20,-1.3,1.3);c.strokeStyle=i%2?color:PAPER;c.lineWidth=5;c.stroke();}}
 }else if(['stamp','clip','ban','expenses','footnotes','citation','replyall','rules','leadership','patch','adjectives','folders','warranty','wrongtab','reverse'].includes(m)){
  if(m==='clip'){c.beginPath();c.moveTo(40,77);c.bezierCurveTo(-100,155,-115,-100,-10,-110);c.bezierCurveTo(90,-120,110,110,15,95);c.bezierCurveTo(-55,90,-60,-58,-4,-60);c.strokeStyle=INK;c.lineWidth=36;c.stroke();c.strokeStyle='#c2cbd4';c.lineWidth=26;c.stroke();oval(c,-24,-84,23,28,PAPER);oval(c,24,-84,23,28,PAPER);oval(c,-20,-80,8,10,INK);oval(c,20,-80,8,10,INK);}
  else if(['stamp','ban'].includes(m))d.weapon('stamp',0,0,1.5,q*18,color,m==='ban'?'BANNED':'REJECTED');
  else {d.weapon('paper',0,0,1.4,q*11,color,word);for(let i=0;i<3;i++)d.weapon('paper',-96+i*81,110,.45,(i-1)*18,color,i%2?'SOURCE?':'APPROVED');}
 }else if(['graph','hedge','chart','wheel','odometer','calendar','late','eras'].includes(m)){
  if(['graph','hedge','chart'].includes(m)){path(c,[[-170,100],[-99,36],[-43,54],[29,-20],[87,-1],[153,-102],[114,-105],[191,-132],[180,-53],[161,-79],[96,29],[34,11],[-45,90],[-89,76],[-155,138]],color);}
  else {oval(c,0,0,111,111,PAPER);for(let i=0;i<8;i++){const a=i*Math.PI/4;path(c,[[0,0],[Math.cos(a)*104,Math.sin(a)*104],[Math.cos(a+.6)*104,Math.sin(a+.6)*104]],i%2?color:PINK);}oval(c,0,0,22,22,INK);d.text(word,0,148,22,PAPER,0,280);}
 }else if(['stairs','tower','chairs','flatpack','demolition','beach','swamp','ceiling'].includes(m)){
  if(m==='stairs'||m==='tower'){for(let i=0;i<5;i++)rect(c,-133+i*45,75-i*45,48,120+i*45,i%2?PAPER:color);}
  else if(m==='chairs'||m==='flatpack'){rect(c,-90,-20,180,28,PAPER);rect(c,-80,-100,160,80,color);rect(c,-78,8,20,105,INK);rect(c,58,8,20,105,INK);}
  else if(m==='ceiling'){rect(c,-150,-79,300,155,PAPER);for(let i=0;i<4;i++)rect(c,-135+i*73,-64,66,121,'#b7b7a2');d.text('INSPECTION',0,116,29,color);}
  else {rect(c,-145,-80,290,130,'#a87849');d.text(m==='swamp'?'GET OFF MY PLOT':'PERMIT APPROVED',0,-18,32,PAPER,0,265);rect(c,-12,50,24,116,'#795235');}
 }else if(['bath','pool','fire','fog','stink','fryer'].includes(m)){
  if(m==='fryer'){rect(c,-105,-101,210,215,'#32323e');rect(c,-80,-76,160,65,color);rect(c,-78,13,156,73,PAPER);d.text('200°',0,-43,34,INK);}
  else {oval(c,0,72,170,71,m==='fire'?'#ff823f':m==='stink'?'#8aba45':BLUE);for(let i=0;i<7;i++)oval(c,-110+i*38,-20-Math.sin(i+q*4)*35,35+i%3*12,44,color+'bb');d.text(m==='bath'?'MANDATORY CALM':m==='fire'?'CUP: SAFE':'ZONING: WET',0,167,27,PAPER,0,370);}
 }else if(['boxes','tribute','hoard','tools','breakfast','pies'].includes(m)){
  if(m==='pies'||m==='breakfast'){oval(c,0,42,138,43,PAPER);for(let i=0;i<5;i++)oval(c,-90+i*45,15,30,27,i%2?color:'#e1bd73');}
  else {rect(c,-115,-89,230,180,m==='tribute'?PINK:'#a87849');path(c,[[-115,-89],[-154,-128],[-15,-107],[0,-89]],PAPER);path(c,[[0,-89],[17,-114],[152,-126],[115,-89]],PAPER);d.text(m==='boxes'?'CLASSIFIED':m==='tribute'?'SPONSORED':'UNRELATED TOOLS',0,0,25,INK,0,206);}
 }else if(['windows','emotes','decoys','jpeg','slop','jumpcut','timeline','gradient','fashion','rope','cable','half','spears','draw','sprint','dance','zoom','march','pigeon','fishing','vacuum','cape','spin','queue','inflate','rainbow','deadpan','shredder'].includes(m)){
  if(m==='spears'){for(let i=0;i<2;i++){rect(c,-130,-40+i*72,270,16,PAPER);path(c,[[140,-51+i*72],[188,-31+i*72],[140,-11+i*72]],color);}}
  else if(m==='timeline'||m==='jumpcut'){rect(c,-152,-54,304,114,INK);for(let i=0;i<5;i++)rect(c,-138+i*57,-37,50,79,i%2?color:PINK);rect(c,54,-100,7,202,ACID);}
  else if(m==='fishing'){c.beginPath();c.moveTo(-103,96);c.lineTo(4,-126);c.bezierCurveTo(145,-158,169,67,77,99);c.strokeStyle=PAPER;c.lineWidth=8;c.stroke();d.bubble('JUST ASKING',90,100,180);}
  else if(m==='vacuum'){oval(c,0,0,150,120,PINK);oval(c,0,0,87,76,INK);for(let i=0;i<8;i++){const a=i*2.4;oval(c,Math.cos(a)*(80+q*50),Math.sin(a)*(70+q*50),14,14,i%2?ACID:BLUE);}}
  else {panel(c,d,-148,-87,296,175,word,color);d.text(m==='deadpan'?'FAIRLY BAD':m==='slop'?'FINGERS: 7':m==='jpeg'?'QUALITY: 3%':m==='pigeon'?'IS THIS A BUTTERFLY?':m==='cable'?'DISCONNECTED':m==='half'?'50% OFF':m==='gradient'?'PROFESSIONAL':m==='decoys'?'LOGIN AGAIN':word,0,15,33,INK,0,263);}
 }c.restore();
}
export const megaBeat=(p:number,reduced=false)=>reduced?'gag':p<.18?'cold-open':p<.34?'close-up':p<.46?'anticipation':p<.6875?'launch':p<.86?'contact':'gag';
export function paintMegaSpecial(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw){
 const a=s.playback,dir=MEGA_SCENES[a.cardId];if(!dir||!CARD_BY_ID[a.cardId]||a.duoId)return false;
 const p=s.reduced?1:clamp(s.progress),beat=megaBeat(p,s.reduced),launch=ease((p-.46)/.2275),hit=clamp((p-.6875)/.1725),m=dir.motif;
 // South Park-style paper-cutout waddle hop & tilt
 const hop=s.reduced?0:Math.abs(Math.sin(p*38))*16;
 const tilt=s.reduced?0:Math.sin(p*38)*5.5;
 const equippedProp=a.propId?PROP_BY_ID[a.propId]:null;

 d.background(p,.6,1.12+p*.13);d.tag(`${CARD_BY_ID[a.cardId].name.toUpperCase()} / ${beat.toUpperCase()}`,770,61,ACID,-2,875);
 if(beat==='cold-open'){
  d.actor(a.cardId,0,330,681-hop,505,-3+tilt);
  prop(c,d,m,893,387,p,dir.accent,m.toUpperCase());
  if(equippedProp)d.image(equippedProp.art,485,480-hop,135,135,-12+tilt*2);
  d.text(dir.ability.toUpperCase(),851,595,51,PAPER,-3,765);
  return true;
 }
 if(beat==='close-up'){
  const q=(p-.18)/.16;
  d.rays(dir.accent,377,324);
  d.image(CARD_BY_ID[a.cardId].art,355,373-hop*.5,690+q*135,690+q*135,-3+tilt*.5);
  d.text(m==='deadpan'?'…':m==='zoom'?'WAIT. ZOOM AGAIN.':m==='late'?'STILL LOADING THE ENTRANCE':dir.ability.toUpperCase(),961,346,73,PAPER,-4,561);
  d.tag(CARD_BY_ID[a.cardId].quote.toUpperCase(),878,594,ACID,3,656);
  return true;
 }
 if(beat==='anticipation'){
  d.rays(dir.accent,321,331);
  d.actor(a.cardId,1,290,690-hop*1.2,559,-6+tilt*1.3);
  prop(c,d,m,910,365,(p-.34)/.12,dir.accent,m.toUpperCase());
  if(equippedProp){
   d.image(equippedProp.art,510,430-hop,150,150,14-tilt*2);
   d.tag(`PROP: ${equippedProp.name.toUpperCase()}`,495,560,PINK,-3,420);
  }
  d.text(dir.ability.toUpperCase(),871,611,53,PAPER,-4,700);
  return true;
 }
 if(beat==='launch'||beat==='contact'){
  const targetX=1038+hit*58,targetY=391-Math.sin(hit*Math.PI)*70;
  if(!a.support)d.dossier(a.targetId,targetX,targetY,220,-8-hit*24);
  if(m==='rainbow'){const colors=['#ff5a5a','#ffae5a','#deff00','#4bcc83','#31d7ff','#b99bff'];for(let i=0;i<6;i++){c.beginPath();c.moveTo(310,417+i*16);c.bezierCurveTo(430,230+i*16,590,545+i*16,310+launch*930,398+i*16);c.strokeStyle=colors[i];c.lineWidth=17;c.stroke();}if(hit)d.dossier(a.targetId,1038+hit*180,415+hit*120,215,hit*55);}
  else if(m==='keyboard'){prop(c,d,m,600,523,launch,dir.accent,'PLAY THEM OUT');c.beginPath();c.moveTo(targetX,0);c.lineTo(targetX,targetY-hit*115);c.strokeStyle=PAPER;c.lineWidth=7;c.stroke();if(hit)d.dossier(a.targetId,targetX,targetY-hit*195,210,-12-hit*30);}
  else if(m==='tower'||m==='inflate'){d.actor(a.cardId,2,440+launch*150,689-hop,500+launch*(m==='tower'?650:280),tilt);for(let i=0;i<4;i++)prop(c,d,'stairs',770+i*98,500-i*76,launch*.5,dir.accent,'HEIGHT: CAT');}
  else if(m==='ceiling'){prop(c,d,m,1030,-140+launch*516,launch,dir.accent,'INSPECTION');d.weapon('paper',831,472,.9,-8,ACID,'FAILED');}
  else if(m==='bath'||m==='pool'){oval(c,839,518,360*launch,124*launch,BLUE);for(let i=0;i<7;i++)oval(c,598+i*78,490-Math.sin(i+p*8)*28,20,18,PAPER);d.weapon('paper',1011,360,.8,-8,PINK,'PARKING TICKET');}
  else if(m==='spin'){c.save();c.translate(856,387);c.rotate(launch*Math.PI*4);d.dossier(a.targetId,140,0,196,0);prop(c,d,m,-90,0,launch,dir.accent,'FOURTH EXIT');c.restore();oval(c,839,626,285,27,ACID);}
  else if(m==='queue'||m==='march'){for(let i=0;i<5;i++)d.actor(a.cardId,2,520+launch*470-i*104,675-hop,270,tilt,.75);d.tag(m==='queue'?'PLEASE RETURN TO THE BACK':'MUSHROOM MAJORITY',831,177,PAPER,2,725);}
  else if(m==='zoom'){const zoom=[.46,.54,.62].filter(q=>p>=q).length;d.image(CARD_BY_ID[a.cardId].art,344,382,450+zoom*145,450+zoom*145,0);d.text(`DRAMATIC ZOOM ${zoom}`,914,533,59,ACID,-5,577);if(hit)d.dust(1021,391,hit,dir.accent);}
  else if(m==='fire'||m==='fog'||m==='stink'){for(let i=0;i<12;i++){const x=480+i*57,y=535-Math.sin(i*2+p*8)*95;oval(c,x,y,45+launch*25,72,m==='fire'?'#ff883388':m==='stink'?'#7fb849aa':'#bac7c1aa');}prop(c,d,m,715+launch*252,361,launch,dir.accent,m==='fire'?'CUP: SAFE':'EVACUATE');}
  else if(m==='dance'||m==='rope'||m==='eras'){for(let i=0;i<8;i++)d.weapon('paper',550+i*67,210+(p*700+i*48)%320,.5,(i-3)*12,dir.accent,m==='dance'?'PAYSLIP':'VIP');d.actor(a.cardId,Math.floor(p*22)%2?1:2,395,683-hop,538,Math.sin(p*20)*7);prop(c,d,m,785+launch*180,370,launch,dir.accent,m.toUpperCase());}
  else if(m==='clip'){prop(c,d,m,418+launch*629,371,launch,dir.accent,'CONSEQUENCES');if(hit)d.wrap(targetX,targetY,hit);}
  else if(['windows','emotes','decoys','slop','adjectives','folders','replyall','intro','leadership','patch'].includes(m)){for(let i=0;i<7;i++)prop(c,d,m,500+launch*(322+i*42),222+i*48,.3+launch*.35,dir.accent,m==='slop'?'SPARE ELBOW':m==='intro'?`INTRO ${i+1}`:m==='adjectives'?['ULTRA','EPIC','FINAL','FINAL','CINEMATIC','AGAIN','FINAL'][i]:m==='emotes'?'MERGE LEFT':m==='decoys'?'LOGIN AGAIN':`FORM ${i+1}`);}
  else if(m==='deadpan'){d.actor(a.cardId,0,330,680,500,0);if(hit){d.rays(ACID,1050,377);d.actor(a.cardId,0,330,680,500,0);d.dust(1048,391,hit,PINK);}d.text('FAIRLY BAD OUTCOME',899,595,59,PAPER,-4,675);}
  else if(m==='cape'){path(c,[[355,328],[620+launch*440,472],[490+launch*525,617],[390,648]],'#372c3c');prop(c,d,'chairs',640+launch*405,475,launch,dir.accent,'THE ENTIRE SET');}
  else if(m==='stairs'||m==='swamp'||m==='demolition'||m==='flatpack'||m==='chairs'){for(let i=0;i<3;i++)prop(c,d,m,550+launch*(280+i*91),470-i*103,launch*.6,dir.accent,m.toUpperCase());}
  else if(m==='vacuum'){for(let i=0;i<9;i++){const q=clamp(launch-i*.035);d.weapon('storm',1020-q*690,230+i*41,.4+q*.2,q*75,dir.accent,'REFUND');}prop(c,d,m,714+launch*190,400,launch,dir.accent,'COMPRESSED');}
  else if(m==='timeline'||m==='jumpcut'){if(p>.53&&p<.61)d.tag('THE MISS HAS BEEN REMOVED IN POST',846,232,ACID,-3,738);prop(c,d,m,470+launch*564,415,launch,dir.accent,'SKIP TO IMPACT');}
  else prop(c,d,m,437+launch*589,443-Math.sin(launch*Math.PI)*175,launch,dir.accent,m.toUpperCase());
  if(!['tower','inflate','zoom','deadpan','dance','rope','eras'].includes(m))d.actor(a.cardId,2,304+launch*38,685-hop,534,-4+launch*6+tilt);
  if(equippedProp)d.image(equippedProp.art,460+launch*490,440-Math.sin(launch*Math.PI)*150,145,145,launch*320);
  if(hit){
   starburst(c,targetX,targetY,65+hit*35,145+hit*65,12,ACID);
   d.dust(1041,394,hit,dir.accent);
   d.text(a.preview?'SPECIAL PREVIEW':a.knockout?'CANCELLED':dir.ability.toUpperCase(),798,596,62,ACID,-5,808);
   d.tag(a.preview?'NO REWARDS / NO HYPE SPENT':d.result(a),849,669,PAPER,-2,765);
  }
  return true;
 }
 d.rays('#ddcfb3',1030,357,true);d.actor(a.cardId,m==='deadpan'||m==='bath'?0:5,329,690-hop*.6,495,-4+tilt*.6);prop(c,d,m,1024,412,.3,dir.accent,m.toUpperCase());
 if(equippedProp)d.image(equippedProp.art,500,545,130,130,-10);
 d.text(a.preview?'SPECIAL PREVIEW':a.knockout?'THREAD CLOSED':dir.ability.toUpperCase(),858,142,59,PINK,-3,754);d.bubble(dir.gag,813,288,741);d.tag(a.preview?'PREVIEW / NO REWARDS':d.result(a),805,568,ACID,-2,730);d.text('THE COMMENT SECTION HAS QUESTIONS.',834,663,26,INK,0,727);return true;
}
