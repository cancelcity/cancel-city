'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {usePresence} from 'motion/react';
import {X} from 'lucide-react';
import {useCityMotion} from './city-motion';
export function Dialog({title,children,onClose,wide=false}:{title:string;children:React.ReactNode;onClose:()=>void;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),id=useId(),reduced=useCityMotion(),[present,safeToRemove]=usePresence(),[closing,setClosing]=useState(false);
 useEffect(()=>{const el=ref.current;if(el&&!el.open)el.showModal();return()=>{if(el?.open)el.close();};},[]);
 useEffect(()=>{
  if(present&&!closing)return;
  if(!present&&!ref.current?.open){safeToRemove?.();return;}
  const timer=setTimeout(()=>{ref.current?.close();if(!present)safeToRemove?.();else onClose();},reduced?0:180);
  return()=>clearTimeout(timer);
 },[present,closing,reduced,safeToRemove,onClose]);
 const close=()=>setClosing(true);
 return <dialog ref={ref} className={`game-dialog ${wide?'wide':''}`} data-exiting={!present||closing} aria-labelledby={id} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===ref.current)close();}}><div className="dialog-inner"><div className="dialog-head"><h2 id={id}>{title}</h2><button onClick={close} className="icon-button" aria-label="Close dialog"><X size={22}/></button></div>{children}</div></dialog>;
}
