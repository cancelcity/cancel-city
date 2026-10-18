// A deterministic display list, consumed directly by PixiJS and by the QA/fallback painter.
// Sprites are articulated in nested joint containers. Paper is geometry, not a flying card.
import {karenState,mix,smooth,saturate} from '../domain/karen-direction';
import type {CinematicMode} from '../domain/cinematic';
import rig from '../data/karen-rig.json';
import cashierRig from '../data/karen-cashier.json';

export const KAREN_ATLAS='/assets/karen/rig.png';
export const KAREN_OFFICE='/assets/karen/office.webp',KAREN_CASHIER='/assets/karen/cashier.png';
export interface DrawNode {id:string;kind:'group'|'image'|'poly'|'ellipse'|'text';x?:number;y?:number;sx?:number;sy?:number;r?:number;alpha?:number;children?:DrawNode[];src?:string;frame?:number[];w?:number;h?:number;points?:number[];fill?:string;stroke?:string;line?:number;text?:string;size?:number;font?:string}
const INK='#17131d',PAPER='#f5e7cd',PINK='#ec2991',GOLD='#daa552';
const group=(id:string,x:number,y:number,children:DrawNode[],sx=1,sy=sx,r=0):DrawNode=>({id,kind:'group',x,y,children,sx,sy,r});
const poly=(id:string,points:number[],fill:string,stroke=INK,line=3):DrawNode=>({id,kind:'poly',points,fill,stroke,line});
const rect=(id:string,x:number,y:number,w:number,h:number,fill:string,stroke=INK,line=3)=>poly(id,[x,y,x+w,y,x+w,y+h,x,y+h],fill,stroke,line);
const text=(id:string,value:string,x:number,y:number,size=24,fill=PAPER):DrawNode=>({id,kind:'text',text:value,x,y,size,fill,font:'CityMono'});
const oval=(id:string,x:number,y:number,w:number,h:number,fill:string):DrawNode=>({id,kind:'ellipse',x,y,w,h,fill});
const part=(id:string,index:number,x:number,y:number,w:number,h:number):DrawNode=>({id,kind:'image',src:KAREN_ATLAS,frame:rig.frames[index],x,y,w,h});
function arm(id:string,left:boolean,raise:number,grip:boolean){
 const upper=left?4:8,lower=left?5:9,hand=left?(grip?7:6):(grip?11:10);
 const shoulder=left?-71:70;
 return group(id,shoulder,-266,[group('elbow',left?-10:11,77,[group('wrist',0,65,[part('hand',hand,left?-20:-27,-12,48,52)],1,1,raise*.2),part('forearm',lower,left?-23:-16,-8,38,80)],1,1,-raise*.65),part('upper',upper,left?-39:-17,-6,50,94)],1,1,raise);
}
function rightGrip(time:number,pose:string,x:number,y:number){
 const p=pose==='pull'?smooth((time-3100)/1200):pose==='snap'?1:0,a=-.1-p*1.85,b=a-a*.65,c=b+a*.2;
 return [x+70+Math.cos(a)*11-Math.sin(a)*77-Math.sin(b)*65-Math.sin(c)*18,y-266+Math.sin(a)*11+Math.cos(a)*77+Math.cos(b)*65+Math.cos(c)*18];
}
function puppet(time:number,expression=0,pose='idle'):DrawNode[]{
 const breath=Math.sin(time/410)*1.1,angry=expression===1,flourish=pose==='pull'?smooth((time-3100)/1200):pose==='snap'?1:pose==='aftermath'?.12:0;
 const legs=[group('leg-left',-39,-113,[group('knee',0,47,[part('calf',13,-26,-12,66,82)],1,1,.04+flourish*.15),part('thigh',12,-24,-5,48,70)],1,1,.12+flourish*.14),group('leg-right',40,-113,[group('knee',0,47,[part('calf',15,-24,-12,65,82)],1,1,-flourish*.14),part('thigh',14,-24,-5,48,70)],1,1,-.14-flourish*.22)];
 // Reuse the actual inked eye texture for a tiny localized twitch; no flat eyelid masks.
 const twitch=smooth((time-1800)/80)*(1-smooth((time-2140)/80))*Math.sin(time/19);
 const lids:DrawNode[]=!angry&&Math.abs(twitch)>.01?[{id:'eye-twitch',kind:'image',src:KAREN_ATLAS,frame:[199,151,109,62],x:-83+(199-rig.frames[0][0])*172/rig.frames[0][2],y:-147+(151-rig.frames[0][1])*165/rig.frames[0][3]+twitch*.35,w:109*172/rig.frames[0][2],h:62*165/rig.frames[0][3]}]:[];
 return [...legs,arm('arm-back',true,.20+flourish*.82,true),arm('arm-front',false,-.10-flourish*1.85,true),group('body',0,breath,[part('skirt',3,-83,-170,166,94),part('torso',2,-99,-284,198,164)],1,1,-flourish*.035),group('head',-3+flourish*8,-278+breath,[part('face',angry?1:0,-83,-147,172,165),...lids],1,1,angry?-.1:-.045+Math.sin(time/900)*.013)];
}
function receipt(id:string,points:number[][],width=34):DrawNode[]{
 const edge:number[]=[];for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;edge.push(points[i][0]-dy/l*width/2,points[i][1]+dx/l*width/2);}
 for(let i=points.length-1;i>=0;i--){const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;edge.push(points[i][0]+dy/l*width/2,points[i][1]-dx/l*width/2);}
 return [poly(id,edge,PAPER,INK,2),...points.filter((_,i)=>i%5===2).map((p,i)=>group(id+'-print'+i,p[0],p[1],[rect('ink',-10,-2,20,3,'#918777','',0)],1,1,.1*Math.sin(i)))];
}
function environment(time:number,fold=0):DrawNode[]{
 if(!fold)return [{id:'office',kind:'image',src:KAREN_OFFICE,x:0,y:0,w:1280,h:720}];
 return [rect('back',0,0,1280,720,PAPER,'',0),group('fold-left',0,720,[{id:'panel',kind:'image',src:KAREN_OFFICE,frame:[0,0,640,720],x:0,y:-720,w:640,h:720}],1,1,fold*.78),group('fold-right',1280,720,[{id:'panel',kind:'image',src:KAREN_OFFICE,frame:[640,0,640,720],x:-640,y:-720,w:640,h:720}],1,1,-fold*.78)];
}
function cashier(time:number,shutter:number){return group('cashier',958,350,[{id:'uniform',kind:'image',src:KAREN_CASHIER,frame:cashierRig.frames[1],x:-64,y:-103,w:128,h:131},group('cashier-head',0,-98,[{id:'head',kind:'image',src:KAREN_CASHIER,frame:cashierRig.frames[time>9080?3:0],x:-49,y:-115,w:98,h:118}],1,1,-shutter*.07),group('arm',51,-79,[{id:'arm-sprite',kind:'image',src:KAREN_CASHIER,frame:cashierRig.frames[2],x:-4,y:-122,w:128,h:149}],1,1,.85*(1-smooth((time-8880)/420))+shutter*.17),{id:'foreground-counter',kind:'image',src:KAREN_OFFICE,frame:[720,350,430,170],x:-238,y:0,w:430,h:170}]);}
function opponent(id:string,time:number,caught:number){
 const escape=smooth((time-4600)/700),x=870+escape*135-caught*85,y=610-Math.sin(escape*Math.PI)*23;
 return group('opponent',x,y,[{id:'portrait',kind:'image',src:`/assets/specials/${id}.webp`,x:-104,y:-320,w:208,h:320},...caught>0?[rect('ankle',-72,-29,136*caught,30,PAPER),text('ankle-print','TOTAL: DIGNITY',-56,-22,9,INK)]:[]],1-caught*.17,1-caught*.12,-caught*.18);
}
export function karenDisplayList(progress:number,mode:CinematicMode='full',reduced=false,targetId='CC003'):DrawNode[]{
 const s=karenState(progress,mode,reduced),t=s.time,world:DrawNode[]=[];
 let camera={x:640,y:360,scale:1};
 if(s.shot==='charge'){
  world.push(rect('receipt-shadow',450,80,368,710,'#8b6656'),poly('receipt-slip',[430,48,791,77,762,748,400,718],PAPER),text('receipt-name','CANCEL CITY MART',470,125,27,INK),text('receipt-date','14 OCT / CUSTOMER COPY',454,190,17,INK),text('item','ONE NORMAL DAY',452,290,19,INK),text('price','0.00',688,290,19,INK),rect('line',449,336,295,2,INK,'',0),text('wrong','AUDACITY TAX',450,381,22,INK),text('wrong-price','0.99',687,381,22,PINK),text('total','TOTAL',449,479,28,INK),text('total-value','0.99',685,479,28,INK),...Array.from({length:30},(_,i)=>rect('bar'+i,448+i*9,568,i%3+2,54,INK,'',0)));
  camera={x:mix(615,642,smooth(s.u)),y:mix(333,383,smooth(s.u)),scale:mix(1.08,1.3,s.u)};
 }else if(s.shot==='twitch'){
  world.push(rect('face-bg',0,0,1280,720,'#443342','',0),group('closeup',598,1140,puppet(t,0),2.6));
  camera={x:mix(700,711,s.u),y:mix(286,279,smooth(s.u)),scale:mix(1.75,1.9,s.u)};
 }else{
  const folded=s.shot==='fold'?s.fold:s.shot==='denied'?1:0;
  world.push(...environment(t,folded));
  if(s.shot==='unroll'){
   world.push(cashier(t,0),group('karen',378,629,puppet(t,0,'pull')));
   const hand=rightGrip(t,'pull',378,629),n=Math.floor(50*s.unroll)+2,points=Array.from({length:n},(_,i)=>{const q=i/(n-1);return [hand[0]+Math.sin(q*7)*35+q*300,hand[1]+q*(640-hand[1])+Math.sin(q*9)*15];});world.push(...receipt('unroll-paper',points));
   camera={x:mix(595,630,s.u),y:388,scale:1.06};
  }else if(s.shot==='escape'){
   world.push(cashier(t,0),group('karen',360,629,puppet(t,0,'pull')),opponent(targetId,t,s.catch));
   const hand=rightGrip(t,'pull',360,629),end=870+smooth((t-4600)/700)*135-s.catch*85;world.push(...receipt('catch-paper',Array.from({length:45},(_,i)=>{const q=i/44;return [mix(hand[0],end,q),mix(hand[1],592,q)+Math.sin(q*Math.PI)*55*(1-s.catch)];})));
   camera={x:mix(650,710,s.u),y:380,scale:1};
  }else if(s.shot==='fold'){
   world.push(opponent(targetId,t,1),group('karen',360,629,puppet(t,1,'snap'),1+Math.sin(s.u*Math.PI)*.04,1,-.08*s.u));
   const hand=rightGrip(t,'snap',360,629);world.push(...receipt('taut-paper',Array.from({length:36},(_,i)=>{const q=i/35;return [mix(hand[0],920,q),mix(hand[1],580,q)+Math.sin(q*10)*18*(1-s.fold)];}),mix(35,88,s.fold)));
   world.push(group('form',954,490,[rect('form-sheet',-186,-216,372,432,PAPER),text('form-title','COMPLAINT FORM',-145,-166,25,INK),...Array.from({length:5},(_,i)=>rect('form-line'+i,-140,-92+i*46,275,2,'#b3a48e','',0))],s.fold,s.fold,-s.fold*.08));
   camera={x:640,y:370,scale:mix(1,1.13,s.fold)};
  }else if(s.shot==='denied'){
   world.push(rect('paper-bg',0,0,1280,720,PAPER,'',0),text('form-heading','MUNICIPAL COMPLAINT FORM',255,128,36,INK),...Array.from({length:7},(_,i)=>rect('form-lines'+i,255,232+i*58,780,2,'#c5b598','',0)),{id:'target-evidence',kind:'image',src:`/assets/specials/${targetId}.webp`,x:756,y:139,w:148,h:248});
   const stampY=mix(-180,420,s.stamp),bounce=t>7600?Math.sin(saturate((t-7600)/350)*Math.PI)*16:0;
   if(t<7800)world.push(group('stamp',647,stampY-bounce,[rect('stamp-body',-199,-59,398,118,'#522a48',INK,8),rect('stamp-handle',-50,-193,100,134,'#744a3c'),oval('stamp-top',0,-196,150,55,GOLD)],1,1,-.075));
   if(t>=7600)world.push(group('denial',645,416,[rect('border',-208,-63,416,126,'#00000000',PINK,8),text('denial-word','REFUND DENIED',-174,-14,39,PINK)],mix(1.08,1,smooth((t-7600)/160)),1,-.075));
   camera={x:640,y:360,scale:1};
  }else{
   world.push(cashier(t,s.shutter),group('karen',410,629,puppet(t,t>9080?1:0,'aftermath'),1,1,t>9080?-.05:0));
   world.push(rect('shutter-shadow',734,143,392,207*s.shutter,'#211d28','',0));
   if(s.shutter>0)world.push(group('shutter',734,143,[rect('metal',0,0,392,207*s.shutter,'#85838b'),...Array.from({length:14},(_,i)=>rect('slat'+i,0,i*16,392,i*16<207*s.shutter?3:0,'#45434e','',0))]));
   if(s.shutter>.9)world.push(text('closed','CLOSED',876,237,27,INK));
   world.push(group('receipt-floor',645,638,[rect('receipt',-128,-21,256,52,PAPER),text('floor-denied','REFUND DENIED',-93,-7,18,PINK)],1,1,.045));
   camera={x:mix(647,670,s.u),y:380,scale:mix(1.03,1.10,s.u)};
  }
 }
 const scene=group('camera',640-camera.x*camera.scale,360-camera.y*camera.scale,world,camera.scale);
 return [scene,rect('letterbox-top',0,0,1280,34,INK,'',0),rect('letterbox-bottom',0,686,1280,34,INK,'',0)];
}
export function paintKarenFrame(ctx:CanvasRenderingContext2D,images:Record<string,CanvasImageSource>,nodes:DrawNode[],width=1280,height=720){
 ctx.save();ctx.setTransform(width/1280,0,0,height/720,0,0);ctx.fillStyle=INK;ctx.fillRect(0,0,1280,720);
 const draw=(node:DrawNode)=>{ctx.save();ctx.translate(node.x??0,node.y??0);ctx.scale(node.sx??1,node.sy??1);ctx.rotate(node.r??0);ctx.globalAlpha*=node.alpha??1;
  if(node.kind==='group')node.children?.forEach(draw);
  else if(node.kind==='image'){const image=node.src?images[node.src]:null;if(image){const f=node.frame;if(f)ctx.drawImage(image,f[0],f[1],f[2],f[3],0,0,node.w!,node.h!);else ctx.drawImage(image,0,0,node.w!,node.h!);}}
  else if(node.kind==='text'){ctx.font=`bold ${node.size}px ${node.font}, monospace`;ctx.fillStyle=node.fill!;ctx.textBaseline='top';ctx.fillText(node.text!,0,0);}
  else {ctx.beginPath();if(node.kind==='ellipse')ctx.ellipse(0,0,node.w!/2,node.h!/2,0,0,Math.PI*2);else{const p=node.points!;ctx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.closePath();}ctx.fillStyle=node.fill!;ctx.fill();if(node.stroke&&node.line){ctx.strokeStyle=node.stroke;ctx.lineWidth=node.line;ctx.lineJoin='round';ctx.stroke();}}
  ctx.restore();};nodes.forEach(draw);ctx.restore();
}
