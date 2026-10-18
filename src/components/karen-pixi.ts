import type {Application,Container,Graphics,Sprite,Text,Texture} from 'pixi.js';
import type {DrawNode} from './karen-renderer';
import {KAREN_ATLAS,KAREN_OFFICE,KAREN_CASHIER,paintKarenFrame} from './karen-renderer';

export interface KarenRenderer {gpu:boolean;render:(nodes:DrawNode[])=>void;destroy:()=>void}
export async function createKarenRenderer(host:HTMLElement,targetId:string):Promise<KarenRenderer>{
 const images:Record<string,HTMLImageElement>={};
 const sources=[KAREN_ATLAS,KAREN_OFFICE,KAREN_CASHIER,`/assets/specials/${targetId}.webp`];
 await Promise.all(sources.map(src=>new Promise<void>((resolve,reject)=>{const im=new Image();im.onload=()=>{images[src]=im;resolve();};im.onerror=()=>reject(new Error('The scene artwork could not load.'));im.src=src;})));
 try{const font=await new FontFace('CityMono','url(/assets/actors/city-mono.ttf)').load();document.fonts.add(font);}catch{}
 const pixi=await import('pixi.js');
 let app:Application|undefined;
 try{
  app=new pixi.Application();await app.init({width:1280,height:720,antialias:true,background:'#17131d',preference:'webgl',autoStart:false,resolution:Math.min(1.5,window.devicePixelRatio||1),autoDensity:true});
  const instance=app;instance.canvas.className='karen-canvas';instance.canvas.setAttribute('aria-hidden','true');host.appendChild(instance.canvas);
  const roots=new Map<string,Container>(),textures=new Map<string,Texture>();
  const texture=(src:string,frame?:number[])=>{const key=src+':'+(frame?.join(',')??'all');let tex=textures.get(key);if(!tex){const base=pixi.Texture.from(images[src]);tex=frame?new pixi.Texture({source:base.source,frame:new pixi.Rectangle(...frame as [number,number,number,number])}):base;textures.set(key,tex);}return tex;};
  const update=(parent:Container,nodes:DrawNode[],prefix:string)=>{
   const alive=new Set<string>();nodes.forEach((n,order)=>{const key=prefix+'/'+n.id;alive.add(key);let display=roots.get(key);
    if(!display){display=n.kind==='group'?new pixi.Container():n.kind==='image'?new pixi.Sprite(texture(n.src!,n.frame)):n.kind==='text'?new pixi.Text({text:n.text!,style:{fontFamily:'CityMono, monospace',fontSize:n.size,fontWeight:'bold',fill:n.fill}}):new pixi.Graphics();roots.set(key,display);parent.addChild(display);display.label=key;}
    if(display.parent!==parent)parent.addChild(display);parent.setChildIndex(display,order);
    display.position.set(n.x??0,n.y??0);display.scale.set(n.sx??1,n.sy??1);display.rotation=n.r??0;display.alpha=n.alpha??1;
    if(n.kind==='group')update(display,n.children??[],key);
    else if(n.kind==='image'){const sprite=display as Sprite;sprite.texture=texture(n.src!,n.frame);sprite.width=n.w!;sprite.height=n.h!;}
    else if(n.kind==='text'){const label=display as Text;label.text=n.text!;label.style.fontSize=n.size!;label.style.fill=n.fill!;}
    else{const g=display as Graphics;g.clear();if(n.kind==='ellipse')g.ellipse(0,0,n.w!/2,n.h!/2);else g.poly(n.points!,true);g.fill({color:n.fill==='#00000000'?'#000000':n.fill!,alpha:n.fill==='#00000000'?0:1});if(n.stroke&&n.line)g.stroke({color:n.stroke,width:n.line,join:'round'});}
   });
   for(const child of [...parent.children])if(!alive.has(child.label)){const remove=(d:Container)=>{for(const c of [...d.children])remove(c);roots.delete(d.label);};remove(child);child.destroy({children:true});}
  };
  return {gpu:true,render:nodes=>{update(instance.stage,nodes,'root');instance.render();},destroy:()=>{instance.destroy(true,{children:true,texture:false,textureSource:false});for(const t of textures.values())t.destroy();textures.clear();roots.clear();}};
 }catch{
  if(app?.renderer)app.destroy(true,{children:true});
  // WebGL-less devices receive the SAME authored scene, not the old pose-swap special.
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;canvas.className='karen-canvas';canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No supported scene renderer.');
  return {gpu:false,render:nodes=>paintKarenFrame(ctx,images,nodes),destroy:()=>canvas.remove()};
 }
}
