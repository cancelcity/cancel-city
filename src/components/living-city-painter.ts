import type {City} from '../domain/city';
import {places,ROAD,WALKS,routeLength,routePoint,worldPoint,type Point,type Camera,type Place} from '../domain/living-city';
import cast from '../data/actor-cast.json';
import {CITY_EVENT_BY_ID} from '../data/city-events';
import boundsData from '../data/city-sprites.json';
import walkCycle from '../data/city-walk-cycle.json';
type Bounds={x:number;y:number;width:number;height:number};
type Actor={baseHeight:number;poses:{src:string;width:number;height:number;anchor:Point}[]};
const CAST=cast as Record<string,Actor>,BOUNDS=boundsData as Record<string,Bounds>;
export type Images=Record<string,CanvasImageSource>;
export type WorldState={city:City|null;selected:string|null;hover:string|null;time:number;now?:number;reduced:boolean;prop?:string;construction?:{plot:number;at:number}};
export type Hit=Bounds&{id:string;depth:number;src?:string};
const INK='#151419',PAPER='#e8dbb7',PINK='#ff168c',YELLOW='#eee629';
const locals=[{id:'CC063',x:1045,y:632},{id:'CC064',x:1082,y:641},{id:'CC066',x:1118,y:649},{id:'CC135',x:475,y:640},{id:'CC023',x:995,y:1060}];
export function worldAssets(city:City|null,prop?:string){return [...new Set([
 '/assets/living-city/ground.webp','/assets/living-city/walker.webp','/assets/living-city/van.webp',
 ...places(city).map(p=>p.src),...locals.flatMap(p=>[CAST[p.id]?.poses[0]?.src,CAST[p.id]?.poses[1]?.src]),
 ...(city?.plots||[]).flatMap(b=>b?.residentId?[CAST[b.residentId]?.poses[0]?.src]:[]),prop,
 city?.activeEvent?CAST[CITY_EVENT_BY_ID[city.activeEvent.eventId]?.host]?.poses[0]?.src:undefined,
 ].filter((s):s is string=>!!s))];}
function line(c:CanvasRenderingContext2D,points:Point[],color:string,width:number){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke=INK,lw=2){c.fillStyle=fill;c.fillRect(x,y,w,h);if(lw){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
function oval(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string){c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function words(c:CanvasRenderingContext2D,s:string,x:number,y:number,size=20,color=PAPER){c.font=`${size}px CityCondensed,Impact,sans-serif`;c.fillStyle=color;c.textAlign='center';c.fillText(s,x,y);}
function sprite(c:CanvasRenderingContext2D,images:Images,src:string,x:number,y:number,w:number):Bounds|null{const im=images[src],b=BOUNDS[src];if(!im||!b)return null;const h=w*b.height/b.width;c.drawImage(im,b.x,b.y,b.width,b.height,x-w/2,y-h,w,h);return {x:x-w/2,y:y-h,width:w,height:h};}
function actor(c:CanvasRenderingContext2D,images:Images,id:string,x:number,y:number,h:number,pose=0){const a=CAST[id],p=a?.poses[pose]||a?.poses[0];if(!p||!images[p.src])return;const s=h/a.baseHeight;oval(c,x,y+1,h*.18,h*.035,'#11151a66');c.drawImage(images[p.src],x-p.anchor.x*s,y-p.anchor.y*s,p.width*s,p.height*s);}
function lamp(c:CanvasRenderingContext2D,x:number,y:number,t:number){line(c,[{x,y},{x:x+2,y:y-96},{x:x+22,y:y-104}],INK,7);line(c,[{x:x+2,y:y-3},{x:x+3,y:y-95}],'#88816a',2);box(c,x+10,y-107,28,11,INK);oval(c,x+24,y-95,11,3,'#ffeb9f');const g=c.createRadialGradient(x+24,y-94,1,x+24,y-94,42);g.addColorStop(0,`rgba(255,210,72,${.26+Math.sin(t*.4+x)*.02})`);g.addColorStop(1,'#f7c83900');c.fillStyle=g;c.fillRect(x-20,y-140,90,90);oval(c,x+24,y,28,6,'#efd46920');}
function lot(c:CanvasRenderingContext2D,p:Place,selected:boolean){const x=p.x,y=p.y,w=p.width*.62;c.beginPath();c.moveTo(x-w/2,y-35);c.lineTo(x+w/2-20,y-65);c.lineTo(x+w/2,y-12);c.lineTo(x-w/2+20,y+17);c.closePath();c.fillStyle='#302c2c6a';c.fill();for(let i=0;i<5;i++){const xx=x-w/2+i*w/4;line(c,[{x:xx,y:y-30-i*4},{x:xx,y:y-66-i*4}],INK,4);}line(c,[{x:x-w/2,y:y-53},{x:x+w/2,y:y-69}],PAPER,5);c.setLineDash([10,8]);line(c,[{x:x-w/2,y:y-53},{x:x+w/2,y:y-69}],INK,5);c.setLineDash([]);box(c,x-47,y-59,94,29,selected?YELLOW:PAPER);words(c,'BUILD HERE',x,y-38,18,INK);}
export function paintWorld(c:CanvasRenderingContext2D,images:Images,s:WorldState,w:number,h:number,camera:Camera):Hit[]{
 c.save();c.fillStyle=INK;c.fillRect(0,0,w,h);c.translate(w/2,h/2);c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);c.imageSmoothingEnabled=true;
 if(images['/assets/living-city/ground.webp'])c.drawImage(images['/assets/living-city/ground.webp'],0,0,1920,1120);
 const active=s.city?.activeEvent,event=active&&Date.parse(active.endsAt)>(s.now??Date.now())?CITY_EVENT_BY_ID[active.eventId]:null;
 const t=s.reduced?0:s.time,items:{depth:number;draw:()=>void}[]=[],hits:Hit[]=[];
 for(const original of places(s.city)){const bd=BOUNDS[original.src],p={...original,width:bd?Math.min(original.width,Math.max(140,original.y-125)*bd.width/bd.height):original.width};items.push({depth:p.y,draw:()=>{
  if(!p.src){lot(c,p,s.selected===p.id);hits.push({id:p.id,x:p.x-p.width*.33,y:p.y-85,width:p.width*.66,height:100,depth:p.y});return;}
  const b=p.plot===undefined?null:s.city?.plots[p.plot],focus=s.selected===p.id||s.hover===p.id;
  oval(c,p.x+4,p.y-15,p.width*.32,p.width*.035,'#11151a44');if(focus){c.shadowColor=YELLOW;c.shadowBlur=9;}
  const rect=sprite(c,images,p.src,p.x,p.y,p.width);c.shadowBlur=0;if(rect)hits.push({id:p.id,...rect,depth:p.y,src:p.src});
  if(b){box(c,p.x-60,p.y+3,120,24,focus?YELLOW:INK,focus?INK:'#b7aa8b',1.5);words(c,`LEVEL ${b.level} · ${b.residentId?'ON SHIFT':'VACANT'}`,p.x,p.y+20,16,focus?INK:PAPER);
   if(b.residentId)actor(c,images,b.residentId,p.x+p.width*.28,p.y+25,64);
   const sign=s.city?.signs[String(p.plot)];if(sign){box(c,p.x-94,p.y-55,188,24,PAPER);words(c,sign,p.x,p.y-37,17,INK);}
   if(b.kind==='afterparty'&&b.level>1){box(c,p.x-85,p.y-43,170,24,b.level===3?YELLOW:PINK);words(c,b.level===3?'SEVEN KINGDOMS / NOW DELIVERING':'DRIVE-THRU DYNASTY',p.x,p.y-25,b.level===3?13:17,INK);}
   if(b.kind==='feed'&&t%12<3){box(c,p.x-68,p.y-p.width*.70,136,24,INK);words(c,'SOURCE? SOURCE? SOURCE?',p.x,p.y-p.width*.70+17,15,'#81e0e5');}
  }else if(p.plot===1){box(c,p.x-90,p.y+3,180,25,PAPER);words(c,'PALACE LEASE AVAILABLE',p.x,p.y+21,18,INK);}
  if(p.id==='packs'||b?.kind==='afterparty'){const g=c.createRadialGradient(p.x,p.y-25,2,p.x,p.y-25,60);g.addColorStop(0,'#ff169e33');g.addColorStop(1,'#ff169e00');c.fillStyle=g;c.fillRect(p.x-60,p.y-85,120,120);}
  if(p.plot===1||b?.kind==='afterparty'){for(let k=0;k<6;k++){const q=(t*.23+k/6)%1;c.globalAlpha=(1-q)*.18;oval(c,p.x+p.width*.35+Math.sin(q*6)*12,p.y-p.width*.69-q*90,8+q*15,13+q*17,'#edd8b0');}c.globalAlpha=1;}
  if(s.construction&&s.construction.plot===p.plot){const q=(s.time-s.construction.at)/1.3;if(q>=0&&q<1){c.globalAlpha=1-q;for(let k=0;k<18;k++){c.fillStyle=k%2?PINK:YELLOW;c.fillRect(p.x+Math.cos(k*2.4)*q*100,p.y-40+Math.sin(k*2.4)*q*80,4,9);}c.globalAlpha=1;}}
 }});}
 // The pause at the crossing belongs to the van's path, not a looping CSS transform.
 const cycle=t%51,d=(cycle<17?cycle:cycle<22?17:cycle-5)*52-110,van=routePoint(ROAD,d);
 items.push({depth:van.y+12,draw:()=>{c.save();c.translate(van.x,van.y+12);c.rotate(van.angle*.3);oval(c,0,-2,64,10,'#14151a55');sprite(c,images,'/assets/living-city/van.webp',0,0,148);c.restore();}});
 for(let i=0;i<22;i++){const r=WALKS[i%4],len=routeLength(r),walk=(t*(12+i%4*2)+i*173)%(2*len),reverse=walk>len,p=routePoint(r,reverse?2*len-walk:walk);
  items.push({depth:p.y,draw:()=>{const image=images['/assets/living-city/walker.webp'];if(!image)return;const f=walkCycle[Math.floor(t*8+i*1.7)%8],scale=(39+p.y/110)/f.height;c.save();c.translate(p.x,p.y);c.scale((reverse?-1:1)*(event?.kind==='reverse'?-1:1),1);oval(c,0,1,9,3,'#11151a66');c.drawImage(image,f.x,f.y,f.width,f.height,-f.anchorX*scale,-f.anchorY*scale,f.width*scale,f.height*scale);c.restore();}});
 }
 for(const p of locals.filter(p=>!s.city?.plots.some(b=>b?.residentId===p.id)))items.push({depth:p.y,draw:()=>{actor(c,images,p.id,p.x,p.y,68,(p.id==='CC066'&&t%15<2||p.id==='CC135'&&t%11<2||p.id==='CC023'&&t%13<2)?1:0);hits.push({id:p.id,x:p.x-24,y:p.y-69,width:48,height:72,depth:p.y});}});
 for(const [x,y] of [[580,620],[1188,670],[305,665],[1660,720],[505,1000],[1300,1060],[1100,810]])items.push({depth:y,draw:()=>lamp(c,x,y,t)});
 items.push({depth:704,draw:()=>{box(c,1505,640,5,65,INK);box(c,1555,640,5,65,INK);box(c,1496,599,70,65,'#837052');words(c,'JOBS',1531,617,20,YELLOW);for(let i=0;i<4;i++){box(c,1503+i%2*28,624+Math.floor(i/2)*17,22,13,i?PAPER:PINK);line(c,[{x:1506+i%2*28,y:630+Math.floor(i/2)*17},{x:1521+i%2*28,y:630+Math.floor(i/2)*17}],INK,1);}}});
 if(s.prop)items.push({depth:1060,draw:()=>{box(c,1515,1024,70,36,'#514d56',INK,3);sprite(c,images,s.prop!,1550,1028,68);words(c,'LOST & VERY FOUND',1550,1080,17,PAPER);}});
 if(event){
  items.push({depth:720,draw:()=>{box(c,1322,664,155,35,PINK);words(c,event.name.toUpperCase(),1400,686,14,INK);line(c,[{x:1350,y:699},{x:1350,y:722}],INK,4);line(c,[{x:1450,y:699},{x:1450,y:722}],INK,4);
   if(!locals.some(p=>p.id===event.host)&&!s.city?.plots.some(b=>b?.residentId===event.host)){actor(c,images,event.host,1470,720,66);hits.push({id:event.host,x:1445,y:650,width:50,height:72,depth:720});}
  }});
 }
 items.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
 if(event?.kind==='sleep'){c.fillStyle='#15152c40';c.fillRect(0,0,1920,1120);}
 if(event?.kind==='disco'){for(let i=0;i<6;i++){const x=340+i*240,y=720+Math.sin(t+i)*40,g=c.createRadialGradient(x,y,0,x,y,100);g.addColorStop(0,i%2?'#ff168c30':'#64e7e530');g.addColorStop(1,'#ff168c00');c.fillStyle=g;c.fillRect(x-100,y-100,200,200);}}

 for(let i=0;i<8;i++){const x=(t*18+i*237)%2050-65,y=850+Math.sin(t*.7+i)*22+i%3*35;c.save();c.translate(x,y);c.rotate(Math.sin(t+i)*.45);box(c,-5,-3,10,6,PAPER,INK,.8);line(c,[{x:-3,y:-1},{x:3,y:-1}],'#8c806b',.6);c.restore();}
 if(t%20>8&&t%20<12){box(c,1008,528,199,34,PAPER,INK,3);words(c,'STILL SECOND IN LINE.',1108,552,22,INK);}
 if(t%26>17&&t%26<21){box(c,278,525,224,32,PAPER,INK,3);words(c,'DRACARYS. EXTRA CRISPY.',390,548,21,INK);}
 if(s.city?.theme==='riot'||s.city?.theme==='gold'){c.globalAlpha=.07;c.fillStyle=s.city.theme==='riot'?PINK:YELLOW;c.fillRect(0,0,1920,1120);c.globalAlpha=1;}
 c.restore();return hits.sort((a,b)=>b.depth-a.depth);
}
export function pickWorld(hits:Hit[],p:Point,camera:Camera,w:number,h:number,masks?:Record<string,(x:number,y:number)=>boolean>){const pt=worldPoint(p,camera,w,h);return hits.find(o=>pt.x>=o.x&&pt.x<=o.x+o.width&&pt.y>=o.y&&pt.y<=o.y+o.height&&(!o.src||!masks?.[o.src]||masks[o.src]((pt.x-o.x)/o.width,(pt.y-o.y)/o.height)));}
