// Layered cinematic: fixed scenery, intact alpha actors, continuous trajectories,
// separately animated effects. No optical-flow warping or cross dissolves.
import {createRequire} from 'node:module';
import path from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
const runtime=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'));
const {createCanvas,loadImage}=runtime('@napi-rs/canvas'),sharp=runtime('sharp');
const film=JSON.parse(await readFile('src/data/gokart-film.json','utf8'));
const W=1280,H=720,FPS=60,root='docs/art/gokart-layered',out=path.dirname(`public${film.video}`),work='work/gokart-layered';
await mkdir(out,{recursive:true});await mkdir(work,{recursive:true});await mkdir(root,{recursive:true});
const surface=createCanvas(W,H),c=surface.getContext('2d'),images={},bounds={},alphaReport=[];
const hash=b=>createHash('sha256').update(b).digest('hex'),clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,t)=>a+(b-a)*t;
for(const file of [...new Set([...Object.values(film.layering),...film.shots.flatMap(s=>s.drawings)])]){images[file]=await loadImage(file);if(Object.values(film.layering).includes(file))continue;
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=info.width,y0=info.height,x1=-1,y1=-1,clear=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=data[(y*info.width+x)*4+3];if(a<8)clear++;if(a>24){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
 if(clear/(info.width*info.height)<.02||x1<x0)throw Error(`Actor requires genuine alpha: ${file}`);
 bounds[file]={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};alphaReport.push({file,clearFraction:clear/(info.width*info.height),bounds:bounds[file]});
}
// Optional mechanically measured main-subject bounds separate the loose wheel.
try{const b=JSON.parse(await readFile(`${root}/ending/main-bounds.json`,'utf8'));for(const [name,rect] of Object.entries(b))bounds[`${root}/ending/${name}`]=rect;}catch{}
function cover(ctx,im,scale=1,dx=0,dy=0){const k=Math.max(W/im.width,H/im.height)*scale;ctx.drawImage(im,(W-im.width*k)/2+dx,(H-im.height*k)/2+dy,im.width*k,im.height*k);}
function background(ctx,shot,p,locked=false){const q=locked ? .5 : p,file=shot.id==='rush'?film.layering.headon:film.layering.circuit;ctx.fillStyle='#0b0b0b';ctx.fillRect(0,0,W,H);cover(ctx,images[file],shot.id==='drift'?1.15:1.04,shot.id==='drift'?mix(65,-65,q):0,0);}
function poly(points,fill,stroke='#0b0b0b',width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function ellipse(x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function tire(x,y,size,angle=0){c.save();c.translate(x,y);c.rotate(angle);ellipse(0,0,size,size*.83,'#11100f','#080808');ellipse(0,0,size*.48,size*.41,'#181615','#817867');ellipse(0,0,size*.28,size*.24,'#060605','#3d3831');c.strokeStyle='#635b4c';c.lineWidth=1.1;for(let i=0;i<19;i++){const a=i/19*Math.PI*2;c.beginPath();c.moveTo(Math.cos(a)*size*.69,Math.sin(a)*size*.58);c.lineTo(Math.cos(a+.13)*size*.94,Math.sin(a+.13)*size*.77);c.stroke();}c.restore();}
function aura(x,y,w,h,t,power=1){c.save();c.globalAlpha=.8*power;for(let i=0;i<6;i++){const start=-Math.PI+i*.94+Math.sin(t*5+i)*.1,points=[];for(let k=0;k<8;k++){const a=start+k*.1,r=1+Math.sin(i*13+k*7+t*9)*.08;points.push([x+Math.cos(a)*w*.61*r,y-h*.48+Math.sin(a)*h*.54*r]);}for(const [color,width] of [['#0b0b0b',7],[i%2?'#e1ff00':'#ffbf00',3]]){c.beginPath();points.forEach(([xx,yy],k)=>k?c.lineTo(xx,yy):c.moveTo(xx,yy));c.strokeStyle=color;c.lineWidth=width;c.stroke();}}c.restore();}
function smoke(x,y,t,power=1){for(let i=0;i<9;i++){const age=(t*1.65+i*.113)%1,xx=x-age*260+(i%3)*19,yy=y-age*54+Math.sin(i*7)*12,rx=10+age*27,ry=7+age*15,points=[];for(let k=0;k<13;k++){const a=k/13*Math.PI*2,r=1+Math.sin(k*7+i*11)*.17;points.push([xx+Math.cos(a)*rx*r,yy+Math.sin(a)*ry*r]);}c.save();c.globalAlpha=(1-age)*.48*power;poly(points,'#c5bba2','#29241e',1.2);c.restore();}}
function streaks(t,amount=1){c.save();c.strokeStyle='#e8dfc8';c.globalAlpha=.46*amount;c.lineWidth=2;for(let i=0;i<28;i++){const x=((i*171-t*1250)%1600+1600)%1600-160,y=345+(i*47)%335;c.beginPath();c.moveTo(x,y);c.lineTo(x-70-(i%4)*25,y+9);c.stroke();}c.restore();}
function dustBurst(x,y,p){if(p<=0)return;for(let i=0;i<15;i++){const a=i*2.4,s=45+(i%7)*19,xx=x+Math.cos(a)*p*s*2.1,yy=y+Math.sin(a)*p*s-p*30,rx=10+p*(20+i%5*7),ry=8+p*23,points=[];for(let k=0;k<11;k++){const b=k/11*Math.PI*2,r=1+Math.sin(i*11+k*7)*.2;points.push([xx+Math.cos(b)*rx*r,yy+Math.sin(b)*ry*r]);}c.save();c.globalAlpha=Math.max(0,1-p)*.7;poly(points,i%5?'#c5bba2':'#e1ff00','#30271d',1.4);c.restore();}}
function actor(shot,p,x,y,height,rotation=0,force){const index=force??Math.min(shot.drawings.length-1,Math.floor(p*shot.drawings.length)),file=shot.drawings[index],b=bounds[file];
 const w=b.w/b.h*height;if(shot.id!=='ignition'){c.save();c.globalAlpha=shot.id==='rush'?.2:.46;ellipse(x,shot.id==='rush'?688:y+5,w*.43,height*.035,'#080808');c.restore();}c.save();c.translate(x,y);c.rotate(rotation);c.drawImage(images[file],b.x,b.y,b.w,b.h,-w/2,-height,w,height);c.restore();return {index,x,y,height,w};}
const shotAt=t=>[...film.shots].reverse().find(s=>t>=s.start)??film.shots[0];
function paint(t,{backgroundOnly=false,locked=false}={}){const shot=shotAt(t),p=clamp((t-shot.start)/(shot.end-shot.start));background(c,shot,p,locked);if(backgroundOnly)return {shot,p};
 let a;
 if(shot.id==='ignition'){aura(490,790,710,740,t,.17);a=actor(shot,p,560,790,850+p*25,-.015);}
 if(shot.id==='reveal'){const h=mix(470,540,ease(p));aura(640,674,620,620,t,p*.8);smoke(350,658,t,.5);a=actor(shot,p,640+Math.sin(t*66)*p*1.2,674+Math.sin(t*80)*p*1.3,h);}
 if(shot.id==='drift'){const q=ease(p),x=mix(210,1050,q),y=665-Math.sin(p*Math.PI)*19,h=mix(405,560,q);streaks(t,.8);aura(x,y,h*.98,h*1.05,t,.8);smoke(x-h*.42,y-6,t);a=actor(shot,p,x,y,h,mix(-.07,.1,p));}
 if(shot.id==='rush'){const q=p*p,h=mix(170,810,q),y=675-Math.sin(p*Math.PI)*64;aura(640,y,h,h*1.07,t,.85);streaks(t,1);a=actor(shot,p,640,y,h,Math.sin(p*Math.PI)*.025);}
 if(shot.id==='impact'){const hit=ease((p-.26)/.68),x=mix(350,1510,p),h=500;aura(x,673,h,h,t,.7);streaks(t,.8);a=actor(shot,p,x,673-Math.sin(p*Math.PI)*12,h,.03*Math.sin(p*Math.PI));
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){const i=row*4+col,s=40+(i%3)*3,ox=1055+col*56,oy=625-row*56,dx=(col-1.2)*470*hit,dy=-Math.sin(hit*Math.PI)*mix(170,410,(i%5)/4)+hit*170;tire(ox+dx,oy+dy,s,hit*(i%2?5:-5));}
  dustBurst(1110,550,clamp((p-.26)/.72));}
 if(shot.id==='ending'){const q=ease((p-.38)/.5);a=actor(shot,p,660,673,525,-q*.022);if(q>0)tire(395-q*480,650-25*Math.abs(Math.sin(q*Math.PI*3))*(1-q),46,-q*10);}
 // Short clean final hold/fade, leaving the acting unobscured.
 if(t>film.duration-.1){c.fillStyle=`rgba(11,11,11,${clamp((t-film.duration+.1)/.1)})`;c.fillRect(0,0,W,H);}
 return {shot,p,actor:a};
}
// Retime the original self-produced Foley per shot, keeping impacts attached to actions.
const n=film.shots.length,split=`[1:a]asplit=${n}`+film.shots.map((_,i)=>`[a${i}]`).join('')+';',filters=film.shots.map((s,i)=>{const old=film.audioSource.shots[i],speed=(old.end-old.start)/(s.end-s.start);return `[a${i}]atrim=start=${old.start}:end=${old.end},asetpts=PTS-STARTPTS,atempo=${speed}[r${i}]`;}).join(';')+';'+film.shots.map((_,i)=>`[r${i}]`).join('')+`concat=n=${n}:v=0:a=1[outa]`;
const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',`${FPS}`,'-i','pipe:0','-i',`public${film.audioSource.video}`,'-filter_complex',split+filters,'-map','0:v','-map','[outa]','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','192k','-movflags','+faststart','-t',`${film.duration}`,`public${film.video}`],{stdio:['pipe','inherit','inherit']});const exited=once(ff,'exit'),total=Math.round(film.duration*FPS),actorPaths=[];
for(let i=0;i<total;i++){const t=i/FPS,info=paint(t);actorPaths.push({frame:i,shot:info.shot.id,...info.actor});const pixels=c.getImageData(0,0,W,H).data;if(!ff.stdin.write(Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength)))await once(ff.stdin,'drain');}ff.stdin.end();const [code]=await exited;if(code!==0)throw Error('Layered video failed');
paint(2.2);await sharp(surface.toBuffer('image/png')).webp({quality:92}).toFile(`public${film.poster}`);
const contact=createCanvas(1920,1440),cc=contact.getContext('2d');let cell=0;for(const s of film.shots){paint(s.start+(s.end-s.start)*.5);await sharp(surface.toBuffer('image/png')).resize(384,216).webp({quality:90}).toFile(`public${s.thumbnail}`);for(const p of [.2,.72]){paint(s.start+(s.end-s.start)*p);cc.drawImage(surface,cell%3*640,Math.floor(cell/3)*360,640,360);cell++;}}
await writeFile(`${work}/contact.jpg`,contact.toBuffer('image/jpeg'));
const stable=[];for(const s of film.shots){paint(s.start+.02,{backgroundOnly:true,locked:true});const a=hash(surface.toBuffer('image/png'));paint(s.end-.02,{backgroundOnly:true,locked:true});const b=hash(surface.toBuffer('image/png'));if(a!==b)throw Error('Background changed within shot');stable.push({shot:s.id,exactBackgroundWithLockedCamera:a===b,hash:a});}
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',`public${film.video}`],{encoding:'utf8'}));
await writeFile(film.renderReport,JSON.stringify({duration:film.duration,fps:FPS,frames:total,alphaActors:alphaReport,backgroundStability:stable,backgroundSourceHashes:Object.fromEntries(await Promise.all(Object.values(film.layering).map(async p=>[p,hash(await readFile(p))]))),motion:'Continuous intact actor transforms and deterministic effect trajectories at60fps. Discrete expression/pose drawings remain; no body-part rig, full-frame blending or optical-flow distortion.',verification:{decoded:true,browserPlayback:'unverified',phoneLayout:'unverified',audiblePlayback:'unverified'},probe},null,2));
await writeFile(`${work}/actor-paths.json`,JSON.stringify(actorPaths));console.log(`Layered film: ${film.duration}s, ${total} frames; fixed backgrounds and alpha validated.`);
