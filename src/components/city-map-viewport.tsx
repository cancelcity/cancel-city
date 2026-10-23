'use client';

import {useCallback,useEffect,useId,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent,type ReactNode} from 'react';
import {Minus,Plus,Scan} from 'lucide-react';

export type CityMapFocus={x:number;y:number;zoom:number};
type Box={width:number;height:number};
type Point={x:number;y:number};
type Drag={id:number;origin:Point;last:Point;active:boolean};
type Pinch={distance:number;zoom:number;world:Point};

const HOME:CityMapFocus={x:50,y:50,zoom:1};
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const worldSize=(box:Box)=>{const width=Math.max(box.width,box.height*16/9);return {width,height:width*9/16};};
const constrain=(focus:CityMapFocus,box:Box):CityMapFocus=>{
 const zoom=clamp(focus.zoom,1,3),world=worldSize(box);
 if(!world.width||!world.height)return {...focus,zoom};
 const marginX=box.width/(world.width*zoom)*50,marginY=box.height/(world.height*zoom)*50;
 return {x:clamp(focus.x,marginX,100-marginX),y:clamp(focus.y,marginY,100-marginY),zoom};
};
const interactive=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('button,a,input,select,textarea,[role="button"],[data-city-map-control]');

/** Children use absolute left/top percentages in the illustrated 16:9 world. */
export function CityMapViewport({art,label,children,initialFocus,sceneKey,onMapClick,className='',paused=false}:{art:string;label:string;children:ReactNode;initialFocus?:CityMapFocus;sceneKey:string;onMapClick?:()=>void;className?:string;paused?:boolean}){
 const viewport=useRef<HTMLDivElement>(null),boxRef=useRef<Box>({width:0,height:0}),cameraRef=useRef<CityMapFocus>(initialFocus||HOME),pointers=useRef(new Map<number,Point>()),drag=useRef<Drag|null>(null),pinch=useRef<Pinch|null>(null),suppressClick=useRef(false);
 const [box,setBox]=useState<Box>({width:0,height:0}),[camera,setCamera]=useState<CityMapFocus>(initialFocus||HOME),[moving,setMoving]=useState(false),[used,setUsed]=useState(false),[loadedArt,setLoadedArt]=useState('');
 const instructions=useId(),home=useRef(initialFocus||HOME);
 home.current=initialFocus||HOME;
 const moveCamera=useCallback((next:CityMapFocus)=>{const safe=constrain(next,boxRef.current);cameraRef.current=safe;setCamera(safe);},[]);
 const markUsed=useCallback(()=>setUsed(true),[]);
 const zoomAt=useCallback((client:Point,nextZoom:number)=>{
  const rect=viewport.current?.getBoundingClientRect(),size=boxRef.current,current=cameraRef.current;
  if(!rect||!size.width)return;
  const world=worldSize(size),point={x:client.x-rect.left,y:client.y-rect.top},zoom=clamp(nextZoom,1,3);
  const worldX=current.x/100*world.width+(point.x-size.width/2)/current.zoom,worldY=current.y/100*world.height+(point.y-size.height/2)/current.zoom;
  moveCamera({x:(worldX-(point.x-size.width/2)/zoom)/world.width*100,y:(worldY-(point.y-size.height/2)/zoom)/world.height*100,zoom});
 },[moveCamera]);
 const zoomCentre=useCallback((factor:number)=>{const rect=viewport.current?.getBoundingClientRect();if(rect){markUsed();zoomAt({x:rect.left+rect.width/2,y:rect.top+rect.height/2},cameraRef.current.zoom*factor);}},[markUsed,zoomAt]);
 const panBy=useCallback((x:number,y:number)=>{const world=worldSize(boxRef.current),current=cameraRef.current;if(!world.width)return;moveCamera({x:current.x-x/(world.width*current.zoom)*100,y:current.y-y/(world.height*current.zoom)*100,zoom:current.zoom});},[moveCamera]);
 const reset=useCallback(()=>{moveCamera(home.current);markUsed();},[markUsed,moveCamera]);

 useEffect(()=>{
  const element=viewport.current;if(!element)return;
  const measure=()=>{const rect=element.getBoundingClientRect(),next={width:rect.width,height:rect.height};boxRef.current=next;setBox(next);moveCamera(cameraRef.current);};
  measure();const observer=new ResizeObserver(measure);observer.observe(element);return ()=>observer.disconnect();
 },[moveCamera]);
 useEffect(()=>{pointers.current.clear();drag.current=null;pinch.current=null;suppressClick.current=false;setMoving(false);moveCamera(home.current);},[sceneKey,moveCamera]);
 useEffect(()=>{
  const element=viewport.current;if(!element)return;
  const wheel=(event:WheelEvent)=>{if(event.target instanceof Element&&event.target.closest('[data-city-map-control]'))return;event.preventDefault();markUsed();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?boxRef.current.height:1);zoomAt({x:event.clientX,y:event.clientY},cameraRef.current.zoom*Math.exp(-clamp(delta,-300,300)*.0018));};
  element.addEventListener('wheel',wheel,{passive:false});return ()=>element.removeEventListener('wheel',wheel);
 },[markUsed,zoomAt]);
 const finishPointer=useCallback((pointerId:number)=>{
  pointers.current.delete(pointerId);
  if(pointers.current.size<2)pinch.current=null;
  const remaining=Array.from(pointers.current.entries())[0];
  drag.current=remaining?{id:remaining[0],origin:remaining[1],last:remaining[1],active:suppressClick.current}:null;
  if(!remaining)setMoving(false);
 },[]);
 useEffect(()=>{const finish=(event:globalThis.PointerEvent)=>finishPointer(event.pointerId);window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);return ()=>{window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);};},[finishPointer]);

 const startPointer=(event:PointerEvent<HTMLDivElement>)=>{
  if((event.pointerType==='mouse'&&event.button!==0)||(event.target instanceof Element&&event.target.closest('[data-city-map-control]')))return;
  const point={x:event.clientX,y:event.clientY};
  if(!pointers.current.size)suppressClick.current=false;
  pointers.current.set(event.pointerId,point);
  if(pointers.current.size===1){drag.current={id:event.pointerId,origin:point,last:point,active:false};return;}
  const [a,b]=Array.from(pointers.current.values()),rect=viewport.current?.getBoundingClientRect(),size=boxRef.current,world=worldSize(size),current=cameraRef.current;
  if(!rect)return;
  const middle={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top};
  pinch.current={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:current.zoom,world:{x:current.x/100*world.width+(middle.x-size.width/2)/current.zoom,y:current.y/100*world.height+(middle.y-size.height/2)/current.zoom}};
  suppressClick.current=true;setMoving(true);markUsed();
  try{event.currentTarget.setPointerCapture(event.pointerId);}catch{/* A released pointer needs no capture. */}
 };
 const movePointer=(event:PointerEvent<HTMLDivElement>)=>{
  if(!pointers.current.has(event.pointerId))return;
  if(event.pointerType==='mouse'&&event.buttons===0){finishPointer(event.pointerId);return;}
  const point={x:event.clientX,y:event.clientY};pointers.current.set(event.pointerId,point);
  if(pointers.current.size>1&&pinch.current){
   const [a,b]=Array.from(pointers.current.values()),rect=viewport.current?.getBoundingClientRect(),size=boxRef.current,world=worldSize(size),gesture=pinch.current;if(!rect)return;
   const middle={x:(a.x+b.x)/2-rect.left,y:(a.y+b.y)/2-rect.top},zoom=clamp(gesture.zoom*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance,1,3);
   moveCamera({x:(gesture.world.x-(middle.x-size.width/2)/zoom)/world.width*100,y:(gesture.world.y-(middle.y-size.height/2)/zoom)/world.height*100,zoom});
   if(event.cancelable)event.preventDefault();return;
  }
  const gesture=drag.current;if(!gesture||gesture.id!==event.pointerId)return;
  if(!gesture.active&&Math.hypot(point.x-gesture.origin.x,point.y-gesture.origin.y)<6)return;
  if(!gesture.active){gesture.active=true;suppressClick.current=true;setMoving(true);markUsed();try{event.currentTarget.setPointerCapture(event.pointerId);}catch{/* The pointer may already have ended. */}}
  panBy(point.x-gesture.last.x,point.y-gesture.last.y);gesture.last=point;
  if(event.cancelable)event.preventDefault();
 };
 const onKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
  if(event.ctrlKey||event.metaKey||event.altKey||(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable="true"],[data-city-map-control]')))return;
  const step=event.shiftKey?150:60;
  if(event.key==='+'||event.key==='=')zoomCentre(1.25);
  else if(event.key==='-'||event.key==='_')zoomCentre(.8);
  else if(event.key==='0'||event.key==='Home')reset();
  else if(event.key==='ArrowRight'){markUsed();panBy(-step,0);}
  else if(event.key==='ArrowLeft'){markUsed();panBy(step,0);}
  else if(event.key==='ArrowDown'){markUsed();panBy(0,-step);}
  else if(event.key==='ArrowUp'){markUsed();panBy(0,step);}
  else return;
  event.preventDefault();
 };
 const world=worldSize(box),style={width:world.width||'100%',height:world.height||'100%',transform:`translate3d(${box.width/2-camera.x/100*world.width*camera.zoom}px,${box.height/2-camera.y/100*world.height*camera.zoom}px,0) scale(${camera.zoom})`} as CSSProperties;
 return <div ref={viewport} className={`city-map-viewport ${moving?'is-moving':''} ${used?'has-explored':''} ${paused?'is-paused':''} ${loadedArt===art?'is-loaded':''} ${className}`} role="region" aria-label={label} aria-describedby={instructions} tabIndex={0} onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={event=>finishPointer(event.pointerId)} onPointerCancel={event=>finishPointer(event.pointerId)} onKeyDown={onKeyDown} onClickCapture={event=>{if(event.target instanceof Element&&event.target.closest('[data-city-map-control]'))return;if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}} onClick={event=>{if(!interactive(event.target))onMapClick?.();}}>
  <p id={instructions} className="city-map-sr-only">Drag to explore the city. Scroll or pinch to zoom. With the map focused, use arrow keys to pan, plus and minus to zoom, and zero to reset. Select a building to visit.</p>
  <div className="city-map-world" style={style}>
   <img className="city-map-world-art" src={art} alt="" draggable={false} decoding="async" fetchPriority="high" onLoad={()=>setLoadedArt(art)}/>
   <div className="city-map-world-content">{children}</div>
  </div>
  <div className="city-map-explore-hint" aria-hidden="true"><span>DRAG TO EXPLORE</span><i>·</i><span>SCROLL TO ZOOM</span></div>
  <div className="city-map-controls" role="group" aria-label="Map navigation" data-city-map-control>
   <button type="button" onClick={()=>zoomCentre(1.25)} disabled={camera.zoom>=2.999} aria-label="Zoom in" title="Zoom in (+)"><Plus size={25} strokeWidth={2.5}/></button>
   <button type="button" onClick={()=>zoomCentre(.8)} disabled={camera.zoom<=1.001} aria-label="Zoom out" title="Zoom out (−)"><Minus size={25} strokeWidth={2.5}/></button>
   <button type="button" className="city-map-reset" onClick={reset} aria-label="Reset city map" title="Reset map (0)"><Scan size={19} strokeWidth={2}/></button>
   <span className="city-map-zoom-readout" aria-hidden="true">{Math.round(camera.zoom*100)}%</span>
  </div>
 </div>;
}
