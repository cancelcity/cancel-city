'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,Copy,Download,ImageIcon,RotateCcw,Share2} from 'lucide-react';
import type {FirstClashResult} from '../domain/first-clash';
import {createClashVerdictFile,downloadClashVerdict} from '../services/clash-export';
import {clashChallengeUrl} from '../services/clash-export-text';

type ExportState={key:string;status:'ready';file:File;preview:string;challenge:string;canShare:boolean}|{key:string;status:'error';message:string;challenge?:string};
function supportsFileShare(file:File){try{return typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]});}catch{return false;}}

export function ClashShare({result,challengeUrl}:{result:FirstClashResult;challengeUrl?:string}){
 const serialized=JSON.stringify(result),key=`${serialized}|${challengeUrl||''}`;
 const [asset,setAsset]=useState<ExportState|null>(null),[retry,setRetry]=useState(0),[operation,setOperation]=useState(false),[notice,setNotice]=useState<{key:string;text:string;fallback?:boolean}|null>(null),[copied,setCopied]=useState(false),[manualCopy,setManualCopy]=useState(false);
 const linkInput=useRef<HTMLInputElement>(null),current=asset?.key===key?asset:null,ready=current?.status==='ready'?current:null;
 const challenge=ready?.challenge||(current?.status==='error'?current.challenge:undefined);
 useEffect(()=>{
  let disposed=false,preview='';
  const prepare=async()=>{
   let challenge:string|undefined;
   try{
    const data=JSON.parse(serialized) as FirstClashResult;
    challenge=clashChallengeUrl(data.seed,challengeUrl||window.location.origin);
    const file=await createClashVerdictFile(data,challenge);
    if(disposed)return;
    preview=URL.createObjectURL(file);
    setAsset({key,status:'ready',file,preview,challenge,canShare:supportsFileShare(file)});
   }catch(error){if(!disposed)setAsset({key,status:'error',challenge,message:error instanceof Error?error.message:'The image could not be prepared. Try again.'});}
  };
  void prepare();
  return()=>{disposed=true;if(preview)URL.revokeObjectURL(preview);};
 },[serialized,challengeUrl,key,retry]);
 const download=()=>{if(!ready)return;downloadClashVerdict(ready.file);setNotice({key,text:'Verdict PNG downloaded. Add it to your post or message.'});};
 const share=async()=>{
  if(!ready||operation)return;
  if(!ready.canShare){download();return;}
  setOperation(true);
  try{
   await navigator.share({files:[ready.file],title:`Cancel City · ${result.verdict}`,text:`${result.verdict}. Think you have a better reply? ${ready.challenge}`});
   setNotice({key,text:'Verdict shared.'});
  }catch(error){setNotice({key,text:error instanceof Error&&error.name==='AbortError'?'Share cancelled. Your verdict is ready whenever you want.':'Sharing did not open. Download the PNG instead.',fallback:!(error instanceof Error&&error.name==='AbortError')});}
  finally{setOperation(false);}
 };
 const copy=async()=>{
  if(!challenge)return;
  try{await navigator.clipboard.writeText(challenge);setCopied(true);setManualCopy(false);setNotice({key,text:'Challenge link copied. They get the same opponent and setup, then choose their own reply.'});}
  catch{setManualCopy(true);setNotice({key,text:'Automatic copy is unavailable. Select and copy the challenge link below.'});}
 };
 return <section className="clash-share" aria-label="Share your clash verdict"><div className="clash-share-heading"><ImageIcon size={17}/><div><b>MAKE THEM ANSWER.</b><p>Your verdict as an image. Your friend gets the same clash.</p></div></div><div className="clash-share-actions"><button type="button" className="button magenta" disabled={!ready||operation} onClick={()=>void share()}>{ready?.canShare?<Share2 size={18}/>:<Download size={18}/>}<span>{operation?'OPENING SHARE…':!current?'PREPARING IMAGE…':current.status==='error'?'IMAGE UNAVAILABLE':ready?.canShare?'SHARE VERDICT':'DOWNLOAD VERDICT PNG'}</span></button><button type="button" className="button paper" disabled={!challenge||operation} onClick={()=>void copy()}>{copied?<Check size={18}/>:<Copy size={18}/>}COPY CHALLENGE LINK</button></div>{current?.status==='error'&&<div className="clash-share-error" role="alert"><span>{current.message}</span><button type="button" className="text-link" onClick={()=>{setAsset(null);setRetry(value=>value+1);}}><RotateCcw size={14}/>PREPARE AGAIN</button></div>}{notice?.key===key&&<p className="clash-share-status" role="status">{notice.text}{notice.fallback&&ready&&<button type="button" className="text-link" onClick={download}>DOWNLOAD PNG</button>}</p>}{manualCopy&&challenge&&<label className="clash-challenge-manual">CHALLENGE LINK<input ref={linkInput} value={challenge} readOnly onFocus={event=>event.currentTarget.select()} aria-label="Challenge link to select and copy"/><button type="button" className="text-link" onClick={()=>{linkInput.current?.focus();linkInput.current?.select();}}>SELECT LINK</button></label>}{ready&&<details className="clash-share-preview"><summary>PREVIEW VERDICT IMAGE · PNG</summary><img src={ready.preview} width={1080} height={1350} alt={`Cancel City verdict: ${result.verdict}. ${result.reply}`}/></details>}</section>;
}
